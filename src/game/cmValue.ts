// Originalens værdiformel 0x4d0c60 CONTRACT_MANAGER::calc_player_value(staff, klub, flag, bedømmelse, …) håndporteret (14/11-2026) med de kaldte
// 0x5407e0 (omdømmet, klubbens manager ser), 0x5408c0 (managerens kendskab til spilleren), 0x53d980 (kender landet), 0x6e86d0 (managerens bud
// på talentet), 0x544410 (ikke-spillerens viste egenskab), 0x8d0a70 (TRANSFER_MANAGER: må spilleren sælges til udlandet) og 0x544670.
// Ovenpå cmMem.ts (originalens adresser) – samme hukommelse som de mekanisk oversatte funktioner (cmGen/f_4d0c60.ts …), og samme x87-semantik
// som oversætteren: mellemregninger i double, `fst dword` = Math.fround, _ftol = trunkering til 32 bit. Kontrolleret bit for bit mod den
// oversatte 0x4d0c60 (scripts/cm-value-check.ts: alle spillere i hukommelsen, flere dage). De sjældne grene (uden klub: rand(3); en ikke-spiller
// uden spillerpost 0x8d0780; 0x53d980's gren for landet [0x9cf434] med kontraktdatoen) kører de oversatte instruktioner (slCall).
import { type CmCtx, type CmMem, G, getContract, ftol } from './cmMem';
import { contractForClub_4cf5f0, hasActiveReleaseClause_867b50 } from './cmContractWant';
import { slCall } from './cmShortlist';

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const f32 = Math.fround;
const clubOfContract = (m: CmMem, k: number) => (m.u32(G.CLUBS) + 0x245 * m.s32(k + 4)) >>> 0;

/** 0x53d980 (person, land, flag): 1 = landet er ikke personens (heller ikke via de britiske/irske og de faste landegrupper), 0 = det er */
export function knowsNation_53d980(c: CmCtx, person: number, nat: number, flag: number): number {
  const m = c.m;
  if (!nat) return 1;
  const pn = m.u32(person + 0x1a);
  if (pn === nat) return 0;
  const p2 = m.u32(person + 0x1e);
  if (p2 === nat) return 0;
  if (!flag) return 1;
  const id = m.s32(nat);
  const a = m.s32(0x9cf2e4), b = m.s32(0x9cf45c), d = m.s32(0x9cf510), e = m.s32(0x9cf3e4), f = m.s32(0x9cf2dc);
  if (id === a || id === b || id === d || id === e || id === f) {
    const x = m.s32(pn);
    if (x === a || x === b || x === d || x === f || x === e) return 0;
    if (p2) { const y = m.s32(p2); if (y === a || y === b || y === d || y === f || y === e) return 0; }
  }
  if (pn) {
    const u = m.s32(0x9cf224), v = m.s32(0x9cf3f4);
    if (id === u || id === v) { const x = m.s32(pn); if (x === u || x === v) return 0; }
  }
  if (id === m.s32(0x9cf360) && pn && m.s32(pn) === m.s32(0x9cf4f0)) return 0;
  if (id === m.s32(0x9cf434)) return slCall(c, 0x53d980, 0, person, nat, flag) | 0;   // 0x53d740 + kontraktens dato – oversat
  return 1;
}

/** 0x5408c0 (staff, manager): 0 samme klub/land som managerens klub, 2 samme nation (eller en han kender), 3 kendt via klubbens land eller
 *  en kendt spiller, 4 ukendt / ingen manager */
export function knowledge_5408c0(c: CmCtx, st: number, mgr: number): number {
  const m = c.m;
  if (!mgr) return 4;
  const sc = m.u32(st + 0x39);
  if (sc) {
    const mc = m.u32(mgr + 0x39);
    if (sc === mc) return 0;
    if (mc && m.u32(sc + 0x53) === m.u32(mc + 0x53)) return 0;
  }
  const sn = m.u32(st + 0x1a);
  if (sn === m.u32(mgr + 0x1a)) return 2;
  if (!knowsNation_53d980(c, mgr, sn, 1)) return 2;
  const sc2 = m.u32(st + 0x39);
  if (sc2 && !knowsNation_53d980(c, mgr, m.u32(sc2 + 0x53), 1)) return 3;
  if (m.s32(mgr) >= m.s32(G.STAFF_COUNT) - 16) return 4;
  const rec = m.u32(st + 0x61);
  if (!rec) return 4;
  const mc = m.u32(mgr + 0x39);
  if (!mc) return 4;
  return m.s16(rec + 9) + m.s16(mc + 0x80) >= 0x36b0 ? 3 : 4;
}

