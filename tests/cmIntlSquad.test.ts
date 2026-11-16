// Landsholdenes nyheder efter kampen (0x770d20 – cmIntlSquad.reportKeys) og FIFA-ranglisten (fifa_rankings.cpp – cmFifa.ts)
import { describe, expect, it } from 'vitest';
import { reportKeys } from '../src/game/cmIntlSquad';
import { cmFifaDaily, cmFifaInit, cmFifaRanking, cmFifaRecord } from '../src/game/cmFifa';
import { en } from '../src/i18n/en';
import type { GameState } from '../src/game/types';

describe('0x770d20: brødteksten efter landskampen', () => {
  it('anfører med to mål i en sejr: "hit two goals" eller "scored two" efter rand(2)', () => {
    expect(reportKeys('W', true, 1, 8, 0, 0).main).toBe('a626f0');
    expect(reportKeys('W', true, 1, 8, 0, 1).main).toBe('a625f4');
  });
  it('masken 0x44 går forud: hatful og udvist (kun ved sejr)', () => {
    expect(reportKeys('W', true, 1, 0x44, 0, 0).main).toBe('a62d4c');
    expect(reportKeys('D', true, 1, 0x44, 0, 0).main).toBe('a619f8');           // uafgjort: 0x40 (hatful)
    expect(reportKeys('L', false, 1, 0x44, 0, 1).main).toBe('a5cdc4');           // nederlag: ingen 0x44/0x40 – udvist (4)
  });
  it('flere spillere uden anfører: liste (2–4) eller antal (5+); anføreren med andre: hale', () => {
    expect(reportKeys('D', false, 3, 2, 0, 0)).toEqual({ main: 'a5f878', tail: '' });
    expect(reportKeys('L', false, 6, 2, 0, 0)).toEqual({ main: 'a5fa58', tail: '' });
    expect(reportKeys('W', true, 2, 0, 2, 0).tail).toBe('a5fe64');               // også scoret i en sejr: "also shone"
    expect(reportKeys('D', true, 2, 0, 2, 0).tail).toBe('a5fe24');
    expect(reportKeys('W', true, 5, 0, 0, 0).tail).toBe('a5fdc0');
  });
  it('alle valgte tekster findes på engelsk med originalens ordlyd', () => {
    expect(en['cmint.r.a5ca9c' as keyof typeof en]).toBeUndefined();
    expect(en['cmint.r.h1']).toBe('{last} selected for {nation} match');
    expect(en['cmint.r.a62d4c']).toBe("{club}'s {player} was named as captain in {nation}'s {score} {fix} win over {opp}.\n\n{last} turned from hero to villain as he got sent off after scoring a hatful of goals.");
  });
});

function fakeGame(): GameState {
  const nations = ['A', 'B', 'C', 'D'].map((name) => ({ name }));
  return {
    date: '2001-07-14', cmStart: '2001-07-14', nations, cmNationCont: [2, 2, 0, 2], cmNationRep: [9000, 8000, 2000, 5000],
    intl: { results: [], history: [], info: { 0: { fifa: 700 }, 1: { fifa: 600 }, 2: { fifa: 100 }, 3: { fifa: 350 } } },
  } as unknown as GameState;
}

describe('FIFA-ranglisten 0x58dd50/0x58cf70/0x58d460', () => {
  it('startscoren er koefficienten / 35, pladserne efter scoren', () => {
    const g = fakeGame();
    const f = cmFifaInit(g);
    expect(f.n[0].score).toBeCloseTo(20, 4);
    expect(f.n[0].y).toEqual([20000, 20000, 20000, 20000, 20000, 20000]);
    expect(cmFifaRanking(g).map((r) => r.n)).toEqual([0, 1, 3, 2]);
  });
  it('en sejr mellem to hold i samme klasse giver H = 2 · (1 + 0,06 · mål) · verdensdel', () => {
    const g = fakeGame();
    cmFifaInit(g);
    cmFifaRecord(g, 0, 1, 2, 0, 'friendly', true, '2001-08-15');
    // begge klasse 1 (plads 1 og 2): c = 0, sejr → H = 2, A = 0 (+0,3 på udebane); Europa 1,0
    expect(g.intl!.cmFifa!.n[0].r[0][0]).toBe(Math.trunc(Math.fround(2 * 0.2 * 2 * 0.3 + 2) * 1000));
    expect(g.intl!.cmFifa!.n[1].r[0][0]).toBe(Math.trunc(Math.fround(0.30000001192092896) * 1000));
  });
  it('lande med omdømme under 3500: modstanderen får mindst 2,5', () => {
    const g = fakeGame();
    cmFifaInit(g);
    cmFifaRecord(g, 2, 3, 1, 0, 'friendly', true, '2001-08-15');
    expect(g.intl!.cmFifa!.n[3].r[0][0]).toBe(2500);
  });
  it('den 18. regnes scoren igen (første år: (forrige år + de bedste) / (antal + 8) · 8)', () => {
    const g = fakeGame();
    cmFifaInit(g);
    cmFifaRecord(g, 0, 1, 2, 0, 'friendly', true, '2001-08-15');
    g.date = '2001-08-18';
    cmFifaDaily(g);
    const v = g.intl!.cmFifa!.n[0];
    const best = v.r[0][0];
    expect(v.y[0]).toBe(Math.trunc((20000 + best) / 9) * 8);
  });
});
