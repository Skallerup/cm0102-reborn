import type { GameState } from './types';

/** League::update_table_positions 0x684cd0 (cmBoardGame.ts updateTablePositions) og modulerne, den kalder ud til – her, så ingen af dem skal
 *  importere hinanden (cmMedia.ts og cmNonLeague.ts registrerer sig) */
export const tableStatusHooks: {
  /** ny status → vt+0x40 0x686670 → ligaens vt+0x44: Staff_Records (cmMedia.ts) */
  on?: (g: GameState, lid: string, club: number, status: 5 | 0 | 3) => void;
  /** cmNonLeague.ts cmNonLeagueRelegated: has_relegation +0xc1 for en liga uden kørende liga under (Third Division 1) */
  relegated?: (g: GameState, lid: string) => number;
} = {};
