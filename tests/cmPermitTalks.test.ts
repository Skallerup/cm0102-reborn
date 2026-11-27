// CM 01/02: arbejdstilladelsen i menneskets køb (ejeren 27/11: "Tsigalko accepts Man Utd offer", men han kom aldrig – handlen faldt tavst, fordi
// tilladelsen blev nægtet ved bekræftelsen, og nyheden var slået fra). Originalen: 0x8c2f50 (tilstand 0xa, 0x12 + rand(7) dage, nyheden 0x8e2a00)
// → 0x8c7690 (afslag: nyheden 0x8de790 grund 0x13, buddet falder; givet: 0x8e3130 og Confirm Transfer Offer).
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmAcceptBid, cmAgreed, cmConfirmOpen, cmTalksDaily } from '../src/game/cmTransferTalks';
import { cmCompleteAgreed } from '../src/game/transfers';
import { cmEuCitizen, cmNeedsPermit, cmWorkPermit } from '../src/game/cmPermit';
import { newsBody } from '../src/ui/screens/common';
import { offInOriginal } from '../src/game/newsFilter';
import type { Player, TransferOffer } from '../src/game/types';
import { en } from '../src/i18n/en';

describe('arbejdstilladelsen før bekræftelsen (0x8c2f50 → 0x8c7690)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  function agree(p: Player, rounds = 0): TransferOffer {
    const g = gs();
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: mu, seller: p.club, fee: p.value, loan: false, status: 'pending', created: g.date, respondBy: g.date };
    g.offers.push(o);
    cmAcceptBid(o, p);
    o.status = 'negotiating';
    o.cmTalks = { ...(o.cmTalks ?? { rounds: 0, state: 0 }), rounds };
    cmAgreed(o, p, { wage: 2000, years: 3 }, cmCompleteAgreed);
    return o;
  }

  it('Tsigalko (Hviderusland): udsat, afslag med originalens nyhed – ingen tavs aftale', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const p = Object.values(g.players).find((x) => x.last === 'Tsigalko')!;
    expect(cmNeedsPermit(g, p, mu, false)).toBe(true);
    const from = g.nextId.news;
    const o = agree(p);
    expect(o.cmTalks!.state).toBe(10);
    expect(cmConfirmOpen(g, o)).toBe(false);
    const due = o.cmTalks!.permitDue!;
    const days = Math.round((Date.parse(due) - Date.parse(g.date)) / 864e5);
    expect(days).toBeGreaterThanOrEqual(18);
    expect(days).toBeLessThanOrEqual(24);
    expect(g.news.filter((n) => n.id >= from).map((n) => n.key)).toContain('transfer.cmPermitWait');
    const granted = cmWorkPermit(g, p, { club: mu, wageGbp: 2000, expires: '2005-06-30' }, null);
    g.date = due;
    cmTalksDaily(o, cmCompleteAgreed);
    const keys = g.news.filter((n) => n.id >= from).map((n) => n.key);
    if (granted) {
      expect(keys).toContain('transfer.cmPermitOk');
      expect(cmConfirmOpen(g, o)).toBe(true);
    } else {
      expect(keys).toContain('transfer.cmPermit');
      expect(o.status).toBe('collapsed');
      expect(p.club).not.toBe(mu);
    }
  });

  it('EU-spiller: ingen tilladelse, bekræftelsen straks; runde > 0 springer tilladelsen over (+0x2e ≠ 0)', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const eu = Object.values(g.players).find((x) => x.club && x.club !== mu && g.clubs[x.club]?.nation === eng && !cmNeedsPermit(g, x, mu, false))!;
    const a = agree(eu);
    expect(a.cmTalks!.state).toBe(5);
    expect(cmConfirmOpen(g, a)).toBe(true);
    const p = Object.values(g.players).find((x) => x.last === 'Tsigalko')!;
    const b = agree(p, 1);
    expect(b.cmTalks!.state).toBe(5);
    expect(b.cmTalks!.permitDone).toBe(true);
  });

  it('nyhederne vises i det originale spil og har exe-teksterne', () => {
    for (const k of ['transfer.cmPermit', 'transfer.cmPermitFree', 'transfer.cmPermitWait', 'transfer.cmPermitOk']) expect(offInOriginal(k)).toBe(false);
    const t = en;
    expect(t['transfer.cmPermit']).toBe('{last} fails to get work permit');
    expect(t['transfer.cmPermit.body']).toContain('has collapsed due to him not being given a work permit.');
  });
});

