// Finance (klubbens finanspost à 0x167 bytes, this = FinanceTable-posten): lønloftet og lønsummen – oversat instruktion for instruktion fra
// cm0102.exe 3.9.68 (transfer/kontrakt runde 2, 13/11-2026):
//   0x5986b0 balance_status  (−2/−1/0/1/2 af saldoen +0 (int64) mod omdømmet)
//   0x597db0 get_max_staff_wage(job) (lønloftet for ikke-spillere pr. job)
//   0x598370 recalc_wages     (+0x10 højeste løn, +0xc lønsummen inkl. udfyldning til 15 spillere, +0x14 = 0x5968d0(0, −1))
//   0x5968d0 get_max_wage(staff, status) (det højeste, klubben vil betale en spiller/staff – staff 0 = klubbens generelle loft)
// Finansposten: +0 saldo (int64), +8 klubbens id, +0xc lønsum (ugeløn i alt), +0x10 højeste ugeløn, +0x14 lønloftet (0x5968d0(0, −1)).
// Klubposten (0x245): +0x53 nation, +0x57 stadion (+0x69 kapacitet/1000), +0x5b andet stadion, +0x64 status (1 professionel, 2 semi, 3 amatør),
// +0x80 omdømme (s16), +0x82 flag, +0x9b/+0x9f/+0xa3 favoritspillere, +0xbf manageren, +0xcf formanden, +0xd7 spillerne (50), +0x19f/+0x1b3/+0x1cf stab.
// Nationsposten: +0 id, +0x7e (1..3), +0x85 (byte). Staff: +0x18 alder, +0x22, +0x39 klub, +0x3d job, +0x57 (byte), +0x61 spillerdata
// (+5 CA, +0xb omdømme, +0xd verdensomdømme), +0x69 ikke-spillerdata (+0xa, +0xf, +0x20).
// x87 med præcisionskontrol 53 bit = double; _ftol 0x945640 = trunkering. Kald, der ikke er porteret: 0x600a50 (menneskeklub), 0x53d7f0, 0x864550 (cmWage.ts).
import { bigClub_53d7f0 } from './cmClubLinks';
import { type CmCtx, type CmMem, G, ftol, s8, s16, tdiv, getContract, getLoanContract } from './cmMem';
import { contractForClub_4cf5f0, daysSince_54cdb0 } from './cmContractWant';
import { defaultStaffContract_864550 } from './cmWage';

const NAT = (m: CmMem, a: number) => m.s32(a);
const clubOfFin = (m: CmMem, fin: number) => (m.u32(G.CLUBS) + 0x245 * m.s32(fin + 8)) >>> 0;
/** 0x53b900 landsholdet (klub-id ≥ antal klubber − 2·antal landshold) */
const nationalSide = (m: CmMem, club: number) => club !== 0 && m.s32(club) >= m.s32(0xae235c) - 2 * m.s32(0xae2350);
/** saldoen +0 som int64 (Number – præcis for |v| < 2^53) */
const bal64 = (m: CmMem, fin: number) => m.s32(fin + 4) * 4294967296 + m.u32(fin);
const human = (c: CmCtx, club: number, a: number) => c.call(0x600a50, club, a, 1, 0, 0) !== 0;

/** 0x4d0c20 CONTRACT_MANAGER::get_wage(staff): egen kontrakts ugeløn +0xc eller 0 */
export function wageOf_4d0c20(m: CmMem, staff: number): number {
  const k = getContract(m, staff);
  return k ? m.s32(k + 0xc) : 0;
}
/** 0x547790 (staff, club): en af klubbens favoritspillere +0x9b/+0x9f/+0xa3 */
export const clubFavourite_547790 = (m: CmMem, staff: number, club: number) =>
  !!staff && !!club && (m.u32(club + 0x9b) === staff || m.u32(club + 0x9f) === staff || m.u32(club + 0xa3) === staff);
/** 0x547810 (staff, person): en af personens favoritspillere (+0x65 → +0x1c/+0x20/+0x24) */
export function staffFavourite_547810(m: CmMem, staff: number, person: number): boolean {
  if (!staff || !person) return false;
  const p = m.u32(person + 0x65);
  return !!p && (m.u32(p + 0x1c) === staff || m.u32(p + 0x20) === staff || m.u32(p + 0x24) === staff);
}

