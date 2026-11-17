// Computerklubbernes stabsskifter (cmStaffMove.ts) og stabens vurdering 0x69d1b0 for jobbene 6–10 (cmBoard.ts) – den originale database i ægte tilstand.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffCompensation, cmStaffRestGbp } from '../src/game/cmStaff';
import { cmStaffMovesDaily, cmStaffPlan } from '../src/game/cmStaffMove';
import { cmStaffTerms, cmStaffWill } from '../src/game/cmContractGame';
import { boardEnv, staffJobInterest } from '../src/game/cmBoardGame';
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

  it('0x840682/0x8407a2: målet er kun personer med viljen 0x844780(staff, klub, 1, job) ≥ 3,15 – de svarer ja (≥ 0,75)', () => {
    const env = boardEnv(g);
    const moves = (g.cmStaffMoves ?? []).slice(0, 12);
    expect(moves.length).toBeGreaterThan(0);
    // trupplanen kører, mens staben uden databaseløn har lønnen −1 (0x4c7560/0x85e960 → 0x83a1b0 fylder den først ud bagefter –
    // cmStaffWagePrepare): lønningerne stilles tilbage som under planen
    const dbw = new Map((w.staff ?? []).map((r) => [r[9], r[12]?.[11] ?? 0]));
    const saved = new Map(Object.values(g.staff).map((s) => [s, s.wage]));
    for (const s of saved.keys()) {
      const d = dbw.get(s.cmId ?? -1) ?? 0;
      if (s.club && !s.cmExtra && s.role !== 'manager' && !(d > 0 && d <= 15 * (s.cmRep?.[1] ?? 0))) s.wage = -1 / 0.86;
    }
    // (efter planen ændrer spilstarten stadig klubbernes budgetter/økonomi – 0x598800 m.fl. – så viljen regnes her lidt anderledes end under
    // planen: de fleste skal stadig nå kravet)
    let ok = 0;
    try {
      for (const m of moves) {
        const s = g.staff[m.s], p = env.person(s.id)!;
        const S = staffJobInterest(g, env, p, m.c, m.job);
        if (cmStaffWill(g, s, m.c, m.job, S) >= 3.15 && S >= 0.75) ok++;
      }
    } finally { for (const [s, v] of saved) s.wage = v; }
    expect(ok).toBeGreaterThanOrEqual(Math.ceil(moves.length * 0.75));
    // under 1,75 indgår kontraktdelen ikke (0x846639)
    const any = g.staff[moves[0].s];
    expect(cmStaffWill(g, any, moves[0].c, moves[0].job, 1.5)).toBe(1.5);
  });

  it('0x68f130/0x83fa68: ledige beholder databasens job +0x3d, landstrænerne +0x28 = 5 – ingen bud på managere (oraklets gemte spil 15/7-2001)', () => {
    const env = boardEnv(g);
    const by = (last: string, first: string) => Object.values(g.staff).find((s) => s.last === last && s.first === first && !s.club && s.cmNp && !s.cmExtra)!;
    const job = (s: { id: number }) => [env.person(s.id)!.job, env.person(s.id)!.natJob];
    expect(job(by('Davies', 'Billy'))).toEqual([5, 0]);
    expect(job(by('Carson', 'Kit'))).toEqual([9, 0]);
    expect(job(by('Arena', 'Bruce'))).toEqual([0, 5]);
    expect(job(by('van Gaal', 'Louis'))).toEqual([0, 5]);
    // menneskets forgænger: 0x690890 beholder jobkoden
    expect(env.person(Object.values(g.staff).find((s) => s.last === 'Wenger')!.id)!.job).toBe(5);
    for (const m of g.cmStaffMoves ?? []) { const p = env.person(m.s)!; expect(p.job).not.toBe(5); expect(p.natJob).not.toBe(5); }
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

  it('0x8e638b/0x8be857: et bud på menneskets stab spørger ikke mennesket – personen svarer efter 1–5 dage, og kompensationen går til mennesket', () => {
    const s = Object.values(g.staff).find((x) => x.club === g.userClub && x.cmNp && x.role === 'scout')
      ?? Object.values(g.staff).find((x) => x.club === g.userClub && x.cmNp && x.role !== 'manager')!;
    const c = Object.values(g.clubs).find((x) => x.name === 'Fulham')!.id;
    const saved = g.cmStaffMoves;
    // ældre gemte spil: et bud, der ventede på Respond (h), får personens svar som alle andre
    g.cmStaffMoves = [{ s: s.id, c, job: 9, from: g.userClub, fee: 5000, due: '2099-01-01', h: 1, id: 901 }];
    cmStaffMovesDaily(g);
    const m = g.cmStaffMoves[0];
    expect(m.h).toBeUndefined();
    const d = (Date.parse(m.due) - Date.parse(g.date)) / 86400000;
    expect(d).toBeGreaterThanOrEqual(1); expect(d).toBeLessThanOrEqual(5);
    // handlen på dagen: mennesket bliver ikke spurgt; siger personen ja, får menneskets klub kompensationen
    const me = g.clubs[g.userClub], buyer = g.clubs[c];
    const m0 = me.balance, b0 = buyer.balance;
    g.cmStaffMoves = [{ ...m, due: g.date }];
    cmStaffMovesDaily(g);
    expect(g.cmStaffMoves.length).toBe(0);
    if (s.club === c) { expect(me.balance).toBe(m0 + 5000); expect(buyer.balance).toBe(b0 - 5000); }
    else expect(s.club).toBe(g.userClub);                                     // han sagde nej (viljen/kontrakten) eller pladsen var fyldt
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

  it('nyheden til mennesket (0x8d3520): "{club} transfer bid for {name}", 0xa91afc og kompensationen 0xa8f6ec', () => {
    const p = { club: 'Fulham', name: 'David Collier', from: 'Sunderland', fee: '£25K', job: 'scout' };
    expect(t('cm.stBid', p)).toBe('Fulham transfer bid for David Collier');
    expect(t('cm.stBid.body', p)).toBe("Fulham have offered Sunderland's David Collier a job as scout.\n\nSunderland will be due £25K in compensation if the deal goes ahead");
    expect(t('cm.stBid.body0', p)).toBe("Fulham have offered Sunderland's David Collier a job as scout.");
  });
});
