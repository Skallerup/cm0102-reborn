// Hastigheden af originalens vejr (cmWeather.ts): nyt spil, 190 daglige opdateringer og weatherFor for alle kampe.
//   npx tsx scripts/cm-weather-bench.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmWxUpdate } from '../src/game/cmWeather';
import { weatherFor } from '../src/game/weather';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
let t0 = Date.now();
createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[2] === 'Man Utd')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
console.log('nyt spil', Date.now() - t0, 'ms');
const g = gs();
t0 = Date.now();
for (let d = 0; d < 190; d++) cmWxUpdate(g, g.cmWx!.d + 1);
console.log('190 opdateringer', Date.now() - t0, 'ms,', Object.keys(g.cmWx!.c).length, 'byer');
t0 = Date.now();
const fs = Object.values(g.fixtures);
for (const f of fs) weatherFor(f);
console.log('weatherFor ×', fs.length, Date.now() - t0, 'ms');
