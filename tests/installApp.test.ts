// installApp: to hurtige klik / appinstalled midt i prompten må ikke give "Cannot read properties of null (reading 'userChoice')".
import { describe, expect, it, vi } from 'vitest';
const h = vi.hoisted(() => {
  const l: Record<string, (e: any) => void> = {};
  (globalThis as any).window = { addEventListener: (n: string, f: (e: any) => void) => { l[n] = f; }, removeEventListener() {} };
  return { l };
});
import { canInstall, installApp } from '../src/ui/notify';

describe('installApp', () => {
  it('to hurtige klik og appinstalled under prompten giver ingen fejl', async () => {
    let resolve!: (v: { outcome: string }) => void;
    const ev = { preventDefault() {}, prompt: vi.fn(async () => {}), userChoice: new Promise<{ outcome: string }>((r) => { resolve = r; }) };
    h.l.beforeinstallprompt(ev);
    expect(canInstall()).toBe(true);
    const a = installApp();
    const b = installApp();
    h.l.appinstalled({});
    resolve({ outcome: 'accepted' });
    expect(await a).toBe(true);
    expect(await b).toBe(false);
    expect(ev.prompt).toHaveBeenCalledTimes(1);
    expect(canInstall()).toBe(false);
    expect(await installApp()).toBe(false);
  });
});
