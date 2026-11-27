// CM 01/02: arbejdstilladelsen i menneskets køb (ejeren 27/11: "Tsigalko accepts Man Utd offer", men han kom aldrig – handlen faldt tavst, fordi
// tilladelsen blev nægtet ved bekræftelsen, og nyheden var slået fra). Originalen: 0x8c2f50 (tilstand 0xa, 0x12 + rand(7) dage, nyheden 0x8e2a00)
// → 0x8c7690 (afslag: nyheden 0x8de790 grund 0x13, buddet falder; givet: 0x8e3130 og Confirm Transfer Offer).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmAcceptBid, cmAgreed, cmConfirmOpen, cmTalksDaily } from '../src/game/cmTransferTalks';
import { cmCompleteAgreed } from '../src/game/transfers';
import { cmNeedsPermit, cmWorkPermit } from '../src/game/cmPermit';
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
