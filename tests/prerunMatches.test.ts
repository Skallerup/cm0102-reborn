// Forkørslens konkurrencekampe (cmPrerunMatches.ts): VM-kvalifikationen i Oceanien, Copa América og Europas kampe før spilstarten 14/7-2001.
// Oraklet (fit1): 390 = 20 gruppekampe + 2 finaleben, 407 = 18 gruppekampe, Intertoto 72 kampe (dag 173–187), CL Q1 9 kampe (dag 191).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

describe('forkørslens kampe (original DB, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const clubId = (short: string) => world.clubs.find((c) => c[2] === short)![0];
  const t0 = Date.now();
  createGame(world, { managerName: 'T', managerNation: eng, clubId: clubId('Wrexham'), activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const ms = Date.now() - t0;
  const g = gs();
  const res = g.intl!.results;

  it('spilstart 14/7-2001 og ingen fyldspillere i spillet bagefter', () => {
    expect(g.date).toBe('2001-07-14');
    expect(Object.keys(g.players).every((k) => +k < 30_000_000)).toBe(true);
    console.info(`nyt spil ${ms} ms; Oceanien ${res.filter((r) => r.kind === 'wcq').length}, Copa ${res.filter((r) => r.kind === 'copa').length}`);
    expect(ms).toBeLessThan(120_000);
  });

  it('VM-kvalifikation, Oceanien: 20 gruppekampe og dobbeltkampen (dag 93–114, 170 og 174)', () => {
    const q = g.intl!.ofcq!;
    expect(q).toBeTruthy();
    expect(q.groups.map((x) => x.length)).toEqual([5, 5]);
    const w = res.filter((r) => r.kind === 'wcq');
    expect(w.length).toBe(22);
    expect(w.filter((r) => !r.stage).length + w.filter((r) => r.stage === 'G').length).toBe(20);
    const dates = w.map((r) => r.date).sort();
    expect(dates[0]).toBe('2001-04-04');                      // dag 93
    expect(dates[dates.length - 1]).toBe('2001-06-24');       // dag 174
    expect(Object.values(q.table).reduce((s, r) => s + r.p, 0)).toBe(40);
    expect(q.winner).toBeDefined();
    expect(w.some((r) => r.date === '2001-06-20')).toBe(true); // dag 170
  });

  it('Copa América: 18 gruppekampe før starten, resten venter (G3 den 16/7)', () => {
    const t = g.intl!.cont!.find((x) => x.name === 'copa' && x.year === 2001)!;
    expect(t).toBeTruthy();
    const c = res.filter((r) => r.kind === 'copa');
    expect(c.length).toBe(t.groups.length === 4 ? 18 : Math.min(18, t.groups.length * 6));
    expect(c.every((r) => r.date >= '2001-07-04' && r.date <= '2001-07-13')).toBe(true);
    expect(t.played!.length).toBe(c.length);
    if (t.groups.length === 4) expect(t.stage).toBe('G3');
  });

  it('Intertoto Cup og CL-kvalifikationen er spillet i forkørslen (72 + 9 kampe)', () => {
    const f = Object.values(g.fixtures);
    const uic = f.filter((x) => x.comp === 'UIC' && x.result);
    const cl = f.filter((x) => x.comp === 'CL' && x.result);
    expect(uic.length).toBeGreaterThan(40);
    expect(uic.every((x) => x.date < '2001-07-14')).toBe(true);
    expect(cl.length).toBeGreaterThan(0);
    expect(cl.every((x) => x.date === '2001-07-11')).toBe(true);
    expect(g.cmEuroCatchUp).toBe(false);
    expect(f.some((x) => ['UIC', 'CL'].includes(x.comp) && !x.result && x.date < '2001-07-14')).toBe(false);
  });
});
