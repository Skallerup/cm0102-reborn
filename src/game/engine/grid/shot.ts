// Kilde: cm-01-02-bosman-edition/app/identical/1b_shot/shot.ts (kopieret 2026-11-09).
// Porteret af Bosman-projektet; ændringer: ingen.
// Gittermotoren (gridMatch.ts) er et laboratorium ved siden af MatchSim – ikke koblet ind i spillet.
/**
 * CM 01/02 – the shot: sub_700bd0 (shot type + shot score) and sub_702050 (outcome),
 * with the keeper value sub_700420 and the foot check sub_713e90.
 * Read statically from cm0102.exe (sha256 0c78e7da…bff86). See SHOT.md.
 * Every constant has its instruction address. `trunc` = MSVC _ftol (sub_945640).
 */

import { crtPow } from '../crtMath';
export type Rand = (n: number) => number; // sub_90cfc0: 0..n-1; n = 0 → 0; n < 0 → n+1..0

/** sub_90cfc0 semantics for a plain Math.random source (the original uses a table RNG). */
export const makeRand = (rnd: () => number = Math.random): Rand => (n) => {
  n = Math.trunc(n);
  if (n === 0) return 0;
  if (n < 0) return -Math.floor(rnd() * -n); // n+1..0
  return Math.floor(rnd() * n);
};

const trunc = Math.trunc;
const A10 = (x: number) => trunc(10 * x + 0.5); // fmul 10.0 (0x9688b0), fadd 0.5 (0x968968)
const T = (x: number) => trunc((x * x + 1) * 0.5); // fadd 1.0 (0x967890), fmul 0.5
const Q = (x: number) => trunc((2 * x * x + 1) * 0.5); // = round(x²), 0x6eff2f
const idiv = (a: number, b: number) => trunc(a / b);

// ---------------------------------------------------------------- shot types

export const SHOT = {
  HEADER: 0x03, BICYCLE: 0x05, LOW_DRIVE: 0x16, HIGH_DRIVE: 0x17, VOLLEY: 0x18,
  HALF_VOLLEY: 0x19, CHIP: 0x1a, LOB: 0x1b, BANANA: 0x1c, HOPE: 0x1d,
  PENALTY: 0x33, FREE_KICK: 0x35, DIVING_HEADER: 0x39, MADE_SURE: 0x3a,
} as const;

/** Match-day attribute floats (≈0..20) used by the shot; field = match-player offset. */
export interface Attrs {
  agility: number;    // +0x79
  balance: number;    // +0x81
  strength: number;   // +0xd9
  technique: number;  // +0xe5
  flair: number;      // +0x9d
  finishing: number;  // +0x99
  heading: number;    // +0xa9
  longShots: number;  // +0xb1
  freeKicks: number;  // +0xa1
  passing: number;    // +0xc5
  penalties: number;  // +0xc9
  leftFoot: number;   // record +0x30 (raw 1..20, not a match float)
  rightFoot: number;  // record +0x3b
}

/**
 * The per-action skill table at +0x11a + 2·code (sub_6eecb0, 0x6ef840–0x6f041f) followed
 * by the post-processing loop 0x6f0428 (case table 0x6f05e8 → 0x6f05c8).
 * f = word +0x37 – rettelse 6: position adaptation (≤ 0, smaller with Versatility, sub_6eecb0 in helpers.ts), not form.
 * TODO: exact scale (built at 0x6eecea–0x6ef5d4).
 */
