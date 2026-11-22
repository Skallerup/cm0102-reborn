// CM3_MATCH_ENGINE::quick_simulate_match 0x6beeb0 – originalens «hurtige» kamp (cm0102.exe 3.9.68, porteret 22/11-2026 instruktion for instruktion).
//
// run_match_steps 0x6b98c0 tester engine+0 ved 0x6b98ce: ≠ 0 (cmQuickMatch.ts 0x6b66a0 og baggrundskampene −2 med init_match(…, 1, 0, 0)
// 0x84c3e8) → ingen trin – kun 0x6beeb0, kampens spiller 0x6d0f80 og kamprapporten 0x6d1cc0. Kampen regnes minut for minut af holdenes syv
// styrker engine+0x1da…+0x1f2 (word pr. side, 0x6c0c60) med to halve minutter pr. minut: afleveringer, tacklinger, hovedstød, offside,
// frispark/kort, hjørner og chancen. Karaktererne (+0x35) drives af styrkeberegningen (træk og ±5 mod pladsens niveau hvert minut) og
// hændelsernes justeringer (0x6c06b0…0x6c0b70); til sidst for −2-kampenes 11 startere omdømme/kamp-CA-faktoren og den viste karakter +0x1b =
// ftol((+0x35 + 6000)·0,0004 + 1,83) klemt 1..10 (ikke sub_6ce460's trunc((+0x35 + 500)/1000)).
//
// Kald: 0x6c0c60 sideStrengths, 0x6c06b0/0x6c07a0/0x6c0890/0x6c0980/0x6c0a70/0x6c0b70 karakterjusteringerne, 0x6c2050 skytten,
// 0x6c2310 kortet, 0x6c23f0 oplæggeren, 0x6c2750 en tilfældig angriber, 0x6c2880 tackleren, 0x7165b0 temperamentsrullet, 0x6f56c0(…, −1)
// konditionen, 0x6cda20(p, 1) udvisningen (matchSubs.sendOffQuick), 0x6d0980 skaden og 0x6d6f70 kommentarkøen (gridMatch.ts' egne).
// Konstanterne er læst af exe'en (dword = float32, qword = double). Floats gemt med fstp dword afrundes (Math.fround), resten regnes i double
// som x87 med 53 bit.
import type { GP, GridMatchState } from './gridMatch';

type Rand = (n: number) => number;
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const u8 = (v: number) => v & 0xff;
const f = Math.fround;
const ftol = (x: number) => Math.trunc(x);                                                  // 0x945640 (_ftol: mod nul)
// float32-konstanterne (fmul/fadd dword)
const F0_65 = f(0.65), F0_75 = f(0.75), F0_8 = f(0.8), F0_85 = f(0.85), F0_9 = f(0.9), F0_92 = f(0.92), F0_95 = f(0.95), F0_97 = f(0.97), F0_98 = f(0.98);
const F1_02 = f(1.02), F1_04 = f(1.04), F1_05 = f(1.05), F1_08 = f(1.08), F1_1 = f(1.1), F1_15 = f(1.15), F1_25 = f(1.25);
const F0_5 = f(0.5), F0_3 = f(0.3), F0_2 = f(0.2), F0_15 = f(0.15), F0_1 = f(0.1), F1_0 = 1;
const F1_4 = f(1.4), F0_6 = f(0.6), F0_7 = f(0.7);

/** 0x9cf…-landene (cmWageGame.ts KEY_NATIONS) i 0x6c1af4–0x6c1c25: hjemmeklubbens land = turneringens land → side's +0x1de = hjemmeholdets ·k */
const NATION_K: Record<string, number> = {
  Germany: F1_15, Scotland: F1_15, Belgium: F1_15, Sweden: F1_25, Norway: F1_05, England: F1_05, Holland: F1_1, Denmark: F1_1, Portugal: F1_1, France: F1_1,
};

export interface QuickFixture {
  /** fixture[0] = −2 (baggrundskampen 0x84be20) */
  bg: boolean;
  /** fixture+0x14 ≠ NULL */
  hasComp: boolean;
  /** !fixture+0x14 || 0x5c6710(turneringen) (venskabs-/turnéturneringer) */
  tour: boolean;
  /** hjemmeklubbens land (club+0x53) = turneringens (+0x5d): landets navn (0x6c1ac8–0x6c1ae6), ellers null */
  nation: string | null;
  /** fixture+0x1c → +0x57 == fixture+0x14 (hjemmeholdets liga) */
  homeLeague: boolean;
  /** club +0x80 [hjemme, ude] */
  rep: [number, number];
  /** fixture+0x38 (word) */
  flags38: number;
  /** fixture+0x4b/+0x4c (første kamps mål) – null = 0xff */
  firstLeg: [number, number] | null;
}

export interface QuickEnv {
  m: GridMatchState;
  rand: Rand;
  /** de 20 i kamptruppen pr. side i indeksrækkefølge (MATCH_PLAYER engine+0x4796 + 0x1be·(20·side + k)) */
  sides: [GP[], GP[]];
  /** holdblokken engine+0xf5bc + 54·side (indeks = offset − 0xf5bc) */
  blk: [number[], number[]];
  /** spillerposten [+0x6d] (byte med fortegn) og dens +5 (word, CA) */
  rec: (q: GP, off: number) => number;
  ca: (q: GP) => number;
  fx: QuickFixture;
  sendOff: (q: GP) => void;
  injure: (kind: number, sev: number, q: GP, o: GP | null) => void;
  comment: (id: number, p: GP | null, side: number) => void;
  onGoal?: (p: GP, assister: GP | null, pen: boolean) => void;
  onCard?: (p: GP, code: number) => void;
}

