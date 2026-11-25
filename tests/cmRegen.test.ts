import { describe, expect, it } from 'vitest';
import { cmRegenDue, cmRegenRetired, cmRegenSortQueue, regenRecBytes } from '../src/game/cmRegen';
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

describe('0x7abac0 egenskaberne (0x7ac76e–0x7ace62, regenRecBytes)', () => {
  // en talrække, der altid giver det højeste (n − 1; negativt n: n + 1), så grenene er forudsigelige
  const hi = (n: number) => (n > 0 ? n - 1 : n < 0 ? n + 1 : 0);
  const pool = (pos: number[]): RegenSeed => ({ from: 'x', nation: 1, pos, side: [1, 1, 1], foot: 'R', pa: 150, attrs: [], cmInt: [] });
  it('angriber med PA > 100, 17 år: kun de 12 bytes; acceleration 20 − 4, pace 20, de interne − rand(40)', () => {
    const b = regenRecBytes(pool([1, 1, 1, 1, 1, 1, 20, 1]), 17, hi, (o) => (o === 0x1e || o === 0x24 ? -30 : 12));
    expect(b[0x1b]).toBe(16);
    expect(b[0x36]).toBe(20);
    expect(b[0x1d]).toBe(15);                                         // rand(20) + 1 = 20, > 15: − rand(6)
    expect(b[0x2e]).toBe(19);                                         // angriber: rand(0) + rand(20)
    expect(b[0x1e]).toBe(-69);
    expect(b[0x24]).toBe(-69);
    expect(b[0x2c]).toBe(8);                                          // 12 > 10: − rand(5)
    expect(b[0x2f]).toBe(5);                                          // 12 > 10: − rand(8)
    expect(Object.keys(b).map(Number).sort((x, y) => x - y)).toEqual([0x1b, 0x1d, 0x1e, 0x24, 0x2c, 0x2e, 0x2f, 0x34, 0x36, 0x3c, 0x3d, 0x44]);
  });
  it('8-bit fortegnsaritmetik som originalen (−120 − 39 løber rundt)', () => {
    const b = regenRecBytes(pool([1, 1, 1, 1, 1, 1, 1, 1]), 16, hi, (o) => (o === 0x1e ? -120 : 10));
    expect(b[0x1e]).toBe(97);
  });
});
