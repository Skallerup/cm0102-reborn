// Computerklubbernes kampe gemmer en kompakt rapport (miniReport.ts), så den klassiske kampskærm kan vise dem efter slutfløjt.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { matchViewReport, packReport, unpackReport } from '../src/game/miniReport';

describe('kompakte rapporter for computerkampe', () => {
  it('gittermotorens og zonemotorens kampe har opstillinger, bænk, karakterer, begivenheder og statistik', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 4, mode: 'authentic' });
    const g = gs();
    for (let i = 0; i < 200 && g.date < '2001-08-20'; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    const ids = Object.keys(g.miniReports ?? {}).map(Number);
    expect(ids.length).toBeGreaterThan(20);
    const compsSeen = new Set<string>();
    const sizes: number[] = [];
    for (const id of ids) {
      const f = g.fixtures[id];
      expect(g.reports[id]).toBeUndefined();
      expect(g.comps[f.comp]).toBeDefined();   // ingen venskabskampe mellem computerklubber
      const rep = matchViewReport(g, id)!;
      for (const side of [0, 1] as const) {
        const mine = rep.players.filter((l) => l.team === side);
        // de engelske ligaer: 11 + bænken (Intertoto/kvalifikationen før sæsonen har klubber fra ikke-spilbare lande med tynde trupper)
        if (g.comps[f.comp].type !== 'league') continue;
        expect(mine.filter((l) => !l.sub).length).toBe(11);
        sizes.push(mine.length + rep.bench![side].length);
      }
      expect([rep.stats[0].goals, rep.stats[1].goals]).toEqual([f.result!.hg, f.result!.ag]);
      expect(rep.events.filter((e) => e.k === 'goal').map((e) => [e.m, e.t, e.p, ...(e.og ? [1] : [])])).toEqual(f.result!.scorers);
      expect(rep.players.some((l) => l.id === rep.mom)).toBe(true);
      for (const l of rep.players) expect(l.rating).toBeGreaterThanOrEqual(1);
      compsSeen.add(g.comps[f.comp].type === 'league' ? f.comp : 'cup');
      // pakket ud og ind igen giver det samme
      expect(packReport(rep, (pid) => rep.nums?.[pid])).toEqual(g.miniReports![id]);
    }
    // 11 + bænken (5 udskiftere i 2001/02; tynde trupper kan have færre)
    expect(sizes.filter((n) => n >= 16).length / sizes.length).toBeGreaterThan(0.9);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
    // Premier League (menneskets liga, gittermotoren) og de lavere rækker (zonemotoren)
    expect(compsSeen.size).toBeGreaterThanOrEqual(4);
    const any = g.miniReports![ids[0]];
    expect(unpackReport(any, ids[0], 1, 2).heat[0].length).toBe(15);
  });
});
