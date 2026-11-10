// Spillerudviklingen mod originalen: ét år (31/8-01 → 31/8-02) med den originale database, samme tabel som målingen i
// ejerens CM 01/02 (to gemte spil, se docs/ENGINE.md "Udvikling"). Kør: DEV_JSON='{"decline":2}' npx tsx scripts/dev-cal.ts [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { DEV } from '../src/game/training';

if (process.env.DEV_JSON) Object.assign(DEV, JSON.parse(process.env.DEV_JSON));
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'D', managerNation: eng, clubId: world.clubs.find((c) => c[3] === eng)![0], activeNations: [eng], lang: 'en', masking: true, seed: Number(process.argv[2] ?? 11), mode: 'authentic' });
const g = gs();
const run = (to: string) => { let d = 0; while (g.date < to && d++ < 500) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); } };
type Snap = Map<number, { yob: number; ca: number; pa: number }>;
const snap = (): Snap => new Map(Object.values(g.players).map((p) => [p.id, { yob: Number(p.dob.slice(0, 4)), ca: Math.round(p.ca), pa: p.pa }]));
run('2001-08-31'); const A = snap(); run('2002-08-31'); const B = snap();
const count = (s: Snap, lo: number) => [...s.values()].filter((v) => v.ca >= lo).length;
const q = (xs: number[], f: number) => xs[Math.min(xs.length - 1, Math.floor(xs.length * f))];
// originalen (CLAUDE DEV A/B, 3.9.60): median (p10, p90)
const ORIG: Record<string, string> = { '<=18': '+7 (-10, 25)', '19-20': '+2.5 (-10, 21)', '21-23': '+2 (-8, 15)', '24-28': '0 (-7, 9)', '29-31': '-3 (-10, 5)', '32+': '-9 (-20, -2)' };
const bands: [string, number, number][] = [['<=18', 0, 18], ['19-20', 19, 20], ['21-23', 21, 23], ['24-28', 24, 28], ['29-31', 29, 31], ['32+', 32, 99]];
console.log(`CA150+ ${count(A, 150)} → ${count(B, 150)} (orig 495 → 495) · CA130+ ${count(A, 130)} → ${count(B, 130)} (orig 3115 → 3115) · CA100+ ${count(A, 100)} → ${count(B, 100)} (orig 9399 → 9393)`);
for (const [k, lo, hi] of bands) {
  const xs = [...A].filter(([id, a]) => B.has(id) && a.ca >= 100 && 2001 - a.yob >= lo && 2001 - a.yob <= hi).map(([id, a]) => B.get(id)!.ca - a.ca).sort((x, y) => x - y);
  console.log(`${k.padEnd(6)} n ${String(xs.length).padStart(5)}  ${q(xs, 0.5)} (${q(xs, 0.1)}, ${q(xs, 0.9)})   orig ${ORIG[k]}`);
}
const yg = [...A].filter(([id, a]) => B.has(id) && 2001 - a.yob <= 20 && a.pa >= 150).map(([id, a]) => B.get(id)!.ca - a.ca).sort((x, y) => x - y);
console.log(`unge PA150+ n ${yg.length} median ${q(yg, 0.5)} (orig +20)`);
// ændringen efter afstanden til PA (originalen ≤31 år: 0 → −15, 1-5 → −10, 6-10 → −5, 11-20 → 0, 21-40 → +5…8, 41+ → +5…19; 32+: −5…−9)
const gaps: [number, number][] = [[0, 0], [1, 5], [6, 10], [11, 20], [21, 40], [41, 200]];
for (const [lo, hi] of [[15, 18], [19, 20], [21, 23], [24, 28], [29, 31], [32, 45]]) {
  let line = `age ${lo}-${hi}:`;
  for (const [glo, ghi] of gaps) {
    const xs = [...A].filter(([id, a]) => B.has(id) && a.ca >= 60 && a.pa - a.ca >= glo && a.pa - a.ca <= ghi && 2001 - a.yob >= lo && 2001 - a.yob <= hi).map(([id, a]) => B.get(id)!.ca - a.ca).sort((x, y) => x - y);
    line += `  gap${glo}-${ghi}: ${xs.length ? q(xs, 0.5) : '-'}/${xs.length}`;
  }
  console.log(line);
}
