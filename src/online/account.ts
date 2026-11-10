// Brugerkonto (api/account.ts): login med e-mail-link eller kode og gemte spil i skyen,
// så man kan fortsætte på en anden enhed. Uden login fungerer alt som før (kun lokalt).
import { upload } from '@vercel/blob/client';
import { getProfile, rankingAvailable, type RankProfile } from './rank';
import { gs } from '../game/state';
import { serializeState } from '../game/snapshot';
import { getTheme } from '../ui/theme';
import { APP_VERSION } from '../ui/changelogData';
import { visitorId } from './notify';

const API = '/api/account';
const KEY = 'cm0102.account';
const PROFILE_KEY = 'cm0102.rankProfile';

export interface Account { sid: string; email: string }
export interface CloudSave { id: string; manager: string; club: string; date: string; saved: string; url: string; size: number; device: string }

let mailOn: Promise<boolean> | null = null;
/** Kan man logge ind? (Vercel-udgaven, og serveren kan sende login-mails) */
// kun i udviklingstilstand: ende-til-ende-testen slår login til med cm0102.forceLogin (API'et efterlignes dér)
const devLogin = () => { try { return import.meta.env.DEV && localStorage.getItem('cm0102.forceLogin') === '1'; } catch { return false; } };
export function loginEnabled(): Promise<boolean> {
  if (!rankingAvailable() && !devLogin()) return Promise.resolve(false);
  mailOn ??= fetch(`${API}?op=config`).then((r) => r.json()).then((j) => !!j.mail).catch(() => false);
  return mailOn;
}

export function getAccount(): Account | null {
  try { const v = localStorage.getItem(KEY); return v ? (JSON.parse(v) as Account) : null; } catch { return null; }
}

function setAccount(a: Account | null) {
  try { if (a) localStorage.setItem(KEY, JSON.stringify(a)); else localStorage.removeItem(KEY); } catch { /* ignorer */ }
  window.dispatchEvent(new Event('cm-account'));
}

async function call<T>(op: string, body?: unknown, method: 'GET' | 'POST' = 'POST'): Promise<T> {
  const a = getAccount();
  const r = await fetch(`${API}?op=${op}`, {
    method,
    headers: { 'content-type': 'application/json', ...(a ? { authorization: `Bearer ${a.sid}` } : {}) },
    body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && a) setAccount(null); // sessionen er udløbet eller logget ud andetsteds
  if (!r.ok) throw new Error(String((j as { error?: string }).error ?? r.status));
  return j as T;
}

/** Send login-mail (link + 6-cifret kode) */
export async function requestLogin(email: string, lang: string): Promise<void> {
  await call('request', { email, lang });
}

/** Log ind med linkets token eller e-mail + kode */
export async function verifyLogin(input: { token: string } | { email: string; code: string }): Promise<Account> {
  const r = await call<{ sid: string; email: string; profile: RankProfile | null }>('verify', input);
  const acct = { sid: r.sid, email: r.email };
  setAccount(acct);
  await linkProfile(r.profile);
  return acct;
}

/** Ranglisteprofilen følger kontoen: hent kontoens profil, eller giv kontoen denne enheds profil */
async function linkProfile(server: RankProfile | null) {
  if (server?.pid) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(server)); } catch { /* ignorer */ }
    return;
  }
  const local = getProfile();
  if (local) await call('profile', { profile: local }).catch(() => {});
}

/** Kaldes når en ranglisteprofil oprettes, mens man er logget ind */
export function profileCreated(p: RankProfile) {
  if (getAccount()) void call('profile', { profile: p }).catch(() => {});
}

export async function logout(): Promise<void> {
  await call('logout').catch(() => {});
  setAccount(null);
}

export async function deleteAccount(): Promise<void> {
  await call('delete-account');
  setAccount(null);
}

