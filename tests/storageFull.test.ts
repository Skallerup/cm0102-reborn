// Fuld disk (QuotaExceededError i IndexedDB): gemning kaster StorageFullError, viser beskeden højst én gang, spillet går ikke ned.
import { describe, expect, it, vi, beforeEach } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }; });
const notice = vi.hoisted(() => vi.fn(async () => {}));
vi.mock('../src/ui/confirm', () => ({ askNotice: notice }));
vi.mock('../src/online/errors', () => ({ reportError: vi.fn() }));
import { describeStorageError, guardWrite, isQuotaError, resetStorageGuard, retry, StorageFullError } from '../src/game/storageGuard';
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
