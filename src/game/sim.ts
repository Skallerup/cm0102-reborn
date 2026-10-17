// Spillets dag-for-dag-løkke.
import { boardAfterMatch, boardMonthly, aiSackings, completeProjects, fillVacancies, summerManagerChanges } from './board';
import { needsWinnerFn, recordResult } from './competitions';
import { addDays, day, month, weekday } from './dates';
import { MatchSim, quickMatch, type EngineTeam } from './engine/match';
import { gateReceipts, monthlyIncome, sponsorWinBonus, weeklyWages } from './finance';
import { rng } from './rng';
import { addNews, fixturesOn, gs, squad } from './state';
import { counterPlan, type CounterPlan } from './aitactics';
import { autoSelect, available, lineupComplete, newTactic, slotValue, validateTactic } from './tactics';
import type { Fixture, MatchReport, Player, Tactic } from './types';
import { monthlyDevelopment, monthlyTrainingReport, monthlyValues, weeklyDevelopment } from './training';
import { aiLoanOptions, aiPursuits, aiBidsForListed, aiBosman, aiFillSquads, aiRenewals, aiTransferTick, contractReminders, processOffers } from './transfers';
import { knowledgeAfterMatch, scoutDaily } from './scouting';
import { seasonRollover, youthIntake } from './season';
import { squadStrength } from './board';
import { chemistryMorale, monthlyPersonality } from './personality';
import { monthlyWill } from './will';
import { recordRivalry } from './careers';
import { boardMeeting, fansAfterMatch, fansMonthly } from './fans';
import { expirePress, invitePress, motivation } from './press';
import { monthlyColumn, weeklyRumours } from './media';
import { monthlyAwards, snapshotMonth } from './awards';
import { asOwner, forEachHuman, isHumanClub, isMultiplayer, ownerOf, withHuman } from './humans';

export const INJURIES: [string, number, number, number][] = [
  // nøgle, min dage, max dage, vægt
  ['bruise', 2, 6, 30], ['twisted-ankle', 5, 14, 18], ['hamstring', 10, 28, 16], ['groin', 8, 21, 10], ['calf', 7, 18, 10],
  ['knee', 14, 45, 6], ['back', 5, 14, 6], ['concussion', 7, 12, 3], ['broken-foot', 40, 80, 2], ['cruciate', 180, 270, 1], ['broken-leg', 100, 160, 1],
];

const pname = (p: Player) => `${p.first} ${p.last}`.trim();

// ---------- holdudtagelse ----------

export function aiTactic(clubId: number, oppId?: number, home = true): Tactic {
  const g = gs();
  const club = g.clubs[clubId];
  const m = g.staff[club.manager];
  const formation = m?.style?.formation ?? '4-4-2';
  let mentality = m?.style?.mentality ?? 2;
  let plan: CounterPlan = { team: {} };
  if (oppId !== undefined) {
    const diff = squadStrength(clubId) - squadStrength(oppId) + (home ? 3 : -3);
    if (diff > 12) mentality = Math.min(4, mentality + 1);
    else if (diff < -12) mentality = Math.max(0, mentality - 1);
    plan = counterPlan(clubId, oppId, diff, formation, mentality);
  }
  const base = newTactic(plan.formation ?? formation, mentality);
  if (mentality <= 1) base.team.counter = true;
  base.team = { ...base.team, ...plan.team };
  return autoSelect(base, squad(clubId));
}

export function userTactic(auto = false): Tactic {
  const g = gs();
  const players = squad(g.userClub);
  if (!g.tactic) g.tactic = autoSelect(newTactic('4-4-2'), players);
  let t = validateTactic(g.tactic, players);
  if (auto) t = autoSelect(t, players);
  else if (!lineupComplete(t)) {
    // assistenten udfylder tomme pladser med bedste ledige spiller
    const used = new Set(t.lineup.filter(Boolean));
    const lineup = t.lineup.slice();
    lineup.forEach((id, i) => {
      if (id) return;
      const best = players.filter((p) => available(p) && !used.has(p.id)).sort((x, y) => slotValue(y, t.slots[i]) - slotValue(x, t.slots[i]))[0];
      if (best) { lineup[i] = best.id; used.add(best.id); }
    });
    const bench = t.bench.filter((id) => !used.has(id));
    if (bench.length < 3) {
      for (const p of players.filter((x) => available(x) && !used.has(x.id) && !bench.includes(x.id)).sort((x, y) => y.ca - x.ca)) {
        if (bench.length >= 5) break;
        bench.push(p.id);
      }
    }
    t = { ...t, lineup, bench };
  }
  g.tactic = t;
  return t;
}

