// Computerens bud på menneskets spillere har originalens vilkår (cmAiBid.ts: build_bid 0x8e5d60) – rater, videresalg, beløb efter N kampe.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { cmBuildBid } from '../src/game/cmAiBid';
import { aiBidsForListed } from '../src/game/transfers';
import { addDays } from '../src/game/dates';
import { toGbp } from '../src/game/cmTransferBid';

describe('computerens bud: build_bid 0x8e5d60 (3.9.60, ægte tilstand)', { timeout: 900_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  it('vilkårene er lovlige, gentagelige og indeholder rater hos de fattigere købere', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const buyers = Object.values(g.clubs).filter((c) => c.id !== mu && !g.leagues[c.league]?.hidden).filter((_c, i) => i % 12 === 0);
    const mine = squad(mu).slice(0, 8);
    let built = 0, rates = 0;
    for (const p of mine) for (const b of buyers) {
      const max = Math.round(toGbp(p.value));
      const t = cmBuildBid(g, p, b.id, max);
      if (!t) continue;
      built++;
      expect(t.fee).toBeGreaterThan(0);
      expect([0, 6, 12, 18, 24]).toContain(t.months);
      expect(t.sellOn % 5).toBe(0);
      expect(t.sellOn).toBeLessThanOrEqual(25);
      if (t.months) rates++;
      expect(cmBuildBid(g, p, b.id, max)).toEqual(t);   // samme tilfældige tal
    }
    expect(built).toBeGreaterThan(20);
    expect(rates).toBeGreaterThan(0);
  });

  it('et bud på menneskets spiller kommer fra build_bid (beløbet er ikke længere værdien) og kan bære vilkårene', () => {
    const g = gs();
    for (const p of squad(mu)) { p.listed = true; p.listPrice = p.value; }
    const seen: { fee: number; maxFee?: number; months?: number; sellOn?: number; lgFee?: number; intFee?: number }[] = [];
    for (let d = 0; d < 120 && seen.length < 3; d++) {
      g.date = addDays(g.date, 1);
      aiBidsForListed();
      for (const o of g.offers) if (o.seller === mu && o.status === 'pending') seen.push(o);
      g.offers.length = 0;
    }
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.some((o) => o.fee !== o.maxFee)).toBe(true);
    for (const o of seen) { expect(o.fee).toBeGreaterThan(0); expect([undefined, 6, 12, 18, 24]).toContain(o.months); }
  });
});
