// 2026/27-databasen: rækkerne som i virkeligheden (scripts/data/divisions-2026.json, rettet i byggescriptet – ikke i world.json).
// October 2026 Data Update havde fx 16 klubber i dansk 1. division (B.93, Middelfart, Næstved og FC Roskilde fra 2. division).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const FIX = JSON.parse(readFileSync('scripts/data/divisions-2026.json', 'utf8')).leagues as Record<string, { size: number }>;
const league = (name: string) => world.leagues.find((l) => l.name === name && !l.hidden)!;
const clubsIn = (name: string) => world.clubs.filter((c) => c[4] === league(name).id).map((c) => c[1] as string);

describe('rækkerne 2026/27', () => {
  it('hver rettet liga har virkelighedens antal klubber', () => {
    for (const [name, f] of Object.entries(FIX)) expect(clubsIn(name).length, name).toBe(f.size);
  });

  it('Danmark: 12 + 12 + 12, Næstved og B.93 i 2. division, AB og Vendsyssel i 1. division', () => {
    expect(clubsIn('Danish Second Division')).toEqual(expect.arrayContaining(['Næstved Boldklub', 'Boldklubben af 1893', 'Middelfart Boldklub', 'FC Roskilde']));
    expect(clubsIn('Danish First Division')).toEqual(expect.arrayContaining(['Akademisk Boldklub', 'Vendsyssel FF', 'Vejle Boldklub', 'FC Fredericia']));
    expect(clubsIn('Danish First Division')).not.toContain('Næstved Boldklub');
    const [d1, d2, d3] = ['Danish Premier Division', 'Danish First Division', 'Danish Second Division'].map(league);
    expect([d1.tier, d2.tier, d3.tier]).toEqual([1, 2, 3]);
    expect(world.rules[d2.id]).toMatchObject({ rounds: 3, promoted: 2, relegated: 2, above: d1.id, below: d3.id });
    expect(world.rules[d3.id]).toMatchObject({ rounds: 3, promoted: 2, above: d2.id });
  });

  it('kampprogrammet for 12-klubbers ligaerne: 33 runder, alle møder alle tre gange', () => {
    const dk = world.nations.findIndex((n) => n.name === 'Denmark');
    const club = world.clubs.find((c) => c[1] === 'Næstved Boldklub')![0] as number;
    createGame(world, { managerName: 'T', managerNation: dk, clubId: club, activeNations: [dk], lang: 'da', masking: true, seed: 1 });
    const g = gs();
    for (const name of ['Danish First Division', 'Danish Second Division']) {
      const id = league(name).id;
      const comp = g.comps[id];
      expect(comp.clubs.length, name).toBe(12);
      const fx = Object.values(g.fixtures).filter((f) => f.comp === id);
      expect(fx.length, name).toBe((12 * 11 / 2) * 3);
      for (const c of comp.clubs) expect(fx.filter((f) => f.home === c || f.away === c).length).toBe(33);
    }
    expect(g.clubs[club].league).toBe(league('Danish Second Division').id);
  });
});
