// Kilde: cm-01-02-bosman-edition/app/identical/2_3_helpers_and_fields/helpers_and_fields.ts (kopieret 2026-11-09).
// Porteret af Bosman-projektet; ændringer: `clamp` eksporteret, ubrugt parameter omdøbt til _freeRoleInstr (strenge tsconfig).
// Gittermotoren (gridMatch.ts) er et laboratorium ved siden af MatchSim – ikke koblet ind i spillet.
/**
 * Helpers and match-player fields of CM 01/02 (cm0102.exe sha256 0c78e7da…bff86), ported 1:1.
 * See HELPERS_AND_FIELDS.md. Every constant has the instruction address (and .rdata address) it was read at.
 * "sikkert" unless a comment says otherwise.
 */

// ------------------------------------------------------------------ basics
export type Side = 0 | 1;
export const rand = (n: number, rng: () => number = Math.random): number =>
  n === 0 ? 0 : n > 0 ? Math.floor(rng() * n) : -Math.floor(rng() * -n); // sub_90cfc0 (n<0 → n+1..0)
import { crtPow } from '../crtMath';
import { DIST } from './loop';

export const ftol = (x: number) => Math.trunc(x); // sub_945640
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** float[12][9] at 0xa15e44: tbl[|dy|][|dx|] (≈ sqrt(dx²+dy²), håndafrundet i originalen – tabellen i loop.ts); outside → 1000 (0x96d2dc). */
export function cellDist(dx: number, dy: number): number {
  dx = Math.abs(dx); dy = Math.abs(dy);
  if (dx > 8 || dy > 11) return 1000;
  return DIST[dy][dx];
}

/** Position flag bits, sub_6c38c0 (position) / sub_6c38f0 (position in attack). */
export const POS = {
  GK: 0x1, SW: 0x2, D: 0x4, DM: 0x8, M: 0x10, AM: 0x20, F: 0x40,
  LEFT: 0x80, LEFT_CENTRE: 0x100, CENTRE: 0x200, RIGHT_CENTRE: 0x400, RIGHT: 0x800, FREE_ROLE: 0x1000,
  WIDE: 0x880, MIDFIELD: 0x38,
} as const;

export interface MatchPlayer {
  side: Side;            // +0x27
  slot: number;          // +0x19 (0..10, -1 bench, -2 unavailable)
  x: number; y: number;  // +0x102, +0x103
  pos: number;           // sub_6c38c0
  posAttack: number;     // sub_6c38f0
  busy: number;          // +0x2b
  facing: number;        // +0x19a degrees
  momentum: number;      // +0x19c (-200..200)
  action: number;        // +0x198
  strongFoot: 0 | 1;     // +0x2c (0 left, 1 right)
  weakFootPenalty: number; // +0x2d = 20 - weaker foot
  leftFoot: number; rightFoot: number; // record +0x30 / +0x3b
  technique: number;     // +0xe5
  rolls: { b107: number; b108: number; b10a: number; b10c: number }; // sub_6f44a0
  tacklingBit2: boolean; // sub_5b57c0(...) & 2 for his slot
  challengers: MatchPlayer[]; // +0x1ae[0..+0x101)
}
const isKeeper = (p: MatchPlayer) => p.pos === POS.GK; // sub_717410() == 1

// ------------------------------------------------------------------ sub_6bcbd0 pressure
/** Returns pressure count and w70 (summed challenge strength). Only opponents in the carrier's own cell. */
export function pressure(p: MatchPlayer, oppsInCell: MatchPlayer[]) {
  let count = 0, w70 = 0;
  const mom = Math.trunc(p.momentum / 20); // 0x6bcca1 imul 0x66666667, sar 3
  for (const o of oppsInCell) {
    if (o.slot < 0) continue;                                    // 0x6bcc5a
    if (p.challengers.includes(o)) {                             // sub_714c60
      count += 2;                                                // 0x6bcc7f
      const t = o.tacklingBit2 ? o.rolls.b10a : o.rolls.b108;    // sub_6f4600
      w70 += ftol((t + o.rolls.b10a - mom - p.rolls.b107) * 1.7); // 1.7 @0x96d2e0 (0x6bccd2)
    } else if (o.busy >= 0 && !isKeeper(o) && (o.rolls.b10a !== 0 || (o.action & 0x100) !== 0)) {
      count += 1;                                                // 0x6bcd25
      w70 += ftol(((o.rolls.b10a - mom - p.rolls.b107) * 1.7) / (o.busy + 1)); // 0x6bcd5d
    }
  }
  return { count, w70 };
}

