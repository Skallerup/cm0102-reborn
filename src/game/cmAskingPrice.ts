// Udbudsprisen 0x4d1600 CONTRACT_MANAGER::calc_asking_price(sælger, køber, staff, &ud, a4, a5) håndporteret (hastighed, runde 17 – 17/11-2026).
// Erstatter den mekanisk oversatte cmGen/f_4d1600.ts (3.131 x86-instruktioner, 79 × _ftol) for de oversatte kaldere (0x83f3a0, 0x843800, 0x84af00,
// 0x4d42d0 …). Bit for bit som den oversatte – også det, den efterlader:
//   • kører på kalderens delte processortilstand (registreret som delt funktion): de kaldte funktioner kaldes med R.call med præcis de samme
//     argumenter skubbet på stakken i samme dybde og med originalens værdier i ebx/esi/edi/ebp (de kaldte gemmer dem på stakken – efterladt
//     stakindhold, runde 13), og rammens lokale variable skrives i hukommelsen, hvor originalen skriver dem (0x8c bytes under returadressen);
//   • x87-semantikken som oversætteren: mellemregninger i double i samme rækkefølge, _ftol = trunkering til 32 bit (uendelig → 0),
//     float32-konstanterne (0x969078–0x969084) er eksakte; 0x4d3879-grenen efterlader et tal på x87-stakken som originalen;
//   • tilfældige tal: funktionen trækker ingen selv – de kaldte kaldes i samme rækkefølge.
// CM_SL_ASK=0: den oversatte; CM_SL_ASK=check: begge (porten, så den oversatte på samme tilstand og samme tilfældige tal) – svaret, ud-felterne,
// x87-stakken og 0x1100 bytes stak sammenlignes (ASK_STATS).
import type { CmCtx, CmMem } from './cmMem';
import { registerImpl, enter, runOn, crtPow, type X86, type Conv } from './cmGen/x86';
import { GEN } from './cmGen/index';

const ENV = typeof process !== 'undefined' ? process.env ?? {} : {};
const MODE = ENV.CM_SL_ASK ?? '1';
/** kontroltilstandens tællere */
export const ASK_STATS = { n: 0, bad: 0, ts: 0, tsMs: 0, genMs: 0, nested: 0 };

/** CM_SL_CALLPROF=1: tid pr. kaldt funktion (ms) */
export const PROF: Map<number, number> | null = ENV.CM_SL_CALLPROF === '1' ? new Map() : null;
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
/** _ftol som x86.ts' R.ftol (eax): trunkering, de nederste 32 bit; uendelig/NaN → 0 */
const ft = (x: number) => { const t = Math.trunc(x); return Number.isFinite(t) ? t | 0 : 0; };
/** idiv-trunkering med magiske tal som MSVC (imul; sar; +fortegn) – kun for |a| < 2^31 og små divisorer: præcis C-division */
const tdiv = (a: number, b: number) => (a / b) | 0;
/** hi32(a · m) som imul (a 16 bit, m signed 32 bit – produktet er eksakt i double) */
const imulHi = (a: number, m: number) => Math.floor((a | 0) * (m | 0) / 4294967296) | 0;
/** edx efter _ftol (de øverste 32 bit af trunkeringen) */
const ftHi = (x: number) => { const t = Math.trunc(x); if (!Number.isFinite(t)) return 0; if (Math.abs(t) < 2 ** 31) return t < 0 ? -1 : 0; return Number(BigInt.asUintN(64, BigInt(t)) >> 32n) | 0; };

const CV = (n: number, thisEcx: boolean, calleeClean: boolean): Conv => ({ n, thisEcx, calleeClean });
const C_418F60 = CV(2, true, true), C_456740 = CV(2, true, true), C_4B02E0 = CV(2, false, false), C_4CF5F0 = CV(2, true, true);
const C_4D0C60 = CV(5, false, true), C_53CA90 = CV(1, false, false), C_540A50 = CV(3, false, false), C_5431E0 = CV(2, false, false);
const C_5444A0 = CV(2, false, false), C_544520 = CV(2, false, false), C_544600 = CV(2, false, false), C_54CDB0 = CV(2, true, true);
const C_5986B0 = CV(0, true, false), C_5A0590 = CV(1, true, true), C_5FD210 = CV(1, false, true), C_5FEA50 = CV(2, false, true);
const C_600A50 = CV(5, false, false), C_6E86D0 = CV(5, true, false), C_849CE0 = CV(4, true, true), C_8676F0 = CV(0, true, false);
const C_867B50 = CV(0, true, false), C_8C7560 = CV(3, true, true);


// (hastighed) tilstanden pr. kald ligger i modulet, så hjælpefunktionerne ikke laves som lukninger ved hvert kald (porten er ikke reentrant –
// et indlejret kald kører den oversatte)
let busy = false;
let Rx!: X86, m!: CmMem;
let E = 0, F = 0, cEbx = 0, cEsi = 0, cEdi = 0, cEbp = 0, ebx = 0, esi = 0, edi = 0, ebp = 0;
let out = 0, L14 = 0, L44 = 1.0, L54 = 1.0, L6c = 0, L20 = 0, age = 0, b4f = 0, K = 0, buyer = 0;
const pos = (v: number) => (v < 0 ? 0 : v);
const W = (o: number, v: number) => m.w32((F + o) >>> 0, v);
const WD = (o: number, v: number) => m.wf64((F + o) >>> 0, v);
const W8 = (o: number, v: number) => m.w8((F + o) >>> 0, v);
const call = (adr: number, cv: Conv, ecx?: number): number => {
  Rx.ebx = ebx; Rx.esi = esi; Rx.edi = edi; Rx.ebp = ebp;
  if (ecx !== undefined) Rx.ecx = ecx;
  if (PROF) { const t = performance.now(); Rx.call(adr, cv); PROF.set(adr, (PROF.get(adr) ?? 0) + performance.now() - t); }
  else Rx.call(adr, cv);
  if (!cv.calleeClean) Rx.esp = (Rx.esp + 4 * cv.n) | 0;
  return Rx.eax;
};
const push = (v: number) => Rx.push(v >>> 0);
const done = (v: number): number => {
  busy = false;
  Rx.ebx = cEbx; Rx.esi = cEsi; Rx.edi = cEdi; Rx.ebp = cEbp;
  Rx.esp = E | 0;
  Rx.eax = v | 0;
  return v | 0;
};
const orOut = (b: number) => m.w8((out + 1) >>> 0, m.u8((out + 1) >>> 0) | b);
const sameNat = (a: number, b: number) => { const x = m.u32(a + 0x69), y = m.u32(b + 0x69); return x && y && m.u32(x + 0x38) === m.u32(y + 0x38); };
const capS52 = () => {
  if (out) m.w16(out, m.u16(out) & 0x800);
  const x = m.s32(esi + 0x52) * L44;
  L54 = ebx; WD(0x54, L54);
  ebx = ft(x < L54 ? x : L54);
  L14 = ebx; W(0x14, ebx);
};
const mn = (C: number, k: number, o: number): number => {
  const n = (edi + C) | 0;
  W(0x38, n);
  const y = L14 * k;
  WD(o, y);
  return ft(n < y ? n : y);
};
const setEdi = (v: number) => { edi = v | 0; L14 = edi; W(0x14, edi); };
const sameDiv = () => m.u32(ebp + 0x57) === m.u32(buyer + 0x57);
const ageCut = (lim: number) => {
  // 0x4d290b/0x4d314c: unge spillere med høj vurdering
  const t = b4f & 0xf0;
  if (s8(age) < lim && t !== 0x70 && t !== 0x60) {
    const j = s16(L20);
    W(0x28, j);
    if (Math.imul(j, 50) > s16(m.u16(ebp + 0x80))) {
      const q = 0x7d - tdiv(s8(m.u8(K + 0x44)), 4);
      W(0x38, q);
      const x = (j / q) * L14;
      const sub = Math.imul(Math.abs(s8(age) - 20), 0x145855);
      edi = (edi - sub + 0x4c4b40) | 0;
      W(0x38, edi);
      L6c = edi; WD(0x6c, L6c);
      setEdi(ft(x < L6c ? x : L6c));
    }
  }
};
function callLeft(lim: number): boolean {
  // 0x54cdb0 (kontraktens dato +0x2d, i dag): dage tilbage > lim
  push(m.u32(0xae2c94)); push(m.u32(0xae2c90));
  return call(0x54cdb0, C_54CDB0, (K + 0x2d) >>> 0) > lim;
}

