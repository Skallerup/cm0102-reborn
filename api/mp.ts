// Online multiplayer-server (Vercel Function).
//
// Redis (Upstash) holder rummets metadata, deltagere, "klar"-status, handlinger og en lås.
// Selve spillet (≈4-5 MB gzip) ligger som øjebliksbilleder i Vercel Blob.
// Klienterne simulerer selv: når alle er klar, tager én af dem låsen, afspiller alle handlinger,
// simulerer frem til næste kampdag og uploader et nyt øjebliksbillede (commit).
import { Redis } from '@upstash/redis';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });
const TTL = 60 * 60 * 24 * 60; // rum lever 60 dage efter sidste aktivitet
const LOCK_SECONDS = 240;
const MAX_PLAYERS = 8;

interface PlayerRec {
  pid: string;
  name: string;
  club: number;
  token: string;
  ready: boolean;
  joined: string;
  /** Gjort klar automatisk, fordi trækkets frist udløb (assistenten tager over) */
  auto?: boolean;
}

interface ChatRec {
  id: number;
  from: string;
  name: string;
  to: string;
  text: string;
  at: string;
}

interface RoomRec {
  code: string;
  host: string;
  status: 'setup' | 'playing';
  version: number;
  snapshot: string;
  prevSnapshot: string;
  lastApplied: number;
  date: string;
  settings: string;
  created: string;
  lastTurn: string;
}

const k = (code: string) => ({ room: `room:${code}`, players: `room:${code}:players`, actions: `room:${code}:actions`, lock: `room:${code}:lock`, chat: `room:${code}:chat` });
const CHAT_KEEP = 300;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

function rid(len: number, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
}

async function touch(code: string) {
  const keys = k(code);
  await Promise.all([redis.expire(keys.room, TTL), redis.expire(keys.players, TTL), redis.expire(keys.actions, TTL), redis.expire(keys.chat, TTL)]);
}

async function getRoom(code: string): Promise<RoomRec | null> {
  const r = await redis.hgetall<Record<string, string | number>>(k(code).room);
  if (!r || !r.code) return null;
  return { ...r, version: Number(r.version), lastApplied: Number(r.lastApplied) } as unknown as RoomRec;
}

async function getPlayers(code: string): Promise<PlayerRec[]> {
  const h = await redis.hgetall<Record<string, PlayerRec | string>>(k(code).players);
  if (!h) return [];
  return Object.values(h).map((v) => (typeof v === 'string' ? (JSON.parse(v) as PlayerRec) : v));
}

async function auth(code: string, pid: string, token: string): Promise<PlayerRec | null> {
  const raw = await redis.hget<PlayerRec | string>(k(code).players, pid);
  if (!raw) return null;
  const p = typeof raw === 'string' ? (JSON.parse(raw) as PlayerRec) : raw;
  return p.token === token ? p : null;
}

async function savePlayer(code: string, p: PlayerRec) {
  await redis.hset(k(code).players, { [p.pid]: JSON.stringify(p) });
}

