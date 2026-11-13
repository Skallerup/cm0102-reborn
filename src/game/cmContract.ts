// CONTRACT_MANAGER::daily_update 0x4c7ac0 og dens hjælpere (cm0102.exe 3.9.68, oversat instruktion for instruktion 12/11-2026) – ovenpå
// cmMem.ts (originalens hukommelse: poster på originalens adresser, kald, porten ikke laver, via c.call).
//
// Kaldt (thiscall på [0xae1050]) med (dato-peger = 0xae2c90, tidspunkt [0xae2c88] 0..2, 1) af forkørslen 0x5cc850 (0x5cc9ef) og dagen 0x5cccd0
// (0x5cd406), hvert tidspunkt. Strukturen:
//   tidspunkt 0:  de faste datoer: [0xae1048] = i dag + 7, [0xae1030] +30, [0xae1058] +60, [0xae1010] +91, [0xae1060] +121, [0xae1040] +152,
//                 [0xae1090] +182, [0xae1068] +365, [0xae1008] +550, [0xae1020] +1095 (0x867d30 get_expiry_band læser dem).
//   tidspunkt 2:  (1) forhandlingslisten this+0x28 (0x15 bytes: +8 personens id, +0xc dato) – poster ældre end (25 − Loyalty)·2 dage fjernes
//                 (den sidste flyttes ind), listen sorteres (qsort 0x945333 med 0x4dc970: +0, +4, +8).
//                 (2) for hver person (staff à 0x6e, flag = 1):
//                   – før spillet er lavet ([0xdd711c] = 0): kontrakten, der udløber i dag, får type 1 (+0x35 & 0xc1 | 1).
//                   – værdien staff +0x52 (0x4d0c60): menneskets spillere med lejeliste-bit (+0x4e & 4); computerens spillere på ulige dage
//                     (+0x4e |= 4), ikke-spillere hver dag; begrænset af en aktiv frikøbsklausul (+0x21). Ingen kontrakt/klub → 0.
//                   – lejekontrakten (rækken +4), der udløber i dag: 0x4da590(staff, 6, 0) (ikke type 7) og end_loan 0x4d07e0.
//                   – spillerne, når [0xae2330] > i dag: forlængelsestilbud (0x4cda70, faktor 1,0) fra computerens klub efter 180 dage med
//                     kontrakten, hvis den udløber inden 1095 dage og [0xae2330] = i dag + 7/30/42/60/70/91 (ikke uønsket, manager ikke uven,
//                     under 32 år, trupstatus 1 eller 2/3 med omdømme > 6750 / under 24 år og PA > 100, eller 5 med PA > 100).
//                   – type 2 med mere end 182 dage tilbage og ingen leje: FIFA-perioden 0x868210, så tilbud som ovenfor (uden datokravet) og
//                     nyheden 0x4d6790(kontrakt, 7, bosman, 1) til menneskets klub.
//                   – type 1 (udløbet) + 31 dage: spillere, der vil væk (0x866f60) eller er sat fri (+0x49), uden tilbud/forhandlinger/kø →
//                     nyheden 0x4da590(staff, 1, 0); spillende manager (12) → manager (5), spillende træner (13) → træner (6), spillende
//                     fysioterapeut (15) → fysioterapeut (8) (fjernes fra truppens 50 pladser +0xd7), ellers fri transfer 0x8c16b0(staff, 1, −1).
//                   – ellers efter udløbsbåndet 0x867d30 (0..14): ønskelister 0x842c00 for spillere, der er sat fri (+0x49), og for gode spillere
//                     (omdømme > 3750/1750, Loyalty < 15, 19–30 år, landet tillader frie transfers 0x544670), der vil væk → +0x49 = 1 og
//                     Bosman-nyheden 0x4d6d70; forlængelsestilbud på båndene 550 dage (shortlist), 365 dage (nyhed + tilbud + svar 0x4d49a0),
//                     3/5, 1, 7, 9/11 og 13 (faktor 1,0–1,4 efter trupstatus og computerens shortlist 0x849ce0) og udløbsnyhederne 0x4d6790;
//                     på udløbsdagen eller efter: type 1, 0x4da590(staff, 2, 0), spillere, der vil væk → ønskelister, ellers tilbud (kun lejede,
//                     sic) eller fri transfer.
//                   – kontrakten udløber i dag: type 5 (prøvetid) → nyheden, statistikken 0x7c5fe0, kontrakten fjernes (+0 = −1, rækken −1,
//                     lønsummen 0x598370), udtagelsen 0x896c60 og klubbens plads 0x53c190; andre typer → type 1 og, er han sat fri (+0x49) uden
//                     leje og forhandlinger, nyheden 0x4da590(staff, 2, 1) og fri transfer 0x8c1af0.
//                 (3) dag 36 og 200: beslutningslisten komprimeres (fra +0x18).
//   alle:         beslutningslisten sorteres (qsort 0x945333 med 0x4dc910, når +0x1c ≠ 0) og de forfaldne behandles (0x4cd9c0 → 0x4ce4e0).
//
// CONTRACT_MANAGER (this = [0xae1050]): +0 kontrakterne (80 bytes), +0xc beslutningsdatoerne (14 bytes: +0 staff-id (−1 = brugt), +4 Date,
// +0xc tidspunkt, +0xd art: 2 påmindelse, 3 tilbudsbeslutning), +0x10 kapacitet, +0x14 antal, +0x18 næste forfaldne, +0x1c antal usorterede
// i halen, +0x28/+0x2c forhandlingslisten (0x15 bytes), +0x34 tilbudslisten (liste 0xe bytes: +0 antal, +2 hoved, +6 hale, +0xa iterator;
// knude +0 data, +4 størrelse, +6 næste, +0xa forrige) med tilbud à 0x6f bytes (kontrakten 0x50 + +0x50 tilstand (0 åben, 1 afvist,
// 2 accepteret, 3), +0x51 Date, +0x59 transfertilbuddets indeks (−1), +0x5d, +0x61 job, +0x62 aktiv, +0x63/+0x67/+0x6b), +0x38 tilbageholdte.
// Rækken [0xae2d0c] + 79·id: +0 kontrakt, +4 lejekontrakt, +8 antal tilbud (byte), +0xb flag (0x80 svar ventes, 0x30 spærret).
//
// Date (8 bytes): +0 dag i året (s16), +2 år (u16 – sammenlignes uden fortegn), +4 skudår (dword). 0x54c5b0/0x54c8e0/0x54cdb0 bruger de statiske
// mellemregninger 0xae2420/0xae24c0/0xae2470 (skrevet som i originalen).
//
// c.call-kald (thiscall: første argument = ecx; adresserne som tal): 0x4d0c60 (værdien, this), 0x600a50 (menneske, cdecl 5), 0x7875e0 ([0xb7431c]),
// 0x7a7eb0 ([0xb7434c]), 0x8d0a70/0x8c5cf0/0x8c5e40/0x8c1870/0x8c16b0/0x8cca10/0x8c1af0/0x8c61e0/0x8c38b0/0x8c28c0/0x8c2180/0x8c5410/0x8c5430/
// 0x8c7560/0x8cd150/0x8cc5b0/0x8c1f80/0x8c2060 ([0xde1f54]), 0x842c00/0x849ce0/0x849f00/0x846920/0x844780 ([[0xde1f54]+0x856]), nyhederne
// 0x4d6790/0x4da590/0x4d49a0/0x4d6d70 (this), 0x4d07e0 (this), 0x866f60 (kontrakten), 0x868210 (kontrakten), 0x5477d0/0x547840/0x544670/0x5444a0/
// 0x544820/0x547a10/0x547d90/0x53c190/0x549c90 (cdecl), 0x7c5fe0 ([0xb74350]), 0x5a0590 ([0xae2a38]), 0x598370/0x5968d0/0x597db0 (finans-
// posten), 0x896c60 ([0xde1d08]), 0x4cf5f0 (this), 0x8e7b50/0x8e82f0 (transfertilbuddet), 0x62ed70 ([0xb63d28]), 0x7549b0 ([0xb6b7c8]),
// 0x69fc60 ([0xb67a44]), 0x7a6e20/0x7a6e30 ([0xb7434c]), 0x8b2880 ([0xde1f44]), 0x7f7270 ([0xb74448]), listerne 0x68d020/0x68d040/0x68d0d0/
// 0x68d1f0 (listen), new 0x944cf1, malloc 0x944e46 og realloc 0x945667 (cdecl). Statuslinjen 0x549f70/0x66f4e0/0x802f80 og fejlboksene
// (0x944cff/0x90d130/0x944c9f/0x5e8290) er udeladt. rand 0x90cfc0 → c.rand: rand(20) i båndet 14 (0x4c8a92), rand(n)/rand(4)/rand(2) i
// 0x4ce4e0 (forholdet til managerne), rand(5)/rand(2)/rand(4) i 0x4cd230.
//
// Lokale variabler, originalen sender videre som pegere (kontrakter, tilbud, datoer, lister, ud-parametre), ligger i en stak fra FRAME_TOP nedad.

import { G, ftol, s8, s16, u8, staffAt, clubAt, getContract, type CmCtx, type CmMem } from './cmMem';
import { msvcQsort } from './engine/grid/subs';
import { constructContract_85e410, setToDesiredContract_85fc50, calcContractValue_866830, expiryBand_867d30, hasActiveReleaseClause_867b50, contractForClub_4cf5f0 } from './cmContractWant';


