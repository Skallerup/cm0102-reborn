// Lagring af et gemt spil i IndexedDB som bidder af ArrayBuffer (ikke som Blob).
// Årsag til iPhone-fejlen "SaveFailed: null (aborted, no cause)": WebKit afbryder en IndexedDB-transaktion uden årsag, når værdien er en Blob
// (målt i Playwright-WebKit: Blob på 5–50 MB afbrydes altid med fejl null; de samme gzip-data som ArrayBuffer lykkes på 7–43 ms).
// Format: `save:<id>` = Blob (gammelt format, læses stadig) eller manifest { v: 2, gen, n, size }; bidderne ligger i `savec:<id>:<gen>:<i>`.
// Manifestet skrives til sidst (sammen med metadata), så et afbrudt gem aldrig ødelægger det forrige; gamle bidder ryddes bagefter.
// (24/11 "phase=buffer … NotReadableError The I/O read operation failed", også ved genforsøget) Gemmet kommer nu som Uint8Array-bidder fra
// komprimeringen (snapshot.ts GzBytes) og deles op i sidens egen hukommelse – en Blob i WebKit kan blive ulæselig (iOS smider dens data væk i
// baggrunden), og genforsøget læste den samme døde Blob. Blob-input (et gem hentet fra skyen) læses som før.
// Forældreløse bidder (en generation uden manifest – appen lukket midt i et gem eller før oprydningen) ryddes af sweepSaveChunks.
// (Windows/Chrome 24/11 "phase=chunk#2 … DataError Failed to write blobs (IOError)") Chrome lægger en IndexedDB-værdi over 64 KB i en egen blob-fil
// i profilmappen; kan den fil ikke skrives (fuld disk, antivirus, rettigheder), skrives gemmet igen i bidder under 64 KB (SMALL_CHUNK_BYTES), som
// Chrome lægger direkte i LevelDB uden blob-fil – resten af sessionen. Manifestet får `cs` (bidstørrelsen); læsningen er den samme (bidderne sættes sammen).
import { del, delMany, get, getMany, keys, set, setMany } from 'idb-keyval';
import type { UseStore } from 'idb-keyval';
import { isBlobWriteError, isQuotaError } from './storageGuard';

export const CHUNK_BYTES = 4 * 1048576;
/** under Chromes grænse (64 KB, blink IDBValueWrapper::kWrapThreshold) for værdier, der lægges i en blob-fil */
export const SMALL_CHUNK_BYTES = 60 * 1024;
/** små bidder skrives/læses/slettes i transaktioner à så mange (≈2,3 MB) */
const SMALL_BATCH = 40;

export interface SaveManifest { v: 2; gen: string; n: number; size: number; cs?: number }
const isManifest = (x: unknown): x is SaveManifest => !!x && typeof x === 'object' && !(x instanceof Blob) && (x as SaveManifest).v === 2;

