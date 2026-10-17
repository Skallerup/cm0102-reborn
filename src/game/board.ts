// Bestyrelse, forventninger, fyringer og jobmarked.
import { finalOrder, sortTable } from './competitions';
import { rng } from './rng';
import { addDays, daysBetween } from './dates';
import { rulesFor, regionOf, type Region } from './leagues';

function rulesForLeague(league: string) {
  return rulesFor(league, 20).wealth;
}
import { addNews, gs, newsRelevant, squad } from './state';
import { careerEnd, careerStart, pickManager } from './careers';
import type { Club } from './types';
import { takeOverClub } from './newgame';
import { forEachHuman } from './humans';

export function squadStrength(clubId: number): number {
  const ps = squad(clubId).map((p) => p.ca).sort((a, b) => b - a).slice(0, 16);
  return ps.length ? ps.reduce((s, v) => s + v, 0) / ps.length : 0;
}

/** Placering i ligaen efter truppens styrke (1 = bedst) */
export function strengthRank(club: Club): { rank: number; size: number } {
  const g = gs();
  const rivals = Object.values(g.clubs).filter((c) => c.league === club.league);
  const sorted = rivals.map((c) => [c.id, squadStrength(c.id) + c.rep * 0.15] as const).sort((a, b) => b[1] - a[1]);
  return { rank: sorted.findIndex((x) => x[0] === club.id) + 1, size: rivals.length };
}

export function setBoardExpectation() {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return;
  const { rank, size } = strengthRank(club);
  const tier = g.leagues[club.league]?.tier ?? 1;
  let exp: string;
  let pos: number;
  if (tier === 2) {
    if (rank <= 2) { exp = 'promotion'; pos = 2; }
    else if (rank <= 6) { exp = 'playoffs'; pos = 6; }
    else if (rank <= size - 5) { exp = 'mid'; pos = Math.ceil(size * 0.6); }
    else { exp = 'survive'; pos = size - 3; }
  } else if (rank === 1) { exp = 'title'; pos = 1; }
  else if (rank <= 3) { exp = 'top3'; pos = 3; }
  else if (rank <= Math.floor(size / 2)) { exp = 'tophalf'; pos = Math.floor(size / 2); }
  else if (rank <= size - 4) { exp = 'mid'; pos = size - 4; }
  else { exp = 'survive'; pos = size - 3; }
  g.board.expectation = exp;
  g.board.expectedPos = pos;
  addNews({ cat: 'board', key: `board.exp.${exp}`, params: { club: club.name } });
}

/** Efter hver kamp for brugerens hold */
export function boardAfterMatch(scored: number, conceded: number, oppClub: number, compType: string) {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return;
  const diff = (squadStrength(club.id) - squadStrength(oppClub)) / 12;
  const expected = Math.max(0.3, Math.min(2.6, 1.35 + diff));
  const pts = scored > conceded ? 3 : scored === conceded ? 1 : 0;
  const weight = compType === 'league' ? 1.6 : compType === 'continental' ? 1.2 : 0.8;
  g.board.confidence = clamp(g.board.confidence + (pts - expected) * weight, 0, 100);
  boardMatchComment(scored, conceded, oppClub, compType, diff);
}

