// Linjevogteren sub_6cfd70 (thunk) → sub_6ea760 (gennemgået i asm 11/11), også ved skud (0x7038a2: skytten er excl)
import { describe, expect, it } from 'vitest';
import { GRID_UNKNOWN, type GP, type GridMatchState } from '../src/game/engine/grid/gridMatch';

const P = (side: 0 | 1, x: number, y: number, v = 0) => ({ side, x, y, active: true, roll: { offTheBall: v } }) as unknown as GP;
const M = (gp: GP[], o: Partial<GridMatchState> = {}) => ({ gp, lineSide1: 10, lineSide0: 1, inc: null, carrier: null, linesmanMark: 0, ...o }) as unknown as GridMatchState;
const one = () => 1;

describe('offside (sub_6ea760)', () => {
  it('ved skud: en anden angriber forbi linjen tæt på målet flages; skytten selv aldrig', () => {
    const shooter = P(0, 4, 10), q = P(0, 5, 11);
    const m = M([shooter, q]);
    expect(GRID_UNKNOWN.offsidePlayer(m, 0, 10, 11, shooter, one)).toBe(q);
    expect(GRID_UNKNOWN.offsidePlayer(M([shooter]), 0, 10, 11, shooter, one)).toBeNull();
  });
  it('skytten uden for feltet → ingen vurdering', () => {
    const shooter = P(0, 0, 9), q = P(0, 5, 11);
    expect(GRID_UNKNOWN.offsidePlayer(M([shooter, q]), 0, 9, 11, shooter, one)).toBeNull();
  });
  it('linjen 12 (forsvarer på mållinjen): målrækken 11 er ikke forbi linjen', () => {
    const shooter = P(0, 4, 10), q = P(0, 5, 11);
    expect(GRID_UNKNOWN.offsidePlayer(M([shooter, q], { lineSide1: 12 }), 0, 10, 11, shooter, one)).toBeNull();
  });
  it('rand(+0x29 + 25) = 0: linjevogteren overser alt (karakter −75)', () => {
    const shooter = P(0, 4, 10), q = P(0, 5, 11), m = M([shooter, q]);
    expect(GRID_UNKNOWN.offsidePlayer(m, 0, 10, 11, shooter, () => 0)).toBeNull();
    expect(m.linesmanMark).toBe(-75);
  });
  it('side 1: to rækker bag linjen giver −15 (sic), side 0 −25', () => {
    const a = P(1, 4, 3), m1 = M([a], { lineSide0: 1 });
    expect(GRID_UNKNOWN.offsidePlayer(m1, 1, 6, 0, null, (n) => (n === 25 ? 1 : 0))).toBe(a);
    expect(m1.linesmanMark).toBe(-15);
    const b = P(0, 4, 8), m0 = M([b], { lineSide1: 10 });
    expect(GRID_UNKNOWN.offsidePlayer(m0, 0, 5, 11, null, (n) => (n === 25 ? 1 : 0))).toBe(b);
    expect(m0.linesmanMark).toBe(-25);
  });
});
