// Kilde: cm-01-02-bosman-edition/app/ball_carrier/ball_carrier_rule.ts (kopieret 2026-11-09).
// Porteret af Bosman-projektet; ændringer: ingen.
// Gittermotoren (gridMatch.ts) er et laboratorium ved siden af MatchSim – ikke koblet ind i spillet.
/**
 * Championship Manager 01/02 - the ball carrier's decision (sub_7109f0, match_pl.cpp,
 * 0x7109f0-0x713db7 in cm0102.exe). A readable port of the original rule.
 *
 * How it works in one sentence: the player on the ball builds four scores - PASS, RUN
 * (dribble), HOLD (shield / hold up) and SHOOT - from his position, his attributes, the
 * "rolls" made for him this tick, his manager's instructions and the score line; each score
 * gets random noise of rand(50 x (20 - decisions roll)); the highest wins (in the order
 * shoot -> run -> hold -> pass, with ties going to the earlier one), and a few vetoes follow.
 * Some situations skip the scoring and go straight to a cross / clearance (lofted ball).
 * Set pieces (restart states 2..8) have their own short rules at the top.
 *
 * Every number below is read from the x86 code; the address next to it is where.
 * Things the port cannot compute by itself (pass options, the shot score, a run target,
 * "is he facing goal" ...) come in through `Situation`, filled by your own engine.
 * "TODO" marks parts whose meaning (not the numbers) is a guess - see BALL_CARRIER.md.
 *
 * Pitch: 9 columns (x 0..8, centre 4) x 12 rows (y 0..11). Side 0 attacks the goal at
 * (4, 11), side 1 the goal at (4, 0). Distances are in cells (table at 0xa15e44 = sqrt).
 */

// ------------------------------------------------------------------ random numbers

/** sub_90cfc0: rand(n) gives 0..n-1; rand(0) = 0; rand(negative n) gives n+1..0. */
import { crtPow } from '../crtMath';
export type Rand = (n: number) => number;

export const defaultRand: Rand = (n) => {
  n = Math.trunc(n);
  if (n === 0) return 0;
  const r = Math.floor(Math.random() * Math.abs(n));
  return n > 0 ? r : -r;
};

/** sub_945640 is _ftol: truncation toward zero. */
const trunc = Math.trunc;

// ------------------------------------------------------------------ inputs

/** Action codes the original writes to player+0x198 / passes to the pass and shot routines. */
export const ACTION = {
  turnAndRun: 0x0f, // 15, run when not facing goal (0x713961)
  hold: 0x10, // 16, hold / shield the ball (0x7139d2)
  startRun: 0x11, // 17 (0x713b87)
  continueRun: 0x12, // 18, when the last action was already a run (0x713bb5)
  noTargetLoftedBall: 0x09, // 9 (0x713785)
  pass: 0x6c, // 108, open-play pass (0x7137d1)
  penaltyShot: 0x33, // 51 (0x710d29)
  cornerKick: 0x34, // 52 (0x710b73)
  freeKickShot: 0x35, // 53 (0x710ea7)
  throwIn: 0x36, // 54 (0x710c46)
  freeKickPass: 0x37, // 55 (0x710e01, 0x710f78)
  goalKick: 0x5a, // 90 (0x710d03)
  forcedShot: 0x3b, // 59: if this was the last action the carrier must shoot (0x713741). TODO meaning
} as const;

/** Restart state at match+0x8eb2 (jump table 0x710aaf / 0x713d5c, index = state - 2). */
export const RESTART = {
  none: 0,
  throwIn: 2, // set by sub_6cd490 with event 8054 (ball out over a side line)
  corner: 3, // event 8053
  goalKick: 4, // event 8055
  penalty: 5, // event 8058 (foul in the box, sub_6f09f0 at 0x6f174e)
  freeKick: 6, // event 8057 (foul outside the box)
  indirectFreeKick: 7, // after offside (event 8056) and some fouls
  kickOff: 8, // event 8052 - treated as open play
} as const;

export interface PassOption {
  /** Is there a receiver? (sub_6c6a30 returns a player pointer or 0) */
  hasTarget: boolean;
  /** Best option weight written by sub_6c6a30 (the 7th argument). */
  weight: number;
  /** Pass type byte written by sub_6c6a30 (3rd argument). 0x5e = cross; 6/7/8 = TODO (long/through-ball kinds?) */
  type: number;
  /** Target cell. */
  tx: number;
  ty: number;
}

