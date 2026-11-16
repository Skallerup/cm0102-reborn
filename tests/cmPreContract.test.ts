// Forkontrakt (Bosman) i januar som originalen: Set Role At Club først, spillerens svar som nyhed efter 1–5 dage, aftalen straks (ingen Confirm
// Transfer Offer), og bestyrelsens loft (ingen tilbud over loftet – UI'et gør Offer grå, serveren svarer 'budget').
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { processOffers, canPreContract } from '../src/game/transfers';
import { cmTalksDemand } from '../src/game/cmTransferTalks';
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
    // loftet: over bestyrelsens loft sendes intet
    const club = g.clubs[vejle];
    const budget = club.wageBudget;
    club.wageBudget = 1;
    expect(act({ t: 'negotiate', pid: p.id, wage: want.wage, years: 2 })).toBe('budget');
    expect(o.cmTalks!.state).toBe(0);
    club.wageBudget = budget + want.wage * 10;
    // et tilbud over kravet sendes (ikke afvist med det samme) og besvares først efter 1–5 dage
    expect(act({ t: 'negotiate', pid: p.id, wage: Math.round(want.wage * 2), years: 2, clauses: { signOn: want.signOn } })).toBe('cmSent');
    const due = o.cmTalks!.due!;
    expect(due > g.date).toBe(true);
    processOffers();
    expect(o.cmTalks!.state).toBe(1);
    const from = g.nextId.news;
    g.date = due;
    processOffers();
    const keys = g.news.filter((n) => n.id >= from).map((n) => n.key);
    expect(keys.some((k) => k === 'transfer.cmAgrees' || k === 'transfer.cmRejects')).toBe(true);
    if (o.status === 'completed') {
      // aftalen er indgået straks – spilleren kommer til klubben til sommer
      expect(p.contract!.futureClub).toBe(vejle);
      expect(p.club).not.toBe(vejle);
    } else expect(o.cmTalks!.state).toBe(4);
  });
});
