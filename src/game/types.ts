// Central datamodel for hele spillet. Alt i GameState skal kunne serialiseres (gemmes i IndexedDB).
import type { PressConf } from './press';

export type Lang = 'da' | 'en';
export type Foot = 'R' | 'L' | 'B' | '';

/** Positioner som i CM 01/02 */
export const POSITIONS = ['GK', 'SW', 'D', 'DM', 'M', 'AM', 'ST', 'WB'] as const;
export type PosKey = (typeof POSITIONS)[number];
export const SIDES = ['L', 'C', 'R'] as const;
export type Side = (typeof SIDES)[number];

export type Role = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'WM' | 'AM' | 'W' | 'ST';

export interface Contract {
  wage: number; // ugeløn i €
  expires: string; // ISO-dato
  /** Fremtidig klub (Bosman/pre-contract) */
  futureClub?: number;
  futureWage?: number;
  futureExpires?: string;
}

export interface SeasonStats {
  apps: number;
  subs: number;
  minutes: number;
  goals: number;
  assists: number;
  mom: number;
  yellows: number;
  reds: number;
  ratingSum: number;
  ratingCount: number;
  lgGoals: number;
  lgApps: number;
}

export interface CareerLine {
  season: number;
  club: number;
  apps: number;
  goals: number;
  assists: number;
  avg: number;
}

export interface Injury {
  key: string;
  days: number;
}

export interface Player {
  id: number;
  first: string;
  last: string;
  dob: string;
  nation: number;
  club: number; // 0 = klubløs
  foot: Foot;
  height: number;
  attrs: number[]; // float 1-20, se attributes.ts
  pos: number[]; // 1-20 pr. POSITIONS
  side: number[]; // 1-20 pr. SIDES
  ca: number; // 1-200
  pa: number; // 1-200
  rep: number; // 0-100
  value: number;
  contract: Contract | null;
  condition: number; // 0-100
  morale: number; // 1-20
  form: number[]; // seneste kampkarakterer
  injury: Injury | null;
  banned: number; // karantæne (kampe)
  yellowCount: number; // gule kort mod karantæne
  training: string; // træningsskema-nøgle
  listed: boolean; // transferlistet
  /** Månedlige øjebliksbilleder af attributterne (kun menneskestyrede klubbers spillere) */
  dev?: { d: string; a: number[] }[];
  /** Udbudspris sat af manageren når spilleren er til salg */
  listPrice?: number;
  /** share = andel af lønnen lejeklubben betaler (0-1, standard 1) */
  loan: { from: number; until: string; share?: number; fee?: number; option?: number } | null;
  stats: SeasonStats;
  history: CareerLine[];
  caps: number;
  intGoals: number;
  regen?: boolean;
  notes?: string;
  joined?: string; // dato for ankomst til klub
  /** ikke-tilfredshed pga. spilletid (0-100) */
  unhappy?: number;
  /** Stjerne der vil sælges (ambitiøs spiller i en klub uden succes) */
  wantsAway?: boolean;
  /** Manageren har lovet titler – frist */
  promiseUntil?: string;
  /** Kontraktkrav fra spilleren/agenten efter en god periode */
  demand?: { since: string; wage: number; leaked?: boolean };
  /** Seneste uro i spillerens gruppering (dato) */
  cliqueAlert?: string;
  /** Seneste samtale med manageren (cooldown) */
  lastTalk?: string;
  /** Seneste episode (ballade) og seneste røde kort – grundlag for at straffe */
  lastIncident?: string;
  lastRed?: string;
  /** Kortvarigt "tændt" efter kritik/ros: bonus på stabilitet til og med dato */
  fired?: string;
}

export interface StaffAttrs {
  coaching: number;
  judgingAbility: number;
  judgingPotential: number;
  physio: number;
  motivating: number;
  discipline: number;
  tactics: number;
}

export type StaffRole = 'manager' | 'assistant' | 'coach' | 'physio' | 'scout';

export interface ScoutAssignment {
  kind: 'player' | 'nation' | 'league';
  target: number | string;
  until?: string;
}

export interface Staff {
  id: number;
  first: string;
  last: string;
  nation: number;
  dob: string;
  club: number; // 0 = ledig
  role: StaffRole;
  attrs: StaffAttrs;
  rep: number;
  wage: number;
  expires: string;
  assignment?: ScoutAssignment | null;
  /** AI-managerens foretrukne formation */
  style?: { formation: string; mentality: number };
  /** Trænerkarriere: klubber, trofæer og seneste sæsons form (placering mod forventning) */
  career?: { club: number; from: string; to?: string; why?: 'sacked' | 'poached' | 'left' }[];
  trophies?: number;
  form?: number;
}

