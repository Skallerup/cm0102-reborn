// Taktikkens positionstabel som i originalen (notes/5b7160-tactic-table.md, notes/6c2be0-tactical-cell.md):
// 0x5b7160 udvider filens grove gitter til TBL[plads][med bold][bx 0..8][by 0..11] (side 0; byte x | y<<4 ved taktik +0x5eb),
// side 1 er spejlet (+0xf33). sub_6c2be0 slår spillerens taktiske felt op her.
import { DEFAULT_PRESETS, PRESET_TACTICS, type PresetTactic } from './presetTactics';

export type Table = Uint8Array; // 11 · 2 · 9 · 12 = 2376 bytes, side 0

function bytesOf(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/** sub_5b7160 (sikker): hver boldzone (3 × 3 felter af bx/by) får pladsens punkt på 27×36-banen, omregnet til 9×12. */
export function expandGrid(grid: Uint8Array): Table {
  const v = new DataView(grid.buffer, grid.byteOffset, grid.byteLength);
  const t = new Uint8Array(2376);
  for (let slot = 0; slot < 11; slot++)
    for (let att = 0; att < 2; att++)
      for (let zx = 0; zx < 3; zx++)
        for (let zy = 0; zy < 4; zy++) {
          const i = ((2 * slot + att) * 3 + zx) * 4 + zy;
          const x = v.getInt16(4 * i, true), y = v.getInt16(4 * i + 2, true);
          const cell = (Math.trunc((x * 9) / 27) & 0xf) | ((Math.trunc((y * 12) / 36) & 0xf) << 4);
          for (let bx = 3 * zx; bx < 3 * zx + 3; bx++)
            for (let by = 3 * zy; by < 3 * zy + 3; by++) t[216 * slot + 108 * att + 12 * bx + by] = cell;
        }
  return t;
}

/** Opslaget i sub_6c2be0: feltet for plads `slot` (med/uden bold) ved bolden i (bx, by); side 1 spejlet som +0xf33. */
export function tableCell(t: Table, side: 0 | 1, slot: number, att: 0 | 1, bx: number, by: number): [number, number] {
  if (side === 0) { const c = t[216 * slot + 108 * att + 12 * bx + by]; return [c & 0xf, c >> 4]; }
  const c = t[216 * slot + 108 * att + 12 * (8 - bx) + (11 - by)];
  return [8 - (c & 0xf), 11 - (c >> 4)];
}

const gridCache = new Map<string, Uint8Array>();
/** forudindstillingens grove gitter (+0x164, 0x420 bytes) */
export function presetGrid(p: PresetTactic): Uint8Array {
  let g = gridCache.get(p.file);
  if (!g) { g = bytesOf(p.grid); gridCache.set(p.file, g); }
  return g;
}
const cache = new Map<string, Table>();
export function presetTable(p: PresetTactic): Table {
  let t = cache.get(p.file);
  if (!t) { t = expandGrid(bytesOf(p.grid)); cache.set(p.file, t); }
  return t;
}

// ---------------------------------------------------------------- pladsernes kanoniske gitter (notes/5b3560-slot-grid.md)
const VBITS = [0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40];             // GK SW D DM M AM F
const HBITS = [0x80, 0x100, 0x200, 0x400, 0x800];                 // L LC C RC R
/** tabellen 0x9cc368: de 31 kanoniske masker (GK + 6 rækker × 5 kolonner) */
export const CANON_MASKS = [0x1, ...VBITS.slice(1).flatMap((v) => HBITS.map((h) => v | h))];
/** 0x5b73a0: laveste rækkebit og første kolonnebit (GK → C) */
function split(mask: number): [number, number] {
  const v = VBITS.find((b) => mask & b) ?? 0;
  const h = mask & 0x80 ? 0x80 : mask & 0x100 ? 0x100 : mask & 0x200 || mask & 1 ? 0x200 : mask & 0x400 ? 0x400 : mask & 0x800 ? 0x800 : 0;
  return [v, h];
}
const YT: Record<number, [number[], number[]]> = {
  0x1: [[0, 1, 2, 3], [0, 2, 4, 6]], 0x2: [[1, 3, 5, 9], [2, 4, 13, 15]], 0x4: [[2, 7, 9, 13], [4, 9, 17, 17]], 0x8: [[4, 9, 13, 18], [7, 11, 20, 22]],
  0x10: [[6, 11, 16, 22], [9, 14, 23, 26]], 0x20: [[9, 13, 19, 26], [12, 19, 27, 30]], 0x40: [[13, 15, 23, 31], [15, 24, 31, 34]],
};
/** 0x5b7e60 (sikker): maskens kanoniske punkt (x 0..26, y 0..35) uden/med bold i boldzonen (zx 0..2, zy 0..3) */
export function canon(mask: number, att: 0 | 1, zx: number, zy: number): [number, number] {
  const [v, h] = split(mask), c = HBITS.indexOf(h), wide = h === 0x80 || h === 0x800;
  let y = YT[v][att][zy];
  if (att === 1 && wide) y += v === 0x2 || v === 0x4 ? (zy === 3 ? 4 : 1) : v !== 0x1 ? 1 : 0;
  let x: number;
  if (v === 0x1) x = 13;
  else if (v === 0x2 || v === 0x4) x = (att === 0 ? (zy === 0 ? [9, 11, 13, 15, 17] : [7, 11, 13, 15, 19]) : zy === 0 ? [6, 11, 13, 15, 20] : [3, 10, 13, 16, 23])[c];
  else if (v === 0x40) x = (att === 0 ? [7, 11, 13, 15, 19] : zy <= 1 ? [2, 8, 13, 18, 24] : zy === 2 ? [3, 10, 13, 16, 23] : [6, 11, 13, 15, 20])[c];
  else x = (att === 0 ? (zy === 0 ? [9, 11, 13, 15, 17] : [7, 11, 13, 15, 19]) : [3, 10, 13, 16, 23])[c];
  const small = (v === 0x1 && zy > 0) || ((v === 0x2 || v === 0x4) && zy === 0) || (v === 0x40 && (h === 0x100 || h === 0x200 || h === 0x400) && zy === 3 && att === 1);
  if (small || v !== 0x1) {
    const d = small ? 1 : 5;
    if (zx === 0) x = Math.min(Math.max(x - d, 2), 17);
    else if (zx === 2) x = Math.min(Math.max(x + d, 9), 24);
  }
  return [Math.min(Math.max(x, 0), 26), Math.min(Math.max(y, 0), 35)];
}
/** 0x5b2ba0 (sikker) for alle 11 pladser med masks2 = masks: det grove gitter (+0x164, samme layout som filerne) */
export function canonGrid(masks: number[]): Uint8Array {
  const g = new Uint8Array(0x420), v = new DataView(g.buffer);
  masks.slice(0, 11).forEach((mask, slot) => {
    for (let att = 0; att < 2; att++) for (let zx = 0; zx < 3; zx++) for (let zy = 0; zy < 4; zy++) {
      const [x, y] = canon(mask, att as 0 | 1, zx, zy), i = ((2 * slot + att) * 3 + zx) * 4 + zy;
      v.setInt16(4 * i, x, true); v.setInt16(4 * i + 2, y, true);
    }
  });
  return g;
}

// ---------------------------------------------------------------- spillets taktik → originalens tabel
// Taktikskærmen (0x89f710, tilstand 1) lader en plads lande på den nærmeste af de 31 masker og kalder 0x5b2ba0, så pladsens gitter er
// maskens kanoniske punkter. Spillets 30 faste pladser (tactics.ts GRID_X × GRID_Y) er præcis de 30 masker (række SW..F × kolonne L..R);
// en plads uden for gitteret lægges på den nærmeste (snapSlot). Er taktikkens 11 masker præcis en forudindstillings, bruges den (filens
// håndredigerede gitter, holdflag, instruktioner og taktikbytes); ellers det kanoniske gitter med standardtaktikkens værdier (0x5b27c0).
const GX = [12, 22, 35, 50, 66, 82], GY = [12, 37, 50, 63, 88];                 // = tactics.ts GRID_X / GRID_Y
const nearIdx = (a: number[], v: number) => a.reduce((b, c, i) => (Math.abs(c - v) < Math.abs(a[b] - v) ? i : b), 0);
/** spillets plads (dybde x 0..100 fra eget mål, side y 0..100 venstre → højre) → originalens maske */
export function slotMask(s: { pos: string; x: number; y: number }): number {
  if (s.pos === 'GK') return 0x1;
  return VBITS[1 + nearIdx(GX, s.x)] | HBITS[nearIdx(GY, s.y)];
}

export interface TacticMap { preset: PresetTactic | null; table: Table; slotOf: number[]; masks: number[]; masks2: number[]; flags: number; lo: number[]; hi: number[]; tb: number[] } // slotOf[spillets plads] = tabellens plads

const canonCache = new Map<string, Table>();
/** Spillets taktik → forudindstillingen med præcis de samme 11 masker (kun spillerens 17 "Set To Default"; navnet afgør mellem ens) og
 *  hver plads' nummer i den. null = ingen. */
export function presetFor(masks: number[], formation?: string): { index: number; slotOf: number[] } | null {
  const key = [...masks].sort((a, b) => a - b).join(',');
  // kun spillerens 17 standardtaktikker (computerens 28 CM3_TACTICS vælges af aiTacticChoice.ts)
  const hits = PRESET_TACTICS.slice(0, DEFAULT_PRESETS).filter((t) => [...t.masks].sort((a, b) => a - b).join(',') === key);   // fx 4-4-2 = 4-4-2 Attacking
  const pr = hits.find((t) => t.name === formation) ?? hits[0];
  if (!pr) return null;
  const used = new Set<number>();
  const slotOf = masks.map((mk) => { const j = pr.masks.findIndex((pm, k) => pm === mk && !used.has(k)); used.add(j); return j; });
  return { index: PRESET_TACTICS.indexOf(pr), slotOf };
}

/** Taktikkens egne positioner med/uden bold (Tactic.positions = CM 01/02's With Ball / Without Ball, se tacticPositions.ts). Gælder kun,
 *  når pladsernes masker stadig er dem, gitteret blev lavet til (en ændring af formationen andetsteds → formationens forudindstilling). */
export interface PositionsLike { posts: number[][]; masks: number[]; masks2: number[]; preset?: number; presetSlot?: number[] }
export function positionsValid(slots: { pos: string; x: number; y: number }[], p: PositionsLike | undefined | null): boolean {
  if (!p || p.posts?.length !== 11 || p.masks?.length !== 11 || p.masks2?.length !== 11 || slots.length < 11) return false;
  if (!p.posts.every((r) => r?.length === 24)) return false;
  return slots.slice(0, 11).every((s, i) => slotMask(s) === p.masks[i]);
}
/** Gitteret (+0x164, 0x420 bytes, samme layout som filerne) i tabellens pladsrækkefølge `slotOf` (forudindstillingens, hvis det kom derfra) */
export function positionsGrid(p: PositionsLike, slotOf: number[]): Uint8Array {
  const g = new Uint8Array(0x420), v = new DataView(g.buffer);
  for (let i = 0; i < 11; i++) {
    const ts = slotOf[i];
    for (let k = 0; k < 24; k++) {
      const att = k >= 12 ? 1 : 0, zx = Math.floor((k % 12) / 4), zy = k % 4, xy = p.posts[i][k];
      const idx = ((2 * ts + att) * 3 + zx) * 4 + zy;
      v.setInt16(4 * idx, xy & 0xff, true); v.setInt16(4 * idx + 2, (xy >> 8) & 0xff, true);
    }
  }
  return g;
}
const posCache = new Map<string, Table>();

export function mapTactic(slots: { pos: string; x: number; y: number }[], formation?: string, positions?: PositionsLike | null): TacticMap {
  const masks = slots.slice(0, 11).map(slotMask);
  if (positions && positionsValid(slots, positions)) {
    // CM 01/02: taktikkens eget gitter (brugeren har flyttet positioner med/uden bold, 0x5b3560) → udvidelsen 0x5b7160 som ved indlæsning af
    // en taktikfil. Holdflag, instruktioner og taktikbytes fra forudindstillingen, gitteret kom fra (filen beholder dem), ellers standardens (0x5b27c0).
    const pr = positions.preset !== undefined ? PRESET_TACTICS[positions.preset] : undefined;
    const ps = positions.presetSlot;
    const slotOf = pr && ps?.length === 11 && new Set(ps).size === 11 && ps.every((j) => j >= 0 && j < 11) ? ps.slice() : masks.map((_, i) => i);
    const order = (a: number[]) => { const out = new Array<number>(11); slotOf.forEach((j, i) => { out[j] = a[i]; }); return out; };
    const grid = positionsGrid(positions, slotOf);
    const key = Array.from(grid).join(',');
    let table = posCache.get(key);
    if (!table) { table = expandGrid(grid); if (posCache.size > 200) posCache.clear(); posCache.set(key, table); }
    if (pr) return { preset: pr, table, slotOf, masks: order(positions.masks), masks2: order(positions.masks2), flags: pr.flags, lo: pr.lo, hi: pr.hi, tb: pr.tb };
    return { preset: null, table, slotOf, masks: positions.masks.slice(), masks2: positions.masks2.slice(), flags: TEAM_DEFAULT, lo: masks.map(() => INSTR_DEFAULT.lo),
      hi: masks.map(() => INSTR_DEFAULT.hi), tb: masks.map(() => TACTIC_BYTE_DEFAULT) };
  }
  const hit = presetFor(masks, formation);
  if (hit) {                                                                      // præcis en forudindstilling
    const pr = PRESET_TACTICS[hit.index];
    return { preset: pr, table: presetTable(pr), slotOf: hit.slotOf, masks: pr.masks, masks2: pr.masks2, flags: pr.flags, lo: pr.lo, hi: pr.hi, tb: pr.tb };
  }
  const k = masks.join(',');
  let t = canonCache.get(k);
  if (!t) { t = expandGrid(canonGrid(masks)); canonCache.set(k, t); }
  return { preset: null, table: t, slotOf: masks.map((_, i) => i), masks, masks2: masks, flags: TEAM_DEFAULT, lo: masks.map(() => INSTR_DEFAULT.lo), hi: masks.map(() => INSTR_DEFAULT.hi),
    tb: masks.map(() => TACTIC_BYTE_DEFAULT) };
}

/** Kuhn–Munkres (ungarsk metode) for en kvadratisk omkostningsmatrix; returnerer for hver række den valgte søjle. */
export function assign(cost: number[][]): number[] {
  const n = cost.length, INF = 1e18;
  const u = new Array(n + 1).fill(0), v = new Array(n + 1).fill(0), p = new Array(n + 1).fill(0), way = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i; let j0 = 0;
    const minv = new Array(n + 1).fill(INF), used = new Array(n + 1).fill(false);
    do {
      used[j0] = true; const i0 = p[j0]; let delta = INF, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) {
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const res = new Array(n).fill(0);
  for (let j = 1; j <= n; j++) if (p[j]) res[p[j] - 1] = j - 1;
  return res;
}

// ---------------------------------------------------------------- holdflag og individuelle instruktioner (notes/team-flags.md)
/** Standardtaktikken 0x5b27c0 (sikker): +0x584 = 0x22a91, alle 11 pladser +0x188b = 0x15552221 / 0xa og +0x5b4 = 0x12. */
export const TEAM_DEFAULT = 0x22a91;
export const INSTR_DEFAULT = { lo: 0x15552221, hi: 0xa } as const;
export const TACTIC_BYTE_DEFAULT = 0x12;
/** sub_5b50d0 (sikker): grupperne i holdflaget – at sætte én værdi rydder gruppen */
const TEAM_GROUPS = [0xf, 0x70, 0x180, 0x600, 0x1800, 0x6000, 0x38000];
export function setTeamOption(flags: number, bit: number): number {
  const g = TEAM_GROUPS.find((m) => m & bit)!;
  return ((flags & ~g) | bit) >>> 0;
}
/** sub_5b5290 (sikker): grupperne i de individuelle instruktioner (lav dword; høj dword 0x3 og 0xc) */
const INSTR_GROUPS_LO = [0x1f, 0x1e0, 0x1e00, 0xe000, 0x300000, 0xc00000, 0x3000000, 0xc000000, 0x30000000, 0x40030000, 0x800c0000];
const INSTR_GROUPS_HI = [0x3, 0xc];
export function setInstr(v: { lo: number; hi: number }, bit: number, high = false): { lo: number; hi: number } {
  const g = (high ? INSTR_GROUPS_HI : INSTR_GROUPS_LO).find((m) => (m & bit) >>> 0 !== 0)!;
  return high ? { lo: v.lo, hi: ((v.hi & ~g) | bit) >>> 0 } : { lo: ((v.lo & ~g) | bit) >>> 0, hi: v.hi };
}
export const instrBig = (v: { lo: number; hi: number }) => (BigInt(v.hi >>> 0) << 32n) | BigInt(v.lo >>> 0);

/** Spillets holdinstruktioner → holdflaget +0x584 (originalen kopierer taktikkens ord uændret ind ved kampstart, 0x6db8a2). Alle syv
 *  grupper sættes fra vores Tactic. *estimeret*: vores trin (0..2/0..4) mod originalens valg – afleveringer kort/blandet/lang =
 *  0x2/0x1/0x8 (direkte 0x4 findes ikke hos os), tackling forsigtig/normal/hård = 0x20/0x10/0x40, pres = 0x100 ved closingDown 2,
 *  mentalitet 0–1 defensiv 0x8000, 2 normal 0x20000, 3–4 angreb 0x10000. */
export function teamFlagsOf(team: { mentality: number; passing: number; tackling: number; closingDown: number; offside: boolean; counter: boolean; menBehind?: boolean },
  base = TEAM_DEFAULT): number {
  let f = base;
  f = setTeamOption(f, team.passing === 0 ? 0x2 : team.passing === 2 ? 0x8 : 0x1);
  f = setTeamOption(f, team.tackling === 0 ? 0x20 : team.tackling === 2 ? 0x40 : 0x10);
  f = setTeamOption(f, team.closingDown >= 2 ? 0x100 : 0x80);
  f = setTeamOption(f, team.offside ? 0x400 : 0x200);
  f = setTeamOption(f, team.counter ? 0x1000 : 0x800);
  f = setTeamOption(f, team.menBehind ? 0x4000 : 0x2000);
  f = setTeamOption(f, team.mentality <= 1 ? 0x8000 : team.mentality >= 3 ? 0x10000 : 0x20000);
  return f;
}

/** Spillets individuelle instruktioner lagt oven på pladsens (forudindstillingens eller standardens) +0x188b. Bitbetydningerne er fra
 *  Bosmans port (passOptions/ballCarrier: 0x4/0x8/0x10 kort/direkte/lang, 0x1 holdets; 0x2000000 løb med bold, 0x8000000 hold bolden,
 *  0x20000000 langskud, høj 0x1 gennembrud, høj 0x4 indlæg; loop.ts: 0x200000 fri rolle, 0x800000 fremadløb, 0x8000 altid pres; challenge:
 *  0x200 holdets tackling, 0x800/0x1000 let/hård). *estimeret*: vores mellemværdier (runs 1, longShots 1, crossing 1, false) beholder
 *  pladsens værdi; "blandet" afleveringer 0x2, normal tackling 0x400 og pres 0 = 0x4000 er gæt ("?"). */
export function instrOf(pi: { runs: number; runWithBall: boolean; longShots: number; throughBalls: boolean; crossing: number; freeRole: boolean; holdUp?: boolean;
  passing?: number; tackling?: number; closingDown?: number } | undefined, base: { lo: number; hi: number } = INSTR_DEFAULT): { lo: number; hi: number } {
  let v = { lo: base.lo >>> 0, hi: base.hi >>> 0 };
  if (!pi) return v;
  if (pi.passing !== undefined) v = setInstr(v, pi.passing === 0 ? 0x4 : pi.passing === 2 ? 0x10 : 0x2);
  if (pi.tackling !== undefined) v = setInstr(v, pi.tackling === 0 ? 0x800 : pi.tackling === 2 ? 0x1000 : 0x400);
  if (pi.closingDown !== undefined) v = setInstr(v, pi.closingDown === 0 ? 0x4000 : pi.closingDown === 2 ? 0x8000 : 0x2000);
  if (pi.runs === 0) v = setInstr(v, 0x400000); else if (pi.runs === 2) v = setInstr(v, 0x800000);
  if (pi.freeRole) v = setInstr(v, 0x200000);
  if (pi.runWithBall) v = setInstr(v, 0x2000000);
  if (pi.holdUp) v = setInstr(v, 0x8000000);
  if (pi.longShots === 0) v = setInstr(v, 0x10000000); else if (pi.longShots === 2) v = setInstr(v, 0x20000000);
  if (pi.throughBalls) v = setInstr(v, 0x1, true);
  if (pi.crossing === 0) v = setInstr(v, 0x8, true); else if (pi.crossing === 2) v = setInstr(v, 0x4, true);
  return v;
}
