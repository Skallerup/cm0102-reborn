// Hjemmebanen i gittermotoren: publikums-bytene fra init_match 0x6b871a og nervøsiteten i sub_6ec010 0x6ec4cd (sikker)
import { describe, expect, it } from 'vitest';
import { crowdBytes, nervesOf } from '../src/game/engine/grid/gridMatch';
import { matchCa } from '../src/game/engine/grid/helpers';

describe('publikums-bytene engine+0x1ad/+0x1ae', () => {
  it('fyldt hjemmestadion: hjemmeholdet 0, udeholdet 5', () => {
    expect(crowdBytes({ total: 35428, home: 32594, away: 2834 })).toEqual([0, 5]);
  });
  it('uden tilskuere: init_match bruger 100/90/10 → [0, 1]', () => {
    expect(crowdBytes({ total: 0, home: 0, away: 0 })).toEqual([0, 1]);
  });
  it('flest udebanefans: side 0 klemmes til 0..10, side 1 får mindst c = 1 på eget stadion, ellers 0 (negativ y)', () => {
    expect(crowdBytes({ total: 20000, home: 2000, away: 18000 })).toEqual([3, 1]);
    expect(crowdBytes({ total: 20000, home: 2000, away: 18000 }, false)).toEqual([3, 0]);
    expect(crowdBytes({ total: 100000, home: 100000, away: 0 })[1]).toBe(10);
  });
});

describe('nervøsiteten [esp+0x1c]', () => {
  it('0 uden byte; Premier League (omdømme 18) med byte 5 ≈ 35 CA-point', () => {
    expect(nervesOf(0, 10, 10, false, 18)).toBe(0);
    expect(nervesOf(5, 10, 10, false, 18)).toBeCloseTo(35.14, 1);
    expect(nervesOf(5, 15, 15, false, 18)).toBeCloseTo(32.66, 1);       // Professionalism/Important Matches dæmper
    expect(nervesOf(5, 10, 10, true, 18)).toBeCloseTo(18.49, 1);        // keeperen ×0,5263
    expect(nervesOf(5, 10, 10, false, 10)).toBeCloseTo(2 * (2 + 2.5 + 22 / 1.35), 1); // omdømme ≤ 12 → k = 1,35
    expect(nervesOf(5, 10, 10, false, 18, true)).toBeCloseTo(2 * (2 + 2.5 + 22 + 1), 1); // finale: +3,5, ingen divisor
    expect(nervesOf(1, 20, 20, false, 18)).toBeGreaterThanOrEqual(1);
  });
  it('trækkes fra kamp-CA (sub_6ec010 0x6ec789)', () => {
    const base = matchCa({ ca: 150, pa: 170, isKeeper: false }).K, away = matchCa({ ca: 150, pa: 170, isKeeper: false, nerves: 35 }).K;
    expect(base - away).toBe(18);
  });
});