/** Af og til siger bestyrelsen sin mening om en bestemt kamp */
function boardMatchComment(scored: number, conceded: number, oppClub: number, compType: string, diff: number) {
  const g = gs();
  const opp = g.clubs[oppClub];
  if (!opp) return;
  // højst én kommentar hver 10. dag
  if (g.board.lastComment && g.board.lastComment > addDays(g.date, -10)) return;
  const margin = scored - conceded;
  const strongerOpp = diff < -0.6; // modstanderen er klart bedre
  const weakerOpp = diff > 0.6;
  let key: string | null = null;
  let p = 0;
  if (margin > 0 && strongerOpp) { key = 'board.c.upsetWin'; p = 0.8; }
  else if (margin >= 4) { key = 'board.c.thrashing'; p = 0.6; }
  else if (margin > 0 && compType === 'continental') { key = 'board.c.europeWin'; p = 0.45; }
  else if (margin < 0 && weakerOpp && compType === 'cup') { key = 'board.c.cupShock'; p = 0.85; }
  else if (margin <= -4) { key = 'board.c.humiliation'; p = 0.75; }
  else if (margin < 0 && weakerOpp) { key = 'board.c.badLoss'; p = 0.5; }
  else if (margin === 0 && weakerOpp && compType === 'league') { key = 'board.c.dropped'; p = 0.15; }
  else if (margin > 0 && compType === 'league' && g.board.expectation === 'survive') { key = 'board.c.survivalWin'; p = 0.15; }
  else if (margin >= 2 && !weakerOpp) { key = 'board.c.goodWin'; p = 0.3; }
  // rækker i ligaen
  if (!key && compType === 'league') {
    const form = g.comps[g.clubs[g.userClub]?.league]?.table.find((r) => r.club === g.userClub)?.form ?? '';
    if (form.length >= 5 && /^W{5}$/.test(form.slice(-5))) { key = 'board.c.winStreak'; p = 0.7; }
    else if (form.length >= 4 && /^L{4}$/.test(form.slice(-4))) { key = 'board.c.lossStreak'; p = 0.8; }
    else if (form.length >= 5 && !form.slice(-5).includes('W') && g.board.expectation !== 'survive') { key = 'board.c.noWins'; p = 0.6; }
  }
  if (!key || !rng.chance(p)) return;
  g.board.lastComment = g.date;
  addNews({ cat: 'board', key, params: { opp: opp.name, score: `${scored}-${conceded}` } });
}

/** Månedlig vurdering */
export function boardMonthly() {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return;
  const comp = g.comps[club.league];
  if (!comp) return;
  const played = comp.table.find((r) => r.club === club.id)?.p ?? 0;
  if (played < 6) return;
  const pos = sortTable(comp.table.slice()).findIndex((r) => r.club === club.id) + 1;
  const delta = (g.board.expectedPos - pos) * 0.8;
  g.board.confidence = clamp(g.board.confidence + delta, 0, 100);
  if (club.balance < -5_000_000) g.board.confidence = clamp(g.board.confidence - 3, 0, 100);
  // bestyrelsen lytter til fansene
  g.board.confidence = clamp(g.board.confidence + ((club.fanMood ?? 60) - 60) / 40, 0, 100);
  if (g.challenge) return; // udfordringer: ingen fyring undervejs
  if (g.board.confidence < 25 && g.board.warnings < 2) {
    g.board.warnings++;
    addNews({ cat: 'board', key: 'board.warning', params: { club: club.name } });
  } else if (g.board.confidence < 12 && g.board.warnings >= 2 && played >= 10) {
    sackUser('board.sacked');
  }
}

export function sackUser(key: string) {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return;
  addNews({ cat: 'job', key, params: { club: club.name } });
  g.manager.sacked++;
  g.manager.sackedBy = [...(g.manager.sackedBy ?? []), club.id].slice(-10);
  g.manager.rep = clamp(g.manager.rep - 8, 1, 100);
  club.manager = 0;
  openVacancy(club.id);
  g.userClub = 0;
  g.tactic = null;
  g.pendingFixture = null;
}

/** Sæsonafslutning: bestyrelsens dom */
export function boardSeasonEnd(): 'sacked' | 'ok' | 'great' {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return 'ok';
  const comp = g.comps[club.league];
  const order = comp ? finalOrder(comp) : [];
  const pos = order.indexOf(club.id) + 1;
  const diff = g.board.expectedPos - pos;
  g.manager.history.push({ season: g.season, club: club.id, league: club.league, pos });
  g.manager.rep = clamp(g.manager.rep + diff * 1.5 + (pos === 1 ? 8 : 0), 1, 100);
  if (!g.challenge && diff <= -6 && g.board.confidence < 40) {
    sackUser('board.sackedSeason');
    return 'sacked';
  }
  g.board.warnings = 0;
  g.board.confidence = clamp(55 + diff * 4, 20, 95);
  if (diff >= 3) {
    club.transferBudget = Math.round(club.transferBudget * 1.25);
    addNews({ cat: 'board', key: 'board.delighted', params: { club: club.name } });
    return 'great';
  }
  addNews({ cat: 'board', key: diff >= 0 ? 'board.satisfied' : 'board.disappointed', params: { club: club.name } });
  return 'ok';
}

