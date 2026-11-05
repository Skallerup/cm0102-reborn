// Fortæller serveren (api/notify.ts), at en ny singleplayer-karriere er startet, så den vises i
// admin under "New careers" – med udseendet (klassisk/moderne). En lille "puls" hvert andet minut, mens
// fanen er synlig, viser i admin, om spilleren er online. Fire-and-forget: fejl og manglende server ignoreres.
import { rankingAvailable } from './rank';
import { getTheme } from '../ui/theme';

const VID = 'cm0102.visitor';
/** Anonymt id for denne browser (ingen personoplysninger) */
function visitorId(): string {
  try {
    let v = localStorage.getItem(VID);
    if (!v) { v = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 20); localStorage.setItem(VID, v); }
    return v;
  } catch { return ''; }
}
const theme = () => (getTheme() === 'retro' ? 'classic' : 'modern');

const post = (body: unknown) => fetch('/api/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});

export function notifyNewCareer(info: { manager: string; club: string; league?: string; nation?: string; challenge?: string; bots: number; db: string; lang: string }): void {
  if (!rankingAvailable()) return;
  void post({ ...info, vid: visitorId(), theme: theme() });
}

let last = 0;
function ping() {
  if (document.visibilityState !== 'visible' || Date.now() - last < 100_000) return;
  last = Date.now();
  const vid = visitorId();
  if (vid) void post({ op: 'ping', vid, theme: theme() });
}

/** Start pulsen (kaldes én gang fra main.tsx) */
export function startPresence() {
  if (!rankingAvailable()) return;
  ping();
  setInterval(ping, 120_000);
  document.addEventListener('visibilitychange', ping);
}
