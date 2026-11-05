/**
 * CM 01/02 match-engine rules, read from the original program (cm0102.exe 3.9.68).
 *
 * Drop-in helpers for the browser game cm0102reborn (src/game/engine/match.ts).
 * No dependencies. Each rule names the function in cm0102.exe it comes from
 * (the Mac version cm0102_recomp has the same functions as `_f_00xxxxxx`).
 * "confirmed" = read from the code; "inferred" = the code's shape is known but a
 * detail (a scale or a meaning) is not. See README.md in this folder.
 *
 * `Rand` mirrors the original's random function sub_90cfc0(n): an integer 0..n-1
 * (0 when n <= 0).
 */

export type Rand = (n: number) => number;

/** Wraps a 0..1 generator (e.g. the game's Rng) as the original's rand(n). */
export function randFrom(next01: () => number): Rand {
  return (n: number) => (n <= 0 ? 0 : Math.floor(next01() * n));
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---------------------------------------------------------------- clock

/** 11 ticks per game minute; one pass of the main loop is one tick (sub_6b98c0). confirmed */
export const TICKS_PER_MINUTE = 11;
/** Period ends in ticks: 45', 90', 105', 120' (sub_6bd930). confirmed */
export const PERIOD_END_TICKS = [495, 990, 1155, 1320] as const;

/**
 * A dead ball (foul, corner, goal kick, goal, substitution, injury…): the clock
 * jumps r = rand(10) ticks and stoppage time grows by rand(int(0.8 r)) ticks (sub_6b98c0). confirmed
 */
export function deadBall(rand: Rand): { clockTicks: number; stoppageTicks: number } {
  const r = rand(10);
  return { clockTicks: r, stoppageTicks: rand(Math.floor(0.8 * r)) };
}
/** Added minutes shown for a half from the stoppage ticks collected in it. inferred (rounding) */
export const addedMinutes = (stoppageTicks: number) => Math.ceil(stoppageTicks / TICKS_PER_MINUTE);

// ---------------------------------------------------------------- attributes

/**
 * The 1..20 value the original shows for a technical/mental attribute (sub_544380,
 * called by the UI getter sub_543540). Constants 0.05, 10, 0.1, 1/3, 0.5 are read from
 * 0x967888, 0x9688b0, 0x967880, 0x968a80, 0x968968. confirmed.
 * For goalkeepers (GK rating 20) the outfield attributes use 0.1 x CA instead of CA. confirmed
 */
export function shownAttribute(ca: number, intrinsic: number, goalkeeperOutfieldAttr = false): number {
  const t = ((goalkeeperOutfieldAttr ? 0.1 * ca : ca) + 2 * intrinsic) * 0.05 + 10;
  return Math.trunc(clamp((0.1 * t * t + t) / 3 + 0.5, 1, 20));
}

/**
 * The inverse: the intrinsic value that shows `shown` at ability `ca`. Use it once when a
 * game starts so that a player's technical attributes then rise and fall with his CA,
 * as in the original. inferred (that the original stores intrinsic values; the algebra is exact)
 */
export function intrinsicFromShown(ca: number, shown: number): number {
  // aim at the middle of the shown value's band: (0.1 t² + t) / 3 + 0.5 = shown + 0.5
  const t = (-1 + Math.sqrt(1 + 1.2 * shown)) / 0.2;
  return ((t - 10) / 0.05 - ca) / 2;
}

/** Physical attributes in the match: attr x 0.5 + 0.2; Pace and Acceleration attr x 2/3 + 0.2 (sub_6ec010). confirmed (softening above 12 not included) */
export const matchPhysical = (attr: number, paceOrAcceleration = false) => attr * (paceOrAcceleration ? 2 / 3 : 0.5) + 0.2;

// ---------------------------------------------------------------- team instructions

/** Opponent challenge weight per tackling instruction (sub_6c87e0). confirmed */
export const TACKLING_WEIGHT = { easy: 0.5, normal: 2, hard: 4 } as const;
/** Multipliers on a defender's challenge weight (sub_6c87e0). confirmed */
export const CHALLENGE = { farFromGoal: 0.05, marking: 2.25, closingDown: 2 } as const;
/** Shift of the [short option, long option] weights per passing instruction (sub_6c6a30). confirmed */
export const PASSING_SHIFT = {
  mixed: [0, 0],
  short: [250, -250],
  direct: [-750, 500],
  long: [-1000, 1000],
} as const;
/**
 * The original's team instruction bits at team+0x584 (tactics screen sub_8a2db0). confirmed.
 * Pressing, offside trap, counter attack and men behind ball come in pairs (0x80/0x100,
 * 0x200/0x400, 0x800/0x1000, 0x2000/0x4000); that the second bit means "on" is inferred.
 */
export const TEAM_FLAGS = {
  passingMixed: 0x1, passingShort: 0x2, passingDirect: 0x4, passingLong: 0x8,
  tacklingNormal: 0x10, tacklingEasy: 0x20, tacklingHard: 0x40,
  pressing: 0x100, offsideTrap: 0x400, counterAttack: 0x1000, menBehindBall: 0x4000,
  defensive: 0x8000, attacking: 0x10000, normal: 0x20000,
} as const;

// ---------------------------------------------------------------- referee and cards

/**
 * Strictness from the referee's Discipline (officials.dat byte 0x25, 1..20) (sub_6e9820). confirmed.
 * Discipline 1 → 0.55, 10 → 1.0, 15 → 1.5, 20 → 2.0.
 */
export function refereeFactor(discipline: number): number {
  const f = discipline > 10 ? discipline * 0.1 : 1 + (discipline - 10) * 0.05;
  return clamp(f, 0.1, 10);
}
/**
 * Whether the referee blows for a challenge (sub_6e9820, jump table at 0x6ea420/0x6ea470). confirmed.
 * Two groups of challenge types:
 * - "usually given": waved on only if rand(int(F x K)) == 0;
 * - "rarely given": given only if rand(int(K / F)) == 0.
 * F is the referee factor (with the modifiers in `refereeFactorInMatch`).
 */
export const FOUL_K_USUALLY = { 42: 6, 43: 14, 44: 10, 45: 20, 46: 6, 47: 10, 48: 500, 49: 1000, 50: 1000, 95: 10, 96: 20, 97: 2 } as const;
/** F x K is capped at 50 for type 44 and at 100 for type 47 (sub_6e9820). confirmed */
export const FOUL_FK_CAP = { 44: 50, 47: 100 } as const;
export const FOUL_K_RARELY = { 1: 10000, 12: 150, 35: 150, 36: 150, 21: 150, 56: 150, 19: 75, 33: 75, 34: 75, 41: 100 } as const;
export function foulGiven(rand: Rand, factor: number, type: number): boolean {
  const usually = (FOUL_K_USUALLY as Record<number, number>)[type];
  if (usually !== undefined) {
    const cap = (FOUL_FK_CAP as Record<number, number>)[type] ?? Infinity;
    return rand(Math.trunc(Math.min(cap, factor * usually))) !== 0;
  }
  const rarely = (FOUL_K_RARELY as Record<number, number>)[type];
  if (rarely !== undefined) return rand(Math.trunc(rarely / factor)) === 0;
  return false;
}
/**
 * The referee factor inside a match (sub_6e9820). confirmed:
 * F = refereeFactor(D) + teamByte / (0.5 x official[0x27] + 3); when the team has more fouls
 * than official[0x27] + 5, F x= 1 + 0.1 x (6 - rand(4)) (1.3–1.6) and the card bias gets +1.
 * Clamped to 0.1..10. `teamByte` is match+0x1ad+side (meaning not identified; 0 if unknown).
 */
export function refereeFactorInMatch(rand: Rand, discipline: number, foulLimit27: number, teamFouls: number, teamByte = 0): { factor: number; overLimit: boolean } {
  let f = refereeFactor(discipline) + teamByte / (0.5 * foulLimit27 + 3);
  const overLimit = teamFouls > foulLimit27 + 5;
  if (overLimit) f *= 1 + 0.1 * (6 - rand(4));
  return { factor: clamp(f, 0.1, 10), overLimit };
}
/** Card bias from Discipline (sub_6e9820). confirmed: 20 → +2, 18–19 → +1, 10–17 → 0, 5–9 → −1, 3–4 → −2, ≤2 → −3 */
export function refereeCardBias(discipline: number): number {
  if (discipline >= 20) return 2;
  if (discipline >= 18) return 1;
  if (discipline >= 10) return 0;
  if (discipline >= 5) return -1;
  if (discipline >= 3) return -2;
  return -3;
}
/**
 * (a, b) in severity = rand(player's fouls this match + a) + b + bias, by challenge type (sub_6e9820).
 * confirmed for these types; types 12 and 43 never bring a card.
 */
export const SEVERITY_AB = { 42: [0, 4], 44: [20, 9], 48: [0, 20], 97: [0, 20], 49: [10, 20] } as const;
/** Minute before which severity is replaced by rand(severity): 10, but 6 for type 45 and 15 for types 43/21/56 (sub_6e9820). confirmed */
export const earlySeverityMinute = (type: number) => (type === 45 ? 6 : type === 43 || type === 21 || type === 56 ? 15 : 10);
/** Severity of a foul (sub_6e9820). confirmed except the extra −1 under sub_5c6710 and the hurt-flag bonus (+1..+5). */
export function cardSeverity(rand: Rand, type: number, playerFouls: number, discipline: number, booked: boolean, minute: number, overLimit: boolean): number {
  const [a, b] = (SEVERITY_AB as Record<number, readonly [number, number]>)[type] ?? [0, 4];
  let sev = rand(playerFouls + a) + b + refereeCardBias(discipline) + (overLimit ? 1 : 0);
  if (booked) sev -= Math.trunc(rand(21 - discipline) / 5);
  if (minute < earlySeverityMinute(type)) sev = rand(sev);
  return sev;
}
/** A professional foul is red when rand(3000) > 375 (87.47 %) (sub_6ea4e0 at 0x6ea57d). confirmed */
export const PROFESSIONAL_FOUL_RED = 2624 / 3000;
/**
 * Card for a foul (sub_6ea4e0). confirmed.
 * Professional foul: r = rand(3000): r > 375 red; r <= 50 yellow; 51..375 yellow only if
 * sub_6f5b20 (a box check) is true. Otherwise red if severity > rand(15) + 7, yellow if
 * severity > rand(6). A second yellow is a red. No card at all while match+0x8eb3 is set.
 */
export function cardFor(rand: Rand, severity: number, professional = false, inBox = false): 'red' | 'yellow' | null {
  if (professional) {
    const r = rand(3000);
    if (r > 375) return 'red';
    if (r <= 50 || inBox) return 'yellow';
    return null;
  }
  if (severity > rand(15) + 7) return 'red';
  if (severity > rand(6)) return 'yellow';
  return null;
}
/** The quick simulation's cards: R is the side's aggression total (sub_6beeb0). confirmed */
export const quickSim = {
  foul: (rand: Rand, r: number) => rand(r) > rand(1600),
  red: (rand: Rand, r: number) => rand(r) > rand(25000),
  yellow: (rand: Rand, r: number) => rand(r) > rand(1700),
};

// ---------------------------------------------------------------- shots and keepers

/** On target if the shot score S beats 240 (120 for penalties) (sub_702050). confirmed */
export const onTarget = (s: number, penalty = false) => s > (penalty ? 120 : 240);
/** Keeper value K' from the raw K: 0.5714 K + w / 6 + 20 (sub_700420). confirmed (w = the keeper's weighted save term) */
export const keeperValue = (k: number, w: number) => 0.5714 * k + w / 6 + 20;
/**
 * Goal if 100 S / (S + K') > 71 (float 0x96d808; sub_702050 at 0x706cba). confirmed.
 * In competitions of type 2 or 8 the ratio gets +2 (0x9689a8) once it is above 68 (0x96d80c).
 */
export function isGoal(s: number, keeper: number, compTypeBonus = false): boolean {
  let ratio = (100 * s) / (s + keeper);
  if (compTypeBonus && ratio > 68) ratio += 2;
  return ratio > 71;
}
/** Distance penalty on the shot score, eased by Long Shots in the original (sub_700bd0). confirmed */
export const shotDistancePenalty = (d: number) => Math.min(30000, Math.pow(0.6 * d + 1.5, 7));
/** Bonus for shots from distance band 0 / 1 (sub_700bd0). confirmed */
export const shotCloseBonus = (d: number) => (d === 0 ? 200 : d === 1 ? 100 : 0);
/** Fatigue term in the shot score: rand((10000 - condition)² / 50000), condition 0..10000 (sub_700bd0). confirmed */
export const shotFatigue = (rand: Rand, condition: number) => rand(Math.trunc(((10000 - condition) ** 2) / 50000));
/** Penalty-taking skill from the ×10 Penalties value: (pen10 + 200) / 2 (sub_700bd0). confirmed */
export const penaltySkill = (pen10: number) => (pen10 + 200) / 2;

// ---------------------------------------------------------------- ratings

/**
 * Ratings on a ×1000 scale. confirmed:
 * - start 6100 (reset _f_006eada0); players outside the starting eleven start at 6400 (sub_6eaea0 at 0x6eb097)
 * - goal +650 (+700 for shot type 0x33), assist +275, keeper good save +350, great save +600 (sub_702050)
 * - foul with no card −25, straight red −1000, red for a professional foul −750 (sub_6ea4e0)
 * - shown at full time as round(total / 1000), clamped 1..10 (sub_6ce460)
 */
export const RATING = {
  start: 6.1, startSubstitute: 6.4, goal: 0.65, goalShotType33: 0.7, assist: 0.275,
  goodSave: 0.35, greatSave: 0.6, foulNoCard: -0.025, yellow: -0.225, red: -1.0, redProfessional: -0.75,
} as const;
export const ratingShown = (rating: number) => clamp(Math.floor(rating + 0.5), 1, 10);
/** Yellow card: −225 × (1 up to 45', then 45 / minute) (sub_6ea4e0; floats 0x968e70, 0x96d64c, 0x96d648). confirmed */
export const yellowRatingDelta = (minute: number) => RATING.yellow * (minute > 45 ? 45 / minute : 1);

// ---------------------------------------------------------------- fitness and injuries

/** Age offset in the stamina factor (sub_6f56c0). confirmed */
export function ageOffset(age: number): number {
  if (age < 20) return 6.75;
  if (age <= 23) return 7.25;
  if (age <= 29) return 7.5;
  if (age <= 33) return 7.0;
  return 5.75;
}
/** Stamina factor = 0.65 x Stamina + age offset (sub_6f56c0). confirmed */
export const staminaFactor = (stamina: number, age: number) => 0.65 * stamina + ageOffset(age);
/**
 * Condition (0..10000) lost per action: (200 - 8.5 x factor) x c, c = 0.164 / 0.382 / 0.545 by
 * action type (sub_6f56c0). confirmed. In the original, movement drain also scales with the
 * current condition band (not included).
 */
export const ACTION_DRAIN = { light: 0.164, medium: 0.382, heavy: 0.545 } as const;
export const fatigueDrain = (stamina: number, age: number, action: keyof typeof ACTION_DRAIN) =>
  Math.max(0, 200 - 8.5 * staminaFactor(stamina, age)) * ACTION_DRAIN[action];
/** Half-time recovery: + (Natural Fitness + 15) x 10 of 10000, times an age factor (sub_6f5810). confirmed (age factor not included) */
export const halfTimeRecovery = (naturalFitness: number) => (naturalFitness + 15) * 10;

/** Below 4000 of 10000 condition a player breaks down at once (sub_6cfe10). confirmed */
export const INJURY_CONDITION = 4000;
/**
 * Chance of a knock at one check: injured if rand(50000) < 10 x risk, where
 * risk = 4 (6 if already carrying an injury) x 10000 / (0.5 x condition + 5000)
 *        x InjuryProneness / 10 x a match factor (≤ 3) (sub_6cfe10). confirmed shape
 */
export function knock(rand: Rand, condition: number, proneness: number, carrying: boolean, factor = 1): boolean {
  if (condition < INJURY_CONDITION) return true;
  const risk = (carrying ? 6 : 4) * (10000 / (0.5 * condition + 5000)) * (proneness / 10) * Math.min(3, factor);
  return rand(50000) < 10 * risk;
}
/**
 * A knock's outcome (sub_6cfe10 / sub_6d0980). confirmed:
 * severity s = rand(rand(102)); if s > 50 it is re-rolled as rand(rand(76)) two times in three;
 * doubled if he carries an injury and rand(25) != 0. s > 50: injured, condition −= s²;
 * otherwise condition −= rand(s² / 2). He goes off if then condition < 5000, or
 * < 7100 + 25 × InjuryProneness, or he is injured with an injury-type value ≥ 500.
 * Over 6 players forced off in a match: no more knocks; with 4–6 a knock needs rand(count) == 0 or rand(500) == 0.
 * The player who fouled him loses 10 rating points (0.01).
 */
export function knockSeverity(rand: Rand, condition: number, proneness: number, carrying = false): { severity: number; injured: boolean; condition: number; forcedOff: boolean } {
  let s = rand(rand(102));
  if (s > 50 && rand(3) !== 0) s = rand(rand(76));
  if (carrying && rand(25) !== 0) s *= 2;
  const injured = s > 50;
  const left = clamp(condition - (injured ? s * s : rand(Math.trunc((s * s) / 2))), 1, 10000);
  return { severity: s, injured, condition: left, forcedOff: injured || left < 5000 || left < 7100 + 25 * proneness };
}
export const knockAllowed = (rand: Rand, forcedOffSoFar: number) =>
  forcedOffSoFar > 6 ? false : forcedOffSoFar >= 4 ? rand(forcedOffSoFar) === 0 || rand(500) === 0 : true;
/**
 * Where the original checks for knocks: every movement step of each off-ball player
 * (sub_6f09f0 → sub_6cfe10 at 0x6f0b0c), and both players after every challenge (at 0x6f0e75).
 * A fit player with proneness 10 has 40/50000 = 0.08 % per step.
 */
export const KNOCK_CHECKS = 'every off-ball movement step, and after every challenge';

// ---------------------------------------------------------------- computer manager

/**
 * After 60', with chance 1/6 per tick, the first on-pitch player under 6750 condition gets the
 * "knackered" commentary line (event 655). It is commentary only, NOT a substitution (sub_6c54a0). confirmed
 */
export const knackeredLine = (rand: Rand, minute: number, condition01: number) => minute >= 60 && condition01 < 0.675 && rand(6) === 0;
/**
 * Each tick an AI side looks at a change when minute > 10 + rand(50) (a fresh roll every tick)
 * and more than 5 minutes (55 ticks) passed since its last change (sub_6c54a0 at 0x6c5854 / 0x6c59f9).
 * There is no winning/losing test there. confirmed
 */
export const aiConsidersChange = (rand: Rand, minute: number, minutesSinceLastChange: number) =>
  minute > 10 + rand(50) && minutesSinceLastChange > 5;
/** Kept for older callers: the earliest-minute roll. */
export const tacticalChangeMinute = (rand: Rand) => 10 + rand(50);
export const MIN_MINUTES_BETWEEN_CHANGES = 5;
/**
 * Who comes off: players sorted ascending by int(rating x 1000 + condition) (comparator sub_6e0fe0);
 * players with status −2 and injured players come first. The final pick is in sub_6e2000 (not traced).
 * Mentality / tactic changes have their own 15-minute (165-tick) gate (sub_6df460). confirmed
 */
export const subRankKey = (rating: number, condition10000: number) => Math.trunc(rating * 1000 + condition10000);

// ---------------------------------------------------------------- offside

/**
 * Offside (sub_6ea760). confirmed; v = attacker byte +0x107 (attribute not identified).
 * The linesman misses it entirely if rand(official[0x29] + 25) == 0. Per attacker near the ball's target:
 * 2 columns onside: wrongly flagged if rand(6v + 500) == 0; 1 column onside: if rand(int(v³ + 25)) == 0;
 * level: flagged if rand(3) != 0 and v < rand(18); beyond the line: flagged if v < rand(100).
 */
export function offsideFlag(rand: Rand, columnsBeyondLine: number, v: number): boolean {
  if (columnsBeyondLine <= -2) return rand(6 * v + 500) === 0;
  if (columnsBeyondLine === -1) return rand(Math.trunc(v ** 3 + 25)) === 0;
  if (columnsBeyondLine === 0) return rand(3) !== 0 && v < rand(18);
  return v < rand(100);
}
export const linesmanMisses = (rand: Rand, official29: number) => rand(official29 + 25) === 0;
