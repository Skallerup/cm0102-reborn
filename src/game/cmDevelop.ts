// Originalens spillerudvikling: udviklingsblokken i den daglige staff-opdatering 0x5ce2d0 (game_daily_staff_update, 0x5d38f9–0x5d578d) i
// cm0102.exe 3.9.68 – afkodet 12/11-2026, noten ~/cm0102-engine/notes/cm-development.md. Kun den originale database i ægte tilstand (cmActive);
// erstatter training.ts' develop() for spillere med de interne egenskaber (Player.cmInt). Kontrol mod den instrumenterede original:
// scripts/dv-trace-check.ts (match_trace.c RECOMP_DV_TRACE: D0/Dh/Dr/D1/D2).
//
// Tre gange om året pr. spiller (dag i året = staff-id mod 365, +120, +240 – mod 365, 0 = 1/1):
//   1. personligheden (rand(10) = 0): Ambition, Loyalty, Determination, Pressure, Professionalism, Temperament, Sportsmanship ±1/±2;
//   2. "toppen" (31; målmænd 33 – sic: D-evnen er altid ≥ 1, så de andre grene er døde) mod alderen: f = (top − alder)·0,25 før toppen, ellers
//      top − alder (evt. rand(10f)·0,1); omdømmet falder efter toppen (×0,975^−f / 0,95^−f, over 41 ×0,875, over 45 → 1) og stiger under 22 år;
//   3. spilletiden og karaktererne (PlayerStats 0x7c1e30: kategori 6 kampe/karakter, venskabskampe vægtet efter alderen) og PA²·7,5e−5 → to
//      indeks i tabellen 0x9cd21c (−15 … 14): T (CA-ændringens loft) og L (fysikkens); træthed (0x62c3d0), skade (+0x2c), klubbens træningsanlæg
//      +0x7f, managerens Working with Youngsters, trænernes Coaching/Motivating/Discipline/Man Management, divisionens omdømme ganger T (2..25);
//      Professionalism og alderen (staff-id mod 4) flytter T; CA += rand(T), loft af klubbens/divisionens omdømme og PA (0x5d4ad2);
//   4. egenskaberne: efter toppen fysikken med rand(L)/m (m af Natural Fitness), Reflexes rand(T), Creativity/Positioning ×1,1; før toppen
//      Consistency/Leadership/Versatility/Important Matches rand(3L)/10, Stamina/Strength (træningens fysik-effekt), Anticipation/Decisions rand(T);
//      fra 30 år aldringen pr. aldersgruppe (30–32, 33–34, 35–37, 38+);
//   5. re-centreringen 0x538bc0 (cmTraining.ts normaliseRec) og 0x547f90 (forholdene falmer – cmRelations.ts).
// Nyheden om træningen (0x5d499a–0x5d4ace: menneskets klub, CA-spring over rand(20), news_post_training_report) er ikke porteret – kun rand(20).
// Tilfældighederne trækkes af en egen talrække (cmRand) pr. spiller og dag – spillets rng røres ikke.
import type { GameState, Player, Staff } from './types';
import { ATTRS } from './attributes';
import { ageOn } from './dates';
import { cmActive, cmRand, clubRepMem, statAvg } from './cmPlayerData';
import { isHumanClub } from './humans';
import { displayFromX, intrinsicOf } from './playerInit';
import { type CmRec, type CmTrainEntry, nibble, normaliseRec, recInto, recOf, cmTrainWeekTick } from './cmTraining';
import { addFavClub, fadeRelations, removeFavClub } from './cmRelations';

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const f32 = Math.fround;
const idiv = (a: number, b: number) => Math.trunc(a / b);
/** clamp_char_sum 0x5d61d0(v, d, min, max): s8(v) + s8(d) inden for [min, max] */
const ccs = (v: number, d: number, lo: number, hi: number) => { const s = s8(v) + s8(d); return s < lo ? lo : s > hi ? hi : s; };
/** tabellen 0x9cd21c (13 ord) */
export const DEV_TABLE = [-15, -13, -11, -9, -8, -6, -4, 5, 8, 10, 12, 13, 14];

/** personligheden i staff-posten (+0x57 Ambition, +0x58 Determination, +0x59 Loyalty, +0x5a Pressure, +0x5b Professionalism, +0x5c Sportsmanship,
 *  +0x5d Temperament) */