// ---------------------------------------------------------------- listen (0xe bytes: +0 antal w, +2 hoved, +6 hale, +0xa iterator;
// knude 0xe: +0 data, +4 størrelse w, +6 næste, +0xa forrige) – 0x68cfc0/0x68d010/0x68d020/0x68d040/0x68d0d0/0x68d1f0. new 0x944cf1 via
// c.call (originalens adresser i afspilningen), delete 0x944c94 er en no-op her.
export function listInit_68d020(m: CmMem, L: number): number { m.w32(L + 2, 0); m.w32(L + 6, 0); m.w32(L + 0xa, 0); m.w16(L, 0); return L; }
function nodeNew_68cfc0(c: CmCtx, node: number, data: number, size: number): number {
  const m = c.m, n = s16(size);
  m.w32(node + 0xa, 0); m.w32(node + 6, 0);
  const p = c.call(0x944cf1, n) >>> 0;
  m.w16(node + 4, size); m.w32(node, p);
  for (let i = 0; i < n; i++) m.w8(p + i, m.u8(data + i));
  return node;
}
export function listDestroy_68d040(m: CmMem, L: number): void {
  while (m.u32(L + 2)) { const n = m.u32(L + 2); m.w32(L + 2, m.u32(n + 6)); }
}
export function listAdd_68d0d0(c: CmCtx, L: number, data: number, size: number): number {
  const m = c.m;
  const empty = m.u16(L) === 0;
  const raw = c.call(0x944cf1, 0xe) >>> 0;
  const node = raw ? nodeNew_68cfc0(c, raw, data, size) : 0;
  if (empty) {
    m.w32(L + 2, node);
    if (!node) return 0;
  } else {
    m.w32(m.u32(L + 6) + 6, node);
    const tail = m.u32(L + 6), nx = m.u32(tail + 6);
    if (!nx) return 0;
    m.w32(nx + 0xa, tail);
  }
  const nn = empty ? node : m.u32(m.u32(L + 6) + 6);
  m.w16(L, m.u16(L) + 1);
  m.w32(L + 6, nn);
  return m.u32(nn);
}
export function listRemove_68d1f0(m: CmMem, L: number, data: number): number {
  const head = m.u32(L + 2);
  let b = head;
  for (; b; b = m.u32(b + 6)) {
    const n = s16(m.u16(b + 4)), d = m.u32(b);
    let eq = true;
    for (let i = 0; i < n; i++) if (m.u8(d + i) !== m.u8(data + i)) { eq = false; break; }
    if (eq) break;
  }
  if (!b) return 0;
  if (b === head) m.w32(L + 2, m.u32(b + 6)); else m.w32(m.u32(b + 0xa) + 6, m.u32(b + 6));
  if (b === m.u32(L + 6)) m.w32(L + 6, m.u32(b + 0xa)); else m.w32(m.u32(b + 6) + 0xa, m.u32(b + 0xa));
  const it = m.u32(L + 0xa);
  m.w16(L, m.u16(L) - 1);
  if (b === it) m.w32(L + 0xa, m.u32(it + 6));
  return 1;
}

// ---------------------------------------------------------------- stak til lokale poster

/** stakkens top (under billedet 0x400000 og under cmContractWant.ts' SCR 0x300000) */
export const FRAME_TOP = 0x002ff000;
let SP = FRAME_TOP;
function alloc(m: CmMem, n: number): number {
  SP = (SP - ((n + 7) & ~7)) >>> 0;
  for (let i = 0; i < n; i++) m.w8(SP + i, 0);
  return SP;
}

// ---------------------------------------------------------------- Date

interface Dt { d: number; y: number; x: number }
const rdDate = (m: CmMem, a: number): Dt => ({ d: m.s16(a), y: m.u16(a + 2), x: m.u32(a + 4) });
const wrDate = (m: CmMem, a: number, t: Dt) => { m.w16(a, t.d); m.w16(a + 2, t.y); m.w32(a + 4, t.x); };
const dGT = (a: Dt, b: Dt) => a.y > b.y || (a.y === b.y && a.d > b.d);
const dLT = (a: Dt, b: Dt) => a.y < b.y || (a.y === b.y && a.d < b.d);
const dEQ = (a: Dt, b: Dt) => a.y === b.y && a.d === b.d;
const leap = (y: number) => { y &= 0xffff; return !(y % 2 === 1 || y % 4 !== 0 || (y % 100 === 0 && y % 400 !== 0)); };

/** 0x54c5b0 Date::add_days(n) – resultatet (også i den statiske 0xae2420) */
export function addDays_54c5b0(m: CmMem, src: number, n: number): Dt {
  const S = 0xae2420;
  if (!(m.u8(0xae2469) & 1)) { m.w8(0xae2469, m.u8(0xae2469) | 1); wrDate(m, S, { d: 0x28, y: 0x7b4, x: 1 }); }
  const si = s16(n);
  if (si < 0) {
    wrDate(m, S, rdDate(m, src));
    const r = subDays_54c8e0(m, S, -n);
    wrDate(m, S, r);
    return rdDate(m, S);
  }
  let bp = m.u16(src + 2);
  m.w16(S + 2, bp);
  let di = s16(m.s16(src) + si);
  m.w16(S, di);
  for (;;) {
    if (leap(bp)) { if (di > 0x16d) { di = s16(di - 0x16e); bp = (bp + 1) & 0xffff; continue; } }
    else if (di > 0x16c) { di = s16(di - 0x16d); bp = (bp + 1) & 0xffff; continue; }
    break;
  }
  m.w16(S + 2, bp); m.w16(S, di); m.w32(S + 4, leap(bp) ? 1 : 0);
  return rdDate(m, S);
}
/** 0x54c8e0 Date::sub_days(n) – resultatet (også i den statiske 0xae24c0) */
export function subDays_54c8e0(m: CmMem, src: number, n: number): Dt {
  const S = 0xae24c0;
  if (!(m.u8(0xae249e) & 1)) { m.w8(0xae249e, m.u8(0xae249e) | 1); wrDate(m, S, { d: 0x28, y: 0x7b4, x: 1 }); }
  const si = s16(n);
  if (si < 0) {
    wrDate(m, S, rdDate(m, src));
    const r = addDays_54c5b0(m, S, -n);
    wrDate(m, S, r);
    return rdDate(m, S);
  }
  let bp = m.u16(src + 2);
  m.w16(S + 2, bp);
  let di = s16(m.s16(src) - si);
  m.w16(S, di);
  for (;;) {
    const p = (bp - 1) & 0xffff;
    if (di >= 0) break;
    di = s16(di + (leap(p) ? 0x16e : 0x16d)); bp = p;
  }
  m.w16(S + 2, bp); m.w16(S, di); m.w32(S + 4, leap(bp) ? 1 : 0);
  return rdDate(m, S);
}
/** 0x54cdb0 Date::days_since(this, anden) = this − anden i dage (skudårstesten y − 1 i den fremadrettede gren, sic) */
export function daysSince_54cdb0(m: CmMem, self: number, o: Dt): number {
  const S = 0xae2470;
  if (!(m.u8(0xae2418) & 1)) { m.w8(0xae2418, m.u8(0xae2418) | 1); wrDate(m, S, { d: 0x28, y: 0x7b4, x: 1 }); }
  const ax = m.u16(self + 2), bx = o.y & 0xffff;
  let edi = 0;
  if (bx > ax) {
    wrDate(m, S, rdDate(m, self));
    let si = m.u16(S + 2);
    if (si < bx) {
      do { edi -= leap((si - 1) & 0xffff) ? 0x16e : 0x16d; si = (si + 1) & 0xffff; } while (si < bx);
      m.w16(S + 2, si);
    }
  } else if (bx < ax) {
    wrDate(m, S, rdDate(m, self));
    let si = m.u16(S + 2);
    if (si > bx) {
      do { si = (si - 1) & 0xffff; edi += leap(si) ? 0x16e : 0x16d; } while (si > bx);
      m.w16(S + 2, si);
    }
  }
  return (edi + m.s16(self) - s16(o.d)) | 0;
}
/** 0x54a110 Date::Date(): dag 40 i 1972, skudår */
export const dateInit_54a110 = (m: CmMem, a: number) => wrDate(m, a, { d: 0x28, y: 0x7b4, x: 1 });
/** 0x53ab90 alder (byte, s8) på datoen; staff 0 → fejlboks og −1 */
export function age_53ab90(m: CmMem, staff: number, date: number): number {
  if (!staff) return -1;
  const dd = m.s16(staff + 0x10) - m.s16(date);
  const a = dd > 0 ? m.u16(date + 2) - m.u16(staff + 0x12) - 1 : m.u16(date + 2) - m.u16(staff + 0x12);
  return s8(a);
}

/** 0x53b610: jobbet ≠ 11 (ikke ren spiller) */
export const notPlayer_53b610 = (job: number) => (job & 0xff) !== 0xb;
/** 0x53b620: et spillende job (11, 12, 13, 15) */
export const isPlayerJob_53b620 = (job: number) => { const j = job & 0xff; return j === 0xb || j === 0xc || j === 0xd || j === 0xf; };
/** 0x53b900: klubben er et landshold (id ≥ [0xae235c] − 2·[0xae2350]); 0 → fejlboks og 0 */
export const isNationalSide_53b900 = (m: CmMem, club: number) => club !== 0 && m.s32(club) >= m.s32(0xae235c) - 2 * m.s32(0xae2350);

// ---------------------------------------------------------------- lister (0x68d0xx)

/** list+0xa = hovedet (iteratoren nulstilles) */
const listReset = (m: CmMem, list: number) => m.w32(list + 0xa, m.u32(list + 2));
/** 0x68d1b0 next: knudens data, iteratoren flyttes */
export function listNext_68d1b0(m: CmMem, list: number): number {
  const n = m.u32(list + 0xa);
  if (!n) return 0;
  m.w32(list + 0xa, m.u32(n + 6));
  return m.u32(n);
}

// ---------------------------------------------------------------- små opslag

