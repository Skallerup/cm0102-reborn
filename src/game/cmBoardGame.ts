// Originalens bestyrelse og managerjob (cmBoard.ts) i vores spil: spiltilstanden → originalens felter (BoardEnv) og tilbage (manageren skifter,
// nyhederne til mennesket, Board-skærmens tal). En CM-database i ægte tilstand med spilstartens bestyrelse (cmBoardOn = cmBoardLogic: den originale database og nye 2026/27-spil) – ellers board.ts.
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
import { cmActive, cmBoardLogic, cmLogic, cmRand, clubRepMem, postHooks } from './cmPlayerData';
import { cmGbp } from './cmMoney';
import { personalFill_535a80 } from './cmStaffInit';
import { financeStatus } from './cmSquadPlan';
import { cmSquadPlanNewManager } from './cmSquadPlanGame';
import { clubSeason } from './cmFitness';
import { CL_SPOTS, UEFA_SPOTS, UEFA_NATIONS, rulesFor } from './leagues';
import { leagueRows, nationRanking } from './competitions';
import { ageOn, daysBetween } from './dates';
import { careerEnd, careerStart } from './careers';
import { recordStaffMove } from './staffMoves';
import { fixtureCodesOf } from './engine/grid/gameInputs';
import {
  type BoardEnv, type BoardNews, type BoardRec, type CmBoardState, type CmDate, type LeagueInfo, type MatchIn, type Person, type StatsEntry,
  HUMAN0, addVacancy, after, afterMatch, currentRun, daysSince, leagueBand, s8, applyForJob, boardDaily, cmToIso, confidenceBand, initRecords, initStaffRep, humanAppointRep, isoToCm, resetForNewManager,
  setSeasonExpectations, s16, weeklyUpdate, managerRepAfterMatch, newRec, reviewNational,
} from './cmBoard';
import type { CMWorld } from './data/cm0102';
import { appointText, boardCmText, confidenceText, type BoardCmDesc, type ConfidenceIn } from './cmBoardText';
import { boardRequestAvailable, issueUltimatum, ultimatumOffered, type UltimatumIn } from './cmBoardUltimatum';
import { projectPositions, staffInterest, type InterestEnv } from './cmBoardInterest';
import { msvcQsort } from './engine/grid/subs';
import { registerPrerun } from './cmPrerun';
import { personKey } from './cmRelations';
import { cmClubEuro } from './cmFitnessGame';
import { cmFineReset, cmFineSeasonHalve } from './cmFine';
import { clubNewsToMe, cmForeign } from './cmNewsScope';
import { natClub, natClubId, natOfClub, resetNationalManagers } from './cmVirtual';
import { DEMONYM } from '../ui/demonyms';
import { natCompHook } from './hooks';
import { holidayHooks, holidayOpt } from './cmHoliday';
import { NO_CARRY, registerCarry } from './carry';

/** € → £ for klubbens penge (cmMoney.ts: den originale database 0,86; 2026/27 ligaens faktor) */
const gbpOf = (g: GameState, c: number) => cmGbp(g, c);
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** en CM-database i ægte tilstand med spilstartens bestyrelse 0x68f130 (cmBoardLogic – den originale database og nye 2026/27-spil), ikke draft */
export function cmBoardOn(g: GameState): boolean {
  return cmBoardLogic(g);
}

// ---------------------------------------------------------------- personerne

const JOB: Record<string, number> = { manager: 5, assistant: 6, coach: 8, scout: 9, physio: 10 };

/** landstræneren (A-holdets manager) pr. nation og omvendt – bestyrelsens nm (sat ved spilstarten, ændret af udnævnelser og afgange) */
function natOfStaff(g: GameState, id: number): number {
  const nm = g.cmBoard?.nm;
  if (!nm) return -1;
  for (const k in nm) if (nm[k] === id) return +k;
  return -1;
}
/** staff +0x3d uden klub. Ledige fra spilstarten (databasens job `cmDbJob`) og personer, der har forladt en klub (keepJobCode): 0x68f130 2a beholder jobkoden; kun +0x3d = 0 får
 *  landsholdsjobbet +0x28 – og ikke landstrænerens (5/12: `continue` før omskrivningen) eller 11; 13/15 uden spillerpost → 8 (oraklets gemte
 *  spil 15/7-2001: Bruce Arena/Louis van Gaal +0x3d 0, +0x28 5; Billy Davies 5, Kit Carson 9). Ellers (ældre spil, stab fra en klub) som før:
 *  landsholdsjobbet, medmindre det er 11. */
/** 0x690890 remove_staff_from_club: jobkoden +0x3d bliver stående, når personen forlader klubben (kun ikke-spillerposten fra databasen) */
export const keepJobCode = (s: Staff) => { if (s.cmNp && !s.cmExtra) s.cmDbJob = JOB[s.role] ?? 8; };
const clublessJob = (s: Staff) => {
  if (s.cmDbJob !== undefined && !s.cmExtra) {
    if (s.cmDbJob) return s.cmDbJob;
    const j = s.cmNat && s.cmNat[0] >= 0 ? s.cmNat[1] : 0;
    return j === 5 || j === 12 || j === 11 ? 0 : j === 13 || j === 15 ? 8 : j;
  }
  return s.cmNat && s.cmNat[1] !== 11 ? s.cmNat[1] : 0;
};

function staffPerson(g: GameState, s: Staff, today: CmDate): Person {
  const hid = s.cmHid ?? [];
  const np = s.cmNp!;
  const rep = (s.cmRep ??= [1, 1, 1]);
  const p: Person = {
    id: s.id, human: false, np: true, nation: s.nation ?? -1,
    get club() { return s.club; }, set club(v: number) { s.club = v; },
    get job() { return s.club ? JOB[s.role] ?? 8 : clublessJob(s); }, set job(_v: number) { /* rollen sættes af setManager */ },
    get nat() { const d = g.cmBoard?.nd?.[s.id]; if (d) return natClub(d[0]); const n = natOfStaff(g, s.id); return n >= 0 ? natClub(n) : 0; },
    get natJob() { return g.cmBoard?.nd?.[s.id]?.[1] ?? g.cmBoard?.nj?.[s.id] ?? 0; },
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
    get nat() { const n = m().national?.nation; return n !== undefined ? natClub(n) : 0; },
    get natJob() { return m().national ? 5 : 0; },
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
    lastDays: tr?.[2] !== undefined ? dayNum(cmToIso(today)) - tr[2] : 999, formPts: pts, formN: n, get projected() { return projectedOf(g, lid, c) ?? best; },
  };
}

