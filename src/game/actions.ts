import { cmStaffDelayAnswer } from './cmStaff';
import { cmConfirmAnswer, cmSwapOffer, cmSwapOpen, cmSwapRole } from './cmTransferTalks';
import { cmFinePlayer, FINE_REASONS } from './cmFine';
// Alle ændringer en manager kan lave, som serialiserbare handlinger.
// Singleplayer: anvendes direkte. Online: anvendes lokalt med det samme (optimistisk) og sendes
// til serveren, hvor den manager der simulerer næste træk, afspiller dem i rækkefølge.
import { submitSquadNumbers } from './squadNumbers';
import { cmDiscLogic, cmMarketOn, cmMediaOn, cmStaffOn, setStatusCode } from './cmPlayerData';
import { CM_INTENSITIES, CM_SCHED_SLOTS, setPlayerSlot } from './cmTraining';
import { cmOfferStaff } from './cmStaff';
import { cmAnswerRequest, cmSetTransferStatus, cmToggleListed } from './cmTransferList';
import { cmRumourAnswer, cmRumourHumanShortlist } from './cmRumours';
import { cmShortlistAddRumour } from './cmShortlistGame';
import { submitEuroSquad } from './euroSquad';
import { replacePlayer } from './draft';
import { endTrial, inviteTrial } from './trials';
import { cmOfferTrial } from './cmTrial';
import { arrangeFriendly, cancelFriendly, type FriendlyKind } from './friendlies';
import { cmFrAnswer, cmFrArrange, cmFrCancel, cmFrInvite, cmFrTour, frDn } from './cmFriendlyOffers';
import { applyStyle, briefing, type StyleKey } from './onboarding';
import { cancelCamp, planCamp, type CampDest } from './camp';
import { cmBoardUltimatum, cmUltimatumReq } from './cmBoardGame';
import { acceptJob, answerBudgetCounter, boardAsk, applyForJob, faRequest, meetBoard, declineJob, negotiateJob, resignJob, requestBudget, requestProject, shiftBudget } from './board';
import { activate, emptySlot, withHuman } from './humans';
import { takeOverClub } from './newgame';
import { activateNation, addableNations, playPendingAsAi, submitMatchResult } from './sim';
import { initKnowledge } from './scouting';
import { fireStaff, hireStaff, raiseStaff } from './staff';
import { interact, talkToPlayer, teamTalk, type DisciplineReason, type TalkKind } from './personality';
import { chooseSponsor } from './finance';
import { applyPress } from './press';
import { answerComplaint } from './will';
import { answerBet, proposeBet, sendJab } from './rivalry';
import { isHumanClub, removeHuman } from './humans';
import { addNews, gs, notify, pickNumber, squad } from './state';
import {
  acceptCounter, bidNow, cmCompleteAgreed, enquire, loanOut, makeBid, rebid, negotiate, raiseBid, releasePlayer, renewContract, offerRenewalLater, respondToOffer, setListPrice, startPreContract, toggleListed, recallLoan, terminateLoan } from './transfers';
import { addBot } from './bots';
import { markChatRead, sendChat } from './chat';
import type { RejectReason } from './will';
import type { BoardAsk, BotStyle, ContractClauses, MatchReport, ScoutAssignment, Tactic, TalkStage, TalkTone, TransferOffer, CoachArea, CmSchedule, StaffRole } from './types';
import { giveTalk, matchExpectation } from './teamtalk';
import type { SquadStatus } from './squadStatus';
import { startScoutAssignment } from './scouting';
import { addScoutRequest, scoutRequestStatus } from './cmScout';
import { answerNationalOffer, resignNational, selectNationalSquad } from './international';
import { appealBan } from './rules2001';
import { cmAppeal } from './cmDiscipline';
import { cmSquadConfirm } from './cmIntlSquad';
import { origLogic } from './rules';
import { A } from './attributes';
import { rng } from './rng';
import { ageOn } from './dates';
import { moveLinked, squadMoveOption } from './cmBTeam';

