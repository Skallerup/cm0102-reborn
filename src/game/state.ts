import { LEAGUE_RULES } from './leagues';
import { rng } from './rng';
import type { GameState, NewsItem, Player } from './types';

// Global spiltilstand. UI abonnerer via subscribe() og læser med gs().
let G: GameState | null = null;
const listeners = new Set<() => void>();
let version = 0;

export function gs(): GameState {
  if (!G) throw new Error('Intet spil indlæst');
  return G;
}

export function hasGame(): boolean {
  return G !== null;
}

import { setEconomy, setModern26 } from './econ';
import { setSavedModern } from '../ui/modernFlag';
import { cmPermitMove } from './cmPermit';
import { cmActive, cmMarketOn, cmMediaOn, cmStaffStateMove } from './cmPlayerData';
import { offInOriginal } from './newsFilter';
import { legacyExtended } from './rules';
import { captureCarry, registerCarry, restoreCarry } from './carry';
import { daysBetween } from './dates';
import { clubSeason, dayNum, hasSeasonRow } from './cmFitness';

/**
 * Admin-preview: en spillers gemte spil åbnet til fejlsøgning (Admin → Saves / New careers). Intet gemmes, og intet
 * sendes videre (ranglister, puls, fejlrapporter) – se save.ts, rank.ts, notify.ts og errors.ts. Nulstilles af setGame.
 */
let preview: { label: string; theme?: string; setup?: boolean } | null = null;
export const previewInfo = () => preview;
export function setPreview(p: { label: string; theme?: string; setup?: boolean } | null) { preview = p; }
/**
 * Nyt-spil-forløbet (ClassicStart.tsx): efter Select League(s) bygges en midlertidig verden, så Select Team viser klubbens ægte skærme (trup, kampe, General Info).
 * Intet gemmes eller sendes (som en admin-preview), og forsiden/startmenuen styrer stadig skærmen. setGame(…) afslutter forløbet.
 */
export const inSetup = () => !!preview?.setup;
export function setSetupGame(g: GameState) { setGame(g); preview = { label: 'setup', setup: true }; notify(); }

/** LEAGUE_RULES som modulet definerer dem – et spils customRules lægges oven på (og forrige spils fjernes) */
const BASE_RULES = { ...LEAGUE_RULES };

/** Hukommelse (Safari "Out of memory" 19/11): modulernes caches med ét spil i sig (`{ g, … }`, sammenlignet med `=== g`) holdt det forrige spil
 *  (nyt-spil-forløbets midlertidige verden, spillet før dagens Web Worker) i live efter et skifte. De tømmes, når et andet spil lægges ind – de ville
 *  alligevel ikke ramme (nøglen er spilobjektet), så intet resultat ændres. (`var` + funktionserklæring: kan kaldes, mens modulerne indlæses i en
 *  cirkulær import.) */
// eslint-disable-next-line no-var
var GAME_SWITCH: (() => void)[] | undefined;
export function onGameSwitch(reset: () => void): void { (GAME_SWITCH ??= []).push(reset); }

/** `keepCarry`: modulernes tilstand (carry.ts) røres ikke, selvom spillet er et nyt objekt (konverteringen bygger videre på createGame's tilstand) */
export function setGame(g: GameState | null, opts?: { keepCarry?: boolean }) {
  preview = null;
  const other = !!g && g !== G, prevG = G;
  if (g !== G && GAME_SWITCH) for (const f of GAME_SWITCH) f();
  // ligaregler fra en importeret database (CM 01/02) skal kendes, før spillet simuleres – forrige spils regler følger ikke med
  if (other && !opts?.keepCarry) { for (const k of Object.keys(LEAGUE_RULES)) if (!(k in BASE_RULES)) delete LEAGUE_RULES[k]; Object.assign(LEAGUE_RULES, BASE_RULES); }
  if (g?.customRules) Object.assign(LEAGUE_RULES, g.customRules);
  G = g;
  // et gammelt udvidet spil åbnes, som det blev gemt – men aldrig fællesspil (de er altid klassiske/ægte, ejeren 16/11)
  setSavedModern(!!g && legacyExtended(g) && !g.humans?.length);
  // prisniveauet: nye spil med den originale 01/02-database spilles i 2001-priser (econ.ts)
  setEconomy(g?.econ);
  setModern26(g?.m26);
  if (g) rng.state = g.rng;
  rebuildIndexes();
  // modulernes tilstand: den gemte (kopi/gem af et spil i gang) eller en ny proces' (nyt spil, gamle gemte spil) – carry.ts
  if (g?.cmCarry) { const c = g.cmCarry; delete g.cmCarry; restoreCarry(c); }
  else if (other && !opts?.keepCarry) restoreCarry(undefined);
  // (hukommelse, iPhone 22/11) intet spil: modulernes tilstand nulstilles – den holdt ellers det forrige spil (cmFitnessGame's kroge lukker om
  // spilobjektet), så nyt-spil-forløbets midlertidige verden levede videre i hovedtråden under Take Control. Et senere spil får altid en ny
  // tilstand (`other`), så intet resultat ændres.
  else if (!g && prevG) restoreCarry(undefined);
  notify();
}
/** modulernes tilstand lagt i spillet (til en kopi, der skal fortsætte præcis som dette spil: gem, Web Worker) – kun det aktive spil */
export function packCarry(g: GameState): void {
  if (g === G) g.cmCarry = captureCarry();
}