/** 0x5986b0 Finance::balance_status → s8 */
export function balanceStatus_5986b0(m: CmMem, fin: number): number {
  const club = clubOfFin(m, fin);
  if (nationalSide(m, club)) return 0;
  const R = m.s16(club + 0x80);
  const b = bal64(m, fin);
  if (b > ((2500 * R + 5000000) | 0)) return 2;
  if (b > ((1000 * R + 3500000) | 0)) return 1;
  if (b < ((-2500000 - 1500 * R) | 0)) return -2;
  if (R < 5000) return b < ((-250 * R) | 0) ? -1 : 0;
  return b < (((3750 - R) * 1000) | 0) ? -1 : 0;
}

/** 0x597db0 Finance::get_max_staff_wage(job) */
export function maxStaffWage_597db0(c: CmCtx, fin: number, job: number): number {
  const m = c.m;
  const club = clubOfFin(m, fin);
  if (m.u8(club + 0x64) === 3) return 0;
  const R50 = tdiv(m.s16(club + 0x80), 50);
  const j = (s8(job) - 5) >>> 0;
  const base = j <= 2 ? 35000 : j === 3 ? 20000 : j === 4 ? 1500 : j === 5 ? 1000 : 750;
  if (nationalSide(m, club)) return base;
  let L00: number, esi: number;
  const nat = m.u32(club + 0x53);
  if (!nat) { esi = L00 = ftol(base * 0.25); }
  else {
    let bl = s8(m.u8(nat + 0x7e)); if (bl < 1) bl = 1; else if (bl > 3) bl = 3;
    const a = s8(m.u8(nat + 0x85));
    esi = L00 = ftol((a / (bl * 20)) * base);
    if (bl === 1) {
      const n = m.s32(nat);
      const grp = (k: number, T: number) => {
        const R16 = s16(R50);
        let st = k;
        if (R16 > a * 10) st = (R16 / (a >= 1 ? a : 1)) * 0.1 * k;
        if (esi > T) { if (st > 1.0) st = 1.0; esi = L00 = ftol((esi - T) * st + T); }
      };
      if (n === NAT(m, 0x9cf2e4) || n === NAT(m, 0x9cf360) || n === NAT(m, 0x9cf488)) {
        if (m.s16(club + 0x80) > 0x1c52) esi = L00 = ftol(L00 * 1.05);
      } else if (n === NAT(m, 0x9cf36c)) { /* intet */ }
      else if (n === NAT(m, 0x9cf4f8)) { if (esi > 1750) esi = L00 = ftol((esi - 1750) * 0.75 + 1750); }
      else if (n === NAT(m, 0x9cf314) || n === NAT(m, 0x9cf300) || n === NAT(m, 0x9cf45c) || n === NAT(m, 0x9cf338)) grp(0.75, 2500);
      else if (n === NAT(m, 0x9cf4a8) || n === NAT(m, 0x9cf2c0) || n === NAT(m, 0x9cf244) || n === NAT(m, 0x9cf434)) grp(0.75, 1250);
      else grp(0.3, 750);
    }
    const st = m.u32(club + 0x57);
    if (st) esi = L00 = ftol(m.s16(st + 0x69) * L00 * 0.2);
  }
  switch (s8(balanceStatus_5986b0(m, fin))) {
    case -2: esi = ftol(L00 * 0.75); break;
    case -1: esi = ftol(L00 * 0.95); break;
    case 1: esi = ftol(L00 * 1.5); break;
    case 2: esi = (esi + esi) | 0; break;
  }
  if (m.s32(fin + 0x14) < esi) esi = m.s32(fin + 0x14);
  const lim = (hi: number, lo: number) => (esi > hi ? hi : esi < lo ? lo : Math.min(esi, 250000));
  switch (j) {
    case 0: return lim(35000, 1750);
    case 1: case 2: return lim(20000, 500);
    case 3: return lim(7500, 250);
    case 4: return lim(2000, 125);
    case 5: return lim(1500, 125);
    default: return lim(1000, 125);
  }
}

