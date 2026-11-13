// Originalens bestyrelse og managerjob (cmBoard.ts) i vores spil: spiltilstanden → originalens felter (BoardEnv) og tilbage (manageren skifter,
// nyhederne til mennesket, Board-skærmens tal). Kun den originale database i ægte tilstand (cmBoardOn) – ellers bruger spillet board.ts' regler.
//
// Tidspunkterne som i originalen: spilstarten 0x68f130 (på databasens dato 1/1, før forkørslen – vi har ingen forkørsel, så "i dag" er 1/1 og
// spillets start [0xdd6ec8] = spillets første dag), hver dag 0x68f9c0 efter dagens kampe (sim.ts newDay kalder cmBoardDaily for dagen, der lige er
// spillet), efter hver kamp 0x6951e0 (efter tabellen – sim.ts applyMatchResult), sæsonens opsætning League::set_club_season_expectations 0x68aa80
// (season.ts, for hver liga) og menneskets overtagelse 0x826f20/0x69ebc0.
//
// Spillets data, der ikke findes som i originalen (inddata – *afvigelser*, ikke regler):
//   - personerne: world-filens stab med ikke-spillerpost (2.451 i 3.9.60 – originalen har ~8.900 i hukommelsen med England valgt) + menneskene;
//     spillets genererede stab har ingen ikke-spillerpost (np = NULL i originalens forstand) og er ikke kandidater
//   - Comp_Stats' +0x72 = sidste sæsons placering (club +0x5f, GameState.cmClubStat), +0x73/+0x74/+0x75 = nuværende/bedste/dårligste placering i
//     sæsonen (vi fører dem efter hver ligakamp), stimerne af tabellens form; 0x4ae300's projicerede placering = den nuværende
//   - UefaSeeding: spillets CL_SPOTS/UEFA_SPOTS efter landets rang; ingen europæisk Comp_Stats-post (bit 0x400 sættes ikke)
//   - transferbudgettet 0x598800 = Club.transferBudget (£), formuebåndet 0x5986b0 af saldoen (£)
//   - 0x844780 (viljen) – se interestOf
import type { Club, Fixture, GameState, MatchReport, Staff } from './types';
import { squad, addNews } from './state';
import { cmActive, cmRand, clubRepMem, postHooks } from './cmPlayerData';
import { financeStatus } from './cmSquadPlan';
import { clubSeason } from './cmFitness';
import { CL_SPOTS, UEFA_SPOTS, UEFA_NATIONS, rulesFor } from './leagues';
import { leagueRows, nationRanking } from './competitions';
import { ageOn } from './dates';
import { careerEnd, careerStart } from './careers';
import { fixtureCodesOf } from './engine/grid/gameInputs';
import {
  type BoardEnv, type BoardNews, type BoardRec, type CmBoardState, type CmDate, type LeagueInfo, type MatchIn, type Person, type StatsEntry,
  HUMAN0, addVacancy, afterMatch, applyForJob, boardDaily, cmToIso, confidenceBand, initRecords, initStaffRep, humanAppointRep, isoToCm, resetForNewManager,
  setSeasonExpectations, s16, weeklyUpdate, managerRepAfterMatch,
} from './cmBoard';
import type { CMWorld } from './data/cm0102';

const GBP = 0.86;
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** gælder kun den originale database i ægte tilstand og ikke fællesspil/draft/udfordringer */
export function cmBoardOn(g: GameState): boolean {
  return cmActive(g) && !g.draft && !!g.cmBoard;
}

// ---------------------------------------------------------------- personerne

const JOB: Record<string, number> = { manager: 5, assistant: 6, coach: 8, scout: 9, physio: 10 };
const UK = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic Of Ireland', 'Ireland']);

