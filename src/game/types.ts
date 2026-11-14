import type { SquadStatus } from './squadStatus';
// Central datamodel for hele spillet. Alt i GameState skal kunne serialiseres (gemmes i IndexedDB).
import type { PressConf } from './press';
import type { SeasonScore } from './rating';

export type Lang = 'da' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'tr' | 'sv' | 'nb';
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
  /** Klausuler: frikøbsklausul (€), årlig lønstigning (%), bonus pr. kamp og pr. mål (€), lønnedgang ved nedrykning (%) */
  release?: number;
  wageRise?: number;
  appBonus?: number;
  goalBonus?: number;
  relegationCut?: number;
  /** lønstigning ved oprykning (%) og bonus pr. kamp uden indkasserede mål (kun når spilleren spiller) */
  promotionRise?: number;
  cleanSheetBonus?: number;
  /** deltidskontrakt (CM 01/02 Part Time) */
  partTime?: boolean;
  /** CM 01/02 (den originale database i ægte tilstand, 0x85e960): assistbonus (€, kontrakt +0x14) */
  cmAssistBonus?: number;
  /** CM 01/02 kontraktens klausuler +0x1c..+0x20 (1 = aktiv): Non Promotion, Minimum Fee, Non Playing, Relegation, Manager Job Release Clause */
  cmClauses?: number[];
  /** klausulens beløb (€, kontrakt +0x21 – fælles for klausulerne) */
  cmClauseFee?: number;
  /** originalens bonusser i pund (+0x10 mål, +0x14 assist, +0x18 clean sheet; −1 = ingen) – kampværdierne 0x6ec010 læser dem */
  cmBonusGbp?: [number, number, number];
}

/** Klausuler i et kontrakttilbud */
/** CM 01/02 "Go on holiday": hvad assistenten gør imens */
export interface HolidaySettings { rejectAll?: boolean; rejectBelow?: boolean; noBuy?: boolean; applyJobs?: boolean }

export interface ContractClauses {
  /** CM 01/02 Contract Type: deltid (klik på "Full Time") */
  partTime?: boolean;
  /** CM 01/02 Signing On Fee: engangsbeløb ved underskrift (betales med det samme, tæller som løn fordelt over kontrakten) */
  signOn?: number;
  release?: number;
  wageRise?: number;
  appBonus?: number;
  goalBonus?: number;
  relegationCut?: number;
  /** lønstigning ved oprykning (%) og bonus pr. kamp uden indkasserede mål (kun når spilleren spiller) */
  promotionRise?: number;
  cleanSheetBonus?: number;
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
  /** ligaens assists, kampens spiller og karakterer (snit pr. turnering på spillerprofilen – mangler i ældre gemte spil) */
  lgAssists?: number;
  lgMom?: number;
  lgRatingSum?: number;
  lgRatingCount?: number;
  /** landskampe og -mål i denne sæson (spillerprofilens International-række – mangler i ældre gemte spil) */
  intApps?: number;
  intGoals?: number;
}

export interface PlayerMove {
  season: number;
  date: string;
  from: number;
  to: number;
  fee: number;
  loan?: boolean;
  /** Indgik i en byttehandel */
  swap?: boolean;
}

export interface CareerLine {
  season: number;
  club: number;
  apps: number;
  goals: number;
  assists: number;
  avg: number;
  minutes?: number;
  /** På leje i klubben */
  loan?: boolean;
}

export interface Injury {
  key: string;
  days: number;
  /** skadens oprindelige længde (dage) */
  total?: number;
}

