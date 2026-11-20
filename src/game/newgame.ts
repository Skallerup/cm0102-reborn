// Opret et nyt spil ud fra world.json
import { cmLeagueRules } from './cmCalendar';
import { cashRound } from './cmTransferBid';
import { CLUB_INFO_2026 } from './data/clubInfo2026';
import { capCA, cmFeet, fillMissing, freeAgentCA, initialisePA, makePool, makeRand, missingCA, repairPositions, shownFromStored } from './playerInit';
import { splitReserves } from './reserves';
import { hasReserveTeam, trimLinkedSquads } from './cmBTeam';
import { initialTransferList } from './transfers';
import { startScoreSeason } from './rating';
import { naturalRole } from './attributes';
import { cupFirstDate, europeanQualifiers, setupChampionsLeague, setupCmCharity, setupCmLeagueCup, setupCup, setupLeague, setupSuperCup, setupUefaCup } from './competitions';
import { addDays, ageOn } from './dates';
import {
  caFromValue, defaultTraining, makePlayer, makeStaff, randomDob, randomName, SUB_ROLE, valueFromCA, wageFor, type SubPos,
} from './data/generate';
import { formulaValueGbp, originalValueGbp, repTriple } from './originalValue';
import { rulesFor, LEAGUE_RULES } from './leagues';
import { legacyExtended, origLogic } from './rules';
import { Rng, hash, rng } from './rng';
import { setEconomy, setModern26 } from './econ';
import { calibrateWages } from './econ26';
import { addNews, addPlayer, ensureNumbers, gs, rebuildIndexes, setAutoNumbers, setGame, squad } from './state';
import { asOwner } from './humans';
import { initReleaseClauses } from './clauses';
import { refreshShortlists, windowLastDay, windowOpen } from './transfers';
import { autoSelect, neutralPlayerInstructions, newTactic, FORMATIONS } from './tactics';
import { cmLoadPreset } from './engine/grid/tacticTable';
import type { Club, GameState, Lang, Player, Role, Staff, StaffRole } from './types';
import { cmRandomDob, subPos, type CMWorld } from './data/cm0102';
import { setBoardExpectation } from './board';
import { appointBody, cmBoardHumanAppoint, cmBoardInit, cmBoardOn, cmInitStaffRep } from './cmBoardGame';
import { fairTicketPrice, transferBudgetFor } from './finance';
import { initKnowledge } from './scouting';
import { CHALLENGES } from './challenges';
import { monthlyDevelopment, recordDevelopment } from './training';
import { cmRand, fillReputation } from './cmPlayerData';
import { npFromWorld, npTemplate, staffConvert, staffInitRecord, type NpTemplate } from './cmStaffInit';
import { initialLanguages } from './cmLanguage';
import { cmActive, cmLogic, cmMediaOn } from './cmPlayerData';
import { cmAwNewGame } from './cmAwards';
import { cmResNewGame } from './cmReserves';
import { cmRsvNewGame } from './cmReserveMatches';
import { cmGbpMeasure } from './cmMoney';
import { cmStartDate } from './cmCalendar';
import { cmMainNation, cmSeasonOn } from './cmSeason';
import { cmEuroOn, cmEuroRestoreNext, cmSetupEurope } from './cmEurope';
import { compHooks } from './hooks';
import { cmFitNewGame, cmFitSetupDay, cmSetupLoans } from './cmFitnessGame';
import { nation01, nation01ByName } from './cmFitness';
import './cmIntl';                                              // landskampkalenderen i ægte tilstand (intlHooks, registerPrerun 'comps1')
import './cmNatTeams';                                          // landstrænerne i bestyrelsessystemet (intlHooks.ntStart/ntEnd/boardMatch …)
import './cmPrerunMatches';                                      // forkørslens konkurrencekampe (registerPrerun 'matches')
import './cmFriendly';                                              // forkørslens venskabskampe (registerPrerun 'comps1')
import { cmRelNewGame } from './cmRelations';
import { cmClubDataFill_829960, cmFinanceNewGame, cmFinanceWageBills, cmStartBalanceGbp } from './cmFinance';
import { cmContractsNewGame } from './cmContractInit';
import { cmContractEnd } from './cmContractEnd';
import { cmPermitNewGame } from './cmPermit';
import { cmSquadPlanStart } from './cmSquadPlanGame';
import { cmStaffWageNewGame, cmStaffWagePrepare, cmWageFillNewGame } from './cmWageGame';
import { cmShortlistStart } from './cmShortlistGame';
import { cmValuesApply } from './cmValueGame';
import { cmRefreshTransferBudgets } from './cmBudget';
import { cmRetireInit } from './cmRetire';
import { cmContractManagerDay } from './cmContractManager';
import { GRID_ENGINE_DEFAULT } from './engine/liveSim';

export interface WorldData {
  version: number;
  source: string;
  season: number;
  /** lang = nation.dat +0x77/+0x78/+0x79 (sproget og to andre sprog – den originale database, cmLanguage.ts) */
  nations: { name: string; code: string; lang?: number[]; /** nationalitetsordet fra nation.dat (+87) – kun den originale database */ adj?: string; /** (original DB) titelbjælkens farver [baggrund, tekst] fra nation.dat +0x94/+0xa0 */ col?: [string, string] }[];
  /** `hidden`: klubber uden for de spilbare ligaer (originalens ikke-spilbare lande) – ligaen spilles aldrig */
  leagues: { id: string; name: string; nation: number; tier: number; hidden?: boolean }[];
  clubs: [number, string, string, number, string, string, number, string][];
  playerFields: string[];
  players: (string | number)[][];
  names: Record<string, [string[], string[]]>;
  /** landsholdsdata fra originalen (build-national.py): pr. nation-indeks og tidligere slutrunder */
  nationalTeams?: { nations: Record<number, import('./international').NatInfo>; history: import('./international').PastFinal[] };
  /** databaseeditoren: saldo ved start og klubber med selvvalgt omdømme (intet loft for 2. række) */
  clubBalance?: Record<number, number>;
  clubRepEdited?: number[];
}

export interface NewGameOptions {
  managerName: string;
  managerNation: number;
  clubId: number;
  activeNations: number[];
  lang: Lang;
  masking: boolean;
  seed: number;
  challenge?: string;
  /** (docs/ALWAYS_ORIGINAL.md) nye spil er altid originale – 'extended' (den arvede udvidede tilstand) bruges kun af tests/scripts, der afprøver
   *  den gamle model, og udviklerserverens e2e-krog (Start.tsx). Standard: 'authentic' */
  mode?: 'authentic' | 'extended';
  /** Online: frist pr. træk i timer (0 = ingen) */
  deadlineHours?: number;
  /** Nyt-spil-forløbets midlertidige verden (Select Team viser klubbens ægte skærme): klubben "ejes" kun til visning – ingen ansættelse, ingen bestyrelse */
  preview?: boolean;
}

/** originalens systemer ved spilstarten – gemte spil uden (eller med en lavere) kan konverteres (cmConvert.ts) */
export const CM_SAVE_VER = 1;

/** Indtægtsniveau i den originale database (kalibreret med scripts/econ-run.ts: løn ≈ 60 % af omsætningen) */
export let ORIGINAL_INCOME = 0.55;
export const setOriginalIncome = (v: number) => { ORIGINAL_INCOME = v; };

/** pund → spillets interne euro (samme kurs som valutavisningen i i18n) */
const GBP = 0.86;

const PALETTE = ['#c8102e', '#003399', '#ffffff', '#111111', '#ffd200', '#00843d', '#6cabdd', '#7a263a', '#f68b1f', '#5c2d91', '#0057b8', '#e30613'];

export const START_DATE = (season: number) => `${season}-07-01`;

/** Hvilken CM-database et spil bruger ('original' = 3.9.60 fra 2001 – ældre gemte spil: 3.9.68, 'cm' = 2026/27); null = den moderne database */
export function cmDatabase(g: GameState): 'cm' | 'original' | null {
  if (g.dbKind !== 'cm0102') return null;
  const start = g.dbYear ?? g.seasonHistory?.[0]?.season ?? g.season;
  return start < 2020 ? 'original' : 'cm';
}

/** status under oprettelsen (trinets nøgle, 0..1) – Start.tsx viser den, når createGame kører i en Web Worker (ui/newGameWorker.ts) */
let progressCb: ((step: string, frac: number) => void) | null = null;
export function setNewGameProgress(cb: ((step: string, frac: number) => void) | null) { progressCb = cb; }
const progress = (step: string, frac: number) => progressCb?.(step, frac);

