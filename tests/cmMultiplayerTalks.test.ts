// Fællesspil (ægte tilstand, original database): et accepteret bud giver originalens forløb til den RIGTIGE menneskemanager –
// "X transfer offer accepted" + "Offer contract to X", Offer Contract → svar → Confirm Transfer Offer → handlen. Et rum oprettet i udvidet tilstand
// sættes til ægte tilstand ved indlæsning (forceMultiplayerAuthentic).
import { cmBoardWageAllow } from '../src/game/cmBudget';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyActionAs } from '../src/game/actions';
import { enableMultiplayer, withHuman } from '../src/game/humans';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, setClub, squad } from '../src/game/state';
import { processOffers } from '../src/game/transfers';
import { cmActive } from '../src/game/cmPlayerData';
import { cmAcceptBid, cmConfirmOpen, cmTalksDemand, cmTalksOpen } from '../src/game/cmTransferTalks';
import { forceMultiplayerAuthentic } from '../src/game/save';
import type { TransferOffer } from '../src/game/types';

describe('fællesspil: accepteret bud som originalen', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const id = (n: string) => world.clubs.find((c) => c[1] === n)![0];
  const mu = id('Manchester United'), ars = id('Arsenal');

  it('et udvidet rum sættes til ægte tilstand, og forløbet virker for køberen (ikke for værten)', () => {
    createGame(world, { managerName: 'Host', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'extended' });
    enableMultiplayer('p1', 'Host');
    expect(applyActionAs('p2', { t: 'join', name: 'Bo', club: ars, nation: eng })).toBe('ok');
    const g = gs();
    expect(cmActive(g)).toBe(false);
    forceMultiplayerAuthentic(g);
    expect(g.options.mode).toBe('authentic');
    expect(cmActive(g)).toBe(true);
    // Arsenal har plads (0x8cd450)
    for (const x of squad(ars).sort((a, b) => a.ca - b.ca).slice(0, Math.max(0, squad(ars).length - 44))) setClub(x, 0);

    // køberen (p2) – en spiller fra en tredje klub, sælgeren accepterer
    const sellers = Object.values(g.clubs).filter((c) => c.id !== mu && c.id !== ars && c.league === g.clubs[ars].league);
    let found: { o: TransferOffer; pid: number } | null = null;
    withHuman('p2', () => {
      outer: for (const s of sellers) {
        for (const p of squad(s.id).sort((a, b) => b.ca - a.ca).slice(4, 8)) {
          const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: ars, seller: s.id, fee: p.value, loan: false, status: 'pending', created: g.date, respondBy: g.date };
          g.offers.push(o);
          cmAcceptBid(o, p);
          if (o.status === 'negotiating') { found = { o, pid: p.id }; break outer; }
        }
      }
    });
    expect(found).not.toBeNull();
    const { o, pid } = found!;
    const keys = (who: string) => withHuman(who, () => gs().news.map((n) => n.key));
    expect(keys('p2')).toContain('transfer.cmAccepted');
    expect(keys('p2')).toContain('transfer.cmTalks');
    expect(keys('p1')).not.toContain('transfer.cmTalks');
    expect(withHuman('p2', () => cmTalksOpen(gs(), o))).toBe(true);
    expect(withHuman('p1', () => cmTalksOpen(gs(), o))).toBe(false);

    // Offer Contract → svar → Confirm Transfer Offer → handlen
    const want = withHuman('p2', () => cmTalksDemand(o))!;
    // bestyrelsens loft pr. spiller (get_max_wage 0x5968d0 – cmBudget.ts): tilbuddet på loftet
    const allow = withHuman('p2', () => cmBoardWageAllow(gs(), g.players[pid], ars, o.cmRole))!;
    const years = Math.max(1, Number(want.expires.slice(0, 4)) - Number(g.date.slice(0, 4)));
    expect(applyActionAs('p2', { t: 'negotiate', pid, wage: Math.floor(allow), years, clauses: { signOn: want.signOn } })).toBe('cmSent');
    g.date = o.cmTalks!.due!;
    processOffers();
    expect(o.cmTalks!.state).toBe(5);
    expect(withHuman('p2', () => cmConfirmOpen(gs(), o))).toBe(true);
    expect(withHuman('p1', () => cmConfirmOpen(gs(), o))).toBe(false);
    g.clubs[ars].transferBudget = o.fee + 1;
    expect(applyActionAs('p2', { t: 'cmConfirm', offer: o.id, answer: 'yes' })).toBe('completed');
    expect(g.players[pid].club).toBe(ars);
  });
});
