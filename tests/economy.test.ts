// Prisniveau: den originale 01/02-database spilles i 2001-priser (originalens værdikurve, faste beløb skaleret pr.
// liga), standarddatabasen i nutidens priser.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { econ } from '../src/game/econ';

const start = (file: string) => {
  const world = JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'da', masking: true, seed: 2 });
  return gs();
};

describe('prisniveau', () => {
  it('original database: Zidane koster omkring £30 mio. (originalens database: £30 mio.)', () => {
    const g = start('world-original.json');
    const zid = Object.values(g.players).find((p) => p.last === 'Zidane')!;
    const gbp = zid.value * 0.86;
    expect(gbp).toBeGreaterThan(20e6);
    expect(gbp).toBeLessThan(45e6);
    expect(g.econ).toBeDefined();
    expect(econ()).toBeGreaterThan(0.2);
    expect(econ()).toBeLessThan(0.9);
  });
  it('standarddatabasen: nutidens priser (ingen skalering)', () => {
    const g = start('world.json');
    expect(g.econ).toBeUndefined();
    expect(econ()).toBe(1);
    const top = Object.values(g.players).sort((a, b) => b.value - a.value)[0];
    expect(top.value).toBeGreaterThan(100e6);
  });
});
