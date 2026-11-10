// Prisniveauet pr. database. Den originale 01/02-database spilles i 2001-priser: spillerværdierne følger
// originalens egen kurve (CA 180 ≈ £18 mio.), og de faste beløb (TV-penge, sponsorer, præmier, billetpriser,
// grænser) skaleres pr. liga med forholdet mellem ligaens trupværdier i 2001-priser og i nutidens priser
// (måles ved spilstart i newgame.ts og gemmes i GameState.econ, så økonomien hænger sammen i hver liga).
// Standarddatabasen og gemte spil fra før 2001-priserne bruger 1. Mål: scripts/econ-run.ts.

export interface Economy {
  k: number; leagues: Record<string, number>;
  /** indtægterne (TV, sponsor, merchandise, billetter, præmier) i forhold til lønniveauet – kalibreret til
   *  2001/02, hvor Premier League-klubberne brugte ca. 60 % af omsætningen på løn (Deloitte). Mangler = 1 */
  income?: number;
  /** originalens lønkurve, tilpasset dens egne lønninger ved spilstart: løn = e^(a[liga] + b·ln(værdi) + c·klubomdømme) */
  wageFit?: { b: number; c: number; a: Record<string, number>; a0: number; rep: Record<string, number> };
}
let cur: Economy | null = null;
/** Sættes, når et spil indlæses eller oprettes (state.setGame) */
export function setEconomy(e: Economy | null | undefined) { cur = e ?? null; }
/** Pengeniveauet for en liga (uden liga: det fælles niveau): gang faste beløb med det */
export const econ = (league?: string) => (cur ? (league !== undefined ? cur.leagues[league] ?? cur.k : cur.k) : 1);
/** Spilles der i 2001-priser (originalens værdikurve)? */
export const isEra2001 = () => !!cur;
/** Indtægtsniveauet for en liga: pengeniveauet × indtægtsfaktoren (kun den originale database har en) */
export const econIncome = (league?: string) => econ(league) * (cur?.income ?? 1);
/** Originalens lønkurve (kun den originale database): ugeløn for en spiller med værdien `value` i ligaen */
export function fittedWage(value: number, league?: string, clubRep?: number): number | null {
  const f = cur?.wageFit;
  if (!f) return null;
  const a = (league !== undefined ? f.a[league] : undefined) ?? f.a0;
  const r = clubRep ?? (league !== undefined ? f.rep[league] : undefined) ?? 50;
  return Math.exp(a + f.b * Math.log(Math.max(20_000, value)) + f.c * r);
}