export function shotSkill(code: number, a: Attrs, f: number): number {
  let v: number;
  switch (code) {
    case SHOT.HEADER: case SHOT.DIVING_HEADER: v = A10(a.heading); break;          // 0x6ef938, 0x6efa3c
    case SHOT.BICYCLE: v = idiv(T(a.agility) + T(a.flair) + T(a.technique) + T(a.balance) + 100, 5); break; // 0x6efa1e
    case SHOT.LOW_DRIVE: case SHOT.HIGH_DRIVE: v = A10(a.finishing); break;       // 0x6efea3, 0x6efec1
    case SHOT.VOLLEY: v = idiv(T(a.technique) + A10(a.finishing), 2); break;      // 0x6eff20
    case SHOT.HALF_VOLLEY: v = idiv(A10(a.technique) + A10(a.finishing), 2); break; // 0x6eff44
    case SHOT.CHIP: case SHOT.LOB:
      v = idiv(Q(a.technique) + A10(2 * a.finishing) + A10(a.passing), 5); break; // 0x6effc3/0x6effca
    case SHOT.BANANA:
      v = idiv(Q(a.technique) + A10(2 * a.finishing) + A10(a.passing) + T(a.flair), 6); break; // 0x6f0009
    case SHOT.HOPE: v = idiv(A10(a.strength) + A10(a.finishing), 2); break;       // 0x6f0035
    case SHOT.PENALTY: v = idiv(A10(a.penalties) + 200, 2); break;                // 0x6f030f
    case SHOT.FREE_KICK: v = T(a.freeKicks); break;                               // 0x6f0357
    case SHOT.MADE_SURE: v = idiv(A10(2 * a.finishing) + 300, 5); break;          // 0x6efac8
    default: throw new Error('not a shot type');
  }
  if (code === SHOT.PENALTY) return trunc(1.8 * v + 50);   // case 5: 0x96d640, 0x968ff8
  if (code === SHOT.MADE_SURE) return trunc(5 * (f + 45) + 0.5 * v); // case 1: 0x6f0447
  return trunc(3 * f + 418 + 0.13 * v);                    // case 2: 0x6f04b1, 0x96d710, 0x96d708
}

/** Keeper skill code 0x27/0x28 (0x6f0255): b = GK position rating rec+0xf → 0x6eecc4. */
export function keeperBase(gkPositionRating: number, handling: number, agility: number, f: number): number {
  const b = gkPositionRating > 15 ? 20 : trunc(0.75 * gkPositionRating + 5); // 0x969040, 0x9688a0
  const v = idiv(T(b) + A10(handling) + A10(agility), 3);
  return trunc(7 * (f + 30) + 0.775 * v); // case 7: 0x6f0479, 0x96a6e8
}

// ---------------------------------------------------------------- sub_700bd0

export interface ShotContext {
  side: 0 | 1;            // +0x27
  x: number; y: number;   // +0x102, +0x103
  D: number;              // distance to goal (table 0xa15e44)
  ballHeight: number;     // match+0x8ea9 (h)
  facingGoal: boolean;    // sub_6f9f90(4, 11|0) or standing in the goal mouth
  creativityRoll: number; // +0x10b
  flairRoll: number;      // +0x109
  condition: number;      // float +0x4d, 0..10000
  w29: number;            // word +0x29 – TODO: meaning unknown
  momentum: number;       // word +0x19c
  form: number;           // word +0x37
  prevAction: number;     // word +0x198
  attrs: Attrs;
  keeper: null | {        // sub_6ce110 – null if no real keeper (sub_6c38c0 ≠ 1)
    x: number; y: number; side: 0 | 1;
    down: number;         // byte +0x2b
    distToShooter: number;
    distToOwnGoal: number;
  };
  weather: number;        // match+0x4756 – TODO: guessed weather 2..4
  matchByte1: number;     // match+1 – TODO: unknown (2, 0x20 used here)
}

export interface ShotScore {
  type: number; score: number; quality?: number /* w39 – skrives kun af scoringen 0x701311–; udeladt = +0x39 uændret */; tightAngle: boolean; fromDistance: boolean;
  /** skudtypens begivenhed (sub_700bd0's andet ud-argument [esp+0x22c], 0x701bd7–0x701fcb) – sub_702050's a3 */
  event: number;
}

