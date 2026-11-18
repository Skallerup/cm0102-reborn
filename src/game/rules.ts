// Turneringsregler: moderne (5 udskiftninger, 9 på bænken) eller klassiske CM 01/02-regler (3 og 5).
import { gs, hasGame } from './state';
import type { GameState } from './types';

// 2001-reglerne (3 udskiftninger, 5 på bænken) kun med den originale 2001/02-database – en nutidig sæson (fx 2026/27-
// opdateringen i CM-format) spiller efter nutidens regler (5 og 9), også i "Ægte CM 01/02"
export function classicRules(): boolean {
  if (!hasGame()) return false;
  const g = gs();
  return g.options.rules === 'classic' && (g.dbKind !== 'cm0102' || (g.dbYear ?? g.season) < 2020);
}
export const maxSubs = () => (classicRules() ? 3 : 5);

/** (docs/ALWAYS_ORIGINAL.md) det ENESTE sted, der læser spillets tilstand: sand kun for gamle gemte spil i den arvede udvidede tilstand
 *  (`options.mode` ≠ 'authentic'). Spillets logik afhænger aldrig af udseendet (temaet) – samme svar i hovedtråden, Web Workeren og Node. */
export function legacyExtended(g?: GameState): boolean {
  const s = g ?? (hasGame() ? gs() : undefined);
  return !s || s.options.mode !== 'authentic';
}
/** originalens logik (CM 01/02 1:1) – alle spil undtagen de gamle udvidede */
export const origLogic = (g?: GameState): boolean => !legacyExtended(g);

/** KUN UI (src/ui): "originalens skærme" = originalens logik i det klassiske udseende. Motoren (src/game) bruger origLogic/legacyExtended
 *  – tests/originalGate.test.ts fejler, hvis src/game importerer authentic/extended. I Node/Web Worker findes intet tema. */
const classicSkin = () => typeof document === 'undefined' || document.documentElement.dataset.skin === 'retro';
export function authentic(): boolean {
  return origLogic() && classicSkin();
}
/** KUN UI: modsat authentic() (ekstra visninger som xG …) */
export const extended = () => !authentic();
export const benchSize = () => (classicRules() ? 5 : 9);
