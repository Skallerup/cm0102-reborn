// Gittermotoren som kampspor i samme format som originalens match_trace.c (T-linjer) – til ~/cm0102-engine/tools/gk_stats.py m.fl.
// Kør: npx tsx scripts/grid-trace-port.ts [kampe=100] [frø=1] > fil   (GRID_JSON overstyrer GRID_UNKNOWN). Linjen skrives samme sted i tikket som originalens (ctx.onTop).
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import { GRID_UNKNOWN, createGridMatch, randOf, type GP, type GridMatchState } from '../src/game/engine/grid/gridMatch';
import type { Player } from '../src/game/types';

const N = Number(process.argv[2] ?? 100), seed = Number(process.argv[3] ?? 1);
if (process.env.GRID_JSON) Object.assign(GRID_UNKNOWN, JSON.parse(process.env.GRID_JSON));
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
const fixtures: [number, number][] = [];
for (const h of epl.clubs) for (const a of epl.clubs) if (h !== a) fixtures.push([h, a]);
const rand = randOf(((r) => () => r.next())(new Rng(seed)));
const out: string[] = [];
const flush = () => { process.stdout.write(out.join('\n') + '\n'); out.length = 0; };
for (let i = 0; i < N; i++) {
  const [h, a] = fixtures[i % fixtures.length];
  out.push(`M ${h} ${a} 7`);
  let t = 0;
  const line = (m: GridMatchState) => {
    const c = m.carrier as GP | null;
    const ps = m.gp.filter((p) => p.active).map((p) => `${p.side},${p.pslot ?? p.slot},${p.x},${p.y},${p.roll.offTheBall},${p.roll.positioning},${p.form},${p.action},${p.marks ? 1 : 0},${p.facing},${p.busy},${p.momentum}`);
    out.push(`T ${t++} ${m.ballX} ${m.ballY} ${m.ballH} ${m.poss} ${m.lineSide1} ${m.lineSide0} ${c ? (c.pslot ?? c.slot) + 100 * c.side : -1} S${m.state} ${ps.join(' ')}`);
  };
  // managerne og omdømmet som i grid-stats.ts (NO_MGR=1 slår dem fra)
  const mgr = (c: number) => { const st = g.staff[g.clubs[c]?.manager ?? -1]; return !process.env.NO_MGR && st?.tac ? { id: st.id, ca: st.rep * 2, tac: st.tac } : null; };
  const gm = createGridMatch({ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) }, rand,
    { onTop: line, onShot: (k, v) => out.push(k === "L" || k === "J" || k === "N" ? `${k} ${t} ${v.slice(0, -1).join(" ")} = ${v[v.length - 1]}` : k === "D" ? `D ${t} ${v[0].toString(16)} ${v.slice(1, 4).join(" ")} = ${v.slice(4).join(" ")}` : `${k} ${t} ${v.join(" ")}`), rep: [g.clubs[h].rep * 100, g.clubs[a].rep * 100], managers: [mgr(h), mgr(a)] });
  while (gm.tick()) { /* tik */ }
  if (out.length > 20000) flush();
}
flush();
