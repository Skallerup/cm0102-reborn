// Finance 0x599e00 (stadionudvidelsen ved oprykning fra Conference, cmNonLeague.ts) – Third Divisions krav 1000 sæder / 6000 pladser.
// Oraklet (frø 1, 3.9.60) 15/6-02: Barnet 4600/1000, Chester 6000/2700, Southport 6011/1880.
import { describe, expect, it } from 'vitest';
import { expandStadium_599e00 } from '../src/game/cmNonLeague';
import type { Club, GameState } from '../src/game/types';

function world(cap: number, seats: number) {
  const c = { id: 1, name: 'X', league: 'HN60', seats: cap, balance: 0, finance: {} } as unknown as Club;
  const g = { clubs: { 1: c }, cmCrowd: { 1: [0, 0, 0, 7, 0, cap, 0, 0, 0] }, cmStadium: { 7: [seats, cap] } } as unknown as GameState;
  return { g, c };
}
const noRand = () => { throw new Error('rand'); };

describe('0x599e00 stadionudvidelsen', () => {
  it('opfyldt: intet ændres og ingen tilfældige tal (Southport/Chester)', () => {
    for (const [cap, seats] of [[6011, 1880], [6000, 2700]]) {
      const { g, c } = world(cap, seats);
      expect(expandStadium_599e00(g, c, 1000, 6000, true, noRand)).toBe(true);
      expect(g.cmCrowd![1][5]).toBe(cap);
      expect(g.cmStadium![7]).toEqual([seats, cap]);
    }
  });
  it('Barnet 4600/1000 uden formand: 1400 nye pladser, pris 820.000 < 1 mio. → udvidet uden rand', () => {
    const { g, c } = world(4600, 1000);
    expect(expandStadium_599e00(g, c, 1000, 6000, true, noRand)).toBe(true);
    expect(g.cmCrowd![1][5]).toBe(6000);
    expect(c.seats).toBe(6000);
    expect(g.cmStadium![7]).toEqual([1000, 6000]);
  });
  it('for få sæder: ståpladser bygges om (min(mangel − sæder, kapacitet − sæder))', () => {
    const { g, c } = world(6000, 300);
    // mangler 700 sæder (> 300): ombygning min(400, 5700) = 400; kapaciteten +700 (mangel), ingen nye ståpladser
    expect(expandStadium_599e00(g, c, 1000, 6000, true, noRand)).toBe(true);
    expect(g.cmCrowd![1][5]).toBe(6700);
    expect(g.cmStadium![7]).toEqual([1400, 6700]);
  });
  it('uden stadion: 0', () => {
    const { g, c } = world(5000, 1000);
    g.cmCrowd![1][3] = -1;
    expect(expandStadium_599e00(g, c, 1000, 6000, true, noRand)).toBe(false);
  });
});
