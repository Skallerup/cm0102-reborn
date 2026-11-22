// Fuld disk/lagerkvote (QuotaExceededError, "Encountered full disk while opening backing store for indexedDB.open"): spillet må aldrig
// gå ned på det. Gemning viser én tydelig besked pr. session (indtil et gem lykkes igen) og spillet fortsætter; fejlen meldes til admin én gang.
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

/** Kør en skrivning til IndexedDB: ved fuld disk behandles fejlen, og StorageFullError kastes; øvrige fejl kastes uændret */
export async function guardWrite<T>(fn: () => Promise<T>, manual = false): Promise<T> {
  try { const r = await fn(); storageWorks(); return r; }
  catch (e) {
    if (!isQuotaError(e)) { await handleSaveFailed(e, manual); throw e; }
    await handleStorageFull(e, manual);
    throw new StorageFullError(e);
  }
}

/** Gemningen fejlede af en anden grund end fuld disk (fx IndexedDB utilgængelig/ryddet, privat tilstand, indbygget browser): meld til admin (højst én gang
 *  pr. session, med diagnose) og vis spilleren en tydelig besked (højst én gang, indtil et gem lykkes; manuelt gem viser den altid). Kaster aldrig. */
export async function handleSaveFailed(e: unknown, manual: boolean): Promise<void> {
  if (!failReported) {
    failReported = true;
    try {
      const err = e as { name?: string; message?: string } | null;
      const { reportError } = await import('../online/errors');
      reportError(new Error(`SaveFailed: ${err?.name ?? ''} ${String(err?.message ?? e).slice(0, 120)} | ${await storageDiag()}`));
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
