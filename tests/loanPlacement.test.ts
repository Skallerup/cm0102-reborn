import { describe, expect, it } from 'vitest';
import { loanPlacement } from '../src/game/state';
import type { GameState, Player } from '../src/game/types';

// staff +0x5e ved lejen (sign_loan 0x4d0380 + 0x540980(staff, 1) @0x8c270e/0x8bf5c8, end_loan 0x4d0ad3–0x4d0b2b): en lejet spiller kommer på
// lejeklubbens førstehold og hjem på reserveholdet, hvis han stod dér ved lejens start (Djordjic i AGF: før 0 kampe, oraklet 37)
const g = { clubs: { 1: { id: 1, nation: 0 }, 2: { id: 2, nation: 0 } }, nations: [{ name: 'England' }] } as unknown as GameState;
const mk = (reserves: boolean): Player => ({ id: 9, club: 1, reserves: reserves || undefined, cmPlace: reserves ? 1 : 2, loan: { from: 1, until: '2002-05-30', share: 0 } }) as unknown as Player;

describe('lejens førstehold/reservehold (staff +0x5e)', () => {
  it('reservespilleren: førsteholdet under lejen, reserverne igen bagefter', () => {
    const p = mk(true);
    loanPlacement(g, p, true);
    expect([p.reserves, p.cmPlace, p.loan!.res]).toEqual([undefined, 2, 1]);
    p.club = 2;
    loanPlacement(g, p, false);
    expect([p.reserves, p.cmPlace]).toEqual([true, 1]);
  });
  it('førsteholdsspilleren: førsteholdet begge steder', () => {
    const p = mk(false);
    loanPlacement(g, p, true);
    expect(p.loan!.res).toBeUndefined();
    p.club = 2;
    loanPlacement(g, p, false);
    expect([p.reserves, p.cmPlace]).toEqual([undefined, 2]);
  });
});
