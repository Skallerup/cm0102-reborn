// Konditionsmodulet (cmFitness.ts – originalens injury.cpp) koblet til spillet: spilstarten, dagen, kampene og aflæsningerne.
// Kun den originale database i ægte tilstand (cmActive); ellers gør intet her noget, og spillets egen model (sim.ts) gælder.

import { registerCarry } from './carry';
import type { Fixture, GameState, MatchReport, Player } from './types';
import { cmActive, cmBodyOn, cmLogic, cmStaffStateInit, setCmPlayerCtx } from './cmPlayerData';
import {
  applyMatchEffects, clearKnocks, clubSeason, condition, currentInjury, dayNum, fatigue, fitIso, fitRand, hasSeasonRow, initRecords, initSquadFitness, injuryDaily, injuryStatus,
  HURT, newFit, recordKnock, recoverFatigue, setKnockHook, syncPlayer, trainingLoad, updateFitness, type CmInjury, type FitCtx, type MatchEntry,
} from './cmFitness';
import { addNews, gs, hasGame, onGameSwitch, pickNumber, rebuildIndexes, squad } from './state';
import { asOwner, isHumanClub } from './humans';
import { cmRand } from './cmPlayerData';
import { cmTrainPlayer, humanLevels, setTrainCtx } from './cmTraining';
import { setDevCtx } from './cmDevelop';
import { registerPrerun, runPrerun } from './cmPrerun';
import { cmRetireInjury } from './cmRetire';
import { intlHooks } from './hooks';
import { CM_SETUP_INJURIES, CM_SETUP_LOANS } from './data/cmPreseason';
import { cmPermitMove } from './cmPermit';
import { addInjury } from './cmFitness';

const pname = (p: Player) => `${p.first} ${p.last}`.trim();
/** modulet gælder: en CM-database i ægte tilstand (cmBodyOn – 2001 og fra 18/11 2026/27-spil startet med modulet), ikke draft-ligaen */
export const cmFitOn = (g: GameState) => cmBodyOn(g) && !g.draft;

/** formålene for talrækken (en pr. kaldested, så rækkefølgen inden for et formål er originalens) */
const SALT = { daily: 1, recover: 2, match: 3, read: 4, init: 5, prerun: 6, setup: 7 } as const;

type FitFns = Pick<FitCtx, 'squadOf' | 'human' | 'news' | 'retire' | 'onDuty' | 'intl' | 'inEurope' | 'train'>;
/** (hastighed) kontekstens funktioner afhænger kun af (spil, dag) – bygget én gang pr. dag i stedet for pr. aflæsning (linkPlayerCtx
 *  laver en kontekst for hver spiller, kontrakten spørger om); talrækken er stadig ny for hver kontekst som før */
let FIT_FNS: { g: GameState; today: number; f: FitFns } | null = null;
onGameSwitch(() => { FIT_FNS = null; });
function fitFns(g: GameState, today: number): FitFns {
  if (FIT_FNS && FIT_FNS.g === g && FIT_FNS.today === today) return FIT_FNS.f;
  const f: FitFns = {
    squadOf: (club) => squad(club),
    human: (club) => isHumanClub(club),
    news: (kind, p, inj) => injuryNews(g, kind, p, inj),
    // 0x62da70/0x62dbc6 → PLAYER_REGEN::schedule_injury_retirement 0x7a7f20 med skadens dage (+0x2a – cmRetire.ts)
    retire: (p, days) => cmRetireInjury(g, p, days, today),
    onDuty: (p) => intlDuty?.(p) ?? false,
    intl: (p, days, type) => intlHooks.withdraw?.(p, days, type),
    inEurope: (club) => cmClubEuro(g, club) > -1,
    train: (p) => cmTrainPlayer(g, p, 0x62d312),
  };
  FIT_FNS = { g, today, f };
  return f;
}

export function fitCtx(g: GameState, salt: number, today = dayNum(g.date)): FitCtx {
  const f = fitFns(g, today);
  return { g, today, rand: fitRand(g, today, salt), squadOf: f.squadOf, human: f.human, news: f.news, retire: f.retire, onDuty: f.onDuty, intl: f.intl, inEurope: f.inEurope, train: f.train };
}

