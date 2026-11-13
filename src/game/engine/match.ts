// Zonebaseret matchmotor (vores egen) med elementer fra CM 01/02 – se docs/ENGINE.md.
//
// Banen er delt i 5 bånd (længde) × 3 baner (bredde) = 15 zoner i absolutte koordinater
// (hjemmeholdet angriber mod x=100). Hver spiller har en angrebs- og en forsvarsposition,
// afledt af formation og instruktioner, og "dækker" zoner med en gaussisk vægt.
// Hvert "moment" vælger boldholderen en handling (aflevering, dribling, indlæg, gennembrud,
// skud), og den afgøres som en duel mellem angriberens og forsvarerens attributter, justeret
// for overtal i zonen. Formationens form bestemmer derfor naturligt, hvor man vinder og
// taber kampen. Der er ingen særlige "exploit"-genveje – se docs/ENGINE.md.

import { A, fitFactor, slotFit, slotRole } from '../attributes';
import type { Rng } from '../rng';
import { RATING, addedMinutes, cardFor, cardSeverity, deadBall, fatigueDrain, halfTimeRecovery, knock, knockAllowed, knockSeverity, yellowRatingDelta, type Rand } from './cm0102-original-rules';
/** Andel almindelige frispark, der er sene/hårde (type 44) i originalens kortregel – *estimeret* (docs/ENGINE.md, trin 4) */
const HARD_SHARE = 0.03;
/** Originalens døde bolde pr. registreret afbrydelse hos os (indkast, målspark efter redninger m.m. tælles ikke) – *estimeret* (trin 5) */
const DEAD_BALL_K = 1.55;
/** Originalens knock-tjek pr. spiller pr. moment i forhold til dens bevægelsestrin – *estimeret*, kalibreret (trin 8) */
const KNOCK_K = 1.4;
import { pitchFx, weatherFx, type Pitch, type Weather, type WeatherFx } from '../weather';
import type {
  CommentaryLine, MatchEvent, MatchReport, MatchStatsSide, Player, PlayerInstructions, PlayerMatchLine,
  OppInstructions, ShootoutKick, TacticChange, ShotRecord, Tactic, TeamInstructions,
} from '../types';
import type { LiveSim, LiveTeamView, PitchSnap } from './liveSim';

export interface EngineTeam {
  club: number;
  tactic: Tactic;
  players: Map<number, Player>;
  morale?: number; // holdmoral-bonus (-1..1)
  /** Holdsnakkens virkning pr. spiller (faktor, fx 1.03) */
  talk?: Record<number, number>;
}

/** Afslutningen på 2D-banen (pitch()): udfald plus de detaljer, der skal tegnes */
export interface ShotSnap {
  team: number;
  outcome: ShotRecord['outcome'] | 'post';
  zone: number;
  save?: ShotRecord['save'];
  blocker?: number;
  og?: number;
}

export interface EngineOptions {
  commentary: boolean;
  /** Løbende spil-for-spil som i CM 01/02 (afleveringer, opsnapninger, målspark – linjer med 'pl-'). Kun kampen, man ser;
   *  bruger ingen tilfældige tal og gemmes ikke i rapporten */
  playByPlay?: boolean;
  neutral?: boolean;
  importance?: number; // 0-1
  /** Afgør om der skal findes en vinder ved dette resultat (forlænget + straffe) */
  needsWinner?: (hg: number, ag: number) => boolean;
  fixtureId?: number;
  /** Kampdato (bruges til midlertidige effekter som "tændt" efter en samtale) */
  date?: string;
  /** AI håndterer udskiftninger for hold 0/1 */
  aiSubs?: [boolean, boolean];
  /** Turneringen bruger VAR (videodommer) – tætte offsidesituationer bliver tjekket */
  var?: boolean;
  /** Vejret (påvirker afleveringer, luftdueller, træthed og afslutninger) */
  weather?: Weather;
  /** Antal udskiftninger (moderne regler: 5, klassiske: 3) */
  subs?: number;
  /** Anden kamp i en dobbeltkamp: mål fra første kamp [hjemmeholdet, udeholdet] og om udebanemål tæller */
  aggregate?: { prior: [number, number]; awayGoals: boolean };
  /** Dommerens strenghed (1 = normal); udelades den, trækkes en tilfældig dommer */
  refStrict?: number;
  /** Afslutningsskala for databasen (2001/02-databasen har bedre afsluttere end den moderne) */
  finish?: number;
  /** Hjemmebanefordelen (1 = standard) og hvor meget afslutterens kvalitet betyder (deler, standard 13) – pr. database */
  homeAdv?: number;
  finSlope?: number;
  /** Vægten af afslutningsevnen, når skytten vælges: finQ^shotSpread (uden: √finQ). Kun ORIGINAL-profilen sætter den. */
  shotSpread?: number;
  /** Faktor på friløbere og returbolde (ORIGINAL-profilen: de gik for ofte til den samme angriber) */
  oneOnOneK?: number;
  /** kampens niveau: [reference, andel]. Profilen er kalibreret på Premier League, men mange af motorens led er absolutte
   *  (forsvarets lukning, zonedækning, førsteberøring …), så svage hold i de lavere rækker scorer og lukker ind som om
   *  forsvarsspillet var dårligt. Ligger de 22 startspilleres snit af de tekniske egenskaber under referencen, løftes alle
   *  spilleres tekniske egenskaber i kampen med andel × forskellen (samme løft til begge hold – forskellen mellem dem er uændret). */
  level?: [number, number];
  /** [fra, faktor]: når kampen har `fra` mål eller flere, ganges hver afslutnings målchance med faktor^(mål − fra + 1). Originalens
   *  lavere rækker har næsten ingen kampe med 10+ mål (orakelsæsonerne: 2 af 6.684 i Division 1–3, ingen over 10); zonemotorens åbne
   *  kampe løb længere ud (*estimeret*). */
  openDamp?: [number, number];
  /** dæmpning af niveauforskelle (standard SQUASH) – og særskilt for de offensive egenskaber (standard = squash) */
  squash?: number;
  squashAtt?: number;
  /** særskilt dæmpning af de defensive egenskaber (standard = squash) */
  squashDef?: number;
  /** hvor ofte løb bag kæden fanges offside (1 = standard; den originale profil har flere, som originalen: 7,4 pr. kamp) */
  offside?: number;
  /** Andel af advarslerne og hjørnesparkene, der gives (1 = alle) – og om blokerede skud tælles som skud (pr. database) */
  cards?: number;
  corners?: number;
  countBlocked?: boolean;
  /** Forsvaret lukker chancen før afslutningen: grundsandsynlighed (0 = fra) og hvor meget forsvarerens kvalitet
   *  betyder (deler) – gode forsvar forhindrer chancer i stedet for blot at gøre dem dårligere */
  close?: number;
  closeSlope?: number;
  /** tillæg til andelen af afslutninger, der går på mål (pr. database; påvirker ikke målene) */
  onTarget?: number;
  /** Hvilke regler motoren følger: 'current' (vores egne, standard) eller 'original' (CM 01/02's regler læst fra
   *  cm0102.exe 3.9.68, se cm0102-original-rules.ts) – indføres én regel ad gangen, se docs/ENGINE.md */
  rules?: 'current' | 'original';
  /** Hvor meget et hold, der fører med 2+ mål, slapper af gennem hele kampen (pr. måls forspring ud over det første) */
  ease?: number;
  /** Banens tilstand */
  pitch?: Pitch;
  /** Dagens dommer (navn vises i rapporten; strengheden styrer kort) */
  referee?: { name: string; strict: number; discipline?: number; limit?: number };
}

interface SP {
  p: Player;
  team: number;
  slot: number;
  eff: Float32Array;
  cond: number;
  instr: PlayerInstructions;
  ax: number; ay: number; dx: number; dy: number;
  off: boolean;
  yellow: number;
  /** frispark begået i kampen (originalens kortregel bruger dem) */
  fouls?: number;
  /** kommentaren "knackered" er givet */
  knackered?: boolean;
  /** alder på kampdagen (originalens træthed afhænger af den) */
  age?: number;
  line: PlayerMatchLine;
  rating: number;
  enteredAt: number;
}

interface ZoneEntry { sp: SP; w: number }

interface TeamRT {
  idx: number;
  club: number;
  tactic: Tactic;
  ti: TeamInstructions;
  on: SP[];
  benchIds: number[];
  /** minuttet for holdets seneste udskiftning og taktikskift (originalens spærrer: 5 og 15 minutter) */
  lastSub?: number;
  lastShift?: number;
  /** spillere tvunget ud af knocks (originalen stopper knocks efter 6) */
  forcedOff?: number;
  subsLeft: number;
  players: Map<number, Player>;
  zAtt: ZoneEntry[][];
  zDef: ZoneEntry[][];
  wAtt: number[];
  wDef: number[];
  /** Forsvarskvalitet pr. zone (tackling, placering, fart) – her leder modstanderen efter svagheder */
  qDef: number[];
  /** Fart i forsvaret pr. zone (til stikninger og bolde bag kæden) */
  qPace: number[];
  /** Luftstyrke pr. zone (indlæg og lange bolde) */
  qAir: number[];
  /** Angrebets fart og luftstyrke pr. zone */
  aPace: number[];
  aAir: number[];
  /** Forsvaret pr. boldbane (venstre/midt/højre): kæden glider mod boldsiden */
  defL: { zDef: ZoneEntry[][]; wDef: number[]; qDef: number[]; qPace: number[]; qAir: number[] }[];
  /** Angrebet pr. boldbane: spillerne på boldsiden trækker ind mod bolden, den fjerne kant holder bredden */
  attL: { zAtt: ZoneEntry[][]; wAtt: number[]; aPace: number[]; aAir: number[] }[];
  stats: MatchStatsSide;
  homeMult: number;
  moraleMult: number;
  /** Holdsnak: faktor pr. spiller-id */
  talk: Map<number, number>;
  /** Antal spillere på banen (færre efter røde kort) */
  men: number;
  all: SP[]; // alle der har været på banen
  /** AI-trænerens udgangspunkt for mentaliteten (til justeringer undervejs) */
  baseMentality?: number;
  /** Holdets gennemsnitlige beslutsomhed (hvordan det tager modgang) */
  det: number;
  /** Faktor for sen kampvilje (bagud) eller nervøsitet (foran) – virker med det samme på alle spillere */
  urge?: number;
  /** Fast boldfordeler og target-angriber (spiller-id) */
  playmaker?: number;
  targetMan?: number;
}

const ZB = 5;
const ZL = 3;
const NZ = ZB * ZL;
/** Global afslutningsskala (kalibreret mod ~2,7 mål/kamp, se scripts/calibrate.ts) */
const FINISH_SCALE = 1.14;
const zoneX = (b: number) => 10 + b * 20;
const zoneY = (l: number) => 16.67 + l * 33.33;

/** Samlet zonedækning pr. spiller i angreb og forsvar (normaliseret, så alle pladser tæller lige meget) */
const ATT_COVER = 2.45;
const DEF_COVER = 2.2;
/** Dæmper niveauforskelle en smule: uden den bliver topholdene urealistisk dominerende (150 mål, 60-målsscorere) */
const SQUASH = 0.76;
/**
 * Originalens træthed er langt mildere: målt i CM 01/02 (Man Utd-Blackburn, 2002) falder markspillerne fra ~97 % til ~91 % ved
 * pausen og ~80 % ved slutfløjt (ca. 17 point på en kamp). Uden skalering tabte vores motor ~31 point, så trætte spillere kom
 * under knock-grænsen (< 40 % = næsten sikker knock) og gav skadebølger.
 */
const ORIG_FATIGUE = 0.7;

/** Fordel pr. ekstra mand på banen i hver duel (røde kort) – kalibreret mod rigtige kampe, se scripts/redcard.ts */
const MAN_EDGE = 0.45;
/** Chance for direkte rødt kort pr. frispark (plus spillerens 'beskidthed') */
const RED_BASE = 0.0011;
/** Ekstra chancekvalitet pr. manglende forsvarsspiller */
const SPACE_XG = 0.17;
/** De offensive egenskaber (afslutning, chanceskabelse) – kan dæmpes særskilt pr. database */
/** Hvilke afslutninger hvert opspil kan føre til (2D) */
const SETUP_KINDS: Record<string, string[]> = { layoff: ['box'], knockdown: ['box', 'header'], lowcross: ['box'], longthrow: ['header', 'box'], shortcorner: ['header', 'box', 'cutback'], edge: ['long'] };
const ATT_ATTRS = new Set<number>([A.crossing, A.dribbling, A.finishing, A.longShots, A.offTheBall, A.passing, A.technique, A.creativity, A.flair]);
/** De defensive egenskaber (markering, tackling, placering, målmand) – kan dæmpes særskilt pr. database */
const DEF_ATTRS = new Set<number>([A.marking, A.tackling, A.positioning, A.anticipation, A.handling, A.oneOnOnes, A.reflexes]);
/** Snittet af de tekniske egenskaber (ATT_ATTRS + DEF_ATTRS) hos begge holds startspillere – ingen tilfældige tal */
export function matchLevel(home: EngineTeam, away: EngineTeam): number {
  let sum = 0, n = 0;
  for (const t of [home, away]) for (const id of t.tactic.lineup) {
    const p = t.players.get(id);
    if (!p) continue;
    for (const i of ATT_ATTRS) { sum += p.attrs[i]; n++; }
    for (const i of DEF_ATTRS) { sum += p.attrs[i]; n++; }
  }
  return n ? sum / n : 11;
}
function levelLift(home: EngineTeam, away: EngineTeam, [ref, k]: [number, number]): number {
  return Math.max(0, (ref - matchLevel(home, away)) * k);
}
/** Holdets dagsform (spredning): giver overraskelser – uden den vinder favoritten altid ligaen */
const DAY_FORM = 0.05;
/** Hvor meget boldholderen søger mod modstanderens svage zoner (ganges med overblik) */
const SEEK = 1.6;
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const logistic = (x: number) => 1 / (1 + Math.exp(-x));
const logit = (p: number) => Math.log(p / (1 - p));

function emptyStats(): MatchStatsSide {
  return { goals: 0, shots: 0, onTarget: 0, xg: 0, possession: 0, corners: 0, fouls: 0, yellows: 0, reds: 0, offsides: 0, passes: 0, passesCompleted: 0, throwIns: 0, tackles: 0, tacklesWon: 0, headers: 0, headersWon: 0 };
}

