// Lagring af et gemt spil i IndexedDB som bidder af ArrayBuffer (ikke som Blob).
// Årsag til iPhone-fejlen "SaveFailed: null (aborted, no cause)": WebKit afbryder en IndexedDB-transaktion uden årsag, når værdien er en Blob
// (målt i Playwright-WebKit: Blob på 5–50 MB afbrydes altid med fejl null; de samme gzip-data som ArrayBuffer lykkes på 7–43 ms).
// Format: `save:<id>` = Blob (gammelt format, læses stadig) eller manifest { v: 2, gen, n, size }; bidderne ligger i `savec:<id>:<gen>:<i>`.
// Manifestet skrives til sidst (sammen med metadata), så et afbrudt gem aldrig ødelægger det forrige; gamle bidder ryddes bagefter.
// (24/11 "phase=buffer … NotReadableError The I/O read operation failed", også ved genforsøget) Gemmet kommer nu som Uint8Array-bidder fra
// komprimeringen (snapshot.ts GzBytes) og deles op i sidens egen hukommelse – en Blob i WebKit kan blive ulæselig (iOS smider dens data væk i
// baggrunden), og genforsøget læste den samme døde Blob. Blob-input (et gem hentet fra skyen) læses som før.
// Forældreløse bidder (en generation uden manifest – appen lukket midt i et gem eller før oprydningen) ryddes af sweepSaveChunks.
import { del, get, keys, set } from 'idb-keyval';
import type { UseStore } from 'idb-keyval';
import { isQuotaError } from './storageGuard';

export const CHUNK_BYTES = 4 * 1048576;

export interface SaveManifest { v: 2; gen: string; n: number; size: number }
const isManifest = (x: unknown): x is SaveManifest => !!x && typeof x === 'object' && !(x instanceof Blob) && (x as SaveManifest).v === 2;

