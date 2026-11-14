// Originalens hukommelse som en tynd model – grundlaget for transfer-/kontraktporten (cmWage.ts, cmContractWant.ts, cmContract.ts).
//
// Funktionerne fra cm0102.exe 3.9.68 oversættes instruktion for instruktion mod originalens egne adresser: en post læses som i hukommelsen
// (`m.s16(staff + 0x18)` = `movsx …, word ptr [staff + 0x18]`), globale variabler på deres adresser ([0xae2364] antallet af personer,
// [0xae23bc] personerne à 0x6e bytes, [0xae23b4] klubberne à 0x245 bytes, [0xae2c90] dagens dato, [0xae1050] CONTRACT_MANAGER …).
// Kontrolsporet (scripts/ct-wage-check.ts) fylder hukommelsen med de poster, originalen havde ved kaldet; spillet (cmMemGame.ts) bygger de
// samme poster af vores spiltilstand. Konstanter fra .rdata står som tal med adressen i en kommentar.
//
// x87: mellemregninger i double (originalen 80 bit – samme resultat, når de gemmes som float/double eller sammenlignes mod konstanter, som
// porten gør); `fstp dword` = Math.fround. _ftol 0x945640 = trunkering (crtMath.ts' ftol for store tal).

export interface CmMem {
  u8(a: number): number;
  s8(a: number): number;
  u16(a: number): number;
  s16(a: number): number;
  u32(a: number): number;
  s32(a: number): number;
  f32(a: number): number;
  f64(a: number): number;
  w8(a: number, v: number): void;
  w16(a: number, v: number): void;
  w32(a: number, v: number): void;
  wf32(a: number, v: number): void;
  wf64(a: number, v: number): void;
}

const PAGE = 12;
const PMASK = (1 << PAGE) - 1;

/** Spredt hukommelse i sider à 4 KB; ulæste bytes er 0. `miss` kan fylde en side første gang, den læses (spillets dovne poster). */
export class SparseMem implements CmMem {
  private pages = new Map<number, Uint8Array>();
  private dv = new DataView(new ArrayBuffer(8));
  private miss?: (page: number, mem: SparseMem) => void;
  constructor(miss?: (page: number, mem: SparseMem) => void) { this.miss = miss; }
  page(p: number, create = true): Uint8Array | undefined {
    let b = this.pages.get(p);
    if (!b && create) {
      b = new Uint8Array(1 << PAGE);
      this.pages.set(p, b);
      this.miss?.(p, this);
    }
    return b;
  }
  u8(a: number): number { a >>>= 0; return this.page(a >>> PAGE)![a & PMASK]; }
  s8(a: number): number { return (this.u8(a) << 24) >> 24; }
  u16(a: number): number { return this.u8(a) | (this.u8(a + 1) << 8); }
  s16(a: number): number { return (this.u16(a) << 16) >> 16; }
  u32(a: number): number { return (this.u16(a) | (this.u16(a + 2) << 16)) >>> 0; }
  s32(a: number): number { return this.u32(a) | 0; }
  f32(a: number): number { this.dv.setUint32(0, this.u32(a), true); return this.dv.getFloat32(0, true); }
  f64(a: number): number { this.dv.setUint32(0, this.u32(a), true); this.dv.setUint32(4, this.u32(a + 4), true); return this.dv.getFloat64(0, true); }
  w8(a: number, v: number): void { a >>>= 0; this.page(a >>> PAGE)![a & PMASK] = v & 0xff; }
  w16(a: number, v: number): void { this.w8(a, v); this.w8(a + 1, v >> 8); }
  w32(a: number, v: number): void { this.w16(a, v); this.w16(a + 2, v >>> 16); }
  wf32(a: number, v: number): void { this.dv.setFloat32(0, v, true); this.w32(a, this.dv.getUint32(0, true)); }
  wf64(a: number, v: number): void { this.dv.setFloat64(0, v, true); this.w32(a, this.dv.getUint32(0, true)); this.w32(a + 4, this.dv.getUint32(4, true)); }
  /** skriv en række bytes (sporets hex-dump) */
  load(a: number, bytes: ArrayLike<number>): void { for (let i = 0; i < bytes.length; i++) this.w8(a + i, bytes[i]); }
  loadHex(a: number, hex: string): void { for (let i = 0; i + 1 < hex.length; i += 2) this.w8(a + i / 2, parseInt(hex.slice(i, i + 2), 16)); }
}

