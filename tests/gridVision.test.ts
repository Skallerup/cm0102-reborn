// Porte af originalens syn/bane/offside-hjælpere (notes/vision-space-offside.md): retningstabellen (ftol), afstandstabellen og
// sub_6cbc00's optælling af blokerende på linjen
import { describe, expect, it } from 'vitest';
import { bearing, cellDist, laneBlockers } from '../src/game/engine/grid/helpers';
import { DIST } from '../src/game/engine/grid/loop';

describe('syn og bane (originalens tabeller)', () => {
  it('bearing: 0 = +y, 90 = +x, 180 = −y, 270 = −x, trunkeret', () => {
    expect(bearing(0, 1)).toBe(0);
    expect(bearing(1, 0)).toBe(90);
    expect(bearing(0, -1)).toBe(180);
    expect(bearing(-1, 0)).toBe(270);
    expect(bearing(1, 1)).toBe(45);
    expect(bearing(1, 2)).toBe(26);   // atan(0.5) = 26.56° → 26
    expect(bearing(2, -1)).toBe(116); // atan(0.5)+90 = 116.56° → 116
    expect(bearing(-1, -1)).toBe(225);
    expect(bearing(-2, 1)).toBe(296); // dx<0, dy>0 → atan(|dy/dx|)+270 = 296.56 → 296
  });
  it('cellDist slår op i originalens tabel (ikke hypot)', () => {
    expect(cellDist(3, 3)).toBe(DIST[3][3]);
    expect(cellDist(-5, 3)).toBe(5.56);
    expect(cellDist(9, 0)).toBe(1000);
  });
  it('laneBlockers: holdet uden bolden, lige linje uden endefelt, skrå med begge ender', () => {
    const P = (side: number, x: number, y: number, busy = 0) => ({ active: true, side, busy, x, y });
    const gp = [P(1, 4, 3), P(1, 4, 5), P(1, 5, 5), P(0, 4, 4), P(1, 4, 2, 2)];
    expect(laneBlockers(gp, 0, 4, 1, 4, 5)).toBe(1);     // (4,3) tæller, endefeltet (4,5) ikke, busy 2 ikke, eget hold ikke
    expect(laneBlockers(gp, 0, 2, 3, 5, 6)).toBe(1);     // skrå (2,3)(3,4)(4,5)(5,6) → (4,5) tæller
    expect(laneBlockers(gp, 0, 3, 4, 5, 6)).toBe(1);     // (3,4)(4,5)(5,6) → (4,5) tæller
    expect(laneBlockers(gp, 1, 4, 1, 4, 5)).toBe(1);     // side 1 har bolden → side 0 er forsvarere: (4,4)
    expect(laneBlockers(gp, -1, 4, 1, 4, 5)).toBe(1);    // −1 → side 0 regnes som forsvarere (sic)
  });
});