export interface Carrier {
  side: 0 | 1;
  x: number; // +0x102
  y: number; // +0x103
  /** Match-day floats from sub_6ec010, about 0..20 (0.1 x (2 x intrinsic + match CA), floored at 0). */
  dribbling: number; // +0x95
  finishing: number; // +0x99
  flair: number; // +0x9d
  freeKicks: number; // +0xa1
  heading: number; // +0xa9
  longShots: number; // +0xb1
  teamwork: number; // +0xe1
  /** Rolls made each tick by sub_6f44a0 (see BALL_CARRIER.md for the caps). */
  decisionsRoll: number; // +0x106: max of 2 x rand(Decisions + 2)
  creativityRoll: number; // +0x10b: max of 2 x rand(form/3 + 0.8 Creativity + 5)
  flairRoll: number; // +0x109: rand(0.05 x (morale + Flair - 10)^2), at least rand(2)
  positioningRoll: number; // +0x10a: max of 2 x rand(form/3 + Positioning + 4)
  /** +0x17. TODO: probably morale/confidence, 10 = neutral (it is used as "value - 10"). */
  morale: number;
  /** +0x11. TODO: unknown counter, x300 in the run-with-ball bonus. */
  b11: number;
  /** +0x2d. TODO: unknown counter, rand(300 x b2d) off the shot score. */
  b2d: number;
  /** +0x4d, 0..10000 (fitness). */
  condition: number;
  /** +0x19c, -200..200, set by the caller. TODO: probably momentum / speed of the move. */
  momentum: number;
  /** +0x198, the action code of his previous action. */
  lastAction: number;
  /** sub_6c38c0 == 1. */
  isGoalkeeper: boolean;
  /** Position flag word (sub_6c38c0) and second flag word (sub_6c38f0). TODO: bit names guessed. */
  posFlags: number;
  sideFlags: number;
  /** Individual instructions (team tactic +0x188b + 8 x slot, read by sub_5b5270); true = "Yes". */
  runWithBall: boolean; // bit 0x2000000
  holdUpBall: boolean; // bit 0x8000000
  longShotsInstr: boolean; // bit 0x20000000
  crossBall: boolean; // high dword bit 0x4
  /** Staff record personality (1..20). */
  professionalism: number; // staff +0x5b
  sportsmanship: number; // staff +0x5c
}

export interface OppKeeper {
  /** sub_6c38c0(keeper) has bit 0x1 - a real keeper in goal. */
  isRealKeeper: boolean;
  x: number;
  y: number;
  /** keeper +0x2b != 0. TODO: per-move action counter; meaning for the keeper unclear. */
  hasActed: boolean;
  /** sub_713d90(keeper, x, y). TODO: probably "keeper covers the carrier". */
  covers: boolean;
}

export interface Situation {
  carrier: Carrier;
  /** kun spor: de fire værdier efter støjen (0x7133bd, match_trace.c's Q-linje) */
  traceScores?(P: number, R: number, H: number, S: number, w: number, blockers: number, space: number, pressure: number): void;
  /** Argument of sub_7109f0: 0 from sub_7103e0 (normal play), 4 from sub_6be710 (query: returns true when he would shoot). */
  mode: 0 | 4;
  restart: number; // match+0x8eb2
  /** match+0x8ea9: -1 / 0..5. TODO: probably ball height/state (4 = head height, 3 = volley height, -1 = not under control). */
  ballHeight: number;
  /** Ball cell for restarts (match+0x8ea7 / 0x8ea8). */
  ballX: number;
  ballY: number;
  /** The opponents' last-line rows (match+0x8eaf for side 1's line, 0x8eb0 for side 0's). */
  oppLastLine: number;
  /** Distance to the goal he attacks (cells). */
  D: number;
  /** sub_6c3950: distance to the nearest opposing outfield player (0 if in his cell; 5000 if none). */
  nearestOpp: number;
  /** sub_6c3a00 result. TODO: probably opponents close to him. */
  nearbyOpp: number;
  /** sub_6cc070(x, y, 4, goalRow): opponents blocking the way to goal; 0 in his own half (not computed there). */
  blockers: number;
  /** sub_6bcbd0: pressure (2 per challenger in contact) and the summed challenge strength (word at [esp+0x70]). */
  pressure: number;
  challenge: number;
  /** sub_6c6a30 in open play. */
  pass: PassOption | null;
  /** sub_6c6a30 for a restart (code = 0x34/0x36/0x5a/0x37). */
  setPiecePass: (code: number) => PassOption | null;
  /** sub_700bd0: shot score (on target if > 240 in sub_702050). Called fresh each time. w29 = boldholderens word +0x29, som
   *  sub_7109f0 har skrevet (0x7110f5–0x711342, kan være negativ); mangler = limens værdi. */
  shotScore: (w29?: number) => number;
  /** 0x711150/0x7111e9/0x7111f3/0x711339 + 0x711342: sub_7109f0 skriver boldholderens +0x29 (pladsen) her */
  setSpace?: (v: number) => void;
  /** 0x713bf9: lige før det åbne spils skud (sub_700bd0) – limens kommentar (GREAT_FIRST_TOUCH) */
  onShootStart?: () => void;
  /** sub_6cb700(y, side): own players further forward than him. */
  teammatesAhead: number;
  /** sub_6cb780: 0 = defenders between him and goal, 1 = clear and he is the most advanced, 2 = clear but a team-mate is nearer goal. */
  clearRun: 0 | 1 | 2;
  /** sub_6ce110: the opposing keeper (null if none). */
  oppKeeper: OppKeeper | null;
  /** Grid count of opponents in his own cell (match+0x21b6). */
  oppInCell: number;
  /** Opponents in his cell with +0x24 set. TODO: probably "committed to a challenge". */
  committedOppInCell: number;
  /** sub_6f9f90(4, goalRow): facing the goal within 75 degrees. */
  facingGoal: boolean;
  /** sub_6c4180 >= 0: level with or past the opponents' last line. */
  pastLastLine: boolean;
  /** sub_6bd5b0(carrier, 0) / (carrier, 1). TODO: probably "no outfield opponent goal-side of him". */
  noDefenderGoalSide0: boolean;
  noDefenderGoalSide1: boolean;
  /** 0x711721: boldholderens motivation +0x100 falder med 1 (tilstand 5, bagud) */
  dropMotivation?(): void;
  /** sub_6bce80: a cell to run to (start = his tactical cell from sub_6c2be0). */
  runTarget: { found: boolean; tx: number; ty: number };
  /** His tactical cell (sub_6c2be0 / sub_715f50) and the distance to it when he is ahead of it (else 0). */
  tacticalX: number;
  /** 0x710f9e: det taktiske felt slås op her (driftens rand) – i det åbne spil, før pladsen +0x29 */
  tacticalCell?(): void;
  beyondTactical: number;
  /** Clock word match+0x8ed0 (11 ticks a minute). */
  clockTicks: number;
  ownGoals: number;
  oppGoals: number;
  /** Return value of sub_6ce310(...,1). TODO: probably the lead (own - opp). */
  lead: number;
  /** match+0x1ab+side. AI mode; 5 = easing off when well ahead (identical/2_3_helpers_and_fields). */
  teamMode: number;
  /** sub_6d42a0: (human manager) "men behind ball" flag 0x4000, or AI mode 3/4; never in competition types 1 and 9. */
  protectLead: boolean;
  /** Opponent team flag 0x400 (offside trap). */
  oppOffsideTrap: boolean;
  /** sub_6cb9b0(carrier, 4, goalRow). "in a crossing position": wide, last 3 rows, > 1.5 cells from the goal mouth (identical/2_3_helpers_and_fields). */
  goalPathBlocked: boolean;
  /** sub_713e90(...) result is not 2 and differs from carrier+0x2c. which foot he must use: 0 left, 1 right, 2 dead ball; +0x2c = preferred foot (identical/2_3_helpers_and_fields). */
  sightCheckFails: boolean;
  /** match+0x8d46+side: consecutive passes counter (+1 per pass, the other side -10). */
  possessionCounter: number;
}

