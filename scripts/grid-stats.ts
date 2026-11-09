// Gittermotoren (src/game/engine/grid) – en hel Premier League-sæson (380 kampe) med 3.9.60-trupperne, mod originalens tal.
// Kør: npx tsx scripts/grid-stats.ts [kampe=380] [frø=1]   (GRID_JSON='{"passK":150}' overstyrer krogene i GRID_UNKNOWN)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import { GRID_DEBUG, GRID_UNKNOWN, randOf, runGridMatch, type GridSideStats } from '../src/game/engine/grid/gridMatch';
import type { Player } from '../src/game/types';

const N = Number(process.argv[2] ?? 380);
const seed = Number(process.argv[3] ?? 1);
if (process.env.GRID_JSON) Object.assign(GRID_UNKNOWN, JSON.parse(process.env.GRID_JSON));
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
const fixtures: [number, number][] = [];
for (const h of epl.clubs) for (const a of epl.clubs) if (h !== a) fixtures.push([h, a]);
const rng = new Rng(seed);
const rand = randOf(() => rng.next());
const sum: Record<string, number> = {};
let hw = 0, dr = 0, aw = 0, ticks = 0;
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const [h, a] = fixtures[i % fixtures.length];
  const r = runGridMatch({ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) }, rand);
  for (const s of [r.home, r.away]) for (const k of Object.keys(s) as (keyof GridSideStats)[]) sum[k] = (sum[k] ?? 0) + s[k];
  if (r.home.goals > r.away.goals) hw++; else if (r.home.goals === r.away.goals) dr++; else aw++;
  ticks += r.ticks;
}
const pm = (k: string) => ((sum[k] ?? 0) / N).toFixed(2);
const pct = (x: number) => `${Math.round((100 * x) / N)}`;
console.log(`${N} kampe på ${((Date.now() - t0) / 1000).toFixed(0)} s, tik i snit ${(ticks / N).toFixed(0)}`);
console.log(`mål ${pm('goals')} (2,87) · H/U/B ${pct(hw)}/${pct(dr)}/${pct(aw)} (51/23/26) · skud ${pm('shots')} (17,2) · på mål ${pm('onTarget')} (10,3)`);
console.log(`hjørner ${pm('corners')} (5,0) · frispark ${pm('fouls')} (~16) · offside ${pm('offsides')} (7,4) · gule ${pm('yellows')}/røde ${pm('reds')} (1,70/0,14) · afleveringer ${pm('passes')}, rigtige ${(100 * (sum.passesCompleted ?? 0) / Math.max(1, sum.passes ?? 1)).toFixed(0)} % (72 %)`);
if (process.env.DEBUG) console.log(Object.entries(GRID_DEBUG).sort().map(([k, v]) => `${k} ${(v / N).toFixed(1)}`).join(' · '));
