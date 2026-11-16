// Slutrundekampe gemmer en kompakt rapport (IntlResult.mini), så resultatet i Afternoon Results kan åbnes som kampskærm; venskabs- og
// kvalifikationskampe gemmer den ikke. En dag uden slutrundekampe giver ingen resultater (skærmen vises kun, når der er nogen).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { intlDayResults, playNation, ranked } from '../src/game/international';
import { unpackReport } from '../src/game/miniReport';

describe('landskampes kompakte rapport', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  it('slutrundekampen har mål, opstillinger og statistik; en venskabskamp har ingen', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const [a, b] = ranked().slice(0, 2);
    const r = playNation(a, b, 'afcon', 'G');
    expect(r.mini).toBeTruthy();
    const rep = unpackReport(r.mini!, 0, a, b, undefined, r.pens);
    expect(rep.events.filter((e) => e.k === 'goal' && e.t === 0).length).toBe(r.hg);
    expect(rep.events.filter((e) => e.k === 'goal' && e.t === 1).length).toBe(r.ag);
    expect(rep.players.filter((l) => l.team === 0 && !l.sub)).toHaveLength(11);
    expect(rep.players.every((l) => g.players[l.id])).toBe(true);
    expect(rep.stats[0].shots).toBeGreaterThanOrEqual(0);
    expect(playNation(a, b, 'friendly').mini).toBeUndefined();
    expect(playNation(a, b, 'wcq', 'G').mini).toBeUndefined();
    // ingen slutrundekampe i dag (resultaterne ovenfor er 'afcon' på en anden dato end i morgen)
    expect(intlDayResults('1999-01-01')).toEqual([]);
  }, 120000);
});