/** landsholdsopholdet (staff +0x24 og datoen 0x76e040) – international.ts sætter den (undgår en cirkulær import) */
let intlDuty: ((p: Player) => boolean) | null = null;
export function setIntlDuty(f: (p: Player) => boolean): void { intlDuty = f; }
/** spilleren er på landsholdsophold lige nu (staff +0x24 ≠ 0) – cmKnow.ts */
export const intlOnDuty = (p: Player): boolean => intlDuty?.(p) ?? false;

/** club +0x1db: den europæiske turnering, klubben er med i lige nu (−1 = ingen). Skrives af de europæiske turneringers kode
 *  (0x4c6430 ved tildelingen af pladserne, 0x585ab0/0x586330 videre til næste turnering eller −1 ved udslagning); oraklets værdier
 *  326/328/330 = turneringernes id'er (Champions League, UEFA Cup og den tredje – rækkefølgen 326 → 328 ses, når et CL-hold ryger ned).
 *  Hos os: en ufærdig kontinental turnering, klubben er med i og ikke slået ud af (seneste dobbeltkamp ikke tabt; i ligafasen alle;
 *  efter ligafasen uden dobbeltkamp: de 8 bedste i tabellen) → CL 326, UEFA 328, andre 330. Læses af 0x62ce30 og 0x83cb40. */
export function cmClubEuro(g: GameState, club: number): number {
  for (const c of Object.values(g.comps)) {
    if (c.type !== 'continental' || c.finished || !c.clubs.includes(club)) continue;
    const mine = c.ties.filter((t) => t.a === club || t.b === club);
    let alive: boolean;
    if (!c.ties.length) alive = true;
    else if (mine.length) { const last = mine[mine.length - 1]; alive = last.winner === undefined || last.winner === club; }
    // uden egne dobbeltkampe og før tabellen findes: klubben går først ind i en senere runde (Man Utd i CL's gruppespil – oraklets spilstart:
    // +0x1db = 326 allerede 14/7, så 0x598800 giver transferbudgettets europæiske tillæg)
    else {
      const entry = (c.meta as { entry?: Record<string, number[]> } | undefined)?.entry;
      const later = !!entry && !c.table.length && Object.values(entry).some((ids) => ids.includes(club));
      alive = later || c.table.slice(0, 8).some((r) => r.club === club);
    }
    if (alive) return c.id === 'CL' ? 326 : c.id === 'UEFA' ? 328 : 330;
  }
  return -1;
}

/** periodens ord (originalen: "a few days", "about a week", "about a month", "about a year" …) */
function rangeKey(days: number): string {
  if (days <= 5) return 'injury.r.few';
  if (days <= 10) return 'injury.r.week';
  if (days <= 24) return `injury.r.weeks${Math.round(days / 7)}`;
  if (days <= 45) return 'injury.r.month';
  if (days <= 300) return `injury.r.months${Math.min(9, Math.round(days / 30))}`;
  return 'injury.r.year';
}

function injuryNews(g: GameState, kind: 'injury' | 'recovered', p: Player, inj: CmInjury): void {
  if (!p.club) return;
  const key = `cm${inj.t}`;
  if (kind === 'recovered') asOwner(p.club, () => addNews({ cat: 'injury', key: 'news.recovered', params: { player: pname(p), last: p.last, injury: key }, link: { kind: 'player', id: p.id } }));
  // CM 01/02 (strengene i cm0102.exe): overskriften "Keane injured" / "suffers injury" / "injury shocker" / "Injury blow for …" / "out for …",
  // brødteksten "X will be out of action for <periode> after he suffered <skade>." – hvilken overskrift og periodens ord er *estimeret*
  else asOwner(p.club, () => addNews({ cat: 'injury', key: `injury.o.h${p.id % 5}`, params: { player: pname(p), last: p.last || pname(p), injury: key, range: rangeKey(inj.w2a), days: inj.w2a }, link: { kind: 'player', id: p.id } }));
  void g;
}

/** konditionsmodulets aflæsninger til kontraktens opdatering 0x4cb250 (cmPlayerData.ts): 0x62c400 og sæsontabellen for klubbens land
 *  (0x669340 → 0xb63d60 +0x2a/+0x39: i dag efter starten og før slutningen – tabellens år følger clubSeason, *estimeret*) */
