// Udfordringen af boldholderen i gittermotoren – porteret fra cm0102.exe 3.9.68 (~/cm0102-engine/notes/6c87e0-preshot.md og
// 6f09f0-challenge.md). (sikker) = læst af koden; "?" = tolkning af en offset; *estimeret* = ukendt i originalen.
//   sub_6eecb0 (0x6ef840–0x6f041f): handlingsevnerne +0x11a+2·kode  → actionSkills
//   sub_6c87e0 get_opposition_challenge: hvem i boldens felt går ind, med hvilken type og værdi → getOppositionChallenge
//   sub_70d690: udfordringsværdien og ventetiderne → challengeValue
//   sub_6f56c0: konditionstabet for en udfordring → drainCondition
//   sub_7172d0: moralen → adjustMorale
import * as L from './loop';
import type { GP, GridMatchState } from './gridMatch';
import { isHardChallenge } from '../cm0102-original-rules';

export type Rand = (n: number) => number;
type Side = 0 | 1;
const ftol = Math.trunc;
/** utils_random (0x90cfc0) med negativt n: 0..n+1 (aldrig positivt); n = 0 → 0 uden træk. (sikker; notes/referee-taker.md) */
export const randS = (rand: Rand, n: number) => (n < 0 ? -rand(-n) : rand(n));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** sub_6f5b20(p, side): p står i feltet i enden `side` (x 2..6; y 0..1 for side 0, 10..11 for side 1). (sikker) */
export const inBoxAt = (side: Side, x: number, y: number) => x >= 2 && x <= 6 && (side === 0 ? y <= 1 : y >= 10);
const inOwnBox = (q: GP) => inBoxAt(q.side, q.x, q.y);
const isGK = (q: GP) => q.pos === L.POS.keeper;                       // sub_717410 == 1

// ------------------------------------------------------------------ handlingsevnerne (sub_6eecb0)

/** ftol(10a + 0,5) og ftol((a² + 1)·0,5) af kampfloats (sub_6ec010, ca. 0..20). (sikker) */
export const lin = (a: number) => ftol(10 * a + 0.5);
export const sq = (a: number) => ftol((a * a + 1) * 0.5);
/** Udfordringstyperne (6c87e0-noten): 1 keeper-greb, 12 kontrol, 19/33/34 rene tacklinger, 21 hovedstød, 37 hands, 41 keeper i
 *  hovedhøjde, 42/43/45/46 frispark-typer, 44/47 hårde, 49/50 handling 0x3b; 0xf/0x11/0x12 = boldholderens løb/dribling/løb med bold. */
export const CH = { gkCatch: 1, control: 12, runTackle: 19, header: 21, tackle: 33, tackleStand: 34, hands: 37, gkHigh: 41,
  foul42: 42, foul43: 43, hard44: 44, dive45: 45, foul46: 46, hard47: 47, t49: 49, t50: 50 } as const;
type SkillSrc = Pick<GP, 'f' | 'gkRating'>;
/** Word-tabellen +0x11a+2·kode (sikker; formlerne fra 0x6ef840–0x6f041f). gk = 20 hvis keeper-pladsevnen > 15, ellers ftol(0,75·evne + 5). */
export function actionSkills(p: SkillSrc): number[] {
  const f = p.f, s: number[] = new Array(0x33).fill(0);
  const gk = p.gkRating > 15 ? 20 : ftol(0.75 * p.gkRating + 5);
  const tk2 = ftol(f.tackling * f.tackling + 0.5);
  s[1] = ftol((sq(gk) + lin(f.handling) + lin(f.positioning) + lin(f.jumping) + lin(f.decisions) + lin(f.anticipation)) / 6);
  s[12] = sq(f.technique);
  s[19] = ftol((sq(f.pace) + lin(f.balance) + lin(f.anticipation) + tk2) / 5);
  s[21] = sq(f.jumping);
  s[33] = ftol((tk2 + lin(f.balance) + lin(f.anticipation)) / 4);
  s[34] = sq(f.tackling);
  s[37] = 200;
  s[41] = ftol((lin(f.bravery) + sq(gk) + lin(f.handling)) / 3);
  s[42] = 200; s[43] = ftol(10 * f.strength + 200); s[44] = 400; s[45] = 400; s[46] = ftol(10 * f.strength + 200); s[47] = 200;
  s[49] = 200; s[50] = 200;
  s[0xf] = ftol((lin(f.technique) + lin(f.agility) + lin(f.balance) + lin(f.strength)) / 4);
  s[0x11] = ftol((sq(f.technique) + lin(2 * f.technique) + lin(f.acceleration)) * 0.22989);
  s[0x12] = ftol((lin(2 * f.pace) + lin(2 * f.dribbling) + sq(f.dribbling) + lin(f.technique)) * 0.15385);
  return s;
}