export type Decision =
  | { kind: 'pass'; action: number; pass: PassOption } // sub_6fa250
  | { kind: 'passToSpace'; action: number; code: number; tx: number; ty: number } // sub_6fa250 without receiver
  | { kind: 'loftedBall'; action?: number; clearance: boolean; arg?: 0 | 1 } // sub_6fa490(ballHeight, arg): cross near the box, long ball / clearance elsewhere
  | { kind: 'run'; action: number; tx: number; ty: number; turn?: [number, number] } // sub_6f4920(turn) + sub_6f09f0(tx, ty)
  | { kind: 'hold'; timeWasting: boolean } // sub_70ec80
  | { kind: 'shoot'; action?: number; quality: number; special?: number } // sub_702050
  | { kind: 'wouldShoot' }; // mode 4: returns 1 without shooting

// ------------------------------------------------------------------ geometry

const goalRow = (c: Carrier) => (c.side === 0 ? 11 : 0);
const central = (x: number) => x >= 2 && x <= 6;
const wide = (x: number) => !central(x); // sub_6cb910
const inAttBox = (c: Carrier) => central(c.x) && (c.side === 0 ? c.y >= 10 : c.y <= 1);
const inOwnBox = (c: Carrier) => central(c.x) && (c.side === 0 ? c.y <= 1 : c.y >= 10);
const attHalf = (c: Carrier) => (c.side === 0 ? c.y >= 6 : c.y < 6);
const ownHalf = (c: Carrier) => !attHalf(c);
const finalThird = (c: Carrier) => (c.side === 0 ? c.y > 8 : c.y < 3);
const ownThird = (c: Carrier) => (c.side === 0 ? c.y < 3 : c.y > 8); // sub_6cb930
const onGoalLine = (c: Carrier) => c.y === goalRow(c);
const goalMouth = (c: Carrier) => onGoalLine(c) && c.x >= 3 && c.x <= 5;
const keeperInBox = (k: OppKeeper, carrierSide: 0 | 1) =>
  central(k.x) && (carrierSide === 0 ? k.y >= 10 : k.y <= 1);

// ------------------------------------------------------------------ set pieces

function restartDecision(s: Situation, rand: Rand): Decision | null {
  const c = s.carrier;
  switch (s.restart) {
    case RESTART.throwIn: {
      // 0x710b86: if no receiver, throw along the line: row +1 (side 0) / -1 (side 1), x near the touchline
      const p = s.setPiecePass(ACTION.throwIn);
      if (p && p.hasTarget) return { kind: 'pass', action: ACTION.throwIn, pass: p };
      const ty = Math.min(11, Math.max(0, s.ballY + (c.side === 0 ? 1 : -1)));
      const tx = s.ballX === 0 ? rand(4) : 8 - rand(4);
      return { kind: 'passToSpace', action: ACTION.throwIn, code: ACTION.throwIn, tx, ty };
    }
    case RESTART.corner: {
      // 0x710ae5: no receiver -> to the goal row, x = 5 - rand(3) (3..5)
      const p = s.setPiecePass(ACTION.cornerKick);
      if (p && p.hasTarget) return { kind: 'pass', action: ACTION.cornerKick, pass: p };
      return { kind: 'passToSpace', action: ACTION.cornerKick, code: ACTION.cornerKick, tx: 5 - rand(3), ty: goalRow(c) };
    }
    case RESTART.goalKick: {
      // 0x710c59: receiver only if its weight >= 2000 (0x710ca8), else into midfield
      const p = s.setPiecePass(ACTION.goalKick);
      if (p && p.hasTarget && p.weight >= 2000) return { kind: 'pass', action: ACTION.goalKick, pass: p };
      const tx = 7 - rand(7); // 1..7
      const ty = c.side === 0 ? 6 + rand(3) : 5 - rand(3); // 6..8 / 3..5
      return { kind: 'passToSpace', action: ACTION.goalKick, code: ACTION.goalKick, tx, ty };
    }
    case RESTART.penalty: {
      // 0x710d16: always a shot; 1 in 100 gets outcome parameter 5 instead of 1 (TODO meaning)
      const q = s.shotScore();
      return { kind: 'shoot', action: ACTION.penaltyShot, quality: q, special: rand(100) === 0 ? 5 : 1 };
    }
    case RESTART.freeKick: {
      // 0x710e14: direct shot if x 2..6, D < 3.1 (0x96d3e8) and (rand(trunc(FK + 20)) + flairRoll) / 3 > D
      if (central(c.x) && s.D < 3.1) {
        const v = trunc((rand(trunc(c.freeKicks + 20)) + c.flairRoll) / 3);
        if (v > s.D) {
          const q = s.shotScore();
          return { kind: 'shoot', action: ACTION.freeKickShot, quality: q, special: rand(100) === 0 ? 6 : 1 };
        }
      }
      return freeKickPass(s);
    }
    case RESTART.indirectFreeKick:
      return freeKickPass(s);
    default:
      return null; // 0 and kick-off (8): normal play
  }
}

