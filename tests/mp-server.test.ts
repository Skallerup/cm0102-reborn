// Online multiplayer (api/mp.ts): hvem trækket venter på. Regressionstest for dødvandet i rum ZKH84 (17/11):
// en gæst, der havde tilmeldt sig, men endnu ikke var med i øjebliksbilledet, skulle trykke Klar – i den klassiske lobby uden Klar-knap.
// Fra protokol 2 (rum CFTG5, 17/11): en gæst er med i spillet straks ved join (klienterne anvender join-handlingen lokalt) og skal selv trykke Klar.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@upstash/redis', () => import('../scripts/mp-test/fakeRedis.mjs'));
vi.mock('@vercel/blob', () => ({ del: async () => {} }));
vi.mock('@vercel/blob/client', () => ({ handleUpload: async () => ({}) }));

let api: typeof import('../api/mp');
const H = { 'x-mp-proto': '2' };
const post = async (op: string, body: Record<string, unknown>, headers: Record<string, string> = H) => {
  const r = await api.POST(new Request(`http://x/api/mp?op=${op}`, { method: 'POST', headers, body: JSON.stringify(body) }));
  return { status: r.status, body: await r.json() };
};
const room = async (code: string) => (await api.GET(new Request(`http://x/api/mp?code=${code}`, { headers: H }))).json();
type P = { pid: string; pending: boolean; ready: boolean };
const pl = (r: { players: P[] }, pid: string) => r.players.find((p) => p.pid === pid)!;
const url = (v: number) => `https://x.public.blob.vercel-storage.com/rooms/v${v}.gz`;
beforeAll(async () => { api = await import('../api/mp'); });

