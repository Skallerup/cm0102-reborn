// Stab fra databasen (ikke-spillerposten, bekræftet i originalens Non-Playing Staff for Man Utd 3.9.60, 9/11-2026)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

describe('stab fra databasen', () => {
  it('Man Utd har Ferguson, Meulensteen og fysioterapeuterne med deres egne egenskaber', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    const mu = w.clubs.find((c) => c[1] === 'Manchester United')![0];
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3 });
    const g = gs();
    const st = Object.values(g.staff).filter((s) => s.club === mu);
    const by = (last: string) => st.find((s) => s.last === last || s.last.endsWith(last))!;
    expect(g.staff[g.clubs[mu].manager].last).toBe('Sir Alex Ferguson');
    // databasen: Discipline 19, Motivating 20, Tactical Knowledge 14
    expect(by('Ferguson').attrs).toMatchObject({ discipline: 19, motivating: 20, tactics: 14 });
    // Meulensteen: Coaching 20, Judging Player Potential 19, Discipline 18, Tactical Knowledge 20 (som originalens skærm)
    expect(by('Meulensteen')).toMatchObject({ role: 'coach', attrs: { coaching: 20, judgingPotential: 19, discipline: 18, tactics: 20 } });
    expect(by('Hough')).toMatchObject({ role: 'physio', attrs: { physio: 18 } });
    expect(by('Ryan').role).toBe('assistant');
    expect(st.filter((s) => s.role === 'scout').length).toBeGreaterThanOrEqual(4);
  }, 60_000);
});
