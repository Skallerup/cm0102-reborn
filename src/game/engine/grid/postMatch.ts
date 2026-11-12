// Originalens kamprapport efter slutfløjt (cm0102.exe 3.9.68, run_match_steps 0x6b98c0's slutning – afkodet 12/11-2026, runde 9c):
//
//   0x6d1cc0 (match_report)          prøvespillerlisten engine+0x478e → [0xb67dc8], så for hvert hold de 20 i kamptruppen: 0x6d26b0, de to
//                                    begivenheder til [0xb67dc8] (type 0xa "skiftet ud", type 0xb "temperament"), minutterne og holdets
//                                    karaktersnit; til sidst 0x6d3610 (managerens omdømme) og 0x6d3de0 (klubbens omdømme)
//   0x6d26b0 (player_report)         spillerens omdømme (spillerposten +9/+0xb/+0xd → MATCH_PLAYER +0x49/+0x47/+0x4b) og moralen
//                                    (0x7172d0 → MATCH_PLAYER +0x17)
//   0x6d3610 (manager_report)        managerens omdømme (ikke-spillerposten +8/+0xa/+0xc → holdets +2/+0/+4)
//   0x6d3de0 (club_report)           klubbens omdømme (club +0x80 → engine+0x1d6 + 2·side)
//   0x6d4a20 (referee_report)        dommerens karakter (1..10) til [0xb74340] (0x79ce10)
//
// Rækkefølgen i 0x6b98c0 (ved det almindelige slutfløjt 0x6ba94d): 0x6d0f80 (kampens spiller, gridMatch.ts manOfTheMatch6d0f80) →
// fixture +0x4b/+0x4c (samlet stilling) → 0x896290 (taktiklisten) → uden straffesparkskonkurrence 0x6d1cc0 → 0x896fe0 for menneskets klubber →
// 0x6d4a20. Alle tal fra 0x90cfc0 (rand) i den rækkefølge – kontrolleret tal for tal mod oraklet med scripts/lockstep-post.ts.
//
// Strukturerne er beskrevet ved originalens felter (ikke spillets): adapteren (adapter.ts) bygger dem af spillets data, låsetrinsscriptet af
// sporets dump. Pegere er "nøgler" (0 = NULL), så sammenligningerne (land = land, rival = modstander …) er originalens.
// Resultaterne skrives i de samme felter som originalen (PmPlayer.morale/w47/w49/w4b, PmTeamOut, clubRep) – spillet overfører dem bagefter.

import { crtPow } from '../crtMath';

export type PmRand = (n: number) => number;

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const ftol = (v: number) => Math.trunc(v);
const f32 = Math.fround;
/** idiv: kvotienten mod nul (division med 0 = originalens #DE – her 0) */
const idiv = (a: number, b: number) => (b === 0 ? 0 : Math.trunc(a / b) | 0);
/** /1000 som imul 0x10624dd3, sar 6 (afrunding mod nul) */
const div1000 = (v: number) => Math.trunc(v / 1000);
const div500 = (v: number) => Math.trunc(v / 500);

/** spillerposten (staff +0x61 = MATCH_PLAYER +0x6d): +5 CA, +9/+0xb/+0xd omdømmet (hukommelsens skala, 0..10000) */
export interface PmRec { ca: number; r9: number; rb: number; rd: number }

/** staffposten (MATCH_PLAYER +0x69) – kun de felter, rapporten læser */
export interface PmStaff {
  key: number;                 // pegeren (identitet; ≠ 0)
  id: number;                  // +0
  age: number;                 // +0x18 (s8)
  nation: number;              // +0x1a (landets nøgle, 0 = NULL)
  ambition: number;            // +0x57
  determination: number;       // +0x58
  pressure: number;            // +0x5a
  professionalism: number;     // +0x5b
  temperament: number;         // +0x5d
  rec: PmRec | null;           // +0x61
  /** +0x65: præferencerne – +4/+8/+0xc uvenner blandt klubberne, +0x10/+0x14/+0x18 yndlingsklubber (klubnøgler) */
  prefs: { disClubs: number[]; favClubs: number[] } | null;
}

/** klubposten (0x244 bytes) – de felter, rapporten læser */
export interface PmClub {
  key: number;                 // pegeren (identitet; ≠ 0)
  id: number;                  // +0
  rep: number;                 // +0x80 (s16)
  nation: number;              // +0x53 (landets nøgle, 0 = NULL)
  /** +0x69: sammenlignes med fixture +0x18 (hjemmebanen) */
  ground: number;
  /** +0x9b/+0x9f/+0xa3 og +0xa7/+0xab/+0xaf: klubbens uvenner og yndlinge blandt personerne (staffnøgler) – 0x547790 / 0x5477d0 */
  disStaff: number[]; favStaff: number[];
  /** +0xb3/+0xb7/+0xbb: rivalerne (klubnøgler) */
  rivals: number[];
  /** +0xcf: en person (staffnøgle, 0 = NULL) – spilleren selv springes over i 0x6d1cc0's første begivenhed */
  cf: number;
  /** 0x53b900: et landshold (id ≥ [0xae235c] − 2·[0xae2350]) */
  national: boolean;
  /** +0xd3 → +0x69: managerens ikke-spillerpost (prøvespillerlisten): +4 CA, +0x14, +0x17 (rå), staff-id'et (+0) */
  manager?: { id: number; ca: number; b14: number; b17: number } | null;
}

