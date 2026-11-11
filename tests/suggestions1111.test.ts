// Brugerønsker 11/11-2026: #11 (Korea stod under Europa) og #12 (Serbiens mester var ude af Europa i første sæson).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { regionOf } from '../src/game/leagues';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

describe('brugerønsker 11/11', () => {
  it('#11: landene hører til deres fodboldforbunds verdensdel', () => {
    expect(regionOf('South Korea')).toBe('asia');
    expect(regionOf('North Korea')).toBe('asia');
    expect(regionOf('Ghana')).toBe('africa');
    expect(regionOf('New Zealand')).toBe('asia'); // OFC regnes med Asien i spillet
    expect(regionOf('Surinam')).toBe('northAmerica');
    expect(regionOf('Israel')).toBe('europe');
    expect(regionOf('Kazakhstan')).toBe('europe');
    // alle lande i begge databaser er placeret (ukendte faldt før tilbage til Europa)
    for (const f of ['public/data/world.json', 'public/data/world-original.json']) {
      const w = JSON.parse(readFileSync(f, 'utf8')) as WorldData;
      const odd = w.nations.map((n) => n.name).filter((n) => regionOf(n) === 'europe' && /Korea|Japan|China|Nigeria|Ghana|Brazil|Mexico|Australia|Iraq|Thailand/.test(n));
      expect(odd).toEqual([]);
    }
  });
  it('#12: klubber, der skæres fra en europæisk turnering, ryger et trin ned (Røde Stjerne i Europa League 2026/27)', () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[3] === eng)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1 });
    const g = gs();
    const rs = w.clubs.find((c) => c[1] === 'Red Star Belgrade')![0];
    expect(['CL', 'UEFA'].some((k) => g.comps[k]?.clubs.includes(rs))).toBe(true);
    for (const k of ['CL', 'UEFA', 'UECL']) expect(g.comps[k].clubs.length).toBe(36);
  }, 120_000);
});
