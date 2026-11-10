// Gem/indlæs i IndexedDB som gzip-komprimeret JSON (≈4-5 MB pr. save).
import { addMissingConference } from './competitions';
import { fixClubName } from './data/clubNames';
import { cmDatabase } from './newgame';
import { del, get, keys, set } from 'idb-keyval';
import { gs, setGame, addNews, notify, ensureNumbers, previewInfo, setPreview } from './state';
import { splitReserves } from './reserves';
import { deserializeState, serializeState } from './snapshot';
import type { GameState, Player } from './types';

export interface SaveMeta {
  id: string;
  manager: string;
  club: string;
  date: string;
  saved: string;
}

export async function serialize(g: GameState): Promise<Blob> {
  return serializeState(g);
}

// gem også i skyen, når man er logget ind (sættes af src/online/cloudSync.ts – motoren kender ikke kontoen)
type CloudHook = (meta: SaveMeta, blob: Blob, force: boolean) => void;
let cloudHook: CloudHook | null = null;
export function setCloudHook(h: CloudHook | null) { cloudHook = h; }

/** Gem lokalt (og i skyen: altid ved cloud=true, ellers højst hvert 5. minut) */
export async function saveGame(opts?: { cloud?: boolean }): Promise<SaveMeta> {
  const g = gs();
  // online-spil gemmes på serveren – en lokal kopi ville blive genoptaget i stedet for det rigtige spil
  if (g.humans?.length) throw new Error('online');
  const meta0 = { id: g.id, manager: g.manager.name, club: g.clubs[g.userClub]?.name ?? '—', date: g.date, saved: new Date().toISOString() };
  // admin-preview af en andens spil: gem aldrig (hverken lokalt eller i skyen)
  if (previewInfo()) return meta0;
  const blob = await serialize(g);
  const meta: SaveMeta = {
    id: g.id,
    manager: g.manager.name,
    club: g.clubs[g.userClub]?.name ?? '—',
    date: g.date,
    saved: new Date().toISOString(),
  };
  await set(`save:${g.id}`, blob);
  await set(`meta:${g.id}`, meta);
  rememberLast({ kind: 'local', id: g.id });
  cloudHook?.(meta, blob, !!opts?.cloud);
  return meta;
}

/** Læg et spil hentet fra skyen i den lokale database (overskriver en ældre lokal kopi) */
export async function storeSave(meta: SaveMeta, blob: Blob) {
  await set(`save:${meta.id}`, blob);
  await set(`meta:${meta.id}`, meta);
}

export async function getSaveMeta(id: string): Promise<SaveMeta | undefined> {
  return get<SaveMeta>(`meta:${id}`);
}

// ---------- seneste spil (så en genindlæsning fortsætter hvor man slap) ----------

export type LastGame = { kind: 'local'; id: string } | { kind: 'online'; code: string };
const LAST_KEY = 'cm0102.last';

export function rememberLast(l: LastGame) {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(l)); } catch { /* ignore */ }
}

export function getLast(): LastGame | null {
  try { return JSON.parse(localStorage.getItem(LAST_KEY) ?? 'null') as LastGame | null; } catch { return null; }
}

export function forgetLast() {
  try { localStorage.removeItem(LAST_KEY); } catch { /* ignore */ }
}

// ---------- autogem ----------

let timer: ReturnType<typeof setTimeout> | null = null;
let saving = false;
let dirty = false;

/** Gem kort efter ændringer (debounced), så intet går tabt ved genindlæsning */
export function scheduleAutosave(delay = 2500) {
  dirty = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void flushAutosave(); }, delay);
}

export async function flushAutosave() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!dirty || saving) return;
  saving = true;
  dirty = false;
  try { await saveGame(); } catch { dirty = true; } finally { saving = false; }
}

export async function listSaves(): Promise<SaveMeta[]> {
  const all = (await keys()) as string[];
  const metas = await Promise.all(all.filter((k) => k.startsWith('meta:')).map((k) => get<SaveMeta>(k)));
  return (metas.filter(Boolean) as SaveMeta[]).sort((a, b) => b.saved.localeCompare(a.saved));
}