function staffPerson(_g: GameState, s: Staff, today: CmDate): Person {
  const hid = s.cmHid ?? [];
  const np = s.cmNp!;
  const rep = (s.cmRep ??= [1, 1, 1]);
  const p: Person = {
    id: s.id, human: false, np: true, nation: s.nation ?? -1,
    get club() { return s.club; }, set club(v: number) { s.club = v; },
    get job() { return s.club ? JOB[s.role] ?? 8 : 0; }, set job(_v: number) { /* rollen sættes af setManager */ },
    get joined() { return isoToCm(s.cmJoined || '1990-01-01'); }, set joined(d: CmDate) { s.cmJoined = cmToIso(d); },
    age: s.dob ? ageOn(s.dob, cmToIso(today)) : 45,
    get b59() { return hid[3] ?? 10; }, set b59(v: number) { hid[3] = v; },
    det: hid[2] ?? 10, pres: hid[4] ?? 10, prof: hid[5] ?? 10, temper: hid[7] ?? 10, amb: hid[1] ?? 10, b22: hid[8] ?? 0,
    ca: s.ca ?? 0, pa: s.cmPa ?? 0, at: (off: number) => np[off - 0x0e] ?? 0, rep,
  };
  return p;
}
interface HumanRef { get: () => { userClub: number; manager: GameState['manager'] }; k: number }
function humanPerson(g: GameState, h: HumanRef): Person {
  const m = () => h.get().manager;
  const rep = (m().cmRep ??= [1, 1, 1]);
  return {
    id: HUMAN0 + h.k, human: true, np: true, nation: m().nation,
    get club() { return h.get().userClub; }, set club(_v: number) { /* */ },
    get job() { return h.get().userClub ? 5 : 0; }, set job(_v: number) { /* */ },
    get joined() { return isoToCm(m().cmJoined || g.date); }, set joined(d: CmDate) { m().cmJoined = cmToIso(d); },
    age: 40,
    get b59() { return m().cmB59 ?? 20; }, set b59(v: number) { m().cmB59 = v; },
    det: 10, pres: 10, prof: 10, temper: 10, amb: 10, b22: 0, ca: 0, pa: 0, at: () => 0, rep,
  };
}
function humanRefs(g: GameState): HumanRef[] {
  if (!g.humans?.length) return [{ get: () => ({ userClub: g.userClub, manager: g.manager }), k: 0 }];
  return g.humans.map((h, k) => ({ get: () => (h.pid === g.active ? { userClub: g.userClub, manager: g.manager } : { userClub: h.userClub, manager: h.manager }), k }));
}

// ---------------------------------------------------------------- turneringstabellen (Comp_Stats)

function leagueOf(g: GameState, c: number): string | null {
  const club = g.clubs[c];
  if (!club) return null;
  const comp = g.comps[club.league];
  return comp && comp.type === 'league' && !g.leagues[club.league]?.hidden ? club.league : null;
}
const compNum = (lid: string) => { const m = /^CM(\d+)$/.exec(lid); return m ? +m[1] : -1; };

function entryOf(g: GameState, c: number, today: CmDate): StatsEntry | null {
  const lid = leagueOf(g, c);
  if (!lid) return null;
  const comp = g.comps[lid];
  const row = comp.table.find((r) => r.club === c);
  if (!row) return null;
  const tr = g.cmBoard?.tab?.[c];
  const pos = g.cmClubStat?.[c]?.[3] ?? 0;
  const form = row.form ?? '';
  const trail = (pred: (ch: string) => boolean) => { let n = 0; for (let i = form.length - 1; i >= 0 && pred(form[i]); i--) n++; return n; };
  const last5 = form.slice(-5);
  let pts = 0, n = 0;
  for (const ch of last5) { if (ch === 'W') { pts += 3; n++; } else if (ch === 'D') { pts += 1; n++; } else if (ch === 'L') n++; }
  const cur = row.p > 0 ? leagueRows(comp).findIndex((r) => r.club === c) + 1 : 0;
  // +0x74/+0x75: bedst/dårligst mulige slutplacering (League::update_projected_positions 0x68ac40 – ikke afkodet; regnet af point og resterende
  // ligakampe, uden målforskel – *afledt*); før første kamp 0/0 (p74 == p75 = "intet afgjort/førsæson")
  let best = 0, worst = 0;
  if (row.p > 0) {
    const lm = leftMap(g, lid);
    const left = (club: number) => lm.get(club) ?? 0;
    const myMax = row.pts + 3 * left(c);
    best = 1 + comp.table.filter((r) => r.club !== c && r.pts > myMax).length;
    worst = 1 + comp.table.filter((r) => r.club !== c && r.pts + 3 * left(r.club) >= row.pts).length;
  }
  return {
    pos: pos > 0 ? pos : 0, p73: cur, p74: best, p75: worst, played: row.p,
    winRun: trail((ch) => ch === 'W'), lossRun: trail((ch) => ch === 'L'), noWinRun: trail((ch) => ch !== 'W'), unbeatenRun: trail((ch) => ch !== 'L'),
    lastDays: tr?.[2] !== undefined ? dayNum(cmToIso(today)) - tr[2] : 999, formPts: pts, formN: n, projected: best,
  };
}

