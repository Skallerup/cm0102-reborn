// Stab og spejdere som i CM 01/02 (cmStaff.ts) – kun den originale database i ægte tilstand.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  cmCapsLine, cmCoachingStyle, cmJobKey, cmOtherStyles, cmPrefFormation, cmPrefStyle, cmRolesFor, cmStaffAttr, cmStaffAttrList, cmStaffInSearch,
  cmStaffOffersDaily, cmStaffRepWord, cmRejectStaff, cmJobCode, cmStaffClub, cmScoutRec, cmClubLevel, cmFinanceStatus, scoutJudgement,
} from '../src/game/cmStaff';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { regionOf } from '../src/game/leagues';
import { addDays } from '../src/game/dates';
import type { Staff } from '../src/game/types';

const mk = (o: Partial<Staff>): Staff => ({ id: 1, first: 'Mika', last: 'Aaltonen', nation: 0, dob: '1967-03-12', club: 0, role: 'coach',
  attrs: { coaching: 10, judgingAbility: 10, judgingPotential: 10, physio: 5, motivating: 10, discipline: 10, tactics: 10 }, rep: 30, wage: 500, expires: '', ...o });
const np = (set: Record<number, number>) => { const a = Array(22).fill(10); for (const [k, v] of Object.entries(set)) a[Number(k) - 0x0e] = v; return a; };

describe('cmStaff – rene funktioner', () => {
  it('Rep.-ordet 0x80e787 (grænserne og Unproven under 35 år)', () => {
    const w = (rep: number, dob = '1950-01-01') => cmStaffRepWord(mk({ cmRep: [rep, rep, rep], dob }), '2001-07-25');
    expect([9500, 9499, 8000, 7999, 6000, 5999, 3750].map((r) => w(r))).toEqual(['superb', 'veryGood', 'veryGood', 'good', 'good', 'ok', 'ok']);
    expect(w(3749)).toBe('poor');
    expect(w(499)).toBe('veryPoor');
    expect(w(3749, '1967-03-12')).toBe('unproven');   // 34 år
    expect(w(100, '1967-03-12')).toBe('unproven');
  });
  it('jobbets korte navn 0x53ad00 (ledige = Unemployed)', () => {
    expect(cmJobKey(mk({ club: 0, role: 'scout' }))).toBe('cm.job.0');
    expect(cmJobKey(mk({ club: 5, role: 'scout' }))).toBe('cm.job.9');
    expect(cmJobKey(mk({ club: 5, role: 'assistant' }))).toBe('cm.job.6');
  });
  it('Set Role At Club 0x4cb990', () => {
    const d = '2001-07-25';
    // Protasof: spejder, 35 år → Assistant Manager, Coach, Scout (ejerens billede 51)
    expect(cmRolesFor(mk({ club: 9, role: 'scout', dob: '1966-03-19' }), d)).toEqual(['assistant', 'coach', 'scout']);
    // ledig (jobkode 0) under 30 → intet; over 30 → assistent og træner
    expect(cmRolesFor(mk({ club: 0, role: 'scout', dob: '1975-01-01' }), d)).toEqual([]);
    expect(cmRolesFor(mk({ club: 0, role: 'scout', dob: '1960-01-01' }), d)).toEqual(['assistant', 'coach']);
    // fysioterapeut over 30: assistent og fysioterapeut, ikke træner
    expect(cmRolesFor(mk({ club: 9, role: 'physio', dob: '1960-01-01' }), d)).toEqual(['assistant', 'physio']);
    // ung træner: assistent og træner (jobkode 8)
    expect(cmRolesFor(mk({ club: 9, role: 'coach', dob: '1978-01-01' }), d)).toEqual(['assistant', 'coach']);
  });
  it('profilens egenskaber 0x543fd0 og Physiotherapy-reglen 0x87ad61', () => {
    const s = mk({ ca: 120, cmNp: np({ 0x14: 13, 0x22: 4, 0x1e: -60 }), cmHid: [12, 15, 8, 10, 10, 10, 10, 10, 7] });
    expect(cmStaffAttr(s, 'adaptability')).toBe(12);
    expect(cmStaffAttr(s, 'determination')).toBe(8);
    expect(cmStaffAttr(s, 'discipline')).toBe(13);
    expect(cmStaffAttr(s, 'youngsters')).toBe(4);
    expect(cmStaffAttrList(s).map((x) => x.k)).not.toContain('physiotherapy');
    expect(cmStaffAttrList({ ...s, club: 4, role: 'physio' }).map((x) => x.k)).toContain('physiotherapy');
    expect(cmStaffAttrList(s)).toHaveLength(11);
  });
  it('Coaching Style, Preferred Formation/Style og Other (0x87af13, 0x87b90a, 0x87ba88, 0x87bb86)', () => {
    expect(cmCoachingStyle(mk({ cmNp: np({ 0x12: 5 }) }))).toBe('fitness');
    expect(cmCoachingStyle(mk({ cmNp: np({ 0x12: 15 }) }))).toBe('technique');
    expect(cmCoachingStyle(mk({ cmNp: np({ 0x12: 10 }) }))).toBe('general');
    const f = np({}); f[21] = 3;
    expect(cmPrefFormation(mk({ cmNp: f }))).toBe('4-4-2');
    expect(cmPrefFormation(mk({ cmNp: np({}) }))).toBe(null);
    expect(cmPrefStyle(mk({ cmNp: np({ 0x0e: 16, 0x13: 4 }) }))).toBe('attractive');
    expect(cmPrefStyle(mk({ cmNp: np({ 0x0e: 16, 0x13: 16 }) }))).toBe('directAttacking');
    expect(cmPrefStyle(mk({ cmNp: np({}) }))).toBe('none');
    expect(cmOtherStyles(mk({ cmNp: np({ 0x1a: 15 }) }))).toEqual(['marking']);
    expect(cmOtherStyles(mk({ cmNp: np({ 0x1a: 15, 0x1c: 15, 0x1f: 15 }) }))).toEqual(['pressing', 'offside', 'marking']);
  });
  it('landskampene 0x874e6a', () => {
    expect(cmCapsLine(0, 0)).toBe(null);
    expect(cmCapsLine(1, 0)?.key).toBe('cm.caps.one');
    expect(cmCapsLine(7, 1)?.key).toBe('cm.caps.nGoal');
    expect(cmCapsLine(60, 30)?.key).toBe('cm.caps.nGoals');
    expect(cmCapsLine(60, undefined)?.key).toBe('cm.caps.n');
  });
});

