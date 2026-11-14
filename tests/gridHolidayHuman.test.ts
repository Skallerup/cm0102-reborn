// Menneskets klub på ferie i gittermotoren (ejerens fejl 14/11: "svært at vinde ligaen med Man Utd"): originalen behandler en menneskeklub, som
// assistenten styrer, som en computerklub – 0x600a50(klub, 0, 1, 0, 0) med ferietjekket 0x5fe040 = 0 (oraklets HU-linjer for Arsenal på ferie) – og
// bruger menneskets egen managerpost (ls20's MG-linje: CA 180). Før fik ferieholdet hverken managerens tillæg i 0x6ec010 eller en manager i
// holdudtagelsen 0x6dbc50/0x6ddab0 (Man Utd på ferie 76–87 point mod 97–98 som computerklub i scripts/human-vs-holiday.ts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { gameInputsCtx } from '../src/game/engine/grid/gameInputs';
import { aiPickCtx, engineManager, HUMAN_NP, HUMAN_NP_CA } from '../src/game/engine/grid/aiTeam';
import { gridTacOf, npShown } from '../src/game/cmStaffInit';

describe('menneskets klub på ferie (gittermotoren)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();
  const mu = g.userClub, ars = Object.values(g.clubs).find((c) => c.name === 'Arsenal')!.id;

  it('menneskets managerpost (ls20 MG): de viste Judging Ability/Potential 19/15, Tactics 18, Attacking 17', () => {
    const st = { ca: HUMAN_NP_CA, cmNp: HUMAN_NP.slice() };
    expect(npShown(st, 0x17)).toBe(19);
    expect(npShown(st, 0x18)).toBe(15);
    expect(npShown(st, 0x21)).toBe(18);
    expect(gridTacOf({ tac: [], cmNp: HUMAN_NP.slice() })?.[0]).toBe(17);
  });

  it('kun når motoren styrer menneskets hold: managerposten og "ikke menneske" i 0x6ec010', () => {
    expect(engineManager(mu, false)).toBeUndefined();
    expect(engineManager(mu, true)?.ca).toBe(HUMAN_NP_CA);
    expect(engineManager(ars, true)).toBe(g.staff[g.clubs[ars].manager]);
    expect(aiPickCtx(mu)?.judge).toBeNull();                                     // standard: som før (trupplanen m.fl.)
    expect(aiPickCtx(mu, true)?.judge?.ja).toBe(19);
    const p = squad(mu)[0];
    const live = gameInputsCtx(mu, ars, { ai: [false, true] }).matchValuesEnv({ side: 0, src: p });
    const holiday = gameInputsCtx(mu, ars, { ai: [true, true] }).matchValuesEnv({ side: 0, src: p });
    expect(live.human).toBe(true);
    expect(live.manager).toBeNull();
    expect(holiday.human).toBe(false);
    expect(holiday.manager).toEqual({ n0e: 17, rating: 18 });
    // computerens klub: uændret
    const q = squad(ars)[0];
    expect(gameInputsCtx(mu, ars, { ai: [false, true] }).matchValuesEnv({ side: 1, src: q }).manager)
      .toEqual(gameInputsCtx(mu, ars).matchValuesEnv({ side: 1, src: q }).manager);
  });
});
