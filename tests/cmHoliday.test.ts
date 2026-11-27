// CM 01/02 "Go on holiday" (0x6b2d80) – ferievalgene i HUMAN_MANAGER-posten, 0x600a50's ferietjek og assistentens svar (auto_respond 0x784100)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { holidayClub, holidayOpt, holidayOpt_5fea50, holidayToggle, humanClub0, onHoliday_5fd210 } from '../src/game/cmHoliday';
import { cmCmScope } from '../src/game/cmContractManager';
import { cmSquadPlanClub } from '../src/game/cmSquadPlanGame';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { G } from '../src/game/cmMem';
import { buildSlMem, cmAskingPrice, SL_ON } from '../src/game/cmShortlistGame';
import { humanClub_600a50 } from '../src/game/cmWageGame';
import { cmHolidayAnswerBids } from '../src/game/transfers';
import { holidayJobAnswers, holidayJobs, holidayJobYes } from '../src/game/cmBoardGame';
import type { SparseMem } from '../src/game/cmMem';

describe('ferievalgene (0x6b2d80)', () => {
  it('valg 0 og 4 er tre-tilstandsbytes, rækkerne udelukker hinanden (0x6b35c1)', () => {
    let s = holidayToggle({}, 'rejectAll');
    expect(holidayOpt(s, 0)).toBe(1);
    s = holidayToggle(s, 'rejectBelow');
    expect(holidayOpt(s, 0)).toBe(2);
    expect(s.rejectAll).toBe(false);
    s = holidayToggle(s, 'rejectBelow');
    expect(holidayOpt(s, 0)).toBe(0);
    s = holidayToggle(holidayToggle(s, 'noBuy'), 'onlyShortlist');
    expect(holidayOpt(s, 4)).toBe(2);
    expect(holidayOpt(holidayToggle(s, 'noBuy'), 4)).toBe(1);
    s = holidayToggle(holidayToggle(holidayToggle(s, 'applyJobs'), 'useTactics'), 'useSelection');
    expect([1, 2, 3].map((i) => holidayOpt(s, i))).toEqual([1, 1, 1]);
  });
  it('jobtilbuddet på ferie (0x7841d9): ja uden klub; med klub kun med valg 1 og mindst samme omdømme', () => {
    expect(holidayJobYes(0, null, 100)).toBe(true);
    expect(holidayJobYes(0, 5000, 9000)).toBe(false);
    expect(holidayJobYes(1, 5000, 5000)).toBe(true);
    expect(holidayJobYes(1, 5000, 4999)).toBe(false);
  });
});