function unlinkPlayerCtx(): void { linked = false; setTrainCtx(null); setDevCtx(null); setCmPlayerCtx({}); }
function linkPlayerCtx(g0: GameState): void {
  linked = true;
  // spillet læses ved kaldet, ikke ved koblingen: newDay's landskampe (intlDaily) kører før dagens cmFitDay og brugte ellers gårsdagens
  // GameState-objekt – efter en indlæsning (eller dagens Web Worker, ui/dayRunner.ts) et andet objekt end det aktuelle
  const cur = () => (hasGame() ? gs() : g0);
  // træningen 0x8b1750 (0x8b39f0: skadestatus 2 → skemaet "No Training") og udviklingen 0x5ce2d0 (trætheden 0x62c3d0, skadens +0x2c 0x62ed70)
  setTrainCtx({
    injured: (p) => injuryStatus(fitCtx(cur(), SALT.read), p) === 2,
    human: (club) => isHumanClub(club),
    rand: (p, salt) => cmRand(cur().seed ?? 0, p.id, dayNum(cur().date), 0x8b1750, salt),
  });
  setDevCtx({
    fatigue: (p) => fatigue(p),
    injuryW2c: (p) => { const e = currentInjury(fitCtx(cur(), SALT.read), p); return e ? e.w2c : null; },
  });
  setCmPlayerCtx({
    fatigue: (p) => fatigue(p),
    injury: (p) => injuryStatus(fitCtx(cur(), SALT.read), p),
    injuryW2c: (p) => { const e = currentInjury(fitCtx(cur(), SALT.read), p); return e ? e.w2c : null; },
    inSeason: (club) => {
      const g = cur(), n = g.clubs[club]?.nation, today = dayNum(g.date);
      if (!hasSeasonRow(n)) return false;
      const [inS, start, end] = clubSeason(n, today);
      return inS && today > start && today < end;
    },
  });
}

/** de rigtige spillere i "staff-tabellens" rækkefølge (id – heltalsnøgler kommer i stigende orden) */
function realPlayers(g: GameState): Player[] {
  return Object.values(g.players).filter((p) => !p.regen);
}

/** Nyt spil: Injury::Injury (0x62cf70) på databasens dato (1/1) og dagene frem til spillets start (0x5cc850 kører 0x62b7b0 hver dag – uden
 *  kampe og uden 0x5ce2d0). Efter løkken (0x5ccc91–0x5cccaa) kommer trupplanen 0x83a1b0 (newgame.ts cmSquadPlanStart … cmShortlistStart – den
 *  læser konditionen og bringer posterne op til startdagen 0x62c680, så skader, der er helet, slutter), player_setup.cfg 0x7a30c0 (cmSetupLoans
 *  og skaderne) og 0x62a920 – de to sidste i cmFitSetupDay. */
export function cmFitNewGame(g: GameState): void {
  // (MODERN_PARITY 6) en CM-database i ægte tilstand – 2026/27 med: g.cmFitStart nedenfor slår modulet til (cmBodyOn)
  if (!cmLogic(g) || g.draft) return;
  linkPlayerCtx(g);
  g.cmFitStart = g.date;
  const ps = realPlayers(g);
  const start = dayNum(g.date);
  const db = dayNum(`${g.date.slice(0, 4)}-01-01`);
  setKnockHook(true);
  initRecords(fitCtx(g, SALT.init, db), ps);
  cmStaffStateInit(g, `${g.date.slice(0, 4)}-01-01`);                                 // 0x828110: staffpostens +0xa (indkøringsbyten) på databasens dato
  // forkørslen 0x5cc850 (cmPrerun.ts): trinet Injury 0x62b7b0 hver dag fra dagen efter databasens dato til dagen før start
  const staff = Object.keys(g.staff).length;
  prerunInjury = { ps, staff };
  try { runPrerun(g, db + 1, start); } finally { prerunInjury = null; }
}

/** Nyt spil efter trupplanen 0x83a1b0: player_setup.cfg 0x7a30c0's skader (lejeaftalerne er cmSetupLoans lige før) og
 *  Injury::init_squad_fitness 0x62a920 (0x5cccaa) for alle klubbers spillere – også de lejede i lejeklubben. */
export function cmFitSetupDay(g: GameState): void {
  if (!cmLogic(g) || g.draft || g.cmFitStart === undefined) return;
  const ps = realPlayers(g);
  const start = dayNum(g.date);
  setKnockHook(true);
  cmSetupInjuries(g, start);
  const c = fitCtx(g, SALT.init, start);
  initSquadFitness(c, ps);
  for (const p of ps) { if (p.cmFit) { const h = !!p.club && isHumanClub(p.club); p.cmFit.load = trainingLoad(p, h, h ? humanLevels(g, p) : null); } syncPlayer(c, p); }
}