/** sub_700bd0 0x701bb8–0x701fa2 (sikker): skudtypens begivenhed efter typen (springtabel 0x702018 → 0x701fe0), "fra vinkel" [esp+0x12]
 *  (0x70179e) og "fra afstand" bl (0x70189b); frisparket uden vinkel/afstand trækker rand(3) (0x701f70): 0 → FREEKICK_OVER_WALL,
 *  ellers SHOT_FREE_KICK. Andre typer → 0x1f81 (8065). */
export function shotEvent(type: number, tightAngle: boolean, fromDistance: boolean, rand: Rand): number {
  const pick = (tight: number, base: number, far: number) => (tight >= 0 && tightAngle ? tight : fromDistance ? base + far : base);
  switch (type) {
    case SHOT.MADE_SURE: return 0x1f9d;                                             // 0x701bd7 SHOT_MADE_SURE
    case SHOT.LOW_DRIVE: return pick(0x1fb0, 0x1f86, 0x1c);                         // 0x701bf3 SHOT_LOW_DRIVE / FROM_ANGLE / FROM_DISTANCE
    case SHOT.CHIP: return pick(0x1fb1, 0x1f89, 0x1a);                              // 0x701c3e
    case SHOT.LOB: return pick(0x1fb3, 0x1f8b, 0x1a);                               // 0x701c89
    case SHOT.BANANA: return pick(0x1fb5, 0x1f8d, 0x1a);                            // 0x701cd4
    case SHOT.HOPE: return pick(0x1fb6, 0x1f8e, 0x1a);                              // 0x701d1f
    case SHOT.BICYCLE: return pick(0x1fb7, 0x1f91, 0x18);                           // 0x701d6a
    case SHOT.HEADER: return pick(0x1fb8, 0x1f92, 0x18);                            // 0x701db5
    case SHOT.VOLLEY: return pick(0x1fb9, 0x1f93, 0x18);                            // 0x701e00
    case SHOT.HALF_VOLLEY: return pick(0x1fba, 0x1f96, 0x16);                       // 0x701e4b
    case SHOT.HIGH_DRIVE: return pick(0x1fbb, 0x1f99, 0x14);                        // 0x701e96
    case SHOT.DIVING_HEADER: return pick(0x1fbc, 0x1f9c, 0x12);                     // 0x701ee1
    case SHOT.FREE_KICK:                                                            // 0x701f2c
      if (tightAngle) return 0x1fbd;
      if (fromDistance) return 0x1faf;
      return rand(3) !== 0 ? 0x1fbe : 0x21bd;                                       // 0x701f70
    default: return 0x1f81;                                                         // 0x701fa2
  }
}

const inAttackingBox = (side: 0 | 1, x: number, y: number) =>
  x >= 2 && x <= 6 && (side === 0 ? y >= 10 : y <= 1);