// ------------------------------------------------------------------ sub_6c3a00 / sub_6c3950
export function opponentsClose(opps: MatchPlayer[], x: number, y: number, includeBusy: boolean): number {
  let n = 0;
  for (const o of opps) {
    if (o.slot < 0 || isKeeper(o) || (!includeBusy && o.busy !== 0)) continue;
    const d = cellDist(o.x - x, o.y - y);   // sub_6f09b0
    if (d === 0) n += 3;                    // 0x6c3a6b
    else if (d <= 1.5) n += 1;              // 1.5 @0x968940 (0x6c3a70)
  }
  return n;
}
export function nearestOpponent(opps: MatchPlayer[], x: number, y: number, includeBusy: boolean): number {
  let best = 5000;                          // 0x459c4000 (0x6c3970)
  for (const o of opps) {
    if (o.slot < 0 || (o.pos & 1) || (!includeBusy && o.busy !== 0)) continue;
    const d = cellDist(o.x - x, o.y - y);
    if (d === 0) return 0;
    if (d < best) best = d;
  }
  return best;
}

// ------------------------------------------------------------------ sub_6cc070 (+ sub_6cd3d0 mode 2)
/** Cells on the line (x0,y0)→(x1,y1), both ends included, in the original's stepping order. */
export function lineCells(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const out: [number, number][] = [];
  const adx = Math.abs(x1 - x0), ady = Math.abs(y1 - y0);
  const inside = (x: number, y: number) => x >= 0 && x <= 8 && y >= 0 && y <= 11;
  if (adx === 0) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) { if (!inside(x0, y)) break; out.push([x0, y]); } return out; }
  if (ady === 0) { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) { if (!inside(x, y0)) break; out.push([x, y0]); } return out; }
  if (adx >= ady) {                               // x-major (0x6cc277)
    if (x0 > x1) [x0, y0, x1, y1] = [x1, y1, x0, y0];
    const step = y1 - y0 >= 0 ? 1 : -1; let err = 0, y = y0;
    for (let x = x0; x <= x1; x++) { if (err >= adx) { err -= adx; y += step; } if (!inside(x, y)) break; out.push([x, y]); err += ady; }
  } else {                                        // y-major (0x6cc3aa)
    if (y0 > y1) [x0, y0, x1, y1] = [x1, y1, x0, y0];
    const step = x1 - x0 >= 0 ? 1 : -1; let err = 0, x = x0;
    for (let y = y0; y <= y1; y++) { if (err >= ady) { err -= ady; x += step; } if (!inside(x, y)) break; out.push([x, y]); err += adx; }
  }
  return out;
}
/** blk: defenders (team without the ball, keeper included) with busy ≤ 1 on the line, own cell included. */
export function blockersOnLine(defenders: MatchPlayer[], x0: number, y0: number, x1: number, y1: number): number {
  let n = 0;
  for (const [x, y] of lineCells(x0, y0, x1, y1))
    n += defenders.filter((d) => d.slot >= 0 && d.busy <= 1 && d.x === x && d.y === y).length; // 0x6cd3fe, 0x6cd412
  return n;
}

// ------------------------------------------------------------------ sub_715f50 tactical column drift
export function tacticalColumn(p: MatchPlayer, x: number, r: PosRatings, rng?: () => number, rnd?: (n: number) => number): number {
  const R = rnd ?? ((n: number) => rand(n, rng));
  if (p.pos & POS.GK) return x;
  if (2 * p.rolls.b10a >= R(21)) return x;                                          // 0x715f7a
  const left = !(p.pos & POS.LEFT) && R(r.l) > R(41) ? (p.side ? 7 : 1) : x;
  const mid = !(p.pos & (POS.LEFT_CENTRE | POS.CENTRE | POS.RIGHT_CENTRE)) && R(r.c) > R(41) ? 4 : x;
  const right = !(p.pos & POS.RIGHT) && R(r.r) > R(41) ? (p.side ? 1 : 7) : x;
  return Math.trunc((left + mid + right) / 3);                                     // imul 0x55555556
}

