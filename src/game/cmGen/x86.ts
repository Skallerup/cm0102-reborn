// Køretid for de mekanisk oversatte funktioner i src/game/cmGen/f_*.ts (transfer/kontrakt runde 2, 13/11-2026).
//
// Funktionerne er oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py: hver x86-instruktion er én
// TS-sætning på registrene (R.eax …), originalens hukommelse (CmMem på originalens adresser) og x87-stakken (doubles – originalen kører med
// præcisionskontrol 53 bit, se cmMaxWage.ts). Flagene sættes som af processoren (ZF/SF/CF/OF); fnstsw giver C0/C2/C3. Stakken er ægte
// hukommelse fra STACK_TOP og nedad, så ud-parametre og lokale variabler ligger på adresser som i originalen (bare et andet sted).
// Kald: `R.call(adr)` slår funktionen op i CALLEES (porterede funktioner med originalens kaldkonvention) og går ellers til c.call (sporet /
// spillets adapter) – argumenterne læses af stakken.
import type { CmCtx, CmMem } from '../cmMem';
import { ftol as ftol32 } from '../cmMem';

/** Windows-API'erne: navn → (antal stdcall-argumenter, funktion). Udfyldes af den, der kører koden (skyggeverdenen: winapi.ts). */
export const API = new Map<string, { n: number; f: (R: X86, a: number[]) => number }>();
const apiArgs = (name: string) => { const e = API.get(name.split('!')[1]); if (!e) throw new Error(`Windows-API ikke implementeret: ${name}`); return e.n; };
const callApi = (R: X86, name: string, a: number[]) => { const r = API.get(name.split('!')[1])!.f(R, a); if (API_LOG.on) console.log(`api ${name}(${a.map((x) => (x >>> 0).toString(16)).join(',')}) = ${(r >>> 0).toString(16)}`); return r; };
export const API_LOG = { on: false };
/** værtsfunktioner bag falske adresser (GetProcAddress): stdcall med n argumenter – kaldes indirekte */
/** importtabellens værdier i hukommelsen (Bosman-runtimens stubadresser) → API-navn: indirekte kald gennem en peger, der er læst af IAT'en */
export const API_BY_ADDR = new Map<number, string>();
export const HOSTFN = new Map<number, { n: number; f: (R: X86, a: number[]) => number }>();
/** håndindsatte genveje i en oversat funktion (f_83f3a0.ts ved 0x83fa25): ny pc eller 0 = fortsæt som oversat */
export const PC_HOOK: Record<number, ((R: X86) => number) | undefined> = {};
/** fejlsøgning: kaldes ved hver blok (pc) når on */
export const TRACE: { on: boolean; f?: (pc: number, R: X86) => void } = { on: false };
export const STACK_TOP = 0x003f8000;
let top = STACK_TOP;
/** kør en oversat funktion på en given processortilstand (skyggeverdenen: oraklets registre og stak – returadressen ligger ved esp) */
export function runOn(R: X86, f: Impl): void { PENDING = R; R.retN = 0; const saved = top; top = (R.esp - 4) | 0; try { f(R.c, R.ecx, []); } finally { PENDING = null; top = saved; } }

/** en kaldt funktions konvention: n argumenter på stakken, this i ecx, callee rydder (stdcall/thiscall) eller kalderen (cdecl), retur i st0 */
export interface Conv { n: number; thisEcx: boolean; calleeClean: boolean; float?: boolean }
export type Impl = (c: CmCtx, ecx: number, args: number[]) => number;
const IMPL = new Map<number, Impl>();
/** de mekanisk oversatte funktioner (gen): de kaldes med DELT processortilstand – samme X86 (registre, x87-stak), ægte stak med returadressen,
 *  og den kaldte fjerner selv sine argumenter (ret N) – præcis som processoren. Håndporterede funktioner får argumenterne som tal (Impl). */
