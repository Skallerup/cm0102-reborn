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
} = {};

/** (landsholdene, cmIntl.ts) originalens landskampkalender i ægte tilstand – international.ts kalder dem */
export const intlHooks: { cmDay?: () => void; dutyNations?: () => number[] } = {};

/** (klubøkonomiens begivenheder, cmFinEvents.ts) transferbudgettet 0x598800 med fortegn og betalingsstandsningens værdier 0x59ef0a –
 *  modulerne bag (cmBudget/cmValueGame → cmContractGame) må ikke importeres af cmFinance.ts; sim.ts sætter krogene */
export const finHooks: { budget?: (g: GameState, cid: number) => number | null; receivership?: (g: GameState, cid: number) => void } = {};
