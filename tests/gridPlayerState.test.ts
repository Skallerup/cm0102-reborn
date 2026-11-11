// Spillerbytes og boldhændelsen (notes/player-state-bytes.md): agitationen +0x1a2 (start, henfald ×0,85, dommerens max(…, gulv)),
// +0xff (grundværdi og henfald i sub_6f55c0) og engine+0x8eb1 i det taktiske felt sub_6c2be0
import { describe, expect, it } from 'vitest';
import * as L from '../src/game/engine/grid/loop';
import { GRID_UNKNOWN, type GP, type GridMatchState } from '../src/game/engine/grid/gridMatch';
import { judgeTackle, type FoulPlayer } from '../src/game/engine/cm0102-original-rules';
import { PRESET_TACTICS } from '../src/game/engine/grid/presetTactics';
import { presetTable, tableCell } from '../src/game/engine/grid/tacticTable';

describe('agitationen og +0xff', () => {
  it('sub_6f55c0: +0xff falder én mod grundværdien, kun når rand(11) = 0', () => {
    const p = { roll: {}, cap: { pace: 1, positioning: 1, offTheBall: 1, marking: 1, flair: 1, creativity: 1, decisions: 1, anticipation: 1, workRate: 1, agility: 1 },
      condition: 10000, pendingCond: 0, injury: 0, temperCount: 6, bffBase: 4 } as unknown as L.Player;
    L.playerTick(p, () => 0); expect(p.temperCount).toBe(5);
    L.playerTick(p, (n) => (n === 11 ? 3 : 0)); expect(p.temperCount).toBe(5);
    L.playerTick(p, () => 0); L.playerTick(p, () => 0); expect(p.temperCount).toBe(4);
  });
  it('dommeren ophidser offeret: max(ag·(1 + 0,2·sev), gulv), loft 100 (0x716450)', () => {
    const fp = (o: Partial<FoulPlayer> = {}): FoulPlayer => ({ side: 1, x: 4, y: 6, isKeeper: false, fouls: 0, foulsSuffered: 0, yellows: 0, reasons: [0, 0], b16: 0,
      w31: 0, agitation: 30, temperCount: 0, grudge: null, rating: 6100, sportsmanship: 10, temperament: 10, ...o });
    const v = fp({ side: 0 });
    const top = (n: number) => (n > 0 ? n - 1 : 0);
    const j = judgeTackle(top, { official: { discipline: 10, b24: 10, b27: 10, b28: 10, mood: 0 }, minute: 50, teamFouls: 0 }, fp(), v, 42);
    expect(j.ret).toBe(1);
    expect(v.agitation).toBeCloseTo(Math.min(100, Math.max(30 * (1 + 0.2 * j.severity), 30)));   // før: min(…) = gulvet 30
    expect(v.agitation).toBeGreaterThan(30);
  });
});

describe('boldhændelsen +0x8eb1 i det taktiske felt (0x6c2ca5)', () => {
  const pr = PRESET_TACTICS.find((t) => t.name === '4-4-2')!, tbl = presetTable(pr);
  const p = (lo: number, o: Partial<GP> = {}) => ({ side: 0, x: 3, y: 9, pos: 0x4 | 0x200, instr: BigInt(lo >>> 0), tbl, pslot: 3, ...o }) as unknown as GP;
  const m = (o: Partial<GridMatchState>) => ({ ballX: 4, ballY: 10, ballH: 0, poss: 0, receiver: null, teamFlags: [0x10000 | 0x4000, 0], counterFlag: [false, false], ...o }) as unknown as GridMatchState;
  it('> 0: bit 17 (med bold) → bliv stående; ellers tabellens felt uden mentalitet og men behind ball', () => {
    expect(GRID_UNKNOWN.tacticalCell(m({ ballEvent: 3 }), p(0x20000))).toEqual([3, 9]);
    expect(GRID_UNKNOWN.tacticalCell(m({ ballEvent: 3 }), p(0))).toEqual(tableCell(tbl, 0, 3, 1, 4, 10));
    const [, yNorm] = GRID_UNKNOWN.tacticalCell(m({ ballEvent: 0 }), p(0));
    const [, yTbl] = tableCell(tbl, 0, 3, 1, 4, 10);
    expect(yNorm).toBe(Math.max(0, Math.min(11, yTbl + 1)) - 2);          // angreb +1, men behind ball −2
  });
  it('uden bold: bit 31 eller 19 (ikke målmand) → bliv stående; −1 = normalstien', () => {
    expect(GRID_UNKNOWN.tacticalCell(m({ ballEvent: 7, poss: 1 }), p(0x80000))).toEqual([3, 9]);
    expect(GRID_UNKNOWN.tacticalCell(m({ ballEvent: 7, poss: 1 }), p(0x80000, { pos: 0x1 }))).toEqual(tableCell(tbl, 0, 3, 0, 4, 10));
    expect(GRID_UNKNOWN.tacticalCell(m({ ballEvent: -1, poss: 1, teamFlags: [0, 0] }), p(0x80000))).toEqual(tableCell(tbl, 0, 3, 0, 4, 10));
  });
});

describe('tikkets vedligehold (sub_6f4aa0)', () => {
  it('agitationen henfalder ×0,85 mod gulvet', () => {
    const a = { active: true, busy: 0, agitation: 40, agFloor: 30 } as unknown as L.Player;
    L.agitationDecay(a); expect(a.agitation).toBeCloseTo(34, 4);
    L.agitationDecay(a); expect(a.agitation).toBe(30);
    a.agitation = 150; L.agitationDecay(a); expect(a.agitation).toBe(100);
  });
});
