// Spilstartens kontrakter 0x85e960 (src/game/cmContractInit.ts): bonusser, klausuler og deltid som i CM 01/02 – kun den originale database i
// ægte tilstand.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cmBonusPaid, initialContract_85e960, type InitContractIn } from '../src/game/cmContractInit';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmRegenWage } from '../src/game/cmWageGame';

const base: InitContractIn = {
  id: 3, age: 26, rep: 5000, value: 2_000_000, dbWage: 8000, fallbackWage: 0, caps: 0, nation85: 0,
  amb: 10, loy: 10, det: 10, prof: 10, pos: [1, 1, 1, 1, 1, 1, 20], clubRep: 7000, status: 1, league: { promotion: false, relegation: true },
};
/** rand der giver de tal, testen bestemmer (og logger n) */
const seq = (vals: number[], log: number[] = []) => (n: number) => { log.push(n); return Math.min(vals.shift() ?? 0, Math.max(0, n - 1)); };

describe('0x85e960', () => {
  it('databasens løn gælder kun under 15 · omdømmet; bonusserne regnes af lønnen: trunc(w/20) − rand(trunc(w/40)) + 25', () => {
    const log: number[] = [];
    const o = initialContract_85e960({ ...base, rep: 1000 }, seq([0, 0, 0, 0], log));      // omdømme 1000: ingen klausul-rand
    expect(o.wage).toBe(8000);
    expect(o.goal).toBe(425);                                                             // 8000/20 − 0 + 25
    expect(o.assist).toBe(425);
    expect(o.cleanSheet).toBe(-1);
    expect(log).toEqual([200, 200]);                                                      // rand(trunc(8000/40)) for mål og assist
    const hi = initialContract_85e960({ ...base, rep: 500, fallbackWage: 4000 }, seq([]));
    expect(hi.wage).toBe(-1);                                                             // 8000 > 15·500 → 0x862720 senere
    expect(hi.goal).toBe(225);                                                            // standardlønnen 4000
  });
  it('målmanden med 20 får clean sheet-bonus, en ren forsvarer ingen', () => {
    const gk = initialContract_85e960({ ...base, rep: 1000, pos: [20, 1, 1, 1, 1, 1, 1] }, seq([10]));
    expect([gk.goal, gk.assist, gk.cleanSheet]).toEqual([-1, -1, 415]);
    const d = initialContract_85e960({ ...base, rep: 1000, pos: [1, 1, 20, 1, 1, 1, 1] }, seq([]));
    expect([d.goal, d.assist, d.cleanSheet]).toEqual([-1, -1, -1]);
  });
  it('nedrykningsklausulen: omdømme/50 − 2·Loy + 3·Amb − rand(20) > 10·bl, beløbet værdi − rand(værdi/2) med Loyalty/Ambition-faktoren', () => {
    // bl = trunc(7000/500) + 1 = 15 → 150; omdømme 5000: 100 − 2·5 + 3·20 − 0 = 150 → ikke større
    expect(initialContract_85e960({ ...base, loy: 5, amb: 20 }, seq([0, 0, 0, 0, 0, 0])).clauses[3]).toBe(0);
    const log: number[] = [];
    const o = initialContract_85e960({ ...base, loy: 4, amb: 20, clubRep: 500 }, seq([0, 0, 1000], log));   // bl = 2; ingen oprykning
    expect(o.clauses).toEqual([0, 0, 0, 1, 0]);
    expect(o.fee).toBe(Math.trunc((2_000_000 - 1000) * 0.5));                             // Loy < 5, Amb > 10 → ·0,5
    expect(log.slice(0, 3)).toEqual([20, 20, 1_000_000]);                                 // Non Promotion's rand(20), nedrykningens rand(20), rand(værdi/2)
  });
  it('Non Promotion kun i en liga med oprykning; amatørklubber får intet, semiprofessionelle deltid', () => {
    const noPromo = initialContract_85e960({ ...base, clubRep: 500, amb: 20, league: { promotion: false, relegation: false } }, seq([]));
    expect(noPromo.clauses[0]).toBe(0);
    const promo = initialContract_85e960({ ...base, clubRep: 500, amb: 20, league: { promotion: true, relegation: false } }, seq([0, 0, 0, 0]));
    expect(promo.clauses[0]).toBe(1);
    expect(promo.fee).toBe(2_000_000);                                                    // værdi + rand(værdi/4) = 0
    expect(initialContract_85e960({ ...base, status: 3 }, seq([])).goal).toBe(-1);
    expect(initialContract_85e960({ ...base, status: 3, clubRep: 500, amb: 20, league: { promotion: true, relegation: true } }, seq([])).clauses).toEqual([0, 0, 0, 0, 0]);
    expect(initialContract_85e960({ ...base, status: 2 }, seq([])).partTime).toBe(true);
  });
  it('Non Playing: f + max(0,95f + 150.000, 2f), over 12 mio. dæmpet', () => {
    const o = initialContract_85e960({ ...base, rep: 9000, loy: 1, clubRep: 0, league: null }, seq([0, 0, 0, 0, 0, 0]));
    expect(o.clauses[2]).toBe(1);
    expect(o.fee).toBe(6_000_000);                                                        // f = 2 mio., t = max(2,05 mio., 4 mio.)
    const big = initialContract_85e960({ ...base, rep: 9000, loy: 1, clubRep: 0, league: null, value: 10_000_000 }, seq([0, 0, 0, 0, 0, 0]));
    expect(big.fee).toBe(10_000_000 + Math.trunc(20_000_000 * 0.21 + 9_500_000));
  });
  it('Manager Job Release Clause: ældre, kendte spillere med id % 3 = 0 og høj personlighedssum', () => {
    const x = { ...base, age: 33, rep: 4000, prof: 20, det: 20, amb: 20, id: 9 };
    expect(initialContract_85e960(x, seq([])).clauses[4]).toBe(1);                       // 60 + 9 + 33 − 28 = 74 > 45
    expect(initialContract_85e960({ ...x, id: 10 }, seq([])).clauses[4]).toBe(0);
  });
});

