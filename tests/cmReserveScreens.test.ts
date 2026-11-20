// Reservekampenes skærme og nyhed (CM 01/02: Fixtures/Last Match i reservevisningen 0x45ccf0/0x4671e0, "Reserves Latest" 0x723dd2, nyheden 0x7e6f70 –
// exe 31862-31870): g.cmRsv.hist/last/day og tekstskabelonerne. Data og render uden DOM.
import { describe, expect, it, vi } from 'vitest';
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
import { setGame } from '../src/game/state';
import { cmRsvRecord, cmRsvRows } from '../src/game/cmReserveMatches';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import { ReserveFixturesClassic } from '../src/ui/screens/Fixtures';
import { ReserveMatchClassic } from '../src/ui/screens/ReserveMatchClassic';
import { setLang } from '../src/i18n';
import type { GameState } from '../src/game/types';

function mini(): GameState {
  const club = (id: number, name: string, manager = 0) => ({ id, name, short: name.slice(0, 4), nation: 0, league: 'x', stadium: id === 1 ? 'Villa Park' : '', manager, colors: ['#800000', '#ffffff'] });
  return {
    season: 2001, date: '2001-10-10', draft: false, options: { mode: 'authentic' }, userClub: 1, offers: [], news: [], nextId: { news: 1 }, fixtures: {}, comps: {}, leagues: {},
    nations: [{ code: 'ENG' }], players: { 9: { id: 9, last: 'Dublin', number: 9 } }, staff: {}, reports: {},
    clubs: { 1: club(1, 'Aston Villa', -1), 2: club(2, 'Everton'), 3: club(3, 'Leeds') },
    cmRsv: { fx: [{ id: -1000000005, date: '2001-10-17', home: 2, away: 1 }], next: 6 },
  } as unknown as GameState;
}
const fx = (id: number, home: number, away: number, date = '2001-10-10') => ({ id, date, home, away });

describe('Reservekampenes resultater (g.cmRsv)', () => {
  it('menneskeklubbens kamp: program, Last Match, dagens liste og nyhed (a = egne mål, b = modstanderens)', () => {
    const g = mini();
    setGame(g);
    cmRsvRecord(g, fx(-1000000001, 1, 2), 3, 1);
    cmRsvRecord(g, fx(-1000000002, 3, 2), 0, 0); // ingen menneskeklub: kun dagens liste
    expect(g.cmRsv!.day!.r.map((r) => r.id)).toEqual([-1000000001, -1000000002]);
    expect(g.cmRsv!.last![1]).toMatchObject({ h: 1, a: 2, hg: 3, ag: 1 });
    expect(g.cmRsv!.last![3]).toBeUndefined();
    expect(g.news).toHaveLength(1);
    expect(g.news[0].key).toBe('res.win');
    // en ny dag nulstiller dagens liste
    cmRsvRecord(g, fx(-1000000003, 2, 1, '2001-10-11'), 2, 0);
    expect(g.cmRsv!.day!.r).toHaveLength(1);
    expect(g.news[0].key).toBe('res.loss');
    expect(g.news[0].params).toMatchObject({ team: 'Aston Villa', opp: 'Everton', a: 0, b: 2 });
    expect(g.news[0].params.venue).toBeUndefined();
  });

  it('kampprogrammet: spillede og kommende kampe i sæsonen, efter dato, set fra klubben', () => {
    const g = mini();
    setGame(g);
    cmRsvRecord(g, fx(-1000000001, 1, 2), 3, 1);
    const rows = cmRsvRows(g, 1);
    expect(rows.map((r) => [r.d, r.opp, r.home, r.res])).toEqual([['2001-10-10', 2, true, [3, 1]], ['2001-10-17', 2, false, undefined]]);
    g.cmRsv!.hist![0].d = '2000-10-10'; // sidste sæson vises ikke
    expect(cmRsvRows(g, 1)).toHaveLength(1);
  });

  it('nyhedens tekst er exe\'ens (31862-31870): "X Reserves win" med og uden stadion', () => {
    setLang('en');
    const g = mini();
    setGame(g);
    cmRsvRecord(g, fx(-1000000001, 1, 2), 3, 1);
    cmRsvRecord(g, fx(-1000000002, 2, 1, '2001-10-11'), 2, 2);
    const [draw, win] = g.news;
    expect(newsTitle(win)).toBe('Aston Villa Reserves win');
    expect(newsBody(win)).toContain('Aston Villa Reserves have beaten Everton Reserves 3-1 at Villa Park.');
    expect(newsTitle(draw)).toBe('Aston Villa Reserves draw');
    expect(newsBody(draw)).toContain('Aston Villa Reserves have drawn 2-2 with Everton Reserves.');
  });
});

describe('Reservevisningens skærme (klassisk)', () => {
  it('Fixtures: uden kampe originalens tomtekst, ellers en linje pr. kamp med "Reserve"', () => {
    setLang('en');
    const g = mini();
    g.cmRsv!.fx = [];
    setGame(g);
    expect(renderToString(createElement(ReserveFixturesClassic))).toContain('There are no forthcoming reserve matches to be played.');
    g.cmRsv!.fx = [{ id: -1000000005, date: '2001-10-17', home: 2, away: 1 }];
    cmRsvRecord(g, fx(-1000000001, 1, 2), 3, 1);
    const html = renderToString(createElement(ReserveFixturesClassic));
    expect(html).toContain('data-testid="rsv-fixtures"');
    expect(html.match(/cx-fx-row/g)).toHaveLength(2);
    expect(html).toContain('Reserve');
    expect(html).toContain('3:1');
  });

  it('Last Match: uden kamp "No recent reserve matches…", ellers resultatet og målscorerne', () => {
    setLang('en');
    const g = mini();
    setGame(g);
    expect(renderToString(createElement(ReserveMatchClassic))).toContain('No recent reserve matches have been played.');
    cmRsvRecord(g, { id: -1000000001, date: '2001-10-10', home: 1, away: 2 }, 1, 0, { events: [{ m: 23, t: 0, k: 'goal', p: 9 }], players: [], heat: [[], []], stats: [{}, {}], mom: 0 } as never);
    const html = renderToString(createElement(ReserveMatchClassic));
    expect(html).toContain('Dublin');
    expect(html).toContain('23');
    expect(g.cmRsv!.last![1].s).toEqual([[23, 0, 9, 0]]);
  });
});
