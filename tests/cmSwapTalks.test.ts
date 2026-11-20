// CM 01/02: computerens bud på menneskets spiller med en bytte-spiller (efter menneskets modbud "ask for player in exchange"): når mennesket
// accepterer (0x8c0080), får det "Offer contract to <X>" for bytte-spilleren (0x8d7cd0), skal tilbyde ham en kontrakt (0x4cc490, svar efter 1–5
// dage), og handlen gennemføres først, når han er enig (0x8c2180 → 0x8c2f50). Siger han nej (0x8c28c0), er han ude af handlen, og beløbet hæves
// med hans værdi. Ejerens fejl 21/11: bytte-spilleren blev tildelt holdet uden beskeder eller forhandling.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { playerInterest, processOffers, respondToOffer } from '../src/game/transfers';
import { daysBetween } from '../src/game/dates';
import { cmSwapOpen, cmSwapView, cmTalksDemand } from '../src/game/cmTransferTalks';
import { cmMarketOn } from '../src/game/cmPlayerData';
import type { Player, TransferOffer } from '../src/game/types';

describe('byttehandel: menneskets sælger forhandler med bytte-spilleren (3.9.68, ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  /** computerens endelige bud på en af menneskets spillere med en af køberens spillere i bytte (som efter 0x8c0810), klar til Accept */
  function swapBid(skip = 0): { o: TransferOffer; p: Player; x: Player } {
    const g = gs();
    const buyers = Object.values(g.clubs).filter((c) => c.id !== mu && c.league === g.clubs[mu].league);
    const mine = squad(mu).sort((a, b) => b.ca - a.ca).slice(10, 30);
    let n = 0;
    for (const b of buyers) {
      const p = mine.find((q) => playerInterest(q, b) === 'yes' && !g.offers.some((o) => o.player === q.id && o.status !== 'completed'));
      const x = squad(b.id).filter((q) => !q.loan && !g.offers.some((o) => o.swap?.includes(q.id))).sort((a, c) => c.ca - a.ca)[8];
      if (!p || !x || n++ < skip) continue;
      const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: b.id, seller: mu, fee: Math.round(p.value / 2), loan: false, status: 'pending', created: g.date, respondBy: g.date, swap: [x.id], final: true };
      g.offers.push(o);
      return { o, p, x };
    }
    throw new Error('intet bud');
  }

  const offerTo = (o: TransferOffer, x: Player, f: number) => {
    const g = gs();
    const want = cmTalksDemand(cmSwapView(o, x.id))!;
    const years = Math.max(1, Number(want.expires.slice(0, 4)) - Number(g.date.slice(0, 4)));
    g.clubs[mu].wageBudget += want.wage * 10;
    return { res: act({ t: 'negotiate', pid: x.id, wage: Math.max(50, Math.round(want.wage * f / 50) * 50), years }), want, years };
  };

  it('Accept: ingen direkte tildeling – "Offer contract to X", kontrakttilbud, svar efter 1–5 dage, handlen gennemføres med den aftalte kontrakt', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    expect(cmMarketOn(g)).toBe(true);
    const { o, p, x } = swapBid();
    const buyer = o.buyer;
    const from = g.nextId.news;
    respondToOffer(o.id, 'accept', undefined, undefined, undefined, {});
    // ingen tildeling ved accepten
    expect(x.club).toBe(buyer);
    expect(p.club).toBe(mu);
    expect(o.status).toBe('negotiating');
    const talk = g.news.filter((n) => n.id >= from).find((n) => n.key === 'transfer.cmSwapTalks')!;
    expect(talk).toBeTruthy();
    expect(talk.params).toMatchObject({ pid: x.id, last: x.last, seller: g.clubs[buyer].short, buyer: g.clubs[mu].short });
    expect(talk.link).toEqual({ kind: 'offer', id: o.id });
    expect(cmSwapOpen(g, o, x.id)).toBe(true);
    // ingen frist (tilstand 8 forfalder ikke)
    processOffers();
    expect(o.status).toBe('negotiating');
    // Set Role At Club + Offer Contract
    expect(act({ t: 'cmOfferRole', pid: x.id, role: 'rotation' })).toBe('ok');
    const { res, want } = offerTo(o, x, 1.6);
    expect(res).toBe('cmSent');
    expect(cmSwapOpen(g, o, x.id)).toBe(false);
    const due = o.cmSwapTalks![x.id].due!;
    const wait = daysBetween(g.date, due);
    expect(wait).toBeGreaterThanOrEqual(1);
    expect(wait).toBeLessThanOrEqual(5);
    const from2 = g.nextId.news;
    g.date = due;
    processOffers();
    const news = g.news.filter((n) => n.id >= from2).map((n) => n.key);
    expect(news).toContain('transfer.cmAgrees');
    expect(o.status).toBe('completed');
    expect(p.club).toBe(buyer);
    expect(x.club).toBe(mu);
    expect(x.contract!.wage).toBe(Math.max(50, Math.round(want.wage * 1.6 / 50) * 50));
    expect(x.squadStatus).toBe('rotation');
  });

  it('Bytte-spilleren siger nej: ude af handlen, beløbet hæves med hans værdi (eller køberen trækker buddet)', () => {
    const g = gs();
    const { o, p, x } = swapBid(1);
    const buyer = o.buyer;
    respondToOffer(o.id, 'accept', undefined, undefined, undefined, {});
    expect(o.status).toBe('negotiating');
    expect(offerTo(o, x, 0.05).res).toBe('cmSent');
    const fee0 = o.fee;
    const from = g.nextId.news;
    g.date = o.cmSwapTalks![x.id].due!;
    processOffers();
    const fresh = g.news.filter((n) => n.id >= from);
    const rej = fresh.find((n) => n.key === 'transfer.cmSwapRejects')!;
    expect(rej).toBeTruthy();
    expect(rej.params).toMatchObject({ last: x.last, buyer: g.clubs[mu].short, seller: g.clubs[buyer].short });
    expect(x.club).toBe(buyer);
    if (o.status === 'withdrawn') {
      expect(fresh.map((n) => n.key)).toContain('transfer.aiWithdrew');
      expect(p.club).toBe(mu);
    } else {
      // ingen bytte-spillere tilbage → handlen gennemføres for kontanter
      expect(o.status).toBe('completed');
      expect(o.fee).toBeGreaterThanOrEqual(fee0);
      expect(p.club).toBe(buyer);
    }
  });
});
