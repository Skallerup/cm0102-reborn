// Afleveringen, opsnapningen, modtagelsen, den løftede bold, landingen, blokeringen og den løse bold i gittermotoren – porteret fra
// cm0102.exe 3.9.68 (~/cm0102-engine/notes/6fad40-pass.md og crosses-blocks.md, kontrolleret mod hooks/*.c og out-match/gen/*.c).
// (sikker) = læst af koden; "?" = tolkning af en offset; *estimeret* = ukendt i originalen.
//   sub_6fad40 MATCH_PLAYER::pass                → pass
//   sub_6ccb60 + sub_6cd330 (banevandringen)     → walkPassLine / interceptRadius
//   sub_6f5c30 MATCH_PLAYER::try_intercept       → tryIntercept
//   sub_6f6c00 modtagelsen (første berøring)     → receive
//   sub_6c9cd0 den løftede bolds landing         → land
//   sub_6fa490 løftet bold uden modtager         → loftedTarget / lofted
//   sub_6cc540 + sub_6cd3d0 + sub_70dfd0 (skudlinjen og blokeringen) → shotLine / block
//   sub_6cd770 bolden bliver løs                 → looseBall
//   sub_6f4920 vend spilleren                    → turnTo
//   sub_6e9540 / sub_6e9630 (dommeren: hands)    → handsJudge / handsPunish
// Kommentarerne (sub_6d6f70) og de rand-kald, der kun vælger kommentar, er udeladt som i challenge.ts. Knock-tjekket sub_6cfe10,
// fordelsreglen sub_6bab90/sub_6bb9a0 via PassCtx (gridMatch.ts); sub_716e10/sub_6bb8d0 (agitation hos holdkammeraterne) er ikke modelleret.
import * as L from './loop';
import * as H from './helpers';
import type { GP, GridMatchState } from './gridMatch';
import { adjustMorale, drainCondition, inBoxAt, randS, type ChallengeOut } from './challenge';
import type { JudgeResult } from '../cm0102-original-rules';

export type Rand = (n: number) => number;
type Side = 0 | 1;
const ftol = Math.trunc;                                                    // sub_945640
const other = (s: Side) => (1 - s) as Side;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const int16 = (v: number) => (v << 16) >> 16;                               // word-variabler (movsx … , ax)
const int8 = (v: number) => (v << 24) >> 24;
export const onPitch = (x: number, y: number) => x >= 0 && x <= 8 && y >= 0 && y <= 11;
const isK = (p: GP) => (p.pos & 0xffff) === 1;                              // sub_6c38c0 == 1
const oppHalf = (side: Side, y: number) => (side === 0 ? y >= 6 : y < 6);
const attThird = (side: Side, y: number) => (side === 0 ? y > 8 : y < 3);   // sub_6cb930 med (side == 0)
/** sub_6cb960(side == 0, x, y): (x, y) i straffesparksfeltet, siden angriber */
const inAttBox = (side: Side, x: number, y: number) => inBoxAt(other(side), x, y);
/** sub_6cb650: koder uden efterspil (0x26..0x29, 0x33..0x5f) (sikker) */
const quietCode = (c: number) => (c >= 0x26 && c <= 0x29) || (c >= 0x33 && c <= 0x5f);

/** sub_6cc4e0 (sikker): tabellen 0xa15e44[|dy|·9+|dx|] som float32, 1000 uden for banen */
export function cdist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = Math.abs(x1 - x2), dy = Math.abs(y1 - y2);
  return dx <= 8 && dy <= 11 ? Math.fround(L.DIST[dy][dx]) : 1000;
}
/** sub_6fa1e0 (sikker): afstanden til det mål, p angriber (side 0 → y = 11) */
export const goalDist = (p: { side: Side; x: number; y: number }) => Math.fround(L.DIST[Math.abs(p.y - (p.side === 0 ? 11 : 0))][Math.abs(p.x - 4)]);
/** sub_70d630 (sikker): ≤ 1 felt fra EGET mål, eller bageste markspiller (sub_6cd5f0) */
export const nearOwnGoal = (m: GridMatchState, p: GP) => Math.fround(L.DIST[Math.abs(p.y - (p.side === 0 ? 0 : 11))][Math.abs(p.x - 4)]) <= 1 || L.isLastMan(m, p);
/** boldens rejsetid i spillerture (+0x1c5, 0x6fff03): ftol(2D / max(1, s + 0,2) + 0,5) – tælles ned efter HVER spillers tur i
 *  tik-løkken (0x6ba427), ikke pr. tik. Byte. (sikker) */
export const flightTicks = (D: number, s: number) => ftol((2 * D) / Math.max(1, s + 0.2) + 0.5) & 0xff;

/** sub_6ccb60 radius (jump-tabel 0x6cd2bc, indeks 0x6cd2cc[type − 6], læst i exe'en) (sikker) */
export function interceptRadius(type: number, Vc: number, rand: Rand): number {
  switch (type) {
    case 6: case 8: case 0x1e: case 0x34: case 0x37: case 0x5b: case 0x5c: case 0x5e: return 4;
    case 9: case 0x3e: case 0x5a: return 4 + (rand(Vc + 3000) !== 0 ? 1 : 0);
    case 0x1f: case 0x36: case 0x3c: case 0x3d: return rand(4) + 1;
    default: return 0;
  }
}

/**
 * sub_6ccb60 (sikker): felt for felt fra (fromX, fromY) INKLUSIVE startfeltet langs hovedaksen mod (tx, ty); fejlleddet trækkes før
 * feltet tjekkes (fejl ≥ hovedakse → skridt på biaksen). Målfeltet springes over, medmindre dx = dy = 0 (så tjekkes feltet foran i +y –
 * originalens sic). Stop uden for banen eller forbi målet. visit(x, y, d) med d = afstanden fra afleverens felt; true = stop.
 */
export function walkPassLine(fromX: number, fromY: number, tx: number, ty: number, visit: (x: number, y: number, d: number) => boolean): boolean {
  const adx = Math.abs(tx - fromX), ady = Math.abs(ty - fromY);
  const xMajor = adx >= ady;
  const inc = xMajor ? fromX < tx : fromY < ty;
  const sMinor = xMajor ? (ty - fromY >= 0 ? 1 : -1) : (tx - fromX >= 0 ? 1 : -1);
  const aMaj = xMajor ? adx : ady, aMin = xMajor ? ady : adx;
  let x = fromX, y = fromY, err = 0;
  for (;;) {
    if (!onPitch(x, y)) return false;
    if (err >= aMaj) { err -= aMaj; if (xMajor) y += sMinor; else x += sMinor; }
    const skip = x === tx && y === ty && !(adx === 0 && ady === 0);
    if (!skip) {
      if (xMajor ? y < 0 || y > 11 : x < 0 || x > 8) return false;
      if (visit(x, y, cdist(x, y, fromX, fromY))) return true;
    }
    err += aMin;
    if (xMajor) { x += inc ? 1 : -1; if (inc ? x > tx : x < tx) return false; }
    else { y += inc ? 1 : -1; if (inc ? y > ty : y < ty) return false; }
  }
}

