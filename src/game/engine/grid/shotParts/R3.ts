/*
 * sub_702050 [0x704b0f, 0x705d52) – afbrænderens ekstra kommentarer (fork R3, oversat instruktion for instruktion 2026-11-11).
 * Indgang 0x704b0f (fra 0x704a3d/0x704a45: param 1 eller 2 efter afbrænderens kommentar). Springtabel 0x70a81c/0x70a828 på edi = R − 2
 * (ja = usigneret): R 2/3/4 (langt forbi/over, højt og forbi) → 0x704c5d, R 12/13 (stolpen/overliggeren) → 0x704b27, alt andet → 0x705d52.
 *
 * ENV (bruges her – limen skal give dem):
 *   E.m, E.rand, E.ev, E.ev1 (0x7002f0), E.evSide (bruges ikke)
 *   E.team(side): GP[]            – holdets 20 pladser engine+0x4796 + side·0x22d8 (trin 0x1be) i indeksrækkefølge (+0x2e); tomme pladser
 *                                    må udelades (de har +0x19 < 0 og springes over af alle scannere her)
 *   E.pressureCount(q): number    – sub_6bcbd0(q, &w, 0)'s returbyte: det vægtede antal modstandere, der presser q i hans felt
 *                                    (helpers.ts pressure(q.view, modstanderne i q's felt).count). Trækker ingen tal.
 *   E.looseBall(x, y, spread, lastTouch, keep, stir, player) – sub_6cd770 med alle syv argumenter (pass.ts looseBall; limens
 *                                    ballLoose sætter stir = true – her er stir = type ≠ 0x33)
 *   E.ballOut(lastTouch)          – sub_6cd490(lastTouch) (loop.ts ballOutOfPlay / pass.ts c.ballOut)
 *   storyApplies(E, q, id)        – sub_717470 (fork R8, ../story)
 *   L.manMarkTarget(E.m, q)       – sub_7160f0 (loop.ts, sikker)
 * FRAME (læses): a1 type, a4 param, a5 antal i a6, a6 listen + a6pos (68d1b0's markør +0xa; "[ecx+0xa] = [ecx+2]" = a6pos = 0),
 *   s10 R (resultatkoden, sat 0x703b4b–0x703be3), s11 skudlinjens resultat (0x703a89), s14 keeperen fumler (0x700420's ud-byte),
 *   s16 minuttet (byte, 0x702136), s18 "ophidselse" (eng+0x4786 ≥ 1680 ved indgangen, 0x70217b), s1b afstanden i yards (byte, 0x7021b1),
 *   s20 keeperens tilstand (0x700420), s25 = sub_6d59b0(p) (antal modstandere, der mandsopdækker skytten, 0x702116), s40 skyttens gamle
 *   w29 (word +0x29 før nulstillingen 0x703948), s64 afstanden i yards som dword (0x703e20 – T før det), ebx = keeperen (0x702311).
 *   Skrives: edi (= R − 2 ved indgangen), ebx (0x705182/0x704de0/0x7055fc/0x705bef: ebx = sub_6d5a10(p) – keeperen er så væk fra ebx!),
 *   ediP/ebpP (spillerne i edi/ebp: listens første/anden, sub_6d5a70's medspiller) – registrene edi/ebp bærer spillere her.
 * FIELDS (nye):
 *   GP.goals          +0xc  byte: mål i kampen (init 0)                                  – skrevet i målets gren (R5/R6)
 *   GP.assists        +0x3  byte: målgivende afleveringer (0x7022bb: [assist+3]++)       – prologen (R1)
 *   GP.penGoalsWon    +0x10 (findes)
 *   GP.motivation     +0x100 s8: motivationen (initMotivation(...).motivation, gridMatch.ts 0x6eb55c–0x6ebcb0)
 *   GP.professionalism staff(+0x69)+0x5b: Professionalism rå 1..20 (sh('professionalism'))
 *   GP.teamworkRaw    spillerpost(+0x6d)+0x3f: Teamwork rå 1..20 (sh('teamwork')) – postens alfabetiske rækkefølge (+0x3b højre fod, +0x3e Tackling,
 *                     +0x3f Teamwork; offsets.md "teamwork +0xe1 [rec 0x3f]")
 *   GP.w39            +0x39 word (skudscorens "kvalitet" fra sub_700bd0; ctor 0x6eb1a2 = 0)
 *   m.x4782           engine+0x4782 dword (gemmes i [esp+0x5c] ved indgangen, +0x113 ved assisteret skud 0x7022eb) – sammenlignes her med 1680,0
 *   m.b1cd            (findes)
 * LABELS IN: 0x704b0f. LABELS OUT: 0x705d52 (R 5–11 og ja), 0x706c91 (side 0 efter 0x705d15), 0x706c9e (side ∉ {0, 1}, kan ikke ske).
 */