export type BudgetKind = 'transfer' | 'wage';

/**
 * Hvor meget vil bestyrelsen give? Bestemt af tillid, økonomi, resultater og fansenes humør –
 * ikke af tilfældigheder. Returnerer maks. stigning (andel af nuværende budget) og begrundelser.
 */
export function budgetLimits(kind: BudgetKind): { max: number; reasons: string[] } {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return { max: 0, reasons: [] };
  const reasons: string[] = [];
  const conf = g.board.confidence;
  let max = kind === 'wage'
    ? (conf >= 80 ? 0.22 : conf >= 65 ? 0.15 : conf >= 50 ? 0.09 : conf >= 35 ? 0.04 : 0)
    : (conf >= 80 ? 0.6 : conf >= 65 ? 0.4 : conf >= 50 ? 0.22 : conf >= 35 ? 0.1 : 0);
  if (conf >= 65) reasons.push('budget.r.trust'); else if (conf < 50) reasons.push('budget.r.lowTrust');
  // resultater i forhold til forventningen
  const comp = g.comps[club.league];
  const played = comp?.table.find((r) => r.club === club.id)?.p ?? 0;
  if (comp && played >= 5) {
    const pos = sortTable(comp.table.slice()).findIndex((r) => r.club === club.id) + 1;
    const diff = g.board.expectedPos - pos;
    if (diff >= 2) { max *= 1.25; reasons.push('budget.r.results'); }
    else if (diff <= -3) { max *= 0.6; reasons.push('budget.r.poorResults'); }
  }
  if ((club.fanMood ?? 60) >= 72) { max *= 1.1; reasons.push('budget.r.fans'); }
  // økonomien: kan klubben bære det?
  if (club.balance < 0) { max = 0; reasons.push('budget.r.debt'); }
  else if (kind === 'wage') {
    // en lønstigning skal kunne betales i mindst to sæsoner af den nuværende formue
    const affordable = club.balance / Math.max(1, club.wageBudget * 52 * 2);
    if (affordable < max) { max = Math.max(0, affordable); reasons.push('budget.r.finances'); }
  } else {
    const affordable = (club.balance * 0.7 - club.transferBudget) / Math.max(1, club.transferBudget);
    if (affordable < max) { max = Math.max(0, affordable); reasons.push('budget.r.finances'); }
  }
  if (club.ffp?.sanction) { max = Math.min(max, 0.03); reasons.push('budget.r.ffp'); }
  return { max: Math.floor(Math.min(kind === 'wage' ? 0.3 : 0.8, max) * 100) / 100, reasons };
}

/** Bestyrelsens humør over for en anmodning (vises før man spørger – uden at afsløre tallet) */
export function boardMood(kind: BudgetKind): 'open' | 'cautious' | 'closed' {
  const m = budgetLimits(kind).max;
  return m >= (kind === 'wage' ? 0.1 : 0.25) ? 'open' : m >= 0.03 ? 'cautious' : 'closed';
}

function grant(kind: BudgetKind, pct: number) {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (kind === 'transfer') club.transferBudget = Math.round((club.transferBudget * (1 + pct)) / 50_000) * 50_000;
  else club.wageBudget = Math.round((club.wageBudget * (1 + pct)) / 100) * 100;
  // store ønsker koster lidt tillid – bestyrelsen forventer resultater til gengæld
  g.board.confidence = clamp(g.board.confidence - pct * (kind === 'wage' ? 20 : 8), 0, 100);
}

/** Spørg bestyrelsen om en stigning på pct (fx 0.1 = +10 %). Svar: ja, modbud eller nej. */
export function requestBudget(kind: BudgetKind, pct = 0.1): { result: 'ok' | 'counter' | 'no' | 'tooSoon'; pct?: number; reasons?: string[] } {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return { result: 'no' };
  const month = g.date.slice(0, 7);
  if (g.board.budgetAsked?.[kind] === month) return { result: 'tooSoon' };
  pct = Math.max(0.01, Math.min(1, pct));
  const { max, reasons } = budgetLimits(kind);
  const params = { kind, pct: Math.round(pct * 100) };
  if (pct <= max + 1e-9) {
    grant(kind, pct);
    (g.board.budgetAsked ??= {})[kind] = month;
    g.board.budgetCounter = undefined;
    addNews({ cat: 'board', key: 'board.requestOk', params });
    return { result: 'ok', pct, reasons };
  }
  if (max >= 0.02) {
    g.board.budgetCounter = { kind, pct: max, until: addDays(g.date, 3) };
    return { result: 'counter', pct: max, reasons };
  }
  (g.board.budgetAsked ??= {})[kind] = month;
  addNews({ cat: 'board', key: 'board.requestNo', params });
  return { result: 'no', reasons };
}

