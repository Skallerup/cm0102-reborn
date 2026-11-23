// Gemt spil som bidder af ArrayBuffer (WebKit afbryder Blob-puts uden årsag): rundtur, gammelt Blob-format, afbrudt gem ødelægger ikke det forrige, fasen meldes.
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }; });
const db = vi.hoisted(() => ({ m: new Map<string, unknown>(), failOn: null as null | ((k: string) => unknown) }));
vi.mock('idb-keyval', () => ({
  get: async (k: string) => db.m.get(k),
  set: async (k: string, v: unknown) => { if (db.failOn) { const r = db.failOn(k); if (r !== undefined) throw r; } db.m.set(k, v); },
  del: async (k: string) => { db.m.delete(k); },
  keys: async () => [...db.m.keys()],
  createStore: () => undefined,
}));
import { CHUNK_BYTES, deleteSaveData, readSaveBlob, SavePhaseError, writeSave } from '../src/game/saveStore';

const bytes = (n: number, seed = 1) => { const a = new Uint8Array(n); for (let i = 0; i < n; i++) a[i] = (i * 31 + seed) & 255; return a; };
const same = async (b: Blob | undefined, a: Uint8Array) => { expect(b).toBeTruthy(); expect(new Uint8Array(await b!.arrayBuffer())).toEqual(a); };
const chunksOf = (id: string) => [...db.m.keys()].filter((k) => k.startsWith(`savec:${id}:`)).length;

describe('saveStore', () => {
  beforeEach(() => { db.m.clear(); db.failOn = null; });
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
});
