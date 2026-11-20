// Gem/indlæs i IndexedDB som gzip-komprimeret JSON (≈4-5 MB pr. save).
import { addMissingConference } from './competitions';
import { MODERN_ENABLED } from '../ui/modernFlag';
import { legacyExtended } from './rules';
const modernEnabledHere = () => { if (MODERN_ENABLED) return true; try { return localStorage.getItem('cm0102.modern') === '1'; } catch { return false; } };
import { fixClubName } from './data/clubNames';
import { cmDatabase } from './newgame';
import { del, get, keys, set } from 'idb-keyval';
import { gs, setGame, addNews, notify, ensureNumbers, previewInfo, setPreview } from './state';
import { splitReserves } from './reserves';
import { cmCupName, cmLeagueRules } from './cmCalendar';
import { cashRound } from './cmTransferBid';
import { deserializeState, gunzipText, serializeState } from './snapshot';
import { rng } from './rng';
import { guardWrite, isQuotaError } from './storageGuard';
import { legacyExtendedFromText, saveKindFromText, saveKindOf, type SaveKind } from './saveKind';
import type { GameState, Player } from './types';

export interface SaveMeta {
  id: string;
  manager: string;
  club: string;
  date: string;
  saved: string;
  /** CM 01/02's Save Game: filnavnet (et navngivet gemt spil er sin egen kopi – id = spillets id + navnet) */
  name?: string;
  /** hvilken slags spil (saveKind.ts) – 'oldOriginal'/'modern' kan konverteres (Restore Saved Game) */
  kind?: SaveKind;
  /** gammelt udvidet spil (legacyExtended) – mærkes i listen over gemte spil */
  ext?: boolean;
}

/** id'et for et navngivet gemt spil */
export const namedSaveId = (gameId: string, name: string) => `${gameId}~${name.trim().toLowerCase().replace(/[^a-z0-9æøåäöü-]+/gi, '-').slice(0, 40)}`;

export async function serialize(g: GameState): Promise<Blob> {
  return serializeState(g);
}

// gem også i skyen, når man er logget ind (sættes af src/online/cloudSync.ts – motoren kender ikke kontoen)
type CloudHook = (meta: SaveMeta, blob: Blob, force: boolean) => void;
let cloudHook: CloudHook | null = null;
export function setCloudHook(h: CloudHook | null) { cloudHook = h; }

/** Bed browseren om varig lagring (én gang), så gemte spil ikke ryddes væk ved pladsmangel/inaktivitet (Safari/iOS mistede spil, rapport #18) */
let persistAsked = false;
function requestPersistentStorage() {
  if (persistAsked) return;
  persistAsked = true;
  try { void navigator.storage?.persist?.().catch(() => {}); } catch { /* ikke understøttet */ }
}

/** Gem lokalt (og i skyen: altid ved cloud=true, ellers højst hvert 5. minut) */
export async function saveGame(opts?: { cloud?: boolean; name?: string }): Promise<SaveMeta> {
  const g = gs();
  // online-spil gemmes på serveren – en lokal kopi ville blive genoptaget i stedet for det rigtige spil
  if (g.humans?.length) throw new Error('online');
  const meta0 = { id: g.id, manager: g.manager.name, club: g.clubs[g.userClub]?.name ?? '—', date: g.date, saved: new Date().toISOString() };
  // admin-preview af en andens spil: gem aldrig (hverken lokalt eller i skyen)
  if (previewInfo()) return meta0;
  const blob = await serialize(g);
  const name = opts?.name?.trim();
  const id = name ? namedSaveId(g.id, name) : g.id;
  const meta: SaveMeta = {
    id,
    manager: g.manager.name,
    club: g.clubs[g.userClub]?.name ?? '—',
    date: g.date,
    saved: new Date().toISOString(),
    ...(name ? { name } : {}),
    kind: saveKindOf(g),
    ext: extOf(g),
  };
  await guardWrite(async () => { await set(`save:${id}`, blob); await set(`meta:${id}`, meta); }, !!opts?.cloud);
  requestPersistentStorage();
  rememberLast({ kind: 'local', id });
  cloudHook?.(meta, blob, !!opts?.cloud);
  return meta;
}

const extOf = (g: GameState): boolean => !g.humans?.length && !g.draft && legacyExtended(g);

/** Er et lokalt gemt spil et gammelt udvidet spil? Metadata uden `ext` (gemt af en ældre version): teksten læses og svaret gemmes. null = ukendt */
export async function storedLegacyExt(meta: SaveMeta): Promise<boolean | null> {
  if (meta.ext !== undefined) return meta.ext;
  try {
    const blob = await get<Blob>(`save:${meta.id}`);
    if (!blob) return null;
    const ext = legacyExtendedFromText(await gunzipText(blob));
    if (ext !== null) await set(`meta:${meta.id}`, { ...meta, ext }).catch(() => {});
    return ext;
  } catch { return null; }
}

/** Læg et spil hentet fra skyen i den lokale database (overskriver en ældre lokal kopi) */
export async function storeSave(meta: SaveMeta, blob: Blob) {
  await guardWrite(async () => { await set(`save:${meta.id}`, blob); await set(`meta:${meta.id}`, meta); }, true);
}

/** Slags for et lokalt gemt spil uden `kind` i metadata (gemt af en ældre version): den udpakkede tekst læses (uden at bygge spillet) og
 *  svaret gemmes i metadata. null = ukendt (afgøres, når spillet åbnes) */
export async function storedSaveKind(meta: SaveMeta): Promise<SaveKind | null> {
  if (meta.kind) return meta.kind;
  try {
    const blob = await get<Blob>(`save:${meta.id}`);
    if (!blob) return null;
    const kind = saveKindFromText(await gunzipText(blob));
    if (kind) await set(`meta:${meta.id}`, { ...meta, kind }).catch(() => {});
    return kind;
  } catch { return null; }
}

