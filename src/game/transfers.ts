// Transfers, kontrakter og AI-transfermarked (forbedring #7: behovsstyrede AI-klubber).
import { holidayOpt, humanClub0, onHoliday } from './cmHoliday';
import { cmLeaveFrom, cmLogic, cmMarketOn, cmMediaOn, cmRand, setRequestHooks, setStatusCode } from './cmPlayerData';
import { SQUAD_STATUSES } from './squadStatus';
import { cmBidChance, cmInterested, cmRequestNews } from './cmTransferList';
import { transferNewsToMe } from './cmNewsScope';
import { cmSignContractMorale } from './cmMedia';
import { cmLoanRules, isOriginal2001, loanBlocked, loanRecallOn, noteLoan, noteLoanEnd, permitOk } from './rules2001';
import { A, naturalRole } from './attributes';
import { addDays, ageOn, daysBetween, month, year } from './dates';
import { makePlayer, randomDob, randomName, roundValue, wageFor } from './data/generate';
import { rulesFor } from './leagues';
import { NO_CARRY, registerCarry } from './carry';
import { Rng, hash, hash01, rng } from './rng';
import { recordDevelopment } from './training';
import { merchStarSigning } from './finance';
import { addNews, addPlayer, gs, inSetup, loanedOut, movePlacement, newsRelevant, setClub, squad } from './state';
import { clubLevel, knowFull, registerAskingPrice } from './scouting';
import { clubStrategy } from './strategy';
import { SHIFT_WEEKS } from './board';
import { fansOnDeparture, fansOnRenewal, fansOnSigning } from './fans';
import { pushCareerLine, recordMove } from './season';
import { blockedMoveReaction, playerPraises, targetReaction, type RejectReason } from './will';
import type { Club, Contract, ContractClauses, GameState, Player, Role, TransferOffer } from './types';
import { aiContract, cmAiTerms, cmContractAnswer, cmMoveInterest, cmTalkDemand } from './cmContractGame';
import { cmBoardWageAllow, cmFundsAfterDeal, cmFundsNow, cmTransferBudget } from './cmBudget';
import { cmCmOn, cmCmScope } from './cmContractManager';
import { cmAcceptBid, cmOfferContract, cmSwapAccept, cmSwapDaily, cmSwapOn, cmTalksDaily, cmTalksOn, cmTalksOpen, offerTerms } from './cmTransferTalks';
import { cmLoanRefuses } from './cmLoan';
import { cmBuildBid } from './cmAiBid';
import { cmAiRulesBlock, cmAiRulesReason, cmCanSign, cmCompletionDate, cmWindowOpen } from './cmOfferCheck';
import { cmRumourAdd } from './cmRumours';
import { cmAskingPrice, cmExchangeCheck, cmInterestedClubs, cmLoanAnswerNow, cmLoanDelayNow, cmSlPlayerGone, cmShortlistOn, cmSlMoved, cmSlLoaned, setSlApply, setSlDue, type SlBid, type SlDueCtx, type SlEvent } from './cmShortlistGame';
import { ADDON_APPS, bidClauseWorth, cleanClauses, clauseWorth, defaultRelease, settleSellOn } from './clauses';
import { asOwner, forEachHuman, isHumanClub, isMultiplayer } from './humans';
import { AGENT_RULES, agentOf } from './agents';
import { econ } from './econ';
import { origLogic, legacyExtended } from './rules';
import { aiRespond, aiReview, applyRejectReason, clauseOptIn, newTerms, putTerms, stepUp, termsOf, totalValue, valueCtx, weightedValue, GBP, MAX_SWAP, type BidTerms, type RejectKey } from './cmTransferBid';
import { bookBlockEur, cmFinOn, K as CMK } from './cmFinance';
import { cmGbp } from './cmMoney';
import { offerLive, offersFollowPlayer } from './offerLive';
import { cashRound, cashUnits } from '../i18n';
import { cmNeedsPermit, cmPermitOn, cmWorkPermit } from './cmPermit';

/** (MODERN_PARITY 3) € ↔ originalens £ med faktoren for klubben, pengene tilhører (cmMoney.ts – den originale database: 0,86 som toGbp/fromGbp) */
const toK = (eur: number, cid?: number) => Math.round(eur * cmGbp(gs(), cid || undefined));
const fromK = (gbp: number, cid?: number) => Math.round(gbp / cmGbp(gs(), cid || undefined));

/** Klubben, vinduet gælder for med originalens marked (cmMarketOn – alle CM-databaser i ægte tilstand, MODERN_PARITY §0 E): den angivne, ellers
 *  menneskets (landets regelsæt 0x8e8800 – konstruktørernes vinduer står fast i exe'en, ikke i databasen) */
function cmWindowClub(club?: number): Club | undefined {
  const g = gs();
  if (!cmMarketOn(g)) return undefined;
  return g.clubs[club ?? (g.userClub || -1)];
}

export function windowOpen(date = gs().date, club?: number): boolean {
  // CM 01/02 (ægte tilstand): hver nations egne vinduer (England åbent 2/6–26/3 …, Danmark/Sverige altid) – cmOfferCheck.ts CM_WINDOWS
  const cc = cmWindowClub(club);
  if (cc) return cmWindowOpen(gs(), cc, date);
  const m = month(date);
  // som i CM 01/02: handler hele året undtagen i slutspurten (april-maj)
  if (gs().options?.transferWindows === 'classic') return !(m === 4 || m === 5);
  // rigtige vinduer: sommer (15. juni – 31. august) og januar
  return m === 7 || m === 8 || m === 1 || (m === 6 && Number(date.slice(8, 10)) >= 15);
}

/** Kan mennesket byde/leje/tilbyde en kontrakt nu (Action-menuens Approach To Buy/Loan, Offer Contract)? CM 01/02: menuen (0x872794/0x87282a)
 *  og buddet (0x8ef9f0 → 0x8be300) ser ikke på vinduet – med originalens marked altid; ellers spillets egne vinduer */
export function approachOpen(): boolean {
  return cmMarketOn(gs()) || windowOpen();
}

/** Hvornår åbner transfervinduet næste gang? */
export function nextWindow(date = gs().date, club?: number): string {
  const cc = cmWindowClub(club);
  if (cc) {
    let d = date;
    for (let i = 0; i < 400 && !cmWindowOpen(gs(), cc, d); i++) d = addDays(d, 1);
    return d;
  }
  const y = Number(date.slice(0, 4)), m = month(date);
  if (gs().options?.transferWindows === 'classic') return `${y}-06-01`;
  return m >= 9 ? `${y + 1}-01-01` : `${y}-06-15`;
}

/** Må en AI-klub byde på en spiller hos en menneskestyret klub lige nu? (så der ikke regner bud ned) */
/** CM 01/02: en spiller, der har afvist en klub, får ikke et nyt bud fra den samme klub i denne sæson (originalens køber fjerner ham fra
 *  ønskelisten – 0x843e10 er ikke porteret, *estimeret*; ejerens fund 13/11: FC Zürich bød igen på Thompson) */
export function refusedBy(p: Player, buyer: number): boolean {
  const g = gs();
  return g.offers.some((o) => o.player === p.id && o.buyer === buyer && o.status === 'collapsed' && o.created.slice(0, 4) >= String(g.season));
}

/** Ægte tilstand (*estimeret*): kun klubber i de VALGTE lande byder på menneskets spillere – originalens baggrundslande handler ikke med dem
 *  (ejerens fund 16/11: Club de Fútbol México bød på en Vejle-spiller). */
function inPlayedNation(c: Club): boolean {
  const g = gs();
  // med ønskelisterne (cmShortlistOn) afgør de selv, hvem der byder (0x84a020) – reglen gælder kun spillets egne skøn
  return !cmMarketOn(g) || cmShortlistOn(g) || g.activeNations.includes(c.nation);
}

function canBidOnHuman(p: Player, buyer: number): boolean {
  const g = gs();
  if (refusedBy(p, buyer) || (g.clubs[buyer] && !inPlayedNation(g.clubs[buyer]))) return false;
  // nyindkøbt og ikke til salg: ingen bud, før han har været der et stykke tid (samme regel som AI-klubberne imellem)
  if (!p.listed && recentlyJoined(p)) return false;
  const pending = g.offers.filter((o) => o.seller === p.club && o.status === 'pending' && !isHumanClub(o.buyer)).length;
  if (pending >= 3) return false;
  const since = addDays(g.date, -21);
  // samme klub byder ikke igen, mens dens bud er åbent – og efter et afslag kommer den kun igen via en jagt (med et højere bud)
  if (g.offers.some((o) => o.player === p.id && o.buyer === buyer && (['pending', 'countered', 'negotiating'].includes(o.status) || (o.created >= since && ['rejected', 'withdrawn'].includes(o.status))))) return false;
  if (g.pursuits?.some((x) => x.club === buyer && x.player === p.id)) return false;
  // efter et afslag venter andre klubber et par uger
  return !g.offers.some((o) => o.player === p.id && o.buyer !== buyer && o.created >= since && ['rejected', 'withdrawn', 'pending'].includes(o.status));
}

/** En AI-klub der byder på en spiller, har ham selvfølgelig på sin shortliste */
function noteInterest(clubId: number, pid: number) {
  const c = gs().clubs[clubId];
  if (!c || c.manager === -1) return;
  if (!(c.shortlist ??= []).includes(pid)) c.shortlist.push(pid);
}

function sellerName(id: number) {
  return id ? gs().clubs[id]?.name ?? '?' : '-';
}
const pname = (p: Player) => `${p.first} ${p.last}`.trim();

// ---------- værdi og krav ----------

// Cache over truppernes CA-rækkefølge (nulstilles dagligt og ved transfers)
let rankCache = new Map<number, number[]>();
let rankCacheDate = '';
// (19/11) følger med spillet (carry.ts) og nulstilles ved et nyt spil – ellers lækker dagens rækkefølge fra spillet før i samme fane
registerCarry('transfers.rankCache', () => (rankCacheDate ? { d: rankCacheDate, m: [...rankCache] } : NO_CARRY),
  (v: { d: string; m: [number, number[]][] }) => { rankCacheDate = v.d; rankCache = new Map(v.m); }, () => { rankCache = new Map(); rankCacheDate = ''; });

export function keyPlayerRank(p: Player): number {
  if (!p.club) return 99;
  const g = gs();
  if (rankCacheDate !== g.date) { rankCache = new Map(); rankCacheDate = g.date; }
  let cas = rankCache.get(p.club);
  if (!cas) {
    cas = squad(p.club).map((x) => x.ca).sort((a, b) => b - a);
    rankCache.set(p.club, cas);
  }
  return cas.indexOf(p.ca) + 1;
}

export type Realism = { level: 0 | 1 | 2; score: number; reasons: string[] };

/**
 * Hvor realistisk er en handel for brugerens klub? (0 = realistisk, 1 = måske, 2 = urealistisk)
 * Ser på spillerens interesse, om klubben vil sælge, transfersum og lønkrav.
 */
export function transferRealism(p: Player): Realism {
  const g = gs();
  const club = g.clubs[g.userClub];
  const reasons: string[] = [];
  if (!club || p.club === club.id) return { level: 2, score: -99, reasons };
  let score = 0;
  let level: 0 | 1 | 2 = 0;
  const bump = (l: 0 | 1 | 2, key: string, s: number) => { if (l > level) level = l; reasons.push(key); score -= s; };
  const interest = playerInterest(p, club);
  if (interest === 'reputation') bump(2, 'real.reputation', 50);
  else if (interest === 'happy') bump(2, 'real.happy', 40);
  else if (interest === 'abroad') bump(2, 'real.abroad', 40);
  else if (interest === 'permit') bump(2, 'real.permit', 60);
  else if (p.rep - club.rep > 15) bump(1, 'real.repGap', 10);
  if (p.loan || p.contract?.futureClub) bump(2, 'real.unavailable', 50);
  const bosman = !!p.club && canPreContract(p);
  if (bosman) {
    // fri kontrakt fra sommer: hverken prisen eller klubbens vilje til at sælge betyder noget
    score += 6;
    reasons.push('real.bosman');
  } else if (p.club) {
    const seller = g.clubs[p.club];
    const rank = keyPlayerRank(p);
    if (rank <= 2 && seller && seller.rep >= club.rep) bump(2, 'real.notForSale', 30);
    // for dyr er højst "måske": budgettet kan flyttes, forhøjes eller spares op
    const price = askingPrice(p);
    if (price > club.transferBudget) bump(1, 'real.tooExpensive', 25 * Math.min(4, price / Math.max(1, club.transferBudget)));
    else score += 5 * (1 - price / Math.max(1, club.transferBudget));
    if (p.listed) { score += 8; reasons.push('real.listed'); }
  } else {
    score += 6;
    reasons.push('real.free');
  }
  const bill = squad(club.id).reduce((s, x) => s + (x.contract?.wage ?? 0), 0);
  // lønnen: passer den ikke i lønbudgettet, kan transferbudget omfordeles (1 uges løn = SHIFT_WEEKS kr. transferbudget)
  const missing = bill + wageDemand(p, club) - club.wageBudget;
  if (missing > 0) {
    const fee = p.club && !bosman ? askingPrice(p) : 0;
    if (fee + missing * SHIFT_WEEKS <= club.transferBudget) { reasons.push('real.wagesShift'); score -= 3; }
    else bump(1, 'real.wages', 10);
  }
  // Vil han få spilletid? Spillere langt over klubbens niveau er mere interesserede i store klubber
  score += Math.max(-10, Math.min(10, (club.rep - p.rep) / 3));
  return { level, score: Math.round(score * 10) / 10, reasons };
}

export function askingPrice(p: Player): number {
  const g = gs();
  if (p.listed && p.listPrice) return p.listPrice;
  let f = 1.15;
  const rank = keyPlayerRank(p);
  if (rank <= 3) f *= 1.5;
  else if (rank <= 11) f *= 1.2;
  else if (rank > 18) f *= 0.8;
  if (p.listed) f *= 0.8;
  const age = ageOn(p.dob, g.date);
  if (age <= 21 && p.pa - p.ca > 25) f *= 1.35;
  if (p.contract) {
    const yearsLeft = year(p.contract.expires) - year(g.date) - (month(g.date) >= 7 ? 1 : 0);
    if (yearsLeft <= 0) f *= 0.55;
    else if (yearsLeft === 1) f *= 0.8;
  }
  const club = g.clubs[p.club];
  if (club && club.balance < 0) f *= 0.85;
  return roundValue(Math.max(10_000 * econ(), p.value * f));
}

/** Hvor mange gange udbudsprisen skal der til, før klubben overhovedet vil sælge (0 = spilleren er til salg) */
function notForSaleMult(p: Player, buyer: Club): number {
  const g = gs();
  const seller = g.clubs[p.club];
  if (!seller) return 0;
  const rank = keyPlayerRank(p);
  const strat = !isHumanClub(seller.id) ? clubStrategy(seller) : 'balanced';
  const age = ageOn(p.dob, g.date);
  let m = 0;
  // topklubber sælger nødigt til mindre klubber; udviklingsklubber holder på de helt unge
  if (strat === 'big' && rank <= 4 && seller.rep >= buyer.rep - 5) m = Math.max(m, 1.8);
  if (strat === 'develop' && age <= 20 && rank <= 11) m = Math.max(m, 1.4);
  if (strat !== 'seller' && rank <= 2 && seller.rep >= buyer.rep) m = Math.max(m, 1.6);
  if (strat === 'seller' && rank <= 1 && seller.rep >= buyer.rep) m = Math.max(m, 1.3);
  return m;
}

export type SellerAnswer = 'accept' | 'counter' | 'reject' | 'notforsale';

export function sellerDecision(p: Player, fee: number, buyer: Club): { answer: SellerAnswer; counter?: number } {
  const g = gs();
  const seller = g.clubs[p.club];
  const ask = askingPrice(p);
  const strat = seller && !isHumanClub(seller.id) ? clubStrategy(seller) : 'balanced';
  const age = ageOn(p.dob, g.date);
  if (fee < ask * notForSaleMult(p, buyer)) return { answer: 'notforsale' };
  // sælgerklubber og udviklingsklubber (med spillere over 22) tager imod lidt under prisen
  const accept = strat === 'seller' ? 0.9 : strat === 'develop' && age >= 23 ? 0.95 : 1;
  if (fee >= ask * accept) return { answer: 'accept' };
  if (fee >= ask * 0.72) return { answer: 'counter', counter: ask };
  return { answer: 'reject' };
}

/**
 * Skal den aktive manager have en nyhed om en handel mellem andre klubber?
 * Standard ('big'): kun store handler i ens egen liga – ellers drukner indbakken.
 */
/**
 * Ægte CM 01/02: hver handel som sin egen nyhed – "Liverpool seal Perry deal", "Wolves sign Armstrong" (overskriften vælges efter spilleren).
 * Med den originale database afgøres modtagerne af originalens regel (cmNewsScope.ts: 0x8dbef0/0x8d1130); ellers et skøn (eget land, udlandet
 * over 8 mio. – *estimeret*).
 */
function originalTransferNews(p: Player, buyer: Club, seller: Club | undefined, fee: number, loan: boolean, addOn?: number, o?: TransferOffer, own = false): boolean {
  const g = gs();
  const me = g.clubs[g.userClub];
  if (loan || (!own && (g.options.transferNews ?? 'big') === 'own')) return false;
  if (cmMediaOn(g)) {
    if (!own && !transferNewsToMe(g, p, buyer, { seller, fee, addOn, swap: o?.swap, offerId: o?.id })) return false;
  } else {
    if (!me) return false;
    const home = buyer.nation === me.nation || seller?.nation === me.nation;
    if (!home && fee < 8_000_000 * econ()) return false;
  }
  const v = p.id % 4;
  addNews({ cat: 'transfer', key: `transfer.o${seller ? '' : 'Free'}.${v}`, params: { to: buyer.short, from: seller?.short ?? '', player: pname(p), last: p.last, fee, ...(addOn ? { fee2: fee + addOn } : {}) }, link: { kind: 'player', id: p.id } });
  return true;
}

function otherTransferNews(buyer: Club, seller: Club | undefined, fee: number, loan: boolean): boolean {
  const g = gs();
  const mode = g.options.transferNews ?? 'big';
  if (mode === 'own') return false;
  if (mode === 'all') return newsRelevant(buyer.id, seller?.id);
  const me = g.clubs[g.userClub];
  if (!me || loan || fee <= 0) return false;
  const inMyLeague = buyer.league === me.league || seller?.league === me.league;
  const big = Math.max(500_000, rulesFor(me.league, 20).wealth * 2_000_000) * econ();
  return inMyLeague && fee >= big;
}

/** Verdens højeste ugeløn (europæisk topniveau ~ 0,6-0,7 mio. €) */
const MAX_WAGE_NOW = 750_000;
const maxWage = () => MAX_WAGE_NOW * econ();

export function wageDemand(p: Player, club: Club): number {
  const g = gs();
  const wealth = rulesFor(club.league, 20).wealth;
  const market = wageFor(p.value, wealth, club.league, club.rep);
  const current = p.contract?.wage ?? 0;
  const amb = 1 + (p.attrs[42 /* ambition */] - 10) / 60;
  const repGap = Math.max(0, p.rep - club.rep) / 100;
  // nuværende løn tæller med, men kun op til 1,5× markedslønnen – ellers vokser lønnen eksponentielt ved hvert skifte
  const anchor = Math.min(current, market * 1.5);
  let d = Math.max(market, anchor * 1.1) * amb * (1 + repGap);
  if (!p.club) d *= 0.9;
  // agenten: en grisk agent forlanger mere, en loyal er billigere at forlænge med
  const ag = AGENT_RULES[agentOf(p).style];
  d *= ag.wage;
  if (p.club === club.id) d = Math.max(anchor * 1.04, market * 0.95) * amb * ag.renew;
  d = Math.min(d, market * 2.4, maxWage());
  void g;
  return Math.round(d / 50) * 50;
}

export function preferredYears(p: Player): number {
  const age = ageOn(p.dob, gs().date);
  if (age >= 32) return 1;
  if (age >= 29) return 2;
  if (age <= 21) return 5;
  return 3;
}

/** Klubbens omdømme i databasens skala (1..10000): byggescriptet gemmer round((rå/maks)^0,7 · 98) (data/cm0102.ts clubRep), her vendt om */
const clubRepRaw = (rep: number) => 10000 * Math.pow(Math.max(0, rep) / 98, 1 / 0.7);

/** 2026/27-databasen i udvidet tilstand (CM Reborns egen regel – i ægte tilstand gælder originalens vilje 0x846920, cmSearchInterest.ts/
 *  cmContractGame.ts cmMoveInterest): er klubben for lille i forhold til spillerens omdømme (databasens, ×50) og hans nuværende klub? Bygget over
 *  0x807450's forfilter (spillerens omdømme > klubbens + 5000 → nej) og 0x846920's sammenligning af spilleren mod køberen og den nuværende klub,
 *  ambition og alder. */
function dbRepGap(p: Player, club: Club, cur: Club | undefined, age: number): boolean {
  const own = Math.max(p.cmRep![1], p.cmRep![2]) * 50;
  // den nuværende klub trækker halvt med (en ung spiller i en storklub skifter ikke til en lille klub); transferlistede spillere vil væk
  const level = cur && !p.listed ? Math.max(own, (own + clubRepRaw(cur.rep)) / 2) : own;
  const tol = 1500 - (p.attrs[A.ambition] - 10) * 80 + (age >= 32 ? 1500 : age >= 30 ? 600 : 0);
  return level > clubRepRaw(club.rep) + tol;
}

/** Vil spilleren overhovedet tale med klubben? */
export function playerInterest(p: Player, club: Club): 'yes' | 'reputation' | 'happy' | 'abroad' | 'permit' {
  const g = gs();
  if (p.club === club.id) return 'yes';
  // 2001/02 (kun den originale database): britiske klubber kan ikke hente spillere uden arbejdstilladelse
  if (!permitOk(p, club)) return 'permit';
  const cur = p.club ? g.clubs[p.club] : undefined;
  const age = ageOn(p.dob, g.date);
  // (ægte tilstand – cmLogic: som den originale database – Player Search, forhandlingen og budforløbet bruger 0x846920)
  if (p.cmRep && !isOriginal2001() && !cmLogic(g) && Math.max(p.cmRep[1], p.cmRep[2]) > 0) {
    if (dbRepGap(p, club, cur, age)) return 'reputation';
  } else {
    const gap = p.rep - club.rep;
    // omdømmeforskel: ambitiøse spillere vil ikke ned til mindre klubber (før brugte reglen ved en fejl tilpasningsevnen, så
    // ambitiøse verdensstjerner gik med til små ligaer – også på Bosman); ældre spillere (30+) tager gerne et skridt ned
    const tol = 24 - (p.attrs[A.ambition] - 10) * 1.2 + (age >= 32 ? 10 : age >= 30 ? 4 : 0);
    if (gap > tol) return 'reputation';
  }
  if (cur && cur.rep > club.rep + 25 && keyPlayerRank(p) <= 11 && p.attrs[A.loyalty] > 13) return 'happy';
  // agent der vil have spilleren til en større liga: ikke et skifte i samme land eller til en fattigere liga – medmindre klubben er markant større
  if (cur && agentOf(p).style === 'abroad' && club.rep < cur.rep + 10
    && (club.nation === cur.nation || rulesFor(club.league, 20).wealth < rulesFor(cur.league, 20).wealth)) return 'abroad';
  return 'yes';
}

// ---------- byttehandler ----------

/** Hvor meget er en byttespiller værd for den sælgende klub? (mere, hvis han dækker et behov) */
export function swapWorth(pid: number, sellerId: number): number {
  const g = gs();
  const p = g.players[pid];
  if (!p) return 0;
  const needs = analyzeNeeds(sellerId).slice(0, 2).map((n) => n.role);
  return Math.round(p.value * (needs.includes(naturalRole(p)) ? 0.9 : 0.7));
}

/** Egne spillere, som den sælgende klub kunne have interesse i at få med i en byttehandel */
export function swapCandidates(sellerId: number, targetId: number, giver = gs().userClub): Player[] {
  const g = gs();
  const seller = g.clubs[sellerId];
  if (!seller || !giver) return [];
  const level = clubLevel(sellerId);
  const needs = analyzeNeeds(sellerId).slice(0, 3).map((n) => n.role);
  return squad(giver)
    .filter((p) => p.id !== targetId && !p.loan && p.contract && !p.contract.futureClub && !(p.injury && p.injury.days > 30))
    // god nok til klubben – og enten på en plads, de mangler, eller klart en forstærkning
    .filter((p) => p.ca >= level - 12 && (needs.includes(naturalRole(p)) || p.ca >= level + 3))
    .filter((p) => playerInterest(p, seller) === 'yes')
    .sort((a, b) => swapWorth(b.id, sellerId) - swapWorth(a.id, sellerId))
    .slice(0, 12);
}

/** Samlet værdi af byttespillerne i et bud (kun dem, der stadig er i køberens klub) */
function offerSwapWorth(o: TransferOffer): number {
  const g = gs();
  return (o.swap ?? []).filter((id) => g.players[id]?.club === o.buyer).reduce((s, id) => s + swapWorth(id, o.seller), 0);
}

// ---------- brugerens handlinger ----------

/** CM 01/02's bytte-skærm 0x47c180 (0x47eb98–0x47edec): køberens spillere, der må indgå – ikke på leje, med kontrakt, ikke i andre bud, og en
 *  computerklub skal ville have ham (0x843800 – hos os swapCandidates' behov, *estimeret*) */
export function exchangeOk(x: Player, receiver: number, target: number): boolean {
  if (!exchangeBaseOk(x, receiver, target)) return false;
  if (!isHumanClub(receiver) && !swapCandidates(receiver, target, x.club).some((c) => c.id === x.id)) return false;
  return true;
}
/** de almindelige krav (0x47eb98–0x47ed4c) uden modtagerens vilje (0x843800) og lønkravet – dem afgør cmExchangeCheck (cmShortlistGame.ts) */
export function exchangeBaseOk(x: Player, receiver: number, target: number): boolean {
  const g = gs();
  if (!x || x.id === target || x.loan || !x.contract || x.contract.futureClub) return false;
  if (g.offers.some((o) => ['pending', 'negotiating', 'countered'].includes(o.status) && o.player !== target && (o.player === x.id || o.swap?.includes(x.id)))) return false;
  if (!permitOk(x, g.clubs[receiver])) return false;
  return true;
}

/** Bytte-skærmen (0x47c180): giverens spillere, der kan tages med i buddet, og – er listen tom – originalens tekst ('refused' = "{klub} are not
 *  interested in a part-exchange deal.", 'noPlayers' = "No {giver} players are interested in moving to {modtager}."). Med ønskelisterne afgør
 *  cmExchangeCheck (0x843800 og lønkravet) det; ellers swapCandidates (*estimeret*). */
export function exchangeList(giver: number, receiver: number, target: number): { ids: number[]; note: 'refused' | 'noPlayers' | null } {
  const g = gs();
  const base = squad(giver).filter((x) => exchangeBaseOk(x, receiver, target));
  const cm = cmMarketOn(g) ? cmExchangeCheck(g, giver, receiver, base) : null;
  if (!cm) return { ids: base.filter((x) => exchangeOk(x, receiver, target)).map((x) => x.id), note: null };
  const ids = base.filter((x) => cm.ok.has(x.id)).map((x) => x.id);
  return { ids, note: ids.length ? null : cm.refused > 0 ? 'refused' : cm.tooDear > 0 ? 'noPlayers' : null };
}

