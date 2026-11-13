// Kilde: cm-01-02-bosman-edition/app/identical/1a_pass_options/pass_options.ts (kopieret 2026-11-09).
// Porteret af Bosman-projektet; ændringer: ingen.
// Gittermotoren (gridMatch.ts) er et laboratorium ved siden af MatchSim – ikke koblet ind i spillet.
/**
 * sub_6c6a30 - pass options ("who can I pass to, how, and how good is it?")
 * cm0102.exe (CM 01/02 Bosman Edition), sha256 0c78e7da...bff86, match_pl.cpp, 0x6c6a30-0x6c875c.
 *
 * Readable port of the original rule. Every constant has its instruction address next to it.
 * See PASS_OPTIONS.md for the explanation and the sikkert/gaettet/ukendt list.
 *
 * Original signature (thiscall, ecx = match, ret 0x20):
 *   MatchPlayer* sub_6c6a30(int8 x, int8 y, uint8* outType, uint8* outLead,
 *                           int8* outX, int8* outY, int32* ioWeight, int8 code)
 *   x,y      pass origin cell (carrier cell in open play, ball cell 0x8ea7/0x8ea8 at restarts)
 *   code     -1 = open play (choose the type); 0x34 corner, 0x36 throw-in, 0x37 free kick,
 *            0x5a goal kick (forced type, the code itself is written to *outType)
 *   *ioWeight is ALWAYS written (baseline) and raised to the best candidate's score.
 *   *outType, *outLead, *outX, *outY are only written when a receiver beats the current *ioWeight.
 *   returns the best receiver, or null.
 *
 * Helpers that other sections reverse (2 / 4) are injected through `Helpers`; their exact rules
 * are not part of 1a. Names follow BALL_CARRIER.md.
 */

// ------------------------------------------------------------------ data model

import { crtPow } from '../crtMath';
export type Side = 0 | 1; // side 0 attacks the goal at (4, 11), side 1 the goal at (4, 0)

export interface MatchPlayer {
  side: Side;              // +0x27
  slot: number;            // +0x19 (<0 = not on the pitch)
  x: number; y: number;    // +0x102 / +0x103
  posFlags: number;        // sub_6c38c0: table match+0x8ebc[side][slot]; 1 = goalkeeper, 0x40 = forward (gaettet)
  plads: number;           // word +0x29, "space" value written by sub_7109f0 before the call (0x711150/0x7111e9)
  condition: number;       // float +0x4d (0..10000, sandsynlig)
  w35: number;             // word +0x35 (ukendt; lowered by sub_6fad40 when passing)
  passesInMove: number;    // (ubrugt)
  busy: number;            // +0x2b
  b2c: number; b2d: number; // +0x2c / +0x2d (line-of-sight bytes, ukendt)
  // match attribute floats (sub_6ec010; record offset in brackets)
  crossing: number;        // +0x8d [rec 0x23]
  finishing: number;       // +0x99 [rec 0x27]
  flair: number;           // +0x9d [rec 0x28]
  jumping: number;         // +0xad [rec 0x2e]
  pace: number;            // +0xc1 [rec 0x36]
  strength: number;        // +0xd9 [rec 0x3d]
  teamwork: number;        // +0xe1 [rec 0x3f]
  technique: number;       // +0xe5 [rec 0x40]
  throwIns: number;        // +0xe9 [rec 0x41]
  creativity: number;      // +0xf1 [rec 0x43]
  // per-tick rolls (sub_6f44a0, 0x6f44a0..0x6f45c8)
  paceRoll: number;        // +0x104  max of 2 x rand(...) on pace/condition
  anticRoll: number;       // +0x105  rand(cap from Anticipation)
  decRoll: number;         // +0x106  decisions roll
  offBallRoll: number;     // +0x107  rand(cap from Off the ball +0xb9)
  creatRoll: number;       // +0x10b  creativity roll
  instr: { lo: number; hi: number }; // individual instructions (sub_7163c0 -> sub_5b5270, team +0x188b)
  staff: { id: number; nationName: string; professionalism: number; // staff record via +0x69: +0x1a nation, +0x5b
           favoured: number[]; disliked: number[] };                 // +0x65 -> +0x1c..+0x24 / +0x28..+0x30
}