export type SavePhase = 'buffer' | 'chunk' | 'commit';
/** gemmets data: komprimeringens bidder (snapshot.ts GzBytes) eller en Blob */
export type SaveData = Blob | Uint8Array<ArrayBuffer>[];
const dataSize = (d: SaveData) => (d instanceof Blob ? d.size : d.reduce((n, b) => n + b.byteLength, 0));
/** Et gem fejlede i en bestemt fase (buffer = data → bidens ArrayBuffer, chunk = put af en bid, commit = manifest + metadata) */
export class SavePhaseError extends Error {
  phase: SavePhase;
  constructor(phase: SavePhase, size: number, chunk: number, cause: unknown) {
    super(`phase=${phase}${phase === 'chunk' ? `#${chunk}` : ''} size=${(size / 1048576).toFixed(1)}MB cause=${cause === null || cause === undefined ? 'null (aborted, no cause)' : `${String((cause as Error).name ?? '')} ${String((cause as Error).message ?? cause).slice(0, 100)}`}`);
    this.name = 'SavePhaseError'; this.phase = phase;
  }
}

const chunkKey = (id: string, gen: string, i: number) => `savec:${id}:${gen}:${i}`;

/** Skriv et gemt spil (blob er allerede serialiseret og komprimeret FØR første transaktion åbnes) + metadata. Kvotefejl kastes uændret, andre som SavePhaseError. */
export function writeSave(id: string, blob: SaveData, meta: unknown, st?: UseStore): Promise<void> {
  // (23/11) to gem af samme spil på én gang (autogem + Save/skyen) må ikke flettes: det seneste manifest kunne pege på bidder, som det andet gems
  // oprydning havde slettet ("ResumeMissing") – gemmene af ét spil køres efter hinanden
  const prev = queue.get(id) ?? Promise.resolve();
  const run = prev.catch(() => {}).then(() => writeSaveNow(id, blob, meta, st));
  const tail = run.catch(() => {});
  queue.set(id, tail);
  void tail.then(() => { if (queue.get(id) === tail) queue.delete(id); });
  return run;
}
const queue = new Map<string, Promise<void>>();

/** bid nr. i (CHUNK_BYTES) af bidderne som eget ArrayBuffer – kopieret i sidens hukommelse */
function sliceParts(parts: Uint8Array<ArrayBuffer>[], start: number, end: number): ArrayBuffer {
  const out = new Uint8Array(Math.max(0, end - start));
  let o = 0;
  for (const b of parts) {
    const s = Math.max(start - o, 0), e = Math.min(end - o, b.byteLength);
    if (e > s) out.set(b.subarray(s, e), o + s - start);
    o += b.byteLength;
    if (o >= end) break;
  }
  return out.buffer;
}

async function writeSaveNow(id: string, blob: SaveData, meta: unknown, st?: UseStore): Promise<void> {
  let phase: SavePhase = 'buffer';
  let i = 0;
  const gen = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const size = dataSize(blob);
  const n = Math.max(1, Math.ceil(size / CHUNK_BYTES));
  try {
    for (i = 0; i < n; i++) {
      phase = 'buffer';
      const a = i * CHUNK_BYTES, z = Math.min(size, (i + 1) * CHUNK_BYTES);
      const buf = blob instanceof Blob ? await blob.slice(a, z).arrayBuffer() : sliceParts(blob, a, z);
      phase = 'chunk';
      await set(chunkKey(id, gen, i), buf, st);
    }
    phase = 'commit';
    await set(`save:${id}`, { v: 2, gen, n, size } satisfies SaveManifest, st);
    await set(`meta:${id}`, meta, st);
  } catch (e) {
    await cleanupChunks(id, gen, st, true); // en halvt skrevet generation ryddes (det forrige gem er urørt)
    if (isQuotaError(e)) throw e;
    throw new SavePhaseError(phase, size, i, e);
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

/** en generations alder: gen = Date.now() i base 36 + 4 tilfældige tegn */
const genAge = (gen: string) => { const t = parseInt(gen.slice(0, -4), 36); return Number.isFinite(t) ? Date.now() - t : Infinity; };
/** Bidder yngre end dette ryddes aldrig af sweepSaveChunks: et gem kan være i gang (også i spilstartens arbejder, som skriver manifestet til sidst) */
export const SWEEP_MIN_AGE_MS = 10 * 60_000;

/** orphans = forældreløse bidder (højst 4 MB hver) i orphanGens generationer; swept = slettet nu */
export interface SaveStoreDiag { saves: number; chunks: number; gens: number; orphans: number; orphanGens: number; swept: number; liveMB: number }
/** Lagerets gemte spil: manifester/gamle Blob-gem, bidder i alt, generationer og forældreløse (generationer, intet manifest peger på).
 *  sweep=true sletter de forældreløse, der er ældre end SWEEP_MIN_AGE_MS (og ikke tilhører et gem i gang her). Kaster ikke ved sletning. */
export async function sweepSaveChunks(sweep = true, st?: UseStore): Promise<SaveStoreDiag> {
  const all = ((await keys(st)) as unknown[]).filter((k): k is string => typeof k === 'string');
  const live = new Map<string, string>();
  let saves = 0, liveBytes = 0;
  for (const k of all) {
    if (!k.startsWith('save:')) continue;
    saves++;
    const v = await get<unknown>(k, st);
    if (isManifest(v)) { live.set(k.slice(5), v.gen); liveBytes += v.size; } else if (v instanceof Blob) liveBytes += v.size;
  }
  const gens = new Set<string>(), orphanGens = new Set<string>();
  const doomed: string[] = [];
  let chunks = 0, orphans = 0;
  for (const k of all) {
    if (!k.startsWith('savec:')) continue;
    chunks++;
    const rest = k.slice(6), j = rest.lastIndexOf(':'), j2 = rest.lastIndexOf(':', j - 1);
    if (j2 < 0) continue;
    const id = rest.slice(0, j2), gen = rest.slice(j2 + 1, j);
    gens.add(`${id}:${gen}`);
    if (live.get(id) === gen) continue;
    orphans++; orphanGens.add(`${id}:${gen}`);
    if (sweep && !queue.has(id) && genAge(gen) > SWEEP_MIN_AGE_MS) doomed.push(k);
  }
  for (const k of doomed) await del(k, st).catch(() => {});
  return { saves, chunks, gens: gens.size, orphans, orphanGens: orphanGens.size, swept: doomed.length, liveMB: Math.round(liveBytes / 1048576) };
}

let swept: Promise<unknown> | null = null;
/** én oprydning pr. session (ved første listning af de gemte spil); kaster aldrig */
export function sweepSaveChunksOnce(): void {
  if (!swept) swept = sweepSaveChunks(true).catch(() => null);
}
/** diagnose til fejlmeldinger (uden at slette): "saves=… chunks=… gens=… orphans=…/…g liveMB=…" – kaster aldrig */
export async function saveStoreDiagText(): Promise<string> {
  try {
    const d = await sweepSaveChunks(false);
    return `saves=${d.saves} chunks=${d.chunks} gens=${d.gens} orphans=${d.orphans}/${d.orphanGens}g liveMB=${d.liveMB}`;
  } catch (e) { return `saveDiag=err ${String((e as Error)?.name ?? e)}`; }
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
