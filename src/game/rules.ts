// Turneringsregler: moderne (5 udskiftninger, 9 på bænken) eller klassiske CM 01/02-regler (3 og 5).
import { gs, hasGame } from './state';

export function classicRules(): boolean {
  return hasGame() && gs().options.rules === 'classic';
}
export const maxSubs = () => (classicRules() ? 3 : 5);

/** Ægte CM 01/02-oplevelse: kun funktioner, originalen havde (uanset database) */
// gælder kun i det klassiske tema (ejerens ønske) – i Node (tests) findes intet tema, og tilstanden gælder som valgt
const classicSkin = () => typeof document === 'undefined' || document.documentElement.dataset.skin === 'retro';
export function authentic(): boolean {
  return hasGame() && gs().options.mode === 'authentic' && classicSkin();
}
/** Udvidet spil (standard): ekstra funktioner som xG, pressemøder, træningslejr … */
export const extended = () => !authentic();
export const benchSize = () => (classicRules() ? 5 : 9);
