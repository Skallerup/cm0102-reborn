// sub_702050 MATCH_PLAYER::take_shot, afsnit R2: [0x70362d, 0x704b0f) (FINDS_A_GAP/0x70353c ligger i prologens afsnit, takeShot.ts).
// Skudtypens kommentar, offside på en anden angriber, skudlinjen, resultatkoden, karaktererne/tællerne, langskuddets spillertur,
// keeperen ude af position, sub_6ce310, spændingstælleren engine+0x4786 og afbrænderne (kommentarer, historierne, omspark).
/*
ENV (ShotEnv-medlemmer, der bruges her):
  m, gp, rand                    – som takeShot.ts
  ev(id, p1, s1, p2, s2, x)      – sub_6d6f70 (0x703731, 0x70375d, 0x7037e4)
  ev1(id, p, s, x)               – 0x7002f0 (alle andre kommentarer her)
  evSide                         – (ikke her; 0x709672 i R7 bruger den)
  offsidePlayer(side, y, row, excl): GP | null
                                 – sub_6cfd70(side, skyttens y, målrækken (side 0 → 11, side 1 → 0), excl = skytten) 0x7038c8;
                                   porten: GRID_UNKNOWN.offsidePlayer(m, side, y, row, p, rand) (trækker selv sine tal)
  queueIncident(type, d, p, res, x, y, jC, jB)
                                 – sub_6bb9a0 0x703909: (−1, o, null, 8, o.x, o.y, −1, −1) (9. push = 0 = +0x4769) – som limens missedOffside
  shotLine(x, y, S, side0, kind, soft): number
                                 – sub_6cc540(x, y, max(S, 0), side == 0 ? 1 : 0, kind = s28 (5 hovedstød / 6 andet), soft) 0x703a7e;
                                   soft = 1 kun for frisparket 0x35 (0x703a36), ellers 0 (edi). Returnerer 0 fri, 1 blokeret, 2 retning
                                   ændret (3.9.68: aldrig 2). Porten: P.shotLine(p, S, soft === 1) – kind bruges ikke af portens version.
  ballOut(arg)                   – sub_6cd490(byte arg) 0x703db9, arg = (skyttens side == 0) ? 1 : 0
  playerTurn(q)                  – sub_7103e0(q) 0x703e8c (en spillers tur; trækker tal – porteret i loop.ts)
  adjustMorale(q, delta): boolean – sub_7172d0(delta) 0x703d52 / 0x703f29
  refreshSkills(q)               – sub_6eecb0(q, 0) 0x703d5f / 0x703f32 (handlingsevnerne igen)
  place(q, x, y)                 – sub_6f46b0(x, y) 0x704265 / 0x704ad6
  takeBall(q)                    – sub_6f0630 0x70426c / 0x704add
  takeShot(p, a1, a2, a3, a4, a5, a6) – sub_702050 rekursivt 0x704afd (omsparket)
  fixture: { firstLeg: [number, number] | null; flags: number; kind: number }
                                 – fixture (engine+0x4792): +0x4b/+0x4c første kamps mål (0xff = ingen første kamp → null), word +0x38
                                   (flag 4 / 0x4000), word +0x30 (sub_4b0850: < 1000 → %10; == 3 → s4f) – til sub_6ce310 0x703ff2
  storyApplies (importeret fra '../story', fork R8) – sub_717470(q, id)
FRAME (felter; sat i prologen 0x702050–0x70362d med mindre andet står):
  s78  udfordreren (edi ved 0x70362d; prologen 0x7024ad), null ad 0x70354d-vejen – hovedstødets kommentar kræver ingen (0x70366c)
  s10  foden fra sub_713e90 (0x702227; 0 venstre, 1 højre, 2 ingen) → her 0xff (0x70364d) og derefter resultatkoden R (0x703b4b–0x703be3)
  s11  skudlinjens resultat (prologen 0; 0x703a89)
  s12/s13/s26/s4e/s4f  sub_6ce310's ud-værdier (0x703ff2, sat her): egne/modstandernes mål (+ første kamp), "udebanemål"-flag,
                    første kamp findes, fixture+0x30 %10 == 3
  s14  keeperens fumle (0x700420's ud)   s1a/s19 flot/god redning (0x70242d/0x70243a; læses ikke her)
  s1b  yards (byte, 0x7021b1)   s1c  høj (0x7023ad–0x7023eb); dword s1c..s1f = 0, så 0x45b0 i langskudsløkken (0x703e3d/0x703ea9)
  s16  minuttet   s18  engine+0x4786 ≥ 1680 (0x70217b)   s20 keeperens tilstand (0x700420's ud; 0 ved 0x703762/0x7037bf)
  s27  boldhøjden gemt (0x703e5a)   s28  extra 6 (5 for hovedstød 0x7021c4)   s34  det oprindelige S (0x7020d4)
  s38  K (0x70241f; 0 ved 0x703fb7; 0x70402b: spændingsleddet som dword)   s40  skyttens gamle +0x29 (0x703948)
  s4d  udfordrerens forsinkelse (6c87e0-ud, 0x70353c)   s50/s54 skyttens x/y (0x7020ba/0x702097)   s58 +0x39 gemt (0x7020a4)
  s5c/s60  engine+0x4782/+0x4786 ved indgangen (0x702079/0x702073)   s64  T 240/120 (0x7020cc/0x7021cd) → yards (0x703e20)
  s6c  løkketæller (0x703e45)
  ebp  a2 (0x703883) → K som word (0x703ffb)   edi  R − 2 ved 0x704b0f (0x704383/0x7044fd)   stk  push'ede værdier ved hop (se LABELS OUT)
FIELDS (nye):
  GP.w39       +0x39 word: skudkvaliteten (sat af sub_700bd0 0x70139a–0x701b96; 0 i ctor 0x6eb1a2; 0x703b18 = 0; gemt/genskabt s58)
  GP.pensTaken +0xd byte: straffespark taget (0x703c19)
  GP.offsidesCaught +0x13 byte: fanget offside (0x7039c6)
  m.x4786     engine+0x4786 dword: spændingen (0x7040af += …; nulstilles/genskabes ved omspark 0x704a64/0x7041f3; prologen s60/s18)
  m.x4782    engine+0x4782 dword (0x7022eb += 0x113 i prologen; genskabes ved omspark)
  m.b1a9: [number, number]  engine+0x1a9+side: skud i straffesparkskonkurrencen (param 3/4) (0x703d80)
  (eksisterende: shots +0xa, shotsOnTarget +0xb, rating +0x35, busy +0x2b, w29 +0x29, momentum +0x19c, action +0x198, pressure staff+0x5a,
   m.lastToucher +0xf5ae, m.carrier +0xf582, m.poss +0x8eae, m.state +0x8eb2, m.ballX/Y/H +0x8ea7/8/9, m.firstTime +0x1a7, m.b1cd +0x1cd,
   m.stats[side].offsides = +0xf5ca+54·side, m.goals = +0xf5bd/+0xf5f3)
LABELS IN:  0x70362d, 0x703634, 0x704a57, 0x704aca (edi = 0 forventet), 0x704ae4 (to nuller på stakken), 0x704b02 (ret)
LABELS OUT: 0x704b0f (f.edi = R − 2), 0x706cba (på mål), 0x709672 (f.push = [0]: edi = 0 push'et = extra til 70a860 0x709682),
            0x7092a5 (f.push = [0, 0]: a6, a5 til det rekursive kald)
*/
import { go, label, type ShotEnv, type ShotFrame } from '../takeShot';
import type { GP, Side } from '../gridMatch';
import * as L from '../loop';
import { storyApplies } from '../story';