describe('Rec – 0x7b62a0/0x7bca90/0x5986b0', () => {
  it('klubbens niveau 0x7bca90', () => {
    // omdømme 9000, +0x77 0, division +0x69 = 20 (> 9000/500 → esi = edi = 10000), professionel, 50 spillere, saldo 0
    const base = { rep: 9000, b77: 0, divRep: 20, pro: true, squad: 50, hasComp: true, finStatus: 0 };
    // sum = 9000 + 7·9000 + 4·20000 = 152000 → v = 9500 → 3·9500 + 7500 = 36000
    expect(cmClubLevel(base)).toBe(36000);
    expect(cmClubLevel({ ...base, squad: 15 })).toBe(18000);                 // under 16 spillere: halveret
    expect(cmClubLevel({ ...base, squad: 30 })).toBe(18000);                 // 30 − (1,35·20 + 20) = −17 → −10 → ×0,5
    expect(cmClubLevel({ ...base, finStatus: 2 })).toBe(36900);              // max(1,025·L, L + 250)
    expect(cmClubLevel({ ...base, finStatus: -2 })).toBe(32727);             // min(L/1,1, L − 1000)
    expect(cmClubLevel({ ...base, pro: false })).toBe(5 * 4750 - 5000);              // ikke professionel: v halveres (4750 → 5v − 5000)
    expect(cmClubLevel({ rep: 0, b77: 0, divRep: null, pro: false, squad: 0, hasComp: false, finStatus: 0 })).toBe(5000);
  });
  it('økonomiens status 0x5986b0', () => {
    expect(cmFinanceStatus(30_000_000, 9000)).toBe(2);
    expect(cmFinanceStatus(13_000_000, 9000)).toBe(1);
    expect(cmFinanceStatus(0, 9000)).toBe(0);
    expect(cmFinanceStatus(-6_000_000, 9000)).toBe(-1);
    expect(cmFinanceStatus(-20_000_000, 9000)).toBe(-2);
    expect(cmFinanceStatus(-1_000_001, 4000)).toBe(-1);
  });
  it('stjernerne 0x7b687b (L, 2·omdømme + 12750/10750/10500) og alderen', () => {
    const rec = Array(0x46).fill(10); rec[0xf] = 1; rec[0x13] = 20;          // midtbane (naturlig plads → P = 200)
    const base = { rec, age: 27, playerId: 77, ca: 150, pa: 170, free: false, repSeen: 7500, judge: { id: 3, ja: 20, jp: 20 }, clubRep: 5000, level: 20000, gameSeed: 1, rand: [0, 0, 0, 0] as [number, number, number, number] };
    const [ab, pot] = scoutJudgement(base);
    expect(pot).toBe(0);                                                     // potentialet kun under 25 år
    expect(ab).toBeGreaterThan(0);
    // 34+ år ×0,85 – aldrig flere stjerner
    expect(scoutJudgement({ ...base, age: 35 })[0]).toBeLessThanOrEqual(ab);
    // omdømmegrænsen: et stort omdømme hos spejderens klub tager 5/4 stjerner
    expect(scoutJudgement({ ...base, clubRep: 10000, level: 1750 })[0]).toBe(3);
    expect(scoutJudgement({ ...base, clubRep: 0, level: 1750 })[0]).toBe(5);
    expect(scoutJudgement({ ...base, age: 20 })[1]).toBeGreaterThan(0);
  });
});

