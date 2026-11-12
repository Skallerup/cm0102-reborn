// sub_70a910 (bolden mod modstandernes mål) og sub_70c040 (bolden mod eget mål) – MATCH_PLAYER-metoder, oversat instruktion for instruktion fra
// cm0102.exe 3.9.68 (2026-11-12). Kaldes, når en løs bold (sub_6cd770 0x6cd9e1–0x6cd9fd: rand(4) ≠ 0 og bolden i (4, −1/12)) eller en aflevering
// (sub_6fad40 0x6ffe61–0x6ffe8e: målet er (4, −1/12)) går mod mål; this = den, der sidst rørte bolden, argumentet F = afleveringens afstand
// (float, sub_6cc4e0) eller 1,0 fra den løse bold. Begge regner en "skudscore" (rand(1000) − rand(2000))·(fart + 1)/F, keeperværdien
// sub_700420(type −1) og resultatkoden som skuddet (0xf0-grænserne), og derefter mål / redning / forbi.
//
// Rammen: [esp+0x10]/[esp+0x11] egne/modstandernes mål (sub_6ce310 med målet talt med), [esp+0x12] flot redning (K > 375), [esp+0x14] god
// redning (K > 260), [esp+0x13] fumle, keeperens tilstand [esp+0x16] (70c040) / [esp+0x15] (70a910), udebanemålsflaget [esp+0x15] (70c040) /
// [esp+0x16] (70a910), [esp+0x17] turneringstypen % 10 == 3 (sub_4b0850).
//
// NB 70c040: er keeperen selv den, der sidst rørte bolden (edi == esi), kaldes sub_700420 ikke, og [esp+0x13]/[esp+0x16] er ikke sat (stakkens
// tilfældige indhold) – her 0.
import type { ShotEnv } from './takeShot';
import type { GP, Side } from './gridMatch';
import * as L from './loop';
import { storyApplies } from './story';
import { score6ce310 } from './shotParts/R2';

const w16 = (x: number) => (x << 16) >> 16;
const s8 = (x: number) => (x << 24) >> 24;
const other = (s: number): Side => (s === 0 ? 1 : 0);
const isKeeper = (q: GP | null): q is GP => !!q && q.pos === L.POS.keeper;              // [q+0x19e] ≠ 0 og sub_6c38c0(q) == 1
const minute = (E: ShotEnv) => Math.trunc(E.m.clock / 11);                               // +0x8ed0 · 0x2e8ba2e9 >> 1 (÷ 11)
/** de sidste minutter: 85 ≤ m < 90 eller m ≥ 115 (0x70caa3–0x70cab3) */
const lastMinutes = (mn: number) => (mn >= 0x55 && mn < 0x5a) || mn >= 0x73;
/** sub_6bb8d0(p, f) (R6 teamMood): p ×f, de andre på banen ×(f + 1)·0,5, bænken ×(f/6 + 0,83) */
const teamMood = (E: ShotEnv, p: GP, f: number) => {
  for (const q of E.gp) {
    if (q.side !== p.side) continue;
    if (q === p) E.scaleAg(q, f);
    else if (q.slot >= 0) E.scaleAg(q, Math.fround((f + 1.0) * 0.5));
    else E.scaleAg(q, Math.fround(f * 0.16666666666666666 + 0.83));
  }
};
/** sub_6bb950(s, f): sidens spillere ×f */
const agitateSide = (E: ShotEnv, s: number, f: number) => { for (const q of E.gp) if (q.side === s) E.scaleAg(q, f); };
const morale = (E: ShotEnv, q: GP, d: number) => { if (E.adjustMorale(q, d)) E.refreshSkills(q); };   // sub_7172d0 → sub_6eecb0(0)
/** keeperens historier efter en flot redning (0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5) – den første, der passer */
const keeperStories = (E: ShotEnv, k: GP) => {
  for (const id of [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5]) if (storyApplies(E, k, id)) { E.ev1(id, k, k.side, 0); return; }
};
/** sub_6d4250: golden goal i perioden (fixture+0x38 bit 0x80, ikke efter 45/90 min.) → engine+0x1a8 */
const goldenGoalPeriod = (E: ShotEnv) => E.m.periodEnd !== 0x1ef && E.m.periodEnd !== 0x3de && (E.fixtureFlags38 & 0x80) !== 0;

