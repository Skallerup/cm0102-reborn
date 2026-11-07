// CM 01/02's dagsrytme i klassisk: en dag, hvor ens liga spiller uden en selv, stopper ved "Evening Fixtures" og ved resultaterne.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { quickPlayUserMatch, runUntil, watchedDay } from '../src/game/sim';
import { fixturesOn, gs, rebuildIndexes } from '../src/game/state';
import { intlDayResults } from '../src/game/international';
import { addDays } from '../src/game/dates';

describe('fulgte kampdage (klassisk Continue Game)', () => {
  it('stopper før og efter en ligadag uden egen kamp', async () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford FC')![0], activeNations: [eng], lang: 'en', masking: true, seed: 5 });
    const g = gs();
    const lg = g.clubs[g.userClub].league;
    // en ligakamp uden os på en dag, hvor vi ikke spiller: flyt den til en dag helt for sig selv
    const other = Object.values(g.fixtures).find((f) => f.comp === lg && !f.result && f.home !== g.userClub && f.away !== g.userClub)!;
    const day = addDays(g.date, 3);
    for (const id of fixturesOn(day)) { const f = g.fixtures[id]; if (f.home === g.userClub || f.away === g.userClub) f.date = addDays(day, 1); }
    other.date = day;
    rebuildIndexes();
    expect(watchedDay(day)).toBe(other.id);

    const start = await runUntil({ untilMatch: true, watchDays: true, maxDays: 10 });
    if (start.match !== undefined) { quickPlayUserMatch(); }
    let r = start;
    for (let i = 0; i < 5 && r.stop !== 'dayStart'; i++) { r = await runUntil({ untilMatch: true, watchDays: true, maxDays: 10 }); if (r.match !== undefined) quickPlayUserMatch(); }
    expect(r.stop).toBe('dayStart');
    expect(g.date).toBe(day);
    expect(g.dayDone).toBe(false);
    expect(other.result).toBeUndefined();
    const end = await runUntil({ untilMatch: true, watchDays: true, maxDays: 10 });
    expect(end.stop).toBe('dayEnd');
    expect(g.date).toBe(day);
    expect(other.result).toBeDefined();
  }, 120_000);

  it('stopper på en slutrundedag (VM) med dagens resultater', async () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford FC')![0], activeNations: [eng], lang: 'en', masking: true, seed: 6 });
    const g = gs();
    const day = addDays(g.date, 2);
    for (const id of fixturesOn(day)) g.fixtures[id].date = addDays(day, 1);
    rebuildIndexes();
    // et VM-resultat på dagen (slutrunderne spilles i newDay, så resultatet findes, når dagen stopper)
    g.intl = { results: [{ date: day, home: 1, away: 2, hg: 2, ag: 1, kind: 'wc' }], history: [] };
    expect(intlDayResults(day)).toHaveLength(1);
    let r = await runUntil({ untilMatch: true, watchDays: true, maxDays: 10 });
    for (let i = 0; i < 5 && !(r.stop === 'dayStart' && g.date === day); i++) { if (r.match !== undefined) quickPlayUserMatch(); r = await runUntil({ untilMatch: true, watchDays: true, maxDays: 10 }); }
    expect(r.stop).toBe('dayStart');
    expect(g.date).toBe(day);
  }, 120_000);
});

