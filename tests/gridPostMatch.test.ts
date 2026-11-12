// Kamprapporten efter slutfløjt (runde 9c): originalens 0x6d1cc0/0x6d26b0/0x7172d0/0x6d3610/0x6d3de0 og dommerkarakteren 0x6d4a20
// (src/game/engine/grid/postMatch.ts) tal for tal mod oraklet. Fixturerne post-*.txt.gz er PM-linjerne fra en egen orakelbinær (match_trace.c
// + RECOMP_MATCH_TRACE_WATCH=-9,0,0,1, samme frø og dage som ls20/pen1): 20 Premier League-kampe og 18 kampe i turnering 352.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fullCheck, readPost, unitCheck } from '../scripts/lockstep-post';
import { adjustMorale7172d0, type PmPlayer } from '../src/game/engine/grid/postMatch';
import { repMemOf } from '../src/game/cmPlayerData';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, createLiveMatch, gridEngineOn, quickPlayUserMatch } from '../src/game/sim';

describe('kamprapporten efter slutfløjt (0x6d1cc0)', () => {
  for (const [file, n] of [['post-ls20', 20], ['post-pen1', 18]] as const) {
    it(`${file}: alle ${n} kampes rapport af oraklets inddata – hvert tal, moral, omdømme, manager, klub og dommer`, async () => {
      const ds = await readPost(`tests/fixtures/${file}.txt.gz`);
      expect(ds.length).toBe(n);
      for (const d of ds) {
        const r = unitCheck(d);
        expect(r.msgs, `kamp ${d.k}`).toEqual([]);
        expect(r.rands).toBeGreaterThan(70);
      }
    });
  }

  // HELE kampen i låsetrin og så rapporten af portens slutfløjt (adapterens kobling GP → MATCH_PLAYER)
  for (const [post, k, fix] of [['post-ls20', 7, 'lockstep-pl7'], ['post-ls20', 16, 'lockstep-pl16'], ['post-pen1', 17, 'lockstep-pen']] as const) {
    it(`${fix}: hele kampen og rapporten bagefter med originalens tal`, async () => {
      const d = (await readPost(`tests/fixtures/${post}.txt.gz`)).find((x) => x.k === k)!;
      const r = await fullCheck(d, `tests/fixtures/${fix}.txt.gz`, 0);
      expect(r.msgs).toEqual([]);
      expect(r.ok).toBe(true);
    }, 120_000);
  }

  it('0x7172d0: moralen klemmes 1..20 og løftes af en høj karakter', () => {
    const mp = { morale: 12, rating: 9000 } as PmPlayer;
    adjustMorale7172d0(mp, 0, true, () => 0);
    expect(mp.morale).toBe(15);                                                // trunc(9000·0,004 − 20,5) = 15
    const lo = { morale: 2, rating: 5000 } as PmPlayer;
    adjustMorale7172d0(lo, -5, true, (n) => (n < 0 ? n + 1 : 0));             // rand(11) = 0 > −3 → 2 + rand(−6) = −3 → 1
    expect(lo.morale).toBe(1);
  });

  it('omdømmet ·50 i spillerposten giver hukommelsens værdi igen', () => {
    for (let v = 1; v <= 10000; v++) expect(Math.trunc(repMemOf(v) * 50)).toBe(v);
  });

  it('spillets kampe med gittermotoren får rapporten (moral og omdømme overført)', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 4, mode: 'authentic' });
    const g = gs();
    g.options.engine = 'original';
    expect(gridEngineOn(g)).toBe(true);
    for (let i = 0; i < 400; i++) {
      const r = continueGame();
      if (r.match === undefined) continue;
      const f = g.fixtures[r.match];
      const sim = createLiveMatch(f);
      while (sim.step()) { /* tik */ }
      const rep0 = sim.report();
      expect(rep0.cmPost).toBeTruthy();
      quickPlayUserMatch();
      const rep = g.reports![f.id];
      expect(rep.cmPost).toBeTruthy();
      const ids = Object.keys(rep.cmPost!.players).map(Number);
      expect(ids.length).toBeGreaterThanOrEqual(22);
      for (const id of ids) {
        const v = rep.cmPost!.players[id];
        expect(v.morale).toBeGreaterThanOrEqual(1); expect(v.morale).toBeLessThanOrEqual(20);
        for (const x of v.rep) { expect(x).toBeGreaterThanOrEqual(1); expect(x).toBeLessThanOrEqual(10000); }
      }
      const p = g.players[ids[0]], v = rep.cmPost!.players[ids[0]];
      expect(p.morale).toBe(v.morale);
      expect(p.cmRepMem!.map((x) => Math.trunc(x * 50))).toEqual(v.rep);
      return;
    }
    throw new Error('ingen kamp');
  }, 300_000);
});
