// CM 01/02's priser (cmAwards.ts – award/*.cpp i cm0102.exe 3.9.68): MONTH_RATINGS::find_best_player 0x768130, TEAM_AWARD::add_candidate
// 0x8afa40 og en spillet august 2001 med Man Utd (den originale database i ægte tilstand).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { addCandidate, awardsStart, bestRated, cmAwardsDaily, cmAwardHistory, cmAwardName, cmAwardNations, cmAwardWins, ENGLAND_AWARDS, NATION_AWARDS, TEAM_SLOTS, teamSlots, type CmAwState, type YrEntry } from '../src/game/cmAwards';
import { createGame, type WorldData } from '../src/game/newgame';
import { runUntil } from '../src/game/sim';
import { gs } from '../src/game/state';
import type { GameState } from '../src/game/types';

describe('priserne – originalens regler', () => {
  it('databasens priser og tidligere vindere (staff_comp.dat / staff_comp_history.dat)', () => {
    expect(ENGLAND_AWARDS.every((d) => d.id >= 0)).toBe(true);
    expect(ENGLAND_AWARDS).toHaveLength(26);                                         // 2 + 4·6 (uden Conference)
    expect(cmAwardName(ENGLAND_AWARDS[0].id)).toBe('English Players Player of the Year');
    expect(cmAwardHistory(ENGLAND_AWARDS[0].id)[0]).toEqual([2001, ['Teddy Sheringham']]);
    expect(cmAwardHistory(ENGLAND_AWARDS[1].id)[0]).toEqual([2001, ['Steven Gerrard', 'Joe Cole', 'Wes Brown']]);
  });

  it('landenes priser (award/*_awards.cpp): 27 lande, Danmark har 10 – ingen månedspriser', () => {
    expect(Object.keys(NATION_AWARDS)).toHaveLength(27);
    expect(Object.values(NATION_AWARDS).flat().every((d) => d.id >= 0)).toBe(true);     // alle nøgler findes i databasen
    const dk = NATION_AWARDS.Denmark;
    expect(dk.map((d) => cmAwardName(d.id))).toEqual(['Danish Player of the Year', 'Danish Premier Division Team of the Week',
      'Danish Premier Division Player of the Year', 'Danish Premier Division Young Player of the Year', 'Danish First Division Team of the Week',
      'Danish First Division Player of the Year', 'Danish First Division Young Player of the Year', 'Danish Second Division Team of the Week',
      'Danish Second Division Player of the Year', 'Danish Second Division Young Player of Year']);
    expect(dk.map((d) => d.kind)).toEqual(['year', 'week', 'year', 'year', 'week', 'year', 'year', 'week', 'year', 'year']);
    expect(dk[0].rep).toEqual([6000, 2500]);
    expect(dk[3].age).toBe(21);
    expect(cmAwardHistory(dk[0].id)[0]?.[1]?.length).toBeGreaterThan(0);              // databasens tidligere vindere
    expect(NATION_AWARDS.England.map((d) => cmAwardName(d.id))).toEqual(ENGLAND_AWARDS.map((d) => cmAwardName(d.id)));
    // 0x8afdc0: opstilling 2 (Kroatien, Tyskland) har libero og wingbacks
    expect(teamSlots(2).slice(0, 11)).toEqual([1, 0x808, 0x88, 0x204, 0x204, 2, 0x210, 0x210, 0x240, 0x240, 0x210]);
    expect(NATION_AWARDS.Germany.find((d) => d.kind === 'week')?.layout).toBe(2);
    // Finland: månedspriserne maj–oktober (MONTH_AWARD 4..9)
    expect(NATION_AWARDS.Finland.find((d) => d.kind === 'month')?.months).toEqual([4, 9]);
  });

  it('0x768130: < 3 kampe sidst, ellers snittet; den unge pris springer de tre første ældre over', () => {
    const g = { players: {}, clubs: { 1: { league: 'L' } } } as unknown as GameState;
    for (const id of [1, 2, 3, 4, 5, 6]) (g.players as Record<number, unknown>)[id] = { id, club: 1 };
    const s = { mr: { y: 2001, m: 8, r: {
      1: ['L', 40, 5, 28], 2: ['L', 38, 5, 30], 3: ['L', 30, 2, 19], 4: ['L', 36, 5, 19], 5: ['L', 35, 5, 25], 6: ['L', 34, 5, 20],
    } } } as unknown as CmAwState;
    expect(bestRated(g, s, 'L', -1)).toBe(1);                                         // snit 8,0
    // ældre før de unge: 1 (8,0), 2 (7,6) er ældre; 4 (7,2) er ung men kun 2 ældre er sprunget over; 5 (7,0) ældre → 6 (6,8) vinder
    expect(bestRated(g, s, 'L', 20)).toBe(6);
    expect(bestRated(g, s, 'X', -1)).toBe(0);                                         // en anden division
  });

  it('0x8afa40: første ledige plads, ellers flyttes en anden; fuldt hold', () => {
    const team: (number | null)[] = TEAM_SLOTS.map(() => null);
    const masks = new Map<number, number>();
    addCandidate(team, masks, 10, 0x204 | 0x804);                                    // D midt/højre → første passende: DR (0x804)
    expect(team[1]).toBe(10);
    addCandidate(team, masks, 11, 0x804);                                            // kun D højre: første ledige er udskifteren D (4)
    expect(team[13]).toBe(11);
    addCandidate(team, masks, 12, 0x804);                                            // ingen ledig: 10 flyttes til DC, 12 tager DR
    expect(team[1]).toBe(12);
    expect(team[3]).toBe(10);
    expect(addCandidate(team, masks, 13, 1)).toBe(false);                            // målmand
    expect(team[0]).toBe(13);
  });
});

