// Klient til api/kofi.ts: månedens mål og heltelisten (offentlig, cachet 60 s på CDN'en).
export const KOFI_URL = 'https://ko-fi.com/cm0102reborn';
export interface KofiHero { name: string; eur: number; message?: string; at: string }
export interface KofiStatus { month: string; goal: number; raised: number; percent: number; anonymous: number; heroes: KofiHero[] }
export async function fetchKofi(): Promise<KofiStatus | null> {
  try { const r = await fetch('/api/kofi'); return r.ok ? await r.json() : null; } catch { return null; }
}