let leftGen = 0;
let leftCache: { key: string; m: Map<string, Map<number, number>> } = { key: '', m: new Map() };
/** resterende ligakampe pr. klub (cache pr. dag og antal spillede kampe) */
function leftMap(g: GameState, lid: string): Map<number, number> {
  const key = `${g.date}:${leftGen}`;
  if (leftCache.key !== key) leftCache = { key, m: new Map() };
  let m = leftCache.m.get(lid);
  if (!m) {
    m = new Map();
    for (const f of Object.values(g.fixtures)) if (f.comp === lid && !f.result) { m.set(f.home, (m.get(f.home) ?? 0) + 1); m.set(f.away, (m.get(f.away) ?? 0) + 1); }
    leftCache.m.set(lid, m);
  }
  return m;
}

function leagueInfo(g: GameState, lid: string): LeagueInfo | null {
  const comp = g.comps[lid];
  if (!comp) return null;
  const rules = g.customRules?.[lid] ?? rulesFor(lid, comp.clubs.length);
  const promo = rules.promoted ?? 0;
  const playoff = rules.playoff?.seeds.filter(([l]) => l === lid).length ?? 0;
  const lp = compNum(lid);
  return { teams: comp.clubs.length, autoPromo: promo > 0, promo, playoff, relegation: rules.relegated ?? 0, rep: lp >= 0 ? g.cmCompRep?.[lp] ?? 0 : 0 };
}

// ---------------------------------------------------------------- miljøet

/** midlertidig manager (0x6a4f80: "som om han havde jobbet") */
const tempManager = new Map<number, Person | null>();

