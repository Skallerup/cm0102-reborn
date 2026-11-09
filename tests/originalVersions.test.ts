// Valget af officiel 01/02-database (3.9.60 / 3.9.65 / 3.9.68): hver udgave bygges præcis som originalen, med
// databasens egne managere (club.dat 207 → staff.dat).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const CASES = [['world-original.json', '3.9.60', false], ['world-original-3965.json', '3.9.65', false], ['world-original-3968.json', '3.9.68', true]] as const;

describe('de officielle 01/02-databaser', () => {
  for (const [file, ver, ferdinandAtMU] of CASES) {
    it(`${ver}: rigtige managere og trupper`, () => {
      const w = JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as WorldData;
      expect(w.season).toBe(2001);
      const eng = w.nations.findIndex((n) => n.name === 'England');
      const id = (name: string) => w.clubs.find((c) => c[1] === name)![0];
      createGame(w, { managerName: 'T', managerNation: eng, clubId: id('Arsenal'), activeNations: [eng], lang: 'en', masking: true, seed: 2, mode: 'authentic' });
      const g = gs();
      expect(g.dbVersion).toBe(ver);
      const mgr = (c: number) => { const s = g.staff[g.clubs[c].manager]; return `${s.first} ${s.last}`; };
      expect(mgr(id('Manchester United'))).toMatch(/Ferguson/);
      expect(mgr(id('Liverpool'))).toMatch(/Houllier/);
      expect(Object.values(g.players).some((p) => p.club === id('Manchester United') && p.last === 'Ferdinand')).toBe(ferdinandAtMU);
    });
  }
});
