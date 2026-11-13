// Spillerens ønskede kontrakt – STAFF_CONTRACT::set_to_desired_contract 0x85fc50 (cm0102.exe 3.9.68, oversat instruktion for instruktion
// 12/11-2026) med hjælperne 0x85e410, 0x866620, 0x866830, 0x4ce450, 0x85e590, 0x867d30, 0x867b50, 0x85f7a0–0x85f800, 0x4ca470, 0x4cf5f0,
// 0x54cdb0, 0x549ef0, 0x53b620, 0x549e50, 0x456740, 0x4a7f20. Ovenpå cmMem.ts (originalens adresser).
//
// ---------------------------------------------------------------- kontrakten (80 bytes, STAFF_CONTRACT)
//   +0 staff-id, +4 klub-id (−1 ingen), +8 underskriftsbeløb (signing on fee), +0xc ugeløn, +0x10/+0x14/+0x18 bonusser (mål, assist, clean sheet;
//   −1 = ingen), +0x1c..+0x20 fem klausulbytes (+0x1c mindstepris, +0x1d frikøb ved …, +0x1e …, +0x1f nedrykning, +0x20 …), +0x21 klausulbeløb,
//   +0x25 start (Date 8 bytes), +0x2d udløb (Date), +0x35 bitfelt (bit 0–5 kontrakttype: 1 rullende/udløbet, 2 almindelig, 5 lån …; bit 6 bevares;
//   bit 7 ungdomskontrakt/≈ «lav løn»), +0x36 dword, +0x3a byte, +0x3b word, +0x3d/+0x3e/+0x3f tællere, +0x40 begivenheder, +0x44 tilfredshed,
//   +0x45 klager, +0x49 byte, +0x4a dword (−1), +0x4e flag, +0x4f høj nibble trupstatus.
//
// ---------------------------------------------------------------- 0x85fc50(this = kontrakten, staff, club, a2, status, job, a5, outF) → heltal
//   thiscall, ret 0x1c. Kaldt af 0x4cda70 (klubbens tilbud), 0x4ce450 (laveste lønkrav), 0x4ce4e0, 0x866620, 0x866830, 0x8c9720 m.fl.
//   a2 = transfertilbuddets indeks i TRANSFER_MANAGER (−1 = intet: datoen +0x25 via 0x8cf470); status (byte) = trupstatus 1..7 (0xff = regnes:
//   0x4ca470 / 0x849f00); job (byte) = jobkoden (0xb spiller …); a5 videre til 0x844780/0x846920; outF = adresse til en float (0 = ingen) –
//   0x844780's/0x846920's resultat. Returnerer ftol(min(bonusværdi, løn·0,1) + løn') – kontraktens «værdi» (lønnen + bonusser/klausuler).
//   Skriver this: +0 … +0x4f (se ovenfor) og staff +0x3d (jobbet, når det er 0: 0xb med spillerpost, ellers 9) og [0xae1080] (0x4cf5a0's sidste).
//
//   Læser – staff (0x6e): +0 id, +0x18 alder, +0x1a nation*, +0x22 landskampe, +0x24 klub* (manager uden spillerpost), +0x39 klub*, +0x3d job,
//     +0x46 Date (databasens kontraktudløb), +0x57 Ambition, +0x58, +0x59 Loyalty, +0x5a Pressure, +0x5b Professionalism, +0x61 spillerpost*,
//     +0x69 ikke-spillerpost*.  spillerpost: +5 CA, +7 PA, +9/+0xb/+0xd omdømme (hjemme, nuværende, verden), +0xf GK, +0x10..+0x15 positioner.
//     ikke-spillerpost: +0xa omdømme.  klub (0x245): +0 id, +0x53 nation*, +0x57 division*, +0x64 status, +0x80 omdømme.  nation: +0 id,
//     +0x77, +0x85.  division: +0 id, +0x69 omdømme.  [[0xadadfc] + 4·division id] turneringsobjektet: +0x43, vtbl +0x98/+0x9c (virtuelle kald).
//     [0xae2d0c] + 79·id + 0xb (lav nibble).  Kontrakten med klubben (0x4cf5f0): +0xc, +0x1c, +0x1d, +0x1f, +0x2d, +0x3d, +0x3f, +0x44, +0x45.
//     Globale: [0xae2364], [0xae23b4], [0xae2c90] (i dag), [0x9cf2e4]/[0x9cf488]/[0x9cf360]/[0x9cf2fc]/[0x9cf4dc] (nationernes id'er),
//     [0xa83608] (s8, største antal år = 10 i exe'en), [0xb63d77 + 72·række] (0x669360's række: sæsonen krydser nytår).
//
//   c.call (ikke porteret, i rækkefølge efter forekomst):
//     0x540a50(club, &ud, 1) → B-holdets moder-/reserveklub (ud skrives som dword på SCR_540A50 – kalderen skal skrive den)
//     0x4d0c60(staff, club, 1, −1, 0) → spillerens værdi (thiscall CONTRACT_MANAGER; contract_manager_calc_player_value – originalValue.ts)
//     0x849f00(staff, club, 0) → trupstatus (Shortlist_Manager [[0xde1f54]+0x856], når status = 0xff og ingen kontrakt med klubben)
//     0x8cca10(staff, 0) → et fremtidigt skifte (TRANSFER_MANAGER [0xde1f54])     0x544520(staff, club) → (cdecl, «klubben er hans favorit»?)
//     0x844780(staff, club, 0, job, a5) → float (ikke-spiller: hvor gerne klubben vil have ham)   0x846920(staff, club, 0, 0, status, a5) → float
//     0x5a0590(club) → finansposten (FinanceTable [0xae2a38]; +0x10 = klubbens højeste løn)   0x5968d0(finans, staff, status) → højeste løn
//     0x600a50(club, 0, 1, 0, 0) → menneskets klub    0x8c61e0(a2) → tilbudspladsen   0x8cf0e0(tilbud, this+0x25)   0x8cf470(club, this+0x25)
//     0x4d45f0(club) → måneden 0..11 for sæsonslut    0x669360(club) → nationens række (s8)    VCALL + off: virtuelt kald (objektets vtbl + off)
//     0x7c6830(staff, club, sprog, 0) (0x85e590)   0x549c90(staff) (0x85e590)   0x5b7d20(spillerpost) → positionsflag (0x866830)
//   rand: præcis ét kald pr. 0x85fc50 med klub ≠ 0: rand(0x1c) (dagen i udløbsmåneden, 0x861e43).
//
// ---------------------------------------------------------------- tvivlspunkter
//   * 0x85ff81: ordet [esp+0x48] er ikke initialiseret uden spiller- og ikke-spillerpost (sættes her til 0 → 1).
//   * 0x861d6d: fejlgrenen (tilbudspladsen 0) læser adresse 0 og viser en fejlboks – ikke porteret (kun datoen = i dag, som efter alle grene).
//   * 0x861e14: +0x25 sættes ALTID til i dag efter 0x8cf0e0/0x8cf470 (deres dato overskrives) – sic.
//   * 0x866830 med offer = 0: originalens lokale kontrakt er kun delvist initialiseret før 0x85fc50 (her nulstillet).
//   * x87 i 80 bit, her double; resultater gemt som float (f32) som i originalen.

import { type CmCtx, type CmMem, G, ftol, s8, s16, u16, tdiv, getContract } from './cmMem';
import { crtPow } from './engine/crtMath';
import { defaultStaffContract_864550 } from './cmWage';

/** virtuelt kald: c.call(VCALL + off, objekt) = objektets vtbl[off/4]() (thiscall uden argumenter) */
export const VCALL = 0x1_0000_0000;
/** League::0x684790 (vtbl +0x98): +0xbe ≠ 0 og +0xd9 & 2;  League::0x6847b0 (vtbl +0x9c): +0xc1 ≠ 0 */
const VIRT: Record<number, (m: CmMem, o: number) => number> = {
  0x684790: (m, o) => (m.u8(o + 0xbe) !== 0 && (m.u8(o + 0xd9) & 2) !== 0 ? 1 : 0),
  0x6847b0: (m, o) => (m.u8(o + 0xc1) !== 0 ? 1 : 0),
};
/** virtuelt kald: målet slås op i objektets vtabel; de porterede metoder kaldes direkte, andre via c.call(målet, objektet) */
export function vcall(c: CmCtx, obj: number, off: number): number {
  const fn = c.m.u32(c.m.u32(obj) + off);
  const f = VIRT[fn];
  return f ? f(c.m, obj) : c.call(fn, obj);
}
/** skrabeområde for porternes lokale poster (under exe'ens billede 0x400000 – bruges ikke af originalen) */
export const SCR = 0x00300000;
export const SCR_540A50 = SCR + 0x00;      // 0x540a50's ud-parameter (dword)
const SCR_866620 = SCR + 0x100;             // 0x866620's lokale kontrakt (80 bytes)
const SCR_866830 = SCR + 0x200;             // 0x866830's lokale kontrakt
const SCR_4CE450 = SCR + 0x300;             // 0x4ce450's lokale kontrakt

const F = Math.fround;
const today = (m: CmMem) => ({ day: m.s16(G.TODAY), year: m.u16(G.TODAY + 2) });
const clubById = (m: CmMem, id: number) => (m.u32(G.CLUBS) + 0x245 * id) >>> 0;