export type Action =
  | { t: 'tactic'; tactic: Tactic }
  | { t: 'resTactic'; tactic: Tactic }
  | { t: 'savedTactics'; list: Tactic[] }
  | { t: 'training'; pid: number; key: string }
  | { t: 'trainingAll'; key: string }
  | { t: 'listed'; pid: number; price?: number | null }
  | { t: 'squadStatus'; pid: number; status: SquadStatus | null; loanListed: boolean }
  /** den originale database i ægte tilstand: Set Staff Transfer Status → OK (0x8f7f08) og svaret på en transferanmodning (0x4dcd70) */
  | { t: 'cmTransferStatus'; pid: number; status: number; price: number | null; listed: boolean; loan: boolean; request: boolean; auto?: boolean }
  | { t: 'cmRequest'; news: number; grant: boolean }
  | { t: 'cmRumour'; news: number; answer: number }
  | { t: 'squadNumber'; pid: number; n: number }
  | { t: 'squadNumbers'; nums: Record<number, number> }
  | { t: 'euroSquad'; ids: number[] }
  | { t: 'notes'; pid: number; text: string }
  | { t: 'release'; pid: number }
  | { t: 'loanOut'; pid: number; club: number; share: number; fee: number }
  | { t: 'recallLoan'; pid: number }
  | { t: 'terminateLoan'; pid: number }
  | { t: 'nationalOffer'; accept: boolean }
  | { t: 'resignNational' }
  | { t: 'nationalSquad'; pids: number[] }
  | { t: 'meetBoard'; kind: import('./board').MeetBoardKind }
  /** CM 01/02: knappen "Ultimatum" i bestyrelsens svar (nyheden 0x1786) → 0x6ad610 */
  | { t: 'ultimatum'; news: number }
  | { t: 'staffDelay'; news: number; delay: boolean }
  | { t: 'faRequest'; kind: import('./board').FaKind }
  | { t: 'appealBan'; pid: number }
  /** CM 01/02: knappen "Appeal" på karantænenyheden (0x55e620 → 0x55ed00 → 0x6ab800 – cmDiscipline.ts) */
  | { t: 'cmAppeal'; news: number }
  | { t: 'cmSquadConfirm'; news: number }
  | { t: 'bid'; pid: number; fee: number; loan: boolean; loanUntil?: string; loanShare?: number; loanNoCup?: boolean; loanNoAgainst?: boolean; sellOn?: number; addOn?: number; swap?: number[]; terms?: import('./cmTransferBid').BidTerms; change?: boolean }
  | { t: 'enquire'; pid: number }
  | { t: 'preContract'; pid: number }
  | { t: 'shortlist'; pid: number; on: boolean }
  | { t: 'scout'; staffId: number; assignment: ScoutAssignment | null }
  /** CM 01/02 Action → Scout Player (cmScout.ts): status 0x7f8ff0 og anmodningen 0x7f9290 (+ Short List 0x7f75f0) */
  | { t: 'scoutStatus'; pid: number }
  | { t: 'scoutReq'; pid: number }
  | { t: 'negotiate'; pid: number; wage: number; years: number; clauses?: ContractClauses }
  | { t: 'cmOfferRole'; pid: number; role: import('./squadStatus').SquadStatus }
  | { t: 'cmConfirm'; offer: number; answer: 'yes' | 'no' | 'delay' }
  | { t: 'renew'; pid: number; wage: number; years: number; clauses?: ContractClauses }
  | { t: 'nickname'; pid: number; nick: string | null }
  | { t: 'reserves'; pid: number; on: boolean }
  | { t: 'bTeam'; pid: number }
  | { t: 'ctrlRes'; on: boolean }
  | { t: 'staffReport'; pid: number; staffId: number }
  | { t: 'renewLater'; pid: number; wage: number; years: number; clauses?: ContractClauses }
  | { t: 'respond'; pid: number; buyer: number; action: 'accept' | 'reject' | 'counter'; counter?: number; sellOn?: number; reason?: RejectReason;
      /** CM 01/02 (cmTransferBid.ts): budskærmens vilkår, originalens afvisningsbegrundelse, om buddet var ændret, Reject All */
      terms?: import('./cmTransferBid').BidTerms; rejectKey?: import('./cmTransferBid').RejectKey; changed?: boolean; all?: boolean }
  | { t: 'acceptCounter'; pid: number }
  | { t: 'withdraw'; pid: number }
  | { t: 'hireStaff'; id: number; wage?: number }
  | { t: 'cmStaffOffer'; id: number; role: StaffRole; wage: number; years: number; signOn: number; expires?: string }
  | { t: 'staffNote'; id: number; nick?: string | null; notes?: string }
  | { t: 'fireStaff'; id: number }
  | { t: 'coachAreas'; id: number; areas: CoachArea[] | null }
  /** CM 01/02's træningsskærm (Ok): skemaerne, spillernes pladser og trænernes områder på én gang (cmTraining.ts) */
  | { t: 'cmTraining'; sched: CmSchedule[]; assign: [number, number][]; coaches: [number, CoachArea[] | null][] }
  | { t: 'budget'; kind: 'transfer' | 'wage'; pct?: number }
  | { t: 'budgetCounter'; accept: boolean }
  | { t: 'budgetShift'; toWage: boolean; amount: number }
  | { t: 'project'; kind: 'stadium' | 'training' | 'youth' }
  | { t: 'boardAsk'; kind: BoardAsk }
  | { t: 'camp'; dest: CampDest; start: string }
  | { t: 'campCancel' }
  | { t: 'setRules'; rules: 'modern' | 'classic' }
  | { t: 'draftReplace'; out: number; inn: number }
  | { t: 'trial'; pid: number; end?: boolean }
  // originalens Offer Trial (cmTrial.ts – Trial Period 0x8f8be0 → Yes 0x8fb9e0)
  | { t: 'cmTrial'; pid: number; weeks: number }
  | { t: 'friendly'; opp: number; date: string; kind: FriendlyKind }
  | { t: 'friendlyCancel'; date: string }
  // originalens venskabskampe (cmFriendlyOffers.ts – kun den originale database i ægte tilstand)
  | { t: 'cmFrArrange'; date: string; home: boolean }
  | { t: 'cmFrInvite'; club: number }
  | { t: 'cmFrTour'; nation: number; dates: string[] }
  | { t: 'cmFrCancel'; fixture?: number; match?: string; tour?: number }
  | { t: 'cmFrAnswer'; date: string; org: number; yes: boolean }
  | { t: 'onboard'; step: 'weak' | 'style' | 'needs' | 'brief' | 'skip'; style?: StyleKey; needs?: string[] }
  | { t: 'managerProfile'; name?: string; nation?: number; motto?: string }
  | { t: 'talk'; pid: number; choice: 'promise' | 'list' | 'refuse' }
  | { t: 'interact'; pid: number; kind: TalkKind; reason?: DisciplineReason }
  | { t: 'teamTalk'; kind: 'praise' | 'criticise' | 'demand' | 'calm' }
  | { t: 'matchTalk'; fixture: number; stage: TalkStage; tone: TalkTone; pids: number[]; diff: number; ratings: Record<number, number>; individual?: Record<number, TalkTone> }
  | { t: 'sponsor'; kind: 'safe' | 'bonus' | 'ambitious' }
  | { t: 'ticket'; price: number }
  | { t: 'read'; ids: number[] | 'all' }
  | { t: 'acceptJob'; club: number }
  | { t: 'applyJob'; club: number }
  | { t: 'negotiateJob'; club: number; ask: 'budget' | 'exp' }
  | { t: 'declineJob'; club: number }
  | { t: 'resign' }
  | { t: 'fixPending' }
  | { t: 'setWindows'; mode: 'real' | 'classic' }
  | { t: 'addNation'; nation: number }
  | { t: 'setH2hTime'; minutes: number }
  | { t: 'raiseBid'; offer: number; amount: number }
  | { t: 'bidNow'; offer: number }
  | { t: 'rebid'; offer: number; fee: number; sellOn?: number; addOn?: number }
  | { t: 'raiseStaff'; staff: number; wage: number }
  | { t: 'matchResult'; fixture: number; rep: MatchReport }
  | { t: 'join'; name: string; club: number; nation: number }
  | { t: 'addBot'; name: string; club: number; nation: number; style: BotStyle }
  | { t: 'chat'; to: string; text: string }
  | { t: 'jab'; to: string; line: number; text: string }
  | { t: 'bet'; to: string; amount: number }
  | { t: 'betAnswer'; id: number; accept: boolean }
  | { t: 'removeHuman'; pid: string }
  | { t: 'chatRead' }
  | { t: 'complaint'; pid: number; choice: 'promise' | 'fight' | 'list' | 'listen' }
  | { t: 'press'; answers: { topic: string; tone: string }[]; headline?: string; body?: string };

