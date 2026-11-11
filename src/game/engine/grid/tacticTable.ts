// Taktikkens positionstabel som i originalen (notes/5b7160-tactic-table.md, notes/6c2be0-tactical-cell.md):
// 0x5b7160 udvider filens grove gitter til TBL[plads][med bold][bx 0..8][by 0..11] (side 0; byte x | y<<4 ved taktik +0x5eb),
// side 1 er spejlet (+0xf33). sub_6c2be0 slår spillerens taktiske felt op her.
import { PRESET_TACTICS, type PresetTactic } from './presetTactics';

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

const cache = new Map<string, Table>();
export function presetTable(p: PresetTactic): Table {
  let t = cache.get(p.file);
  if (!t) { t = expandGrid(bytesOf(p.grid)); cache.set(p.file, t); }
  return t;
}

// ---------------------------------------------------------------- spillets taktik → originalens forudindstilling
// Spillets Tactic har kun én grundplads pr. plads (dybde/side 0..100), ikke originalens gitter. Vi vælger den forudindstilling
// og den fordeling af pladserne, der passer bedst på rolle og side (masken), med pladsens placering som tiebreak. *estimeret*:
// en brugerflyttet plads uden for forudindstillingerne får nærmeste forudindstillings tabel (originalen genberegner gitteret
// ved 0x5b3560/0x5b7e60, som ikke er afkodet).
const ROLE = [0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40];          // GK SW D DM/WB M AM ST
const SIDES = [0x80, 0x100, 0x200, 0x400, 0x800];              // L LC C RC R
const roleOf = (mask: number) => ROLE.findIndex((r) => (mask & r) !== 0);
const sideOf = (mask: number) => { const i = SIDES.findIndex((s) => (mask & s) !== 0); return i < 0 ? 2 : i; };

export interface SlotSpec { mask: number; col: number; row: number } // col 0..8 (venstre → højre), row 0..11 (fra eget mål), side 0

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

function slotCost(a: SlotSpec, pr: PresetTactic, t: Table, ps: number): number {
  const ra = roleOf(a.mask), rb = roleOf(pr.masks[ps]);
  if ((ra === 0) !== (rb === 0)) return 1e6;                  // målmand ↔ målmand
  const [cx, cy] = tableCell(t, 0, ps, 0, 4, 5);              // uden bold, bolden på midten
  return 20 * Math.abs(ra - rb) + 6 * Math.abs(sideOf(a.mask) - sideOf(pr.masks[ps])) + Math.abs(a.col - cx) + 0.5 * Math.abs(a.row - cy);
}

export interface TacticMap { preset: PresetTactic; table: Table; slotOf: number[] } // slotOf[spillets plads] = forudindstillingens plads

export function mapTactic(slots: SlotSpec[], formation?: string): TacticMap {
  let best: TacticMap | null = null, bestCost = Infinity;
  for (const pr of PRESET_TACTICS) {
    const t = presetTable(pr);
    const n = Math.min(11, slots.length);
    const cost = slots.slice(0, n).map((s) => Array.from({ length: n }, (_, j) => slotCost(s, pr, t, j)));
    const a = assign(cost);
    let c = a.reduce((sum, j, i) => sum + cost[i][j], 0);
    if (formation && pr.name === formation) c -= 0.5;          // samme navn vinder ved lige
    if (c < bestCost) { bestCost = c; best = { preset: pr, table: t, slotOf: a }; }
  }
  return best!;
}