export interface DevPers { amb: number; det: number; loy: number; pres: number; prof: number; sport: number; temp: number }
/** en træners ikke-spillerpost: +4 CA og de rå bytes +0x10 Coaching, +0x11 Coaching Goalkeepers, +0x14 Discipline, +0x19 Man Management,
 *  +0x1b Motivating, +0x22 Working with Youngsters (vist = 0x544410: display(CA + 2·rå)) */
export interface DevCoach { ca: number; b10: number; b11: number; b14: number; b19: number; b1b: number; b22: number }
export interface DevClub {
  /** club +0x7f træningsanlæg, +0x80 omdømme, divisionens (+0x57) club_comp +0x69 (null = ingen division) */
  fac: number; rep: number; div: number | null;
  /** 0x600a50: en menneskeklub */
  human: boolean;
  /** managerens (+0xcf) +0x22 (null = ingen manager/ikke-spillerpost) */
  mgr22: number | null;
  /** assistenten (+0xd3) og de fem trænere (+0x19f…) – null = tom plads */
  coaches: (DevCoach | null)[];
}
export interface DevIn {
  /** forholdene (cmRelations.ts): 0x547d90(staff, klub, flag) og 0x547f50(staff, klub) – personlighedens Loyalty 20 / 1 */
  rel?: { favClub: (flag: number) => void; unfavClub: () => void };
  /** staff-id (originalens nummer) og alder (staff +0x18) */
  id: number; age: number;
  club: DevClub | null;
  /** PlayerStats 0x7c1e30: kategori 6 kampe, kategori 6 karakter, kategori 1 karakter, kategori 1 kampe (float) og spillets karaktersnit 0x5d5a60 */
  stats: [number, number, number, number]; mean: number;
  /** 0x62c3d0 trætheden og den nuværende skades +0x2c (0x62ed70; null = ingen skade) */
  fatigue: number; injury: number | null;
  /** træningspostens område 0 (+3 lav nibble) */
  train0: number;
  /** kun til kontrollen (scripts/dv-trace-check.ts): mellemregningerne */
  dbg?: (k: string, v: number) => void;
}
const rating = (c: DevCoach, v: number) => displayFromX(c.ca + 2 * s8(v));