interface F extends ShotFrame {
  s78: GP | null;
  s10: number; s11: number; s12: number; s13: number; s14: number; s1b: number; s1c: number; s1d: number; s1e: number; s1f: number;
  s20: number; s26: number; s27: number; s28: number; s34: number; s38: number; s40: number; s4d: number; s4e: number; s4f: number;
  s50: number; s54: number; s58: number; s5c: number; s60: number; s64: number; s6c: number;
  stk: number[];
}
// felter, som limen tilføjer GP/GridMatchState (se FIELDS)
type GPx = GP & { w39: number; pensTaken: number; offsidesCaught: number };
interface Mx { x4786: number; x4782: number; b1a9: [number, number] }
interface Ex {
  offsidePlayer(side: Side, y: number, row: number, excl: GP): GP | null;
  queueIncident(type: number, d: GP, p: GP | null, res: number, x: number, y: number, jC: number, jB: number): void;
  shotLine(x: number, y: number, S: number, side0: number, kind: number, soft: number): number;
  ballOut(arg: number): void;
  playerTurn(q: GP): void;
  adjustMorale(q: GP, delta: number): boolean;
  refreshSkills(q: GP): void;
  place(q: GP, x: number, y: number): void;
  takeBall(q: GP): void;
  takeShot(p: GP, a1: number, a2: number, a3: number, a4: number, a5: number, a6: (GP | null)[]): void;
  fixture: { firstLeg: [number, number] | null; flags: number; kind: number };
}
const X = (E: ShotEnv) => E as ShotEnv & Ex;
const M = (E: ShotEnv) => E.m as unknown as Mx;
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const isGK = (q: GP | null) => !!q && q.pos === L.POS.keeper;                         // [q+0x19e] ≠ 0 og sub_6c38c0(q) == 1
const oth = (s: Side) => (s === 0 ? 1 : 0);
/** imul 0xae147ae1; sar edx, 4; + fortegnsbit (0x703d3e–0x703d4d): trunc(−x/50) */
const magic50 = (x: number) => { let e = Math.floor((x * -1374389535) / 4294967296) >> 4; e += e < 0 ? 1 : 0; return e; };

