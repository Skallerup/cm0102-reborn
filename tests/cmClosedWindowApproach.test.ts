// CM 01/02: Approach To Buy/Loan og Offer Contract i det lukkede vindue (ejerens fund 25/11: grå 1.6.02). Action-menuen (0x872794/0x87282a) og
// Offer (0x8ef9f0 → add_transfer_offer 0x8be300) ser ikke på vinduet; en klubløs med tidsnibble 1 (0x4e526b) skriver under på vinduets første dag.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad, setClub } from '../src/game/state';
import { act } from '../src/game/actions';
import { approachOpen, makeBid, negotiate, processOffers, windowOpen } from '../src/game/transfers';
import type { Player, TransferOffer } from '../src/game/types';

describe('lukket vindue 1.6.02 (2001, ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  it('menuen er aktiv, buddet afgives, og den klubløse skriver under, når vinduet åbner', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    // plads i truppen (0x8cd450)
    for (const x of squad(mu).sort((a, b) => a.ca - b.ca).slice(0, 8)) setClub(x, 0);
    g.date = '2002-06-01';
    expect(windowOpen(g.date, mu)).toBe(false);
    expect(approachOpen()).toBe(true);

    // bud på en kontraktspiller i en anden klub
    const seller = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!;
    const target = squad(seller.id).sort((a, b) => b.ca - a.ca)[6];
    const bid = makeBid(target.id, target.value);
    expect(typeof bid).toBe('object');
    expect((bid as TransferOffer).status).toBe('pending');
    const loan = act<TransferOffer | string>({ t: 'bid', pid: squad(seller.id)[10].id, fee: 0, loan: true });
    expect(loan).not.toBe('transfer.windowClosed');

    // klubløs: Offer Contract → tidsnibble 1 → aftalen venter på vinduet (4/6-02), så skriver han under (den første, der siger ja)
    let done: { o: TransferOffer; free: Player } | null = null;
    for (const free of squad(seller.id).sort((a, b) => b.ca - a.ca).slice(12, 30)) {
      const wage = Math.round((free.contract?.wage ?? 1000) * 1.2);
      setClub(free, 0);
      free.contract = undefined;
      const o = act<TransferOffer | string>({ t: 'bid', pid: free.id, fee: 0, loan: false }) as TransferOffer;
      expect(typeof o).toBe('object');
      if (negotiate(o.id, wage, 3) !== 'cmSent') continue;
      expect(o.cmTime).toBe(1);
      o.cmTalks!.due = g.date;
      processOffers();
      expect(free.club).toBe(0);   // aldrig en underskrift i det lukkede vindue
      if (o.status === 'accepted') { done = { o, free }; break; }
    }
    expect(done).not.toBeNull();
    const { o, free } = done!;
    expect(o.cmFut).toBe('2002-06-04');
    expect(makeBid(free.id, 0)).toBe('transfer.alreadyBidding');
    g.date = '2002-06-03';
    processOffers();
    expect(free.club).toBe(0);
    g.date = '2002-06-04';
    processOffers();
    expect(free.club).toBe(mu);
  });
});
