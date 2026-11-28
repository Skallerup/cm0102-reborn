// Recall From Loan / Terminate Loan Deal som i originalen: dialogen 0x8fbcc0 → CONTRACT_MANAGER 0x4ccca0 (lejekontraktens slut = i morgen, art 7),
// lejen slutter dagen efter i 0x4c8077 uden "loan finishes" (0x4da590 springes over for art 7); menuen 0x871800 (Recall kun uden art 7,
// Terminate for lejeklubben). Ingen frist.
import { afterEach, describe, expect, it } from 'vitest';
import { SL_ON } from '../src/game/cmShortlistGame';
import { canRecallLoan, canTerminateLoan, recallLoan, terminateLoan } from '../src/game/transfers';
import { endDueLoansDaily } from '../src/game/season';
import { setGame, gs, setClub } from '../src/game/state';
import type { GameState, Player } from '../src/game/types';

const player = (id: number, club: number): Player => ({ id, club, first: 'A', last: `P${id}`, dob: '1980-01-01', nation: 0, pos: [1, 20, 1, 1, 1, 1, 1, 1], side: [20, 1, 1], attrs: new Array(48).fill(10), ca: 40, pa: 60, rep: 10, value: 1000,
  contract: { wage: 100, expires: '2003-06-30' }, condition: 100, morale: 10, form: [], injury: null, banned: 0, yellowCount: 0, listed: false, loan: null, stats: {}, history: [], caps: 0, intGoals: 0 } as unknown as Player);

function mockGame(): GameState {
  const players: Record<number, Player> = {};
  for (let i = 1; i <= 20; i++) players[i] = player(i, i <= 10 ? 1 : 2);
  return {
    id: 'le', seed: 1, rng: 1, date: '2001-09-02', season: 2001, draft: false, dbKind: 'cm0102', dbYear: 2001, options: { mode: 'authentic' },
    players, nations: [{ id: 0, name: 'England' }],
    clubs: { 1: { id: 1, name: 'Alpha', nation: 0, league: 'L', manager: 0, balance: 1e7, transferBudget: 1e7, rep: 50, finance: {} }, 2: { id: 2, name: 'Beta', nation: 0, league: 'L', manager: -1, balance: 1e7, transferBudget: 1e7, rep: 50, finance: {} } },
    leagues: { L: { id: 'L', nation: 0, tier: 1 } }, comps: {}, fixtures: {}, offers: [], news: [], nextId: { news: 1, offer: 1, player: 100 },
    pursuits: [], userClub: 2, board: {}, manager: {}, activeNations: [0], staff: {}, regenQueue: [],
  } as unknown as GameState;
}

afterEach(() => { SL_ON.on = false; });

describe('Recall/Terminate 0x4ccca0', () => {
  it('Recall: hjem dagen efter, ingen frist, ingen "loan finishes", menupunktet væk efter art 7', () => {
    SL_ON.on = true;
    setGame(mockGame());
    const g = gs();
    const p = g.players[15];
    setClub(p, 1); p.loan = { from: 2, until: '2002-05-01' };
    expect(canRecallLoan(p, 2)).toBe(true);
    expect(canTerminateLoan(p, 2)).toBe(false);
    expect(recallLoan(p.id)).toBe('loan.recalled');            // samme dag som lejens start – originalen har ingen frist
    expect(p.club).toBe(1);
    expect(p.loan).toMatchObject({ from: 2, until: '2001-09-03', ended: 1 });
    expect(canRecallLoan(p, 2)).toBe(false);                     // 0x871cd2: art 7 → ingen Recall
    expect(recallLoan(p.id)).toBe('error');
    expect(g.news.length).toBe(0);                               // 0x4db0b0: kun til den anden klub, når den er menneskets
    endDueLoansDaily();                                          // samme dag: intet
    expect(p.club).toBe(1);
    g.date = '2001-09-03';
    endDueLoansDaily();                                          // 0x4c8077: slutdatoen = i dag → end_loan
    expect(p.club).toBe(2);
    expect(p.loan).toBeNull();
    expect(g.news.some((n) => n.key === 'transfer.loanEnded')).toBe(false);
  });
  it('Terminate: lejeklubben (mennesket) afbryder en indlejet spillers leje', () => {
    SL_ON.on = true;
    setGame(mockGame());
    const g = gs();
    const p = g.players[4];
    setClub(p, 2); p.loan = { from: 1, until: '2002-05-01' };
    expect(canTerminateLoan(p, 2)).toBe(true);
    expect(canRecallLoan(p, 2)).toBe(false);
    expect(recallLoan(p.id)).toBe('error');
    expect(terminateLoan(p.id)).toBe('loan.terminated');
    expect(p.loan).toMatchObject({ until: '2001-09-03', ended: 1 });
    g.date = '2001-09-03';
    endDueLoansDaily();
    expect(p.club).toBe(1);
    expect(g.news.some((n) => n.key === 'transfer.loanEnded')).toBe(false);
  });
  it('en almindelig leje, der udløber, giver stadig "loan finishes"', () => {
    SL_ON.on = true;
    setGame(mockGame());
    const g = gs();
    const p = g.players[16];
    setClub(p, 1); p.loan = { from: 2, until: '2001-09-02' };
    endDueLoansDaily();
    expect(p.club).toBe(2);
    expect(g.news.some((n) => n.key === 'transfer.loanEnded')).toBe(true);
  });
});