/** fælles start (0x70c040–0x70c237 / 0x70a910–0x70aafe): skudscoren, keeperen, keeperværdien og resultatkoden */
function start(E: ShotEnv, p: GP, F: number, keeperSide: Side, own: boolean) {
  const m = E.m;
  if (Math.fround(F) === 0) F = 1.0;                                                     // 0x70c046 fcomp 0,0 → 1,0
  const speed = s8(m.ballSpeed);                                                          // bl = engine+0x8eaa
  const a = E.rand(0x7d0), b = E.rand(0x3e8);                                             // 0x70c093 / 0x70c09f
  const ebp = w16(Math.trunc(((b - a) * (speed + 1)) / Math.fround(F)));                  // fild / fdiv float32 / ftol
  const k = E.keeper(keeperSide);                                                         // sub_6ce110 (0 → fejllog og afbryd 0x70c0db)
  const high = m.ballH > 3;                                                               // 0x70c14e engine+0x8ea9 > 3 → [esp+0x18] = 1
  let K = 0, state = 0, fumble = false;
  if (!own || k !== p) {                                                                  // 0x70c163 (kun 70c040 springer over, når keeperen selv)
    const kv = E.keeper700420(k, p.x, p.y, high, -1);                                     // 0x70c188 / 0x70aa51
    K = w16(kv.K); state = kv.state; fumble = kv.fumble;
  }
  let great = 0, good = 0;
  if (!fumble) { if (K > 0x177) great = 1; else if (K > 0x104) good = 1; }                // 0x70c19f / 0x70c1ac
  // resultatkoden (0x70c1b7–0x70c234; bl): 1 på mål, 2–4 langt forbi/over, 5–7, 8/9, 10/11, 12/13 (stolpen/overliggeren)
  let R: number;
  if (ebp > 0xf0) R = 1;
  else if (ebp < 0xa) R = high ? (E.rand(4) !== 0 ? 3 : 4) : 2;
  else {
    const gap = 0xf0 - ebp;
    if (gap > 0x32) R = high ? (E.rand(4) !== 0 ? 6 : 7) : 5;
    else if (gap > 0xa) R = 8 + (high ? 1 : 0);
    else if (gap > 6) R = 0xa + (high ? 1 : 0);
    else R = 0xc + (high ? 1 : 0);
  }
  return { ebp, k, K, state, fumble, great, good, R };
}

/** forholdet S/(S + K) i procent (0x70c3c9–0x70c3e4, heltal) */
const ratioOf = (ebp: number, K: number) => { const c = K + ebp; return c === 0 ? 0 : w16(Math.trunc((ebp * 100) / c)); };

/** keeperens karakter og moral ved en god/flot redning (0x70c3f0–0x70c4b3; identisk i 0x70ad45–0x70ae08) */
function saveRating(E: ShotEnv, k: GP | null, good: number, great: number): void {
  if (good) {
    if (isKeeper(k)) {
      k.rating = w16(k.rating + 0x15e);                                                   // 0x70c412
      if (E.rand(20 * s8(k.morale) + 0x32) === 0) morale(E, k, E.rand(4));                // 0x70c423 / 0x70c435
    }
    return;
  }
  if (great && isKeeper(k)) {
    k.rating = w16(k.rating + 0x258);                                                     // 0x70c47a
    if (E.rand(20 * (s8(k.morale) + 1)) === 0) morale(E, k, E.rand(7));                  // 0x70c488 / 0x70c496
  }
}

