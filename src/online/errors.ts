// Fejl i spillernes browsere → admin (fanen "Errors"): window-fejl, afviste promises og React-nedbrud. Samme fejl sendes
// højst 3 gange pr. side, højst 20 i alt, og kun fra den rigtige side (ikke udvikling/tests). Ingen personlige data.
import { APP_VERSION } from '../version';
import { rankingAvailable } from './rank';
import { previewInfo } from '../game/state';
import { reloadOnce } from '../ui/lazyLoad';

const sent = new Map<string, number>();
let total = 0;
// Støj, der ikke er spillets: browserudvidelser (krypto-wallets sætter window.ethereum, Firefox på iOS injicerer __firefox__),
// indlejrede browsere i apps (Android WebView: "Java object is gone") og netværksfejl
const IGNORE = /^Error: online$|ResizeObserver loop|Script error\.?$|chrome-extension:|moz-extension:|safari-extension:|safari-web-extension:|window\.ethereum|selectedAddress|__firefox__|Java object is gone|Load failed|Importing a module script failed|Unable to preload CSS|NetworkError|Failed to fetch|AbortError|The play\(\) request/i;

export function reportError(err: unknown, extra?: string) {
  // admin-preview af en spillers spil: fejlen står i konsollen – den skal ikke tælle som en spillers fejl
  if (import.meta.env.DEV || !rankingAvailable() || previewInfo()) return;
  const e = err instanceof Error ? err : new Error(String((err as { message?: string })?.message ?? err));
  // fuld disk er allerede vist for spilleren og meldt én gang (game/storageGuard.ts) – ikke igen fra window-handlerne
  if (e.name === 'StorageFullError') return;
  const msg = `${e.name}: ${e.message}`.slice(0, 300);
  const stack = `${e.stack ?? ''}${extra ? `\n--- component stack ---${extra}` : ''}`;
  if (IGNORE.test(msg) || IGNORE.test(stack.split('\n')[1] ?? '')) return;
  const n = sent.get(msg) ?? 0;
  if (n >= 3 || total >= 20) return;
  sent.set(msg, n + 1); total++;
  const root = document.documentElement;
  const body = {
    op: 'error', msg, stack: stack.slice(0, 3000), ver: APP_VERSION, url: location.pathname + location.search.slice(0, 60),
    theme: root.dataset.skin === 'retro' ? 'classic' : 'modern', lang: root.lang, ua: navigator.userAgent.slice(0, 160),
  };
  try { void fetch('/api/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {}); } catch { /* ignorér */ }
}

// efter en ny udgivelse hænger en gammel side på filer, der er væk: genindlæs højst én gang pr. minut (vagten ligger i ui/lazyLoad.ts)
const STALE = /Importing a module script failed|Unable to preload CSS|Failed to fetch dynamically imported module|error loading dynamically imported module/i;

// Genindlæses siden, mens et nyt spil oprettes (ingen JS-fejl: browseren/appen har lukket siden – typisk for lidt hukommelse i en
// indbygget browser som Facebooks), ender spilleren på forsiden uden spil. Det meldes til admin ved næste start (21/11).
const CREATING = 'cm0102.creating';
export function markNewGame(on: boolean) {
  try { if (on) localStorage.setItem(CREATING, String(Date.now())); else localStorage.removeItem(CREATING); } catch { /* ingen lagring */ }
}
let interrupted: boolean | null = null;
/** Siden blev lukket under et nyt spil (læst én gang ved sidens start): forsiden og spillet viser beskeden (ui/InAppBanner.tsx) */
export function newGameInterrupted(): boolean {
  if (interrupted !== null) return interrupted;
  let at = 0;
  try { at = Number(localStorage.getItem(CREATING)) || 0; if (at) localStorage.removeItem(CREATING); } catch { /* ingen lagring */ }
  interrupted = !!at && Date.now() - at < 15 * 60_000;
  if (interrupted) reportError(new Error(`NewGameInterrupted: the page was reloaded ${Math.round((Date.now() - at) / 1000)} s into creating a new game`));
  return interrupted;
}
/** beskeden er lukket – vises ikke igen i samme besøg */
export function dismissNewGameInterrupted() { interrupted = false; }

export function startErrorReport() {
  newGameInterrupted();
  window.addEventListener('vite:preloadError', (ev) => { if (reloadOnce()) ev.preventDefault(); });
  window.addEventListener('unhandledrejection', (ev) => { if (STALE.test(String((ev.reason as Error)?.message ?? ev.reason))) reloadOnce(); });
  window.addEventListener('error', (ev) => reportError(ev.error ?? ev.message));
  window.addEventListener('unhandledrejection', (ev) => reportError(ev.reason));
}
