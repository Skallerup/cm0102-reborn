// Originalens modtagerregel for nyheder om andre klubber (cmNewsScope.ts: 0x8dbef0/0x8d1130 transfers, 0x6a2e00/0x6a1b00 managerskifter).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { clubNewsToMe, transferNewsToMe } from '../src/game/cmNewsScope';
import type { Club, Player } from '../src/game/types';

describe('nyhedernes modtagere (3.9.60, ægte tilstand, Man Utd)', () => {
  const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const me = g.clubs[g.userClub];
  const lg = (c: Club) => g.comps[c.league]?.name ?? '';
  const inLeague = (name: string) => Object.values(g.clubs).filter((c) => lg(c) === name && c.id !== me.id);
  const pl = inLeague('English Premier Division'), d2 = inLeague('English Second Division');
  const abroad = Object.values(g.clubs).filter((c) => c.nation !== eng && !g.leagues[c.league]?.hidden && Object.values(g.players).some((p) => p.club === c.id && p.nation === c.nation));
  const rep = (p: Player, H: number, C: number, W: number) => { p.cmRepMem = [H / 50, C / 50, W / 50]; p.cmStats = undefined; return p; };
  const someone = (c: Club) => Object.values(g.players).find((p) => p.club === c.id && p.nation === c.nation && !p.loan)!;

  it('ligaerne findes', () => {
    expect(pl.length).toBe(19);
    expect(d2.length).toBeGreaterThan(20);
    expect(abroad.length).toBeGreaterThan(100);
  });

  it('ingen nyhed om en almindelig handel i Division 2 (Port Vale seal … deal)', () => {
    for (let i = 0; i < 10; i++) {
      const buyer = d2[i], seller = d2[i + 1];
      const p = rep(someone(seller), 1500, 1500, 300);
      expect(transferNewsToMe(g, p, buyer, { seller, fee: 200_000 })).toBe(false);
      expect(transferNewsToMe(g, p, buyer, { fee: 0 })).toBe(false);       // fri transfer
    }
  });

  it('Premier League: sælgers division når nuværende omdømme > 350·divisionens omdømme og > 2500', () => {
    const buyer = pl[0], seller = pl[1];
    const lim = 350 * (g.cmCompRep?.[+me.league.replace('CM', '')] ?? 0);
    expect(lim).toBeGreaterThan(2500);
    expect(transferNewsToMe(g, rep(someone(seller), lim + 100, lim + 100, 1000), buyer, { seller, fee: 300_000 })).toBe(true);
    // under grænsen og uden kampstatistik (standard 6,5 < 9 − C/4000) → ingen nyhed
    expect(transferNewsToMe(g, rep(someone(seller), 1000, 1000, 1000), buyer, { seller, fee: 300_000 })).toBe(false);
    // samme handel mellem to D2-klubber når ikke Man Utd
    expect(transferNewsToMe(g, rep(someone(d2[2]), lim + 100, lim + 100, 1000), d2[3], { seller: d2[2], fee: 300_000 })).toBe(false);
  });

  it('store udenlandske handler: verdensomdømmet over grænsen (9200 + 3000 − 0,0006·værdi) → alle', () => {
    const buyer = abroad[0], seller = abroad.find((c) => c.nation !== buyer.nation)!;
    const p = rep(someone(seller), 9000, 9000, 9500);
    // £5 mio. (€5,81 mio.): grænserne 9200/8300/7200 → verden 9500 > 9200
    expect(transferNewsToMe(g, p, buyer, { seller, fee: 5_814_000 })).toBe(true);
    // £1 mio.: grænserne 9750/9750/9600 → ingen nyhed for en englænder
    expect(transferNewsToMe(g, rep(p, 5000, 5000, 9500), buyer, { seller, fee: 1_163_000 })).toBe(false);
    // £20 mio. (ax = −9000): alle med verdensomdømme > 200
    expect(transferNewsToMe(g, rep(p, 100, 100, 300), buyer, { seller, fee: 23_256_000 })).toBe(true);
  });

  it('landet: engelsk spiller med hjemmeomdømme > T3 til en udenlandsk klub', () => {
    const buyer = abroad[0];
    const p = rep(someone(pl[2]), 8000, 3000, 3000);
    expect(transferNewsToMe(g, p, buyer, { seller: pl[2], fee: 5_814_000 })).toBe(true);
    const p2 = rep(someone(abroad[1]), 8000, 3000, 3000);
    if (p2.nation !== eng && g.clubs[abroad[1].id].nation !== eng && buyer.nation !== eng) expect(transferNewsToMe(g, p2, buyer, { seller: abroad[1], fee: 5_814_000 })).toBe(false);
  });

  it('spilleren på managerens shortlist → nyheden kommer altid', () => {
    const p = rep(someone(d2[4]), 100, 100, 100);
    g.shortlist = [p.id];
    expect(transferNewsToMe(g, p, d2[5], { seller: d2[4], fee: 50_000 })).toBe(true);
    g.shortlist = [];
  });

  it('managerskifter: kørende liga i eget land (også D2, som originalen – Exeter City i oraklet), udlandet kun over 7250', () => {
    expect(clubNewsToMe(g, d2[0].id)).toBe(true);
    const small = abroad.find((c) => (g.cmClubRep?.[c.id] ?? 0) <= 7250)!;
    expect(clubNewsToMe(g, small.id)).toBe(false);                          // landet er ikke valgt → ingen kørende liga
    const hidden = Object.values(g.clubs).find((c) => g.leagues[c.league]?.hidden)!;
    expect(clubNewsToMe(g, hidden.id)).toBe(false);
  });
});
