// Originalens konditionsmodul injury.cpp (cm0102.exe 3.9.68, Injury-objektet [0xb63d28]) – afkodet 11/11-2026, noten
// ~/cm0102-engine/notes/cm-fitness.md. Én 31-bytes post pr. spiller (Player.cmFit) og 48-bytes skader (CmFit.inj):
//
//   +0 datoen for den seneste opdatering   +8 Fitness (0..10000)   +0xa kampkondition (0..10000)   +0xc træthed (s16)
//   +0xe den nuværende skade (−1 = ingen)  +0x12 tilbagevendende skadetype (0xff = ingen) og +0x13 dens niveau
//   +0x1c (0 ved ny skade)   +0x1d den seneste skadetype   +0x1e træningsbelastningen (50 for computerens spillere)
//   skaden: +0 type (0..81, tabellen 0x9e7ad9), +0x20 startdatoen, +0x28 dage til fuld kondition, +0x2a dage til træning, +0x2c/+0x2e tællere
//
// Porteret: 0x62c680 (dagens opdatering, doven – kaldes først, når nogen læser konditionen), 0x62c590/0x62c510/0x62c400/0x62c3d0/0x62ed70
// (aflæsningerne), 0x62c2f0 (trætheden falder dagligt, 0x5ce2d0), 0x62bd10/0x62c080 (efter kampen: kampkondition og træthed af minutterne,
// knocks → skader), 0x62be00 (kampens knocks, gittermotorens 0x6d0980 via cmKnockHook), 0x62b7b0 (dagligt: træningsskader på hverdage,
// sygdomsudbrud), 0x62d140/0x62d250/0x62e500/0x62e700/0x62e820/0x62e9e0 (skadetype, længde efter fysioterapeuten og alderen, tilbagevendende
// skader, slut, smitte), 0x62cf70/0x62a920 (spilstarten: posterne, tilfældige skader fra databasens dato, Fitness efter sæsonens dato).
//
// Kun den originale database i ægte tilstand (cmPlayerData.cmActive). Originalens tilfældige tal (0x90cfc0) trækkes af en egen deterministisk
// talrække (cmRand: spillets frø, dagen og et formål), så spillets rng og zonemotoren er uændrede. Hvad der ikke er porteret, står i noten.

import type { Club, GameState, Player } from './types';
import { ATTRS } from './attributes';
import { ageOn, addDays } from './dates';
import { cmActive, cmRand, STAFF_STATE_OFF } from './cmPlayerData';
import { staffIntrinsic, staffShown } from './engine/grid/roleScore';
import { npShown } from './cmStaffInit';

// ---------------------------------------------------------------- posten

export interface CmInjury {
  /** +0 type (0..81) */ t: number;
  /** +0x20 startdatoen (dagnummer) */ d: number;
  /** +0x28 dage til fuld kondition */ w28: number;
  /** +0x2a dage til træning */ w2a: number;
  /** +0x2c/+0x2e tællere (−1 pr. dag i 0x62b7b0) */ w2c: number; w2e: number;
}
export interface CmFit {
  /** +0 dagen for den seneste opdatering (dagnummer) */ d: number;
  /** +8 */ f: number;
  /** +0xa */ mc: number;
  /** +0xc */ fat: number;
  /** +0xe (null = −1) */ inj: CmInjury | null;
  /** +0x12 (−1 = 0xff) og +0x13 */ rt: number; rl: number;
  /** +0x1c */ b1c: number;
  /** +0x1d (−1 = 0xff) */ lt: number;
  /** +0x1e */ load: number;
}
/** sygdomsudbrud (17 bytes, 0x62e820): dato, type (0–2), klub, kampens id (+0xd) */
export interface CmOutbreak { d: number; t: number; club: number; fx: number }

// ---------------------------------------------------------------- talsemantik

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const u16 = (v: number) => v & 0xffff;
const ftol = Math.trunc;                                                          // 0x945640
type Rand = (n: number) => number;

/** dagnummer (dage siden 1970-01-01) ↔ originalens Date (dag i året 0.., år) */
export const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const isoOf = (dn: number) => new Date(dn * 86400000).toISOString().slice(0, 10);
const yearOf = (dn: number) => new Date(dn * 86400000).getUTCFullYear();
const doyOf = (dn: number) => dn - Math.round(Date.UTC(yearOf(dn), 0, 1) / 86400000);
const dateOf = (day: number, year: number) => Math.round(Date.UTC(year, 0, 1) / 86400000) + day;   // 0x549ef0
const leap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
/** Date::get_difference 0x54cc30 → 365·år + dage (den seneste dato først; et lån af dage bruger dens års længde, sic) */
export function dateGap(a: number, b: number): number {
  if (b > a) [a, b] = [b, a];
  const ay = yearOf(a), by = yearOf(b), ad = doyOf(a), bd = doyOf(b);
  if (ad - bd >= 0) return 365 * u16(ay - by) + u16(ad - bd);
  return 365 * u16(ay - by - 1) + u16(ad - bd + (leap(ay) ? 366 : 365));
}

// ---------------------------------------------------------------- skadetyperne (0x9e7ad9, 82 × 13 bytes) og kategorierne (0x9e7f05)