export function engineTeam(clubId: number, tactic: Tactic): EngineTeam {
  const map = new Map<number, Player>();
  for (const p of squad(clubId)) map.set(p.id, p);
  return { club: clubId, tactic, players: map, morale: chemistryMorale(tactic) + motivation(clubId, gs().date) };
}

function importance(f: Fixture): number {
  const g = gs();
  const comp = g.comps[f.comp];
  if (!comp) return 0.3;
  if (f.stage === 'F') return 1;
  if (comp.type === 'continental') return f.stage?.startsWith('G') ? 0.6 : 0.85;
  if (comp.type === 'playoff') return 0.9;
  return comp.type === 'cup' ? 0.5 : 0.4;
}

export function prepareMatch(f: Fixture, userAuto = false): { home: EngineTeam; away: EngineTeam; neutral: boolean; needsWinner?: (h: number, a: number) => boolean; importance: number } {
  const ht = tacticFor(f.home, f.away, true, userAuto);
  const at = tacticFor(f.away, f.home, false, userAuto);
  return {
    home: engineTeam(f.home, ht),
    away: engineTeam(f.away, at),
    neutral: f.stage === 'F',
    needsWinner: needsWinnerFn(f),
    importance: importance(f),
  };
}

/** Taktik for en klub: menneskets egen (via dets slot) eller AI'ens */
function tacticFor(club: number, opp: number, home: boolean, userAuto: boolean): Tactic {
  const g = gs();
  if (club === g.userClub && g.userClub) return userTactic(userAuto);
  if (isHumanClub(club)) {
    const o = ownerOf(club);
    if (o) return withHuman(o, () => userTactic(userAuto));
  }
  return aiTactic(club, opp, home);
}

export function createLiveMatch(f: Fixture): MatchSim {
  const m = prepareMatch(f);
  const g = gs();
  return new MatchSim(m.home, m.away, {
    commentary: true, neutral: m.neutral, needsWinner: m.needsWinner, importance: m.importance, fixtureId: f.id, date: g.date,
    aiSubs: [f.home !== g.userClub, f.away !== g.userClub],
  }, rng);
}

export function simulateFixture(f: Fixture, userAuto = true, commentary = false): MatchReport {
  const m = prepareMatch(f, userAuto);
  const opts = { neutral: m.neutral, needsWinner: m.needsWinner, importance: m.importance, fixtureId: f.id, date: gs().date };
  const rep = commentary
    ? new MatchSim(m.home, m.away, { ...opts, commentary: true, aiSubs: [true, true] }, rng).runToEnd()
    : quickMatch(m.home, m.away, opts, rng);
  applyMatchResult(f, rep);
  return rep;
}

// ---------- resultatbehandling ----------

