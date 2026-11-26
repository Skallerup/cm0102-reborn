// Runde 12: de resterende moralskrivere (cmMedia.ts) – sign_contract 0x4cf720 (+20) og Staff_Records 0x868c50/0x869480/0x86a1c0/0x86a800
// efter disassemblyen (konstanterne 0x968f78 = 0,33, 0x9689d0 = 0,95, 0x9689d8 = 0,9).
import { describe, expect, it } from 'vitest';
import { cmRecordsDaily, cmSignContractMorale, recChampions, recCupFinalist, recCupThird, recCupWinners, recPromotion, recRelegation } from '../src/game/cmMedia';
import { recordMgrHooks, renewalHooks } from '../src/game/cmTableHooks';
import type { Competition, GameState, Player } from '../src/game/types';

// forlængelsestilbuddene 0x4cda70 (cmContractManager.ts) fanges her: hvem rekorden sender videre
let renewed: number[] = [];
renewalHooks.offer = (_g, ps) => { renewed.push(...ps.map((p) => p.id)); };

const game = (): GameState => ({
  dbKind: 'cm0102', dbYear: 2001, season: 2001, seed: 1, date: '2002-05-11', options: { mode: 'authentic' }, cmFitStart: 0,
  clubs: { 1: { id: 1, league: 'CM7', rep: 70 }, 2: { id: 2, league: 'CM7', rep: 40 } }, leagues: {}, comps: {}, customRules: {},
  cmClubRep: { 1: 6000, 2: 9800 }, cmCompRep: { 7: 15 }, cmCrowd: { 1: [30000, 20000, 30200, 0, 0, 0, 0, 0, 0] },
} as unknown as GameState);
const player = (id: number, morale: number, extra: Partial<Player> = {}): Player =>
  ({ id, club: 1, morale, attrs: [], pos: [], contract: { wage: 1, expires: '2004-06-30' }, cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 40, b45: 0, b4f: 0x10 }, ...extra } as unknown as Player);
const league = { id: 'CM7', type: 'league', table: Array.from({ length: 20 }, (_, i) => ({ club: i + 1 })) } as unknown as Competition;

describe('sign_contract 0x4cf720 (+20, flag 0)', () => {
  it('moralen stiger med rand(21) (m + 20 > 10, rand(21) < m + 20 altid), højst 20; genererede spillere og moderne spil røres ikke', () => {
    const g = game();
    const p = player(10, 5);
    cmSignContractMorale(g, p);
    expect(p.morale).toBeGreaterThanOrEqual(5); expect(p.morale).toBeLessThanOrEqual(20);
    const r = player(11, 5, { regen: true } as Partial<Player>); cmSignContractMorale(g, r); expect(r.morale).toBe(5);
    const m = player(12, 5); cmSignContractMorale({ ...g, options: { mode: 'extended' } } as GameState, m); expect(m.morale).toBe(5);
  });
});

