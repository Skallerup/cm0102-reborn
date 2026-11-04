// Klient til fællesskabets hub (api/hub.ts): Hall of Fame, databaserettelser, legender, følg/feed, skins og credits.
import { getProfile, rankingAvailable } from './rank';

export const hubAvailable = rankingAvailable;

export interface HallRow { id: number; pid: string; manager: string; title: string; club: string; league: string; db: string; seasons: number; trophies: number; created: string; updated: string; stars: number; comments: number; hidden?: boolean }
export interface HallSummary {
  manager: string; nation?: string; db: string; startSeason: number; season: number;
  history: { season: number; club: string; league: string; pos: number }[];
  trophies: { season: number; comp: string; club: string }[];
  players: { name: string; pos: string; apps: number; goals: number; club: string }[];
  rep: number; wins?: number; seasons: number;
}
export interface HallComment { pid: string; name: string; text: string; at: string }
export interface DbEdit { id: number; pid: string; name: string; db: 'cm' | 'original'; kind: 'player' | 'club'; target: number; targetName: string; field: string; old: string; value: string; reason: string; created: string; status: string; votes: number }
export interface FeedRow { kind: 'season' | 'hall' | 'edit'; text: string; id?: number; at: string; pid: string; name: string }
export interface SkinPack { id: number; pid: string; author: string; title: string; desc: string; created: string; status: string; images: string[] }
export interface Credit { id: string; name: string; role: string; link?: string; since?: string }

async function get<T>(q: string): Promise<T | null> {
  if (!hubAvailable()) return null;
  try { const r = await fetch(`/api/hub?${q}`); return r.ok ? await r.json() : null; } catch { return null; }
}
async function post<T = { ok: true }>(op: string, data: Record<string, unknown>): Promise<T | { error: string }> {
  const prof = getProfile();
  if (!prof) return { error: 'noProfile' };
  try {
    const r = await fetch('/api/hub', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op, pid: prof.pid, token: prof.token, ...data }) });
    const j = await r.json().catch(() => ({}));
    return r.ok ? j : { error: String(j.error ?? r.status) };
  } catch { return { error: 'network' }; }
}
const me = () => getProfile()?.pid ?? '';

export const hubConfig = () => get<{ discord: string | null; github: string }>('op=config');
export const listHall = (sort: 'new' | 'top') => get<{ rows: HallRow[] }>(`op=hall&sort=${sort}`);
export const getHall = (id: number) => get<{ entry: HallRow & { summary: HallSummary | null }; comments: HallComment[]; starred: boolean }>(`op=hall-one&id=${id}&pid=${me()}`);
export const shareCareer = (d: { career: string; title: string; club: string; league: string; db: string; seasons: number; trophies: number; summary: HallSummary }) => post<{ ok: true; id: number }>('hall-share', d);
export const starHall = (id: number, on: boolean) => post('hall-star', { id, on });
export const commentHall = (id: number, text: string) => post('hall-comment', { id, text });

export const listEdits = (status: 'open' | 'approved' | 'rejected') => get<{ rows: DbEdit[]; voted: number[] }>(`op=edits&status=${status}&pid=${me()}`);
export const proposeEdit = (d: Omit<DbEdit, 'id' | 'pid' | 'name' | 'created' | 'status' | 'votes'>) => post<{ ok: true; id: number }>('edit-propose', d);
export const voteEdit = (id: number, on: boolean) => post('edit-vote', { id, on });
/** Godkendte rettelser til en database (anvendes, når et nyt spil bygges) */
export const approvedEdits = (db: 'cm' | 'original') => get<{ edits: { kind: string; target: string; field: string; value: string }[] }>(`op=approved&db=${db}`);

export const legendCounts = (keys: string[]) => get<{ counts: Record<string, number>; mine: string[] }>(`op=legends&keys=${keys.join(',')}&pid=${me()}`);
export const rememberLegend = (key: string, on: boolean) => post<{ ok: true; count: number }>('legend', { key, on });

export const myFeed = () => get<{ rows: FeedRow[]; following: { pid: string; name: string }[] }>(`op=feed&pid=${me()}`);
export const followState = (who: string) => get<{ following: boolean; followers: number }>(`op=follows&pid=${me()}&who=${who}`);
export const follow = (who: string, on: boolean) => post('follow', { who, on });

export const listSkins = () => get<{ rows: SkinPack[] }>('op=skins');
export const createSkin = (title: string, desc: string) => post<{ ok: true; id: number }>('skin-create', { title, desc, license: true });
export const uploadSkinImage = (id: number, data: string) => post<{ ok: true; url: string; count: number }>('skin-image', { id, data });
export const submitSkin = (id: number) => post('skin-submit', { id });

export const listCredits = () => get<{ rows: Credit[] }>('op=credits');

/** Skalér et billede ned til en baggrund (højst 1280 px bred, JPEG) */
export function shrinkBackground(file: File, maxW = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      let q = 0.82, url = c.toDataURL('image/jpeg', q);
      while (url.length > 560_000 && q > 0.4) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
      URL.revokeObjectURL(img.src);
      resolve(url);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