/** 0x4ae300's første placering (o1 = den midlertidige posts +0x74) af 0x68ac40 – cmBoardInterest.ts projectPositions */
const ENG_PLAYOFF: Record<string, [number, number]> = { 'English First Division': [3, 6], 'English Second Division': [3, 6], 'English Third Division': [4, 7] };
function projectedOf(g: GameState, lid: string, c: number): number | null {
  const comp = g.comps[lid];
  const rules = g.customRules?.[lid] ?? rulesFor(lid, comp.clubs.length);
  const rows = leagueRows(comp).map((r) => ({ club: r.club, games: r.p, pts: r.pts, rep: clubRepMem(g, r.club) }));
  const wa7 = (comp.clubs.length - 1) * (rules.rounds ?? 2);
  const pr = projectPositions(rows, c, wa7, 3, ENG_PLAYOFF[g.leagues[lid]?.name ?? ''] ?? null, msvcQsort);
  return pr ? pr[0] : null;
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
// (19/11) nulstilles ved et nyt spil (carry.ts) – ellers lækker den fra spillet før i samme fane/proces
registerCarry('cmBoardGame.caches', () => NO_CARRY, () => {}, () => { tempManager.clear(); leftCache = { key: '', m: new Map() }; });

/** `lazy` (ønskelisternes og kontraktportenes kortlivede hukommelser): rangeringen og klublisten regnes først, når de bruges */
export function boardEnv(g: GameState, todayIso = g.date, startIso?: string, lazy = false): BoardEnv {
  const today = isoToCm(todayIso);
  const gameStart = isoToCm(startIso ?? g.cmBoardStart ?? g.date);
  let persons: Person[] | null = null;
  const byId = new Map<number, Person>();
  const allPersons = () => {
    if (persons) return persons;
    persons = [];
    // landstrænerne er med, også når de kun er i hukommelsen (cmExtra: uden klub i spillet) – originalens landshold har dem som manager
    const natM = new Set(Object.values(g.cmBoard?.nm ?? {}));
    for (const s of Object.values(g.staff).sort((a, b) => a.id - b.id)) if (s.cmNp && (!s.cmExtra || natM.has(s.id))) { const p = staffPerson(g, s, today); persons.push(p); byId.set(p.id, p); }
    for (const h of humanRefs(g)) { const p = humanPerson(g, h); persons.push(p); byId.set(p.id, p); }
    return persons;
  };
  const personOfStaff = (id: number) => { allPersons(); return byId.get(id) ?? null; };
  const humanOfClub = (c: number) => allPersons().find((p) => p.human && p.club === c) ?? null;
  const humanOfNat = (n: number) => allPersons().find((p) => p.human && p.nat === natClub(n)) ?? null;
  const natRep = (n: number) => g.intl?.info?.[n]?.rep ?? g.cmNationRep?.[n] ?? 0;
  const nationName = (n: number) => g.nations[n]?.name ?? '';
  // (hastighed, runde 14) med `lazy` rangeringen og klublisten først, når de bruges (ønskelisterne bygger et miljø pr. udbudspris)
  let rk: number[] | null = null, cl: number[] | null = null;
  if (!lazy) { rk = nationRanking(); cl = clubList(g); }
  const ranking = () => (rk ??= nationRanking());
  let ie: InterestEnv | null = null;
  const env: BoardEnv = {
    today, gameStart,
    get clubs() { return (cl ??= clubList(g)); },
    clubRep: (c) => { const n = natOfClub(c); return n !== null ? natRep(n) : clubRepMem(g, c); },
    clubNation: (c) => { const n = natOfClub(c); return n !== null ? n : g.clubs[c]?.nation ?? -1; },
    division: (c) => leagueOf(g, c),
    lastDivision: (c) => { if (natOfClub(c) !== null) return null; const ld = g.cmClubStat?.[c]?.[2]; return ld !== undefined && ld > 0 ? `CM${ld}` : leagueOf(g, c); },
    divLevel: (div) => { const n = compNum(div); return n >= 0 ? g.cmCompRep?.[n] ?? 0 : 0; },
    league: (div) => leagueInfo(g, div),
    canBeManaged: (c) => { const n = natOfClub(c); return n !== null ? natPlayers(g, n) > 150 : !!leagueOf(g, c) && g.activeNations.includes(g.clubs[c].nation); },
    activeLeague: (c) => !!leagueOf(g, c) && g.activeNations.includes(g.clubs[c].nation),
    entry: (c) => entryOf(g, c, today),
    euroEntry: () => null,
    nationPlaces: (c) => {
      if (natOfClub(c) !== null) return [1, 1];
      const n = g.clubs[c]?.nation;
      if (n === undefined || !UEFA_NATIONS.has(nationName(n))) return [1, 1];
      const r = ranking().indexOf(n);
      return r < 0 ? [1, 1] : [CL_SPOTS[r] ?? 1, UEFA_SPOTS[r] ?? 1];
    },
    isAustralia: (c) => nationName(g.clubs[c]?.nation ?? -1) === 'Australia',
    wealthBand: (c) => natOfClub(c) !== null ? 0 : financeStatus(Math.round((g.clubs[c]?.balance ?? 0) * gbpOf(g, c)), clubRepMem(g, c)),
    transferBudget: (c) => Math.round((g.clubs[c]?.transferBudget ?? 0) * gbpOf(g, c)),
    balance: (c) => Math.round((g.clubs[c]?.balance ?? 0) * gbpOf(g, c)),
    chair: (c) => { const x = g.cmChair?.[c]; return x ? { b16: x[0], b1d: x[1], amb: x[2], nation: x[3] } : null; },
    manager: (c) => {
      if (tempManager.has(c)) return tempManager.get(c)!;
      const nn = natOfClub(c);
      if (nn !== null) { const h = humanOfNat(nn); if (h) return h; const id = g.cmBoard?.nm?.[nn]; const s = id !== undefined ? g.staff[id] : undefined; return s ? (s.cmNp ? personOfStaff(s.id) : noNp(s)) : null; }
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
    isHumanClub: (c) => { const n = natOfClub(c); return n !== null ? !!humanOfNat(n) : g.clubs[c]?.manager === -1; },
    dismissedBy: (p, c) => {
      const d = p.human && p.id === HUMAN0 ? g.manager.cmDismissed?.[c] : undefined;
      return !!d && daysBetween(d, g.date) < 180;
    },
    humanOnHolidaySearching: (p) => p.human && !!humanRefs(g)[p.id - HUMAN0]?.get().manager.holiday?.applyJobs,
    fluency: (p, c) => {
      const cl = g.nations[natOfClub(c) ?? g.clubs[c]?.nation ?? -1]?.lang?.[0], pl = g.nations[p.nation]?.lang?.[0];
      return cl !== undefined && cl === pl ? 10 : 0;
    },
    foreign: (p, n) => cmForeign(g, p.nation, n),
    interest: (p, c) => (interestHook.fn ? interestHook.fn(g, p, c) : staffInterest((ie ??= interestEnv(g, env)), p, c, 5)),
    retiring: () => false,
    inSeason: (c) => natOfClub(c) === null && clubSeason(g.clubs[c]?.nation, dayNum(todayIso))[0],
    nextFixture: (c, days) => {
      if (natOfClub(c) !== null) return null;
      const from = dayNum(todayIso), to = from + days;
      const f = Object.values(g.fixtures).filter((x) => (x.home === c || x.away === c) && !x.result && dayNum(x.date) > from && dayNum(x.date) <= to)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      return f ? { opp: f.home === c ? f.away : f.home, hasComp: !!g.comps[f.comp] } : null;
    },
    underOffer: () => false,
    inEurope: (c) => c > 0 && Object.values(g.comps).some((x) => x.type === 'continental' && x.clubs.includes(c) && !/intertoto/i.test(x.name)),
    inEuropeAny: (c) => c > 0 && Object.values(g.comps).some((x) => x.type === 'continental' && x.clubs.includes(c)),
    pro: (c) => (g.cmClubStat?.[c]?.[0] ?? 1) === 1,
    lowNation: (c) => ['Wales', 'Republic Of Ireland', 'Ireland', 'Northern Ireland'].includes(nationName(g.clubs[c]?.nation ?? -1)),
    setManager: (c, p, old) => setManagerGame(g, env, c, p, old),
    // 0x84abe0 → 0x83cb40 med +4 = 2 (computerklubber, når trupplanen er startet – ikke i forkørslen før 0x83a1b0)
    newManagerPlan: (c) => { if (g.clubs[c] && g.clubs[c].manager !== -1 && g.cmPlan?.[c]) cmSquadPlanNewManager(g, c); },
    news: (n) => boardNews(g, env, n),
    isNat: (c) => natOfClub(c) !== null,
    natComp: (c) => { const n = natOfClub(c); return n !== null ? natCompHook.fn?.(g, n) ?? null : null; },
    natPlayers: (c) => { const n = natOfClub(c); return n !== null ? natPlayers(g, n) : 0; },
  };
  return env;
}
/** 0x68f9c0's klubløkke: klubberne (id-rækkefølgen), så A-landsholdene (klub-id'erne efter klubberne) for lande med verdensdel (nation +0x71) */
function clubList(g: GameState): number[] {
  const out = Object.keys(g.clubs).map(Number).sort((a, b) => a - b);
  if (g.cmBoard?.nm) for (let n = 0; n < g.nations.length; n++) if ((g.cmNationCont?.[n] ?? -1) >= 0) out.push(natClub(n));
  return out;
}
/** nation +0x88: de indlæste spillere af nationaliteten (0x524d70) – én optælling pr. spil */
const n88Cache = new WeakMap<GameState, Record<number, number>>();
export function natPlayers(g: GameState, n: number): number {
  let m = n88Cache.get(g);
  if (!m) { m = {}; for (const p of Object.values(g.players)) if (!p.virtual) m[p.nation] = (m[p.nation] ?? 0) + 1; n88Cache.set(g, m); }
  return m[n] ?? 0;
}

/** spillets genererede stab: ingen ikke-spillerpost (np = NULL) */
function noNp(s: Staff): Person {
  return { id: s.id, human: false, np: false, nation: s.nation, club: s.club, job: s.club ? JOB[s.role] ?? 8 : clublessJob(s), joined: isoToCm(s.cmJoined || '1990-01-01'), age: 45,
    b59: 10, det: 10, pres: 10, prof: 10, temper: 10, amb: 10, b22: 0, ca: 0, pa: 0, at: () => 0, rep: [1, 1, 1] };
}

/** 0x844780 staff_interest_in_job_at_club(s, c, 0, 5, NULL) – cmBoardInterest.ts; krogen overstyrer (målinger) */
export const interestHook: { fn?: (g: GameState, p: Person, c: number) => number } = {};

const idCache = new WeakMap<GameState, InterestEnv['ids']>();
/** viljens inddata af spillets data (se filhovedet i cmBoardInterest.ts) */
function interestEnv(g: GameState, b: BoardEnv): InterestEnv {
  const st = g.cmBoard as unknown as CmBoardState | undefined;
  const nIdx = (name: string) => g.nations.findIndex((n) => n.name === name);
  const cIdx = (name: string) => { const c = Object.values(g.clubs).find((x) => x.name === name); return c ? c.id : -1; };
  let ids = idCache.get(g);
  if (!ids) {
    ids = { europe: g.cmEurope ?? -1, interToto: 330, lowerDiv: g.cmLowerDiv ?? -1, celtic: cIdx('Glasgow Celtic'), rangers: cIdx('Glasgow Rangers'),
      italy: nIdx('Italy'), croatia: nIdx('Croatia'), yugoslavia: nIdx('Yugoslavia') };
    idCache.set(g, ids);
  }
  const staffOf = (p: Person) => (p.human ? null : g.staff[p.id] ?? null);
  return {
    b,
    rec: (c) => (st ? st.rec[c] ?? newRec() : null),
    name: (p) => { const s = staffOf(p); return s ? `${s.first} ${s.last}`.trim() : p.human ? g.manager.name : ''; },
    // staff +0x24/+0x28 efter 0x68f130 (landsholdene i bestyrelsen): kun landstrænerne beholder landsholdet, jobbet 0 til en udnævnelse sætter 5;
    // gamle gemte spil uden landshold i bestyrelsen: databasens værdier
    nat: (p) => {
      // (2026/27) landstrænerne fra databasen (nd – landsholdene er ikke i bestyrelsen): som 0x68f130 2a efterlader dem
      if (g.cmBoard?.nm || g.cmBoard?.nd) return { nc: !!p.nat, nj: p.natJob ?? 0 };
      const x = staffOf(p)?.cmNat; return { nc: !!x && x[0] >= 0, nj: x ? x[1] : 0 };
    },
    rel: (p) => staffOf(p)?.cmRel,
    key: (p) => { const s = staffOf(p); return s ? personKey(s) : -1 - p.id; },
    status: (c) => g.cmClubStat?.[c]?.[0] ?? 1,
    rivals: (c) => (g.cmCrowd?.[c]?.slice(6, 9) ?? []).filter((x) => x >= 0),
    divId: (c) => { const l = g.clubs[c]?.league ?? ''; const m = /^CM(\d+)$/.exec(l); return m ? +m[1] : g.cmFinRaw?.[c]?.[0] ?? -1; },
    compLevel: (id) => g.cmCompRep?.[id] ?? 0,
    i73: (c) => g.cmCrowd?.[c]?.[0] ?? 0,
    city33: (c) => { const d = g.cmCrowd?.[c]; return d && d[3] >= 0 && d[4] >= 0 ? g.cmCity33?.[d[4]] ?? 0 : null; },
    euro: (c) => cmClubEuro(g, c),
    targetRep: (c) => g.cmTargetRep?.[c] ?? 0,
    continent: (n) => (n >= 0 ? g.cmNationCont?.[n] ?? -1 : -1),
    ids,
  };
}

// ---------------------------------------------------------------- skrivere

function setManagerGame(g: GameState, _env: BoardEnv, c: number, p: Person | null, old: number): void {
  if (old === -2) { if (p) tempManager.set(c, p); else tempManager.delete(c); return; }
  const nn = natOfClub(c);
  if (nn !== null) { setNationalManager(g, nn, p, old); return; }
  const club = g.clubs[c];
  if (!club) return;
  if (!p) {
    // afgang: manageren forlader klubben (0x69b790 → 0x690890)
    cmFineReset(g, c);                                                  // 0x69b8f5: 0x5a5960 (Discipline Player-tælleren)
    const m = club.manager;
    if (m === -1) humanLeaves(g, c);
    else if (m > 0) { const s = g.staff[m]; if (s) { careerEnd(s, 'sacked'); keepJobCode(s); s.club = 0; } }
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
  // 0x690368–0x69043f: historikposten art 5 (0x8cb810 – Staff In/Out) for et skifte fra en klub til en anden (ingen af dem landshold, +0x18 = 0)
  if (old > 0 && old === s.club && natOfClub(old) === null && g.clubs[old]) recordStaffMove(s, c, 0);
  s.club = c; s.role = 'manager';
  club.manager = s.id; club.tactic = null;
  careerStart(s, c);
}

/** A-landsholdets manager (club +0xcf, staff +0x24/+0x28): afgang (p = null – 0x69b790) eller udnævnelse (0x68f9c0's inline-udnævnelse); `old` =
 *  posten, han forlader (et andet landshold eller – landshold med omdømme > 6000 – klubben: 0x6906fc's standardgren fjerner ham fra klubben) */
function setNationalManager(g: GameState, n: number, p: Person | null, old: number): void {
  const st = stateOf(g);
  st.nm ??= {}; st.nj ??= {};
  if (!p) {
    let human = false;
    forHumans(g, (m) => { if (m.national?.nation === n) { m.national = undefined; human = true; } });
    if (!human) { const id = st.nm[n]; if (id !== undefined) { delete st.nm[n]; delete st.nj[id]; } }
    resetNationalManagers(g);
    return;
  }
  if (p.human) return;                                                  // mennesket ansættes via cmBoardNationalAnswer (0x69ebc0)
  const s = g.staff[p.id];
  if (!s) return;
  if (old) {
    const on = natOfClub(old);
    if (on !== null) { if (st.nm[on] === s.id) delete st.nm[on]; }
    else {
      const from = g.clubs[old];
      if (from && from.manager === s.id) { from.manager = 0; from.tactic = null; }
      if (s.club === old) { careerEnd(s, 'poached'); s.club = 0; s.role = 'coach'; keepJobCode(s); }   // +0x3d = 8 (np uden spillerpost)
    }
  }
  st.nm[n] = s.id; st.nj[s.id] = 5;
  resetNationalManagers(g);
}
/** alle menneskers ManagerProfile (det aktive og de andre i fællesspil) */
function forHumans(g: GameState, fn: (m: GameState['manager']) => void): void {
  fn(g.manager);
  for (const h of g.humans ?? []) if (h.pid !== g.active && h.manager) fn(h.manager);
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

/** nyhedens parametre: teksten nu (som reserve) og `bd` = det, der skal til for at bygge den igen på et andet sprog (common.tsx newsParams) */
function boardParams(d: BoardCmDesc, extra: Record<string, string | number> = {}): Record<string, string | number> {
  const r = boardCmText(d);
  return { club: d.k === 'c' ? d.i.club : 'club' in d ? d.club : '', title: r.title, body: r.body, bd: JSON.stringify(d), ...extra };
}

const EXP_KEY = (f: number) => (f & 0x02 ? 'title' : f & 0x01 ? 'top3' : f & 0x04 ? 'promotion' : f & 0x08 ? 'playoffs' : f & 0x40 ? 'tophalf' : f & 0x30 ? 'survive' : 'mid');

/** landsholdets nation og nationaliteten ("English") til forbundets tekster */
const natAdj = (g: GameState, n: number) => { const nm = g.nations[n]?.name ?? ''; return DEMONYM[nm] ?? nm; };
/** 0x5806d0/0x57c9f0/0x92f680's turneringsnøgle → tekstens navn */
const FA_COMP: Record<number, 'wc' | 'euro' | 'euroq'> = { 404: 'wc', 406: 'euro', 396: 'euroq' };

function boardNews(g: GameState, _env: BoardEnv, n: BoardNews): void {
  if (prerunQuiet) return;                                                     // forkørslen: ingen nyheder (se cmBoardPrerun)
  const clubName = (c: number) => { const nn = natOfClub(c); return nn !== null ? g.nations[nn]?.name ?? '' : g.clubs[c]?.name ?? ''; };
  const mname = (p: Person) => { const s = g.staff[p.id]; return s ? `${s.first} ${s.last}`.trim() : g.manager.name; };
  const mine = (c: number) => c === g.userClub;
  /** menneskets eget landshold (A-holdet) */
  const myNat = (c: number) => { const nn = natOfClub(c); return nn !== null && g.manager.national?.nation === nn ? nn : null; };
  switch (n.t) {
    case 'faExpect': {
      // 0x6a44a0 (0x177e) til landsholdets manager: "Football Association announce expectations"
      const nn = myNat(n.club);
      if (nn === null) return;
      const c = FA_COMP[n.comp] ?? '';
      addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'x', nat: natAdj(g, nn), code: n.code, c, tg: c === 'euroq' ? 'euro' : '' }, { club: clubName(n.club) }) });
      return;
    }
    case 'faReview': {
      // 0x6a5a60 (0x1781): "{nationality} FA performance assessment"
      const nn = myNat(n.club);
      if (nn === null || after(_env.gameStart, _env.today)) return;
      addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'p', nat: natAdj(g, nn), grade: n.grade, c: FA_COMP[n.comp] ?? '' }, { club: clubName(n.club) }) });
      return;
    }
    case 'expect':
      if (mine(n.club)) {
        g.board.expectation = EXP_KEY(n.flags);
        g.board.expectedPos = g.cmBoard!.rec[n.club]?.t2c ?? g.board.expectedPos;
        // 0x6a4a20: kun når spillets start ≤ i dag (menneskets ansættelse 0x826f20 sker på databasens dato før forkørslen → ingen nyhed)
        if (after(_env.gameStart, _env.today)) return;
        const div = _env.division(n.club);
        addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'e', club: clubName(n.club), f: n.flags, ne: !UEFA_NATIONS.has(nationNameOf(g, g.clubs[n.club]?.nation)), ap: !!(div && _env.league(div)?.autoPromo) }),
          link: { kind: 'club', id: n.club } });
      }
      return;
    case 'confidence':
      // 0x6a4c40 / 0x6a4d40: "Board Confidence Update" med 0x690d80 (formandens trupvurdering 0x693850 er ikke porteret)
      if (mine(n.club)) addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'c', i: confidenceIn(g, _env, n.club, n.days) }),
        link: { kind: 'club', id: n.club } });
      // landsholdet: "Football Association Confidence Update" (0x690d80's landsholdsgren)
      else if (myNat(n.club) !== null) addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'c', i: confidenceIn(g, _env, n.club, n.days) }) });
      return;
    case 'jobOffer': {
      // NewsItem::auto_respond 0x784100 (type 0x1774, 0x7841d9–0x78429d): på ferie svarer assistenten straks – uden klub, eller med ferievalg 1
      // ("Apply for manager position at higher reputation clubs") og en klub med mindst samme omdømme (+0x80) som hans egen: ja (felt 1 = 1,
      // appoint_manager_to_club 0x69ebc0); ellers nej (felt 1 = 2, ingen ny ledighed). Udføres efter dagens 0x68f9c0 (holidayJobAnswers).
      if (n.human.id === HUMAN0 && g.manager.holiday) {
        const own = n.human.club;
        holidayJobs.push({ club: n.club, yes: holidayJobYes(holidayOpt(g.manager.holiday, 1), own ? _env.clubRep(own) : null, _env.clubRep(n.club)) });
      }
      // landsholdet (0x6a5120): "The {nationality} Football Association offer you the position of manager." – svaret på International-skærmen
      const on = natOfClub(n.club);
      if (on !== null) {
        if (n.human.id !== HUMAN0 || g.manager.nationalOffer === on) return;
        g.manager.nationalOffer = on;
        addNews({ cat: 'job', key: 'board.cm', params: boardParams({ k: 'o', nat: natAdj(g, on), nation: g.nations[on]?.name ?? '', st: 0 }, { club: clubName(n.club) }) });
        return;
      }
      if (n.human.id === HUMAN0 && !g.jobOffers.includes(n.club)) {
        g.jobOffers.push(n.club);
        addNews({ cat: 'job', key: 'news.jobOffer', params: { club: clubName(n.club) }, link: { kind: 'club', id: n.club } });
      }
      return;
    }
    case 'applyReply':
      // 0x69c6b0: "{klub} acknowledge / dismiss your job application" (nyhed 0x1773, samme dag)
      if (n.human.id === HUMAN0) addNews({ cat: 'job', key: n.dismissed ? 'job.cmDismiss' : 'job.cmAck', params: { club: g.clubs[n.club]?.short ?? clubName(n.club) }, link: { kind: 'club', id: n.club } });
      return;
    case 'departed': {
      // 0x6a1d60 for A-landsholdet: "{nation} manager X sacked" / "X resigns as manager of {nation}" – til alle managere (0x6a1b00: landshold)
      const dn = natOfClub(n.club);
      if (dn !== null) {
        if (n.manager.human ? n.manager.id !== HUMAN0 : !_env.canBeManaged(n.club)) return;
        addNews({ cat: 'job', key: 'board.cm', params: boardParams({ k: 'd', type: n.type, reason: n.reason, m: mname(n.manager), nation: g.nations[dn]?.name ?? '', nat: natAdj(g, dn) }, { club: clubName(n.club) }) });
        return;
      }
      // 0x69b790: afgangen skrives før nyheden (humanLeaves har allerede nulstillet userClub) – derfor managerens id, ikke mine(); før kom
      // fyringen uden besked (ejerens test 16/11: fyret på ferie uden nyhed). runUntil stopper ferien, når klubben er væk.
      if (n.manager.human) {
        if (n.manager.id === HUMAN0) {
          addNews({ cat: 'job', key: n.type === 2 ? 'job.resigned' : 'board.sacked', params: { club: clubName(n.club), manager: g.manager.name } });
          // klubbens historik (Staff_Records, type 150): fyret – læses af 0x69ca00 (dismissedBy)
          if (n.type !== 2) g.manager.cmDismissed = { ...g.manager.cmDismissed, [n.club]: g.date };
        }
      }
      else if (newsOn(g, n.club)) addNews({ cat: 'job', key: 'news.managerSacked', params: { club: clubName(n.club), manager: mname(n.manager) }, link: { kind: 'club', id: n.club } });
      return;
    }
    case 'appointed':
      // landsholdet (0x6a2e00): kun når landets ligaer kører (nation +0x11c), så til alle managere
      if (natOfClub(n.club) !== null) {
        if (!g.activeNations.includes(natOfClub(n.club)!) || (!n.manager.human && !_env.canBeManaged(n.club))) return;
        addNews({ cat: 'job', key: 'news.cmAppoint', params: { club: clubName(n.club), manager: mname(n.manager), full: clubName(n.club), prev: n.prev && n.kind === 3 ? clubName(n.prev) : '',
          body: appointBody(clubName(n.club), mname(n.manager), n.prev && n.kind === 3 ? clubName(n.prev) : '') } });
        return;
      }
      // 0x6a3060: overskriften "{kort navn} appoint X as manager", brødteksten efter den forrige klub (−1 → 0xa09e18) og arten (3 → 0xa0a2f8)
      if (n.manager.human ? clubNewsToMe(g, n.club, true) : newsOn(g, n.club)) addNews({ cat: 'job', key: 'news.cmAppoint', params: { club: g.clubs[n.club]?.short ?? clubName(n.club), manager: mname(n.manager), full: clubName(n.club), prev: n.prev > 0 && n.kind === 3 ? clubName(n.prev) : '',
        body: appointBody(clubName(n.club), mname(n.manager), n.prev > 0 && n.kind === 3 ? clubName(n.prev) : '') }, link: { kind: 'club', id: n.club } });
      return;
    case 'pressure': case 'ultimatum': case 'protest':
      if (mine(n.club)) addNews({ cat: 'board', key: 'board.warning', params: { club: clubName(n.club) } });
      return;
    default: return;
  }
}
/** 0x6a2e00/0x6a1b00 (cmNewsScope.ts clubNewsToMe): kørende liga i et valgt land; omdømme > 7250 til alle, ellers landets managere */
function newsOn(g: GameState, c: number): boolean {
  return clubNewsToMe(g, c);
}

