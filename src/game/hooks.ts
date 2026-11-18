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
  /** (økonomien, cmFinance.ts) en pokalrunde er afgjort for et par: Cup::process_fixture 0x51a150 → pay_round_prize_money 0x522240 */
  cupTieDone?: (comp: Competition, decider: import('./types').Fixture, winner: number, loser: number) => void;
  /** (økonomien, cmFinance.ts) en præmie i pund til klubben (Finance 0x5999a0 – Prize): Champions Leagues gruppepenge (cmEurope.ts) */
  prize?: (club: number, amount: number) => void;
} = {};

/** (landsholdene, cmIntl.ts) originalens landskampkalender i ægte tilstand – international.ts kalder dem */
/** (ægte tilstand) NationalTeams::get_current_competition 0x7751e0 + turneringens vtable +0x70 for landsholdet (cmNatTeams.ts sætter den) */
export const natCompHook: { fn?: (g: GameState, n: number) => { f: number; t: number } | null } = {};

export const intlHooks: { cmDay?: () => void; dutyNations?: () => number[]; gridOn?: () => boolean;
  /** (ægte tilstand) 0x775cd0: en udtaget spiller skadet i `days` dage (Injury::add_injury 0x62d994) */
  withdraw?: (p: import('./types').Player, days: number, type: number) => void;
  /** (ægte tilstand) landstrænerne i bestyrelsessystemet (cmBoardGame.ts/cmNatTeams.ts): slået til, efter landskampen 0x6951e0, svaret på
   *  forbundets tilbud og fratrædelsen; NationalTeams' turneringer (0x775220 start, 0x775000 ude, 0x775420 færdig med vurderingen) */
  boardOn?: () => boolean;
  boardMatch?: (home: number, away: number, rep: import('./types').MatchReport, kind: string, stage?: string) => void;
  nationalAnswer?: (accept: boolean) => string | null;
  nationalResign?: () => string | null;
  ntStart?: (cls: 'wc' | 'euro' | 'euroq', year: number, teams: number[]) => void;
  ntOut?: (cls: 'wc' | 'euro' | 'euroq', year: number, teams: number[]) => void;
  ntEnd?: (cls: 'wc' | 'euro', year: number, t: import('./international').IntlTournament) => void } = {};

/** (klubøkonomiens begivenheder, cmFinEvents.ts) transferbudgettet 0x598800 med fortegn og betalingsstandsningens værdier 0x59ef0a –
 *  modulerne bag (cmBudget/cmValueGame → cmContractGame) må ikke importeres af cmFinance.ts; sim.ts sætter krogene */
export const finHooks: { budget?: (g: GameState, cid: number) => number | null; receivership?: (g: GameState, cid: number) => void } = {};