/** Ny klub i et land uden simulerede ligaer: start ligaen med det samme */
function startLeague() {
  const g = gs();
  const c = g.clubs[g.userClub];
  if (c && !g.comps[c.league] && g.leagues[c.league]) activateNation(c.nation);
}

const ACTIVE: TransferOffer['status'][] = ['pending', 'negotiating', 'countered'];

/** Find det aktive tilbud hvor den aktive manager er køber */
/** CM 01/02: computerens accepterede bud på menneskets spiller, hvor `pid` er en bytte-spiller, mennesket forhandler med (cmSwapTalks) */
function mySwapTalk(pid: number): TransferOffer | undefined {
  const g = gs();
  return g.offers.find((o) => cmSwapOpen(g, o, pid));
}

function myOffer(pid: number): TransferOffer | undefined {
  const g = gs();
  return g.offers.slice().reverse().find((o) => o.player === pid && o.buyer === g.userClub && ACTIVE.includes(o.status));
}

/** Anvend en handling for den aktive manager. Returnerer et resultat til UI'et. */
/** Handlinger, der kun findes i det udvidede spil (ægte CM 01/02 havde dem ikke) */
const EXTENDED_ONLY = new Set<Action['t']>(['matchTalk', 'teamTalk', 'talk', 'trial', 'camp', 'campCancel', 'sponsor', 'ticket', 'project', 'boardAsk', 'budgetShift', 'raiseBid', 'bidNow', 'rebid', 'press', 'onboard', 'setRules', 'setWindows']); // setRules/setWindows: kun gamle udvidede spil (docs/ALWAYS_ORIGINAL.md)
/** Discipline Player er det eneste spillersamtaler, originalen havde */
const AUTHENTIC_TALKS = new Set(['warning', 'fine', 'fineHeavy', 'drop']);