/** Et ventende bud fra menneskets klub på spilleren (CM 01/02: Action-menuen viser da Withdraw/Change Transfer Bid) */
export function myPendingBid(pid: number): TransferOffer | undefined {
  const g = gs();
  return g.offers.find((o) => o.player === pid && o.buyer === g.userClub && !o.loan && (o.status === 'pending' || o.status === 'countered'));
}

export function makeBid(pid: number, fee: number, loan = false, extra?: { sellOn?: number; addOn?: number; swap?: number[]; terms?: BidTerms; change?: boolean; loanUntil?: string; loanShare?: number; loanNoCup?: boolean; loanNoAgainst?: boolean }): TransferOffer | string {
  const g = gs();
  const p = g.players[pid];
  const buyer = g.clubs[g.userClub];
  if (!p || !buyer) return 'error';
  // CM 01/02: hverken Action-menuen (0x872794/0x87282a) eller Offer (0x8ef9f0 → add_transfer_offer 0x8be300) ser på vinduet – et bud i det
  // lukkede vindue kan afgives; Confirm Transfer Offer (0x8cfc90, grund 9) venter på vinduet, og en klubløs får tidsnibble 1 (negotiate)
  if (!cmMarketOn(g) && !windowOpen(gs().date, buyer.id)) return 'transfer.windowClosed';
  if (p.club === buyer.id) return 'error';
  // CM 01/02: budskærmen (0x8ec420 Offer → 0x8ef9f0 → add_transfer_offer 0x8be300) har intet loft – beløbet står blot i rødt over bestyrelsens
  // grænse; pengene kontrolleres først ved Confirm Transfer Offer (0x8cfc90: budget × 1,1 → Delay Transfer Offer)
  if (!loan && fee > buyer.transferBudget && !cmMarketOn(g)) return 'transfer.overBudget';
  if (loan && loanBlocked(p, buyer)) return 'transfer.loanNonEu';
  // (spil startet med porten: som originalen ingen kontrol ved buddet – 0x8c7950 afgør det ved handlens gennemførelse 0x8c7690, completeTransfer)
  if (!cmPermitOn(g) && !permitOk(p, buyer)) return 'transfer.noWorkPermit';
  // Change Transfer Bid (CM 01/02): det ventende bud erstattes af det ændrede (*estimeret*: et nyt bud med ny svartid)
  if (extra?.change && cmMarketOn(g)) { const old = myPendingBid(pid); if (old) { old.status = 'withdrawn'; old.cmCounter = undefined; } }
  // klubløs (CM 01/02): det åbne kontrakttilbud (intet svar ventende) åbnes igen med Offer Contract
  const again = !p.club && cmLogic(g) ? g.offers.find((o) => o.player === pid && o.buyer === buyer.id && !o.loan && o.cmTalks?.state !== 1 && cmTalksOpen(g, o)) : undefined;
  if (again) return again;
  if (g.offers.some((o) => o.player === pid && o.buyer === buyer.id && (['pending', 'negotiating', 'countered'].includes(o.status) || (o.status === 'accepted' && !!o.cmFut)))) return 'transfer.alreadyBidding';
  // add_transfer_offer 0x8be300 (0x8be979–0x8be9ad): menneskets køber får spilleren på sin shortliste (SCOUT_MANAGER::add_to_shortlist 0x7f75f0)
  if (cmMarketOn(g) && p.club && !g.shortlist.includes(pid)) g.shortlist.push(pid);
  const humanSeller = isHumanClub(p.club);
  const o: TransferOffer = {
    id: g.nextId.offer++, player: pid, buyer: buyer.id, seller: p.club, fee: p.club ? fee : 0, loan,
    status: p.club ? 'pending' : 'negotiating', created: g.date, respondBy: addDays(g.date, !p.club ? 7 : humanSeller ? 5 : rng.int(1, 3)),
  };
  // CM 01/02 (en CM-database i ægte tilstand): Offer Contract til en klubløs er et kontrakttilbud som alle andre (add_contract_offer 0x4cc490) –
  // kravet 0x85fc50 på skærmen, svaret efter 1–5 dage i resolve_contract_offers 0x4ce4e0 (cmTransferTalks.ts), ingen frist
  if (!p.club && !loan && cmLogic(g)) { o.cmTalks = { rounds: 0, state: 0 }; o.respondBy = addDays(g.date, 3650); }
  // byder en anden manager også på spilleren hos en AI-klub: lukket budrunde med fælles frist
  if (p.club && !loan && !humanSeller && legacyExtended()) startAuction(o, p); // budkrige: ikke i CM 01/02
  if (p.club && loan && extra?.loanUntil) {
    o.loanUntil = extra.loanUntil; o.loanShare = Math.max(0, Math.min(1, extra.loanShare ?? 0));
    // lejebudskærmen 0x8fb5e0 → make_loan_offer 0x8bed60: afkrydsningerne (handling 8/9) følger buddet til lejekontrakten (0x85e590 +0x1c/+0x1d)
    if (extra.loanNoCup) o.loanNoCup = true;
    if (extra.loanNoAgainst) o.loanNoAgainst = true;
  }
  // CM 01/02: lejebuddet til en computerklub (make_loan_offer 0x8bed60 → add_transfer_offer 0x8be300): svartiden 0x8cc5b0 og sælgerens svar
  // 0x84af00 kommer i dagens behandling (cmAiAiDue / cmHumanLoanDue)
  if (p.club && loan && !humanSeller && cmMarketOn(g)) { o.cmLoan = 1; o.respondBy = g.date; }
  if (p.club && !loan && extra?.sellOn) o.sellOn = Math.max(0, Math.min(50, Math.round(extra.sellOn)));
  if (p.club && !loan && extra?.addOn) o.addOn = roundValue(Math.max(0, extra.addOn));
  if (p.club && !loan && extra?.swap?.length) {
    const ok = [...new Set(extra.swap)].filter((id) => { const x = g.players[id]; return x && x.club === buyer.id && x.id !== pid && !x.loan; }).slice(0, cmMarketOn(g) ? MAX_SWAP : 3);
    if (ok.length) o.swap = ok;
  }
  // CM 01/02: hele budskærmens vilkår (rater, klausuler, offentligt) – den originale database i ægte tilstand og 2026/27 med originalens marked
  if (p.club && !loan && extra?.terms && cmMarketOn(g)) putTerms(o, { ...extra.terms, fee: o.fee, swap: o.swap ?? [] });
  g.offers.push(o);
  if (humanSeller) {
    // Bud til en anden menneskelig manager
    asOwner(p.club, () => addNews({ cat: 'transfer', key: 'transfer.incomingBid', params: { club: buyer.name, player: pname(p), fee: o.fee }, link: { kind: 'offer', id: o.id } }));
  }
  return o;
}

/** Forespørgsel: hvad vil klubben have for spilleren? Svaret gemmes, så budvinduet kan bruge det. */
export function enquire(pid: number): string {
  const g = gs();
  const p = g.players[pid];
  const buyer = g.clubs[g.userClub];
  const seller = p && g.clubs[p.club];
  if (!p || !buyer || !seller || p.club === buyer.id) return 'error';
  if (isHumanClub(seller.id)) return 'enquiry.human';
  const m = notForSaleMult(p, buyer);
  // rund op, så et bud på den nævnte pris altid er nok
  const need = askingPrice(p) * Math.max(1, m);
  let fee = roundValue(need);
  if (fee < need) fee = roundValue(need + (need < 1_000_000 ? 12_500 : need < 10_000_000 ? 50_000 : 250_000));
  const all = (g.manager.enquiries ??= {});
  for (const [id, e] of Object.entries(all)) if (daysBetween(e.date, g.date) > 90) delete all[Number(id)];
  all[pid] = { date: g.date, club: seller.id, fee, nfs: m > 0 };
  addNews({ cat: 'transfer', key: m > 0 ? 'enquiry.nfs' : p.listed ? 'enquiry.listed' : 'enquiry.price', params: { club: seller.name, player: pname(p), fee }, link: { kind: 'player', id: pid } });
  return m > 0 ? 'enquiry.nfs' : p.listed ? 'enquiry.listed' : 'enquiry.price';
}

/** Seneste svar på en forespørgsel (kun hvis spilleren stadig er i samme klub) */
export function knownEnquiry(pid: number) {
  const g = gs();
  const e = g.manager.enquiries?.[pid];
  return e && g.players[pid]?.club === e.club ? e : undefined;
}

/** Brugeren sælger: svar på et bud */
export function respondToOffer(id: number, action: 'accept' | 'reject' | 'counter', counter?: number, sellOn?: number, reason?: RejectReason, cm?: { terms?: BidTerms; reject?: RejectKey; changed?: boolean; all?: boolean }): string | null | void {
  const g = gs();
  const o = g.offers.find((x) => x.id === id);
  if (!o || o.status !== 'pending' || o.seller !== g.userClub) return;
  // spilleren er ikke længere hos os (solgt på et andet bud): buddet er ikke vores at svare på (offerLive.ts)
  if (!offerLive(g, o)) { o.status = 'withdrawn'; return; }
  const p = g.players[o.player];
  const buyer = g.clubs[o.buyer];
  const myName = g.clubs[g.userClub]?.name ?? '';
  if (cmMarketOn(g) && p && buyer) return cmRespond(o, p, buyer, action, cm ?? {});
  if (action === 'reject') {
    o.status = 'rejected';
    if (!isHumanClub(buyer.id) && !o.loan) startPursuit(o);
    // spilleren kan blive skuffet og bede om en samtale (især ambitiøse spillere ved et skridt op)
    const reply = p ? blockedMoveReaction(p, buyer.id, o.fee, reason) : null;
    if (isHumanClub(buyer.id)) asOwner(buyer.id, () => addNews({ cat: 'transfer', key: 'transfer.bidRejected', params: { player: pname(p), club: myName }, link: { kind: 'player', id: p.id } }));
    return reply;
  }
  if (isHumanClub(buyer.id)) {
    // Menneskelig køber: modbud eller videre til kontraktforhandling
    if (action === 'counter' && counter) {
      o.status = 'countered';
      o.counter = counter;
      asOwner(buyer.id, () => addNews({ cat: 'transfer', key: 'transfer.bidCountered', params: { player: pname(p), club: myName, fee: counter }, link: { kind: 'offer', id: o.id } }));
    } else {
      o.status = 'negotiating';
      o.respondBy = addDays(g.date, 10);
      const sellerName = g.clubs[o.seller]?.name ?? '';
      asOwner(buyer.id, () => addNews({ cat: 'transfer', key: 'transfer.bidAccepted', params: { player: pname(p), club: sellerName, fee: o.fee }, link: { kind: 'offer', id: o.id } }));
    }
    return;
  }
  if (action === 'counter' && counter) {
    // Prisforhandling med AI-køberen
    const max = o.maxFee ?? Math.min(buyer.transferBudget, Math.round(o.fee * 1.25));
    // en ønsket videresalgsprocent koster køberen noget – den tæller med i deres smertegrænse
    const extra = sellOn ? bidClauseWorth(p, counter, sellOn) : 0;
    if (counter + extra <= max && counter <= buyer.transferBudget) {
      o.fee = counter;
      if (sellOn) o.sellOn = sellOn;
    } else if (sellOn && counter <= max && (o.priceRounds ?? 0) >= 1) {
      // de betaler prisen, men vil ikke give videresalg
      o.priceRounds = (o.priceRounds ?? 0) + 1;
      o.fee = counter;
      addNews({ cat: 'transfer', key: 'transfer.aiNoSellOn', params: { club: buyer.name, player: pname(p), fee: o.fee }, link: { kind: 'offer', id: o.id } });
      o.respondBy = addDays(g.date, 3);
      return;
    } else {
      o.priceRounds = (o.priceRounds ?? 0) + 1;
      // bliver modbuddet ved at være langt over det de vil betale, eller er der forhandlet længe, går de
      if (o.priceRounds >= 3 || counter > max * 1.6) {
        o.status = 'withdrawn';
        addNews({ cat: 'transfer', key: 'transfer.aiWithdrew', params: { club: buyer.name, player: pname(p) } });
        blockedMoveReaction(p, buyer.id, o.fee);
        return;
      }
      // ellers hæver de buddet et stykke mod deres smertegrænse
      const step = o.priceRounds === 1 ? 0.6 : 1;
      o.fee = roundValue(Math.min(max, o.fee + (max - o.fee) * step));
      o.respondBy = addDays(g.date, 3);
      addNews({ cat: 'transfer', key: o.fee >= max ? 'transfer.aiFinalOffer' : 'transfer.aiRaised', params: { club: buyer.name, player: pname(p), last: p.last || pname(p), fee: o.fee }, link: { kind: 'offer', id: o.id } });
      return;
    }
  }
  // AI forhandler med spilleren
  if (playerInterest(p, buyer) !== 'yes' && !o.loan) {
    o.status = 'collapsed';
    addNews({ cat: 'transfer', key: 'transfer.playerRefusedMove', params: { club: buyer.name, player: pname(p), last: p.last || pname(p), from: g.clubs[p.club]?.name ?? '' }, link: { kind: 'player', id: p.id } });
    return;
  }
  completeTransfer(o, wageDemand(p, buyer), preferredYears(p));
}

/** CM 01/02: mennesket svarer på et bud på sin spiller (budskærmen 0x8ec420, afvisningen 0x8f06f0, computerkøberens vurdering 0x8c0810) */
function cmRespond(o: TransferOffer, p: Player, buyer: Club, action: 'accept' | 'reject' | 'counter', cm: { terms?: BidTerms; reject?: RejectKey; changed?: boolean; all?: boolean }): string | null {
  const g = gs();
  const myName = g.clubs[g.userClub]?.name ?? '';
  if (action === 'reject') {
    // Reject All (handling 4): alle åbne bud på spilleren afvises med samme grund
    const offers = cm.all ? g.offers.filter((x) => x.player === p.id && x.seller === g.userClub && x.status === 'pending') : [o];
    // 0x8c5800/0x8ce0e0: trupstatus og tilfredsheden (kontrakt +0x44) – ingen besked fra spilleren (det udvidede spils blockedMoveReaction)
    applyRejectReason(p, cm.reject ?? 'none', !!cm.changed);
    for (const x of offers) {
      x.status = 'rejected';
      const b = g.clubs[x.buyer];
      // computerens køber kommer igen via sin ønskeliste (cmShortlistGame.ts: pladsens mål bliver stående, 0x84a020 byder igen)
      if (b && !isHumanClub(b.id) && !x.loan && !cmShortlistOn(g)) startPursuit(x);
      if (b && isHumanClub(b.id)) asOwner(b.id, () => addNews({ cat: 'transfer', key: 'transfer.bidRejected', params: { player: pname(p), club: myName }, link: { kind: 'player', id: p.id } }));
    }
    return null;
  }
  if (action === 'counter' && cm.terms) {
    if (isHumanClub(buyer.id)) {
      o.status = 'countered';
      o.counter = cm.terms.fee;
      o.cmCounter = { ...cm.terms, swap: [...cm.terms.swap] };
      asOwner(buyer.id, () => addNews({ cat: 'transfer', key: 'transfer.bidCountered', params: { player: pname(p), club: myName, fee: cm.terms!.fee }, link: { kind: 'offer', id: o.id } }));
      return null;
    }
    // add_transfer_negotiation 0x8be9d0: modbuddet gemmes (tilstand 1), og computerens køber svarer først, når det forfalder (2 dage – som
    // computer → computer-buddene i cmAiAiDue) – før kom "… is our final offer" samme dag (ejerens fund 16/11)
    o.status = 'countered';
    o.cmCounter = { ...cm.terms, swap: [...cm.terms.swap] };
    o.respondBy = addDays(g.date, 2);
    return null;
  }
  if (cm.terms) putTerms(o, cm.terms);
  if (isHumanClub(buyer.id)) {
    o.status = 'negotiating';
    o.respondBy = addDays(g.date, 10);
    asOwner(buyer.id, () => addNews({ cat: 'transfer', key: 'transfer.bidAccepted', params: { player: pname(p), club: myName, fee: o.fee }, link: { kind: 'offer', id: o.id } }));
    return null;
  }
  if (playerInterest(p, buyer) !== 'yes' && !o.loan) {
    o.status = 'collapsed';
    addNews({ cat: 'transfer', key: 'transfer.playerRefusedMove', params: { club: buyer.name, player: pname(p), last: p.last || pname(p), from: g.clubs[p.club]?.name ?? '' }, link: { kind: 'player', id: p.id } });
    return null;
  }
  // 0x8c0660: mennesket accepterer computerens lejebud → spillerens svar 0x4cc930
  if (o.loan && cmLogic(g) && cmLoanRefuses(g, p, buyer.id)) { cmLoanRejectsMove(o, p); return null; }
  // 0x8c0080 + 0x8d7cd0: bytte-spillerne til mennesket – lønkravet (1,5 × loftet) og derefter menneskets kontraktforhandling med hver af dem
  if (cmSwapOn(o, true)) {
    const xs = (o.swap ?? []).map((id) => g.players[id]).filter((x): x is Player => !!x && x.club === buyer.id);
    const chk = cmExchangeCheck(g, buyer.id, o.seller, xs);
    const tooDear = new Set(chk ? xs.filter((x) => !chk.ok.has(x.id)).map((x) => x.id) : []);
    if (cmSwapAccept(o, p, tooDear, (x) => x.value)) return null;
  }
  completeTransfer(o, wageDemand(p, buyer), preferredYears(p));
  return null;
}

/** 0x8c0810 med keep_existing = 1 (efter at en bytte-spiller afviste menneskets kontrakt, 0x8c28c0): computerens køber vurderer buddet på stedet –
 *  trækker det (W > M eller over transferbudgettet) eller justerer beløbet/bytte-spillerne; intet nyt bud. False = trukket. */
function cmReviewKeep(o: TransferOffer): boolean {
  const g = gs();
  const p = g.players[o.player], buyer = g.clubs[o.buyer];
  if (!p || !buyer) { o.status = 'withdrawn'; return false; }
  const c = valueCtx(g, p, buyer.id);
  const funds = cmFundsNow(g, buyer.id);   // 0x8c0810: 0x598800 på dagen
  const M = toK(o.maxFee ?? Math.min(funds, Math.round(o.fee * 1.25)), buyer.id);
  const r = aiReview(termsOf(o), c, M, (id) => (g.players[id] ? toK(askingPrice(g.players[id]), g.players[id].club) : 0), toK(funds, buyer.id));
  if (r.kind === 'withdraw') {
    o.status = 'withdrawn';
    asOwner(o.seller, () => addNews({ cat: 'transfer', key: 'transfer.aiWithdrew', params: { club: buyer.name, player: pname(p) } }));
    return false;
  }
  putTerms(o, r.terms);
  o.final = true;
  // bytte-spillere, køberen droppede (0x8c0810), er ude af forhandlingen
  if (o.cmSwapTalks) for (const k of Object.keys(o.cmSwapTalks)) if (!o.swap?.includes(+k) && o.cmSwapTalks[+k].state !== 4) delete o.cmSwapTalks[+k];
  return true;
}

/** 0x8c0810 (process_due_offer, tilstand 1): computerens køber vurderer menneskets modbud mod sin værdisætning M (0x840d80 – hos os buddets
 *  loft maxFee, *estimeret*) – trækker buddet eller byder endeligt */
function cmReviewHumanCounter(o: TransferOffer): void {
  const g = gs();
  const p = g.players[o.player], buyer = g.clubs[o.buyer];
  const t = o.cmCounter;
  o.cmCounter = undefined;
  if (!p || !buyer || !t || p.club !== o.seller) { o.status = 'withdrawn'; return; }
  // (MODERN_PARITY 3) pengene i £ med køberens faktor (bytte-spillerne deres klubs – cmMoney.ts; den originale database 0,86)
  const c = valueCtx(g, p, buyer.id);
  const funds = cmFundsNow(g, buyer.id);   // 0x8c0810: 0x598800 på dagen
  const M = toK(o.maxFee ?? Math.min(funds, Math.round(o.fee * 1.25)), buyer.id);
  const r = aiReview(t, c, M, (id) => (g.players[id] ? toK(askingPrice(g.players[id]), g.players[id].club) : 0), toK(funds, buyer.id));
  if (r.kind === 'withdraw') {
    o.status = 'withdrawn';
    asOwner(o.seller, () => addNews({ cat: 'transfer', key: 'transfer.aiWithdrew', params: { club: buyer.name, player: pname(p) } }));
    return;
  }
  putTerms(o, r.terms);
  o.final = true;
  o.status = 'pending';
  o.respondBy = addDays(g.date, 3);
  asOwner(o.seller, () => addNews({ cat: 'transfer', key: 'transfer.aiFinalOffer', params: { club: buyer.name, player: pname(p), last: p.last || pname(p), fee: o.fee }, link: { kind: 'offer', id: o.id } }));
}

/** Kontraktforhandling: brugeren tilbyder løn og længde */
/** Spillerens forventede plads i trupen (1 = bedst) – bruges til at vurdere bonusser */
function rankIn(p: Player, clubId: number): number {
  return 1 + squad(clubId).filter((x) => x.id !== p.id && x.ca > p.ca + 1).length;
}

/** Klausulernes værdi for spilleren i en given klub */
export function clausesWorthFor(p: Player, clubId: number, wage: number, years: number, c: ContractClauses): number {
  return clauseWorth(p, wage, years, c, rankIn(p, clubId));
}

/** bestyrelsens nej til lønnen: i ægte tilstand med den originale database Offer Contract-skærmens loft get_max_wage 0x5968d0 pr. spiller
 *  (cmBudget.ts – originalen har intet samlet lønbudget), ellers spillets lønbudget (`fallback`) */
function overBoardWage(p: Player, clubId: number, wage: number, fallback: boolean, role?: TransferOffer['cmRole']): boolean {
  const a = cmBoardWageAllow(gs(), p, clubId, role);
  // som Offer Contract-skærmens + (0x4e2280: det næste trin 0x43f460 flag 8 mod loftet): lønnen må nå loftet afrundet til lønnens trin – ellers
  // kunne det tilbud, skærmen tillader (fx £90,000 ved et loft på £89,7xx), afvises (ejerens fund 25/11, Ronaldinho)
  return a !== null ? cashRound(cashUnits(wage), 8) > cashRound(cashUnits(a), 8) : fallback;
}

export function negotiate(offerId: number, wage: number, years: number, clauses?: ContractClauses): 'accepted' | 'counter' | 'refused' | 'budget' | 'pending' | 'cmSent' {
  const g = gs();
  const o = g.offers.find((x) => x.id === offerId);
  if (!o) return 'refused';
  const p = g.players[o.player];
  const club = g.clubs[o.buyer];
  // CM 01/02: Offer Contract efter et accepteret bud – svaret kommer som nyhed om 1–5 dage (cmTransferTalks.ts)
  if (o.cmTalks && cmLogic(g)) {
    if (club.id === g.userClub && overBoardWage(p, club.id, wage, currentBill(club.id) + wage > club.wageBudget, o.cmRole)) return 'budget';
    // Offer Contract-skærmens Offer for en klubløs (0x4e51d9–0x4e526b): kan køberen ikke skrive under med ham i dag (0x8ced40 → can_sign_player
    // 0x8e8560 – fx det lukkede vindue, grund 9), får buddet tidsnibble 1: aftalen gennemføres på første dag i købers vindue (0x8cee70)
    if (!o.seller && !o.loan && cmMarketOn(g)) o.cmTime = cmCanSign(g, club, p, g.date.slice(0, 10)) ? 1 : 0;
    // forkontrakt (spilleren har kontrakt hos en anden klub, 0x4e5192–0x4e51d0): tidsnibble 3 med kontraktens udløb (+0x2d) som dato – skiftet
    // sker dagen efter udløbet (0x8cee70); kan køberen ikke skrive under med ham på den dato (0x8ced40), nibble 4: første dag i købers vindue
    if (o.preContract && !o.loan && cmMarketOn(g) && p.contract) {
      o.cmUntil = p.contract.expires.slice(0, 10);
      o.cmTime = cmCanSign(g, club, p, o.cmUntil) ? 4 : 3;
    }
    return cmOfferContract(o, wage, years, clauses);
  }
  // CM 01/02 (original database, ægte tilstand – her klubløse og forkontrakter uden cmTalks): spillerens vilje 0x846920 som 0x8c0080 (under
  // 0,75 vil han ikke) i stedet for spillets skøn – samme funktion som Player Search' "Interested" (cmSearchInterest.ts) og budforløbet
  // (en klubløs i en CM-database i ægte tilstand har cmTalks – originalens 0x4ce4e0 ovenfor; her kun ældre spil)
  const cmX = cmLogic(g) && !o.loan ? cmMoveInterest(g, p, club.id) : null;
  const interest = cmX !== null ? (cmX < 0.75 ? 'reputation' : 'yes') : playerInterest(p, club);
  if (interest !== 'yes') {
    o.status = 'collapsed';
    addNews({ cat: 'transfer', key: interest === 'reputation' ? 'transfer.refuseRep' : interest === 'abroad' ? 'transfer.refuseAbroad' : interest === 'permit' ? 'transfer.permitRefused' : 'transfer.refuseHappy', params: { player: pname(p), club: club.name } });
    return 'refused';
  }
  const demand = wageDemand(p, club);
  const want = preferredYears(p);
  o.rounds = (o.rounds ?? 0) + 1;
  const yearsOk = Math.abs(years - want) <= (want >= 3 ? 2 : 1);
  if (club.id === g.userClub && overBoardWage(p, club.id, wage, currentBill(club.id) + wage > club.wageBudget, o.cmRole)) return 'budget';
  const cl = cleanClauses(clauses);
  if (wage + clausesWorthFor(p, club.id, wage, years, cl) >= demand * AGENT_RULES[agentOf(p).style].accept && yearsOk) {
    // multiplayer: frie spillere og Bosman-aftaler kan andre også byde på – spilleren svarer i morgen
    if (isMultiplayer(g) && (o.preContract || !o.seller)) {
      o.status = 'pending';
      o.signing = { wage, years, clauses: Object.keys(cl).length ? cl : undefined };
      o.respondBy = addDays(g.date, 1);
      addNews({ cat: 'transfer', key: 'signing.pending', params: { player: pname(p) }, link: { kind: 'player', id: p.id } });
      // en anden manager har også et tilbud liggende: budkrig – begge kan hæve én gang, blindt
      const rivals = g.offers.filter((x) => x !== o && x.player === p.id && x.status === 'pending' && x.signing && x.buyer !== o.buyer && isHumanClub(x.buyer));
      if (rivals.length) {
        const all = [o, ...rivals];
        const newWar = rivals.every((x) => !x.war);
        const deadline = addDays(g.date, 2);
        for (const x of all) {
          const fresh = !x.war;
          x.war = true;
          x.respondBy = deadline;
          if (fresh || x === o) asOwner(x.buyer, () => addNews({ cat: 'transfer', key: 'war.startedWage', params: { player: pname(p), n: all.length, date: deadline, oid: x.id }, link: { kind: 'player', id: p.id } }));
        }
        if (newWar) warHeadline(p, all.map((x) => x.buyer));
      }
      return 'pending';
    }
    if (o.preContract) {
      completePreContract(o, wage, years, cl);
      return 'accepted';
    }
    completeTransfer(o, wage, years, cl);
    return 'accepted';
  }
  if (o.rounds >= 3) {
    o.status = 'collapsed';
    addNews({ cat: 'transfer', key: 'transfer.talksCollapsed', params: { player: pname(p) } });
    return 'refused';
  }
  o.demand = { wage: Math.round(demand * (1 + (o.rounds - 1) * 0.03) / 50) * 50, years: want };
  return 'counter';
}