/** Svar på bestyrelsens modbud */
export function answerBudgetCounter(accept: boolean): 'ok' | 'expired' {
  const g = gs();
  const c = g.board.budgetCounter;
  if (!c || g.date > c.until) { g.board.budgetCounter = undefined; return 'expired'; }
  g.board.budgetCounter = undefined;
  (g.board.budgetAsked ??= {})[c.kind] = g.date.slice(0, 7);
  if (accept) {
    grant(c.kind, c.pct);
    addNews({ cat: 'board', key: 'board.requestOk', params: { kind: c.kind, pct: Math.round(c.pct * 100) } });
  }
  return 'ok';
}

/** Flyt penge fra transferbudgettet til lønbudgettet (eller omvendt) – altid tilladt.
 *  1 kr. om ugen i løn svarer til 104 kr. i transferbudget (to sæsoner). */
export const SHIFT_WEEKS = 104;
export function shiftBudget(toWage: boolean, amount: number): 'ok' | 'error' {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club || !(amount > 0)) return 'error';
  if (toWage) {
    const a = Math.min(amount, club.transferBudget);
    club.transferBudget -= a;
    club.wageBudget += Math.round(a / SHIFT_WEEKS);
  } else {
    const weekly = Math.min(amount, club.wageBudget);
    club.wageBudget -= weekly;
    club.transferBudget += weekly * SHIFT_WEEKS;
  }
  return 'ok';
}

// ---------- AI-managere og jobmarked ----------

export function aiSackings() {
  const g = gs();
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league') continue;
    const sorted = sortTable(comp.table.slice());
    sorted.forEach((row, i) => {
      if (row.p < 8) return;
      const club = g.clubs[row.club];
      if (!club || club.manager <= 0 || club.id === g.userClub) return;
      const { rank } = strengthRank(club);
      const under = i + 1 - rank;
      // realistisk ~20-30 % trænerskifter pr. sæson: klart under forventning, nedrykningsfare eller sort stime
      const inDrop = i >= sorted.length - 3 && under >= 2;
      const p = (under >= 4 ? 0.05 + under * 0.015 : 0) + (inDrop ? 0.07 : 0) + (row.form === 'LLLLL' ? 0.1 : 0);
      if (p > 0 && rng.chance(p)) {
        const m = g.staff[club.manager];
        if (m) { careerEnd(m, 'sacked'); m.club = 0; }
        club.manager = 0;
        openVacancy(club.id);
        forEachHuman(() => { if (newsRelevant(club.id)) addNews({ cat: 'job', key: 'news.managerSacked', params: { club: club.name, manager: m ? `${m.first} ${m.last}` : '?' }, link: { kind: 'club', id: club.id } }); });
      }
    });
  }
  // ligaer der ikke simuleres har ingen tabel – her skifter trænerne tilfældigt (~15-20 % pr. sæson),
  // så jobmarkedet også findes i resten af Europa
  for (const club of Object.values(g.clubs)) {
    if (g.comps[club.league] || club.manager <= 0 || !rng.chance(0.02)) continue;
    const m = g.staff[club.manager];
    if (m) { careerEnd(m, 'sacked'); m.club = 0; }
    club.manager = 0;
    openVacancy(club.id);
    forEachHuman(() => { if (newsRelevant(club.id)) addNews({ cat: 'job', key: 'news.managerSacked', params: { club: club.name, manager: m ? `${m.first} ${m.last}` : '?' }, link: { kind: 'club', id: club.id } }); });
  }
}

