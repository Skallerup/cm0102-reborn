// Måler størrelsen på et gemt spil (gzip, som i IndexedDB) efter en måned. Kør: npx tsx scripts/save-size.ts <original|cm> [til-dato]
// original = 2001/02 (world-original.json), cm = 2026/27 (world.json + world-cm.json som world.ts). England, Man Utd, ægte tilstand.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const which = process.argv[2] ?? 'original';
const file = which === 'cm' ? 'public/data/world.json' : 'public/data/world-original.json';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData & { cmRaw?: unknown; kind?: string };
if (which === 'cm') { try { const x = JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw?: unknown }; if (x.cmRaw && !world.cmRaw) world.cmRaw = x.cmRaw; } catch { /* ældre commit uden filen */ } }
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === 'Manchester United')?.[0] ?? world.clubs.find((c) => c[3] === eng)![0];
createGame(world, { managerName: 'M', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 11, mode: 'authentic' });
const g = gs();
const start = g.date;
const stopAt = process.argv[3] ?? new Date(Date.parse(start) + 30 * 864e5).toISOString().slice(0, 10);
let n = 0;
while (g.date < stopAt && n++ < 400) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
const json = JSON.stringify(g);
const mb = (x: number) => (x / 1e6).toFixed(2);
console.log(`${which} ${start} -> ${g.date}: gemt spil ${mb(gzipSync(json).length)} MB gzip (${mb(json.length)} MB rå)`);