export class MatchSim implements LiveSim {
  /** zonemotoren (LiveSim; rapporten får ikke feltet – mangler = 'zone') */
  readonly engine = 'zone' as const;
  readonly teams: [TeamRT, TeamRT];
  readonly opts: EngineOptions;
  private r: Rng;
  totalMoments: number;
  moment = 0;
  /** Hjørnespark i kampen (til 2D-visningen): hvem tog det, fra hvilken side, og førte det til et skud */
  corners: { m: number; t: number; taker: number; lane: number; moment: number; shot?: boolean }[] = [];
  minute = 0;
  half = 1;
  extraTime = false;
  finished = false;
  poss = 0;
  zone = 7; // midten
  /** Til 2D-visningen: spilleren med bolden (påvirker ikke kampen) */
  holder = 0;
  private breakaway: SP | null = null;
  /** hvordan gennembruddet opstod (kontra / gennembrudsaflevering) – vises i 2D */
  private breakawayOrigin = '';
  /** oprindelse for næste afslutning (indlæg, dribling, pres …) */
  private originNext = '';
  /** spilleren, der lige har begået frisparket (et kort erstatter frisparkets −0,025) */
  private foulBy: SP | null = null;
  /** opspillet til den næste afslutning (2D) – gælder kun i samme eller næste øjeblik */
  private setupNext: { k: string; by: number; moment: number } | null = null;
  /** højt pres: en angriber har erobret bolden højt og får en chance */
  private pressed: SP | null = null;
  /** højdepunkter uden afslutning (redningstacklinger) til 2D-visningen */
  highlights: { m: number; t: number; kind: string; p: number; p2: number; moment: number }[] = [];
  /** taktiske ændringer i kampen (formation, mentalitet, instruktioner) – udskiftninger står i events */
  changes: TacticChange[] = [];
  private rebound: SP | null = null;
  private lastPasser: SP | null = null;
  private lastPasserMoment = -10;
  commentary: CommentaryLine[] = [];
  events: MatchEvent[] = [];
  shots: ShotRecord[] = [];
  momentum: number[] = [];
  heat: [number[], number[]] = [new Array(NZ).fill(0), new Array(NZ).fill(0)];
  zonePoss: number[] = new Array(NZ).fill(0);
  zoneTotal: number[] = new Array(NZ).fill(0);
  pens?: [number, number];
  /** straffesparkskonkurrencen, mens den står på (og bagefter til rapporten) */
  shootout?: { takers: [SP[], SP[]]; score: [number, number]; kicks: ShootoutKick[] };
  /** Instruktioner mod modstanderen pr. hold (gives af hold i og rammer hold 1-i) */
  private oi: [OppInstructions | undefined, OppInstructions | undefined] = [undefined, undefined];
  private wx: WeatherFx & { drib: number; touch: number };
  /** løftet af de tekniske egenskaber i denne kamp (opts.level) */
  private lift = 0;
  private momentumBucket = 0;
  /** Dommerens strenghed (kort, straffespark, filmning) */
  readonly ref: number;
  /** Tillægstid: afbrydelser (mål, kort, skader, udskiftninger, tidsspild) i minutter */
  private stoppage = 0;
  /** afbrydelser ved pausen (originalens tillægstid tæller de døde bolde i 2. halvleg) */
  private h2: { stops: number } | null = null;
  private h2Stops() { return this.teams.reduce((s, t) => s + t.stats.fouls + t.stats.corners + t.stats.offsides + (t.stats.shots - t.stats.onTarget) + t.stats.goals * 2 + t.stats.yellows + t.stats.reds * 2 + ((this.opts.subs ?? 5) - t.subsLeft), 0); }
  private regularEnd = 0;
  /** Spilleren der holder bolden op (target-angriber): næste aflevering fra ham får medspillere med */
  private held: SP | null = null;
  private bucketThreat = 0;

  constructor(home: EngineTeam, away: EngineTeam, opts: EngineOptions, r: Rng) {
    this.r = r;
    this.opts = opts;
    const w = weatherFx(opts.weather), pf = pitchFx(opts.pitch);
    this.wx = { pass: w.pass + pf.pass, air: w.air + pf.air, fatigue: w.fatigue * pf.fatigue, finish: w.finish * pf.finish, drib: pf.drib, touch: pf.touch };
    this.ref = opts.refStrict ?? opts.referee?.strict ?? clamp(r.normal(1, 0.14), 0.7, 1.35);
    const oiFor = (t: EngineTeam) => (t.tactic.opp && t.tactic.opp.fixture === opts.fixtureId ? t.tactic.opp : undefined);
    this.oi = [oiFor(home), oiFor(away)];
    if (opts.level) this.lift = levelLift(home, away, opts.level);
    this.teams = [this.makeTeam(home, 0), this.makeTeam(away, 1)];
    const tempo = (this.teams[0].ti.tempo + this.teams[1].ti.tempo) / 2;
    this.totalMoments = Math.round(240 * (1 + 0.07 * (tempo - 1)));
    this.regularEnd = this.totalMoments;
    this.poss = r.chance(0.5) ? 0 : 1;
    if (opts.weather && opts.weather !== 'clear' && opts.weather !== 'cloudy') this.line(`weather-${opts.weather}`);
    this.line('kickoff', this.teams[this.poss].on[10]);
    if (opts.pitch && opts.pitch !== 'normal' && opts.commentary) this.commentary.push({ m: 0, k: `pitch-${opts.pitch}`, hi: false });
    if (this.ref > 1.17) this.line('ref-strict');
    else if (this.ref < 0.83) this.line('ref-lenient');
  }

  // ---------- opsætning ----------

  private makeTeam(t: EngineTeam, idx: number): TeamRT {
    const h = this.opts.homeAdv ?? 1;
    const homeMult = this.opts.neutral ? 1 : idx === 0 ? 1 + 0.019 * h : 1 - 0.007 * h;
    const rt: TeamRT = {
      idx,
      club: t.club,
      tactic: t.tactic,
      ti: t.tactic.team,
      on: [],
      benchIds: t.tactic.bench.slice(),
      subsLeft: this.opts.subs ?? 5,
      players: t.players,
      zAtt: [], zDef: [], wAtt: [], wDef: [], qDef: [], qPace: [], qAir: [], aPace: [], aAir: [], defL: [], attL: [],
      stats: emptyStats(),
      homeMult,
      moraleMult: (1 + (t.morale ?? 0) * 0.03) * clamp(this.r.normal(1, DAY_FORM), 0.9, 1.1),
      talk: new Map(Object.entries(t.talk ?? {}).map(([k, v]) => [Number(k), v])),
      men: 11,
      all: [],
      det: 10,
      playmaker: t.tactic.team.playmaker || undefined,
      targetMan: t.tactic.team.targetMan || undefined,
    };
    t.tactic.lineup.forEach((id, slot) => {
      const p = t.players.get(id);
      if (p) rt.on.push(this.makeSP(rt, p, slot, 0));
    });
    rt.det = rt.on.reduce((s, x) => s + x.p.attrs[A.determination], 0) / Math.max(1, rt.on.length);
    // anførerens indflydelse løfter (eller sænker) hele holdet en smule
    const capt = rt.on.find((x) => x.p.id === t.tactic.captain);
    if (capt) rt.moraleMult *= 1 + (capt.p.attrs[A.influence] - 10) / 500;
    this.buildZones(rt);
    return rt;
  }

  private makeSP(rt: TeamRT, p: Player, slot: number, minute: number): SP {
    const s = rt.tactic.slots[slot];
    const fit = fitFactor(slotFit(p, s));
    const consistency = p.attrs[A.consistency];
    const firedUp = p.fired && this.opts.date && p.fired >= this.opts.date ? 0.02 : 0;
    const form = clamp(this.r.normal(1 + firedUp, 0.065 * (1.2 - consistency / 20) * (firedUp ? 0.7 : 1)), 0.86, 1.12);
    const imp = this.opts.importance ? 0.97 + 0.06 * (p.attrs[A.importantMatches] / 20) * this.opts.importance + (1 - this.opts.importance) * 0.03 : 1;
    const morale = 0.95 + 0.1 * (p.morale / 20);
    const talk = rt.talk.get(p.id) ?? 1;
    // udeholdet i en vigtig kamp: spillere der ikke tåler pres, mærker det fjendtlige publikum
    const crowd = !this.opts.neutral && rt.idx === 1 && this.opts.importance ? 1 - (1 - p.attrs[A.pressure] / 20) * 0.015 * this.opts.importance : 1;
    const mult = fit * form * imp * morale * rt.homeMult * rt.moraleMult * talk * crowd;
    const eff = new Float32Array(36);
    const sq = this.opts.squash ?? SQUASH, sqA = this.opts.squashAtt ?? sq, sqD = this.opts.squashDef ?? sq;
    const squash = (v: number) => 11 + (v - 11) * sq;
    const lift = this.lift;
    for (let i = 0; i < 36; i++) eff[i] = (ATT_ATTRS.has(i) ? 11 + (p.attrs[i] + lift - 11) * sqA : DEF_ATTRS.has(i) ? 11 + (p.attrs[i] + lift - 11) * sqD : 11 + (p.attrs[i] - 11) * sq) * mult;
    // Mentale/fysiske påvirkes mindre af forkert position
    const physMult = form * morale * rt.homeMult * talk;
    for (const k of [A.pace, A.acceleration, A.stamina, A.strength, A.jumping, A.naturalFitness] as number[]) eff[k] = squash(p.attrs[k]) * physMult;
    // instruktioner fra modstanderen rettet mod denne spiller
    for (const tg of this.oi[1 - rt.idx]?.targets ?? []) {
      if (tg.pid !== p.id) continue;
      const hit = (keys: number[], f: number) => { for (const k of keys) eff[k] *= f; };
      if (tg.kind === 'tight') hit([A.offTheBall, A.finishing, A.heading, A.anticipation], 0.92);
      else if (tg.kind === 'press') hit([A.passing, A.decisions, A.creativity, A.technique], 0.93);
      else if (tg.kind === 'hard') hit([A.dribbling, A.technique, A.flair, A.agility], 0.92);
      else if (tg.kind === 'weakFoot' && p.foot !== 'B') hit([A.finishing, A.longShots, A.dribbling, A.crossing], 0.94);
    }
    const sp: SP = {
      p, team: rt.idx, slot, eff,
      cond: clamp(p.condition / 100, 0.3, 1),
      age: this.opts.date && p.dob ? Number(this.opts.date.slice(0, 4)) - Number(p.dob.slice(0, 4)) - (this.opts.date.slice(5) < p.dob.slice(5) ? 1 : 0) : 25,
      instr: rt.tactic.individual[slot],
      ax: 0, ay: 0, dx: 0, dy: 0,
      off: false, yellow: 0,
      // originalen: 6,1 for startelleveren, 6,4 for spillere fra bænken (sub_6eaea0)
      rating: minute > 0 ? RATING.startSubstitute : RATING.start,
      enteredAt: minute,
      line: { id: p.id, team: rt.idx, rating: 6, goals: 0, assists: 0, minutes: 0, yellow: 0, red: false, injured: false, sub: minute > 0, slot, shots: 0, tackles: 0, passes: 0, passesOk: 0, cond: p.condition, tckA: 0, hea: 0, heaW: 0, on: 0 },
    };
    rt.all.push(sp);
    return sp;
  }

  /** Beregn zonedækning for et hold (efter formation, instruktioner og hvem der er på banen) */
  buildZones(rt: TeamRT) {
    rt.men = rt.on.filter((s) => !s.off).length;
    const ti = rt.ti;
    const asets = [0, 1, 2].map(() => ({ zAtt: Array.from({ length: NZ }, (): ZoneEntry[] => []), wAtt: new Array(NZ).fill(0) as number[], aPace: [] as number[], aAir: [] as number[] }));
    // forsvaret bygges for hver af de tre boldbaner: kæden glider mod boldsiden (som positionstabellen i CM 01/02)
    const sets = [0, 1, 2].map(() => ({ zDef: Array.from({ length: NZ }, (): ZoneEntry[] => []), wDef: new Array(NZ).fill(0) as number[], qDef: [] as number[], qPace: [] as number[], qAir: [] as number[] }));
    for (const sp of rt.on) {
      if (sp.off) continue;
      const s = rt.tactic.slots[sp.slot];
      sp.instr = rt.tactic.individual[sp.slot] ?? sp.instr;
      const role = slotRole(s);
      let adv = 0;
      switch (role) {
        case 'GK': adv = 0; break;
        case 'CB': adv = 8; break;
        case 'FB': adv = 12 + sp.instr.runs * 7; break;
        case 'DM': adv = 7 + sp.instr.runs * 3; break;
        case 'CM': adv = 9 + sp.instr.runs * 5; break;
        case 'WM': adv = 11 + sp.instr.runs * 5; break;
        case 'AM': adv = 8 + sp.instr.runs * 5; break;
        case 'W': adv = 8 + sp.instr.runs * 5; break;
        case 'ST': adv = 6 + sp.instr.runs * 3; break;
      }
      if (role !== 'GK') adv += (ti.mentality - 2) * 3.5;
      if (ti.counter && role !== 'GK' && role !== 'ST') adv -= 4;
      if (ti.menBehind && (role === 'FB' || role === 'CM' || role === 'DM' || role === 'CB')) adv -= 4;
      const widthShift = s.side === 'C' ? 0 : (ti.width - 1) * 6 * (s.side === 'L' ? -1 : 1);
      const press = sp.instr.closingDown ?? ti.closingDown;
      let axr = clamp(s.x + adv, 2, 94);
      let ayr = clamp(s.y + widthShift, 3, 97);
      // løbepilen (CM 01/02: højreklik og træk): med bold går spilleren mod pilens punkt; et løb fremad gør ham også til en
      // hyppigere løber ind i feltet (*estimeret* – originalens vægte kendes ikke)
      const run = role !== 'GK' ? sp.instr.run : undefined;
      if (run) {
        axr = clamp(run.x + Math.max(0, adv) * 0.4, 2, 94);
        ayr = clamp(run.y + (run.y === 50 ? 0 : (ti.width - 1) * 6 * (run.y < 50 ? -1 : 1)), 3, 97);
        if (run.x > s.x + 5 && sp.instr.runs < 2) sp.instr = { ...sp.instr, runs: 2 };
      }
      let dxr = role === 'GK' ? s.x : clamp(s.x - 6 - (2 - ti.mentality) * 3 + (press - 1) * 4, 3, 85);
      // backs og wingbacks der går med frem, når ikke altid hjem: plads bag dem på kanten
      if (role === 'FB') dxr = clamp(dxr + (s.x - 24) * 0.35 + sp.instr.runs * 3, 3, 85);
      // kantspillere på midtbanen følger med hjem og dækker kanten sammen med backen (to firekæder)
      if (role === 'WM') dxr = clamp(dxr - 9 + sp.instr.runs * 2, 3, 85);
      let dyr = clamp(s.y + (50 - s.y) * 0.15, 3, 97);
      if (rt.idx === 1) { axr = 100 - axr; ayr = 100 - ayr; dxr = 100 - dxr; dyr = 100 - dyr; }
      sp.ax = axr; sp.ay = ayr; sp.dx = dxr; sp.dy = dyr;
      const free = sp.instr.freeRole ? 1.4 : 1;
      const sxA = 16 * free, syA = 20 * free;
      const sxD = role === 'GK' ? 8 : 15, syD = role === 'GK' ? 14 : 19;
      // hver spiller har lige meget dækning i alt: en central spiller spreder den over flere zoner,
      // en kantspiller samler den på kanten (ellers får smalle formationer reelt flere spillere)
      // i angreb søger de centrale spillere mod boldsiden; kantspillere holder deres kant (fri rolle: mere)
      const pull = role === 'GK' ? 0 : (s.side === 'C' ? 0.22 : 0.07) * (sp.instr.freeRole ? 1.5 : 1);
      for (let L = 0; L < ZL; L++) {
        const ay = ayr + (zoneY(L) - ayr) * pull;
        const wa = new Array(NZ).fill(0);
        let sa = 0;
        for (let z = 0; z < NZ; z++) {
          const b = Math.floor(z / ZL), l = z % ZL;
          const a = Math.exp(-(((zoneX(b) - axr) ** 2) / (2 * sxA * sxA) + ((zoneY(l) - ay) ** 2) / (2 * syA * syA)));
          if (a > 0.06) { wa[z] = a; sa += a; }
        }
        const na = sa ? (ATT_COVER * free) / sa : 0;
        for (let z = 0; z < NZ; z++) if (wa[z] && role !== 'GK') { const w = wa[z] * na; asets[L].zAtt[z].push({ sp, w }); asets[L].wAtt[z] += w; }
      }
      // glidning mod boldsiden: disciplinerede spillere (holdspil, placering) lukker bedre af
      const comp = role === 'GK' ? 0 : clamp(0.12 + 0.16 * (sp.p.attrs[A.teamwork] + sp.p.attrs[A.positioning]) / 40, 0.12, 0.3);
      for (let L = 0; L < ZL; L++) {
        const set = sets[L];
        const dy = dyr + (zoneY(L) - dyr) * comp;
        const wd = new Array(NZ).fill(0);
        let sd = 0;
        for (let z = 0; z < NZ; z++) {
          const b = Math.floor(z / ZL), l = z % ZL;
          const d = Math.exp(-(((zoneX(b) - dxr) ** 2) / (2 * sxD * sxD) + ((zoneY(l) - dy) ** 2) / (2 * syD * syD)));
          if (d > 0.06) { wd[z] = d; sd += d; }
        }
        const nd = sd ? (role === 'GK' ? DEF_COVER * 0.6 : DEF_COVER) / sd : 0;
        for (let z = 0; z < NZ; z++) if (wd[z]) { const w = wd[z] * nd; set.zDef[z].push({ sp, w: w * (sp.instr.tightMarking ? 1.1 : 1) }); set.wDef[z] += w; }
      }
    }
    for (const set of sets) {
      for (let z = 0; z < NZ; z++) {
        let q = 0, pc = 0, air = 0, w = 0;
        for (const e of set.zDef[z]) {
          const x = e.sp.eff;
          q += e.w * (0.35 * x[A.tackling] + 0.25 * x[A.positioning] + 0.2 * x[A.marking] + 0.2 * x[A.anticipation]);
          pc += e.w * (x[A.pace] + x[A.acceleration]) / 2;
          air += e.w * (0.42 * x[A.heading] + 0.32 * x[A.jumping] + 0.14 * x[A.strength] + 0.12 * x[A.bravery]);
          w += e.w;
        }
        set.qDef[z] = w ? q / w : 6; set.qPace[z] = w ? pc / w : 6; set.qAir[z] = w ? air / w : 6;
        if (set.zDef[z].length === 0) {
          const near = rt.on.filter((s) => !s.off).sort((a, b) => dist(a.dx, a.dy, z) - dist(b.dx, b.dy, z))[0];
          if (near) set.zDef[z].push({ sp: near, w: 0.05 });
        }
      }
    }
    rt.defL = sets;
    this.useDef(rt, 1);
    for (const set of asets) {
      for (let z = 0; z < NZ; z++) {
        let ap = 0, aa = 0, aw = 0;
        for (const e of set.zAtt[z]) {
          const x = e.sp.eff;
          ap += e.w * (x[A.pace] + x[A.acceleration]) / 2;
          aa += e.w * (0.42 * x[A.heading] + 0.32 * x[A.jumping] + 0.14 * x[A.strength] + 0.12 * x[A.bravery]);
          aw += e.w;
        }
        set.aPace[z] = aw ? ap / aw : 6; set.aAir[z] = aw ? aa / aw : 6;
        // Hvis ingen er i en zone (fx efter røde kort) – nærmeste fallback
        if (set.zAtt[z].length === 0) {
          const near = rt.on.filter((s) => !s.off && slotRole(rt.tactic.slots[s.slot]) !== 'GK').sort((a, b) => dist(a.ax, a.ay, z) - dist(b.ax, b.ay, z))[0];
          if (near) set.zAtt[z].push({ sp: near, w: 0.05 });
        }
      }
    }
    rt.attL = asets;
    this.useAtt(rt, 1);
  }

