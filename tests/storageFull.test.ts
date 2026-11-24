// Fuld disk (QuotaExceededError i IndexedDB): gemning kaster StorageFullError, viser beskeden højst én gang, spillet går ikke ned.
import { describe, expect, it, vi, beforeEach } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }; });
const notice = vi.hoisted(() => vi.fn(async () => {}));
const confirm = vi.hoisted(() => vi.fn(async () => true));
vi.mock('../src/ui/confirm', () => ({ askNotice: notice, askConfirm: confirm }));
vi.mock('../src/game/saveStore', () => ({ saveStoreDiagText: async () => 'saves=1', usingSmallChunks: () => true }));
vi.mock('../src/online/errors', () => ({ reportError: vi.fn() }));
import { describeStorageError, guardWrite, isBlobWriteError, isQuotaError, isStorageProblem, resetStorageGuard, retry, StorageFullError } from '../src/game/storageGuard';
import { reportError } from '../src/online/errors';

retry.delayMs = 0;
const quota = () => Object.assign(new Error('QuotaExceededError: Encountered full disk while opening backing store for indexedDB.open.'), { name: 'QuotaExceededError' });

describe('fuld disk', () => {
  beforeEach(() => { resetStorageGuard(); notice.mockClear(); vi.mocked(reportError).mockClear(); });
  it('genkender kvotefejl, ikke andre', () => {
    expect(isQuotaError(quota())).toBe(true);
    expect(isQuotaError(Object.assign(new Error('x'), { name: 'NS_ERROR_DOM_QUOTA_REACHED' }))).toBe(true);
    expect(isQuotaError(new Error('boom'))).toBe(false);
  });
  it('autosave: én besked og én melding, indtil et gem lykkes', async () => {
    for (let i = 0; i < 3; i++) await expect(guardWrite(async () => { throw quota(); })).rejects.toBeInstanceOf(StorageFullError);
    expect(notice).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledTimes(1);
    await guardWrite(async () => 1);
    await expect(guardWrite(async () => { throw quota(); })).rejects.toBeInstanceOf(StorageFullError);
    expect(notice).toHaveBeenCalledTimes(2);
    expect(reportError).toHaveBeenCalledTimes(1);
  });
  it('manuelt gem viser altid beskeden; andre fejl kastes uændret', async () => {
    await expect(guardWrite(async () => { throw quota(); }, true)).rejects.toThrow();
    await expect(guardWrite(async () => { throw quota(); }, true)).rejects.toThrow();
    expect(notice).toHaveBeenCalledTimes(2);
    await expect(guardWrite(async () => { throw new Error('boom'); })).rejects.toThrow('boom');
  });
});

describe('gemning fejler af anden grund (ikke kvote)', () => {
  beforeEach(() => { resetStorageGuard(); notice.mockClear(); vi.mocked(reportError).mockClear(); });
  it('kaster uændret, melder SaveFailed med diagnose én gang og viser besked én gang', async () => {
    for (let i = 0; i < 3; i++) await expect(guardWrite(async () => { throw Object.assign(new Error('db closed'), { name: 'InvalidStateError' }); })).rejects.toThrow('db closed');
    expect(notice).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(reportError).mock.calls[0][0])).toMatch(/SaveFailed: InvalidStateError db closed/);
  });
});