export function createGame(world: WorldData, o: NewGameOptions): GameState {
  progress('clubs', 0.02);
  const mode = o.mode ?? 'authentic';
  // (20/11, "Altid som originalen") 2026/27 i ægte tilstand: de europæiske landes klubber uden liga i world.json (world-cm.json euroClubs) som skjulte
  // klubber – originalen har dem i hukommelsen, og Europas pladser (cmEurope.ts) går til dem i stedet for de næste klubber fra de store lande
  const ex = mode === 'authentic' && (world as Partial<CMWorld>).kind === 'cm0102' ? (world as CMWorld).cmRaw?.euroClubs : undefined;
  if (ex?.clubs.length) {
    const cw = world as CMWorld;
    world = { ...cw, leagues: [...cw.leagues, ...ex.leagues], clubs: [...cw.clubs, ...ex.clubs], players: [...cw.players, ...ex.players],
      ratings: { ...cw.ratings, ...ex.ratings }, clubRep: { ...cw.clubRep, ...ex.clubRep } } as CMWorld as WorldData;
  }
  const season = world.season;
  // (runde 10A) den originale database i ægte tilstand: originalens spilstart 0x830520 − 4 uger for det først valgte land (England 14/7-2001;
  // cmCalendar.ts) – før 1/7 (Danmark, Polen, Kroatien og forårsligaerne) beholdes spillets 1/7, da sæsonskiftet ligger 1/7
  // (20/11, "Altid som originalen") også 2026/27 (en CM-database med world-cm.json): hovedlandets række efter navnet (nation01ByName)
  const cmCalStart = (world as Partial<CMWorld>).kind === 'cm0102' && mode === 'authentic' && (season < 2020 || !!(world as Partial<CMWorld>).cmRaw);
  const cmStart = cmCalStart ? cmStartDate(season < 2020 ? o.activeNations[0] : nation01ByName(world.nations[o.activeNations[0]]?.name), season) : null;
  const date = cmStart && cmStart > START_DATE(season) ? cmStart : START_DATE(season);
  const seed = o.seed >>> 0;
  rng.state = seed || 1;
  const names: Record<number, [string[], string[]]> = {};
  for (const [k, v] of Object.entries(world.names)) names[Number(k)] = v;

  const g: GameState = {
    version: 1,
    id: `save-${Date.now().toString(36)}`,
    seed,
    rng: rng.state,
    date,
    season,
    lang: o.lang,
    userClub: o.clubId,
    manager: { name: o.managerName, nation: o.managerNation, rep: 40, history: [], trophies: [], sacked: 0 },
    board: { confidence: 60, expectation: 'mid', expectedPos: 10, warnings: 0 },
    options: { masking: o.masking, autosave: true, matchSpeed: 650, fullCommentary: true, rules: mode === 'authentic' || world.source.startsWith('Championship Manager 01/02') ? 'classic' : 'modern', mode },
    activeNations: o.activeNations.slice(),
    nations: world.nations,
    leagueOrder: world.leagues.map((l) => l.id),
    leagues: Object.fromEntries(world.leagues.map((l) => [l.id, { name: l.name, nation: l.nation, tier: l.tier, ...(l.hidden ? { hidden: true } : {}) }])),
    players: {},
    clubs: {},
    staff: {},
    comps: {},
    fixtures: {},
    news: [],
    knowledge: {},
    shortlist: [],
    offers: [],
    tactic: null,
    savedTactics: [],
    reports: {},
    seasonHistory: [],
    challenge: null,
    names,
    nextId: { player: 10_000_000, staff: 1, news: 1, fixture: 1, offer: 1, tie: 1 },
    pendingFixture: null,
    dayDone: false,
    vacancies: [],
    jobOffers: [],
  };
  const cm = (world as Partial<CMWorld>).kind === 'cm0102' ? (world as CMWorld) : null;
  if (cm) { g.dbKind = 'cm0102'; g.dbYear = season; if (season < 2020) g.dbVersion = world.source.match(/3\.9\.6\d/)?.[0] ?? '3.9.60'; g.customRules = cmLeagueRules(cm.rules as GameState['customRules']); if (cm.officials?.length) g.officials = cm.officials; }
  if (world.nationalTeams) g.intl = { results: [], history: [], info: world.nationalTeams.nations, past: world.nationalTeams.history };
  // den originale 01/02-database spilles i 2001-priser (econ.ts); ligaernes niveau måles, når trupperne er klar
  if (cm && season < 2020) g.econ = { k: 0.5, leagues: {} };
  // originalens rå omdømme (club +0x80, nation +0x8e) – computerens holdudtagelse i gittermotoren (cmPlayerData.ts)
  // (17/11, MODERN_PARITY) 2026/27 i ægte tilstand (cmLogic): kampmotorens inddata fra databasen (world-cm.json) – omdømmerne, turneringernes
  // omdømme, tilskuerposterne og byerne; resten (økonomi, trupplan, sprog …) hører til 2001-verdenens moduler (cmActive)
  const cmRawLogic = !!cm?.cmRaw && season >= 2020 && mode === 'authentic';
  if (cmRawLogic) {
    const raw = cm!.cmRaw!;
    g.cmClubRep = { ...raw.clubRep }; g.cmNationRep = raw.nationRep.slice();
    if (raw.compRep) g.cmCompRep = { ...raw.compRep };
    if (raw.crowd) g.cmCrowd = Object.fromEntries(Object.entries(raw.crowd).map(([k, v]) => [k, v.slice()])) as GameState['cmCrowd'];
    if (raw.stadNear) g.cmStadNear = { ...raw.stadNear };
    if (raw.cities) g.cmCities = raw.cities.slice();
    if (raw.nation7e) g.cmNation7e = raw.nation7e.slice();
    // (MODERN_PARITY 1+4) kontrakt-/lønlaget og spillerens vilje 0x846920 (cmWageGame/cmSlMem/cmContractGame): klubstatus +0x64, divisionen og
    // PLC (club.dat), nation +0x85/+0x76
    if (raw.clubStat) g.cmClubStat = { ...raw.clubStat };
    if (raw.fin) g.cmFinRaw = Object.fromEntries(Object.entries(raw.fin).map(([k, v]) => [k, v.slice()]));
    if (raw.nation85) g.cmNation85 = raw.nation85.slice();
    if (raw.nation76) g.cmNation76 = raw.nation76.slice();
    // (MODERN_PARITY 9) nation +0x7f (EU/EØS) – spejdernes dækning 0x7b7490 (cmScout.ts)
    if (raw.nation7f) g.cmNation7f = raw.nation7f.slice();
    g.cmLowerDiv = raw.lowerDiv ?? -1;
    // (MODERN_PARITY 7) bestyrelse/managerjob – viljen 0x844780: nation +0x71 (verdensdelen), "Europe"s id og byernes +0x33
    if (raw.nationCont) { g.cmNationCont = raw.nationCont.slice(); g.cmEurope = raw.europe ?? -1; }
    if (raw.city33) g.cmCity33 = raw.city33.slice();
    // (MODERN_PARITY 12) originalens vejr (cmWeather.ts): opdateringens weather.cfg og byerne – forkørslen 0x5cc850 kører 0x922ee0 fra 1/1
    if (raw.wx) g.cmWxTab = { r: raw.wx.r, c: { ...raw.wx.c } };
    // (MODERN_PARITY 12) originalens priser (cmAwards.ts) og databasens tidligere vindere
    cmAwNewGame(g, raw.awHist);
    // (MODERN_PARITY 12) baggrundskampene 0x84b940/0x84be20 (cmReserves.ts) og B-holdene/reserveholdet 0x540a50/0x542740/0x541e60 (cmBTeam.ts)
    cmResNewGame(g);
    g.cmBTeams = true;
    // (MODERN_PARITY 12) venskabskampene (cmFriendly.ts): opdateringens nation.dat-felter
    // (MODERN_PARITY 12) sprogene (nation +0x77/+0x78/+0x79 – cmLanguage.ts: PlayerStats 0x7bfd50, kontraktens +0x4f, indlæringen 0x5d2fb3)
    if (raw.nationLang) g.nations = g.nations.map((n, i) => ({ ...n, lang: raw.nationLang![i]?.slice() ?? [0, 0, 0] }));
    if (raw.nationFr) g.cmNationFr = Object.fromEntries(Object.entries(raw.nationFr).map(([k, v]) => [k, v.slice()]));
    // (20/11, "Altid som originalen") originalens kalender – ligaernes skemaer, pokalerne, sæsonskiftet pr. land og Europas turneringer (cmCalendarOn,
    // cmEurope.ts) – med databasens koefficienter, euro.cfg og sidste sæsons vindere (world-cm.json `euro`)
    g.cmCal = 1;
    // (20/11, MODERN_PARITY §0 C+D) originalens kampregler – 3 udskiftninger/5 på bænken (rules.ts) og zonemotorens kampkonstanter (sim.ts ORIGINAL)
    g.cmMatch = 1;
    // (20/11, MODERN_PARITY §0 B) originalens CONTRACT_MANAGER – startkontrakterne 0x4c7560 (cmContractEnd) og computerklubbernes daglige
    // forlængelser, udløb og frigivelser 0x4c7ac0 (cmContractManager.ts cmCmOn)
    g.cmCmMgr = 1;
    if (raw.euro) g.cmEuroDb = JSON.parse(JSON.stringify(raw.euro)) as GameState['cmEuroDb'];
  }
  if (cm?.cmRaw && season < 2020) {
    g.cmClubRep = { ...cm.cmRaw.clubRep }; g.cmNationRep = cm.cmRaw.nationRep.slice();
    // club.dat +100/+119 og club_comp.dat +105 – computerens trupplan 0x83cb40/0x7bca90 (cmSquadPlanGame.ts)
    if (cm.cmRaw.clubStat) g.cmClubStat = { ...cm.cmRaw.clubStat };
    if (cm.cmRaw.compRep) g.cmCompRep = { ...cm.cmRaw.compRep };
    // (runde 9) tilskuertallet sub_85cba0 (engine/grid/crowd.ts)
    if (cm.cmRaw.crowd) g.cmCrowd = Object.fromEntries(Object.entries(cm.cmRaw.crowd).map(([k, v]) => [k, v.slice()])) as GameState['cmCrowd'];
    if (cm.cmRaw.stadNear) g.cmStadNear = { ...cm.cmRaw.stadNear };
    if (cm.cmRaw.seats) g.cmStadium = Object.fromEntries(Object.entries(cm.cmRaw.seats).map(([k, v]) => [k, v.slice()])) as GameState['cmStadium'];
    if (cm.cmRaw.cities) g.cmCities = cm.cmRaw.cities.slice();
    if (cm.cmRaw.nation7e) g.cmNation7e = cm.cmRaw.nation7e.slice();
    if (cm.cmRaw.nation85) g.cmNation85 = cm.cmRaw.nation85.slice();
    if (cm.cmRaw.nation76) g.cmNation76 = cm.cmRaw.nation76.slice();
    if (cm.cmRaw.nationCont) { g.cmNationCont = cm.cmRaw.nationCont.slice(); g.cmEurope = cm.cmRaw.europe ?? -1; }
    if (cm.cmRaw.city33) g.cmCity33 = cm.cmRaw.city33.slice();
  }
  setGame(g);

  const leagueById = new Map(world.leagues.map((l) => [l.id, l]));

  // (den originale database) de skjulte ligaers klubber kun med mindst én spiller i hukommelsen for de valgte lande (CMRatings.tc – fx Englands
  // non-league, når England er valgt); de øvrige spilbare landes inaktive divisioner kommer ikke med
  const tcOk = (id: number) => { const tc = cm?.ratings[id]?.tc; return tc === undefined || tc === 1 || (Array.isArray(tc) && tc.some((n) => o.activeNations.includes(n))); };
  const hiddenWithPlayers = new Set<number>();
  if (cm) { const Fp = Object.fromEntries(world.playerFields.map((f, i) => [f, i])); for (const r of world.players) if (r[Fp.club] && tcOk(r[Fp.id] as number)) hiddenWithPlayers.add(r[Fp.club] as number); }
  // Klubber
  for (const [id, name, short, nation, league, stadium, seats] of world.clubs) {
    if (cm && leagueById.get(league)?.hidden && !hiddenWithPlayers.has(id)) continue;
    const h = hash(id);
    g.clubs[id] = {
      id, name, short, nation, league, stadium: stadium || `${short} Stadium`, seats: seats || 5000,
      rep: 30, balance: 0, transferBudget: 0, wageBudget: 0, youth: 10, facilities: 10,
      colors: [PALETTE[h % PALETTE.length], PALETTE[(h >>> 8) % PALETTE.length]],
      manager: 0, tactic: null,
      finance: emptyFinance(),
      history: [],
      ticketPrice: 25,
    };
    if (g.clubs[id].colors[0] === g.clubs[id].colors[1]) g.clubs[id].colors[1] = g.clubs[id].colors[0] === '#ffffff' ? '#111111' : '#ffffff';
  }

  progress('players', 0.08);
  // Spillere (trøjenumrene uddeles samlet, når trupperne er fyldt op)
  setAutoNumbers(false);
  const F = Object.fromEntries(world.playerFields.map((f, i) => [f, i]));
  // originalens ugentlige lønninger (£, staff.dat 78) – kun den originale database bruger dem (2001-økonomien)
  const dbWage = new Map<number, number>(), dbWageGbp = new Map<number, number>();
  // (2026/27 i ægte tilstand: kun som originalens staff +0x4e og til pengefaktoren cmGbp – spillets lønninger forbliver de moderne)
  if ((g.econ || cmRawLogic) && F.wage !== undefined) for (const r of world.players) if ((r[F.wage] as number) > 0) { if (g.econ) dbWage.set(r[F.id] as number, Math.round((r[F.wage] as number) / GBP)); dbWageGbp.set(r[F.id] as number, r[F.wage] as number); }
  const cmStartGame = !!cm && season < 2020 && mode === 'authentic';
  const initRng = new Rng(1);
  let initPool: ReturnType<typeof makePool> | undefined;
  // (den originale database i ægte tilstand) 0x524d70's reserveposter 0x52638a: trunc(1 % (Maximum; størrelse 2: 2 %) af de beholdte personer) klubløse, født 1982, med
  // nationaliteten fra en tilfældig beholdt person, CA 0, alle egenskaber 0 og PA −2 (1/100), −1 (1/50) eller 0 – sub_535a80 udfylder dem som de
  // andre (databasestørrelsen fra world-filen – Maximum; CMTrim). Navnene er spillets egne pr. land (originalen: 0x539c60's lister – *estimeret*)
  const extraRt: Record<number, CMWorld['ratings'][number]> = {};
  const rows = cmStartGame && cm?.cmTrim ? [...world.players, ...reserveRows(cm, o.activeNations, names, seed, F, world.playerFields.length, extraRt)] : world.players;
  const rtOf = (id: number) => cm?.ratings[id] ?? extraRt[id];
  if (cmStartGame && cm?.cmTrim?.pct === 0.01) g.cmMaxMem = true;
  if (cmStartGame && !o.preview) g.cmSaveVer = CM_SAVE_VER;
  for (const r of rows) {
    const club = r[F.club] as number;
    if (club && !g.clubs[club]) continue;
    // de klubløse (CMRatings.tf): i ægte tilstand dem, originalens 0x524d70 beholder for de valgte lande; ellers som før kun CA 120+
    // de skjulte ligaers spillere uden for talentudvalget (CMRatings.tc – fx Englands non-league): kun når 0x524d70 beholder dem for de valgte lande
    if (club && !tcOk(r[F.id] as number)) continue;
    const tf = club ? undefined : rtOf(r[F.id] as number)?.tf;
    if (tf !== undefined) {
      if (cmStartGame ? tf === 0 || (Array.isArray(tf) && !tf.some((n) => o.activeNations.includes(n))) : rtOf(r[F.id] as number)!.ca < 120) continue;
    }
    // (den originale database) kun fødselsåret i databasen: dag og måned trækkes ved hvert nyt spil som originalens indlæsning
    // (sub_535a80 0x536859, cmRandomDob – egen talrække, så spillets øvrige tal ikke flytter sig)
    const rd = cm && season < 2020 ? rtOf(r[F.id] as number)?.rd : undefined;
    const dob = rd ? cmRandomDob(Number((r[F.dob] as string).slice(0, 4)), cmRand(seed, r[F.id] as number, 536)) : r[F.dob] as string;
    const age = ageOn(dob, date);
    const value = r[F.value] as number;
    const league = club ? g.clubs[club].league : '';
    const wealth = league ? rulesFor(league, 20).wealth : 0.5;
    const p = makePlayer({
      id: r[F.id] as number, first: r[F.first] as string, last: r[F.last] as string, dob, nation: r[F.nation] as number,
      club, sub: r[F.pos] as SubPos, foot: r[F.foot] as Player['foot'], height: r[F.height] as number,
      ca: rtOf(r[F.id] as number)?.ca ?? caFromValue(value, age), value, caps: r[F.caps] as number, intGoals: r[F.intGoals] as number,
      stats: { apps: r[F.apps] as number, minutes: r[F.minutes] as number, goals: r[F.goals] as number, assists: r[F.assists] as number, yellows: r[F.yellows] as number, reds: r[F.reds] as number },
      // originalens startkontrakt 0x4c7560: databasens dato som den er (trukket, hvis den mangler; +52 uger, hvis for tidlig) – cmContractEnd.ts
      contractEnd: club && cm && (cmStartGame || g.cmCmMgr === 1) ? cmContractEnd((r[F.contract] as string) || '', date, g.nations[g.leagues[g.clubs[club].league]?.nation]?.name, seed, r[F.id] as number)
        : (r[F.contract] as string) || undefined, date, seed, wealth,
    });
    // CM 01/02: originalens evner, potentiale og positioner
    const rt = rtOf(p.id);
    if (rt) {
      // originalens "Player Initialisation" (playerInit.ts, sub_535a80): PA-reglerne (−2/−1, manglende PA og de tilfældige
      // omslag i hvert nyt spil), CA over PA, og manglende egenskaber kopieret fra en lignende skabelonspiller
      const rand = makeRand(() => initRng.next());
      initRng.state = hash(seed, p.id, 91) || 1;
      const clubLevel = club ? rand(4) + 1 : rand(2) + 1;
      const pa = initialisePA(rt.paRaw ?? rt.pa, rt.ca, age, clubLevel, rand);
      // ægte tilstand: CA mangler (0x536c72 – reserveposterne) og klubløses CA (0x536e19) før CA over PA
      let ca0 = rt.ca;
      if (cmStartGame && ca0 < 1) ca0 = missingCA(pa, age, clubLevel, rand);
      if (cmStartGame && !club) ca0 = freeAgentCA(ca0, p.caps, age, rand);
      const ca = capCA(ca0, pa, rand);
      const stored = cm!.attrScale === 'stored';
      // positioner (sub_535a80 0x536f01): reparation, tabellen rand(182) og siderne – [GK SW D DM M AM F WB R L C]
      const pos11 = [...rt.pos, rt.side[2], rt.side[0], rt.side[1]];
      if (stored) repairPositions(pos11, rand);
      const rec = { ca, pos: pos11.slice(0, 8), side: [pos11[9], pos11[10], pos11[8]], attrs: rt.attrs.slice(), stored };
      fillMissing(rec, age, initPool ??= makePool(Object.values(cm!.ratings).filter((x) => x.tf === undefined || x.tf === 0 || x.ca >= 120).map((x) => ({ ...x, stored }))), rand);
      if (rt.rep) p.cmRep = rt.rep;
      // sub_535a80 0x536270–0x536ec6: manglende omdømme udfyldes (egen talrække – spillets rng røres ikke) og Free Role (+0x1a)
      if (cm!.cmRaw && (season < 2020 || cmRawLogic)) {
        const cr = club ? cm!.cmRaw.clubRep[club] : undefined;
        p.cmRepMem = fillReputation({ rep: rt.rep ?? [0, 0, 0], ca: rt.ca, pa: rt.paRaw ?? rt.pa, club: club ? { rep: cr ?? 0, sameNation: g.clubs[club]?.nation === p.nation } : null,
          nationRep: cm!.cmRaw.nationRep[p.nation] ?? 0, caps: p.caps }, cmRand(seed, p.id, 535));
        if (rt.fr) p.cmFree = rt.fr;
        // staff +0x1e (anden nationalitet) og +0x3e (kom til klubben) – arbejdstilladelsens historik (cmPermit.ts)
        if (rt.n2 !== undefined) p.cmNation2 = rt.n2;
        if (cmStartGame && (rt.tm === 1 || rt.tf === 1)) p.cmMem = 1;
        // oraklet (K8): ankomstdatoen står som databasens, dog højst 5 uger før spilstarten (9/6-2001 for 14/7: databasens senere datoer, fx 27/7,
        // klippes); klubløse får databasens indlæsningsdato (1/1) – før stod de fremtidige datoer og 1996-01-02 uændret
        // (2026/27) databasens ankomstdato står med 2001-uret – skubbes som fødsels- og kontraktdatoerne (build-cm-data.mts SHIFT)
        if (rt.j) p.cmJoined = cmStartGame ? (club ? (rt.j > addDays(date, -35) ? addDays(date, -35) : rt.j) : `${date.slice(0, 4)}-01-01`)
          : season >= 2020 ? `${Number(rt.j.slice(0, 4)) + season - 2001}${rt.j.slice(4)}` : rt.j;
      }
      let attrs = rec.attrs;
      if (stored) {
        // fødderne efter positionsreparationen (sub_535a80 0x5374f4–0x537636); bruges i afbalanceringen
        const feet = cmFeet(rt.feet ? [rt.feet[0], rt.feet[1]] : [0, 0], pos11[9], pos11[8], rand);
        // de viste værdier ved spilstart: intern → sub_538ec0 → sub_538bc0 → sub_544380 (playerInit.ts)
        const internals: number[] = [];
        attrs = shownFromStored(attrs, ca, pos11[0], feet, internals);
        // originalens interne værdier i spillerposten (Player.cmInt) – samme betingelse som cmRepMem
        if (cm!.cmRaw && (season < 2020 || cmRawLogic)) p.cmInt = internals;
        p.foot = feet[0] >= 15 && feet[1] >= 15 ? 'B' : feet[0] > feet[1] ? 'L' : 'R';
        p.feet = feet;
      }
      // de få, originalen heller ikke udfylder her (adaptability, ambition, loyalitet …), beholder den genererede værdi
      p.ca = ca; p.pa = pa; p.attrs = attrs.map((v, i) => (v > 0 ? v : p.attrs[i])); p.pos = rec.pos.slice(); p.side = rec.side.slice();
      if (extraRt[p.id]) p.training = defaultTraining(SUB_ROLE[subPos(p.pos, p.side) as SubPos]);
    }
    // den originale database: originalens egen værdiformel (evne, alder, klubbens omdømme, løn og liga – originalValue.ts)
    if (!value) {
      const lg = club ? g.leagues[g.clubs[club].league] : undefined;
      const vc = g.econ && cm ? cm.valueClub?.[club] : undefined;
      // originalens sub_4d0c60, når databasen har klubbens felter (bygget efter 9/11-2026); ellers den tilpassede kurve
      p.value = vc && rt?.rep
        ? cashRound(formulaValueGbp({ pa: p.pa, age, pos: p.pos, attrs: p.attrs, rep: rt.rep, caps: p.caps, staffId: p.id, clubId: club, vc }) / GBP)
        : g.econ && cm
        ? cashRound(originalValueGbp(p.ca, age, cm.clubRep[club] ?? 30, (r[F.wage] as number) || 0, lg ? g.nations[lg.nation]?.name : undefined, lg?.tier ?? 9, rt?.rep ?? repTriple(p.rep)) / GBP)
        : valueFromCA(p.ca, p.pa, age);
    }
    // CM 01/02: trøjenummeret fra databasen (dubletter og manglende numre ordnes efter, at trupperne er fyldt op)
    if (F.number !== undefined && (r[F.number] as number) > 0) p.number = r[F.number] as number;
    // originalens sprogtabel ved spilstarten (PlayerStats 0x7bfd50 – cmLanguage.ts): kontraktens +0x4f lave nibble regnes af den
    if (rt && cm!.cmRaw && (season < 2020 || cmRawLogic)) { const lang = initialLanguages(g, p, rt.lg); if (lang) p.cmLang = lang; }
    addPlayer(p);
  }

  progress('squads', 0.3);
  // Fyld trupper op
  const leagueLevel = new Map<string, number>();
  for (const l of world.leagues) {
    const cas: number[] = [];
    for (const c of Object.values(g.clubs)) {
      if (c.league !== l.id) continue;
      const sq = squad(c.id);
      if (sq.length >= 12) cas.push(median(sq.map((p) => p.ca)));
    }
    leagueLevel.set(l.id, cas.length ? median(cas) : l.tier === 2 ? 85 : 95);
  }
  for (const c of Object.values(g.clubs)) {
    // skjulte klubber (spiller ingen kampe) beholder databasens trup
    if (g.leagues[c.league]?.hidden) continue;
    const sq = squad(c.id);
    // ægte CM 01/02 med den originale database: truppen er databasens (Man Utd 48 på listen club+0xd7, ikke 50 – 0x8cd450 tæller dem mod
    // grænsen på 50, så opdigtede positionsfyld gav "not enough space" ved hvert køb); kun tynde trupper fyldes op
    if (cmStartGame && sq.length >= 22) continue;
    const lvl = sq.length >= 12 ? median(sq.map((p) => p.ca)) : (leagueLevel.get(c.league) ?? 90) - 4;
    fillSquad(c, sq, lvl, date, seed);
  }
  // ægte CM 01/02 (create_game 0x541e60): moderklub + B-hold højst 48 spillere tilsammen (cmBTeam.ts)
  if (cmStartGame || cmRawLogic) trimLinkedSquads(g);
  // trøjenumre: alle i hver trup får et unikt nummer
  for (const c of Object.values(g.clubs)) ensureNumbers(c.id);
  // førstehold og reservehold (CM 01/02): de 25 bedste på førsteholdet, resten i reserverne – ægte CM 01/02: kun klubber med reservehold
  // (0x542740: ikke klubber med B-hold eller i Spanien/Tyskland/Portugal)
  for (const c of Object.values(g.clubs)) if (!g.leagues[c.league]?.hidden && hasReserveTeam(g, c.id)) splitReserves(c.id);
  setAutoNumbers(true);

  // 2001-priser: pengeniveauet pr. liga = forholdet mellem klubbernes trupværdier (top 20) i 2001-priser og i
  // nutidens priser – så TV-penge, sponsorer, præmier og billetpriser passer til spillerværdierne i hver liga
  if (g.econ) {
    const top = (vals: number[]) => vals.sort((a, b) => b - a).slice(0, 20).reduce((x, v) => x + v, 0);
    const per: Record<string, number[]> = {};
    for (const c of Object.values(g.clubs)) {
      const sq = squad(c.id);
      if (sq.length < 11) continue;
      const wealth = rulesFor(c.league, 20).wealth;
      // med originalens lønninger: forholdet mellem klubbens rigtige lønsum i 2001 og den lønsum, nutidens
      // formel ville give – så indtægterne passer til de lønninger, originalen faktisk betaler
      const paid = sq.filter((p) => dbWage.has(p.id));
      if (paid.length >= 11) {
        const real = paid.reduce((x, p) => x + dbWage.get(p.id)!, 0);
        setEconomy(null);
        const now = paid.reduce((x, p) => x + wageFor(valueFromCA(p.ca, p.pa, ageOn(p.dob, date)), wealth), 0);
        setEconomy(g.econ);
        (per[c.league] ??= []).push(real / Math.max(1, now));
        continue;
      }
      const old = top(sq.map((p) => p.value));
      setEconomy(null);
      const now = top(sq.map((p) => valueFromCA(p.ca, p.pa, ageOn(p.dob, date))));
      setEconomy(g.econ);
      (per[c.league] ??= []).push(old / Math.max(1, now));
    }
    const med = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    for (const [l, xs] of Object.entries(per)) g.econ.leagues[l] = Math.round(med(xs) * 1000) / 1000;
    const tops = world.leagues.filter((l) => l.tier === 1 && g.econ!.leagues[l.id]).map((l) => g.econ!.leagues[l.id]);
    if (tops.length) g.econ.k = Math.round(med(tops) * 1000) / 1000;
    // indtægterne i forhold til lønningerne (originalens lønninger er sat ud fra databasen, se econ.ts)
    g.econ.income = ORIGINAL_INCOME;
    // nye kontrakter: lønformlen kalibreret til originalens egne lønninger (median af rigtig løn / formel)
    if (dbWage.size) {
      setEconomy(g.econ);
      // log(løn) = a[liga] + b·log(værdi): fælles hældning b (inden for ligaerne), niveau a pr. liga
      // [log værdi, klubomdømme, log løn] pr. liga; hældningerne b og c findes inden for ligaerne (mindste kvadrater)
      const pts: Record<string, [number, number, number][]> = {};
      for (const c of Object.values(g.clubs)) for (const p of squad(c.id)) {
        if (dbWage.has(p.id) && p.ca >= 80 && p.value > 0) (pts[c.league] ??= []).push([Math.log(Math.max(20_000, p.value)), cm?.clubRep[c.id] ?? c.rep, Math.log(dbWage.get(p.id)!)]);
      }
      let s11 = 0, s12 = 0, s22 = 0, s1y = 0, s2y = 0;
      const ok = Object.keys(pts).filter((l) => pts[l].length >= 15);
      for (const l of ok) {
        const xs = pts[l], n = xs.length;
        const m = [0, 1, 2].map((k) => xs.reduce((a, v) => a + v[k], 0) / n);
        for (const v of xs) {
          const x1 = v[0] - m[0], x2 = v[1] - m[1], y = v[2] - m[2];
          s11 += x1 * x1; s12 += x1 * x2; s22 += x2 * x2; s1y += x1 * y; s2y += x2 * y;
        }
      }
      const det = s11 * s22 - s12 * s12;
      if (ok.length && det > 0) {
        const b = Math.round(((s1y * s22 - s2y * s12) / det) * 1000) / 1000;
        const cr = Math.round(((s2y * s11 - s1y * s12) / det) * 10000) / 10000;
        const a: Record<string, number> = {}, rep: Record<string, number> = {};
        // niveauet rammer ligaens samlede lønsum (ikke snittet af logaritmerne, der ville ramme stjernerne for lavt)
        for (const l of ok) {
          const xs = pts[l];
          a[l] = Math.round(Math.log(xs.reduce((s2, v) => s2 + Math.exp(v[2]), 0) / xs.reduce((s2, v) => s2 + Math.exp(b * v[0] + cr * v[1]), 0)) * 1000) / 1000;
          rep[l] = Math.round(xs.reduce((s2, v) => s2 + v[1], 0) / xs.length);
        }
        const firsts = world.leagues.filter((l) => l.tier === 1 && a[l.id] !== undefined).map((l) => a[l.id]);
        g.econ.wageFit = { b, c: cr, a, rep, a0: firsts.length ? med(firsts) : med(Object.values(a)) };
      }
    }
    setEconomy(g.econ);
  }

  progress('economy', 0.4);
  // den kalibrerede moderne økonomi (econ26.ts): ligaernes lønkurve måles mod virkelighedens løn/omsætning, før lønningerne sættes
  if (!g.econ) {
    for (const c of Object.values(g.clubs)) {
      const sv = squad(c.id).map((p) => p.value).sort((a, b) => b - a).slice(0, 20).reduce((s, v) => s + v, 0);
      c.rep = cm?.clubRep[c.id] ?? Math.round(Math.max(5, Math.min(98, (Math.log10(Math.max(sv, 1e6)) - 6) * 30)));
      if (leagueById.get(c.league)?.tier === 2 && !world.clubRepEdited?.includes(c.id)) c.rep = Math.min(c.rep, 62);
      if (!c.seats || c.seats < 1000) c.seats = Math.round(2000 + c.rep * c.rep * 6);
    }
    g.m26 = calibrateWages(g, (cid) => squad(cid).map((p) => p.value));
    setModern26(g.m26);
  }
  // Reputation og økonomi
  for (const c of Object.values(g.clubs)) {
    const sq = squad(c.id);
    const values = sq.map((p) => p.value).sort((a, b) => b - a).slice(0, 20);
    const sv = values.reduce((s, v) => s + v, 0);
    c.rep = cm?.clubRep[c.id] ?? Math.round(Math.max(5, Math.min(98, (Math.log10(Math.max(sv, 1e6)) - 6) * 30)));
    const lg = leagueById.get(c.league);
    if (lg?.tier === 2 && !world.clubRepEdited?.includes(c.id)) c.rep = Math.min(c.rep, 62);
    if (cm?.clubColors[c.id]) c.colors = cm.clubColors[c.id];
    const wealth = rulesFor(c.league, 20).wealth;
    for (const p of sq) if (p.contract) p.contract.wage = dbWage.get(p.id) ?? wageFor(p.value, wealth, c.league, c.rep);
    const wages = sq.reduce((s, p) => s + (p.contract?.wage ?? 0), 0);
    c.wageBudget = Math.round((wages * 1.08) / 1000) * 1000;
    // moderne økonomi: kassen ≈ 10 % af trupværdien + 14 ugers løn (Premier League-medianen ca. €70 mio. – Deloitte: likvide midler ca. 20 % af omsætningen)
    c.balance = g.m26 ? Math.round((sv * 0.1 + wages * 14) / 100_000) * 100_000 : Math.round((sv * 0.12 + wages * 30) / 100_000) * 100_000;
    // databaseeditoren kan sætte klubbens saldo ved start
    const bal = world.clubBalance?.[c.id];
    if (bal !== undefined) c.balance = bal;
    c.transferBudget = transferBudgetFor(sv, wealth, c.balance);
    c.youth = clampInt(4 + c.rep / 7 + (hash(c.id, 3) % 5) - 2, 1, 20);
    c.facilities = clampInt(3 + c.rep / 6 + (hash(c.id, 4) % 5) - 2, 1, 20);
    // originalens saldo og træningsanlæg (club.dat 101/127)
    const fin = cm?.clubFinance?.[c.id];
    if (g.econ && cm?.valueClub?.[c.id]) c.vc = cm.valueClub[c.id];
    if (fin && g.econ) {
      // målt i ejerens CM 01/02 (3.9.60, 13 engelske klubber 14/7-01): saldoen er databasens beløb ±8 % (spredningen
      // *estimeret*); klubber uden beløb (0) får ca. 35 ugers lønsum (Bury: £829K ved £23,5K/uge)
      const cash = fin[0] !== 0 ? fin[0] : 35 * wages * GBP;
      const noise = 0.92 + (hash(seed, c.id, 31) % 1601) / 10_000;
      if (world.clubBalance?.[c.id] === undefined) c.balance = Math.round((cash * noise) / GBP);
      if (fin[2] > 0) c.facilities = clampInt(fin[2], 1, 20);
      // (foreløbigt – cmRefreshTransferBudgets sætter originalens 0x598800, når økonomien er bygget)
      c.transferBudget = originalTransferFunds(c.balance);
    }
    // (MODERN_PARITY 4) 2026/27 i ægte tilstand: træningsanlægget +0x7f fra club.dat (world-cm.json cmRaw.clubFin) som for den originale database –
    // originalens økonomi (træningsanlæggets månedlige udgift 0x59c438, transferbudgettet 0x598800) og træningen læser det
    const fin26 = cmRawLogic && !g.draft ? cm?.cmRaw?.clubFin?.[c.id] : undefined;
    if (fin26 && fin26[2] > 0) c.facilities = clampInt(fin26[2], 1, 20);
    c.ticketPrice = fairTicketPrice(c.rep, c.league);
    if (!c.seats || c.seats < 1000) c.seats = Math.round(2000 + c.rep * c.rep * 6);
  }

  // (MODERN_PARITY pengeprincip B) 2026/27 i ægte tilstand: € → originalens £ pr. liga = databasens løn / spillets løn (cmMoney.ts)
  if (cmRawLogic) g.cmGbp = cmGbpMeasure(g, dbWageGbp);
  progress('staff', 0.45);
  // Staff – med den originale/CM-database: de rigtige trænere, spejdere og fysioterapeuter fra databasen (CMWorld.staff)
  const dbStaff = new Map<number, NonNullable<CMWorld['staff']>>();
  for (const row of cm?.staff ?? []) dbStaff.set(row[0], [...(dbStaff.get(row[0]) ?? []), row]);
  // originalens spilstart for ikke-spillerposten (cmStaffInit.ts): skabelonpuljen = world-filens stab med hele posten (staff[11])
  npInit = cm?.cmRaw && season < 2020 && cm.staff?.some((r) => r[11])
    ? { pool: cm.staff.filter((r) => r[11]).map((r) => npTemplate(npFromWorld(r[7], r[11]!, r[10]?.[7] ?? 0))), nations: world.nations.map((n) => n.name), seed,
      sel: cm.staffX ? new Set(o.activeNations) : null }
    : null;
  // (MODERN_PARITY 5+6) 2026/27 i ægte tilstand: samme spilstart for ikke-spillerposten (CA/PA, de manglende egenskaber, de interne) af world-cm.json's
  // staffNp – træningens trænerbytes 0x8b2880, udviklingens trænere og fysioterapeuterne i injury.cpp læser Staff.cmNp; resten af 2001-stabens
  // spilstart (løn, person-id, omdømme, hukommelse) hører til 2001-verdenen (npInit)
  const sNp = cmRawLogic ? cm!.cmRaw!.staffNp : undefined;
  npLogic = sNp && cm!.staff?.some((r) => sNp[r[9]])
    ? { pool: cm!.staff!.filter((r) => sNp[r[9]]).map((r) => npTemplate(npFromWorld(r[7], sNp[r[9]], r[10]?.[7] ?? 0))), nations: world.nations.map((n) => n.name), seed, np: sNp,
      bx: cm!.cmRaw!.staffBx, natOff: cm!.cmRaw!.natOff }
    : null;
  // (MODERN_PARITY 13) stabens modul på 2026/27: hukommelsen 0x524d70 (world-cm.json staffMem – Staff Search 0x7afa70), person-id'erne, databasens
  // løn (startkontrakterne 0x4c7560/0x83a1b0) og stabsskifterne (cmStaffOn); kræver bestyrelsens poster (staffBx – omdømmerne, viljen 0x844780)
  const staffLogic = !!npLogic?.bx && !!cm!.cmRaw!.staffMem;
  memSel = npInit?.sel ?? (staffLogic ? new Set(o.activeNations) : null);
  memFlags = staffLogic ? cm!.cmRaw!.staffMem! : null;
  if (npLogic && staffLogic) npLogic.staff = true;
  natDb = {};
  staffDbWage.clear();
  // 0x527240 tæller klubbens pladser (+0x19f/+0x1b3/+0x1cf) med databasens folk – også dem, der her kun er i Staff Search (staffX: klubber uden for
  // spillets ligaer), så de genererede kun fylder op
  extraSlots = new Map();
  if (memSel && cm?.staffX) for (const row of cm.staffX) {
    const cj = row[16];
    if (!cj || cj[0] < 0 || ![8, 9, 10].includes(cj[1]) || !memOf(row)) continue;
    const e = extraSlots.get(cj[0]) ?? extraSlots.set(cj[0], { 8: 0, 9: 0, 10: 0 }).get(cj[0])!;
    e[cj[1] as 8 | 9 | 10]++;
  }
  for (const c of Object.values(g.clubs)) createClubStaff(c, world, seed, date, dbStaff.get(c.id) ?? []);
  // ledige stabsfolk fra databasen (CA 100+): rollen efter deres bedste egenskab
  for (const row of dbStaff.get(0) ?? []) {
    const [, , , , , , a] = row;
    const role: StaffRole = a[3] >= 12 && a[3] >= Math.max(a[0], a[1], a[2]) ? 'physio' : a[1] + a[2] > 2 * a[0] + 2 ? 'scout' : 'coach';
    const s = addDbStaff(row, 0, role, date, seed);
    // personpostens jobkode +0x3d (staff[11][22] = databasens job): en ledig beholder sit job i hukommelsen (0x68f130 rører kun +0x3d = 0) –
    // oraklets gemte spil 15/7-2001: Billy Davies/Ron Newman 5, Kit Carson/John Dungworth 9 uden klub
    if (npInit && row[11]) s.cmDbJob = row[11][22] ?? 0;
    else if (npLogic?.bx && npLogic.np[row[9]]) s.cmDbJob = npLogic.np[row[9]][22] ?? 0;
  }
  // Staff Search (0x7afa70 tager alle personer med ikke-spillerpost i hukommelsen): de øvrige ikke-spillere, som originalens 0x524d70 beholder
  // med de valgte lande – formænd, direktører, stab i klubber uden for spillet, ledige … Kun til søgningen og profilen (cmExtra): de er ikke en
  // del af spillets stab (club = 0, ingen løn i klubberne); jobbet og klubben står i cmJob/cmClub.
  if (staffLogic) g.cmStaffMem = true;
  if (memSel && cm?.staffX) {
    g.cmStaffMem = true;
    g.cmClubNames = {};
    const ROLE: Record<number, StaffRole> = { 5: 'manager', 12: 'manager', 6: 'assistant', 13: 'assistant', 7: 'coach', 8: 'coach', 14: 'coach', 15: 'coach', 9: 'scout', 10: 'physio' };
    for (const row of cm.staffX) {
      if (!memOf(row)) continue;
      const s = addDbStaff(row, 0, ROLE[row[5]] ?? 'coach', date, seed);
      const club = row[16]?.[0] ?? -1;
      s.cmExtra = true;
      // uden klub viser originalen "Unemployed" (jobbet følger klubben – *antaget* efter Terzi/Ferguson i ejerens billede)
      s.cmJob = club >= 0 ? row[5] : 0;
      // 0x4cb990 læser jobkoden +0x3d – databasens job, også uden klub (en ledig fysioterapeut kan ansættes som fysioterapeut)
      s.cmDbJob = row[5];
      s.cmMem = true;
      s.wage = 0;
      if (club >= 0 && row[5]) {
        s.cmClub = club;
        if (!g.clubs[club] && cm.clubNames?.[club]) g.cmClubNames[club] = cm.clubNames[club];
      }
    }
  }
  npInit = null; npLogic = null; memSel = null; memFlags = null; extraSlots = new Map();
  const natDbGame = natDb; natDb = null;
  // (den originale database) turneringernes tidligere vindere fra club_comp_history.dat – "<turnering> History" → Winners
  if (cm?.compHist && season < 2020) {
    g.cmCompHist = cm.compHist;
    for (const rows of Object.values(cm.compHist)) for (const [, a, b] of rows) for (const c of [a, b]) {
      if (c >= 0 && !g.clubs[c] && cm.clubNames?.[c]) (g.cmClubNames ??= {})[c] = cm.clubNames[c];
    }
  }
  // (20/11, Bosman 0.7.2-tjeklisten punkt 4) 2026/27 i ægte tilstand (nye spil): databasens tidligere vindere på samme måde – world-cm.json
  // compHist (årene i spillets ur) og navnene på klubberne uden for spillet (histNames)
  const rawHist = cmRawLogic ? cm!.cmRaw!.compHist : undefined;
  if (rawHist) {
    g.cmCompHist = rawHist;
    const names = cm!.cmRaw!.histNames ?? {};
    for (const rows of Object.values(rawHist)) for (const [, a, b] of rows) for (const c of [a, b]) {
      if (c >= 0 && !g.clubs[c] && names[c]) (g.cmClubNames ??= {})[c] = names[c];
    }
  }
  for (let i = 0; i < 160; i++) {
    const r = new Rng(hash(seed, 5000 + i));
    const nation = rng.pick(o.activeNations.length ? o.activeNations : [0]);
    const [first, last] = randomName(names, nation, r);
    const role: StaffRole = (['coach', 'coach', 'scout', 'physio', 'assistant', 'manager'] as StaffRole[])[i % 6];
    const s = makeStaff({ id: g.nextId.staff++, first, last, nation, club: 0, role, level: r.int(15, 70), date, seed });
    g.staff[s.id] = s;
  }

  progress('comps', 0.55);
  // (19/11) ligaernes kampprogram som originalens League::create_fixtures 0x6835c0 (cmFixtures.ts) – alle databaser og tilstande
  g.cmPairs = true;
  // (20/11) originalens reservekampe for de spilbare klubber (cmReserveMatches.ts – FIXTURE_MANAGER 0x5aaf00/0x7e6380) – alle databaser og tilstande
  cmRsvNewGame(g);
  // Turneringer for aktive nationer
  setupSeasonComps(season, {});
  // (16/11) sæsonskiftet pr. land (cmSeason.ts): de spilbare lande med egen sæsondag (Norge, Sverige, Japan …) starter i spillets første år
  if (cmSeasonOn(g)) for (const n of g.activeNations) if (!cmMainNation(g, n)) (g.cmNatSeason ??= {})[n] = season;
  // create_game 0x82992b: klubbernes manglende omdømme, tilskuertal og træningsanlæg (cmFinance.ts – kun den originale database i ægte tilstand)
  if (cm) cmClubDataFill_829960(g, cm, seed);
  // originalens bestyrelse: init_club_board_records 0x68f130 på databasens dato (cmBoardGame.ts – kun den originale database i ægte tilstand)
  cmBoardInit(g, cm?.cmRaw?.chairBoard, cm?.cmRaw?.nationBoard, natDbGame ?? undefined, cm ? (c) => cmStartBalanceGbp(g, cm, seed, c) : undefined);

  progress('board', 0.62);
  // Brugerens klub
  const club = g.clubs[o.clubId];
  if (o.preview) previewClub(g, club.id); else takeOverClub(club);
  // originalens konditionsmodul (cmFitness.ts): posterne, skaderne fra databasens dato og startens Fitness (kun original DB i ægte tilstand)
  // (runde 10A) sub_535a80 0x536285: spillerpostens moral +0x45 = 10 for alle databasens spillere ved spilstarten (forkørslen 0x5cc850 kører ikke
  // 0x5ce2d0's daglige moral – først fra spillets start: cmPlayerData.ts moraleDay/cmSquadMoraleDaily)
  // (MODERN_PARITY 8) nye 2026/27-spil i ægte tilstand: originalens forhold, medier, rygter, moral og nyhedsomfang (cmMediaOn) – også startens moral
  if (cmRawLogic && !g.draft) g.cmMedia = 1;
  if (cmMediaOn(g)) for (const p of Object.values(g.players)) if (!p.regen) p.morale = 10;
  // forholdene staff+0x65 og club +0x9b..+0xaf fra databasen (cmRelations.ts – ikke-indlæste id'er bliver 0)
  if (cm?.cmRaw && (season < 2020 || cmRawLogic)) cmRelNewGame(g, cm.cmRaw.prefs, cm.cmRaw.clubPrefs);
  progress('fitness', 0.7);
  // create_game 0x828110 FØR forkørslen 0x5cc850 (0x829fd9): FinanceTable 0x59a370 (0x82976f – init_for_club 0x5961d0), kontrakterne 0x4c7560
  // (0x829809 – startkontrakterne 0x85e960) og refresh_all_wage_bills 0x59cf50 (0x829852). Forkørslens kampe (Intertoto, CL's 1. kvalifikationsrunde)
  // bogfører derfor kampindtægterne 0x59a5d0 og bonusserne 0x4ca6d0 (FinanceTable::daily_update 0x59b9c0 selv bogfører intet før [0xdd6ec8]).
  // Før 19/11 kom de tre efter forkørslen, så de kampe gav hverken gate/tv eller bonusser, og ugens lønsum blev regnet uden stabens løn.
  // originalens økonomi (cmFinance.ts): Finance::init_for_club 0x5961d0 – CM-database i ægte tilstand (den originale database og,
  // MODERN_PARITY 4, nye 2026/27-spil med world-cm.json's club.dat-økonomi)
  if (cm) { g.cmFinStartYear = season; cmFinanceNewGame(g, cm, seed); }
  // originalens startkontrakter 0x85e960 (cmContractInit.ts): bonusser, klausuler og deltid – kun den originale database i ægte tilstand
  // staben: 0x4c7560's startkontrakter – managerne ingen, de andre databasens løn eller −1 (cmWageGame.ts)
  cmStaffWagePrepare(g, staffDbWage);
  staffDbWage.clear();
  const unsetWages = cm ? cmContractsNewGame(g, dbWageGbp, seed).unset : new Set<number>();
  // ugens lønsum ved start (0x59cf50 efter kontrakterne)
  cmFinanceWageBills(g);
  // PLAYER_REGEN's første pensioneringsliste 0x7a58f0 ved indlæsningen – før forkørslen (cmRetire.ts)
  cmRetireInit(g);
  cmFitNewGame(g);
  // originalens arbejdstilladelses-historik (0x8c6e60 – cmPermit.ts)
  cmPermitNewGame(g);
  // computerens trupplan 0x83a1b0 → 0x83cb40 for alle klubber: trupstatus, lejeliste, +0x3d/+0x3e/+0x3f (cmSquadPlanGame.ts)
  progress('plan', 0.8);
  cmSquadPlanStart(g);
  // 0x83a1b0 efter trupplanen: lønnen for kontrakterne uden løn (0x862720 – cmWageGame.ts)
  cmWageFillNewGame(g, unsetWages);
  // staben: 0x83a1b0's udfyldning af lønnen −1 med 0x862720 (cmWageGame.ts)
  cmStaffWageNewGame(g);
  // 0x83a1b0's slutning: positionslisterne 0x83a780 og budgettets fordeling/målene 0x83b6e0 for alle klubber (cmShortlistGame.ts)
  // (nyt spil-forløbets midlertidige verden: ikke – den bruges kun til Select Team, og spillet bygges igen ved Take Control)
  if (!o.preview) cmShortlistStart(g);
  // 0x5ccc9c: player_setup.cfg 0x7a30c0 efter 0x83a1b0 – lejeaftalerne (0x8bf400) og skaderne, så 0x5cccaa: Injury::init_squad_fitness 0x62a920
  // (cmFitnessGame.ts). Trupplanen ovenfor har læst konditionen (0x62c680 op til startdagen – helede skader er slut) før startens skader.
  cmSetupLoans(g);
  cmFitSetupDay(g);
  // startdagens CONTRACT_MANAGER::daily_update 0x4c7ac0 (originalen kører den også på [0xdd6ec8] – cmContractManager.ts)
  cmContractManagerDay(g);
  // spillernes værdi = originalens +0x52 (0x4d0c60 – cmValueGame.ts)
  cmValuesApply(g);
  // Transfer Funds = Finance::get_transfer_budget 0x598800 for alle klubber (cmBudget.ts) – erstatter skønnet originalTransferFunds
  cmRefreshTransferBudgets(g);
  progress('scouting', 0.9);
  // (MODERN_PARITY 9+10) 2026/27 i ægte tilstand: originalens kendskab 0x5aff00 og SCOUT_MANAGER (cmScoutLogic) samt karantæner/appel og bøder
  // (discipline.cpp/Fine.cpp – cmDiscLogic) for nye spil; den originale database har dem altid (cmActive)
  if (cmRawLogic && cmLogic(g) && !cmActive(g) && !g.draft) { g.cmScoutStart = g.date; g.cmDiscStart = g.date; }
  initKnowledge();
  monthlyDevelopment();
  if (o.challenge) {
    const ch = CHALLENGES.find((c) => c.id === o.challenge);
    if (ch) {
      g.challenge = { id: ch.id, deadlineSeason: season + ch.seasons - 1, club: o.clubId };
      ch.setup?.(g, o.clubId);
    }
  }
  initReleaseClauses();
  refreshShortlists();
  startScoreSeason();
  addNews({ cat: 'general', key: 'news.welcome', params: { manager: o.managerName, club: club.name } });
  g.manager.onboard = {};
  if (!cmActive(g) && windowOpen()) addNews({ cat: 'transfer', key: 'window.opened', params: { date: windowLastDay() ?? g.date } });
  // sponsorvalget findes ikke i ægte CM 01/02
  if (legacyExtended(g)) addNews({ cat: 'finance', key: 'sponsor.offers', params: {} });
  // ægte CM 01/02 starter med tre nyheder (målt i originalen): ansættelsen, bestyrelsens mål og kampprogrammet
  if (origLogic(g)) {
    const board = g.news.filter((n) => n.key.startsWith('board.exp.') || n.key === 'board.cm');
    g.news = [];
    // 0x6a3060: "Man Utd appoint m m as manager" / "Manchester United have appointed m m as manager." (ingen forrige klub)
    if (cmBoardOn(g)) addNews({ cat: 'general', key: 'news.cmAppoint', params: { club: club.short, manager: o.managerName, full: club.name, prev: '', body: appointBody(club.name, o.managerName, '') }, link: { kind: 'club', id: club.id } });
    else addNews({ cat: 'general', key: 'news.managerHired', params: { club: club.short, manager: o.managerName }, link: { kind: 'club', id: club.id } });
    for (const b of board) g.news.unshift(b);
    const lg = g.leagues[club.league];
    // 0x77bc80 type 0xd: brødteksten med klubbens tre første ligakampe (modstander, hjemme/ude, dato) – pladserne 3–14
    const first3 = Object.values(g.fixtures).filter((f) => f.comp === club.league && (f.home === club.id || f.away === club.id))
      .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id).slice(0, 3);
    const games: Record<string, number | string> = { club: club.short };
    if (first3.length === 3) first3.forEach((f, i) => { games[`o${i + 1}`] = f.home === club.id ? f.away : f.home; games[`h${i + 1}`] = f.home === club.id ? 1 : 0; games[`fd${i + 1}`] = f.date; });
    if (lg) addNews({ cat: 'match', key: 'comp.fixturesOut', params: { season: `${season}/${String(season + 1).slice(2)}`, comp: lg.name, ...games }, link: { kind: 'comp', id: club.league } });
  }
  rebuildIndexes();
  progress('done', 0.98);
  initialTransferList();
  // runde 8: originalens kampmotor (gittermotoren) som standard i ægte tilstand med en CM-database (cmLogic – 2026/27 fra 17/11) – én konstant (liveSim.ts)
  if (GRID_ENGINE_DEFAULT && cmLogic(g)) g.options.engine = 'original';
  // (runde 10C) forkørslen: de europæiske kampe før startdatoen (sim.ts registrerer krogen)
  compHooks.euroCatchUp?.(g);
  // (16/11) forkørslen 0x5cc850 spiller alle turneringers kampe fra databasens dato til starten – ligaer og pokaler, der begyndte før startdatoen
  // (Norge/Sverige/Japan/USA/Rusland fra marts–april, Brasiliens pokal): deres kampe spilles her på én gang (sim.ts playOverdue – se cmSeason.ts)
  // (arbejderen ui/newGameWorker.ts har ikke sim.ts' kroge – så tager continueGame dem: g.cmOverdue)
  if (cmSeasonOn(g)) { if (compHooks.playOverdue) cmPlayStartOverdue(g); else g.cmOverdue = true; }
  return g;
}

