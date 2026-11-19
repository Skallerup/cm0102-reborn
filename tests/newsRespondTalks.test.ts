// Regression (live 19/11): efter "Offer Contract" (cmTalks.state 1) må nyheden "Offer contract to X" ikke længere låse Continue Game.
import { describe, expect, it } from 'vitest';
import { newsMustRespond } from '../src/ui/screens/newsRespond';
import type { GameState, NewsItem } from '../src/game/types';

const mk = (state: 0 | 1 | 4 | 5) => {
  const offer = { id: 7, player: 1, buyer: 10, seller: 20, status: 'negotiating', cmTalks: { rounds: 0, state } };
  const g = { userClub: 10, offers: [offer], players: { 1: { id: 1, club: 20 } }, clubs: {}, news: [], jobOffers: [], options: {} } as unknown as GameState;
  const n = { key: 'transfer.cmTalks', link: { kind: 'offer', id: 7 }, read: true } as unknown as NewsItem;
  return { g, n };
};

describe('Offer Contract låser kun, indtil kontrakten er tilbudt', () => {
  it('før tilbuddet (state 0) kræver nyheden svar', () => { const { g, n } = mk(0); expect(newsMustRespond(g, n)).toBe(true); });
  it('efter tilbuddet (state 1) kan spillet gå videre', () => { const { g, n } = mk(1); expect(newsMustRespond(g, n)).toBe(false); });
  it('trukket tilbage / aftalt (4/5) låser ikke', () => { for (const s of [4, 5] as const) { const { g, n } = mk(s); expect(newsMustRespond(g, n)).toBe(false); } });
});
