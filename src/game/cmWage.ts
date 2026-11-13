// Originalens standardløn STAFF_CONTRACT::default_staff_contract 0x864550 (cm0102.exe 3.9.68, oversat instruktion for instruktion 12/11-2026 oven på
// cmMem.ts) og de små funktioner, den kalder. Ugelønnen i £ (float), som en person forventer i en klub – grundlaget for ønskekontrakten 0x85fc50
// (tre kald), startkontrakten 0x85e960, lønsummen 0x598370 og trupplanens/ønskelistens værdier (0x83f3a0, 0x842e10, 0x844780, 0x846920).
//
// Kaldet: thiscall, ecx = en kontrakt (bruges IKKE), ret 0x18 – seks argumenter:
//   staff  [esp+4]   personen (staff-post, 0x6e bytes)
//   club   [esp+8]   klubben, lønnen gælder (0 = ingen – så springes alt klubafhængigt over og resultatet er jobbets grundløn)
//   a2     [esp+0xc] 0/1: 1 = loftet af klubbens højeste løn 0x5968d0 gælder altid (0x85fc50 sender 1 i to af tre kald)
//   status [esp+0x10] trupstatus 1..6 (byte; 0xff/−1 = regnes af omdømmet for spillere – 0x864d40), sendes også som dword til 0x5968d0
//   job    [esp+0x14] jobkoden for kaldet (byte, 0xb spiller, 6 assistent …) – kun sammenlignet med 0xb/6 (og 0xd/0xf for spillere)
//   kind   [esp+0x18] byte 0..3 (1/2/3: 0x85fc50's særtilfælde – 3 = 85000 som grundløn, 1/2 = 92500/82500/75000 og loftet 7250/6750)
// Resultatet: float i st0 (fld dword) – her et f32-tal.
//
// Læste felter (alle via CmMem):
//   staff:  +0 id, +0x18 alder (s8), +0x1a landet (ptr), +0x22 landskampe (byte ≠ 0), +0x24 landsholdets klub (ptr), +0x28 landsholdsjobbet (byte),
//           +0x39 klubben (ptr), +0x3d jobbet (byte), +0x3e/+0x40 kom til klubben (Date: dag s16, år u16), +0x57 Ambition (s8), +0x58 (s8),
//           +0x59 (s8 – Loyalty ifølge cmPlayerData), +0x5a Pressure (s8), +0x61 spillerposten (ptr), +0x69 ikke-spillerposten (ptr)
//   spillerpost (+0x61): +5 CA, +7 PA, +9 hjemme-, +0xb nuværende, +0xd verdensomdømme (s16), +0xf GK-evne (byte), +0x10..+0x15 positions-
//           evnerne (byte; 0x15 = angriber …), +0x44 (s8)
//   ikke-spillerpost (+0x69): +0xa evnen (s16, x³), +0xc omdømmet (s16)
//   klub:   +0 id, +0x53 landet (ptr), +0x57 divisionen (ptr → +0 id), +0x64 klubstatus (byte; 1 = …, 2 = …), +0x80 omdømme (s16), +0x82 (byte)
//   land:   +0 id, +0x76 sprog-/regionsbyte (byte), +0x7e (byte 1/2/3 – faktor 1/0,75/0,5), +0x85 (s8 – ligaens styrke 1..)
//   kontrakt (0x4cf5a0, egen): +4 klubbens id, +0x35 (& 0x3f = 5: ingen klub), +0x45 bit 0x10; 0x4cf5f0 (med den nuværende klub): +0xc løn, +0x4f høj nibble 7
//   finansposten 0x5a0590: [[0xae2a38]] + 0x167·klub-id (kun adressen – læses af 0x5968d0)
//   globale: [0xae2364] antal personer, [0xae23b4] klubberne, [0xae2d0c]/[0xae1050] kontrakterne, [0xae233c] (byte = 1), [0xae2c90] i dag,
//           nationernes id'er [0x9cf218 … 0x9cf594] (runtime-dwords – se NAT nedenfor), CRT-rand-frøet [0xad6c30] (kun spillere uden spillerpost).
// Skriver: [0xae1080] = den egne kontrakt (0x86456e), [0xad6c30] (CRT-rand, kun 0x865699-stien).
// c.call: 0x5968d0 Finance::get_max_wage (thiscall: finanspost, staff, status-dword – 1446 instruktioner, ikke porteret),
//         0x669bd0 key_nation_club_in_season(club, 0, 0) (via 0x547770), 0x540a50(club, &out, 1) – se getClubFinance_5a0590.
// Ingen af spillets tilfældige tal (0x90cfc0); 0x865699 (spillerjob uden spillerpost – en fejlsti) bruger CRT'ens rand() 0x946a04.
//
// 0x862720 (staff_contract_calc_unset_default_wage, kaldt af set_default_wage 0x8626e0 og trupplanens spilstart 0x83a1b0): IKKE en kopi – samme
// argumenter og stab-/klub-/landsdel, men en anden (ældre) spillerformel og et par andre konstanter; oversat for sig (defaultWageUnset_862720,
// forskellene står ved funktionen). Begge deler defaultWageCore.

import { type CmCtx, type CmMem, G, f32, ftol, getContract, parentClub_540a50 } from './cmMem';
import { crtPow } from './engine/crtMath';

/** nationernes id-globaler (dword sat ved indlæsningen; −1 i filen) – læses fra hukommelsen som originalen */
const NAT = (m: CmMem, a: number) => m.s32(a);

const rep500 = (v: number) => Math.trunc(v / 500);
const rep50 = (v: number) => Math.trunc(v / 50);

