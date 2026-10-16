// Gem/indlæs i IndexedDB som gzip-komprimeret JSON (≈4-5 MB pr. save).
import { del, get, keys, set } from 'idb-keyval';
import { gs, setGame } from './state';
import { rng } from './rng';
import type { GameState } from './types';

export interface SaveMeta {
  id: string;
  manager: string;
  club: string;
  date: string;
  saved: string;
}

const round = (_k: string, v: unknown) => (typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 100) / 100 : v);

async function gzip(text: string): Promise<Blob> {
  if (typeof CompressionStream === 'undefined') return new Blob([text]);
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).blob();
}

async function gunzip(blob: Blob): Promise<string> {
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] !== 0x1f || head[1] !== 0x8b) return blob.text();
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

export async function serialize(g: GameState): Promise<Blob> {
  return gzip(JSON.stringify(g, round));
}

export async function saveGame(): Promise<SaveMeta> {
  const g = gs();
  g.rng = rng.state;
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
  const g = JSON.parse(await gunzip(blob)) as GameState;
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
    const g = JSON.parse(await gunzip(file)) as GameState;
    if (!g.players || !g.clubs) return false;
    g.id = `save-${Date.now().toString(36)}`;
    setGame(g);
    await saveGame();
    return true;
  } catch {
    return false;
  }
}
