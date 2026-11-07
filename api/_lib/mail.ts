// Opdateringsmails ("nyhedsbrev"): kun til spillere, der selv har sat flueben (samtykke), med afmelding i hver mail.
//
// Redis: news:subs (hash e-mail → {lang, at}), news:unsubs (hash e-mail → tidspunkt), news:prompt (hash: tællere for
// spørgsmålet i spillet – asked/yes/later/no), news:sent (liste over udsendelser), news:secret (nøgle til afmeldingslinks).
// Mails sendes med Resend (RESEND_API_KEY; afsender MAIL_FROM_NEWS eller MAIL_FROM).
import type { Redis } from '@upstash/redis';
import { createHmac, randomBytes } from 'node:crypto';
import { SITE } from './discord.js';

export interface Sub { lang: string; at: string }

async function secret(redis: Redis): Promise<string> {
  const cur = await redis.get<string>('news:secret');
  if (cur) return cur;
  await redis.set('news:secret', randomBytes(32).toString('hex'), { nx: true });
  return (await redis.get<string>('news:secret'))!;
}

export async function unsubLink(redis: Redis, email: string): Promise<string> {
  const t = createHmac('sha256', await secret(redis)).update(email).digest('base64url').slice(0, 32);
  return `${SITE}/api/account?op=unsub&e=${encodeURIComponent(email)}&t=${t}`;
}
export async function validUnsub(redis: Redis, email: string, t: string): Promise<boolean> {
  return t.length === 32 && t === createHmac('sha256', await secret(redis)).update(email).digest('base64url').slice(0, 32);
}

export async function subscribe(redis: Redis, email: string, lang: string) {
  await redis.hset('news:subs', { [email]: JSON.stringify({ lang, at: new Date().toISOString() }) });
  await redis.hdel('news:unsubs', email);
}
export async function unsubscribe(redis: Redis, email: string) {
  const had = await redis.hdel('news:subs', email);
  if (had) await redis.hset('news:unsubs', { [email]: new Date().toISOString() });
  return had > 0;
}
export async function isSubscribed(redis: Redis, email: string) {
  return !!(await redis.hexists('news:subs', email));
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const FOOT: Record<string, string> = {
  da: 'Du får denne mail, fordi du har tilmeldt dig opdateringer fra CM Reborn.', en: "You're getting this email because you signed up for CM Reborn updates.",
};
const UNSUB: Record<string, string> = { da: 'Afmeld', en: 'Unsubscribe' };

/** Opdateringsmailen: overskrift, afsnit (tom linje = nyt afsnit, "- " = punkt), knap til spillet og afmelding */
export function renderNews(subject: string, text: string, lang: string, unsub: string): { html: string; text: string } {
  const blocks = text.trim().split(/\n\s*\n/).map((b) => {
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) return `<ul style="padding-left:20px;margin:0 0 16px">${lines.map((l) => `<li style="margin:4px 0">${esc(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
    return `<p style="font-size:15px;line-height:1.55;margin:0 0 16px">${esc(b).replace(/\n/g, '<br>')}</p>`;
  }).join('');
  const html = `<!doctype html><html><body style="margin:0;background:#070b16;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e6ebf5">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<div style="font-size:22px;font-weight:800;margin-bottom:20px">CM <span style="color:#facc15">Reborn</span></div>
<h1 style="font-size:20px;margin:0 0 16px">${esc(subject)}</h1>
${blocks}
<p style="margin:24px 0"><a href="${SITE}" style="display:inline-block;background:#facc15;color:#111;font-weight:700;text-decoration:none;padding:12px 26px;border-radius:999px">${lang === 'da' ? 'Spil nu' : 'Play now'}</a></p>
<p style="font-size:12px;color:#7d88a6">${FOOT[lang] ?? FOOT.en} <a href="${unsub}" style="color:#9aa6c6">${UNSUB[lang] ?? UNSUB.en}</a></p>
</div></body></html>`;
  return { html, text: `${subject}\n\n${text.trim()}\n\n${SITE}\n\n${UNSUB[lang] ?? UNSUB.en}: ${unsub}` };
}

/** Send til mange (Resends batch, 100 ad gangen) – hver mail har sit eget afmeldingslink */
export async function sendNews(redis: Redis, to: { email: string; lang: string }[], subject: string, text: string): Promise<{ sent: number; failed: number }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: 0, failed: to.length };
  const from = process.env.MAIL_FROM_NEWS || process.env.MAIL_FROM || 'CM Reborn <login@cm0102reborn.com>';
  let sent = 0, failed = 0;
  for (let i = 0; i < to.length; i += 100) {
    const chunk = await Promise.all(to.slice(i, i + 100).map(async (r) => {
      const link = await unsubLink(redis, r.email);
      const m = renderNews(subject, text, r.lang, link);
      return { from, to: [r.email], subject, html: m.html, text: m.text, headers: { 'List-Unsubscribe': `<${link}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } };
    }));
    const res = await fetch('https://api.resend.com/emails/batch', { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify(chunk) });
    if (res.ok) sent += chunk.length; else failed += chunk.length;
  }
  return { sent, failed };
}
