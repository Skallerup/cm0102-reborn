// Admin API (Vercel Function + Upstash Redis) and the public "join the project" form.
//
// Public:  POST { op: 'apply', name, email, role, message, lang, website }  → stores an application
//          (honeypot field "website", max 3 per IP per hour, 40 per hour in total). If RESEND_API_KEY and
//          NOTIFY_EMAIL are set, the developer also gets an e-mail.
// Admin:   every other op requires the ADMIN_TOKEN (header x-admin-token).
//          GET ?op=overview | managers | manager&pid= | applications | rooms | rankings&board=
//          POST { op: 'app-status' | 'app-delete' | 'unrank' }
import { Redis } from '@upstash/redis';

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clip = (v: unknown, n: number) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, n);
const isAdmin = (req: Request) => { const tok = process.env.ADMIN_TOKEN; return !!tok && req.headers.get('x-admin-token') === tok; };
const ipOf = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
const ROLES = ['developer', 'designer', 'data', 'testing', 'translation', 'community', 'other'] as const;
const APP_STATUSES = ['new', 'contacted', 'accepted', 'rejected'] as const;

export interface Application { id: number; name: string; email: string; role: string; message: string; lang: string; created: string; status: string; note?: string }

/** All keys matching a pattern (SCAN, capped so a big database cannot time out the function) */
async function scanKeys(match: string, cap = 5000): Promise<string[]> {
  const out: string[] = [];
  let cursor: string | number = 0;
  do {
    const [next, keys] = (await redis.scan(cursor, { match, count: 500 })) as [string | number, string[]];
    out.push(...keys);
    cursor = next;
  } while (String(cursor) !== '0' && out.length < cap);
  return out;
}

async function sendMail(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY, to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: process.env.NOTIFY_FROM ?? 'CM Reborn <onboarding@resend.dev>', to: [to], subject, text }),
  }).catch(() => {});
}

async function listApplications(): Promise<Application[]> {
  const ids = (await redis.lrange<number>('ap:list', 0, 499)) ?? [];
  const rows = await Promise.all(ids.map((id) => redis.hgetall<Record<string, string>>(`ap:${id}`)));
  return rows.flatMap((r, i) => (r ? [{ ...(r as unknown as Application), id: Number(ids[i]) }] : []));
}