/** [kategori, sjældenhed, grunddage, variable dage, % til træning, kan vende tilbage, sværhed (−1 = alle)] */
export const INJ_TYPES: readonly (readonly [number, number, number, number, number, number, number])[] = [
  [0, 6, 1, 3, 50, 0, -1], [0, 7, 2, 5, 80, 0, -1], [0, 8, 2, 5, 80, 0, -1], [0, 9, 2, 5, 80, 0, -1], [0, 80, 170, 20, 90, 0, 2],
  [1, 6, 15, 25, 60, 0, 0], [1, 6, 10, 20, 60, 0, 0], [1, 6, 10, 15, 60, 0, 0], [1, 6, 10, 10, 40, 0, 0], [1, 6, 5, 10, 60, 0, 0],
  [1, 7, 10, 15, 60, 0, 1], [1, 7, 15, 30, 60, 1, 1], [1, 8, 20, 40, 60, 1, 2], [1, 8, 30, 150, 60, 1, 2], [1, 8, 60, 150, 60, 0, 2],
  [1, 8, 60, 60, 60, 0, 2], [2, 6, 3, 11, 20, 0, 0], [2, 6, 15, 25, 60, 1, 0], [2, 7, 30, 65, 60, 1, 2], [2, 7, 5, 16, 60, 0, 1],
  [2, 8, 25, 100, 60, 1, 2], [2, 8, 90, 170, 60, 0, 2], [3, 6, 10, 15, 60, 0, 0], [3, 7, 10, 20, 60, 1, 1], [3, 8, 20, 40, 60, 0, 2],
  [3, 8, 10, 35, 60, 1, 2], [3, 8, 50, 60, 60, 1, 2], [3, 9, 180, 180, 60, 1, 2], [4, 6, 15, 25, 60, 1, 1], [4, 6, 3, 10, 60, 0, 0],
  [4, 6, 5, 20, 60, 1, 0], [4, 7, 50, 45, 60, 1, 2], [4, 7, 3, 5, 60, 0, 1], [4, 7, 5, 12, 60, 0, 1], [4, 8, 90, 100, 60, 0, 2],
  [5, 6, 15, 25, 60, 1, 0], [5, 7, 50, 45, 60, 1, 1], [5, 7, 20, 100, 60, 1, 2], [5, 50, 90, 150, 60, 0, 2], [6, 6, 3, 5, 0, 0, 0],
  [6, 6, 5, 20, 50, 0, 0], [6, 6, 10, 10, 60, 1, 1], [6, 7, 20, 40, 60, 0, 1], [6, 7, 20, 40, 60, 0, 2], [6, 9, 45, 180, 60, 1, 2],
  [6, 9, 45, 290, 60, 1, 2], [7, 6, 1, 5, 0, 0, 0], [7, 7, 1, 5, 0, 0, 0], [7, 7, 3, 5, 0, 0, 1], [7, 8, 10, 10, 50, 0, 2],
  [8, 6, 3, 3, 0, 0, 0], [8, 6, 5, 5, 0, 0, 0], [8, 6, 5, 10, 30, 0, 1], [8, 7, 20, 15, 30, 0, 1], [8, 8, 3, 5, 60, 0, 1],
  [8, 8, 20, 15, 60, 0, 1], [8, 8, 20, 30, 60, 0, 2], [8, 8, 20, 30, 60, 0, 2], [9, 6, 5, 25, 60, 0, 0], [9, 8, 5, 10, 20, 1, 1],
  [9, 8, 20, 45, 60, 0, 2], [10, 6, 5, 10, 30, 0, 0], [10, 6, 10, 25, 60, 0, 1], [10, 8, 30, 45, 60, 0, 2], [11, 6, 5, 5, 10, 0, 0],
  [11, 6, 3, 10, 10, 0, 0], [11, 7, 3, 10, 40, 0, 0], [11, 7, 3, 10, 20, 0, 0], [11, 7, 3, 6, 40, 0, 0], [11, 7, 3, 6, 30, 0, 0],
  [11, 8, 20, 20, 60, 0, 1], [11, 8, 20, 20, 60, 0, 1], [11, 8, 20, 20, 60, 0, 1], [11, 8, 20, 60, 60, 0, 2], [11, 8, 20, 60, 60, 0, 2],
  [11, 9, 60, 180, 60, 0, 2], [3, 100, 14, 90, 60, 1, 2], [12, 0, 3, 4, 0, 0, 3], [12, 0, 14, 14, 50, 0, 3], [12, 0, 60, 120, 25, 0, 3],
  [12, 0, 210, 120, 25, 0, 3], [12, 0, 14, 0, 25, 0, 3],
];
/** første og sidste type pr. kategori (0x9e7f05/0x9e7f06) */
const CAT_RANGE: readonly (readonly [number, number])[] = [[0, 4], [5, 15], [16, 21], [22, 27], [28, 34], [35, 38], [39, 45], [46, 49], [50, 57], [58, 60], [61, 63], [64, 75]];
const HOLIDAY = 0x51;
/** typer, der ikke spærrer for en ny skade (0x62d162) */
const SOFT = new Set([0, 1, 2, 3, 4, 0x4c, 0x4d, 0x4e, 0x4f, 0x50, 0x51]);

// ---------------------------------------------------------------- sæsonen (key_nation_club_in_season 0x669bd0)

/** landets sæson [startdag A (+0x2a), slutdag B (+0x39)] (dag i året, 0 = 1. januar) – tabellen 0xb63d60 målt i oraklet (3.9.60, 14/7-2001);
 *  lande uden række: A fra rækken 0xb63e38 (173) og B fra en tom Date (40) */
const SEASON: Record<number, [number, number]> = {
  8: [220, 199], 11: [274, 160], 19: [215, 151], 27: [17, 347], 47: [201, 147], 52: [209, 164], 60: [222, 144], 68: [116, 315], 69: [222, 143],
  73: [208, 145], 75: [229, 140], 83: [229, 157], 92: [209, 139], 94: [237, 158], 97: [67, 331], 128: [222, 127], 138: [103, 303], 148: [194, 155],
  149: [237, 158], 154: [81, 313], 160: [215, 143], 170: [82, 328], 171: [244, 164], 179: [96, 298], 192: [216, 140], 196: [81, 5], 207: [229, 125],
};
/** landet har en række i sæsontabellen (0x669340 finder den; ellers række 4 med start = slut = dag 180) */
/** 0xb63d60 +0x2a: landets sæsonstart (dag i året) – spilstartens dato 0x830520 (cmCalendar.ts) */
export const seasonStartDay = (nation: number | undefined): number | undefined => (nation !== undefined ? SEASON[nation]?.[0] : undefined);
export const hasSeasonRow = (nation: number | undefined) => nation !== undefined && !!SEASON[nation];
/** 0x669bd0: [i sæson, start (arg2), slut (arg3)] som dagnumre */
export function clubSeason(nation: number | undefined, today: number): [boolean, number, number] {
  const [A, B] = (nation !== undefined && SEASON[nation]) || [173, 40];
  const T = doyOf(today), y = yearOf(today);
  if (A > B) {
    if (T > A) return [true, dateOf(A, y), dateOf(B, y + 1)];
    if (T < B) return [true, dateOf(A, y - 1), dateOf(B, y)];
    return [false, dateOf(A, y), dateOf(B, y)];
  }
  if (T < A) return [false, dateOf(A, y), dateOf(B, y)];
  if (T > B) return [true, dateOf(A, y + 1), dateOf(B, y + 1)];            // efter slutdagen "i sæson" med næste års datoer (sic)
  return [true, dateOf(A, y), dateOf(B, y)];
}

