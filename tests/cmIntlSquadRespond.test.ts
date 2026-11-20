// Landsholdets trupudtagelse som originalen: nyheden 0x1e ("squad to be decided") og 0x22 (erstatning for et afbud) har knappen Respond
// (0x782b70 → 0x7798c0/0x77a140) og spærrer Continue Game, til truppen er bekræftet i dialogen 0x779a50 ("Confirm Squad Selection" /
// "Squad Invalid" uden for 0x775520..0x7754c0).
import { describe, expect, it } from 'vitest';
import { cmSquadAnswerOpen, cmSquadAsk, cmSquadConfirm, cmSquadOf } from '../src/game/cmIntlSquad';
import { newsMustRespond } from '../src/ui/screens/newsRespond';
import { setGame } from '../src/game/state';
import { en } from '../src/i18n/en';
import type { GameState, NewsItem, Player } from '../src/game/types';

function mini(picks: number) {
  const players: Record<number, Player> = {};
  for (let i = 1; i <= 30; i++) players[i] = { id: i, first: 'P', last: `S${i}`, nation: 1, club: 5, injury: null } as unknown as Player;
  const g = {
    season: 2001, date: '2001-08-01', draft: false, options: { mode: 'authentic' }, offers: [], news: [], fixtures: {}, comps: {}, leagues: {}, jobOffers: [],
    nations: [{ name: 'X' }, { name: 'Scotland' }], players, staff: {}, clubs: { 5: { id: 5, name: 'Club', short: 'Club', nation: 1, manager: 3 } },
    manager: { name: 'M', national: { nation: 1, since: '2001-07-14', played: 0, won: 0, picks: Array.from({ length: picks }, (_, i) => i + 1) } },
    intl: { results: [], history: [], cmSq: { sq: {} } }, nextId: { news: 1 },
  } as unknown as GameState;
  const n = { id: 1, date: g.date, cat: 'general', key: 'cmint.h.req', read: true,
    params: { body: 'ro', nation: 'Scotland', opp: 'Wales', opps: 'Wales', ans: 0, max: 26, min: 22, fd: '2001-08-15', fin: 0, until: '2001-08-15', oi: '' } } as NewsItem;
  g.news.push(n);
  return { g, n };
}

describe('0x1e: landsholdets trupudtagelse kræver svar', () => {
  it('Respond og Continue Game spærret, indtil truppen er bekræftet', () => {
    const { g, n } = mini(24);
    setGame(g);
    expect(cmSquadAnswerOpen(g, n)).toBe(true);
    expect(newsMustRespond(g, n)).toBe(true);
    expect(cmSquadAsk(g, n)).toMatchObject({ nation: 'Scotland', count: 24, min: 22, max: 26, ok: true });
    expect(cmSquadConfirm(g, n)).toBe(true);
    expect(n.params.ans).toBe(1);
    expect(newsMustRespond(g, n)).toBe(false);
    const q = cmSquadOf(g, 1, 0)!;
    expect(q.ids.length).toBe(24);
    expect(q.until).toBe('2001-08-15');
    setGame(null);
  });
  it('uden for 22..26 er truppen ugyldig ("Squad Invalid") – intet bekræftes', () => {
    const { g, n } = mini(20);
    setGame(g);
    expect(cmSquadAsk(g, n)?.ok).toBe(false);
    expect(cmSquadConfirm(g, n)).toBe(false);
    expect(newsMustRespond(g, n)).toBe(true);
    setGame(null);
  });
  it('0x22: kun samme dag og kun med et afbud, der venter (0x76d7b0)', () => {
    const { g, n } = mini(24);
    setGame(g);
    cmSquadConfirm(g, n);
    const rq = { id: 2, date: g.date, cat: 'general', key: 'cmint.rq', read: true, params: { body: 'xinj', player: 'P S1', nation: 'Scotland', ans: 0 } } as NewsItem;
    expect(cmSquadAnswerOpen(g, rq)).toBe(false);                 // intet afbud
    cmSquadOf(g, 1, 0)!.wd = 1;
    expect(cmSquadAnswerOpen(g, rq)).toBe(true);
    g.date = '2001-08-02';
    expect(cmSquadAnswerOpen(g, rq)).toBe(false);                 // en anden dag: ingen knap
    g.date = '2001-08-01';
    expect(cmSquadConfirm(g, rq)).toBe(true);
    expect(cmSquadOf(g, 1, 0)!.wd).toBe(0);
    expect(cmSquadAnswerOpen(g, rq)).toBe(false);
    setGame(null);
  });
  it('dialogens tekster er originalens (0xa64968/0xa64918/0xa64908/0xa64620)', () => {
    expect(en['cmint.ask.head']).toBe('Confirm Squad Selection');
    expect(en['cmint.ask.q']).toBe('Confirm {squad} squad selection ?');
    expect(en['cmint.ask.invalid']).toBe('Squad Invalid');
    expect(en['cmint.ask.rng']).toBe('The {squad} squad must have between {min} and {max} players selected. There are currently {c} players in the squad.');
  });
});
