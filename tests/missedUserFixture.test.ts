// En kamp for menneskets klub, hvis dato er passeret uden resultat (20/11: en FA Cup-omkamp oven i en ligakamp – playDay venter kun på én egen kamp
// pr. dag, så Sunderland–Man Utd 2/3-02 blev aldrig spillet, 37/38): næste Continue spiller den med assistenten (gemte spil, der står sådan, retter sig).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, indexFixture, unindexFixture } from '../src/game/state';
import { continueGame } from '../src/game/sim';
import { addDays } from '../src/game/dates';
import { upgradeLoaded } from '../src/game/save';

describe('egne kampe med passeret dato', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[2] === 'Man Utd')![0];
  it('spilles ved næste Continue, og en hængende ferie ryddes ved indlæsning', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    const lg = g.clubs[mu].league;
    const f = Object.values(g.fixtures).filter((x) => x.comp === lg && (x.home === mu || x.away === mu)).sort((a, b) => a.date.localeCompare(b.date))[0];
    // som et gemt spil, hvor kampen blev sprunget over: datoen ligger før i dag
    const was = f.date;
    unindexFixture(f.id, was); f.date = addDays(g.date, -1); indexFixture(f.id, f.date);
    for (let i = 0; i < 3 && !f.result; i++) continueGame();
    expect(f.result).toBeTruthy();
    // ferien kører kun i Shell's løkke – et spil gemt midt i den har den ikke hængende efter indlæsning
    g.manager.holiday = { rejectAll: true };
    upgradeLoaded();
    expect(g.manager.holiday).toBeUndefined();
  });
});
