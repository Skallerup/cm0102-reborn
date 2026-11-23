// Lagring af et gemt spil i IndexedDB som bidder af ArrayBuffer (ikke som Blob).
// Årsag til iPhone-fejlen "SaveFailed: null (aborted, no cause)": WebKit afbryder en IndexedDB-transaktion uden årsag, når værdien er en Blob
// (målt i Playwright-WebKit: Blob på 5–50 MB afbrydes altid med fejl null; de samme gzip-data som ArrayBuffer lykkes på 7–43 ms).
// Format: `save:<id>` = Blob (gammelt format, læses stadig) eller manifest { v: 2, gen, n, size }; bidderne ligger i `savec:<id>:<gen>:<i>`.
// Manifestet skrives til sidst (sammen med metadata), så et afbrudt gem aldrig ødelægger det forrige; gamle bidder ryddes bagefter.
import { del, get, keys, set } from 'idb-keyval';
import type { UseStore } from 'idb-keyval';
import { isQuotaError } from './storageGuard';

export const CHUNK_BYTES = 4 * 1048576;

export interface SaveManifest { v: 2; gen: string; n: number; size: number }
const isManifest = (x: unknown): x is SaveManifest => !!x && typeof x === 'object' && !(x instanceof Blob) && (x as SaveManifest).v === 2;

export type SavePhase = 'buffer' | 'chunk' | 'commit';
/** Et gem fejlede i en bestemt fase (buffer = blob → ArrayBuffer, chunk = put af en bid, commit = manifest + metadata) */
export class SavePhaseError extends Error {
  phase: SavePhase;
  constructor(phase: SavePhase, size: number, chunk: number, cause: unknown) {
    super(`phase=${phase}${phase === 'chunk' ? `#${chunk}` : ''} size=${(size / 1048576).toFixed(1)}MB cause=${cause === null || cause === undefined ? 'null (aborted, no cause)' : `${String((cause as Error).name ?? '')} ${String((cause as Error).message ?? cause).slice(0, 100)}`}`);
    this.name = 'SavePhaseError'; this.phase = phase;
  }
}

const chunkKey = (id: string, gen: string, i: number) => `savec:${id}:${gen}:${i}`;

/** Skriv et gemt spil (blob er allerede serialiseret og komprimeret FØR første transaktion åbnes) + metadata. Kvotefejl kastes uændret, andre som SavePhaseError. */
export async function writeSave(id: string, blob: Blob, meta: unknown, st?: UseStore): Promise<void> {
  let phase: SavePhase = 'buffer';
  let i = 0;
  const gen = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const n = Math.max(1, Math.ceil(blob.size / CHUNK_BYTES));
  try {
    for (i = 0; i < n; i++) {
      phase = 'buffer';
      const buf = await blob.slice(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES).arrayBuffer();
      phase = 'chunk';
      await set(chunkKey(id, gen, i), buf, st);
    }
    phase = 'commit';
    await set(`save:${id}`, { v: 2, gen, n, size: blob.size } satisfies SaveManifest, st);
    await set(`meta:${id}`, meta, st);
  } catch (e) {
    await cleanupChunks(id, gen, st, true); // en halvt skrevet generation ryddes (det forrige gem er urørt)
    if (isQuotaError(e)) throw e;
    throw new SavePhaseError(phase, blob.size, i, e);
  }
  await cleanupChunks(id, gen, st, false);
}

/** Slet bidder: alle uden for generationen `gen` (drop=false), eller kun generationen `gen` (drop=true). Bedste bud, kaster aldrig. */
async function cleanupChunks(id: string, gen: string, st: UseStore | undefined, drop: boolean) {
  try {
    const prefix = `savec:${id}:`;
    for (const k of (await keys(st)) as string[]) {
      if (typeof k !== 'string' || !k.startsWith(prefix)) continue;
      const g = k.slice(prefix.length).split(':')[0];
      if (drop ? g === gen : g !== gen) await del(k, st).catch(() => {});
    }
  } catch { /* ignorér */ }
}

/** Læs et gemt spil (gammelt Blob-format eller bidder) som Blob; undefined = findes ikke / bidder mangler */
export async function readSaveBlob(id: string): Promise<Blob | undefined> {
  const v = await get<unknown>(`save:${id}`);
  if (!v) return undefined;
  if (v instanceof Blob) return v;
  if (v instanceof ArrayBuffer) return new Blob([v]);
  if (!isManifest(v)) return undefined;
  const parts: ArrayBuffer[] = [];
  for (let i = 0; i < v.n; i++) {
    const b = await get<ArrayBuffer>(chunkKey(id, v.gen, i));
    if (!b) return undefined;
    parts.push(b);
  }
  return new Blob(parts);
}

export async function deleteSaveData(id: string): Promise<void> {
  await del(`save:${id}`); await del(`meta:${id}`);
  await cleanupChunks(id, '', undefined, false);
}