import { go, label, type ShotEnv, type ShotFrame } from '../takeShot';
import type { GP } from '../gridMatch';
import * as L from '../loop';
import { storyApplies } from '../story';

/** 0x6c38c0(q) == 1 med [q+0x19e] ≠ 0 (spilleren er i kampen) */
const isGk = (q: GP | null): q is GP => !!q && q.pos === L.POS.keeper;
/** 0x68d1b0: listens næste (null = slut) */
const next = (f: ShotFrame): GP | null => (f.a6pos < f.a6.length ? f.a6[f.a6pos++] : null);
/** "[ecx+0xa] = [ecx+2]": markøren tilbage til hovedet */
const rewind = (f: ShotFrame) => { f.a6pos = 0; };
const opp = (p: GP) => (p.side === 0 ? 1 : 0);

/** sub_6d5a70(p) (sikker): den første på p's EGET hold (plads 0..19, +0x19 ≥ 0) i den angribende tredjedel (0x70df40: side 1 y < 3 /
 *  side 0 y > 8), centralt (0x70df20 = 0: x 2..6) og uden pres (sub_6bcbd0 = 0) – kan være skytten selv */
function unmarkedMate(E: ShotEnv, p: GP): GP | null {
  for (const q of E.team(p.side)) {
    if (q.slot < 0) continue;
    if (!(q.side === 1 ? q.y < 3 : q.side === 0 && q.y > 8)) continue;
    if (q.x < 2 || q.x > 6) continue;
    if (E.pressureCount(q) === 0) return q;
  }
  return null;
}
/** sub_6d5a10(p) (sikker): den første modstander (plads ≥ 0), hvis mandsopdækning (sub_7160f0) er p */
function markerOf(E: ShotEnv, p: GP): GP | null {
  for (const q of E.team(opp(p))) if (q.slot >= 0 && L.manMarkTarget(E.m, q) === p) return q;
  return null;
}
/** Historiekæden: den første af ids, som sub_717470 godkender for q, sendes via 0x7002f0(id, q, side, 0); true = sendt */
function chain(E: ShotEnv, q: GP | null, ids: number[], side: number): boolean {
  for (const id of ids) if (q && storyApplies(E, q, id)) { E.ev1(id, q, side, 0); return true; }
  return false;
}
/** "Kan ikke ryste sin markør af sig" (0x704dd4–0x704e8c / 0x705176–0x705226 / 0x7055f3–0x7056b5 / 0x705be8–0x705c88): fælles betingelse;
 *  rand(20) kun når de forrige holder, rand(motivation) kun ved motivation ≥ 1. needEdi = 0x704dea's "test edi" (kun i to-spiller-grenen). */
function shakeMarker(E: ShotEnv, f: ShotFrame, edi: GP | null, needEdi: boolean): boolean {
  const p = f.p, mk = markerOf(E, p);
  f.ebx = mk;                                                                       // ebx = sub_6d5a10(p)
  if (!mk) return false;
  if (needEdi && !edi) return false;
  if (f.a1 === 0x33 || f.a1 === 0x35) return false;
  if (f.a4 !== 1) return false;
  if (p.goals !== 0 || p.penGoalsWon !== 0 || p.assists !== 0) return false;        // +0xc, +0x10, +3
  if ((p.shots & 0xff) >= 5 || (p.shotsOnTarget & 0xff) >= 2) return false;        // +0xa/+0xb (jae)
  if (!((f.s16 as number) > E.rand(20) + 0x41)) return false;                       // minuttet > rand(20) + 65 (byte)
  if (!(p.rating < 0x1c52)) return false;                                           // skytten under 7250
  if (!(mk.rating > 0x1a5e)) return false;                                          // markøren over 6750
  const mot = p.motivation;                                                         // +0x100 (s8)
  if (mot >= 1 && E.rand(mot) !== 0) return false;
  return edi === mk;
}

/** 0x704b0f: springtabellen på edi = R − 2 */
label(0x704b0f, (E, f) => {
  const idx = (f.s10 as number) - 2;
  f.edi = idx;
  if (idx < 0 || idx > 0xb) return go(E, f, 0x705d52);                            // ja (usigneret)
  if (idx <= 2) return L_704c5d(E, f);                                              // R 2, 3, 4
  if (idx <= 9) return go(E, f, 0x705d52);                                          // R 5–11
  return L_704b27(E, f);                                                            // R 12, 13
});