export interface ClubFinance {
  gate: number;
  tv: number;
  prize: number;
  sponsor: number;
  merch: number;
  transfersIn: number; // salg
  transfersOut: number; // køb
  wages: number;
  other: number;
}

export interface ClubSeasonHistory {
  season: number;
  league: string;
  pos: number;
  pts: number;
}

export type ProjectKind = 'stadium' | 'training' | 'youth';

export interface ClubProject {
  kind: ProjectKind;
  started: string;
  done: string;
  cost: number;
  amount: number; // nye pladser eller niveau-stigning
}

export interface Club {
  id: number;
  name: string;
  short: string;
  nation: number;
  league: string;
  stadium: string;
  seats: number;
  rep: number; // 0-100
  balance: number;
  transferBudget: number;
  wageBudget: number; // pr. uge
  youth: number; // 1-20
  facilities: number; // 1-20
  colors: [string, string];
  manager: number; // staff-id, -1 = menneske
  tactic: Tactic | null;
  finance: ClubFinance;
  history: ClubSeasonHistory[];
  ticketPrice: number;
  boardTrust?: number;
  /** Igangværende byggeprojekter (stadion, træningsanlæg, ungdomsakademi) */
  projects?: ClubProject[];
  sponsor?: SponsorDeal;
  /** Merchandise-boost efter stjernekøb */
  merchBoost?: { until: string; factor: number };
  /** Financial Fair Play: resultat for seneste sæsoner og evt. straf */
  ffp?: { results: number[]; sanction?: string };
  /** Fansenes humør 0-100 (kun menneskestyrede klubber) og hvad der har påvirket det */
  fanMood?: number;
  fanEvents?: { d: string; k: string; v: number }[];
  /** Modstanderen er ekstra motiveret efter managerens pressemøde (til og med dato) */
  motivatedUntil?: string;
}

export interface TeamInstructions {
  mentality: number; // 0-4 (meget defensiv..meget offensiv)
  passing: number; // 0 kort, 1 blandet, 2 lang
  tempo: number; // 0-2
  width: number; // 0-2
  closingDown: number; // 0-2
  tackling: number; // 0 forsigtig, 1 normal, 2 hård
  marking: 'zonal' | 'man';
  offside: boolean;
  counter: boolean;
}

export interface PlayerInstructions {
  runs: number; // 0 sjældent, 1 blandet, 2 ofte
  runWithBall: boolean;
  longShots: number; // 0-2
  throughBalls: boolean;
  crossing: number; // 0-2
  tightMarking: boolean;
  freeRole: boolean;
}

export interface Slot {
  pos: PosKey;
  side: Side;
  x: number; // 0 (eget mål) .. 100 (modstanderens mål)
  y: number; // 0 (venstre) .. 100 (højre)
}

export interface Tactic {
  formation: string;
  slots: Slot[]; // 11
  lineup: number[]; // spiller-id pr. slot (0 = tom)
  bench: number[];
  team: TeamInstructions;
  individual: PlayerInstructions[]; // pr. slot
  captain: number;
  penalties: number;
  freeKicks: number;
  corners: number;
}

export interface Fixture {
  id: number;
  comp: string;
  date: string;
  home: number;
  away: number;
  round: number;
  stage?: string; // 'group-A', 'R16', 'F', 'PO' ...
  leg?: number;
  tieId?: number;
  result?: MatchResultShort;
}

export interface MatchResultShort {
  hg: number;
  ag: number;
  et?: boolean;
  pens?: [number, number];
  scorers: [number, number, number][]; // [minut, team(0/1), spiller-id]
  att?: number;
}

export interface TableRow {
  club: number;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
  form: string; // fx "WWDLW"
}

export interface Tie {
  id: number;
  a: number;
  b: number;
  legs: number;
  winner?: number;
  stage: string;
  fx: number[];
}

export interface Competition {
  id: string;
  name: string;
  type: 'league' | 'cup' | 'continental' | 'playoff';
  nation: number; // -1 for kontinental
  tier: number;
  clubs: number[];
  table: TableRow[]; // ligaer
  groups?: Record<string, TableRow[]>; // gruppespil / split-faser
  ties: Tie[];
  stage: string;
  finished: boolean;
  /** antal uspillede kampe */
  pending: number;
  winner?: number;
  /** split-liga: fase 2 er genereret */
  splitDone?: boolean;
  playoffFor?: string; // playoff: hvilken liga pladsen gælder
  meta?: Record<string, unknown>;
}

