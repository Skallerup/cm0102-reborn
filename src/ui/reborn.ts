// CM Reborns egne visnings-tilvalg (docs/ALWAYS_ORIGINAL.md trin 3): kun visning/hjælp/meta, aldrig logik eller tilfældighed.
// Gemmes pr. spil i g.options.reborn. Uden valg (nye spil): fra i det klassiske udseende, som originalen; gamle udvidede spil og det moderne
// udseende beholder deres hidtidige opførsel (til).
import { authentic } from '../game/rules';
import { gs, hasGame } from '../game/state';
import type { RebornKey } from '../game/types';

export const REBORN_KEYS: RebornKey[] = ['achievements', 'matchExtras', 'firstDay', 'articles', 'menus', 'searchPresets', 'helpTexts'];

export function rebornOn(k: RebornKey): boolean {
  const v = hasGame() ? gs().options.reborn?.[k] : undefined;
  return v ?? !authentic();
}
