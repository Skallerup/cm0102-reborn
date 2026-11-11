// Taktikkens positionstabel som i originalen (0x5b7160 / sub_6c2be0): udvidelse, spejling og kortlægning af spillets taktikker
import { describe, expect, it } from 'vitest';
import { PRESET_TACTICS } from '../src/game/engine/grid/presetTactics';
import { CANON_MASKS, assign, canon, canonGrid, mapTactic, presetTable, slotMask, tableCell } from '../src/game/engine/grid/tacticTable';
import { GRID_X, GRID_Y, formationSlots } from '../src/game/tactics';

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
  it('spillets 4-4-2 er præcis originalens 4-4-2: forudindstillingen med målmand på plads 0 og forskellige pladser', () => {
    const m = mapTactic(formationSlots('4-4-2'), '4-4-2');
    expect(m.preset?.name).toBe('4-4-2');
    expect(m.slotOf[0]).toBe(0);
    expect(new Set(m.slotOf).size).toBe(11);
    expect(m.slotOf.map((j, i) => m.masks[j] === slotMask(formationSlots('4-4-2')[i]))).toEqual(new Array(11).fill(true));
    expect(mapTactic(formationSlots('4-4-2'), '4-4-2 Attacking').preset?.name).toBe('4-4-2 Attacking');   // samme masker, navnet afgør
  });
  it('andre taktikker får det kanoniske gitter (0x5b2ba0) og standardtaktikkens værdier', () => {
    const m = mapTactic(formationSlots('4-3-3'), '4-3-3');
    expect(m.preset).toBeNull();
    expect(m.flags).toBe(0x22a91);
    expect(m.tb.every((b) => b === 0x12)).toBe(true);
    // målmanden: canon(GK) uden bold zy 0 = (13, 0) → felt (4, 0)
    expect(tableCell(m.table, 0, 0, 0, 4, 1)).toEqual([4, 0]);
  });
});

describe('det kanoniske punkt 0x5b7e60 (notes/5b3560-slot-grid.md)', () => {
  it('rækker, kolonner, yderpladser med bold og forskydningen efter boldens kolonne', () => {
    expect(canon(0x1, 0, 1, 0)).toEqual([13, 0]);
    expect(canon(0x1, 0, 0, 2)).toEqual([12, 2]);                  // GK, zy > 0: lille forskydning 1
    expect(canon(0x404, 0, 1, 1)).toEqual([15, 7]);                 // D RC uden bold
    expect(canon(0x804, 1, 1, 3)).toEqual([23, 21]);                // D R med bold, zy 3: +4
    expect(canon(0x810, 1, 2, 2)).toEqual([24, 24]);                // M R med bold, zx 2: +5, loft 24
    expect(canon(0x240, 1, 0, 0)).toEqual([8, 15]);                 // F C med bold, zx 0: −5
    expect(CANON_MASKS).toHaveLength(31);
  });
  it('spillets 30 faste pladser er de 30 masker', () => {
    const seen = new Set<number>();
    for (const x of GRID_X) for (const y of GRID_Y) seen.add(slotMask({ pos: 'M', x, y }));
    expect(seen.size).toBe(30);
    expect(slotMask({ pos: 'D', x: 22, y: 12 })).toBe(0x84);
    expect(slotMask({ pos: 'ST', x: 80, y: 60 })).toBe(0x440);
  });
  it('flere af originalens filer har det kanoniske gitter bit for bit – fx 4-4-2 Defensive (4-4-2 har en håndredigeret målmand)', () => {
    const p = PRESET_TACTICS.find((t) => t.name === '4-4-2 Defensive')!;
    const g = canonGrid(p.masks);
    expect(Buffer.from(g).toString('base64')).toBe(p.grid);
  });
});