export function boardEnv(g: GameState, todayIso = g.date, startIso?: string): BoardEnv {
  const today = isoToCm(todayIso);
  const gameStart = isoToCm(startIso ?? g.cmBoardStart ?? g.date);
  let persons: Person[] | null = null;
  const byId = new Map<number, Person>();
  const allPersons = () => {
    if (persons) return persons;
    persons = [];
    for (const s of Object.values(g.staff).sort((a, b) => a.id - b.id)) if (s.cmNp) { const p = staffPerson(g, s, today); persons.push(p); byId.set(p.id, p); }
    for (const h of humanRefs(g)) { const p = humanPerson(g, h); persons.push(p); byId.set(p.id, p); }
    return persons;
  };
  const personOfStaff = (id: number) => { allPersons(); return byId.get(id) ?? null; };
  const humanOfClub = (c: number) => allPersons().find((p) => p.human && p.club === c) ?? null;
  const nationName = (n: number) => g.nations[n]?.name ?? '';
  const ranking = nationRanking();
  const env: BoardEnv = {
    today, gameStart,
    clubs: Object.keys(g.clubs).map(Number).sort((a, b) => a - b),
    clubRep: (c) => clubRepMem(g, c),
    clubNation: (c) => g.clubs[c]?.nation ?? -1,
    division: (c) => leagueOf(g, c),
    lastDivision: (c) => { const ld = g.cmClubStat?.[c]?.[2]; return ld !== undefined && ld > 0 ? `CM${ld}` : leagueOf(g, c); },
    divLevel: (div) => { const n = compNum(div); return n >= 0 ? g.cmCompRep?.[n] ?? 0 : 0; },
    league: (div) => leagueInfo(g, div),
    canBeManaged: (c) => !!leagueOf(g, c) && g.activeNations.includes(g.clubs[c].nation),
    activeLeague: (c) => !!leagueOf(g, c) && g.activeNations.includes(g.clubs[c].nation),
    entry: (c) => entryOf(g, c, today),
    euroEntry: () => null,
    nationPlaces: (c) => {
      const n = g.clubs[c]?.nation;
      if (n === undefined || !UEFA_NATIONS.has(nationName(n))) return [1, 1];
      const r = ranking.indexOf(n);
      return r < 0 ? [1, 1] : [CL_SPOTS[r] ?? 1, UEFA_SPOTS[r] ?? 1];
    },
    isAustralia: (c) => nationName(g.clubs[c]?.nation ?? -1) === 'Australia',
    wealthBand: (c) => financeStatus(Math.round((g.clubs[c]?.balance ?? 0) * GBP), clubRepMem(g, c)),
    transferBudget: (c) => Math.round((g.clubs[c]?.transferBudget ?? 0) * GBP),
    balance: (c) => Math.round((g.clubs[c]?.balance ?? 0) * GBP),
    chair: (c) => { const x = g.cmChair?.[c]; return x ? { b16: x[0], b1d: x[1], amb: x[2], nation: x[3] } : null; },
    manager: (c) => {
      if (tempManager.has(c)) return tempManager.get(c)!;
      const m = g.clubs[c]?.manager ?? 0;
      if (m === -1) return humanOfClub(c);
      if (m > 0) { const s = g.staff[m]; return s?.cmNp ? personOfStaff(m) : s ? noNp(s) : null; }
      return null;
    },
    assistant: (c) => { const s = Object.values(g.staff).find((x) => x.club === c && x.role === 'assistant'); return s ? (s.cmNp ? personOfStaff(s.id) : noNp(s)) : null; },
    firstCoach: (c) => { const s = Object.values(g.staff).find((x) => x.club === c && x.role === 'coach'); return s ? (s.cmNp ? personOfStaff(s.id) : noNp(s)) : null; },
    persons: allPersons,
    person: (id) => { allPersons(); return byId.get(id) ?? (g.staff[id] ? noNp(g.staff[id]) : null); },
    nat75: (n) => g.cmNationBoard?.[n]?.[0] ?? 0,
    nat85: (n) => g.cmNationBoard?.[n]?.[1] ?? 0,
    nat7e: (n) => g.cmNation7e?.[n] ?? 0,
    isHumanClub: (c) => g.clubs[c]?.manager === -1,
    humanOnHolidaySearching: (p) => p.human && !!humanRefs(g)[p.id - HUMAN0]?.get().manager.holiday?.applyJobs,
    fluency: (p, c) => {
      const cl = g.nations[g.clubs[c]?.nation ?? -1]?.lang?.[0], pl = g.nations[p.nation]?.lang?.[0];
      return cl !== undefined && cl === pl ? 10 : 0;
    },
    foreign: (p, n) => {
      if (n < 0) return true;
      if (p.nation === n) return false;
      if (UK.has(nationName(n)) && UK.has(nationName(p.nation))) return false;
      const AN = new Set(['Australia', 'New Zealand']);
      if (AN.has(nationName(n)) && AN.has(nationName(p.nation))) return false;
      if (nationName(n) === 'Italy' && nationName(p.nation) === 'Ukraine') return false;
      return true;
    },
    interest: (p, c) => interestOf(g, p, c),
    retiring: () => false,
    inSeason: (c) => clubSeason(g.clubs[c]?.nation, dayNum(todayIso))[0],
    nextFixture: (c, days) => {
      const from = dayNum(todayIso), to = from + days;
      const f = Object.values(g.fixtures).filter((x) => (x.home === c || x.away === c) && !x.result && dayNum(x.date) > from && dayNum(x.date) <= to)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      return f ? { opp: f.home === c ? f.away : f.home, hasComp: !!g.comps[f.comp] } : null;
    },
    underOffer: () => false,
    inEurope: (c) => Object.values(g.comps).some((x) => x.type === 'continental' && x.clubs.includes(c) && !/intertoto/i.test(x.name)),
    inEuropeAny: (c) => Object.values(g.comps).some((x) => x.type === 'continental' && x.clubs.includes(c)),
    pro: (c) => (g.cmClubStat?.[c]?.[0] ?? 1) === 1,
    lowNation: (c) => ['Wales', 'Republic Of Ireland', 'Ireland', 'Northern Ireland'].includes(nationName(g.clubs[c]?.nation ?? -1)),
    setManager: (c, p, old) => setManagerGame(g, env, c, p, old),
    news: (n) => boardNews(g, env, n),
  };
  return env;
}
/** spillets genererede stab: ingen ikke-spillerpost (np = NULL) */
function noNp(s: Staff): Person {
  return { id: s.id, human: false, np: false, nation: s.nation, club: s.club, job: s.club ? JOB[s.role] ?? 8 : 0, joined: isoToCm(s.cmJoined || '1990-01-01'), age: 45,
    b59: 10, det: 10, pres: 10, prof: 10, temper: 10, amb: 10, b22: 0, ca: 0, pa: 0, at: () => 0, rep: [1, 1, 1] };
}