/** Sæsonslut (1. juni): mange trænerskifter sker i sommerpausen – flest hos dem der skuffede */
export function summerManagerChanges() {
  const g = gs();
  for (const club of Object.values(g.clubs)) {
    if (club.manager <= 0) continue;
    const comp = g.comps[club.league];
    let p = 0.04;
    if (comp?.type === 'league') {
      const pos = sortTable(comp.table.slice()).findIndex((r) => r.club === club.id) + 1;
      const under = pos - strengthRank(club).rank;
      p = under >= 5 ? 0.22 : under >= 3 ? 0.1 : under <= -3 ? 0.02 : 0.04;
    }
    if (!rng.chance(p)) continue;
    const m = g.staff[club.manager];
    if (m) { careerEnd(m, 'left'); m.club = 0; }
    club.manager = 0;
    openVacancy(club.id);
    forEachHuman(() => { if (newsRelevant(club.id)) addNews({ cat: 'job', key: 'news.managerSacked', params: { club: club.name, manager: m ? `${m.first} ${m.last}` : '?' }, link: { kind: 'club', id: club.id } }); });
  }
}

/** Den aktive managers område: nuværende klub, ellers seneste klub, ellers nationalitet */
export function managerRegion(): Region {
  const g = gs();
  const club = g.clubs[g.userClub] ?? g.clubs[g.manager.history[g.manager.history.length - 1]?.club ?? -1];
  return regionOf(g.nations[club ? club.nation : g.manager.nation]?.name);
}

/** En stilling bliver ledig */
export function openVacancy(clubId: number) {
  const g = gs();
  if (!g.vacancies.includes(clubId)) g.vacancies.push(clubId);
  (g.vacancySince ??= {})[clubId] = g.date;
}

/** Fyld ledige stillinger (efter nogle dage) og send jobtilbud til brugeren */
export function fillVacancies() {
  const g = gs();
  // Jobtilbud til de menneskelige managere
  const offered = new Set<number>();
  forEachHuman(() => {
    for (const cid of g.vacancies) {
      const club = g.clubs[cid];
      if (!club || club.manager !== 0) continue;
      // arbejdsløs: klubber op til lidt over ens omdømme. I job: klubber på samme niveau eller lidt over –
      // jo mere tilfreds ens nuværende bestyrelse er, jo mere attraktiv er man
      const my = g.clubs[g.userClub];
      // kun jobtilbud fra samme verdensdel som ens klub (eller seneste klub/nationalitet, hvis arbejdsløs)
      if (regionOf(g.nations[club.nation]?.name) !== managerRegion()) continue;
      const eligible = !my
        ? g.manager.rep + 12 >= club.rep
        : club.id !== my.id && club.rep >= my.rep - 6 && club.rep <= Math.max(g.manager.rep, my.rep) + 8;
      const chance = !my ? 0.35 : Math.max(0.01, 0.04 + (g.board.confidence - 50) / 1000) * (club.rep > my.rep ? 1.5 : 1);
      if (eligible && !g.jobOffers.includes(cid) && rng.chance(chance)) {
        g.jobOffers.push(cid);
        offered.add(cid);
        addNews({ cat: 'job', key: 'news.jobOffer', params: { club: club.name }, link: { kind: 'club', id: cid } });
      }
    }
  });
  const still: number[] = [];
  for (const cid of g.vacancies) {
    const club = g.clubs[cid];
    if (!club || club.manager !== 0) continue;
    if (offered.has(cid)) { still.push(cid); continue; }
    // stillinger står typisk åbne i 1-4 uger, så man kan nå at søge dem
    const open = g.vacancySince?.[cid] ? daysBetween(g.vacancySince[cid], g.date) : 30;
    if (rng.chance(open < 7 ? 0 : open < 21 ? 0.12 : 0.3)) {
      const m = pickManager(cid);
      if (m) {
        m.club = cid;
        careerStart(m, cid);
        club.manager = m.id;
        club.tactic = null;
        if (g.vacancySince) delete g.vacancySince[cid];
        forEachHuman(() => { if (newsRelevant(cid)) addNews({ cat: 'job', key: 'news.managerHired', params: { club: club.name, manager: `${m.first} ${m.last}` } }); });
        forEachHuman(() => { g.jobOffers = g.jobOffers.filter((x) => x !== cid); });
        continue;
      }
    }
    still.push(cid);
  }
  g.vacancies = still;
}