/** målet mod keeperen (0x70c510–0x70c597 / 0x70ae87–0x70af0e): +0xf, Determination/Pressure-rul, motivationen (+0x100) og karakteren */
function keeperConceded(E: ShotEnv, k: GP, p: GP, fumble: boolean): void {
  k.b0f = (k.b0f + 1) & 0xff;                                                             // 0x70c518
  if (E.rand(s8(E.staffByte(k, 0x58)) + 1) !== 0 && E.rand(s8(E.staffByte(k, 0x5a)) + 1) !== 0) {   // Determination / Pressure
    const c = k.b0f & 0xff;
    let al = E.rand(c * c);                                                               // 0x70c54d
    if (s8(al) < (p.b0f & 0xff)) al = p.b0f;                                              // 0x70c552: [esi+0xf] – den, der rørte bolden (sic)
    k.motivation = s8(k.motivation + al);                                                 // 0x70c573 (byte)
    E.refreshSkills(k);                                                                   // 0x70c57b sub_6eecb0(0)
  }
  k.rating = w16(k.rating - 500);                                                         // 0x70c580 (0xfe0c)
  if (fumble) k.rating = w16(k.rating - 600);                                             // 0x70c592 (0xfffffda8)
}

/** det annullerede mål (0x70c647–0x70c868): GOAL_DISALLOWED for evSide, dommeren går tilbage (sub_6bac40), derefter 0x20df/0x20d9 og
 *  holdets humør f (3,0 eller 1,45) og p's reaktion. me = den side, kommentaren 0x20df/0x20d9 nævner og sammenlignes med. */
function disallowed(E: ShotEnv, p: GP, gs: number, own: number, opp: number): void {
  E.evSide(0x20ed, gs, 0);                                                                // GOAL_DISALLOWED
  const bl = E.victimSide();                                                              // sub_6bba50 (før sub_6bac40)
  E.applyIncident();                                                                      // sub_6bac40
  let f: number;
  if (bl === p.side) {
    E.evSide(0x20df, p.side, 0);
    if (E.rand(s8(opp) - s8(own) + 3) > 0) E.evSide(0x20d9, p.side, 0);                  // 0x70c6be
    f = 3.0;                                                                              // 0x70c814 (0x40400000)
  } else {
    if ((own === opp || s8(own) - 1 === s8(opp)) && E.rand(0x28) === 0) E.evSide(0x20d9, p.side, 0);   // 0x70c6fe
    f = Math.fround(1.45);                                                                // 0x70c863 (0x3fb9999a)
  }
  teamMood(E, p, f);                                                                      // 0x70c86f sub_6bb8d0(p, f)
  E.reactToDecision(p);                                                                   // 0x70c878 sub_716e10(p, 0)
}

/** CLINCHING/WINNING/EQUALISER/PULLED_ONE_BACK m.fl. efter målet (0x70c8dd–0x70cc24 / 0x70b517–0x70b839).
 *  gs = den scorende side (kommentaren), hs = siden, hvis humør skrues op (sub_6bb950). own/opp = stillingen med målet (s10 er talt op). */