/** turneringen (fixture +0x14) */
export interface PmComp {
  rep: number;                 // +0x69 (s16)
  nation: number;              // +0x5d (landets nøgle)
  /** [0xb74318] ≠ 0 og 0x76d940 (de ni store landsholdsturneringer 0x9cf78c..) */
  major: boolean;
  /** 0x5c6710 ([0xae2c74]): turneringen er [0xae2c74]+4 eller id ≥ [0xae2378] − 0x7f */
  special: boolean;
}

/** kampposten (fixture, engine+0x4792) */
export interface PmFixture {
  id: number;                  // +0 (−2 = …)
  comp: PmComp | null;         // +0x14
  ground: number;              // +0x18
  home: PmClub; away: PmClub;  // +0x1c / +0x20
  w30: number; w32: number;    // +0x30 / +0x32 (runden)
  b3a: number;                 // +0x3a (1 venskabskamp, 2 liga, 4 pokal, 8 finale, 10 …)
  b40: number;                 // +0x40
  goals: [number, number];     // +0x43 / +0x44
}

/** MATCH_PLAYER (0x1be bytes) efter slutfløjtet – de felter, rapporten læser og skriver */
export interface PmPlayer {
  staff: PmStaff | null;       // +0x69
  /** +0x6d → +0xb (spillerposten; NULL = null) */
  recRb: number | null;
  goals: number;               // +0xc
  pensTaken: number;           // +0xd
  penGoals: number;            // +0xe
  b10: number;                 // +0x10
  morale: number;              // +0x17 (s8) – skrives af 0x7172d0
  ratingByte: number;          // +0x1b (s8) – den viste karakter 1..10
  minOn: number; minOff: number; minRed: number; minInj: number;   // +0x1f/+0x20/+0x21/+0x22 (s8, −1 = ingen)
  reds: number;                // +0x23
  yellows: number;             // +0x24
  w31: number;                 // +0x31 (s16)
  rating: number;              // +0x35 (s16, karakteren ×1000)
  condition: number;           // +0x4d (float)
  agitation: number;           // +0x1a2 (float)
  /** skrives af 0x6d26b0: +0x47 (← +0xb), +0x49 (← +9), +0x4b (← +0xd) */
  w47?: number; w49?: number; w4b?: number;
  /** +0x19 pladsen (prøvespillerlistens opslag: ≥ 0 = på banen) */
  slot?: number;
}

/** holdets post engine+0x9032 + 0xd0·side: +0x1b manageren (staff) → +0x69 ikke-spillerposten (+8/+0xa/+0xc omdømmet) */
export interface PmManager { nation: number; w8: number; wa: number; wc: number }

/** en post i listerne engine+0x478e / [0xb67dc8] (25 bytes) */
export interface PmItem {
  staff: number;               // +0 staff-id
  club: number;                // +4 klub-id
  d8: number;                  // +8
  b0c: number; b0d: number; b0e: number;   // +0xc / +0xd (side) / +0xe
  d0f: number;                 // +0xf
  type: number;                // +0x13 (word)
  rest?: number[];             // +0x15..+0x18 (uændret)
}

export interface PmEnv {
  /** engine+0: øjeblikkeligt resultat (ingen simulering) – 0 i gittermotoren */
  b0: number;
  /** [0xb74350] +0x10/+0x18/+0x20/+0x28: spillets karaktersum og -antal (klubkampe; landskampe) – cmPlayerData.ts cmRatingAvg */
  avg: [number, number, number, number];
  /** engine+0x8ed0 (uret ved slutfløjtet) */
  clock: number;
  /** engine+0x477a ≠ −1 (kampens spiller er fundet, 0x6d0f80) */
  momSet: boolean;
  /** 0x4cf5f0(staff, klub): kontrakten (+0x3d, +0x4f) eller null */
  contract(st: PmStaff, club: PmClub): { b3d: number; b4f: number } | null;
  /** [0xae2364]: staff-id'er herunder er databasens (højere = genererede) */
  staffLimit: number;
  /** [0xb67dc8] ≠ 0 (listen findes) */
  list: boolean;
  /** engine+0x478e's poster (prøvespillerne) – null = ingen liste */
  trials: PmItem[] | null;
  /** prøvespillerlisten slår op i [0xae23bc] (staff) og [0xae23b4] (klubber) */
  staffById?(id: number): { key: number; rb: number } | null;
  clubRepById?(id: number): number;
}

/** kampens spillere og hold (engine) */
export interface PmMatch {
  fx: PmFixture;
  /** de 20 i kamptruppen pr. side (indeks 0..19; null = tom plads) */
  players: [(PmPlayer | null)[], (PmPlayer | null)[]];
  managers: [PmManager | null, PmManager | null];
}

export interface PmTeamOut { w0: number; w2: number; w4: number }
export interface PmResult {
  /** 0x6d3610: holdets +0/+2/+4 (managerens +0xa/+8/+0xc efter kampen); null = ingen manager */
  managers: [PmTeamOut | null, PmTeamOut | null];
  /** 0x6d3de0: engine+0x1d6 + 2·side (klubbens +0x80 efter kampen); null = landshold (kaldes ikke) */
  clubRep: [number | null, number | null];
  /** posterne lagt i [0xb67dc8] (0x68d0d0) */
  items: PmItem[];
  /** holdenes karaktersnit (6d26b0/6d3610/6d3de0's femte argument) */
  teamAvg: [number, number];
}

// ---------------------------------------------------------------- fælles

