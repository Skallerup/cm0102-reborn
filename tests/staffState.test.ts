// Staffpostens byte [0xae2d0c] + 79·id + 0xa (cmPlayerData.ts staffStateDaily/staffStateInitValue) mod oraklets spor (crowd1.txt, frø 1):
// Seaman (staff 6108, keeper, D/P/Pr 17/20/20, moral 10) og Campbell (2189, forsvarer, 16/18/15) – tallene og de kaldte grænser er sporets
// "sr"-linjer for de første dage, byten før/efter sporets "sd"-linjer.
import { describe, expect, it } from 'vitest';
import { staffStateDaily, staffStateInitValue } from '../src/game/cmPlayerData';

const feed = (xs: [number, number][]) => {
  let i = 0;
  return { rand: (n: number) => { const e = xs[i++]; expect(e, `rand(${n}) ud over sporet`).toBeDefined(); expect(n).toBe(e[0]); return e[1]; }, done: () => i === xs.length };
};
const base = { fatigue: 0, contract: { b44: 0, b45: 0 } as never, club: true, listed: false, age: 30, worldRep: 8000, morale: 10, form: 27, injured: false, job11: true };

describe('staffState (0x5ce2d0 0x5ce4b6–0x5cf481)', () => {
  it('Seaman dag 194: 4 → 3 (henfaldet rand(4) = 1)', () => {
    const f = feed([[200, 157], [20, 7], [290, 151], [15, 10], [40, 6], [4, 1]]);
    const x = staffStateDaily({ ...base, x: 4, ca: 163, gkRating: 20, pos2: 1, id: 6108,
      hid: { determination: 17, loyalty: 19, pressure: 20, professionalism: 20, adaptability: 8 } }, f.rand);
    expect(x).toBe(3); expect(f.done()).toBe(true);
  });
  it('Campbell: N = ftol(1,25·126 + 5) = 162 for forsvarere, ingen ændring', () => {
    const f = feed([[200, 2], [162, 159], [15, 5], [40, 32]]);
    const x = staffStateDaily({ ...base, x: 20, ca: 168, gkRating: 1, pos2: 20, id: 2189,
      hid: { determination: 16, loyalty: 14, pressure: 15, professionalism: 18, adaptability: 12 } }, f.rand);
    expect(x).toBe(20); expect(f.done()).toBe(true);
  });
  it('spilstarten 0x828110: 26/21 − bl − rand(bl), loftet CA·0,15, 0 efter 415 − 10·Adaptability dage', () => {
    expect(staffStateInitValue({ player: true, club: true, days: 0, adaptability: 12, ca: 168 }, () => 3)).toBe(26 - 6 - 3);
    expect(staffStateInitValue({ player: true, club: true, days: 300, adaptability: 10, ca: 168 }, () => 0)).toBe(21 - 5);
    expect(staffStateInitValue({ player: true, club: true, days: 0, adaptability: 2, ca: 60 }, () => 0)).toBe(9);   // loftet ftol(60·0,15)
    expect(staffStateInitValue({ player: true, club: true, days: 300, adaptability: 12, ca: 168 }, () => 0)).toBe(0);
    expect(staffStateInitValue({ player: true, club: false, days: 0, adaptability: 12, ca: 168 }, () => 0)).toBe(0);
  });
});
