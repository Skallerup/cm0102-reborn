// Fuld disk (QuotaExceededError i IndexedDB): gemning kaster StorageFullError, viser beskeden højst én gang, spillet går ikke ned.
import { describe, expect, it, vi, beforeEach } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }; });
const notice = vi.hoisted(() => vi.fn(async () => {}));
vi.mock('../src/ui/confirm', () => ({ askNotice: notice }));
vi.mock('../src/online/errors', () => ({ reportError: vi.fn() }));
import { guardWrite, isQuotaError, resetStorageGuard, StorageFullError } from '../src/game/storageGuard';
import { reportError } from '../src/online/errors';

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
