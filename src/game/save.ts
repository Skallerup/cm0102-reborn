// Gem/indlæs i IndexedDB som gzip-komprimeret JSON (≈4-5 MB pr. save).
import { addMissingConference } from './competitions';
import { MODERN_ENABLED } from '../ui/modernFlag';
import { legacyExtended } from './rules';
const modernEnabledHere = () => { if (MODERN_ENABLED) return true; try { return localStorage.getItem('cm0102.modern') === '1'; } catch { return false; } };
import { fixClubName } from './data/clubNames';
import { cmDatabase } from './newgame';
import { get, keys, set } from 'idb-keyval';
import { deleteSaveData, readSaveBlob, sweepSaveChunksOnce, writeSave } from './saveStore';
import { gs, setGame, addNews, notify, ensureNumbers, previewInfo, setPreview, NEWS_RING } from './state';
import { splitReserves } from './reserves';
import { cmCupName, cmLeagueRules, cmPlayoffRules } from './cmCalendar';
import { cashRound } from './cmTransferBid';
import { deserializeState, gunzipText, gzSize, serializeBytes, serializeState } from './snapshot';
import { rng } from './rng';
import { guardWrite, isQuotaError, StorageFullError, type SaveRescue } from './storageGuard';
import { legacyExtendedFromText, saveKindFromText, saveKindOf, type SaveKind } from './saveKind';
import type { GameState, Player } from './types';
import { cmSlRepairHung } from './cmShortlistGame';
import { cmRsvNewGame } from './cmReserveMatches';
import { cmMarketOn, cmRand, setStatusCode } from './cmPlayerData';
import { cmRoleExpected } from './cmTransferTalks';
import { isHumanClub } from './humans';
import { dropStaleOffers } from './offerLive';
import { repairPositions } from './playerInit';
import { purgeInvisibleFakes } from './purgeFakes';

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

/** (målinger) gemmets trin i konsollen – localStorage['cm0102.ngTrace'] = '1' (scripts/webkit-newgame-raw.mjs) */
const ngTrace = () => { try { return localStorage.getItem('cm0102.ngTrace') === '1'; } catch { return false; } };

export async function serialize(g: GameState): Promise<Blob> {
  return serializeState(g);
}

// gem også i skyen, når man er logget ind (sættes af src/online/cloudSync.ts – motoren kender ikke kontoen)
/** true = logget ind (gemmet uploades eller står i kø) */
type CloudHook = (meta: SaveMeta, blob: Blob, force: boolean) => boolean | void;
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
  const tr = ngTrace();
  if (tr) console.log('ngtrace save: start');
  // (iPhone 24/11 phase=buffer NotReadableError) bytes i sidens hukommelse, ikke en Blob, til lageret (saveStore.ts)
  const parts = await serializeBytes(g);
  if (tr) console.log(`ngtrace save: serialiseret ${(gzSize(parts) / 1048576).toFixed(1)} MB`);
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
  requestPersistentStorage();
  await guardWrite((st) => writeSave(id, parts, meta, st), !!opts?.cloud, rescueOf(g, meta, parts, !!opts?.cloud));
  // "seneste spil" sættes først, når spillet er gemt (så den aldrig peger på et spil, der ikke findes)
  rememberLast({ kind: 'local', id });
  fullUntil = 0;
  if (tr) console.log('ngtrace save: gemt');
  cloudHook?.(meta, new Blob(parts), !!opts?.cloud);
  try { window.dispatchEvent(new Event('cm-saved')); } catch { /* ingen window */ }
  return meta;
}

/** (Windows/Chrome 24/11 "Failed to write blobs"/fuld disk) gemmet kunne ikke skrives lokalt: spillet kører videre i hukommelsen, og nødgemmet er
 *  skyen (logget ind: tvunget upload højst hvert 5. minut, ellers skyens egen takt) og en Eksport-knap i beskeden (de samme bytes som fil). */
let rescueAt = 0;
function rescueOf(g: GameState, meta: SaveMeta, parts: Uint8Array<ArrayBuffer>[], manual: boolean): SaveRescue {
  return {
    cloud: () => {
      const force = manual || Date.now() - rescueAt > 5 * 60_000;
      if (force) rescueAt = Date.now();
      return !!cloudHook?.(meta, new Blob(parts), force);
    },
    download: () => downloadSave(new Blob(parts), g),
  };
}

/** gem spillet som fil (Eksport) */
function downloadSave(blob: Blob, g: GameState): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const club = (g.clubs[g.userClub]?.short ?? 'cm').replace(/[^\w]+/g, '-');
  a.download = `cm0102-${club}-${g.date}.cm0102`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

