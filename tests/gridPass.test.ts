// Afleveringen (sub_6fad40), banevandringen (sub_6ccb60), skudlinjen (sub_6cc540/sub_70dfd0) og den løftede bold (sub_6fa490) i
// gittermotoren – deterministiske tilfælde (pass.ts).
import { describe, expect, it } from 'vitest';
import { cdist, flightTicks, interceptRadius, loftFacing, loftedTarget, makePass, passScatter, walkPassLine, walkShotLine, type PassCtx } from '../src/game/engine/grid/pass';
import { actionSkills } from '../src/game/engine/grid/challenge';
import type { GP, GridMatchState } from '../src/game/engine/grid/gridMatch';

const cells = (walk: (visit: (x: number, y: number, d: number) => boolean) => boolean) => {
  const out: [number, number][] = [];
  walk((x, y) => { out.push([x, y]); return false; });
  return out;
};
/** rand fra en kø af svar; n'erne, der blev spurgt om, gemmes */
const script = (vals: number[]) => {
  const asked: number[] = [];
  const r = (n: number) => { asked.push(n); return vals.length ? vals.shift()! : 0; };
  return Object.assign(r, { asked });
};

describe('boldens rejsetid (0x6fff03)', () => {
  it('ftol(2D / max(1, s + 0,2) + 0,5) i spillerture, som byte', () => {
    expect(flightTicks(5, 0)).toBe(10);
    expect(flightTicks(5, 1)).toBe(8);                                     // 10/1,2 + 0,5 = 8,83
    expect(flightTicks(5, 2)).toBe(5);                                     // 10/2,2 + 0,5 = 5,05
    expect(flightTicks(5, 3)).toBe(3);                                     // 10/3,2 + 0,5 = 3,63
    expect(flightTicks(1.41, 0)).toBe(3);
    expect(flightTicks(1000, 0)).toBe(2000 & 0xff);                        // mål uden for banen: afstanden 1000, byten slår om
  });
  it('afstandstabellen er float32 og 1000 uden for banen', () => {
    expect(cdist(0, 0, 1, 1)).toBe(Math.fround(1.41));
    expect(cdist(0, 0, 1, 1) < 1.41).toBe(true);                           // float32 1,41 < double 1,41 (sub_6f6c00's d < 1,41)
    expect(cdist(4, 0, 4, 12)).toBe(1000);
  });
});

describe('opsnapningen på vejen (sub_6ccb60)', () => {
  it('vandrer fra afleverens felt INKLUSIVE til målfeltet EKSKLUSIVE', () => {
    expect(cells((v) => walkPassLine(2, 2, 6, 4, v))).toEqual([[2, 2], [3, 2], [4, 3], [5, 3]]);
    expect(cells((v) => walkPassLine(4, 1, 4, 5, v))).toEqual([[4, 1], [4, 2], [4, 3], [4, 4]]);
    expect(cells((v) => walkPassLine(6, 4, 2, 2, v))).toEqual([[6, 4], [5, 4], [4, 3], [3, 3]]);
    expect(cells((v) => walkPassLine(3, 9, 2, 3, v))).toEqual([[3, 9], [3, 8], [3, 7], [3, 6], [3, 5], [3, 4]]);   // biaksen skifter først på målfeltet
  });
  it('stopper ved banens kant og tjekker feltet foran ved en aflevering på stedet (sic)', () => {
    expect(cells((v) => walkPassLine(1, 10, 1, 14, v))).toEqual([[1, 10], [1, 11]]);
    expect(cells((v) => walkPassLine(4, 5, 4, 5, v))).toEqual([[4, 6]]);
  });
  it('afstanden d er fra afleverens felt; besøget stopper ved første opsnapning', () => {
    const ds: number[] = [];
    walkPassLine(2, 2, 6, 4, (_x, _y, d) => { ds.push(d); return ds.length === 3; });
    expect(ds).toEqual([0, 1, Math.fround(2.23)]);
  });
  it('radius efter type (jump-tabel 0x6cd2bc): 4, 4/5, 1..4 eller 0', () => {
    const top = (n: number) => (n > 0 ? n - 1 : 0), zero = () => 0;
    expect([6, 8, 0x1e, 0x34, 0x37, 0x5b, 0x5c, 0x5e].map((t) => interceptRadius(t, 0, zero))).toEqual([4, 4, 4, 4, 4, 4, 4, 4]);
    expect(interceptRadius(9, 0, top)).toBe(5);                            // rand(V + 3000) ≠ 0 → 5 (næsten altid)
    expect(interceptRadius(0x3e, 0, zero)).toBe(4);
    expect(interceptRadius(0x3c, 0, top)).toBe(4);
    expect(interceptRadius(0xb, 0, top)).toBe(0);
  });
});

describe('præcisionen (sub_6fad40 §5.5)', () => {
  it('upræcis når V − w40 < rand(ftol(10F²)); målet spredes med m = ftol((F·D + 1)·0,5)', () => {
    let r = script([9, 0, 2, 2, 0]);
    expect(passScatter(8, 0, 0, 5, 4, 8, false, 0, r)).toEqual({ x: 6, y: 6, imprecise: true });
    expect(r.asked).toEqual([10, 3, 3, 3, 3]);                             // F = 1 → rand(10); m = ftol(3) = 3
    r = script([9]);
    expect(passScatter(9, 0, 0, 5, 4, 8, false, 0, r)).toEqual({ x: 4, y: 8, imprecise: false });   // grænsen: 9 < 9 er falsk
    expect(r.asked).toEqual([10]);
  });
  it('højde og vejr skalerer F; keeperen rammer rækken, medmindre rand(50·(plads + 400)) = 0', () => {
    let r = script([0, 0, 0, 5]);
    passScatter(-1, 4, 3, 2, 4, 8, true, 0, r);
    expect(r.asked[0]).toBe(Math.trunc(Math.fround(Math.fround(2.2) * Math.fround(1.6)) ** 2 * 10));   // F = 2,2·1,6
    expect(r.asked[3]).toBe(20000);
    r = script([0, 0, 0, 1]);
    expect(passScatter(-1, 0, 0, 2, 4, 8, true, 0, r).y).toBe(8);
  });
});