// ------------------------------------------------------------------ AI team mode (sub_6df460 tail)
/** r = the AI's attack/defence ratio (match+0x476a+4·side). easeOff = the mode-5 conditions (big lead, not a rival). */
export function aiTeamMode(r: number, easeOff = false): 1 | 2 | 3 | 4 | 5 {
  if (easeOff) return 5;                          // 0x6e0193
  if (r <= 0.3) return 4;                         // 0.3 @0x968e80
  if (r < 0.7) return 3;                          // 0.7 @0x968e40
  return r > 1.5 ? 1 : 2;                         // 1.5 @0x968940
}

// ------------------------------------------------------------------ sub_6bd5b0
/** "No outfield opponent goal-side in his column" (onlyAhead = arg 2). */
export function noDefenderGoalSide(p: MatchPlayer, opps: MatchPlayer[], oppsInOwnCell: number, onlyAhead: boolean): boolean {
  if (!onlyAhead && oppsInOwnCell > 0) return false;           // cell count +0x21b6+oppSide
  for (const o of opps) {
    if (o.slot < 0 || isKeeper(o)) continue;
    const ahead = p.side === 1 ? o.y < p.y : o.y > p.y;
    if (ahead && o.x === p.x) return false;                    // 0x6bd677..0x6bd68b
  }
  return true;
}

// ------------------------------------------------------------------ sub_6cb9b0
/** Is (tx,ty) a crossing target for him (he is wide in the last three rows)? */
export function isCrossingPosition(p: MatchPlayer, tx: number, ty: number): boolean {
  const s1 = p.side === 1;
  if (tx < 2 || tx > 6) return false;
  if (!s1 ? ty < 10 || ty > 11 : ty < 0 || ty > 1) return false;
  if (p.x === 4) return false;
  if (p.x > 2 && p.x < 6 && (!s1 ? ty < p.y : ty > p.y)) return false;
  if (!s1 ? p.y < 9 : p.y > 2) return false;
  if (tx <= 2 || tx >= 6) return false;
  if (Math.abs(p.x - tx) <= 1) return false;
  return cellDist(tx - p.x, ty - p.y) > 1.5;                   // 1.5 @0x968940 (0x6cbab4)
}

// ------------------------------------------------------------------ sub_713e90 which foot
const DEAD_BALL_CODES = [0x5b, 0x5c, 0x3d, 0x36, 0x34, 0x37, 0x5a, 0x33, 0x35, 0x39, 0x3];
/** sub_6cb6c0 → tabellen 0xb67c30 (bygget 0x6b8150 ff.): retning i hele grader, 0 = +y, 90 = +x, 180 = −y, 270 = −x; ftol, ikke afrunding
 *  (notes/vision-space-offside.md §6.1). */
/** sub_6fa140 (sikker): vender p (facing +0x19a) mod (tx, ty)? Samme felt → nej (al = 0). Ellers ja ved samme retning eller
 *  |forskel| < ftol(2,25·agility-rul + 45). */
export function facingOk(p: { x: number; y: number; facing: number; roll: { agility: number } }, tx: number, ty: number): boolean {
  const dx = tx - p.x, dy = ty - p.y;
  if (dx === 0 && dy === 0) return false;
  const ang = bearing(dx, dy);
  if (p.facing === ang) return true;
  const lim = Math.trunc(p.roll.agility * 2.25 + 45);
  let d = Math.abs(p.facing - ang); if (d > 180) d = 360 - d;
  return d < lim;
}
export function bearing(dx: number, dy: number): number {
  if (dx === 0) return dy < 0 ? 180 : 0;
  if (dy === 0) return dx > 0 ? 90 : 270;
  const k = 57.29577951471995;                                   // 0x96d2b8
  let a: number;
  if (dx > 0 && dy > 0) a = Math.atan(Math.abs(dx / dy)) * k;
  else if (dx > 0 && dy < 0) a = Math.atan(Math.abs(dy / dx)) * k + 90;
  else if (dx < 0 && dy < 0) a = Math.atan(Math.abs(dx / dy)) * k + 180;
  else a = Math.atan(Math.abs(dy / dx)) * k + 270;
  a = Math.trunc(a);
  return a > 359 ? 0 : a < 0 ? a + 360 : a;
}
/** Direction in degrees between two cells (sub_6cb6c0, sikker). */
export const cellDirection = (x0: number, y0: number, x1: number, y1: number) => bearing(x1 - x0, y1 - y0);