export interface QuickResult {
  /** sidste minut (engine+0x8ed0) – over 90 = forlænget spilletid */
  minutes: number;
  /** fixture+0x49/+0x4a: straffesparkskonkurrencen (null = ingen) */
  pens: [number, number] | null;
}

// MATCH_PLAYER-floats +0x71 + 4·i (matchValues.ts MV_FLOATS)
const fl = (q: GP) => q.f;

/** sub_7165b0(p, 0): ftol(((0,01·agitation + 0,75)·+0xff + 5)·0,5) (challenge.ts' styrkerul) */
const temper0 = (q: GP) => ftol(((0.01 * q.agitation + 0.75) * s8(q.temperCount) + 5) * 0.5);

/** sub_6f56c0(p, tab, −1): ×12/10/8/6 · 1/11 efter konditionen (> 9500/8750/7750), aldrig under 0 */
function drain(q: GP, tab: number): void {
  const c = q.condition;
  const k = c > 9500 ? 12 : c > 8750 ? 10 : c > 7750 ? 8 : 6;
  const v = f(c - tab * k * f(1 / 11));
  q.condition = v < 0 ? 0 : v;
}

/** 0x6c0c60: siden's syv styrker T[k][side] (engine+0x1da + 4k + 2·side) af de 20 – konditionstrækket og karakterens drift pr. plads */
function sideStrengths(e: QuickEnv, T: number[][], s: 0 | 1): void {
  const { rand, rec } = e;
  for (let k = 0; k < 7; k++) T[k][s] = 0;
  const add = (k: number, v: number) => { T[k][s] = s16(T[k][s] + ftol(v)); };
  for (const q of e.sides[s]) {
    if (q.slot < 0) continue;
    const F = fl(q);
    drain(q, f(30 - s8(rec(q, 0x3c))));                                                     // 0x6c0ce1: 6f56c0(p, (float)(30 − Stamina), −1)
    const bl = q.pos & 0xff;
    const cons = () => rand(s8(rec(q, 0x21))) < rand(20);                                    // rand(Consistency) < rand(20) → ×0,75
    // v14 (0x6c0d0b–0x6c0fbf): Tackling, Positioning, Pace, Anticipation
    let v14 = f((((F.tackling + F.positioning) + F.pace) + F.anticipation + 50) * 0.5 + 48 + q.condition * 0.01 - 100);
    {
      const x = s8(rec(q, 0x2f)) >> 2;                                                       // sar cl, 2 (Influence)
      const S = x + v14;
      const k = bl & 4 ? 0.1 : bl & 2 ? 0.1 : bl & 8 ? 0.028 : 0.01;
      v14 = f(e.ca(q) * k + S);
      const t3 = (o: number, a: number, b: number, c: number) => { const r = s8(rec(q, o)); if (r > 15) v14 = f(v14 * a); else if (r < 6) v14 = f(v14 * b); else if (r < 10) v14 = f(v14 * c); };
      t3(0x32, F1_05, F0_95, F0_98); t3(0x3c, F1_05, F0_9, F0_95); t3(0x44, F1_02, F0_95, F0_98); t3(0x3e, F1_05, F0_95, F0_98);
      t3(0x1e, F1_05, F0_95, F0_98); t3(0x2e, F1_02, F0_95, F0_98); t3(0x2b, F1_02, F0_95, F0_98);
      const sp = s8(rec(q, 0x36) + rec(q, 0x1b));
      if (sp > 35) v14 = f(v14 * F1_02); else if (sp < 10) v14 = f(v14 * F0_9); else if (sp < 20) v14 = f(v14 * F0_98);
      if (cons()) v14 = f(v14 * F0_75);
    }
    // v10 (0x6c0fc3–0x6c129f): Creativity, Passing, Flair, Heading, Crossing
    let v10 = f(((F.creativity * 2 + F.passing * 2) + F.flair + F.heading + F.crossing * 1.5 + 50) * 0.5 + q.condition * 0.01 + 57 - 100);
    {
      const k = bl & 0x40 ? 0.1 : bl & 0x20 ? 0.26 : bl & 0x10 ? 0.21 : bl & 8 ? 0.0125 : 0.01;
      v10 = f(e.ca(q) * k + v10);
      const r44 = s8(rec(q, 0x44)); if (r44 > 15) v10 = f(v10 * F1_05); else if (r44 <= 5) v10 = f(v10 * F0_92);
      const r3c = s8(rec(q, 0x3c)); if (r3c > 15) v10 = f(v10 * F1_02); else if (r3c <= 5) v10 = f(v10 * F0_95);
      const r35 = s8(rec(q, 0x35)); if (r35 > 15) v10 = f(v10 * F1_1); else if (r35 <= 5) v10 = f(v10 * F0_9);
      const t3 = (o: number, a: number, b: number, c: number) => { const r = s8(rec(q, o)); if (r > 15) v10 = f(v10 * a); else if (r < 6) v10 = f(v10 * b); else if (r < 10) v10 = f(v10 * c); };
      t3(0x37, F1_15, F0_8, F0_92); t3(0x43, F1_15, F0_8, F0_92);
      const sp = s8(rec(q, 0x40) + rec(q, 0x36) + rec(q, 0x26) + rec(q, 0x1b));
      if (sp > 75) v10 = f(v10 * F1_08); else if (sp > 65) v10 = f(v10 * F1_05); else if (sp > 50) v10 = f(v10 * F1_02);
      else if (sp <= 35) v10 = f(v10 * (sp > 25 ? F0_98 : F0_92));
      const r1e = s8(rec(q, 0x1e)); if (r1e > 15) v10 = f(v10 * F1_1); else if (r1e < 10) v10 = f(v10 * F0_95);
      t3(0x33, F1_05, F0_95, F0_98);
      const r3f = s8(rec(q, 0x3f)); if (r3f > 15) v10 = f(v10 * F1_02); else if (r3f < 10) v10 = f(v10 * F0_95);
      if (cons()) v10 = f(v10 * F0_75);
    }
    // v20 (0x6c12a3–0x6c1516): Dribbling, Acceleration, Off the Ball, Finishing, Anticipation, Heading, Pace – kæden i st0 til 0x6c1470
    let v20 = f(((((F.dribbling + F.acceleration) + F.offTheBall * 1.5) + F.finishing * 2) + F.anticipation * 1.5 + F.heading + F.pace + 50) * 0.5 + q.condition * 0.01 + 76 - 100);
    {
      const k = bl & 0x40 ? 0.2 : bl & 0x20 ? 0.11 : bl & 0x10 ? 0.06 : bl & 8 ? 0.015 : 0.01;
      let st = e.ca(q) * k + v20;
      const r44 = s8(rec(q, 0x44)); if (r44 > 15) st *= F1_02; else if (r44 < 6) st *= F0_95; else if (r44 < 10) st *= F0_98;
      const r3c = s8(rec(q, 0x3c)); if (r3c > 15) st *= F1_02; else if (r3c < 6) st *= F0_95; else if (r3c < 10) st *= F0_98;
      const r35 = s8(rec(q, 0x35)); if (r35 > 15) st *= F1_05; else if (r35 > 10) st *= F1_02; else if (r35 < 6) st *= F0_92;
      const r31 = s8(rec(q, 0x31)); if (r31 > 15) st *= F1_04; else if (r31 > 10) st *= F1_02; else if (r31 < 6) st *= F0_98;
      const tech = s8(rec(q, 0x40));
      const sp = s8(rec(q, 0x36) + rec(q, 0x26) + rec(q, 0x1b) + tech);
      st *= sp > 75 ? F1_08 : sp > 65 ? F1_05 : sp > 50 ? F1_02 : sp < 10 ? F0_65 : sp < 25 ? F0_85 : F0_95;
      v20 = f(st);
      const r1e = s8(rec(q, 0x1e)); if (r1e > 15) v20 = f(v20 * F1_08); else if (r1e < 6) v20 = f(v20 * F0_9); else if (r1e < 10) v20 = f(v20 * F0_97);
      const r33 = s8(rec(q, 0x33)); if (r33 > 15) v20 = f(v20 * F1_08); else if (r33 > 10) v20 = f(v20 * F1_02); else if (r33 < 6) v20 = f(v20 * F0_92);
      if (tech > 15) v20 = f(v20 * F1_05);
      if (cons()) v20 = f(v20 * F0_75);
    }
    // 0x6c151a–0x6c15f9: keeperen (Reflexes, Positioning, Handling), A (temperamentet 0x7165b0 + Aggression – bliver i st0), hovedstød og B
    const c01 = q.condition * 0.01;
    const v2c = f((F.reflexes + F.positioning + F.handling + 50) * 0.5 + 50 + c01 - 100);
    const A = ((temper0(q) + F.aggression + 50) * 0.5 + 50) + c01 - 100;
    const B = F.jumping + F.positioning;
    const v1c = f((B + F.heading + 50) * 0.5 + 50 + c01 - 100);
    const v24 = f((B + F.handling + 50) * 0.5 + 50 + c01 - 100);
    // pladsens drift: −d og så ±5 mod niveauet (fild karakteren; fcomp: ≤ niveau → +5, ellers −5), og bidragene til de syv styrker
    const drift = (d: number, lvl: number) => { const r = s16(q.rating + d); q.rating = s16(r > lvl ? r - 5 : r + 5); };
    // niveauerne er float32 (0x96d35c 7920,0005, 0x96d34c 6929,9995 …) – karakteren er et heltal
    if (bl & 1) { drift(-3, 7920.00048828125); add(0, v14 * 0.16); add(3, v2c * 2); add(4, A * 0.1); add(6, v24 * 0.16); }
    else if (bl & 2) { drift(-13, 5940); add(0, v14 * 1.05); add(1, v10 * 0.2); add(2, v20 * 0.1); add(3, v2c * 0.25); add(4, A * 0.5); add(5, v1c * 0.75); add(6, v24 * 0.5); }
    else if (bl & 4) { drift(-13, 5940); add(0, v14); add(1, v10 * 0.15); add(2, v20 * 0.1); add(3, v2c * 0.2); add(4, A * 0.5); add(5, v1c * 0.75); add(6, v24 * 0.5); }
    else if (bl & 8) { drift(-12, 5610); add(0, v14 * 0.85); add(1, v10 * 0.255); add(2, v20 * 0.235); add(3, v2c * 0.15); add(4, A * 0.5); add(5, v1c * 0.75); add(6, v24 * 0.5); }
    else if (bl & 0x10) { drift(-8, 6270); add(0, v14 * 0.4); add(1, v10 * 0.75); add(2, v20 * 0.68); add(3, v2c * 0.05); add(4, A * 0.5); add(5, v1c * 0.75); add(6, v24 * 0.5); }
    else if (bl & 0x20) { drift(-11, 6929.99951171875); add(0, v14 * 0.15); add(1, v10 * 1.2); add(2, v20 * 0.95); add(3, v2c * 0.02); add(4, A * 0.5); add(5, v1c * 0.75); add(6, v24 * 0.35); }
    else if (bl & 0x40) { drift(-25, 7590); add(0, v14 * 0.05); add(1, v10 * 1.02); add(2, v20 * 1.5); add(3, v2c * 0.02); add(4, A * 0.5); add(5, v1c * 1.5); add(6, v24 * 0.2); }
  }
  // 0x6c1aba–0x6c1c2a: hjemmeklubbens land = turneringens: side's +0x1de = hjemmeholdets +0x1de ·k (sic – også for side 1)
  const fx = e.fx;
  if (fx.nation && NATION_K[fx.nation]) T[1][s] = s16(ftol(T[1][0] * NATION_K[fx.nation]));
  T[1][s] = s16(ftol(T[1][s] * F1_05)); T[2][s] = s16(ftol(T[2][s] * F1_02));
  if (fx.tour) T[1][s] = s16(ftol(T[1][0] * F1_1));                                         // 0x6c1c99 (hjemmeholdets, sic)
  if (fx.rep[0] < 2500) { T[1][s] = s16(ftol(T[1][s] * F1_04)); T[2][s] = s16(ftol(T[2][s] * F1_15)); }
  const d = s16(fx.rep[0] - fx.rep[1]);
  if (s === 0) {
    // 0x6c1d53–0x6c1e75 (hjemmeholdets egne felter)
    if (d > 1000) { T[1][0] = s16(ftol(T[1][0] * 1.02)); T[2][0] = s16(ftol(T[2][0] * 1.02)); T[0][0] = s16(ftol(T[0][0] * 1.02)); }
    else if (d > -250) { T[1][0] = s16(ftol(T[1][0] * 1.02)); T[2][0] = s16(ftol(T[2][0] * 1.01)); T[0][0] = s16(ftol(T[0][0] * 1.01)); }
    else { T[0][0] = s16(ftol(T[0][0] * 1.02)); T[1][0] = s16(ftol(T[1][0] * 0.975)); }
    // 0x6c1ea2–0x6c1fbd: favoritten hjemme uden mål endnu
    const g0 = u8(e.m.goals[0]);
    if (d > 1250) { if (g0 === 0) T[2][0] = s16(ftol(T[2][0] * 1.02)); T[0][0] = s16(ftol(T[0][0] * 1.05)); }
    else if (d > 750) { if (g0 === 0) T[2][0] = s16(ftol(T[2][0] * 1.02)); T[0][0] = s16(ftol(T[0][0] * 1.03)); }
    else if (d > 250) { if (g0 === 0) T[2][0] = s16(ftol(T[2][0] * 1.01)); T[0][0] = s16(ftol(T[0][0] * 1.02)); }
  } else if (d < -750 && u8(e.m.goals[1]) === 0) {                                          // 0x6c1fd1–0x6c2030
    T[2][1] = s16(ftol(T[2][1] * 1.02)); T[0][1] = s16(ftol(T[0][1] * 1.01));
  }
}