const nationNameOf = (g: GameState, n: number | undefined) => (n === undefined ? '' : g.nations[n]?.name ?? '');

/** 0x6a3060 brødteksten: uden forrige klub 0xa09e18, fra en anden klub (art 3) 0xa0a2f8 */
export function appointBody(club: string, manager: string, prevClub: string): string {
  return appointText(club, manager, prevClub);
}

/** 0x690d80 for klubben (dage i jobbet som 0x6b2080/0x6a4c40) */
function confidenceOf(g: GameState, env: BoardEnv, c: number, days: number): string {
  return confidenceText(confidenceIn(g, env, c, days));
}
function confidenceIn(g: GameState, env: BoardEnv, c: number, days: number): ConfidenceIn {
  const R = g.cmBoard?.rec[c];
  const run = currentRun(env, c);
  const nn = natOfClub(c);
  return ({
    club: nn !== null ? g.nations[nn]?.name ?? '' : g.clubs[c]?.name ?? '', days, wealth: env.wealthBand(c), ...(nn !== null ? { national: natAdj(g, nn) } : {}), leagueBand: leagueBand(R?.w12 ?? 0), confBand: confidenceBand(R?.w6 ?? 5000),
    runType: run.type, runLen: run.len, arrogDays: R ? daysSince(env.today, R.d41) : 9999, conf: s16(R?.w6 ?? 5000), fans: s16(R?.w16 ?? 0),
  });
}