/** sub_6cbc00 (sikker): blokerende på linjen = holdet uden bolden (målmand med, busy ≤ 1). poss −1 → side 0 regnes som
 *  forsvarere (sic). Lige linjer tæller [min, max) – endefeltet ikke med; skrå linjer tæller begge ender. */
export function laneBlockers(gp: { active: boolean; side: number; busy: number; x: number; y: number }[], poss: number,
                             x0: number, y0: number, x1: number, y1: number): number {
  const defSide = poss === 0 ? 1 : 0;
  const cnt = (x: number, y: number) => gp.filter((o) => o.active && o.side === defSide && o.busy <= 1 && o.x === x && o.y === y).length;
  const inside = (x: number, y: number) => x >= 0 && x <= 8 && y >= 0 && y <= 11;
  const adx = Math.abs(x1 - x0), ady = Math.abs(y1 - y0);
  let n = 0;
  if (adx === 0) { for (let y = Math.min(y0, y1); y < Math.max(y0, y1); y++) { if (!inside(x0, y)) break; n += cnt(x0, y); } return n; }
  if (ady === 0) { for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x++) { if (!inside(x, y0)) break; n += cnt(x, y0); } return n; }
  if (adx >= ady) {
    if (x0 > x1) [x0, y0, x1, y1] = [x1, y1, x0, y0];
    const step = y1 - y0 >= 0 ? 1 : -1; let err = 0, y = y0;
    for (let x = x0; x <= x1; x++) { if (err >= adx) { err -= adx; y += step; } if (!inside(x, y)) break; n += cnt(x, y); err += ady; }
  } else {
    if (y0 > y1) [x0, y0, x1, y1] = [x1, y1, x0, y0];
    const step = x1 - x0 >= 0 ? 1 : -1; let err = 0, x = x0;
    for (let y = y0; y <= y1; y++) { if (err >= ady) { err -= ady; x += step; } if (!inside(x, y)) break; n += cnt(x, y); err += adx; }
  }
  return n;
}
/** Returns 0 = left foot, 1 = right foot, 2 = not applicable; penalty = 12·(20 − that foot). */
export function footForTarget(p: MatchPlayer, code: number, x1: number, y1: number, f: number, ballDir?: number) {
  if (DEAD_BALL_CODES.includes(code)) return { foot: 2, penalty: 0 };
  // sub_6cb6c0 (0x6cb6d6–0x6cb6e5): samme felt → boldens retning engine+0x8ed8 (ikke en vinkel af (0, 0))
  let d = (p.x === x1 && p.y === y1 && ballDir !== undefined ? ballDir : cellDirection(p.x, p.y, x1, y1)) - p.facing;
  const sign = d >= 0 ? 1 : -1;
  let a = sign * d;
  if (a > 180) a = 360 - a;                                    // 0x713f4e (0xb4 / 0x168)
  d = sign * a;
  const t = ftol(90 - (18 * f - p.technique));                 // 18 @0x96d84c, 90 @0x96d848
  if (d > t) return { foot: 0, penalty: 12 * (20 - p.leftFoot) };
  if (d < -t) return { foot: 1, penalty: 12 * (20 - p.rightFoot) };
  return { foot: p.strongFoot, penalty: 0 };
}
/** Ball carrier use (0x712cef): shot on the weak foot costs rand(300·b2d). */
export const weakFootShotPenalty = (p: MatchPlayer, D: number, rng?: () => number) => {
  const r = footForTarget(p, 0x16, 4, p.side === 0 ? 11 : 0, D + 1);
  return r.foot !== 2 && r.foot !== p.strongFoot ? rand(300 * p.weakFootPenalty, rng) : 0; // 0x712d05
};