// ---------------------------------------------------------------- spillerens felter

const at = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
const NF = (p: Player) => s8(at(p, 'naturalFitness'));                          // spillerpost +0x34
const IP = (p: Player) => s8(at(p, 'injuryProneness'));                         // +0x2d
const prof = (p: Player) => s8(at(p, 'professionalism'));                       // staff +0x5b
const gkRating = (p: Player) => p.pos[0];                                       // +0xf
const ageAt = (p: Player, today: number) => ageOn(p.dob, isoOf(today));        // staff +0x18

/** spilleren har en post (de genererede – id ≥ [0xae2364] – har ingen) */
const real = (p: Player | undefined): p is Player => !!p && !p.regen;
export const newFit = (today: number): CmFit => ({ d: today, f: 10000, mc: 10000, fat: 0, inj: null, rt: -1, rl: 0, b1c: 0, lt: -1, load: 50 });
function fitOf(g: GameState, p: Player): CmFit {
  return (p.cmFit ??= newFit(dayNum(g.cmFitStart ?? g.date)));
}

export interface FitCtx {
  g: GameState;
  today: number;
  rand: Rand;
  /** klubbens trup (club +0xd7, 50 pladser) */
  squadOf: (club: number) => Player[];
  /** klubben styres af et menneske (0x600a50) */
  human: (club: number) => boolean;
  /** nyheder til mennesket (skade 0x62dca0, tilbage 0x630ee0) */
  news?: (kind: 'injury' | 'recovered', p: Player, inj: CmInjury) => void;
  /** 0x7a7f20: karrieren slutter pga. skaden */
  retire?: (p: Player) => void;
  /** staff +0x24 ≠ 0 og 0x76e040's dato efter i dag (0x62c8c0–0x62c937): på landsholdsophold */
  onDuty?: (p: Player) => boolean;
  /** club +0x1db ≠ −1: klubben er med i en europæisk turnering (0x62ce30) */
  inEurope?: (club: number) => boolean;
  /** TRAINING_MANAGER::update_player_training 0x8b1750(staff, 0) – add_injury kalder den efter dagens opdatering (0x62d312; cmTraining.ts) */
  train?: (p: Player) => void;
}

// ---------------------------------------------------------------- 0x62c680 dagens opdatering

/** Injury::update_player_fitness 0x62c680 – bringer Fitness (+8) og kampkonditionen (+0xa) op til i dag (en gang pr. dag). */
export function updateFitness(c: FitCtx, p: Player): void {
  if (!real(p)) return;
  const r = fitOf(c.g, p), T = c.today;
  if (r.d === T) return;
  const N = dateGap(T, r.d);
  let a = 0, b = 0, cc = 0, d = 0;
  if (r.inj) {
    const e = r.inj, D = dateGap(T, e.d);
    if (D < e.w2a) cc = N;                                                        // 0x62c83e: skadet
    else if (D < e.w28) {                                                         // 0x62c847: genoptræning
      if (N < e.w2a + D) { a = D - e.w2a; cc = N - a; } else a = N;
    } else {                                                                      // 0x62c870: helet
      if (N > D - e.w2a) { const x = N - e.w28; a = D - e.w2a - x; b = x; cc = e.w28 - a; } else b = N;
      endInjury(c, p, true);
    }
  } else {
    b = N;
    const club = p.club ? c.g.clubs[p.club] : undefined;
    // 0x62c8c0: staff +0x24 (landsholdets klub) og dens dato 0x76e040 efter i dag → fuld træning hele vejen (ingen sommerpause)
    if (club && !c.onDuty?.(p)) {
      const [inSeason, start, end] = clubSeason(club.nation, T);
      if (!inSeason) {                                                            // 0x62c9b1: sommerpausen
        b = 0;
        const E = u16(T - end), S = u16(start - T);                               // Date::days_since 0x54cdb0
        if (E < S) {                                                              // første halvdel: ferie (d) og genoptræning (a)
          d = E < N ? E : N;
          a = N - d;
          // 0x62ca1f: rand(Professionalism/3 + 2) = 0 pr. feriedag løfter staffpostens byte 0xae2d0c +0xa (Player.cmStaffState), så længe den er < 50
          if (!STAFF_STATE_OFF) for (let k = 0; k < d; k++) {
            const x = p.cmStaffState ?? 0;
            if (x >= 0x32) break;
            if (c.rand(Math.trunc(s8(Math.round(at(p, 'professionalism'))) / 3) + 2) === 0) p.cmStaffState = (x + 1) & 0xff;
          }
        } else {
          a = E - ftol((E + S) / 2); if (a < 0) a = 0;
          if (N < a) a = N;
          cc = N - a;
        }
        if (S < 15) { b = 15 - S; a -= 15 - S; if (a < 0) a = 0; }
        else if (ftol((r.f * r.mc) / 10000) < 8000) { const x = c.rand(2); b = ftol((a + x) / 2); a -= b; }   // 0x62cb16
      }
    }
  }
  // 0x62cb35: Fitness
  let L = s8(r.load - NF(p));
  if (L < 0) L = 0; else if (L > 100) L = 100;
  const K = s16(1000 - 12 * L), K2 = ftol(K / 2);
  const nf = NF(p), F = s16(r.f);
  const minF = s16(100 * (ftol((25 * nf) / 20) + 15)), maxF = s16(100 * (ftol((16 * nf) / 20) + 84));
  let x = F - 66 * cc;
  if (x < minF) x = 4000;
  const cap = maxF < x ? x : maxF;
  x += s16(K2) * a; if (x > cap) x = cap;
  x += K * b;
  if (F > 9850) x = s16(ftol((x - F) * 0.1)) + F;
  else if (F > 9000) { x = s16(ftol((x - F) * 0.2)) + F; if (x > 9850) x = s16(ftol((x - 9850) * 0.5)) + 9850; }
  else if (x > 7000) {
    x = s16(ftol((x - 7000) * 0.925)) + 7000;
    if (x > 9000) x = s16(ftol((x - 9000) * 0.22)) + 9000;
    if (x > 9850) x = s16(ftol((x - 9850) * 0.5)) + 9850;
  }
  if (x > 10000) x = 10000;
  let nF = x - 55 * d;
  if (nF < minF) nF = 5000;
  // 0x62cd1e: kampkonditionen
  let rate = 1.0;
  let keep = false;
  if (r.fat > 1000) { rate = 1.4 - r.fat * 0.0004; if (!(rate > 0.95)) keep = true; }
  if (!keep && a > 0) rate = 0.95;
  let mc = ftol(250 * a * rate) + r.mc + ftol(500 * b * rate);
  if (mc > 10000) mc = 10000;
  r.f = s16(nF); r.mc = s16(mc); r.d = T;
}

