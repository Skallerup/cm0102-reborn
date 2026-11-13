// Viljen 0x844780, fremskrivningen 0x68ac40 og mål-omdømmet 0x83bf40 (cmBoardInterest.ts) – kendte grene regnet i hånden fra koden.
import { describe, expect, it } from 'vitest';
import { projectPositions, staffInterest, targetRep, type InterestEnv } from '../src/game/cmBoardInterest';
import type { BoardEnv, Person } from '../src/game/cmBoard';
import { msvcQsort } from '../src/game/engine/grid/subs';

const person = (o: Partial<Person> = {}): Person => ({ id: 1, human: false, np: true, nation: 0, club: 10, job: 5, joined: { day: 0, year: 1995 }, age: 45,
  b59: 10, det: 10, pres: 10, prof: 10, temper: 10, amb: 10, b22: 0, ca: 120, pa: 150, at: () => 10, rep: [5000, 5000, 5000], ...o });

function env(o: Partial<InterestEnv> = {}, b: Partial<BoardEnv> = {}): InterestEnv {
  const base = {
    today: { day: 200, year: 2001 }, gameStart: { day: 195, year: 2001 }, clubRep: () => 6000, clubNation: () => 0, division: () => null,
    league: () => null, entry: () => null, manager: () => null, wealthBand: () => 0, foreign: () => false, nat7e: () => 1,
  } as unknown as BoardEnv;
  return {
    b: { ...base, ...b } as BoardEnv, rec: () => null, name: () => 'Some Body', nat: () => ({ nc: false, nj: 0 }), rel: () => undefined, key: (p) => p.id,
    status: () => 1, rivals: () => [], divId: () => 1, compLevel: () => 10, i73: () => 20000, city33: () => null, euro: () => -1, targetRep: () => 6000,
    continent: () => 2, ids: { europe: 2, interToto: 330, lowerDiv: -1, celtic: -1, rangers: -1, italy: -1, croatia: -1, yugoslavia: -1 }, ...o,
  };
}

describe('0x844780 staff_interest_in_job_at_club (check = 0)', () => {
  it('afvisningerne', () => {
    expect(staffInterest(env({ nat: () => ({ nc: true, nj: 5 }) }), person({ club: 0, job: 0 }), 20, 5)).toBe(0);   // landstræner
    expect(staffInterest(env({ name: () => 'Kevin Keegan' }), person(), 20, 5)).toBe(0);                            // forlader aldrig klubben
    expect(staffInterest(env(), person({ np: false }), 20, 5)).toBe(0);
    expect(staffInterest(env(), person(), 20, 0)).toBe(0);                                                           // job 0
  });
  it('egen klub: 3,5 og præferencerne', () => {
    expect(staffInterest(env(), person(), 10, 5)).toBe(3.5);
    // s afskyr c (= H): ×0,33 og ×2
    expect(staffInterest(env({ rel: () => [0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0] }), person(), 10, 5)).toBe(3.5 * 0.33 * 2.0);
  });
  it('ansættelsestiden: for kort tid i klubben → 0', () => {
    // dage = 365·0 − 0 + 200 = 200 < 15·(10 + 8) = 270
    expect(staffInterest(env(), person({ joined: { day: 0, year: 2001 } }), 20, 5)).toBe(0);
    expect(staffInterest(env(), person({ joined: { day: 0, year: 1995 } }), 20, 5)).toBeGreaterThan(0);
  });
});

describe('0x68ac40 update_projected_positions', () => {
  const rows = (pts: number[], games: number) => pts.map((p, i) => ({ club: i + 1, games, pts: p, rep: 9000 - i * 100 }));
  it('sent på sæsonen: pointsnit, ×1,5 og ×1,5·4/9', () => {
    // 20 hold, 30 kampe, 8 tilbage: klub 3 med 60 point (2 pr. kamp)
    const r = rows([70, 65, 60, 59, 50, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26], 30);
    const [best, normal, worst] = projectPositions(r, 3, 38, 3, null, msvcQsort)!;
    expect(normal).toBe(3);                 // 60 + 8·2 = 76 – (70 + 8·2,33 = 88, 65 + 8·2,17 = 82)
    expect(best).toBe(2);                   // 60 + ftol(8·3) = 84
    expect(worst).toBe(4);                  // 60 + ftol(8·1,333…) = 70 < 59 + 8·1,97 = 74
  });
  it('de engelske play-off-felter (0x573260: 3–6)', () => {
    const r = rows([70, 65, 60, 59, 50, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26], 30);
    expect(projectPositions(r, 3, 38, 3, [3, 6], msvcQsort)).toEqual([2, 3, 6]);
  });
  it('tidligt på sæsonen bruges omdømmets rækkefølge', () => {
    const r = rows(Array(20).fill(3), 3);   // alle 3 point efter 3 kampe – 3·3 < 38
    const [, normal] = projectPositions(r, 1, 38, 3, null, msvcQsort)!;
    expect(normal).toBe(1);                 // størst omdømme → 0,83·3 point pr. kamp
  });
});

describe('0x83bf40 update_club_target_reputation', () => {
  it('tilskuere/10 + 4500, manager, formand, gulv og loft', () => {
    expect(targetRep(30000, 1000, true, null, null)).toBe(7500);
    expect(targetRep(30000, 1000, false, [15, 5], null)).toBe(Math.trunc((10 * 0.0125 + 1) * 7500));
    expect(targetRep(30000, 9000, true, null, null)).toBe(9000);
    expect(targetRep(90000, 1000, true, null, null)).toBe(10000);
  });
});
