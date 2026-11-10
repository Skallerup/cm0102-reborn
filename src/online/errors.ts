// Fejl i spillernes browsere → admin (fanen "Errors"): window-fejl, afviste promises og React-nedbrud. Samme fejl sendes
// højst 3 gange pr. side, højst 20 i alt, og kun fra den rigtige side (ikke udvikling/tests). Ingen personlige data.
import { APP_VERSION } from '../ui/changelogData';
import { rankingAvailable } from './rank';
import { previewInfo } from '../game/state';

const sent = new Map<string, number>();
let total = 0;
const IGNORE = /ResizeObserver loop|Script error\.?$|chrome-extension:|moz-extension:|safari-extension:|Load failed|NetworkError|Failed to fetch|AbortError|The play\(\) request/i;

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

export function startErrorReport() {
  window.addEventListener('error', (ev) => reportError(ev.error ?? ev.message));
  window.addEventListener('unhandledrejection', (ev) => reportError(ev.reason));
}
