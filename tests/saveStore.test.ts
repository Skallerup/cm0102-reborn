// Gemt spil som bidder af ArrayBuffer (WebKit afbryder Blob-puts uden årsag): rundtur, gammelt Blob-format, afbrudt gem ødelægger ikke det forrige, fasen meldes.
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }; });
const db = vi.hoisted(() => ({ m: new Map<string, unknown>(), failOn: null as null | ((k: string) => unknown) }));
vi.mock('idb-keyval', () => ({
  get: async (k: string) => db.m.get(k),
  set: async (k: string, v: unknown) => { if (db.failOn) { const r = db.failOn(k); if (r !== undefined) throw r; } db.m.set(k, v); },
  setMany: async (es: [string, unknown][]) => { for (const [k] of es) if (db.failOn) { const r = db.failOn(k); if (r !== undefined) throw r; } for (const [k, v] of es) db.m.set(k, v); },
  getMany: async (ks: string[]) => ks.map((k) => db.m.get(k)),
  del: async (k: string) => { db.m.delete(k); },
  delMany: async (ks: string[]) => { for (const k of ks) db.m.delete(k); },
  keys: async () => [...db.m.keys()],
  createStore: () => undefined,
}));
import { CHUNK_BYTES, deleteSaveData, readSaveBlob, resetSaveStore, saveStoreDiagText, SavePhaseError, SMALL_CHUNK_BYTES, sweepSaveChunks, SWEEP_MIN_AGE_MS, usingSmallChunks, writeSave } from '../src/game/saveStore';
import { isStorageProblem } from '../src/game/storageGuard';
import { gunzipText, gzipChunks } from '../src/game/snapshot';

const bytes = (n: number, seed = 1) => { const a = new Uint8Array(n); for (let i = 0; i < n; i++) a[i] = (i * 31 + seed) & 255; return a; };
const same = async (b: Blob | undefined, a: Uint8Array) => { expect(b).toBeTruthy(); expect(new Uint8Array(await b!.arrayBuffer())).toEqual(a); };
const chunksOf = (id: string) => [...db.m.keys()].filter((k) => k.startsWith(`savec:${id}:`)).length;