/** 0x844780 staff_interest_in_job_at_club(s, c, 0, 5, NULL) – sat af cmBoardInterest.ts, når den er porteret */
export const interestHook: { fn?: (g: GameState, p: Person, c: number) => number } = {};
function interestOf(g: GameState, p: Person, c: number): number {
  return interestHook.fn ? interestHook.fn(g, p, c) : 10;
}

// ---------------------------------------------------------------- skrivere

function setManagerGame(g: GameState, _env: BoardEnv, c: number, p: Person | null, old: number): void {
  const club = g.clubs[c];
  if (!club) return;
  if (old === -2) { if (p) tempManager.set(c, p); else tempManager.delete(c); return; }
  if (!p) {
    // afgang: manageren forlader klubben (0x69b790 → 0x690890)
    const m = club.manager;
    if (m === -1) humanLeaves(g, c);
    else if (m > 0) { const s = g.staff[m]; if (s) { careerEnd(s, 'sacked'); s.club = 0; } }
    club.manager = 0;
    club.tactic = null;
    return;
  }
  if (p.human) return;                                                  // mennesket ansættes via acceptJob (0x69ebc0)
  const s = g.staff[p.id];
  if (!s) return;
  const from = g.clubs[s.club];
  if (from && from.manager === s.id) { from.manager = 0; from.tactic = null; }
  if (s.club && s.club !== c) careerEnd(s, 'poached');
  s.club = c; s.role = 'manager';
  club.manager = s.id; club.tactic = null;
  careerStart(s, c);
}

function humanLeaves(g: GameState, c: number): void {
  const doIt = () => {
    if (g.userClub !== c) return;
    g.manager.sacked++;
    g.manager.sackedBy = [...(g.manager.sackedBy ?? []), c].slice(-10);
    g.userClub = 0; g.tactic = null; g.pendingFixture = null;
  };
  if (!g.humans?.length) doIt();
  else for (const h of g.humans) if (h.userClub === c || (h.pid === g.active && g.userClub === c)) { import('./humans').then(() => undefined); doIt(); }
}

const EXP_KEY = (f: number) => (f & 0x02 ? 'title' : f & 0x01 ? 'top3' : f & 0x04 ? 'promotion' : f & 0x08 ? 'playoffs' : f & 0x40 ? 'tophalf' : f & 0x30 ? 'survive' : 'mid');

