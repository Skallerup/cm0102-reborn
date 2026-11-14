// Ønskelisterne (cmShortlistGame.ts): de håndporterede dele omkring de mekanisk oversatte Shortlist_Manager-funktioner – trupplanens hale
// 0x83e9bd–0x83ebe9 (+3/+7/+0xb), 0x5cccd0's port med 0x844540, qsort-sammenligningerne 0x83b690/0x83b670/0x757ea0, CRT-portene i x86.ts
// (pow 0x945ff0, __alldiv 0x945e80, realloc 0x945667) og Interested 0x842180 af de gemte par og pladser.
import { describe, expect, it } from 'vitest';
import { SparseMem } from '../src/game/cmMem';
import { QSORT_CMP, X86 } from '../src/game/cmGen/x86';
import { ensureImpls } from '../src/game/cmGen/impls';
import { dailyGate, newPlanEntry } from '../src/game/cmSquadPlan';
import { cmInterestedClubs, SL_ON } from '../src/game/cmShortlistGame';
import { toRow, fromRow } from '../src/game/cmSquadPlanGame';
import { personalFill_535a80 } from '../src/game/cmStaffInit';
import type { GameState, Player } from '../src/game/types';

describe('0x5cccd0: porten til 0x83a730', () => {
  it('tilstand 2 går straks videre – men ikke, når en plads har et bud (0x844540 ≠ 0)', () => {
    const e = newPlanEntry(); e.state = 2;
    expect(dailyGate(e, () => 0, 0)).toBe(true);
    const e2 = newPlanEntry(); e2.state = 2;
    // med bud: rand(70) + 30 mod tælleren (1) – lukket
    expect(dailyGate(e2, () => 0, 1)).toBe(false);
    expect(e2.counter).toBe(1);
  });
});

describe('pladserne gemmes med +3/+7/+0xb', () => {
  it('toRow/fromRow bevarer de nye felter, og ældre rækker (9 tal) læses med 0', () => {
    const s = { ...newPlanEntry().slots[0], b3: 31020, b7: 3856320, bb: 14736 };
    expect(fromRow(toRow(s))).toMatchObject({ b3: 31020, b7: 3856320, bb: 14736 });
    expect(toRow({ ...s, b3: 0, b7: 0, bb: 0 }).length).toBe(9);
    expect(fromRow([0xb, 1, 0x1e, -1, -1, -1, 0, 1, 1997])).toMatchObject({ b3: 0, b7: 0, bb: 0 });
  });
});

describe('qsort-sammenligningerne', () => {
  ensureImpls();
  const m = new SparseMem();
  const slot = (a: number, f: number, o: number, v: number) => { m.w32(a + 0xf, f); m.w32(a + 0x17, o); m.w32(a + 0xb, v); return a; };
  it('0x83b690: pladser uden mål og bud først, så faldende værdi, aldrig 0', () => {
    const cmp = QSORT_CMP[0x83b690];
    expect(cmp(m, slot(0x1000, 5, -1, 9), slot(0x1100, -1, -1, 1))).toBe(1);
    expect(cmp(m, slot(0x1000, -1, -1, 9), slot(0x1100, 7, -1, 1))).toBe(-1);
    expect(cmp(m, slot(0x1000, -1, 3, 9), slot(0x1100, -1, -1, 1))).toBe(1);
    expect(cmp(m, slot(0x1000, -1, -1, 9), slot(0x1100, -1, -1, 1))).toBeLessThan(0);
    expect(cmp(m, slot(0x1000, -1, -1, 4), slot(0x1100, -1, -1, 4))).toBe(1);
  });
  it('0x83b670: positionslisterne efter +8, så +4', () => {
    const cmp = QSORT_CMP[0x83b670];
    m.w32(0x2008, 100); m.w32(0x2004, 3); m.w32(0x2108, 100); m.w32(0x2104, 5);
    expect(cmp(m, 0x2000, 0x2100)).toBe(-2);
    m.w32(0x2108, 50);
    expect(cmp(m, 0x2000, 0x2100)).toBe(50);
  });
});