const rowOf = (m: CmMem, id: number) => (m.u32(G.ROWS) + 79 * id) >>> 0;
/** kontrakten (0x4cf5a0 inline med this = CONTRACT_MANAGER) */
function contractOf(m: CmMem, self: number, st: number): number {
  if (!st) return 0;
  const id = m.s32(st);
  if (id >= m.s32(G.STAFF_COUNT)) return 0;
  const ix = m.s32(rowOf(m, id));
  if (ix < 0) return 0;
  return (m.u32(self) + 80 * ix) >>> 0;
}
/** lejekontrakten (rækken +4) eller 0 */
function loanOf(m: CmMem, self: number, st: number): number {
  const id = m.s32(st);
  if (id >= m.s32(G.STAFF_COUNT)) return 0;
  const ix = m.s32(rowOf(m, id) + 4);
  if (ix < 0) return 0;
  return (m.u32(self) + 80 * ix) >>> 0;
}
const tm = (m: CmMem) => m.u32(0xde1f54);
const slm = (m: CmMem) => m.u32(m.u32(0xde1f54) + 0x856);
const clubOfC = (m: CmMem, con: number) => clubAt(m, m.s32(con + 4));
const isHuman = (c: CmCtx, club: number, a: number, b: number) => c.call(0x600a50, club, a, b, 0, 0) !== 0;
const retiring = (c: CmCtx, st: number) => (c.call(0x7a7eb0, c.m.u32(0xb7434c), st) & 0xff) !== 0;
const newsHuman = (c: CmCtx, club: number) => c.call(0x7875e0, c.m.u32(0xb7431c), club) !== 0;
const bosman = (c: CmCtx, st: number) => c.call(0x8d0a70, tm(c.m), st) !== 0;
const inShortlist = (c: CmCtx, club: number, st: number) => c.call(0x849ce0, slm(c.m), club, st, 0, 0) !== 0;
const band = (c: CmCtx, con: number) => s8(expiryBand_867d30(c.m, con));
const wantsToLeave = (c: CmCtx, con: number) => c.call(0x866f60, con) !== 0;
const status4f = (m: CmMem, con: number) => m.u8(con + 0x4f) >> 4;
/** byten +8 i rækken ± 1 (antal tilbud) */
const offerCount = (m: CmMem, st: number, d: number) => { const a = rowOf(m, m.s32(st)) + 8; m.w8(a, u8(m.u8(a) + d)); };

/** 0x4dc970 (forhandlingsposterne: +0, +4, +8) */
const cmpTalks = (a: Uint8Array, b: Uint8Array) => {
  const dw = (r: Uint8Array, o: number) => (r[o] | (r[o + 1] << 8) | (r[o + 2] << 16) | (r[o + 3] << 24));
  if (dw(a, 0) !== dw(b, 0)) return (dw(a, 0) - dw(b, 0)) | 0;
  if (dw(a, 4) !== dw(b, 4)) return (dw(a, 4) - dw(b, 4)) | 0;
  return (dw(a, 8) - dw(b, 8)) | 0;
};
/** 0x4dc910 (beslutningsposterne: datoen 0x456770/0x456740, så tidspunktet +0xc) */
const cmpDecision = (a: Uint8Array, b: Uint8Array) => {
  const day = (r: Uint8Array) => s16(r[4] | (r[5] << 8)), yr = (r: Uint8Array) => r[6] | (r[7] << 8);
  if (yr(b) > yr(a) || (yr(b) === yr(a) && day(b) > day(a))) return -1;
  if (yr(b) < yr(a) || (yr(b) === yr(a) && day(b) < day(a))) return 1;
  return s8(a[0xc]) - s8(b[0xc]);
};
/** qsort 0x945333 på hukommelsen: n poster à w bytes fra a */
function qsortMem(m: CmMem, a: number, n: number, w: number, cmp: (x: Uint8Array, y: Uint8Array) => number): void {
  if (n < 2) return;
  const recs: Uint8Array[] = [];
  for (let i = 0; i < n; i++) { const r = new Uint8Array(w); for (let k = 0; k < w; k++) r[k] = m.u8(a + i * w + k); recs.push(r); }
  msvcQsort(recs, cmp);
  recs.forEach((r, i) => { for (let k = 0; k < w; k++) m.w8(a + i * w + k, r[k]); });
}
const copyBytes = (m: CmMem, dst: number, src: number, n: number) => { for (let i = 0; i < n; i++) m.w8(dst + i, m.u8(src + i)); };

// ---------------------------------------------------------------- 0x4c7ac0 daily_update

/** 0x4c7ac0 CONTRACT_MANAGER::daily_update(dato*, tidspunkt, flag) – thiscall på [0xae1050] */
export function contractDailyUpdate_4c7ac0(c: CmCtx, D: number, slice: number, flag: number): void {
  const m = c.m;
  const self = m.u32(G.CM);
  const sp0 = SP;
  try {
    let st = m.u32(G.STAFF);                                                  // ebx ved indgangen
    const sl = slice & 0xff;
    if (sl === 0) {
      for (const [a, n] of [[0xae1048, 7], [0xae1030, 0x1e], [0xae1058, 0x3c], [0xae1010, 0x5b], [0xae1060, 0x79], [0xae1040, 0x98],
        [0xae1090, 0xb6], [0xae1068, 0x16d], [0xae1008, 0x226], [0xae1020, 0x447]]) wrDate(m, a, addDays_54c5b0(m, D, n));
    } else if (sl === 2) {
      // (1) forhandlingslisten
      for (let i = 0, off = 0; i < m.s32(self + 0x2c); i++, off += 0x15) {
        const arr = m.u32(self + 0x28);
        const sid = m.s32(arr + off + 8);
        const loy = s8(m.u8(m.u32(G.STAFF) + 0x6e * sid + 0x59));
        const e = addDays_54c5b0(m, arr + off + 0xc, (0x19 - loy) * 2);
        if (dGT(rdDate(m, D), e)) {
          const cnt = m.s32(self + 0x2c);
          copyBytes(m, arr + off, arr + 0x15 * cnt - 0x15, 0x15);
          m.w32(self + 0x2c, cnt - 1);
          i--; off -= 0x15;
        }
      }
      if (m.s32(self + 0x2c) !== 0) qsortMem(m, m.u32(self + 0x28), m.s32(self + 0x2c), 0x15, cmpTalks);
      // statuslinjen (ftol([0xae2364]·0,004), 0x66f4e0/0x802f80 den 31/12) – udeladt
      // (2) personerne
      for (let i = 0; i < m.s32(G.STAFF_COUNT) && (flag & 0xff) === 1; i++, st = (st + 0x6e) >>> 0) staffStep(c, self, D, st);
      // (3) dag 36 og 200: beslutningslisten komprimeres
      const dd = m.s16(D);
      if (dd === 0x24 || dd === 0xc8) {
        const n = m.s32(self + 0x14), k = m.s32(self + 0x18);
        if (n > 0 && k < n) {
          const arr = m.u32(self + 0xc);
          for (let j = k, dst = arr; j < m.s32(self + 0x14); j++, dst += 0xe) copyBytes(m, dst, arr + 0xe * j, 0xe);
          m.w32(self + 0x14, m.s32(self + 0x14) - m.s32(self + 0x18));
          m.w32(self + 0x18, 0);
        }
      }
    }
    if (m.s32(self + 0x1c) !== 0) {
      const k = m.s32(self + 0x18);
      qsortMem(m, m.u32(self + 0xc) + 0xe * k, m.s32(self + 0x14) - k, 0xe, cmpDecision);
      m.w32(self + 0x1c, 0);
    }
    processDueDecisionDates_4cd9c0(c, self, D, slice);
  } finally { SP = sp0; }
}

/** svaret på et forlængelsestilbud (0x4c8d71 og de fire andre): tilbudsposten (0x85e410, +0x51 Date) til 0x4d49a0(post, 1) */
function offerAnswerNews(c: CmCtx, self: number, st: number, con: number, club: number, rowFlag: boolean): void {
  const m = c.m;
  const L = alloc(m, 0x70);
  constructContract_85e410(m, L);
  dateInit_54a110(m, L + 0x51);
  m.w32(L, m.s32(st));
  m.w8(L + 0x35, (m.u8(L + 0x35) & 0xc2) | 2);
  m.w32(L + 4, m.s32(club));
  m.w8(L + 0x50, 1);
  m.w32(L + 0x59, -1);
  m.w8(L + 0x61, m.u8(st + 0x3d));
  m.w8(L + 0x4f, (m.u8(L + 0x4f) & 0xf) | (m.u8(con + 0x4f) & 0xf0));
  if (rowFlag) { const a = rowOf(m, m.s32(st)) + 0xb; m.w8(a, m.u8(a) | 0x80); }
  c.call(0x4d49a0, self, L, 1);
}

