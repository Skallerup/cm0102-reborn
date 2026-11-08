// Den originale database har sin egen 2001-økonomi: originalens lønninger, saldi og træningsanlæg fra databasen
// (staff.dat 78, club.dat 101/127) – målt mod ejerens CM 01/02 (3.9.60) – og den moderne database berøres ikke.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const load = (f: string) => JSON.parse(readFileSync(`public/data/${f}`, 'utf8')) as WorldData;
const start = (w: WorldData, club: string) => {
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === club)![0], activeNations: [eng], lang: 'da', masking: true, seed: 4 });
  return gs();
};
const eur = (gbp: number) => gbp / 0.86;

describe('originalens økonomi', () => {
  it('lønninger, saldo og træningsanlæg kommer fra originalens database', () => {
    const g = start(load('world-original.json'), 'Arsenal');
    const club = (n: string) => Object.values(g.clubs).find((c) => c.name === n)!;
    const pl = (first: string, last: string) => Object.values(g.players).find((p) => p.first === first && p.last === last)!;
    expect(pl('David', 'Beckham').contract!.wage).toBeCloseTo(eur(27_500), -2);
    expect(pl('Zinedine', 'Zidane').contract!.wage).toBeCloseTo(eur(74_000), -2);
    expect(pl('Michael', 'Owen').contract!.wage).toBeCloseTo(eur(30_000), -2);
    // saldoen: databasens beløb ±8 % (som i originalen); transferbudgettet ca. 70 % af saldoen i hele £250K
    const within = (v: number, gbp: number) => v * 0.86 >= gbp * 0.92 - 1 && v * 0.86 <= gbp * 1.08 + 1;
    expect(within(club('Arsenal').balance, 27_180_000)).toBe(true);
    expect(within(club('Real Madrid C.F.').balance, 100_000_000)).toBe(true);
    const tf = Math.round(club('Arsenal').transferBudget * 0.86);
    expect(tf % 250_000).toBe(0);
    expect(tf / (club('Arsenal').balance * 0.86)).toBeGreaterThan(0.65);
    expect(tf / (club('Arsenal').balance * 0.86)).toBeLessThanOrEqual(0.7);
    expect(club('Arsenal').facilities).toBe(20);
    expect(g.econ?.wageFit).toBeDefined();
  });
  it('den moderne database har ingen 2001-økonomi', () => {
    const g = start(load('world.json'), 'Arsenal');
    expect(g.econ).toBeUndefined();
  });
});
