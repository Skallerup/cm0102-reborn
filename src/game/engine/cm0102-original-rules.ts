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

import { crtPow } from './crtMath';
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
/** F x K has a FLOOR of 50 for type 44 and 100 for type 47 (sub_6e9820: fcom/test ah,0x41/je keeps F·K only when it is larger).
 *  confirmed – corrected 11/11-2026 (it was read as a cap). */
export const FOUL_FK_FLOOR = { 44: 50, 47: 100 } as const;
export const FOUL_K_RARELY = { 1: 10000, 12: 150, 35: 150, 36: 150, 21: 150, 56: 150, 19: 75, 33: 75, 34: 75, 41: 100 } as const;
export function foulGiven(rand: Rand, factor: number, type: number): boolean {
  const usually = (FOUL_K_USUALLY as Record<number, number>)[type];
  if (usually !== undefined) {
    const floor = (FOUL_FK_FLOOR as Record<number, number>)[type] ?? -Infinity;
    return rand(Math.max(floor, Math.trunc(factor * usually))) !== 0;
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
/** Severity of a foul – MatchSim's simplified form (src/game/engine/match.ts; kept unchanged so that engine does not change).
 *  NB the original adds the bias only to some types and the early-minute rule only to some (see `judgeTackle`, which is exact). */
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
 * Professional foul ("serious", the clear-chance flag from sub_6c87e0): r = rand(3000): r > 375 red; 51..375 yellow;
 * 0..50 yellow only when the offender stands in his own box (sub_6f5b20), otherwise no card – corrected 11/11-2026 (was reversed).
 * Otherwise red if severity > rand(15) + 7, yellow if severity > rand(6). A second yellow is a red. No card while match+0x8eb3 is set.
 */
export function cardFor(rand: Rand, severity: number, professional = false, inOwnBox = false): 'red' | 'yellow' | null {
  if (professional) {
    const r = rand(3000);
    if (r > 375) return 'red';
    if (r <= 50) return inOwnBox ? 'yellow' : null;
    return 'yellow';
  }
  if (severity > rand(15) + 7) return 'red';
  if (severity > rand(6)) return 'yellow';
  return null;
}
// ---------------------------------------------------------------- the referee, exact (sub_6e9820 / sub_6ea4e0)

/** sub_6cb650: the "hard"/illegal challenge types (37, 42..50, 96, 97). confirmed */
export const isHardChallenge = (type: number) => type === 37 || (type >= 42 && type <= 50) || type === 96 || type === 97;
/** Negative n as in utils_random (0x90cfc0): 0..n+1 (never positive); n = 0 → 0. confirmed (notes/referee-taker.md) */
const randSigned = (rand: Rand, n: number) => (n < 0 ? -rand(-n) : rand(n));
/** sub_6f5b20(p, side): p stands in the box at end `side` (x 2..6; y 0..1 for side 0, 10..11 for side 1). confirmed */
const inBoxAt = (side: 0 | 1, x: number, y: number) => x >= 2 && x <= 6 && (side === 0 ? y <= 1 : y >= 10);
/** The hurt bonus from the VICTIM's Sportsmanship (sub_6e9820): big for 47/96/19/33/34, small for 44/36. confirmed */
export const hurtBonus = (s: number, big: boolean) => (s === 1 ? (big ? 5 : 3) : s >= 6 ? (s < 10 ? 1 : 0) : big ? 3 : 2);

/** The official (engine+0xf5b2): officials.dat bytes the referee reads, and his mood word (+8). Byte names are "?" except Discipline. */
export interface MatchOfficial { discipline: number; b24: number; b27: number; b28: number; mood: number }
/** The MATCH_PLAYER fields the referee reads and writes (offsets from notes/referee-taker.md). */
export interface FoulPlayer {
  side: 0 | 1; x: number; y: number; isKeeper: boolean;
  fouls: number;          // +0x14 fouls committed
  foulsSuffered: number;  // +0x15
  yellows: number;        // +0x24 (0/1, 2 after a second yellow)
  reasons: [number, number]; // +0x25/+0x26 card reason codes
  b16: number;            // +0x16 (?)
  w31: number;            // +0x31 temper word (?)
  agitation: number;      // +0x1a2
  temperCount: number;    // +0xff
  grudge: FoulPlayer | null; // +0x1a6
  rating: number;         // +0x35 (x1000)
  sportsmanship: number; temperament: number; // staff +0x5c / +0x5d (raw 1..20)
}
export interface JudgeContext { official: MatchOfficial | null; minute: number; teamFouls: number; teamByte?: number; competitionBias?: boolean; incidentPending?: boolean }
export interface JudgeResult { ret: 0 | 1 | 7; kind: number; severity: number; hurt: boolean }

/**
 * MATCH_OFFICIAL::judge_tackle (sub_6e9820). confirmed (notes/referee-taker.md §1, complete). Returns 0 = no foul, 1 = foul (the card
 * rule follows), 7 = foul that never brings a card (43, 12). `action` is the victim's action code (0x6c = passing; −1 from move_to).
 * Side effects as in the original: official.mood, offender.w31, victim.w31/agitation/temperCount/grudge.
 */
export function judgeTackle(rand: Rand, ctx: JudgeContext, offender: FoulPlayer, victim: FoulPlayer, type: number, action = -1): JudgeResult {
  let sev = 0, ret: 0 | 1 | 7 = 0, kind = 0, F = 1;
  const out = (): JudgeResult => ({ ret, kind, severity: sev, hurt });
  let hurt = false;
  if (ctx.incidentPending) return out();                          // sub_6bab90
  const ref = ctx.official;
  if (ref && rand(ref.b28 + 15) === 0) { ref.mood -= 250; return out(); } // he does not see it
  const minute = ctx.minute;
  if (ref) ref.mood += 175;
  const inBox = inBoxAt(0, offender.x, offender.y) || inBoxAt(1, offender.x, offender.y);
  if (ref && (type === 42 || type === 12 || type === 21) && !inBox && rand(50 - ref.b24) === 0) { ref.mood += 25; return out(); }
  if (inBox && (type === 42 || type === 12 || type === 46 || type === 21) && rand(3) !== 0) return out();
  const inOwn = inBoxAt(offender.side, offender.x, offender.y);
  const n = Math.trunc(((inOwn ? 5 : 20) * crtPow(victim.sportsmanship, 1.5)) / (victim.grudge === offender ? 3 : 1));
  hurt = rand(n) === 0;
  if (hurt) victim.w31 -= 4;
  let bias = 0;
  if (ref) {
    const D = ref.discipline;
    F = D > 10 ? D * 0.1 : (D - 10) * 0.05 + 1;
    F += (ctx.teamByte ?? 0) / (ref.b27 * 0.5 + 3);
    if (offender.yellows !== 0) sev += -Math.trunc(rand(21 - D) / 5);
    if (hurt) F *= 1.5 - 0.05 * rand(ref.b28);
    bias = refereeCardBias(D);
    if (ctx.teamFouls > ref.b27 + 5) { ref.mood -= 150; bias++; F *= (6 - rand(4)) * 0.1 + 1; }
  }
  if (ctx.competitionBias) bias--;                                // sub_5c6710 (which competition: ?)
  F = clamp(F, 0.1, 10);
  const fouls = offender.fouls;
  const s = victim.sportsmanship;
  const early = (m: number) => { if (minute < m) sev = randSigned(rand, sev); };
  const usually = (k: number, floor = -Infinity) => rand(Math.max(floor, Math.trunc(F * k))) === 0; // true = waved on
  const rarely = (k: number) => rand(Math.trunc(k / F)) !== 0;                                     // true = not given
  END: {
    switch (type) {
      case 42: offender.w31 -= 4; if (usually(6)) break END; ret = 1; sev += rand(fouls) + 4; kind = 4; early(10); break;
      case 43: offender.w31 -= 3; if (usually(14)) break END; ret = 7; sev += rand(fouls) + 3; kind = 4; early(15); break;
      case 44: offender.w31 -= 12; if (usually(10, 50)) break END; ret = 1; sev += rand(fouls + 20) + bias + 9; kind = 10;
        if (hurt) sev += hurtBonus(s, false); break;
      case 45: offender.w31 -= 4; if (usually(20)) break END;
        if (inOwn && rand(18) !== 0) { early(6); break END; }         // a penalty is avoided 17/18
        ret = 1; sev += rand(fouls) + bias + 4; kind = 7; early(6); break;
      case 46: offender.w31 -= 1;
        if (usually(6) && !(victim.isKeeper && rand(100) !== 0)) break END;
        ret = 1; sev += rand(fouls) + bias + 1; kind = 4; early(10); break;
      case 47: offender.w31 -= 9; if (usually(10, 100)) break END; ret = 1; sev += rand(fouls) + bias + 9; kind = 5;
        if (hurt) sev += hurtBonus(s, true); break;
      case 95: offender.w31 -= 12; if (usually(10)) break END; ret = 1; sev += rand(fouls + 7) + bias + 3; kind = 5; break;
      case 96: offender.w31 -= 25; if (usually(20)) break END; ret = 1; sev += rand(fouls + 20) + bias + 9; kind = 5;
        if (hurt) sev += hurtBonus(s, true); break;
      case 97: offender.w31 -= 25; if (usually(2)) break END; ret = 1; sev += rand(fouls) + bias + 20; kind = 5; break;
      case 48: offender.w31 -= 100; if (usually(500)) break END; ret = 1; sev += rand(fouls) + bias + 20; kind = 11; break;
      case 49: offender.w31 -= 200; if (usually(1000)) break END; ret = 1; sev += rand(fouls + 10) + bias + 20; kind = 11; break;
      case 50: offender.w31 -= 60; if (usually(1000)) break END; ret = 1; sev += rand(fouls) + bias + 18; kind = 11; break;
      case 19: case 33: case 34:
        if (rarely(75)) { if (action !== 0x6c) break END; if (rand(hurt ? 2 : 6) !== 0) break END; }
        if (inOwn && rand(Math.trunc(18 / F)) !== 0) break END;
        ret = 1; sev += rand(fouls) + rand(5) + bias; kind = 7; if (hurt) sev += hurtBonus(s, true); break;
      case 35: if (rarely(150)) break END; ret = 1; sev += rand(fouls) + 1; kind = 4; break;
      case 12: if (rarely(150)) break END; ret = 7; sev += rand(fouls) + 1; kind = 4; break;
      case 36: if (rarely(150)) break END; ret = 1; sev += rand(fouls) + 1; kind = 4; if (hurt) sev += hurtBonus(s, false); break;
      case 21: case 56:
        if (rarely(150) && !(victim.isKeeper && rand(5) === 0)) break END;
        ret = 1; sev += rand(fouls) + 1; kind = 4; early(15); break;
      case 41: if (rarely(100)) break END; ret = 1; sev += rand(fouls) + 2; kind = 7; early(10); break;
      case 1: if (rarely(10000)) break END; ret = 1; sev += rand(fouls) + 1; kind = 4; early(10); break;
      default: break;                                              // no foul for the other types
    }
  }
  // the victim gets worked up (sub_716450 / sub_7164b0)
  if (isHardChallenge(type)) {
    // 0x716450 (sikker, player-state-bytes.md §1): max(ag·f, gulvet 2·(25 − Temperament)), loft 100 – før stod der min(…)
    victim.agitation = Math.min(Math.max(victim.agitation * (sev * 0.2 + 1), 2 * (25 - victim.temperament)), 100);
    if (rand(110 - Math.trunc(victim.agitation)) === 0) {
      victim.temperCount++;
      if (rand(110 - Math.trunc(victim.agitation)) === 0) victim.grudge = offender;
    }
  }
  return out();
}

/**
 * MATCH_OFFICIAL::decide_foul_punishment (sub_6ea4e0). confirmed (§2). `code` in: 1 or 7 from judgeTackle; out: 1 no card, 7 no card
 * (never a card), 2 yellow, 3 second yellow (off), 4 red for severity, 5 red (serious = professional foul). `serious` = the clear-chance
 * flag from sub_6c87e0; `flag8` → offender.b16 on a red for severity. Ratings on the ×1000 scale. `addTeamFoul` = match+0xf5c9+54·side.
 */
export function decideFoulPunishment(rand: Rand, ctx: { minute: number; shootout?: boolean; addTeamFoul: () => void }, offender: FoulPlayer & { active?: boolean },
  victim: FoulPlayer, code: number, kind: number, severity: number, serious: boolean, flag8 = false): { code: number; weight: number } {
  let weight = 1.5;
  if (offender.active === false) return { code, weight: 10 };
  const count = () => { offender.fouls++; victim.foulsSuffered++; };
  const setReason = (k: number) => { if (offender.yellows) offender.reasons[1] = k; else offender.reasons[0] = k; };
  const yellow = () => {
    const m = ctx.minute;
    offender.rating += Math.trunc(-225 * (m > 45 ? 45 / m : 1));
    if (offender.yellows !== 0) { offender.yellows++; code = 3; weight = 3.5; offender.reasons[1] = kind; }
    else { offender.yellows = 1; code = 2; weight = 2; offender.reasons[0] = kind; }
    count();
  };
  if (code === 7) { weight = 1.25; ctx.addTeamFoul(); count(); return { code, weight }; }
  if (code !== 1 || ctx.shootout) return { code, weight };
  ctx.addTeamFoul();
  if (serious) {
    const r = rand(3000);
    if (r > 375) { offender.rating -= 750; code = 5; weight = 5; setReason(9); count(); return { code, weight }; }
    if (r <= 50 && !inBoxAt(offender.side, offender.x, offender.y)) { count(); return { code, weight }; }
    yellow(); return { code, weight };
  }
  if (severity > rand(15) + 7) { offender.rating -= 1000; code = 4; weight = 5; setReason(kind); if (flag8) offender.b16 = 1; count(); return { code, weight }; }
  if (severity > rand(6)) { yellow(); return { code, weight }; }
  offender.rating -= 25; count();
  return { code, weight };
}

/**
 * MATCH_OFFICIAL::card_without_victim (sub_6eab60, via sub_6cfd40). confirmed (asm 11/11). A card decision without a victim – used by
 * advantage_foul (sub_716c90, kind 6). sev = rand(fouls) + discipline step (D > 18 +2, > 12 +1, ≤ 6 −1, ≤ 2 −2) + per kind (1/6: +4 reason 5,
 * 2: +10 reason 8, 3: +7 reason 1, 4/5: +100 reason 12). Booked and kind 1/6: rand(official+0x24) ≠ 0 → 9 (no card). kind ≠ 1:
 * red (4, rating −1000) when sev > rand(15) + 7; otherwise yellow/second yellow (2/3, rating −225·min(1, 45/minute)) when
 * sev > rand(3·yellows + 5) + 2, else 9. `flag` (arg4) or an offender off the pitch: no card. Returns the code (1 = untouched).
 */
export function cardWithoutVictim(rand: Rand, official: MatchOfficial | null, p: FoulPlayer & { active?: boolean }, kind: number,
  minute: number, flag = false): number {
  let sev = rand(p.fouls);
  if (official) { const D = official.discipline; sev += D > 18 ? 2 : D > 12 ? 1 : D > 6 ? 0 : D > 2 ? -1 : -2; }
  let reason = 0;
  if (kind === 1 || kind === 6) { sev += 4; reason = 5; } else if (kind === 2) { sev += 10; reason = 8; }
  else if (kind === 3) { sev += 7; reason = 1; } else if (kind === 4 || kind === 5) { sev += 100; reason = 12; }
  if (p.yellows && (kind === 1 || kind === 6) && rand(official ? official.b24 : 0) !== 0) return 9;
  const on = p.active !== false && !flag;
  // +0x23 (rødt kort-tælleren, "?") + +0x24: summen 0/1 → årsagen i +0x25, ellers +0x26 (vi har ikke +0x23 → 0)
  const setReason = (first: boolean) => { if (first) p.reasons[0] = reason; else p.reasons[1] = reason; };
  if (kind !== 1 && sev > rand(15) + 7) {
    if (!on) return 1;
    p.rating -= 1000; setReason(p.yellows === 0); return 4;
  }
  if (sev > rand(3 * p.yellows + 5) + 2) {
    if (!on) return 1;
    p.rating += Math.trunc(-225 * (minute > 45 ? 45 / minute : 1));
    const code = p.yellows ? 3 : 2;
    p.yellows = p.yellows ? p.yellows + 1 : 1;
    setReason(p.yellows === 1); return code;
  }
  return on ? 9 : 1;
}

/** The quick simulation's cards: R is the side's aggression total (sub_6beeb0). confirmed */
export const quickSim = {
  foul: (rand: Rand, r: number) => rand(r) > rand(1600),
  red: (rand: Rand, r: number) => rand(r) > rand(25000),
  yellow: (rand: Rand, r: number) => rand(r) > rand(1700),
};

// ---------------------------------------------------------------- shots and keepers

/** On target if the shot score S beats 240 (sub_702050). confirmed. A penalty's score is rand(5 v) + 150 (`penaltyShotScore`), so
 *  every penalty is on target and the keeper decides; the old "120 for penalties" limit meant nothing (Bosman, 9/11-2026) */
export const onTarget = (s: number, penalty = false) => penalty || s > 240;
/** A penalty's shot score: rand(5 v) + 150, v = the taker's penalty value (sub_700bd0). confirmed */
export const penaltyShotScore = (rand: Rand, v: number) => rand(5 * v) + 150;
/** Keeper value K' from the raw K: 0.5714 K + w / 6 + 20 (sub_700420). confirmed (w = the keeper's weighted save term) */
export const keeperValue = (k: number, w: number) => 0.5714 * k + w / 6 + 20;
/**
 * Goal if 100 S / (S + K') > 71 (float 0x96d808; sub_702050 at 0x706cba). confirmed.
 * In competitions of type 2 or 8 the ratio gets +2 (0x9689a8) only while it is at most 68 (0x96d80c, `je` at 0x706cfa) –
 * so the bonus never makes a goal (corrected 9/11-2026; it was "above 68").
 */
export function isGoal(s: number, keeper: number, compTypeBonus = false): boolean {
  let ratio = (100 * s) / (s + keeper);
  if (compTypeBonus && ratio <= 68) ratio += 2;
  return ratio > 71;
}
/** Distance penalty on the shot score, eased by Long Shots in the original (sub_700bd0). confirmed */
export const shotDistancePenalty = (d: number) => Math.min(30000, crtPow(0.6 * d + 1.5, 7));
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

// ---------------------------------------------------------------- corrections for a future 1:1 engine (Bosman 9/11-2026)
/** AI mode 5 (match+0x1ab+side) = "slow the game down when well ahead": the ball carrier shoots LESS. confirmed */
export const AI_MODE_EASE = 5;
/** sub_6cb9b0 = "in a crossing position": wide, in the last 3 rows, more than 1.5 cells from the goal mouth. confirmed (not a blocked-path test) */
export const IN_CROSSING_POSITION = 'sub_6cb9b0';
/** sub_713e90 picks the foot: 0 left, 1 right, 2 dead ball; player +0x2c = preferred foot, +0x2d = 20 − weak-foot value. confirmed (not a line-of-sight test) */
export const FOOT = { left: 0, right: 1, deadBall: 2 } as const;
/** Player +0x37 in the match = position adaptation (≤ 0, smaller with Versatility), not form. confirmed */
export const POSITION_ADAPTATION_OFFSET = 0x37;

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
  if (columnsBeyondLine === -1) return rand(Math.trunc(crtPow(v, 3) + 25)) === 0;
  if (columnsBeyondLine === 0) return rand(3) !== 0 && v < rand(18);
  return v < rand(100);
}
export const linesmanMisses = (rand: Rand, official29: number) => rand(official29 + 25) === 0;
