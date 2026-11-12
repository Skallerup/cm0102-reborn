// sub_702050 MATCH_PLAYER::take_shot, afsnit R4: [0x705d52, 0x707520) – oversat instruktion for instruktion (2026-11-11).
// Afbrændernes ekstra kommentarer for R 5–11 (0x705d52: forbi/over/lige forbi/strejfer – springtabel 0x70a828 → 0x70a81c fra 0x704b20),
// genstarten efter en afbrænder (0x706c5d: bolden bag mållinjen → sub_6cd490), og PÅ MÅL fra 0x706cba: forholdet 100·S/(S + K), +2 for
// turneringstype 2/8, redningens karakter/moral til keeperen (videre til 0x708e84), målet 0x706dfd (hændelsen ryddes, tællere, karakterer,
// keeperens moral/motivation, assisten, KEEPER_DIVES_TO_NO_AVAIL, GOAL_SCORED, straffens/selvmålets/målets kommentar) til 0x707520.
//
// ENV (nye ShotEnv-medlemmer, som limen skal give):
//   ballOut(side: Side): void          sub_6cd490(this = engine, side) – bolden er ude; argumentet = skyttens side (sidst rørt). Kaldes efter at
//                                      0x706c6a/0x706c97 har sat boldens y til −1 (side 1) / 12 (side 0) (+0x8ea8). = loop.ts ballOut / gridMatch's
//                                      ball_out_of_play (0x6cd490) – må IKKE flytte bolden ind først.
//   compType: number                   engine+1 (turneringstypen, fixture+0x37 → +0x3a; 0x706cfc) – ctx.compType.
//   fixtureFlags38: number             fixture+0x38 (via engine+0x4792) – bit 0x80 = golden goal (sub_6d4250).
//   watched: boolean                   engine+0x8ebb ≠ 0 (kampen vises på skærmen; 0x707511).
//   notAhead(side: Side): boolean      sub_6d5950(side) (0x7072cc/0x7073a3): sub_6ce310(side, …, flag 0) på HOLDETS TÆLLERE engine+0xf5bd/+0xf5f3 (+ første
//                                      kamps mål fixture+0x4b/+0x4c i dobbeltkampe): 1, når egne < modstandernes; ved lige: 1 kun hvis 6ce310's
//                                      første ud-flag er sat og de to næste ikke er (dobbeltkampens regler); ellers 0. NB: tællerne opdateres først i
//                                      run_match_steps 0x6ba914 – her er de stillingen FØR dette mål (limen må ikke have talt målet med endnu).
//   onGoal(p: GP): void                kun limens bogføring uden tilfældige tal: holdets statistik (st.goals/onTarget er talt andetsteds), lytteren
//                                      on.goal(p, assist, pen). Kaldes ved 0x7071f2 (lige før GOAL_SCORED). Det, originalen gør med kampens mål
//                                      (engine+0xf5bd/+0xf5f3 = m.goals – omtælling i run_match_steps 0x6ba914), tillægstiden og afsparket ligger IKKE
//                                      i R4 og må ikke laves i onGoal (limen gør det efter takeShot, hvor originalen gør det).
//   (storyApplies/teamStoryApplies fra ../story – fork R8: storyApplies(E, q, id) = sub_717470(this = q, id) ≠ 0.)
//   adjustMorale (challenge.ts, = sub_7172d0) og actionSkills (challenge.ts, = sub_6eecb0(q, 0)) importeres direkte.
//
// FRAME (læses/skrives her; navne efter prologens esp):
//   a1 type, a2 S, a4 param, a5 antal i a6, a6 listen (a6pos = læsepositionen; 0x705e03 m.fl. sætter +0xa = +2, 68d1b0 = næste)
//   s10 R (resultatkoden, byte, 0x703be3)        s11 skudlinjens resultat (byte; 0 fri, 1 blokeret, 2 retningsændret)
//   s14 keeperen fumlede (byte)                   s17 sættes 1 ved målet uden retningsændring (0x706ef6)
//   s18 spændingsflaget (engine+0x4786 ≥ 1680 ved indgangen, 0x70217b)
//   s19 god redning (K > 260), s1a flot redning (K > 375) (bytes)
//   s1c: før 0x706cba højflaget (byte); FRA 0x706ce5/0x706d83 er dword'en [esp+0x1c] forholdet (float32) – s1c holder forholdet, og bytes
//        s1d/s1e/s1f er overskrevet (læs dem ikke efter 0x706cba).
//   s20 keeperens tilstand (byte, sub_700420)      s38 dword: K (word) før 0x706cba; 0x706cd7 overskriver med 100·S
//   s40 skyttens gamle +0x29 (word, 0x703948)     s68 dword: 1 = assisten er krediteret ved skuddet (0x7022f5), ellers 0
//   s6c dword: S + K (0x706cbe)                   s80 D (float32, skyttens afstand, 0x7020c4)
//   ebx = keeperen (GP | null), ebp/edi: ved 0x706cba skal f.ebp = word-fortegnet K ([esp+0x38], 0x703ffb) og f.edi = word-fortegnet S
//         (a2, 0x704004) – sat af R2.
//
// FIELDS (nye felter):
//   GP.goals        +0xc  byte  spillerens mål i kampen (0x706efb ++; læses af 0x7064bd/0x706b9a og målets karakterloft)
//   GP.penGoals      +0xe  byte  straffesparksmål (0x706ec0 ++)
//   GP.b0f           +0xf  byte  mål lukket ind (keeperen ++ ved 0x70701b; skyttens læses ved 0x707058) – sub_700420 læser keeperens
//   GP.penGoalsWon   +0x10 byte  (findes) assists: straffens vinder (0x706e44), retningsændret mål (0x706f80), afleveren (0x707107)
//   GP.assists       +0x3  byte  (som R1) afleverens assists (0x707146 ++; også 0x7022bb)
//   GP.goalWords     +0x3d/+0x3f/+0x41/+0x43/+0x45 words (5 tællere, ++ ved hvert mål uden retningsændring, 0x706edd; betydning ukendt)
//   GP.motivation    +0x100 byte  (keeperen += ved 0x707079)
//   GP.determination staff +0x58 (Determination, rå 1..20; via +0x69)
//   GP.pressure      staff +0x5a (findes)            GP.w39 +0x39 (skudscoren 700bd0's kvalitet)
//   m.x4782 / m.x4786  engine+0x4782 / +0x4786 dword (kampens spændings-tællere; 0x70724d: x4782 −= x4786; 0x707176: x4782 += 275)
//   m.passRecv / m.passGiver  engine+0xf5aa / +0xf5a6 (skuddets modtager af afleveringen / afleveren)
//   m.setPieceGoals[side][0|1|2]  engine+0xf5c3/+0xf5c4/+0xf5c5 + 54·side (mål efter ballEvent 3 / −1 og 7 / 6; 0x706e61–0x706e98)
//   m.inc (findes, +0x475a…), m.penaltyFor (+0x478a), m.paused (+0x1a8), m.lastToucher (+0xf5ae), m.ballY (+0x8ea8), m.ballEvent (+0x8eb1)
//
// LABELS IN:  0x705d52 (fra 0x704b20, R 5–11), 0x706c91 og 0x706c9e (fra 0x705d4d/0x705d47), 0x706cba (fra 0x7040b5: på mål).
// LABELS OUT: 0x708e84 (redningerne; s1c = forholdet), 0x707db2 (målet i straffesparkskonkurrencen, a4 3/4), 0x707c86, 0x707cc7 (R4 har selv
//   kaldt 0x707cbc's 7002f0), 0x707baa (registret ecx = engine), 0x707bcb (registret dl = s11), 0x707582, 0x707522 (f.eax = rand(3) fra 0x70751d).
import { go, label, type ShotEnv, type ShotFrame } from '../takeShot';
import type { GP, Side } from '../gridMatch';
import * as L from '../loop';
import { storyApplies } from '../story';
import { adjustMorale } from '../challenge';