/** karakterjusteringerne for siden's spillere på banen: rating += ftol(delta·k[pladsen]) (0 = ingen, NaN = delta uden ftol) */
function adjust(e: QuickEnv, s: 0 | 1, delta: number, k: [number, number, number, number, number, number, number]): void {
  const dw = s16(delta);
  for (const q of e.sides[s]) {
    if (q.slot < 0) continue;
    const bl = q.pos & 0xff;
    const i = bl & 1 ? 0 : bl & 2 ? 1 : bl & 4 ? 2 : bl & 8 ? 3 : bl & 0x10 ? 4 : bl & 0x20 ? 5 : bl & 0x40 ? 6 : -1;
    const kk = i < 0 ? 0 : (k as readonly number[])[i];
    if (kk === 0) continue;
    q.rating = s16(q.rating + (Number.isNaN(kk) ? dw : ftol(dw * kk)));
  }
}
// rækkefølgen 1 (GK), 2 (SW), 4 (D), 8 (DM), 0x10 (M), 0x20 (AM), 0x40 (F)
const ADJ_ATT: [number, number, number, number, number, number, number] = [0, 0.2, 0.15, 0.255, 0.75, 1.2, 1.02];        // 0x6c06b0
const ADJ_DEF: [number, number, number, number, number, number, number] = [0.16, 1.05, NaN, 0.85, 0.4, 0.15, 0.05];       // 0x6c07a0
const ADJ_SP_SHOT: [number, number, number, number, number, number, number] = [0, 0.75, 0.75, 0.75, 0.75, 0.75, 1.5];   // 0x6c0890
const ADJ_SHOT: [number, number, number, number, number, number, number] = [0, 0.1, 0.1, 0.235, 0.68, 0.95, 1.5];       // 0x6c0980
const ADJ_SP_DEF: [number, number, number, number, number, number, number] = [0.16, 0.5, 0.5, 0.5, 0.5, 0.35, 0.2];      // 0x6c0a70
const ADJ_SAVE: [number, number, number, number, number, number, number] = [2, 0.25, 0.2, 0.15, 0.05, 0.02, 0.02];       // 0x6c0b70

