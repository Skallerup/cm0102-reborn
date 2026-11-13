// CM 01/02's transferbud (cm0102.exe 3.9.68) – cmTransferBid.ts: budskærmen 0x8ec420, vurderingen 0x8e7b50, computerens svar 0x8c8090,
// klausul-muligheden 0x8c8fd0, afvisningsbegrundelserne 0x8c5560/0x8c5800/0x8ce0e0 og betalingerne 0x8ca8a0/0x8caee0/0x8c39f0.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  GBP, addSwap, aiRespond, bidAct, cashStep, clauseOption, fromGbp, newTerms, reasonForStatus, rejectReasonValid, removeSwap, sameTerms,
  statusForReason, statusSatisfaction, stepDown, stepUp, toGbp, totalValue, weightedValue, type BidTerms, type ValueCtx,
} from '../src/game/cmTransferBid';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { cmAppsAfterMatch, cmMonthlyInstalments, completeTransfer } from '../src/game/transfers';
import type { TransferOffer } from '../src/game/types';

const gbp = (n: number) => fromGbp(n);
const base = (o: Partial<BidTerms> = {}): BidTerms => ({ fee: gbp(1_000_000), months: 0, sellOn: 0, lgFee: 0, lgApps: 10, intFee: 0, intApps: 10, pub: 0, swap: [], ...o });
const ctx = (o: Partial<ValueCtx> = {}): ValueCtx => ({ value: 2_000_000, A: 120, B: 150, age: 22, caps: 0, nationRep: 5000, band: 2, swapValue: () => 0, ...o });

describe('beløbene (Cash 0x43f4e0/0x43f580, trinnet 0x4426e0)', () => {
  it('trinnet efter beløbet i pund', () => {
    expect([10_000, 20_000, 60_000, 200_000, 900_000, 3_000_000, 15_000_000, 40_000_000, 60_000_000].map(cashStep))
      .toEqual([1000, 2000, 5000, 10_000, 25_000, 100_000, 250_000, 500_000, 1_000_000]);
  });
  it('+ lægger trinnet over x + 1 til, − trækker trinnet fra (afrundet først)', () => {
    expect(toGbp(stepUp(gbp(10_000)))).toBe(12_000);
    expect(toGbp(stepDown(gbp(12_000)))).toBe(10_000);
    expect(toGbp(stepDown(gbp(10_000)))).toBe(9_000);
    expect(toGbp(stepUp(gbp(2_700_000)))).toBe(2_800_000);
    expect(toGbp(stepUp(gbp(1_000_000)))).toBe(1_100_000);
    expect(toGbp(stepDown(gbp(1_000_000)))).toBe(975_000);
    expect(GBP).toBe(0.86);
  });
});

describe('budskærmens knapper (0x8ec420)', () => {
  it('Monthly Installments: grå indtil klik → 6; ±6 mellem 6 og 24; fra og til igen husker værdien', () => {
    let t = base();
    t = bidAct(t, 'instUp', 0); expect(t.months).toBe(6);
    t = bidAct(t, 'instDown', 0); expect(t.months).toBe(6);
    for (let i = 0; i < 5; i++) t = bidAct(t, 'instUp', 0);
    expect(t.months).toBe(24);
    t = bidAct(t, 'instDown', 0); expect(t.months).toBe(18);
    t = bidAct(t, 'inst', 0); expect(t.months).toBe(-18);
    t = bidAct(t, 'inst', 0); expect(t.months).toBe(18);
  });
  it('Percentage of Next Sale: 0 → 10, ±5 mellem 5 og 25', () => {
    let t = bidAct(base(), 'sell', 0); expect(t.sellOn).toBe(10);
    t = bidAct(bidAct(t, 'sellDown', 0), 'sellDown', 0); expect(t.sellOn).toBe(5);
    for (let i = 0; i < 6; i++) t = bidAct(t, 'sellUp', 0);
    expect(t.sellOn).toBe(25);
  });
  it('Fee after N League Apps.: slås til med max(£1000, 0,25 · værdien); N går 10 → 20 … 50 → 1 → 10', () => {
    let t = bidAct(base(), 'lg', gbp(5_250_000 * 4));
    expect(toGbp(t.lgFee)).toBe(5_250_000);
    expect(toGbp(bidAct(base(), 'int', gbp(2000)).intFee)).toBe(1000);
    const ns = [];
    for (let i = 0; i < 6; i++) { t = bidAct(t, 'lgN', 0); ns.push(t.lgApps); }
    expect(ns).toEqual([20, 30, 40, 50, 1, 10]);
  });
  it('offentligt: Nej ↔ Ja; låst Ja (1) kan ikke ændres', () => {
    expect(bidAct(base(), 'pub', 0).pub).toBe(2);
    expect(bidAct(base({ pub: 2 }), 'pub', 0).pub).toBe(0);
    expect(bidAct(base({ pub: 1 }), 'pub', 0).pub).toBe(1);
  });
  it('Exchange trækker spillerens værdi fra beløbet (≥ 0), Remove lægger den til igen', () => {
    let t = addSwap(base({ fee: gbp(2_700_000) }), 7, gbp(3_300_000));
    expect(t.fee).toBe(0);
    expect(t.swap).toEqual([7]);
    t = removeSwap(t, 7, gbp(3_300_000));
    expect(toGbp(t.fee)).toBe(3_300_000);
    expect(sameTerms(base(), base())).toBe(true);
    expect(sameTerms(base(), bidAct(base(), 'sell', 0))).toBe(false);
  });
});

