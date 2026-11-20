// Ejerens fejl 21/11 (Silkeborg): "min scouts kontrakt udløber snart, men jeg kan kun fyre ham". CM 01/02's Action-menu 0x870650 har for egen
// stab Offer New Contract (kommando 6 → Set Role At Club 0x4dd0f0 → Offer Contract 0x4deac0/0x4e06e0) og Terminate Contract (0x4e53e0); svaret er
// 0x4ce4e0 med isOwn (cmContractGame.ts cmStaffContractAnswer) og nyheden 0xbb8 (0x4d4fb0: "X accepts/rejects contract offer"). Udløbet 0x4c7ac0:
// påmindelser 182/91/7 dage før, på dagen "X's contract expires" – og han bliver i klubben (0x4c8603: kun 0x866f60/+0x49 sender ham væk).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffContractAnswer, cmStaffOfferCheck } from '../src/game/cmContractGame';
import { cmOfferStaff, cmOwnStaffContractsDaily, cmRenewNews, cmStaffOffersDaily, JOB_CODE } from '../src/game/cmStaff';
import { addDays } from '../src/game/dates';

describe('Offer New Contract til egen stab (Silkeborg 1.7.01, ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const dk = world.nations.findIndex((n) => n.name === 'Denmark');
  const silk = world.clubs.find((c) => c[1].startsWith('Silkeborg'))![0];
  createGame(world, { managerName: 'M S', managerNation: dk, clubId: silk, activeNations: [dk], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const scout = Object.values(g.staff).find((x) => x.club === silk && x.role === 'scout')!;

  it('kravet og loftet for egen stab (0x4de1f0: loftet mindst hans løn)', () => {
    expect(scout).toBeTruthy();
    const chk = cmStaffOfferCheck(g, scout, silk, JOB_CODE.scout)!;
    expect(chk).not.toBeNull();
    expect(chk.allow).toBeGreaterThanOrEqual(Math.round(scout.wage) - 1);
    expect(chk.wage).toBeGreaterThan(0);
  });

  it('afslag (halv løn) → "rejects contract offer", kontrakten uændret; kravet → "accepts contract offer" og ny kontrakt', () => {
    const chk = cmStaffOfferCheck(g, scout, silk, JOB_CODE.scout)!;
    const oldExp = scout.expires, oldWage = scout.wage;
    const send = (wage: number, years: number) => {
      expect(cmOfferStaff(g, { staff: scout.id, role: 'scout', wage, years, signOn: 0 })).toBe('ok');
      g.cmStaffOffers![g.cmStaffOffers!.length - 1].date = addDays(g.date, -1);
      cmStaffOffersDaily(g);
    };
    send(Math.max(50, Math.round(chk.wage * 0.3)), 3);
    expect(g.news[0]?.key).toBe('cm.staffRenewNo');
    expect(g.news[0]?.params.body).toMatch(/^rej/);
    expect(scout.club).toBe(silk);
    expect(scout.expires).toBe(oldExp);
    expect(scout.wage).toBe(oldWage);
    const ans = cmStaffContractAnswer(g, scout, silk, JOB_CODE.scout, { wage: chk.wage, signOn: 0, expires: `${Number(g.date.slice(0, 4)) + 3}-06-30` })!;
    expect(ans.accept).toBe(true);
    send(chk.wage, 3);
    expect(g.news[0]?.key).toBe('cm.staffRenewOk');
    expect(scout.club).toBe(silk);
    expect(scout.expires).toBe(`${Number(g.date.slice(0, 4)) + 3}-06-30`);
    expect(scout.wage).toBe(chk.wage);
  });

  it('brødteksten 0x4d4fb0: uden grunde og under 1 mio. → "has signed a new contract … until"', () => {
    const n = cmRenewNews(g, scout, g.clubs[silk], { accept: true, reasons: 0, mgr: true, variant: 0 }, { wage: 500, signOn: 0, expires: '2004-06-30' });
    expect(n.body).toBe('signed');
    expect(n.years).toBe(3);
    const love = cmRenewNews(g, scout, g.clubs[silk], { accept: true, reasons: 8, mgr: true, variant: 2 }, { wage: 500, signOn: 0, expires: '2004-06-30' });
    expect(love.body).toBe('sealedN');
    const rej = cmRenewNews(g, scout, g.clubs[silk], { accept: false, reasons: 4, mgr: true, variant: 0 }, { wage: 500, signOn: 0, expires: '2004-06-30' });
    expect([rej.body, rej.r1]).toEqual(['rejR', 'away']);
  });

  it('udløbet: påmindelse 182/91/7 dage før, "contract expires" på dagen – og han bliver i klubben', () => {
    scout.expires = addDays(g.date, 7);
    cmOwnStaffContractsDaily(g);
    expect(g.news[0]?.key).toBe('scout.contractReminder');
    expect(g.news[0]?.params.days).toBe(7);
    scout.expires = g.date;
    cmOwnStaffContractsDaily(g);
    expect(g.news[0]?.key).toBe('cm.staffExpires');
    expect(scout.club).toBe(silk);
    // efter udløbet kan han stadig tilbydes en ny kontrakt
    expect(cmStaffOfferCheck(g, scout, silk, JOB_CODE.scout)).not.toBeNull();
  });
});
