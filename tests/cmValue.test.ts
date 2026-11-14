// Værdiformlen 0x4d0c60 håndporteret (src/game/cmValue.ts) mod den mekanisk oversatte (cmGen/f_4d0c60.ts) – på en lille hukommelse med
// tilfældige personer, kontrakter, klubber, managere og lande: samme værdi og samme [0xae1080] for alle grenene (flag 0/1, bedømmelse −1/fast,
// egen og fremmed klub, frikøbsklausuler, landene [0x9cf434]/[0x9cf300]/[0x9cf484]). Det store tjek på spillets data: scripts/cm-value-check.ts.
import { describe, expect, it } from 'vitest';
import { SparseMem, G, type CmCtx } from '../src/game/cmMem';
import { ensureImpls } from '../src/game/cmGen/impls';
import { slCall } from '../src/game/cmShortlist';
import { cmMemCall } from '../src/game/cmWageGame';
import { playerValue_4d0c60 } from '../src/game/cmValue';
import { AGE_PCT_9A7F30 } from '../src/game/cmKeyIds';

const STAFF0 = 0x10000000, REC0 = 0x20000000, NP0 = 0x24000000, CLUB0 = 0x30000000, NAT0 = 0x38000000, DIV0 = 0x3c000000, K0 = 0x50000000, ROWS0 = 0x58000000;
function lcg(seed: number) { let s = seed >>> 0; return (n: number) => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s % n; }; }

function world(seed: number) {
  const r = lcg(seed), m = new SparseMem();
  const c: CmCtx = { m, rand: () => 1, call: (adr, ...a) => cmMemCall(c, adr, ...a) };
  const nPeople = 300, nClubs = 20, nNat = 8;
  m.w32(G.STAFF, STAFF0); m.w32(G.CLUBS, CLUB0); m.w32(G.STAFF_COUNT, nPeople + 40); m.w32(G.ROWS, ROWS0);
  m.w32(G.CM, 0x5e000008); m.w32(0x5e000008, K0); m.w32(0xae235c, nClubs + 2 * nNat); m.w32(0xae2350, nNat);
  m.w16(G.TODAY, 195); m.w16(G.TODAY + 2, 2001);
  m.w32(0xdd7120, 12345);
  AGE_PCT_9A7F30.forEach((v, i) => m.w8(0x9a7f30 + i, v));
  // nøglelandene: 0 = [0x9cf434], 1 = [0x9cf300], 2 = [0x9cf484], 3 = [0x9cf260]; resten −1
  for (let a = 0x9cf200; a <= 0x9cf544; a += 4) m.w32(a, -1);
  m.w32(0x9cf434, 0); m.w32(0x9cf300, 1); m.w32(0x9cf484, 2); m.w32(0x9cf260, 3); m.w32(0x9cfa10, 0);
  for (let a = 0x9d0120; a <= 0x9d0524; a += 4) m.w32(a, -1);
  for (let a = 0xb63c9c; a <= 0xb63d00; a += 4) m.w32(a, -1);
  const nat = (n: number) => NAT0 + 0x200 * n;
  for (let n = 0; n < nNat; n++) { const a = nat(n); m.w32(a, n); m.w8(a + 0x7e, r(5)); m.w8(a + 0x85, r(20)); m.w16(a + 0x8e, r(2000)); m.w32(a + 0x71, 0x3dfe0000 + 0x100 * r(3)); }
  for (let k = 0; k < 3; k++) m.w32(0x3dfe0000 + 0x100 * k, k);
  const club = (i: number) => CLUB0 + 0x245 * i;
  for (let i = 0; i < nClubs; i++) {
    const a = club(i);
    m.w32(a, i); m.w32(a + 0x53, nat(r(nNat))); if (r(4)) { const d = DIV0 + 0x80 * i; m.w32(a + 0x57, d); m.w16(d + 0x69, r(12000)); }
    m.w8(a + 0x64, r(5)); m.w16(a + 0x80, r(10000));
    // manageren (ikke-spiller) – id efter spillerne; nogle klubber uden
    if (r(5)) {
      const id = nPeople + i, st = STAFF0 + 0x6e * id, np = NP0 + 0x40 * id;
      m.w32(st, id); m.w32(st + 0x39, a); m.w32(st + 0x1a, nat(r(nNat))); m.w32(st + 0x69, np);
      m.w16(np + 4, r(200)); m.w8(np + 0x17, 1 + r(20)); m.w8(np + 0x18, 1 + r(20));
      m.w16(np + 8, r(9000)); m.w16(np + 0xa, r(9000)); m.w16(np + 0xc, r(9000));
      m.w32(a + 0xcf, st);
    }
  }
  const people: number[] = [];
  for (let id = 0; id < nPeople; id++) {
    const st = STAFF0 + 0x6e * id, pr = REC0 + 0x50 * id;
    m.w32(st, id); m.w8(st + 0x18, 16 + r(22)); m.w32(st + 0x1a, nat(r(nNat))); if (r(6) === 0) m.w32(st + 0x1e, nat(r(nNat)));
    m.w8(st + 0x22, r(4) ? 0 : r(90)); m.w32(st + 0x61, pr);
    m.w16(pr + 5, r(200)); m.w16(pr + 7, r(200)); m.w16(pr + 9, r(10000)); m.w16(pr + 0xb, r(10000)); m.w16(pr + 0xd, r(10000));
    for (let i = 0; i < 7; i++) m.w8(pr + 0xf + i, r(3) ? 1 + r(14) : 15 + r(6));
    for (const o of [0x27, 0x28, 0x2d, 0x2f, 0x36, 0x43]) m.w8(pr + o, 1 + r(20));
    m.w32(ROWS0 + 79 * id + 4, -1);
    if (r(8)) {
      const k = K0 + 80 * id, cl = r(nClubs);
      m.w32(ROWS0 + 79 * id, id); m.w32(st + 0x39, club(cl));
      m.w32(k, id); m.w32(k + 4, cl);
      m.w16(k + 0x2d, r(365)); m.w16(k + 0x2f, 2000 + r(6));
      m.w8(k + 0x35, [1, 2, 2, 2, 5][r(5)]); m.w8(k + 0x3d, r(3) ? 0 : r(10));
      if (r(5) === 0) { m.w8(k + 0x1c + r(4), [1, 2][r(2)]); m.w32(k + 0x21, r(4_000_000)); }
    } else m.w32(ROWS0 + 79 * id, -1);
    people.push(st);
  }
  return { m, c, people, clubs: Array.from({ length: nClubs }, (_, i) => club(i)), r };
}