/** Trøjenumre i gemte spil fra før Squad Numbers (og efter et evt. hentet sæt fra databasen) */
function ensureAllNumbers() {
  const g = gs();
  for (const c of Object.values(g.clubs)) ensureNumbers(c.id);
}

/** Opgradér gemte spil fra ældre versioner (nye turneringer m.m.) */
export function upgradeLoaded() {
  repairInjuryWave();
  splitReservesOnce();
  const g = gs();
  if (addMissingConference()) {
    const club = g.clubs[g.userClub];
    if (club && g.comps.UECL?.clubs.includes(club.id)) addNews({ cat: 'general', key: 'news.ueclQualified', params: { club: club.name } });
    notify();
  }
}

/**
 * Ret stadionkapaciteten i gemte spil fra CM-databaserne: en fejl i indlæsningen af stadium.dat gav
 * alle klubber loftet 120.000 pladser. Kun klubber med præcis 120.000 rettes (egne udvidelser bevares).
 * Samme tur: stadionnavne ("<klub> Stadium" → det rigtige navn fra stadium.dat).
 */
/** Ret forkert stavede klubnavne i gemte spil fra CM-databaserne (fx "Bröndby IF", "FC Copenhagen") */
/**
 * Engangsrettelse (2026-11-07): før restitutionen blev rettet (+9 + NF/2 pr. dag) gav originalens knock-regel op til 10 skader
 * i én kamp, så mange klubber i gamle gem har en halv trup på skadeslisten. Klubber med mere end 5 skadede beholder kun de 3
 * længste skader (højst 30 dage); resten er klar igen.
 */
function repairInjuryWave() {
  const g = gs();
  if (g.fixes?.includes('injuryWave')) return;
  const byClub = new Map<number, Player[]>();
  for (const p of Object.values(g.players)) if (p.club && p.injury && p.injury.key !== 'awol') byClub.set(p.club, [...(byClub.get(p.club) ?? []), p]);
  for (const list of byClub.values()) {
    if (list.length <= 5) continue;
    list.sort((a, b) => b.injury!.days - a.injury!.days);
    list.forEach((p, i) => { if (i >= 3) p.injury = null; else p.injury!.days = Math.min(p.injury!.days, 30); });
  }
  (g.fixes ??= []).push('injuryWave');
}

/**
 * Engangsrettelse (2026-11-07): gemte spil fra før førstehold/reservehold havde alle spillere på førsteholdet. Klubber, hvor
 * ingen er sat i reserverne, deles op (de 25 bedste på førsteholdet) – også ens egen; har man selv valgt reserver, røres de ikke.
 */
function splitReservesOnce() {
  const g = gs();
  if (g.fixes?.includes('reserveSplit')) return;
  const withRes = new Set(Object.values(g.players).filter((p) => p.reserves && p.club).map((p) => p.club));
  for (const c of Object.values(g.clubs)) if (!withRes.has(c.id) && !g.leagues[c.league]?.hidden) splitReserves(c.id);
  // ens taktik må ikke pege på spillere, der nu er reserver
  if (g.tactic) {
    const res = (id: number) => !!g.players[id]?.reserves;
    g.tactic.lineup = g.tactic.lineup.map((id) => (id && res(id) ? 0 : id));
    g.tactic.bench = g.tactic.bench.filter((id) => !res(id));
  }
  (g.fixes ??= []).push('reserveSplit');
}

function repairClubNames() {
  const g = gs();
  if (g.dbKind !== 'cm0102') return;
  for (const c of Object.values(g.clubs)) fixClubName(c);
}

