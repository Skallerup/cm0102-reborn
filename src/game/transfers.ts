// Transfers, kontrakter og AI-transfermarked (forbedring #7: behovsstyrede AI-klubber).
import { naturalRole } from './attributes';
import { addDays, ageOn, month, year } from './dates';
import { roundValue, wageFor } from './data/generate';
import { rulesFor } from './leagues';
import { rng } from './rng';
import { addNews, gs, setClub, squad } from './state';
import { clubLevel } from './scouting';
import type { Club, Player, Role, TransferOffer } from './types';
import { asOwner, forEachHuman, isHumanClub } from './humans';

export function windowOpen(date = gs().date): boolean {
  const m = month(date);
  return !(m === 4 || m === 5);
}

function sellerName(id: number) {
  return id ? gs().clubs[id]?.name ?? '?' : '-';
}
const pname = (p: Player) => `${p.first} ${p.last}`.trim();

// ---------- værdi og krav ----------

// Cache over truppernes CA-rækkefølge (nulstilles dagligt og ved transfers)
let rankCache = new Map<number, number[]>();
let rankCacheDate = '';

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
  else if (p.rep - club.rep > 15) bump(1, 'real.repGap', 10);
  if (p.loan || p.contract?.futureClub) bump(2, 'real.unavailable', 50);
  if (p.club) {
    const seller = g.clubs[p.club];
    const rank = keyPlayerRank(p);
    if (rank <= 2 && seller && seller.rep >= club.rep) bump(2, 'real.notForSale', 30);
    const price = askingPrice(p);
    if (price > club.transferBudget) bump(price > club.transferBudget * 1.5 ? 2 : 1, 'real.tooExpensive', 25 * Math.min(4, price / Math.max(1, club.transferBudget)));
    else score += 5 * (1 - price / Math.max(1, club.transferBudget));
    if (p.listed) { score += 8; reasons.push('real.listed'); }
    if (canPreContract(p)) { score += 6; reasons.push('real.bosman'); }
  } else {
    score += 6;
    reasons.push('real.free');
  }
  const bill = squad(club.id).reduce((s, x) => s + (x.contract?.wage ?? 0), 0);
  if (bill + wageDemand(p, club) > club.wageBudget * 1.02) bump(1, 'real.wages', 10);
  // Vil han få spilletid? Spillere langt over klubbens niveau er mere interesserede i store klubber
  score += Math.max(-10, Math.min(10, (club.rep - p.rep) / 3));
  return { level, score: Math.round(score * 10) / 10, reasons };
}

export function askingPrice(p: Player): number {
  const g = gs();
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
  return roundValue(Math.max(10_000, p.value * f));
}

export type SellerAnswer = 'accept' | 'counter' | 'reject' | 'notforsale';

export function sellerDecision(p: Player, fee: number, buyer: Club): { answer: SellerAnswer; counter?: number } {
  const g = gs();
  const seller = g.clubs[p.club];
  const ask = askingPrice(p);
  const rank = keyPlayerRank(p);
  if (seller && rank <= 2 && seller.rep >= buyer.rep && fee < ask * 1.6) return { answer: 'notforsale' };
  if (fee >= ask) return { answer: 'accept' };
  if (fee >= ask * 0.72) return { answer: 'counter', counter: ask };
  return { answer: 'reject' };
}

