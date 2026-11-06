// Tilfældigt potentiale som i CM 01/02: PA -2 i databasen = 150-200, -1 = 100-150, trukket på ny i hvert nyt spil.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

describe('tilfældigt potentiale (PA -1/-2)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const samba = (seed: number) => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs[0][0], activeNations: [eng], lang: 'da', masking: true, seed });
    return Object.values(gs().players).find((p) => p.first === 'Cherno' && p.last === 'Samba')!.pa;
  };
  it('Cherno Samba (PA -2) får 150-200 – forskelligt fra spil til spil', () => {
    const pas = [1, 2, 3, 4, 5].map(samba);
    for (const pa of pas) { expect(pa).toBeGreaterThanOrEqual(150); expect(pa).toBeLessThanOrEqual(200); }
    expect(new Set(pas).size).toBeGreaterThan(1);
  }, 30_000); // fem nye spil med den fulde originale database
});