function completePreContract(o: TransferOffer, wage: number, years: number, cl: ContractClauses) {
  const g = gs();
  const p = g.players[o.player];
  const club = g.clubs[o.buyer];
  // CM 01/02 (menneskets køber har bekræftet – Confirm Transfer Offer 0x8f2ec0 → confirm_offer_by_club 0x8c3310): handlens dato ligger efter i
  // dag → 0x8e05d0, nyheden 0xfb3 "{Club} to sign <Player>" med datoen, og add_future_transfer 0x8cb9a0: buddet (med kontrakttilbuddet og dets
  // +0x4f – Set Role At Club) venter til datoen, hvor process_due_future_transfers 0x8cbbe0 sender 0x8dbef0's nyhed og gennemfører handlen
  // 0x8c9390 (sign_contract 0x4cf720 med tilbuddets trupstatus) – cmHumanFreeDue. Før blev aftalen en forhåndsaftale på kontrakten, og skiftet
  // ved udløbet (season.ts) gav trupstatus 0 og Bosman-teksten i stedet for originalens nyhed (ejerens fund 25/11: Rodrigo)
  if (o.cmTime && cmMarketOn(g)) {
    const date = cmCompletionDate(g, o);
    cmAgreedNews(o, p, club, date);
    o.status = 'accepted';
    o.cmFut = date;
    o.cmTalks = { ...(o.cmTalks ?? { rounds: 0 }), state: 5, agreed: { wage, years, clauses: Object.keys(cl).length ? cl : undefined } };
    if (p.contract) p.contract.futureClub = club.id;
    return;
  }
  p.contract = { ...(p.contract ?? { wage, expires: g.date }), futureClub: club.id, futureWage: wage, futureExpires: `${year(g.date) + years + (month(g.date) >= 7 ? 1 : 0)}-06-30`, ...(o.cmRole ? { futureRole: o.cmRole } : {}) };
  p.futureClauses = Object.keys(cl).length ? cl : undefined;
  o.status = 'completed';
  const from = o.seller ? g.clubs[o.seller]?.name : undefined;
  asOwner(club.id, () => addNews({ cat: 'transfer', key: 'transfer.preContract', params: { player: pname(p), club: club.name, ...(from ? { from } : {}) }, link: { kind: 'player', id: p.id } }));
}

/** confirm_offer_by_club 0x8c3310 → 0x8e05d0: nyheden 0xfb3 (tekst 0x8e08e0) til de involverede menneskeklubber (0x8d1130 flag 0xf: køber og
 *  sælger) – "{Club} to sign <Player>" (0xa9bb9c, klubbens korte navn +0x38) og "The transfer of <Player> to {Club} [from {Club}] [for …] has
 *  been agreed." (0xa9be10 uden sælger, 0xa9be7c, 0xa9bd20 …) + "The transfer will go through on {date}." (0xa9bbec) */
function cmAgreedNews(o: TransferOffer, p: Player, buyer: Club, date: string): void {
  const g = gs();
  const sh = (c: Club | undefined) => c?.short || c?.name || '';
  const seller = o.seller ? g.clubs[o.seller] : undefined;
  const params = { to: sh(buyer), player: pname(p), date, ...(seller ? { from: sh(seller) } : { free: 1 }), ...(o.fee > 0 ? { fee: o.fee } : {}) };
  const news = () => addNews({ cat: 'transfer', key: 'transfer.cmAgreed', params, link: { kind: 'player', id: p.id } });
  if (isHumanClub(buyer.id)) asOwner(buyer.id, news);
  if (seller && isHumanClub(seller.id)) asOwner(seller.id, news);
}

/**
 * Dagligt i multiplayer: frie spillere og Bosman-spillere vælger mellem kontrakttilbuddene.
 * Bedste tilbud i forhold til hvad han kræver hos den klub – et større omdømme trækker også.
 */
export function resolveSignings() {
  const g = gs();
  const byPlayer = new Map<number, TransferOffer[]>();
  for (const o of g.offers) if (o.signing && o.status === 'pending') byPlayer.set(o.player, [...(byPlayer.get(o.player) ?? []), o]);
  for (const [pid, list] of byPlayer) {
    if (!list.some((o) => g.date >= o.respondBy)) continue;
    const p = g.players[pid];
    const valid = list.filter((o) => p && (o.preContract ? !p.contract?.futureClub && p.club !== o.buyer : !p.club) && g.clubs[o.buyer]);
    const score = (o: TransferOffer) => o.signing!.wage / Math.max(1, wageDemand(p, g.clubs[o.buyer])) + (g.clubs[o.buyer].rep - p.rep) / 150;
    const sortedValid = valid.slice().sort((a, b) => score(b) - score(a) || a.id - b.id);
    const win = sortedValid[0];
    if (win && list.some((o) => o.war) && sortedValid.length > 1) warReveal(p, sortedValid, true);
    if (win) {
      const sg = win.signing!;
      if (win.preContract) completePreContract(win, sg.wage, sg.years, sg.clauses ?? {});
      else completeTransfer(win, sg.wage, sg.years, sg.clauses);
      if (list.length > 1 && !list.some((o) => o.war)) asOwner(win.buyer, () => addNews({ cat: 'transfer', key: 'signing.won', params: { player: pname(p), n: list.length }, link: { kind: 'player', id: p.id } }));
    }
    for (const o of list) {
      if (o === win) continue;
      o.status = 'rejected';
      o.outbid = true;
      if (!(win && o.war)) asOwner(o.buyer, () => addNews({ cat: 'transfer', key: win ? 'signing.lost' : 'signing.gone', params: { player: pname(p), club: win ? g.clubs[win.buyer]?.name ?? '' : '' }, link: { kind: 'player', id: pid } }));
    }
  }
}

function currentBill(clubId: number) {
  return squad(clubId).reduce((s, p) => s + (p.contract?.wage ?? 0), 0);
}

/** CM 01/02 (den originale database i ægte tilstand): computerklubbens nye kontrakt som originalens 0x4cda70/0x85fc50 (løn, længde,
 *  bonusser, klausuler – cmContractGame.ts); Signing On Fee betales af klubben ved underskriften. Menneskeklubber og andre databaser: `fallback`. */
function aiNewContract(p: Player, club: Club, fallback: () => Contract): Contract {
  const g = gs();
  if (isHumanClub(club.id)) return fallback();
  const r = aiContract(g, p, club, fallback);
  if (r.signOn > 0) { club.balance -= r.signOn; club.finance.signOn = (club.finance.signOn ?? 0) + r.signOn; bookBlockEur(g, club, CMK.signOn, r.signOn); }
  return r.contract;
}

export function completeTransfer(o: TransferOffer, wage: number, years: number, clauses?: ContractClauses): boolean {
  const g = gs();
  const p = g.players[o.player];
  const buyer = g.clubs[o.buyer];
  const seller = o.seller ? g.clubs[o.seller] : undefined;
  if (!p || !buyer) return false;
  // sælgeren er spillerens kontraktklub (offerLive.ts): er han skiftet, er buddet ikke længere til den klub – intet nyt skifte (et andet
  // accepteret bud solgte ham før en gang til)
  if (o.seller && !offerLive(g, o)) { o.status = 'withdrawn'; return false; }
  if (o.loan && p.loan) { o.status = 'withdrawn'; return false; }
  // CM 01/02 0x8c7690 (handlen: 0x8c7560(spiller, køber, 0) 0x8c7704) / 0x8c38b0 (den klubløse: flag 1 0x8c38d5) og 0x8c7950 med det aftalte kontrakttilbud (klub, løn,
  // udløb) – afslag: nyheden 0x13 ("Work permit refused"), tilbuddet +0x2c = 0x10 (spil startet med porten – cmPermit.ts)
  // (menneskets køb uden tidsnibble: afgjort før bekræftelsen – 0x8c2f50 tilstand 0xa → 0x8c7690, cmTransferTalks.ts cmAgreed – permitDone)
  if (!o.loan && cmPermitOn(g) && !o.cmTalks?.permitDone && cmNeedsPermit(g, p, buyer.id, !seller)
    && !cmWorkPermit(g, p, { club: buyer.id, wageGbp: Math.round(wage * cmGbp(g, buyer.id)), expires: `${year(g.date) + Math.max(1, years)}-06-30` }, null)) {
    o.status = 'collapsed';
    // 0x8c7744: nyheden 0xfb0 med grunden 0x13 (0x8de790; modtagerne 0x8d1130 med flagene 0x2f – køberen og sælgeren her): overskriften
    // 0xa9d514 "<X> fails to get work permit" (0x8e3aee), brødteksten 0xa9ade8 (med kontraktklub) / 0xa9ad4c (uden) (0x8dee56)
    const params = { player: pname(p), last: p.last || pname(p), seller: seller?.short || seller?.name || '', buyer: buyer.short || buyer.name, nat: g.nations[buyer.nation]?.adj ?? '' };
    const news = () => addNews({ cat: 'transfer', key: seller ? 'transfer.cmPermit' : 'transfer.cmPermitFree', params, link: { kind: 'player', id: p.id } });
    asOwner(buyer.id, news);
    if (seller && isHumanClub(seller.id)) asOwner(seller.id, news);
    return false;
  }
  if (o.loan) {
    // CM 01/02: lejekontrakten 0x85e590 med buddets udløb og lønprocent (menneskets Loan bid / computerens 0x842740 – køberlandets lejeperiode
    // 0x8d0590, cmLoan.ts); lejeklubben betaler andelen `share`
    p.loan = { from: p.club, until: o.loanUntil ?? `${year(g.date) + (month(g.date) >= 7 ? 1 : 0)}-06-30`, ...(o.loanShare !== undefined ? { share: o.loanShare } : {}), ...(o.option ? { option: o.option } : {}),
      ...(o.loanNoCup ? { noCup: true as const } : {}), ...(o.loanNoAgainst ? { noAgainst: true as const } : {}) };
    if (cmShortlistOn(g)) noteLoan(buyer.id);
  } else {
    // (MODERN_PARITY 3) 2026/27 med originalens marked: alle handler (også menneskets) som originalen – rater, klausuler, videresalg
    const cm = !!seller && cmMarketOn(g);
    // en tidligere klub kan have krav på en del af fortjenesten (CM 01/02 0x8cb0f0: procent af hele summen + bytte-spillernes værdi, ≥ £1000)
    if (cm) { if (p.sellOn) settleSellOn(p, o.fee + (o.swap ?? []).reduce((s2, id) => s2 + (g.players[id]?.value ?? 0), 0), seller, fromK(1000, buyer.id), buyer); }
    else if (o.fee > 0) settleSellOn(p, o.fee, seller, 0, buyer);
    // CM 01/02 0x8ca8a0: med rater betales første rate nu. Transferbudgettet: med originalens økonomi 0x598800 af saldoen og sæsonblokken
    // efter handlen (cmFundsAfterDeal nedenfor); ellers trækkes hele summen
    const now = cm ? cmBookClauses(o, p, buyer, seller!) : o.fee;
    const liveFunds = cmFinOn(g);
    buyer.balance -= now;
    if (!liveFunds) buyer.transferBudget = Math.max(0, buyer.transferBudget - o.fee);
    buyer.finance.transfersOut += now;
    bookBlockEur(g, buyer, CMK.bought, now);
    if (seller) {
      seller.balance += now;
      seller.finance.transfersIn += now;
      bookBlockEur(g, seller, CMK.sold, now);
      if (!liveFunds) seller.transferBudget += Math.round(o.fee * (isHumanClub(seller.id) ? 0.5 : 0.6));
    }
    const exp = `${year(g.date) + Math.max(1, years)}-06-30`;
    const rel = isHumanClub(buyer.id) ? undefined : defaultRelease(p, buyer);
    p.contract = aiNewContract(p, buyer, () => ({ wage, expires: exp, ...(clauses ?? {}), ...(rel ? { release: rel } : {}) }));
    if (clauses?.signOn) { buyer.balance -= clauses.signOn; buyer.finance.signOn = (buyer.finance.signOn ?? 0) + clauses.signOn; bookBlockEur(g, buyer, CMK.signOn, clauses.signOn); }
    p.addOn = undefined;
    if (seller && o.sellOn && !cm) p.sellOn = { club: seller.id, pct: o.sellOn, base: o.fee };
    if (seller && o.addOn) p.addOn = { club: seller.id, payer: buyer.id, fee: o.addOn, left: ADDON_APPS };
  }
  // CM 01/02: "Media question purchase of [spiller]" (dyrt køb) og "Board surprised at [person] departure" (salg af en af de bedste)
  if (!o.loan && o.fee > 0) {
    if (o.fee >= p.value * 1.5 && o.fee >= 1_000_000 * econ()) asOwner(buyer.id, () => addNews({ cat: 'general', key: 'media.questionPurchase', params: { player: pname(p), club: buyer.name, fee: o.fee }, link: { kind: 'player', id: p.id } }));
    if (seller && keyPlayerRank(p) <= 3) asOwner(seller.id, () => addNews({ cat: 'board', key: 'board.surprisedDeparture', params: { player: pname(p), club: buyer.name, fee: o.fee }, link: { kind: 'player', id: p.id } }));
  }
  // skifte midt i sæsonen: bogfør tallene hos den gamle klub
  // Playing Career (0x7c5fe0): lejen 0x4d01e0 (staff, −1, 0, 1, …) – art 1; handlen 0x8c9720 @0x8c9fd1 (staff, beløb, bytte, 0, køberen,
  // Bosman = forkontrakten 0x8c9996) – med beløbet bogføres linjen også uden kampe
  if (p.club) pushCareerLine(p, p.club, !!p.loan && p.loan.from !== p.club, o.loan ? { kind: 1 }
    : { fee: o.fee, kind: seller && o.swap?.length ? 2 : !o.fee && (o.cmTime === 3 || o.cmTime === 4) ? 3 : undefined });
  // en udlejet, der sælges (computerens ønskelister – cmShortlistApply): lejekontrakten ophører med handlen
  if (!o.loan && p.loan) { noteLoanEnd(p.club); cmLeaveFrom(p, p.loan.from); p.loan = null; }
  // 0x8c9720 @0x8c9984: kontrakttilbud med sum 0 og tidsnibble 3/4 (forkontrakten – add_future_transfer 0x8cb9a0) → historikkens art 4
  // historikkens art 4 (0x8c9996): kontrakttilbud uden beløb med tidsnibble 3/4 (forkontrakten) – gennemført i dag eller på den aftalte dato
  recordMove(p, buyer.id, o.fee, o.loan, false, !o.loan && !o.fee && (o.cmTime === 3 || o.cmTime === 4));
  // fansene reagerer på stjernesalg og -køb
  if (!o.loan && seller) fansOnDeparture(p, seller, 'sold', o.fee);
  // 0x8c9720/0x8c9390: ønskelisternes del af skiftet (før staff +0x39 skifter) – pladsen med ham bliver hans, budmærkerne ryddes
  // (lejen: 0x8c2180's lejegren efter sign_loan_contract 0x4d01e0 – cmSlLoaned; den går uden om 0x8c9720)
  if (!o.loan) cmSlMoved(g, p, buyer.id, buyer.id, seller ? o.swap : undefined);
  setClub(p, buyer.id);
  if (o.loan) cmSlLoaned(g, p, buyer.id);
  cmSlPlayerGone(g, p, !o.loan);   // 0x8ca7a0 (køb: +0x52 ved den nye klub) / 0x8c2872 (leje) – 0x842b00(staff, 1): klubberne med ham på ønskelisten planlægger igen
  if (!o.loan) merchStarSigning(buyer.id, p.rep);
  fansOnSigning(p, buyer, o.loan);
  // byttehandel: køberens spillere skifter den anden vej
  if (!o.loan && seller && o.swap?.length) {
    for (const id of o.swap) {
      const x = g.players[id];
      if (!x || x.club !== buyer.id || x.loan) continue;
      if (x.stats.apps + x.stats.subs > 0) pushCareerLine(x, x.club, false);
      fansOnDeparture(x, buyer, 'sold', swapWorth(x.id, seller.id));
      recordMove(x, seller.id, swapWorth(x.id, seller.id), false, true);
      // CM 01/02: den kontrakt, mennesket aftalte med bytte-spilleren (cmSwapTalks – 0x8c38b0 underskriver den; Signing On Fee betales af sælgeren)
      const ag = o.cmSwapTalks?.[id]?.agreed;
      if (ag) {
        x.contract = { wage: ag.wage, expires: `${year(g.date) + Math.max(1, ag.years)}-06-30`, ...(ag.clauses ?? {}) };
        if (ag.clauses?.signOn) { seller.balance -= ag.clauses.signOn; seller.finance.signOn = (seller.finance.signOn ?? 0) + ag.clauses.signOn; bookBlockEur(g, seller, CMK.signOn, ag.clauses.signOn); }
      } else x.contract = aiNewContract(x, seller, () => ({ wage: wageDemand(x, seller), expires: `${year(g.date) + preferredYears(x)}-06-30` }));
      x.sellOn = undefined; x.addOn = undefined; x.listed = false; x.listPrice = undefined; x.squadStatus = ag ? o.cmSwapTalks?.[id]?.role : undefined; x.loanListed = undefined; x.renewal = undefined; x.complaint = undefined;
      if (x.squadStatus) setStatusCode(x);
      cmSlMoved(g, x, seller.id, 0);   // (0x8c9579: kun 0x8c9720 – halens 0x84aeb0 for byttespillerne står i hovedspillerens kald)
      setClub(x, seller.id);
      movePlacement(g, x);   // 0x8ca7d9–0x8ca81f (byttespillerens eget 0x8c9720)
      cmSlPlayerGone(g, x);
      x.joined = g.date;
      asOwner(buyer.id, () => {
        if (g.tactic) g.tactic = { ...g.tactic, lineup: g.tactic.lineup.map((pid2) => (pid2 === x.id ? 0 : pid2)), bench: g.tactic.bench.filter((pid2) => pid2 !== x.id) };
      });
      asOwner(seller.id, () => { knowFull(x.id); });
      forEachHuman(() => { if (buyer.id === g.userClub || seller.id === g.userClub) addNews({ cat: 'transfer', key: 'transfer.swapPart', params: { player: pname(x), from: buyer.name, to: seller.name }, link: { kind: 'player', id: x.id } }); });
    }
    if (buyer.tactic) buyer.tactic = null;
  }
  rankCacheDate = '';
  // CM 01/02: en leje laver kun en lejekontrakt (sign_loan_contract 0x4d01e0) – hovedkontraktens +0x4e (transfer-/lejelisten) bliver stående,
  // så "Loa" står på spilleren under lejen (0x4849f0 → 0x544590; ejerens billeder 18/11)
  if (!o.loan || !cmMarketOn(g)) { p.listed = false; p.listPrice = undefined; p.loanListed = undefined; }
  // Set Role At Club: han får den valgte status. En leje med originalens marked rører ikke hovedkontraktens trupstatus +0x4f (sign_loan_contract
  // 0x4d01e0 – state.ts setClub beholder Player.cmContract)
  if (!o.loan || !cmMarketOn(g)) {
    // sign_contract 0x4cf720 (ny klub, 0x4cfac9/0x4cfc7a): kontraktens +0x4f er tilbuddets – computerens tilbud (0x4cda70 → 0x85fc50: status fra
    // 0x849f00) står i o.cmK; menneskets i o.cmRole (Set Role At Club). Før fik computerens køb trupstatus 0 (oraklet 31/12-01: 5 engelske, vi ~200)
    p.squadStatus = !o.loan ? o.cmRole ?? offerStatus(o) : undefined;
    if (p.squadStatus) setStatusCode(p);
  }
  if (!o.loan) movePlacement(g, p);   // 0x8ca7d9–0x8ca81f: staff +0x5e efter skiftet (den nye kontrakts trupstatus)
  p.wantsAway = false;
  p.promiseUntil = undefined;
  p.renewal = undefined;
  p.complaint = undefined;
  // CM 01/02: lejen (sign_loan_contract 0x4d01e0) og dens slut (end_loan 0x4d07e0) rører ikke staff +0x3e/+0x40 – datoen, han kom til
  // moderklubben (oraklets billeder 25/8- og 3/11-01: udlejede og hjemvendte har moderklubbens dato). Med lejedatoen dér var en udlejet
  // "nyankommen" i viljen 0x846920 (0x84862e: under (loyalitet + 8) · 15 dage i klubben → 0), så tredje klubber købte ham aldrig midt i lejen.
  if (!o.loan || !cmMarketOn(g)) p.joined = g.date;
  p.morale = Math.min(20, p.morale + 2);
  p.form = [];
  o.status = 'completed';
  asOwner(buyer.id, () => { knowFull(p.id); recordDevelopment(p); });
  // fjern fra AI-taktik
  if (seller?.tactic) seller.tactic = null;
  if (seller) asOwner(seller.id, () => {
    if (g.tactic) g.tactic = { ...g.tactic, lineup: g.tactic.lineup.map((id) => (id === p.id ? 0 : id)), bench: g.tactic.bench.filter((id) => id !== p.id) };
  });
  const news = {
    cat: 'transfer' as const,
    key: o.loan ? 'transfer.loanDone' : o.seller ? 'transfer.done' : 'transfer.freeDone',
    params: { player: pname(p), from: sellerName(o.seller), to: buyer.name, fee: o.fee },
    link: { kind: 'player' as const, id: p.id },
  };
  forEachHuman(() => {
    const involved = buyer.id === g.userClub || seller?.id === g.userClub;
    // ægte tilstand: også egne handler får originalens overskrift og brødtekst (0x8dbef0: "X seal Y deal" + "X have signed Z's Y for a fee of …")
    if (involved && origLogic() && !o.loan) addNews({ cat: 'transfer', key: `transfer.o${o.seller ? '' : 'Free'}.${p.id % 4}`, params: { to: buyer.short, from: seller?.short ?? '', player: pname(p), last: p.last, fee: o.fee, ...(o.addOn ? { fee2: o.fee + o.addOn } : {}) }, link: news.link });
    else if (involved) addNews(news);
    // andre klubbers handler samles i ugens transferoverblik
    else if (origLogic()) originalTransferNews(p, buyer, seller, o.fee, o.loan, o.addOn, o);
    else if (otherTransferNews(buyer, seller, o.fee, o.loan)) (g.transferDigest ??= []).push({ player: p.id, from: o.seller, to: buyer.id, fee: o.fee, ...(o.loan ? { loan: true } : {}) });
  });
  // Funds = 0x598800 på den nye saldo/sæsonblok (originalen gemmer intet budget – før: −summen hos køberen, +50/60 % hos sælgeren til den 1.)
  cmFundsAfterDeal(g, [buyer.id, seller?.id]);
  // originalens bud følger spilleren (sælgeren = kontraktklubben): de andre bud på ham er nu bud til den nye klub (offerLive.ts)
  offersFollowPlayer(g, o, isHumanClub);
  return true;
}

export function toggleListed(pid: number) {
  const p = gs().players[pid];
  if (p) { p.listed = !p.listed; if (!p.listed) p.listPrice = undefined; else listedNews(p); }
}

/** CM 01/02: "[manager] puts [spiller] on transfer list" / "[manager] grants [spiller] transfer request" */
function listedNews(p: Player) {
  const g = gs();
  if (!isHumanClub(p.club)) return;
  asOwner(p.club, () => addNews({ cat: 'transfer', key: p.wantsAway ? 'transfer.requestGranted' : 'transfer.listedByYou', params: { player: pname(p), manager: g.manager.name, fee: p.listPrice ?? askingPrice(p) }, link: { kind: 'player', id: p.id } }));
}

/** Sæt spilleren til salg med en udbudspris (null = fjern fra salgslisten) */
export function setListPrice(pid: number, price: number | null) {
  const p = gs().players[pid];
  if (!p) return;
  if (price === null) { p.listed = false; p.listPrice = undefined; return; }
  const was = p.listed;
  p.listed = true;
  p.listPrice = roundValue(Math.max(10_000 * econ(), price));
  if (!was) listedNews(p);
}

/** Kompensationen ved fritstilling: halvdelen af den resterende løn */
export function releaseCost(p: Player): number {
  if (!p.contract) return 0;
  const weeks = Math.max(0, Math.round((new Date(p.contract.expires).getTime() - new Date(gs().date).getTime()) / (7 * 86400000)));
  return Math.round(weeks * p.contract.wage * 0.5);
}

/** Bestyrelsen blokerer fritstilling af en af truppens mest værdifulde spillere (som i CM 01/02) */
export function releaseBlocked(p: Player): boolean {
  if (!p.club || p.value < 500_000 * econ()) return false;
  const vals = squad(p.club).map((x) => x.value).sort((a, b) => b - a);
  return p.value >= (vals[4] ?? 0);
}

export function releasePlayer(pid: number): 'ok' | 'blocked' | 'error' {
  const g = gs();
  const p = g.players[pid];
  if (!p || p.club !== g.userClub) return 'error';
  const club = g.clubs[p.club];
  if (releaseBlocked(p)) {
    addNews({ cat: 'board', key: 'transfer.releaseBlocked', params: { player: pname(p), club: club.name }, link: { kind: 'player', id: p.id } });
    return 'blocked';
  }
  const pay = releaseCost(p);
  club.balance -= pay;
  club.finance.other += pay;
  fansOnDeparture(p, club, 'released');
  setClub(p, 0);
  p.contract = null;
  p.listed = false;
  if (g.tactic) g.tactic = { ...g.tactic, lineup: g.tactic.lineup.map((id) => (id === pid ? 0 : id)), bench: g.tactic.bench.filter((id) => id !== pid) };
  addNews({ cat: 'contract', key: 'transfer.released', params: { player: pname(p) } });
  return 'ok';
}

/** Lønkrav ved forlængelse: en spiller, der har tøvet, vil have mere */
export function renewalDemand(p: Player, club: Club): number {
  const r = p.renewal;
  const f = r ? (r.wageFactor ?? (r.stance === 'hesitant' ? 1.15 : 1)) : 1;
  return Math.round(wageDemand(p, club) * f / 50) * 50;
}

/** Kravet, mennesket ser ved en forlængelse: en CM-database i ægte tilstand (cmLogic) → originalens 0x85fc50 for egen klub med hans trupstatus
 *  (Set Role At Club – samme krav, som 0x4ce4e0 sammenligner tilbuddet med, cmTalkDemand); ellers spillets eget (renewalDemand) */