/** 0x598370 Finance::recalc_wages (this = finansposten) */
export function recalcWages_598370(c: CmCtx, fin: number): void {
  const m = c.m;
  m.w32(fin + 0x10, 0); m.w32(fin + 0xc, 0);
  const club = clubOfFin(m, fin);
  let count = 0;
  const add = (w: number) => {
    if (w > m.s32(fin + 0x10)) m.w32(fin + 0x10, w);
    m.w32(fin + 0xc, (m.s32(fin + 0xc) + w) | 0);
  };
  for (let i = 0; i < 50; i++) {
    const st = m.u32(club + 0xd7 + 4 * i);
    if (!st) continue;
    count = s8(count + 1);
    const k = contractForClub_4cf5f0(c, st, club);
    if (!k) continue;
    let w = m.s32(k + 0xc);
    if (w === -1) w = ftol(defaultStaffContract_864550(c, st, club, 0, -1, 0xb, 0));
    const loan = getLoanContract(m, st);
    if (loan && (m.u8(k + 0x35) & 0x3f) !== 6) w = (w - m.s32(getLoanContract(m, st) + 0xc)) | 0;
    add(w);
  }
  for (const [off, n] of [[0x19f, 5], [0x1b3, 7], [0x1cf, 3]] as const) for (let i = 0; i < n; i++) {
    const st = m.u32(club + off + 4 * i);
    if (!st) continue;
    const k = getContract(m, st);
    if (k) add(m.s32(k + 0xc));
  }
  const r = m.s16(club + 0x80);
  if (count < 15) {
    let e = r > 0x128e ? r - 0x79e : r > 0x8ca ? ftol((r - 0x8ca) * 0.5 + 550.0) : ftol(r * 0.25);
    if (m.u8(club + 0x64) !== 1) e = ftol(e * 0.5);
    const nat = m.u32(club + 0x53);
    if (nat) { let d = s8(m.u8(nat + 0x7e)); if (d < 1) d = 1; else if (d > 3) d = 3; e = tdiv(e, d); }
    m.w32(fin + 0xc, (m.s32(fin + 0xc) + Math.imul(15 - count, e)) | 0);
  }
  const r2 = Math.imul(r, r);
  let x: number;
  if (m.u8(club + 0x64) === 1) {
    const nat = m.u32(club + 0x53);
    if (nat && (m.s32(nat) === NAT(m, 0x9cf2e4) || m.s32(nat) === NAT(m, 0x9cf360))) x = r > 0x1482 ? r2 * 0.001 : r > 0xcb2 ? r2 * 0.0008 : r2 * 0.0006;
    else x = r2 * 0.0004;
  } else x = r > 0xcb2 ? r2 * 0.0002 : r2 * 0.0001;
  m.w32(fin + 0xc, ftol(x + m.s32(fin + 0xc)));
  m.w32(fin + 0x14, getMaxWage_5968d0(c, fin, 0, -1));
}

// 0x5968d0's tabeller i .data (int64 à 22): årsbudget pr. omdømme/10 (T) og gulvet (X)
const T_8498 = [4000, 5000, 6000, 7000, 8000, 10000, 14000, 18000, 25000, 30000, 45000, 60000, 75000, 100000, 125000, 150000, 200000, 250000, 300000, 350000, 400000, 475000];
const T_8548 = [4000, 5000, 6000, 7000, 8000, 10000, 14000, 18000, 30000, 60000, 90000, 125000, 150000, 175000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 575000];
const T_85F8 = [5000, 6000, 7000, 8000, 10000, 14000, 18000, 30000, 60000, 90000, 125000, 160000, 210000, 275000, 350000, 400000, 475000, 550000, 650000, 750000, 875000, 950000];
const T_86A8 = [5000, 6000, 7000, 8000, 10000, 14000, 18000, 30000, 75000, 100000, 140000, 180000, 250000, 350000, 400000, 525000, 650000, 750000, 850000, 1000000, 1255000, 1500000];
const X_8338 = [250, 250, 300, 450, 600, 700, 800, 1000, 1500, 2500, 5000, 8000, 12000, 15000, 18000, 21000, 24500, 28000, 31500, 35000, 40000, 45000];
const X_83E8 = [250, 250, 300, 450, 600, 700, 800, 1000, 1500, 2500, 5000, 8000, 13250, 18000, 21000, 25000, 30000, 35000, 42500, 50000, 60000, 70000];

