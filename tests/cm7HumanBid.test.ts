// build_bid's kontrakttilbud (+0x2f ≠ 0, tilstand 7 – 0x8be81e) til en spiller hos menneskets klub: intet ventende bud på £0 (ejeren 24/11:
// "Swindon Town har lige budt £0"), kun nyheden 0x8d3090/0x8d3520, og spilleren beslutter selv (cmAiAiDue).
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { cmShortlistApply } from '../src/game/transfers';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import type { SlBid } from '../src/game/cmShortlistGame';

describe('kontrakttilbud til menneskets spiller (tilstand 7)', { timeout: 300_000 }, () => {
  const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  const mu = w.clubs.find((c) => c[1] === 'Manchester United')![0];
  createGame(w, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const buyer = Object.values(g.clubs).find((c) => c.name === 'Swindon Town')!;
  const p = squad(mu).find((x) => !x.loan && x.contract)!;
  const ev = (o: Partial<SlBid>): SlBid => ({ kind: 'bid', id: g.nextId.offer++, buyer: buyer.id, player: p.id, fee: 0, loan: false, months: 0, sellOn: 0, lgFee: 0, lgApps: 10,
    intFee: 0, intApps: 10, pub: 0, max: 0, days: 28, free7: true, k: new Array(0x50).fill(0), dd: 2, bl: 28, r4: 4, tm: 4, until: '2002-06-30', ct: 2, exp: '2002-06-30', ...o });

  it('ingen Respond: intet ventende bud, nyheden "have offered a contract … when his current contract expires on"', () => {
    const n0 = g.news.length;
    cmShortlistApply([ev({})]);
    expect(g.offers.some((o) => o.player === p.id && o.status === 'pending')).toBe(false);
    const o = g.offers.find((x) => x.player === p.id && x.buyer === buyer.id)!;
    expect(o.cmAi && o.cm7 && o.status === 'negotiating').toBe(true);
    const n = g.news.slice(0, g.news.length - n0).find((x) => x.key === 'transfer.cm7')!;
    expect(newsTitle(n)).toBe(`Swindon Town transfer bid for ${n.params.player}`);
    expect(newsBody(n)).toBe(`Swindon Town have offered a contract to Manchester United's ${n.params.player}.\n\nIf accepted, the player will join when his current contract expires on 30th June 2002.`);
    expect(g.news.slice(0, g.news.length - n0).some((x) => x.key === 'transfer.incomingBid')).toBe(false);
  });

  it('kontrakttype 1/3: "made an approach … on a free transfer" + kompensationslinjen, når +0x1b ≠ 0', () => {
    const q = squad(mu).filter((x) => !x.loan && x.contract && x.id !== p.id)[0];
    const n0 = g.news.length;
    cmShortlistApply([ev({ player: q.id, ct: 1, fee: 50_000, tm: 0 })]);
    const n = g.news.slice(0, g.news.length - n0).find((x) => x.key === 'transfer.cm7')!;
    expect(newsBody(n)).toMatch(/^Swindon Town have made an approach to sign Manchester United's .+ on a free transfer\.\n\nManchester United will be due .+ in compensation if the deal goes ahead$/);
  });
});
