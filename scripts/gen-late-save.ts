// Laver et gemt spil sent i spillet (Man Utd, original database) til ydelsesmåling i browseren (scripts/perf-menus.mjs LOAD=fil)
//   npx tsx scripts/gen-late-save.ts <ud-fil> [slutdato = 2002-10-01]
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { rng } from '../src/game/rng';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { serializeState } from '../src/game/snapshot';

const out = process.argv[2], until = process.argv[3] ?? '2002-10-01';
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Perf Tester', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
gs().options.engine = 'original';
while (gs().date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
const g = gs();
g.rng = rng.state;
writeFileSync(out, Buffer.from(await (await serializeState(g)).arrayBuffer()));
console.log('gemt', g.date, 'nyheder', g.news.length);
