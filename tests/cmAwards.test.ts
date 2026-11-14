// CM 01/02's priser (cmAwards.ts – award/*.cpp i cm0102.exe 3.9.68): MONTH_RATINGS::find_best_player 0x768130, TEAM_AWARD::add_candidate
// 0x8afa40 og en spillet august 2001 med Man Utd (den originale database i ægte tilstand).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { addCandidate, bestRated, cmAwardsDaily, cmAwardHistory, cmAwardName, cmAwardWins, ENGLAND_AWARDS, TEAM_SLOTS, type CmAwState } from '../src/game/cmAwards';
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

    // 6/4 (0x579610 Date(5,3)): PFA-priserne og årets hold af ligaens tal; 31/5: årets manager (her med augusts tal – kravene sænkes −0,1 ad gangen)
    const date = g.date;
    g.date = '2002-04-07';
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
    expect(g.news.some((n) => n.key.startsWith('cmaw.yh.') && n.date === '2002-04-06')).toBe(true);
    g.date = '2002-06-01';
    cmAwardsDaily(g);
    const moy = cmAwardWins(g, ENGLAND_AWARDS.find((d) => d.kind === 'mgrYear' && d.tier === 1)!.id)[0];
    expect(moy?.w).toHaveLength(3);
    expect(moy.w.every((x) => x.mgr)).toBe(true);
    g.date = date;
  });
});