export function humanRenewDemand(p: Player, club: Club): { wage: number; years: number; signOn: number } {
  const g = gs();
  const w = cmLogic(g) ? cmTalkDemand(g, p, club.id, p.squadStatus) : null;
  if (w) return { wage: w.wage, years: Math.max(1, year(w.expires) - year(g.date)), signOn: w.signOn };
  const wage = renewalDemand(p, club);
  return { wage, years: preferredYears(p), signOn: signOnDemand(p, wage, false) };
}

/** Forlæng kontrakt for egen spiller – brugeren tilbyder løn/år */
/**
 * Udløbsdato for en forlængelse på `years` år. I sommerpausen (juli-august) tæller den sæson, der starter; senere
 * på sæsonen regnes årene fra næste sæson (en forlængelse på 1 år den 25/12-2026 løber til 30/6-2028, ikke 2027).
 * En forlængelse giver aldrig en kortere kontrakt end den nuværende.
 */
export function renewalExpiry(current: string | undefined, years: number, date: string): string {
  const m = month(date);
  const seasonEnd = year(date) + (m >= 7 ? 1 : 0);
  const end = `${seasonEnd + years - (m === 7 || m === 8 ? 1 : 0)}-06-30`;
  return current && current > end ? current : end;
}

export function renewContract(pid: number, wage: number, years: number, clauses?: ContractClauses): 'accepted' | 'counter' | 'refused' | 'budget' {
  const g = gs();
  const p = g.players[pid];
  const club = g.clubs[g.userClub];
  if (!p || !club || p.club !== club.id) return 'refused';
  if ((p.unhappy ?? 0) > 70 && p.attrs[43] < 10) return 'refused';
  // en spiller, der har sagt fra, forhandler ikke, før han er overtalt – og en tøvende vil have mere
  const r = p.renewal;
  if (r && !r.convinced && r.stance === 'refuses') return 'refused';
  const base = renewalDemand(p, club);
  // ældre spillere vil også have en underskriftsbonus – uden den skal lønnen være højere
  const demand = base + signOnDemand(p, base, false) / (52 * Math.max(1, years));
  if (overBoardWage(p, club.id, wage, currentBill(club.id) - (p.contract?.wage ?? 0) + wage > club.wageBudget)) return 'budget';
  const cl = cleanClauses(clauses);
  // CM 01/02 (en CM-database i ægte tilstand): tilbuddet til egen spiller afgøres som alle kontrakttilbud i resolve_contract_offers 0x4ce4e0 –
  // værdien 0x866830 af tilbuddet (løn, signing-on fordelt over kontraktens dage, bonusser, klausuler) mod hans krav 0x85fc50 for klubben med
  // trupstatussen fra Set Role At Club, vægtet med viljen 0x846920 (cmContractAnswer). Før: spillets eget skøn (agentens accept-faktor)
  const cmAns = cmLogic(g) ? cmContractAnswer(g, p, club.id, { ...offerTerms(g, wage, years, cl, club.id), expires: renewalExpiry(p.contract?.expires, years, g.date) }, p.squadStatus) : null;
  if (cmAns ? cmAns.accept : wage + clausesWorthFor(p, club.id, wage, years, cl) >= demand * AGENT_RULES[agentOf(p).style].accept) {
    p.contract = { wage, expires: renewalExpiry(p.contract?.expires, years, g.date), ...cl };
    // CM 01/02 0x8c38b0 → Finance::add_signing_on 0x5998e0 (blokken; kun originalens økonomi – bookBlock tjekker cmFinOn)
    if (cl.signOn) { club.balance -= cl.signOn; club.finance.signOn = (club.finance.signOn ?? 0) + cl.signOn; bookBlockEur(g, club, CMK.signOn, cl.signOn); }
    const hadDemand = !!p.demand;
    // original DB i ægte tilstand: sign_contract 0x4cf720's +20 (cmMedia.ts) i stedet for spillets +2/+4
    if (cmMediaOn(g)) cmSignContractMorale(g, p); else p.morale = Math.min(20, p.morale + (p.demand ? 4 : 2));
    p.demand = undefined;
    p.renewal = undefined;
    // en tilfreds spiller takker for den nye kontrakt
    if (hadDemand || wage >= demand * 1.1) playerPraises(p, 'contract');
    addNews({ cat: 'contract', key: 'contract.renewed', params: { player: pname(p), years } });
    fansOnRenewal(p, club);
    return 'accepted';
  }
  return 'counter';
}

/** Bosman: må forhandle frit når kontrakten udløber inden for 6 måneder (fra 1. januar) */
export function canPreContract(p: Player): boolean {
  const g = gs();
  if (!p.contract || p.club === g.userClub || !p.club) return false;
  if (p.contract.futureClub) return false;
  const m = month(g.date);
  const seasonEnd = `${year(g.date) + (m >= 7 ? 1 : 0)}-06-30`;
  return p.contract.expires <= seasonEnd && m >= 1 && m <= 6;
}

/** Hvorfor man (endnu) ikke kan tilbyde en Bosman-kontrakt – til forklaring i UI'et */
export function preContractBlock(p: Player): 'ok' | 'notExpiring' | 'fromJanuary' | 'taken' | null {
  const g = gs();
  if (!p.contract || !p.club || p.club === g.userClub) return null;
  if (canPreContract(p)) return 'ok';
  const m = month(g.date);
  const seasonEnd = `${year(g.date) + (m >= 7 ? 1 : 0)}-06-30`;
  if (p.contract.expires > seasonEnd) return 'notExpiring';
  if (p.contract.futureClub) return 'taken';
  return 'fromJanuary';
}

/** CM 01/02: handlen, når spilleren har sagt ja (computerens køber) eller mennesket har bekræftet (Confirm Transfer Offer → 0x8c3310): forkontrakten
 *  (et fremtidigt skifte), den klubløse med en dato efter i dag (add_future_transfer) eller handlen nu */
export function cmCompleteAgreed(o: TransferOffer, wage: number, years: number, clauses?: ContractClauses): void {
  if (o.preContract) completePreContract(o, wage, years, clauses ?? {});
  else if (!cmHumanFreeFuture(o, wage, years, clauses)) completeTransfer(o, wage, years, clauses);
}

export function startPreContract(pid: number): TransferOffer | string {
  const g = gs();
  const p = g.players[pid];
  if (!p || !canPreContract(p)) return 'error';
  const o: TransferOffer = { id: g.nextId.offer++, player: pid, buyer: g.userClub, seller: p.club, fee: 0, loan: false, status: 'negotiating', created: g.date, respondBy: addDays(g.date, 7), preContract: true };
  // CM 01/02 (ægte tilstand): Set Role At Club → Offer Contract → svaret som nyhed efter 1–5 dage (cmTransferTalks.ts), ingen frist
  if (cmLogic(g)) { o.cmTalks = { rounds: 0, state: 0 }; o.respondBy = addDays(g.date, 3650); }
  g.offers.push(o);
  return o;
}

// ---------- daglig behandling ----------

export function processOffers() {
  const g = gs();
  const skip = (o: TransferOffer) => !!o.signing || !!o.cmTalks || !!o.cmAi || !!o.cmSwapTalks || !!o.cmLoanH;
  // CM 01/02: forhandlingerne efter et accepteret bud (svarene, fristerne)
  for (const o of g.offers.slice()) if (o.cmTalks) cmTalksDaily(o, cmCompleteAgreed);
  cmHumanFreeDue();
  // CM 01/02: menneskets forhandlinger med bytte-spillerne i et accepteret computerbud (0x8c63a0 tilstand 8)
  for (const o of g.offers.slice()) if (o.cmSwapTalks) cmSwapDaily(o, (x) => { const p = g.players[x.player], b = g.clubs[x.buyer]; if (p && b) completeTransfer(x, wageDemand(p, b), preferredYears(p)); }, cmReviewKeep, (x) => x.value);
  // ældre saves: flere åbne bud fra samme AI-klub på samme spiller → behold kun det højeste
  const best = new Map<string, TransferOffer>();
  for (const o of g.offers) {
    if (o.status !== 'pending' || isHumanClub(o.buyer) || !isHumanClub(o.seller)) continue;
    const k = `${o.buyer}|${o.player}|${o.loan ? 1 : 0}`;
    const cur = best.get(k);
    if (!cur) best.set(k, o);
    else if (o.fee > cur.fee) { cur.status = 'withdrawn'; best.set(k, o); } else o.status = 'withdrawn';
  }
  for (const o of g.offers) {
    if (skip(o)) continue;
    if (o.status === 'pending' && o.buyer === g.userClub && isHumanClub(o.seller) && g.date > o.respondBy) {
      o.status = 'withdrawn'; // den anden manager svarede ikke
    } else if (o.cmLoan && o.status === 'pending') {
      // ønskelisterne kører: dagens hukommelse svarer (cmAiAiDue); ellers en hukommelse til lejligheden
      if (!cmShortlistOn(g)) cmHumanLoanDue(o, null);
    } else if (o.status === 'pending' && o.buyer === g.userClub && !isHumanClub(o.seller) && g.date >= o.respondBy) {
      aiAnswerBid(o);
    } else if (o.status === 'countered' && o.cmCounter && cmMarketOn(g) && isHumanClub(o.seller) && !isHumanClub(o.buyer) && g.date >= o.respondBy) {
      cmReviewHumanCounter(o);
    } else if ((o.status === 'negotiating' || o.status === 'countered') && g.date > o.respondBy) {
      o.status = 'collapsed';
      // budkrigen tabt: rivalen køber spilleren
      const p = g.players[o.player];
      const rival = o.rival ? g.clubs[o.rival.club] : undefined;
      if (p && rival && o.buyer === g.userClub && p.club === o.seller && !isHumanClub(p.club) && rival.transferBudget >= o.rival!.fee) {
        const ro: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: rival.id, seller: p.club, fee: o.rival!.fee, loan: false, status: 'negotiating', created: g.date, respondBy: g.date };
        completeTransfer(ro, wageDemand(p, rival), preferredYears(p));
        addNews({ cat: 'transfer', key: 'transfer.lostBiddingWar', params: { player: pname(p), club: rival.name, fee: ro.fee }, link: { kind: 'player', id: p.id } });
      }
    } else if (o.status === 'pending' && o.seller === g.userClub && g.date > o.respondBy) {
      o.status = 'withdrawn';
    }
  }
  // ryd gamle tilbud – men ikke de aftalte fremtidige skifter (add_future_transfer 0x8cb9a0, tilstand 0x13: de lever til datoen, 0x8cbbe0). Før
  // røg forkontrakterne, der var aftalt mere end 60 dage før, når listen havde over 120 bud (oraklet: 147 forkontrakter venter 20/4-02, vi 9)
  if (g.offers.length > 120) g.offers = g.offers.filter((o) => ['pending', 'negotiating', 'countered'].includes(o.status) || cmFutOpen(o) || o.created > addDays(g.date, -60));
}


/** En AI-klub svarer på brugerens bud: accept, modbud eller nej (bruges dagligt og med det samme i budvinduet) */
function aiAnswerBid(o: TransferOffer) {
  const g = gs();
  const p = g.players[o.player];
  const buyer = g.clubs[o.buyer];
  if (!p || p.club !== o.seller) { o.status = 'withdrawn'; return; }
  if (o.loan) {
    const rank = keyPlayerRank(p);
    const age = ageOn(p.dob, g.date);
    // (CM 01/02 med originalens marked: cmHumanLoanDue – her kun spillets egen regel)
    if (rank > 13 && (age <= 24 || rank > 18)) {
      o.status = 'negotiating';
      addNews({ cat: 'transfer', key: 'transfer.loanAccepted', params: { player: pname(p), club: sellerName(o.seller) }, link: { kind: 'offer', id: o.id } });
      completeTransfer(o, p.contract?.wage ?? 0, 0);
    } else {
      o.status = 'rejected';
      addNews({ cat: 'transfer', key: 'transfer.loanRejected', params: { player: pname(p), club: sellerName(o.seller) } });
    }
    return;
  }
  // frikøbsklausulen er betalt: sælgeren kan ikke sige nej
  if (p.contract?.release && o.fee >= p.contract.release) {
    // CM 01/02: selling_club_must_accept 0x8cd240 → accept_transfer_bid 0x8c0080
    if (cmTalksOn(g, o)) { cmAcceptBid(o, p); return; }
    o.status = 'negotiating';
    o.respondBy = addDays(g.date, 10);
    addNews({ cat: 'transfer', key: 'transfer.releaseMet', params: { player: pname(p), club: sellerName(o.seller), fee: o.fee }, link: { kind: 'offer', id: o.id } });
    return;
  }
  if (cmMarketOn(g)) { cmAiAnswer(o, p, buyer); return; }
  const worth = bidClauseWorth(p, o.fee, o.sellOn, o.addOn) + offerSwapWorth(o);
  let d = sellerDecision(p, o.fee + worth, buyer);
  if (d.answer === 'counter' && d.counter) d.counter = roundValue(Math.max(o.fee, d.counter - worth));
  o.rival = rivalBid(o, p);
  if (o.rival && d.answer !== 'notforsale' && o.fee + worth < o.rival.fee) {
    d = { answer: 'counter', counter: roundValue(o.rival.fee * 1.05) };
    addNews({ cat: 'transfer', key: 'transfer.biddingWar', params: { player: pname(p), club: sellerName(o.rival.club), fee: o.rival.fee }, link: { kind: 'offer', id: o.id } });
  }
  if (d.answer === 'accept') {
    // 2026/27 i ægte tilstand (cmLogic): sælgerens svar er spillets eget, forløbet bagefter originalens (accept_transfer_bid 0x8c0080 → Offer Contract)
    if (cmTalksOn(g, o)) { cmAcceptBid(o, p); return; }
    o.status = 'negotiating';
    o.respondBy = addDays(g.date, 10);
    addNews({ cat: 'transfer', key: 'transfer.bidAccepted', params: { player: pname(p), club: sellerName(o.seller), fee: o.fee }, link: { kind: 'offer', id: o.id } });
  } else if (d.answer === 'counter') {
    o.status = 'countered';
    o.counter = d.counter;
    addNews({ cat: 'transfer', key: 'transfer.bidCountered', params: { player: pname(p), club: sellerName(o.seller), fee: d.counter ?? 0 }, link: { kind: 'offer', id: o.id } });
  } else {
    o.status = 'rejected';
    if (d.answer === 'notforsale') o.nfs = true;
    addNews({ cat: 'transfer', key: d.answer === 'notforsale' ? 'transfer.notForSale' : 'transfer.bidRejected', params: { player: pname(p), club: sellerName(o.seller) }, link: { kind: 'player', id: p.id } });
    // spilleren ville måske gerne – han kan kontakte køberen og bede om at blive sat til salg
    targetReaction(p, buyer.id);
  }
}

/** CM 01/02: computerens klub svarer på menneskets bud (TRANSFER_MANAGER::ai_respond_to_bid 0x8c8090, cmTransferBid.ts) */
function cmAiAnswer(o: TransferOffer, p: Player, buyer: Club) {
  const g = gs();
  // (MODERN_PARITY 3) buddets beløb med køberens €→£-faktor, værdien/saldoen sælgerens (cmMoney.ts; den originale database 0,86)
  const c = valueCtx(g, p, buyer.id);
  // asking price 0x4d1600 er ikke porteret: spillets askingPrice (med 'ikke til salg'-tillægget som ved en forespørgsel), *estimeret*
  // 0x8c8291: 0x4d1600 med grunden som ud-parameter (0x100 nyligt købt, 0x200/0x400 trupstatus, 0x800 rival, 0x1000 samme division, 0x2000 lovende)
  const why = { reason: 0 };
  const asking = cmAskingPrice(g, p, buyer.id, why) ?? toK(askingPrice(p) * Math.max(1, notForSaleMult(p, buyer)), p.club);
  const rivals = g.offers.filter((x) => x !== o && x.player === p.id && x.status === 'pending' && !x.loan).map(termsOf);
  const t = termsOf(o);
  const wanted = swapCandidates(o.seller, p.id, o.buyer).map((x) => x.id);
  const unwanted = t.swap.some((id) => !wanted.includes(id));
  const base = newTerms(g, p, buyer.id, 0);
  const r = aiRespond(t, c, { asking, rivals, unwanted, final: !!o.final, base, clause: clauseOptIn(g, p, buyer.id), reason: why.reason });
  if (r.kind === 'accept') {
    // 0x8c0080: "<Player> transfer offer accepted" og "Offer contract to <Player>" (cmTransferTalks.ts)
    cmAcceptBid(o, p);
  } else if (r.kind === 'counter') {
    o.status = 'countered';
    o.counter = Math.max(0, r.terms.fee);
    o.cmCounter = r.terms;
    const clause = r.terms.lgFee > 0 || r.terms.intFee > 0 || r.terms.sellOn > 0;
    addNews({ cat: 'transfer', key: clause ? 'transfer.bidCounteredClause' : 'transfer.bidCountered',
      params: { player: pname(p), club: sellerName(o.seller), fee: o.counter, fee2: Math.max(0, r.terms.lgFee) + Math.max(0, r.terms.intFee), pct: Math.max(0, r.terms.sellOn) }, link: { kind: 'offer', id: o.id } });
  } else {
    o.status = 'rejected';
    // reject_transfer_offer 0x8bf680 → nyheden 0xfa1 (0x8d5170, teksten 0x8d5420): beløbet = get_total_value(0,0,0,1) 0x8d537f (med
    // bytte-spillerne), grunden (param 8), bytte (param 6) og sælgerens division (param 11, "another Serie B club")
    const sel = g.clubs[o.seller];
    const fee = Math.max(0, Math.round(totalValue(t, c, false, false, true) / (c.k ?? GBP)));
    const kind = (t.swap.length ? 'px' : '') + (r.reason === 10 ? 'Dis' : r.reason ? 'Why' : '') + (fee ? 'Fee' : '');
    addNews({ cat: 'transfer', key: 'transfer.cmBidRej', params: { player: pname(p), club: sellerName(o.seller), buyer: buyer.name, fee, why: r.reason, body: kind,
      comp: sel ? g.comps[sel.league]?.name ?? g.leagues[sel.league]?.name ?? '' : '' }, link: { kind: 'player', id: p.id } });
  }
}

/** CM 01/02 på ferie – NewsItem::auto_respond 0x784100 for buddet på en af menneskets spillere (0xfa0, svaret kommer med nyheden):
 *  lejebud (+0x1f = 1) → sælgerens svar 0x84af00 (0 = ja → 0x8c0660, ellers reject_loan_offer 0x8bfa30); købsbud → ai_respond_to_bid 0x8c8090
 *  for menneskets klub: ferievalg 0 ≠ 0 og et bytte (+4) → afvist 0x8bf680 (0x8c822a); valg 0 = 1 "Reject all offers" → afvist (0x8c825d);
 *  ellers computerens egen vurdering mod udbudsprisen 0x4d1600 – på ferie med valg 0 ≠ 0 er den spillerens værdi +0x52 (0x4d16ce, læst i
 *  hukommelsens HUMAN_MANAGER – cmHoliday.ts). Kun den originale database i ægte tilstand (cmMarketOn). */
export function cmHolidayAnswerBids(): void {
  const g = gs();
  if (!cmMarketOn(g) || !onHoliday(g)) return;
  const opt0 = holidayOpt(g.manager.holiday, 0);
  const reject = (x: TransferOffer) => { x.status = 'rejected'; if (!x.loan && !cmShortlistOn(g)) startPursuit(x); };
  for (const o of g.offers.slice()) {
    if (o.status !== 'pending' || o.seller !== g.userClub || o.signing || o.cmTalks || o.cmAi || isHumanClub(o.buyer)) continue;
    const p = g.players[o.player], buyer = g.clubs[o.buyer];
    if (!p || !buyer || p.club !== o.seller) continue;
    if (o.loan) {
      if (cmLoanAnswerNow(g, p.id, buyer.id, o.seller) === 0) respondToOffer(o.id, 'accept'); else reject(o);
      continue;
    }
    const t = termsOf(o);
    if (opt0 === 1 || (opt0 !== 0 && t.swap.length > 0)) { reject(o); continue; }
    const c = valueCtx(g, p, buyer.id);
    const asking = cmAskingPrice(g, p, buyer.id) ?? toK(askingPrice(p), p.club);
    const rivals = g.offers.filter((x) => x !== o && x.player === p.id && x.status === 'pending' && !x.loan).map(termsOf);
    const r = aiRespond(t, c, { asking, rivals, unwanted: false, final: !!o.final, base: newTerms(g, p, buyer.id, 0), clause: clauseOptIn(g, p, buyer.id) });
    if (r.kind === 'accept') respondToOffer(o.id, 'accept');
    else if (r.kind === 'counter') respondToOffer(o.id, 'counter', r.terms.fee, undefined, undefined, { terms: r.terms });
    else reject(o);
  }
}

/** CM 01/02 0x8ca8a0: første rate (fee / måneder) betales nu, resten hver måned (0x8caee0); klausulerne gemmes på spilleren. Returnerer det, der betales nu. */
function cmBookClauses(o: TransferOffer, p: Player, buyer: Club, seller: Club) {
  const g = gs();
  const first = o.months && o.months > 0 ? fromK(Math.trunc(toK(o.fee, buyer.id) / o.months), buyer.id) : o.fee;
  if (o.months && o.months > 1) (g.cmInstalments ??= []).push({ amount: first, buyer: buyer.id, seller: seller.id, left: o.months - 1, player: p.id });
  // 0x8c91e0: den gamle klubs klausuler på spilleren er afregnet/bortfalder
  p.cmApps = undefined;
  if (o.sellOn) p.sellOn = { club: seller.id, pct: o.sellOn, base: 0 };
  if (o.lgFee) (p.cmApps ??= []).push({ kind: 'lg', club: seller.id, payer: buyer.id, fee: o.lgFee, left: o.lgApps ?? 10 });
  if (o.intFee) (p.cmApps ??= []).push({ kind: 'int', club: seller.id, payer: buyer.id, fee: o.intFee, left: o.intApps ?? 10 });
  return first;
}

function payClub(from: Club | undefined, to: Club | undefined, amount: number) {
  if (amount <= 0) return;
  if (from) { from.balance -= amount; from.finance.transfersOut += amount; bookBlockEur(gs(), from, CMK.bought, amount); }
  if (to) { to.balance += amount; to.finance.transfersIn += amount; bookBlockEur(gs(), to, CMK.sold, amount); }
}

/** 0x8caee0 (hver måned): de resterende rater betales */
export function cmMonthlyInstalments() {
  const g = gs();
  if (!g.cmInstalments?.length) return;
  for (const r of g.cmInstalments) { payClub(g.clubs[r.buyer], g.clubs[r.seller], r.amount); r.left--; }
  g.cmInstalments = g.cmInstalments.filter((r) => r.left > 0);
}

/** 0x8c39f0/0x8cb340: efter en konkurrencekamp (klub) eller landskamp tælles klausulerne ned; ved 0 betales beløbet med en nyhed */
export function cmAppsAfterMatch(p: Player, kind: 'lg' | 'int') {
  const g = gs();
  if (!p.cmApps?.length || (kind === 'lg' && p.loan)) return;
  for (const a of p.cmApps) {
    if (a.kind !== kind) continue;
    a.left--;
    if (a.left > 0) continue;
    const payer = g.clubs[a.payer], to = g.clubs[a.club];
    payClub(payer, to, a.fee);
    const key = kind === 'lg' ? 'clause.lgAppsPaid' : 'clause.intAppsPaid';
    for (const c of [payer, to]) if (c && isHumanClub(c.id)) asOwner(c.id, () => addNews({ cat: 'finance', key, params: { player: pname(p), from: payer?.name ?? '', to: to?.name ?? '', fee: a.fee }, link: { kind: 'player', id: p.id } }));
  }
  p.cmApps = p.cmApps.filter((a) => a.left > 0);
  if (!p.cmApps.length) p.cmApps = undefined;
}

/** Brugeren accepterer et modbud */
export function acceptCounter(id: number) {
  const g = gs();
  const o = g.offers.find((x) => x.id === id);
  if (!o || o.status !== 'countered' || !o.counter) return 'error';
  if (!offerLive(g, o)) { o.status = 'collapsed'; return 'error'; }   // spilleren er skiftet (offerLive.ts)
  const buyer = g.clubs[o.buyer];
  if (o.counter > buyer.transferBudget && !cmMarketOn(g)) return 'transfer.overBudget';   // CM 01/02: først ved Confirm Transfer Offer (0x8cfc90)
  if (o.cmCounter && cmMarketOn(g)) { putTerms(o, o.cmCounter); o.cmCounter = undefined; }
  o.fee = o.counter;
  // CM 01/02: modbuddet accepteret → 0x8c0080 (de to nyheder og Offer Contract)
  const pp = g.players[o.player];
  if (pp && cmTalksOn(g, o)) { cmAcceptBid(o, pp); return 'ok'; }
  o.status = 'negotiating';
  o.respondBy = addDays(g.date, 10);
  return 'ok';
}

// ---------- AI-markedet ----------

const REQUIRED: Record<Role, number> = { GK: 2, CB: 4, FB: 3, DM: 2, CM: 3, WM: 1, W: 2, AM: 1, ST: 3 };
const GROUP: Record<Role, Role> = { GK: 'GK', CB: 'CB', FB: 'FB', DM: 'DM', CM: 'CM', WM: 'W', W: 'W', AM: 'AM', ST: 'ST' };
/** Målmænd har systematisk lavere CA end markspillere på samme niveau (lavere markedsværdier) */
const GK_OFFSET = 8;
const roleOffset = (r: Role) => (r === 'GK' ? GK_OFFSET : 0);

/** Spillerens plads i klubbens rangorden på hans position (0 = bedste) */
function depthRank(p: Player): number {
  const grp = GROUP[naturalRole(p)];
  return squad(p.club).filter((x) => x.id !== p.id && !x.loan && GROUP[naturalRole(x)] === grp && x.ca > p.ca).length;
}

