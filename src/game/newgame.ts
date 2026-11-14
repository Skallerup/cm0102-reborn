// Opret et nyt spil ud fra world.json
import { cashRound } from './cmTransferBid';
import { CLUB_INFO_2026 } from './data/clubInfo2026';
import { capCA, fillMissing, initialisePA, makePool, makeRand, repairPositions, shownFromStored } from './playerInit';
import { splitReserves } from './reserves';
import { initialTransferList } from './transfers';
import { startScoreSeason } from './rating';
import { naturalRole } from './attributes';
import { europeanQualifiers, setupChampionsLeague, setupCmCharity, setupCmLeagueCup, setupCup, setupLeague, setupUefaCup } from './competitions';
import { ageOn } from './dates';
import {
  caFromValue, makePlayer, makeStaff, randomDob, randomName, valueFromCA, wageFor, type SubPos,
} from './data/generate';
import { formulaValueGbp, originalValueGbp, repTriple } from './originalValue';
import { rulesFor, LEAGUE_RULES } from './leagues';
import { Rng, hash, rng } from './rng';
import { setEconomy } from './econ';
import { addNews, addPlayer, ensureNumbers, gs, rebuildIndexes, setAutoNumbers, setGame, squad } from './state';
import { asOwner } from './humans';
import { initReleaseClauses } from './clauses';
import { refreshShortlists, windowLastDay, windowOpen } from './transfers';
import { autoSelect, newTactic, FORMATIONS } from './tactics';
import type { Club, GameState, Lang, Player, Role, Staff, StaffRole } from './types';
import type { CMWorld } from './data/cm0102';
import { setBoardExpectation } from './board';
import { appointBody, cmBoardHumanAppoint, cmBoardInit, cmBoardOn, cmInitStaffRep } from './cmBoardGame';
import { fairTicketPrice, transferBudgetFor } from './finance';
import { initKnowledge } from './scouting';
import { CHALLENGES } from './challenges';
import { monthlyDevelopment, recordDevelopment } from './training';
import { cmRand, fillReputation } from './cmPlayerData';
import { npFromWorld, npTemplate, staffConvert, staffInitRecord, type NpTemplate } from './cmStaffInit';
import { initialLanguages } from './cmLanguage';
import { cmActive } from './cmPlayerData';
import { cmStartDate } from './cmCalendar';
import { cmEuroOn, cmSetupEurope } from './cmEurope';
import { compHooks } from './hooks';
import { cmFitNewGame } from './cmFitnessGame';
import './cmFriendly';                                               // forkørslens venskabskampe (registerPrerun 'comps1')
import { cmRelNewGame } from './cmRelations';
import { cmFinanceNewGame } from './cmFinance';
import { cmContractsNewGame } from './cmContractInit';
import { cmPermitNewGame } from './cmPermit';
import { cmSquadPlanStart } from './cmSquadPlanGame';
import { GRID_ENGINE_DEFAULT } from './engine/liveSim';

