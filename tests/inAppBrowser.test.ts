// Facebooks indbyggede browser (21/11): Spil må ikke føre tilbage til forsiden, når sessionStorage kaster; det installerede spil springer
// forsiden over; "Installér som app" viser vejledningen med "Åbn i Safari/Chrome".
import { describe, expect, it, vi, beforeEach } from 'vitest';
const h = vi.hoisted(() => {
  const ls = new Map<string, string>();
  const st = { throwing: false, standalone: false };
  const ss = new Map<string, string>();
  const guard = <T>(f: () => T): T => { if (st.throwing) throw new DOMException('denied', 'SecurityError'); return f(); };
  (globalThis as any).sessionStorage = { getItem: (k: string) => guard(() => ss.get(k) ?? null), setItem: (k: string, v: string) => guard(() => void ss.set(k, v)), removeItem: (k: string) => guard(() => void ss.delete(k)) };
  (globalThis as any).localStorage = { getItem: (k: string) => ls.get(k) ?? null, setItem: (k: string, v: string) => void ls.set(k, v), removeItem: (k: string) => void ls.delete(k) };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22B83 [FBAN/FBIOS;FBAV/490.0.0.39.108;]' } });
  const listeners = new Map<string, () => void>();
  (globalThis as any).window = { matchMedia: () => ({ matches: st.standalone }), addEventListener: (n: string, f: () => void) => listeners.set(n, f), removeEventListener() {}, dispatchEvent: (e: Event) => listeners.get(e.type)?.() };
  (globalThis as any).location = { host: 'cm0102reborn.com', pathname: '/', search: '?fbclid=IwZXh0bgNhZW0CMTEAAR2' };
  return { st, ss, ls };
});
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { clearPlay, markPlay, playMarked } from '../src/ui/playFlag';
import { InAppBanner, inAppBrowser } from '../src/ui/InAppBanner';
import { markNewGame } from '../src/online/errors';

describe('indbygget browser (Facebook)', () => {
  beforeEach(() => { h.st.throwing = false; h.st.standalone = false; h.ss.clear(); clearPlay(); });
  it('Spil huskes, selv når sessionStorage kaster (før: forsiden igen)', () => {
    h.st.throwing = true;
    expect(playMarked()).toBe(false);
    markPlay();
    expect(playMarked()).toBe(true);
    clearPlay();
    expect(playMarked()).toBe(false);
  });
  it('Spil gemmes i sessionStorage, når den virker', () => {
    markPlay();
    expect(h.ss.get('cm0102.play')).toBe('1');
  });
  it('det installerede spil (standalone) springer forsiden over', () => {
    h.st.standalone = true;
    expect(playMarked()).toBe(true);
  });
  it('Facebook-UA genkendes, og vejledningen har "Åbn i Safari" (x-safari-https uden fbclid)', () => {
    expect(inAppBrowser()).toBe(true);
    const html = renderToStaticMarkup(createElement(InAppBanner));
    expect(html).toContain('x-safari-https://cm0102reborn.com/');
    expect(html).not.toContain('fbclid');
  });
  it('genindlæsning under nyt spil: markøren sættes og ryddes', () => {
    markNewGame(true);
    expect(Number(h.ls.get('cm0102.creating'))).toBeGreaterThan(0);
    markNewGame(false);
    expect(h.ls.has('cm0102.creating')).toBe(false);
  });
});
