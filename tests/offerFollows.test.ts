// Spillerfejl 27/11: (a) efter et køb stod en anden klubs bud på spilleren stadig som aktivt; (b) to accepterede bud på samme spiller solgte
// ham to gange. Originalens bud har ingen sælger – sælgeren er altid spillerens kontraktklub (0x4cf5a0 i 0x8c63a0/0x8c9390/0x8c47d0), så
// buddene følger spilleren (offerLive.ts): et computerbud til den gamle klub er nu et bud til mennesket; bud til mennesket på en spiller, han
// har solgt, er ikke længere hans at svare på.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { completeTransfer, playerInterest, respondToOffer } from '../src/game/transfers';
import { dropStaleOffers, offerLive } from '../src/game/offerLive';
import { isHumanClub } from '../src/game/humans';
import { repairStaleOffers } from '../src/game/save';
import type { Player, TransferOffer } from '../src/game/types';

describe('bud på en spiller, der skifter klub (3.9.68, ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  const bid = (p: Player, buyer: number, seller: number, extra: Partial<TransferOffer> = {}): TransferOffer => {
    const g = gs();
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer, seller, fee: Math.round(p.value / 2), loan: false, status: 'pending', created: g.date, respondBy: g.date, final: true, ...extra };
    g.offers.push(o);
    return o;
  };

  it('mennesket accepterer to bud: spilleren sælges kun én gang, det andet bud trækkes', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const buyers = Object.values(g.clubs).filter((c) => c.id !== mu && c.league === g.clubs[mu].league);
    const p = squad(mu).sort((a, b) => b.ca - a.ca).slice(12, 30).find((q) => buyers.filter((b) => playerInterest(q, b) === 'yes').length >= 2)!;
    const [b1, b2] = buyers.filter((b) => playerInterest(p, b) === 'yes');
    const o1 = bid(p, b1.id, mu), o2 = bid(p, b2.id, mu);
    const bal = g.clubs[mu].balance;
    respondToOffer(o1.id, 'accept', undefined, undefined, undefined, {});
    expect(o1.status).toBe('completed');
    expect(p.club).toBe(b1.id);
    const got = g.clubs[mu].balance - bal;
    expect(got).toBeGreaterThan(0);
    // det andet bud var til menneskets klub – nu står spilleren hos en computerklub: trukket, kan ikke accepteres
    expect(o2.status).toBe('withdrawn');
    respondToOffer(o2.id, 'accept', undefined, undefined, undefined, {});
    expect(p.club).toBe(b1.id);
    expect(g.clubs[mu].balance - bal).toBe(got);
    // et bud med forældet sælger gennemføres aldrig (vagten i completeTransfer)
    const o3 = bid(p, b2.id, mu, { status: 'negotiating' });
    expect(completeTransfer(o3, 1000, 2)).toBe(false);
    expect(p.club).toBe(b1.id);
    expect(squad(b2.id).some((q) => q.id === p.id)).toBe(false);
    expect(squad(mu).some((q) => q.id === p.id)).toBe(false);
  });

  it('mennesket køber: et andet klubs ventende bud følger spilleren og er nu et bud til mennesket; forhandlinger med den gamle klub falder', () => {
    const g = gs();
    const sellers = Object.values(g.clubs).filter((c) => c.id !== mu && c.league === g.clubs[mu].league);
    const s = sellers[3];
    const q = squad(s.id).filter((x) => !x.loan).sort((a, b) => b.ca - a.ca)[2];
    const other = sellers.find((c) => c.id !== s.id)!, third = sellers.find((c) => c.id !== s.id && c.id !== other.id)!;
    const x = bid(q, other.id, s.id, { cmAi: true, cmTime: 0, respondBy: g.date });
    const y = bid(q, third.id, s.id, { cmAi: true, status: 'countered' });
    const mine = bid(q, mu, s.id, { status: 'negotiating' });
    expect(completeTransfer(mine, 1000, 3)).toBe(true);
    expect(q.club).toBe(mu);
    expect(x.status).toBe('pending');
    expect(x.seller).toBe(mu);
    expect(x.cmAi).toBeUndefined();
    expect(offerLive(g, x)).toBe(true);
    expect(y.status).toBe('collapsed');
    // mennesket kan svare på det (afvise)
    respondToOffer(x.id, 'reject', undefined, undefined, undefined, { reject: 'none' });
    expect(x.status).toBe('rejected');
    expect(q.club).toBe(mu);
  });

  it('indlæsning: forældede bud med et menneske som part trækkes (én gang)', () => {
    const g = gs();
    const s = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!;
    const q = squad(s.id)[0];
    const [c1, c2] = Object.values(g.clubs).filter((c) => c.id !== mu && c.id !== s.id);
    const stale = bid(q, c1.id, mu);   // bud til menneskets klub på en spiller, der ikke er hans
    const aiOnly = bid(q, c1.id, c2.id, { cmAi: true });
    expect(offerLive(g, stale)).toBe(false);
    g.fixes = (g.fixes ?? []).filter((f) => f !== 'staleOffers');
    repairStaleOffers(g);
    expect(stale.status).toBe('withdrawn');
    expect(aiOnly.status).toBe('pending');   // rene computerbud: på svardagen svarer den nye klub (cmAiAiDue, 0x8c63a0)
    expect(dropStaleOffers(g, isHumanClub)).toBe(0);
  });
});