/** `only` (16/11, sæsonskiftet pr. land – cmSeason.ts): kun disse lande; `euro` = Europas turneringer (hovedskiftet); `keepCups` = lande, hvis pokal
 *  stadig har kampe forude (den hører til den nye sæson); pokalens år = det første, hvis første kamp ikke ligger i fortiden */
/** (16/11) kampene før startdatoen (createGame/continueGame) */
export function cmPlayStartOverdue(g: GameState): void {
  delete g.cmOverdue;
  compHooks.playOverdue?.(Object.values(g.comps).filter((c) => c.nation >= 0).map((c) => c.id), g.date);
}

export function setupSeasonComps(season: number, prevTables: Record<string, number[]>, cupWinners: Record<number, number> = {},
  only?: { nations: Set<number>; euro: boolean; keepCups: Set<number> }) {
  const g = gs();
  const active = only ? only.nations : new Set(g.activeNations);
  // sidste sæsons pokalfinalister (til supercuppen – setupCup nedenfor overskriver pokalen)
  const prevRunner: Record<number, number> = {};
  for (const c of Object.values(g.comps)) if (c.id.startsWith('CUP-') && c.meta?.runnerUp) prevRunner[c.nation] = c.meta.runnerUp as number;
  const byLeague = new Map<string, number[]>();
  for (const c of Object.values(g.clubs)) {
    if (!byLeague.has(c.league)) byLeague.set(c.league, []);
    byLeague.get(c.league)!.push(c.id);
  }
  const leaguesMeta = new Map(Object.entries(g.leagues).filter(([id]) => byLeague.has(id)));
  for (const [id, m] of leaguesMeta) {
    if (!active.has(m.nation) || m.hidden) continue;
    setupLeague(id, m.name, m.nation, m.tier, byLeague.get(id)!, season);
  }
  for (const nation of active) {
    const leagues = [...leaguesMeta.entries()].filter(([, m]) => m.nation === nation && !m.hidden).map(([id]) => id);
    const cupName = leagues.map((l) => LEAGUE_RULES[l]?.cup).find(Boolean);
    const clubs = leagues.flatMap((l) => byLeague.get(l) ?? []);
    if (only?.keepCups.has(nation)) continue;
    const year = only ? [season - 1, season, season + 1].find((y) => cupFirstDate(nation, clubs.length, y) >= g.date) ?? season : season;
    if (clubs.length >= 8) setupCup(nation, cupName ?? `${g.nations[nation].name} Cup`, clubs, year);
  }
  // (runde 10C) den originale database i ægte tilstand: Champions League, UEFA Cup og Super Cup i originalens 2001/02-format (cmEurope.ts)
  if (cmEuroOn(g)) {
    if (only && !only.euro) return;
    // (16/11) næste sæsons turneringer blev oprettet i juni (cmEuroNextSeason) – de bruges; ellers som før
    if (!cmEuroRestoreNext(g, season)) cmSetupEurope(season, prevTables, cupWinners);
    // (runde 10D) England: Liga Cup og Charity Shield efter originalens rundetabeller (competitions.ts / cmCups.ts)
    // England = 60 i den originale database (nation01 – 2026/27: 61)
    const eng = [...active].find((n) => nation01(n) === 60);
    if (eng !== undefined && g.comps.CM7) {
      const inEurope = new Set([...(g.comps.CL?.clubs ?? []), ...(g.comps.UEFA?.clubs ?? [])]);
      setupCmLeagueCup(season, inEurope);
      const byName = (nm: string) => Object.values(g.clubs).find((c) => c.name === nm)?.id;
      const pl = prevTables.CM7;
      // første sæson: databasens sidste mester og FA Cup-vinder (club_comp_history.dat: 2000/01 = Manchester United og Liverpool; 2026/27 fra
      // world-cm.json – turneringerne 7 og 351)
      const last = g.cmEuroDb?.last;
      const champ = pl ? pl[0] : last ? last[7]?.[1] : byName('Manchester United');
      setupCmCharity(season, champ, pl ? cupWinners[eng] : last ? last[351]?.[1] : byName('Liverpool'), pl ? pl[1] : last?.[7]?.[2]);
    }
    return;
  }
  // Supertaça de Portugal (kun den originale database i udvidet tilstand; første sæson har ingen forgænger)
  if (g.dbKind === 'cm0102' && (g.dbYear ?? season) < 2020) {
    const pt = [...active].find((n) => g.nations[n]?.name === 'Portugal');
    const lg = pt === undefined ? undefined : [...leaguesMeta.entries()].find(([, m]) => m.nation === pt && m.tier === 1 && !m.hidden)?.[0];
    if (pt !== undefined && lg && prevTables[lg]) setupSuperCup(season, pt, 'Portuguese Super Cup', prevTables[lg][0], cupWinners[pt], prevRunner[pt]);
  }
  const { cl, uefa, conf } = europeanQualifiers(prevTables, cupWinners);
  // "[klub] qualify for [turnering]"
  for (const [ids, name] of [[cl, 'Champions League'], [uefa, season >= 2009 ? 'Europa League' : 'UEFA Cup'], [conf, 'Conference League']] as const) {
    for (const c of ids) asOwner(c, () => addNews({ cat: 'match', key: 'comp.qualified', params: { club: g.clubs[c]?.name ?? '', comp: name }, link: { kind: 'club', id: c } }));
  }
  setupChampionsLeague(cl, season);
  setupUefaCup(uefa, season);
  // Conference League: ligafase med kun 6 runder
  setupUefaCup(conf, season, 'UECL', 'Conference League', 6);
}

