// sub_702050, afsnit R6: 0x707520–0x708c1c ("take_shot_fragment_707520") – målets følger: Shearer-sangen, mandsopdækningen (LOST_MARKER m.fl.),
// midtbanens løb/indlæg/kreativitet, keeperens reaktion, ind via stolpe/overligger, straffesparkskonkurrencens mål, det ikke-godkendte mål
// (den ventende hændelse sub_6bac40), hattrick, distancemål, debut/jubilæumsmål og historierne (0x717470), keeperen ude af position,
// golden goal, CLINCHING/WINNING/EQUALISER/PULLED_ONE_BACK/LEAD_ON_AWAY_GOALS, omspark (param 5/6), holdets humør og karakterer, målet tælles
// (+0xf5bd) og holdhistorierne (0x6d4b70). Oversat instruktion for instruktion (2026-11-11).
//
// ENV (nye medlemmer af ShotEnv, ud over afsnit 1's):
//   victimSide(): number                     sub_6bba50: den ventende hændelses offerside (1 − synderens side), −1 uden hændelse (+0x475a = 0 eller +0x4761 = 0)
//   applyIncident(): void                    sub_6bac40: dommeren går tilbage til hændelsen (returværdien bruges ikke her)
//   firstMarker(q): GP | null                sub_6d5a10: første modstander (truppens rækkefølge +0x2e, +0x19 ≥ 0) hvis sub_7160f0 (mandsopdækningens mål) = q
//   markedBy(q): number                      sub_6d59b0 (afsnit 1 bruger den også): antallet af sådanne modstandere
//   rec(q, off): number | null               spillerpostens byte (+0x6d → off), null uden post: 0x1c Aggression, 0x2e Jumping, 0x36 Pace (rå 1..20)
//   staffByte(q, off): number                staffpostens byte (+0x69 → off): 0x57 (alfabetisk mellem Adaptability og Determination = Ambition ?), 0x5a Pressure
//   surname(q): string                       staffpostens navn (+0x69 → +8 → streng); sammenlignes med "Shearer" (0xa16110)
//   countOnPitch(s): number                  sub_6cbbb0(s): antal af sidens 20 med +0x19 ≥ 0; skriver det i engine+4+s (bytes – her kun som returværdi)
//   scaleAg(q, f): void                      sub_716450: ag = min(max(fround(ag·f), 2·(25 − Temperament)), 100)
//   teamBlock(s): number[]                   holdblokken engine+0xf5bc + 54·s (index = offset − 0xf5bc): [0] straffemål i konkurrencen, [1] mål (= m.goals[s]),
//                                            [2] (+0xf5be, ?) – læses ">4", [0x15] (+0xf5d1, ?) ">0x37", [0x16] (+0xf5d2, ?) ">0x41"
//   reactToDecision(q): void                 sub_716e10(q, 0) (gridMatch reactToFoul) – skytten reagerer på det annullerede mål
//   watched: boolean                         engine+0x8ebb (afsnit 1)
//   goldenGoal: boolean                      engine+0x1a8 (golden goal i kraft – sat af 0x706eaf, når sub_6d4250 er sand; NB loop.ts kalder +0x1a8 "paused")
//   b1a4: number                             engine+0x1a4 (byte, ?) – 0 → GOALIE_OUT_OF_POSITION kan siges
// Lokale gengivelser (ingen tilfældige tal): 6bb8d0 (teamMood), 6bb950 (agitateSide), 6cf710 (ratingSide), 717c70 (bothMask), 6f4a70/6f4a40 (m.goals).
//
// FRAME (læses/skrives her): s10 R (resultatkoden, 0xe/0xf = ind via stolpe/overligger), s11 skudlinjen (≠ 0 = afrettet → selvmål), s12/s13 egne/
//   modstandernes mål sammenlagt (sub_6ce310 ved 0x703ff2; s12 ++ ved 0x70847e), s14 fumle, s16 (0x70758e: = markedBy(p), overskriver minuttet),
//   s17 målstatistikken talt (0x706ef6), s1b yards, s20 keeperens tilstand (0x700420), s26 udebanemål afgør (6ce310), s27 (0x7085b4: 0xff),
//   s3c ud-værdien fra 6d4b70 (0x21ab), s48 keeperen, s4e tokamp (6ce310), s4f (6ce310: fixture+0x30 % 10 == 3), s58 gemt w39, s5c/s60 gemt
//   x4782/x4786, s64 yards (0x703e20 overskriver T), s78 udfordreren før skuddet (0x7024ad), s8c handlingen før skuddet (+0x198), a1 type, a4 param,
//   a5 antal i a6. f.eax: rand(3) fra 0x70751d (kun ved indgangen 0x707522). f.pend / f.pendSide: et 0x7002f0-/0x70a860-kald, hvis argumenter
//   ligger på stakken ved hoppet (indgangen 0x707cbc / udgangen 0x708d0b).
//
// FIELDS (nye): GP: c01 (+0x1, byte – NB loop.ts kalder +0x1 "injury" gættet; her tæller "> 10" for afleveren), c02 (+0x2, byte, ?), assists (+0x3,
//   afsnit 1), matchGoals (+0xc), conc (+0xf, keeperens mål imod ?), debut (+0x30, byte), b1b (+0x1b, byte – sammenlignes med 0x1c52: altid falsk),
//   gClub (+0x3d), gNation (+0x3f), gLgClub (+0x41), gLgCareer (+0x43), gSeason (+0x45) (words; tælles op i 0x706edd), motivation (+0x100, s8),
//   w39 (+0x39). GridMatchState: passRecv (+0xf5aa) / passGiver (+0xf5a6) (afsnit 1), x4782/x4786 (afsnit 1), lastPassType (+0x8d4a, findes),
//   lastToucher (+0xf5ae, findes), periodEnd (+0x8ed4, findes).
//
// LABELS IN: 0x707520 (trækker selv rand(3) fra 0x70751d), 0x707522 (bruger f.eax), 0x707582, 0x707baa, 0x707bcb, 0x707c86, 0x707cbc (kræver f.pend),
//   0x707cc7, 0x707db2.
// LABELS OUT: 0x704aca (omsparket), 0x704b02 (= ret 0x18), 0x708c1c (holdhistorierne fortsætter), 0x708d0b (f.push = [id, side, extra] som R7 læser), 0x708e39.
import { go, label, type ShotEnv, type ShotFrame } from '../takeShot';
import type { GP } from '../gridMatch';
import * as L from '../loop';
import { storyApplies, teamStoryApplies } from '../story';

