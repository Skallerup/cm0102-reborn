import { getLang } from '../i18n';

// skærmbilleder, der findes på hvert sprog med landets egne klubber (scripts/screenshots-i18n.mjs)
const LOCAL = new Set(['classic-start', 'classic-match', 'classic-report', 'classic-tactics', 'classic-squad', 'classic-news', 'classic-transfer',
  'classic-player', 'classic-table', 'mobile']);
const ALIAS: Record<string, string> = {};

/** URL til et skærmbillede på det valgte sprog (draft-billederne findes kun på engelsk) */
export function shot(name: string): string {
  const n = ALIAS[name] ?? name;
  return `${import.meta.env.BASE_URL}landing/${LOCAL.has(n) ? `${getLang()}/` : ''}${n}.webp`;
}
