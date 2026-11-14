// Ønskelisternes vurdering i TS (hastighed, 14/11-2026, runde 10): Shortlist_Manager::value_player_for_club 0x840d80 håndporteret fra
// de mekanisk oversatte instruktioner (cmGen/f_840d80.ts) – samme rækkefølge af kald, samme heltals- og double-semantik (x87 med 53 bit som
// oversætteren: fild/fimul/fdiv på doubles, _ftol = trunkering, _CIpow = crtPow(ST(1), ST(0))). Kun computerklubberne: menneskets klub
// (0x600a50) og managerens manglende ikke-spillerpost (rand ved 0x840dd2) kører de oversatte instruktioner. Kontrol: scripts/cm-sl-bench.ts
// (sha1 hver dag) og CM_SL_840CHECK=1 (hvert kald også oversat og sammenlignet). CM_SL_840TS=0 slår porten fra.
import { type CmCtx, type CmMem, G, getContract } from './cmMem';
import { implGet, crtPow } from './cmGen/x86';
import { GEN } from './cmGen/index';
import { knowledge_5408c0, judge_6e86d0, shownAttr_544410, knowsNation_53d980 } from './cmValue';
import { contractForClub_4cf5f0 } from './cmContractWant';
import { humanClub_600a50 } from './cmWageGame';

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const dv = new DataView(new ArrayBuffer(8));
const dbl = (hi: number, lo: number) => { dv.setUint32(0, lo >>> 0, true); dv.setUint32(4, hi >>> 0, true); return dv.getFloat64(0, true); };
/** _ftol 0x945640: trunkering → eax (de lave 32 bit) */
export function ftolE(v: number): number {
  const t = Math.trunc(v);
  if (Math.abs(t) < 2 ** 31) return t | 0;
  const b = BigInt.asUintN(64, BigInt(Number.isFinite(t) ? t : -(2 ** 63)));
  return Number(b & 0xffffffffn) | 0;
}
/** signeret division mod 0 med 2^k (cdq; and edx, 2^k − 1; add; sar) */
const tdiv = (v: number, d: number) => Math.trunc(v / d) | 0;

/** en kaldt funktion som de oversatte kalder den: den registrerede (porterede/oversatte – ny processortilstand) eller c.call (adapteren) */
export function gcall(c: CmCtx, adr: number, ecx: number, ...args: number[]): number {
  const f = implGet(adr);
  return (f ? f(c, ecx, args) : c.call(adr, ...args)) | 0;
}

/** 0x544520 / 0x544590 (staff, klub): kontrakten med klubben (uden klub: hans egen kontrakts klub – [0xae1080] = kontrakten; klubben regnes
 *  som [0xae23b4] + 0x245 · id – 0x544551–0x544559) har +0x4e & mask (9 hhv. 2) */
export function contractFlag_5445x0(c: CmCtx, st: number, club: number, mask: number): number {
  const m = c.m;
  if (!st) return 0;
  let cl = club >>> 0;
  if (!cl) {
    const k = getContract(m, st);
    m.w32(0xae1080, k);
    if (!k) return 0;
    cl = (m.u32(G.CLUBS) + 0x245 * m.s32(k + 4)) >>> 0;
    if (!cl) return 0;
  }
  const k2 = contractForClub_4cf5f0(c, st, cl);
  return k2 && m.u8(k2 + 0x4e) & mask ? 1 : 0;
}

const D_SW: [number, number, number][] = [
  // 0x841294 … 0x841344: [esp+0x40], [esp+0x10], [esp+0xf]
  [dbl(0x415e8480, 0), dbl(0x3fe33333, 0x33333333), 0x1c],      // 0x841322
  [dbl(0x41612a88, 0), dbl(0x3fe4cccc, 0xcccccccd), 0x1c],      // 0x841300
  [dbl(0x416312d0, 0), dbl(0x3fe80000, 0), 0x1c],               // 0x8412de
  [dbl(0x4164fb18, 0), dbl(0x3fe99999, 0x9999999a), 0x1c],      // 0x8412b9
  [dbl(0x4168cba8, 0), dbl(0x3ff00000, 0), 0x1c],               // 0x841294
  [dbl(0x4156e360, 0), dbl(0x3fe26666, 0x66666666), 0x20],      // 0x841344
];
// 0x842000 (83bd00 − 1 → tabellen 0x841fe8) og 0x842064 (alder − 16 → tabellen 0x842030)
const T842000 = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 5, 5, 0, 2, 1, 4, 3];
const T842064 = [0, 1, 2, 3, 12, 12, 12, 12, 12, 12, 12, 12, 4, 5, 6, 2, 7, 8, 9, 10, 11, 11, 11, 11, 11];
// tabellen 0x842030: 0x841cef 4,5M · 0x841d0e 6M · 0x841d2d 8M · 0x841d4c 12M · 0x841ccc 15M · 0x841cac 12M · 0x841c86 10M · 0x841c60 5M ·
// 0x841c3a 2,5M · 0x841c14 1M · 0x841bee 750.000 · 0x841bc8 500.000 · (12) ingen
const AGE_CAP = [4500000.0, 6000000.0, 8000000.0, 12000000.0, 15000000.0, 12000000.0, 10000000.0, 5000000.0, 2500000.0, 1000000.0, 750000.0, 500000.0];

