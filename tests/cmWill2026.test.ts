// 2026/27 i ægte tilstand (MODERN_PARITY 1+4): originalens vilje 0x846920 (Player Search "Interested" 0x807450, skiftet 0x8c0080) og
// kontraktlaget (kravet 0x85fc50, bestyrelsens loft 0x5968d0) på 2026/27-dataene, pengene omregnet med faktoren pr. liga (cmMoney.ts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmSearchInterested } from '../src/game/cmSearchInterest';
import { cmMoveInterest, cmTalkDemand } from '../src/game/cmContractGame';
import { cmBoardWageAllow } from '../src/game/cmBudget';
import { cmGbp, GBP_2001 } from '../src/game/cmMoney';
import { makeBid, playerInterest, processOffers, respondToOffer } from '../src/game/transfers';
import { cmMarketOn } from '../src/game/cmPlayerData';
import { newTerms, stepUp, valueCtx } from '../src/game/cmTransferBid';
import type { TransferOffer } from '../src/game/types';
import type { GameState, Player } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
world.cmRaw = (JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw?: unknown }).cmRaw;
const nat = (n: string) => world.nations.findIndex((x) => x.name === n);
const clubId = (n: string) => world.clubs.find((c) => c[1] === n || c[2] === n)![0];

describe('2026/27 i ægte tilstand: originalens vilje og kontrakter', () => {
  createGame(world, { managerName: 'T', managerNation: nat('Denmark'), clubId: clubId('Vejle Boldklub'), activeNations: ['Denmark', 'Spain', 'England', 'Germany'].map(nat), lang: 'da', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();
  const find = (first: string, last: string) => Object.values(g.players).find((p) => p.first === first && p.last === last) as Player;
  const city = clubId('Manchester City');

  it('pengefaktoren er målt pr. liga ved spilstart (den originale database: 0,86)', () => {
    expect(g.cmGbp).toBeDefined();
    const f = cmGbp(g, city);
    expect(f).toBeGreaterThan(0.01);
    expect(f).toBeLessThan(2);
    expect(cmGbp({ clubs: {} } as unknown as GameState)).toBe(GBP_2001);
  });

  it('Player Search "Interested" og skiftet bruger 0x846920: stjernerne vil ikke til Vejle, men til Manchester City', () => {
    for (const p of [find('Javi', 'Guerra'), find('Kobbie', 'Mainoo'), find('Sacha', 'Boey')]) {
      expect(cmSearchInterested(g, p, g.userClub)).toBe(false);
      expect(cmMoveInterest(g, p, g.userClub)!).toBeLessThan(0.75);
    }
    expect(cmSearchInterested(g, find('Javi', 'Guerra'), city)).toBe(true);
    // computerens skøn (playerInterest) er det samme som for den originale database (dbRepGap kun i udvidet tilstand)
    expect(['yes', 'reputation', 'happy', 'abroad', 'permit']).toContain(playerInterest(find('Javi', 'Guerra'), g.clubs[g.userClub]));
  });

  it('kravet og bestyrelsens loft er moderne beløb (€) for egne spillere', () => {
    const own = Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0];
    const d = cmTalkDemand(g, own, g.userClub)!;
    expect(d.gbp).toBe(cmGbp(g, g.userClub));
    // kravet ligger om den nuværende løn (originalens krav i originalens enheder, tilbage i €)
    expect(d.wage).toBeGreaterThan(own.contract!.wage * 0.5);
    expect(d.wage).toBeLessThan(own.contract!.wage * 3);
    expect(cmBoardWageAllow(g, own, g.userClub)!).toBeGreaterThan(0);
  });

  it('(MODERN_PARITY 3) computerens marked: trupplanen 0x83a1b0 kører ved spilstarten og slår cmMarketOn til; buddene i køberens £', () => {
    expect(g.cmPlan && Object.keys(g.cmPlan).length).toBeGreaterThan(100);
    expect(cmMarketOn(g)).toBe(true);
    const p = find('Javi', 'Guerra');
    const c = valueCtx(g, p, city);
    expect(c.k).toBe(cmGbp(g, city));
    expect(c.value).toBe(Math.round(p.value * cmGbp(g, p.club)));
    // ældre 2026/27-spil uden trupplanen og udvidet tilstand: spillets eget marked
    expect(cmMarketOn({ ...g, cmPlan: undefined } as GameState)).toBe(false);
    expect(cmMarketOn({ ...g, options: { ...g.options, mode: 'extended' } } as GameState)).toBe(false);
  });

  it('(MODERN_PARITY 3) menneskets handler følger originalens forløb: budskærmens vilkår, computerens svar 0x8c8090 og afvisningen 0x8f06f0', () => {
    const me = g.clubs[g.userClub];
    // et bud over transferbudgettet er tilladt (pengene kontrolleres først ved Confirm Transfer Offer 0x8cfc90), vilkårene gemmes (rater)
    const target = Object.values(g.players).filter((p) => p.club && p.club !== g.userClub && g.clubs[p.club]?.nation === me.nation && !p.loan && p.contract)
      .sort((a, b) => b.value - a.value)[0];
    const fee = Math.max(me.transferBudget * 2, 1000);
    const t = { ...newTerms(g, target, g.userClub, fee), months: 12 };
    const o = makeBid(target.id, fee, false, { terms: t }) as TransferOffer;
    expect(typeof o).toBe('object');
    expect(o.months).toBe(12);
    expect(g.shortlist).toContain(target.id);
    // computerens svar (ai_respond_to_bid 0x8c8090): et modbud har originalens vilkår (cmCounter), en accept går til Offer Contract (cmTalks)
    o.respondBy = g.date;
    processOffers();
    expect(['countered', 'rejected', 'negotiating']).toContain(o.status);
    if (o.status === 'countered') expect(o.cmCounter).toBeDefined();
    if (o.status === 'negotiating') expect(o.cmTalks).toBeDefined();
    // Budskærmens beløb i køberens £ (Cash::step_up 0x43f4e0 med faktoren)
    const k = cmGbp(g, g.userClub);
    expect(Math.abs(stepUp(Math.round(1_000_000 / k), k) * k - 1_100_000)).toBeLessThanOrEqual(1);
    // afvisning med begrundelse på menneskets spiller: trupstatussen sættes (0x8c5800), ingen jagt (ønskelisterne byder igen)
    const own = Object.values(g.players).filter((p) => p.club === g.userClub && !p.loan).sort((a, b) => b.ca - a.ca)[1];
    const bid: TransferOffer = { id: g.nextId.offer++, player: own.id, buyer: city, seller: g.userClub, fee: own.value, loan: false, status: 'pending', created: g.date, respondBy: g.date };
    g.offers.push(bid);
    respondToOffer(bid.id, 'reject', undefined, undefined, undefined, { reject: 'indispensable' });
    expect(bid.status).toBe('rejected');
    expect(own.squadStatus).toBe('key');
    expect(g.pursuits?.some((x) => x.player === own.id) ?? false).toBe(false);
  });
});