/** vægten efter pladsen (de fire vælgere): 2, 4, 8, 0x10, 0x20, 0x40 med en side (0x100/0x200/0x400), 0x40 uden; null = uændret */
function posWeight(pos: number, w: [number, number, number, number, number, number, number]): number | null {
  const bl = pos & 0xff;
  if (bl & 2) return w[0]; if (bl & 4) return w[1]; if (bl & 8) return w[2]; if (bl & 0x10) return w[3]; if (bl & 0x20) return w[4];
  if (pos & 0x40) return pos & 0x700 ? w[5] : w[6];
  return null;
}
/** bedste score (strengt større; den første tages altid) – 0xff = ingen */
function pick(e: QuickEnv, s: 0 | 1, score: (q: GP) => number | null): number {
  let best = 0, ix = -1;
  e.sides[s].forEach((q, k) => {
    if (q.slot < 0 || q.pos & 1) return;
    const v = score(q); if (v === null) return;
    if (ix === -1 || v > best) { best = f(v); ix = k; }
  });
  return ix;
}
/** CA-vægten (+5: > 140 ×1,4, < 60 ×0,6, ellers CA·0,01) – fstp dword */
const caW = (e: QuickEnv, q: GP, w: number) => { const ca = s16(e.ca(q)); return f(ca > 140 ? w * F1_4 : ca < 60 ? w * F0_6 : ca * 0.01 * w); };

