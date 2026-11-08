// Spillerværdier som i originalen (kun den originale database): tilpasset 3.134 spilleres værdier fra originalens
// egen Player Search (ejerens CM 01/02, 3.9.60, 14/7-01 – "Famous players in your region"). Originalen sætter værdien ud
// fra evne, alder, klubbens omdømme, lønnen, spillerens omdømme (databasens hjemme/nuværende/verdens-omdømme) og ligaen –
// ikke kun evnen (Duff i Blackburn £6M, Zamora i Brighton £350K). Spredningen omkring formlen er ca. ×1,7 (log-rms 0,51;
// vores gamle kurve: 0,94) – resten er individuelt og kendes ikke. *estimeret* for ligaer uden målinger.

/** ligaens tillæg (log) i forhold til Premier League; nøgle = landets navn (1. række) eller "<land>-low"/"England<række>" */
const LEAGUE: Record<string, number> = {
  England2: -0.21, England3: -0.988, England4: -1.574,
  Argentina: -0.46, Austria: -0.188, Belgium: -0.203, Brazil: -0.398, Croatia: -1.085, 'Czech Republic': -1.536,
  Denmark: -0.407, France: -0.322, Germany: 0.028, Greece: -0.559, Holland: -0.037, Italy: 0.078, Japan: -0.314,
  Mexico: -0.708, Norway: -0.552, Poland: -1.335, Portugal: -0.69, Russia: -1.307, Scotland: -0.144,
  'South Korea': -2.165, Spain: 0.055, Turkey: -0.087, 'United States': -0.205, 'Germany-low': -0.189,
  'Hungary-low': -1.92, 'Israel-low': -1.176, 'Italy-low': -0.301, 'Romania-low': -1.655, 'Scotland-low': -2.644,
  'South Africa-low': -0.394, 'Spain-low': -0.528, 'Ukraine-low': -1.614, 'Yugoslavia-low': -1.005,
};

/**
 * Værdien i pund. `nation` = klubbens land, `tier` = ligaens række (uden klub: 9), `clubRep` 0-100, `wageGbp` = ugeløn,
 * `rep` = databasens omdømme [hjemme, nuværende, verden] (0-200). Ukendte ligaer: de sjældne ligaer i målingen samlet.
 */
export function originalValueGbp(ca: number, age: number, clubRep: number, wageGbp: number, nation: string | undefined, tier: number, rep: [number, number, number]): number {
  const key = tier === 1 ? nation ?? '' : nation === 'England' ? `England${tier}` : `${nation ?? ''}-low`;
  const lg = nation === 'England' && tier === 1 ? 0 : LEAGUE[key] ?? (tier === 1 ? -1.654 : -1.491);
  const ln = 12.86889 + 0.01346 * ca - 0.08142 * age - 0.01159 * (age - 27) ** 2 + 0.01249 * clubRep
    + 0.0756 * Math.log(Math.max(100, wageGbp)) + 0.00348 * rep[0] + 0.00085 * rep[1] + 0.00231 * rep[2] + lg;
  return Math.exp(ln);
}

/** Uden databasens omdømme (fx nye spillere): ud fra spillerens omdømme i spillet (0-100) */
export const repTriple = (rep: number): [number, number, number] => [rep * 2, rep * 2, rep * 1.6];
