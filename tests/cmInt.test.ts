// Player.cmInt: originalens interne egenskaber (spillerposten +0x1e … +0x43) – ved spilstart af sub_535a80/sub_538ec0/sub_538bc0, og originalens
// invariant vist = display(CA + 2·intern) (playerInit.ts shownFromInternal, cmTraining.ts cmIntSync). Mod originalens poster: scripts/cmint-start-check.ts.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { shownFromInternal } from '../src/game/playerInit';
import { cmIntSync } from '../src/game/cmTraining';

describe('Player.cmInt', () => {
  it('sat ved spilstart (original database) og de viste følger CA', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((x) => x.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const withInt = Object.values(g.players).filter((p) => p.cmInt);
    expect(withInt.length).toBeGreaterThan(1000);
    for (const p of withInt.slice(0, 500)) {
      expect(p.cmInt!.length).toBe(18);
      for (const v of p.cmInt!) expect(v).toBeGreaterThanOrEqual(-128), expect(v).toBeLessThanOrEqual(127);
      const a = p.attrs.slice();
      shownFromInternal(a, p.cmInt!, p.ca, p.pos[0]);
      expect(a).toEqual(p.attrs);                                    // spilstartens viste = display(CA + 2·intern)
    }
    const b = withInt.find((p) => p.ca < 190)!;
    const before = b.attrs.slice();
    b.ca += 10;
    cmIntSync(g, b);
    expect(b.attrs.some((v, i) => v > before[i])).toBe(true);
    expect(b.attrs.every((v, i) => v >= before[i])).toBe(true);
  }, 60_000);
  it('den moderne database får ingen cmInt', () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    createGame(w, { managerName: 'T', managerNation: 0, clubId: w.clubs[0][0], activeNations: [w.clubs[0][3]], lang: 'en', masking: true, seed: 3 });
    expect(Object.values(gs().players).some((p) => p.cmInt)).toBe(false);
  }, 60_000);
});
