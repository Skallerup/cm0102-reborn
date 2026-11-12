// Udfordringen af boldholderen i gittermotoren – porteret fra cm0102.exe 3.9.68 (~/cm0102-engine/notes/6c87e0-preshot.md og
// 6f09f0-challenge.md). (sikker) = læst af koden; "?" = tolkning af en offset; *estimeret* = ukendt i originalen.
//   sub_6eecb0 (0x6ef840–0x6f05ac): handlingsevnerne +0x11a+2·kode (råværdi + efterbehandling)  → actionSkills
//   sub_6c87e0 get_opposition_challenge: hvem i boldens felt går ind, med hvilken type og værdi → getOppositionChallenge
//   sub_70d690: udfordringsværdien og ventetiderne → challengeValue
//   sub_6f56c0: konditionstabet for en udfordring → drainCondition
//   sub_7172d0: moralen → adjustMorale
import { crtPow } from '../crtMath';
import * as L from './loop';
import type { GP, GridMatchState } from './gridMatch';
import { cellList } from './cells';
import { isHardChallenge } from '../cm0102-original-rules';

export type Rand = (n: number) => number;
type Side = 0 | 1;
const ftol = Math.trunc;
/** utils_random (0x90cfc0) med negativt n: 0..n+1 (aldrig positivt); n = 0 → 0 uden træk. (sikker; notes/referee-taker.md) */
/** rand med fortegn: sub_90cfc0 kaldes med det negative n (randOf giver n+1..0 – samme tal som −rand(−n), men samme kald som originalen) */
export const randS = (rand: Rand, n: number) => rand(n);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** sub_6f5b20(p, side): p står i feltet i enden `side` (x 2..6; y 0..1 for side 0, 10..11 for side 1). (sikker) */
// sub_6cb960 / sub_6f5b20-mønsteret: x 2..6 og y 0..1 (side 0) eller 10..11 (side 1) – også nedad/opad afgrænset (test al,al; jl / cmp 0xb; jg),
// så et mål bag mållinjen (y −1 / 12) ikke er i feltet (0x6fd3fe)
export const inBoxAt = (side: Side, x: number, y: number) => x >= 2 && x <= 6 && (side === 0 ? y >= 0 && y <= 1 : y >= 10 && y <= 11);
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
type SkillSrc = Pick<GP, 'f' | 'gkRating'> & { form?: number };
/** Råværdierne i word-tabellen +0x11a+2·kode for alle 63 koder (sikker; 0x6ef840–0x6f041f, læst instruktion for instruktion).
 *  gk = 20 hvis keeper-pladsevnen > 15, ellers ftol(0,75·evne + 5). Division = heltal mod nul. */