  /** Angrebet står efter boldens bane */
  private useAtt(rt: TeamRT, lane: number) {
    const a = rt.attL[lane];
    if (!a) return;
    rt.zAtt = a.zAtt; rt.wAtt = a.wAtt; rt.aPace = a.aPace; rt.aAir = a.aAir;
  }

  /** Forsvaret står efter boldens bane (absolut 0 venstre .. 2 højre) */
  private useDef(rt: TeamRT, lane: number) {
    const d = rt.defL[lane];
    if (!d) return;
    rt.zDef = d.zDef; rt.wDef = d.wDef; rt.qDef = d.qDef; rt.qPace = d.qPace; rt.qAir = d.qAir;
  }

  // ---------- hjælpere ----------

  private a(sp: SP, i: number): number {
    return sp.eff[i] * (0.68 + 0.32 * sp.cond) * (this.teams[sp.team].urge ?? 1);
  }
  private rb(team: number, z = this.zone): number {
    const b = Math.floor(z / ZL);
    return team === 0 ? b : ZB - 1 - b;
  }
  private zoneFor(team: number, rb: number, lane: number): number {
    const b = team === 0 ? rb : ZB - 1 - rb;
    const l = team === 0 ? lane : ZL - 1 - lane;
    return b * ZL + l;
  }
  private laneOf(team: number, z = this.zone): number {
    const l = z % ZL;
    return team === 0 ? l : ZL - 1 - l;
  }
  private pick(list: ZoneEntry[], weight?: (sp: SP) => number, exclude?: SP): SP | null {
    let total = 0;
    for (const e of list) if (!e.sp.off && e.sp !== exclude) total += e.w * (weight ? weight(e.sp) : 1);
    if (total <= 0) return list.find((e) => !e.sp.off)?.sp ?? null;
    let x = this.r.next() * total;
    for (const e of list) {
      if (e.sp.off || e.sp === exclude) continue;
      x -= e.w * (weight ? weight(e.sp) : 1);
      if (x <= 0) return e.sp;
    }
    return list[list.length - 1].sp;
  }
  private gk(t: TeamRT): SP {
    return t.on.find((s) => !s.off && t.tactic.slots[s.slot].pos === 'GK') ?? t.on.find((s) => !s.off)!;
  }
  private overload(z: number, att: TeamRT, def: TeamRT): number {
    // undertal mærkes over hele banen: modstanderen har altid en fri mand
    return 0.5 * Math.log((att.wAtt[z] + 0.45) / (def.wDef[z] + 0.45)) + MAN_EDGE * (att.men - def.men);
  }
  /** Boldholderens overblik (0..1): hvor godt han ser, hvor modstanderen er svag */
  private vision(s: SP) { return clamp((this.a(s, A.decisions) + this.a(s, A.creativity) + this.a(s, A.teamwork)) / 45, 0.2, 1.1); }
  /** Hvor attraktiv en zone er at spille ind i: overtal, svage forsvarere og fartfordel */
  private zoneEdge(z: number, T: TeamRT, O: TeamRT) {
    return 0.5 * this.overload(z, T, O) + (11 - O.qDef[z]) / 5 + (T.aPace[z] - O.qPace[z]) / 9;
  }
  private rate(sp: SP | null, d: number) {
    if (sp) sp.rating += d;
  }
  private line(k: string, a?: SP | null, b?: SP | null, hi = false) {
    if (!this.opts.commentary) return;
    this.commentary.push({ m: this.minute, k, a: a ? name(a.p) : undefined, b: b ? name(b.p) : undefined, t: a ? a.team : undefined, hi });
  }
  /** spil-for-spil (kun playByPlay) – må aldrig trække tilfældige tal */
  private pbp(k: string, a: SP | null | undefined, b?: SP | null) {
    if (this.opts.playByPlay && a) this.line(k, a, b);
  }
  private keeper(t: TeamRT): SP | undefined {
    return t.on.find((x) => !x.off && t.tactic.slots[x.slot]?.pos === 'GK');
  }

  // Sammensatte evner
  private passQ(s: SP) { return 0.45 * this.a(s, A.passing) + 0.2 * this.a(s, A.decisions) + 0.15 * this.a(s, A.technique) + 0.2 * this.a(s, A.creativity); }
  private pressQ(s: SP, t: TeamRT) { return 0.3 * this.a(s, A.anticipation) + 0.3 * this.a(s, A.positioning) + 0.2 * this.a(s, A.workRate) * (0.85 + (s.instr.closingDown ?? t.ti.closingDown) * 0.1) + 0.2 * this.a(s, t.ti.marking === 'man' ? A.marking : A.tackling); }
  private dribQ(s: SP) { return 0.4 * this.a(s, A.dribbling) + 0.2 * this.a(s, A.pace) + 0.15 * this.a(s, A.acceleration) + 0.15 * this.a(s, A.agility) + 0.1 * this.a(s, A.flair); }
  private tackQ(s: SP, t: TeamRT) { return (0.45 * this.a(s, A.tackling) + 0.2 * this.a(s, A.positioning) + 0.15 * this.a(s, A.pace) + 0.2 * this.a(s, A.anticipation)) * (1 + ((s.instr.tackling ?? t.ti.tackling) - 1) * 0.04); }
  private aerial(s: SP) { return 0.42 * this.a(s, A.heading) + 0.32 * this.a(s, A.jumping) + 0.14 * this.a(s, A.strength) + 0.12 * this.a(s, A.bravery); }
  private finW(s: SP) { const e = this.opts.shotSpread; return e === undefined ? Math.sqrt(this.finQ(s)) : this.finQ(s) ** e; }
  private finQ(s: SP) { return 0.62 * this.a(s, A.finishing) + 0.13 * this.a(s, A.technique) + 0.1 * this.a(s, A.decisions) + 0.15 * this.a(s, A.anticipation); }
  private gkQ(s: SP) { return 0.35 * this.a(s, A.reflexes) + 0.25 * this.a(s, A.handling) + 0.2 * this.a(s, A.positioning) + 0.2 * this.a(s, A.agility); }
  private gk1v1(s: SP) { return 0.5 * this.a(s, A.oneOnOnes) + 0.3 * this.a(s, A.reflexes) + 0.2 * this.a(s, A.anticipation); }
  /** Fart + acceleration (til direkte fartdueller) */
  private speed(s: SP) { return this.a(s, A.pace) + this.a(s, A.acceleration); }
  private runQ(s: SP) { return 0.4 * this.a(s, A.offTheBall) + 0.3 * this.a(s, A.pace) + 0.3 * this.a(s, A.anticipation); }

  // ---------- simulering ----------

  /** Kør et moment. Returnerer false når kampen er slut. */
  step(): boolean {
    if (this.finished) return false;
    const regular = this.totalMoments;
    const etMoments = Math.round(regular / 3);
    // tillægstid efter 90 minutter: ud fra afbrydelserne i kampen (mål, kort, skader, udskiftninger, tidsspild)
    if (!this.extraTime && this.moment >= regular && this.regularEnd === regular) {
      // originalens regel (_f_006b98c0): hver død bold giver rand(trunc(0,8 × rand(10))) tik; minutter = ceil(tik / 11)
      let added = clamp(Math.round(0.8 + this.stoppage), 1, 8);
      if (this.opts.rules === 'original' && this.h2) {
        const rand: Rand = (n) => (n <= 0 ? 0 : Math.floor(this.r.next() * n));
        const n = Math.round((this.h2Stops() - this.h2.stops) * DEAD_BALL_K);
        let ticks = 0;
        for (let k = 0; k < n; k++) ticks += deadBall(rand).stoppageTicks;
        added = clamp(addedMinutes(ticks), 1, 8);
      }
      this.regularEnd = regular + Math.round((added * regular) / 90);
      if (this.opts.commentary) this.commentary.push({ m: 90, k: 'added-time', a: String(added), hi: false });
    }
    const end = this.regularEnd;
    const limit = this.extraTime ? end + etMoments : end;
    if (this.moment >= limit) {
      if (!this.extraTime && this.opts.needsWinner?.(this.teams[0].stats.goals, this.teams[1].stats.goals)) {
        this.extraTime = true;
        this.line('extratime');
        this.kickoff(1);
      } else if (this.extraTime && !this.pens && this.opts.needsWinner?.(this.teams[0].stats.goals, this.teams[1].stats.goals)) {
        // straffesparkskonkurrence: ét spark pr. trin, så den kan følges live
        this.moment++;
        if (!this.shootout) { this.startShootout(); return true; }
        if (this.shootoutKick()) return true;
        this.finish();
        return false;
      } else {
        this.finish();
        return false;
      }
    }
    const i = this.moment;
    const minute = i < regular ? Math.floor((i * 90) / regular) + 1
      : i < end ? 90 + Math.floor(((i - regular) * 90) / regular) + 1
      : 90 + Math.floor(((i - end) * 30) / etMoments) + 1;
    if (i === Math.floor(regular / 2)) {
      this.line('halftime');
      this.half = 2;
      this.kickoff(1);
      this.recoverHalftime();
      this.h2 = { stops: this.h2Stops() };
    }
    this.minute = minute;
    this.tickFatigue();
    // originalen tjekker knocks ved hvert bevægelsestrin for spillerne uden bold (her: pr. moment, skaleret)
    if (this.opts.rules === 'original') for (const t of this.teams) for (const s of t.on) {
      const n = Math.floor(KNOCK_K) + (this.r.chance(KNOCK_K % 1) ? 1 : 0);
      for (let k = 0; k < n && !s.off; k++) this.knockCheck(s);
    }
    if (i % 12 === 0) this.aiManage();
    if (!this.timeWaste()) this.play();
    this.moment++;
    // momentum pr. 5 minutter
    const bucket = Math.floor((minute - 1) / 5);
    if (bucket !== this.momentumBucket) {
      this.momentum[this.momentumBucket] = Math.round(this.bucketThreat * 100) / 100;
      this.momentumBucket = bucket;
      this.bucketThreat = 0;
    }
    return true;
  }

  runToEnd(): MatchReport {
    while (this.step());
    return this.report();
  }

  private kickoff(team: number) {
    this.poss = team;
    this.zone = 7;
    this.breakaway = null;
    this.rebound = null;
    this.pressed = null;
  }

  /** Tidsspild: holdet i front sent i kampen (lavere mentalitet end udgangspunktet) bruger tid ved dødbolde */
  private timeWaste(): boolean {
    if (this.minute < 78 || this.extraTime) return false;
    const T = this.teams[this.poss], O = this.teams[1 - this.poss];
    if (this.stateDiff(T) <= 0 || T.ti.mentality >= (T.baseMentality ?? T.ti.mentality)) return false;
    if (!this.r.chance(0.06)) return false;
    this.stoppage += 0.25;
    const sp = this.pick(T.zAtt[this.zone]);
    if (sp && this.r.chance(0.03 * this.ref)) { this.line('time-wasting', sp); this.book(T, sp); }
    else if (sp && this.r.chance(0.3)) this.line('time-waste', sp);
    void O;
    return true;
  }

  /** Stillingen set fra holdet – i en dobbeltkamp den samlede stilling (udebanemål tæller som en halv) */
  private stateDiff(t: TeamRT): number {
    const o = this.teams[1 - t.idx];
    let d = t.stats.goals - o.stats.goals;
    const ag = this.opts.aggregate;
    if (ag && !this.extraTime) {
      d += ag.prior[t.idx] - ag.prior[o.idx];
      if (d === 0 && ag.awayGoals) {
        // udebanemål: hjemmeholdet i 2. kamp scorede ude i 1. kamp (prior[0]); udeholdet scorer ude nu
        const myAway = t.idx === 0 ? ag.prior[0] : t.stats.goals, oppAway = t.idx === 0 ? o.stats.goals : ag.prior[0];
        d = myAway > oppAway ? 0.5 : myAway < oppAway ? -0.5 : 0;
      }
    }
    return d;
  }

  private recoverHalftime() {
    // originalen (sub_6f5810): condition += (Natural Fitness + 15) × 10 af 10000 (1,6-3,5 %); aldersfaktoren kendes ikke
    const orig = this.opts.rules === 'original';
    for (const t of this.teams) for (const s of t.on) s.cond = Math.min(1, s.cond + (orig ? halfTimeRecovery(s.p.attrs[A.naturalFitness]) / 10000 : 0.04));
  }