export interface WorldData {
  version: number;
  source: string;
  season: number;
  /** lang = nation.dat +0x77/+0x78/+0x79 (sproget og to andre sprog – den originale database, cmLanguage.ts) */
  nations: { name: string; code: string; lang?: number[] }[];
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
  /** spiltilstand (se GameState.options.mode) */
  mode?: 'authentic' | 'extended';
  /** Online: frist pr. træk i timer (0 = ingen) */
  deadlineHours?: number;
  /** Nyt-spil-forløbets midlertidige verden (Select Team viser klubbens ægte skærme): klubben "ejes" kun til visning – ingen ansættelse, ingen bestyrelse */
  preview?: boolean;
}

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
  const season = world.season;
  // (runde 10A) den originale database i ægte tilstand: originalens spilstart 0x830520 − 4 uger for det først valgte land (England 14/7-2001;
  // cmCalendar.ts) – før 1/7 (Danmark, Polen, Kroatien og forårsligaerne) beholdes spillets 1/7, da sæsonskiftet ligger 1/7
  const cmStart = (world as Partial<CMWorld>).kind === 'cm0102' && season < 2020 && o.mode === 'authentic' ? cmStartDate(o.activeNations[0], season) : null;
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
    options: { masking: o.masking, autosave: true, matchSpeed: 650, fullCommentary: true, rules: o.mode === 'authentic' || world.source.startsWith('Championship Manager 01/02') ? 'classic' : 'modern', mode: o.mode ?? 'extended' },
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
  if (cm) { g.dbKind = 'cm0102'; g.dbYear = season; if (season < 2020) g.dbVersion = world.source.match(/3\.9\.6\d/)?.[0] ?? '3.9.60'; g.customRules = cm.rules as GameState['customRules']; if (cm.officials?.length) g.officials = cm.officials; }
  if (world.nationalTeams) g.intl = { results: [], history: [], info: world.nationalTeams.nations, past: world.nationalTeams.history };
  // den originale 01/02-database spilles i 2001-priser (econ.ts); ligaernes niveau måles, når trupperne er klar
  if (cm && season < 2020) g.econ = { k: 0.5, leagues: {} };
  // originalens rå omdømme (club +0x80, nation +0x8e) – computerens holdudtagelse i gittermotoren (cmPlayerData.ts)
  if (cm?.cmRaw && season < 2020) {
    g.cmClubRep = { ...cm.cmRaw.clubRep }; g.cmNationRep = cm.cmRaw.nationRep.slice();
    // club.dat +100/+119 og club_comp.dat +105 – computerens trupplan 0x83cb40/0x7bca90 (cmSquadPlanGame.ts)
    if (cm.cmRaw.clubStat) g.cmClubStat = { ...cm.cmRaw.clubStat };
    if (cm.cmRaw.compRep) g.cmCompRep = { ...cm.cmRaw.compRep };
    // (runde 9) tilskuertallet sub_85cba0 (engine/grid/crowd.ts)
    if (cm.cmRaw.crowd) g.cmCrowd = Object.fromEntries(Object.entries(cm.cmRaw.crowd).map(([k, v]) => [k, v.slice()])) as GameState['cmCrowd'];
    if (cm.cmRaw.cities) g.cmCities = cm.cmRaw.cities.slice();
    if (cm.cmRaw.nation7e) g.cmNation7e = cm.cmRaw.nation7e.slice();
    if (cm.cmRaw.nation85) g.cmNation85 = cm.cmRaw.nation85.slice();
    if (cm.cmRaw.nationCont) { g.cmNationCont = cm.cmRaw.nationCont.slice(); g.cmEurope = cm.cmRaw.europe ?? -1; }
    if (cm.cmRaw.city33) g.cmCity33 = cm.cmRaw.city33.slice();
  }
  setGame(g);

  const leagueById = new Map(world.leagues.map((l) => [l.id, l]));

  // Klubber
  for (const [id, name, short, nation, league, stadium, seats] of world.clubs) {
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
  if (g.econ && F.wage !== undefined) for (const r of world.players) if ((r[F.wage] as number) > 0) { dbWage.set(r[F.id] as number, Math.round((r[F.wage] as number) / GBP)); dbWageGbp.set(r[F.id] as number, r[F.wage] as number); }
  const initRng = new Rng(1);
  let initPool: ReturnType<typeof makePool> | undefined;
  for (const r of world.players) {
    const club = r[F.club] as number;
    if (club && !g.clubs[club]) continue;
    const dob = r[F.dob] as string;
    const age = ageOn(dob, date);
    const value = r[F.value] as number;
    const league = club ? g.clubs[club].league : '';
    const wealth = league ? rulesFor(league, 20).wealth : 0.5;
    const p = makePlayer({
      id: r[F.id] as number, first: r[F.first] as string, last: r[F.last] as string, dob, nation: r[F.nation] as number,
      club, sub: r[F.pos] as SubPos, foot: r[F.foot] as Player['foot'], height: r[F.height] as number,
      ca: cm?.ratings[r[F.id] as number]?.ca ?? caFromValue(value, age), value, caps: r[F.caps] as number, intGoals: r[F.intGoals] as number,
      stats: { apps: r[F.apps] as number, minutes: r[F.minutes] as number, goals: r[F.goals] as number, assists: r[F.assists] as number, yellows: r[F.yellows] as number, reds: r[F.reds] as number },
      contractEnd: (r[F.contract] as string) || undefined, date, seed, wealth,
    });
    // CM 01/02: originalens evner, potentiale og positioner
    const rt = cm?.ratings[p.id];
    if (rt) {
      // originalens "Player Initialisation" (playerInit.ts, sub_535a80): PA-reglerne (−2/−1, manglende PA og de tilfældige
      // omslag i hvert nyt spil), CA over PA, og manglende egenskaber kopieret fra en lignende skabelonspiller
      const rand = makeRand(() => initRng.next());
      initRng.state = hash(seed, p.id, 91) || 1;
      const pa = initialisePA(rt.paRaw ?? rt.pa, rt.ca, age, club ? rand(4) + 1 : rand(2) + 1, rand);
      const ca = capCA(rt.ca, pa, rand);
      const stored = cm!.attrScale === 'stored';
      // positioner (sub_535a80 0x536f01): reparation, tabellen rand(182) og siderne – [GK SW D DM M AM F WB R L C]
      const pos11 = [...rt.pos, rt.side[2], rt.side[0], rt.side[1]];
      if (stored) repairPositions(pos11, rand);
      const rec = { ca, pos: pos11.slice(0, 8), side: [pos11[9], pos11[10], pos11[8]], attrs: rt.attrs.slice(), stored };
      fillMissing(rec, age, initPool ??= makePool(Object.values(cm!.ratings).map((x) => ({ ...x, stored }))), rand);
      if (rt.rep) p.cmRep = rt.rep;
      // sub_535a80 0x536270–0x536ec6: manglende omdømme udfyldes (egen talrække – spillets rng røres ikke) og Free Role (+0x1a)
      if (cm!.cmRaw && season < 2020) {
        const cr = club ? cm!.cmRaw.clubRep[club] : undefined;
        p.cmRepMem = fillReputation({ rep: rt.rep ?? [0, 0, 0], ca: rt.ca, pa: rt.paRaw ?? rt.pa, club: club ? { rep: cr ?? 0, sameNation: g.clubs[club]?.nation === p.nation } : null,
          nationRep: cm!.cmRaw.nationRep[p.nation] ?? 0, caps: p.caps }, cmRand(seed, p.id, 535));
        if (rt.fr) p.cmFree = rt.fr;
        // staff +0x1e (anden nationalitet) og +0x3e (kom til klubben) – arbejdstilladelsens historik (cmPermit.ts)
        if (rt.n2 !== undefined) p.cmNation2 = rt.n2;
        if (rt.j) p.cmJoined = rt.j;
      }
      let attrs = rec.attrs;
      if (stored) {
        // fødderne: den stærke bliver 20, en manglende rand(rand(20)) + 1 (sub_535a80); bruges i afbalanceringen
        const feet: [number, number] = rt.feet ? [rt.feet[0], rt.feet[1]] : [0, 0];
        if (feet[0] >= feet[1]) feet[0] = 20; else feet[1] = 20;
        for (const k of [0, 1]) if (feet[k] < 1) feet[k] = rand(rand(20)) + 1;
        // de viste værdier ved spilstart: intern → sub_538ec0 → sub_538bc0 → sub_544380 (playerInit.ts)
        const internals: number[] = [];
        attrs = shownFromStored(attrs, ca, pos11[0], feet, internals);
        // originalens interne værdier i spillerposten (Player.cmInt) – samme betingelse som cmRepMem
        if (cm!.cmRaw && season < 2020) p.cmInt = internals;
        p.foot = feet[0] >= 15 && feet[1] >= 15 ? 'B' : feet[0] > feet[1] ? 'L' : 'R';
        p.feet = feet;
      }
      // de få, originalen heller ikke udfylder her (adaptability, ambition, loyalitet …), beholder den genererede værdi
      p.ca = ca; p.pa = pa; p.attrs = attrs.map((v, i) => (v > 0 ? v : p.attrs[i])); p.pos = rec.pos.slice(); p.side = rec.side.slice();
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
    if (rt && cm!.cmRaw && season < 2020) { const lang = initialLanguages(g, p, rt.lg); if (lang) p.cmLang = lang; }
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
    const lvl = sq.length >= 12 ? median(sq.map((p) => p.ca)) : (leagueLevel.get(c.league) ?? 90) - 4;
    fillSquad(c, sq, lvl, date, seed);
  }
  // trøjenumre: alle i hver trup får et unikt nummer
  for (const c of Object.values(g.clubs)) ensureNumbers(c.id);
  // førstehold og reservehold (CM 01/02): de 25 bedste på førsteholdet, resten i reserverne
  for (const c of Object.values(g.clubs)) if (!g.leagues[c.league]?.hidden) splitReserves(c.id);
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
    c.balance = Math.round((sv * 0.12 + wages * 30) / 100_000) * 100_000;
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
      c.transferBudget = originalTransferFunds(c.balance);
    }
    c.ticketPrice = fairTicketPrice(c.rep, c.league);
    if (!c.seats || c.seats < 1000) c.seats = Math.round(2000 + c.rep * c.rep * 6);
  }

  progress('staff', 0.45);
  // Staff – med den originale/CM-database: de rigtige trænere, spejdere og fysioterapeuter fra databasen (CMWorld.staff)
  const dbStaff = new Map<number, NonNullable<CMWorld['staff']>>();
  for (const row of cm?.staff ?? []) dbStaff.set(row[0], [...(dbStaff.get(row[0]) ?? []), row]);
  // originalens spilstart for ikke-spillerposten (cmStaffInit.ts): skabelonpuljen = world-filens stab med hele posten (staff[11])
  npInit = cm?.cmRaw && season < 2020 && cm.staff?.some((r) => r[11])
    ? { pool: cm.staff.filter((r) => r[11]).map((r) => npTemplate(npFromWorld(r[7], r[11]!, r[10]?.[7] ?? 0))), nations: world.nations.map((n) => n.name), seed }
    : null;
  for (const c of Object.values(g.clubs)) createClubStaff(c, world, seed, date, dbStaff.get(c.id) ?? []);
  // ledige stabsfolk fra databasen (CA 100+): rollen efter deres bedste egenskab
  for (const row of dbStaff.get(0) ?? []) {
    const [, , , , , , a] = row;
    const role: StaffRole = a[3] >= 12 && a[3] >= Math.max(a[0], a[1], a[2]) ? 'physio' : a[1] + a[2] > 2 * a[0] + 2 ? 'scout' : 'coach';
    addDbStaff(row, 0, role, date, seed);
  }
  npInit = null;
  for (let i = 0; i < 160; i++) {
    const r = new Rng(hash(seed, 5000 + i));
    const nation = rng.pick(o.activeNations.length ? o.activeNations : [0]);
    const [first, last] = randomName(names, nation, r);
    const role: StaffRole = (['coach', 'coach', 'scout', 'physio', 'assistant', 'manager'] as StaffRole[])[i % 6];
    const s = makeStaff({ id: g.nextId.staff++, first, last, nation, club: 0, role, level: r.int(15, 70), date, seed });
    g.staff[s.id] = s;
  }

  progress('comps', 0.55);
  // Turneringer for aktive nationer
  setupSeasonComps(season, {});
  // originalens bestyrelse: init_club_board_records 0x68f130 på databasens dato (cmBoardGame.ts – kun den originale database i ægte tilstand)
  cmBoardInit(g, cm?.cmRaw?.chairBoard, cm?.cmRaw?.nationBoard);

  progress('board', 0.62);
  // Brugerens klub
  const club = g.clubs[o.clubId];
  if (o.preview) previewClub(g, club.id); else takeOverClub(club);
  // originalens konditionsmodul (cmFitness.ts): posterne, skaderne fra databasens dato og startens Fitness (kun original DB i ægte tilstand)
  // (runde 10A) sub_535a80 0x536285: spillerpostens moral +0x45 = 10 for alle databasens spillere ved spilstarten (forkørslen 0x5cc850 kører ikke
  // 0x5ce2d0's daglige moral – først fra spillets start: cmPlayerData.ts moraleDay/cmSquadMoraleDaily)
  if (cmActive(g)) for (const p of Object.values(g.players)) if (!p.regen) p.morale = 10;
  // forholdene staff+0x65 og club +0x9b..+0xaf fra databasen (cmRelations.ts – ikke-indlæste id'er bliver 0)
  if (cm?.cmRaw && season < 2020) cmRelNewGame(g, cm.cmRaw.prefs, cm.cmRaw.clubPrefs);
  progress('fitness', 0.7);
  cmFitNewGame(g);
  // originalens økonomi (cmFinance.ts): Finance::init_for_club 0x5961d0 og ugens lønsum – kun den originale database i ægte tilstand
  if (cm) { g.cmFinStartYear = season; cmFinanceNewGame(g, cm, seed); }
  // originalens startkontrakter 0x85e960 (cmContractInit.ts): bonusser, klausuler og deltid – kun den originale database i ægte tilstand
  if (cm) cmContractsNewGame(g, dbWageGbp, seed);
  // originalens arbejdstilladelses-historik (0x8c6e60 – cmPermit.ts)
  cmPermitNewGame(g);
  // computerens trupplan 0x83a1b0 → 0x83cb40 for alle klubber: trupstatus, lejeliste, +0x3d/+0x3e/+0x3f (cmSquadPlanGame.ts)
  progress('plan', 0.8);
  cmSquadPlanStart(g);
  progress('scouting', 0.9);
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
  if (windowOpen()) addNews({ cat: 'transfer', key: 'window.opened', params: { date: windowLastDay() ?? g.date } });
  // sponsorvalget findes ikke i ægte CM 01/02
  if (g.options.mode !== 'authentic') addNews({ cat: 'finance', key: 'sponsor.offers', params: {} });
  // ægte CM 01/02 starter med tre nyheder (målt i originalen): ansættelsen, bestyrelsens mål og kampprogrammet
  if (g.options.mode === 'authentic') {
    const board = g.news.filter((n) => n.key.startsWith('board.exp.') || n.key === 'board.cm');
    g.news = [];
    // 0x6a3060: "Man Utd appoint m m as manager" / "Manchester United have appointed m m as manager." (ingen forrige klub)
    if (cmBoardOn(g)) addNews({ cat: 'general', key: 'news.cmAppoint', params: { club: club.short, manager: o.managerName, body: appointBody(club.name, o.managerName, '') }, link: { kind: 'club', id: club.id } });
    else addNews({ cat: 'general', key: 'news.managerHired', params: { club: club.short, manager: o.managerName }, link: { kind: 'club', id: club.id } });
    for (const b of board) g.news.unshift(b);
    const lg = g.leagues[club.league];
    if (lg) addNews({ cat: 'match', key: 'comp.fixturesOut', params: { season: `${season}/${String(season + 1).slice(2)}`, comp: lg.name }, link: { kind: 'comp', id: club.league } });
  }
  rebuildIndexes();
  progress('done', 0.98);
  initialTransferList();
  // runde 8: originalens kampmotor (gittermotoren) som standard i ægte tilstand med den originale database – én konstant (liveSim.ts)
  if (GRID_ENGINE_DEFAULT && g.options.mode === 'authentic' && cmDatabase(g) === 'original') g.options.engine = 'original';
  // (runde 10C) forkørslen: de europæiske kampe før startdatoen (sim.ts registrerer krogen)
  compHooks.euroCatchUp?.(g);
  return g;
}

