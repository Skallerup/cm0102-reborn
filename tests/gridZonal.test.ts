// Zonevalget sub_6bc030 (src/game/engine/grid/zonal.ts): scoren pr. kandidat, rand-rækkefølgen, frasorteringerne og
// 16-bit-sammenligningen – regnet i hånden efter notes/6bc030-zonal-pick.md
import { describe, expect, it } from 'vitest';
import { zonalPick, type ZonalPlayer, type ZonalWorld } from '../src/game/engine/grid/zonal';

interface TP extends ZonalPlayer { name: string; nat: number; rep: [number, number, number]; jump: number; ls: number; fr: 0 | 1 | 2 }
const P = (name: string, side: 0 | 1, x: number, y: number, o: Partial<TP> = {}): TP => ({
  name, side, slot: 5, active: true, x, y, rating: 6100, shots: 0, shotsOnTarget: 0, penGoalsWon: 0, freeRoleRating: 1,
  pos: 0x240, posAttack: 0x240, instr: 0n, tacticByte: 0, roll: { positioning: 0, flair: 0 }, marks: null, markers: [],
  nat: 2, rep: [0, 0, 150], jump: 12, ls: 10, fr: 0, ...o,
});
/** rand, der returnerer de givne tal i rækkefølge (0 bagefter) og logger n */
const scripted = (vals: number[]) => {
  const log: number[] = [];
  const rand = (n: number) => { log.push(n); return vals.length ? vals.shift()! : 0; };
  return { rand, log };
};
const world = (players: TP[], o: Partial<ZonalWorld<TP>> = {}, scores?: Map<string, number>): ZonalWorld<TP> => ({
  carrier: null, receiver: null, players, teamFlags: [0, 0], counterFlag: [false, false], lineSide1: 11, lineSide0: 0, sameClubGroup: false,
  nation: (q) => q.nat, reps: (q) => q.rep, jumping: (q) => q.jump, longShots: (q) => q.ls,
  tacticalCell: (q) => [q.x, q.y], manMarkTarget: () => null, freeRun: (q) => q.fr,
  onScore: scores ? (q, s) => scores.set(q.name, s) : undefined, ...o,
});

// markøren (side 0, forsvarer y = 0) i (4,2); hans taktiske felt er hans egen plads
const marker = () => P('M', 0, 4, 2, { nat: 1, jump: 15, ls: 5, pos: 0x4 });
const keeper1 = () => P('GK', 1, 4, 11, { pos: 0x1, posAttack: 0x1 });