describe('0x4ca6d0: hvornår betales bonusserne', () => {
  it('konkurrencekampe altid; venskabskampe kun mod en klart større klub', () => {
    const g = { comps: { L: {} }, cmClubRep: { 1: 4000, 2: 9000, 3: 4500 }, clubs: {} } as never;
    expect(cmBonusPaid(g, { comp: 'L', home: 1, away: 3 }, 0)).toBe(true);
    expect(cmBonusPaid(g, { comp: '', home: 1, away: 2 }, 0)).toBe(true);                 // 9000 ≥ max(5000, 5500)
    expect(cmBonusPaid(g, { comp: '', home: 1, away: 2 }, 1)).toBe(false);
    expect(cmBonusPaid(g, { comp: '', home: 1, away: 3 }, 0)).toBe(false);
  });
});

describe('i spillet', () => {
  it('den originale database i ægte tilstand: bonusser og klausuler fra spilstarten; den moderne database uændret', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const ps = Object.values(g.players).filter((p) => p.contract && !p.regen && g.clubs[p.club]?.nation === eng);
    const withGoal = ps.filter((p) => p.contract!.goalBonus);
    const withClause = ps.filter((p) => p.contract!.cmClauses);
    expect(withGoal.length).toBeGreaterThan(100);
    expect(withGoal.every((p) => p.pos[6] >= 15)).toBe(true);
    expect(withClause.length).toBeGreaterThan(20);
    expect(ps.filter((p) => p.contract!.cmBonusGbp).every((p) => p.contract!.cmBonusGbp![0] === -1 || p.contract!.cmBonusGbp![0] > 25)).toBe(true);
    // 0x83a1b0 → 0x862720: lønnen for kontrakterne uden løn i databasen (originalen 10/50/90 % = £148/£665/£8.146 – før portet £344/£1.200/£8.000)
    const wages = ps.map((p) => Math.round(p.contract!.wage * 0.86)).sort((a, b) => a - b);
    const q = (x: number) => wages[Math.floor(x * wages.length)];
    expect(q(0.1)).toBeLessThan(200);
    expect(q(0.5)).toBeGreaterThan(550);
    expect(q(0.5)).toBeLessThan(800);
    // en regen, der kommer til en klub: set_default_wage 0x8626e0 = max(55, 0x862720(…, −1 …))
    const exe = Object.values(g.clubs).find((c) => c.name === 'Exeter City')!, mu = Object.values(g.clubs).find((c) => c.name === 'Manchester United')!;
    const kid = { ...ps.find((p) => p.club === exe.id && p.ca < 60)!, id: 9_999_999, regen: true, club: exe.id };
    const wE = cmRegenWage(g, kid, exe)!, wM = cmRegenWage(g, { ...kid, club: mu.id }, mu)!;
    expect(wE).toBeGreaterThanOrEqual(55);
    expect(wM).toBeGreaterThan(wE);
  }, 300_000);
});