/** én person i 0x4c7ac0's løkke (0x4c7dea–0x4c9d26) */
function staffStep(c: CmCtx, self: number, D: number, st: number): void {
  const m = c.m;
  const today = rdDate(m, D);
  if (m.u32(0xdd711c) === 0) {                                              // 0x4c7e41: spillet er ikke lavet endnu
    if (!st) return;
    const con = contractOf(m, self, st);
    if (!con) return;
    const e = rdDate(m, con + 0x2d);
    if (today.y === e.y && today.d === e.d) m.w8(con + 0x35, (m.u8(con + 0x35) & 0xc1) | 1);
    return;
  }
  // 0x4c7ec5: værdien +0x52
  let con = getContract(m, st);
  m.w32(G.LAST_CONTRACT, con);
  const club = con ? clubOfC(m, con) : 0;                                   // [esp+0x10]
  con = contractOf(m, self, st);                                            // esi
  const value = (cl: number, f: number) => c.call(0x4d0c60, self, st, cl, 0, -1, f) | 0;
  const clamp = () => { if (hasActiveReleaseClause_867b50(m, con) && m.s32(st + 0x52) > m.s32(con + 0x21)) m.w32(st + 0x52, m.s32(con + 0x21)); };
  if (club && con) {
    let done = false;
    if (isHuman(c, club, 1, 1) && isPlayerJob_53b620(m.u8(st + 0x3d))) {
      if ((m.u8(con + 0x4e) & 4) && m.u32(st + 0x61)) m.w32(st + 0x52, value(club, 1));
      clamp();
      done = true;
    }
    if (!done) {
      if (isPlayerJob_53b620(m.u8(st + 0x3d))) {
        if (today.d % 2 !== 0) { m.w8(con + 0x4e, m.u8(con + 0x4e) | 4); m.w32(st + 0x52, value(club, 0)); clamp(); }
      } else { m.w8(con + 0x4e, m.u8(con + 0x4e) | 4); m.w32(st + 0x52, value(club, 0)); }
    }
  } else m.w32(st + 0x52, 0);
  // 0x4c8077: lejekontrakten
  if (!st) return;
  let loanC = 0;                                                            // [esp+0xc]
  if (m.s32(st) < m.s32(G.STAFF_COUNT)) {
    const ra = rowOf(m, m.s32(st)) + 4;
    const lix = m.s32(ra);
    if (lix >= 0) {
      loanC = (m.u32(self) + 80 * lix) >>> 0;
      if (loanC) {
        const le = rdDate(m, loanC + 0x2d);
        if (today.y === le.y && today.d === le.d) {
          if (m.u32(st + 0x39) === 0) m.w32(ra, -1);
          else {
            if ((m.u8(loanC + 0x35) & 0x3f) !== 7) c.call(0x4da590, self, st, 6, 0);
            c.call(0x4d07e0, self, st);
          }
        }
      }
    }
  }
  // 0x4c8119: hovedkontrakten
  if (m.s32(st) >= m.s32(G.STAFF_COUNT)) return;
  {
    const ix = m.s32(rowOf(m, m.s32(st)));
    if (ix < 0) return;
    con = (m.u32(self) + 80 * ix) >>> 0;
    if (!con) return;
  }
  const age = () => s8(m.u8(st + 0x18));
  const offer = (f: number) => offerContract_4cda70(c, self, st, 0, 0, -1, f, 2);
  if (m.u32(st + 0x61) && dGT(rdDate(m, 0xae2330), today)) blockA(c, self, D, st, con, club);
  // 0x4c847f
  {
    const E = rdDate(m, con + 0x2d), H = rdDate(m, 0xae1090);
    if (dLT(H, E) && (m.u8(con + 0x35) & 0x3f) === 2 && loanC === 0) {
      const out = alloc(m, 4);
      if (c.call(0x868210, con, 0, out, 0) !== 0) return;
      if (m.u32(out) === 0) return;
      if (retiring(c, st)) return;
      if (m.u8(st + 0x3d) !== 0xb) return;
      if (!isHuman(c, club, 0, 1) && age() < 0x20) {
        const p = m.u32(st + 0x61);
        switch (status4f(m, con)) {
          case 1: case 2: offer(1.0); break;
          case 3: if (m.s16(p + 0xb) > 0x1a5e || (age() < 0x18 && m.s16(p + 7) > 0x64)) offer(1.0); break;
          case 5: if (m.s16(p + 7) > 0x64) offer(1.0); break;
        }
      }
      if (!newsHuman(c, clubOfC(m, con))) return;
      const a = age_53ab90(m, st, 0xae1090) >= 0x18 && bosman(c, st) ? 1 : 0;
      c.call(0x4d6790, self, con, 7, a, 1);
      return;
    }
  }
  // 0x4c8603
  if ((m.u8(con + 0x35) & 0x3f) === 1) {
    if (m.s32(st) < m.s32(G.STAFF_COUNT)) {
      const lix = m.s32(rowOf(m, m.s32(st)) + 4);
      if (lix >= 0 && ((m.u32(self) + 80 * lix) >>> 0)) { loanC = (m.u32(self) + 80 * lix) >>> 0; return tail(c, self, D, st, con); }
    }
    if (dGT(today, addDays_54c5b0(m, con + 0x2d, 0x1f))) {
      if (!wantsToLeave(c, con) && m.u8(con + 0x49) === 0) return tail(c, self, D, st, con);
      if (c.call(0x8c5cf0, tm(m), st, 0, 0)) return tail(c, self, D, st, con);
      if (c.call(0x8c5e40, tm(m), st, 0)) return tail(c, self, D, st, con);
      if (c.call(0x8c1870, tm(m), st)) return tail(c, self, D, st, con);
      if (newsHuman(c, clubOfC(m, con))) c.call(0x4da590, self, st, 1, 0);
      const unslot = () => {
        if (!m.u32(st + 0x39)) return;
        for (let k = 0; k < 0x32; k++) { const a = m.u32(st + 0x39) + 0xd7 + 4 * k; if (m.u32(a) === st) m.w32(a, 0); }
      };
      const job = m.u8(st + 0x3d);
      if (job === 0xc) { unslot(); m.w8(st + 0x3d, 5); return; }
      if (job === 0xd) { if (!isHuman(c, clubOfC(m, con), 0, 1)) { unslot(); m.w8(st + 0x3d, 6); return; } }
      else if (m.u8(st + 0x3d) === 0xf) { if (!isHuman(c, clubOfC(m, con), 0, 1)) { unslot(); m.w8(st + 0x3d, 8); return; } }
      c.call(0x8c16b0, tm(m), st, 1, -1);
      return;
    }
    return tail(c, self, D, st, con);
  }
  // 0x4c8840
  {
    const cond = m.u32(st + 0x61) !== 0 && m.u8(st + 0x3d) === 0xb && !retiring(c, st) && !c.call(0x8cca10, tm(m), st, 0);
    if (cond) {
      if (m.u8(con + 0x49) !== 0) {
        const b = band(c, con);
        if (b >= 1 && b <= 13 && (b & 1)) c.call(0x842c00, slm(m), st, 1);
        return tail(c, self, D, st, con);
      }
    } else if (m.u8(con + 0x49) !== 0) return tail(c, self, D, st, con);
  }
  // 0x4c88b5
  if (c.call(0x8cca10, tm(m), st, 0)) return tail(c, self, D, st, con);
  if ((m.u8(con + 0x35) & 0x3f) !== 2) return tail(c, self, D, st, con);
  if (!dGT(subDays_54c8e0(m, D, 0x5d), rdDate(m, con + 0x25))) return tail(c, self, D, st, con);
  if (band(c, con) !== 0xe && band(c, con) !== 0 && !retiring(c, st) && m.u32(st + 0x61) && m.u8(st + 0x3d) === 0xb) {
    const c2 = getContract(m, st);
    m.w32(G.LAST_CONTRACT, c2);
    if (!c2) return;
    if ((m.u8(c2 + 0x35) & 0x3f) === 5) return;
    const cl2 = clubOfC(m, c2);
    if (!cl2) return;
    const nat = m.u32(cl2 + 0x53);
    if (!nat) return;
    const p = m.u32(st + 0x61);
    if (m.s16(p + 0xb) > 0xea6 && m.s16(p + 0xd) > 0x6d6 && s8(m.u8(st + 0x59)) < 0xf && age() < 0x1f && age() > 0x12 && c.call(0x544670, nat)) {
      const c39 = m.u32(st + 0x39);
      if (!(c39 && m.s16(c39 + 0x80) > 0x128e && s8(m.u8(st + 0x18)) < 0x17)) {
        if (wantsToLeave(c, con) || (m.u8(con + 0x4e) & 8)) {
          m.w8(con + 0x49, 1);
          m.w8(con + 0x4e, m.u8(con + 0x4e) & 0xf7);
          c.call(0x842c00, slm(m), st, 1);
          c.call(0x4d6d70, self, con, 0);
          return;
        }
      }
    }
    // 0x4c8a79
    const b = band(c, con);
    if (b === 0xe) { if (c.rand(0x14) === 0) c.call(0x842c00, slm(m), st, 1); }
    else if (b >= 1 && b <= 13 && (b & 1)) c.call(0x842c00, slm(m), st, 1);
  }
  // 0x4c8ac0: 550 dage
  const E = rdDate(m, con + 0x2d);
  if (dEQ(rdDate(m, 0xae1008), E) && isPlayerJob_53b620(m.u8(st + 0x3d)) && !retiring(c, st)) {
    if (isHuman(c, clubOfC(m, con), 0, 1)) return tail(c, self, D, st, con);
    const s = status4f(m, con);
    if (s > 0 && s <= 3 && inShortlist(c, clubOfC(m, con), st)) offer(1.0);
    return tail(c, self, D, st, con);
  }
  // 0x4c8ba4: 365 dage (eller spillets første dag og under 365)
  {
    const g = rdDate(m, 0xae1068);
    const go = dEQ(g, E) || (dEQ(rdDate(m, 0xdd6ec8), today) && dGT(g, E));
    if (go && isPlayerJob_53b620(m.u8(st + 0x3d)) && !retiring(c, st)) {
      if (dEQ(rdDate(m, 0xae1068), rdDate(m, con + 0x2d))) {
        const a = age_53ab90(m, st, 0xae1068) >= 0x18 && bosman(c, st) ? 1 : 0;
        c.call(0x4d6790, self, con, 6, a, 0);
      }
      if (isHuman(c, clubOfC(m, con), 0, 1)) return tail(c, self, D, st, con);
      const s = status4f(m, con);
      if (s <= 0 || (s > 3 && s !== 5)) return tail(c, self, D, st, con);
      if (!inShortlist(c, clubOfC(m, con), st)) return tail(c, self, D, st, con);
      if (offer(1.0) !== 0) return tail(c, self, D, st, con);
      offerAnswerNews(c, self, st, con, club, false);
      return tail(c, self, D, st, con);
    }
  }
  // 0x4c8e0f: båndene 3 og 5
  if (band(c, con) === 3 || band(c, con) === 5) {
    if (isPlayerJob_53b620(m.u8(st + 0x3d)) && !retiring(c, st)) {
      if (isHuman(c, clubOfC(m, con), 0, 1)) return tail(c, self, D, st, con);
      const s = status4f(m, con);
      if (s >= 1 && s <= 3) offer(inShortlist(c, clubOfC(m, con), st) ? 1.2 : 1.0);
      else if (s === 4 || s === 5) offer(1.0);
      return tail(c, self, D, st, con);
    }
  }
  // 0x4c8ee8: bånd 1
  if (band(c, con) === 1 && !retiring(c, st)) {
    if (m.u32(st + 0x61) && m.u8(st + 0x3d) === 0xb) {
      const a = age_53ab90(m, st, 0xae1090) >= 0x18 && bosman(c, st) ? 1 : 0;
      c.call(0x4d6790, self, con, 5, a, 1);
    } else if (newsHuman(c, clubOfC(m, con))) c.call(0x4d6790, self, con, 5, 0, 0);
    else offer(1.0);
    if (!isPlayerJob_53b620(m.u8(st + 0x3d))) return tail(c, self, D, st, con);
    if (isHuman(c, clubOfC(m, con), 0, 1)) return tail(c, self, D, st, con);
    const s = status4f(m, con);
    if (s >= 1 && s <= 3) {
      if (inShortlist(c, clubOfC(m, con), st)) { if (offer(1.1) === 0) offerAnswerNews(c, self, st, con, club, true); }
      else if (offer(1.0) === 0) offerAnswerNews(c, self, st, con, club, true);
    } else if (s >= 4 && s <= 6) offer(1.0);
    return tail(c, self, D, st, con);
  }
  // 0x4c91f6: bånd 7
  if (band(c, con) === 7 && !retiring(c, st)) {
    if (m.u32(st + 0x61) && m.u8(st + 0x3d) === 0xb) {
      if (newsHuman(c, clubOfC(m, con))) {
        const a = age_53ab90(m, st, 0xae1010) >= 0x18 && bosman(c, st) ? 1 : 0;
        c.call(0x4d6790, self, con, 1, a, 0);
        return tail(c, self, D, st, con);
      }
      if (!isPlayerJob_53b620(m.u8(st + 0x3d))) return tail(c, self, D, st, con);
      const s = status4f(m, con);
      if (s === 1 || s === 2) {
        if (inShortlist(c, clubOfC(m, con), st)) { if (offer(1.3) === 0) offerAnswerNews(c, self, st, con, club, true); }
        else if (offer(1.0) === 0) offerAnswerNews(c, self, st, con, club, true);
      } else if (s >= 3 && s <= 5) offer(inShortlist(c, clubOfC(m, con), st) ? 1.1 : 1.0);
      else if (s === 6) offer(1.0);
      return tail(c, self, D, st, con);
    }
    if (newsHuman(c, clubOfC(m, con))) { c.call(0x4d6790, self, con, 1, 0, 0); return tail(c, self, D, st, con); }
    offer(1.0);
    return tail(c, self, D, st, con);
  }
  // 0x4c9555: båndene 9 og 11
  if ((band(c, con) === 9 || band(c, con) === 0xb) && isPlayerJob_53b620(m.u8(st + 0x3d)) && !retiring(c, st)) {
    if (isHuman(c, clubOfC(m, con), 0, 1)) return tail(c, self, D, st, con);
    const s = status4f(m, con);
    if (s === 1 || s === 2) offer(inShortlist(c, clubOfC(m, con), st) ? 1.4 : 1.0);
    else if (s >= 3 && s <= 5) offer(inShortlist(c, clubOfC(m, con), st) ? 1.2 : 1.0);
    else if (s === 6) offer(1.0);
    return tail(c, self, D, st, con);
  }
  // 0x4c967c: bånd 13
  if (band(c, con) === 0xd && !retiring(c, st)) {
    if (m.u32(st + 0x61) && m.u8(st + 0x3d) === 0xb) {
      if (newsHuman(c, clubOfC(m, con))) {
        const a = age_53ab90(m, st, 0xae1048) >= 0x18 && bosman(c, st) ? 1 : 0;
        c.call(0x4d6790, self, con, 4, a, 0);
        return tail(c, self, D, st, con);
      }
      const s = status4f(m, con);
      if (s === 1 || s === 2) offer(inShortlist(c, clubOfC(m, con), st) ? 1.4 : 1.0);
      else if (s >= 3 && s <= 5) offer(inShortlist(c, clubOfC(m, con), st) ? 1.2 : 1.0);
      else if (s === 6) offer(1.0);
      return tail(c, self, D, st, con);
    }
    if (newsHuman(c, clubOfC(m, con))) { c.call(0x4d6790, self, con, 4, 0, 0); return tail(c, self, D, st, con); }
    offer(1.0);
    return tail(c, self, D, st, con);
  }
  // 0x4c9819: udløbet (i dag ≥ slutdatoen)
  if (!dLT(today, rdDate(m, con + 0x2d))) {
    m.w8(con + 0x35, (m.u8(con + 0x35) & 0xc1) | 1);
    c.call(0x4da590, self, st, 2, 0);
    if (m.u32(st + 0x61) && m.u8(st + 0x3d) === 0xb) {
      if (wantsToLeave(c, con) || (m.u8(con + 0x4e) & 8)) {
        m.w8(con + 0x49, 1);
        m.w8(con + 0x4e, m.u8(con + 0x4e) & 0xf7);
        c.call(0x842c00, slm(m), st, 1);
        return tail(c, self, D, st, con);
      }
      const c2 = getContract(m, st);
      m.w32(G.LAST_CONTRACT, c2);
      if (c2 && clubOfC(m, c2)) {
        const c3 = getContract(m, st);
        m.w32(G.LAST_CONTRACT, c3);
        if (newsHuman(c, c3 ? clubOfC(m, c3) : 0)) return tail(c, self, D, st, con);
      }
      if (isHuman(c, clubOfC(m, con), 0, 1)) return tail(c, self, D, st, con);
      const s = status4f(m, con);
      const noLoan = () => m.s32(rowOf(m, m.s32(st)) + 4) === -1;
      if (s === 1 || s === 2) { if (!noLoan()) offer(inShortlist(c, clubOfC(m, con), st) ? 1.4 : 1.0); }
      else if (s >= 3 && s <= 5) { if (!noLoan()) offer(inShortlist(c, clubOfC(m, con), st) ? 1.2 : 1.0); }
      else if (s === 6) { if (!noLoan()) offer(1.0); }
      else if (m.u32(st + 0x39) && m.u32(st + 0x61) && m.u8(st + 0x3d) === 0xb && c.call(0x5444a0, st, 0) && !c.call(0x8c5cf0, tm(m), st, 0, 0)
        && !c.call(0x8c5e40, tm(m), st, 0) && !c.call(0x8c1870, tm(m), st)) c.call(0x8c16b0, tm(m), st, 1, -1);
      return tail(c, self, D, st, con);
    }
    if (isHuman(c, clubOfC(m, con), 0, 1)) return tail(c, self, D, st, con);
    offer(1.0);
  }
  return tail(c, self, D, st, con);
}