export function analyzeNeeds(clubId: number): { role: Role; score: number }[] {
  const sq = squad(clubId);
  const level = clubLevel(clubId);
  const groups = new Map<Role, Player[]>();
  for (const p of sq) {
    const r = GROUP[naturalRole(p)];
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r)!.push(p);
  }
  const out: { role: Role; score: number }[] = [];
  const reqByGroup: Partial<Record<Role, number>> = {};
  for (const [r, n] of Object.entries(REQUIRED) as [Role, number][]) reqByGroup[GROUP[r]] = (reqByGroup[GROUP[r]] ?? 0) + n;
  for (const [r, n] of Object.entries(reqByGroup) as [Role, number][]) {
    const list = (groups.get(r) ?? []).sort((a, b) => b.ca - a.ca);
    let score = Math.max(0, n - list.length) * 2;
    const best = list[0]?.ca ?? 0;
    const lv = level - roleOffset(r);
    if (best < lv - 10) score += 1.5;
    if (list.length >= 2 && list[1].ca < lv - 18) score += 0.6;
    if (score > 0) out.push({ role: r, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

let roleIndex: Map<Role, number[]> | null = null;
let roleIndexDate = '';
// (19/11) indekset bygges hver 14. dag – det følger med spillet (carry.ts) og nulstilles ved et nyt spil (lækkede fra spillet før)
registerCarry('transfers.roleIndex', () => (roleIndex ? { d: roleIndexDate, m: [...roleIndex] } : NO_CARRY),
  (v: { d: string; m: [Role, number[]][] }) => { roleIndexDate = v.d; roleIndex = new Map(v.m); }, () => { roleIndex = null; roleIndexDate = ''; });

function buildRoleIndex() {
  const g = gs();
  roleIndex = new Map();
  for (const p of Object.values(g.players)) {
    const r = GROUP[naturalRole(p)];
    if (!roleIndex.has(r)) roleIndex.set(r, []);
    roleIndex.get(r)!.push(p.id);
  }
  for (const arr of roleIndex.values()) arr.sort((a, b) => g.players[a].ca - g.players[b].ca);
  roleIndexDate = g.date;
}

/** Niveauet en AI-klub sigter efter: mindst lidt under ligaens nedre kvartil, så nyoprykkere og
 *  svage hold forstærker sig og ligaerne ikke polariseres (ellers 11-pointshold og 150-målsmestre) */
function leagueFloor(club: Club): number {
  const g = gs();
  const peers = g.comps[club.league]?.clubs ?? [];
  if (peers.length < 6) return 0;
  const lv = peers.map((c) => clubLevel(c)).sort((a, b) => a - b);
  return lv[Math.floor(lv.length * 0.25)] - 4;
}

function targetLevel(club: Club): number {
  return Math.max(clubLevel(club.id), leagueFloor(club));
}

/** Klubbens bedste mål til en rolle, sorteret (bruges til køb og til klubbens shortliste) */
export function rankTargets(club: Club, role: Role, watch = false): Player[] {
  const g = gs();
  if (!roleIndex || g.date > addDays(roleIndexDate, 14)) buildRoleIndex();
  const ids = roleIndex!.get(role) ?? [];
  const hasRole = squad(club.id).some((p) => GROUP[naturalRole(p)] === GROUP[role]);
  const level = targetLevel(club) - roleOffset(role);
  const lo = level - (hasRole ? 6 : 25), hi = level + 18;
  const cands: Player[] = [];
  // binær søgning på CA
  let a = 0, b = ids.length;
  while (a < b) { const m = (a + b) >> 1; if ((g.players[ids[m]]?.ca ?? 0) < lo) a = m + 1; else b = m; }
  let end = a, e2 = ids.length;
  while (end < e2) { const m = (end + e2) >> 1; if ((g.players[ids[m]]?.ca ?? 0) <= hi) end = m + 1; else e2 = m; }
  // jævnt udvalg over hele intervallet (ellers ses kun de svageste 60 kandidater)
  const step = Math.max(1, Math.floor((end - a) / (watch ? 400 : 150)));
  for (let i = a; i < end && cands.length < (watch ? 200 : 60); i += step) {
    const p = g.players[ids[i]];
    if (!p) continue;
    if (p.club === club.id || p.loan || p.contract?.futureClub) continue;
    // nyindkøbte spillere videresælges ikke samme sæson (medmindre de er sat til salg)
    if (recentlyJoined(p)) continue;
    const age = ageOn(p.dob, g.date);
    if (age > 31) continue;
    const price = p.club ? askingPrice(p) : 0;
    if (price > club.transferBudget * (watch ? 1.6 : 1.05)) continue;
    if (playerInterest(p, club) !== 'yes') continue;
    cands.push(p);
  }
  if (!cands.length) return [];
  const budget = Math.max(1, club.transferBudget);
  const strat = clubStrategy(club);
  const priceW = strat === 'big' ? 3 : strat === 'seller' ? 10 : 6;
  const score = (p: Player) => {
    const age = ageOn(p.dob, g.date);
    let v = p.ca - level - (p.club ? askingPrice(p) / budget : 0) * priceW + (age <= 24 ? 2 : 0);
    if (strat === 'develop') v += (age <= 21 ? 6 : age >= 27 ? -6 : 0) + (p.pa - p.ca) / 8;
    if (strat === 'seller') v += (age <= 23 ? 4 : age >= 28 ? -5 : 0) + (p.pa - p.ca) / 12;
    if (strat === 'big') v += (p.ca - level) * 0.3;
    return v;
  };
  // shortliste: hvem er bedst i forhold til klubben (prisen betyder mindre, når man bare holder øje)
  // klubber scouter mest i eget land og i de ligaer der følges (aktive nationer)
  const near = (p: Player) => { const pc = g.clubs[p.club]; return !pc ? 0 : (pc.nation === club.nation ? 6 : 0) + (g.comps[pc.league] ? 3 : 0); };
  const watchScore = (p: Player) => p.ca - level + (ageOn(p.dob, g.date) <= 24 ? 3 : 0) - (p.club ? askingPrice(p) / budget : 0) * 2 + near(p);
  cands.sort(watch ? (x, y) => watchScore(y) - watchScore(x) : (x, y) => score(y) - score(x));
  return cands;
}

/**
 * Nyindkøbt: AI-klubber køber ikke en spiller, der skiftede klub inden for de sidste 120 dage (højst ét skifte pr.
 * transfervindue – spillerfejl: Kulusevski Spurs → Fulham → Bilbao → Lazio i samme vindue), og heller ikke en
 * ikke-transferlistet spiller, der kom til i år.
 */
export function recentlyJoined(p: Player): boolean {
  if (!p.club || !p.joined) return false;
  const g = gs();
  return p.joined > addDays(g.date, -120) || (!p.listed && p.joined > addDays(g.date, -300));
}

export function findTarget(club: Club, role: Role): Player | null {
  // spillere klubben allerede har på sin shortliste foretrækkes
  const listed = (club.shortlist ?? []).map((id) => gs().players[id]).filter((p): p is Player => !!p && p.club !== club.id && GROUP[naturalRole(p)] === GROUP[role] && !p.loan && !p.contract?.futureClub && !recentlyJoined(p) && (p.club ? askingPrice(p) : 0) <= club.transferBudget * 1.05);
  if (listed.length && rng.chance(0.7)) return rng.pick(listed);
  const cands = rankTargets(club, role);
  return cands.length ? rng.pick(cands.slice(0, 8)) : null;
}

export function aiTransferTick() {
  const g = gs();
  // ønskelisterne (0x83b6e0/0x84a020) står for computerens køb og salg – spillets eget marked er slået fra
  if (cmShortlistOn(g)) return;
  if (!cmMarketOn(g) && !windowOpen()) return;   // ægte tilstand: hver klubs eget lands vindue (aiClubTurn)
  const m = month(g.date);
  const rate = m === 7 || m === 8 ? 1 / 5 : m === 1 ? 1 / 9 : m === 6 ? 1 / 12 : 1 / 60;
  // skjulte klubber (uden for de spilbare ligaer) handler ikke selv – de sælger kun, når andre byder
  const clubs = Object.values(g.clubs).filter((c) => !g.leagues[c.league]?.hidden);
  const n = Math.max(1, Math.round(clubs.length * rate));
  for (let i = 0; i < n; i++) {
    const club = rng.pick(clubs);
    if (!club || isHumanClub(club.id)) continue;
    aiClubTurn(club);
  }
}

function aiClubTurn(club: Club) {
  const g = gs();
  if (cmMarketOn(g) && !windowOpen(g.date, club.id)) return;
  const sq = squad(club.id);
  // den originale database i ægte tilstand: computerens trupplan 0x83cb40 sætter til salg/leje og fritstiller (cmSquadPlanGame.ts) – ikke her
  const plan = cmMarketOn(g) && !!g.cmPlan?.[club.id];
  // Økonomisk krise: sæt de dyreste (ikke-nøgle)spillere til salg, og frigiv ældre storlønnede
  if (club.balance < 0 && plan) { club.transferBudget = 0; return; }
  if (club.balance < 0) {
    const bill = sq.reduce((s, p) => s + (p.contract?.wage ?? 0), 0);
    const pricey = sq.filter((p) => p.contract && !p.loan && keyPlayerRank(p) > 3).sort((a, b) => (b.contract!.wage) - (a.contract!.wage));
    for (const p of pricey.slice(0, 3)) p.listed = true;
    const old = pricey.find((p) => ageOn(p.dob, g.date) >= 31 && p.contract!.wage > bill / Math.max(10, sq.length) * 1.5 && (!p.joined || p.joined <= addDays(g.date, -120)));
    if (old && sq.length > 22 && club.balance < -club.wageBudget * 20) {
      const pay = Math.round(old.contract!.wage * 10);
      club.balance -= pay;
      setClub(old, 0);
      old.contract = null;
    }
    club.transferBudget = 0;
    return;
  }
  // Sælg/frigiv overskud
  if (sq.length > 34 && !plan) {
    // ikke nyindkøbte (ellers kunne en spiller skifte igen som fri agent i samme vindue)
    const old = sq.filter((p) => p.contract && !p.loan && (!p.joined || p.joined <= addDays(g.date, -120))).sort((a, b) => a.ca - b.ca)[0];
    if (old) { setClub(old, 0); old.contract = null; }
    return;
  }
  if (sq.length > 30 && !plan) {
    // ikke nyindkøbte (de sættes ikke til salg i samme vindue)
    const surplus = sq.filter((p) => !p.joined || p.joined <= addDays(g.date, -120)).sort((a, b) => a.ca - b.ca).slice(0, 3);
    for (const p of surplus) p.listed = true;
  }
  // den originale database i ægte tilstand: computerens køb kommer fra ønskelisterne (cmShortlistGame.ts – 0x83b6e0/0x84a020)
  if (plan && cmShortlistOn(g)) return;
  const needs = analyzeNeeds(club.id);
  // fuld trup: kun køb hvis en position helt mangler dækning
  if (sq.length >= 33 && !(needs[0]?.score >= 2)) return;
  if (!needs.length) {
    // ingen akutte behov: forsøg at forstærke en tilfældig rolle i ny og næ – oftere hvis holdet er bagud i ligaen
    const behind = clubLevel(club.id) < leagueFloor(club);
    if (!rng.chance(behind ? 0.7 : 0.25)) return;
    needs.push({ role: rng.pick(['CB', 'CM', 'ST', 'W', 'FB'] as Role[]), score: 0.5 });
  }
  const need = needs[0];
  const target = findTarget(club, need.role);
  if (!target) return;
  if (!target.club) {
    // fri agent
    const wage = wageDemand(target, club);
    target.contract = aiNewContract(target, club, () => ({ wage, expires: `${year(g.date) + preferredYears(target)}-06-30` }));
    recordMove(target, club.id, 0);
    setClub(target, club.id);
    movePlacement(g, target);
    target.joined = g.date;
    forEachHuman(() => { if (origLogic()) originalTransferNews(target, club, undefined, 0, false); else if (otherTransferNews(club, undefined, 0, false)) (g.transferDigest ??= []).push({ player: target.id, from: 0, to: club.id, fee: 0 }); });
    return;
  }
  const ask = askingPrice(target);
  const fee = Math.max(10_000 * econ(), roundValue(ask * rng.range(0.85, 1.1)));
  if (isHumanClub(target.club)) {
    // bud til en menneskelig manager
    if (!canBidOnHuman(target, club.id)) return;
    const maxFee = roundValue(Math.min(club.transferBudget, fee * rng.range(1.05, 1.35)));
    const o: TransferOffer = { id: g.nextId.offer++, player: target.id, buyer: club.id, seller: target.club, fee, loan: false, status: 'pending', created: g.date, respondBy: addDays(g.date, 5), maxFee };
    g.offers.push(o);
    noteInterest(o.buyer, o.player);
    asOwner(target.club, () => addNews({ cat: 'transfer', key: 'transfer.incomingBid', params: { club: club.name, player: pname(target), fee }, link: { kind: 'offer', id: o.id } }));
    return;
  }
  const d = sellerDecision(target, fee, club);
  if (d.answer === 'accept' || (d.answer === 'counter' && d.counter! <= club.transferBudget && rng.chance(0.6))) {
    const o: TransferOffer = { id: g.nextId.offer++, player: target.id, buyer: club.id, seller: target.club, fee: d.answer === 'accept' ? fee : d.counter!, loan: false, status: 'negotiating', created: g.date, respondBy: g.date };
    completeTransfer(o, wageDemand(target, club), preferredYears(target));
  }
}

// ---------- jagt, budkrige og købsoptioner ----------

/** En AI-klub der har fået afslag, vender måske tilbage med et højere bud */
function startPursuit(o: TransferOffer) {
  const g = gs();
  if (cmShortlistOn(g)) return;
  const buyer = g.clubs[o.buyer];
  const p = g.players[o.player];
  if (!buyer || !p) return;
  const keen = clubStrategy(buyer) === 'big' ? 0.75 : 0.5;
  if (!rng.chance(keen)) return;
  const max = Math.max(o.maxFee ?? o.fee, o.fee) * rng.range(1.1, 1.35);
  const list = (g.pursuits ??= []).filter((x) => !(x.club === buyer.id && x.player === p.id));
  const prev = g.pursuits.find((x) => x.club === buyer.id && x.player === p.id);
  list.push({ club: buyer.id, player: p.id, lastFee: o.fee, maxFee: roundValue(Math.min(buyer.transferBudget, max)), tries: (prev?.tries ?? 0) + 1, next: addDays(g.date, rng.int(6, 16)) });
  g.pursuits = list.filter((x) => x.tries <= 3);
}

/** Dagligt: klubber der jagter en spiller kommer igen med forhøjet bud */
export function aiPursuits() {
  const g = gs();
  if (cmShortlistOn(g)) return;   // ønskelisternes genudfyldning efter et afslag (0x843e10) erstatter jagten
  if (!g.pursuits?.length || (!cmMarketOn(g) && !windowOpen())) return;
  const keep: typeof g.pursuits = [];
  for (const pu of g.pursuits) {
    const p = g.players[pu.player];
    const club = g.clubs[pu.club];
    if (!p || !club || !p.club || !isHumanClub(p.club) || !inPlayedNation(club)) continue;
    if (cmMarketOn(g) && !windowOpen(g.date, club.id)) { keep.push(pu); continue; }
    if (g.date < pu.next) { keep.push(pu); continue; }
    if (g.offers.some((o) => o.player === p.id && o.status === 'pending')) { keep.push(pu); continue; }
    const fee = roundValue(Math.min(pu.maxFee, pu.lastFee * rng.range(1.08, 1.2)));
    if (fee <= pu.lastFee || refusedBy(p, club.id)) continue;
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: club.id, seller: p.club, fee, loan: false, status: 'pending', created: g.date, respondBy: addDays(g.date, 5), maxFee: pu.maxFee };
    g.offers.push(o);
    noteInterest(o.buyer, o.player);
    asOwner(p.club, () => {
      addNews({ cat: 'transfer', key: 'transfer.incomingBid', params: { club: club.name, player: pname(p), fee, n: pu.tries + 1 }, link: { kind: 'offer', id: o.id } });
      // en ambitiøs spiller bliver urolig, når en større klub bliver ved med at banke på
      const own = g.clubs[p.club];
      if (pu.tries >= 2 && own && club.rep >= own.rep + 8 && p.attrs[42] >= 14 && !p.wantsAway) {
        p.wantsAway = true;
        p.morale = Math.max(1, p.morale - 2);
        addNews({ cat: 'general', key: 'will.unsettled', params: { player: pname(p), club: club.name }, link: { kind: 'player', id: p.id } });
      }
    });
  }
  g.pursuits = keep;
}

/** Budkrig: når brugeren byder på en attraktiv spiller, kan en anden klub melde sig */
function rivalBid(o: TransferOffer, p: Player): TransferOffer['rival'] {
  const g = gs();
  if (o.rival !== undefined || p.value < 1_500_000 * econ() || !rng.chance(0.25)) return o.rival;
  const ask = askingPrice(p);
  const level = (c: Club) => clubLevel(c.id);
  const cands = Object.values(g.clubs).filter((c) => c.id !== o.buyer && c.id !== p.club && !isHumanClub(c.id) && inPlayedNation(c) && c.transferBudget >= ask && Math.abs(level(c) - p.ca) <= 20 && playerInterest(p, c) === 'yes');
  if (!cands.length) return undefined;
  const club = rng.pick(cands);
  return { club: club.id, fee: roundValue(Math.min(club.transferBudget, Math.max(o.fee, ask) * rng.range(1.02, 1.15))) };
}

/** Leje med købsoption: AI-klubber vil låne brugerens unge/ubrugte spillere med mulighed for at købe */
export function aiLoanOptions() {
  const g = gs();
  if (!g.userClub || !windowOpen()) return;
  // højst ét åbent lejetilbud ad gangen (ellers fylder de indbakken)
  if (g.offers.some((o) => o.seller === g.userClub && o.loan && o.option && o.status === 'pending')) return;
  for (const p of squad(g.userClub)) {
    if (p.loan || p.listed || p.contract?.futureClub || keyPlayerRank(p) <= 14) continue;
    if (ageOn(p.dob, g.date) > 23 || !rng.chance(0.015)) continue;
    if (g.offers.some((o) => o.player === p.id && o.status === 'pending')) continue;
    const cands = Object.values(g.clubs).filter((c) => !isHumanClub(c.id) && c.id !== g.userClub && inPlayedNation(c) && Math.abs(clubLevel(c.id) - p.ca) <= 12 && c.transferBudget >= p.value);
    if (!cands.length) continue;
    const club = rng.pick(cands);
    const option = roundValue(Math.max(p.value * rng.range(1.0, 1.3), 50_000 * econ()));
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: club.id, seller: g.userClub, fee: 0, loan: true, option, status: 'pending', created: g.date, respondBy: addDays(g.date, 6) };
    g.offers.push(o);
    addNews({ cat: 'transfer', key: 'transfer.loanOptionBid', params: { club: club.name, player: pname(p), fee: option }, link: { kind: 'offer', id: o.id } });
    return;
  }
}

/** Sommer: lejeklubben aktiverer købsoptionen, hvis spilleren har gjort det godt */
export function exerciseLoanOption(p: Player): boolean {
  const g = gs();
  const loan = p.loan;
  if (!loan?.option) return false;
  const buyer = g.clubs[p.club];
  const seller = g.clubs[loan.from];
  if (!buyer || !seller) return false;
  // sæsonens statistik er arkiveret i historikken, når lejen udløber 1. juli
  const last = p.history.find((h) => h.season === g.season && h.club === p.club);
  const rating = last?.avg ?? 0;
  const played = last?.apps ?? 0;
  if (played < 10 || rating < 6.6 || buyer.transferBudget < loan.option * 0.8) return false;
  buyer.balance -= loan.option;
  buyer.transferBudget = Math.max(0, buyer.transferBudget - loan.option);
  buyer.finance.transfersOut += loan.option;
  seller.balance += loan.option;
  seller.finance.transfersIn += loan.option;
  p.loan = null;
  p.contract = aiNewContract(p, buyer, () => ({ wage: wageDemand(p, buyer), expires: `${year(g.date) + preferredYears(p)}-06-30` }));
  p.joined = g.date;
  asOwner(seller.id, () => addNews({ cat: 'transfer', key: 'transfer.optionExercised', params: { club: buyer.name, player: pname(p), fee: loan.option! }, link: { kind: 'player', id: p.id } }));
  return true;
}

/** AI fornyer kontrakter for spillere den vil beholde (januar-maj) */
export function aiRenewals() {
  const g = gs();
  const cm = cmCmOn(g);
  // den originale database i ægte tilstand: hver måned de næste fem måneders udløb (datoerne følger landets sæsonslut – cmContractEnd.ts)
  const seasonEnd = cm ? addDays(g.date, 150) : `${year(g.date)}-06-30`;
  // hvor mange spillere har hver klub efter sommeren, hvis ingen fornyes?
  const staying = new Map<number, number>();
  for (const p of Object.values(g.players)) {
    if (!p.club || p.loan) continue;
    if (!p.contract || p.contract.expires > seasonEnd) staying.set(p.club, (staying.get(p.club) ?? 0) + 1);
  }
  // den originale database i ægte tilstand: originalens CONTRACT_MANAGER 0x4c7ac0 forlænger computerklubbernes kontrakter (cmContractManager.ts)
  const expiring = Object.values(g.players)
    .filter((p) => p.club && !isHumanClub(p.club) && p.contract && !p.loan && p.contract.expires <= seasonEnd && !p.contract.futureClub && !(cm && cmCmScope(g, p)))
    .sort((a, b) => b.ca - a.ca);
  for (const p of expiring) {
    const level = clubLevel(p.club);
    const age = ageOn(p.dob, g.date);
    const left = staying.get(p.club) ?? 0;
    const lv = level - roleOffset(naturalRole(p));
    // spillere, der faktisk bruges (spilletid denne sæson), fornyes næsten altid; resten efter behov
    const used = p.stats.apps + p.stats.subs >= 10 && age <= 34;
    const wanted = used || (depthRank(p) < (REQUIRED[naturalRole(p)] ?? 2) && age <= 34) || (p.ca >= lv - 15 && age <= 32) || (p.ca >= lv - 3 && age <= 38) || (age <= 23 && p.pa >= lv - 5) || (left < 22 && age <= 34 && p.ca >= lv - 30);
    if (!wanted || !rng.chance(used ? 0.6 : 0.35)) continue;
    const club = g.clubs[p.club];
    const rel = defaultRelease(p, club);
    p.contract = aiNewContract(p, club, () => ({ wage: wageDemand(p, club), expires: `${year(g.date) + (age >= 33 ? 1 : preferredYears(p))}-06-30`, ...(rel ? { release: rel } : {}) }));
    cmSignContractMorale(g, p);   // sign_contract 0x4cf720 (cmMedia.ts)
    staying.set(p.club, left + 1);
  }
}

/**
 * Sommer/januar: AI-klubber med for små trupper henter klubløse spillere (eller rykker
 * ungdomsspillere op), så ingen klub står med for få spillere.
 */
export function aiFillSquads(minSize = 22) {
  const g = gs();
  // ønskelisterne: originalen fylder ikke trupperne op med klubløse (fyldspillerne cmVirtual.ts står i hullerne før kampene)
  if (cmShortlistOn(g)) return;
  const free = Object.values(g.players).filter((p) => !p.club && p.ca >= 30).sort((a, b) => b.ca - a.ca);
  const taken = new Set<number>();
  for (const c of Object.values(g.clubs)) {
    if (isHumanClub(c.id) || g.leagues[c.league]?.hidden) continue;
    // mindst to målmænd – ellers står en markspiller i mål
    const gks = squad(c.id).filter((p) => naturalRole(p) === 'GK').length;
    for (let i = gks; i < 2; i++) {
      const lv = clubLevel(c.id) - GK_OFFSET;
      const gk = free.find((p) => !taken.has(p.id) && naturalRole(p) === 'GK' && p.ca <= lv + 15 && p.ca >= lv - 50 && playerInterest(p, c) === 'yes');
      if (!gk) {
        // ingen ledig målmand: en ung målmand rykkes op fra reserverne, så klubben ikke står med én
        const r = new Rng(hash(g.seed, c.id, Number(g.date.replace(/-/g, "")), i, 17));
        const [first, last] = randomName(g.names, c.nation, r);
        const ca = Math.max(35, Math.min(150, Math.round(lv - 12 + r.normal(0, 5))));
        const y = makePlayer({ id: g.nextId.player++, first, last, dob: randomDob(r.int(18, 21), g.date, r), nation: c.nation, club: c.id, sub: 'GK', foot: 'R', height: 0,
          ca, pa: ca + r.int(5, 25), date: g.date, seed: g.seed, regen: true, contractEnd: `${year(g.date) + 2}-06-30`, wealth: rulesFor(c.league, 20).wealth });
        addPlayer(y);
        break;
      }
      taken.add(gk.id);
      gk.contract = aiNewContract(gk, c, () => ({ wage: Math.round(wageDemand(gk, c) * 0.85 / 50) * 50, expires: `${year(g.date) + Math.max(1, preferredYears(gk) - 1)}-06-30` }));
      setClub(gk, c.id);
      movePlacement(g, gk);
      gk.joined = g.date;
    }
    let size = squad(c.id).length;
    if (size >= minSize) continue;
    const level = clubLevel(c.id);
    const needs = analyzeNeeds(c.id).map((n) => n.role);
    while (size < minSize) {
      // bedste ledige spiller der passer niveauet og vil komme – helst i en position klubben mangler
      const cand = free.find((p) => !taken.has(p.id) && p.ca <= level + 15 && p.ca >= level - 35 && playerInterest(p, c) === 'yes' && (needs.length === 0 || needs.includes(GROUP[naturalRole(p)])))
        ?? free.find((p) => !taken.has(p.id) && p.ca <= level + 15 && p.ca >= level - 45 && playerInterest(p, c) === 'yes');
      if (!cand) break;
      taken.add(cand.id);
      cand.contract = aiNewContract(cand, c, () => ({ wage: Math.round(wageDemand(cand, c) * 0.85 / 50) * 50, expires: `${year(g.date) + Math.max(1, preferredYears(cand) - 1)}-06-30` }));
      setClub(cand, c.id);
      movePlacement(g, cand);
      cand.joined = g.date;
      size++;
    }
  }
}

/** Brugerens spillere: påmindelser om udløbende kontrakter */
export function contractReminders() {
  const g = gs();
  const seasonEnd = `${year(g.date) + (month(g.date) >= 7 ? 1 : 0)}-06-30`;
  for (const p of squad(g.userClub)) {
    if (p.contract && p.contract.expires <= seasonEnd && !p.loan) {
      addNews({ cat: 'contract', key: p.contract.futureClub ? 'contract.leavingBosman' : 'contract.expiring', params: { player: pname(p), club: p.contract.futureClub ? g.clubs[p.contract.futureClub]?.name ?? '' : '' }, link: { kind: 'player', id: p.id } });
    }
  }
}

/** AI-klubber laver pre-contracts med brugerens spillere (Bosman) */
export function aiBosman() {
  const g = gs();
  if (cmShortlistOn(g)) return;   // ønskelisternes bud på spillere med udløbende kontrakt erstatter skønnet
  for (const p of squad(g.userClub)) {
    if (!canPreContractAny(p) || p.contract!.futureClub) continue;
    // spillere, der har sagt nej til at forlænge, er meget mere åbne over for andre klubber
    if (!rng.chance(p.renewal && !p.renewal.convinced ? (p.renewal.stance === 'refuses' ? 0.1 : 0.05) : 0.02)) continue;
    const suitors = Object.values(g.clubs).filter((c) => !isHumanClub(c.id) && c.rep >= p.rep - 15 && c.rep <= p.rep + 25);
    const c = rng.pick(suitors);
    if (!c) continue;
    // fansene hører det med det samme: han forlader klubben gratis til sommer
    fansOnDeparture(p, g.clubs[g.userClub], 'free');
    p.contract!.futureClub = c.id;
    const f0 = cmAiTerms(g, p, c.id), ft = f0?.offered ? f0 : null;
    p.contract!.futureWage = ft?.wage ?? wageDemand(p, c);
    p.contract!.futureExpires = ft?.expires ?? `${year(g.date) + preferredYears(p)}-06-30`;
    addNews({ cat: 'contract', key: 'contract.leavingBosman', params: { player: pname(p), club: c.name }, link: { kind: 'player', id: p.id } });
  }
}

function canPreContractAny(p: Player) {
  const g = gs();
  if (!p.contract) return false;
  const m = month(g.date);
  return p.contract.expires <= `${year(g.date)}-06-30` && m >= 1 && m <= 5;
}

export interface LoanSuitor {
  club: number;
  maxShare: number; // højeste andel af lønnen klubben vil betale (0-1)
  maxFee: number; // højeste lejegebyr
}

/** Hvilke klubber vil leje spilleren – og på hvilke vilkår? */
export function loanSuitors(pid: number): LoanSuitor[] {
  const g = gs();
  const p = g.players[pid];
  const me = g.clubs[p?.club ?? 0];
  if (!p || !me || !p.contract) return [];
  const wage = Math.max(1, p.contract.wage);
  const role = naturalRole(p);
  const out: LoanSuitor[] = [];
  for (const c of Object.values(g.clubs)) {
    // skjulte klubber spiller ingen kampe – et lejeophold dér giver ingen spilletid
    if (c.id === me.id || isHumanClub(c.id) || g.leagues[c.league]?.hidden) continue;
    const level = clubLevel(c.id);
    // spilleren skal kunne spille på holdet, og klubben må ikke være meget større
    if (p.ca < level - 8 || p.ca > level + 35 || c.rep > me.rep + 10) continue;
    if (playerInterest(p, c) !== 'yes') continue;
    if (squad(c.id).length >= 32) continue;
    const need = analyzeNeeds(c.id).some((n) => GROUP[role] === n.role) ? 0.15 : 0;
    // forholdet mellem spillerens løn og klubbens gennemsnitsløn
    const avgWage = c.wageBudget / Math.max(18, squad(c.id).length);
    const ratio = Math.min(1.4, avgWage / wage);
    const quality = Math.max(-0.2, Math.min(0.2, (p.ca - level) / 80));
    const mood = (hash01(c.id, p.id, 5) - 0.5) * 0.3; // hver klub vurderer lidt forskelligt
    const maxShare = Math.max(0, Math.min(1, 0.05 + ratio * 0.5 + need + quality + mood));
    if (maxShare < 0.1) continue;
    const feeRoom = Math.min(c.transferBudget * 0.1, p.value * 0.1) * (0.3 + hash01(c.id, p.id, 6) * 0.7);
    const maxFee = maxShare >= 0.6 ? roundValue(feeRoom * (maxShare - 0.5) * 2) : 0;
    out.push({ club: c.id, maxShare: Math.round(maxShare * 100) / 100, maxFee });
  }
  return out.sort((a, b) => b.maxShare - a.maxShare || g.clubs[b.club].rep - g.clubs[a.club].rep).slice(0, 25);
}

/** Udlej til en bestemt klub: share = andel af lønnen lejeklubben betaler, fee = lejegebyr */
export function loanOut(pid: number, club: number, share: number, fee: number): string {
  const g = gs();
  const p = g.players[pid];
  if (!p || p.club !== g.userClub || p.loan) return 'error';
  if (!windowOpen()) return 'transfer.windowClosed';
  const s = loanSuitors(pid).find((x) => x.club === club);
  if (!s) return 'transfer.noLoanClub';
  if (share > s.maxShare + 1e-6 || fee > s.maxFee) return 'transfer.loanTermsRejected';
  const me = g.clubs[g.userClub];
  const o: TransferOffer = { id: g.nextId.offer++, player: pid, buyer: club, seller: me.id, fee: 0, loan: true, status: 'negotiating', created: g.date, respondBy: g.date };
  g.offers.push(o);
  completeTransfer(o, p.contract?.wage ?? 0, 0);
  p.loan = { from: me.id, until: `${year(g.date) + (month(g.date) >= 7 ? 1 : 0)}-06-30`, share, fee };
  if (fee > 0) {
    const borrower = g.clubs[club];
    borrower.balance -= fee;
    borrower.finance.transfersOut += fee;
    me.balance += fee;
    me.finance.transfersIn += fee;
  }
  return 'ok';
}

/** AI-klubber byder på brugerens transferlistede spillere */
export function aiBidsForListed() {
  const g = gs();
  if (cmMarketOn(g)) { cmBidsForListed(); return; }
  if (!g.userClub || !windowOpen()) return;
  const m = month(g.date);
  const chance = m === 7 || m === 8 || m === 1 ? 0.2 : 0.1;
  for (const p of squad(g.userClub)) {
    // transferlistet, på udlejningslisten eller "ikke nødvendig" i truppen (det rygtes – færre bud)
    const surplus = p.squadStatus === 'surplus';
    if (!(p.listed || p.loanListed || surplus) || p.loan || p.contract?.futureClub) continue;
    if (g.offers.some((o) => o.player === p.id && o.status === 'pending')) continue;
    const loanOnly = !p.listed && !!p.loanListed;
    // en spiller, der lige er kommet til og ikke er sat til salg, får ikke bud fra andre klubber (ejerens fejlmelding 22/8: bud to uger efter købet)
    if (!p.listed && !loanOnly && recentlyJoined(p)) continue;
    if (g.offers.filter((o) => o.seller === g.userClub && o.status === 'pending' && !isHumanClub(o.buyer)).length >= 3) break;
    const ask = askingPrice(p);
    // lav udbudspris i forhold til værdien gør spilleren ekstra attraktiv
    const attract = Math.max(0.25, Math.min(3, Math.pow(p.value / Math.max(1, ask), 1.6)));
    if (!rng.chance(Math.min(0.75, chance * attract * (p.listed || loanOnly ? 1 : 0.4)))) continue;
    const role = GROUP[naturalRole(p)];
    const cands = Object.values(g.clubs).filter((c) => {
      if (c.id === g.userClub || isHumanClub(c.id) || !inPlayedNation(c)) return false;
      // skjulte klubber lejer ikke (de spiller ingen kampe)
      if (loanOnly && g.leagues[c.league]?.hidden) return false;
      const level = clubLevel(c.id);
      if (p.ca < level - 15 || p.ca > level + 25) return false;
      if (c.transferBudget < ask * 0.55) return false;
      return playerInterest(p, c) === 'yes' && squad(c.id).length < 32;
    });
    if (!cands.length) continue;
    const club = rng.weighted(cands, (c) => (analyzeNeeds(c.id).some((n) => n.role === role) ? 3 : 1) * (1 + c.rep / 50))!;
    const cheap = ask < p.value * 0.9;
    const fee = Math.max(10_000 * econ(), roundValue(Math.min(club.transferBudget, ask) * (cheap ? rng.range(0.92, 1.02) : rng.range(0.72, 0.98))));
    const maxFee = roundValue(Math.min(club.transferBudget, Math.max(fee, ask * rng.range(0.95, 1.12), p.value * rng.range(0.9, 1.2))));
    const o: TransferOffer = loanOnly
      ? { id: g.nextId.offer++, player: p.id, buyer: club.id, seller: g.userClub, fee: 0, loan: true, status: 'pending', created: g.date, respondBy: addDays(g.date, 5) }
      : { id: g.nextId.offer++, player: p.id, buyer: club.id, seller: g.userClub, fee, loan: false, status: 'pending', created: g.date, respondBy: addDays(g.date, 5), maxFee };
    g.offers.push(o);
    noteInterest(o.buyer, o.player);
    addNews({ cat: 'transfer', key: loanOnly ? 'transfer.incomingLoan' : 'transfer.incomingBid', params: { club: club.name, player: pname(p), fee }, link: { kind: 'offer', id: o.id } });
  }
}

/** Den originale database i ægte tilstand: computerklubberne, der vurderer menneskets spiller over hans værdi +0x52 (0x842180 – cmInterested,
 *  *estimeret*), byder værdien (Deportivo bød £100K på Scholes til £100K i originalen). Chancen pr. dag: cmBidChance (*estimeret*). Højst ét
 *  ventende bud pr. spiller og tre i alt. Originalen har ingen transfervinduer i 2001/02 (windowOpen gælder ikke her). */
function cmBidsForListed() {
  const g = gs();
  if (!g.userClub || cmShortlistOn(g)) return;   // ønskelisternes bud (0x84a020) erstatter skønnet
  const rnd = new Rng(hash(g.seed ?? 0, daysBetween('2000-01-01', g.date), 0x842180));
  for (const p of squad(g.userClub)) {
    if (p.loan || p.contract?.futureClub) continue;
    const ch = cmBidChance(p);
    if (!ch || g.offers.some((o) => o.player === p.id && (o.status === 'pending' || o.status === 'negotiating'))) continue;
    if (g.offers.filter((o) => o.seller === g.userClub && o.status === 'pending' && !isHumanClub(o.buyer)).length >= 3) break;
    for (const cid of cmInterested(g, p, clubLevel)) {
      if (!rnd.chance(ch)) continue;
      const club = g.clubs[cid];
      if (refusedBy(p, cid)) continue;
      const fee = Math.max(1000, Math.min(club.transferBudget, p.value));
      // vilkårene som originalens build_bid 0x8e5d60 (rater, videresalg, beløb efter N kampe, offentligt) – ellers et kontant bud
      // (værdisætningen er spillerens værdi – build_bid ser selv køberens transferbudget og tager rater, hvis han ikke kan betale det hele)
      // (MODERN_PARITY 3) buddets beløb: køberens €→£-faktor (cmMoney.ts; den originale database 0,86)
      const toGbp = (x: number) => toK(x, cid), fromGbp = (x: number) => fromK(x, cid);
      const cl = cmBuildBid(g, p, cid, toGbp(Math.max(fee, p.value)));
      const cash = cl ? (cl.months > 0 ? fromGbp(cl.fee) : Math.min(fromGbp(cl.fee), Math.max(1000, club.transferBudget))) : fee;
      const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: cid, seller: g.userClub, fee: cash, loan: false, status: 'pending', created: g.date, respondBy: addDays(g.date, 5), maxFee: fee,
        ...(cl && cl.months > 0 ? { months: cl.months } : {}), ...(cl && cl.sellOn > 0 ? { sellOn: cl.sellOn } : {}),
        ...(cl && cl.lgFee > 0 ? { lgFee: fromGbp(cl.lgFee), lgApps: cl.lgApps } : {}), ...(cl && cl.intFee > 0 ? { intFee: fromGbp(cl.intFee), intApps: cl.intApps } : {}),
        ...(cl && cl.pub ? { pub: cl.pub as 1 | 2 } : {}) };
      g.offers.push(o);
      noteInterest(o.buyer, o.player);
      addNews({ cat: 'transfer', key: 'transfer.incomingBid', params: { club: club.name, player: pname(p), fee: o.fee }, link: { kind: 'offer', id: o.id } });
      break;
    }
  }
}