// ------------------------------------------------------------------ 0x70362d–0x703883: skudtypens kommentar
const L_703634 = (E: ShotEnv, f: F) => {
  const p = f.p;
  if (f.s10 === p.strongFoot) { if (E.rand(10) !== 0) f.s10 = 0xff; }                  // 0x70363b: den foretrukne fod nævnes kun 1/10
  const t = f.a1;
  if (t === 3) {                                                                          // 0x703659 hovedstød
    if (f.a5 === 0 && !f.s78) { E.ev1(s16(f.a3), p, p.side, 7); return L_703883(E, f); } // 0x703693 (extra 7)
    return L_7037ee(E, f);
  }
  if (t !== 0x1b && t !== 0x1a) return L_7037ee(E, f);
  const k = f.ebx;                                                                        // 0x7036a4 lob/chip
  if (!isGK(k)) { E.ev1(s16(f.a3), p, p.side, 0); return L_703883(E, f); }               // 0x7036d9
  if (f.s20 === 4 && L.dist(p.x, p.y, k!.x, k!.y) > 1.5) {                                // 0x7036de sub_6f09b0(keeper.x, keeper.y) > 1,5 (0x968940)
    E.ev(0x1fe0, p, p.side, k, oth(p.side), 0);                                           // 0x703731 SPOTTED_KEEPER_OFF_HIS_LINE
    E.ev(s16(f.a3), p, p.side, k, k!.side, 0);                                            // 0x70375d
    f.s20 = 0; return L_703883(E, f);
  }
  // 0x70376c: keeper-varianten (springtabel 0x70a708 → 0x70a6ec)
  const v = s16(f.a3);
  const alt: Record<number, number> = { 0x1f89: 0x1f8a, 0x1f8b: 0x1f8c, 0x1fa3: 0x1fa4, 0x1fa5: 0x1fa6, 0x1fb1: 0x1fb2, 0x1fb3: 0x1fb4 };
  if (alt[v] !== undefined) f.a3 = alt[v];                                                // 0x7037b8
  f.s20 = 0;                                                                              // 0x7037bf
  E.ev(s16(f.a3), p, p.side, k, k!.side, 0);                                              // 0x7037e4
  return L_703883(E, f);
};
label(0x703634, (E, f) => L_703634(E, f as F));
label(0x70362d, (E, f) => L_703634(E, f as F));                                           // 0x70362d: mov al, type → 0x703634
/** 0x7037ee: venstre/højre fod (springtabel 0x70a74c → 0x70a734): +1 for højre */
const L_7037ee = (E: ShotEnv, f: F) => {
  const p = f.p, c = f.s10;
  if (c !== 0xff) {
    const v = s16(f.a3), r = c !== 0 ? 1 : 0;
    const base: Record<number, number> = { 0x1f86: 0x1f87, 0x1f8e: 0x1f8f, 0x1f93: 0x1f94, 0x1f96: 0x1f97, 0x1f99: 0x1f9a };
    if (base[v] !== undefined) f.a3 = base[v] + r;                                        // 0x70385f
  }
  E.ev1(s16(f.a3), p, p.side, 0);                                                         // 0x70387e
  return L_703883(E, f);
};

