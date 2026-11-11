// Originalens konditionsmodul (game/cmFitness.ts – injury.cpp 0x62c680/0x62c2f0/0x62bd10/0x62d140/0x62c080 …). Tallene er kald fra den
// instrumenterede original (match_trace.c RECOMP_FIT_TRACE, oracle/runs/fit0.txt); hele sporet køres af scripts/fit-trace-check.ts.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ATTRS } from '../src/game/attributes';
import { applyMatchEffects, chooseInjuryType, clubSeason, condition, dateGap, recordKnock, recoverFatigue, setMatchCondition, updateFitness, type CmFit, type FitCtx } from '../src/game/cmFitness';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame } from '../src/game/sim';
import type { GameState, Player } from '../src/game/types';

const day = (d: number, y: number) => Math.round(Date.UTC(y, 0, 1) / 86400000) + d;
const pl = (o: { age?: number; today?: number; a?: Record<string, number>; gk?: number; club?: number; fit?: Partial<CmFit> } = {}) => {
  const attrs = new Array(ATTRS.length).fill(10);
  for (const [k, v] of Object.entries(o.a ?? {})) attrs[ATTRS.indexOf(k as never)] = v;
  const y = new Date((o.today ?? 0) * 86400000).getUTCFullYear() - (o.age ?? 25);
  const p = { id: 1, dob: `${y}-01-01`, attrs, pos: [o.gk ?? 1, 1, 1, 1, 1, 1, 1, 1], side: [1, 1, 1], club: o.club ?? 0 } as unknown as Player;
  p.cmFit = { d: 0, f: 10000, mc: 10000, fat: 0, inj: null, rt: -1, rl: 0, b1c: 0, lt: -1, load: 50, ...o.fit };
  return p;
};
const G = { clubs: { 1: { id: 1, nation: 73, rep: 50 }, 2: { id: 2, nation: 60, rep: 50 } }, staff: {}, players: {}, cmFitStart: '2001-07-14', date: '2001-07-14' } as unknown as GameState;
const ctx = (today: number, rands: number[] = []): FitCtx => ({ g: G, today, rand: () => rands.shift() ?? 0, squadOf: () => [], human: () => false });

describe('0x62c680 dagens opdatering', () => {
  it('sommerpausen efter halvdelen: genoptræning (a) og tab (c) – Tyskland 29/6-2001 (oraklet: 10000 → 9514)', () => {
    const T = day(180, 2001);
    const p = pl({ today: T, club: 1, a: { naturalFitness: 14, professionalism: 15 }, fit: { d: day(0, 2001) } });
    updateFitness(ctx(T), p);
    expect(p.cmFit!.f).toBe(9514);
    expect(p.cmFit!.mc).toBe(10000);
    expect(p.cmFit!.d).toBe(T);
  });
  it('ferien (d) med rand(2) under 8000 – Fitness 7900 → 7777 (oraklet)', () => {
    const T = day(195, 2001);
    const p = pl({ today: T, club: 2, a: { naturalFitness: 13, professionalism: 13 }, fit: { d: day(194, 2001), f: 7900, fat: -6 } });
    G.clubs[2].nation = 94;
    updateFitness(ctx(T, [1]), p);
    G.clubs[2].nation = 60;
    expect(p.cmFit!.f).toBe(7777);
  });
  it('kampkonditionen kommer tilbage med 500/dag (træt over 1000: langsommere)', () => {
    const T = day(250, 2001);
    const p = pl({ today: T, club: 2, fit: { d: T - 2, mc: 6000, fat: 1500 } });
    updateFitness(ctx(T), p);
    expect(p.cmFit!.mc).toBe(6000 + Math.trunc(1000 * (1.4 - 1500 * 0.0004)));
    expect(condition(ctx(T), p)).toBe(Math.trunc((p.cmFit!.f * p.cmFit!.mc) / 10000));
  });
  it('Date::get_difference og sæsonens datoer (0x669bd0)', () => {
    expect(dateGap(day(5, 2001), day(360, 2000))).toBe(10);       // lånet bruger det senere års længde (sic – 2000 havde 366 dage)
    const [inS, start, end] = clubSeason(60, day(180, 2001));
    expect(inS).toBe(false);
    expect([start, end]).toEqual([day(222, 2001), day(144, 2001)]);
    expect(clubSeason(60, day(250, 2001))[0]).toBe(true);
  });
});

