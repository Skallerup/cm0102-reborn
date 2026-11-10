// Admin API (Vercel Function + Upstash Redis) and the public "join the project" form.
//
// Public:  POST { op: 'apply', name, email, role, message, lang, website }  → stores an application
//          (honeypot field "website", max 3 per IP per hour, 40 per hour in total). If RESEND_API_KEY and
//          NOTIFY_EMAIL are set, the developer also gets an e-mail.
// Admin:   every other op requires the ADMIN_TOKEN (header x-admin-token).
//          GET ?op=overview | new-careers | managers | manager&pid= | applications | rooms | rankings&board= | saves | support
//          (saves/support: spillernes gemte spil i skyen og dem, der er sendt til udvikleren – åbnes i preview i admin)
//          POST { op: 'app-status' | 'app-delete' | 'unrank' }
import type { Redis } from '@upstash/redis';
import { makeRedis } from './_lib/redis.js';
import { del } from '@vercel/blob';
import { renderNews, sendNews, unsubLink, type Sub } from './_lib/mail.js';

const redis = makeRedis();
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

interface SaveRow { source: 'account' | 'support'; id: string; manager: string; club: string; date: string; saved: string; url: string; size: number; device?: string; email?: string; note?: string; vid?: string; lang?: string; theme?: string; mode?: string; ver?: string }
const parse = <T,>(v: unknown): T => (typeof v === 'string' ? JSON.parse(v) : v) as T;