  private tickFatigue() {
    for (const t of this.teams) {
      // tæt markering og pres af modstanderens spillere koster kræfter
      const extra = (this.oi[t.idx]?.targets ?? []).filter((x) => x.kind === 'tight' || x.kind === 'press').length;
      const tf0 = (1 + 0.15 * (t.ti.tempo - 1)) * (1 + 0.035 * extra) * this.wx.fatigue;
      for (const s of t.on) {
        if (s.off) continue;
        const tf = tf0 * (1 + 0.12 * ((s.instr.closingDown ?? t.ti.closingDown) - 1));
        const isGK = t.tactic.slots[s.slot].pos === 'GK';
        // originalen (sub_6f56c0): (200 − 8,5 × (0,65 × Stamina + aldersled)) – samme samlede skala som vores formel for en
        // typisk professionel (Stamina 14, 26 år), men alder og stamina betyder mere
        const staminaTerm = this.opts.rules === 'original'
          ? (1.3 - 14 / 36) * fatigueDrain(s.p.attrs[A.stamina], s.age ?? 26, 'medium') / fatigueDrain(14, 26, 'medium')
          : 1.3 - s.p.attrs[A.stamina] / 36;
        const drain = 0.00143 * staminaTerm * (isGK ? 0.25 : tf * (1 + 0.12 * Math.max(0, 11 - t.men))) * (1 + 0.06 * (s.p.attrs[A.workRate] - 10) / 10) * (1.1 - s.p.attrs[A.naturalFitness] / 100);
        s.cond = Math.max(0.2, s.cond - drain * (this.opts.rules === 'original' ? ORIG_FATIGUE : 1));
      }
    }
  }

  private play() {
    const T = this.teams[this.poss];
    const O = this.teams[1 - this.poss];
    const z = this.zone;
    this.useDef(O, z % ZL);
    this.useDef(T, z % ZL);
    this.useAtt(T, z % ZL);
    this.useAtt(O, z % ZL);
    T.stats.possession++;
    this.heat[T.idx][z]++;
    this.zoneTotal[z]++;
    if (T.idx === 0) this.zonePoss[z]++;
    const rb = this.rb(T.idx);
    this.bucketThreat += (T.idx === 0 ? 1 : -1) * (rb === 4 ? 0.6 : rb === 3 ? 0.25 : 0);

    // Retur / gennembrud fra forrige moment
    if (this.rebound) {
      const s = this.rebound;
      this.rebound = null;
      this.shoot(T, O, s, 'rebound');
      return;
    }
    if (this.pressed) {
      const s = this.pressed;
      this.pressed = null;
      this.originNext = 'press';
      this.shoot(T, O, s, 'box', 0.03);
      return;
    }
    if (this.breakaway) {
      const s = this.breakaway;
      const origin = this.breakawayOrigin;
      this.breakaway = null;
      this.breakawayOrigin = '';
      if (this.r.chance(0.55)) {
        // redningstackling: den sidste forsvarer når hjem (tackling + fart mod løberens fart + dribling)
        const cover = this.pick(O.zDef[this.zone], (x) => this.a(x, A.pace) + this.a(x, A.tackling));
        if (cover && this.r.chance(clamp(0.1 + (this.a(cover, A.tackling) + this.a(cover, A.pace) - this.a(s, A.pace) - this.a(s, A.dribbling)) / 80, 0.04, 0.3))) {
          // hårde tacklinger: risiko for frispark/straffe og kort
          if (O.ti.tackling === 2 && this.r.chance(0.35) && this.foulCheck(T, O, s, cover, true)) return;
          cover.line.tackles++;
          O.stats.tackles!++; O.stats.tacklesWon!++; cover.line.tckA!++;
          this.rate(cover, 0.2);
          this.line('lastditch', cover, s, true);
          this.highlights.push({ m: this.minute, t: T.idx, kind: 'lastDitch', p: s.p.id, p2: cover.p.id, moment: this.moment });
          if (this.r.chance(0.4)) return this.corner(T, O);
          this.turnover(cover);
          return;
        }
        // professionelt frispark: den sidste mand stopper angriberen ulovligt – rødt kort
        if (cover && this.r.chance(clamp(0.012 + (cover.p.attrs[A.dirtiness] + this.a(cover, A.aggression) - 20) / 700 - (cover.p.attrs[A.sportsmanship] - 10) / 1000, 0.003, 0.04))) {
          O.stats.fouls++;
          this.line('professional-foul', cover, s, true);
          this.sendOff(O, cover, false, 'red-professional');
          this.injuryCheck(s);
          if (this.rb(T.idx) === 4) {
            const taker = this.penTaker(T) ?? s;
            this.line('penalty', s, cover, true);
            return this.shoot(T, O, taker, 'pen');
          }
          this.zone = this.zoneFor(T.idx, 3, 1);
          const fk = T.on.find((x) => x.p.id === T.tactic.freeKicks && !x.off) ?? s;
          return this.shoot(T, O, fk, 'fk');
        }
        this.originNext = origin;
        this.shoot(T, O, s, 'oneOnOne');
        return;
      }
    }

    const carrier = this.held && !this.held.off ? this.held : this.pick(T.zAtt[z], T.playmaker && rb >= 1 && rb <= 3 ? (x) => (x.p.id === T.playmaker ? 2.6 : 1) : undefined);
    if (!carrier) { this.turnover(null); return; }
    const holding = carrier === this.held;
    this.held = null;
    // holder bolden op: medspillerne når frem – afleveringen herfra lander bedre, og en midtbanespiller kan afslutte
    if (holding) {
      if (this.r.chance(0.35)) this.line('hold-up', carrier);
      const lane = this.laneOf(T.idx);
      const late = rb >= 3 ? this.pick(T.zAtt[this.zoneFor(T.idx, 3, lane)], (x) => this.finW(x) * (x.instr.runs + 1), carrier) : null;
      if (late && this.r.chance(0.35)) { this.lastPasser = carrier; this.lastPasserMoment = this.moment; this.line('lay-off', carrier, late); this.setup('layoff', carrier); return this.shoot(T, O, late, 'box', -0.04); }
      return this.pass(T, O, carrier, 0.55, false, 0.5);
    }
    this.holder = carrier.p.id;
    // Løbende dueller/frispark uden for de egentlige aktioner
    if (this.r.chance(0.11)) {
      const def = this.pick(O.zDef[z]);
      if (def && this.foulCheck(T, O, carrier, def, true)) return;
    }
    const lane = this.laneOf(T.idx);
    const wide = lane !== 1;
    const ins = carrier.instr;
    const ti = carrier.instr.passing === undefined ? T.ti : { ...T.ti, passing: carrier.instr.passing };
    const r = this.r.next();

    if (rb <= 1) {
      const longP = [0.06, 0.15, 0.36][ti.passing];
      if (r < longP) return this.longBall(T, O, carrier);
      if (r < longP + 0.05 + (ins.runWithBall ? 0.05 : 0)) return this.dribble(T, O, carrier);
      return this.pass(T, O, carrier, 0.72 + 0.07 * (ti.tempo - 1) + 0.04 * (ti.mentality - 2) - (ti.passing === 0 ? 0.08 : 0) + (ti.passing === 2 ? 0.06 : 0));
    }
    if (rb === 2) {
      const throughP = (ins.throughBalls ? 0.11 : 0.04) + (this.a(carrier, A.creativity) - 10) / 250;
      const longP = [0.02, 0.06, 0.16][ti.passing];
      const dribP = 0.07 + (ins.runWithBall ? 0.08 : 0) + this.a(carrier, A.flair) / 300;
      const lsP = 0.02 + ins.longShots * 0.015;
      if (r < throughP) return this.throughBall(T, O, carrier);
      if (r < throughP + longP) return this.longBall(T, O, carrier);
      if (r < throughP + longP + dribP) return this.dribble(T, O, carrier);
      if (r < throughP + longP + dribP + lsP) return this.shoot(T, O, carrier, 'long');
      return this.pass(T, O, carrier, 0.62 + 0.06 * (ti.tempo - 1) + 0.04 * (ti.mentality - 2) - (ti.passing === 0 ? 0.05 : 0));
    }
    if (rb === 3) {
      if (wide && this.r.chance(0.035) && this.throwIn(T, O)) return;
      const boxZ = this.zoneFor(T.idx, 4, 1);
      const airEdge = clamp((T.aAir[boxZ] - O.qAir[boxZ]) / 18, -0.1, 0.14) * this.vision(carrier);
      const crossP = wide ? Math.max(0.04, 0.16 + 0.12 * ins.crossing + 0.05 * (ti.width - 1) + airEdge) : 0;
      const lsP = 0.13 + 0.05 * ins.longShots + (this.a(carrier, A.longShots) - 10) / 200;
      const paceEdge = clamp((T.aPace[this.zoneFor(T.idx, 4, 1)] - O.qPace[this.zoneFor(T.idx, 4, 1)]) / 40, -0.04, 0.08) * this.vision(carrier);
      const throughP = Math.max(0.03, (ins.throughBalls ? 0.16 : 0.08) + (this.a(carrier, A.creativity) - 10) / 250 + paceEdge);
      const dribP = 0.1 + (ins.runWithBall ? 0.08 : 0) + this.a(carrier, A.flair) / 300;
      let acc = crossP;
      if (r < acc) return this.cross(T, O, carrier);
      if (r < (acc += lsP)) return this.shoot(T, O, carrier, 'long');
      if (r < (acc += throughP)) return this.throughBall(T, O, carrier);
      if (r < (acc += dribP)) return this.dribble(T, O, carrier);
      return this.pass(T, O, carrier, 0.58 + 0.04 * (ti.mentality - 2));
    }
    // rb 4: feltet
    if (wide) {
      const cb = clamp(this.overload(z, T, O) * 0.15, 0, 0.15);
      if (r < 0.4 - cb / 2) return this.cross(T, O, carrier);
      if (r < 0.62 - cb) return this.shoot(T, O, carrier, 'boxWide');
      if (r < 0.78 - cb) return this.dribble(T, O, carrier);
      return this.pass(T, O, carrier, 0.0, true);
    }
    if (r < 0.6) {
      // midtbanespillere der løber med ind i feltet afslutter også – ellers scorer angriberen næsten alt
      if (this.r.chance(0.42)) {
        const late = this.pick(T.zAtt[this.zoneFor(T.idx, 3, lane)], (x) => this.finW(x) * (x.instr.runs + 1), carrier);
        if (late) { this.lastPasser = carrier; this.lastPasserMoment = this.moment; return this.shoot(T, O, late, 'box'); }
      }
      return this.shoot(T, O, carrier, 'box');
    }
    if (r < 0.74) return this.dribble(T, O, carrier);
    return this.pass(T, O, carrier, 0.0, true);
  }

  private pass(T: TeamRT, O: TeamRT, s: SP, forwardP: number, cutback = false, bonus = 0) {
    const rb = this.rb(T.idx);
    const lane = this.laneOf(T.idx);
    let trb = rb, tl = lane, base: number;
    let pulled = 0;
    if (cutback) {
      pulled = lane !== 1 ? Math.max(0, this.overload(this.zone, T, O)) : 0;
      trb = 4; tl = 1; base = 0.62 + pulled * 0.12;
    } else if (this.r.chance(forwardP) && rb < 4) {
      trb = rb + 1;
      base = rb <= 1 ? 0.86 : rb === 2 ? 0.77 : 0.7;
      // banevalg: bred taktik søger kanterne, og en spiller med overblik søger modstanderens svage zoner
      const wideW = 0.35 + 0.3 * T.ti.width;
      const vis = this.vision(s) * SEEK;
      const opts = lane === 1 ? [0, 1, 2] : [lane, 1];
      const ws = opts.map((l) => (l === lane ? 1.1 : l === 1 ? 0.7 : wideW) * Math.exp(vis * this.zoneEdge(this.zoneFor(T.idx, trb, l), T, O)));
      let x = this.r.next() * ws.reduce((a, b) => a + b, 0);
      tl = opts[opts.length - 1];
      for (let i = 0; i < opts.length; i++) { x -= ws[i]; if (x <= 0) { tl = opts[i]; break; } }
      // angrib især en bestemt side
      const fl = this.oi[T.idx]?.focusLane;
      if (fl !== undefined && fl !== tl && this.r.chance(0.3)) tl = fl;
    } else {
      const back = rb > 0 && this.r.chance(0.3);
      trb = back ? rb - 1 : rb;
      tl = lane === 1 ? (this.r.chance(0.5) ? 0 : 2) : 1;
      base = 0.92;
    }
    base += this.wx.pass;
    // kortpasningsspil kræver teknik – og er risikabelt i egen ende mod et hold, der presser højt
    const style = s.instr.passing ?? T.ti.passing;
    if (style === 0) base += (this.a(s, A.technique) + this.a(s, A.passing) - 26.5) / 110 - (O.ti.closingDown - 1) * 0.03 - (rb <= 1 && O.ti.closingDown === 2 ? 0.04 : 0);
    if (style === 2) base -= 0.03;
    const tz = this.zoneFor(T.idx, trb, tl);
    const def = this.pick(O.zDef[tz]);
    T.stats.passes++;
    s.line.passes++;
    const dq = def ? this.pressQ(def, O) : 6;
    const p = logistic(logit(base) + (this.passQ(s) - dq) / 4.5 + this.overload(tz, T, O) * 0.8 - ((def?.instr.closingDown ?? O.ti.closingDown) - 1) * 0.12 + bonus);
    if (this.r.chance(p)) {
      T.stats.passesCompleted++;
      s.line.passesOk++;
      // førsteberøring: en fremadrettet bold skal tages ned under pres
      let recvP: SP | null = null;
      if (trb > rb && trb >= 2 && !cutback) {
        const recv = this.pick(T.zAtt[tz], undefined, s);
        recvP = recv;
        if (recv) {
          const touch = 0.55 * this.a(recv, A.technique) + 0.25 * this.a(recv, A.agility) + 0.2 * this.a(recv, A.decisions);
          if (this.r.chance(clamp(0.05 + (11 - touch) / 45 + (O.ti.closingDown - 1) * 0.015 - this.wx.pass + this.wx.touch, 0.005, 0.18))) {
            this.pbp(this.passKind(rb, lane, trb, tl), s, recv);
            this.zone = tz;
            if (this.r.chance(0.2)) this.line('poor-touch', recv);
            this.turnover(def);
            return;
          }
          if (trb >= 3 && recv.instr.holdUp && this.r.chance(0.4)) this.held = recv;
          else if (touch >= 15.5 && this.r.chance(0.03)) this.line('great-touch', recv);
        }
      }
      this.rate(s, trb > rb ? 0.025 : 0.008);
      if (!cutback) this.pbp(this.passKind(rb, lane, trb, tl), s, recvP);
      this.zone = tz;
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      // presset spillet igennem: et hold der presser højt, har ikke folk bag bolden
      if (trb > rb && trb <= 2 && O.ti.closingDown === 2 && this.r.chance(0.12 + (this.passQ(s) - 11) / 60)) this.zone = this.zoneFor(T.idx, trb + 1, tl);
      if (cutback) {
        const shooter = this.pick(T.zAtt[tz], (x) => this.finW(x), s);
        if (shooter) { this.lastPasser = s; this.shoot(T, O, shooter, 'cutback', pulled * 0.06); }
      }
      if (trb >= 3 && this.r.chance(0.04)) this.line('pass-forward', s);
    } else {
      this.rate(s, -0.04);
      this.rate(def, 0.05);
      if (def) { def.line.tackles++; def.line.tckA!++; O.stats.tackles!++; O.stats.tacklesWon!++; }
      this.pbp('pl-icpt', def, s);
      this.zone = tz;
      this.turnover(def);
    }
  }

  /** Afleveringens retning set fra holdet (CM 01/02: forward/left/right/back/wing) */
  private passKind(rb: number, lane: number, trb: number, tl: number): string {
    if (trb > rb) return tl !== lane && tl !== 1 ? `pl-wing-${tl === 0 ? 'l' : 'r'}` : trb >= 4 ? 'pl-area' : 'pl-fwd';
    if (trb < rb) return 'pl-back';
    return tl < lane ? 'pl-side-l' : tl > lane ? 'pl-side-r' : 'pl-fwd';
  }

