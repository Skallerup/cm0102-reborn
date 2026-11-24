// Turneringsskærmen (CM 01/02 Champions League): Stages-fanen med Stage-/Group-menuerne, gruppetabel med Q-mærke og gruppens kampe;
// rutetilstanden fra kampdagens "Group D"-link (state stg:/grp:) åbner netop den gruppe. Render uden DOM.
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => {
  const gl = globalThis as Record<string, unknown>;
  const store = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  gl.window ??= Object.assign(globalThis, { addEventListener: () => {}, removeEventListener: () => {}, location: { search: '', hash: '', pathname: '/' } });
  gl.localStorage ??= store; gl.sessionStorage ??= store;
  gl.document ??= { addEventListener: () => {}, documentElement: { dataset: {}, style: {} }, createElement: () => ({ style: {} }), head: { appendChild: () => {} }, body: {} };
});
const route = vi.hoisted(() => ({ current: { name: 'competitions', state: {} as Record<string, unknown> } }));
vi.mock('../src/ui/core', async (orig) => {
  const m = await orig<typeof import('../src/ui/core')>();
  const st = await import('../src/game/state');
  const useNav = () => ({ route: route.current, nav: () => {} });
  const useRouteState = <T,>(key: string, init: T) => { const s = route.current.state; if (!(key in s)) s[key] = init; return [s[key] as T, (v: T) => { s[key] = v; }] as const; };
  return { ...m, useRouteState, useGame: () => (st.hasGame() ? st.gs() : null), useNav };
});
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { setGame } from '../src/game/state';
import { ClassicCup } from '../src/ui/screens/CupClassic';
import { setLang } from '../src/i18n';
import type { Competition, GameState, TableRow } from '../src/game/types';

const row = (club: number, w: number, l: number): TableRow => ({ club, p: 6, w, d: 0, l, gf: w * 2, ga: l, pts: w * 3, form: '' } as TableRow);
function mini(): { g: GameState; comp: Competition } {
  const club = (id: number, name: string) => ({ id, name, short: name.slice(0, 4), nation: 0, league: 'x', stadium: `${name} Arena`, manager: 0, colors: ['#800000', '#ffffff'] });
  const comp = {
    id: 'CL', name: 'UEFA Champions League', type: 'continental', nation: -1, tier: 0, clubs: [1, 2, 3, 4, 5, 6, 7, 8], table: [], ties: [], stage: 'G', finished: false, pending: 0,
    groups: { C: [row(1, 4, 2), row(2, 3, 3), row(3, 2, 4), row(4, 1, 5)], D: [row(5, 5, 1), row(6, 3, 3), row(7, 2, 4), row(8, 1, 5)] },
  } as unknown as Competition;
  const fixtures: Record<number, unknown> = {};
  let id = 1;
  for (const [k, ids] of [['C', [1, 2, 3, 4]], ['D', [5, 6, 7, 8]]] as const) for (let i = 0; i < 4; i++) fixtures[id] = { id: id++, comp: 'CL', date: `2001-09-1${i}`, home: ids[i], away: ids[(i + 1) % 4], round: i + 1, stage: `G${k}`, result: { hg: 2, ag: 1 } };
  const g = { season: 2001, date: '2001-10-10', draft: false, options: { mode: 'authentic' }, userClub: 5, nations: [{ code: 'ENG' }], players: {}, staff: {}, reports: {}, fixtures, comps: { CL: comp }, leagues: {},
    clubs: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [n, club(n, `Klub${n}`)])) } as unknown as GameState;
  return { g, comp };
}

describe('Champions League: Stages-fanen', () => {
  it('viser gruppens overskrift, Q-mærker og kampene – og følger rutetilstanden (kampdagens gruppelink)', () => {
    setLang('en');
    const { g, comp } = mini();
    setGame(g);
    route.current = { name: 'competitions', state: { 'cup:CL': 'rounds', 'stg:CL': 'G', 'grp:CL': 'C' } };
    const html = renderToString(createElement(ClassicCup, { comp }));
    expect(html).toContain('Stages');
    expect(html).toContain('Phase 1 Group C');
    expect(html).toContain('Klub1');
    expect(html).not.toContain('Phase 1 Group D');
    expect((html.match(/<span class="cx-cup-q">/g) ?? []).length).toBe(2);
    // by-kolonnen: bynavnet fra city.dat (cmCityNames via cmCrowd[klub][4]), ellers stadionnavnet
    expect(html).toContain('Klub1 Arena');
    g.cmCrowd = { 1: [0, 0, 0, 0, 7, 0, -1, -1, -1] }; g.cmCityNames = { 7: 'Nantes' };
    expect(renderToString(createElement(ClassicCup, { comp }))).toContain('>Nantes<');
    delete g.cmCrowd; delete g.cmCityNames;
    // standard: brugerens egen gruppe
    route.current = { name: 'competitions', state: { 'cup:CL': 'rounds' } };
    expect(renderToString(createElement(ClassicCup, { comp }))).toContain('Phase 1 Group D');
    // knockout-fase uden kampe endnu: overskrift med fasens navn
    route.current = { name: 'competitions', state: { 'cup:CL': 'rounds', 'stg:CL': 'QF' } };
    expect(renderToString(createElement(ClassicCup, { comp }))).toContain('Quarter Final');
  });
});