describe('zonevalget sub_6bc030', () => {
  it('en modstander i zonen: scoren regnet i hånden og rand(105), rand(30), rand(30)', () => {
    const m = marker(), a = P('A', 1, 4, 3);
    const sc = new Map<string, number>();
    const { rand, log } = scripted([10, 5, 20]);
    expect(zonalPick(world([m, keeper1(), a], {}, sc), m, rand)).toBe(a);
    // r = 10 (5 < Jumping 12, men 20 ≥ 15) · 10·(0+0+10) = 100 · −ftol(180 − 183) = +3 · −ftol(8² − 100) = +36 · −sup² = −9 (han selv
    // på d = 0 → 3; keeperen tæller ikke) · −50·1² = −50 → 90; angriber C i begge opstillinger → ingen bonus; ry: verden 150 → 1; −50
    expect(sc.get('A')).toBe(41);
    expect(log).toEqual([105, 30, 30]);
  });

  it('boldholderen vurderes først (pseudo-rækken), med Long shots og sup³', () => {
    const m = marker(), a = P('A', 1, 4, 3);
    const c = P('C', 1, 5, 2, { nat: 1, rep: [300, 0, 0], shots: 2, shotsOnTarget: 1, penGoalsWon: 1, ls: 10 });
    const sc = new Map<string, number>();
    const { rand, log } = scripted([7, 3, 2, 10, 5, 20]);
    expect(zonalPick(world([m, keeper1(), a, c], { carrier: c }, sc), m, rand)).toBe(c);
    // goalD = f32(2,23) + 5; r = 7 + ftol(225 − 72,3) = 159; s = 230 + 47 − 4³ + 30 + 7 − 50 = 200; ry hjemme (samme nation) 300 → 3
    expect(sc.get('C')).toBe(312);
    expect(sc.get('A')).toBe(34); // A: sup er nu 4 (boldholderen står 1,41 væk) → −16 i stedet for −9
    expect(log).toEqual([105, 30, 30, 105, 30, 30]);
  });

  it('kandidater, der afvises før første rand: 3 markører, forbi linjen, egen halvdel med Positioning-rul', () => {
    const m = marker();
    const full = P('F', 1, 3, 2, { markers: [1, 2, 3] });
    const off = P('O', 1, 5, 2);
    const { rand, log } = scripted([]);
    // side 1's afstand forbi linjen = lineSide0 − y = 3 − 2 = 1 > 0 → O står forbi linjen
    expect(zonalPick(world([m, full, off], { lineSide0: 3 }), m, rand)).toBeNull();
    expect(log).toEqual([]);
    // offside-fælden (side 0 har 0x400) + Positioning-rul ≠ 0: på linjen (0) tæller også
    const m2 = P('M2', 0, 4, 2, { roll: { positioning: 20, flair: 0 } });
    const on = P('L', 1, 4, 3);
    const r2 = scripted([]);
    expect(zonalPick(world([m2, on], { lineSide0: 3, teamFlags: [0x400, 0] }), m2, r2.rand)).toBeNull();
    // uden fælden er "på linjen" (3 − 3 = 0) i orden → han vurderes: rand(5·(21 − 20)) = rand(5)
    const r3 = scripted([]);
    expect(zonalPick(world([m2, on], { lineSide0: 3 }), m2, r3.rand)).toBe(on);
    expect(r3.log[0]).toBe(5);
  });

  it('egen halvdel: en modstander på sin egen banehalvdel bliver stående, når markørens zone også er i hans egen halvdel', () => {
    // markøren side 1 (forsvarer y = 11) med zonen i y 3 (modstanderens halvdel): A (side 0, y 4 = A's egen halvdel) vurderes
    const m = P('M', 1, 4, 3, { roll: { positioning: 3, flair: 0 }, nat: 1 });
    const a = P('A', 0, 4, 4);
    const r1 = scripted([]);
    expect(zonalPick(world([m, a], { lineSide1: 11 }), m, r1.rand)).toBe(a);
    const m2 = P('M2', 1, 4, 7, { roll: { positioning: 3, flair: 0 }, nat: 1 });
    const b = P('B', 0, 4, 5);  // B i egen halvdel (y < 6), markørens zone y 7 ≥ 6 → bliver stående
    const r2 = scripted([]);
    expect(zonalPick(world([m2, b], { lineSide1: 11, tacticalCell: () => [4, 6] }), m2, r2.rand)).toBeNull();
    expect(r2.log).toEqual([]);
  });

  it('straks-retur: den, han dækkede sidst, med frit løb', () => {
    const m = marker(), a = P('A', 1, 4, 3), b = P('B', 1, 3, 3, { fr: 1, shots: 0 });
    const big = P('X', 1, 5, 3, { shots: 50 });
    m.marks = b;
    const sc = new Map<string, number>();
    const { rand } = scripted([]);
    // rækkefølgen er række zy−1 (y 1: ingen), y 2 (ingen), y 3: søjle 3 (B) før 4 (A) og 5 (X) → B returneres straks
    expect(zonalPick(world([m, a, b, big], {}, sc), m, rand)).toBe(b);
    expect(sc.has('A')).toBe(false);
  });

  it('frit løb uden at være den sidste: +175', () => {
    const m = marker(), a = P('A', 1, 4, 3, { fr: 2 });
    const sc = new Map<string, number>();
    zonalPick(world([m, a], {}, sc), m, scripted([10, 5, 20]).rand);
    expect(sc.get('A')).toBe(41 + 175);
  });

  it('positionsbonusser: central AM (fri rolle ×10), rykker op som angriber (+125), instruktionsbit (+40)', () => {
    const base = (o: Partial<TP>) => { const m = marker(), a = P('A', 1, 4, 3, o); const sc = new Map<string, number>(); zonalPick(world([m, a], {}, sc), m, scripted([10, 5, 20]).rand); return sc.get('A')!; };
    const ref = base({ pos: 0x240, posAttack: 0x240 });
    expect(base({ pos: 0x220, posAttack: 0x220, freeRoleRating: 7 }) - ref).toBe(70);
    expect(base({ pos: 0x210, posAttack: 0x240 }) - ref).toBe(125);
    expect(base({ pos: 0x210, posAttack: 0x210, instr: 0x800000n }) - ref).toBe(40);
  });

  it('16-bit signed sammenligning: en score over 32767 taber', () => {
    const m = marker();
    const a = P('A', 1, 4, 3, { shots: 3300 });   // ≈ 33.000 → negativ som int16
    const b = P('B', 1, 5, 3);
    const sc = new Map<string, number>();
    expect(zonalPick(world([m, a, b], {}, sc), m, scripted([]).rand)).toBe(b);
    expect(sc.get('A')!).toBeGreaterThan(32767);
  });

  it('taktikbit 1 og mandsopdækning går forud uden rand', () => {
    const m = marker(), a = P('A', 1, 4, 3), t = P('T', 1, 8, 10);
    const r = scripted([]);
    expect(zonalPick(world([{ ...m, tacticByte: 1 }, a]), { ...m, tacticByte: 1 }, r.rand)).toBeNull();
    expect(zonalPick(world([m, a, t], { manMarkTarget: () => t }), m, r.rand)).toBe(t);
    expect(r.log).toEqual([]);
  });
});
