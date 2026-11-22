import { describe, expect, it, vi, beforeEach } from 'vitest';
const h = vi.hoisted(() => {
  const m = new Map<string, string>();
  const reload = vi.fn();
  (globalThis as any).sessionStorage = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), clear: () => m.clear() };
  const replace = vi.fn();
  (globalThis as any).location = { reload, replace, href: 'https://x.test/?fbclid=1' };
  (globalThis as any).window ??= { addEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
  return { reload, replace };
});
import { lazyRetry, reloadOnce, resetReloadingForTest } from '../src/ui/lazyLoad';

// React.lazy gemmer fabrikken i _payload._result; kald den direkte
const run = (c: any) => c._payload._result() as Promise<{ default: unknown }>;
const settled = (p: Promise<unknown>) => Promise.race([p.then(() => 'done'), new Promise((r) => setTimeout(() => r('pending'), 20))]);

describe('lazyRetry', () => {
  beforeEach(() => { (globalThis as any).sessionStorage.clear(); h.reload.mockClear(); h.replace.mockClear(); resetReloadingForTest(); });
  it('gyldigt modul går uændret igennem', async () => {
    const C = () => null;
    expect((await run(lazyRetry(() => Promise.resolve({ default: C })))).default).toBe(C);
    expect(h.replace).not.toHaveBeenCalled();
  });
  it('undefined: genindlæser én gang og venter', async () => {
    expect(await settled(run(lazyRetry(() => Promise.resolve(undefined))))).toBe('pending');
    await new Promise((r) => setTimeout(r, 30));
    expect(String(h.replace.mock.calls[0]?.[0])).toMatch(/_r=\d+/);
    expect(h.replace).toHaveBeenCalledTimes(1);
  });
  it('afvist import: genindlæser én gang; derefter fejlskærm (ingen løkke)', async () => {
    const bad = () => Promise.reject(new Error('Failed to fetch dynamically imported module'));
    expect(await settled(run(lazyRetry(bad)))).toBe('pending');
    expect(h.replace).toHaveBeenCalledTimes(1);
    await new Promise((r) => setTimeout(r, 30));
    resetReloadingForTest();
    const m = await run(lazyRetry(bad));
    expect(typeof m.default).toBe('function');
    expect(h.replace).toHaveBeenCalledTimes(1);
    expect(reloadOnce()).toBe(false);
  });
  it('undefined efter genindlæsning giver fejlskærm', async () => {
    reloadOnce(); resetReloadingForTest();
    const m = await run(lazyRetry(() => Promise.resolve(undefined)));
    expect(typeof m.default).toBe('function');
  });
});