/** 0x5d38f9–0x5d5777: udviklingen på spillerposten `r` og personligheden `P` (uden 0x538bc0). Returnerer T (CA-ændringens grænse). */
export function developCore(i: DevIn, r: CmRec, P: DevPers, rand: (n: number) => number): number {
  const b = r.b, age = s8(i.age);
  // 0x5d3a92: toppen [esp+0x27]
  let peak = 31;
  if (b[0x15] >= 15 || b[0x14] >= 15) peak = 28; else if (b[0x13] >= 15) peak = 29; else if (b[0x12] >= 15) peak = 30;
  if (b[0x0f] === 20) peak = 33; else if (b[0x10] >= 15 || b[0x11] !== 0) peak = 31;
  // 0x5d3af0: personligheden
  if (rand(10) === 0) {
    if (age < 25) { if (P.amb < 20 && rand(3) === 0) P.amb++; }
    else if (age > 25 && P.amb > 1 && rand(3) === 0) P.amb--;
    if (rand(4) === 0) {
      if (rand(2) === 0) { if (P.loy < 20) P.loy++; else { const fl = rand(2); i.rel?.favClub(fl); } }   // 0x5d3b77: 0x547d90(staff, klub, rand(2))
      else if (P.loy > 1) P.loy--;
      else i.rel?.unfavClub();                                                 // 0x5d3b8e: 0x547f50(staff, klub)
    }
    if (rand(4) === 0) { if (rand(2) === 0) { if (P.det < 20) P.det++; } else if (P.det > 1) P.det--; }
    if (rand(4) === 0) {
      if (rand(2) === 0) {
        if (P.pres < 20) { if (age > 22 && P.prof > 10 && P.pres < 10 && r.rep[1] > 6750) P.pres += 2; else if (P.prof > 5) P.pres++; }
      } else if (P.pres > 1) { if (P.pres > 2 && age < 21 && r.rep[1] > 5250) P.pres -= 2; else if (P.prof < 15) P.pres--; }
    }
    if (rand(4) === 0) {
      if (rand(2) === 0) { if (P.prof < 20) P.prof += P.prof < 10 && age > 28 ? 2 : 1; }
      else if (P.prof > 1) P.prof -= i.club && P.prof > 2 && age < 23 && r.rep[1] > 4250 && i.club.rep < r.rep[1] ? 2 : 1;
    }
    if (rand(4) === 0) { if (rand(2) === 0) { if (P.temp < 20) P.temp++; } else if (P.temp > 1) P.temp--; }
    if (rand(4) === 0) { if (rand(2) === 0) { if (P.sport < 20) P.sport++; } else if (P.sport > 1) P.sport--; }
  }
  // 0x5d3d09: f
  const dAge = peak - age;
  let f = f32(dAge > 0 ? dAge * 0.25 : dAge);
  if (f < 0) {
    if (rand(s8(b[0x34])) > 14) f = f32(rand(Math.trunc(f * 10)) * f32(0.1));
    if (age > 45) { r.rep[1] = 1; r.rep[0] = 1; r.rep[2] = 1; }
    else if (age > 41) { r.rep[1] = s16(Math.trunc(r.rep[1] * 0.875)); r.rep[0] = s16(Math.trunc(r.rep[0] * 0.875)); r.rep[2] = s16(Math.trunc(r.rep[2] * 0.75)); }
    else if (f < -3) { r.rep[1] = s16(Math.trunc(r.rep[1] * 0.925)); r.rep[0] = s16(Math.trunc(r.rep[0] * 0.925)); r.rep[2] = s16(Math.trunc(r.rep[2] * 0.825)); }
    else {
      const e = f32(-f), k = Math.pow(0.975, e);
      r.rep[1] = s16(Math.trunc(r.rep[1] * k)); r.rep[0] = s16(Math.trunc(r.rep[0] * k)); r.rep[2] = s16(Math.trunc(r.rep[2] * Math.pow(0.95, e)));
    }
  }
  // 0x5d3eba: spilletiden og karaktererne
  const [s1, s2, s3, s4] = i.stats.map(f32) as [number, number, number, number];
  let qE = s4 * ((f * 25 + 50) * 0.01);
  if (!(qE <= 100)) qE = 100; else if (!(qE > 0)) qE = 0;
  const q = f32(qE), AE = qE + s1, A = f32(AE), mean = i.mean;
  let R: number;
  if (AE === 0) R = mean - 0.25;
  else { const num = q * s3 + s2 * s1; R = AE < 20 ? ((num / AE) * AE + (20 - AE) * mean) * 0.05 : num / AE; }
  let flag = 0, X = R;
  if (f > 0) {
    X = f32(s1 * f * 0.01 + R);                                                 // [esp+0x28]: karakteren, løftet af alderen og kampene
    const s3n = f32(q * f32(0.5) + s1);
    if (rand(10) + 5 < s3n) flag = 1;
    if (s1 !== 0 && s8(b[0x3c]) < 10 && P.prof > 5 && P.prof > rand(26)) flag = s8(flag + 1);
  }
  if (age < 22) {
    const k = A > 5 ? 1.025 : 1.01;
    r.rep[1] = s16(Math.trunc(r.rep[1] * k)); r.rep[0] = s16(Math.trunc(r.rep[0] * k));
  }
  // 0x5d40eb: D = (karakteren − spillets snit)·4,5 – gemt i [esp+0x60] (oven i A, sic: push 0xa forskyder stakken)
  const D = f32((X - mean) * 4.5);
  const r1 = rand(10), r2 = rand(10);
  const N = f32(f32(r1 * 0.05) - r2 * 0.05);
  const Pp = f > 0 ? Math.pow(r.pa, 2) * 7.5e-5 : 0;
  let hi = Math.trunc(Pp + N + D + f + 7), lo = Math.trunc(N + f + 6.5);
  hi = hi > 12 ? 12 : hi < 0 ? 0 : hi; lo = lo > 12 ? 12 : lo < 0 ? 0 : lo;
  let T = DEV_TABLE[hi];
  const L = Math.max(-8, DEV_TABLE[lo]);
  i.dbg?.('f', f); i.dbg?.('A', A); i.dbg?.('R', R); i.dbg?.('D', D); i.dbg?.('N', N); i.dbg?.('hi', hi); i.dbg?.('lo', lo); i.dbg?.('T0', T);
  // 0x5d41f3: trætheden
  const fat = s16(i.fatigue);
  if (fat < -500 - rand(1000)) {
    if (age > 28) flag = s8(flag - rand(3)); else if (age > 24) flag = s8(flag - rand(2));
  } else if (fat > rand(750) + 750) {
    if (f > 0 && fat > rand(200) + 1000) {
      T = s16(T - rand(Math.trunc(f * 25)));
      const fl = age < 19 ? -8 : age < 23 ? -5 : age < 30 ? -3 : -20;
      if (T < fl) T = fl;
    }
    flag = s8(flag - rand(3));
  }
  // 0x5d4320: skaden
  let injured = false;
  if (i.injury !== null && rand(s16(i.injury)) > 30) {
    T = rand(-5);
    if (rand(10) === 0) flag = s8(flag - rand(2));
    injured = true;
  }
  // 0x5d4384: klubben, trænerne og divisionen ganger T
  if (T > 0) {
    const c = i.club;
    if (!c) T = Math.trunc(T * 0.2);
    else {
      let K = f32(((c.fac !== 0 ? s8(c.fac) * 0.03759398496240601 : s16(c.rep) * 7.518796992481203e-5) + 0.75) * f32(0.5));
      K = !c.human && c.mgr22 !== null ? f32((s8(c.mgr22) * 0.03759398496240601 + 0.75) * K) : f32(K * f32(1.31));
      let ed: DevCoach | null = null;
      for (let k = -1; k < 5; k++) {
        if (k === -1) ed = c.coaches[0] ?? null;
        else if (c.coaches[k + 1]) ed = c.coaches[k + 1];                      // tom plads: den forrige tæller igen (sic)
        if (!ed) continue;
        let bl = s8(rating(ed, b[0x0f] === 20 ? ed.b11 : ed.b10));
        if (rating(ed, ed.b1b) > 15) bl = s8(bl + rand(3));
        if (P.prof < 6) { if (s8(ed.b14) < 6) bl = s8(bl - 1 - rand(5)); else if (s8(ed.b14) < 15) bl = s8(bl - 1); }
        if (P.pres < 6 && s8(ed.b14) > 10) { if (rating(ed, ed.b19) < 6) bl = s8(bl - 1 - rand(5)); else if (rating(ed, ed.b19) < 15) bl = s8(bl - 1); }
        const x = age < 20 ? (bl + 2 * s8(ed.b22)) * 0.33 : age < 23 ? (s8(ed.b22) + 2 * bl) * 0.33 : bl;
        K = f32((x * 0.018796992481203006 + 0.875) * K);
        i.dbg?.('Kc' + k, K);
      }
      let m = (c.div !== null ? s16(c.div) * 0.03257328990228013 : s16(c.rep) * 6.514657980456026e-5) + 0.5;
      if (m > 1) m = 1;
      K = f32(m * K);
      if (rand(5) === 0) K = 1;
      const Kc = K < 0.1 ? 0.1 : K > 3 ? 3 : K;
      i.dbg?.('K', Kc);
      let v = s16(Math.trunc(T * Kc));
      if (T - 5 > v) v = T - 5; else if (T + 5 < v) v = T + 5;
      T = v < 2 ? 2 : v > 25 ? 25 : v;
    }
  }
  // 0x5d46b1: Professionalism og alderen (staff-id mod 4)
  const m4 = i.id % 4;
  if (age < 24 + m4 && T < 0 && rand(P.prof) !== 0) T = rand(T);
  else if (age < 30 && P.prof > 10 && rand(P.prof) > rand(200)) {
    const al = s8(rand(20) + (T & 0xff));
    const ed = al > 25 ? 25 : al;
    if (!(T > ed)) T = al > 25 ? 25 : al;
  } else if (age > 26 + m4 && P.prof < 6 && rand(P.prof + 6) === 0 && rand(P.prof + 6) === 0) {
    const cl = s8((T & 0xff) - rand(20));
    const ed = cl < -25 ? -25 : cl;
    if (!(T < ed)) T = cl < -25 ? -25 : cl;
  }
  // 0x5d4800: træt og ung → højst −5 % af CA
  if (age < 30 && !injured && i.club && fat > 1050 && T < 0 && r.ca * 0.05 < -T) {
    let v = s16(Math.trunc(-r.ca * 0.05));
    if (v >= -1) v = -1;
    T = v;
  }
  i.dbg?.('T', T);
  // 0x5d488d: CA += rand(T), divisionens loft, PA
  const old = r.ca;
  r.ca = s16(r.ca + rand(T));
  const c = i.club;
  if (c && c.div !== null && s16(c.rep) + 500 * s16(c.div) < 12000 && r.ca > old && rand(5) !== 0) {
    const cap = s16(Math.trunc((Math.pow(s16(c.div), 2) * 25 + s16(c.rep)) * 0.01));
    if (r.ca > cap) { const v = s16(Math.trunc(cap * 0.1) - Math.trunc(r.ca * -0.9)); r.ca = v < old ? old : v; }
  }
  rand(20);                                                                     // 0x5d499c: træningsnyheden (ikke porteret)
  if (r.ca > r.pa) r.ca = r.pa;
  // 0x5d4ae0: f > −3 → rand(trunc f)
  if (f > -3) f = f32(rand(Math.trunc(f)));
  if (f < 0) {
    // 0x5d4b24: efter toppen – fysikken
    let m = f32((s8(b[0x34]) * 0.4 + 4) * 50 * 0.01);
    if (m < 1) m = 1;
    for (const o of [0x1b, 0x1d, 0x2e, 0x34, 0x36]) b[o] = ccs(b[o], Math.trunc(rand(L) / m), 1, 20);
    b[0x3c] = ccs(b[0x3c], Math.trunc(rand(L) / m + flag), 1, 20);
    b[0x3d] = ccs(b[0x3d], Math.trunc(rand(L) / m), 1, 20);
    b[0x3a] = ccs(b[0x3a], rand(T), -125, 125);
    if (s8(b[0x43]) > 0 && s8(b[0x43]) < 100) b[0x43] = s8(Math.trunc(Math.max(s8(b[0x43]) * 1.1, s8(b[0x43]) + 5)));
    if (rand(P.prof) > rand(50)) b[0x21] = ccs(b[0x21], rand(2), 1, 20);
    if (s8(b[0x11]) > rand(5) + 15 && s8(b[0x39]) < 100) b[0x39] = s8(Math.trunc(Math.max(s8(b[0x39]) * 1.1, s8(b[0x39]) + 5)));
  } else {
    if (f > 1) {
      // 0x5d4dc9: før toppen
      const L3 = 3 * L;
      b[0x21] = ccs(b[0x21], idiv(rand(L3), 10), 1, 20);
      b[0x2f] = ccs(b[0x2f], idiv(rand((rand(2) + 2) * L), 10), 1, 20);
      b[0x42] = ccs(b[0x42], idiv(rand(L3), 10), 1, 20);
      b[0x2c] = ccs(b[0x2c], idiv(rand(L3), 10), 1, 20);
      if (i.train0 > rand(4) + 3) flag = s8(flag + 1);
      if (c && s8(c.fac) > rand(31) && flag < 0) flag = 0;
      if (s8(b[0x3c]) < s8(b[0x34]) + 5) b[0x3c] = ccs(b[0x3c], idiv(rand(L3), (5 - flag) * 2), 1, 20);
      b[0x3d] = ccs(b[0x3d], idiv(rand(L3), (5 - flag) * 2), 1, 20);
    } else {
      // 0x5d4f63: 0 ≤ f ≤ 1
      if (flag < 0) {
        if (s8(b[0x34]) > s8(b[0x3c]) + 2) flag = 0;
        else if (rand(s8(b[0x34])) > rand(20)) flag = 0;
        else { flag = s8(flag + rand(flag + 1)); if (flag > 0 && s8(b[0x3c]) > 15) flag = s8(rand(flag)); }
      } else if (flag > 0 && s8(b[0x3c]) > 15) flag = s8(rand(flag));
      b[0x3c] = ccs(b[0x3c], flag, 1, 20);
      if (s8(b[0x3c]) > s8(b[0x34]) + 5 && rand(P.prof) === 0) b[0x3c] = s8(b[0x3c] - rand(2));
      const L2 = 2 * L;
      b[0x21] = ccs(b[0x21], idiv(rand(L2), 10), 1, 20);
      { const a = rand(L2), d = rand(6); b[0x2f] = ccs(b[0x2f], idiv(a, d + 10), 1, 20); }
      b[0x42] = ccs(b[0x42], idiv(rand(L2), 10), 1, 20);
    }
    // 0x5d50ab
    if (rand(T) > rand(100)) b[0x1e] = ccs(b[0x1e], rand(T), -125, 125);
    if (rand(T) > rand(100)) b[0x24] = ccs(b[0x24], rand(T), -125, 125);
  }
  // 0x5d5115: aldringen
  const dec3 = (o: number, thr: number) => { if (s8(b[o]) > thr && rand(3) === 0) b[o] = s8(b[o] - 1); };
  const sub = (o: number, n: number) => { b[o] = s8(b[o] - rand(n)); };
  const att = b[0x14] === 20 || b[0x15] === 20;
  const sta = () => s8(b[0x3c]);
  if (age >= 38) {
    if (att) { if (r.ca > 50 && rand(r.ca) > P.prof + sta() + 10) r.ca = s16(r.ca - rand(20)); }
    else if (b[0x11] === 20 || b[0x13] === 20 || b[0x10] === 20 || b[0x12] === 20) { if (r.ca > 50 && rand(r.ca) > P.prof + sta()) r.ca = s16(r.ca - rand(10)); }
    if (s8(b[0x2e]) > 15) sub(0x2e, 3); else if (s8(b[0x2e]) > 5 && rand(3) === 0) sub(0x2e, 2);
    if (s8(b[0x1b]) > 8) b[0x1b] = s8(b[0x1b] - 1 - rand(3));
    dec3(0x1b, 4);
    if (s8(b[0x36]) > 8) b[0x36] = s8(b[0x36] - 1 - rand(3));
    dec3(0x36, 4);
    dec3(0x1d, 10); dec3(0x34, 4);
    if (sta() > 7) sub(0x3c, 3); else dec3(0x3c, 4);
    if (s8(b[0x3d]) > 7) sub(0x3d, 3); else dec3(0x3d, 4);
  } else if (age >= 35) {
    if (att && r.ca > 50 && rand(r.ca) > P.prof + sta() + 10) r.ca = s16(r.ca - rand(10));
    if (s8(b[0x2e]) > 17) sub(0x2e, 2); else if (s8(b[0x2e]) > 10 && rand(3) === 0) sub(0x2e, 2);
    if (s8(b[0x1b]) > 15) sub(0x1b, 3); else dec3(0x1b, 5);
    if (s8(b[0x36]) > 15) sub(0x36, 3);
    dec3(0x36, 5);
    dec3(0x1d, 10); dec3(0x34, 8);
    if (sta() > 15) sub(0x3c, 3); else dec3(0x3c, 8);
    if (s8(b[0x3d]) > 15) sub(0x3d, 3); else dec3(0x3d, 10);
  } else if (age >= 33) {
    if (b[0x11] === 20 || b[0x12] === 20 || b[0x0f] !== 0) {                    // sic: målmandsevnen er altid ≥ 1
      if (P.prof > rand(11) + 10 && s8(b[0x44]) > rand(15) + 6 && rand(P.prof) !== 0) {
        let x = rand(2); if (x) b[0x1e] = ccs(b[0x1e], x, -125, 125);
        x = rand(2); if (x) b[0x39] = ccs(b[0x39], x, -125, 125);
      }
    }
    if (att && r.ca > 100 && rand(r.ca) > P.prof + sta() + 50) r.ca = s16(r.ca - rand(6));
    if (s8(b[0x1b]) > 15) sub(0x1b, 2); else dec3(0x1b, 10);
    if (s8(b[0x36]) > 15) sub(0x36, 2); else dec3(0x36, 10);
    if (b[0x1d] === 20 && rand(3) === 0) b[0x1d]--;
    dec3(0x34, 15); dec3(0x3c, 18);
    if (b[0x3d] === 20 && rand(3) !== 0) b[0x3d]--;
  } else if (age >= 30) {
    if (b[0x11] === 20 || b[0x12] === 20 || b[0x0f] === 20 || b[0x10] === 20) {
      if (P.prof > rand(11) + 10 && s8(b[0x44]) > rand(10) + 6 && rand(P.prof) !== 0) {
        if (s8(b[0x1e]) < 15) { const x = rand(2); if (x) b[0x1e] = ccs(b[0x1e], x, -125, 125); }
        if (s8(b[0x39]) < 15) { const x = rand(2); if (x) b[0x39] = ccs(b[0x39], x, -125, 125); }
      }
    } else if (b[0x15] === 20 || b[0x14] === 20 || b[0x13] === 20) {
      if (P.prof > rand(6) + 15 && s8(b[0x44]) > rand(11) + 10 && rand(P.prof) !== 0 && s8(b[0x1e]) < 15) {
        const x = rand(2); if (x) b[0x1e] = ccs(b[0x1e], x, -125, 125);
      }
    }
    dec3(0x1b, 18); dec3(0x36, 18);
  }
  return T;
}

