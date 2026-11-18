// Ko-fi: donationer (webhook) og offentlig målbar/helteliste (GET).
//
// POST: Ko-fi sender application/x-www-form-urlencoded med feltet `data` = JSON. `verification_token` tjekkes mod env KOFI_VERIFY_TOKEN
//   (hemmelig – står kun i Vercel; aldrig i kode eller log). Idempotent på kofi_transaction_id/message_id (SET NX).
// Valuta: månedens mål er i EUR. EUR tæller 1:1; andre valutaer omregnes groft med faste kurser (RATES – et mål, ikke bogføring).
//   Ukendt valuta tæller 0 € (men støtten vises stadig). Beløb gemmes som hele cent i EUR.
// Støtter: kun visningsnavn og – hvis is_public – beskeden. Aldrig e-mail. is_public=false → vises som "Anonym"/"Anonymous" (klienten oversætter).
import { makeRedis } from './_lib/redis.js';

const redis = makeRedis();

export const GOAL_EUR = 150;
/** Grov omregning til EUR (1 enhed → EUR) */
export const RATES: Record<string, number> = { EUR: 1, USD: 0.92, GBP: 1.17, DKK: 0.134, SEK: 0.088, NOK: 0.086, CAD: 0.67, AUD: 0.6, CHF: 1.05, PLN: 0.23, JPY: 0.006 };
const MAX_LIST = 300;

const json = (body: unknown, status = 200, cache = 'no-store') => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': cache } });
const month = (d = new Date()) => d.toISOString().slice(0, 7);
const clean = (v: unknown, max: number) => String(v ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

function sameToken(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export function toEurCents(amount: unknown, currency: unknown): number {
  const a = Number.parseFloat(String(amount ?? '').replace(',', '.'));
  const rate = RATES[String(currency ?? 'EUR').toUpperCase()];
  if (!Number.isFinite(a) || a <= 0 || !rate) return 0;
  return Math.round(a * rate * 100);
}

interface Entry { n: string | null; m?: string; c: number; t: string }

export async function POST(request: Request) {
  let raw: Record<string, unknown> | null = null;
  try {
    const text = await request.text();
    const ct = request.headers.get('content-type') ?? '';
    const data = ct.includes('json') ? text : new URLSearchParams(text).get('data');
    raw = data ? JSON.parse(data) : null;
  } catch { raw = null; }
  if (!raw || typeof raw !== 'object') return json({ error: 'bad' }, 400);
  if (!sameToken(String(raw.verification_token ?? ''), process.env.KOFI_VERIFY_TOKEN ?? '')) return json({ error: 'unauthorized' }, 401);

  const id = clean(raw.kofi_transaction_id || raw.message_id, 80);
  if (!id) return json({ error: 'bad' }, 400);
  // idempotens: samme transaktion tælles kun én gang (Ko-fi gensender ved fejl)
  const first = await redis.set(`kofi:seen:${id}`, '1', { nx: true, ex: 60 * 60 * 24 * 90 });
  if (first === null) return json({ ok: true, duplicate: true });

  try {
    const cents = toEurCents(raw.amount, raw.currency);
    const pub = raw.is_public === true || raw.is_public === 'true';
    const entry: Entry = { n: pub ? clean(raw.from_name, 40) || null : null, c: cents, t: new Date().toISOString() };
    const msg = pub ? clean(raw.message, 200) : '';
    if (msg) entry.m = msg;
    const key = month();
    if (cents > 0) await redis.incrby(`kofi:sum:${key}`, cents);
    await redis.rpush(`kofi:list:${key}`, JSON.stringify(entry));
    await redis.ltrim(`kofi:list:${key}`, -MAX_LIST, -1);
    return json({ ok: true });
  } catch {
    await redis.del(`kofi:seen:${id}`); // lad Ko-fi prøve igen
    return json({ error: 'store' }, 500);
  }
}

export interface KofiHero { name: string; eur: number; message?: string; at: string }
export interface KofiStatus { month: string; goal: number; raised: number; percent: number; anonymous: number; heroes: KofiHero[] }

/** Offentlig: månedens mål, indsamlet, procent og heltelisten (pr. navn, nyeste støtte først). Anonyme tælles kun i `anonymous` + beløbet. */
export async function GET() {
  const key = month();
  const [sum, list] = await Promise.all([redis.get<number | string>(`kofi:sum:${key}`), redis.lrange(`kofi:list:${key}`, 0, MAX_LIST - 1)]);
  const raised = Math.round(Number(sum ?? 0)) / 100;
  const byName = new Map<string, KofiHero>();
  let anonymous = 0;
  for (const it of [...list].reverse()) {
    const e: Entry = typeof it === 'string' ? JSON.parse(it) : (it as Entry);
    if (!e.n) { anonymous++; continue; }
    const h = byName.get(e.n);
    if (h) { h.eur += e.c / 100; if (!h.message && e.m) h.message = e.m; } else byName.set(e.n, { name: e.n, eur: e.c / 100, message: e.m, at: e.t });
  }
  const heroes = [...byName.values()].map((h) => ({ ...h, eur: Math.round(h.eur * 100) / 100 }));
  const body: KofiStatus = { month: key, goal: GOAL_EUR, raised, percent: Math.min(100, Math.round((raised / GOAL_EUR) * 100)), anonymous, heroes };
  return json(body, 200, 'public, max-age=0, s-maxage=60, stale-while-revalidate=240');
}