  private longBall(T: TeamRT, O: TeamRT, s: SP) {
    const rb = this.rb(T.idx);
    const trb = Math.min(4, rb + 2 + (this.r.chance(0.3) ? 1 : 0));
    const lane = this.r.chance(0.5) ? 1 : this.r.chance(0.5) ? 0 : 2;
    const tz = this.zoneFor(T.idx, Math.min(3, trb), lane);
    const recv = this.pick(T.zAtt[tz], (x) => this.aerial(x) ** 2 * (x.p.id === T.targetMan ? 3 : 1), s);
    const def = this.pick(O.zDef[tz], (x) => Math.sqrt(this.aerial(x)));
    T.stats.passes++;
    s.line.passes++;
    if (!recv) { this.zone = tz; this.turnover(def); return; }
    const pq = this.a(s, A.passing) * 0.6 + this.a(s, A.technique) * 0.4;
    // bolde bag en høj kæde: fart mod fart; et hold der presser højt, efterlader plads bag sig
    if (trb >= 3 && recv && this.r.chance(Math.min(0.6, (O.ti.offside ? 0.2 : 0.13) * (this.opts.offside ?? 1)))) {
      T.stats.offsides++;
      this.line('offside', recv);
      this.zone = tz;
      this.turnover(null);
      return;
    }
    const behind = trb >= 3 ? (O.ti.mentality - 2) * 0.12 + (O.ti.closingDown - 1) * 0.15 + (O.ti.offside ? 0.1 : 0) + (recv && def ? (this.speed(recv) - this.speed(def)) / 30 : 0) : 0;
    const p = logistic(logit(0.42) + (this.aerial(recv) - (def ? this.aerial(def) : 5)) / 3.5 + (pq - 10) / 12 + this.overload(tz, T, O) * 0.6 + this.wx.air + behind);
    this.zone = tz;
    const won = this.r.chance(p);
    if (def) this.header(T, O, won, recv, def);
    if (won) {
      T.stats.passesCompleted++;
      s.line.passesOk++;
      this.rate(recv, 0.04);
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      if (this.r.chance(0.06)) this.line('longball', s, recv);
      // en stærk angriber der holder bolden op, venter på medspillerne
      if ((recv.instr.holdUp || recv.p.id === T.targetMan) && this.r.chance(clamp(0.45 + (this.a(recv, A.strength) + this.a(recv, A.balance) - 22) / 30, 0.15, 0.8))) this.held = recv;
      else if (trb >= 3 && this.r.chance(0.06)) { this.line('knock-down', recv); this.setup('knockdown', recv); }
    } else {
      this.rate(def, 0.05);
      this.turnover(def);
    }
  }

  private dribble(T: TeamRT, O: TeamRT, s: SP) {
    const rb = this.rb(T.idx);
    const def = this.pick(O.zDef[this.zone], (x) => Math.sqrt(this.tackQ(x, O)));
    const dq = def ? this.tackQ(def, O) : 5;
    // på kanten er der plads at løbe i: en hurtig kantspiller mod en langsom back er en fordel i sig selv
    const wide = this.laneOf(T.idx) !== 1;
    const speedDuel = wide && def ? (this.speed(s) - this.speed(def)) / 16 : 0;
    const p = logistic(logit(0.5) + (this.dribQ(s) - dq) / 4 + this.overload(this.zone, T, O) * 0.6 + speedDuel + this.wx.drib);
    if (def) { O.stats.tackles!++; def.line.tckA!++; }
    if (this.r.chance(p)) {
      this.rate(s, 0.07);
      if (rb < 4) {
        this.zone = this.zoneFor(T.idx, rb + 1, this.laneOf(T.idx));
        if (rb + 1 >= 3 && this.r.chance(0.18)) this.line('dribble', s, def);
      } else {
        this.line('dribble-box', s, def);
        this.originNext = 'dribble';
        this.shoot(T, O, s, 'box', 0.04);
      }
      return;
    }
    if (def) { def.line.tackles++; O.stats.tacklesWon!++; this.rate(def, 0.07); }
    // på kanten ryger bolden ud over sidelinjen: indkast (kun til statistikken, *estimeret*)
    if (def && wide) T.stats.throwIns!++;
    this.rate(s, -0.03);
    if (def && this.foulCheck(T, O, s, def)) return;
    // på kanten tæt på feltet: forsvareren sparker bolden over baglinjen
    if (def && wide && rb >= 3 && this.r.chance(0.2)) return this.corner(T, O);
    // i feltet: angriberen går ned – filmning eller en appel, som dommeren afviser
    if (def && rb === 4 && this.r.chance(0.05 + (10 - s.p.attrs[A.sportsmanship]) / 300)) {
      const dive = this.r.chance(clamp(0.45 - s.p.attrs[A.sportsmanship] / 50, 0.1, 0.5));
      if (dive && this.r.chance(0.18 / this.ref)) {
        // dommeren bliver snydt
        this.line('dive-pen', s, def, true);
        const taker = this.penTaker(T) ?? s;
        return this.shoot(T, O, taker, 'pen');
      }
      if (dive && this.r.chance(0.35 * this.ref)) { this.line('dive-booked', s, def, true); this.book(T, s); }
      else this.line('pen-appeal', s, def);
    }
    this.turnover(def);
  }

  private throughBall(T: TeamRT, O: TeamRT, s: SP) {
    const rb = this.rb(T.idx);
    const lane = this.laneOf(T.idx);
    const tz = this.zoneFor(T.idx, Math.min(4, rb + 1), lane === 1 ? 1 : this.r.chance(0.6) ? 1 : lane);
    const runner = this.pick(T.zAtt[tz], (x) => this.runQ(x) * (x.instr.runs + 1), s);
    if (!runner) return this.pass(T, O, s, 0.5);
    const def = this.pick(O.zDef[tz], (x) => this.a(x, A.positioning));
    T.stats.passes++;
    s.line.passes++;
    // Offside-fælde
    if (this.r.chance(clamp(((O.ti.offside ? 0.3 : 0.2) - (this.a(runner, A.anticipation) + this.a(runner, A.offTheBall) - 20) / 180) * (this.opts.offside ?? 1), 0.04, 0.6))) {
      T.stats.offsides++;
      this.rate(runner, -0.05);
      this.line('offside', runner);
      this.highlights.push({ m: this.minute, t: T.idx, kind: 'offside', p: runner.p.id, p2: s.p.id, moment: this.moment });
      this.zone = this.zoneFor(T.idx, Math.min(4, rb + 1), 1);
      this.turnover(null);
      return;
    }
    const tq = 0.5 * this.a(s, A.creativity) + 0.3 * this.a(s, A.passing) + 0.2 * this.a(s, A.decisions);
    const dq = def ? 0.35 * this.a(def, A.positioning) + 0.35 * this.a(def, A.anticipation) + 0.3 * this.a(def, A.pace) : 5;
    // stikningen bag kæden: løberens fart mod forsvarerens (en hurtig angriber mod langsomme forsvarere er en fordel)
    const speedDuel = def ? (this.speed(runner) - this.speed(def)) / 16 : 0;
    const p = logistic(logit(0.39) + (0.5 * tq + 0.5 * this.runQ(runner) - dq) / 4 + (O.ti.offside ? 0.3 : 0) + this.overload(tz, T, O) * 0.4 + speedDuel);
    if (this.r.chance(p)) {
      T.stats.passesCompleted++;
      s.line.passesOk++;
      this.rate(s, 0.1);
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      this.zone = this.zoneFor(T.idx, Math.min(4, rb + 1), 1);
      if (rb + 1 >= 3) {
        this.line('throughball', s, runner);
        this.breakaway = runner;
        this.breakawayOrigin = 'through';
      }
    } else {
      this.rate(s, -0.03);
      this.rate(def, 0.05);
      this.zone = tz;
      this.turnover(def);
    }
  }

  private cross(T: TeamRT, O: TeamRT, s: SP, setPiece = false, bonus = 0, throwIn = false): void {
    const boxZ = this.zoneFor(T.idx, 4, 1);
    // lavt indlæg langs jorden, når holdet ikke vinder i luften (ikke ved dødbolde)
    if (!setPiece && this.r.chance(clamp(0.28 + (O.qAir[boxZ] - T.aAir[boxZ]) / 14, 0.12, 0.6))) return this.lowCross(T, O, s, boxZ);
    const blocker = this.pick(O.zDef[this.zone]);
    const cq = 0.7 * this.a(s, throwIn ? A.throwIns : setPiece ? A.corners : A.crossing) + 0.3 * this.a(s, throwIn ? A.strength : A.technique);
    // overtal på kanten giver tid og plads til at slå indlægget (kantspil mod en smal formation)
    const room = setPiece ? 0 : this.overload(this.zone, T, O) * 0.7;
    // overtal på kanten trækker forsvaret ud: indlægget kommer ind mod en forsvarskæde i bevægelse
    const pulled = setPiece ? 0 : Math.max(0, this.overload(this.zone, T, O));
    const deliver = logistic(logit(setPiece ? 0.72 : 0.62) + (cq - (blocker ? this.a(blocker, A.positioning) : 5)) / 5 + bonus + this.wx.air + room);
    if (!this.r.chance(deliver)) {
      this.rate(s, -0.03);
      if (!setPiece && this.r.chance(0.5)) return this.corner(T, O);
      this.zone = boxZ;
      this.turnover(blocker);
      return;
    }
    // ved dødbolde går de spillere med frem, der har ordre til det (standard: midtstoppere og angribere)
    const target = setPiece
      ? this.pick(T.on.filter((x) => !x.off && x !== s && slotRole(T.tactic.slots[x.slot]) !== 'GK').map((sp) => ({ sp, w: [0, 0.35, 1][this.setPieceRole(T, sp)] })), (x) => this.aerial(x) ** 1.3)
      : this.pick(T.zAtt[boxZ], (x) => this.aerial(x) ** 1.3 * (x.instr.runs + 1) * (x.p.id === T.targetMan ? 2.5 : 1), s);
    const marker = this.pick(O.zDef[boxZ], (x) => Math.sqrt(this.aerial(x)));
    if (!target) { this.zone = boxZ; this.turnover(marker); return; }
    const gk = this.gk(O);
    const claim = setPiece ? 0.12 : 0.08;
    if (this.r.chance(claim * (this.a(gk, A.handling) / 12))) {
      this.rate(gk, 0.05);
      this.zone = boxZ;
      this.line('gk-claims', gk);
      this.turnover(gk);
      return;
    }
    const p = logistic(logit(setPiece ? 0.52 : 0.5) + (this.aerial(target) - (marker ? this.aerial(marker) : 5)) / 3.5 + this.overload(boxZ, T, O) * 0.5 + pulled * 0.6);
    const won = this.r.chance(p);
    if (marker) this.header(T, O, won, target, marker);
    if (won) {
      this.rate(s, 0.05);
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      this.zone = boxZ;
      if (this.opts.commentary && this.r.chance(0.5)) this.line(setPiece ? 'corner-in' : 'cross', s, target);
      if (!setPiece) this.originNext = 'cross';
      // vundet klart i luften: friere hovedstød
      this.shoot(T, O, target, 'header', clamp((this.aerial(target) - (marker ? this.aerial(marker) : 8)) / 70, -0.03, 0.06) + pulled * 0.035 + (setPiece ? 0.035 : 0));
    } else {
      this.rate(marker, 0.05);
      this.zone = boxZ;
      // forsvareren når først, men header i eget net
      if (marker && this.r.chance(0.006)) { this.goal(T, O, marker, null, 'og'); return; }
      if (this.r.chance(0.42)) return this.corner(T, O);
      this.turnover(marker);
    }
  }

  /** 0 bliver hjemme, 1 normal, 2 går med frem ved dødbolde */
  private setPieceRole(T: TeamRT, sp: SP): number {
    if (sp.instr.setPieces !== undefined) return sp.instr.setPieces;
    const role = slotRole(T.tactic.slots[sp.slot]);
    return role === 'CB' || role === 'ST' ? 2 : role === 'FB' || role === 'W' ? 0 : 1;
  }

  /** Lavt indlæg/tilbagelægning langs jorden: løberen mod forsvarerens placering */
  private lowCross(T: TeamRT, O: TeamRT, s: SP, boxZ: number): void {
    const runner = this.pick(T.zAtt[boxZ], (x) => this.finW(x) * (x.instr.runs + 1), s);
    const def = this.pick(O.zDef[boxZ]);
    if (!runner) { this.zone = boxZ; this.turnover(def); return; }
    const cq = 0.6 * this.a(s, A.crossing) + 0.4 * this.a(s, A.technique);
    const dq = def ? 0.5 * this.a(def, A.positioning) + 0.5 * this.a(def, A.anticipation) : 6;
    const p = logistic(logit(0.42) + (0.5 * cq + 0.5 * this.runQ(runner) - dq) / 4 + Math.max(0, this.overload(this.zone, T, O)) * 0.5 + this.wx.pass);
    this.zone = boxZ;
    if (this.r.chance(p)) {
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      this.originNext = 'cross';
      if (this.r.chance(0.3)) this.line('low-cross', s, runner);
      this.setup('lowcross', s);
      return this.shoot(T, O, runner, 'box', 0.015);
    }
    this.rate(def, 0.04);
    if (def && this.r.chance(0.004)) { this.shots.push({ m: this.minute, t: T.idx, zone: this.zone, xg: 0, outcome: 'goal', p: s.p.id, kind: 'og', og: def.p.id, origin: 'cross' }); this.goal(T, O, def, null, 'og'); return; }
    if (this.r.chance(0.3)) return this.corner(T, O);
    this.turnover(def);
  }

  /** Et blokeret skud tæller ikke som skud i statistikken, hvis databasen ønsker det (som i originalen) */
  private uncount(T: TeamRT, s: SP) {
    if (this.opts.countBlocked !== false) return;
    T.stats.shots--;
    s.line.shots--;
  }

  private corner(T: TeamRT, O: TeamRT): void {
    // færre hjørnespark (original database): bolden går til målspark
    if (this.opts.corners !== undefined && !this.r.chance(this.opts.corners)) { this.turnover(null); return; }
    T.stats.corners++;
    const takerId = T.tactic.corners;
    let taker = T.on.find((x) => x.p.id === takerId && !x.off) ?? this.pick(T.zAtt[this.zoneFor(T.idx, 3, 1)]) ?? T.on[0];
    const lane = this.r.chance(0.5) ? 0 : 2;
    // hjørnespark fra højre: højre-skytten (CM 01/02 Corners (R))
    if (lane === 2 && T.tactic.cornersR) taker = T.on.find((x) => x.p.id === T.tactic.cornersR && !x.off) ?? taker;
    this.zone = this.zoneFor(T.idx, 4, lane);
    this.corners.push({ m: this.minute, t: T.idx, taker: taker.p.id, lane, moment: this.moment });
    if (this.r.chance(0.3)) this.line('corner', taker);
    const cr = this.r.next();
    if (cr < 0.08) {
      // kort hjørnespark: bolden bliver på kanten
      if (this.r.chance(0.4)) this.line('short-corner', taker);
      this.setup('shortcorner', taker);
      this.zone = this.zoneFor(T.idx, 3, lane);
      return;
    }
    if (cr < 0.12) {
      // til kanten af feltet: en med et godt skud venter
      const edge = this.pick(T.zAtt[this.zoneFor(T.idx, 3, 1)], (x) => this.a(x, A.longShots) ** 2, taker);
      if (edge) { this.zone = this.zoneFor(T.idx, 3, 1); this.line('corner-edge', taker, edge); this.setup('edge', taker); return this.shoot(T, O, edge, 'long', 0.01); }
    }
    this.cross(T, O, taker, true);
  }

