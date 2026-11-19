// Et nyt spil i samme proces/fane arver intet fra spillet før (modulernes tilstand uden for GameState – src/game/carry.ts): spil B bygget efter
// et andet spil A (anden klub og frø, et par spillede dage) spiller bit for bit som B bygget først i processen. Fundet 19/11: transfers.ts'
// roleIndex/rankCache og scouting.ts' levelCache (nøglet på datoen, ikke på spillet) gav refreshShortlists i createGame et andet udfald.
// Den originale database i ægte tilstand; længere forløb: scripts/leak-check.ts.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { rng } from '../src/game/rng';
import { captureCarry } from '../src/game/carry';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const byName = (n: string) => world.clubs.find((c) => c[1] === n)![0];
const build = (club: string, seed: number) => {
  createGame(world, { managerName: 'T', managerNation: eng, clubId: byName(club), activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
  gs().options.engine = 'original';
};
const step = () => { if (gs().pendingFixture) quickPlayUserMatch(); else continueGame(); };
const fp = () => `${createHash('sha1').update(JSON.stringify({ ...gs(), id: 0, rng: 0 })).update(JSON.stringify(captureCarry())).digest('hex')}:${rng.state}`;
const STEPS = 7;
const run = () => { build('Wrexham', 1); const out = [fp()]; for (let i = 0; i < STEPS; i++) { step(); out.push(fp()); } return out; };

describe('nyt spil i samme proces = nyt spil i en ren proces', () => {
  it('B efter A spiller som B først', () => {
    const ref = run();
    build('Arsenal', 7);
    for (let i = 0; i < 3; i++) step();
    const again = run();
    for (let i = 0; i <= STEPS; i++) expect(again[i], `skridt ${i}`).toBe(ref[i]);
  }, 900_000);
});