// ---------------------------------------------------------------- aflæsningerne

/** 0x62c400: 2 = skadet, 1 = genoptræner, 0 = klar */
export function injuryStatus(c: FitCtx, p: Player): number {
  if (!real(p)) return 0;
  updateFitness(c, p);
  const e = p.cmFit?.inj;
  if (!e) return 0;
  const D = dateGap(c.today, e.d);
  return D < e.w2a ? 2 : D < e.w28 ? 1 : 0;
}
/** 0x62c590: konditionen (Fitness · kampkondition / 10000; højst 90 % under genoptræning, mindst 100) – rå eller i procent */
export function condition(c: FitCtx, p: Player, pct = false): number {
  if (!p) return 0;
  if (!real(p)) return pct ? 100 : 10000;
  const st = injuryStatus(c, p);
  const r = fitOf(c.g, p);
  let v = s16(ftol((s16(r.f) * s16(r.mc)) / 10000));
  if (st === 1 && v >= 9000) v = 9000;
  else if (v <= 100) v = 100;
  if (pct) { v = ftol(v * Math.fround(0.01) + 0.5); if (v > 100) v = 100; }
  return v;
}
/** 0x62c510: kampkonditionen (+0xa) efter dagens opdatering */
export function matchCondition(c: FitCtx, p: Player, pct = false): number {
  if (!real(p)) return pct ? 100 : 10000;
  updateFitness(c, p);
  const v = fitOf(c.g, p).mc;
  return pct ? ftol(v * Math.fround(0.01)) : v;
}
/** 0x62c3d0: trætheden (+0xc) – uden opdatering */
export const fatigue = (p: Player) => (real(p) ? s16(p.cmFit?.fat ?? 0) : 0);
/** 0x62ed70: den nuværende skade efter dagens opdatering */
export function currentInjury(c: FitCtx, p: Player): CmInjury | null {
  if (!real(p)) return null;
  updateFitness(c, p);
  return p.cmFit?.inj ?? null;
}

// ---------------------------------------------------------------- 0x62c2f0 / 0x62bd10

/** Injury::recover_fatigue 0x62c2f0 (0x5ce2d0, hver dag for hver spiller) */
export function recoverFatigue(c: FitCtx, p: Player): void {
  if (!real(p)) return;
  const r = fitOf(c.g, p);
  if (r.fat < -1000) r.fat = s16(r.fat - 1);
  const age = ageAt(p, c.today);
  if (age < 19 && r.fat < 0) r.fat = 0;
  else if (r.fat >= -500) { if (age >= c.rand(25)) r.fat = s16(r.fat - 13); else r.fat = s16(r.fat - c.rand(13)); }
  else r.fat = s16(r.fat - c.rand(13));
  if (gkRating(p) === 20 && r.fat >= 1050) r.fat = 1050;
}
/** Injury::set_match_condition 0x62bd10: kampkonditionen = cond, trætheden + delta (med et tilfældigt tillæg nær grænsen) */
export function setMatchCondition(c: FitCtx, p: Player, cond: number, delta: number): void {
  if (!real(p)) return;
  const r = fitOf(c.g, p);
  r.mc = s16(cond);
  const f = s16(r.fat);
  if (f < -1000) { r.fat = s16(ftol(delta * (f * -0.0035 - 2.5)) + f); return; }
  const lim = 1200 - s16(s8(at(p, 'workRate')) + s8(at(p, 'stamina')) + prof(p));
  if (f < lim) r.fat = s16(f + delta);
  else if (f < 1250) r.fat = s16(r.fat + c.rand(delta) + 1);
}

// ---------------------------------------------------------------- kampens knocks (0x62be00) – gittermotorens 0x6d0980 kalder cmKnockHook

/** Injury +0x28: kampens knocks [spiller-id → kategori, sværhed] (tømmes af 0x62b7b0 hver dag); hurt = zonemotorens skadede (uden knockliste) */
const knocks = new Map<number, { cat: number; sev: number; hurt: () => boolean }>();
/** 0x62be00: en ny knock lægges til listen; har spilleren én, lægges sværheden til (samme kategori, højst 100), eller den sværeste vinder */
export function recordKnock(id: number, cat: number, sev: number, hurt: () => boolean): [number, number] {
  const n = knocks.get(id);
  if (!n) { knocks.set(id, { cat: s8(cat), sev: s8(sev), hurt }); return [cat, sev]; }
  n.hurt = hurt;
  if (n.cat === s8(cat)) n.sev = s8(sev) + n.sev > 100 ? 100 : s8(n.sev + sev);
  else if (s8(sev) > n.sev) { n.sev = s8(sev); n.cat = s8(cat); }
  return [n.cat, n.sev];
}
export function clearKnocks(): void { knocks.clear(); }
/** gittermotorens knock (0x6d0980 → 0x62be00): kategorien > −1 registreres (kun i ægte tilstand med den originale database) */
(globalThis as { cmKnockHook?: (q: { src: Player; b1c: number }, kind: number, sev: number) => void }).cmKnockHook = (q, kind, sev) => {
  if (s8(kind) > -1 && cmHookOn) recordKnock(q.src.id, kind, sev, () => false);
};
let cmHookOn = false;
/** slås til af sim.ts, når konditionsmodulet er aktivt (ellers registreres intet – den moderne database rører listen aldrig) */
export function setKnockHook(on: boolean): void { cmHookOn = on; if (!on) knocks.clear(); }