/**
 * Transfer Funds ved start i originalen: ca. 70 % af saldoen, rundet ned til £250K (under £5M: £25K) – målt på 13 klubber
 * (Man Utd £30,6M → £21,5M, Liverpool £19,5M → £13,75M, Crewe £2,48M → £2,4M). Enkelte afviger (Newcastle får mere end
 * saldoen, Fulham og Middlesbrough mindre) – den del af formlen kender vi ikke (*estimeret*). Negativ saldo = 0.
 */
export function originalTransferFunds(balance: number): number {
  const gbp = balance * GBP;
  if (gbp <= 0) return 0;
  const step = gbp >= 5_000_000 ? 250_000 : 25_000;
  return (Math.floor((gbp * 0.7) / step) * step) / GBP;
}

/** Nyt-spil-forløbet: vis en klubs egne skærme (trup, kampe …) uden at ansætte nogen – manageren og stillingen røres ikke */
export function previewClub(g: GameState, clubId: number) {
  g.userClub = clubId;
  if (!g.tactic) g.tactic = newTactic('4-4-2');
}

export function takeOverClub(club: Club, viaJob = false) {
  const g = gs();
  const old = g.staff[club.manager];
  if (old) {
    old.club = 0;
    // 0x690890 remove_staff_from_club beholder jobkoden +0x3d (oraklets gemte spil: Arsène Wenger 5 uden klub) – kun den originale database
    if (old.cmNp && !old.cmExtra) old.cmDbJob = 5;
  }
  club.manager = -1;
  g.userClub = club.id;
  const sq = squad(club.id);
  // vælg formationen der passer bedst til truppen
  let best = newTactic('4-4-2');
  let bestScore = -1;
  for (const f of FORMATIONS) {
    const t = autoSelect(newTactic(f), sq, false);
    const score = t.lineup.reduce((s, id) => s + (g.players[id]?.ca ?? 0), 0);
    if (score > bestScore + 5) { bestScore = score; best = t; }
  }
  // ægte CM 01/02: ingen er udtaget fra start – manageren (eller assistenten, før kampen) udtager holdet; formationen passer til truppen
  // den originale database i ægte tilstand: taktikken hører til manageren (0x5fbd00) – ved spilstart forudindstillingen "4-4-2" (442_default,
  // human_manager.dat i oraklets gemte spil – tacticTable.ts cmLoadPreset), ved et jobskifte hans egen taktik uden udtagelse
  if (cmActive(g)) g.tactic = viaJob && g.tactic ? { ...g.tactic, lineup: g.tactic.lineup.map(() => 0), bench: [] } : cmLoadPreset(newTactic('4-4-2'), neutralPlayerInstructions);
  else g.tactic = origLogic(g) ? newTactic(best.formation) : best;
  for (const p of sq) recordDevelopment(p);
  g.board = { confidence: 65, expectation: 'mid', expectedPos: 10, warnings: 0 };
  // den originale database i ægte tilstand: 0x826f20 → 0x69ebc0 → 0x694c80 (cmBoardGame.ts); ellers spillets egne forventninger
  if (cmBoardOn(g)) { if (!viaJob) cmBoardHumanAppoint(g, club, !!old); }
  else setBoardExpectation();
  // Funds med den nye managers omdømme (0x598800 – under createGame findes økonomien endnu ikke, og cmRefreshTransferBudgets springer over)
  cmRefreshTransferBudgets(g, [club.id]);
}

