// Database-editoren: "Min database" er en liste af ændringer oven på den originale eller den moderne database
// (som originalens CM 01/02 Editor, men gemt som en lille diff, så den overlever opdateringer af grunddatabasen).
import type { WorldData } from './newgame';
import { subPos, type CMRatings, type CMWorld } from './data/cm0102';
import { ATTR_COUNT } from './attributes';

export type DbBase = 'modern' | 'original';

export interface PlayerEdit {
  first?: string; last?: string; dob?: string; nation?: number;
  /** 0 = fri agent */
  club?: number;
  foot?: 'L' | 'R' | 'B';
  ca?: number;
  /** 1-200, eller -1/-2 = tilfældigt potentiale som i originalen (100-150 / 150-200) */
  pa?: number;
  /** evne-indeks → værdi 1-20 (kun de ændrede) */
  attrs?: Record<number, number>;
  /** positionsevner GK, SW, D, DM, M, AM, ST, WB (1-20) og sider V, C, H (1-20) */
  pos?: number[]; side?: number[];
  /** kontraktudløb (ISO) – '' = ingen */
  contract?: string;
  number?: number;
}

export interface NewPlayer extends PlayerEdit {
  id: number; first: string; last: string; dob: string; nation: number; club: number; ca: number; pa: number;
}

export interface ClubEdit {
  name?: string; short?: string; stadium?: string; seats?: number;
  /** omdømme 1-98 */
  rep?: number;
  /** [baggrund, tekst] som hex */
  colors?: [string, string];
  /** saldo ved spilstart (euro) */
  balance?: number;
}

export interface CustomDb {
  id: string; name: string; base: DbBase; created: string; updated: string;
  players: Record<number, PlayerEdit>;
  clubs: Record<number, ClubEdit>;
  added: NewPlayer[];
}

/** Nye spillere får id'er herfra (under spillets egne regens, der starter ved 10.000.000) */
export const NEW_ID0 = 9_000_000;
export const POS_KEYS = ['GK', 'SW', 'D', 'DM', 'M', 'AM', 'ST', 'WB'] as const;
export const SIDE_KEYS = ['L', 'C', 'R'] as const;

