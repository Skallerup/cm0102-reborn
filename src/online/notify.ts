// Fortæller serveren (api/notify.ts), at en ny singleplayer-karriere er startet, så den vises i
// admin under "New careers" – med udseendet (klassisk/moderne). En lille "puls" hvert andet minut, mens
// fanen er synlig, viser i admin, om spilleren er online. Fire-and-forget: fejl og manglende server ignoreres.
import { rankingAvailable } from './rank';
import { getTheme } from '../ui/theme';
import { gs, hasGame, previewInfo } from '../game/state';
import { sortTable } from '../game/competitions';

const VID = 'cm0102.visitor';
/** Anonymt id for denne browser (ingen personoplysninger) */
export function visitorId(): string {
  try {
    let v = localStorage.getItem(VID);
    if (!v) { v = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 20); localStorage.setItem(VID, v); }
    return v;
  } catch { return ''; }
}
const theme = () => (getTheme() === 'retro' ? 'classic' : 'modern');

const post = (body: unknown) => fetch('/api/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});

export function notifyNewCareer(info: { manager: string; club: string; league?: string; nation?: string; challenge?: string; bots: number; db: string; lang: string }): void {
  if (!rankingAvailable() || previewInfo()) return;
  // spillets id og startdato, så admin kan følge, hvor langt karrieren er nået (pulsen nedenfor)
  const g = hasGame() ? gs() : null;
  void post({ ...info, vid: visitorId(), theme: theme(), gid: g?.id, start: g?.date, mode: g?.options.mode ?? 'extended' });
}

/** Hvor langt det åbne singleplayer-spil er: spildato, klub og placering i ligaen (vises i admin under New careers) */
function progress(): { gid: string; date: string; club: string; pos: number } | undefined {
  try {
    if (!hasGame() || previewInfo()) return undefined;
    const g = gs();
    if (g.humans?.length || g.draft || !g.id) return undefined;
    const c = g.clubs[g.userClub];
    const comp = c ? g.comps[c.league] : undefined;
    const pos = comp?.table?.length ? sortTable(comp.table).findIndex((r) => r.club === c!.id) + 1 : 0;
    return { gid: g.id, date: g.date, club: c?.short ?? '', pos };
  } catch { return undefined; }
}

let last = 0;
function ping() {
  if (document.visibilityState !== 'visible' || Date.now() - last < 100_000) return;
  last = Date.now();
  const vid = visitorId();
  if (vid) void post({ op: 'ping', vid, theme: theme(), prog: progress() });
}

/** Start pulsen (kaldes én gang fra main.tsx) */
export function startPresence() {
  if (!rankingAvailable()) return;
  ping();
  setInterval(ping, 120_000);
  document.addEventListener('visibilitychange', ping);
}