/** et ventende 0x7002f0-kald (id, p, side, extra), hvis argumenter er push'et før et hop til 0x707cbc */
export interface PendEv1 { id: number; p: GP | null; s: number; extra: number }
/** et ventende 0x70a860-kald (id, side, extra) før hoppet til 0x708d0b */
export interface PendSide { id: number; s: number; extra: number }

const w16 = (x: number) => (x << 16) >> 16;
const s8 = (x: number) => (x << 24) >> 24;
const other = (s: number) => (s === 0 ? 1 : 0);
const minute = (E: ShotEnv) => Math.trunc(E.m.clock / 11);                                     // imul 0x2e8ba2e9, sar 1 (clock/11)
const isKeeper = (q: GP | null) => !!q && q.pos === L.POS.keeper;                              // sub_6c38c0(q) == 1
/** sub_717c70: både positionsordet (sub_6c38c0) og angrebsordet (sub_6c38f0) har en af bittene 0x880 */
const bothMask = (q: GP) => (q.pos & 0x880) !== 0 && ((q.posAttack ?? q.pos) & 0x880) !== 0;
/** sub_6cf710(s, d): karakteren +0x35 += d (word) for sidens 20 med +0x19 ≥ 0 */
const ratingSide = (E: ShotEnv, s: number, d: number) => { for (const q of E.gp) if (q.side === s && q.slot >= 0) q.rating = w16(q.rating + d); };
/** sub_6bb950(s, f): alle sidens 20 med staffpost (+0x69 ≠ 0) → sub_716450(f) */
const agitateSide = (E: ShotEnv, s: number, f: number) => { for (const q of E.gp) if (q.side === s) E.scaleAg(q, f); };
/** sub_6bb8d0(p, f): p's hold – p selv ×f, de andre på banen (+0x19 ≥ 0) ×(f + 1)·0,5, de øvrige ×(f·1/6 + 0,83) (float32 på stakken) */
const teamMood = (E: ShotEnv, p: GP, f: number) => {
  for (const q of E.gp) {
    if (q.side !== p.side) continue;
    if (q === p) E.scaleAg(q, f);
    else if (q.slot >= 0) E.scaleAg(q, Math.fround((f + 1.0) * 0.5));                         // 0x6bb925: fadd 1,0 (0x967890), fmul 0,5 (0x968968)
    else E.scaleAg(q, Math.fround(f * 0.16666666666666666 + 0.83));                           // 0x6bb913: fmul 0x96a7a8, fadd 0x96d0e8
  }
};
/** de fire "ikke godkendt"-blokke (0x707d0a, 0x707ea8, 0x707fd8, 0x708357, 0x70841a, 0x708844): GOAL_DISALLOWED, sub_6bac40; returnerer bl =
 *  offersiden (læst FØR sub_6bac40) */
const disallow = (E: ShotEnv, f: ShotFrame): number => {
  E.evSide(0x20ed, f.p.side, 0);                                                              // 0x70a860 GOAL_DISALLOWED (side = skyttens)
  const bl = E.victimSide();                                                                  // sub_6bba50
  E.applyIncident();                                                                          // sub_6bac40
  return bl;
};

// ---------------------------------------------------------------- 0x70751d/0x707522: Shearer-sangen (kun den sete kamp)
const L707522: (E: ShotEnv, f: ShotFrame) => void = (E, f) => {
  // 0x707525: rand(3) ≠ 0 og skyttens efternavn er "Shearer" (strcmp mod 0xa16110) → CHANT_SHEARER
  if ((f.eax as number) !== 0 && E.surname(f.p) === 'Shearer') E.ev1(0x216c, f.p, f.p.side, 0);   // 0x70757d
  return go(E, f, 0x707582);
};
label(0x707520, (E, f) => { f.eax = E.rand(3); return L707522(E, f); });                    // 0x70751b push 3; call 0x90cfc0
label(0x707522, L707522);