export interface MatchState {
  attackingSide: Side;            // +0x8eae
  ballState: number;              // +0x8ea9 (4 = head height, gaettet)
  defLine: [number, number];      // +0x8eaf (used for side 0) / +0x8eb0 (used for side 1)
  teamFlags: [number, number];    // +0x9766 per team (TEAM_FLAGS)
  competitionReputation: number | null; // fixture(+0x4792)+0x14 -> club_comp word +0x69; null if no pointer
  roleStaffId: [number | null, number | null]; // sub_897dc0(tactic, 0 / 1): tactic +0x56/+0x5a (playmaker / target man?)
  players: MatchPlayer[][];       // [side][0..19]
}

export interface Helpers {
  /** kun spor/låsetrin: kandidatens værdier lige før rand(Professionalism + 1) (0x6c82c2) */
  trace?(c: MatchPlayer, W: number, shortScore: number, longScore: number, x: Record<string, number>): void;
  rand(n: number): number;                                   // sub_90cfc0: 0..n-1 (n<=0 -> 0 / n+1..0)
  dist(dx: number, dy: number): number;                      // table float[12][9] at 0xa15e44 (|dy|, |dx|)
  freeRun(p: MatchPlayer): 0 | 1 | 2;                        // sub_6cb780
  facingGoal(p: MatchPlayer): boolean;                       // sub_6f4650
  canSee(c: MatchPlayer, tx: number, ty: number, oppNearCarrier: number, mark: number): { ok: boolean; lane: number }; // sub_6f9f90(..,1,..) + sub_6cbc00
  runTarget(p: MatchPlayer): { x: number; y: number } | null; // sub_6bce80(p, &x, &y, 0)
  lineOfSight(x: number, y: number, tx: number, ty: number, D: number): number; // sub_713e90(0x5d, ...), compared to carrier.b2c
  spaceAhead(p: MatchPlayer): boolean;                       // sub_6cbad0
  noDefenderGoalSide(p: MatchPlayer): boolean;               // sub_6bd5b0(p, 0)
  onPitch(staffId: number | null): boolean;                  // sub_6e1cd0 + slot >= 0
}

// ------------------------------------------------------------------ pass type codes

export const PASS = {
  CROSS_LOW: 0x07,    // 1 <= D <= 5, cross geometry; score S50 (crossing + 0.1*dec*(3000-100*Jumping))
  CROSS_HIGH: 0x08,   // 1 <= D <= 5, cross geometry; score S4c (crossing + 0.1*dec*(100*Jumping+500))
  SHORT: 0x0b,        // D <= 2, ball not at volley/head height
  LONG: 0x1e,         // 4 <= D <= 5-(21-Strength)/6 ; long-ball score S30
  LOFTED: 0x1f,       // 1.5 <= D <= 3 ; score S44 (aerial terms like S30)
  GROUND_MEDIUM: 0x3c,// 3 <= D <= 4 ; score S38
  HEADER: 0x3d,       // ball state 4 (head height), D <= 2 ; score W only
} as const;
// Names are gaettet from the distance bands and the terms; the numbers are sikre.
// 6 and 0x5e are NOT produced here; sub_6fad40 handles 6, 8 and 0x5e in the same case (0x6fd97e).

/** row a is further back (towards his own goal) than row b */
const BEHIND = (side: Side, a: number, b: number) => (side === 0 ? a < b : a > b);
const inAttBox = (side: Side, x: number, y: number) => x >= 2 && x <= 6 && (side === 0 ? y >= 10 : y <= 1);
const inOwnBox = (side: Side, x: number, y: number) => x >= 2 && x <= 6 && (side === 0 ? y <= 1 : y >= 10);
const inFinalThird = (side: Side, y: number) => (side === 0 ? y > 8 : y < 3);   // sub_70df40
const inOwnThird = (side: Side, y: number) => (side === 0 ? y < 3 : y > 8);     // sub_70def0
const inOwnHalf = (side: Side, y: number) => (side === 0 ? y < 6 : y >= 6);     // sub_70dfa0
const wide = (x: number) => x < 2 || x > 6;                                     // sub_70df20
const ftol = Math.trunc;                                                         // sub_945640
/** float-konstanten 0,1 (fx 0x96afc4) – x87 regner med floatens værdi 0,100000001490116 */
const F01 = Math.fround(0.1);
const isGK = (p: MatchPlayer) => (p.posFlags & 0xffff) === 1;

