import { describe, expect, it } from 'vitest';
import { movePlacement } from '../src/game/state';
import type { GameState, Player } from '../src/game/types';

// staff +0x5e ved klubskiftet 0x8c9720 @0x8ca7d9–0x8ca81f: computerens køber sætter ham altid på førsteholdet (1); menneskets klub med
// reservehold sætter ham på reserverne (2), når den nye kontrakts trupstatus er 0 eller over 4 (Prospect/Young/Surplus)
const g = {
  dbKind: 'cm0102', dbYear: 2001, season: 2001, options: { mode: 'authentic' },
  clubs: { 1: { id: 1, name: 'Leeds', short: 'Leeds', nation: 0, manager: 0 }, 2: { id: 2, name: 'Arsenal', short: 'Arsenal', nation: 0, manager: -1 } }, nations: [{ name: 'England' }],
} as unknown as GameState;
const mk = (club: number, squadStatus?: string): Player => ({ id: 9, club, reserves: true, cmPlace: 1, squadStatus }) as unknown as Player;
const place = (p: Player) => [p.reserves, p.cmPlace];

describe('klubskiftets førstehold/reservehold (staff +0x5e)', () => {
  it('computerens køber: førsteholdet – også sælgerens reservespiller', () => {
    for (const s of [undefined, 'key', 'young', 'surplus']) { const p = mk(1, s); movePlacement(g, p); expect(place(p)).toEqual([undefined, 2]); }
  });
  it('menneskets køber: reserverne ved trupstatus 0 eller > 4, ellers førsteholdet', () => {
    const cases: [string | undefined, boolean][] = [[undefined, true], ['key', false], ['first', false], ['rotation', false], ['backup', false], ['prospect', true], ['young', true], ['surplus', true]];
    for (const [s, res] of cases) { const p = mk(2, s); movePlacement(g, p); expect(place(p)).toEqual(res ? [true, 1] : [undefined, 2]); }
  });
});