/** 0x4c81a3–0x4c847a: forlængelsestilbud fra computerens klub efter 180 dage med kontrakten ([0xae2330] > i dag) */
function blockA(c: CmCtx, self: number, D: number, st: number, con: number, club: number): void {
  const m = c.m;
  for (const [a, n] of [[0xae1070, 7], [0xae1018, 0x1e], [0xae1038, 0x2a], [0xae1028, 0x3c], [0xae1078, 0x46], [0xae1088, 0x5b]]) wrDate(m, a, addDays_54c5b0(m, D, n));
  if (daysSince_54cdb0(m, D, rdDate(m, con + 0x25)) <= 0xb4) return;
  if (!dLT(rdDate(m, con + 0x2d), rdDate(m, 0xae1020))) return;
  const g = rdDate(m, 0xae2330);
  if (![0xae1070, 0xae1018, 0xae1038, 0xae1028, 0xae1078, 0xae1088].some((a) => dEQ(rdDate(m, a), g))) return;
  const disliked = c.call(0x5477d0, st, club) !== 0;
  const mgr = m.u32(club + 0xcf);
  if (mgr && c.call(0x547840, st, mgr)) return;
  if (disliked) return;
  if (isHuman(c, club, 0, 1)) return;
  const age = s8(m.u8(st + 0x18));
  if (age >= 0x20) return;
  const p = m.u32(st + 0x61);
  const offer = () => offerContract_4cda70(c, self, st, 0, 0, -1, 1.0, 2);
  switch (status4f(m, con)) {
    case 1: offer(); break;
    case 2: case 3: if (m.s16(p + 0xb) > 0x1a5e || (age < 0x18 && m.s16(p + 7) > 0x64)) offer(); break;
    case 5: if (m.s16(p + 7) > 0x64) offer(); break;
  }
}

/** 0x4c9b76–0x4c9d21: kontrakten udløber i dag */
function tail(c: CmCtx, self: number, D: number, st: number, con: number): void {
  const m = c.m;
  const today = rdDate(m, D);
  if (dEQ(today, rdDate(m, con + 0x2d)) && (m.u8(con + 0x35) & 0x3f) === 5) {
    c.call(0x4da590, self, st, 5, 0);
    c.call(0x7c5fe0, m.u32(0xb74350), st, -1, 0, 0, -1, 0);
    const ra = rowOf(m, m.s32(st));
    const ix = m.s32(ra);
    if (ix !== -1) {
      const C = (m.u32(self) + 80 * ix) >>> 0;
      const clubC = clubOfC(m, C);
      m.w32(C, -1);
      m.w32(ra, -1);
      const fin = c.call(0x5a0590, m.u32(0xae2a38), clubC);
      if (fin) c.call(0x598370, fin);
    }
    c.call(0x896c60, m.u32(0xde1d08), m.u32(st + 0x39), st, 0, 1);
    c.call(0x896c60, m.u32(0xde1d08), m.u32(st + 0x39), st, 1, 1);
    c.call(0x53c190, m.u32(st + 0x39), st, 0, 1, 0);
    return;
  }
  if (dEQ(today, rdDate(m, con + 0x2d)) && (m.u8(con + 0x35) & 0x3f) !== 5) {
    m.w8(con + 0x35, (m.u8(con + 0x35) & 0xc1) | 1);
    if (m.u8(con + 0x49)) {
      if (loanOf(m, self, st)) return;
      if (c.call(0x8c5cf0, tm(m), st, 0, 0)) return;
      c.call(0x4da590, self, st, 2, 1);
      c.call(0x8c1af0, tm(m), st, m.u32(st + 0x39), 0, -1, 0);
    }
  }
}

// ---------------------------------------------------------------- 0x4cda70 offer_contract

/** 0x4cda70 contract_manager_offer_contract(staff, klub (0 = kontraktens), ud-kontrakt*, transfertilbuddets indeks, faktor (double), måde):
 *  klubbens tilbud inden for lønbudgettet (0x85fc50 ganget med faktoren, frikøbsklausul, længde efter alder, lønloftet 0x5968d0/0x597db0).
 *  Med ud-kontrakt: vilkårene kopieres; ellers måde 2 (eller 1 og den nuværende udløber mindst 150 dage efter [0xae1068]) → 0x4cc490. 1 = tilbudt. */