// ---------------------------------------------------------------- små hjælpere

/** 0x53b620: jobkoderne 11, 12, 13, 15 er spillere */
export const isPlayerJob_53b620 = (job: number) => { const j = job & 0xff; return j === 0xb || j === 0xc || j === 0xd || j === 0xf; };

/** 0x549e50: klubbens land er en af de seks store ([0x9cf2e4], [0x9cf300], [0x9cf314], [0x9cf360], [0x9cf488], [0x9cf338]) */
export function majorNation_549e50(m: CmMem, club: number): boolean {
  if (!club) return false;
  const n = m.u32(club + 0x53);
  if (!n) return false;
  const id = m.u32(n);
  return id === m.u32(0x9cf2e4) || id === m.u32(0x9cf300) || id === m.u32(0x9cf314) || id === m.u32(0x9cf360) || id === m.u32(0x9cf488) || id === m.u32(0x9cf338);
}

const yearLen = (y: number) => {
  y &= 0xffff;
  if (y % 2 === 1) return 365;
  if (y % 4 !== 0) return 365;
  if (y % 100 !== 0) return 366;
  return y % 400 !== 0 ? 365 : 366;
};
/** 0x54cdb0 Date::days_since(this = datoen på adressen a, anden dato): dage fra den anden dato til denne (fortegn) – med originalens skævhed
 *  i skudårstesten, når den anden dato ligger senere (år y − 1 for y = dette år … det andet år − 1) */
export function daysSince_54cdb0(m: CmMem, a: number, oDay: number, oYear: number): number {
  const ay = m.u16(a + 2), by = oYear & 0xffff;
  let edi = 0;
  if (by > ay) { for (let si = ay; si < by; si++) edi -= yearLen(si - 1); }
  else if (by < ay) { for (let si = ay; si > by;) { si--; edi += yearLen(si); } }
  return (edi + m.s16(a) - s16(oDay)) | 0;
}
const daysToToday = (m: CmMem, a: number) => { const t = today(m); return daysSince_54cdb0(m, a, t.day, t.year); };

/** 0x549ef0 Date::Date(dag i året, år) på adressen a (+4 skudår) */
export function makeDate_549ef0(m: CmMem, a: number, day: number, year: number): void {
  m.w16(a, day); m.w16(a + 2, year);
  const y = year & 0xffff;
  m.w32(a + 4, y % 2 !== 1 && y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 1 : 0);
}
/** 0x456740 this (dato på a) ligger efter den anden */
export const dateAfter_456740 = (m: CmMem, a: number, oDay: number, oYear: number) => {
  const ty = m.u16(a + 2), oy = oYear & 0xffff;
  if (oy < ty) return true;
  if (oy > ty) return false;
  return s16(oDay) < m.s16(a);
};
/** 0x4a7f20 samme dato */
export const dateEq_4a7f20 = (m: CmMem, a: number, oDay: number, oYear: number) => m.u16(a + 2) === (oYear & 0xffff) && m.s16(a) === s16(oDay);
const copy8 = (m: CmMem, dst: number, src: number) => { m.w32(dst, m.u32(src)); m.w32(dst + 4, m.u32(src + 4)); };

/** «getContract → klubben» (0x4cf5a0 + type ≠ 5 → [0xae23b4] + 0x245·+4), som 0x85fc50 gør det mange gange; skriver [0xae1080] */
function contractClub(m: CmMem, staff: number): number {
  const k = getContract(m, staff);
  m.w32(G.LAST_CONTRACT, k);
  if (!k || (m.u8(k + 0x35) & 0x3f) === 5) return 0;
  return clubById(m, m.s32(k + 4));
}

/** 0x4cf5f0 CONTRACT_MANAGER::get_contract_for_club(staff, club): egen kontrakt eller lejekontrakten med klubben eller dens B-hold/moderklub */
export function contractForClub_4cf5f0(c: CmCtx, staff: number, club: number): number {
  const m = c.m;
  if (!staff || !club) return 0;
  const id = m.s32(staff);
  if (id >= m.s32(G.STAFF_COUNT)) return 0;
  const row = (m.u32(G.ROWS) + 79 * id) >>> 0;
  const ix = m.s32(row);
  if (ix < 0) return 0;
  const base = m.u32(m.u32(G.CM));
  const own = (base + 80 * ix) >>> 0;
  if (!own) return 0;
  const cid = m.s32(club);
  if (m.s32(own + 4) === cid) return own;
  const lix = m.s32(row + 4);
  let loan = 0;
  if (lix >= 0) {
    loan = (base + 80 * lix) >>> 0;
    if (loan && m.s32(loan + 4) === cid) return loan;
  }
  let cl = club;
  const p = c.call(0x540a50, club, SCR_540A50, 1);
  if (p && m.u32(SCR_540A50) === 0) cl = p;
  const cid2 = m.s32(cl);
  if (m.s32(own + 4) === cid2) return own;
  if (lix >= 0 && loan && m.s32(loan + 4) === cid2) return loan;
  return 0;
}

/** 0x4ca470 contract_manager_get_deserved_squad_status(staff, kontrakt): den status, spilleren mener han fortjener (1..8) */
export function deservedStatus_4ca470(m: CmMem, staff: number, k: number): number {
  if (!staff) return 7;
  const pr = m.u32(staff + 0x61);
  if (!pr) return 7;
  if (!k) return 4;
  if ((m.u8(k + 0x35) & 0x3f) === 5) return 8;
  const st = m.u8(k + 0x4f) >> 4;
  const age = m.s8(staff + 0x18);
  const cl = m.s8(k + 0x3d);
  const r3 = () => (cl <= 0 ? 4 : 3);                                        // 0x4ca535
  const neg = (lim: number) => (cl <= lim ? 7 : 4);                          // 0x4ca5d0 / 0x4ca62a
  switch (st) {
    case 0: {                                                                // 0x4ca652
      if (age > 0x15) {
        if (cl > 0x4b) return 1;
        if (cl >= 0x28) return 2;
        if (cl >= 0xa) return 3;
        return neg(-30);
      }
      if (cl > 0) return 5;
      if (cl > -30 || m.s8(staff + 0x57) > 5) return 6;
      return 7;
    }
    case 1: return cl > 0x2d ? 1 : cl <= 0x19 ? 3 : 2;                       // 0x4ca4c7
    case 2:                                                                  // 0x4ca4e6
      if (cl > 0x4b && 25 * m.s8(staff + 0x57) - 10 * m.s8(staff + 0x59) + m.s16(pr + 0xd) > 0x186a && age > 0x17 && age < 0x22) return 1;
      return cl > 0x19 ? 2 : r3();
    case 3:                                                                  // 0x4ca543
      if (cl > 0x37 && age > 0x17 && age < 0x22) return 2;
      return r3();
    case 4:                                                                  // 0x4ca560
      if (cl > 0x41 && age > 0x17) return age < 0x22 ? 3 : 2;
      if (cl > -30) return 4;
      return age >= 0x18 ? 7 : 5;
    case 5:                                                                  // 0x4ca59f
      if (age > 0x18) {
        if (age > 0x22) return 4;
        if (cl > 0x4b) return 2;
        if (cl > 0) return 3;
        return neg(-30);
      }
      if (m.s8(staff + 0x57) > 5 && m.s16(pr + 0xb) > 0x4e2) return 5;
      return 6;
    case 6:                                                                  // 0x4ca5fb
      if (age > 0x17) {
        if (cl > 0x4b) return 1;
        if (cl > 0x1e) return 2;
        if (cl > 0) return 3;
        return neg(-50);
      }
      if (m.s16(pr + 0xb) > 0x4e2 && m.s8(staff + 0x57) > 0xf) return 5;
      return 6;
    default: return 7;
  }
}

/** 0x85e410 STAFF_CONTRACT::STAFF_CONTRACT (this): to datoer (0x54a110: dag 40, 1972, skudår), klub −1 og nuller */
export function constructContract_85e410(m: CmMem, k: number): void {
  for (const a of [k + 0x25, k + 0x2d]) { m.w16(a, 40); m.w16(a + 2, 1972); m.w32(a + 4, 1); }
  m.w32(k + 4, -1); m.w32(k + 0x4a, -1); m.w8(k + 0x49, 0); m.w16(k + 0x3b, 0); m.w8(k + 0x4e, 0);
  m.w32(k + 0x40, 0); m.w32(k + 0x45, 0); m.w32(k + 8, 0);
}