describe('CRT i x86.ts', () => {
  const m = new SparseMem();
  const R = new X86({ m, rand: () => 0, call: () => 0 }, m);
  R.esp = 0x3f0000;
  it('pow 0x945ff0 tager ST(1)^ST(0) af x87-stakken som originalen (9^1,5 = 26,999…)', () => {
    R.fpush(9); R.fpush(1.5);
    R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false, float: true });
    expect(R.st.length).toBe(1);
    expect(R.fpop()).toBe(26.999999999999993);
  });
  it('__alldiv 0x945e80 dividerer 64 bit med fortegn og rydder 16 bytes', () => {
    const a = -10_000_000_000n, b = 3n;
    const w = (o: number, v: bigint) => { const u = BigInt.asUintN(64, v); m.w32(R.esp + o, Number(u & 0xffffffffn)); m.w32(R.esp + o + 4, Number(u >> 32n)); };
    w(0, a); w(8, b);
    const esp = R.esp;
    R.call(0x945e80, { n: 4, thisEcx: false, calleeClean: true });
    const q = BigInt.asIntN(64, (BigInt(R.edx >>> 0) << 32n) | BigInt(R.eax >>> 0));
    expect(q).toBe(a / b);
    expect(R.esp).toBe(esp + 16);
  });
  it('malloc/realloc 0x944e46/0x945667 kopierer det gamle indhold', () => {
    m.w32(R.esp, 8);
    R.call(0x944e46, { n: 1, thisEcx: false, calleeClean: false });
    const p = R.eax >>> 0;
    m.w32(p, 0xdeadbeef);
    m.w32(R.esp, p); m.w32(R.esp + 4, 64);
    R.call(0x945667, { n: 2, thisEcx: false, calleeClean: false });
    expect(m.u32(R.eax >>> 0)).toBe(0xdeadbeef);
    expect(R.eax >>> 0).not.toBe(p);
  });
});

describe('Interested 0x842180 (computerklubberne)', () => {
  it('klubber, hvis plads med ham har en budgetandel +7 over hans værdi +0x52 – ikke hans egen klub og ikke tælleren ≥ 100', () => {
    const p = { id: 7, club: 1, value: 1_000_000 / 0.86 } as unknown as Player;
    const row = (f: number, b7: number) => toRow({ ...newPlanEntry().slots[0], f, b7, b3: 1, bb: 1 });
    const g = {
      seed: 1, draft: false, options: { mode: 'authentic' }, dbKind: 'cm0102', dbYear: 2001,
      players: { 7: p }, clubs: { 1: { id: 1 }, 2: { id: 2 }, 3: { id: 3 }, 4: { id: 4 } },
      cmSlPairs: [[7, 1], [7, 2], [7, 3], [7, 4], [8, 2]],
      cmPlan: {
        1: { s: [row(7, 5_000_000)], st: 1, fm: 0, c: 0 },
        2: { s: [row(9, 0), row(7, 1_200_000)], st: 1, fm: 0, c: 0 },
        3: { s: [row(7, 900_000)], st: 1, fm: 0, c: 0 },
        4: { s: [row(7, 9_000_000)], st: 1, fm: 0, c: 100 },
      },
    } as unknown as GameState;
    expect(cmInterestedClubs(g, p)).toEqual([]);                            // slået fra (SL_ON)
    SL_ON.on = true;
    expect(cmInterestedClubs(g, p)).toEqual([2]);
    expect(cmInterestedClubs({ ...g, options: { mode: 'extended' } } as unknown as GameState, p)).toEqual([]);
    SL_ON.on = false;
  });
});

describe('sub_535a80: formændenes Ambition/Loyalty, når databasen har 0', () => {
  it('1..20 bevares, −1 → rand(16) + 5, ellers snittet (Ambition) eller den mindste (Loyalty) af to terninger', () => {
    const seq = (xs: number[]) => { let i = 0; return () => xs[i++]; };
    expect(personalFill_535a80(14, seq([]), 'avg')).toBe(14);
    expect(personalFill_535a80(255, seq([3]), 'avg')).toBe(8);
    expect(personalFill_535a80(0, seq([4, 11]), 'avg')).toBe(8);   // (5 + 12) / 2
    expect(personalFill_535a80(0, seq([4, 11]), 'min')).toBe(5);
  });
});