  /** Indkast højt på banen: en spiller med langt indkast kaster ind i feltet som et indlæg */
  /** Luftduel til kampstatistikken (Headers Won) – trækker ingen tilfældige tal */
  private header(T: TeamRT, O: TeamRT, won: boolean, a: SP, d: SP) {
    T.stats.headers!++; O.stats.headers!++;
    (won ? T : O).stats.headersWon!++;
    a.line.hea!++; d.line.hea!++;
    (won ? a : d).line.heaW!++;
  }

  private throwIn(T: TeamRT, O: TeamRT) {
    T.stats.throwIns!++;
    const lane = this.laneOf(T.idx);
    const thrower = this.pick(T.zAtt[this.zone], (x) => this.a(x, A.throwIns) ** 3);
    if (!thrower) return false;
    if (this.a(thrower, A.throwIns) >= 13 && this.r.chance(0.55)) {
      this.line('long-throw', thrower);
      this.setup('longthrow', thrower);
      this.zone = this.zoneFor(T.idx, 4, lane);
      this.cross(T, O, thrower, true, -0.2, true);
      return true;
    }
    return false;
  }

  private foulCheck(T: TeamRT, O: TeamRT, victim: SP, def: SP, forced = false): boolean {
    const dirt = def.p.attrs[A.dirtiness] + this.a(def, A.aggression);
    // en spiller med gult kort holder igen i tacklingerne
    if (def.yellow > 0 && !forced && this.r.chance(0.6)) return false;
    const tk = def.instr.tackling ?? O.ti.tackling;
    let fp = forced ? 1 + (tk - 1) * 0.25 + (dirt - 20) / 40 - 0.25 : 0.11 + (tk - 1) * 0.05 + (dirt - 20) / 220;
    // … også i de pressede dueller (ellers bliver andet gule kort alt for almindeligt)
    if (def.yellow > 0) fp *= 0.6;
    // hårde tacklinger på en bestemt spiller giver flere frispark (og kort)
    if (this.oi[O.idx]?.targets.some((x) => x.pid === victim.p.id && x.kind === 'hard')) fp *= 1.45;
    if (!this.r.chance(clamp(fp, 0.03, forced ? 1 : 0.35))) return false;
    // fordel: et angreb i gang på modstanderens halvdel får lov at fortsætte
    if (!forced && this.rb(T.idx) >= 2 && this.r.chance(0.22)) {
      O.stats.fouls++;
      if (this.r.chance(0.25)) this.line('advantage', victim, def);
      return false;
    }
    O.stats.fouls++;
    // frispark uden kort −0,025 (originalen, sub_6ea4e0) – et kort erstatter det (se book/sendOff)
    this.rate(def, RATING.foulNoCard);
    this.foulBy = def;
    this.injuryCheck(victim);
    // Kort
    if (this.opts.rules === 'original') this.originalCard(O, def, tk, dirt);
    else {
    // kalibreret (scripts/cards.ts): ~2 røde kort pr. hold pr. sæson, heraf ~40% andet gule kort
    const yp = (0.13 + 0.1 * (def.p.attrs[A.dirtiness] / 20) + (O.ti.tackling === 2 ? 0.03 : 0) - (def.p.attrs[A.temperament] - 10) / 200) * (def.yellow > 0 ? 0.2 : 1);
    if (this.r.chance((RED_BASE + def.p.attrs[A.dirtiness] / 8000) * this.ref)) this.sendOff(O, def, false);
    else if (this.r.chance(yp * this.ref)) {
      this.book(O, def);
      // protester: en hidsig spiller kan få et kort mere for at brokke sig
      if (!def.off && this.r.chance(0.012 * this.ref * (1.4 - def.p.attrs[A.temperament] / 20))) { this.line('dissent', def); this.book(O, def); }
    }
    }
    const rb = this.rb(T.idx);
    const lane = this.laneOf(T.idx);
    if (this.poss !== T.idx) return true; // røde kort kan ikke flytte bolden; sikkerhed
    // kun en del af frisparkene i feltet er straffespark (~0,3 pr. kamp); resten er frispark lige uden for
    if (rb === 4 && this.r.chance(0.3)) {
      this.line('penalty', victim, def, true);
      const taker = this.penTaker(T) ?? victim;
      this.shoot(T, O, taker, 'pen');
      return true;
    }
    if (rb >= 3) {
      this.line('freekick', victim, def);
      const takerId = lane === 2 && T.tactic.freeKicksR ? T.tactic.freeKicksR : T.tactic.freeKicks;
      const taker = T.on.find((x) => x.p.id === takerId && !x.off) ?? T.on.find((x) => x.p.id === T.tactic.freeKicks && !x.off) ?? victim;
      if (lane === 1 && this.r.chance(0.55)) this.shoot(T, O, taker, 'fk');
      else this.cross(T, O, taker, true, 0.2);
      return true;
    }
    if (this.r.chance(0.08)) this.line('foul', def, victim);
    return true; // bolden forbliver hos angriberne
  }

  /**
   * CM 01/02's kortregel (sub_6e9820/sub_6ea4e0, motorplanens regel 4): alvorlighed = rand(spillerens frispark + a) + b
   * + dommerens skævhed (Discipline), mildere for en advaret spiller og i de første minutter; rødt hvis alvorlighed >
   * rand(15) + 7, gult hvis > rand(6). Tacklingstyperne er *estimeret* fra vores tacklinger (normal 42, hård/sen 44,
   * vild 48); andelen af frispark af korttyper (`opts.cards`) er ukendt i originalen og kalibreret (docs/ENGINE.md).
   */
  private originalCard(O: TeamRT, def: SP, tackling: number, dirt: number) {
    const rand: Rand = (n) => (n <= 0 ? 0 : Math.floor(this.r.next() * n));
    def.fouls = (def.fouls ?? 0) + 1;
    if (!this.r.chance(this.opts.cards ?? 1)) return; // frispark af en type, der aldrig giver kort (fx 12/43)
    // hård tackling (instruks 2) giver af og til en sen/hård type 44, sjældent en vild 48; ellers en almindelig 42.
    // Aggression/Dirtiness påvirker kun, hvor ofte der begås frispark (som i originalen) – ikke kortet
    void dirt;
    const type = this.r.chance(tackling >= 2 ? 0.3 : HARD_SHARE) ? (this.r.chance(0.08) ? 48 : 44) : 42;
    const d = this.opts.referee?.discipline ?? 10, limit = this.opts.referee?.limit ?? 0;
    const sev = cardSeverity(rand, type, def.fouls - 1, d, def.yellow > 0, this.minute, O.stats.fouls > limit + 5);
    const card = cardFor(rand, sev);
    if (card === 'red') this.sendOff(O, def, false);
    else if (card === 'yellow') this.book(O, def, true);
  }

  private book(t: TeamRT, sp: SP, ruled = false) {
    // færre advarsler (original database): dommeren nøjes med en irettesættelse (ikke når originalens regel har afgjort det)
    if (!ruled && this.opts.cards !== undefined && !this.r.chance(this.opts.cards)) return;
    this.stoppage += 0.25;
    sp.yellow++;
    t.stats.yellows++;
    // gult kort −0,225, efter 45' × 45/minut (originalen, sub_6ea4e0)
    this.rate(sp, yellowRatingDelta(this.minute) - (this.foulBy === sp ? RATING.foulNoCard : 0));
    this.foulBy = null;
    if (sp.yellow >= 2) {
      this.sendOff(t, sp, true);
      return;
    }
    sp.line.yellow = 1;
    this.events.push({ m: this.minute, t: t.idx, k: 'yellow', p: sp.p.id });
    this.line('yellow', sp, null, true);
  }

  private sendOff(t: TeamRT, sp: SP, second: boolean, why?: string) {
    this.stoppage += 0.4;
    sp.off = true;
    sp.line.red = true;
    sp.line.yellow = second ? 1 : sp.line.yellow;
    t.stats.reds++;
    // rødt kort −1,0 – for et professionelt frispark −0,75 (originalen, sub_6ea4e0)
    this.rate(sp, (why === 'red-professional' ? RATING.redProfessional : RATING.red) - (this.foulBy === sp ? RATING.foulNoCard : 0));
    this.foulBy = null;
    this.events.push({ m: this.minute, t: t.idx, k: 'red', p: sp.p.id });
    this.line(second ? 'second-yellow' : why ?? 'red', sp, null, true);
    sp.line.minutes = this.playedMinutes(sp);
    this.buildZones(t);
  }

  /**
   * CM 01/02's knocks (sub_6cfe10/sub_6d0980, regel 8): risikoen stiger med træthed og skadesudsathed; en knock bliver en
   * skade, hvis alvorligheden > 50, og koster ellers kondition. Spilleren må ud, hvis konditionen falder under 50 % eller
   * under 71 % + 0,25 % × skadesudsathed (AI-hold skifter ud; menneskets hold spiller videre med en træt spiller).
   */
  private knockCheck(sp: SP) {
    if (sp.off || sp.line.injured) return;
    const t = this.teams[sp.team];
    const rand: Rand = (n) => (n <= 0 ? 0 : Math.floor(this.r.next() * n));
    if (!knockAllowed(rand, t.forcedOff ?? 0)) return;
    const prone = sp.p.attrs[A.injuryProneness];
    if (!knock(rand, sp.cond * 10000, prone, !!sp.p.injury, 1)) return;
    const k = knockSeverity(rand, sp.cond * 10000, prone, !!sp.p.injury);
    sp.cond = clamp(k.condition / 10000, 0.2, 1);
    if (k.injured) { this.injure(sp); return; }
    if (k.forcedOff && t.subsLeft > 0 && t.benchIds.length && this.opts.aiSubs?.[t.idx] !== false) {
      t.forcedOff = (t.forcedOff ?? 0) + 1;
      this.line('injury', sp, null, false);
      this.autoSub(t, sp);
    }
  }

  private injuryCheck(sp: SP) {
    if (this.opts.rules === 'original') { this.knockCheck(sp); return; }
    const p = 0.013 * (0.35 + sp.p.attrs[A.injuryProneness] / 12) * (sp.cond < 0.55 ? 1.6 : 1);
    if (!this.r.chance(p)) return;
    this.injure(sp);
  }

  private injure(sp: SP) {
    sp.line.injured = true;
    this.stoppage += 0.8;
    const t = this.teams[sp.team];
    this.events.push({ m: this.minute, t: t.idx, k: 'injury', p: sp.p.id });
    this.line('injury', sp, null, true);
    // menneskets hold skifter selv ud (kampen pauses i UI'et) – kun AI-hold skifter automatisk
    if (t.subsLeft > 0 && t.benchIds.length && this.opts.aiSubs?.[t.idx] !== false) {
      this.autoSub(t, sp);
    } else if ((t.subsLeft <= 0 || !t.benchIds.length) && this.opts.aiSubs?.[t.idx] === false && !sp.off
      && t.tactic.slots[sp.slot]?.pos !== 'GK' && t.on.filter((x) => !x.off).length > 8) {
      // ingen udskiftninger tilbage: han må ud, og holdet spiller videre med en mand mindre (som i CM 01/02)
      sp.off = true;
      sp.line.minutes = this.playedMinutes(sp);
      this.buildZones(t);
    } else {
      sp.cond = Math.min(sp.cond, 0.35);
    }
  }

  private setup(k: string, by: SP) { this.setupNext = { k, by: by.p.id, moment: this.moment }; }

