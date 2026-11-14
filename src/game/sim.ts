// Spillets dag-for-dag-løkke.
import { cmBoardAfterMatch, cmBoardDaily, cmBoardOn } from './cmBoardGame';
import { cmStaffOffersDaily } from './cmStaff';
import { cmActive, cmAfterMatch, cmContractDaily, cmFlagSet, cmRand, cmSquadMoraleDaily, MORALE_OFF, withFlagCtx } from './cmPlayerData';
import { cmFitAfterMatch, cmFitDay, cmFitOn, cmFitPreMatch, setMatchSquad } from './cmFitnessGame';
import { cmPermitAfterMatch, cmPermitDaily } from './cmPermit';
import { cmSquadPlanDaily } from './cmSquadPlanGame';
import { cmDevDaily } from './cmDevelop';
import { cmRelDaily } from './cmRelations';
import { cmFineDaily } from './cmFine';
import { cmRecordsDaily } from './cmMedia';
import { cmTrainSquads } from './cmTraining';
import { recordAiTactics } from './engine/grid/aiTeam';
import { promoteIfShort } from './reserves';
import { intlDayResults, intlDaily } from './international';
import { reservesDaily } from './reserves';
import { awolMonthly } from './rules2001';
import { squadNumbersDaily } from './squadNumbers';
import { euroRegistered, euroSquadDaily } from './euroSquad';
import { packReport } from './miniReport';
import { draftDay, draftInjuryDays, draftSeasonCheck } from './draft';
import { boardAfterMatch, boardMonthly, aiSackings, completeProjects, fillVacancies, processJobTalks, summerManagerChanges, applyForJob } from './board';
import { A } from './attributes';
import { cmDatabase } from './newgame';
import { aggregateFor, needsWinnerFn, recordResult, setupLeague, leagueRows } from './competitions';
import { t } from '../i18n';
import { addDays, ageOn, day, month, weekday, daysBetween } from './dates';
import { MatchSim, type EngineOptions, type EngineTeam } from './engine/match';
import { GRID_ENGINE_DEFAULT, getGridFactory, setGridFactory, type LiveSim } from './engine/liveSim';
import { gridFactory } from './engine/grid/adapter';
import type { Rng } from './rng';
import { pitchFor, refereeFor, weatherFor, type Pitch, type Weather } from './weather';
import { maxSubs, extended, authentic } from './rules';
import { recordsAfterMatch } from './records';
import { campDaily } from './camp';
import { trialsDaily } from './trials';
import { friendliesDaily } from './friendlies';
import { cmFriendlyDay } from './cmFriendly';
import { achievementsAfterMatch } from './achievements';
import { storyAfterMatch } from './story';
import { gateReceipts, januaryBudgetTopUp, monthlyIncome, snapshotFinanceMonth, sponsorWinBonus, weeklyWages } from './finance';
import { rng } from './rng';
import { addNews, fixturesOn, gs, squad } from './state';
import { counterPlan, type CounterPlan } from './aitactics';
import { autoSelect, available, lineupComplete, newTactic, slotValue, validateTactic } from './tactics';
import type { Fixture, GameState, MatchReport, MatchResultShort, NewsItem, Player, Tactic } from './types';
import { monthlyDevelopment, monthlyTrainingReport, monthlyValues, weeklyDevelopment } from './training';
import { aiLoanOptions, aiPursuits, aiBidsForListed, aiBosman, aiFillSquads, aiReleaseClauses, aiRenewals, aiTransferTick, answerPendingRenewals, contractReminders, processOffers, refreshShortlists, resolveAuctions, resolveSignings, weeklyTransferDigest, windowNews, respondToOffer, askingPrice, cmMonthlyInstalments, cmAppsAfterMatch } from './transfers';
import { afterAppearance } from './clauses';
import { cmBonusPaid } from './cmContractInit';
import { knowledgeAfterMatch, scoutDaily } from './scouting';
import { cmCalendarDay } from './cmCalendar';
import { cmFinanceDay, cmFinOn, cmMatchIncome, GBP as CM_GBP } from './cmFinance';
import { fixtureCodesOf, gameCrowd } from './engine/grid/gameInputs';
import { cmEuroCatchUp, cmEuroDay } from './cmEurope';
import { compHooks } from './hooks';
import { freeAgentDrift, monthlyClubReps, seasonRollover, youthIntake, youthPreview } from './season';
import { squadStrength } from './board';
import { chemistryMorale, monthlyPersonality } from './personality';
import { monthlyWill, weeklyPlayerContact } from './will';
import { recordRivalry } from './careers';
import { boardMeeting, fansAfterMatch, fansMonthly } from './fans';
import { expirePress, invitePress, motivation, resolvePressPromise } from './press';
import { monthlyColumn, weeklyRumours } from './media';
import { monthlyAwards, snapshotMonth } from './awards';
import { asOwner, forEachHuman, isHumanClub, isMultiplayer, ownerOf, withHuman } from './humans';
import { cmVirtualClear, cmVirtualHumans, cmVirtualMatch } from './cmVirtual';
import { botsDaily, isBotClub } from './bots';
import { botsAfterMatch } from './chat';
import { recordH2H } from './h2h';
import { resolveStaffBids } from './staff';
import { rivalryAfterMatch } from './rivalry';
import { unhappyMult } from './squadStatus';
import { econIncome } from './econ';

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
  const t = autoSelect(base, squad(clubId));
  // roller: en kreativ midtbanespiller styrer spillet, og en stærk angriber i luften bliver target-angriber
  const xi = t.lineup.map((id) => g.players[id]).filter(Boolean);
  const slotOf = (id: number) => t.slots[t.lineup.indexOf(id)];
  const pm = xi.filter((p) => ['M', 'AM', 'DM'].includes(slotOf(p.id).pos) && slotOf(p.id).side === 'C').sort((a, b) => b.attrs[A.creativity] + b.attrs[A.passing] - a.attrs[A.creativity] - a.attrs[A.passing])[0];
  if (pm && pm.attrs[A.creativity] + pm.attrs[A.passing] >= 29) t.team.playmaker = pm.id;
  const air = (p: Player) => p.attrs[A.heading] + p.attrs[A.jumping] + p.attrs[A.strength];
  const tm = xi.filter((p) => slotOf(p.id).pos === 'ST').sort((a, b) => air(b) - air(a))[0];
  if (tm && air(tm) >= 46) { t.team.targetMan = tm.id; t.individual[t.lineup.indexOf(tm.id)] = { ...t.individual[t.lineup.indexOf(tm.id)], holdUp: true }; }
  return t;
}

/** `only`: kun disse spillere kan spille (European Squad) – taktikken gemmes så ikke */
export function userTactic(auto = false, only?: Set<number> | null): Tactic {
  const g = gs();
  const players = only ? squad(g.userClub).filter((p) => only.has(p.id)) : squad(g.userClub);
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
  if (!only) g.tactic = t;
  return t;
}

/** `only`: kun disse kan spille (European Squad) – gittermotorens egen holdudtagelse (aiTeamSetup) vælger blandt `players` */
export function engineTeam(clubId: number, tactic: Tactic, only?: Set<number> | null): EngineTeam {
  const map = new Map<number, Player>();
  for (const p of squad(clubId)) if (!only || only.has(p.id)) map.set(p.id, p);
  const g = gs();
  const talk = clubId === g.userClub && g.matchTalk && g.matchTalk.fixture === g.pendingFixture ? g.matchTalk.boosts : undefined;
  return { club: clubId, tactic, players: map, morale: chemistryMorale(tactic) + motivation(clubId, g.date), talk };
}

function importance(f: Fixture): number {
  const g = gs();
  const comp = g.comps[f.comp];
  if (!comp) return 0.3;
  if (f.stage === 'F') return 1;
  if (comp.type === 'continental') return f.stage?.startsWith('G') || f.stage === 'LP' ? 0.6 : 0.85;
  if (comp.type === 'playoff') return 0.9;
  return comp.type === 'cup' ? 0.5 : 0.4;
}