// 0x8c7470 (byttespillerne: 0x8c7560(bytte, sælger, 0)) → nyheden 0x8e2a00's varianter (0x8e2cd0); 0x8c7690 0x8c7829: byttespilleren uden tilladelse
// fjernes fra buddet, beløbet + hans værdi, nyheden 0x8e35a0 (0xfbb) – handlen falder ikke
describe('byttespillernes arbejdstilladelse (0x8c7470/0x8c7690 → 0x8e35a0)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  function setup(strong: boolean) {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    // hovedspilleren: EU-spiller i en anden engelsk klub (skal ikke have tilladelse)
    const p = Object.values(g.players).find((x) => x.club && x.club !== mu && g.clubs[x.club]?.nation === eng && !x.loan && !cmNeedsPermit(g, x, mu, false))!;
    // byttespilleren: uden for EU, uden post i historikken; svag (under 5 landskampe → afslag) eller stjerne (verdensomdømme > 8500 → givet)
    const age = (x: Player) => +g.date.slice(0, 4) - +x.dob.slice(0, 4);
    const x = Object.values(g.players).find((y) => y.club && y.club !== mu && y.club !== p.club && !y.loan && y.contract && !cmEuCitizen(g, y)
      && (strong ? (y.cmRepMem ?? y.cmRep)?.[2] ? (y.cmRepMem ?? y.cmRep)![2] * 50 > 8600 : y.rep * 100 > 8600 : (y.caps ?? 0) < 5 && age(y) > 25 && y.pa <= 190 && y.rep < 60))!;
    x.club = mu;
    if (g.cmPermit) delete g.cmPermit[x.id];
    expect(cmNeedsPermit(g, x, p.club, false)).toBe(true);
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: mu, seller: p.club, fee: 1_000_000, loan: false, status: 'pending', created: g.date, respondBy: g.date, swap: [x.id] };
    g.offers.push(o);
    cmAcceptBid(o, p);
    o.status = 'negotiating';
    o.cmTalks = { ...(o.cmTalks ?? { rounds: 0, state: 0 }), rounds: 0 };
    // sælgerens kontrakttilbud til byttespilleren (0x4cc9e0) – her det aftalte
    o.cmSwapTalks = { [x.id]: { rounds: 0, state: 5, agreed: { wage: 1000, years: 2 } } };
    const from = g.nextId.news;
    cmAgreed(o, p, { wage: 2000, years: 3 }, cmCompleteAgreed);
    return { g, p, x, o, from };
  }

  it('udsat for byttespilleren alene: "… a work permit for <bytte>"; afslag → ude af buddet, beløbet + værdien, handlen lever', () => {
    const { g, x, o, from } = setup(false);
    expect(o.cmTalks!.state).toBe(10);
    const wait = g.news.find((n) => n.id >= from && n.key === 'transfer.cmPermitWait')!;
    expect(wait.params.w).toBe('for');
    expect(newsBody(wait)).toMatch(/awaiting a decision to grant a work permit for .+\.$/);
    const fee0 = o.fee;
    g.date = o.cmTalks!.permitDue!;
    cmTalksDaily(o, cmCompleteAgreed);
    const out = g.news.find((n) => n.id >= from && n.key === 'transfer.cmPermitSwap')!;
    expect(out).toBeTruthy();
    expect(out.params.fee).toBe(fee0 + x.value);
    expect(newsBody(out)).toMatch(x.value > 0 ? /has been removed from the part exchange offer for .+ work permit\.\n\nThe transfer fee will be adjusted to .+\.$/ : /work permit$/);
    expect(o.swap).toBeUndefined();
    expect(o.fee).toBe(fee0 + x.value);
    expect(o.status).toBe('negotiating');
    expect(o.cmTalks!.state).toBe(5);
    expect(cmConfirmOpen(g, o)).toBe(true);
  });

  it('stjerne som byttespiller: tilladelsen gives med nyheden 0x8e3130 (hans klub → sælgeren)', () => {
    const { g, x, o, from } = setup(true);
    expect(o.cmTalks!.state).toBe(10);
    g.date = o.cmTalks!.permitDue!;
    cmTalksDaily(o, cmCompleteAgreed);
    const ok = g.news.find((n) => n.id >= from && n.key === 'transfer.cmPermitOk')!;
    expect(ok.params.seller).toBe(g.clubs[mu].short || g.clubs[mu].name);
    expect(o.swap).toEqual([x.id]);
  });

  it('exe-teksterne (0xa9d25c, 0xa9cfc8, 0xa9d550/0xa9d660)', () => {
    expect(en['transfer.cmPermitWait.for']).toBe('The proposed transfer of {player} from {seller} to {buyer} has been delayed for a few weeks awaiting a decision to grant a work permit for {player2}.');
    expect(en['transfer.cmPermitWait.all']).toContain('awaiting decisions to grant work permits for players involved in the transfer.');
    expect(en['transfer.cmPermitSwap.bodyFee']).toContain('has been removed from the part exchange offer for');
    expect(offInOriginal('transfer.cmPermitSwap')).toBe(false);
  });
});