/** sub_6cb9b0: is (tx,ty) a cross from the carrier's position? */
export function isCross(c: MatchPlayer, tx: number, ty: number, h: Helpers): boolean {
  const s = c.side;
  if (!inAttBox(s, tx, ty)) return false;                       // 0x6cb9c5 / 0x6cb9e4
  if (c.x === 4) return false;                                  // 0x6cba03
  if (c.x > 2 && c.x < 6 && BEHIND(s, ty, c.y)) return false;   // 0x6cba16 / 0x6cba3a
  if (!inFinalThird(s, c.y)) return false;                      // y >= 9 (0x6cba24) / y <= 2 (0x6cba48)
  if (!(tx > 2 && tx < 6)) return false;                        // 0x6cba4d
  if (Math.abs(c.x - tx) <= 1) return false;                    // 0x6cba66
  return h.dist(Math.abs(tx - c.x), Math.abs(ty - c.y)) > 1.5;  // 0x6cbab4 (0x968940)
}

const NATION_K1 = new Set(["England", "Scotland", "Wales", "Northern Ireland", "Republic Of Ireland", "Norway"]);
const NATION_K06 = new Set(["Sweden", "Denmark", "Germany"]);
/** Nation factor K, [F+0x48] (0x6c6a4c..0x6c6ab4). */
export function nationFactor(nation: string): number {
  // float32-værdierne 0x3f800000/0x3f19999a/0x3e4ccccd ([esp+0x40] = dword; fdiv dword) – med double 0,2 rundede −500e/K forkert
  if (NATION_K1.has(nation)) return 1.0;                                                                                  // 0x6c6ab4
  if (NATION_K06.has(nation)) return Math.fround(0.6);                                                                    // 0x6c6aaa
  return Math.fround(0.2);                                                                                                // 0x6c6a4c
}

export interface PassChoice { receiver: MatchPlayer | null; weight: number; type?: number; lead?: boolean; x?: number; y?: number; }

