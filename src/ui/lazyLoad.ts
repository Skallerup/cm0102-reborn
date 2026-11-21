// Robust React.lazy: efter en ny udgivelse (eller i en indbygget browser uden service worker) kan import() blive afvist, eller
// vite:preloadError + preventDefault (online/errors.ts) kan give undefined i stedet for et modul – så kastede React "reading 'default'".
// Her: én automatisk genindlæsning (sessionStorage-vagt mod løkker), ellers en lille fejlskærm med en genindlæs-knap.
import { createElement, lazy, type ComponentType } from 'react';
import { t } from '../i18n';

const KEY = 'cm0102.preloadReload';
const WINDOW_MS = 60_000;

/** Genindlæser siden – dog højst én gang pr. minut i denne fane. Returnerer true, hvis der genindlæses. */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY));
    if (last && Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { return false; }
  location.reload();
  return true;
}

function LoadFailed() {
  return createElement('div', { className: 'progress' },
    createElement('div', null, t('start.loadFailed'), ' ',
      createElement('button', { className: 'small primary', onClick: () => location.reload() }, t('start.reloadBtn'))));
}

function failed(err?: unknown): Promise<{ default: ComponentType<any> }> {
  // spillet kunne ikke hentes – genindlæsningen fører tilbage til forsiden: meld det til admin (kun fejltypen – selve teksten, fx "Load failed", filtreres fra som støj i errors.ts)
  void import('../online/errors').then(({ reportError }) => reportError(new Error(`LazyLoadFailed: ${err ? (err as Error).name ?? 'error' : 'no module'}`))).catch(() => {});
  if (reloadOnce()) return new Promise<never>(() => {}); // siden genindlæses – vent
  return Promise.resolve({ default: LoadFailed });
}

/** lazy(), der aldrig lader React læse undefined.default */
export function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T } | undefined | null>) {
  return lazy<T>(() => load().then((m) => m ?? (failed() as Promise<{ default: T }>), (e) => failed(e) as Promise<{ default: T }>));
}