// ---------------------------------------------------------------- 0x707582: mandsopdækningen
label(0x707582, (E, f) => {
  const p = f.p, m = E.m;
  f.s16 = E.markedBy(p);                                                                      // 0x707589 sub_6d59b0 → [esp+0x16]
  if (f.a1 !== 0x35 && (f.s16 as number) !== 0) {                                             // 0x707599 / 0x7075a7
    const mk = E.firstMarker(p);                                                              // 0x7075b4 sub_6d5a10
    if (!mk) return go(E, f, 0x707cc7);
    const ch = f.s78 as GP | null;                                                            // 0x7075cc [esp+0x78] = udfordreren før skuddet
    if (f.a5 === 0) {                                                                         // 0x7075c3
      if (ch) return go(E, f, 0x707cc7);                                                      // 0x7075d8
      if (f.s16 === 1) {                                                                      // 0x7075de
        if (mk.action === 0x6e) return go(E, f, 0x707cc7);                                    // 0x7075e5
        if (w16(mk.rating) >= 0x1a5e) return go(E, f, 0x707cc7);                              // 0x7075f8
        if (w16(p.rating) <= 0x1a5e) return go(E, f, 0x707cc7);                               // 0x707602
        if (s8(minute(E)) <= 0xf) return go(E, f, 0x707cc7);                                  // 0x707629 (dl = minuttet som byte)
        E.ev(0x21c2, p, p.side, mk, mk.side, 0);                                              // 0x707650 LOST_MARKER (p1 skytten, p2 markøren)
        return go(E, f, 0x707cc7);
      }
      // 0x70765a: byte +0x1b (fortegn) > 0x1c52 – kan aldrig være sand (sic); LOST_MARKER S 0x21c3 nås ikke
      if (s8(p.b1b as number) > 0x1c52) E.ev(0x21c3, p, p.side, mk, mk.side, 0);              // 0x70768d
      return go(E, f, 0x707cc7);
    }
    // 0x707697: a5 ≠ 0 – udfordreren findes og ER markøren, begge har spillerpost, skytten > 6750, markøren < 7250
    if (!ch) return go(E, f, 0x707cc7);
    const rp = E.rec(p, 0x2e), rk = E.rec(mk, 0x2e);
    if (rp === null || rk === null) return go(E, f, 0x707cc7);                                // 0x7076a2 / 0x7076ad
    if (w16(p.rating) <= 0x1a5e) return go(E, f, 0x707cc7);                                   // 0x7076b5
    if (w16(mk.rating) >= 0x1c52) return go(E, f, 0x707cc7);                                  // 0x7076c1
    if (mk !== ch) return go(E, f, 0x707cc7);                                                 // 0x7076cd
    if ((f.a1 === 3 || f.a1 === 0x39) && rp > 0xa && rp - rk > 3) {                            // 0x7076dc: hovedstød, Jumping (+0x2e) > 10 og > markørens + 3
      E.ev(0x21c4, p, p.side, mk, mk.side, 0);                                                // 0x70771d MARKER_BEATEN_IN_AIR
      return go(E, f, 0x707cc7);
    }
    const pa = f.s8c as number;                                                               // 0x707727 [esp+0x8c] = +0x198 før skuddet
    if (pa === 0x70 || pa === 0x6a || pa === 0x69 || pa === 0x12) {
      const vp = E.rec(p, 0x36) as number, vk = E.rec(mk, 0x36) as number;                    // Pace (+0x36)
      if (vp > 0xa && vp - vk > 3) {                                                          // 0x707746
        E.ev(0x21c5, p, p.side, mk, mk.side, 0);                                              // 0x70777f MARKER_TOO_SLOW
        return go(E, f, 0x707cc7);
      }
    }
    // 0x707789: efter 60 minutter, modstanderne har 0 mål (0x6f4a70) og skytten 1 (0x6f4a40 – NB efter målet? m.goals tælles først ved 0x708a31)
    if (s8(minute(E)) <= 0x3c) return go(E, f, 0x707cc7);
    if (m.goals[other(p.side)] !== 0) return go(E, f, 0x707cc7);                              // 0x7077b1 sub_6f4a70
    if (m.goals[p.side] !== 1) return go(E, f, 0x707cc7);                                     // 0x7077c0 sub_6f4a40
    // 0x7077d3: lea edx, [eng + 0xf5bc] er aldrig 0
    const tb = E.teamBlock(p.side);
    if (tb[2] <= 4) return go(E, f, 0x707cc7);                                                // 0x7077f1 +0xf5be (ubyte)
    if (tb[0x16] <= 0x41) return go(E, f, 0x707cc7);                                          // 0x70780b +0xf5d2
    if (tb[0x15] <= 0x37) return go(E, f, 0x707cc7);                                          // 0x707814 +0xf5d1
    E.ev(0x21d7, p, p.side, p, p.side, 0);                                                    // 0x707836 PRESSURE_PAYS_OFF (p1 = p2 = skytten)
    return go(E, f, 0x707cc7);
  }
  // ---------------------------------------------------------------- 0x707840: frispark eller ingen markør
  if ((p.pos & 0x30) !== 0 && !bothMask(p) && w16(p.rating) > 0x1a5e && (p.shotsOnTarget & 0xff) > 1) {   // 0x707854–0x70786e
    E.ev1(0x21c7, p, p.side, 0);                                                              // 0x707885 NO_ONE_COVERING_MIDFIELDER
    return go(E, f, 0x707cc7);
  }
  // 0x70788f: skytten fik den sidste aflevering (+0xf5aa) fra en medspiller (+0xf5a6)
  const g = m.passRecv === p ? m.passGiver : null;
  if (g) {
    if (bothMask(g) && (g.pos & 0x38) !== 0) {                                                // 0x7078b1 / 0x7078d2
      const t = m.lastPassType;                                                               // 0x7078e0 +0x8d4a
      if (t === 0x5e || t === 6 || t === 7 || t === 8) {                                      // indlæggene
        if (w16(g.rating) <= 0x1a5e) return go(E, f, 0x707cc7);                               // 0x707907
        if (((g.assists as number) & 0xff) > 1 && (g.penGoalsWon & 0xff) > 1 && ((g.c01 as number) & 0xff) > 0xa) {   // 0x707910–0x70791c
          E.ev1(0x21c8, g, g.side, 0);                                                        // 0x707933 DEVASTATING_CROSSES
          return go(E, f, 0x707cc7);
        }
        // 0x70793d
        if (((g.c01 as number) & 0xff) <= 0xa || ((g.assists as number) & 0xff) <= 1 || g.roll.creativity === 0) return go(E, f, 0x707cc7);
        E.ev1(0x21ca, g, g.side, 0);                                                          // 0x707979 DEVASTATING_CROSS
        return go(E, f, 0x707cc7);
      }
    }
    // 0x707983
    if (bothMask(g)) return go(E, f, 0x707cc7);
    if ((g.pos & 0x30) === 0) return go(E, f, 0x707cc7);                                      // 0x7079a6
    if (((g.c02 as number) & 0xff) <= 0xa) return go(E, f, 0x707cc7);                         // 0x7079ae
    if (w16(g.rating) <= 0x1a5e) return go(E, f, 0x707cc7);                                   // 0x7079b8
    if (((g.assists as number) & 0xff) <= 1) return go(E, f, 0x707cc7);                       // 0x7079c2
    if (((g.c01 as number) & 0xff) <= 0xa) return go(E, f, 0x707cc7);                         // 0x7079cc
    if (E.rand(2) === 0) return go(E, f, 0x707cc7);                                           // 0x7079d8
    if (g.roll.creativity === 0) return go(E, f, 0x707cc7);                                   // 0x7079e8 +0x10b
    E.ev1(0x21c9, g, g.side, 0);                                                              // 0x707a07 CREATIVE_MIDFIELDER
    return go(E, f, 0x707cc7);
  }
  // ---------------------------------------------------------------- 0x707a11: keeperen (ebx) skælder ud / er fortvivlet
  const k = f.ebx;
  if (f.s14) return go(E, f, 0x707cc7);                                                       // 0x707a11 fumle
  if (!f.s20 && isKeeper(k)) {                                                                // 0x707a1d / 0x707a29
    const kk = k as GP, c = (kk.b0f as number) & 0xff;                                       // +0xf
    let ok = (E.rec(kk, 0x1c) as number) + c > s8(E.rand(10) + 5);                            // 0x707a47 Aggression (+0x6d+0x1c) + c > rand(10) + 5
    if (ok) ok = E.staffByte(kk, 0x57) + c > s8(E.rand(10) + 5);                              // 0x707a6a staff +0x57
    if (ok) ok = E.rand(c) !== 0;                                                             // 0x707a8a
    if (ok) ok = s8(p.motivation as number) + c > s8(E.rand(10) + 1);                         // 0x707a97 skyttens +0x100
    if (ok) { E.ev1(0x21d3, kk, kk.side, 0); return go(E, f, 0x707cc7); }                     // 0x707ac9 GOALIE_BLAMES_DEFENSE
  }
  // 0x707ad3
  if (f.s14 || f.s20 || !isKeeper(k)) return go(E, f, 0x707cc7);
  {
    const kk = k as GP, c = (kk.b0f as number) & 0xff;
    if ((E.rec(kk, 0x1c) as number) >= 0xa) return go(E, f, 0x707cc7);                       // 0x707b0c
    if (E.staffByte(kk, 0x57) >= c + 0xa) return go(E, f, 0x707cc7);                          // 0x707b25
    const kp = f.s48 as GP;                                                                   // 0x707b2d ebp = [esp+0x48] (keeperen)
    const c2 = (kp.b0f as number) & 0xff;                                                    // bl = +0xf (ebx' lave byte overskrives)
    if (E.staffByte(kp, 0x5a) >= E.rand(5) + 2 * c2 + 4) return go(E, f, 0x707cc7);           // 0x707b31–0x707b53 Pressure
    if (c2 <= 1) return go(E, f, 0x707cc7);                                                   // 0x707b59
    if (E.rand(c2) === 0) return go(E, f, 0x707cc7);                                          // 0x707b62
    if (s8(p.motivation as number) >= s8(E.rand(5) + 1)) return go(E, f, 0x707cc7);           // 0x707b73–0x707b87
    E.ev1(0x21d4, kp, kp.side, 0);                                                            // 0x707ba0 GOALIE_DESPONDANT
    return go(E, f, 0x707cc7);
  }
});