function scoreLine(E: ShotEnv, gs: number, hs: number, own: number, opp: number, awayWin: number, k3: number): void {
  const m = E.m;
  if (E.goldenGoal) { E.evSide(0x1fd2, gs, 0); return; }                                  // GOLDEN_GOAL (0x70c8eb)
  const mn = minute(E);
  if (!k3) {
    const diff = s8(own) - s8(opp);                                                       // ebp
    if (diff === 2 && ((mn >= 0x46 && m.periodEnd === 0x3de) || mn >= 0x6a)) {          // 0x70c937
      E.evSide(0x1fd0, gs, 0); agitateSide(E, hs, Math.fround(1.55)); return;            // 0x3fc66666
    }
    if ((diff === 1 || awayWin) && ((mn >= 0x50 && m.periodEnd === 0x3de) || mn >= 0x6e)) {   // 0x70c9a6
      E.evSide(0x1fd1, gs, 0); agitateSide(E, hs, Math.fround(1.45)); return;
    }
    if (own === opp && !awayWin && mn >= 0x46) {                                          // 0x70ca08: udligning
      // sub_6cbbb0 for begge sider (ingen tal): bl = den scorende sides antal på banen, hvis de er færre end modstanderne, ellers 0xff
      // (70c040: cmp bl, al med bl = sidens antal; 70a910: cmp al, bl med al = sidens antal – samme udfald; engine+4+side = svaret)
      const cG = E.countOnPitch(gs), cO = E.countOnPitch(other(gs));
      const bl = cG < cO ? cG : -1;
      let id: number, f: number;
      if (bl === -1) { if (lastMinutes(mn)) { id = 0x1fd8; f = 1.45; } else { id = 0x1fd6; f = 1.35; } }
      else if (lastMinutes(mn)) { id = 0x1fd9; f = 1.65; } else { id = 0x1fd7; f = 1.4; }
      agitateSide(E, hs, Math.fround(f));                                                 // 0x70cb01
      E.evSide(id, gs, s8(bl));                                                           // 0x70cb27 (extra = bl)
      return;
    }
    if (diff < 0 && diff > -3) {                                                          // 0x70cb31: reduceret
      const ok = mn >= 0x50 || (mn >= 0x46 && s8(own) === 1) || (mn >= 0x3c && s8(own) === 1 && 1 - s8(opp) === -2);
      if (ok) { E.evSide(lastMinutes(mn) ? 0x1fdb : 0x1fda, gs, 0); return; }
    }
  }
  // 0x70cbc4
  if (awayWin && mn < 0x50) { E.evSide(0x1fdc, gs, 0); agitateSide(E, hs, Math.fround(1.45)); return; }
  agitateSide(E, hs, Math.fround(1.25));                                                  // 0x70cc1b (0x3fa00000)
}

/** efter målet (0x70cc29–0x70ce27 / 0x70b83e–0x70ba35): fumle-kommentaren, holdets humør, stillingen talt, publikums-kommentarerne og afsparket */
function afterGoal(E: ShotEnv, p: GP, k: GP | null, own: boolean, gs: Side, moodF: number, s: { own: number; opp: number; away: number; fumble: boolean; state: number }) {
  const m = E.m;
  if (isKeeper(k) && (!own || k !== p) && s.fumble && s.state === 0) E.ev1(0x20d5, k, k.side, 0);   // 0x70cc73
  teamMood(E, p, Math.fround(moodF));                                                     // 0x70cc84 sub_6bb8d0(p, 1,7 / 0,1)
  m.goals[gs]++;                                                                          // 0x70ccb2: engine+0xf5bd + 54·side ++
  const r = E.rand(5) + 2;                                                                // 0x70ccb4
  let done = false;
  if (s8(s.own) - s8(s.opp) > r && E.rand(7) === 0 && E.clubKind8(gs)) { E.evSide(0x2117, gs, 0); done = true; }   // 0x70cd34
  if (!done && (s.own === s.opp || s8(s.own) - 1 === s8(s.opp) || s.away)) {             // 0x70cd41
    const a = E.rand(minute(E)), b = E.rand(0x78);                                        // 0x70cd7a / 0x70cd83
    if (a > b && E.clubKind8(gs)) E.evSide(0x2116, gs, 0);                                // 0x70cde6
  }
  E.kickoffAfterGoal(other(gs));                                                          // 0x70cdeb: +0x8eae = den, der fik målet, +0xf582 = 0, +0x8eb2 = 8, +0x1ca = 0
}