const GENSET = new Set<number>();
const GENF = new Map<number, Impl>();
const NOARGS: number[] = [];
/** delt tilstand slås til af skyggeverdenen (scripts/sw-*.ts); ellers som før (argumenter som tal, nyt X86 pr. kald) */
export const SHARED = { on: false };
/** en porteret funktion melder sig (de oversatte funktioner kalder den i stedet for c.call); gen = mekanisk oversat (delt tilstand) */
/** den registrerede funktion på adressen (til omslag i skyggen) */
export function implOf(adr: number): Impl { const f = IMPL.get(adr); if (!f) throw new Error(`implOf: 0x${adr.toString(16)}`); return f; }
export function registerImpl(adr: number, f: Impl, gen = false): void { IMPL.set(adr, f); if (gen) { GENSET.add(adr); GENF.set(adr, f); } else { GENSET.delete(adr); GENF.delete(adr); } }
/** falsk returadresse, som de delte kald skubber (kun til fejlsøgning) */
export const FAKE_RET = 0xfeedf00d;
let PENDING: X86 | null = null;

const dv = new DataView(new ArrayBuffer(8));
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;

export class X86 {
  eax = 0; ebx = 0; ecx = 0; edx = 0; esi = 0; edi = 0; ebp = 0; esp = 0;
  zf = false; sf = false; cf = false; of = false;
  st: number[] = [];      // st[0] = ST(0)
  c0 = false; c2 = false; c3 = false;
  /** x87-kontrolordet (0x27f = 53 bit, afrunding til nærmeste) og retningsflaget */
  cw = 0x27f; df = false;
  c: CmCtx; m: CmMem;
  /** ret N i den senest returnerede oversatte funktion (antal argumentord, den kaldte fjerner) */
  retN = 0;
  constructor(c: CmCtx, m: CmMem) { this.c = c; this.m = m; }
  /** ret [N] i en oversat funktion: N noteres til kalderen (delt kald), returværdien er eax (eller ST(0) for float-funktioner) */
  ret(n: number, fl = false): number { this.retN = n; return fl ? this.st[0] : this.eax; }
  /** delt kald af en oversat funktion: returadressen skubbes, funktionen kører på denne tilstand, ret fjerner returadressen + N ord */
  private shared(f: Impl, tail = false): void {
    if (!tail) this.push(FAKE_RET);
    const saved = top;
    top = (this.esp - 4) | 0;
    PENDING = this; this.retN = 0;
    try { f(this.c, this.ecx, NOARGS); } finally { PENDING = null; top = saved; }
    if (!tail) this.esp = (this.esp + 4 + 4 * this.retN) | 0;
  }