// ---------------------------------------------------------------- 0x707baa / 0x707bcb / 0x707c86: målets første linje
// 0x707baa (param 1, afrettet): GOAL_TWO (selvmål) til den, der rørte bolden sidst (+0xf5ae)
label(0x707baa, (E, f) => {
  const t = E.m.lastToucher as GP;
  E.ev1(0x1fcd, t, t.side, 0);                                                                // 0x707bc1
  return go(E, f, 0x707cc7);
});
// 0x707bcb (param ≠ 1): dl = afretningen [esp+0x11]
label(0x707bcb, (E, f) => {
  const p = f.p;
  if (f.s11) { const t = E.m.lastToucher as GP; E.ev1(0x20fa, t, t.side, 0); return go(E, f, 0x707cc7); }   // 0x707c68 ILLEGAL_GOAL_TWO
  E.ev1(0x20f9, p, p.side, 0);                                                                // 0x707be4 ILLEGAL_GOAL_ONE
  if (!E.watched) return go(E, f, 0x707cc7);                                                  // 0x707bee engine+0x8ebb
  if (E.rand(8) !== 0) return go(E, f, 0x707cc7);                                             // 0x707c02
  if (E.surname(p) === 'Shearer') E.ev1(0x216c, p, p.side, 0);                               // 0x707c14–0x707c61 CHANT_SHEARER
  return go(E, f, 0x707cc7);
});
// 0x707c86: ILLEGAL_GOAL_ONE / _TWO alene (hændelsen venter, eller omspark)
label(0x707c86, (E, f) => {
  if (!f.s11) E.ev1(0x20f9, f.p, f.p.side, 0);                                                // 0x707c9f
  else { const t = E.m.lastToucher as GP; E.ev1(0x20fa, t, t.side, 0); }                     // 0x707cb7
  return go(E, f, 0x707cc7);
});
// 0x707cbc: et 0x7002f0-kald, hvis argumenter kalderen har push'et (f.pend)
label(0x707cbc, (E, f) => {
  const q = f.pend as PendEv1; f.pend = undefined;
  E.ev1(q.id, q.p, q.s, q.extra);                                                             // 0x707cc2
  return go(E, f, 0x707cc7);
});

