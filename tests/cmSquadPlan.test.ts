// Computerens trupplan 0x83cb40 (src/game/cmSquadPlan.ts) mod den instrumenterede original (match_trace.c RECOMP_SQ_TRACE; uddrag af
// oracle/runs/sq4.txt i tests/fixtures/sq-trace-sample.txt – hele sporet køres af scripts/sq-trace-check.ts) og i spillet (cmSquadPlanGame.ts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkCalls } from '../scripts/sq-trace-check';
import { buildSlots, clubStrength, dailyGate, financeStatus, newPlanEntry, planSquad, slotGroup, type PlanCtx, type PlanInput } from '../src/game/cmSquadPlan';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';

describe('0x83cb40 mod sporet', () => {
  it('spilstartens og de daglige kald: samme trupstatus, +0x4e og +0x3d/+0x3e/+0x3f som originalen', () => {
    const r = checkCalls('tests/fixtures/sq-trace-sample.txt');
    expect(r.n).toBe(9);
    expect(r.okCalls).toBe(r.n);
    expect(r.okStatus).toBe(r.totStatus);
    expect(r.evMiss).toBe(0);
  });
});

describe('0x83c090 og 0x7bca90', () => {
  it('pladserne: 25 spillere (standardformationen), staben 25–39 med gruppe 1', () => {
    const e = newPlanEntry();
    buildSlots(e);
    expect(e.slots.slice(0, 11).map((s) => s.mask)).toEqual([0x1, 0x804, 0x84, 0x404, 0x104, 0x810, 0x90, 0x410, 0x110, 0x440, 0x140]);
    expect(e.slots.slice(25).map((s) => s.role)).toEqual([6, 7, 8, 8, 8, 8, 8, 0xa, 9, 9, 9, 9, 9, 9, 9]);
    expect(slotGroup(e.slots[30])).toBe(1);
  });
  it('økonomien 0x5986b0 og styrkemålet', () => {
    expect(financeStatus(30_000_000, 9000)).toBe(2);
    expect(financeStatus(-40_000_000, 9000)).toBe(-2);
    expect(financeStatus(-1_000_000, 3000)).toBe(-1);
    const a = clubStrength({ rep: 9000, minAtt: 38200, status: 1, leagueRep: 20, leagueActive: true, euroRep: 20, squadCount: 30, finance: 0 });
    expect(a.R).toBeGreaterThan(9000);
    const b = clubStrength({ rep: 9000, minAtt: 38200, status: 2, leagueRep: 20, leagueActive: true, euroRep: 20, squadCount: 30, finance: 0 });
    expect(b.R).toBe(Math.trunc(a.R / 2));
    expect(clubStrength({ rep: 100, minAtt: 0, status: 3, leagueRep: null, leagueActive: false, euroRep: null, squadCount: 10, finance: null }).T).toBe(5080);   // R = 100 → 50 (amatør), T = 1,6·50 + 5000
  });
  it('den daglige port: tælleren stiger til 200, og kaldet kræver +8 > rand(70) + 30 og rand(5) = 0', () => {
    const e = newPlanEntry();
    expect(dailyGate(e, () => 0)).toBe(false);                               // +8 = 1 ≤ 30
    e.counter = 199;
    expect(dailyGate(e, () => 0)).toBe(true);
    expect(e.counter).toBe(200);
    expect(dailyGate(e, (n) => (n === 5 ? 1 : 0))).toBe(false);
  });
  it('0x83cc2b: 0x844540(klub, −1) – åbne bud: +4 = 2 → ud uden ændring; ellers ingen port for inaktive ligaer (0x83cc88)', () => {
    const ind = { clubId: 1, daily: true, first: false, rep: 100, status: 1, national: false, hasNation: true, activeLeague: false, human1: false, human2: false,
      humanSettings: false, bTeam: false, partnerIsParent: false, x18: false, managerId: null, managerForm: null, managerJoinedDay: 0, managerJoinedYear: 1900,
      T: 1000, R: 100, daysSinceStart: 10, today: { day: 200, year: 2001 }, squad: [] } as PlanInput;
    const ctx = { rand: (n: number) => (n === 5000 ? 4999 : 0) } as unknown as PlanCtx;           // rand(omd + 1000) < rand(5000): porten springer over
    const open = () => { const e = newPlanEntry(); e.slots[3].f = 7; e.slots[3].s17 = 12; return e; };
    let e = open(); e.state = 2; e.counter = 50;
    expect(planSquad(e, ind, ctx).ran).toBe(false);
    expect(e.state).toBe(2);
    expect(e.counter).toBe(0);
    e = newPlanEntry(); e.state = 1;
    expect(planSquad(e, ind, ctx).ran).toBe(false);                                                 // ingen bud: porten 0x83cc88
    expect(e.state).toBe(0);
    e = open(); e.state = 1;
    let ran = false;
    try { ran = planSquad(e, ind, ctx).ran; } catch { ran = true; }                                 // forbi porten (resten af ctx findes ikke her)
    expect(ran).toBe(true);
  });
});

describe('i spillet', () => {
  it('den originale database i ægte tilstand: computerens klubber får originalens trupstatus; udvidet tilstand har ingen plan', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const mu = Object.values(g.clubs).find((c) => c.name === 'Manchester United')!;
    const ps = squad(mu.id).filter((p) => !p.regen && p.contract);
    expect(g.cmPlan?.[mu.id]).toBeTruthy();
    expect(ps.every((p) => p.cmContract?.b4f !== undefined)).toBe(true);
    const st = new Set(ps.map((p) => p.squadStatus));
    expect(st.has('rotation') || st.has('first')).toBe(true);
    expect(st.has('young')).toBe(true);
    const m = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    // (MODERN_PARITY 3) 2026/27 i ægte tilstand får trupplanen (computerens marked); i udvidet tilstand ingen plan
    createGame(m, { managerName: 'T', managerNation: 0, clubId: m.clubs[0][0], activeNations: [m.clubs[0][3]], lang: 'en', masking: true, seed: 3, mode: 'extended' });
    expect(gs().cmPlan).toBeUndefined();
  }, 120_000);
});