const extOf = (g: GameState): boolean => !g.humans?.length && !g.draft && legacyExtended(g);

/** metadata for spillets eget (unavngivne) gem – som saveGame */
export function saveMetaOf(g: GameState): SaveMeta {
  return { id: g.id, manager: g.manager.name, club: g.clubs[g.userClub]?.name ?? '—', date: g.date, saved: new Date().toISOString(), kind: saveKindOf(g), ext: extOf(g) };
}

/** (hukommelse, iPhone 23/11) nyt spils første gem er skrevet af spilstartens arbejder (ui/newGameWorker.ts): hovedtråden gør resten af saveGame
 *  (seneste spil, varig lagring, skyen) uden at serialisere spillet igen – Shell.tsx' første gem springes så over (seneste = dette spil) */
export function adoptWorkerSave(meta: SaveMeta, blob: Blob): void {
  requestPersistentStorage();
  rememberLast({ kind: 'local', id: meta.id });
  cloudHook?.(meta, blob, false);
}

/** Er et lokalt gemt spil et gammelt udvidet spil? Metadata uden `ext` (gemt af en ældre version): teksten læses og svaret gemmes. null = ukendt */
export async function storedLegacyExt(meta: SaveMeta): Promise<boolean | null> {
  if (meta.ext !== undefined) return meta.ext;
  try {
    const blob = await readSaveBlob(meta.id);
    if (!blob) return null;
    const ext = legacyExtendedFromText(await gunzipText(blob));
    if (ext !== null) await set(`meta:${meta.id}`, { ...meta, ext }).catch(() => {});
    return ext;
  } catch { return null; }
}

/** Læg et spil hentet fra skyen i den lokale database (overskriver en ældre lokal kopi) */
export async function storeSave(meta: SaveMeta, blob: Blob) {
  // læses én gang ind i sidens hukommelse (en Blob kan blive ulæselig i WebKit – genforsøget skal ikke læse den igen)
  const parts = [new Uint8Array(await blob.arrayBuffer())];
  await guardWrite((st) => writeSave(meta.id, parts, meta, st), true);
}

/** Slags for et lokalt gemt spil uden `kind` i metadata (gemt af en ældre version): den udpakkede tekst læses (uden at bygge spillet) og
 *  svaret gemmes i metadata. null = ukendt (afgøres, når spillet åbnes) */
export async function storedSaveKind(meta: SaveMeta): Promise<SaveKind | null> {
  if (meta.kind) return meta.kind;
  try {
    const blob = await readSaveBlob(meta.id);
    if (!blob) return null;
    const kind = saveKindFromText(await gunzipText(blob));
    if (kind) await set(`meta:${meta.id}`, { ...meta, kind }).catch(() => {});
    return kind;
  } catch { return null; }
}

/** Et gemt spil (lokalt eller hentet fra skyen) som GameState – til konverteringen (det gamle gem røres ikke) */
export async function readSave(id: string): Promise<GameState | null> {
  const blob = await readSaveBlob(id);
  return blob ? deserializeState(blob) : null;
}

/** Konverteringens resultat gemmes som et NYT gemt spil (eget id) – returnerer id'et */
export async function storeNewGame(g: GameState): Promise<string> {
  g.id = `save-${Date.now().toString(36)}`;
  const meta: SaveMeta = { id: g.id, manager: g.manager.name, club: g.clubs[g.userClub]?.name ?? '—', date: g.date, saved: new Date().toISOString(), kind: saveKindOf(g), ext: extOf(g) };
  // serializeState skriver den globale talrække i spillet – her er spillet ikke lagt ind, så dets egen bruges
  const keep = rng.state;
  rng.state = g.rng;
  const data = serializeBytes(g);
  rng.state = keep;
  const parts = await data;
  await guardWrite((st) => writeSave(g.id, parts, meta, st), true);
  requestPersistentStorage();
  return g.id;
}

export async function getSaveMeta(id: string): Promise<SaveMeta | undefined> {
  try { return await get<SaveMeta>(`meta:${id}`); } catch { return undefined; }
}

// ---------- seneste spil (så en genindlæsning fortsætter hvor man slap) ----------

import { forgetLast, getLast, rememberLast } from './last';
export { forgetLast, getLast, rememberLast, type LastGame } from './last';

// ---------- autogem ----------

let timer: ReturnType<typeof setTimeout> | null = null;
let saving = false;
let dirty = false;
/** (24/11) lageret er fuldt / kan ikke skrives: autogemmet holder pause så længe (hver dag ~20 MB skrevet og slettet igen fylder kun disken);
 *  Save Game prøver altid, og et vellykket gem ophæver pausen */
