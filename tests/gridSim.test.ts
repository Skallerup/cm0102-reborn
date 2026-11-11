// Gittermotoren (originalens kampmotor) i spillet bag flaget: original database + ægte tilstand + options.engine = 'original'.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, createLiveMatch, gridEngineOn, quickPlayUserMatch } from '../src/game/sim';

describe('gittermotoren i spillet', () => {
  it('live-kampen og hurtigkampene kører med originalens motor, og rapporten har mål og begivenheder', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 4, mode: 'authentic' });
    const g = gs();
    g.options.engine = 'original';
    expect(gridEngineOn(g)).toBe(true);
    let live = 0;
    for (let i = 0; i < 400 && live < 3; i++) {
      const r = continueGame();
      if (r.match !== undefined) {
        const f = g.fixtures[r.match];
        const sim = createLiveMatch(f);
        expect(sim.engine).toBe('original');
        let steps = 0; while (sim.step()) steps++;
        expect(steps).toBeGreaterThan(500);
        const rep = sim.report();
        expect(rep.engine).toBe('original');
        expect(rep.events.filter((e) => e.k === 'goal').length).toBe(rep.stats[0].goals + rep.stats[1].goals);
        expect(rep.players.length).toBeGreaterThanOrEqual(22);
        quickPlayUserMatch();
        live++;
      }
    }
    expect(live).toBe(3);
    const played = Object.values(g.reports ?? {}).filter((r) => r.engine === 'original');
    expect(played.length).toBeGreaterThan(0);
  }, 300_000);
});
