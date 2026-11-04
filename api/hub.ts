// Fællesskabets hub (Vercel Function + Upstash Redis + Vercel Blob):
//   hall    – delte karrierer ("Hall of Fame") med stjerner og kommentarer
//   edits   – fællesskabets rettelser til CM-databaserne (stemmes igennem, godkendes af admin → "Community Update")
//   legends – kultspillere fra CM 01/02, som fans kan "huske" (én stemme pr. profil)
//   follow  – følg andre managere og se deres seneste sæsoner og delte karrierer i et feed
//   skins   – fans' egne baggrundspakker (billeder i Vercel Blob, godkendes af admin)
//   credits – bidragydere (vedligeholdes i admin) + Discord-invitation
// Identitet = ranglisteprofilen (prof:{pid} med hash af et hemmeligt token). Admin-handlinger kræver ADMIN_TOKEN.
import { Redis } from '@upstash/redis';
import { put } from '@vercel/blob';
import { SITE, postDiscord } from './_lib/discord';

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (v: unknown, max: number) => String(v ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
const cleanBody = (v: unknown, max: number) => String(v ?? '').replace(/[<>]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
const parse = <T>(v: unknown, fb: T): T => { if (v && typeof v === 'object') return v as T; if (typeof v !== 'string') return fb; try { return JSON.parse(v) as T; } catch { return fb; } };
const ipOf = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
const isAdmin = (req: Request) => { const tok = process.env.ADMIN_TOKEN; return !!tok && req.headers.get('x-admin-token') === tok; };
const BAD = /(fuck|cunt|nigg|hitler|nazi|fisse|kusse|luder|neger)/i;

async function sha(s: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function auth(pid: unknown, token: unknown): Promise<{ pid: string; name: string } | null> {
  const id = String(pid ?? '');
  if (!/^[a-f0-9]{8,32}$/.test(id)) return null;
  const prof = await redis.hgetall<{ name: string; th: string }>(`prof:${id}`);
  return prof?.th && prof.th === (await sha(String(token))) ? { pid: id, name: prof.name } : null;
}
/** Simpel hastighedsgrænse pr. IP og handling */
async function limited(req: Request, what: string, max: number, windowSec = 3600) {
  const slot = Math.floor(Date.now() / (windowSec * 1000));
  const key = `hub:rl:${what}:${ipOf(req)}:${slot}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, windowSec * 2);
  return n > max;
}
/** Skriv en hændelse i managerens feed (læses af dem, der følger ham) */
async function feedPush(pid: string, ev: Record<string, unknown>) {
  await redis.lpush(`feed:${pid}`, JSON.stringify({ ...ev, at: new Date().toISOString() }));
  await redis.ltrim(`feed:${pid}`, 0, 49);
}

// ---------- typer ----------
export interface HallEntry {
  id: number; pid: string; manager: string; title: string; club: string; league: string; db: string; seasons: number; trophies: number;
  created: string; updated: string; stars: number; comments: number; hidden?: boolean; summary?: unknown;
}
export interface DbEdit {
  id: number; pid: string; name: string; db: 'cm' | 'original'; kind: 'player' | 'club'; target: number; targetName: string;
  field: string; old: string; value: string; reason: string; created: string; status: 'open' | 'approved' | 'rejected'; votes: number;
}
const EDIT_FIELDS: Record<string, RegExp> = {
  first: /^.{0,40}$/, last: /^.{1,40}$/, name: /^.{2,60}$/, short: /^.{2,30}$/, // navne
  attr: /^\d{1,2}:(?:[1-9]|1\d|20)$/, // "index:værdi" (1-20)
  color: /^#[0-9a-f]{6}(,#[0-9a-f]{6})?$/i,
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const op = url.searchParams.get('op') ?? '';
  const admin = isAdmin(request);

  if (op === 'config') {
    return json({ discord: process.env.DISCORD_INVITE ?? null, github: process.env.GITHUB_URL ?? 'https://github.com/Skallerup/cm0102-reborn' });
  }

  // ----- Hall of Fame -----
  if (op === 'hall') {
    const sort = url.searchParams.get('sort') === 'top' ? 'hall:top' : 'hall:new';
    const ids = (await redis.zrange<string[]>(sort, 0, 59, { rev: true })) ?? [];
    const rows = (await Promise.all(ids.map((id) => redis.hgetall<Record<string, unknown>>(`hall:${id}`))))
      .map((h, i) => (h ? { ...(h as object), id: Number(ids[i]), summary: undefined, data: undefined } : null))
      .filter((h): h is NonNullable<typeof h> => !!h && (admin || !(h as { hidden?: unknown }).hidden));
    return json({ rows });
  }
  if (op === 'hall-one') {
    const id = Number(url.searchParams.get('id'));
    const h = await redis.hgetall<Record<string, unknown>>(`hall:${id}`);
    if (!h || (h.hidden && !admin)) return json({ error: 'not-found' }, 404);
    const comments = ((await redis.lrange(`hall:${id}:comments`, 0, 199)) ?? []).map((c) => parse<Record<string, unknown>>(c, {}));
    const me = clean(url.searchParams.get('pid'), 32);
    const starred = me ? !!(await redis.sismember(`hall:${id}:stars`, me)) : false;
    return json({ entry: { ...h, id, summary: parse(h.data, null), data: undefined }, comments, starred });
  }

  // ----- databaserettelser -----
  if (op === 'edits') {
    const status = url.searchParams.get('status') ?? 'open';
    const key = status === 'approved' ? 'ed:approved' : status === 'rejected' ? 'ed:rejected' : 'ed:open';
    const ids = (await redis.zrange<string[]>(key, 0, 199, { rev: true })) ?? [];
    const rows = (await Promise.all(ids.map((id) => redis.hgetall<Record<string, unknown>>(`ed:${id}`)))).map((h, i) => (h ? { ...h, id: Number(ids[i]) } : null)).filter(Boolean);
    const me = clean(url.searchParams.get('pid'), 32);
    const voted = me ? (await Promise.all(ids.map((id) => redis.sismember(`ed:${id}:voters`, me)))).flatMap((v, i) => (v ? [Number(ids[i])] : [])) : [];
    return json({ rows, voted });
  }
  // de godkendte rettelser til en database (bruges når et nyt spil bygges)
  if (op === 'approved') {
    const db = url.searchParams.get('db') === 'original' ? 'original' : 'cm';
    const ids = (await redis.zrange<string[]>(`ed:approved:${db}`, 0, -1)) ?? [];
    const rows = (await Promise.all(ids.map((id) => redis.hmget<Record<string, string>>(`ed:${id}`, 'kind', 'target', 'field', 'value')))).filter(Boolean);
    return new Response(JSON.stringify({ edits: rows }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
  }

  // ----- legender -----
  if (op === 'legends') {
    const keys = (url.searchParams.get('keys') ?? '').split(',').map((k) => clean(k, 40)).filter(Boolean).slice(0, 40);
    const me = clean(url.searchParams.get('pid'), 32);
    const counts = await Promise.all(keys.map((k) => redis.scard(`lg:${k}`)));
    const mine = me ? await Promise.all(keys.map((k) => redis.sismember(`lg:${k}`, me))) : [];
    return json({ counts: Object.fromEntries(keys.map((k, i) => [k, counts[i]])), mine: keys.filter((_, i) => mine[i]) });
  }

  // ----- følg og feed -----
  if (op === 'feed') {
    const me = clean(url.searchParams.get('pid'), 32);
    if (!me) return json({ rows: [], following: [] });
    const following = ((await redis.smembers(`prof:${me}:following`)) ?? []).slice(0, 200);
    const lists = await Promise.all(following.map((p) => redis.lrange(`feed:${p}`, 0, 19)));
    const names = await Promise.all(following.map((p) => redis.hget<string>(`prof:${p}`, 'name')));
    const rows = lists.flatMap((l, i) => (l ?? []).map((x) => ({ ...parse<Record<string, unknown>>(x, {}), pid: following[i], name: names[i] ?? '?' }) as Record<string, unknown>))
      .sort((a, b) => String(b.at ?? '').localeCompare(String(a.at ?? ''))).slice(0, 60);
    return json({ rows, following: following.map((p, i) => ({ pid: p, name: names[i] ?? '?' })) });
  }
  if (op === 'follows') {
    const me = clean(url.searchParams.get('pid'), 32), who = clean(url.searchParams.get('who'), 32);
    const [isFollowing, followers] = await Promise.all([me ? redis.sismember(`prof:${me}:following`, who) : 0, redis.scard(`prof:${who}:followers`)]);
    return json({ following: !!isFollowing, followers });
  }

  // ----- skins -----
  if (op === 'skins') {
    const status = admin && url.searchParams.get('status') === 'pending' ? 'sk:pending' : 'sk:approved';
    const ids = (await redis.zrange<string[]>(status, 0, 99, { rev: true })) ?? [];
    const rows = (await Promise.all(ids.map((id) => redis.hgetall<Record<string, unknown>>(`sk:${id}`)))).map((h, i) => (h ? { ...h, id: Number(ids[i]), images: parse<string[]>(h.images, []) } : null)).filter(Boolean);
    return json({ rows });
  }

  // ----- credits -----
  if (op === 'credits') {
    const raw = (await redis.hgetall<Record<string, unknown>>('cr:people')) ?? {};
    const rows = Object.entries(raw).map(([id, v]) => ({ id, ...parse<{ name: string; role: string; link?: string; since?: string }>(v, { name: id, role: '' }) }))
      .sort((a, b) => String(a.since ?? '').localeCompare(String(b.since ?? '')));
    return json({ rows });
  }

  return json({ error: 'op' }, 400);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: 'json' }, 400); }
  const op = String(body.op ?? '');

  // ---------- admin ----------
  if (op.startsWith('admin:')) {
    if (!isAdmin(request)) return json({ error: 'auth' }, 401);
    const id = Number(body.id);
    if (op === 'admin:hall-hide') { await redis.hset(`hall:${id}`, { hidden: !!body.hidden }); return json({ ok: true }); }
    if (op === 'admin:edit') {
      const e = await redis.hgetall<Record<string, string>>(`ed:${id}`);
      if (!e) return json({ error: 'missing' }, 404);
      const status = body.status === 'approved' ? 'approved' : body.status === 'rejected' ? 'rejected' : 'open';
      await redis.hset(`ed:${id}`, { status });
      await Promise.all(['ed:open', 'ed:approved', 'ed:rejected', `ed:approved:${e.db}`].map((k) => redis.zrem(k, id)));
      const score = Date.parse(e.created) || Date.now();
      await redis.zadd(`ed:${status}`, { score, member: id });
      if (status === 'approved') {
        await redis.zadd(`ed:approved:${e.db}`, { score, member: id });
        await feedPush(e.pid, { kind: 'edit', text: `${e.targetName}: ${e.field} → ${e.value}` });
        await postDiscord(`✅ Database-rettelse godkendt: **${e.targetName}** – ${e.field}: ${e.old || '–'} → **${e.value}** (foreslået af ${e.name})`);
      }
      return json({ ok: true });
    }
    if (op === 'admin:skin') {
      const s = await redis.hgetall<Record<string, string>>(`sk:${id}`);
      if (!s) return json({ error: 'missing' }, 404);
      const status = body.status === 'approved' ? 'approved' : body.status === 'rejected' ? 'rejected' : 'pending';
      await redis.hset(`sk:${id}`, { status });
      await Promise.all([redis.zrem('sk:pending', id), redis.zrem('sk:approved', id)]);
      if (status !== 'rejected') await redis.zadd(status === 'approved' ? 'sk:approved' : 'sk:pending', { score: Date.now(), member: id });
      if (status === 'approved') await postDiscord(`🖼️ Ny baggrundspakke: **${s.title}** af ${s.author} – vælg den under Spilindstillinger.`, { title: s.title, url: `${SITE}/?community=1&tab=skins` });
      return json({ ok: true });
    }
    if (op === 'admin:credit') {
      const key = clean(body.key, 40) || `c${Date.now()}`;
      if (body.remove) { await redis.hdel('cr:people', key); return json({ ok: true }); }
      const name = clean(body.name, 60);
      if (!name) return json({ error: 'missing' }, 400);
      await redis.hset('cr:people', { [key]: JSON.stringify({ name, role: clean(body.role, 80), link: clean(body.link, 200), since: clean(body.since, 10) || new Date().toISOString().slice(0, 10) }) });
      return json({ ok: true });
    }
    return json({ error: 'op' }, 400);
  }

  // ---------- profil-handlinger ----------
  const me = await auth(body.pid, body.token);
  if (!me) return json({ error: 'auth' }, 401);

  // del (eller opdater) en karriere i Hall of Fame
  if (op === 'hall-share') {
    if (await limited(request, 'hall', 20)) return json({ error: 'limit' }, 429);
    const career = clean(body.career, 64);
    const data = body.summary as Record<string, unknown> | undefined;
    const raw = JSON.stringify(data ?? {});
    if (!career || raw.length > 60_000) return json({ error: 'size' }, 400);
    const title = clean(body.title, 80);
    if (!title || BAD.test(title)) return json({ error: 'title' }, 400);
    const existing = await redis.get<number>(`hall:career:${career}`);
    const id = existing ?? (await redis.incr('hall:seq'));
    const owner = existing ? await redis.hget<string>(`hall:${id}`, 'pid') : null;
    if (owner && owner !== me.pid) return json({ error: 'career' }, 403);
    const now = new Date().toISOString();
    await redis.hset(`hall:${id}`, {
      pid: me.pid, manager: me.name, title, club: clean(body.club, 60), league: clean(body.league, 60), db: clean(body.db, 12),
      seasons: Number(body.seasons) || 0, trophies: Number(body.trophies) || 0, data: raw, updated: now,
      ...(existing ? {} : { created: now, stars: 0, comments: 0 }),
    });
    if (!existing) {
      await redis.set(`hall:career:${career}`, id);
      await redis.zadd('hall:new', { score: Date.now(), member: id });
      await redis.zadd('hall:top', { score: 0, member: id });
      await feedPush(me.pid, { kind: 'hall', id, text: title });
      await postDiscord(`🏆 **${me.name}** har delt en karriere: **${title}** (${clean(body.club, 60)})`, { title, url: `${SITE}/?hall=${id}`, description: `${Number(body.seasons) || 0} sæsoner · ${Number(body.trophies) || 0} trofæer` });
    }
    return json({ ok: true, id });
  }
  if (op === 'hall-star') {
    const id = Number(body.id);
    if (!(await redis.exists(`hall:${id}`))) return json({ error: 'missing' }, 404);
    const on = !!body.on;
    const changed = on ? await redis.sadd(`hall:${id}:stars`, me.pid) : await redis.srem(`hall:${id}:stars`, me.pid);
    if (changed) { const n = await redis.hincrby(`hall:${id}`, 'stars', on ? 1 : -1); await redis.zadd('hall:top', { score: n, member: id }); }
    return json({ ok: true });
  }
  if (op === 'hall-comment') {
    if (await limited(request, 'hallc', 30)) return json({ error: 'limit' }, 429);
    const id = Number(body.id), text = cleanBody(body.text, 800);
    if (!text || BAD.test(text)) return json({ error: 'text' }, 400);
    if (!(await redis.exists(`hall:${id}`))) return json({ error: 'missing' }, 404);
    await redis.rpush(`hall:${id}:comments`, JSON.stringify({ pid: me.pid, name: me.name, text, at: new Date().toISOString() }));
    await redis.hincrby(`hall:${id}`, 'comments', 1);
    return json({ ok: true });
  }

  // foreslå en rettelse til databasen
  if (op === 'edit-propose') {
    if (await limited(request, 'edit', 30)) return json({ error: 'limit' }, 429);
    const field = clean(body.field, 12), value = clean(body.value, 60);
    const kind = body.kind === 'club' ? 'club' : 'player';
    if (!EDIT_FIELDS[field] || !EDIT_FIELDS[field].test(value) || BAD.test(value)) return json({ error: 'value' }, 400);
    const target = Number(body.target);
    if (!Number.isInteger(target) || target <= 0) return json({ error: 'target' }, 400);
    const db = body.db === 'original' ? 'original' : 'cm';
    const id = await redis.incr('ed:seq');
    const e = { pid: me.pid, name: me.name, db, kind, target, targetName: clean(body.targetName, 80), field, old: clean(body.old, 60), value, reason: cleanBody(body.reason, 600), created: new Date().toISOString(), status: 'open', votes: 1 };
    await redis.hset(`ed:${id}`, e);
    await redis.sadd(`ed:${id}:voters`, me.pid);
    await redis.zadd('ed:open', { score: Date.now(), member: id });
    return json({ ok: true, id });
  }
  if (op === 'edit-vote') {
    const id = Number(body.id);
    if (!(await redis.exists(`ed:${id}`))) return json({ error: 'missing' }, 404);
    const on = !!body.on;
    const changed = on ? await redis.sadd(`ed:${id}:voters`, me.pid) : await redis.srem(`ed:${id}:voters`, me.pid);
    if (changed) await redis.hincrby(`ed:${id}`, 'votes', on ? 1 : -1);
    return json({ ok: true });
  }

  // husk en legende
  if (op === 'legend') {
    const key = clean(body.key, 40);
    if (!/^[a-z0-9-]{2,40}$/.test(key)) return json({ error: 'key' }, 400);
    if (body.on) await redis.sadd(`lg:${key}`, me.pid); else await redis.srem(`lg:${key}`, me.pid);
    return json({ ok: true, count: await redis.scard(`lg:${key}`) });
  }

  // følg / stop med at følge
  if (op === 'follow') {
    const who = clean(body.who, 32);
    if (!/^[a-f0-9]{8,32}$/.test(who) || who === me.pid || !(await redis.exists(`prof:${who}`))) return json({ error: 'who' }, 400);
    if (body.on) await Promise.all([redis.sadd(`prof:${me.pid}:following`, who), redis.sadd(`prof:${who}:followers`, me.pid)]);
    else await Promise.all([redis.srem(`prof:${me.pid}:following`, who), redis.srem(`prof:${who}:followers`, me.pid)]);
    return json({ ok: true });
  }

  // baggrundspakker
  if (op === 'skin-create') {
    if (await limited(request, 'skin', 5, 86400)) return json({ error: 'limit' }, 429);
    if (!body.license) return json({ error: 'license' }, 400);
    const title = clean(body.title, 60);
    if (!title || BAD.test(title)) return json({ error: 'title' }, 400);
    const id = await redis.incr('sk:seq');
    await redis.hset(`sk:${id}`, { pid: me.pid, author: me.name, title, desc: cleanBody(body.desc, 400), created: new Date().toISOString(), status: 'draft', images: '[]' });
    return json({ ok: true, id });
  }
  if (op === 'skin-image') {
    if (await limited(request, 'skinimg', 80, 86400)) return json({ error: 'limit' }, 429);
    const id = Number(body.id);
    const s = await redis.hgetall<Record<string, unknown>>(`sk:${id}`);
    if (!s || s.pid !== me.pid || (s.status !== 'draft' && s.status !== 'pending')) return json({ error: 'skin' }, 403);
    const images = parse<string[]>(s.images, []);
    if (images.length >= 24) return json({ error: 'full' }, 400);
    const m = /^data:image\/(jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(body.data ?? ''));
    if (!m) return json({ error: 'image' }, 400);
    const bytes = Buffer.from(m[2], 'base64');
    if (bytes.length > 450_000) return json({ error: 'size' }, 400);
    const blob = await put(`skins/${id}/${images.length + 1}.${m[1] === 'jpeg' ? 'jpg' : 'webp'}`, bytes, { access: 'public', contentType: `image/${m[1]}`, addRandomSuffix: true });
    images.push(blob.url);
    await redis.hset(`sk:${id}`, { images: JSON.stringify(images) });
    return json({ ok: true, url: blob.url, count: images.length });
  }
  if (op === 'skin-submit') {
    const id = Number(body.id);
    const s = await redis.hgetall<Record<string, unknown>>(`sk:${id}`);
    if (!s || s.pid !== me.pid) return json({ error: 'skin' }, 403);
    if (parse<string[]>(s.images, []).length < 3) return json({ error: 'few' }, 400);
    await redis.hset(`sk:${id}`, { status: 'pending' });
    await redis.zadd('sk:pending', { score: Date.now(), member: id });
    return json({ ok: true });
  }

  return json({ error: 'op' }, 400);
}
