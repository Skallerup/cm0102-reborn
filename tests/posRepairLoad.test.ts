import { describe, expect, it } from 'vitest';
import { repairPositionsOnce } from '../src/game/save';
import type { GameState, Player } from '../src/game/types';

// Spillerrapport #32: Johan Mangfors (3.9.60, Halmstad) – databasen har D 20, DM 8 og ingen sider (0); i spil fra før 9/11-2026 stod han med
// Left/Right/Centre = 1 og kunne ikke stilles op. Originalen giver ham en side ved spilstarten (sub_535a80) – det gør indlæsningen nu.
const pl = (id: number, pos: number[], side: number[]) => ({ id, pos, side } as unknown as Player);

describe('positionsreparationen i gamle gemte spil', () => {
  it('giver spillere uden side/position på 20 originalens reparation og rører ikke de andre', () => {
    const mangfors = pl(114130, [1, 1, 20, 8, 1, 1, 1, 1], [1, 1, 1]);
    const ok = pl(2, [1, 1, 20, 1, 1, 1, 1, 1], [1, 20, 1]);
    const keeper = pl(3, [20, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1]);
    const noPos = pl(4, [1, 1, 12, 1, 1, 1, 1, 1], [1, 20, 1]);
    const g = { dbKind: 'cm0102', seed: 7, players: { 114130: mangfors, 2: ok, 3: keeper, 4: noPos } } as unknown as GameState;
    repairPositionsOnce(g);
    expect(Math.max(...mangfors.side)).toBe(20);
    expect(mangfors.pos[2]).toBe(20);
    expect(ok.pos).toEqual([1, 1, 20, 1, 1, 1, 1, 1]); expect(ok.side).toEqual([1, 20, 1]);
    expect(keeper.side).toEqual([1, 1, 1]);
    expect(noPos.pos[2]).toBe(20);
    expect(g.fixes).toContain('posRepair');
    mangfors.side = [1, 1, 1];
    repairPositionsOnce(g);
    expect(mangfors.side).toEqual([1, 1, 1]);   // kun én gang
  });
});
