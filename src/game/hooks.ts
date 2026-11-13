// Kroge mellem moduler, der ellers ville importere hinanden i ring (ingen imports her).
import type { Competition } from './types';

/** Draft-ligaen registrerer, hvad der sker, når ligaen er færdig */
export const compHooks: {
  draftLeagueDone?: (comp: Competition) => void;
  /** (økonomien, cmFinance.ts) en liga er færdigspillet: League::check_complete 0x689ad0 → pay_prize_money 0x682e10 */
  leagueDone?: (comp: Competition, order: number[]) => void;
} = {};