/** sub_6cc540 (sikker): skudlinjen fra skyttens felt INKLUSIVE til (4, målrækken) INKLUSIVE; fejlleddet før grænsetjekket. */
export function walkShotLine(x0: number, y0: number, gy: number, visit: (x: number, y: number, d: number) => boolean): boolean {
  const adx = Math.abs(4 - x0), ady = Math.abs(gy - y0);
  if (adx === 0 && ady === 0) return false;
  const xMajor = adx >= ady;
  const inc = xMajor ? x0 < 4 : y0 < gy;
  const sMinor = xMajor ? (gy - y0 >= 0 ? 1 : -1) : (4 - x0 >= 0 ? 1 : -1);
  const aMaj = xMajor ? adx : ady, aMin = xMajor ? ady : adx;
  let x = x0, y = y0, err = 0;
  for (;;) {
    if (err >= aMaj) { err -= aMaj; if (xMajor) y += sMinor; else x += sMinor; }
    if (!onPitch(x, y)) return false;
    if (visit(x, y, cdist(x, y, x0, y0))) return true;
    err += aMin;
    if (xMajor) { x += inc ? 1 : -1; if (inc ? x > 4 : x < 4) return false; }
    else { y += inc ? 1 : -1; if (inc ? y > gy : y < gy) return false; }
  }
}

/** sub_6fa490 0x6fa4a7..0x6fa528 (sikker): retningen (+0x19a) som fire flag; fwd = ser mod det mål, han angriber */
export function loftFacing(side: Side, a: number): { minusX: boolean; plusX: boolean; fwd: boolean } {
  let minusX = false, plusX = false, fwd = false, skip = false;
  if (a < 50 || a > 310) { if (side === 1) { if (a > 310) minusX = true; else { plusX = true; skip = true; } } else fwd = true; }
  if (!skip && a > 40 && a < 140) plusX = true;
  if (a > 130 && a < 230) { if (side === 0) { if (a > 180) minusX = true; else plusX = true; } else fwd = true; }
  if (!minusX && a > 220 && a < 320) minusX = true;
  return { minusX, plusX, fwd };
}
/** sub_6fa490 frem til afleveringen (sikker): handlingskode og målfelt (kan ligge uden for banen). ballH = argumentet, bH = matchens. */
export function loftedTarget(p: { side: Side; x: number; y: number; facing: number; creativityRoll: number }, ball: { x: number; y: number; h: number },
  ballH: number, hoof: number, rand: Rand): { action: number; tx: number; ty: number } {
  const f = loftFacing(p.side, p.facing);
  const d = goalDist(p);
  const s0 = p.side === 0;
  const fy = (n: number, k: number, alt: number) => (f.fwd ? (s0 ? ball.y + rand(n) + k : ball.y - rand(n) - k) : ball.y - rand(alt) + rand(alt));
  const fx = (n: number, k: number, alt: number) => (f.minusX ? ball.x - rand(n) - k : f.plusX ? ball.x + rand(n) + k : ball.x - rand(alt) + rand(alt));
  let action: number, tx: number, ty: number, checkMinus1 = true;
  if (d < 5 && (p.x < 2 || p.x > 6) && ballH !== 4) { action = 0x5e; ty = s0 ? 11 - rand(2) : rand(2); tx = rand(3) + 3; }
  else {
    const ownHalf = p.side === 1 ? p.y >= 6 : p.y < 6;
    if (!ownHalf && ballH === 4) { action = 0x5c; ty = fy(2, 1, 2); tx = fx(2, 1, 2); checkMinus1 = false; }
    else if (!ownHalf) { action = 0x5d; ty = fy(4, 2, 3); tx = fx(4, 2, 3); if (!f.fwd) ty += s0 ? 2 : -2; }
    else if (ballH === 4) { action = 0x5b; ty = fy(2, 2, 2); tx = fx(2, 2, 2); checkMinus1 = false; }
    else { action = ball.h === -1 ? 0x3e : 0x09; ty = fy(5, 4, 3); tx = fx(5, 3, 3); if (!f.fwd) ty += s0 ? 2 : -2; }
  }
  let adjust = !(checkMinus1 && ballH === -1);
  if (adjust && !hoof) {
    if (p.creativityRoll === 0 && rand(3) === 0) adjust = false;
    else if (s0 ? p.y < 2 : p.y > 9) adjust = false;
  }
  if (adjust) {
    const ax = f.minusX ? 1 : f.plusX ? 7 : rand(2) !== 0 ? 1 : 7;
    let ay = s0 ? 10 : 1;
    if (s0) while (ay - p.y > 5 || (ballH === 4 && ay - p.y > 3)) ay--;
    else while (p.y - ay > 5 || (ballH === 4 && p.y - ay > 3)) ay++;
    tx = Math.trunc((ax + tx) / 2); ty = Math.trunc((ay + ty) / 2);
  }
  return { action, tx, ty };
}

/**
 * sub_6fad40 §5.5 (sikker, 0x6fcb90–0x6fcda1): præcisionen. F = boldhøjde·0,3 + 1 gange vejret (1,2/1,4/1,6/1,8 for 1..4), need =
 * rand(ftol(10F²)); er margin = V − w40 < need, spredes MÅLET med m = int8(ftol((F·D + 1)·0,5)): x ± rand(m), y ± rand(m) – keeperen
 * rammer y, medmindre rand(50·(plads + 400)) = 0. rand-rækkefølge: need, x−, x+, (keeper), y−, y+.
 */
export function passScatter(margin: number, ballH: number, weather: number, D: number, tx: number, ty: number, keeper: boolean, space: number,
  rand: Rand): { x: number; y: number; imprecise: boolean } {
  let F = Math.fround(ballH * 0.3 + 1.0);                                        // float32 [esp+0x14]
  F = Math.fround(F * (weather === 1 ? Math.fround(1.2) : weather === 2 ? Math.fround(1.4) : weather === 3 ? Math.fround(1.6) : weather === 4 ? Math.fround(1.8) : 1));
  const need = rand(ftol(F * F * 10));
  if (!(margin < need)) return { x: tx, y: ty, imprecise: false };
  const mm = int8(ftol((F * D + 1) * 0.5));
  const a = randS(rand, mm); const x = tx - a + randS(rand, mm);
  let y: number;
  if (keeper && rand(50 * (space + 400)) !== 0) y = ty;
  else { const b = randS(rand, mm); y = ty - b + randS(rand, mm); }
  return { x, y, imprecise: true };
}