/** Board Confidence-skærmen 0x6b2080 (manager_screens.cpp): 0x690d80 med dagene siden menneskets ansættelse (manageren +0x3e/+0x40) */
export function cmBoardScreenText(g: GameState): string | null {
  if (!cmBoardOn(g) || !g.userClub) return null;
  const env = boardEnv(g);
  const j = isoToCm(g.manager.cmJoined || g.date), t = env.today;
  const days = ((t.year & 0xffff) - (j.year & 0xffff)) * 365 - s16(j.day) + s16(t.day);
  return confidenceOf(g, env, g.userClub, days);
}

/** 0x6a8810 handle_board_request(klub, anmodning) – 1 stadion, 2 træningsanlæg, 3 transferpenge, 4 løn og 5 tid (notes/board/notes-C-match.md
 *  §6c). *Estimeret* i 3/4: sæsonen i gang (inWin), lønloftet Finance +0x14 (klubbens højeste ugeløn) og adjust_max_wage 0x598340 (lønbudgettet
 *  + R.b5 %). Svaret er nyheden 0x1786 (tekst
 *  0x6a9470); null = ikke porteret / intet svar. Bevillingerne (b2 0x40/0x80) bygger først ved sæsonslut i originalen (0x59cfa0 – ikke porteret). */
export function cmBoardRequest(g: GameState, req: 1 | 2 | 3 | 4 | 5): string | null {
  if (!cmBoardOn(g)) return null;
  const c = g.userClub, club = g.clubs[c];
  const env = boardEnv(g);
  const m = env.manager(c);
  if (!club || !env.division(c) || !m || !m.np) return null;
  const R = recOfG(g, c);
  const reply = (code: number) => {
    const d: BoardCmDesc = { k: 'r', club: club.name, req, code };
    const body = boardCmText(d).body;
    // nyheden 0x1786 (0x6a9350): slot 1 anmodningen og slot 2 svarkoden – knappen "Ultimatum" (0x782c6f) læser dem, slot 5 = givet
    addNews({ cat: 'board', key: 'board.cm', params: boardParams(d, { rq: req, rc: code, ult: 0 }), link: { kind: 'club', id: c } });
    return body;
  };
  R.b4 = (R.b4 + 1) & 0xff;
  const ch = env.chair(c);
  const lim = ch ? Math.trunc(s8(ch.b1d) / 5) + 2 : 3;
  if (R.b4 === lim && req !== 5) return reply(0xc);
  if (s8(R.b4) > s8(lim) && req !== 5) { R.w6 = s16(R.w6 - 250); return reply(0xa); }
  if (s16(R.w6) < 3500 && req !== 5) return reply(5);
  const prev = s8((R.b3 << 3) & 0xff) >> 4;
  if (prev === req && (R.b2 & 0x20)) return reply(3);
  R.b3 = (R.b3 & 0xe1) | ((req & 0xf) << 1);
  if (!env.entry(c)) return null;
  const bal = env.balance(c), rep = s16(clubRepMem(g, c)), mrep = s16(m.rep[1]);
  const okRep = (min: number) => mrep >= min && mrep >= rep - 1500;
  const rand = rnd(g, dayNum(g.date), 0x6a8810, req);
  if (req === 1) {
    if (!okRep(5000)) return reply(0xb);
    if (R.b2 & 0x40) return reply(6);
    const crowd = g.cmCrowd?.[c];
    const cap = crowd && crowd[3] >= 0 ? crowd[5] : -1;
    if (cap < 0 || /^(Bright|Wimble)/.test(club.name)) return reply(7);   // ingen stadion / club +0x6d = 0 (0x8298fd)
    if (cap > 75000) return reply(4);
    if (bal < (cap > 25000 ? 7500000 : cap > 15000 ? 5000000 : 2500000)) return reply(2);
    if (!(cap * 0.85 < (crowd?.[0] ?? 0))) return reply(4);
    if (rand(ch ? s8(ch.amb) : 5) === 0) return reply(4);
    R.b2 |= 0x40;
    return reply(0);
  }
  if (req === 2) {
    if (!okRep(4250)) return reply(0xb);
    if (R.b2 & 0x80) return reply(6);
    const tf = s8(club.facilities);
    if (bal < 125000 * (tf + 2)) return reply(2);
    const grant = (rep > 7250 && tf < 20) || (rep > 4750 && tf < 15) || (rep > 3250 && tf < 10) || (bal > 1250000 && tf < 6)
      || (ch ? s8(ch.amb) - tf + 10 : 20 - tf) >= rand(20);
    if (!grant) return reply(4);
    R.b2 |= 0x80;
    return reply(0);
  }
  // inWin (0x6a89a0): landets sæson er i gang ([0xb63d8a + 72·x] start/slut) – hos os: klubben har spillet og har ligakampe tilbage (*estimeret*)
  const inWin = () => {
    let played = false, left = false;
    for (const f of Object.values(g.fixtures)) {
      if (f.comp !== club.league || (f.home !== c && f.away !== c)) continue;
      if (f.result) played = true; else left = true;
      if (played && left) return true;
    }
    return false;
  };
  // dd = bestyrelsens mål for placeringen (R +0x2c) − tabellens placering (e +0x72)
  const ddPos = () => s8(R.t2c - (env.entry(c)?.pos ?? R.t2c));
  const business = g.cmFin?.[c]?.chair?.[0] ?? 10;                          // formandens Business (np +0xf)
  if (req === 3) {
    // 0x6a8a3c (transferpenge)
    if (!okRep(5000)) return reply(0xb);
    if (R.d28) return reply(6);
    if (bal < 2500000) return reply(2);
    if (R.d38 > R.q30) return reply(8);
    if (rand(ch ? s8(ch.amb) : 5) === 0) return reply(4);
    const bud = env.transferBudget(c) + Math.trunc(R.d38);
    let lim = rep > 7500 ? 5000 * rep - 25000000 : rep > 5250 ? 1000 * rep - 2250000 : 100 * rep - 450000;
    if (inWin()) { const d = ddPos(); lim = d > 4 ? Math.trunc(lim * 1.5) : d > 0 ? lim : Math.trunc(lim * 0.25); } else lim = Math.trunc(lim * 0.75);
    if (bud > lim) return reply(4);
    const amt = rep > 7500 ? 5000 * rep - 32500000 : rep > 4250 ? 1000 * rep - 2250000 : 100 * rep + 50000;
    if (amt > bal && rand(ch ? s8(business) : 10) !== 0) return reply(2);
    R.d28 = amt;
    // "… will make extra transfer funds available to you immediately" – beløbet lægges til klubbens Transfer Funds (0x598800 læser R +0x28)
    club.transferBudget = Math.round((club.transferBudget ?? 0) + amt / gbpOf(g, c));
    return reply(0);
  }
  if (req === 4) {
    // 0x6a8e60 (løn): Finance +0x14 (lønloftet get_max_wage) > 60000 → nej – hos os klubbens højeste ugeløn (£, *estimeret*)
    if (!okRep(5000)) return reply(0xb);
    if (R.b5) return reply(6);
    let top = 0;
    for (const p of squad(c)) top = Math.max(top, (p.contract?.wage ?? 0) * gbpOf(g, c));
    if (top > 60000) return reply(4);
    let x = ch ? s8(10 - business) : 0;
    const k = env.wealthBand(c);
    x = s8(x + (k === -1 ? -5 : k === 0 ? 5 : k === 1 ? 10 : k === 2 ? 15 : -15));
    if (inWin()) { const d = ddPos(); x = s8(d > 4 ? Math.trunc(x * 1.5) : d > 0 ? x : Math.trunc(x * 0.25)); } else x = s8(Math.trunc(x * 0.75));
    const a = x > 0 ? rand(x) : 0, b = rand(100);   // rand med x ≤ 0 (åbent spørgsmål i notes-C-match.md): 0
    if (a <= b) return reply(4);
    R.b5 = (ch ? (s8(ch.amb) > 5 ? s8(ch.amb) - 5 : 5) : rand(10) + 5) & 0xff;
    // Finance::adjust_max_wage(fin, R.b5) 0x598340 (ikke porteret): lønbudgettet hæves med R.b5 % (*estimeret*)
    club.wageBudget = Math.round((club.wageBudget * (1 + s8(R.b5) / 100)) / 100) * 100;
    return reply(0);
  }
  if (R.b3 & 1) return reply(6);
  if (s16(R.w6) > 4275) return reply(4);
  const dd = daysSince(env.today, m.joined) - (ch ? 10 * s8(ch.b1d) : 100);
  if (dd >= 180) return reply(9);
  R.b3 |= 1;
  R.w6 = Math.max(s16(R.w6 + 1250), 4275);
  return reply(0);
}