describe('priserne i et spil (original DB, ægte tilstand)', { timeout: 600_000 }, () => {
  it('august 2001: månedens spiller, unge spiller og manager i de fire divisioner; nyheden til Man Utd', async () => {
    const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = world.nations.findIndex((n) => n.name === 'England');
    const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    await runUntil({ untilDate: '2001-09-01', autoPlay: true });
    const pom = ENGLAND_AWARDS.filter((d) => d.kind === 'month' && !d.age);
    for (const d of pom) {
      const w = cmAwardWins(g, d.id);
      expect(w.length, cmAwardName(d.id)).toBe(1);
      expect(w[0].m).toBe(8);
      const p = g.players[w[0].w[0].id];
      expect(p).toBeTruthy();
      expect(g.clubs[p.club].league).toBe(g.clubs[w[0].w[0].club].league);
    }
    const young = ENGLAND_AWARDS.find((d) => d.kind === 'month' && d.age === 20 && d.tier === 1)!;
    const yw = cmAwardWins(g, young.id)[0];
    expect(yw).toBeTruthy();
    const yp = g.players[yw.w[0].id];
    expect(Number(g.date.slice(0, 4)) - Number(yp.dob.slice(0, 4))).toBeLessThanOrEqual(21);
    const mgr = ENGLAND_AWARDS.find((d) => d.kind === 'mgrMonth' && d.tier === 1)!;
    expect(cmAwardWins(g, mgr.id)[0]?.w[0]?.mgr).toBe(true);
    // ingen pris for juli (MONTH_AWARD kun august–maj)
    expect((g.cmAw?.won ?? []).some((w) => w.m === 7)).toBe(false);
    // nyhederne til Premier Division-manageren: spiller, ung spiller og manager (type 0x1b) – originalens overskrifter
    const news = g.news.filter((n) => n.key.startsWith('cmaw.mh.'));
    expect(news.length).toBe(3);
    expect(news.every((n) => n.date === '2001-08-31')).toBe(true);
    // spillets egne månedspriser er slået fra i ægte tilstand
    expect(g.news.some((n) => n.key.startsWith('award.month'))).toBe(false);

    // 5/4 (0x579610 Date(5,3) – 0x549f70: dag 5 i april): PFA-priserne og årets hold af ligaens tal; Date(30,4) = 30/5: årets manager
    // (her med augusts tal – kravene sænkes −0,1 ad gangen)
    const date = g.date;
    g.date = '2002-04-06';
    cmAwardsDaily(g);
    const pfa = cmAwardWins(g, ENGLAND_AWARDS[0].id)[0];
    expect(pfa?.w).toHaveLength(3);
    expect(new Set(pfa.w.map((x) => x.id)).size).toBe(3);
    expect(pfa.w[0].v!).toBeGreaterThanOrEqual(pfa.w[1].v!);
    const yng = cmAwardWins(g, ENGLAND_AWARDS[1].id)[0];
    expect(yng?.w).toHaveLength(3);
    for (const x of yng.w) expect(2002 - Number(g.players[x.id].dob.slice(0, 4))).toBeLessThanOrEqual(22);
    const toy = cmAwardWins(g, ENGLAND_AWARDS.find((d) => d.kind === 'team' && d.tier === 1)!.id)[0];
    expect(toy?.team?.filter(([pid]) => pid).length).toBe(TEAM_SLOTS.length);
    expect(g.players[toy!.team![0][0]].pos[0]).toBeGreaterThanOrEqual(10);             // plads 1 = målmand (maske 1)
    expect(g.news.some((n) => n.key.startsWith('cmaw.yh.') && n.date === '2002-04-05')).toBe(true);
    g.date = '2002-05-31';
    cmAwardsDaily(g);
    const moy = cmAwardWins(g, ENGLAND_AWARDS.find((d) => d.kind === 'mgrYear' && d.tier === 1)!.id)[0];
    expect(moy?.w).toHaveLength(3);
    expect(moy.w.every((x) => x.mgr)).toBe(true);
    g.date = date;
  });
});