export interface Player {
  /** den originale database: omdømmet fra spillerposten [hjemme, nuværende, verden] (0-200) – bruges af originalValue.ts */
  cmRep?: [number, number, number];
  /** originalens spillerdata til computerens holdudtagelse (cmPlayerData.ts; kun den originale database i ægte tilstand): omdømmet efter
   *  spilstartens udfyldning (sub_535a80, 1-200 – ×50 i hukommelsen), Free Role (+0x1a), kampstatistikken pr. kategori 1–6 (PlayerStats-
   *  posterne, 0x7c0d70), formens nibbles (+0x24..+0x26) og kontraktens tællere (+0x3d/+0x3e/+0x3f/+0x44/+0x45, 0x4ca6d0) */
  cmRepMem?: [number, number, number];
  /** originalens 18 INTERNE egenskaber (s8, −125..125) som i spillerposten i hukommelsen, i postens rækkefølge: +0x1e Anticipation,
   *  +0x23 Crossing, +0x24 Decisions, +0x26 Dribbling, +0x27 Finishing, +0x2a Handling, +0x2b Heading, +0x31 Long Shots, +0x32 Marking,
   *  +0x33 Off the Ball, +0x35 One on Ones, +0x37 Passing, +0x38 Penalties, +0x39 Positioning, +0x3a Reflexes, +0x3e Tackling,
   *  +0x41 Throw Ins, +0x43 Creativity (= playerInit.ts INTRINSIC_KEYS / CM_INT_OFFSETS). Vist = display(CA + 2·intern) (sub_544380; målmænd
   *  0,1·CA for Crossing/Creativity/Off the Ball). Sat ved spilstart (sub_535a80 → sub_538ec0/sub_538bc0, playerInit.ts shownFromStored) for den
   *  originale database; opdateret af træningen (cmTraining.ts). Udeladt = ukendt (motoren skønner af de viste). */
  cmInt?: number[];
  cmFree?: number;
  /** staff +0x5e bit 0 (0x4cbb60): 1 reserverne, 2 førsteholdet – skrevet af computerens trupplan 0x83cb40 (0x4cc0b0/0x4cc0f0, cmSquadPlanGame.ts).
   *  Originalens udtagelse udelukker ikke reserverne (Player.reserves er spillets egen); læses af kontraktens 0x4cb250 (cmPlayerData.ts) */
  cmPlace?: number;
  /** TRAINING_MANAGER-posten (6 bytes, cmTraining.ts): skemaet +0, ugen ved sidste opdatering +1, de fem træningseffekter (4 bit) +3/+4/+5 */
  cmTrain?: { s: number; w: number; b3: number; b4: number; b5: number };
  cmStats?: Record<number, number[]>;
  cmForm?: number;
  /** originalens sprogtabel (PlayerStats +0x3c, cmLanguage.ts): sprog (nation +0x77-koden) → flydende 0..10; kun de poster, 0x7c6830 læser */
  cmLang?: Record<number, number>;
  cmContract?: { b3d: number; b3e: number; b3f: number; b44: number; b45: number;
    /** +0x4e (bit 1 transferlistet, bit 2 lejelistet) og +0x4f (trupstatus i høj nibble) – computerens trupplan 0x83cb40 (cmSquadPlan.ts) */
    b4e?: number; b4f?: number };
  /** originalens konditionspost (Injury, 31 bytes pr. spiller – cmFitness.ts; kun den originale database i ægte tilstand) */
  cmFit?: import('./cmFitness').CmFit;
  /** 0x7a7f20: en skade har sluttet karrieren (pensioneres ved sæsonslut) */
  cmRetire?: boolean;
  /** staff +0x1e: anden nationalitet fra den originale database (eller fået efter fem år i Storbritannien, 0x8c7330) – cmPermit.ts */
  cmNation2?: number;
  /** staff +0x3e: datoen han kom til klubben ifølge den originale database – cmPermit.ts */
  cmJoined?: string;
  /** [0xae2d0c] + 79·id + 0xa: originalens "indkøringsbyte" (0..255; spilstarten 0x828110, dagligt 0x5ce2d0, ferie-/skadedage 0x62c680/0x62d250 –
   *  cmPlayerData.ts staffState*); sub_6ec010 trækker den fra kamp-CA'en. Kun den originale database i ægte tilstand. */
  cmStaffState?: number;
  /** staff+0x65: originalens forhold (12 id'er i hukommelsens rækkefølge – cmRelations.ts): +4/+8/+0xc klubber (0x547d60), +0x10/+0x14/+0x18
   *  klubber (0x547d30), +0x1c/+0x20/+0x24 personer (0x547810), +0x28/+0x2c/+0x30 personer (0x547840); 0 = tom plads. Personer = databasens
   *  person-id (Player.id / Staff.cmId). Kun den originale database i ægte tilstand. */
  cmRel?: number[];
  id: number;
  first: string;
  last: string;
  dob: string;
  nation: number;
  club: number; // 0 = klubløs
  foot: Foot;
  /** fødderne 1-20 [venstre, højre] fra den originale database (spillerposten +0x30/+0x3b efter sub_535a80) – kampmotoren og computerens opstilling */
  feet?: [number, number];
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
  /** skader og karantæner i karrieren (klassisk History → Injuries/Bans), nyeste sidst, højst 30 */
  injuryLog?: { d: string; k: string; days: number }[];
  banLog?: { d: string; n: number; red: boolean }[];
  yellowCount: number; // gule kort mod karantæne
  training: string; // træningsskema-nøgle
  listed: boolean; // transferlistet
  /** Månedlige øjebliksbilleder af attributterne (kun menneskestyrede klubbers spillere) */
  dev?: { d: string; a: number[] }[];
  /** Trøjenummer i klubben (Squad Numbers, som i CM 01/02) – unikt i truppen, følger spilleren til det skifter klub */
  number?: number;
  /** Udbudspris sat af manageren når spilleren er til salg */
  listPrice?: number;
  /** den originale database i ægte tilstand: menneskets udbudspris = originalens værdi +0x52 (0x8ce0e0 – cmTransferList.ts), gælder i klubben */
  cmAsk?: { v: number; club: number };
  /** den originale database i ægte tilstand: transferanmodningens nyhed (0xbbf) venter på svar (id) – cmTransferList.ts */
  cmReq?: number;
  /** Status i truppen sat af manageren (Squad Status) og udlejningsliste */
  squadStatus?: SquadStatus;
  loanListed?: boolean;
  /** share = andel af lønnen lejeklubben betaler (0-1, standard 1) */
  loan: { from: number; until: string; share?: number; fee?: number; option?: number } | null;
  stats: SeasonStats;
  history: CareerLine[];
  /** Klubskifter i spillet: hvorhen, hvornår og for hvad */
  moves?: PlayerMove[];
  caps: number;
  intGoals: number;
  regen?: boolean;
  /** originalens genererede fyldspiller (virtual_staff.cpp 0x90dae0/0x90e0a0 – cmVirtual.ts; staff-id ≥ [0xae2364]): findes kun omkring
   *  klubbens kampe og når truppen vises, fjernes ved dagens start. 'active' = klubbens land har spilbare ligaer (nation +0x11c) */
  virtual?: 'active' | 'other';
  /** CM 01/02 "Set Nickname": det rigtige navn, mens et kælenavn bruges i stedet */
  realName?: { first: string; last: string };
  /** CM 01/02 Set Role At Club: spiller/assistent/træner – fortsætter i klubbens stab, når han stopper */
  jobRole?: 'player' | 'assistant' | 'coach';
  notes?: string;
  /** CM 01/02 "Relegate To Reserves": står uden for førsteholdet (kan ikke udtages, før han kaldes op) */
  reserves?: boolean;
  joined?: string; // dato for ankomst til klub
  /** ikke-tilfredshed pga. spilletid (0-100) */
  unhappy?: number;
  /** Stjerne der vil sælges (ambitiøs spiller i en klub uden succes) */
  wantsAway?: boolean;
  /** har anket sin nuværende karantæne (CM 01/02) */
  appealed?: boolean;
  /** Manageren har lovet titler – frist */
  promiseUntil?: string;
  /** Sæsonstatistik allerede bogført på en tidligere klub (ved skifte midt i sæsonen) */
  split?: { apps: number; goals: number; assists: number; minutes: number; ratingSum: number; ratingCount: number };
  /** Kontraktkrav fra spilleren/agenten efter en god periode */
  demand?: { since: string; wage: number; leaked?: boolean };
  /** Seneste uro i spillerens gruppering (dato) */
  cliqueAlert?: string;
  /** Spillerens henvendelse til manageren (klage) der venter på svar, og et løfte om spilletid */
  complaint?: { kind: 'time' | 'morale' | 'press' | 'blocked' | 'renewal'; date: string; club?: number };
  /** Sæson hvor spilleren sidst overvejede at forlænge */
  renewalChecked?: number;
  /** Spilleren vil ikke (eller tøver med at) forlænge sin kontrakt – og hvorfor */
  renewal?: { stance: 'refuses' | 'hesitant'; reason: 'ambition' | 'time' | 'money'; since: string; convinced?: boolean; wageFactor?: number; season: number };
  playPromise?: { until: string; apps: number };
  /** Seneste ros/henvendelse (for ikke at gentage sig) */
  lastContact?: string;
  /** Videresalgsprocent til en tidligere klub (af fortjenesten over base) */
  sellOn?: { club: number; pct: number; base: number };
  /** Ekstra transfersum når spilleren har spillet et antal kampe for køberen */
  addOn?: { club: number; payer: number; fee: number; left: number };
  /** CM 01/02 (0x8cac40/0x8cad90): beløb efter N klub-/landskampe til den sælgende klub; `left` tæller ned (landskampe: caps ved handlen i `caps`) */
  cmApps?: { kind: 'lg' | 'int'; club: number; payer: number; fee: number; left: number; caps?: number }[];
  /** Klausuler i en aftalt Bosman-kontrakt (træder i kraft ved skiftet) */
  futureClauses?: ContractClauses;
  /** Seneste samtale med manageren (cooldown) */
  lastTalk?: string;
  /** Seneste gang manageren sagde "du er fremtiden" */
  toldFuture?: string;
  /** Seneste episode (ballade) og seneste røde kort – grundlag for at straffe */
  lastIncident?: string;
  lastRed?: string;
  /** Rehabilitering af et problembarn/hidsig spiller (0-100; ved 100 falder han til ro: temperament +1) */
  reform?: number;
  /** Kortvarigt "tændt" efter kritik/ros: bonus på stabilitet til og med dato */
  fired?: string;
  /** Navngivet af en supporter (vises med en stjerne) */
  supporterNamed?: string;
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

export type CoachArea = 'fitness' | 'tactics' | 'shooting' | 'skills' | 'goalkeeping';

export type StaffRole = 'manager' | 'assistant' | 'coach' | 'physio' | 'scout';

export interface ScoutAssignment {
  /** CM 01/02: spiller, klub (alle dens kampe), næste modstander, turnering/liga, land, region og ungdomsspillere */
  kind: 'player' | 'nation' | 'league' | 'club' | 'nextOpp' | 'region' | 'youth';
  target: number | string;
  /** Opgaven slutter (scouten vender hjem med en rapport); udeladt = indtil kaldt hjem */
  until?: string;
  since?: string;
  /** næste modstander: rapporten om denne klub er afleveret */
  reported?: number;
  /** Fokus: kun unge eller etablerede spillere */
  focus?: 'any' | 'young' | 'prime';
  /** Søgekriterier: position, attributkrav (index i ATTRS + minimum) og maks. værdi */
  role?: Role;
  attr?: number;
  attrMin?: number;
  maxValue?: number;
  /** Spillere scouten har afdækket på denne tur, og dem han følger lige nu */
  found?: number[];
  queue?: number[];
}

export interface StoryItem { d: string; k: string; w: number; p: Record<string, string | number>; fixture?: number; pid?: number }
export interface SeasonStory {
  season: number; club: number; clubName: string; league: string; pos: number;
  record: [number, number, number]; gf: number; ga: number; top?: { name: string; goals: number };
  items: StoryItem[]; fanMood: number;
}

export interface TrainingCamp {
  dest: string; start: string; end: string; cost: number; status: 'planned' | 'running' | 'done';
  report?: { morale: number; cond: number; bond: number; star?: number; injured?: number; incident?: number; income: number };
}

export interface RecMatch { fixture: number; gf: number; ga: number; opp: number; date: string; comp: string }
export interface RecMove { pid: number; name: string; fee: number; club: number; date: string }
export interface ClubRecords {
  since: string;
  /** spillere, der har spillet for klubben: navn (huskes efter karrieren), kampe og mål */
  players: Record<number, { name: string; apps: number; goals: number; from: string; to?: string; legend?: boolean }>;
  bigWin?: RecMatch;
  bigLoss?: RecMatch;
  topAtt?: { att: number; opp: number; date: string };
  buy?: RecMove;
  sale?: RecMove;
  seasonGoals?: { pid: number; name: string; goals: number; season: number };
  bestFinish?: { season: number; pos: number; league: string; tier: number };
}

export interface Staff {
  /** managerens taktiske egenskaber fra den originale database (ikke-spillerposten): [Attacking, Directness, Free Roles, Marking, Offside,
   *  Pressing, Tactics, yndlingsformation 1..9] – originalens computer-taktik i gittermotoren (aiPrematch/aiTacticChoice) */
  tac?: number[];
  /** den originale databases CA (ikke-spillerposten +4) – de viste stabsegenskaber regnes af den (sub_544410, aiTeam.ts) */
  ca?: number;
  /** ikke-spillerposten i hukommelsen efter originalens spilstart (cmStaffInit.ts, sub_535a80): de 21 bytes +0x0e..+0x22 (de 8 interne
   *  +0x10 +0x11 +0x17 +0x18 +0x19 +0x1b +0x1e +0x21 som interne værdier – vist = sub_544410(CA, intern)) og [21] = +0x43 (formationen).
   *  Kun nye spil med den originale database (world-filen med staff[11]); ellers bruges `tac`/`attrs` som før. */
  cmNp?: number[];
  /** ikke-spillerpostens PA +6 efter spilstarten */
  cmPa?: number;
  /** databasens person-id (staff.dat +0) – forholdene (cmRelations.ts) peger på personer med det */
  cmId?: number;
  /** staff+0x65 som Player.cmRel */
  cmRel?: number[];
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
  /** CM 01/02 Coaches: de træningsområder, træneren står for (udeladt = alle) */
  coachAreas?: CoachArea[];
  /** AI-managerens foretrukne formation */
  style?: { formation: string; mentality: number };
  /** Trænerkarriere: klubber, trofæer og seneste sæsons form (placering mod forventning) */
  career?: { club: number; from: string; to?: string; why?: 'sacked' | 'poached' | 'left' }[];
  trophies?: number;
  form?: number;
  /** tidligere spiller (evt. legende i en klub) */
  exPlayer?: { pid: number; legendOf?: number };
  /** ikke-spillerpostens omdømmer [+8 hjemme, +0xa aktuel, +0xc verden] i hukommelsens skala (1..10000) – cmBoard.ts (kun den originale database) */
  cmRep?: [number, number, number];
  /** personpostens skjulte egenskaber +0x56..+0x5d (Adaptability, Ambition, Determination, Loyalty, Pressure, Professionalism, Sportsmanship,
   *  Temperament) og +0x22 */
  cmHid?: number[];
  /** personpostens +0x3e (ankomstdatoen, ISO) */
  cmJoined?: string;
  /** personpost +0x24/+0x28: landsholdet (nations-id i databasen, −1 = intet) og jobbet dér – viljen 0x844780 (cmBoardInterest.ts) */
  cmNat?: [number, number];
  /** spejderens seneste liste (Scout #n), når søgningen er færdig eller han er kaldt hjem */
  scoutList?: number[];
  /** CM 01/02 (klassisk): Set Nickname og Create Manager Note på en stabsperson */
  nick?: string;
  notes?: string;
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
  // CM 01/02's egne poster (Expenditure): spillerbonusser, signing on fees, udbytte, stadionets drift (før: wages/other)
  bonuses?: number;
  signOn?: number;
  dividends?: number;
  maintenance?: number;
  /** renter af saldoen (Income: Interest) */
  interest?: number;
  /** (cmFinance.ts, original DB i ægte tilstand) Season Tickets, Investments, Other (indtægt), League Fines, Interest (udgift) */
  seasonTickets?: number;
  investments?: number;
  otherIncome?: number;
  fines?: number;
  interestOut?: number;
}

export interface ClubSeasonHistory {
  season: number;
  league: string;
  pos: number;
  pts: number;
  /** Sæsonens økonomi og tilskuere */
  fin?: SeasonFinance;
}

export interface SeasonFinance {
  gate: number; tv: number; sponsor: number; merch: number; prize: number;
  wages: number; sales: number; buys: number; other: number;
  avgAtt: number; seats: number; homeGames: number; ticket: number; balance: number;
}

export type ProjectKind = 'stadium' | 'training' | 'youth';

export interface ClubProject {
  kind: ProjectKind;
  started: string;
  done: string;
  cost: number;
  amount: number; // nye pladser eller niveau-stigning
}

export interface ClubSeasonStats {
  n: number;
  shots: number;
  sot: number;
  xg: number;
  xga: number;
  poss: number;
  cs: number;
  yel: number;
  red: number;
}

export interface Club {
  /** club +0x9b/+0x9f/+0xa3 (0x547790) og +0xa7/+0xab/+0xaf (0x5477d0): klubbens personer (databasens person-id'er, 0 = tom) – cmRelations.ts */
  cmPrefs?: number[];
  id: number;
  name: string;
  short: string;
  nation: number;
  league: string;
  stadium: string;
  seats: number;
  rep: number; // 0-100
  /** originalens værdiformel (kun den originale database): WorldData.valueClub – [cf, landets omdømme, managerens vurdering, manager] */
  vc?: [number, number, number, number];
  /** Squad Numbers (CM 01/02): sæsonen, hvor klubben skal sende sin trøjenummerliste (beskeden 4/8), og de sendte sæsoner */
  sqnDue?: number;
  sqnDone?: number[];
  /** European Squad (CM 01/02): sæsonen, hvor klubben skal tilmelde sin europæiske trup (31/8, 1/2), og de tilmeldte */
  euroDue?: number;
  euroSquad?: { season: number; ids: number[] };
  /** Opsparet omdømmeændring i løbet af sæsonen (brøkdele, før de bliver til hele point) */
  repDrift?: number;
  /** Spillere klubben holder øje med (AI-klubbernes shortliste) */
  shortlist?: number[];
  /** Holdstatistik for sæsonens ligakampe (nulstilles ved sæsonstart) */
  lgStats?: ClubSeasonStats;
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
  /** måneder i træk med negativ saldo (nyheden "financial mess") */
  negMonths?: number;
  /** børsnoteret (CM 01/02: "[klub] become a PLC") */
  plc?: boolean;
  /** placering ved sidste månedsklumme ("climbing to safety" m.m.) */
  columnPos?: number;
  /** udbytte betalt til ejerne ved sidste sæsonstart */
  lastDividend?: number;
  /** CM 01/02's økonomiskærm: tallene ved de seneste månedsskift (This Month / Last Month) – kun menneskestyrede klubber */
  finMonths?: { m: string; f: ClubFinance }[];
  /** sidste sæsons tal (Last Year) */
  lastFinance?: ClubFinance;
  ticketPrice: number;
  boardTrust?: number;
  /** Igangværende byggeprojekter (stadion, træningsanlæg, ungdomsakademi) */
  projects?: ClubProject[];
  /** Klubrekorder (kun menneskestyrede klubber, siden spillets start) */
  records?: ClubRecords;
  /** CM 01/02 klubhistorik: afsluttede sæsoners tal (game/clubHistory.ts; kun menneskeklubber) */
  seasonRecs?: Record<number, import('./clubHistory').SeasonRec>;
  /** Sæson, hvor bestyrelsen har betalt for ekstra ungdomsrekruttering (større og bedre årgang i marts) */
  youthDrive?: number;
  /** Træningslejr (planlagt, i gang eller afsluttet med rapport) og dens løft til holdkemien resten af sæsonen */
  camp?: TrainingCamp;
  campBond?: { season: number; pts: number };
  sponsor?: SponsorDeal;
  /** Merchandise-boost efter stjernekøb */
  merchBoost?: { until: string; factor: number };
  /** Financial Fair Play: resultat for seneste sæsoner og evt. straf */
  ffp?: { results: number[]; sanction?: string };
  /** Draft-liga: logo-skabelon for den fiktive klub */
  crest?: number;
  /** Fansenes humør 0-100 (kun menneskestyrede klubber) og hvad der har påvirket det */
  fanMood?: number;
  /** fanstemningen ved sidste månedsskifte (til sæsonfortællingen) */
  fanMoodPrev?: number;
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
  /** Fast boldfordeler: bolden søger ham på midtbanen (spiller-id, 0 = ingen) */
  playmaker?: number;
  /** Target-angriber: lange bolde og indlæg søger ham (spiller-id, 0 = ingen) */
  targetMan?: number;
  /** Mænd bag bolden: midtbane og backer bliver hjemme, når holdet angriber */
  menBehind?: boolean;
}

export interface PlayerInstructions {
  runs: number; // 0 sjældent, 1 blandet, 2 ofte
  /** CM 01/02's løbepil (højreklik og træk på taktikbanen): pladsen i gitteret, spilleren løber til, når holdet har bolden */
  run?: { x: number; y: number };
  runWithBall: boolean;
  longShots: number; // 0-2
  throughBalls: boolean;
  crossing: number; // 0-2
  tightMarking: boolean;
  freeRole: boolean;
  /** Hold bolden: venter på medspillere i stedet for at spille hurtigt videre */
  holdUp?: boolean;
  /** Spillerens egne indstillinger (udeladt = holdets) */
  passing?: number;
  tackling?: number;
  closingDown?: number;
  /** Dødbolde: 0 bliver hjemme, 1 normal, 2 går med frem i feltet */
  setPieces?: number;
}

export interface Slot {
  pos: PosKey;
  side: Side;
  x: number; // 0 (eget mål) .. 100 (modstanderens mål)
  y: number; // 0 (venstre) .. 100 (højre)
}

export interface Tactic {
  formation: string;
  /** navn på en gemt formation (Save Formation) */
  name?: string;
  slots: Slot[]; // 11
  lineup: number[]; // spiller-id pr. slot (0 = tom)
  bench: number[];
  team: TeamInstructions;
  individual: PlayerInstructions[]; // pr. slot
  captain: number;
  penalties: number;
  /** CM 01/02 Penalty Takers: skytternes rækkefølge (den første på banen tager straffespark, og den bruges i straffesparkskonkurrencen) */
  penOrder?: number[];
  freeKicks: number;
  /** frispark fra højre (CM 01/02 Free Kicks (R)); ellers freeKicks */
  freeKicksR?: number;
  corners: number;
  /** hjørnespark fra højre; ellers corners */
  cornersR?: number;
  /** Instruktioner mod modstanderen – gælder kun kampen med dette id */
  opp?: OppInstructions;
  /** CM 01/02 With Ball / Without Ball: taktikkens positionsgitter (taktikfilens blok +0x164), kun når brugeren har flyttet en position.
   *  Gælder kun, så længe pladsernes masker er `positions.masks` (ellers bruges formationens forudindstilling som før). */
  positions?: TacticPositions;
}

/** Taktikfilens grove positionsgitter (+0x164) og pladsernes masker (+0x12d/+0x14e) – se engine/grid/tacticPositions.ts */
export interface TacticPositions {
  /** pr. plads 24 punkter: indeks 12·medBold + 4·boldzoneX (0..2) + boldzoneY (0..3) → x | y << 8 (x 0..26 venstre → højre, y 0..35 fra eget mål) */
  posts: number[][];
  /** pladsernes masker (+0x12d) */
  masks: number[];
  /** de sekundære masker (+0x14e) */
  masks2: number[];
  /** forudindstillingen (indeks i PRESET_TACTICS), gitteret blev taget fra, og hver plads' nummer i den */
  preset?: number;
  presetSlot?: number[];
}

export type OppKind = 'tight' | 'press' | 'hard' | 'weakFoot';
export interface OppInstructions {
  fixture: number;
  /** højst tre af modstanderens spillere */
  targets: { pid: number; kind: OppKind }[];
  /** angrib især denne side (0 venstre, 1 centralt, 2 højre – set fra os) */
  focusLane?: number;
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
  /** (runde 10A) tidspunktet på dagen i originalens kalender: 0 formiddag, 1 eftermiddag, 2 aften (skemaets +4 / tv-pladsen) */
  slot?: number;
  /** (kalenderen, runde 10C) originalens fixture-koder fra turneringens rundetabel (Cup-runden +0x07/+0x09/+0x0d/+0x0f/+0x17, skemaet) –
   *  sat, når kampen oprettes efter originalens format (kun den originale database i ægte tilstand); gameInputs.ts fixtureCodesOf bruger dem
   *  før afbildningen af spillets egne formater. w30 = fixture +0x30 (runde-id, +3/+4 for første/andet ben), w32 = +0x32 (stage-id), b34 =
   *  +0x34 (rundens indeks), b3a = +0x3a (kamptypen), b3c = +0x3c (neutral bane), f38 = +0x38 (kampflag ved oprettelsen), f38dec = rundens
   *  +0x0f (flag for den afgørende kamp: OR'es ind i andet ben, når første ben er spillet / omkampens flag) */
  cm?: { w30: number; w32?: number; b34: number; b3a: number; b3c?: number; f38: number; f38dec?: number;
    /** (runde 10D) pokalernes omkampe: omkampens nummer, tilladte omkampe (+0x20), dage til omkampen (+0x22), flagene for omkamp 1/2 (+0x0f/+0x11) */
    rep?: number; reps?: number; days?: number; fRep?: number[] };
}

export interface MatchResultShort {
  hg: number;
  ag: number;
  et?: boolean;
  pens?: [number, number];
  scorers: ([number, number, number] | [number, number, number, 1])[]; // [minut, team(0/1), spiller-id, 1 = selvmål]
  att?: number;
  /** Hjemmeholdets billetindtægt (efter deling i pokalkampe) */
  gate?: number;
  /** kort i kampen [gule, røde] (CM 01/02 Referee Stats; ikke i ældre gem) */
  cards?: [number, number];
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
  link?: { kind: 'player' | 'club' | 'fixture' | 'offer' | 'comp' | 'awards' | 'press' | 'chat'; id: number | string };
  /** Ugentligt transferoverblik: ugens handler mellem andre klubber */
  deals?: TransferDeal[];
  /** Dæmpet kategori: markeret som læst og kun vist, når man filtrerer på kategorien */
  muted?: boolean;
}

export interface TransferDeal { player: number; from: number; to: number; fee: number; loan?: boolean }

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
  /** Klausuler i buddet: videresalgsprocent til sælger og ekstra beløb efter 25 kampe */
  sellOn?: number;
  addOn?: number;
  /** Lukket budrunde mellem managere om samme spiller */
  auction?: boolean;
  /** budkrig mellem managere: fri spiller/Bosman (auction bruges for spillere i AI-klubber) */
  war?: boolean;
  /** buddet er hævet i budkrigen (kun én gang) */
  raised?: boolean;
  /** Tabte budrunden til en anden manager */
  outbid?: boolean;
  /** Byttehandel: spillere fra køberen, der indgår i handlen */
  swap?: number[];
  /** Multiplayer: et kontrakttilbud til en fri spiller (eller Bosman), som spilleren svarer på dagen efter */
  signing?: { wage: number; years: number; clauses?: ContractClauses };
  /** live-forhandling: antal bud i samme forhandling, og om klubben har sagt 'ikke til salg' */
  bidRounds?: number;
  nfs?: boolean;
  /** CM 01/02 (cmTransferBid.ts, kun den originale database i ægte tilstand): månedlige rater (+0x40), beløb efter N ligakampe (+0x35/+0x39)
   *  og landskampe (+0x3a/+0x3e), offentligt bud (+0x2d: 2 ja, 1 låst ja) og et modbud med klausuler */
  months?: number;
  lgFee?: number;
  lgApps?: number;
  intFee?: number;
  intApps?: number;
  pub?: 1 | 2;
  cmCounter?: import('./cmTransferBid').BidTerms;
  /** buddet er endeligt (timing-nibble 2, 0x8c0810) */
  final?: boolean;
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

export interface JobTalk {
  stage: 'applied' | 'offer';
  /** applied: hvornår klubben svarer, og om svaret bliver ja */
  answerOn?: string;
  ok?: boolean;
  exp: string;
  expectedPos: number;
  budget: number;
  wageBudget: number;
  /** Hvad man allerede har forhandlet om */
  asked: ('budget' | 'exp')[];
}

export interface ManagerProfile {
  name: string;
  nation: number;
  rep: number; // 0-100
  /** Seneste jobtilbud (mens man er i job) – der går mindst et par måneder mellem dem */
  lastJobOffer?: string;
  history: { season: number; club: number; league: string; pos: number }[];
  trophies: { season: number; comp: string; club: number }[];
  sacked: number;
  /** originalens menneskerække (cmBoard.ts): ikke-spillerpostens omdømmer [+8, +0xa, +0xc], ankomstdato +0x3e og +0x59 */
  cmRep?: [number, number, number];
  cmJoined?: string;
  cmB59?: number;
  /** Indbyrdes resultater mod AI-trænere: staff-id → [V, U, T] */
  rivals?: Record<number, [number, number, number]>;
  /** Klubber der har fyret manageren */
  sackedBy?: number[];
  /** Afviste jobtilbud: klub-id → dato (klubben spørger ikke igen foreløbig) */
  declinedJobs?: Record<number, string>;
  /** Jobsamtaler: søgte stillinger (venter på svar) og tilbud med vilkår, man kan forhandle om */
  jobTalks?: Record<number, JobTalk>;
  /** landstrænerjob (CM 01/02: man kan træne et landshold ved siden af klubben) og et åbent tilbud */
  national?: { nation: number; since: string; played: number; won: number; picks?: number[]; form?: number[] };
  /** på ferie (CM 01/02) – assistenten svarer på bud efter indstillingerne */
  holiday?: HolidaySettings;
  nationalOffer?: number;
  /** Svar på forespørgsler om spillere: spiller-id → klubbens pris (nfs = ikke til salg under prisen) */
  enquiries?: Record<number, { date: string; club: number; fee: number; nfs: boolean }>;
  /** Forholdet til pressen (0-100, start 50) og et løfte om sejr givet på et pressemøde */
  media?: number;
  pressRecent?: string[];
  pressPromise?: { fixture: number; opp: number };
  /** Manager Score pr. sæson (ranglister) og udgangspunktet for den igangværende sæson */
  scores?: SeasonScore[];
  /** Præstationer: id → dato for oplåsning, og tællere til dem */
  ach?: Record<string, string>;
  achStats?: { wins: number; streak: number; unbeaten: number; lastPromotion?: number };
  /** Sæsonfortælling: årets vendepunkter (igangværende) og tidligere sæsoners kort */
  story?: { season: number; items: StoryItem[] };
  stories?: SeasonStory[];
  /** Prøvespillere (op til tre ad gangen) og venskabskampe */
  trials?: { pid: number; start: string; end: string; startK: number }[];
  friendlies?: { opp: number; date: string; kind: 'easy' | 'big'; done?: boolean; result?: [number, number] }[];
  /** Første arbejdsdag: opgaver og assistentens oplæg */
  onboard?: { weak?: boolean; style?: string; needs?: string[]; briefed?: boolean; plan?: { weakest: string; style: string; fit: number; bestStyle: string; targets: Record<string, number[]> } };
  /** Managerprofil: motto (vises på den offentlige profil) */
  motto?: string;
  /** Til ugens overblik: placering og saldo sidste mandag */
  week?: { pos: number; balance: number };
  seasonStart?: { season: number; club: number; balance: number; sacked: number };
}

export type BoardAsk = 'lowerExp' | 'confidenceVote' | 'youthDrive';

export interface BoardState {
  /** Ungdomschefens rapport om den kommende årgang */
  youthPreview?: { season: number; verdict: 'golden' | 'good' | 'average' | 'poor'; n: number; standout?: string; wonderkid?: boolean };
  /** Årets ungdomsårgang (ungdomsdagen) */
  lastIntake?: { season: number; ids: number[]; verdict: 'golden' | 'good' | 'average' | 'poor' };
  /** Seneste holdmøde */
  lastTeamTalk?: string;
  /** Seneste rygte om interesse for ens spillere */
  lastRumour?: string;
  /** Dato for bestyrelsens seneste kampkommentar */
  lastComment?: string;
  /** Spillere bestyrelsen allerede har kommenteret som dyre bænkevarmere (spiller-id → sæson) og seneste advarsel om lønsummen */
  wasteNoted?: Record<number, number>;
  lastWageWarning?: string;
  confidence: number; // 0-100
  /** Seneste svar på budgetanmodninger (måned pr. type) og et åbent modbud */
  budgetAsked?: { transfer?: string; wage?: string };
  /** CM 01/02: kampen, man sidst har klaget over dommeren i (én klage pr. kamp) */
  faComplained?: number;
  /** CM 01/02: antal FA-anmodninger i sæsonen (gentagne afvises – originalens tekster) */
  faAsked?: { season: number; referee: number; postpone: number };
  budgetCounter?: { kind: 'transfer' | 'wage'; pct: number; until: string };
  /** Seneste svar på de øvrige ønsker til bestyrelsen (dato pr. ønske) */
  asked?: Partial<Record<BoardAsk, string>>;
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
  /** CM 01/02's kampstatistik (ikke i ældre rapporter) */
  throwIns?: number;
  tackles?: number;
  tacklesWon?: number;
  headers?: number;
  headersWon?: number;
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
  /** CM 01/02's Team Stats (ikke i ældre rapporter): tacklingsforsøg, hovedstød (forsøg/vundne), skud på mål */
  tckA?: number;
  hea?: number;
  heaW?: number;
  on?: number;
}

export interface MatchEvent {
  m: number;
  t: number; // hold 0/1
  k: string; // 'goal' | 'yellow' | 'red' | 'sub' | 'injury' | 'pen-miss' | ...
  p?: number;
  p2?: number;
  /** selvmål: p er forsvareren, t er holdet der fik målet */
  og?: boolean;
  /** mål på straffespark */
  pen?: boolean;
}

export interface ShotRecord {
  m: number;
  t: number;
  zone: number;
  xg: number;
  outcome: 'goal' | 'saved' | 'off' | 'blocked' | 'offside';
  p: number;
  kind: string;
  /** skuddet kom efter et hjørnespark taget af denne spiller */
  corner?: number;
  /** hvordan chancen opstod: counter, through, cross, dribble, press */
  origin?: string;
  /** ramte stolpen/overliggeren */
  post?: boolean;
  /** redningen: målmanden griber, slår ud (returbold), taber bolden eller tipper den til hjørnespark */
  save?: 'hold' | 'parry' | 'spill' | 'corner';
  /** forsvareren, der blokerede skuddet (eller lavede selvmål) */
  blocker?: number;
  /** selvmål: forsvareren der fik bolden i eget net (p er stadig den, der skød/slog indlægget) */
  og?: number;
  /** opspillet lige før afslutningen (2D): layoff, knockdown, lowcross, longthrow, shortcorner, edge, holdup – og hvem der lavede det */
  setup?: string;
  setupBy?: number;
}

export interface CommentaryLine {
  m: number;
  k: string;
  a?: string;
  b?: string;
  t?: number;
  hi?: boolean;
  /** originalens begivenhed (navnet uden EVENT_ i matchTexts.json) og varianten, som originalens kommentarkø valgte (gittermotoren, grid/matchEvents.ts) */
  ev?: string;
  v?: number;
  /** side2 (holdet for <t2>; mangler = modstanderen) og extra (<d>/<N>: yards, minutter …) */
  t2?: number;
  x?: number;
}

export interface MatchReport {
  fixture: number;
  /** gittermotoren: kampens tilskuertal sub_85cba0 (samme tal bruges af økonomien) */
  crowd?: number;
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
  /** sparkene i straffesparkskonkurrencen, i rækkefølge (hold, skytte, målmand, udfald) */
  shootout?: ShootoutKick[];
  /** vejret under kampen (se weather.ts) */
  weather?: string;
  /** Banens tilstand og dagens dommer */
  pitch?: string;
  referee?: { name: string; strict: number };
  /** taktiske ændringer undervejs */
  changes?: TacticChange[];
  formations: [string, string];
  /** kampmotoren, der spillede kampen (fejlsøgning): 'original' = gittermotoren; mangler = 'zone' (vores zonemotor) */
  engine?: 'zone' | 'original';
  /** gittermotorens kamprapport efter slutfløjt (originalens 0x6d1cc0/0x6d26b0, engine/grid/postMatch.ts) – cmPlayerData.ts cmApplyPost */
  cmPost?: CmPostResult;
  /** udskiftere, der ikke kom på (CM 01/02 Player Ratings viser dem grå), og anføreren pr. hold – ikke i ældre rapporter */
  bench?: [number[], number[]];
  capt?: [number, number];
  /** trøjenumrene ved kampen (kun rapporter pakket ud af MiniReport) */
  nums?: Record<number, number>;
}

/** Kompakt kamprapport for computerklubbernes kampe (miniReport.ts) – nok til CM 01/02's kampskærm efter slutfløjt:
 *  s = holdstatistik, p = spillerlinjer pr. hold [id, karakter, mål, assists, flag, skud, tacklinger, afl., afl. ok, kondition, nr, tckA, hea, heaW, on], b = ubrugte udskiftere [id, nr, …], e = begivenheder [m, t, art, p, p2, flag, …],
 *  z = Action Zones (bolden pr. tredjedel og hold), so = straffesparkskonkurrencen [t, p, gk, udfald, …] */
export interface MiniReport {
  s: [number[], number[]];
  p: [number[][], number[][]];
  b: [number[], number[]];
  e: number[];
  z: number[];
  mom: number;
  c: [number, number];
  so?: number[];
}

/** originalens kamprapport (postMatch.ts): moralen (MATCH_PLAYER +0x17) og omdømmet [+9, +0xb, +0xd] i hukommelsens skala pr. spiller-id,
 *  klubbernes omdømme (engine+0x1d6, null = ikke regnet) og dommerens karakter (0x6d4a20) */
export interface CmPostResult {
  players: Record<number, { morale: number; rep: [number, number, number] }>;
  clubRep: [number | null, number | null];
  referee: number | null;
  /** 0x6d3610: managerens nye [+0xa, +8, +0xc] pr. side (0x6b6cc0 → cmBoardGame.ts cmManagerRepPost) */
  managers?: [[number, number, number] | null, [number, number, number] | null];
}

export interface TacticChange { m: number; t: number; kind: 'formation' | 'mentality' | 'instructions'; from?: string; to?: string }

export interface ShootoutKick { t: number; p: number; gk: number; outcome: 'goal' | 'saved' | 'off' }

export interface ChallengeState {
  id: string;
  deadlineSeason: number;
  /** udfordringens klub (målet gælder den, også hvis manageren skifter job) */
  club?: number;
  done?: 'won' | 'lost';
}

export interface Options {
  /** online: minutter pr. halvleg i kampe mellem to managere (fast tempo) */
  h2hHalfMinutes?: number;
  masking: boolean;
  autosave: boolean;
  /** Hvor ofte der gemmes automatisk (standard: efter hver ændring) */
  autosaveMode?: 'changes' | 'daily' | 'weekly' | 'monthly' | 'off';
  matchSpeed: number; // ms pr. kommentarlinje
  fullCommentary: boolean;
  /** Hvilke nyheder om andre klubber man får (standard: kun eget land) */
  newsScope?: 'league' | 'nation' | 'world';
  /** Transfernyheder om andre klubber: kun egen klub, store handler i egen liga (standard) eller alle (efter nyhedsfilteret) */
  transferNews?: 'own' | 'big' | 'all';
  /** Dæmpede nyhedskategorier (vælges i indbakken) */
  mutedNews?: NewsCategory[];
  /** Transfervinduer: rigtige (sommer + januar, standard) eller næsten hele året som i CM 01/02 */
  transferWindows?: 'real' | 'classic';
  /** Højdepunkter i 2D: kun mål, store chancer (standard) eller alt (også små chancer, offside, kort og skader) */
  highlights?: 'goals' | 'big' | 'all';
  /** Kampregler: moderne (5 udskiftninger, 9 på bænken) eller klassiske CM-regler (3 og 5). Standard: moderne – klassisk med CM 01/02-databasen */
  rules?: 'modern' | 'classic';
  /** spiltilstand: 'authentic' = så tæt på CM 01/02 som muligt (kun originalens funktioner), 'extended' (standard) = alt */
  mode?: 'authentic' | 'extended';
  /** AI-skrevne tekster (pressemøder, samtaler, artikler) – standard: til */
  ai?: boolean;
  /** Kampmotor: 'zone' (standard, vores egen) eller 'original' (porten af originalens motor – kun original database i ægte
   * tilstand, se gridEngineOn i sim.ts). Gamle gemte spil = 'zone'. */
  engine?: 'zone' | 'original';
}

export type BotStyle = 'ambitious' | 'developer' | 'trader' | 'pragmatic';

export interface HumanSlot {
  pid: string;
  name: string;
  /** AI-manager der spiller som et menneske (samme handlinger) */
  bot?: { style: BotStyle; lastDay?: string };
  /** Spilleren nåede ikke at trykke Klar: assistenten styrer dette træk */
  autopilot?: boolean;
  autopilotDay?: string;
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
  matchTalk?: MatchTalk | null;
  /** Seneste læste chatbesked (id) */
  chatRead?: number;
  transferDigest?: TransferDeal[];
}

export interface GameState {
  /** originalens tilstand til computerens holdudtagelse (cmPlayerData.ts): spillets karaktersnit [sum, antal] (PlayerStats +0x10/+0x18),
   *  klubbernes og landenes rå omdømme fra databasen (club +0x80, nation +0x8e) og taktiklistens statistik (0x896290, 45 poster) */
  cmRatingAvg?: [number, number];
  /** [0xae2d14] + 6·klub + 4: klubbens stemning (0x5cd61d, ugentligt – cmPlayerData.ts clubMood) */
  cmClubMood?: Record<number, number>;
  /** TRAINING_MANAGER +0x688d: ugetælleren (0x8b1730 – dag-i-året % 7 = 0) */
  cmTrainWeek?: number;
  cmClubRep?: Record<number, number>;
  /** (runde 12) Staff_Records: turneringer, hvis sæsonslut er behandlet (id → sæson) – cmMedia.ts cmRecordsDaily */
  cmRecDone?: Record<string, number>;
  /** originalens bestyrelse og managerjob (cmBoard.ts/cmBoardGame.ts – kun den originale database i ægte tilstand): MANAGER_MANAGER's poster og lister */
  cmBoard?: import('./cmBoard').CmBoardState;
  /** formændene (world.cmRaw.chair: [np +0x16, np +0x1d Patience, staff +0x57 Ambition, nation]) og nationernes +0x75/+0x85/+0x88 */
  cmChair?: Record<number, [number, number, number, number]>;
  cmNationBoard?: [number, number, number][];
  /** [0xdd6ec8] spillets start (ISO) */
  cmBoardStart?: string;
  /** club.dat +100/+119 (status, mindste tilskuertal) og club_comp.dat +105 (turneringens omdømme) – computerens trupplan (cmSquadPlanGame.ts) */
  cmClubStat?: Record<number, [number, number] | [number, number, number, number]>;
  /** (økonomien, cmFinance.ts) originalens Finance-post pr. klub (pund), databasens felter [division, PLC, stadion +0x4c/+0x4d],
   *  nation +0x85, "A Lower Division", tilhængernes tillid (MANAGER_MANAGER +8) og spilstartens år */
  cmFin?: Record<number, import('./cmFinance').CmFinRec>;
  /** CM 01/02: transfersummens resterende månedlige rater (TRANSFER_MANAGER +0x872, 0x8caee0) */
  cmInstalments?: { amount: number; buyer: number; seller: number; left: number; player: number }[];
  cmFinRaw?: Record<number, number[]>;
  cmLowerDiv?: number;
  /** viljen 0x844780 (cmBoardInterest.ts): nation +0x71 (verdensdelens id) pr. nationsindeks, "Europe"s id, byernes +0x33 og klubbernes
   *  mål-omdømme Shortlist_Manager +0xdc[9·klub]+5 (0x83bf40, skrevet når computerens trupplan 0x83cb40 kører) */
  cmNationCont?: number[]; cmEurope?: number; cmCity33?: number[]; cmTargetRep?: Record<number, number>;
  cmSup?: Record<number, number>;
  cmFinStartYear?: number;
  cmCompRep?: Record<number, number>;
  /** (runde 9) tilskuertallet sub_85cba0 (crowd.ts): pr. klub [gns., mindst, højst, stadion-id, by-id, stadionets kapacitet +0x3c (init kan hæve den),
   *  rival 1–3] (club.dat 115/119/123/105/179–187, stadium.dat +56/+60), byernes koordinater (city.dat +0x23/+0x2b fladt) og nation +0x7e */
  /** (kalender runde 10C) originalens UEFA-seeding (cmEurope.ts): landenes seks sæsonkoefficienter (nation +0xe0..+0x108), sæsonens point/
   *  deltagere og titelforsvarerne */
  cmUefa?: import('./cmEurope').CmUefaState;
  /** (runde 10C) de europæiske kampe før spillets start skal spilles (forkørslen – cmEurope.ts cmEuroCatchUp) */
  cmEuroCatchUp?: boolean;
  cmCrowd?: Record<number, [number, number, number, number, number, number, number, number, number]>;
  cmCities?: number[];
  cmNation7e?: number[];
  /** nation +0x85 pr. nationsindeks (staffStatens ungdomsled 0x5ce8f0 – cmPlayerData.ts) */
  cmNation85?: number[];
  /** nation +0x76 pr. nationsindeks (sprog-/regionsgruppen – lønnen 0x862720, cmWageGame.ts) */
  cmNation76?: number[];
  /** computerens trupplan 0x83cb40 pr. klub: de 40 pladser [rolle, maske, +0x24, +0xf, +0x13, +0x17, +0x23, dag, år], +4, +7, +8 */
  cmPlan?: Record<number, { s: [number, number, number, number, number, number, number, number, number][]; st: number; fm: number; c: number }>;
  /** spillets startdato ([0xdd6ec8]) */
  cmStart?: string;
  cmNationRep?: number[];
  aiTacticStats?: { games: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number; perf: [number, number, number] }[];
  /** konditionsmodulet (cmFitness.ts): spillets startdato [0xdd6ec8] og sygdomsudbruddene (Injury +0x1c, 17-bytes poster) */
  cmFitStart?: string;
  /** (forsæsonen) originalens hjemlige venskabskampe, der venter på at blive oprettet en uge før datoen (Friendly +0x34d8 – cmFriendly.ts) */
  cmFrPending?: { d: string; h: number; a: number }[];
  cmOutbreaks?: import('./cmFitness').CmOutbreak[];
  /** originalens arbejdstilladelses-historik (TRANSFER_MANAGER +0x93a, cmPermit.ts): staff-id → [kampe spillet, ikke spillet, året, landet] */
  cmPermit?: Record<number, import('./cmPermit').PermitEntry>;
  /** [0xae2d14] + 6·klub +5 (cmPlayerData.ts): truppens utilfredse nøglespillere – 0x5cccd0 hver 7. dag */
  cmClubUnhappy?: Record<number, number>;
  version: number;
  /** Prisniveau (2001-priser i den originale database, se econ.ts) – mangler = nutidens priser */
  econ?: import("./econ").Economy;
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
  /** lang = nation.dat +0x77/+0x78/+0x79 (den originale database – cmLanguage.ts) */
  nations: { name: string; code: string; lang?: number[] }[];
  leagueOrder: string[];
  leagues: Record<string, { name: string; nation: number; tier: number; hidden?: boolean }>;
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
  /** startopstillingen fra brugerens seneste kamp (klassisk Last Match) */
  lastMatchTactic?: Tactic;
  /** reserveholdets udtagelse (klassisk truppen → Reserves) – påvirker ikke reservekampene */
  resTactic?: Tactic;
  savedTactics: Tactic[];
  reports: Record<number, MatchReport>;
  /** computerklubbernes kampe i den aktuelle sæson (kompakte rapporter, miniReport.ts) – ryddes med kampprogrammet i prune() */
  miniReports?: Record<number, MiniReport>;
  seasonHistory: SeasonSummary[];
  /** turneringernes rekorder pr. afsluttet sæson (compHistory.ts): turnering → sæson → rekorder */
  compRecs?: Record<string, Record<number, import('./compHistory').CompSeasonRec>>;
  challenge: ChallengeState | null;
  names: Record<number, [string[], string[]]>;
  /** Supporternes regen-navne (hentet fra serveren) og hvilke der allerede er brugt i dette spil */
  supporterRegens?: { first: string; last: string; by: string; used?: boolean }[];
  /** pensionerede stjerner, der "genopstår" som regens ved næste ungdomsårgang (CM 01/02) */
  regenQueue?: RegenSeed[];
  /** landsholdsfodbold: resultater, slutrunde og historik (international.ts) */
  intl?: import('./international').IntlState;
  nextId: { player: number; staff: number; news: number; fixture: number; offer: number; tie: number };
  pendingFixture: number | null; // brugerens kamp i dag (ikke spillet)
  /** CM 01/02: kontrakttilbud til egne spillere – svaret kommer som nyhed næste dag */
  pendingRenewals?: { pid: number; club: number; wage: number; years: number; clauses?: ContractClauses; date: string }[];
  /** CM 01/02 (cmStaff.ts, original DB i ægte tilstand): kontrakttilbud til stabsfolk – svaret kommer som nyhed næste dag */
  cmStaffOffers?: import('./cmStaff').CmStaffOffer[];
  /** Lokalt spil mod AI-managere (ingen server): værten spiller sine kampe live */
  localMp?: boolean;
  /** Beskeder mellem managere, der går gennem spillet (AI-managere og lokale spil) */
  chat?: ChatMsg[];
  /** Multiplayer: tilbud til staff, der afgøres dagen efter */
  staffBids?: { staff: number; club: number; date: string; wage?: number; war?: boolean; raised?: boolean }[];
  /** Stikpiller i pressen mellem managere */
  jabs?: { id: number; from: string; to: string; date: string; line: number; text: string; fixture?: number; resolved?: boolean }[];
  /** Prestige-væddemål om næste indbyrdes kamp */
  bets?: { id: number; from: string; to: string; fixture: number; amount: number; status: 'proposed' | 'accepted' | 'declined' | 'settled' | 'void'; date: string }[];
  chatRead?: number;
  /** Andre klubbers handler samlet til ugens transferoverblik */
  transferDigest?: TransferDeal[];
  /** Indbyrdes regnskab mellem managere (nøgle "pidA|pidB", sorteret) */
  h2h?: Record<string, H2HRecord>;
  /** Holdsnak til dagens kamp (før kampen / i pausen / efter kampen) */
  matchTalk?: MatchTalk | null;
  dayDone: boolean;
  vacancies: number[]; // klubber uden manager
  /** Hvornår hver stilling blev ledig (klub-id → dato) */
  vacancySince?: Record<number, string>;
  jobOffers: number[];
  lastMonthAward?: string;
  /** Online multiplayer: menneskelige managere og hvem der er "aktiv" lige nu */
  /** engangsrettelser, der er kørt på dette gem (save.ts) */
  fixes?: string[];
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
  /** Databasen spillet er startet fra (udeladt = den moderne) og dens ligaregler */
  dbKind?: 'cm0102';
  /** den originale databases udgave ('3.9.60' | '3.9.65' | '3.9.68'); mangler = 3.9.60 (eller 3.9.68 i meget gamle spil) */
  dbVersion?: string;
  /** Sæsonen databasen startede i (2001 = den originale 01/02, 2026 = October 2026-opdateringen) */
  dbYear?: number;
  /** dommere fra databasen (officials.dat): [fornavn, efternavn, nation, Discipline 0-20 (0 = ikke vurderet), 0x27, omdømme] */
  officials?: [string, string, number, number, number, number][];
  customRules?: Record<string, import('./leagues').LeagueRules>;
  /** Kosmetiske AI-tekster (artikler, fanindlæg …) – påvirker ikke spillets regler */
  aiText?: Record<string, string>;
  /** Draft-liga: fiktive klubber draftet fra de 500 bedste spillere (ingen økonomi, transfers eller staff) */
  draft?: DraftInfo;
}

export interface DraftSettings {
  /** Antal gange hvert hold møder hinanden */
  rounds: number;
  playoff: 'none' | 'final' | 'semis';
  /** Spillere hvert hold må beholde til næste sæsons draft */
  keepers: number;
  injuries: boolean;
  /** Draftform: skiftevis (snake) eller auktion med budget */
  format?: 'snake' | 'auction';
  /** Spillerpulje: tom = hele verden, en ligas id (fx 'DK1') eller en nationalitet ('n:<nationens indeks>') */
  pool?: string;
}

export interface DraftHistoryEntry {
  season: number;
  champion: number;
  runnerUp?: number;
  playoffWinner?: number;
  topScorer?: { name: string; goals: number; club: number };
  table: { club: number; pts: number; gd: number }[];
}

export interface DraftAllTime { club: number; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number; titles: number; playoffs: number }

export interface DraftInfo {
  settings: DraftSettings;
  /** Draft-sæson (1, 2, …) */
  season: number;
  history: DraftHistoryEntry[];
  allTime: Record<number, DraftAllTime>;
  seasonOver?: boolean;
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

export type TalkStage = 'pre' | 'half' | 'post';
export type TalkTone = 'noPressure' | 'motivate' | 'demand' | 'focus' | 'passionate' | 'praise' | 'calm' | 'criticise' | 'disappointed';
export type TalkReaction = 'fired' | 'focused' | 'neutral' | 'complacent' | 'nervous' | 'angry' | 'deflated';

export interface MatchTalk {
  fixture: number;
  /** Faktor pr. spiller til kampmotoren (fra seneste snak før/under kampen) */
  boosts: Record<number, number>;
  done: TalkStage[];
}

/** Besked mellem managere. Tekst fra mennesker, eller en tekstnøgle (AI-managere) så den vises på læserens sprog */
export interface ChatMsg {
  id: number;
  from: string;
  to: string;
  date: string;
  text?: string;
  key?: string;
  params?: Record<string, string | number>;
}

/** Indbyrdes regnskab mellem to managere – set fra den første (a) i nøglen */
export interface H2HRecord {
  a: string; b: string;
  w: number; d: number; l: number;
  gf: number; ga: number;
  /** Største sejr for hver: [mål for, mål imod, dato] */
  bestA?: [number, number, string];
  bestB?: [number, number, string];
  last?: { date: string; fixture: number; gf: number; ga: number; comp: string };
}

/** Det en regen arver fra den pensionerede spiller: land, positioner, ben, potentiale og egenskabsprofil */
export interface RegenSeed { from: string; nation: number; pos: number[]; side: number[]; foot: 'L' | 'R' | 'B'; pa: number; attrs: number[] }
