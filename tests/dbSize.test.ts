// Originalens databasestørrelse (ui/dbSize.ts): Normal på telefoner/indbyggede browsere, Maximum ellers; eget valg huskes; efter en
// NewGameInterrupted bruges Normal næste gang (spilleren skal ikke prøve igen og igen); world-filen pr. størrelse (worldFetch.ts).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, String(v)); }, removeItem: (k: string) => { store.delete(k); } });
});
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

async function load(ua: string, deviceMemory?: number) {
  vi.stubGlobal('navigator', { userAgent: ua, maxTouchPoints: 0, ...(deviceMemory ? { deviceMemory } : {}) });
  vi.resetModules();
  return import('../src/ui/dbSize');
}
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/490.0]';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15';

describe('databasestørrelsen', () => {
  it('telefon/indbygget browser: Normal med forklaringen; computer: Maximum', async () => {
    const a = await load(IPHONE);
    expect(a.readDbSize()).toBe('normal');
    expect(a.dbSizeReason()).toBe('device');
    const b = await load(MAC);
    expect(b.readDbSize()).toBe('maximum');
    expect(b.dbSizeReason()).toBeNull();
    const c = await load(MAC, 4);
    expect(c.readDbSize()).toBe('normal');
  });
  it('eget valg huskes – også Maximum på en telefon', async () => {
    const a = await load(IPHONE);
    a.writeDbSize('maximum');
    expect(a.readDbSize()).toBe('maximum');
    expect(a.dbSizeReason()).toBeNull();
  });
  it('efter et afbrudt nyt spil: Normal næste gang, med grunden', async () => {
    const a = await load(MAC);
    a.writeDbSize('maximum');
    a.dbSizeAfterInterrupt();
    expect(a.readDbSize()).toBe('normal');
    expect(a.dbSizeReason()).toBe('interrupted');
  });
  it('world-filen pr. størrelse: Normal kun for 3.9.60', async () => {
    const { originalFile } = await import('../src/ui/worldFetch');
    expect(originalFile('3.9.60', 'normal')).toBe('world-original-normal.json');
    expect(originalFile('3.9.60', 'maximum')).toBe('world-original.json');
    expect(originalFile('3.9.68', 'normal')).toBe('world-original-3968.json');
  });
  it('startforløbets lister (slimWorld) har lande, ligaer, klubber og spillernes nationaliteter', async () => {
    const { slimWorld } = await import('../src/ui/worldFetch');
    const w = { kind: 'cm0102', source: 's', season: 2001, nations: [{ name: 'A', code: 'A' }], leagues: [], clubs: [[1, 'C', 'C', 0, 'L', '', 0, '']],
      playerFields: ['id', 'nation', 'x'], players: [[1, 0, 9], [2, 3, 9], [3, 0, 9]], names: { 0: [['a'], ['b']] }, ratings: { 1: {} } };
    const s = slimWorld(w as never) as unknown as Record<string, unknown>;
    expect(s.players).toEqual([[0], [3]]);
    expect(s.playerFields).toEqual(['nation']);
    expect(s.clubs).toBe(w.clubs);
    expect(s.ratings).toBeUndefined();
  });
});