const half = (v: number) => (v - (v >> 31)) >> 1;   // cdq; sub eax, edx; sar eax, 1
/** 0x5407e0 (staff, manager, ikke-spiller): omdømmet, managerens kendskab giver (16 bit) */
export function seenRep_5407e0(c: CmCtx, st: number, mgr: number, np: number): number {
  const m = c.m;
  const k = knowledge_5408c0(c, st, mgr);
  if (np) {
    const r = m.u32(st + 0x69);
    if (k === 4) return m.s16(r + 0xc);
    if (k === 2) return m.s16(r + 8);
    if (k === 0) return m.s16(r + 0xa);
    return s16(k === 3 ? half(m.s16(r + 0xc)) + half(m.s16(r + 8)) : half(m.s16(r + 0xa)) + half(m.s16(r + 8)));
  }
  const r = m.u32(st + 0x61);
  if (k === 4) return m.s16(r + 0xd);
  if (k === 2) return m.s16(r + 9);
  if (k === 0) return m.s16(r + 0xb);
  return s16(half(m.s16(k === 3 ? r + 0xd : r + 0xb)) + half(m.s16(r + 9)));
}

/** 0x544410 (ikke-spillerposten, intern værdi): den viste egenskab 1..20 */
export function shownAttr_544410(m: CmMem, np: number, b: number): number {
  const x = (m.s16(np + 4) + 2 * s8(b)) * 0.05 + 10.0;
  const y = (x * x * 0.1 + x) * 0.3333333333333333 + 0.5;
  return ftol(y > 1.0 ? (y < 20.0 ? y : 20.0) : 1.0);
}

/** 0x6e86d0 (manager, staff, klub, art, omdømme): managerens bud på spillerens talent (16 bit) – frø [0xdd7120] + id'erne */
export function judge_6e86d0(c: CmCtx, mgr: number, st: number, club: number, kind: number, rep: number): number {
  const m = c.m;
  let esi = (m.s32(st) + m.s32(0xdd7120)) | 0;
  let bl = 1;
  let edi: number;
  const r16 = s16(rep);
  if (r16 > -1) edi = Math.trunc(r16 / 50);
  else edi = Math.trunc(seenRep_5407e0(c, st, mgr || m.u32(club + 0xcf), 0) / 50);
  const kb = kind & 0xff;
  let over: number;
  if (kb === 2) over = 0;
  else { const rec = m.u32(st + 0x61), age = m.u8(st + 0x18); over = s8(m.u8(rec + 0xf) === 0x14 ? age - 0x1a : age - 0x17); }
  let np = 0;
  if (mgr) {
    np = m.u32(mgr + 0x69);
    esi = (esi + m.s32(mgr)) | 0;
    if (np && kb === 2 && s16(edi) > 0x32) {
      const v = s8(shownAttr_544410(m, np, m.u8(np + 0x17))) - 10;
      if (((s16(edi) + 10 * v) | 0) > esi % 200) return m.s16(m.u32(st + 0x61) + 5);
    }
  }
  const f = f32((esi % 101) * 0.01);
  if (np) {
    let x: number;
    if (esi % 10 === 0) x = f * 20.0;
    else x = s8(shownAttr_544410(m, np, m.u8(np + (kb === 2 ? 0x17 : 0x18)))) * f;
    bl = s8(ftol(x + 0.5));
    if (bl > 20) bl = 20;
  }
  if (kb !== 2 && over > 0) edi = (edi - over * over) | 0;
  const rem = esi % (2 * (21 - bl));
  const si = s16(rem + bl - 21);
  const base = m.s16(m.u32(st + 0x61) + (kb === 2 ? 5 : 7));
  const w = s8((Math.trunc(bl / 2) + 10) & 0xff);
  const sum = (Math.imul(base + si, w) + Math.imul(20 - w, s16(edi))) | 0;
  return s16(Math.trunc(sum / 20));
}

/** 0x544670 (land): 1 = spilleren må gå (spillets indstilling [0xae233c], landet [0x9cf260], eller verdensdelen [0x9cfa10] uden de fire lande) */
function nationOk_544670(m: CmMem, n: number): number {
  if (m.u8(0xae233c) === 1) return 1;
  const id = m.s32(n);
  if (id === m.s32(0x9cf260)) return 1;
  const ct = m.u32(n + 0x71);
  if (!ct) return 0;
  if (id === m.s32(0x9cf430) || id === m.s32(0x9cf4dc) || id === m.s32(0x9cf2ac) || id === m.s32(0x9cf448)) return 0;
  return m.s32(ct) === m.s32(0x9cfa10) ? 1 : 0;
}
/** 0x8d0a70 (staff) – TRANSFER_MANAGER: kontraktens klubs land via 0x544670 (uden kontrakt, lån eller land: 1) */
function canSell_8d0a70(c: CmCtx, st: number): number {
  const m = c.m;
  if (!st) return slCall(c, 0x8d0a70, m.u32(0xde1f54), st) | 0;
  const k = getContract(m, st);
  m.w32(0xae1080, k);
  if (!k || (m.u8(k + 0x35) & 0x3f) === 5) return 1;
  const cl = clubOfContract(m, k);
  if (!cl) return 1;
  const n = m.u32(cl + 0x53);
  if (!n) return 1;
  return nationOk_544670(m, n);
}