let fullUntil = 0;
export const AUTOSAVE_FULL_PAUSE_MS = 3 * 60_000;

/** Gem kort efter ændringer (debounced), så intet går tabt ved genindlæsning */
export function scheduleAutosave(delay = 2500) {
  dirty = true;
  if (timer) clearTimeout(timer);
  firstWait = firstWait || Date.now();
  timer = setTimeout(autosaveWhenQuiet, delay);
}

/** (26/11) selve gemmet (JSON-teksten ~250 ms i et sent spil) låser siden et øjeblik – vent, til spilleren har holdt en pause med musen/tasterne
 *  (1,2 s), så et klik på en menu ikke havner midt i det; højst 20 s, så et gem aldrig udebliver */
let lastInput = 0;
let firstWait = 0;
if (typeof window !== 'undefined') for (const ev of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']) window.addEventListener(ev, () => { lastInput = Date.now(); }, { capture: true, passive: true });
function autosaveWhenQuiet() {
  const now = Date.now();
  if (now - lastInput < 1200 && now - firstWait < 20_000) { timer = setTimeout(autosaveWhenQuiet, 600); return; }
  firstWait = 0;
  void flushAutosave();
}

export async function flushAutosave() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!dirty || saving || Date.now() < fullUntil) return;
  saving = true;
  dirty = false;
  try { await saveGame(); fullUntil = 0; } catch (e) { dirty = true; if (e instanceof StorageFullError) fullUntil = Date.now() + AUTOSAVE_FULL_PAUSE_MS; } finally { saving = false; }
}

/** (ResumeMissing, 23/11) hvad lageret har for det seneste spil: antal nøgler i alt/gemte spil (meta:), om manifestet/metadata/bidderne findes –
 *  og fejlen, hvis IndexedDB ikke kunne læses (listSaves sluger fejlen og gav saves=0, som om alt var væk). `idbError` = lageret svarede ikke. */
export async function resumeDiag(id: string): Promise<{ text: string; idbError: boolean }> {
  try {
    const all = (await keys()) as string[];
    const metas = all.filter((k) => typeof k === 'string' && k.startsWith('meta:')).length;
    const chunks = all.filter((k) => typeof k === 'string' && k.startsWith(`savec:${id}:`));
    const v = await get<unknown>(`save:${id}`);
    const kind = v === undefined ? 'none' : v instanceof Blob ? 'blob' : (v as SaveManifestLike)?.v === 2 ? `manifest n=${(v as SaveManifestLike).n} gen=${(v as SaveManifestLike).gen}` : typeof v;
    const gens = [...new Set(chunks.map((k) => k.split(':')[2]))].join('/');
    return { text: `keys=${all.length} metas=${metas} save=${kind} meta=${all.includes(`meta:${id}`) ? 'yes' : 'no'} chunks=${chunks.length}${gens ? ` gens=${gens}` : ''}`, idbError: false };
  } catch (e) {
    return { text: `idbError=${e === null || e === undefined ? 'null' : `${(e as Error).name ?? ''} ${String((e as Error).message ?? e).slice(0, 100)}`}`, idbError: true };
  }
}
type SaveManifestLike = { v: number; n: number; gen: string };

export async function listSaves(): Promise<SaveMeta[]> {
  // (24/11) forældreløse bidder fra afbrudte gem ryddes én gang pr. session (saveStore.ts sweepSaveChunks)
  sweepSaveChunksOnce();
  // IndexedDB kan ikke åbnes (fuld disk, privat vindue): ingen lokale gemte spil frem for et nedbrud
  try {
    const all = (await keys()) as string[];
    const metas = await Promise.all(all.filter((k) => k.startsWith('meta:')).map((k) => get<SaveMeta>(k)));
    return (metas.filter(Boolean) as SaveMeta[]).sort((a, b) => b.saved.localeCompare(a.saved));
  } catch { return []; }
}

/** Trøjenumre i gemte spil fra før Squad Numbers (og efter et evt. hentet sæt fra databasen) */
/** (21/11) gemte spil fra før 20/11 med computerens transfers som originalen (cmMarketOn – ejerens Silkeborg-spil: 14 målmænd i Esbjerg, mange
 *  "Loa"): én gang ved indlæsningen (g.cmSlFix – nye spil har den fra start)
 *   – ønskelisternes hængende pladser (cmSlRepairHung): den ankomne spiller blev ikke pladsens indehaver (0x8c9720/0x8c9390 – porteret 20/11),
 *     så trupplanen 0x83cb40 ikke regnede ham med og klubben blev ved med at købe til pladsen;
 *   – reservekampene (cmReserveMatches.ts, porteret 20/11 – før kun i nye spil): uden dem falder reservernes kampform under −1000, og
 *     trupplanens gruppe B/C sætter dem til leje (+0x4e bit 2); bitten ryddes ved hver trupplan (0x83d281), så listen retter sig selv. */