function freeKickPass(s: Situation): Decision {
  // 0x710d64 / 0x710ee2: receiver only if weight >= 2000; else (4, opponents' last line -2 / +2)
  const c = s.carrier;
  const p = s.setPiecePass(ACTION.freeKickPass);
  if (p && p.hasTarget && p.weight >= 2000) return { kind: 'pass', action: ACTION.freeKickPass, pass: p };
  const ty = c.side === 0 ? s.oppLastLine - 2 : s.oppLastLine + 2;
  return { kind: 'passToSpace', action: ACTION.freeKickPass, code: ACTION.freeKickPass, tx: 4, ty };
}

// ------------------------------------------------------------------ open play

export function decideBallCarrier(s: Situation, rand: Rand = defaultRand): Decision {
  const c = s.carrier;
  const D = s.D;
  const h = s.ballHeight;

  const restart = restartDecision(s, rand);
  if (restart) return restart;
  if (s.mode !== 4) s.tacticalCell?.();                                           // 0x710f8b–0x711015 (tilstand 4: 0x710acb springer det over)

  // --- "space" (word +0x29), 0x7110f5..0x71133f
  let space: number;
  let challenge = (s.challenge << 16) >> 16;                                     // sub_6bcbd0's ord [esp+0x70]
  if (s.mode === 4) space = 350; // 0x711339
  else if (h === -1) space = 200; // 0x7111f3
  else if (s.pressure === 0) {
    space = trunc(Math.min(s.nearestOpp, 3.5) * 60 + 57); // 3.5 @0x968e38, 60 @0x96d7b0, 57 @0x96d844
  } else {
    // 0x711159–0x711164: et negativt ord [esp+0x70] SKRIVES til 0 – de senere læsninger (0x712279, 0x7129f7, 0x712d3f) ser 0
    if (challenge < 0) challenge = 0;
    const a = challenge;
    let v = trunc(-(s.pressure * a * a) * 0.75); // 0.75 @0x969040
    if (v < -500) v = Math.max(rand(trunc((v + 500) / 3)) - 500, -2000);
    else if (v > 32000) v = 32000;
    space = trunc(v * 0.75);
  }
  s.setSpace?.(space);                                                            // 0x711150/0x7111e9/0x7111f3/0x711339: +0x29 før afleveringerne

  // --- PASS score, 0x711264 / 0x7112dd: weight x (pressure + blockers + 4) / 5  (+2 in the box). Afleveringsmulighederne 0x6c6a30 regnes HER,
  // mens +0x29 endnu er uden de 70 (baseline 3·(+0x29 − 1000)) – og slet ikke i tilstand 4 (0x711339 springer til 0x71133f)
  let P = 0;
  const pass = s.mode !== 4 ? s.pass : null;                                     // tilstand 4: [esp+0x58] forbliver uden modtager
  if (pass) P = trunc((pass.weight * (s.pressure + s.blockers + (inAttBox(c) ? 2 : 4))) / 5);
  space += 70; // 0x711342
  s.setSpace?.(space);
  let R = 0; // RUN
  let H = 0; // HOLD
  let S = 0; // SHOOT

  // --- opponent plays the offside trap, 0x711366
  if (s.oppOffsideTrap && c.decisionsRoll > rand(5) && !inAttBox(c) && !inOwnBox(c) && attHalf(c)) {
    R = 4000 - P;
    H = 2000 - trunc(P / 2);
  }

  // --- SHOOT base, 0x711442
  let shotFlag = false;
  let noisyShot = 0;
  if (h === 4) {
    // header situation
    if (D < 1 || ((c.y === 0 || c.y === 11) && Math.abs(c.x - 4) === 1))
      S = trunc(c.heading * 75 + 2500 - 400 * s.blockers); // 75 @0x96d750, 2500 @0x968dac
    else S = -5000;
  } else if (D <= 1.5) {
    S = trunc(c.finishing * 100 + 3000 - 400 * s.blockers + space * 1.2); // 100 @0x968960, 3000 @0x96d408, 1.2 @0x968978
  } else {
    const range = 3 + rand(3) + trunc(c.flairRoll / 7); // 0x71151f
    if (range <= D) S = -500;
    else if (s.mode === 4 && c.flairRoll <= rand(50)) S = -500;
    else {
      const shot = s.shotScore(space);
      const k = trunc(D * 75 - c.decisionsRoll * 4);
      noisyShot = shot + rand(-(rand(k) + trunc(c.decisionsRoll * 4 - D * 75)));
      shotFlag = true;
      if (shot > 0) {
        const f = Math.max(c.flairRoll, 1);
        S = trunc(shot * shot * 0.3333333333333333 - (D * D * 4000) / f - 700 * s.blockers); // fmul 1/3 (double 0x968a80 – ikke division: 182² giver 5007), 4000 @0x96d40c
      } else {
        S = (4 * (c.decisionsRoll + c.creativityRoll) + 2) * shot;
      }
    }
  }

  // --- score line, 0x7116a7
  if (s.teamMode === 5) {
    const behind = s.oppGoals - s.ownGoals;
    S += 3000 * behind;
    P *= 2;
    // 0x7116eb–0x711727: ikke keeper (sub_6c38c0 ≠ 1) → rand(2·(3·behind + Professionalism)) < 1 → motivationen +0x100 −1
    if (!c.isGoalkeeper && rand(2 * (3 * behind + c.professionalism)) < 1) s.dropMotivation?.();
  } else if (s.ownGoals - 2 > s.oppGoals) {
    S += 3000 * (s.oppGoals - s.ownGoals + 2);
    P *= 2;
  }

  // --- RUN: clear run and one-on-one with the keeper, 0x711761
  let oneOnOne = false;
  if (h < 4 && D > 0) {
    if (s.clearRun === 2) {
      const d3 = crtPow(trunc(D), 3);                                        // 0x7117a7
      R += trunc((rand(4) + 1) * trunc((c.dribbling * c.dribbling + 1) * 0.5) * d3);
    }
    const k = s.oppKeeper;
    if (k && k.x === c.x && k.y === c.y && s.oppInCell === 1) {
      const duel = rand(trunc(c.dribbling * 10)) - rand(trunc(c.finishing * 10));
      R += trunc(duel * (D * 50 + 150)); // 50 @0x969560, 150 @0x96d840
      oneOnOne = true;
    }
  }

  // --- protecting a lead late on: hold in the corner / run to the corner flag, 0x7118ea
  let runToCorner = false;
  if (s.clearRun === 0 && P < 3000 && s.mode !== 4) {
    const minute = trunc(s.clockTicks / 11);
    if (minute > rand(20) + 70 && !inAttBox(c) && c.decisionsRoll !== 0 && h < 3 &&
        rand(c.sportsmanship) < rand(10) && s.protectLead && s.lead > 0 && s.lead < 3) {
      if (wide(c.x) && finalThird(c)) return { kind: 'hold', timeWasting: true }; // 0x711a42
      if (attHalf(c) && space > -20 && S < 0) {
        runToCorner = true;
        R += 4000;
      }
    }
  }

  // --- close to goal with a good shot: holding is worse, 0x711a87
  if (D < 3 && S > 0) H += trunc(S / -5);

  // --- carrier is a goalkeeper, 0x711aba
  if (c.isGoalkeeper) {
    if (c.positioningRoll !== 0) R += trunc(c.flair * 250 - 5000);
    if (ownHalf(c)) S -= 25000;
  }

  // --- the opposing keeper, 0x711b1a
  const k = s.oppKeeper;
  if (k && attHalf(c)) {
    if (!k.isRealKeeper) S += 5000;
    else if (k.hasActed && c.creativityRoll + 5 > rand(trunc(D * 20))) S += 1500;
    if (!keeperInBox(k, c.side)) {
      if (c.creativityRoll + 5 > rand(trunc(D))) S -= trunc(c.dribbling * 100 - 2500);
    } else if (k.x === 4 && k.y === goalRow(c)) {
      if (!k.covers && c.creativityRoll > rand(trunc(D * 10))) S -= trunc(c.dribbling * 40 - 1000);
    } else {
      if (c.creativityRoll + c.morale - 10 > rand(trunc(3 * D * D))) S -= trunc(c.dribbling * 40 - 1500);
      if (k.x === c.x && k.y === c.y) R += trunc((c.morale + c.dribbling) * 100 - 3000);
    }
  }

  // --- headers far out / goal line, 0x711d32
  if (h === 4 && D > 1) S += trunc(D * D * -750);
  else if (c.x > 3 && c.x < 7 && onGoalLine(c)) S += 5000 - Math.abs(c.x - 4) * 2000; // only x 4..6 (sic)

  // --- nobody to pass to, 0x711dbb
  if (!(pass && pass.hasTarget) && s.teammatesAhead === 0) P -= 2000;

  // --- clear it from the own third, 0x711dd3
  if (ownThird(c) && h !== -1 && c.decisionsRoll !== 0 && P < 4000 - s.clockTicks && s.protectLead)
    return { kind: 'loftedBall', clearance: true, arg: 1 };

  // --- under pressure in his own box (nearest opponent <= 1.5) or own third (< 1.0): maybe clear, 0x711e5a
  if ((inOwnBox(c) && s.nearestOpp <= 1.5) || (ownThird(c) && s.nearestOpp < 1.0)) {
    if (rand(trunc(3000 - s.nearestOpp * 1000)) > rand(P + 2000) && h !== -1 && s.mode !== 4)
      return { kind: 'loftedBall', clearance: true, arg: 0 };
  }

  // --- through on goal, 0x711f38
  if (s.pastLastLine || (s.noDefenderGoalSide0 && s.teammatesAhead === 0 && !c.isGoalkeeper)) {
    R += trunc(D * 1500 - 1500); // 1500 @0x96d3e4
    H -= 5000;
    if (s.mode === 4) R += trunc(D * 2000 - 1500);
    if (ownHalf(c)) S -= 3000;
    if (inAttBox(c)) { H -= 1000; S += 1000; }
  } else {
    if (inAttBox(c)) H -= 1000;
    if (inOwnBox(c)) { H -= 1000; R -= 1200; }
    else if (ownHalf(c) && !s.facingGoal) R += 100 * (-5 - challenge);
  }

  // --- space to run into, 0x71217d (keeper or in his own box: holding gets the bonus instead)
  if (!c.isGoalkeeper && !inOwnBox(c)) R += trunc((c.dribbling - 20 + s.nearestOpp * 7.5) * 120);
  else H += trunc(s.nearestOpp * 500 - 1200);

  // --- back to goal in the attacking half: turn and run, 0x71220c
  if (!goalMouth(c) && !s.facingGoal && attHalf(c)) R += 2000 - P;

  // --- run target, 0x712292
  if (s.runTarget.found) {
    H -= 3000;
    if (wide(c.x) && attHalf(c) && !finalThird(c)) { R += 1250; S -= 500; }
    else if (finalThird(c) && !inAttBox(c)) { R += 1000; S += 100 * (c.flairRoll - 20); }
  } else if (central(c.x) || finalThird(c)) {
    R -= 3000;
  } else {
    // wide, not in the final third. TODO: bit 0x38 / 0x880 names guessed (midfield / wide roles)
    if ((c.posFlags & 0x38) && (c.posFlags & 0x880) && (c.sideFlags & 0x880) && !ownThird(c)) {
      R += trunc((c.flairRoll + c.dribbling) * 10); S -= 650;
    } else if ((c.posFlags & 0x38) && (c.posFlags & 0x880)) {
      R += trunc((c.flairRoll + c.dribbling) * 10 - 250); S -= 650;
    } else { R -= 3000; S -= 650; }
  }

  // --- central shooting lane, 0x712559
  if (central(c.x) && !inAttBox(c) && h !== 4) {
    const risk = rand(trunc((s.blockers + 1) * (D + 1) * D * D * D * 200));
    S += ((c.posFlags & 0x40) ? 500 : 325) * c.flairRoll - risk; // TODO 0x40 probably "forward"
  } else if (inAttBox(c)) {
    S += trunc((c.flairRoll + c.finishing - c.teamwork) * (20 - D * 4));
  } else if (attHalf(c)) {
    S -= trunc(D * 300 - 75 * c.flairRoll);
  }

  // --- instructions or "doing his own thing" (Teamwork), 0x7126ee
  if (rand(trunc(c.teamwork)) === 0 && ((c.posFlags & 0x40) || rand(4) === 0)) {
    if (!(ownHalf(c) && (c.decisionsRoll !== 0 || c.creativityRoll !== 0)))
      R += trunc(crtPow(c.dribbling, 3) + 1000 - (inOwnBox(c) ? 1000 : 0));   // 0x712828
    if (D >= 2 && D < 4.5 && central(c.x)) {
      if (c.flairRoll !== 0) S += 2 * (200 * rand(trunc(c.longShots)) + space) + 2500;
    } else if (inAttBox(c)) {
      S += trunc((20 - D * 4) * (c.flairRoll + c.finishing));
    }
  } else if (s.mode !== 4) {
    if (c.runWithBall && !inOwnBox(c) && s.pressure < 2 && D >= 2 &&
        (challenge === 0 || attHalf(c) || rand(2 * c.decisionsRoll + 20) < D)) {
      R += trunc(10 * (30 * c.b11 + space + 400) - P + c.flairRoll * c.dribbling * c.teamwork);
      if (wide(c.x) && (c.posFlags & 0x880) && (c.sideFlags & 0x880) && !finalThird(c) && c.crossBall) {
        R += 500; P -= 250;
      }
    }
    if (c.holdUpBall && attHalf(c) && !goalMouth(c) && !s.facingGoal) H += 3500;
    if (c.longShotsInstr && D >= 2 && D < 4.5) S += 2 * (200 * rand(trunc(c.longShots)) + space);
  }

  // --- line of sight check, 0x712c91 (sub_713e90 = which foot; weak foot costs rand(300·b2d))
  if (h < 2 || (D > 1.41 && h < 4)) {
    if (s.sightCheckFails && s.clearRun === 0) S -= rand(300 * c.b2d);
  }
  if (D < 5) S -= trunc((challenge * challenge * challenge) / (10 - D));
  if (h === 3) S -= 2000;

  // --- ahead of his tactical position, 0x712d7e
  const t = 100 * ((s.runTarget.found ? 1 : 0) - s.nearbyOpp);
  R += t - trunc((400 - c.flair * 15) * s.beyondTactical * s.beyondTactical);
  H += t;

  // --- flair: tricks and snap shots, 0x712de5
  if (D >= 1 && Math.pow(c.flairRoll, 4) > rand(trunc(D * 10000))) {
    if (!inOwnBox(c) && D >= 2 && s.pressure < 2 &&
        (attHalf(c) || (c.decisionsRoll === 0 && c.creativityRoll === 0)))
      R += rand(trunc(crtPow(c.dribbling, 3) + 3 * space + (10000 - P)));   // 0x712ebb
    if (h < 4 && s.blockers < 2 && (D < 5 || (D < 7 && rand(500) === 0)))
      S += rand(trunc(400000 / Math.max(rand(trunc(D * 10)), 10))); // 0x61a80
    H -= 10000;
  } else if (!inOwnBox(c) && rand(trunc(c.decisionsRoll * 30)) > rand(200)) {
    for (let i = 0; i < s.committedOppInCell; i++)
      R += rand(trunc(c.dribbling * 125 + c.morale * 100));
  }

  // --- cost of running, 0x7130a9
  let cost = -10 * space - 100 * c.momentum
    - trunc((10000 - c.condition) * Math.fround(-0.2))                          // 0x7130f3: fmul dword [0x96d820] (float −0,2)
    - trunc(crtPow(h, 3) * -200);   // 0x7130c4
  if (pass && pass.hasTarget && P > 0 && [0x5e, 8, 7, 6].includes(pass.type)) cost += P;
  else if (c.crossBall && (c.posFlags & 0x880) && (c.sideFlags & 0x880)) {
    if (c.y === 0 || c.y === 11) cost += 500;
    else if (wide(c.x)) {
      if (finalThird(c)) R += 2000;
      else if (D < 5) R += 6000;
    }
  }
  if (!oneOnOne && S > 2000 && space > -50) cost += rand(S);
  if (c.decisionsRoll === 0) cost = rand(cost);
  if (ownHalf(c)) cost = Math.max(cost, 0);
  R -= cost;

  // --- on the byline, 0x713272
  if (wide(c.x) && h < 3 && onGoalLine(c)) {
    if (pass && pass.hasTarget && [8, 7, 6].includes(pass.type)) {
      P += 1500;
      if (c.crossBall) P += 1500;
    } else if (rand(10) !== 0) {
      return { kind: 'loftedBall', clearance: false, arg: 0 }; // cross from the byline
    }
  }

  // --- noise, 0x713333: rand(50 x (20 - decisions roll)) on each score
  const n = 50 * (20 - c.decisionsRoll);
  P += rand(n);
  R += rand(n);
  H += rand(n);
  S += rand(n);
  s.traceScores?.(P, R, H, S, pass ? pass.weight : 0, s.blockers, space, s.pressure);

  // --- choose, 0x7133bf
  const PASS = 1, HOLD = 2, SHOOT = 3, RUN = 4;
  let best = S;
  let act = SHOOT;
  if (S < R && h !== 4 && h !== -1 && !(c.x === 4 && onGoalLine(c))) { best = R; act = RUN; }
  if (best < H && h !== 4 && h !== -1 && !s.noDefenderGoalSide1 &&
      !(c.lastAction === ACTION.hold && s.possessionCounter >= 12)) { best = H; act = HOLD; }

  let skipChecks = false;
  if (c.lastAction === ACTION.hold || h !== -1) {
    if (best < P && s.mode !== 4) {
      if (pass && pass.hasTarget) { act = PASS; skipChecks = true; }
      // 0x7134d8–0x713513: med medspillere foran UDEN for den sidste tredjedel (side 0: y ≤ 8, side 1: y ≥ 3) eller boldhøjde 4 →
      // sub_6fa490 uden ny handling (0x71378e)
      else if ((s.teammatesAhead !== 0 && !finalThird(c)) || h === 4) {
        return { kind: 'loftedBall', clearance: false, arg: 0 };
      } else {
        act = rand(c.lastAction === ACTION.hold ? 10 : 2) !== 0 ? RUN : HOLD;
      }
    }
  } else {
    act = HOLD;
    skipChecks = true;
  }

  // --- vetoes, 0x71353c
  if (!skipChecks) {
    if (act === SHOOT) {
      let checkSecond = true;
      if (!goalMouth(c) && !s.facingGoal) {
        if (h === 3) {
          if (!(c.flairRoll > rand(15) && D < 2.1)) { act = HOLD; checkSecond = false; } // volley or not
        } else if (h === 4) { act = PASS; checkSecond = false; }
        else { act = RUN; checkSecond = false; if (h === 4 || h === -1) act = PASS; }
      }
      if (checkSecond) {
        if ((h === 4 && D >= 2) || h === -1) act = PASS;
        else if (attHalf(c) && (central(c.x) || c.flairRoll >= rand(120))) { /* keep the shot */ }
        else if (s.mode === 4) { /* keep */ }
        else if (pass && pass.hasTarget) act = PASS;
        else if (h < 3 && s.nearestOpp > 1.5) {
          if (c.lastAction === 2) act = RUN; // TODO action 2 unknown
          else act = rand(trunc(c.dribbling)) + c.flairRoll >= rand(50) ? RUN : HOLD;
        } else {
          return { kind: 'loftedBall', clearance: false, arg: 0 };
        }
      }
    } else if (act === RUN && (h === 4 || h === -1)) {
      act = PASS;
    }
  }
  if (c.lastAction === ACTION.forcedShot) act = SHOOT;
  if (s.mode === 4 && (act === PASS || act === HOLD || !s.runTarget.found)) act = SHOOT;

  // --- carry it out, jump table 0x713776
  switch (act) {
    case PASS:
      if (pass && pass.hasTarget) return { kind: 'pass', action: ACTION.pass, pass: pass };
      return { kind: 'loftedBall', action: ACTION.noTargetLoftedBall, clearance: false };
    case HOLD:
      return { kind: 'hold', timeWasting: false };
    case SHOOT: {
      if (s.mode === 4) return { kind: 'wouldShoot' };
      s.onShootStart?.();                                                     // 0x713bf9–0x713c48: GREAT_FIRST_TOUCH før sub_700bd0
      const fresh = s.shotScore(space);
      const quality = shotFlag ? trunc(fresh / 2) + trunc(noisyShot / 2) : fresh; // 0x713c55
      return { kind: 'shoot', quality };
    }
    default:
      return runDecision(s, rand, runToCorner);
  }
}

