// Klubskifte midt i sæsonen (ejerens fejl 19/11: Debski Dalum → Silkeborg fik sæsonens 37/13/3 på begge linjer): den gamle klubs linje
// beholder tallene, den nye klub starter fra 0, og Total er summen – også ved leje ud og hjem og for klubløse, der skriver under.
import { describe, expect, it, vi } from 'vitest';
// (ingen DOM i testene: skærmmodulerne læser window/document ved indlæsningen)
vi.hoisted(() => {
  const gl = globalThis as Record<string, unknown>;
  const store = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  gl.window ??= Object.assign(globalThis, { addEventListener: () => {}, removeEventListener: () => {}, location: { search: '', hash: '', pathname: '/' } });
  gl.localStorage ??= store; gl.sessionStorage ??= store;
  gl.document ??= { addEventListener: () => {}, documentElement: { dataset: {}, style: {} }, createElement: () => ({ style: {} }), head: { appendChild: () => {} }, body: {} };
});
vi.mock('../src/ui/core', async (orig) => {
  const m = await orig<typeof import('../src/ui/core')>();
  const st = await import('../src/game/state');
  return { ...m, useGame: () => (st.hasGame() ? st.gs() : null) };
});
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { setClub, setGame } from '../src/game/state';
import { ClassicCareer } from '../src/ui/screens/PlayerClassic';
import type { GameState, Player } from '../src/game/types';

const stats = () => ({ apps: 0, subs: 0, goals: 0, assists: 0, mom: 0, ratingSum: 0, ratingCount: 0, minutes: 0, yellow: 0, red: 0 });
function mini(): { g: GameState; p: Player } {
  const p = { id: 7, first: 'Emil', last: 'Debski', club: 1, pos: [1, 1, 1, 1, 1, 1, 20, 1], side: [1, 20, 1], contract: null, loan: null, stats: stats(), history: [], caps: 0, intGoals: 0 } as unknown as Player;
  const club = (id: number, name: string) => ({ id, name, short: name, nation: 0, league: 'x' });
  const g = { season: 2001, date: '2002-01-15', draft: false, options: { mode: 'authentic' }, offers: [], news: [], fixtures: {}, comps: {}, leagues: {}, nations: [], players: { 7: p }, staff: {}, clubs: { 1: club(1, 'Dalum'), 2: club(2, 'Silkeborg'), 3: club(3, 'Gamma') } } as unknown as GameState;
  return { g, p };
}
const play = (p: Player, n: number, goals: number, mom: number) => {
  Object.assign(p.stats, { apps: p.stats.apps + n, goals: p.stats.goals + goals, mom: p.stats.mom + mom, ratingSum: p.stats.ratingSum + n * 6.5, ratingCount: p.stats.ratingCount + n });
};
/** tabellens rækker (uden overskriften) som tekstceller */
const cells = (html: string) => [...html.matchAll(/<tr[^>]*>(.*?)<\/tr>/g)].slice(1)
  .map((m) => [...m[1].matchAll(/<td[^>]*>(.*?)<\/td>/g)].map((c) => c[1].replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '')));

describe('Playing Career ved klubskifte i sæsonen', () => {
  it('køb midt i sæsonen: to linjer med hver klubs egne tal, Total = summen', () => {
    const { g, p } = mini();
    setGame(g);
    play(p, 37, 13, 2);
    setClub(p, 2);
    expect(p.history).toEqual([expect.objectContaining({ season: 2001, club: 1, apps: 37, goals: 13, mom: 2 })]);
    play(p, 3, 1, 0);
    const rows = cells(renderToString(createElement(ClassicCareer, { p })));
    expect(rows[0].slice(1, 4)).toEqual(['Silkeborg', '3', '1']);
    expect(rows[1].slice(1, 4)).toEqual(['Dalum', '37', '13']);
    expect(rows[1][5]).toBe('2');
    expect(rows[2].slice(1, 4)).toEqual(['Total', '40', '14']);
    setGame(null);
  });
  it('den nye klub starter fra 0, før han har spillet', () => {
    const { g, p } = mini();
    setGame(g);
    play(p, 37, 13, 2);
    setClub(p, 2);
    const rows = cells(renderToString(createElement(ClassicCareer, { p })));
    expect(rows[0].slice(1, 4)).toEqual(['Silkeborg', '0', '0']);
    expect(rows.at(-1)!.slice(1, 4)).toEqual(['Total', '37', '13']);
    setGame(null);
  });
  it('leje ud og hjem: lejeklubbens kampe på sin egen linje', () => {
    const { g, p } = mini();
    setGame(g);
    play(p, 5, 1, 0);
    setClub(p, 3);
    p.loan = { from: 1, until: '2002-05-01' } as Player['loan'];
    play(p, 10, 4, 1);
    setClub(p, 1);
    p.loan = null;
    play(p, 2, 0, 0);
    expect(p.history.map((h) => [h.club, h.apps, h.goals, !!h.loan])).toEqual([[1, 5, 1, false], [3, 10, 4, true]]);
    const rows = cells(renderToString(createElement(ClassicCareer, { p })));
    expect(rows[0].slice(1, 3)).toEqual(['Dalum', '2']);
    expect(rows.at(-1)!.slice(1, 4)).toEqual(['Total', '17', '5']);
    setGame(null);
  });
  it('frigivet og klubløs, så ny klub: linjen bogføres ved frigivelsen, den nye klub starter fra 0', () => {
    const { g, p } = mini();
    setGame(g);
    play(p, 8, 2, 0);
    setClub(p, 0);
    setClub(p, 2);
    play(p, 1, 0, 0);
    expect(p.history.map((h) => [h.club, h.apps])).toEqual([[1, 8]]);
    const rows = cells(renderToString(createElement(ClassicCareer, { p })));
    expect(rows[0].slice(1, 3)).toEqual(['Silkeborg', '1']);
    setGame(null);
  });
});
