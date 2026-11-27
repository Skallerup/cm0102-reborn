import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_RESENDS, receiveHandoff, RESEND_MS, serveHandoff, type HandoffCtl } from '../src/ui/handoff';

// (27/11, Android/Chrome 138: "step fitness 17 % at 17 s" i 138 s) overdragelsen mellem to trins arbejdere (ui/newGameWorker.ts): afsenderen
// gensender, når modtageren ligger ledig uden spillet; modtageren tager kun den første besked, kvitterer og fejler efter MAX_RESENDS

type P = { onmessage: ((e: MessageEvent) => void) | null; onmessageerror: ((e: MessageEvent) => void) | null; postMessage: (m: unknown) => void; close: () => void; closed: boolean; sent: unknown[] };
/** to forbundne falske porte; `drop` = antal beskeder fra afsenderen, kanalen taber */
function pair(drop = 0) {
  const mk = (): P => ({ onmessage: null, onmessageerror: null, postMessage: () => {}, close() { this.closed = true; }, closed: false, sent: [] });
  const a = mk(), b = mk();
  let lost = drop;
  a.postMessage = (m) => { a.sent.push(m); if (lost > 0) { lost--; return; } queueMicrotask(() => b.onmessage?.({ data: structuredClone(m) } as MessageEvent)); };
  b.postMessage = (m) => { b.sent.push(m); queueMicrotask(() => a.onmessage?.({ data: m } as MessageEvent)); };
  return { a, b };
}

describe('handoff', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('normal: modtageren får spillet én gang og kvitterer; afsenderen lukker porten', async () => {
    vi.useFakeTimers();
    const { a, b } = pair();
    const got = receiveHandoff<{ x: number }>(b, 'test');
    serveHandoff(a, { x: 7 });
    await vi.advanceTimersByTimeAsync(0);
    expect(await got).toEqual({ x: 7 });
    expect(b.sent).toEqual([{ ctl: 'ack' } satisfies HandoffCtl]);
    expect(a.closed).toBe(true);
    // ingen gensendelse bagefter
    await vi.advanceTimersByTimeAsync(RESEND_MS * 4);
    expect(a.sent.length).toBe(1);
  });

  it('tabt besked: modtageren beder om en gensendelse efter RESEND_MS og får spillet', async () => {
    vi.useFakeTimers();
    const { a, b } = pair(1);
    let res: unknown = null;
    void receiveHandoff<{ x: number }>(b, 'test').then((v) => { res = v; });
    serveHandoff(a, { x: 3 });
    await vi.advanceTimersByTimeAsync(RESEND_MS - 3000);
    expect(res).toBe(null);
    await vi.advanceTimersByTimeAsync(4000);
    expect(res).toEqual({ x: 3 });
    expect(a.sent.length).toBe(2);
    expect(b.sent).toEqual([{ ctl: 'resend', n: 1 }, { ctl: 'ack' }]);
  });

  it('to beskeder kommer frem: kun den første tages', async () => {
    vi.useFakeTimers();
    const { a, b } = pair();
    const got = receiveHandoff<{ x: number }>(b, 'test');
    serveHandoff(a, { x: 1 });
    a.postMessage({ x: 2 });
    await vi.advanceTimersByTimeAsync(0);
    expect(await got).toEqual({ x: 1 });
    expect(b.sent).toEqual([{ ctl: 'ack' }]);
  });

  it('frosset fane (timerslag med lange mellemrum) beder ikke om gensendelse', async () => {
    vi.useFakeTimers();
    const { b } = pair();
    let t = 0;
    void receiveHandoff(b, 'test', { now: () => t });
    for (let k = 0; k < 20; k++) { t += 60_000; await vi.advanceTimersByTimeAsync(2500); }
    expect(b.sent).toEqual([]);
  });

  it('ingen afsender: fejler efter MAX_RESENDS gensendelser i stedet for at vente for evigt', async () => {
    vi.useFakeTimers();
    const { b } = pair();
    let err: Error | null = null;
    void receiveHandoff(b, 'before fitness').catch((e: Error) => { err = e; });
    await vi.advanceTimersByTimeAsync(RESEND_MS * (MAX_RESENDS + 1) + 3000);
    expect(b.sent.length).toBe(MAX_RESENDS);
    expect(err).toBeInstanceOf(Error);
    expect((err as unknown as Error).message).toMatch(/handoff lost: no game before fitness after 2 resends/);
  });

  it('ægte MessageChannel: spillet kommer frem, også når afsenderen har sendt, før modtageren lytter', async () => {
    const ch = new MessageChannel();
    serveHandoff(ch.port1 as never, { g: [1, 2, 3] });
    await new Promise((r) => setTimeout(r, 20));
    const got = await receiveHandoff<{ g: number[] }>(ch.port2 as never, 'test');
    expect(got).toEqual({ g: [1, 2, 3] });
    ch.port1.close(); ch.port2.close();
  });
});

