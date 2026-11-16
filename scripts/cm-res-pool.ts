// Måling: hvor mange klubber spiller originalens baggrundskampe (0x84b940/0x84be20) – puljen, grupperne og kampe pr. dag.
// npx tsx scripts/cm-res-pool.ts [dage]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { cmResPool } from '../src/game/cmReserves';

const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[2] === 'Man Utd')![0];
createGame(world, { managerName: 'T', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const pool = cmResPool(g);
console.log('klubber', Object.keys(g.clubs).length, 'pulje', pool.length);
const days = +(process.argv[2] ?? 0);
const t0 = Date.now();
let n0 = g.cmRes?.played ?? 0;
for (let i = 0; i < days; i++) {
  const a = Date.now();
  const d0 = g.date;
  while (g.date === d0) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
  const n = g.cmRes?.played ?? 0;
  console.log(g.date, 'kampe', n - n0, 'ms', Date.now() - a, 'grupper', g.cmRes?.groups.length);
  n0 = n;
}
if (days) console.log('i alt ms', Date.now() - t0);