describe('afbrudt transaktion (iOS/WebKit: fejlen er null)', () => {
  beforeEach(() => { resetStorageGuard(); notice.mockClear(); vi.mocked(reportError).mockClear(); });
  it('et genforsøg efter en afbrudt skrivning lykkes uden besked eller melding', async () => {
    let n = 0;
    const r = await guardWrite(async () => { if (n++ === 0) throw null; return 'ok'; });
    expect(r).toBe('ok');
    expect(n).toBe(2);
    expect(notice).not.toHaveBeenCalled();
    expect(reportError).not.toHaveBeenCalled();
  });
  it('fejler genforsøget også: besked + melding med årsag (ikke bare "null")', async () => {
    await expect(guardWrite(async () => { throw null; })).rejects.toBeNull();
    expect(notice).toHaveBeenCalledTimes(1);
    const msg = String(vi.mocked(reportError).mock.calls[0][0]);
    expect(msg).toMatch(/SaveFailed: null \(aborted, no cause/);
    expect(msg).toMatch(/first: null/);
  });
  it('kvotefejl i genforsøget behandles som fuld disk', async () => {
    let n = 0;
    await expect(guardWrite(async () => { if (n++ === 0) throw null; throw quota(); })).rejects.toBeInstanceOf(StorageFullError);
  });
  it('describeStorageError', () => {
    expect(describeStorageError(new DOMException('x', 'AbortError'))).toMatch(/^AbortError/);
    expect(describeStorageError('streng')).toMatch(/string streng/);
  });
});

describe('Chrome kan ikke skrive blob-filen (Windows 24/11: DataError Failed to write blobs (IOError))', () => {
  const blobErr = () => Object.assign(new Error('Failed to write blobs (IOError)'), { name: 'DataError' });
  // saveStore pakker fejlen i SavePhaseError (name + cause)
  const phaseErr = () => Object.assign(new Error('phase=chunk#2 size=17.8MB small cause=DataError Failed to write blobs (IOError)'), { name: 'SavePhaseError', cause: blobErr() });
  beforeEach(() => { resetStorageGuard(); notice.mockClear(); confirm.mockClear(); vi.mocked(reportError).mockClear(); });
  it('genkendes som lagerproblem (også pakket); andre fejl ikke', () => {
    expect(isBlobWriteError(blobErr())).toBe(true);
    expect(isBlobWriteError(phaseErr())).toBe(true);
    expect(isStorageProblem(phaseErr())).toBe(true);
    expect(isStorageProblem(quota())).toBe(true);
    expect(isStorageProblem(Object.assign(new Error('The I/O read operation failed.'), { name: 'NotReadableError' }))).toBe(false);
    expect(isStorageProblem(null)).toBe(false);
    expect(isStorageProblem(new Error('db closed'))).toBe(false);
  });
  it('StorageFullError uden genforsøg; én melding (SaveFailed med diagnose) og én besked pr. session; skyen hver gang, Eksport ved klik', async () => {
    const cloud = vi.fn(() => true), download = vi.fn();
    let n = 0;
    for (let i = 0; i < 3; i++) await expect(guardWrite(async () => { n++; throw phaseErr(); }, false, { cloud, download })).rejects.toBeInstanceOf(StorageFullError);
    expect(n).toBe(3);
    expect(cloud).toHaveBeenCalledTimes(3);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(String((confirm.mock.calls[0] as unknown[])[0])).toMatch(/Cannot save/);
    expect(String((confirm.mock.calls[0] as unknown[])[0])).toMatch(/cloud save/);
    expect(download).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(reportError).mock.calls[0][0])).toMatch(/SaveFailed: SavePhaseError .*Failed to write blobs.* \| .*small=true.* saves=1/);
    // manuelt gem viser beskeden igen; ikke logget ind = ingen sky-linje; Luk = ingen download
    confirm.mockResolvedValueOnce(false);
    await expect(guardWrite(async () => { throw blobErr(); }, true, { cloud: () => false, download })).rejects.toBeInstanceOf(StorageFullError);
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(String((confirm.mock.calls[1] as unknown[])[0])).not.toMatch(/cloud save/);
    expect(download).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledTimes(1);
  });
  it('anden gemmefejl med nødgem: Eksport tilbydes også', async () => {
    const download = vi.fn();
    await expect(guardWrite(async () => { throw new Error('db closed'); }, false, { cloud: () => false, download })).rejects.toThrow('db closed');
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(download).toHaveBeenCalledTimes(1);
  });
});
