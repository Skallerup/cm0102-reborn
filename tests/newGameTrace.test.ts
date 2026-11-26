// Markøren for nyt spil: spor, NewGameInterrupted mod NewGameAbandoned (pagehide).
import { describe, expect, it, vi, beforeEach } from 'vitest';
const h = vi.hoisted(() => {
  const ls = new Map<string, string>();
  const ev = new Map<string, ((e: any) => void)[]>();
  const add = (n: string, f: (e: any) => void) => ev.set(n, [...(ev.get(n) ?? []), f]);
  const rm = (n: string, f: (e: any) => void) => ev.set(n, (ev.get(n) ?? []).filter((x) => x !== f));
  (globalThis as any).localStorage = { getItem: (k: string) => ls.get(k) ?? null, setItem: (k: string, v: string) => void ls.set(k, v), removeItem: (k: string) => void ls.delete(k) };
  (globalThis as any).document = { visibilityState: 'visible', addEventListener: add, removeEventListener: rm };
  (globalThis as any).window = { dispatchEvent: (e: any) => (ev.get(e.type) ?? []).forEach((f) => f(e)), addEventListener: add, removeEventListener: rm, matchMedia: () => ({ matches: false }) };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: 'Mozilla/5.0 (Linux; Android 13)', deviceMemory: 4, hardwareConcurrency: 8 } });
  const fire = (n: string, e: any = {}) => (ev.get(n) ?? []).forEach((f) => f(e));
  return { ls, ev, fire };
});
import { allowSelfReload, creatingNewGame, markNewGame, noteNewGameStep, readInterrupted } from '../src/online/newGameTrace';

describe('newGameTrace', () => {
  beforeEach(() => { for (let i = 0; i < 4; i++) markNewGame(false); h.ls.clear(); (globalThis as any).document.visibilityState = 'visible'; });
  it('en afbrudt forhåndsvisnings slut efter den nyes start sletter ikke markøren (26/11)', () => {
    markNewGame(true, '', 'preview'); markNewGame(true, '', 'preview'); markNewGame(false);
    expect(creatingNewGame()).toBe(true);
    markNewGame(false);
    expect(creatingNewGame()).toBe(false);
  });
  it('cm-creating meldes ved start og slut (opdaterings-toasten skjules under oprettelsen)', () => {
    const seen: boolean[] = [];
    const f = () => seen.push(creatingNewGame());
    (globalThis as any).window.addEventListener('cm-creating', f);
    markNewGame(true, 'normal'); markNewGame(false);
    (globalThis as any).window.removeEventListener('cm-creating', f);
    expect(seen).toEqual([true, false]);
  });
  it('ingen markør: ingen afbrydelse', () => { expect(readInterrupted()).toBeNull(); });
  it('færdigt spil rydder markør, spor og lyttere', () => {
    markNewGame(true, 'normal'); markNewGame(false);
    expect(h.ls.size).toBe(0);
    expect([...h.ev.values()].flat().length).toBe(0);
  });
  it('dræbt uden pagehide: Interrupted med trin, skjult og hukommelse', () => {
    markNewGame(true, 'normal');
    noteNewGameStep('world', 0.1); noteNewGameStep('shortlists', 0.25);
    (globalThis as any).document.visibilityState = 'hidden'; h.fire('visibilitychange');
    const r = readInterrupted(Date.now() + 30_000)!;
    expect(r.abandoned).toBe(false);
    expect(r.text).toMatch(/^NewGameInterrupted: the page was reloaded 3\d s into creating a new game \(database normal, step shortlists 25%/);
    expect(r.text).toContain('hidden 1x');
    expect(r.text).toContain('pagehide no');
    expect(r.text).toContain('mem 4');
    expect(h.ls.size).toBe(0);
  });
  it('pagehide kørte: Abandoned', () => {
    markNewGame(true, 'maximum');
    noteNewGameStep('world', 0.1);
    h.fire('pagehide', { persisted: false });
    const r = readInterrupted(Date.now() + 5_000)!;
    expect(r.abandoned).toBe(true);
    expect(r.text).toMatch(/^NewGameAbandoned: the page was left/);
    expect(r.text).toContain('pagehide yes');
  });
  it('markør uden spor (gammel version) og for gammel markør', () => {
    h.ls.set('cm0102.creating', String(Date.now() - 40_000));
    expect(readInterrupted(Date.now(), 'normal')!.text).toContain('no trace');
    h.ls.set('cm0102.creating', String(Date.now() - 20 * 60_000));
    expect(readInterrupted()).toBeNull();
  });
  it('egen genindlæsning: spærres automatisk under oprettelsen, spillerens tilladt – begge i meldingen', () => {
    expect(allowSelfReload('preloadError')).toBe(true); // intet nyt spil i gang
    markNewGame(true, 'maximum', 'preview');
    expect(creatingNewGame()).toBe(true);
    expect(allowSelfReload('preloadError')).toBe(false);
    expect(allowSelfReload('updateToast', true)).toBe(true);
    noteNewGameStep('done', 0.97); noteNewGameStep('pack', 0.98);
    const r = readInterrupted(Date.now() + 12_000)!;
    expect(r.text).toContain('select-team world');
    expect(r.text).toContain('selfReload preloadError blocked + updateToast');
    expect(r.text).toContain('pack');
    markNewGame(false);
    expect(creatingNewGame()).toBe(false);
  });
});