describe('senderMayClose', () => {
  it('iPhone/iPad og mobil ≤ 4 GB/ukendt afslutter afsenderen straks – Gecko, desktop og mobil > 4 GB holder den i live', async () => {
    const { senderMayClose } = await import('../src/ui/startGame');
    expect(senderMayClose('Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1')).toBe(true);
    expect(senderMayClose('Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/140.0 Mobile/15E148 Safari/605.1.15')).toBe(true);
    expect(senderMayClose('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15', 5)).toBe(true);
    const android = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Mobile Safari/537.36';
    // (28/11) lav-hukommelses-Android: ≤ 4 GB eller ukendt → afsenderen afsluttes straks; > 4 GB → den sikre vej
    expect(senderMayClose(android, 5, 4)).toBe(true);
    expect(senderMayClose(android, 5, 2)).toBe(true);
    expect(senderMayClose(android, 5, undefined)).toBe(true);
    expect(senderMayClose(android, 5, 8)).toBe(false);
    expect(senderMayClose('Mozilla/5.0 (Linux; Android 13; SM-S901B Build/TP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/158.0.0.0 Mobile Safari/537.36 [FBAN/EMA;FBLC/da_DK;FBAV/400.0]', 5, 4)).toBe(true);
    // Gecko taber beskeden, når afsenderen afsluttes – aldrig, heller ikke uden deviceMemory
    expect(senderMayClose('Mozilla/5.0 (Android 14; Mobile; rv:160.0) Gecko/160.0 Firefox/160.0', 5, undefined)).toBe(false);
    expect(senderMayClose('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:157.0) Gecko/20100101 Firefox/157.0', 0, undefined)).toBe(false);
    // desktop: den sikre vej, også med lidt hukommelse
    expect(senderMayClose('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', 0, 4)).toBe(false);
    expect(senderMayClose('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', 0, undefined)).toBe(false);
  });
});

// hovedtråden (startGame.ts runPhases): afsenderen afsluttes først, når modtageren har meldt 'received' – i alle browsere
describe('runPhases: afsenderen lever til kvitteringen', () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  it("'handed' → afsenderen lever; 'received' fra den næste → afsenderen afsluttes", async () => {
    vi.useFakeTimers();
    const { runPhases } = await import('../src/ui/startGame');
    const made: Fake[] = [];
    class Fake {
      onmessage: ((e: MessageEvent) => void) | null = null; onerror: unknown = null; onmessageerror: unknown = null;
      dead = false; job: { to?: unknown; from?: unknown } | null = null;
      constructor() { made.push(this); }
      postMessage(job: { to?: unknown; from?: unknown }) { this.job = job; }
      terminate() { this.dead = true; }
      say(m: unknown) { this.onmessage?.({ data: m } as MessageEvent); }
    }
    vi.stubGlobal('Worker', Fake);
    const first = new Fake();
    let ok = false;
    void runPhases({ opts: {} as never }, [['base'], ['fitness']] as never, first as unknown as Worker, () => {}).then(() => { ok = true; });
    expect(first.job?.to).toBeDefined();
    first.say({ type: 'handed' });
    expect(first.dead).toBe(false);
    const next = made[made.length - 1];
    expect(next).not.toBe(first);
    expect(next.job?.from).toBeDefined();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(first.dead).toBe(false);
    next.say({ type: 'received' });
    expect(first.dead).toBe(true);
    next.say({ type: 'done', gz: new ArrayBuffer(4), saved: null });
    await vi.advanceTimersByTimeAsync(0);
    expect(ok).toBe(true);
  });
});
