// (22/11) De engelske divisioners play-off som originalen: rundetabellen create_schedule(stage 0) (EngFirst 0x571980, EngSecond 0x5757a0,
// EngThird 0x5770e0 – data/cmCupTables.ts ENG_PO1/2/3), deltagerne 0x573080/0x5783c0, pladserne 0x518790, finalen og oprykningen.
// Oraklets datoer (frø 1, ~/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14 fixtures_200x.tmp – scripts/oracle-playoff.ts): semifinaler
// 11/5 + 15/5-02, 10/5 + 14/5-03, 15/5 + 19/5-04; finaler Third/Second/First 25/26/27-5-02, 24/25/26-5-03, 29/30/31-5-04.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cmCupRound } from '../src/game/cmCups';
import { cmLeagueRules, cmPlayoffRules } from '../src/game/cmCalendar';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { LEAGUE_RULES } from '../src/game/leagues';
import { finalOrder, recordResult, setupPlayoff } from '../src/game/competitions';
import { seasonRollover } from '../src/game/season';
import { fixtureCodesOf } from '../src/game/engine/grid/gameInputs';

describe('rundetabellen (stage 0)', () => {
  it('semifinaler (2 ben, 4 dage, ingen udebanemål, forlænget/straffe i andet ben) og finalen på neutral bane på oraklets datoer', () => {
    const want: Record<number, [string, string, string, string]> = {
      2001: ['2002-05-11', '2002-05-27', '2002-05-26', '2002-05-25'], 2002: ['2003-05-10', '2003-05-26', '2003-05-25', '2003-05-24'], 2003: ['2004-05-15', '2004-05-31', '2004-05-30', '2004-05-29'],
    };
    for (const [y, [sf, f1, f2, f3]] of Object.entries(want)) {
      ['ENG_PO1', 'ENG_PO2', 'ENG_PO3'].forEach((k, i) => {
        const a = cmCupRound(k, +y, 1, 2, true)!, b = cmCupRound(k, +y, 2, 2, true)!;
        expect([a.date, a.legs, a.gap, a.cm.w30, a.cm.f38, a.cm.f38dec, a.cm.b3a, a.neutral], `${k} ${y}`).toEqual([sf, 2, 4, 133, 0x204, 3, 5, false]);
        expect([b.date, b.legs, b.cm.w30, b.cm.b34, b.cm.f38, b.neutral, b.slot], `${k} ${y}`).toEqual([[f1, f2, f3][i], 1, 150, 1, 3, true, i === 0 ? 2 : 1]);
      });
    }
  });
});

describe('ligaernes regler', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData & { rules: Record<string, Record<string, unknown>> };
  it('First/Second 2 op + play-off 6–3/5–4, Third 3 op + play-off 7–4/6–5; Second 4 ned (cmLeagueRules uændret uden modulet)', () => {
    const r = cmPlayoffRules(cmLeagueRules(world.rules)) as Record<string, any>;
    expect([r.CM8.promoted, r.CM9.promoted, r.CM10.promoted, r.CM9.relegated, r.CM7.relegated]).toEqual([2, 2, 3, 4, 3]);
    expect(r.CM8.playoff).toEqual({ seeds: [['CM8', 6], ['CM8', 3], ['CM8', 5], ['CM8', 4]], format: 'semis', winnerTo: 'CM7', cm: 'ENG_PO1' });
    expect(r.CM10.playoff.seeds.map((s: [string, number]) => s[1])).toEqual([7, 4, 6, 5]);
    expect(r.CM10.playoff.winnerTo).toBe('CM9');
    expect((cmLeagueRules(world.rules) as Record<string, any>).CM10.promoted).toBe(4);
  });
});

