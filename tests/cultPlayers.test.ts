// Den originale database: kultspillerne fra CM 01/02 skal være med (også uden for de spilbare ligaer),
// og de skjulte ligaer må aldrig sættes op som turneringer.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
const clubName = new Map(w.clubs.map((c) => [c[0], c[1]]));
const find = (first: string, last: string) => w.players.find((p) => p[F.first] === first && p[F.last] === last);

describe('kultspillere i den originale database', () => {
  it.each([
    ['Maxim', 'Tsigalko', 'Dinamo Minsk'], ['Julius', 'Agahowa', 'Shakhtar Donetsk'], ['Mark', 'Kerr', 'Falkirk'],
    ['Cherno', 'Samba', 'Millwall'], ['Kennedy', 'Bakircioglü', 'Hammarby IF'], ['Michael', 'Dunwell', 'Bishop Auckland'],
    ['Bobby', 'Zamora', 'Brighton & Hove Albion'],
  ])('%s %s spiller for %s', (first, last, club) => {
    const p = find(first, last);
    expect(p).toBeDefined();
    expect(clubName.get(p![F.club] as number)).toContain(club.split(' ')[0]);
  });

  it('skjulte ligaer spilles ikke og kan ikke vælges', () => {
    const hidden = w.leagues.filter((l) => l.hidden);
    expect(hidden.length).toBeGreaterThan(50);
    const eng = w.nations.findIndex((n) => n.name === 'England');
    expect(hidden.some((l) => l.nation === eng)).toBe(true); // fx Bishop Auckland
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Millwall')![0], activeNations: [eng], lang: 'da', masking: true, seed: 1 });
    const g = gs();
    for (const l of hidden) expect(g.comps[l.id]).toBeUndefined();
    expect(Object.values(g.comps).filter((c) => c.type === 'league').length).toBe(4);
    }, 20_000);
});