describe('skudlinjen (sub_6cc540) og blokeringen (sub_70dfd0)', () => {
  it('fra skyttens felt INKLUSIVE til målfeltet INKLUSIVE', () => {
    expect(cells((v) => walkShotLine(2, 8, 11, v))).toEqual([[2, 8], [2, 9], [3, 10], [4, 11]]);
    expect(cells((v) => walkShotLine(4, 3, 0, v))).toEqual([[4, 3], [4, 2], [4, 1], [4, 0]]);
    expect(cells((v) => walkShotLine(4, 11, 11, v))).toEqual([]);
  });
  it('ingen afbøjning: resultatet er altid 0 eller 1, og en blokering afgør selv bolden', () => {
    const F = { technique: 10, agility: 10, balance: 10, strength: 10, acceleration: 10, pace: 10, dribbling: 10, anticipation: 10, tackling: 12, jumping: 12,
      handling: 5, positioning: 10, decisions: 10, bravery: 10, aggression: 10, heading: 10, finishing: 10, passing: 10, crossing: 10, flair: 10, corners: 10,
      freeKicks: 10, throwIns: 10, penalties: 10, stamina: 15 };
    const roll = { pace: 3, anticipation: 3, decisions: 3, offTheBall: 3, marking: 3, flair: 3, positioning: 3, creativity: 3, agility: 3, workRate: 3 };
    const mk = (side: 0 | 1, x: number, y: number, pos = 0x4) => {
      const p = { side, x, y, slot: 1, active: true, busy: 0, roll: { ...roll }, f: { ...F }, gkRating: 1, pos, condition: 10000, rating: 6100, momentum: 0,
        facing: 0, fouls: 0, yellows: 0, reasons: [0, 0], sportsmanship: 10, temperament: 10, pressure: 10, blocks: 0, leftFoot: 10, rightFoot: 10, form: 0 } as unknown as GP;
      p.skill = actionSkills(p);
      return p;
    };
    let seed = 12345;
    const rand = (n: number) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return n <= 0 ? 0 : seed % Math.trunc(n); };
    const seen = new Set<number>(); let taken = 0, loose = 0;
    for (let i = 0; i < 400; i++) {
      const sh = mk(0, 4, 8), d1 = mk(1, 4, 9), d2 = mk(1, 4, 10), k = mk(1, 4, 11, 0x1);
      const m = { gp: [sh, d1, d2, k], carrier: sh, poss: 0, ballX: 4, ballY: 8, ballH: 0, ballSpeed: 0, ballDir: 0, lastTouch: 0, state: 0, touchCount: [0, 0],
        official: { discipline: 10, b24: 10, b27: 10, b28: 10, mood: 0 }, shootout: 0, clock: 100, inFlight: [0, 0], lastToucher: null } as unknown as GridMatchState;
      const ctx = { m, rand, weather: 0, byte1: 0, takeBall: (p: GP) => { m.carrier = p; m.poss = p.side; taken++; }, ballOut: () => {}, intoGoal: () => {},
        restart: (st: number) => { m.state = st; }, card: () => {}, teamFoul: () => {} } as unknown as PassCtx;
      const P = makePass(ctx);
      const r = P.shotLine(sh, 300 + (i % 5) * 100, false);
      seen.add(r);
      if (r === 1 && m.carrier === null) loose++;                          // sub_6cd770 har sluppet bolden
      if (r === 1) expect(m.lastToucher).not.toBeNull();
    }
    expect([...seen].every((r) => r === 0 || r === 1)).toBe(true);
    expect(seen.has(1)).toBe(true);
    expect(taken + loose).toBeGreaterThan(0);
  });
});

describe('den løftede bold (sub_6fa490)', () => {
  it('retningsflagene', () => {
    expect(loftFacing(0, 0)).toEqual({ minusX: false, plusX: false, fwd: true });
    expect(loftFacing(1, 20)).toEqual({ minusX: false, plusX: true, fwd: false });   // springer 40..140-testen over
    expect(loftFacing(1, 180)).toEqual({ minusX: false, plusX: false, fwd: true });
    expect(loftFacing(0, 200)).toEqual({ minusX: true, plusX: false, fwd: false });
    expect(loftFacing(0, 270)).toEqual({ minusX: true, plusX: false, fwd: false });
  });
  it('indlæg fra kanten nær målet: 0x5e mod mållinjen, trukket mod kantkolonnen', () => {
    const top = (n: number) => (n > 0 ? n - 1 : 0);
    expect(loftedTarget({ side: 0, x: 0, y: 9, facing: 0, creativityRoll: 5 }, { x: 0, y: 9, h: 0 }, 0, 0, top)).toEqual({ action: 0x5e, tx: 3, ty: 10 });
    // clearing i egen halvdel med bolden ude af spil (boldhøjde −1): 0x3e, uden justering
    expect(loftedTarget({ side: 0, x: 4, y: 2, facing: 0, creativityRoll: 5 }, { x: 4, y: 2, h: -1 }, -1, 0, top)).toEqual({ action: 0x3e, tx: 4, ty: 10 });
  });
});