/** originalens spilstart for ikke-spillerposten (sat i createGame, mens databasens stab oprettes) */
let npInit: { pool: NpTemplate[]; nations: string[]; seed: number; sel: Set<number> | null } | null = null;
/** 2026/27 i ægte tilstand: ikke-spillerpostens spilstart af cmRaw.staffNp (pr. person-id) */
let npLogic: { pool: NpTemplate[]; nations: string[]; seed: number; np: Record<number, number[]>; bx?: Record<number, [number[], string, number[]]>; natOff?: number;
  /** (MODERN_PARITY 13) stabens modul: person-id, databasens løn og hukommelsen som den originale database */
  staff?: boolean } | null = null;
/** 0x524d70: de valgte lande (den originale database med staffX, eller 2026/27 med stabens modul) og (2026/27) hukommelsen pr. person-id */
let memSel: Set<number> | null = null;
let memFlags: Record<number, 1 | number[]> | null = null;
/** databasens trænere/spejdere/fysioterapeuter (job 8/9/10) pr. klub, der kun er i staffX (0x527240's pladser) */
let extraSlots = new Map<number, { 8: number; 9: number; 10: number }>();
/** (MODERN_PARITY 7) 2026/27: databasens landstrænere (staff +0x24/+0x28 med job 5/12) → bestyrelsens nd (cmBoardInit) */
let natDb: Record<number, [number, number]> | null = null;
/** 0x524d70: har originalen personen i hukommelsen med de valgte lande (world-rækkens [15]: 1 = altid, ellers nationerne) */
const memFlag = (row: NonNullable<CMWorld['staff']>[number]) => row[15] ?? memFlags?.[row[9]];
const memOf = (row: NonNullable<CMWorld['staff']>[number]): boolean => { const f = memFlag(row); return !!memSel && (f === 1 || (Array.isArray(f) && f.some((n) => memSel!.has(n)))); };

