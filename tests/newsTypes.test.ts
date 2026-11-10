// Nyhedstyperne fra CM 01/02 (docs/NEWS.md): en hel sæson skal give de nye nyheder, og hver nyhed skal have en tekst.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { en } from '../src/i18n/en';

describe('nyheder gennem en sæson', () => {
  it('nye CM 01/02-nyhedstyper dukker op, og alle nyheder har en engelsk tekst', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Leeds United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 6 });
    const g = gs();
    const keys = new Set<string>();
    for (let i = 0; i < 330; i++) {
      const r = continueGame();
      if (r.match !== undefined) quickPlayUserMatch();
      for (const n of g.news) keys.add(n.key);
    }
    const missing = [...keys].filter((k) => !(k in en));
    expect(missing).toEqual([]);
    for (const k of ['media.preview.' + g.board.expectation]) expect(keys.has(k) || [...keys].some((x) => x.startsWith('media.preview.'))).toBe(true);
    expect([...keys].some((k) => k.startsWith('ban.'))).toBe(true);
    expect([...keys].some((k) => k.startsWith('comp.'))).toBe(true);
  }, 120_000);
});
