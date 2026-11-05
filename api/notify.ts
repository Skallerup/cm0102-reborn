// Logger, når en ny singleplayer-karriere startes, så udvikleren kan se det i admin (fanen "New careers").
// Der sendes ingen mail. Gemmes i Upstash Redis: nc:list (seneste 1000), nc:total og nc:d:{dag}.
// Begrænset pr. IP, så ingen kan fylde listen op.
import { Redis } from '@upstash/redis';

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clip = (v: unknown, n = 60) => String(v ?? '').replace(/[\r\n<>]/g, ' ').trim().slice(0, n);

export async function POST(request: Request) {
  if (!redis) return json({ ok: false, disabled: true });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: 'json' }, 400); }

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
  };
  const day = entry.at.slice(0, 10);
  await Promise.all([
    redis.lpush('nc:list', JSON.stringify(entry)).then(() => redis.ltrim('nc:list', 0, 999)),
    redis.incr('nc:total'),
    redis.incr(`nc:d:${day}`).then((n) => (n === 1 ? redis.expire(`nc:d:${day}`, 90 * 86_400) : 0)),
  ]);
  return json({ ok: true });
}
