import { rng } from './rng';
import type { GameState, NewsItem, Player } from './types';

// Global spiltilstand. UI abonnerer via subscribe() og læser med gs().
let G: GameState | null = null;
const listeners = new Set<() => void>();
let version = 0;

export function gs(): GameState {
  if (!G) throw new Error('Intet spil indlæst');
  return G;
}

export function hasGame(): boolean {
  return G !== null;
}

export function setGame(g: GameState | null) {
  G = g;
  if (g) rng.state = g.rng;
  rebuildIndexes();
  notify();
}

export function notify() {
  if (G) G.rng = rng.state;
  version++;
  for (const l of listeners) l();
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getVersion() {
  return version;
}

// ---------- indekser (genberegnes, gemmes ikke) ----------

let squadIndex = new Map<number, number[]>();
let fixturesByDate = new Map<string, number[]>();

export function rebuildIndexes() {
  squadIndex = new Map();
  fixturesByDate = new Map();
  if (!G) return;
  for (const p of Object.values(G.players)) {
    if (!p.club) continue;
    let arr = squadIndex.get(p.club);
    if (!arr) squadIndex.set(p.club, (arr = []));
    arr.push(p.id);
  }
  for (const f of Object.values(G.fixtures)) indexFixture(f.id, f.date);
}

export function indexFixture(id: number, date: string) {
  let arr = fixturesByDate.get(date);
  if (!arr) fixturesByDate.set(date, (arr = []));
  if (!arr.includes(id)) arr.push(id);
}

export function unindexFixture(id: number, date: string) {
  const arr = fixturesByDate.get(date);
  if (arr) fixturesByDate.set(date, arr.filter((x) => x !== id));
}

export function fixturesOn(date: string): number[] {
  return fixturesByDate.get(date) ?? [];
}

export function squad(clubId: number): Player[] {
  const g = gs();
  return (squadIndex.get(clubId) ?? []).map((id) => g.players[id]).filter((p) => p && p.club === clubId);
}

export function squadIds(clubId: number): number[] {
  return squadIndex.get(clubId) ?? [];
}

/** Flyt spiller mellem klubber og hold indekset opdateret */
export function setClub(p: Player, club: number) {
  if (p.club) {
    const arr = squadIndex.get(p.club);
    if (arr) squadIndex.set(p.club, arr.filter((id) => id !== p.id));
  }
  p.club = club;
  if (club) {
    let arr = squadIndex.get(club);
    if (!arr) squadIndex.set(club, (arr = []));
    arr.push(p.id);
  }
}

export function addPlayer(p: Player) {
  gs().players[p.id] = p;
  if (p.club) {
    let arr = squadIndex.get(p.club);
    if (!arr) squadIndex.set(p.club, (arr = []));
    arr.push(p.id);
  }
}

export function removePlayer(p: Player) {
  setClub(p, 0);
  delete gs().players[p.id];
}

// ---------- nyheder ----------

export function addNews(n: Omit<NewsItem, 'id' | 'date' | 'read'> & { date?: string }) {
  const g = gs();
  g.news.unshift({ id: g.nextId.news++, date: n.date ?? g.date, read: false, ...n });
  if (g.news.length > 400) g.news.length = 400;
}
