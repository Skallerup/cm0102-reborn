import { afterEach, describe, expect, it, vi } from 'vitest';
import { workerFailure } from '../src/ui/startGame';

// "NewGameWorkerFailed: worker" (24/11): onerror uden besked – diagnosen skal sige, hvilket trin, og om arbejderens fil findes (404 = ældre udgivelse)
describe('workerFailure', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('arbejderens fil findes ikke længere → stale', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 404 })));
    const r = await workerFailure({ type: 'error' } as Event, '2/3 [fitness] after 6 s, step fitness 17%');
    expect(r.stale).toBe(true);
    expect(r.text).toContain('worker: 2/3 [fitness] after 6 s, step fitness 17%');
    expect(r.text).toContain('no message');
    expect(r.text).toContain('script 404 (stale build)');
  });

  it('fejl med besked og fil', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 200 })));
    const r = await workerFailure({ type: 'error', message: 'Uncaught RangeError: Array buffer allocation failed', filename: 'https://x/assets/newGameWorker-abc.js', lineno: 3, colno: 9 } as unknown as Event, '1/3 [base]');
    expect(r.stale).toBe(false);
    expect(r.text).toContain('"Uncaught RangeError: Array buffer allocation failed"');
    expect(r.text).toContain('at newGameWorker-abc.js:3:9');
    expect(r.text).toContain('script 200');
  });
});
