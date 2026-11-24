// Fuld disk/lagerkvote (QuotaExceededError, "Encountered full disk while opening backing store for indexedDB.open"): spillet må aldrig
// gå ned på det. Gemning viser én tydelig besked pr. session (indtil et gem lykkes igen) og spillet fortsætter; fejlen meldes til admin én gang.
// (Windows/Chrome 24/11) "DataError Failed to write blobs (IOError)" – Chrome kunne ikke skrive værdiens blob-fil (fuld disk, antivirus, rettigheder i
// profilmappen) – er samme slags lagerproblem. Et gem, der ikke kan skrives, får et nødgem (SaveRescue): skyen (logget ind) og en Eksport-knap.
import { createStore, type UseStore } from 'idb-keyval';
import { t } from '../i18n';

/** Kastes af saveGame m.fl., når disken er fuld – kaldere må ikke vise "Gemt" (fejlen er allerede vist og meldt) */
export class StorageFullError extends Error {
  constructor(cause?: unknown) { super(`StorageFull: ${String((cause as Error)?.message ?? cause ?? '').slice(0, 200)}`); this.name = 'StorageFullError'; }
}

/** Genkend en fuld disk/kvote på tværs af browsere (Chrome: QuotaExceededError "full disk"; Safari: QuotaExceededError; Firefox: NS_ERROR_DOM_QUOTA_REACHED) */
export function isQuotaError(e: unknown): boolean {
  const x = e as { name?: string; message?: string; code?: number } | null;
  if (!x) return false;
  return x.name === 'QuotaExceededError' || x.name === 'NS_ERROR_DOM_QUOTA_REACHED' || x.code === 22 || x.code === 1014 || /quota|full disk|disk is full|no space left/i.test(String(x.message ?? ''));
}

/** Chrome kunne ikke skrive en IndexedDB-værdis blob-fil / LevelDB-fil: "DataError: Failed to write blobs (IOError)", "UnknownError … IO error".
 *  Også pakket i saveStore's SavePhaseError (cause eller tekst). */
export function isBlobWriteError(e: unknown): boolean {
  const x = e as { name?: string; message?: string; cause?: unknown } | null;
  if (!x || typeof x !== 'object') return false;
  if (x.name === 'SavePhaseError' && x.cause !== undefined && x.cause !== null && isBlobWriteError(x.cause)) return true;
  return /failed to write blobs?|\bIO ?error\b/i.test(String(x.message ?? ''));
}
/** fuld disk/kvote eller en lagerfil, der ikke kan skrives – spilleren skal frigøre plads/eksportere; et nyt forsøg hjælper ikke */
export const isStorageProblem = (e: unknown): boolean => isQuotaError(e) || isBlobWriteError(e);

/** Nødgem, når et gemt spil ikke kan skrives: cloud() starter skygemmet (true = logget ind og i gang), download() gemmer spillet som fil */
export interface SaveRescue { cloud: () => boolean; download: () => void }

let warned = false;
let reported = false;
let failWarned = false;
let failReported = false;
/** Et gem lykkedes: næste fejl må vise beskeden igen */
export function storageWorks() { warned = false; failWarned = false; }
/** Kun til tests */
export function resetStorageGuard() { warned = false; reported = false; failWarned = false; failReported = false; }

/** Vis beskeden (højst én gang, indtil et gem lykkes; et manuelt gem viser den altid) og meld fejlen til admin (højst én gang pr. session). Kaster aldrig. */
export async function handleStorageFull(e: unknown, manual: boolean, rescue?: SaveRescue): Promise<void> {
  if (!reported) {
    reported = true;
    try {
      const { reportError } = await import('../online/errors');
      const { saveStoreDiagText, usingSmallChunks } = await import('./saveStore');
      const msg = isQuotaError(e) ? (e instanceof Error ? e : new Error(String(e)))
        : new Error(`SaveFailed: ${describeStorageError(e)} | ${await storageDiag({ small: usingSmallChunks() })} ${await saveStoreDiagText()}`);
      reportError(msg);
    } catch { /* ignorér */ }
  }
  const show = !warned || manual;
  warned = true;
  await notifyRescue(t('storage.full'), show, rescue);
}

/** Nødgem + beskeden: skygemmet startes (også når beskeden ikke vises igen); vises beskeden, tilbydes Eksport (et klik = brugerhandling, så
 *  browseren tillader download). Kaster aldrig. */
async function notifyRescue(text: string, show: boolean, rescue?: SaveRescue): Promise<void> {
  let cloud = false;
  try { cloud = !!rescue?.cloud(); } catch { /* ignorér */ }
  if (!show) return;
  try {
    const { askConfirm, askNotice } = await import('../ui/confirm');
    const msg = cloud ? `${text} ${t('storage.cloudRescue')}` : text;
    if (!rescue) { await askNotice(msg); return; }
    if (await askConfirm(msg, { ok: t('storage.exportBtn'), cancel: t('common.close') })) rescue.download();
  } catch { /* ingen dialog (fx i tests): spillet fortsætter */ }
}