/** Turneringer med VAR (videodommer): de største ligaer og de europæiske turneringer */
const VAR_LEAGUES = new Set(['GB1', 'ES1', 'IT1', 'L1', 'FR1', 'NL1', 'PO1', 'BE1', 'DK1', 'TR1', 'SC1', 'A1', 'C1', 'GR1', 'SE1', 'NO1', 'PL1', 'MLS1', 'BRA1', 'SA1', 'JAP1', 'MEX1', 'ARG1']);
function usesVar(f: Fixture): boolean {
  if (authentic()) return false; // VAR fandtes ikke i 2001
  const c = gs().comps[f.comp];
  return !!c && (c.type === 'continental' || VAR_LEAGUES.has(c.id) || (c.type === 'cup' && (f.stage === 'F' || f.stage === 'SF')));
}

export function prepareMatch(f: Fixture, userAuto = false): { home: EngineTeam; away: EngineTeam; neutral: boolean; needsWinner?: (h: number, a: number) => boolean; importance: number; var: boolean; weather: Weather; aggregate?: { prior: [number, number]; awayGoals: boolean }; finish: number; homeAdv?: number; finSlope?: number; squash?: number; squashAtt?: number; squashDef?: number; ease?: number; cards?: number; corners?: number; countBlocked?: boolean; close?: number; closeSlope?: number; onTarget?: number; offside?: number; shotSpread?: number; oneOnOneK?: number; level?: [number, number]; openDamp?: [number, number]; rules?: 'current' | 'original'; pitch: Pitch; referee: { name: string; strict: number } } {
  // originalens fyldspillere (0x90d2f0 før kampen – cmVirtual.ts; kun den originale database i ægte tilstand): klubber med for få spillere
  cmVirtualMatch(gs(), f.home, f.away);
  // konditionsmodulet (original database, ægte tilstand): holdenes kondition og skader læses før udtagelsen (0x62c590/0x62c400)
  cmFitPreMatch(gs(), [f.home, f.away]);
  const ht = tacticFor(f.home, f.away, true, userAuto, f.comp);
  const at = tacticFor(f.away, f.home, false, userAuto, f.comp);
  if (cmFitOn(gs())) { setMatchSquad(f.home, [...ht.lineup, ...ht.bench].filter(Boolean)); setMatchSquad(f.away, [...at.lineup, ...at.bench].filter(Boolean)); }
  // MATCH_PLAYER::setup (0x6eb045): træningen 0x8b1750 for begge kamptrupper (cmTraining.ts; kun den originale database i ægte tilstand)
  cmTrainSquads(gs(), [...ht.lineup, ...ht.bench, ...at.lineup, ...at.bench].filter(Boolean) as number[], f.id);
  return {
    home: engineTeam(f.home, ht, euroOnly(f.home, f.comp)),
    away: engineTeam(f.away, at, euroOnly(f.away, f.comp)),
    neutral: f.cm ? f.cm.b3c === 1 : f.stage === 'F',
    needsWinner: needsWinnerFn(f),
    weather: weatherFor(f),
    importance: importance(f),
    var: usesVar(f),
    aggregate: aggregateFor(f),
    pitch: pitchFor(f),
    referee: refereeFor(f),
    ...(cmDatabase(gs()) === 'original' ? ORIGINAL : MODERN),
    ...(cmDatabase(gs()) === 'original' && authentic() ? ORIGINAL_LOWER : {}),
  };
}

/** Kalibrering af den moderne database mod virkeligheden (scripts/benchmark.ts; MODERN_JSON='{…}' overskriver ved målinger) */
// genkalibreret 9/11-2026, da egenskaberne blev rettet (før var de oppustede og SQUASH 0,76 dæmpede dem): 3 sæsoner 2,69 mål, H/U/B 44/25,5/30,6
export const MODERN: { finish: number; squash?: number; squashAtt?: number; squashDef?: number; homeAdv?: number } = { finish: 1.1, squash: 1 };
/** Kalibrering af den originale 2001/02-database mod det originale CM 01/02 (scripts/original-lab.ts) */
export const ORIGINAL = { finish: 2.1, homeAdv: 2.2, finSlope: 20, squash: 0.48, squashAtt: 0.3, squashDef: 0.72, ease: 0.12, shotSpread: 0.25, oneOnOneK: 0.5, cards: 0.11, rules: 'original' as const, corners: 0.7, countBlocked: false, close: 0.2, closeSlope: 2, onTarget: 0.25, offside: 1.8 };
/** (ægte tilstand) zonemotorens kampe i de lavere rækker: profilen er kalibreret på Premier League, og svage hold scorede for meget
 *  (Division 3: 3,98 mål, 13,6 % med 7+, op til 12 – originalen 3,15/4 %/10). `level` løfter de tekniske egenskaber, når begge holds
 *  snit ligger under Premier Leagues (11,1), `openDamp` dæmper afslutningerne fra 7. mål. Målt med scripts/lower-divs-lab.ts (*estimeret*). */
export const ORIGINAL_LOWER: { level: [number, number]; openDamp: [number, number] } = { level: [11.1, 1], openDamp: [7, 0.6] };
export const ORIGINAL_FINISH = ORIGINAL.finish;

/** Taktik for en klub: menneskets egen (via dets slot) eller AI'ens */
/** europæiske kampe: kun den tilmeldte trup (European Squad); færre end 11 spilleklare tilmeldte (fx en tom liste): så gælder
 *  tilmeldingen ikke (*estimeret* – ellers stod holdet uden spillere) */
function euroOnly(club: number, comp?: string): Set<number> | null {
  const g = gs();
  const reg = comp && g.comps[comp]?.type === 'continental' ? euroRegistered(club) : null;
  return reg && squad(club).filter((p) => reg.has(p.id) && available(p)).length >= 11 ? reg : null;
}

function tacticFor(club: number, opp: number, home: boolean, userAuto: boolean, comp?: string): Tactic {
  const g = gs();
  const only = euroOnly(club, comp);
  if (club === g.userClub && g.userClub) return userTactic(userAuto, only);
  if (isHumanClub(club)) {
    const o = ownerOf(club);
    if (o) return withHuman(o, () => userTactic(userAuto, only));
  }
  promoteIfShort(club);
  return aiTactic(club, opp, home);
}

// ---------- kampmotoren ----------

/** Gittermotoren (porten af originalens kampmotor) i stedet for zonemotoren? Kun den originale database i ægte tilstand,
 * og kun når spillet har valgt den (Options.engine – standard i nye spil, når GRID_ENGINE_DEFAULT er sand) eller udviklerkontakten
 * localStorage `cm0102.engine` = 'original' er sat ('zone' slår den fra). */
// gittermotoren (originalens kampmotor) – bruges kun, når gridEngineOn(g) er sand
setGridFactory(gridFactory);

export function gridEngineOn(g: GameState): boolean {
  if (cmDatabase(g) !== 'original' || !authentic()) return false;
  // udviklerkontakten localStorage `cm0102.engine`: 'original' slår gittermotoren til, 'zone' fra (også i nye spil, hvor den er standard –
  // GRID_ENGINE_DEFAULT i engine/liveSim.ts)
  let dev: string | null = null;
  try { dev = typeof localStorage !== 'undefined' ? localStorage.getItem('cm0102.engine') : null; } catch { dev = null; }
  if (dev === 'zone') return false;
  // GRID_ENGINE_DEFAULT (staging, 12/11 – ejerens ønske): også spil uden valg (gemt før runde 8) får gittermotoren; 'zone' fravælger den
  return g.options.engine === 'original' || dev === 'original' || (g.options.engine === undefined && GRID_ENGINE_DEFAULT);
}