export function applyMatchResult(f: Fixture, rep: MatchReport) {
  const g = gs();
  const [hs, as] = rep.stats;
  const scorers: [number, number, number][] = rep.events.filter((e) => e.k === 'goal').map((e) => [e.m, e.t, e.p!]);
  const att = gateReceipts(f);
  recordResult(f, { hg: hs.goals, ag: as.goals, et: rep.et, pens: rep.pens, scorers, att });
  const comp = g.comps[f.comp];
  const isLeague = comp?.type === 'league';
  const played = new Set<number>();
  for (const line of rep.players) {
    const p = g.players[line.id];
    if (!p) continue;
    played.add(p.id);
    const s = p.stats;
    if (line.sub) s.subs++; else s.apps++;
    if (isLeague) { s.lgApps++; s.lgGoals += line.goals; }
    s.minutes += line.minutes;
    s.goals += line.goals;
    s.assists += line.assists;
    s.ratingSum += line.rating;
    s.ratingCount++;
    if (rep.mom === p.id) s.mom++;
    p.form = [...p.form, line.rating].slice(-5);
    p.condition = Math.max(20, Math.min(100, line.cond));
    if (line.yellow) {
      s.yellows++;
      p.yellowCount++;
      if (p.yellowCount >= 5) { p.banned = Math.max(p.banned, 1); p.yellowCount = 0; }
    }
    if (line.red) { s.reds++; p.banned = Math.max(p.banned, rng.int(1, 3)); p.lastRed = g.date; }
    if (line.injured) injure(p);
    const res = line.team === 0 ? Math.sign(hs.goals - as.goals) : Math.sign(as.goals - hs.goals);
    p.morale = Math.max(1, Math.min(20, p.morale + res * 0.8 + (line.rating >= 7.5 ? 0.6 : line.rating < 5.8 ? -0.5 : 0)));
  }
  // karantæner afsones for spillere der ikke spillede
  for (const club of [f.home, f.away]) {
    for (const p of squad(club)) {
      if (!played.has(p.id) && p.banned > 0) p.banned--;
      if (!played.has(p.id) && isHumanClub(club)) p.unhappy = Math.min(100, (p.unhappy ?? 0) + (p.attrs[42] > 13 ? 3 : 1));
      else if (played.has(p.id)) p.unhappy = Math.max(0, (p.unhappy ?? 0) - 5);
    }
  }
  // præmiepenge i Europa
  if (comp?.type === 'continental') {
    const win = comp.id === 'CL' ? 2_800_000 : 800_000;
    const draw = comp.id === 'CL' ? 900_000 : 300_000;
    for (const [cid, gf, ga] of [[f.home, hs.goals, as.goals], [f.away, as.goals, hs.goals]] as const) {
      const c = g.clubs[cid];
      const amount = gf > ga ? win : gf === ga ? draw : 0;
      c.balance += amount + (f.stage?.startsWith('G') ? 0 : win / 2);
      c.finance.prize += amount;
    }
  }
  // sponsorernes sejrsbonus
  if (isLeague && hs.goals !== as.goals) sponsorWinBonus(hs.goals > as.goals ? f.home : f.away);
  // menneskelige managere i kampen
  for (const club of [f.home, f.away]) {
    if (!isHumanClub(club) && club !== g.userClub) continue;
    asOwner(club, () => userMatchResult(f, rep));
  }
}

function userMatchResult(f: Fixture, rep: MatchReport) {
  const g = gs();
  const [hs, as] = rep.stats;
  const comp = g.comps[f.comp];
  {
    const userHome = f.home === g.userClub;
    const opp = userHome ? f.away : f.home;
    const scored = userHome ? hs.goals : as.goals;
    const conceded = userHome ? as.goals : hs.goals;
    boardAfterMatch(scored, conceded, opp, comp?.type ?? 'league');
    recordRivalry(opp, scored, conceded);
    invitePress(f, 'post');
    fansAfterMatch(g.userClub, scored, conceded, squadStrength(g.userClub), squadStrength(opp), isBigMatch(g.userClub, opp));
    knowledgeAfterMatch(opp, rep.players.filter((l) => l.team === (userHome ? 1 : 0)).map((l) => l.id));
    g.reports[f.id] = rep;
    const key = scored > conceded ? 'match.won' : scored === conceded ? 'match.drew' : 'match.lost';
    addNews({ cat: 'match', key, params: { opp: g.clubs[opp].name, score: `${scored}-${conceded}`, comp: comp?.name ?? '' }, link: { kind: 'fixture', id: f.id } });
    for (const line of rep.players) {
      if (line.injured && g.players[line.id]?.club === g.userClub) {
        const p = g.players[line.id];
        addNews({ cat: 'injury', key: 'news.injury', params: { player: pname(p), injury: p.injury?.key ?? 'bruise', days: p.injury?.days ?? 0 }, link: { kind: 'player', id: p.id } });
      }
    }
  }
}

/** Storkamp/topopgør: to af ligaens fire største klubber med næsten samme omdømme */
export function isBigMatch(a: number, b: number): boolean {
  const g = gs();
  const A = g.clubs[a], B = g.clubs[b];
  if (!A || !B || A.league !== B.league || Math.abs(A.rep - B.rep) > 6) return false;
  const top = Object.values(g.clubs).filter((c) => c.league === A.league).sort((x, y) => y.rep - x.rep).slice(0, 4).map((c) => c.id);
  return top.includes(a) && top.includes(b);
}

