// Bestyrelse, forventninger, fyringer og jobmarked.
import { finalOrder, sortTable } from './competitions';
import { rng } from './rng';
import { addDays } from './dates';
import { addNews, gs, squad } from './state';
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
  g.manager.rep = clamp(g.manager.rep - 8, 1, 100);
  club.manager = 0;
  g.vacancies.push(club.id);
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

let lastRequest = '';
export function requestBudget(kind: 'transfer' | 'wage'): boolean {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return false;
  if (lastRequest === g.date.slice(0, 7) + kind) {
    addNews({ cat: 'board', key: 'board.requestTooSoon', params: {} });
    return false;
  }
  lastRequest = g.date.slice(0, 7) + kind;
  const ok = g.board.confidence >= 60 && club.balance > club.transferBudget * 0.5 && rng.chance(0.4 + (g.board.confidence - 60) / 80);
  if (ok) {
    if (kind === 'transfer') club.transferBudget = Math.round(club.transferBudget * 1.2 + 250_000);
    else club.wageBudget = Math.round(club.wageBudget * 1.1);
    g.board.confidence = clamp(g.board.confidence - 4, 0, 100);
  }
  addNews({ cat: 'board', key: ok ? 'board.requestOk' : 'board.requestNo', params: { kind } });
  return ok;
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
      if (under >= 6 && rng.chance(0.08 + under * 0.01)) {
        const m = g.staff[club.manager];
        if (m) m.club = 0;
        club.manager = 0;
        g.vacancies.push(club.id);
        addNews({ cat: 'job', key: 'news.managerSacked', params: { club: club.name, manager: m ? `${m.first} ${m.last}` : '?' } }, { all: true });
      }
    });
  }
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
      if ((g.userClub === 0 || g.manager.rep > club.rep + 5) && !g.jobOffers.includes(cid) && g.manager.rep + 12 >= club.rep && rng.chance(g.userClub === 0 ? 0.35 : 0.08)) {
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
    if (rng.chance(0.15)) {
      const pool = Object.values(g.staff).filter((s) => s.role === 'manager' && s.club === 0).sort((a, b) => Math.abs(a.rep - club.rep) - Math.abs(b.rep - club.rep));
      const m = pool[0];
      if (m) {
        m.club = cid;
        club.manager = m.id;
        club.tactic = null;
        addNews({ cat: 'job', key: 'news.managerHired', params: { club: club.name, manager: `${m.first} ${m.last}` } }, { all: true });
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
    g.vacancies.push(oldClub.id);
  }
  g.vacancies = g.vacancies.filter((x) => x !== cid);
  forEachHuman(() => { g.jobOffers = g.jobOffers.filter((x) => x !== cid); });
  g.jobOffers = [];
  takeOverClub(club);
  addNews({ cat: 'job', key: 'news.newJob', params: { club: club.name } });
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
