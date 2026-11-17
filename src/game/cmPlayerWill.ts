// Spillerens vilje 0x846920 Shortlist_Manager::player_value(staff, klub, a2, a3, status, &ud) → float håndporteret (hastighed, runde 17 –
// 17/11-2026): hvor gerne spilleren vil til klubben (0x85fc50's lønkrav, 0x4ce4e0's tilbud, ønskelisterne). Erstatter den mekanisk oversatte
// cmGen/f_846920.ts (3.829 x86-instruktioner) for de oversatte kaldere. Bit for bit som den oversatte, også det den efterlader – som
// cmAskingPrice.ts: kører på kalderens delte processortilstand, de kaldte funktioner kaldes med R.call med samme argumenter i samme stakdybde og
// originalens ebx/esi/edi/ebp, og rammen (ebp-ramme med `and esp, -8`, SEH-posten, de to Date-objekter, float32-variablerne) ligger i
// hukommelsen, hvor originalen har den. Rammens variable læses af hukommelsen, hvor originalen kan læse dem uden at have skrevet dem
// (fx [esp+0x58] og [esp+0x6c] på klubbens egen vej) – så de har kalderens efterladte stakindhold som i originalen.
// SLÅET FRA som standard (CM_SL_WILL=1: porten; CM_SL_WILL=check: begge, sammenlignet – svar, ud-feltet, x87-stakken, registrene og 0x1200 bytes
// stak; CM_SL_WILLDUMP=1 sammenligner også alle kald i alle dybder). Hvert kalds svar og efterladte stak er som den oversattes (0 afvigelser i
// 42.953 kald), men spillet går en anden vej fra dag 2: porten sætter ikke eax/ecx/edx, som originalen har dem, når de kaldte funktioner
// kaldes og ved retur – og de kaldte bruger dem (fx skubber en kaldt funktion eax, så 0x53b620 får 0x60b i stedet for 0xb).
import type { CmCtx } from './cmMem';
import { registerImpl, enter, runOn, TRACE, type X86, type Conv } from './cmGen/x86';
import { GEN } from './cmGen/index';

const ENV = typeof process !== 'undefined' ? process.env ?? {} : {};
const MODE = ENV.CM_SL_WILL ?? '0';   // (slået fra: se "Hastighed, runde 17" i docs/ENGINE_PORT_PLAN.md – eax/ecx/edx ved de kaldte)
/** kontroltilstandens tællere */
export const WILL_STATS = { n: 0, bad: 0, ts: 0, tsMs: 0, genMs: 0, scratch: 0 };

/** CM_SL_CALLPROF=1: tid pr. kaldt funktion (ms) */
export const PROF: Map<number, number> | null = ENV.CM_SL_CALLPROF === '1' ? new Map() : null;
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const f32 = Math.fround;
const ft = (x: number) => { const t = Math.trunc(x); return Number.isFinite(t) ? t | 0 : 0; };
const ftHi = (x: number) => { const t = Math.trunc(x); if (!Number.isFinite(t)) return 0; if (Math.abs(t) < 2 ** 31) return t < 0 ? -1 : 0; return Number(BigInt.asUintN(64, BigInt(t)) >> 32n) | 0; };
const half = (v: number) => (v - (v >> 31)) >> 1;
const tdiv = (a: number, b: number) => (a / b) | 0;
/** hi32(a · m) (imul), a·m eksakt i double (|a| < 2^21) */
const imulHi = (a: number, m: number) => Math.floor((a | 0) * (m | 0) / 4294967296) | 0;
/** idiv-trunkeringen bag `imul 0x88888889; add edx, ecx; sar edx, k; +fortegn` (division med 15 · 2^(k−3)) */
const magic8889 = (x: number, k: number) => { let d = ((imulHi(x, 0x88888889) + x) | 0) >> k; return (d + (d >>> 31)) | 0; };
const div3 = (x: number) => { const d = imulHi(x, 0x55555556); return (d + (d >>> 31)) | 0; };

const CV = (n: number, thisEcx: boolean, calleeClean: boolean, float = false): Conv => ({ n, thisEcx, calleeClean, float });
const C_4A4850 = CV(1, true, true), C_4B02E0 = CV(2, false, false), C_4CA470 = CV(2, false, true), C_4CBB60 = CV(2, true, true);
const C_4CF5A0 = CV(1, false, true), C_4CF5F0 = CV(2, true, true), C_53D980 = CV(3, false, false), C_5407E0 = CV(3, false, false);
const C_5444A0 = CV(2, false, false), C_544520 = CV(2, false, false), C_544590 = CV(2, false, false), C_547810 = CV(2, false, false);
const C_547840 = CV(2, false, false), C_547D30 = CV(2, false, false), C_547D60 = CV(2, false, false), C_54A110 = CV(0, true, false);
const C_54C8E0 = CV(2, true, true), C_54CDB0 = CV(2, true, true), C_5968D0 = CV(2, true, true), C_5986B0 = CV(0, true, false);
const C_5A0590 = CV(1, true, true), C_600A50 = CV(5, false, false), C_669BD0 = CV(3, false, false), C_7C6830 = CV(4, true, true);
const C_85E410 = CV(0, true, false), C_864550 = CV(6, false, true, true), C_8CCA10 = CV(2, true, true);