describe('priserne i en dansk karriere (kun dansk liga indlæst)', { timeout: 600_000 }, () => {
  it('kun Danmarks priser; Danish Player of the Year (20/12) af YEAR_RATINGS +0xc; skærmen åbner på de danske priser', async () => {
    const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const den = world.nations.findIndex((n) => n.name === 'Denmark');
    const club = world.clubs.find((c) => c[1] === 'Brøndbyernes Idræts Forening')![0];
    createGame(world, { managerName: 'M S', managerNation: den, clubId: club, activeNations: [den], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    expect(cmAwardNations(g)).toEqual(['Denmark']);
    const start = awardsStart(g, undefined);
    expect(start.nation).toBe('Denmark');
    expect(cmAwardName(start.id)).toBe('Danish Player of the Year');
    expect(awardsStart(g, { awNat: 'England' }).nation).toBe('Denmark');               // England er ikke indlæst
    await runUntil({ untilDate: '2001-07-31', autoPlay: true });
    // 0x9315d0: de danske kampe i YEAR_RATINGS +0xc (danske spillere), startopstillingen
    const yr = g.cmAw!.yr!;
    expect(yr.s.length).toBeGreaterThan(50);
    // 0x414b40: i en dansk liga kun danske, franske og svenske spillere
    const sel = ['Denmark', 'France', 'Sweden'].map((n) => world.nations.findIndex((x) => x.name === n));
    expect(yr.s.every((e) => sel.includes(e[1]))).toBe(true);
    expect(yr.s.every((e) => e[5] >= 1)).toBe(true);
    expect(yr.s.some((e) => e[2] > 0)).toBe(true);
    expect((g.cmAw?.won ?? []).some((w) => ENGLAND_AWARDS.some((d) => d.id === w.a))).toBe(false);
    // 20/12: tre vindere sorteret efter mode 0 (højeste først), kun spillere med ≥ 15 kampe i 2001
    const danes = Object.values(g.players).filter((p) => p.nation === den && p.club && !p.regen).slice(0, 4);
    yr.s = danes.map((p, i): YrEntry => [p.id, den, 40 * (i + 1), 10, 10, i === 3 ? 10 : 20, 2, 0, 0]);
    const date = g.date;
    g.date = '2001-12-21';
    cmAwardsDaily(g);
    const w = cmAwardWins(g, NATION_AWARDS.Denmark[0].id)[0];
    expect(w?.w.map((x) => x.id)).toEqual([danes[2].id, danes[1].id, danes[0].id]);
    g.date = date;
  });
});
