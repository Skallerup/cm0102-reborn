// Spejderne som i CM 01/02 (alle databaser): opgaver på spiller, klub, næste modstander, region og ungdom – med rapporter.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { en } from '../src/i18n/en';

describe('spejdere', () => {
  it('alle opgavetyper giver nyheder, og rapporterne har tekst', () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford FC')![0], activeNations: [eng], lang: 'en', masking: true, seed: 8 });
    const g = gs();
    // fem spejdere til fem opgaver
    const free = Object.values(g.staff).filter((s) => !s.club && s.role === 'scout').slice(0, 6);
    for (const s of free) { s.club = g.userClub; s.expires ??= `${g.season + 2}-06-30`; }
    const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout');
    expect(scouts.length).toBeGreaterThanOrEqual(5);
    const other = Object.values(g.clubs).find((c) => c.league === g.clubs[g.userClub].league && c.id !== g.userClub)!;
    const target = squad(other.id).sort((a, b) => b.ca - a.ca)[0];
    applyAction({ t: 'scout', staffId: scouts[0].id, assignment: { kind: 'player', target: target.id } });
    applyAction({ t: 'scout', staffId: scouts[1].id, assignment: { kind: 'club', target: other.id, since: g.date, found: [] } });
    applyAction({ t: 'scout', staffId: scouts[2].id, assignment: { kind: 'nextOpp', target: 0, since: g.date } });
    applyAction({ t: 'scout', staffId: scouts[3].id, assignment: { kind: 'region', target: 'southAmerica', since: g.date, found: [] } });
    applyAction({ t: 'scout', staffId: scouts[4].id, assignment: { kind: 'youth', target: 0, since: g.date, found: [] } });
    for (let i = 0; i < 75; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    const keys = new Set(g.news.map((n) => n.key));
    for (const k of ['scout.report', 'scout.started', 'scout.oppReport', 'scout.update']) expect(keys.has(k), k).toBe(true);
    expect(keys.has('scout.clubDone') || scouts[1].assignment?.kind === 'club').toBe(true);
    for (const k of keys) expect(k in en, k).toBe(true);
  }, 120_000);
});
