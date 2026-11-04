// Gem/indlæs i IndexedDB som gzip-komprimeret JSON (≈4-5 MB pr. save).
import { addMissingConference } from './competitions';
import { fixClubName } from './data/clubNames';
import { cmDatabase } from './newgame';
import { del, get, keys, set } from 'idb-keyval';
import { gs, setGame, addNews, notify } from './state';
import { deserializeState, serializeState } from './snapshot';
import type { GameState } from './types';

export interface SaveMeta {
  id: string;
  manager: string;
  club: string;
  date: string;
  saved: string;
}

export async function serialize(g: GameState): Promise<Blob> {
  return serializeState(g);
}

// gem også i skyen, når man er logget ind (sættes af src/online/cloudSync.ts – motoren kender ikke kontoen)
type CloudHook = (meta: SaveMeta, blob: Blob, force: boolean) => void;
let cloudHook: CloudHook | null = null;
export function setCloudHook(h: CloudHook | null) { cloudHook = h; }

/** Gem lokalt (og i skyen: altid ved cloud=true, ellers højst hvert 5. minut) */
export async function saveGame(opts?: { cloud?: boolean }): Promise<SaveMeta> {
  const g = gs();
  // online-spil gemmes på serveren – en lokal kopi ville blive genoptaget i stedet for det rigtige spil
  if (g.humans?.length) throw new Error('online');
  const blob = await serialize(g);
  const meta: SaveMeta = {
    id: g.id,
    manager: g.manager.name,
    club: g.clubs[g.userClub]?.name ?? '—',
    date: g.date,
    saved: new Date().toISOString(),
  };
  await set(`save:${g.id}`, blob);
  await set(`meta:${g.id}`, meta);
  rememberLast({ kind: 'local', id: g.id });
  cloudHook?.(meta, blob, !!opts?.cloud);
  return meta;
}

/** Læg et spil hentet fra skyen i den lokale database (overskriver en ældre lokal kopi) */
export async function storeSave(meta: SaveMeta, blob: Blob) {
  await set(`save:${meta.id}`, blob);
  await set(`meta:${meta.id}`, meta);
}

export async function getSaveMeta(id: string): Promise<SaveMeta | undefined> {
  return get<SaveMeta>(`meta:${id}`);
}

// ---------- seneste spil (så en genindlæsning fortsætter hvor man slap) ----------

export type LastGame = { kind: 'local'; id: string } | { kind: 'online'; code: string };
const LAST_KEY = 'cm0102.last';

export function rememberLast(l: LastGame) {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(l)); } catch { /* ignore */ }
}

export function getLast(): LastGame | null {
  try { return JSON.parse(localStorage.getItem(LAST_KEY) ?? 'null') as LastGame | null; } catch { return null; }
}

export function forgetLast() {
  try { localStorage.removeItem(LAST_KEY); } catch { /* ignore */ }
}

// ---------- autogem ----------

let timer: ReturnType<typeof setTimeout> | null = null;
let saving = false;
let dirty = false;

/** Gem kort efter ændringer (debounced), så intet går tabt ved genindlæsning */
export function scheduleAutosave(delay = 2500) {
  dirty = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void flushAutosave(); }, delay);
}

export async function flushAutosave() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!dirty || saving) return;
  saving = true;
  dirty = false;
  try { await saveGame(); } catch { dirty = true; } finally { saving = false; }
}

export async function listSaves(): Promise<SaveMeta[]> {
  const all = (await keys()) as string[];
  const metas = await Promise.all(all.filter((k) => k.startsWith('meta:')).map((k) => get<SaveMeta>(k)));
  return (metas.filter(Boolean) as SaveMeta[]).sort((a, b) => b.saved.localeCompare(a.saved));
}

/** Opgradér gemte spil fra ældre versioner (nye turneringer m.m.) */
function upgradeLoaded() {
  const g = gs();
  if (addMissingConference()) {
    const club = g.clubs[g.userClub];
    if (club && g.comps.UECL?.clubs.includes(club.id)) addNews({ cat: 'general', key: 'news.ueclQualified', params: { club: club.name } });
    notify();
  }
}

/**
 * Ret stadionkapaciteten i gemte spil fra CM-databaserne: en fejl i indlæsningen af stadium.dat gav
 * alle klubber loftet 120.000 pladser. Kun klubber med præcis 120.000 rettes (egne udvidelser bevares).
 */
/** Ret forkert stavede klubnavne i gemte spil fra CM-databaserne (fx "Bröndby IF", "FC Copenhagen") */
function repairClubNames() {
  const g = gs();
  if (g.dbKind !== 'cm0102') return;
  for (const c of Object.values(g.clubs)) fixClubName(c);
}

async function repairStadiums(): Promise<void> {
  const g = gs();
  if (g.dbKind !== 'cm0102') return;
  const clubs = Object.values(g.clubs);
  const capped = clubs.filter((c) => c.seats === 120_000);
  if (capped.length < clubs.length / 2) return;
  try {
    const file = cmDatabase(g) === 'original' ? 'world-original.json' : 'world.json';
    const r = await fetch(`${import.meta.env.BASE_URL}data/${file}`);
    if (!r.ok) return;
    const w = (await r.json()) as { clubs: [number, string, string, number, string, string, number, string][] };
    const seats = new Map(w.clubs.map((c) => [c[0], c[6]]));
    let fixed = 0;
    for (const c of capped) { const s = seats.get(c.id); if (s && s !== 120_000) { c.seats = s; fixed++; } }
    if (fixed) notify();
  } catch { /* offline: prøv igen næste gang */ }
}

export async function loadGame(id: string): Promise<boolean> {
  const blob = await get<Blob>(`save:${id}`);
  if (!blob) return false;
  const g = await deserializeState(blob);
  // en gammel lokal kopi af et online-spil: åbn ikke den (det rigtige spil ligger på serveren)
  if (g.humans?.length) return false;
  setGame(g);
  upgradeLoaded();
  repairClubNames();
  await repairStadiums();
  rememberLast({ kind: 'local', id });
  return true;
}

export async function deleteSave(id: string) {
  await del(`save:${id}`);
  await del(`meta:${id}`);
}

export async function exportSave(): Promise<void> {
  const g = gs();
  const blob = await serialize(g);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const club = (g.clubs[g.userClub]?.short ?? 'cm').replace(/[^\w]+/g, '-');
  a.download = `cm0102-${club}-${g.date}.cm0102`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function importSave(file: File): Promise<boolean> {
  try {
    const g = await deserializeState(file);
    if (!g.players || !g.clubs) return false;
    g.id = `save-${Date.now().toString(36)}`;
    setGame(g);
    upgradeLoaded();
    await saveGame();
    return true;
  } catch {
    return false;
  }
}
