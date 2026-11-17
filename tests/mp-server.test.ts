// Online multiplayer (api/mp.ts): hvem trækket venter på. Regressionstest for dødvandet i rum ZKH84 (17/11):
// en gæst, der havde tilmeldt sig, men endnu ikke var med i øjebliksbilledet, skulle trykke Klar – i den klassiske lobby uden Klar-knap.
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@upstash/redis', () => import('../scripts/mp-test/fakeRedis.mjs'));
vi.mock('@vercel/blob', () => ({ del: async () => {} }));
vi.mock('@vercel/blob/client', () => ({ handleUpload: async () => ({}) }));

let api: typeof import('../api/mp');
const post = async (op: string, body: Record<string, unknown>) => {
  const r = await api.POST(new Request(`http://x/api/mp?op=${op}`, { method: 'POST', body: JSON.stringify(body) }));
  return { status: r.status, body: await r.json() };
};
const room = async (code: string) => (await api.GET(new Request(`http://x/api/mp?code=${code}`))).json();
const url = (v: number) => `https://x.public.blob.vercel-storage.com/rooms/v${v}.gz`;
beforeAll(async () => { api = await import('../api/mp'); });

describe('online multiplayer (server)', () => {
  it('en ny gæst blokerer ikke trækket, før den er med i spillet', async () => {
    const h = (await post('create', { name: 'Host', club: 3826, settings: {} })).body;
    const A = { code: h.code, pid: h.pid, token: h.token };
    expect((await post('commit', { ...A, version: 1, url: url(1), lastApplied: 0, date: '2026-07-01', humans: [h.pid] })).status).toBe(200);
    const g = (await post('join', { code: h.code, name: 'Guest', club: 1920, nation: 53 })).body;
    const B = { code: h.code, pid: g.pid, token: g.token };
    let r = await room(h.code);
    expect(r.players.find((p: { pid: string }) => p.pid === g.pid).pending).toBe(true);
    expect(r.players.find((p: { pid: string }) => p.pid === h.pid).pending).toBe(false);
    // værten alene er klar → låsen kan tages (før: 'not-ready', fordi gæsten aldrig kunne trykke)
    await post('ready', { ...A, ready: true });
    const lock = await post('lock', { ...A, version: 1 });
    expect(lock.body.ok).toBe(true);
    expect(lock.body.actions.map((x: { a: { t: string } }) => x.a.t)).toContain('join');
    r = (await post('commit', { ...A, version: 2, url: url(2), lastApplied: lock.body.actions.length, date: '2026-07-05', humans: [h.pid, g.pid] })).body;
    expect(r.players.every((p: { pending: boolean; ready: boolean }) => !p.pending && !p.ready)).toBe(true);
    // nu er gæsten med og skal trykke Klar
    await post('ready', { ...A, ready: true });
    expect((await post('lock', { ...A, version: 2 })).body.error).toBe('not-ready');
    // at læse en besked gør ikke en manager "ikke klar" igen; en rigtig ændring gør
    await post('ready', { ...B, ready: true });
    await post('actions', { ...B, actions: [{ t: 'read', ids: [3] }] });
    expect((await room(h.code)).players.every((p: { ready: boolean }) => p.ready)).toBe(true);
    await post('actions', { ...B, actions: [{ t: 'tactic', tac: {} }] });
    expect((await room(h.code)).players.find((p: { pid: string }) => p.pid === g.pid).ready).toBe(false);
  });

  it('Tving igennem gør kun managere i spillet klar; en mislykket tilmelding forbliver "kommer med" og blokerer ikke', async () => {
    const h = (await post('create', { name: 'Host', club: 1, settings: {} })).body;
    const A = { code: h.code, pid: h.pid, token: h.token };
    await post('commit', { ...A, version: 1, url: url(1), lastApplied: 0, date: '2026-07-01', humans: [h.pid] });
    const g = (await post('join', { code: h.code, name: 'Late', club: 2, nation: 1 })).body;
    const r = (await post('force', { ...A })).body;
    expect(r.players.find((p: { pid: string }) => p.pid === g.pid).ready).toBe(false);
    expect(r.players.find((p: { pid: string }) => p.pid === h.pid).ready).toBe(true);
    const lock = await post('lock', { ...A, version: 1 });
    // trækket afspillede ikke gæstens tilmelding (fx klubben var taget) → ikke med i humans
    await post('commit', { ...A, version: 2, url: url(2), lastApplied: lock.body.actions.length, date: '2026-07-02', humans: [h.pid] });
    await post('ready', { ...A, ready: true });
    expect((await post('lock', { ...A, version: 2 })).body.ok).toBe(true);
  });
});
