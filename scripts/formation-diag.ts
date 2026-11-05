// Diagnose: hvorfor vinder en formation? Sammenlign skud, xG og mål efter type for to formationer.
// Kør: npx tsx scripts/formation-diag.ts "4-4-2 Diamond" "4-4-2" [kampe]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { squadStrength } from '../src/game/board';
import { quickMatch } from '../src/game/engine/match';
import { Rng } from '../src/game/rng';
import { autoSelect, newTactic } from '../src/game/tactics';
import type { Player } from '../src/game/types';

const [FA, FB, NS] = [process.argv[2] ?? '4-4-2 Diamond', process.argv[3] ?? '4-4-2', process.argv[4] ?? '2000'];
const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const ni = (n: string) => world.nations.findIndex((x) => x.name === n);
createGame(world, { managerName: 'Lab', managerNation: ni('England'), clubId: world.clubs[0][0], activeNations: [ni('England')], lang: 'da', masking: true, seed: 5 });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const [H, O] = epl.clubs.slice().sort((a, b) => squadStrength(b) - squadStrength(a)).slice(9, 11);
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
const et = (id: number, f: string) => { const ps = fresh(id); return { club: id, tactic: autoSelect(newTactic(f), ps, false), players: new Map(ps.map((p) => [p.id, p])) }; };
const rng = new Rng(3);
const agg = [0, 1].map(() => ({ poss: 0, shots: 0, xg: 0, goals: 0, kinds: {} as Record<string, [number, number]>, zones: new Array(15).fill(0) }));
const N = Number(NS);
for (let i = 0; i < N; i++) {
  const swap = i % 2 === 1;
  const a = et(swap ? O : H, FA), b = et(swap ? H : O, FB);
  const r = quickMatch(i % 4 < 2 ? a : b, i % 4 < 2 ? b : a, { neutral: true }, rng);
  const ai = i % 4 < 2 ? 0 : 1;
  for (const side of [0, 1]) {
    const k = side === ai ? 0 : 1, st = r.stats[side];
    agg[k].poss += st.possession; agg[k].shots += st.shots; agg[k].xg += st.xg; agg[k].goals += st.goals;
    for (let z = 0; z < 15; z++) agg[k].zones[z] += r.heat[side][z];
  }
  for (const s of r.shots) { const k = s.t === ai ? 0 : 1; const e = (agg[k].kinds[s.kind] ??= [0, 0]); e[0]++; if (s.outcome === 'goal') e[1]++; }
}
for (const [k, f] of [[0, FA], [1, FB]] as const) {
  const a = agg[k];
  console.log(`${f.padEnd(14)} besiddelse ${(a.poss / N).toFixed(1)}% skud ${(a.shots / N).toFixed(1)} xG ${(a.xg / N).toFixed(2)} mål ${(a.goals / N).toFixed(2)}`);
  console.log('   skud/mål pr. kamp efter type:', Object.entries(a.kinds).sort((x, y) => y[1][1] - x[1][1]).map(([t, [s, gl]]) => `${t} ${(s / N).toFixed(2)}/${(gl / N).toFixed(2)}`).join(' · '));
}