describe('trætheden (0x62c2f0, 0x62bd10, 0x62c080)', () => {
  it('falder 13 om dagen (rand(25) ≤ alder), rand(13) under −500; under 19 år aldrig negativ; målmand højst 1050', () => {
    const a = pl({ age: 25, fit: { fat: 330 } }); recoverFatigue(ctx(0, [3]), a); expect(a.cmFit!.fat).toBe(317);
    const b = pl({ age: 25, fit: { fat: -507 } }); recoverFatigue(ctx(0, [1]), b); expect(b.cmFit!.fat).toBe(-508);
    const c = pl({ age: 16, fit: { fat: -13 } }); recoverFatigue(ctx(0), c); expect(c.cmFit!.fat).toBe(0);
    const d = pl({ age: 30, gk: 20, fit: { fat: 1300 } }); recoverFatigue(ctx(0, [0]), d); expect(d.cmFit!.fat).toBe(1050);
  });
  it('efter kampen: + (10000 − kondition)/100 + minutter; halvt i en venskabskamp', () => {
    const T = day(250, 2001);
    const p = pl({ age: 26, today: T, a: { workRate: 15, stamina: 15, professionalism: 15 }, fit: { d: T } });
    applyMatchEffects(ctx(T, [0]), [{ p, starter: true, minutes: 90, cond: 7000, hurt: false }], true, 5);
    expect(p.cmFit!.mc).toBe(7000);
    expect(p.cmFit!.fat).toBe(120);
    const q = pl({ age: 26, today: T, fit: { d: T } });
    applyMatchEffects(ctx(T), [{ p: q, starter: true, minutes: 90, cond: 7000, hurt: false }], false, 5);
    expect(q.cmFit!.fat).toBe(60);
    const r = pl({ fit: { fat: 1200 } });
    setMatchCondition(ctx(0, [4]), r, 8000, 50);                          // over grænsen 1200 − (WR + Stamina + Prof): rand(delta) + 1
    expect(r.cmFit!.fat).toBe(1205);
  });
  it('en knock med sværhed over 95 bliver en alvorlig skade af kategorien (0x62be00 → 0x62d140 → 0x62d250)', () => {
    const T = day(250, 2001);
    const p = pl({ age: 26, today: T, club: 2, fit: { d: T } });
    recordKnock(p.id, 3, 60, () => true);
    recordKnock(p.id, 3, 50, () => true);                                // samme kategori: sværhederne lægges sammen (højst 100)
    const seq = [0, 0, 0, 0, 0, 0, 0, 0];
    applyMatchEffects({ ...ctx(T), rand: () => seq.shift() ?? 0 }, [{ p, starter: true, minutes: 70, cond: 6000, hurt: true }], true, 9);
    const e = p.cmFit!.inj!;
    expect(e).toBeTruthy();
    expect(e.t).toBeGreaterThanOrEqual(22);                                // knæet (kategori 3, sværhed 2)
    expect(e.w2a).toBeLessThanOrEqual(e.w28);
    expect(chooseInjuryType(ctx(T, [0]), 1, -1, p)).toBe(-1);             // en knæskade spærrer for en ny
  });
});

describe('spillet', () => {
  it('nyt spil med den originale database i ægte tilstand: poster, skadede fra databasens dato, trætheden falder dagligt; den moderne database har ingen', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const ps = Object.values(g.players).filter((p) => !p.regen);
    expect(ps.every((p) => p.cmFit)).toBe(true);
    const hurt = ps.filter((p) => p.cmFit!.inj);
    expect(hurt.length).toBeGreaterThan(20);
    expect(ps.filter((p) => p.injury && p.injury.key.startsWith('cm')).length).toBeGreaterThan(0);
    expect(ps.find((p) => p.club)!.cmFit!.f).toBeLessThan(10000);       // 0x62a920: Fitness efter sæsonens dato
    for (let i = 0; i < 5; i++) continueGame();
    expect(ps.filter((p) => p.club && (p.cmFit!.fat < 0)).length).toBeGreaterThan(100);
  }, 120_000);
});