/** Stab fra databasen: navn, nation, alder og de egenskaber, databasen har (resten som en genereret på samme niveau) */
/** stab med databasens egen løn (K8): røres ikke af lønloftet i createClubStaff */
const dbWaged = new WeakSet<Staff>();
/** databasens ugeløn (£) pr. Staff-id – startkontrakterne 0x85e960 (cmStaffWageNewGame) */
const staffDbWage = new Map<number, number>();

function addDbStaff(row: NonNullable<CMWorld['staff']>[number], club: number, role: StaffRole, date: string, seed: number): Staff {
  const g = gs();
  const [, first, last, nation, dob, , a, ca, rep, , tac] = row;
  const s = makeStaff({ id: g.nextId.staff++, first, last, nation, club, role, level: Math.round(ca / 2), date, seed });
  const keys: (keyof Staff['attrs'])[] = ['coaching', 'judgingAbility', 'judgingPotential', 'physio', 'motivating', 'discipline', 'tactics'];
  // 1 står ofte for "ikke sat" (2026/27-opdateringen: Arteta Coaching 1) – så bruges den genererede værdi (*estimeret*)
  keys.forEach((k, i) => { if (a[i] > 1) s.attrs[k] = a[i]; });
  if (dob) s.dob = dob;
  if (rep > 0) s.rep = Math.max(1, Math.min(100, Math.round(rep / 2)));
  if (tac?.some((v) => v > 0)) s.tac = tac.slice();
  if (ca > 0) s.ca = ca;
  // den originale database: databasens ugeløn (staff.dat +78, £) for stab med en – oraklet (K8) har den i startkontrakten (42 af 55); de øvrige får
  // originalens standardløn 0x864550 (cmWage.ts – endnu ikke koblet til stab), her spillets egen
  const dbWage = row[12]?.[11] ?? 0;
  if (npInit && club && dbWage > 0) { s.wage = Math.round(dbWage / GBP); dbWaged.add(s); staffDbWage.set(s.id, dbWage); }
  // (MODERN_PARITY 13) 2026/27: databasens ugeløn (staffBx[0][11], £) til startkontrakterne (cmStaffWagePrepare – lønnen sættes dér) og person-id'et
  else if (npLogic?.staff) { const w26 = npLogic.bx?.[row[9]]?.[0]?.[11] ?? 0; if (club && w26 > 0) staffDbWage.set(s.id, w26); s.cmId = row[9]; }
  // den originale database: kontraktens udløb som spillernes (0x4c7560 → 0x85e960 0x85ec81/0x85ed8f: personpostens +0x46; mangler den,
  // trukket 0x4c7632–0x4c776d; for tidlig +52 uger – cmContractEnd.ts). Oraklet 14/7-01: Martin Foyle/Port Vale 29/6-2002 (databasen),
  // Warwick Rimmer/Tranmere 2/6-2002 (trukket). 2026/27: staffBx[0][12..13]. Ældre world-filer uden feltet: spillets egen (makeStaff)
  const kx = npInit ? row[12] : npLogic?.staff ? npLogic.bx?.[row[9]]?.[0] : undefined;
  const ey = kx?.[13];
  if (club && ey !== undefined) {
    const ed = kx![12] ?? 0;
    const db = ey > 1900 && ey < 2100 ? new Date(Date.UTC(ey, 0, 1 + Math.max(0, ed))).toISOString().slice(0, 10) : '';
    s.expires = cmContractEnd(db, date, g.nations[g.leagues[g.clubs[club]?.league]?.nation]?.name, seed, row[9]);
  }
  // (forholdene) databasens person-id og de skjulte egenskaber +0x56..+0x5d (kun den originale database – cmRelations.ts)
  if (npInit) { s.cmId = row[9]; if (row[12]) s.cmHid = row[12].slice(2, 11); if (row[14]) s.cmNat = [row[14][0], row[14][1]]; }   // [12] = [+8, +0xc, +0x56..+0x5d, +0x22] (cmBoard)
  // den originale database: ikke-spillerposten som i originalens hukommelse efter spilstarten (sub_535a80 – cmStaffInit.ts):
  // CA/PA, de manglende egenskaber (skabelonen, egen talrække pr. staff-id), navnelisten/+0x43, de 8 interne og afbalanceringen 0x539490
  const raw = row[11];
  // (2026/27: world-cm.json's staffNp; Staff Search's øvrige ikke-spillere fra world-cm-staff.json har posten i [11] som den originale database)
  const npRaw = !npInit && npLogic ? npLogic.np[row[9]] ?? (npLogic.staff ? raw : undefined) : undefined;
  const npSrc = npInit && raw ? { ...npInit, raw } : npRaw ? { ...npLogic!, raw: npRaw } : null;
  if (npSrc) {
    const np = npFromWorld(ca, npSrc.raw, tac?.[7] ?? 0);
    const rand = cmRand(npSrc.seed, row[9], 537);
    const name = first ? `${first} ${last}` : last;
    const job = staffInitRecord({ np, job: npSrc.raw[22], nation: npSrc.nations[nation] ?? null, clubRep: club ? (g.cmClubRep?.[club] ?? null) : null, name, hasPlayer: false }, npSrc.pool, rand);
    staffConvert(np, job);
    s.ca = np.ca; s.cmPa = np.pa; s.cmNp = [...np.a, np.f43];
  }
  // ikke-spillerpostens omdømmer, de skjulte egenskaber og ankomstdatoen (sub_535a80 0x537d59 – cmBoardGame.ts)
  if (raw && row[12]) cmInitStaffRep(g, s, row);
  // (MODERN_PARITY 7) 2026/27: de samme felter fra world-cm.json (staffBx: [12], [13], [14]) – landstrænerne i natDb (ikke Staff.cmNat: landsholdene
  // følger spillets egne regler)
  else if (!npInit && npSrc && npLogic?.bx?.[row[9]]) {
    const [bx, joined, nat] = npLogic.bx[row[9]];
    const r = row.slice() as typeof row; r[12] = bx; r[13] = joined;
    cmInitStaffRep(g, s, r);
    const n = nat[0] - (npLogic.natOff ?? Infinity);
    if ((nat[1] === 5 || nat[1] === 12) && n >= 0 && n < g.nations.length && natDb) natDb[s.id] = [n, nat[1]];
  }
  if (memSel && memFlag(row) !== undefined) s.cmMem = memOf(row);
  g.staff[s.id] = s;
  return s;
}