const w16 = (x: number) => (x << 16) >> 16;
const s8 = (x: number) => (x << 24) >> 24;
const u8 = (x: number) => x & 0xff;
const b = (v: unknown) => (v as number) | 0;
/** ebx+0x19e ≠ 0 og sub_6c38c0(ebx) == 1: en rigtig keeper på banen */
const realKeeper = (q: GP | null): q is GP => !!q && q.pos === L.POS.keeper;
/** sub_6eecb0(q, 0): evnerne regnes om – limens refreshSkills (handlingsevnerne, loftene og rullene sub_6f44a0) */
const recompute = (E: ShotEnv, q: GP) => { E.refreshSkills(q); };
/** sub_7172d0(q, d) og ved ændring sub_6eecb0(q, 0) */
const morale = (E: ShotEnv, q: GP, d: number) => { if (adjustMorale(q, d, E.rand)) recompute(E, q); };
/** sub_6bba50: offerets side for den ventende hændelse, −1 uden (res +0x475a = 0 eller ingen synder +0x4761) */
const victimSide = (E: ShotEnv): number => { const i = E.m.inc; return i && i.res && i.d ? (i.d.side === 0 ? 1 : 0) : -1; };
/** 68d1b0: næste i a6-listen (null ved enden) */
const next = (f: ShotFrame): GP | null => (f.a6pos < f.a6.length ? f.a6[f.a6pos++] : null);
/** listens hoved: +0xa = +2 (0x705e03/0x705f73/…) */
const reset = (f: ShotFrame) => { f.a6pos = 0; };

