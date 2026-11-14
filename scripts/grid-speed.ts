// Hastigheden (runde 8): en Premier League-sæson (380 kampe, 3.9.60, ægte tilstand) på gittermotoren (originalens kampmotor, med spillets
// inddata – gameInputs.ts) mod zonemotoren (MatchSim med ORIGINAL-profilen) – samme trupper og taktikker. Kør gerne bundtet for et retvisende tal:
//   npx esbuild scripts/grid-speed.ts --bundle --platform=node --format=esm --outfile=/tmp/gs.mjs --define:import.meta.env='{}' && node /tmp/gs.mjs [kampe]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic, ORIGINAL } from '../src/game/sim';
import { quickMatch } from '../src/game/engine/match';
import { randOfRng, runGridMatch } from '../src/game/engine/grid/gridMatch';
import { gameInputsCtx } from '../src/game/engine/grid/gameInputs';
import type { Player } from '../src/game/types';

const N = Number(process.argv[2] ?? 380);
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
const fixtures: [number, number][] = [];
for (const h of epl.clubs) for (const a of epl.clubs) if (h !== a) fixtures.push([h, a]);
const tac = fixtures.map(([h, a]) => [aiTactic(h, a, true), aiTactic(a, h, false)]);
const sq = new Map(epl.clubs.map((c) => [c, fresh(c)]));
const time = (name: string, fn: (i: number) => void) => {
  const t0 = performance.now();
  for (let i = 0; i < N; i++) fn(i % fixtures.length);
  const ms = performance.now() - t0;
  console.log(`${name.padEnd(12)} ${N} kampe ${(ms / 1000).toFixed(1)} s · ${(ms / N).toFixed(1)} ms pr. kamp`);
  return ms / N;
};
const rng = new Rng(1), rand = randOfRng(rng);   // som spillet (adapter.ts): mulberry32 skrevet ind i rand
const zone = time('zonemotoren', (i) => {
  const [h, a] = fixtures[i];
  quickMatch({ club: h, tactic: tac[i][0], players: new Map(sq.get(h)!.map((p) => [p.id, p])) }, { club: a, tactic: tac[i][1], players: new Map(sq.get(a)!.map((p) => [p.id, p])) },
    { ...ORIGINAL, subs: 3, fixtureId: undefined, date: g.date } as never, rng);
});
const grid = time('gittermotoren', (i) => {
  const [h, a] = fixtures[i];
  runGridMatch({ players: sq.get(h)!, tactic: tac[i][0] }, { players: sq.get(a)!, tactic: tac[i][1] }, rand, { ...gameInputsCtx(h, a, { compId: epl.id, human: [false, false] }) });
});
console.log(`gittermotoren / zonemotoren: ×${(grid / zone).toFixed(1)}`);