export function shotScore(c: ShotContext, rand: Rand, preset: number = 0xff): ShotScore {
  const a = c.attrs;
  const K = c.keeper;
  // b13 – keeper off his line / close (0x700bf8–0x700ca8)
  let b13 = K && K.y !== 0 && K.y !== 11 ? 2 * (c.creativityRoll + 5) : 2 * (-5 - c.creativityRoll);
  if (K && K.distToShooter < 1) b13 -= c.creativityRoll;
  b13 = (b13 << 24) >> 24; // byte arithmetic

  let type = preset;
  const v = (code: number) => shotSkill(code, a, c.form);
  const fail = (): ShotScore => ({ type: SHOT.LOW_DRIVE, score: -1000, tightAngle: false, fromDistance: false, event: 0x1f81 }); // 0x701fbe, text 8065

  if (type === SHOT.PENALTY) // 0x700d19, text 8063
    return { type, score: rand(5 * v(SHOT.PENALTY)) + 150, tightAngle: false, fromDistance: false, event: 0x1f7f }; // 0x700d20 TAKE_PENALTY

  if (type !== SHOT.FREE_KICK) {
    if (c.prevAction === 0x3b) type = SHOT.DIVING_HEADER; // 0x700d52
    else {
      const h = c.ballHeight;
      // "must score" (0x700db0–0x700f4f)
      if (c.facingGoal && h < 3) {
        const pastKeeper = K && (c.side === 0 ? c.y > K.y : c.y < K.y);
        if (c.creativityRoll > rand(3) || pastKeeper) {
          if (K && K.down > 1 && inAttackingBox(c.side, c.x, c.y)) type = SHOT.MADE_SURE;
          else if (!K) type = SHOT.MADE_SURE;
          else if (K.distToOwnGoal >= 2 && K.distToShooter >= 1) type = SHOT.MADE_SURE; // 0x700ed5, 0x700f14
          else if (rand(c.w29) > rand(2000) && c.D < 1.5) type = SHOT.MADE_SURE;      // 0x700f2b, 0x700f42
        }
      }
      if (type === 0xff) {
        let best: number;
        const pick = (code: number, r: number) => { if (r > best) { best = r; type = code; } };
        const hope = () => rand(v(SHOT.HOPE) - rand(500) + rand(150)); // 0x70103d
        if (h === 0) {
          if (!c.facingGoal) return fail();
          best = rand(v(SHOT.LOW_DRIVE)); type = SHOT.LOW_DRIVE;
          pick(SHOT.CHIP, rand(v(SHOT.CHIP) + 20 * b13));          // 0x700fed
          if (c.D >= 1.5) pick(SHOT.BANANA, rand(v(SHOT.BANANA)));  // 0x70100e
          pick(SHOT.HOPE, hope());
          pick(SHOT.HIGH_DRIVE, rand(v(SHOT.HIGH_DRIVE)));
        } else if (h === 1) {
          if (!c.facingGoal) return fail();
          best = rand(v(SHOT.LOB) + 22 * b13); type = SHOT.LOB;     // 0x701121
          pick(SHOT.HOPE, hope());
          pick(SHOT.LOW_DRIVE, rand(v(SHOT.LOW_DRIVE)));
          pick(SHOT.HALF_VOLLEY, rand(v(SHOT.HALF_VOLLEY)));
        } else if (h === 2 || h === 3) {
          if (!c.facingGoal) { if (h === 3) type = SHOT.BICYCLE; else return fail(); }
          else { best = rand(v(SHOT.LOB) + 22 * b13); type = SHOT.LOB; pick(SHOT.VOLLEY, rand(v(SHOT.VOLLEY))); }
        } else if (h === 4) {
          type = c.facingGoal ? SHOT.HEADER : SHOT.BICYCLE;          // 0x70121c / 0x70130d
        } else return fail();                                        // 0x701225
      }
    }
  }

  // ---- scoring (0x701311)
  const tired = trunc(((10000 - trunc(c.condition)) ** 2) / 50000); // 0x7013c2
  const mom = c.momentum;
  let S: number, q: number;
  if (type === SHOT.MADE_SURE) {
    const r1 = idiv(rand(tired), 5);
    q = idiv(c.w29, 2) - rand(r1) + rand(idiv(mom, 5)) + 210;        // 0x701427
    S = v(type) + idiv(mom, 5) - r1 + c.w29 + rand(10) - rand(10);   // 0x70145b–0x701472
  } else {
    const r = rand(tired);
    q = type === SHOT.FREE_KICK ? 0 : idiv(c.w29, 2) + mom - r;      // 0x7014af
    let s0 = v(type) - rand(r) + rand(mom);
    const h = c.ballHeight;
    const lowAttrPenalty = () => {
      for (const x of [a.agility, a.balance, a.technique]) if (x < 15) s0 += rand(trunc(667 * x - 10000)); // 0x96b020, 0x96d7e0, 0x96d1b0
    };
    if (type === SHOT.BICYCLE && h === 4) { q -= 300; lowAttrPenalty(); s0 += 30 * c.flairRoll - 400; } // 0x701522, 0x7015c6
    else if (type === SHOT.BICYCLE && h === 3) { q -= 250; lowAttrPenalty(); s0 += 20 * (c.flairRoll - 15); } // 0x7015f6, 0x701697
    else if (type === SHOT.DIVING_HEADER) { const p = rand(trunc((3 - h) * (200 - 7.5 * a.agility))); s0 -= p; q -= p; } // 0x7016aa
    else if (h === 3) { const p = rand(400); s0 -= p; q -= p; }       // 0x7016e4
    S = rand(c.w29) + rand(s0);                                       // 0x7016f7
  }

  // angle (0x701711)
  let tightAngle = false;
  if (c.x < 3 || c.x > 5) {
    const ang = (c.side === 0 ? 12 - c.y : c.y + 1) / Math.abs(4 - c.x);
    const sq = ang * ang;
    if (sq < 0.3) tightAngle = true;                                  // 0x968e80
    let p = trunc(Math.max(740 - 2160 * sq, 25));                     // 0x96d7d8, 0x96d7dc, 0x96af88
    if (type === SHOT.MADE_SURE) p = idiv(p, 3);
    S -= rand(trunc((5 * p) / Math.max(a.technique, 1)));            // 0x9688a0
    q -= idiv(p, 2);
  }
  // long range (0x70183d)
  let fromDistance = false;
  if (c.D > 2.2 && !inAttackingBox(c.side, c.x, c.y)) {               // 0x96d7d0
    fromDistance = true;
    if ([SHOT.HIGH_DRIVE, SHOT.CHIP, SHOT.LOB, SHOT.HOPE].includes(type as never)) {
      // 0x701943/0x70192a/0x701911: det store rul trækkes først (ebp), så det lille (eax): S += eax − ebp
      if (c.weather === 2) { const b = rand(5); S += rand(2) - b; }
      else if (c.weather === 3) { const b = rand(10); S += rand(5) - b; }
      else if (c.weather === 4) { const b = rand(15); S += rand(10) - b; }
    } else if (type === SHOT.LOW_DRIVE) {
      if (c.matchByte1 === 2) S += rand(4);
      else if (c.matchByte1 === 0x20) S += rand(5) - rand(5);
    }
  }
  if (!K) { S += rand(500); q += 250; }                               // 0x70197a
  // distance
  const isHeader = type === SHOT.HEADER || type === SHOT.DIVING_HEADER;
  const onByLine = (c.y === 0 || c.y === 11) && Math.abs(c.x - 4) === 1;
  if (isHeader && c.D >= 1 && !onByLine) {
    let p = trunc(crtPow(c.D + 2, 8) / 3);                             // 0x968950, 0x968f10, 0x968a80
    if (p > 15000 || p < 0) p = 15000;                               // 0x7019fc
    S -= rand(p); q -= idiv(p, 2);
  } else if (c.D === 0) { S += 200; q += 200; }                      // 0x701a5c
  else if (c.D === 1) { S += 100; q += 100; }                        // 0x701a7e
  else if (c.D > 1.5) {
    let p = Math.min(trunc(crtPow(0.6 * c.D + 1.5, 7)), 30000);          // 0x968e48, 0x968940, 0x968988
    let g: number;
    if (type === SHOT.MADE_SURE) { p = idiv(p, 20); g = 1 - 0.025 * (c.flairRoll + a.longShots); }
    else if (type === SHOT.FREE_KICK) { p = idiv(p, 15); g = 1 - 0.05 * a.freeKicks; }   // 0x967888
    else { p = idiv(p, 2); g = 1 - 0.025 * (c.flairRoll + a.longShots); }               // 0x967878
    g = Math.max(g, 0.2);                                             // 0x968918
    q -= idiv(p, 2);
    S -= rand(Math.min(trunc(p * g), 30000));
  }
  const event = shotEvent(type, tightAngle, fromDistance, rand);                     // 0x701bb8: efter afstandens rand (0x701bae)
  return { type, score: (S << 16) >> 16, quality: (q << 16) >> 16, tightAngle, fromDistance, event };
}

