import { LEAGUE_RULES } from './leagues';
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

import { setEconomy } from './econ';
import { cmPermitMove } from './cmPermit';
import { cmStaffStateMove } from './cmPlayerData';

/**
 * Admin-preview: en spillers gemte spil åbnet til fejlsøgning (Admin → Saves / New careers). Intet gemmes, og intet
 * sendes videre (ranglister, puls, fejlrapporter) – se save.ts, rank.ts, notify.ts og errors.ts. Nulstilles af setGame.
 */
let preview: { label: string; theme?: string; setup?: boolean } | null = null;
export const previewInfo = () => preview;
export function setPreview(p: { label: string; theme?: string; setup?: boolean } | null) { preview = p; }
/**
 * Nyt-spil-forløbet (ClassicStart.tsx): efter Select League(s) bygges en midlertidig verden, så Select Team viser klubbens ægte skærme (trup, kampe, General Info).
 * Intet gemmes eller sendes (som en admin-preview), og forsiden/startmenuen styrer stadig skærmen. setGame(…) afslutter forløbet.
 */
export const inSetup = () => !!preview?.setup;
export function setSetupGame(g: GameState) { setGame(g); preview = { label: 'setup', setup: true }; notify(); }

export function setGame(g: GameState | null) {
  preview = null;
  // ligaregler fra en importeret database (CM 01/02) skal kendes, før spillet simuleres
  if (g?.customRules) Object.assign(LEAGUE_RULES, g.customRules);
  G = g;
  // prisniveauet: nye spil med den originale 01/02-database spilles i 2001-priser (econ.ts)
  setEconomy(g?.econ);
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

/** cmMedia.ts registrerer sign_contract's moral (en direkte import giver en cirkulær import) */
export const signHooks: { onSign?: (g: GameState, p: Player) => void } = {};

/** Flyt spiller mellem klubber og hold indekset opdateret */
export function setClub(p: Player, club: number) {
  if (p.club) {
    const arr = squadIndex.get(p.club);
    if (arr) squadIndex.set(p.club, arr.filter((id) => id !== p.id));
  }
  const moved = p.club !== club;
  // ny klub = ny start: utilfredsheden over spilletid hører til den gamle klub (en nyindkøbt spiller stod ellers som
  // "utilfreds med sin spilletid" samme dag, han kom – ejerens fejlmelding 2026-11-10)
  if (moved && club) p.unhappy = 0;
  // originalen: statistikken arkiveres (0x7c5fe0) og en ny kontrakt starter (0x4cf720) – cmPlayerData.ts
  if (moved) { p.cmStats = undefined; p.cmContract = undefined; if (hasGame()) { cmPermitMove(gs(), p, club); cmStaffStateMove(gs(), p, p.club, club); } }
  p.club = club;
  // sign_contract 0x4cf720: en ny almindelig kontrakt (ikke leje) giver moralen +20 (cmMedia.ts)
  if (moved && club && !p.loan && hasGame()) signHooks.onSign?.(gs(), p);
  if (club) {
    let arr = squadIndex.get(club);
    if (!arr) squadIndex.set(club, (arr = []));
    arr.push(p.id);
  }
  // nyt trøjenummer ved klubskifte: det gamle, hvis det er ledigt – ellers et passende ledigt nummer
  if (moved) p.number = club ? pickNumber(p, club, p.number) : undefined;
}

/** Foretrukne trøjenumre pr. position (som de klassiske numre: 1 mål, 2-5 forsvar, 6-8 midtbane, 9-11 angreb) */
const PREFERRED: Record<string, number[]> = {
  GK: [1, 13, 12, 21, 25, 30, 31], DEF: [2, 3, 4, 5, 6, 12, 14, 15, 16, 22, 23, 24, 26], MID: [8, 6, 7, 4, 10, 14, 16, 17, 18, 19, 20, 21, 22],
  ATT: [9, 10, 11, 7, 18, 19, 20, 17, 27, 28, 29],
};
export function numberGroup(p: Player): keyof typeof PREFERRED {
  // POSITIONS: GK, SW, D, DM, M, AM, F, WB (se attributes.ts)
  const best = p.pos.indexOf(Math.max(...p.pos));
  return best === 0 ? 'GK' : best <= 2 || best === 7 ? 'DEF' : best <= 5 ? 'MID' : 'ATT';
}
/** Et ledigt nummer i klubben til spilleren (ønsket nummer først, så positionens numre, så det laveste ledige) */
export function pickNumber(p: Player, club: number, want?: number): number {
  const taken = new Set(squad(club).filter((x) => x.id !== p.id && x.number).map((x) => x.number!));
  if (want && want >= 1 && want <= 99 && !taken.has(want)) return want;
  for (const n of PREFERRED[numberGroup(p)]) if (!taken.has(n)) return n;
  for (let n = 2; n <= 99; n++) if (!taken.has(n)) return n;
  return 99;
}
/** Giv alle i truppen et unikt nummer (dubletter: den bedste spiller beholder nummeret) */
export function ensureNumbers(club: number) {
  const sq = squad(club).slice().sort((a, b) => b.ca - a.ca);
  const used = new Set<number>();
  const later: Player[] = [];
  for (const p of sq) {
    if (p.number && p.number <= 99 && !used.has(p.number)) used.add(p.number);
    else { p.number = undefined; later.push(p); }
  }
  for (const p of later) { p.number = pickNumber(p, club); used.add(p.number); }
}

/** Slås fra, mens et nyt spil bygges (numrene uddeles samlet bagefter med ensureNumbers) */
let autoNumbers = true;
export function setAutoNumbers(on: boolean) { autoNumbers = on; }

export function addPlayer(p: Player) {
  gs().players[p.id] = p;
  if (p.club) {
    let arr = squadIndex.get(p.club);
    if (!arr) squadIndex.set(p.club, (arr = []));
    arr.push(p.id);
    // nye spillere i truppen (ungdomsindtag, regens) får et ledigt nummer
    if (autoNumbers && !p.number) p.number = pickNumber(p, p.club);
  }
}

export function removePlayer(p: Player) {
  setClub(p, 0);
  delete gs().players[p.id];
}

// ---------- nyheder ----------

/** Er en begivenhed i disse klubber relevant for den aktive manager (ud fra nyhedsindstillingen)? */
export function newsRelevant(...clubIds: (number | undefined)[]): boolean {
  const g = gs();
  const me = g.clubs[g.userClub];
  const scope = g.options.newsScope ?? 'league';
  if (scope === 'world') return true;
  return clubIds.some((id) => {
    const c = id ? g.clubs[id] : undefined;
    if (!c) return false;
    if (id === g.userClub) return true;
    if (!me) return scope === 'nation';
    return scope === 'league' ? c.league === me.league : c.nation === me.nation;
  });
}

/** Ny besked til den aktive manager. all=true sender til alle menneskelige managere (multiplayer). */
export function addNews(n: Omit<NewsItem, 'id' | 'date' | 'read'> & { date?: string }, opts?: { all?: boolean }) {
  const g = gs();
  const muted = !!g.options.mutedNews?.includes(n.cat);
  const item = { id: g.nextId.news++, date: n.date ?? g.date, read: muted, ...n, ...(muted ? { muted: true } : {}) };
  g.news.unshift(item);
  if (g.news.length > 700) g.news.length = 700;
  if (opts?.all && g.humans) {
    for (const h of g.humans) {
      if (h.pid === g.active) continue;
      h.news.unshift({ ...item });
      if (h.news.length > 400) h.news.length = 400;
    }
  }
}
