// Kampkaraktererne: snit, målmænd, målscorere, indskiftere – og hvor ofte kampens bedst bedømte spiller scorede.
// Kør: npx tsx scripts/ratings-diag.ts [kampe] [world-fil]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { MatchSim } from '../src/game/engine/match';
import { Rng } from '../src/game/rng';
import { ORIGINAL, aiTactic } from '../src/game/sim';
import { cmDatabase } from '../src/game/newgame';
import type { Player } from '../src/game/types';

const N = Number(process.argv[2] ?? 1000);
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const ni = (n: string) => world.nations.findIndex((x) => x.name === n);
createGame(world, { managerName: 'Lab', managerNation: ni('England'), clubId: world.clubs[0][0], activeNations: [ni('England')], lang: 'da', masking: true, seed: 9 });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
const rng = new Rng(4);
const all: number[] = [], gk: number[] = [], scorers: number[] = [], subs: number[] = [], best: number[] = [];
let bestScored = 0, bestOnWinner = 0, tens = 0;
for (let i = 0; i < N; i++) {
  const h = rng.pick(epl.clubs), a = rng.pick(epl.clubs.filter((x) => x !== h));
  const mk = (id: number, opp: number, home: boolean) => { const ps = fresh(id); return { club: id, tactic: aiTactic(id, opp, home), players: new Map(ps.map((p) => [p.id, p])) }; };
  const sim = new MatchSim(mk(h, a, true), mk(a, h, false), { commentary: false, aiSubs: [true, true], importance: 0.5, ...(cmDatabase(g) === 'original' ? ORIGINAL : {}) }, rng);
  const r = sim.runToEnd();
  const lines = r.players.filter((l) => l.minutes >= 1);
  for (const l of lines) {
    all.push(l.rating);
    if (l.sub) subs.push(l.rating);
    if (l.goals > 0) scorers.push(l.rating);
    if (l.rating >= 9.95) tens++;
    const pl = g.players[l.id];
    if (pl && pl.pos[0] >= 15 && l.minutes >= 60) gk.push(l.rating);
  }
  // kampens spiller: motorens eget valg (r.mom)
  const top = lines.find((l) => l.id === r.mom) ?? lines.slice().sort((x, y) => y.rating - x.rating)[0];
  best.push(top.rating);
  if (top.goals > 0) bestScored++;
  const won = r.stats[0].goals > r.stats[1].goals ? 0 : r.stats[1].goals > r.stats[0].goals ? 1 : -1;
  if (won === top.team) bestOnWinner++;
}
const avg = (xs: number[]) => (xs.reduce((s, v) => s + v, 0) / Math.max(1, xs.length)).toFixed(2);
console.log(`${N} kampe · snit ${avg(all)} · målmænd ${avg(gk)} · målscorere ${avg(scorers)} · indskiftere ${avg(subs)} · kampens bedste ${avg(best)}`);
console.log(`kampens spiller scorede: ${((bestScored / N) * 100).toFixed(1)} % · var på vinderholdet: ${((bestOnWinner / N) * 100).toFixed(1)} % · 10'ere: ${((tens / all.length) * 100).toFixed(2)} %`);
