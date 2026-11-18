// Gamle udvidede spil (docs/ALWAYS_ORIGINAL.md trin 4): beskeden ved åbning vises én gang pr. spil. Valget huskes i browseren (ikke i spillet).
import { t } from '../i18n';

const key = (id: string) => `cm0102.legacyExt.${id}`;

export function legacyNoticeSeen(id: string): boolean {
  try { return localStorage.getItem(key(id)) !== null; } catch { return false; }
}
export function markLegacyNoticeSeen(id: string, choice: 'convert' | 'new' | 'keep'): void {
  try { localStorage.setItem(key(id), choice); } catch { /* privat vindue */ }
}
/** Skal beskeden vises nu? (kun et gammelt udvidet spil, og kun første gang) */
export const shouldShowLegacyNotice = (ext: boolean | null | undefined, id: string): boolean => !!ext && !legacyNoticeSeen(id);

/** Vis beskeden og husk valget. 'convert' = lav en kopi med originalens logik (den originale database), 'new' = start et nyt spil, 'keep' = fortsæt som før */
export async function askLegacyNotice(id: string, canConvert: boolean): Promise<'convert' | 'new' | 'keep'> {
  const { askConfirm } = await import('./confirm'); // først ved brug (de rene funktioner kan testes uden DOM)
  const yes = await askConfirm(t(canConvert ? 'legacyExt.q.convert' : 'legacyExt.q.new'), {
    title: t('legacyExt.title'), ok: t(canConvert ? 'legacyExt.convert' : 'legacyExt.new'), cancel: t('legacyExt.keep'),
  });
  const choice = yes ? (canConvert ? 'convert' : 'new') : 'keep';
  markLegacyNoticeSeen(id, choice);
  return choice;
}