export function setupSeasonComps(season: number, prevTables: Record<string, number[]>, cupWinners: Record<number, number> = {}) {
  const g = gs();
  const active = new Set(g.activeNations);
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
    if (clubs.length >= 8) setupCup(nation, cupName ?? `${g.nations[nation].name} Cup`, clubs, season);
  }
  // (runde 10C) den originale database i ægte tilstand: Champions League, UEFA Cup og Super Cup i originalens 2001/02-format (cmEurope.ts)
  if (cmEuroOn(g)) {
    cmSetupEurope(season, prevTables, cupWinners);
    // (runde 10D) England: Liga Cup og Charity Shield efter originalens rundetabeller (competitions.ts / cmCups.ts)
    if (active.has(60) && g.comps.CM7) {
      const inEurope = new Set([...(g.comps.CL?.clubs ?? []), ...(g.comps.UEFA?.clubs ?? [])]);
      setupCmLeagueCup(season, inEurope);
      const byName = (nm: string) => Object.values(g.clubs).find((c) => c.name === nm)?.id;
      const pl = prevTables.CM7;
      setupCmCharity(season, pl ? pl[0] : byName('Manchester United'), pl ? cupWinners[60] : byName('Liverpool'), pl?.[1]);
    }
    return;
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
  g.tactic = g.options.mode === 'authentic' ? newTactic(best.formation) : best;
  for (const p of sq) recordDevelopment(p);
  g.board = { confidence: 65, expectation: 'mid', expectedPos: 10, warnings: 0 };
  // den originale database i ægte tilstand: 0x826f20 → 0x69ebc0 → 0x694c80 (cmBoardGame.ts); ellers spillets egne forventninger
  if (cmBoardOn(g)) { if (!viaJob) cmBoardHumanAppoint(g, club, !!old); }
  else setBoardExpectation();
}