export function emptyDb(name: string, base: DbBase, now = new Date().toISOString()): CustomDb {
  return { id: `db${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name, base, created: now, updated: now, players: {}, clubs: {}, added: [] };
}

export function changeCount(db: CustomDb): number {
  return Object.keys(db.players).length + Object.keys(db.clubs).length + db.added.length;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));
const fine = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Ret værdierne ind efter originalens grænser (bruges ved import af andres filer) */
export function sanitizeDb(raw: unknown): CustomDb | null {
  const d = raw as Partial<CustomDb> | null;
  if (!d || typeof d !== 'object' || (d.base !== 'modern' && d.base !== 'original') || typeof d.name !== 'string') return null;
  const str = (s: unknown, n = 60) => (typeof s === 'string' ? s.slice(0, n) : undefined);
  const pe = (e: PlayerEdit): PlayerEdit => {
    const o: PlayerEdit = {};
    if (str(e.first) !== undefined) o.first = str(e.first)!;
    if (str(e.last) !== undefined) o.last = str(e.last)!;
    if (typeof e.dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.dob)) o.dob = e.dob;
    if (fine(e.nation)) o.nation = clamp(e.nation, 0, 9999);
    if (fine(e.club)) o.club = Math.max(0, Math.round(e.club));
    if (e.foot === 'L' || e.foot === 'R' || e.foot === 'B') o.foot = e.foot;
    if (fine(e.ca)) o.ca = clamp(e.ca, 1, 200);
    if (fine(e.pa)) o.pa = e.pa === -1 || e.pa === -2 ? e.pa : clamp(e.pa, 1, 200);
    if (e.attrs && typeof e.attrs === 'object') {
      o.attrs = {};
      for (const [k, v] of Object.entries(e.attrs)) if (Number(k) >= 0 && Number(k) < ATTR_COUNT && fine(v)) o.attrs[Number(k)] = clamp(v, 1, 20);
    }
    if (Array.isArray(e.pos) && e.pos.length === 8 && e.pos.every(fine)) o.pos = e.pos.map((v) => clamp(v, 1, 20));
    if (Array.isArray(e.side) && e.side.length === 3 && e.side.every(fine)) o.side = e.side.map((v) => clamp(v, 1, 20));
    if (typeof e.contract === 'string' && (e.contract === '' || /^\d{4}-\d{2}-\d{2}$/.test(e.contract))) o.contract = e.contract;
    if (fine(e.number)) o.number = clamp(e.number, 0, 99);
    return o;
  };
  const players: Record<number, PlayerEdit> = {};
  for (const [id, e] of Object.entries(d.players ?? {})) if (Number(id) > 0 && e) players[Number(id)] = pe(e);
  const clubs: Record<number, ClubEdit> = {};
  for (const [id, e] of Object.entries(d.clubs ?? {})) {
    if (!(Number(id) > 0) || !e) continue;
    const o: ClubEdit = {};
    if (str(e.name) !== undefined) o.name = str(e.name)!;
    if (str(e.short, 30) !== undefined) o.short = str(e.short, 30)!;
    if (str(e.stadium) !== undefined) o.stadium = str(e.stadium)!;
    if (fine(e.seats)) o.seats = clamp(e.seats, 500, 120_000);
    if (fine(e.rep)) o.rep = clamp(e.rep, 1, 98);
    if (Array.isArray(e.colors) && e.colors.length === 2 && e.colors.every((c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c))) o.colors = [e.colors[0], e.colors[1]];
    if (fine(e.balance)) o.balance = Math.max(-1e9, Math.min(1e10, Math.round(e.balance)));
    clubs[Number(id)] = o;
  }
  const added: NewPlayer[] = [];
  for (const a of (Array.isArray(d.added) ? d.added : []).slice(0, 2000)) {
    const e = pe(a);
    if (!fine(a?.id) || a.id < NEW_ID0 || a.id >= NEW_ID0 + 1_000_000 || !e.last || !e.dob || e.nation === undefined || e.ca === undefined || e.pa === undefined) continue;
    added.push({ ...e, id: a.id, first: e.first ?? '', last: e.last, dob: e.dob, nation: e.nation, club: e.club ?? 0, ca: e.ca, pa: e.pa });
  }
  const now = new Date().toISOString();
  return { id: typeof d.id === 'string' ? d.id.slice(0, 40) : emptyDb('', d.base).id, name: d.name.slice(0, 60) || 'Database', base: d.base, created: str(d.created, 30) ?? now, updated: str(d.updated, 30) ?? now, players, clubs, added };
}

/** Spillerens ratings, som de ser ud efter ændringerne (null hvis databasen ikke har ratings) */
function patchRatings(r: CMRatings, e: PlayerEdit): CMRatings {
  const out: CMRatings = { ...r, attrs: r.attrs.slice(), pos: (e.pos ?? r.pos).slice(), side: (e.side ?? r.side).slice() };
  if (e.ca !== undefined) out.ca = e.ca;
  for (const [i, v] of Object.entries(e.attrs ?? {})) out.attrs[Number(i)] = v;
  const pa = e.pa;
  if (pa === -1 || pa === -2) { out.paRaw = pa; out.pa = Math.max(out.ca, pa === -2 ? 175 : 125); }
  else if (pa !== undefined) { delete out.paRaw; out.pa = Math.max(out.ca, pa); }
  else if (out.pa < out.ca) out.pa = out.ca;
  return out;
}

/**
 * Læg ændringerne oven på grunddatabasen. Returnerer en kopi – grunddatabasen (der er cachet og delt)
 * røres ikke. Ændringer af spillere/klubber, der ikke findes (længere), springes over.
 */
export function applyDb(base: WorldData, db: CustomDb): WorldData {
  const w = structuredClone(base) as WorldData & Partial<CMWorld>;
  const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
  const clubs = new Map(w.clubs.map((c) => [c[0], c]));
  const rowOf = new Map(w.players.map((p) => [p[F.id] as number, p]));
  const set = (row: (string | number)[], f: string, v: string | number | undefined) => { if (v !== undefined && F[f] !== undefined) row[F[f]] = v; };
  const patchRow = (row: (string | number)[], e: PlayerEdit) => {
    set(row, 'first', e.first); set(row, 'last', e.last); set(row, 'dob', e.dob); set(row, 'nation', e.nation);
    if (e.club !== undefined) set(row, 'club', e.club === 0 || clubs.has(e.club) ? e.club : undefined);
    set(row, 'foot', e.foot); set(row, 'contract', e.contract); set(row, 'number', e.number);
    if (w.ratings) {
      const id = row[F.id] as number;
      const r = w.ratings[id];
      if (r) {
        w.ratings[id] = patchRatings(r, e);
        if (e.pos || e.side) set(row, 'pos', subPos(w.ratings[id].pos, w.ratings[id].side));
      }
    }
  };
  for (const [id, e] of Object.entries(db.players)) {
    const row = rowOf.get(Number(id));
    if (row) patchRow(row, e);
  }
  for (const a of db.added) {
    if (rowOf.has(a.id)) continue;
    const row: (string | number)[] = w.playerFields.map((f) => (['first', 'last', 'dob', 'pos', 'foot', 'contract'].includes(f) ? '' : 0));
    row[F.id] = a.id;
    const pos = a.pos ?? [1, 1, 1, 1, 15, 1, 1, 1], side = a.side ?? [1, 20, 1];
    set(row, 'pos', subPos(pos, side)); set(row, 'foot', a.foot ?? 'R');
    if (w.ratings) w.ratings[a.id] = patchRatings({ ca: a.ca, pa: a.ca, attrs: new Array(ATTR_COUNT).fill(0), pos, side }, { ...a, pos, side });
    patchRow(row, { ...a, pos: undefined, side: undefined });
    w.players.push(row);
    rowOf.set(a.id, row);
  }
  for (const [id, e] of Object.entries(db.clubs)) {
    const c = clubs.get(Number(id));
    if (!c) continue;
    if (e.name !== undefined) c[1] = e.name;
    if (e.short !== undefined) c[2] = e.short;
    if (e.stadium !== undefined) c[5] = e.stadium;
    if (e.seats !== undefined) c[6] = e.seats;
    if (e.rep !== undefined && w.clubRep) { w.clubRep[c[0]] = e.rep; (w.clubRepEdited ??= []).push(c[0]); }
    if (e.colors && w.clubColors) w.clubColors[c[0]] = e.colors;
    if (e.balance !== undefined) (w.clubBalance ??= {})[c[0]] = e.balance;
  }
  return w;
}