// ------------------------------------------------------------------ sub_713d90 keeper covers
export function keeperCovers(k: MatchPlayer, x: number, y: number): boolean {
  if (k.x === x && k.y === y) return true;
  const gy = k.side === 0 ? 0 : 11;                            // his own goal line
  const a1 = cellDirection(x, y, 4, gy), a2 = cellDirection(x, y, k.x, k.y);
  if (Math.abs(a1 - a2) >= k.rolls.b10c + 10) return false;    // 0x713e14
  return cellDist(4 - x, gy - y) >= cellDist(k.x - x, k.y - gy); // sub_6cc4e0 vs tbl (sic: mixed axes)
}

// ------------------------------------------------------------------ sub_6ce310 score
export function score(o: {
  side: Side; homeGoals: number; awayGoals: number; firstLeg?: { home: number; away: number };
  noAwayGoalsRule?: boolean; awayGoalsOnlyAfter90?: boolean; tick?: number; extraOwnGoal?: boolean;
}) {
  const own = o.side === 0 ? o.homeGoals : o.awayGoals, opp = o.side === 0 ? o.awayGoals : o.homeGoals;
  let home = o.homeGoals, away = o.awayGoals, awayGoalsWin = false;
  if (o.firstLeg) {
    home += o.firstLeg.home; away += o.firstLeg.away;           // team +0x4b / +0x4c
    const bh = o.side === 0 && o.extraOwnGoal ? 1 : 0, ba = o.side === 1 && o.extraOwnGoal ? 1 : 0;
    if (home + bh === away + ba && !o.noAwayGoalsRule && (!o.awayGoalsOnlyAfter90 || (o.tick ?? 0) > 990)) {
      if (o.side === 0) awayGoalsWin = o.awayGoals + bh < o.firstLeg.home; // 0x6ce414
      else awayGoalsWin = o.awayGoals + ba > o.firstLeg.home;           // 0x6ce42f
    }
  }
  const forG = o.side === 0 ? home : away, against = o.side === 0 ? away : home;
  void own; void opp;
  return { forG, against, awayGoalsWin, lead: awayGoalsWin ? 1 : forG - against };
}

// ------------------------------------------------------------------ rolls (sub_6eecb0 caps, sub_6f44a0)
export interface MatchAttrs {
  acceleration: number; aggression: number; agility: number; anticipation: number; balance: number;
  bravery: number; corners: number; crossing: number; decisions: number; dribbling: number;
  finishing: number; flair: number; freeKicks: number; handling: number; heading: number;
  jumping: number; longShots: number; marking: number; offTheBall: number; oneOnOnes: number;
  passing: number; penalties: number; positioning: number; reflexes: number; pace: number;
  stamina: number; strength: number; tackling: number; teamwork: number; technique: number;
  throwIns: number; versatility: number; creativity: number; workRate: number;
}
export function rollCaps(a: MatchAttrs, positionFit: number, morale: number) {
  const f = Math.trunc(positionFit / 3);                       // imul 0x55555556
  const cap = (v: number) => Math.max(ftol(Math.max(v, 2)), 2); // fcom 2.0 @0x9689a8 / 0x968950
  return {
    c10e: cap(a.pace + 4),                                     // 0x6ef5de
    c110: cap(f + a.positioning + 4),                          // 0x6ef624
    c111: cap(f + 0.9 * a.offTheBall + 5),                     // 0.9 @0x9689d8, 5 @0x9688a0
    c112: cap(f + a.marking + 4),
    c113: cap(0.05 * crtPow(morale + a.flair - 10, 2)),            // 0.05 @0x967888
    c114: cap(f + 0.8 * a.creativity + 5),                     // 0.8 @0x9689b0
    c115: cap(f + a.anticipation + 5),                         // 5 @0x968990
    c116: cap(a.workRate + 2),
    c117: cap(a.agility + 5),
    c10f: cap(a.decisions + 2),
  };
}
export function rolls(c: ReturnType<typeof rollCaps>, condition: number, rng?: () => number) {
  const r = (n: number) => rand(n, rng), m2 = (n: number) => Math.max(r(n), r(n));
  const c104 = ftol(condition * 0.0025) + c.c10e - 25;         // 0.0025 @0x96d758, 0x19
  return {
    b104: m2(c104), b10a: m2(c.c110), b107: r(c.c111), b108: r(c.c112), b109: r(c.c113),
    b10b: m2(c.c114), b106: m2(c.c10f), b105: r(c.c115), b10d: r(c.c116), b10c: r(c.c117),
  };
}