export function repairOldMarket(): void {
  const g = gs();
  if (g.cmSlFix || g.draft) return;
  g.cmSlFix = 1;
  if (!cmMarketOn(g)) return;
  cmSlRepairHung(g);
  if (!g.cmRsv) cmRsvNewGame(g);
}

/** (27/11) gemte spil fra før offerLive.ts: åbne bud med et menneske som part, hvor sælgeren ikke længere er spillerens klub (efter et køb stod
 *  et andet klubs bud som aktivt; to accepterede bud solgte spilleren to gange) – de trækkes én gang ved indlæsningen */
export function repairStaleOffers(g: GameState = gs()): void {
  if (g.draft || g.fixes?.includes('staleOffers')) return;
  dropStaleOffers(g, isHumanClub);
  (g.fixes ??= []).push('staleOffers');
}

/** (27/11) gemte spil fra før 6c3386bb: sæsonskiftets opdigtede spillere i de ikke-valgte landes klubber (purgeFakes.ts) – de usynlige fjernes
 *  én gang ved indlæsningen (originalen har kun fyldspillerne 0x90dae0 omkring kampene) */
export function repairFakePlayers(g: GameState = gs()): void {
  if (g.draft || g.fixes?.includes('fakePurge')) return;
  purgeInvisibleFakes(g);
  (g.fixes ??= []).push('fakePurge');
}

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
  // (22/11) cmLeagueRules sætter Third Division til 4 op igen – spil med play-off'en får originalens +0xbe (cmPlayoffRules)
  if (g.customRules && g.cmPlayoff) g.customRules = cmPlayoffRules(g.customRules);
}

/** fællesspil er altid det originale (classic + ægte tilstand) – også et rum, der blev oprettet i udvidet tilstand (kaldes for hvert øjebliksbillede, alle klienter ens) */
export function forceMultiplayerAuthentic(g: GameState) {
  if (g.humans?.length && !modernEnabledHere() && legacyExtended(g)) { g.options.mode = 'authentic'; g.options.rules = 'classic'; }
}

/** spillet er startet med den nuværende kode til den originale database (newgame.ts CM_SAVE_VER – indført 17/11, efter alle engangsrettelserne
 *  nedenfor): rettelserne hører til ældre gemte spil og må ikke røre det (ellers spiller et gemt og indlæst spil ikke videre som det samme spil:
 *  cashRound rundede værdierne, reserveSplit og injuryWave ændrede trupperne, og Conference League kom ind i 2001/02) */
const currentSave = (g: GameState) => (g.cmSaveVer ?? 0) >= 1;

/** Spillerrapport #32 (Johan Mangfors: forsvarer med Left/Right/Centre = 1): spil startet før 9/11-2026 (a94f63f2) fik databasens positioner
 *  uden originalens reparation ved spilstarten (sub_535a80 0x536f01–0x5374f4, playerInit.ts repairPositions). En tredjedel af 3.9.60-
 *  databasens spillere har ingen sider (0) og ~10 % ingen position på 20 – originalen giver dem dem ved spilstarten, så ingen spiller (uden for
 *  målmændene) står uden en position og en side på 20. Spillere, der bryder den regel, får reparationen nu (egen talrække pr. spiller – spillets
 *  rng røres ikke). Nye spil (newgame.ts) har ingen af dem. */
export function repairPositionsOnce(g: GameState = gs()) {
  if (g.dbKind !== 'cm0102' || g.fixes?.includes('posRepair')) return;
  for (const p of Object.values(g.players)) {
    if (p.virtual || !p.pos || !p.side) continue;
    const noPos = !p.pos.slice(0, 8).some((v) => v === 20), noSide = p.pos[0] !== 20 && !p.side.some((v) => v === 20);
    if (!noPos && !noSide) continue;
    // [GK SW D DM M AM F WB R L C] – Player.side er [L C R]
    const pos11 = [...p.pos.slice(0, 8), p.side[2], p.side[0], p.side[1]];
    repairPositions(pos11, cmRand(g.seed, p.id, 536));
    p.pos = pos11.slice(0, 8); p.side = [pos11[9], pos11[10], pos11[8]];
  }
  (g.fixes ??= []).push('posRepair');
}