/** [0xb74350]'s snit: +0x20/+0x28 (a7 ≠ 0) eller +0x10/+0x18; antal 0 → 6,8 */
const average = (env: PmEnv, a7: number) => {
  const [s1, n1, s2, n2] = env.avg;
  return a7 ? (n2 === 0 ? 6.8 : s2 / n2) : (n1 === 0 ? 6.8 : s1 / n1);
};

/** turneringens vægt (0x6d26b0/0x6d3610/0x6d3de0's første del): fixture −2 → 5; +0x40 → (modstanderens omdømme/500 + turneringens)/2; ellers turneringens
 *  byte – højst 20. `major` = 0x6d26b0's gren for de store landsholdsturneringer (højst 15 → 15). */
function compWeight(fx: PmFixture, opp: PmClub, withMajor: boolean): number {
  if (fx.id === -2) return 5;
  let cr: number;
  if (fx.b40) cr = s8(Math.trunc((div500(s16(opp.rep)) + s16(fx.comp?.rep ?? 0)) / 2));
  else if (withMajor && fx.comp?.major) {
    if (s16(fx.comp.rep) <= 15) return 15;
    cr = s8(fx.comp.rep);
  } else cr = s8(fx.comp?.rep ?? 0);
  return cr > 20 ? 20 : cr;
}
/** trunc(v/1000) + 16 som byte, mindst lo */
const repDiv = (v: number, lo: number) => { const d = s8(div1000(s16(v)) + 16); return d < lo ? lo : d; };
const inRange = (v: number, a: number, b: number) => v >= a && v <= b;
const W32_FINAL_26B0 = (w: number) => inRange(w, 0x43d, 0x448);
const W32_FINAL = (w: number) => inRange(w, 0x41f, 0x426);
const W30_SET = (w: number) => inRange(w, 0x78, 0x7c) || inRange(w, 0x82, 0x87) || inRange(w, 0x96, 0x9b);

// ---------------------------------------------------------------- 0x7172d0 (MATCH_PLAYER::adjust_morale)

/** 0x7172d0 (thiscall mp, byte d): moralen +0x17 ændres med d (mod 10 med sandsynligheden rand(21)/rand(11)), en karakter ≥ 7500 giver mindst
 *  trunc(karakter·0,004 − 20,5); 1..20. Med d = 0 og ingen kampens spiller (engine+0x477a = −1) kun, når karakteren > 7500 og moralen < 10.
 *  Giver om moralen ændredes. */
export function adjustMorale7172d0(mp: PmPlayer, d: number, momSet: boolean, rand: PmRand): boolean {
  const bl = s8(d);
  if (bl === 0 && !momSet && !(s16(mp.rating) > 7500 && s8(mp.morale) < 10)) return false;
  const m0 = s8(mp.morale);
  let al: number;
  if (bl > 0) {
    const edi = m0 + bl;
    if (edi > 10 && rand(21) < edi) al = s8(m0 + rand(bl + 1));                  // 0x717323 / 0x717331
    else al = s8(m0 + bl);
  } else if (bl < 0) {
    const edi = m0 + bl;
    if (edi < 10 && rand(11) > edi) al = s8(m0 + rand(bl - 1));                  // 0x717355 / 0x717363
    else al = s8(m0 + bl);
  } else al = m0;
  const cx = s16(mp.rating);
  if (cx >= 7500) {                                                             // 0x717384: mindst trunc(karakter·0,004 − 20,5)
    const q = cx * 0.004 - 20.5;
    al = s8(ftol(al > q ? al : q));
  }
  al = al < 1 ? 1 : al > 20 ? 20 : al;
  mp.morale = al;
  return al !== m0;
}

// ---------------------------------------------------------------- 0x6d26b0