  // ------------------------------------------------ flag
  logic(r: number, bits: number): number { r = mask(r, bits); this.zf = r === 0; this.sf = sign(r, bits); this.cf = false; this.of = false; return r; }
  add(a: number, b: number, bits: number, carry = 0): number {
    a = mask(a, bits); b = mask(b, bits);
    const full = a + b + carry, r = mask(full, bits);
    this.cf = full > maxU(bits); this.zf = r === 0; this.sf = sign(r, bits);
    this.of = sign(a, bits) === sign(b, bits) && sign(r, bits) !== sign(a, bits);
    return r;
  }
  sub(a: number, b: number, bits: number, borrow = 0): number {
    a = mask(a, bits); b = mask(b, bits);
    const full = a - b - borrow, r = mask(full, bits);
    this.cf = full < 0; this.zf = r === 0; this.sf = sign(r, bits);
    this.of = sign(a, bits) !== sign(b, bits) && sign(r, bits) !== sign(a, bits);
    return r;
  }
  incdec(a: number, d: number, bits: number): number { const cf = this.cf; const r = d > 0 ? this.add(a, 1, bits) : this.sub(a, 1, bits); this.cf = cf; return r; }
  neg(a: number, bits: number): number { const r = this.sub(0, a, bits); this.cf = mask(a, bits) !== 0; return r; }
  shl(a: number, n: number, bits: number): number {
    n &= 31; if (!n) return mask(a, bits);
    a = mask(a, bits); const r = mask(a * 2 ** n, bits);
    this.cf = n <= bits ? ((a >>> (bits - n)) & 1) === 1 : false; this.zf = r === 0; this.sf = sign(r, bits); this.of = sign(r, bits) !== this.cf;
    return r;
  }
  shr(a: number, n: number, bits: number): number {
    n &= 31; if (!n) return mask(a, bits);
    a = mask(a, bits); const r = Math.floor(a / 2 ** n);
    this.cf = ((a >>> (n - 1)) & 1) === 1; this.zf = r === 0; this.sf = sign(r, bits); this.of = sign(a, bits);
    return r;
  }
  sar(a: number, n: number, bits: number): number {
    n &= 31; if (!n) return mask(a, bits);
    const sv = sx(a, bits); const r = mask(sv >> Math.min(n, 31), bits);
    this.cf = ((sv >> (n - 1)) & 1) === 1; this.zf = r === 0; this.sf = sign(r, bits); this.of = false;
    return r;
  }
  // ------------------------------------------------ betingelser
  get cE() { return this.zf; }
  get cL() { return this.sf !== this.of; }
  get cLE() { return this.zf || this.sf !== this.of; }
  get cB() { return this.cf; }
  get cBE() { return this.cf || this.zf; }
  // ------------------------------------------------ stak
  push(v: number): void { this.esp = (this.esp - 4) | 0; this.m.w32(this.esp >>> 0, v); }
  pop(): number { const v = this.m.u32(this.esp >>> 0); this.esp = (this.esp + 4) | 0; return v | 0; }
  // ------------------------------------------------ x87
  fpush(v: number): void { if (this.st.length >= 8) throw new Error('x87-stakken over 8'); this.st.unshift(v); }
  fpop(): number { return this.st.shift()!; }
  fcom(a: number, b: number): void {
    if (Number.isNaN(a) || Number.isNaN(b)) { this.c0 = this.c2 = this.c3 = true; return; }
    this.c2 = false; this.c0 = a < b; this.c3 = a === b;
  }
  /** fnstsw ax */
  sw(): number { return (this.c0 ? 0x100 : 0) | (this.c2 ? 0x400 : 0) | (this.c3 ? 0x4000 : 0); }
  f32(a: number): number { return this.m.f32(a >>> 0); }
  f64(a: number): number { return this.m.f64(a >>> 0); }
  i64(a: number): number { return this.m.s32((a + 4) >>> 0) * 4294967296 + this.m.u32(a >>> 0); }
  wi64(a: number, v: number): void { const t = BigInt.asUintN(64, BigInt(v)); this.m.w32(a >>> 0, Number(t & 0xffffffffn)); this.m.w32((a + 4) >>> 0, Number(t >> 32n)); }
  /** _ftol 0x945640: trunkering af ST(0) (pop) → edx:eax */
  ftol(): void {
    const v = this.fpop(), t = Math.trunc(v);
    if (Math.abs(t) < 2 ** 31) { this.eax = t | 0; this.edx = t < 0 ? -1 : 0; return; }
    const b = BigInt.asUintN(64, BigInt(Number.isFinite(t) ? t : -(2 ** 63)));
    this.eax = Number(b & 0xffffffffn) | 0; this.edx = Number(b >> 32n) | 0;
    void ftol32;
  }
  /** fistp/frndint efter kontrolordets RC (0 nærmeste lige, 1 ned, 2 op, 3 mod 0) */
  frndint(v: number): number {
    const rc = (this.cw >> 10) & 3;
    if (rc === 1) return Math.floor(v); if (rc === 2) return Math.ceil(v); if (rc === 3) return Math.trunc(v);
    const f = Math.floor(v), d = v - f; return d > 0.5 || (d === 0.5 && f % 2 !== 0) ? f + 1 : f;
  }
  shld(a: number, b: number, n: number): number { n &= 31; if (!n) return a >>> 0; const r = ((a << n) | (b >>> (32 - n))) >>> 0; this.cf = ((a >>> (32 - n)) & 1) === 1; this.zf = r === 0; this.sf = (r >>> 31) === 1; return r; }
  shrd(a: number, b: number, n: number): number { n &= 31; if (!n) return a >>> 0; const r = ((a >>> n) | (b << (32 - n))) >>> 0; this.cf = ((a >>> (n - 1)) & 1) === 1; this.zf = r === 0; this.sf = (r >>> 31) === 1; return r; }
  // ------------------------------------------------ strengoperationer (DF = 0)
  str(op: string): void {
    const m = this.m;
    const pre = op.startsWith('repne ') ? 'ne' : op.startsWith('repe ') ? 'e' : op.startsWith('rep ') ? 'r' : '';
    const base = op.replace(/^rep(n?e)? /, '');
    const w = base.endsWith('d') ? 4 : base.endsWith('w') ? 2 : 1;
    const rd = (a: number) => (w === 4 ? m.u32(a >>> 0) : w === 2 ? m.u16(a >>> 0) : m.u8(a >>> 0));
    const wr = (a: number, v: number) => (w === 4 ? m.w32(a >>> 0, v) : w === 2 ? m.w16(a >>> 0, v) : m.w8(a >>> 0, v));
    const acc = () => (w === 4 ? this.eax >>> 0 : w === 2 ? this.eax & 0xffff : this.eax & 0xff);
    const d = this.df ? -w : w;
    const one = () => {
      if (base.startsWith('movs')) { wr(this.edi, rd(this.esi)); this.esi = (this.esi + d) | 0; this.edi = (this.edi + d) | 0; }
      else if (base.startsWith('stos')) { wr(this.edi, acc()); this.edi = (this.edi + d) | 0; }
      else if (base.startsWith('scas')) { this.sub(acc(), rd(this.edi), w * 8); this.edi = (this.edi + d) | 0; }
      else { this.sub(rd(this.esi), rd(this.edi), w * 8); this.esi = (this.esi + d) | 0; this.edi = (this.edi + d) | 0; }   // cmps
    };
    if (!pre) { one(); return; }
    if ((this.ecx >>> 0) > 0x4000000 && base !== 'scasb') throw new Error(`${op}: ecx = ${(this.ecx >>> 0).toString(16)}`);
    let guard = 0;
    while (this.ecx !== 0) {
      one(); this.ecx = (this.ecx - 1) | 0;
      if (++guard > 0x1000000) throw new Error(`${op}: over 16 M (al ${this.eax & 0xff}, edi ${(this.edi >>> 0).toString(16)})`);
      if (pre === 'ne' && this.zf) break;
      if (pre === 'e' && !this.zf) break;
    }
  }
  // ------------------------------------------------ Windows-API (importtabellen) – implementeret i API (winapi.ts registrerer)
  /** kald fra et kaldested: argumenterne ved esp, stdcall (API'en rydder) */
  api(name: string): void { const n = apiArgs(name); const a: number[] = []; for (let i = 0; i < n; i++) a.push(this.m.u32((this.esp + 4 * i) >>> 0)); this.eax = callApi(this, name, a) | 0; this.esp = (this.esp + 4 * n) | 0; }
  /** halekald (jmp [IAT]) fra en importstub: returadressen ligger stadig øverst, argumenterne efter den */
  apiTail(name: string): void { const n = apiArgs(name); const a: number[] = []; for (let i = 0; i < n; i++) a.push(this.m.u32((this.esp + 4 + 4 * i) >>> 0)); this.eax = callApi(this, name, a) | 0; this.retN = n; }
  /** halekald gennem en peger (jmp [reg + d]) */
  callIndTail(target: number): void {
    const t = target >>> 0;
    if (SHARED.on && GENSET.has(t)) { this.shared(IMPL.get(t)!, true); return; }
    const an = API_BY_ADDR.get(t);
    if (an) { this.apiTail(an); return; }
    this.esp = (this.esp + 4) | 0; this.callInd(target); this.esp = (this.esp - 4) | 0; this.retN = 0;
  }
  // ------------------------------------------------ kald
  /** indirekte kald: en oversat/porteret funktion på adressen (cdecl – stakken efterlades), ellers c.call med 8 stakord */
  callInd(target: number): void {
    target >>>= 0;
    if (SHARED.on && GENSET.has(target) && !this.c.useLog?.(target)) { this.shared(IMPL.get(target)!); return; }
    const an = API_BY_ADDR.get(target);
    if (an) { this.api(an); return; }
    const h = HOSTFN.get(target);
    if (h) { const a: number[] = []; for (let i = 0; i < h.n; i++) a.push(this.m.u32((this.esp + 4 * i) >>> 0)); this.eax = h.f(this, a) | 0; this.esp = (this.esp + 4 * h.n) | 0; return; }
    const args: number[] = [];
    for (let i = 0; i < 8; i++) args.push(this.m.s32((this.esp + 4 * i) >>> 0));
    const saved = top;
    top = (this.esp - 4) | 0;
    try {
      const f = IMPL.get(target);
      this.eax = (f ? f(this.c, this.ecx, args) : this.c.call(target, ...args)) | 0;
    } finally { top = saved; }
  }
  /** kald adr med konventionen; argumenterne står på stakken ved esp (returadressen er ikke skubbet) */
  call(adr: number, cv: Conv): void {
    if (adr >= 0x944000 && adr < 0x94c000 && CRT[adr]) { CRT[adr](this); return; }
    if (SHARED.on) { const f = GENF.get(adr); if (f !== undefined && !(this.c.useLog && this.c.useLog(adr))) { this.shared(f); if (this.c.probe) this.c.probe(adr, cv.float ? this.st[0] : this.eax); return; } }
    const args: number[] = [];
    for (let i = 0; i < cv.n; i++) args.push(this.m.s32((this.esp + 4 * i) >>> 0));
    const saved = top;
    top = (this.esp - 4) | 0;
    let r: number;
    try {
      const f = this.c.useLog?.(adr) ? undefined : IMPL.get(adr);
      r = f ? f(this.c, this.ecx, args) : cv.thisEcx ? this.c.call(adr, this.ecx, ...args) : this.c.call(adr, ...args);
      if (f) this.c.probe?.(adr, r);
    } finally { top = saved; }
    if (cv.float) this.fpush(r); else { this.eax = r | 0; }
    if (cv.calleeClean) this.esp = (this.esp + 4 * cv.n) | 0;
  }
}

