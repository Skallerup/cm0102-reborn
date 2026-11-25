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
import { pushCareerLine, setClub, setGame } from '../src/game/state';
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
const allCells = (html: string) => [...html.matchAll(/<tr[^>]*>(.*?)<\/tr>/g)].slice(1)
  .map((m) => [...m[1].matchAll(/<td[^>]*>(.*?)<\/td>/g)].map((c) => c[1].replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '')));
/** uden mærkekolonnen (kolonne 2) */
const cells = (html: string) => allCells(html).map((r) => [r[0], r[1], ...r.slice(3)]);
/** [klub, mærke] pr. række (Playing Career-kolonnen efter klubben: Loan/Free/beløb – 0x885820) */
const hows = (html: string) => allCells(html).map((r) => [r[1], r[2]]);

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
    // (0x7c44ad: Dalum nu og Dalum før lejen er samme sæson og klub – én række under lejeklubben)
    expect(rows[0].slice(1, 3)).toEqual(['Gamma', '10']);
    expect(rows[1].slice(1, 3)).toEqual(['Dalum', '7']);
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

// Ejerens fejl 25/11 (Djordjic lejet til AGF, tilbage i Man Utd – lejen manglede i History): originalens arkivering 0x7c5fe0 og karrierelisten
// 0x7c3e40 – lejens start (sign_loan 0x4d01e0) giver altid moderklubbens post (art 1), lejens slut (end_loan 0x4d07e0) lejeklubbens; mærket
// "Loan" står på lejeklubbens række (rykket en række op)
function loanGame(date: string, joined = '1999-07-01') {
  const { g, p } = mini();
  Object.assign(g, { date, nations: [{ name: 'England' }, { name: 'Denmark' }] });
  Object.assign(g.clubs, { 1: { id: 1, name: 'Man Utd', short: 'Man Utd', nation: 0, league: 'x' }, 3: { id: 3, name: 'AGF', short: 'AGF', nation: 1, league: 'y' } });
  p.joined = joined;
  return { g, p };
}
/** udlej (som completeTransfer: p.loan først, så bogføringen før setClub) og kald hjem på datoen */
function loanOutAndBack(g: GameState, p: Player, back: string, apps: number) {
  p.loan = { from: 1, until: back } as Player['loan'];
  pushCareerLine(p, p.club, false, { kind: 1 });
  setClub(p, 3);
  play(p, apps, apps ? 2 : 0, 0);
  g.date = back;
  setClub(p, 1);
  p.loan = null;
}

describe('Playing Career: leje', () => {
  it('lejeklubben med kampe: egen linje med tallene og "Loan"; moderklubbens linje før lejen (art 1) også uden kampe', () => {
    const { g, p } = loanGame('2001-09-01');
    setGame(g);
    loanOutAndBack(g, p, '2001-11-30', 6);
    expect(p.history.map((h) => [h.club, h.apps, h.goals, !!h.loan, h.kind ?? 0])).toEqual([[1, 0, 0, false, 1], [3, 6, 2, true, 0]]);
    play(p, 1, 0, 0);
    const html = renderToString(createElement(ClassicCareer, { p }));
    // den igangværende Man Utd-række lægges sammen med Man Utd-rækken fra før lejen (samme sæson og klub, 0x7c44ad)
    expect(hows(html)).toEqual([['AGF', 'Loan'], ['Man Utd', ''], ['Total', '']]);
    expect(cells(html)[0].slice(1, 4)).toEqual(['AGF', '6', '2']);
    expect(cells(html)[1].slice(1, 3)).toEqual(['Man Utd', '1']);
    expect(cells(html).at(-1)!.slice(1, 3)).toEqual(['Total', '7']);
    setGame(null);
  });
  it('uden kampe midt i sæsonen og over et år i klubben: ingen lejeklub-linje (0x7c6528), "Loan" på moderklubbens række', () => {
    const { g, p } = loanGame('2001-09-01');
    setGame(g);
    play(p, 3, 0, 0);
    loanOutAndBack(g, p, '2001-11-30', 0);
    expect(p.history.map((h) => [h.club, h.apps, h.kind ?? 0])).toEqual([[1, 3, 1]]);
    // de to Man Utd-rækker lægges sammen (0x7c44ad) med lejemærket
    expect(hows(renderToString(createElement(ClassicCareer, { p })))).toEqual([['Man Utd', 'Loan'], ['Total', '']]);
    setGame(null);
  });
  it('uden kampe, men under 365 dage i klubben: lejeklubbens nul-linje med "Loan"', () => {
    const { g, p } = loanGame('2001-09-01', '2001-07-01');
    setGame(g);
    loanOutAndBack(g, p, '2001-11-30', 0);
    expect(p.history.map((h) => [h.club, h.apps, !!h.loan])).toEqual([[1, 0, false], [3, 0, true]]);
    expect(hows(renderToString(createElement(ClassicCareer, { p })))).toEqual([['AGF', 'Loan'], ['Man Utd', ''], ['Total', '']]);
    setGame(null);
  });
  it('uden kampe, lejen slutter uden for lejeklubbens sæson (30/6): lejeklubbens nul-linje', () => {
    const { g, p } = loanGame('2002-01-20');
    setGame(g);
    loanOutAndBack(g, p, '2002-06-30', 0);
    expect(p.history.map((h) => [h.club, h.apps, !!h.loan])).toEqual([[1, 0, false], [3, 0, true]]);
    setGame(null);
  });
  it('salg: beløbet står på køberens række; fri transfer "Free"', () => {
    const { g, p } = mini();
    setGame(g);
    play(p, 4, 1, 0);
    pushCareerLine(p, 1, false, { fee: 250000 });
    setClub(p, 2);
    setClub(p, 0, { fee: 0, kind: 1 });
    setClub(p, 3);
    expect(p.history.map((h) => [h.club, h.apps, h.fee])).toEqual([[1, 4, 250000], [2, 0, 0]]);
    const h = hows(renderToString(createElement(ClassicCareer, { p })));
    expect(h[0]).toEqual(['Gamma', 'Free']);
    expect(h[1][0]).toBe('Silkeborg');
    expect(h[1][1]).toMatch(/^£\d+K$/);
    setGame(null);
  });
});

describe('Playing Career: gemte spil fra før 25/11', () => {
  it('linjen uden beløb får købsprisen fra Player.moves', () => {
    const { g, p } = mini();
    setGame(g);
    p.club = 2;
    p.history = [{ season: 2001, club: 1, apps: 9, goals: 1, assists: 0, avg: 6.5 }];
    p.moves = [{ season: 2001, date: '2002-01-10', from: 1, to: 2, fee: 400000 }];
    const h = hows(renderToString(createElement(ClassicCareer, { p })));
    expect(h[0][0]).toBe('Silkeborg');
    expect(h[0][1]).toMatch(/^£\d+K$/);
    setGame(null);
  });
});
