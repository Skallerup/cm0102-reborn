// Brugerkonto (api/account.ts): login med e-mail-link eller kode og gemte spil i skyen,
// så man kan fortsætte på en anden enhed. Uden login fungerer alt som før (kun lokalt).
import { upload } from '@vercel/blob/client';
import { getProfile, rankingAvailable, type RankProfile } from './rank';

const API = '/api/account';
const KEY = 'cm0102.account';
const PROFILE_KEY = 'cm0102.rankProfile';

export interface Account { sid: string; email: string }
export interface CloudSave { id: string; manager: string; club: string; date: string; saved: string; url: string; size: number; device: string }

let mailOn: Promise<boolean> | null = null;
/** Kan man logge ind? (Vercel-udgaven, og serveren kan sende login-mails) */
export function loginEnabled(): Promise<boolean> {
  if (!rankingAvailable()) return Promise.resolve(false);
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

/** Hent et gemt spil fra skyen */
export async function downloadCloudSave(s: CloudSave): Promise<Blob> {
  const r = await fetch(s.url, { cache: 'no-store' });
  if (!r.ok) throw new Error('download');
  return r.blob();
}
