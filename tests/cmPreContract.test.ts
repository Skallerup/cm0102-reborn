// Forkontrakt (Bosman) i januar som originalen: Set Role At Club først, spillerens svar som nyhed efter 1–5 dage, så menneskets Confirm Transfer
// Offer (0x8f2ec0 – ejerens fund 25/11), og bestyrelsens loft (ingen tilbud over loftet – UI'et gør Offer grå, serveren svarer 'budget').
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// common.tsx trækker analytics.ts med (window ved indlæsning) – i Node en tom stand-in
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });

import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { processOffers, canPreContract, cmCompleteAgreed } from '../src/game/transfers';
import { cmAgreed, cmConfirmOpen, cmConfirmScreen, cmTalksDemand } from '../src/game/cmTransferTalks';
import { newsBody } from '../src/ui/screens/common';
import { t } from '../src/i18n';
import { cmBoardWageAllow } from '../src/game/cmBudget';
import type { TransferOffer } from '../src/game/types';

describe('forkontrakt som originalen (3.9.60, ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const dk = world.nations.findIndex((n) => n.name === 'Denmark');
  const vejle = world.clubs.find((c) => c[1].startsWith('Vejle'))![0];
  createGame(world, { managerName: 'M S', managerNation: dk, clubId: vejle, activeNations: [dk], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  g.date = '2002-01-12';
  const p = Object.values(g.players).find((x) => x.club && x.club !== vejle && x.contract && x.ca > 90 && squad(x.club).length > 20)!;
  p.contract!.expires = '2002-06-30';

  it('en forkontrakt starter uden frist og med forhandlingsforløbet (rolle først, svar som nyhed)', () => {
    expect(canPreContract(p)).toBe(true);
    const o = act({ t: 'preContract', pid: p.id }) as TransferOffer;
    expect(o.preContract).toBe(true);
    expect(o.cmTalks).toEqual({ rounds: 0, state: 0 });
    expect(act({ t: 'cmOfferRole', pid: p.id, role: 'rotation' })).toBe('ok');
    expect(o.cmRole).toBe('rotation');
    const want = cmTalksDemand(o)!;
    expect(want.wage).toBeGreaterThan(0);
    // loftet: over bestyrelsens loft (get_max_wage 0x5968d0 – cmBudget.ts) sendes intet
    const allow = cmBoardWageAllow(g, p, vejle, 'rotation')!;
    expect(act({ t: 'negotiate', pid: p.id, wage: Math.round(allow + 1000), years: 2 })).toBe('budget');
    expect(o.cmTalks!.state).toBe(0);
    // et tilbud på loftet sendes (originalen klemmer lønnen til loftet 0x4e1329) (ikke afvist med det samme) og besvares først efter 1–5 dage
    expect(act({ t: 'negotiate', pid: p.id, wage: Math.floor(allow), years: 2, clauses: { signOn: want.signOn } })).toBe('cmSent');
    const due = o.cmTalks!.due!;
    expect(due > g.date).toBe(true);
    processOffers();
    expect(o.cmTalks!.state).toBe(1);
    const from = g.nextId.news;
    g.date = due;
    processOffers();
    const keys = g.news.filter((n) => n.id >= from).map((n) => n.key);
    expect(keys.some((k) => k === 'transfer.cmAgrees' || k === 'transfer.cmRejects')).toBe(true);
    // ja: aftalen venter på menneskets Confirm Transfer Offer (tilstand 5); nej: tilstand 4
    expect([4, 5]).toContain(o.cmTalks!.state);
    expect(p.contract!.futureClub).toBeUndefined();
  });

  it('ja → Confirm Transfer Offer "Sign X from Y?" → Yes: aftalen, nyheden "{Club} to sign X" med brødtekst, skiftet ved udløbet; No trækker den', () => {
    const [q, r] = Object.values(g.players).filter((x) => x.club && x.club !== vejle && x !== p && x.contract && !x.contract.futureClub && x.ca > 80).slice(0, 2);
    for (const x of [q, r]) x.contract!.expires = '2002-06-30';
    const mk = (x: typeof q) => {
      const o = act({ t: 'preContract', pid: x.id }) as TransferOffer;
      expect(act({ t: 'cmOfferRole', pid: x.id, role: 'rotation' })).toBe('ok');
      const w = cmTalksDemand(o)!;
      expect(act({ t: 'negotiate', pid: x.id, wage: Math.min(w.wage, Math.floor(cmBoardWageAllow(g, x, vejle, 'rotation')!)), years: 2 })).toBe('cmSent');
      // tidsnibble 3 med kontraktens udløb (0x4e5192–0x4e51d0); Danmark har intet vindue den 30/6 → 4 (første dag i vinduet)
      expect([3, 4]).toContain(o.cmTime);
      expect(o.cmUntil).toBe('2002-06-30');
      const from = g.nextId.news;
      cmAgreed(o, x, { wage: w.wage, years: 2 }, cmCompleteAgreed);
      const agrees = g.news.find((n) => n.id >= from && n.key === 'transfer.cmAgrees')!;
      expect(agrees.link).toEqual({ kind: 'offer', id: o.id });
      expect(o.status).toBe('negotiating');
      expect(x.contract!.futureClub).toBeUndefined();
      expect(cmConfirmOpen(g, o)).toBe(true);
      const sc = cmConfirmScreen(g, o);
      expect(sc.code).toBe(0);   // dato efter i dag (0x8cfd31) – intet vindue eller penge spørges
      expect(sc.key).toBe('cm.confirm.free');
      expect(t(sc.key, sc.params)).toBe(`Sign ${sc.params.player} from ${sc.params.club}?`);
      return o;
    };
    const o = mk(q);
    const from = g.nextId.news;
    expect(act({ t: 'cmConfirm', offer: o.id, answer: 'yes' })).toBe('completed');
    expect(o.status).toBe('completed');
    expect(q.contract!.futureClub).toBe(vejle);
    const n = g.news.find((x) => x.id >= from && x.key === 'transfer.cmAgreed')!;
    expect(n.params.to).toBe(g.clubs[vejle].short || g.clubs[vejle].name);
    expect(newsBody(n)).toMatch(/^The transfer of .+ to .+ from .+ has been agreed\.\n\nThe transfer will go through on \d+(st|nd|rd|th) \w+ 2002\.$/);
    expect(g.news.some((x) => x.id >= from && x.key === 'transfer.preContract')).toBe(false);

    const o2 = mk(r);
    expect(act({ t: 'cmConfirm', offer: o2.id, answer: 'no' })).toBe('withdrawn');
    expect(r.contract!.futureClub).toBeUndefined();
    expect(cmConfirmOpen(g, o2)).toBe(false);
  });
});