function createClubStaff(c: Club, world: WorldData, seed: number, date: string, db: NonNullable<CMWorld['staff']> = []) {
  const g = gs();
  const r = new Rng(hash(seed, c.id, 99));
  // 2026/27: cheftrænerne fra CLUB_INFO_2026 (Wikipedia, nov. 2026)
  const info = world.season >= 2026 ? CLUB_INFO_2026[c.id] : undefined;
  const infoNat = info?.[2] ? world.nations.findIndex((n) => n.name === info[2]) : -1;
  // Wikipedias liste (nyere end databasen) går forud; ellers databasens manager (club.dat 207)
  const coach = (info?.[0] ? `${info[0].split(' ')[0]}|${info[0].split(' ').slice(1).join(' ')}${infoNat >= 0 ? `|${infoNat}` : ''}` : '') || world.clubs.find((x) => x[0] === c.id)?.[7] || '';
  const mk = (role: StaffRole, level: number, mem = false) => {
    let first: string, last: string, nation = c.nation;
    if (role === 'manager' && coach) {
      // databasen: "fornavn|efternavn|nation" – ellers første ord som fornavn
      const parts = coach.includes('|') ? coach.split('|') : [coach.split(' ')[0], coach.split(' ').slice(1).join(' ')];
      first = parts[1] ? parts[0].trim() : '';
      last = (parts[1] || parts[0]).trim();
      if (parts[2] !== undefined && world.nations[Number(parts[2])]) nation = Number(parts[2]);
    } else {
      [first, last] = randomName(g.names, c.nation, r);
    }
    const s = makeStaff({ id: g.nextId.staff++, first, last, nation, club: c.id, role, level, date, seed });
    // 0x527240 (database_generate_extra_non_playing_staff): kun dens genererede trænere/spejdere/fysioterapeuter er i originalens hukommelse
    // og dermed i Staff Search (gen0x527240 nedenfor) – spillets øvrige genererede stab (manager/assistent uden databasens) findes ikke dér
    if (mem) s.cmMem = true;
    g.staff[s.id] = s;
    return s;
  };
  const lvl = c.rep;
  // databasens folk først (højst som klubbens grænser); managerens navn kommer fra Wikipedia (2026/27) eller clubs[7]
  const ROLE: Record<number, StaffRole> = { 5: 'manager', 6: 'assistant', 8: 'coach', 9: 'scout', 10: 'physio', 12: 'manager' };   // 12 = spillende manager (kun den originale database)
  const MAX: Record<StaffRole, number> = { manager: 1, assistant: 1, coach: 7, physio: 3, scout: 7 };
  const have: Record<StaffRole, number> = { manager: 0, assistant: 0, coach: 0, physio: 0, scout: 0 };
  for (const row of db.slice().sort((x, y) => y[7] - x[7])) {
    const role = ROLE[row[5]];
    if (!role || have[role] >= MAX[role]) continue;
    // manageren: kun når det er samme person som klubbens manager (Wikipedias nyere navn går forud)
    if (role === 'manager' && (!coach || !coach.split('|').slice(0, 2).join(' ').trim().endsWith(row[2]))) continue;
    const s = addDbStaff(row, c.id, role, date, seed);
    if (role === 'manager') { c.manager = s.id; if (infoNat >= 0) s.nation = infoNat; }
    have[role]++;
  }
  if (!have.manager) { const m = mk('manager', lvl + r.int(-5, 5)); c.manager = m.id; }
  if (!have.assistant) mk('assistant', lvl - 5);
  // 0x527240 (den originale stabs hukommelse, memSel): klubberne i de valgte lande (nation +0x11c) – ikke Englands med omdømme +0x80 ≤ 500
  // (0x527334/0x527340) – fyldes op til ftol((omd + 500)·k/10000) i 1..max (0x527422/0x527725/0x527a26): trænere k = 5 (+0x19f, højst 5),
  // spejdere k = 7 (+0x1b3, højst 7), fysioterapeuter k = 3 (+0x1cf, højst 3); de nye får job 8/9/10. Ikke porteret: B-holdenes spring
  // (0x540a50) og 0x527d03's ledige managere for klubber uden manager. Ellers spillets egne tal (uden for originalens hukommelse).
  const R = g.cmClubRep?.[c.id] ?? c.rep * 100;
  const gen0x527240 = !!memSel?.has(c.nation) && !(g.nations[c.nation]?.name === 'England' && R <= 500);
  const target = (k: number, max: number) => Math.min(max, Math.max(1, Math.trunc(((R + 500) * k) / 10000)));
  const xs = gen0x527240 ? extraSlots.get(c.id) : undefined;
  const coaches = gen0x527240 ? target(5, 5) - (xs?.[8] ?? 0) : 2 + Math.floor(c.rep / 25);
  for (let i = have.coach; i < coaches; i++) mk('coach', lvl - 8 + r.int(-6, 6), gen0x527240);
  if (gen0x527240) { for (let i = have.physio; i < target(3, 3) - (xs?.[10] ?? 0); i++) mk('physio', lvl - 5 - 5 * i, true); }
  else {
    if (!have.physio) mk('physio', lvl - 5);
    if (c.rep > 55 && have.physio < 2) mk('physio', lvl - 10);
  }
  const scouts = gen0x527240 ? target(7, 7) - (xs?.[9] ?? 0) : 1 + Math.floor(c.rep / 30);
  for (let i = have.scout; i < scouts; i++) mk('scout', lvl - 8 + r.int(-6, 6), gen0x527240);
  // stabens løn følger klubbens lønniveau: højst 20 % af spillernes lønsum (*estimeret*) – ellers kostede seks stabsfolk i en
  // lille klub lige så meget som hele truppen, og hundredvis af små klubber gik i minus i første sæson
  // (K8) databasens egne stabslønninger (oraklet har dem som de står) ligger fast; kun de genererede skaleres ned
  const mine = Object.values(g.staff).filter((s) => s.club === c.id && !dbWaged.has(s));
  const fixed = Object.values(g.staff).filter((s) => s.club === c.id && dbWaged.has(s)).reduce((x, s) => x + s.wage, 0);
  const total = mine.reduce((x, s) => x + s.wage, 0);
  const cap = Math.max(0, squad(c.id).reduce((x, p) => x + (p.contract?.wage ?? 0), 0) * 0.2 - fixed);
  if (total > cap) for (const s of mine) s.wage = Math.max(50, Math.round((s.wage * cap) / total / 50) * 50);
}