/** Historiekæden, som originalen skriver ud gren for gren (0x705e41–0x705f64, 0x70669d–0x706730, 0x706a71–0x706b90, 0x7060fe–0x706479, …):
 *  for spilleren q prøves 0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5 i den rækkefølge (sub_717470); den første, der gælder, kommer i køen
 *  via 0x7002f0 med siden = modstanderne til skytten (sete af skyttens side). true = en kommentar blev lagt. */
const DEF_STORIES = [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5];
function defChain(E: ShotEnv, f: ShotFrame, q: GP): boolean {
  for (const id of DEF_STORIES) if (storyApplies(E, q, id)) { E.ev1(id, q, f.p.side === 0 ? 1 : 0, 0); return true; }
  return false;
}
/** Skyttens kæde (0x706bb4–0x706c4d, 0x7064eb–0x70653b): 0x219e, 0x21b1, 0x21b2, 0x21b7 – med skyttens egen side */
const SHOOTER_STORIES = [0x219e, 0x21b1, 0x21b2, 0x21b7];
function shooterChain(E: ShotEnv, f: ShotFrame): void {
  for (const id of SHOOTER_STORIES) if (storyApplies(E, f.p, id)) { E.ev1(id, f.p, f.p.side, 0); return; }
}
/** SHOOTING_PLAYER_WAS_UNDER_PRESSURE_FROM_TWO_PLAYERS (0x705df7–0x705e3c m.fl.): listen fra hovedet, q1 = første, q2 = anden;
 *  add_event(0x2155, q1, ¬side, q2, ¬side, 0); så historiekæden for q1 og derefter q2 */
function twoPlayers(E: ShotEnv, f: ShotFrame): void {
  reset(f); const q1 = next(f), q2 = next(f);
  const o = f.p.side === 0 ? 1 : 0;
  E.ev(0x2155, q1, o, q2, o, 0);
  if (q1 && defChain(E, f, q1)) return;
  if (q2) defChain(E, f, q2);
}
/** SHOOTING_PLAYER_WAS_UNDER_PRESSURE_FROM_ONE_PLAYER (0x705f69–0x705fa3 m.fl.): add_event(0x2154, skytten, side, q1, ¬side, 0) og q1's kæde */
function onePlayer(E: ShotEnv, f: ShotFrame): void {
  reset(f); const q1 = next(f);
  E.ev(0x2154, f.p, f.p.side, q1, f.p.side === 0 ? 1 : 0, 0);
  if (q1) defChain(E, f, q1);
}
/** Presset (fælles efter tærsklerne): a5 = 1 → én spiller; a5 = 2 og rand(2) ≠ 0 → to; ellers (a5 ∉ {1, 2} eller rand(2) = 0)
 *  SHOOTING_PLAYER_WAS_UNDER_PRESSURE (0x70677b / 0x70608b). Kaldes efter rand(a5² + 4) ≠ 0. */