/** RUN branch, 0x7137e4. */
function runDecision(s: Situation, rand: Rand, runToCorner: boolean): Decision {
  const c = s.carrier;
  let { found, tx, ty } = s.runTarget;
  if (runToCorner) {
    // 0x7137ec: to the corner flag on his side of the pitch
    const tacX = s.tacticalX;
    const right = tacX > 4 || (tacX === 4 && rand(2) !== 0);
    tx = right ? 8 : 0;
    ty = goalRow(c);
    found = true;
  }
  if (!goalMouth(c) && !s.facingGoal && (!found || s.mode === 4)) {
    // 0x7138ee: turn and go forward 3 rows (sub_6f4920 then sub_6f09f0 with action 0x0f)
    // sub_6f4920(x, y, 4, fy) turns him towards (4, fy); sub_6f09f0(x, y, 0x0f, 0, 0) then runs
    // 0x713941/0x71395c: målet for sub_6f09f0 er hans EGET felt (x, y) med handling 0x0f – han vender sig og dribler på stedet
    const fy = c.side === 0 ? (c.y < 9 ? c.y + 3 : 11) : (c.y > 3 ? c.y - 3 : 0);
    return { kind: 'run', action: ACTION.turnAndRun, tx: c.x, ty: c.y, turn: [4, fy] };
  }
  if (!found && s.mode !== 4 && c.flairRoll === 0) {
    // 0x71397f
    if (rand(10) === 0 || s.goalPathBlocked)
      return { kind: 'loftedBall', action: ACTION.noTargetLoftedBall, clearance: false };
    return { kind: 'hold', timeWasting: false };
  }
  // 0x7139f1: klemt til banen – uden løbemål er sub_6bce80's ud-værdier −1, −1 (0x6bd58f), så målet bliver (0, 0) (sic)
  tx = Math.min(8, Math.max(0, tx));
  ty = Math.min(11, Math.max(0, ty));
  // 0x713a1f–0x713a89 (sikker): først sub_6f4920 – side 0 med tx ≥ x / side 1 med tx ≤ x vender mod ((tx + 4)/2, ty/2 + 6 | ty/2),
  // ellers mod (tx, ty); heltalsdivision mod nul
  const turn: [number, number] = (c.side === 0 ? tx >= c.x : tx <= c.x)
    ? [trunc((tx + 4) / 2), trunc(ty / 2) + (c.side === 0 ? 6 : 0)] : [tx, ty];
  // 0x713ad2: handling 0x12, når den forrige var 0x11/0x12, ellers 0x11 (0x713aed–0x713b5d: returbold-karakteren er ikke porteret)
  const action = c.lastAction === ACTION.startRun || c.lastAction === ACTION.continueRun
    ? ACTION.continueRun : ACTION.startRun;
  return { kind: 'run', action, tx, ty, turn };
}

