// Brugerkonti: login med e-mail (link eller 6-cifret kode – ingen adgangskode) og gemte spil i skyen,
// så man kan fortsætte på en anden enhed.
//
// Redis: acct:{email} (konto), acct:uid:{uid} → email, login:tok:{token} / login:code:{email} (15 min),
// sess:{sid} → uid (180 dage), saves:{uid} (gemte spil: id → metadata + Blob-URL).
// Selve spillene (≈4-5 MB gzip) uploades direkte fra browseren til Vercel Blob (op=upload).
// "Send mit spil til udvikleren" (frivilligt, også uden konto): op=upload med clientPayload { support: 1 } → support/…,
// derefter op=support → listen support:list (de seneste 200), som admin kan åbne i preview (api/admin.ts op=support).
// Mails sendes med Resend (RESEND_API_KEY; afsender MAIL_FROM, standard login@cm0102reborn.com).
// Opdateringsmails (samtykke, afmelding, spørgsmålet i spillet): op=news / unsub / prompt – se _lib/mail.ts.
import type { Redis } from '@upstash/redis';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { SITE } from './_lib/discord.js';
import { makeRedis } from './_lib/redis.js';
import { isSubscribed, subscribe, unsubscribe, validUnsub } from './_lib/mail.js';

const redis = makeRedis();
const LOGIN_TTL = 15 * 60;
const SESSION_TTL = 60 * 60 * 24 * 180;
const MAX_SAVES = 5;

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const rid = (n: number) => randomBytes(n).toString('base64url');
const normEmail = (e: unknown) => String(e ?? '').trim().toLowerCase().slice(0, 200);
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

interface SaveRec { id: string; manager: string; club: string; date: string; saved: string; url: string; size: number; device: string }

// ---------- mail ----------

const MAIL: Record<string, { subject: string; intro: string; button: string; code: string; ignore: string }> = {
  da: { subject: 'Log ind på CM Reborn', intro: 'Tryk på knappen for at logge ind. Linket virker i 15 minutter.', button: 'Log ind', code: 'Eller skriv koden i spillet:', ignore: 'Har du ikke bedt om at logge ind, kan du se bort fra denne mail.' },
  en: { subject: 'Sign in to CM Reborn', intro: 'Press the button to sign in. The link works for 15 minutes.', button: 'Sign in', code: 'Or enter this code in the game:', ignore: "If you didn't ask to sign in, you can ignore this email." },
  es: { subject: 'Inicia sesión en CM Reborn', intro: 'Pulsa el botón para iniciar sesión. El enlace funciona durante 15 minutos.', button: 'Iniciar sesión', code: 'O introduce este código en el juego:', ignore: 'Si no has pedido iniciar sesión, puedes ignorar este correo.' },
  fr: { subject: 'Connexion à CM Reborn', intro: 'Appuyez sur le bouton pour vous connecter. Le lien est valable 15 minutes.', button: 'Se connecter', code: 'Ou saisissez ce code dans le jeu :', ignore: "Si vous n'avez pas demandé à vous connecter, ignorez cet e-mail." },
  de: { subject: 'Bei CM Reborn anmelden', intro: 'Klicke auf den Button, um dich anzumelden. Der Link ist 15 Minuten gültig.', button: 'Anmelden', code: 'Oder gib diesen Code im Spiel ein:', ignore: 'Wenn du keine Anmeldung angefordert hast, kannst du diese E-Mail ignorieren.' },
  it: { subject: 'Accedi a CM Reborn', intro: 'Premi il pulsante per accedere. Il link è valido per 15 minuti.', button: 'Accedi', code: 'Oppure inserisci questo codice nel gioco:', ignore: "Se non hai chiesto di accedere, ignora questa email." },
  pt: { subject: 'Entrar no CM Reborn', intro: 'Toque no botão para entrar. O link funciona por 15 minutos.', button: 'Entrar', code: 'Ou digite este código no jogo:', ignore: 'Se você não pediu para entrar, ignore este e-mail.' },
  sv: { subject: 'Logga in på CM Reborn', intro: 'Tryck på knappen för att logga in. Länken gäller i 15 minuter.', button: 'Logga in', code: 'Eller skriv koden i spelet:', ignore: 'Har du inte bett om att logga in kan du bortse från det här mejlet.' },
  nb: { subject: 'Logg inn på CM Reborn', intro: 'Trykk på knappen for å logge inn. Lenken virker i 15 minutter.', button: 'Logg inn', code: 'Eller skriv koden i spillet:', ignore: 'Har du ikke bedt om å logge inn, kan du se bort fra denne e-posten.' },
  tr: { subject: "CM Reborn'a giriş yap", intro: 'Giriş yapmak için düğmeye bas. Bağlantı 15 dakika geçerlidir.', button: 'Giriş yap', code: 'Ya da bu kodu oyuna gir:', ignore: 'Giriş yapmak istemediysen bu e-postayı yok sayabilirsin.' },
};

