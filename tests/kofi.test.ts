// Ko-fi-webhooken og den offentlige målbar (api/kofi.ts) mod en lille Redis-attrap.
import { beforeAll, describe, expect, it, vi } from 'vitest';

const store = new Map<string, unknown>();
class FakeRedis {
  async set(k: string, v: unknown, o?: { nx?: boolean }) { if (o?.nx && store.has(k)) return null; store.set(k, v); return 'OK'; }
  async get(k: string) { return store.get(k) ?? null; }
  async del(k: string) { store.delete(k); return 1; }
  async incrby(k: string, n: number) { const v = Number(store.get(k) ?? 0) + n; store.set(k, v); return v; }
  async rpush(k: string, ...v: string[]) { const l = (store.get(k) as string[] | undefined) ?? []; l.push(...v); store.set(k, l); return l.length; }
  async ltrim(k: string, a: number, b: number) { const l = (store.get(k) as string[]) ?? []; store.set(k, l.slice(a < 0 ? Math.max(0, l.length + a) : a, b === -1 ? undefined : b + 1)); return 'OK'; }
  async lrange(k: string, a: number, b: number) { return ((store.get(k) as string[]) ?? []).slice(a, b + 1); }
}
vi.mock('@upstash/redis', () => ({ Redis: FakeRedis }));

let api: typeof import('../api/kofi');
const TOKEN = 'test-verify-token';
const hook = (d: Record<string, unknown>) => api.POST(new Request('http://x/api/kofi', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ data: JSON.stringify(d) }).toString() }));
const base = { verification_token: TOKEN, type: 'Donation', is_public: true, from_name: 'Jane', message: 'Keep going!', amount: '5.00', currency: 'EUR', email: 'jane@example.com' };

beforeAll(async () => { process.env.KOFI_VERIFY_TOKEN = TOKEN; api = await import('../api/kofi'); });

describe('Ko-fi', () => {
  it('forkert eller manglende token afvises og gemmer intet', async () => {
    expect((await hook({ ...base, verification_token: 'forkert', kofi_transaction_id: 'bad1' })).status).toBe(401);
    expect((await hook({ ...base, verification_token: undefined, kofi_transaction_id: 'bad2' })).status).toBe(401);
    expect((await (await api.GET()).json()).raised).toBe(0);
  });

  it('gyldig donation gemmes; e-mail lækker aldrig; idempotent på transaktions-id', async () => {
    expect((await hook({ ...base, kofi_transaction_id: 't1' })).status).toBe(200);
    const again = await hook({ ...base, kofi_transaction_id: 't1' });
    expect((await again.json()).duplicate).toBe(true);
    const r = await api.GET();
    expect(r.headers.get('cache-control')).toContain('s-maxage=60');
    const j = await r.json();
    expect(j).toMatchObject({ goal: 150, raised: 5, percent: 3, anonymous: 0 });
    expect(j.heroes).toEqual([expect.objectContaining({ name: 'Jane', eur: 5, message: 'Keep going!' })]);
    expect(JSON.stringify(j)).not.toContain('example.com');
  });

  it('is_public=false tæller beløbet men vises som anonym (ingen navn/besked)', async () => {
    await hook({ ...base, is_public: false, from_name: 'Hemmelig Hans', message: 'privat', amount: '10', kofi_transaction_id: 't2' });
    const j = await (await api.GET()).json();
    expect(j.raised).toBe(15);
    expect(j.anonymous).toBe(1);
    expect(JSON.stringify(j)).not.toMatch(/Hemmelig|privat/);
  });

  it('andre valutaer omregnes groft; samme navn samles; nyeste først', async () => {
    await hook({ ...base, from_name: 'Jane', message: '', amount: '100', currency: 'DKK', kofi_transaction_id: 't3' });
    await hook({ ...base, from_name: 'Olaf', message: 'Hej', amount: '3', currency: 'EUR', kofi_transaction_id: 't4' });
    const j = await (await api.GET()).json();
    expect(j.raised).toBeCloseTo(15 + 13.4 + 3, 2);
    expect(j.heroes.map((h: { name: string }) => h.name)).toEqual(['Olaf', 'Jane']);
    expect(j.heroes[1].eur).toBeCloseTo(18.4, 2);
    expect(api.toEurCents('5', 'XYZ')).toBe(0);
  });

  it('ugyldigt indhold giver 400', async () => {
    const r = await api.POST(new Request('http://x/api/kofi', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'data=ikke-json' }));
    expect(r.status).toBe(400);
  });
});
