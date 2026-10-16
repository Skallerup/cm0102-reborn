import { describe, expect, it } from 'vitest';
import { roundRobin } from '../src/game/competitions';
import { makePlayer } from '../src/game/data/generate';
import { attrRange } from '../src/game/scouting';
import { calendar } from '../src/game/competitions';

describe('kampprogram', () => {
  it('cirkelmetoden: alle møder alle præcis én gang', () => {
    const clubs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const rounds = roundRobin(clubs);
    expect(rounds.length).toBe(11);
    const seen = new Set<string>();
    for (const r of rounds) {
      const playing = r.flat();
      expect(new Set(playing).size).toBe(playing.length);
      for (const [h, a] of r) seen.add([h, a].sort().join('-'));
    }
    expect(seen.size).toBe((12 * 11) / 2);
  });

  it('ulige antal hold giver fridage', () => {
    const rounds = roundRobin([1, 2, 3, 4, 5]);
    expect(rounds.length).toBe(5);
    expect(rounds.every((r) => r.length === 2)).toBe(true);
  });

  it('kalenderen har nok lørdage til en 38-runders liga', () => {
    const cal = calendar(2025);
    expect(cal.saturdays.length + cal.tuesdays.length).toBeGreaterThanOrEqual(46);
    expect(cal.saturdays[0] >= '2025-08-01').toBe(true);
    expect(cal.cl.final > cal.cl.sf[1]).toBe(true);
  });
});

describe('scouting', () => {
  it('den sande værdi ligger altid i intervallet, og intervallet indsnævres', () => {
    const p = makePlayer({ id: 42, first: 'A', last: 'B', dob: '2000-01-01', nation: 0, club: 1, sub: 'CM', foot: 'R', height: 180, ca: 130, date: '2025-07-01', seed: 1 });
    for (let i = 0; i < 36; i++) {
      for (const k of [0, 25, 50, 75, 100]) {
        const [lo, hi] = attrRange(p, i, k);
        const v = Math.round(p.attrs[i]);
        expect(lo).toBeLessThanOrEqual(v);
        expect(hi).toBeGreaterThanOrEqual(v);
        expect(lo).toBeGreaterThanOrEqual(1);
        expect(hi).toBeLessThanOrEqual(20);
      }
      const wide = attrRange(p, i, 0);
      const exact = attrRange(p, i, 100);
      expect(exact[0]).toBe(exact[1]);
      expect(wide[1] - wide[0]).toBeGreaterThan(0);
    }
  });
});

describe('spillergenerering', () => {
  it('er deterministisk pr. seed og id', () => {
    const a = makePlayer({ id: 7, first: 'A', last: 'B', dob: '1999-03-03', nation: 0, club: 1, sub: 'CF', foot: 'L', height: 185, ca: 150, date: '2025-07-01', seed: 5 });
    const b = makePlayer({ id: 7, first: 'A', last: 'B', dob: '1999-03-03', nation: 0, club: 1, sub: 'CF', foot: 'L', height: 185, ca: 150, date: '2025-07-01', seed: 5 });
    expect(a.attrs).toEqual(b.attrs);
    expect(a.pos[6]).toBe(20);
  });
});
