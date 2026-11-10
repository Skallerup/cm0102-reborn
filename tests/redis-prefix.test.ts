// Staging deler database med produktionen – alle nøgler skal have præfikset "stg:", og intet må ramme rigtige nøgler.
import { describe, expect, it } from 'vitest';
import type { Redis } from '@upstash/redis';
import { withPrefix } from '../api/_lib/redis';

function fake() {
  const calls: [string, unknown[]][] = [];
  const handler = (name: string) => async (...args: unknown[]) => {
    calls.push([name, args]);
    if (name === 'scan') return [0, ['stg:room:ABCDE', 'stg:room:FGHIJ']];
    return 'ok';
  };
  const target = new Proxy({}, { get: (_t, prop) => handler(String(prop)) }) as unknown as Redis;
  return { r: withPrefix(target, 'stg:'), calls };
}

describe('Redis-præfiks på staging', () => {
  it('sætter præfiks på den første nøgle', async () => {
    const { r, calls } = fake();
    await r.hset('prof:abc', { name: 'x' });
    await r.zadd('lb:career', { score: 1, member: 'c1' });
    await r.get('sess:1');
    expect(calls.map(([, a]) => a[0])).toEqual(['stg:prof:abc', 'stg:lb:career', 'stg:sess:1']);
    // værdier og medlemmer røres ikke
    expect(calls[1][1][1]).toEqual({ score: 1, member: 'c1' });
  });
  it('del/exists: alle nøgler får præfiks', async () => {
    const { r, calls } = fake();
    await r.del('a', 'b', 'c');
    expect(calls[0][1]).toEqual(['stg:a', 'stg:b', 'stg:c']);
  });
  it('zunionstore: destination og kilder', async () => {
    const { r, calls } = fake();
    await r.zunionstore('sg:trend:tmp', 2, ['sg:d:1', 'sg:d:2']);
    expect(calls[0][1]).toEqual(['stg:sg:trend:tmp', 2, ['stg:sg:d:1', 'stg:sg:d:2']]);
  });
  it('scan: mønsteret får præfiks, og svaret uden præfiks', async () => {
    const { r, calls } = fake();
    const [, keys] = (await r.scan(0, { match: 'room:?????', count: 500 })) as [number, string[]];
    expect(calls[0][1]).toEqual([0, { match: 'stg:room:?????', count: 500 }]);
    expect(keys).toEqual(['room:ABCDE', 'room:FGHIJ']);
  });
  it('produktion (intet præfiks) bruger klienten uændret', () => {
    const plain = {} as Redis;
    expect(withPrefix(plain, '')).toBe(plain);
  });
});