/** Det, portene kalder i limen (gridMatch.ts). */
export interface PassCtx {
  m: GridMatchState;
  rand: Rand;
  /** sub_6f0630 */
  takeBall(p: GP): void;
  /** sub_6c87e0 */
  challenge(p: GP | null, side: Side, action: number): ChallengeOut;
  /** sub_6e9820 */
  judge(d: GP, p: GP, type: number, action: number): JudgeResult;
  /** sub_6ea4e0 + genstarten (FOUL-grenen); `c.clear` = det alvorlige flag */
  foul(d: GP, p: GP, j: JudgeResult, c: { clear: boolean }): void;
  /** §5 duellen ved afleverens felt; stop = afleveringen blev ikke til noget, w40 = udfordrerens værdi (0 uden) */
  sourceDuel(p: GP, V: number): { stop: boolean; w40: number };
  /** sub_70d430 */
  gkCatch(d: GP, diff: number): boolean;
  /** sub_6cd490 – kun når bolden er uden for banen i åbent spil */
  ballOut(last: Side): void;
  /** sub_70a910 (mod modstandernes mål) / sub_70c040 (mod eget mål) – ikke porteret, *estimeret* (limen) */
  intoGoal(p: GP, D: number, own: boolean): void;
  /** sub_7103e0 */
  playerTurn(p: GP): void;
  /** sub_6f9f90(p, 4, mål, 0, …) eller på mållinjens midterfelter (sub_6f4650) */
  facingGoal(p: GP): boolean;
  /** genstart (tilstand, side med bolden, felt) */
  restart(state: number, side: Side, x: number, y: number): void;
  /** kortet efter sub_6e9630/sub_6ea4e0: 2 gult, 3..6 udvist (sub_6cda20); holdets frispark (+0xf5c9) */
  card(p: GP, code: number): void;
  teamFoul(side: Side): void;
  /** afleveringen er sendt af sted efter duellen (statistik) */
  passStarted(p: GP): void;
  /** match+0x4756 (1..4, *estimeret*) og match+1 (?) */
  weather: number;
  byte1: number;
  /** sub_600a50(nation, 0, 1, 0, 0) for indlæg fra baglinjen ("?" – *estimeret*) */
  nationOk(p: GP): boolean;
  /** fordelsreglen (notes/advantage-knock.md): sub_6bab90 (en fordel venter → dommeren dømmer intet) og sub_6bb9a0 (læg en hændelse) */
  advantagePending?(): boolean;
  queueIncident?(type: number, d: GP, p: GP | null, res: number, x: number, y: number, jC: number, jB: number): void;
  /** tællere til fejlsøgning (GRID_DEBUG) */
  dbg?(k: string): void;
  /** kun spor: hvert blokeringsforsøg på skudlinjen (match_trace.c's L-linje) */
  onBlock?(q: GP, S: number, d: number, soft: boolean, r: number): void;
}