// ---------------------------------------------------------------- 0x62c080 efter kampen

export interface MatchEntry {
  p: Player;
  /** k < 11: startede */ starter: boolean;
  /** bl: minutterne på banen (0 for en ubrugt udskifter) */ minutes: number;
  /** resultat +0x36: konditionen ved slutfløjt (0..10000) */ cond: number;
  /** resultat +0x1f: båret ud skadet */ hurt: boolean;
}
let staleSev = -1;                                                                // [esp+0x14] i 0x62c080: ikke sat før første knock (sic)
/** Injury::apply_match_effects 0x62c080 for alle 20 i kamptrupperne. `competitive` = fixture +0x40 (0 for venskabskampe: halv træthed). */
export function applyMatchEffects(c: FitCtx, entries: MatchEntry[], competitive: boolean, fixture: number): void {
  const start = dayNum(c.g.cmFitStart ?? c.g.date);
  for (const en of entries) {
    const p = en.p;
    if (!real(p)) continue;
    const age = ageAt(p, c.today);
    let ed = ftol((10000 - s16(en.cond)) / 100) + s8(en.minutes);
    if (!competitive) ed = ftol(s16(ed) / 2);
    else if (age > c.rand(3) + 33) ed = ftol(s16(ed) * 1.25);
    else if (age < 23 - c.rand(5)) ed += ed;
    if (start > c.today) ed = 0;                                                   // 0x62c1be: før spillets startdato
    setMatchCondition(c, p, en.cond, s16(ed));
    // resultatets +0x1f: målt i oraklet (fit1, 1.424 knocks) er den sat præcis, når den flettede sværhed er over 50 (0x6d0a07: +0x1c);
    // zonemotorens kampe (ingen knockliste) markerer selv den skadede (hurt)
    const n = knocks.get(p.id);
    if (!n || !(n.sev > 50 || n.hurt())) continue;
    if (n.cat === 7 && gkRating(p) < 15) continue;
    const sev = n.sev > 95 ? 2 : n.sev > 65 ? 1 : n.sev > 50 ? 0 : staleSev;
    staleSev = sev;
    const t = chooseInjuryType(c, n.cat, sev, p);
    if (t > -1) { endInjury(c, p, false); addInjury(c, t, false, p, fixture === -2 ? 0 : fixture, true, 0); }
  }
}

// ---------------------------------------------------------------- skaderne

/** Injury::choose_injury_type 0x62d140: den laveste rand(sjældenhed) blandt kategoriens typer med sværheden (den tilbagevendende: rand(3) − 1);
 *  −1 hvis spilleren allerede har en skade, der spærrer */
export function chooseInjuryType(c: FitCtx, cat: number, sev: number, p: Player): number {
  const cur = currentInjury(c, p);
  if (cur && !SOFT.has(cur.t)) return -1;
  const r = fitOf(c.g, p);
  let best = 100, res = -1;
  const recur = r.rt !== -1 && INJ_TYPES[r.rt]?.[0] === cat ? r.rt : -1;
  const [lo, hi] = CAT_RANGE[cat] ?? [0, -1];
  for (let t = lo; t <= hi; t++) {
    if (sev !== -1) { const ts = INJ_TYPES[t][6]; if (ts !== sev && ts !== -1) continue; }
    if (sev === 3) continue;
    const v = s8(t === recur ? c.rand(3) - 1 : c.rand(INJ_TYPES[t][1]));
    if (v < best) { best = v; res = t; }
  }
  return res;
}

/** Injury::end_player_injury 0x62e700 (historikken 0x58e340 er ikke porteret; nyheden 0x630ee0 til mennesket) */
export function endInjury(c: FitCtx, p: Player, post: boolean): void {
  if (!real(p)) return;
  const r = fitOf(c.g, p), e = r.inj;
  if (!e) return;
  if (post && p.club && c.human(p.club)) c.news?.('recovered', p, e);
  r.inj = null;
}

/** 0x62d5c2–0x62d610: den bedste af klubbens tre fysioterapeutpladser club +0x1cf (ikke-spillerposten +0x1e vist med 0x544410, bl starter på 0).
 *  Hos os klubbens fysioterapeuter (højst 3, STAFF_LIMITS – pladserne i ansættelsesrækkefølgen = id) med Physiotherapy vist af stabens CA som
 *  aiTeam.ts' manager (staffShown/staffIntrinsic; uden CA databasens værdi). */
function physio(c: FitCtx, club: number): number {
  let best = 0;
  const slots = Object.values(c.g.staff).filter((s) => s.club === club && s.role === 'physio').sort((a, b) => a.id - b.id).slice(0, 3);
  for (const s of slots) {
    const v = npShown(s, 0x1e) ?? (s.ca ? staffShown(s.ca, staffIntrinsic(s.attrs.physio, s.ca)) : s.attrs.physio);
    if (s8(v) > best) best = s8(v);
  }
  return s8(best);
}

/** målinger (scripts): nye skader fra kampe og andet (træning, smitte, behandling) – påvirker intet */
export const FIT_COUNT = { match: 0, other: 0 };