/** 0x846920 på den delte processortilstand R (esp = returadressen); svaret lægges på x87-stakken */
function will(R: X86): number {
  const m = R.m;
  const E = R.esp >>> 0, B = (E - 4) >>> 0, A = (B & ~7) >>> 0, F = (A - 0xfc) >>> 0;
  const cEbx = R.ebx, cEsi = R.esi, cEdi = R.edi, cEbp = R.ebp, self = R.ecx;
  const W = (o: number, v: number) => m.w32((F + o) >>> 0, v);
  const WD = (o: number, v: number) => m.wf64((F + o) >>> 0, v);
  const WF = (o: number, v: number) => m.wf32((F + o) >>> 0, v);
  const W8 = (o: number, v: number) => m.w8((F + o) >>> 0, v);
  const RD = (o: number) => m.f64((F + o) >>> 0);
  const RF = (o: number) => m.f32((F + o) >>> 0);
  const R32 = (o: number) => m.s32((F + o) >>> 0);
  const R8 = (o: number) => m.s8((F + o) >>> 0);
  let ebx = cEbx, esi = cEsi, edi = cEdi;
  const call = (adr: number, cv: Conv, ecx?: number): number => {
    R.ebx = ebx; R.esi = esi; R.edi = edi; R.ebp = B | 0;
    if (ecx !== undefined) R.ecx = ecx;
    if (PROF) { const t = performance.now(); R.call(adr, cv); PROF.set(adr, (PROF.get(adr) ?? 0) + performance.now() - t); }
    else R.call(adr, cv);
    if (!cv.calleeClean) R.esp = (R.esp + 4 * cv.n) | 0;
    return R.eax;
  };
  const callF = (adr: number, cv: Conv, ecx?: number): number => { call(adr, cv, ecx); return R.fpop(); };
  const push = (v: number) => R.push(v >>> 0);
  const done = (v: number): number => {
    R.ebx = cEbx; R.esi = cEsi; R.edi = cEdi; R.ebp = cEbp;
    R.esp = E | 0;
    R.ecx = m.s32((A - 0xc) >>> 0);                   // (epilogen: mov ecx, [esp+0xf0] – SEH-postens gamle fs:[0] = 0)
    R.fpush(v);
    return v;
  };
  // prolog: push ebp; mov ebp, esp; and esp, -8; SEH (push -1, push 0x962568, push fs:[0]); sub esp, 0xe4; push ebx/esi/edi
  m.w32(B, cEbp);
  m.w32((A - 4) >>> 0, -1); m.w32((A - 8) >>> 0, 0x962568); m.w32((A - 0xc) >>> 0, 0);
  m.w32((A - 0xf4) >>> 0, cEbx);
  W(0x24, self);
  m.w32((A - 0xf8) >>> 0, cEsi); m.w32(F, cEdi);
  R.esp = F | 0;
  ebx = 0;
  W8(0x57, 0); W(0x80, 0); W(0x78, 0);
  call(0x54a110, C_54A110, (F + 0x98) | 0);
  W(0xf8, 0);
  call(0x54a110, C_54A110, (F + 0x90) | 0);
  const out = m.u32(E + 0x18);                        // [ebp+0x1c]
  W8(0xf8, 1);
  WD(0x84, 1.0);
  if (out) m.w32(out, 0);
  const orO = (b: number) => m.w32(out, m.u32(out) | b);
  const staff = m.u32(E + 4), club = m.u32(E + 8), a2 = m.s32(E + 0xc), a3 = m.u8(E + 0x10), a4 = m.u8(E + 0x14), a4d = m.s32(E + 0x14);
  esi = staff;
  if (!m.u32(staff + 0x61)) return done(0.0);
  if (!m.u32(club + 0x53)) return done(0.0);
  if (!m.u32(staff + 0x1a)) return done(0.0);
  push(0); push(staff);
  if (call(0x8cca10, C_8CCA10, m.u32(0xde1f54))) return done(0.0);
  if (m.u8((Math.imul(m.s32(staff), 79) + m.u32(0xae2d0c) + 0xb) >>> 0) & 0x30) return done(0.0);
  const age = m.u8(staff + 0x18);
  {
    const b57 = s8(m.u8(staff + 0x57)), b5b = s8(m.u8(staff + 0x5b));
    W(0x1c, b57); W(0x1c, b5b);
    push(staff);
    W8(0x1b, age);
    WF(0x5c, (1.4 - b57 * 0.025) - b5b * 0.025);
    WF(0x7c, b57 * 0.02 + 0.8);
    WF(0x50, b57 * 0.05 + 0.5);
  }
  let K0 = call(0x4cf5a0, C_4CF5A0, m.u32(0xae1050)) >>> 0;
  m.w32(0xae1080, K0);
  let own = 0;
  if (K0) {
    own = (m.u32(0xae23b4) + 581 * m.s32(K0 + 4)) >>> 0;
    edi = own; W(0x30, own);
    if (own) {
      if (!m.u32(own + 0x53)) return done(3.5);
      push(staff);
      K0 = call(0x4cf5a0, C_4CF5A0, m.u32(0xae1050)) >>> 0;
      if ((m.u8(K0 + 0x35) & 0x3f) === 5) { own = 0; edi = 0; W(0x30, 0); }
    }
  } else { own = 0; edi = 0; W(0x30, 0); }
  push(edi); push(staff);
  const Kc = call(0x4cf5f0, C_4CF5F0, m.u32(0xae1050)) >>> 0;
  W(0x3c, Kc);
  const k45 = Kc ? m.u32(Kc + 0x45) : 0;
  W(0x64, k45);
  // 0x846adc: spilleren i sin egen klub – en ny kontrakt kan vente
  if (club && club === own && Kc) {
    push(m.u32(0xae2c94)); push(m.u32(0xae2c90));
    const days = call(0x54cdb0, C_54CDB0, (Kc + 0x2d) >>> 0) | 0;
    W(0x44, days);
    esi = staff;
    const rec = m.u32(staff + 0x61);
    const rb = s16(m.u16(rec + 0xb));
    let d = s16(m.u16(club + 0x80)) - rb;
    W(0x1c, d);
    let ecx = ft(d * 0.5);
    ebx = k45;
    if (ebx & 0x10) { const e = s16(ecx); W(0x1c, e); ecx = ft(e * 0.5); }
    if (s16(ecx) < 0) ecx = 0;
    else {
      const dl = m.u8(staff + 0x59);
      esi = s16(ecx);
      const lim = s8(dl) * 10 + 0x465;
      if (esi > lim) { const eax = (lim & 0xffff0000) | (s8(dl) & 0xffff); ecx = (Math.imul(eax, 10) + 0x465) | 0; }
    }
    if (!(ebx & 0x161a8)) {
      esi = m.s32(staff);
      ebx = 0x23;
      const rem = esi % 35;
      if (days < rem + 20 && !(m.u8((Math.imul(esi, 79) + m.u32(0xae2d0c) + 0xb) >>> 0) & 0xf)) {
        esi = (25 * (s8(m.u8(staff + 0x59)) + 0xaa) + s16(ecx)) | 0;
        if ((rb + 20 * s8(m.u8(staff + 0x57))) < esi) return done(3.5);
      }
    }
  }
  // 0x846c0f
  if (club !== own) {
    // 0x846c1e
    esi = Kc; edi = own;
    if (Kc && own) {
      const on = m.u32(own + 0x53), cn = m.u32(club + 0x53);
      if (on && cn && m.u8(cn + 0x77) === m.u8(on + 0x77) && (k45 & 0x20)) return done(0.0);
    }
    ebx = staff;
    if (s8(age) < 0x10) {
      push(1); push(m.u32(club + 0x53)); push(staff);
      if (call(0x53d980, C_53D980)) return done(0.0);
    }
    // 0x846c90
    let c = 2.75;
    WD(0xc, c);
    if (Kc && m.u8(Kc + 0x49)) {
      esi = out;
      const dd = ((Math.imul((m.u16(Kc + 0x2f) - m.u16(0xae2c92)) | 0, 365) - s16(m.u16(0xae2c90))) | 0) + s16(m.u16(Kc + 0x2d)) | 0;
      W(0x1c, dd);
      const f = 1.1 - dd * 0.002;
      if (out) {
        const b5a = s8(m.u8(staff + 0x5a));
        W(0x1c, b5a);
        if (f < b5a * 0.02 + 0.6) orO(1);
      }
      c = f * 2.75; WD(0xc, c);
    } else if (!own) {
      const dd = ((Math.imul((m.u16(0xae2c92) - m.u16(staff + 0x40)) | 0, 365) - s16(m.u16(staff + 0x3e))) | 0) + s16(m.u16(0xae2c90)) | 0;
      const sq = Math.imul(dd, dd);
      W(0x1c, sq);
      let st = sq * 0.0011111111111111111;
      if (12.0 < st) st = 12.0;
      c = st + 2.75; WD(0xc, c);
      esi = out;
    } else esi = out;
    return rest(c, 0);
  }
  // 0x846e34: klubben er hans egen
  if (Kc && k45 && k45 !== 2) return done(0.0);
  edi = own; esi = out; ebx = staff;
  WD(0xc, 3.5);
  return rest(3.5, 1);

  // -------------------------------------------------------------------------------------------- 0x846da0 …
  function rest(c0: number, _from: number): number {
    let c = c0;
    const mulC = (k: number) => { c = c * k; WD(0xc, c); };
    // 0x846da0: ung, lovende spiller fra en mindre klub (a3)
    {
      const rec = m.u32(ebx + 0x61);
      if (a3 && rec && s16(m.u16(rec + 0xd)) < 0x128e && club && edi && club !== edi && (k45 & 0x10)) {
        const ax = s16(m.u16(club + 0x80));
        let ecx = club;
        let done1 = false;
        const fac544 = (k1: number, k2: number) => {
          // 0x846e06-mønstret: rb > 0x1c52 → k2; ellers 0x544590(spiller, 0) ? k1 : k2
          if (s16(m.u16(rec + 0xb)) > 0x1c52) return k2;
          push(0); push(ebx);
          return call(0x544590, C_544590) ? k1 : k2;
        };
        if (ax > s16(m.u16(edi + 0x80))) {
          ecx = m.u32(club + 0x53);
          if (ecx === m.u32(edi + 0x53) || ax > 0x1676) { mulC(fac544(1.5, 1.25)); done1 = true; }
          else ecx = club;
        }
        if (!done1) {
          let k = 0;
          if (ax > 0xabe) {
            ecx = m.u32(club + 0x53);
            if (ecx === m.u32(edi + 0x53) || ax > 0x1676) {
              const cx = s16(m.u16(rec + 0xb));
              if (ax > cx) {
                if (cx > 0x1c52) k = 1.15;
                else { push(0); push(ebx); k = call(0x544590, C_544590) ? 1.35 : 1.15; }
              }
            }
            ecx = club;
          }
          if (!k && ax > 0x109a && m.u32(club + 0x53) === m.u32(edi + 0x53)) {
            const cx = s16(m.u16(rec + 0xb));
            if (cx > 0x186a && ax < 0x1482) k = 1.025;
            else if (cx > 0x1c52) k = 1.1;
            else { push(0); push(ebx); k = call(0x544590, C_544590) ? 1.25 : 1.1; }
          }
          if (k) mulC(k);
        }
      }
    }
    // 0x846f18: forholdene
    push(club); push(ebx);
    if (call(0x547d30, C_547D30)) { mulC(0.33); if (esi) orO(2); }
    push(edi); push(ebx);
    if (call(0x547d30, C_547D30)) {
      const s = s8((m.u8(ebx + 0x5a) + m.u8(ebx + 0x59) + m.u8(ebx + 0x5b)) & 0xff);
      if (s > 0x2d) mulC(1.25); else if (s > 0x19) mulC(1.5); else { c = c + c; WD(0xc, c); }
      if (esi) orO(4);
    }
    push(edi); push(ebx);
    if (call(0x547d60, C_547D60)) {
      push(edi); push(ebx);
      if (!call(0x544520, C_544520) && !m.u8((Kc + 0x49) >>> 0)) { mulC(0.5); if (esi) orO(8); }
    }
    push(club); push(ebx);
    if (call(0x547d60, C_547D60)) { if (esi) orO(0x10); mulC(3.0); }
    if (s8(age) > 0x22 && edi !== club && m.u32(club + 0x53) !== m.u32(ebx + 0x1a)) mulC(0.75);
    // 0x84701b: mellem to klubber
    if (edi && edi !== club) {
      const p1 = m.s32(0x9d0118), p2 = m.s32(0x9d011c), cid = m.s32(club);
      const maxB59 = () => { const b = s8(m.u8(ebx + 0x59)); const v = b < 1 ? 1 : b; W(0x1c, v); return v; };
      if ((cid === p1 || cid === p2) && (m.s32(edi) === p1 || m.s32(edi) === p2)) {
        c = (0.025 / maxB59()) * c; WD(0xc, c);
        if (esi) orO(0x20);
      } else {
        const g2ac = m.s32(0x9cf2ac), g51c = m.s32(0x9cf51c);
        const nid = m.s32(m.u32(club + 0x53));
        let hit = false;
        if (nid === g51c) {
          ebx = m.u32(edi + 0x53);
          if (m.s32(ebx) === g2ac) {
            ebx = m.u32(staff + 0x1a);
            if (m.s32(ebx) === g2ac) { mulC(0.05); if (esi) orO(2); hit = true; }
          }
          ebx = staff;
        }
        if (!hit && nid === g2ac && m.s32(m.u32(edi + 0x53)) === g51c && m.s32(m.u32(ebx + 0x1a)) === g51c) { mulC(0.1); if (esi) orO(2); hit = true; }
        if (!hit) {
          const rivalF = (k: number) => {
            let f: number;
            if (nid === m.s32(0x9cf360)) { const b = s8(m.u8(ebx + 0x59)); W(0x1c, b); f = 1.0 - b * 0.02; }
            else f = k / maxB59();
            c = f * c; WD(0xc, c);
            if (esi && f < 0.7) orO(0x20);
          };
          if (club === m.u32(edi + 0xb3) || club === m.u32(edi + 0xb7) || club === m.u32(edi + 0xbb)) rivalF(0.2);
          push(edi); push(club);
          if (call(0x4b02e0, C_4B02E0) & 0xff) rivalF(0.75);
        }
      }
    }
    // 0x84709d: managerne
    push(ebx); push(m.u32(club + 0xcf));
    if (call(0x547810, C_547810)) { c = c + c; WD(0xc, c); if (esi) orO(0x40); }
    push(ebx); push(m.u32(club + 0xcf));
    if (call(0x547840, C_547840)) { mulC(0.33); if (esi) orO(0x80); }
    if (edi) {
      push(ebx); push(m.u32(edi + 0xcf));
      if (call(0x547840, C_547840)) { c = c + c; WD(0xc, c); if (esi) orO(0x100); }
      push(ebx); push(m.u32(edi + 0xcf));
      if (call(0x547810, C_547810)) { mulC(0.5); if (esi && !(m.u8(Kc + 0x4e) & 8)) orO(0x200); }
    }
    // 0x84715b: kontraktens status (bl) og +0x3d ([esp+0x43])
    let bl: number;
    const date150 = (mgrDateAt: number): boolean => {
      // 0x847352: i dag + 150 dage (0x54c8e0) efter managerens dato +0x3e?
      push(0x96); push(F + 0x44);
      const p = call(0x54c8e0, C_54C8E0, 0xae2c90) >>> 0;
      const lo = m.u32(p), hi = m.u32(p + 4);
      W(0x1c, lo);
      esi = (esi & 0xffff0000) | m.u16(F + 0x1e);
      W(0x20, hi);
      const d = mgrDateAt;
      const cx = m.u16(d + 2), si = esi & 0xffff;
      if (si > cx) return true;
      if (si < cx) return false;
      return s16(lo) > s16(m.u16(d));
    };
    const fromNibble = () => {
      // 0x8474dc–0x84750a
      bl = m.u8(Kc + 0x4f) >>> 4;
      W8(0x1a, bl);
      if (m.u8(Kc + 0x4e) & 8) {
        bl = bl === 1 ? 3 : s8(bl) < 1 ? 7 : bl <= 3 ? 4 : 7;
        W8(0x1a, bl);
      }
    };
    if (!Kc) {
      if (club !== edi) { bl = 7; W8(0x43, 0x9c); W8(0x1a, 7); }
      else { bl = a4; W8(0x43, 0); W8(0x1a, bl); }
      ebx = (ebx & ~0xff) | bl;
    } else {
      const b44 = s8(m.u8(Kc + 0x44));
      if (club === edi) {
        W(0x1c, b44);
        const mg = m.u32(club + 0xcf);
        c = (b44 * 0.0025 + 1.0) * c; WD(0xc, c);
        if (mg && date150((m.u32(club + 0xcf) + 0x3e) >>> 0)) {
          push(Kc); push(staff);
          bl = call(0x4ca470, C_4CA470, m.u32(0xae1050)) & 0xff;
        } else bl = a4;
        ebx = (ebx & ~0xff) | bl;
        W8(0x1a, bl);
      } else {
        W(0x1c, b44);
        const f = 1.0 - b44 * 0.0025;
        c = f * c; WD(0xc, c);
        if (!(f <= 1.01)) { c = f * c; WD(0xc, c); }
        if (k45 & 0x10) WF(0x7c, RF(0x7c) * 1.5);
        if (k45 & 0x100) WF(0x7c, RF(0x7c) * 1.5);
        if (k45 & 1) WF(0x50, RF(0x50) * 1.5);
        if (esi) {
          if (!(f <= 1.5) && !(m.u8(Kc + 0x4e) & 8)) orO(0x400);
          else if (f < 0.5) orO(0x800);
        }
        if (edi && m.u32(edi + 0xcf) && date150((m.u32(m.u32(F + 0x30) + 0xcf) + 0x3e) >>> 0)) {
          push(Kc); push(staff);
          bl = call(0x4ca470, C_4CA470, m.u32(0xae1050)) & 0xff;
          ebx = (ebx & ~0xff) | bl;
          W8(0x1a, bl);
          if (m.u8(Kc + 0x4e) & 8) { bl = bl === 1 ? 3 : s8(bl) < 1 ? 7 : bl <= 3 ? 4 : 7; ebx = (ebx & ~0xff) | bl; W8(0x1a, bl); }
        } else { fromNibble(); ebx = (ebx & ~0xff) | bl!; }
      }
      edi = own; esi = out;
      W8(0x43, m.u8(Kc + 0x3d));
    }
    bl = bl!;
    // 0x847520
    if (club !== edi) {
      push(0); push(0); push(1); push(0);
      edi = club;
      push(edi);
      if (call(0x600a50, C_600A50)) {
        const b = s8(m.u8(m.u32(club + 0xcf) + 0x59));
        W(0x1c, b);
        const f = b * 0.025 + 0.5;
        c = f * c; WD(0xc, c);
        if (esi && f < 0.675) orO(0x20000000);
      }
      let cl = age;
      const ageDouble = (k: number) => { if (s8(cl) < 0x20 && m.u8(staff + 0x22)) mulC(k); };
      switch (s8(bl)) {
        case 1: mulC(0.65); if (esi && !m.u32(Kc + 0x45)) orO(0x1000); break;
        case 2: mulC(0.75); if (esi && !m.u32(Kc + 0x45)) orO(0x1000); break;
        case 3: mulC(0.9); break;
        case 4: mulC(1.8); if (esi) orO(0x2000); if (s8(cl) > 0x17 && s8(cl) < 0x20) { c = c + c; WD(0xc, c); } if (s8(cl) < 0x20 && m.u8(staff + 0x22)) { c = c + c; WD(0xc, c); } break;
        case 5: if (!a3) mulC(0.75); if (s8(cl) < 0x20 && m.u8(staff + 0x22)) { c = c + c; WD(0xc, c); } break;
        case 6: mulC(1.1); ageDouble(4.0); break;
        case 7: mulC(7.0); if (esi) orO(0x2000); break;
      }
      cl = age;
      // 0x8476d1: status-argumentet (a4)
      W(0x44, s8(a4));
      const gk = () => m.u8(m.u32(staff + 0x61) + 0xf) === 0x14;
      const kc10 = () => Kc && (m.u8(Kc + 0x45) & 0x10);
      switch (s8(a4)) {
        case 1:
          if (kc10()) { c = c + c; WD(0xc, c); WF(0x50, RF(0x50) * f32(1.100000023841858)); if (esi) orO(0x4000); }
          else { mulC(1.5384615384615383); WF(0x50, RF(0x50) * f32(1.100000023841858)); }
          break;
        case 2:
          mulC(kc10() ? 1.6666666666666667 : 1.3333333333333333);
          WF(0x50, RF(0x50) * f32(1.0499999523162842));
          if (kc10() && esi) orO(0x4000);
          break;
        case 3:
          if (!kc10()) mulC(1.1111111111111112);
          if (gk()) mulC(0.8);
          break;
        case 4:
          if (k45 & 0x10) {
            mulC(0.175);
            if (m.u32(staff + 0x69)) mulC(2.6666666666666665);
            else if (esi) orO(0x8000);
          } else mulC(gk() ? 0.15 : 0.375);
          if (s8(cl) > 0x17 && s8(cl) < 0x20) mulC(0.5);
          if (s8(cl) < 0x20 && m.u8(staff + 0x22)) mulC(0.5);
          WF(0x50, RF(0x50) * f32(0.800000011920929));
          break;
        case 5:
          if (k45 & 0x10) { mulC(0.03333333333333333); if (esi) orO(0x8000); } else mulC(gk() ? 0.2 : 0.4);
          if (s8(cl) < 0x20 && m.u8(staff + 0x22)) mulC(0.5);
          WF(0x50, RF(0x50) * f32(0.6700000166893005));
          break;
        case 6:
          if (k45 & 0x10) { mulC(0.02); if (esi) orO(0x8000); } else mulC(gk() ? 0.1 : 0.15);
          if (s8(cl) < 0x20 && m.u8(staff + 0x22)) mulC(0.25);
          WF(0x50, RF(0x50) * 0.5);
          break;
        case 7: mulC(0.002); break;
      }
      // 0x847966: klubbens omdømme, ligaens vægt, lønnen
      {
        let al = s8(m.u8(m.u32(club + 0x53) + 0x7e));
        if (al < 1 || al > 3) al = 3;
        W8(0x57, (al * al) & 0xff);
      }
      edi = (club & 0xffff0000) | m.u16(club + 0x80);
      const rep = s16(edi);
      esi = rep;
      ebx = club;
      {
        const n69 = m.u32(club + 0x69), n38 = n69 ? m.u32(n69 + 0x38) : 0;
        if (n69 && n38) {
          const a33 = m.u8(n38 + 0x33);
          if (!a33) W(0x34, half(rep));
          else {
            const q = magic8889(Math.imul(s8(a33), rep), 3);
            W(0x58, rep);
            W(0x1c, q);
            const st = rep * 0.2857142857142857;
            WD(0x1c, q);
            W(0x34, ft(st > q ? st : q));
          }
        } else { W(0x58, rep); W(0x34, ft(rep * 0.2857142857142857)); }
      }
      const div = m.u32(club + 0x57);
      if (div) {
        const dr = s16(m.u16(div + 0x69));
        if (rep >= 0x1d4c && m.s32(club + 0x73) > 0x88b8) { const e = Math.imul(dr, 500); W(0x68, e > rep ? e : rep); }
        else { const h = (half(rep) + Math.imul(dr, 250)) | 0, e = Math.imul(dr, 500); W(0x68, e > h ? e : h); }
      } else W(0x68, edi);
      compRow(0x80, (adr) => { W(0x6c, adr); });
      // 0x847b8d: managerens bud på spilleren
      {
        const mg = m.u32(club + 0xcf);
        if (!mg || !m.u32(mg + 0x69)) edi = 0;
        else {
          push(1); push(staff); push(mg);
          edi = call(0x5407e0, C_5407E0) | 0;
          const tb = m.u32(0xb67a44);
          if (tb) edi = mgrJudge(club, tb, s16(edi));
        }
      }
      // 0x847ccb: klubbens økonomi
      esi = (esi & 0xffff0000) | m.u16(club + 0x80);
      push(club);
      {
        const fin = call(0x5a0590, C_5A0590, m.u32(0xae2a38)) >>> 0;
        if (fin && m.u8(F + 0x57) === 1) {
          const t = s8(call(0x5986b0, C_5986B0, fin) & 0xff);
          if (t === 1) esi = finUp(s16(esi), 1.25, 0x2ee);
          else if (t === 2) esi = finUp(s16(esi), 1.5, 0x5dc);
        }
      }
      let cx = wageMix(club, s16(esi));
      {
        const s = ((RF(0x50) + RF(0x7c)) + RF(0x5c)) + 2.0;
        WF(0x58, s);
        if (!(s > 0.0)) W(0x58, 0x3f000000);
      }
      let ax = ft(sumOver(s16(m.u16(F + 0x6c)), s16(m.u16(F + 0x68)), s16(m.u16(F + 0x34)), s16(cx), s16(edi)));
      // 0x847e33
      {
        const cl2 = m.u8(club + 0x64);
        if (cl2 !== 1) {
          if (!(Kc && (m.u8(Kc + 0x45) & 0x10) && !m.u8(staff + 0x22))) { const v = s16(ax); esi = (v - 0x7d0) | 0; const h = half(v); ax = h < esi ? h : esi; }
          if (cl2 === 3) { const v = s16(ax), e = (v - 0x7d0) | 0, h = half(v); ax = h < e ? h : e; }
        }
      }
      {
        const v = s16(ax);
        W(0x1c, v);
        const ecx = ft(v * 1.5 - 5000.0), edxHi = ftHi(v * 1.5 - 5000.0);
        const nat = m.u32(club + 0x53);
        W(0x1c, ecx);
        if (!nat) esi = out;
        else {
          const w = (s16(ecx) + 0x1388) | 0;
          W(0x34, w);
          esi = staff;
          push(1); push((edxHi & ~0xff) | m.u8(nat + 0x77)); push(club);
          const sq = w * 6.666666666666667e-05 * w;
          push(staff);
          WD(0x6c, sq);
          const r = s8(call(0x7c6830, C_7C6830, m.u32(0xb74350)) & 0xff);
          W(0x34, r);
          WD(0x34, r);
          if (s8(age) < 0x12 && r < 5.0 && m.u32(m.u32(staff + 0x1a) + 0x71) !== m.u32(m.u32(club + 0x53) + 0x71)) return done(0.0);
          const a = r * 0.1;
          const z = RD(0x6c) / (12000.0 - r * 200.0);
          WD(0x34, z);
          const f = (a > z ? a : z) + 0.2;
          esi = out;
          c = f * c; WD(0xc, c);
          if (esi && f < 0.6) orO(0x10000);
        }
      }
      // 0x847f85
      edi = staff;
      return tail2(true);
    }
    // 0x84875a: klubben er hans egen
    push(0); push(0); push(1); push(0); push(club);
    let ecxS = staff;
    if (call(0x600a50, C_600A50)) {
      push(0x96); push(F + 0x44);
      const p = call(0x54c8e0, C_54C8E0, 0xae2c90) >>> 0;
      const lo = m.u32(p), hi = m.u32(p + 4);
      W(0x20, hi); W(0x1c, lo);
      esi = (esi & 0xffff0000) | m.u16(F + 0x1e);
      const d = (m.u32(club + 0xcf) + 0x3e) >>> 0;
      const cxx = m.u16(d + 2), si = esi & 0xffff;
      const later = si > cxx ? true : si < cxx ? false : s16(lo) > s16(m.u16(d));
      if (later) {
        const dl = s8((0xce - m.u8(staff + 0x59)) & 0xff), al = R8(0x43);
        if (al < dl && bl !== 5 && bl !== 6) bl = 7;
        else if (al < 0) { if (s8(bl) < 4) bl = 4; }
        else if (al < 0x32) { if (s8(bl) < 3) bl = 3; }
        else if (al < 0x4b) { if (s8(bl) < 2) bl = 2; }
        else if (s8(bl) < 1) bl = 1;
        ebx = (ebx & ~0xff) | bl;
        W8(0x1a, bl);
      }
    }
    ecxS = staff;
    switch (s8(bl)) {
      case 1: mulC(1.2); break;
      case 3: mulC(0.9); break;
      case 4: { mulC(0.85); const al = s8(age); if (al > 0x17 && al < 0x20) mulC(0.5); if (al < 0x20 && m.u8(ecxS + 0x22)) mulC(0.5); break; }
      case 5: { mulC(0.75); const al = s8(age); if (al < 0x20 && m.u8(ecxS + 0x22)) mulC(0.5); break; }
      case 6: mulC(0.7); if (s8(age) < 0x20 && m.u8(ecxS + 0x22)) mulC(0.25); break;
      case 7: mulC(0.01); break;
    }
    edi = staff;
    return tail3();

    // ------------------------------------------------------------------------------------------ hjælpere
    function compRow(slot: number, store: (v: number) => void) {
      // 0x847a9e/0x848ad5: turneringens række (0x4a4850) → pladsens vægt [esp+0x6c] (klubben) / ebx (egen klub)
      const cl = ebx;
      let eax2 = m.s32(cl + 0x1db);
      let tab = true;
      if (!(eax2 > -1 && (eax2 !== m.s32(0x9cf6f8) || s16(edi) < 0x1388))) {
        eax2 = m.s32((m.u32(0xae2d14) + 6 * m.s32(cl)) >>> 0);
        if (eax2 <= -1) tab = false;
      }
      let cp = 0;
      if (tab) { cp = (Math.imul(eax2, 107) + m.u32(0xae23d0)) | 0; W(slot, cp); if (!cp) tab = false; }
      if (!tab) {
        const v = s16(m.u16(F + 0x68));
        W(0x1c, v);
        let st = v * 0.8;
        if (!(st < 7000.0)) st = 7000.0;
        store(ft(st));
        return;
      }
      const cid = m.s32(cp);
      if (cid === m.s32(0x9cf6e8)) esi = 0x3a98;
      else esi = (esi & 0xffff0000) | ((m.u16(cp + 0x69) * 0x258) & 0xffff);
      push(cl);
      W(0x6c, esi);
      const row = call(0x4a4850, C_4A4850, m.u32(m.u32(m.u32(0xadadfc) + 4 * cid) + 8)) >>> 0;
      if (row && !m.u8(row + 4)) {
        const pos = m.u8(row + 0x72);
        if (pos >= 1 && pos <= 0x10) {
          W(0x1c, pos);
          W(0x1c, s16(esi));
          store(ft(s16(esi) * (1.32 - pos * 0.02)));
        }
      }
    }
    function mgrJudge(cl: number, tb: number, rv: number): number {
      // 0x847bcb/0x848c22: managerens kendskab (Staff_Records) blandet med omdømmet
      let a: number, d: number, cc: number;
      if (!cl) { a = 0; d = 0; cc = 0; }
      else {
        const r = (Math.imul(m.s32(cl), 73) + m.u32(tb)) >>> 0;
        d = s16(m.u16(r + 8)); cc = s16(m.u16(r + 6)); a = s16(m.u16(r + 0xa));
      }
      W(0x1c, a); W(0x1c, d); W(0x1c, cc);
      const ax = s16(ft((a + d) * 0.25 + cc * 0.5));
      if (ax < 0x1388) {
        W(0x1c, ax); W(0x1c, rv);
        const A2 = 5.0 - ax * 0.0008;
        const Q = rv / A2;
        WD(0x1c, Q);
        const X = rv - A2 * 1000.0;
        return ft(Q <= X ? X : Q);
      }
      W(0x1c, ax); W(0x1c, rv);
      const A2 = ax * 0.0001 + 0.5;
      const P = A2 * rv;
      WD(0x1c, P);
      const Y = A2 * 1000.0 + rv;
      return ft(P < Y ? P : Y);
    }
    function finUp(v: number, k: number, add: number): number {
      W(0x58, v);
      const q = (v + add) | 0;
      W(0x1c, q);
      const st = v * k;
      WD(0x1c, q);
      return ft(st > q ? st : q);
    }
    function wageMix(cl: number, v: number): number {
      // 0x847d6c/0x848df6: klubbens gennemsnitsløn i Shortlist_Manager (this+0xdc) mod omdømmet
      let ax = m.u16((9 * m.s32(cl) + m.u32(m.u32(F + 0x24) + 0xdc) + 5) >>> 0);
      if (v > s16(ax)) ax = v & 0xffff;
      W(0x1c, v); W(0x1c, s16(ax));
      return ft(v * 0.65 + s16(ax) * 0.35);
    }
    function sumOver(x6c: number, x68: number, x34: number, cxv: number, di: number): number {
      W(0x1c, x6c); W(0x1c, x68); W(0x1c, x34); W(0x1c, cxv); W(0x1c, di);
      return ((((x6c * RF(0x50) + x68 * RF(0x7c)) + x34 * RF(0x5c)) + cxv) + di) / RF(0x58);
    }

    // ------------------------------------------------------------------------------------------ 0x847f85 …
    function tail2(_x: boolean): number {
      // spillerens egen klub er i samme land som klubben
      const sc = m.u32(edi + 0x39);
      let to532 = false, to498 = false;
      if (sc && m.u32(sc + 0x53) === m.u32(ebx + 0x53)) {
        if (!a3) to498 = true;
        else {
          let S = c;
          push(0); push(edi);
          if (call(0x544590, C_544590) && s8(m.u8(edi + 0x18)) < 0x18) {
            const r = m.u32(edi + 0x61);
            const b1a = R8(0x1a);
            if (r && s16(m.u16(r + 0xb)) < 0x109a && s8(m.u8(edi + 0x5b)) > 0xf && s8(m.u8(edi + 0x5a)) > 0xa && Kc && b1a !== 4 && b1a !== 1 && b1a !== 2 && b1a !== 3) S = c * 2.5;
          }
          const ow = m.u32(F + 0x30);
          if (ow && m.u32(ebx + 0x53) && m.s32(m.u32(ebx + 0x53)) === m.s32(0x9cf360) && s8(m.u8(edi + 0x18)) < 0x18 && m.u32(ow + 0x57) && m.s32(m.u32(ow + 0x57)) === m.s32(0x9cf570)) S = S * 3.0;
          const d = dist(ebx, ow);
          if (d === null) { c = S * 1.3; WD(0xc, c); }
          else if (d < 40.0) { c = S * 2.9; WD(0xc, c); if (esi) orO(0x20000); }
          else if (!(d < 80.0)) { c = S * 1.3; WD(0xc, c); }
          else { const T = 4.5 - d * 0.04; WD(0x44, T); c = T * S; WD(0xc, c); if (esi && !(T <= 1.6)) orO(0x20000); }
          to532 = true;
        }
      } else {
        const nat = m.u32(ebx + 0x53);
        let known = true;
        if (nat) { push(1); push(nat); push(edi); known = call(0x53d980, C_53D980) !== 0; }
        if (nat && !known) {
          if (!a3) to498 = true;
          else {
            const ow = m.u32(F + 0x30);
            to532 = true;
            if (ow) {
              const d = dist(ebx, ow);
              if (d === null) mulC(1.3);
              else if (d < 40.0) { mulC(2.9); if (esi) orO(0x20000); }
              else if (d < 80.0) { const T = 4.5 - d * 0.04; c = T * c; WD(0xc, c); if (esi && !(T <= 1.6)) orO(0x20000); }
              else mulC(1.3);
            }
          }
        } else {
          const mg = m.u32(ebx + 0xcf);
          let mk = false;
          if (mg && m.u32(mg + 0x1a)) { push(1); push(m.u32(mg + 0x1a)); push(edi); mk = call(0x53d980, C_53D980) === 0; }
          const n2 = m.u32(ebx + 0x53);
          if (n2 && m.s32(n2) === m.s32(0x9cf314)) mulC(0.75);
          if (a3) { mulC(mk ? 0.45 : 0.08); if (esi) orO(0x40000); to532 = true; }
          else {
            const t = R32(0x44);
            const b56 = s8(m.u8(edi + 0x56)), b57 = s8(m.u8(edi + 0x57));
            if (mk) {
              switch (t) {
                case 2: W(0x44, b56); W(0x44, b57); c = ((b56 * 0.005 + b57 * 0.02) + 0.8) * c; WD(0xc, c); break;
                case 3: W(0x44, b56); W(0x44, b57); c = ((b56 * 0.005 + b57 * 0.02) + 0.7) * c; WD(0xc, c); break;
                case 4: mulC(0.5); if (esi) orO(0x80000); break;
                case 5: mulC(0.4); if (esi) orO(0x80000); break;
                case 6: mulC(0.2); if (esi) orO(0x80000); break;
              }
            } else {
              switch (t) {
                case 2: W(0x44, b56); W(0x44, b57); c = ((b56 + b57) * 0.01 + 0.7) * c; WD(0xc, c); break;
                case 3: W(0x44, b56); W(0x44, b57); c = ((b56 + b57) * 0.01 + 0.6) * c; WD(0xc, c); break;
                case 4: mulC(0.25); if (esi) orO(0x80000); break;
                case 5: W(0x44, b56); W(0x44, b57); c = ((b56 + b57) * 0.004 + 0.25) * c; WD(0xc, c); if (esi) orO(0x80000); break;
                case 6: mulC(0.025); if (esi) orO(0x80000); break;
              }
            }
            to498 = true;
          }
        }
      }
      if (to498) {
        // 0x848498: kontrakten udløber / spilleren er tilgængelig
        let go = !!(Kc && m.u8(Kc + 0x49));
        if (!go) { push(0); push(edi); go = call(0x5444a0, C_5444A0) !== 0; }
        if (go) {
          c = c * 2.5; WD(0xc, c);
          if (c < 2.0) {
            const ax = s16(m.u16(ebx + 0x80));
            if (ax > 0x1a5e || ax > s16(m.u16((m.u32(F + 0x30) + 0x80) >>> 0))) {
              const s = c + 1.0;
              if (2.0 < s) { c = 2.0; WD(0xc, c); } else { c = s; WD(0xc, c); }
            }
          }
        }
        return tail62e();
      }
      if (to532) {
        // 0x848532: kontraktens +0x3d og alderen
        push(0); push(edi);
        if (call(0x544590, C_544590)) { const b = R8(0x43); W(0x44, b); c = (1.5 - b * 0.01) * c; WD(0xc, c); }
        {
          const b = R8(0x43);
          W(0x44, b);
          let f = 1.0 - b * 0.015;
          if (f < 0.1) f = 0.1;
          c = f * c; WD(0xc, c);
          if (esi && f < 0.6) orO(0x40000);
        }
        {
          let f: number;
          if (m.u8(m.u32(edi + 0x61) + 0xf) === 0x14) { const v = 0x21 - R8(0x1b); W(0x44, v); f = v; }
          else { const v = 0x1c - R8(0x1b); W(0x44, v); f = v; if (f < 0.0) f = f * 0.4; }
          f = Math.abs(f) * 0.08333333333333333 + 0.25;
          c = f * c; WD(0xc, c);
          if (esi && f < 0.6) orO(0x40000);
        }
      }
      return tail62e();
    }
    function dist(cl: number, ow: number): number | null {
      // byernes afstand (+0x23/+0x2b, ×55)
      if (!cl) return null;
      const a1 = m.u32(cl + 0x69); if (!a1) return null;
      const c1 = m.u32(a1 + 0x38); if (!c1) return null;
      if (!ow) return null;
      const a2_ = m.u32(ow + 0x69); if (!a2_) return null;
      const c2 = m.u32(a2_ + 0x38); if (!c2) return null;
      const dx = m.f64(c1 + 0x2b) - m.f64(c2 + 0x2b), dy = m.f64(c1 + 0x23) - m.f64(c2 + 0x23);
      return Math.sqrt(dy * dy + dx * dx) * 55.0;
    }
    function tail62e(): number {
      // 0x84862e: tiden i klubben
      const ow = m.u32(F + 0x30);
      if (!ow) { mulC(1.75); return tail8eb(); }
      push(0); push(edi);
      if (call(0x544520, C_544520)) return tail8df();
      push(0); push(edi);
      if (call(0x544590, C_544590)) return tail8df();
      esi = Kc;
      if (Kc && m.u8(Kc + 0x49)) return tail8df();
      const days = ((Math.imul((m.u16(0xae2c92) - m.u16(edi + 0x40)) | 0, 365) - s16(m.u16(edi + 0x3e))) | 0) + s16(m.u16(0xae2c90)) | 0;
      let v: number;
      if (a3) v = Math.imul((20 - tdiv(R8(0x43), 5)) | 0, days);
      else {
        if (!m.u32((Kc + 0x45) >>> 0)) { const lim = Math.imul(s8(m.u8(edi + 0x59)) + 8, 15); if (days < lim) return done(0.0); }
        let d = s8(m.u8(edi + 0x59)) + 10;
        if (d < 1) d = 1;
        v = (Math.imul(days, 20) / d) | 0;
      }
      W(0x34, v);
      if (v < 0) return done(0.0);
      if (v > 0x190) { W(0x34, 0x190); WD(0x84, 0x190 * 0.0025); }
      else { if (v === 0) return done(0.0); WD(0x84, v * 0.0025); }
      return tail8df();
    }
    function tail3(): number { return tail8df(); }
    function tail8df(): number {
      if (m.u32(F + 0x30)) return tail99d();
      return tail8eb();
    }
    function tail8eb(): number {
      // 0x8488eb: uden egen klub
      {
        let al = s8(m.u8(m.u32(edi + 0x1a) + 0x7e));
        if (al < 1 || al > 3) al = 3;
        W8(0x56, (al * al) & 0xff);
      }
      const r = m.u32(edi + 0x61);
      const q = s16(div3((s16(m.u16(r + 0xd)) + s16(m.u16(r + 0xb)) + s16(m.u16(r + 9))) | 0));
      W(0x24, q);
      esi = staff;
      ebx = ft(q * 1.5 - 5000.0);
      return tail943();
    }
    function tail99d(): number {
      // 0x84899d: spillerens egen klub (som 0x847966 for klubben)
      const ow = m.u32(F + 0x30);
      {
        const n = m.u32(ow + 0x53);
        let al = n ? s8(m.u8(n + 0x7e)) : 3;
        if (al < 1 || al > 3) al = 3;
        W8(0x56, (al * al) & 0xff);
      }
      edi = (edi & 0xffff0000) | m.u16(ow + 0x80);     // (edi = spilleren; kun di skiftes)
      const rep = s16(edi);
      esi = rep;
      ebx = ow;
      {
        const n69 = m.u32(ow + 0x69), n38 = n69 ? m.u32(n69 + 0x38) : 0;
        if (n69 && n38) {
          const a33 = m.u8(n38 + 0x33);
          if (!a33) W(0x44, half(rep));
          else {
            const q = magic8889(Math.imul(s8(a33), rep), 3);
            W(0x34, rep);
            W(0x44, q);
            const st = rep * 0.2857142857142857;
            WD(0x44, q);
            W(0x44, ft(st > q ? st : q));
          }
        } else { W(0x34, rep); W(0x44, ft(rep * 0.2857142857142857)); }
      }
      let edx: number;
      const div = m.u32(ow + 0x57);
      if (div) {
        const dr = s16(m.u16(div + 0x69));
        if (rep >= 0x1d4c && m.s32(ow + 0x73) > 0x88b8) { const e = Math.imul(dr, 500); edx = e > rep ? e : rep; }
        else { W(0x34, Math.imul(dr, 125)); const h = (half(rep) + Math.imul(dr, 250)) | 0, e = Math.imul(dr, 500); edx = e > h ? e : h; }
      } else edx = edi;
      W(0x6c, edx);
      // 0x848ad5 (ebx = egen klubs vægt)
      {
        let eax2 = m.s32(ow + 0x1db);
        let tab = true;
        if (!(eax2 > -1 && (eax2 !== m.s32(0x9cf6f8) || s16(edi) < 0x1388))) {
          eax2 = m.s32((m.u32(0xae2d14) + 6 * m.s32(ow)) >>> 0);
          if (eax2 <= -1) tab = false;
        }
        let cp = 0;
        if (tab) { cp = (Math.imul(eax2, 107) + m.u32(0xae23d0)) | 0; W(0x78, cp); if (!cp) tab = false; }
        if (!tab) {
          const v = s16(edx);
          W(0x34, v);
          let st = v * 0.8;
          if (!(st < 7000.0)) st = 7000.0;
          edi = ow;
          ebx = ft(st);
        } else {
          const cid = m.s32(cp);
          if (cid === m.s32(0x9cf6e8)) ebx = 0x3a98;
          else ebx = (ebx & 0xffff0000) | ((m.u16(cp + 0x69) * 0x258) & 0xffff);
          edi = ow;
          push(edi);
          const row = call(0x4a4850, C_4A4850, m.u32(m.u32(m.u32(0xadadfc) + 4 * cid) + 8)) >>> 0;
          if (row && !m.u8(row + 4)) {
            const pos = m.u8(row + 0x72);
            if (pos >= 1 && pos <= 0x10) { W(0x34, pos); W(0x34, s16(ebx)); ebx = ft(s16(ebx) * (1.32 - pos * 0.02)); }
          }
        }
      }
      // 0x848bcf: managerens bud
      {
        const mg = m.u32(edi + 0xcf);
        const np = mg ? m.u32(mg + 0x69) : 0;
        if (!mg || !np) { const v = s16(m.u16(F + 0x6c)); W(0x34, v); esi = ft(v * 0.75); }
        else {
          const tb = m.u32(0xb67a44);
          esi = (esi & 0xffff0000) | m.u16(np + 0xa);
          if (tb) {
            const r = (Math.imul(m.s32(edi), 73) + m.u32(tb)) >>> 0;
            const d = s16(m.u16(r + 8)), cc = s16(m.u16(r + 6)), a = s16(m.u16(r + 0xa));
            W(0x34, a); W(0x34, d); W(0x34, cc);
            const ax = s16(ft((a + d) * 0.25 + cc * 0.5));
            const rv = s16(esi);
            W(0x34, ax); W(0x34, rv);
            if (ax < 0x1388) {
              const A2 = 5.0 - ax * 0.0008, Q = rv / A2;
              WD(0x34, Q);
              const X = rv - A2 * 1000.0;
              esi = ft(Q <= X ? X : Q);
            } else {
              const A2 = ax * 0.0001 + 0.5, P = A2 * rv;
              WD(0x34, P);
              const Y = A2 * 1000.0 + rv;
              esi = ft(P < Y ? P : Y);
            }
          }
        }
      }
      // 0x848d13: økonomien
      push(ow);
      edi = (edi & 0xffff0000) | m.u16(ow + 0x80);
      {
        const fin = call(0x5a0590, C_5A0590, m.u32(0xae2a38)) >>> 0;
        if (fin && m.u8(F + 0x56) === 1 && Kc && !m.u32(Kc + 0x45)) {
          const t = call(0x5986b0, C_5986B0, fin) & 0xff;
          const up = (k: number, add: number) => { const v = s16(edi); W(0x34, v); const q = (v + add) | 0; W(0x34, q); const st = v * k; WD(0x34, q); return ft(st > q ? st : q); };
          if (t === 0xfe) { if (out) m.w32(out, m.u32(out) | 0x40000000); }
          else if (t === 1) edi = up(1.25, 0x2ee);
          else if (t === 2) edi = up(1.5, 0x5dc);
        }
      }
      {
        let ax = m.u16((9 * m.s32(ow) + m.u32(m.u32(F + 0x24) + 0xdc) + 5) >>> 0);
        if (s16(edi) > s16(ax)) ax = edi & 0xffff;
        const dv = s16(edi);
        W(0x24, dv); W(0x24, s16(ax));
        const w = ft(dv * 0.65 + s16(ax) * 0.35);
        const x6c = s16(m.u16(F + 0x6c)), x44 = s16(m.u16(F + 0x44)), bxv = s16(ebx), si = s16(esi);
        W(0x24, bxv); W(0x24, x6c); W(0x24, x44); W(0x24, s16(w)); W(0x24, si);
        edi = ft(((((bxv * RF(0x50) + x6c * RF(0x7c)) + x44 * RF(0x5c)) + s16(w)) + si) / RF(0x58));
      }
      if (!a3) { push(0); push(staff); if (call(0x5444a0, C_5444A0)) { const v = s16(edi); W(0x24, v); edi = ft(v * 0.9); } }
      ebx = ow;
      {
        const cl = m.u8(ow + 0x64);
        esi = staff;
        if (cl !== 1) {
          if (!(Kc && (m.u8(Kc + 0x45) & 0x10) && !m.u8(staff + 0x22))) { const v = s16(edi), e = (v - 0x7d0) | 0, h = half(v); edi = h < e ? h : e; }
          if (cl === 3) { const v = s16(edi), e = (v - 0x7d0) | 0, h = half(v); edi = h < e ? h : e; }
        }
      }
      push(ebx); push(esi);
      if ((call(0x4cbb60, C_4CBB60, m.u32(0xae1050)) & 0xff) === 3) { const v = s16(edi); W(0x24, v); edi = ft(v * 0.7); }
      {
        const v = s16(edi);
        W(0x24, v);
        const e = ft(v * 1.5 - 5000.0);
        ebx = e;
        const nat = m.u32(ow + 0x53);
        if (!nat) return tail943();
        edi = club;
        if (club === ow) return tail7c2();
        const w = (s16(ebx) + 0x1388) | 0;
        W(0x24, w);
        push(1); push((ow & ~0xff) | m.u8(nat + 0x77)); push(ow);
        const sq = w * 6.666666666666667e-05 * w;
        push(esi);
        WD(0x5c, sq);
        const r = s8(call(0x7c6830, C_7C6830, m.u32(0xb74350)) & 0xff);
        W(0x24, r);
        WD(0x24, r);
        const a = r * 0.1;
        const z = RD(0x5c) / (12000.0 - r * 200.0);
        WD(0x24, z);
        const f = (a > z ? a : z) + 0.2;
        c = c / f; WD(0xc, c);
        return tail946();
      }
    }
    function tail943(): number { edi = club; return tail946(); }
    function tail946(): number {
      if (edi === m.u32(F + 0x30)) return tail7c2();
      // 0x848950: divisionens styrke for spilleren i klubben
      {
        const dv = m.u32(edi + 0x57);
        if (!dv || m.s32(dv) === m.s32(0x9cf764)) mulC(0.1);
        else if (m.u32(esi + 0x39) === edi) {
          const r = m.u32(esi + 0x61);
          if (r && s8(m.u8(r + 0x45)) > 0xa) { const v = s8(m.u8(r + 0x45)); W(0x24, v); c = (v * c) * 0.1; WD(0xc, c); }
        }
      }
      // 0x84901a
      const r = m.u32(esi + 0x61);
      const pr = div3((s16(m.u16(r + 0xd)) + s16(m.u16(r + 0xb)) + s16(m.u16(r + 9))) | 0);
      {
        const v = (s16(m.u16(edi + 0x80)) - pr) | 0;
        W(0x24, v);
        WD(0x5c, v * 0.000125 + 1.0);
      }
      const bxv = s16(ebx);
      let Y: number;
      let ecx = 0, edx = 0;
      let got = false;
      if (a3 && ((Kc && (m.u8(Kc + 0x45) & 0x10)) || (push(0), push(esi), call(0x544590, C_544590)))) {
        const ow = m.u32(F + 0x30);
        const rr = m.u32(esi + 0x61);
        const pa = Math.imul(s16(m.u16(rr + 5)), 50);
        if (pa < s16(m.u16((ow + 0x80) >>> 0)) && !m.u8(esi + 0x22)) {
          const ag = R8(0x1b);
          if ((ag < 0x18 || ag > 0x20) && s16(m.u16(edi + 0x80)) > 0xdac && s16(m.u16(rr + 0xb)) < 0x157c) {
            const cn = m.u32(edi + 0x53), cd = m.u32(edi + 0x57), od = m.u32(ow + 0x57);
            if (cn && cd && od) {
              const ax = s16(m.u16(cd + 0x69));
              if (ax > 6 || ax > s16(m.u16(od + 0x69)) - 3) {
                const on = m.u32(ow + 0x53);
                if (on) {
                  const al = s8(m.u8(cn + 0x85));
                  if (!(al < 0xa) || !(al < s8(m.u8(on + 0x85)))) {
                    esi = R32(0x1c);
                    ecx = s16(esi); edx = bxv;
                    const v = (ecx - edx) | 0;
                    W(0x24, v);
                    Y = v * 0.5;
                    got = true;
                  }
                }
              }
            }
          }
        }
      }
      if (!got) {
        esi = R32(0x1c);
        const si = s16(esi);
        ecx = si; edx = bxv;
        const d = (si - bxv) | 0;
        if (Kc && (m.u8(Kc + 0x45) & 0x10) && si < bxv) {
          const e = (bxv - si) | 0;
          W(0x24, e);
          if (e < 0x1388) { Y = e * (e * -0.0002); got = true; }
        }
        if (!got) {
          if (si > bxv) {
            W(0x24, d);
            if (Kc && (m.u8(Kc + 0x45) & 1)) Y = d * 2.5;
            else { const b = s8(m.u8(m.u32(E + 4) + 0x57)); W(0x24, b); W(0x24, d); Y = d * (b * 0.08771929824561403 + 0.75); }
          } else if (s8(a4) > 3) { W(0x24, d); Y = d * 1.5; }
          else if (!(c <= 10.0)) {
            let f: number;
            if (bxv > 0x1b58 && si < 0x7d0 && a3) {
              const e = (bxv - si) | 0;
              W(0x24, e);
              const A2 = f32(2.0) - e * f32(0.00019999999494757503);
              const cc = c < 50.0 ? c : 50.0;
              if (!(10.0 <= A2 * cc)) f = 10.0 * 0.01;
              else f = (A2 * (c < 50.0 ? c : 50.0)) * 0.01;
            } else f = c * 0.01;
            f = 1.1 - f;
            if (f < 0.1) f = 0.1; else if (!(f <= 1.0)) f = 1.0;
            W(0x24, d);
            Y = f * d;
          } else { W(0x24, d); Y = d; }
        }
      }
      // 0x849346
      edi = out;
      if (!(Y! <= 0.0) && RD(0x84) < 1.0) {
        let Z = Y! * 0.02;
        if (100.0 < Z) Z = 100.0;
        const Wv = ((100.0 - Z) * RD(0x84) + Z) * 0.01;
        c = c * Wv; WD(0xc, c);
        if (edi && Wv < 0.6) m.w32(edi, m.u32(edi) | 0x100000);
      }
      let L24 = Y! * 0.00016129032258064516 + 1.0;
      WD(0x24, L24);
      if (L24 < 0.001) { L24 = 0.001; WD(0x24, L24); }
      if (Kc && (m.u8(Kc + 0x46) & 1)) { L24 = L24 * 1.5; WD(0x24, L24); }
      let P = L24 * c;
      const orE = (b: number) => m.w32(edi, m.u32(edi) | b);
      const lowFlags = (lim: number) => {
        // 0x849434/0x849539
        const o = m.u32(F + 0x30);
        void o;
        if (!(RF(0x50) <= 1.2) && R32(0x78) && !R32(0x80) && !(P <= 1.25)) {
          const al = R8(0x1a);
          if (al < 4 && al > 0 && (!Kc || !m.u8(Kc + 0x49))) { orE(0x400000); return; }
        }
        void lim;
        orE(0x800000);
      };
      const highFlags = () => {
        if (!(RF(0x50) <= 1.2) && !R32(0x78) && R32(0x80)) {
          const ow = m.u32(F + 0x30);
          if (!ow || s16(m.u16(ow + 0x80)) < 0x1d4c) {
            const al = s8(a4);
            if (al < 4 && al > 0 && (!Kc || !m.u8(Kc + 0x49))) orE(0x200000);
          }
        }
      };
      if (edi) {
        if (L24 < 0.6) lowFlags(0.6);
        else if (!(L24 <= 1.5)) highFlags();
      }
      if (!a3) P = P * L24;
      if (Kc && (m.u8(Kc + 0x45) & 1)) {
        P = P * L24;
        if (edi) {
          if (L24 < 0.8) lowFlags(0.8);
          else if (!(L24 <= 2.0)) highFlags();
        }
      }
      if (a3) {
        const rr = m.u32(m.u32(E + 4) + 0x61);
        if (s16(m.u16(rr + 0xb)) > bxv && bxv > s16(esi)) {
          const v = (ecx - edx) | 0;
          W(0x24, v);
          let L5c = (v * 0.0002 + 1.0) * RD(0x5c);
          WD(0x5c, L5c);
          if (L5c < 0.1) { L5c = 0.1; WD(0x5c, L5c); }
        }
        const v56 = R8(0x56), v57 = R8(0x57);
        W(0x24, v56); W(0x24, v57);
        const Rt = v56 / v57;
        P = P * Rt;
        if (edi && Rt < 0.6) orE(0x1000000);
      } else {
        const ow = m.u32(F + 0x30);
        esi = ow;
        if (ow) {
          const cl = R8(0x56), dl = R8(0x57);
          if (cl !== dl) {
            const ax = s16(m.u16(F + 0x6c));
            const mm = ax > 0x1f4 ? ax : 0x1f4;
            W(0x24, mm);
            const x68 = s16(m.u16(F + 0x68));
            W(0x1c, cl); W(0x1c, x68);
            W(0x24, dl);
            let X = (cl * x68) / (mm * dl);
            if (!(0.01 <= X)) X = 0.01; else if (10.0 < X) X = 10.0;
            P = P * X;
            if (m.u32(m.u32(club + 0x53) + 0x71) !== m.u32(m.u32(ow + 0x53) + 0x71) && X < 1.0) {
              P = P * 0.2;
              if (edi) orE(0x2000000);
            }
          } else {
            const sn = m.u32(m.u32(m.u32(E + 4) + 0x1a) + 0x71);
            const g = m.s32(0x9cfa10);
            if (sn && m.s32(sn) === g) {
              const cn = m.u32(m.u32(club + 0x53) + 0x71);
              if (cn && m.s32(cn) !== g && cn !== m.u32(m.u32(ow + 0x53) + 0x71)) { P = P * 0.4; if (edi) orE(0x2000000); }
            }
          }
        }
      }
      // 0x849799
      {
        const L5c = RD(0x5c);
        c = L5c * P; WD(0xc, c);
        if (edi && L5c < 0.6) orE(0x800000);
      }
      return tail7c5();
    }
    function tail7c2(): number { edi = out; return tail7c5(); }
    function tail7c5(): number {
      // 0x8497c5: kontrakten udløber snart (0x669bd0)
      const ow = m.u32(F + 0x30);
      if (ow && ow !== club) {
        const rr = m.u32(m.u32(E + 4) + 0x61);
        esi = (esi & 0xffff0000) | m.u16(rr + 7);
        if (s16(esi) > 0x82) {
          ebx = ow;
          if (s16(esi) > magic8889(s16(m.u16(ow + 0x80)), 5) && R8(0x1b) < 0x1a) {
            push(F + 0x90); push(F + 0x98); push(ebx);
            if (call(0x669bd0, C_669BD0) && R8(0x43) > 0 && Kc) {
              const ax = m.u16(Kc + 0x2f), cx = m.u16(F + 0x92);
              const before = cx < ax ? true : cx > ax ? false : s16(m.u16(F + 0x90)) < s16(m.u16(Kc + 0x2d));
              if (before && !m.u32(Kc + 0x45) && !m.u8(Kc + 0x49)) {
                push(0); push(0); push(1); push(1); push(club);
                if (!call(0x600a50, C_600A50) || s8(m.u8(m.u32(E + 4) + 0x5a)) > 0xf) {
                  push(m.u32(0xae2c94)); push(m.u32(0xae2c90));
                  if (call(0x54cdb0, C_54CDB0, (F + 0x90) | 0) < 0x96) {
                    if (edi) m.w32(edi, m.u32(edi) | 0x80000000);
                    return done(0.0);
                  }
                }
              }
            }
          }
        }
      }
      // 0x8498e9: lønnen klubben kan betale
      if (!a2 || a3 || RD(0xc) < 1.75) return done(RD(0xc));
      call(0x85e410, C_85E410, (F + 0xa0) | 0);
      edi = club;
      push(edi);
      W8(0xf8, 2);
      esi = call(0x5a0590, C_5A0590, m.u32(0xae2a38)) >>> 0;
      if (!esi) return done(0.0);
      ebx = a4d;
      push(0); push(0xb); push(ebx); push(0); push(edi);
      edi = staff;
      push(edi);
      const Wv = callF(0x864550, C_864550, (F + 0xa0) | 0);
      WD(0x44, Wv);
      push(ebx); push(edi);
      const mw = call(0x5968d0, C_5968D0, esi) | 0;
      W(0x24, mw);
      WD(0x1c, 0.0);
      const MW = mw;
      WD(0x5c, MW);
      c = RD(0xc);
      const cc = 0.1 <= c ? c : 0.1;
      let L34 = 3.5 / cc;
      WD(0x34, L34);
      if (L34 < 0.9) { L34 = 0.9; WD(0x34, L34); }
      const L44 = L34 * RD(0x44);
      WD(0x44, L44);
      ebx = Kc;
      let L1c = 0.0;
      if (Kc) {
        esi = k45;
        if (esi & 0x100) { L1c = 10.0; WD(0x1c, L1c); }
        push(m.u32(F + 0x30)); push(edi);
        if (call(0x544520, C_544520)) { L1c = L1c + 10.0; WD(0x1c, L1c); }
        const b3d = s8(m.u8(Kc + 0x3d));
        if (b3d < 0) { W(0x24, b3d); L1c = L1c - b3d * 0.2; WD(0x1c, L1c); }
        if (esi) { const b = s8(m.u8(Kc + 0x44)); W(0x24, b); L1c = L1c - b * 0.2; WD(0x1c, L1c); }
        if (!(0.0 <= L1c)) { L1c = 0.0; WD(0x1c, 0.0); }
        else if (20.0 < L1c) { L1c = 20.0; WD(0x1c, 20.0); }
      }
      let S0 = L44;
      if (!(S0 * 0.65 <= MW)) return done(0.0);
      if (!(S0 <= MW)) {
        let G = S0 * 0.5;
        if (!(MW <= G)) G = MW;
        S0 = ((20.0 - L1c) * S0 + G * L1c) * 0.05;
      }
      if (!(S0 <= MW) && !(S0 <= 0.0)) {
        const Rq = MW / S0;
        if (Rq < 0.7) return done(0.1);
        c = c * Rq;
        S0 = MW;
      }
      if (!Kc) return done(c);
      let Kv = m.s32(Kc + 0xc);
      if (Kv < 10.0) Kv = 10.0;
      let r = m.u32(F + 0x30) === club ? Kv / S0 : S0 / Kv;
      const blend = () => c * (((20.0 - L1c) * r + L1c) * 0.05 / L34);
      if (!(0.1 <= r)) { r = 0.1; return done(blend()); }
      if (10.0 < r) return done(c * 10.0);
      if (r < 1.0) return done(blend());
      return done(c * r);
    }
  }
}

