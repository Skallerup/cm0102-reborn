// Originalens udvikling (0x5ce2d0 0x5d38f9–0x5d578d, cmDevelop.ts), re-centreringen 0x538bc0 og træningen 0x8b1750/0x8b2be0 (cmTraining.ts) mod
// sporet fra den instrumenterede original (match_trace.c RECOMP_DV_TRACE, oraklet frø 1, 3.9.60; uddrag af ~/cm0102-engine/oracle/runs/dv1.txt)
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { checkDvTrace } from '../scripts/dv-trace-check';
import { applyTraining, newTrainEntry, nibble, type CmRec } from '../src/game/cmTraining';
import { developCore } from '../src/game/cmDevelop';
import { moodValue, wantsToLeave, newCmContract } from '../src/game/cmPlayerData';

const text = gunzipSync(readFileSync('tests/fixtures/dv-trace-sample.txt.gz')).toString('utf8');

describe('originalens udvikling og træning', () => {
  it('udviklingen, 0x538bc0 og træningen er ens med originalen kald for kald', () => {
    // menneskets klub (oraklet: Arsenal) bruges kun af udviklingens K (×1,31 i stedet for managerens leddet) – uddragets 60 udviklinger har ingen
    const r = checkDvTrace(text, new Set(), 0, () => {});
    expect(r.devN).toBe(60);
    expect(r.devOk).toBe(r.devN);
    expect(r.devNormOk).toBe(r.devN);
    expect(r.trN).toBe(500);
    expect(r.trOk).toBe(r.trN);
  });
  it('0x8b2be0: halve trin, interne ×6 og effekten i 4 bit', () => {
    const r: CmRec = { ca: 100, pa: 120, rep: [0, 0, 0], b: new Array(0x46).fill(10) };
    const e = newTrainEntry(1);
    applyTraining(r, e, [1, 0, 0, 0, 0]);                      // 0 → 1: trunc(1/2) − 0 = 0
    expect(r.b[0x1b]).toBe(10);
    expect(nibble(e, 0)).toBe(1);
    applyTraining(r, e, [1, 0, 0, 2, 0]);                      // 1 → 2: +1 (fysik), område 3: 0 → 2: +1
    expect(r.b[0x1b]).toBe(11);
    expect(r.b[0x3a]).toBe(16);                                 // Reflexes er intern: +6
    expect(r.b[0x40]).toBe(11);
    expect(nibble(e, 3)).toBe(2);
  });
  it('udviklingen bruger kun sin egen talrække', () => {
    const r: CmRec = { ca: 120, pa: 160, rep: [3000, 3000, 2000], b: new Array(0x46).fill(10) };
    r.b[0x0f] = 1; r.b[0x11] = 20;
    let n = 0;
    developCore({ id: 7, age: 19, club: null, stats: [10, 6.8, 6.5, 2], mean: 6.8, fatigue: 0, injury: null, train0: 0 }, r,
      { amb: 10, det: 10, loy: 10, pres: 10, prof: 15, sport: 10, temp: 10 }, (k) => { n++; return k > 0 ? (n * 7) % k : k < 0 ? -((n * 7) % -k) : 0; });
    expect(n).toBeGreaterThan(10);
    expect(r.ca).toBeGreaterThanOrEqual(120);
    expect(r.ca).toBeLessThanOrEqual(160);
  });

  it('klubbens stemning 0x5cd61d som originalen (oraklets ugeværdier: kampe, +0x72, +0x73, hold, ligaens og klubbens omdømme → +4)', () => {
    const rows = [[11, 24, 17, 24, 12, 4531, 6], [18, 2, 11, 24, 8, 4941, -8], [10, 21, 23, 24, 4, 2478, -1], [9, 6, 4, 20, 18, 6964, 2], [17, 14, 23, 24, 8, 4003, -8],
      [11, 20, 14, 20, 18, 6559, 6], [10, 9, 23, 24, 12, 5462, -12], [9, 4, 6, 24, 8, 5003, -1], [10, 7, 19, 20, 18, 6964, -13], [9, 3, 8, 20, 18, 8913, -5],
      [18, 15, 3, 24, 8, 3514, 11], [12, 5, 6, 20, 18, 7840, -1], [13, 14, 2, 24, 12, 5589, 11], [9, 21, 3, 24, 8, 3509, 16], [9, 11, 2, 24, 8, 3984, 8], [8, 1, 20, 20, 18, 9000, 0]];
    for (const [p, x72, pos, teams, cr, rep, want] of rows) expect(moodValue(p, x72, pos, teams, cr, rep, cr < 18)).toBe(want);
  });
  it('0x866f60: transferønsket af klagerne og personligheden', () => {
    const c = newCmContract(2);
    const P = { id: 7, loy: 10, pres: 10, prof: 10, temp: 10, amb: 10, repCur: 3000, b40: 0 };
    expect(wantsToLeave(P, c)).toBe(false);                    // ingen klager
    c.b45 = 0x10; expect(wantsToLeave(P, c)).toBe(true);       // 0x10 → altid
    c.b45 = 4; expect(wantsToLeave(P, c)).toBe(false);
    expect(wantsToLeave({ ...P, amb: 16, prof: 9 }, c)).toBe(true);
    c.b45 = 0x200; expect(wantsToLeave(P, c)).toBe(false);     // dl = 0 + 30 ≥ 18
    expect(wantsToLeave({ ...P, loy: 2, pres: 2, prof: 2 }, c)).toBe(true);
  });
});