registerAskingPrice(askingPrice, playerInterest, (p) => transferRealism(p).level);

/** Ønskelisternes bud (cmShortlistGame.ts, 0x84a020 → 0x8e5d60/0x8be300): bud på menneskets spillere bliver ventende bud (Respond i indbakken);
 *  bud på computerens spillere OG på klubløse lever i g.offers (`cmAi`) til svartiden 0x8cc5b0 er gået (cmAiAiDue) – også en klubløs får et
 *  transfertilbud i TRANSFER_MANAGER (0x84a728 → 0x8be300 med build_bid's kontrakttilbud, 0x84a75c add_contract_offer 0x4cc490), som
 *  process_due_offer 0x8c63a0 behandler på svardagen (tilstand 0 uden sælger → 0x8c0080). Før skrev de klubløse under samme dag. */
/** 0x587370's tre tekster til nyheden 0xfbd (rand(3) i 0x587220): 0x9c4b04, 0x9c4b9c, 0x9c4c50 */
const SPOTTED_KEYS = ['scout.spotted.seen', 'scout.spotted', 'scout.spotted.star'] as const;
export function cmShortlistApply(events: SlEvent[]) {
  const g = gs();
  for (const e of events) {
    if (e.kind === 'rumour') { const p = g.players[e.player]; if (p) cmRumourAdd(g, p, e.club, fromK(e.amt, e.club), e.will); continue; }
    if (e.kind === 'spotted') {
      // 0x587220 → 0x7861e0: nyheden 0xfbd til spillerens klub (et menneske styrer den – 0x7875e0 i 0x83f3a0); tekst nr. v (0x587370)
      const p = g.players[e.player], sc = g.clubs[e.club];
      if (p && sc && p.club && isHumanClub(p.club)) asOwner(p.club, () => addNews({ cat: 'scout', key: SPOTTED_KEYS[e.v] ?? 'scout.spotted', params: { club: sc.name, player: pname(p) }, link: { kind: 'player', id: p.id } }));
      continue;
    }
    const p = g.players[e.player], buyer = g.clubs[e.buyer];
    // (køberen: 0x84a020 byder for menneskets klub på ferie – 0x600a50(klub, 0, …) = 0; ferievalg 4 i den oversatte funktion)
    if (!p || !buyer || p.contract?.futureClub || p.club === buyer.id || humanClub0(g, buyer.id)) continue;
    if (!p.club && e.loan) continue;
    // en udlejet spiller står i moderklubbens trup i hukommelsen (hovedkontrakten +4, cmSlMem.ts loanedOut), så ønskelisterne byder på ham
    // som på alle andre: sælgeren er moderklubben, og handlen afslutter lejen (oraklets billeder: udlejede købt af en tredje klub midt i lejen,
    // ~30 pr. sæson fra engelske klubber). Kun computer ↔ computer (moder- og lejeklub); en ny leje af en udlejet afvises af 0x8ce990 selv.
    if (p.loan && (e.loan || p.loan.from === buyer.id || isHumanClub(p.loan.from) || isHumanClub(p.club))) continue;
    if (g.offers.some((o) => o.player === p.id && o.buyer === buyer.id && ['pending', 'negotiating', 'countered'].includes(o.status))) continue;
    // buddets beløb er køberens penge: £ → € med køberens faktor (cmMoney.ts – den originale database 0,86)
    const fromGbp = (x: number) => fromK(x, buyer.id);
    const o: TransferOffer = { id: e.id, player: p.id, buyer: buyer.id, seller: p.loan?.from ?? p.club, fee: e.loan ? 0 : fromGbp(e.fee), loan: e.loan, status: 'pending', created: g.date,
      respondBy: addDays(g.date, 5), maxFee: fromGbp(Math.max(e.max, e.fee)),
      ...(e.months > 0 ? { months: e.months } : {}), ...(e.sellOn > 0 ? { sellOn: e.sellOn } : {}),
      ...(e.lgFee > 0 ? { lgFee: fromGbp(e.lgFee), lgApps: e.lgApps } : {}), ...(e.intFee > 0 ? { intFee: fromGbp(e.intFee), intApps: e.intApps } : {}),
      ...(e.pub ? { pub: e.pub as 1 | 2 } : {}), ...(e.loan && e.loanUntil ? { loanUntil: e.loanUntil, loanShare: (e.loanShare ?? 0) / 100 } : {}) };
    // 0x8be81e: build_bid's kontrakttilbud (+0x2f ≠ 0 – forkontrakt/Bosman, kontrakttype 1/3) får tilstand 7 UANSET sælgeren (0x8be857): et
    // menneske bliver aldrig spurgt (intet Respond) – han får kun nyheden 0x8d3090, og spilleren beslutter selv (0x4ce4e0, cmAiAiDue). Før blev
    // det et ventende bud på buddets +0x1b (oftest £0: "Swindon Town har budt £0", ejeren 24/11).
    const human7 = !!(p.club && isHumanClub(p.club) && e.free7 && e.k);
    if (p.club && isHumanClub(p.club) && !human7) {
      if (refusedBy(p, buyer.id)) continue;
      g.offers.push(o);
      asOwner(p.club, () => addNews({ cat: 'transfer', key: e.loan ? 'transfer.incomingLoan' : 'transfer.incomingBid', params: { club: buyer.name, player: pname(p), fee: o.fee }, link: { kind: 'offer', id: o.id } }));
      continue;
    }
    if (human7) o.cm7 = true;
    o.cmAi = true;
    o.respondBy = addDays(g.date, e.days ?? 0);
    // build_bid's tidsnibble +0x30 (0x8cee70) og kontraktens udløb – alle køb hos en klub (ikke kun forkontrakterne)
    // (også de klubløse: 0x8c3310 kører 0x8cee70 for alle bud med nibble ≠ 0)
    if (!e.loan && e.tm !== undefined) { o.cmTime = e.tm; if (e.until) o.cmUntil = e.until; }
    // (K7c #3) også en spiller med kontrakt hos en computerklub (forkontrakt/Bosman, 0x8be81e: +0x2f → tilstand 7) – ingen sælger svarer
    if (e.free7 && e.k && (!p.club || !isHumanClub(p.club) || human7)) {
      if (p.club) CM_AIAI.pre++;
      // build_bid 0x8e5d60 til en klubløs: buddet får tilstand 7 (0x8be857 – ingen accept_transfer_bid 0x8c0080, ingen vilje-kontrol), og
      // 0x84a75c tilbyder build_bid's kontrakt straks (add_contract_offer 0x4cc490). Beslutningen 0x4cd230: personens post (eksisterende,
      // ellers i dag + rand(5) + 1) trækkes frem til 0x8cc5b0's svartid, højst 14 dage; +0x2f: under 4 dage frem → i dag + rand(2) + 4.
      // Han beslutter sig for alle sine tilbud på postens dag (0x4ce4e0 – cmAiAiDue).
      CM_AIAI.free++;
      o.status = 'negotiating';
      o.cmK = e.k;
      const mine = g.offers.filter((x) => x.cmAi && x.player === p.id && x.status === 'negotiating' && x.cmK && !x.loan);
      const days = (iso: string) => Math.round((Date.parse(iso.slice(0, 10)) - Date.parse(g.date.slice(0, 10))) / 86400000);
      let v = mine.length ? Math.max(1, Math.min(...mine.map((x) => days(x.respondBy)))) : e.dd ?? 1;
      v = Math.min(v, Math.max(1, e.bl ?? v));
      if (v < 4) v = e.r4 ?? 4;
      if (v > 14) v = 14;
      o.respondBy = addDays(g.date, v);
      for (const x of mine) x.respondBy = o.respondBy;
    }
    if (human7) cm7News(o, p, buyer, e);
    // add_transfer_offer 0x8be300: køberens gamle (lukkede) bud på ham i tabellen fjernes (remove_offer 0x8d0f60), det nye tager pladsen
    if (g.cmTmKept?.length) g.cmTmKept = g.cmTmKept.filter((k) => k.buyer !== o.buyer || k.player !== o.player);
    g.offers.push(o);
  }
}
/** lejekontraktens tilbud (0x85e590: +0x35 = (… & 0xc6) | 6) – 0x4ce4e0 læser kun typen (6 → 0x846920) */
const LOAN_K: number[] = Array.from({ length: 0x50 }, (_, i) => (i === 0x35 ? 6 : 0));
/** kontrakttilbuddets trupstatus (+0x4f høj nibble – 0x85fc50) som Player.squadStatus; sign_contract 0x4cf720 giver den nye kontrakt den */
function offerStatus(o: TransferOffer): Player['squadStatus'] {
  const st = o.cmK && o.cmK !== LOAN_K ? (o.cmK[0x4f] >> 4) & 0xf : 0;
  return st >= 1 && st <= 7 ? SQUAD_STATUSES[st - 1] : undefined;
}
/** 0x8be8f5 → 0x8d3090 (nyheden type 0x3e til sælgeren, flag 2) med teksten 0x8d3520 for et kontrakttilbud (+0x2f ≠ 0) til en spiller med klub:
 *  overskriften "{Club} transfer bid for {Name}" (0xa8f578); brødteksten efter kontrakttypen (plads 0xf: 1/3 → "made an approach … on a free
 *  transfer" 0xa91668), ellers efter plads 0x12 og datoen (0xc/0xd): tidsnibble 5 → 0x8d0bb0's dato (i dag → plads 0x12 = 0: "current
 *  international transfer window" 0xa91794, ellers 5: "next … starting on" 0xa91870), ellers 3 med kontraktens udløb, når det ligger efter i dag
 *  ("join when his current contract expires on" 0xa91980; uden dato 0xa91708). Kompensationslinjen 0xa8f6ec, når +0x1b ≠ 0. */
function cm7News(o: TransferOffer, p: Player, buyer: Club, e: SlBid): void {
  const g = gs(), today = g.date.slice(0, 10);
  const seller = g.clubs[o.seller];
  let body = 'plain', date = '';
  if (e.ct === 1 || e.ct === 3) body = 'free';
  else if (e.tm === 5) { date = cmCompletionDate(g, o); body = date === today ? 'cur' : 'win'; }
  else if (e.exp && today < e.exp) { body = 'exp'; date = e.exp; }
  asOwner(o.seller, () => addNews({ cat: 'transfer', key: 'transfer.cm7', params: { club: buyer.name, from: seller?.name ?? '', player: pname(p), body, ...(date ? { date } : {}), ...(o.fee > 0 ? { fee: o.fee } : {}) },
    link: { kind: 'player', id: p.id } }));
}
/** målinger (fejlsøgning): computer → computer-svarene på ønskelisternes bud */
export const CM_AIAI = { delayed: 0, money: 0, declined: 0, noContract: 0, free: 0, freeRefused: 0, freeDone: 0, pre: 0, preFut: 0, preDone: 0, loan: 0, loanOk: 0, bid: 0, accept: 0, counter: 0, counterOk: 0, reject: 0, refused: 0, withdrawn: 0, follow: 0, review: 0, rebid: 0, rules: 0, done: 0, open: 0, openDays: 0 };
const cmOpen = (o: TransferOffer) => o.status === 'pending' || o.status === 'countered' || o.status === 'negotiating';
/** CM 01/02: menneskets lejebud til en computerklub. add_transfer_offer 0x8be300 giver svartiden 0x8cc5b0 (+ 0x8c6220, regnet første gang
 *  dagens behandling ser buddet, fra buddets dag); på svardagen process_due_offer 0x8c63a0 (tilstand 0, +0x1f = 1) →
 *  shortlist_manager_predict_selling_club_response 0x84af00(sælger, staff, 0, 0, køber, −1, −1, 1): 0 = ja → tilstand 8 og nyheden
 *  post_offer_accepted_news 0x8d76d0 ("<spiller> loan offer accepted"), så lejen; ellers reject_loan_offer 0x8bfa30 ("<spiller> loan bid
 *  rejected"). `cx` = dagens hukommelse (ønskelisterne kører); null = en hukommelse til lejligheden (cmLoanAnswerNow). Spillerens svar
 *  0x4cc930 (cmLoan.ts cmLoanRefuses) kommer straks efter: nej → "<spiller> rejects move to <klub>" (0x8d8310), ellers lejen. */
function cmHumanLoanDue(o: TransferOffer, cx: SlDueCtx | null) {
  const g = gs();
  const p = g.players[o.player];
  if (!p || p.club !== o.seller || p.loan || p.contract?.futureClub || isHumanClub(o.seller) || !g.clubs[o.buyer]) { o.status = 'withdrawn'; o.cmLoan = undefined; return; }
  if (o.cmLoan === 1) { o.cmLoan = 2; o.respondBy = addDays(o.created, cx ? cx.delay(p.id, o.buyer, 0x8be300, true) : cmLoanDelayNow(g, p.id, o.buyer)); }
  if (o.respondBy > g.date) return;
  o.cmLoan = undefined;
  const ans = cx ? cx.loanAnswer(p.id, o.buyer, o.seller) : cmLoanAnswerNow(g, p.id, o.buyer, o.seller);
  const params = { last: p.last || pname(p), player: pname(p), seller: g.clubs[o.seller]?.short ?? sellerName(o.seller), buyer: g.clubs[o.buyer]?.short ?? '' };
  if (ans === 0) {
    o.status = 'negotiating';
    asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmLoanAccepted', params, link: { kind: 'player', id: p.id } }));
    if (cmLoanRefuses(g, p, o.buyer)) { cmLoanRejectsMove(o, p); return; }
    if (!cx) { completeTransfer(o, p.contract?.wage ?? 0, 0); return; }
    // som computerens lejebud (0x8c6581): tilstand 8 – lejen sker først på spillerens beslutningsdag (0x4ce4e0) gennem 0x8c2180's lejegren
    o.cmLoanH = true;
    o.cmK = LOAN_K;
    o.respondBy = addDays(g.date, Math.min(cx.rand(p.id, o.buyer)(5) + 1, Math.max(1, cx.delay(p.id, o.buyer, 0x4cd230))));
  } else {
    o.status = 'rejected';
    asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmLoanRejected', params, link: { kind: 'player', id: p.id } }));
  }
}

/** 0x8e23d0(bud, grund): nyheden 0xfb7 "<spiller> loan cancelled" (overskriften 0x8e293a, brødteksten 0x8e2570 pr. grund) til menneskene i
 *  handlen (0x8d1130(bud, 0xf)); "{klub}'s <spiller>", når modtageren ikke styrer spillerens klub (0x8e2602) */
function cmLoanCancelled(o: TransferOffer, p: Player, why: number) {
  const g = gs();
  const KEY: Record<number, string> = { 4: 'squad', 9: 'deadline', 0x26: 'two', 0x1e: 'five', 0x25: 'four', 0x1d: 'comp', 0x1f: 'games' };
  const k = KEY[why];
  if (!k) return;
  const buyer = g.clubs[o.buyer];
  const comp = buyer ? g.comps[buyer.league]?.name ?? g.leagues[buyer.league]?.name ?? '' : '';
  for (const c of [o.buyer, o.seller]) if (c && isHumanClub(c)) asOwner(c, () => addNews({ cat: 'transfer', key: 'transfer.cmLoanCancelled',
    params: { player: pname(p), buyer: buyer?.name ?? '', club: g.clubs[p.club]?.name ?? '', body: c !== p.club && (why === 4 || why === 9) ? k + 'Club' : k, comp }, link: { kind: 'player', id: p.id } }));
}
/** handle_player_rejected_terms 0x8c28c0: spilleren valgte ikke menneskets lejekontrakt (0x4ce4e0) */
function cmLoanHumanRejected(o: TransferOffer, p: Player) {
  const g = gs();
  const params = { last: p.last || pname(p), player: pname(p), seller: g.clubs[o.seller]?.short ?? sellerName(o.seller), buyer: g.clubs[o.buyer]?.short ?? '' };
  asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmRejects', params, link: { kind: 'player', id: p.id } }));
}

/** 0x8d8310(bud, 0): spilleren siger nej til lejen – "<spiller> rejects move to <klub>" uden grunde til køberen og sælgeren (maske 0x2f), tilstand 0xf */
function cmLoanRejectsMove(o: TransferOffer, p: Player) {
  const g = gs();
  o.status = 'collapsed';
  const params = { last: p.last || pname(p), player: pname(p), seller: g.clubs[o.seller]?.short ?? sellerName(o.seller), buyer: g.clubs[o.buyer]?.short ?? '' };
  for (const c of [o.buyer, o.seller]) if (c && isHumanClub(c)) asOwner(c, () => addNews({ cat: 'transfer', key: 'transfer.cmRejectsMove', params, link: { kind: 'player', id: p.id } }));
}