export function wageDemand(p: Player, club: Club): number {
  const g = gs();
  const wealth = rulesFor(club.league, 20).wealth;
  const market = wageFor(p.value, wealth);
  const current = p.contract?.wage ?? 0;
  const amb = 1 + (p.attrs[42 /* ambition */] - 10) / 60;
  const repGap = Math.max(0, p.rep - club.rep) / 100;
  let d = Math.max(market, current * 1.12) * amb * (1 + repGap);
  if (!p.club) d *= 0.9;
  if (p.club === club.id) d = Math.max(current * 1.05, market * 0.95) * amb;
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

/** Vil spilleren overhovedet tale med klubben? */
export function playerInterest(p: Player, club: Club): 'yes' | 'reputation' | 'happy' {
  const g = gs();
  if (p.club === club.id) return 'yes';
  const cur = p.club ? g.clubs[p.club] : undefined;
  const gap = p.rep - club.rep;
  if (gap > 28 + (p.attrs[41] - 10)) return 'reputation';
  if (cur && cur.rep > club.rep + 25 && keyPlayerRank(p) <= 11 && p.attrs[43] > 13) return 'happy';
  return 'yes';
}

// ---------- brugerens handlinger ----------

export function makeBid(pid: number, fee: number, loan = false): TransferOffer | string {
  const g = gs();
  const p = g.players[pid];
  const buyer = g.clubs[g.userClub];
  if (!p || !buyer) return 'error';
  if (!windowOpen()) return 'transfer.windowClosed';
  if (p.club === buyer.id) return 'error';
  if (!loan && fee > buyer.transferBudget) return 'transfer.overBudget';
  if (g.offers.some((o) => o.player === pid && o.buyer === buyer.id && ['pending', 'negotiating', 'countered'].includes(o.status))) return 'transfer.alreadyBidding';
  const humanSeller = isHumanClub(p.club);
  const o: TransferOffer = {
    id: g.nextId.offer++, player: pid, buyer: buyer.id, seller: p.club, fee: p.club ? fee : 0, loan,
    status: p.club ? 'pending' : 'negotiating', created: g.date, respondBy: addDays(g.date, !p.club ? 7 : humanSeller ? 5 : rng.int(1, 3)),
  };
  g.offers.push(o);
  if (humanSeller) {
    // Bud til en anden menneskelig manager
    asOwner(p.club, () => addNews({ cat: 'transfer', key: 'transfer.incomingBid', params: { club: buyer.name, player: pname(p), fee: o.fee }, link: { kind: 'offer', id: o.id } }));
  }
  return o;
}

/** Brugeren sælger: svar på et bud */
export function respondToOffer(id: number, action: 'accept' | 'reject' | 'counter', counter?: number) {
  const g = gs();
  const o = g.offers.find((x) => x.id === id);
  if (!o || o.status !== 'pending' || o.seller !== g.userClub) return;
  const p = g.players[o.player];
  const buyer = g.clubs[o.buyer];
  const myName = g.clubs[g.userClub]?.name ?? '';
  if (action === 'reject') {
    o.status = 'rejected';
    if (p && p.attrs[42] > 14 && keyPlayerRank(p) > 5) p.morale = Math.max(1, p.morale - 3);
    if (isHumanClub(buyer.id)) asOwner(buyer.id, () => addNews({ cat: 'transfer', key: 'transfer.bidRejected', params: { player: pname(p), club: myName }, link: { kind: 'player', id: p.id } }));
    return;
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
    // AI accepterer modbud hvis inden for rækkevidde
    if (counter <= o.fee * 1.25 && counter <= buyer.transferBudget) {
      o.fee = counter;
    } else {
      o.status = 'withdrawn';
      addNews({ cat: 'transfer', key: 'transfer.aiWithdrew', params: { club: buyer.name, player: pname(p) } });
      return;
    }
  }
  // AI forhandler med spilleren
  if (playerInterest(p, buyer) !== 'yes' && !o.loan) {
    o.status = 'collapsed';
    addNews({ cat: 'transfer', key: 'transfer.playerRefusedMove', params: { club: buyer.name, player: pname(p) } });
    return;
  }
  completeTransfer(o, wageDemand(p, buyer), preferredYears(p));
}

/** Kontraktforhandling: brugeren tilbyder løn og længde */
export function negotiate(offerId: number, wage: number, years: number): 'accepted' | 'counter' | 'refused' | 'budget' {
  const g = gs();
  const o = g.offers.find((x) => x.id === offerId);
  if (!o) return 'refused';
  const p = g.players[o.player];
  const club = g.clubs[o.buyer];
  const interest = playerInterest(p, club);
  if (interest !== 'yes') {
    o.status = 'collapsed';
    addNews({ cat: 'transfer', key: interest === 'reputation' ? 'transfer.refuseRep' : 'transfer.refuseHappy', params: { player: pname(p), club: club.name } });
    return 'refused';
  }
  const demand = wageDemand(p, club);
  const want = preferredYears(p);
  o.rounds = (o.rounds ?? 0) + 1;
  const yearsOk = Math.abs(years - want) <= (want >= 3 ? 2 : 1);
  if (club.id === g.userClub && currentBill(club.id) + wage > club.wageBudget) return 'budget';
  if (wage >= demand * 0.97 && yearsOk) {
    if (o.preContract) {
      p.contract = { ...(p.contract ?? { wage, expires: g.date }), futureClub: club.id, futureWage: wage, futureExpires: `${year(g.date) + years + (month(g.date) >= 7 ? 1 : 0)}-06-30` };
      o.status = 'completed';
      addNews({ cat: 'transfer', key: 'transfer.preContract', params: { player: pname(p), club: club.name }, link: { kind: 'player', id: p.id } });
      return 'accepted';
    }
    completeTransfer(o, wage, years);
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

function currentBill(clubId: number) {
  return squad(clubId).reduce((s, p) => s + (p.contract?.wage ?? 0), 0);
}

export function completeTransfer(o: TransferOffer, wage: number, years: number) {
  const g = gs();
  const p = g.players[o.player];
  const buyer = g.clubs[o.buyer];
  const seller = o.seller ? g.clubs[o.seller] : undefined;
  if (!p || !buyer) return;
  if (o.loan) {
    p.loan = { from: p.club, until: `${year(g.date) + (month(g.date) >= 7 ? 1 : 0)}-06-30` };
  } else {
    buyer.balance -= o.fee;
    buyer.transferBudget = Math.max(0, buyer.transferBudget - o.fee);
    buyer.finance.transfersOut += o.fee;
    if (seller) {
      seller.balance += o.fee;
      seller.finance.transfersIn += o.fee;
      seller.transferBudget += Math.round(o.fee * (isHumanClub(seller.id) ? 0.5 : 0.6));
    }
    const exp = `${year(g.date) + Math.max(1, years)}-06-30`;
    p.contract = { wage, expires: exp };
  }
  setClub(p, buyer.id);
  rankCacheDate = '';
  p.listed = false;
  p.joined = g.date;
  p.morale = Math.min(20, p.morale + 2);
  p.form = [];
  o.status = 'completed';
  asOwner(buyer.id, () => { g.knowledge[p.id] = 100; });
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
    if (involved || o.fee >= 15_000_000 || isUserLeague(buyer) || (seller && isUserLeague(seller))) addNews(news);
  });
}

function isUserLeague(c: Club) {
  const g = gs();
  const u = g.clubs[g.userClub];
  return !!u && c.league === u.league;
}

export function toggleListed(pid: number) {
  const p = gs().players[pid];
  if (p) p.listed = !p.listed;
}

export function releasePlayer(pid: number) {
  const g = gs();
  const p = g.players[pid];
  if (!p || p.club !== g.userClub) return;
  const club = g.clubs[p.club];
  if (p.contract) {
    const weeks = Math.max(0, Math.round((new Date(p.contract.expires).getTime() - new Date(g.date).getTime()) / (7 * 86400000)));
    const pay = Math.round(weeks * p.contract.wage * 0.5);
    club.balance -= pay;
    club.finance.other += pay;
  }
  setClub(p, 0);
  p.contract = null;
  p.listed = false;
  if (g.tactic) g.tactic = { ...g.tactic, lineup: g.tactic.lineup.map((id) => (id === pid ? 0 : id)), bench: g.tactic.bench.filter((id) => id !== pid) };
  addNews({ cat: 'contract', key: 'transfer.released', params: { player: pname(p) } });
}

/** Forlæng kontrakt for egen spiller – brugeren tilbyder løn/år */
export function renewContract(pid: number, wage: number, years: number): 'accepted' | 'counter' | 'refused' | 'budget' {
  const g = gs();
  const p = g.players[pid];
  const club = g.clubs[g.userClub];
  if (!p || !club || p.club !== club.id) return 'refused';
  if ((p.unhappy ?? 0) > 70 && p.attrs[43] < 10) return 'refused';
  const demand = wageDemand(p, club);
  if (currentBill(club.id) - (p.contract?.wage ?? 0) + wage > club.wageBudget) return 'budget';
  if (wage >= demand * 0.97) {
    const startYear = year(g.date) + (month(g.date) >= 7 ? 1 : 0);
    p.contract = { wage, expires: `${startYear + years - 1}-06-30` };
    p.morale = Math.min(20, p.morale + 2);
    addNews({ cat: 'contract', key: 'contract.renewed', params: { player: pname(p), years } });
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

export function startPreContract(pid: number): TransferOffer | string {
  const g = gs();
  const p = g.players[pid];
  if (!p || !canPreContract(p)) return 'error';
  const o: TransferOffer = { id: g.nextId.offer++, player: pid, buyer: g.userClub, seller: p.club, fee: 0, loan: false, status: 'negotiating', created: g.date, respondBy: addDays(g.date, 7), preContract: true };
  g.offers.push(o);
  return o;
}

// ---------- daglig behandling ----------

export function processOffers() {
  const g = gs();
  for (const o of g.offers) {
    if (o.status === 'pending' && o.buyer === g.userClub && isHumanClub(o.seller) && g.date > o.respondBy) {
      o.status = 'withdrawn'; // den anden manager svarede ikke
    } else if (o.status === 'pending' && o.buyer === g.userClub && !isHumanClub(o.seller) && g.date >= o.respondBy) {
      const p = g.players[o.player];
      const buyer = g.clubs[o.buyer];
      if (!p || p.club !== o.seller) { o.status = 'withdrawn'; continue; }
      if (o.loan) {
        const rank = keyPlayerRank(p);
        const age = ageOn(p.dob, g.date);
        if (rank > 13 && (age <= 24 || rank > 18)) {
          o.status = 'negotiating';
          addNews({ cat: 'transfer', key: 'transfer.loanAccepted', params: { player: pname(p), club: sellerName(o.seller) }, link: { kind: 'offer', id: o.id } });
          completeTransfer(o, p.contract?.wage ?? 0, 0);
        } else {
          o.status = 'rejected';
          addNews({ cat: 'transfer', key: 'transfer.loanRejected', params: { player: pname(p), club: sellerName(o.seller) } });
        }
        continue;
      }
      const d = sellerDecision(p, o.fee, buyer);
      if (d.answer === 'accept') {
        o.status = 'negotiating';
        o.respondBy = addDays(g.date, 10);
        addNews({ cat: 'transfer', key: 'transfer.bidAccepted', params: { player: pname(p), club: sellerName(o.seller), fee: o.fee }, link: { kind: 'offer', id: o.id } });
      } else if (d.answer === 'counter') {
        o.status = 'countered';
        o.counter = d.counter;
        addNews({ cat: 'transfer', key: 'transfer.bidCountered', params: { player: pname(p), club: sellerName(o.seller), fee: d.counter ?? 0 }, link: { kind: 'offer', id: o.id } });
      } else {
        o.status = 'rejected';
        addNews({ cat: 'transfer', key: d.answer === 'notforsale' ? 'transfer.notForSale' : 'transfer.bidRejected', params: { player: pname(p), club: sellerName(o.seller) }, link: { kind: 'player', id: p.id } });
      }
    } else if ((o.status === 'negotiating' || o.status === 'countered') && g.date > o.respondBy) {
      o.status = 'collapsed';
    } else if (o.status === 'pending' && o.seller === g.userClub && g.date > o.respondBy) {
      o.status = 'withdrawn';
    }
  }
  // ryd gamle tilbud
  if (g.offers.length > 120) g.offers = g.offers.filter((o) => ['pending', 'negotiating', 'countered'].includes(o.status) || o.created > addDays(g.date, -60));
}

/** Brugeren accepterer et modbud */
export function acceptCounter(id: number) {
  const g = gs();
  const o = g.offers.find((x) => x.id === id);
  if (!o || o.status !== 'countered' || !o.counter) return 'error';
  const buyer = g.clubs[o.buyer];
  if (o.counter > buyer.transferBudget) return 'transfer.overBudget';
  o.fee = o.counter;
  o.status = 'negotiating';
  o.respondBy = addDays(g.date, 10);
  return 'ok';
}

// ---------- AI-markedet ----------

const REQUIRED: Record<Role, number> = { GK: 2, CB: 4, FB: 3, DM: 2, CM: 3, WM: 1, W: 2, AM: 1, ST: 3 };
const GROUP: Record<Role, Role> = { GK: 'GK', CB: 'CB', FB: 'FB', DM: 'DM', CM: 'CM', WM: 'W', W: 'W', AM: 'AM', ST: 'ST' };

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
    if (best < level - 10) score += 1.5;
    if (list.length >= 2 && list[1].ca < level - 18) score += 0.6;
    if (score > 0) out.push({ role: r, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

let roleIndex: Map<Role, number[]> | null = null;
let roleIndexDate = '';

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

function findTarget(club: Club, role: Role): Player | null {
  const g = gs();
  if (!roleIndex || g.date > addDays(roleIndexDate, 14)) buildRoleIndex();
  const ids = roleIndex!.get(role) ?? [];
  const level = clubLevel(club.id);
  const lo = level - 6, hi = level + 18;
  const cands: Player[] = [];
  // binær søgning på CA
  let a = 0, b = ids.length;
  while (a < b) { const m = (a + b) >> 1; if ((g.players[ids[m]]?.ca ?? 0) < lo) a = m + 1; else b = m; }
  for (let i = a; i < ids.length && cands.length < 60; i++) {
    const p = g.players[ids[i]];
    if (!p) continue;
    if (p.ca > hi) break;
    if (p.club === club.id || p.loan || p.contract?.futureClub) continue;
    const age = ageOn(p.dob, g.date);
    if (age > 31) continue;
    const price = p.club ? askingPrice(p) : 0;
    if (price > club.transferBudget * 1.05) continue;
    if (playerInterest(p, club) !== 'yes') continue;
    cands.push(p);
  }
  if (!cands.length) return null;
  const budget = Math.max(1, club.transferBudget);
  const score = (p: Player) => p.ca - level - (p.club ? askingPrice(p) / budget : 0) * 6 + (ageOn(p.dob, g.date) <= 24 ? 2 : 0);
  cands.sort((x, y) => score(y) - score(x));
  return rng.pick(cands.slice(0, 8));
}

export function aiTransferTick() {
  const g = gs();
  if (!windowOpen()) return;
  const m = month(g.date);
  const rate = m === 7 || m === 8 ? 1 / 5 : m === 1 ? 1 / 9 : m === 6 ? 1 / 12 : 1 / 60;
  const clubs = Object.values(g.clubs);
  const n = Math.max(1, Math.round(clubs.length * rate));
  for (let i = 0; i < n; i++) {
    const club = rng.pick(clubs);
    if (!club || isHumanClub(club.id)) continue;
    aiClubTurn(club);
  }
}

function aiClubTurn(club: Club) {
  const g = gs();
  const sq = squad(club.id);
  // Sælg/frigiv overskud
  if (sq.length > 34) {
    const old = sq.filter((p) => p.contract && !p.loan).sort((a, b) => a.ca - b.ca)[0];
    if (old) { setClub(old, 0); old.contract = null; }
    return;
  }
  if (sq.length > 30) {
    const surplus = sq.sort((a, b) => a.ca - b.ca).slice(0, 3);
    for (const p of surplus) p.listed = true;
  }
  const needs = analyzeNeeds(club.id);
  if (sq.length >= 33) return;
  if (!needs.length) {
    // ingen akutte behov: forsøg at forstærke en tilfældig rolle i ny og næ
    if (!rng.chance(0.25)) return;
    needs.push({ role: rng.pick(['CB', 'CM', 'ST', 'W', 'FB'] as Role[]), score: 0.5 });
  }
  const need = needs[0];
  const target = findTarget(club, need.role);
  if (!target) return;
  if (!target.club) {
    // fri agent
    const wage = wageDemand(target, club);
    target.contract = { wage, expires: `${year(g.date) + preferredYears(target)}-06-30` };
    setClub(target, club.id);
    target.joined = g.date;
    if (isUserLeague(club)) addNews({ cat: 'transfer', key: 'transfer.freeDone', params: { player: pname(target), from: '-', to: club.name, fee: 0 }, link: { kind: 'player', id: target.id } });
    return;
  }
  const ask = askingPrice(target);
  const fee = roundValue(ask * rng.range(0.85, 1.1));
  if (isHumanClub(target.club)) {
    // bud til en menneskelig manager
    if (g.offers.some((o) => o.player === target.id && o.status === 'pending')) return;
    const o: TransferOffer = { id: g.nextId.offer++, player: target.id, buyer: club.id, seller: target.club, fee, loan: false, status: 'pending', created: g.date, respondBy: addDays(g.date, 5) };
    g.offers.push(o);
    asOwner(target.club, () => addNews({ cat: 'transfer', key: 'transfer.incomingBid', params: { club: club.name, player: pname(target), fee }, link: { kind: 'offer', id: o.id } }));
    return;
  }
  const d = sellerDecision(target, fee, club);
  if (d.answer === 'accept' || (d.answer === 'counter' && d.counter! <= club.transferBudget && rng.chance(0.6))) {
    const o: TransferOffer = { id: g.nextId.offer++, player: target.id, buyer: club.id, seller: target.club, fee: d.answer === 'accept' ? fee : d.counter!, loan: false, status: 'negotiating', created: g.date, respondBy: g.date };
    completeTransfer(o, wageDemand(target, club), preferredYears(target));
  }
}

/** AI fornyer kontrakter for spillere den vil beholde (januar-maj) */
export function aiRenewals() {
  const g = gs();
  const seasonEnd = `${year(g.date)}-06-30`;
  for (const p of Object.values(g.players)) {
    if (!p.club || isHumanClub(p.club) || !p.contract || p.loan) continue;
    if (p.contract.expires > seasonEnd || p.contract.futureClub) continue;
    if (rng.chance(0.25)) {
      const level = clubLevel(p.club);
      const age = ageOn(p.dob, g.date);
      if ((p.ca >= level - 12 && age <= 32) || (age <= 23 && p.pa >= level)) {
        const club = g.clubs[p.club];
        p.contract = { wage: wageDemand(p, club), expires: `${year(g.date) + preferredYears(p)}-06-30` };
      }
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
  for (const p of squad(g.userClub)) {
    if (!canPreContractAny(p) || p.contract!.futureClub) continue;
    if (!rng.chance(0.02)) continue;
    const suitors = Object.values(g.clubs).filter((c) => !isHumanClub(c.id) && c.rep >= p.rep - 15 && c.rep <= p.rep + 25);
    const c = rng.pick(suitors);
    if (!c) continue;
    p.contract!.futureClub = c.id;
    p.contract!.futureWage = wageDemand(p, c);
    p.contract!.futureExpires = `${year(g.date) + preferredYears(p)}-06-30`;
    addNews({ cat: 'contract', key: 'contract.leavingBosman', params: { player: pname(p), club: c.name }, link: { kind: 'player', id: p.id } });
  }
}

function canPreContractAny(p: Player) {
  const g = gs();
  if (!p.contract) return false;
  const m = month(g.date);
  return p.contract.expires <= `${year(g.date)}-06-30` && m >= 1 && m <= 5;
}

/** Udlej en af brugerens spillere til en klub hvor han får spilletid */
export function loanOut(pid: number): string {
  const g = gs();
  const p = g.players[pid];
  if (!p || p.club !== g.userClub || p.loan) return 'error';
  if (!windowOpen()) return 'transfer.windowClosed';
  const me = g.clubs[g.userClub];
  const cands = Object.values(g.clubs)
    .filter((c) => c.id !== me.id && c.rep < me.rep && c.rep >= me.rep - 35 && clubLevel(c.id) <= p.ca + 8)
    .sort((a, b) => b.rep - a.rep);
  const club = cands.slice(0, 12)[rng.int(0, Math.min(11, Math.max(0, cands.length - 1)))];
  if (!club) return 'transfer.noLoanClub';
  const o: TransferOffer = { id: g.nextId.offer++, player: pid, buyer: club.id, seller: me.id, fee: 0, loan: true, status: 'negotiating', created: g.date, respondBy: g.date };
  g.offers.push(o);
  completeTransfer(o, p.contract?.wage ?? 0, 0);
  return 'ok';
}