// ---------------------------------------------------------------- sub_713e90 (foot)

/** Returns the score/quality penalty for shooting with the wrong foot. 0x713e90 */
export function footPenalty(type: number, angleToGoalMinusFacing: number, D: number, a: Attrs, rand: Rand): number {
  if ([0x5b, 0x5c, 0x3d, 0x36, 0x34, 0x37, 0x5a, 0x33, 0x35, 0x39, 0x03].includes(type)) return 0;
  let ang = angleToGoalMinusFacing; // degrees, signed; folded like 0x713f3b–0x713f5b
  const sgn = ang >= 0 ? 1 : -1; let m = sgn * ang; if (m > 180) m = 360 - m; ang = sgn * m;
  const t = trunc(90 - (18 * (D + 1) - a.technique));                // 0x96d84c, 0x96d848
  if (ang > t) return rand(12 * (20 - a.leftFoot));                  // 0x713f94 (record +0x30)
  if (ang < -t) return rand(12 * (20 - a.rightFoot));                // 0x713fa0 (record +0x3b)
  return 0;
}
// NB: the caller does S −= rand(p) and w39 −= p/2 with p = 12·(20 − foot); the rand is in sub_702050 (0x702241).

/** sub_713e90 (sikker) uden rand: p = 12·(20 − foden) (0 inden for tolerancen og for de undtagne typer) og den fod, skuddet tages med –
 *  2 for de undtagne typer (0x713ea2), den foretrukne (+0x2c) inden for tolerancen (0x713f8b), 0 = venstre (0x713f97), 1 = højre (0x713fa3).
 *  sub_702050 trækker S −= rand(p) (0x702241) og w39 −= p/2 (0x702237); foden vælger skudkommentarens variant (0x7037ee). */