// ---------------------------------------------------------------- små funktioner

/** 0x549e50 club_is_in_major_nation: klubbens land er en af [0x9cf2e4], [0x9cf300], [0x9cf314], [0x9cf360], [0x9cf488], [0x9cf338] */
export function clubInMajorNation_549e50(m: CmMem, club: number): boolean {
  if (!club) return false;
  const n = m.u32(club + 0x53);
  if (!n) return false;
  const id = m.s32(n);
  return id === NAT(m, 0x9cf2e4) || id === NAT(m, 0x9cf300) || id === NAT(m, 0x9cf314) || id === NAT(m, 0x9cf360) || id === NAT(m, 0x9cf488) || id === NAT(m, 0x9cf338);
}

/** 0x547770 club_is_in_season(club): 0 for ingen klub, ellers 0x669bd0(club, 0, 0) */
export function clubInSeason_547770(c: CmCtx, club: number): number {
  if (!club) return 0;
  return c.call(0x669bd0, club, 0, 0);
}

/** 0x5a0590 FinanceTable::get_club_finance (this = [0xae2a38]): klubbens finanspost à 0x167 bytes; et B-hold bruger moderklubbens
 *  (0x540a50(club, &out, 1) ≠ 0 og out = 0). c.call(0x540a50, club, 1) skal svare som eax, når out = 0, og ellers 0. Ingen klub → 0
 *  (originalen skriver en fejltekst). */
export function getClubFinance_5a0590(c: CmCtx, club: number): number {
  const m = c.m;
  if (!club) return 0;
  const p = parentClub_540a50(c, club);
  const base = p ? p : club;
  return (m.u32(m.u32(0xae2a38)) + 0x167 * m.s32(base)) >>> 0;
}

const leap54 = (y: number) => {                                              // 0x54ce5a–0x54ce98: (y & 1) = 1 → 365; y % 4 ≠ 0 → 365; % 100 ≠ 0 → 366; % 400 ≠ 0 → 365
  if (y % 2 === 1) return false;
  if (y % 4 !== 0) return false;
  if (y % 100 !== 0) return true;
  return y % 400 === 0;
};
/** 0x54cdb0 Date::days_since (thiscall this = en Date): dage fra den anden dato (dag s16, år u16) til this. NB originalens gren for en senere
 *  anden dato tæller årenes længde fra år − 1 (0x54ce4f: `dec cx`) – oversat som den står. */
export function daysSince_54cdb0(m: CmMem, self: number, oDay: number, oYear: number): number {
  const ax = m.u16(self + 2), bx = oYear & 0xffff;
  let edi = 0;
  if (bx > ax) {
    for (let si = ax; si < bx; si++) edi -= leap54((si - 1) & 0xffff) ? 0x16e : 0x16d;
  } else if (bx < ax) {
    let si = ax;
    while (si > bx) { si--; edi += leap54(si & 0xffff) ? 0x16e : 0x16d; }
  }
  return (edi + (m.s16(self) - ((oDay << 16) >> 16))) | 0;
}

/** CRT rand() 0x946a04 på frøet [0xad6c30] */
function crtRand_946a04(m: CmMem): number {
  const s = (Math.imul(m.u32(0xad6c30), 0x343fd) + 0x269ec3) | 0;
  m.w32(0xad6c30, s);
  return (s >> 16) & 0x7fff;
}

/** 0x4cf5f0 CONTRACT_MANAGER::get_contract_for_club(staff, club): den egne kontrakt eller lejekontrakten med klubben (eller dens B-hold/moderklub
 *  via 0x540a50(club, &out, 1) – c.call(0x540a50, club, 1) som i getClubFinance_5a0590) */
export function getContractForClub_4cf5f0(c: CmCtx, staff: number, club: number): number {
  const m = c.m;
  if (!staff || !club) return 0;
  const id = m.s32(staff);
  if (id >= m.s32(G.STAFF_COUNT)) return 0;
  const row = m.u32(G.ROWS) + 79 * id;
  const ix = m.s32(row);
  if (ix < 0) return 0;
  const arr = m.u32(m.u32(G.CM));
  const own = (arr + 80 * ix) >>> 0;
  if (!own) return 0;
  const cid = m.s32(club);
  if (m.s32(own + 4) === cid) return own;
  const lx = m.s32(row + 4);
  let loan = 0;
  if (lx >= 0) {
    loan = (arr + 80 * lx) >>> 0;
    if (loan && m.s32(loan + 4) === cid) return loan;
  }
  const p = parentClub_540a50(c, club);
  const ebp = p ? p : club;
  const id2 = m.s32(ebp);
  if (m.s32(own + 4) === id2) return own;
  if (loan && m.s32(loan + 4) === id2) return loan;
  return 0;
}

// ---------------------------------------------------------------- 0x864550

/** 0x864550 STAFF_CONTRACT::default_staff_contract(staff, club, a2, status, job, kind) → ugeløn (f32) */
export function defaultStaffContract_864550(c: CmCtx, staff: number, club: number, a2: number, status: number, job: number, kind: number): number {
  const r = defaultWageCore(c, staff, club, a2, status, job, kind, false);
  c.probe?.(0x864550, r);
  return r;
}

