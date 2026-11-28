// Nedbrud aa97721d7bdd7bc0: indlæs et gemt spil (save.ts-format, .json.gz) og spil menneskets næste kampe live (createLiveMatch + step, som
// Match.tsx) – stakken ved nedbrud.   npx tsx scripts/repro-load-play.ts <gem.json.gz> [kampe=2]
import { readFileSync } from 'node:fs';
import { gs, setGame } from '../src/game/state';
import { continueGame, createLiveMatch, quickPlayUserMatch } from '../src/game/sim';
import { deserializeState } from '../src/game/snapshot';
import { upgradeLoaded, ensureAllNumbers, repairOldMarket, repairStaleOffers, repairFakePlayers } from '../src/game/save';
import { rng } from '../src/game/rng';

setGame(await deserializeState(new Blob([readFileSync(process.argv[2])]))); upgradeLoaded(); ensureAllNumbers();
repairOldMarket(); repairStaleOffers(); repairFakePlayers();
const g = gs();
if (g.rng !== undefined) rng.state = g.rng;
console.log('indlæst', g.date, g.clubs[g.userClub]?.name, 'db', g.dbKind, g.options.engine);
let left = Number(process.argv[3] ?? 2), days = 0;
while (left > 0 && days++ < 40) {
  const pend = g.pendingFixture !== undefined && g.pendingFixture !== null && g.fixtures[g.pendingFixture] && !g.fixtures[g.pendingFixture].result;
  const r = pend ? { match: g.pendingFixture } : continueGame();
  if (r.match === undefined) continue;
  const f = g.fixtures[g.pendingFixture!];
  console.log(`${g.date} ${g.clubs[f.home]?.name} - ${g.clubs[f.away]?.name} (${f.comp})`);
  const keep = rng.state;
  try {
    const sim = createLiveMatch(f, { playByPlay: true });
    let n = 0; while (sim.step() && n++ < 1e6) { /* */ }
    console.log('  live ok', n);
  } catch (e) { console.log('  NEDBRUD live', (e as Error).stack?.split('\n').slice(0, 8).join('\n')); process.exit(1); }
  rng.state = keep;
  quickPlayUserMatch();
  left--;
}
console.log('slut', g.date);