/** TRANSFER_MANAGER: et lukket computer → computer-bud bliver i budtabellen med originalens tilstand (+0x2c) og runder (+0x2e), til dagen
 *  schedule_offer 0x8c6220 har sat (så remove_offer 0x8d0f60 i process_due_offer 0x8c63a0): afvist af sælgeren 0x8bf680 (2, 25 dage), lejebuddet
 *  afvist 0x8bfa30 (2, 10), trukket 0x8bfcb0 (3, 10), spilleren vil ikke 0x8c0080/0x8c28c0 og de andre bud ved en aftale (0x8c3310 →
 *  collapse_offers_for_player 0x8c47d0) – tilstand 0xf med +0x2e = 3 (computerkøber), 10 dage; faldet collapse_offer 0x8c44e0 (0x10, 20);
 *  gennemført finalise_transfer 0x8c9390 (0x14, 10). Tabellen (writeOffers) giver 0x8cdc90/0x8cde70/0x8c5cf0 rivallisterne og +0x86e-flaget. */
function cmTmClose(o: TransferOffer, st: number, days: number, status?: TransferOffer['status']): void {
  const g = gs();
  if (status) o.status = status;
  (g.cmTmKept ??= []).push({ id: o.id, buyer: o.buyer, player: o.player, seller: o.seller, fee: o.fee, ...(o.loan ? { loan: true as const } : {}), created: o.created,
    st, r: st === 0xf ? 3 : 0, until: addDays(g.date, days), ...(o.pub ? { pub: o.pub } : {}) });
}
/** confirm_offer_by_club 0x8c3310 → collapse_offers_for_player 0x8c47d0: de andre åbne bud på spilleren falder (0xf, 3, 10 dage) */
function cmTmCollapseOthers(o: TransferOffer): void {
  for (const x of gs().offers) if (x !== o && x.cmAi && x.player === o.player && cmOpen(x)) cmTmClose(x, 0xf, 10, 'collapsed');
}
/** TRANSFER_MANAGER::daily_update 0x8c5880 → process_due_offer 0x8c63a0 for computer → computer-buddene, hvis tid er kommet:
 *  tilstand 0 (pending): lejebud → 0x84af00 (0 = ja → lejen; ellers reject_loan_offer 0x8bfa30), køb → 0x8c8090 (aiRespond): accept → 0x8c0080
 *  (spillerens vilje 0x846920 med køberens trupstatus 0x849f00 under 0,75 → han siger nej 0x8d8310; ellers hans beslutning efter
 *  min(rand(5) + 1, 0x8cc5b0) dage – 0x4cd230), modbud → add_transfer_negotiation 0x8be9d0 (køberen svarer om 2 dage), afslag → 0x8bf680;
 *  tilstand 1 (countered): køberen 0x8c0810 (aiReview mod 0x840d80's værdisætning) → trækker buddet eller byder endeligt (0x8be300, ny svartid);
 *  accepteret: køberens kontrakt (0x8c1e40 → 0x4cda70; intet tilbud → buddet trækkes) og spillerens svar 0x4ce4e0 på beslutningsdagen, så handlen
 *  (0x8c9390; køberens trupplanstæller +8 = 100, 0x8c9720). Lejespillerens svar 0x4cc930 (cmLoanRefuses) kommer straks. */
/** accept_transfer_bid 0x8c0080 → (næste tidspunkt) process_due_offer tilstand 5 → offer_contract_to_offer_player 0x8c1e40: køberens kontrakt
 *  0x4cda70 → add_contract_offer 0x4cc490 (spilleren beslutter sig på respondBy, 0x4cd230); intet tilbud → withdraw_transfer_offer 0x8bfcb0 */
function cmAiOfferContract(o: TransferOffer, p: Player, cx: SlDueCtx): boolean {
  const k = cx.offerContract(p.id, o.buyer, o.id);
  if (!k) { CM_AIAI.noContract++; cmTmClose(o, 3, 10, 'withdrawn'); return false; }
  o.cmK = k;
  return true;
}
/** check_offer_restrictions 0x8cfc90's pengegren (@0x8cfe16–0x8cff65, fjerde argument 0) for computerens køber af buddet: transferbudgettet
 *  på dagen 0x5a0590 → 0x598800(staff, 0, 0, 0, 0) (negativt → 0; computerklubben: samme som Funds), Cash::step_up 0x43f4e0(4) X – og buddets
 *  get_total_value 0x8e7a70(0, 1, 1, 0) (beløb + klausuler, ikke byttespillere). Højst 1,1 · X ([0x9689c0]) → 0 (trupplads og regler følger).
 *  Ellers (grund 3): X + beløbet +0x1b af køberens åbne bud (0x8cdd80(staff, køber, 0) – 0x8c5cf0's åbne) på spillerne i hans ønskelistepar
 *  (0x8420e0: Shortlist_Manager +4/+0x14, efter klub) større end værdien → 1 (vent), ellers 2. Uden originalens økonomi: det gemte budget. */
function cmAiMoney(g: GameState, o: TransferOffer, buyer: Club): 0 | 1 | 2 {
  if (o.loan) return 0;
  const live = cmTransferBudget(g, buyer.id);
  const X = stepUp(Math.max(0, live ?? toK(buyer.transferBudget, buyer.id)), 1);
  const value = toK(o.fee, buyer.id) + toK(o.lgFee ?? 0, buyer.id) + toK(o.intFee ?? 0, buyer.id);
  if (value <= X * 1.1) return 0;
  let sum = X;
  const mine = new Set((g.cmSlPairs ?? []).filter(([, c]) => c === buyer.id).map(([pid]) => pid));
  for (const pid of mine) {
    let first: TransferOffer | undefined;
    for (const x of g.offers) if (x.player === pid && x.buyer === buyer.id && (cmOpen(x) || cmFutOpen(x)) && (!first || x.id < first.id)) first = x;
    if (first) sum += toK(first.fee, buyer.id);
  }
  return sum > value ? 1 : 2;
}
/** TRANSFER_MANAGER 0x8c36b0(bud, køber, 0) – try_complete_offer's svar 1 for computerens køber: +0x2e + 1, tilstand 0x12; ligger
 *  spillerens kontrakt hos et menneske, eller er +0x2e ≤ 1, kommer buddet igen om en uge (schedule_offer 0x8c6220(bud, 7, 0)); ellers
 *  rand(2·+0x2e) ≠ 0 → 0x8bf680 (afvist: 2, 25 dage) og 0 → en uge mere. true = buddet er lukket. */
function cmAiDelay(o: TransferOffer, p: Player, buyer: Club, cx: SlDueCtx): boolean {
  const g = gs();
  const r = (o.cmR = (o.cmR ?? 0) + 1);
  const human = !!o.seller && isHumanClub(o.seller);
  if (!human && r > 1 && cmRand(g.seed ?? 0, p.id, buyer.id, daysBetween('2000-01-01', g.date), 0x8c3803)(2 * r) !== 0) { cmTmClose(o, 2, 25, 'rejected'); return true; }
  o.cmDelay = true;
  o.status = 'pending';
  o.cmK = undefined;
  o.respondBy = addDays(g.date, cx.sched(7, 0));
  return false;
}
function cmAiAiDue(cx: SlDueCtx) {
  const g = gs();
  let closed = false;
  // process_due_offer 0x8c63a0: de lukkede bud, hvis dag er kommet, fjernes (remove_offer 0x8d0f60)
  if (g.cmTmKept?.length) g.cmTmKept = g.cmTmKept.filter((k) => k.until > g.date);
  for (const o of g.offers.slice()) if (o.cmLoan && o.status === 'pending') cmHumanLoanDue(o, cx);
  for (let o of g.offers.slice()) {
    if ((!o.cmAi && !o.cmLoanH) || !cmOpen(o) || o.respondBy > g.date) continue;
    const p = g.players[o.player];
    let buyer = g.clubs[o.buyer];
    const home = p ? p.loan?.from ?? p.club : 0;   // hovedkontraktens klub (en udlejet: moderklubben)
    // process_due_offer 0x8c63a0 (@0x8c63f1): buddet har ingen sælger – sælgeren er spillerens kontraktklub på dagen (get_contract 0x4cf5a0 →
    // kontrakten +4; ingen kontrakt eller prøvekontrakt +0x35 & 0x3f = 5 → ingen sælger, 0x8c6a42). Er han skiftet til en anden computerklub (eller
    // blevet klubløs), svarer den NYE klub (og handlen 0x8c9390 går til den); før blev buddet lukket (0xf). Et menneske som ny klub får buddet via
    // offersFollowPlayer (offerLive.ts); er køberen selv den nye klub, er buddet faldet (0x8c47d0).
    if (p && buyer && home !== o.seller && home !== buyer.id && !isHumanClub(home)) { o.seller = home; CM_AIAI.follow++; }
    if (!p || !buyer || home !== o.seller || (p.loan && o.loan) || p.contract?.futureClub || ((isHumanClub(home) || isHumanClub(p.club)) && !o.cm7) || (humanClub0(g, buyer.id) && !o.cmLoanH)) {
      // (han er skiftet: 0x8c47d0's 0xf; ellers trukket 0x8bfcb0)
      if (p && home !== o.seller) cmTmClose(o, 0xf, 10, 'withdrawn'); else cmTmClose(o, 3, 10, 'withdrawn');
      CM_AIAI.withdrawn++; closed = true; continue;
    }
    if (o.status === 'pending') {
      if (o.cmDelay) {
        // process_due_offer 0x8c63a0, tilstand 0x12 (@0x8c697a): tilstand 0, sælgerens svar 0x84af00 med buddets værdi 0x8e7b50(0,0,0,0,1) –
        // 0 → accept_transfer_bid 0x8c0080 (spillerens vilje og et nyt kontrakttilbud), 1–2 → 0x8bf680 (2, 25 dage), ellers står buddet i
        // tilstand 0 (0x8c8090 næste gang)
        o.cmDelay = undefined;
        const ans = cx.buyAnswer(p.id, buyer.id, o.seller, weightedValue(termsOf(o), valueCtx(g, p, buyer.id), false, false, false, true));
        if (ans === 1 || ans === 2) { cmTmClose(o, 2, 25, 'rejected'); closed = true; continue; }
        if (ans === 0) {
          if (cx.interest(p.id, buyer.id) < 0.75) { CM_AIAI.refused++; cmTmClose(o, 0xf, 10, 'collapsed'); closed = true; continue; }
          if (!cmAiOfferContract(o, p, cx)) { closed = true; continue; }
          o.status = 'negotiating';
          o.respondBy = addDays(g.date, Math.min(cx.rand(p.id, buyer.id)(5) + 1, Math.max(1, cx.delay(p.id, buyer.id, 0x4cd230))));
        }
        continue;
      }
      if (!o.seller) {
        // 0x8c63a0: tilstand 0 uden sælgerens kontrakt (klubløs) → 0x8c6a42 accept_transfer_bid 0x8c0080 direkte (ingen sælger svarer):
        // 0x8c01b8 job 0xb → viljen 0x846920 med køberens trupstatus 0x849f00 under 0,75 → nej (0x8d8310, tilstand 0xf); ellers tilstand 5 og
        // spillerens beslutning (0x4cd230) som ved et accepteret bud
        CM_AIAI.free++;
        if (cx.interest(p.id, buyer.id) < 0.75) { CM_AIAI.freeRefused++; cmTmClose(o, 0xf, 10, 'collapsed'); closed = true; continue; }
        if (!cmAiOfferContract(o, p, cx)) { closed = true; continue; }
        o.status = 'negotiating';
        o.respondBy = addDays(g.date, Math.min(cx.rand(p.id, buyer.id)(5) + 1, Math.max(1, cx.delay(p.id, buyer.id, 0x4cd230))));
        continue;
      }
      if (o.loan) {
        // process_due_offer 0x8c6538 (tilstand 0, +0x1f = 1): sælgerens svar 0x84af00; ja → CONTRACT_MANAGER 0x4cc930: lejekontraktens tilbud
        // (make_loan_offer 0x8bed60 → 0x85e590 type 6 → add_contract_offer 0x4cc490, job 0xb) får sin beslutningsdato (+0x62 = 1, 0x4cd230), og
        // svaret (omdømme/500 > lejeklubbens) → 0x8d8310 (tilstand 0xf); ellers tilstand 8 (0x8c6581). Lejen sker FØRST, når spilleren på
        // beslutningsdagen vælger lejekontrakten (0x4ce4e0 – 0x846920 ≥ 3,15, i konkurrence med hans andre tilbud) og 0x8c2180's lejegren
        // godkender den (truppen ≤ 50, køberlandets TRANSFER_RULES +0x20 – nu, ikke da buddet blev givet). Før skete lejen samme dag som svaret:
        // oraklet sæson 1 226 lejer af 330 lejebud (60 falder i 0x8c2180, 0x10), vi 278 af 294.
        CM_AIAI.loan++;
        if (cx.loanAnswer(p.id, buyer.id, o.seller) !== 0) { cmTmClose(o, 2, 10, 'rejected'); closed = true; continue; }
        if (cmLoanRefuses(g, p, buyer.id)) { cmLoanRejectsMove(o, p); cmTmClose(o, 0xf, 10); closed = true; continue; }
        o.status = 'negotiating';
        o.cmK = LOAN_K;
        o.respondBy = addDays(g.date, Math.min(cx.rand(p.id, buyer.id)(5) + 1, Math.max(1, cx.delay(p.id, buyer.id, 0x4cd230))));
        continue;
      }
      CM_AIAI.bid++;
      const c = valueCtx(g, p, buyer.id);
      const askS = cx.asking(p.id, buyer.id);
      // 0x8c8291: udbudsprisen 0x4d1600 i dagens hukommelse – den samme, køberens build_bid 0x8e6533 regnede i
      const asking = askS ?? cmAskingPrice(g, p, buyer.id) ?? toK(askingPrice(p), home);
      const rivals = g.offers.filter((x) => x !== o && x.player === p.id && x.status === 'pending' && !x.loan).map(termsOf);
      const t = termsOf(o);
      const r = aiRespond(t, c, { asking, rivals, unwanted: false, final: !!o.final, base: newTerms(g, p, buyer.id, 0), clause: clauseOptIn(g, p, buyer.id) });
      CM_AIAI[r.kind]++;
      if (r.kind === 'accept') {
        if (cx.interest(p.id, buyer.id) < 0.75) { CM_AIAI.refused++; cmTmClose(o, 0xf, 10, 'collapsed'); closed = true; continue; }
        if (!cmAiOfferContract(o, p, cx)) { closed = true; continue; }
        o.status = 'negotiating';
        o.respondBy = addDays(g.date, Math.min(cx.rand(p.id, buyer.id)(5) + 1, Math.max(1, cx.delay(p.id, buyer.id, 0x4cd230))));
      } else if (r.kind === 'counter') {
        o.status = 'countered';
        o.cmCounter = { ...r.terms, swap: [...r.terms.swap] };
        o.respondBy = addDays(g.date, 2);
      } else { cmTmClose(o, 2, 25, 'rejected'); closed = true; }
      continue;
    }
    if (o.status === 'countered') {
      CM_AIAI.review++;
      const t = o.cmCounter ?? termsOf(o);
      const c = valueCtx(g, p, buyer.id);
      const r = aiReview(t, c, toK(o.maxFee ?? o.fee, buyer.id), (id) => (g.players[id] ? toK(askingPrice(g.players[id]), g.players[id].club) : 0), toK(cmFundsNow(g, buyer.id), buyer.id));
      o.cmCounter = undefined;
      if (r.kind === 'withdraw') { cmTmClose(o, 3, 10, 'withdrawn'); closed = true; continue; }
      CM_AIAI.rebid++;
      putTerms(o, r.terms);
      o.final = true;
      o.status = 'pending';
      o.respondBy = addDays(g.date, cx.delay(p.id, buyer.id, 0x8c0810));
      continue;
    }
    // 0x4ce4e0 på beslutningsdagen: venter et andet bud på ham i tilstand 0/1/5/6 (0x8cd150), udsættes beslutningen 2 dage. Ellers gennemgår
    // han ALLE sine åbne kontrakttilbud (listen +0x34) og tager det bedste over 2,75 (0x4ce9xx: t > best, det første ved lighed); de andre
    // afvises – handle_player_rejected_terms 0x8c28c0 (tilstand 0xf). Før afgjorde det første forfaldne tilbud alene, om han skrev under.
    if (o.cmK) {
      if (g.offers.some((x) => x !== o && x.player === p.id && (x.status === 'pending' || x.status === 'countered' || (x.status === 'negotiating' && !x.cmK)))) { o.respondBy = addDays(g.date, 2); continue; }
      // (lejekontrakterne er med: tilbudslisten +0x34 har dem som alle andre – type 6 → 0x846920(staff, klub, 0, 1, 0x849f00, 0))
      // (menneskets lejekontrakt er med – cmLoanH)
      const cands = g.offers.filter((x) => (x.cmAi || x.cmLoanH) && x.player === p.id && x.status === 'negotiating' && x.cmK && !!g.clubs[x.buyer] && (!humanClub0(g, x.buyer) || x.cmLoanH));
      let best = 2.75, win: TransferOffer | null = null;
      for (const x of cands) { const t = cx.decide(p.id, x.buyer, x.cmK!); if (t > best) { best = t; win = x; } }
      for (const x of cands) if (x !== win) { CM_AIAI.declined++; cmTmClose(x, 0xf, 10, 'collapsed'); if (x.cmLoanH) cmLoanHumanRejected(x, p); }
      if (!win) { closed = true; continue; }
      o = win;
      buyer = g.clubs[o.buyer];
    }
    // handle_player_accepted_terms 0x8c2180, lejegrenen (+0x1f = 1, 0x8c23e6): 0x53c590(køber, 0, 0) + 1 > 50 → grund 4; ellers køberlandets
    // TRANSFER_RULES +0x20 (TM +0x8ac, nationen +0x53 – England 0x579d60: højst 5 lejer i sæsonen, 2 lejede i truppen, vinduet) → grund ≠ 0:
    // 0x8e23d0 og tilstand 0x10 (0x8c24ac, 20 dage). Ellers lejen (0x4d01e0) og tilstand 0x14 (0x8c27cd).
    if (o.loan) {
      const home = g.clubs[o.seller];
      const why = squad(buyer.id).filter((x) => !x.virtual).length + loanedOut(g, buyer.id).length + 1 > 50 ? 4 : cmLoanRules(buyer, home, p).why;
      if (why) { CM_AIAI.rules++; cmLoanCancelled(o, p, why); cmTmClose(o, 0x10, 20, 'collapsed'); closed = true; continue; }
      CM_AIAI.loanOk++;
      cmTmCollapseOthers(o);
      completeTransfer(o, p.contract?.wage ?? 0, 0);
      cmTmClose(o, 0x14, 10);
      closed = true;
      continue;
    }
    // (K7c #3) med sælger (køb og forkontrakt): handle_player_accepted_terms 0x8c2180 → advance_offer_to_club_approval 0x8c2f50 →
    // confirm_offer_by_club 0x8c3310: tidsnibblen ≠ 0 → get_offer_completion_date 0x8cee70 (cmOfferCheck.ts cmCompletionDate – 1/4: første dag
    // i købers vindue fra i dag/kontraktens udløb, 0x8cf0e0; 3: dagen efter udløbet; 5: 0x8d0bb0). Senere end i dag → de andre bud falder
    // (0x8c47d0) og add_future_transfer 0x8cb9a0 (tilstand 0x13): skiftet sker på datoen (0x8cbbe0 – cmFutureDue). Et køb i det lukkede
    // vindue (build_bid: 0x8ced40 grund 9 → nibble 1) gennemføres altså, når vinduet åbner – oraklets spids 4/6-02, 3/6-03, 1/6-04.
    // Klubløs (ingen sælger): 0x8c2f50's 0x8c3310(bud, 0) bekræfter for sælgeren (0x8c3367 → tilstand 0xe), så også hans aftale i det lukkede
    // vindue (nibble 1) bliver et fremtidigt skifte på vinduets første dag – 0x8cbbe0: 0x8c7690 og handlen 0x8c9390 (klubløs, art 0).
    if (o.cmK && o.cmTime) {
      const date = cmCompletionDate(g, o);
      if (date > g.date) {
        CM_AIAI.preFut++;
        // 0x8c3493 → 0x8e05d0: nyheden 0xfb3 til de involverede (modtagerflag 0x1e – sælgeren er med): "{Club} to sign {Name}" (0xa9bb9c)
        if (o.cm7) cmAgreedNews(o, p, buyer, date);
        cmTmCollapseOthers(o);
        o.status = 'accepted';
        o.cmFut = date;
        if (p.contract) p.contract.futureClub = buyer.id;
        closed = true;
        continue;
      }
    }
    // try_complete_offer 0x8c34e0: check_offer_restrictions 0x8cfc90 for køberen – først pengene (@0x8cfe16, cmAiMoney): svar 1 → 0x8c36b0
    // (udsæt), 2 → collapse_offer 0x8c44e0 (0x10, 20 dage). Før: køberens gemte transferbudget (−beløbet ved hvert køb) mod beløbet – ikke
    // 0x598800 på dagen, ikke 1,1 · step_up og ingen udsættelse (82 køb jul–dec faldt i 0x10 mod oraklets 2)
    const money = cmAiMoney(g, o, buyer);
    if (money === 1) { CM_AIAI.delayed++; if (cmAiDelay(o, p, buyer, cx)) closed = true; continue; }
    if (money === 2) { CM_AIAI.money++; cmTmClose(o, 0x10, 20, 'collapsed'); closed = true; continue; }
    // så reglerne for køberen og sælgeren – uden for vinduet (grund 9) falder handlen (0x8c44e0)
    if (cmAiRulesBlock(g, o)) { CM_AIAI.rules++; cmTmClose(o, 0x10, 20, 'collapsed'); closed = true; continue; }
    CM_AIAI.done++;
    cmTmCollapseOthers(o);
    if (!o.seller) {
      cmSignFree(o, p, buyer);
      closed = true;
      continue;
    }
    completeTransfer(o, wageDemand(p, buyer), preferredYears(p));
    cmTmClose(o, 0x14, 10);
    closed = true;
  }
  for (const o of g.offers) if (o.cmAi && cmOpen(o)) { CM_AIAI.open++; }
  CM_AIAI.openDays++;
  if (cmFutureDue()) closed = true;
  // de afsluttede computer → computer-bud fjernes (originalen: 0x8bf680 efter 25 dage; dropDeadBids ser kun de åbne)
  if (closed || g.offers.some((o) => o.cmAi && !cmOpen(o) && !cmFutOpen(o))) g.offers = g.offers.filter((o) => !o.cmAi || cmOpen(o) || cmFutOpen(o));
}
const cmFutOpen = (o: TransferOffer) => o.status === 'accepted' && !!o.cmFut;
/** klubløs skriver under hos computerklubben: computerklubbens kontrakt (0x4cda70/0x85fc50 – aiNewContract) og handlen 0x8c9390 */
function cmSignFree(o: TransferOffer, p: Player, buyer: Club): void {
  const g = gs();
  CM_AIAI.freeDone++;
  p.contract = aiNewContract(p, buyer, () => ({ wage: wageDemand(p, buyer), expires: `${year(g.date) + preferredYears(p)}-06-30` }));
  recordMove(p, buyer.id, 0);
  cmSlMoved(g, p, buyer.id, buyer.id);   // 0x8c9720/0x8c9390: ønskelisterne (før skiftet)
  setClub(p, buyer.id);
  p.squadStatus = offerStatus(o);   // sign_contract 0x4cf720: tilbuddets +0x4f
  movePlacement(g, p);   // 0x8ca7d9–0x8ca81f: staff +0x5e
  cmSlPlayerGone(g, p);
  p.joined = g.date;
  o.status = 'completed';
  cmTmClose(o, 0x14, 10);
  forEachHuman(() => { originalTransferNews(p, buyer, undefined, 0, false); });
}
/** Menneskets aftale med en klubløs med tidsnibble ≠ 0 (negotiate: 0x4e526b): 0x8c3310 → get_offer_completion_date 0x8cee70 senere end i dag →
 *  add_future_transfer 0x8cb9a0 (tilstand 0x13) – han skriver under på datoen (0x8cbbe0, cmHumanFreeDue). true = udskudt. */
function cmHumanFreeFuture(o: TransferOffer, wage: number, years: number, clauses?: ContractClauses): boolean {
  const g = gs();
  if (o.seller || o.loan || !o.cmTime || !cmMarketOn(g) || !isHumanClub(o.buyer)) return false;
  const date = cmCompletionDate(g, o);
  if (date <= g.date.slice(0, 10)) return false;
  o.status = 'accepted';
  o.cmFut = date;
  o.cmTalks = { ...(o.cmTalks ?? { rounds: 0 }), state: 5, agreed: { wage, years, clauses } };
  const p = g.players[o.player], buyer = g.clubs[o.buyer];
  if (p && buyer) cmAgreedNews(o, p, buyer, date);   // 0x8c3493 → 0x8e05d0
  return true;
}
/** process_due_future_transfers 0x8cbbe0 for menneskets aftalte klubløse og forkontrakter: på datoen kontrollen 0x8cfc90 (grund 9 tæller ikke) og handlen 0x8c38b0 */
function cmHumanFreeDue(): void {
  const g = gs();
  for (const o of g.offers.slice()) {
    if (o.cmAi || (o.seller && !o.preContract) || o.status !== 'accepted' || !o.cmFut || o.cmFut > g.date || !o.cmTalks?.agreed) continue;
    const p = g.players[o.player];
    // forkontrakten (0x8cbcce/0x8cbdc8): han skal stadig være i sælgerens klub (ellers 0x8c44e0)
    if (p?.contract?.futureClub === o.buyer) p.contract.futureClub = undefined;
    if (!p || (o.preContract ? p.club !== o.seller || !!p.loan : !!p.club) || !g.clubs[o.buyer] || cmAiRulesReason(g, o, true)) { o.status = 'collapsed'; continue; }
    o.status = 'negotiating';
    const a = o.cmTalks.agreed;
    if (!completeTransfer(o, a.wage, a.years, a.clauses) && o.status === 'negotiating') o.status = 'collapsed';
  }
}
/** TRANSFER_MANAGER::process_due_future_transfers 0x8cbbe0 (fra daily_update 0x8c5880 efter buddene): de aftalte skifter, hvis dato er kommet –
 *  arbejdstilladelsen (0x8c7690 – completeTransfer) og handlen 0x8c9390 (beløb 0, art 4 – 0x8c9996); buddet får tilstand 0x14 (10 dage).
 *  Er han ikke længere i sælgerens klub, eller er skiftet væk, falder buddet; ellers check_offer_restrictions 0x8cfc90 (grund 9 tæller ikke). */
