import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runPhases, SilenceGuard, WORKER_SILENT_MS } from '../src/ui/startGame';
import { beat, beatSent, BEAT_MS, setBeat } from '../src/game/beat';
import type { NewGameMsg } from '../src/ui/newGameWorker';

// (27/11, "worker died: no message for 125 s, 15/15 [shortlists:11/12 rest] after 4030 s, step done 97%") vagten i startGame.ts runPhases: en
// langsom arbejder med hjerteslag må aldrig fejle; en tavs (død/hængt) arbejder fejler efter grænsen; tid, mens siden er skjult, tæller ikke

describe('SilenceGuard', () => {
  it('tavs synlig tid over grænsen → død; en besked nulstiller', () => {
    let t = 0;
    const g = new SilenceGuard(() => t, () => true);
    for (let k = 0; k < 24; k++) { t += 5000; expect(g.check()).toBe(false); }
    g.heard();
    for (let k = 0; k < 24; k++) { t += 5000; expect(g.check()).toBe(false); }
    t += 5000;
    expect(g.check()).toBe(true);
  });
  it('skjult side og frosne timere (> 15 s mellem slagene) tæller ikke', () => {
    let t = 0, vis = false;
    const g = new SilenceGuard(() => t, () => vis);
    for (let k = 0; k < 1000; k++) { t += 5000; expect(g.check()).toBe(false); }
    vis = true;
    t += 3600_000; expect(g.check()).toBe(false);
    expect(g.quiet).toBe(0);
  });
  it('grænsen følger maskinens hastighed: en fjerdedel af den synlige tid før tavsheden', () => {
    let t = 0;
    const g = new SilenceGuard(() => t, () => true);
    // 4000 s spilstart med beskeder hvert 5. s (som den langsomme pc)
    for (let k = 0; k < 800; k++) { t += 5000; g.check(); g.heard(); }
    expect(g.limit()).toBe(1000_000);
    for (let k = 0; k < 199; k++) { t += 5000; expect(g.check()).toBe(false); }
    t += 5000; t += 1; expect(g.check()).toBe(true);
    expect(new SilenceGuard(() => 0, () => true).limit()).toBe(WORKER_SILENT_MS);
  });
});

describe('beat', () => {
  afterEach(() => { setBeat(null); vi.useRealTimers(); });
  it('højst ét slag pr. BEAT_MS; en sendt besked udskyder næste slag; uden modtager intet', () => {
    vi.useFakeTimers();
    let n = 0;
    beat();
    setBeat(() => n++);
    beat(); beat();
    expect(n).toBe(1);
    vi.advanceTimersByTime(BEAT_MS - 1); beat(); expect(n).toBe(1);
    vi.advanceTimersByTime(1); beat(); expect(n).toBe(2);
    vi.advanceTimersByTime(BEAT_MS - 10); beatSent();
    vi.advanceTimersByTime(10); beat(); expect(n).toBe(2);
  });
});

/** en falsk arbejder: `script` skriver beskederne (tidspunkt i ms efter jobbet → besked) */
class FakeWorker {
  onmessage: ((e: MessageEvent<NewGameMsg>) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  dead = false;
  constructor(private script: [number, NewGameMsg][]) {}
  postMessage() {
    for (const [at, m] of this.script) setTimeout(() => { if (!this.dead) this.onmessage?.({ data: m } as MessageEvent<NewGameMsg>); }, at);
  }
  terminate() { this.dead = true; }
}
const run = (script: [number, NewGameMsg][]) => {
  const w = new FakeWorker(script);
  let res: 'ok' | Error | null = null;
  runPhases({ opts: {} as never }, [undefined], w as unknown as Worker, () => {}).then(() => { res = 'ok'; }, (e: Error) => { res = e; });
  return { w, get res() { return res; } };
};
const done: NewGameMsg = { type: 'done', gz: new ArrayBuffer(8), saved: null };

describe('runPhases-vagten', () => {
  let vis = 'visible';
  beforeEach(() => { vi.useFakeTimers(); vis = 'visible'; vi.stubGlobal('document', { get visibilityState() { return vis; } }); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("langsom arbejder: 'done' 97 %, så 10 min uden fremdrift, men med hjerteslag hvert 5. s → ingen fejl", async () => {
    const s: [number, NewGameMsg][] = [[1000, { type: 'progress', step: 'done', frac: 0.97 }]];
    for (let t = 6000; t < 601_000; t += 5000) s.push([t, { type: 'beat' }]);
    s.push([602_000, done]);
    const r = run(s);
    await vi.advanceTimersByTimeAsync(605_000);
    expect(r.res).toBe('ok');
  });

  it('arbejderen tier helt (død eller tabt kanalbesked) → fejl efter grænsen', async () => {
    const r = run([[1000, { type: 'progress', step: 'fitness', frac: 0.17 }]]);
    await vi.advanceTimersByTimeAsync(WORKER_SILENT_MS - 5000);
    expect(r.res).toBe(null);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(r.res).toBeInstanceOf(Error);
    expect((r.res as unknown as Error).message).toMatch(/worker died: no message for 12\d s/);
    expect((r.res as unknown as { memory: boolean }).memory).toBe(true);
    expect(r.w.dead).toBe(true);
  });

  it('skjult fane: tavshed tæller ikke; synlig igen → fejl først efter grænsen', async () => {
    const r = run([[1000, { type: 'progress', step: 'shortlists', frac: 0.6 }]]);
    vis = 'hidden';
    await vi.advanceTimersByTimeAsync(3600_000);
    expect(r.res).toBe(null);
    vis = 'visible';
    await vi.advanceTimersByTimeAsync(WORKER_SILENT_MS - 10_000);
    expect(r.res).toBe(null);
    await vi.advanceTimersByTimeAsync(20_000);
    expect(r.res).toBeInstanceOf(Error);
  });
});
