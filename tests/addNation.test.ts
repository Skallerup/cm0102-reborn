// Flere spilbare ligaer midt i et spil (Game Options → Selected Leagues): landets ligaer startes, de kampe, der allerede
// skulle være spillet, simuleres, og pokalen kommer med fra næste sæson.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { activateNation, addableNations, continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs, squad } from '../src/game/state';

describe('tilføj et land undervejs', () => {
  it('England kan tilføjes til et dansk spil efter sæsonstart', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const den = w.nations.findIndex((n) => n.name === 'Denmark');
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: den, clubId: w.clubs.find((c) => /Br.ndby/.test(c[1]))![0], activeNations: [den], lang: 'en', masking: true, seed: 4 });
    const g = gs();
    for (let i = 0; i < 70; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    expect(addableNations()).toContain(eng);
    expect(Object.values(g.comps).some((c) => c.nation === eng && c.type === 'league')).toBe(false);
    expect(applyAction({ t: 'addNation', nation: eng })).toBe('ok');
    expect(g.activeNations).toContain(eng);
    expect(addableNations()).not.toContain(eng);
    const eLeagues = Object.values(g.comps).filter((c) => c.nation === eng && c.type === 'league');
    expect(eLeagues.length).toBeGreaterThanOrEqual(2);
    // de kampe, der skulle være spillet, har et resultat
    const ids = new Set(eLeagues.map((c) => c.id));
    const past = Object.values(g.fixtures).filter((f) => ids.has(f.comp) && f.date < g.date);
    expect(past.length).toBeGreaterThan(0);
    expect(past.every((f) => f.result)).toBe(true);
    // spillet kører videre, og de nye kampe spilles
    for (let i = 0; i < 20; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    expect(Object.values(g.fixtures).filter((f) => ids.has(f.comp) && f.result).length).toBeGreaterThan(past.length);
    // et land kan ikke tilføjes to gange
    expect(applyAction({ t: 'addNation', nation: eng })).toBe('error');
  }, 120_000);

  it('midt i sæsonen: indhentningen efterlader ikke holdene uden spillere (soak 9/11-2026: Morton med 21 af 22 skadet)', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    const sco = w.nations.findIndex((n) => n.name === 'Scotland');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 5 });
    const g = gs();
    g.date = '2002-02-06';
    activateNation(sco);
    const clubs = Object.values(g.clubs).filter((c) => c.nation === sco && Object.values(g.comps).some((k) => k.type === 'league' && k.clubs.includes(c.id)));
    expect(clubs.length).toBeGreaterThan(20);
    for (const c of clubs) expect(squad(c.id).filter((p) => !p.injury && !p.banned).length, c.name).toBeGreaterThanOrEqual(11);
  }, 120_000);
});
