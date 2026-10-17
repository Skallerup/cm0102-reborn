// Sæsonskifte: priser, historik, op/nedrykning, kontrakter, pensioneringer, regens.
import { finalOrder, promotionOrder } from './competitions';
import { ageOn } from './dates';
import { emptyStats, makePlayer, randomDob, randomName, randomSub, type SubPos } from './data/generate';
import { LEAGUE_RULES } from './leagues';
import { Rng, hash, rng } from './rng';
import { addNews, addPlayer, newsRelevant, gs, rebuildIndexes, removePlayer, setClub, squad } from './state';
import { boardSeasonEnd, setBoardExpectation, strengthRank } from './board';
import { seasonCareers } from './careers';
import { ffpReview, newSeasonBudgets, seasonPrizeMoney, sponsorSeasonBonus } from './finance';
import { fillSquad, setupSeasonComps } from './newgame';
import { aiFillSquads, exerciseLoanOption } from './transfers';
import { clubLevel } from './scouting';
import { CHALLENGES } from './challenges';
import { monthlyAwards, seasonGala, surpriseOfSeason, teamOfYear } from './awards';
import { initKnowledge } from './scouting';
import type { Player, SeasonSummary } from './types';
import { asOwner, forEachHuman, isHumanClub } from './humans';

const pname = (p: Player) => `${p.first} ${p.last}`.trim();

export function avgRating(p: Player) {
  return p.stats.ratingCount ? p.stats.ratingSum / p.stats.ratingCount : 0;
}

/** Sæsonens priser og historik pr. turnering */
function seasonAwards(): SeasonSummary {
  const g = gs();
  const sum: SeasonSummary = { season: g.season, comps: [] };
  for (const comp of Object.values(g.comps)) {
    if (!comp.winner) continue;
    const entry: SeasonSummary['comps'][number] = { id: comp.id, name: comp.name, winner: comp.winner };
    if (comp.type === 'league') {
      const order = finalOrder(comp);
      entry.runnerUp = order[1];
      const players = order.flatMap((cid) => squad(cid));
      const top = players.slice().sort((a, b) => b.stats.lgGoals - a.stats.lgGoals)[0];
      if (top) entry.topScorer = [top.id, top.stats.lgGoals];
      const eligible = players.filter((p) => p.stats.lgApps >= Math.max(8, comp.table[0]?.p * 0.5));
      const best = eligible.slice().sort((a, b) => avgRating(b) + b.stats.lgGoals * 0.02 - (avgRating(a) + a.stats.lgGoals * 0.02))[0];
      if (best) entry.best = best.id;
      const young = eligible.filter((p) => ageOn(p.dob, g.date) <= 21).sort((a, b) => avgRating(b) - avgRating(a))[0];
      if (young) entry.young = young.id;
      entry.teamOfYear = teamOfYear(comp);
      entry.surprise = surpriseOfSeason(comp);
      // klubhistorik
      order.forEach((cid, i) => {
        const row = comp.table.find((r) => r.club === cid);
        g.clubs[cid].history.push({ season: g.season, league: comp.id, pos: i + 1, pts: row?.pts ?? 0 });
      });
      forEachHuman(() => {
        if (!g.userClub || !order.includes(g.userClub)) return;
        if (best) addNews({ cat: 'award', key: 'award.playerOfYear', params: { player: pname(best), comp: comp.name }, link: { kind: 'player', id: best.id } });
        if (top) addNews({ cat: 'award', key: 'award.topScorer', params: { player: pname(top), goals: top.stats.lgGoals, comp: comp.name }, link: { kind: 'player', id: top.id } });
      });
    } else {
      entry.runnerUp = comp.meta?.runnerUp as number | undefined;
    }
    forEachHuman(() => {
      if (g.userClub && comp.winner === g.userClub && comp.type !== 'playoff') g.manager.trophies.push({ season: g.season, comp: comp.name, club: g.userClub });
    });
    sum.comps.push(entry);
  }
  return sum;
}

