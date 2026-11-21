import { describe, expect, it } from 'vitest';
import { cmRegenDue, cmRegenRetired, cmRegenSortQueue } from '../src/game/cmRegen';
import type { GameState, RegenSeed } from '../src/game/types';

const seed = (pa: number, fromId: number): RegenSeed => ({ from: `p${fromId}`, nation: 1, pos: [], side: [], foot: 'R', pa, attrs: [], fromId });

describe('PLAYER_REGEN-puljen og køen (0x7a87d0/0x7a8350/0x7a65d0)', () => {
  it('stab giver posten til puljen uden kø-post; køen tager puljens FØRSTE post', () => {
    const g = { date: '2002-07-01' } as GameState;
    cmRegenRetired(g, seed(180, 1), false, '2002-07-01', 1);   // bliver stab (0x7a6335): kun puljen
    cmRegenRetired(g, seed(60, 2), true, '2002-07-05', 2);
    cmRegenRetired(g, seed(90, 3), true, '2002-07-01', 3);
    cmRegenSortQueue(g);
    expect(g.cmRegenQ!.map((q) => q.id)).toEqual([3, 2]);
    const a = cmRegenDue(g);
    expect(a.map((x) => [x.q.id, x.rec.pa])).toEqual([[3, 180]]);   // FIFO: den førstes post (PA 180) på plads 3
    g.date = '2002-07-05';
    const b = cmRegenDue(g);
    expect(b.map((x) => [x.q.id, x.rec.pa])).toEqual([[2, 60]]);
    expect(g.cmRegenPool!.map((r) => r.pa)).toEqual([90]);           // efterslæbet bliver i puljen
  });
  it('en tom pulje stopper køen (0x7a6618)', () => {
    const g = { date: '2002-07-01', cmRegenQ: [{ due: '2002-06-30', id: 5 }], cmRegenPool: [] } as unknown as GameState;
    expect(cmRegenDue(g)).toEqual([]);
    expect(g.cmRegenQ!.length).toBe(1);
  });
});