async function repairStadiums(): Promise<void> {
  const g = gs();
  if (g.dbKind !== 'cm0102') return;
  const clubs = Object.values(g.clubs);
  const capped = clubs.filter((c) => c.seats === 120_000);
  // ældre gemte spil har ingen stadionnavne ("<klub> Stadium") – de rigtige hentes fra databasen (stadionbaggrunde)
  const generic = clubs.filter((c) => c.stadium === `${c.short} Stadium`);
  // ældre gemte spil har ingen trøjenumre – de rigtige fra databasen bruges for spillere, der stadig er i klubben
  const noNumbers = !Object.values(g.players).some((p) => p.number);
  if (capped.length < clubs.length / 2 && !generic.length && !noNumbers) return;
  try {
    const file = cmDatabase(g) === 'original' ? 'world-original.json' : 'world.json';
    const r = await fetch(`${import.meta.env.BASE_URL}data/${file}`);
    if (!r.ok) return;
    const w = (await r.json()) as { clubs: [number, string, string, number, string, string, number, string][] };
    // kun klubber med samme navn (id'erne er skiftet, da den originale database blev 3.9.60 i stedet for 3.9.68)
    const same = new Set(w.clubs.filter((c) => g.clubs[c[0]]?.name === c[1]).map((c) => c[0]));
    const seats = new Map(w.clubs.filter((c) => same.has(c[0])).map((c) => [c[0], c[6]]));
    const names = new Map(w.clubs.filter((c) => same.has(c[0])).map((c) => [c[0], c[5]]));
    let fixed = 0;
    if (capped.length >= clubs.length / 2) for (const c of capped) { const s = seats.get(c.id); if (s && s !== 120_000) { c.seats = s; fixed++; } }
    for (const c of generic) { const n = names.get(c.id); if (n) { c.stadium = n; fixed++; } }
    const pw = w as unknown as { playerFields: string[]; players: (string | number)[][] };
    const ni = pw.playerFields?.indexOf('number') ?? -1, ci = pw.playerFields?.indexOf('club') ?? -1, li = pw.playerFields?.indexOf('last') ?? -1;
    if (noNumbers && ni >= 0) {
      for (const r of pw.players) {
        const p = g.players[r[0] as number];
        if (p && p.club && p.club === r[ci] && same.has(p.club) && p.last === r[li] && (r[ni] as number) > 0) { p.number = r[ni] as number; fixed++; }
      }
    }
    if (fixed) notify();
  } catch { /* offline: prøv igen næste gang */ }
}

export async function loadGame(id: string): Promise<boolean> {
  const blob = await get<Blob>(`save:${id}`);
  if (!blob) return false;
  const g = await deserializeState(blob);
  // en gammel lokal kopi af et online-spil: åbn ikke den (det rigtige spil ligger på serveren)
  if (g.humans?.length) return false;
  setGame(g);
  upgradeLoaded();
  repairClubNames();
  await repairStadiums();
  ensureAllNumbers();
  rememberLast({ kind: 'local', id });
  return true;
}

/** Admin: åbn en spillers gemte spil i preview (gemmes ikke, huskes ikke ved genindlæsning) */
export async function openPreview(blob: Blob, label: string, theme?: string): Promise<void> {
  const g = await deserializeState(blob);
  setGame(g);
  setPreview({ label, theme });
  upgradeLoaded();
  repairClubNames();
  await repairStadiums();
  ensureAllNumbers();
  notify();
}

export async function deleteSave(id: string) {
  await del(`save:${id}`);
  await del(`meta:${id}`);
}

export async function exportSave(): Promise<void> {
  const g = gs();
  const blob = await serialize(g);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const club = (g.clubs[g.userClub]?.short ?? 'cm').replace(/[^\w]+/g, '-');
  a.download = `cm0102-${club}-${g.date}.cm0102`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function importSave(file: File): Promise<boolean> {
  try {
    const g = await deserializeState(file);
    if (!g.players || !g.clubs) return false;
    g.id = `save-${Date.now().toString(36)}`;
    setGame(g);
    upgradeLoaded();
    ensureAllNumbers();
    await saveGame();
    return true;
  } catch {
    return false;
  }
}