export function offerContract_4cda70(c: CmCtx, self: number, staff: number, clubArg: number, out: number, offerIdx: number, factor: number, mode: number): number {
  const m = c.m;
  const sp0 = SP;
  try {
    const L = alloc(m, 0x50);
    constructContract_85e410(m, L);
    let club = clubArg;
    let tOffer = 0;                                                         // ebp
    if (!club) {
      const con = staff ? getContract(m, staff) : 0;
      m.w32(G.LAST_CONTRACT, con);
      if (!con) return 0;
      club = clubOfC(m, con);
      if (!club) return 0;
    }
    if (isNationalSide_53b900(m, club)) return 0;
    if (m.u8(rowOf(m, m.s32(staff)) + 0xb) & 0x30) return 0;
    if (!isPlayerJob_53b620(m.u8(staff + 0x3d)) && m.u32(staff + 0x39) === club) {
      if (m.u8(m.u32(slm(m) + 0xdc) + 9 * m.s32(club) + 4) === 2) return 0;
      if (m.u32(club + 0xcf) === 0 && (c.call(0x544820, club) & 0xff)) return 0;
    }
    if (isHuman(c, club, 0, 1)) return 0;
    if (c.call(0x8cca10, tm(m), staff, 0)) return 0;
    m.w32(L + 4, m.s32(club));
    if (offerIdx !== -1) { const p = c.call(0x8c61e0, tm(m), offerIdx); if (p) tOffer = m.u32(p); }
    const jobOut = alloc(m, 4);                                             // [esp+0x1c]
    let status = c.call(0x849f00, slm(m), staff, club, jobOut) & 0xff;
    if (status === 3 && m.s16(m.u32(staff + 0x61) + 0xb) > 0x1482) status = 2;
    const job = m.u32(jobOut);
    const r = setToDesiredContract_85fc50(c, L, staff, club, offerIdx, status, job, 0, 0) | 0;
    if (r === 0) return 0;
    m.w32(L + 8, ftol(m.s32(L + 8) * factor));
    m.w32(L + 0xc, ftol(m.s32(L + 0xc) * factor));
    // frikøbsklausulen +0x21 (+0x1c mindstepris, +0x1d/+0x1f nedrykning/ikke-oprykning)
    if (m.u8(L + 0x1d)) {
      let edi = 0;
      if (tOffer) {
        const v = c.call(0x8e7b50, tOffer, 0, 0, 0, 0, 1) | 0;
        if (v > 0x4c4b40) edi = ftol((v - 0x4c4b40) * 1.25 + 8425000.0);
        else if (v > 0xf4240) edi = ftol((v - 0xf4240) * 1.5 + 2425000.0);
        else if (v > 0xc350) edi = ftol((v - 0xc350) * 2.5 + 100000.0);
        else if (m.s32(L + 0x21) < 0x186a0) edi = 0x186a0;
      } else if (m.s32(L + 0x21) < 0xc350) edi = 0xc350;
      if (m.s32(L + 0x21) < edi) m.w32(L + 0x21, edi);
    } else if (m.u8(L + 0x1f) || m.u8(L + 0x1c)) {
      if (m.s32(L + 0x21) < 0xc350) m.w32(L + 0x21, 0xc350);
    }
    // lønloftet x ([esp+0x28])
    let x: number;
    if ((job & 0xff) === 0xb) {
      const fin = c.call(0x5a0590, m.u32(0xae2a38), club);
      x = (c.call(0x5968d0, fin, staff, m.u8(L + 0x4f) >> 4) | 0) * ((factor + 1.0) * 0.5);
    } else {
      const fin = c.call(0x5a0590, m.u32(0xae2a38), club);
      x = c.call(0x597db0, fin, job) | 0;
    }
    const own = contractForClub_4cf5f0(c, staff, club);                 // ebx (thiscall på this)
    const bp = m.u16(G.TODAY + 2);
    if (m.u32(staff + 0x61)) {
      const days = daysSince_54cdb0(m, G.TODAY, rdDate(m, staff + 0x10));
      const p = m.u32(staff + 0x61);
      let t = days * 0.0027397260273972603;
      if (m.u8(p + 0xf) === 0x14) t = t - 2.0;
      else t = t - ((s8(m.u8(p + 0x3c)) + s8(m.u8(p + 0x34)) + s8(m.u8(staff + 0x5b))) * 0.3333333333333333 - 15.0) * 0.4;
      const bonus = (k: number) => { for (let i = 0; i < 3; i++) { const v = m.s32(L + 0x10 + 4 * i); if (v > -1) m.w32(L + 0x10 + 4 * i, ftol(v * k)); } };
      if (t > 34.0 || (own && (m.u8(own + 0x4f) & 0xf0) === 0x60)) {
        if (m.u16(L + 0x2f) > bp + 1) { m.w32(L + 0xc, ftol(m.s32(L + 0xc) * 1.1)); m.w16(L + 0x2f, bp + 1); }
        bonus(1.25);
      } else if (t > 31.0) {
        if (m.u16(L + 0x2f) > bp + 2) { m.w32(L + 0xc, ftol(m.s32(L + 0xc) * 1.1)); m.w16(L + 0x2f, bp + 2); }
        bonus(1.3);
      } else if (t > 29.0) {
        if (m.s16(club + 0x80) > m.s16(p + 0xd) * 1.2) {
          const n = s8(ftol(t + 0.5) & 0xff);
          if (m.u16(L + 0x2f) > bp - n + 0x22) { m.w32(L + 0xc, ftol(m.s32(L + 0xc) * 1.1)); m.w16(L + 0x2f, (bp - n + 0x22) & 0xffff); }
          bonus(1.5);
        }
      }
      // 0x4cdfff: lange dyre kontrakter til ældre spillere
      if (m.s32(L + 0xc) > 0x2710 && t > 30.0) {
        const days2 = daysSince_54cdb0(m, L + 0x2d, rdDate(m, G.TODAY));
        let weeks = Math.trunc(days2 / 7);
        let total = Math.imul(weeks, m.s32(L + 0xc));
        const rep = m.s16(m.u32(staff + 0x61) + 0xb);
        const y0 = Math.pow(rep, 2.0) * 0.00013333333333333334;
        const y = y0 < 8000.0 ? y0 : 8000.0;
        let z = Math.pow(t - 30.0, 2.0);
        if (!(z > 1.0)) z = 1.0;
        const cap = ftol(Math.pow(y, 2.0) / z);
        let to13e = true;
        if (cap * 1.5 < total) {
          for (;;) {
            if (weeks <= 0x68) break;                                       // → 0x4ce13e
            weeks -= 0x34;
            m.w32(L + 0xc, ftol(m.s32(L + 0xc) * 1.1));
            total = Math.imul(weeks, m.s32(L + 0xc));
            if (!(cap < total)) { to13e = false; break; }
          }
        }
        if (to13e && total > cap) {
          const q = Math.trunc(cap / weeks) | 0;
          if (q < x) x = q;
        }
      }
    }
    // 0x4ce174
    if (own) {
      if (!(m.u16(own + 0x2f) < m.u16(L + 0x2f))) return 0;
      const inj = m.u32(0xb63d28);
      if (inj && c.call(0x62ed70, inj, staff)) { const r2 = c.call(0x62ed70, m.u32(0xb63d28), staff); if (m.s16(r2 + 0x2c) > 0x46) return 0; }
    }
    if (m.u8(G.B_AE233C) === 1 && m.u16(L + 0x2f) > bp + 5) m.w16(L + 0x2f, (bp + 5) & 0xffff);
    const wage = m.s32(L + 0xc);
    if (wage > x * 1.4) return 0;
    if (wage > x) {
      const d = 1.0 > x ? 1.0 : x;
      const ratio = wage / d;
      m.w32(L + 8, ftol(m.s32(L + 8) * ratio));
      for (let i = 0; i < 3; i++) { const v = m.s32(L + 0x10 + 4 * i); if (v > -1) m.w32(L + 0x10 + 4 * i, ftol(v * ratio)); }
      m.w32(L + 0xc, ftol(x));
    }
    // 0x867520 clear_all_grievances(0): +0x45 = 0, 0x549c90(personen)
    m.w32(L + 0x45, 0);
    c.call(0x549c90, staffAt(m, m.s32(L)));
    if (out) { copyBytes(m, out, L, 0x50); return 1; }
    const md = mode & 0xff;
    if (md === 2 || (own && md === 1 && dLT(addDays_54c5b0(m, 0xae1068, 0x96), rdDate(m, own + 0x2d))))
      addContractOffer_4cc490(c, self, L, offerIdx, -1, m.u8(staff + 0x3d), 0, 1, 0);
    return 1;
  } finally { SP = sp0; }
}

// ---------------------------------------------------------------- 0x4cc490 add_contract_offer

/** 0x4cc490 CONTRACT_MANAGER::add_contract_offer(kontrakt*, transfertilbud, a2, job, a4, planlæg, accepteret): nyt tilbud (0x6f bytes) i
 *  this+0x34 eller opdatering af klubbens eksisterende; transfertilbuddet får besked (0x8c1f80/0x8c2060), beslutningen planlægges (0x4cd230) */
export function addContractOffer_4cc490(c: CmCtx, self: number, L: number, offerIdx: number, a2: number, job: number, a4: number, schedule: number, agreed: number): void {
  const m = c.m;
  const sp0 = SP;
  void a4;
  try {
    addDays_54c5b0(m, G.TODAY, 0xe);                                        // [esp+0x1c] – bruges ikke
    const R = alloc(m, 0x70);
    constructContract_85e410(m, R);
    dateInit_54a110(m, R + 0x51);
    const id = m.s32(L);
    let D = 0;
    if (m.u8(rowOf(m, id) + 8) !== 0 && m.u32(self + 0x34)) {
      const clubId = m.s32(L + 4);
      listReset(m, m.u32(self + 0x34));
      for (let d = listNext_68d1b0(m, m.u32(self + 0x34)); d; d = listNext_68d1b0(m, m.u32(self + 0x34)))
        if (m.s32(d) === id && m.s32(d + 4) === clubId) { D = d; break; }
    }
    const today = rdDate(m, G.TODAY);
    const active = (m.u8(L + 0x35) & 0x3f) !== 6 ? 1 : 0;
    if (!D) {
      copyBytes(m, R, L, 0x50);                                             // 0x4cc810
      wrDate(m, R + 0x51, today);
      m.w8(R + 0x50, 0);
      m.w32(R + 0x5d, a2); m.w32(R + 0x59, offerIdx); m.w8(R + 0x61, job); m.w32(R + 0x63, -1); m.w8(R + 0x62, active);
      if (!m.u32(self + 0x34)) {
        const p = c.call(0x944cf1, 0xe);
        if (p) listInit_68d020(m, p);
        m.w32(self + 0x34, p);
      }
      listAdd_68d0d0(c, m.u32(self + 0x34), R, 0x6f);
      offerCount(m, L, +1);
    } else {
      copyBytes(m, D, L, 0x50);
      m.w8(D + 0x50, agreed ? 2 : 0);
      wrDate(m, D + 0x51, today);
      m.w32(D + 0x59, offerIdx); m.w32(D + 0x5d, a2); m.w8(D + 0x61, job);
      m.w32(R + 0x63, -1);
      m.w8(D + 0x62, active);
    }
    if (offerIdx !== -1) {
      const o = m.u32(c.call(0x8c61e0, tm(m), offerIdx));
      if (m.s32(o + 0xc) === id) c.call(0x8c1f80, tm(m), offerIdx);
      else c.call(0x8c2060, tm(m), offerIdx, id);
    }
    if (schedule) scheduleOfferDecision_4cd230(c, self, id, offerIdx);
  } finally { SP = sp0; }
}