function injure(p: Player) {
  const g = gs();
  const [key, lo, hi] = rng.weighted(INJURIES, (x) => x[3])!;
  let days = rng.int(lo, hi);
  // fysioterapeuter forkorter skader
  const physios = Object.values(g.staff).filter((s) => s.club === p.club && s.role === 'physio');
  const best = Math.max(5, ...physios.map((s) => s.attrs.physio));
  days = Math.max(1, Math.round(days * (1.15 - best / 40)));
  p.injury = { key, days };
}

// ---------- dagsløkke ----------

export interface DayResult {
  match?: number; // brugerens kamp skal spilles
  stop?: string; // vigtig begivenhed
}

function newDay() {
  const g = gs();
  g.date = addDays(g.date, 1);
  g.dayDone = false;
  const d = g.date;
  if (month(d) === 7 && day(d) === 1) seasonRollover();
  // daglige ting
  for (const p of Object.values(g.players)) {
    if (p.injury) {
      p.injury.days--;
      if (p.injury.days <= 0) {
        p.injury = null;
        p.condition = Math.min(p.condition, 75);
        asOwner(p.club, () => addNews({ cat: 'injury', key: 'news.recovered', params: { player: pname(p) }, link: { kind: 'player', id: p.id } }));
      }
    }
    if (p.condition < 100) p.condition = Math.min(100, p.condition + 4 + p.attrs[29] / 4);
    if (p.morale !== 13) p.morale += (13 - p.morale) * 0.02;
  }
  forEachHuman(processOffers);
  forEachHuman(() => {
    expirePress();
    // pressemøde dagen før kampen
    for (const id of fixturesOn(addDays(d, 1))) {
      const f = g.fixtures[id];
      if (f && g.userClub && (f.home === g.userClub || f.away === g.userClub)) invitePress(f, 'pre');
    }
  });
  completeProjects();
  forEachHuman(aiBidsForListed);
  aiPursuits();
  if (weekday(d) === 4) forEachHuman(aiLoanOptions);
  aiTransferTick();
  forEachHuman(scoutDaily);
  if (day(d) % 3 === 0) fillVacancies();
  if (weekday(d) === 1) {
    forEachHuman(weeklyRumours);
    weeklyDevelopment();
    weeklyWages();
  }
  if (day(d) === 1) {
    monthlyIncome();
    monthlyValues();
    monthlyDevelopment();
    monthlyPersonality();
    monthlyWill();
    fansMonthly();
    if (month(d) !== 7) monthlyColumn();
    forEachHuman(boardMeeting);
    if (!(month(d) === 7)) monthlyAwards(); else snapshotMonth();
    forEachHuman(() => {
      const { mismatches } = monthlyTrainingReport();
      const asst = Object.values(g.staff).find((s) => s.club === g.userClub && s.role === 'assistant');
      if (mismatches >= 3 && asst && month(d) % 3 === 1) addNews({ cat: 'general', key: 'news.trainingAdvice', params: { coach: `${asst.first} ${asst.last}`, n: mismatches } });
    });
    forEachHuman(boardMonthly);
    if (month(d) >= 9 || month(d) <= 4) aiSackings();
    if (month(d) === 6) summerManagerChanges();
    if (month(d) >= 1 && month(d) <= 5) aiRenewals();
    if (month(d) === 1 || month(d) === 3) forEachHuman(contractReminders);
  }
  if (month(d) >= 1 && month(d) <= 5 && weekday(d) === 3) forEachHuman(aiBosman);
  if (month(d) === 3 && day(d) === 15) youthIntake();
  // AI-trupper fyldes op i sommer- og vinterpausen
  if ((month(d) === 7 || month(d) === 8 || month(d) === 1) && weekday(d) === 2) aiFillSquads(22);
}

/** Spil dagens kampe (undtagen brugerens) */
function playDay(): DayResult {
  const g = gs();
  let userMatch: number | undefined;
  for (const id of fixturesOn(g.date)) {
    const f = g.fixtures[id];
    if (!f || f.result) continue;
    if (!isMultiplayer(g) && g.userClub && (f.home === g.userClub || f.away === g.userClub)) {
      userMatch = f.id;
      continue;
    }
    // multiplayer: menneskenes kampe simuleres med fuld kommentar, så de kan ses bagefter
    const human = isHumanClub(f.home) || isHumanClub(f.away);
    simulateFixture(f, !human, human);
  }
  if (userMatch !== undefined) {
    g.pendingFixture = userMatch;
    return { match: userMatch };
  }
  g.dayDone = true;
  return {};
}

