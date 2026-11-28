// CM 01/02: budskærmens bestyrelsesloft (0x598800 med kendskabet) er kun en rød markering – Offer kan stadig trykkes (0x8ec420 → 0x8ef9f0 →
// add_transfer_offer 0x8be300 uden pengekontrol), køberen får spilleren på shortlisten (0x8be9ad → 0x7f75f0), Action-menuen har Withdraw/Change
// Transfer Bid, og pengene kontrolleres først ved Confirm Transfer Offer (0x8cfc90: budget × 1,1 → Delay Transfer Offer / Cancel).
// Bytte-skærmen (0x47c180): kun de spillere, sælgerklubben vil tage (0x843800 + lønkravet), ellers "… are not interested in a part-exchange deal."
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { exchangeList, myPendingBid } from '../src/game/transfers';
import { cmBidBudget, cmBoardLine } from '../src/game/cmBudget';
import { cmAgreed, cmConfirmAnswer, cmConfirmScreen } from '../src/game/cmTransferTalks';
import { SL_ON } from '../src/game/cmShortlistGame';
import { cmNeedsPermit } from '../src/game/cmPermit';
import type { TransferOffer } from '../src/game/types';

afterEach(() => { SL_ON.on = false; });

describe('budskærmens loft og bekræftelsen som originalen (3.9.60, ægte tilstand, Man Utd)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const koch = Object.values(g.players).find((p) => p.last === 'Koch' && g.clubs[p.club]?.name.includes('Kaiserslautern'))!;

  it('et bud over bestyrelsens loft (og over hele budgettet) kan afgives; spilleren kommer på shortlisten', () => {
    g.knowledge[koch.id] = 0;
    const b = cmBidBudget(g, koch, mu)!;
    expect(b.limited).toBe(true);
    expect(cmBoardLine(b)).toBe('cl.bid.boardNothing');
    const fee = Math.round(g.clubs[mu].transferBudget * 2);
    expect(fee).toBeGreaterThan(b.budget);
    g.shortlist = g.shortlist.filter((id) => id !== koch.id);
    const r = act<TransferOffer | string>({ t: 'bid', pid: koch.id, fee, loan: false, swap: [], terms: { fee, months: 0, sellOn: 0, lgFee: 0, lgApps: 10, intFee: 0, intApps: 10, pub: 0, swap: [] } });
    expect(typeof r).toBe('object');
    expect((r as TransferOffer).fee).toBe(fee);
    expect(g.shortlist).toContain(koch.id);
    expect(myPendingBid(koch.id)?.id).toBe((r as TransferOffer).id);
  });

  it('Change Transfer Bid erstatter det ventende bud; Withdraw Transfer Bid trækker det tilbage', () => {
    const old = myPendingBid(koch.id)!;
    const fee = 500_000;
    const r = act<TransferOffer | string>({ t: 'bid', pid: koch.id, fee, loan: false, swap: [], change: true, terms: { fee, months: 6, sellOn: 0, lgFee: 0, lgApps: 10, intFee: 0, intApps: 10, pub: 0, swap: [] } });
    expect(typeof r).toBe('object');
    expect(old.status).toBe('withdrawn');
    const now = myPendingBid(koch.id)!;
    expect(now.fee).toBe(fee);
    expect(now.months).toBe(6);
    act({ t: 'withdraw', pid: koch.id });
    expect(myPendingBid(koch.id)).toBeUndefined();
  });

  it('accepteret over loftet, men inden for budget × 1,1: Confirm Transfer Offer (loftet er ikke en betingelse); over: Delay/Cancel', () => {
    // en spiller uden arbejdstilladelse: ellers står buddet først i 0x8c2f50's tilstand 0xa (tilladelsen afgøres, før Confirm Transfer Offer
    // kommer – cmPermitTalks.test.ts), og bekræftelsen kan ikke besvares endnu
    const p = squad(koch.club).find((x) => x.id !== koch.id && !cmNeedsPermit(g, x, mu, false))!;
    g.knowledge[p.id] = 0;
    const cap = cmBidBudget(g, p, mu)!.budget;
    const budget = g.clubs[mu].transferBudget;
    const mk = (fee: number): TransferOffer => {
      const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: mu, seller: p.club, fee, loan: false, status: 'negotiating', created: g.date, respondBy: g.date };
      g.offers.push(o);
      cmAgreed(o, p, { wage: 1000, years: 2 }, () => { throw new Error('skal ikke gennemføres endnu'); });
      return o;
    };
    // over loftet, under budgettet
    const a = mk(Math.round(Math.min(budget, cap * 2)));
    expect(a.fee).toBeGreaterThan(cap);
    const sa = cmConfirmScreen(g, a);
    expect(sa.code).toBe(0);
    expect(sa.key).toBe('cm.confirm.fee');
    a.status = 'withdrawn';
    // over budget × 1,1 → Delay Transfer Offer: Yes afvises, Delay venter en uge, Cancel trækker buddet tilbage
    const b = mk(Math.round(budget * 1.2));
    const sb = cmConfirmScreen(g, b);
    expect(sb.code).toBe(1);
    expect(sb.key).toBe('cm.confirm.funds');
    expect(cmConfirmAnswer(b, 'yes', () => { throw new Error('nej'); })).toBe('refused');
    expect(cmConfirmAnswer(b, 'delay', () => { throw new Error('nej'); })).toBe('delayed');
    b.cmTalks!.delayUntil = undefined;
    expect(cmConfirmAnswer(b, 'no', () => { throw new Error('nej'); })).toBe('withdrawn');
  });

  it('bytte-skærmen: kun de spillere, sælgeren vil tage – ellers originalens tekst', () => {
    SL_ON.on = true;
    const kl = koch.club;
    const r = exchangeList(mu, kl, koch.id);
    // alle på listen er Man Utd-spillere; en tom liste har altid en af originalens to tekster
    for (const id of r.ids) expect(g.players[id].club).toBe(mu);
    if (!r.ids.length) expect(['refused', 'noPlayers']).toContain(r.note);
    expect(r.ids.length).toBeLessThan(squad(mu).length);
    // (målt 16/11: Kaiserslautern, Millwall, Leeds, Grimsby siger nej til alle Man Utd's spillere – "are not interested in a part-exchange deal")
    expect(r.note).toBe('refused');
  });
});