describe('vurderingen (0x8e7a70 / 0x8e7b50)', () => {
  it('total: beløb + klausulbeløb + bytte', () => {
    const t = base({ lgFee: gbp(500_000), intFee: gbp(250_000), swap: [1] });
    expect(totalValue(t, ctx({ swapValue: () => 300_000 }), false, false, false)).toBe(2_050_000);
  });
  it('rater: sælgerens formuebånd (−2 → ·0,1, 0 og 18 mdr. → ·0,4, 2 → intet)', () => {
    const t = base({ months: 18 });
    expect(weightedValue(t, ctx({ band: -2 }), false, false, true, true)).toBe(100_000);
    expect(weightedValue(t, ctx({ band: 0 }), false, false, true, true)).toBe(400_000);
    expect(weightedValue(t, ctx({ band: 2 }), false, false, true, true)).toBe(1_000_000);
  });
  it('ligakampe: (1 − N·0,005)·beløb; videresalg kun når A < 0,8·B', () => {
    expect(weightedValue(base({ fee: 0, lgFee: gbp(1_000_000), lgApps: 20 }), ctx(), false, false, true, true)).toBe(900_000);
    // 20 %, værdi 2M, (B − A)/33 = 30/33 → 2M·20·30/33·0,01
    expect(weightedValue(base({ fee: 0, sellOn: 20 }), ctx({ A: 100, B: 130 }), false, false, true, true)).toBe(Math.trunc(2_000_000 * 20 * 30 * (1 / 33) * 0.01));
    expect(weightedValue(base({ fee: 0, sellOn: 20 }), ctx({ A: 120, B: 140 }), false, false, true, true)).toBe(0);
  });
  it('landskampe: kun uden landskampe, under 28 år og når 65·B > nationens omdømme; højst 0,75', () => {
    const t = base({ fee: 0, intFee: gbp(1_000_000) });
    expect(weightedValue(t, ctx({ caps: 3 }), false, false, true, true)).toBe(0);
    expect(weightedValue(t, ctx({ age: 28 }), false, false, true, true)).toBe(0);
    // alder 24, N 10, 65·150 − 5000 = 4750 → 4750/750 + 0,3 = 6,63 → loftet 0,75
    expect(weightedValue(t, ctx({ age: 24 }), false, false, true, true)).toBe(750_000);
  });
});

describe('computerens svar (0x8c8090) og klausul-muligheden (0x8c8fd0)', () => {
  const clause = { buyerRep: 9000, sellerRep: 5000, paGap: 30, rep: 4000 };
  it('accept når 0,85 · mulighedens værdi < buddets', () => {
    const r = aiRespond(base({ fee: gbp(1_000_000) }), ctx(), { asking: 1_100_000, rivals: [], unwanted: false, final: false, base: base({ fee: 0 }), clause });
    expect(r.kind).toBe('accept');
  });
  it('modbud når buddet er for lavt men over 0,75 · muligheden; et endeligt bud afvises', () => {
    const r = aiRespond(base({ fee: gbp(800_000) }), ctx(), { asking: 1_000_000, rivals: [], unwanted: false, final: false, base: base({ fee: 0 }), clause: { ...clause, buyerRep: 5000 } });
    expect(r.kind).toBe('counter');
    if (r.kind === 'counter') expect(toGbp(r.terms.fee)).toBe(1_000_000);
    expect(aiRespond(base({ fee: gbp(800_000) }), ctx(), { asking: 1_000_000, rivals: [], unwanted: false, final: true, base: base({ fee: 0 }), clause }).kind).toBe('reject');
  });
  it('"totally unacceptable" (10): under 55 % af værdien og mere end £2M under', () => {
    const r = aiRespond(base({ fee: gbp(100_000) }), ctx({ value: 5_000_000 }), { asking: 5_000_000, rivals: [], unwanted: false, final: false, base: base({ fee: 0 }), clause });
    expect(r).toEqual({ kind: 'reject', reason: 10 });
  });
  it('klausul-muligheden: ligakampe (0,3·fee efter 20, fee·0,8, appel 60) for en mindre spiller hos en større køber', () => {
    const o = clauseOption(base({ fee: gbp(1_000_000) }), ctx({ nationRep: 4000 }), clause)!;
    expect(o.appeal).toBe(60);
    expect(toGbp(o.terms.fee)).toBe(800_000);
    expect(toGbp(o.terms.lgFee)).toBe(300_000);
    expect(o.terms.lgApps).toBe(20);
    expect(clauseOption(base(), ctx({ age: 31 }), clause)).toBeNull();
    expect(clauseOption(base(), ctx(), { ...clause, paGap: 20 })).toBeNull();
  });
});

