// Følger en spillers CA/værdi dag for dag (fejlsøgning af værdifald): npx tsx scripts/watch-ca.ts Haaland 2
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
const name = process.argv[2] ?? 'Haaland';
const seasons = Number(process.argv[3] ?? 2);
const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'E', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Brøndby IF')![0], activeNations: [eng], lang: 'da', masking: true, seed: 3 });
const g = gs();
const p = Object.values(g.players).find((x) => x.last === name)!;
let last = p.ca;
const end = g.season + seasons;
let days = 0;
while (g.season < end && days++ < 420 * seasons) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (Math.abs(p.ca - last) > 1.5 || g.date.endsWith('-01')) { console.log(g.date, 'CA', p.ca.toFixed(1), 'værdi', (p.value / 1e6).toFixed(0), 'm', 'skade', JSON.stringify(p.injury ?? null).slice(0, 80)); last = p.ca; }
}