export const EVAL_STATS = { ts: 0, gen: 0, bad: 0 };

/** 0x840d80 (this, klub, staff, plads, &ud, tærskel, flag) → værdien; ud = planværdien. null = kør de oversatte instruktioner */
export function value_840d80(c: CmCtx, self: number, club: number, st: number, slot: number, out: number, thr: number, flag: number): number | null {
  const m: CmMem = c.m;
  const mgr = m.u32(club + 0xcf);
  if (mgr && !m.u32(mgr + 0x69)) return null;                               // 0x840dcc: rand – oversat
  if (humanClub_600a50(c, club)) return null;                               // 0x840e83/0x840efb: menneskets klub – oversat
  let v3c = m.s32(slot + 7);
  if (v3c <= 1) v3c = 1;
  let v18 = mgr;                                                             // [esp+0x18]
  let f = 4;                                                                 // [esp+0xf]
  let v20 = 0;
  // 0x840ded
  const g = m.u8(slot + 0x24) & 0x1e;
  let ebx: number;
  if (g === 4 || g === 6) {
    ebx = 0x5882;
    const k = s8(knowledge_5408c0(c, st, m.u32(club + 0xcf)));
    if (k >= 0 && k <= 4) ebx |= [0x40, 0x50, 0x10, 0x30, 0x20][k];
  } else if (g === 8) {
    ebx = 0x5982;
    const k = s8(knowledge_5408c0(c, st, m.u32(club + 0xcf)));
    if (k >= 0 && k <= 4) ebx = [0x59c2, 0x59d2, 0x5992, 0x59b2, 0x59a2][k];
  } else ebx = 0x5902;
  const mask = ebx;                                                          // [esp+0x10]
  // 0x840ed2
  if (m.u8(slot + 0x24) & 1) f = contractFlag_5445x0(c, st, 0, 2) ? 16 : 6;
  // 0x840fcb: den bedste vurderingsmand (ikke-spillerpost +0x69) – manageren og klubbens 7 trænere +0x1b3
  let e = 0;
  if (ebx & 0x100) {
    if (mgr) {
      const np = m.u32(mgr + 0x69);
      if (np) {
        e = attr(c, np, 6) & 0xff;
        const k = s8(knowledge_5408c0(c, st, mgr));
        if (k === 3) e = (e + 0xfb) & 0xff; else if (k === 4) e = (e + 0xf6) & 0xff;
      }
    }
    const rep = m.s16(club + 0x80);
    for (let i = 0; i < 7; i++) {
      const p = m.u32(club + 0x1b3 + 4 * i);
      if (!p) continue;
      const np = m.u32(p + 0x69);
      if (!np) continue;
      let bl = attr(c, np, 6) & 0xff;
      const k = s8(knowledge_5408c0(c, st, p));
      if (k === 3) { if (rep < 0xdac) continue; bl = (bl + 0xfb) & 0xff; } else if (k === 4) { if (rep < 0xdac) continue; bl = (bl + 0xf6) & 0xff; }
      if (s8(bl) <= s8(e)) continue;
      e = bl; v18 = p;
    }
  } else if (ebx & 0x80) {
    if (mgr) {
      const np = m.u32(mgr + 0x69);
      let bl = (attr(c, np, 5) + 5) & 0xff;
      e = bl;
      const k = s8(knowledge_5408c0(c, st, mgr));
      if (k === 3) { bl = (bl + 0xfb) & 0xff; e = bl; } else if (k === 4) { bl = (bl + 0xf6) & 0xff; e = bl; }
    }
    for (let i = 0; i < 7; i++) {
      const p = m.u32(club + 0x1b3 + 4 * i);
      if (!p) continue;
      const np = m.u32(p + 0x69);
      if (!np) continue;
      let bl = attr(c, np, 5) & 0xff;
      const k = s8(knowledge_5408c0(c, st, p));
      if (k === 3) bl = (bl + 0xfb) & 0xff; else if (k === 4) bl = (bl + 0xf6) & 0xff;
      if (s8(bl) <= s8(e)) continue;
      e = bl; v18 = p;
    }
  }
  // 0x84115a
  let a4 = -1;
  if (thr > -1) a4 = ftolE((thr * 2.5e-05 * thr) / f);
  const a1 = ((v18 & 0xffff0000) | m.u16(slot + 1)) | 0;
  let o = c.call(0x6e6340, st, a1, mask, club | 0, a4, v18 | 0) | 0;
  m.w32(out, o);
  if (m.u32(st + 0x39) !== club && contractFlag_5445x0(c, st, 0, 9)) { o = ftolE(o * 1.05); m.w32(out, o); }
  // 0x8411ce
  let ecxHi = o;
  if (o < 0 || o < ((thr - 10000) | 0)) return fail(c, st, slot, out);
  if (m.u8(slot + 0x24) & 1) return fail(c, st, slot, out);
  const id = m.s32(st);
  const b = m.u8((m.u32(G.ROWS) + 79 * id + 0xb) >>> 0) & 0xf;
  if (b) {
    ecxHi = (o + 0x1388) | 0;
    const t40 = ecxHi;
    const val = (crtPow(b, 2.0) * 0.01 + 1.0) * o;
    o = ftolE(t40 < val ? t40 : val);
    m.w32(out, o);
  }
  // 0x841265
  const k83 = s8(gcall(c, 0x83bd00, self, ((ecxHi & 0xffff0000) | m.u16(slot + 1)) | 0));
  const idx = k83 - 1;
  const sw = D_SW[idx >>> 0 <= 0x14 ? T842000[idx] : 5];
  let D40 = sw[0], D10 = sw[1], f2 = sw[2];
  // 0x841369
  let ebxV: number;
  const esi = m.s32(out);
  if (esi >= 0x88b8 && m.s32(slot + 0xb) >= tdiv(esi, 8) && m.s16(slot + 1) >= 0x80) {
    v20 = 1;
    ebxV = ftolE(((esi * 5e-05 - 1.0) * esi + m.s32(slot + 0xb) * 0.25) * 0.32);
  } else {
    ebxV = ftolE((m.s32(slot + 0xb) * 0.25 + esi * 0.75) * 0.32);
  }
  if (ebxV === 0) ebxV = 1;
  // 0x841404
  const grp = (m.u8(slot + 0x24) >>> 1) & 0xf;
  e = m.u8(st + 0x18);
  const ageBlock = () => {
    // 0x84148d / 0x84166f
    if (s8(e) >= 0x1b || esi <= 0x4e20) return;
    const j = s16(judge_6e86d0(c, m.u32(club + 0xcf), st, club, 1, tdiv(esi, 4)));
    const D18 = m.s32(out);
    let q = (j * 220.0) / D18;
    const D30 = D10 + 0.6;
    if (!(q < D30)) q = D30;
    const a = s8(e) - 0x18;
    if (a === 0) q = q * 0.7 + 0.3; else if (a === 1) q = (q + 1.0) * 0.5; else if (a === 2) q = q * 0.3 + 0.7;
    if (thr * 1.05 < D18 || v20) {
      if (q <= 1.0 || Number.isNaN(q)) return;
      const ax = m.s16(club + 0x80);
      const den = ax < 0x3e8 ? 0x3e8 : ax;
      let r = m.s16((9 * m.s32(club) + m.u32(self + 0xdc) + 5) >>> 0) / den;
      if (!(1.0 > r)) { if (1.2 < r) r = 1.2; } else r = 1.0;
      q = q * r;
    }
    if (q <= 1.0 || Number.isNaN(q)) return;
    D10 = q * D10;
    const h = (q + 1.0) * 0.5;
    ebxV = ftolE((ebxV >>> 0) * h);
    m.w32(out, ftolE(D18 * h));
  };
  switch (grp - 1) {
    case 0: case 1: ageBlock(); break;
    case 2:
      ebxV = ftolE((ebxV >>> 0) * (m.s16(slot + 1) < 0x80 ? 0.6666666666666666 : 0.9090909090909091));
      ageBlock();
      break;
    case 3: ebxV = ftolE((ebxV >>> 0) * 0.5); break;
    case 4: ebxV = ftolE((ebxV >>> 0) * 0.3333333333333333); f2 = (f2 + 0xf7) & 0xff; break;
    case 5: ebxV = ftolE((ebxV >>> 0) * 0.2); break;
  }
  // 0x84181e: alder over pladsens grænse
  const rec = m.u32(st + 0x61);
  if (s8(e) > s8(f2)) {
    const ea = s8(e), fa = s8(f2), d = ea - fa;
    let D28 = 0.0;
    const D18 = d;
    const D20 = 1.0 / (d * 0.3 + 0.8);
    const ax = m.s16(rec + 0xd);
    if (ax > 0x1770) D28 = ax * 0.00025 - 1.5;
    let M: number;
    if (nat53d980(c, st, m.u32(club + 0x53))) M = D20 / (D18 * 0.15 + 0.9);
    else {
      const g2 = m.u8(slot + 0x24) & 0x1e;
      if (ea > fa + 2 && (g2 === 8 || g2 === 6) && m.s16(rec + 0xb) < m.s16(club + 0x80)) M = (1.0 - (d - 2) * 0.06666666666666667) * D20;
      else M = D20;
    }
    if ((m.u8(slot + 0x24) & 0x1e) === 0xa) m.w32(out, ftolE(((1.0 - D28) * M + D28) * m.s32(out)));
    ebxV = ftolE(((1.0 - D28) * M + D28) * (ebxV >>> 0));
  }
  // 0x84196c
  const x = s8(m.u8(rec + 0x2d));
  const e1 = ftolE((1.0 - crtPow(x, 2.0) * 0.00016666666666666666) * (ebxV >>> 0));
  let V = (Math.imul(e1, e1) >>> 0) * D40 * 1e-08;
  D40 = V;
  const g3 = m.u8(slot + 0x24) & 0x1e;
  const crep = m.s16(club + 0x80);
  if (g3 === 0xc) {
    if (crep > 0x1388) { const t = (crep - 0x1388) * 20.0 + 50000.0; if (V > t) { V = (crep - 100000) + 50000.0; D40 = V; } }
    else { const t = crep * 10; if (V > t) { V = crep * 10.0; D40 = V; } }
  } else if (g3 === 0xa) {
    let t: number;
    if (crep > 0x1388) { const u = (crep - 0x1388) * 0.2 + 500.0; t = u * u; } else t = crep * crep * 0.010000000000000002;
    if (V > t) { V = t; D40 = V; }
  }
  // 0x841ad9: spillerens omdømme +0xd
  const si = m.s16(rec + 0xd);
  if (si <= 0x1388) { const Q = D10 * 10000000.0; if (Q < V) { V = Q; D40 = V; } }
  else if (si <= 0x1f40) { const Q = si * D10 * 1666.67 + 1650000.0; if (Q < V) { V = Q; D40 = V; } }
  else if (si < 0x2328) { const Q = (si * 7500.0 - 45000000.0) * D10; if (Q < V) { V = Q; D40 = V; } D10 = D10 * 1.5; }
  else { V = 100000000.0; D40 = V; D10 = D10 * 2.5; }
  // 0x841ba8: alderens loft
  const ai = s8(e) - 0x10;
  const ci = ai >>> 0 <= 0x18 ? T842064[ai] : 12;
  if (ci < 12) { const Q = D10 * AGE_CAP[ci]; if (Q < V) { V = Q; D40 = V; } }
  // 0x841d6d
  if (V > 1500000.0) {
    const j = s16(judge_6e86d0(c, m.u32(club + 0xcf), st, club, 2, tdiv(m.s32(out), 4)));
    if (j < 145.0) {
      let X = j * 0.025 - 2.625;
      if (!(0.0 <= X)) X = 0.0;
      V = (D40 - 1500000.0) * X + 1500000.0;
    } else V = D40;
  }
  // 0x841df6: divisionens niveau +0x69
  const div = m.u32(club + 0x57);
  if (div) {
    const dl = m.s16(div + 0x69);
    if (dl < 0x10) {
      const r = tdiv(crep, 500);                                              // (0x10624dd3, sar 5: / 500)
      const n = r > dl ? r : dl;
      let L = Math.imul(n, 670000);
      if (L <= 1000000) L = 1000000;
      const ax = m.s16(rec + 0xd);
      if (ax > 0x1f40) L = (L + Math.imul(ax - 0x1f40, 10000)) | 0;
      D40 = L;
      if (V > L) {
        const w = 1.0 < D10 ? 1.0 : D10;
        V = ftolE(L * w);
      }
    }
  }
  // 0x841ed2: klubbens land
  const nid = m.s32(m.u32(club + 0x53));
  if (nid === m.s32(0x9cf434)) {
    if (V < 6000000.0) V = (V * 1.6666666666666668e-07 * 0.6 + 0.3) * V;
    else V = V * 0.9;
  } else if (nid === m.s32(0x9cf300)) V = ftolE(V * 0.8);
  if (flag) {
    const t = v3c;
    if (t < V) V = t;
    V = ftolE(V);
  }
  return ftolE(V);
}

