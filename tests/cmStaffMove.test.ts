// Computerklubbernes stabsskifter (cmStaffMove.ts) og stabens vurdering 0x69d1b0 for jobbene 6–10 (cmBoard.ts) – den originale database i ægte tilstand.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffCompensation, cmStaffRestGbp } from '../src/game/cmStaff';
import { cmStaffBidAnswer, cmStaffBidOpen, cmStaffMovesDaily, cmStaffPlan } from '../src/game/cmStaffMove';
import { cmStaffTerms } from '../src/game/cmContractGame';
import { boardEnv } from '../src/game/cmBoardGame';
import { scoreStaffForJob } from '../src/game/cmBoard';
import { t } from '../src/i18n';

const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();

describe('stabsskifter (cmStaffMove)', () => {
  it('0x8d0780: kompensationen = dage til udløb · ugeløn / 7 i £, mellem £1.000 og £1.000.000', () => {
    const s = Object.values(g.staff).find((x) => x.club && x.wage > 0 && x.expires > g.date)!;
    const days = Math.round((Date.parse(s.expires) - Date.parse(g.date)) / 86400000);
    const raw = Math.trunc((days * Math.round(s.wage * 0.86)) / 7);
    expect(cmStaffRestGbp(g, s, false)).toBe(raw);
    expect(cmStaffRestGbp(g, s)).toBe(Math.min(1_000_000, Math.max(1000, raw)));
    expect(cmStaffCompensation(g, { ...s, club: 0 })).toBe(0);
  });

  it('0x69d1b0: stabens jobblokke giver en vurdering (ikke −10000) og vægter jobbets egenskaber', () => {
    const env = boardEnv(g);
    const c = Object.values(g.clubs).find((x) => x.name === 'Fulham')!.id;
    const scouts = Object.values(g.staff).filter((s) => s.cmNp && !s.cmExtra && s.role === 'scout').slice(0, 30);
    const vals = scouts.map((s) => scoreStaffForJob(env, env.person(s.id)!, c, 9, env.manager(c)));
    expect(vals.some((v) => v > 0)).toBe(true);
    // managerjobbet er uændret: job 5 bruger stadig MANAGER_MANAGER's gren
    const m = Object.values(g.staff).find((s) => s.cmNp && s.role === 'manager' && s.club)!;
    expect(scoreStaffForJob(env, env.person(m.id)!, m.club, 5)).toBe(scoreStaffForJob(env, env.person(m.id)!, m.club, 5, null));
  });

  it('spilstarten: computerklubberne i de valgte lande byder på stab til deres ledige pladser – kun dem', () => {
    const moves = g.cmStaffMoves ?? [];
    expect(moves.length).toBeGreaterThan(0);
    for (const m of moves) {
      expect(g.clubs[m.c].nation).toBe(eng);
      expect(g.clubs[m.c].manager).not.toBe(-1);
      expect([6, 8, 9, 10]).toContain(m.job);
    }
  });

  it('handlen: kompensationen bogføres som køb/salg, personen skifter, og nyheden har originalens ordlyd', () => {
    const m = (g.cmStaffMoves ?? []).find((x) => x.from && x.fee > 0) ?? (g.cmStaffMoves ?? [])[0];
    const s = g.staff[m.s], buyer = g.clubs[m.c], seller = m.from ? g.clubs[m.from] : undefined;
    const b0 = buyer.balance, s0 = seller?.balance ?? 0;
    g.cmStaffMoves = [{ ...m, due: g.date }];
    const before = s.club;
    cmStaffMovesDaily(g);
    if (s.club === before) return;                                            // han sagde nej (viljen) – handlen prøves i scripts/cm-staff-moves.ts
    expect(s.club).toBe(m.c);
    if (seller && m.fee > 0) {
      expect(buyer.balance).toBe(b0 - m.fee);
      expect(seller.balance).toBe(s0 + m.fee);
    }
  });

  it('nyheden: "Fulham sign Collier" / "Fulham have appointed Sunderland David Collier as a scout."', () => {
    const p = { to: 'Fulham', last: 'Collier', name: 'David Collier', from: 'Sunderland', job: 'a scout' };
    expect(t('cm.stm.3', p)).toBe('Fulham sign Collier');
    expect(t('cm.stm.bodyFrom', p)).toBe("Fulham have appointed Sunderland's David Collier as a scout.");
  });

  it('0x8be884: et bud på menneskets stab venter i 28 dage på Respond – Accept giver personens svar efter 1–5 dage, Reject og fristen fjerner det', () => {
    const s = Object.values(g.staff).find((x) => x.club === g.userClub && x.cmNp && x.role !== 'manager')!;
    const c = Object.values(g.clubs).find((x) => x.name === 'Fulham')!.id;
    const saved = g.cmStaffMoves;
    const mk = (id: number) => ({ s: s.id, c, job: 9, from: g.userClub, fee: 5000, due: '2099-01-01', h: 1 as const, id });
    g.cmStaffMoves = [mk(901), mk(902), { ...mk(903), due: g.date }];
    const n = (id: number) => ({ key: 'cm.stBid', params: { sb: id } });
    expect(cmStaffBidOpen(g, n(901))?.id).toBe(901);
    expect(cmStaffBidOpen(g, { key: 'cm.stm.0', params: { sb: 901 } })).toBeNull();
    expect(cmStaffBidAnswer(g, 901, true)).toBe('ok');
    const acc = g.cmStaffMoves.find((m) => m.id === 901)!;
    expect(acc.h).toBeUndefined();
    const d = (Date.parse(acc.due) - Date.parse(g.date)) / 86400000;
    expect(d).toBeGreaterThanOrEqual(1); expect(d).toBeLessThanOrEqual(5);
    expect(cmStaffBidAnswer(g, 902, false)).toBe('ok');
    expect(g.cmStaffMoves.some((m) => m.id === 902)).toBe(false);
    cmStaffMovesDaily(g);                                                     // 903's frist er nået uden svar
    expect(g.cmStaffMoves.some((m) => m.id === 903)).toBe(false);
    expect(g.cmStaffMoves.some((m) => m.id === 901)).toBe(true);
    g.cmStaffMoves = saved;
  });

  it('0x83ee36 → 0x690890: første kørsel efter et managerskifte fyrer indehavere under grænsen T', () => {
    const env = boardEnv(g);
    const club = Object.values(g.clubs).find((x) => x.nation === eng && x.manager > 0 && x.id !== g.userClub
      && Object.values(g.staff).filter((s) => s.club === x.id && s.cmNp && s.role !== 'manager').length >= 3)!;
    const before = Object.values(g.staff).filter((s) => s.club === club.id && s.cmNp && s.role !== 'manager');
    cmStaffPlan(g, club.id, 5000 * 5, 0, false);                              // uden managerskifte: ingen fyres
    expect(before.every((s) => s.club === club.id)).toBe(true);
    const mgr = env.manager(club.id);
    const weak = before.filter((s) => scoreStaffForJob(env, env.person(s.id)!, club.id, ({ assistant: 6, coach: 8, scout: 9, physio: 10 } as Record<string, number>)[s.role], mgr) < 5000);
    cmStaffPlan(g, club.id, 5000 * 5, 0, true);
    const gone = before.filter((s) => s.club !== club.id);
    expect(gone.length).toBeGreaterThan(0);
    for (const s of gone) { expect(weak).toContain(s); expect(s.club).toBe(0); expect(s.career?.at(-1)?.why).toBe('sacked'); }
  });

  it('0x4cda70/0x85fc50: originalens kontrakttilbud til en spejder (løn og udløb; 250.000-kravet = han vil ikke)', () => {
    const chel = Object.values(g.clubs).find((x) => x.name === 'Chelsea')!.id;
    const cands = Object.values(g.staff).filter((x) => x.cmNp && x.role === 'scout' && x.club && x.club !== chel && x.club !== g.userClub && g.clubs[x.club]?.nation === eng).slice(0, 8);
    const terms = cands.map((s) => cmStaffTerms(g, s, chel, 9)!);
    for (const t0 of terms) {
      expect(t0).not.toBeNull();
      expect(t0.expires > g.date).toBe(true);
      if (!t0.refuse) expect(t0.wage).toBeLessThan(250000 / 0.86);
    }
    const ok = terms.filter((t0) => t0.offered);
    expect(ok.length).toBeGreaterThan(0);
    for (const t0 of ok) { expect(t0.wage).toBeGreaterThan(100); expect(t0.wage).toBeLessThan(5000); }
  });

  it('nyheden til mennesket: "{club} transfer bid for {name}" med kompensationen', () => {
    const p = { club: 'Fulham', name: 'David Collier', from: 'Sunderland', fee: '£25K' };
    expect(t('cm.stBid', p)).toBe('Fulham transfer bid for David Collier');
    expect(t('cm.stBid.body', p)).toBe('Fulham have made an offer for David Collier.\n\nSunderland will be due £25K in compensation if the deal goes ahead.');
  });
});