// ---------------------------------------------------------------- 0x707cc7: ind via stolpen/overliggeren, så den ventende hændelse
label(0x707cc7, (E, f) => {
  const R = f.s10 as number;
  if (R === 0xe) E.ev1(0x2175, f.p, f.p.side, 0);                                             // 0x707ce4 SHOT_HIT_POST_IN
  else if (R === 0xf) E.ev1(0x2176, f.p, f.p.side, 0);                                        // 0x707da8 SHOT_HIT_BAR_IN
  f.ebx = f.s48 as GP | null;                                                                 // 0x707cf4 ebx = [esp+0x48]
  return L707cf8(E, f);
});

/** 0x707cf8: rand(3) ≠ 0 og en ventende hændelse → målet annulleres */
function L707cf8(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  if (E.rand(3) !== 0 && E.victimSide() > -1) {                                               // 0x707cf8 / 0x707d10
    const bl = disallow(E, f);                                                                // 0x707d30–0x707d4d
    if (bl === p.side) return L708893(E, f);                                                  // 0x707d57
    return L707d5d(E, f);
  }
  return L707e2b(E, f);
}
/** 0x707d5d: lige eller ét mål bagud (sammenlagt, før målet) → rand(40) == 0 → TEAM_ARGUES_WITH_REFEREE */
function L707d5d(E: ShotEnv, f: ShotFrame): void {
  const a = s8(f.s12 as number), b = s8(f.s13 as number);
  if (a === b) return L707d78(E, f);
  if (a - 1 !== b) return L70892f(E, f);                                                      // 0x707d69
  return L707d78(E, f);
}
function L707d78(E: ShotEnv, f: ShotFrame): void {
  if (E.rand(0x28) !== 0) return L70892f(E, f);                                               // 0x707d78
  return L708912(E, f);
}

// ---------------------------------------------------------------- 0x707db2: målet i straffesparkskonkurrencen (param 3/4)
label(0x707db2, (E, f) => {
  const p = f.p;
  E.teamBlock(p.side)[0] = ((E.teamBlock(p.side)[0] + 1) & 0xff);                             // 0x707dd6 +0xf5bc + 54·side ++
  E.ev1(0x2000, p, p.side, 0);                                                                // 0x707ded SHOOTOUT_SCORED
  if (f.a4 === 3) E.ev1(0x212e, p, p.side, 0);                                                // 0x707df7 / 0x707e1c SHOOTOUT_SCORED_COMMENT
  return L707cf8(E, f);                                                                       // 0x707cf8 (ebx uændret)
});

