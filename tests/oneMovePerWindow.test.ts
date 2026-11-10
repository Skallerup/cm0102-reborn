// Spillerfejl (v0.19.0): Kulusevski skiftede Spurs → Fulham → Bilbao → Lazio i samme transfervindue.
// AI-klubber køber ikke spillere, der skiftede inden for 120 dage (recentlyJoined i transfers.ts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

describe('højst ét klubskifte pr. transfervindue', () => {
  it('ingen spiller skifter to gange i sommervinduet', () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const nat = (n: string) => w.nations.findIndex((x) => x.name === n);
    createGame(w, { managerName: 'T', managerNation: nat('England'), clubId: w.clubs.find((c) => c[1] === 'Chelsea')![0], activeNations: [nat('England'), nat('Spain'), nat('Italy')], lang: 'en', masking: true, seed: 5 });
    const g = gs();
    while (g.date < '2026-09-05') { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    const moved = Object.values(g.players).map((p) => (p.moves ?? []).filter((m) => m.date >= '2026-06-01' && m.fee >= 0).length);
    expect(moved.filter((n) => n >= 1).length).toBeGreaterThan(50);
    expect(moved.filter((n) => n >= 2).length).toBe(0);
  });
});