// ------------------------------------------------------------------ +0x37 position fit (sub_6eecb0)
/** Record position ratings 1..20 (record +0x0f..+0x1a). */
export interface PosRatings { gk: number; sw: number; d: number; dm: number; m: number; am: number; f: number; wb: number; r: number; l: number; c: number; free: number }
function rowRating(flags: number, other: number, r: PosRatings, _freeRoleInstr: boolean): number | null {
  const wide = (flags & POS.WIDE) !== 0;
  if (flags & POS.SW) return r.sw;
  if (flags & POS.D) return r.d;
  if (flags & POS.DM) {
    if (!wide) return r.dm;
    if (other & POS.WIDE && other & 0x78) return r.wb;          // 0x6eef2a
    if (other & POS.WIDE && other & 0x6) return r.d;            // 0x6eef0f
    return r.dm;
  }
  if (flags & POS.M) return Math.max(r.am - 5, r.m);            // 0x6eef62
  if (flags & POS.AM) return wide ? r.am : null;                // central AM handled by caller
  if (flags & POS.F) return r.f;
  return null;
}
const sidePen = (flags: number, r: PosRatings) =>
  flags & POS.LEFT ? r.l - 20 :
  flags & POS.LEFT_CENTRE ? Math.max(r.c, Math.trunc(r.l / 2)) - 20 :
  flags & POS.CENTRE ? r.c - 20 :
  flags & POS.RIGHT_CENTRE ? Math.max(r.c, Math.trunc(r.r / 2)) - 20 :
  flags & POS.RIGHT ? r.r - 20 : 0;
export function positionFit(pos: number, posAttack: number, r: PosRatings, versatility: number, freeRoleInstr = false): number {
  let v = 0;
  if (pos & POS.GK) {
    const b = r.gk > 15 ? 20 : ftol(0.75 * r.gk + 5);           // 0.75 @0x969040, 5 @0x9688a0
    v += 2 * b - 40;                                            // 0x6eed0c
  } else if ((pos & POS.AM) && !(pos & POS.WIDE)) {
    const prod = (freeRoleInstr ? r.free : r.f) * r.am;         // instr 0x200000 (0x6ef000)
    v += ftol((20 - 0.05 * prod + 0.5) * -1.5);                 // 0x967888, 0x968ea8, 0x968968, -1.5 @0x96d740
  } else {
    const rr = rowRating(pos, posAttack, r, freeRoleInstr);
    if (rr !== null) v += ftol((20 - rr) * -1.5);               // 0x6ef08a
  }
  v += sidePen(pos, r);                                         // 0x6ef0bc..0x6ef184
  if (pos & POS.FREE_ROLE) v += r.free - 20;                    // 0x6ef1ae
  if (posAttack !== pos) {
    // first matching attack row, -0.75 @0x969530 (0x6ef216..0x6ef42c)
    const a = posAttack;
    const rr = a & POS.SW ? r.sw : a & POS.D ? r.d : a & POS.DM ? r.dm : a & POS.M ? Math.max(r.am - 5, r.m)
      : a & POS.AM ? r.am : a & POS.F ? r.f : null;
    if (rr !== null) v += ftol((20 - rr) * -0.75);
  }
  // half side penalty of the attack position, applied in every case (0x6ef1e2 je → 0x6ef4d6; 0x6ef4ea..0x6ef5ab)
  const a = posAttack;
  const half = a & POS.LEFT ? r.l : a & POS.LEFT_CENTRE ? Math.max(r.c, Math.trunc(r.l / 2))
    : a & POS.CENTRE ? r.c : a & POS.RIGHT_CENTRE ? Math.max(r.c, Math.trunc(r.r / 2)) : a & POS.RIGHT ? r.r : null;
  if (half !== null) v += Math.trunc(half / 2) - 10;
  return ftol(v * (1.079 - 0.0395 * versatility));              // 1.079 @0x96d730, 0.0395 @0x96d738 (0x6ef5d4)
}