async function publicRoom(code: string) {
  const room = await getRoom(code);
  if (!room) return null;
  const players = await getPlayers(code);
  const lock = await redis.get<string>(k(code).lock);
  const actionCount = await redis.llen(k(code).actions);
  const chatRaw = await redis.lrange<string | ChatRec>(k(code).chat, -100, -1);
  const chat = chatRaw.map((c) => (typeof c === 'string' ? (JSON.parse(c) as ChatRec) : c));
  return {
    code: room.code, host: room.host, status: room.status, version: room.version, snapshot: room.snapshot, date: room.date,
    lastApplied: room.lastApplied, actionCount, settings: typeof room.settings === 'string' ? JSON.parse(room.settings || '{}') : (room.settings ?? {}), lastTurn: room.lastTurn,
    processing: lock ?? null,
    players: players.map((p) => ({ pid: p.pid, name: p.name, club: p.club, ready: p.ready, joined: p.joined, auto: !!p.auto })),
    chat,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = (url.searchParams.get('code') ?? '').toUpperCase();
  if (!code) return json({ error: 'code' }, 400);
  const room = await publicRoom(code);
  return room ? json(room) : json({ error: 'not-found' }, 404);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const op = url.searchParams.get('op');
  if (op === 'upload') return upload(request);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: 'bad-json' }, 400); }
  const code = String(body.code ?? '').toUpperCase();
  const keys = k(code);

  switch (op) {
    case 'create': {
      const name = String(body.name ?? '').slice(0, 30).trim();
      const club = Number(body.club);
      if (!name || !club) return json({ error: 'missing' }, 400);
      let newCode = '';
      for (let i = 0; i < 5; i++) {
        const c = rid(5);
        if (await redis.hsetnx(`room:${c}`, 'code', c)) { newCode = c; break; }
      }
      if (!newCode) return json({ error: 'busy' }, 503);
      const pid = rid(10, 'abcdefghijkmnpqrstuvwxyz23456789');
      const token = rid(24, 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789');
      const now = new Date().toISOString();
      await redis.hset(`room:${newCode}`, {
        code: newCode, host: pid, status: 'setup', version: 0, snapshot: '', prevSnapshot: '', lastApplied: 0, date: '',
        settings: JSON.stringify(body.settings ?? {}), created: now, lastTurn: now,
      });
      await savePlayer(newCode, { pid, name, club, token, ready: false, joined: now });
      await touch(newCode);
      return json({ code: newCode, pid, token });
    }
    case 'join': {
      const room = await getRoom(code);
      if (!room) return json({ error: 'not-found' }, 404);
      const name = String(body.name ?? '').slice(0, 30).trim();
      const club = Number(body.club);
      const nation = Number(body.nation ?? 0);
      const players = await getPlayers(code);
      if (!name || !club) return json({ error: 'missing' }, 400);
      if (players.length >= MAX_PLAYERS) return json({ error: 'full' }, 409);
      if (players.some((p) => p.club === club)) return json({ error: 'club-taken' }, 409);
      const pid = rid(10, 'abcdefghijkmnpqrstuvwxyz23456789');
      const token = rid(24, 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789');
      await savePlayer(code, { pid, name, club, token, ready: false, joined: new Date().toISOString() });
      await redis.rpush(keys.actions, JSON.stringify({ pid, a: { t: 'join', name, club, nation } }));
      await touch(code);
      return json({ code, pid, token });
    }
    case 'actions': {
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const actions = Array.isArray(body.actions) ? body.actions.slice(0, 200) : [];
      let last = await redis.llen(keys.actions);
      if (actions.length) last = await redis.rpush(keys.actions, ...actions.map((a) => JSON.stringify({ pid: me.pid, a })));
      if (me.ready && actions.length) { me.ready = false; await savePlayer(code, me); }
      await touch(code);
      return json({ last });
    }
    // ----- kamp mellem to managere: hjemmeholdet kører kampen og sender en live-visning; udeholdet følger med og sender ændringer -----
    case 'livepush': {
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const fx = Number(body.fixture);
      await redis.set(`room:${code}:live:${fx}`, JSON.stringify(body.data ?? null), { ex: 3600 });
      const ck = `room:${code}:livecmd:${fx}`;
      const raw = await redis.lrange<string | Record<string, unknown>>(ck, 0, -1);
      if (raw.length) await redis.del(ck);
      return json({ cmds: raw.map((x) => (typeof x === 'string' ? JSON.parse(x) : x)) });
    }
    case 'liveget': {
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const raw = await redis.get<string | Record<string, unknown>>(`room:${code}:live:${Number(body.fixture)}`);
      return json({ data: raw == null ? null : typeof raw === 'string' ? JSON.parse(raw) : raw });
    }
    case 'livecmd': {
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const ck = `room:${code}:livecmd:${Number(body.fixture)}`;
      await redis.rpush(ck, JSON.stringify(body.cmd ?? null));
      await redis.expire(ck, 3600);
      return json({ ok: true });
    }
    case 'chat': {
      // beskeder mellem menneskelige managere (leveres med det samme, uafhængigt af trækkene)
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const text = String(body.text ?? '').trim().slice(0, 500);
      const to = String(body.to ?? 'all').slice(0, 40);
      if (!text) return json({ error: 'empty' }, 400);
      const n = await redis.incr(`${keys.chat}:seq`);
      const rec: ChatRec = { id: n, from: me.pid, name: me.name, to, text, at: new Date().toISOString() };
      await redis.rpush(keys.chat, JSON.stringify(rec));
      await redis.ltrim(keys.chat, -CHAT_KEEP, -1);
      await Promise.all([touch(code), redis.expire(`${keys.chat}:seq`, TTL)]);
      return json(rec);
    }
    case 'autoready': {
      // trækkets frist er udløbet: alle der ikke er klar, gøres klar – deres assistent tager over
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const room = await getRoom(code);
      if (!room) return json({ error: 'not-found' }, 404);
      const settings = typeof room.settings === 'string' ? JSON.parse(room.settings || '{}') : (room.settings ?? {});
      const hours = Number(settings.deadlineHours ?? 0);
      if (!hours) return json({ error: 'no-deadline' }, 400);
      if (Date.now() - Date.parse(room.lastTurn) < hours * 3_600_000) return json({ error: 'too-early' }, 409);
      for (const p of await getPlayers(code)) if (!p.ready) { p.ready = true; p.auto = true; await savePlayer(code, p); }
      return json(await publicRoom(code));
    }
    case 'force': {
      // værten tvinger trækket igennem: alle der ikke er klar, gøres klar (assistenten tager over)
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const room = await getRoom(code);
      if (!room) return json({ error: 'not-found' }, 404);
      if (room.host !== me.pid) return json({ error: 'not-host' }, 403);
      for (const p of await getPlayers(code)) if (!p.ready) { p.ready = true; p.auto = true; await savePlayer(code, p); }
      await touch(code);
      return json(await publicRoom(code));
    }
    case 'kick': {
      // værten fjerner en spiller (fx gået offline) – klubben overtages af en AI-manager i næste træk
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const room = await getRoom(code);
      if (!room) return json({ error: 'not-found' }, 404);
      if (room.host !== me.pid) return json({ error: 'not-host' }, 403);
      const target = String(body.target ?? '');
      if (!target || target === room.host) return json({ error: 'target' }, 400);
      await redis.hdel(keys.players, target);
      await redis.rpush(keys.actions, JSON.stringify({ pid: me.pid, a: { t: 'removeHuman', pid: target } }));
      await touch(code);
      return json(await publicRoom(code));
    }
    case 'ready': {
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      me.ready = !!body.ready;
      me.auto = false;
      await savePlayer(code, me);
      return json(await publicRoom(code));
    }
    case 'lock': {
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const room = await getRoom(code);
      if (!room || room.version !== Number(body.version)) return json({ error: 'version' }, 409);
      const players = await getPlayers(code);
      if (!players.every((p) => p.ready)) return json({ error: 'not-ready' }, 409);
      const ok = await redis.set(keys.lock, me.pid, { nx: true, ex: LOCK_SECONDS });
      if (!ok) return json({ error: 'locked' }, 409);
      const raw = await redis.lrange<string | { pid: string; a: unknown }>(keys.actions, room.lastApplied, -1);
      const actions = raw.map((x, i) => ({ idx: room.lastApplied + i + 1, ...(typeof x === 'string' ? JSON.parse(x) : x) }));
      return json({ ok: true, actions });
    }
    case 'unlock': {
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const holder = await redis.get<string>(keys.lock);
      if (holder === me.pid) await redis.del(keys.lock);
      return json({ ok: true });
    }
    case 'commit': {
      const me = await auth(code, String(body.pid), String(body.token));
      if (!me) return json({ error: 'auth' }, 403);
      const room = await getRoom(code);
      if (!room) return json({ error: 'not-found' }, 404);
      const version = Number(body.version);
      const snapshot = String(body.url ?? '');
      if (!snapshot.includes('.blob.vercel-storage.com/')) return json({ error: 'url' }, 400);
      const init = room.version === 0 && room.host === me.pid && version === 1;
      if (!init) {
        const holder = await redis.get<string>(keys.lock);
        if (holder !== me.pid) return json({ error: 'no-lock' }, 409);
        if (version !== room.version + 1) return json({ error: 'version' }, 409);
      }
      // ryd op i gamle øjebliksbilleder (behold forrige, så klienter midt i en download ikke fejler)
      if (room.prevSnapshot) { try { await del(room.prevSnapshot); } catch { /* ignorér */ } }
      await redis.hset(keys.room, {
        version, snapshot, prevSnapshot: room.snapshot || '', lastApplied: Number(body.lastApplied ?? room.lastApplied),
        date: String(body.date ?? ''), status: 'playing', lastTurn: new Date().toISOString(),
      });
      const players = await getPlayers(code);
      for (const p of players) if (p.ready || p.auto) { p.ready = false; p.auto = false; await savePlayer(code, p); }
      await redis.del(keys.lock);
      await touch(code);
      return json(await publicRoom(code));
    }
    default:
      return json({ error: 'op' }, 400);
  }
}

async function upload(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const p = JSON.parse(clientPayload ?? '{}') as { code?: string; pid?: string; token?: string };
        const code = String(p.code ?? '').toUpperCase();
        const me = await auth(code, String(p.pid), String(p.token));
        if (!me || !pathname.startsWith(`rooms/${code}/`)) throw new Error('auth');
        return {
          allowedContentTypes: ['application/gzip', 'application/octet-stream'],
          maximumSizeInBytes: 60 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return json(result);
  } catch (e) {
    return json({ error: String((e as Error).message) }, 400);
  }
}