export function rawActionSkills(p: SkillSrc): number[] {
  const f = p.f, s: number[] = new Array(0x3f).fill(0);
  const gk = p.gkRating > 15 ? 20 : ftol(0.75 * p.gkRating + 5);
  const d = (a: number, b: number) => Math.trunc(a / b);
  const tk2 = ftol(f.tackling * f.tackling + 0.5);                       // ftol((2·t² + 1)·0,5)
  const q2t = ftol((2 * f.technique * f.technique + 1) * 0.5);
  s[0] = s[1] = d(sq(gk) + lin(f.handling) + lin(f.positioning) + lin(f.jumping) + lin(f.decisions) + lin(f.anticipation), 6);
  s[2] = s[3] = lin(f.heading);
  s[4] = d(lin(f.balance) + lin(f.heading), 2);
  s[5] = d(sq(f.agility) + sq(f.flair) + sq(f.technique) + sq(f.balance) + 100, 5);
  s[6] = s[7] = s[8] = lin(f.crossing);
  s[9] = s[0x3e] = d(lin(f.passing) + 200, 2);
  s[0xa] = sq(f.passing);
  s[0xb] = d(lin(2 * f.passing) + 200, 3);
  s[0xc] = sq(f.technique);
  s[0xd] = lin(f.technique);
  s[0xe] = d(sq(f.technique) + lin(f.technique), 2);
  s[0xf] = d(lin(f.technique) + lin(f.agility) + lin(f.balance) + lin(f.strength), 4);
  s[0x10] = d(lin(f.technique) + lin(f.balance) + lin(f.strength), 3);
  s[0x11] = ftol((sq(f.technique) + lin(2 * f.technique) + lin(f.acceleration)) * 0.2298850574712644);   // 0x96d728
  s[0x12] = ftol((lin(2 * f.pace) + lin(2 * f.dribbling) + sq(f.dribbling) + lin(f.technique)) * 0.15384615384615385); // 0x96d720
  s[0x13] = d(sq(f.pace) + lin(f.balance) + lin(f.anticipation) + tk2, 5);
  s[0x14] = d(lin(f.agility) + lin(f.balance), 2);
  s[0x15] = sq(f.jumping);
  s[0x16] = s[0x17] = lin(f.finishing);
  s[0x18] = d(sq(f.technique) + lin(f.finishing), 2);
  s[0x19] = d(lin(f.technique) + lin(f.finishing), 2);
  s[0x1a] = s[0x1b] = d(q2t + lin(2 * f.finishing) + lin(f.passing), 5);
  s[0x1c] = d(sq(f.flair) + lin(2 * f.finishing) + q2t + lin(f.passing), 6);
  s[0x1d] = d(lin(f.strength) + lin(f.finishing), 2);
  s[0x1e] = s[0x3c] = sq(f.passing);
  s[0x1f] = s[0x20] = d(sq(f.technique) + lin(f.passing), 2);
  s[0x21] = d(tk2 + lin(f.balance) + lin(f.anticipation), 4);
  s[0x22] = sq(f.tackling);
  s[0x23] = ftol(sq(f.bravery) * 0.9090909090909091);                  // 0x96d718
  s[0x24] = ftol((lin(f.anticipation) + lin(f.agility)) * 0.4);          // 0x968e00
  s[0x25] = 200;
  s[0x26] = d(sq(f.strength) + lin(f.balance), 2);
  s[0x27] = s[0x28] = d(sq(gk) + lin(f.handling) + lin(f.agility), 3);
  s[0x29] = d(lin(f.bravery) + sq(gk) + lin(f.handling), 3);
  s[0x2a] = s[0x2f] = s[0x30] = s[0x31] = s[0x32] = 200;
  s[0x2c] = s[0x2d] = 400;
  s[0x2b] = s[0x2e] = d(lin(2 * f.strength) + 400, 2);
  s[0x33] = d(lin(f.penalties) + 200, 2);
  s[0x34] = sq(f.corners);
  s[0x35] = s[0x37] = sq(f.freeKicks);
  s[0x36] = lin(f.throwIns);
  s[0x38] = d(sq(f.balance) + sq(f.strength), 2);
  s[0x39] = s[0x3d] = lin(f.heading);
  s[0x3a] = d(lin(2 * f.finishing) + 300, 5);
  s[0x3b] = d(sq(f.bravery) + sq(f.agility), 2);
  return s;
}
/** Efterbehandlingen 0x6f0426–0x6f05ac (sikker; jump-tabel 0x6f05c8, indeks 0x6f05e8, konstanterne læst i exe'en) med f = +0x37
 *  (positionstilpasningen, ≤ 0). Den kører for ALLE koder 0..0x3e efter råværdierne. */
const POST_CASE = [0, 0, 1, 2, 2, 2, 3, 3, 3, 1, 3, 3, 1, 1, 1, 4, 4, 4, 4, 1, 5, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 1, 1, 1, 1, 1, 7, 7, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 2, 5, 5, 5, 2, 1, 6, 3, 3, 1];
export function postSkill(code: number, v: number, f: number): number {
  switch (POST_CASE[code]) {
    case 0: return ftol(10 * (f + 25) + v * 2.5);
    case 1: return ftol(5 * (f + 45) + v * 0.5);
    case 2: return ftol(3 * f + 418 + v * 0.13);
    case 3: return ftol(v * 2.1 + f * 2.5 + 75);
    case 4: return ftol(v * 2.25 + f * 2.5 + 75);
    case 5: return ftol(v * 1.8 + 50);
    case 6: return ftol(v * 3.5);
    case 7: return ftol(7 * (f + 30) + v * 0.775);
    default: return 2 * v;                                                // koder > 0x3e (nås ikke)
  }
}
/** sub_6eecb0: handlingsevnerne +0x11a+2·kode = efterbehandlede råværdier. (sikker) */
export function actionSkills(p: SkillSrc): number[] {
  const f = p.form ?? 0;
  return rawActionSkills(p).map((v, code) => postSkill(code, v, f));
}

// ------------------------------------------------------------------ sub_6f56c0 og sub_7172d0

/** sub_6f56c0 for en udfordring (type ≠ −1): cond −= (200 − 8,5·Stamina)·f. Kampens Stamina-float er +0xd5 (sikker). */
export function drainCondition(p: GP, type: number): void {
  // 0x6f5756–0x6f57b7: doublekonstanterne 0x96d770/0x96d778/0x96d768 = 4,2/11, 6/11, 1,8/11 (før afkortet til 4 decimaler)
  const f = type === 19 || type === 33 ? 0.3818181818181818 : type === 21 || type === 36 || type === 46 ? 0.5454545454545454 : 0.16363636363636364;
  p.condition = Math.max(0, p.condition - (200 - 8.5 * (p.f.stamina ?? 0)) * f);
}
/** sub_7172d0 (sikker): moralen 1..20; over/under 10 kræver et rul. Karakter ≥ 7500 løfter gulvet. delta 0 → ingen ændring (grenen med
 *  +0x477a er ikke modelleret). Returnerer om moralen ændrede sig (originalen genberegner så evnerne – sub_6eecb0 – men morale indgår
 *  ikke i handlingsevnerne, så det er en no-op her). */