/** Hvilke kampe spiller gittermotoren? Menneskets egne kampe og alle hjemlige kampe (liga, pokal, play-off) i de spilbare (valgte) lande –
 *  som originalen, der spiller alle kampe i de indlæste ligaer med den fulde motor. Resten (Europa uden mennesket, venskabskampe, landskampe)
 *  går stadig på zonemotoren. (14/11) Før kun lande med en menneskeklub (og slet ikke, når mennesket var uden job): målt med fem valgte lande
 *  (Man Utd + Spanien, Italien, Tyskland, Frankrig) og alle hjemlige kampe på gittermotoren tager en lørdag (54–68 kampe) 2,6–4,0 s efter
 *  ydelsesrunden (søndagens lønsum i cmFinance.ts, managerens personer i cmBoardGame.ts, motoren) – før 2,8–4,9 s, søndage 5,5–9,3 s → 1,1–2,7 s. */
export function gridFixture(home: number, away: number, fixtureId?: number): boolean {
  const g = gs();
  if (isHumanClub(home) || isHumanClub(away)) return true;
  const comp = fixtureId !== undefined ? g.comps[g.fixtures[fixtureId]?.comp] : undefined;
  if (!comp || comp.type === 'continental' || comp.nation < 0) return false;
  return g.activeNations.includes(comp.nation);
}

/** Alle klubkampe laves her: zonemotoren (MatchSim), eller gittermotoren, når den er slået til og registreret
 * (setGridFactory i engine/liveSim.ts – sim.ts importerer den ikke, så bundlen er uændret). */
export function makeMatch(home: EngineTeam, away: EngineTeam, opts: EngineOptions, r: Rng): LiveSim {
  const grid = getGridFactory();
  if (grid && gridEngineOn(gs()) && gridFixture(home.club, away.club, opts.fixtureId)) return grid(home, away, opts, r);
  return new MatchSim(home, away, opts, r);
}

/** Hurtig kamp uden kommentar – som quickMatch i engine/match.ts, men gennem fabrikken */
export function makeQuickMatch(home: EngineTeam, away: EngineTeam, opts: Omit<EngineOptions, 'commentary'>, r: Rng): MatchReport {
  return makeMatch(home, away, { ...opts, commentary: false, aiSubs: opts.aiSubs ?? [true, true] }, r).runToEnd();
}

/** Kampen man ser live; playByPlay = løbende spil-for-spil som i CM 01/02 (klassisk udseende) */
export function createLiveMatch(f: Fixture, o: { playByPlay?: boolean } = {}): LiveSim {
  const m = prepareMatch(f);
  const g = gs();
  return makeMatch(m.home, m.away, {
    // udvikling: window.__cmForcePens tvinger forlænget spilletid og straffespark (til test af visningen)
    commentary: true, playByPlay: !!o.playByPlay, neutral: m.neutral, needsWinner: import.meta.env?.DEV && (globalThis as { __cmForcePens?: boolean }).__cmForcePens ? () => true : m.needsWinner, importance: m.importance, var: m.var, weather: m.weather, aggregate: m.aggregate, finish: m.finish, homeAdv: m.homeAdv, finSlope: m.finSlope, squash: m.squash, squashAtt: m.squashAtt, squashDef: m.squashDef, ease: m.ease, cards: m.cards, corners: m.corners, countBlocked: m.countBlocked, close: m.close, closeSlope: m.closeSlope, onTarget: m.onTarget, offside: m.offside, shotSpread: m.shotSpread, oneOnOneK: m.oneOnOneK, level: m.level, openDamp: m.openDamp, rules: m.rules, pitch: m.pitch, referee: m.referee, subs: maxSubs(), fixtureId: f.id, date: g.date,
    aiSubs: [f.home !== g.userClub, f.away !== g.userClub],
  }, rng);
}

export function simulateFixture(f: Fixture, userAuto = true, commentary = false): MatchReport {
  const m = prepareMatch(f, userAuto);
  const opts = { neutral: m.neutral, needsWinner: m.needsWinner, importance: m.importance, var: m.var, weather: m.weather, aggregate: m.aggregate, finish: m.finish, homeAdv: m.homeAdv, finSlope: m.finSlope, squash: m.squash, squashAtt: m.squashAtt, squashDef: m.squashDef, ease: m.ease, cards: m.cards, corners: m.corners, countBlocked: m.countBlocked, close: m.close, closeSlope: m.closeSlope, onTarget: m.onTarget, offside: m.offside, shotSpread: m.shotSpread, oneOnOneK: m.oneOnOneK, level: m.level, openDamp: m.openDamp, rules: m.rules, pitch: m.pitch, referee: m.referee, subs: maxSubs(), fixtureId: f.id, date: gs().date };
  const rep = commentary
    ? makeMatch(m.home, m.away, { ...opts, commentary: true, aiSubs: [true, true] }, rng).runToEnd()
    : makeQuickMatch(m.home, m.away, opts, rng);
  applyMatchResult(f, rep);
  // computerklubbernes kampe (CM 01/02 viser enhver spillet kamp som kampskærmen): en kompakt rapport for sæsonen – menneskets står i g.reports.
  // Venskabskampe mellem computerklubber (ingen turnering) gemmes ikke (~¼ af kampene i august).
  const g = gs();
  if (!g.reports[f.id] && !g.draft && g.comps[f.comp]) (g.miniReports ??= {})[f.id] = packReport(rep, (id) => g.players[id]?.number);
  return rep;
}

// ---------- resultatbehandling ----------

/** Målekrog til scripts (original-lab.ts): kaldes med hver kamps rapport. Påvirker intet i spillet. */
export const labHooks: { report?: (f: Fixture, rep: MatchReport) => void } = {};

/** original DB i ægte tilstand: tilskuerne sub_85cba0 (crowd.ts) og kampens økonomi FinanceTable::process_match_income 0x59a5d0 (cmFinance.ts) */
function cmGate(f: Fixture, rep?: MatchReport): { att: number; income: number } {
  const g = gs();
  const codes = fixtureCodesOf(g, f, f.comp, f.home);
  // gittermotoren har regnet kampens tilskuertal ved kampstart (init_match) – samme tal går til økonomien som i originalen
  const att = rep?.crowd ?? (gameCrowd(g, f.home, f.away, codes, cmRand(g.seed ?? 0, f.id, 0x85cba0))?.total ?? 0);
  const comp = g.comps[f.comp];
  const gate = cmMatchIncome(g, f, att, { b3a: codes.b3a, b3b: codes.b3b, b3c: codes.b3c, compRep: codes.compRep, friendly: !comp,
    leagueOfHome: !!comp && comp.type === 'league' && g.clubs[f.home]?.league === f.comp });
  return { att, income: gate / CM_GBP };
}