/** 0x6d26b0(mp, staff, egen klub, modstander, fixture, karakter (float), a7 = engine+0, a8 = 1): omdømmet og moralen for én spiller */
export function playerReport6d26b0(mp: PmPlayer | null, st: PmStaff, own: PmClub, opp: PmClub, fx: PmFixture, a6: number, a7: number, a8: number,
  env: PmEnv, rand: PmRand): void {
  const rec = st.rec!;
  a6 = f32(a6);
  let L14 = 1, L18 = 1, L1c = 1, same = 0;
  let cr = compWeight(fx, opp, true);                                           // [esp+0x58]
  // 0x6d2762: høje karakterer dæmpes (float32) uden mål, uden +0x10, med en brændt straffe og med et rødt kort
  let f = a6;
  if (mp && !(a6 < 8.0)) {
    if (!(mp.goals & 0xff)) f = f32(a6 * f32(0.9090908765792847));
    if (!(mp.b10 & 0xff)) f = f32(f * f32(0.9523810148239136));
    if ((mp.pensTaken & 0xff) !== (mp.penGoals & 0xff)) f = f32(f * f32(0.9523810148239136));
    if (mp.reds & 0xff) f = f32(f * f32(0.9090908765792847));
  }
  let di = cr, crWord = cr;                                                     // di / [esp+0x34]
  const dB = s16(repDiv(rec.rb, 22) - di);                                      // [esp+0x38] (+0xb)
  let dA: number;                                                               // [esp+0x2c] (+9)
  let dD = 0;                                                                   // [esp+0x20] (+0xd)
  const homeNation = !own.national && ((fx.id === -2 && own.nation !== 0 && own.nation === st.nation) || (fx.comp && fx.comp.nation === st.nation) || own.nation === st.nation);
  if (own.national || homeNation) { same = 1; dA = s16(repDiv(rec.r9, 22) - di); }
  else { dA = s16(Math.trunc((s16(0xca - 10 * di) + s16(repDiv(rec.r9, 22) - di)) / 2)); if (dA < 4) dA = 4; }
  // 0x6d28dc: landsholdene og de store kampe – loftet af omdømmet (L14/L18/L1c) og vægten for verdensomdømmet
  const capRest = (v: number) => {                                              // 0x6d2b19 / 0x6d2d1b: L14 og L1c af v
    const w = v * 0.6666666666666666, wc = ftol(w < 5500 ? w : 5500);
    if (same) { L14 = ftol(v < 7000 ? v : 7000); L1c = wc; } else { L14 = wc; L1c = wc; }
  };
  if (own.national) {
    dD = s16(repDiv(rec.rd, 21) - di);
    if (fx.b3a === 10 && fx.comp?.major && s16(fx.comp.rep) >= 17 && !(f < 7.0) && s16(opp.rep) > 5500) {
      const big = (base: number, k: number, cap: number) => { let v = (s16(opp.rep) - base) * (f - k); if (!(v < cap)) v = cap; L1c = L14 = L18 = ftol(v); };
      if (inRange(s16(fx.w32), 0x41f, 0x426) || s16(fx.w30) === 0x8c) {
        const v = (s16(opp.rep) - 4500) * (f - 7.0);
        L18 = ftol(v < 7000 ? v : 7000); capRest(v);
      } else if (s16(fx.w30) === 0x14) big(4500, 6.5, 7500);
      else if (s16(fx.w30) === 0x78) big(4000, 6.5, 7750);
      else if (s16(fx.w30) === 0x82) big(4000, 6.5, 8000);
      else if (s16(fx.w30) === 0x96) big(4000, 6.0, 8500);
    }
  } else if (fx.b3a === 8) {
    if (W32_FINAL_26B0(s16(fx.w32))) {                                          // 0x6d2d8b: finalerne
      dD = s16(repDiv(rec.rd, 21) - di + 1);
      if (!(f < 8.0) && s16(opp.rep) > 5500) {
        const v = (s16(opp.rep) - 5500) * (f - 8.0);
        const a = ftol(v * 0.5555555555555556), b = ftol(v * 0.3333333333333333);
        L18 = a; L14 = same ? a : b; L1c = b;
      }
    } else if (W30_SET(s16(fx.w30))) {                                          // 0x6d2c76: turneringens egen vægt
      cr = s8(fx.comp?.rep ?? 0); crWord = cr;
      dD = s16(repDiv(rec.rd, 21) - cr);
      if (!(f < 7.5) && s16(opp.rep) > 5500) {
        const v = (s16(opp.rep) - 4500) * (f - 7.0);
        L18 = ftol(v < 7000 ? v : 7000); capRest(v);
      }
    } else dD = s16(0xca - 10 * di);
  } else dD = s16(0xca - 10 * di);
  // 0x6d2e44: afvigelsen fra spillets snit (negativ: −d²) → u = d·(cr/2 + 5)·50 lagt til de tre
  let d = a6 - average(env, a7);
  if (d < 0) d = d * Math.abs(d);
  const u = d * (cr * 0.5 + 5.0) * 50.0;
  const w9 = s16(rec.r9), wB = s16(rec.rb), wD = s16(rec.rd);
  let nA = s16(ftol(w9 + u)), nB = s16(ftol(wB + u)), nD = s16(ftol(wD + u));
  if (a8) {                                                                     // 0x6d2f19: mindst 250·cr·(karakter/snit) (to gange under snittet)
    let w = ftol((250 * cr * a6) / average(env, a7));
    if (d < 0) w = ftol((s16(w) * a6) / average(env, a7));
    w = s16(w);
    if (w > nB) nB = w; if (w > nA) nA = w; if (w > nD) nD = w;
  }
  // 0x6d3007: glidende snit
  const qB = idiv((dB - 1) * wB + nB, dB);
  const qA = idiv((dA - 1) * w9 + nA, dA);
  const qD = idiv((dD - 1) * wD + nD, dD);
  // 0x6d304e: moralen – rand(3) og rand(Determination) i 0x6d30b5/0x6d3105/0x6d313b, rand(klem(…, ±20)) i 0x6d317f
  const denom = wB > 1 ? wB : 1;
  const dh = s16(qB) - wB;
  let ax = s16(ftol((dh * 300.0) / denom + (a6 + 1.0) * 0.5));
  if (ax > 0) { const e = ax < dh ? ax : dh; ax = s16(rand(3) + e); }
  else if (ax < 0) {
    const y = ax * 1.5, z = y > dh ? y : dh;
    const r = rand(3);
    ax = s16(ftol(z - r));
  }
  // 0x6d3119 (begge grene): stadig negativ → delt med (rand(Determination) + 1)·0,25
  if (ax < 0) { const fa = f32(ax); const r2 = rand(s8(st.determination)) + 1; ax = s16(ftol(fa / (r2 * 0.25))); }
  const n = ax < -20 ? -20 : ax > 20 ? 20 : ax;
  const md = rand(n);
  if (mp) adjustMorale7172d0(mp, md, env.momSet, rand);
  // (uden mp: 0x544710(staff, md, 1) – kaldes ikke fra 0x6d1cc0)
  // 0x6d319e: grænserne – højst T = 300·cr + 4000 over det gamle, CA-båndet, ±(2 − v/10000)·k
  const fB = f32(2.0 - wB * 0.0001), fA = f32(2.0 - w9 * 0.0001), fD = f32(2.0 - wD * 0.0001);
  const T = s16(300 * crWord + 4000), ca = s16(rec.ca);
  const lo = 50 * ca - 3750, hi = 50 * ca + 2500;
  const band = (h: number, lo2: number, hi2: number) => (lo2 > h ? lo2 : hi2 < h ? hi2 : h);
  const bound = (h: number, old: number, fk: number, kLo: number, up: number) => {
    const fh = f32(h), L = f32(old) - fk * kLo;
    if (L > fh) return ftol(L);
    const U = up;
    return ftol(U < fh ? U : fh);
  };
  const mx = (a: number, b: number) => (a > b ? a : b);
  let hB = s16(qB) >= mx(T, wB) ? mx(T, wB) : s16(qB);
  hB = s16(band(hB, lo, hi));
  const finB = s16(bound(hB, wB, fB, 250, fB * 300 + f32(wB)));
  let hA = s16(qA) >= mx(T, w9) ? mx(T, w9) : s16(qA);
  hA = s16(band(hA, lo, hi));
  const finA = s16(bound(hA, w9, fA, 250, fA * 375 + f32(w9)));
  let hD = s16(qD) >= mx(T, wD) ? mx(T, wD) : s16(qD);
  hD = s16(band(hD, 50 * ca - 10000, 50 * ca + 1250));
  const finD = s16(bound(hD, wD, fD, 500, 100 * cr * fD + f32(wD)));
  // 0x6d33f2: klubkampe med vægt over 10 – de unge i en stor klub (kontraktens trupstatus +0x4f >> 4)
  let cx = finB;
  if (!own.national && cr > 10) {
    const c = env.contract(st, own);
    if (c) {
      let age = f32(s8(st.age)); if (19.0 < age) age = 19.0;
      const k = f32(crtPow(age * 0.05263157894736842, 3.0) * 0.5);
      const rep = s16(own.rep);
      let t: number;
      switch ((c.b4f & 0xff) >> 4) {
        case 1: t = ftol(rep * k * 1.2); break;
        case 2: t = ftol(rep * k * 1.1); break;
        case 3: t = ftol(rep * k); break;
        case 4: t = ftol(rep * k * 0.8); break;
        case 5: t = ftol(rep * k); break;
        default: t = 0;
      }
      t = s16(t);
      if (cx < t) cx = s16(ftol(t * 0.1 + cx * 0.9));
    }
  }
  // 0x6d3565: højst 10000, mindst lofterne L14/L18/L1c
  let dx = finA; if (dx > 10000) dx = 10000; if (dx < s16(L14)) dx = s16(L14);
  if (cx > 10000) cx = 10000; if (cx < s16(L18)) cx = s16(L18);
  let bx = finD; if (bx > 10000) bx = 10000; if (bx < s16(L1c)) bx = s16(L1c);
  if (mp) { mp.w4b = bx; mp.w47 = cx; mp.w49 = dx; }
  else { rec.rb = cx; rec.r9 = dx; rec.rd = bx; }
}