/** Konvertering af et gammelt gemt spil (cmConvert.ts): posterne og startens Fitness som cmFitNewGame, men på spillets dato og uden
 *  forkørslen og databasens startskader (de hører til 2001-starten) – spillets gamle skader er ryddet af konverteringen */
export function cmFitConvert(g: GameState): void {
  if (!cmFitOn(g)) return;
  linkPlayerCtx(g);
  g.cmFitStart = g.date;
  const ps = realPlayers(g);
  const start = dayNum(g.date);
  setKnockHook(true);
  initRecords(fitCtx(g, SALT.init, start), ps);
  cmStaffStateInit(g, g.date);
  const c = fitCtx(g, SALT.init, start);
  initSquadFitness(c, ps);
  for (const p of ps) { if (p.cmFit) { const h = !!p.club && isHumanClub(p.club); p.cmFit.load = trainingLoad(p, h, h ? humanLevels(g, p) : null); } syncPlayer(c, p); }
}

/** player_setup.cfg 0x7a30c0(0x203b) efter forkørslen (0x5cc850, før 0x62a920): INJURY-linjerne → add_injury(type, 0, staff, 0, 1, −1, niveau,
 *  future) på startdagen (0x7a44c4/0x7a44fa). Linjerne er fundet i databasen af scripts/build-preseason.mts (0x7a50f0 – data/cmPreseason.ts).
 *  Nyheden 0x62dca0 til mennesket sendes ikke (*estimeret* – spillet er ikke begyndt). LOAN/INT_RETIREMENT/MISCONDUCT er ikke porteret. */
export function cmSetupInjuries(g: GameState, start: number): void {
  // 2026/27 (dbVersion findes kun for 2001-databaserne): opdateringens egen player_setup.cfg under databasens år (scripts/build-preseason.mts)
  const list = CM_SETUP_INJURIES[g.dbVersion ?? ((g.dbYear ?? 0) >= 2020 ? String(g.dbYear) : '3.9.60')] ?? [];
  const c = { ...fitCtx(g, SALT.setup, start), news: undefined };
  for (const [id, t, perm, future] of list) {
    const p = g.players[id];
    if (p) addInjury(c, t, false, p, 0, true, -1, perm, future === 1);
  }
}

/** player_setup.cfg's LOAN-linjer (0x7a4d24 → TRANSFER_MANAGER 0x8bf400(staff, klub, &start, &slut), samme kald 0x7a30c0 efter trupplanen
 *  0x83a1b0 og før 0x62a920 – newgame.ts kalder den lige efter cmWageFillNewGame). Linjerne er fundet i databasen af scripts/build-preseason.mts.
 *  0x8bf400 (læst 17/11-2026): 0x540a50(klub, &ud, 1) – et reservehold som lejeklub giver moderklubben (ingen af filens linjer har et);
 *  ingen leje, når lejeklubben har 50 i truppen (0x53c590), spilleren allerede er lejet (0x4cf6d0), startdatoen er efter i dag, slutdatoen før
 *  i dag eller han ingen kontrakt har (0x4cf5a0). Kontraktens udløb (staff +0x46, kontrakt +0x2d) før lejens slut → rykkes til slutdatoen.
 *  Lejekontrakten 0x85e590(staff, klub, slut, 0 %, 1, 1): lønnen 0 % hos lejeklubben (Player.loan.share 0), +0x25 = startdatoen, 0x4d01e0
 *  (staff +0x39 = lejeklubben); trøjenummeret 0x85a470 (her pickNumber); arbejdstilladelsen 0x8c7560 → 0x8c7070 (cmPermitMove).
 *  Ingen klubskifte-følger (0x8c9720 kaldes ikke: indkøringsbyten og klubbernes omdømme uændrede). Bagefter 0x62a920 (cmFitSetupDay) – også for
 *  de lejede (lejeklubbens sæson). Ikke porteret: 0x5563f0 (Discipline), 0x540980(staff, 1) (+0x5e), staff +0x6d 2 → 0x10. */
