// Gamle gemte spil i udvidet tilstand åbnes, som de blev gemt (ejeren 14/11): tilstanden stilles ikke om til ægte,
// og det moderne udseende er slået til for netop det spil – nye spil er stadig kun originale.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, setGame } from '../src/game/state';
import { upgradeLoaded } from '../src/game/save';
import { modernOn } from '../src/ui/modernFlag';

describe('gemte spil beholder deres tilstand', () => {
  const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
  const club = world.clubs[0][0];
  it('et udvidet spil forbliver udvidet og åbner det moderne udseende; et nyt ægte spil gør ikke', () => {
    createGame(world, { managerName: 'T', managerNation: 0, clubId: club, activeNations: [world.clubs[0][3] as number], lang: 'en', masking: true, seed: 1, mode: 'extended' });
    const g = gs();
    setGame(null);
    expect(modernOn()).toBe(false);
    setGame(g); upgradeLoaded();
    expect(gs().options.mode).toBe('extended');
    expect(modernOn()).toBe(true);
    createGame(world, { managerName: 'T', managerNation: 0, clubId: club, activeNations: [world.clubs[0][3] as number], lang: 'en', masking: true, seed: 2, mode: 'authentic' });
    expect(modernOn()).toBe(false);
  }, 300_000);
});