// ---------------------------------------------------------------- 0x6d3610

/** 0x6d3610(hold, egen klub, modstander, fixture, holdets snit (float), a6 = engine+0, a7 = 1): managerens omdømme → holdets +0/+2/+4 */
export function managerReport6d3610(mgr: PmManager | null, own: PmClub, opp: PmClub, fx: PmFixture, a5: number, a6: number, a7: number, env: PmEnv): PmTeamOut | null {
  if (!mgr) return null;
  a5 = f32(a5);
  const cr = compWeight(fx, opp, false);
  let bp = cr;
  let L20 = 2, L24 = 2;
  const dA = s16(repDiv(mgr.wa, 22) - bp);                                      // [esp+0x28]
  let d8: number;                                                               // [esp+0x10]
  const homeNation = !own.national && ((fx.id === -2 && own.nation !== 0 && own.nation === mgr.nation) || (fx.comp && fx.comp.nation === mgr.nation) || own.nation === mgr.nation);
  if (own.national || homeNation) { L24 = 1; d8 = s16(repDiv(mgr.w8, 22) - bp); }
  else { d8 = s16(Math.trunc((s16(0xca - 10 * bp) + s16(repDiv(mgr.w8, 22) - bp)) / 2)); if (d8 < 4) d8 = 4; }
  let dC: number;                                                               // si
  let crB = cr;                                                                 // bl (den byte, 0x6d38ce kan erstatte)
  if (own.national) { dC = s16(repDiv(mgr.wc, 21) - bp); L20 = 1; }
  else if (fx.b3a === 8) {
    L20 = 1;
    if (W32_FINAL(s16(fx.w32))) dC = s16(repDiv(mgr.wc, 21) - bp + 1);
    else if (W30_SET(s16(fx.w30))) { crB = s8(fx.comp?.rep ?? 0); bp = crB; dC = s16(repDiv(mgr.wc, 21) - bp); }
    else dC = s16(0xca - 10 * bp);
  } else dC = s16(0xca - 10 * bp);
  // 0x6d3911: (holdets snit − spillets snit)·1,3 (float) – ingen kvadrering her
  const d = (a5 - average(env, a6)) * f32(1.2999999523162842);
  const u = d * (crB * 0.5 + 5.0) * 50.0;
  const w8 = s16(mgr.w8), wA = s16(mgr.wa), wC = s16(mgr.wc);
  let n8 = s16(ftol(w8 + u)), nA = s16(ftol(wA + u)), nC = s16(ftol(wC + u));
  if (a7) {
    let w = ftol((250 * crB * a5) / average(env, a6));
    if (d < 0) w = ftol((s16(w) * a5) / average(env, a6));
    w = s16(w);
    if (w > nA) nA = w; if (w > n8) n8 = w; if (w > nC) nC = w;
  }
  const fA = f32(2.0 - wA * 0.0001), f8 = f32(2.0 - w8 * 0.0001), fC = f32(2.0 - wC * 0.0001);
  const qA = idiv((dA - 1) * wA + nA, dA);
  const q8 = idiv((d8 - 1) * w8 + n8, d8);
  const qC = idiv((dC - 1) * wC + nC, dC);
  const T = s16(300 * bp + 4000);
  const mx = (a: number, b: number) => (a > b ? a : b);
  const bound = (h: number, old: number, fk: number, kLo: number, up: number) => {
    const fh = f32(h), L = f32(old) - fk * kLo;
    if (L > fh) return ftol(L);
    return ftol(up < fh ? up : fh);
  };
  const hA = s16(qA) >= mx(T, wA) ? mx(T, wA) : s16(qA);
  let rA = s16(bound(hA, wA, fA, 250, fA * 300 + f32(wA)));
  const h8 = s16(q8) >= mx(T, w8) ? mx(T, w8) : s16(q8);
  let r8 = s16(bound(h8, w8, f8, 250, f8 * 375 + f32(w8)));
  const hC = s16(qC) >= mx(T, wC) ? mx(T, wC) : s16(qC);
  let rC = s16(bound(hC, wC, fC, 500, 100 * crB * fC + f32(wC)));
  // 0x6d3cf1: lofterne 400·cr/L24 (+8) og /L20 (+0xc), mindst det gamle
  const c400 = 400 * crB;
  const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
  let cap = s16(clamp(idiv(c400, L24), 5000, 10000)); if (!(cap > w8)) cap = w8;
  if (r8 > cap) r8 = cap; if (r8 < 1) r8 = 1;
  cap = s16(clamp(c400, 5000, 10000)); if (!(cap > wA)) cap = wA;
  if (rA > cap) rA = cap; if (rA < 1) rA = 1;
  cap = s16(clamp(idiv(c400, L20), 3000, 10000)); if (!(cap > wC)) cap = wC;
  if (rC > cap) rC = cap; if (rC < 1) rC = 1;
  return { w0: rA, w2: r8, w4: rC };
}

