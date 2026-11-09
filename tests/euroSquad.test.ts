// European Squad som i CM 01/02 (målt i originalen 9/11-2026): 31/8 "… to register players for next phase" med Respond; kun de
// tilmeldte (højst 25) kan spille i turneringen, og beskeden får "25 players were registered."
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs, squad } from '../src/game/state';
import { autoEuroSquad, euroComp, euroDue } from '../src/game/euroSquad';

const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');

describe('European Squad', () => {
  it('beskeden 31/8, højst 25, og kun de tilmeldte spiller i Europa', () => {
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 9, mode: 'authentic' });
    const g = gs();
    const run = (stop: () => boolean) => { for (let i = 0; i < 400 && !stop(); i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); } };
    // trøjenumrene sendes, så de ikke står i vejen
    run(() => g.date >= '2001-08-31');
    expect(euroComp(g.userClub)).toBeTruthy();
    const n = g.news.find((x) => x.key === 'eur.request');
    expect(n?.date).toBe('2001-08-31');
    expect(n?.params).toMatchObject({ club: 'Man Utd', n: 25, phase: 'first' });
    expect(euroDue(g.userClub)).toBe(true);
    const sq = squad(g.userClub);
    expect(applyAction({ t: 'euroSquad', ids: sq.slice(0, 26).map((p) => p.id) })).toBe('error');
    // Beckham uden for listen
    const beckham = sq.find((p) => p.last === 'Beckham')!;
    const ids = autoEuroSquad(g.userClub).filter((id) => id !== beckham.id);
    expect(ids.length).toBeGreaterThanOrEqual(22);
    expect(applyAction({ t: 'euroSquad', ids })).toBe('ok');
    expect(euroDue(g.userClub)).toBe(false);
    expect(n?.params.done).toBe(ids.length);
    // første europæiske kamp: Beckham spiller ikke
    const comp = euroComp(g.userClub)!.id;
    const played = () => Object.values(g.fixtures).find((f) => f.comp === comp && f.result && (f.home === g.userClub || f.away === g.userClub));
    run(() => !!played());
    const f = played()!;
    const rep = g.reports[f.id];
    expect(rep).toBeTruthy();
    expect(rep.players.some((l) => l.id === beckham.id && l.minutes > 0)).toBe(false);
    expect(f.result).toBeTruthy();
  }, 240_000);
});
