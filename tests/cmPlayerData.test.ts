// Originalens spillerdata til computerens holdudtagelse (game/cmPlayerData.ts): PlayerStats 0x7c0d70/0x7c2150, kontraktens tællere 0x4ca6d0,
// spilstartens omdømme (sub_535a80). Kontrolleret mod den instrumenterede original med scripts/pd-trace-check.ts.
import { describe, expect, it } from 'vitest';
import { ST, cmActive, cmFormRatings, contractAfterMatch, contractNotPlayed, fillReputation, newCmContract, ratingByte, recordPlayerMatch, statValue } from '../src/game/cmPlayerData';
import { ATTRS } from '../src/game/attributes';
import type { GameState, Player } from '../src/game/types';

const g = () => ({ cmRatingAvg: [0, 0], date: '2001-09-01', seed: 1 }) as unknown as GameState;
const pl = (o: Partial<Player> = {}) => ({ id: 7, dob: '1980-01-01', attrs: new Array(ATTRS.length).fill(10), caps: 0, rep: 50, ...o }) as Player;

describe('PlayerStats (0x7c0d70 / 0x7c2150)', () => {
  it('karakteren trækkes mod standarden under 20 kampe, point pr. kamp mod 1,5', () => {
    const e = new Array(22).fill(0);
    expect(statValue(undefined, 0x12, 6.8)).toBeCloseTo(6.8, 5);
    expect(statValue(undefined, 0x14, 1.35)).toBeCloseTo(1.35, 5);
    e[ST.apps] = 5; e[ST.rating] = 40; e[ST.won] = 3; e[ST.lost] = 1;
    expect(statValue(e, 0x12, 6.8)).toBeCloseTo(Math.fround((15 * Math.fround(6.8) + 40) * Math.fround(0.05)), 5);
    expect(statValue(e, 0x14, 1.35)).toBeCloseTo(Math.fround((2 * 3 - 1 + 5 + 15 * 1.5) * Math.fround(0.05)), 5);
    e[ST.apps] = 25; e[ST.rating] = 175;
    expect(statValue(e, 0x12, 6.8)).toBeCloseTo(7, 5);
  });
  it('en ligakamp tæller i kategori 2 og 6, formens nibbles skubbes', () => {
    const G = g(), p = pl();
    recordPlayerMatch(G, p, 2, { rating: 7.4, goals: 1, minutes: 90, sub: false }, 2, 1, false);
    recordPlayerMatch(G, p, 1, { rating: 6.2, goals: 0, minutes: 45, sub: true }, 0, 0, false);
    expect(p.cmStats![2][ST.apps]).toBe(1);
    expect(p.cmStats![6][ST.apps]).toBe(1);
    expect(p.cmStats![6][ST.won]).toBe(1);
    expect(p.cmStats![1][ST.subApps]).toBe(1);
    expect(cmFormRatings(p)).toEqual([0, 0, 0, 7, 6]);
    expect(G.cmRatingAvg).toEqual([13, 2]);  // g() starter på [0, 0]
    expect(ratingByte(9.6)).toBe(10);
    expect(ratingByte(0.2)).toBe(1);
  });
});

describe('kontrakten (0x4ca6d0)', () => {
  it('en starter med 90 minutter er tilfreds: +0x3f + 1, +0x3e = 0, +0x3d + 10 (højst 50 fra under)', () => {
    const p = pl({ contract: {} as Player['contract'] });
    p.cmContract = newCmContract(2);
    p.cmContract.b3e = 3;
    contractAfterMatch(g(), p, { starter: true, minutes: 90, injured: false, condition: 100, won: false, lost: false, clubRep: 5000, nationRep: 0, seed: 1, rand: () => 0 });
    expect(p.cmContract).toMatchObject({ b3e: 0, b3f: 1, b3d: 50 });
  });
  it('en, der ikke spillede: +0x3e + 1, +0x3f = 0, +0x3d − 8, +0x44 falder', () => {
    const p = pl({ contract: {} as Player['contract'] });
    p.cmContract = { b3d: 40, b3e: 0, b3f: 4, b44: 0, b45: 0 };
    contractNotPlayed(g(), p, 5000, 0);
    expect(p.cmContract.b3e).toBe(1);
    expect(p.cmContract.b3f).toBe(0);
    expect(p.cmContract.b3d).toBe(32);
    expect(p.cmContract.b44).toBeLessThan(0);
  });
  it('indskiftet: rand(30) to gange afgør (T − r2 > minutter → utilfreds)', () => {
    const p = pl({ contract: {} as Player['contract'] });
    p.cmContract = newCmContract(0);
    const seq = [29, 0];
    contractAfterMatch(g(), p, { starter: false, minutes: 10, injured: false, condition: 100, won: false, lost: false, clubRep: 5000, nationRep: 0, seed: 1, rand: () => seq.shift() ?? 0 });
    expect(p.cmContract).toMatchObject({ b3e: 1, b3f: 0 });
  });
});

describe('spilstartens omdømme (sub_535a80)', () => {
  it('databasens værdier i 1..200 beholdes; hjemme = nuværende for landets egne', () => {
    const r = fillReputation({ rep: [120, 150, 90], ca: 140, pa: 160, club: { rep: 7500, sameNation: true }, nationRep: 9000, caps: 10 }, () => 0);
    expect(r).toEqual([150, 150, 90]);
  });
  it('manglende udfyldes inden for 1..200', () => {
    const r = fillReputation({ rep: [0, 0, 0], ca: 120, pa: -1, club: { rep: 4500, sameNation: false }, nationRep: 500, caps: 0 }, (n) => Math.floor(n / 2));
    for (const v of r) { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(200); }
  });
});

describe('kun den originale database i ægte tilstand', () => {
  it('cmActive', () => {
    expect(cmActive({ dbKind: 'cm0102', dbYear: 2001, season: 2001, options: { mode: 'authentic' } } as unknown as GameState)).toBe(true);
    expect(cmActive({ dbKind: 'cm0102', dbYear: 2026, season: 2026, options: { mode: 'authentic' } } as unknown as GameState)).toBe(false);
    expect(cmActive({ dbKind: 'cm0102', dbYear: 2001, season: 2001, options: { mode: 'extended' } } as unknown as GameState)).toBe(false);
  });
});