const NEED: [SubPos, number][] = [['GK', 3], ['CB', 4], ['LB', 2], ['RB', 2], ['DM', 2], ['CM', 3], ['LW', 1], ['RW', 1], ['LM', 1], ['RM', 1], ['AM', 1], ['CF', 3]];
const ROLE_OF: Record<SubPos, Role> = { GK: 'GK', CB: 'CB', LB: 'FB', RB: 'FB', DM: 'DM', CM: 'CM', AM: 'AM', LM: 'WM', RM: 'WM', LW: 'W', RW: 'W', CF: 'ST', SS: 'ST' };

/** Generér spillere så truppen dækker alle positioner (bruges til 2. divisioner og tynde trupper) */
export function fillSquad(c: Club, sq: Player[], level: number, date: string, seed: number, min = 22) {
  const g = gs();
  const have = new Map<Role, number>();
  for (const p of sq) {
    const role = naturalRole(p);
    have.set(role, (have.get(role) ?? 0) + 1);
  }
  const r = new Rng(hash(seed, c.id, 1234));
  const needed: SubPos[] = [];
  const roleNeed = new Map<Role, number>();
  for (const [sub, n] of NEED) roleNeed.set(ROLE_OF[sub], (roleNeed.get(ROLE_OF[sub]) ?? 0) + n);
  for (const [sub, n] of NEED) {
    const role = ROLE_OF[sub];
    const count = have.get(role) ?? 0;
    const want = roleNeed.get(role)!;
    if (count < want) {
      const add = Math.min(n, want - count);
      for (let i = 0; i < add; i++) needed.push(sub);
      have.set(role, count + add);
    }
  }
  let total = sq.length + needed.length;
  while (total < min) { needed.push(r.pick(['CB', 'CM', 'CF', 'DM', 'LB', 'RW'] as SubPos[])); total++; }
  const wealth = rulesFor(c.league, 20).wealth;
  for (const sub of needed) {
    const nation = r.chance(0.9) ? c.nation : r.pick(Object.keys(g.names).map(Number));
    const [first, last] = randomName(g.names, nation, r);
    // Udfyldninger er opdigtede spillere. For at de ikke forveksles med rigtige stjerner (fx en
    // opfundet 3. målmand i en storklub med stjerne-CA) gøres de til unge reserve-/akademispillere
    // tydeligt under førsteholdet. Starterne kommer altid fra de rigtige spillere.
    const age = r.int(17, 23);
    const id = g.nextId.player++;
    const p = makePlayer({
      id, first, last, dob: randomDob(age, date, r), nation, club: c.id, sub, foot: r.chance(0.25) ? 'L' : 'R', height: 0,
      ca: Math.max(40, Math.round(level * 0.72) + r.int(-8, 12)), date, seed, wealth, regen: true,
    });
    addPlayer(p);
  }
}

function emptyFinance() {
  return { gate: 0, tv: 0, prize: 0, sponsor: 0, merch: 0, transfersIn: 0, transfersOut: 0, wages: 0, other: 0 };
}

export { emptyFinance };

function median(a: number[]) {
  const s = a.slice().sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)] ?? 0;
}

function clampInt(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

export type { Staff };

/** 0x52638a's reserveposter som world-rækker (se createGame) – id 8.900.000 + i */
function reserveRows(cm: CMWorld, active: number[], names: Record<number, [string[], string[]]>, seed: number, F: Record<string, number>, nf: number,
  out: Record<number, CMWorld['ratings'][number]>): WorldData['players'] {
  const T = cm.cmTrim!;
  const sel = active.filter((n) => T.kn[n] !== undefined);
  const K = T.k0 + sel.reduce((s, n) => s + T.kn[n], 0);
  const n = Math.trunc(K * (T.pct ?? 0.02));
  const nat0 = Object.entries(T.nat0).map(([k, v]) => [Number(k), v] as const);
  const rr = new Rng(hash(seed, 52638) || 1);
  const rows: WorldData['players'] = [];
  const nAttr = Object.values(cm.ratings)[0]?.attrs.length ?? 0;
  for (let i = 0; i < n; i++) {
    // nationaliteten fra en tilfældig beholdt person (0x526402): de ekstra for et valgt land regnes som landets egne (*estimeret*)
    let x = rr.int(0, Math.max(0, K - 1)), nation = -1;
    for (const s of sel) { if (x < T.kn[s]) { nation = s; break; } x -= T.kn[s]; }
    if (nation < 0) for (const [s, v] of nat0) { if (x < v) { nation = s; break; } x -= v; }
    if (nation < 0) nation = sel[0] ?? active[0] ?? 0;
    const id = 8_900_000 + i;
    const [first, last] = randomName(names, nation, rr);
    const row: (string | number)[] = new Array(nf).fill(0);
    row[F.id] = id; row[F.first] = first; row[F.last] = last; row[F.nation] = nation; row[F.club] = 0; row[F.pos] = 'CM'; row[F.foot] = 'R';
    row[F.dob] = new Date(Date.UTC(1982, 0, 1 + rr.int(0, 364))).toISOString().slice(0, 10);
    if (F.contract !== undefined) row[F.contract] = '';
    rows.push(row);
    const paRaw = rr.int(0, 99) === 0 ? -2 : rr.int(0, 49) === 0 ? -1 : 0;
    out[id] = { ca: 0, pa: 1, paRaw, attrs: new Array(nAttr).fill(0), pos: [1, 1, 1, 1, 1, 1, 1, 1], side: [1, 1, 1], rep: [0, 0, 0], feet: [0, 0], tf: 1 };
  }
  return rows;
}
