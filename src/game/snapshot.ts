// (De)serialisering af hele spiltilstanden som gzip-komprimeret JSON
import { stash } from './humans';
import { rng } from './rng';
import { beat } from './beat';
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
/** (26/11) giv siden luft mellem bidderne: Chromium komprimerer (CompressionStream) i hovedtråden, så ét gem af et sent spil (~80 MB JSON) stod
 *  som ét ~700 ms langt stop (menuerne reagerede først bagefter) – nu ~8 ms ad gangen med tid til klik og tegning imellem (kun i en side) */
const yieldUi = (): Promise<void> => (typeof window === 'undefined' ? Promise.resolve() : new Promise<void>((r) => { setTimeout(r, 0); }));
export async function gzipTextBytes(text: string): Promise<GzBytes> {
  const enc = new TextEncoder();
  // 1 M tegn ad gangen (ikke midt i et surrogatpar) – samme bytes som hele teksten kodet på én gang
  const STEP = 1 << 20;
  const end = (o: number) => { let e = Math.min(text.length, o + STEP); if (e < text.length) { const c = text.charCodeAt(e - 1); if (c >= 0xd800 && c <= 0xdbff) e++; } return e; };
  if (typeof CompressionStream === 'undefined') return [enc.encode(text)];
  const cs = new CompressionStream('gzip');
  const out = readAll(cs.readable);
  const w = cs.writable.getWriter();
  try {
    for (let o = 0; o < text.length;) {
      const e = end(o);
      await w.write(enc.encode(text.slice(o, e)));
      o = e;
      if (o < text.length) await yieldUi();
    }
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
      if (n >= 1 << 20) { beat(); await w.write(enc.encode(buf.join(''))); buf = []; n = 0; }
    }
    if (buf.length) await w.write(enc.encode(buf.join('')));
    await w.close();
  } catch (e) { void w.abort(e).catch(() => {}); void out.catch(() => {}); throw e; }
  return out;
}

/** (hukommelse, Android/Safari 26/11 "NewGameInterrupted … step unpack") Samme værdi som JSON.parse(tekst), men teksten fødes i bidder: beholdere
 *  (objekter/arrays) i de øverste `depth` niveauer bygges her felt for felt, og hver værdi dybere nede (en spiller, en klub, en kamp …) tolkes for
 *  sig med JSON.parse – hele teksten (~100 MB+ med Maximum) findes aldrig på én gang ved siden af objekterne. Felternes rækkefølge og værdierne er
 *  præcis som JSON.parse's (tests/jsonStream.test.ts). Ugyldig JSON giver SyntaxError som JSON.parse. */
export class JsonStreamParser {
  // st: 0 værdi · 1 nøgle eller '}' · 2 nøgle · 3 ':' · 4 ',' eller slut · 5 værdi eller ']' · 6 færdig
  private stack: { v: unknown[] | Record<string, unknown>; arr: boolean; key: string }[] = [];
  private st = 0;
  private root: unknown = undefined;
  // optagelse af én værdi/nøgle: bidderne indtil værdien slutter (kind 1 streng, 2 beholder, 3 tal/literal)
  private cap: string[] = [];
  private kind = 0;
  private isKey = false;
  private nest = 0;
  private inStr = false;
  private esc = false;
  private depth: number;
  constructor(depth = 2) { this.depth = depth; }