/** Injury::add_injury 0x62d250(type, backdate, staff, fixture, allow_outbreak, news_arg, 0, 0) – de kald, spillet bruger (recurrence = 0) */
export function addInjury(c: FitCtx, t: number, backdate: boolean, p: Player, fixture: number, outbreak: boolean, _news: number): CmInjury | null {
  if (!real(p) || t < 0 || t >= 0x52) return null;
  updateFitness(c, p);
  c.train?.(p);                                                                   // 0x62d312: 0x8b1750 (før skaden sættes)
  const r = fitOf(c.g, p);
  let extra = 0;
  if (r.inj) {                                                                    // 0x62d3f1: kun behandling/ferie afløser en skade
    if (![0x4d, 0x4e, 0x4f, 0x51].includes(t)) return null;
    extra = s16(r.inj.w2c);
    r.inj = null;
  }
  r.lt = t;
  const T = INJ_TYPES[t];
  const pb = p.club ? physio(c, p.club) : 0;
  let ebx = ftol((T[3] * (35 - pb)) / 20);
  if (c.rand(pb + 5) > c.rand(20)) ebx -= c.rand(s16(ebx));
  if (t === HOLIDAY) ebx = 0;
  ebx += extra;
  const age = s8(ageAt(p, c.today));
  if (t !== HOLIDAY && T[2] > 10) {
    if (age > 30) { const v = s16(IP(p) + age - 35); if (v > 0) ebx += c.rand(v); }
    if (IP(p) > 10) ebx += c.rand(IP(p) - 10);
  }
  const days = s16(T[2] + ebx);
  // 0x62d705: rand(5·NF + 12) = 0 pr. skadedag løfter byten 0xae2d0c +0xa (Player.cmStaffState), så længe den er < 100
  if (!STAFF_STATE_OFF) for (let k = 0; k < days; k++) {
    const x = p.cmStaffState ?? 0;
    if (x >= 0x64) break;
    if (c.rand(5 * NF(p) + 0xc) === 0) p.cmStaffState = (x + 1) & 0xff;
  }
  // 0x62d758: computerens behov ved lange skader og nyheden 0x842b00 – ikke porteret
  let w2a = s16(ftol(T[4] * 0.01 * days));
  if (w2a + 60 < days) w2a = s16(days - 60);
  const d0 = backdate ? c.today - (c.rand(days) + 1) : c.today;                   // 0x54c8e0
  const e: CmInjury = { t, d: d0, w28: days, w2a, w2c: days, w2e: w2a };
  if (!backdate) FIT_COUNT[fixture ? 'match' : 'other']++;
  updateFitness(c, p);
  r.inj = e;
  if (!backdate && p.club && c.human(p.club)) c.news?.('injury', p, e);          // 0x62dca0 (nyheden går også til landet m.fl. – ikke porteret)
  void fixture; void _news;
  r.b1c = 0;
  rollRecurring(c, r, e);
  if (r.rt === t) {                                                               // 0x62d9d1: tilbagevendende → måske karrierens slut
    r.rl = s8(r.rl + 1);
    if (r.rl > 1) { let m = 200 - T[2]; if (m <= 5) m = 5; if (c.rand(r.rl) > c.rand(m)) c.retire?.(p); }
  }
  const ip = IP(p);
  let retired = false;
  const tryRetire = (lim: number, base: number) => { if (!retired && e.w2a > lim && c.rand(e.w2a) > base) { retired = true; c.retire?.(p); } };
  if (age > 36) tryRetire(120 - ip - age, 90 - age);                              // 0x62da79: alderen (kaskade, sic)
  if (!retired && age > 33) tryRetire(150 - ip - age, 90 - age);
  if (!retired && age > 31) tryRetire(300 - age, 200 - age);
  if (!retired && e.w2a > 500 && c.rand(NF(p) + 5) === 0) { retired = true; c.retire?.(p); }
  if (outbreak && t <= 2 && p.club) addOutbreak(c, t, p.club);
  return e;
}

/** Injury::roll_recurring_injury 0x62e500: 1 af 20 nye skader af en type, der kan vende tilbage, bliver tilbagevendende; så behandles eller
 *  kureres én af de andre med en tilbagevendende skade (den med højest rand(101) − 5·niveau − Injury Proneness) */
function rollRecurring(c: FitCtx, r: CmFit, e: CmInjury): void {
  if (r.rt !== -1 || !INJ_TYPES[e.t][5]) return;
  const x = c.rand(20);
  if (x !== 0) return;
  r.rl = x; r.rt = e.t;
  let best = 0, bestP: Player | null = null;
  for (const q of Object.values(c.g.players)) {
    if (!real(q) || !q.cmFit || q.cmFit.rt === -1) continue;
    const v = s8(c.rand(101) + s8(-5 * q.cmFit.rl) - IP(q));
    if (v > best) { best = v; bestP = q; }
    if (best >= 0x5f) break;
  }
  if (!bestP) return;
  const club = bestP.club ? c.g.clubs[bestP.club] : undefined;
  if (club && clubRep(c.g, club) > 0x109a && !c.human(club.id) && c.rand(3) === 0) {
    const rt = bestP.cmFit!.rt;
    const k = rt >= 11 && rt <= 59 ? TREAT[rt - 11] : 2;
    addInjury(c, k === 0 ? 0x4e : k === 1 ? 0x4f : 0x4d, false, bestP, 0, true, -1);
    return;
  }
  bestP.cmFit!.rt = -1; bestP.cmFit!.rl = 0;
}
/** 0x62e6cc: behandlingen af en tilbagevendende skade (type 11..59): 0 → 0x4e, 1 → 0x4f, 2 → 0x4d */
const TREAT = [0, 1, 1, 2, 2, 2, 0, 1, 2, 1, 2, 2, 0, 2, 1, 1, 1, 1, 2, 0, 1, 2, 2, 2, 0, 1, 1, 2, 2, 2, 0, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1];
const clubRep = (g: GameState, club: Club) => g.cmClubRep?.[club.id] ?? club.rep * 100;