/** 0x862720 staff_contract_calc_unset_default_wage – samme argumenter og samme stab-/klub-/landsdel som 0x864550, men en ANDEN (ældre) spillerformel:
 *  grundtallene 8500/10000/65000/55000/50000/52500/45000/40000/25000/20000/30000 (ingen kind-særtilfælde 85000/92500/82500/75000), ingen
 *  omdømmeregel 1750/3250 og intet 7250-gulv for X = 75000/92500/105000, landets faktor uden "verdensomdømme > 4250 → 1", klubfaktoren af det
 *  NUVÆRENDE omdømme (+0xb, ikke +0xd), niveauloftet ved L ≥ 15 hårdt 3250·L uden for de tre store lande (blødt 3250·L med club +0x82, ellers
 *  blødt over 5000·L), evneloftet 85000/75000/65000/50000/40000 (·1,1 kun når res > 11000), den klubløse faktor uden 250-/30-lofterne,
 *  [0x9cf45c] med 0,35 og kun 10000-loftet, [0x9cf430] i 0,5/350-gruppen, og topspillerens tillæg kun når 1,25·res < klubbens højeste løn
 *  (·1,1/·1,05/·1,15 uden Loyalty-varianten). Kaldt af set_default_wage 0x8626e0 og trupplanens spilstart 0x83a1b0 (løn −1 i databasen). */
export function defaultWageUnset_862720(c: CmCtx, staff: number, club: number, a2: number, status: number, job: number, kind: number): number {
  return defaultWageCore(c, staff, club, a2, status, job, kind, true);
}

/** 0x8626e0 STAFF_CONTRACT::set_default_wage(staff) (this = kontrakten): +0xc = max(55, ftol(0x862720(staff, staff +0x39, 1, −1, 0xb, 0))) */
export function setDefaultWage_8626e0(c: CmCtx, contract: number, staff: number): void {
  const m = c.m;
  let w = ftol(defaultWageUnset_862720(c, staff, m.u32(staff + 0x39), 1, -1, 0xb, 0));
  m.w32(contract + 0xc, w);
  if (w < 0x37) { w = 0x37; m.w32(contract + 0xc, w); }
}