describe('Staff_Records', () => {
  it('0x868c50: omdømmet mod 500·ligaens (højst +750), maksimum +20·omdømme, grænsen trunc(38·0,33) = 12 ligakampe → +100/+50', () => {
    const g = game();
    const a = player(20, 20, { cmStats: { 2: [13, 0, 0, 0, 0, 0, 0, 0, 0] } } as unknown as Partial<Player>);
    const b = player(21, 20, { cmStats: { 2: [12, 0, 0, 0, 0, 0, 0, 0, 0] } } as unknown as Partial<Player>);
    renewed = [];
    recChampions(g, 1, league, () => [a, b]);
    expect(renewed).toEqual([20]);                                   // 0x869248: kun over grænsen
    expect(g.cmClubRep![1]).toBe(6750);
    expect(g.cmCrowd![1][2]).toBe(30200 + 300);
    expect(a.cmContract!.b44).toBe(100); expect(b.cmContract!.b44).toBe(90);
    expect(a.morale).toBe(20); expect(b.morale).toBe(20);
  });
  it('0x869480: +500 (højst 10000), +0x44 +75 (højst 100), moralen +15', () => {
    const g = game();
    const p = player(30, 4);
    const q = player(31, 4, { cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 0, b4f: 0x40 } } as Partial<Player>);
    renewed = [];
    recPromotion(g, 2, league, () => [p, q]);
    expect(renewed).toEqual([30]);                                   // 0x869908: trupstatus 1–3 eller 5
    expect(g.cmClubRep![2]).toBe(10000);
    expect(p.cmContract!.b44).toBe(100);
    expect(p.morale).toBeGreaterThan(4);
  });
  it('0x86a1c0: −500 (mindst 750), moralen −15, omdømmet ×0,9 for trupstatus 1–2 og ×0,95 for 3–5', () => {
    const g = game(); g.cmClubRep![1] = 1000;
    const k = player(40, 15, { cmRepMem: [100, 60, 20] } as Partial<Player>);
    const r = player(41, 15, { cmRepMem: [100, 60, 20], cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 0, b4f: 0x40 } } as Partial<Player>);
    renewed = [];
    recRelegation(g, 1, league, () => [k, r]);
    expect(renewed).toEqual([40]);                                   // 0x86a5b2: trupstatus 1–2
    expect(g.cmClubRep![1]).toBe(750);
    expect(k.cmRepMem!.map((v) => Math.trunc(v * 50))).toEqual([4500, 2700, 900]);
    expect(r.cmRepMem!.map((v) => Math.trunc(v * 50))).toEqual([4750, 2850, 950]);
    expect(k.morale).toBeLessThan(15);
  });
  it('0x86a800: klubomdømmet (målet 500·turneringens omdømme); truppen kun når 400·turneringens omdømme ≥ klubbens', () => {
    const g = game(); g.cmCompRep![351] = 13;
    const cup = { id: 'CUP-60', name: 'English FA Cup', type: 'cup' } as unknown as Competition;
    g.comps[cup.id] = cup;
    const a = player(50, 5);
    renewed = [];
    recCupWinners(g, 1, cup, () => [a]);
    expect(g.cmClubRep![1]).toBe(6500);
    expect(a.morale).toBe(5); expect(a.cmContract!.b44).toBe(40); expect(renewed).toEqual([]);    // 400·13 = 5200 < 6500
    g.cmClubRep![1] = 3000;
    recCupWinners(g, 1, cup, () => [a]);
    expect(g.cmClubRep![1]).toBe(3750);
    expect(a.morale).toBeGreaterThan(5); expect(a.cmContract!.b44).toBe(100); expect(renewed).toEqual([50]);
  });
  it('0x86b0b0/0x86b710: finalens taber mod 500·omdømmet højst +350, bronzekampens vinder højst +200 (1..10000)', () => {
    const g = game(); g.cmCompRep![351] = 13;
    const cup = { id: 'CUP-60', name: 'English FA Cup', type: 'cup' } as unknown as Competition;
    g.comps[cup.id] = cup;
    g.cmClubRep![1] = 6000; recCupFinalist(g, 1, cup); expect(g.cmClubRep![1]).toBe(6350);
    g.cmClubRep![1] = 6400; recCupFinalist(g, 1, cup); expect(g.cmClubRep![1]).toBe(6500);
    g.cmClubRep![1] = 6500; recCupFinalist(g, 1, cup); expect(g.cmClubRep![1]).toBe(6500);
    g.cmClubRep![1] = 3000; recCupThird(g, 1, cup); expect(g.cmClubRep![1]).toBe(3200);
  });
  it('cmRecordsDaily: pokalvinderen (0x86a800) og finalens taber (0x86b0b0); Intertoto (0x633c10) ingen af dem', () => {
    const g = game(); g.cmCompRep![351] = 13;
    g.cmClubRep![1] = 3000; g.cmClubRep![2] = 3000;
    const ties = [{ id: 1, a: 2, b: 3, legs: 1, winner: 2, stage: 'SF', fx: [] }, { id: 2, a: 1, b: 2, legs: 1, winner: 1, stage: 'F', fx: [] }];
    g.comps['CUP-60'] = { id: 'CUP-60', name: 'English FA Cup', type: 'cup', finished: true, winner: 1, ties } as unknown as Competition;
    cmRecordsDaily(g, () => []);
    expect(g.cmClubRep![1]).toBe(3750); expect(g.cmClubRep![2]).toBe(3350);
    const h = game(); h.cmCompRep![351] = 13; h.cmClubRep![1] = 3000; h.cmClubRep![2] = 3000;
    h.comps.UIC = { id: 'UIC', name: 'Inter-Toto Cup', type: 'continental', finished: true, winner: 1, ties: [ties[1]], meta: { cmEuro: 'UIC' } } as unknown as Competition;
    cmRecordsDaily(h, () => []);
    expect(h.cmClubRep![1]).toBe(3000); expect(h.cmClubRep![2]).toBe(3000);
  });
});

describe('Staff_Records: managerens omdømme (club+0xcf → +0x69 +8/+0xa/+0xc)', () => {
  const withMgr = (rep: [number, number, number], nation: number) => {
    const prev = recordMgrHooks.manager;
    recordMgrHooks.manager = (_g, c) => (c === 1 ? { rep, nation } : null);
    return () => { recordMgrHooks.manager = prev; };
  };
  const eng = (g: GameState) => { (g as unknown as { nations: { name: string }[] }).nations = [{ name: 'England' }, { name: 'Brazil' }]; (g.clubs[1] as unknown as { nation: number }).nation = 0; return g; };
  it('0x868c50 (oraklet Arsenal-mennesket 4410/5282/4582, PL cr 18): += ftol(k·cr/6,1), gulv k·cr – k 400/400/200 (hjemmeland)', () => {
    const g = eng(game()); g.cmCompRep = { 7: 18 };
    const rep: [number, number, number] = [4410, 5282, 4582];
    const undo = withMgr(rep, 0);
    recChampions(g, 1, league, () => []);
    undo();
    expect(rep).toEqual([7200, 7200, 5172]);                         // h, a: gulvet 7200; c: 4582 + ftol(3600/6,1) = 5172
  });
  it('0x868c50: udlænding (0x53d980) → hjemme 200·cr; loftet 10000', () => {
    const g = eng(game()); g.cmCompRep = { 7: 18 };
    const rep: [number, number, number] = [3000, 9500, 9900];
    const undo = withMgr(rep, 1);
    recChampions(g, 1, league, () => []);
    undo();
    expect(rep).toEqual([3600, 10000, 10000]);
  });
  it('0x86a1c0: −16·cr / −16·cr (hjemmeland) / −8·cr, 1..10000', () => {
    const g = eng(game()); g.cmCompRep = { 7: 18, 8: 12 };
    const rep: [number, number, number] = [8380, 7976, 100];
    const undo = withMgr(rep, 0);
    recRelegation(g, 1, league, () => []);
    expect(rep).toEqual([8092, 7688, 1]);
    undo();
  });
});