// ------------------------------------------------------------------------------------------------ i spillet

const PERS: [keyof DevPers, string][] = [['amb', 'ambition'], ['det', 'determination'], ['loy', 'loyalty'], ['pres', 'pressure'], ['prof', 'professionalism'],
  ['sport', 'sportsmanship'], ['temp', 'temperament']];
const AX = (k: string) => ATTRS.indexOf(k as never);
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** vores stab → en ikke-spillerpost. I originalens hukommelse er postens egenskaber interne værdier (oraklet: Coaching −30…+30), vist =
 *  0x544410 display(CA + 2·intern); hos os de interne, der vises som databasens 1–20 (sub_544380's omvendte – staff-initialiseringen er ikke
 *  porteret, *estimeret*). Coaching Goalkeepers, Man Management og Working with Youngsters findes ikke i world-filerne → Coaching/Motivating/Coaching
 *  (*estimeret*); uden databasens CA: 100. */
function coachOf(s: Staff | undefined): DevCoach | null {
  if (!s) return null;
  const a = s.attrs, ca = s.ca ?? 100;
  const int = (v: number) => intrinsicOf(Math.max(1, Math.min(20, Math.round(v || 1))), ca);
  return { ca, b10: int(a.coaching), b11: int(a.coaching), b14: int(a.discipline), b19: int(a.motivating), b1b: int(a.motivating), b22: int(a.coaching) };
}
function clubOf(g: GameState, cid: number, byClub: Map<number, Staff[]>): DevClub | null {
  const c = g.clubs[cid];
  if (!c) return null;
  const st = byClub.get(cid) ?? [];
  const mgr = g.staff[c.manager ?? -1];
  const asst = st.find((s) => s.role === 'assistant');
  const coaches = st.filter((s) => s.role === 'coach').slice(0, 5);
  const lg = g.leagues[c.league];
  const compId = c.league ? +(c.league.match(/(\d+)$/)?.[1] ?? NaN) : NaN;
  const div = lg && !lg.hidden ? g.cmCompRep?.[compId] ?? null : null;
  const mc = coachOf(mgr);
  return { fac: c.facilities | 0, rep: clubRepMem(g, cid), div, human: isHumanClub(cid), mgr22: mc ? mc.b22 : null,
    coaches: [coachOf(asst), ...[0, 1, 2, 3, 4].map((k) => coachOf(coaches[k]))] };
}

