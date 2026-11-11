// Taktikkens positionstabel som i originalen (0x5b7160 / sub_6c2be0): udvidelse, spejling og kortlægning af spillets taktikker
import { describe, expect, it } from 'vitest';
import { PRESET_TACTICS } from '../src/game/engine/grid/presetTactics';
import { assign, mapTactic, presetTable, tableCell } from '../src/game/engine/grid/tacticTable';
import { formationSlots } from '../src/game/tactics';

const W: Record<string, number> = { GK: 0x1, SW: 0x2, D: 0x4, DM: 0x8, M: 0x10, AM: 0x20, ST: 0x40, WB: 0x8 };
const S: Record<string, number> = { L: 0x80, C: 0x200, R: 0x800 };
const specs = (name: string) => formationSlots(name).map((s) => ({ mask: s.pos === 'GK' ? 1 : W[s.pos] | (S[s.side] ?? 0x200),
  col: Math.max(0, Math.min(8, Math.round((s.y / 100) * 8))), row: Math.min(11, Math.round((s.x / 100) * 11)) }));

describe('positionstabellen (originalens forudindstillinger)', () => {
  it('17 forudindstillinger i originalens rækkefølge, målmanden står ved eget mål', () => {
    expect(PRESET_TACTICS.map((p) => p.name).slice(0, 3)).toEqual(['4-4-2', '4-4-2 Defensive', '4-4-2 Attacking']);
    expect(PRESET_TACTICS).toHaveLength(17);
    const t = presetTable(PRESET_TACTICS[0]);
    expect(tableCell(t, 0, 0, 0, 4, 1)).toEqual([4, 0]);
    expect(tableCell(t, 1, 0, 0, 4, 10)).toEqual([4, 11]);           // side 1 spejlet
  });
  it('4-4-2: forsvarerne rykker op med bolden, højre back i højre side', () => {
    const t = presetTable(PRESET_TACTICS[0]);
    const [x0, y0] = tableCell(t, 0, 1, 0, 4, 5), [, y1] = tableCell(t, 0, 1, 1, 4, 6);
    expect(PRESET_TACTICS[0].masks[1] & 0x800).toBeTruthy();       // plads 1 = højre back
    expect(x0).toBeGreaterThan(4);
    expect(y1).toBeGreaterThan(y0);
  });
  it('ungarsk tildeling finder det billigste match', () => {
    expect(assign([[4, 1, 3], [2, 0, 5], [3, 2, 2]])).toEqual([1, 0, 2]);
  });
  it('spillets 4-4-2 kortlægges til originalens 4-4-2 med målmand på plads 0 og forskellige pladser', () => {
    const m = mapTactic(specs('4-4-2'), '4-4-2');
    expect(m.preset.name).toBe('4-4-2');
    expect(m.slotOf[0]).toBe(0);
    expect(new Set(m.slotOf).size).toBe(11);
    expect(mapTactic(specs('5-3-2'), '5-3-2').preset.name).toBe('Sweeper'); // spillets 5-3-2 har en libero (SW)
    expect(mapTactic(specs('4-3-3'), '4-3-3').preset.name).toMatch(/^4-3-3|^4-1-2-1-2/);
  });
});
