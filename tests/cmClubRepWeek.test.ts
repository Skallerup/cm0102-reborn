import { describe, expect, it } from 'vitest';
import { repByPosition } from '../src/game/cmClubRepWeek';

// 0x5cccd0 (0x5cd4e5–0x5cd566): rep = ftol(rep · (1 + (+0x72 − +0x73)/(n · max(100, 400 − kampe·300/(2n − 2)))))
describe('0x5cccd0 klubomdømmet efter ligaplaceringen (tirsdag)', () => {
  it('bedre end udgangsplaceringen hæver, dårligere sænker', () => {
    // n = 20, 10 kampe: x = 400 − 3000/38 = 321,05…; +5 pladser → 5000·(1 + 5/6421,05…) = 5003,89 → 5003
    expect(repByPosition(5000, 10, 20, 8, 3)).toBe(5003);
    expect(repByPosition(5000, 10, 20, 3, 8)).toBe(4996);
  });
  it('x højst ned til 100 (sent i sæsonen) og ftol mod nul', () => {
    // n = 24, 46 kampe: 400 − 13800/46 = 100 → 1 + (−10)/2400; 7000·0,99583… = 6970,83 → 6970
    expect(repByPosition(7000, 46, 24, 2, 12)).toBe(6970);
    expect(repByPosition(7000, 60, 24, 2, 12)).toBe(6970);
  });
});
