// post_offer_news 0x8d3090 (0x8d1130 flag 0x3e) / 0x8e1780 (leje, 0x2e): et computerbud på en spiller hos en anden computerklub giver en nyhed
// til mennesket, når han har spilleren på shortlisten (flag 8); ellers kun omdømmereglen for et offentligt bud (flag 0x20: +0x2d ≠ 0).
// Teksten 0x8d3520 for en seer, der ikke styrer sælgerklubben: "{Club} have made an offer of £X for {Club 2}'s {Player}."
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { cmShortlistApply } from '../src/game/transfers';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import type { SlBid } from '../src/game/cmShortlistGame';
import type { Player } from '../src/game/types';

describe('budnyheden til mennesket med spilleren på shortlisten (0x8d3090)', { timeout: 300_000 }, () => {
  const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  const mu = w.clubs.find((c) => c[1] === 'Manchester United')![0];
  createGame(w, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const buyer = Object.values(g.clubs).find((c) => c.name === 'Swindon Town')!;
  const seller = Object.values(g.clubs).find((c) => c.name === 'Arsenal')!;
  const pool = squad(seller.id).filter((x) => !x.loan && x.contract && !x.contract.futureClub);
  // omdømmet set af 0x8d1130 (+0xd verden): de mindst kendte, så omdømmereglen ikke rammer
  const wrep = (p: Player) => (p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[2];
  const [x, y] = pool.slice().sort((a, b) => wrep(a) - wrep(b));
  const star = pool.slice().sort((a, b) => wrep(b) - wrep(a))[0];
  const ev = (o: Partial<SlBid>): SlBid => ({ kind: 'bid', id: g.nextId.offer++, buyer: buyer.id, player: x.id, fee: 100_000, loan: false, months: 0, sellOn: 0, lgFee: 0,
    lgApps: 10, intFee: 0, intApps: 10, pub: 0, neg: 0, max: 200_000, days: 3, ...o });
  const fresh = (n0: number) => g.news.slice(0, g.news.length - n0);

  it('spilleren på shortlisten: "Swindon Town transfer bid for …" / "… have made an offer of … for Arsenal\'s …"', () => {
    g.shortlist = [x.id];
    const n0 = g.news.length;
    cmShortlistApply([ev({})]);
    const n = fresh(n0).find((q) => q.key === 'transfer.cmBidSeen')!;
    expect(n).toBeTruthy();
    expect(newsTitle(n)).toBe(`Swindon Town transfer bid for ${n.params.player}`);
    expect(newsBody(n)).toMatch(new RegExp(`^Swindon Town have made an offer of .+ for Arsenal's ${n.params.player}\\.$`));
  });

  it('ikke på shortlisten og ikke offentligt: ingen nyhed', () => {
    g.shortlist = [];
    const n0 = g.news.length;
    cmShortlistApply([ev({ player: y.id })]);
    expect(fresh(n0).some((q) => q.key === 'transfer.cmBidSeen')).toBe(false);
  });

  it('ikke-forhandlingsbart (+0x31 = 1) og lejebud på shortlisten', () => {
    g.shortlist = [x.id, y.id];
    const n0 = g.news.length;
    cmShortlistApply([ev({ buyer: Object.values(g.clubs).find((c) => c.name === 'Reading')!.id, neg: 1 })]);
    const n = fresh(n0).find((q) => q.key === 'transfer.cmBidSeen')!;
    expect(newsBody(n)).toMatch(/^Reading have made a non-negotiable offer of .+ for Arsenal's .+\.$/);
    const n1 = g.news.length;
    cmShortlistApply([ev({ buyer: Object.values(g.clubs).find((c) => c.name === 'Watford')!.id, player: y.id, loan: true, fee: 0, loanUntil: '2002-05-31', loanShare: 50 })]);
    const l = fresh(n1).find((q) => q.key === 'transfer.cmLoanSeen')!;
    expect(newsTitle(l)).toBe(`Watford loan offer for ${l.params.player}`);
    expect(newsBody(l)).toBe(`Watford have made an offer to loan Arsenal's ${l.params.player} until 31st May 2002.`);
  });

  it('omdømmereglen kun for et offentligt bud (flag 0x20, +0x2d)', () => {
    g.shortlist = [];
    const n0 = g.news.length;
    cmShortlistApply([ev({ player: star.id, fee: 5_000_000, max: 6_000_000, pub: 0 })]);
    expect(fresh(n0).some((q) => q.key === 'transfer.cmBidSeen')).toBe(false);
    const n1 = g.news.length;
    cmShortlistApply([ev({ buyer: Object.values(g.clubs).find((c) => c.name === 'Leeds United')!.id, player: star.id, fee: 5_000_000, max: 6_000_000, pub: 2 })]);
    expect(fresh(n1).some((q) => q.key === 'transfer.cmBidSeen')).toBe(true);
  });
});
