// Kroge mellem moduler, der ellers ville importere hinanden i ring (ingen imports her).
import type { Competition, GameState } from './types';

/** Draft-ligaen registrerer, hvad der sker, når ligaen er færdig */
export const compHooks: {
  draftLeagueDone?: (comp: Competition) => void;
  /** (økonomien, cmFinance.ts) en liga er færdigspillet: League::check_complete 0x689ad0 → pay_prize_money 0x682e10 */
  leagueDone?: (comp: Competition, order: number[]) => void;
  /** (kalenderen, cmEurope.ts) Europas kampe før spilstarten spilles ved nyt spil */
  euroCatchUp?: (g: GameState) => void;
  /** (forkørslen, cmPrerunMatches.ts) dagens europæiske kampe (Intertoto, CL-kvalifikationen) i forkørslen 0x5cc850 */
  euroPrerunDay?: (g: GameState, iso: string) => void;
  /** (sæsonskiftet pr. land, season.ts/cmSeason.ts) turneringernes uspillede kampe før `before` (null = alle) spilles – sim.ts playOverdue */
  playOverdue?: (compIds: string[], before: string | null) => void;
} = {};

/** (landsholdene, cmIntl.ts) originalens landskampkalender i ægte tilstand – international.ts kalder dem */
export const intlHooks: { cmDay?: () => void; dutyNations?: () => number[]; gridOn?: () => boolean;
  /** (ægte tilstand) 0x775cd0: en udtaget spiller skadet i `days` dage (Injury::add_injury 0x62d994) */
  withdraw?: (p: import('./types').Player, days: number, type: number) => void } = {};

/** (klubøkonomiens begivenheder, cmFinEvents.ts) transferbudgettet 0x598800 med fortegn og betalingsstandsningens værdier 0x59ef0a –
 *  modulerne bag (cmBudget/cmValueGame → cmContractGame) må ikke importeres af cmFinance.ts; sim.ts sætter krogene */
export const finHooks: { budget?: (g: GameState, cid: number) => number | null; receivership?: (g: GameState, cid: number) => void } = {};
