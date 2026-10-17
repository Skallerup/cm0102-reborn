// Klient til de globale ranglister (api/rank.ts). Profilen (navn + hemmeligt token) gemmes i browseren.
// Kun singleplayer-sæsoner indsendes, og kun når ranglisterne findes (Vercel-udgaven).
import { gs, hasGame, notify } from '../game/state';
import { isMultiplayer } from '../game/humans';

export interface RankProfile { pid: string; token: string; name: string }
export interface RankRow { id: string; points: number; name: string; club: string; league: string; season?: number; seasons?: number }
export type Board = 'career' | 'season' | 'month' | 'league';

const KEY = 'cm0102.rankProfile';

export function rankingAvailable(): boolean {
  return import.meta.env.BASE_URL === '/' || import.meta.env.VITE_AI === '1';
}

export function getProfile(): RankProfile | null {
  try { const v = localStorage.getItem(KEY); return v ? (JSON.parse(v) as RankProfile) : null; } catch { return null; }
}

export async function createProfile(name: string): Promise<RankProfile | string> {
  try {
    const r = await fetch('/api/rank', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op: 'profile', name }) });
    const j = await r.json();
    if (!r.ok) return String(j.error ?? 'error');
    const prof = { pid: j.pid, token: j.token, name: j.name } as RankProfile;
    try { localStorage.setItem(KEY, JSON.stringify(prof)); } catch { /* ignorer */ }
    return prof;
  } catch {
    return 'network';
  }
}

let submitting = false;

/** Send sæsoner der ikke er indsendt endnu (kaldes efter sæsonskift og når ranglisten åbnes) */
export async function submitPending(): Promise<number> {
  if (submitting || !hasGame() || !rankingAvailable()) return 0;
  const g = gs();
  const prof = getProfile();
  if (!prof || isMultiplayer(g)) return 0;
  const pending = (g.manager.scores ?? []).filter((s) => !s.submitted);
  if (!pending.length) return 0;
  submitting = true;
  let sent = 0;
  try {
    for (const s of pending) {
      const r = await fetch('/api/rank', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ op: 'submit', pid: prof.pid, token: prof.token, career: g.id, season: s.season, points: s.points, lines: s.lines.map((l) => ({ key: l.key, pts: l.pts })), club: s.clubName, league: s.league, leagueName: s.leagueName }),
      }).catch(() => null);
      if (!r) break;
      if (r.ok || r.status === 400 || r.status === 403) { s.submitted = true; sent++; }
    }
  } finally {
    submitting = false;
  }
  if (sent) notify();
  return sent;
}

export async function fetchBoard(board: Board, league?: string): Promise<{ rows: RankRow[]; me: { rank: number; points: number } | null; total: number } | null> {
  if (!rankingAvailable()) return null;
  const career = hasGame() ? gs().id : '';
  try {
    const r = await fetch(`/api/rank?board=${board}&league=${encodeURIComponent(league ?? '')}&career=${encodeURIComponent(career)}`);
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}