export async function GET(request: Request) {
  if (!isAdmin(request)) return json({ error: 'auth' }, 401);
  const url = new URL(request.url);
  const op = url.searchParams.get('op') ?? 'overview';

  if (op === 'overview') {
    const day = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    const [names, rooms, careers, seasons, monthEntries, aiToday, aiYesterday, sgSeq, supporters, apps] = await Promise.all([
      scanKeys('name:*'), scanKeys('room:?????'), redis.zcard('lb:career'), redis.zcard('lb:season'), redis.zcard(`lb:month:${month}`),
      redis.get<number>(`ai:d:${day}`), redis.get<number>(`ai:d:${yesterday}`), redis.get<number>('sg:seq'), redis.zcard('supporters'), listApplications(),
    ]);
    const roomInfo = await Promise.all(rooms.slice(0, 300).map((r) => redis.hmget<Record<string, string>>(r, 'status', 'lastTurn')));
    const week = Date.now() - 7 * 86_400_000;
    const top = (await redis.zrange<string[]>('lb:career', 0, 4, { rev: true, withScores: true })) ?? [];
    const topRows = [];
    for (let i = 0; i + 1 < top.length; i += 2) {
      const c = await redis.hgetall<Record<string, string>>(`career:${top[i]}`);
      topRows.push({ career: top[i], points: Number(top[i + 1]), name: c?.name ?? '?', club: c?.club ?? '', league: c?.league ?? '' });
    }
    const accounts = await redis.scard('acct:all');
    return json({
      accounts,
      managers: names.length, careers, seasons, seasonsThisMonth: monthEntries,
      rooms: rooms.length, activeRooms: roomInfo.filter((x) => x?.lastTurn && Date.parse(x.lastTurn) > week).length,
      ai: { today: Number(aiToday ?? 0), yesterday: Number(aiYesterday ?? 0), cap: Number(process.env.AI_DAILY_CAP ?? 4000) },
      suggestions: Number(sgSeq ?? 0), supporters,
      applications: { total: apps.length, new: apps.filter((a) => a.status === 'new').length },
      top: topRows,
      config: { email: !!(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL), stripe: !!process.env.STRIPE_SECRET_KEY },
    });
  }

  if (op === 'managers') {
    const names = await scanKeys('name:*', 3000);
    const pids = await Promise.all(names.map((n) => redis.get<string>(n)));
    const rows = await Promise.all(pids.map(async (pid) => {
      if (!pid) return null;
      const [p, careers] = await Promise.all([
        redis.hmget<Record<string, string>>(`prof:${pid}`, 'name', 'created', 'updated', 'supporter', 'donated', 'motto'),
        redis.smembers(`prof:${pid}:careers`),
      ]);
      if (!p?.name) return null;
      const scores = await Promise.all(careers.map((c) => redis.zscore('lb:career', c)));
      const seasons = await Promise.all(careers.map((c) => redis.hget<number>(`career:${c}`, 'seasons')));
      return {
        pid, name: p.name, created: p.created ?? '', updated: p.updated ?? '', supporter: p.supporter ?? null, donated: Number(p.donated ?? 0),
        careers: careers.length, best: Math.max(0, ...scores.map((s) => Number(s ?? 0))), seasons: seasons.reduce<number>((a, s) => a + Number(s ?? 0), 0),
      };
    }));
    return json({ rows: rows.filter((r): r is NonNullable<typeof r> => !!r).sort((a, b) => (b.created || '').localeCompare(a.created || '')) });
  }

  if (op === 'manager') {
    const pid = clip(url.searchParams.get('pid'), 32);
    const p = await redis.hgetall<Record<string, string>>(`prof:${pid}`);
    if (!p) return json({ error: 'missing' }, 404);
    const careers = await redis.smembers(`prof:${pid}:careers`);
    const list = await Promise.all(careers.map(async (c) => ({ career: c, ...(await redis.hgetall<Record<string, string>>(`career:${c}`)), points: Number((await redis.zscore('lb:career', c)) ?? 0) })));
    const { th: _th, avatar: _a, ...rest } = p;
    // Upstash pakker JSON-felter ud af sig selv – parse kun hvis de stadig er tekst
    const parse = (v: unknown) => { if (typeof v !== 'string') return v ?? null; try { return JSON.parse(v); } catch { return null; } };
    return json({ profile: { ...rest, pid, summary: parse(p.summary), ach: parse(p.ach) }, careers: list.sort((a, b) => b.points - a.points) });
  }

  if (op === 'applications') return json({ rows: await listApplications() });

  if (op === 'rooms') {
    const rooms = await scanKeys('room:?????', 1000);
    const rows = await Promise.all(rooms.map(async (r) => {
      const [h, players] = await Promise.all([
        redis.hmget<Record<string, string>>(r, 'code', 'status', 'created', 'lastTurn', 'date', 'settings', 'version'),
        redis.hgetall<Record<string, string>>(`${r}:players`),
      ]);
      if (!h?.code) return null;
      let mode = 'career';
      try { mode = (typeof h.settings === 'string' ? JSON.parse(h.settings) : h.settings)?.mode ?? 'career'; } catch { /* ignore */ }
      const ps = Object.values(players ?? {}).map((x) => { try { return typeof x === 'string' ? JSON.parse(x) : x; } catch { return null; } }).filter(Boolean) as { name: string; club?: number }[];
      return { code: h.code, status: h.status, created: h.created, lastTurn: h.lastTurn, date: h.date, version: Number(h.version ?? 0), mode, players: ps.map((p) => p.name) };
    }));
    return json({ rows: rows.filter((r): r is NonNullable<typeof r> => !!r).sort((a, b) => (b.lastTurn || '').localeCompare(a.lastTurn || '')) });
  }

  if (op === 'rankings') {
    const board = url.searchParams.get('board') === 'season' ? 'lb:season' : 'lb:career';
    const raw = (await redis.zrange<string[]>(board, 0, 99, { rev: true, withScores: true })) ?? [];
    const rows = [];
    for (let i = 0; i + 1 < raw.length; i += 2) {
      const h = board === 'lb:career' ? await redis.hgetall<Record<string, string>>(`career:${raw[i]}`) : await redis.hgetall<Record<string, string>>(`entry:${raw[i]}`);
      rows.push({ member: raw[i], points: Number(raw[i + 1]), name: h?.name ?? '?', club: h?.club ?? '', league: h?.league ?? '', season: h?.season ?? '', pid: h?.pid ?? '' });
    }
    return json({ rows });
  }

  return json({ error: 'op' }, 400);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: 'json' }, 400); }

  // ---------- public: "Join the project" ----------
  if (body.op === 'apply') {
    if (clip(body.website, 200)) return json({ ok: true }); // honeypot: bots fill every field
    const name = clip(body.name, 80), email = clip(body.email, 120), message = clip(body.message, 3000);
    const role = ROLES.includes(body.role as (typeof ROLES)[number]) ? String(body.role) : 'other';
    if (!name || !message || message.length < 10) return json({ error: 'missing' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: 'email' }, 400);
    const hour = Math.floor(Date.now() / 3_600_000), ip = ipOf(request);
    const [mine, all] = await Promise.all([redis.incr(`ap:ip:${ip}:${hour}`), redis.incr(`ap:all:${hour}`)]);
    if (mine === 1) await redis.expire(`ap:ip:${ip}:${hour}`, 7200);
    if (all === 1) await redis.expire(`ap:all:${hour}`, 7200);
    if (mine > 3 || all > 40) return json({ error: 'limit' }, 429);
    const id = await redis.incr('ap:seq');
    const app: Omit<Application, 'id'> = { name, email, role, message, lang: clip(body.lang, 5), created: new Date().toISOString(), status: 'new' };
    await redis.hset(`ap:${id}`, app);
    await redis.lpush('ap:list', id);
    await sendMail(`New application: ${name} (${role})`, `Name: ${name}\nE-mail: ${email}\nRole: ${role}\n\n${message}`);
    return json({ ok: true });
  }

  // ---------- admin ----------
  if (!isAdmin(request)) return json({ error: 'auth' }, 401);

  if (body.op === 'app-status') {
    const id = Number(body.id);
    if (!id || !(await redis.exists(`ap:${id}`))) return json({ error: 'missing' }, 404);
    const fields: Record<string, string> = {};
    if (APP_STATUSES.includes(body.status as (typeof APP_STATUSES)[number])) fields.status = String(body.status);
    if (typeof body.note === 'string') fields.note = clip(body.note, 2000);
    if (Object.keys(fields).length) await redis.hset(`ap:${id}`, fields);
    return json({ ok: true });
  }

  if (body.op === 'app-delete') {
    const id = Number(body.id);
    await Promise.all([redis.del(`ap:${id}`), redis.lrem('ap:list', 0, id)]);
    return json({ ok: true });
  }

  // take a career off the career board (e.g. an obviously manipulated score); its seasons stay on record
  if (body.op === 'unrank') {
    const career = clip(body.career, 64);
    await redis.zrem('lb:career', career);
    return json({ ok: true });
  }

  return json({ error: 'op' }, 400);
}