/** 0x6ae180: Meet with Board-skærmens punkt kan vælges (ellers gråt) – anmodning 1–5 */
export function cmBoardRequestAvailable(g: GameState, req: number): boolean {
  return boardRequestAvailable(req, g.clubs[g.userClub]?.facilities ?? 0);
}

/** nyheden 0x1786 har knappen "Ultimatum" (0x782c6f) – anmodningen, eller null */
export function cmUltimatumReq(g: GameState, n: { key: string; params: Record<string, string | number> }): number | null {
  if (!cmBoardOn(g) || !g.userClub || n.key !== 'board.cm' || n.params.rq === undefined) return null;
  const req = Number(n.params.rq);
  return ultimatumOffered(req, Number(n.params.rc), !!n.params.ult) ? req : null;
}

/** "Yes" i 0x9064a0's bekræftelse: 0x6ad610 issue_ultimatum (manageren, hans klub, anmodningen) – tilhængernes nyhed (0x178f type 1), bestyrelsens
 *  svar (type 3) og følgerne. Spillets data: stemningen = g.cmClubMood, status = cmClubStat[0], nation +0x85 = cmNationBoard, formanden = cmChair
 *  (+ Business fra cmFin), Finance = saldo/formuebånd/transferbudget som i 0x6a8810. *Afvigelse*: lønloftet Finance +0x14 (get_max_wage 0x5968d0) og
 *  adjust_max_wage 0x598340 findes ikke i spillet (anmodning 4 når aldrig hertil – 0x6a8810's anmodning 3/4 er ikke porteret); ved svar 1 på
 *  anmodning 1/2 ændrer originalen intet ud over nyheden. */