function pressure(E: ShotEnv, f: ShotFrame): void {
  if (f.a5 === 1) { onePlayer(E, f); return; }                                          // 0x705dd8 / 0x706082 / 0x706604 / 0x706772
  if (f.a5 === 2 && E.rand(2) !== 0) { twoPlayers(E, f); return; }                       // 0x705de5 / 0x7060a6 / 0x706611 / 0x706796
  E.ev1(0x2132, f.p, f.p.side, 0);                                                       // 0x70677b / 0x70608b SHOOTING_PLAYER_WAS_UNDER_PRESSURE
}
/** tærsklen før presset: skyttens gamle +0x29 < −135 (word), ikke "sikker" type 0x3a, rand(a5² + 4) ≠ 0 */
function pressureGate(E: ShotEnv, f: ShotFrame): boolean {
  if (w16(b(f.s40)) >= -0x87) return false;                                              // cmp word [esp+0x40], 0xff79; jge
  if (f.a1 === 0x3a) return false;
  const a5 = s8(f.a5);
  return E.rand(a5 * a5 + 4) !== 0;                                                      // 0x705dc7 / 0x706071 / 0x7065f3 / 0x706761
}

// ---------------------------------------------------------------- 0x705d52: afbrænderne R 5–11
export const L_705d52 = label(0x705d52, (E, f) => {
  const p = f.p, dl = f.a1;
  if (dl === 0x33) return go(E, f, 0x706c5d);                                            // 0x705d5c: straffe → genstart
  if (b(f.s18) && !b(f.s11)) {                                                           // 0x705d62: spændende kamp, skuddet frit
    E.ev1(0x201e, p, p.side, 0);                                                         // 0x705d91 SOLO_GOAL_MISSED
    if (pressureGate(E, f)) pressure(E, f);                                              // 0x705d9b–0x706a2d
    return go(E, f, 0x706c5d);
  }
  // 0x70602d
  if (E.m.x4782 > 1680) {                                                                // fild [engine+0x4782]; fcomp 1680,0 (0x96d810); jne 0x706499
    if (pressureGate(E, f)) pressure(E, f);                                              // 0x70604a–0x706479
    E.ev1(0x201f, p, p.side, 0);                                                         // 0x70647e GREAT_GOAL_MISSED (altid)
    return go(E, f, 0x706c5d);
  }
  // 0x706499: kvaliteten +0x39
  const di = w16(p.w39);
  if ((di > 0x15e && dl !== 0x3a) || (di > 0xaf && dl === 0x3a)) {                      // 0x70649d–0x7064b7
    E.ev1(u8(p.goals) !== 2 ? 0x1fdd : 0x1fdf, p, p.side, u8(p.goals));                 // 0x7064bd MISSED_EASY_CHANCE_CLOSE / MISSED_HAT_TRICK_EASY_CHANCE
    shooterChain(E, f);                                                                  // 0x7064eb–0x70653b
    return go(E, f, 0x706c5d);
  }
  if (di > 0xfa || dl === 0x3a) {                                                        // 0x706540
    E.ev1(0x1fdd, p, p.side, u8(p.goals));                                              // 0x706b95 MISSED_EASY_CHANCE_CLOSE
    shooterChain(E, f);                                                                  // 0x706bb4–0x706c58
    return go(E, f, 0x706c5d);
  }
  const R = b(f.s10);
  if (b(f.s14) && !b(f.s20) && realKeeper(f.ebx) && R !== 5 && R !== 6 && R !== 7)       // 0x706554–0x7065a0
    E.ev1(0x20d5, f.ebx, f.ebx.side, 0);                                                 // 0x7065bd KEEPER_ROOTED_TO_HIS_SPOT
  if (pressureGate(E, f)) pressure(E, f);                                                // 0x7065c7–0x706a2d / 0x706735–0x706a2d
  return go(E, f, 0x706c5d);
});