export function footCheck(type: number, angleToGoalMinusFacing: number, D: number, a: Attrs, strongFoot: number): { p: number; foot: number } {
  if ([0x5b, 0x5c, 0x3d, 0x36, 0x34, 0x37, 0x5a, 0x33, 0x35, 0x39, 0x03].includes(type)) return { p: 0, foot: 2 };
  let ang = angleToGoalMinusFacing;
  const sgn = ang >= 0 ? 1 : -1; let m = sgn * ang; if (m > 180) m = 360 - m; ang = sgn * m;
  const t = trunc(90 - (18 * (D + 1) - a.technique));
  if (ang > t) return { p: 12 * (20 - a.leftFoot), foot: 0 };
  if (ang < -t) return { p: 12 * (20 - a.rightFoot), foot: 1 };
  return { p: 0, foot: strongFoot };
}

// ---------------------------------------------------------------- sub_700420 (keeper)

export interface KeeperContext {
  base: number;           // word +0x16a (arg3 ≠ 0, "høj") eller +0x168 = handlingsevnen 0x28/0x27 (0x700440–0x700455)
  w3b: number;            // keeper word +0x3b (match CA)
  reflexes: number;       // +0xd1
  goalsConceded: number;  // byte +0xf (keeperens mål imod – tælles op i 0x70ae8f/0x70c518)
  b8eaa: number;          // match+0x8eaa (boldens fart)
  distToBall: number;     // tabellen 0xa15e44[|ky − bold y|·9 + |kx − bold x|] (0x70045e–0x7004ab: BOLDEN engine+0x8ea7/+0x8ea8, ikke skytten)
  isKeeper: boolean; down: number; side: 0 | 1; x: number; y: number;
  covers: boolean;        // sub_713d90 – TODO not ported
}
export interface KeeperValue { K: number; state: number; fumble: boolean }