export function cmSetupLoans(g: GameState): number {
  // (20/11, Bosman 0.7.2-tjeklisten punkt 3) også 2026/27 i ægte tilstand (nye spil med originalens kalender, g.cmCal): opdateringens egne LOAN-linjer
  // (scripts/build-preseason.mts – datoerne skubbet fra 2001/02-uret til spillets) under databasens år, som startskaderne
  if (!(cmActive(g) || (cmLogic(g) && g.cmCal === 1)) || g.draft) return 0;
  const list = CM_SETUP_LOANS[g.dbVersion ?? ((g.dbYear ?? 0) >= 2020 ? String(g.dbYear) : '3.9.60')] ?? [];
  const moved: Player[] = [];
  for (const [id, to, start, end] of list) {
    const p = g.players[id], club = g.clubs[to];
    if (!p || !club || !p.club || p.club === to) continue;
    if (squad(to).filter((x) => !x.virtual).length >= 50) continue;               // 0x8bf466: 0x53c590 < 0x32
    if (p.loan) continue;                                                         // 0x8bf47c: 0x4cf6d0
    if (start > g.date || end < g.date) continue;                                 // 0x8bf4a8 / 0x8bf4e2
    if (!p.contract) continue;                                                    // 0x8bf504: 0x4cf5a0
    if (p.contract.expires.slice(0, 10) < end) p.contract.expires = end;           // 0x8bf527–0x8bf560
    const from = p.club;
    p.loan = { from, until: end, share: 0 };
    p.club = to;
    p.number = pickNumber(p, to, p.number);
    cmPermitMove(g, p, to);
    moved.push(p);
  }
  if (!moved.length) return 0;
  rebuildIndexes();
  return moved.length;
}

/** forkørslens Injury-trin (0x5cc850 → 0x62b7b0 ved tidspunkt 2) – spillerlisten og stabens antal fra cmFitNewGame */
let prerunInjury: { ps: Player[]; staff: number } | null = null;
registerPrerun('injury', (g, d) => { if (prerunInjury) injuryDaily(fitCtx(g, SALT.prerun, d), prerunInjury.ps, prerunInjury.staff); });

/** Dagen (sim.ts newDay): 0x62b7b0, så 0x5ce2d0's del – trætheden falder for alle (0x62c2f0) – og aflæsningerne: menneskets spillere
 *  (0x5cf226) og de skadede (deres status, så spillets udtagelse og skærme ser skaden). */
export function cmFitDay(g: GameState): void {
  if (!cmFitOn(g)) { setKnockHook(false); return; }
  setKnockHook(true);
  linkPlayerCtx(g);
  g.cmFitStart ??= g.date;
  const ps = realPlayers(g);
  const today = dayNum(g.date);
  for (const p of ps) p.cmFit ??= newFit(today);
  injuryDaily(fitCtx(g, SALT.daily), ps, Object.keys(g.staff).length);
  const rc = fitCtx(g, SALT.recover), rd = fitCtx(g, SALT.read);
  for (const p of ps) {
    recoverFatigue(rc, p);
    const human = !!p.club && isHumanClub(p.club);
    // +0x1e: 0x8b1750 – et menneskes spillere på standardskemaet, de andre 50 (sættes, når spilleren forlader menneskets klub)
    const load = trainingLoad(p, human, human ? humanLevels(g, p) : null);
    if (p.cmFit && p.cmFit.load !== load) p.cmFit.load = load;
    if (human || p.cmFit?.inj || p.injury) syncPlayer(rd, p);
  }
}

/** før kampen: holdenes spillere læses (0x62c590 i 0x6e2f20 og MATCH_PLAYER::setup 0x6eb026) – kondition og skade til begge motorer */
export function cmFitPreMatch(g: GameState, clubs: number[]): void {
  if (!cmFitOn(g)) return;
  setKnockHook(true);
  linkPlayerCtx(g);
  const c = fitCtx(g, SALT.read);
  for (const club of clubs) for (const p of squad(club)) syncPlayer(c, p);
}

/** aflæsningen (0x62c590/0x62c400) for bestemte spillere – fx et landsholds trup før kampen */
export function cmFitSync(g: GameState, ps: Player[]): void {
  if (!cmFitOn(g)) return;
  const c = fitCtx(g, SALT.read);
  for (const p of ps) syncPlayer(c, p);
}

