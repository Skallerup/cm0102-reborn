// (kalender runde 10C) Europas turneringer i originalens 2001/02-format: rundetabellerne (unicorn-kørsel af create_round_table) og datoerne/koderne
// mod oraklets fixtures_2001/2002.tmp (crowd1), og en hel sæson i et nyt spil med den originale database i ægte tilstand.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { fixtureCodesOf } from '../src/game/engine/grid/gameInputs';
import type { Fixture } from '../src/game/types';

/** oraklets kampdage (crowd1, 3.9.60): turnering → [dato, antal kampe] */
const ORACLE_CL = '2001-07-11:9 2001-07-18:9 2001-07-25:14 2001-08-01:14 2001-08-08:16 2001-08-22:16 2001-09-11:8 2001-09-12:8 2001-09-18:8 2001-09-19:8 2001-09-25:8 2001-09-26:8 2001-10-16:8 2001-10-17:8 2001-10-23:8 2001-10-24:8 2001-11-06:8 2001-11-07:8 2001-11-20:4 2001-11-21:4 2001-12-04:4 2001-12-05:4 2002-02-12:4 2002-02-13:4 2002-02-19:4 2002-02-20:4 2002-03-05:4 2002-03-06:4 2002-03-12:4 2002-03-13:4 2002-04-03:4 2002-04-17:4 2002-05-01:2 2002-05-08:2 2002-05-22:1';
const ORACLE_UEFA = '2001-08-09:41 2001-08-23:41 2001-09-13:48 2001-09-27:48 2001-10-18:24 2001-11-01:24 2001-11-22:16 2001-12-06:16 2002-02-28:8 2002-03-07:8 2002-03-14:4 2002-03-21:4 2002-04-04:2 2002-04-18:2 2002-05-15:1';

const ORACLE_UIC = '2001-06-23:20 2001-06-27:20 2001-06-30:16 2001-07-07:16 2001-07-14:12 2001-07-21:12 2001-07-25:6 2001-08-01:6 2001-08-07:3 2001-08-21:3';

describe('Europa i originalens format', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  it('en hel sæson: oraklets kampdage, antal kampe og fixture-koder for Champions League og UEFA Cup', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    expect(g.date).toBe('2001-07-14');
    // forkørslen: 1. kvalifikationsrundes første kampe (11/7) er spillet
    const q1 = Object.values(g.fixtures).filter((f) => f.comp === 'CL' && f.stage === 'Q1' && f.leg === 1);
    expect(q1.length).toBe(9);
    expect(q1.every((f) => f.result && f.date === '2001-07-11')).toBe(true);
    for (let i = 0; i < 400 && g.date < '2002-05-23'; i++) {
      const r = continueGame();
      if (r.match) quickPlayUserMatch();
    }
    const days = (comp: string, pred: (f: Fixture) => boolean = () => true) => {
      const m = new Map<string, number>();
      for (const f of Object.values(g.fixtures).filter((x) => x.comp === comp && pred(x))) m.set(f.date, (m.get(f.date) ?? 0) + 1);
      return [...m].sort().map(([d, n]) => `${d}:${n}`).join(' ');
    };
    expect(days('CL')).toBe(ORACLE_CL);
    expect(days('UEFA')).toBe(ORACLE_UEFA);
    expect(g.comps.CL.finished && g.comps.UEFA.finished).toBe(true);
    // koderne som oraklets poster: 3. kvalifikationsrunde (273/274, +0x38 1024 → 1027 i andet ben), grupperne (+0x32 1085.., +0x34 = spilledag),
    // finalen (150, 131, neutral bane), UEFA Cup'ens 1. runde (+0x3a = 7) og 3. runde (8)
    const one = (comp: string, p: (f: Fixture) => boolean) => Object.values(g.fixtures).find((f) => f.comp === comp && p(f))!;
    const c = (f: Fixture) => { const k = fixtureCodesOf(g, f, f.comp, f.home); return [k.w30, k.w32, k.b34, k.flags38, k.b3a, k.b3c]; };
    expect(c(one('CL', (f) => f.stage === 'Q3' && f.leg === 1))).toEqual([273, 0, 2, 1024, 8, 0]);
    expect(c(one('CL', (f) => f.stage === 'Q3' && f.leg === 2))).toEqual([274, 0, 2, 1027, 8, 0]);
    expect(c(one('CL', (f) => f.stage === 'GE' && f.round === 2))).toEqual([0, 1089, 1, 0, 8, 0]);
    expect(c(one('CL', (f) => f.stage === 'GB2' && f.round === 6))).toEqual([0, 1094, 5, 0, 8, 0]);
    expect(c(one('CL', (f) => f.stage === 'F'))).toEqual([150, 0, 2, 131, 8, 1]);
    expect(c(one('UEFA', (f) => f.stage === 'R1' && f.leg === 1))).toEqual([13, 0, 1, 1024, 7, 0]);
    expect(c(one('UEFA', (f) => f.stage === 'R3' && f.leg === 2))).toEqual([34, 0, 3, 3, 8, 0]);
    // 1. gruppespil: 8 grupper á 4 uden to klubber fra samme land, når det kan lade sig gøre
    const grp = Object.entries(g.comps.CL.groups!).filter(([k]) => !k.endsWith('2'));
    expect(grp.length).toBe(8);
    expect(grp.every(([, rows]) => rows.length === 4)).toBe(true);
    // Super Cup: Bayern mod Liverpool 24/8
    const esc = Object.values(g.fixtures).filter((f) => f.comp === 'ESC');
    expect(esc.length).toBe(1);
    // Intertoto (0x633300): oraklets kampdage; de 3 vindere i UEFA Cup'ens 1. runde
    expect(days('UIC')).toBe(ORACLE_UIC);
    const uicW = g.comps.UIC.ties.filter((t) => t.stage === 'F').map((t) => t.winner);
    expect(uicW.every((w) => Object.values(g.fixtures).some((f) => f.comp === 'UEFA' && f.stage === 'R1' && (f.home === w || f.away === w)))).toBe(true);
    // England: Charity Shield søndag 12/8 (EngCharity 0x56d640), Liga Cup'ens 1. runde tirsdag 21/8 med 28 + k kampe (EngCcCup 0x56c570), finalen
    // søndag 31/3 (alle som oraklet); FA Cup'ens omkampe: +0x22 dage og 0x5ab510 (onsdag), koden + 1
    expect(days('CS-60')).toBe('2001-08-12:1');
    const lc = Object.values(g.fixtures).filter((f) => f.comp === 'LC-60');
    expect(lc.filter((f) => f.round === 1).every((f) => f.date === '2001-08-21')).toBe(true);
    expect(lc.find((f) => f.stage === 'F')?.date).toBe('2002-03-31');
    expect(g.comps['LC-60'].finished && g.comps['CS-60'].finished && g.comps['CUP-60'].finished).toBe(true);
    const rep = Object.values(g.fixtures).find((f) => f.comp === 'CUP-60' && (f.cm?.rep ?? 0) > 0);
    if (rep) {
      const orig = Object.values(g.fixtures).find((f) => f.tieId === rep.tieId && f.cm?.rep === 0)!;
      expect(rep.cm!.w30).toBe(orig.cm!.w30 + 1);
      expect(rep.home).toBe(orig.away);
      expect(new Date(rep.date).getUTCDay()).toBe(3);
    }
  }, 600_000);
});