/** hvad udviklingen læser fra konditionsmodulet (cmFitnessGame.ts sætter det – undgår en cirkulær import) */
export interface DevCtx { fatigue: (p: Player) => number; injuryW2c: (p: Player) => number | null }
let dctx: DevCtx | null = null;
export function setDevCtx(c: DevCtx): void { dctx = c; }

/** spillere uden de interne (regens, opfyldte spillere, ældre gemte spil): de interne skønnes af de viste (sub_544380's omvendte – *estimeret*) */
export function ensureCmInt(p: Player): void {
  if (p.cmInt) return;
  const gk = p.pos[0] === 20;
  const lowGk = new Set(['crossing', 'creativity', 'offTheBall']);
  p.cmInt = [0x1e, 0x23, 0x24, 0x26, 0x27, 0x2a, 0x2b, 0x31, 0x32, 0x33, 0x35, 0x37, 0x38, 0x39, 0x3a, 0x3e, 0x41, 0x43].map((o) => {
    const k = (REC_NAME.get(o) ?? '') as string;
    const ca = gk && lowGk.has(k) ? Math.trunc(p.ca) * 0.1 : Math.trunc(p.ca);
    return intrinsicOf(Math.round(p.attrs[AX(k)] ?? 10), ca);
  });
  for (let i = 0; i < p.attrs.length; i++) p.attrs[i] = Math.round(p.attrs[i]);
}
const REC_NAME = new Map<number, string>([[0x1e, 'anticipation'], [0x23, 'crossing'], [0x24, 'decisions'], [0x26, 'dribbling'], [0x27, 'finishing'],
  [0x2a, 'handling'], [0x2b, 'heading'], [0x31, 'longShots'], [0x32, 'marking'], [0x33, 'offTheBall'], [0x35, 'oneOnOnes'], [0x37, 'passing'],
  [0x38, 'penalties'], [0x39, 'positioning'], [0x3a, 'reflexes'], [0x3e, 'tackling'], [0x41, 'throwIns'], [0x43, 'creativity']]);

