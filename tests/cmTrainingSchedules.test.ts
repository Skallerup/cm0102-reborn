// CM 01/02's træningsskemaer og trænere (cmTraining.ts: 0x8b3d40, 0x8b4e50, 0x8b1991, 0x8b2880, 0x8b41d0)
import { describe, expect, it } from 'vitest';
import { SCHEDULE_LEVELS, coachBytes, coachValue, joinSlot, newHumanSchedules, slotOf } from '../src/game/cmTraining';
import type { Staff } from '../src/game/types';

describe('menneskets skemaer', () => {
  it('0x8b3d40: ti pladser i originalens rækkefølge, faste typer fra 0x8b4e50', () => {
    const s = newHumanSchedules();
    expect(s.map((x) => x.t)).toEqual([-1, 0, 1, 2, 3, 4, 5, 6, 7, 7]);
    expect(s[3].lv).toEqual([50, 10, 10, 10, 0]);   // Fitness: +4
    expect(s[4].lv).toEqual([10, 10, 50, 10, 0]);   // Shooting: +6
    expect(s[5].lv).toEqual([10, 10, 10, 50, 0]);   // Skill: +7
    expect(s[6].lv).toEqual([10, 50, 10, 10, 0]);   // Tactics: +5
    expect(s[7].lv).toEqual(SCHEDULE_LEVELS[6]);
  });
  it('0x8b1991: målmænd på Gk, andre på General, ellers plads 1', () => {
    const s = newHumanSchedules();
    expect(joinSlot(s, 20)).toBe(7);
    expect(joinSlot(s, 1)).toBe(2);
    expect(joinSlot(s.map((x) => ({ ...x, t: x.t === 1 || x.t === 6 ? 8 : x.t })), 20)).toBe(1);
    expect(slotOf(12)).toBe(1);
  });
});

describe('trænerne', () => {
  const coach = (np?: number[], coaching = 15): Staff => ({ id: 1, first: 'A', last: 'B', club: 1, role: 'coach', attrs: { coaching } as Staff['attrs'], rep: 1, wage: 1, expires: '2003-06-30', ...(np ? { cmNp: np, ca: 100 } : {}) } as Staff);
  it('0x8b2880: områdernes værdi delt med spredningen, 1..20, 0 for fravalgte', () => {
    const c = coach(undefined, 15);
    // uden cmNp: Coaching 15 overalt → Fitness (15 − 15 + 21)/2 = 10, Tactics 15, Shooting 15, Skills 15, Gk 15; fem områder → /2,0
    expect(coachBytes(c, undefined)).toEqual([5, 7, 7, 7, 7]);
    // ét område: /1,0
    expect(coachBytes(c, ['tactics'])).toEqual([0, 15, 0, 0, 0]);
    // to områder: /1,2f (12/1,2f = 9,9999996 → 9 som x87)
    expect(coachBytes(coach(undefined, 12), ['skills', 'goalkeeping'])).toEqual([0, 0, 0, 9, 9]);
  });
  it('0x8b41d0: summen / andelen, ×5,714…, mindst 50 (eksakt produkt: 14 → 80)', () => {
    expect(coachValue([], 0)).toBe(50);
    expect(coachValue([[14, 0, 0, 0, 0]], 0)).toBe(80);
    expect(coachValue([[20, 0, 0, 0, 0], [20, 0, 0, 0, 0]], 0)).toBe(154); // 40/1,45f = 27,58 → 27 → 154,28
  });
});