function defaultWageCore(c: CmCtx, staff: number, club: number, a2: number, status: number, job: number, kind: number, old: boolean): number {
  const m = c.m;
  const own = getContract(m, staff);
  m.w32(G.LAST_CONTRACT, own);
  // [esp+0x18]: klubben i den egne kontrakt (ikke når +0x35 & 0x3f = 5)
  const cur = own && (m.u8(own + 0x35) & 0x3f) !== 5 ? (m.u32(G.CLUBS) + 0x245 * m.s32(own + 4)) >>> 0 : 0;
  const age = m.s8(staff + 0x18);                                           // [esp+0x13]
  const prec = m.u32(staff + 0x61);                                         // [esp+0x1c]
  const np = m.u32(staff + 0x69);
  const idf = f32(m.s32(staff) / m.s32(G.STAFF_COUNT));                     // [esp+0x20]
  let st = status & 0xff;                                                   // [esp+0x44] (byte)
  const jobB = job & 0xff;                                                  // [esp+0x48] (byte)
  const kindB = kind & 0xff;

  // ---- niveauet L ([esp+0x14], ebp) 0x8645c9–0x864665
  let L: number;
  if (club) {
    L = (((rep500(m.s16(club + 0x80)) + 1) << 24) >> 24);                   // inc dl; movsx
    if (cur && m.u8(club + 0x64) === 2) {
      L--;
      if (L < 1) L = 1;
      else if (L > 4) L = 4;
    }
  } else {
    if (prec) { let e = rep500(m.s16(prec + 0xd)); if (e < 1) e = 1; L = (e << 24) >> 24; }
    else if (np) { let e = rep500(m.s16(np + 0xc)); if (e < 1) e = 1; L = (e << 24) >> 24; }
    else L = 1;
  }

  // ---- jobbet til tabellen 0x864669–0x8646a4
  let al: number;
  const s3d = m.u8(staff + 0x3d), s28 = m.u8(staff + 0x28), s24 = m.u32(staff + 0x24);
  if (cur && s3d !== 0) al = s3d;
  else if (s24 && s28 !== 0) al = s28;
  else if (s3d !== 0) al = s3d;
  else if (prec) al = 0xb;
  else if (s28 !== 0) al = s28;
  else al = 9;
  const jcase = ((al << 24) >> 24) - 5;

  // ---- jobbets grundløn res ([esp+0x4c])
  let res = 0;
  /** de fælles niveau-skridt i jobtilfældene: den nuværende klubs og landsholdsklubbens omdømme hæver L */
  const lift = () => {
    if (cur) {
      const t = rep500(m.s16(cur + 0x80)) + 1;
      if (t > L) { L = t; return; }
    }
    if (np && s24 && s28 !== 0xb) {
      const t = rep500(m.s16(s24 + 0x80)) + 1;
      if (t > L) L = t;
    }
  };
  const ability = (k: number, base: number) => {                            // np ? x³·k : (idf·4 + 1)·base·0,0001
    if (np) { const x = m.s16(np + 0xa); return x * x * x * k; }
    return ((idf * 4 + 1) * base) * 0.0001;
  };
  /** 0x8649c7: job 0xb/6 → færdig; ellers over 25000 → 150000 */
  const tail9c7 = () => { if (jobB === 0xb || jobB === 6) return; if (res > 25000) res = 150000; };
  let player = false;
  if (jcase < 0 || jcase > 10) res = 1000;                                  // 0x864ce3
  else switch (jcase + 5) {
    case 5: {                                                               // 0x8646ba manager
      lift();
      res = f32(L * ability(2.5e-8, 25000) * 0.25);
      if (750 > res) res = 750;
      else if (res > 25000) res = 150000;                                   // 0x8649db
      break;
    }
    case 6: {                                                               // 0x864789 assistent
      lift();
      res = f32(L * ability(1e-8, 10000) * 0.25);
      if (500 > res) res = 500;
      if (cur && cur !== club) {
        if (jobB !== 0xb && jobB !== 6) { res = 150000; break; }
        const t = rep500(m.s16(cur + 0x80)) + 4;
        if (t > L) { res = 150000; break; }
        if (res < 2500) res = f32(res * 1.35);
        break;
      }
      tail9c7();
      break;
    }
    case 7: {                                                               // 0x8648c8
      lift();
      res = f32(L * ability(1e-8, 10000) * 0.25);
      if (500 > res) res = 500;
      if (cur && cur !== club) {
        const t = rep500(m.s16(cur + 0x80)) + 4;
        if (t > L) { res = 150000; break; }
      }
      tail9c7();
      break;
    }
    case 8: {                                                               // 0x8649fd træner
      lift();
      res = f32(L * ability(5e-9, 5000) * 0.25);
      if (275 > res) res = 275;
      else if (5000 < res) res = 5000;
      if (cur && cur !== club && jobB !== 6 && jobB !== 0xb) {
        const t = rep500(m.s16(cur + 0x80)) + 4;
        if (t > L) res = 150000;
      }
      break;
    }
    case 9: {                                                               // 0x864b3b spejder
      lift();
      res = f32(L * ability(1e-9, 1000) * 0.25);
      if (250 > res) res = 250;
      else if (1000 < res) res = 1000;
      break;
    }
    case 10: {                                                              // 0x864c0a fysioterapeut
      lift();
      res = f32(L * ability(1e-9, 1000) * 0.25);
      if (200 > res) res = 200;
      else if (1000 < res) res = 1000;
      break;
    }
    case 14: res = 1000; break;                                             // 0x864ce3
    default: player = true;                                                 // 11, 12, 13, 15 → 0x864d34
  }

  if (player) {
    if (!prec) {
      // 0x865699: fejlstien (sprintf til 0xde1f64) – (rand()·4)/0x8000 · 550
      const r = crtRand_946a04(m);
      const q = Math.trunc((r * 4) / 0x8000);
      res = f32(q * 550);
    } else {
      res = (old ? playerWage862 : playerWage)(c, staff, club, cur, prec, age, idf, kindB, jobB, L, (s) => { st = s; }, st);
      if (m.u32(staff + 0x39) === 0) res = freeAgentFactor(c, staff, club, prec, age, res, old);
    }
  }

  // ---- 0x864ceb: klubafhængig del
  if (!club) return res;
  const L2 = L;                                                             // ebp = [esp+0x14] (spillerstien genindlæser den, 0x86536d/0x8653bd)
  if (prec) {
    let fac: number;
    if (m.u8(club + 0x64) === 1) fac = m.s16(club + 0x80) * 0.00017;
    else { const r = m.s16(club + 0x80); fac = r > 0x8ca ? r * 0.00012 : r * 0.0001; }
    let p = crtPow(fac, 6);                                                  // 0x945ff0 pow(fac, 6)
    if (!(p <= 1)) p = 1;
    const rep3 = 3 * m.s16(club + 0x80);
    const major = () => clubInMajorNation_549e50(m, club);
    const blend = (w: number) => { if (res < w) res = f32((res + w) * 0.5); };
    const s = ((st << 24) >> 24) - 1;                                         // edi
    switch (s) {
      case 0: blend(age < 20 ? rep3 * p * 0.6 : age >= 24 && major() ? rep3 * p * 1.5 : rep3 * p * 1.25); break;
      case 1: blend(age < 20 ? rep3 * p * 0.3 : age >= 24 && major() ? rep3 * p : rep3 * p * 0.6); break;
      case 2:
        if (age < 20) blend(rep3 * p * 0.25);
        blend(age >= 24 && major() ? rep3 * p * 0.6 : rep3 * p * 0.3);
        break;
      case 3: blend(age < 20 ? rep3 * p * 0.1 : age >= 24 && major() ? rep3 * p * 0.3 : rep3 * p * 0.15); break;
      case 4: blend(rep3 * p * 0.05); break;
      case 5: blend(rep3 * p * 0.02); break;
    }
    const own2 = getContract(m, staff);                                     // 0x86598c
    if (own2 && (m.u8(own2 + 0x45) & 0x10) && s >= 0 && s <= 5) {
      res = f32(res * [0.67, 0.67, 0.85, 2.5, 3.5, 7.5][s]);
    }
  }

  // ---- 0x8659f0: landets loft
  nationCap: {
    const n = m.u32(club + 0x53);
    if (!n) break nationCap;
    const sc = m.u32(staff + 0x39), sn = m.u32(staff + 0x1a);
    const ok = sc ? (m.u32(sc + 0x53) === n && (sn === n || m.s8(staff + 0x59) > 3 || m.s8(staff + 0x57) < 15)) : sn === n;
    if (!ok) break nationCap;
    const rp = (rep50(m.s16(club + 0x80)) << 16) >> 16;                      // dx
    const id = m.s32(n);
    const soft = (lim: number, k: number) => { if (res > lim) res = f32((res - lim) * k + lim); };
    /** 0x865bda-mønstret: f = rp > 10·cl ? min(1, rp/max(cl,1)·0,1·base) : base; res ·= f */
    const scale = (base: number) => {
      const cl = m.s8(n + 0x85);
      let f = base;
      if (rp > 10 * cl) {
        const d = cl < 1 ? 1 : cl;
        f = rp / d * 0.1 * base;
        if (!(f <= 1)) f = 1;
      }
      res = f32(res * f);
      return cl;
    };
    if (id === NAT(m, 0x9cf36c)) {
      const t = L2 * L2 * 10;
      if (res < t) res = f32(t);
      soft(7500, 0.25);
    } else if (id === NAT(m, 0x9cf2e4) || id === NAT(m, 0x9cf360) || id === NAT(m, 0x9cf488)) {
      // ingen
    } else if (id === NAT(m, 0x9cf4f8)) {
      res = f32(res * 0.75);
      const div = m.u32(club + 0x57);
      if (div && m.s32(div) === NAT(m, 0x9cf594)) soft(250, 0.15);
      else if (sn === n) {
        const a = m.s8(staff + 0x18);
        const p61 = m.u32(staff + 0x61);
        const young = a > 31 ? true : a >= 24 ? false : !!p61 && m.s16(p61 + 0xd) < 0xea6;
        if (young) soft(1250, 0.2); else soft(2750, 0.2);
      } else soft(3250, 0.25);
    } else if (id === NAT(m, 0x9cf484)) {
      scale(0.25);
      soft(500, 0.5);
      soft(1500, 0.5);
    } else if (old && id === NAT(m, 0x9cf45c)) {                          // 0x863c93
      scale(0.35);
      soft(10000, 0.25);
    } else if (id === NAT(m, 0x9cf45c)) {
      const cl = scale(0.25);
      if (rp > 10 * cl) soft(10000, 0.25);
      else if (!prec) soft(7250, 0.25);
      else {
        const wr = m.s16(prec + 0xd);
        if (wr < 0x4e2) soft(1250, 0.25);
        else {
          const a = m.s8(staff + 0x18);
          if (a >= 20 && a <= 32) soft(7250, 0.25);
          else if (wr < 0xabe) soft(3250, 0.25);
          else soft(7250, 0.25);
        }
      }
    } else if (id === NAT(m, 0x9cf314) || id === NAT(m, 0x9cf300) || id === NAT(m, 0x9cf338)) {
      scale(0.75);
      soft(20000, 0.25);
    } else if (id === NAT(m, 0x9cf4a8)) {
      scale(0.25);
      if (m.u8(club + 0x64) === 1) soft(500, 0.2); else soft(150, 0.2);
    } else if (id === NAT(m, 0x9cf510) || id === NAT(m, 0x9cf2fc) || id === NAT(m, 0x9cf2dc) || id === NAT(m, 0x9cf3e4) || id === NAT(m, 0x9cf224)) {
      if (m.u8(club + 0x64) === 1) soft(200, 0.15); else soft(100, 0.15);
    } else if (id === NAT(m, 0x9cf2c0) || id === NAT(m, 0x9cf408) || (old && id === NAT(m, 0x9cf430))) {
      scale(0.5);
      if (m.u8(club + 0x64) === 1) soft(350, 0.1); else soft(250, 0.1);
    } else if (id === NAT(m, 0x9cf244)) {
      scale(0.45);
      if (m.u8(club + 0x64) === 1) soft(500, 0.2); else soft(250, 0.2);
    } else if (id === NAT(m, 0x9cf434) || id === NAT(m, 0x9cf2ac) || (!old && id === NAT(m, 0x9cf430))) {
      scale(0.5);
      if (m.u8(club + 0x64) === 1) soft(500, 0.2); else soft(250, 0.2);
    } else if (id === NAT(m, 0x9cf260) || id === NAT(m, 0x9cf218)) {
      scale(0.45);
      soft(25000, 0.25);
    } else {
      const v = res * 0.3;                                                   // 0x866005: fst – sammenligningen med det urundede tal
      res = f32(v);
      if (v > 15000) res = f32((res - 15000) * 0.25 + 15000);
    }
  }

  // ---- 0x86635f: lofterne. edi = [esp+0x44] som dword – spillerstien har skrevet den udledte status i den lave byte (0x864e00)
  const statusD = ((status & ~0xff) | (st & 0xff)) | 0;
  if (prec) {
    if (cur && club !== cur) {
      const c2 = getContractForClub_4cf5f0(c, staff, cur);
      if (c2 && (m.u8(c2 + 0x4f) & 0xf0) === 0x70) {
        const w = m.s32(c2 + 0xc);
        if (!(res <= w)) res = f32(w);
      }
    }
    let capNow = false, toTop = false;
    if (a2 === 0) {
      if (cur) toTop = true;
      else if (m.s16(m.u32(staff + 0x61) + 0xb) < 0x8ca) capNow = true;
    } else capNow = true;
    if (capNow) {
      const fin = getClubFinance_5a0590(c, club);
      if (!fin) return res;
      const w = c.call(0x5968d0, fin, staff, statusD) | 0;
      if (w < res) res = f32(w);
      // 0x866414: derefter kun videre ved cur ≠ 0 og a2 = 0 – den kombination går direkte til 0x866428 (uden loftet)
    }
    if (toTop) {
      if (m.s8(staff + 0x57) > 10 && m.s8(staff + 0x59) < 6 && m.s16(prec + 0xb) > 0x1a5e
        && (m.u8(prec + 0x15) === 0x14 || m.u8(prec + 0x14) === 0x14 || m.u8(prec + 0x13) === 0x14) && m.s8(staff + 0x18) > 0x14) {
        const fin = getClubFinance_5a0590(c, club);
        if (!fin) return res;
        const mw = c.call(0x5968d0, fin, staff, statusD) | 0;
        const loyal1 = m.s8(staff + 0x59) === 1;
        if (old) {                                                          // 0x8643d4 (0x8643ae's 0x4cf5f0 bruges ikke)
          const t = res * 1.25;
          if (t < mw) res = f32(res * (m.u8(prec + 0x14) === 0x14 ? 1.1 : m.u8(prec + 0x13) === 0x14 ? 1.05 : 1.15));
        } else if (m.u8(prec + 0x14) === 0x14) res = f32(res * (loyal1 ? 1.15 : 1.1));
        else {
          const t = res * 1.25;
          if (t < mw) {
            if (m.u8(prec + 0x13) === 0x14) res = f32(res * (loyal1 ? 1.1 : 1.05));
            else res = f32(res * (loyal1 ? 1.2 : 1.15));
          }
        }
      }
    }
  }

  // ---- 0x866503: gulvet
  if (m.u8(club + 0x64) === 1) {
    if (age < 20 && res < 75) return 75;
    if (res < 100) res = 100;
    return res;
  }
  if (m.s16(club + 0x80) > 0x8ca && res < 75) return 75;
  if (res < 50) return 50;
  return res;
}

