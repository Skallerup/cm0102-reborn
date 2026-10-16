// Gem/indlæs i IndexedDB som gzip-komprimeret JSON (≈4-5 MB pr. save).
import { del, get, keys, set } from 'idb-keyval';
import { gs, setGame } from './state';
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
  return meta;
}

export async function listSaves(): Promise<SaveMeta[]> {
  const all = (await keys()) as string[];
  const metas = await Promise.all(all.filter((k) => k.startsWith('meta:')).map((k) => get<SaveMeta>(k)));
  return (metas.filter(Boolean) as SaveMeta[]).sort((a, b) => b.saved.localeCompare(a.saved));
}

export async function loadGame(id: string): Promise<boolean> {
  const blob = await get<Blob>(`save:${id}`);
  if (!blob) return false;
  const g = await deserializeState(blob);
  setGame(g);
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
    await saveGame();
    return true;
  } catch {
    return false;
  }
}
