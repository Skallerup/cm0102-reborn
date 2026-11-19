// Modulhukommelse, der lækker fra ét spil til det næste i samme proces: byg spil A (anden klub/frø, spil nogle dage), dernæst spil B,
// og sammenlign B skridt for skridt med B bygget i en ren proces. Brug: npx tsx scripts/leak-check.ts [ren|a] [skridt=7] [A-skridt=3]
// ren: kun B; a: A først (A_CLUB, A_SEED). Udskriver én linje pr. skridt: <skridt> <hash> <rng> <dato>.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGame, setNewGameProgress, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, hasGame } from '../src/game/state';
import { rng } from '../src/game/rng';
import { captureCarry } from '../src/game/carry';

const [mode = 'ren', daysS = '7', aDaysS = '3'] = process.argv.slice(2);
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const byName = (n: string) => world.clubs.find((c) => c[1] === n)![0];
const build = (club: string, seed: number) => {
  createGame(world, { managerName: 'T', managerNation: eng, clubId: byName(club), activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
  gs().options.engine = 'original';
};
const step = () => { if (gs().pendingFixture) { quickPlayUserMatch(); return; } continueGame(); };
const fp = () => {
  const g = gs();
  return createHash('sha1').update(JSON.stringify({ ...g, id: 0 })).update(JSON.stringify(captureCarry())).digest('hex').slice(0, 12);
};
if (mode === 'a') { build(process.env.A_CLUB ?? 'Arsenal', Number(process.env.A_SEED ?? 7)); for (let i = 0; i < Number(aDaysS); i++) step(); }
setNewGameProgress((st, f) => { if (hasGame()) console.log(`P ${st} ${f} ${fp()} ${rng.state}`); });
build('Wrexham', 1);
setNewGameProgress(null);
console.log(`0 ${fp()} ${rng.state}`);
for (let i = 1; i <= Number(daysS); i++) { step(); console.log(`${i} ${fp()} ${rng.state} ${gs().date}`); }
