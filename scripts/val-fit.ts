// Værdikurven i standarddatabasen: databasens værdier (ved start) mod modellen valueFromCA pr. alder og CA – npx tsx scripts/val-fit.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { valueFromCA } from '../src/game/data/generate';
import { ageOn } from '../src/game/dates';
const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const nats = ['England', 'Spain', 'Germany', 'Italy', 'France', 'Holland', 'Portugal', 'Denmark'].map((n) => world.nations.findIndex((x) => x.name === n));
createGame(world, { managerName: 'E', managerNation: nats[0], clubId: world.clubs[0][0], activeNations: nats, lang: 'da', masking: true, seed: 3 });
const g = gs();
const med = (xs: number[]) => { const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const rows: Record<string, number[][]> = {};
for (const p of Object.values(g.players)) {
  if (!p.club) continue;
  const age = ageOn(p.dob, g.date);
  const ab = age <= 21 ? 'u21' : age <= 29 ? '22-29' : '30+';
  const k = ab + ' ' + Math.floor(p.ca / 10) * 10;
  (rows[k] ??= []).push([p.value, valueFromCA(p.ca, p.pa, age), age]);
}
for (const k of Object.keys(rows).sort()) {
  const r = rows[k];
  if (r.length < 8) continue;
  console.log(k.padEnd(10), String(r.length).padStart(5), 'medværdi', (med(r.map((x) => x[0])) / 1e6).toFixed(2), 'model', (med(r.map((x) => x[1])) / 1e6).toFixed(2), 'ratio', med(r.map((x) => x[0] / Math.max(1, x[1]))).toFixed(2));
}