async function sendLoginMail(to: string, lang: string, link: string, code: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const m = MAIL[lang] ?? MAIL.en;
  const html = `<!doctype html><html><body style="margin:0;background:#070b16;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e6ebf5">
<div style="max-width:480px;margin:0 auto;padding:32px 24px">
<div style="font-size:22px;font-weight:800;margin-bottom:20px">CM <span style="color:#facc15">Reborn</span></div>
<p style="font-size:15px;line-height:1.5">${m.intro}</p>
<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#facc15;color:#111;font-weight:700;text-decoration:none;padding:12px 26px;border-radius:999px">${m.button}</a></p>
<p style="font-size:14px;color:#b9c3dc">${m.code}</p>
<p style="font-size:30px;font-weight:800;letter-spacing:6px;margin:6px 0 24px">${code}</p>
<p style="font-size:12px;color:#7d88a6">${m.ignore}</p>
</div></body></html>`;
  const text = `${m.intro}\n\n${link}\n\n${m.code} ${code}\n\n${m.ignore}`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM || 'CM Reborn <login@cm0102reborn.com>', to: [to], subject: m.subject, html, text }),
  });
  return r.ok;
}

// ---------- konti og sessioner ----------

async function uidOf(request: Request): Promise<string | null> {
  const sid = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!sid || sid.length > 100) return null;
  const uid = await redis.get<string>(`sess:${sha(sid)}`);
  if (uid) await redis.expire(`sess:${sha(sid)}`, SESSION_TTL);
  return uid ?? null;
}

async function accountOf(uid: string) {
  const email = await redis.get<string>(`acct:uid:${uid}`);
  if (!email) return null;
  const a = await redis.hgetall<Record<string, unknown>>(`acct:${email}`);
  if (!a) return null;
  const profile = typeof a.profile === 'string' ? JSON.parse(a.profile || 'null') : a.profile ?? null;
  return { uid, email, created: String(a.created ?? ''), profile };
}

async function signIn(email: string) {
  let uid = await redis.hget<string>(`acct:${email}`, 'uid');
  if (!uid) {
    uid = rid(12);
    const created = await redis.hsetnx(`acct:${email}`, 'uid', uid);
    if (!created) uid = (await redis.hget<string>(`acct:${email}`, 'uid'))!;
    else {
      await redis.hset(`acct:${email}`, { email, created: new Date().toISOString() });
      await redis.set(`acct:uid:${uid}`, email);
      await redis.sadd('acct:all', uid);
    }
  }
  await redis.hset(`acct:${email}`, { lastLogin: new Date().toISOString() });
  const sid = rid(32);
  await redis.set(`sess:${sha(sid)}`, uid, { ex: SESSION_TTL });
  const acct = await accountOf(uid);
  return { sid, email, profile: acct?.profile ?? null };
}

async function limited(key: string, max: number, seconds: number): Promise<boolean> {
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, seconds);
  return n > max;
}

async function listSaves(uid: string): Promise<SaveRec[]> {
  const all = (await redis.hgetall<Record<string, unknown>>(`saves:${uid}`)) ?? {};
  return Object.values(all).map((v) => (typeof v === 'string' ? JSON.parse(v) : v) as SaveRec).sort((a, b) => b.saved.localeCompare(a.saved));
}

// ---------- upload af gemte spil direkte til Blob ----------

async function upload(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'x';
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const p = JSON.parse(clientPayload ?? '{}') as { sid?: string; support?: number };
        // et spil sendt til udvikleren (ingen konto nødvendig): kun under support/, højst 5 i timen pr. IP
        if (p.support) {
          if (!/^support\/[\w-]{1,100}\.json\.gz$/.test(pathname)) throw new Error('path');
          if (await limited(`rl:support:${ip}`, 5, 3600)) throw new Error('limit');
          return { allowedContentTypes: ['application/gzip', 'application/octet-stream'], maximumSizeInBytes: 40 * 1024 * 1024, addRandomSuffix: true };
        }
        const uid = p.sid ? await redis.get<string>(`sess:${sha(String(p.sid))}`) : null;
        if (!uid || !pathname.startsWith(`saves/${uid}/`)) throw new Error('auth');
        return { allowedContentTypes: ['application/gzip', 'application/octet-stream'], maximumSizeInBytes: 40 * 1024 * 1024, addRandomSuffix: true };
      },
    });
    return json(result);
  } catch (e) {
    return json({ error: String((e as Error).message) }, 400);
  }
}

// ---------- handlers ----------