export function applyForJob(cid: number): boolean {
  const g = gs();
  const club = g.clubs[cid];
  if (!club || club.manager !== 0) return false;
  const ok = g.jobOffers.includes(cid) || g.manager.rep + 10 >= club.rep || rng.chance(Math.max(0.05, 0.5 - (club.rep - g.manager.rep) / 40));
  if (ok) acceptJob(cid);
  else addNews({ cat: 'job', key: 'news.applyRejected', params: { club: club.name } });
  return ok;
}

export function acceptJob(cid: number) {
  const g = gs();
  const club = g.clubs[cid];
  if (g.userClub && g.clubs[g.userClub]) {
    const oldClub = g.clubs[g.userClub];
    oldClub.manager = 0;
    openVacancy(oldClub.id);
  }
  g.vacancies = g.vacancies.filter((x) => x !== cid);
  if (g.vacancySince) delete g.vacancySince[cid];
  forEachHuman(() => { g.jobOffers = g.jobOffers.filter((x) => x !== cid); });
  g.jobOffers = [];
  takeOverClub(club);
  addNews({ cat: 'job', key: 'news.newJob', params: { club: club.name } });
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ---------- byggeprojekter ----------

import type { ProjectKind } from './types';

export interface ProjectOffer {
  kind: ProjectKind;
  cost: number;
  months: number;
  amount: number;
}

/** Hvad vil et projekt koste og give? */
export function projectOffer(kind: ProjectKind): ProjectOffer | null {
  const g = gs();
  const c = g.clubs[g.userClub];
  if (!c) return null;
  const wealth = Math.max(0.3, rulesForLeague(c.league));
  if (kind === 'stadium') {
    const amount = Math.max(1000, Math.round((c.seats * 0.15) / 500) * 500);
    return { kind, amount, months: 10, cost: Math.round((amount * 2200 * Math.sqrt(wealth)) / 100_000) * 100_000 };
  }
  const level = kind === 'training' ? c.facilities : c.youth;
  if (level >= 20) return null;
  const amount = level >= 17 ? 1 : 2;
  return { kind, amount, months: kind === 'training' ? 6 : 8, cost: Math.round((Math.pow(level + 1, 2) * 45_000 * Math.sqrt(wealth)) / 50_000) * 50_000 };
}

/** Anmod bestyrelsen om et byggeprojekt */
export function requestProject(kind: ProjectKind): 'ok' | 'busy' | 'money' | 'confidence' | 'max' {
  const g = gs();
  const c = g.clubs[g.userClub];
  const offer = projectOffer(kind);
  if (!c || !offer) return 'max';
  if ((c.projects ?? []).some((p) => p.kind === kind)) return 'busy';
  if (g.board.confidence < 45) {
    addNews({ cat: 'board', key: 'board.project.noConfidence', params: { kind } });
    return 'confidence';
  }
  if (c.balance < offer.cost) {
    addNews({ cat: 'board', key: 'board.project.noMoney', params: { kind, cost: offer.cost } });
    return 'money';
  }
  c.balance -= offer.cost;
  c.finance.other += offer.cost;
  const done = addDays(g.date, offer.months * 30);
  (c.projects ??= []).push({ kind, started: g.date, done, cost: offer.cost, amount: offer.amount });
  g.board.confidence = clamp(g.board.confidence - 3, 0, 100);
  addNews({ cat: 'board', key: 'board.project.approved', params: { kind, cost: offer.cost, done } });
  return 'ok';
}

/** Dagligt: færdiggør projekter */
export function completeProjects() {
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    if (!c.projects?.length) continue;
    const finished = c.projects.filter((p) => p.done <= g.date);
    if (!finished.length) continue;
    c.projects = c.projects.filter((p) => p.done > g.date);
    for (const p of finished) {
      if (p.kind === 'stadium') c.seats += p.amount;
      else if (p.kind === 'training') c.facilities = Math.min(20, c.facilities + p.amount);
      else c.youth = Math.min(20, c.youth + p.amount);
      forEachHuman(() => {
        if (g.userClub === c.id) addNews({ cat: 'board', key: 'board.project.done', params: { kind: p.kind, amount: p.amount, seats: c.seats } });
      });
    }
  }
}