// ---------------------------------------------------------------- beslutningsdatoerne

/** 0x4cd6d0 add_decision_date(staff, dato*, tidspunkt, art): art 1 giver påmindelser (art 2) før datoen efter kontraktens +0x44 */
export function addDecisionDate_4cd6d0(c: CmCtx, self: number, staff: number, date: number, slice: number, type: number): void {
  const m = c.m;
  const n0 = m.s32(self + 0x14), cap = m.s32(self + 0x10);
  if (n0 > cap - 4) {
    const nc = cap + 0x64;
    m.w32(self + 0x10, nc);
    const old = m.u32(self + 0xc);
    const nw = old ? c.call(0x945667, old, nc * 0xe) : c.call(0x944e46, nc * 0xe);
    m.w32(self + 0xc, nw);
    if (!nw) return;                                                        // fejlboksen (contract_manager.cpp 0x103e) – udeladt
  }
  const push = (e: Dt, art: number, sl: number | null) => {
    const n = m.s32(self + 0x14);
    const ea = m.u32(self + 0xc) + 0xe * n;
    m.w32(ea, m.s32(staff));
    if (sl !== null) m.w8(ea + 0xc, sl);
    wrDate(m, ea + 4, e);
    m.w8(ea + 0xd, art);
    m.w32(self + 0x14, n + 1);
  };
  let edi = 0x64;
  if ((type & 0xff) === 1) {
    let one = true;
    if (m.u32(staff + 0x61)) {
      const con = contractOf(m, self, staff);
      const al = u8(m.u8(con + 0x44) + 0x64);
      edi = al;
      if (al <= 0x50) one = false;
      else if (al > 0x96) push(subDays_54c8e0(m, date, Math.trunc(al * 90 / 200)), 2, null);
    }
    if (one) push(subDays_54c8e0(m, date, Math.trunc((edi & 0xff) * 50 / 200)), 2, null);
  }
  push(rdDate(m, date), type & 0xff, slice & 0xff);
}

/** 0x4cd9c0 process_due_decision_dates(dato*, tidspunkt): de forfaldne poster fra +0x18; art 3 → resolve_contract_offers 0x4ce4e0 */
export function processDueDecisionDates_4cd9c0(c: CmCtx, self: number, D: number, slice: number): void {
  const m = c.m;
  let k = m.s32(self + 0x18);
  if (k >= m.s32(self + 0x14)) return;
  for (;;) {
    const ea = m.u32(self + 0xc) + 0xe * k;
    const dd = rdDate(m, D), ed = rdDate(m, ea + 4);
    if (dLT(dd, ed)) return;
    if (dEQ(dd, ed) && s8(m.u8(ea + 0xc)) > s8(slice)) return;
    const sid = m.s32(ea);
    if (sid !== -1) {
      const st = (m.u32(G.STAFF) + 0x6e * sid) >>> 0;
      m.w32(ea, -1);
      if (m.u8(ea + 0xd) === 3) resolveContractOffers_4ce4e0(c, self, st);
    }
    k = m.s32(self + 0x18) + 1;
    m.w32(self + 0x18, k);
    if (k >= m.s32(self + 0x14)) return;
  }
}

/** 0x4cd230 schedule_offer_decision(staff-id, transfertilbud): personens art 3-post (ny om 1–5 dage, tidspunkt 2) flyttes efter klubbens svartid
 *  (0x8cc5b0) eller til i dag/næste tidspunkt; højst 14 dage frem; +0x1c (usorterede) + 1 */
export function scheduleOfferDecision_4cd230(c: CmCtx, self: number, staffId: number, offerIdx: number): void {
  const m = c.m;
  const sp0 = SP;
  try {
    const d14 = addDays_54c5b0(m, G.TODAY, 0xe);
    let esi = m.s32(self + 0x18);
    const n = m.s32(self + 0x14);
    if (esi < n) {
      const arr = m.u32(self + 0xc);
      for (;;) {
        const ea = arr + 0xe * esi;
        if (dLT(d14, rdDate(m, ea + 4))) break;
        if (m.u8(ea + 0xd) === 3 && m.s32(ea) === staffId) { m.w32(ea, -1); break; }
        esi++;
        if (esi >= n) break;
      }
    }
    const n2 = m.s32(self + 0x14);
    const lo = n2 - m.s32(self + 0x1c);
    if (esi < lo) esi = lo;
    let e = 0;
    for (; esi < n2; esi++) { const ea = m.u32(self + 0xc) + 0xe * esi; if (m.u8(ea + 0xd) === 3 && m.s32(ea) === staffId) { e = ea; break; } }
    if (!e) {
      const d = alloc(m, 8);
      wrDate(m, d, addDays_54c5b0(m, G.TODAY, c.rand(5) + 1));
      addDecisionDate_4cd6d0(c, self, staffAt(m, staffId), d, 2, 3);
      e = m.u32(self + 0xc) + 0xe * (m.s32(self + 0x14) - 1);
    }
    const ed = e + 4;
    const slice = m.u8(G.SLICE);
    if (offerIdx !== -1) {
      const offer = m.u32(c.call(0x8c61e0, tm(m), offerIdx));
      const out = alloc(m, 8);
      m.w32(out, staffId); m.w32(out + 4, offerIdx);                       // ud-parametrene er argumentpladserne
      c.call(0x8cc5b0, tm(m), offer, out, out + 4);
      const bl = u8(s8(m.u8(out)) * 3 + m.u8(out + 4));
      let al = u8(daysSince_54cdb0(m, ed, rdDate(m, G.TODAY)));
      let cl = u8(m.u8(e + 0xc) - slice);
      if (cl & 0x80) { cl = u8(cl + 3); al = u8(al - 1); }
      al = u8(s8(al) * 3 + cl);
      const v = s8(al) < s8(bl) ? (s8(al) < 1 ? 1 : al) : (s8(bl) < 1 ? 1 : bl);
      const ebx = s8(v);
      wrDate(m, ed, addDays_54c5b0(m, G.TODAY, Math.trunc(ebx / 3)));
      const dl = u8((ebx % 3) + slice);
      m.w8(e + 0xc, dl);
      if (s8(dl) > 2) { m.w8(e + 0xc, u8(dl - 3)); wrDate(m, ed, addDays_54c5b0(m, ed, 1)); }
      if (m.u8(offer + 0x2f) && daysSince_54cdb0(m, ed, rdDate(m, G.TODAY)) < 4) wrDate(m, ed, addDays_54c5b0(m, G.TODAY, c.rand(2) + 4));
    } else {
      const T = rdDate(m, G.TODAY);
      if (dEQ(T, rdDate(m, ed)) || dGT(T, rdDate(m, ed))) {
        wrDate(m, ed, rdDate(m, G.TODAY));
        const a = m.u8(e + 0xc);
        if (!(s8(a) > slice)) {
          const a2 = u8(a + 1);
          m.w8(e + 0xc, a2);
          if (s8(a2) > 2) { m.w8(e + 0xc, u8(a2 - 3)); wrDate(m, ed, addDays_54c5b0(m, ed, 1)); }
        }
      }
      const st = staffAt(m, staffId);
      if (st && m.s32(st) < m.s32(G.STAFF_COUNT)) {
        const ix = m.s32(rowOf(m, m.s32(st)));
        if (ix >= 0 && ((m.u32(self) + 80 * ix) >>> 0)) {
          const d180 = addDays_54c5b0(m, G.TODAY, 0xb4);
          const c2 = contractOf(m, self, st);
          if (dGT(d180, rdDate(m, c2 + 0x2d))) wrDate(m, ed, addDays_54c5b0(m, G.TODAY, c.rand(4) + 4));
        }
      }
    }
    // 0x4cd4ab: højst 14 dage frem
    const T2 = rdDate(m, G.TODAY);
    if (dLT(T2, subDays_54c8e0(m, ed, 0xe))) wrDate(m, ed, addDays_54c5b0(m, G.TODAY, 0xe));
    m.w32(self + 0x1c, m.s32(self + 0x1c) + 1);
  } finally { SP = sp0; }
}

// ---------------------------------------------------------------- 0x4ce4e0 resolve_contract_offers

/** 0x4ce4e0 CONTRACT_MANAGER::resolve_contract_offers(staff): personen vælger det bedste af sine åbne tilbud (prøvetid/lån 0x846920, ellers
 *  tilbuddets værdi 0x866830 mod hans ønskede kontrakt 0x85fc50 minus loyalitet, vægtet med klubbens tiltrækning), accepterer det
 *  (+0x50 = 2, 0x8c38b0 underskriver) og afviser resten (+0x50 = 1, svar 0x4d49a0/0x8c28c0); afviste fra andre klubber tilbageholdes (+0x38). */
