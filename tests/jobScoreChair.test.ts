// 0x69d1b0 score_staff_for_job (job 5) mod originalen: computerkandidaterne til ledige job i små engelske klubber med og uden formandens
// ikke-spillerpost (ev = club +0xbf) – originalens tal fra unicorn på oraklets øjebliksbillede (xfer3 post-200-2001, frø 1), og 0x537c47's
// fødselsdato for ikke-spillere
import { describe, expect, it } from 'vitest';
import { scoreStaffForJob, type BoardEnv, type Person } from '../src/game/cmBoard';
import { cmStaffDob } from '../src/game/data/cm0102';

// np = [CA, PA, rep +8, +0xa, +0xc, de 21 bytes +0x0e..+0x22]; ch = formandens 21 bytes; sc/sc0 = originalens score med/uden formandens post
const ROWS = [
  { club: 'Darlington', crep: 3001, sc: 7559, sc0: 6114, np: [30, 84, 3250, 3250, 1500, 8, 3, 5, -10, 15, 15, 8, 12, 2, -5, -5, 7, 6, -5, 13, 4, -35, 10, 5, 12, 12], age: 41, job: 5, p: [18, 14, 10, 10], ch: [3, 20, 1, -19, 10, 16, 6, 3, 1, 26, 6, -9, 13, -24, 2, 11, -29, 8, 20, 1, 3] },
  { club: 'Darlington', crep: 3001, sc: 4980, sc0: 3551, np: [30, 117, 24, 1190, 77, 4, 3, -1, 4, 9, 11, 3, 4, 2, -1, -16, -26, 7, -16, 2, 2, -11, 2, 7, 24, 6], age: 42, job: 5, p: [16, 10, 10, 11], ch: [3, 20, 1, -19, 10, 16, 6, 3, 1, 26, 6, -9, 13, -24, 2, 11, -29, 8, 20, 1, 3] },
  { club: 'Hartlepool United', crep: 3001, sc: 7351, sc0: 6114, np: [30, 84, 3250, 3250, 1500, 8, 3, 5, -10, 15, 15, 8, 12, 2, -5, -5, 7, 6, -5, 13, 4, -35, 10, 5, 12, 12], age: 41, job: 5, p: [18, 14, 10, 10], ch: [4, 5, 3, -7, 1, 8, 1, 9, 13, -2, 3, -2, 8, -27, 4, 13, 8, 10, 4, -17, 6] },
  { club: 'Burnley', crep: 5000, sc: 11034, sc0: 10089, np: [100, 160, 4249, 4249, 1499, 15, 15, 7, -18, 15, 18, 20, 9, 20, -3, -8, 7, 13, 7, 5, 15, -18, 20, 20, -18, 17], age: 39, job: 5, p: [16, 20, 17, 13], ch: [9, 3, -30, -30, 3, 4, 14, 17, 10, -20, -35, 5, 5, 20, 9, 14, 20, 16, 15, 23, 17] },
  { club: 'Burnley', crep: 5000, sc: 8628, sc0: 7267, np: [120, 120, 4012, 4012, 6, 9, 5, -9, -24, 14, 9, 15, 11, 13, 16, 16, 6, 12, -4, 13, 2, -55, 7, 6, -39, 16], age: 39, job: 5, p: [15, 18, 7, 16], ch: [9, 3, -30, -30, 3, 4, 14, 17, 10, -20, -35, 5, 5, 20, 9, 14, 20, 16, 15, 23, 17] },
  { club: 'Burnley', crep: 5000, sc: 8580, sc0: 7779, np: [110, 140, 4557, 4557, 2501, 15, 5, -17, 3, 15, 9, 20, 10, 10, 3, -2, -17, 13, -12, 4, 6, -46, 17, 2, 8, 16], age: 47, job: 5, p: [4, 20, 20, 20], ch: [9, 3, -30, -30, 3, 4, 14, 17, 10, -20, -35, 5, 5, 20, 9, 14, 20, 16, 15, 23, 17] },
];

describe('0x69d1b0: formandens forenelighed og (PA−CA)²-bonussen', () => {
  for (const [i, r] of ROWS.entries()) {
    it(`${r.club} kandidat ${i}: ${r.sc} med formand, ${r.sc0} uden`, () => {
      const C = 100, ENG = 1;
      const p = { id: i, human: false, np: true, nation: ENG, club: 200, job: r.job, joined: { day: 0, year: 2000 }, age: r.age,
        b59: r.p[0], det: r.p[1], pres: r.p[2], prof: r.p[3], temper: 10, amb: 10, b22: 0, ca: r.np[0], pa: r.np[1], rep: [r.np[2], r.np[3], r.np[4]],
        at: (o: number) => r.np[5 + o - 0x0e], natJob: 0 } as Person;
      for (const withCh of [true, false]) {
        // engelsk kandidat i en engelsk klub: sprogets faktor 1 (0x7c6830 = 10), verdensdelen 1
        const env = {
          chair: () => (withCh ? { b16: r.ch[0x16 - 0x0e], b1d: r.ch[0x1d - 0x0e], amb: 10, nation: ENG, np: r.ch } : null),
          clubRep: (c: number) => (c === C ? r.crep : 2000), isNat: () => false, clubNation: () => ENG, foreign: () => false, nat85: () => 15,
          division: () => 1, divLevel: () => 1, fluency: () => 10, nat7e: () => 1,
        } as unknown as BoardEnv;
        expect(scoreStaffForJob(env, p, C, 5)).toBe(withCh ? r.sc : r.sc0);
      }
    });
  }
});

describe('0x537c47: ikke-spillernes fødselsdato', () => {
  const seq = (...v: number[]) => { let k = 0; return () => v[k++]; };
  it('alder 29..75 beholdes; uden dato/kun år/udenfor → nyt år (1901..1966 fra +0x18, ellers 1940 + rand(26)), måned, dag', () => {
    expect(cmStaffDob(224, 1965, 1965, seq())).toBeUndefined();                    // 35 år
    expect(cmStaffDob(0, 1900, 0, seq(13, 4, 26))).toBe('1953-05-27');            // ingen dato: 1940 + 13
    expect(cmStaffDob(0, 1900, 1969, seq(6, 0, 0))).toBe('1946-01-01');           // kun året 1969 (≥ 1967): nyt år
    expect(cmStaffDob(0, 1900, 1958, seq(2, 9))).toBe('1958-03-10');              // kun året 1958: beholdes, ny dag/måned
    expect(cmStaffDob(32, 1922, 1922, seq(6, 10))).toBe('1922-07-11');            // 79 år: året 1922 beholdes
    expect(cmStaffDob(160, 1984, 1984, seq(22, 1, 5))).toBe('1962-02-06');        // 16 år: 1940 + 22
  });
});