/** spillerens grundløn 0x864d40–0x8655ae (res ved udgangen til 0x8655b2) */
function playerWage(c: CmCtx, staff: number, club: number, cur: number, prec: number, age: number, idf: number, kindB: number, jobB: number,
  L: number, setStatus: (s: number) => void, st0: number): number {
  const m = c.m;
  let cl = st0;
  // ---- 0x864d40: trupstatus af omdømmet, når den mangler (0xff)
  if (cl === 0xff && club) {
    const cx = m.s16(club + 0x80), ax = m.s16(prec + 0xb);
    if (ax > cx && age >= 0x18 && age < 0x22) cl = 1;
    else {
      const q75 = cx * 0.75;
      if (ax > q75 && age >= 0x15) cl = 2;
      else if ((ax > cx * 0.5 && age >= 0x11) || age > 0x18) cl = 4;
      else cl = m.s16(prec + 7) * 50 <= q75 ? 6 : 5;
    }
    setStatus(cl);
  }
  // ---- 0x864e04: grundtallet X
  let X: number;
  const s59 = m.s8(staff + 0x59);
  if (kindB === 3) X = 85000;
  else if (kindB === 1) X = s59 < 15 && m.s8(staff + 0x5a) > 15 ? 92500 : 75000;
  else if (kindB === 2) X = age > 0x16 && age < 0x20 ? 75000 : 82500;
  else if ((jobB === 0xd || jobB === 0xf) && age > 0x23) X = 10000;
  else {
    const cur11 = m.s16(prec + 0xb);
    if ((cl === 6 || cl === 5) && cur11 < 0x9c4) X = 9350;
    else if ((cl === 6 || cl === 5) && cur11 < 0x186a) X = 11000;
    else if (m.s8(prec + 0x15) >= 0xf) X = cur11 > 0x1a5e && age < 0x1f ? (s59 < 0xf ? 82500 : 70000) : 55000;
    else if (m.s8(prec + 0x12) >= 0xf || m.s8(prec + 0x14) >= 0xf || m.s8(prec + 0x13) >= 0xf) X = cur11 > 0x1c52 && age < 0x1f ? (s59 < 0xe ? 67750 : 60000) : 44000;
    else if (m.u8(prec + 0xf) === 0x14) X = m.s16(prec + 0xd) > 0x1c52 && s59 < 3 && age < 0x22 ? 37500 : 22000;
    else if (m.s8(prec + 0x10) < 0xf && m.s8(prec + 0x11) < 0xf) X = 27500;
    else X = cur11 > 0x1d4c && s59 < 6 && age < 0x21 ? 50000 : 27500;
  }
  let res = X;                                                              // fst [esp+0x4c] (konstanterne er præcise floats)
  // ---- 0x864fca: dl
  let dl = true;
  if (club) {
    const n = m.u32(club + 0x53);
    if (n && !(m.s16(club + 0x80) >= 0x1676 && m.s8(n + 0x85) >= 0xc)) {
      const sc = m.u32(staff + 0x39);
      if (sc === club) dl = false;
      else if (sc && m.u32(sc + 0x53) === n) dl = false;
    }
  }
  const rr0 = m.s16(prec + 0xd);
  if (age > 0x12 && age < 0x20 && dl) {
    const lim = 25 * (m.s8(staff + 0x59) + 0xe6) - 10 * m.s8(staff + 0x57);
    if (rr0 > lim) {
      if (m.u8(prec + 0xf) === 0x14) { if (X < 75000) X = 75000; }
      else if (X === 92500) X = 105000;
      else if (X === 75000) X = rr0 > 0x1c52 ? 105000 : 92500;
      else if (rr0 > 0x1c52) { if (X < 92500) X = 92500; }
      else if (X < 75000) X = 75000;
      res = X;
    }
  }
  // ---- 0x8650cd: [0xae233c] = 1 – kun st0 (ikke res)
  if (c.m.u8(G.B_AE233C) === 1 && X > 11000 && club) {
    X = res;
    if (clubInMajorNation_549e50(m, club)) {
      const ax = m.s16(prec + 0xb);
      if (ax > 0x1a5e) { const a = m.s8(staff + 0x59); X = res * (a === 1 ? 1.15 : a < 6 ? 1.125 : 1.1); }
      else if (ax > 0x109a) X = res * 1.025;
    }
  }
  // ---- 0x865145: omdømmet n
  const di = m.s16(prec + 0xb), si = m.s16(prec + 9), bp = m.s16(prec + 0xd);
  let cx = di;
  if (si > cx) cx = si;
  if (bp > cx) cx = bp;
  if (bp < 0x6d6 && cx > 0xcb2) cx = 0xcb2 - ftol((cx - 3250) * -0.2);
  cx = (cx << 16) >> 16;
  if (kindB === 1) { if (cx < 0x1c52) cx = 0x1c52; }
  else if (kindB === 2) { if (cx < 0x1a5e) cx = 0x1a5e; }
  if ((X === 75000 || X === 92500 || X === 105000) && cx < 0x1c52) cx = 0x1c52;
  const total = di + si + bp + 4 * cx + 50 * (m.s16(prec + 7) + m.s16(prec + 5));
  let n = (Math.trunc(total / 9) + ftol(idf * 8 - 4)) | 0;
  const sn = m.u32(staff + 0x1a), cn = club ? m.u32(club + 0x53) : 0;
  let skipMin = false;
  if (sn && cn && m.u8(cn + 0x76) !== m.u8(sn + 0x76)) {
    const cl76 = m.u8(cn + 0x76);
    const curN = cur ? m.u32(cur + 0x53) : 0;
    if (!cur || (curN && m.u8(curN + 0x76) !== cl76)) {
      if ((n >>> 0) < 0x5dc) { n = 0x5dc; skipMin = true; }
      else n = ftol((n >>> 0) * 1.05);
    }
  }
  if (!skipMin && (n >>> 0) <= 1) n = 1;
  const sq = Math.imul(n, n) >>> 0;
  const v = X * sq * 1e-8;
  res = f32(v);
  if (v < 175) res = 175;
  // ---- 0x865300: landets faktor
  let al: number;
  const curN = cur ? m.u32(cur + 0x53) : 0;
  if (cur && curN) al = m.u8(curN + 0x7e);
  else if (bp > 0x109a) al = 1;
  else if (sn) al = m.u8(sn + 0x7e);
  else al = 3;
  al = (al << 24) >> 24;
  if (al === 2) res = f32(res * 0.75);
  else if (al !== 1) res = f32(res * 0.5);
  // ---- 0x865349: verdensomdømmet mod klubbens
  if (club && m.s16(club + 0x80) !== 0) {
    let f = m.s16(club + 0x80) < 0x9c4 ? bp * f32(0.0004) : bp / (500 * L);
    if (f < 0.85) f = f32(0.85);
    if (!(f <= 1.15)) f = f32(1.15);
    res = f32(f * res);
  }
  // ---- 0x8653c1: niveauets loft
  const softT = (t: number) => { if (!(res <= t)) res = f32((res - t) * 0.1 + t); };
  if (L < 10) { const t = 2500 * L; if (!(res <= t)) res = f32(t); }
  else if (L < 15) { const t = 2750 * L; if (!(res <= t)) res = f32(t); }
  else {
    const nn = m.u32(club + 0x53);
    const id = nn ? m.s32(nn) : 0;
    if (nn && (id === NAT(m, 0x9cf2e4) || id === NAT(m, 0x9cf488) || id === NAT(m, 0x9cf360))) {
      if (m.u8(club + 0x82) !== 0) softT(5250 * L);
      else { const t = 7500 * L; if (t < res) softT(t); }
    } else softT(3250 * L);
  }
  // ---- 0x865515: evneloftet
  let cap: number;
  if (m.u8(prec + 0x15) === 0x14) cap = 150000;
  else if (m.u8(prec + 0x14) === 0x14 || m.u8(prec + 0x13) === 0x14 || m.u8(prec + 0x12) === 0x14) cap = 125000;
  else if (m.u8(prec + 0x11) === 0x14) cap = 100000;
  else cap = 80000;
  if (m.u8(G.B_AE233C) === 1 && club && clubInMajorNation_549e50(m, club) && m.s16(prec + 0xb) > 0x1c52) cap = f32(cap * 1.1);
  if (!(res <= cap)) res = f32((res - cap) * 0.2 + cap);
  return res;
}