/** 0x6c2050 (pick_shot_taker): straffe = rand(Penalties), ellers rand(7) = 0 → rand(Free Kicks + 15), rand(3) ≠ 0 → skuddet, ellers hovedstødet
 *  (de to sidste · vægten); over 25 → − rand(5) */
function pickShooter(e: QuickEnv, s: 0 | 1, pen: boolean): number {
  const { rand } = e;
  return pick(e, s, (q) => {
    const F = fl(q);
    let w = posWeight(q.pos, [f(0.4), f(0.45), F0_5, F0_75, f(0.85), f(1.1), F1_0]) ?? s;   // ingen plads: argumentets byte (sic – sker ikke)
    w = caW(e, q, w);
    if (rand(s8(e.rec(q, 0x21))) < rand(20)) w = f(w * F0_7);
    let v: number;
    if (pen) v = rand(ftol(F.penalties));
    else if (rand(7) === 0) v = rand(ftol(F.freeKicks + 15));
    else if (rand(3) !== 0) v = rand(ftol(F.flair * 0.1 + F.dribbling * 0.45 + F.longShots * 0.35 + F.anticipation * 0.35 + F.finishing + 18)) * w;
    else v = rand(ftol(F.strength * 0.25 + F.jumping * 0.75 + F.heading + 10)) * w;
    if (v > 25) v = f(v) - rand(5);
    return v;
  });
}
/** 0x6c2310 (pick_booked_player): rand(0x7165b0(p, 0) + 25 | + 5) · (keeper 0,2) */
function pickBooked(e: QuickEnv, s: 0 | 1, yellow: boolean): number {
  let best = 0, ix = -1;
  e.sides[s].forEach((q, k) => {
    if (q.slot < 0) return;
    const w = q.pos & 1 ? F0_2 : 1;
    const v = e.rand(s8(temper0(q)) + (yellow ? 25 : 5)) * w;
    if (ix === -1 || v > best) { best = f(v); ix = k; }
  });
  return ix;
}
/** 0x6c23f0 (pick_assist_provider): rand(5) = 0 → ingen */
function pickAssist(e: QuickEnv, s: 0 | 1, setPiece: boolean): number {
  const { rand, rec } = e;
  const ix = pick(e, s, (q) => {
    const F = fl(q), bl = q.pos & 0xff, wide = !!(q.pos & 0x880);
    let w: number | null = bl & 2 ? F0_15 : bl & 4 ? F0_2 : bl & 8 ? (wide ? F0_5 : F0_3) : bl & 0x10 ? (wide ? f(0.65) : F0_8) : bl & 0x20 ? F1_05
      : q.pos & 0x40 ? (q.pos & 0x700 ? F0_95 : F0_85) : null;
    w ??= s;
    w = caW(e, q, w);
    const t3 = (o: number) => { const r = s8(rec(q, o)); if (r > 15) w = f(w! * F1_1); else if (r < 6) w = f(w! * F0_8); else if (r < 10) w = f(w! * F0_95); };
    t3(0x37); t3(0x43);
    if (!setPiece) {
      const sp = s8(rec(q, 0x40) + rec(q, 0x36) + rec(q, 0x26) + rec(q, 0x1b));
      if (sp > 75) w = f(w * F1_25); else if (sp > 60) w = f(w * F1_05); else if (sp < 25) w = f(w * 0.75); else if (sp < 40) w = f(w * F0_95);
    }
    if (rand(s8(rec(q, 0x21))) < rand(20)) w = f(w * F0_75);
    if (setPiece) return rand(ftol(F.freeKicks - F.finishing - F.jumping + 50));
    if (rand(5) !== 0) return rand(ftol(F.creativity + F.passing + F.crossing + 5)) * w;
    return rand(ftol(F.heading + 5)) * w;
  });
  return rand(5) === 0 ? -1 : ix;
}
/** 0x6c2750 (pick_random_forward): rand(25) · vægten */
function pickForward(e: QuickEnv, s: 0 | 1): number {
  return pick(e, s, (q) => e.rand(25) * (posWeight(q.pos, [F0_1, F0_1, F0_2, F0_5, F0_75, f(1.05), F1_0]) ?? s));
}
/** 0x6c2880 (pick_tackling_defender): vægten · Work Rate/Positioning/Tackling, så rand(25) */
function pickTackler(e: QuickEnv, s: 0 | 1): number {
  const { rec } = e;
  return pick(e, s, (q) => {
    let w = posWeight(q.pos, [f(1.2), f(1.2), f(0.65), F0_5, f(0.35), f(0.25), F0_15]) ?? s;
    const r44 = s8(rec(q, 0x44)); if (r44 > 15) w = f(w * F1_1); else if (r44 > 10) w = f(w * F1_05); else if (r44 < 5) w = f(w * F0_95);
    const r39 = s8(rec(q, 0x39)); if (r39 > 15) w = f(w * F1_1); else if (r39 < 5) w = f(w * F0_95);
    const r3e = s8(rec(q, 0x3e)); if (r3e > 15) w = f(w * F1_1); else if (r3e < 5) w = f(w * F0_95);
    return e.rand(25) * w;
  });
}

