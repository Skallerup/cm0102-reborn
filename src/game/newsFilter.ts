/**
 * Nyheder uden modstykke i CM 01/02's exe (K3, docs/ORIGINAL_PARITY.md): sendes ikke i ægte tilstand med den originale database
 * (`addNews` i state.ts). Nøgler med punktum til sidst er præfikser. Ingen importer – læses også af scripts/text-parity.ts.
 */
export const ORIGINAL_OFF_NEWS: readonly string[] = [
  'news.newSeason', // "The season begins" findes ikke
  'ban.oneAway', // advarsel om ét gult kort fra karantæne findes ikke (originalen har kun selve karantænen)
  'award.playerOfYear', 'award.topScorer', // originalens priser kommer som cmaw.* (cmAwards)
  'res.win', 'res.draw', 'res.loss', // reservekampenes resultater som nyhed
  'intl.p.scored', 'intl.p.hattrick', // enkeltmål for landsholdet
  'intl.start.', 'intl.qual.start.', 'intl.qual.done.', 'intl.winner.', // turneringsnyheder i vores formulering
  'news.scoutTalent', 'news.scoutReturned', 'youth.debut', 'news.reservesPromoted', 'board.wasteWage', 'board.overWage', 'board.meeting',
];

export function offInOriginal(key: string): boolean {
  return ORIGINAL_OFF_NEWS.some((k) => (k.endsWith('.') ? key.startsWith(k) : key === k));
}