/** 0x704b27: stolpen/overliggeren */
function L_704b27(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, m = E.m;
  if (f.s18) { if (!f.s11) E.ev1(0x2020, p, p.side, 0); }                          // 0x704b48 GREAT_GOAL_DENIED
  else if (!f.s11 && ((f.s1b as number) << 24 >> 24) >= 0x19 && ((p.w39 << 16) >> 16) < 0x32)
    E.ev1(0x1f9e, p, p.side, f.s64 as number);                                      // 0x704b75 SHOT_DISTANCE_UNLUCKY (extra = yards)
  const k = f.ebx;
  if (f.s14 && !f.s20 && isGk(k)) E.ev1(0x20d5, k, k.side, 0);                     // 0x704bc2 KEEPER_ROOTED_TO_HIS_SPOT
  // 0x704bcc–0x704bea: sidste berøring = skyttens side (s11 ≠ 0 → den anden – begge grene ens)
  const lt = !f.s11 ? p.side : opp(p);
  E.looseBall(m.ballX, m.ballY, 2, lt, true, f.a1 !== 0x33, null);                 // 0x704c16 sub_6cd770(x, y, 2, lt, 1, type ≠ 0x33, 0)
  if (isGk(k)) k.busy += E.rand(3);                                                 // 0x704c31 (byte +0x2b)
  m.b1cd = 1;                                                                       // 0x704c4c
}

/** 0x704c5d: langt forbi/over/højt og forbi */
function L_704c5d(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, m = E.m, type = f.a1;
  if (type === 0x33) return L_705cb3(E, f);
  if (f.s18 && !f.s11) {                                                            // 0x704c6d
    const q = unmarkedMate(E, p);                                                   // 0x704c8c sub_6d5a70
    f.ediP = q;
    if (q && p.teamworkRaw < 10 && p.professionalism < ((E.rand(6) + 0xa) << 24 >> 24) && q.professionalism < 0xa
        && E.rand(q.professionalism) === 0) {
      E.ev(0x21dd, p, p.side, q, q.side, 0);                                        // 0x704ce7 SELFISH_PLAYER
      return L_705cb3(E, f);
    }
    E.ev1(0x201e, p, p.side, 0);                                                    // 0x704d08 SOLO_GOAL_MISSED
    return L_705cb3(E, f);
  }
  // 0x704d17: engine+0x4782 > 1680,0 (fcomp/test ah,0x41: ≤ → 0x70540e)
  if (!(m.x4782 > 1680)) return L_70540e(E, f);
  const w29 = ((f.s40 as number) << 16) >> 16;
  if (w29 >= -135) {                                                                // 0x704d3c → 0x7053b7/0x7053bc
    if (type === 0x3a && f.a5 === 0) E.ev1(0x219a, p, p.side, 0);                  // 0x7053de SHOOTING_PLAYER_UNDER_NO_PRESSURE
    return L_7053e8(E, f);
  }
  if (type === 0x3a) return L_7053e8(E, f);                                         // 0x704d45 → 0x7053bc → jl
  const a5 = f.a5;
  if (E.rand(a5 * a5 + 4) === 0) return L_7053e8(E, f);                            // 0x704d5c
  if (a5 === 1) return L_705156(E, f);
  if (a5 === 2) {                                                                   // 0x704d97
    if (E.rand(2) === 0) { E.ev1(0x2132, p, p.side, 0); return L_7053e8(E, f); }   // 0x705135 SHOOTING_PLAYER_WAS_UNDER_PRESSURE
    rewind(f);
    const first = next(f), second = next(f);                                        // ebp, edi
    f.ebpP = first; f.ediP = second;
    if (!f.s25) E.ev(0x2155, first, opp(p), second, opp(p), 0);                     // 0x704eb4 …_FROM_TWO_PLAYERS
    else if (shakeMarker(E, f, second, true)) E.ev(0x21c6, p, p.side, second, second!.side, 0);   // 0x704ead UNABLE_TO_SHAKE_MARKER
    // 0x704edf: historierne på den første, så på den anden
    if (chain(E, first, [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5], opp(p))) return L_7053e8(E, f);
    if (chain(E, second, [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5], opp(p))) return L_7053e8(E, f);   // 0x705023 / 0x705384
    return L_7053e8(E, f);
  }
  E.ev1(0x2132, p, p.side, 0);                                                      // 0x704d8d (a5 0 eller ≥ 3)
  return L_7053e8(E, f);
}

