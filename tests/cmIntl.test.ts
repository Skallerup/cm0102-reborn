// Landskampkalenderen i ægte tilstand (cmIntl.ts): originalens datotabel 0x5ca4f0/0x5cc510, EM 2004-kvalifikationen (0x57dab0/0x57d190) og
// venskabskampene 0x5cbdf0 med U21-kampene dagen før (0x7e6720). Oraklet: crowd1 (frø 1, 3.9.60) – scripts/cm-intl-check.ts.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cmIntlDates, EURO04_Q_DATES, EURO04_Q_GROUPS, euroQualDates, euroQualDraw, euroQualDrawDate, isEuroCampaign, roundRobin } from '../src/game/cmIntl';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';

/** oraklets datoer med venskabskampe mellem landshold (crowd1, turnering 72) */
const ORACLE_DATES = ['2001-07-22', '2001-07-29', '2001-08-15', '2001-08-19', '2001-09-01', '2001-09-05', '2001-09-12', '2001-09-15', '2001-09-30',
  '2001-10-03', '2001-10-06', '2001-10-10', '2001-10-20', '2001-10-27', '2001-11-14', '2001-11-18', '2001-12-01'];

describe('landskampdatoerne (0x5ca4f0/0x5cc510)', () => {
  it('alle oraklets venskabsdatoer i 2001/02 står i tabellen', () => {
    const d01 = new Set(cmIntlDates(2001).map((x) => x.d));
    for (const d of ORACLE_DATES) expect(d01.has(d), d).toBe(true);
    const d02 = new Set(cmIntlDates(2002).map((x) => x.d));
    expect(d02.has('2002-03-23')).toBe(true);
    expect(d02.has('2002-04-24')).toBe(true);
  });
  it('cyklussen: 110 poster, 2001-tabellen dækker 2001–2004', () => {
    const t = cmIntlDates(2001);
    expect(t.length).toBe(110);
    expect(t[0].d.slice(0, 4)).toBe('2001');
    expect(t[t.length - 1].d.slice(0, 4)).toBe('2004');
    // EM-kvalifikationens datoer (turnering 143) = create_schedule 0x57d190's første runder
    expect(cmIntlDates(2002).filter((x) => x.comp === 143).map((x) => x.d).slice(0, 2)).toEqual(['2002-08-31', '2002-10-05']);
  });
});

describe('EM-kvalifikationens kampagner (EuroChampQual 0x57ce10)', () => {
  it('rundedatoerne 0x57d190 giver 2002-kampagnens kendte datoer, og 2026-kampagnen følger samme regler', () => {
    expect(EURO04_Q_DATES).toEqual(['2002-08-31', '2002-09-04', '2002-10-05', '2002-10-09', '2003-03-22', '2003-03-26', '2003-06-04', '2003-08-30', '2003-09-03', '2003-10-04']);
    expect(euroQualDates(2026)[0] < euroQualDates(2026)[9]).toBe(true);
    expect(euroQualDates(2026).map((d) => new Date(d).getUTCDay())).toEqual([6, 3, 6, 3, 6, 3, 3, 6, 3, 6]);
  });
  it('lodtrækningen 0x57e8f0: lørdagen nærmest 10/3 i kampagneåret; kampagnerne hvert fjerde år fra 2002', () => {
    expect(euroQualDrawDate(2002)).toBe('2002-03-09');
    expect(euroQualDrawDate(2026)).toBe('2026-03-07');
    expect([2001, 2002, 2006, 2026, 2027, 2030].map(isEuroCampaign)).toEqual([false, true, true, true, false, true]);
  });
  it('draw_groups 0x57dab0 (år ≠ 2002): én vært → 48 af 50 i 9 grupper (6 i gruppe 2, 4 og 7), to værter → 49', () => {
    let k = 0;
    const rand = (n: number) => (k = (k * 1103515245 + 12345) >>> 0) % n;
    const g1 = euroQualDraw(Array.from({ length: 50 }, (_, i) => i), 1, rand);
    expect(g1.map((x) => x.length)).toEqual([5, 6, 5, 6, 5, 5, 6, 5, 5]);
    expect(g1.flat().sort((a, b) => a - b)).toEqual(Array.from({ length: 48 }, (_, i) => i));
    // pot 1 = de ni stærkeste, én i hver gruppe
    expect(g1.map((x) => x[0]).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(euroQualDraw(Array.from({ length: 49 }, (_, i) => i), 2, rand).map((x) => x.length)).toEqual([5, 6, 5, 6, 5, 5, 6, 5, 6]);
  });
});

describe('EM 2004-kvalifikationen (2002-kampagnen)', () => {
  it('9 faste grupper med 49 lande og 10 runder', () => {
    expect(EURO04_Q_GROUPS.flat().length).toBe(49);
    expect(EURO04_Q_GROUPS.map((x) => x.length)).toEqual([5, 6, 5, 6, 5, 5, 6, 5, 6]);
    expect(EURO04_Q_DATES.length).toBe(10);
  });
  it('runde-robin: hvert par to gange (hjemme og ude) på 10 runder', () => {
    for (const n of [5, 6]) {
      const t = Array.from({ length: n }, (_, i) => i);
      const r = roundRobin(t);
      expect(r.length).toBe(10);
      const pairs = r.flat().map(([a, b]) => `${a}-${b}`);
      expect(new Set(pairs).size).toBe(n * (n - 1));
      for (const round of r) expect(new Set(round.flat()).size).toBe(round.length * 2);
    }
  });
});

describe('venskabskampe og U21 i ægte tilstand (original DB)', () => {
  it('1/9-2001: europæiske venskabskampe og U21-kampe dagen før som oraklet (20/20); ingen af spillets egne vinduer', () => {
    const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = world.nations.findIndex((x) => x.name === 'England');
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[2] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    // forkørslen har lagt 22/7-kampene (lagt 12 dage før, 10/7)
    expect(g.intl!.cm!.fix.some((f) => f.d === '2001-07-22')).toBe(true);
    while (g.date < '2001-09-02') { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    const res = g.intl!.results;
    const a = res.filter((r) => r.kind === 'friendly' && r.date === '2001-09-01');
    const u = res.filter((r) => r.kind === 'u21' && r.date === '2001-08-31');
    expect(a.length).toBeGreaterThanOrEqual(12);
    expect(a.length).toBeLessThanOrEqual(26);
    expect(u.length).toBeGreaterThan(0);
    // U21-kampene er de samme par dagen før
    for (const x of u) expect(a.some((y) => y.home === x.home && y.away === x.away)).toBe(true);
    // ingen landskampe på spillets gamle vinduesdato 5/9 for de lande, der spillede 1/9 (±4 dage optaget)
    const sep5 = res.filter((r) => r.kind === 'friendly' && r.date === '2001-09-05');
    const sep1 = new Set(a.flatMap((r) => [r.home, r.away]));
    for (const r of sep5) { expect(sep1.has(r.home)).toBe(false); expect(sep1.has(r.away)).toBe(false); }
    // ingen VM 2002-kvalifikation i 2001 (originalens zoner begynder med 2004-kampagnen)
    expect(res.some((r) => r.kind === 'wcq' && r.date > '2001-07-14')).toBe(false);
    expect(g.intl!.qual).toBeUndefined();
  }, 600_000);
});