function boardNews(g: GameState, _env: BoardEnv, n: BoardNews): void {
  const clubName = (c: number) => g.clubs[c]?.name ?? '';
  const mname = (p: Person) => { const s = g.staff[p.id]; return s ? `${s.first} ${s.last}`.trim() : g.manager.name; };
  const mine = (c: number) => c === g.userClub;
  switch (n.t) {
    case 'expect':
      if (mine(n.club)) {
        g.board.expectation = EXP_KEY(n.flags);
        g.board.expectedPos = g.cmBoard!.rec[n.club]?.t2c ?? g.board.expectedPos;
        addNews({ cat: 'board', key: `board.exp.${EXP_KEY(n.flags)}`, params: { club: clubName(n.club) } });
      }
      return;
    case 'confidence':
      if (mine(n.club)) addNews({ cat: 'board', key: 'board.update', params: { club: clubName(n.club), ...statementOf(g, n.club) } });
      return;
    case 'jobOffer':
      if (n.human.id === HUMAN0 && !g.jobOffers.includes(n.club)) {
        g.jobOffers.push(n.club);
        addNews({ cat: 'job', key: 'news.jobOffer', params: { club: clubName(n.club) }, link: { kind: 'club', id: n.club } });
      }
      return;
    case 'applyReply':
      if (n.human.id === HUMAN0) addNews({ cat: 'job', key: 'job.applied', params: { club: clubName(n.club) }, link: { kind: 'club', id: n.club } });
      return;
    case 'departed':
      if (n.manager.human) { if (mine(n.club)) addNews({ cat: 'job', key: n.type === 2 ? 'job.resigned' : 'board.sacked', params: { club: clubName(n.club) } }); }
      else if (newsOn(g, n.club)) addNews({ cat: 'job', key: 'news.managerSacked', params: { club: clubName(n.club), manager: mname(n.manager) }, link: { kind: 'club', id: n.club } });
      return;
    case 'appointed':
      if (newsOn(g, n.club)) addNews({ cat: 'job', key: 'news.managerHired', params: { club: clubName(n.club), manager: mname(n.manager) }, link: { kind: 'club', id: n.club } });
      return;
    case 'pressure': case 'ultimatum': case 'protest':
      if (mine(n.club)) addNews({ cat: 'board', key: 'board.warning', params: { club: clubName(n.club) } });
      return;
    default: return;
  }
}
/** 0x6a2e00/0x6a1b00: klubber med omdømme > 7250 til alle, ellers til managere i samme land */
function newsOn(g: GameState, c: number): boolean {
  const club = g.clubs[c], me = g.clubs[g.userClub];
  if (!club) return false;
  return clubRepMem(g, c) > 7250 || !me || me.nation === club.nation;
}

/** Board-skærmens tekstkoder (boardStatementCodes) af originalens tillid: bånd 0x690b70 (+6) */
export function statementOf(g: GameState, c: number): { lvl: string; fin: string; fans: string } {
  const R = g.cmBoard?.rec[c];
  const band = R ? confidenceBand(R.w6) : 3;
  const lvl = band >= 5 ? 'delighted' : band === 4 ? 'positive' : band === 3 ? 'satisfied' : band === 2 ? 'concerned' : 'angry';
  const wb = financeStatus(Math.round((g.clubs[c]?.balance ?? 0) * GBP), clubRepMem(g, c));
  const fin = wb === 2 ? 'extreme' : wb === 1 ? 'healthy' : wb === 0 ? 'secure' : wb === -1 ? 'stretched' : 'debt';
  const f16 = R ? s16(R.w16) : 0;
  const fans = f16 > 250 ? 'rapport' : f16 < -250 ? 'unhappy' : 'ok';
  return { lvl, fin, fans };
}

// ---------------------------------------------------------------- spillets kroge

const rnd = (g: GameState, ...k: number[]) => cmRand(g.seed, ...k);

/** newgame.ts: ikke-spillerpostens omdømme for databasens stab (sub_535a80) – kaldt af addDbStaff */
export function cmInitStaffRep(g: GameState, s: Staff, row: NonNullable<CMWorld['staff']>[number]): void {
  const bx = row[12];
  if (!bx || !s.cmNp) return;
  const clubRep = s.club ? clubRepMem(g, s.club) : null;
  s.cmRep = initStaffRep([bx[0], row[8], bx[1]], clubRep !== null ? [clubRep, g.clubs[s.club]?.nation ?? -1] : null, s.nation);
  s.cmHid = bx.slice(2, 11);
  s.cmJoined = row[13] || '';
}

/** newgame.ts: spilstarten 0x68f130 (på databasens dato 1/1) – efter at klubber, stab og turneringer findes */
export function cmBoardInit(g: GameState, chair: Record<number, [number, number, number, number]> | undefined, nationBoard: [number, number, number][] | undefined): void {
  if (!cmActive(g) || g.draft) return;
  g.cmChair = chair ? { ...chair } : {};
  g.cmNationBoard = nationBoard ? nationBoard.map((x) => x.slice() as [number, number, number]) : [];
  g.cmBoardStart = g.date;
  g.cmBoard = { rec: {}, dep: [], vac: [], ult: [], month: -1, tab: {} };
  const db = `${g.date.slice(0, 4)}-01-01`;
  const env = boardEnv(g, db, g.date);
  initRecords(env, stateOf(g), rnd(g, dayNum(db), 0x68f130));
}