function cmFutureDue(): boolean {
  const g = gs();
  let any = false;
  for (const o of g.offers.slice()) {
    if (!o.cmAi || !cmFutOpen(o) || o.cmFut! > g.date) continue;
    any = true;
    const p = g.players[o.player], buyer = g.clubs[o.buyer];
    if (p?.contract?.futureClub === o.buyer) p.contract.futureClub = undefined;
    if (!p || !buyer || p.club !== o.seller || p.loan || humanClub0(g, o.buyer)) { o.status = 'collapsed'; cmTmClose(o, 0x10, 20); continue; }
    // 0x8cbcce/0x8cbdc8: check_offer_restrictions 0x8cfc90 for køberen og kontraktens klub – svar ≠ 0 med en anden grund end 9 → 0x8c44e0
    // (pengene som i try_complete, cmAiMoney – 0x8cbbe0 lader både svar 1 og 2 vælte handlen)
    if (cmAiMoney(g, o, buyer) || cmAiRulesReason(g, o, true, false)) { CM_AIAI.rules++; o.status = 'collapsed'; cmTmClose(o, 0x10, 20); continue; }
    o.status = 'negotiating';
    CM_AIAI.preDone++;
    if (!o.seller) { cmSignFree(o, p, buyer); continue; }
    if (completeTransfer(o, wageDemand(p, buyer), preferredYears(p))) { o.status = 'completed'; cmTmClose(o, 0x14, 10); }
    else cmTmClose(o, 0x10, 20);
  }
  return any;
}
setSlDue(cmAiAiDue);
setSlApply(cmShortlistApply);

// ---------- frikøbsklausuler hos menneskestyrede klubber ----------

/**
 * Ugentligt i transfervinduet: AI-klubber aktiverer billige frikøbsklausuler hos menneskestyrede klubber.
 * Spilleren bestemmer selv, om han vil skifte.
 */
export function aiReleaseClauses() {
  const g = gs();
  if (cmShortlistOn(g)) return;   // ønskelisternes bud (build_bid 0x8e5d60) erstatter skønnet
  if (!cmMarketOn(g) && !windowOpen()) return;
  const clubs = Object.values(g.clubs).filter((c) => !isHumanClub(c.id) && c.balance > 0 && (!cmMarketOn(g) || windowOpen(g.date, c.id)));
  for (const p of Object.values(g.players)) {
    const rel = p.contract?.release;
    if (!rel || !p.club || !isHumanClub(p.club) || p.loan || p.contract?.futureClub) continue;
    const cur = g.clubs[p.club];
    // jo billigere klausulen er i forhold til værdien, jo mere fristende
    const bargain = p.value / rel;
    const chance = bargain >= 1.5 ? 0.35 : bargain >= 1 ? 0.18 : bargain >= 0.7 ? 0.06 : 0.015;
    if (!rng.chance(chance)) continue;
    const buyers = clubs.filter((c) => c.transferBudget >= rel && c.rep >= cur.rep - 5 && p.ca >= clubLevel(c.id) - 8 && playerInterest(p, c) === 'yes');
    if (!buyers.length) continue;
    const buyer = buyers.sort((a, b) => b.rep - a.rep)[Math.min(buyers.length - 1, rng.int(0, 2))];
    // spilleren vælger: større klub eller utilfreds → ja
    const keen = p.wantsAway || buyer.rep > cur.rep + 3 || (p.unhappy ?? 0) > 40 || (buyer.rep >= cur.rep - 5 && p.morale < 10);
    if (!keen) {
      asOwner(cur.id, () => addNews({ cat: 'transfer', key: 'clause.releaseDeclined', params: { player: pname(p), club: buyer.name, fee: rel }, link: { kind: 'player', id: p.id } }));
      continue;
    }
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer: buyer.id, seller: cur.id, fee: rel, loan: false, status: 'negotiating', created: g.date, respondBy: g.date };
    g.offers.push(o);
    asOwner(cur.id, () => addNews({ cat: 'transfer', key: 'clause.releaseTriggered', params: { player: pname(p), club: buyer.name, fee: rel }, link: { kind: 'player', id: p.id } }));
    completeTransfer(o, wageDemand(p, buyer), preferredYears(p));
  }
}

/** Mandag: ugens handler mellem andre klubber som én samlet nyhed (kun den aktive manager) */
export function weeklyTransferDigest() {
  const g = gs();
  const deals = g.transferDigest ?? [];
  g.transferDigest = [];
  if (!deals.length) return;
  deals.sort((a, b) => b.fee - a.fee);
  const top = deals[0];
  addNews({
    cat: 'transfer', key: deals.length === 1 ? 'transfer.digestOne' : 'transfer.digest',
    params: { n: deals.length, player: pname(g.players[top.player] ?? ({ first: '?', last: '' } as Player)), to: g.clubs[top.to]?.name ?? '', fee: top.fee },
    deals: deals.slice(0, 25),
  });
}

// ---------- lukkede budrunder mellem managere ----------

const AUCTION_DAYS = 3;

/** Et nyt bud møder et andet managers ventende bud på samme spiller: begge får besked og samme frist */
function startAuction(o: TransferOffer, p: Player) {
  const g = gs();
  const rivals = g.offers.filter((x) => x !== o && x.player === p.id && x.status === 'pending' && !x.loan && x.buyer !== o.buyer && isHumanClub(x.buyer));
  if (!rivals.length) return;
  const all = [o, ...rivals];
  const deadline = all.reduce((d, x) => (x.respondBy > d ? x.respondBy : d), addDays(g.date, AUCTION_DAYS));
  const newWar = rivals.every((x) => !x.auction);
  for (const x of all) {
    const fresh = !x.auction;
    x.auction = true;
    x.respondBy = deadline;
    if (fresh || x === o) asOwner(x.buyer, () => addNews({ cat: 'transfer', key: 'war.started', params: { player: pname(p), n: all.length, date: deadline, oid: x.id }, link: { kind: 'offer', id: x.id } }));
  }
  if (newWar) warHeadline(p, all.map((x) => x.buyer));
}

/** Pressen dækker budkrigen – alle managere ser overskriften */
function warHeadline(p: Player, clubs: number[]) {
  const g = gs();
  const [a, b] = clubs.map((c) => g.clubs[c]?.name ?? '');
  addNews({ cat: 'general', key: 'war.headline', params: { player: pname(p), a, b: b ?? '', n: clubs.length }, link: { kind: 'player', id: p.id } }, { all: true });
}

/** Afsløringen: alle deltagere ser begge bud – og alle managere får resultatet som overskrift */
function warReveal(p: Player, sorted: TransferOffer[], wage: boolean) {
  const g = gs();
  const [win, second] = sorted;
  const amount = (o: TransferOffer) => (wage ? o.signing?.wage ?? 0 : o.fee);
  const params = { player: pname(p), a: g.clubs[win.buyer]?.name ?? '', b: g.clubs[second.buyer]?.name ?? '', n: sorted.length, ...(wage ? { wage: amount(win), wage2: amount(second) } : { fee: amount(win), bid2: amount(second) }) };
  for (const o of sorted) asOwner(o.buyer, () => addNews({ cat: 'transfer', key: o === win ? (wage ? 'war.revealWonWage' : 'war.revealWon') : (wage ? 'war.revealLostWage' : 'war.revealLost'), params, link: { kind: 'player', id: p.id } }));
  addNews({ cat: 'general', key: 'war.result', params, link: { kind: 'player', id: p.id } }, { all: true });
}

/** Budkrig: hæv dit bud én gang – blindt, før fristen */
export function raiseBid(offerId: number, amount: number): string {
  const g = gs();
  const o = g.offers.find((x) => x.id === offerId);
  if (!o || o.buyer !== g.userClub || o.status !== 'pending' || !(o.auction || o.war) || o.raised) return 'error';
  const club = g.clubs[o.buyer];
  if (o.signing) {
    const w = Math.round(amount / 50) * 50;
    if (w <= o.signing.wage) return 'low';
    if (currentBill(club.id) + w > club.wageBudget) return 'budget';
    o.signing.wage = w;
  } else {
    const fee = roundValue(amount);
    if (fee <= o.fee) return 'low';
    if (fee > club.transferBudget) return 'transfer.overBudget';
    o.fee = fee;
  }
  o.raised = true;
  return 'ok';
}

/** Dagligt (før buddene behandles): afgør budrunder, hvor fristen er nået – højeste bud går videre */
export function resolveAuctions() {
  const g = gs();
  const byPlayer = new Map<number, TransferOffer[]>();
  for (const o of g.offers) if (o.auction && o.status === 'pending') byPlayer.set(o.player, [...(byPlayer.get(o.player) ?? []), o]);
  for (const [pid, list] of byPlayer) {
    if (!list.some((o) => g.date >= o.respondBy)) continue;
    const p = g.players[pid];
    if (!p) continue;
    if (list.length < 2) { list[0].auction = false; continue; }
    // transfersum + klausulernes værdi for sælger; ved lige bud vinder det først afgivne
    const value = (o: TransferOffer) => o.fee + bidClauseWorth(p, o.fee, o.sellOn, o.addOn);
    const sorted = list.slice().sort((a, b) => value(b) - value(a) || a.created.localeCompare(b.created) || a.id - b.id);
    const [win, ...lose] = sorted;
    win.respondBy = g.date;
    warReveal(p, sorted, false);
    asOwner(win.buyer, () => addNews({ cat: 'transfer', key: 'auction.won', params: { player: pname(p), n: list.length, club: sellerName(p.club) }, link: { kind: 'offer', id: win.id } }));
    for (const o of lose) {
      o.status = 'rejected';
      o.outbid = true;
      // taberen får besked via afsløringen (warReveal)
    }
  }
}

// ---------- klubbernes shortlister (interesse i spillere) ----------

const SHORTLIST_MAX = 8;

/** Den 1. i måneden: AI-klubber (og AI-managere) opdaterer deres shortliste ud fra behov og budget */
export function refreshShortlists() {
  const g = gs();
  for (const club of Object.values(g.clubs)) {
    if (!g.comps[club.league]) continue; // kun ligaer der spilles
    if (club.manager === -1 && !isBotClubId(club.id)) continue; // menneskers shortliste er deres egen
    const needs = analyzeNeeds(club.id);
    // de største behov + en rolle der skifter fra måned til måned (klubber scouter bredt)
    const extra = (['CB', 'CM', 'ST', 'W', 'FB', 'DM', 'AM', 'GK'] as Role[])[(club.id + month(g.date)) % 8];
    const roles = [...new Set([...needs.slice(0, 2).map((n) => n.role), extra])];
    const keep = (club.shortlist ?? []).filter((id) => { const p = g.players[id]; return p && p.club !== club.id && !p.contract?.futureClub; }).slice(0, 2);
    const picks = new Set(keep);
    // et tilfældigt udvalg blandt de 15 bedste mål – ellers ender alle klubber på de samme få spillere
    for (const role of roles) {
      const pool = rankTargets(club, role, true).slice(0, 25);
      for (let k = 0; k < 2 && pool.length && picks.size < SHORTLIST_MAX; k++) picks.add(pool.splice(rng.int(0, pool.length - 1), 1)[0].id);
    }
    // klubber der jagter en spiller efter et afslag har ham også på listen
    for (const x of g.pursuits ?? []) if (x.club === club.id && picks.size < SHORTLIST_MAX) picks.add(x.player);
    club.shortlist = [...picks];
  }
  noticeStandouts();
}

/**
 * Profilerne bliver bemærket: hver klubs bedste spillere og spillere i topform får interesse fra
 * 1-2 større klubber, der har råd og hvor spilleren passer ind (ellers ser alle kun på de samme få).
 */
function noticeStandouts() {
  const g = gs();
  const suitors = Object.values(g.clubs).filter((c) => g.comps[c.league] && (c.manager !== -1 || isBotClubId(c.id)));
  const levels = new Map(suitors.map((c) => [c.id, clubLevel(c.id)]));
  // tilfældig rækkefølge – ellers fylder de første klubbers spillere de store klubbers lister op
  const clubs = Object.values(g.clubs).filter((c) => g.comps[c.league]);
  for (let i = clubs.length - 1; i > 0; i--) { const j = rng.int(0, i); [clubs[i], clubs[j]] = [clubs[j], clubs[i]]; }
  for (const club of clubs) {
    const sq = squad(club.id).filter((p) => !p.loan && !p.contract?.futureClub && ageOn(p.dob, g.date) <= 31);
    const form = (p: Player) => (p.form.length >= 3 ? p.form.reduce((x, y) => x + y, 0) / p.form.length : 0);
    // de tre bedste + spillere i helt usædvanlig form – højst fire pr. klub
    const stars = [...new Set([...sq.sort((x, y) => y.ca - x.ca).slice(0, 3), ...sq.filter((p) => form(p) >= 7.6)])].slice(0, 4);
    for (const p of stars) {
      const price = askingPrice(p);
      // større klubber – og for de største klubber også jævnbyrdige rivaler
      const fits = suitors.filter((c) => c.id !== club.id && c.rep >= Math.min(club.rep + 5, Math.max(club.rep - 3, 75)) && c.transferBudget * 1.6 >= price
        && Math.abs((levels.get(c.id) ?? 0) - p.ca) <= 12 && (c.shortlist?.length ?? 0) < SHORTLIST_MAX + 8 && playerInterest(p, c) === 'yes');
      const n = Math.min(fits.length, rng.int(1, 3));
      for (let k = 0; k < n; k++) {
        const c = fits.splice(rng.int(0, fits.length - 1), 1)[0];
        if (!c.shortlist?.includes(p.id)) (c.shortlist ??= []).push(p.id);
      }
    }
  }
}

function isBotClubId(clubId: number): boolean {
  const g = gs();
  if (!g.humans) return false;
  if (g.userClub === clubId) return !!g.humans.find((h) => h.pid === g.active)?.bot;
  return !!g.humans.find((h) => h.pid !== g.active && h.userClub === clubId)?.bot;
}

export interface Interest { club: number; human?: string; bot?: boolean }

/** Hvilke klubber er interesserede i spilleren? (AI-klubbers shortlister + menneskers egne shortlister) */
export function interestedClubs(p: Player): Interest[] {
  const g = gs();
  const out: Interest[] = [];
  // den originale database i ægte tilstand, menneskets spiller: computerklubberne efter 0x842180 (cmTransferList.ts, *estimeret*)
  // nyt spil-forløbet (Take Control): klubben vises, som den bliver efter indlæsningen – før stod spillets egne ønskelister som røde Wnt-mærker,
  // der forsvandt, når spillet var indlæst (ejerens test 16/11)
  const cm = cmShortlistOn(g) || (cmMarketOn(g) && (isHumanClub(p.club) || inSetup()));
  if (cm) for (const id of cmShortlistOn(g) ? cmInterestedClubs(g, p) : cmInterested(g, p, clubLevel)) out.push({ club: id });
  for (const c of Object.values(g.clubs)) {
    if (c.id === p.club || cm) continue;
    if (c.shortlist?.includes(p.id)) out.push({ club: c.id, ...(isBotClubId(c.id) ? { bot: true } : {}) });
  }
  // menneskelige managere: deres egen shortliste (den aktive vises særskilt i UI'et)
  for (const h of g.humans ?? []) {
    if (h.bot || h.pid === g.active || !h.userClub || h.userClub === p.club) continue;
    if (h.shortlist.includes(p.id)) out.push({ club: h.userClub, human: h.name });
  }
  return out.sort((a, b) => (g.clubs[b.club]?.rep ?? 0) - (g.clubs[a.club]?.rep ?? 0));
}

// ---------- beskeder om transfervinduet ----------

/** Sidste dag i det vindue, der er åbent på datoen (eller null hvis lukket) */
export function windowLastDay(date = gs().date, club?: number): string | null {
  if (!windowOpen(date, club)) return null;
  let d = date;
  for (let i = 0; i < 400 && windowOpen(addDays(d, 1), club); i++) d = addDays(d, 1);
  return d;
}

/**
 * Dagligt: tydelige beskeder når vinduet åbner, en uge og 3/2/1 dage før det lukker, på deadline day
 * og når det er lukket – plus 1. januar, når Bosman-aftaler bliver mulige.
 */
export function windowNews() {
  const g = gs();
  // CM 01/02 har ingen af disse nyheder (transfervinduerne kom først i 2002) – kun i det udvidede spil
  if (cmMarketOn(g)) return;
  const today = g.date, yesterday = addDays(today, -1);
  const open = windowOpen(today), wasOpen = windowOpen(yesterday);
  if (open && !wasOpen) {
    addNews({ cat: 'transfer', key: 'window.opened', params: { date: windowLastDay(today) ?? today } });
  } else if (!open && wasOpen) {
    addNews({ cat: 'transfer', key: 'window.closed', params: { date: nextWindow(today) } });
  }
  if (open) {
    const last = windowLastDay(today)!;
    const left = Math.round((Date.parse(last) - Date.parse(today)) / 86_400_000);
    if (left === 0) addNews({ cat: 'transfer', key: 'window.deadlineDay', params: {} });
    else if ([7, 3, 2, 1].includes(left)) addNews({ cat: 'transfer', key: left === 1 ? 'window.closingTomorrow' : 'window.closing', params: { n: left, date: last } });
  }
  if (today.slice(5) === '01-01') addNews({ cat: 'transfer', key: 'window.bosman', params: { season: Number(today.slice(0, 4)) } });
}

/** Live-forhandling i budvinduet: AI-klubben svarer med det samme (ikke ved menneskelige sælgere eller budrunder) */
export function bidNow(offerId: number): TransferOffer['status'] | 'error' {
  const g = gs();
  const o = g.offers.find((x) => x.id === offerId);
  if (!o || o.buyer !== g.userClub || o.status !== 'pending' || isHumanClub(o.seller) || o.auction || o.war) return 'error';
  aiAnswerBid(o);
  return o.status;
}

/** Højst så mange bud i samme forhandling, før klubben afbryder */
export const MAX_BID_ROUNDS = 4;

/** Byd igen efter et modbud eller et nej (samme forhandling – klubben svarer med det samme) */
export function rebid(offerId: number, fee: number, clauses?: { sellOn?: number; addOn?: number }): TransferOffer['status'] | string {
  const g = gs();
  const o = g.offers.find((x) => x.id === offerId);
  if (!o || o.buyer !== g.userClub || !['countered', 'rejected'].includes(o.status) || isHumanClub(o.seller)) return 'error';
  if (o.nfs) return 'transfer.notForSale';
  const buyer = g.clubs[o.buyer];
  const amount = roundValue(fee);
  if (amount > buyer.transferBudget) return 'transfer.overBudget';
  o.bidRounds = (o.bidRounds ?? 1) + 1;
  if (o.bidRounds > MAX_BID_ROUNDS) {
    o.status = 'rejected';
    o.nfs = true;
    const p = g.players[o.player];
    addNews({ cat: 'transfer', key: 'transfer.talksOver', params: { player: p ? pname(p) : '', club: sellerName(o.seller) }, link: { kind: 'player', id: o.player } });
    return 'transfer.talksOver';
  }
  o.fee = amount;
  if (clauses) { o.sellOn = clauses.sellOn || undefined; o.addOn = clauses.addOn || undefined; }
  o.counter = undefined;
  o.status = 'pending';
  aiAnswerBid(o);
  return o.status;
}

/**
 * Tre måder at møde et modbud på: alt kontant, mindre kontant + bonus efter 25 kampe, eller mindre kontant + videresalg.
 * Hver pakke er beregnet, så sælgeren vurderer den til mindst deres krav.
 */
export function counterPackages(o: TransferOffer): { kind: 'cash' | 'addOn' | 'sellOn'; fee: number; addOn?: number; sellOn?: number; worth: number; maxCost: number }[] {
  const g = gs();
  const p = g.players[o.player];
  const target = o.counter ?? o.fee;
  if (!p) return [];
  const out: ReturnType<typeof counterPackages> = [{ kind: 'cash', fee: target, worth: target, maxCost: target }];
  const feeA = roundValue(target * 0.85);
  for (let addOn = roundValue((target - feeA) * 1.4); addOn <= target; addOn = roundValue(addOn * 1.15)) {
    const worth = feeA + bidClauseWorth(p, feeA, 0, addOn);
    if (worth >= target) { out.push({ kind: 'addOn', fee: feeA, addOn, worth, maxCost: feeA + addOn }); break; }
  }
  const feeS = roundValue(target * 0.88);
  for (const sellOn of [10, 15, 20, 25, 30, 35]) {
    const worth = feeS + bidClauseWorth(p, feeS, sellOn, 0);
    if (worth >= target) { out.push({ kind: 'sellOn', fee: feeS, sellOn, worth, maxCost: feeS }); break; }
  }
  return out;
}

/**
 * Kald en udlejet spiller hjem (CM 01/02: "Recall from loan" – loanRecallOn: CM-databaserne i ægte tilstand). Tidligst 28 dage efter
 * lejeaftalen (*estimeret*: originalens frist er ikke fundet). Lejeklubben får besked.
 */
export function recallLoan(pid: number): string {
  const g = gs();
  const p = g.players[pid];
  if (!p || !p.loan || p.loan.from !== g.userClub || !loanRecallOn()) return 'error';
  // (lejens start: flytningen til lejeklubben – Player.joined er moderklubbens dato med originalens marked, se completeTransfer)
  const since = [...(p.moves ?? [])].reverse().find((x) => x.loan && x.to === p.club)?.date ?? p.joined;
  if (since && daysBetween(since, g.date) < 28) return 'loan.recallTooSoon';
  const at = g.clubs[p.club];
  setClub(p, g.userClub);
  p.loan = null;
  if (!cmMarketOn(g)) p.joined = g.date;   // (end_loan 0x4d07e0 rører ikke staff +0x3e – se completeTransfer)
  addNews({ cat: 'transfer', key: 'loan.recalledNews', params: { player: pname(p), club: at?.name ?? '' }, link: { kind: 'player', id: p.id } });
  return 'loan.recalled';
}

/**
 * Transferlisten ved spilstart (som i CM 01/02, hvor listen ikke er tom på dag 1): hver AI-klub sætter 0-3 spillere til
 * salg – overtallige i store trupper, spillere langt under holdets niveau og ældre spillere uden for de 14 bedste.
 * Antallet er *estimeret*.
 */
export function initialTransferList() {
  const g = gs();
  // den originale database i ægte tilstand (og 2026/27 med trupplanen): spilstartens trupplan 0x83a1b0 → 0x83cb40 lister (cmSquadPlanGame.ts)
  if (cmMarketOn(g)) return;
  // egen generator: spillets fælles rng må ikke forskydes af åbningslisten
  const rng = new Rng(hash(g.seed, 4242));
  for (const c of Object.values(g.clubs)) {
    if (isHumanClub(c.id) || g.leagues[c.league]?.hidden) continue;
    const sq = squad(c.id).filter((p) => p.contract && !p.loan);
    if (sq.length < 16) continue;
    const level = clubLevel(c.id);
    const byCa = sq.slice().sort((a, b) => b.ca - a.ca);
    const top14 = new Set(byCa.slice(0, 14).map((p) => p.id));
    const cands = byCa.filter((p) => {
      const age = ageOn(p.dob, g.date);
      if (top14.has(p.id) || age < 21 || (age <= 23 && p.pa >= p.ca + 15)) return false;
      return p.ca < level - 25 || (age >= 31 && rng.chance(0.4)) || (sq.length > 28 && rng.chance(0.5));
    });
    const n = Math.min(3, cands.length, rng.chance(0.45) ? 0 : 1 + (sq.length > 30 && rng.chance(0.5) ? 1 : 0));
    for (const p of rng.shuffle(cands).slice(0, n)) p.listed = true;
  }
}

/** CM 01/02: læg et kontrakttilbud til en egen spiller frem – han svarer i morgen (nyhed) */
export function offerRenewalLater(pid: number, wage: number, years: number, clauses?: ContractClauses): 'pending' | 'refused' {
  const g = gs();
  // CM 01/02: en spiller med et aftalt skifte (Next club) forhandler ikke en ny kontrakt ("… does not wish to negotiate a new contract at the
  // current time", 0x9b0964 i Offer Contract 0x4e06e0) – kun i ægte tilstand
  if (origLogic() && g.players[pid]?.contract?.futureClub) return 'refused';
  (g.pendingRenewals ??= []).push({ pid, club: g.userClub, wage, years, clauses, date: g.date });
  return 'pending';
}

/** Dagligt: svar på gårsdagens kontrakttilbud (ja kommer som "has signed …", ellers et afslag med hans krav) */
export function answerPendingRenewals() {
  const g = gs();
  const due = (g.pendingRenewals ?? []).filter((r) => r.date < g.date);
  if (!due.length) return;
  g.pendingRenewals = (g.pendingRenewals ?? []).filter((r) => r.date >= g.date);
  for (const r of due) {
    const p = g.players[r.pid];
    if (!p || p.club !== r.club) continue;
    asOwner(r.club, () => {
      const res = renewContract(r.pid, r.wage, r.years, r.clauses);
      if (res === 'accepted') return; // renewContract skriver selv nyheden
      const club = g.clubs[r.club];
      addNews({ cat: 'contract', key: res === 'budget' ? 'contract.offerBudget' : 'contract.offerRejected', params: (() => { const d = humanRenewDemand(p, club); return { player: pname(p), wage: d.wage, years: d.years }; })(), link: { kind: 'player', id: p.id } });
    });
  }
}

/** CM 01/02: underskriftsbonussen spilleren beder om – ældre spillere og frie transfers vil have mere (*estimeret*) */
export function signOnDemand(p: Player, wage: number, free: boolean): number {
  const age = ageOn(p.dob, gs().date);
  const weeks = free ? 14 : age >= 30 ? 10 : 0;
  return Math.round(wage * weeks / 5_000) * 5_000;
}

// 0x4d8610's dele, som spillet selv har (cmPlayerData.ts handleTransferRequest): prisen (0x4d1600 er ikke porteret – vores udbudspris, *estimeret*)
// og menneskets nyhed 0xbbf (spillerens henvendelse om spilletid eller trivsel – will.ts)
setRequestHooks({
  asking: (p) => askingPrice(p),
  // menneskets klub: originalens nyhed 0xbbf "X requests move" med grundene og Respond (cmTransferList.ts – 0x4d87ff/0x4d8990/0x4dcd70)
  human: (p, c) => { const g = gs(); cmRequestNews(g, p, c, cmRand(g.seed ?? 0, p.id, daysBetween('2000-01-01', g.date), 0x4d8610)); },
  isHuman: (club) => isHumanClub(club),
});

/** CM 01/02 "Go on holiday": assistenten fylder huller i truppen (under 20 spillere eller under to målmænd) med frie agenter – højst én om ugen.
 *  `onlyShortlist` = kun spillere, managerens ønskeliste (`g.shortlist`) rummer. *Estimeret*: originalens assistent-køb (0x8f2ec0-kæden) er ikke afkodet. */
export function holidaySignings(onlyShortlist: boolean) {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club || !windowOpen(g.date, club.id) || new Date(`${g.date}T12:00:00Z`).getUTCDay() !== 1) return;
  const sq = squad(club.id);
  const needGk = sq.filter((p) => naturalRole(p) === 'GK').length < 2;
  if (sq.length >= 20 && !needGk) return;
  const level = clubLevel(club.id);
  const pool = onlyShortlist ? g.shortlist.map((id) => g.players[id]).filter(Boolean) : Object.values(g.players);
  const cand = pool.filter((p) => !p.club && p.ca >= 30 && p.ca <= level + 10 && p.ca >= level - 35 && (!needGk || naturalRole(p) === 'GK') && playerInterest(p, club) === 'yes')
    .sort((a, b) => b.ca - a.ca)[0];
  if (!cand) return;
  const wage = wageDemand(cand, club);
  if (currentBill(club.id) + wage > club.wageBudget) return;
  const o = makeBid(cand.id, 0);
  if (typeof o === 'string') return;
  completeTransfer(o, wage, preferredYears(cand));
}