export async function GET(request: Request) {
  const op = new URL(request.url).searchParams.get('op') ?? 'me';
  // er login slået til? (kræver en mail-nøgle)
  if (op === 'config') return json({ mail: !!process.env.RESEND_API_KEY });
  // afmeldingslinket i opdateringsmails (virker uden login)
  if (op === 'unsub') return unsubPage(request);
  const uid = await uidOf(request);
  if (!uid) return json({ error: 'auth' }, 401);
  if (op === 'me') {
    const a = await accountOf(uid);
    if (!a) return json({ error: 'auth' }, 401);
    return json({ uid, email: a.email, profile: a.profile, saves: await listSaves(uid), news: await isSubscribed(redis, a.email) });
  }
  if (op === 'saves') return json({ saves: await listSaves(uid) });
  return json({ error: 'op' }, 400);
}

export async function POST(request: Request) {
  const op = new URL(request.url).searchParams.get('op') ?? '';
  if (op === 'upload') return upload(request);
  // mailprogrammers "afmeld med ét klik" (List-Unsubscribe-Post) poster til samme link
  if (op === 'unsub') return unsubPage(request);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: 'bad-json' }, 400); }
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'x';

  switch (op) {
    // et spil sendt til udvikleren (efter upload til support/): registreres, så admin kan åbne det
    case 'support': {
      const url = String(body.url ?? '');
      if (!/^https:\/\/[\w.-]+\.blob\.vercel-storage\.com\/support\//.test(url)) return json({ error: 'url' }, 400);
      if (await limited(`rl:support-commit:${ip}`, 10, 3600)) return json({ error: 'limit' }, 429);
      const c = (v: unknown, n: number) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, n);
      const rec = {
        at: new Date().toISOString(), url, size: Number(body.size) || 0, vid: c(body.vid, 40), gid: c(body.gid, 60), manager: c(body.manager, 60),
        club: c(body.club, 60), date: c(body.date, 10), note: c(body.note, 1000), lang: c(body.lang, 5), theme: c(body.theme, 10), mode: c(body.mode, 10),
        ver: c(body.ver, 20), device: c(body.device, 60), email: c(body.email, 200),
      };
      await redis.lpush('support:list', JSON.stringify(rec));
      await redis.ltrim('support:list', 0, 199);
      return json({ ok: true });
    }
    // spørgsmålet i spillet efter første sæson: kun tællere (ingen personlige data)
    case 'prompt': {
      const a = String(body.answer ?? '');
      if (!['asked', 'yes', 'later', 'no'].includes(a)) return json({ error: 'answer' }, 400);
      if (await limited(`rl:prompt:${ip}`, 20, 3600)) return json({ ok: true });
      await redis.hincrby('news:prompt', a, 1);
      return json({ ok: true });
    }
    case 'request': {
      const email = normEmail(body.email);
      if (!validEmail(email)) return json({ error: 'email' }, 400);
      if (await limited(`rl:login:ip:${ip}`, 10, 3600) || await limited(`rl:login:mail:${email}`, 5, 3600)) return json({ error: 'limit' }, 429);
      const token = rid(24);
      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      await redis.set(`login:tok:${sha(token)}`, email, { ex: LOGIN_TTL });
      await redis.set(`login:code:${email}`, JSON.stringify({ code: sha(code), tries: 0 }), { ex: LOGIN_TTL });
      const lang = String(body.lang ?? 'en').slice(0, 2);
      const ok = await sendLoginMail(email, lang, `${SITE}/?login=${token}`, code);
      if (!ok) return json({ error: 'mail' }, 503);
      return json({ ok: true });
    }
    case 'verify': {
      let email = '';
      if (body.token) {
        const k = `login:tok:${sha(String(body.token))}`;
        email = (await redis.get<string>(k)) ?? '';
        if (email) await redis.del(k);
      } else {
        email = normEmail(body.email);
        if (await limited(`rl:verify:ip:${ip}`, 30, 3600)) return json({ error: 'limit' }, 429);
        const raw = await redis.get<string | { code: string; tries: number }>(`login:code:${email}`);
        const rec = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) as { code: string; tries: number } : null;
        if (!rec || rec.tries >= 5) return json({ error: 'expired' }, 400);
        if (rec.code !== sha(String(body.code ?? '').replace(/\D/g, ''))) {
          await redis.set(`login:code:${email}`, JSON.stringify({ ...rec, tries: rec.tries + 1 }), { keepTtl: true });
          return json({ error: 'code' }, 400);
        }
        await redis.del(`login:code:${email}`);
      }
      if (!email) return json({ error: 'expired' }, 400);
      await redis.del(`login:code:${email}`);
      return json(await signIn(email));
    }
  }

  const uid = await uidOf(request);
  if (!uid) return json({ error: 'auth' }, 401);
  switch (op) {
    // opdateringsmails til og fra (kræver login, så e-mailen er bekræftet)
    case 'news': {
      const email = await redis.get<string>(`acct:uid:${uid}`);
      if (!email) return json({ error: 'auth' }, 401);
      if (body.on === true) await subscribe(redis, email, String(body.lang ?? 'en').slice(0, 2));
      else await unsubscribe(redis, email);
      return json({ ok: true, news: body.on === true });
    }
    case 'logout': {
      const sid = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
      await redis.del(`sess:${sha(sid)}`);
      return json({ ok: true });
    }
    case 'profile': {
      // ranglisteprofilen følger kontoen (kun hvis kontoen ikke har én i forvejen, medmindre force)
      const p = body.profile as { pid?: string; token?: string; name?: string } | undefined;
      if (!p?.pid || !p.token) return json({ error: 'missing' }, 400);
      const email = await redis.get<string>(`acct:uid:${uid}`);
      if (!email) return json({ error: 'auth' }, 401);
      const has = await redis.hget(`acct:${email}`, 'profile');
      if (!has || body.force) await redis.hset(`acct:${email}`, { profile: JSON.stringify({ pid: p.pid, token: p.token, name: String(p.name ?? '').slice(0, 40) }) });
      const a = await accountOf(uid);
      return json({ profile: a?.profile ?? null });
    }
    case 'save-commit': {
      const m = body.meta as Partial<SaveRec> | undefined;
      const url = String(body.url ?? '');
      if (!m?.id || !url.includes('.blob.vercel-storage.com/') || !url.includes(`/saves/${uid}/`)) return json({ error: 'missing' }, 400);
      const rec: SaveRec = {
        id: String(m.id).slice(0, 60), manager: String(m.manager ?? '').slice(0, 60), club: String(m.club ?? '').slice(0, 60),
        date: String(m.date ?? '').slice(0, 10), saved: String(m.saved ?? new Date().toISOString()).slice(0, 30), url,
        size: Number(body.size) || 0, device: String(body.device ?? '').slice(0, 60),
      };
      const saves = await listSaves(uid);
      const old = saves.find((s) => s.id === rec.id);
      await redis.hset(`saves:${uid}`, { [rec.id]: JSON.stringify(rec) });
      const drop = [old?.url, ...saves.filter((s) => s.id !== rec.id).slice(MAX_SAVES - 1).map((s) => s.url)].filter((u): u is string => !!u && u !== url);
      for (const s of saves.filter((s) => s.id !== rec.id).slice(MAX_SAVES - 1)) await redis.hdel(`saves:${uid}`, s.id);
      if (drop.length) await del(drop).catch(() => {});
      return json({ ok: true, saves: await listSaves(uid) });
    }
    case 'save-delete': {
      const id = String(body.id ?? '');
      const s = (await listSaves(uid)).find((x) => x.id === id);
      if (s) { await redis.hdel(`saves:${uid}`, id); await del(s.url).catch(() => {}); }
      return json({ ok: true, saves: await listSaves(uid) });
    }
    case 'delete-account': {
      const email = await redis.get<string>(`acct:uid:${uid}`);
      const saves = await listSaves(uid);
      if (saves.length) await del(saves.map((s) => s.url)).catch(() => {});
      await redis.del(`saves:${uid}`, `acct:uid:${uid}`, ...(email ? [`acct:${email}`] : []));
      if (email) await redis.hdel('news:subs', email);
      await redis.srem('acct:all', uid);
      const sid = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
      await redis.del(`sess:${sha(sid)}`);
      return json({ ok: true });
    }
  }
  return json({ error: 'op' }, 400);
}

/** Afmelding fra opdateringsmails (linket i hver mail) – en lille side på dansk eller engelsk */
async function unsubPage(request: Request): Promise<Response> {
  const u = new URL(request.url);
  const email = normEmail(u.searchParams.get('e'));
  const ok = !!email && await validUnsub(redis, email, String(u.searchParams.get('t') ?? ''));
  if (ok) await unsubscribe(redis, email);
  const da = (request.headers.get('accept-language') ?? '').toLowerCase().startsWith('da');
  const msg = ok ? (da ? 'Du er nu afmeldt opdateringsmails fra CM Reborn.' : "You've been unsubscribed from CM Reborn updates.")
    : (da ? 'Linket er ugyldigt.' : 'The link is not valid.');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CM Reborn</title></head>
<body style="margin:0;background:#070b16;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e6ebf5"><div style="max-width:480px;margin:0 auto;padding:48px 24px">
<div style="font-size:22px;font-weight:800;margin-bottom:20px">CM <span style="color:#facc15">Reborn</span></div><p style="font-size:16px">${msg}</p>
<p><a href="${SITE}" style="color:#facc15">${da ? 'Til spillet' : 'Back to the game'}</a></p></div></body></html>`;
  return new Response(html, { status: ok ? 200 : 400, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
