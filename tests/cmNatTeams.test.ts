// Landstrænerne i bestyrelsessystemet (cmNatTeams.ts, landsholdsgrenene i cmBoard.ts/cmBoardGame.ts): NationalTeams' turneringer (0x775220/0x775000/
// 0x775420), forventningerne (vtable +0x70) og vurderingen (+0x74), forbundets vurdering 0x6a5610 og teksterne 0x6a4550/0x6a5b40/0x6a1d60.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { ntEnd, ntGrade, ntOut, ntStart, ntStatus } from '../src/game/cmNatTeams';
import { reviewNational, newRec, type BoardEnv, type CmBoardState, type Person } from '../src/game/cmBoard';
import { boardEnv, cmBoardDaily } from '../src/game/cmBoardGame';
import { natClub } from '../src/game/cmVirtual';
import { faDepText, faExpectText, faPerfText } from '../src/game/cmBoardText';

describe('vtable +0x70/+0x74 (VM 0x92fae0/0x92fb40, EM 0x57cd30/0x57cd80, EM-kval. 0x580b50/0x580b80)', () => {
  it('forventningen af den forudsagte placering', () => {
    expect([1, 2, 3, 5, 9, 17, 25].map((x) => ntStatus('wc', x))).toEqual([-1, 150, 130, 120, 20, -4, -4]);
    expect([1, 2, 3, 5, 9].map((x) => ntStatus('euro', x))).toEqual([-1, 150, 130, 120, -4]);
    expect([1, 13, 16].map((x) => ntStatus('euroq', x))).toEqual([-2, -2, -3]);
  });
  it('vurderingen: forudsagt mod opnået', () => {
    expect([1, 5, 9, 17].map((a) => ntGrade('wc', 1, a))).toEqual([0, -1, -2, -3]);
    expect([1, 5, 9, 17].map((a) => ntGrade('wc', 25, a))).toEqual([3, 3, 2, 0]);
    expect([3, 5, 9].map((a) => ntGrade('euro', 9, a))).toEqual([3, 2, 0]);
    expect(ntGrade('euroq', 1, 20)).toBe(-1);
  });
});

describe('0x6a5610 review_national_team_performance', () => {
  const env = (rep: number, days: number): BoardEnv => ({
    today: { day: 200, year: 2002 }, clubRep: () => rep, isHumanClub: () => false, isNat: () => true,
    manager: () => ({ joined: { day: 200 - (days % 365), year: 2002 - Math.floor(days / 365) } } as Person), news: () => {},
  } as unknown as BoardEnv);
  const st = (w6: number, e = 0): CmBoardState => ({ rec: { [-1000]: { ...newRec(), w6, e } }, dep: [], vac: [], ult: [], month: 0 });
  it('3: +1250, mindst 8500; −3: −1750, højst 3000 og fyret (grund 0)', () => {
    const a = st(5000); reviewNational(env(7000, 800), a, -1000, 404, 3, () => 0);
    expect(a.rec[-1000].w6).toBe(8500);
    const b = st(5000); reviewNational(env(7000, 800), b, -1000, 404, -3, () => 0);
    expect(b.rec[-1000].w6).toBe(3000);
    expect(b.dep).toEqual([{ type: 1, reason: 0, club: -1000 }]);
  });
  it('0: −250, kun ved forventningen −3 sættes 3500 og efter 10 år fyres han (grund 6)', () => {
    const a = st(6000, 20); reviewNational(env(7000, 4000), a, -1000, 404, 0, () => 0);
    expect(a.rec[-1000].w6).toBe(5750); expect(a.dep).toEqual([]);
    const b = st(6000, -3 & 0xffff); reviewNational(env(7000, 4000), b, -1000, 404, 0, () => 0);
    expect(b.rec[-1000].w6).toBe(3500); expect(b.dep).toEqual([{ type: 1, reason: 6, club: -1000 }]);
  });
  it('under et år i jobbet: tilliden mindst 6500 først', () => {
    const a = st(2000); reviewNational(env(7000, 100), a, -1000, 404, 1, () => 0);
    expect(a.rec[-1000].w6).toBe(6500);
  });
});

describe('forbundets tekster (0x6a4550, 0x6a5b40, 0x6a1d60)', () => {
  it('originalens ordlyd', () => {
    expect(faExpectText('English', -1, 'wc', '', false)).toBe('The English Football Association expect the team to win the FIFA World Cup.');
    expect(faExpectText('Scottish', -2, 'euroq', 'euro', false)).toBe('The Scottish Football Association expect the team to qualify for the European Championship.');
    expect(faExpectText('Welsh', 0, '', '', false)).toBe('The Welsh Football Association expect the team to uphold the countries honour in the forthcoming friendly matches.');
    expect(faPerfText('English', -2, 'wc')).toBe('The English Football Association are disappointed with your performance as manager within the FIFA World Cup.');
    expect(faDepText(1, 2, 'Kevin Keegan', 'England', 'English').title).toBe('England manager Kevin Keegan sacked');
  });
});

describe('landsholdene i spillet (3.9.60, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[2] === 'Man Utd')![0];
  it('databasens landstrænere, forventningerne ved VM-lodtrækningen og vurderingen bagefter', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    const nm = g.cmBoard!.nm!;
    expect(g.staff[nm[eng]].last).toBe('Eriksson');
    const env = boardEnv(g);
    expect(env.clubs).toContain(natClub(eng));
    expect(env.canBeManaged(natClub(eng))).toBe(true);
    // mennesket som Englands landstræner (forbundets nyheder går til ham)
    delete nm[eng];
    g.manager.national = { nation: eng, since: g.date, played: 0, won: 0 };
    const fra = g.nations.findIndex((n) => n.name === 'France');
    const teams = [eng, fra, g.nations.findIndex((n) => n.name === 'Brazil'), g.nations.findIndex((n) => n.name === 'Senegal')];
    ntStart(g, 'wc', 2002, teams);
    expect(g.cmBoard!.rec[natClub(eng)].t2c).toBe(404);
    const exp = g.news.find((n) => n.key === 'board.cm' && String(n.params.bd).includes('"k":"x"'));
    expect(String(exp?.params.body)).toMatch(/^The English Football Association (expect|hope) the team/);
    // Frankrig (forudsagt 1. eller 2.) ude i gruppen → fyret; England vurderet
    ntEnd(g, 'wc', 2002, { [eng]: 1, [fra]: 25 });
    expect(g.intl!.ntc!.cur[eng]).toBeUndefined();
    expect(g.news.some((n) => n.key === 'board.cm' && String(n.params.bd).includes('"k":"p"'))).toBe(true);
    expect(g.cmBoard!.dep.some((d) => d.club === natClub(fra))).toBe(true);
    cmBoardDaily(g);
    expect(nm[fra]).toBeUndefined();
    expect(g.cmBoard!.vac.some((v) => v.club === natClub(fra))).toBe(true);
    // et hold ude af kvalifikationen mister turneringen
    ntStart(g, 'euroq', 2004, [fra]);
    ntOut(g, 'euroq', 2004, [fra]);
    expect(g.intl!.ntc!.cur[fra]).toBeUndefined();
  }, 600000);
});
