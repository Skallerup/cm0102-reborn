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
  'transfer.swapPart', 'clause.releaseTriggered', 'clause.releaseDeclined', 'will.praise.', 'contract.expiring', // "X moves … as part of the swap deal" (hovedhandlen har originalens nyhed), computerens udløsning af frigivelsesklausuler (aiReleaseClauses – originalens bud kommer via ønskelisterne), spillernes rosende nyheder, "contract expires this summer" (originalen har 12/6/3/2/1 måneders påmindelser, scout.contractReminder)
  'youth.press.', 'youth.preview.', 'youth.intakeDay', 'news.youth', // ungdomsårgange findes ikke med originalens regens (originalRegens i season.ts)
  'sponsor.', 'budget.january', 'trophy.captain.', 'trophy.press.', 'media.preview.', // sponsorvalg, januar-tillæg, trofæhyldest og pressens forventninger er vores tilføjelser (originalens bestyrelse/forventninger: cmBoard*)
  'news.retired', 'news.injury', 'news.trainingAdvice', 'news.ueclQualified', 'news.split', // originalen har kun managernes pensionering; skader kommer som injury.o.*; ingen træningsråd/Conference League/split-nyhed
  'news.newJob', 'news.applyRejected', 'job.applied', 'job.filled', 'job.withdrawn', // ansøgningsforløbet i ægte tilstand: cmBoardGame (job.cmAck/job.cmDismiss, "offer you the position of manager")
  'ban.red', 'ban.yellows', 'ban.appeal.', // karantæner kommer som cmban.* (cmDiscipline)
  'clause.promotedWage', 'clause.relegatedWage', 'clause.addOnPaid', 'clause.lgAppsPaid', 'clause.intAppsPaid', // klausulernes udbetalinger som nyhed (beløbene bogføres stadig)
  'transfer.refuseAbroad', 'transfer.refuseRep', 'transfer.refuseHappy', 'transfer.permitRefused', 'transfer.talksCollapsed', 'transfer.biddingWar', 'transfer.lostBiddingWar', 'transfer.aiNoSellOn', 'transfer.bidCounteredClause', 'transfer.bidUnacceptable', 'transfer.incomingLoan', 'transfer.loanAccepted', 'transfer.loanRejected', 'transfer.done', 'transfer.freeDone', 'transfer.releaseMet', // vores forløb for bud/kontraktsamtaler (makeBid/offerContract uden for cmTransferBid/cmTransferTalks) – originalens nyheder er transfer.o.*/transfer.cm*
  'intl.injured', 'intl.jobLeft', 'intl.sacked', // landsholdsskader (originalen: injury.o.*), og vores fyring/afgang fra landsholdsjobbet
  'window.', 'signing.', 'scout.started', 'scout.doneNone', 'scout.doneOne', // transfervinduets og vores signing-/spejdernyheder (originalens spejdere: cmStaff, "Scout X has started his … search")
  'award.monthManager', 'award.monthManagerMe', 'award.ballonDor', 'award.lgManager', 'award.managerOfYearMe', 'award.gala', 'column.month', 'mgr.poached', // originalens priser/klummer/managerskifter: cmaw.*, column.*, news.cmAppoint
  'news.scoutTalent', 'news.scoutReturned', 'youth.debut', 'news.reservesPromoted', 'board.wasteWage', 'board.overWage', 'board.meeting',
];

export function offInOriginal(key: string): boolean {
  return ORIGINAL_OFF_NEWS.some((k) => (k.endsWith('.') ? key.startsWith(k) : key === k));
}