// ------------------------------------------------------------------ sub_6f56c0 og sub_7172d0

/** sub_6f56c0 for en udfordring (type ≠ −1): cond −= (200 − 8,5·Stamina)·f. Kampens Stamina-float er +0xd5 (sikker). */
export function drainCondition(p: GP, type: number): void {
  const f = type === 19 || type === 33 ? 0.3818 : type === 21 || type === 36 || type === 46 ? 0.5454 : 0.1636;
  p.condition = Math.max(0, p.condition - (200 - 8.5 * (p.f.stamina ?? 0)) * f);
}
/** sub_7172d0 (sikker): moralen 1..20; over/under 10 kræver et rul. Karakter ≥ 7500 løfter gulvet. delta 0 → ingen ændring (grenen med
 *  +0x477a er ikke modelleret). Returnerer om moralen ændrede sig (originalen genberegner så evnerne – sub_6eecb0 – men morale indgår
 *  ikke i handlingsevnerne, så det er en no-op her). */
export function adjustMorale(p: GP, delta: number, rand: Rand): boolean {
  const old = p.morale;
  if (delta > 0) { if (p.morale + delta > 10) { if (rand(21) < p.morale + delta) p.morale += rand(delta + 1); } else p.morale += delta; }
  else if (delta < 0) { if (p.morale + delta < 10) { if (rand(11) > p.morale + delta) p.morale += randS(rand, delta - 1); } else p.morale += delta; }
  else return false;
  if (p.rating >= 7500) p.morale = Math.max(p.morale, ftol(0.004 * p.rating - 20.5));
  p.morale = clamp(p.morale, 1, 20);
  return p.morale !== old;
}

// ------------------------------------------------------------------ sub_70d690 udfordringsværdien