describe('afvisningsbegrundelserne (0x8c5560, 0x8c5800, 0x8c54c0, 0x8ce0e0)', () => {
  it('gyldighed og trupstatus', () => {
    expect(rejectReasonValid('prospect', 23, false, false)).toBe(true);
    expect(rejectReasonValid('prospect', 24, false, false)).toBe(false);
    expect(rejectReasonValid('division', 25, false, false)).toBe(false);
    expect(rejectReasonValid('division', 25, true, false)).toBe(true);
    expect(rejectReasonValid('unacceptable', 25, true, true)).toBe(false);
    expect(['none', 'indispensable', 'important', 'prospect', 'division'].map((k) => statusForReason(k as never, 3))).toEqual([3, 1, 2, 5, 3]);
    expect([1, 2, 3, 4, 5].map(reasonForStatus)).toEqual(['indispensable', 'important', 'none', 'none', 'prospect']);
  });
  it('tilfredsheden: uden status før +100/+50/+25 (−100 når buddet var ændret); lavere status −25 pr. trin', () => {
    expect(statusSatisfaction(0, 0, 1, false)).toBe(100);
    expect(statusSatisfaction(0, 0, 2, false)).toBe(50);
    expect(statusSatisfaction(0, 0, 1, true)).toBe(-100);
    expect(statusSatisfaction(0, 0, 5, true)).toBe(-50);
    expect(statusSatisfaction(10, 1, 3, false)).toBe(-40);
    expect(statusSatisfaction(10, 3, 4, false)).toBe(-40);
    expect(statusSatisfaction(10, 3, 1, false)).toBe(10);
  });
});

describe('i spillet (3.9.60, ægte tilstand)', { timeout: 120_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  it('afvisning med "indispensable": trupstatus Key, tilfredsheden +100, intet svar fra spilleren', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const p = squad(mu).sort((a, b) => b.ca - a.ca)[3];
    p.squadStatus = undefined; if (p.cmContract) { p.cmContract.b44 = 0; if (p.cmContract.b4f !== undefined) p.cmContract.b4f &= 0xf; }
    const buyer = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!;
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: buyer.id, seller: mu, fee: p.value, loan: false, status: 'pending', created: g.date, respondBy: g.date };
    g.offers.push(o);
    const before = g.news.length;
    act({ t: 'respond', pid: p.id, buyer: buyer.id, action: 'reject', rejectKey: 'indispensable', changed: false });
    expect(o.status).toBe('rejected');
    expect(p.squadStatus).toBe('key');
    expect(p.cmContract?.b44).toBe(100);
    expect(g.news.slice(before).some((n) => n.key.startsWith('reject.r.'))).toBe(false);
  });
  it('køb med rater og klausuler: første rate nu, resten hver måned; beløbet efter N kampe betales ved N', () => {
    const g = gs();
    const seller = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!;
    const p = squad(seller.id).sort((a, b) => b.ca - a.ca)[5];
    const t = newTerms(g, p, mu, gbp(1_200_000));
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: mu, seller: seller.id, fee: t.fee, loan: false, status: 'negotiating', created: g.date, respondBy: g.date,
      months: 12, lgFee: gbp(120_000), lgApps: 2, sellOn: 15 };
    const b0 = g.clubs[mu].balance, s0 = seller.balance;
    completeTransfer(o, 1000, 3);
    const first = fromGbp(100_000);
    expect(g.clubs[mu].balance).toBe(b0 - first);
    expect(seller.balance).toBe(s0 + first);
    expect(g.cmInstalments?.find((r) => r.player === p.id)?.left).toBe(11);
    cmMonthlyInstalments();
    expect(seller.balance).toBe(s0 + 2 * first);
    expect(p.sellOn).toEqual({ club: seller.id, pct: 15, base: 0 });
    cmAppsAfterMatch(p, 'lg');
    expect(p.cmApps?.[0].left).toBe(1);
    const s1 = seller.balance;
    cmAppsAfterMatch(p, 'lg');
    expect(p.cmApps).toBeUndefined();
    expect(seller.balance).toBe(s1 + fromGbp(120_000));
  });
});