// ---------------------------------------------------------------- 0x6d3de0

/** 0x6d3de0(engine, side, holdets snit (float), a4 = engine+0, a5 = 1): klubbens omdømme → engine+0x1d6 + 2·side */
export function clubReport6d3de0(side: 0 | 1, fx: PmFixture, a3: number, a4: number, a5: number, env: PmEnv): number {
  a3 = f32(a3);
  const own = side ? fx.away : fx.home, opp = side ? fx.home : fx.away;
  let bl = compWeight(fx, opp, false);
  let di: number, si: number;
  if (own.national) { di = bl; si = s16(repDiv(own.rep, 21) - di); }
  else if (fx.b3a === 8 && W32_FINAL(s16(fx.w32))) { di = bl; si = s16(repDiv(own.rep, 21) - di + 1); }
  else if (fx.b3a === 8 && W30_SET(s16(fx.w30))) { bl = s8(fx.comp?.rep ?? 0); di = bl; si = s16(repDiv(own.rep, 21) - di); }
  else { di = bl; si = s16(0xca - 10 * di); }
  // 0x6d4015: afvigelsen (float), negativ → −d² (float)
  let d = f32(a3 - average(env, a4));
  if (d < 0) d = f32(Math.abs(d) * d);
  const rep = s16(own.rep);
  let n = s16(ftol((bl * 0.5 + 5.0) * d * 50.0 + rep));
  if (a5) {
    let w = ftol((250 * bl * a3) / average(env, a4));
    if (d < 0) w = ftol((s16(w) * a3) / average(env, a4));
    w = s16(w);
    if (w > n) n = w;
  }
  const fR = 2.0 - rep * 0.0001;
  const q = idiv((si - 1) * rep + n, si);
  const T = s16(300 * di + 4000);
  const lim = T > rep ? T : rep;
  const h = s16(q) >= lim ? lim : s16(q);
  // 0x6d41bc: k = 5·cr·fR som float32 ([esp+0x20]), omdømmet som float32 ([esp+0x18]); L og U regnes i double af de to
  const k = f32(5 * bl * fR), fh = f32(h), L = f32(rep) - k;
  let r: number;
  if (L > fh) r = ftol(L);
  else { const U = k + f32(rep); r = ftol(U < fh ? U : fh); }
  r = s16(r);
  return r > 10000 ? 10000 : r < 1 ? 1 : r;
}

// ---------------------------------------------------------------- 0x6d1cc0

/** 0x6d1cc0(engine): prøvespillerlisten, spillernes rapport (0x6d26b0), begivenhederne til [0xb67dc8], holdenes snit, managerens og klubbens
 *  omdømme. Skriver i spillerne (morale/w47/w49/w4b) og giver holdenes og klubbernes resultater. */
