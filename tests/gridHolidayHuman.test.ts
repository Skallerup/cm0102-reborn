// Menneskets klub på ferie i gittermotoren (ejerens fejl 14/11: "svært at vinde ligaen med Man Utd"): originalen behandler en menneskeklub, som
// assistenten styrer, som en computerklub – 0x600a50(klub, 0, 1, 0, 0) med ferietjekket 0x5fe040 = 0 (oraklets HU-linjer for Arsenal på ferie) – og
// setupTeam 0x6db500 giver holdet assistenten som manager (0x600e90: club +0xd3, ellers træneren med det højeste omdømme np+0xa). Oraklets ls20:
// Arsenals MG-linje på ferie er Pat Rice (staffpostens fødselsdag 17/4-1949, Arsenals assistent), ikke menneskets egen post.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { gameInputsCtx } from '../src/game/engine/grid/gameInputs';
import { aiPickCtx, engineManager, holidayManager } from '../src/game/engine/grid/aiTeam';
import { gridTacOf, npShown } from '../src/game/cmStaffInit';

describe('menneskets klub på ferie (gittermotoren)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();
  const mu = g.userClub, ars = Object.values(g.clubs).find((c) => c.name === 'Arsenal')!.id;

  it('ls20-posten (Pat Rice): de viste Judging Ability/Potential 19/15, Tactics 18, Attacking 17', () => {
    const np = [17, 8, 6, 6, 20, 7, 15, 9, 15, 6, -24, 1, 12, 6, 10, 20, -39, 20, 20, -4, 20, 3];
    expect(npShown({ ca: 180, cmNp: np }, 0x17)).toBe(19);
    expect(npShown({ ca: 180, cmNp: np }, 0x18)).toBe(15);
    expect(npShown({ ca: 180, cmNp: np }, 0x21)).toBe(18);
    expect(gridTacOf({ tac: [], cmNp: np })?.[0]).toBe(17);
  });

  it('0x600e90: assistenten er feriens manager', () => {
    const a = holidayManager(mu)!;
    expect(a.role).toBe('assistant');
    expect(engineManager(mu, true)?.id).toBe(a.id);
    expect(engineManager(mu, true)?.cmNp).toEqual(a.cmNp);
  });

  it('kun når motoren styrer menneskets hold: managerposten og "ikke menneske" i 0x6ec010', () => {
    const a = holidayManager(mu)!;
    expect(engineManager(mu, false)).toBeUndefined();
    expect(engineManager(ars, true)).toBe(g.staff[g.clubs[ars].manager]);
    expect(aiPickCtx(mu)?.judge).toBeNull();                                     // standard: som før (trupplanen m.fl.)
    expect(aiPickCtx(mu, true)?.judge?.ja).toBe(npShown(a, 0x17));
    const p = squad(mu)[0];
    const live = gameInputsCtx(mu, ars, { ai: [false, true] }).matchValuesEnv({ side: 0, src: p });
    const holiday = gameInputsCtx(mu, ars, { ai: [true, true] }).matchValuesEnv({ side: 0, src: p });
    expect(live.human).toBe(true);
    expect(live.manager).toBeNull();
    expect(holiday.human).toBe(false);
    expect(holiday.manager).toEqual({ n0e: a.cmNp![0], rating: npShown(a, 0x21) });
    // computerens klub: uændret
    const q = squad(ars)[0];
    expect(gameInputsCtx(mu, ars, { ai: [false, true] }).matchValuesEnv({ side: 1, src: q }).manager)
      .toEqual(gameInputsCtx(mu, ars).matchValuesEnv({ side: 1, src: q }).manager);
  });
});
