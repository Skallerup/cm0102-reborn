// Kommentarens variantvægte som i originalen (0x6daaac): cfg-tallet er "1 ud af N" → eff = floor(10·max/w)
import { describe, expect, it } from 'vitest';
import { effectiveWeights } from '../src/ui/matchTexts';

describe('kommentarens variantvægte', () => {
  it('højere cfg-tal giver en sjældnere variant', () => {
    const d = effectiveWeights({ RUN_PAST_OPPONENT: [[1, 'a', 'a'], [5, 'b', 'b']], ONE: [[1, 'x', 'x']] });
    expect(d.RUN_PAST_OPPONENT.map((r) => r[0])).toEqual([50, 10]);
    expect(d.ONE[0][0]).toBe(10);
    expect(d.RUN_PAST_OPPONENT[1][1]).toBe('b');
  });
});
