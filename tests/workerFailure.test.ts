import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMemoryText, portsNeedSender, workerFailure } from '../src/ui/startGame';

// "NewGameWorkerFailed: worker" (24/11): onerror uden besked – diagnosen skal sige, hvilket trin, og om arbejderens fil findes (404 = ældre udgivelse)
describe('workerFailure', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('arbejderens fil findes ikke længere → stale', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 404 })));
    const r = await workerFailure({ type: 'error', filename: 'https://x/assets/newGameWorker-old.js' } as unknown as Event, '2/3 [fitness] after 6 s, step fitness 17%');
    expect(r.stale).toBe(true);
    expect(r.text).toContain('worker: 2/3 [fitness] after 6 s, step fitness 17%');
    expect(r.text).toContain('no message');
    expect(r.text).toContain('script 404 (stale build)');
  });

  it('uden fil: udgivelsen ukendt (intet document i node) – ingen stale', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => '' })));
    const r = await workerFailure({ type: 'error' } as Event, '1/3 [base] after 0 s, step none 0%');
    expect(r.stale).toBe(false);
    expect(r.text).toContain('build ?');
  });

  it('fejl med besked og fil', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 200 })));
    const r = await workerFailure({ type: 'error', message: 'Uncaught RangeError: Array buffer allocation failed', filename: 'https://x/assets/newGameWorker-abc.js', lineno: 3, colno: 9 } as unknown as Event, '1/3 [base]');
    expect(r.stale).toBe(false);
    expect(r.text).toContain('"Uncaught RangeError: Array buffer allocation failed"');
    expect(r.text).toContain('at newGameWorker-abc.js:3:9');
    expect(r.text).toContain('script 200');
  });

  // (25/11) arbejderen døde uden besked efter 221 s: et nedbrud, ikke en gammel udgivelse (en 404 bagefter skyldes en udgivelse i mellemtiden)
  it('død uden besked efter lang tid: ikke stale, og hukommelse ved mem ≤ 2', async () => {
    const f = vi.fn(async () => ({ status: 404, text: async () => '<script type="module" src="/assets/new.js"></script>' }));
    vi.stubGlobal('fetch', f);
    vi.stubGlobal('navigator', { deviceMemory: 2, onLine: true });
    const r = await workerFailure({ type: 'error' } as Event, '3/15 [plan] after 221 s, step fitness 36%', 221000);
    expect(r.died).toBe(true);
    expect(r.stale).toBe(false);
    expect(r.memory).toBe(true);
    expect(r.text).toContain('worker died:');
    expect(r.text).not.toContain('stale build');
    expect(f).not.toHaveBeenCalled();
  });

  it('død uden besked på en enhed med nok hukommelse: ikke hukommelse', async () => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('navigator', { deviceMemory: 8, onLine: true });
    const r = await workerFailure({ type: 'error' } as Event, '3/15', 100000);
    expect(r.died).toBe(true);
    expect(r.memory).toBe(false);
  });

  it('isMemoryText', () => {
    expect(isMemoryText("Failed to execute 'postMessage' on 'MessagePort': Data cannot be cloned, out of memory.")).toBe(true);
    expect(isMemoryText('Uncaught RangeError: Array buffer allocation failed')).toBe(true);
    expect(isMemoryText('worker 2/3: messageerror')).toBe(true);
    expect(isMemoryText('worker: no game')).toBe(false);
  });

  // (27/11) Gecko taber kanalens besked, når afsenderen lukkes før modtageren – kun Firefox (også Android) holder afsenderen i live
  it('portsNeedSender: Firefox ja, Chrome/Safari/Firefox på iOS nej', () => {
    expect(portsNeedSender('Mozilla/5.0 (Android 14; Mobile; rv:160.0) Gecko/160.0 Firefox/160.0')).toBe(true);
    expect(portsNeedSender('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:157.0) Gecko/20100101 Firefox/157.0')).toBe(true);
    expect(portsNeedSender('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36')).toBe(false);
    expect(portsNeedSender('Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1')).toBe(false);
    expect(portsNeedSender('Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/140.0 Mobile/15E148 Safari/605.1.15')).toBe(false);
  });
});
