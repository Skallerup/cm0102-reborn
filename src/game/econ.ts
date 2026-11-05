// Prisniveauet pr. database. Den originale 01/02-database spilles i 2001-priser: spillerværdierne følger
// originalens egen kurve (CA 180 ≈ £18 mio.), og de faste beløb (TV-penge, sponsorer, præmier, billetpriser,
// grænser) skaleres pr. liga med forholdet mellem ligaens trupværdier i 2001-priser og i nutidens priser
// (måles ved spilstart i newgame.ts og gemmes i GameState.econ, så økonomien hænger sammen i hver liga).
// Standarddatabasen og gemte spil fra før 2001-priserne bruger 1. Mål: scripts/econ-run.ts.

export interface Economy { k: number; leagues: Record<string, number> }
let cur: Economy | null = null;
/** Sættes, når et spil indlæses eller oprettes (state.setGame) */
export function setEconomy(e: Economy | null | undefined) { cur = e ?? null; }
/** Pengeniveauet for en liga (uden liga: det fælles niveau): gang faste beløb med det */
export const econ = (league?: string) => (cur ? (league !== undefined ? cur.leagues[league] ?? cur.k : cur.k) : 1);
/** Spilles der i 2001-priser (originalens værdikurve)? */
export const isEra2001 = () => !!cur;
