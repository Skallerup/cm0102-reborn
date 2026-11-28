// Spiltilstanden "Ægte CM 01/02": kun originalens funktioner – uanset database.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch, userTactic } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { maxSubs } from '../src/game/rules';

describe('ægte CM 01/02', () => {
  it('ingen pressemøder, holdsnakke, træningslejre eller fanstemning – men Discipline Player virker', () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford FC')![0], activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    expect(g.options.mode).toBe('authentic');
    // 2026/27-databasen: nutidens regler (5 udskiftninger) – også i ægte tilstand
    expect(maxSubs()).toBe(5);
    for (let i = 0; i < 70; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    const keys = g.news.map((n) => n.key);
    expect(keys.some((k) => k.startsWith('press.invite'))).toBe(false);
    expect(keys.some((k) => k.startsWith('fans.mood'))).toBe(false);
    // andre klubbers handler som enkeltnyheder (CM 01/02: "Liverpool seal Perry deal") – ikke ugens overblik
    expect(keys.some((k) => k.startsWith('transfer.o'))).toBe(true);
    expect(keys.some((k) => k.startsWith('transfer.digest'))).toBe(false);
    expect(applyAction({ t: 'teamTalk', kind: 'praise' })).toBe('authentic');
    expect(applyAction({ t: 'camp', dest: 'home', start: g.date })).toBe('authentic');
    const p = squad(g.userClub)[3];
    expect(applyAction({ t: 'interact', pid: p.id, kind: 'praise' })).toBe('authentic');
    expect(applyAction({ t: 'interact', pid: p.id, kind: 'warning', reason: 'none' })).not.toBe('authentic');
  }, 120_000);

  it('ingen er udtaget fra start (som i originalen) – assistenten udtager holdet, når man ikke selv gør det', () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    const cid = w.clubs.find((c) => c[1] === 'Brentford FC')![0];
    createGame(w, { managerName: 'T', managerNation: eng, clubId: cid, activeNations: [eng], lang: 'en', masking: true, seed: 6, mode: 'authentic' });
    const g = gs();
    expect(g.tactic!.lineup.filter(Boolean)).toHaveLength(0);
    expect(g.tactic!.bench).toHaveLength(0);
    const t = userTactic();
    expect(t.lineup.filter(Boolean)).toHaveLength(11);
    expect(t.bench.length).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < 70; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
  }, 120_000);
  // (28/11) forkørslen (0x5cc850) spiller menneskets kampe før startdatoen (England først: start 11/7; Brøndbys venskabskampe 5/7 og 9/7) –
  // assistentens elleve gælder kun kampen, managerens udtagelse er stadig tom ved start (sim.ts prerunPlay). Før: 11 udtaget (e2e i CI)
  it('kampe i forkørslen udtager ikke holdet (2026/27, England + Danmark, Brøndby)', () => {
    const w0 = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const w = { ...w0, cmRaw: JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')).cmRaw } as WorldData;
    const nat = (n: string) => w.nations.findIndex((x) => x.name === n);
    const cid = w.clubs.find((c) => String(c[1]).startsWith('Brøndby'))![0] as number;
    createGame(w, { managerName: 'T', managerNation: nat('Denmark'), clubId: cid, activeNations: [nat('England'), nat('Denmark')], lang: 'en', masking: true, seed: 101895241, mode: 'authentic' });
    const g = gs();
    expect(g.date).toBe('2026-07-11');
    const before = Object.values(g.fixtures).filter((f) => (f.home === cid || f.away === cid) && f.date < g.date);
    expect(before.length).toBeGreaterThan(0);
    expect(before.every((f) => !!f.result)).toBe(true);
    expect(g.tactic!.lineup.filter(Boolean)).toHaveLength(0);
    expect(g.tactic!.bench).toHaveLength(0);
  }, 120_000);
});