/** Pause før genforsøget (iOS fryser en PWA i baggrunden og afbryder transaktionen; et øjeblik efter virker lageret igen). Kun tests ændrer den. */
export const retry = { delayMs: 400 };

/** Beskriv en IndexedDB-fejl læsbart: idb-keyval afviser med `request.error`/`transaction.error`, som er null, når en transaktion afbrydes uden årsag
 *  (WebKit: siden gik i baggrunden/blev suspenderet, forbindelsen blev lukket) – så står der ellers bare "null". */
export function describeStorageError(e: unknown): string {
  if (e === null || e === undefined) return `${String(e)} (aborted, no cause: transaction abort or closed connection)`;
  const x = e as { name?: string; message?: string; code?: number; constructor?: { name?: string } };
  if (typeof e !== 'object') return `${typeof e} ${String(e).slice(0, 120)}`;
  const kind = x.constructor?.name && x.constructor.name !== x.name && x.constructor.name !== 'Error' ? ` <${x.constructor.name}>` : '';
  return `${x.name ?? 'Error'}${x.code ? `#${x.code}` : ''}${kind} ${String(x.message ?? '').slice(0, 120)}`.trim();
}

/** en ny IndexedDB-forbindelse til idb-keyvals standardlager (en lukket/afbrudt forbindelse genbruges ellers for evigt) */
const freshStore = (): UseStore | undefined => { try { return createStore('keyval-store', 'keyval'); } catch { return undefined; } };

/** Kør en skrivning til IndexedDB: ved fuld disk behandles fejlen, og StorageFullError kastes; en anden fejl (fx en afbrudt transaktion – iOS) prøves igen
 *  én gang efter en kort pause på en ny forbindelse (fn får lageret som argument; udefineret = standardlageret), og først hvis genforsøget også fejler,
 *  meldes den og vises for spilleren. Fejlen kastes uændret. */
export async function guardWrite<T>(fn: (store?: UseStore) => Promise<T>, manual = false, rescue?: SaveRescue): Promise<T> {
  let first: unknown;
  try { const r = await fn(); storageWorks(); return r; }
  catch (e) {
    if (isStorageProblem(e)) { await handleStorageFull(e, manual, rescue); throw new StorageFullError(e); }
    first = e;
  }
  await new Promise((r) => setTimeout(r, retry.delayMs));
  try { const r = await fn(freshStore()); storageWorks(); return r; }
  catch (e) {
    if (isStorageProblem(e)) { await handleStorageFull(e, manual, rescue); throw new StorageFullError(e); }
    await handleSaveFailed(e, manual, first, rescue);
    throw e;
  }
}

/** Gemningen fejlede af en anden grund end fuld disk (fx IndexedDB utilgængelig/ryddet, privat tilstand, indbygget browser): meld til admin (højst én gang
 *  pr. session, med diagnose) og vis spilleren en tydelig besked (højst én gang, indtil et gem lykkes; manuelt gem viser den altid). Kaster aldrig. */
export async function handleSaveFailed(e: unknown, manual: boolean, first?: unknown, rescue?: SaveRescue): Promise<void> {
  if (!failReported) {
    failReported = true;
    try {
      const { reportError } = await import('../online/errors');
      const { saveStoreDiagText } = await import('./saveStore');
      reportError(new Error(`SaveFailed: ${describeStorageError(e)}${first !== undefined || e === null ? ` [first: ${describeStorageError(first)}; retried]` : ''} | ${await storageDiag()} ${await saveStoreDiagText()}`));
    } catch { /* ignorér */ }
  }
  const show = !failWarned || manual;
  failWarned = true;
  await notifyRescue(t('storage.saveFailed'), show, rescue);
}

/** Kort diagnose til fejlmeldinger: gemte spil, kvote, varig lagring, visningstilstand og indbygget browser. Kaster aldrig. */
export async function storageDiag(extra: Record<string, unknown> = {}): Promise<string> {
  const d: Record<string, unknown> = { ...extra };
  try { d.ls = (() => { try { return localStorage.length; } catch { return 'err'; } })(); } catch { /* */ }
  try { if (typeof indexedDB === 'undefined') d.idb = 'none'; } catch { d.idb = 'err'; }
  try {
    const est = await navigator.storage?.estimate?.();
    if (est) { d.usedMB = Math.round((est.usage ?? 0) / 1048576); d.quotaMB = Math.round((est.quota ?? 0) / 1048576); }
  } catch { d.est = 'err'; }
  try { d.persisted = await navigator.storage?.persisted?.(); } catch { d.persisted = 'err'; }
  try {
    d.standalone = typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches;
    d.inApp = /; wv\)|FBAN|FBAV|Instagram|Line\/|MicroMessenger|GSA\//i.test(navigator.userAgent);
  } catch { /* */ }
  return Object.entries(d).map(([k, v]) => `${k}=${String(v)}`).join(' ');
}