// ---------------------------------------------------------------- 0x707e2b
function L707e2b(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  if (f.a4 === 3 || f.a4 === 4) return L70882b(E, f);                                         // 0x707e32
  if (!f.s11 && (p.goals & 0xff) === 3) {                                    // 0x707e42 / 0x707e4a hattrick
    E.ev1(p.debut ? 0x2011 : 0x1fd5, p, p.side, 0);                                           // 0x707e74 HAT_TRICK_ON_DEBUT_FOR_CLUB / HAT_TRICK
  }
  if (f.a4 === 5 || f.a4 === 6) return L70877a(E, f);                                         // 0x707e86 omspark
  if (E.rand(3) !== 0 && E.victimSide() > -1) {                                               // 0x707e96
    const bl = disallow(E, f);                                                                // 0x707ebb–0x707eeb
    if (bl === p.side) return L707ef7(E, f);
    return L707f42(E, f);
  }
  return L707f80(E, f);
}
/** 0x707ef7: offeret var skyttens hold – HARSH_DECISION, og rand(s13 − s12 + 3) > 0 → TEAM_ARGUES_WITH_REFEREE */
function L707ef7(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  E.evSide(0x20df, p.side, 0);                                                                // 0x707f07 HARSH_DECISION
  if (E.rand(s8(f.s13 as number) - s8(f.s12 as number) + 3) > 0) E.evSide(0x20d9, p.side, 0);   // 0x707f21 → 0x7088d5
  return L7088e6(E, f);
}
function L707f42(E: ShotEnv, f: ShotFrame): void {
  const a = s8(f.s12 as number), b = s8(f.s13 as number);
  if (a === b) return L707f5d(E, f);
  if (a - 1 !== b) return L70892f(E, f);                                                      // 0x707f4e
  return L707f5d(E, f);
}
function L707f5d(E: ShotEnv, f: ShotFrame): void {
  if (E.rand(0x28) !== 0) return L70892f(E, f);                                               // 0x707f5d
  E.evSide(0x20d9, f.p.side, 0);                                                              // 0x707f6f → 0x70891e TEAM_ARGUES_WITH_REFEREE
  return L70892f(E, f);
}
/** 0x707f80: distancemålet */
function L707f80(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, yd = s8(f.s1b as number);
  if (!f.s11 && yd >= 0x14) {                                                                 // 0x707f80 / 0x707f88
    const id = yd > 0x28 ? 0x1fa1 : yd > 0x19 ? 0x1fa0 : 0x1f9f;                              // 0x707f90–0x707fa2 VERY_LONG / LONG / GOAL
    E.ev1(id, p, p.side, f.s64 as number);                                                    // 0x707fc5 extra = [esp+0x64] (yards fra 0x703e20)
  }
  if (E.rand(3) !== 0 && E.victimSide() > -1) {                                               // 0x707fca / 0x707fde
    const bl = disallow(E, f);                                                                // 0x707fe7–0x708017
    if (bl !== p.side) return L7083a6(E, f);                                                  // 0x708021
    return L708893(E, f);
  }
  return L70802c(E, f);
}
/** 0x7083a6: lige før målet → 0x707d78, ellers 0x707d69 */
function L7083a6(E: ShotEnv, f: ShotFrame): void {
  if (s8(f.s12 as number) === s8(f.s13 as number)) return L707d78(E, f);
  if (s8(f.s12 as number) - 1 !== s8(f.s13 as number)) return L70892f(E, f);                 // 0x707d69
  return L707d78(E, f);
}
/** 0x70802c: debuten, jubilæumsmålene og historierne (ikke ved afretning) */
function L70802c(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  if (!f.s11) {
    const gC = w16(p.goalWords[0]), gN = w16(p.goalWords[1]), gLC = w16(p.goalWords[2]);
    const gLK = w16(p.goalWords[3]), gS = w16(p.goalWords[4]);
    let ev: [number, number] | null = null;                                                   // (id, extra) til 0x708214
    if (p.debut && (p.goals & 0xff) === 1) {                                 // 0x708038 / 0x70803f
      ev = storyApplies(E, p, 0x21b6) ? [0x21b6, gC] : [0x2010, gC];                          // 0x708045 SCORES_TO_CAP_IMPRESSIVE_DEBUT / SCORED_ON_HIS_DEBUT
    } else if (gC === 1) ev = [0x200f, 1];                                                    // 0x70808f FIRST_EVER_GOAL_FOR_CLUB
    else if (gN === 1) ev = [0x200b, 1];                                                      // 0x7080b4 LANDMARK_GOAL_FOR_COUNTRY (1)
    else if (w16(p.goalWords[3]) === 1) ev = [0x2012, 1];                              // 0x7080d5 FIRST_CAREER_GOAL (+0x43)
    else if (gN >= 0xa && gN % 10 === 0) ev = [0x200b, gN];                                   // 0x7080f7 / 0x70810c
    else if (gC === 0x32 || (gC >= 0x64 && gC % 100 === 0)) ev = [0x200a, gC];                // 0x708128 / 0x708132 → 0x7081fc LANDMARK_GOAL_FOR_CLUB
    else if (gLC !== gC && (gLC === 0x32 || (gLC >= 0x64 && gLC % 100 === 0))) ev = [0x200c, gLC];   // 0x70814b LANDMARK_LEAGUE_GOAL_FOR_CLUB
    else if (gLK !== gLC && gLK >= 0x64 && gLK % 100 === 0) ev = [0x200d, gLK];               // 0x70818c LANDMARK_LEAGUE_GOAL_CAREER
    else if (gS === 1 || (gS >= 5 && gS % 5 === 0)) ev = [0x200e, gS];                         // 0x7081c3 LANDMARK_GOAL_SEASON
    if (ev) E.ev1(ev[0], p, p.side, ev[1]);                                                   // 0x708214 → 0x70821a
    // 0x70821f: historierne – den første, der gælder
    for (const id of [0x219f, 0x21a0, 0x21a1, 0x21b0, 0x21b3, 0x21b4, 0x21b5]) {
      if (storyApplies(E, p, id)) { E.ev1(id, p, p.side, 0); break; }                         // 0x70833e → 0x708344
    }
  }
  // 0x708349
  if (E.rand(3) !== 0 && E.victimSide() > -1) {
    const bl = disallow(E, f);                                                                // 0x708366–0x708396
    if (bl === p.side) return L708893(E, f);                                                  // 0x7083a0
    return L7083a6(E, f);
  }
  // 0x7083bb: keeperen var ude af position (tilstanden fra 0x700420)
  const k = f.ebx;
  if (E.b1a4 === 0 && isKeeper(k) && f.s20) {                                                 // 0x7083c1–0x7083e7
    E.ev1(0x1fe1, k, (k as GP).side, s8(f.s20 as number));                                    // 0x708402 GOALIE_OUT_OF_POSITION (extra = tilstanden)
  }
  // 0x70840c
  if (E.rand(3) !== 0 && E.victimSide() > -1) {
    const bl = disallow(E, f);                                                                // 0x708429–0x708459
    if (bl === p.side) return L707ef7(E, f);                                                  // 0x708463
    if (s8(f.s12 as number) === s8(f.s13 as number)) return L707f5d(E, f);                    // 0x708473
    return L707f42(E, f);                                                                     // 0x708479 → 0x707f4e (s12 ≠ s13)
  }
  return L70847e(E, f);
}
/** 0x70847e: målet tæller sammenlagt; golden goal; kampens situation */
function L70847e(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, m = E.m;
  f.s12 = s8((f.s12 as number) + 1);                                                          // 0x708484
  if (E.goldenGoal) { E.evSide(0x1fd2, p.side, 0); return L708844(E, f); }                    // 0x7084a5 GOLDEN_GOAL
  if (f.s4f) return L70872d(E, f);                                                            // 0x7084b4
  const edi = s8(f.s12 as number) - s8(f.s13 as number);                                      // 0x7084c0
  const mn = minute(E);
  if (edi === 2 && ((mn >= 0x46 && m.periodEnd === 0x3de) || mn >= 0x6a)) {                   // 0x7084d1–0x7084fe
    E.evSide(0x1fd0, p.side, 0);                                                              // 0x70850d CLINCHING_GOAL
    return L708830(E, f, Math.fround(1.55));                                                  // 0x708517 push 1,55
  }
  if ((edi === 1 || f.s26) && ((mn >= 0x50 && m.periodEnd === 0x3de) || mn >= 0x6e)) {        // 0x708521–0x708556
    E.evSide(0x1fd1, p.side, 0);                                                              // 0x70855f → 0x708765 WINNING_GOAL
    return L708830(E, f, Math.fround(1.45));                                                  // 0x708770
  }
  if (s8(f.s12 as number) === s8(f.s13 as number) && !f.s26 && mn >= 0x46 && !f.s4e) {       // 0x708569–0x7085ab: udligning
    f.s27 = 0xff;                                                                             // 0x7085b4
    const opp = E.countOnPitch(other(p.side));                                                // 0x7085bf sub_6cbbb0(modstanderne)
    const own = E.countOnPitch(p.side);                                                       // 0x7085d0 sub_6cbbb0(egne) – skriver engine+4+side
    let bl = own < opp ? own : s8(f.s27 as number);                                           // 0x7085d5: færre på banen → byte engine+4+side (= own), ellers 0xff
    bl = s8(bl);
    const dx = w16(mn);
    const late = (dx >= 0x55 && dx < 0x5a) || dx >= 0x73;                                     // 0x70860f–0x70861f / 0x708642–0x708652
    let id: number, fl: number;
    if (bl === -1) { if (late) { id = 0x1fd8; fl = 1.45; } else { id = 0x1fd6; fl = 1.35; } }   // LATE_EQUALISER / EQUALISER
    else if (late) { id = 0x1fd9; fl = 1.65; } else { id = 0x1fd7; fl = 1.4; }                 // LATE_EQUALISER_LESS_MEN / EQUALISER_LESS_MEN
    agitateSide(E, other(p.side), Math.fround(fl));                                           // 0x70867c sub_6bb950(modstanderne, f)
    E.evSide(id, p.side, bl);                                                                 // 0x708697 (extra = antallet på banen / −1)
    f.ebx = f.s48 as GP | null;                                                               // 0x70869c
    return L708844(E, f);
  }
  // 0x7086a5: reduceret til −1/−2
  if (edi < 0 && edi > -3) {
    let ok = false;
    if (mn >= 0x50) ok = true;                                                                // 0x7086c9
    else if (mn >= 0x46 && s8(f.s12 as number) === 1) ok = true;                              // 0x7086ce
    else if (mn >= 0x3c && s8(f.s12 as number) === 1 && 1 - s8(f.s13 as number) === -2) ok = true;   // 0x7086da–0x7086f2
    if (ok) {
      const dx = w16(mn);
      const late = (dx >= 0x55 && dx < 0x5a) || dx >= 0x73;                                   // 0x7086f7–0x708707
      E.evSide(late ? 0x1fdb : 0x1fda, p.side, 0);                                            // 0x708723 PULLED_ONE_BACK_LATE / PULLED_ONE_BACK
      return L708844(E, f);
    }
  }
  return L70872d(E, f);
}
/** 0x70872d: fører på udebanemål (før 80. minut) */
function L70872d(E: ShotEnv, f: ShotFrame): void {
  if (f.s26 && minute(E) < 0x50) {                                                            // 0x70872d / 0x708750
    E.evSide(0x1fdc, f.p.side, 0);                                                            // 0x708765 LEAD_ON_AWAY_GOALS
    return L708830(E, f, Math.fround(1.45));                                                  // 0x708770
  }
  return L708844(E, f);
}
/** 0x70877a: omspark efter målet (param 5/6) – x4786/x4782 genskabes, holdets humør ×1,45, MUST_RETAKE, w39 og målstatistikken tilbage */
function L70877a(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, m = E.m;
  m.x4786 = 0; m.x4782 = 0;                                                                   // 0x708788 / 0x708798
  m.x4786 = (m.x4786 as number) + (f.s60 as number);                                          // 0x7087ac (gemt ved 0x702064)
  m.x4782 = (m.x4782 as number) + (f.s5c as number);                                          // 0x7087c4
  teamMood(E, p, Math.fround(1.45));                                                          // 0x7087d0 sub_6bb8d0(p, 1,45)
  E.ev1(0x20f7, p, p.side, 0);                                                                // 0x7087eb MUST_RETAKE
  p.w39 = w16(f.s58 as number);                                                               // 0x7087fa
  if (f.s17) undoGoalStats(p);                                                                // 0x7087fe–0x708823
  return go(E, f, 0x704aca);                                                                  // 0x708826: omsparket (afsnit R2)
}
const undoGoalStats = (p: GP) => {                                                            // 0x70880a / 0x708955
  p.goalWords[0] = w16((p.goalWords[0]) - 1); p.goalWords[1] = w16((p.goalWords[1]) - 1); p.goalWords[2] = w16((p.goalWords[2]) - 1);
  p.goalWords[3] = w16((p.goalWords[3]) - 1); p.goalWords[4] = w16((p.goalWords[4]) - 1);
  p.goals = ((p.goals - 1) & 0xff);
};
/** 0x70882b: konkurrencen (param 3/4) – modstanderne ×1,25 */
function L70882b(E: ShotEnv, f: ShotFrame): void { return L708830(E, f, Math.fround(1.25)); }
/** 0x708830: sub_6bb950(modstanderne, f) og videre til 0x708844 */
function L708830(E: ShotEnv, f: ShotFrame, fl: number): void {
  agitateSide(E, other(f.p.side), fl);                                                        // 0x70883f
  return L708844(E, f);
}
/** 0x708844: sidste chance for at annullere; ellers målet godkendes */
function L708844(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  if (E.victimSide() > -1) {                                                                  // 0x70884a (uden rand(3))
    const bl = disallow(E, f);                                                                // 0x708857–0x708887
    if (bl !== p.side) return L7088ed(E, f);                                                  // 0x708891
    return L708893(E, f);
  }
  return L70897e(E, f);
}
/** 0x708893: offeret var skyttens eget hold → HARSH_DECISION, evt. TEAM_ARGUES (rand(s13 − s12 + 3) > 0), humøret ×3 */
function L708893(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  E.evSide(0x20df, p.side, 0);                                                                // 0x7088a8 HARSH_DECISION (cl = skyttens side)
  if (E.rand(s8(f.s13 as number) - s8(f.s12 as number) + 3) > 0) E.evSide(0x20d9, p.side, 0);   // 0x7088bd / 0x7088dc
  return L7088e6(E, f);
}
function L7088e6(E: ShotEnv, f: ShotFrame): void { return L708934(E, f, Math.fround(3.0)); } // 0x7088e6 push 3,0
function L7088ed(E: ShotEnv, f: ShotFrame): void {
  const a = s8(f.s12 as number), b = s8(f.s13 as number);
  if (a !== b && a - 1 !== b) return L70892f(E, f);                                           // 0x7088f5–0x708902
  if (E.rand(0x28) !== 0) return L70892f(E, f);                                               // 0x708904
  return L708912(E, f);
}
function L708912(E: ShotEnv, f: ShotFrame): void {
  E.evSide(0x20d9, f.p.side, 0);                                                              // 0x70892a TEAM_ARGUES_WITH_REFEREE
  return L70892f(E, f);
}
function L70892f(E: ShotEnv, f: ShotFrame): void { return L708934(E, f, Math.fround(1.45)); } // 0x70892f push 1,45
/** 0x708934: skyttens hold ×f, skytten reagerer på dommeren (sub_716e10), målstatistikken tilbage; retur */
function L708934(E: ShotEnv, f: ShotFrame, fl: number): void {
  const p = f.p;
  teamMood(E, p, fl);                                                                         // 0x70893b sub_6bb8d0(p, f)
  E.reactToDecision(p);                                                                       // 0x708944 sub_716e10(p, 0)
  if (f.s17) undoGoalStats(p);                                                                // 0x708949–0x70896f
  return go(E, f, 0x704b02);                                                                  // 0x70897b ret 0x18 (samme som 0x704b02)
}
/** 0x70897e: målet står – keeperen rørte sig ikke; param 1: humør, karakterer, målet tælles og holdhistorierne */
function L70897e(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, m = E.m, k = f.ebx;
  if (f.s14 && !f.s20 && isKeeper(k)) E.ev1(0x20d5, k, (k as GP).side, 0);                   // 0x7089bb KEEPER_ROOTED_TO_HIS_SPOT
  if (f.a4 !== 1) return go(E, f, 0x708e39);                                                  // 0x7089c5
  teamMood(E, p, Math.fround(0.02));                                                          // 0x7089df sub_6bb8d0(p, 0,02)
  ratingSide(E, p.side, 0x96);                                                                // 0x7089f3 sub_6cf710(side, +150)
  ratingSide(E, other(p.side), -0x87);                                                        // 0x708a0c sub_6cf710(modstanderne, −135)
  m.goals[p.side]++;                                                                          // 0x708a31–0x708a3a engine+0xf5bd + 54·side ++ (holdblokkens [1])
  // 0x708a1d–0x708c00: holdhistorierne sub_6d4b70(side, id, ud) – den første, der gælder → 0x708d0b (70a860 med samme side)
  const own = p.side, opp = other(p.side);
  const list: [number, number][] = [[0x21a3, own], [0x21a4, own], [0x21a5, own], [0x21a6, opp], [0x21a7, opp], [0x21a8, opp], [0x21a9, opp], [0x21aa, own]];
  for (const [id, s] of list) {
    if (teamStoryApplies(E, s, id, null)) { f.push = [id, s, 0]; return go(E, f, 0x708d0b); }
  }
  const out = { v: f.s3c as number };                                                         // 0x708bee lea edx, [esp+0x3c]
  const hit = teamStoryApplies(E, own, 0x21ab, out);                                          // 0x708bf9 TEAM_MARCH_ON
  f.s3c = out.v;
  if (hit) { f.push = [0x21ab, own, f.s3c as number]; return go(E, f, 0x708d0b); }   // 0x708c02
  return go(E, f, 0x708c1c);                                                                  // 0x708c00 (afsnit R7: 0x21ac …)
}
