// B-holdene og reserveholdet som i CM 01/02 (0x540a50, 0x541e60, 0x542740, 0x4cbb60, 0x4cbd20, managermenuen 0x75db00 – cmBTeam.ts).
// Den originale database i ægte tilstand.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { bTeamOf, financeClub, hasReserveTeam, linkedClub, squadMoveOption } from '../src/game/cmBTeam';
import { updateWageBill } from '../src/game/cmFinance';
import type { GameState } from '../src/game/types';

describe('B-holdene som CM 01/02 (original DB, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const spa = world.nations.findIndex((x) => x.name === 'Spain');
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const barca = world.clubs.find((c) => c[1] === 'F.C. Barcelona')![0];
  const barcaB = world.clubs.find((c) => c[1] === 'F.C. Barcelona B')![0];
  createGame(world, { managerName: 'T', managerNation: spa, clubId: barca, activeNations: [spa, eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs() as GameState;

  it('parrene (0x6146b0/0x540a50): Barcelona ↔ Barcelona B, Real Madrid ↔ Real Madrid B; engelske klubber har intet B-hold', () => {
    expect(linkedClub(g, barca)).toEqual({ other: barcaB, first: true });
    expect(linkedClub(g, barcaB)).toEqual({ other: barca, first: false });
    expect(bTeamOf(g, barca)).toBe(barcaB);
    expect(bTeamOf(g, barcaB)).toBeNull();
    const rm = world.clubs.find((c) => c[1] === 'Real Madrid C.F.')![0];
    expect(bTeamOf(g, rm)).toBe(world.clubs.find((c) => c[1] === 'Real Madrid C.F. B')![0]);
    const mu = world.clubs.find((c) => c[2] === 'Man Utd')![0];
    expect(linkedClub(g, mu)).toBeNull();
    expect(financeClub(g, barcaB)).toBe(barca);
    expect(financeClub(g, barca)).toBe(barca);
  });

  it('reserveholdet (0x542740): ikke i Spanien eller for B-hold – Man Utd har et; ingen spanske klubber har reserver ved start', () => {
    const mu = world.clubs.find((c) => c[2] === 'Man Utd')![0];
    expect(hasReserveTeam(g, mu)).toBe(true);
    expect(hasReserveTeam(g, barca)).toBe(false);
    expect(hasReserveTeam(g, barcaB)).toBe(false);
    for (const c of Object.values(g.clubs)) if (g.nations[c.nation]?.name === 'Spain') for (const p of squad(c.id)) expect(p.reserves).toBeFalsy();
  });

  it('create_game 0x541e60: moderklub + B-hold højst 48 spillere', () => {
    for (const c of Object.values(g.clubs)) {
      const b = bTeamOf(g, c.id);
      if (b !== null) expect(squad(c.id).filter((p) => !p.virtual).length + squad(b).filter((p) => !p.virtual).length).toBeLessThanOrEqual(48);
    }
  });

  it("Relegate To 'B' Team / Promote To 'A' Team (0x4cbb60/0x4cbd20): kontrakten og lønnen bliver hos Barcelona", () => {
    const p = squad(barca).filter((x) => !x.virtual && x.contract).sort((a, b) => a.ca - b.ca)[0];
    expect(squadMoveOption(g, p, barca)).toBe(4);
    expect(applyAction({ t: 'reserves', pid: p.id, on: true })).toBe('error');   // ingen reserver i Spanien
    const r = g.cmFin?.[barca];
    let before = 0;
    if (r) { updateWageBill(g, g.clubs[barca], r); before = r.wb; }
    const contract = p.contract;
    g.tactic!.lineup = g.tactic!.lineup.map((id, i) => (i === 0 ? p.id : id));
    expect(applyAction({ t: 'bTeam', pid: p.id })).toBe('ok');
    expect(p.club).toBe(barcaB);
    expect(p.contract).toBe(contract);
    expect(p.cmCon).toBe(barca);
    expect(g.tactic!.lineup).not.toContain(p.id);
    if (r) { updateWageBill(g, g.clubs[barca], r); expect(r.wb).toBe(before); }
    expect(squadMoveOption(g, p, barca)).toBe(3);
    expect(applyAction({ t: 'bTeam', pid: p.id })).toBe('ok');
    expect(p.club).toBe(barca);
    expect(p.cmCon).toBeUndefined();
  });

  it('Control Reserve Team (HUMAN_MANAGER +0x9a05) gemmes på manageren', () => {
    expect(g.manager.ctrlRes).toBeFalsy();
    applyAction({ t: 'ctrlRes', on: true });
    expect(g.manager.ctrlRes).toBe(true);
    applyAction({ t: 'ctrlRes', on: false });
    expect(g.manager.ctrlRes).toBeFalsy();
  });
});