export function adjustMorale(p: GP, delta: number, rand: Rand): boolean {
  const old = p.morale;
  // 0x7172db–0x7172fc: delta 0 og engine+0x477a = −1 (kampens spiller – sat først af sub_6d0f80 ved slutfløjt) → nej, medmindre karakteren > 7500
  // og moralen < 10 (så løfter gulvet nedenfor moralen)
  if (delta === 0 && (p.rating <= 0x1d4c || p.morale >= 10)) return false;
  let al: number;
  const md = p.morale + delta;
  // 0x717321 / 0x717353: over 10 (op) eller under 10 (ned) kræver rullet – ellers hele delta (0x717373: moral + delta; før gav porten 0)
  if (delta > 0 && md > 10) al = rand(21) < md ? rand(delta + 1) + p.morale : md;
  else if (delta < 0 && md < 10) al = rand(11) > md ? randS(rand, delta - 1) + p.morale : md;
  else al = md;
  al = (al << 24) >> 24;                                                                    // byte
  if (p.rating >= 0x1d4c) al = ftol(Math.max(al, 0.004 * p.rating - 20.5));                 // 0x717386–0x7173bd (0x968d60, 0x96d868)
  al = (al << 24) >> 24;
  p.morale = clamp(al, 1, 20);
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
  // 0x70d9be–0x70d9d3: cmp boldhøjde, 4; setne; dec; and 0xd8; add 0x29 → boldhøjde 4 giver 1 (grebet), ellers 0x29 (før vendt; kampsporet
  // tfoul2: keeperens type ved 0xd/0xc er 41, ved 0x15 er den 1)
  if (isGK(q) && inOwnBox(q)) { type = m.ballH === 4 ? 1 : 0x29; V = q.skill[type] - tired - mom; }
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

/** tællere til fejlsøgning (sat af en scratch-kopi af grid-stats; null = slået fra) */
export const CH_DEBUG: { on: boolean; c: Record<string, number> } = { on: false, c: {} };
const cdbg = (k: string) => { if (CH_DEBUG.on) CH_DEBUG.c[k] = (CH_DEBUG.c[k] ?? 0) + 1; };

/**
 * sub_5407e0(A, B, 0) (0x54085f–0x5408bf) med sub_5408c0(A, B): A's omdømme (spillerpost +9/+0xb/+0xd) set fra B. Samme klub eller klubber i
 * samme land (+0x39 → +0x53) → +0xb; samme nationalitet (+0x1a) → +9; resten (0x53d980's sproggrupper/anden nationalitet, kategori 1/3/4) er
 * ikke porteret – *estimeret* +0xd (verden). I hukommelsen er værdierne spilstartens ×50 (aiTeam.ts' konvention); låsetrinstesten har dem rå.
 */
export function carrierRep(m: GridMatchState, a: GP, b: GP): number {
  const r = a.src.cmRepMem ? a.src.cmRepMem.map((v) => v * 50) : a.src.cmRep ?? [0, 0, 0];
  if (m.nations[a.side] === m.nations[b.side]) return (r[1] << 16) >> 16;
  if (a.src.nation === b.src.nation) return (r[0] << 16) >> 16;
  return (r[2] << 16) >> 16;
}

export interface ChallengeOut { d: GP | null; type: number; value: number; delayCarrier: number; delayChallenger: number; clear: boolean }
const FOUL4 = [0x2a, 0x2d, 0x2b, 0x2e];                                                     // rand(4) → 42, 45, 43, 46

/**
 * sub_6c87e0 (sikker; notes/6c87e0-preshot.md): den modstander i BOLDENS felt, der går ind med den største værdi. `freeRun` = sub_6cb780.
 * Kandidaterne tages i feltlistens rækkefølge (engine+0x215e, cells.ts). Ikke modelleret: individuelle
 * instruktioner (bit 0x200/0x800/0x1000 – vores `instr` er 0).
 */
export function getOppositionChallenge(m: GridMatchState, carrier: GP | null, sideArg: Side, action: number, flag9: number, rand: Rand,
  freeRun: (p: GP) => number): ChallengeOut {
  const out: ChallengeOut = { d: null, type: 0, value: 0, delayCarrier: 0, delayChallenger: 0, clear: false };
  const side = carrier ? carrier.side : sideArg, opp = (side === 0 ? 1 : 0) as Side;
  if (m.ballH === -1 && carrier && isGK(carrier)) return out;                               // keeperen holder bolden (+0xf59e/+0xf5a2)
  const bx = m.ballX, by = m.ballY;
  const dx = Math.abs(bx - 4), dy = opp === 1 ? Math.abs(by - 11) : Math.abs(by);
  // 0x6c88ae–0x6c88f0: float32-tabellen + 0,5 gemt som float32; over 1: h = D·0,5, D = h² + h + 1 (float32)
  const f = Math.fround;
  let D = f((dx <= 8 && dy <= 11 ? f(L.DIST[dy][dx]) : 1000) + 0.5);
  if (D > 1) { const h = D * 0.5; D = f(h * h + h + 1); }                                    // 0x6c88d8
  // 0x6c88f8–0x6c8954: feltets liste for modstanderne (engine+0x215e, indsættelsesorden) – kun dem med plads ≥ 0
  const cell = cellList(m, bx, by, opp).filter((q) => q.slot >= 0);
  const A = CH_DEBUG.on ? action.toString(16) : '';
  if (CH_DEBUG.on) { cdbg(`ch:${A}:call`); if (cell.some((q) => q.busy < 2)) cdbg(`ch:${A}:cand`); cdbg(`ch:${A}:D${Math.min(9, Math.round(D))}`); }
  let freeRunV = 0, ahead = 1, aheadDone = false;
  const carrierGK = !!carrier && isGK(carrier);
  const inAttBoxOfCarrier = (x: number, y: number) => inBoxAt(opp, x, y);
  for (const q of cell) {
    if (q.busy >= 2) continue;
    // 1) multiplikatoren (0x6c8964)
    // 0x6c8964–0x6c8b3c: multiplikatoren gemmes som float32 ([esp+0x1c]) efter hvert led (fst/fstp dword) – r(k) deler med den float32-værdi
    let mm: number;
    const tf = m.teamFlags[opp];
    if (m.ballH === 4) mm = 3.5;
    else if (q.instr & 0x200n) mm = tf & 0x20 ? 0.5 : tf & 0x40 ? 4 : 2;
    else if (q.instr & 0x800n) mm = 0.5;
    else if (q.instr & 0x1000n) mm = 4;
    else mm = 2;
    if (D > 5) mm = f(mm * f(0.05));                                                         // 0x96d424 (float32 0,05)
    let x = mm;                                                                              // st0 (udvidet) – float32 i [esp+0x1c]
    if (carrier) {
      if (carrier === q.grudge) { mm = f(mm * 2.25); x = mm; }
      if (q.marks === carrier) { mm = f(mm + mm); x = mm; }
      if (m.ballH < 4) {
        const k = 30 - q.roll.decisions; const r1 = rand(k), r2 = rand(k);
        x = ((((carrier.momentum + 6 * (r2 - r1)) << 16) >> 16) * 0.0025 + 1) * mm;          // 0x6c8a8e–0x6c8aaf (movsx cx → int16)
      }
    }
    mm = f((0.5 + q.f.aggression * (0.075 - q.yellows * q.roll.decisions * 0.0025)) * x);    // +0x24 = gule kort (referee-noten)
    if (!isGK(q)) mm = f(q.condition * 1e-8 * q.condition * mm);
    if (m.aiMode[opp] === 5) mm = f(mm * 0.25);
    if (mm < 0.05) mm = f(0.05);
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
      if (isGK(q)) kk = ftol(crtPow(cell.length, 5) * q.roll.decisions + (q.x === 4 && (q.y === 0 || q.y === 11) ? 10 : 3)); // pow-rækkefølgen "?"
      else if (rand(D < 2 ? 100 : 10) > D) roll = false;                                    // 0x6c8c0a–0x6c8c3f: D < 2,0 → rand(100), ellers rand(10) (før vendt)
      else kk = prevHalf || carrierGK ? 1 : 3;
      if (roll && rand(ftol(2 * q.f.jumping)) + q.roll.positioning <= rand((kk << 16) >> 16)) continue;   // 0x6c8c70: +0xad = Jumping; 0x6c8c8e movsx ecx, di (16 bit)
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
    cdbg(`ch:${A}:in`);
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
      if (carrier.rating > rand(1000) + 7500 || carrierRep(m, carrier, q) > rand(10000)) {  // 0x6c95c5 / sub_5407e0 0x6c95df
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
    if (CH_DEBUG.on) cdbg(`ch:${A}:${type === foul ? 'foul' : type === hard ? 'hard' : type === def ? 'def' : 't' + type}`);
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
  if (CH_DEBUG.on && out.d) cdbg(`ch:${A}:pick:${out.type}`);
  return out;
}

export { isHardChallenge };
