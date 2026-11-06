// Regler fra 2001/02, der kun gælder den originale database (ejerens ønske: den moderne database berøres ikke).
import { cmDatabase } from './newgame';
import { gs } from './state';
import type { Club, Player } from './types';

/** Spilles der med den originale 2001/02-database? */
export const isOriginal2001 = () => cmDatabase(gs()) === 'original';

/** EU (15 lande i 2001) + EØS – spillere herfra behøver ingen arbejdstilladelse i Storbritannien */
const EU_EEA = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland', 'France', 'Germany', 'Italy', 'Spain',
  'Portugal', 'Holland', 'Belgium', 'Luxembourg', 'Denmark', 'Sweden', 'Finland', 'Austria', 'Greece', 'Norway', 'Iceland', 'Liechtenstein']);
const UK = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland']);

/** Skal spilleren have arbejdstilladelse for at spille for klubben? (britisk klub, spiller uden for EU/EØS) */
export function needsWorkPermit(p: Player, club: Club): boolean {
  if (!isOriginal2001()) return false;
  const g = gs();
  return UK.has(g.nations[club.nation]?.name ?? '') && !EU_EEA.has(g.nations[p.nation]?.name ?? '');
}

/**
 * Får han tilladelsen? Den rigtige regel (1999-2002): 75 % af landets tællende landskampe de seneste to år og landet i
 * top 70 på FIFA-ranglisten – ellers en appel for "særligt talent". Databasen har kun det samlede antal landskampe,
 * så reglen er *estimeret*: etableret landsholdsspiller (15+ kampe), stort navn (omdømme 70+) eller landsholdsspiller
 * af høj klasse (5+ kampe og CA 140+).
 */
export function workPermitGranted(p: Player): boolean {
  return p.caps >= 15 || p.rep >= 70 || (p.caps >= 5 && p.ca >= 140);
}

/** Kan klubben hente ham (ingen tilladelse nødvendig, eller den gives)? */
export const permitOk = (p: Player, club: Club) => !needsWorkPermit(p, club) || workPermitGranted(p);