/** sub_70c040: bolden mod p's EGET mål (selvmål / redning af egen keeper). F = afstanden (float). */
export function intoOwnGoal(E: ShotEnv, p: GP, F: number): void {
  const m = E.m;
  const s = start(E, p, F, p.side, true);
  const k = s.k, gs = other(p.side);                                                      // den side, der får målet
  if (!k) return;                                                                         // (originalen afbryder med fejllog 0x70c0db)
  const sc = score6ce310(E, gs, 1);                                                       // 0x70c261 sub_6ce310(side == 0, …, 1)
  let own = sc.own, opp = sc.opp;
  const away = sc.away, k3 = sc.k3;
  if (s.R !== 1) {
    if (s.R === 0xc) E.ev1(0x1fca, p, gs, 0);                                            // 0x70c29b stolpen
    else if (s.R === 0xd) E.ev1(0x1fcb, p, gs, 0);                                       // 0x70c27a overliggeren
    if (s.R < 0xc || s.R > 0xd) return;                                                   // 0x70c2c5: forbi – kalderen sender bolden ud
    if (s.fumble && s.state === 0 && isKeeper(k)) E.ev1(0x20d5, k, k.side, 0);            // 0x70c31d
    E.ev1(0x211b, p, p.side, 0);                                                          // 0x70c342
    E.looseBall(m.ballX, m.ballY, 2, p.side, true, true, null);                           // 0x70c382 sub_6cd770(x, y, 2, side, 1, 1, 0)
    if (isKeeper(k)) k.busy = s8(k.busy + E.rand(3));                                     // 0x70c39f
    m.b1cd = 1;                                                                           // 0x70c3b8
    return;
  }
  const ratio = ratioOf(s.ebp, s.K);
  if (ratio <= 0x47) saveRating(E, k, s.good, s.great);
  if (ratio > 0x47) {
    // 0x70c4c3: MÅL
    if (E.victimSide() === -1) {
      if (goldenGoalPeriod(E)) m.paused = true;                                           // 0x70c4dc sub_6d4250 → engine+0x1a8 = 1
      if (isKeeper(k)) keeperConceded(E, k, p, s.fumble);
    }
    if (isKeeper(k) && k !== p && !s.fumble && E.rand(0x32) === 0 && s.state === 0) E.ev1(0x20d6, k, k.side, 0);   // 0x70c5bd
    E.ev1(0x1fff, p, gs, 0);                                                              // 0x70c618
    if (E.rand(3) !== 0 && E.victimSide() > -1) return disallowed(E, p, gs, own, opp);    // 0x70c622 / 0x70c63a
    const bl = E.victimSide();                                                            // 0x70c72b
    E.ev1(bl > -1 ? 0x20fa : 0x1fcd, p, p.side, 0);                                       // 0x70c75b
    if (E.victimSide() > -1) return disallowed(E, p, p.side, own, opp);                   // 0x70c766 (her side = p's)
    // 0x70c88a: målet står
    if (isKeeper(k) && k !== p && s.state !== 0) E.ev1(0x1fe1, k, k.side, s8(s.state));   // 0x70c8ce
    own = s8(own + 1);                                                                    // 0x70c8d7
    scoreLine(E, gs, p.side, own, opp, away, k3);
    E.onOwnGoal?.(p);
    afterGoal(E, p, k, true, gs, 1.7, { own, opp, away, fumble: s.fumble, state: s.state });
    return;
  }
  save(E, p, k, ratio, s.great, s.good, 0x211b, p.side);
}

/** redningerne (0x70ce31–0x70d422 / 0x70ba38–0x70c024): ratio > 61 parade (løs bold), > 51 til hjørne, ellers grebet.
 *  cmt = 0x211b (70c040) / 0x211c (70a910), kt = den side, keeperens parade rørte sidst (sub_6cd770's sidst rørt). */
