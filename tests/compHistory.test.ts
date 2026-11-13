// Turneringens historik (History-skærmen i klassisk): rekorderne regnes af de spillede kampe og gemmes pr. sæson.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compFixtures, compSeasonRec, initialName, storeCompRecords } from '../src/game/compHistory';
import { createGame, type WorldData } from '../src/game/newgame';
import { quickPlayUserMatch, runUntil } from '../src/game/sim';
import { gs } from '../src/game/state';

describe('turneringens historik', () => {
  it('regner rekorder af kampene og gemmer sæsonen', async () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford FC')![0], activeNations: [eng], lang: 'en', masking: true, seed: 5 });
    const g = gs();
    for (let i = 0; i < 40; i++) {
      const r = await runUntil({ untilMatch: true, maxDays: 14 });
      if (r.match !== undefined) quickPlayUserMatch();
    }
    const comp = g.comps[g.clubs[g.userClub].league];
    const fx = compFixtures(comp);
    expect(fx.length).toBeGreaterThan(40);
    const r = compSeasonRec(comp);
    // holdene: flest point/mål fra kampene
    const pts = new Map<number, number>(), gf = new Map<number, number>();
    for (const f of fx) {
      const x = f.result!;
      pts.set(f.home, (pts.get(f.home) ?? 0) + (x.hg > x.ag ? 3 : x.hg === x.ag ? 1 : 0)); pts.set(f.away, (pts.get(f.away) ?? 0) + (x.ag > x.hg ? 3 : x.hg === x.ag ? 1 : 0));
      gf.set(f.home, (gf.get(f.home) ?? 0) + x.hg); gf.set(f.away, (gf.get(f.away) ?? 0) + x.ag);
    }
    expect(r.pts!.n).toBe(Math.max(...pts.values()));
    expect(r.gf!.n).toBe(Math.max(...gf.values()));
    // største sejr og mest målrige kamp
    expect(Math.abs(r.bigWin!.hg - r.bigWin!.ag)).toBe(Math.max(...fx.map((f) => Math.abs(f.result!.hg - f.result!.ag))));
    expect(r.hiScore!.hg + r.hiScore!.ag).toBe(Math.max(...fx.map((f) => f.result!.hg + f.result!.ag)));
    // tilskuere, serier og topscorer
    const atts = fx.map((f) => f.result!.att ?? 0).filter(Boolean);
    expect(r.hiAtt!.att).toBe(Math.max(...atts));
    expect(r.loAtt!.att).toBe(Math.min(...atts));
    expect(r.won!.n).toBeGreaterThanOrEqual(1);
    expect(r.unbeaten!.n).toBeGreaterThanOrEqual(r.won!.n);
    expect(r.winless!.n).toBeGreaterThanOrEqual(r.lost!.n);
    const goals = new Map<number, number>();
    for (const f of fx) for (const s of f.result!.scorers) if (s[3] !== 1) goals.set(s[2], (goals.get(s[2]) ?? 0) + 1);
    expect(r.top!.n).toBe(Math.max(...goals.values()));
    expect(r.matchGoals!.n).toBeGreaterThanOrEqual(1);
    // gemmes pr. sæson
    storeCompRecords();
    expect(g.compRecs![comp.id][g.season].pts!.n).toBe(r.pts!.n);
    expect(initialName('Ryan Giggs')).toBe('R.Giggs');
  }, 240_000);
});
