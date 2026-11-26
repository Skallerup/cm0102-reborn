import type { GameState, Player } from './types';

/** League::update_table_positions 0x684cd0 (cmBoardGame.ts updateTablePositions) og modulerne, den kalder ud til – her, så ingen af dem skal
 *  importere hinanden (cmMedia.ts og cmNonLeague.ts registrerer sig) */
export const tableStatusHooks: {
  /** ny status → vt+0x40 0x686670 → ligaens vt+0x44: Staff_Records (cmMedia.ts) */
  on?: (g: GameState, lid: string, club: number, status: 5 | 0 | 3) => void;
  /** cmNonLeague.ts cmNonLeagueRelegated: has_relegation +0xc1 for en liga uden kørende liga under (Third Division 1) */
  relegated?: (g: GameState, lid: string) => number;
} = {};

/** Staff_Records' forlængelsestilbud 0x4cda70 (cmMedia.ts' rekorder, cmAwards.ts' priser) → CONTRACT_MANAGER (cmContractManager.ts registrerer
 *  cmContractRenewals) */
export const renewalHooks: { offer?: (g: GameState, ps: Player[]) => void } = {};

/** Staff_Records' managerdel (0x868c50/0x869480/0x86a1c0, club+0xcf → +0x69 +8/+0xa/+0xc): klubbens manager med ikke-spillerpost – omdømmet
 *  [hjemme, aktuel, verden] som reference og nationaliteten (cmBoardGame.ts registrerer; null = ingen manager eller ingen post) */
export const recordMgrHooks: { manager?: (g: GameState, club: number) => { rep: [number, number, number]; nation: number } | null } = {};