/** Op- og nedrykning. Returnerer nye ligatilhørsforhold */
function promotionRelegation() {
  const g = gs();
  const moves = new Map<number, string>();
  for (const [upper, rules] of Object.entries(LEAGUE_RULES)) {
    if (!rules.below) continue;
    const U = g.comps[upper];
    const L = g.comps[rules.below];
    if (!U?.finished || !L?.finished) continue;
    const uOrder = finalOrder(U);
    const lOrder = promotionOrder(L);
    const lRules = LEAGUE_RULES[rules.below];
    const down = uOrder.slice(uOrder.length - (rules.relegated ?? 0));
    const up = lOrder.slice(0, lRules?.promoted ?? 0);
    // playoff i nederste liga (fx Championship)
    const poLower = g.comps[`PO-${rules.below}`];
    if (poLower?.winner && poLower.playoffFor === upper) {
      up.push(poLower.winner);
    }
    // relegationsplayoff (fx 16. i Bundesliga mod 3. i 2. Bundesliga)
    const poUpper = g.comps[`PO-${upper}`];
    if (poUpper?.winner && lOrder.includes(poUpper.winner)) {
      up.push(poUpper.winner);
      const loser = (poUpper.clubs.find((c) => uOrder.includes(c)));
      if (loser) down.push(loser);
    }
    // ligastørrelserne skal bevares: lige så mange op som ned
    for (const c of uOrder.slice().reverse()) { if (up.length <= down.length) break; if (!down.includes(c)) down.push(c); }
    for (const c of lOrder) { if (down.length <= up.length) break; if (!up.includes(c)) up.push(c); }
    for (const c of down) moves.set(c, rules.below);
    for (const c of up) moves.set(c, upper);
  }
  for (const [cid, league] of moves) {
    const club = g.clubs[cid];
    const wasUp = (g.leagues[league]?.tier ?? 1) < (g.leagues[club.league]?.tier ?? 1);
    club.league = league;
    // nedrykkede AI-klubber må sælge stjernerne (nedrykningsklausuler, lønninger) – ellers vinder de næste liga med 110+ point
    if (!wasUp && !isHumanClub(cid)) {
      for (const p of squad(cid).filter((x) => !x.loan && x.contract).sort((a, b) => b.ca - a.ca).slice(0, 8)) {
        p.listed = true;
        p.listPrice = Math.max(10_000, Math.round(p.value * 0.65 / 50_000) * 50_000);
      }
    }
    forEachHuman(() => {
      if (cid === g.userClub || g.leagues[league]?.nation === g.clubs[g.userClub]?.nation) {
        addNews({ cat: 'general', key: wasUp ? 'news.promoted' : 'news.relegated', params: { club: club.name, comp: g.leagues[league]?.name ?? league } });
      }
    });
  }
}

function contractsAndLoans() {
  const g = gs();
  const today = g.date; // 1. juli
  for (const p of Object.values(g.players)) {
    if (p.loan && p.loan.until < today && !exerciseLoanOption(p)) {
      setClub(p, p.loan.from);
      p.loan = null;
    }
    if (p.contract && p.contract.expires < today) {
      if (p.contract.futureClub && g.clubs[p.contract.futureClub]) {
        const to = p.contract.futureClub;
        const fromName = g.clubs[p.club]?.name ?? '-';
        const fromClub = p.club;
        p.contract = { wage: p.contract.futureWage ?? p.contract.wage, expires: p.contract.futureExpires ?? `${g.season + 3}-06-30` };
        setClub(p, to);
        p.joined = today;
        const msg = { cat: 'transfer' as const, key: 'transfer.bosmanDone', params: { player: pname(p), from: fromName, to: g.clubs[to].name } };
        asOwner(to, () => { g.knowledge[p.id] = 100; addNews(msg); });
        if (fromClub !== to) asOwner(fromClub, () => addNews(msg));
      } else {
        asOwner(p.club, () => addNews({ cat: 'contract', key: 'contract.left', params: { player: pname(p) } }));
        setClub(p, 0);
        p.contract = null;
      }
    }
  }
}