export function keeperValue(k: KeeperContext, shooter: { x: number; y: number }, type: number, rand: Rand): KeeperValue {
  if (k.down > 1 || !k.isKeeper) return { K: 0, state: 0, fumble: false };   // 0x7004af
  const R = (n: number) => rand(k.w3b) > rand(285)                          // 0x700591
    ? trunc(0.3 * n + rand(trunc(0.7 * n))) : rand(n);                        // 0x968e40, 0x968e80
  const e = k.base + 220;                                                     // 0x70046b
  let K: number, state = 0;
  const ownBox = k.x >= 2 && k.x <= 6 && (k.side === 1 ? k.y >= 10 : k.y <= 1);
  const far = () => (k.distToBall > 2.1 ? 10 + trunc(0.35 * k.w3b) : 0);     // 0x96d700, 0x96d7c8
  if (type === SHOT.PENALTY) K = rand(e - rand(e));                           // 0x7004d6
  else if (k.side === 1 ? k.y < shooter.y : k.y > shooter.y) { state = 1; K = 0; }
  else if (!ownBox) { state = 3; K = 0; }
  else if (!k.covers) { state = 2; K = R(e) - 200; }                           // 0x7005e0
  else if (k.y === 0 || k.y === 11) {
    if (type === SHOT.CHIP) K = R(e) + 75 + (k.distToBall < 1 ? 100 : 0);     // 0x700a42, 0x700a4c
    else if (type === SHOT.LOB) K = R(e) + 125 + (k.distToBall < 1 ? 100 : 0); // 0x7009b7
    else K = R(e) + far();
  } else {
    if (type === SHOT.HEADER || type === SHOT.BICYCLE) K = R(e - 150);        // 0x70063b
    else if (type === SHOT.CHIP) { state = 4; K = R(e - 150) + (k.distToBall < 1 ? 100 : 0); }
    else if (type === SHOT.LOB) { state = 4; K = R(e - 200) + (k.distToBall < 1 ? 100 : 0); } // 0x700796
    else K = R(e) + far();
  }
  const g = trunc(2 * k.reflexes + k.goalsConceded + 10);                     // 0x700a72
  // 0x700a87–0x700aa2: (2,0 − d)·fart·10 → ftol (x87: uden for int32 → 0x80000000 – afstanden kan komme fra hukommelsen efter tabellen)
  const hv = (2 - k.distToBall) * k.b8eaa * 10;
  const hh = hv >= 2147483648 || hv < -2147483648 || hv !== hv ? -2147483648 : trunc(hv);
  let fumble = false;
  if (!(rand(g) > rand(hh))) { fumble = true; K = R(K); }                     // 0x700adf
  return { K: trunc(0.5714285714285714 * K + idiv(k.base, 6) + 20), state, fumble }; // 0x96d698, 0x968ea8
}

// ---------------------------------------------------------------- sub_702050 (outcome)

export type Outcome =
  | 'goal' | 'goalInOffWoodwork' | 'parried' | 'tippedForCorner' | 'held'
  | 'wellWide' | 'wellOver' | 'highAndWide' | 'wide' | 'over' | 'overAndWide'
  | 'justWide' | 'justOver' | 'clipsPost' | 'clipsBar' | 'hitsPost' | 'hitsBar'
  | 'blocked' | 'deflectedWide' | 'retake';

/** "High" flag by type (table 0x70a5a8 → 0x70a594). */
export function highFlag(type: number, rand: Rand): boolean {
  switch (type) {
    case 0x16: case 0x39: return false;
    case 0x17: case 0x1a: case 0x1b: return true;
    case 0x18: case 0x19: case 0x1c: return rand(3) !== 0;
    case 0x3a: return rand(4) === 0;
    default: return rand(2) !== 0;
  }
}

/** Result code R (0x703b25–0x703be3). */
export function resultCode(S: number, penalty: boolean, high: boolean, rand: Rand): number {
  // rettelse 1: a penalty scores rand(5v)+150 ≥ 150, so the 120 limit never matters – every penalty is on target
  const T0 = penalty ? 120 : 240;                       // 0x7021cd / 0x7020cc
  if (S > T0) return rand(S) < 10 ? 14 + (high ? 1 : 0) : 1;
  if (S < 10) return high ? (rand(4) !== 0 ? 3 : 4) : 2;
  const gap = T0 - S;
  if (gap > 60) return high ? (rand(4) !== 0 ? 6 : 7) : 5;
  if (gap > 25) return 8 + (high ? 1 : 0);
  if (gap > 14) return 10 + (high ? 1 : 0);
  return 12 + (high ? 1 : 0);
}

