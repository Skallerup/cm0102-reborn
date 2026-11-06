// "Mine databaser" fra editoren: gemt lokalt i browseren (IndexedDB) og som fil til deling.
import { get, set } from 'idb-keyval';
import { sanitizeDb, type CustomDb } from '../game/dbEdit';
import { applyDb } from '../game/dbEdit';
import type { WorldData } from '../game/newgame';
import { loadOriginalWorld, loadWorld } from './world';

const KEY = 'cm-dbs';

export async function listDbs(): Promise<CustomDb[]> {
  try { return ((await get(KEY)) as CustomDb[] | undefined) ?? []; } catch { return []; }
}

export async function saveDb(db: CustomDb): Promise<void> {
  const all = await listDbs();
  const next = { ...db, updated: new Date().toISOString() };
  await set(KEY, [next, ...all.filter((d) => d.id !== db.id)]);
}

export async function deleteDb(id: string): Promise<void> {
  await set(KEY, (await listDbs()).filter((d) => d.id !== id));
}

export async function getDb(id: string): Promise<CustomDb | undefined> {
  return (await listDbs()).find((d) => d.id === id);
}

export function baseWorld(db: Pick<CustomDb, 'base'>): Promise<WorldData> {
  return db.base === 'original' ? loadOriginalWorld() : loadWorld();
}

/** Grunddatabasen med ændringerne lagt ovenpå (til et nyt spil) */
export async function loadCustomWorld(id: string): Promise<WorldData> {
  const db = await getDb(id);
  if (!db) throw new Error('database not found');
  return applyDb(await baseWorld(db), db);
}

export function exportDb(db: CustomDb) {
  const blob = new Blob([JSON.stringify({ format: 'cm-reborn-db', version: 1, ...db })], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${db.name.replace(/[^\w\- ]+/g, '').trim() || 'database'}.cmdb.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Importér en delt fil. Får et nyt id, så den ikke overskriver en eksisterende database. */
export async function importDb(file: File): Promise<CustomDb | null> {
  try {
    const db = sanitizeDb(JSON.parse(await file.text()));
    if (!db) return null;
    const mine = { ...db, id: `db${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
    await saveDb(mine);
    return mine;
  } catch { return null; }
}
