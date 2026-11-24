// Forslaget om at installere som app (24/11): vises højst én gang pr. enhed (igen tidligst efter 30 dage ved "Ikke nu"),
// aldrig i en installeret app, og kun hvis installation er mulig.
import { describe, expect, it, vi, beforeEach } from 'vitest';
const h = vi.hoisted(() => {
  const ls = new Map<string, string>();
  const st = { standalone: false };
  (globalThis as any).localStorage = { getItem: (k: string) => ls.get(k) ?? null, setItem: (k: string, v: string) => void ls.set(k, v), removeItem: (k: string) => void ls.delete(k) };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) Safari/605.1.15', platform: 'iPhone', maxTouchPoints: 5 } });
  (globalThis as any).window = { matchMedia: () => ({ matches: st.standalone }), addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } };
  return { st, ls };
});
import { markInstallTip, shouldShowInstallTip, INSTALL_TIP_DAYS } from '../src/ui/installTip';

describe('installationsforslag', () => {
  beforeEach(() => { h.st.standalone = false; h.ls.clear(); });
  it('vises første gang, derefter ikke', () => {
    expect(shouldShowInstallTip()).toBe(true);
    markInstallTip('shown');
    expect(shouldShowInstallTip()).toBe(false);
  });
  it('igen efter 30 dage, men aldrig efter "Installér"', () => {
    markInstallTip('shown');
    expect(shouldShowInstallTip(Date.now() + (INSTALL_TIP_DAYS - 1) * 86_400_000)).toBe(false);
    expect(shouldShowInstallTip(Date.now() + (INSTALL_TIP_DAYS + 1) * 86_400_000)).toBe(true);
    markInstallTip('yes');
    expect(shouldShowInstallTip(Date.now() + 400 * 86_400_000)).toBe(false);
  });
  it('aldrig i en installeret app', () => {
    h.st.standalone = true;
    expect(shouldShowInstallTip()).toBe(false);
  });
});