describe('online multiplayer (server)', () => {
  it('protokolversion: klient og server har samme tal; gamle klienter (uden header) afvises med 426', async () => {
    const client = Number(/export const MP_PROTOCOL = (\d+)/.exec(readFileSync('src/online/client.ts', 'utf8'))?.[1]);
    expect(client).toBe(api.MP_PROTOCOL);
    expect(H['x-mp-proto']).toBe(String(api.MP_PROTOCOL));
    const h = (await post('create', { name: 'Host', club: 3826, settings: {} })).body;
    expect((await post('ready', { code: h.code, pid: h.pid, token: h.token, ready: true }, {})).status).toBe(426);
    expect((await post('ready', { code: h.code, pid: h.pid, token: h.token, ready: true }, { 'x-mp-proto': '1' })).status).toBe(426);
    expect((await api.GET(new Request(`http://x/api/mp?code=${h.code}`))).status).toBe(426);
  });

  it('en ny gæst er med straks: join-handlingen ligger i room.joins, og trækket venter på gæstens Klar', async () => {
    const h = (await post('create', { name: 'Host', club: 3826, settings: {} })).body;
    const A = { code: h.code, pid: h.pid, token: h.token };
    expect((await post('commit', { ...A, version: 1, url: url(1), lastApplied: 0, date: '2026-07-01', humans: [h.pid] })).status).toBe(200);
    await post('actions', { ...A, actions: [{ t: 'read', ids: [1] }] });
    const g = (await post('join', { code: h.code, name: 'Guest', club: 1920, nation: 53 })).body;
    const B = { code: h.code, pid: g.pid, token: g.token };
    let r = await room(h.code);
    expect(pl(r, g.pid).pending).toBe(false);
    expect(r.joins).toEqual([{ idx: 2, pid: g.pid, a: { t: 'join', name: 'Guest', club: 1920, nation: 53 } }]);
    // værten alene klar → trækket venter på gæsten (før: gæsten sad i lobbyen til næste træk)
    await post('ready', { ...A, ready: true });
    expect((await post('lock', { ...A, version: 1 })).body.error).toBe('not-ready');
    // gæsten ændrer sin taktik og trykker Klar → trækket kan spilles og afspiller join før gæstens handlinger
    await post('actions', { ...B, actions: [{ t: 'tactic', tac: {} }] });
    await post('ready', { ...B, ready: true });
    const lock = await post('lock', { ...A, version: 1 });
    expect(lock.body.ok).toBe(true);
    expect(lock.body.actions.map((x: { a: { t: string } }) => x.a.t)).toEqual(['read', 'join', 'tactic']);
    r = (await post('commit', { ...A, version: 2, url: url(2), lastApplied: 3, date: '2026-07-05', humans: [h.pid, g.pid] })).body;
    expect(r.players.every((p: P) => !p.pending && !p.ready)).toBe(true);
    expect(r.joins).toEqual([]);
    // at læse en besked gør ikke en manager "ikke klar" igen; en rigtig ændring gør
    await post('ready', { ...B, ready: true });
    await post('actions', { ...B, actions: [{ t: 'read', ids: [3] }] });
    expect(pl(await room(h.code), g.pid).ready).toBe(true);
    await post('actions', { ...B, actions: [{ t: 'tactic', tac: {} }] });
    expect(pl(await room(h.code), g.pid).ready).toBe(false);
  });

  it('flere gæster samtidig og en tilmelding midt i et træk (låsen er taget) forbliver med efter commit', async () => {
    const h = (await post('create', { name: 'Host', club: 10, settings: {} })).body;
    const A = { code: h.code, pid: h.pid, token: h.token };
    await post('commit', { ...A, version: 1, url: url(1), lastApplied: 0, date: '2026-07-01', humans: [h.pid] });
    const b = (await post('join', { code: h.code, name: 'B', club: 11, nation: 1 })).body;
    const c = (await post('join', { code: h.code, name: 'C', club: 12, nation: 1 })).body;
    expect((await post('join', { code: h.code, name: 'X', club: 12, nation: 1 })).body.error).toBe('club-taken');
    expect((await room(h.code)).joins.map((j: { pid: string }) => j.pid)).toEqual([b.pid, c.pid]);
    for (const x of [A, { code: h.code, pid: b.pid, token: b.token }, { code: h.code, pid: c.pid, token: c.token }]) await post('ready', { ...x, ready: true });
    const lock = await post('lock', { ...A, version: 1 });
    expect(lock.body.actions.length).toBe(2);
    // D tilmelder sig, mens værten simulerer – trækket afspiller ikke D's join
    const d = (await post('join', { code: h.code, name: 'D', club: 13, nation: 1 })).body;
    const r = (await post('commit', { ...A, version: 2, url: url(2), lastApplied: 2, date: '2026-07-02', humans: [h.pid, b.pid, c.pid] })).body;
    expect(pl(r, d.pid).pending).toBe(false);
    expect(r.joins.map((j: { pid: string; idx: number }) => [j.pid, j.idx])).toEqual([[d.pid, 3]]);
    // D skal trykke Klar i næste træk
    for (const x of [A, { code: h.code, pid: b.pid, token: b.token }, { code: h.code, pid: c.pid, token: c.token }]) await post('ready', { ...x, ready: true });
    expect((await post('lock', { ...A, version: 2 })).body.error).toBe('not-ready');
  });

  it('Tving igennem gør også en ny gæst klar; en mislykket tilmelding (ikke i humans) blokerer ikke bagefter', async () => {
    const h = (await post('create', { name: 'Host', club: 1, settings: {} })).body;
    const A = { code: h.code, pid: h.pid, token: h.token };
    await post('commit', { ...A, version: 1, url: url(1), lastApplied: 0, date: '2026-07-01', humans: [h.pid] });
    const g = (await post('join', { code: h.code, name: 'Late', club: 2, nation: 1 })).body;
    const r = (await post('force', { ...A })).body;
    expect(pl(r, g.pid).ready).toBe(true);
    const lock = await post('lock', { ...A, version: 1 });
    expect(lock.body.ok).toBe(true);
    // trækket kunne ikke afspille gæstens tilmelding (fx klubben var taget af en AI-manager) → ikke i humans
    const r2 = (await post('commit', { ...A, version: 2, url: url(2), lastApplied: lock.body.actions.length, date: '2026-07-02', humans: [h.pid] })).body;
    expect(pl(r2, g.pid).pending).toBe(true);
    await post('ready', { ...A, ready: true });
    expect((await post('lock', { ...A, version: 2 })).body.ok).toBe(true);
  });
});
