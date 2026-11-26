import { describe, expect, it, vi } from 'vitest';
import { ConvertTimeoutError, withConvertTimeout } from '../src/ui/startGame';

describe('withConvertTimeout', () => {
  it('afviser med ConvertTimeoutError, når løftet aldrig afgøres', async () => {
    vi.useFakeTimers();
    const p = withConvertTimeout(new Promise<number>(() => {}), 1000);
    const assertion = expect(p).rejects.toBeInstanceOf(ConvertTimeoutError);
    await vi.advanceTimersByTimeAsync(1001);
    await assertion;
    vi.useRealTimers();
  });
  it('giver værdien og fejlen videre, når løftet afgøres i tide', async () => {
    await expect(withConvertTimeout(Promise.resolve(7), 1000)).resolves.toBe(7);
    await expect(withConvertTimeout(Promise.reject(new Error('x')), 1000)).rejects.toThrow('x');
  });
});