export function notify() {
  if (G) G.rng = rng.state;
  version++;
  for (const l of listeners) l();
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getVersion() {
  return version;
}

// ---------- indekser (genberegnes, gemmes ikke) ----------

let squadIndex = new Map<number, number[]>();
let fixturesByDate = new Map<string, number[]>();

export function rebuildIndexes() {
  moveGen++;
  squadIndex = new Map();
  fixturesByDate = new Map();
  if (!G) return;
  for (const p of Object.values(G.players)) {
    if (!p.club) continue;
    let arr = squadIndex.get(p.club);
    if (!arr) squadIndex.set(p.club, (arr = []));
    arr.push(p.id);
  }
  for (const f of Object.values(G.fixtures)) indexFixture(f.id, f.date);
}

/** indeksernes rækkefølge (squad() og fixturesOn() følger den) – dagens Web Worker (ui/dayRunner.ts) sender den med spillet begge veje, så
 *  en kørsel i arbejderen giver præcis det samme som i hovedtråden (rebuildIndexes bygger dem i spillerrækkefølge, ikke i skifternes) */
export type IndexSnapshot = { sq: [number, number[]][]; fx: [string, number[]][] };
export function indexSnapshot(): IndexSnapshot {
  return { sq: [...squadIndex], fx: [...fixturesByDate] };
}
export function restoreIndexes(s: IndexSnapshot) {
  squadIndex = new Map(s.sq);
  fixturesByDate = new Map(s.fx);
}
// indeksernes rækkefølge følger med en kopi (rebuildIndexes i setGame giver id-rækkefølgen, ikke forløbets); reset = den genbyggede
registerCarry('state.idx', () => indexSnapshot(), (v: IndexSnapshot) => restoreIndexes(v), () => {});

export function indexFixture(id: number, date: string) {
  let arr = fixturesByDate.get(date);
  if (!arr) fixturesByDate.set(date, (arr = []));
  if (!arr.includes(id)) arr.push(id);
}

export function unindexFixture(id: number, date: string) {
  const arr = fixturesByDate.get(date);
  if (arr) fixturesByDate.set(date, arr.filter((x) => x !== id));
}

export function fixturesOn(date: string): number[] {
  return fixturesByDate.get(date) ?? [];
}

export function squad(clubId: number): Player[] {
  const g = gs();
  return (squadIndex.get(clubId) ?? []).map((id) => g.players[id]).filter((p) => p && p.club === clubId);
}

export function squadIds(clubId: number): number[] {
  return squadIndex.get(clubId) ?? [];
}

/** de udlejedes opslag nedenfor: bygges helt efter rebuildIndexes (moveGen) og opdateres for hver spiller, setClub har flyttet (moved) */
let moveGen = 0;
let movedIds: number[] = [];
let loanOut: { g: GameState; gen: number; by: Map<number, Set<number>>; of: Map<number, number> } | null = null;
/** spillerne, klubben har lejet ud (Player.loan.from = klubben, Player.club = lejeklubben) – i originalen står de i begge klubbers trupliste
 *  (klub +0xd7; oraklet 14/7-01: Chelseas Rhys Evans i både Chelseas og Leyton Orients). Kontrolleres ved hvert kald (en lejeaftale, der ender
 *  uden klubskifte – købsoptionen – falder ud). `g` gives med (trupplanen kører også i ugens Web Worker, hvor gs() ikke er sat) */
export function loanedOut(g: GameState, clubId: number): Player[] {
  const put = (L: NonNullable<typeof loanOut>, p: Player | undefined, id: number) => {
    const was = L.of.get(id);
    if (was !== undefined) { L.by.get(was)?.delete(id); L.of.delete(id); }
    if (p?.loan && p.club) { let a = L.by.get(p.loan.from); if (!a) L.by.set(p.loan.from, (a = new Set())); a.add(id); L.of.set(id, p.loan.from); }
  };
  if (!loanOut || loanOut.g !== g || loanOut.gen !== moveGen) {
    loanOut = { g, gen: moveGen, by: new Map(), of: new Map() };
    for (const p of Object.values(g.players)) if (p.loan) put(loanOut, p, p.id);
    movedIds = [];
  } else if (movedIds.length) {
    for (const id of movedIds) put(loanOut, g.players[id], id);
    movedIds = [];
  }
  const out: Player[] = [];
  for (const id of loanOut.by.get(clubId) ?? []) { const p = g.players[id]; if (p && p.loan?.from === clubId && p.club && p.club !== clubId) out.push(p); }
  return out.sort((a, b) => a.id - b.id);
}

/** cmMedia.ts registrerer sign_contract's moral (en direkte import giver en cirkulær import) */
export const signHooks: { onSign?: (g: GameState, p: Player) => void } = {};

/** Fri transfer fra en computerklub (0x8c1af0 – historikkens art 3) i Player.moves som season.ts recordMove(p, 0, 0), uden rekorderne
 *  (kun menneskets klubber har dem). Her, så cmSquadPlanGame/cmContractManager ikke importerer season.ts (importkredsen). `g` gives med:
 *  trupplanen kører også i ugens Web Worker, hvor gs() ikke er sat */
export function recordFreeTransfer(g: GameState, p: Player) {
  (p.moves ??= []).push({ season: g.season, date: g.date, from: p.club, to: 0, fee: 0 });
  if (p.moves.length > 20) p.moves.shift();
}

/** Hvordan spilleren forlod klubben – argumenterne til originalens arkivering 0x7c5fe0(staff, fee, bytte, art 1, klub, Bosman) ved skiftet */
export interface CareerLeft {
  /** arg2: beløbet (undefined = −1: intet beløb – leje, sæsonslut, kontraktudløb) */
  fee?: number;
  /** postens art (+0x2a & 7): 1 = arg4 (lejens start sign_loan 0x4d01e0, den fri transfer 0x8c1af0), 2 = bytte (arg3), 3 = Bosman (arg6) */
  kind?: 1 | 2 | 3;
  /** arg5 > −1 (en klub efter skiftet): lejens slut end_loan 0x4d07e0 (moderklubbens id) */
  toClub?: boolean;
}

/** 0x7c6487–0x7c64f2: klubbens land har en række i sæsontabellen 0xb63d60 (0x669340 < 0x23), og i dag ligger efter starten (+0x2a) og før
 *  slutningen (+0x39) – som cmFitnessGame.ts inSeason (tabellens år følger clubSeason). Uden klub/land/række: sand (0x7c648c/0x7c6493/0x7c64a0) */
function careerInWindow(g: GameState, club: number): boolean {
  const n = g.clubs[club]?.nation;
  if (n === undefined || !hasSeasonRow(n)) return true;
  const today = dayNum(g.date);
  const [inS, start, end] = clubSeason(n, today);
  return inS && today > start && today < end;
}

/** Flyt spiller mellem klubber og hold indekset opdateret. `left`: hvordan han forlader den gamle klub (Playing Career – CareerLeft); uden
 *  udledes lejens start/slut af p.loan */
export function setClub(p: Player, club: number, left?: CareerLeft) {
  if (movedIds.length < 100000) movedIds.push(p.id); else moveGen++;
  if (p.club) {
    const arr = squadIndex.get(p.club);
    if (arr) squadIndex.set(p.club, arr.filter((id) => id !== p.id));
  }
  const moved = p.club !== club;
  // ny klub = ny start: utilfredsheden over spilletid hører til den gamle klub (en nyindkøbt spiller stod ellers som
  // "utilfreds med sin spilletid" samme dag, han kom – ejerens fejlmelding 2026-11-10)
  if (moved && club) p.unhappy = 0;
  // originalen: statistikken arkiveres (0x7c5fe0) og en ny kontrakt starter (0x4cf720) – cmPlayerData.ts
  // Playing Career (0x7c5fe0): sæsonens tal for den gamle klub bogføres på dens egen linje ved ethvert skifte (salg, leje ud/hjem,
  // fri transfer, frigivelse) – den nye klub starter fra 0 (før fik den nye klubs linje hele sæsonens tal, ejerens fejl 19/11)
  // Lejens start (sign_loan 0x4d01e0: 0x7c5fe0(staff, −1, 0, 1, lejeklubben, 0) ved moderklubben) giver altid en post (art 1), lejens slut
  // (end_loan 0x4d07e0: 0x7c5fe0(staff, −1, 0, 0, moderklubben, 0) ved lejeklubben) en uden mærke – også uden kampe, når betingelsen holder
  if (moved && p.club && hasGame() && p.stats) {
    const start = !!p.loan && p.loan.from === p.club, end = !!p.loan && p.loan.from === club;
    pushCareerLine(p, p.club, !!p.loan && !start, left ?? (start ? { kind: 1 } : end ? { toClub: true } : undefined));
  }
  // en klubløs spiller har ingen kontrakt og dermed ingen trupstatus (kontrakten +0x4f slettes sammen med posten) – før hang "squad rotation" ved efter fri transfer/frigivelse (ejerens fund 21/11)
  if (moved && !club) p.squadStatus = undefined;
  // CM 01/02: en leje (sign_loan_contract 0x4d01e0) og dens slut (end_loan 0x4d07e0) laver/sletter kun lejekontrakten (række +4) – hovedkontrakten
  // (række +0: trupstatus +0x4f, +0x3d–+0x3f, +0x44/+0x45, +0x4e) bliver stående (oraklets billeder 3/11-01: udlejedes hovedkontrakt +0x4f 0x7a/0x6a/0x5a).
  // Før fik en leje lavet i spillet en ny kontrakt med trupstatus 0, så viljen 0x846920 (0x8474dc: +0x4f >> 4) gav ×7 for en udlejet
  const loanMove = moved && !!p.loan && (p.loan.from === p.club || p.loan.from === club) && hasGame() && cmMarketOn(gs());
  // Lejens start (handle_player_accepted_terms 0x8c2180 → sign_loan_contract 0x4d01e0, uden om finalise_transfer 0x8c9390) og slut (end_loan
  // 0x4d07e0) kalder ikke klubskiftet 0x8c9720 (dets eneste kalder er 0x8c9390): klubbernes omdømme +0x80, indkøringsbyten og trupplanens
  // tæller (cmStaffStateMove) er urørte. Før gav hver leje ud −verdensomdømme/100 og retur +, så lejerne flyttede omdømmet frem og tilbage.
  const loanLeg = moved && !!p.loan && (p.loan.from === p.club || p.loan.from === club);
  if (moved) { p.cmStats = undefined; if (!loanMove) p.cmContract = undefined; if (hasGame()) { cmPermitMove(gs(), p, club); if (!loanLeg) cmStaffStateMove(gs(), p, p.club, club); } }
  p.club = club;
  // en nyindkøbt spiller kommer på førsteholdet: reserve-mærket hører til den gamle klub (spillerrapport #25: Obi og Arthur
  // stod som reserver hos ejeren – røde, uden "+ Sub" og uden at kunne vælges)
  if (moved && club && p.reserves && hasGame() && gs().clubs[club]?.manager === -1) p.reserves = undefined;
  // sign_contract 0x4cf720: en ny almindelig kontrakt (ikke leje) giver moralen +20 (cmMedia.ts)
  if (moved && club && !p.loan && hasGame()) signHooks.onSign?.(gs(), p);
  if (club) {
    let arr = squadIndex.get(club);
    if (!arr) squadIndex.set(club, (arr = []));
    arr.push(p.id);
  }
  // nyt trøjenummer ved klubskifte: det gamle, hvis det er ledigt – ellers et passende ledigt nummer
  if (moved) p.number = club ? pickNumber(p, club, p.number) : undefined;
}

/** Bogfør sæsonens tal siden sidste skifte (p.split) på en klub i karrieren (0x7c5fe0); idempotent (intet nyt siden skiftet = ingen linje).
 *  Uden kampe (ingen post i kategori 6) skriver originalen alligevel en nul-post (0x7c64f7–0x7c65ab), når skiftet har et beløb (fee > −1), er
 *  art 1 (arg4: lejens start, den fri transfer), eller har en klub efter skiftet (arg5 > −1: lejens slut) og enten ikke ligger i landets sæson
 *  eller han har været under 365 dage i klubben (staff +0x3e, 0x54cdb0) – ellers ingen linje. `left` = CareerLeft (mærket i Playing Career) */
export function pushCareerLine(p: Player, club: number, loan: boolean, left?: CareerLeft) {
  const g = gs();
  const b = p.split ?? { apps: 0, goals: 0, assists: 0, minutes: 0, ratingSum: 0, ratingCount: 0 };
  const apps = p.stats.apps + p.stats.subs - b.apps;
  const how = { ...(left?.fee !== undefined && left.fee >= 0 ? { fee: left.fee } : {}), ...(left?.kind ? { kind: left.kind } : {}) };
  if (apps <= 0) {
    const force = !!left && ((left.fee ?? -1) > -1 || left.kind === 1
      || (!!left.toClub && (!careerInWindow(g, club) || (!!p.joined && daysBetween(p.joined, g.date) < 365))));
    // (samme skifte bogføres kun én gang – completeTransfer bogfører før setClub; en ny post med samme år, klub og art lægges i 0x7c3e40
    // alligevel sammen med den forrige række)
    const last = p.history[p.history.length - 1];
    if (!force || (last && last.season === g.season && last.club === club)) return;
    p.history.push({ season: g.season, club, apps: 0, goals: 0, assists: 0, minutes: 0, avg: 0, ...(loan ? { loan: true } : {}), ...how });
    if (p.history.length > 30) p.history.shift();
    return;
  }
  const rc = p.stats.ratingCount - b.ratingCount;
  // (gemte spil fra før 19/11: skiftet uden MoM i p.split – den bogførte del kendes ikke, så linjen får ingen MoM)
  const mom = p.split && p.split.mom === undefined ? 0 : p.stats.mom - (b.mom ?? 0);
  p.history.push({
    season: g.season, club, apps, goals: p.stats.goals - b.goals, assists: p.stats.assists - b.assists, minutes: p.stats.minutes - b.minutes,
    avg: rc > 0 ? Math.round(((p.stats.ratingSum - b.ratingSum) / rc) * 100) / 100 : 0, ...(mom > 0 ? { mom } : {}), ...(loan ? { loan: true } : {}), ...how,
  });
  if (p.history.length > 30) p.history.shift();
  p.split = { apps: p.stats.apps + p.stats.subs, goals: p.stats.goals, assists: p.stats.assists, minutes: p.stats.minutes, ratingSum: p.stats.ratingSum, ratingCount: p.stats.ratingCount, mom: p.stats.mom };
}

/** Foretrukne trøjenumre pr. position (som de klassiske numre: 1 mål, 2-5 forsvar, 6-8 midtbane, 9-11 angreb) */
const PREFERRED: Record<string, number[]> = {
  GK: [1, 13, 12, 21, 25, 30, 31], DEF: [2, 3, 4, 5, 6, 12, 14, 15, 16, 22, 23, 24, 26], MID: [8, 6, 7, 4, 10, 14, 16, 17, 18, 19, 20, 21, 22],
  ATT: [9, 10, 11, 7, 18, 19, 20, 17, 27, 28, 29],
};
export function numberGroup(p: Player): keyof typeof PREFERRED {
  // POSITIONS: GK, SW, D, DM, M, AM, F, WB (se attributes.ts)
  const best = p.pos.indexOf(Math.max(...p.pos));
  return best === 0 ? 'GK' : best <= 2 || best === 7 ? 'DEF' : best <= 5 ? 'MID' : 'ATT';
}
/** Et ledigt nummer i klubben til spilleren (ønsket nummer først, så positionens numre, så det laveste ledige) */
export function pickNumber(p: Player, club: number, want?: number): number {
  const taken = new Set(squad(club).filter((x) => x.id !== p.id && x.number).map((x) => x.number!));
  if (want && want >= 1 && want <= 99 && !taken.has(want)) return want;
  for (const n of PREFERRED[numberGroup(p)]) if (!taken.has(n)) return n;
  for (let n = 2; n <= 99; n++) if (!taken.has(n)) return n;
  return 99;
}
/** Giv alle i truppen et unikt nummer (dubletter: den bedste spiller beholder nummeret) */
export function ensureNumbers(club: number) {
  const sq = squad(club).slice().sort((a, b) => b.ca - a.ca);
  const used = new Set<number>();
  const later: Player[] = [];
  for (const p of sq) {
    if (p.number && p.number <= 99 && !used.has(p.number)) used.add(p.number);
    else { p.number = undefined; later.push(p); }
  }
  for (const p of later) { p.number = pickNumber(p, club); used.add(p.number); }
}

/** Slås fra, mens et nyt spil bygges (numrene uddeles samlet bagefter med ensureNumbers) */
let autoNumbers = true;
export function setAutoNumbers(on: boolean) { autoNumbers = on; }

/** tælles op, hver gang en rigtig (ikke genereret) spiller kommer til eller forsvinder via addPlayer/dropPlayer/removePlayer – cmVirtual.ts'
 *  skabelonliste genbruges, så længe tallet er uændret */
let realPlayersEpoch = 0;
export const playersEpoch = () => realPlayersEpoch;

export function addPlayer(p: Player) {
  if (!p.virtual) realPlayersEpoch++;
  gs().players[p.id] = p;
  if (p.club) {
    let arr = squadIndex.get(p.club);
    if (!arr) squadIndex.set(p.club, (arr = []));
    arr.push(p.id);
    // nye spillere i truppen (ungdomsindtag, regens) får et ledigt nummer
    if (autoNumbers && !p.number) p.number = pickNumber(p, p.club);
  }
}

/** originalens flytning mellem moderklub og B-hold (0x4cbd20 → 0x53c190/0x53bd10, cmBTeam.ts): truppen skifter, men kontrakten, moralen og
 *  tilladelsen er de samme – kun statistikken arkiveres (0x7c5fe0) og et ledigt trøjenummer gives */
export function moveSquadOnly(p: Player, club: number) {
  const arr = squadIndex.get(p.club);
  if (arr) squadIndex.set(p.club, arr.filter((id) => id !== p.id));
  p.cmStats = undefined;
  p.club = club;
  let to = squadIndex.get(club);
  if (!to) squadIndex.set(club, (to = []));
  to.push(p.id);
  p.number = pickNumber(p, club, p.number);
}

/** fjern en spiller helt uden klubskiftets følger (cmVirtual.ts' genererede spillere) */
export function dropPlayer(p: Player) {
  if (!p.virtual) realPlayersEpoch++;
  const arr = squadIndex.get(p.club);
  if (arr) squadIndex.set(p.club, arr.filter((id) => id !== p.id));
  delete gs().players[p.id];
}

export function removePlayer(p: Player) {
  if (!p.virtual) realPlayersEpoch++;
  setClub(p, 0);
  delete gs().players[p.id];
}

// ---------- nyheder ----------

/** Er en begivenhed i disse klubber relevant for den aktive manager (ud fra nyhedsindstillingen)? */
export function newsRelevant(...clubIds: (number | undefined)[]): boolean {
  const g = gs();
  const me = g.clubs[g.userClub];
  const scope = g.options?.newsScope ?? 'league';
  if (scope === 'world') return true;
  return clubIds.some((id) => {
    const c = id ? g.clubs[id] : undefined;
    if (!c) return false;
    if (id === g.userClub) return true;
    if (!me) return scope === 'nation';
    return scope === 'league' ? c.league === me.league : c.nation === me.nation;
  });
}

/** Ny besked til den aktive manager. all=true sender til alle menneskelige managere (multiplayer). */
/** nyhedens tidspunkt (AM/PM/EVE = 0/1/2) – sat af cmCalendar.ts (ingen cirkulær import) */
export const newsStamp: { tod?: (g: GameState) => 0 | 1 | 2 | null } = {};
export function addNews(n: Omit<NewsItem, 'id' | 'date' | 'read'> & { date?: string }, opts?: { all?: boolean }) {
  const g = gs();
  if (cmMediaOn(g) && offInOriginal(n.key, cmActive(g))) return; // nyheder uden modstykke i originalen (newsFilter.ts)
  const muted = !!g.options?.mutedNews?.includes(n.cat);
  // originalens kalender: nyhedens tidspunkt på dagen (News-listens "Fri 24th Aug EVE" – cmCalendar.ts registrerer cmTimeOfDay)
  const tod = n.date === undefined || n.date === g.date ? newsStamp.tod?.(g) ?? null : null;
  const item = { id: g.nextId.news++, date: n.date ?? g.date, read: muted, ...n, ...(muted ? { muted: true } : {}), ...(tod !== null ? { tod } : {}) };
  g.news.unshift(item);
  if (g.news.length > 700) g.news.length = 700;
  if (opts?.all && g.humans) {
    for (const h of g.humans) {
      if (h.pid === g.active) continue;
      h.news.unshift({ ...item });
      if (h.news.length > 400) h.news.length = 400;
    }
  }
}