// ------------------------------------------------ CRT (MSVC 6), som Shortlist_Manager/TRANSFER_MANAGER-oversættelserne kalder (14/11-2026)
/** heapen: en bumpallokator i den spredte hukommelse ([HEAP_PTR] = næste ledige adresse); free gør intet */
export const HEAP0 = 0x60000000, HEAP_PTR = 0x5ffffff0;
function heapAlloc(m: CmMem, n: number): number {
  let p = m.u32(HEAP_PTR) >>> 0;
  if (p < HEAP0) p = HEAP0;
  const a = (p + 15) & ~15;
  m.w32(HEAP_PTR, (a + Math.max(16, n + 16)) >>> 0);
  m.w32(a - 4, n);                                                            // størrelsen (realloc kopierer den)
  return a >>> 0;
}
/** qsort-sammenligningerne (cdecl, pegere til posterne) – porteret i hånden */
export const QSORT_CMP: Record<number, (m: CmMem, a: number, b: number) => number> = {
  // 0x83b670 positionslisterne: +8 værdien, så +4 nøglen
  0x83b670: (m, a, b) => { const d = (m.s32(a + 8) - m.s32(b + 8)) | 0; return d !== 0 ? d : (m.s32(a + 4) - m.s32(b + 4)) | 0; },
  // 0x83b690 pladserne: uden mål og uden bud først, så faldende +0xb (aldrig 0)
  0x83b690: (m, a, b) => {
    if (m.s32(a + 0xf) > -1) return 1;
    if (m.s32(b + 0xf) > -1) return -1;
    if (m.s32(a + 0x17) > -1) return 1;
    if (m.s32(b + 0x17) > -1) return -1;
    const d = (m.s32(b + 0xb) - m.s32(a + 0xb)) | 0;
    return d !== 0 ? d : 1;
  },
  // 0x83b6c0 pladserne efter indekset +0x23 (aldrig 0)
  0x83b6c0: (m, a, b) => { const d = s8(m.u8(a + 0x23)) - s8(m.u8(b + 0x23)); return d !== 0 ? d : 1; },
};
const arg = (R: X86, i: number) => R.m.u32((R.esp + 4 * i) >>> 0);
const CRT: Record<number, (R: X86) => void> = {
  // operator new / malloc
  0x944e46: (R) => { R.eax = heapAlloc(R.m, arg(R, 0)) | 0; },
  0x944cf1: (R) => { R.eax = heapAlloc(R.m, arg(R, 0)) | 0; },
  // atexit(fn) – de statiske lokale variablers destruktor (0x54cab0/0x54c770/0x54cc30's engangsinitialisering): intet
  0x94627a: (R) => { R.eax = 0; },
  // free
  0x9452ca: (R) => { R.eax = 0; },
  0x944c94: (R) => { R.eax = 0; },
  // realloc(p, n)
  0x945667: (R) => {
    const p = arg(R, 0), n = arg(R, 1), m = R.m;
    const a = heapAlloc(m, n);
    if (p) { const old = Math.min(m.u32(p - 4), n); for (let i = 0; i < old; i++) m.w8(a + i, m.u8(p + i)); }
    R.eax = a | 0;
  },
  // qsort(base, n, w, cmp)
  0x945333: (R) => {
    const m = R.m, base = arg(R, 0), n = arg(R, 1), w = arg(R, 2), cmpA = arg(R, 3);
    const cmp = QSORT_CMP[cmpA];
    if (!cmp) throw new Error(`qsort: sammenligningen 0x${cmpA.toString(16)} er ikke porteret`);
    if (n < 2) return;
    const recs: Uint8Array[] = [];
    for (let i = 0; i < n; i++) { const r = new Uint8Array(w); for (let k = 0; k < w; k++) r[k] = m.u8(base + i * w + k); recs.push(r); }
    // sammenligningen læser posterne i hukommelsen: to skrabeposter
    const SA = 0x5fff0000, SB = SA + 0x400;
    const ix = recs.map((_, i) => i);
    msvcSort(ix, (x, y) => { for (let k = 0; k < w; k++) { m.w8(SA + k, recs[x][k]); m.w8(SB + k, recs[y][k]); } return cmp(m, SA, SB); });
    ix.forEach((j, i) => { for (let k = 0; k < w; k++) m.w8(base + i * w + k, recs[j][k]); });
  },
  // pow (x = ST(1), y = ST(0)) – crtMath.ts
  0x945ff0: (R) => { const y = R.fpop(), x = R.fpop(); R.fpush(crtPowX(x, y)); },
  // __alldiv (stdcall, 4): (a_lo, a_hi, b_lo, b_hi) → edx:eax
  0x945e80: (R) => {
    const a = (BigInt(R.m.s32((R.esp + 4) >>> 0)) << 32n) | BigInt(arg(R, 0)), b = (BigInt(R.m.s32((R.esp + 12) >>> 0)) << 32n) | BigInt(arg(R, 2));
    const q = BigInt.asUintN(64, a / b);
    R.eax = Number(q & 0xffffffffn) | 0; R.edx = Number(q >> 32n) | 0; R.esp = (R.esp + 16) | 0;
  },
  // strstr(s, t)
  0x945a60: (R) => {
    const rd = (a: number) => { let s = ''; for (let i = 0; i < 4096; i++) { const b = R.m.u8(a + i); if (!b) break; s += String.fromCharCode(b); } return s; };
    const s = arg(R, 0), t = arg(R, 1), k = rd(s).indexOf(rd(t));
    R.eax = k < 0 ? 0 : (s + k) | 0;
  },
};
/** MSVC 6 qsort.c (engine/grid/loop.ts msvcQsort) på indekser */
let msvcSort: (a: number[], comp: (x: number, y: number) => number) => void = () => { throw new Error('qsort: msvcSort ikke sat'); };
let crtPowX: (x: number, y: number) => number = Math.pow;
export function setCrt(sort: typeof msvcSort, pow: typeof crtPowX): void { msvcSort = sort; crtPowX = pow; }

