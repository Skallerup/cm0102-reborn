// Egenskaberne som i originalen: databasen gemmer alle egenskaber som 1-20; de 18 "intrinsiske" vises ved spilstart
// gennem (10·v − CA)/2 og sub_544380, og manglende (0) udfyldes fra en skabelonspiller (playerInit.ts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { ATTRS } from '../src/game/attributes';
import { shownAtStart, storedFromShown } from '../src/game/playerInit';

describe('egenskaber som i originalen', () => {
  it('vist ved spilstart: Beckham (3.9.60) som på originalens skærm', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((x) => x.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const b = Object.values(g.players).find((p) => p.first === 'David' && p.last === 'Beckham')!;
    const a = (k: string) => b.attrs[ATTRS.indexOf(k as never)];
    // originalen (1.9.01): Crossing 20, Dribbling 13, Finishing 15, Heading 9, Long Shots 19, Passing 20, Tackling 12, Anticipation 15, Decisions 15, Off The Ball 14
    expect([a('crossing'), a('dribbling'), a('finishing'), a('heading'), a('longShots'), a('passing'), a('tackling'), a('anticipation'), a('decisions'), a('offTheBall')])
      .toEqual([20, 13, 15, 9, 19, 20, 12, 15, 15, 14]);
    // ingen huller i de egenskaber, originalen udfylder
    const holes = Object.values(g.players).filter((p) => p.attrs.slice(0, 36).some((v) => !v)).length;
    expect(holes).toBe(0);
    // forsvarere med 17+ i afslutning er sjældne (før rettelsen: ca. 8 %; udfyldningen giver nogle få)
    const cb = Object.values(g.players).filter((p) => p.pos[2] >= 15 && p.pos[6] < 15);
    expect(cb.filter((p) => p.attrs[ATTRS.indexOf('finishing')] >= 17).length / cb.length).toBeLessThan(0.06);
  }, 60_000);
  it('omregningen kan gå begge veje', () => {
    for (const ca of [60, 120, 180]) for (let v = 1; v <= 20; v++) {
      const s = shownAtStart(v, ca, true);
      expect(shownAtStart(storedFromShown(s, ca, true), ca, true)).toBe(s);
    }
  });
});