/** 0x5968d0 Finance::get_max_wage(staff, status) → ugeløn */
export function getMaxWage_5968d0(c: CmCtx, fin: number, staff: number, statusArg: number): number {
  const m = c.m;
  let status = s8(statusArg);
  const L24 = ftol(bal64(m, fin) * 1.3);
  let L1c = 100, D = 0.25, L20 = 0;
  const club = clubOfFin(m, fin);
  if (m.u8(club + 0x64) === 3) return 0;
  const r80 = () => m.s16(club + 0x80);
  let edi = tdiv(r80(), 50);
  const s = nationalSide(m, club) ? 0 : s8(balanceStatus_5986b0(m, fin));
  // tabellen
  let T: number[];
  const nat0 = m.u32(club + 0x53);
  const nIs = (n: number, ...a: number[]) => a.some((x) => n === NAT(m, x));
  if (!nat0) T = T_8498;
  else {
    const n = m.s32(nat0);
    if (nIs(n, 0x9cf510, 0x9cf2dc, 0x9cf3e4, 0x9cf224)) T = T_8498;
    else if (nIs(n, 0x9cf36c, 0x9cf4a8, 0x9cf2ac, 0x9cf430, 0x9cf408, 0x9cf4f8, 0x9cf434, 0x9cf2c0, 0x9cf2fc, 0x9cf45c, 0x9cf314)) T = T_8548;
    else if (n === NAT(m, 0x9cf300)) T = T_85F8;
    else T = m.u8(club + 0x82) !== 0 && s !== 2 && s !== 1 ? T_85F8 : T_86A8;
  }
  const big = T === T_86A8;
  if (s === 0) { if (r80() > 0x1676) edi = big ? tdiv(r80() - 0x186a, 25) + 0x73 : edi + 5; }
  else if (s === 1) { if (r80() > 0x1482) edi = big ? tdiv(r80() - 0x1482, 25) + 0x69 : edi + 10; else edi += 5; }
  else if (s === 2) { if (r80() > 0x128e) edi = big ? tdiv(r80() - 0x128e, 25) + 0x5f : edi + 15; else edi += 10; }
  let L04 = ftol(s16(edi) * 47.6);
  if (s16(L04) > 10000) L04 = 10000;
  if (s16(edi) > 0xd2) edi = 0xd2;
  if (human(c, club, 0) && u8eq(status, 0xff)) {
    const k = contractForClub_4cf5f0(c, staff, club);
    L20 = k;
    if (k) status = m.u8(k + 0x4f) >> 4;
  }
  let L08 = 0, L10 = 0, esi = 0;
  // 0x596c0d/0x596c11: L10 for de tre store lande
  const sectionG = () => {
    esi = 0; L10 = 0;
    const nat = m.u32(club + 0x53);
    if (!nat) return;
    const n = m.s32(nat);
    if (!nIs(n, 0x9cf2e4, 0x9cf360, 0x9cf488) || r80() <= 0x128e || !(s === 2 || s === 1 || s === 0)) return;
    const a = s16(L04);
    const off = m.u8(club + 0x82) !== 0 ? 0x4e2 : 0x2ee;
    if (a < 0x1676 || s === 0) esi = 6 * (a - off);
    else if (s === 1) esi = a * 8 - (off === 0x4e2 ? 10000 : 6000);
    else esi = 10 * (a - off);
    esi |= 0; L10 = esi;
  };
  if (staff) {
    if (m.u32(staff + 0x39) === club) {
      L08 = wageOf_4d0c20(m, staff);
      if (L08 > 2 * m.s32(fin + 0x14)) L08 = 2 * m.s32(fin + 0x14);
    }
    if (m.s32(fin + 0x14) > L08) L08 = m.s32(fin + 0x14);
    if (m.u32(staff + 0x69) && !m.u32(staff + 0x61)) {
      const j = (s8(m.u8(staff + 0x3d)) - 5) >>> 0;
      const cap = j <= 2 ? 35000 : j === 3 ? 20000 : j === 4 ? 1500 : j === 5 ? 1000 : 750;
      if (L08 > cap) L08 = cap;
    }
    sectionG();
  } else {
    const nat = m.u32(club + 0x53);
    let st: number;
    if (!nat) st = D;
    else {
      let dl = s8(m.u8(nat + 0x7e)); if (dl < 1) dl = 1; else if (dl > 3) dl = 3;
      const bl = s8(m.u8(nat + 0x85)), a = bl;
      st = a / (dl * 20); D = st;
      if (dl === 1) {
        const n = m.s32(nat);
        let f: number;
        const grp = (k: number, cap: number | null) => {
          const e = s16(edi);
          if (!(e > a * 10)) return k;
          let v = (e / (bl >= 1 ? a : 1)) * 0.1 * k;
          if (cap !== null && v > cap) return cap;
          if (v > 1.0) v = 1.0;
          return v;
        };
        if (nIs(n, 0x9cf2e4, 0x9cf360, 0x9cf488, 0x9cf36c)) f = 1.0;
        else if (n === NAT(m, 0x9cf4f8)) f = 0.75;
        else if (nIs(n, 0x9cf314, 0x9cf300, 0x9cf45c, 0x9cf338)) f = grp(0.65, null);
        else if (nIs(n, 0x9cf260, 0x9cf218, 0x9cf4a8, 0x9cf244, 0x9cf434)) f = grp(0.55, null);
        else if (nIs(n, 0x9cf2c0, 0x9cf408, 0x9cf2fc)) f = grp(0.35, 0.75);
        else f = grp(0.3, null);
        st = D * f; D = st;
      }
      const sd = m.u32(club + 0x57);
      if (sd) {
        const sd2 = m.u32(club + 0x5b);
        let v: number;
        if (sd2 && m.s16(sd2 + 0x69) > m.s16(sd + 0x69)) {
          const cb = m.s16(sd + 0x69), ab = m.s16(sd2 + 0x69);
          const t1 = ftol(Math.imul(Math.imul(cb, cb), cb) * D * -1.25);
          const t2 = ftol(Math.imul(Math.imul(ab, ab), ab) * D * 1.25);
          v = (t2 - t1) | 0;
        } else { const cb = m.s16(sd + 0x69); v = ftol(Math.imul(Math.imul(cb, cb), cb) * D * 2.5); }
        L1c = v < 0xc8 ? 0xc8 : v;
      }
    }
    // 0x596fce (st = D)
    const e = s16(edi);
    L10 = e;
    const dv = tdiv(200 - e, 10);
    const div = dv >= 1 ? dv : 1;
    const v = ftol((e * e * e * D) / div);
    const wk = tdiv((v + L24) | 0, 52);
    const ecx = (m.s32(fin + 0xc) - wk) | 0;
    const i = tdiv(e, 10);
    const q = (T[i] - ecx) * D, x = (big ? X_83E8 : X_8338)[i] * D;
    L08 = ftol(q <= x ? x : q);
    if (nationalSide(m, club)) sectionG();
    else {
      const r = s8(balanceStatus_5986b0(m, fin));
      if (r === 1) L08 = ftol(L08 * 1.05); else if (r === 2) L08 = ftol(L08 * 1.1);
      const nat2 = m.u32(club + 0x53);
      if (nat2) {
        const n = m.s32(nat2);
        if (n === NAT(m, 0x9cf360) || n === NAT(m, 0x9cf488)) { if (r80() > 0x1e46) L08 = ftol(L08 * 1.05); }
        else if (n === NAT(m, 0x9cf2e4) && r80() > 0x1e46) L08 = ftol(L08 * 1.025);
        if (m.u8(club + 0x82) === 0 && r80() > 0x1e46 && (n === NAT(m, 0x9cf360) || n === NAT(m, 0x9cf488))) L08 = ftol(L08 * 1.05);
      }
      sectionG();
    }
  }
  // 0x597238
  let ebx: number;
  let toSwitch = false;
  if (staff) {
    const X = r80() * r80() * D * 0.0001 + m.s32(fin + 0x10);
    const w = wageOf_4d0c20(m, staff);
    ebx = w < X ? ftol(X) : w;
    L04 = ebx;
    const pd = m.u32(staff + 0x61);
    const age = s8(m.u8(staff + 0x18));
    if (pd && m.s16(pd + 0xb) > 0x1482 && (status === 3 || status === 2 || status === 1) && age < 0x20) {
      if (status === 3) {
        D = L10; const Y = L10 * 0.8;
        if (L08 < Y) L08 = !human(c, club, 0) && m.u32(staff + 0x61) && m.s16(m.u32(staff + 0x61) + 0xb) > 0x1c52 ? ftol(D * 0.9) : ftol(Y);
      } else if (status === 2) {
        D = L10 * 0.9;
        if (L08 < D) L08 = !human(c, club, 0) && m.u32(staff + 0x61) && m.s16(m.u32(staff + 0x61) + 0xb) > 0x1e46 ? esi : ftol(D);
      } else if (L08 < esi) L08 = esi;
    }
    if (human(c, club, 0) && pd) {
      const cx = m.s16(pd + 0xb), ca = m.s16(pd + 5);
      const ag = s8(m.u8(staff + 0x18)), f22 = m.u8(staff + 0x22) !== 0;
      const top = status < 4 && status !== 0 && status !== 7;
      let e: number;
      if (cx < 0xea6) {
        if (ca < 60) e = ag <= 23 ? 5000 : 7500;
        else if (ca < 100) e = (status >= 4 || status === 0) && ag < 24 ? 10000 : 15000;
        else e = 25000;
      } else if (cx < 0x1482) e = ca >= 100 ? 30000 : 25000;
      else if (cx < 0x1c52) {
        if (ag > 0x22 && ca < 0x78) e = top ? 37500 : 32500;
        else if (ca < 0x8c && m.s16(pd + 0xd) < 0xea6) e = f22 ? 45000 : 40000;
        else if (top) e = f22 ? 57500 : ca >= 0x8c ? 80000 : 65000;
        else e = 45000;
      } else e = m.s16(pd + 0xd) < 0x1a5e ? (f22 ? 125000 : 100000) : 175000;
      if (e < L08) L08 = (e - ftol((L08 - e) * -0.1)) | 0;
    }
    if (pd) {
      const nat = m.u32(club + 0x53);
      if (nat && nIs(m.s32(nat), 0x9cf360, 0x9cf2e4, 0x9cf314, 0x9cf300, 0x9cf488)) {
        if (bigClub_53d7f0(m, club)) L04 = ebx = ftol(L04 * 1.05);
        const tm = m.u32(0xde1f54);
        if (tm) {
          const div = r80() < 1000 ? 1000 : r80();
          const tab = m.u32(m.u32(tm + 0x856) + 0xdc);
          let f = m.s16(tab + 9 * m.s32(club) + 5) / div;
          if (!(1.0 <= f)) f = 1.0; else if (1.2 < f) f = 1.2;
          L04 = ebx = ftol(L04 * f);
        }
        const recent = () => {
          const k = L20;
          return k && m.u32(staff + 0x39) === club && daysSince_54cdb0(m, k + 0x2d, m.s16(G.TODAY), m.u16(G.TODAY + 2)) < 200;
        };
        let mul = 0;
        if (r80() > 0x186a) {
          if (recent()) {
            if (m.s16(pd + 0xd) > 0x1482) mul = 1.2;
            else if (m.s16(pd + 0xb) > 0x1c52) mul = 1.1;
            else { const cc = m.u8(L20 + 0x4f) & 0xf0; if ((cc === 0x30 && m.s16(pd + 0xb) > 0x1482) || cc === 0x10 || cc === 0x20) mul = 1.05; }
          } else if (m.s16(pd + 0xd) > 0x1482) mul = 1.1;
          else if (m.s16(pd + 0xb) > 0x1a5e) mul = 1.05;
        } else if (r80() > 0x109a) {
          if (recent()) {
            const c2 = m.s16(pd + 0xb);
            if (c2 > 0x1a5e) mul = 1.05;
            else { const cc = m.u8(L20 + 0x4f) & 0xf0; if ((cc === 0x30 && c2 > 0x1482) || cc === 0x10 || cc === 0x20) mul = 1.02; }
          } else if (m.s16(pd + 0xb) > 0x1e46) mul = 1.02;
        }
        if (mul) L04 = ebx = ftol(L04 * mul);
      }
      // 0x597957: manageren
      const mgr = m.u32(club + 0xbf);
      if (mgr && m.u32(mgr + 0x69) && r80() < m.s16(pd + 0xb) + 0x4e2) {
        L04 = ebx = ftol((s8(m.u8(mgr + 0x57)) * 0.01 + 0.9) * L04);
        if (staffFavourite_547810(m, staff, mgr) || clubFavourite_547790(m, staff, club)) L04 = ebx = ftol((s8(m.u8(m.u32(club + 0xbf) + 0x57)) * 0.01 + 1.0) * L04);
        const mg = m.u32(club + 0xbf), npd = m.u32(mg + 0x69);
        const b = s8(m.u8(npd + 0xf));
        if (b < 6) {
          const ch = m.u32(club + 0xcf);
          let hi = false;
          if (ch && s8(m.u8(ch + 0x57)) > 0xf) { const e2 = m.u32(ch + 0x69); hi = !!e2 && m.s16(e2 + 0xa) > 0x1c52; }
          L04 = ebx = ftol(L04 * (hi ? 1.1 : 1.05));
        } else if (b > 0xf) L04 = ebx = ftol(L04 * 0.95);
        if (m.u8(club + 0x82) === 0 && s8(m.u8(npd + 0x20)) > 0xf && s8(m.u8(mg + 0x57)) > 0xf) {
          if (r80() >= 0xabe && m.s16(pd + 0xb) >= 0x1c52) L04 = ebx = ftol(L04 * (r80() < 0x1676 ? 1.1 : 1.125));
          else L04 = ebx = ftol(L04 * 1.05);
        }
      }
      toSwitch = true;
    }
  } else {
    const a = s16(L04);
    ebx = ftol(a * a * D * 0.0001 + m.s32(fin + 0x10));
    L04 = ebx;
    if (ebx < esi) L04 = ebx = ftol(L04 * 0.75 + L10 * 0.25);
    const nat = m.u32(club + 0x53);
    if (!nationalSide(m, club) && nat) {
      const n = m.s32(nat);
      if (nIs(n, 0x9cf314, 0x9cf300)) {
        const r = s8(balanceStatus_5986b0(m, fin));
        if (r === 1) L04 = ebx = ftol(L04 * 1.05); else if (r === 2) L04 = ebx = ftol(L04 * 1.1);
      } else if (nIs(n, 0x9cf360, 0x9cf2e4, 0x9cf488)) {
        const r = s8(balanceStatus_5986b0(m, fin));
        if (r === 0) { if (r80() > 0x109a) L04 = ebx = ftol(L04 * 1.025); }
        else if (r === 1) L04 = ebx = ftol(L04 * 1.05);
        else if (r === 2) L04 = ebx = ftol(L04 * 1.1);
      }
    }
  }
  if (toSwitch && status > -1 && status - 1 <= 5) {
    const pdr = () => m.s16(m.u32(staff + 0x61) + 0xb);
    switch (status) {
      case 1: L04 = ebx = ftol(L04 * 1.25); break;
      case 2:
        if (!human(c, club, 1) && pdr() > 0x1a5e) { L04 = ebx = ftol(L04 * 1.25); break; }
        L04 = ebx = ftol(L04);
        if (!human(c, club, 1)) { const pd = m.u32(staff + 0x61); if (!pd || m.s16(pd + 0xb) >= 0x1e46) break; }
        if (ebx > 0x14c08) L04 = ebx = ftol((ebx - 0x14c08) * 0.2 + 85000.0);
        break;
      case 3:
        if (!human(c, club, 1) && pdr() > 0x1a5e) { L04 = ebx = ftol(L04 * 1.25); break; }
        L04 = ebx = ftol(L04 * 0.95); if (ebx > 0xd6d8) L04 = ebx = 0xd6d8;
        break;
      case 4:
        L04 = ebx = ftol(L04 * (!human(c, club, 1) && pdr() > 0x1a5e ? 0.95 : 0.75)); if (ebx > 0x927c) L04 = ebx = 0x927c;
        break;
      case 5:
        L04 = ebx = ebx > 0xc80 ? ftol((ebx - 0xc80) * 0.3 + 1920.0) : ftol(L04 * 0.6); if (ebx > 0x30d4) L04 = ebx = 0x30d4;
        break;
      case 6:
        L04 = ebx = ebx > 0xc80 ? ftol((ebx - 0xc80) * 0.15 + 1600.0) : ftol(L04 * 0.5); if (ebx > 0x203a) L04 = ebx = 0x203a;
        break;
    }
  }
  // 0x597708
  const kind = m.u8(club + 0x64);
  if (kind === 1) {
    if (ebx < 0xfa) L04 = ebx = 0xfa;
    if (r80() < 0x8ca && ebx > 0x834) ebx = ftol((L04 - 2100.0) * 0.2 + 2100.0);
  } else if (kind === 2) {
    L04 = ebx = ftol(L04 * 0.75);
    if (r80() < 0xabe && ebx > 0x4b0) ebx = ftol((L04 - 1200.0) * 0.2 + 1200.0);
    if (ebx < 0x96) ebx = 0x96;
  }
  if (ebx < L1c + 100) ebx = (L1c + 100) | 0;
  if (L1c > L08) return L1c;
  return ebx < L08 ? ebx : L08;
}
const u8eq = (v: number, b: number) => (v & 0xff) === b;
