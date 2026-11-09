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
    // originalen (1.9.01) – alle 13 viste tekniske egenskaber, efter afbalanceringen sub_538ec0/sub_538bc0:
    expect([a('crossing'), a('dribbling'), a('finishing'), a('heading'), a('longShots'), a('passing'), a('tackling'), a('anticipation'), a('decisions'), a('offTheBall'), a('marking'), a('creativity'), a('positioning')])
      .toEqual([20, 13, 15, 9, 19, 20, 12, 15, 15, 14, 12, 19, 12]);
    // målmanden Seaman mangler Crossing → originalens løkke sænker hans gyldige markspiller-egenskaber med 10:
    // originalen viser Technique 8, Acceleration 2, Teamwork 8, Work Rate 5, Flair 1, Off The Ball 4, Creativity 4 (aflæst 9/11-2026)
    const sm = Object.values(g.players).find((p) => p.first === 'David' && p.last === 'Seaman')!;
    const sa = (k: string) => sm.attrs[ATTRS.indexOf(k as never)];
    expect([sa('technique'), sa('acceleration'), sa('teamwork'), sa('workRate'), sa('flair'), sa('offTheBall'), sa('creativity')]).toEqual([8, 2, 8, 5, 1, 4, 4]);
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
  it('3.9.68: Ronny Johnsen (Aston Villa, CA 165) – kæden giver Crossing 12, Long Shots 11, Dribbling 9 (Bosman-projektet)', () => {
    const w = JSON.parse(readFileSync('public/data/world-original-3968.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((x) => x.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 2, mode: 'authentic' });
    const j = Object.values(gs().players).find((p) => p.first === 'Ronny' && p.last === 'Johnsen')!;
    const a = (k: string) => j.attrs[ATTRS.indexOf(k as never)];
    expect(j.ca).toBe(165);
    expect([a('crossing'), a('longShots'), a('dribbling')]).toEqual([12, 11, 9]);
  }, 60_000);
});
