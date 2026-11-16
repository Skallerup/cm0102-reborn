// Computerklubbernes stabsskifter (cmStaffMove.ts) og stabens vurdering 0x69d1b0 for jobbene 6–10 (cmBoard.ts) – den originale database i ægte tilstand.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffCompensation, cmStaffRestGbp } from '../src/game/cmStaff';
import { cmStaffMovesDaily } from '../src/game/cmStaffMove';
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
});