describe('cmStaff – i spillet (3.9.60, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  it('Staff Search: originalens hukommelse (0x524d70 + 0x527240) – 6.680 med England; kontrakttilbuddet besvares som nyhed med Negotiate', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const region = regionOf('England');
    const all = Object.values(g.staff);
    const shown = all.filter((s) => cmStaffInSearch(g, s, region));
    // ejerens billede (work-ui/r4/50.png): "6680 staff found" – ±5 %
    expect(Math.abs(shown.length - 6680) / 6680).toBeLessThan(0.05);
    expect(shown.some((s) => s.club === g.userClub)).toBe(false);
    // formænd/direktører og stab i klubber uden for spillet er med (cmExtra), men ikke en del af spillets stab
    const extra = shown.filter((s) => s.cmExtra);
    expect(extra.some((s) => cmJobCode(s) === 1)).toBe(true);
    expect(extra.every((s) => s.club === 0 && s.wage === 0)).toBe(true);
    const bettega = shown.find((s) => s.last === 'Bettega')!;
    expect(cmJobCode(bettega)).toBe(4);
    expect(cmStaffClub(g, bettega)?.name).toBe(g.clubs[bettega.cmClub!].short || g.clubs[bettega.cmClub!].name);
    // uden klub: Unemployed (Terzi i billedet)
    expect(cmJobCode(shown.find((s) => s.last === 'Terzi')!)).toBe(0);
    // en klub uden for de valgte lande: dens almindelige stab er ikke i hukommelsen, de kendte er (Capello, Roma)
    expect(shown.find((s) => s.last === 'Capello')?.club).toBeGreaterThan(0);
    // Sir Alex: menneskets klub → ledig og med i søgningen
    const fergie = all.find((s) => `${s.first} ${s.last}`.includes('Alex Ferguson'))!;
    expect(fergie.club).toBe(0);
    expect(cmStaffInSearch(g, fergie, region)).toBe(true);
    // Rec: de bedste spillere i verden får 4-5 stjerner af Man Utds spejder, de fleste 0
    const top = Object.values(g.players).filter((p) => p.club !== mu).sort((a, b) => b.ca - a.ca).slice(0, 10);
    expect(top.filter((p) => cmScoutRec(g, p) >= 4).length).toBeGreaterThanOrEqual(8);
    // Wenger: Superb (cmRep +0xa = 9500)
    const wenger = all.find((s) => s.last === 'Wenger')!;
    expect(cmStaffRepWord(wenger, g.date)).toBe('superb');
    // tilbud til en træner i en anden klub – svaret kommer dagen efter
    const coach = shown.find((s) => s.club && s.role === 'coach' && cmRolesFor(s, g.date).includes('coach'))!;
    expect(applyAction({ t: 'cmStaffOffer', id: coach.id, role: 'coach', wage: 1, years: 2, signOn: 0 })).toBe('ok');
    g.date = addDays(g.date, 1);
    cmStaffOffersDaily(g);
    const n = g.news.find((x) => x.key === 'cm.staffRejects')!;
    expect(n).toBeTruthy();
    expect(n.params.last).toBe(coach.last);
    expect(cmRejectStaff(g, n)?.id).toBe(coach.id);
    expect(g.cmStaffOffers).toEqual([]);
  }, 60_000);
});