export function cmBoardUltimatum(g: GameState, req: number): boolean {
  if (!cmBoardOn(g)) return false;
  const c = g.userClub, club = g.clubs[c];
  const env = boardEnv(g);
  const m = env.manager(c);
  if (!club || !m || !m.np || !env.division(c)) return false;
  const crowd = g.cmCrowd?.[c];
  if (!crowd || crowd[3] < 0) return false;                               // club +0x69 (stadion) = NULL
  const R = recOfG(g, c);
  const ch = env.chair(c);
  const x: UltimatumIn = {
    req, today: env.today, gameStart: env.gameStart, mrep: m.rep[1], joined: m.joined, cmRep: m.rep[1],
    clubRep: clubRepMem(g, c), status: g.cmClubStat?.[c]?.[0] ?? 1, facilities: club.facilities, nat85: env.nat85(club.nation),
    cap: crowd[5], mood: g.cmClubMood?.[c] ?? 0,
    chair: ch ? { patience: ch.b1d, amb: ch.amb, business: g.cmFin?.[c]?.chair?.[0] ?? 10 } : null,
    fin: { balance: env.balance(c), band: env.wealthBand(c), transferBudget: env.transferBudget(c), wageCap: 0 },
  };
  const o = issueUltimatum(x, R, rnd(g, dayNum(g.date), 0x6ad610, req));
  const short = club.short || club.name, name = g.manager.name;
  const post = (type: number, sub: number) => addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'u', type, req, res: o.res, sub, club: club.name, short, m: name, st: club.stadium ?? '', small: o.fansStadium, poor: o.fansTraining }), link: { kind: 'club', id: c } });
  if (o.fans) post(1, o.fans);
  post(3, o.res);
  if (o.res === 2) stateOf(g).dep.push({ type: 1, reason: o.reason, club: c });
  return true;
}

/** Board-skærmens tekstkoder (boardStatementCodes) af originalens tillid: bånd 0x690b70 (+6) */
export function statementOf(g: GameState, c: number): { lvl: string; fin: string; fans: string } {
  const R = g.cmBoard?.rec[c];
  const band = R ? confidenceBand(R.w6) : 3;
  const lvl = band >= 5 ? 'delighted' : band === 4 ? 'positive' : band === 3 ? 'satisfied' : band === 2 ? 'concerned' : 'angry';
  const wb = financeStatus(Math.round((g.clubs[c]?.balance ?? 0) * gbpOf(g, c)), clubRepMem(g, c));
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
  // personpostens skjulte egenskaber +0x56..+0x5d som sub_535a80 (0x535ea4–0x5360xx) udfylder dem uden for 1..20: +0x56 og Loyalty +0x59 den
  // mindste af to terninger, de andre gennemsnittet (personalFill_535a80; oraklet 14/7-01: Warwick Rimmer 6,9,4,14,14,20,15,11 – databasen
  // har kun +0x5b = 20). +0x22 (landskampe) som databasen.
  s.cmHid = bx.slice(2, 11).map((v, k) => (k < 8 ? personalFill_535a80(v, cmRand(g.seed ?? 0, row[9], 0x535ea4 + k), k === 0 || k === 3 ? 'min' : 'avg') : v));
  s.cmJoined = row[13] || '';
}

/** newgame.ts: spilstarten 0x68f130 (på databasens dato 1/1) – efter at klubber, stab og turneringer findes */
export function cmBoardInit(g: GameState, chair: Record<number, [number, number, number, number]> | undefined, nationBoard: [number, number, number][] | undefined,
  natDb?: Record<number, [number, number]>): void {
  if (!cmLogic(g) || g.draft) return;
  // (MODERN_PARITY 7) 2026/27 i ægte tilstand: kun når world-filen har bestyrelsens data (formændene, nationerne – world-cm.json)
  const world2001 = cmActive(g);
  if (!world2001 && (!chair || !nationBoard)) return;
  // formandens Ambition (x[2]) som sub_535a80 udfylder den, når databasen har 0 (samme talrække som cmFinance.ts' formand)
  g.cmChair = {};
  for (const [cid, x] of Object.entries(chair ?? {})) g.cmChair[+cid] = [x[0], x[1], personalFill_535a80(x[2], cmRand(g.seed ?? 0, +cid, 0x535f04), 'avg'), x[3]];
  g.cmNationBoard = nationBoard ? nationBoard.map((x) => x.slice() as [number, number, number]) : [];
  g.cmBoardStart = g.date;
  g.cmBoard = world2001 ? { rec: {}, dep: [], vac: [], ult: [], month: -1, tab: {}, nm: {}, nj: {} } : { rec: {}, dep: [], vac: [], ult: [], month: -1, tab: {}, nd: natDb ?? {} };
  if (world2001) cmBoardNationalInit(g);
  const db = `${g.date.slice(0, 4)}-01-01`;
  const env = boardEnv(g, db, g.date);
  initRecords(env, stateOf(g), rnd(g, dayNum(db), 0x68f130));
}