export function makePass(c: PassCtx) {
  const m = c.m, rand = c.rand;
  const dbg = (k: string) => c.dbg?.(k);
  const touch = (side: Side) => { m.lastTouch = side; m.touchCount[side]++; const o = other(side); if (m.touchCount[o] > 0) m.touchCount[o] -= 10; };
  const playersIn = (side: Side, x: number, y: number) => m.gp.filter((q) => q.active && q.side === side && q.x === x && q.y === y);

  /** sub_6f4920 (sikker): vend p mod (tx, ty) set fra (x, y); støj når agility-rul · anticipation-rul < rand(120); fodbias 2·(højre − venstre) */
  function turnTo(p: GP, x: number, y: number, tx: number, ty: number): void {
    const dx = tx - x, dy = ty - y;
    let f: number;
    if (dx === 0 && dy === 0) f = ty === 11 && tx === 4 ? 0 : ty === 0 && tx === 4 ? 180 : rand(360);
    else f = H.bearing(dx, dy);
    if (p.roll.agility * p.roll.anticipation < rand(120)) { const a = rand(30); f += a - rand(30); }
    f += 2 * (p.rightFoot - p.leftFoot);                                  // post +0x3b − +0x30
    if (f < 0) f += 360; else if (f > 359) f -= 360;
    p.facing = f;
  }

  /** sub_6cd770 (sikker): bolden bliver løs i (x, y) og spredes; keep = bliv inden for y 0..11; stir = rul ventetider; player = mål-/selvmålstjek */
  function looseBall(x: number, y: number, spread: number, lastTouch: Side | -1, keep: boolean, stir: boolean, player: GP | null): void {
    if (m.carrier) m.carrier = null;                                      // sub_6f0970 slip bolden ("?" – kun boldholderen nulstilles)
    m.ballX = x; m.ballY = y; m.poss = -1;
    let lt = lastTouch;
    if (lt === -1) lt = rand(2) === 0 ? 1 : 0;
    let nx: number, ny: number;
    if (!keep && !(x >= 2 && x <= 6) && rand(4) !== 0) {                  // ud over sidelinjen
      nx = x >= 2 ? 9 : -1;
      const a = rand(spread + 1); ny = y - a + rand(spread + 1);
    } else {
      do {
        const a = rand(spread + 1); nx = x - a + rand(spread + 1);
        const b = rand(spread + 1); ny = y - b + rand(spread + 1);
      } while (keep && (ny < 0 || ny > 11));
    }
    m.ballSpeed = spread === 0 ? 0 : rand(spread + 1) + 1;
    if (nx !== x || ny !== y) m.ballDir = H.bearing(nx - x, ny - y);
    m.ballH = rand(4);
    m.ballX = nx; m.ballY = ny; touch(lt as Side);
    if (stir) for (const q of m.gp) if (q.active && q.roll.anticipation === 0 && rand(3) === 0) q.busy += rand(2);
    if (player && nx === 4 && (ny === -1 || ny === 12) && rand(4) !== 0) {
      const att = ny === 12 ? player.side === 0 : player.side === 1;
      c.intoGoal(player, 1, !att);
      if (m.state !== 0) return;
    }
    c.ballOut(lt as Side);
  }

  /** sub_6e9540 (sikker): forseelse (hands m.m.); null = ingen (også mens en fordel venter, sub_6bab90). */
  function handsJudge(p: GP, code: number): { sev: number; b: number } | null {
    if (c.advantagePending?.()) return null;                             // 0x6e9549 sub_6bab90
    if (p.pos & 1 && inBoxAt(p.side, p.x, p.y)) return null;
    const ref = m.official;
    if (rand(ref.b28 + 15) === 0) { ref.mood -= 250; return null; }      // ser det ikke
    if (inBoxAt(p.side, p.x, p.y) && rand(4) !== 0) return null;
    ref.mood += 175;
    if (code !== 0x25) { if (rand(155) !== 0) return null; if (m.ballH <= 1) return null; }
    else if (rand(20) === 0) return null;
    return { sev: rand(p.fouls) + 1, b: 4 };
  }
  /** sub_6e9630 (sikker): straffen for hands; flag = keeperen/det "stærke" skud. Returnerer koden (1 intet kort, 2 gult, 3 andet gule, 4/6 rødt). */
  function handsPunish(p: GP, sev: number, b: number, flag: boolean): number {
    c.teamFoul(p.side); p.fouls++;
    let code = 1;
    if (m.shootout) return code;
    const yellow = () => { if (p.yellows) { p.yellows++; code = 3; p.reasons[1] = b; } else { p.yellows = 1; code = 2; p.reasons[0] = b; } };
    if (!flag && !(p.pos & 1)) {
      if (sev > rand(15) + 9) { p.rating -= 1000; code = 4; }
      else if (sev > rand(5) + 3) { const mn = Math.trunc(m.clock / 11); p.rating += ftol(-225 * (mn > 45 ? 45 / mn : 1)); yellow(); }
      else p.rating -= 25;
    } else {
      const r = rand(3000);
      if (r > 475) { p.rating -= 750; code = 6; if (p.yellows) p.reasons[1] = 9; else p.reasons[0] = 9; }
      else if (r > 50 || inBoxAt(p.side, p.x, p.y)) { p.rating -= 375; yellow(); }
    }
    return code;
  }
  /** genstarten efter hands (0x6f61e8–, 0x70e420–, 0x6ca18a–): straffe i eget felt, ellers frispark; kort (kommentarerne udeladt) */
  function handsRestart(p: GP, code: number): void {
    const opp = other(p.side);
    if (inBoxAt(p.side, p.x, p.y)) {
      p.rating -= 500;
      if (rand(p.pressure) === 0) adjustMorale(p, -rand(10), rand);     // staff +0x5a
      c.restart(5, opp, 4, p.side === 0 ? 1 : 10);
    } else c.restart(6, opp, p.x, p.y);
    c.card(p, code);
  }

  /** sub_6f5c30 MATCH_PLAYER::try_intercept (sikker): q på afleveringens linje i afstand d. true = bolden er rørt (taget eller løs). */
  function tryIntercept(q: GP, Vc: number, radius: number, d: number, flag: boolean): boolean {
    if (m.lastPasser === q) return false;
    if (m.poss !== q.side && 2 * q.roll.workRate < rand(6) && !L.inOwnThird(q.side, q.y)) return false;
    const keeper = isK(q), inBox = inBoxAt(q.side, q.x, q.y);
    let rad = radius, T: number;
    if (keeper && inBox) T = rand(ftol(2000 - 40 * q.f.handling));
    else switch (radius) {
      case 0: T = rand(500); break;
      case 1: T = rand(600); break;
      case 2: T = rand(700); break;
      case 3: T = rand(1000); break;
      case 4: T = rand(1800); break;
      case 5: T = rand(500000) + 200; rad = 4; break;                    // ord: kan slå om (sic, 0x6f5ddd movsx di)
      default: return false;                                            // assert 0x6f6b53
    }
    T = int16(T);
    if (d < 1.5 && rad >= 4) return false;                              // høj bold kan ikke nås tæt på afleveren
    if (d + 1 > 0) T = int16(ftol(((m.ballSpeed + 1) * T) / (d + 1)));
    if (m.lastTouch === q.side) {                                       // holdkammerat i linjen
      if (randS(rand, T + 100) !== 0) return false;
      looseBall(q.x, q.y, rand(m.ballSpeed) + 1, q.side, false, true, q);   // 0x1f5e: bolden rammer ham
      dbg('int:mate'); return true;
    }
    let code: number;
    if (!(inBox && keeper) && rand(100 + 200 * q.sportsmanship + 500 * (inBox ? 1 : 0)) === 0) code = 0x25;   // hånd på bolden
    else if (rad === 4) code = keeper ? 1 : 0x15;
    else if (!keeper) code = 0x24;
    else if (rad === 3 && rand(4) !== 0) code = 1;
    else code = 0x29;
    const I = int16(randS(rand, q.skill[code]) - Math.trunc(Vc / 2) - T);
    if (I < -100) { q.busy += rand(2); return false; }
    if (I < 150) return false;
    const hj = handsJudge(q, code);
    if (hj && rand(10) !== 0) { handsRestart(q, handsPunish(q, hj.sev, hj.b, false)); return true; }
    if (hj) c.queueIncident?.(code, q, null, 1, q.x, q.y, hj.sev, hj.b);                       // 0x6f609e: fordel
    const s = m.ballSpeed;
    const cutoff = Math.max(160, int16(ftol(1500 - d * d * 100 + 100 * s)));
    if (I >= cutoff && d >= 1 && s + 1 < d) {                            // kontrolleret opsnapning
      if (flag) { q.blocks++; q.rating += 28; }
      q.busy++;
      c.takeBall(q); q.action = code;
      dbg('int:cut'); return true;
    }
    dbg('int:loose');
    if (flag) { q.blocks++; q.rating += 10; }                           // kun en fod på bolden
    if (keeper && inBox) {
      if (rand(10) !== 0) looseBall(q.x, q.y, rand(s) + 1, q.side, true, true, null);
      else { const pl = rand(200) !== 0 ? null : q; looseBall(q.x, q.y, rand(s) + 1, q.side, false, true, pl); }
    } else looseBall(q.x, q.y, rand(s) + 1, q.side, false, true, q);
    q.busy += rand(2); q.action = code;
    return true;
  }

  /** sub_6ccb60 + sub_6cd330 (sikker): pr. felt rand(2) for hvilken side der prøves først; spillere med busy ≤ 1. */
  function interceptWalk(fromX: number, fromY: number, tx: number, ty: number, type: number, Vc: number): boolean {
    const radius = interceptRadius(type, Vc, rand);
    const cell = (side: Side, x: number, y: number, d: number) => {
      for (const q of playersIn(side, x, y)) if (q.busy <= 1 && tryIntercept(q, Vc, radius, d, true)) { m.inFlight[0] = 0; m.inFlight[1] = 0; return true; }
      return false;
    };
    return walkPassLine(fromX, fromY, tx, ty, (x, y, d) => {
      const r = rand(2) as Side;
      return cell(r, x, y, d) || cell(other(r), x, y, d);
    });
  }

  /**
   * sub_6fad40 MATCH_PLAYER::pass (sikker; notes/6fad40-pass.md). io.v = io_flag (sub_6fa250's arg3; sættes, når målfeltet ikke er
   * modtagerens felt). Returnerer true = bolden er sendt af sted (sub_6fa250 fortsætter med offside og modtageren).
   */
  function pass(p: GP, fromX: number, fromY: number, type0: number, io: { v: boolean }, receiver: GP | null, tx0: number, ty0: number): boolean {
    let type = type0, tx = tx0, ty = ty0;
    const side = p.side, sk = p.skill;
    const tired = rand(ftol((10000 - ftol(p.condition)) ** 2 / 50000));            // R1
    let D = cdist(fromX, fromY, tx, ty);
    let err = rand(ftol((4 * D ** 3) / Math.max(1, p.f.passing)));                 // R2
    if (!receiver) err = rand(err);                                                // R3
    if (D < 2 && type !== 0x3d && type !== 0x5c) err += ftol(250 - 125 * D);
    const w = H.footForTarget({ x: fromX, y: fromY, facing: p.facing, technique: p.f.technique, leftFoot: p.leftFoot, rightFoot: p.rightFoot,
      strongFoot: p.strongFoot } as unknown as H.MatchPlayer, type, tx, ty, D + 1).penalty;   // sub_713e90
    const foot = rand(w);                                                          // R4
    if (type !== 0x36 && type !== 0x5c && type !== 0x3d) m.inFlight[side] = 1;     // +0x1a5+side
    // 4.1 grundtallet S
    let S: number, dead = false;
    if (type === 0x5b || type === 0x5c) S = sk[0x3d] - err;
    else if (type === 0x5d) S = sk[0xb] - foot - err;
    else if (type === 6 || type === 7 || type === 8 || type === 0x5e) {
      const k = type === 0x5e ? 8 : type;
      const onLine = p.y === 0 || p.y === 11;
      const flA = (p.pos & 0x880) !== 0, flB = (p.posAttack & 0x880) !== 0;     // sub_6c38c0 / sub_6c38f0
      const instr4 = (p.instr & 4n) !== 0n;                                        // individuel instruktion bit 4 (sub_5b5270) – vores instr er 0
      const nat = c.nationOk(p);
      if (onLine && flA && flB && p.pos & 0x38 && instr4) S = sk[k] - foot + (nat ? 0x4b : 0x3e);
      else if (onLine && flA && flB) S = sk[k] - foot + (nat ? 0x3e : 0x2d);
      else if (!onLine && attThird(side, p.y) && flA) S = sk[k] - foot + 0x19;
      else S = sk[k] - foot - Math.trunc(err / 3);
    } else if (type === 0x34 || type === 0x37) { S = sk[0x34] - Math.trunc(err / 5) + 300; dead = true; }
    else if (type === 0x5a) { S = sk[0x1e] - err + 300; dead = true; }
    else if (type === 0x36) { S = sk[0x36] - 2 * err; dead = true; }
    else S = (sk[type] ?? 0) - foot - err;
    S = int16(S);
    // 4.2 vejret (kun boldhøjde 5) – bogstaveligt S·ftol(S·c) (sic)
    if (m.ballH === 5 && D >= 2.1) {
      const wt = c.weather;
      const hit = wt === 1 ? rand(7) === 0 : wt === 2 ? rand(5) === 0 : wt === 3 || wt === 4 ? rand(3) === 0 : false;
      if (hit) S = int16(S * ftol(S * (wt === 1 ? 0.95 : wt === 2 ? 0.925 : wt === 3 ? 0.9 : 0.875)));
    }
    // 4.3 afleveringens værdi
    const r6 = rand(tired);
    const V = int16(p.momentum - r6 + randS(rand, S) + p.w29);                    // R6, R7
    // §5 duellen ved kilden
    let w40 = 0;
    if (m.ballH !== 4 && !dead) {
      const r = c.sourceDuel(p, V);
      if (r.stop) return false;
      w40 = r.w40;
    }
    // 5.4
    if (!inAttBox(side, p.x, p.y) && randS(rand, p.w31) < -10) {                   // dyk-grenen (kun negativt w31)
      p.agitation = Math.min(100, Math.max(p.agitation * 1.05, 2 * (25 - p.temperament)));   // 0x6fca12 (max – noten har min)
      if (rand(20 * p.pressure + 10) === 0) adjustMorale(p, -rand(3), rand);
    }
    m.lastPasser = p; m.lastPassType = type;
    c.passStarted(p);
    if (rand(20 * p.pressure + 10) === 0) adjustMorale(p, -rand(3), rand);         // R8, R9 (staff +0x5a)
    if (m.carrier) { m.poss = -1; m.carrier = null; p.w29 = 0; p.momentum = 0; }
    m.margin = int16(V - w40);
    // 5.5 præcisionen: en upræcis aflevering flytter MÅLET
    dbg('pass:t' + type.toString(16));
    const sc = passScatter(V - w40, m.ballH, c.weather, D, tx, ty, isK(p), p.w29, rand);
    if (sc.imprecise) dbg('pass:imprecise');
    if (sc.x !== tx || sc.y !== ty) {
      if (receiver) {
        if (isK(p)) p.rating -= 50;
        else if (!oppHalf(side, fromY) && !oppHalf(side, sc.y)) p.rating -= 110;    // begge i EGEN halvdel (0x6fcd09; noten: modstanderens)
        p.rating -= type === 6 || type === 7 || type === 8 || type === 0x5e ? 15 : 100;
      }
      tx = sc.x; ty = sc.y; D = cdist(fromX, fromY, tx, ty);
    }
    // 5.6 karakteren (kun minus – plus kommer ved modtagelsen, sub_6f0630)
    if (receiver) {
      if (io.v && attThird(side, ty)) p.rating -= isK(p) ? 13 : 20;
      else {
        if (isK(p)) p.rating -= 66; else if (!oppHalf(side, fromY) && !oppHalf(side, ty)) p.rating -= 100;   // egen halvdel (0x6fce14)
        p.rating -= type === 6 || type === 7 || type === 8 ? 20 : 72;
      }
    } else p.rating -= 36;
    // 5.8 en kort aflevering ind i målet
    if (!(type === 6 || type === 7 || type === 8 || type === 0x5e) && tx === 4 && ty === (side === 0 ? 12 : -1) && D < 2) type = type === 0x3d ? 0x5c : 0x5d;
    // 6.1 højde og fart
    let h: number, s: number;
    if (type === 0x34 || type === 0x37) {
      if (D < 3 && !inAttBox(side, tx, ty)) h = 0; else if (rand(40) !== 0) h = 4; else h = rand(3);   // 0x6ffc4a (noten har den vendt)
      s = rand(3) + 1;
    } else if (type === 0x1e || type === 8) { h = 4; s = rand(3) + 1; }
    else if (type === 0x3c || type === 0x1f || type === 0x20) { h = rand(3) === 0 ? 4 : 4 - rand(4); s = rand(2) + 1; }
    else if (type === 0xb || type === 7) { h = rand(7) === 0 ? 1 : 0; s = rand(2); }
    else if (type === 9 || type === 0x3e || type === 0x5a) { h = rand(35) === 0 ? 4 - rand(2) : 4; s = rand(2) + 2; }
    else { h = rand(3) !== 0 ? 2 - rand(2) : 4 - rand(4); s = rand(2); }
    m.ballH = h; m.ballSpeed = s;
    if (io.v && h > 0 && rand(3) === 0) h -= rand(2);
    else if (h < 4 && p.momentum > rand(200)) h -= rand(2);                        // farten holder bolden nede
    m.ballH = h;
    // 6.2 retning, berøring, io_flag
    const cx = clamp(tx, 0, 8), cy = clamp(ty, 0, 11);
    if (cx !== fromX || cy !== fromY) m.ballDir = H.bearing(cx - fromX, cy - fromY);
    touch(side);
    if (receiver && (tx !== receiver.x || ty !== receiver.y)) io.v = true;
    // 6.3 opsnapning på vejen
    const Vc = V > -100 ? V : -100;
    if (interceptWalk(fromX, fromY, tx, ty, type, Vc)) {
      if (m.state !== 0) return false;
      if (!onPitch(m.ballX, m.ballY)) c.ballOut(other(side));
      return false;
    }
    // 6.4 i målet, flyvetid, landing
    if (tx === 4 && (ty === 12 || ty === -1)) {
      c.intoGoal(p, D, (ty === 12) !== (side === 0));
      if (m.state !== 0) return false;
    }
    m.loftCountdown = flightTicks(D, m.ballSpeed);
    m.landX = tx; m.landY = ty; m.fromX = p.x; m.fromY = p.y; m.passTo = receiver;
    m.ballX = tx; m.ballY = ty;                                                    // bolden "står" i målfeltet under flugten
    if (!onPitch(tx, ty)) c.ballOut(side);
    return m.state === 0;
  }

  /** sub_6fa490 (sikker): løftet bold / indlæg / clearing uden modtager, gennem sub_6fad40 og linjevogteren (via sub_6fa250's offside-del). */
  function loftedPass(p: GP, ballH: number, hoof: number, wrap: (act: number, ty: number, run: () => boolean) => void): void {
    const t = loftedTarget({ side: p.side, x: p.x, y: p.y, facing: p.facing, creativityRoll: p.roll.creativity }, { x: m.ballX, y: m.ballY, h: m.ballH }, ballH, hoof, rand);
    wrap(t.action, t.ty, () => pass(p, p.x, p.y, t.action, { v: true }, null, t.tx, t.ty));
    if (m.state === 0 && !onPitch(m.ballX, m.ballY)) c.ballOut(p.side);
  }

  /** sub_6f6c00 (sikker; crosses-blocks.md §6): modtageren R i boldens felt – første berøring mod den bedste modstander i feltet. */
  function receive(R: GP, power0: number, ox0: number, oy0: number): void {
    let power = power0, brought = false;
    const d = goalDist(R);
    let h = m.ballH;
    let ox = ox0, oy = oy0;
    if (ox === -1) { ox = m.ballX; oy = m.ballY; }
    const tired = rand(ftol((10000 - ftol(R.condition)) ** 2 / 50000));
    let diff = Math.abs(R.facing - m.ballDir); if (diff > 180) diff = 360 - diff;
    const k = Math.max(1, 5 - h);
    const v = Math.trunc(int16(2 * (180 - diff)) / k);
    const face = diff < 90 ? (11 - Math.trunc(diff / 10)) * v : 2 * v;
    const s = int8(m.ballSpeed - 1);
    power -= 20 * s ** 3;
    if (s !== 0) { if (c.byte1 === 2) power -= (rand(3) + 1) * s; else if (c.byte1 === 0x20) power -= (rand(8) + 3) * s; }
    power = int16(power);
    if (diff <= 90) {
      if (R.roll.anticipation * R.roll.agility <= rand(200) && d >= 2 && !freeAhead(R) && h < 4) turnTo(R, R.x, R.y, ox, oy);
      else turnTo(R, R.x, R.y, 4, R.side === 0 ? (R.y < 9 ? R.y + 3 : 11) : R.y > 3 ? R.y - 3 : 0);
    }
    const inBox = inBoxAt(R.side, R.x, R.y);
    let code: number;
    if (!(inBox && isK(R)) && rand(100 + 200 * R.sportsmanship + 500 * (inBox ? 1 : 0)) === 0) code = 0x25;
    else if (h >= 4) {
      if (!inBox && power > 7 * (20 - R.roll.agility) && spaceToBring(R.side, R.x, R.y)) { code = 0xc; brought = true; m.ballH = 2; h = 2; }
      else {
        const n = ftol(((R.agitation * 0.01 + 0.75) * R.temperCount + 5) * 0.5);  // +0x1a2, +0xff
        const a = rand(70 + 80 * R.yellows + 1500 * (inBox ? 1 : 0));
        code = rand(n) > a ? 0x2e : 0x15;                                          // 0x6f70e1 (noten har sammenligningen vendt)
      }
    } else if (h === 2 || h === 3) {
      code = c.facingGoal(R) && d < 1.41 && rand(R.skill[0xc]) < rand(R.skill[0x3b]) && rand(ftol(R.f.finishing)) >= rand(5) ? 0x3b : 0xc;
    } else code = 0xd;
    const skill = int16(R.skill[code] + (brought ? 2 * (R.roll.agility - 20) : 0));   // 0x6f7012 shl 1 (noten: 10·)
    const a1 = randS(rand, skill), a2 = rand(tired), a3 = rand(face);
    const Rscore = int16(a1 - a2 - a3 + randS(rand, power));
    dbg('rcv:h' + h + ':c' + code.toString(16));
    drainCondition(R, code);                                                       // sub_6f56c0(R, −1, kode)
    const hj = handsJudge(R, code);
    if (hj && rand(ftol(d * 5 + 2)) !== 0) { handsRestart(R, handsPunish(R, hj.sev, hj.b, false)); R.rating -= 25; return; }
    if (hj) c.queueIncident?.(code, R, null, 1, R.x, R.y, hj.sev, hj.b);                       // 0x6f72a5: fordel
    m.carrier = R;
    const C = c.challenge(R, R.side, code);                                        // sub_6c87e0
    m.carrier = null;
    const Cp = C.d;
    const rWins = () => {
      c.takeBall(R); R.rating += 4; R.action = code;
      if (Cp) Cp.busy += C.delayChallenger;
      if (h === 4) {
        if (Cp) {
          R.action = 0x7b; Cp.rating += isK(Cp) ? -600 : -10; R.rating += 40;
          if (nearOwnGoal(m, Cp) && c.facingGoal(R)) { R.rating += 300; if (rand(70 + 30 * Cp.morale) === 0) adjustMorale(Cp, rand(2), rand); }
        }
        R.momentum = clamp(R.momentum + Rscore - (Cp ? C.value : 0) - 200, -200, 200);
        c.playerTurn(R); return;
      }
      R.momentum = clamp(R.momentum + Rscore - (Cp ? C.value : 0) - 200, -200, 200);
      if (randS(rand, R.momentum) >= rand(200)) c.playerTurn(R);                    // "spiller den første gang" (+0x1a7)
    };
    if (!Cp) { dbg('rcv:free'); return rWins(); }
    dbg(Rscore > C.value ? 'rcv:Rwins' : 'rcv:Cwins');
    let refFlag = false, checkR = true;
    if (!(C.value < Rscore && rand(5) !== 0)) {                                     // 0x6f7951: C's forseelse mod R
      const j = c.judge(Cp, R, C.type, -1); refFlag = j.hurt;
      if (j.ret !== 0) {
        if (rand(30) !== 0 || C.clear) { c.foul(Cp, R, j, C); return; }
        c.queueIncident?.(C.type, Cp, R, j.ret, R.x, R.y, j.kind, j.severity);                  // 0x6f7a7e: fordel
        checkR = false;                                                             // overset → 0x6f8458 (R's forseelse tjekkes ikke)
      }
    }
    if (checkR && (Rscore > C.value || rand(5) === 0)) {                            // 0x6f7a8f: R foran → R's forseelse mod C
      const j = c.judge(R, Cp, code, -1); refFlag = j.hurt;
      if (j.ret !== 0) { if (rand(10) !== 0) { c.foul(R, Cp, j, { clear: false }); return; } c.queueIncident?.(code, R, Cp, j.ret, R.x, R.y, j.kind, j.severity); }   // 0x6f8453
    }
    Cp.action = C.type;
    if (h !== 4) { Cp.tacklesTried++; Cp.rating -= Cp.pos & 0x30 && Cp.pos & 0x880 ? 59 : 70; }
    if (Rscore > C.value) return rWins();
    // C vinder bolden
    let perType = true;
    if ((quietCode(C.type) || refFlag || randS(rand, Cp.w31) < -10) && inBoxAt(Cp.side, Cp.x, Cp.y) && rand(2) === 0) { if (h < 4) rand(50); perType = false; }
    if (perType && C.type === 1 && !c.gkCatch(Cp, C.value - Rscore)) return;
    c.takeBall(Cp);
    Cp.momentum = clamp(C.value - Rscore - 200, -200, 200);
    const thr = C.type === 0x13 ? 400 : C.type === 0x21 || C.type === 0x2d ? 250 : 100;
    let loose = false;
    if (Cp.momentum < thr && h !== 4 && h !== -1) {
      looseBall(R.x, R.y, 1, Cp.side, false, true, null);
      if (m.state === 0) { const a = Cp.roll.workRate > rand(10) ? 1 : 0, b = Cp.roll.agility > rand(10) ? 1 : 0; Cp.busy = rand(3 - a - b); loose = true; }
    } else {
      if (h >= 0 && h <= 3) m.ballH = 0;
      turnTo(Cp, R.x, R.y, 4, Cp.side === 0 ? Math.min(R.y + 3, 11) : Math.max(R.y - 3, 0));
    }
    R.busy += C.delayCarrier;
    const bp = loose ? 120 : 200; Cp.rating += bp;
    if (h === 4) {
      Cp.rating += 40; Cp.action = 0x7b; R.rating -= 10;
      if (nearOwnGoal(m, Cp) && c.facingGoal(R)) { Cp.rating += 300; if (rand(70 + 30 * Cp.morale) === 0) adjustMorale(Cp, rand(2), rand); }
    } else {
      Cp.tacklesWon++; Cp.rating += Cp.pos & 6 ? bp : 2 * bp;
      if (nearOwnGoal(m, Cp) && c.facingGoal(R)) { Cp.b6++; Cp.rating += 300; if (rand(70 + 30 * Cp.morale) === 0) adjustMorale(Cp, rand(3), rand); }
    }
  }
  /** sub_6bd5b0(p, 0) (sikker): ingen modstander i p's felt og ingen modstander-markspiller foran ham i samme søjle */
  function freeAhead(p: GP): boolean {
    const opp = other(p.side);
    if (playersIn(opp, p.x, p.y).length) return false;
    for (const q of m.gp) if (q.active && q.side === opp && !isK(q) && (p.side === 1 ? p.y > q.y : p.y < q.y) && q.x === p.x) return false;
    return true;
  }
  /** sub_6c41b0(side, x, y) (sikker): ikke i den sidste tredjedel, ingen modstander i feltet og ingen modstander-markspiller foran i søjlen */
  function spaceToBring(side: Side, x: number, y: number): boolean {
    if (side === 0 ? y > 8 : y < 3) return false;
    const opp = other(side);
    for (const q of m.gp) {
      if (!q.active || q.side !== opp) continue;
      if (q.x === x && q.y === y) return false;
      if (isK(q)) continue;
      if ((side === 1 ? y > q.y : y < q.y) && q.x === x) return false;
    }
    return true;
  }

  /** sub_6c9cd0 (sikker; crosses-blocks.md §5): den løftede bold lander i (x, y) ved boldhøjde 4 uden bestemt modtager. */
  function land(x: number, y: number): void {
    if (!onPitch(x, y)) { c.ballOut(m.lastTouch); return; }
    const facingAdj = (q: GP | null, v: number) => { if (!q) return v; let df = Math.abs(q.facing - m.ballDir); if (df > 180) df = 360 - df; return int16(v + 2 * df - 360); };
    const A = c.challenge(null, 1, 0x15); const sA = facingAdj(A.d, A.value);       // side 0's bedste
    const B = c.challenge(null, 0, 0x15); const sB = facingAdj(B.d, B.value);       // side 1's bedste
    const [cW, cL, sW, sL] = sA > sB ? [A, B, sA, sB] : [B, A, sB, sA];
    const W = cW.d, Lp = cL.d;
    if (!W) { m.ballX = x; m.ballY = y; m.lastPasser = null; dbg('land:none'); return; }
    dbg(W.side === m.lastTouch ? 'land:att' : 'land:def');
    const punishHands = (X: GP, hj: { sev: number; b: number }) => handsRestart(X, handsPunish(X, hj.sev, hj.b, false));
    if (Lp) {
      W.rating += 4;
      let j = c.judge(W, Lp, cW.type, -1);
      if (j.ret !== 0) { if (rand(ftol(goalDist(W) * 10 + 2)) !== 0 || cW.clear) { c.foul(W, Lp, j, cW); return; } }
      else { const hj = handsJudge(W, cW.type); if (hj && rand(10) !== 0) { punishHands(W, hj); return; } }
      j = c.judge(Lp, W, cL.type, -1);
      if (j.ret !== 0) { if (rand(ftol(goalDist(Lp) * 10 + 2)) !== 0 || cL.clear) { c.foul(Lp, W, j, cL); return; } }
      else { const hj = handsJudge(Lp, cL.type); if (hj && rand(10) !== 0) { punishHands(Lp, hj); return; } }
    } else {
      const hj = handsJudge(W, cW.type); if (hj && rand(10) !== 0) { punishHands(W, hj); return; }
    }
    if (cW.type === 1) { if (!c.gkCatch(W, Lp ? sW - sL : sW + 17)) return; }
    else if (Lp) {
      W.rating += 40; Lp.rating += isK(Lp) ? -600 : -10;
      if (nearOwnGoal(m, W)) W.rating += 300;
    }
    W.action = cW.type;
    if (W.roll.anticipation * W.roll.agility <= rand(200) && goalDist(W) >= 2 && !freeAhead(W)) turnTo(W, x, y, m.fromX, m.fromY);
    else turnTo(W, x, y, 4, W.side === 0 ? (y < 9 ? y + 3 : 11) : y > 3 ? y - 3 : 0);
    c.takeBall(W);
    W.momentum = clamp(sW - sL - 225, -200, 200);
    if (Lp) Lp.busy += cW.delayChallenger;                                       // vinderens out2 (sic)
    c.playerTurn(W);
  }

  /** sub_70dfd0 (sikker): q på skudlinjen prøver at blokere skudscoren S i afstanden d fra skytten. 1 = blokeret (bolden er afgjort). */
  function block(q: GP, S: number, d: number, soft: boolean): 0 | 1 {
    const keeper = m.gp.find((o) => o.active && o.side === q.side && isK(o));    // sub_6ce110
    if (q === keeper || q === m.carrier) return 0;
    if (m.poss !== q.side && q.roll.workRate === 0) return 0;
    const n = [300, 400, 500, 1000, 1800][m.ballH];
    if (n === undefined) return 0;                                                // boldhøjde uden for 0..4: fejllog "match_pl.cpp 0x4755"
    let r = rand(n);
    if (d + 1 > 0) r = ftol(int16(r) / (d + 1));
    if (m.lastTouch === q.side) {                                                 // medspiller i vejen
      if (randS(rand, r + 100) !== 0) return 0;
      looseBall(q.x, q.y, rand(m.ballSpeed) + 1, q.side, false, true, q);       // 0x1f5e
      return 1;
    }
    const inBox = inBoxAt(q.side, q.x, q.y), kp = isK(q);
    let kind: number, skill: number;
    if (!(inBox && kp) && rand(100 + 200 * q.sportsmanship + 500 * (inBox ? 1 : 0)) === 0) { kind = 0x25; skill = int16(q.skill[0x25] * 2); }   // hands (shl ax, 1)
    else {
      if (m.ballH === 4) kind = kp ? 1 : 0x15;
      else if (!kp) kind = 0x24;
      else if (m.ballH === 3 && rand(4) !== 0) kind = 1;
      else kind = 0x29;
      skill = q.skill[kind];
    }
    if (soft) skill = ftol(skill * 0.85);
    // 0x70e2e2: [esp+0x18] læses, mens rand-argumentet stadig ligger på stakken (add esp, 4 kommer bagefter) – altså [esp+0x14] = r,
    // ikke handlingskoden. Bekræftet med rand-sporet (oracle/runs/tshot7: v = rand(skill) − S/3 − rand(n)/(d+1)).
    const v = int16(randS(rand, skill) - Math.trunc(S / 3) - r);
    if (v < -100) { q.busy += rand(2); return 0; }
    if (v < 0) return 0;
    const strong = S > rand(150) + 200;
    const hj = handsJudge(q, kind);
    if (hj && !(rand(5) === 0 && !strong)) { handsRestart(q, handsPunish(q, hj.sev, hj.b, strong)); return 1; }
    if (hj) c.queueIncident?.(kind, q, null, 1, q.x, q.y, hj.sev, hj.b);                       // 0x70e3a5: fordel
    if (v >= 400) {                                                               // ren blokering: han får bolden
      q.blocks++; q.rating += 30; q.busy++;
      c.takeBall(q); q.action = kind; return 1;
    }
    if (q.x === 4 && (q.y === 0 || q.y === 11) && v > 200) looseBall(q.x, q.y, rand(3), q.side, false, true, null);   // redning på stregen
    else looseBall(q.x, q.y, rand(3), q.side, false, true, q);
    q.blocks++; q.rating += 20; q.busy += rand(2) + 1; q.action = kind;
    return 1;
  }
  /** sub_6cc540 + sub_6cd3d0 (sikker): skudlinjen – i hvert felt begge sider i tilfældig rækkefølge (rand(2)). Afbøjningen (2) findes ikke
   *  i 3.9.68 (sub_70dfd0 returnerer aldrig 2). */
  function shotLine(p: GP, S: number, soft: boolean): 0 | 1 {
    m.lastToucher = null;
    const gy = p.side === 0 ? 11 : 0;
    const cell = (side: Side, x: number, y: number, d: number) => {
      for (const q of playersIn(side, x, y)) {
        if (q.busy > 1) continue;
        const r = block(q, S, d, soft);
        c.onBlock?.(q, S, d, soft, r);
        if (r === 1) { q.blocks++; m.lastToucher = q; return true; }
      }
      return false;
    };
    return walkShotLine(p.x, p.y, gy, (x, y, d) => { const r = rand(2) as Side; return cell(r, x, y, d) || cell(other(r), x, y, d); }) ? 1 : 0;
  }

  return { turnTo, looseBall, tryIntercept, interceptWalk, pass, loftedPass, receive, land, block, shotLine, handsJudge, handsPunish };
}
export type PassEngine = ReturnType<typeof makePass>;