describe('saveStore', () => {
  beforeEach(() => { db.m.clear(); db.failOn = null; resetSaveStore(); });
  it('rundtur over flere bidder, metadata skrives, kun én generation bliver', async () => {
    const a = bytes(CHUNK_BYTES * 2 + 123);
    await writeSave('g', new Blob([a]), { id: 'g' });
    await same(await readSaveBlob('g'), a);
    expect(db.m.get('meta:g')).toEqual({ id: 'g' });
    const b = bytes(1000, 7);
    await writeSave('g', new Blob([b]), { id: 'g' });
    await same(await readSaveBlob('g'), b);
    expect(chunksOf('g')).toBe(1);
  });
  it('to gem af samme spil på én gang flettes ikke (manifestet peger aldrig på slettede bidder)', async () => {
    const a = bytes(CHUNK_BYTES * 2 + 9, 3), b = bytes(CHUNK_BYTES + 1, 5);
    await Promise.all([writeSave('g', new Blob([a]), { v: 'a' }), writeSave('g', new Blob([b]), { v: 'b' })]);
    await same(await readSaveBlob('g'), b);
    expect(db.m.get('meta:g')).toEqual({ v: 'b' });
    expect(chunksOf('g')).toBe(2);
  });
  it('gammelt format (Blob under save:<id>) kan stadig læses', async () => {
    const a = bytes(500);
    db.m.set('save:old', new Blob([a]));
    await same(await readSaveBlob('old'), a);
    expect(await readSaveBlob('findes-ikke')).toBeUndefined();
  });
  it('afbrudt gem ødelægger ikke det forrige og melder fase og størrelse', async () => {
    const a = bytes(CHUNK_BYTES + 5);
    await writeSave('g', new Blob([a]), { v: 1 });
    db.failOn = (k) => (k.startsWith('savec:g:') ? null : undefined); // WebKit: fejl = null
    const e = await writeSave('g', new Blob([bytes(CHUNK_BYTES * 3)]), { v: 2 }).catch((x) => x);
    expect(e).toBeInstanceOf(SavePhaseError);
    expect(e.phase).toBe('chunk');
    expect(e.message).toMatch(/phase=chunk#0 size=12\.0MB cause=null/);
    db.failOn = null;
    await same(await readSaveBlob('g'), a);
    expect(db.m.get('meta:g')).toEqual({ v: 1 });
    expect(chunksOf('g')).toBe(2);
  });
  it('kvotefejl kastes uændret; commit-fase meldes; sletning fjerner bidderne', async () => {
    const q = Object.assign(new Error('full'), { name: 'QuotaExceededError' });
    db.failOn = () => q;
    await expect(writeSave('g', new Blob([bytes(10)]), {})).rejects.toBe(q);
    db.failOn = (k) => (k === 'save:g' ? new Error('x') : undefined);
    await expect(writeSave('g', new Blob([bytes(10)]), {})).rejects.toMatchObject({ phase: 'commit' });
    db.failOn = null;
    await writeSave('g', new Blob([bytes(10)]), {});
    await deleteSaveData('g');
    expect(db.m.size).toBe(0);
  });
  it('bytes som bidder (komprimeringens uddata) deles op uden Blob – skæve grænser', async () => {
    const a = bytes(CHUNK_BYTES * 2 + 777, 9);
    const parts = [a.slice(0, 5), a.slice(5, CHUNK_BYTES + 3), a.slice(CHUNK_BYTES + 3, CHUNK_BYTES * 2 + 100), a.slice(CHUNK_BYTES * 2 + 100)];
    await writeSave('p', parts, { id: 'p' });
    await same(await readSaveBlob('p'), a);
    expect(chunksOf('p')).toBe(3);
    expect(db.m.get('save:p')).toMatchObject({ v: 2, n: 3, size: a.length });
  });
  it('ulæselig Blob (WebKit NotReadableError) melder fase buffer; de samme data som bidder lykkes', async () => {
    const bad = new Blob([bytes(100)]);
    const nre = Object.assign(new Error('The I/O read operation failed.'), { name: 'NotReadableError' });
    bad.slice = () => ({ arrayBuffer: () => Promise.reject(nre) }) as unknown as Blob;
    const e = await writeSave('g', bad, {}).catch((x) => x);
    expect(e).toMatchObject({ phase: 'buffer' });
    expect(e.message).toMatch(/phase=buffer size=0\.0MB cause=NotReadableError/);
    expect(chunksOf('g')).toBe(0);
    await writeSave('g', [bytes(100)], {});
    await same(await readSaveBlob('g'), bytes(100));
  });
  it('gzip-uddata som bidder pakkes ud til samme tekst og gemmes', async () => {
    const text = JSON.stringify({ x: Array.from({ length: 20000 }, (_, i) => i * 7) });
    const gz = await gzipChunks([text]);
    expect(gz.every((b) => b instanceof Uint8Array)).toBe(true);
    await writeSave('z', gz, {});
    expect(await gunzipText((await readSaveBlob('z'))!)).toBe(text);
  });
  it('oprydning: forældreløse generationer ældre end 10 min slettes, den levende og unge bliver', async () => {
    await writeSave('g', [bytes(CHUNK_BYTES + 1)], { id: 'g' });
    const live = (db.m.get('save:g') as { gen: string }).gen;
    const old = (Date.now() - SWEEP_MIN_AGE_MS - 60_000).toString(36) + 'abcd';
    const young = (Date.now() - 1000).toString(36) + 'wxyz';
    for (let i = 0; i < 3; i++) db.m.set(`savec:g:${old}:${i}`, new ArrayBuffer(8));
    db.m.set(`savec:g:${young}:0`, new ArrayBuffer(8));
    db.m.set(`savec:gone:${old}:0`, new ArrayBuffer(8)); // spillet er slettet, bidden blev
    expect(await saveStoreDiagText()).toBe('saves=1 chunks=7 gens=4 orphans=5/3g liveMB=4');
    const d = await sweepSaveChunks(true);
    expect(d).toMatchObject({ saves: 1, chunks: 7, orphans: 5, swept: 4 });
    const left = [...db.m.keys()].filter((k) => k.startsWith('savec:')).sort();
    expect(left).toEqual([`savec:g:${live}:0`, `savec:g:${live}:1`, `savec:g:${young}:0`].sort());
    await same(await readSaveBlob('g'), bytes(CHUNK_BYTES + 1));
  });
  // Windows/Chrome 24/11: "DataError Failed to write blobs (IOError)" – værdier over 64 KB lægges i en blob-fil, som ikke kunne skrives
  const blobErr = () => Object.assign(new Error('Failed to write blobs (IOError)'), { name: 'DataError' });
  it('blob-fejl: samme gem skrives igen i små bidder (< 64 KB, ingen blob-fil) og læses bit for bit; resten af sessionen små bidder', async () => {
    const a = bytes(CHUNK_BYTES * 2 + 4321, 11);
    await writeSave('g', [a.slice(0, 100)], { v: 1 });
    // en bid > 64 KB kan ikke skrives (som Chrome uden plads til blob-filen); små værdier lykkes
    const origSet = db.m.set.bind(db.m);
    db.m.set = (k: string, v: unknown) => { if (k.startsWith('savec:') && v instanceof ArrayBuffer && v.byteLength > 64 * 1024) throw blobErr(); return origSet(k, v); };
    await writeSave('g', [a.slice(0, 5), a.slice(5)], { v: 2 });
    db.m.set = origSet;
    expect(usingSmallChunks()).toBe(true);
    await same(await readSaveBlob('g'), a);
    expect(db.m.get('meta:g')).toEqual({ v: 2 });
    const man = db.m.get('save:g') as { n: number; cs: number; size: number };
    expect(man).toMatchObject({ cs: SMALL_CHUNK_BYTES, size: a.length, n: Math.ceil(a.length / SMALL_CHUNK_BYTES) });
    expect(chunksOf('g')).toBe(man.n); // ingen halve bidder fra det fejlede forsøg, ingen gamle generationer
    expect([...db.m.values()].every((v) => !(v instanceof ArrayBuffer) || v.byteLength <= SMALL_CHUNK_BYTES)).toBe(true);
    // næste gem går direkte i små bidder
    const b = bytes(SMALL_CHUNK_BYTES * 3 + 1, 4);
    await writeSave('g', [b], {});
    await same(await readSaveBlob('g'), b);
    expect(chunksOf('g')).toBe(4);
  });
  it('fejler også de små bidder: SavePhaseError (lagerproblem), det forrige gem urørt, ingen halve bidder; gamle forældreløse ryddes', async () => {
    const a = bytes(1000, 2);
    await writeSave('g', [a], { v: 1 });
    const old = (Date.now() - SWEEP_MIN_AGE_MS - 60_000).toString(36) + 'abcd';
    db.m.set(`savec:g:${old}:0`, new ArrayBuffer(8));
    db.failOn = (k) => (k.startsWith('savec:') ? blobErr() : undefined);
    const e = await writeSave('g', [bytes(CHUNK_BYTES + 9)], { v: 2 }).catch((x) => x);
    expect(e).toBeInstanceOf(SavePhaseError);
    expect(e.message).toMatch(/phase=chunk#0 size=4\.0MB small cause=DataError Failed to write blobs/);
    expect(isStorageProblem(e)).toBe(true);
    db.failOn = null;
    await same(await readSaveBlob('g'), a);
    expect(db.m.get('meta:g')).toEqual({ v: 1 });
    expect(chunksOf('g')).toBe(1);
  });
});
