// Ejerens testfund 16/11, afsnit A (transfer/kontrakt/stab) – original database 3.9.60 i ægte tilstand, Vejle:
// A1 budskærmens bestyrelseslinje (0x598800 med kendskabet 0x5b02f0), A3 "no interest" ved krav ≥ 1,5 × loftet (0x4e06e0), A4 Set Role At Club
// (0x4cb990 med databasens jobkode) og lønkravet, A5 modbuddet besvares først efter 2 dage (0x8be9d0), A7 staben siger ja før Delay,
// A9 ingen ny kontrakt ved aftalt skifte (0x9b0964), A10 originalens svar på løn-/transferanmodningen (0x6a8810/0x6a9470).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { processOffers, offerRenewalLater, completeTransfer } from '../src/game/transfers';
import { addDays } from '../src/game/dates';
import { cmBidBudget, cmBoardLine, cmKnowledgeLevel } from '../src/game/cmBudget';
import { cmNoInterest, cmRoleExpected, cmTalksDemand } from '../src/game/cmTransferTalks';
import { cmDbJob, cmRolesFor, cmStaffDemand, cmStaffOffersDaily, cmOfferStaff } from '../src/game/cmStaff';
import { cmBoardRequest } from '../src/game/cmBoardGame';
import { termsOf } from '../src/game/cmTransferBid';
import { STAFF_LIMITS } from '../src/game/staff';
import type { TransferOffer } from '../src/game/types';