/** 0x5ce2d0's udviklingsblok for alle spillere på deres dage (sim.ts newDay, efter kontraktdelen), og ugetælleren 0x8b1730 bagefter */
export function cmDevDaily(g: GameState): void {
  if (!cmActive(g) || g.draft) return;
  const d = new Date(`${g.date}T00:00:00Z`), y = d.getUTCFullYear();
  const doy = Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000);
  const day = dayNum(g.date);
  const byClub = new Map<number, Staff[]>();
  for (const s of Object.values(g.staff)) if (s.club) (byClub.get(s.club) ?? byClub.set(s.club, []).get(s.club)!).push(s);
  const clubs = new Map<number, DevClub | null>();
  const avg = g.cmRatingAvg ?? [680, 100];
  const mean = avg[1] ? avg[0] / avg[1] : 6.8;
  for (const p of Object.values(g.players)) {
    const a = p.id % 365, b2 = (a + 120) % 365, e3 = (b2 + 120) % 365;
    if (doy !== a && doy !== b2 && doy !== e3) continue;
    ensureCmInt(p);
    if (!clubs.has(p.club)) clubs.set(p.club, p.club ? clubOf(g, p.club, byClub) : null);
    cmDevelopPlayer(g, p, clubs.get(p.club) ?? null, mean, cmRand(g.seed ?? 0, p.id, day, 0x5ce2d0, 0x5d38f9));
  }
  cmTrainWeekTick(g, doy);
}