export type NewsCategory = 'general' | 'transfer' | 'match' | 'injury' | 'board' | 'contract' | 'scout' | 'award' | 'finance' | 'job' | 'youth';

export interface NewsItem {
  id: number;
  date: string;
  cat: NewsCategory;
  key: string; // i18n-nøgle for overskrift/tekst
  params: Record<string, string | number>;
  read: boolean;
  /** link til spiller/klub/kamp/tilbud */
  link?: { kind: 'player' | 'club' | 'fixture' | 'offer' | 'comp' | 'awards' | 'press'; id: number | string };
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'negotiating' | 'completed' | 'withdrawn' | 'collapsed';

export interface TransferOffer {
  id: number;
  player: number;
  buyer: number;
  seller: number; // 0 = fri agent
  fee: number;
  loan: boolean;
  status: OfferStatus;
  counter?: number;
  created: string;
  respondBy: string;
  /** For købers kontraktforhandling */
  rounds?: number;
  demand?: { wage: number; years: number };
  preContract?: boolean;
  /** Det højeste en AI-køber vil betale (bruges i prisforhandling) */
  maxFee?: number;
  /** Antal forhandlingsrunder om prisen */
  priceRounds?: number;
  /** Budkrig: en rivaliserende klubs bud på samme spiller */
  rival?: { club: number; fee: number };
  /** Leje med købsoption (pris) */
  option?: number;
}

/** En AI-klub der jagter en spiller (vender tilbage med højere bud) */
export interface Pursuit {
  club: number;
  player: number;
  lastFee: number;
  maxFee: number;
  tries: number;
  next: string;
}

export interface ManagerProfile {
  name: string;
  nation: number;
  rep: number; // 0-100
  history: { season: number; club: number; league: string; pos: number }[];
  trophies: { season: number; comp: string; club: number }[];
  sacked: number;
  /** Indbyrdes resultater mod AI-trænere: staff-id → [V, U, T] */
  rivals?: Record<number, [number, number, number]>;
  /** Klubber der har fyret manageren */
  sackedBy?: number[];
}

export interface BoardState {
  /** Seneste holdmøde */
  lastTeamTalk?: string;
  /** Dato for bestyrelsens seneste kampkommentar */
  lastComment?: string;
  confidence: number; // 0-100
  expectation: string; // nøgle: 'title' | 'top3' | 'tophalf' | 'mid' | 'survive' | 'promotion' | 'playoffs'
  expectedPos: number;
  warnings: number;
}

export interface MatchStatsSide {
  goals: number;
  shots: number;
  onTarget: number;
  xg: number;
  possession: number;
  corners: number;
  fouls: number;
  yellows: number;
  reds: number;
  offsides: number;
  passes: number;
  passesCompleted: number;
}

export interface PlayerMatchLine {
  id: number;
  team: number;
  rating: number;
  goals: number;
  assists: number;
  minutes: number;
  yellow: number;
  red: boolean;
  injured: boolean;
  sub: boolean;
  slot: number;
  shots: number;
  tackles: number;
  passes: number;
  passesOk: number;
  cond: number;
}

export interface MatchEvent {
  m: number;
  t: number; // hold 0/1
  k: string; // 'goal' | 'yellow' | 'red' | 'sub' | 'injury' | 'pen-miss' | ...
  p?: number;
  p2?: number;
}

export interface ShotRecord {
  m: number;
  t: number;
  zone: number;
  xg: number;
  outcome: 'goal' | 'saved' | 'off' | 'blocked';
  p: number;
  kind: string;
}

export interface CommentaryLine {
  m: number;
  k: string;
  a?: string;
  b?: string;
  t?: number;
  hi?: boolean;
}

export interface MatchReport {
  fixture: number;
  home: number;
  away: number;
  stats: [MatchStatsSide, MatchStatsSide];
  players: PlayerMatchLine[];
  events: MatchEvent[];
  shots: ShotRecord[];
  momentum: number[]; // pr. 5 min (+ hjemme, - ude)
  heat: [number[], number[]]; // 15 zoner pr. hold
  zoneControl: number[]; // 15 zoner: andel hjemmebesiddelse
  mom: number;
  commentary: CommentaryLine[];
  et?: boolean;
  pens?: [number, number];
  formations: [string, string];
}

export interface ChallengeState {
  id: string;
  deadlineSeason: number;
  done?: 'won' | 'lost';
}

export interface Options {
  masking: boolean;
  autosave: boolean;
  /** Hvor ofte der gemmes automatisk (standard: efter hver ændring) */
  autosaveMode?: 'changes' | 'daily' | 'weekly' | 'monthly' | 'off';
  matchSpeed: number; // ms pr. kommentarlinje
  fullCommentary: boolean;
  /** Hvilke nyheder om andre klubber man får (standard: kun eget land) */
  newsScope?: 'league' | 'nation' | 'world';
  /** AI-skrevne tekster (pressemøder, samtaler, artikler) – standard: til */
  ai?: boolean;
}

export interface HumanSlot {
  pid: string;
  name: string;
  userClub: number;
  manager: ManagerProfile;
  board: BoardState;
  tactic: Tactic | null;
  savedTactics: Tactic[];
  knowledge: Record<number, number>;
  scoutFinds?: Record<number, string>;
  shortlist: number[];
  news: NewsItem[];
  jobOffers: number[];
  challenge: ChallengeState | null;
  pendingFixture: number | null;
  press?: PressConf | null;
}

export interface GameState {
  version: number;
  id: string; // save-id
  seed: number;
  rng: number;
  date: string;
  season: number; // startår for sæsonen
  lang: Lang;
  userClub: number; // 0 = arbejdsløs
  manager: ManagerProfile;
  board: BoardState;
  options: Options;
  activeNations: number[];
  nations: { name: string; code: string }[];
  leagueOrder: string[];
  leagues: Record<string, { name: string; nation: number; tier: number }>;
  players: Record<number, Player>;
  clubs: Record<number, Club>;
  staff: Record<number, Staff>;
  comps: Record<string, Competition>;
  fixtures: Record<number, Fixture>;
  news: NewsItem[];
  knowledge: Record<number, number>;
  /** Spillere scouterne har afdækket: id → dato */
  scoutFinds?: Record<number, string>;
  shortlist: number[];
  offers: TransferOffer[];
  tactic: Tactic | null; // brugerens taktik
  savedTactics: Tactic[];
  reports: Record<number, MatchReport>;
  seasonHistory: SeasonSummary[];
  challenge: ChallengeState | null;
  names: Record<number, [string[], string[]]>;
  nextId: { player: number; staff: number; news: number; fixture: number; offer: number; tie: number };
  pendingFixture: number | null; // brugerens kamp i dag (ikke spillet)
  dayDone: boolean;
  vacancies: number[]; // klubber uden manager
  /** Hvornår hver stilling blev ledig (klub-id → dato) */
  vacancySince?: Record<number, string>;
  jobOffers: number[];
  lastMonthAward?: string;
  /** Online multiplayer: menneskelige managere og hvem der er "aktiv" lige nu */
  humans?: HumanSlot[];
  active?: string;
  /** Månedens priser i indeværende sæson */
  monthAwards?: MonthAward[];
  /** Øjebliksbillede ved månedens start til månedens priser */
  monthSnap?: { players: Record<number, [number, number, number]>; tables: Record<string, Record<number, number>> };
  /** Sidste handlings-index fra serveren der er indarbejdet i dette øjebliksbillede */
  lastActionIdx?: number;
  pursuits?: Pursuit[];
  /** Ventende pressemøde for den aktive manager */
  press?: PressConf | null;
  /** Kosmetiske AI-tekster (artikler, fanindlæg …) – påvirker ikke spillets regler */
  aiText?: Record<string, string>;
}

export interface SeasonSummary {
  season: number;
  comps: { id: string; name: string; winner: number; runnerUp?: number; topScorer?: [number, number]; best?: number; young?: number; teamOfYear?: number[]; surprise?: { club: number; expected: number; actual: number } }[];
  /** Årets spiller i verden (top 10) */
  ballonDor?: number[];
  ballonDorNames?: [string, number][];
  managerOfYear?: { name: string; club: number; comp: string };
  monthAwards?: MonthAward[];
}

export interface MonthAward {
  month: string; // YYYY-MM
  comp: string;
  player: number;
  manager: number; // klub-id
  managerName: string;
}

export type SponsorKind = 'safe' | 'bonus' | 'ambitious';

export interface SponsorDeal {
  kind: SponsorKind;
  base: number; // pr. måned
  winBonus: number; // pr. ligasejr
  trophyBonus: number; // pr. trofæ / opfyldt mål ved sæsonslut
  season: number;
}