/** 0x4d1600 på den delte processortilstand R (esp = returadressen); svaret i eax */
function asking(R: X86): number {
  busy = true;
  Rx = R; m = R.m;
  E = R.esp >>> 0; F = (E - 0x8c) >>> 0;
  cEbx = R.ebx; cEsi = R.esi; cEdi = R.edi; cEbp = R.ebp;
  const self = R.ecx;
  ebx = cEbx; esi = cEsi; edi = cEdi; ebp = cEbp;
  // kald som den oversatte: argumenterne skubbes af kalderen (R.push), registrene som originalens
  // prolog: sub esp, 0x7c; push ebx/ebp/esi/edi
  m.w32((F + 0xc) >>> 0, cEbx); m.w32((F + 8) >>> 0, cEbp); m.w32((F + 4) >>> 0, cEsi); m.w32(F, cEdi);
  R.esp = F | 0;
  ebp = m.u32(E + 4);                                  // sælger
  W(0x2c, self);
  let L4c = 1.0, L74 = 1.0;
  L44 = 1.0; L54 = 1.0;
  WD(0x4c, 1.0); WD(0x74, 1.0); WD(0x44, 1.0); WD(0x54, 1.0);
  if (!ebp) return done(0);
  esi = m.u32(E + 0xc);                                // staff
  push(ebp); push(esi);
  edi = call(0x4cf5f0, C_4CF5F0, self) >>> 0;          // kontrakten med sælger
  K = edi;
  W(0x18, K);
  if (!K) return done(0);
  if ((m.u8(K + 0x35) & 0x3f) !== 2) return done(0);
  if (m.u8(K + 0x49)) return done(0);
  push(0); push(0); push(1); push(1); push(ebp);
  if (call(0x600a50, C_600A50)) {
    push(ebp);
    let a = call(0x53ca90, C_53CA90);
    push(a);
    if (call(0x5fd210, C_5FD210, m.u32(0xb63c98))) {
      push(ebp);
      a = call(0x53ca90, C_53CA90);
      push(a); push(0);
      if ((call(0x5fea50, C_5FEA50, m.u32(0xb63c98)) & 0xff) && !(m.u8(K + 0x4e) & 4)) return done(m.u32(esi + 0x52));
    }
  }
  // 0x4d16ea: klubbens faktor (divisionens/landets omdømme)
  let st: number;
  {
    const div = m.u32(ebp + 0x57);
    const nat = m.u32(ebp + 0x53);
    if (!nat) st = 1.0;
    else {
      const e = s8(m.u8(nat + 0x7e));
      W(0x34, e);
      let f = e;
      if (f < 1.0 || !(f <= 3.0)) f = 3.0;
      const t = s8(m.u8(ebp + 0x64));
      let r: number;
      if (div) {
        f = (f + 1.0) * 0.5;
        if (t === 2) f = f * 4.0; else if (t === 3) f = f * 7.5;
        r = s16(m.u16(div + 0x69));
      } else {
        if (t === 2) f = f + f; else if (t === 3) f = f * 7.5;
        r = s8(m.u8(nat + 0x85));
      }
      const x = (Math.imul(Math.imul(r, r), 25) + s16(m.u16(ebp + 0x80))) | 0;
      W(0x34, x);
      st = x / (f * 1000.0);
    }
  }
  st = 20.0 - st;
  st = st * st * 0.2 * 0.016666666666666666;
  st = 1.0 - st;
  let L64 = st;
  if (st < 0.1) L64 = 0.1; else if (!(st <= 1.1)) L64 = 1.1;
  WD(0x64, L64);
  // 0x4d185a: alderen
  age = m.u8(esi + 0x18);
  W8(0x10, age);
  if (s8(age) > 0x1c) {
    const d = s8(age) - 0x1c;
    W(0x34, d);
    L74 = crtPow(1.0 - d * 0.1, 2.0);
    WD(0x74, L74);
  }
  // 0x4d188e: kontraktens type (+0x4f) og +0x3d
  b4f = m.u8(K + 0x4f);
  ebx = (ebx & 0xffff0000) | (s8(m.u8(K + 0x3d)) & 0xffff);
  W(0x24, ebx);
  {
    const bx = s16(ebx);
    const typ = b4f >>> 4;
    switch (typ) {
      case 1: esi = pos(75 - bx); break;
      case 2: case 5: esi = pos(50 - bx); break;
      case 3: esi = pos(40 - bx); break;
      case 4: esi = pos(25 - bx); break;
      case 6: esi = pos(-bx); break;
      case 7: ebx = -100; W(0x24, ebx); esi = 0; break;
      default: esi = 0;
    }
  }
  let L24 = ebx;
  // 0x4d1934
  push(1); push(m.u32(E + 0xc));
  if (call(0x418f60, C_418F60, m.u32(0xad9c6c)) & 0xff) {
    push(ebp);
    let a = call(0x53ca90, C_53CA90);
    if (!a) { esi = 0; L24 = -100; W(0x24, L24); ebx &= ~0xff; }
    else {
      push(ebp);
      a = call(0x53ca90, C_53CA90);
      if (!m.u32(a + 0x69)) { esi = 0; ebx &= ~0xff; }
      else {
        push(ebp);
        esi = s16(ebx);
        a = call(0x53ca90, C_53CA90);
        const v = s8(m.u8(m.u32(a + 0x69) + 0x14));
        const lim = (-Math.imul(v, 4) - v) | 0;
        if (esi < lim) { L24 = esi; W(0x24, L24); esi = 0; ebx &= ~0xff; }
        else {
          push(ebp);
          a = call(0x53ca90, C_53CA90);
          const e = (a & 0xffff0000) | (s8(m.u8(m.u32(a + 0x69) + 0x14)) & 0xffff);
          L24 = (-Math.imul(e, 4) - e) | 0;
          W(0x24, L24);
          esi = 0; ebx &= ~0xff;
        }
      }
    }
  } else ebx = (ebx & ~0xff) | m.u8(E + 0x14);
  // 0x4d19cd: kontraktens +0x44 og +0x45
  {
    const b44 = s8(m.u8(K + 0x44));
    W(0x34, b44);
    let f = b44 > 0 ? b44 * 0.0033333333333333335 : b44 * 0.007462686567164179;
    f = f + 1.0;
    f = m.u32(K + 0x45) ? f * 0.8333333333333334 : f * 1.2;
    var L84 = f;
  }
  edi = m.u32(E + 0xc);                                // staff
  WD(0x84, L84);
  const rec = m.u32(edi + 0x61);
  {
    const b = s16(m.u16(rec + 0xb));
    const hi = b < 0 ? -1 : 0;
    const dx = ((hi & 0xffff0000) | ((m.u16(rec + 7) * 0x19) & 0xffff)) | 0;
    const arg = (((b - hi) >> 1) + dx) | 0;
    push(arg); push(1); push(ebp); push(edi); push(m.u32(ebp + 0xcf));
    var J = call(0x6e86d0, C_6E86D0, rec) | 0;
  }
  L20 = J;
  W(0x20, L20);
  push(0); push(J); push(0); push(ebp); push(edi);
  const V = call(0x4d0c60, C_4D0C60, self) | 0;        // spillerens værdi
  L14 = V;
  W(0x14, V); W(0x1c, V);
  if (!V) return done(0);
  edi = m.u32(E + 0x10);                               // &ud
  out = edi;
  // 0x4d1a6f: kontraktens restløbetid
  if (ebx & 0xff) {
    push(0); push(0); push(1); push(0); push(ebp);
    if (!call(0x600a50, C_600A50)) {
      ebx = m.u32(E + 0xc);
      push(0); push(ebx);
      if (!call(0x544520, C_544520)) {
        const t = b4f & 0xf0;
        if (t !== 0x70 && t !== 0x80) {
          const typ = b4f >>> 4;
          const c = typ === 2 ? 6.0 : typ === 3 ? 5.5 : typ === 4 || typ === 5 ? 3.5 : 7.5;
          let d = ((Math.imul((m.u16(0xae2c92) - m.u16(ebx + 0x40)) | 0, 365) - s16(m.u16(ebx + 0x3e))) | 0) + s16(m.u16(0xae2c90)) | 0;
          W(0x28, d);
          if (d < 0) d = 0x79; else if (d > 0x16d) d = 0x16d; else if (d <= 0x79) d = 0x79;
          W(0x28, d);
          L4c = c - d / (365.0 / (c - 1.0));
          WD(0x4c, L4c);
          if (out && !(L4c <= 2.0)) orOut(1);
        }
      }
    }
  }
  // 0x4d1b80
  ebx = L24;
  const bx = s16(ebx);
  {
    const sv = s16(esi);
    W(0x2c, bx);
    esi = ((sv - (sv >> 31)) >> 1) + bx | 0;
    W(0x34, esi);
  }
  let L5c = esi * 0.01167 + 1.4165;
  WD(0x5c, L5c);
  if (bx >= 0x32) {
    push(0); push(0); push(1); push(0); push(ebp);
    if (!call(0x600a50, C_600A50)) {
      const q = tdiv(Math.imul(esi, esi), 50);
      W(0x34, q);
      L5c = (q * 0.006 + 0.7) * L5c;
      WD(0x5c, L5c);
    }
  }
  if (out) { if (bx > 0x3c) orOut(2); else if (bx > 0x14) orOut(4); }
  // 0x4d1c15: klubbens økonomi mod omdømmetabellen 0x9a7f48
  push(ebp);
  const fin = call(0x5a0590, C_5A0590, m.u32(0xae2a38)) >>> 0;
  let L34 = fin;
  W(0x34, fin);
  let L7c = fin ? m.s32(fin + 4) * 4294967296 + m.u32(fin) : 0.0;
  WD(0x7c, L7c);
  let Q: number;
  {
    const T = m.f64((0x9a7f48 + 8 * tdiv(s16(m.u16(ebp + 0x80)), 500)) >>> 0);
    if (L7c < T) {
      const r = (L7c - T) / T;
      let x = L7c * 1.25e-06;
      if (!(0.0 <= x)) x = 0.0; else if (10.0 < x) x = 10.0;
      Q = (r + x) / (x + 1.0);
    } else Q = L7c / T;
  }
  // 0x4d1cbe
  L6c = bx;
  WD(0x6c, L6c);
  {
    const n = m.u8((Math.imul(m.s32(m.u32(E + 0xc)), 79) + m.u32(0xae2d0c) + 0xb) >>> 0) & 0xf;
    W(0x2c, n * n);
    st = Q + n * n * 0.05 + L6c * 0.002;
  }
  let L38 = st > 1.0 ? st * 0.25 + 0.75 : st * 0.2125 + 0.7875;
  {
    const a = L6c * 0.0025 + 0.5;
    if (!(a <= L38)) L38 = a;
    else if (2.5 < L38) L38 = 2.5;
  }
  WD(0x38, L38);
  // 0x4d1d74: køberen
  ebx = m.u32(E + 8);
  if (ebx) {
    esi = L24;
    if (s16(esi) > 0x14 && !m.u32(K + 0x45)) esi = ft(L6c * 1.5);
    const bid = m.s32(ebx), p1 = m.s32(0x9d0118), p2 = m.s32(0x9d011c);
    const si = s16(esi);
    if ((bid === p1 || bid === p2) && (m.s32(ebp) === p1 || m.s32(ebp) === p2)) {
      W(0x2c, si);
      st = si * 0.04 + 2.3; if (2.3 > st) st = 2.3;
      L44 = st; WD(0x44, L44);
      if (out && !(st < 1.3)) orOut(8);
    } else {
      push(ebp); push(ebx);
      if (call(0x4b02e0, C_4B02E0) & 0xff) {
        W(0x2c, si);
        if (sameNat(ebx, ebp)) { st = si * 0.03333333333333333 + 2.0; if (2.0 > st) st = 2.0; }
        else { st = si * 0.02 + 1.6; if (1.3 > st) st = 1.3; }
        L44 = st; WD(0x44, L44);
        if (out && !(st < 1.3)) orOut(8);
      } else if (ebx === m.u32(ebp + 0xb3) || ebx === m.u32(ebp + 0xb7) || ebx === m.u32(ebp + 0xbb)) {
        W(0x2c, si);
        if (sameNat(ebx, ebp)) { st = si * 0.02 + 1.6; if (1.3 > st) st = 1.3; }
        else { st = si * 0.01 + 1.3; if (1.3 > st) st = 1.3; }
        L44 = st; WD(0x44, L44);
        if (out && !(st < 1.3)) orOut(8);
      } else {
        const dv2 = m.u32(ebx + 0x57);
        if (dv2 && m.s32(dv2) !== m.s32(0x9cf764) && dv2 === m.u32(ebp + 0x57)) {
          W(0x2c, si);
          st = si * 0.005 + 1.0; if (1.0 > st) st = 1.0;
          L44 = st; WD(0x44, L44);
          if (out && !(st <= 1.3)) orOut(0x10);
        }
      }
    }
  }
  st = L44;
  // 0x4d2006: omdømmet mod vurderingen
  {
    const r = (tdiv(s16(m.u16(ebp + 0x80)), 50) + 1) << 16 >> 16;
    W(0x28, r);
    const dx = tdiv(r * 17, 20);
    const t = b4f & 0xf0;
    if (out && t === 0x50) orOut(0x20);
    else if (s16(L20) > s16(dx) && s8(m.u8(m.u32(E + 0xc) + 0x18)) < 0x19 && ((ebx = (ebx & ~0xff) | b4f), (b4f >>> 4) < 7)) {
      if (out && t === 0x60) orOut(0x20);
      else {
        const diff = s16(L20) - s16(dx);
        W(0x2c, diff);
        const e = s16(ft(diff * (r * 0.005)));
        W(0x2c, e);
        let A = e * 0.04 + 1.0;
        if (A < 1.0) A = 1.0;
        L54 = A; WD(0x54, L54);
        ebx = (ebx & ~0xff) | t;
        if (t === 0x40) { L5c = L5c * A; WD(0x5c, L5c); }
        if (out && !(A <= 1.6)) orOut(0x20);
      }
    }
  }
  // 0x4d2124: loftet over faktorerne
  {
    let P = st * st * L4c;
    if (!(4.25 <= P)) P = 4.25; else if (10.0 < P) P = 10.0;
    const prod = L38 * L5c * L84 * L54 * L44 * L4c;
    L5c = P < prod ? P : prod;
    const c6 = L38 * 6.0;
    if (!(L5c <= c6)) L5c = c6;
    WD(0x5c, L5c);
  }
  // 0x4d21bd: spillerens omdømme mod sælgers
  let L28: number;
  {
    const r9 = s16(m.u16(rec + 9)), rb = s16(m.u16(rec + 0xb)), rd = s16(m.u16(rec + 0xd));
    W(0x2c, rb); W(0x2c, r9); W(0x2c, rd);
    const pr = s16(ft((rb + r9) * 0.3 + rd * 0.4));
    const sr = s16(m.u16(ebp + 0x80));
    W(0x2c, pr); W(0x38, sr);
    L28 = Math.imul((sr + pr - 0xfa0) | 0, 225);
    W(0x28, L28);
    if (L28 < 0x249f0) L28 = 0x249f0; else if (L28 > 0x1e8480) L28 = 0x1e8480;
    W(0x28, L28);
    const B = L6c * 0.5 + 50.0;
    const diff = pr - (sr * 1.2 - 2000.0);
    let L2c = (((diff * (pr * 5e-08) + 1.0) * B + 100.0) - B) * 0.01;
    WD(0x2c, L2c);
    if (!(L2c <= 1.0)) { L2c = crtPow(L2c, 5.0); WD(0x2c, L2c); }
    if (!(1.0 <= L2c)) { L2c = 1.0; WD(0x2c, L2c); }
    else if (!(3.0 >= L2c)) { L2c = 3.0; WD(0x2c, L2c); }
    var L2cD = L2c;
  }
  // 0x4d22fa: tillægget
  {
    const A38 = ft(L28 * L5c);
    W(0x38, A38);
    L54 = V; WD(0x54, L54);
    const D = ft(V * L5c - V);
    W(0x28, D);
    if (D < 0) {
      L84 = V * -0.4; WD(0x84, L84);
      esi = ft(D <= L84 ? L84 : D);
      W(0x28, esi);
      if (esi < -3000000) esi = -3000000;
    } else {
      L84 = A38; WD(0x84, L84);
      const x = D * L4c;
      const e = ft(x < L84 ? x : L84);
      W(0x28, e);
      let s = L4c * L4c;
      if (25.0 < s) s = 25.0;
      esi = ft(s * L64 * L74 * e);
      W(0x28, esi);
    }
    if (esi > 0) {
      push(0); push(m.u32(E + 0xc));
      if (call(0x544520, C_544520)) esi = ft(m.s32(F + 0x28) * 0.5);
    }
    if (esi > 50000000) esi = 50000000;
  }
  ebx = (L14 + esi) | 0;
  L14 = ebx; W(0x14, ebx);
  if (!(L2cD <= 1.0)) {
    let e = ft(ebx * L2cD - ebx);
    W(0x28, e);
    if (e > 5000000) { e = ft(e * 0.625 + 1875000.0); W(0x28, e); }
    if (e > 10000000) { e = ft(e * 0.125 + 8750000.0); W(0x28, e); }
    ebx = (ebx + ft(L64 * L74 * e)) | 0;
    L14 = ebx; W(0x14, ebx);
  }
  if (ebx < 1000) { ebx = 1000; L14 = ebx; W(0x14, ebx); }
  // 0x4d24aa: arbejdstilladelsen / klubbens loft
  esi = m.u32(E + 0xc);
  push(0); push(ebp); push(esi);
  if (call(0x8c7560, C_8C7560, m.u32(0xde1f54))) {
    if (!(ebx < V)) { ebx = V; L14 = ebx; W(0x14, ebx); }
  } else {
    push(0); push(esi);
    if (call(0x544520, C_544520)) capS52();
    else {
      const sc = m.u32(esi + 0x39);
      if (sc) {
        push(1); push(F + 0x40); push(sc);
        if (call(0x540a50, C_540A50) && !m.s32(F + 0x40)) {
          const t = b4f & 0xf0;
          if (t !== 0x10 && t !== 0x50 && t !== 0x20 && t !== 0x30) capS52();
        }
      }
    }
  }
  // 0x4d2585
  push(0); push(0); push(1); push(0); push(ebp);
  if (!call(0x600a50, C_600A50) && out && (m.u16(out) & 0x800) && s16(m.u16(ebp + 0x80)) > 0x109a && s8(m.u8(esi + 0x18)) > 0x12 && (b4f & 0xf0) !== 0x70) {
    edi = L34;
    if ((call(0x5986b0, C_5986B0, edi) & 0xff) !== 0xff && (call(0x5986b0, C_5986B0, edi) & 0xff) !== 0xfe) {
      const lim = Math.imul((s16(m.u16(ebp + 0x80)) + 0x61a8) | 0, 100);
      if (ebx < lim) { L14 = Math.imul((s16(m.u16(m.u32(esi + 0x39) + 0x80)) + 0x61a8) | 0, 100); W(0x14, L14); }
    }
  }
  // 0x4d261f: højst max(3·værdi, værdi + 5 mio.) · faktorerne
  {
    const a3 = Math.imul(V, 3), a5 = (V + 5000000) | 0;
    const mx = a3 > a5 ? a3 : a5;
    W(0x28, a3); if (!(a3 > a5)) W(0x28, a5);
    const cap = mx * L44 * L4c;
    edi = ft(L14 < cap ? L14 : cap);
    L14 = edi; W(0x14, edi);
  }
  if (edi > V) {
    const k45 = m.u32(K + 0x45);
    if (k45 & 0x16b) {
      const days = ((Math.imul((m.u16(K + 0x2f) - m.u16(0xae2c92)) | 0, 365) + s16(m.u16(K + 0x2d))) | 0) - s16(m.u16(0xae2c90)) | 0;
      W(0x28, days);
      esi = days >= 0x16d ? V : ft(days * 0.0027397260273972603 * V);
      W(0x2c, esi);
      let x = days * 0.0027 - 0.485;
      if (!(0.0 <= x)) x = 0.0; else if (1.0 < x) x = 1.0;
      L84 = esi; WD(0x84, L84);
      const c1 = ft((1.0 - x) * L84 + L14 * x);
      L14 = c1; W(0x14, c1);
      let Y = L7c * L44; Y = Y + Y;
      if (!(1.0 <= Y)) Y = 1.0;
      esi = (esi + c1) | 0;
      W(0x38, esi);
      let Z = esi / Y;
      if (!(1.0 <= Z)) Z = 1.0; else if (3.0 < Z) Z = 3.0;
      const w = 1.375 - Z * 0.375;
      edi = ft((1.0 - w) * L84 + c1 * w);
      L14 = edi; W(0x14, edi);
    }
  }
  // 0x4d27e7: pladsen på ønskelisten og de store klubbers tillæg (0x4d2806–0x4d3884)
  push(1); push(0); push(m.u32(E + 0xc)); push(ebp);
  esi = call(0x849ce0, C_849CE0, m.u32(m.u32(0xde1f54) + 0x856)) >>> 0;
  const slot = esi;
  W(0x2c, slot);
  const staff = m.u32(E + 0xc);
  buyer = m.u32(E + 8);
  let tail = 0;   // 0 = 0x4d3886, 1 = 0x4d3880 (edi = eax), 2 = 0x4d382a
  let eaxT = 0;
  big: {
    const rep = s16(m.u16(ebp + 0x80));
    if (rep <= 0xfa0) { tail = slot ? 0 : 2; break big; }
    const nat = m.u32(ebp + 0x53);
    if (!nat) { tail = slot ? 0 : 2; break big; }
    const nid = m.s32(nat);
    ebx = m.s32(0x9cf2e4);
    if (nid !== ebx && nid !== m.s32(0x9cf360) && nid !== m.s32(0x9cf488) && nid !== m.s32(0x9cf300) && nid !== m.s32(0x9cf314) &&
        nid !== m.s32(0x9cf45c) && nid !== m.s32(0x9cf4f8) && nid !== m.s32(0x9cf36c) && nid !== m.s32(0x9cf338) && nid !== m.s32(0x9cf434)) { tail = slot ? 0 : 2; break big; }
    if (!(s8(m.u8(nat + 0x85)) > 0xc) && rep < 0x1b58) { tail = slot ? 0 : 2; break big; }
    ebx = L34;
    if (!ebx) { tail = slot ? 0 : 2; break big; }
    if ((call(0x5986b0, C_5986B0, ebx) & 0xff) === 0xff) { tail = slot ? 0 : 2; break big; }
    if ((call(0x5986b0, C_5986B0, ebx) & 0xff) === 0xfe) { tail = slot ? 0 : 2; break big; }
    ebx = staff;
    push(0); push(ebx);
    if (call(0x5444a0, C_5444A0)) { tail = slot ? 0 : 2; break big; }
    push(0); push(ebx);
    if (call(0x544600, C_544600)) { tail = slot ? 0 : 2; break big; }
    if (!(slot && m.s32(slot + 0xf) === m.s32(staff)) && !(m.u8(staff + 0x6d) === 2 && m.s32(ebp + 0x1db) > -1)) {
      // 0x4d313a: en plads, men ikke til spilleren
      if (!slot) { tail = 2; break big; }
      if (m.s32(slot + 0xf) !== -1) break big;
      ebx = (ebx & ~0xff) | age;
      ageCut(0x16);
      const t = b4f & 0xf0, k45 = m.u32(K + 0x45), b44 = s8(m.u8(K + 0x44));
      if (rep <= 0x1a5e && !((esi = m.u32(ebp + 0x57)) && s16(m.u16(esi + 0x69)) > 0xf)) {
        if (k45 && b44 <= 0) break big;
        if (t === 0x10) { setEdi(mn(0x3d090, 1.25, 0x44)); if (!buyer || esi !== m.u32(buyer + 0x57)) break big; eaxT = mn(0xc350, 1.05, 0x4c); tail = 1; break big; }
        if (t !== 0x20 && !(s8(m.u8(K + 0x3d)) > 0x28 - s8(m.u8(staff + 0x59)))) break big;
        setEdi(mn(0x186a0, 1.1, 0x44)); if (!buyer || esi !== m.u32(buyer + 0x57)) break big; eaxT = mn(0x61a8, 1.025, 0x4c); tail = 1; break big;
      }
      esi = K;
      if (k45 && !(b44 > 0)) {
        if ((k45 & 0x101) && callLeft(0x1a9)) {
          if (t === 0x10) { setEdi(mn(0x7a120, 1.25, 0x44)); if (!buyer || !sameDiv()) break big; eaxT = mn(0x3d090, 1.1, 0x44); tail = 1; break big; }
          if (t === 0x20) { setEdi(mn(0xf4240, 1.2, 0x6c)); if (!buyer || !sameDiv()) break big; eaxT = mn(0x30d40, 1.05, 0x4c); tail = 1; break big; }
          if (t === 0x30) { setEdi(mn(0xb71b0, 1.15, 0x4c)); if (!buyer || !sameDiv()) break big; eaxT = mn(0x249f0, 1.02, 0x4c); tail = 1; break big; }
          break big;
        }
        if (!callLeft(0xe1)) break big;
        if (t === 0x70) break big;
        const b59 = m.u8(staff + 0x59);
        if (!(s8(m.u8(staff + 0x5b)) + s8(b59) > 10)) break big;
        const r2 = m.u32(staff + 0x61);
        if (!r2 || !(s16(m.u16(r2 + 0xb)) > 0x1482)) break big;
        if (!(s8(m.u8(K + 0x3d)) > s8((10 - b59) & 0xff))) break big;
        if (!(s8(age) > 0x16) || s8(age) >= 0x1f) break big;
        setEdi(mn(0xb71b0, 1.15, 0x4c)); if (!buyer || !sameDiv()) break big; eaxT = mn(0x249f0, 1.02, 0x4c); tail = 1; break big;
      }
      if (t === 0x10) { const a = (edi + 0x1e8480) | 0, d = (edi + edi) | 0; setEdi(a >= d ? d : a); if (!buyer || !sameDiv()) break big; eaxT = mn(0x186a0, 1.1, 0x44); tail = 1; break big; }
      if (t === 0x20) { setEdi(mn(0x16e360, 1.5, 0x4c)); if (!buyer || !sameDiv()) break big; eaxT = mn(0x124f8, 1.075, 0x6c); tail = 1; break big; }
      if (t === 0x30) { setEdi(mn(0xf4240, 1.5, 0x4c)); if (!buyer || !sameDiv()) break big; eaxT = mn(0x4e20, 1.02, 0x4c); tail = 1; break big; }
      break big;
    }
    // 0x4d290b: pladsen er spillerens (eller han er på vej)
    ebx = K;
    ageCut(0x19);
    const t = b4f & 0xf0, k45 = m.u32(K + 0x45), b44 = s8(m.u8(K + 0x44));
    if (rep <= 0x1a5e && !((esi = m.u32(ebp + 0x57)) && s16(m.u16(esi + 0x69)) > 0xf)) {
      if (k45 && !(b44 > 0)) {
        if (!(k45 & 0x101) || !callLeft(0x1a9)) break big;
        if (t === 0x10) { setEdi(mn(0x5b8d8, 1.25, 0x44)); if (!buyer || !sameDiv()) break big; eaxT = mn(0xc350, 1.05, 0x4c); tail = 1; break big; }
        if (t === 0x20) { setEdi(mn(0x30d40, 1.2, 0x6c)); if (!buyer || !sameDiv()) break big; eaxT = mn(0x927c, 1.025, 0x4c); tail = 1; break big; }
        break big;
      }
      if (t === 0x10) { setEdi(mn(0xb71b0, 1.75, 0x4c)); if (!buyer || esi !== m.u32(buyer + 0x57)) break big; eaxT = mn(0x186a0, 1.1, 0x44); tail = 1; break big; }
      if (t === 0x20) { setEdi(mn(0x61a80, 1.4, 0x6c)); if (!buyer || esi !== m.u32(buyer + 0x57)) break big; eaxT = mn(0x124f8, 1.075, 0x6c); tail = 1; break big; }
      if (t === 0x30) { setEdi(mn(0x249f0, 1.15, 0x4c)); if (!buyer || esi !== m.u32(buyer + 0x57)) break big; eaxT = mn(0x61a8, 1.025, 0x4c); tail = 1; break big; }
      break big;
    }
    // 0x4d2cf5: de store klubber
    if (k45 && !(b44 > -50)) {
      if ((k45 & 0x101) && callLeft(0x1a9)) {
        if (t === 0x10) {
          const a = (edi + 0x2625a0) | 0, d = (edi + edi) | 0; setEdi(a >= d ? d : a);
          if (!buyer || !sameDiv()) break big;
          const a2 = (edi + 0xf4240) | 0, d2 = (edi + edi) | 0; edi = a2 < d2 ? a2 : d2; tail = 3; break big;
        }
        if (t === 0x20) { setEdi(mn(0x16e360, 1.5, 0x4c)); if (!buyer || !sameDiv()) break big; eaxT = mn(0xb71b0, 1.75, 0x4c); tail = 1; break big; }
        if (t === 0x30) { setEdi(mn(0xf4240, 1.25, 0x44)); if (!buyer || !sameDiv()) break big; eaxT = mn(0x61a80, 1.25, 0x44); tail = 1; break big; }
        break big;
      }
      // 0x4d2eaa
      if (!buyer) break big;
      if (!callLeft(0xe1)) break big;
      if (t === 0x70) break big;
      if (!(s8(m.u8(staff + 0x5b)) > 5)) break big;
      const b59 = m.u8(staff + 0x59);
      if (!(s8(b59) > 5)) break big;
      const r2 = m.u32(staff + 0x61);
      if (!r2 || !(s16(m.u16(r2 + 0xb)) > 0x186a)) break big;
      if (!(s8(m.u8(K + 0x3d)) > s8((-b59) & 0xff))) break big;
      if (!(s8(age) > 0x16) || s8(age) >= 0x1f) break big;
      setEdi(mn(0xf4240, 1.25, 0x44));
      if (!sameDiv()) break big;
      push(buyer); push(ebp);
      if (!(call(0x4b02e0, C_4B02E0) & 0xff)) break big;
      eaxT = mn(0x61a80, 1.25, 0x44); tail = 1; break big;
    }
    if (t === 0x10) {
      const a = (edi + 0x4c4b40) | 0, d = Math.imul(edi, 5); setEdi(a >= d ? d : a);
      if (!buyer || !sameDiv()) break big;
      const a2 = (edi + 0xf4240) | 0, d2 = (edi + edi) | 0; edi = a2 < d2 ? a2 : d2; tail = 3; break big;
    }
    if (t === 0x20) { setEdi(mn(0x2625a0, 2.5, 0x84)); if (!buyer || !sameDiv()) break big; eaxT = mn(0xb71b0, 1.75, 0x4c); tail = 1; break big; }
    if (t === 0x30) {
      const a = (edi + 0x16e360) | 0, d = (edi + edi) | 0; setEdi(a >= d ? d : a);
      if (!buyer || !sameDiv()) break big;
      eaxT = mn(0x61a80, 1.4, 0x6c); tail = 1; break big;
    }
    break big;
  }
  if (tail === 2) {
    // 0x4d382a: ingen plads – mellem værdien og prisen
    if (edi > V) {
      if (s16(L24) < 0x3c) eaxT = ft(V * 0.67 + L14 * 0.33);
      else {
        const w = 1.27 - L6c * 0.01;
        eaxT = ft((1.0 - w) * L14 + V * w);
        R.fpush(w);                                     // (0x4d3879: w bliver liggende på x87-stakken)
      }
      tail = 1;
    } else tail = 0;
  }
  if (tail === 1) { edi = eaxT; L14 = edi; W(0x14, edi); }
  else if (tail === 3) { L14 = edi; W(0x14, edi); }
  // 0x4d3886: talentfulde unge spillere (vurdering > 110)
  if (s8(age) < 0x18 && m.u32(E + 0x18)) {
    esi = L20;
    if (s16(esi) > 0x6e && m.u32(m.u32(E + 4) + 0x53) && (b4f & 0xf0) !== 0x70) {
      ebp = staff;
      L34 = 0; W(0x34, 0);
      const r = m.u32(staff + 0x61);
      let ecx = 0;
      if (m.u8(r + 0xf) !== 0x14) {
        W(0x38, s8(age));
        ebx = (ebx & ~0xff) | ((m.u8(r + 0x36) + m.u8(r + 0x1b)) & 0xff);
        const r3c = s8(m.u8(r + 0x3c)), r3d = s8(m.u8(r + 0x3d)), r3f = s8(m.u8(r + 0x3f)), r44 = s8(m.u8(r + 0x44)), r2e = s8(m.u8(r + 0x2e));
        W(0x38, r3c);
        L7c = 2.6 - s8(age) * 0.07;
        WD(0x7c, L7c);
        W(0x38, r3d); W(0x38, r3f); W(0x38, r44); W(0x38, r2e);
        const a13 = ft(((r3c * 1.2 + r3d) * L7c + r3f * 0.8 + r44 * 1.2) + r2e * 0.75) & 0xff;
        push(0xb); push(ebp);
        W8(0x13, a13);
        const x0b = s8(call(0x5431e0, C_5431E0) & 0xff);
        W(0x38, x0b);
        let a11 = ft(x0b * L7c) & 0xff;
        W8(0x11, a11);
        if (s8(a11) >= 0x14) { a11 = 0x14; W8(0x11, a11); }
        push(0xc); push(ebp);
        const x0c = s8(call(0x5431e0, C_5431E0) & 0xff);
        W(0x38, x0c);
        const fe = ft(x0c * L7c), feHi = ftHi(x0c * L7c);
        let al: number, eax: number;
        if (s8(fe & 0xff) < 0x14) { al = fe & 0xff; W8(0x12, al); eax = fe; }
        else { W8(0x12, 0x14); al = 0x14; eax = (fe & ~0xff) | 0x14; }
        const a12 = al;
        const bl = s8(ebx & 0xff);
        const J0 = L20;
        let edx = feHi;
        const sq = (v: number) => Math.imul(v, v);
        if (bl === 0x28) {
          const c = s8(a13);
          if (c > 0x55) esi = (J0 + 15) | 0; else if (c > 0x4b) esi = (J0 + 10) | 0; else if (c > 0x41) esi = (J0 + 8) | 0;
          else if (c > 0x32) esi = (J0 + 5) | 0; else if (c > 0x23) esi = (J0 + 3) | 0;
          if (s8(a11) > 0xf) { edx = (edx & 0xffff0000) | (s8(a11) & 0xffff); ecx = (edx - 0xd) | 0; esi = (esi + sq(ecx)) | 0; }
          if (s8(al) > 0xf) { eax = (eax & 0xffff0000) | (s8(al) & 0xffff); eax = (eax - 0xe) | 0; esi = (esi + sq(eax)) | 0; }
        } else if (bl > 0x22) {
          const c = s8(a13);
          if (c > 0x4b) esi = (J0 + 8) | 0; else if (c > 0x41) esi = (J0 + 5) | 0; else if (c > 0x32) esi = (J0 + 3) | 0; else if (c > 0x23) esi = (J0 + 1) | 0;
          if (s8(a11) > 0xf) { edx = (edx & 0xffff0000) | (s8(a11) & 0xffff); ecx = (edx - 0xf) | 0; esi = (esi + sq(ecx)) | 0; }
          if (s8(al) > 0xf) { const q = sq(s8(a12) - 15); W(0x38, q); esi = (esi + ft(q * 0.8)) | 0; }
        } else if (bl > 0x19) {
          const c = s8(a13);
          if (c > 0x4b) esi = (J0 + 5) | 0; else if (c > 0x41) esi = (J0 + 3) | 0; else if (c > 0x32) esi = (J0 + 1) | 0; else if (c < 0x23) esi = (J0 - 3) | 0;
          if (s8(a11) > 0xf) { const q = sq(s8(a11) - 15); W(0x38, q); esi = (esi + ft(q * 0.8)) | 0; }
          if (s8(a12) > 0xf) { const q = sq(s8(a12) - 15); W(0x38, q); esi = (esi + ft(q * 0.5)) | 0; }
        } else if (bl < 0xf) {
          const c = s8(a13);
          esi = (J0 + (c > 0x32 ? -5 : c > 0x23 ? -8 : -10)) | 0;
        }
      }
      // 0x4d3ba5
      ebx = m.u32(E + 4);
      const srep = s16(m.u16(ebx + 0x80));
      if (slot && m.s32(slot + 0xf) === m.s32(ebp)) esi = (esi + tdiv(srep, 1000)) | 0;
      ecx = K;
      const t = b4f & 0xf0;
      const ag = s8(m.u8(ebp + 0x18));
      const d670 = () => { let d = (imulHi(srep, 0xc3a13de7) + srep) >> 9; ecx = d >>> 31; d = (d + ecx) | 0; return d; };
      if (t === 0x10) {
        ecx = srep;
        if (ag >= 0x13) esi = (esi + tdiv(srep, 500)) | 0;
        else {
          ecx = s16(esi);
          if (tdiv(srep, 500) + s16(esi) >= 0x79) { ecx = srep; esi = (esi + tdiv(srep, 500)) | 0; }
          else esi = 0x79;
        }
      } else if (t === 0x20 || t === 0x30) {
        if (ag >= 0x13) { ecx = srep; esi = (esi + d670()) | 0; }
        else { ecx = srep; esi = (esi + tdiv(srep, 500)) | 0; }
      } else if (ag < 0x13 && t === 0x40) { ecx = srep; esi = (esi + d670()) | 0; }
      if (ag > 0x14 && s16(m.u16(m.u32(ebp + 0x61) + 5)) < 0x2d) {
        ecx = srep;
        let d = imulHi(srep, 0xef9db22d) >> 6; d = (d + (d >>> 31)) | 0;
        esi = (esi + d) | 0;
      }
      if (s16(L20) > 0x78) {
        const b7f = m.u8(ebx + 0x7f);
        if (s8(b7f) > 0xa) { ecx = (ecx & 0xffff0000) | (s8(b7f) & 0xffff); esi = (esi + ecx - 0xa) | 0; }
      }
      const mgr = m.u32(ebx + 0xcf);
      if (mgr && m.u32(mgr + 0x69)) {
        push(0); push(0); push(1); push(1); push(ebx);
        if (!call(0x600a50, C_600A50, m.u32(mgr + 0x69))) {
          ecx = (R.ecx & 0xffff0000) | (s8(m.u8(m.u32(mgr + 0x69) + 0x22)) & 0xffff);
          esi = (esi + ecx - 0xa) | 0;
        }
        push(m.u32(mgr + 0x42)); push(m.u32(mgr + 0x3e));
        const ok = call(0x456740, C_456740, (ebp + 0x3e) >>> 0);
        if (ok) {
          const ax = s16(m.u16(m.u32(ebp + 0x61) + 7));
          if (s16(esi) < ax) { const d = ax - s16(esi); W(0x38, d); esi = (esi + ft(d * 0.5)) | 0; }
        }
      }
      if (s16(esi) > 0x78) {
        // 0x4d3d21: prisen af talentet
        ebp = m.u32(E + 4);
        ebx = (ebx & 0xffff0000) | m.u16(ebp + 0x80);
        const rp = s16(ebx);
        W(0x38, rp);
        let x = rp * 0.0167 + 100.0;
        if (!(150.0 <= x)) x = 150.0; else if (220.0 < x) x = 220.0;
        const ax = ft(x);
        if (!(s16(esi) < s16(ax))) esi = ax;
        if (s16(esi) > 0x96 && slot && rp >= 0x9c4 && s8(m.u8(m.u32(ebp + 0x53) + 0x85)) > 0xa) {
          let e = s16(esi) * 4 - 0x258;
          if (e >= 0xc8) e = 0xc8;
          e = Math.imul(Math.imul(s16(e), s16(e)), 250);
          W(0x38, e);
          L34 = ft(e * (rp * 0.00016666666666666666));
          W(0x34, L34);
        }
        const e2 = Math.imul((Math.imul(s16(esi), s16(esi)) - 0x3840) | 0, 250);
        W(0x38, e2);
        ebp = ft(e2 * 0.6153846153846154 + L34);
        let L20b = ebp;
        W(0x20, ebp);
        const sel = m.u32(E + 4);
        const bl2 = s8(m.u8(m.u32(sel + 0x53) + 0x85));
        ebx = (ebx & ~0xff) | m.u8(m.u32(sel + 0x53) + 0x85);
        if (bl2 < 0xd || s8(m.u8(sel + 0x64)) === 3) {
          const dl = s8(m.u8(sel + 0x64));
          let ax2 = s16(m.u16(sel + 0x80));
          if (dl === 3 && ax2 < 0x1482) { W(0x38, ax2); ax2 = s16(ft(ax2 * 0.75)); }
          if (bl2 < 5 && ax2 > 0xfa0) { const d = ax2 - 0xfa0; W(0x38, d); ax2 = s16((0xfa0 - ft(d * -0.2)) | 0); }
          if (ax2 < 0x1482) { W(0x38, ax2); ebp = ft(ax2 * 0.00019047619047619048 * L20b); L20b = ebp; W(0x20, ebp); }
        }
        // 0x4d3ee8: kontraktens klausuler
        esi = m.u32(K + 0x45);
        if (esi) {
          ebx = K;
          if (s8(m.u8(K + 0x44)) < -50) { ebp = ft(L20b * 0.75); L20b = ebp; W(0x20, ebp); }
          if (esi & 0x800000) { ebp = ft(L20b * 0.8); L20b = ebp; W(0x20, ebp); }
          if (call(0x8676f0, C_8676F0, K) & 8) { ebp = ft(L20b * 0.95); L20b = ebp; W(0x20, ebp); }
          ebx = m.u32(K + 0x45);
          if (ebx & 1) { ebp = ft(L20b * 0.9); L20b = ebp; W(0x20, ebp); }
          if (ebx & 0x40) { ebp = ft(L20b * 0.9); L20b = ebp; W(0x20, ebp); }
        }
        const b59 = s8(m.u8(staff + 0x59));
        if (b59 < 6 && s8(m.u8(staff + 0x5b)) < 0xa) {
          if (s8(m.u8(K + 0x44)) < 0) { ebp = ft(L20b * 0.9); L20b = ebp; W(0x20, ebp); }
          if (buyer && (s16(m.u16(buyer + 0x80)) - 0x2ee) > s16(m.u16(sel + 0x80))) ebp = ft(L20b * 0.9);
        } else if (b59 > 0xf && !(s8(m.u8(K + 0x44)) < 0)) ebp = ft(L20b * 1.1);
        if (edi < ebp) {
          edi = ebp; L14 = edi; W(0x14, edi);
          if (out) orOut(0x20);
        }
      }
    }
  }
  // 0x4d402e: aldersloftet over værdien
  {
    let a = m.u8(m.u32(staff + 0x61) + 0xf) === 0x14 ? (age + 0xfd) & 0xff : age;
    a = s8(a);
    if (a > 0x1c && a - 0x1d <= 16) {
      const add = [0x4c4b40, 0x3d0900, 0x319750, 0x2625a0, 0x1ab3f0, 0xf4240, 0x7a120, 0x30d40, 0x186a0][a - 0x1d] ?? 0;
      const cap = (V + add) | 0;
      if (!(edi < cap)) { edi = cap; L14 = edi; W(0x14, edi); }
    }
  }
  {
    const nat = m.u32(m.u32(E + 4) + 0x53);
    if (nat) {
      const id = m.s32(nat);
      if (id === m.s32(0x9cf434)) {
        if (edi > V) {
          if (edi < 0x5b8d80) L84 = (L14 * 1.6666666666666668e-07 * 0.6 + 0.3) * L14;
          else L84 = L14 * 0.9;
          WD(0x84, L84);
          edi = ft(V > L84 ? V : L84);
        }
      } else if (id === m.s32(0x9cf484) && edi > V && edi > 0xc350) {
        edi = (edi - 0xc350) | 0;
        W(0x38, edi);
        edi = ft(edi * 0.15 + 50000.0);
      }
    }
  }
  esi = K;
  if (call(0x867b50, C_867B50, K)) { const fee = m.s32(K + 0x21); if (edi >= fee) return done(fee); }
  return done(edi);
}