/** 0x68f130 2a (den originale database): landstrænerne bliver A-holdenes managere i bestyrelsen */
function cmBoardNationalInit(g: GameState): void {
  if (!g.cmBoard?.nm) return;
  // 0x68f130 2a: landstrænerne (staff +0x24 = A-holdet, +0x28 = 5/12) bliver A-holdets manager (den sidste i staff-rækkefølgen); de andre
  // landsholdsjob ryddes, og deres +0x28 sættes til 0 (staffPerson/clublessJob – +0x3d uden klub = landsholdsjobbet)
  const off = natClubId(g, 0, false);
  for (const s of Object.values(g.staff).sort((a, b) => a.id - b.id)) {
    const x = s.cmNat;
    if (!x || (x[1] !== 5 && x[1] !== 12)) continue;
    const n = x[0] - off;
    if (n >= 0 && n < g.nations.length) g.cmBoard.nm![n] = s.id;
  }
  // (2a) landstrænerens +0x28 bliver stående (5/12 – `continue`): 0x83fa72 (ønskelisten) og 0x69f9b8 (managerjob) springer ham over
  for (const id of Object.values(g.cmBoard.nm!)) { const x = g.staff[id]?.cmNat; if (x) g.cmBoard.nj![id] = x[1]; }
  resetNationalManagers(g);
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
  holidayJobs.length = 0;
  boardDaily(env, st, rand, (r) => weeklyUpdate(env, st, r));
  syncHuman(g);
  holidayJobAnswers(g);
}

/** auto_respond 0x784100 for jobtilbuddet 0x1774 på ferie: ja uden klub, ellers kun med ferievalg 1 og tilbuddets omdømme ≥ hans klubs (s16) */
export function holidayJobYes(opt1: number, ownRep: number | null, offerRep: number): boolean {
  if (ownRep === null) return true;
  return opt1 !== 0 && s16(offerRep) >= s16(ownRep);
}
/** jobtilbuddene, assistenten har besvaret på ferie (boardNews 'jobOffer'; tests lægger dem direkte i køen) */
export const holidayJobs: { club: number; yes: boolean }[] = [];
export function holidayJobAnswers(g: GameState): void {
  const list = holidayJobs.splice(0);
  for (const { club, yes } of list) {
    const on = natOfClub(club);
    if (on !== null) {
      if (g.manager.nationalOffer !== on) continue;
      if (yes) { cmBoardNationalAnswer(g, true); continue; }
      // nej: felt 1 = 2 (afslaget via auto_respond opretter ingen ny ledighed – 0x6b2790's add_job_vacancy er skærmens)
      g.manager.nationalOffer = undefined;
      const offer = g.news.find((x) => x.key === 'board.cm' && typeof x.params.bd === 'string' && x.params.bd.includes('"k":"o"') && x.params.club === g.nations[on]?.name);
      if (offer) { try { const d = JSON.parse(String(offer.params.bd)); d.st = 2; Object.assign(offer.params, boardParams(d, { club: offer.params.club })); } catch { /* */ } }
      continue;
    }
    if (!g.jobOffers.includes(club)) continue;
    if (yes && holidayHooks.acceptJob && g.clubs[club]?.manager === 0) { holidayHooks.acceptJob(club); continue; }
    g.jobOffers = g.jobOffers.filter((x) => x !== club);
  }
}

/** Forkørslen 0x5cc850 (cmPrerun.ts, 1/1 → dagen før start): MANAGER_MANAGER 0x68f9c0 kører hver dag på tidspunkt 2 (notes/calendar-prerun.md),
 *  med forkørslens dato som "i dag". Nyhederne sendes ikke: originalens indbakke ved start har kun spilstartens tre nyheder (målt), og
 *  [0xae2cfc] sættes først til 2 efter løkken. */
let prerunQuiet = false;
/** målinger: forkørslens managertrin kan slås fra */
export const boardPrerun = { on: true };
registerPrerun('managers', (g, day, iso) => {
  if (!cmBoardOn(g) || !boardPrerun.on) return;
  const st = stateOf(g), env = boardEnv(g, iso);
  prerunQuiet = true;
  try { boardDaily(env, st, rnd(g, day, 0x68f9c0), (r) => weeklyUpdate(env, st, r)); syncHuman(g); } finally { prerunQuiet = false; }
});

/** season.ts: League::set_club_season_expectations 0x68aa80 for hver liga (når sæsonen sættes op) */
export function cmBoardSeasonSetup(g: GameState, only?: Set<string>): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  // (16/11) sæsonskiftet pr. land (cmSeason.ts): kun de nye ligaer – de andre landes Comp_Stats-rækker fortsætter
  if (!only) st.tab = {};
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league' || g.leagues[comp.id]?.hidden || (only && !only.has(comp.id))) continue;
    if (only && st.tab) for (const c of comp.clubs) delete st.tab[c];
    for (const c of comp.clubs) { setSeasonExpectations(env, st, c, true, rnd(g, dayNum(g.date), 0x68aa80, c)); cmFineSeasonHalve(g, c); }   // 0x6a4472: 0x5a5930
  }
  syncHuman(g);
}

/** kampposten holdblok +8/+9 (0x729ff0 0x72a5bb/0x72a5c1: engine+0xf5bc + 54·side +2/+3 = skud og skud på mål, summeret over kamptruppens
 *  20 i 0x6d1cc0's watchedStats – u8) – læst af 0x695240 1.4a. Linjernes `cmr` [4]/[5] er spillerens +0x26/+0x27 (gittermotoren); uden dem
 *  (zonemotoren) linjernes skud. */
function teamBlock89(lines: MatchReport['players']): { b8: number; b9: number } {
  let b8 = 0, b9 = 0;
  for (const l of lines) { b8 = (b8 + (l.cmr ? l.cmr[4] : l.shots ?? 0)) & 0xff; b9 = (b9 + (l.cmr ? l.cmr[5] : l.on ?? 0)) & 0xff; }
  return { b8, b9 };
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
      club: t ? f.away : f.home, ...teamBlock89(lines),
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
  // (ydelse 14/11) afterMatch læser kun manageren (om der er en, og .np) – uden boardEnv's allPersons (alle personer pr. kamp)
  const touched = { done: false };
  afterMatch({ ...env, manager: (c) => managerPerson(g, c, env.today, touched) }, st, m, rnd(g, f.id, 0x695240));
  syncHuman(g);
}

/** international.ts playNation (ægte tilstand, efter landskampen og kamprapporten): 0x6951e0 for begge A-landshold. `venue` = spillestedets
 *  nation (hjemmeholdets land; slutrunderne: værtslandet). *Afvigelse*: de internationale turneringers omdømme (club_comp +0x69 for nation_comp)
 *  findes ikke i world-filen (0 som i gamePostReport). */
export function cmBoardNationalAfterMatch(g: GameState, home: number, away: number, rep: MatchReport, x: { b3a: number; w30: number; compId: number; friendly: boolean; venue: number }): void {
  if (!cmBoardOn(g) || !g.cmBoard?.nm) return;
  const st = stateOf(g), env = boardEnv(g, g.date, undefined, true);
  const [hs, as] = rep.stats;
  const nat = [home, away];
  const sideOf = (t: 0 | 1) => {
    const oppN = nat[t ? 0 : 1];
    return {
      club: natClub(nat[t]), ...teamBlock89(rep.players.filter((l) => l.team === t)),
      rows: rep.players.filter((l) => l.team === t).map((l) => {
        const p = g.players[l.id];
        const r = p?.cmRepMem ?? p?.cmRep ?? [50, 50, 50];
        // 1.4b: modstanderens nation = spillerens → +9, ikke udlænding → +9, ellers +0xd
        const v = p && (p.nation === oppN || !cmForeign(g, p.nation, oppN)) ? r[0] : r[2];
        return { rating: Math.max(1, Math.min(10, Math.round(l.rating))), minutes: Math.max(0, Math.min(127, l.minutes)), redAt: l.red ? l.minutes : -1, rep: Math.round(v * 50) };
      }),
    };
  };
  const m: MatchIn = {
    home: natClub(home), away: natClub(away), len: rep.et ? 120 : 90, b3a: x.b3a, w30: x.w30, w32: 0, w38: 0,
    gh: hs.goals, ga: as.goals, aggH: 0xff, aggA: 0xff, penH: rep.pens?.[0] ?? 0, penA: rep.pens?.[1] ?? 0,
    compRep: g.cmCompRep?.[x.compId] ?? 0, isDivision: () => false, friendly: x.friendly, inContention: () => true, derby: () => 0,
    venueHome: true, venueNation: x.venue, sides: [sideOf(0), sideOf(1)],
  };
  const touched = { done: false };
  afterMatch({ ...env, manager: (c) => managerPerson(g, c, env.today, touched) }, st, m, rnd(g, dayNum(g.date), 0x695240, 1000 + home, away));
}