export interface ValueOut { V: number; type: number; delayCarrier: number; delayChallenger: number }
/** sub_70d690 (sikker): værdien for typen, evt. ny type (keeperen i eget felt → 1/41; under 2 → 45 "går i gulvet"), ventetiderne. */
export function challengeValue(m: GridMatchState, q: GP, type0: number, rand: Rand): ValueOut {
  let type = type0;
  if (type !== 0x25 && type !== 0x15 && !inOwnBox(q)) {
    const d = L.DIST[Math.abs(q.y - (q.side === 1 ? 11 : 0))][Math.abs(q.x - 4)];          // afstand til eget mål
    if (rand(ftol(q.f.aggression + 2)) < rand(ftol(2 * d))) return { V: -20, type, delayCarrier: 0, delayChallenger: 0 }; // holder sig tilbage
  }
  const c = m.carrier;
  const mom = c === q ? q.momentum : 0;
  const tired = rand(ftol(((10000 - ftol(q.condition)) ** 2) / 50000));
  let face = 0;
  if (!c) {                                                                                 // løs bold: vendt mod bolden
    let a = Math.abs(q.facing - m.ballDir); if (a > 180) a = 360 - a;
    face = rand(ftol((2 * (180 - a)) / Math.max(5 - m.ballH, 1)));
  }
  const spd = 20 * (m.ballSpeed - 1) ** 3;                                                  // +0x8eaa
  let V: number;
  if (isGK(q) && inOwnBox(q)) { type = m.ballH === 4 ? 0x29 : 1; V = q.skill[type] - tired - mom; }
  else if (type === 0xc || type === 0x15) V = q.skill[type] - spd - tired - face - mom;
  else if (type === 0x13 || type === 0x21 || type === 0x22) {
    V = q.skill[type] - tired - mom;
    if (V < 2 && rand(2) !== 0) { V = q.skill[0x2d] - tired - mom; type = 0x2d; }
  } else if (type === 0x25) V = q.skill[0x25] - mom;
  else if (type >= 0x2a && type <= 0x2f) V = q.skill[type] - tired - mom;
  else if (type === 0x31 || type === 0x32) V = q.skill[type] - mom;
  else V = 0;
  let dD = 0, dC = 0;                                                                       // tabel 0x70debc/0x70de7c
  switch (type) {
    case 1: dD = rand(2) + 2; dC = 1; break;
    case 12: break;
    case 19: case 33: case 45: dD = 2; dC = 2; break;
    case 21: dD = 2; dC = 1; break;
    case 34: dD = 2; dC = rand(2) + 1; break;
    case 36: case 37: dD = 2; break;
    case 41: dD = rand(2) + 2; dC = 1; break;
    case 42: dD = 2; dC = rand(2); break;
    case 43: dD = 2; break;
    case 44: dD = 2; dC = 5; break;
    case 46: dD = 2; dC = rand(2); break;
    case 47: dD = 2; dC = rand(4) + 1; break;
    case 49: dC = rand(4) + 1; break;
    case 50: dD = 2; dC = rand(2) + 1; break;
    default: break;                                                                         // assert match_pl.cpp 0x4651
  }
  return { V, type, delayCarrier: dC, delayChallenger: dD };
}

// ------------------------------------------------------------------ sub_6c87e0 get_opposition_challenge

export interface ChallengeOut { d: GP | null; type: number; value: number; delayCarrier: number; delayChallenger: number; clear: boolean }
const FOUL4 = [0x2a, 0x2d, 0x2b, 0x2e];                                                     // rand(4) → 42, 45, 43, 46

/**
 * sub_6c87e0 (sikker; notes/6c87e0-preshot.md): den modstander i BOLDENS felt, der går ind med den største værdi. `freeRun` = sub_6cb780.
 * Kandidaterne tages i m.gp's pladsrækkefølge (originalens feltliste er i indsættelsesorden – "?"). Ikke modelleret: individuelle
 * instruktioner (bit 0x200/0x800/0x1000 – vores `instr` er 0), sub_5407e0 (forholdet mellem to spillere → 0).
 */