/** Alle gemte spil i skyen (konti) og alle spil sendt til udvikleren – nyeste først */
async function allSaves(): Promise<SaveRow[]> {
  const out: SaveRow[] = [];
  const keys = await scanKeys('saves:*', 2000);
  await Promise.all(keys.map(async (k) => {
    const uid = k.slice(6);
    const [h, email] = await Promise.all([redis.hgetall<Record<string, unknown>>(k), redis.get<string>(`acct:uid:${uid}`)]);
    for (const v of Object.values(h ?? {})) {
      const r = parse<{ id: string; manager: string; club: string; date: string; saved: string; url: string; size: number; device: string }>(v);
      out.push({ source: 'account', ...r, email: email ?? undefined });
    }
  }));
  const sup = (await redis.lrange<unknown>('support:list', 0, 199)) ?? [];
  for (const v of sup) {
    const r = parse<{ at: string; url: string; size: number; gid: string; manager: string; club: string; date: string; note: string; vid: string; lang: string; theme: string; mode: string; ver: string; device: string; email: string }>(v);
    out.push({ source: 'support', id: r.gid, manager: r.manager, club: r.club, date: r.date, saved: r.at, url: r.url, size: r.size, device: r.device, email: r.email || undefined, note: r.note, vid: r.vid, lang: r.lang, theme: r.theme, mode: r.mode, ver: r.ver });
  }
  return out.sort((a, b) => b.saved.localeCompare(a.saved));
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
    const [names, rooms, careers, seasons, monthEntries, aiToday, aiYesterday, sgSeq, apps] = await Promise.all([
      scanKeys('name:*'), scanKeys('room:?????'), redis.zcard('lb:career'), redis.zcard('lb:season'), redis.zcard(`lb:month:${month}`),
      redis.get<number>(`ai:d:${day}`), redis.get<number>(`ai:d:${yesterday}`), redis.get<number>('sg:seq'), listApplications(),
    ]);
    const roomInfo = await Promise.all(rooms.slice(0, 300).map((r) => redis.hmget<Record<string, string>>(r, 'status', 'lastTurn')));
    const week = Date.now() - 7 * 86_400_000;
    const top = (await redis.zrange<string[]>('lb:career', 0, 4, { rev: true, withScores: true })) ?? [];
    const topRows = [];
    for (let i = 0; i + 1 < top.length; i += 2) {
      const c = await redis.hgetall<Record<string, string>>(`career:${top[i]}`);
      topRows.push({ career: top[i], points: Number(top[i + 1]), name: c?.name ?? '?', club: c?.club ?? '', league: c?.league ?? '' });
    }
    const [accounts, ncTotal, ncToday, ncYesterday, online] = await Promise.all([
      redis.scard('acct:all'), redis.get<number>('nc:total'), redis.get<number>(`nc:d:${day}`), redis.get<number>(`nc:d:${yesterday}`),
      redis.zcount('seen', Date.now() - 5 * 60_000, '+inf'),
    ]);
    return json({
      accounts,
      online,
      newCareers: { total: Number(ncTotal ?? 0), today: Number(ncToday ?? 0), yesterday: Number(ncYesterday ?? 0) },
      managers: names.length, careers, seasons, seasonsThisMonth: monthEntries,
      rooms: rooms.length, activeRooms: roomInfo.filter((x) => x?.lastTurn && Date.parse(x.lastTurn) > week).length,
      ai: { today: Number(aiToday ?? 0), yesterday: Number(aiYesterday ?? 0), cap: Number(process.env.AI_DAILY_CAP ?? 4000) },
      suggestions: Number(sgSeq ?? 0),
      applications: { total: apps.length, new: apps.filter((a) => a.status === 'new').length },
      top: topRows,
      config: { email: !!(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) },
    });
  }

  if (op === 'managers') {
    const names = await scanKeys('name:*', 3000);
    const pids = await Promise.all(names.map((n) => redis.get<string>(n)));
    const rows = await Promise.all(pids.map(async (pid) => {
      if (!pid) return null;
      const [p, careers] = await Promise.all([
        redis.hmget<Record<string, string>>(`prof:${pid}`, 'name', 'created', 'updated', 'motto'),
        redis.smembers(`prof:${pid}:careers`),
      ]);
      if (!p?.name) return null;
      const scores = await Promise.all(careers.map((c) => redis.zscore('lb:career', c)));
      const seasons = await Promise.all(careers.map((c) => redis.hget<number>(`career:${c}`, 'seasons')));
      return {
        pid, name: p.name, created: p.created ?? '', updated: p.updated ?? '',
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
  // fejl fra spillernes browsere (api/notify.ts op=error)
  if (op === 'errors') {
    const ids = (await redis.zrange<string[]>('err:list', 0, 199, { rev: true })) ?? [];
    const rows = (await Promise.all(ids.map((id) => redis.hgetall<Record<string, string | number>>(`err:${id}`)))).map((h, i) => (h ? { id: ids[i], ...h } : null)).filter(Boolean);
    return json({ rows });
  }
  // opdateringsmails: tilmeldte, frameldinger, svar på spørgsmålet i spillet og tidligere udsendelser
  if (op === 'mail') {
    const [subs, unsubs, prompt, sent] = await Promise.all([
      redis.hgetall<Record<string, Sub | string>>('news:subs'), redis.hgetall<Record<string, string>>('news:unsubs'),
      redis.hgetall<Record<string, number>>('news:prompt'), redis.lrange<string | Record<string, unknown>>('news:sent', 0, 19),
    ]);
    const rows = Object.entries(subs ?? {}).map(([email, v]) => ({ email, ...(typeof v === 'string' ? JSON.parse(v) as Sub : v) })).sort((a, b) => b.at.localeCompare(a.at));
    const un = Object.entries(unsubs ?? {}).map(([email, at]) => ({ email, at: String(at) })).sort((a, b) => b.at.localeCompare(a.at));
    return json({ subs: rows, unsubs: un, prompt: prompt ?? {}, sent: (sent ?? []).map((x) => (typeof x === 'string' ? JSON.parse(x) : x)), mail: !!process.env.RESEND_API_KEY, testTo: process.env.NOTIFY_EMAIL ?? '' });
  }

  // nye singleplayer-karrierer (logges af api/notify.ts)
  if (op === 'new-careers') {
    const raw = (await redis.lrange<unknown>('nc:list', 0, 999)) ?? [];
    const rows = raw.map((x) => { try { return typeof x === 'string' ? JSON.parse(x) : x; } catch { return null; } }).filter(Boolean) as { vid?: string; seen?: number }[];
    // sidst set (puls fra browseren) for hver karriere, der har et besøgs-id
    const vids = [...new Set(rows.map((r) => r.vid).filter((v): v is string => !!v))];
    const seen = vids.length ? ((await redis.zmscore('seen', vids)) ?? []) : [];
    const seenBy = new Map(vids.map((v, i) => [v, Number(seen[i] ?? 0)]));
    for (const r of rows) if (r.vid) r.seen = seenBy.get(r.vid) || undefined;
    // hvor langt hver karriere er nået (sidste puls fra spillet)
    const gids = [...new Set(rows.map((r) => (r as { gid?: string }).gid).filter((v): v is string => !!v))];
    const progs = gids.length ? ((await redis.hmget<Record<string, unknown>>('prog', ...gids)) ?? {}) : {};
    for (const r of rows as { gid?: string; prog?: unknown }[]) {
      const v = r.gid ? (progs as Record<string, unknown>)[r.gid] : null;
      if (v) r.prog = typeof v === 'string' ? JSON.parse(v) : v;
    }
    const days: Record<string, number> = {};
    for (let i = 0; i < 14; i++) days[new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)] = 0;
    const counts = await Promise.all(Object.keys(days).map((d) => redis.get<number>(`nc:d:${d}`)));
    Object.keys(days).forEach((d, i) => { days[d] = Number(counts[i] ?? 0); });
    const online = await redis.zcount('seen', Date.now() - 5 * 60_000, '+inf');
    // karrierer, der findes som gemt spil (konto eller sendt til udvikleren): kan åbnes i preview
    const saves = await allSaves();
    for (const r of rows as { gid?: string; save?: SaveRow }[]) { const s = r.gid ? saves.find((x) => x.id === r.gid) : undefined; if (s) r.save = s; }
    return json({ rows, days, online, now: Date.now() });
  }

  if (op === 'saves') return json({ saves: await allSaves() });

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

  // slet et spil sendt til udvikleren (rækken og filen)
  if (body.op === 'support-delete') {
    const url = clip(body.url, 500);
    const raw = (await redis.lrange<unknown>('support:list', 0, 199)) ?? [];
    for (const v of raw) if (parse<{ url: string }>(v).url === url) await redis.lrem('support:list', 0, typeof v === 'string' ? v : JSON.stringify(v));
    if (url.includes('.blob.vercel-storage.com/support/')) await del(url).catch(() => {});
    return json({ ok: true });
  }

  // fjern karrierer fra "New careers" (fx ejerens egne): alle med et af besøgs-id'erne, eller én række (tidspunkt + manager)
  // send en opdateringsmail: test = kun til NOTIFY_EMAIL (ejeren); ellers alle tilmeldte (evt. kun ét sprog)
  if (body.op === 'mail-preview') {
    const subject = clip(body.subject, 120), text = String(body.text ?? '').slice(0, 20000);
    return json(renderNews(subject, text, clip(body.lang, 2) || 'en', await unsubLink(redis, 'preview@example.com')));
  }
  if (body.op === 'mail-send') {
    const subject = clip(body.subject, 120), text = String(body.text ?? '').slice(0, 20000);
    if (!subject || !text.trim()) return json({ error: 'empty' }, 400);
    const lang = clip(body.lang, 2);
    let to: { email: string; lang: string }[];
    if (body.test) {
      const me = process.env.NOTIFY_EMAIL;
      if (!me) return json({ error: 'NOTIFY_EMAIL not set' }, 400);
      to = [{ email: me, lang: lang || 'en' }];
    } else {
      const subs = await redis.hgetall<Record<string, Sub | string>>('news:subs') ?? {};
      to = Object.entries(subs).map(([email, v]) => ({ email, lang: (typeof v === 'string' ? JSON.parse(v) as Sub : v).lang }))
        .filter((r) => !lang || r.lang === lang);
    }
    const res = await sendNews(redis, to, subject, text);
    if (!body.test) { await redis.lpush('news:sent', JSON.stringify({ at: new Date().toISOString(), subject, lang: lang || 'all', ...res })); await redis.ltrim('news:sent', 0, 49); }
    return json({ ok: true, ...res });
  }
  if (body.op === 'error-delete') {
    const ids: string[] = body.all ? ((await redis.zrange<string[]>('err:list', 0, -1)) ?? []) : [clip(body.id, 20)].filter(Boolean);
    if (ids.length) { await redis.zrem('err:list', ...(ids as [string, ...string[]])); await redis.del(...ids.map((x) => `err:${x}`)); }
    return json({ ok: true, deleted: ids.length });
  }
  if (body.op === 'nc-delete') {
    const vids = new Set((Array.isArray(body.vids) ? body.vids : []).map((v) => clip(v, 24)).filter(Boolean));
    const one = body.at ? { at: clip(body.at, 40), manager: clip(body.manager, 30) } : null;
    if (!vids.size && !one) return json({ error: 'missing' }, 400);
    const raw = (await redis.lrange<unknown>('nc:list', 0, 999)) ?? [];
    const parsed = raw.map((x) => { try { return typeof x === 'string' ? JSON.parse(x) : x; } catch { return null; } }) as ({ vid?: string; at?: string; manager?: string } | null)[];
    const keep: unknown[] = [], removed: { at?: string }[] = [];
    parsed.forEach((r, i) => {
      const hit = r && ((r.vid && vids.has(r.vid)) || (one && r.at === one.at && r.manager === one.manager));
      if (hit) removed.push(r!); else keep.push(raw[i]);
    });
    if (removed.length) {
      await redis.del('nc:list');
      if (keep.length) await redis.rpush('nc:list', ...keep.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))));
      const byDay = new Map<string, number>();
      for (const r of removed) if (r.at) byDay.set(r.at.slice(0, 10), (byDay.get(r.at.slice(0, 10)) ?? 0) + 1);
      await Promise.all([redis.decrby('nc:total', removed.length), ...[...byDay].map(([d, n]) => redis.decrby(`nc:d:${d}`, n))]);
    }
    return json({ ok: true, removed: removed.length });
  }

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
  // – fjernes fra alle lister (karriere, sæson, måned, liga) og blokeres, så næste indsendte sæson ikke sætter den på igen
  if (body.op === 'unrank') {
    const career = clip(body.career, 64);
    if (!career) return json({ error: 'career' }, 400);
    const scanAll = async (match: string) => {
      const out: string[] = [];
      let cursor: string | number = 0;
      do { const res: [string | number, string[]] = await redis.scan(cursor, { match, count: 500 }); out.push(...res[1]); cursor = res[0]; } while (String(cursor) !== '0');
      return out;
    };
    const seasons = (await scanAll(`sub:${career}:*`)).map((k) => k.slice(`sub:${career}:`.length));
    const members = seasons.map((x) => `${career}:${x}`);
    const boards = ['lb:season', ...(await scanAll('lb:month:*')), ...(await scanAll('lb:league:*'))];
    await redis.zrem('lb:career', career);
    if (members.length) await Promise.all(boards.map((b) => redis.zrem(b, ...(members as [string, ...string[]]))));
    await redis.sadd('lb:blocked', career);
    if ((await redis.get<string>('lb:leader')) === career) await redis.del('lb:leader');
    return json({ ok: true, seasons: members.length });
  }

  return json({ error: 'op' }, 400);
}