describe('ejerens fund 16/11 – afsnit A (3.9.60, ægte tilstand, Vejle)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const dk = world.nations.findIndex((n) => n.name === 'Denmark');
  const vejle = world.clubs.find((c) => c[1].startsWith('Vejle'))![0];
  createGame(world, { managerName: 'M S', managerNation: dk, clubId: vejle, activeNations: [dk], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const byLast = (last: string, club?: string) => Object.values(g.players).find((p) => p.last === last && (!club || g.clubs[p.club]?.name === club))!;

  it('A1: en ukendt spiller giver et lavere loft og "… because they don\'t know anything about this player"', () => {
    const p = byLast('Edwards', 'Leeds United');
    expect(cmKnowledgeLevel(g, p)).toBe(0);
    const b = cmBidBudget(g, p, vejle)!;
    expect(b.limited).toBe(true);
    expect(b.budget).toBeGreaterThan(0);
    expect(b.budget).toBeLessThan(g.clubs[vejle].transferBudget);
    expect(cmBoardLine(b)).toBe('cl.bid.boardNothing');
    // fuldt kendskab: intet loft
    g.knowledge[p.id] = 100;
    const k = cmBidBudget(g, p, vejle)!;
    expect(k.limited).toBe(false);
    expect(cmBoardLine(k)).toBe('cl.bid.board');
    delete g.knowledge[p.id];
  });

  it('A3: "no interest"-teksten efter trupstatussen (0x4e0ff9)', () => {
    const p = byLast('Tsigalko');
    const r = cmNoInterest(g, p, vejle);
    expect(r.key).toMatch(/^cm\.neg\.noInt(Terms|Rot|Backup|Prospect|Youth)(\.because)?$/);
  });

  it('A3b: Set Role At Club – den valgte rolle (ikke den gamle klubs status) styrer kravet, "no interest" og spillerens status ved underskrift', () => {
    const p = byLast('Tsigalko');
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: vejle, seller: p.club, fee: 0, loan: false, status: 'negotiating', created: g.date, respondBy: g.date, cmTalks: { rounds: 0, state: 0 } };
    g.offers.push(o);
    // forvalget er hans plads i KØBERENS trup
    const exp = cmRoleExpected(g, p, vejle);
    expect(['key', 'first', 'rotation', 'backup', 'prospect', 'young']).toContain(exp);
    // rollen ændrer kravet (0x85fc50 med trupstatus) og "no interest"-teksten
    const wages = (['key', 'backup', 'prospect'] as const).map((r) => cmTalksDemand(o, r)!.wage);
    expect(new Set(wages).size).toBeGreaterThan(1);
    expect(cmNoInterest(g, p, vejle, 'prospect').key).toMatch(/^cm\.neg\.noIntProspect|noIntTerms/);
    expect(cmNoInterest(g, p, vejle, 'backup').key).toMatch(/^cm\.neg\.noIntBackup|noIntTerms/);
    expect(cmNoInterest(g, p, vejle, 'rotation').key).toMatch(/^cm\.neg\.noIntRot|noIntTerms/);
    // actionen gemmer rollen på tilbuddet, og kravet bruger den
    expect(act({ t: 'cmOfferRole', pid: p.id, role: 'backup' })).toBe('ok');
    expect(o.cmRole).toBe('backup');
    expect(cmTalksDemand(o)!.wage).toBe(cmTalksDemand(o, 'backup')!.wage);
    // underskrift: spilleren får den valgte status
    completeTransfer(o, 1000, 2);
    expect(p.club).toBe(vejle);
    expect(p.squadStatus).toBe('backup');
  });

  it('A4: en ledig fysioterapeut (databasens job 10) kan tilbydes Physio, og kravet er ikke £0', () => {
    const s = Object.values(g.staff).find((x) => x.last === 'Terzi' && x.first === 'Augusto')!;
    expect(s).toBeTruthy();
    expect(s.club).toBe(0);
    expect(cmDbJob(s)).toBe(10);
    expect(cmRolesFor(s, g.date)).toContain('physio');
    expect(cmStaffDemand(s, 'assistant')).toBeGreaterThan(0);
    expect(cmStaffDemand(s, 'physio')).toBeGreaterThan(0);
  });

  it('A7: staben siger ja ("accepts … offer"), før Delay Transfer Offer kommer', () => {
    const s = Object.values(g.staff).find((x) => x.last === 'Terzi' && x.first === 'Augusto')!;
    const mine = Object.values(g.staff).filter((x) => x.club === vejle && x.role === 'physio').length;
    // fuld fysioterapeutstab → Delay
    for (let i = mine; i < STAFF_LIMITS.physio; i++) {
      const other = Object.values(g.staff).find((x) => !x.club && x.role === 'physio' && x.id !== s.id && !x.cmExtra)!;
      if (other) other.club = vejle;
    }
    if (Object.values(g.staff).filter((x) => x.club === vejle && x.role === 'physio').length < STAFF_LIMITS.physio) return;
    expect(cmOfferStaff(g, { staff: s.id, role: 'physio', wage: cmStaffDemand(s, 'physio') * 2, years: 2, signOn: 0 })).toBe('ok');
    const from = g.nextId.news;
    g.date = addDays(g.date, 1);
    cmStaffOffersDaily(g);
    const keys = g.news.filter((n) => n.id >= from).map((n) => n.key).reverse();
    if (keys.includes('cm.staffNoRoom')) expect(keys.indexOf('cm.staffAgrees')).toBeLessThan(keys.indexOf('cm.staffNoRoom'));
    expect(keys).not.toContain('cm.staffRejects');
  });

  it('A5: menneskets modbud på et computerbud besvares først efter 2 dage', () => {
    const p = squad(vejle).sort((a, b) => b.ca - a.ca)[0];
    const buyer = Object.values(g.clubs).find((c) => c.nation !== g.clubs[vejle].nation && c.rep > 60)!;
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: buyer.id, seller: vejle, fee: Math.max(100_000, p.value), loan: false, status: 'pending', created: g.date, respondBy: addDays(g.date, 5), maxFee: p.value * 3 };
    g.offers.push(o);
    const terms = { ...termsOf(o), fee: o.fee * 2 };
    const from = g.nextId.news;
    act({ t: 'respond', pid: p.id, buyer: buyer.id, action: 'counter', terms, changed: true });
    expect(o.status).toBe('countered');
    expect(g.news.filter((n) => n.id >= from).map((n) => n.key)).not.toContain('transfer.aiFinalOffer');
    const d0 = g.date;
    g.date = addDays(d0, 1); processOffers();
    expect(o.status).toBe('countered');
    g.date = addDays(d0, 2); processOffers();
    expect(['pending', 'withdrawn']).toContain(o.status);
    const keys = g.news.filter((n) => n.id >= from).map((n) => n.key);
    expect(keys.some((k) => k === 'transfer.aiFinalOffer' || k === 'transfer.aiWithdrew')).toBe(true);
    g.date = d0;
  });

  it('A9: ingen ny kontrakt til en spiller med aftalt skifte', () => {
    const p = squad(vejle)[0];
    const other = Object.values(g.clubs).find((c) => c.id !== vejle)!;
    p.contract!.futureClub = other.id;
    expect(offerRenewalLater(p.id, p.contract!.wage, 2)).toBe('refused');
    p.contract!.futureClub = undefined;
    expect(offerRenewalLater(p.id, p.contract!.wage, 2)).toBe('pending');
    g.pendingRenewals = [];
  });

  it('A10: løn- og transferanmodningen svarer med originalens tekster (ikke "raised the wage budget by 9%")', () => {
    const from = g.nextId.news;
    const w = cmBoardRequest(g, 4);
    const tr = cmBoardRequest(g, 3);
    for (const r of [w, tr]) expect(typeof r).toBe('string');
    const keys = g.news.filter((n) => n.id >= from).map((n) => n.key);
    expect(keys).not.toContain('board.requestOk');
    expect(keys.every((k) => k === 'board.cm')).toBe(true);
    expect(String(w)).toMatch(/wage structure|dismissed your request|Vejle/);
  });
});