export function passOptions(m: MatchState, carrier: MatchPlayer, ox: number, oy: number, code: number, h: Helpers): PassChoice {
  const side = m.attackingSide;
  const opp = (1 - side) as Side;
  const K = nationFactor(carrier.staff.nationName);
  // baseline (0x6c6abc..0x6c6af4)
  let best: PassChoice = { receiver: null, weight: 3 * (carrier.plads - 1000) - h.rand(500) + h.rand(500) };

  // early exit: free run with nobody ahead and facing goal -> no pass options (0x6c6afc..0x6c6b2d)
  if (!inOwnHalf(carrier.side, carrier.y) && h.freeRun(carrier) === 1 && h.facingGoal(carrier)) return { receiver: null, weight: best.weight };

  const originInAttBox = inAttBox(side, ox, oy); // [F+0x17]
  const originInOwnBox = inOwnBox(side, ox, oy); // [F+0x16]
  // (runde 11B) løkker i stedet for filter/destrukturering – samme rækkefølge og tal
  const outfieldOpps: MatchPlayer[] = [];
  for (const p of m.players[opp]) if (p.slot >= 0 && !(p.posFlags & 1)) outfieldOpps.push(p);
  const nearestOpp = (x: number, y: number) => {   // 5000.0 start (0x459c4000), 0 if one in the cell
    let d = 5000;
    for (const p of outfieldOpps) { const e = h.dist(Math.abs(p.x - x), Math.abs(p.y - y)); if (e === 0) return 0; if (e < d) d = e; }
    return d;
  };
  const oppNearCarrier = nearestOpp(carrier.x, carrier.y); // 0x6c6bfe..0x6c6c52

  for (const c of m.players[side]) {
    if (c.slot < 0 || c === carrier) continue;                             // 0x6c6c87 / 0x6c6c99
    if (isGK(carrier) && BEHIND(side, c.y, oy)) continue;                  // keeper only passes level/forward (0x6c6cbf..0x6c6cf5)

    let mark = nearestOpp(c.x, c.y);                                       // [F+0x20]
    let lane = 0;                                                          // [F+0x18]
    if (code !== 0x36 && code !== 0x37) {                                  // 0x6c6dba / 0x6c6dbe
      const v = h.canSee(c, c.x, c.y, oppNearCarrier, mark);               // sub_6f9f90(cx, cy, 1, ...)
      if (!v.ok) continue;
      lane = v.lane;
    }
    const cIsGK = isGK(c);

    // S34: resistance against a pass into the run (through ball)
    let S34 = ftol(5000 + 50 * mark * mark);                               // 0x6c6e4f (-50.0) / 0x6c6e55 (5000.0)
    if (inFinalThird(side, c.y)) S34 -= 1500;                              // 0x6c6e73
    else if (inOwnHalf(side, c.y)) S34 += inOwnThird(side, c.y) ? 10000 : 3000; // 0x6c6ee5 / 0x6c6ea3

    // W: the common score added to every pass type
    let W = cIsGK ? 0 : ftol((c.condition + c.w35 - 15000) * 0.25);       // 0x6c6ec1 (15000.0) 0x6c6ec7 (0.25)
    const throughYes = (carrier.instr.hi & 0x1) !== 0;                      // "Try Through Balls: Yes" (menu 0x8a68d8)
    if (!inOwnHalf(side, c.y)) {
      const fr = h.freeRun(c);
      const step = fr === 1 ? 2000 : fr === 2 ? 4000 : 0;                   // 0x6c6f13 / 0x6c6f5e
      if (step) { S34 -= step; W += step; if (throughYes) { S34 -= step; W += step; } }
      else if (throughYes) { W += 500; S34 -= 500; }                        // 0x6c6fb5
    }

    // type scores
    const rep = m.competitionReputation;
    const repTerm = rep === null ? 0 : 25 * (rep - 12);                    // 0x6c6fe3..0x6c6fe9
    let Sshort = repTerm;            // S3c -> type 0x0b
    let Slong = -4 * repTerm;        // S30 -> type 0x1e
    let Sground = 0;                 // S38 -> type 0x3c (and corners into the box)
    let Slofted = 0;                 // S44 -> type 0x1f
    let ScrossHigh = 0, ScrossLow = 0; // S4c -> 8, S50 -> 7

    // tactic roles (sub_897dc0), receiver creativity
    const role0 = m.roleStaffId[0], role1 = m.roleStaffId[1];
    if (c.staff.id === role0) W += 1000;                                   // 0x6c703c
    else if (c.staff.id === role1) { if (!h.onPitch(role0)) W += 1000; }   // 0x6c70ed
    else { const t = ftol(-5 * c.creativity * c.creativity); Sshort -= t; Sground = -t; } // 0x6c7101 (-5.0)

    if (inAttBox(side, c.x, c.y)) {                                        // sub_6f5b20(side==0)
      const t = ftol(5 * c.finishing * c.finishing) - ftol(-5 * c.technique * c.pace); // 0x6c7140 / 0x6c7151
      Sshort += t; Sground += t;
    }

    // passing style (only outside the final third, 0x6c717a)
    if (!inFinalThird(carrier.side, carrier.y)) {
      let style: "long" | "direct" | "short" | null = null;
      const lo = carrier.instr.lo;
      if (lo & 0x1) {                                                      // individual "Team" -> team flags
        const tf = m.teamFlags[side];
        style = tf & 0x8 ? "long" : tf & 0x4 ? "direct" : tf & 0x2 ? "short" : null; // 0x6c71b9..0x6c71c1
      } else style = lo & 0x10 ? "long" : lo & 0x8 ? "direct" : lo & 0x4 ? "short" : null; // 0x6c71d2 / 0x6c71f8 / 0x6c721e
      if (style === "long") { Sshort -= 1000; Slong += 1000; }             // 0x6c71db
      if (style === "direct") { Sshort -= 750; Slong += 500; }             // 0x6c7201
      if (style === "short") { Sshort += 250; Slong -= 250; }              // 0x6c7227
    }

    // target cell: his feet, or the end of his run (through ball)
    let tx = c.x, ty = c.y, lead = false;
    if (!cIsGK) {
      const v = 38 * c.paceRoll * c.anticRoll * carrier.creatRoll;          // 0x6c7272
      if (h.rand(6 * S34) <= 0.1 * v) {                                    // 0x6c7280 / 0x6c7285 (0.1)
        const rt = h.runTarget(c);
        if (rt) {
          const rx = Math.min(8, Math.max(0, rt.x)), ry = Math.min(11, Math.max(0, rt.y));
          if (rx !== c.x || ry !== c.y) {
            tx = rx; ty = ry; lead = true;
            mark = nearestOpp(tx, ty);                                     // 0x6c7361..0x6c73b5
            if (c.posFlags & 0x40) W += 50 * c.paceRoll * c.anticRoll;     // 0x6c73c0 / 0x6c73d5
          }
        }
      }
    }

    // offside margin (uses his CURRENT row)
    let a = (side === 0 ? c.y - m.defLine[0] : m.defLine[1] - c.y) + 1;   // 0x6c741b / 0x6c7425
    if (a > -2 && (m.teamFlags[opp] & 0x400) && carrier.decRoll !== 0 && c.offBallRoll < h.rand(50)) a += 1; // 0x6c7457, 0x6c7472
    if (code === 0x36) a = -4;                                             // throw-in: never offside (0x6c7491)
    else if (a >= 0) {
      a = ((a * a + 1) << 24) >> 24;                                       // byte arithmetic (0x6c74a0)
      if (c.offBallRoll < h.rand(10 * a + 10)) W -= (400 * carrier.creatRoll + 500) * a * a; // 0x6c74b1 / 0x6c74de
    }

    const tInAttBox = inAttBox(side, tx, ty);   // [F+0x11]
    const tInOwnBox = inOwnBox(side, tx, ty);   // [F+0x12] (overwritten by isCross later)
    const dx = Math.abs(ox - tx), dy = Math.abs(oy - ty);
    const D = dx <= 8 && dy <= 11 ? h.dist(dx, dy) : 1000;                 // 0x6c75c8 / 0x6c75d5 (1000.0)

    // crowd at the target (goalkeepers excluded)
    let crowd = 0;
    for (const p of m.players[opp]) {
      if (p.slot < 0 || (p.posFlags & 0xffff) === 1) continue;
      const e = h.dist(Math.abs(p.x - tx), Math.abs(p.y - ty));
      if (e === 0) crowd += 3; else if (e <= 1.5) crowd += 1;              // 0x6c763e / 0x6c7643
    }
    W += 400 * (5 - crowd);                                                // 0x6c765e..0x6c767d
    if (tInAttBox && crowd < 3 && a < 1) W += ftol(100 * crtPow(3 - crowd, 3)); // 0x6c76a8 (3.0) 0x6c76b3 (100.0)

    if (h.lineOfSight(ox, oy, tx, ty, D) !== carrier.b2c) W -= h.rand(400 * carrier.b2d); // 0x6c76f4 / 0x6c7708

    // set pieces into the box (corner 0x34 / free kick 0x37)
    if (code === 0x34 || code === 0x37) {
      if (tInAttBox) {
        const dg = h.dist(Math.abs(c.x - 4), side === 0 ? Math.abs(c.y - 11) : Math.abs(c.y)); // sub_6fa1e0
        W += ftol(4000 - 1000 * dg + 100 * c.jumping);                    // 0x6c774a / 0x6c7744 / 0x6c7756
      } else if (D < 3) {                                                  // 0x6c7767
        const base = 100 * c.flair + 50 * c.finishing + 50 * c.crossing;   // 0x6c7786 / 0x6c7792 / 0x6c77a0
        if (crowd === 0) W += ftol(base + 3000);                           // 0x6c77a8
        else if (crowd < 3) W += ftol(base + 2000);                        // 0x6c77f0
      }
    }

    // aerial terms (long ball 0x1e and lofted 0x1f)
    if (mark > 1.5 && !tInAttBox) {                                        // free receiver outside the box
      const e = carrier.decRoll + 5;
      Slong += ftol(-700 * e / K);                                         // 0x6c7818..0x6c784e
      Slofted = ftol(-500 * e / K);                                        // 0x6c785b..0x6c78e0
    } else if (!lead) {                                                    // marked (or in the box): reward jumpers
      const X = (30 - carrier.creatRoll) * (10 - c.jumping) * K;           // 0x6c7891 / 0x6c78b1 (10.0)
      Slong += ftol(-40 * X);                                              // 0x6c78c5 (-40.0)
      Slofted = ftol(-20 * X);                                             // 0x6c78d4 (-20.0)
    }

    // passing to the goalkeeper
    if (cIsGK) {
      if (!inOwnHalf(carrier.side, carrier.y) && h.rand(100000) !== 0) continue; // 0x6c7904
      const d = carrier.decRoll;
      if (!inOwnThird(carrier.side, carrier.y)) W += ftol(-1000 * d * (mark + 0.1)); // 0x6c7928..0x6c7966
      Slofted += -1000 - 2200 * d;                                         // 0x6c7986
      Slong += -2000 - 5000 * d;                                           // 0x6c79a2–0x6c79b5: 5⁴·8·d = 5000·d (før 25000·d)
      Sground -= 1500 * d;                                                 // 0x6c79c2..0x6c79d1
    }
    if (isGK(carrier)) W -= 1000;                                          // 0x6c79fb
    if (originInOwnBox) {
      if (mark < 2 && isGK(carrier) && inOwnHalf(side, c.y)) W -= 2000;    // 0x6c7a36
      if (tInOwnBox) W += ftol(carrier.decRoll * mark * mark * -20000);    // 0x6c7a69 (-20000.0)
    }
    if (tInOwnBox) W -= ftol((32 * carrier.decRoll + 200) * mark);        // 0x6c7a8a

    // crosses
    const cross = isCross(carrier, tx, ty, h);                             // sub_6cb9b0, stored in [F+0x12]
    if (cross) {
      const d = carrier.decRoll;
      // 0x6c7b05 (500) 0x6c7b0d: ((100·Jumping + 500)·d)·0,1f – konstanten 0x96afc4 er en float (0,100000001…), ikke 0,1 som double
      ScrossHigh = ftol((100 * c.jumping + 500) * d * F01 + 100 * carrier.crossing);
      ScrossLow = ftol((3000 - 100 * c.jumping) * d * F01 + 100 * carrier.crossing);   // 0x6c7b1a (3000)
      if (carrier.instr.hi & 0x4) {                                        // "Cross Ball: Yes"
        const t = ftol(100 * carrier.teamwork + 500);                      // 0x6c7b5b / 0x6c7b61 — TODO: +0xe1 is Teamwork per sub_6ec010; odd but read so
        ScrossHigh += t; ScrossLow += t;
      }
      Slong -= 2000; Sground -= 2000; Sshort -= 2000;                      // 0x6c7b8c
    }

    // "Pass To" instruction (receiver's column)
    const lo = carrier.instr.lo;
    if ((lo & 0x40) && (side === 0 ? c.x <= 2 : c.x >= 6)) W += 1000;      // Left 0x6c7bdb
    if ((lo & 0x100) && (side === 0 ? c.x >= 6 : c.x <= 2)) W += 1000;     // Right 0x6c7c1f
    if ((lo & 0x80) && !wide(c.x) && !cross) W += 1000;                    // Centre 0x6c7c4c

    // box / flank geometry
    if (originInAttBox && !tInAttBox) { W -= 4000; mark = 0; }             // 0x6c7c70
    else if (!originInAttBox && tInAttBox) { mark = mark * mark + 1; }     // 0x6c7c86 (1.0)
    else {
      const ft = inFinalThird(side, ty), oft = inFinalThird(side, oy);
      const farLeft = ft && tx < 2 && ((originInAttBox && ox >= 3) || (oft && ox >= 6));
      const farRight = ft && tx > 6 && ((originInAttBox && ox <= 5) || (oft && ox <= 2));
      if (farLeft || farRight) { W -= 2000; mark = 0; }                    // 0x6c7d4a..0x6c7d56
    }

    // back passes into his own half
    const backOrLevel = side === 0 ? oy >= ty : oy <= ty;
    if (backOrLevel && inOwnHalf(side, c.y)) { Slong -= 5000; Sground -= 3000; Slofted -= 3000; } // 0x6c7d9c / 0x6c7d97

    // "space" (mark) adjustments
    const backRows = side === 0 ? oy - ty : ty - oy;
    if (backRows > 0) {
      mark -= backRows - 0.5;                                              // 0x6c7dca (0.5)
      if (mark < 0) { W += ftol(-500 * mark * mark); mark = 0; }           // 0x6c7def (-500.0)
    } else {
      let ahead = 0; for (const p of m.players[side]) if (p.slot >= 0 && BEHIND(side, ty, p.y)) ahead++; // 0x6c7e80..0x6c7ed4
      if (ahead === 0) mark = 2 * mark + 1;                                // 0x6c7ede / 0x6c7f17
      else if (wide(tx) && !inOwnHalf(side, c.y) && (c.instr.hi & 0x4)) mark = 1.5 * mark + 1; // receiver "Cross Ball: Yes" 0x6c7f11
    }
    if (a >= 0) {
      mark -= a;                                                           // 0x6c7f3e
      if (mark < 0) { W += ftol(-200 * mark * mark); mark = 0; }           // 0x6c7f5b (-200.0)
    }
    W += ftol(100 * mark * mark);                                          // 0x6c7f80 (100.0)

    const cr = carrier.creatRoll;
    let handled = false;
    if (backOrLevel && mark < 3.1 && !inFinalThird(side, ty) && (carrier.decRoll !== 0 || cr !== 0)) { // 0x6c7fc6 (3.1)
      const v = inOwnThird(side, c.y) ? ftol(1500 - 375 * mark) : ftol(1000 - 250 * mark); // 0x6c8023/0x6c8029, 0x6c805d/0x6c8063
      W -= (backRows + 1) * ((v << 16) >> 16);                             // 0x6c8047 / 0x6c8078 (word)
      handled = true;
    }
    if (!handled) {
      if (mark < 2 && inOwnHalf(side, c.y)) W -= 1500;                     // 0x6c80cb
      else if (!cIsGK) {
        W += ftol((cr + 10) * mark * mark);                                // 0x6c80f3
        if (inFinalThird(side, ty)) {
          if (h.spaceAhead(c)) W += 20 * (cr + 10);                        // 0x6c81a9
          else if (h.noDefenderGoalSide(c)) W += 50 * (cr + 10);           // 0x6c817f
        } else if (!inOwnHalf(side, c.y)) {
          if (h.spaceAhead(c)) W += 8 * cr + 80;                           // 0x6c8152
          else if (h.noDefenderGoalSide(c)) W += 20 * (cr + 10);           // 0x6c81a9
        }
        if (!backOrLevel) W += ftol((cr + 10) * mark * mark);              // forward pass: counted twice (0x6c81e4)
      }
    }

    // 0x6c821f–0x6c8253: modtagerens +0x2b (busy – ikke en afleveringstæller; feltet blev aldrig sat) > 1: W −= 50·(cr + 4)·b² (før 10·)
    if (c.busy > 1) W -= 50 * (cr + 4) * c.busy * c.busy;

    // interceptors in the passing lane
    const r = h.rand(lane);                                                // 0x6c825d
    Slofted -= 155 * r * r; Sground -= 155 * r * r;                        // 0x6c8277
    const shortScore = Sshort - 500 * r * r;                               // 0x6c8293 (ebp)
    const longScore = Slong - 25 * r * r;                                  // 0x6c82b0 (edi)

    h.trace?.(c, W, shortScore, longScore, { Sground, Slofted, ScrossHigh, ScrossLow, mark, D, a, crowd, lane, S34 });
    // personal relations (only when rand(Professionalism + 1) == 0)
    if (h.rand(carrier.staff.professionalism + 1) === 0) {                 // 0x6c82c2
      if (carrier.staff.disliked.includes(c.staff.id)) continue;           // sub_547840 -> skip receiver
      if (carrier.staff.favoured.includes(c.staff.id)) W += 1000;          // sub_547810, 0x6c830e
    }

    // pick the type and its score (0x6c831a..0x6c86e2)
    const NONE = -100000;                                                  // 0x6c8326
    let type = -1, score = NONE;
    const longRange = 5 - (21 - carrier.strength) * 0.16666666666666666;   // 0x6c838a (21) 0x6c8396 fmul 1/6 (double 0x96a7a8) 0x6c839c (5)
    if (code >= 0) {                                                       // forced type
      type = code;
      switch (code) {
        case 0x06: case 0x08: score = (D >= 1 && D <= 5) ? ScrossHigh + W : NONE; break;            // case 0 (0x6c8510)
        case 0x07: score = (D >= 1 && D <= 5) ? ScrossLow + W : NONE; break;                        // case 1 (0x6c8544)
        case 0x0b: score = D <= 2 ? shortScore + W : NONE; break;                          // case 2 (0x6c84ec)
        case 0x1e: case 0x5a: score = D <= longRange && D >= 4 ? longScore + W : NONE; break; // case 3 (0x6c8384)
        case 0x1f: score = (D >= 1.5 && D <= 3) ? Slofted + W : NONE; break;                        // case 4 (0x6c8426)
        case 0x34: score = D <= 5.5 && D >= 3 && tx > 1 && tx < 7 && (ty < 3 || ty > 8) ? Sground + W : W + shortScore; break; // case 5 (0x6c849f)
        case 0x36: score = 0.1 * carrier.throwIns + 1 >= D ? W : NONE; break;              // case 6 (0x6c834f)
        case 0x37: score = D <= longRange && D >= 4 ? longScore + W : W + shortScore; break; // case 7 (0x6c83d5)
        case 0x3c: score = (D >= 3 && D <= 4) ? Sground + W : NONE; break;                          // case 8 (0x6c8462)
        case 0x3d: score = D <= 2 ? W : NONE; break;                                       // case 9 (0x6c8579)
        default: score = W;                                                                // case 10 (0x6c858a)
      }
    } else if (m.ballState === 4) {                                        // head height (0x6c859e)
      if (D > 2) continue;
      type = PASS.HEADER; score = W;
    } else {
      if (D <= longRange && D >= 4) { score = longScore; type = PASS.LONG; }               // 0x6c85fe
      if (cross && (D >= 1 && D <= 5) && ScrossHigh > score) { score = ScrossHigh; type = PASS.CROSS_HIGH; } // 0x6c8634
      if (cross && (D >= 1 && D <= 5) && ScrossLow > score) { score = ScrossLow; type = PASS.CROSS_LOW; }    // 0x6c8662
      if (D <= 2 && shortScore > score && m.ballState < 3) { score = shortScore; type = PASS.SHORT; } // 0x6c8682
      if ((D >= 3 && D <= 4) && Sground > score) { score = Sground; type = PASS.GROUND_MEDIUM; }    // 0x6c86b0
      if ((D >= 1.5 && D <= 3) && Slofted > score) { score = Slofted; type = PASS.LOFTED; }         // 0x6c86de
      score += W;                                                                          // 0x6c86e2
    }
    if (type > -1 && score > best.weight)                                  // 0x6c86e4 / 0x6c86f2 (strict >)
      best = { receiver: c, weight: score, type, lead, x: tx, y: ty };
  }
  return best;
}
// TODO: 'mark' for a candidate is a 32-bit float in the original; JS doubles can differ in the last bit
//       before ftol. TODO: rand() call order must match the original exactly if the RNG stream matters
//       (order per candidate: canSee -> 6*S34 -> rand(50) -> rand(10a+10) -> lineOfSight rand(400*b2d)
//       -> rand(100000) -> rand(lane) -> rand(prof+1)).