// ------------------------------------------------------------------ sub_6ec010 attribute → match float
export interface MatchCaInput {
  ca: number; pa: number; isKeeper: boolean;
  captainInfluence?: number;   // capt (after age/loyalty/professionalism/atmosphere factors), default 0
  nerves?: number;             // [esp+0x1c] (≥ 1 when match+0x1ad+side ≠ 0), default 0
  history0a?: number;          // hist[id].b0a, table 0xae2d0c — ukendt meaning, default 0
  motivation?: number;         // +0x100
  morale?: number;             // +0x17 (10 neutral)
  formRoll?: number;           // +0x118 = rand(20)
  badDaySeverity?: number;     // +0x119
  badDayThreshold?: number;    // h + floor(morale/2) - 5 + Consistency - nerves + bl + motivation
  nationalTeam?: boolean;      // sub_53b900(+0xf9)
  youthBigOccasion?: boolean;  // 0x6ec8d8..0x6ec9c2 (always +2.5 in practice)
}
/** Returns match CA (+0x3b), the "bad day" deduction [esp+0x14] and the softening flag. */
export function matchCa(i: MatchCaInput) {
  const capt = i.captainInfluence ?? 0, nerves = i.nerves ?? 0, mot = i.motivation ?? 0, morale = i.morale ?? 10;
  let x = ftol(i.ca + 1.75 * capt - nerves - (i.history0a ?? 0) + Math.trunc(mot / 2)); // 1.75 @0x968f98 (0x6ec789)
  let pen = 0;
  if (i.formRoll !== undefined && i.badDayThreshold !== undefined && i.formRoll > i.badDayThreshold)
    pen = (Math.min(x, 30) * (i.badDaySeverity ?? 0)) / 300;    // 30 @0x968dd8, 1/300 @0x96d6e8
  if (i.nationalTeam && !i.isKeeper) pen += 5;                  // 0x6ec886
  x = ftol(x + ((morale - 10) * (i.formRoll ?? 0)) / 30);       // 1/30 @0x969020 (0x6ec8c0)
  if (i.youthBigOccasion) pen += 2.5;                           // 0x96b008
  if (i.isKeeper) x = Math.max(x, ftol(0.75 * i.ca), 8);        // 0x6ec9ed, 0x6eca14
  x = Math.min(x, i.pa + (i.isKeeper ? 10 : 0));                // 0x6eca40 / 0x6eca53
  const K = ftol(x * 0.5 + 80);                                 // 0.5 @0x968968, 80 @0x96d6e0
  return { K, pen, soft: K > 150 };                            // 0x96 (0x6eca87)
}
const soften = (v: number, t: number, e: number, on: boolean) => (on && v > t ? crtPow(v - t, e) + t : v);   // 0x945ff0
const base = (a: number, K: number, k: number, pen: number) => Math.max(0.1 * (2 * a + K - k * pen), 0); // 0.1 @0x967880