/** 0x4d0c60 (staff, klub, flag, bedømmelse, a5): spillerens værdi i £ (int32). flag ≠ 0: kun landet [0x9cf434]'s loft; flag = 0: kontraktens
 *  restløbetid, landene [0x9cf434]/[0x9cf300]/[0x9cf484]. bedømmelse = −1 (16 bit): managerens bud 0x6e86d0. */
export function playerValue_4d0c60(c: CmCtx, st: number, club: number, flag: number, judge: number, a5: number): number {
  const m = c.m;
  club >>>= 0; st >>>= 0;
  if (!st || !club) return slCall(c, 0x4d0c60, 0, st, club, flag, judge, a5) | 0;   // (uden klub: rand(3))
  // 0x4d0c77: den egne kontrakt (CONTRACT_MANAGER-rækken +0) → [0xae1080] og dens klub
  let k = 0;
  const id = m.s32(st);
  if (id < m.s32(G.STAFF_COUNT)) { const ix = m.s32(m.u32(G.ROWS) + 79 * id); if (ix >= 0) k = (m.u32(m.u32(G.CM)) + 80 * ix) >>> 0; }
  m.w32(0xae1080, k);
  const kclub = k ? clubOfContract(m, k) : 0;
  const K = contractForClub_4cf5f0(c, st, kclub) >>> 0;
  const rec = m.u32(st + 0x61);
  if (!rec) return slCall(c, 0x4d0c60, 0, st, club, flag, judge, a5) | 0;            // ikke-spiller (0x8d0780)
  // positionen: grundbeløb og toppunktsalder
  let base: number, peak: number;
  if (s8(m.u8(rec + 0x15)) >= 15) { base = 13e6; peak = 28; }
  else if (s8(m.u8(rec + 0x14)) >= 15) { base = 11e6; peak = 29; }
  else if (s8(m.u8(rec + 0x13)) >= 15) { base = 10e6; peak = 29; }
  else if (s8(m.u8(rec + 0x12)) >= 15) { base = 9e6; peak = 29; }
  else if (s8(m.u8(rec + 0xf)) === 20) { base = 6e6; peak = 33; }
  else { base = 8e6; peak = 29; }
  const ageB = m.u8(st + 0x18), age = s8(ageB);
  const d = (peak - age) | 0;
  let x = d;
  if (!(x <= 5.0)) x = 8.0 - x * 0.5;
  let mult = x * Math.abs(ftol(x)) * 0.3333333432674408 * 0.08333333333333333 + 1.0;
  if (s8(m.u8(rec + 0xf)) < 15) {
    const A = (s8(m.u8(rec + 0x28)) - 15) * 0.013333333333333334 + 1.0;
    const B = s8(m.u8(rec + 0x27)) * 0.005 + 1.0;
    let P = A * (B * mult);
    P = P * (s8(m.u8(rec + 0x43)) * 0.0033333333333333335 + 1.0);
    P = P * ((s8(m.u8(rec + 0x36)) - 15) * 0.013333333333333334 + 1.0);
    P = P * ((s8(m.u8(rec + 0x2f)) - 15) * 0.013333333333333334 + 1.0);
    mult = P;
  }
  const inj = s8(m.u8(rec + 0x2d));
  const mf = f32((1.33 - inj * inj * 0.05 * 0.034) * mult);
  let cap = m.s16(rec + 9) * 0.0003333333333333333 + 0.17;
  if (cap < 1.1) cap = 1.1;
  const M = f32(mf < 0.01 ? 0.01 : cap < mf ? cap : mf);
  // evnen
  const R = seenRep_5407e0(c, st, m.u32(club + 0xcf), 0);
  const J = (judge & 0xffff) === 0xffff ? judge_6e86d0(c, m.u32(club + 0xcf), st, club, 1, R) : judge;
  let jv = s16(Math.imul(J, 50) & 0xffff);
  if (jv < 0) jv = 0;
  const rc = (R >>> 0) < 0x1388 ? R : 0x1388;
  let ab = ftol((((jv + R) >>> 0) + rc * M) * 0.3333333432674408) >>> 0;
  ab = ab <= 1 ? 1 : ab > 0x2ee0 ? 0x2ee0 : ab;
  const w = m.s16(rec + 0xd);
  if (w > 0x1388 && age < peak + 4) {
    const t = ((ab >>> 1) + w - 0x9c4) >>> 0;
    if (t > ab) ab = t;
    if (w > 0x1f40 && age <= peak) {
      const X = w * 2.25 + (ab >>> 1) - 12500.0;
      ab = ftol(X > ab ? X : ab) >>> 0;
    }
  }
  const V = (Math.imul(ab, ab) >>> 0) * base * 1e-08;
  // landskampene gør spilleren "ældre"
  let eff = ageB;
  const caps = m.u8(st + 0x22), nat = m.u32(st + 0x1a);
  if (caps && nat) {
    const q = s16(Math.trunc(Math.imul(m.s16(nat + 0x8e), caps) / 18));
    const mn = q < d ? q : d;
    eff = (eff + (mn < 0 ? 0 : mn)) & 0xff;
  }
  let ix = s8((peak - eff + 10) & 0xff);
  if (ix < 0) ix = 0; else if (ix >= 20) ix = 19;
  let val = s8(m.u8(0x9a7f30 + ix)) * V * 0.01;
  // klubbens faktor (divisionens / landets omdømme)
  let cf: number;
  const div = m.u32(club + 0x57), cn = m.u32(club + 0x53);
  if (!cn) cf = 1.0;
  else {
    let f = s8(m.u8(cn + 0x7e));
    if (f < 1.0 || f > 3.0) f = 3.0;
    if (div) f = (f + 1.0) * 0.5;
    const t = s8(m.u8(club + 0x64));
    if (t === 2) f = f + f; else if (t === 3) f = f * 7.5;
    const r = div ? m.s16(div + 0x69) : s8(m.u8(cn + 0x85));
    cf = ((Math.imul(r, r) * 25 + m.s16(club + 0x80)) | 0) / (f * 1000.0);
  }
  const t = 20.0 - cf;
  let F = 1.0 - t * t * 0.2 * 0.02;
  if (F < 0.1) F = 0.1; else if (F > 1.1) F = 1.1;
  val = F * val;
  const cf2 = cf * cf;
  if (cf2 * 65000.0 < val) val = val * 0.25 + cf2 * 32500.0;
  const floor = cf * 5000.0;
  if (val < floor) val = floor;
  const n434 = m.s32(0x9cf434);
  if (flag & 0xff) {
    if (cn && m.s32(cn) === n434) {
      if (val < 6000000.0) { const T = (val * 1.6666666666666668e-07 * 0.6 + 0.3) * val; val = 5000.0 <= T ? T : 5000.0; }
      else val = val * 0.9;
    }
    if (K && hasActiveReleaseClause_867b50(m, K)) { const fee = m.s32(K + 0x21); return ftol(val < fee ? val : fee); }
    return ftol(val);
  }
  // flag = 0: kontraktens restløbetid
  let v: number;
  if (!K) { val = 0.0; v = 0.0; }
  else {
    if (canSell_8d0a70(c, st) === 0) v = val;
    else {
      const days = (Math.imul((m.u16(K + 0x2f) - m.u16(0xae2c92)) | 0, 365) + m.s16(K + 0x2d) - m.s16(0xae2c90)) | 0;
      if (days < 1) return 0;
      let e = days, w0 = val;
      if (club === kclub && s8(m.u8(K + 0x3d)) > 0) {
        if ((m.u8(K + 0x35) & 0x3f) === 2) e = (days + 7 * s8(m.u8(K + 0x3d)) + 0xc8) | 0;
        else w0 = val * 0.5;
      }
      const D = e * 0.0014285714285714286;
      if (e < 0x15e) v = w0 * D;
      else { let q = 2.5 - D; if (q < 1.0) q = 1.0; if (q > 2.0) q = 2.0; v = w0 / q; }
      val = v;
    }
    if (v !== 0.0 && cn && m.s32(cn) === n434) {
      if (v < 6000000.0) { const T = v * (v * 1.6666666666666668e-07 * 0.6 + 0.3); v = 5000.0 <= T ? T : 5000.0; }
      else v = v * 0.9;
      val = v;
      return finish(m, K, val, v);
    }
  }
  // 0x4d1480
  if (cn) {
    const nid = m.s32(cn);
    if (nid === m.s32(0x9cf300)) { v = v * 0.8; val = v; }
    else if (nid === m.s32(0x9cf484)) {
      v = v * 0.25; val = v;
      if (v > 125000.0) { v = ftol((v - 125000.0) * 0.5 + 125000.0); val = v; }
      if (v > 250000.0) { v = ftol((v - 250000.0) * 0.5 + 250000.0); val = v; }
    }
  }
  return finish(m, K, val, v);
}
function finish(m: CmMem, K: number, val: number, v: number): number {
  if (!K) return ftol(v);
  if (hasActiveReleaseClause_867b50(m, K)) { const fee = m.s32(K + 0x21); return ftol(val < fee ? val : fee); }
  return ftol(val);
}
