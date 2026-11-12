// Runde 10C: gittermotorens kampstatistik i GridSim (originalens MATCH_PLAYER-tællere og holdblokken; besiddelse/varmekort/momentum som
// visning af motorens tilstand) og skuddet uden keeper på banen (sub_6ce110's første spiller på banen – før "reading 'x'" i 0x703f4e).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, createLiveMatch, quickPlayUserMatch } from '../src/game/sim';
import type { GP } from '../src/game/engine/grid/gridMatch';

describe('gittermotorens kampstatistik (GridSim)', () => {
  it('spillernes og holdenes tællere, besiddelse, varmekort og momentum – og et hold uden keeper kan stadig få skud imod sig', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 4, mode: 'authentic' });
    const g = gs();
    g.options.engine = 'original';
    let done = 0;
    for (let i = 0; i < 400 && done < 2; i++) {
      const r = continueGame();
      if (r.match === undefined) continue;
      const f = g.fixtures[r.match];
      const me = f.home === g.userClub ? 0 : 1;
      const sim = createLiveMatch(f);
      // anden kamp: menneskets keeper forlader banen efter 10 minutter uden udskiftning (som udvist/båret ud, og mennesket gør intet)
      let gone = done === 0;
      while (sim.step()) {
        if (!gone && sim.minute >= 10) {
          const k = (sim as unknown as { g: { m: { gp: GP[] } } }).g.m.gp.find((q) => q.side === me && q.active && q.isKeeper)!;
          k.active = false; k.slot = -3; gone = true;
        }
      }
      const rep = sim.report();
      for (const t of [0, 1] as const) {
        const s = rep.stats[t], lines = rep.players.filter((l) => l.team === t);
        const sum = (k: 'passes' | 'passesOk' | 'tckA' | 'tackles' | 'hea' | 'heaW') => lines.reduce((a, l) => a + (l[k] ?? 0), 0);
        expect(s.passes).toBeGreaterThan(100);
        expect(s.tackles).toBeGreaterThan(0);
        expect(s.headers).toBeGreaterThan(0);
        expect(s.throwIns).toBeGreaterThan(0);
        expect(sum('passes')).toBe(s.passes);
        expect(sum('passesOk')).toBe(s.passesCompleted);
        expect(sum('tckA')).toBe(s.tackles);
        expect(sum('tackles')).toBe(s.tacklesWon);
        expect(sum('hea')).toBe(s.headers);
        expect(sum('heaW')).toBe(s.headersWon);
        expect(rep.heat[t].reduce((a, v) => a + v, 0)).toBeGreaterThan(100);
      }
      expect(rep.stats[0].possession + rep.stats[1].possession).toBe(100);
      expect(rep.momentum.some((v) => v !== 0)).toBe(true);
      expect(rep.zoneControl.some((v) => v !== 0.5)).toBe(true);
      expect(sim.possLog?.length).toBe(sim.moment);
      quickPlayUserMatch();
      done++;
    }
    expect(done).toBe(2);
  }, 300_000);
});