const stateOf = (g: GameState) => g.cmBoard as unknown as CmBoardState;

/** newgame.ts takeOverClub: 0x826f20 appoint_human_manager_to_club → 0x69ebc0 → 0x694c80 */
export function cmBoardHumanAppoint(g: GameState, club: Club, hadAiManager: boolean): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g);
  void hadAiManager;
  g.manager.cmRep = humanAppointRep(clubRepMem(g, club.id));
  g.manager.cmB59 = 20;
  g.manager.cmJoined = g.date;
  st.vac = st.vac.filter((e) => e.club !== club.id);
  const env = boardEnv(g);
  resetForNewManager(env, st, club.id, rnd(g, dayNum(g.date), 0x694c80, club.id));
  syncHuman(g);
}

/** acceptJob (0x6b287c → 0x69ebc0 appoint_manager_to_club): den gamle klub får en ledig stilling, den nye manager og bestyrelsen nulstilles */
export function cmBoardAcceptJob(g: GameState, cid: number, oldClub: number): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const rand = rnd(g, dayNum(g.date), 0x69ebc0, cid);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  if (oldClub && env.activeLeague(oldClub)) addVacancy(env, st, oldClub, h, rand);
  recOfG(g, cid).d20 = { day: 234, year: 1971 };
  g.manager.cmJoined = g.date;
  resetForNewManager(env, st, cid, rand);
  syncHuman(g);
}
const recOfG = (g: GameState, c: number): BoardRec => (stateOf(g).rec[c] ??= ({} as BoardRec));

/** declineJob (0x6b281d): jobbet søges igen uden ham */
export function cmBoardDeclineJob(g: GameState, cid: number): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  st.vac = st.vac.filter((e) => e.club !== cid);
  addVacancy(env, st, cid, h, rnd(g, dayNum(g.date), 0x6b281d, cid));
}

/** applyJob (0x6b1ce7 → 0x69ca00) */
export function cmBoardApply(g: GameState, cid: number): 'sent' | 'error' {
  if (!cmBoardOn(g)) return 'error';
  const st = stateOf(g), env = boardEnv(g);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0);
  if (!h || env.manager(cid)) return 'error';
  applyForJob(env, st, cid, h, rnd(g, dayNum(g.date), 0x69ca00, cid));
  return 'sent';
}

/** resignJob (0x6b204e): remove_club_manager(club, 2, 0, 0) + add_job_vacancy(club, mennesket) */
export function cmBoardResign(g: GameState, cid: number): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  recOfG(g, cid).w6 = 3500;
  if (env.canBeManaged(cid)) addVacancy(env, st, cid, h, rnd(g, dayNum(g.date), 0x6b204e, cid));
}

/** sim.ts newDay (før datoskiftet): 0x68f9c0 for dagen, der er spillet */
export function cmBoardDaily(g: GameState): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const rand = rnd(g, dayNum(g.date), 0x68f9c0);
  boardDaily(env, st, rand, (r) => weeklyUpdate(env, st, r));
  syncHuman(g);
}

/** season.ts: League::set_club_season_expectations 0x68aa80 for hver liga (når sæsonen sættes op) */
export function cmBoardSeasonSetup(g: GameState): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  st.tab = {};
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league' || g.leagues[comp.id]?.hidden) continue;
    for (const c of comp.clubs) setSeasonExpectations(env, st, c, true, rnd(g, dayNum(g.date), 0x68aa80, c));
  }
  syncHuman(g);
}

