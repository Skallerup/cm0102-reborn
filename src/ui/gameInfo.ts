// Oplysninger om det kørende spil (database, udgave, spiltilstand, kampmotor, klub, dato …): vises under "Om dette spil" (Game Options /
// Options) og sendes med i fejlrapporter og forslag (fællesskabet), så udvikleren kan genskabe situationen.
import { APP_VERSION } from '../version';
import { gs, hasGame } from '../game/state';
import { cmDatabase } from '../game/newgame';
import { gridEngineOn } from '../game/sim';
import { authentic } from '../game/rules';
import { getTheme } from './theme';
import { getLang } from '../i18n';

export interface InfoRow { k: string; v: string }

const ls = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };

/** Databasen i klar tekst: originalens udgave (3.9.60/3.9.65/3.9.68), CM 2026/27 eller transfermarkt-databasen */
export function databaseLabel(): string {
  if (!hasGame()) return '-';
  const g = gs();
  const kind = cmDatabase(g);
  if (kind === 'original') return `CM 01/02 original ${g.dbVersion ?? '3.9.60'}`;
  if (kind === 'cm') return `CM 2026/27${g.dbVersion ? ` (${g.dbVersion})` : ''}`;
  return 'Modern (transfermarkt)';
}

/** Kampmotoren, der spiller brugerens kampe: originalens (gittermotoren) eller standardmotoren (zonemotoren) */
export function engineLabel(): string {
  if (!hasGame()) return '-';
  const g = gs();
  const on = gridEngineOn(g);
  const dev = ls('cm0102.engine');
  return `${on ? 'Original (grid)' : 'Standard (zone)'}${g.options.engine ? ` · option ${g.options.engine}` : ''}${dev ? ` · dev ${dev}` : ''}`;
}

/** Alle brugbare oplysninger om spillet og enheden (rækkefølge = visningens) */
export function gameInfo(route?: string): InfoRow[] {
  const rows: InfoRow[] = [{ k: 'Version', v: APP_VERSION }];
  if (hasGame()) {
    const g = gs();
    const club = g.clubs[g.userClub];
    const lg = club ? g.leagues[club.league] : undefined;
    const pos = club && lg ? g.comps[club.league]?.table?.findIndex?.((r: { club: number }) => r.club === g.userClub) : -1;
    rows.push(
      { k: 'Database', v: databaseLabel() },
      { k: 'Mode', v: `${g.options.mode ?? 'extended'}${g.options.mode === 'authentic' && !authentic() ? ' (inactive: modern look)' : ''}` },
      { k: 'Look', v: getTheme() === 'retro' ? 'classic' : `modern (${getTheme()})` },
      { k: 'Match engine', v: engineLabel() },
      { k: 'Rules', v: `${g.options.rules ?? 'modern'} · masking ${g.options.masking ? 'on' : 'off'} · windows ${g.options.transferWindows ?? 'real'}` },
      { k: 'Date', v: `${g.date} · season ${g.season}/${String((g.season + 1) % 100).padStart(2, '0')} · ${g.seasonHistory.length + 1}. season` },
      { k: 'Club', v: club ? `${club.name} (${club.id})${lg ? ` · ${lg.name}${pos !== undefined && pos >= 0 ? ` #${pos + 1}` : ''}` : ''}` : 'unemployed' },
      { k: 'Manager', v: `${g.manager.name} · rep ${g.manager.rep}` },
      { k: 'Nations', v: `${g.activeNations.length} playable` },
      { k: 'Game', v: [`id ${g.id}`, `seed ${g.seed}`, `save v${g.version}`, g.challenge ? 'challenge' : '', g.draft ? 'draft' : '', g.localMp ? 'hot-seat' : '',
        g.humans && g.humans.length > 1 ? `${g.humans.length} managers` : '', g.options.autosave === false ? 'autosave off' : ''].filter(Boolean).join(' · ') },
    );
  }
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const standalone = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches;
  rows.push(
    { k: 'Language', v: getLang() },
    { k: 'Screen', v: typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio ?? 1}x${standalone ? ' · installed' : ''}` : '-' },
    { k: 'Browser', v: nav ? nav.userAgent.replace(/\(([^)]*)\)/, '($1)').slice(0, 160) : '-' },
  );
  if (route) rows.push({ k: 'Screen route', v: route });
  if (typeof location !== 'undefined') rows.push({ k: 'Site', v: `${location.host}${location.search}` });
  return rows;
}

/** Samme oplysninger som én linje (fejlrapportens/forslagets `meta`, højst 1000 tegn) */
export function gameInfoMeta(route?: string): string {
  return gameInfo(route).map((r) => `${r.k}: ${r.v}`).join(' | ').slice(0, 1000);
}