// ------------------------------------------------------------------ 0x703883–0x703b25: handlingen, offside, skudlinjen, afbøjningen
const L_703883 = (E: ShotEnv, f: F): void => {
  const p = f.p as GPx, m = E.m, X_ = X(E);
  f.ebp = f.a2;                                                                           // 0x703883
  p.action = 0x6d;                                                                        // 0x70388a
  const t = f.a1;
  if (t !== 0x33 && t !== 0x35 && f.a4 === 1) {                                           // 0x7038a2
    const o = X_.offsidePlayer(p.side, p.y, p.side === 0 ? 0xb : 0, p);                   // 0x7038c8
    if (o) {
      if (E.rand(500) === 0) {                                                            // 0x7038d8: 0 → offside dømt med det samme
        E.ev1(0x1f78, o, p.side, 0);                                                      // 0x703998 RESTART_OFFSIDE (p1 = den offside, side = skyttens)
        m.stats[p.side].offsides++;                                                       // 0x7039bf +0xf5ca+54·side
        (o as GPx).offsidesCaught++;                                                      // 0x7039c6 +0x13
        m.ballX = o.x; m.ballY = o.y;                                                     // 0x7039d5/0x7039e8
        m.state = 7;                                                                      // 0x7039f4 indirekte frispark
        m.poss = oth(p.side) as Side;                                                     // 0x703a09
        m.carrier = null;                                                                 // 0x703a17
        return;                                                                           // 0x703a28
      }
      X_.queueIncident(-1, o, null, 8, o.x, o.y, -1, -1);                                 // 0x703909: overset → fordelen (kode 8)
      f.a4 = 2;                                                                           // 0x70390e
    }
  }
  m.poss = -1;                                                                            // 0x70391e
  m.firstTime = 0;                                                                        // 0x70392b
  f.s40 = p.w29; p.w29 = 0; p.momentum = 0;                                               // 0x703932–0x703948
  if (!(t === 0x33 || f.a4 === 4)) {                                                      // 0x70394d / 0x703955
    const S = s16(f.ebp);
    const r = t === 0x35
      ? X_.shotLine(p.x, p.y, S > 0 ? S : 0, p.side === 0 ? 1 : 0, f.s28, 1)             // 0x70396b–0x703a4c (S ≤ 0 → 0)
      : X_.shotLine(p.x, p.y, S < 0 ? 0 : S, p.side === 0 ? 1 : 0, f.s28, 0);            // 0x703a4e–0x703a77
    f.s11 = r & 0xff;                                                                     // 0x703a89
    if (m.state !== 0) return;                                                            // 0x703a95 → 0x704b02
  }
  if (m.carrier === p) m.carrier = null;                                                  // 0x703aa1
  if (f.s11 === 2) {                                                                      // 0x703aaf: retningen ændret (3.9.68: aldrig)
    const lt = m.lastToucher as GP;
    if (f.s28 === 5) E.ev1(0x1fd4, lt, lt.side, 5);                                       // 0x703ad5 RICHOCHET_SHOT_GOAL_HEADER
    else E.ev1(0x1fd3, lt, lt.side, s8(f.s28));                                           // 0x703aeb RICHOCHET_SHOT_GOAL
    const r2 = E.rand(2000), r1 = E.rand(1000);                                           // 0x703afb / 0x703b05
    f.ebp = f.ebp + r1 - r2;                                                              // 0x703b16
    p.w39 = 0;                                                                            // 0x703b18
    f.a2 = f.ebp;                                                                         // 0x703b1e
  }
  return L_703b25(E, f);
};

// ------------------------------------------------------------------ 0x703b25: resultatkoden R (s10)
const L_703b25 = (E: ShotEnv, f: F): void => {
  const S = s16(f.ebp), T = s16(f.s64), hi = f.s1c !== 0 ? 1 : 0;
  let R: number;
  if (S > T) R = E.rand(S) < 10 ? 0xe + hi : 1;                                           // 0x703b2e
  else if (S < 10) R = hi ? (E.rand(4) !== 0 ? 3 : 4) : 2;                                // 0x703b5e
  else {
    const gap = T - S;                                                                    // 0x703b8c
    if (gap > 0x3c) R = hi ? (E.rand(4) !== 0 ? 6 : 7) : 5;
    else if (gap > 0x19) R = 8 + hi;
    else if (gap > 0xe) R = 0xa + hi;
    else R = 0xc + hi;
  }
  f.s10 = R;
  return L_703beb(E, f);
};

