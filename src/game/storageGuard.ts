// Fuld disk/lagerkvote (QuotaExceededError, "Encountered full disk while opening backing store for indexedDB.open"): spillet må aldrig
// gå ned på det. Gemning viser én tydelig besked pr. session (indtil et gem lykkes igen) og spillet fortsætter; fejlen meldes til admin én gang.
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

let warned = false;
let reported = false;
let failWarned = false;
let failReported = false;
/** Et gem lykkedes: næste fejl må vise beskeden igen */
export function storageWorks() { warned = false; failWarned = false; }
/** Kun til tests */
export function resetStorageGuard() { warned = false; reported = false; failWarned = false; failReported = false; }

/** Vis beskeden (højst én gang, indtil et gem lykkes; et manuelt gem viser den altid) og meld fejlen til admin (højst én gang pr. session). Kaster aldrig. */
export async function handleStorageFull(e: unknown, manual: boolean): Promise<void> {
  if (!reported) {
    reported = true;
    try { const { reportError } = await import('../online/errors'); reportError(e instanceof Error ? e : new Error(String(e))); } catch { /* ignorér */ }
  }
  if (warned && !manual) return;
  warned = true;
  try {
    const { askNotice } = await import('../ui/confirm');
    await askNotice(t('storage.full'));
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
export async function guardWrite<T>(fn: (store?: UseStore) => Promise<T>, manual = false): Promise<T> {
  let first: unknown;
  try { const r = await fn(); storageWorks(); return r; }
  catch (e) {
    if (isQuotaError(e)) { await handleStorageFull(e, manual); throw new StorageFullError(e); }
    first = e;
  }
  await new Promise((r) => setTimeout(r, retry.delayMs));
  try { const r = await fn(freshStore()); storageWorks(); return r; }
  catch (e) {
    if (isQuotaError(e)) { await handleStorageFull(e, manual); throw new StorageFullError(e); }
    await handleSaveFailed(e, manual, first);
    throw e;
  }
}

/** Gemningen fejlede af en anden grund end fuld disk (fx IndexedDB utilgængelig/ryddet, privat tilstand, indbygget browser): meld til admin (højst én gang
 *  pr. session, med diagnose) og vis spilleren en tydelig besked (højst én gang, indtil et gem lykkes; manuelt gem viser den altid). Kaster aldrig. */
export async function handleSaveFailed(e: unknown, manual: boolean, first?: unknown): Promise<void> {
  if (!failReported) {
    failReported = true;
    try {
      const { reportError } = await import('../online/errors');
      const { saveStoreDiagText } = await import('./saveStore');
      reportError(new Error(`SaveFailed: ${describeStorageError(e)}${first !== undefined || e === null ? ` [first: ${describeStorageError(first)}; retried]` : ''} | ${await storageDiag()} ${await saveStoreDiagText()}`));
    } catch { /* ignorér */ }
  }
  if (failWarned && !manual) return;
  failWarned = true;
  try {
    const { askNotice } = await import('../ui/confirm');
    await askNotice(t('storage.saveFailed'));
  } catch { /* ingen dialog: spillet fortsætter */ }
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
