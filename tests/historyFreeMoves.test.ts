// Frie transfers (0x8c1af0 – historikkens art 3: Player.moves med to = 0) og managerskift (Staff.moves) i historikken: posterne skrives uden den
// globale spiltilstand (trupplanen og kontrakterne kører også i dagens Web Worker), og spillerens History (Playing Career) tegnes med dem.
import { describe, expect, it, vi } from 'vitest';
// (ingen DOM i testene: skærmmodulerne læser window/document ved indlæsningen)
vi.hoisted(() => {
  const gl = globalThis as Record<string, unknown>;
  const store = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  gl.window ??= Object.assign(globalThis, { addEventListener: () => {}, removeEventListener: () => {}, location: { search: '', hash: '', pathname: '/' } });
  gl.localStorage ??= store; gl.sessionStorage ??= store;
  gl.document ??= { addEventListener: () => {}, documentElement: { dataset: {}, style: {} }, createElement: () => ({ style: {} }), head: { appendChild: () => {} }, body: {} };
});
// renderToString kender ikke useSyncExternalStore uden server-billede: useGame læser spillet direkte
vi.mock('../src/ui/core', async (orig) => {
  const m = await orig<typeof import('../src/ui/core')>();
  const st = await import('../src/game/state');
  return { ...m, useGame: () => (st.hasGame() ? st.gs() : null) };
});
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { recordFreeTransfer, setGame } from '../src/game/state';
import { recordStaffMove } from '../src/game/staffMoves';
import { ClassicCareer } from '../src/ui/screens/PlayerClassic';
import type { GameState, Player, Staff } from '../src/game/types';

const stats = () => ({ apps: 0, subs: 0, goals: 0, assists: 0, mom: 0, ratingSum: 0, ratingCount: 0, minutes: 0, yellow: 0, red: 0 });
function mini(): { g: GameState; p: Player; s: Staff } {
  const p = { id: 7, first: 'Test', last: 'Spiller', club: 1, contract: null, loan: null, stats: stats(), history: [], caps: 0, intGoals: 0 } as unknown as Player;
  const s = { id: 9, first: 'Test', last: 'Manager', club: 1, role: 'manager' } as unknown as Staff;
  const club = (id: number, name: string) => ({ id, name, short: name, nation: 0, league: 'x' });
  const g = { season: 2001, date: '2002-06-30', draft: false, options: { mode: 'authentic' }, offers: [], news: [], fixtures: {}, comps: {}, leagues: {}, nations: [], players: { 7: p }, staff: { 9: s }, clubs: { 1: club(1, 'Alfa'), 2: club(2, 'Beta') } } as unknown as GameState;
  return { g, p, s };
}

describe('frie transfers og stabsskifter i historikken', () => {
  it('skrives uden den globale spiltilstand', () => {
    setGame(null);
    const { g, p, s } = mini();
    recordFreeTransfer(g, p);
    expect(p.moves).toEqual([{ season: 2001, date: '2002-06-30', from: 1, to: 0, fee: 0 }]);
    recordStaffMove(s, 2, 0, g);
    expect(s.moves).toEqual([{ season: 2001, date: '2002-06-30', from: 1, to: 2, fee: 0 }]);
  });
  it('Playing Career tegnes med en fri transfer (ingen ny klub)', () => {
    const { g, p } = mini();
    p.history = [{ season: 2000, club: 2, apps: 30, goals: 4, assists: 2, loan: false } as Player['history'][number]];
    recordFreeTransfer(g, p);
    p.club = 0;
    setGame(g);
    const html = renderToString(createElement(ClassicCareer, { p }));
    expect(html).toContain('Alfa');
    expect(html).toContain('Beta');
    expect(html).not.toContain('>?<');
    setGame(null);
  });
});