/** 0x841f62: under grænsen – lejepladsen (+0x24 & 1) med frikøb (0x544590): ud = max(ud + 5000, ud · 1,2) */
function fail(c: CmCtx, st: number, slot: number, out: number): number {
  const m = c.m;
  if (!(m.u8(slot + 0x24) & 1)) return 0;
  if (contractFlag_5445x0(c, st, 0, 2)) {
    const o = m.s32(out);
    const a = (o + 0x1388) | 0, b = o * 1.2;
    m.w32(out, ftolE(a > b ? a : b));
  }
  return 0;
}

const ENV = typeof process !== 'undefined' ? process.env ?? {} : {};
const CHECK = ENV.CM_SL_840CHECK === '1';
const HELP_TS = ENV.CM_SL_840HELP !== '0';
/** 0x544410 (ikke-spillerpost, b) – cmValue.ts' port (CM_SL_840CHECK: også den oversatte, sammenlignet) */
function attr(c: CmCtx, np: number, b: number): number {
  if (!HELP_TS) return gcall(c, 0x544410, 0, np, b);
  const v = shownAttr_544410(c.m, np, b);
  if (CHECK) { const w = gcall(c, 0x544410, 0, np, b); if ((v & 0xff) !== (w & 0xff)) { EVAL_STATS.bad++; console.log(`0x544410 afviger: TS ${v}, oversat ${w}`); } }
  return v;
}
/** 0x53d980 (staff, land, 1) – cmValue.ts' port */
function nat53d980(c: CmCtx, st: number, nat: number): number {
  if (!HELP_TS) return gcall(c, 0x53d980, 0, st, nat, 1);
  const v = knowsNation_53d980(c, st, nat, 1);
  if (CHECK) { const w = gcall(c, 0x53d980, 0, st, nat, 1); if (!v !== !w) { EVAL_STATS.bad++; console.log(`0x53d980 afviger: TS ${v}, oversat ${w}`); } }
  return v;
}
/** registreres som 0x840d80 for de oversatte kaldere (delt tilstand: argumenterne på stakken, ret 0x18) */
export function value_840d80_impl(c: CmCtx, ecx: number, args: number[], enter: (c: CmCtx, ecx: number, args: number[]) => { esp: number; eax: number; ret(n: number): number }): number {
  const R = enter(c, ecx, args), m = c.m, sp = R.esp >>> 0;
  const club = m.u32(sp + 4), st = m.u32(sp + 8), slot = m.u32(sp + 12), out = m.u32(sp + 16), thr = m.s32(sp + 20), flag = m.s32(sp + 24);
  const args6 = () => [club | 0, st | 0, slot | 0, out | 0, thr, flag];
  if (CHECK) {
    const a = args6();
    const o0 = m.s32(out);
    const r1 = value_840d80(c, ecx, club, st, slot, out, thr, flag);
    const o1 = m.s32(out);
    m.w32(out, o0);
    const r2 = GEN[0x840d80](c, ecx, a) | 0;
    if (r1 !== null) {
      EVAL_STATS.ts++;
      if (r1 !== r2 || o1 !== m.s32(out)) {
        if (EVAL_STATS.bad++ < 10) console.log(`0x840d80 afviger: TS ${r1}/${o1}, oversat ${r2}/${m.s32(out)}`, a.map((x) => (x >>> 0).toString(16)));
      }
    }
    else EVAL_STATS.gen++;
    R.eax = r2;
    return R.ret(6);
  }
  let r = ENV.CM_SL_840TS === '0' ? null : value_840d80(c, ecx, club, st, slot, out, thr, flag);
  if (r === null) { EVAL_STATS.gen++; r = GEN[0x840d80](c, ecx, args6()) | 0; } else EVAL_STATS.ts++;
  R.eax = r;
  return R.ret(6);
}