export function resolveContractOffers_4ce4e0(c: CmCtx, self: number, staff: number): void {
  const m = c.m;
  const sp0 = SP;
  const C = alloc(m, 0x10);
  try {
    let best = 2.75, bestOffer = 0, ownOffer = 0, agreed = false, flag68 = 0;
    const L1 = alloc(m, 0x70);
    constructContract_85e410(m, L1);
    dateInit_54a110(m, L1 + 0x51);
    const A: number[] = [], B: number[] = [];                               // de lokale lister [esp+0x58] (tilbud) og [esp+0x78] (point)
    const L2 = alloc(m, 0x50);
    constructContract_85e410(m, L2);
    listInit_68d020(m, C);
    const loyInt = s8(m.u8(staff + 0x5b)) - s8(m.u8(staff + 0x57)) + s8(m.u8(staff + 0x59)) - 9;
    const loyAdj = loyInt * 0.0033333333333333335;
    if (c.call(0x8cd150, tm(m), staff)) {
      const d = alloc(m, 8);
      wrDate(m, d, addDays_54c5b0(m, G.TODAY, 2));
      addDecisionDate_4cd6d0(c, self, staff, d, m.u8(G.SLICE), 3);
      return;
    }
    let score = 0, a = 0, x = 0, isOwn = loyInt;                            // [esp+0x14], [esp+0x4c], [esp+0x2c], [esp+0x28] (bevares mellem tilbud)
    const ckub = (o: number) => clubOfC(m, o);
    const handle = (o: number): void => {
      if (m.s32(o) !== m.s32(staff)) return;
      if (!m.u8(o + 0x62)) return;
      if (m.s32(o + 0x59) === -1) {
        const con = getContract(m, staff);
        m.w32(G.LAST_CONTRACT, con);
        const own = con ? clubOfC(m, con) : 0;
        if (own !== ckub(o) && (m.u8(o + 0x35) & 0x3f) !== 5) { listRemove_68d1f0(m, m.u32(self + 0x34), o); offerCount(m, staff, -1); return; }
      }
      const state = m.u8(o + 0x50);
      if (state !== 0) { if (state === 2) agreed = true; return; }
      const type = m.u8(o + 0x35) & 0x3f;
      if (type === 5 || type === 6) {
        const v = type === 5 ? c.call(0x846920, slm(m), staff, ckub(o), 0, 1, 8, 0)
          : c.call(0x846920, slm(m), staff, ckub(o), 0, 1, c.call(0x849f00, slm(m), staff, ckub(o), 0) & 0xff, 0);
        score = v;
        if (v > best && !(v < 3.15)) { best = v; bestOffer = o; } else score = 0;
        a = 0;
      } else {
        const s4 = m.u8(o + 0x4f) >> 4;
        if (m.s32(o + 0x59) !== -1) {
          const tOffer = m.u32(c.call(0x8c61e0, tm(m), m.s32(o + 0x59)));
          const ex = c.call(0x8e82f0, tOffer, staff);
          if (ex) m.w8(ex + 5, s4);
        }
        setToDesiredContract_85fc50(c, L2, staff, ckub(o), -1, s4, m.u8(o + 0x61), 0, 0);
        a = calcContractValue_866830(c, L2, staff, L2) | 0;
        if (!(a > 0)) score = 0;
        else {
          const bv = calcContractValue_866830(c, o, staff, L2) | 0;
          score = bv / a - loyAdj;
          if (m.u32(staff + 0x69) && m.u8(o + 0x61) !== 0xb) {
            x = c.call(0x844780, slm(m), staff, ckub(o), 0, m.u8(o + 0x61), 0);
            if (isPlayerJob_53b620(m.u8(o + 0x61))) { const y = c.call(0x846920, slm(m), staff, ckub(o), 0, 0, s4, 0); x = (y + x) * 0.5; }
          } else x = c.call(0x846920, slm(m), staff, ckub(o), 0, 0, s4, 0);
          const c1 = getContract(m, staff);
          m.w32(G.LAST_CONTRACT, c1);
          if (c1 && clubOfC(m, c1)) {
            const c2 = getContract(m, staff);
            m.w32(G.LAST_CONTRACT, c2);
            const cl = c2 ? clubOfC(m, c2) : 0;
            if (m.s32(cl) === m.s32(o + 4)) {
              isOwn = 1;
              if (!(score < 0.99) && !(x > 3.15)) x = 3.15;
            } else isOwn = 0;
          } else isOwn = 0;
          if (score < 0.6) score = 0;
        }
      }
      // 0x4ceae2
      if (notPlayer_53b610(m.u8(o + 0x61)) && m.u32(staff + 0x69) === 0 && !(c.call(0x7a6e20, m.u32(0xb7434c)) & 0xff)) score = 0;
      else if (score > 0.5 && c.call(0x8c7560, tm(m), staff, ckub(o), 0) && daysSince_54cdb0(m, o + 0x2d, rdDate(m, G.TODAY)) < 0x5a) score = 0;
      A.push(o); B.push(score);
      if (a === 0) return;
      let f: number;
      if (score < 0.9) {
        if (score > 0.8 && x > 3.15) f = x;
        else if (score > 0.7 && x > 3.5) f = x > 3.15 ? x : 3.15;
        else { if (isOwn) ownOffer = o; return; }
      } else f = x > 3.15 ? x : 3.15;
      x = f;
      const t = f * score;
      if (t > best) { best = t; bestOffer = o; } else if (isOwn) ownOffer = o;
    };
    const list = m.u32(self + 0x34);
    if (list) {
      listReset(m, list);
      for (let o = listNext_68d1b0(m, m.u32(self + 0x34)); o; o = listNext_68d1b0(m, m.u32(self + 0x34))) handle(o);
    }
    if (agreed) bestOffer = 0;
    else if (m.u32(staff + 0x69) && (c.call(0x69fc60, m.u32(0xb67a44), staff) & 0xff)) bestOffer = 0;
    // 0x4cecaf: svarene
    for (let i = 0; i < A.length; i++) {
      const o = A[i];
      if (o === bestOffer && !agreed) { m.w8(o + 0x50, 2); c.call(0x7549b0, m.u32(0xb6b7c8), staff); c.call(0x8c5410, tm(m), staff); }
      else {
        m.w8(o + 0x50, 1);
        if (m.s32(o + 0x59) !== -1) c.call(0x8c28c0, tm(m), staff, m.s32(o + 0x59), bestOffer);
        else c.call(0x4d49a0, self, o, ownOffer === o && m.u32(staff + 0x61) && m.u8(o + 0x61) === 0xb && !bestOffer ? 1 : 0);
      }
    }
    // 0x4ced79
    if (bestOffer) {
      copyBytes(m, L1, bestOffer, 0x6f);
      const type = m.u8(L1 + 0x35) & 0x3f;
      if (type !== 5 && type !== 6 && best > 10.0) {
        let r = 40.0 - best;
        if (5.0 > r) r = 5.0;
        if (s8(m.u8(staff + 0x59)) > c.rand(ftol(r))) {
          const cid = m.s32(L1 + 4);
          if (cid > -1 && m.u32(clubAt(m, cid) + 0xcf)) {
            if (m.s16(clubAt(m, cid) + 0x80) > 0x1194 || c.rand(4) === 0) {
              if (c.rand(2) !== 0) c.call(0x547a10, staff, m.u32(clubAt(m, cid) + 0xcf), 1);
              else c.call(0x547d90, staff, clubAt(m, cid), 1);
            }
          }
        }
      }
    } else if (ownOffer) { const ra = rowOf(m, m.s32(staff)) + 0xb; m.w8(ra, m.u8(ra) | 0x80); }
    // 0x4cf096: tilbuddene fjernes (det accepterede underskrives)
    for (let i = 0; i < A.length; i++) {
      const o = A[i];
      if (bestOffer) {
        if (m.s32(o + 4) === m.s32(L1 + 4)) {
          if (m.s32(L1 + 0x59) !== -1) continue;
          const r = c.call(0x8c38b0, tm(m), L1);
          flag68 = r === 0 ? 1 : 0;
          if (r !== 0) {
            if (notPlayer_53b610(m.u8(L1 + 0x61)) && m.u32(staff + 0x69) === 0) {
              const pp = alloc(m, 12);
              c.call(0x7a6e30, m.u32(0xb7434c), pp, pp + 4, pp + 8);
              const idx = m.s32(pp);
              if (idx >= 0 && idx <= m.s32(0xae2368)) m.w32(staff + 0x69, m.u32(0xae23c0) + 0x44 * idx);
              else m.w32(0xb67a34, 0);                                     // fejlboksen (contract_manager.cpp 0x13b4) – udeladt
            }
            const con = getContract(m, staff);
            m.w32(G.LAST_CONTRACT, con);
            const cl = con ? clubOfC(m, con) : 0;
            let flagV = 0, doValue = false;
            if (cl && isHuman(c, cl, 1, 1)) {
              c.call(0x8b2880, m.u32(0xde1f44), m.u32(staff + 0x39), 0);
              c.call(0x7f7270, m.u32(0xb74448), m.u32(cl + 0xcf));
              if ((m.u8(L1 + 0x4e) & 4) && m.u32(staff + 0x61)) { doValue = true; flagV = 1; }
            } else if (m.u32(staff + 0x61)) { m.w8(L1 + 0x4e, m.u8(L1 + 0x4e) | 4); doValue = true; flagV = 0; }
            if (doValue) m.w32(staff + 0x52, c.call(0x4d0c60, self, staff, cl, 0, -1, flagV) | 0);
          }
          listRemove_68d1f0(m, m.u32(self + 0x34), o);
          offerCount(m, staff, -1);
          c.call(0x8c5430, tm(m), staff);
          continue;
        }
        if (m.s32(L1 + 0x59) !== -1) {
          if (!m.u32(self + 0x38)) {
            const p = c.call(0x944cf1, 0xe);
            if (p) listInit_68d020(m, p);
            m.w32(self + 0x38, p);
          }
          listAdd_68d0d0(c, m.u32(self + 0x38), o, 0x6f);
        }
        listAdd_68d0d0(c, C, o + 4, 4);
        listRemove_68d1f0(m, m.u32(self + 0x34), o);
        offerCount(m, staff, -1);
      } else {
        if (m.u8(o + 0x50) === 3) continue;
        listRemove_68d1f0(m, m.u32(self + 0x34), o);
        offerCount(m, staff, -1);
      }
    }
    if (flag68) return;
    if (bestOffer) {
      if (m.s32(L1 + 0x59) !== -1) {
        if (notPlayer_53b610(m.u8(L1 + 0x61)) && m.u32(staff + 0x69) === 0) c.call(0x7a6e30, m.u32(0xb7434c), bestOffer + 0x63, bestOffer + 0x67, bestOffer + 0x6b);
        c.call(0x8c2180, tm(m), staff, m.s32(L1 + 0x59), L1, m.u32(L1 + 0x61), C);
      } else c.call(0x4d49a0, self, L1, 0);
      const ra = rowOf(m, m.s32(staff)) + 0xb;
      m.w8(ra, m.u8(ra) & 0x7f);
    }
  } finally {
    listDestroy_68d040(m, C);
    SP = sp0;
  }
}