// ------------------------------------------------------------------ helpers for your engine

/**
 * Approximate match-day float (about 0..20) from a shown 1..20 attribute, assuming the
 * match CA term equals CA: float = 0.1 x (CA + 2 x intrinsic) = 2 x (t - 10) where the
 * shown value is (0.1 t^2 + t) / 3 + 0.5. TODO: approximate - sub_6ec010 also subtracts
 * penalties, uses a "match CA" word (+0x3b) and softens values above 16.
 */
export function matchFloatFromShown(shown: number): number {
  const t = (-1 + Math.sqrt(1 + 1.2 * shown)) / 0.2;
  return Math.max(0, 2 * (t - 10));
}

/** The per-tick rolls of sub_6f44a0 / caps of sub_6ef5b0..0x6ef83a. `form` = word +0x37 (TODO: unknown scale). */
export function rollDecisions(decisions: number, rand: Rand): number {
  const cap = trunc(Math.max(decisions + 2, 2));
  return Math.max(rand(cap), rand(cap));
}
export function rollCreativity(creativity: number, form: number, rand: Rand): number {
  const cap = trunc(Math.max(trunc(form / 3) + creativity * 0.8 + 5, 2));
  return Math.max(rand(cap), rand(cap));
}
export function rollFlair(flair: number, morale: number, rand: Rand): number {
  const cap = trunc(Math.max(0.05 * crtPow(morale + flair - 10, 2), 2));   // 0x6ef6fc
  return rand(cap);
}
export function rollPositioning(positioning: number, form: number, rand: Rand): number {
  const cap = trunc(Math.max(trunc(form / 3) + positioning + 4, 2));
  return Math.max(rand(cap), rand(cap));
}
