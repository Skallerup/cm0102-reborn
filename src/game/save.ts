// Gem/indlæs i IndexedDB som gzip-komprimeret JSON (≈4-5 MB pr. save).
import { addMissingConference } from './competitions';
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

export async function saveGame(): Promise<SaveMeta> {
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
  return meta;
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

export async function loadGame(id: string): Promise<boolean> {
  const blob = await get<Blob>(`save:${id}`);
  if (!blob) return false;
  const g = await deserializeState(blob);
  // en gammel lokal kopi af et online-spil: åbn ikke den (det rigtige spil ligger på serveren)
  if (g.humans?.length) return false;
  setGame(g);
  upgradeLoaded();
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