/** (25/11) Menneskets nye spillere fik trupstatus 0 i kontrakten (+0x4f): forkontrakten gemte ikke Set Role At Club-valget, og den nye
 *  kontrakt ved skiftet var uden status ("Fut", "Uncertain"). Originalen skriver altid tilbuddets status (sign_contract 0x4cf720) – her det
 *  valgte (buddets cmRole, hvis det findes endnu) eller Set Role At Club's forvalg (cmRoleExpected – det, skærmen foreslog). Også ventende forkontrakter. */
export function repairHumanStatus0(g: GameState = gs()): void {
  if (!cmMarketOn(g)) return;   // idempotent (ingen markør: et uafbrudt spil skal forblive bit for bit ens – snapCarry)
  const role = (p: Player, club: number) => g.offers.slice().reverse().find((o) => o.player === p.id && o.buyer === club && !o.loan && o.cmRole)?.cmRole ?? cmRoleExpected(g, p, club);
  for (const p of Object.values(g.players)) {
    if (p.virtual) continue;
    const f = p.contract?.futureClub;
    if (f && isHumanClub(f) && !p.contract!.futureRole && !g.offers.some((o) => o.player === p.id && o.preContract && o.status === 'accepted' && o.cmFut)) p.contract!.futureRole = role(p, f);
    if (!p.club || p.loan || !isHumanClub(p.club) || p.squadStatus || !p.cmContract || p.cmContract.b4f === undefined || (p.cmContract.b4f >> 4) & 0xf) continue;
    if ((p.contract?.cmType ?? 2) !== 2 || !p.moves?.some((mv) => mv.to === p.club && !mv.loan)) continue;
    p.squadStatus = role(p, p.club);
    setStatusCode(p);
  }
}

export function upgradeLoaded() {
  repairCupNames();
  const g = gs();
  if (!currentSave(g)) {
    repairInjuryWave();
    roundValuesOnce();
    splitReservesOnce();
    repairPositionsOnce(g);
  }
  // gamle gemte spil i udvidet tilstand åbnes, som de blev gemt (moderne udseende + udvidet) – tilstanden ændres ikke (setGame → setSavedModern)
  // fællesspil er altid det originale (classic + ægte tilstand) – alle klienter stiller samme spil om ens
  forceMultiplayerAuthentic(g);
  repairHumanStatus0(g);
  // ferien kører kun, mens Shell's ferieløkke kører (manager.holiday sættes ved start og ryddes bagefter). Et spil gemt midt i ferien (fx før en
  // fejl i ferieløkken 20/11) havde ferien hængende: assistenten svarede på bud resten af spillet, uden at man var på ferie
  if (!g.humans?.length && g.manager?.holiday) g.manager.holiday = undefined;
  // (27/11) nyhedslisten som originalens ring på 100 pr. manager (state.ts NEWS_RING) – gemte spil fra før havde op til 700
  if (g.news?.length > NEWS_RING) g.news.length = NEWS_RING;
  for (const h of g.humans ?? []) if (h.news?.length > NEWS_RING) h.news.length = NEWS_RING;
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
  try { blob = await readSaveBlob(id); } catch { return false; }
  if (!blob) return false;
  const g = await deserializeState(blob);
  // en gammel lokal kopi af et online-spil: åbn ikke den (det rigtige spil ligger på serveren)
  if (g.humans?.length) return false;
  setGame(g);
  upgradeLoaded();
  repairClubNames();
  await repairStadiums();
  ensureAllNumbers();
  repairOldMarket();
  repairStaleOffers();
  repairFakePlayers();
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
  repairOldMarket();
  repairStaleOffers();
  repairFakePlayers();
  notify();
}

export async function deleteSave(id: string) {
  try { await deleteSaveData(id); } catch (e) { if (!isQuotaError(e)) throw e; }
  // peger "seneste spil" på det slettede, ville næste genindlæsning melde et manglende spil
  const last = getLast();
  if (last?.kind === 'local' && last.id === id) forgetLast();
}

export async function exportSave(): Promise<void> {
  const g = gs();
  downloadSave(await serialize(g), g);
}

export async function importSave(file: File): Promise<boolean> {
  try {
    const g = await deserializeState(file);
    if (!g.players || !g.clubs) return false;
    g.id = `save-${Date.now().toString(36)}`;
    setGame(g);
    upgradeLoaded();
    ensureAllNumbers();
    repairOldMarket();
    repairStaleOffers();
    repairFakePlayers();
    await saveGame();
    return true;
  } catch {
    return false;
  }
}
