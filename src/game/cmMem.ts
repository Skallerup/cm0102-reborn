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
/** det fælles tomme andet niveau (kun null) i SparseMem's sidetabel */
const NOPAGES: (Uint8Array | null)[] = new Array(1024).fill(null);
/** genbrugte sider (SparseMem.release) – nulstilles, før de bruges igen */
const POOL: Uint8Array[] = [];
const POOL_MAX = 24000;
/** genbrugte andet niveau-tabeller i SparseMem's sidetabel (SparseMem.release) – kun null, før de bruges igen */
const TPOOL: (Uint8Array | null)[][] = [];
const TPOOL_MAX = 2048;
/** sider, der er udsnit af en importeret tabel (SparseMem.importPages): tabellen og sidens plads i den */
const VIEWS = new WeakMap<Uint8Array, { seg: Uint8Array; i: number }>();
/** (hukommelse, 22/11) puljens sider slippes – nyt spils arbejder før den sidste kopi til hovedtråden (op til ~100 MB). Puljen er kun genbrug: en ny side
 *  nulstilles altid (page), så indholdet er det samme med og uden puljen. */
export function releasePagePool(): void { POOL.length = 0; TPOOL.length = 0; }

/** Spredt hukommelse i sider à 4 KB; ulæste bytes er 0. `miss` kan fylde en side første gang, den læses (spillets dovne poster). */
export class SparseMem implements CmMem {
  private pages = new Map<number, Uint8Array>();
  private dv = new DataView(new ArrayBuffer(8));
  private miss?: (page: number, mem: SparseMem) => void;
  /** sidetabellen i to niveauer (sidenummerets øverste 10 bit → 1024 sider): et opslag uden Map og uden cache-tab */
  private dir: (Uint8Array | null)[][] = new Array(1024).fill(NOPAGES);
  /** en hukommelse nedenunder, som læsninger går igennem til, når siden ikke er her (skrivninger kopierer siden først via `miss`) */
  private under: SparseMem | null = null;
  constructor(miss?: (page: number, mem: SparseMem) => void, under?: SparseMem) { this.miss = miss; this.under = under ?? null; }
  /** siden til læsning: egen, ellers den underliggende hukommelses (uden kopi), ellers en ny */
  private rp(p: number): Uint8Array {
    const b = this.dir[p >>> 10][p & 1023];
    if (b !== null) return b;
    if (this.under) { const u = this.under.dir[p >>> 10][p & 1023]; if (u !== null) return u; }
    return this.page(p)!;
  }
  page(p: number, create = true): Uint8Array | undefined {
    const b = this.dir[p >>> 10][p & 1023];
    if (b !== null) return b;
    if (!create) return undefined;
    const r = POOL.pop();
    let nb: Uint8Array;
    if (r) { r.fill(0); nb = r; } else nb = new Uint8Array(1 << PAGE);
    let t = this.dir[p >>> 10];
    if (t === NOPAGES) { t = TPOOL.pop() ?? new Array(1024).fill(null); this.dir[p >>> 10] = t; }
    t[p & 1023] = nb;
    this.pages.set(p, nb);
    if (this.miss) { this.miss(p, this); return t[p & 1023]!; }      // (miss kan have lagt en anden side ind – adoptPage)
    return nb;
  }
  /** (hukommelse, 25/11) kun fra `miss` for siden p, der netop er lavet her: `src`'s side p flyttes hertil i stedet for at blive kopieret (den nye,
   *  tomme side går tilbage til puljen). `src` mister siden – kun når den ikke bruges til siden igen (ønskelisternes portioner, cmSlMem.ts). */
  adoptPage(p: number, src: SparseMem): boolean {
    const st = src.dir[p >>> 10], b = st[p & 1023];
    if (b === null) return false;
    st[p & 1023] = null; src.pages.delete(p);
    const t = this.dir[p >>> 10], nb = t[p & 1023];
    t[p & 1023] = b; this.pages.set(p, b);
    if (nb && nb !== b && POOL.length < POOL_MAX && !VIEWS.has(nb)) POOL.push(nb);
    return true;
  }
  /** (hastighed) siden med adressen til læsning – samme som u8/u32 læser (egen, den underliggende eller en ny via `miss`) */
  readPage(a: number): Uint8Array { return this.rp((a >>> 0) >>> PAGE); }
  u8(a: number): number { a >>>= 0; return this.rp(a >>> PAGE)[a & PMASK]; }
  s8(a: number): number { return (this.u8(a) << 24) >> 24; }
  u16(a: number): number {
    a >>>= 0;
    const o = a & PMASK;
    if (o < PMASK) { const b = this.rp(a >>> PAGE); return b[o] | (b[o + 1] << 8); }
    return this.u8(a) | (this.u8(a + 1) << 8);
  }
  s16(a: number): number { return (this.u16(a) << 16) >> 16; }
  u32(a: number): number {
    a >>>= 0;
    const o = a & PMASK;
    if (o <= PMASK - 3) { const b = this.rp(a >>> PAGE); return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0; }
    return (this.u16(a) | (this.u16(a + 2) << 16)) >>> 0;
  }
  s32(a: number): number { return this.u32(a) | 0; }
  f32(a: number): number { this.dv.setUint32(0, this.u32(a), true); return this.dv.getFloat32(0, true); }
  f64(a: number): number { this.dv.setUint32(0, this.u32(a), true); this.dv.setUint32(4, this.u32(a + 4), true); return this.dv.getFloat64(0, true); }
  w8(a: number, v: number): void { a >>>= 0; this.page(a >>> PAGE)![a & PMASK] = v & 0xff; }
  w16(a: number, v: number): void {
    a >>>= 0;
    const o = a & PMASK;
    if (o < PMASK) { const b = this.page(a >>> PAGE)!; b[o] = v & 0xff; b[o + 1] = (v >> 8) & 0xff; return; }
    this.w8(a, v); this.w8(a + 1, v >> 8);
  }
  w32(a: number, v: number): void {
    a >>>= 0;
    const o = a & PMASK;
    if (o <= PMASK - 3) { const b = this.page(a >>> PAGE)!; b[o] = v & 0xff; b[o + 1] = (v >>> 8) & 0xff; b[o + 2] = (v >>> 16) & 0xff; b[o + 3] = (v >>> 24) & 0xff; return; }
    this.w16(a, v); this.w16(a + 2, v >>> 16);
  }
  wf32(a: number, v: number): void { this.dv.setFloat32(0, v, true); this.w32(a, this.dv.getUint32(0, true)); }
  wf64(a: number, v: number): void { this.dv.setFloat64(0, v, true); this.w32(a, this.dv.getUint32(0, true)); this.w32(a + 4, this.dv.getUint32(4, true)); }
  /** de byggede sider (sidenummer, indhold) – kontrollen af to byggere (scripts/cm-sl-memcheck.ts) */
  pageList(): [number, Uint8Array][] { return [...this.pages]; }
  /** (hukommelse, 22/11) hukommelsens egne sider: sidenumrene i rækkefølgen, de blev lavet, og indholdet efter hinanden i en eller flere tabeller
   *  (`data`, sider à 4 KB i samme rækkefølge) – til at sende hukommelsen til en anden Web Worker (Transferable) og fortsætte dér (importPages).
   *  Sider, der stadig er udsnit af en importeret tabel på deres plads, gives videre som den tabel (ingen kopi – ønskelisternes portioner ændrer
   *  indholdet i den, og kun portionens nye sider kopieres): før blev hele hukommelsen (~95 MB) kopieret ved hver overdragelse, mens den gamle
   *  stadig levede. */
  exportPages(): { nums: Int32Array; data: Uint8Array[] } {
    const nums = new Int32Array(this.pages.size), data: Uint8Array[] = [];
    let i = 0;
    // løbende stykke: et udsnit af en importeret tabel (seg, fra … til) eller nye sider, der kopieres
    let seg: Uint8Array | null = null, from = 0, to = 0;
    let fresh: Uint8Array[] = [];
    const flush = () => {
      if (seg) { data.push(from === 0 && to << PAGE === seg.length ? seg : seg.subarray(from << PAGE, to << PAGE)); seg = null; }
      if (fresh.length) { const d = new Uint8Array(fresh.length << PAGE); for (let k = 0; k < fresh.length; k++) d.set(fresh[k], k << PAGE); data.push(d); fresh = []; }
    };
    for (const [p, b] of this.pages) {
      nums[i++] = p;
      const v = VIEWS.get(b);
      if (v && seg === v.seg && v.i === to) { to++; continue; }
      if (!v && !seg) { fresh.push(b); continue; }
      flush();
      if (v) { seg = v.seg; from = v.i; to = v.i + 1; } else fresh.push(b);
    }
    flush();
    return { nums, data };
  }
  /** hukommelsens sider erstattes af de eksporterede (samme rækkefølge i sidetabellen; `miss` kaldes ikke – indholdet er færdigt). Siderne er
   *  udsnit af de modtagne tabeller (ingen kopi pr. side). De hidtidige sider går ikke til puljen (hukommelse: de bygges forfra i en ny
   *  arbejder og erstattes straks – ~95 MB, der ellers lå i puljen hele portionen). */
  importPages(x: { nums: Int32Array; data: Uint8Array[] }): void {
    this.pages.clear(); this.dir.fill(NOPAGES);
    let n = 0;
    for (const d of x.data) n += d.length >>> PAGE;
    if (n !== x.nums.length) throw new Error('importPages: sider og indhold passer ikke');
    let i = 0;
    for (const d of x.data) {
      for (let k = 0; k < d.length >>> PAGE; k++, i++) {
        const p = x.nums[i], nb = d.subarray(k << PAGE, (k + 1) << PAGE);
        VIEWS.set(nb, { seg: d, i: k });
        let t = this.dir[p >>> 10];
        if (t === NOPAGES) { t = new Array(1024).fill(null); this.dir[p >>> 10] = t; }
        t[p & 1023] = nb;
        this.pages.set(p, nb);
      }
    }
  }
  /** siderne tilbage til puljen (hukommelsen bruges ikke mere – ønskelisternes dag bygger 18.000 sider à 4 KB hver dag) */
  release(): void {
    // udsnit af en importeret tabel genbruges ikke: tabellen gives videre (exportPages) og må ikke nulstilles som en ny side
    for (const b of this.pages.values()) if (POOL.length < POOL_MAX && !VIEWS.has(b)) POOL.push(b);
    // (hastighed, 25/11) sidetabellens andet niveau (1024 pladser à 8 bytes pr. 4 MB-område – en hukommelse rører ~30 områder) genbruges også
    for (let i = 0; i < 1024; i++) { const t = this.dir[i]; if (t !== NOPAGES && TPOOL.length < TPOOL_MAX) { t.fill(null); TPOOL.push(t); } }
    this.pages.clear(); this.dir.fill(NOPAGES);
  }
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
  /** [0xae233c] = 1, når i dag er efter [0xae2330] (cmAfter2330) */
  B_AE233C: 0xae233c,
} as const;