function retirements() {
  const g = gs();
  for (const p of Object.values(g.players)) {
    const age = ageOn(p.dob, g.date);
    let prob = 0;
    const keeper = p.pos[0] >= 15;
    if (age >= (keeper ? 42 : 40)) prob = 1;
    else if (age >= 35) prob = (age - 34) * 0.16 + (p.ca < 100 ? 0.12 : 0) - (keeper ? 0.12 : 0);
    else if (age === 34) prob = p.ca < 90 ? 0.15 : 0.05;
    else if (!p.club && age >= 32) prob = 0.4;
    else if (!p.club && p.ca < 55 && age >= 24) prob = 0.5;
    if (prob > 0 && rng.chance(prob)) {
      const msg = { cat: 'general' as const, key: 'news.retired', params: { player: pname(p), age } };
      if (p.rep >= 75) forEachHuman(() => { if (newsRelevant(p.club)) addNews(msg); });
      else if (isHumanClub(p.club)) asOwner(p.club, () => addNews(msg));
      removePlayer(p);
    }
  }
}

/** Ungdomsårgang – kaldes i marts */
export function youthIntake() {
  const g = gs();
  const active = new Set(g.activeNations);
  for (const c of Object.values(g.clubs)) {
    if (!active.has(c.nation) && rng.chance(0.3)) continue; // inaktive nationer får lidt færre
    const r = new Rng(hash(g.seed, c.id, g.season, 31));
    const n = r.int(2, 4);
    for (let i = 0; i < n; i++) {
      const nation = r.chance(0.88) ? c.nation : r.pick(Object.keys(g.names).map(Number));
      const [first, last] = randomName(g.names, nation, r);
      const age = r.int(15, 17);
      const sub: SubPos = randomSub(r);
      const quality = (c.youth / 20) * 0.6 + (c.rep / 100) * 0.4;
      const ca = Math.round(28 + quality * 45 + r.normal(0, 8));
      let pa = Math.round(ca + 22 + quality * 45 + r.normal(0, 18));
      if (r.chance(0.006 + quality * 0.01)) pa = r.int(160, 195); // wonderkid
      const p = makePlayer({
        id: g.nextId.player++, first, last, dob: randomDob(age, g.date, r), nation, club: c.id, sub,
        foot: r.chance(0.25) ? 'L' : 'R', height: 0, ca, pa: Math.min(200, Math.max(ca + 5, pa)), date: g.date, seed: g.seed, regen: true,
        contractEnd: `${g.season + 3}-06-30`,
      });
      p.value = Math.max(10_000, p.value);
      if (p.contract) p.contract.wage = Math.max(150, Math.round(p.contract.wage * 0.3 / 50) * 50);
      addPlayer(p);
      asOwner(c.id, () => {
        g.knowledge[p.id] = 100;
        addNews({ cat: 'youth', key: 'news.youth', params: { player: pname(p), pos: sub }, link: { kind: 'player', id: p.id } });
      });
    }
  }
}

function archiveStats() {
  const g = gs();
  for (const p of Object.values(g.players)) {
    if (p.stats.apps + p.stats.subs > 0) {
      p.history.push({ season: g.season, club: p.club, apps: p.stats.apps + p.stats.subs, goals: p.stats.goals, assists: p.stats.assists, avg: Math.round(avgRating(p) * 100) / 100 });
      if (p.history.length > 25) p.history.shift();
    }
    p.stats = emptyStats();
    p.yellowCount = 0;
    p.banned = 0;
    p.form = [];
  }
}

function updateClubReps() {
  const g = gs();
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league') continue;
    const order = finalOrder(comp);
    order.forEach((cid, i) => {
      const c = g.clubs[cid];
      const expectedRank = order.slice().sort((a, b) => g.clubs[b].rep - g.clubs[a].rep).indexOf(cid);
      c.rep = Math.max(3, Math.min(99, Math.round(c.rep + (expectedRank - i) * 0.6 + (i === 0 ? 2 : 0))));
    });
  }
  if (g.comps.CL?.winner) g.clubs[g.comps.CL.winner].rep = Math.min(99, g.clubs[g.comps.CL.winner].rep + 3);
}