/** originalens genererede fyldspillere (cmVirtual.ts) kan hverken købes, lejes, sælges, fritstilles eller få kontrakt */
const VIRTUAL_BLOCK = new Set<Action['t']>(['listed', 'cmTransferStatus', 'squadStatus', 'release', 'loanOut', 'recallLoan', 'terminateLoan', 'enquire', 'bid', 'preContract',
  'shortlist', 'negotiate', 'renew', 'renewLater', 'nickname', 'reserves', 'bTeam', 'trial', 'talk', 'interact', 'appealBan', 'staffReport']);

export function applyAction(a: Action): unknown {
  if (origLogic() && (EXTENDED_ONLY.has(a.t) || (a.t === 'interact' && !AUTHENTIC_TALKS.has(a.kind)))) return 'authentic';
  const g = gs();
  if (VIRTUAL_BLOCK.has(a.t) && 'pid' in a && g.players[(a as { pid: number }).pid]?.virtual) return 'error';
  const club = g.clubs[g.userClub];
  switch (a.t) {
    case 'tactic': g.tactic = a.tactic; return 'ok';
    // reserveholdets udtagelse (CM 01/02): gemmes, men reservekampene spilles stadig uden den
    case 'resTactic': g.resTactic = a.tactic; return 'ok';
    case 'savedTactics': g.savedTactics = a.list; return 'ok';
    case 'training': { const p = g.players[a.pid]; if (p?.club === g.userClub) p.training = a.key; return 'ok'; }
    case 'trainingAll': for (const p of Object.values(g.players)) if (p.club === g.userClub && g.userClub) p.training = a.key; return 'ok';
    case 'listed':
      if (g.players[a.pid]?.club !== g.userClub) return 'error';
      if (a.price === undefined && cmMarketOn(g)) cmToggleListed(g, g.players[a.pid]);   // 0x8f8450
      else if (a.price === undefined) toggleListed(a.pid);
      else setListPrice(a.pid, a.price);
      return 'ok';
    case 'cmTransferStatus': {
      const p = g.players[a.pid];
      if (p?.club !== g.userClub || !cmMarketOn(g)) return 'error';
      cmSetTransferStatus(g, p, a);
      return 'ok';
    }
    case 'cmRequest': return cmMediaOn(g) ? cmAnswerRequest(g, a.news, a.grant) : 'error';
    case 'cmRumour': return cmMediaOn(g) ? cmRumourAnswer(g, a.news, a.answer) : 'error';
    case 'cmStaffOffer': return cmStaffOn(g) ? cmOfferStaff(g, { staff: a.id, role: a.role, wage: a.wage, years: a.years, signOn: a.signOn, ...(a.expires ? { expires: a.expires } : {}) }) : 'error';
    case 'staffNote': {
      const s = g.staff[a.id];
      if (!s) return 'error';
      if (a.nick !== undefined) s.nick = a.nick?.trim() || undefined;
      if (a.notes !== undefined) s.notes = a.notes || undefined;
      return 'ok';
    }
    case 'squadStatus': {
      const p = g.players[a.pid];
      if (p?.club !== g.userClub) return 'error';
      p.squadStatus = a.status ?? undefined;
      setStatusCode(p);   // kontraktens +0x4f (computerens trupplan 0x83cb40 – cmSquadPlan.ts)
      p.loanListed = a.loanListed || undefined;
      return 'ok';
    }
    case 'squadNumber': {
      // Squad Numbers: nyt nummer – har en holdkammerat det, bytter de
      const p = g.players[a.pid];
      if (p?.club !== g.userClub || !Number.isInteger(a.n) || a.n < 1 || a.n > 99) return 'error';
      const other = squad(g.userClub).find((x) => x.id !== p.id && x.number === a.n);
      if (other) other.number = p.number;
      p.number = a.n;
      if (other && !other.number) other.number = pickNumber(other, g.userClub);
      return 'ok';
    }
    case 'squadNumbers': return submitSquadNumbers(g.userClub, a.nums);
    case 'euroSquad': return submitEuroSquad(g.userClub, a.ids);
    case 'notes': { const p = g.players[a.pid]; if (p) p.notes = a.text; return 'ok'; }
    case 'release': return releasePlayer(a.pid);
    case 'loanOut': return loanOut(a.pid, a.club, a.share, a.fee);
    case 'recallLoan': return recallLoan(a.pid);
    case 'terminateLoan': return terminateLoan(a.pid);
    case 'nationalOffer': return answerNationalOffer(a.accept);
    case 'resignNational': return resignNational();
    case 'nationalSquad': return selectNationalSquad(a.pids);
    case 'meetBoard': return meetBoard(a.kind);
    case 'staffDelay': { cmStaffDelayAnswer(g, a.news, a.delay); return 'ok'; }
    case 'ultimatum': {
      const n = g.news.find((x) => x.id === a.news);
      const req = n ? cmUltimatumReq(g, n) : null;
      if (!n || req === null) return 'blocked';
      n.params.ult = 1;                                                 // 0x9068f4: slot 5 = 1 – knappen forsvinder
      return cmBoardUltimatum(g, req) ? 'ok' : 'blocked';
    }
    case 'faRequest': return faRequest(a.kind);
    case 'appealBan': return appealBan(a.pid);
    case 'cmAppeal': return cmAppeal(g, a.news) ? 'ok' : 'blocked';
    case 'cmSquadConfirm': { const it = g.news.find((x) => x.id === a.news); return it && cmSquadConfirm(g, it) ? 'ok' : 'blocked'; }
    case 'enquire': return enquire(a.pid);
    case 'bid': return makeBid(a.pid, a.fee, a.loan, { loanUntil: a.loanUntil, loanShare: a.loanShare, loanNoCup: a.loanNoCup, loanNoAgainst: a.loanNoAgainst, sellOn: a.sellOn, addOn: a.addOn, swap: a.swap, terms: a.terms, change: a.change });
    case 'preContract': return startPreContract(a.pid);
    case 'shortlist': {
      const was = g.shortlist.includes(a.pid);
      g.shortlist = g.shortlist.filter((x) => x !== a.pid);
      if (a.on) g.shortlist.push(a.pid);
      // "Add Player To Shortlist" → Yes (0x8f48b0): efter 0x7f75f0 mediets rygte 0x754740 med udbudsprisen (cmShortlistAddRumour)
      const p = g.players[a.pid];
      if (a.on && !was && p) cmRumourHumanShortlist(g, p, g.userClub, () => cmShortlistAddRumour(g, p, g.userClub));
      return 'ok';
    }
    case 'scout': return startScoutAssignment(a.staffId, a.assignment) ?? 'ok';
    case 'scoutStatus': {
      const g = gs(), p = g.players[a.pid];
      const st = p ? scoutRequestStatus(g, p) : 2;
      // 0x8898e5/0x88993c: med spørgsmålet (status 0/1) kommer spilleren på Short List (0x7f75f0) – uanset svaret
      if (p && st <= 1 && !g.shortlist.includes(p.id)) g.shortlist.push(p.id);
      return st;
    }
    case 'scoutReq': {
      const g = gs(), p = g.players[a.pid];
      if (!p || scoutRequestStatus(g, p) > 1) return 'error';
      addScoutRequest(g, p);
      return 'ok';
    }
    case 'cmOfferRole': { const o = myOffer(a.pid); if (o) { o.cmRole = a.role; return 'ok'; } const so = mySwapTalk(a.pid); return so && cmSwapRole(so, a.pid, a.role) ? 'ok' : 'error'; }
    case 'negotiate': { const o = myOffer(a.pid); if (o) return negotiate(o.id, a.wage, a.years, a.clauses); const so = mySwapTalk(a.pid); return so ? cmSwapOffer(so, a.pid, a.wage, a.years, a.clauses) : 'refused'; }
    case 'cmConfirm': { const o = gs().offers.find((x) => x.id === a.offer); return o ? cmConfirmAnswer(o, a.answer, cmCompleteAgreed) : 'refused'; }
    case 'renew': return renewContract(a.pid, a.wage, a.years, a.clauses);
    case 'nickname': return setNickname(a.pid, a.nick);
    case 'reserves': {
      const p = g.players[a.pid];
      if (!p || p.club !== g.userClub) return 'error';
      // ægte CM 01/02 (0x4cbb60): kun i en klub med reservehold – Promote To Seniors (1) / Relegate To Reserves (2)
      if (squadMoveOption(g, p, g.userClub) !== (a.on ? 2 : 1)) return 'error';
      p.reserves = a.on || undefined;
      // ud af startopstillingen og bænken, når han rykkes ned
      if (a.on && g.tactic) { g.tactic.lineup = g.tactic.lineup.map((id) => (id === p.id ? 0 : id)); g.tactic.bench = g.tactic.bench.filter((id) => id !== p.id); }
      return 'ok';
    }
    // ægte CM 01/02 (0x4cbd20): Relegate To 'B' Team / Promote To 'A' Team
    case 'bTeam': { const p = g.players[a.pid]; return p && moveLinked(g, p, g.userClub) ? 'ok' : 'error'; }
    // managermenuens "Control Reserve Team" / "Control Senior Team Only" (0x5fd590 → HUMAN_MANAGER +0x9a05)
    case 'ctrlRes': g.manager.ctrlRes = a.on || undefined; return 'ok';
    case 'staffReport': return staffReport(a.pid, a.staffId);
    case 'renewLater': return offerRenewalLater(a.pid, a.wage, a.years, a.clauses);
    case 'respond': {
      const o = g.offers.slice().reverse().find((x) => x.player === a.pid && x.buyer === a.buyer && x.seller === g.userClub && x.status === 'pending');
      const reply = o ? respondToOffer(o.id, a.action, a.counter, a.sellOn, a.reason, { terms: a.terms, reject: a.rejectKey, changed: a.changed, all: a.all }) : null;
      return reply ?? 'ok';
    }
    case 'acceptCounter': { const o = myOffer(a.pid); return o ? acceptCounter(o.id) : 'error'; }
    case 'withdraw': { const o = myOffer(a.pid); if (o) o.status = 'withdrawn'; return 'ok'; }
    case 'hireStaff': return hireStaff(a.id, a.wage);
    case 'fireStaff': return fireStaff(a.id);
    case 'cmTraining': {
      const c = g.clubs[g.userClub];
      if (!c || !Array.isArray(a.sched) || a.sched.length !== CM_SCHED_SLOTS) return 'error';
      const lvOk = (v: number) => (CM_INTENSITIES as readonly number[]).includes(v);
      c.cmSched = a.sched.map((s, k) => ({ t: k === 0 ? -1 : Math.max(0, Math.min(8, s.t | 0)), n: String(s.n ?? '').slice(0, 11),
        lv: k === 0 ? [0, 0, 0, 0, 0] : [0, 1, 2, 3, 4].map((i) => (lvOk(s.lv?.[i]) ? s.lv[i] : 0)), ...(s.f ? { f: String(s.f).slice(0, 60) } : {}) }));
      for (const [pid, slot] of a.assign) { const p = g.players[pid]; if (p?.club === g.userClub && slot >= 1 && slot < CM_SCHED_SLOTS) setPlayerSlot(p, slot); }
      for (const [id, areas] of a.coaches) { const st = g.staff[id]; if (st?.club === g.userClub) st.coachAreas = areas ?? undefined; }
      return 'ok';
    }
    case 'coachAreas': { const st = g.staff[a.id]; if (!st || st.club !== g.userClub) return 'error'; st.coachAreas = a.areas ?? undefined; return 'ok'; }
    case 'budget': return requestBudget(a.kind, a.pct);
    case 'budgetCounter': return answerBudgetCounter(a.accept);
    case 'budgetShift': return shiftBudget(a.toWage, a.amount);
    case 'project': return requestProject(a.kind);
    case 'boardAsk': return boardAsk(a.kind);
    case 'camp': return planCamp(a.dest, a.start);
    case 'campCancel': return cancelCamp() ? 'ok' : 'error';
    case 'setRules': g.options.rules = a.rules; return 'ok';
    case 'draftReplace': return replacePlayer(gs().userClub, a.out, a.inn);
    case 'cmTrial': return cmOfferTrial(g, a.pid, a.weeks);
    case 'trial': if (a.end) { endTrial(a.pid); return 'ok'; } return inviteTrial(a.pid);
    case 'friendly': return arrangeFriendly(a.opp, a.date, a.kind);
    case 'friendlyCancel': cancelFriendly(a.date); return 'ok';
    case 'cmFrArrange': return cmFrArrange(g, frDn(a.date), a.home);
    case 'cmFrInvite': return cmFrInvite(g, a.club);
    case 'cmFrTour': return cmFrTour(g, a.nation, a.dates.map(frDn));
    case 'cmFrCancel': return cmFrCancel(g, a);
    case 'cmFrAnswer': return cmFrAnswer(g, a.date, a.org, a.yes);
    case 'onboard': {
      const ob = (g.manager.onboard ??= {});
      if (a.step === 'weak') ob.weak = true;
      else if (a.step === 'style' && a.style) applyStyle(a.style);
      else if (a.step === 'needs') ob.needs = (a.needs ?? []).slice(0, 4);
      else if (a.step === 'brief') return briefing();
      else if (a.step === 'skip') ob.briefed = true;
      return 'ok';
    }
    case 'managerProfile': {
      const name = a.name?.replace(/\s+/g, ' ').trim().slice(0, 30);
      if (name) {
        g.manager.name = name;
        const h = g.humans?.find((x) => x.pid === g.active);
        if (h) h.name = name;
      }
      if (a.nation !== undefined && g.nations[a.nation]) g.manager.nation = a.nation;
      if (a.motto !== undefined) g.manager.motto = a.motto.replace(/\s+/g, ' ').trim().slice(0, 140);
      return 'ok';
    }
    case 'talk': return talkToPlayer(a.pid, a.choice);
    case 'interact': {
      // den originale database i ægte tilstand: originalens Fine::fine_player 0x5a5980 (cmFine.ts) – ingen besked på spillersiden, svaret er en nyhed
      const p = g.players[a.pid];
      if (cmDiscLogic(g) && p && club && p.club === club.id && (a.kind === 'warning' || a.kind === 'fine' || a.kind === 'fineHeavy')) {
        cmFinePlayer(g, p, a.kind === 'warning' ? 1 : a.kind === 'fine' ? 2 : 3, Math.max(0, FINE_REASONS.indexOf(a.reason ?? 'none')));
        return { key: '', mood: 'neutral' };
      }
      return interact(a.pid, a.kind, a.reason);
    }
    case 'teamTalk': return teamTalk(a.kind);
    case 'matchTalk': { const ex = matchExpectation(a.fixture); return giveTalk({ stage: a.stage, fixture: a.fixture, e: ex.e, big: ex.big, diff: a.diff, ratings: a.ratings }, a.tone, a.pids, a.individual); }
    case 'sponsor': return chooseSponsor(a.kind);
    case 'ticket': if (club) club.ticketPrice = Math.max(1, Math.round(a.price * 100) / 100); return 'ok';
    case 'read':
      for (const n of g.news) if (a.ids === 'all' || a.ids.includes(n.id)) n.read = true;
      return 'ok';
    case 'acceptJob': if (g.jobOffers.includes(a.club) && g.clubs[a.club]?.manager === 0) { playPendingAsAi(); acceptJob(a.club); startLeague(); } return 'ok';
    case 'applyJob': return applyForJob(a.club);
    case 'negotiateJob': return negotiateJob(a.club, a.ask);
    case 'declineJob': declineJob(a.club); return 'ok';
    case 'resign': playPendingAsAi(); return resignJob();
    case 'fixPending': playPendingAsAi(); return 'ok';
    case 'raiseBid': return raiseBid(a.offer, a.amount);
    case 'bidNow': return bidNow(a.offer);
    case 'rebid': return rebid(a.offer, a.fee, a.sellOn !== undefined || a.addOn !== undefined ? { sellOn: a.sellOn, addOn: a.addOn } : undefined);
    case 'raiseStaff': return raiseStaff(a.staff, a.wage);
    case 'setWindows': gs().options.transferWindows = a.mode; return 'ok';
    // flere spilbare ligaer undervejs (kun eget spil – i fællesspil skulle alle være enige)
    case 'addNation':
      if (g.humans?.length || g.draft || !addableNations().includes(a.nation)) return 'error';
      activateNation(a.nation);
      return 'ok';
    case 'setH2hTime': gs().options.h2hHalfMinutes = Math.min(15, Math.max(1, Math.round(a.minutes))); return 'ok';
    case 'matchResult': submitMatchResult(a.fixture, a.rep); return 'ok';
    case 'join': return 'ok'; // håndteres af applyActionAs
    case 'addBot': return 'ok'; // håndteres af applyActionAs
    case 'chat': return sendChat(a.to, a.text);
    case 'jab': return gs().draft ? 'error' : sendJab(a.to, a.line, a.text);
    case 'bet': return gs().draft ? 'error' : proposeBet(a.to, a.amount);
    case 'betAnswer': return answerBet(a.id, a.accept);
    case 'chatRead': markChatRead(); return 'ok';
    case 'press': return applyPress(a.answers, a.headline, a.body);
    case 'complaint': return answerComplaint(a.pid, a.choice);
  }
}