/** 0x85f7a0 add_release_clause(type): mindstepris (1) erstatter alle andre; en anden klausul fjerner mindsteprisen */
export function addReleaseClause_85f7a0(m: CmMem, k: number, type: number): void {
  const t = s8(type);
  if ((type & 0xff) === 1) { m.w32(k + 0x1c, 0); m.w8(k + 0x20, 0); m.w8(k + 0x1c + t, 1); return; }
  m.w8(k + 0x1d, 0); m.w8(k + 0x1c + t, 1);
}
/** 0x85f7d0 set_bonus(type, beløb) */
export const setBonus_85f7d0 = (m: CmMem, k: number, type: number, v: number) => m.w32(k + 0x10 + 4 * s8(type), v);
/** 0x85f7e0 remove_release_clause(type) */
export const removeReleaseClause_85f7e0 = (m: CmMem, k: number, type: number) => m.w8(k + 0x1c + s8(type), 0);
/** 0x85f7f0 remove_bonus(type) */
export const removeBonus_85f7f0 = (m: CmMem, k: number, type: number) => m.w32(k + 0x10 + 4 * s8(type), -1);
/** 0x85f800 clear_bonuses_and_clauses */
export function clearBonusesAndClauses_85f800(m: CmMem, k: number): void {
  m.w8(k + 0x49, 0); m.w32(k + 0x4a, -1);
  for (let i = 0; i < 5; i++) m.w8(k + 0x1c + i, 0);
  m.w32(k + 0x10, -1); m.w32(k + 0x14, -1); m.w32(k + 0x18, -1);
}
/** 0x867b50 has_active_release_clause: mindstepris (+0x1c = 2 – sic: tallet 2), +0x1d = 1 eller +0x1f = 2 */
export const hasActiveReleaseClause_867b50 = (m: CmMem, k: number) => m.u8(k + 0x1c) === 2 || m.u8(k + 0x1d) === 1 || m.u8(k + 0x1f) === 2;

/** 0x867d30 get_expiry_band: 0..14 for hvor snart kontrakten udløber, mod CONTRACT_MANAGER's datoer (0x4c7ac0 sætter dem dagligt: [0xae1048]
 *  +7, [0xae1030] +30, [0xae1058] +60, [0xae1010] +91, [0xae1060] +121, [0xae1040] +152, [0xae1090] +182, [0xae1068] +365 dage …) */
export function expiryBand_867d30(m: CmMem, k: number): number {
  const t = m.u8(k + 0x35) & 0x3f;
  if (t === 1) return 0xe;
  const e = k + 0x2d;
  const D = (a: number) => [m.s16(a), m.u16(a + 2)] as const;
  const after = (a: number) => dateAfter_456740(m, e, ...D(a));
  const eq = (a: number) => dateEq_4a7f20(m, e, ...D(a));
  const td = today(m);
  if (!dateAfter_456740(m, e, td.day, td.year)) return 0xe;
  if (t !== 2) return 0;
  if (after(0xae1090)) return 0;
  if (after(0xae1010)) {
    if (after(0xae1060)) {
      if (after(0xae1040)) return eq(0xae1090) ? 1 : 2;
      return eq(0xae1040) ? 3 : 4;
    }
    return eq(0xae1060) ? 5 : 6;
  }
  if (after(0xae1030)) {
    if (after(0xae1058)) return eq(0xae1010) ? 7 : 8;
    return eq(0xae1058) ? 9 : 10;
  }
  if (eq(0xae1030)) return 0xb;
  return eq(0xae1048) ? 0xd : 0xc;
}

/** 0x85e590 init_from_current_contract(this, staff, club, slutdato*, procent (s8), klausul1, klausul2): lån/skifte af den nuværende kontrakt
 *  (lønnen = procent af den gamle). thiscall, ret 0x18. Uden kontrakt: fejlboks (ikke porteret) og intet skrives. */
export function initFromCurrentContract_85e590(c: CmCtx, k: number, staff: number, club: number, endDate: number, pct: number, cl1: number, cl2: number): void {
  const m = c.m;
  const cur = getContract(m, staff);
  if (!cur) return;
  m.w32(k, m.u32(staff));
  m.w32(k + 8, 0);
  m.w32(k + 4, m.u32(club));
  m.w32(k + 0xc, tdiv(Math.imul(m.s32(cur + 0xc), s8(pct)), 100));
  copy8(m, k + 0x25, G.TODAY);
  copy8(m, k + 0x2d, endDate);
  m.w8(k + 0x35, (m.u8(k + 0x35) & 0xc6) | 6);
  m.w32(k + 0x36, m.u32(k + 0xc));
  m.w8(k + 0x3a, 0); m.w8(k + 0x49, 0); m.w32(k + 0x4a, -1); m.w8(k + 0x44, 0); m.w8(k + 0x4e, 0); m.w32(k + 0x45, 0);
  const id = m.s32(staff);
  c.call(0x549c90, (m.u32(G.STAFF) + 0x6e * id) >>> 0);
  m.w32(k + 0x40, 0); m.w8(k + 0x4e, 4); m.w8(k + 0x3f, 0); m.w8(k + 0x3e, 0);
  if (club && m.u32(club + 0x53)) {
    const lang = m.u8(m.u32(club + 0x53) + 0x77);
    const r = s8(c.call(0x7c6830, staff, club, lang, 0));
    const v = r > 0xa ? 0xa : r;
    const b = m.u8(k + 0x4f);
    m.w8(k + 0x4f, ((b ^ v) & 0xf) ^ b);
  }
  m.w16(k + 0x3b, 0);
  for (let i = 0; i < 5; i++) m.w8(k + 0x1c + i, 0);
  m.w32(k + 0x10, -1); m.w32(k + 0x14, -1); m.w32(k + 0x18, -1);
  m.w32(k + 0x21, 0);
  m.w8(k + 0x1c, cl1); m.w8(k + 0x1d, cl2);
}

// ---------------------------------------------------------------- 0x85fc50