/** 0x8655c1–0x865690: en klubløs spiller (staff +0x39 = 0) – faktoren efter tiden siden sidste klub */
function freeAgentFactor(c: CmCtx, staff: number, club: number, prec: number, age: number, res: number, old: boolean): number {
  const m = c.m;
  if (age >= 0x21 && m.u8(staff + 0x22) !== 0 && m.s8(prec + 0x44) + m.s8(staff + 0x58) <= 0x1e && m.s32(staff) % 15 !== 0
    && m.s16(club + 0x80) <= 0x1194) return res;
  let x = daysSince_54cdb0(m, G.TODAY, m.s16(staff + 0x3e), m.u16(staff + 0x40));
  if (!old && !(x <= 250)) x = 250;
  x = f32(x);
  if (clubInSeason_547770(c, club)) x += 60;
  if (!old && !(x <= 30)) x = (x - 30) * 0.2 + 30;                          // 0x862720: ingen af de to lofter
  x = 1.375 - x * f32(0.0125);
  if (!(f32(0.2) <= x)) x = f32(0.2);
  return f32(x * res);
}

/** 0x862f4f–0x8635a9: spillerdelen af 0x862720 (den ældre formel) */
function playerWage862(c: CmCtx, staff: number, club: number, cur: number, prec: number, age: number, idf: number, kindB: number, jobB: number,
  L: number, setStatus: (s: number) => void, st0: number): number {
  const m = c.m;
  let cl = st0;
  if (cl === 0xff && club) {                                                // 0x862f76 – som 0x864d40
    const cx = m.s16(club + 0x80), ax = m.s16(prec + 0xb);
    if (ax > cx && age >= 0x18 && age < 0x22) cl = 1;
    else {
      const q75 = cx * 0.75;
      if (ax > q75 && age >= 0x15) cl = 2;
      else if ((ax > cx * 0.5 && age >= 0x11) || age > 0x18) cl = 4;
      else cl = m.s16(prec + 7) * 50 <= q75 ? 6 : 5;
    }
    setStatus(cl);
  }
  // ---- 0x86303d: grundtallet X
  let X: number;
  const s59 = m.s8(staff + 0x59), cur11 = m.s16(prec + 0xb);
  if ((jobB === 0xd || jobB === 0xf) && age > 0x23) X = 10000;
  else if ((cl === 6 || cl === 5) && cur11 < 0x9c4) X = 8500;
  else if ((cl === 6 || cl === 5) && cur11 < 0x186a) X = 10000;
  else if (m.s8(prec + 0x15) >= 0xf) X = cur11 > 0x1a5e ? (s59 < 0xf ? 65000 : 55000) : 50000;
  else if (m.s8(prec + 0x12) >= 0xf || m.s8(prec + 0x14) >= 0xf || m.s8(prec + 0x13) >= 0xf) X = cur11 > 0x1c52 ? (s59 < 0xe ? 52500 : 45000) : 40000;
  else if (m.u8(prec + 0xf) === 0x14) X = m.s16(prec + 0xd) > 0x1e46 && s59 < 3 ? 25000 : 20000;
  else if (m.s8(prec + 0x10) < 0xf && m.u8(prec + 0x11) === 0) X = 25000;
  else X = m.s16(prec + 0xd) > 0x1d4c && s59 < 6 ? 30000 : 25000;
  let res = X;
  // ---- 0x86315d: [0xae233c] = 1 – kun st0
  if (m.u8(G.B_AE233C) === 1 && X > 11000 && club) {
    if (clubInMajorNation_549e50(m, club)) {
      if (cur11 > 0x1a5e) X = res * (s59 === 1 ? 1.15 : s59 < 6 ? 1.125 : 1.1);
      else if (cur11 > 0x109a) X = res * 1.025;
    }
  }
  // ---- 0x8631d9: omdømmet n
  const di = m.s16(prec + 9), si = m.s16(prec + 0xd);
  let cx = cur11;
  if (di > cx) cx = di;
  if (si > cx) cx = si;
  if (kindB === 1) { if (cx < 0x1c52) cx = 0x1c52; }
  else if (kindB === 2) { if (cx < 0x1a5e) cx = 0x1a5e; }
  const total = di + cur11 + si + 4 * cx + 50 * (m.s16(prec + 7) + m.s16(prec + 5));
  let n = (Math.trunc(total / 9) + ftol(idf * 8 - 4)) | 0;
  const sn = m.u32(staff + 0x1a), cn = club ? m.u32(club + 0x53) : 0;
  let skipMin = false;
  if (sn && cn && m.u8(cn + 0x76) !== m.u8(sn + 0x76)) {
    const cl76 = m.u8(cn + 0x76);
    const curN = cur ? m.u32(cur + 0x53) : 0;
    if (!cur || (curN && m.u8(curN + 0x76) !== cl76)) {
      if ((n >>> 0) < 0x5dc) { n = 0x5dc; skipMin = true; }
      else n = ftol((n >>> 0) * 1.05);
    }
  }
  if (!skipMin && (n >>> 0) <= 1) n = 1;
  const sq = Math.imul(n, n) >>> 0;
  const v = X * sq * 1e-8;
  res = f32(v);
  if (v < 175) res = 175;
  // ---- 0x863313: landets faktor
  let al: number;
  const curN = cur ? m.u32(cur + 0x53) : 0;
  if (cur && curN) al = m.u8(curN + 0x7e);
  else if (sn) al = m.u8(sn + 0x7e);
  else al = 3;
  al = (al << 24) >> 24;
  if (al === 2) res = f32(res * 0.75);
  else if (al !== 1) res = f32(res * 0.5);
  // ---- 0x863351: det nuværende omdømme mod klubbens
  if (club && m.s16(club + 0x80) !== 0) {
    let f = m.s16(club + 0x80) < 0x9c4 ? cur11 * f32(0.0004) : cur11 / (500 * L);
    if (f < 0.85) f = f32(0.85);
    if (!(f <= 1.15)) f = f32(1.15);
    res = f32(f * res);
  }
  // ---- 0x8633bb: niveauets loft
  const hard = (t: number) => { if (!(res <= t)) res = f32(t); };
  const softT = (t: number) => { if (!(res <= t)) res = f32((res - t) * 0.1 + t); };
  if (L < 10) hard(2500 * L);
  else if (L < 15) hard(2750 * L);
  else {
    const nn = m.u32(club + 0x53);
    const id = nn ? m.s32(nn) : 0;
    if (nn && (id === NAT(m, 0x9cf2e4) || id === NAT(m, 0x9cf488) || id === NAT(m, 0x9cf360))) {
      if (m.u8(club + 0x82) !== 0) softT(3250 * L);
      else { const t = 5000 * L; if (t < res) softT(t); }
    } else hard(3250 * L);
  }
  // ---- 0x863472: evneloftet
  let cap: number;
  if (m.u8(prec + 0x15) === 0x14) cap = 85000;
  else if (m.u8(prec + 0x14) === 0x14 || m.u8(prec + 0x13) === 0x14) cap = 75000;
  else if (m.u8(prec + 0x12) === 0x14) cap = 65000;
  else if (m.u8(prec + 0x11) === 0x14) cap = 50000;
  else cap = 40000;
  if (m.u8(G.B_AE233C) === 1 && res > 11000 && club && clubInMajorNation_549e50(m, club) && cur11 > 0x1c52) cap = f32(cap * 1.1);
  if (!(res <= cap)) res = f32((res - cap) * 0.2 + cap);
  return res;
}
