// "Om dette spil" og fejlrapportens/forslagets meta (ui/gameInfo.ts): database og udgave, tilstand, kampmotor, klub
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gameInfo, gameInfoMeta } from '../src/ui/gameInfo';

describe('gameInfo', () => {
  it('viser den originale databases udgave, tilstanden, kampmotoren og klubben', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((x) => x.name === 'England');
    const club = w.clubs.find((c) => c[1] === 'Arsenal')![0];
    createGame(w, { managerName: 'T', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const rows = Object.fromEntries(gameInfo('squad').map((r) => [r.k, r.v]));
    expect(rows.Database).toMatch(/^CM 01\/02 original 3\.9\.6\d/);
    expect(rows.Mode).toContain('authentic');
    expect(rows['Match engine']).toMatch(/^(Original \(grid\)|Standard \(zone\))/);
    expect(rows.Club).toContain('Arsenal');
    expect(rows['Screen route']).toBe('squad');
    const meta = gameInfoMeta('squad');
    expect(meta.length).toBeLessThanOrEqual(1000);
    expect(meta).toContain('Database: CM 01/02 original');
  }, 120_000);
});