/** 0x705156: én presser */
function L_705156(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  rewind(f);
  const q = next(f); f.ediP = q;                                                    // edi
  if (!f.s25) E.ev(0x2154, p, p.side, q, opp(p), 0);                                // 0x70526f …_FROM_ONE_PLAYER
  else if (shakeMarker(E, f, q, false)) E.ev(0x21c6, p, p.side, q, q!.side, 0);     // 0x705247
  // 0x705279: historierne på presseren (0x21b5 via 0x705384)
  chain(E, q, [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5], opp(p));
  return L_7053e8(E, f);
}

/** 0x7053e8: GREAT_GOAL_MISSED, så 0x705cb3 */
function L_7053e8(E: ShotEnv, f: ShotFrame): void {
  E.ev1(0x201f, f.p, f.p.side, 0);                                                  // 0x705404
  return L_705cb3(E, f);
}

/** 0x70540e: engine+0x4782 ≤ 1680 – efter skuddets kvalitet w39 */
function L_70540e(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, m = E.m, type = f.a1;
  const w39 = (p.w39 << 16) >> 16;
  const own = [0x219e, 0x21b1, 0x21b2, 0x21b7];
  if (w39 > 0x15e) {                                                                // > 350
    const g = p.goals & 0xff;
    if (g === 2 && Math.trunc(m.clock / 11) > 0x32) { E.ev1(0x1fdf, p, p.side, 2); return L_705cb3(E, f); }   // 0x705451 MISSED_HAT_TRICK_EASY_CHANCE
    E.ev1(0x1fde, p, p.side, g);                                                    // 0x705476 MISSED_EASY_CHANCE_NOT_CLOSE (extra = mål)
    chain(E, p, own, p.side);                                                       // 0x705480–0x705552
    return L_705cb3(E, f);
  }
  if (w39 > 0xfa) {                                                                 // 0x70555c: > 250
    E.ev1(0x1fde, p, p.side, p.goals & 0xff);                                       // 0x70557b
    if (chain(E, p, own, p.side)) return L_705cb3(E, f);                            // 0x705585–0x7055cf
    if (!f.s25) return L_705cb3(E, f);                                              // 0x7055d5
    rewind(f);
    const q = next(f); f.ediP = q;                                                  // 0x7055ee
    if (shakeMarker(E, f, q, false)) E.ev(0x21c6, p, p.side, q, q!.side, 0);        // 0x7056bb → 0x705ca2
    return L_705cb3(E, f);
  }
  // 0x7056d8: ≤ 250
  if (((f.s40 as number) << 16 >> 16) >= -135) return L_705cb3(E, f);
  if (type === 0x3a) return L_705cb3(E, f);
  const a5 = f.a5;
  if (E.rand(a5 * a5 + 4) === 0) return L_705cb3(E, f);                            // 0x7056ff
  if (a5 === 1) {                                                                   // 0x705a4d
    rewind(f);
    const q = next(f); f.ediP = q;
    E.ev(0x2154, p, p.side, q, opp(p), 0);                                          // 0x705a82
    if (chain(E, q, [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5], opp(p))) return L_705cb3(E, f);
    if (!f.s25) return L_705cb3(E, f);                                              // 0x705bdc
    if (shakeMarker(E, f, q, false)) E.ev(0x21c6, p, p.side, q, q!.side, 0);        // 0x705c8a
    return L_705cb3(E, f);
  }
  if (a5 === 2 && E.rand(2) !== 0) {                                                // 0x70573f
    rewind(f);
    const first = next(f), second = next(f);                                        // edi, ebx
    f.ediP = first; f.ebx = second;
    E.ev(0x2155, first, opp(p), second, opp(p), 0);                                 // 0x70578d
    if (!chain(E, first, [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5], opp(p)))
      chain(E, second, [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5], opp(p));  // 0x7058e7–0x705a1c
    return L_705cb3(E, f);
  }
  E.ev1(0x2132, p, p.side, 0);                                                      // 0x705719 (a5 0, ≥ 3, eller a5 2 med rand(2) = 0)
  return L_705cb3(E, f);
}

/** 0x705cb3: service-historierne og bolden ud */
function L_705cb3(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  if (storyApplies(E, p, 0x21a1)) E.ev1(0x21a1, p, p.side, 0);                     // 0x705cda GOOD_SERVICE_TO_PLAYER
  if (storyApplies(E, p, 0x21a2)) E.ev1(0x21a2, p, p.side, 0);                     // 0x705d0b POOR_SERVICE_TO_PLAYER
  if (p.side === 1) { E.m.ballY = -1; E.ballOut(p.side); return; }                  // 0x705d22 (byte 0xff) + sub_6cd490
  if (p.side !== 0) return go(E, f, 0x706c9e);
  return go(E, f, 0x706c91);
}