function save(E: ShotEnv, p: GP, k: GP, ratio: number, great: number, good: number, cmt: number, kt: number): void {
  const m = E.m;
  if (ratio > 0x3d) {
    if (great) { E.ev1(0x2111, k, k.side, 0); keeperStories(E, k); }                      // 0x70ce63
    else E.ev1(good ? 0x210f : 0x1fe6, k, k.side, 0);                                     // 0x70cf97
    if (cmt === 0x211c) E.ev1(cmt, p, p.side, 0);                                         // 70a910: 0x70bbd7 før parade-bolden
    k.rating = w16(k.rating + 0x8c);                                                      // 0x70cfb0
    k.busy = s8(k.busy + E.rand(3) + 1);                                                  // 0x70cfb6
    E.looseBall(m.ballX, m.ballY, 0, kt, false, true, null);                              // 0x70cfea sub_6cd770(x, y, 0, side, 0, 1, 0)
    if (cmt === 0x211b) E.ev1(cmt, p, p.side, 0);                                         // 70c040: 0x70d00f efter
    m.b1cd = 1;                                                                           // 0x70d01d
    return;
  }
  if (ratio > 0x33) {
    if (great) { E.ev1(0x2111, k, k.side, 0); keeperStories(E, k); }                      // 0x70d05b
    else E.ev1(good ? 0x210f : 0x1fe4, k, k.side, 0);                                     // 0x70d194
    if (p.side === 1) m.ballY = -1; else if (p.side === 0) m.ballY = 0xc;                 // 0x70d1b4 / 0x70d1c7 (sic for 70c040: p's side)
    const cs = cmt === 0x211b ? other(p.side) : p.side;                                   // +0x8eae: 70c040 modstanderne (0x70d1e6), 70a910 p's (0x70bded)
    m.poss = cs; m.carrier = null;                                                        // +0x8eae, +0xf582 = 0
    E.ev1(cmt, p, p.side, 0);                                                             // 0x70d218 / 0x70be1f
    m.state = 3;                                                                          // +0x8eb2 = 3 (hjørne)
    E.evSide(0x1f75, cs, 0);                                                              // RESTART_CORNER
    E.corner(cs);                                                                         // limen: hjørnets statistik
    return;
  }
  k.busy = s8(k.busy + E.rand(3));                                                        // 0x70d261
  k.rating = w16(k.rating + 0xc8);                                                        // 0x70d269
  if (great) { E.ev1(0x2112, k, k.side, 0); keeperStories(E, k); }                        // 0x70d29a
  else E.ev1(good ? 0x2110 : 0x1fe5, k, k.side, 0);                                       // 0x70d3d3
  E.ev1(cmt, p, p.side, 0);                                                               // 0x70d40c
  E.takeBall(k);                                                                          // 0x70d413 sub_6f0630
}

