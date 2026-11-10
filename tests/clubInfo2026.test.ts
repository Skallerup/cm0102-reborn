// 2026/27-databasen: de rigtige cheftrænere (CLUB_INFO_2026) – datakilden har ingen trænere med.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { CLUB_INFO_2026 } from '../src/game/data/clubInfo2026';

describe('trænere og trøjeleverandører 2026/27', () => {
  it('Premier League-klubberne får deres rigtige trænere', () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    const chelsea = w.clubs.find((c) => c[1] === 'Chelsea')![0];
    createGame(w, { managerName: 'T', managerNation: eng, clubId: chelsea, activeNations: [eng], lang: 'en', masking: true, seed: 3 });
    const g = gs();
    const mgr = (name: string) => { const c = Object.values(g.clubs).find((x) => x.name === name)!; const s = g.staff[c.manager]; return `${s.first} ${s.last}`.trim(); };
    expect(mgr('Arsenal')).toBe('Mikel Arteta');
    expect(mgr('Manchester City')).toBe('Enzo Maresca');
    expect(mgr('Tottenham Hotspur')).toBe('Roberto De Zerbi');
    // nationaliteten fra Wikipedia (ikke klubbens land)
    const arsenal = Object.values(g.clubs).find((x) => x.name === 'Arsenal')!;
    expect(g.nations[g.staff[arsenal.manager].nation]?.name).toBe('Spain');
    // alle id'er findes i databasen
    const ids = new Set(w.clubs.map((c) => c[0]));
    expect(Object.keys(CLUB_INFO_2026).every((id) => ids.has(Number(id)))).toBe(true);
  });
});
