// Logger, når en ny singleplayer-karriere startes, så udvikleren kan se det i admin (fanen "New careers").
// Der sendes ingen mail. Gemmes i Upstash Redis: nc:list (seneste 1000), nc:total og nc:d:{dag}.
// { op: 'ping', vid, prog? } er browserens puls (prog = spildato/klub/placering for det åbne spil → hash "prog") (hvert 2. minut, mens fanen er synlig): sorteret sæt "seen" (vid → tid).
// { op: 'error' } = fejl fra browseren (fanen Errors i admin: err:list + err:{id}).
// Begrænset pr. IP, så ingen kan fylde listen op. Landet (x-vercel-ip-country) gemmes – selve IP-adressen gemmes ikke.
import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clip = (v: unknown, n = 60) => String(v ?? '').replace(/[\r\n<>]/g, ' ').trim().slice(0, n);

export async function POST(request: Request) {
  if (!redis) return json({ ok: false, disabled: true });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: 'json' }, 400); }

  // fejl fra spillernes browsere (src/online/errors.ts): grupperet pr. besked + første kodelinje, med antal og seneste tidspunkt
  if (body.op === 'error') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const hk = `er:ip:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
    const hits = await redis.incr(hk);
    if (hits === 1) await redis.expire(hk, 7200);
    if (hits > 30) return json({ error: 'limit' }, 429);
    const msg = String(body.msg ?? '').slice(0, 300).trim();
    if (!msg) return json({ error: 'msg' }, 400);
    const stack = String(body.stack ?? '').slice(0, 3000);
    const frame = stack.split('\n').find((l) => /\bat\b|@/.test(l))?.replace(/\?[^)\s]*/g, '').replace(/:\d+:\d+/g, '') ?? '';
    const id = createHash('sha1').update(`${msg}|${frame}`).digest('hex').slice(0, 16);
    const now = new Date().toISOString();
    const k = `err:${id}`;
    if (!(await redis.exists(k))) await redis.hset(k, { msg, stack, first: now });
    await redis.hset(k, { last: now, ver: clip(body.ver, 12), url: clip(body.url, 100), theme: clip(body.theme, 10), lang: clip(body.lang, 5), ua: clip(body.ua, 160) });
    await redis.hincrby(k, 'count', 1);
    await redis.zadd('err:list', { score: Date.now(), member: id });
    if (Math.random() < 0.05) { const old = await redis.zrange<string[]>('err:list', 0, -301); if (old?.length) { await redis.zrem('err:list', ...(old as [string, ...string[]])); await redis.del(...old.map((x) => `err:${x}`)); } }
    return json({ ok: true });
  }

  if (body.op === 'ping') {
    const vid = clip(body.vid, 24).replace(/[^a-z0-9]/gi, '');
    if (!vid) return json({ error: 'vid' }, 400);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const hk = `pg:ip:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
    const hits = await redis.incr(hk);
    if (hits === 1) await redis.expire(hk, 7200);
    if (hits > 150) return json({ error: 'limit' }, 429);
    const now = Date.now();
    await redis.zadd('seen', { score: now, member: vid });
    // fremskridt i det åbne spil (singleplayer): spildato, klub og ligaplacering pr. spil-id
    const pr = body.prog as Record<string, unknown> | undefined;
    const gid = clip(pr?.gid, 40).replace(/[^\w-]/g, '');
    const date = clip(pr?.date, 10);
    if (gid && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      await redis.hset('prog', { [gid]: JSON.stringify({ date, club: clip(pr?.club, 30), pos: Math.max(0, Math.min(99, Number(pr?.pos) || 0)), at: now }) });
    }
    if (Math.random() < 0.01) await redis.zremrangebyscore('seen', 0, now - 30 * 86_400_000);
    return json({ ok: true });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const hour = Math.floor(Date.now() / 3_600_000);
  const [ipHits, allHits] = await Promise.all([redis.incr(`nt:ip:${ip}:${hour}`), redis.incr(`nt:all:${hour}`)]);
  if (ipHits === 1) await redis.expire(`nt:ip:${ip}:${hour}`, 7200);
  if (allHits === 1) await redis.expire(`nt:all:${hour}`, 7200);
  if (ipHits > 5 || allHits > 300) return json({ error: 'limit' }, 429);

  const manager = clip(body.manager, 30), club = clip(body.club);
  if (!manager || !club) return json({ error: 'missing' }, 400);
  const entry = {
    at: new Date().toISOString(), manager, club,
    league: clip(body.league), nation: clip(body.nation, 40), challenge: clip(body.challenge, 40),
    bots: Math.max(0, Math.min(99, Number(body.bots) || 0)), db: clip(body.db, 20) || 'standard', lang: clip(body.lang, 5),
    theme: body.theme === 'classic' ? 'classic' : body.theme === 'modern' ? 'modern' : '',
    // spiltilstand: Ægte CM 01/02 (kun originalens funktioner) eller Udvidet (alle de nye)
    mode: body.mode === 'authentic' ? 'authentic' : body.mode === 'extended' ? 'extended' : '',
    vid: clip(body.vid, 24).replace(/[^a-z0-9]/gi, ''),
    gid: clip(body.gid, 40).replace(/[^\w-]/g, ''), start: /^\d{4}-\d{2}-\d{2}$/.test(String(body.start)) ? String(body.start) : '',
    // kun landet (fra Vercels geo-header) – IP-adressen gemmes ikke
    country: (request.headers.get('x-vercel-ip-country') ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
  };
  const day = entry.at.slice(0, 10);
  if (entry.vid) await redis.zadd('seen', { score: Date.now(), member: entry.vid });
  await Promise.all([
    redis.lpush('nc:list', JSON.stringify(entry)).then(() => redis.ltrim('nc:list', 0, 999)),
    redis.incr('nc:total'),
    redis.incr(`nc:d:${day}`).then((n) => (n === 1 ? redis.expire(`nc:d:${day}`, 90 * 86_400) : 0)),
  ]);
  return json({ ok: true });
}
