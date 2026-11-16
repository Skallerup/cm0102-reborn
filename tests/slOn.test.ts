// Ønskelisterne slået til (16/11-2026): spillets egne computer-transfers er slået fra i ægte tilstand med den originale database
// (cmShortlistOn), og dagens Web Worker (ui/dayRunner.ts) bruger spillet uden for hovedtråden – indeksernes rækkefølge følger med.
import { afterEach, describe, expect, it } from 'vitest';
import { SL_ON, cmShortlistOn } from '../src/game/cmShortlistGame';
import { aiTransferTick, aiPursuits, aiBosman, aiReleaseClauses, aiFillSquads } from '../src/game/transfers';
import { weeklyRumours } from '../src/game/media';
import { freeAgentDrift } from '../src/game/season';
import { setGame, gs, indexSnapshot, restoreIndexes, squadIds, fixturesOn, setClub } from '../src/game/state';
import type { GameState, Player } from '../src/game/types';

const player = (id: number, club: number): Player => ({ id, club, first: 'A', last: `P${id}`, dob: '1980-01-01', nation: 0, pos: [1, 20, 1, 1, 1, 1, 1, 1], side: [20, 1, 1], attrs: new Array(48).fill(10), ca: 40, pa: 60, rep: 10, value: 1000,
  contract: club ? { wage: 100, expires: '2002-06-30' } : null, condition: 100, morale: 10, form: [], injury: null, banned: 0, yellowCount: 0, listed: true, loan: null, stats: {}, history: [], caps: 0, intGoals: 0 } as unknown as Player);

function mockGame(): GameState {
  const players: Record<number, Player> = {};
  for (let i = 1; i <= 30; i++) players[i] = player(i, i <= 10 ? 1 : i <= 15 ? 2 : 0);
  return {
    id: 'sl', seed: 1, rng: 1, date: '2001-07-02', season: 2001, draft: false, dbKind: 'cm0102', dbYear: 2001, options: { mode: 'authentic' },
    players, clubs: { 1: { id: 1, name: 'A', nation: 0, league: 'L', manager: 0, balance: 1e7, transferBudget: 1e7, rep: 50, finance: {} }, 2: { id: 2, name: 'B', nation: 0, league: 'L', manager: -1, balance: 1e7, transferBudget: 1e7, rep: 50, finance: {} } },
    leagues: { L: { id: 'L', nation: 0, tier: 1 } }, comps: {}, fixtures: { 9: { id: 9, date: '2001-08-18', home: 1, away: 2, comp: 'L' } }, offers: [], news: [], nextId: { news: 1, offer: 1, player: 100 },
    pursuits: [{ club: 1, player: 11, lastFee: 1000, maxFee: 5000, tries: 1, next: '2001-07-01' }], userClub: 2, board: {}, manager: {}, activeNations: [0], staff: {}, regenQueue: [],
  } as unknown as GameState;
}

afterEach(() => { SL_ON.on = false; });

describe('ønskelisterne slået til (cmShortlistOn)', () => {
  it('er slået fra under vitest og til i ægte tilstand med den originale database, når SL_ON er sand', () => {
    const g = mockGame();
    expect(cmShortlistOn(g)).toBe(false);
    SL_ON.on = true;
    expect(cmShortlistOn(g)).toBe(true);
    expect(cmShortlistOn({ ...g, options: { mode: 'extended' } } as unknown as GameState)).toBe(false);
    expect(cmShortlistOn({ ...g, draft: true } as unknown as GameState)).toBe(false);
  });
  it('spillets egne skøn rører intet: køb, jagt, rygter, forkontrakter, frikøbsklausuler, opfyldning og klubløse, der forsvinder', () => {
    SL_ON.on = true;
    setGame(mockGame());
    const before = JSON.stringify(gs());
    aiTransferTick(); aiPursuits(); aiBosman(); aiReleaseClauses(); aiFillSquads(22); weeklyRumours(); freeAgentDrift();
    expect(JSON.stringify(gs())).toBe(before);
  });
  it('indeksernes rækkefølge (squad/fixturesOn) går med spillet til arbejderen og tilbage', () => {
    setGame(mockGame());
    setClub(gs().players[3], 2); setClub(gs().players[3], 1);   // nu sidst i klub 1's liste (rebuildIndexes ville sætte ham som nr. 3)
    const snap = structuredClone({ game: gs(), idx: indexSnapshot() });
    const want = squadIds(1).slice();
    setGame(snap.game);
    expect(squadIds(1)).not.toEqual(want);                     // rebuildIndexes: spillerrækkefølgen
    restoreIndexes(snap.idx);
    expect(squadIds(1)).toEqual(want);
    expect(fixturesOn('2001-08-18')).toEqual([9]);
  });
});