/** Injury::add_illness_outbreak 0x62e820 (sygdom 0–2: 1 af 4 springes over; landshold aldrig) */
function addOutbreak(c: FitCtx, t: number, club: number): void {
  if (t === 4) return;
  if (t === 3) { if (c.rand(15) !== 0) return; } else if (c.rand(4) === 0) return;
  const list = (c.g.cmOutbreaks ??= []);
  list.push({ d: c.today, t, club, fx: -1 });                                    // add_injury giver fixture 0 (0x62dbf2)
  list.sort((x, y) => x.d - y.d);                                                 // qsort 0x778e90 efter datoen
}
/** Injury::spread_illness_outbreaks 0x62e9e0: hvert udbrud de seneste fem dage smitter rand(3) af klubbens trup (club +0xd7: rand(50)) */
function spreadOutbreaks(c: FitCtx): void {
  const list = c.g.cmOutbreaks;
  if (!list?.length) return;
  const fiveAgo = c.today - 5;
  let expired = 0;
  for (const o of list) {
    if (c.today < o.d) break;
    if (fiveAgo > o.d) { expired++; continue; }
    let n: number;
    if (o.t === 3) { if (o.d !== c.today) continue; n = c.rand(4) + 1; } else n = c.rand(3);
    const sq = c.squadOf(o.club);
    for (let k = 0; k < 20 && n > 0; k++) {
      const s = sq[c.rand(50)];
      if (!real(s)) continue;
      if (fitOf(c.g, s).lt === o.t) continue;
      addInjury(c, o.t, false, s, 0, false, o.fx);
      n--;
    }
  }
  if (expired) list.splice(0, expired);
}

// ---------------------------------------------------------------- 0x62b7b0 dagligt

/** 62ce30: sommerpausen inden for 40 dage efter sæsonens slut (ingen træningsskader) – ikke for spillere på landsholdsophold (staff +0x24 og
 *  datoen 0x76e040 efter i dag) og ikke i klubber med en europæisk turnering (club +0x1db ≠ −1). */
function closeSeason(c: FitCtx, p: Player): boolean {
  const club = p.club ? c.g.clubs[p.club] : undefined;
  if (!club || c.onDuty?.(p) || c.inEurope?.(club.id)) return false;
  const [inSeason, , end] = clubSeason(club.nation, c.today);
  return !inSeason && u16(c.today - end) < 40;
}

/** Injury::daily_update 0x62b7b0: knocklisten tømmes, skadernes tællere tæller ned, træningsskader på hverdage (n = max(10, spillere/150)
 *  tilfældige spillere), og sygdomsudbruddene smitter. `players` = posterne i staff-tabellens rækkefølge. */
export function injuryDaily(c: FitCtx, players: Player[], nonPlayers = 0): void {
  knocks.clear();
  for (const p of players) { const e = p.cmFit?.inj; if (e) { e.w2c = s16(e.w2c - 1); e.w2e = s16(e.w2e - 1); } }
  const start = dayNum(c.g.cmFitStart ?? c.g.date);
  if (c.today < start && doyOf(c.today) === 180) for (const p of players) updateFitness(c, p);
  const wd = (new Date(c.today * 86400000).getUTCDay() + 6) % 7;                // 0x54a3f0: 0 = mandag
  if (wd !== 6 && wd !== 5 && players.length) {
    // [0xae2364] tæller hele staff-tabellen (også trænere, managere …): en ikke-spiller trækkes om (0x62b8e9) – her pladserne efter spillerne
    const cnt = players.length + nonPlayers;
    const n = s16(Math.max(10, ftol(cnt / 150)));
    const t7 = n + Math.floor((n * -1840700269) / 4294967296);                     // 0x92492493: n/14
    const m = (t7 >> 3) + ((t7 >> 3) < 0 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const p = players[c.rand(cnt)] as Player | undefined;
      if (!real(p)) { i--; continue; }
      if (p.injury?.key === 'awol') continue;                                     // 0x418f60
      if (gkRating(p) === 20 && c.rand(5) > c.rand(2)) continue;
      const r = fitOf(c.g, p);
      if (r.inj) continue;
      if (r.rt > -1) { if (c.rand(100) > 2 * (5 * (IP(p) - 3) + r.load + r.rl)) continue; }
      else if (c.rand(160) > 2 * (5 * (IP(p) - 3) + r.load)) continue;
      if (c.rand(3) !== 0) continue;
      if (s8(r.load) < 20) continue;
      let cat = -1;
      if (r.rt > -1 && c.rand(r.rl + 2) > c.rand(3)) cat = INJ_TYPES[r.rt][0];
      else {
        for (;;) {
          cat = c.rand(12);
          if (cat === 0 && c.rand(100) !== 0) continue;
          if (c.rand(CAT_RANGE[cat][1] - CAT_RANGE[cat][0] + 2) === 0) continue;
          break;
        }
      }
      if (gkRating(p) < 15 && cat === 7) { i--; continue; }
      if (closeSeason(c, p)) continue;
      const t = chooseInjuryType(c, cat, i < m ? -1 : 0, p);
      if (t === 20) continue;                                                     // 0x62bcc0: shin splints springes over
      trainingAttrDrop(c, p, t, cat);
      addInjury(c, t, false, p, 0, true, -1);
    }
  }
  spreadOutbreaks(c);
}

/** 0x62badc–0x62bc64: træningsskaden koster Acceleration (+0x1b), Pace (+0x36) eller Agility (+0x1d) for de bedste */
function trainingAttrDrop(c: FitCtx, p: Player, t: number, cat: number): void {
  const ia = ATTRS.indexOf('acceleration' as never), ip = ATTRS.indexOf('pace' as never), ig = ATTRS.indexOf('agility' as never);
  const r = fitOf(c.g, p);
  const recurCat = r.rt > -1 && INJ_TYPES[r.rt][0] === cat;
  const dec = (i: number, n: number) => { p.attrs[i] = s8(p.attrs[i] - n); };
  if ([12, 23, 26, 27, 31].includes(t)) {
    const acc = p.attrs[ia];
    if (acc === 20) { if (recurCat) dec(ia, 1 + c.rand(3)); else if (c.rand(3) !== 0) dec(ia, 1 + c.rand(2)); }
    else if (acc > 15 && c.rand(3) === 0) dec(ia, 1);
    if (p.attrs[ip] === 20) { if (recurCat) dec(ip, 1 + c.rand(3)); else if (c.rand(3) !== 0) dec(ip, 1); }
    else if (p.attrs[ia] > 17 && c.rand(3) === 0) dec(ia, 1);
  } else if (t === 28) {
    if (r.rt > -1 && INJ_TYPES[r.rt][0] === cat && p.attrs[ia] === 20 && c.rand(3) === 0) dec(ia, 1);
  } else if (t === 45) {
    if (p.attrs[ig] === 20) p.attrs[ig] = 19; else if (p.attrs[ig] > 15 && c.rand(3) === 0) dec(ig, 1);
  } else if (t === 59 || t === 60) {
    if (p.attrs[ig] === 20) { if (c.rand(3) !== 0) dec(ig, 1); } else if (p.attrs[ig] > 15 && c.rand(3) === 0) dec(ig, 1);
  }
}