// ------------------------------------------------------------------ 0x703beb–0x703d82: tællere og karakter
const L_703beb = (E: ShotEnv, f: F): void => {
  const p = f.p as GPx, m = E.m, R = f.s10, t = f.a1;
  const onT = (r: number) => r === 1 || r === 0xe || r === 0xf;
  if (f.a4 === 3 || f.a4 === 4) M(E).b1a9[p.side]++;                                     // 0x703d66 engine+0x1a9+side
  else if (f.a4 === 1) {                                                                  // 0x703c02
    let count = true;
    if (t === 0x33) p.pensTaken++;                                                        // 0x703c14 +0xd
    else {
      const lt = m.lastToucher;                                                           // 0x703c2d +0xf5ae
      if (lt && !(lt.x === 4 && (lt.y === 0 || lt.y === 0xb))) count = false;             // 0x703c37–0x703c50
    }
    if (count) {
      p.shots++;                                                                          // 0x703c5b +0xa
      p.rating += t !== 0x33 ? -150 : -1000;                                              // 0x703c75
      if (onT(R)) {
        p.shotsOnTarget++;                                                                // 0x703c90 +0xb
        const v = t !== 0x33 ? 220 : 400;                                                 // 0x703c9a / 0x703cb7
        p.rating += R === 0xe || R === 0xf ? Math.trunc(v * 0.5) : v;                     // 0x703cde / 0x703cb1
      }
    }
    if (!onT(R)) {                                                                        // 0x703ce6: afbrænder
      let di = s16(s16(p.w39 - s16(f.ebp)) + 0xf0);                                       // 0x703d08
      if (di < 0) di = 0; else if (di > 0xc8) di = 0xc8;
      p.rating -= di;                                                                     // 0x703d23
      if (E.rand(p.pressure) === 0) {                                                     // 0x703d2f rand(staff +0x5a)
        if (X(E).adjustMorale(p, magic50(di))) X(E).refreshSkills(p);                     // 0x703d52 / 0x703d5f
      }
    }
  }
  // 0x703d82
  if (f.s11 === 1) {                                                                      // blokeret
    const bx = s8(m.ballX), by = s8(m.ballY);
    const out = bx < 0 || (bx >= 9 && by < 0) || by >= 0xc;                               // 0x703d8f–0x703dae
    if (out) X(E).ballOut(p.side === 0 ? 1 : 0);                                          // 0x703db9
    m.b1cd = 1;                                                                           // 0x703dc7
    return;
  }
  if (p.side === 1) { m.ballX = 4; m.ballY = 0; }                                         // 0x703de5
  else if (p.side === 0) { m.ballX = 4; m.ballY = 0xb; }                                  // 0x703e05
  // 0x703e19: langskud – hver markspiller uden handling får en tur (sub_7103e0) med boldhøjden 5
  const yd = s8(f.s1b);
  f.s64 = yd;                                                                             // 0x703e20
  if (yd > E.rand(15) + 0x19) {                                                           // 0x703e24
    f.s1c = 0; f.s1d = 0; f.s1e = 0; f.s1f = 0;                                           // 0x703e3d (dword)
    f.s6c = 2;
    f.s27 = m.ballH; m.ballH = 5;                                                         // 0x703e4d–0x703e5a
    for (const side of [0, 1] as Side[]) {                                                // engine+0x4796 (+0x22d8 for side 1), 20 poster
      for (const q of E.gp) {
        if (q.side !== side) continue;
        if (q.slot >= 0 && q.slot <= 10 && q.busy === 0 && q !== p) X(E).playerTurn(q);   // 0x703e74–0x703e8c
      }
    }
    f.s1c = 0xb0; f.s1d = 0x45; f.s6c = 0;                                                // dword s1c = 2·0x22d8 efter løkken (0x703ea9)
    m.ballH = f.s27;                                                                      // 0x703ec4
    f.ebp = f.a2;                                                                         // 0x703ebd
  }
  return L_703eca(E, f);
};

