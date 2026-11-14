// CM 01/02: forløbet efter et accepteret transferbud (cmTransferTalks.ts): 0x8c0080 → "<X> transfer offer accepted" + "Offer contract to <X>",
// Offer Contract (0x4cc490) → svaret efter 1–5 dage (0x4cd230/0x4ce4e0) → "accepts"/"rejects" (0xfa4), runderne og fristerne (0x8c28c0, 0x8c6708).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { processOffers } from '../src/game/transfers';
import { addDays, daysBetween } from '../src/game/dates';
import { cmAcceptBid, cmTalksDemand, cmTalksOpen } from '../src/game/cmTransferTalks';
import type { Player, TransferOffer } from '../src/game/types';

describe('accepteret bud → Offer Contract (3.9.60, ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  /** et bud fra Man Utd, sælgeren accepterer – den første spiller, der vil tale med Man Utd */
  function accepted(skip = 0): { o: TransferOffer; p: Player; from: number } {
    const g = gs();
    const sellers = Object.values(g.clubs).filter((c) => c.id !== mu && c.league === g.clubs[mu].league);
    let n = 0;
    for (const s of sellers) {
      for (const p of squad(s.id).sort((a, b) => b.ca - a.ca).slice(4, 8)) {
        const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: mu, seller: s.id, fee: p.value, loan: false, status: 'pending', created: g.date, respondBy: g.date };
        g.offers.push(o);
        const from = g.nextId.news;
        cmAcceptBid(o, p);
        if (o.status === 'negotiating' && n++ >= skip) return { o, p, from };
      }
    }
    throw new Error('ingen spiller ville tale med Man Utd');
  }

  it('to nyheder samme dag, knappen åbner kun et åbent tilbud, ingen frist', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const { o, p, from } = accepted();
    const fresh = g.news.filter((x) => x.id >= from).reverse();
    const keys = fresh.map((x) => x.key);
    expect(keys).toContain('transfer.cmAccepted');
    expect(keys).toContain('transfer.cmTalks');
    const acc = fresh.find((x) => x.key === 'transfer.cmAccepted')!, talk = fresh.find((x) => x.key === 'transfer.cmTalks')!;
    expect(acc.date).toBe(talk.date);
    expect(acc.params).toMatchObject({ last: p.last, buyer: g.clubs[mu].short, seller: g.clubs[o.seller].short });
    expect(talk.link).toEqual({ kind: 'offer', id: o.id });
    expect(cmTalksOpen(g, o)).toBe(true);
    // ingen frist for at tilbyde (tilstand 9 forfalder ikke): et halvt år senere er tilbuddet stadig åbent
    const d0 = g.date;
    g.date = addDays(d0, 180);
    processOffers();
    expect(o.status).toBe('negotiating');
    g.date = d0;
  });

  it('kravet (0x85fc50) og et godt tilbud: svaret efter 1–5 dage, "accepts", handlen gennemføres', () => {
    const g = gs();
    const { o, p } = accepted(1);
    const want = cmTalksDemand(o)!;
    expect(want.wage).toBeGreaterThan(0);
    g.clubs[mu].wageBudget += want.wage * 10;
    const years = Math.max(1, Number(want.expires.slice(0, 4)) - Number(g.date.slice(0, 4)));
    expect(act({ t: 'negotiate', pid: p.id, wage: Math.round(want.wage * 1.5), years, clauses: { signOn: want.signOn } })).toBe('cmSent');
    const due = o.cmTalks!.due!;
    const wait = daysBetween(g.date, due);
    expect(wait).toBeGreaterThanOrEqual(1);
    expect(wait).toBeLessThanOrEqual(5);
    const from = g.nextId.news;
    g.date = due;
    processOffers();
    expect(g.news.filter((x) => x.id >= from).reverse().map((x) => x.key)).toContain('transfer.cmAgrees');
    expect(p.club).toBe(mu);
    expect(o.status).toBe('completed');
  });

  it('et for lavt tilbud: "rejects" med "willing to negotiate", +10 dage, så runder 3 og +10 dage, så lukket', () => {
    const g = gs();
    const { o, p } = accepted(2);
    expect(act({ t: 'negotiate', pid: p.id, wage: 50, years: 1 })).toBe('cmSent');
    const from = g.nextId.news;
    g.date = o.cmTalks!.due!;
    processOffers();
    const rej = g.news.filter((x) => x.id >= from).reverse().find((x) => x.key === 'transfer.cmRejects')!;
    expect(rej.params.again).toBe(1);
    expect(o.cmTalks).toMatchObject({ rounds: 1, state: 4 });
    expect(o.status).toBe('negotiating');
    expect(cmTalksOpen(g, o)).toBe(true);
    g.date = addDays(g.date, 10);
    processOffers();
    expect(o.cmTalks!.rounds).toBe(3);
    expect(o.status).toBe('negotiating');
    g.date = addDays(g.date, 10);
    processOffers();
    expect(o.status).toBe('collapsed');
  });
});
