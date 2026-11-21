// CM Reborn-valget "Moderne udskiftningsregler" (Game Options): fra = originalens 3/5, til = 5/9; gælder fra næste kamp.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { benchSize, classicRules, maxSubs } from '../src/game/rules';

describe('moderne udskiftningsregler (valg)', () => {
  it('standard fra = 3 udskiftninger/5 på bænken; til = 5/9; kan skiftes midt i spillet', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    expect(g.options.modernSubs).toBeFalsy();
    expect([classicRules(), maxSubs(), benchSize()]).toEqual([true, 3, 5]);
    g.options.modernSubs = true;
    expect([classicRules(), maxSubs(), benchSize()]).toEqual([false, 5, 9]);
    g.options.modernSubs = false;
    expect([maxSubs(), benchSize()]).toEqual([3, 5]);
  }, 120_000);
});
