// (De)serialisering af hele spiltilstanden som gzip-komprimeret JSON
import { stash } from './humans';
import { rng } from './rng';
import { packCarry } from './state';
import type { GameState } from './types';

// (17/11) tallene gemmes uden afrunding: med 2 decimaler (før) spillede et gemt og indlæst spil ikke videre som det samme spil (egenskaberne,
// moralen, lønnen, værdien, saldoen … er kommatal i originalens beregninger) – scripts/save-diff.ts: +19 % gzip

/** (iPhone 24/11 "SavePhaseError phase=buffer … NotReadableError The I/O read operation failed") Gzip-uddata samles som Uint8Array-bidder i
 *  sidens egen hukommelse – ikke som Blob (Response(stream).blob()): en Blob i WebKit lever i netværksprocessen/en midlertidig fil, som iOS kan
 *  smide væk, mens appen ligger i baggrunden, så den ikke kan læses igen (og genforsøget læste den samme døde Blob). */
export type GzBytes = Uint8Array<ArrayBuffer>[];
export const gzSize = (p: GzBytes) => p.reduce((n, b) => n + b.byteLength, 0);
/** ét sammenhængende ArrayBuffer (til overdragelse som Transferable) */
export function gzConcat(p: GzBytes): ArrayBuffer {
  const out = new Uint8Array(gzSize(p));
  let o = 0;
  for (const b of p) { out.set(b, o); o += b.byteLength; }
  return out.buffer;
}
async function readAll(r: ReadableStream<Uint8Array<ArrayBuffer>>): Promise<GzBytes> {
  const parts: GzBytes = [];
  const rd = r.getReader();
  for (;;) { const { done, value } = await rd.read(); if (done) break; if (value?.byteLength) parts.push(value); }
  return parts;
}

export async function gzipText(text: string): Promise<Blob> {
  return new Blob(await gzipTextBytes(text));
}
export async function gzipTextBytes(text: string): Promise<GzBytes> {
  const raw = new TextEncoder().encode(text);
  if (typeof CompressionStream === 'undefined') return [raw];
  const cs = new CompressionStream('gzip');
  const out = readAll(cs.readable);
  const w = cs.writable.getWriter();
  try {
    for (let o = 0; o < raw.byteLength; o += 1 << 20) await w.write(raw.subarray(o, o + (1 << 20)));
    await w.close();
  } catch (e) { void w.abort(e).catch(() => {}); void out.catch(() => {}); throw e; }
  return out;
}

/** (hukommelse, iPhone 24/11) Præcis samme tekst som JSON.stringify(v), men i bidder: almindelige objekter/arrays i op til `depth` niveauer skrives
 *  felt for felt, så hele spillets JSON-tekst (~100 MB+, i WebKit ofte UTF-16) aldrig findes som én streng (spilstartens arbejder: toppen ved pakningen). */
export function* jsonChunks(v: unknown, depth = 2): Generator<string> {
  const plain = (x: unknown): x is object => {
    if (typeof x !== 'object' || x === null || typeof (x as { toJSON?: unknown }).toJSON === 'function') return false;
    if (Array.isArray(x)) return true;
    const p = Object.getPrototypeOf(x);
    return p === Object.prototype || p === null;
  };
  if (depth <= 0 || !plain(v)) { const t = JSON.stringify(v); if (t !== undefined) yield t; return; }
  if (Array.isArray(v)) {
    yield '[';
    for (let i = 0; i < v.length; i++) {
      if (i) yield ',';
      const x = v[i];
      if (plain(x)) yield* jsonChunks(x, depth - 1); else yield JSON.stringify(x) ?? 'null';
    }
    yield ']';
    return;
  }
  yield '{';
  let first = true;
  for (const k of Object.keys(v)) {
    const x = (v as Record<string, unknown>)[k];
    if (plain(x)) { yield `${first ? '' : ','}${JSON.stringify(k)}:`; first = false; yield* jsonChunks(x, depth - 1); continue; }
    const t = JSON.stringify(x);
    if (t === undefined) continue;
    yield `${first ? '' : ','}${JSON.stringify(k)}:${t}`; first = false;
  }
  yield '}';
}

/** gzip af tekstbidder (jsonChunks) – bytes skrives til komprimeringen i portioner på ~1 MB; uddata som Uint8Array-bidder (GzBytes) */
export async function gzipChunks(chunks: Iterable<string>): Promise<GzBytes> {
  const enc = new TextEncoder();
  if (typeof CompressionStream === 'undefined') return [...chunks].map((c) => enc.encode(c));
  const cs = new CompressionStream('gzip');
  const out = readAll(cs.readable);
  const w = cs.writable.getWriter();
  let buf: string[] = [], n = 0;
  try {
    for (const c of chunks) {
      buf.push(c); n += c.length;
      if (n >= 1 << 20) { await w.write(enc.encode(buf.join(''))); buf = []; n = 0; }
    }
    if (buf.length) await w.write(enc.encode(buf.join('')));
    await w.close();
  } catch (e) { void w.abort(e).catch(() => {}); void out.catch(() => {}); throw e; }
  return out;
}

export async function gunzipText(blob: Blob): Promise<string> {
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] !== 0x1f || head[1] !== 0x8b) return blob.text();
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

/** `streamed` (kun spilstartens arbejder, hvor intet andet ændrer spillet undervejs): teksten skrives i bidder mellem await – i hovedtråden kunne
 *  spillet ellers ændre sig midt i et gem, så dér er tolkningen ét synkront øjebliksbillede som før */
export async function serializeBytes(g: GameState, streamed = false): Promise<GzBytes> {
  g.rng = rng.state;
  stash(g);
  // modulernes tilstand (carry.ts) følger med det aktive spil, så det indlæste spil fortsætter præcis som dette
  packCarry(g);
  // (24/11) i bidder (samme tekst som JSON.stringify) – hele teksten findes aldrig som én streng
  try { return streamed ? await gzipChunks(jsonChunks(g)) : await gzipTextBytes(JSON.stringify(g)); } finally { delete g.cmCarry; }
}
export async function serializeState(g: GameState, streamed = false): Promise<Blob> {
  return new Blob(await serializeBytes(g, streamed));
}

/** (23/11) nyt spil fra spilstartens arbejder som gzip-bytes (ui/newGameWorker.ts): som den strukturerede kopi før – hovedtråden fortsatte med
 *  spillets egen g.rng (setGame), ikke arbejderens talrække – så g.rng skrives ikke om (scripts/newgame-phases-check.ts … json=1: ENS) */
export async function serializeNewGame(g: GameState): Promise<GzBytes> {
  const keep = rng.state;
  rng.state = g.rng;
  try { return await serializeBytes(g, true); } finally { rng.state = keep; }
}

export async function deserializeState(blob: Blob): Promise<GameState> {
  return ensureOptions(JSON.parse(await gunzipText(blob)) as GameState);
}

/** et øjebliksbillede/gemt spil uden `options` (beskadiget eller meget gammelt) må ikke vælte skærmene (`options.mode` på undefined): udfyld som et gammelt udvidet spil */
export function ensureOptions(g: GameState): GameState {
  if (g && typeof g === 'object' && !g.options) g.options = { masking: false, autosave: true, matchSpeed: 650, fullCommentary: true, rules: 'modern' } as GameState['options'];
  return g;
}