/** 0x6a5610 for et landshold, når slutrunden er færdig (NationalTeams 0x775420 – cmNatTeams.ts) */
export function cmBoardNationalReview(g: GameState, n: number, comp: number, grade: number): void {
  if (!cmBoardOn(g) || !g.cmBoard?.nm) return;
  const env = boardEnv(g, g.date, undefined, true);
  reviewNational(env, stateOf(g), natClub(n), comp, grade, rnd(g, dayNum(g.date), 0x6a5610, n));
}
/** 0x775000/0x775220 → set_season_expectations(landsholdet, 1), når landsholdets aktuelle turnering skifter */
export function cmBoardNationalExpect(g: GameState, n: number): void {
  if (!cmBoardOn(g) || !g.cmBoard?.nm || (g.cmNationCont?.[n] ?? -1) < 0) return;
  const env = boardEnv(g, g.date, undefined, true);
  setSeasonExpectations(env, stateOf(g), natClub(n), true, rnd(g, dayNum(g.date), 0x6a3770, n));
}

/** International-skærmen (ægte tilstand): svaret på forbundets tilbud – Accept = 0x69ebc0 appoint_manager_to_club for landsholdet, Decline =
 *  add_job_vacancy(landsholdet, mennesket) (0x6b2790). null = ikke bestyrelsens tilbud */
export function cmBoardNationalAnswer(g: GameState, accept: boolean): string | null {
  if (!cmBoardOn(g) || !g.cmBoard?.nm) return null;
  const n = g.manager.nationalOffer;
  if (n === undefined) return 'error';
  g.manager.nationalOffer = undefined;
  const st = stateOf(g), env = boardEnv(g);
  const c = natClub(n);
  const rand = rnd(g, dayNum(g.date), 0x6b2790, n);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  // nyhedens slot 1 (1 accepteret, 2 afslået)
  const offer = g.news.find((x) => x.key === 'board.cm' && typeof x.params.bd === 'string' && x.params.bd.includes('"k":"o"') && x.params.club === g.nations[n]?.name);
  if (offer) { try { const d = JSON.parse(String(offer.params.bd)); d.st = accept ? 1 : 2; Object.assign(offer.params, boardParams(d, { club: offer.params.club })); } catch { /* */ } }
  if (!accept) { if (h) addVacancy(env, st, c, h, rand); return 'ok'; }
  // 0x69ebc0 tjekker ikke, om jobbet er besat imens: club +0xcf = mennesket (en udnævnt computermanager mister landsholdet)
  if (st.nm?.[n] !== undefined) { const id = st.nm[n]; delete st.nm[n]; delete st.nj?.[id]; }
  // 0x69ebc0 for landsholdet: det gamle landshold (menneskets +0x24) – ingen ny ledighed (kun for lande uden verdensdel), han fjernes dér
  const old = g.manager.national?.nation;
  if (old !== undefined && old !== n) g.manager.national = undefined;
  recOfG(g, c).d20 = { day: 234, year: 1971 };
  if (h) boardNews(g, env, { t: 'appointed', club: c, manager: h, prev: old !== undefined && old !== n ? natClub(old) : 0, kind: old !== undefined && old !== n ? 3 : 2 });
  g.manager.national = { nation: n, since: g.date, played: 0, won: 0 };
  resetForNewManager(env, st, c, rand);                                  // (ledighedsposten bliver – 0x68f9c0 dropper den, når jobbet er besat)
  resetNationalManagers(g);
  return 'ok';
}

/** International-skærmen (ægte tilstand): fratræd landsholdet – remove_club_manager(landsholdet, 2, 0, 0) + add_job_vacancy(landsholdet, mennesket) */
export function cmBoardNationalResign(g: GameState): string | null {
  if (!cmBoardOn(g) || !g.cmBoard?.nm) return null;
  const nj = g.manager.national;
  if (!nj) return 'error';
  const st = stateOf(g), env = boardEnv(g);
  const c = natClub(nj.nation);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  if (h) boardNews(g, env, { t: 'departed', club: c, manager: h, type: 2, reason: 0 });
  g.manager.national = undefined;
  recOfG(g, c).w6 = 3500;
  resetNationalManagers(g);
  if (h && env.canBeManaged(c)) addVacancy(env, st, c, h, rnd(g, dayNum(g.date), 0x6b204e, 1000 + nj.nation));
  return 'ok';
}

/** menneskets Board-skærm og bestyrelse (board.ts' felter) følger originalens post */
function syncHuman(g: GameState): void {
  const R = g.cmBoard?.rec[g.userClub];
  if (!R || !g.userClub) return;
  g.board.confidence = Math.max(0, Math.min(100, Math.round(s16(R.w6) / 100)));
  if (R.t2c) g.board.expectedPos = R.t2c;
  g.board.expectation = EXP_KEY(R.e);
}

/** (ydelse 14/11) boardEnv(g).manager(club) uden at bygge alle personer: samme Person-felter (staffPerson/humanPerson/noNp) og samme
 *  sideeffekt – allPersons gav alle personer et omdømme (cmRep ??= [1, 1, 1]), når manageren blev slået op. Kun til kaldere, der ikke sammenligner
 *  personerne med env.persons() (identiteten): kamprapportens managerdel og bestyrelsen efter kampen (afterMatch læser kun manageren). */
function managerPerson(g: GameState, club: number, today: CmDate, touched: { done: boolean; all?: Staff[] }): Person | null {
  if (tempManager.has(club)) return tempManager.get(club)!;
  const nn = natOfClub(club);
  if (nn !== null) {
    const h = humanRefs(g).find((x) => x.get().manager.national?.nation === nn);
    if (h) { h.get().manager.cmRep ??= [1, 1, 1]; return humanPerson(g, h); }
    const s = g.cmBoard?.nm?.[nn] !== undefined ? g.staff[g.cmBoard!.nm![nn]] : undefined;
    return s ? (s.cmNp ? staffPerson(g, s, today) : noNp(s)) : null;
  }
  const mid = g.clubs[club]?.manager ?? 0;
  if (mid === -1 || (mid > 0 && g.staff[mid]?.cmNp)) {
    if (!touched.done) {
      touched.done = true;
      for (const s of touched.all ?? Object.values(g.staff)) if (s.cmNp && !s.cmExtra) s.cmRep ??= [1, 1, 1];
      for (const h of humanRefs(g)) h.get().manager.cmRep ??= [1, 1, 1];
    }
  }
  if (mid === -1) return humanRefs(g).map((h) => humanPerson(g, h)).find((p) => p.club === club) ?? null;
  if (mid > 0) { const s = g.staff[mid]; return s?.cmNp ? (s.cmExtra ? null : staffPerson(g, s, today)) : s ? noNp(s) : null; }
  return null;
}

/** 0x6b6cc0 (efter kampen): managerens tre værdier fra 0x6d3610, assistenten og trænerne får en fjerdedel af ændringen */
postHooks.managerRep = (g, club, v) => {
  if (!cmBoardOn(g)) return;
  // (ydelse 14/11) personerne bygges direkte som boardEnv's manager()/person() ville give dem – før byggede boardEnv ALLE personer
  // (sorteret stab + mennesker) to gange pr. kamp (~0,4 s pr. lørdag med fem lande)
  // (ydelse) én liste over staben til begge gennemløb (rækkefølgen er Object.values' – staben ændres ikke imellem)
  const all = Object.values(g.staff);
  const today = isoToCm(g.date), touched = { done: false, all };
  const m = managerPerson(g, club, today, touched);
  if (!m || !m.np) return;
  const mine = all.filter((s) => s.club === club && s.cmNp);
  // club +0xd3 (assistenten) og +0x19f (de fem trænerpladser): env.person(id) = den byggede person (cmNp, ikke cmExtra), ellers noNp
  const staff = [...mine.filter((s) => s.role === 'assistant').slice(0, 1), ...mine.filter((s) => s.role === 'coach').slice(0, 5)]
    .map((s) => (s.cmExtra ? noNp(s) : staffPerson(g, s, today))).filter(Boolean);
  managerRepAfterMatch(m, staff, v[0], v[1], v[2]);
};

export const _test = { entryOf, leagueInfo };
export { squad };

/** 0x844780 staff_interest_in_job_at_club(s, c, 0, job, NULL) for et andet job end manager (stabens skifter, cmStaffMove.ts) */
export function staffJobInterest(g: GameState, env: BoardEnv, p: Person, c: number, job: number): number {
  return staffInterest(interestEnv(g, env), p, c, job);
}
