// Nedbrud aa97721d7bdd7bc0 (28/11, v0.40.0): sub_6ceb90 pick_taker uden kandidat (siden −1 eller ingen aktive) gav undefined, og genstarten
// i loop.ts tick faldt på `.x` uden spor. Originalen stopper med fatal 0x3e89 – porten kaster nu en fejl med tilstanden.
import { describe, expect, it } from 'vitest';
import { GRID_UNKNOWN, type GridMatchState } from '../src/game/engine/grid/gridMatch';

describe('pick_taker 0x6ceb90 uden kandidat', () => {
  const m = { gp: [], ballX: 4, ballY: 6, poss: -1, state: 8, clock: 12, carrier: null, takers: undefined } as unknown as GridMatchState;
  it('kaster fatal 0x3e89 med tilstanden i stedet for at give undefined', () => {
    expect(() => GRID_UNKNOWN.pickTaker(m, -1 as 0, 8, () => 0)).toThrow(/0x3e89: side -1 state 8 poss -1/);
  });
  it('straffesparkskonkurrencens liste giver stadig null (0x6be697 prøver igen)', () => {
    expect(GRID_UNKNOWN.pickTaker(m, 0, 5, () => 0, new Set())).toBeNull();
  });
});