/** Technical/mental attributes that use match CA (stored record value `a`). Extras ported where position-free. */
export function technicalMatchFloat(name: keyof typeof TECH, a: number, m: ReturnType<typeof matchCa>, age = 25): number {
  const t = TECH[name];
  let aa = a;
  if (name === 'anticipation' && age > 36) aa *= 0.75;           // 0x969040
  if ((name === 'positioning' || name === 'offTheBall') && age > 36) aa *= 0.75;
  if (name === 'reflexes') aa *= age > 39 ? 0.8 : age > 37 ? 0.9 : 1; // 0x9689b0 / 0x9689d8
  let v = base(aa, m.K, t.k, m.pen);
  if (t.post) v = t.post(v);
  if (t.soft) v = soften(v, t.soft[0], t.soft[1], m.soft);
  return v;
}
const pow22 = (v: number) => 0.05 * crtPow(v, 2.2) + 1;               // 2.2 @0x96d6d0, 0.05 @0x967888, 1 @0x967890
export const TECH: Record<string, { rec: number; field: number; k: number; soft?: [number, number]; post?: (v: number) => number }> = {
  anticipation: { rec: 0x1e, field: 0x7d, k: 0.8, post: (v) => 0.5 * v + 5 },   // coach term omitted (+0.225 default)
  crossing: { rec: 0x23, field: 0x8d, k: 0.6, soft: [16, 1.25] },
  decisions: { rec: 0x24, field: 0x91, k: 1 },
  dribbling: { rec: 0x26, field: 0x95, k: 0.35 },
  finishing: { rec: 0x27, field: 0x99, k: 0.67, soft: [16, 1.25] },
  handling: { rec: 0x2a, field: 0xa5, k: 1 },
  heading: { rec: 0x2b, field: 0xa9, k: 0.6, soft: [18, 1.2] },
  longShots: { rec: 0x31, field: 0xb1, k: 1 },
  marking: { rec: 0x32, field: 0xb5, k: 0.5, post: pow22, soft: [16, 1.2] },
  offTheBall: { rec: 0x33, field: 0xb9, k: 0.8, post: (v) => 0.65 * v + 7 }, // role factor & coach omitted
  oneOnOnes: { rec: 0x35, field: 0xbd, k: 1 },
  passing: { rec: 0x37, field: 0xc5, k: 0.35, soft: [18, 1.25] },
  penalties: { rec: 0x38, field: 0xc9, k: 0.5 },
  positioning: { rec: 0x39, field: 0xcd, k: 0.6, post: pow22, soft: [16, 1.2] },
  reflexes: { rec: 0x3a, field: 0xd1, k: 1 },
  tackling: { rec: 0x3e, field: 0xdd, k: 0.67 },
  throwIns: { rec: 0x41, field: 0xe9, k: 0 },
  creativity: { rec: 0x43, field: 0xf1, k: 0.67, soft: [17, 1.2] },
};
/** Physical/“raw” attributes (no CA). */
export function rawMatchFloat(name: string, a: number, age = 25, pen = 0): number {
  switch (name) {
    case 'acceleration': case 'pace': return soften((2 / 3) * a + 0.2, 12, 1.25, true); // 0x96a670, 0x96d6a8, 12 @0x96d6a0
    case 'aggression': return 0.5 * a;
    case 'agility': return 0.5 * a * (age > 39 ? 0.8 : age > 37 ? 0.9 : 1) + 0.2;
    case 'balance': case 'bravery': case 'corners': case 'strength': return 0.5 * a + 0.2;
    case 'flair': return a * (age > 36 ? 0.5 : age > 34 ? 0.75 : 1) - 0.1 * pen;      // 0x96afc4
    case 'freeKicks': return (4 / 7) * a + 0.2;                                        // 0x96d698
    case 'jumping': return a - pen / 30;                                               // 0x96d694
    case 'stamina': return 0.65 * a + (age > 38 ? 2.25 : age > 35 ? 4.75 : age > 33 ? 5.75 : age < 20 ? 6.75 : age < 24 ? 7.25 : age < 30 ? 7.5 : 7.0);
    case 'teamwork': case 'technique': case 'versatility': return a;
    default: throw new Error(name);
  }
}

// ------------------------------------------------------------------ shown 1..20 → match float
/** sub_544380 inverse (from browser/cm0102-original-rules.ts): stored value that shows `shown` at `ca`. */
export function intrinsicFromShown(ca: number, shown: number): number {
  const t = (-1 + Math.sqrt(1 + 1.2 * shown)) / 0.2;
  return ((t - 10) / 0.05 - ca) / 2;
}
export function matchFloatFromShown(name: keyof typeof TECH, shown: number, ca: number, opts: Partial<MatchCaInput> = {}) {
  const m = matchCa({ ca, pa: 200, isKeeper: false, ...opts });
  return technicalMatchFloat(name, intrinsicFromShown(ca, shown), m);
}