  private attach(x: unknown): void {
    const f = this.stack[this.stack.length - 1];
    if (!f) { this.root = x; this.st = 6; return; }
    if (f.arr) (f.v as unknown[]).push(x);
    else if (f.key === '__proto__') Object.defineProperty(f.v, f.key, { value: x, writable: true, enumerable: true, configurable: true });
    else (f.v as Record<string, unknown>)[f.key] = x;
    this.st = 4;
  }
  private done(): void {
    const t = this.cap.length === 1 ? this.cap[0] : this.cap.join('');
    this.cap = [];
    const k = this.kind;
    this.kind = 0;
    const x = k === 3 ? (t === 'true' ? true : t === 'false' ? false : t === 'null' ? null : JSON.parse(t)) : JSON.parse(t);
    if (this.isKey) { if (typeof x !== 'string') throw new SyntaxError('JSON: key is not a string'); this.stack[this.stack.length - 1].key = x; this.st = 3; return; }
    this.attach(x);
  }
  private static STR = /["\\]/g;
  private static NEST = /["\\{}[\]]/g;
  private static PRIM = /[,\]}\s]/g;
  /** fortsætter optagelsen: bidden s fra `start` (søgningen fra `i`) – returnerer positionen efter værdien eller -1 (bidden er brugt op) */
  private capture(s: string, start: number, i: number): number {
    if (this.esc) { this.esc = false; i++; }
    if (this.kind === 3) {
      const re = JsonStreamParser.PRIM; re.lastIndex = i;
      const m = re.exec(s);
      if (!m) { this.cap.push(start ? s.slice(start) : s); return -1; }
      this.cap.push(s.slice(start, m.index)); this.done(); return m.index;
    }
    for (;;) {
      const re = this.inStr ? JsonStreamParser.STR : JsonStreamParser.NEST;
      re.lastIndex = i;
      const m = re.exec(s);
      if (!m) { this.cap.push(start ? s.slice(start) : s); return -1; }
      const j = m.index, c = s.charCodeAt(j);
      i = j + 1;
      if (c === 92) { if (i >= s.length) { this.esc = true; this.cap.push(start ? s.slice(start) : s); return -1; } i++; continue; } // \
      if (c === 34) { // "
        this.inStr = !this.inStr;
        if (!this.inStr && this.kind === 1) { this.cap.push(s.slice(start, i)); this.done(); return i; }
        continue;
      }
      if (c === 123 || c === 91) this.nest++;
      else if (--this.nest === 0) { this.cap.push(s.slice(start, i)); this.done(); return i; }
    }
  }
  private begin(s: string, i: number, c: number, key: boolean): number {
    this.isKey = key;
    this.nest = 0;
    this.cap = [];
    if (c === 34) { this.kind = 1; this.inStr = true; return this.capture(s, i, i + 1); }
    this.inStr = false;
    this.kind = c === 123 || c === 91 ? 2 : 3;
    return this.capture(s, i, i);
  }
  feed(s: string): void {
    let i = 0;
    const n = s.length;
    if (this.kind) { i = this.capture(s, 0, 0); if (i < 0) return; }
    while (i < n) {
      const c = s.charCodeAt(i);
      if (c === 32 || c === 10 || c === 13 || c === 9) { i++; continue; }
      const st = this.st;
      if (st === 0 || st === 5) {
        if (st === 5 && c === 93) { this.pop(); i++; continue; }
        if ((c === 123 || c === 91) && this.stack.length < this.depth) {
          const v = c === 91 ? [] : {};
          this.attach(v);
          this.stack.push({ v, arr: c === 91, key: '' });
          this.st = c === 91 ? 5 : 1;
          i++; continue;
        }
        i = this.begin(s, i, c, false); if (i < 0) return; continue;
      }
      if (st === 1 || st === 2) {
        if (st === 1 && c === 125) { this.pop(); i++; continue; }
        if (c !== 34) throw new SyntaxError(`JSON: expected key, got '${s[i]}'`);
        i = this.begin(s, i, c, true); if (i < 0) return; continue;
      }
      if (st === 3) { if (c !== 58) throw new SyntaxError(`JSON: expected ':', got '${s[i]}'`); this.st = 0; i++; continue; }
      if (st === 4) {
        const f = this.stack[this.stack.length - 1];
        if (c === 44) { this.st = f.arr ? 0 : 2; i++; continue; }
        if (c === (f.arr ? 93 : 125)) { this.pop(); i++; continue; }
        throw new SyntaxError(`JSON: unexpected '${s[i]}'`);
      }
      throw new SyntaxError('JSON: unexpected data after end');
    }
  }
  private pop(): void { this.stack.pop(); this.st = this.stack.length ? 4 : 6; }
  end(): unknown {
    if (this.kind === 3 && !this.isKey && this.stack.length === 0) this.done();
    if (this.st !== 6 || this.kind) throw new SyntaxError('JSON: unexpected end of data');
    return this.root;
  }
}

/** et gemt spils bytes (gzip-JSON eller ren JSON) tolket som JSON.parse(gunzipText(blob)) – men strømmende (JsonStreamParser): kun én bid af
 *  teksten ad gangen; gzip-bytes læses direkte fra blob'en */
export async function parseJsonBlob(blob: Blob, depth = 2): Promise<unknown> {
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  const gz = head[0] === 0x1f && head[1] === 0x8b;
  let stream = blob.stream() as ReadableStream<Uint8Array>;
  if (gz) stream = stream.pipeThrough(new DecompressionStream('gzip') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
  const dec = new TextDecoder();
  const p = new JsonStreamParser(depth);
  const rd = stream.getReader();
  // (26/11) aldrig vente for evigt: svarer læsningen ikke inden for READ_STALL_MS (en bid er ~64 KB), afbrydes den med en fejl
  const read = () => new Promise<ReadableStreamReadResult<Uint8Array>>((resolve, reject) => {
    const tm = setTimeout(() => reject(new Error(`parseJsonBlob: read stalled ${READ_STALL_MS} ms`)), READ_STALL_MS);
    rd.read().then((r) => { clearTimeout(tm); resolve(r); }, (e) => { clearTimeout(tm); reject(e); });
  });
  try {
    for (;;) {
      const { done, value } = await read();
      if (done) break;
      beat();
      const t = dec.decode(value, { stream: true });
      if (t) p.feed(t);
    }
  } catch (e) { void rd.cancel(e).catch(() => {}); throw e; }
  const t = dec.decode();
  if (t) p.feed(t);
  return p.end();
}
const READ_STALL_MS = 60_000;

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

/** (26/11) strømmende (parseJsonBlob): samme spil som JSON.parse(gunzipText(blob)), men hele teksten ligger aldrig i hukommelsen ved siden af
 *  objekterne – hovedtrådens top ved udpakningen af et nyt spil (Maximum) faldt fra ~354 til ~144 MB over udgangspunktet (spillet selv ~127 MB) */
export async function deserializeState(blob: Blob): Promise<GameState> {
  return ensureOptions(await parseJsonBlob(blob) as GameState);
}

/** et øjebliksbillede/gemt spil uden `options` (beskadiget eller meget gammelt) må ikke vælte skærmene (`options.mode` på undefined): udfyld som et gammelt udvidet spil */
export function ensureOptions(g: GameState): GameState {
  if (g && typeof g === 'object' && !g.options) g.options = { masking: false, autosave: true, matchSpeed: 650, fullCommentary: true, rules: 'modern' } as GameState['options'];
  return g;
}
