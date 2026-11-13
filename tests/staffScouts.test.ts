// Stab og spejdere som i CM 01/02 (cmStaff.ts) – kun den originale database i ægte tilstand.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  cmCapsLine, cmCoachingStyle, cmJobKey, cmOtherStyles, cmPrefFormation, cmPrefStyle, cmRolesFor, cmStaffAttr, cmStaffAttrList, cmStaffInSearch,
  cmStaffOffersDaily, cmStaffRepWord, cmRejectStaff,
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

describe('cmStaff – i spillet (3.9.60, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  it('Staff Search: kun databasens stab; kontrakttilbuddet besvares som nyhed med Negotiate', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const region = regionOf('England');
    const all = Object.values(g.staff);
    const shown = all.filter((s) => cmStaffInSearch(g, s, region));
    expect(shown.length).toBeGreaterThan(300);
    expect(shown.every((s) => s.cmId !== undefined && s.club !== g.userClub)).toBe(true);
    expect(shown.length).toBeLessThan(all.length / 3);
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
