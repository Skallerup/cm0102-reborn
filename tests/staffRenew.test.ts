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
import { expDown, expDownOff, expIso, expUp, expUpOff, ymOf, type YM } from '../src/game/cmContractScreen';
import { cashStepEur } from '../src/i18n';

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

  it('0x527240-genereret spejder (uden databasens ikke-spillerpost) vil forhandle: 0x844780 for c == H = 3,5 (ejerens Danny Albrecht 21/11)', () => {
    const gen = Object.values(g.staff).filter((x) => x.club === silk && x.role === 'scout' && x.cmMem && !x.cmNp);
    expect(gen.length).toBeGreaterThan(0);
    for (const sc of gen) {
      const c = cmStaffOfferCheck(g, sc, silk, JOB_CODE.scout)!;
      expect(c.interested).toBe(true);
      expect(c.key).toBeNull();
      expect(c.will).toBeCloseTo(3.5, 5);
      expect(c.wage).toBeLessThan(c.allow * 1.5);
    }
  });

  it('udløbet fra skærmen (måned/år, dag = startdagen højst 28) følger med tilbuddet', () => {
    const sc = Object.values(g.staff).find((x) => x.club === silk && x.role === 'scout' && x.cmMem && !x.cmNp)!;
    const c = cmStaffOfferCheck(g, sc, silk, JOB_CODE.scout)!;
    const exp = `${Number(g.date.slice(0, 4)) + 2}-11-01`;
    expect(cmOfferStaff(g, { staff: sc.id, role: 'scout', wage: c.wage * 1.2, years: 2, signOn: 0, expires: exp })).toBe('ok');
    g.cmStaffOffers![g.cmStaffOffers!.length - 1].date = addDays(g.date, -1);
    cmStaffOffersDaily(g);
    expect(g.news[0]?.key).toBe('cm.staffRenewOk');
    expect(sc.expires).toBe(exp);
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

describe('Offer Contract-skærmens trin (0x4e2280)', () => {
  it('ugeløn: Cash::step_up/step_down flag 8 (0x867b70/0x867c50) i £', () => {
    const gbp = (eur: number) => Math.round(eur * 0.86);
    expect(gbp(cashStepEur(1500 / 0.86, 8, -1, 'GBP'))).toBe(1400);
    expect(gbp(cashStepEur(1500 / 0.86, 8, 1, 'GBP'))).toBe(1600);
    expect(gbp(cashStepEur(1000 / 0.86, 8, 1, 'GBP'))).toBe(1100);   // trinnet over x + 1 = 100
    expect(gbp(cashStepEur(1000 / 0.86, 8, -1, 'GBP'))).toBe(975);   // ≤ 1000: 25
    expect(gbp(cashStepEur(0, 4, 1, 'GBP'))).toBe(1000);             // signing on: flag 4, ≤ 10.000: 1000
  });
  it('udløbet: måned for måned i det første år, ellers år for år; grænsen er hans nuværende udløb', () => {
    const today: YM = ymOf('2002-06-23');
    // egen stab med kontrakt til 30/6-2003: Jun 2004 kan ikke sænkes (det næste, Jun 2003, er på grænsen)
    const own: YM = ymOf('2003-06-30');
    expect(expDownOff([2004, 5], today, own)).toBe(true);
    expect(expUp([2004, 5], today, own)).toEqual([2005, 5]);
    // en ny: grænsen i dag + 32 dage (jul. 2002); ned år for år til næste år, så måned for måned
    const min: YM = ymOf('2002-07-25');
    let cur: YM = [2004, 5];
    const seq: string[] = [];
    while (!expDownOff(cur, today, min)) { cur = expDown(cur, today); seq.push(`${cur[1] + 1}/${cur[0]}`); }
    expect(seq.slice(0, 3)).toEqual(['6/2003', '5/2003', '4/2003']);
    expect(cur).toEqual([2002, 7]);
    // op: måned for måned til grænsens måned året efter, derefter år for år; grå når året − 10 ≥ i år
    cur = [2003, 5];
    cur = expUp(cur, today, min); expect(cur).toEqual([2003, 6]);
    cur = expUp(cur, today, min); expect(cur).toEqual([2004, 6]);
    expect(expUpOff([2012, 0], today)).toBe(true);
    expect(expUpOff([2011, 11], today)).toBe(false);
    expect(expIso([2004, 5], '2002-06-30')).toBe('2004-06-28');
  });
});