// ---------------------------------------------------------------- spilstarten (Injury::Injury 0x62a680 → 0x62cf70, 0x5cc850, 0x62a920)

/** Injury::init_records 0x62cf70: alle poster fra databasens dato; 1 af 10 spillere med en type, der kan vende tilbage (rand(82)), får den
 *  som tilbagevendende; 1 af 100 en skade med en tilfældig startdato */
export function initRecords(c: FitCtx, players: Player[]): void {
  for (const p of players) {
    if (!real(p)) continue;
    p.cmFit = newFit(c.today);
    const x = c.rand(82);
    if (INJ_TYPES[x][5] && c.rand(10) === 0) p.cmFit.rt = x;
    if (c.rand(100) === 0) {
      const t = chooseInjuryType(c, c.rand(12), -1, p);
      addInjury(c, t, true, p, 0, true, -1);
    }
  }
}
/** Injury::init_squad_fitness 0x62a920: Fitness = 10000 − 75·clamp(dage til sæsonens slut − NF/2 − Professionalism/4, 1, 40) */
export function initSquadFitness(c: FitCtx, players: Player[]): void {
  for (const p of players) {
    if (!real(p) || !p.club || !p.cmFit) continue;
    const club = c.g.clubs[p.club];
    const [inSeason, , end] = clubSeason(club?.nation, c.today);
    let ebx = 0;
    if (!inSeason) { ebx = end - c.today; if (ebx > 80) ebx = 40; else if (ebx > 40) ebx = s8(80 - ebx); }
    let v = ebx - ftol(NF(p) / 2) - (prof(p) >> 2);
    if (v < 1) v = 1; else if (v > 40) v = 40;
    p.cmFit.f = 10000 - 75 * v;
  }
}

// ---------------------------------------------------------------- spillets kobling (sim.ts/newgame.ts)

/** talrækken for en dag og et formål (0x90cfc0's rolle) */
export const fitRand = (g: GameState, today: number, salt: number) => cmRand(g.seed, today, 0x5f17, salt);

/** p.injury/p.condition af posten (0x62c400/0x62c590) – spillets øvrige systemer (udtagelse, skærme, zonemotoren) læser dem. AWOL er spillets egen. */
export function syncPlayer(c: FitCtx, p: Player): void {
  if (!real(p) || !p.cmFit || p.injury?.key === 'awol') return;
  const st = injuryStatus(c, p);
  const e = p.cmFit.inj;
  if (st === 2 && e) {
    const left = e.w2a - dateGap(c.today, e.d);
    p.injury = { key: `cm${e.t}`, days: Math.max(1, left), total: e.w2a };
  } else p.injury = null;
  p.condition = condition(c, p) / 100;
}

/** TRAINING_SCHEDULE::get_load 0x8b4f60: min(100, ftol(1,3·c4) + ftol(0,5·c5) + ftol(0,5·c6) + ftol(0,5·c7) + ftol(0,5·c8)) af skemaets fem
 *  områder (+4..+8; ord-regning, sic: −ftol(−1,3·c4) …) */
export function scheduleLoad(c: readonly number[]): number {
  let si = s16(ftol(c[4] * 0.5) - ftol(c[0] * -1.3));
  si = s16(si - ftol(c[3] * -0.5)); si = s16(si - ftol(c[2] * -0.5)); si = s16(si - ftol(c[1] * -0.5));
  return si < 100 ? si : 100;
}
/** de faste skemaer 0x8b4e50(id, type) – 0x8b3d40 lægger 0..6 ud: 0 og 7 alt 0; 1 det generelle (25/25/25/25/0); 2–5 ét område på 50 og de
 *  andre tre på 10; 6 målmændene (10/10/0/10/50). c4 (vægt 1,3) er konditionen, c8 målmandstræningen, c5–c7 de tre andre (samme vægt). */
const PRESET: Record<number, number[]> = {
  0: [0, 0, 0, 0, 0], 1: [25, 25, 25, 25, 0], 2: [50, 10, 10, 10, 0], 3: [10, 50, 10, 10, 0], 4: [10, 10, 50, 10, 0], 5: [10, 10, 10, 50, 0], 6: [10, 10, 0, 10, 50],
};
/** vores træningsskemaer (training.ts SCHEDULES) → originalens: generelt = 1, kondition = 2 (c4), målmænd = 6, hvile = 0, de øvrige
 *  (forsvar, boldkontrol, angreb, afslutning, dødbolde) et af 3–5 (c5–c7 – samme belastning) */
const SCHEDULE_PRESET: Record<string, number> = { general: 1, fitness: 2, defending: 3, ballcontrol: 4, tactics: 3, attacking: 5, shooting: 5, setpieces: 4, goalkeeping: 6, rest: 0 };
/** træningsbelastningen +0x1e: computerens spillere 50 (0x62cf70; sat til 50, når en spiller forlader en menneskeklub); et menneskes spillere
 *  efter deres skema (0x8b1750 → 0x62c660 med 0x8b4f60); uden skema originalens standard 0x8b3d40 (GK ≥ 15 målmandsskemaet, ellers det generelle) */
export function trainingLoad(p: Player, human: boolean): number {
  if (!human) return 50;
  const k = p.training ? SCHEDULE_PRESET[p.training] : undefined;
  return scheduleLoad(PRESET[k ?? (gkRating(p) >= 15 ? 6 : 1)]);
}

/** at gemme/indlæse: et spil uden poster får dem ved første dag (som 0x62cf70 uden skaderne) */
export function fitActive(g: GameState): boolean { return cmActive(g); }
export { isoOf as fitIso, addDays as fitAddDays };