/** "Fortsæt" – én dag frem */
export function continueGame(): DayResult {
  const g = gs();
  if (g.pendingFixture) return { match: g.pendingFixture };
  if (!g.dayDone) return playDay();
  const lastNews = g.nextId.news;
  newDay();
  const r = playDay();
  if (r.match) return r;
  const fresh = g.news.filter((n) => n.id >= lastNews);
  const important = fresh.find((n) => ['transfer.incomingBid', 'transfer.bidAccepted', 'transfer.bidCountered', 'news.jobOffer', 'board.sacked', 'board.sackedSeason', 'board.warning'].includes(n.key));
  if (important) return { stop: important.key };
  return {};
}

/** Brugerens kamp er spillet (live eller simuleret) */
export function finishUserMatch(rep: MatchReport) {
  const g = gs();
  const f = g.fixtures[g.pendingFixture!];
  if (f && !f.result) applyMatchResult(f, rep);
  g.pendingFixture = null;
  g.dayDone = true;
}

/** Simulér brugerens ventende kamp uden at se den */
export function quickPlayUserMatch(): MatchReport | null {
  const g = gs();
  const f = g.fixtures[g.pendingFixture!];
  if (!f) return null;
  const m = prepareMatch(f, false);
  const rep = quickMatch(m.home, m.away, { neutral: m.neutral, needsWinner: m.needsWinner, importance: m.importance, fixtureId: f.id, aiSubs: [true, true], date: g.date }, rng);
  finishUserMatch(rep);
  return rep;
}

/** Ferie / spring frem til næste kamp. Kører i bidder så UI'et forbliver responsivt. */
export async function runUntil(opts: { untilDate?: string; untilMatch?: boolean; autoPlay?: boolean; onProgress?: (date: string) => void; shouldStop?: () => boolean }): Promise<DayResult> {
  const g = gs();
  let steps = 0;
  for (;;) {
    if (opts.shouldStop?.()) return {};
    if (opts.untilDate && g.date >= opts.untilDate && g.dayDone && !g.pendingFixture) return {};
    const r = continueGame();
    if (r.match !== undefined) {
      if (opts.autoPlay) {
        quickPlayUserMatch();
      } else return r;
    }
    if (r.stop && !opts.autoPlay) return r;
    if (!g.userClub && opts.untilMatch) {
      // arbejdsløs: stop ved jobtilbud
      if (g.jobOffers.length) return { stop: 'news.jobOffer' };
    }
    if (++steps % 3 === 0) {
      opts.onProgress?.(g.date);
      await new Promise((res) => setTimeout(res, 0));
    }
    if (steps > 800) return {};
  }
}

export function availableForSelection(p: Player) {
  return available(p);
}

// ---------- online multiplayer ----------

const IMPORTANT = ['transfer.incomingBid', 'transfer.bidAccepted', 'transfer.bidCountered', 'news.jobOffer', 'board.sacked', 'board.sackedSeason'];

/**
 * Ét multiplayer-"træk": spil dage frem til og med næste dag hvor en menneskelig manager har kamp,
 * eller til der kommer en vigtig besked til nogen (højst 14 dage).
 */
export function mpAdvance(): { days: number; reason: string } {
  const g = gs();
  const startNews = g.nextId.news;
  for (let i = 1; i <= 14; i++) {
    newDay();
    const humansPlaying = fixturesOn(g.date).some((id) => {
      const f = g.fixtures[id];
      return f && (isHumanClub(f.home) || isHumanClub(f.away));
    });
    playDay();
    g.dayDone = true;
    g.pendingFixture = null;
    if (humansPlaying) return { days: i, reason: 'match' };
    let important = false;
    forEachHuman(() => { if (g.news.some((n) => n.id >= startNews && IMPORTANT.includes(n.key))) important = true; });
    if (important) return { days: i, reason: 'news' };
  }
  return { days: 14, reason: 'limit' };
}