export function setToDesiredContract_85fc50(c: CmCtx, self: number, staff: number, clubArg: number, a2: number, statusArg: number, jobArg: number, a5: number, outF: number): number {
  const r = desired85fc50(c, self, staff, clubArg, a2, statusArg, jobArg, a5, outF);
  c.probe?.(0x85fc50, r);
  return r;
}
function desired85fc50(c: CmCtx, self: number, staff: number, clubArg: number, a2: number, statusArg: number, jobArg: number, a5: number, outF: number): number {
  const m = c.m;
  let A1 = clubArg >>> 0;                  // [esp+0x27c] – kan blive B-holdets moderklub
  let A3 = statusArg & 0xff;               // [esp+0x284] (byte)
  const A4 = jobArg & 0xff;                // [esp+0x288]
  const A3s = () => s8(A3);
  let L2c = 0, L3c = 0, L54 = 0, L3b = 0;
  let edi = A1;
  // 0x85fc8e–0x85fd30: kontrakten og klubben, den hører til
  {
    const k = getContract(m, staff);
    m.w32(G.LAST_CONTRACT, k);
    let ebx = 0;
    if (k && (m.u8(k + 0x35) & 0x3f) !== 5) ebx = clubById(m, m.s32(k + 4));
    L3c = ebx;
    if (clubArg === 0) {
      edi = ebx; A1 = edi;
      if (ebx) {
        const p = c.call(0x540a50, ebx, SCR_540A50, 1);
        if (p && m.u32(SCR_540A50) === 0) { edi = p >>> 0; A1 = edi; }
      }
    }
    if (ebx) L2c = contractForClub_4cf5f0(c, staff, ebx);
  }
  // 0x85fd34
  {
    let dl = m.u8(self + 0x35);
    m.w8(self + 0x49, 0);
    dl &= 0x40;
    m.w32(self + 0x4a, -1);
    dl |= 2;
    m.w16(self + 0x3b, 0);
    m.w8(self + 0x35, dl);
    m.w32(self, m.u32(staff));
    m.w8(self + 0x3a, 0);
  }
  const L34 = F(m.s32(staff) / m.s32(G.STAFF_COUNT));
  const L16 = m.s8(staff + 0x18);            // alderen
  const L28 = m.u32(staff + 0x61);           // spillerposten
  let cl = A3;
  if (A3 === 0xff && L28) {
    if (L2c) {
      cl = deservedStatus_4ca470(m, staff, L2c) & 0xff;
      const eax = m.u32(L2c + 0x45);
      A3 = cl;
      if ((eax & 0x10) && cl !== 1) { cl = 2; A3 = 2; }
      L54 = eax;
    } else {
      cl = c.call(0x849f00, staff, edi, 0) & 0xff;
      A3 = cl;
    }
  } else if (L2c) {
    L54 = m.u32(L2c + 0x45);
  }
  m.w8(self + 0x4f, (m.u8(self + 0x4f) & 0xf) | ((cl << 4) & 0xf0));
  // 0x85fe43: L17 (klubbens/hans niveau 1..)
  let bl: number;
  if (edi) {
    bl = (tdiv(m.s16(edi + 0x80), 500) + 1) & 0xff;
    if (m.u8(edi + 0x64) === 2) {
      bl = (bl - 1) & 0xff;
      if (s8(bl) < 1) bl = 1;
      else if (s8(bl) > 4) bl = 4;
    }
    m.w32(self + 4, m.u32(edi));
  } else if (!m.u32(staff + 0x69) && L28) {
    bl = tdiv(m.s16(L28 + 0xd), 500) & 0xff;
    m.w32(self + 4, -1);
  } else {
    const c24 = m.u32(staff + 0x24);
    bl = (tdiv(m.s16(c24 + 0x80), 500) + 1) & 0xff;
    if (s8(bl) < 3) bl = 3;
    m.w32(self + 4, -1);
  }
  // 0x85fec9: landskampe
  {
    const caps = m.u8(staff + 0x22);
    if (caps) {
      const nat = m.u32(staff + 0x1a);
      let al: number;
      if (nat) {
        al = ftol(m.s8(nat + 0x85) * F(0.25) * (caps * F(0.125))) & 0xff;
        if (s8(al) > 4) al = 4;
        else if (al === 0) al = 1;
      } else al = 1;
      bl = (bl + al) & 0xff;
    }
  }
  let L17 = s8(bl);
  // 0x85ff46: L48 omdømmet
  let L48 = 0;
  if (L28 && isPlayerJob_53b620(A4)) L48 = m.s16(L28 + 0xb);
  else if (m.u32(staff + 0x69)) L48 = m.s16(m.u32(staff + 0x69) + 0xa);
  if (s16(L48) === 0) L48 = 1;
  // 0x85ff91: underskriftsbeløbet +8
  let ebx: number;
  if (L28 && isPlayerJob_53b620(A4)) {
    ebx = A1;
    const v = c.call(0x4d0c60, staff, ebx, 1, -1, 0) | 0;
    const L20 = tdiv(Math.imul(v, 2), 10);
    m.w32(self + 8, L20);
    if (m.u32(staff + 0x39) === 0 && m.s16(L28 + 0xb) < 0xabe && m.s16(ebx + 0x80) < 0x7d0) m.w32(self + 8, ftol(L20 * 0.25));
    else {
      const ax = m.s16(L28 + 0xb);
      if (ax < 0x109a) m.w32(self + 8, ftol(L20 * 0.5));
      else if (ax < 0x128e) m.w32(self + 8, ftol(L20 * 0.75));
    }
    const d8 = () => m.s32(self + 8);
    if (ebx === L3c) {
      const wb = m.s16(L28 + 0xb);
      if (L16 < 0x13 && wb < 0xea6) m.w32(self + 8, 0);
      else if (L16 < 0x15 && wb < 0x109a) {
        const p = m.s8(staff + 0x5a);
        if (wb < 0xabe) m.w32(self + 8, p >= 0xf ? ftol(d8() * 0.5) : ftol(d8() * 0.1));
        else m.w32(self + 8, p >= 0xf ? ftol(d8() * 0.5) : ftol(d8() * 0.25));
      } else if (ebx && wb < 0xdac && m.s16(ebx + 0x80) < 0xdac) m.w32(self + 8, ftol(d8() * 0.5));
      // 0x8600cf
      const s = s8(deservedStatus_4ca470(m, staff, L2c));
      switch (s) {
        case 1: m.w32(self + 8, ftol(d8() * 0.9)); break;
        case 2: case 3: m.w32(self + 8, ftol(d8() * 0.75)); break;
        case 4: m.w32(self + 8, ftol(d8() * 0.5)); break;
        default: m.w32(self + 8, ftol(d8() * 0.25)); break;
      }
    } else if (L3c) {
      if (m.s16(L3c + 0x80) < 0x109a) m.w32(self + 8, ftol(d8() * 0.5));
      const nat = m.u32(L3c + 0x53);
      if (nat && m.s8(nat + 0x85) < 0xa) m.w32(self + 8, ftol(d8() * 0.5));
    }
  } else {
    ebx = A1;
    m.w32(self + 8, 0);
  }
  // 0x86017e: jobbet
  if (m.u8(staff + 0x3d) === 0) m.w8(staff + 0x3d, L28 ? 0xb : 9);       // 0x860192: sprintf til fejlloggen udeladt

  let L24 = 0;                // den ønskede løn (float)
  let L10 = 0;                // lønnen (float, efter 0x8609ce)
  const want = (flag: number, st: number, job: number, x: number) => F(defaultStaffContract_864550(c, staff, ebx, flag, st, job, x));
  const finAt = (club: number) => c.call(0x5a0590, club) >>> 0;
  let ebpClub = A1;           // ebp i spillergrenen fra 0x860b56 (A1)
  let ediK = L2c;             // edi = kontrakten med klubben fra 0x860b56
  let flags = L54;            // ebx fra 0x860a31 / 0x860b52

  if (L28 && isPlayerJob_53b620(A4)) {
    // ================================================================ spilleren (0x8601ce)
    if (L3c && L3c === ebx) {
      // fornyelse hos sin egen klub
      const end = L2c + 0x2d;
      const days = daysToToday(m, end);
      const rowB = m.u8(m.u32(G.ROWS) + 79 * m.s32(staff) + 0xb) & 0xf;
      let done = false;
      if (L54 === 0 && rowB === 0 && m.s16(L28 + 0xb) < 0x1c52 && days < 12 * m.s8(staff + 0x59) + 0xb6 && m.u8(L2c + 0x49) === 0) {
        L24 = want(1, A3, 0xb, 0); done = true;                              // 0x86041f
      }
      if (!done && m.s8(staff + 0x5a) < 6 && m.s8(staff + 0x18) < 0x18) {
        const club = A1;
        if (c.call(0x8cca10, staff, 0) === 0 && c.call(0x544520, staff, club) === 0) {
          const ax = m.s16(m.u32(staff + 0x61) + 0xb);
          if (ax < 0xcb2 && ax < s16(u16(m.u16(club + 0x80) + 0xfa)) && daysToToday(m, end) < 200 - m.s8(staff + 0x5a)) {
            L24 = F(defaultStaffContract_864550(c, staff, club, 1, A3, 0xb, 0)); done = true;   // 0x8602db
          }
        }
      }
      if (!done) {
        // 0x86037d (ecx = L54)
        const id = m.s32(staff);
        if (L54 !== 0 && (L54 & 0x161a8) === 0 && days < (id % 0x23) + 0x14 && rowB === 0
          && m.s16(L28 + 0xb) + 20 * m.s8(staff + 0x57) < 25 * (m.s8(staff + 0x59) + 0xaa)) {
          L24 = F(defaultStaffContract_864550(c, staff, A1, 1, A3, 0xb, 0)); done = true;
        }
      }
      if (!done) {
        // 0x8603f0
        let to413 = m.s8(staff + 0x59) > 0x12;
        if (!to413) to413 = !(m.s16(L28 + 0xb) >= 0x1482) && rowB === 0;
        if (to413 && m.s16(L28 + 0xd) < 0xdac) L24 = F(defaultStaffContract_864550(c, staff, A1, 1, A3, 0xb, 0));
        else L24 = F(defaultStaffContract_864550(c, staff, A1, 0, A3, 0xb, 0));
      }
    } else {
      // 0x86045f: en anden klub
      const b57 = m.s8(staff + 0x57), b59 = m.s8(staff + 0x59);
      if (Math.imul(100 - b57 - b59, 125000) < 0) {
        A3 = 1;
        const x = m.s8(staff + 0x5a) <= 5 && m.s16(m.u32(staff + 0x61) + 0xd) <= 0x186a ? 2 : 1;
        L24 = F(defaultStaffContract_864550(c, staff, ebx, 0, 1, 0xb, x));
        L3b = 1;
      } else if (Math.imul(80 - b57 - b59, 125000) < 0) {
        if (A3 !== 1) A3 = 2;
        L24 = F(defaultStaffContract_864550(c, staff, ebx, 0, A3, 0xb, 2));
      } else if (m.s16(L28 + 0xb) > 0x1a5e) {
        L24 = F(defaultStaffContract_864550(c, staff, ebx, 0, A3, 0xb, 3));
      } else {
        L24 = F(defaultStaffContract_864550(c, staff, ebx, 0, A3, 0xb, 0));
      }
    }
    // 0x86052c: en lønstigning over den nuværende kontrakt begrænses
    if (L2c) {
      const wage = m.s32(L2c + 0xc);
      if (wage < L24) {
        let e = Math.imul(wage, 2) | 0; const e2 = (wage + 0x1f40) | 0;
        if (!(e > e2)) e = e2;
        let L10i = e;
        if (m.s16(L28 + 0xd) > 0x1a5e && L24 > F(10000) && L10i < L24) {
          const ecx = A1;
          let thr = 0xc350;
          if (ecx && m.u32(ecx + 0x53)) {
            const nid = m.u32(m.u32(ecx + 0x53));
            if (nid === m.u32(0x9cf2e4) || nid === m.u32(0x9cf488) || nid === m.u32(0x9cf360)) thr = 0x124f8;
          }
          let to669 = false, to684 = false;
          if (L3c === ecx) { if (e < thr) { L10i = thr; to684 = true; } else to669 = true; }
          else if (!ecx) to684 = true;
          else {
            const div = m.u32(ecx + 0x57);
            let ax: number;
            if (div) ax = ftol(Math.imul(m.s16(div + 0x69), m.s16(ecx + 0x80)) * 0.05);
            else if (m.u32(ecx + 0x53)) ax = ftol(Math.imul(m.s8(m.u32(ecx + 0x53) + 0x85), m.s16(ecx + 0x80)) * 0.05);
            else ax = m.u16(ecx + 0x80);
            if (s16(ax) > 0x1676) { if (e < thr) { L10i = thr; to684 = true; } else to669 = true; }
            else to684 = true;
          }
          if (to669 && !to684) L10i = ftol((L24 - thr) * 0.25 + thr);
        }
        if (L24 > L10i) L24 = F(L10i);                                       // 0x860684
      }
    }
    // 0x86069d: klubbens finanspost (+0x10 = højeste løn)
    const L18fin = finAt(A1);
    const L20fin = L18fin ? m.s32(L18fin + 0x10) : 0;
    const b57 = m.s8(staff + 0x57), b59 = m.s8(staff + 0x59), b5a = m.s8(staff + 0x5a);
    const wd = m.s16(L28 + 0xd);
    const R = s16(u16(m.u16(L28 + 0xd) + 25 * (b57 - b59) + 10 * b5a));
    ebx = A1;
    let to7ba = false;
    if (A3 === 1 && L16 > 0x12 && L2c && m.s8(L2c + 0x3d) > 0x32) to7ba = true;
    else {
      const c3f = wd > 0x109a && (R > m.s16(ebx + 0x80) || (R > 0x1a5e && m.u8(staff + 0x22) !== 0 && A3s() < 3 && A3 !== 0));
      if (c3f && A3 !== 7) to7ba = true;
      else if (L3c === ebx && L2c && m.s8(L2c + 0x3d) > 0x32 && s8(deservedStatus_4ca470(m, staff, L2c)) === 1 && b59 < 0xf && b57 > 0xa && b5a > 0xa
        && R > 0x1a5e && m.s16(L28 + 0xd) > 0x109a) to7ba = true;
    }
    if (to7ba) {
      // 0x8607ba: stjerner i de store lande vil have klubbens højeste løn
      let go = true;
      if (L2c) {
        if (daysToToday(m, L2c + 0x2d) > 10 * b5a + 0x20d) go = false;
        else if (m.s8(L2c + 0x3f) < 2 && m.s16(L28 + 0xd) < 0x1676) go = false;
      }
      if (go && majorNation_549e50(m, ebx) && L16 > 0x12 && L16 < 0x20) {
        let e = L20fin;
        let L10i = e;
        if (R > 0x1c52 && m.u32(staff + 0x61) && m.u8(L28 + 0xf) !== 0x14 && m.u8(staff + 0x59) !== 0x14) {
          const x = R * 0.0001;
          const nid = m.u32(m.u32(ebx + 0x53));
          let v: number | null = null;
          if (nid === m.u32(0x9cf2e4)) v = ftol(x * F(85000));
          else if (nid === m.u32(0x9cf488) || nid === m.u32(0x9cf360)) v = ftol(x * F(105000));
          if (v !== null && L20fin < v) { e = v; L10i = e; }
        }
        const pr = m.u32(staff + 0x61);
        if (pr && m.u8(pr + 0xf) === 0x14 && e > 0xea60) L10i = 0xea60;
        let x = (b57 - m.s8(staff + 0x5b) - b59 + 4) * 0.0075;
        if (x < -0.25) x = F(-0.25);
        else if (x > 0.15) x = F(0.15000000596046448);
        if (L16 > 0x1d) {
          if (R < 0x1482) x -= 0.1;
          else if (b5a < 0xf) x -= 0.05;
        } else if (R < 0x109a && b5a < 0xf) x -= 0.05;
        if (m.s16(L28 + 0xb) + 25 * b57 < s16(u16(m.u16(ebx + 0x80) - 0x4e2))) x -= 0.05;
        if (m.u8(L28 + 0xf) === 0x14) x += 0.45;
        else if (m.u8(L28 + 0x11) === 0x14) x += 0.7;
        else if (m.u8(L28 + 0x15) === 0x14 && R > 0x1c52 && b59 < 6) x += 1.0;
        else if (R > 0x1c52) x += 0.95;
        else x += 0.9;
        x *= L10i;
        if (L24 < x) L24 = F(x);
      }
    }
    // 0x8609ce: hvor gerne klubben vil have ham (0x846920)
    const r = c.call(0x846920, staff, ebx, 0, 0, A3, a5);
    if (outF) m.wf32(outF, r);
    L10 = F(3.5 / (r < 0.1 ? 0.1 : r));
    let to_b61 = false;
    if (L2c) {
      flags = L54;
      if (flags & 2) { if (L10 > 1.25) L10 = F(1.25); }
      else if (flags !== 0) {
        if (r < 1.75) {
          if (m.s8(staff + 0x5a) > 6 || m.s8(staff + 0x18) > 0x17) L24 = F(L24 + F(5000));
          else if (c.call(0x8cca10, staff, 0) !== 0) L24 = F(L24 + F(5000));
          else {
            const ebp = A1;
            const ax = m.s16(m.u32(staff + 0x61) + 0xb);
            if (c.call(0x544520, staff, ebp) !== 0 || ax > 0xcb1 || ax > s16(u16(m.u16(ebp + 0x80) + 0xfa))) L24 = F(L24 + F(5000));
            else if (daysToToday(m, L2c + 0x2d) > 200 - m.s8(staff + 0x5a)) L24 = F(L24 + F(5000));
          }
          to_b61 = true;
        }
      }
    } else {
      if (r < 1.75) L24 = F(L24 + F(5000));
      flags = L54;
    }
    void to_b61;
    ediK = L2c; ebpClub = A1;
    // 0x860b61: faktoren L10
    const id = m.s32(staff);
    if (L10 < 0.9) L10 = F(0.8999999761581421);
    else if (L3c !== ebpClub) { /* 0x860e2f */ }
    else if (!ediK) { if (L10 > 3.0) L10 = F(3.0); }
    else if (flags !== 0) {
      if ((flags & 2) || (L16 < 0x15 && m.s16(L28 + 0xb) < 0x109a && flags === 0x10)) { if (L10 > 1.2) L10 = F(1.2000000476837158); }
      else if (flags & 1) { if (L10 > 1.75) L10 = F(1.75); }
      else if (flags & 0x8400) { if (L10 > 1.5) L10 = F(1.5); }
      else if (L10 > 4.0) L10 = F(4.0);
    } else {
      // 0x860c48
      const loyHigh = () => s8(m.u8(staff + 0x59)) > s8(((id % 5) + 0xa) & 0xff);
      const c125 = () => { if (L10 > 1.25) L10 = F(1.25); };
      const c15 = () => { if (L10 > 1.5) L10 = F(1.5); };
      const c115 = () => { if (L10 > 1.15) L10 = F(1.149999976158142); };
      const c2 = () => { if (L10 > 2.0) L10 = F(2.0); };
      const c135 = () => { if (L10 > 1.35) L10 = F(1.350000023841858); };
      let lbl: 'cc8' | 'c76' = 'c76';
      if (loyHigh() && daysToToday(m, ediK + 0x2d) < 0x1e) lbl = 'cc8';
      if (lbl === 'cc8') c125();
      else {
        const al = L16;
        if (al < 0x13 || al > 0x22) {
          const s = s8(deservedStatus_4ca470(m, staff, ediK));             // 0x860d39, tabellen 0x8626b0
          switch (s) { case 1: c2(); break; case 2: c135(); break; case 3: case 4: case 5: c125(); break; default: c115(); }
        } else if (al < 0x15 || al > 0x1f) {
          const s = s8(deservedStatus_4ca470(m, staff, ediK));             // 0x860cea, tabellen 0x86269c
          switch (s) { case 1: c2(); break; case 2: c15(); break; case 3: case 4: case 5: c135(); break; default: c115(); }
        } else if (loyHigh() && !(daysToToday(m, ediK + 0x2d) >= 0x1e)) c125();
        else c2();
      }
      // 0x860da5
      if (L10 > 1.1 && L16 < 0x14 && m.s16(L28 + 5) < 0x7d - b5a - b57 && m.s16(L28 + 0xb) < 0x109a && daysToToday(m, ediK + 0x2d) < 0x78 - b5a - b57)
        L10 = F(1.100000023841858);
    }
    // 0x860e2f
    L10 = F(L10 * L24);
    L24 = L10;
    if (ediK && ediK !== self) {
      const wage = m.s32(ediK + 0xc);
      if (wage > L10) {
        const cx = m.s16(ebpClub + 0x80), ax = m.s16(L3c + 0x80);
        let q = 1.0;
        if (cx < ax) { q = cx / (ax > 0x64 ? ax : 0x64); if (!(q > 0.5)) q = 0.5; }
        const v = wage * q;
        if (v > L10) L10 = F(v);
      }
    }
    if ((flags & 0x1000000) && L20fin * 0.95 > L10) L10 = F(m.s32(L18fin + 0x10) * F(0.949999988079071));
    // 0x860f10: lofterne (S = 250000)
    const S = F(250000);
    let set = L10 > F(200000);
    if (!set) {
      if (L16 > 0x22 && L10 > F(35000)) set = true;
      else if (L16 > 0x1f && L10 > F(75000)) set = true;
      else if (m.u8(L28 + 0xf) === 0x14 && L10 > F(105000)) set = true;
    }
    if (set) L10 = S;
    // 0x860f76
    let lbl: 'f5' | 'done' | 'cap' = 'f5';
    if (A3 === 7) { if (L10 > F(5000)) { L10 = S; lbl = 'done'; } }
    else if (A3 === 6) { if (L10 > F(8250)) { L10 = S; lbl = 'done'; } }
    else if (A3 === 5) { if (L10 > F(17500)) { L10 = S; lbl = 'done'; } }
    else if (A3 === 4) { if (L10 > F(35000)) { L10 = S; lbl = 'done'; } }
    else if (A3 === 3) {
      if (L10 > F(57500) && m.s16(L28 + 0xd) < 0x1a5e) {
        const pr = m.u32(staff + 0x61);
        if (c.call(0x600a50, ebpClub, 0, 1, 0, 0) !== 0 || !pr || m.s16(pr + 0xb) <= 0x186a) lbl = 'cap';
        else {
          const wb = m.s16(pr + 0xb);
          if (m.u8(pr + 0x15) === 0x14 || m.u8(pr + 0x14) === 0x14) lbl = (wb > 0x1c52 ? L10 > F(125000) : L10 > F(105000)) ? 'cap' : 'done';
          else lbl = (wb > 0x1c52 ? L10 > F(105000) : L10 > F(85000)) ? 'cap' : 'done';
        }
      }
    } else if (A3 === 2) {
      if (L10 > F(125000) && m.s16(L28 + 0xd) < 0x1c52) { L10 = S; lbl = 'done'; }
    }
    if (lbl === 'cap') L10 = F(250000);
    else if (lbl === 'f5') {
      // 0x8610f5
      if (L10 > S) L10 = S;
      else if (ediK) {
        const wage = m.s32(ediK + 0xc);
        if (wage > L24 && wage !== 0 && L3c !== ebpClub) {
          let f = (m.u32(ediK + 0x45) & 0x100) ? 10.0 : 0.0;
          if (c.call(0x544520, staff, L3c) !== 0) f += 10.0;
          if (wage > 0x9c40) f += ((wage - 0x9c40) | 0) * 0.00025;
          if (L16 > 0x21) f += 2 * (0x26 - L16);
          const b3d = m.s8(ediK + 0x3d);
          if (b3d < 0) f -= b3d * 0.2;
          if (m.u32(ediK + 0x45) !== 0) f -= m.s8(ediK + 0x44) * 0.2;
          if (0.0 > f) f = 0;
          else if (20.0 < f) f = 20.0;
          const L40 = L24 * 0.5;
          const mw = () => c.call(0x5968d0, finAt(ebpClub), staff, A3) | 0;
          let X: number;
          const m1 = mw();
          X = m1 < L40 ? L40 : mw();
          let Y: number;
          if (L24 < X) Y = L24;
          else { const m3 = mw(); Y = m3 < L40 ? L40 : mw(); }
          L10 = F(((20.0 - f) * wage + Y * f) * 0.05);
        }
      }
    }
  } else {
    // ================================================================ ikke spiller (0x8602f8)
    L24 = F(defaultStaffContract_864550(c, staff, ebx, 0, A3, A4, 0));
    const r = F(c.call(0x844780, staff, ebx, 0, A4, a5));
    if (outF) m.wf32(outF, r);
    let q = 3.5 / (r < 0.1 ? 0.1 : r);
    if (r < 1.75) L24 = F(L24 + F(2500));
    if (q < 0.9) q = F(0.8999999761581421);
    L10 = F(q * L24);
    const rep = m.s16(ebx + 0x80);
    let cap = false, chk = true;
    if (A4 === 6) { if (rep * 2 + 0x4b0 < L10) { if (L10 > F(4100)) cap = true; } }
    else if (A4 === 8) { if (rep + 0x1f4 < L10) { if (L10 > F(3200)) cap = true; } }
    else if (A4 === 9) { if (rep * 0.75 + 250 < L10) { if (L10 > F(2100)) cap = true; } }
    else if (A4 === 0xa) { if (rep * 0.75 + 250 < L10) { if (L10 > F(1500)) cap = true; } }
    if (cap) { L10 = F(250000); chk = false; }
    if (chk && L10 > F(250000)) L10 = F(250000);
  }

  // ================================================================ 0x86149a: klausuler og bonusser
  let L24p: number;            // [esp+0x24] = this + 0x1c (klausulbytes)
  const ebp = self;
  if (m.u8(staff + 0x3d) === 0xb && m.u32(staff + 0x61)) {
    const age = m.s8(staff + 0x18);
    const di = s16(L48);
    const id = m.s32(staff);
    if ((age > 0x20 && di > 0xcb2 && id % 3 === 0 && m.s8(staff + 0x5b) + m.s8(staff + 0x58) + m.s8(staff + 0x57) + (id % 10) + age - 0x1c > 0x2d)
      || m.u32(staff + 0x69)) { m.w8(ebp + 0x1d, 0); m.w8(ebp + 0x20, 1); }
    m.w32(ebp + 0x21, 0);
    const cobjOf = (club: number) => {
      if (!club) return 0;
      const div = m.u32(club + 0x57);
      if (!div) return 0;
      return m.u32(m.u32(0xadadfc) + 4 * m.u32(div));
    };
    const bigClause = (eIn: number, flg: number) => {               // 0x861a21… (max(L20·0,95 + 150000, 2e), over 2,5 mio. ·0,21)
      if (flg !== 0) return eIn;
      let t = eIn * 0.95 + 150000.0;
      const d = Math.imul(eIn, 2);
      if (!(t > d)) t = d;
      let v = ftol(t);
      if (v > 0x2625a0) v = ftol(v * 0.21 - 2500000.0 + 2500000.0);
      return (eIn + v) | 0;
    };
    // mindstepris (+0x1c)
    let e = 0;
    let to705 = false;
    if (di > 0xabe) {
      const val = tdiv(di, 50) + L34 * F(20) - 2 * m.s8(staff + 0x59) + 2 * m.s8(staff + 0x57);
      if (13 * L17 < val && A1) {
        const co = cobjOf(A1);
        if (co && m.u8(co + 0x43) === 2 && vcall(c, co, 0x98) !== 0) {
          const v = c.call(0x4d0c60, staff, A1, 1, -1, 0) | 0;
          e = (v + ftol(v * L34 * F(0.25))) | 0;
          if (L2c && !(m.u8(L2c + 0x45) & 1)) {
            let t = e * 0.95 + 150000.0;
            const d = Math.imul(e, 2);
            if (!(t > d)) t = d;
            let v2 = ftol(t);
            if (v2 > 0x2625a0) v2 = ftol(v2 * 0.21 - 2500000.0 + 2500000.0);
            e = (e + v2) | 0;
          }
          if (e < 0x249f0) e = 0x249f0;
          m.w8(ebp + 0x1d, 0); m.w8(ebp + 0x1c, 1); m.w32(ebp + 0x21, e);
          to705 = true;
        }
      }
    }
    if (!to705) {
      if (L2c && m.u8(L2c + 0x1c) !== 0 && contractClub(m, staff) === A1) L10 = F(L10 * 1.05);
      m.w8(ebp + 0x1c, 0);
    }
    L24p = ebp + 0x1c;
    ebx = A1;
    // 0x861705: nedrykningsklausul (+0x1f)
    let to8a7 = false;
    if (di > 0x8ca) {
      const val = (tdiv(di, 50) + 3 * (m.s8(staff + 0x57) - m.s8(staff + 0x59))) + L34 * F(20) - L16;
      if (10 * L17 < val && ebx) {
        const co = cobjOf(ebx);
        if (co && m.u8(co + 0x43) === 2 && vcall(c, co, 0x9c) !== 0) {
          const v = c.call(0x4d0c60, staff, ebx, 1, -1, 0) | 0;
          let ed = (v + ftol(v * L34 * F(-0.5))) | 0;
          if (ed < 0xc350) ed = 0xc350;
          const al = m.s8(staff + 0x59), cl2 = m.s8(staff + 0x57);
          if (al < 5) { if (cl2 > 0xa) ed = ftol(ed * 0.5); else if (al < 0xf) ed = ftol(ed * 0.85); }
          else if (cl2 > 0xa) ed = ftol(ed * 0.75);
          else if (al < 0xf) ed = ftol(ed * 0.85);
          m.w8(ebp + 0x1d, 0); m.w8(ebp + 0x1f, 1); m.w32(ebp + 0x21, ed);
          to8a7 = true;
        }
      }
    }
    if (!to8a7) {
      if (L2c && m.u8(L2c + 0x1f) !== 0 && contractClub(m, staff) === ebx) L10 = F(L10 * 1.05);
      m.w8(ebp + 0x1f, 0);
    }
    // 0x8618a7: frikøbsklausul (+0x1d)
    const flg = L54;
    let toBd7 = false;
    const setBuyout = (ed: number) => {
      if (ed < 0x249f0) ed = 0x249f0;
      m.w32(L24p, 0); m.w8(L24p + 4, 0);
      m.w8(ebp + 0x1d, 1); m.w8(L24p, 0); m.w8(ebp + 0x1f, 0); m.w32(ebp + 0x21, ed);
      toBd7 = true;
    };
    if (ebx === L3c && (flg & 1)) {
      const v = c.call(0x4d0c60, staff, A1, 1, -1, 0) | 0;
      setBuyout((v + ftol(v * L34 * F(0.25))) | 0);
    } else {
      let to85 = true;
      if (di > 0x4e2) {
        const cc = contractClub(m, staff);
        to85 = !!cc && L17 >= 0x12;
        if (!to85) {
          const v1 = (4 * m.s8(staff + 0x57) - 3 * m.s8(staff + 0x59) + tdiv(di, 50) - L16) | 0;
          if (10 * L17 < v1 + L34 * F(10)) {
            const v = c.call(0x4d0c60, staff, A1, 1, -1, 0) | 0;
            setBuyout(bigClause((v + ftol(v * L34 * F(0.5))) | 0, flg));
          } else to85 = true;
        }
      }
      if (!toBd7 && to85) {
        // 0x861a85
        if (L16 < 0x18) {
          const h = s16(ftol((m.s16(L28 + 7) + m.s16(L28 + 5)) * 0.5));
          const v1 = h - s16(3 * m.s8(staff + 0x59)) + s16(2 * m.s8(staff + 0x57));
          if (v1 > 15 * L17) {
            const v = c.call(0x4d0c60, staff, A1, 1, -1, 0) | 0;
            setBuyout(bigClause((v + ftol(v * L34 * F(0.5))) | 0, flg));
          }
        }
        if (!toBd7) {
          if (L2c && m.u8(L2c + 0x1d) !== 0 && contractClub(m, staff) === A1) L10 = F(L10 * 1.15);
          m.w8(ebp + 0x1d, 0);
        }
      }
    }
    // 0x861bd7: +0x1e
    if (s16(L48) > 0x1964) {
      const v1 = (tdiv(s16(L48), 50) - 4 * m.s8(staff + 0x59)) | 0;
      if (14 * L17 < v1 - L34 * F(20)) {
        const v = c.call(0x4d0c60, staff, A1, 1, -1, 0) | 0;
        let ed = bigClause((v + ftol(v * L34 * F(0.5))) | 0, flg);
        if (ed < 0x16e360) ed = 0x16e360;
        m.w8(ebp + 0x1d, 0); m.w8(ebp + 0x1e, 1); m.w32(ebp + 0x21, ed);
      } else m.w8(ebp + 0x1e, 0);
    } else m.w8(ebp + 0x1e, 0);
  } else {
    // 0x861cff
    L24p = ebp + 0x1c;
    for (let i = 0; i < 5; i++) m.w8(ebp + 0x1c + i, 0);
  }

  // ================================================================ 0x861d1f: datoerne og længden
  if (A1) {
    if (L28 && L3c !== A1) {
      if (a2 !== -1) {
        const slot = c.call(0x8c61e0, a2) >>> 0;
        if (slot) c.call(0x8cf0e0, m.u32(slot), ebp + 0x25);
        // slot = 0: fejlboks (0x861d6d – læser [0]) ikke porteret
      } else c.call(0x8cf470, A1, ebp + 0x25);
    }
    copy8(m, ebp + 0x25, G.TODAY);
    const month = c.call(0x4d45f0, A1);
    const dom = c.rand(0x1c) + 1;
    const L20day = u16(m.s16(0x9b8448 + 2 * s8(month)) + dom);             // 0x549f70(dag, måned, 1998) – ikke skudår
    const row = s8(c.call(0x669360, A1));
    const t = today(m);
    let yr = m.u32(0xb63d77 + 72 * row) ? (t.year + 1) & 0xffff : t.year;
    // længden i år
    let st: number;
    const age = L16;
    const pr = m.u32(staff + 0x61);
    if (age < 0x13) st = F(3.0);
    else if (age < 0x1d) st = F(4.0);
    else if (age < 0x22) st = pr && m.u8(pr + 0xf) > 0xf ? F(3.0) : pr && m.u8(pr + 0x11) > 0xf ? F(2.0) : F(1.5);
    else st = m.u32(staff + 0x69) && !pr && m.u8(staff + 0x3d) !== 0xb ? F(4.0) : F(1.0);
    if (m.s8(ebp + 0x1f) > 0 || s8(m.u8(L24p)) > 0) st *= 0.75;
    const bl2 = L17;
    if (m.s8(ebp + 0x1d) > 0) st = F(1.0);
    else {
      const k = 500 * bl2;
      const L40 = s16(L48) <= k ? k : s16(L48);
      st *= k / L40;
      if (age < 0x20) st += (m.s8(staff + 0x59) * 0.05 + 0.5) * L34;
    }
    if (L28) {
      switch (A3s()) {
        case 1: st *= 1.25; break;
        case 3: case 5: st *= 0.75; if (age < 0x18 && bl2 > 0xa && st < 2.0) st = F(2.0); break;
        case 4: st *= 0.5; break;
        case 6: st *= 0.5; if (st > 2.0) st = F(2.0); break;
        case 7: st = F(1.0); break;
        default: break;
      }
      const dw = m.s16(L28 + 0xb);
      if (dw > 0x8ca && dw > 675 * bl2) {
        if (dw > 0xcb2 && dw > 875 * bl2) {
          if (!(age >= 0x1f || age <= 0x14)) { if (m.s8(staff + 0x59) < 0xf) st = F(1.0); else st -= 2.0; }
        } else if (age <= 0x13 || age < 0x15) st -= 1.0;
        else if (age >= 0x1b) { if (age > 0x1d && age < 0x20 && st < 2.0) st += 1.0; }
        else if (m.s8(staff + 0x59) < 5) st = F(1.0);
        else if (st > F(3.0)) st -= 1.0;
      }
    }
    // 0x8620a0
    if (L3b) {
      if (st < 3.0) st = age < 0x1b ? F(5.0) : age < 0x1e ? F(4.0) : F(3.0);
      else st += 1.0;
    }
    const nat = m.u32(A1 + 0x53);
    if (nat) {
      const nid = m.u32(nat);
      if (nid === m.u32(0x9cf2fc) || nid === m.u32(0x9cf4dc)) { st *= 0.5; if (st > 3.0) st = F(3.0); }
    }
    if (L10 < F(500)) { if (!(st < 2.0)) st = 2.0; }
    else if (L10 < F(1000)) { if (!(st < 3.0)) st = 3.0; }
    else if (L10 < F(2000)) { if (!(st < 4.0)) st = 4.0; }
    const n = m.s8(0xa83608);
    if (st > n - 1) st = n - 1.0;
    else if (st < 1.0) st = F(1.0);
    // 0x8621f6: kontrakttypen +0x35 og år
    const lim = s16(u16(500 * bl2 + 0x4e2));
    const d39 = m.u32(staff + 0x39);
    const typeTo = (and: number, or: number) => m.w8(self + 0x35, (m.u8(self + 0x35) & and) | or);
    let addYears = true;
    if (s16(L48) > lim) {
      if (d39 === 0 && bl2 < 2 && (ftol(L34 * 4.0) & 0xff) === 0) typeTo(0xc2, 0x82);
      else typeTo(0xc2, 2);
    } else if (d39 === 0 && bl2 < 2 && (ftol(L34 * 5.0) & 0xff) === 0) {
      if (age > 0x14) typeTo(0xc2, 0x82);
      else { typeTo(0xc1, 1); addYears = false; }
    } else typeTo(0xc2, 2);
    if (addYears) yr = (yr + ftol(st + 1.0)) & 0xffff;
    // 0x8622c9: udløbsdatoen – databasens dato (staff +0x46), hvis den er senere og klubben er hans
    const sd = m.s16(staff + 0x46), sy = m.u16(staff + 0x48);
    let useStaffDate = false;
    if (sy > yr || (sy === yr && sd > s16(L20day))) useStaffDate = A1 === contractClub(m, staff);
    if (useStaffDate) copy8(m, self + 0x2d, staff + 0x46);                  // 0x862355: hele datoen (8 bytes) fra staff +0x46
    else makeDate_549ef0(m, self + 0x2d, L20day, yr);
  }
  // 0x86237a: bonusserne
  if (L28) {
    const bonus = () => ftol(L10 * L34 * F(0.02500000037252903) + L10 * F(0.02500000037252903) + F(25));
    m.w32(ebp + 0x10, m.u8(L28 + 0x15) >= 0xf ? bonus() : -1);
    m.w32(ebp + 0x14, m.u8(L28 + 0x13) < 0xf && m.u8(L28 + 0x14) < 0xf && m.u8(L28 + 0x15) < 0xf ? -1 : bonus());
    m.w32(ebp + 0x18, m.u8(L28 + 0xf) === 0x14 ? bonus() : -1);
  }
  if (L10 < F(125) && A1 && m.u8(A1 + 0x64) === 2) m.w8(ebp + 0x35, m.u8(ebp + 0x35) | 0x80);
  else if (L10 > F(1250) && (m.u8(ebp + 0x35) & 0x80)) m.w8(ebp + 0x35, m.u8(ebp + 0x35) & 0x7f);
  // 0x862483: lønnen og kontraktens værdi
  const wage = ftol(L10);
  m.w32(ebp + 0xc, wage);
  const b35 = m.u8(ebp + 0x35);
  let W = wage;
  if (s8(b35 << 2) >> 2 === 1) W *= 0.5;
  if (b35 & 0x80) W *= 1.05;
  let B = 0.0;
  if (L28) {
    for (let i = 0; i < 3; i++) {
      const v = m.s32(ebp + 0x10 + 4 * i);
      if (!(v > -1)) continue;
      const t = tdiv(v, 10);
      if (i <= 1) {
        if (m.s8(L28 + 0x13) >= 0xf || m.s8(L28 + 0x14) >= 0xf || m.s8(L28 + 0x15) >= 0xf) B += t;
        else if (m.u8(L28 + 0xf) === 0x14) B -= t;
      } else if (m.u8(L28 + 0xf) === 0x14) B += t;
      else B -= t;
    }
  }
  const fee = m.s32(ebp + 0x21);
  for (let i = 0; i < 5; i++) {
    if (m.u8(L24p + i) === 0) continue;
    let x: number;
    if (i === 1) x = fee < 0x7a120 ? L10 * F(0.10000000149011612) : fee < 0x2625a0 ? L10 * F(0.05000000074505806) : L10 * F(0.013333333656191826);
    else if (i === 2) x = fee < 0x2625a0 ? L10 * F(0.10000000149011612) : L10 * F(0.06666667014360428);
    else x = fee < 0x7a120 ? L10 * F(0.06666667014360428) : fee < 0x2625a0 ? L10 * F(0.03999999910593033) : L10 * F(0.019999999552965164);
    B += x;
  }
  if (!L28) {
    m.w8(ebp + 0x1d, 0); m.w8(ebp + 0x1e, 0); m.w8(ebp + 0x1f, 0); m.w8(ebp + 0x20, 0);
    m.w32(ebp + 0x10, -1); m.w32(ebp + 0x14, -1); m.w32(ebp + 0x18, -1);
  }
  const L40 = F(L10 * F(0.10000000149011612));
  if (!(B <= L40)) B = L40;
  return ftol(B + W);
}