describe('0x4d0c60 håndporteret = oversat', () => {
  ensureImpls();
  for (const seed of [1, 2, 3]) {
    it(`frø ${seed}: alle personer, egen og fremmed klub, flag 0/1, bedømmelse −1/fast`, () => {
      const W = world(seed);
      let n = 0, bad = 0, nz = 0;
      const first: unknown[] = [];
      for (const st of W.people) {
        const k = W.m.s32(ROWS0 + 79 * W.m.s32(st)), own = k >= 0 ? CLUB0 + 0x245 * W.m.s32(K0 + 80 * k + 4) : 0;
        const cases: [number, number, number][] = [[W.clubs[W.r(W.clubs.length)], 0, -1], [W.clubs[W.r(W.clubs.length)], 1, -1], [W.clubs[W.r(W.clubs.length)], 0, W.r(300)]];
        if (own) cases.push([own, 0, -1], [own, 1, -1]);
        for (const [club, flag, judge] of cases) {
          const a = slCall(W.c, 0x4d0c60, 0, st, club, flag, judge, 0) | 0, ka = W.m.u32(0xae1080);
          const b = playerValue_4d0c60(W.c, st, club, flag, judge, 0) | 0, kb = W.m.u32(0xae1080);
          n++; if (a > 0) nz++;
          if (a !== b || ka !== kb) { bad++; if (first.length < 3) first.push({ st: st.toString(16), club: club.toString(16), flag, judge, a, b }); }
        }
      }
      expect(first).toEqual([]);
      expect(bad).toBe(0);
      expect(n).toBeGreaterThan(900);
      expect(nz).toBeGreaterThan(n / 4);
    });
  }
});