/** 0x4d1600 for de oversatte kaldere (delt tilstand: argumenterne på stakken, ret 0x18) */
function impl(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  if (busy) { runOn(R, GEN[0x4d1600]); return R.ret(6); }          // (indlejret kald: den oversatte)
  if (MODE !== 'check') { ASK_STATS.ts++; asking(R); return R.ret(6); }
  // kontrol: porten, så den oversatte fra samme tilstand med de samme tilfældige tal
  const m = R.m, E = R.esp >>> 0, lo = (E - 0x1000) >>> 0, hi = (E + 0x100) >>> 0;
  const snap = () => { const b = new Uint8Array(hi - lo); for (let i = 0; i < b.length; i++) b[i] = m.u8(lo + i); return b; };
  const out = m.u32(E + 0x10);
  const regs = [R.eax, R.ebx, R.ecx, R.edx, R.esi, R.edi, R.ebp, R.esp];
  const st0 = R.st.slice();
  const s0 = snap(), o0 = out ? [m.u32(out), m.u32(out + 4)] : [];
  const draws: number[] = [];
  const c0 = R.c;
  const rec = Object.create(c0) as CmCtx; rec.rand = (n: number) => { const v = c0.rand(n); draws.push(v); return v; };
  R.c = rec;
  // CM_SL_ASKDUMP=1: alle kald (alle dybder) i de to kørsler sammenlignes – argumenterne, stakdybden og ebx/esi/edi/ebp
  const log1: string[] = [], log2: string[] = [];
  let logTo = log1;
  const P = Object.getPrototypeOf(R) as X86, origP = P.call;
  if (ENV.CM_SL_ASKDUMP) {
    let depth = 0;
    P.call = function (this: X86, adr: number, cv: Conv) {
      if (depth > 0 || ENV.CM_SL_ASKDUMP === '2') {
        const a: string[] = [];
        for (let i = 0; i < cv.n; i++) a.push((this.m.u32((this.esp + 4 * i) >>> 0) >>> 0).toString(16));
        logTo.push(`${depth} ${adr.toString(16)}(${a.join(',')}) esp=${(this.esp >>> 0).toString(16)} ebx=${(this.ebx >>> 0).toString(16)} esi=${(this.esi >>> 0).toString(16)} edi=${(this.edi >>> 0).toString(16)} ebp=${(this.ebp >>> 0).toString(16)}`);
      }
      depth++;
      try { origP.call(this, adr, cv); } finally { depth--; }
    } as typeof P.call;
  }
  let t = performance.now();
  const v1 = asking(R);
  logTo = log2;
  ASK_STATS.tsMs += performance.now() - t;
  const st1 = R.st.slice(), r1 = [R.ebx, R.esi, R.edi, R.ebp, R.esp];
  const s1 = snap(), o1 = out ? [m.u32(out), m.u32(out + 4)] : [];
  for (let i = 0; i < s0.length; i++) m.w8(lo + i, s0[i]);
  if (out) { m.w32(out, o0[0]); m.w32(out + 4, o0[1]); }
  [R.eax, R.ebx, R.ecx, R.edx, R.esi, R.edi, R.ebp, R.esp] = regs;
  R.st = st0;
  let k = 0;
  const rep = Object.create(c0) as CmCtx; rep.rand = (n: number) => { if (k >= draws.length) { ASK_STATS.bad++; return c0.rand(n); } return draws[k++]; };
  R.c = rep;
  t = performance.now();
  runOn(R, GEN[0x4d1600]);
  ASK_STATS.genMs += performance.now() - t;
  R.c = c0;
  if (ENV.CM_SL_ASKDUMP) {
    P.call = origP;
    if (log1.join('|') !== log2.join('|')) {
      ASK_STATS.nested++;
      if (ASK_STATS.nested < 4) for (let i = 0; i < Math.max(log1.length, log2.length); i++) if (log1[i] !== log2[i]) { console.log('0x4d1600 kald', i, '\n TS  ', log1[i], '\n gen ', log2[i]); break; }
    }
  }
  const v2 = R.eax | 0;
  ASK_STATS.n++;
  const s2 = snap(), o2 = out ? [m.u32(out), m.u32(out + 4)] : [];
  const bad: string[] = [];
  if (v1 !== v2) bad.push(`svar ${v1} ≠ ${v2}`);
  if (k !== draws.length) bad.push(`tilfældige tal ${draws.length} ≠ ${k}`);
  if (o1.join() !== o2.join()) bad.push(`ud ${o1.map((x) => x.toString(16))} ≠ ${o2.map((x) => x.toString(16))}`);
  if (st1.length !== R.st.length || st1.some((x, i) => !Object.is(x, R.st[i]))) bad.push(`x87 ${st1} ≠ ${R.st}`);
  const r2 = [R.ebx, R.esi, R.edi, R.ebp, R.esp];
  if (r1.join() !== r2.join()) bad.push(`registre ${r1} ≠ ${r2}`);
  for (let i = 0; i < s1.length; i++) if (s1[i] !== s2[i]) { bad.push(`stak ${(lo + i).toString(16)} (E${lo + i - E}) ${s1[i]} ≠ ${s2[i]}`); if (bad.length > 6) break; }
  if (bad.length && ASK_STATS.bad++ < 10) console.log('0x4d1600 afviger:', bad.join('; '), [m.u32(E + 4), m.u32(E + 8), m.u32(E + 0xc), out, m.u32(E + 0x14), m.u32(E + 0x18)].map((x) => x.toString(16)));
  return R.ret(6);
}

/** 0x4d1600 uden for de oversatte kaldere (egen processortilstand under stakkens top; tests/cmAskingPrice.test.ts) */
export const askingPrice_4d1600 = (c: CmCtx, self: number, args: number[]): number => impl(c, self, args) | 0;

let done0 = false;
/** registrerer porten som 0x4d1600 (kaldes af cmShortlistGame.ts ensureCmp) */
export function registerAskingPrice(): void {
  if (done0 || MODE === '0') return;
  done0 = true;
  registerImpl(0x4d1600, impl, true);
}