/** Anvend en handling som en bestemt menneskelig manager (bruges når et træk afvikles) */
export function applyActionAs(pid: string, a: Action): unknown {
  const g = gs();
  if (a.t === 'join') {
    if (!g.humans || g.humans.some((h) => h.pid === pid)) return 'exists';
    const club = g.clubs[a.club];
    if (!club || club.manager === -1) return 'taken';
    g.humans.push(emptySlot(pid, a.name, a.nation));
    return withHuman(pid, () => {
      takeOverClub(club);
      initKnowledge();
      addNews({ cat: 'general', key: 'news.welcome', params: { manager: a.name, club: club.name } });
      addNews({ cat: 'general', key: 'mp.joined', params: { manager: a.name, club: club.name } }, { all: true });
      return 'ok';
    });
  }
  // fælles spilleregler: kun værten (første manager) må ændre dem
  if (a.t === 'setWindows') {
    if (g.humans && g.humans[0]?.pid !== pid) return 'host-only';
    g.options.transferWindows = a.mode;
    return 'ok';
  }
  if (a.t === 'setH2hTime') {
    if (g.humans && g.humans[0]?.pid !== pid) return 'host-only';
    g.options.h2hHalfMinutes = Math.min(15, Math.max(1, Math.round(a.minutes)));
    return 'ok';
  }
  if (a.t === 'removeHuman') {
    // kun værten (første menneskelige slot) – serveren tjekker det også
    if (g.humans?.[0]?.pid !== pid || a.pid === pid) return 'unknown';
    return removeHuman(a.pid);
  }
  if (a.t === 'addBot') {
    // kun en menneskelig manager kan invitere en AI-manager ind
    if (!g.humans?.some((h) => h.pid === pid && !h.bot)) return 'unknown';
    return addBot(a.name, a.club, a.nation, a.style);
  }
  if (!g.humans?.some((h) => h.pid === pid)) return 'unknown';
  return withHuman(pid, () => applyAction(a));
}