  private shoot(T: TeamRT, O: TeamRT, s: SP, kind: string, bonus = 0): void {
    this.holder = s.p.id;
    const z = this.zone;
    const base: Record<string, number> = { box: 0.145, boxWide: 0.055, long: 0.035, header: 0.095, oneOnOne: 0.33, cutback: 0.21, pen: 0.76, fk: 0.07, rebound: 0.24 };
    let xg = (base[kind] ?? 0.08) + bonus;
    if (kind === 'box' || kind === 'boxWide' || kind === 'header' || kind === 'long' || kind === 'cutback') {
      // chancekvaliteten afhænger af forholdet mellem angribere og forsvarere i zonen: en ekstra
      // midtstopper hjælper mod to angribere, men er spildt mod én (aftagende værdi)
      xg *= clamp(1.24 - 0.15 * O.wDef[z], 0.55, 1.3);
      // mere plads når forsvaret er i undertal
      if (O.men < T.men) xg *= 1 + SPACE_XG * (T.men - O.men);
    }
    xg = clamp(xg, 0.01, 0.8);
    // forsvaret når at lukke af, før skuddet går af (kun med profilens `close`)
    if (this.opts.close && (kind === 'box' || kind === 'boxWide' || kind === 'long' || kind === 'cutback')) {
      const d = this.pick(O.zDef[z]);
      if (d) {
        const dq = 0.35 * this.a(d, A.marking) + 0.3 * this.a(d, A.positioning) + 0.2 * this.a(d, A.anticipation) + 0.15 * this.a(d, A.tackling);
        // kun forsvarerens kvalitet: gode forsvar lukker flere chancer, uden at de bedste angribere scorer endnu mere
        if (this.r.chance(clamp(this.opts.close * Math.exp((dq - 12) / (this.opts.closeSlope ?? 6)), 0, 0.7))) {
          d.line.tackles++;
          O.stats.tackles!++; O.stats.tacklesWon!++; d.line.tckA!++;
          this.rate(d, 0.05);
          this.line('closed-down', d, s);
          this.setupNext = null;
          this.originNext = '';
          this.highlights.push({ m: this.minute, t: T.idx, kind: 'closedDown', p: s.p.id, p2: d.p.id, moment: this.moment });
          this.turnover(d);
          return;
        }
      }
    }
    T.stats.shots++;
    T.stats.xg += xg;
    s.line.shots++;
    this.bucketThreat += (T.idx === 0 ? 1 : -1) * xg * 4;
    const gk = this.gk(O);
    const q = kind === 'header' ? this.aerial(s) * 0.6 + this.a(s, A.heading) * 0.4
      : kind === 'long' ? 0.7 * this.a(s, A.longShots) + 0.3 * this.a(s, A.technique)
      : kind === 'pen' ? 0.6 * this.a(s, A.penalties) + 0.2 * this.a(s, A.technique) + 0.2 * s.p.attrs[A.pressure]
      : kind === 'fk' ? 0.7 * this.a(s, A.freeKicks) + 0.3 * this.a(s, A.technique)
      : this.finQ(s);
    // afslutning med det svage ben (tobenede spillere har ingen svaghed)
    const weak = kind !== 'header' && kind !== 'pen' && kind !== 'fk' && s.p.foot !== 'B' && this.r.chance(0.26);
    const qf = weak ? q - 2.2 : q;
    if (weak && this.r.chance(0.08)) this.line('weak-foot', s);
    const gq = kind === 'oneOnOne' ? this.gk1v1(gk) : this.gkQ(gk);
    const mult = (kind === 'pen' ? 1.04 : FINISH_SCALE * (this.opts.finish ?? 1)) * Math.exp((qf - gq) / (this.opts.finSlope ?? 13));
    const k1 = this.opts.oneOnOneK !== undefined && (kind === 'oneOnOne' || kind === 'rebound') ? this.opts.oneOnOneK : 1;
    const od = this.opts.openDamp, tot = this.teams[0].stats.goals + this.teams[1].stats.goals;
    const damp = od && tot >= od[0] ? od[1] ** (tot - od[0] + 1) : 1;
    const goalP = clamp(xg * mult * k1 * (kind === 'pen' ? 1 : this.wx.finish) * damp, 0.004, 0.92);
    const assister = this.lastPasser && this.lastPasser !== s && this.lastPasser.team === T.idx && this.moment - this.lastPasserMoment <= 2 ? this.lastPasser : null;
    const rec: ShotRecord = { m: this.minute, t: T.idx, zone: z, xg: Math.round(xg * 100) / 100, outcome: 'off', p: s.p.id, kind };
    if (this.originNext) { rec.origin = this.originNext; this.originNext = ''; }
    // opspillet hører kun til en afslutning af den rigtige slags (fx kanten af feltet → langskud)
    if (this.setupNext && this.moment - this.setupNext.moment <= 2 && SETUP_KINDS[this.setupNext.k]?.includes(kind)) { rec.setup = this.setupNext.k; rec.setupBy = this.setupNext.by; }
    this.setupNext = null;
    // skud direkte efter et hjørnespark (samme øjeblik)
    const cn = this.corners.at(-1);
    if (cn && cn.moment === this.moment && cn.t === T.idx && !cn.shot) { cn.shot = true; rec.corner = cn.taker; }
    this.shots.push(rec);
    // Blokering
    // direkte frispark: muren tager en del af dem
    if (kind === 'fk' && this.r.chance(0.22)) {
      rec.outcome = 'blocked';
      this.uncount(T, s);
      this.line('fk-wall', s);
      if (this.r.chance(0.4)) return this.corner(T, O);
      this.turnover(null);
      return;
    }
    const blk0 = this.pick(O.zDef[z]);
    if ((kind === 'box' || kind === 'long' || kind === 'boxWide') && this.r.chance(clamp((0.1 + 0.05 * O.wDef[z]) * (0.85 + (blk0 ? this.a(blk0, A.bravery) : 10) / 66), 0.08, 0.32))) {
      rec.outcome = 'blocked';
      this.uncount(T, s);
      const blk = blk0;
      if (blk) rec.blocker = blk.p.id;
      // et skud der rammer en forsvarer, kan gå i eget net
      if (blk && kind !== 'long' && this.r.chance(0.012)) { rec.outcome = 'goal'; rec.og = blk.p.id; this.goal(T, O, blk, null, 'og'); return; }
      this.rate(blk, 0.06);
      this.line('shot-blocked', s, blk);
      if (this.r.chance(0.55)) return this.corner(T, O);
      this.turnover(blk);
      return;
    }
    if (this.r.chance(goalP)) {
      // offside? Gennembrud og afslutninger i feltet kan være offside – linjedommeren kan tage fejl,
      // men med VAR bliver tætte situationer tjekket og rettet
      const risk = kind === 'oneOnOne' ? 0.2 : kind === 'box' || kind === 'cutback' || kind === 'header' || kind === 'rebound' ? 0.1 : 0;
      let routineCheck = false;
      if (risk > 0) {
        const reallyOff = this.r.chance(risk + (O.ti.offside ? 0.04 : 0));
        const flagged = reallyOff ? this.r.chance(0.85) : this.r.chance(0.025);
        const checked = !!this.opts.var && (reallyOff !== flagged || flagged || this.r.chance(0.12));
        const disallow = checked ? reallyOff : flagged;
        if (disallow) {
          rec.outcome = 'offside';
          T.stats.offsides++;
          this.rate(s, -0.05);
          // først jubel – så kommer skuffelsen
          this.line('goal-cheer', s, null, true);
          if (checked) { this.line('var-check', s, null, true); this.line('var-disallowed', s, null, true); }
          else this.line('goal-offside', s, null, true);
          this.events.push({ m: this.minute, t: T.idx, k: 'offside-goal', p: s.p.id });
          this.zone = this.zoneFor(O.idx, 0, 1);
          this.poss = O.idx;
          return;
        }
        // flaget gik op, men VAR godkender målet
        if (checked && flagged) { this.line('var-check', s, null, true); this.line('var-given', s, null, true); }
        else routineCheck = checked;
      }
      rec.outcome = 'goal';
      T.stats.onTarget++;
      s.line.on!++;
      this.goal(T, O, s, assister, kind);
      // rutinetjek: målet står ved magt
      if (routineCheck) { this.line('var-check', s, null, true); this.line('var-stands', s, null, true); }
      return;
    }
    // originalen: straffens skudpoint er rand(5·v) + 150, så alle straffe går på mål – keeperen afgør det (sub_700bd0)
    const onT = kind === 'pen' && this.opts.rules === 'original' ? 1
      : clamp(0.19 + q / 70 + (kind === 'oneOnOne' ? 0.12 : 0) + (kind === 'pen' ? 0.5 : 0) + (this.opts.onTarget ?? 0), 0.2, 0.92);
    if (this.r.chance((onT - goalP) / (1 - goalP))) {
      rec.outcome = 'saved';
      T.stats.onTarget++;
      s.line.on!++;
      this.rate(s, 0.08);
      // redning +0,35, stor redning +0,60 (originalen, sub_702050)
      this.rate(gk, xg > 0.25 || kind === 'pen' ? RATING.greatSave : RATING.goodSave);
      if (assister) this.rate(assister, 0.08);
      this.line(kind === 'pen' ? 'pen-saved' : kind === 'header' ? 'header-saved' : xg > 0.25 ? 'bigsave' : 'save', s, gk, kind === 'pen' || xg > 0.25);
      if (kind === 'pen') this.events.push({ m: this.minute, t: T.idx, k: 'pen-miss', p: s.p.id });
      // griber målmanden bolden, eller slår han den ud? (grebssikkerhed, vådt vejr gør den glat)
      const hold = kind !== 'pen' && this.r.chance(clamp(0.42 + (this.a(gk, A.handling) - 11) / 22 + this.wx.pass * 2.5 - xg * 0.5, 0.15, 0.85));
      if (hold) {
        rec.save = 'hold';
        if (this.r.chance(0.12)) this.line('gk-holds', gk);
        this.zone = this.zoneFor(O.idx, 0, 1);
        this.poss = O.idx;
        return;
      }
      const rr = this.r.next();
      if (rr < 0.24) {
        const fol = this.pick(T.zAtt[z], (x) => this.finW(x) * (0.6 + this.a(x, A.anticipation) / 25));
        if (fol) { const spill = this.a(gk, A.handling) < 11 && this.r.chance(0.5); rec.save = spill ? 'spill' : 'parry'; this.line(spill ? 'gk-spills' : 'gk-parry', gk, fol); this.rebound = fol; return; }
      }
      if (rr < 0.75) { rec.save = 'corner'; return this.corner(T, O); }
      rec.save = 'hold';
      this.zone = this.zoneFor(O.idx, 0, 1);
      this.poss = O.idx;
      return;
    }
    rec.outcome = 'off';
    // træværket: gode afslutninger kan ramme stolpen/overliggeren – og give returbold
    if (kind !== 'pen' && xg >= 0.08 && this.r.chance(0.16)) {
      rec.post = true;
      this.line('post', s, null, true);
      const fol = this.r.chance(0.3) ? this.pick(T.zAtt[z], (x) => this.finW(x), s) : null;
      if (fol) { this.rebound = fol; return; }
      this.zone = this.zoneFor(O.idx, 0, 1);
      this.poss = O.idx;
      return;
    }
    this.rate(s, kind === 'oneOnOne' || kind === 'pen' ? -0.35 : -0.05);
    this.line(kind === 'pen' ? 'pen-miss' : kind === 'header' ? 'header-wide' : kind === 'oneOnOne' ? 'miss-1v1' : kind === 'long' ? 'long-wide' : 'wide', s, null, kind === 'pen' || kind === 'oneOnOne');
    if (kind === 'pen') this.events.push({ m: this.minute, t: T.idx, k: 'pen-miss', p: s.p.id });
    else this.pbp('pl-goalkick', this.keeper(O));
    this.zone = this.zoneFor(O.idx, 0, 1);
    this.poss = O.idx;
  }

  private goal(T: TeamRT, O: TeamRT, s: SP, assister: SP | null, kind: string) {
    this.stoppage += 0.45;
    if (kind === 'og') {
      // selvmål: s er forsvareren fra O
      T.stats.goals++;
      this.rate(s, -0.6);
      this.events.push({ m: this.minute, t: T.idx, k: 'goal', p: s.p.id, og: true });
      this.line('own-goal', s, null, true);
      this.line('score', null, null, true);
      T.moraleMult = Math.min(1.06, T.moraleMult + 0.01);
      O.moraleMult = Math.max(0.94, O.moraleMult - 0.008 * (1.4 - O.det / 20));
      this.kickoff(O.idx);
      return;
    }
    T.stats.goals++;
    s.line.goals++;
    // mål +0,65, assist +0,275 (originalen, sub_702050)
    this.rate(s, RATING.goal);
    if (assister && kind !== 'pen' && kind !== 'fk') {
      assister.line.assists++;
      this.rate(assister, RATING.assist);
    }
    const gk = this.gk(O);
    this.rate(gk, -0.25);
    for (const e of O.zDef[this.zone]) if (e.w > 0.35) this.rate(e.sp, -0.08);
    this.events.push({ m: this.minute, t: T.idx, k: 'goal', p: s.p.id, p2: assister && kind !== 'pen' ? assister.p.id : undefined, ...(kind === 'pen' ? { pen: true } : {}) });
    const key = kind === 'pen' ? 'goal-pen' : kind === 'header' ? 'goal-header' : kind === 'fk' ? 'goal-fk' : kind === 'long' ? 'goal-long' : kind === 'oneOnOne' ? 'goal-1v1' : 'goal';
    this.line(key, s, assister, true);
    this.line('score', null, null, true);
    // moral-sving
    T.moraleMult = Math.min(1.06, T.moraleMult + 0.01);
    // et hold med vilje (beslutsomhed) tager et mål imod bedre
    O.moraleMult = Math.max(0.94, O.moraleMult - 0.008 * (1.4 - O.det / 20));
    this.kickoff(O.idx);
  }

  private turnover(winner: SP | null) {
    const O = this.teams[1 - this.poss];
    this.poss = O.idx;
    this.lastPasser = null;
    // højt pres ("Ofte"): erobrer en angriber bolden højt på banen, er der straks en chance (arbejdsrate + aggression)
    if (winner && (winner.instr.closingDown ?? O.ti.closingDown) === 2 && this.rb(O.idx) >= 3 && this.r.chance(clamp(0.05 + (this.a(winner, A.workRate) + this.a(winner, A.aggression) - 20) / 200, 0.02, 0.12))) {
      this.pressed = winner;
      this.line('press-win', winner, null, true);
      return;
    }
    // Kontra
    if (O.ti.counter) {
      const rb = this.rb(O.idx);
      const T2 = this.teams[1 - O.idx];
      // et offensivt hold med mange folk frem efterlader plads; mod en lav blok er der intet at kontre på
      const exposed = clamp(0.03 + 0.1 * T2.ti.mentality + 0.05 * (T2.ti.closingDown - 1) + (T2.ti.counter ? -0.06 : 0) + (T2.ti.menBehind ? -0.06 : 0), 0.02, 0.6);
      if (rb <= 2 && this.r.chance(exposed)) {
        const runner = this.pick(O.zAtt[this.zoneFor(O.idx, Math.min(4, rb + 2), 1)], (x) => this.a(x, A.pace) ** 2);
        const chaser = this.pick(T2.zDef[this.zoneFor(O.idx, Math.min(4, rb + 2), 1)], (x) => this.a(x, A.pace));
        if (runner) {
          const p = logistic((this.a(runner, A.pace) + this.a(runner, A.acceleration) - (chaser ? this.a(chaser, A.pace) + this.a(chaser, A.acceleration) : 10)) / 6 + 0.3 * Math.log((T2.wDef[this.zoneFor(O.idx, 3, 1)] + 0.4) ** -1 + 1));
          if (this.r.chance(p * 0.55)) {
            this.zone = this.zoneFor(O.idx, Math.min(3, rb + 2), 1);
            this.line('counter', winner ?? runner, runner);
            if (this.r.chance(0.35)) { this.breakaway = runner; this.breakawayOrigin = 'counter'; }
          }
        }
      }
    }
  }

  /** Spillede minutter til nu (eller `at`). Tillægstiden tæller ikke: minuttallet i tillægstiden er 91+, så en
   *  indskiftning i 2. halvlegs tillægstid gav før negative minutter (90 − 95). Altid mindst 1. */
  playedMinutes(s: SP, at = this.minute): number {
    const cap = this.extraTime ? 120 : 90;
    return Math.max(1, Math.min(at, cap) - Math.min(s.enteredAt, cap - 1));
  }

  // ---------- udskiftninger ----------

  substitute(teamIdx: number, outId: number, inId: number): boolean {
    const t = this.teams[teamIdx];
    if (t.subsLeft <= 0) return false;
    const out = t.on.find((s) => s.p.id === outId && !s.off);
    const p = t.players.get(inId);
    if (!out || !p || !t.benchIds.includes(inId)) return false;
    const sp = this.makeSP(t, p, out.slot, this.minute);
    out.off = true;
    out.line.minutes = this.playedMinutes(out);
    t.on[t.on.indexOf(out)] = sp;
    t.benchIds = t.benchIds.filter((id) => id !== inId);
    t.subsLeft--;
    if (this.minute >= 46) this.stoppage += 0.35;
    t.tactic = { ...t.tactic, lineup: t.tactic.lineup.map((id) => (id === outId ? inId : id)) };
    this.events.push({ m: this.minute, t: teamIdx, k: 'sub', p: inId, p2: outId });
    this.line('sub', sp, out);
    this.buildZones(t);
    return true;
  }

  /** Holdsnak (fx i pausen): ny faktor pr. spiller; erstatter den tidligere snaks virkning */
  applyTalk(teamIdx: number, boosts: Record<number, number>) {
    const t = this.teams[teamIdx];
    for (const sp of t.on) {
      if (sp.off) continue;
      const old = t.talk.get(sp.p.id) ?? 1;
      const nf = boosts[sp.p.id] ?? 1;
      for (let i = 0; i < 36; i++) sp.eff[i] = (sp.eff[i] / old) * nf;
    }
    t.talk = new Map(Object.entries(boosts).map(([k, v]) => [Number(k), v]));
    this.buildZones(t);
  }

  setTactic(teamIdx: number, tactic: Tactic) {
    const t = this.teams[teamIdx];
    // taktiske ændringer registreres (vises på momentumgrafen og i analysen)
    if (tactic.formation !== t.tactic.formation) this.changes.push({ m: this.minute, t: teamIdx, kind: 'formation', to: tactic.formation });
    if (tactic.team.mentality !== t.ti.mentality) this.changes.push({ m: this.minute, t: teamIdx, kind: 'mentality', from: String(t.ti.mentality), to: String(tactic.team.mentality) });
    else if (tactic.formation === t.tactic.formation && JSON.stringify(tactic.team) !== JSON.stringify(t.ti)) this.changes.push({ m: this.minute, t: teamIdx, kind: 'instructions' });
    // Pladser kan være byttet om
    t.tactic = { ...tactic, lineup: t.tactic.lineup.slice(), bench: t.tactic.bench.slice() };
    t.ti = tactic.team;
    // omplacér spillere på banen efter ny opstilling
    tactic.lineup.forEach((id, slot) => {
      const sp = t.on.find((s) => s.p.id === id && !s.off);
      if (sp && sp.slot !== slot) {
        sp.slot = slot;
        const fit = fitFactor(slotFit(sp.p, tactic.slots[slot]));
        const oldFit = sp.eff[A.passing] / Math.max(0.01, sp.p.attrs[A.passing]);
        for (let i = 0; i < 36; i++) sp.eff[i] = (sp.eff[i] / oldFit) * fit;
      }
    });
    t.tactic.lineup = t.on.filter((s) => !s.off).reduce((arr, s) => { arr[s.slot] = s.p.id; return arr; }, tactic.slots.map(() => 0));
    this.buildZones(t);
    this.line('tactic-change', null, null);
  }

  private autoSub(t: TeamRT, out: SP) {
    const slot = t.tactic.slots[out.slot];
    const cands = t.benchIds.map((id) => t.players.get(id)!).filter(Boolean);
    if (!cands.length) return;
    const best = cands.sort((a, b) => fitFactor(slotFit(b, slot)) * b.ca - fitFactor(slotFit(a, slot)) * a.ca)[0];
    this.substitute(t.idx, out.p.id, best.id);
    t.lastSub = this.minute;
  }

