// Landskampe åbnes som samme kampskærm som en ligakamp (PlayedMatchClassic), også uden kamprapport (venskabskamp/kvalifikation) – og alle
// landskampslister linker dertil via rute-id'et fra intlMatchKey.
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
  return { ...m, useGame: () => (st.hasGame() ? st.gs() : null), useNav: () => ({ nav: () => {}, back: () => {} }), useRouteState: (_k: string, d: unknown) => [d, () => {}] };
});
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { setGame } from '../src/game/state';
import { intlMatchByKey, intlMatchKey } from '../src/game/international';
import { PlayedMatchClassic } from '../src/ui/screens/PlayedMatchClassic';
import { IntlScore } from '../src/ui/screens/IntlScore';
import type { GameState } from '../src/game/types';

const res = (kind: 'friendly' | 'wc', extra = {}) => ({ date: '2001-10-10', home: 0, away: 1, hg: 2, ag: 1, kind, ...extra });
function mini(results: ReturnType<typeof res>[]): GameState {
  return {
    season: 2001, date: '2001-10-10', draft: false, options: { mode: 'authentic' }, userClub: 1, offers: [], news: [], fixtures: {}, comps: {}, leagues: {}, clubs: { 1: { id: 1, name: 'X', short: 'X', nation: 0, league: 'x', colors: ['#800000', '#fff'] } },
    nations: [{ code: 'ENG', name: 'England', col: ['#ffffff', '#000080'] }, { code: 'GER', name: 'Germany' }], players: {}, staff: {}, reports: {}, intl: { results, history: [] },
  } as unknown as GameState;
}

describe('landskamp som kampskærm', () => {
  it('rute-id: intlMatchKey ↔ intlMatchByKey (alle slags, også venskabskampe)', () => {
    setGame(mini([res('friendly'), res('wc', { stage: 'F' })]));
    const r = res('friendly');
    expect(intlMatchByKey(intlMatchKey(r))?.kind).toBe('friendly');
    expect(intlMatchByKey('0:1:2001-10-10:wc')?.stage).toBe('F');
    expect(intlMatchByKey('5:6:2001-10-10:wc')).toBeUndefined();
  });
  it('uden kamprapport (venskabskamp): samme scoreboard og Match Overview som en ligakamp uden rapport, med nationernes navne', () => {
    setGame(mini([res('friendly')]));
    const html = renderToString(createElement(PlayedMatchClassic, { id: -1, intl: res('friendly') as never }));
    expect(html).toContain('match-screen');
    expect(html).toContain('cx-board');
    expect(html).toContain('England');
    expect(html).toContain('Germany');
  });
  it('resultatet i listerne er et link', () => {
    setGame(mini([res('friendly')]));
    const html = renderToString(createElement(IntlScore, { r: res('friendly') as never }));
    expect(html).toContain('data-testid="intl-score"');
    expect(html.replace(/<!-- -->/g, '')).toContain('2 - 1');
  });
});