export function matchReport6d1cc0(M: PmMatch, env: PmEnv, rand: PmRand): PmResult {
  const fx = M.fx, items: PmItem[] = [];
  const out: PmResult = { managers: [null, null], clubRep: [null, null], items, teamAvg: [0, 0] };
  // 0x6d1cce: prøvespillerne (engine+0x478e → [0xb67dc8])
  if (env.trials && env.list && fx.b40 && env.trials.length > 0) trialList(M, env, rand, items);
  let avgD = 0;                                                                // [esp+0x30] (double) – gammel værdi, når holdet ingen minutter har
  for (const side of [0, 1] as const) {
    const own = side ? fx.away : fx.home, opp = side ? fx.home : fx.away;
    let sum = 0, wsum = 0;
    for (let i = 0; i < 20; i++) {
      const mp = M.players[side][i];
      if (!mp) continue;
      if (i > 10 && s8(mp.minOn) === -1) continue;                              // 0x6d20b3: bænken, der ikke kom ind
      const st = mp.staff;
      if (st && mp.recRb !== null && st.id < env.staffLimit) {
        playerReport6d26b0(mp, st, own, opp, fx, s8(mp.ratingByte), env.b0, 1, env, rand);
        if (env.list) events(mp, st, own, opp, side, fx, env, rand, items);
      }
      // 0x6d251b: minutterne (startere: udvist/skiftet ud/uret; indskiftede minus indskiftningen)
      let al: number;
      if (env.b0 && i < 11) al = 90;
      else if (i < 11) al = s8(mp.minRed) > -1 ? s8(mp.minRed) : s8(mp.minOff) > -1 ? s8(mp.minOff) : s8(Math.trunc(s16(env.clock) / 11));
      else {
        const cl = s8(mp.minOn);
        if (cl === -1) continue;
        al = s8((s8(mp.minRed) > -1 ? s8(mp.minRed) : s8(mp.minOff) > -1 ? s8(mp.minOff) : s8(Math.trunc(s16(env.clock) / 11))) - cl);
      }
      if (al !== 0) { sum += al; wsum += s8(mp.ratingByte) * al; }
    }
    if (sum !== 0) {
      avgD = wsum / sum;
      avgD = fx.ground === own.ground ? avgD - 0.1 : avgD + 0.2;                 // 0x6d25e7: fixture +0x18 = klubbens +0x69 (hjemmebane)
    }
    const avgF = f32(avgD);
    out.teamAvg[side] = avgF;
    out.managers[side] = managerReport6d3610(M.managers[side], own, opp, fx, avgF, env.b0, 1, env);
    if (!own.national) out.clubRep[side] = clubReport6d3de0(side, fx, avgF, env.b0, 1, env);
  }
  return out;
}

/** 0x6d2117–0x6d2512: de to begivenheder til [0xb67dc8] efter spillerens rapport */
function events(mp: PmPlayer, st: PmStaff, own: PmClub, opp: PmClub, side: 0 | 1, fx: PmFixture, env: PmEnv, rand: PmRand, items: PmItem[]): void {
  if (own.national || !fx.b40) return;
  const c = env.contract(st, own);
  // type 0xa: skiftet ud (ikke skadet) med spilletid i kontrakten, omdømme over 4250 – agitation, temperament, kondition, ambition/professionalisme
  if (c && st.key !== own.cf && fx.comp && !fx.comp.special && s8(mp.minOff) !== -1 && s8(mp.minInj) === -1 && s8(c.b3d) > 0 && s16(mp.recRb ?? 0) > 4250 && fx.b40) {
    const r1 = rand(ftol(f32(mp.agitation))), r2 = rand(100);                     // 0x6d2249 / 0x6d2252
    if (r1 > r2) {
      const r3 = rand(s8(st.temperament)), r4 = rand(10);                       // 0x6d226a / 0x6d2273
      if (r3 < r4) {
        const r5 = rand(1500) + 7500;                                           // 0x6d228f
        if (r5 < f32(mp.condition)) {
          const bl = s8(st.professionalism);
          if (bl < 6 && s8(st.ambition) > 10) {
            const r6 = rand(s8(st.ambition)), r7 = rand(bl);                    // 0x6d22cd / 0x6d22d8
            if (r7 < r6) items.push({ staff: st.id, club: own.id, d8: 0x4000000, b0c: 0, b0d: side, b0e: 0, d0f: -1, type: 0xa });
          }
        }
      }
    }
  }
  // type 0xb: modstanderen (rival +10, klubbens yndling/uven ±10, spillerens yndlings-/uvenklub +10/−20) mod temperamentet
  let ebp = -s16(mp.w31);
  if (own.rivals.includes(opp.key)) ebp += 10;
  if (opp.favStaff.includes(st.key)) ebp += 10;
  else if (opp.disStaff.includes(st.key)) ebp -= 10;
  if (st.prefs && st.prefs.favClubs.includes(opp.key)) ebp += 10;
  else if (st.prefs && st.prefs.disClubs.includes(opp.key)) ebp -= 20;
  if (s8(st.professionalism) < 6 && s8(st.temperament) < 10) {
    const r8 = rand(100 * (s8(st.pressure) * s8(st.professionalism) * s8(st.temperament) + 20)), r9 = rand(ebp + 50);   // 0x6d24a3 / 0x6d24ae
    if (r8 < r9) items.push({ staff: st.id, club: own.id, d8: 0, b0c: 0, b0d: side, b0e: 0, d0f: -1, type: 0xb });
  }
}