// ------------------------------------------------------------------ 0x703eca–0x7040b5: keeperen ude af position, sub_6ce310, spændingen
const L_703eca = (E: ShotEnv, f: F): void => {
  const p = f.p as GPx, m = E.m, k = f.ebx;
  if (f.s20 !== 0) {
    if (f.a4 === 1 && isGK(k)) {                                                          // 0x703ed6
      k!.rating += -800;                                                                  // 0x703ef6 (0xfce0)
      if (E.rand(20 * k!.pressure + 10) === 0) X(E).adjustMorale(k!, -E.rand(3));          // 0x703f0e / 0x703f1c (svaret bruges ikke)
      X(E).refreshSkills(k!);                                                             // 0x703f32
    }
    if (p.side === 0 && p.x > k!.x) f.a2 = E.rand(400) + f.ebp + 0xbe;                     // 0x703f4e
    else if (p.side === 1 && p.x < k!.x) f.a2 = E.rand(400) + f.ebp + 0xbe;                // 0x703f7f
    else { f.ebp = f.ebp + 0xbe; f.a2 = f.ebp; }                                          // 0x703f9c
  }
  if (m.lastToucher === k) f.s38 = 0;                                                     // 0x703faf
  if (f.a1 === 0x39) p.busy = s8(p.busy + 2);                                             // 0x703fc9
  ce310(E, f, p.side, 1);                                                                 // 0x703ff2 (svaret bruges ikke)
  // 0x703ff7: spændingen engine+0x4786 += (K − 100·fumle − w39 + S − 100) · typens faktor (÷ når negativ)
  f.ebp = s16(f.s38);                                                                     // 0x703ffb ebp = K
  f.edi = s16(f.a2);                                                                      // 0x704004 edi = S (læses af 0x706cba)
  const v = f.ebp - (f.s14 !== 0 ? 100 : 0) - s16(p.w39) + s16(f.a2) - 100;               // 0x70400c–0x704027
  f.s38 = v;                                                                              // 0x70402b
  const fac = ({ 0x3a: 0.5, 0x1b: 2.0, 0x05: 5.5, 0x18: 2.5, 0x19: 1.75, 0x17: 1.5, 0x1c: 1.5, 0x1a: 2.25, 0x39: 2.25, 0x35: 3.0 } as Record<number, number>)[f.a1] ?? 1.0;
  M(E).x4786 = (M(E).x4786 + Math.trunc(v < 0 ? v / fac : v * fac)) | 0;                // 0x704086–0x7040af (tabel 0x70a784 → 0x70a760)
  const R = f.s10;
  if (R === 1 || R === 0xe || R === 0xf) return go(E, f, 0x706cba);                       // 0x7040b5 på mål
  return L_7040cb(E, f);
};

/** sub_6ce310(side, &egne, &modst., &s26, &s4e, &s4f, medMål) (sikker; ingen tal): stillingen (+ første kamp) set fra siden */
function ce310(E: ShotEnv, f: F, side: Side, add: number) {
  const r = score6ce310(E, side, add);
  f.s12 = r.own; f.s13 = r.opp; f.s26 = r.away; f.s4e = r.twoLeg; f.s4f = r.k3;
}
/** sub_6ce310 som rene ud-værdier (bruges også af sub_70a910/sub_70c040 i intoGoal.ts) */
export function score6ce310(E: ShotEnv, side: Side, add: number): { own: number; opp: number; away: number; twoLeg: number; k3: number } {
  const fx = X(E).fixture, m = E.m;
  let away = 0, twoLeg = 0, k3 = 0;
  let a0 = 0, a1 = 0;                                                                     // local13 (side 0) / bl (side 1)
  if (side === 0) { if (add) a0 = 1; } else if (add) a1 = 1;
  // NB: side 0: [esi] = s12 = +0xf5bd (side 0), [edi] = s13 = +0xf5f3; side 1: [esi] = s13 = +0xf5bd, [edi] = s12 = +0xf5f3
  let sA = m.goals[0], sB = m.goals[1];                                                   // [esi] = +0xf5bd, [edi] = +0xf5f3
  const k = fx.kind < 1000 ? fx.kind % 10 : 0;                                            // sub_4b0850(fixture word +0x30)
  if (k === 3) k3 = 1;
  if (fx.firstLeg) {                                                                      // fixture+0x4b ≠ 0xff
    sA = s8(sA + fx.firstLeg[0]); sB = s8(sB + fx.firstLeg[1]);
    twoLeg = 1;
    if (s8(sA) + a0 === s8(sB) + a1 && !(fx.flags & 4) && !((fx.flags & 0x4000) && m.periodEnd <= 0x3de)) {
      if (side === 0) { if ((m.goals[1] & 0xff) + a0 < s8(fx.firstLeg[0])) away = 1; }   // 0x6ce406
      else if ((m.goals[1] & 0xff) + a1 > s8(fx.firstLeg[0])) away = 1;                   // 0x6ce421
    }
  }
  return side === 0 ? { own: sA, opp: sB, away, twoLeg, k3 } : { own: sB, opp: sA, away, twoLeg, k3 };
}