/** [0xae2330]: en fast dato i exe-filen – den statiske initialisering 0x524cd0 (push 0x7d1/7/0x1f → Date 0x549f70) = 31/8-2001; intet skriver
 *  den igen (målt i oraklet: 31/8-2001 fra 14/7-2001 til 27/6-2004). Samme dato på alle databaser (exe-konstanten). */
export const DATE_2330 = '2001-08-31';
/** [0xae2330]/[0xae2332] (dag i året, år) og [0xae2334] (skudår) = DATE_2330 – den statiske dato, som 0x868210 (kontraktens start +0x25 før den →
 *  1: Bosman-vejen i 0x84b6f0) og CONTRACT_MANAGER 0x4c7ac0 læser. Alle de lånte hukommelser skal have den (før stod den kun i
 *  CONTRACT_MANAGER's – ønskelisternes havde 0 = 1/1-1900, så 0x868210 kun svarede 1 inden for FIFA-perioden og forkontrakterne udeblev). */
export function writeDate2330(m: { w16(a: number, v: number): void; w32(a: number, v: number): void }): void {
  const y = +DATE_2330.slice(0, 4), d = Math.round((Date.parse(DATE_2330) - Date.parse(`${y}-01-01`)) / 864e5);
  m.w16(0xae2330, d); m.w16(0xae2332, y); m.w32(0xae2334, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 1 : 0);
}
/** [0xae233c]: 0x5cccd0 (0x5cdb2c–0x5cdb64) sætter den til 1 – og aldrig tilbage – i den første tidsskive, hvor i dag > [0xae2330], EFTER
 *  dagens 0x4c7ac0-kald (oraklet: 0 på billedet 1/9-2001, 1 fra 2/9). `slice0` = 0x4c7ac0's tidsskive 0 på dagen (den ser endnu 0). */
