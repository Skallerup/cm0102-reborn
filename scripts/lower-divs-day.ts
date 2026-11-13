// Tid for Continue Game på de første lørdage med fuld runde i de fire engelske rækker (original database, ægte tilstand).
//   npx tsx scripts/lower-divs-day.ts [frø = 11] [klub = Man Utd]
// Måler hver dag fra 10/8 til 26/8-2001 (11/8 = Division 1–3, 18/8 = alle fire rækker) og tæller kampene pr. motor.
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, gridEngineOn, gridFixture, quickPlayUserMatch } from '../src/game/sim';

const seed = Number(process.argv[2] ?? 11), clubName = process.argv[3] ?? 'Man Utd';
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[1] === clubName || c[2] === clubName)![0];
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
while (g.date < '2001-08-10') { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
while (g.date < '2001-08-27') {
  const open = Object.values(g.fixtures).filter((f) => !f.result && f.date <= '2001-09-01');
  const t0 = performance.now();
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  const ms = performance.now() - t0;
  const day = g.date;
  const fx = open.filter((f) => f.result);
  const grid = fx.filter((f) => gridEngineOn(g) && gridFixture(f.home, f.away, f.id)).length;
  if (fx.length) console.log(`${day}: ${fx.length} kampe (${grid} gittermotoren, ${fx.length - grid} zonemotoren) · ${ms.toFixed(0)} ms`);
}