export function applyMatchResult(f: Fixture, rep: MatchReport) {
  const g = gs();
  labHooks.report?.(f, rep);
  const [hs, as] = rep.stats;
  const scorers: MatchResultShort['scorers'] = rep.events.filter((e) => e.k === 'goal').map((e) => (e.og ? [e.m, e.t, e.p!, 1] : [e.m, e.t, e.p!]));
  const gate = cmFinOn(g) ? cmGate(f, rep) : gateReceipts(f);
  recordResult(f, { hg: hs.goals, ag: as.goals, et: rep.et, pens: rep.pens, scorers, att: gate.att, gate: Math.round(gate.income), cards: [hs.yellows + as.yellows, hs.reds + as.reds] });
  recordsAfterMatch(f, rep, gate.att);
  achievementsAfterMatch(f, rep, gate.att);
  storyAfterMatch(f, rep, isBigMatch(f.home, f.away));
  if (g.humans) { recordH2H(f); botsAfterMatch(f); rivalryAfterMatch(f); }
  const comp = g.comps[f.comp];
  const isLeague = comp?.type === 'league';
  const played = new Set<number>();
  const cm = cmActive(g) && !g.draft;
  for (const line of rep.players) {
    const p = g.players[line.id];
    if (!p) continue;
    played.add(p.id);
    const s = p.stats;
    if (line.sub) s.subs++; else s.apps++;
    if (isLeague) { s.lgApps++; s.lgGoals += line.goals; s.lgAssists = (s.lgAssists ?? 0) + line.assists; s.lgRatingSum = (s.lgRatingSum ?? 0) + line.rating; s.lgRatingCount = (s.lgRatingCount ?? 0) + 1; if (rep.mom === p.id) s.lgMom = (s.lgMom ?? 0) + 1; }
    s.minutes += line.minutes;
    s.goals += line.goals;
    s.assists += line.assists;
    s.ratingSum += line.rating;
    s.ratingCount++;
    if (rep.mom === p.id) s.mom++;
    p.form = [...p.form, line.rating].slice(-5);
    if (p.contract?.appBonus || p.contract?.goalBonus || p.contract?.cleanSheetBonus || p.contract?.cmAssistBonus || p.addOn) afterAppearance(p, line.goals, rep.stats[1 - line.team].goals === 0, cm ? { assists: line.assists, pay: cmBonusPaid(g, f, line.team) } : undefined);
    // CM 01/02 0x8c39f0: "Fee after N League Apps." tæller konkurrencekampe (ikke venskabskampe)
    if (p.cmApps && comp) cmAppsAfterMatch(p, 'lg');
    // draft-liga: ingen træthed eller moral, der hænger ved – mange kampe kan spilles samme dag
    // (konditionsmodulet sætter konditionen og skaderne efter kampen i ægte tilstand med den originale database – cmFitAfterMatch nedenfor)
    if (!cm) p.condition = g.draft ? 100 : Math.max(20, Math.min(100, line.cond));
    const bannedBefore = p.banned;
    if (line.yellow) {
      s.yellows++;
      p.yellowCount++;
      if (p.yellowCount >= 5) { p.banned = Math.max(p.banned, 1); p.yellowCount = 0; (p.banLog ??= []).push({ d: g.date, n: 1, red: false }); }
      else if (p.yellowCount === 4 && isHumanClub(p.club)) asOwner(p.club, () => addNews({ cat: 'injury', key: 'ban.oneAway', params: { player: pname(p) }, link: { kind: 'player', id: p.id } }));
    }
    if (line.red) { s.reds++; p.banned = Math.max(p.banned, rng.int(1, 3)); p.lastRed = g.date; p.appealed = false; (p.banLog ??= []).push({ d: g.date, n: p.banned, red: true }); if (p.banLog.length > 30) p.banLog.shift(); }
    // karantæne (CM 01/02: "[spiller] banned for [n] matches") – til spillerens egen manager
    if (p.banned > bannedBefore && isHumanClub(p.club)) {
      const n = p.banned;
      asOwner(p.club, () => addNews({ cat: 'injury', key: line.red ? 'ban.red' : 'ban.yellows', params: { player: pname(p), n, pid: p.id }, link: { kind: 'player', id: p.id } }));
      // "[spiller] indiscipline costs [klub] dear": rødt kort i et tabt opgør
      const lost = line.team === 0 ? hs.goals < as.goals : as.goals < hs.goals;
      if (line.red && lost) asOwner(p.club, () => addNews({ cat: 'general', key: 'media.redCostly', params: { player: pname(p), club: g.clubs[p.club]?.name ?? '' }, link: { kind: 'player', id: p.id } }));
    }
    // unge spillere: debut og en stor kamp ("Talented [spiller] given boost", "Youngster [spiller] praised")
    if (isHumanClub(p.club) && !g.draft) {
      const age = ageOn(p.dob, g.date);
      if (age <= 19 && s.apps + s.subs === 1 && (p.history?.length ?? 0) === 0) asOwner(p.club, () => addNews({ cat: 'youth', key: 'youth.debut', params: { player: pname(p), age }, link: { kind: 'player', id: p.id } }));
      else if (age <= 20 && line.rating >= 8.5) asOwner(p.club, () => addNews({ cat: 'general', key: 'media.youngsterPraised', params: { player: pname(p), age, rating: line.rating.toFixed(1) }, link: { kind: 'player', id: p.id } }));
    }
    if (line.injured && !cm) injure(p);
    const res = line.team === 0 ? Math.sign(hs.goals - as.goals) : Math.sign(as.goals - hs.goals);
    if (!g.draft) p.morale = Math.max(1, Math.min(20, p.morale + res * 0.8 + (line.rating >= 7.5 ? 0.6 : line.rating < 5.8 ? -0.5 : 0)));
  }
  // originalens spillerdata efter kampen (0x7c0d70 statistikken, 0x4ca6d0 kontraktens tællere) – kun den originale database i ægte tilstand,
  // ingen tal fra spillets rng (cmPlayerData.ts)
  cmAfterMatch(g, f, rep, squad);
  // 0x8c39f0: arbejdstilladelsens historik (kampe spillet/ikke spillet – cmPermit.ts)
  cmPermitAfterMatch(g, f, rep, (p) => !!p.injury || p.banned > 0);
  // 0x62c080: kampkonditionen, trætheden og kampens skader (konditionsmodulet, cmFitness.ts)
  if (cm) cmFitAfterMatch(g, f, rep);
  // 0x6951e0: bestyrelsen efter kampen (efter tabellen) – begge hold (cmBoardGame.ts)
  cmBoardAfterMatch(g, f, rep);
  // 0x896290: taktiklistens statistik efter en kamp mellem to computerhold (gittermotorens valg fra pick_team/omrokeringen)
  if (cmActive(g)) recordAiTactics(f.home, f.away, hs.goals, as.goals, (c) => isHumanClub(c) || c === g.userClub);
  // karantæner afsones for spillere der ikke spillede
  for (const club of [f.home, f.away]) {
    for (const p of squad(club)) {
      if (!played.has(p.id) && p.banned > 0) p.banned--;
      if (!played.has(p.id) && isHumanClub(club)) p.unhappy = Math.min(100, (p.unhappy ?? 0) + (p.attrs[42] > 13 ? 3 : 1) * unhappyMult(p));
      else if (played.has(p.id)) p.unhappy = Math.max(0, (p.unhappy ?? 0) - 5);
    }
  }
  // holdstatistik for ligaen (til Statistik-fanen)
  if (isLeague) {
    for (const [cid, me, opp] of [[f.home, hs, as], [f.away, as, hs]] as const) {
      const c = g.clubs[cid];
      if (!c) continue;
      const st = (c.lgStats ??= { n: 0, shots: 0, sot: 0, xg: 0, xga: 0, poss: 0, cs: 0, yel: 0, red: 0 });
      st.n++; st.shots += me.shots; st.sot += me.onTarget; st.xg += me.xg; st.xga += opp.xg; st.poss += me.possession;
      if (opp.goals === 0) st.cs++;
      st.yel += me.yellows; st.red += me.reds;
    }
  }
  // præmiepenge i Europa
  if (comp?.type === 'continental') {
    const win = (comp.id === 'CL' ? 2_800_000 : 800_000) * econIncome();
    const draw = (comp.id === 'CL' ? 900_000 : 300_000) * econIncome();
    for (const [cid, gf, ga] of [[f.home, hs.goals, as.goals], [f.away, as.goals, hs.goals]] as const) {
      const c = g.clubs[cid];
      const amount = gf > ga ? win : gf === ga ? draw : 0;
      c.balance += amount + (f.stage?.startsWith('G') || f.stage === 'LP' ? 0 : win / 2);
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
    // draft-liga: ingen bestyrelse, presse eller fans
    if (!g.draft) {
      if (!cmBoardOn(g)) boardAfterMatch(scored, conceded, opp, comp?.type ?? 'league');
      // CM 01/02: "A scout from [klub] was spotted at your last match" – en klub med en af dine spillere på listen
      const mine = new Set(squad(g.userClub).map((p) => p.id));
      const watcher = rng.chance(0.3) ? Object.values(g.clubs).find((c) => c.id !== g.userClub && !isHumanClub(c.id) && (c.shortlist ?? []).some((id) => mine.has(id))) : undefined;
      if (watcher) { const pid = watcher.shortlist!.find((id) => mine.has(id))!; addNews({ cat: 'scout', key: 'scout.spotted', params: { club: watcher.name, player: pname(g.players[pid]) }, link: { kind: 'player', id: pid } }); }
      recordRivalry(opp, scored, conceded);
      resolvePressPromise(f.id, scored, conceded);
      if (extended()) invitePress(f, 'post');
      if (extended()) fansAfterMatch(g.userClub, scored, conceded, squadStrength(g.userClub), squadStrength(opp), isBigMatch(g.userClub, opp));
    }
    knowledgeAfterMatch(opp, rep.players.filter((l) => l.team === (userHome ? 1 : 0)).map((l) => l.id));
    g.reports[f.id] = rep;
    const key = scored > conceded ? 'match.won' : scored === conceded ? 'match.drew' : 'match.lost';
    // ægte CM 01/02 (den originale database): ingen nyhed om egne kampresultater – resultatet står på kampdagen
    if (!cmActive(g)) addNews({ cat: 'match', key, params: { opp: g.clubs[opp].name, score: `${scored}-${conceded}`, comp: comp?.name ?? '', club: g.clubs[g.userClub]?.short ?? '', ha: userHome ? 'h' : 'a' }, link: { kind: 'fixture', id: f.id } });
    for (const line of rep.players) {
      // den originale database i ægte tilstand: konditionsmodulet sender originalens ene skadenyhed (cmFitnessGame.ts) – ikke også denne
      if (line.injured && g.players[line.id]?.club === g.userClub && !cmActive(g)) {
        const p = g.players[line.id];
        addNews({ cat: 'injury', key: 'news.injury', params: { player: pname(p), injury: p.injury?.key ?? 'bruise', days: p.injury?.days ?? 0, club: g.clubs[g.userClub]?.short ?? '', opp: g.clubs[opp].name, score: `${scored}-${conceded}`, comp: comp?.name ?? '', res: key.slice(6) }, link: { kind: 'player', id: p.id } });
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
  if (g.draft) { days = draftInjuryDays(days); if (!days) return; }
  p.injury = { key, days, total: days };
  (p.injuryLog ??= []).push({ d: g.date, k: key, days });
  if (p.injuryLog.length > 30) p.injuryLog.shift();
}

// ---------- dagsløkke ----------

export interface DayResult {
  match?: number; // brugerens kamp skal spilles
  stop?: string; // vigtig begivenhed ('dayStart'/'dayEnd': en kampdag, man følger – se `watchedDay`)
}

/**
 * CM 01/02: på dage, hvor ens liga, ens turneringer eller en europæisk finale spiller, stopper spillet ved
 * "Evening Fixtures" før kampene og ved resultaterne bagefter – også uden egen kamp. Dage med egen kamp går
 * den sædvanlige vej (kampdagen før kampen). Returnerer en af dagens kampe (til kampdagsskærmen) eller undefined.
 */
export function watchedDay(date: string): number | undefined {
  const g = gs();
  if (!g.userClub || g.draft) return undefined;
  const me = g.clubs[g.userClub];
  const fx = fixturesOn(date).map((id) => g.fixtures[id]).filter((f): f is Fixture => !!f);
  if (fx.some((f) => f.home === g.userClub || f.away === g.userClub)) return undefined; // egen kamp i dag
  const hit = fx.find((f) => {
    const c = g.comps[f.comp];
    return f.comp === me?.league || c?.clubs.includes(g.userClub) || (f.stage === 'F' && (c?.nation === -1 || c?.nation === me?.nation));
  });
  return hit?.id;
}

function newDay() {
  const g = gs();
  // fyldspillerne (cmVirtual.ts) findes kun omkring kampene – de daglige systemer ser dem aldrig (0x90d6b0)
  cmVirtualClear(g);
  // MANAGER_MANAGER::daily_update 0x68f9c0 for dagen, der lige er spillet (efter dagens kampe – cmBoardGame.ts; kun den originale database i ægte tilstand)
  cmBoardDaily(g);
  g.date = addDays(g.date, 1);
  g.dayDone = false;
  const d = g.date;
  // draft-liga: kun kondition, moral og skader – ingen økonomi, transfers, bestyrelse eller ny sæson
  if (g.draft) { draftDay(); return; }
  if (month(d) === 7 && day(d) === 1) seasonRollover();
  intlDaily();
  reservesDaily();
  // vinduerne lukket: frie agenter, ingen ville have, forsvinder til lavere rækker/udlandet
  if (day(d) === 2 && (month(d) === 9 || month(d) === 2)) freeAgentDrift();
  // daglige ting – i ægte tilstand med den originale database styrer originalens konditionsmodul kondition og skader (cmFitness.ts; AWOL er spillets egen)
  const cmFit = cmFitOn(g);
  const cmMorale = cmFit && !MORALE_OFF;
  // 0x5cccd0's planlægger (efter datoskiftet, før dagens konditionsmodul): computerens trupplan 0x83cb40 (cmSquadPlanGame.ts)
  cmSquadPlanDaily(g);
  // League::update_for_date 0x6847c0: tv-flytningerne 4 uger frem (cmCalendar.ts – originalens skema for de engelske ligaer)
  cmCalendarDay(g);
  // (runde 10C) Europas lodtrækninger på deres dato (Cup::update_for_date 0x51f890 – cmEurope.ts)
  cmEuroDay(g);
  cmFitDay(g);
  cmPermitDaily(g);
  // Staff_Records ved turneringernes afslutning (mester/op-/nedrykning/pokal – gårsdagens sidste kampe, cmMedia.ts)
  cmRecordsDaily(g, squad);
  // 0x5ce2d0's kontraktdel (+0x44/+0x45) og klubtabellen [0xae2d14] (cmPlayerData.ts)
  cmContractDaily(g, squad);
  // 0x5ce0b0 (efter 0x5ce2d0): truppens moral efter førernes indflydelse og kontrakternes +0x44 (cmPlayerData.ts, runde 10A)
  cmSquadMoraleDaily(g, squad);
  // 0x5ce2d0's udviklingsblok (0x5d38f9–0x5d578d) og træningens ugetæller 0x8b1730 (cmDevelop.ts) – erstatter training.ts' develop()
  cmDevDaily(g);
  // Fine 0x5a5820 (0x5cdb05, lige før 0x5d6d10): de udløbne Discipline Player-poster og trænerens rapport (cmFine.ts)
  cmFineDaily(g);
  // game_update_squad_relationships 0x5d6d10 (0x5cdb0a, efter 0x5ce2d0/0x5ce0b0): forholdene i trupperne (cmRelations.ts)
  cmRelDaily(g, squad, (p, flag) => { const c = p.cmContract; if (c) withFlagCtx(g, p, cmRand(g.seed ?? 0, p.id, Math.round(Date.parse(g.date + 'T00:00:00Z') / 86400000), 0x867700), () => cmFlagSet(c, flag)); });
  // FinanceTable::daily_update 0x59b9c0 (cmFinance.ts): søndagens løn/merchandise/sæsonkort, månedens poster, sæsonopdateringen
  cmFinanceDay(g);
  for (const p of Object.values(g.players)) {
    if (p.injury && (!cmFit || p.injury.key === 'awol')) {
      p.injury.days--;
      // CM 01/02: "[spiller] resumes light training" – en uge før comeback fra en længere skade
      if (p.injury.days === 7 && (p.injury.total ?? 0) >= 21 && isHumanClub(p.club)) asOwner(p.club, () => addNews({ cat: 'injury', key: 'injury.lightTraining', params: { player: pname(p) }, link: { kind: 'player', id: p.id } }));
      if (p.injury.days <= 0) {
        const wasAwol = p.injury.key === 'awol';
        const injKey = p.injury.key;
        p.injury = null;
        if (!wasAwol) p.condition = Math.min(p.condition, 75);
        // CM 01/02: "Irwin resumes full training" – "Denis Irwin has begun full training following his foot injury."
        asOwner(p.club, () => addNews({ cat: 'injury', key: wasAwol ? 'awol.back' : 'news.recovered', params: wasAwol ? { player: pname(p) } : { player: pname(p), last: p.last, injury: injKey }, link: { kind: 'player', id: p.id } }));
      }
    }
    // restitution: en spiller med Natural Fitness 10 er klar igen 2-3 dage efter en kamp (som i CM 01/02, *estimeret*).
    // Før +4 + NF/4: med to kampe om ugen startede holdene trætte, og originalens knock-regel (< 40 % = sikkert knock) gav op til 10 skader i én kamp
    if (p.condition < 100 && !cmFit) p.condition = Math.min(100, p.condition + 9 + p.attrs[29] / 2);
    // (runde 10A) original DB i ægte tilstand: originalens daglige moral 0x5cf4c8 (cmPlayerData.ts moraleDay) i stedet for glidningen mod 13
    if (p.morale !== 13 && !(cmMorale && p.contract && p.cmContract && p.club && !p.regen)) p.morale += (13 - p.morale) * 0.02;
  }
  if (g.humans) { resolveAuctions(); resolveSignings(); resolveStaffBids(); }
  forEachHuman(windowNews);
  forEachHuman(processOffers);
  answerPendingRenewals();
  if (cmActive(g)) cmStaffOffersDaily(g);
  holidayDaily();
  squadNumbersDaily();
  euroSquadDaily();
  if (!cmBoardOn(g)) forEachHuman(processJobTalks);
  forEachHuman(() => {
    expirePress();
    // pressemøde dagen før kampen
    for (const id of fixturesOn(addDays(d, 1))) {
      const f = g.fixtures[id];
      if (f && g.userClub && (f.home === g.userClub || f.away === g.userClub) && extended()) invitePress(f, 'pre');
    }
  });
  completeProjects();
  // udvidet spil: træningslejre og prøvespillere (ikke i CM 01/02)
  if (extended()) { campDaily(); trialsDaily(); }
  friendliesDaily();
  // originalens venskabskampe for computerens klubber (Friendly::update 0x5c2460 – cmFriendly.ts; kun den originale database i ægte tilstand)
  cmFriendlyDay(g);
  forEachHuman(aiBidsForListed);
  aiPursuits();
  if (weekday(d) === 4 && extended()) forEachHuman(aiLoanOptions);
  aiTransferTick();
  forEachHuman(scoutDaily);
  if (day(d) % 3 === 0 && !cmBoardOn(g)) fillVacancies();
  if (weekday(d) === 1) {
    forEachHuman(weeklyRumours);
    if (extended()) { forEachHuman(weeklyTransferDigest); forEachHuman(weeklySummary); weeklyPlayerContact(); }
    aiReleaseClauses();
    weeklyDevelopment();
    if (!cmFinOn(g)) weeklyWages();
  }
  if (day(d) === 1) {
    // original DB i ægte tilstand: originalens økonomi (cmFinanceDay nedenfor) i stedet for spillets løn/månedsindtægter
    snapshotFinanceMonth();
    if (!cmFinOn(g)) monthlyIncome();
    // CM 01/02 0x8caee0: transfersummernes månedlige rater
    if (cmActive(g)) cmMonthlyInstalments();
    monthlyValues();
    monthlyDevelopment();
    if (extended()) { monthlyPersonality(); monthlyWill(); fansMonthly(); }
    if (month(d) !== 7) monthlyColumn();
    if (extended()) forEachHuman(boardMeeting);
    if (!(month(d) === 7)) monthlyAwards(); else snapshotMonth();
    monthlyClubReps();
    refreshShortlists();
    forEachHuman(() => {
      const { mismatches } = monthlyTrainingReport();
      const asst = Object.values(g.staff).find((s) => s.club === g.userClub && s.role === 'assistant');
      if (mismatches >= 3 && asst && month(d) % 3 === 1 && !cmActive(g)) addNews({ cat: 'general', key: 'news.trainingAdvice', params: { coach: `${asst.first} ${asst.last}`, n: mismatches } });
    });
    // den originale database i ægte tilstand: originalens bestyrelse (cmBoardGame.ts) i stedet for spillets egne fyringer og jobmarked
    if (!cmBoardOn(g)) {
      forEachHuman(boardMonthly);
      if (month(d) >= 9 || month(d) <= 4) aiSackings();
      if (month(d) === 6) summerManagerChanges();
    }
    awolMonthly();
    if (month(d) >= 1 && month(d) <= 5) aiRenewals();
    if (month(d) === 1 || month(d) === 3) forEachHuman(contractReminders);
  }
  if (month(d) >= 1 && month(d) <= 5 && weekday(d) === 3) forEachHuman(aiBosman);
  // januar-tillægget til transferbudgettet er en moderne funktion (ikke i ægte CM 01/02)
  if (month(d) === 1 && day(d) === 1 && extended()) januaryBudgetTopUp();
  if (month(d) === 2 && day(d) === 1) youthPreview();
  if (month(d) === 3 && day(d) === 15) youthIntake();
  // AI-trupper fyldes op i sommer- og vinterpausen
  if ((month(d) === 7 || month(d) === 8 || month(d) === 1) && weekday(d) === 2) aiFillSquads(22);
}

/** menneskenes klubber (fyldspillerne i egen trup – cmVirtual.ts) */
function humanClubIds(): number[] {
  const g = gs();
  return [...new Set([g.userClub, ...(g.humans ?? []).map((h) => h.userClub)])].filter(Boolean);
}

/** Spil dagens kampe (undtagen brugerens) */
function playDay(): DayResult {
  const g = gs();
  let userMatch: number | undefined;
  // AI-managere (botter) træffer dagens beslutninger, inden der spilles
  if (g.humans) botsDaily();
  for (const id of fixturesOn(g.date)) {
    const f = g.fixtures[id];
    if (!f || f.result) continue;
    if ((!isMultiplayer(g) || g.localMp) && g.userClub && (f.home === g.userClub || f.away === g.userClub)) {
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

/**
 * En menneskelig manager har overtaget en klub i et land, der ikke simuleres (ingen liga).
 * Landet gøres aktivt: ligaerne sættes op for indeværende sæson, og de kampe, der allerede
 * skulle have været spillet, simuleres med det samme (som AI-kampe), så tabellen er realistisk.
 * Pokalturneringen starter fra næste sæson.
 */
export function activateNation(nation: number) {
  const g = gs();
  if (g.activeNations.includes(nation)) return;
  g.activeNations.push(nation);
  const byLeague = new Map<string, number[]>();
  for (const c of Object.values(g.clubs)) if (c.nation === nation) (byLeague.get(c.league) ?? byLeague.set(c.league, []).get(c.league)!).push(c.id);
  const ids: string[] = [];
  for (const [id, clubs] of byLeague) {
    const m = g.leagues[id];
    if (!m || m.hidden || g.comps[id] || clubs.length < 4) continue;
    setupLeague(id, m.name, m.nation, m.tier, clubs, g.season);
    ids.push(id);
  }
  // indhent de kampe, der allerede skulle være spillet – uden at de tæller for menneskelige managere
  const humans = Object.values(g.clubs).filter((c) => c.nation === nation && c.manager === -1);
  for (const c of humans) c.manager = 0;
  const userClub = g.userClub;
  g.userClub = 0;
  try {
    const past = Object.values(g.fixtures)
      .filter((f) => ids.includes(f.comp) && !f.result && (f.date < g.date || (f.date === g.date && g.dayDone)))
      .sort((a, b) => a.date.localeCompare(b.date));
    // kampene spilles alle på samme dag – skader, karantæner og træthed fra dem ville aldrig hele, og til sidst
    // stillede holdene uden spillere (MatchSim uden målmand gik ned). De hører fortiden til, så de rulles tilbage.
    const before = new Map<number, Pick<Player, 'injury' | 'banned' | 'yellowCount' | 'condition'>>();
    for (const p of Object.values(g.players)) if (p.club && g.clubs[p.club]?.nation === nation) before.set(p.id, { injury: p.injury, banned: p.banned, yellowCount: p.yellowCount, condition: p.condition });
    for (const f of past) {
      simulateFixture(f, true, false);
      for (const cid of [f.home, f.away]) for (const p of squad(cid)) { const b = before.get(p.id); if (b) Object.assign(p, b); }
    }
  } finally {
    g.userClub = userClub;
    for (const c of humans) c.manager = -1;
  }
}

/** Lande, der kan gøres spilbare midt i et spil (Game Options → Selected Leagues): mindst én synlig liga med 4+ klubber */
export function addableNations(): number[] {
  const g = gs();
  const count = new Map<string, number>();
  for (const c of Object.values(g.clubs)) count.set(c.league, (count.get(c.league) ?? 0) + 1);
  const out = new Set<number>();
  for (const [id, m] of Object.entries(g.leagues)) {
    if (m.hidden || g.activeNations.includes(m.nation) || (count.get(id) ?? 0) < 4) continue;
    out.add(m.nation);
  }
  return [...out];
}

/** Ligger en menneskelig managers klub i en liga uden turnering? Så startes landets ligaer */
function ensureHumanLeagues() {
  const g = gs();
  forEachHuman(() => {
    const c = g.clubs[g.userClub];
    if (c && !g.comps[c.league] && g.leagues[c.league]) activateNation(c.nation);
  });
}

/**
 * Manageren skifter klub (eller siger op) midt på en kampdag: den kamp, der ventede på ham, spilles
 * automatisk, så turneringen ikke går i stå – og den nye klub starter uden en "fremmed" kamp.
 */
export function playPendingAsAi() {
  const g = gs();
  const id = g.pendingFixture;
  g.pendingFixture = null;
  const f = id ? g.fixtures[id] : undefined;
  if (f && !f.result) simulateFixture(f, true, false);
}

/** "Fortsæt" – én dag frem */
export function continueGame(pauseBefore?: (date: string) => boolean): DayResult {
  const g = gs();
  cmEuroCatchUp(g, (f) => simulateFixture(f, true, false));
  ensureHumanLeagues();
  // gamle saves: en ventende kamp, der ikke er ens egen klubs (efter et jobskifte)
  if (g.pendingFixture) {
    const f = g.fixtures[g.pendingFixture];
    if (!f || f.result || (f.home !== g.userClub && f.away !== g.userClub)) playPendingAsAi();
  }
  if (g.pendingFixture) return { match: g.pendingFixture };
  if (!g.dayDone) return playDay();
  const lastNews = g.nextId.news;
  newDay();
  cmVirtualHumans(g, humanClubIds());
  // klassisk: stop før dagens kampe (dayDone er stadig false – næste kald spiller dagen)
  if (pauseBefore?.(g.date)) return { stop: 'dayStart' };
  const r = playDay();
  if (r.match) return r;
  const fresh = g.news.filter((n) => n.id >= lastNews);
  const important = fresh.find((n) => ['transfer.incomingBid', 'transfer.bidAccepted', 'transfer.bidCountered', 'news.jobOffer', 'job.invite', 'board.sacked', 'board.sackedSeason', 'board.warning'].includes(n.key));
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

/** Simulér brugerens ventende kamp uden at se den (med kommentar, så kamprapporten har den) */
export function quickPlayUserMatch(): MatchReport | null {
  const g = gs();
  const f = g.fixtures[g.pendingFixture!];
  if (!f) return null;
  const m = prepareMatch(f, false);
  const rep = makeMatch(m.home, m.away, { commentary: true, neutral: m.neutral, needsWinner: m.needsWinner, importance: m.importance, var: m.var, weather: m.weather, aggregate: m.aggregate, finish: m.finish, homeAdv: m.homeAdv, finSlope: m.finSlope, squash: m.squash, squashAtt: m.squashAtt, squashDef: m.squashDef, ease: m.ease, cards: m.cards, corners: m.corners, countBlocked: m.countBlocked, close: m.close, closeSlope: m.closeSlope, onTarget: m.onTarget, offside: m.offside, shotSpread: m.shotSpread, oneOnOneK: m.oneOnOneK, level: m.level, openDamp: m.openDamp, rules: m.rules, pitch: m.pitch, referee: m.referee, subs: maxSubs(), fixtureId: f.id, aiSubs: [true, true], date: g.date }, rng).runToEnd();
  finishUserMatch(rep);
  return rep;
}

/** Spring frem til næste kamp. Kører i bidder så UI'et forbliver responsivt. */
/** Rene informationsnyheder (andre klubbers handler, trænerskifter, klummer, kåringer …) stopper ikke Fortsæt */
const INFO_KEYS = new Set(['res.win', 'res.draw', 'res.loss', 
  'transfer.done', 'transfer.freeDone', 'transfer.loanDone', 'news.managerSacked', 'news.managerHired', 'mgr.poached', 'column.month',
  'award.monthPlayer', 'award.monthManager', 'award.ballonDor', 'news.champions', 'news.cupWin', 'news.playoffWin', 'rumour.interest',
  'news.retired', 'news.youth', 'war.headline', 'war.result', 'war.staffHeadline', 'war.staffResult', 'transfer.digest', 'transfer.digestOne', 'ffp.sanction', 'news.promoted', 'news.relegated', 'news.split', 'press.report', 'press.reportPlain', 'news.recovered',
]);
export function needsAttention(n: NewsItem): boolean {
  if (!INFO_KEYS.has(n.key)) return true;
  // egne handler er vigtige
  const me = gs().clubs[gs().userClub]?.name;
  return !!me && (n.params.to === me || n.params.from === me || n.params.club === me);
}

export async function runUntil(opts: { untilDate?: string; untilMatch?: boolean; untilNews?: boolean; maxDays?: number; autoPlay?: boolean; onProgress?: (date: string) => void; shouldStop?: () => boolean; watchDays?: boolean }): Promise<DayResult> {
  const g = gs();
  let steps = 0;
  const firstNews = g.nextId.news;
  const startDate = g.date;
  for (;;) {
    // stop når der er kommet en ny ulæst besked (Fortsæt: kør til der sker noget)
    if (opts.untilNews && g.dayDone && g.news.some((n) => n.id >= firstNews && !n.read && needsAttention(n))) return { stop: 'news' };
    if (opts.maxDays && g.dayDone && daysBetween(startDate, g.date) >= opts.maxDays) return {};
    if (opts.shouldStop?.()) return {};
    if (opts.untilDate && g.date >= opts.untilDate && g.dayDone && !g.pendingFixture) return {};
    const paused = !g.dayDone && !g.pendingFixture;
    const clubWatch = opts.watchDays && !opts.autoPlay ? (d: string) => watchedDay(d) !== undefined : undefined;
    // slutrundedage (VM/EM …) stopper også – på resultaterne, da landskampene spilles i newDay
    const watch = clubWatch ? (d: string) => clubWatch(d) || intlDayResults(d).length > 0 : undefined;
    const r = continueGame(watch);
    // en fulgt kampdag er spillet færdig: vis resultaterne
    if (paused && clubWatch && g.dayDone && clubWatch(g.date)) return { stop: 'dayEnd' };
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
    // hver dag giver pladsen tilbage, så fremdriftsbjælken kan tegnes og siden ikke fryser
    if (++steps) {
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


/**
 * Ét multiplayer-"træk": spil dage frem til og med næste dag hvor en menneskelig manager har kamp,
 * eller til en manager får noget at forholde sig til – samme regel som Fortsæt i singleplayer (højst 14 dage).
 */
export function mpAdvance(): { days: number; reason: string } {
  const g = gs();
  const startNews = g.nextId.news;
  // forrige træk stoppede på en kampdag: menneskenes kampe er spillet live (resultaterne kom som handlinger) –
  // de kampe, ingen nåede at spille, simuleres nu, og dagen gøres færdig
  if (!g.dayDone) finishMatchDay();
  // draft-liga: sæsonen er slut – næste draft begynder
  if (g.draft && draftSeasonCheck()) return { days: 0, reason: 'season' };
  for (let i = 1; i <= 14; i++) {
    newDay();
    cmVirtualHumans(g, humanClubIds());
    const humanFixtures = fixturesOn(g.date).filter((id) => {
      const f = g.fixtures[id];
      return f && !f.result && ((isHumanClub(f.home) && !isBotClub(f.home)) || (isHumanClub(f.away) && !isBotClub(f.away)));
    });
    if (humanFixtures.length) {
      // kampdag: AI-kampene spilles nu, menneskenes kampe venter – hver manager spiller sin egen live
      if (g.humans) botsDaily();
      for (const id of fixturesOn(g.date)) {
        const f = g.fixtures[id];
        if (!f || f.result || humanFixtures.includes(id)) continue;
        simulateFixture(f, true, false);
      }
      for (const h of g.humans ?? []) {
        if (h.bot) continue;
        withHuman(h.pid, () => {
          const mine = humanFixtures.find((id) => g.fixtures[id].home === g.userClub || g.fixtures[id].away === g.userClub);
          g.pendingFixture = mine ?? null;
        });
      }
      return { days: i, reason: 'match' };
    }
    playDay();
    g.dayDone = true;
    g.pendingFixture = null;
    if (g.draft && draftSeasonCheck()) return { days: i, reason: 'season' };
    let important = false;
    // som i singleplayer: stop så snart en manager får noget at forholde sig til (bud, pressemøde, bestyrelse, jobtilbud …)
    for (const h of g.humans ?? []) if (!h.bot) withHuman(h.pid, () => { if (g.news.some((n) => n.id >= startNews && !n.read && needsAttention(n))) important = true; });
    if (important) return { days: i, reason: 'news' };
  }
  return { days: 14, reason: 'limit' };
}

/** Kampdagen gøres færdig: kampe uden resultat (manageren nåede ikke at spille) simuleres med assistenten */
function finishMatchDay() {
  const g = gs();
  for (const id of fixturesOn(g.date)) {
    const f = g.fixtures[id];
    if (!f || f.result) continue;
    const human = isHumanClub(f.home) || isHumanClub(f.away);
    simulateFixture(f, true, human);
  }
  for (const h of g.humans ?? []) withHuman(h.pid, () => { g.pendingFixture = null; });
  g.pendingFixture = null;
  g.dayDone = true;
}

/**
 * Manageren har spillet sin kamp (live eller hurtigt resultat). I online-spil sendes resultatet som en handling,
 * så værten lægger præcis samme resultat ind – dagen gøres først færdig i næste træk.
 */
export function submitMatchResult(fixture: number, rep: MatchReport) {
  const g = gs();
  const f = g.fixtures[fixture];
  if (!f || f.result || (f.home !== g.userClub && f.away !== g.userClub)) return;
  if (!isMultiplayer(g) || g.localMp) {
    if (g.pendingFixture === fixture) finishUserMatch(rep);
    else applyMatchResult(f, rep);
    return;
  }
  applyMatchResult(f, rep);
  if (g.pendingFixture === fixture) g.pendingFixture = null;
}

/** Hurtigt resultat for den ventende kamp – uden at se den */
export function quickReport(): MatchReport | null {
  const g = gs();
  const f = g.fixtures[g.pendingFixture!];
  if (!f) return null;
  const m = prepareMatch(f, false);
  return makeMatch(m.home, m.away, { commentary: true, neutral: m.neutral, needsWinner: m.needsWinner, importance: m.importance, var: m.var, weather: m.weather, aggregate: m.aggregate, finish: m.finish, homeAdv: m.homeAdv, finSlope: m.finSlope, squash: m.squash, squashAtt: m.squashAtt, squashDef: m.squashDef, ease: m.ease, cards: m.cards, corners: m.corners, countBlocked: m.countBlocked, close: m.close, closeSlope: m.closeSlope, onTarget: m.onTarget, offside: m.offside, shotSpread: m.shotSpread, oneOnOneK: m.oneOnOneK, level: m.level, openDamp: m.openDamp, rules: m.rules, pitch: m.pitch, referee: m.referee, subs: maxSubs(), fixtureId: f.id, aiSubs: [true, true], date: g.date }, rng).runToEnd();
}

/** Mandag: ugens overblik – resultater, placering, økonomi, skader og de næste kampe */
function weeklySummary() {
  const g = gs();
  const c = g.clubs[g.userClub];
  if (!c) return;
  const since = addDays(g.date, -7);
  const mine = Object.values(g.fixtures).filter((f) => (f.home === c.id || f.away === c.id));
  const played = mine.filter((f) => f.result && f.date > since && f.date <= g.date).sort((a, b) => a.date.localeCompare(b.date));
  const results = played.map((f) => {
    const home = f.home === c.id;
    const gf = home ? f.result!.hg : f.result!.ag, ga = home ? f.result!.ag : f.result!.hg;
    const pens = f.result!.pens ? (home ? f.result!.pens[0] > f.result!.pens[1] : f.result!.pens[1] > f.result!.pens[0]) : null;
    const r = gf > ga || pens === true ? t('week.w') : gf < ga || pens === false ? t('week.l') : t('week.d');
    return `${r} ${gf}-${ga} ${g.clubs[home ? f.away : f.home]?.short ?? ''}`;
  }).join(' · ');
  const comp = g.comps[c.league];
  const pos = comp ? leagueRows(comp).findIndex((r) => r.club === c.id) + 1 : 0;
  const prev = g.manager.week;
  const move = !prev || !pos || prev.pos === pos ? t('week.posSame') : prev.pos > pos ? t('week.posUp', { n: prev.pos - pos }) : t('week.posDown', { n: pos - prev.pos });
  const balance = prev ? c.balance - prev.balance : 0;
  const injured = squad(c.id).filter((p) => p.injury).length;
  const next = mine.filter((f) => !f.result && f.date > g.date).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2)
    .map((f) => `${g.clubs[f.home === c.id ? f.away : f.home]?.short ?? ''} (${f.home === c.id ? t('week.home') : t('week.away')}, ${f.date.slice(8, 10)}/${f.date.slice(5, 7)})`).join(' · ');
  g.manager.week = { pos, balance: c.balance };
  if (!prev || !played.length) return; // første mandag (kun udgangspunktet) og uger uden kampe: ingen besked
  addNews({ cat: 'general', key: 'week.summary', params: { results: results || t('week.noGames'), pos, move, balance, injured, next: next || '–' } });
}

/** CM 01/02 "Go on holiday": assistenten svarer på bud og søger job efter managerens indstillinger */
function holidayDaily() {
  const g = gs();
  const h = g.manager?.holiday;
  if (!h || !g.userClub) return;
  for (const o of g.offers.filter((x) => x.status === 'pending' && x.seller === g.userClub)) {
    const p = g.players[o.player];
    if (h.rejectAll) respondToOffer(o.id, 'reject');
    else if (h.rejectBelow && p) respondToOffer(o.id, o.fee >= askingPrice(p) ? 'accept' : 'reject');
  }
  // søg en ledig stilling i en klub med større omdømme (højst én om ugen)
  const myRep = g.clubs[g.userClub]?.rep ?? 0;
  if (h.applyJobs && g.date.endsWith('1') ) {
    const cid = (g.vacancies ?? []).filter((c) => (g.clubs[c]?.rep ?? 0) > myRep + 5 && !g.manager.jobTalks?.[c]).sort((a, b) => g.clubs[b].rep - g.clubs[a].rep)[0];
    if (cid) applyForJob(cid);
  }
}

// (runde 10C) forkørslen af Europas kampe før spillets start (newgame.ts kalder krogen; continueGame tager dem, hvis krogen manglede)
compHooks.euroCatchUp = (g) => cmEuroCatchUp(g, (f) => simulateFixture(f, true, false));