export type SavePhase = 'buffer' | 'chunk' | 'commit';
/** gemmets data: komprimeringens bidder (snapshot.ts GzBytes) eller en Blob */
export type SaveData = Blob | Uint8Array<ArrayBuffer>[];
const dataSize = (d: SaveData) => (d instanceof Blob ? d.size : d.reduce((n, b) => n + b.byteLength, 0));
/** Et gem fejlede i en bestemt fase (buffer = data → bidens ArrayBuffer, chunk = put af en bid, commit = manifest + metadata) */
export class SavePhaseError extends Error {
  phase: SavePhase;
  cause: unknown;
  constructor(phase: SavePhase, size: number, chunk: number, cause: unknown, small = false) {
    super(`phase=${phase}${phase === 'chunk' ? `#${chunk}` : ''} size=${(size / 1048576).toFixed(1)}MB${small ? ' small' : ''} cause=${cause === null || cause === undefined ? 'null (aborted, no cause)' : `${String((cause as Error).name ?? '')} ${String((cause as Error).message ?? cause).slice(0, 100)}`}`);
    this.name = 'SavePhaseError'; this.phase = phase; this.cause = cause;
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

/** Blob-skrivningen fejlede i denne session (Chrome "Failed to write blobs"): resten af sessionen gemmes i små bidder */
let smallChunks = false;
/** Kun til tests */
export function resetSaveStore() { smallChunks = false; }
export const usingSmallChunks = () => smallChunks;

async function writeSaveNow(id: string, blob: SaveData, meta: unknown, st?: UseStore): Promise<void> {
  try { await writeGen(id, blob, meta, st, smallChunks); return; }
  catch (e) {
    if (smallChunks || !isBlobWriteError((e as SavePhaseError).cause ?? e)) { await freeSpace(id, st, e); throw e; }
  }
  // blob-filen kunne ikke skrives: samme gem igen i bidder under 64 KB (ingen blob-fil)
  smallChunks = true;
  try { await writeGen(id, blob, meta, st, true); }
  catch (e) { await freeSpace(id, st, e); throw e; }
}

/** et fejlet gem af et lagerproblem: ryd forældreløse bidder (også dette spils egne gamle generationer), så disken ikke fyldes yderligere */
async function freeSpace(id: string, st: UseStore | undefined, e: unknown) {
  if (isQuotaError(e) || isBlobWriteError((e as SavePhaseError).cause ?? e)) await sweepSaveChunks(true, st, id).catch(() => {});
}

/** skriv én generation af bidder + manifest + metadata; en halvt skrevet generation ryddes. Kvotefejl kastes uændret, andre som SavePhaseError */
async function writeGen(id: string, blob: SaveData, meta: unknown, st: UseStore | undefined, small: boolean): Promise<void> {
  let phase: SavePhase = 'buffer';
  let i = 0;
  const gen = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const size = dataSize(blob);
  const cs = small ? SMALL_CHUNK_BYTES : CHUNK_BYTES;
  const n = Math.max(1, Math.ceil(size / cs));
  try {
    const buf = async (k: number) => {
      const a = k * cs, z = Math.min(size, (k + 1) * cs);
      return blob instanceof Blob ? await blob.slice(a, z).arrayBuffer() : sliceParts(blob, a, z);
    };
    if (!small) {
      for (i = 0; i < n; i++) {
        phase = 'buffer';
        const b = await buf(i);
        phase = 'chunk';
        await set(chunkKey(id, gen, i), b, st);
      }
    } else {
      for (i = 0; i < n; i += SMALL_BATCH) {
        phase = 'buffer';
        const batch: [IDBValidKey, ArrayBuffer][] = [];
        for (let k = i; k < Math.min(n, i + SMALL_BATCH); k++) batch.push([chunkKey(id, gen, k), await buf(k)]);
        phase = 'chunk';
        await setMany(batch, st);
      }
    }
    phase = 'commit';
    await set(`save:${id}`, { v: 2, gen, n, size, ...(small ? { cs } : {}) } satisfies SaveManifest, st);
    await set(`meta:${id}`, meta, st);
  } catch (e) {
    await cleanupChunks(id, gen, st, true); // en halvt skrevet generation ryddes (det forrige gem er urørt)
    if (isQuotaError(e)) throw e;
    throw new SavePhaseError(phase, size, i, e, small);
  }
  await cleanupChunks(id, gen, st, false);
}

/** Slet bidder: alle uden for generationen `gen` (drop=false), eller kun generationen `gen` (drop=true). Bedste bud, kaster aldrig. */
async function cleanupChunks(id: string, gen: string, st: UseStore | undefined, drop: boolean) {
  try {
    const prefix = `savec:${id}:`;
    const doomed = ((await keys(st)) as unknown[]).filter((k): k is string => {
      if (typeof k !== 'string' || !k.startsWith(prefix)) return false;
      const g = k.slice(prefix.length).split(':')[0];
      return drop ? g === gen : g !== gen;
    });
    await delKeys(doomed, st);
  } catch { /* ignorér */ }
}

/** slet nøgler i transaktioner à SMALL_BATCH (et gem i små bidder har hundredvis); bedste bud, kaster aldrig */
async function delKeys(ks: string[], st?: UseStore) {
  for (let i = 0; i < ks.length; i += SMALL_BATCH) {
    const part = ks.slice(i, i + SMALL_BATCH);
    await delMany(part, st).catch(async () => { for (const k of part) await del(k, st).catch(() => {}); });
  }
}

/** en generations alder: gen = Date.now() i base 36 + 4 tilfældige tegn */
const genAge = (gen: string) => { const t = parseInt(gen.slice(0, -4), 36); return Number.isFinite(t) ? Date.now() - t : Infinity; };
/** Bidder yngre end dette ryddes aldrig af sweepSaveChunks: et gem kan være i gang (også i spilstartens arbejder, som skriver manifestet til sidst) */
export const SWEEP_MIN_AGE_MS = 10 * 60_000;

/** orphans = forældreløse bidder (højst 4 MB hver) i orphanGens generationer; swept = slettet nu */
export interface SaveStoreDiag { saves: number; chunks: number; gens: number; orphans: number; orphanGens: number; swept: number; liveMB: number }
/** Lagerets gemte spil: manifester/gamle Blob-gem, bidder i alt, generationer og forældreløse (generationer, intet manifest peger på).
 *  sweep=true sletter de forældreløse, der er ældre end SWEEP_MIN_AGE_MS (og ikke tilhører et gem i gang her – undtagen `own`, spillet, hvis gem netop
 *  er fejlet i køen: dets gamle forældreløse generationer ryddes også). Kaster ikke ved sletning. */
export async function sweepSaveChunks(sweep = true, st?: UseStore, own?: string): Promise<SaveStoreDiag> {
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
    if (sweep && (id === own || !queue.has(id)) && genAge(gen) > SWEEP_MIN_AGE_MS) doomed.push(k);
  }
  await delKeys(doomed, st);
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
  // små bidder (cs): hundredvis – læses i transaktioner à SMALL_BATCH
  const step = v.cs ? SMALL_BATCH : 1;
  for (let i = 0; i < v.n; i += step) {
    const ks = Array.from({ length: Math.min(step, v.n - i) }, (_, k) => chunkKey(id, v.gen, i + k));
    const bs = step === 1 ? [await get<ArrayBuffer>(ks[0])] : await getMany<ArrayBuffer>(ks);
    for (const b of bs) { if (!b) return undefined; parts.push(b); }
  }
  return new Blob(parts);
}

export async function deleteSaveData(id: string): Promise<void> {
  await del(`save:${id}`); await del(`meta:${id}`);
  await cleanupChunks(id, '', undefined, false);
}