function prune() {
  const g = gs();
  // fri agenter med lav værdi forsvinder
  const free = Object.values(g.players).filter((p) => !p.club);
  for (const p of free) {
    const age = ageOn(p.dob, g.date);
    // klubløse der ikke er gode nok, eller er for gamle til at få kontrakt, forsvinder ud af fodbolden
    if ((p.ca < 85 && age >= 25) || (age >= 33 && p.ca < 100) || age >= 38 || (p.ca < 45 && age >= 21)) removePlayer(p);
  }
  // gamle kampe og rapporter
  g.fixtures = {};
  const reportIds = Object.keys(g.reports).map(Number).sort((a, b) => b - a);
  for (const id of reportIds.slice(40)) delete g.reports[id];
}

/** Kaldes 1. juli */
export function seasonRollover() {
  const g = gs();
  seasonPrizeMoney();
  monthlyAwards(); // juni-kåringer inden arkivering
  const summary = seasonAwards();
  seasonGala(summary);
  g.seasonHistory.push(summary);
  // Udfordringer og bestyrelsens dom – pr. menneskelig manager
  const challengeResults = new Map<string | undefined, 'won' | 'lost'>();
  ffpReview();
  forEachHuman(() => {
    const club = g.clubs[g.userClub];
    if (club) {
      const comp = g.comps[club.league];
      const pos = comp ? finalOrder(comp).indexOf(club.id) + 1 : 99;
      const trophy = Object.values(g.comps).some((c) => c.winner === club.id && c.type !== 'playoff');
      sponsorSeasonBonus(pos, g.board.expectedPos, trophy);
    }
    if (g.challenge && !g.challenge.done) {
      const ch = CHALLENGES.find((c) => c.id === g.challenge!.id);
      if (ch?.check(g)) challengeResults.set(g.active, 'won');
      else if (g.season >= g.challenge.deadlineSeason) challengeResults.set(g.active, 'lost');
    }
    boardSeasonEnd();
  });
  seasonCareers((cid) => strengthRank(g.clubs[cid]).rank);
  updateClubReps();
  const prevTables: Record<string, number[]> = {};
  for (const comp of Object.values(g.comps)) if (comp.type === 'league' && comp.finished) prevTables[comp.id] = finalOrder(comp);
  promotionRelegation();
  // ligaer kan have skiftet klubber → opdater prevTables så europæiske pladser kun gives til tier-1
  for (const [lg, order] of Object.entries(prevTables)) prevTables[lg] = order.filter((cid) => g.clubs[cid].league === lg);
  archiveStats();
  contractsAndLoans();
  retirements();
  prune();
  g.comps = {};
  g.season += 1;
  rebuildIndexes();
  // ingen klub må starte sæsonen med for få spillere
  aiFillSquads(20);
  for (const c of Object.values(g.clubs)) {
    const sq = squad(c.id);
    if (c.manager === -1) {
      // menneskestyret klub: reserveholdet sørger for at der er nok spillere til at stille hold
      if (sq.length < 16) {
        const before = sq.length;
        fillSquad(c, sq, clubLevel(c.id) - 15, g.date, hash(g.seed, g.season, c.id), 16);
        asOwner(c.id, () => addNews({ cat: 'youth', key: 'news.reservesPromoted', params: { n: squad(c.id).length - before } }));
      }
      continue;
    }
    if (sq.length < 18) fillSquad(c, sq, clubLevel(c.id) - 6, g.date, hash(g.seed, g.season, c.id), 20);
  }
  newSeasonBudgets();
  setupSeasonComps(g.season, prevTables);
  for (const c of Object.values(g.clubs)) if (c.manager !== -1) c.tactic = null;
  forEachHuman(() => {
    if (g.userClub) { setBoardExpectation(); addNews({ cat: 'finance', key: 'sponsor.offers', params: {} }); }
    initKnowledgeKeep();
    const result = challengeResults.get(g.active);
    if (result && g.challenge) {
      g.challenge.done = result;
      addNews({ cat: 'general', key: result === 'won' ? 'challenge.won' : 'challenge.lost', params: { id: g.challenge.id } });
    }
  });
  addNews({ cat: 'general', key: 'news.newSeason', params: { season: `${g.season}/${String(g.season + 1).slice(2)}` } }, { all: true });
}

function initKnowledgeKeep() {
  const g = gs();
  const old = g.knowledge;
  initKnowledge();
  for (const [k, v] of Object.entries(old)) g.knowledge[Number(k)] = Math.max(g.knowledge[Number(k)] ?? 0, v * 0.85);
}