/** 0x846920 for de oversatte kaldere (delt tilstand: argumenterne på stakken, ret 0x18, svaret i ST(0)) */
function impl(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  if (MODE !== 'check') { WILL_STATS.ts++; will(R); return R.ret(6, true); }
  const m = R.m, E = R.esp >>> 0, lo = (E - (+(ENV.CM_SL_WILLWIN ?? 0x1200))) >>> 0, hi = (E + 0x100) >>> 0;
  const snap = () => { const b = new Uint8Array(hi - lo); for (let i = 0; i < b.length; i++) b[i] = m.u8(lo + i); return b; };
  const out = m.u32(E + 0x18);
  const regs = [R.eax, R.ebx, R.ecx, R.edx, R.esi, R.edi, R.ebp, R.esp];
  const st0 = R.st.slice();
  const g0 = m.u32(0xae1080);
  const s0 = snap(), o0 = out ? m.u32(out) : 0;
  const draws: number[] = [];
  const c0 = R.c;
  const rec = Object.create(c0) as CmCtx; rec.rand = (n: number) => { const v = c0.rand(n); draws.push(v); return v; };
  R.c = rec;
  const log1: string[] = [], log2: string[] = [];
  let logTo = log1;
  const P = Object.getPrototypeOf(R) as X86;
  const origP = P.call;
  if (ENV.CM_SL_WILLDUMP) {
    const orig = origP;
    let depth = 0;
    P.call = function (this: X86, adr: number, cv: Conv) {
      if (depth < 8) { const a: string[] = [`eax=${(this.eax >>> 0).toString(16)} edx=${(this.edx >>> 0).toString(16)}`]; for (let i = 0; i < cv.n; i++) a.push((this.m.u32((this.esp + 4 * i) >>> 0) >>> 0).toString(16)); logTo.push(`${depth} ${adr.toString(16)}(${a.join(',')}) ecx=${cv.thisEcx ? (this.ecx >>> 0).toString(16) : "-"} esp=${(this.esp >>> 0).toString(16)} ebx=${(this.ebx >>> 0).toString(16)} esi=${(this.esi >>> 0).toString(16)} edi=${(this.edi >>> 0).toString(16)} ebp=${(this.ebp >>> 0).toString(16)}`); }
      depth++;
      try { orig.call(this, adr, cv); } finally { depth--; }
    } as typeof R.call;
  }
  let t = performance.now();
  will(R);
  logTo = log2;
  WILL_STATS.tsMs += performance.now() - t;
  const st1 = R.st.slice(), r1 = [R.ebx, R.esi, R.edi, R.ebp, R.esp], g1 = m.u32(0xae1080), x1 = [R.eax, R.ecx, R.edx];
  const s1 = snap(), o1 = out ? m.u32(out) : 0;
  for (let i = 0; i < s0.length; i++) m.w8(lo + i, s0[i]);
  if (out) m.w32(out, o0);
  m.w32(0xae1080, g0);
  [R.eax, R.ebx, R.ecx, R.edx, R.esi, R.edi, R.ebp, R.esp] = regs;
  R.st = st0;
  let k = 0;
  const rep = Object.create(c0) as CmCtx; rep.rand = (n: number) => { if (k >= draws.length) { WILL_STATS.bad++; return c0.rand(n); } return draws[k++]; };
  R.c = rep;
  t = performance.now();
  const path: number[] = [];
  if (ENV.CM_SL_WILLDUMP) { TRACE.on = true; TRACE.f = (pc) => { if (pc >= 0x846920 && pc < 0x849c60) path.push(pc); }; }
  runOn(R, GEN[0x846920]);
  if (ENV.CM_SL_WILLDUMP) TRACE.on = false;
  if (ENV.CM_SL_WILLDUMP) {
    P.call = origP;
    if (log1.join('|') !== log2.join('|') && WILL_STATS.scratch++ < 3) {
      for (let i = 0; i < Math.max(log1.length, log2.length); i++) if (log1[i] !== log2[i]) { console.log('kald', i, log2.slice(Math.max(0, i - 6), i).join('\n'), '\n TS  ', log1[i], '\n gen ', log2[i]); break; }
    }
  }
  WILL_STATS.genMs += performance.now() - t;
  R.c = c0;
  WILL_STATS.n++;
  const s2 = snap(), o2 = out ? m.u32(out) : 0;
  const bad: string[] = [];
  if (st1.length !== R.st.length || st1.some((x, i) => !Object.is(x, R.st[i]))) bad.push(`x87 ${st1.slice(0, 3)} ≠ ${R.st.slice(0, 3)} (${st1.length}/${R.st.length})`);
  if (k !== draws.length) bad.push(`tilfældige tal ${draws.length} ≠ ${k}`);
  if (o1 !== o2) bad.push(`ud ${o1.toString(16)} ≠ ${o2.toString(16)}`);
  if (g1 !== m.u32(0xae1080)) bad.push('[0xae1080]');
  const r2 = [R.ebx, R.esi, R.edi, R.ebp, R.esp];
  if (r1.join() !== r2.join()) bad.push(`registre ${r1} ≠ ${r2}`);
  if (x1.join() !== [R.eax, R.ecx, R.edx].join() && ENV.CM_SL_WILLREG && WILL_STATS.scratch++ < 5) console.log('0x846920 eax/ecx/edx', x1.map((x) => (x >>> 0).toString(16)), [R.eax, R.ecx, R.edx].map((x) => (x >>> 0).toString(16)));
  const Fw = ((((E - 4) & ~7) >>> 0) - 0xfc) >>> 0;
  for (let i = 0; i < s1.length; i++) if (s1[i] !== s2[i]) { bad.push(`stak F${(lo + i - Fw).toString(16)} ${s1[i]} ≠ ${s2[i]}`); if (bad.length > 6) break; }
  if (bad.length && ENV.CM_SL_WILLDUMP) {
    const dw = (b: Uint8Array, a: number) => (b[a - lo] | (b[a - lo + 1] << 8) | (b[a - lo + 2] << 16) | (b[a - lo + 3] << 24)) >>> 0;
    const rows: string[] = [];
    for (let a = Fw; a < E; a += 4) if (dw(s1, a) !== dw(s2, a)) rows.push(`F+${(a - Fw).toString(16)}: ${dw(s1, a).toString(16)} ≠ ${dw(s2, a).toString(16)}`);
    console.log(rows.join('\n'));
    console.log(path.map((x) => x.toString(16)).join(' '));
  }
  if (bad.length && WILL_STATS.bad++ < 10) console.log('0x846920 afviger:', bad.join('; '), [m.u32(E + 4), m.u32(E + 8), m.u32(E + 0xc), m.u8(E + 0x10), m.u8(E + 0x14), out].map((x) => x.toString(16)));
  return R.ret(6, true);
}

let done0 = false;
/** registrerer porten som 0x846920 (kaldes af cmShortlistGame.ts ensureCmp) */
export function registerPlayerWill(): void {
  if (done0 || MODE === '0') return;
  done0 = true;
  registerImpl(0x846920, impl, true);
}