// ---------------------------------------------------------------- 0x706c5d: bolden bag mållinjen → sub_6cd490
export const L_706c5d = label(0x706c5d, (E, f) => {
  if (f.p.side === 1) { E.m.ballY = -1; E.ballOut(f.p.side); return; }                    // 0x706c64: +0x8ea8 = 0xff
  if (f.p.side !== 0) return go(E, f, 0x706c9e);
  return go(E, f, 0x706c91);
});
export const L_706c91 = label(0x706c91, (E, f) => { E.m.ballY = 12; return go(E, f, 0x706c9e); }); // 0x706c97: +0x8ea8 = 0xc
export const L_706c9e = label(0x706c9e, (E, f) => { E.ballOut(f.p.side); });            // 0x706ca8 sub_6cd490(skyttens side); ret 0x18

// ---------------------------------------------------------------- 0x706cba: på mål
export const L_706cba = label(0x706cba, (E, f) => {
  const ebp = f.ebp + f.edi;                                                             // K + S
  f.s6c = ebp;
  if (ebp !== 0) {
    f.s38 = f.edi * 100;                                                                 // 0x706cd7
    let r = Math.fround((f.s38 as number) / ebp);                                                    // fild/fidiv/fstp dword [esp+0x1c]
    if (!(r > 68) && (E.compType === 2 || E.compType === 8)) r = Math.fround(r + 2);      // 0x706ceb–0x706d13 (0x96d80c = 68, 0x9689a8 = 2)
    f.s1c = r;
    if (r > 71) return goal(E, f);                                                       // 0x706d17–0x706d26 (0x96d808 = 71)
  } else f.s1c = 0;                                                                      // 0x706d83
  // 0x706d2c: redning – keeperens karakter og moral
  const k = f.ebx;
  if (b(f.s19) && realKeeper(k)) {
    k.rating = w16(k.rating + 0x15e);                                                    // 0x706d4a god redning +350
    if (E.rand(20 * k.morale + 50) === 0) morale(E, k, E.rand(4));                       // 0x706d5f / 0x706d6d
  } else if (b(f.s1a) && realKeeper(k)) {
    k.rating = w16(k.rating + 0x258);                                                    // 0x706dab flot redning +600
    if (E.rand(20 * (k.morale + 1)) === 0) morale(E, k, E.rand(7));                      // 0x706dbd / 0x706dcb
  }
  if (!((f.s1c as number) > 71)) return go(E, f, 0x708e84);                              // 0x706de8: altid her (forholdet ≤ 71)
  return goal(E, f);
});