describe('play-off i et nyt spil', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  it('semifinalerne efter tabellen, finalen efter semifinalerne – vinderen er play-off-turneringens', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    expect(g.cmPlayoff).toBe(1);
    expect(LEAGUE_RULES.CM8.promoted).toBe(2);
    const lg = g.comps.CM8;
    lg.table.forEach((row, i) => { row.pts = 200 - i; });
    const order = finalOrder(lg);
    g.date = '2002-05-06';
    setupPlayoff('PO-CM8', LEAGUE_RULES.CM8.playoff!, 2001);
    const po = g.comps['PO-CM8'];
    expect(po.type).toBe('playoff');
    expect(po.playoffFor).toBe('CM7');
    const fx = () => Object.values(g.fixtures).filter((f) => f.comp === 'PO-CM8').sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
    const sf = fx();
    expect(sf.map((f) => f.date)).toEqual(['2002-05-11', '2002-05-11', '2002-05-15', '2002-05-15']);
    // 6.–3. og 5.–4. (hjemmebanen i første ben: rand(2) pr. deltager)
    const pair = (f: (typeof sf)[number]) => [f.home, f.away].map((c) => order.indexOf(c) + 1).sort().join('-');
    expect(sf.slice(0, 2).map(pair).sort()).toEqual(['3-6', '4-5']);
    for (const f of sf.slice(2)) expect(sf.slice(0, 2).some((x) => x.home === f.away && x.away === f.home)).toBe(true);
    expect(sf.map((f) => [f.cm?.w30, f.cm?.w32, f.cm?.f38, f.stage, f.leg])).toEqual([[133, 160, 0x204, 'SF', 1], [133, 160, 0x204, 'SF', 1], [134, 160, 0x204, 'SF', 2], [134, 160, 0x204, 'SF', 2]]);
    // fixture +0 = ligaens id (First Division = 8), +0x3a = 5, tabelposten ligaens (gange mod hver 2, +0x43 2)
    const c0 = fixtureCodesOf(g, sf[0], 'PO-CM8', sf[0].home);
    expect([c0.compId, c0.b3a, c0.w30, c0.w32, c0.b3c, c0.table?.b3c, c0.table?.b43]).toEqual([8, 5, 133, 160, 0, 2, 2]);
    // første ben 1-0 til hjemmeholdet, andet ben 0-0 → første bens hjemmehold videre
    for (const f of sf.slice(0, 2)) recordResult(f, { hg: 1, ag: 0 });
    for (const f of sf.slice(2)) recordResult(f, { hg: 0, ag: 0 });
    const fin = fx().filter((f) => f.stage === 'F');
    expect(fin.length).toBe(1);
    expect([fin[0].date, fin[0].slot, fin[0].cm?.w30, fin[0].cm?.f38, fin[0].cm?.b3c]).toEqual(['2002-05-27', 2, 150, 3, 1]);
    expect(new Set([fin[0].home, fin[0].away])).toEqual(new Set(sf.slice(0, 2).map((f) => f.home)));
    recordResult(fin[0], { hg: 2, ag: 1 });
    expect(po.finished).toBe(true);
    expect(po.winner).toBe(fin[0].home);
    // sæsonskiftet: de 2 øverste + play-off-vinderen op, de 3 nederste i Premier Division ned
    for (const id of ['CM7', 'CM9', 'CM10']) g.comps[id].table.forEach((row, i) => { row.pts = 200 - i; });
    for (const id of ['CM7', 'CM8', 'CM9', 'CM10']) g.comps[id].finished = true;
    const pl = finalOrder(g.comps.CM7);
    const loser = fin[0].away;
    g.date = '2002-06-20';
    seasonRollover();
    const up = [order[0], order[1], po.winner!];
    expect(up.map((c) => g.clubs[c].league)).toEqual(['CM7', 'CM7', 'CM7']);
    expect([loser, ...order.slice(2, 6).filter((c) => c !== po.winner)].every((c) => g.clubs[c].league === 'CM8')).toBe(true);
    expect(pl.slice(-3).map((c) => g.clubs[c].league)).toEqual(['CM8', 'CM8', 'CM8']);
  });
});
