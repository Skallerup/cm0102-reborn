// Hvilken slags et gemt spil er (listen over gemte spil og konverteringen af gamle spil – cmConvert.ts)
import type { GameState } from './types';
import { CM_SAVE_VER, cmDatabase } from './newgame';

export type SaveKind = 'current' | 'oldOriginal' | 'modern' | 'other';

/** Hvad et gemt spil er: 'oldOriginal' = den originale database uden originalens systemer (kan konverteres), 'modern' = 2026/27 eller den
 *  moderne database (kan startes forfra i den originale), 'other' = fællesspil/draft (røres ikke) */
export function saveKindOf(g: GameState): SaveKind {
  if (g.humans?.length || g.draft) return 'other';
  const db = cmDatabase(g);
  if (db !== 'original') return 'modern';
  if (g.cmSaveVer && g.cmSaveVer >= CM_SAVE_VER && g.options.mode === 'authentic') return 'current';
  if (g.options.mode !== 'authentic') return 'oldOriginal';
  // ægte tilstand fra før originalens systemer: mangler bestyrelsen, økonomien eller de interne egenskaber
  if (!g.cmBoard || !g.cmFin || !g.cmPlan || !Object.values(g.players).some((p) => p.cmInt)) return 'oldOriginal';
  return 'current';
}

/** Samme vurdering af den udpakkede tekst (listen over gemte spil – uden at bygge hele spillet). null = kan ikke afgøres */
export function saveKindFromText(s: string): SaveKind | null {
  if (!s.startsWith('{')) return null;
  if (/"humans":\[\{/.test(s) || /"draft":\{/.test(s)) return 'other';
  if (!s.includes('"dbKind":"cm0102"')) return 'modern';
  const y = s.match(/"dbYear":(\d+)/);
  if (y && +y[1] >= 2020) return 'modern';
  if (!y) return null;
  if (!s.includes('"mode":"authentic"')) return 'oldOriginal';
  if (/"cmSaveVer":(\d+)/.test(s) && +(s.match(/"cmSaveVer":(\d+)/)![1]) >= CM_SAVE_VER) return 'current';
  if (!s.includes('"cmBoard":{') || !s.includes('"cmFin":{') || !s.includes('"cmPlan":{') || !s.includes('"cmInt":[')) return 'oldOriginal';
  return 'current';
}