// ---------- dispatch fra UI ----------

type Sink = (a: Action) => void;
let sink: Sink | null = null;

/** Online-laget registrerer her, hvor handlinger skal sendes hen */
export function setActionSink(s: Sink | null) {
  sink = s;
}

/** Brug denne fra UI'et i stedet for at ændre spiltilstanden direkte */
export function act<T = unknown>(a: Action): T {
  const g = gs();
  if (g.humans && g.active) activate(g.active, g);
  const r = (a.t === 'addBot' && g.active ? applyActionAs(g.active, a) : applyAction(a)) as T;
  sink?.(a);
  notify();
  return r;
}

/** CM 01/02 "Set Nickname": spilleren hedder kælenavnet overalt (Remove giver det rigtige navn tilbage) */
function setNickname(pid: number, nick: string | null): string {
  const p = gs().players[pid];
  // CM 01/02: kælenavn til enhver spiller – men ikke en anden managers spillere i et fællesspil
  if (!p || (p.club !== gs().userClub && isHumanClub(p.club))) return 'error';
  const name = (nick ?? '').trim().slice(0, 30);
  if (!name) { if (p.realName) { p.first = p.realName.first; p.last = p.realName.last; p.realName = undefined; } return 'ok'; }
  p.realName ??= { first: p.first, last: p.last };
  p.first = ''; p.last = name;
  return 'ok';
}