/** 0x706dfd: MÅL */
function goal(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, m = E.m, a4 = f.a4;
  if (a4 === 1) {
    if (victimSide(E) > -1) m.inc = null;                                                // 0x706e12 sub_6bba50 / 0x706e21 sub_6bba10
    if (f.a1 === 0x33 && m.penaltyFor && m.penaltyFor !== p) m.penaltyFor.penGoalsWon++;  // 0x706e26–0x706e44
    const be = s8(m.ballEvent) + 1;                                                      // springtabel 0x70a834
    if (be === 4) m.setPieceGoals[p.side][0]++;                                          // 0x706e61 (+0xf5c3): ballEvent 3
    else if (be === 0 || be === 8) m.setPieceGoals[p.side][1]++;                         // 0x706e74 (+0xf5c4): ballEvent −1 / 7
    else if (be === 7) m.setPieceGoals[p.side][2]++;                                     // 0x706e87 (+0xf5c5): ballEvent 6
    if (m.periodEnd !== 0x1ef && m.periodEnd !== 0x3de && (E.fixtureFlags38 & 0x80)) m.paused = true; // sub_6d4250 → +0x1a8 = 1 (golden goal)
    if (f.a1 === 0x33) p.penGoals++;                                                     // 0x706ec0
  } else if (a4 === 3 || a4 === 4) return go(E, f, 0x707db2);                            // 0x706ec5
  // 0x706ed5
  if (!b(f.s11)) {
    for (let i = 0; i < 5; i++) p.goalWords[i] = w16(p.goalWords[i] + 1);                // 0x706edd–0x706eed
    p.goals = u8(p.goals + 1); f.s17 = 1;                                              // 0x706ef1–0x706efb
  }
  if (a4 === 1) {
    if (!b(f.s11)) {
      if (f.a1 === 0x33) p.rating = w16(p.rating + 0x2bc);                               // 0x706f1a +700
      else {
        p.rating = w16(p.rating + 0x28a);                                                // 0x706f22 +650
        if (E.rand(20 * (p.morale + 1)) === 0) morale(E, p, E.rand(8));                  // 0x706f34 / 0x706f42
      }
      const cap = (u8(p.goals) + 5) * 1000;                                             // 0x706f5f
      p.rating = w16(w16(p.rating) > cap ? p.rating : cap);
    } else {
      p.penGoalsWon = u8(p.penGoalsWon + 1);                                             // 0x706f7d (+0x10)
      p.rating = w16(p.rating + 0x113);                                                  // 0x706f85 +275
      if (E.rand(20 * p.morale + 50) === 0) morale(E, p, E.rand(4));                     // 0x706f9a / 0x706fa8
      const cap = Math.trunc((u8(p.penGoalsWon) * 0.5 + 4.5) * 1000);                    // 0x706fc5 (0x968f18, 0x96afa0, 0x968908)
      p.rating = w16(w16(p.rating) > w16(cap) ? p.rating : cap);
    }
    // 0x706ff8: keeperen
    const k = f.ebx;
    if (realKeeper(k)) {
      k.b0f = u8(k.b0f + 1);                                                             // 0x70701b
      if (E.rand(k.determination + 1) !== 0 && E.rand(k.pressure + 1) !== 0) {           // 0x707027 / 0x70703c
        const c = u8(k.b0f);
        let al = s8(E.rand(c * c));                                                      // 0x707053
        if (al < u8(p.b0f)) al = p.b0f;                                                  // 0x707069 (skyttens +0xf)
        k.motivation = s8(k.motivation + al);                                            // 0x707079 (+0x100)
        recompute(E, k);                                                                 // 0x707081
      }
      if (f.a1 !== 0x33) k.rating = w16(k.rating - 500);                                 // 0x707098
      if (b(f.s14)) {                                                                    // 0x70709c: fumlede
        let v = (Math.fround(f.s80 as number) + 0.25) * -600 * 0.5;                      // 0x9689e0, 0x96d800, 0x968968
        if (!(v > -1000)) v = -1000;                                                     // 0x96d7f8
        k.rating = w16(w16(k.rating) + Math.trunc(v));
      }
    }
    // 0x7070e1: assisten
    if (p === m.passRecv && m.passGiver) {
      const a = m.passGiver;
      a.penGoalsWon = u8(a.penGoalsWon + 1);                                             // 0x707107 (+0x10)
      a.rating = w16(a.rating + 0x113);                                                  // 0x707116
      if (!b(f.s68) && a.action !== 0x34 && a.action !== 0x37) {                         // 0x70711a–0x70713f
        a.assists = u8(a.assists + 1);                                                           // 0x707146
        a.rating = w16(a.rating + Math.trunc(w16(p.w29) / 3) + 0xe1);                    // 0x707159–0x70716c
        m.x4782 = (m.x4782 + 0x113) | 0;                                                 // 0x707176
      }
    }
  }
  // 0x70717c: keeperen kaster sig forgæves
  if (f.a1 !== 0x33 && f.a1 !== 0x3a && !b(f.s14) && E.rand(50) === 0 && !b(f.s20) && realKeeper(f.ebx))
    E.ev1(f.a1 === 0x1a ? 0x21d2 : 0x20d6, f.ebx, f.ebx.side, 0);                       // 0x7071ed GOALIE_CHIP_FAILED_SAVE / KEEPER_DIVES_TO_NO_AVAIL
  E.onGoal(p);                                                                           // limens bogføring (lytteren) – ingen tal
  E.ev1(0x1fff, p, p.side, 0);                                                           // 0x70720e GOAL_SCORED
  if (f.a1 === 0x33) {
    E.ev1(a4 === 1 ? 0x1fcf : 0x20f8, p, p.side, 0);                                     // 0x707239 SCORED_PENALTY / 0x707243 SCORED_ILLEGAL_PENALTY (0x707cbc)
    return go(E, f, 0x707cc7);
  }
  m.x4782 = (m.x4782 - m.x4786) | 0;                                                     // 0x70724d
  if (victimSide(E) > -1 || a4 === 6 || a4 === 5) return go(E, f, 0x707c86);             // 0x70726d–0x70728b
  const s18 = b(f.s18), s11 = b(f.s11);
  if (s18 && !s11) {
    E.ev1(0x201a, p, p.side, 0);                                                         // 0x7072b8 GREAT_SOLO_GOAL
    rushBack(E, f);                                                                      // 0x7072c2–0x707307
    return go(E, f, 0x707cc7);
  }
  const edi = m.x4786;                                                                   // 0x70730c
  if (edi > 0x578) {
    const x = m.x4782;
    E.ev1(x > 1680 ? 0x2013 : x > 1080 ? 0x2015 : 0x201b, p, p.side, 0);                 // 0x707344 / 0x707363 / 0x70736a (0x96d810, 0x96d7f0)
    morale(E, p, E.rand(8));                                                             // 0x70737a–0x707394
    rushBack(E, f);                                                                      // 0x707399–0x7073de
    return go(E, f, 0x707cc7);
  }
  if (s18 && s11) {                                                                      // 0x7073e3
    E.ev1(0x201c, p, p.side, 0);                                                         // 0x707400 GREAT_PLAY
    const t = m.lastToucher;                                                             // 0x70741b (+0xf5ae)
    E.ev1(a4 === 1 ? 0x1fcd : 0x20fa, t, t ? t.side : -1, 0);                            // 0x70742c GOAL_TWO / 0x707433 ILLEGAL_GOAL_TWO
    morale(E, p, E.rand(6));                                                             // 0x707443–0x707461
    return go(E, f, 0x707cc7);
  }
  const x = m.x4782;                                                                     // 0x70746b
  if (edi > 0x384) {
    E.ev1(x > 1080 ? 0x2016 : 0x2018, p, p.side, 0);                                     // 0x707497 GOOD_MOVE_GOOD_STRIKE / 0x7074a4 GOOD_STRIKE (via 0x70743e)
    morale(E, p, E.rand(6));                                                             // 0x707443
    return go(E, f, 0x707cc7);
  }
  if (x > 1680) {
    E.ev1(0x2019, p, p.side, 0);                                                         // 0x7074c9 GREAT_TEAM_GOAL
    morale(E, p, E.rand(4));                                                             // 0x7074d3 → 0x707445
    return go(E, f, 0x707cc7);
  }
  if (a4 !== 1) return go(E, f, 0x707bcb);                                               // 0x7074da (dl = s11)
  if (s11) return go(E, f, 0x707baa);                                                    // 0x7074e8 (ecx = engine)
  E.ev1(0x1fcc, p, p.side, 0);                                                           // 0x707501 GOAL_ONE
  if (!E.watched) return go(E, f, 0x707582);                                             // 0x70750b: engine+0x8ebb
  f.eax = E.rand(3);                                                                     // 0x70751b
  return go(E, f, 0x707522);
}

/** 0x7072c2/0x707399: RUSHES_BACK_TO_CENTER – holdet er ikke foran (sub_6d5950, før dette mål) og Determination > rand(10) + 14 */
function rushBack(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  if (!E.notAhead(p.side as Side)) return;
  if (s8(p.determination) > s8(E.rand(10) + 0xe)) E.ev1(0x21be, p, p.side, 0);           // 0x7072d9 / 0x7073b0 (cmp byte [staff+0x58], al; jle)
}