/** quick_simulate_match 0x6beeb0 */
export function quickSimulate(e0: QuickEnv): QuickResult {
  // (ydelse) spillerposten ændres ikke i kampen: posten og CA'en læses én gang pr. spiller (0x6c0c60 læser dem hvert minut)
  const recs = new Map<GP, Int8Array>(), cas = new Map<GP, number>();
  const recOf = (q: GP) => { let r = recs.get(q); if (!r) { r = new Int8Array(0x46); for (let o = 0; o < 0x46; o++) r[o] = e0.rec(q, o); recs.set(q, r); } return r; };
  const e: QuickEnv = { ...e0, rec: (q, o) => recOf(q)[o], ca: (q) => { let v = cas.get(q); if (v === undefined) { v = e0.ca(q); cas.set(q, v); } return v; } };
  const { m, rand, blk, fx } = e;
  const T: number[][] = Array.from({ length: 7 }, () => [0, 0]);
  const goals = m.goals;
  const MP = (s: number, k: number) => e.sides[s][k];
  // fixture+0x43…+0x4c (bytes med fortegn; 0xff = ingen)
  const X = { h43: -1, a44: -1, h45: -1, a46: -1, h47: -1, a48: -1, p49: -1, p4a: -1, b4b: fx.firstLeg ? s8(fx.firstLeg[0]) : -1, b4c: fx.firstLeg ? s8(fx.firstLeg[1]) : -1 };
  const f38 = fx.flags38 & 0xffff;
  let minute = 0;                                                                            // engine+0x8ed0
  let b20 = 0, b13 = 0, b15 = 0, gg = 0;                                                     // straffe, slut, golden goal, engine+0x1a8
  let pensFn = false;
  let lastSide: 0 | 1 = 0;                                                                   // [esp+0x18]: den sidst angribende side
  const blkW = (s: number, o: number, d = 1) => { blk[s][o] = (blk[s][o] + d) & 0xffff; };
  const blkB = (s: number, o: number, d = 1) => { blk[s][o] = (blk[s][o] + d) & 0xff; };
  const pickRandom = (s: 0 | 1): number | null => {                                          // rand(20) indtil plads ≥ 0, højst 120 forsøg
    for (let tries = 1; ; tries++) {
      const k = rand(20);
      if (MP(s, k) && MP(s, k).slot >= 0) return tries >= 120 ? null : k;
      if (tries >= 120) return null;
    }
  };
  for (;;) {                                                                                 // 0x6beeda: et minut
    sideStrengths(e, T, 0); sideStrengths(e, T, 1);
    for (let k = 0; k < 4; k++) {                                                            // hjemmeholdets fire første mellem ½ og 2 gange udeholdets
      const a = T[k][0], b = T[k][1];
      if (a < b * 0.5) T[k][0] = s16(ftol(b * 0.5)); else if (a > b * 2) T[k][0] = s16(b * 2);
    }
    const first = rand(2);
    let abortMinute = false;
    for (let half = 0; half < 2 && !abortMinute; half++) {
      if (gg) break;
      const s = (first ? half : half === 0 ? 1 : 0) as 0 | 1, o = (1 - s) as 0 | 1;
      lastSide = s;
      // afleveringerne 0x6bf0af–0x6bf1fa: to faste og en tredje, når s vinder rullet
      for (let c = 0; c < 3; c++) {
        if (c === 2) { const a = rand(T[1][s] + T[0][s]); if (a <= rand(T[0][o] + T[1][o])) break; }
        blkW(s, 0x26);
        const k = pickRandom(s);
        if (k === null) { b13 = 1; break; }
        const q = MP(s, k);
        const v = f(fl(q).passing + 20);
        if (rand(Math.trunc((T[0][o] + 200) / 19)) < v) { blkW(s, 0x28); q.rating = s16(q.rating + 40); } else q.rating = s16(q.rating - 30);
      }
      // tacklingen 0x6bf203–0x6bf2e8
      if (rand(T[1][s] + T[0][s]) > rand(T[0][o] + T[1][o])) {
        blkW(s, 0x2a);
        const k = pickTackler(e, s);
        if (k < 0) { b13 = 1; abortMinute = true; break; }
        const q = MP(s, k);
        if (rand(Math.trunc(T[1][o] / 5)) < f(fl(q).tackling + 15)) { q.rating = s16(q.rating + 40); blkW(s, 0x2c); } else q.rating = s16(q.rating - 10);
      }
      // hovedstødet 0x6bf2f0–0x6bf40c
      if (rand(T[1][s] + T[0][s]) > rand(T[0][o] + T[1][o])) {
        blkW(s, 0x2e);
        const k = pickRandom(s);
        if (k === null) { b13 = 1; abortMinute = true; break; }
        const q = MP(s, k);
        if (rand(Math.trunc((T[6][o] + 100) / 7)) < f(fl(q).jumping + 15)) { blkW(s, 0x30); q.rating = s16(q.rating + 20); } else q.rating = s16(q.rating - 8);
      }
      if (rand(10) === 0) blkB(s, 0xc);                                                     // +0xf5c8 indkast
      // offside 0x6bf43a–0x6bf4b4
      {
        const k = pickForward(e, s);
        const q = k >= 0 ? MP(s, k) : null;
        const a = rand(ftol((q ? fl(q).offTheBall : 0) + 20));
        if (a < rand(2) && q) { q.rating = s16(q.rating - 15); blkB(s, 0xe); }
      }
      // frispark og kort 0x6bf4b6–0x6bf720 (o begår frisparket)
      b20 = 0; let b28 = 0;
      if (rand(T[4][o]) > rand(1600)) {
        blkB(o, 0xd);
        let red = false;
        if (rand(T[4][o]) > rand(25000)) {
          const k = pickBooked(e, o, false); const q = MP(o, k);
          q.rating = s16(q.rating - 250); q.b23 = u8((q.b23 ?? 0) + 1); blkB(o, 0xf);
          e.onCard?.(q, 3); e.sendOff(q); sideStrengths(e, T, o); e.comment(0x1ff8, q, o);
          red = true;
        } else if (rand(T[4][o]) > rand(1700)) {
          const k = pickBooked(e, o, true); const q = MP(o, k);
          q.rating = s16(q.rating - 50); q.yellows = u8(q.yellows + 1); blkB(o, 0x10); e.onCard?.(q, 2);
          if (q.yellows === 2) { q.b23 = u8((q.b23 ?? 0) + 1); blkB(o, 0xf); e.onCard?.(q, 3); e.sendOff(q); sideStrengths(e, T, o); e.comment(0x1ff8, q, o); }
          if (blk[o][0xf] > 4) {                                                             // 0x6bfd45: over 4 udviste – opgivet
            b13 = 1; goals[o] = 0; goals[s] = goals[s] <= 3 ? 3 : goals[s];
            if (s !== 0) { X.h43 = 3; X.a44 = 0; } else { X.h43 = 0; X.a44 = 3; }
            if (X.b4b !== -1 && X.b4b + X.h43 === X.b4c + X.a44) { X.h43++; goals[0] = u8(goals[0] + 1); }
            abortMinute = true; break;
          }
        }
        void red;
        if (rand(30) !== 0) { b28 = 1; blkB(o, 0xa); } else b20 = 1;
      } else if (rand(T[1][s]) > rand(3000)) { b28 = 1; blkB(s, 0xb); }                      // hjørnet +0xf5c7
      // chancen 0x6bf720–0x6bf912
      let Fk: number;
      {
        const gs = u8(goals[s]), ga = u8(goals[o]);
        const diff = gs - ga;
        const agg = (s === 0 ? X.b4b - X.b4c : X.b4c - X.b4b) + diff;
        Fk = agg > 3 ? diff : gs + ga === 0 ? (minute > 60 ? F0_65 : F0_75) : 1;
      }
      let d: number;
      if (!b28) {
        const a = rand(ftol(T[0][o] * Fk * 4.8));
        d = s16(rand(T[1][s]) - a);
        if (d > 0) { adjust(e, s, 28, ADJ_ATT); adjust(e, o, -20, ADJ_DEF); } else { adjust(e, s, -6, ADJ_ATT); adjust(e, o, 40, ADJ_DEF); }
      } else {
        const a = rand(ftol(T[6][o] * Fk * 6.1));
        d = s16(rand(T[1][s]) - a);
        if (d > 0) { adjust(e, s, 28, ADJ_ATT); adjust(e, o, -20, ADJ_SP_DEF); } else { adjust(e, s, -6, ADJ_ATT); adjust(e, o, 40, ADJ_SP_DEF); }
      }
      if (d <= 0) continue;
      if (rand(u8(goals[0]) + u8(goals[1])) > 3) continue;
      if (b20) blkB(s, 4);                                                                   // +0xf5c0 straffe
      blkB(s, 2);                                                                            // +0xf5be skud
      const ast = pickAssist(e, s, !!b28);
      const x = b28 ? rand(T[5][s]) : rand(T[2][s] * (b20 + 1));
      const xs = s16(x);
      if (xs + 165 <= rand(370) + 360 - d) continue;                                         // forbi
      blkB(s, 3);                                                                            // +0xf5bf på mål
      adjust(e, s, x, b28 ? ADJ_SP_SHOT : ADJ_SHOT);
      if (xs + 45 > rand((7 - 3 * b20) * T[3][o])) {
        // målet 0x6bfa5e–0x6bfc39
        const sc = pickShooter(e, s, !!b20); const q = MP(s, sc);
        q.goals = u8(q.goals + 1); q.rating = s16(q.rating + 475);
        for (const k of e.sides[o]) if (k.slot >= 0 && k.pos === 1) k.b0f = u8(k.b0f + 1);
        if (b20) { e.comment(0x1fcf, q, s); blkB(s, 5); q.pensTaken = u8(q.pensTaken + 1); q.penGoals = u8(q.penGoals + 1); }
        else {
          e.comment(0x1fcc, q, s);
          if (b28) { const r = rand(4); blkB(s, r <= 1 ? 7 : r === 2 ? 9 : 8); }
        }
        const aq = ast >= 0 ? MP(s, ast) : null;
        if (aq) { aq.penGoalsWon = u8(aq.penGoalsWon + 1); aq.rating = s16(aq.rating + 350); }
        blkB(o, 6);
        goals[s] = u8(goals[s] + 1); blk[s][1] = goals[s];
        e.onGoal?.(q, aq, !!b20);
        for (const k of e.sides[s]) if (k.slot >= 0) k.rating = s16(k.rating + 75);
        for (const k of e.sides[o]) if (k.slot >= 0) k.rating = s16(k.rating - 67);
        if (b15) { gg = 1; break; }
      } else {
        // redningen 0x6bfcaa
        adjust(e, o, 225, ADJ_SAVE);
        if (b20) {
          const k = pickShooter(e, s, true); const q = MP(s, k);
          e.comment(0x1fce, q, s); q.pensTaken = u8(q.pensTaken + 1); q.rating = s16(q.rating - 500);
        }
      }
    }
    // 0x6bfdfd: minuttet
    minute++;
    let end = false, pens = false;
    const agg = () => X.b4c + X.a44 !== X.h43 + X.b4b;
    if (b13) {
      if (minute <= 90) {
        X.h43 = u8(goals[0]); X.a44 = u8(goals[1]);
        if (X.b4b !== -1) { if (X.b4c + X.a44 === X.h43 + X.b4b) X.h43++; }
        else if (X.h43 === X.a44 && f38 & 0xa3) X.h43++;
      } else {
        X.h47 = u8(goals[0]); X.a48 = u8(goals[1]);
        if (X.b4b !== -1) { if (X.b4c + X.a44 === X.h43 + X.b4b) X.h47++; }
        else if (X.h43 === X.a44 && f38 & 0xa3) X.h47++;
      }
      end = true;
    } else if (gg) { X.h47 = u8(goals[0]); X.a48 = u8(goals[1]); end = true; }
    else if (minute === 45) { X.h45 = u8(goals[0]); X.a46 = u8(goals[1]); }
    else if (minute === 90) {
      X.h43 = u8(goals[0]); X.a44 = u8(goals[1]);
      const level = X.b4b !== -1 ? !agg() : X.h43 === X.a44;
      if (!level) end = true;
      else if (f38 & 0x80) b15 = 1;
      else if (f38 & 2) { /* forlænget */ }
      else {
        end = true;
        if (X.b4b !== -1) { if ((f38 & 4) || X.a44 === X.b4b || (f38 & 0x4000)) pens = !!(f38 & 0x21); }   // 0x6c001c
        else pens = !!(f38 & 0x21);                                                           // 0x6c0060
      }
    } else if (minute === 120) {
      X.h47 = u8(goals[0]); X.a48 = u8(goals[1]);
      end = true;
      if (X.b4b !== -1) {
        if (f38 & 0x4000) pens = X.h47 + X.b4b === X.b4c + X.a48 && X.a48 === X.b4b && !!(f38 & 0x21);
        else pens = X.h47 + X.b4b === X.b4c + X.a48 && !!(f38 & 0x21);
      } else pens = X.h47 === X.a48 && !!(f38 & 0x21);
    }
    if (pens) {                                                                              // 0x6c0116: straffesparkene (sammenligningerne bruges ikke)
      rand(5); rand(5); X.p49 = rand(5); rand(5); rand(5); X.p4a = rand(5);
      if (X.p49 === X.p4a) { if (rand(2) !== 0) X.p49++; else X.p4a++; }
      pensFn = true;
    }
    if (end) break;
  }
  // 0x6c0192: samlet stilling (kun til de følgende tests); 0x6c01cc: ligakampen uafgjort med under 5 mål – rand(4) = 0 giver favoritten et mål
  // på spilleren (ikke i stillingen, sic)
  if (fx.homeLeague && X.h43 + X.a44 < 5 && X.h43 === X.a44 && rand(4) === 0) {
    const s: 0 | 1 | null = fx.rep[0] > fx.rep[1] ? 0 : s16(fx.rep[0]) + 250 < s16(fx.rep[1]) ? 1 : null;
    if (s !== null) {
      blkB(s, 2);
      const q = MP(s, pickShooter(e, s, !!b20));
      q.goals = u8(q.goals + 1); q.rating = s16(q.rating + 475);
      for (const k of e.sides[1 - s]) if (k.slot >= 0 && k.pos === 1) k.b0f = u8(k.b0f + 1);
      e.comment(0x1fcc, q, s);
    }
  }
  // 0x6c036c: skaderne – ikke for −2-kampe; den sidste angribende side (sic) gennemgås to gange
  if (!fx.bg) {
    const s = lastSide;
    for (let rep = 0; rep < 2; rep++) for (const q of e.sides[s]) {
      if (q.slot < 0) continue;
      let c = s8(s8(e.rec(q, 0x2d)) * 2 + 5);
      if (q.condition < 6750) c = s8(c + 15); else if (q.condition < 8000) c = s8(c + 5);
      if (rand(c) < rand(400)) continue;
      const sev = rand(fx.tour ? 0x5b : 0x66);
      const t = rand(10);
      e.injure(t === 0 ? 1 : t <= 3 ? 3 : t <= 6 ? 4 : 5, sev, q, null);
    }
  }
  // 0x6c04c3: −2-kampenes 11 startere: omdømmet og kamp-CA'en; alle 20: den viste karakter +0x1b
  for (const s of [0, 1] as const) e.sides[s].forEach((q, k) => {
    if (fx.bg && k < 11) {
      const v = ftol(q.rating * (((s16(q.matchCA) - 40) * 50 - (s16(fx.rep[s]) * 1.6 - 6000)) * 2e-5 + 1));
      const w = s16(v);
      q.rating = w < 3500 ? 3500 : w > 12000 ? 12000 : w;
    }
    const r = s8(ftol((s16(q.rating) + 6000) * 0.0004 + 1.83));
    q.b1b = r > 10 ? 10 : r < 1 ? 1 : r;
  });
  // 0x6c05e5: afleveringerne (holdets +0xf5e2/+0xf5e4) under 10 → 20 og rand(6) + 12; ellers alle nået → − 1 − rand(3)
  for (const s of [0, 1]) {
    if (s16(blk[s][0x26]) < 10) { blk[s][0x26] = 20; blk[s][0x28] = rand(6) + 12; }
    else if (blk[s][0x26] === blk[s][0x28]) blk[s][0x28] = (blk[s][0x28] - 1 - rand(3)) & 0xffff;
  }
  return { minutes: minute, pens: pensFn ? [X.p49, X.p4a] : null };
}
