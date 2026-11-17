// Originalens klubøkonomi (cmFinance.ts) – den originale database i ægte tilstand. Tallene i kommentarerne er oraklets (frø 1, 3.9.60,
// finance.dat af originalens gemte spil 15/7-2001 – ~/cm0102-engine/oracle/out/fin/d1.json).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { balGbp, K, wealthBand } from '../src/game/cmFinance';
import { completeTransfer } from '../src/game/transfers';
import { afterAppearance } from '../src/game/clauses';
import type { TransferOffer } from '../src/game/types';

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

  it('køb/salg og bonusser i blokkene (Finance 0x599890 add_bought, 0x599800 add_sold, 0x599960 add_bonus) – saldoen trækkes kun én gang', () => {
    // K2 (scripts/cm-day-lockstep.ts): originalens sæsonposter Bought/Sold/Bonuses var > 0 for de engelske klubber, vores stod på 0
    const g = start(load('world-original.json'), 'Arsenal', 'authentic');
    const club = (n: string) => Object.values(g.clubs).find((c) => c.name === n)!;
    const buyer = club('Leeds United'), seller = club('Everton');
    const p = Object.values(g.players).find((x) => x.club === seller.id && !x.loan && x.contract)!;
    const b0 = buyer.balance, s0 = seller.balance, rb = g.cmFin![buyer.id], rs = g.cmFin![seller.id];
    const fee = 1_000_000;
    completeTransfer({ id: 1, player: p.id, buyer: buyer.id, seller: seller.id, fee, loan: false, status: 'accepted', created: g.date, respondBy: g.date } as TransferOffer, 10_000, 3);
    expect(rb.ty[K.bought]).toBe(Math.round(fee * 0.86));
    expect(rb.tm[K.bought]).toBe(Math.round(fee * 0.86));
    expect(rs.ty[K.sold]).toBe(Math.round(fee * 0.86));
    expect(s0 - seller.balance).toBeLessThanOrEqual(-fee + 1);             // sælgeren får beløbet én gang
    expect(b0 - buyer.balance).toBeGreaterThanOrEqual(fee - 1);            // køberen betaler (+ evt. signing on fee)
    const q = g.players[p.id];
    // 0x4ca6d0: kontraktens beløb i pund (+0x10 mål, +0x14 assist, +0x18 clean sheet) – mål × +0x10 + assists × +0x14
    q.contract!.cmBonusGbp = [860, 500, 300];
    const bon0 = rb.ty[K.bonuses], bal0 = buyer.balance;
    afterAppearance(q, 2, false, { assists: 1, pay: true });
    expect(rb.ty[K.bonuses] - bon0).toBe(2 * 860 + 500);
    expect(bal0 - buyer.balance).toBeCloseTo((2 * 860 + 500) / 0.86, 6);
    // clean sheet-leddet (sic): kun når 0x4ca6d0's betingelse holder (keeperens plads, mål imod ≠ 0) – og ganget med assists
    afterAppearance(q, 0, true, { assists: 2, pay: true });
    expect(rb.ty[K.bonuses] - bon0).toBe(2 * 860 + 500 + 2 * 500 + 2 * 300);
    // prøvekontrakt (+0x35 = 5): ingen bonusser
    q.contract!.cmType = 5;
    const bon1 = rb.ty[K.bonuses];
    afterAppearance(q, 3, false, { assists: 0, pay: true });
    expect(rb.ty[K.bonuses]).toBe(bon1);
    // ældre kontrakter uden pundbeløbene: de viste beløb omregnet
    delete q.contract!.cmType; delete q.contract!.cmBonusGbp; q.contract!.goalBonus = 1000; q.contract!.cmAssistBonus = undefined;
    const bon2 = rb.ty[K.bonuses];
    afterAppearance(q, 2, false, { assists: 0, pay: true });
    expect(rb.ty[K.bonuses] - bon2).toBe(2 * Math.round(1000 * 0.86));
  });

  it('create_game 0x82992b: manglende tilskuertal/træningsanlæg udfyldes af omdømmet (Brasilien, Peru …)', () => {
    const w = load('world-original.json');
    const raw = JSON.stringify(w.cmRaw?.crowd);
    const g = start(w, 'Arsenal', 'authentic');
    const club = (n: string) => Object.values(g.clubs).find((c) => c.name === n)!;
    // oraklet (d323): Alianza Lima (omdømme 5500, club.dat +115 = 0) har billetindtægt 5 × 415.937 = 5.500 · 15.125 · 0,005 → tilskuertal 15.125
    expect(g.cmCrowd![club('Club Alianza Lima').id][0]).toBe(15125);
    // Flamengo: 0 i databasen → rep²/2000
    const fl = club('Clube de Regatas do Flamengo').id, rep = g.cmClubRep![fl];
    expect(g.cmCrowd![fl][0]).toBe(Math.max(Math.trunc((rep * rep) / 2000), 250));
    expect(g.cmCrowd![fl][2]).toBeGreaterThanOrEqual(Math.max(Math.trunc((rep * rep) / 1000), 12500));
    for (const v of Object.values(g.cmCrowd!)) expect(v[0]).toBeGreaterThan(0);
    for (const c of Object.values(g.clubs)) if (g.cmFin?.[c.id]) { expect(c.facilities).toBeGreaterThanOrEqual(1); expect(c.facilities).toBeLessThanOrEqual(20); }
    // world-filens rækker er urørte (de deles mellem spil)
    expect(JSON.stringify(w.cmRaw?.crowd)).toBe(raw);
  });

  it('den moderne database og det udvidede spil har ingen cmFin', () => {
    expect(start(load('world-original.json'), 'Arsenal').cmFin).toBeUndefined();
    expect(start(load('world.json'), 'Arsenal', 'authentic').cmFin).toBeUndefined();
  });
});