/** "Request Physio Report" / "Request Coach Report": rapporten kommer med det samme i nyhederne (vurderingen følger stabens evner) */
function staffReport(pid: number, staffId: number): string {
  const g = gs();
  const p = g.players[pid], s = g.staff[staffId];
  if (!p || !s || s.club !== g.userClub) return 'error';
  const name = `${p.first} ${p.last}`.trim();
  const by = `${s.first} ${s.last}`.trim();
  if (s.role === 'physio') {
    const ip = p.attrs[A.injuryProneness];
    // en dårlig fysioterapeut tager fejl med op til et par point (*estimeret*)
    const seen = Math.max(1, Math.min(20, ip + Math.round((rng.next() - 0.5) * (20 - s.attrs.physio) / 4)));
    const prone = seen >= 14 ? 'high' : seen >= 9 ? 'normal' : 'low';
    const cond = p.condition >= 90 ? 'top' : p.condition >= 75 ? 'ok' : 'tired';
    addNews({ cat: 'injury', key: 'staffrep.physio', params: { player: name, by, prone: `staffrep.prone.${prone}`, cond: `staffrep.cond.${cond}`, inj: p.injury ? `injury.${p.injury.key}` : '', days: p.injury?.days ?? 0 }, link: { kind: 'player', id: p.id } });
  } else {
    const k = s.attrs.judgingAbility, kp = s.attrs.judgingPotential;
    const noise = (j: number) => Math.round((rng.next() - 0.5) * (20 - j) * 3);
    const ca = p.ca + noise(k), pa = Math.max(ca, p.pa + noise(kp));
    const word = (v: number) => (v >= 170 ? 'world' : v >= 150 ? 'top' : v >= 130 ? 'good' : v >= 110 ? 'decent' : v >= 90 ? 'average' : 'poor');
    const age = ageOn(p.dob, g.date);
    addNews({ cat: 'general', key: 'staffrep.coach', params: { player: name, by, now: `staffrep.lvl.${word(ca)}`, future: age <= 23 ? `staffrep.lvl.${word(pa)}` : `staffrep.lvl.${word(ca)}`, young: age <= 23 ? 1 : 0 }, link: { kind: 'player', id: p.id } });
  }
  return 'ok';
}