export function getOppositionChallenge(m: GridMatchState, carrier: GP | null, sideArg: Side, action: number, flag9: number, rand: Rand,
  freeRun: (p: GP) => number): ChallengeOut {
  const out: ChallengeOut = { d: null, type: 0, value: 0, delayCarrier: 0, delayChallenger: 0, clear: false };
  const side = carrier ? carrier.side : sideArg, opp = (side === 0 ? 1 : 0) as Side;
  if (m.ballH === -1 && carrier && isGK(carrier)) return out;                               // keeperen holder bolden (+0xf59e/+0xf5a2)
  const bx = m.ballX, by = m.ballY;
  const dx = Math.abs(bx - 4), dy = opp === 1 ? Math.abs(by - 11) : Math.abs(by);
  let D = (dx <= 8 && dy <= 11 ? L.DIST[dy][dx] : 1000) + 0.5;
  if (D > 1) { const h = D * 0.5; D = h * h + h + 1; }                                       // 0x6c88d8
  const cell = m.gp.filter((q) => q.active && q.side === opp && q.x === bx && q.y === by);
  let freeRunV = 0, ahead = 1, aheadDone = false;
  const carrierGK = !!carrier && isGK(carrier);
  const inAttBoxOfCarrier = (x: number, y: number) => inBoxAt(opp, x, y);
  for (const q of cell) {
    if (q.busy >= 2) continue;
    // 1) multiplikatoren (0x6c8964)
    let mm: number;
    const tf = m.teamFlags[opp];
    if (m.ballH === 4) mm = 3.5;
    else if (q.instr & 0x200n) mm = tf & 0x20 ? 0.5 : tf & 0x40 ? 4 : 2;
    else if (q.instr & 0x800n) mm = 0.5;
    else if (q.instr & 0x1000n) mm = 4;
    else mm = 2;
    if (D > 5) mm *= 0.05;
    if (carrier) {
      if (carrier === q.grudge) mm *= 2.25;
      if (q.marks === carrier) mm *= 2;
      if (m.ballH < 4) { const k = 30 - q.roll.decisions; const r1 = rand(k), r2 = rand(k); mm *= (carrier.momentum + 6 * (r2 - r1)) * 0.0025 + 1; }
    }
    mm *= 0.5 + q.f.aggression * (0.075 - 0.0025 * q.yellows * q.roll.decisions);          // +0x24 = gule kort (referee-noten)
    if (!isGK(q)) mm *= q.condition * 1e-8 * q.condition;
    if (m.aiMode[opp] === 5) mm *= 0.25;
    if (mm < 0.05) mm = 0.05;
    // 2) går han ind? (0x6c8b3c)
    const pw = q.roll.positioning + q.roll.workRate;
    const prevHalf = (q.action & 0x100) !== 0;                                              // +0x198 bit 0x100
    const r = (k: number) => rand(ftol(k / mm));
    let def: number, foul: number, hard: number;
    if (action === 0xc || action === 0xd || action === 0xe) {
      if (!(r(carrierGK ? 3 : prevHalf ? 10 : 20) < pw - D)) continue;
      def = 0x22; foul = FOUL4[rand(4)]; hard = 0x2c;
    } else if (action === 0xf || action === 0x10 || action === 0x67 || action === 0x68) {
      if (!(r(carrierGK ? 3 : prevHalf ? 5 : 10) < pw - D)) continue;
      def = 0x21; foul = FOUL4[rand(4)]; hard = 0x2c;
    } else if (action === 0x11 || action === 0x12) {
      let roll = true, k = 0;
      if (isGK(q)) {
        if (out.d || cell.length > 1) k = 12;
        else if (q.x === 4 && q.y === (opp === 0 ? 0 : 11)) k = 2;
        else roll = false;                                                                  // keeperen ude: går altid ind
      } else if (flag9) k = 2;
      else if (carrierGK) k = 3;
      else if (action === 0x11) k = prevHalf ? 8 : 12;
      else k = prevHalf ? 4 : 8;
      if (roll && !(r(k) + carrier!.roll.pace < pw - D * 0.5)) continue;
      def = 0x13; foul = FOUL4[rand(4)]; hard = 0x2c;
    } else if (action === 0x15 || action === 0x25 || action === 0x2e || action === 0x38) {
      let roll = true, kk = 0;
      if (isGK(q)) kk = ftol(Math.pow(cell.length, 5) * q.roll.decisions + (q.x === 4 && (q.y === 0 || q.y === 11) ? 10 : 3)); // pow-rækkefølgen "?"
      else if (rand(D > 2 ? 100 : 10) > D) roll = false;
      else kk = prevHalf || carrierGK ? 1 : 3;
      if (roll && rand(ftol(2 * q.f.heading)) + q.roll.positioning <= rand(kk)) continue;
      def = 0x15; foul = 0x2e; hard = rand(5) === 0 ? 0x2f : -1;
    } else if (action === 0x3b) {
      if (!(r(carrierGK ? 3 : prevHalf ? 20 : 60) < pw - D)) continue;
      def = 0xc; foul = 0x32; hard = 0x32;
    } else if (action === 0x6c) {
      let k = carrierGK ? 10 : prevHalf ? 500 : 1000;
      if (inAttBoxOfCarrier(bx, by)) k += 1300;
      if (!(r(k) < (10.5 - D) * q.f.aggression + pw)) continue;
      if (m.ballH >= 4) continue;
      def = 0x22; foul = FOUL4[rand(4)]; hard = 0x2c;
    } else if (action === 0x6d) {
      let roll = true, k = 0;
      if (isGK(q)) { if (inOwnBox(q)) k = m.shootout ? 5 : flag9 ? 6 : 30; else roll = false; }
      else if (flag9) { if (q.roll.anticipation !== 0) roll = false; else k = 2; }
      else k = prevHalf ? 2 : 4;
      if (roll && !(r(k) < pw - D)) continue;
      if (m.ballH < 2) { def = 0x22; foul = FOUL4[rand(4)]; hard = 0x2c; } else { def = 0xc; foul = 0x2e; hard = 0x2e; }
    } else continue;                                                                        // "Unknown attack type"
    // 3) klar målchance (0x6c8ccc)
    if (carrier && !aheadDone && action !== 0x3b && action !== 0x15) {
      freeRunV = freeRun(carrier);
      ahead = m.gp.filter((o) => o.active && o.side === carrier.side && (carrier.side === 1 ? o.y < carrier.y : o.y > carrier.y)).length;
      aheadDone = true;
    }
    if (freeRunV !== 0) out.clear = true;
    else {
      let check = false;
      if (L.isLastMan(m, q) && rand(10) === 0) check = true;                                 // sub_6cd5f0 (+0xf58e/+0xf592)
      else if (q.slot >= 0 && q.slot <= 10 && isGK(q) && rand(2) === 0) check = true;
      const onWing = q.x < 2 || q.x > 6, ownThird = L.inOwnThird(q.side, q.y);              // sub_70df20 / sub_70def0
      if (check && ahead === 0 && (!onWing || !ownThird)) out.clear = true;
    }
    // 4) styrkerullet (sub_7165b0, 0x6c955d)
    const n = carrier && carrier === q.grudge ? ftol((0.01 * q.agitation + 0.75) * (q.temperCount + 5) * 2.5) : ftol(((0.01 * q.agitation + 0.75) * q.temperCount + 5) * 0.5);
    let s = rand(n);
    if (carrier && !(carrier.side === 0 ? carrier.y > 8 : carrier.y < 3) && !out.clear && q.yellows === 0 && rand(ftol(q.f.aggression)) > rand(12)) { // sub_70df40
      if (carrier.rating > rand(1000) + 7500 || 0 > rand(10000)) {                          // sub_5407e0 (forholdet) → 0
        s += rand(10);
        if (q.roll.decisions !== 0) hard = -1;
      }
    }
    // 5) typen (0x6c9613)
    const inBox = inOwnBox(q) ? 1 : 0, dec = q.roll.decisions, clear = out.clear ? 1 : 0, sport = q.sportsmanship;
    let type: number;
    if (action === 0x15 && rand(200 * sport + 1500 * inBox + 250) === 0) type = 0x25;
    else if (s > rand(25 * (14 * inBox * dec + (dec + 5) * q.yellows + 20 * dec * clear) + 20)) type = foul;
    else if (hard > -1 && s * s > rand(500 * (inBox * (dec + 10) + 10) + 80 * (sport + 100) * dec * clear)) type = hard;
    else if (clear && !isGK(q) && D >= 2 && m.ballH !== 4 && dec !== 0) continue;           // holder sig tilbage (ville være rødt)
    else type = def;
    // 6) værdien (0x6c978d)
    const cv = challengeValue(m, q, type, rand);
    out.delayCarrier = cv.delayCarrier; out.delayChallenger = cv.delayChallenger;             // pegerne skrives for hver kandidat (sikker)
    let v = randS(rand, cv.V);
    if (action === 0x11 && cv.type !== 0x29) v += rand(ftol(q.roll.pace * q.f.acceleration));
    if (action === 0x12 && cv.type !== 0x29) v += q.roll.pace * q.roll.pace;
    if (v <= 0 && !inOwnBox(q)) {
      if (q.roll.decisions !== 0) continue;
      if (q.roll.workRate <= rand(100)) continue;
    }
    if (out.d && v <= out.value) continue;
    out.d = q; out.type = cv.type; out.value = v;
  }
  if (out.d) drainCondition(out.d, out.type);
  return out;
}

export { isHardChallenge };