/** Originalens globale adresser, som portene læser */
export const G = {
  /** [0xae2364] antallet af personer i databasen (id ≥ = genererede/menneskelige managere) */
  STAFF_COUNT: 0xae2364,
  /** [0xae23bc] personerne (staff) à 0x6e bytes */
  STAFF: 0xae23bc,
  /** [0xae23b4] klubberne à 0x245 bytes */
  CLUBS: 0xae23b4,
  /** [0xae2c90] dagens dato (Date: +0 dag i året s16, +2 år s16, +4 skudår) og [0xae2c88] tidspunktet 0..2 */
  TODAY: 0xae2c90,
  SLICE: 0xae2c88,
  /** [0xae1050] CONTRACT_MANAGER (this): +0 kontrakterne à 80 bytes */
  CM: 0xae1050,
  /** [0xae2d0c] rækkerne à 79 bytes pr. person: +0 kontraktens indeks, +4 lejekontraktens (−1 = ingen), +0xa staffState */
  ROWS: 0xae2d0c,
  /** [0xae1080] den sidst slåede kontrakt (0x864550 og 0x4c7ac0 skriver den) */
  LAST_CONTRACT: 0xae1080,
  /** [0xae233c] spillets indstilling (0x864550 0x8650cd: = 1 …) */
  B_AE233C: 0xae233c,
} as const;

export const f32 = Math.fround;
export const s8 = (v: number) => (v << 24) >> 24;
export const u8 = (v: number) => v & 0xff;
export const s16 = (v: number) => (v << 16) >> 16;
export const u16 = (v: number) => v & 0xffff;
/** _ftol 0x945640: trunkering mod 0 (resultatet som 32-bit heltal – store tal ombrydes som i originalens fistp-sti) */
export const ftol = (x: number) => {
  const t = Math.trunc(x);
  return Number.isFinite(t) ? Number(BigInt.asIntN(32, BigInt(t))) : -0x80000000;
};
/** idiv med trunkering (C) */
export const tdiv = (a: number, b: number) => Math.trunc(a / b) | 0;

/** Kald, porten ikke selv laver: tilfældige tal 0x90cfc0 og de funktioner, der ikke er porteret (resultatet fra sporet eller spillets adapter).
 *  `call(adr, …args)` er originalens funktion på adressen med samme argumenter (adresser til poster som tal). */
export interface CmCtx {
  m: CmMem;
  rand(n: number): number;
  call(adr: number, ...args: number[]): number;
  /** kontrollen: porterede funktioners resultater (adresse, værdi) i rækkefølge */
  probe?(adr: number, v: number): void;
  /** kontrollen: svar fra sporet i stedet for den oversatte funktion (cmGen) – for kald, hvis hukommelse sporet ikke gengiver */
  useLog?(adr: number): boolean;
}

/** staff-post af id */
export const staffAt = (m: CmMem, id: number) => (m.u32(G.STAFF) + 0x6e * id) >>> 0;
/** klub-post af id */
export const clubAt = (m: CmMem, id: number) => (m.u32(G.CLUBS) + 0x245 * id) >>> 0;
/** 0x4cf5a0 CONTRACT_MANAGER::get_contract(staff): personens egen kontrakt (80 bytes) eller 0 */
export function getContract(m: CmMem, staff: number): number {
  if (!staff) return 0;
  const id = m.s32(staff);
  if (id >= m.s32(G.STAFF_COUNT)) return 0;
  const ix = m.s32(m.u32(G.ROWS) + 79 * id);
  if (ix < 0) return 0;
  return (m.u32(m.u32(G.CM)) + 80 * ix) >>> 0;
}
/** 0x4cf6d0 CONTRACT_MANAGER::get_loan_contract(staff) */
export function getLoanContract(m: CmMem, staff: number): number {
  if (!staff) return 0;
  const id = m.s32(staff);
  if (id >= m.s32(G.STAFF_COUNT)) return 0;
  const ix = m.s32(m.u32(G.ROWS) + 79 * id + 4);
  if (ix < 0) return 0;
  return (m.u32(m.u32(G.CM)) + 80 * ix) >>> 0;
}

/** skrabeplads til ud-parametre fra kald (under billedet 0x400000 og over cmContract.ts' stak 0x2ff000 / cmContractWant.ts' SCR 0x300000) */
export const OUT_SCRATCH = 0x00380000;
/** 0x540a50(club, &ud, 1) som kalderne 0x5a0590/0x4cf5f0 bruger den: B-holdets moderklub, når eax ≠ 0 og ud = 0, ellers 0 */
export function parentClub_540a50(c: CmCtx, club: number): number {
  c.m.w32(OUT_SCRATCH, 0);
  const p = c.call(0x540a50, club, OUT_SCRATCH, 1) >>> 0;
  return p && c.m.u32(OUT_SCRATCH) === 0 ? p : 0;
}