const MISS: Record<number, Outcome> = {
  2: 'wellWide', 3: 'wellOver', 4: 'highAndWide', 5: 'wide', 6: 'over', 7: 'overAndWide',
  8: 'justWide', 9: 'justOver', 10: 'clipsPost', 11: 'clipsBar', 12: 'hitsPost', 13: 'hitsBar',
};

/**
 * Outcome of an on-target / off-target shot once the pre-shot challenge (sub_6c87e0) and the
 * line-of-shot check (sub_6cc540 → sub_70dfd0, NOT ported: pass `lineResult`) are done.
 * param: 1 normal, 2 advantage, 4 shoot-out, 5 penalty retake (1 %), 6 free-kick retake (1 %).
 */
export function shotOutcome(opts: {
  S: number; type: number; K: KeeperValue; param: number;
  lineResult: 0 | 1 | 2;            // sub_6cc540: 0 clear, 1 blocked, 2 deflected
  keeperTouchedLast?: boolean;      // match+0xf5ae == keeper → K = 0 (0x703fb7)
  shooterBeyondKeeperX?: boolean;   // for the out-of-position bonus (0x703f3e)
  compType?: number;                // match+1
  /** highFlag, rullet af kalderen i originalens rækkefølge (0x7023a6 – før keeperværdien 0x700420); mangler = rul her */
  high?: boolean;
  rand: Rand;
}): { outcome: Outcome; ratio?: number; R: number; goodSave: boolean; greatSave: boolean } {
  const { type, param, rand } = opts;
  let S = opts.S;
  const penalty = type === SHOT.PENALTY;
  const high = opts.high ?? highFlag(type, rand);
  const great = !opts.K.fumble && opts.K.K > 375;                // 0x702427
  const good = !opts.K.fumble && !great && opts.K.K > 260;       // 0x702434
  if (opts.lineResult === 2) S += rand(1000) - rand(2000);       // 0x703afb
  const R = resultCode(S, penalty, high, rand);
  const onTarget = R === 1 || R === 14 || R === 15;
  const retake = param === 5 || param === 6;
  if (opts.lineResult === 1) return { outcome: 'blocked', R, goodSave: false, greatSave: false }; // 0x703d82
  if (opts.K.state !== 0) S += 190 + (opts.shooterBeyondKeeperX ? rand(400) : 0); // 0x703f4e–0x703f9c
  if (!onTarget) {
    if (retake) return { outcome: 'retake', R, goodSave: false, greatSave: false };
    if (opts.lineResult === 2) return { outcome: 'deflectedWide', R, goodSave: false, greatSave: false }; // corner
    return { outcome: MISS[R], R, goodSave: false, greatSave: false };
  }
  const K = opts.keeperTouchedLast ? 0 : opts.K.K;
  let ratio = S + K === 0 ? 0 : (100 * S) / (S + K);              // 0x706cba (int 100·S, float divide)
  if (ratio <= 68 && (opts.compType === 2 || opts.compType === 8)) ratio += 2; // 0x706cef–0x706d0d (sic: ≤ 68)
  let outcome: Outcome;
  if (ratio > 71) outcome = R === 1 ? 'goal' : 'goalInOffWoodwork';   // 0x96d808
  else if (ratio > 61) outcome = 'parried';                        // 0x96d7e8
  else if (ratio > 51) outcome = 'tippedForCorner';                // 0x96d7e4
  else outcome = 'held';
  if (retake) outcome = 'retake'; // TODO: goal path → 0x70877a retake confirmed; check all save bands (0x70920f, 0x70970e: yes)
  return { outcome, ratio, R, goodSave: ratio <= 71 && good, greatSave: ratio <= 71 && great };
}
// TODO (ukendt): w29, form scale, match+0x8eaa, sub_713d90, sub_70dfd0 (block roll), sub_6c87e0 challenge.
