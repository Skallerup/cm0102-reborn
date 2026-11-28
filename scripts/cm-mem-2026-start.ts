// 2026/27 i ægte tilstand: spillere og klubber i spillet ved start pr. klubbens land (England valgt) – mod originalens hukommelse efter
// 0x524d70/0x5267c0 (world-cm.json cmRaw.mem26) og oraklets gemte spil. NO_MEM26=1: uden trimmet (som før 28/11).
//   npx tsx scripts/cm-mem-2026-start.ts [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: { mem26?: unknown } };
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
if (process.env.NO_MEM26 && w.cmRaw) delete w.cmRaw.mem26;
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[2] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[3] ?? 1), mode: 'authentic' });
const g = gs();
const by = new Map<string, [number, number]>();
for (const c of Object.values(g.clubs)) { const k = g.nations[c.nation]?.name ?? '?'; const e = by.get(k) ?? [0, 0]; e[0]++; by.set(k, e); }
let free = 0;
for (const p of Object.values(g.players)) {
  if (!p.club) { free++; continue; }
  const k = g.nations[g.clubs[p.club]?.nation]?.name ?? '?'; const e = by.get(k) ?? [0, 0]; e[1]++; by.set(k, e);
}
console.log(`${g.date}: klubber ${Object.keys(g.clubs).length}, spillere ${Object.keys(g.players).length} (klubløse ${free})`);
for (const [n, [c, p]] of [...by].sort((a, b) => b[1][1] - a[1][1]).slice(0, 30)) console.log(`  ${n}: ${c} klubber, ${p} spillere`);