/** originalens spilstart for ikke-spillerposten (sat i createGame, mens databasens stab oprettes) */
let npInit: { pool: NpTemplate[]; nations: string[]; seed: number } | null = null;

/** Stab fra databasen: navn, nation, alder og de egenskaber, databasen har (resten som en genereret på samme niveau) */
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
  // (forholdene) databasens person-id og de skjulte egenskaber +0x56..+0x5d (kun den originale database – cmRelations.ts)
  if (npInit) { s.cmId = row[9]; if (row[12]) s.cmHid = row[12].slice(2, 11); if (row[14]) s.cmNat = [row[14][0], row[14][1]]; }   // [12] = [+8, +0xc, +0x56..+0x5d, +0x22] (cmBoard)
  // den originale database: ikke-spillerposten som i originalens hukommelse efter spilstarten (sub_535a80 – cmStaffInit.ts):
  // CA/PA, de manglende egenskaber (skabelonen, egen talrække pr. staff-id), navnelisten/+0x43, de 8 interne og afbalanceringen 0x539490
  const raw = row[11];
  if (npInit && raw) {
    const np = npFromWorld(ca, raw, tac?.[7] ?? 0);
    const rand = cmRand(npInit.seed, row[9], 537);
    const name = first ? `${first} ${last}` : last;
    const job = staffInitRecord({ np, job: raw[22], nation: npInit.nations[nation] ?? null, clubRep: club ? (g.cmClubRep?.[club] ?? null) : null, name, hasPlayer: false }, npInit.pool, rand);
    staffConvert(np, job);
    s.ca = np.ca; s.cmPa = np.pa; s.cmNp = [...np.a, np.f43];
  }
  // ikke-spillerpostens omdømmer, de skjulte egenskaber og ankomstdatoen (sub_535a80 0x537d59 – cmBoardGame.ts)
  if (raw && row[12]) cmInitStaffRep(g, s, row);
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
  const mk = (role: StaffRole, level: number) => {
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
    g.staff[s.id] = s;
    return s;
  };
  const lvl = c.rep;
  // databasens folk først (højst som klubbens grænser); managerens navn kommer fra Wikipedia (2026/27) eller clubs[7]
  const ROLE: Record<number, StaffRole> = { 5: 'manager', 6: 'assistant', 8: 'coach', 9: 'scout', 10: 'physio' };
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
  const coaches = 2 + Math.floor(c.rep / 25);
  for (let i = have.coach; i < coaches; i++) mk('coach', lvl - 8 + r.int(-6, 6));
  if (!have.physio) mk('physio', lvl - 5);
  if (c.rep > 55 && have.physio < 2) mk('physio', lvl - 10);
  const scouts = 1 + Math.floor(c.rep / 30);
  for (let i = have.scout; i < scouts; i++) mk('scout', lvl - 8 + r.int(-6, 6));
  // stabens løn følger klubbens lønniveau: højst 20 % af spillernes lønsum (*estimeret*) – ellers kostede seks stabsfolk i en
  // lille klub lige så meget som hele truppen, og hundredvis af små klubber gik i minus i første sæson
  const mine = Object.values(g.staff).filter((s) => s.club === c.id);
  const total = mine.reduce((x, s) => x + s.wage, 0);
  const cap = squad(c.id).reduce((x, p) => x + (p.contract?.wage ?? 0), 0) * 0.2;
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