// ------------------------------------------------------------------ 0x7040cb–0x704b0f: afbrænderne
const L_7040cb = (E: ShotEnv, f: F): void => {
  const p = f.p, m = E.m, t = f.a1;
  if (f.s11 === 2) {                                                                      // 0x7040cb: afbøjet forbi
    if (f.s28 === 5) E.ev1(0x1f83, p, p.side, 5);                                         // 0x7040ef SHOT_MISSED_TWO_HEADER
    else E.ev1(0x1f82, p, p.side, s8(f.s28));                                             // 0x704105 SHOT_MISSED_TWO
    const bl = f.a4;
    if (bl === 4 || bl === 3) E.ev1(0x2008, p, p.side, 0);                                // 0x704171 MISSED_IN_SHOOTOUT
    else if (t === 0x33 && bl === 1) E.ev1(0x1fce, p, p.side, 0);                         // 0x70414d MISSED_PENALTY
    if (p.side === 1) m.ballY = -1;                                                       // 0x70418c (0xff)
    else if (p.side === 0) m.ballY = 0xc;                                                 // 0x7041a3
    else throw new Error('take_shot: side');                                              // 0x704278 (fejllog match_pl.cpp 0x325c, afbryd)
    if (bl !== 5 && bl !== 6) {                                                           // 0x7041aa
      m.poss = p.side; m.carrier = null; m.state = 3;                                     // 0x7041be–0x7041d6 hjørne
      f.push = [0];                                                                        // 0x7041bd push edi (= extra til 70a860)
      return go(E, f, 0x709672);
    }
    // 0x7041e8 omspark
    const mx = M(E);
    mx.x4786 = 0; mx.x4782 = 0;                                                        // 0x7041f3 / 0x7041ff
    mx.x4786 = (mx.x4786 + f.s60) | 0; mx.x4782 = (mx.x4782 + f.s5c) | 0;           // 0x704217 / 0x70422b
    E.ev1(0x20f7, p, p.side, 0);                                                          // 0x70424b MUST_RETAKE
    (p as GPx).w39 = f.s58;                                                               // 0x704261
    X(E).place(p, f.s50, f.s54);                                                          // 0x704265
    X(E).takeBall(p);                                                                     // 0x70426c
    f.push = [0, 0];                                                                       // 0x704271/0x704272 (a6, a5)
    return go(E, f, 0x7092a5);
  }
  // 0x7042eb
  if (f.a4 === 4 || f.a4 === 3) {
    E.ev1(0x2008, p, p.side, 0);                                                          // 0x704339 MISSED_IN_SHOOTOUT
    if (f.a4 === 4) E.ev1(0x2174, p, p.side, 0);                                          // 0x70435e SILENT_MISSED_IN_35_YARD_SHOOTOUT (sic: param 4)
    if (t !== 0x33) return L_7044f8(E, f);                                                // 0x704378
  } else if (t === 0x33) E.ev1(0x1fce, p, p.side, 0);                                     // 0x70431b MISSED_PENALTY
  else return L_7044f8(E, f);                                                             // 0x704304
  // 0x70437e: straffesparket forbi (springtabel 0x70a7bc)
  const R = f.s10; f.edi = R - 2;
  const x28 = s8(f.s28);
  if (f.edi < 0 || f.edi > 0xb) return L_704a34(E, f);
  switch (R) {
    case 3: case 4: case 6: case 7: case 9:
      E.ev1(0x2125, p, p.side, x28); chain(E, p); break;                                  // 0x704396 PENALTY_HIT_OVER
    case 2: case 5: case 8:
      E.ev1(0x2126, p, p.side, x28); chain(E, p); break;                                  // 0x7043fc PENALTY_HIT_WIDE
    case 0xb: case 0xd: E.ev1(0x2124, p, p.side, x28); break;                             // 0x7044ba PENALTY_HITS_BAR
    case 0xa: case 0xc: E.ev1(0x2123, p, p.side, x28); break;                             // 0x7044d9 PENALTY_HITS_POST
  }
  return L_704a34(E, f);
};
/** historiekæden efter et klart forbi (0x7043bb/0x704421/0x704531/0x7045e5 – samme rækkefølge alle steder): den første af
 *  FEELING_PRESSURE, STARRING_IN_TOURNAMENT_BUT_NOT_TODAY, TIPPED_PLAYER_NOT_IMPRESSING, DISAPPOINTING_DEBUT, der passer, kommenteres */
