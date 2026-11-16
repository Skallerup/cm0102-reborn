// Fejl i spillernes browsere → admin (fanen "Errors"): window-fejl, afviste promises og React-nedbrud. Samme fejl sendes
// højst 3 gange pr. side, højst 20 i alt, og kun fra den rigtige side (ikke udvikling/tests). Ingen personlige data.
import { APP_VERSION } from '../version';
import { rankingAvailable } from './rank';
import { previewInfo } from '../game/state';

const sent = new Map<string, number>();
let total = 0;
// Støj, der ikke er spillets: browserudvidelser (krypto-wallets sætter window.ethereum, Firefox på iOS injicerer __firefox__),
// indlejrede browsere i apps (Android WebView: "Java object is gone") og netværksfejl
const IGNORE = /^Error: online$|ResizeObserver loop|Script error\.?$|chrome-extension:|moz-extension:|safari-extension:|safari-web-extension:|window\.ethereum|selectedAddress|__firefox__|Java object is gone|Load failed|Importing a module script failed|Unable to preload CSS|NetworkError|Failed to fetch|AbortError|The play\(\) request/i;

export function reportError(err: unknown, extra?: string) {
  // admin-preview af en spillers spil: fejlen står i konsollen – den skal ikke tælle som en spillers fejl
  if (import.meta.env.DEV || !rankingAvailable() || previewInfo()) return;
  const e = err instanceof Error ? err : new Error(String((err as { message?: string })?.message ?? err));
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

// efter en ny udgivelse hænger en gammel side på filer, der er væk: genindlæs én gang (sessionStorage-vagt mod løkker)
function reloadOnce(): boolean {
  try {
    if (sessionStorage.getItem('cm0102.preloadReload')) return false;
    sessionStorage.setItem('cm0102.preloadReload', String(Date.now()));
  } catch { return false; }
  location.reload();
  return true;
}
const STALE = /Importing a module script failed|Unable to preload CSS|Failed to fetch dynamically imported module|error loading dynamically imported module/i;

export function startErrorReport() {
  window.addEventListener('vite:preloadError', (ev) => { if (reloadOnce()) ev.preventDefault(); });
  window.addEventListener('unhandledrejection', (ev) => { if (STALE.test(String((ev.reason as Error)?.message ?? ev.reason))) reloadOnce(); });
  window.addEventListener('error', (ev) => reportError(ev.error ?? ev.message));
  window.addEventListener('unhandledrejection', (ev) => reportError(ev.reason));
}
