// Forsæsonen i den originale database (ægte tilstand): player_setup.cfg's startskader (0x7a30c0 → add_injury 0x62d250) og computerens
// venskabskampe/turnéer (Friendly 0x5c27a0 – cmFriendly.ts). Oraklet (fit1, frø 1, 3.9.60): 58 skadede + 8 i genoptræning i Premier League
// ved spilstarten 14/7-2001, heraf ~50 fra startdagen (cfg-filen); 335 venskabskampe 16/7–2/8 (crowd1, turnering 72).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmFitRead } from '../src/game/cmFitnessGame';
import { CM_SETUP_INJURIES } from '../src/game/data/cmPreseason';

describe('forsæsonen (original DB, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const clubId = (short: string) => world.clubs.find((c) => c[2] === short)![0];
  createGame(world, { managerName: 'T', managerNation: eng, clubId: clubId('Wrexham'), activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();
  const pl = new Set(g.comps['CM7'].clubs);

  it('player_setup.cfg: Arsenals og Man Utds startskader som originalen (fit1: Pires 26, Kanu 11, Ljungberg 37, Jeffers 13; Barthez 35, G. Neville 15)', () => {
    const want: Record<string, number> = { Pires: 26, Kanu: 11, Ljungberg: 37, Jeffers: 13, Barthez: 35, Neville: 15 };
    const list = CM_SETUP_INJURIES['3.9.60'];
    for (const [last, t] of Object.entries(want)) {
      const p = Object.values(g.players).find((x) => x.last === last && (x.club === clubId('Arsenal') || x.club === clubId('Man Utd')) && (last !== 'Neville' || x.first === 'Gary'))!;
      expect(list.some(([id, tt]) => id === p.id && tt === t), last).toBe(true);
      expect(p.cmFit?.inj?.t, last).toBe(t);
    }
  });

  it('skadede i Premier League ved spilstart i originalens størrelsesorden (oraklet 58 + 8)', () => {
    const rd = cmFitRead(g);
    const n = Object.values(g.players).filter((p) => p.club && pl.has(p.club) && !p.regen && rd.injury(p)).length;
    expect(g.date).toBe('2001-07-14');
    expect(n).toBeGreaterThan(40);
    expect(n).toBeLessThan(100);
  });

  it('computerens klubber har venskabskampe og turnéer i forsæsonen (efter 14/7, før 18/8)', () => {
    const fr = Object.values(g.fixtures).filter((f) => f.comp === 'FRIENDLY');
    expect(fr.length).toBeGreaterThan(50);
    expect(fr.every((f) => f.date > '2001-07-14' && f.date < '2001-08-18')).toBe(true);
    // Premier League-klubber med venskabskampe – og en turné (3+ udekampe i samme fremmede land)
    const withFr = [...pl].filter((c) => fr.some((f) => f.home === c || f.away === c));
    expect(withFr.length).toBeGreaterThan(8);
    const tour = [...pl].some((c) => {
      const abroad = fr.filter((f) => f.away === c && g.clubs[f.home].nation !== eng).map((f) => g.clubs[f.home].nation);
      return abroad.some((n) => abroad.filter((x) => x === n).length >= 3);
    });
    expect(tour).toBe(true);
    // de hjemlige venter på at blive oprettet en uge før (0x5c2ae0)
    expect((g.cmFrPending ?? []).every((p) => p.d > '2001-07-20')).toBe(true);
  });

  it('Man Utd (computerens) har venskabskampe i forsæsonen med et andet frø', () => {
    let found = false;
    for (const seed of [2, 3, 4, 5, 6]) {
      createGame(world, { managerName: 'T', managerNation: eng, clubId: clubId('Wrexham'), activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
      const h = gs(), mu = clubId('Man Utd');
      if (Object.values(h.fixtures).some((f) => f.comp === 'FRIENDLY' && (f.home === mu || f.away === mu)) || (h.cmFrPending ?? []).some((p) => p.h === mu || p.a === mu)) { found = true; break; }
    }
    expect(found).toBe(true);
  });
}, 120_000);
