// Bevis for scripts/lib/snapshot.ts: fingeraftrykket af hele tilstanden ved D1 og D2 er bit for bit det samme fra bunden og fra snapshot.
//   SNAP=0 npx tsx scripts/snap-check.ts 2001-08-01 2001-09-15     (fra bunden)   ·   npx tsx scripts/snap-check.ts … (2. gang: fra snapshot)
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { defaultAdvance, fingerprint, fingerprintParts, loadOrCreate } from './lib/snapshot';

const [d1 = '2001-08-01', d2 = '2001-09-15'] = process.argv.slice(2);
const worldFile = process.env.WORLD ?? 'public/data/world-original.json';
const world = JSON.parse(readFileSync(worldFile, 'utf8')) as WorldData;
const t0 = Date.now();
const g = loadOrCreate({ world, worldFile, club: process.env.CLUB ?? 'Wrexham', date: d1 === 'none' ? undefined : d1, seed: 1, mode: 'authentic', engine: 'original' });
console.log(`D1 ${g.date} ${fingerprint(g)}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
const t1 = Date.now();
defaultAdvance(gs(), d2);
void continueGame; void quickPlayUserMatch;
console.log(`D2 ${gs().date} ${fingerprint(gs())}  (+${((Date.now() - t1) / 1000).toFixed(1)} s)`);
if (process.env.PARTS) console.log('PARTS ' + JSON.stringify(fingerprintParts(gs())));
if (process.env.DUMP) { const { writeFileSync } = await import('node:fs'); const g2 = gs(); writeFileSync(process.env.DUMP, JSON.stringify({ cmFin: g2.cmFin, clubs: g2.clubs, players: g2.players, date: g2.date })); }
