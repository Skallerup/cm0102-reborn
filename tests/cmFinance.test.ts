// Originalens klubøkonomi (cmFinance.ts) – den originale database i ægte tilstand. Tallene i kommentarerne er oraklets (frø 1, 3.9.60,
// finance.dat af originalens gemte spil 15/7-2001 – ~/cm0102-engine/oracle/out/fin/d1.json).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { balGbp, K, wealthBand } from '../src/game/cmFinance';

const load = (f: string) => JSON.parse(readFileSync(`public/data/${f}`, 'utf8')) as WorldData;
const start = (w: WorldData, club: string, mode?: 'authentic') => {
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === club)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode });
  return gs();
};

describe('originalens økonomi (cmFinance)', () => {
  it('get_wealth_band 0x5986b0: grænserne efter omdømmet', () => {
    expect(wealthBand(2500 * 8000 + 5_000_001, 8000)).toBe(2);
    expect(wealthBand(1000 * 8000 + 3_500_001, 8000)).toBe(1);
    expect(wealthBand(-2_500_001 - 1500 * 8000, 8000)).toBe(-2);
    expect(wealthBand(-250 * 3000 - 1, 3000)).toBe(-1);
    expect(wealthBand(1000 * (3750 - 6000) - 1, 6000)).toBe(-1);
    expect(wealthBand(0, 6000)).toBe(0);
  });

  it('init_for_club 0x5961d0: startsaldoen som originalens (databasens beløb ± B/5, ellers tabellen)', () => {
    const g = start(load('world-original.json'), 'Arsenal', 'authentic');
    expect(g.cmFin).toBeTruthy();
    const club = (n: string) => Object.values(g.clubs).find((c) => c.name === n)!;
    // Man Utd: club.dat £30,4M → originalen £30,59M; Bury: intet beløb → tabellen (omdømme 3500 → £750K · 0,05 · 19²/19) → originalen £694K
    const mu = balGbp(club('Manchester United')), bury = balGbp(club('Bury'));
    expect(mu).toBeGreaterThanOrEqual(30_400_000 - 6_080_000);
    expect(mu).toBeLessThanOrEqual(30_400_000 + 6_080_000);
    expect(bury).toBeGreaterThanOrEqual(712_500 - 142_500);
    expect(bury).toBeLessThanOrEqual(712_500 + 142_500);
    // sæsonkortene: ugen starter på 3 (første tabelindgang 0,5), andelen 0,1
    const r = g.cmFin![club('Manchester United').id];
    expect(r.wk).toBe(3);
    expect(r.share).toBeCloseTo(0.1, 6);
    expect(r.wb).toBeGreaterThan(0);
  });

  it('dagene: søndagens løn og merchandise, månedens poster rulles til sidste måned', async () => {
    const g = start(load('world-original.json'), 'Arsenal', 'authentic');
    const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
    const mu = Object.values(g.clubs).find((c) => c.name === 'Manchester United')!;
    while (g.date < '2001-08-01') { const res = continueGame(); if (res.match !== undefined) quickPlayUserMatch(); }
    const r = g.cmFin![mu.id];
    // juli: tre søndage (15/7, 22/7, 29/7) og månedens poster
    expect(r.lm[K.wages]).toBeGreaterThan(2 * r.wb);
    expect(r.lm[K.merch]).toBeGreaterThan(1_000_000);          // originalen 1,76M
    expect(r.lm[K.interestIn]).toBeGreaterThan(0);
    expect(r.lm[K.maintenance]).toBeGreaterThan(100_000);       // originalen 173K
    expect(r.lm[K.seasonTickets]).toBe(0);                      // første sæson: ingen sæsonkortindtægt
    expect(r.st).toBeGreaterThan(30_000);                        // originalen 37.896 kortholdere
  });

  it('den moderne database og det udvidede spil har ingen cmFin', () => {
    expect(start(load('world-original.json'), 'Arsenal').cmFin).toBeUndefined();
    expect(start(load('world.json'), 'Arsenal', 'authentic').cmFin).toBeUndefined();
  });
});