export async function cloudSaves(): Promise<CloudSave[]> {
  if (!getAccount()) return [];
  return (await call<{ saves: CloudSave[] }>('saves', undefined, 'GET')).saves;
}

export async function deleteCloudSave(id: string): Promise<void> {
  await call('save-delete', { id });
}

function deviceName(): string {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '';
  const br = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '';
  return [br, os].filter(Boolean).join(' · ');
}

/** Upload et gemt spil til skyen (direkte til Vercel Blob) og registrér det på kontoen */
export async function uploadCloudSave(meta: { id: string; manager: string; club: string; date: string; saved: string }, blob: Blob): Promise<void> {
  const a = getAccount();
  if (!a) return;
  const uid = await myUid();
  const res = await upload(`saves/${uid}/${meta.id}.json.gz`, blob, {
    access: 'public',
    handleUploadUrl: `${API}?op=upload`,
    clientPayload: JSON.stringify({ sid: a.sid }),
    contentType: 'application/gzip',
    multipart: blob.size > 4 * 1024 * 1024,
  });
  await call('save-commit', { meta, url: res.url, size: blob.size, device: deviceName() });
}

let uidCache: { sid: string; uid: string } | null = null;
async function myUid(): Promise<string> {
  const a = getAccount()!;
  if (uidCache?.sid === a.sid) return uidCache.uid;
  const r = await call<{ uid: string }>('me', undefined, 'GET');
  uidCache = { sid: a.sid, uid: r.uid };
  return r.uid;
}

/**
 * "Send mit spil til udvikleren" (frivilligt, virker uden konto): det åbne spil uploades til Vercel Blob (support/…)
 * og registreres med en note, så udvikleren kan åbne det i preview og se præcis det, spilleren ser.
 */
export async function sendGameToDeveloper(note: string, email?: string): Promise<void> {
  const g = gs();
  const blob = await serializeState(g);
  const vid = visitorId() || 'anon';
  const res = await upload(`support/${vid.replace(/[^\w-]/g, '')}-${g.id.replace(/[^\w-]/g, '')}.json.gz`, blob, {
    access: 'public',
    handleUploadUrl: `${API}?op=upload`,
    clientPayload: JSON.stringify({ support: 1 }),
    contentType: 'application/gzip',
    multipart: blob.size > 4 * 1024 * 1024,
  });
  const r = await fetch(`${API}?op=support`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: res.url, size: blob.size, vid, gid: g.id, manager: g.manager.name, club: g.clubs[g.userClub]?.name ?? '', date: g.date, note,
      email: email ?? getAccount()?.email ?? '', lang: g.lang, theme: getTheme() === 'retro' ? 'classic' : 'modern', mode: g.options.mode ?? 'extended', ver: APP_VERSION, device: deviceName() }),
  });
  if (!r.ok) throw new Error('support');
}

/** Hent et gemt spil fra skyen */
export async function downloadCloudSave(s: CloudSave): Promise<Blob> {
  const r = await fetch(s.url, { cache: 'no-store' });
  if (!r.ok) throw new Error('download');
  return r.blob();
}

// ---------- opdateringsmails (samtykke) ----------

/** Er kontoen tilmeldt opdateringsmails? (null = ikke logget ind eller offline) */
export async function newsStatus(): Promise<boolean | null> {
  if (!getAccount()) return null;
  try { return !!(await call<{ news?: boolean }>('me', undefined, 'GET')).news; } catch { return null; }
}
/** Til- eller frameld opdateringsmails (kræver login – e-mailen er bekræftet med koden) */
export async function setNews(on: boolean, lang: string): Promise<void> {
  await call('news', { on, lang });
}
/** Tæl svaret på spørgsmålet i spillet (ingen personlige data) */
export function countPrompt(answer: 'asked' | 'yes' | 'later' | 'no') {
  if (!rankingAvailable() && !devLogin()) return;
  void fetch(`${API}?op=prompt`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answer }) }).catch(() => {});
}