describe('ferien i spillet (3.9.60, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[2] === 'Man Utd')![0];
  it('HUMAN_MANAGER i hukommelsen: 0x5fd210/0x5fea50 og 0x600a50(klub, 0, …) er falsk på ferie', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    const look = () => {
      const S = buildSlMem(g, { noStale: true });
      const club = S.clubAdr(mu), mg = S.m.u32(club + 0xcf), n = S.m.s32(G.STAFF_COUNT);
      const r = { a0: humanClub_600a50(S.c, club, 0), a1: humanClub_600a50(S.c, club, 1), hol: onHoliday_5fd210(S.m, mg, n), o0: holidayOpt_5fea50(S.m, 0, mg, n), o4: holidayOpt_5fea50(S.m, 4, mg, n) };
      (S.m as SparseMem).release();
      return r;
    };
    expect(look()).toEqual({ a0: true, a1: true, hol: 0, o0: 0, o4: 0 });
    g.manager.holiday = { rejectBelow: true, onlyShortlist: true };
    expect(look()).toEqual({ a0: false, a1: true, hol: 1, o0: 2, o4: 2 });
    g.manager.holiday = undefined;
    expect(look().hol).toBe(0);
  });
  it('på ferie er menneskets klub en computerklub for 0x600a50(klub, 0, …): trupplanens daglige kald og buddene (CONTRACT_MANAGER: altid med)', () => {
    const g = gs();
    const p = Object.values(g.players).find((x) => x.club === mu && !x.loan && x.contract && !x.contract.futureClub)!;
    // CONTRACT_MANAGER 0x4c7ac0's personløkke går over alle personer – også menneskets spillere (0x842c00 på båndene, udløbet 0x4c9819)
    expect([holidayClub(g, mu), humanClub0(g, mu), cmCmScope(g, p)]).toEqual([false, true, true]);
    // 0x83cb40(entry, klub, 1, 0): menneskets klub springes over (0x83cbdf) – ikke på ferie
    expect(cmSquadPlanClub(g, mu, true, false)?.ran).toBeFalsy();
    g.manager.holiday = {};
    expect([holidayClub(g, mu), humanClub0(g, mu), cmCmScope(g, p)]).toEqual([true, false, true]);
    expect(cmSquadPlanClub(g, mu, true, false)?.ran).toBe(true);
    g.manager.holiday = undefined;
    expect(cmCmScope(g, p)).toBe(true);
  });
  it('bud på hans spillere: "Reject all offers" afviser; uden valg svarer assistenten som computeren (0x8c8090)', () => {
    const g = gs();
    const p = Object.values(g.players).find((x) => x.club === mu && !x.loan)!;
    const buyer = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!;
    const bid = (fee: number) => {
      const o = { id: g.nextId.offer++, player: p.id, buyer: buyer.id, seller: mu, fee, loan: false, status: 'pending' as const, created: g.date, respondBy: g.date };
      g.offers.push(o);
      return o;
    };
    const a = bid(1_000_000);
    cmHolidayAnswerBids();
    expect(a.status).toBe('pending');                         // ikke på ferie: mennesket svarer selv
    g.manager.holiday = { rejectAll: true };
    cmHolidayAnswerBids();
    expect(a.status).toBe('rejected');
    g.manager.holiday = {};
    const b = bid(1_000);
    cmHolidayAnswerBids();
    expect(b.status).not.toBe('pending');
    g.manager.holiday = undefined;
  });
  it('udbudsprisen på ferie (ønskelisterne til): 0x4d16ce → 0x5fea50 i lønportenes hukommelse kaster ikke (20/11: ferien gik ned ved første bud)', () => {
    const g = gs();
    const prev = SL_ON.on;
    SL_ON.on = true;
    try {
      const p = Object.values(g.players).filter((x) => x.club === mu && !x.loan).sort((a, b) => b.ca - a.ca)[0];
      const buyer = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!;
      const home = cmAskingPrice(g, p, buyer.id);
      g.manager.holiday = {};
      const hol = cmAskingPrice(g, p, buyer.id);
      g.manager.holiday = { rejectBelow: true };
      const below = cmAskingPrice(g, p, buyer.id);
      expect(home).toBeGreaterThan(0);
      expect(hol).toBeGreaterThan(0);
      expect(below).toBeGreaterThan(0);
      // og assistentens svar på et bud går igennem (før: Error "cmWageGame: kald 0x5fea50 er ikke porteret")
      g.manager.holiday = {};
      const o = { id: g.nextId.offer++, player: p.id, buyer: buyer.id, seller: mu, fee: 1_000, loan: false, status: 'pending' as const, created: g.date, respondBy: g.date };
      g.offers.push(o);
      expect(() => cmHolidayAnswerBids()).not.toThrow();
      expect(o.status).not.toBe('pending');
    } finally {
      SL_ON.on = prev;
      g.manager.holiday = undefined;
    }
  });
  it('jobtilbuddet besvares af assistenten: nej fjerner tilbuddet uden ny ledighed, ja giver jobbet', () => {
    const g = gs();
    const other = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!;
    const vac = g.cmBoard!.vac.length;
    g.jobOffers.push(other.id);
    holidayJobs.push({ club: other.id, yes: false });
    holidayJobAnswers(g);
    expect(g.jobOffers).not.toContain(other.id);
    expect(g.cmBoard!.vac.length).toBe(vac);
    other.manager = 0;
    g.manager.holiday = { applyJobs: true };
    g.jobOffers.push(other.id);
    holidayJobs.push({ club: other.id, yes: true });
    holidayJobAnswers(g);
    expect(g.userClub).toBe(other.id);
    g.manager.holiday = undefined;
  });
});