/** 0x6d1d1e–0x6d205c: engine+0x478e's poster – type 0x82 videre, 0x1e (prøvespiller: resultatet og managerens vurdering), ellers spillerens kamp */
function trialList(M: PmMatch, env: PmEnv, rand: PmRand, items: PmItem[]): void {
  const fx = M.fx;
  const push = (it: PmItem) => items.push({ ...it });
  for (const it of env.trials!) {
    const type = s16(it.type);
    if (type === 0x82) { push(it); continue; }
    if (type === 0x1e) {
      const st = env.staffById?.(it.staff) ?? null;
      const clubRep = s16(env.clubRepById?.(it.club) ?? 0);
      if (it.b0d) {
        const hg = s8(fx.goals[0]), ag = s8(fx.goals[1]);
        if (ag > hg) continue;
        if (ag === hg && !(s16(fx.home.rep) < s16(fx.away.rep) * 0.7)) continue;
        const mg = fx.away.manager;
        if (!mg) continue;
        const r = rand(s8(staffShown544410(mg.ca, s8(mg.b17)))), r20 = rand(20);   // 0x6d1dc8 / 0x6d1dd1
        if (r > r20 && s8(mg.b14) > 5) { push({ ...it, b0e: 1, d0f: mg.id }); continue; }
        const di = s16(st?.rb ?? 0);
        let ebx = clubRep - rand(1000);                                         // 0x6d1e22
        ebx += rand(1000);                                                      // 0x6d1e4b
        if (di > ebx || di > 7000) push({ ...it, b0e: 0, d0f: -1 });
      } else {
        const hg = s8(fx.goals[0]), ag = s8(fx.goals[1]);
        if (ag < hg) continue;
        if (ag === hg && !(s16(fx.away.rep) < s16(fx.home.rep) * 0.6)) continue;
        const mg = fx.home.manager;
        if (!mg) continue;
        const r = rand(s8(staffShown544410(mg.ca, s8(mg.b17))));               // 0x6d1ee4
        if (r > 5 && s8(mg.b14) > 5) { push({ ...it, b0e: 1, d0f: mg.id }); continue; }
        const dx = s16(st?.rb ?? 0);
        if (!(dx > clubRep)) { push(it); continue; }
        if (rand(4) !== 0) { push(it); continue; }                              // 0x6d1f52
        push({ ...it, b0e: 0, d0f: -1 });
      }
      continue;
    }
    // andre: spillerens kamp (MATCH_PLAYER med staffposten og plads ≥ 0)
    const st = env.staffById?.(it.staff) ?? null;
    if (!st) continue;
    let mp: PmPlayer | null = null;
    for (const side of [0, 1] as const) {
      for (const q of M.players[side]) if (q && q.staff && q.staff.key === st.key && (q.slot ?? -1) >= 0) { mp = q; break; }
      if (mp) break;
    }
    if (!mp) continue;
    if (type === 6) { if ((mp.yellows & 0xff) === 2 || (mp.reds & 0xff)) push({ ...it, b0e: 0, d0f: -1 }); continue; }
    if (s8(mp.ratingByte) >= 7) continue;
    if (rand(s8(mp.morale)) === 0) push({ ...it, b0e: 0, d0f: -1 });          // 0x6d201f
  }
}

/** 0x544410(ikke-spillerpost, rå): display((CA + 2·rå)·0,05 + 10) – roleScore.ts staffShown */
function staffShown544410(ca: number, raw: number): number {
  const t = (s16(ca) + 2 * raw) * 0.05 + 10;
  const v = (t * t * 0.1 + t) * (1 / 3) + 0.5;
  return v <= 1 ? 1 : v >= 20 ? 20 : Math.trunc(v);
}

// ---------------------------------------------------------------- 0x6d4a20

/** 0x6d4a20 (thiscall engine): dommerens karakter – engine+0xf5ba/1000, −2/−1/+1 efter de røde kort (+0xf5cb + +0xf601), ±1 efter de gule
 *  (+0xf5cc + +0xf602); under 4: rand(500) ≠ 0 → 4; over 8: rand(25) ≠ 0 → 8; 1..10. null = ingen dommer eller turnering 0x5c6710. */
export function refereeReport6d4a20(i: { ref: number | null; comp: PmComp | null; mark: number; reds: [number, number]; yellows: [number, number] }, rand: PmRand): { ref: number; reds: number; yellows: number; score: number } | null {
  if (i.ref === null || i.ref === -1 || !i.comp || i.comp.special) return null;
  const cl = s8(i.reds[0] + i.reds[1]), bl = s8(i.yellows[0] + i.yellows[1]);
  let dl = s8(div1000(s16(i.mark)));
  if (cl > 2) dl = s8(dl - 2); else if (cl > 1) dl = s8(dl - 1); else if (cl === 0) dl = s8(dl + 1);
  if (bl > 5) dl = s8(dl - 1); else if (bl < 3) dl = s8(dl + 1);
  let score = dl;
  if (dl < 4) { if (rand(500) !== 0) score = 4; else score = clampScore(dl); }
  else if (dl > 8) { if (rand(25) !== 0) score = 8; else score = clampScore(dl); }
  else score = clampScore(dl);
  return { ref: i.ref, reds: cl & 0xff, yellows: bl & 0xff, score };
}
const clampScore = (dl: number) => (dl < 1 ? 1 : dl > 10 ? 10 : dl);