export function cmAfter2330(iso: string, slice0 = false): number {
  const d = iso.slice(0, 10);
  if (d <= DATE_2330) return 0;
  return slice0 && d === '2001-09-01' ? 0 : 1;
}

export const f32 = Math.fround;
export const s8 = (v: number) => (v << 24) >> 24;
export const u8 = (v: number) => v & 0xff;
export const s16 = (v: number) => (v << 16) >> 16;
export const u16 = (v: number) => v & 0xffff;
/** _ftol 0x945640: trunkering mod 0 (resultatet som 32-bit heltal – store tal ombrydes som i originalens fistp-sti) */
export const ftol = (x: number) => {
  const t = Math.trunc(x);
  // (hastighed) `t | 0` = ToInt32 = BigInt.asIntN(32, BigInt(t)) for alle endelige heltal (modulo 2^32 af den eksakte værdi) – uden BigInt pr. kald
  return Number.isFinite(t) ? t | 0 : -0x80000000;
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

/** Månedstabellerne 0x9b8448 (almindeligt år) og 0x9b8460 (skudår) som i exe'ens data: dagen i året (0 = 1/1), måneden begynder, MINUS 1
 *  (s16) – 0x54cf70 (dagen i måneden = dagen i året − tabellen, 1..31), 0x54cfb0 (måneden: første post < dagen i året), 0x549f70 (Date(dag 1..31,
 *  måned, år): tabellen + dagen). Tidligere stod tabellen 1 for højt (0, 31, 59 …): dagen i måneden blev 1 for lav, månedens 1. hørte til
 *  måneden før, og lejeaftalernes slutdag (0x842740: min(dagen, 28)) blev den 29., når buddet kom den 29.–31. */
export function writeMonthTables(m: CmMem) {
  [-1, 30, 58, 89, 119, 150, 180, 211, 242, 272, 303, 333].forEach((d, i) => { m.w16(0x9b8448 + 2 * i, d); m.w16(0x9b8460 + 2 * i, d + (i >= 2 ? 1 : 0)); });
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