/** sim.ts applyMatchResult (efter tabellen): 0x6951e0 */
export function cmBoardAfterMatch(g: GameState, f: Fixture, rep: MatchReport): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  leftGen++;
  // Comp_Stats' bedste/dårligste placering og den seneste kampdato (ligakampe)
  const comp = g.comps[f.comp];
  if (comp?.type === 'league') {
    const rows = leagueRows(comp);
    for (const c of [f.home, f.away]) {
      const pos = rows.findIndex((r) => r.club === c) + 1;
      const t = (st.tab ??= {})[c];
      st.tab[c] = t ? [Math.min(t[0], pos), Math.max(t[1], pos), dayNum(g.date)] : [pos, pos, dayNum(g.date)];
    }
  }
  const codes = fixtureCodesOf(g, f, f.comp, f.home);
  const [hs, as] = rep.stats;
  const tie = f.tieId !== undefined ? comp?.ties.find((t) => t.id === f.tieId) : undefined;
  let aggH = 0xff, aggA = 0xff;
  if (tie && (tie.legs ?? 1) > 1 && (f.leg ?? 1) === 2 && codes.firstLeg) { aggH = codes.firstLeg[0] + hs.goals; aggA = codes.firstLeg[1] + as.goals; }
  const sideOf = (t: 0 | 1) => {
    const lines = rep.players.filter((l) => l.team === t);
    const oppNation = g.clubs[t ? f.home : f.away]?.nation;
    return {
      club: t ? f.away : f.home, b8: 0, b9: 0,
      rows: lines.map((l) => {
        const p = g.players[l.id];
        const r = p?.cmRepMem ?? p?.cmRep ?? [50, 50, 50];
        const v = p && oppNation !== undefined && g.clubs[p.club]?.nation === oppNation ? r[1] : p?.nation === oppNation ? r[0] : r[2];
        return { rating: Math.max(1, Math.min(10, Math.round(l.rating))), minutes: Math.max(0, Math.min(127, l.minutes)), redAt: l.red ? l.minutes : -1, rep: Math.round(v * 50) };
      }),
    };
  };
  const m: MatchIn = {
    home: f.home, away: f.away, len: rep.et ? 120 : 90, b3a: codes.b3a, w30: codes.w30, w32: codes.w32, w38: codes.flags38,
    gh: hs.goals, ga: as.goals, aggH, aggA, penH: rep.pens?.[0] ?? 0, penA: rep.pens?.[1] ?? 0,
    compRep: comp ? codes.compRep : null,
    isDivision: (c) => g.clubs[c]?.league === f.comp,
    friendly: comp?.id === 'FRIENDLY' || f.comp.startsWith('FR'),
    inContention: () => true,
    derby: (c, o) => {
      const cr = g.cmCrowd?.[c], or = g.cmCrowd?.[o];
      const riv = cr ? cr.slice(6, 9) : [];
      const sameCity = cr && or && cr[4] === or[4] && cr[4] > 0;
      if (sameCity) return riv.includes(o) ? 0x40 : 0x80;
      if (riv.includes(o)) return 0x80;
      return 0;
    },
    venueHome: true,
    sides: [sideOf(0), sideOf(1)],
  };
  afterMatch(env, st, m, rnd(g, f.id, 0x695240));
  syncHuman(g);
}

/** menneskets Board-skærm og bestyrelse (board.ts' felter) følger originalens post */
function syncHuman(g: GameState): void {
  const R = g.cmBoard?.rec[g.userClub];
  if (!R || !g.userClub) return;
  g.board.confidence = Math.max(0, Math.min(100, Math.round(s16(R.w6) / 100)));
  if (R.t2c) g.board.expectedPos = R.t2c;
  g.board.expectation = EXP_KEY(R.e);
}

/** 0x6b6cc0 (efter kampen): managerens tre værdier fra 0x6d3610, assistenten og trænerne får en fjerdedel af ændringen */
postHooks.managerRep = (g, club, v) => {
  if (!cmBoardOn(g)) return;
  const env = boardEnv(g);
  const m = env.manager(club);
  if (!m || !m.np) return;
  const mine = Object.values(g.staff).filter((s) => s.club === club && s.cmNp);
  // club +0xd3 (assistenten) og +0x19f (de fem trænerpladser)
  const staff = [...mine.filter((s) => s.role === 'assistant').slice(0, 1), ...mine.filter((s) => s.role === 'coach').slice(0, 5)].map((s) => env.person(s.id)!).filter(Boolean);
  managerRepAfterMatch(m, staff, v[0], v[1], v[2]);
};

export const _test = { entryOf, leagueInfo };
export { squad };
