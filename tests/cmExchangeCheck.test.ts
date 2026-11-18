// Regression (live-nedbrud 18/11, 0.30.0): bytte-skærmen "Add Player To … Transfer Bid" (cmExchangeCheck → club_wants_player 0x843800) kørte
// på en hukommelse uden ønskelisternes adaptere, så 0x843800 → 0x84b180 → 0x8c7950 → 0x58d710 (FIFA_RANKINGS::count_results_in_period) og
// 0x843800 → 0x840d80 → 0x6e6340 kastede "cmWageGame: kald … er ikke porteret". Arsenal, frø 1, 14/7-01.
import { readFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { SL_ON, cmAskingPrice, cmExchangeCheck } from '../src/game/cmShortlistGame';
import { exchangeBaseOk } from '../src/game/transfers';

describe('bytte-skærmen 0x47c180 på den originale database (ægte tilstand)', { timeout: 600_000 }, () => {
  const prev = SL_ON.on;
  afterAll(() => { SL_ON.on = prev; });
  it('cmExchangeCheck og cmAskingPrice kaster ikke for menneskets spillere mod computerklubberne', () => {
    SL_ON.on = true;
    const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = world.nations.findIndex((n) => n.name === 'England');
    const ars = world.clubs.find((c) => c[1] === 'Arsenal')![0];
    createGame(world, { managerName: 'T', managerNation: eng, clubId: ars, activeNations: [eng], lang: 'en', masking: true, seed: 1 });
    const g = gs();
    // Brentford og Burnley kastede 0x6e6340 på spilstartens dag (frø 1); Aston Villa afviser alle
    const receivers = ['Brentford', 'Burnley', 'Aston Villa'].map((n) => Object.values(g.clubs).find((c) => c.name === n)!);
    let ok = 0, refused = 0;
    for (const r of receivers) {
      const target = squad(r.id)[0];
      const base = squad(ars).filter((x) => exchangeBaseOk(x, r.id, target.id));
      const res = cmExchangeCheck(g, ars, r.id, base);
      expect(res).not.toBeNull();
      ok += res!.ok.size; refused += res!.refused;
      expect(cmAskingPrice(g, target, ars)).toBeGreaterThanOrEqual(0);
    }
    expect(ok + refused).toBeGreaterThan(0);
  });
});
