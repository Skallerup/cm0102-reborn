// Tilfældigt potentiale som i CM 01/02 (playerInit.ts = sub_535a80): PA -2 i databasen = oftest 120-200 (1 ud af 10:
// 160-200, 1 ud af 20 trækkes op til 49 fra), PA -1 = oftest 80-160 – trukket på ny i hvert nyt spil.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { initialisePA, makeRand } from '../src/game/playerInit';
import { Rng } from '../src/game/rng';

describe('tilfældigt potentiale (PA -1/-2)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const samba = (seed: number) => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs[0][0], activeNations: [eng], lang: 'da', masking: true, seed });
    return Object.values(gs().players).find((p) => p.first === 'Cherno' && p.last === 'Samba')!.pa;
  };
  it('Cherno Samba (PA -2) får en ny PA i hvert spil', () => {
    const pas = [1, 2, 3].map(samba);
    for (const pa of pas) { expect(pa).toBeGreaterThanOrEqual(71); expect(pa).toBeLessThanOrEqual(200); }
    expect(new Set(pas).size).toBeGreaterThan(1);
  }, 60_000);
  it('originalens fordeling: -2 i snit ~155, -1 ~120, gyldig PA beholdes for de fleste', () => {
    const r = new Rng(5); const rand = makeRand(() => r.next());
    const avg = (pa: number) => { let s = 0; for (let i = 0; i < 4000; i++) s += initialisePA(pa, 50, 17, 2, rand); return s / 4000; };
    expect(avg(-2)).toBeGreaterThan(148); expect(avg(-2)).toBeLessThan(162);
    expect(avg(-1)).toBeGreaterThan(112); expect(avg(-1)).toBeLessThan(128);
    let kept = 0; for (let i = 0; i < 4000; i++) if (initialisePA(150, 120, 28, 2, rand) === 150) kept++;
    expect(kept / 4000).toBeGreaterThan(0.98);
  });
});