/** udviklingen for én spiller (0x5d38f9–0x5d5777) med 0x538bc0 bagefter */
export function cmDevelopPlayer(g: GameState, p: Player, club: DevClub | null, mean: number, rand: (n: number) => number): void {
  const r = recOf(p);
  const P = Object.fromEntries(PERS.map(([k, a]) => [k, Math.round(p.attrs[AX(a)] ?? 10)])) as unknown as DevPers;
  // træningsposten oprettes først ved den første træning (cmTraining.ts) – uden post er alle effekter 0
  const e: CmTrainEntry | null = p.cmTrain ?? null;
  developCore({
    id: p.id, age: ageOn(p.dob, g.date), club,
    stats: [statAvg(p, 6, 1, 6.5), statAvg(p, 6, 0x11, 6.5), statAvg(p, 1, 0x11, 6.5), statAvg(p, 1, 1, 6.5)], mean,
    fatigue: dctx?.fatigue(p) ?? 0, injury: dctx?.injuryW2c(p) ?? null, train0: e ? nibble(e, 0) : 0,
    rel: { favClub: (fl) => addFavClub(g, p, p.club, fl !== 0, rand), unfavClub: () => removeFavClub(p, p.club) },
  }, r, P, rand);
  normaliseRec(r, e);
  fadeRelations(p, rand);                                                      // 0x5d5778: 0x547f90 (forholdene falmer)
  for (const [k, a] of PERS) p.attrs[AX(a)] = P[k];
  recInto(g, p, r);
}
