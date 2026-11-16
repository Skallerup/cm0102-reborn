// Klubøkonomiens begivenheder (cmFinEvents.ts: process_club_finance_events 0x59ed70) – den originale database i ægte tilstand.
import { describe, expect, it, vi } from 'vitest';
// en import trækker analytics.ts med (window ved indlæsning) – i Node en tom stand-in
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { balGbp, GBP, K } from '../src/game/cmFinance';
import { cmFinEvents } from '../src/game/cmFinEvents';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import type { GameState } from '../src/game/types';

const load = (f: string) => JSON.parse(readFileSync(`public/data/${f}`, 'utf8')) as WorldData;
const start = (club: string) => {
  const w = load('world-original.json');
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === club)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  return gs();
};
const byName = (g: GameState, n: string) => Object.values(g.clubs).find((c) => c.name === n)!;
const zero = () => 0;

describe('process_club_finance_events 0x59ed70', () => {
  const g = start('Arsenal');

  it('dyb gæld: betalingsstandsning (+0x165 = 1), PLC ophører, nyheden til klubbens manager', () => {
    const ars = byName(g, 'Arsenal'), r = g.cmFin![ars.id];
    ars.balance = -60_000_000 / GBP;
    g.cmFinRaw![ars.id][1] = 1; ars.plc = true;
    const n0 = g.news.length;
    cmFinEvents(g, ars, r, false, () => 1);
    expect(r.s165).toBe(1);
    expect(g.cmFinRaw![ars.id][1]).toBe(0);
    expect(ars.plc).toBe(false);
    const n = g.news[0];
    expect(g.news.length).toBe(n0 + 1);
    expect(newsTitle(n)).toBe('Receivers called in');
    expect(newsBody(n)).toBe('Receivers have been appointed to deal with the financial problems at Arsenal.\n\nYou are no longer in a position to refuse reasonable transfer offers for any squad member.');
  });

  it('overtagelsen 0x59e940: gælden ryddes, ny formand, nyheden til landets managere ("New Board take control of …")', () => {
    const nc = byName(g, 'Notts County'), r = g.cmFin![nc.id];
    const debt = -20_000_000;
    nc.balance = debt / GBP;
    r.s165 = 1;
    const inv0 = r.tm[K.investments];
    const n0 = g.news.length;
    cmFinEvents(g, nc, r, true, zero);
    const amount = r.tm[K.investments] - inv0;
    expect(amount).toBeGreaterThan(20_000_000);                      // (omdømme + 1000)·1000 + gælden
    expect(balGbp(nc)).toBe(debt + amount);
    expect(r.s165).toBe(0);
    expect(nc.transferBudget).toBeGreaterThan(0);                    // 0x598800 efter indskuddet (krogen fra sim.ts)
    if (r.chair) expect(r.chair[1]).toBe(1);                         // Resources rand(20) + 1, under 5 → trukket igen
    expect(g.news.length).toBe(n0 + 1);
    expect(newsTitle(g.news[0])).toBe('New Board take control of Notts County');
    expect(newsBody(g.news[0])).toMatch(/^A new board of directors has assumed control of Notts County/);
  });

  it('computerklubbens kapitalindskud (type 4) ses ikke af andre managere; amatørklubber får ingen nyhed', () => {
    const c = Object.values(g.clubs).find((x) => x.nation === byName(g, 'Arsenal').nation && x.id !== g.userClub && g.cmFin?.[x.id] && x.name !== 'Notts County')!;
    const r = g.cmFin![c.id];
    c.balance = -100 / GBP;
    r.s165 = 2;
    const n0 = g.news.length;
    cmFinEvents(g, c, r, true, zero);
    expect(g.news.slice(0, g.news.length - n0).every((n) => n.key === 'cmfe.h.board' || n.key === 'cmfe.h.plc')).toBe(true);
  });
});