/** Et gemt spil (lokalt eller hentet fra skyen) som GameState – til konverteringen (det gamle gem røres ikke) */
export async function readSave(id: string): Promise<GameState | null> {
  const blob = await get<Blob>(`save:${id}`);
  return blob ? deserializeState(blob) : null;
}

/** Konverteringens resultat gemmes som et NYT gemt spil (eget id) – returnerer id'et */
export async function storeNewGame(g: GameState): Promise<string> {
  g.id = `save-${Date.now().toString(36)}`;
  const meta: SaveMeta = { id: g.id, manager: g.manager.name, club: g.clubs[g.userClub]?.name ?? '—', date: g.date, saved: new Date().toISOString(), kind: saveKindOf(g), ext: extOf(g) };
  // serializeState skriver den globale talrække i spillet – her er spillet ikke lagt ind, så dets egen bruges
  const keep = rng.state;
  rng.state = g.rng;
  const blob = serialize(g);
  rng.state = keep;
  const data = await blob;
  await guardWrite(async () => { await set(`save:${g.id}`, data); await set(`meta:${g.id}`, meta); }, true);
  requestPersistentStorage();
  return g.id;
}

export async function getSaveMeta(id: string): Promise<SaveMeta | undefined> {
  try { return await get<SaveMeta>(`meta:${id}`); } catch { return undefined; }
}

// ---------- seneste spil (så en genindlæsning fortsætter hvor man slap) ----------

import { rememberLast } from './last';
export { forgetLast, getLast, rememberLast, type LastGame } from './last';

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
  // IndexedDB kan ikke åbnes (fuld disk, privat vindue): ingen lokale gemte spil frem for et nedbrud
  try {
    const all = (await keys()) as string[];
    const metas = await Promise.all(all.filter((k) => k.startsWith('meta:')).map((k) => get<SaveMeta>(k)));
    return (metas.filter(Boolean) as SaveMeta[]).sort((a, b) => b.saved.localeCompare(a.saved));
  } catch { return []; }
}

/** Trøjenumre i gemte spil fra før Squad Numbers (og efter et evt. hentet sæt fra databasen) */
export function ensureAllNumbers() {
  const g = gs();
  // et spil fra den nuværende kode har sine numre (dubletter, fx fyldspillerne og lejespillere, er spillets egne – en omnummerering ved
  // indlæsningen gjorde det gemte spil til et andet end det uafbrudte)
  if (currentSave(g)) return;
  for (const c of Object.values(g.clubs)) ensureNumbers(c.id);
}

/** Opgradér gemte spil fra ældre versioner (nye turneringer m.m.) */
/** Den originale økonomi: værdierne rundet som originalens (cashStep – £150,000, ikke £150,500) i gemte spil fra før rettelsen */
function roundValuesOnce() {
  const g = gs();
  if (!g.econ || g.fixes?.includes('cashRound')) return;
  for (const p of Object.values(g.players)) if (p.value > 0) p.value = cashRound(p.value);
  (g.fixes ??= []).push('cashRound');
}

/** Spillerrapport #26/#27: Portugals (og Japans) pokal hed "Portuguese Super Cup" (Supertaça) i gemte spil med den originale database */
function repairCupNames() {
  const g = gs();
  if (g.dbKind !== 'cm0102') return;
  for (const c of Object.values(g.comps)) if (c.type === 'cup' && cmCupName(c.name) !== c.name) c.name = cmCupName(c.name);
  if (g.customRules) g.customRules = cmLeagueRules(g.customRules);
}

/** fællesspil er altid det originale (classic + ægte tilstand) – også et rum, der blev oprettet i udvidet tilstand (kaldes for hvert øjebliksbillede, alle klienter ens) */
export function forceMultiplayerAuthentic(g: GameState) {
  if (g.humans?.length && !modernEnabledHere() && legacyExtended(g)) { g.options.mode = 'authentic'; g.options.rules = 'classic'; }
}

/** spillet er startet med den nuværende kode til den originale database (newgame.ts CM_SAVE_VER – indført 17/11, efter alle engangsrettelserne
 *  nedenfor): rettelserne hører til ældre gemte spil og må ikke røre det (ellers spiller et gemt og indlæst spil ikke videre som det samme spil:
 *  cashRound rundede værdierne, reserveSplit og injuryWave ændrede trupperne, og Conference League kom ind i 2001/02) */
const currentSave = (g: GameState) => (g.cmSaveVer ?? 0) >= 1;

export function upgradeLoaded() {
  repairCupNames();
  const g = gs();
  if (!currentSave(g)) {
    repairInjuryWave();
    roundValuesOnce();
    splitReservesOnce();
  }
  // gamle gemte spil i udvidet tilstand åbnes, som de blev gemt (moderne udseende + udvidet) – tilstanden ændres ikke (setGame → setSavedModern)
  // fællesspil er altid det originale (classic + ægte tilstand) – alle klienter stiller samme spil om ens
  forceMultiplayerAuthentic(g);
  // ferien kører kun, mens Shell's ferieløkke kører (manager.holiday sættes ved start og ryddes bagefter). Et spil gemt midt i ferien (fx før en
  // fejl i ferieløkken 20/11) havde ferien hængende: assistenten svarede på bud resten af spillet, uden at man var på ferie
  if (!g.humans?.length && g.manager?.holiday) g.manager.holiday = undefined;
  if (!currentSave(g) && addMissingConference()) {
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
  let blob: Blob | undefined;
  try { blob = await get<Blob>(`save:${id}`); } catch { return false; }
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
  try { await del(`save:${id}`); await del(`meta:${id}`); } catch (e) { if (!isQuotaError(e)) throw e; }
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