const mask = (v: number, bits: number) => (bits === 32 ? v >>> 0 : bits === 16 ? v & 0xffff : v & 0xff);
const maxU = (bits: number) => (bits === 32 ? 0xffffffff : bits === 16 ? 0xffff : 0xff);
const sign = (v: number, bits: number) => ((v >>> (bits - 1)) & 1) === 1;
const sx = (v: number, bits: number) => (bits === 32 ? v | 0 : bits === 16 ? s16(v) : s8(v));

/** ramme for en oversat funktion: stakken med argumenterne (og en falsk returadresse) under den aktuelle top */
export function enter(c: CmCtx, ecx: number, args: number[]): X86 {
  if (PENDING) { const P = PENDING; PENDING = null; return P; }   // delt kald (X86.shared)
  const R = new X86(c, c.m);
  R.esp = (top - 4 * args.length - 4) | 0;
  for (let i = 0; i < args.length; i++) c.m.w32((R.esp + 4 + 4 * i) >>> 0, args[i]);
  c.m.w32(R.esp >>> 0, 0xdeadbeef);
  R.ecx = ecx | 0;
  return R;
}
/** ST(0) som returværdi (double), sat i en float-funktion */
export const fret = (R: X86) => R.st[0];
export { s8, s16, dv };
/** opslag i en skrivebeskyttet tabel i exe'en (.text/.rdata), indsat som konstanter af oversætteren */
export function ROT(tab: (number | string)[], base: number, size: number, addr: number): number {
  const k = ((addr >>> 0) - base) / size;
  if (!Number.isInteger(k) || k < 0 || k >= tab.length) throw new Error(`ROT ${base.toString(16)}: indeks ${k}`);
  return Number(tab[k]);
}
