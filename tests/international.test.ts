// Landsholdsfodbold: landskampe i vinduerne og VM 2002 i den originale database.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { en } from '../src/i18n/en';

describe('landshold', () => {
  it('landskampe tæller, og VM 2002 bliver spillet færdigt med en vinder', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Leeds United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 2 });
    const g = gs();
    const beckham = Object.values(g.players).find((p) => p.first === 'David' && p.last === 'Beckham')!;
    const caps0 = beckham.caps;
    while (g.date < '2002-07-08') { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    expect(beckham.caps).toBeGreaterThan(caps0);
    const t = g.intl!.tournament!;
    expect(t.name).toBe('wc');
    expect(t.stage).toBe('done');
    expect(g.intl!.history[0].winner).toBeGreaterThanOrEqual(0);
    for (const k of new Set(g.news.map((n) => n.key))) expect(k in en, k).toBe(true);
  }, 300_000);
});