// ---------------------------------------------------------------- 0x866830 calc_contract_value(this = kontrakten, staff, tilbud*) → heltal

export function calcContractValue_866830(c: CmCtx, self: number, staff: number, offer: number): number {
  const m = c.m;
  const C = SCR_866830;
  for (let i = 0; i < 0x50; i++) m.w8(C + i, 0);
  m.w32(C + 4, -1); m.w32(C + 0x4a, -1);
  let L14 = F(1.0);
  let L13 = 0xff;
  if (offer) {
    for (let i = 0; i < 0x50; i++) m.w8(C + i, m.u8(offer + i));
  } else {
    setToDesiredContract_85fc50(c, C, staff, clubById(m, m.s32(self + 4)), -1, 0xff, 0xb, 0, 0);
  }
  const days = daysToToday(m, self + 0x2d);
  if (s16(days) < 7) return 0;
  const age = m.s8(staff + 0x18);
  let A84 = F(m.s32(self + 0xc));
  let st: number = m.s32(self + 0xc);
  const pr = m.u32(staff + 0x61);
  if (pr) {
    const fl = c.call(0x5b7d20, pr) & 0xff;
    if (fl & 1) {
      const v = m.s32(self + 0x18);
      st = v > -1 ? v * 0.8 + A84 : A84;
      L13 = 0x21;
    } else st = A84;
    if (fl & 6) {
      const g = m.s32(self + 0x10); if (g > -1) st += g * 0.3;
      const a = m.s32(self + 0x14); if (a > -1) st += a * 0.2;
      L13 = 0x1f;
    }
    if (fl & 0x38) {
      const g = m.s32(self + 0x10); if (g > -1) st += g * 0.4;
      const a = m.s32(self + 0x14); if (a > -1) st += a * 0.7;
      L13 = 0x1d;
    }
    if (fl & 0x40) {
      const g = m.s32(self + 0x10); if (g > -1) st += g * 0.8;
      const a = m.s32(self + 0x14); if (a > -1) st += a * 0.5;
      L13 = 0x1c;
    }
  }
  // 0x866b45: underskriftsbeløbet fordelt over dagene
  const d8 = m.s32(self + 8);
  st = st + d8 / (s16(days) * F(0.2222222238779068));
  A84 = F(st);
  if (pr && m.s16(pr + 0xd) > 0xfa0) {
    if (crtPow(m.s16(pr + 0xd), 2.0) * 0.01 > d8) { st = A84 * F(0.5); A84 = F(st); }
    else st = A84;
  }
  // 0x866bc8: klausulerne mod tilbuddets
  const o = offer;
  const M1 = 0xf4240, M5 = 0x4c4b40;
  const ed = m.s32(self + 0x21), es = () => m.s32(o + 0x21);
  for (let i = 0; i < 5; i++) {
    if (m.s8(self + 0x1c + i) <= 0) continue;
    const f = (x: number) => { st *= x; };
    const d44 = (ec: number, ea: number) => f(ec >= ea ? F(1.75) : F(1.7000000476837158));         // 0x866d44: cmp ecx, eax
    const d63 = (ec: number, ea: number) => f(ec >= ea ? F(1.5) : F(1.4500000476837158));          // 0x866d61/0x866d63
    const d75 = () => f(es() >= ed ? F(1.2000000476837158) : F(1.149999976158142));
    switch (i) {
      case 0:
        if (m.s8(o + 0x1d) > 0) {
          const ea = es();
          if (ea < M1 && ed < M1) d44(ea, ed);
          else if (ed < 0x7270e0 && ea < 0x7270e0) d63(ea, ed);
          else if (ea >= ed) f(F(1.2000000476837158));
          else f(F(1.149999976158142));
        } else f(F(1.2000000476837158));
        break;
      case 1:
        if (m.s8(o + 0x1d) > 0) {
          if (age > 0x1c) { if (ed >= M1 || es() >= M1) f(F(1.0499999523162842)); else f(F(1.100000023841858)); }
          else if (age < 0x18) {
            if (ed < M1 && es() < M1) { if (es() >= ed) st += st; else f(F(1.9500000476837158)); }
            else if (ed < M5 && es() < M5) d63(es(), ed);
            else f(F(1.25));
          } else if (ed < M1 && es() < M1) d44(es(), ed);
          else if (ed < M5 && es() < M5) d63(es(), ed);
          else d75();
        } else if (ed < M1 && es() < M1) f(F(1.2000000476837158));
        else if (ed < M5 && es() < M5) f(F(1.0499999523162842));
        else f(F(1.0099999904632568));
        break;
      case 2:
        if (ed >= M5 || es() >= M5) f(F(1.2000000476837158)); else f(F(1.7999999523162842));
        break;
      case 3:
        if (m.s8(o + 0x1f) <= 0) f(F(1.100000023841858));
        else if (ed < M1 && es() < M1) d44(es(), ed);
        else if (ed < M5 && es() < M5) d63(es(), ed);
        else d75();
        break;
      case 4: st *= 1.25; break;
    }
  }
  // 0x866dab: år mellem udløbene, alderen mod positionens bedste alder (L13)
  A84 = F(st);
  const L18 = F((m.u16(self + 0x2f) - m.u16(C + 0x2f)) | 0);
  let al = L13 === 0xff ? age : s8(L13 - age);
  if (al < -5) al = -5; else if (al > 5) al = 5;
  if (m.s8(o + 0x1d) > 0) L14 = F(0.75);
  else if (al > 0 && (m.s8(o + 0x1f) > 0 || m.s8(o + 0x1c) > 0)) L14 = F(0.875);
  if (al < 0 && pr) L14 = F((1.0 - al * 0.01) * L14);
  let P = crtPow(L14, Math.abs(L18));
  if (P < 0.5) P = 0.5; else if (P > 2.0) P = 2.0;
  return ftol(L18 < 0 ? A84 / P : A84 * P);
}