/** sub_70a910: bolden mod modstandernes mål (p scorer / modstandernes keeper redder). F = afstanden (float). */
export function intoGoal(E: ShotEnv, p: GP, F: number): void {
  const m = E.m;
  const s = start(E, p, F, other(p.side), false);
  const k = s.k, gs = p.side;
  if (!k) return;
  if (E.victimSide() === -1) {                                                            // 0x70ab04
    p.shots = (p.shots + 1) & 0xff;                                                       // +0xa
    if (s.R === 1) p.shotsOnTarget = (p.shotsOnTarget + 1) & 0xff;                        // +0xb
  }
  const sc = score6ce310(E, p.side, 1);                                                   // 0x70ab42
  let own = sc.own;
  const opp = sc.opp, away = sc.away, k3 = sc.k3;
  if (s.R !== 1) {
    if (s.R >= 8 && s.R <= 0xd) E.ev1(0x1fc6 + (s.R - 8), p, p.side, 0);                 // springtabel 0x70c028: 0x1fc6–0x1fcb
    if (s.R < 0xc || s.R > 0xd) return;                                                   // 0x70ac1a
    if (s.fumble && s.state === 0 && isKeeper(k)) E.ev1(0x20d5, k, k.side, 0);            // 0x70ac72
    E.ev1(0x211c, p, p.side, 0);                                                          // 0x70ac97
    E.looseBall(m.ballX, m.ballY, 2, p.side, true, true, null);                           // 0x70acd7
    if (isKeeper(k)) k.busy = s8(k.busy + E.rand(3));                                     // 0x70acf4
    m.b1cd = 1;
    return;
  }
  const ratio = ratioOf(s.ebp, s.K);
  if (ratio <= 0x47) saveRating(E, k, s.good, s.great);
  if (ratio > 0x47) {
    // 0x70ae18: MÅL
    if (E.victimSide() === -1) {
      if (goldenGoalPeriod(E)) m.paused = true;                                           // 0x70ae31
      p.rating = w16(p.rating + 0x89);                                                    // 0x70ae4a
      for (let i = 0; i < 5; i++) p.goalWords[i] = w16(p.goalWords[i] + 1);              // +0x3d…+0x45
      p.goals = (p.goals + 1) & 0xff;                                                     // +0xc
      if (isKeeper(k)) keeperConceded(E, k, p, s.fumble);
    }
    // 0x70af12: keeperen fumlede ikke → rand(50)
    if (!s.fumble && E.rand(0x32) === 0 && s.state === 0 && isKeeper(k)) E.ev1(0x20d6, k, k.side, 0);   // 0x70af1a
    E.ev1(0x1fff, p, p.side, 0);                                                          // 0x70af8b
    if (E.rand(3) !== 0 && E.victimSide() > -1) return disallowed(E, p, p.side, own, opp);   // 0x70af90 (side = p's – 0x70afc4)
    const bl = E.victimSide();
    E.ev1(bl > -1 ? 0x2115 : 0x2114, p, p.side, 0);                                       // 0x70b0c8
    if (E.rand(3) !== 0 && E.victimSide() > -1) return disallowed(E, p, p.side, own, opp);   // 0x70b0cd (0x70b108: side = p's)
    if (s8(p.goals) === 3) E.ev1(p.debut ? 0x2011 : 0x1fd5, p, p.side, 0);               // 0x70b1cb hattrick
    if (E.victimSide() > -1) return disallowed(E, p, p.side, own, opp);                   // 0x70b204
    milestones(E, p);                                                                     // 0x70b2cc
    if (isKeeper(k) && s.state !== 0) E.ev1(0x1fe1, k, k.side, s8(s.state));             // 0x70b508
    own = s8(own + 1);                                                                    // 0x70b511
    scoreLine(E, gs, other(p.side), own, opp, away, k3);
    E.onGoal(p);
    afterGoal(E, p, k, false, gs, 0.1, { own, opp, away, fumble: s.fumble, state: s.state });
    return;
  }
  save(E, p, k, ratio, s.great, s.good, 0x211c, other(p.side));
}

/** debut-/jubilæumsmålene (0x70b2cc–0x70b4c1): words +0x3d klub, +0x3f landshold, +0x41, +0x43 karriere, +0x45 sæson (efter optællingen) */
function milestones(E: ShotEnv, p: GP): void {
  const g = p.goalWords.map(w16), [gClub, gNat, g41, g43, g45] = g;
  const ev = (id: number, x: number) => E.ev1(id, p, p.side, x);
  if (p.debut && s8(p.goals) === 1) { ev(storyApplies(E, p, 0x21b6) ? 0x21b6 : 0x2010, gClub); return; }   // 0x70b2d9
  if (gClub === 1) { ev(0x200f, 1); return; }
  if (gNat === 1) { ev(0x200b, 1); return; }
  if (g43 === 1) { ev(0x2012, 1); return; }
  if (gNat >= 0xa && gNat % 10 === 0) { ev(0x200b, gNat); return; }
  const hund = (v: number) => v === 0x32 || (v >= 0x64 && v % 100 === 0);
  if (hund(gClub)) { ev(0x200a, gClub); return; }
  if (g41 !== gClub && hund(g41)) { ev(0x200c, g41); return; }
  if (g43 !== g41 && g43 >= 0x64 && g43 % 100 === 0) { ev(0x200d, g43); return; }
  if (g45 === 1 || (g45 >= 5 && g45 % 5 === 0)) ev(0x200e, g45);
}
