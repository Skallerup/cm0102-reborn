// Robust React.lazy: efter en ny udgivelse (eller i en indbygget browser uden service worker) kan import() blive afvist, eller
// vite:preloadError + preventDefault (online/errors.ts) kan give undefined i stedet for et modul – så kastede React "reading 'default'".
// Her: én automatisk genindlæsning (sessionStorage-vagt mod løkker), ellers en lille fejlskærm med en genindlæs-knap.
import { createElement, lazy, type ComponentType } from 'react';
import { t } from '../i18n';
import { allowSelfReload } from '../online/newGameTrace';

const KEY = 'cm0102.preloadReload';
const WINDOW_MS = 60_000;

let reloading = false;
/** kun til tests */
export function resetReloadingForTest() { reloading = false; }

/** Hård genindlæsning: afregistrer service workeren, tømmer alle caches og henter siden igen med en ny url (`_r`), så hverken SW-cachen
 *  eller browserens/den indbyggede browsers HTTP-cache kan give den gamle index.html tilbage (iPhone/Facebook-link, 22/11). */
/** (24/11) Mens et nyt spil oprettes, genindlæses der aldrig automatisk (spillet ville gå tabt midt i oprettelsen): årsagen står i sporet
 *  (online/newGameTrace.ts), og fejlen meldes i stedet. `user` = spilleren har selv trykket genindlæs (tillades, men skrives i sporet). */
function blocked(reason: string, user: boolean): boolean {
  if (allowSelfReload(reason, user)) return false;
  void import('../online/errors').then(({ reportError }) => reportError(new Error(`NewGameSelfReloadBlocked: ${reason}`))).catch(() => {});
  return true;
}

export function hardReload(reason = 'button', user = true): boolean {
  if (blocked(reason, user)) return false;
  reloading = true;
  const go = () => {
    try {
      const u = new URL(location.href);
      u.searchParams.set('_r', String(Date.now()));
      location.replace(u.toString());
    } catch { location.reload(); }
  };
  const done = setTimeout(go, 2500); // hænger oprydningen, genindlæses der alligevel
  void (async () => {
    try { for (const r of (await navigator.serviceWorker?.getRegistrations()) ?? []) await r.unregister(); } catch { /* ingen SW */ }
    try { for (const k of (await caches?.keys()) ?? []) await caches.delete(k); } catch { /* ingen cache */ }
  })().finally(() => { clearTimeout(done); go(); });
  return true;
}

/** Genindlæser siden (hårdt, se hardReload) – dog højst én gang pr. minut i denne fane. Returnerer true, hvis der genindlæses. */
export function reloadOnce(reason = 'auto'): boolean {
  if (blocked(reason, false)) return false;
  try {
    const last = Number(sessionStorage.getItem(KEY));
    if (last && Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { return false; }
  return hardReload(reason, false);
}

function LoadFailed() {
  return createElement('div', { className: 'progress' },
    createElement('div', null, t('start.loadFailed'), ' ',
      createElement('button', { className: 'small primary', onClick: () => hardReload('loadFailedButton', true) }, t('start.reloadBtn'))));
}

function failed(err?: unknown): Promise<{ default: ComponentType<any> }> {
  // spillet kunne ikke hentes – genindlæsningen fører tilbage til forsiden: meld det til admin (kun fejltypen – selve teksten, fx "Load failed", filtreres fra som støj i errors.ts)
  if (!reloading) void import('../online/errors').then(({ reportError }) => reportError(new Error(`LazyLoadFailed: ${err ? (err as Error).name ?? 'error' : 'no module'}`))).catch(() => {});
  if (reloading || reloadOnce('lazyLoad')) return new Promise<never>(() => {}); // siden genindlæses – vent (meldes ikke: kun hvis genindlæsningen ikke hjalp)
  return Promise.resolve({ default: LoadFailed });
}

/** lazy(), der aldrig lader React læse undefined.default */
export function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T } | undefined | null>) {
  return lazy<T>(() => load().then((m) => m ?? (failed() as Promise<{ default: T }>), (e) => failed(e) as Promise<{ default: T }>));
}