// ---------------------------------------------------------------- 0x866620 get_contract_satisfaction(this = kontrakten, staff) → 1..3

export function contractSatisfaction_866620(c: CmCtx, self: number, staff: number): number {
  const m = c.m;
  const D = SCR_866620;
  for (let i = 0; i < 0x50; i++) m.w8(D + i, 0);
  m.w32(D + 4, -1); m.w32(D + 0x4a, -1);
  if (!staff) return 1;
  const s = s8(deservedStatus_4ca470(m, staff, self));
  const cl = m.u8(self + 0x4f) >> 4;
  const club = clubById(m, m.s32(self + 4));
  const use = s < cl && s !== 0 && s !== 7 ? s : cl;
  setToDesiredContract_85fc50(c, D, staff, club, -1, use, 0xb, 0, 0);
  const v1 = calcContractValue_866830(c, self, staff, D);
  const Lc = F(v1);
  const v2 = calcContractValue_866830(c, D, staff, D);
  let ratio = v2 === 0 ? 0.0 : (Lc * F(100)) / v2;
  const t = today(m);
  let d = (Math.imul(((t.year - m.u16(self + 0x27)) | 0), 365) - m.s16(self + 0x25) + t.day) | 0;
  if (d < 0) d = 0; else if (d > 0x1f4) d = 0x1f4;
  const n = m.s8(staff + 0x59);
  if (d < 15 * n + 0x64) ratio = ratio + F(50) + n * 7.5 - Math.trunc(d / 2);
  if (ratio < F(50)) return 1;
  return ratio < F(80) ? 3 : 2;
}

// ---------------------------------------------------------------- 0x4ce450 lowest_wage_demand(staff, club) → heltal

/** det laveste af lønkravene for status 1 og 2 (højst 10.000.000) – thiscall CONTRACT_MANAGER, ret 8 */
export function lowestWageDemand_4ce450(c: CmCtx, staff: number, club: number): number {
  const k = SCR_4CE450;
  for (let i = 0; i < 0x50; i++) c.m.w8(k + i, 0);
  constructContract_85e410(c.m, k);
  let esi = 0x989680;
  const a = setToDesiredContract_85fc50(c, k, staff, club, -1, 1, 0xb, 0, 0);
  if (a < esi) esi = a;
  const b = setToDesiredContract_85fc50(c, k, staff, club, -1, 2, 0xb, 0, 0);
  return b < esi ? b : esi;
}
