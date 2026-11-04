import { getLang } from '../i18n';

// skærmbilleder, der findes på hvert sprog med landets egne klubber (scripts/screenshots-i18n.mjs)
const LOCAL = new Set(['modern-squad', 'modern-player', 'modern-table', 'classic-squad', 'classic-player', 'classic-table',
  'tactics', 'club', 'ranking', 'match', 'match-stats', 'report', 'press', 'mobile']);
const ALIAS: Record<string, string> = { player: 'modern-player', table: 'modern-table' };

/** URL til et skærmbillede på det valgte sprog (draft-billederne findes kun på engelsk) */
export function shot(name: string): string {
  const n = ALIAS[name] ?? name;
  return `${import.meta.env.BASE_URL}landing/${LOCAL.has(n) ? `${getLang()}/` : ''}${n}.webp`;
}
