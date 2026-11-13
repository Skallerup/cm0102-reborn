// Runde 12: de resterende moralskrivere (cmMedia.ts) – sign_contract 0x4cf720 (+20) og Staff_Records 0x868c50/0x869480/0x86a1c0/0x86a800
// efter disassemblyen (konstanterne 0x968f78 = 0,33, 0x9689d0 = 0,95, 0x9689d8 = 0,9).
import { describe, expect, it } from 'vitest';
import { cmSignContractMorale, recChampions, recCupWinners, recPromotion, recRelegation } from '../src/game/cmMedia';
import type { Competition, GameState, Player } from '../src/game/types';

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
    recChampions(g, 1, league, () => [a, b]);
    expect(g.cmClubRep![1]).toBe(6750);
    expect(g.cmCrowd![1][2]).toBe(30200 + 300);
    expect(a.cmContract!.b44).toBe(100); expect(b.cmContract!.b44).toBe(90);
    expect(a.morale).toBe(20); expect(b.morale).toBe(20);
  });
  it('0x869480: +500 (højst 10000), +0x44 +75 (højst 100), moralen +15', () => {
    const g = game();
    const p = player(30, 4);
    recPromotion(g, 2, league, () => [p]);
    expect(g.cmClubRep![2]).toBe(10000);
    expect(p.cmContract!.b44).toBe(100);
    expect(p.morale).toBeGreaterThan(4);
  });
  it('0x86a1c0: −500 (mindst 750), moralen −15, omdømmet ×0,9 for trupstatus 1–2 og ×0,95 for 3–5', () => {
    const g = game(); g.cmClubRep![1] = 1000;
    const k = player(40, 15, { cmRepMem: [100, 60, 20] } as Partial<Player>);
    const r = player(41, 15, { cmRepMem: [100, 60, 20], cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 0, b4f: 0x40 } } as Partial<Player>);
    recRelegation(g, 1, league, () => [k, r]);
    expect(g.cmClubRep![1]).toBe(750);
    expect(k.cmRepMem!.map((v) => Math.trunc(v * 50))).toEqual([4500, 2700, 900]);
    expect(r.cmRepMem!.map((v) => Math.trunc(v * 50))).toEqual([4750, 2850, 950]);
    expect(k.morale).toBeLessThan(15);
  });
  it('0x86a800: kun klubomdømmet (målet 500·turneringens omdømme)', () => {
    const g = game(); g.cmCompRep![351] = 13;
    const cup = { id: 'CUP-60', name: 'English FA Cup', type: 'cup' } as unknown as Competition;
    g.comps[cup.id] = cup;
    recCupWinners(g, 1, cup);
    expect(g.cmClubRep![1]).toBe(6500);
  });
});