function chain(E: ShotEnv, p: GP) {
  for (const id of [0x219e, 0x21b1, 0x21b2, 0x21b7]) if (storyApplies(E, p, id)) { E.ev1(id, p, p.side, 0); return; }
}
/** 0x7044f8: ikke straffe (springtabel 0x70a7ec) */
const L_7044f8 = (E: ShotEnv, f: F): void => {
  const p = f.p, t = f.a1, R = f.s10, k = f.ebx;
  f.edi = R - 2;
  if (f.edi < 0 || f.edi > 0xb) return L_704a34(E, f);
  switch (R) {
    case 2: E.ev1(0x1fbf, p, p.side, 0); chain(E, p); break;                              // 0x704527 SHOT_WELL_WIDE
    case 3:                                                                               // 0x704588
      if (f.s28 === 5) E.ev1(0x1fc1, p, p.side, 5);                                       // SHOT_WELL_OVER_HEADER
      else E.ev1(0x1fc0, p, p.side, s8(f.s28));                                           // SHOT_WELL_OVER
      chain(E, p); break;                                                                 // → 0x7043b0/0x7043bb
    case 4: E.ev1(0x1fc2, p, p.side, 0); chain(E, p); break;                              // 0x7045db SHOT_WELL_OVER_WIDE
    case 5: E.ev1(0x1fc3, p, p.side, 0); break;                                           // 0x7046a6 SHOT_WIDE
    case 6: E.ev1(0x1fc4, p, p.side, 0); break;                                           // 0x7046c1 SHOT_OVER
    case 7: E.ev1(0x1fc5, p, p.side, 0); break;                                           // 0x7046dc SHOT_OVER_WIDE
    default: {                                                                            // 8–13: 0x7046e6/0x704772/0x7047fe/0x70488a/0x704916/0x7049a2
      if (t !== 0x33 && t !== 0x3a && f.s14 === 0 && E.rand(50) === 0 && f.s20 === 0 && isGK(k))
        E.ev1(t === 0x1a ? 0x21d2 : 0x20d6, k, k!.side, 0);                               // GOALIE_CHIP_FAILED_SAVE / KEEPER_DIVES_TO_NO_AVAIL
      E.ev1(0x1fc6 + (R - 8), p, p.side, 0);                                              // SHOT_JUST_WIDE … SHOT_HITS_BAR (0x1fc6–0x1fcb)
    }
  }
  return L_704a34(E, f);
};
/** 0x704a34: param 1/2 → historierne efter afbrænderen (0x704b0f, R7/R3); 5/6 → omspark; ellers (3/4) slut */
const L_704a34 = (E: ShotEnv, f: F): void => {
  const a = f.a4;
  if (a === 1 || a === 2) return go(E, f, 0x704b0f);                                      // f.edi = R − 2
  if (a === 5 || a === 6) return L_704a57(E, f);
  return;                                                                                 // 0x704b02
};
const L_704a57 = (E: ShotEnv, f: F): void => {
  const p = f.p as GPx, mx = M(E);
  f.edi = 0;                                                                              // 0x704a5d
  mx.x4786 = 0; mx.x4782 = 0;                                                          // 0x704a64 / 0x704a70
  mx.x4786 = (mx.x4786 + f.s60) | 0;                                                    // 0x704a84
  mx.x4782 = (mx.x4782 + f.s5c) | 0;                                                  // 0x704a9c
  E.ev1(0x20f7, p, p.side, 0);                                                            // 0x704abc MUST_RETAKE (extra = push edi 0x704a63)
  p.w39 = f.s58;                                                                          // 0x704ac6
  return L_704aca(E, f);
};
label(0x704a57, (E, f) => L_704a57(E, f as F));
/** 0x704aca: tilbage på pladsen, bolden igen, sub_702050(type, det oprindelige S, begivenheden, 1, 0, 0) */
const L_704aca = (E: ShotEnv, f: F): void => {
  const p = f.p;
  X(E).place(p, f.s50, f.s54);                                                            // 0x704ad6
  X(E).takeBall(p);                                                                       // 0x704add
  return L_704ae4(E, f);                                                                  // push edi, push edi (edi = 0)
};
label(0x704aca, (E, f) => L_704aca(E, f as F));
const L_704ae4 = (E: ShotEnv, f: F): void => {
  X(E).takeShot(f.p, f.a1, f.s34, f.a3, 1, 0, []);                                        // 0x704afd (a5 = a6 = 0)
};
label(0x704ae4, (E, f) => L_704ae4(E, f as F));
label(0x704b02, () => {});                                                                // ret 0x18
