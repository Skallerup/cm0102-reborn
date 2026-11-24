import { describe, expect, it } from 'vitest';
import { POSITIONS, type Player, type Slot } from '../src/game/types';
import { ATTR_COUNT, roleScore, slotFit, slotRole } from '../src/game/attributes';
import { maskSlot } from '../src/game/engine/grid/gridMatch';

// Nedbrud 24/11 (v0.36.0): kampens taktikskærm sorterede spillerne med roleScore(p, slotRole(plads)); den computerudtagne
// opstilling (pick_team → maskSlot) havde pladsnavne som LB/CB/CF, slotRole gav undefined, og ROLE_WEIGHTS[undefined][0] faldt.
const pl = (id: number, v: number, attrs: number[] | undefined = Array(ATTR_COUNT).fill(v)) =>
  ({ id, attrs, pos: Array(8).fill(10), side: [10, 20, 10] }) as unknown as Player;

describe('taktikskærmens sortering efter rolle', () => {
  it('maskSlot giver spillets egne pladsnavne', () => {
    for (const m of [0x1, 0x2 | 0x200, 0x4 | 0x80, 0x4 | 0x200, 0x8 | 0x800, 0x8 | 0x200, 0x10 | 0x80, 0x20 | 0x200, 0x40 | 0x200, 0x210]) {
      const s = maskSlot(m);
      expect(POSITIONS).toContain(s.pos);
      expect(typeof slotRole(s)).toBe('string');
    }
    expect(maskSlot(0x1).pos).toBe('GK');
    expect(maskSlot(0x40 | 0x200).pos).toBe('ST');
  });

  it('ukendt pladsnavn (gammel kamptaktik) og spiller uden egenskaber sorteres uden nedbrud', () => {
    const old = { pos: 'CF', side: 'C', x: 85, y: 50 } as unknown as Slot;
    expect(slotRole(old)).toBe('ST');
    const players = [pl(1, 10), pl(2, 15), pl(3, 0, undefined)];
    const sorted = players.slice().sort((a, b) => roleScore(b, slotRole(old)) * slotFit(b, old) - roleScore(a, slotRole(old)) * slotFit(a, old));
    expect(sorted.map((p) => p.id)).toEqual([2, 1, 3]);
    expect(roleScore(players[0], undefined as never)).toBe(0);
  });
});