/** kamptrupperne (de 11 + bænken) pr. klub – sat før kampen (sim.ts prepareMatch og computerens udtagelse aiTeam.ts) */
const matchSquads = new Map<number, number[]>();
export function setMatchSquad(club: number, ids: number[]): void { matchSquads.set(club, ids); }
// carry.ts: kamptrupperne (landskampe sletter dem ikke) og om kontekstkrogene er koblet (linkPlayerCtx – ellers først ved dagens cmFitDay,
// efter at newDay's første trin har kørt uden dem) følger med en kopi/et gemt spil
let linked = false;
registerCarry('cmFitnessGame', () => ({ sq: [...matchSquads], linked }),
  (v: { sq: [number, number[]][]; linked: boolean }) => { matchSquads.clear(); for (const [k, x] of v.sq) matchSquads.set(k, x); if (v.linked) linkPlayerCtx(gs()); else unlinkPlayerCtx(); },
  () => { matchSquads.clear(); unlinkPlayerCtx(); });

/** efter kampen (sim.ts applyMatchResult): 0x62c080 for begge hold – kampkonditionen, trætheden og skaderne af kampens knocks.
 *  Zonemotorens kampe har ingen knockliste: en skadet spiller får en knock med gittermotorens kategori/sværhed (*estimeret*). */
export function cmFitAfterMatch(g: GameState, f: Fixture, rep: MatchReport): boolean {
  if (!cmFitOn(g)) return false;
  // 0x62c14b: halv træthed kun når fixture +0x40 (hjemmesidens førsteholdsflag) = 0 – reservesidens kampe, som 2001/02 ikke har for klubberne;
  // venskabskampe (Friendly 72) har +0x40 ≠ 0: målt i oraklet (daysnap s1-3.9.60-e1, 17–22/7-2001) stiger trætheden med den fulde
  // (10000 − MC)/100 + minutter (·2 for de unge), ikke det halve
  cmFitMatch(g, rep, true, f.id, [f.home, f.away]);
  return true;
}

/** 0x62c080 for en kamp uden for klubkampene (landskampe international.ts, venskabskampe friendlies.ts): ingen ubrugte udskiftere kendt
 *  (`clubs` udelades), venskabskampe tæller halvt. Spillets egen træthed/skade for de kampe springes over i ægte tilstand. */
export function cmFitMatch(g: GameState, rep: MatchReport, competitive: boolean, fixture: number, clubs?: [number, number]): void {
  if (!cmFitOn(g)) return;
  const c = fitCtx(g, SALT.match);
  if (rep.engine !== 'original') {
    for (const line of rep.players) if (line.injured) {
      let sev = c.rand(c.rand(102)); if (sev > 50 && c.rand(3) !== 0) sev = c.rand(c.rand(76));
      recordKnock(line.id, 1 + c.rand(9), sev, HURT);
    }
  }
  const entries: MatchEntry[] = [];
  for (const team of [0, 1]) {
    const lines = rep.players.filter((l) => l.team === team);
    const seen = new Set(lines.map((l) => l.id));
    for (const l of lines) {
      const p = g.players[l.id]; if (!p) continue;
      entries.push({ p, starter: !l.sub, minutes: Math.max(0, l.minutes), cond: Math.round(l.cond * 100), hurt: l.injured });
    }
    // ubrugte udskiftere (k ≥ 11, +0x32 = 0xff): 0 minutter, konditionen som ved kampstart
    const club = clubs?.[team];
    if (club === undefined) continue;
    for (const id of matchSquads.get(club) ?? []) {
      const p = g.players[id];
      if (!p || seen.has(id)) continue;
      entries.push({ p, starter: false, minutes: 0, cond: condition(c, p), hurt: false });
    }
    matchSquads.delete(club);
  }
  applyMatchEffects(c, entries, competitive, fixture);
  clearKnocks();
  const rd = fitCtx(g, SALT.read);
  for (const e of entries) syncPlayer(rd, e.p);
}

/** 0x62c590/0x62c3d0/0x62ed70 til computerens udtagelse (aiTeam.ts roleDataOf) */
export function cmFitRead(g: GameState) {
  const c = fitCtx(g, SALT.read);
  return {
    condition: (p: Player) => condition(c, p),
    fatigue: (p: Player) => fatigue(p),
    injury: (p: Player) => { const e = currentInjury(c, p); return e ? { w28: e.w28, w2c: e.w2c } : null; },
    /** 0x62c400: 2 = skadet, 1 = genoptræner, 0 = klar */
    status: (p: Player) => injuryStatus(c, p),
    update: (p: Player) => updateFitness(c, p),
  };
}
export { fitIso };