  /** Sent i kampen: holdet der er bagud med ét mål, kæmper med alt (beslutsomhed), og føreren trækker sig nervøst */
  private urgency() {
    const ease = this.opts.ease ?? 0;
    if ((this.minute < 75 && !ease) || this.extraTime) return;
    for (const t of this.teams) {
      const d = this.stateDiff(t);
      // stort forspring: holdet slapper af (originalens topkampe ender 2-0, ikke 5-0)
      if (ease && d >= 2) { t.urge = 1 - ease * Math.min(d - 1, 3); continue; }
      if (this.minute < 75) { t.urge = 1; continue; }
      t.urge = d === -1 || d === -0.5 ? 1 + 0.03 + 0.03 * (t.det / 20) : d === 1 || d === 0.5 ? 0.985 : 1;
    }
  }

  private aiManage() {
    this.urgency();
    if (this.opts.rules === 'original') { this.aiManageOriginal(); return; }
    if (this.minute < 46) return;
    for (const t of this.teams) if (this.opts.aiSubs?.[t.idx]) this.aiShift(t);
    if (this.minute < 55) return;
    for (const t of this.teams) {
      if (!this.opts.aiSubs?.[t.idx]) continue;
      if (t.subsLeft <= 0) continue;
      const chance = this.minute >= 80 ? 0.6 : this.minute >= 68 ? 0.45 : 0.3;
      if (!this.r.chance(chance)) continue;
      const cands = t.on.filter((s) => !s.off && t.tactic.slots[s.slot].pos !== 'GK');
      const worst = cands.sort((a, b) => a.cond * 10 + a.rating - (b.cond * 10 + b.rating))[0];
      if (worst && (worst.cond < 0.72 || worst.rating < RATING.start - 0.1)) this.autoSub(t, worst);
    }
  }

  /**
   * CM 01/02's computermanager (sub_6c54a0/sub_6e0fe0, regel 9): overvejer en udskiftning, når minuttet > 10 + rand(50)
   * (nyt slag hver gang) og mere end 5 minutter efter sidste skift; kandidaterne sorteres stigende efter
   * int(karakter × 1000 + kondition). Selve valget kendes ikke – motorens egen regel (træt eller under 6,0) bruges.
   * Taktikskift har sin egen 15-minutters spærre. "Knackered" (kondition < 67,5 % efter 60') er kun en kommentar.
   */
  private aiManageOriginal() {
    if (this.minute >= 60) for (const t of this.teams) for (const s of t.on) {
      if (!s.off && !s.knackered && s.cond < 0.675 && t.tactic.slots[s.slot].pos !== 'GK') { s.knackered = true; this.line('knackered', s); }
    }
    for (const t of this.teams) {
      if (!this.opts.aiSubs?.[t.idx]) continue;
      if (this.minute >= 46 && this.minute - (t.lastShift ?? -99) >= 15) { const before = t.ti.mentality; this.aiShift(t); if (t.ti.mentality !== before) t.lastShift = this.minute; }
      if (t.subsLeft <= 0 || this.minute <= 10 + this.r.int(0, 49) || this.minute - (t.lastSub ?? -99) <= 5) continue;
      const cands = t.on.filter((s) => !s.off && t.tactic.slots[s.slot].pos !== 'GK');
      const worst = cands.sort((a, b) => Math.trunc(a.rating * 1000 + a.cond * 10000) - Math.trunc(b.rating * 1000 + b.cond * 10000))[0];
      if (worst && (worst.cond < 0.72 || worst.rating < RATING.start - 0.1)) this.autoSub(t, worst);
    }
  }

  /** AI-træneren reagerer på stillingen: jagter udligning eller lukker kampen */
  private aiShift(t: TeamRT) {
    const o = this.teams[1 - t.idx];
    const diff = this.stateDiff(t);
    void o;
    const base = (t.baseMentality ??= t.ti.mentality);
    let want = base;
    // afgjort kamp: holdet der fører stort, slapper af – og holdet bagud stort, giver op
    if (diff >= 3 && this.minute >= 50) want = Math.max(0, base - 1);
    else if (diff <= -3 && this.minute >= 60) want = base;
    else if (diff < 0 && this.minute >= 55) want = Math.min(4, base + (this.minute >= 75 || diff <= -2 ? 2 : 1));
    else if (diff > 0 && this.minute >= 72) want = Math.max(0, base - 1);
    // uafgjort sent i kampen: et hold der ikke er favorit, tager gerne det ene point
    else if (diff === 0 && this.minute >= 72 && base <= 2) want = Math.max(0, base - 1);
    else if (diff === 0.5 && this.minute >= 70) want = Math.max(0, base - 1); // videre på udebanemål: luk kampen
    if (want === t.ti.mentality) return;
    const chasing = want > base;
    const ti: TeamInstructions = { ...t.ti, mentality: want, counter: chasing ? false : want < base || t.ti.counter, tempo: chasing ? 2 : t.ti.tempo };
    this.changes.push({ m: this.minute, t: t.idx, kind: 'mentality', from: String(t.ti.mentality), to: String(want) });
    t.ti = ti;
    t.tactic = { ...t.tactic, team: ti };
    this.buildZones(t);
    const capt = t.on.find((s) => !s.off && s.p.id === t.tactic.captain) ?? t.on.find((s) => !s.off) ?? null;
    this.line(chasing ? 'ai-push' : want < base ? 'ai-shut' : 'tactic-change', capt, null);
    // jagter: skift en ekstra angriber ind for den svageste midtbanespiller
    if (chasing && t.subsLeft > 0 && this.minute >= 60) {
      const bench = t.benchIds.map((id) => t.players.get(id)).filter((p): p is Player => !!p && p.pos[0] < 15);
      const att = bench.sort((a, b) => b.attrs[A.finishing] + b.attrs[A.offTheBall] - (a.attrs[A.finishing] + a.attrs[A.offTheBall]))[0];
      const out = t.on.filter((s) => !s.off && ['DM', 'M', 'WB'].includes(t.tactic.slots[s.slot].pos)).sort((a, b) => a.rating - b.rating)[0];
      if (att && out && att.attrs[A.finishing] >= 11) this.substitute(t.idx, out.p.id, att.id);
    }
  }

  // ---------- straffe ----------

  /** Straffesparkskytten: den første i Penalty Takers-rækkefølgen, der er på banen, ellers den udpegede skytte */
  private penTaker(T: TeamRT): SP | undefined {
    const order = T.tactic.penOrder?.length ? T.tactic.penOrder : [T.tactic.penalties];
    for (const id of order) { const x = T.on.find((s) => s.p.id === id && !s.off); if (x) return x; }
    return undefined;
  }

  private startShootout() {
    // lige mange skytter på hver side (holdet med flest spillere må undvære sine dårligste) – Penalty Takers-rækkefølgen først
    const rank = (t: TeamRT, s: SP) => { const i = t.tactic.penOrder?.indexOf(s.p.id) ?? -1; return i >= 0 ? i : 1000 - this.a(s, A.penalties); };
    const on = this.teams.map((t) => t.on.filter((s) => !s.off).sort((a, b) => rank(t, a) - rank(t, b)));
    const n = Math.min(on[0].length, on[1].length);
    this.shootout = { takers: [on[0].slice(0, n), on[1].slice(0, n)], score: [0, 0], kicks: [] };
    this.line('shootout', null, null, true);
  }

  /** Ét spark. Returnerer true, så længe konkurrencen ikke er afgjort. */
  private shootoutKick(): boolean {
    const so = this.shootout!;
    const k = so.kicks.length;
    const ti = k % 2, round = Math.floor(k / 2);
    const s = so.takers[ti][round % so.takers[ti].length];
    const gk = this.gk(this.teams[1 - ti]);
    const p = clamp(0.75 * Math.exp((0.7 * this.a(s, A.penalties) + 0.3 * s.p.attrs[A.pressure] - this.gkQ(gk)) / 22), 0.5, 0.92);
    // ét tal afgør både mål og (ved brændt) redning eller forbi
    const u = this.r.next();
    const scored = u < p, saved = !scored && u < p + (1 - p) * 0.65;
    if (scored) so.score[ti]++;
    so.kicks.push({ t: ti, p: s.p.id, gk: gk.p.id, outcome: scored ? 'goal' : saved ? 'saved' : 'off' });
    this.line(scored ? 'so-score' : saved ? 'so-miss' : 'so-wide', s, gk);
    const [a, b] = so.score;
    const taken = [Math.ceil((k + 1) / 2), Math.floor((k + 1) / 2)];
    let over: boolean;
    if (taken[1] < 5 || taken[0] < 5) over = a + (5 - taken[0]) < b || b + (5 - taken[1]) < a;
    else over = taken[0] === taken[1] && a !== b;
    if (!over && k < 60) return true;
    this.pens = [a, b];
    this.line('shootout-end', so.takers[a > b ? 0 : 1][0], null, true);
    return false;
  }

  // ---------- afslutning ----------

  private finish() {
    this.finished = true;
    this.momentum[this.momentumBucket] = Math.round(this.bucketThreat * 100) / 100;
    this.line('fulltime', null, null, true);
    const [h, a] = this.teams;
    const tot = h.stats.possession + a.stats.possession;
    h.stats.possession = Math.round((h.stats.possession / tot) * 100);
    a.stats.possession = 100 - h.stats.possession;
    h.stats.xg = Math.round(h.stats.xg * 100) / 100;
    a.stats.xg = Math.round(a.stats.xg * 100) / 100;
    const endMin = this.extraTime ? 120 : 90;
    for (const t of this.teams) {
      const opp = this.teams[1 - t.idx];
      const res = Math.sign(t.stats.goals - opp.stats.goals);
      for (const s of t.all) {
        if (!s.line.red && !s.off) s.line.minutes = this.playedMinutes(s, endMin);
        else if (s.off && s.line.minutes === 0) s.line.minutes = this.playedMinutes(s);
        let r = s.rating + res * 0.25;
        const role = slotRole(t.tactic.slots[s.slot]);
        if (opp.stats.goals === 0 && (role === 'GK' || role === 'CB' || role === 'FB') && s.line.minutes >= 60) r += 0.35;
        // korte indhop trækkes mod 6
        const w = Math.min(1, s.line.minutes / 60);
        const base = s.enteredAt > 0 ? RATING.startSubstitute : RATING.start;
        r = base + (r - base) * w;
        s.line.rating = Math.round(clamp(r, 1, 10) * 10) / 10;
        s.line.cond = Math.round(s.cond * 100);
      }
    }
  }

  report(): MatchReport {
    const all = [...this.teams[0].all, ...this.teams[1].all];
    const mom = all.slice().sort((a, b) => b.line.rating - a.line.rating)[0];
    return {
      fixture: this.opts.fixtureId ?? 0,
      home: this.teams[0].club,
      away: this.teams[1].club,
      stats: [this.teams[0].stats, this.teams[1].stats],
      players: all.map((s) => s.line),
      events: this.events,
      shots: this.shots,
      momentum: this.momentum.map((v) => v ?? 0),
      heat: this.heat,
      zoneControl: this.zonePoss.map((v, i) => (this.zoneTotal[i] ? Math.round((v / this.zoneTotal[i]) * 100) / 100 : 0.5)),
      mom: mom?.p.id ?? 0,
      commentary: this.opts.playByPlay ? this.commentary.filter((l) => !l.k.startsWith('pl-')) : this.commentary,
      et: this.extraTime || undefined,
      pens: this.pens,
      shootout: this.shootout?.kicks,
      weather: this.opts.weather,
      pitch: this.opts.pitch,
      referee: this.opts.referee,
      changes: this.changes,
      formations: [this.teams[0].tactic.formation, this.teams[1].tactic.formation],
      bench: [this.teams[0].benchIds.slice(), this.teams[1].benchIds.slice()],
      capt: [this.teams[0].tactic.captain, this.teams[1].tactic.captain],
    };
  }

  /** Aktuelle on-pitch spillere (til live UI) */
  /** Øjebliksbillede til 2D-visningen: boldens zone, hvem der har den, og spillernes positioner fra taktikken */
  pitch(): PitchSnap {
    const last = this.shots.at(-1);
    return {
      zone: this.zone,
      poss: this.poss,
      holder: this.holder,
      moment: this.moment,
      shot: last && last.m === this.minute ? { team: last.t, outcome: last.outcome, zone: last.zone } as ShotSnap : null,
      players: this.teams.flatMap((t) => t.on.filter((sp) => !sp.off).map((sp) => ({
        id: sp.p.id, team: t.idx, num: sp.p.number ?? sp.slot + 1, gk: t.tactic.slots[sp.slot]?.pos === 'GK',
        ax: sp.ax, ay: sp.ay, dx: sp.dx, dy: sp.dy, name: sp.p.last,
      }))),
    };
  }

  live(teamIdx: number): LiveTeamView {
    const t = this.teams[teamIdx];
    return {
      on: t.on.map((s) => ({ id: s.p.id, slot: s.slot, num: s.p.number, off: s.off, cond: Math.round(s.cond * 100), rating: Math.round(clamp(s.rating, 1, 10) * 10) / 10, yellow: s.yellow, injured: s.line.injured, goals: s.line.goals, red: !!s.line.red, enteredAt: s.enteredAt })),
      /** udskiftede spillere (til karakteroversigten) */
      gone: t.all.filter((s) => !t.on.includes(s)).map((s) => ({ id: s.p.id, slot: s.slot, num: s.p.number, rating: Math.round(clamp(s.rating, 1, 10) * 10) / 10, yellow: s.yellow, goals: s.line.goals, enteredAt: s.enteredAt })),
      bench: t.benchIds.slice(),
      subsLeft: t.subsLeft,
      stats: t.stats,
      tactic: t.tactic,
    };
  }
}

function dist(x: number, y: number, z: number) {
  const b = Math.floor(z / ZL), l = z % ZL;
  return (zoneX(b) - x) ** 2 + (zoneY(l) - y) ** 2;
}

function name(p: Player) {
  return p.last || p.first;
}

/** Hurtig simulering uden kommentarer */
export function quickMatch(home: EngineTeam, away: EngineTeam, opts: Omit<EngineOptions, 'commentary'>, r: Rng): MatchReport {
  const sim = new MatchSim(home, away, { ...opts, commentary: false, aiSubs: opts.aiSubs ?? [true, true] }, r);
  return sim.runToEnd();
}

/** Zoneprofil for et hold – bruges af assistentens modstanderanalyse og den gennemsigtige motor */
export function zoneProfile(team: EngineTeam, asHome = true): { att: number[]; def: number[]; attQ: number[]; defQ: number[] } {
  const dummyRng = { next: () => 0.5, normal: (m: number) => m, chance: () => false } as unknown as Rng;
  const sim = new MatchSim(asHome ? team : team, team, { commentary: false, neutral: true }, dummyRng);
  const t = sim.teams[0];
  const q = (list: ZoneEntry[], f: (s: SP) => number) => {
    let s = 0, w = 0;
    for (const e of list) { s += f(e.sp) * e.w; w += e.w; }
    return w ? s / w : 0;
  };
  return {
    att: t.wAtt.map((v) => Math.round(v * 100) / 100),
    def: t.wDef.map((v) => Math.round(v * 100) / 100),
    attQ: t.zAtt.map((l) => Math.round(q(l, (s) => (s.eff[A.passing] + s.eff[A.dribbling] + s.eff[A.finishing] + s.eff[A.creativity]) / 4) * 10) / 10),
    defQ: t.zDef.map((l) => Math.round(q(l, (s) => (s.eff[A.tackling] + s.eff[A.marking] + s.eff[A.positioning] + s.eff[A.anticipation]) / 4) * 10) / 10),
  };
}

export const ZONES = { bands: ZB, lanes: ZL, count: NZ };
