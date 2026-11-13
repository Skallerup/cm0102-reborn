// Originalens bestyrelse og managerjob (cmBoard.ts / cmBoardGame.ts) – kun den originale database i ægte tilstand.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { confidenceBand, humanAppointRep, initStaffRep, leagueBand, after, daysSince, isoToCm, cmToIso } from '../src/game/cmBoard';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';

describe('cmBoard – rene funktioner', () => {
  it('båndene 0x690b70/0x690bd0', () => {
    expect([2999, 3000, 3499, 3500, 4274, 4275, 6499, 6500, 8499, 8500, 9499, 9500].map(confidenceBand)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6]);
    expect([-2001, -2000, -1001, -1000, -501, -500, 499, 500, 999, 1000, 1999, 2000].map(leagueBand)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6]);
  });
  it('spilstartens omdømme (sub_535a80 0x537d59) og menneskets 0x826f20', () => {
    expect(initStaffRep([0, 60, 0], null, 5)).toEqual([3000, 3000, 1]);
    expect(initStaffRep([80, 60, 0], [8000, 7], 5)).toEqual([4000, 3000, 2800]);   // klub i et andet land: hjemme bevares, verden = 0,35·klub
    expect(initStaffRep([80, 60, 0], [8000, 5], 5)).toEqual([3000, 3000, 2800]);   // klub i eget land: hjemme = aktuel
    expect(humanAppointRep(9000)).toEqual([3900, 3900, 4350]);
  });
  it('datoerne', () => {
    const d = isoToCm('2001-07-14');
    expect(d).toEqual({ day: 194, year: 2001 });
    expect(cmToIso(d)).toBe('2001-07-14');
    expect(after({ day: 1, year: 2002 }, { day: 300, year: 2001 })).toBe(true);
    expect(daysSince(isoToCm('2002-01-01'), isoToCm('2001-12-25'))).toBe(7);
  });
});

describe('cmBoard – i spillet (3.9.60, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const ars = world.clubs.find((c) => c[1] === 'Arsenal')![0];
  it('bestyrelsesposterne ved spilstarten og nogle uger frem', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: ars, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    expect(g.cmBoard).toBeTruthy();
    const mu = Object.values(g.clubs).find((c) => c.name === 'Manchester United')!;
    const R = g.cmBoard!.rec[mu.id];
    expect(R.w6).toBeGreaterThanOrEqual(5750);
    expect(R.w6).toBeLessThanOrEqual(10000);
    expect(g.cmBoard!.rec[ars]).toBeTruthy();
    expect(g.manager.cmRep?.[0]).toBeGreaterThan(3000);
    const fergie = g.staff[mu.manager];
    expect(fergie?.cmRep?.[2]).toBeGreaterThan(5000);
    const end = new Date(Date.parse(g.date) + 60 * 86400000).toISOString().slice(0, 10);
    for (let i = 0; i < 300 && g.date < end; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    for (const e of g.cmBoard!.vac) expect(e.cand).not.toBe(-1);
    for (const r of Object.values(g.cmBoard!.rec)) if (r.w6 !== undefined) expect(r.w6).toBeLessThanOrEqual(10000);
  }, 600000);
  it('den moderne database bruger ikke originalens bestyrelse', () => {
    const w2 = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const e2 = w2.nations.findIndex((n) => n.name === 'England');
    createGame(w2, { managerName: 'T', managerNation: e2, clubId: w2.clubs.find((c) => c[3] === e2)![0], activeNations: [e2], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    expect(gs().cmBoard).toBeUndefined();
  }, 600000);
});
