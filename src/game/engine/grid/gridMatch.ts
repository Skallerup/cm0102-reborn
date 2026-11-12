// Gittermotoren (9 × 12) – et laboratorium VED SIDEN AF MatchSim (Bosman-prompten, opgave 5). Ikke koblet ind i spillet.
// Bygger på Bosman-projektets porte: tik-løkken (loop.ts), boldholderens valg (ballCarrier.ts), afleveringsmulighederne
// (passOptions.ts), skuddet (shot.ts) og hjælpefunktionerne (helpers.ts) – de er "sikre" (læst i koden).
// Alt, der endnu er ukendt i originalen, ligger som navngivne kroge i GRID_UNKNOWN med et *estimeret* bud og
// adressen på den funktion i cm0102.exe, de står i for. Kør en sæson: npx tsx scripts/grid-stats.ts
import { crtPow } from '../crtMath';
import * as L from './loop';
import { ACTION, decideBallCarrier, type PassOption, type Situation } from './ballCarrier';
import { passOptions, type Helpers as PassHelpers, type MatchPlayer as PassPlayer, type MatchState as PassState } from './passOptions';
import { intoGoal, intoOwnGoal } from './intoGoal';
import { score6ce310 } from './shotParts/R2';
import { matchValues6ec010, type MatchValuesEnv } from './matchValues';
import { SHOT, footCheck, highFlag, keeperValue, shotScore, type Attrs as ShotAttrs } from './shot';
import { takeShot, type ShotEnv } from './takeShot';
import './shotParts/R2';
import './shotParts/R3';
import './shotParts/R4';
import './shotParts/R6';
import './shotParts/R7';
import * as H from './helpers';
import { instrBig, instrOf, mapTactic, setTeamOption, tableCell, teamFlagsOf, type Table } from './tacticTable';
import { aiPrematch, PREMATCH_ATTR_KEYS } from './aiPrematch';
import { aiTeamSetup, type AiPickCtx } from './aiTeam';
import { pickFlags } from './pickTeam';
import { PRESET_TACTICS } from './presetTactics';
import { presetTable } from './tacticTable';
import { aiMode as aiModeOf, teamStrength, type AiModeInput } from './aiMode';
import { TEAM_FLAGS, cardWithoutVictim, decideFoulPunishment, isHardChallenge, judgeTackle, type JudgeResult, type MatchOfficial } from '../cm0102-original-rules';
import { actionSkills, adjustMorale, getOppositionChallenge, inBoxAt, randS, type ChallengeOut } from './challenge';
import { foulEventOf, makePass, onPitch } from './pass';
import { zonalPick } from './zonal';
import { benchFor, makeMatchSubs } from './matchSubs';
import { shootoutStep, type ShootoutKickRec, type ShootoutState } from './shootout';
import { MatchEvents } from './matchEvents';
import { repTriple } from '../../originalValue';
import { statAvg } from '../../cmPlayerData';
import { cmFitOn, cmFitRead } from '../../cmFitnessGame';
import { INJ_TYPES } from '../../cmFitness';
import { CM_INT_OFFSETS, INTRINSIC_KEYS } from '../../playerInit';
import { gs, hasGame } from '../../state';
import { ATTRS } from '../../attributes';
import type { Player, Tactic } from '../../types';

export type Rand = (n: number) => number;
/** tællere til fejlsøgning (scripts/grid-stats.ts DEBUG=1) */
export const GRID_DEBUG: Record<string, number> = {};
let dbgOn = false;
/** Fejlsøgningstællerne (GRID_DEBUG) – kun i scripts/tests; i spillet er de slået fra (de koster tid i hvert tik) */
export function setGridDebug(on: boolean) { dbgOn = on; }
const dbg = (k: string) => { if (dbgOn) GRID_DEBUG[k] = (GRID_DEBUG[k] ?? 0) + 1; };
/** Rand fra en 0..1-generator (vores Rng.next) som sub_90cfc0 (0x90cfc0–0x90d028): n = 0 → 0 uden at trække; n > 0 → 0..n−1;
 *  n < 0 → n+1..0 (resten af idiv med negativ divisor negeres, 0x90d026). Før gav n < 0 altid 0 – fx 0x7110f5's rand((v + 500)/3)
 *  under pres og ballCarrier's rand(−(…)) i skudvalget. */
export const randOf = (next01: () => number): Rand => {
  const r: Rand = (n) => {
    const k = Math.trunc(n);
    if (k === 0) return 0;
    // 0x90d00d–0x90d09c: |n| > 0xffff → x = puljens tal mod 0xffff, v = ftol(x·(n·(1/65535))) (0x970a70) + trunc((rand(trunc(10n/65535)) + 5)/10),
    // højst n − 1 – det indre kald trækker sit eget tal (efter det ydre). Før gav porten floor(next01·n) med ét tal.
    if (k > 0xffff || k < -0xffff) {
      const x = Math.floor(next01() * 0xffff);
      let v = Math.trunc(x * (k * (1 / 65535)));
      v += Math.trunc((r(Math.trunc((10 * k) / 65535)) + 5) / 10);
      return v > k - 1 ? k - 1 : v;
    }
    return k > 0 ? Math.floor(next01() * k) : (-Math.floor(next01() * -k)) | 0;
  };
  return r;
};

export interface GridTeam { players: Player[] | Map<number, Player>; tactic: Tactic; nation?: string }
/** Begivenheder til live-kampen og rapporten (grid/adapter.ts) – kaldes uden tilfældige tal, så tallene er de samme med og uden */
export interface GridListener {
  goal?(p: GP, assister: GP | null, pen: boolean): void;
  /** selvmål (sub_70c040): p er den, der rørte bolden sidst (målet går til modstanderne) */
  ownGoal?(p: GP): void;
  shot?(p: GP, outcome: string): void;
  /** 2 gult, 3–6 rødt; commented = kortet har allerede originalens kommentar i køen (YELLOW_CARD m.fl.) */
  card?(p: GP, code: number, commented?: boolean): void;
  knock?(p: GP): void;
  corner?(side: Side): void;
  offside?(side: Side): void;
  halftime?(): void;
  /** udskiftning (matchSubs.ts): auto = computerens genvalg, ellers menneskets fra køen */
  sub?(on: GP, off: GP, auto: boolean): void;
  /** sub_6d0b60: en skadet spiller bæres ud (plads −2) */
  carriedOff?(p: GP): void;
  /** sub_6bd930 0x6bdc56: forlænget spilletid begynder */
  extraTime?(): void;
  /** sub_6be710: et straffespark i konkurrencen */
  penKick?(k: ShootoutKickRec, st: ShootoutState): void;
}

/** Kampens rammer, som init_match (0x6b7f20) læser uden for holdene. Mangler et felt, bruges GRID_UNKNOWN's *estimerede* værdi. */
export interface GridManager { id: number; ca: number; tac: number[] }

export interface GridMatchCtx {
  /** begivenheder (adapteren) */
  on?: GridListener;
  /** klubbernes omdømme i originalens skala (club +0x80, 0–10000) [hjemme, ude] – sub_6ddab0; mangler = 5000 (*estimeret*) */
  rep?: [number, number];
  /** turneringens type (fixture+0x37 → +0x3a; 1 og 9 = venskabskamp) – sub_6ddab0 */
  compType?: number;
  /** kampen er en ligakamp mellem to hold i samme række (aiMode: sameDivision/compLink) – standard true; derby = rivaler */
  league?: boolean;
  /** managernes taktiske egenskaber (Staff.tac fra den originale database: [Attacking, Directness, Free Roles, Marking, Offside, Pressing,
   *  Tactics, yndlingsformation]) og CA/id – null = ingen manager (originalens "uden mgr"-grene) */
  managers?: [GridManager | null, GridManager | null];
  /** taktikkens navn (engine+0x905d+0xd0·side, null = "Not set") – mangler = forudindstillingens navn */
  tacticName?: [string | null, string | null];
  /** computerens holdudtagelse pr. side (aiTeam.ts AiPickCtx: dato, spillets frø, bænkens størrelse, managerens bedømmelse …) */
  pick?: [AiPickCtx | null, AiPickCtx | null];
  /** computerstyret hold [hjemme, ude] (sub_6c54a0 retter kun computerens taktik ved dødbold); mangler = begge */
  ai?: [boolean, boolean];
  /** sub_85cba0's tilskuertal (engine+0x91d2/+0x91d6/+0x91da): i alt, hjemmeholdets og udeholdets tilhængere */
  crowd?: { total: number; home: number; away: number };
  /** kampen spilles på en af klubbernes eget stadion (club+0x69 = fixture+0x18) – giver side 1's byte mindst 1 */
  ownGround?: boolean;
  /** turneringens omdømme (comp+0x69, club_comp.dat byte 105) */
  compRep?: number;
  /** fixture+0x3a ∈ {8, 10} (finaler – nervøsiteten regnes uden turneringsdivisoren) */
  final?: boolean;
  /** stadionets kapacitet (fixture+0x18 → +0x3c; ≤ 0 → 1500) – motivationens tilskuerandel */
  capacity?: number;
  /** derby: modstanderen er blandt klubbens rivaler (club +0xb3/+0xb7/+0xbb) – motivationen +10 og +0x31 −10 */
  derby?: boolean;
  /** dommeren (officials.dat-posten): Discipline 0x25 og bytes 0x24/0x27/0x28/0x29 */
  official?: { discipline: number; b24: number; b27: number; b28: number; b29: number };
  /** kun spor (scripts/grid-trace-port.ts): kaldes hvert tik på det sted, hvor originalens kampspor læser (efter 0x6ba01e) */
  onTop?: (m: GridMatchState) => void;
  /** kun låsetrinstesten: indgangen/udgangen af hver spillers tur sub_7103e0 (match_trace.c TU/TV) */
  onTurn?: (p: GP, out: boolean) => void;
  /** sub_6ec010's spildata pr. spiller (matchValues.ts MatchValuesEnv – klub, kontrakt, anfører, forhold …); de dynamiske felter (publikumsbyten,
   *  samspillet engine+0x1ce, taktikkens positionsord, anførerens positionsord) sættes af limen ved hvert kald. Mangler = kampværdierne regnes
   *  ikke igen i kampen (*estimeret* – limens kampværdier fra kampstarten beholdes) */
  matchValuesEnv?: (q: GP) => MatchValuesEnv | undefined;
  /** kun låsetrinstesten: efter hvert sub_6ec010-kald (sammenlignes med originalens MVO-linjer) */
  onMatchValues?: (q: GP, env: MatchValuesEnv) => void;
  /** kun låsetrinstesten: spillets data til holdets samspil (matchSubs.ts MatchSubsEnv.cohesionOf / captainIdx) */
  cohesionOf?: (q: GP) => { club: boolean; clubRep: number; contract: boolean; b45: number; x: number } | undefined;
  captainIdx?: (s: Side) => number | undefined;
  /** kun låsetrinstesten: zonevalgets resultat sub_6bc030 (match_trace.c ZP) */
  onZonal?: (p: GP, r: GP | null) => void;
  /** kun låsetrinstesten: 0x6df460's indgange fra originalens spor (styrken 0x6e86d0, tabelrækkerne, manageren – spillets data) */
  aiModeInput?: (i: AiModeInput) => AiModeInput;
  /** sub_600a50(klub, 0, 1, 0, 0) pr. side: klubben styres af et menneske (indlæggets +62/+75, 0x6fb306); mangler = !ai */
  humanClub?: [boolean, boolean];
  /** udskiftninger pr. hold (turneringens word +0x4d >> 4; Premier League 2001/02: 3 – standard). Bænken er taktikkens (& 0xf). */
  subs?: [number, number];
  /** kampen skal have en vinder ved stillingen (fixture+0x38 & 2 forlænget, & 1 straffe – sub_6bd930); mangler = uafgjort tæller */
  needsWinner?: (hg: number, ag: number) => boolean;
  /** kun spor: skuddets H/B/K-linjer som match_trace.c (H = indgangen til sub_702050, B = skudlinjen 0x6cc540, K = keeperværdien 0x700420) */
  onShot?: (kind: 'H' | 'B' | 'K' | 'L' | 'Q' | 'O' | 'J' | 'D' | 'N', v: number[]) => void;
  /** engine+0x8ebb: kampen vises på skærmen (den kamp, mennesket ser live) – originalens ekstra kommentarer (appeller, buh) */
  watched?: boolean;
  /** turneringen hører til landet i [0x9cf2e4] (England): "10 yards"-reglen i sub_716e10 0x7171a0 (fixture+0x14 → +0x5d) */
  tenYards?: boolean;
  /** holdenes playmaker/target man (staff-id; sub_897dc0 rolle 0/1) [hjemme, ude] – læses af afleveringsmulighederne 0x6c7032 */
  roles?: [[number | null, number | null], [number | null, number | null]];
  /** kun låsetrinstesten (scripts/lockstep.ts): limens lokale tilstand udstilles (ingen virkning på kampen) */
  expose?: (x: Record<string, unknown>) => void;
  /** dagens dato (staffpostens +0x3e: dage ved klubben i historierne 0x717827) – mangler = ingen dato (≥ 90 dage) */
  date?: string;
}
export interface GridSideStats { goals: number; shots: number; onTarget: number; corners: number; fouls: number; offsides: number; yellows: number; reds: number; passes: number; passesCompleted: number }
export interface GridResult { home: GridSideStats; away: GridSideStats; ticks: number }

export type Side = 0 | 1;
const other = (s: Side) => (1 - s) as Side;
const goalRow = (s: Side) => (s === 0 ? 11 : 0); // den række siden angriber
const clampX = (x: number) => Math.max(0, Math.min(8, x));
const clampY = (y: number) => Math.max(0, Math.min(11, y));

/** En spiller i gittermotoren: loop.ts' Player + det de andre porte læser */
export interface GP extends L.Player {
  src: Player;
  f: Record<string, number>; // kampværdier (sub_6ec010)
  posAttack: number;
  facing: number;
  strongFoot: 0 | 1;
  weakFootPenalty: number; // +0x2d = 20 − den svage fods værdi (rettelse 5)
  leftFoot: number; rightFoot: number;
  baseX: number; baseY: number; // pladsen i formationen (hele banen)
  gkRating: number;
  fouls: number;                    // +0x14 frispark begået
  foulsSuffered: number;            // +0x15
  yellows: number;                  // +0x24 gule kort (0/1, 2 efter andet gule)
  reasons: [number, number];        // +0x25/+0x26 kortenes årsagskode
  b16: number;                      // +0x16 (?) – 1 ved visse røde kort
  skill: number[];                  // +0x11a+2·kode: handlingsevnerne (sub_6eecb0 → challenge.ts actionSkills)
  momentum: number;                 // +0x19c (−200..200)
  giver?: GP | null;                // adapteren: den, der sidst afleverede til ham (assisten)
  w29: number;                      // +0x29 "plads" (sættes af limen ud fra situationen)
  w31: number;                      // +0x31 temperament-ord (?), start 0 – sænkes af frispark
  w33: number;                      // +0x33 (0x6eb137–0x6eb18b): 10, +30 yndling og −10 (bx) hadet af egen klub (+0x9b../+0xa7.. – ingen data), +5 derby – udskiftningens klapsalver
  b1d: number;                      // +0x1d "ligger skadet – skal ud" (sat af sub_6d0980) ≠ 0 → boldholderen mister kontrollen; start 0
  b1c: number;                      // +0x1c skadet (sub_6d0980)
  injuredBy: GP | null;             // +0x55 den, der skadede ham
  temperCount: number;              // +0xff ophidselses-tæller (start og henfald i loop.ts)
  grudge: GP | null;                // +0x1a6 "nag" (den der sidst fik ham op at køre)
  sportsmanship: number; temperament: number; pressure: number; consistency: number; // staff +0x5c/+0x5d/+0x5a, post +0x21 (?) – rå 1..20
  isKeeper: boolean;
  tacklesTried: number; tacklesWon: number; dribblesPast: number; b6: number; // +0x4/+0x5/+0x11/+0x6
  bfd: number;                          // +0xfd: rost for forsvarsspillet (kommentaren 0x21cd/0x21ce kun én gang)
  b7: number; b8: number; b9: number;   // +7/+8/+9: hovedstødsdueller (boldhøjde 4) – forsøg, vundne, vundne farligt foran mål (sub_6f6c00 0x6f962d/0x6f9939)
  blocks: number;                   // +0x12 opsnapninger/blokeringer (sub_6f5c30, sub_70dfd0/sub_6cd3d0)
  shots: number; shotsOnTarget: number; // +0xa/+0xb skud og skud på mål i kampen (0x703c5b/0x703c90; "på mål" = notens tolkning)
  penGoalsWon: number;              // +0x10 (zonevalgets "assists"): 0x706e44 tæller kun ved straffemål på den, der vandt straffen (+0x478a ≠ skytten)
  // skuddets felter (takeShot.ts, sub_702050): +0x39 skudkvaliteten (sat af sub_700bd0, 0 i ctor 0x6eb1a2), +3 assists, +0xc mål, +0xe straffemål,
  // +0xf (?), +0x3d…+0x45 målenes ord (?), +0x100 motivationen (initMotivation), staffpostens +0x58 Determination / +0x5b Professionalism,
  // spillerpostens +0x3f (Teamwork, rå)
  w39: number; assists: number; goals: number; penGoals: number; b0f: number; goalWords: number[]; motivation: number;
  determination: number; professionalism: number; teamworkRaw: number;
  // +0x1/+0x2 tællere (?; > 10 læses af målets historier 0x707910–0x7079cc), +0xd straffespark taget, +0x13 fanget offside, +0x1b (?),
  // +0x30 debut (MATCH_PLAYER::init 0x6eb22c/0x6eb31a: ingen kampe for klubben – PlayerStats, ikke porteret → 0)
  c01: number; c02: number; pensTaken: number; offsidesCaught: number; b1b: number; debut: number;
  tbl: Table | null; pslot: number; // taktikkens positionstabel (forudindstillingen) og pladsen i den (tacticTable.ts)
  posR: H.PosRatings;               // positions-/sideevner til sub_715f50
  view?: PassPlayer & H.MatchPlayer;
  /** staffpostens land (+0x1a) – sub_6c6a30's faktor K (0x6c6a54); mangler = spillerens land i spillet (Player.nation), ellers holdets */
  nationName?: string;
  /** kun låsetrinstesten: originalens spillerpost (0x46 bytes med fortegn) – recByte læser den direkte */
  recRaw?: Int8Array;
  /** kun låsetrinstesten: originalens staffpost (0x80 bytes med fortegn) – sub_6ec010 læser den */
  staffRaw?: Int8Array;
  /** +0x118 formrullet og +0x119 dårlig dag-tærsklen (MATCH_PLAYER::init 0x6eb502, initMotivation) – sub_6ec010 læser dem */
  formRoll?: number; badDay?: number;
  /** konditionsmodulets skade ved kampstart (knock-tjekket 0x6cfe10): cat = 0x62ec00(0x62ed70(id)->type) (−1 = ingen skade),
   *  s = 0x62ece0 (+0x12 > −1 → max(+0x13, 1), ellers 0). Ændres ikke i kampen (knocks går til en særskilt liste, 0x62be00) */
  inj: { cat: number; s: number };
  /** +0x28: pladsen i gittercellens liste for hans side (−1 = ingen) */
  cell: number;
}

export { cellIx, cellList, cellRemove, setPos, cellAdd } from './cells';
import { cellAdd, cellList as cellListOf, setPos } from './cells';

// ------------------------------------------------------------------ de ukendte dele (*estimeret*)

export interface GridMatchState extends L.Match {
  gp: GP[];
  /** engine+0x215e: gittercellernes lister (cellIx) */
  cells: GP[][];
  stats: [GridSideStats, GridSideStats];
  goals: [number, number];
  pendingPass: Side | -1;               // statistik: en aflevering fra den side er undervejs
  passTo: GP | null;                    // +0x477e: spilleren, bolden er på vej til (sub_6fad40 §6.4; nulstilles af sub_6f0630)
  landX: number; landY: number;         // +0x1c6/+0x1c7 landingsfeltet
  fromX: number; fromY: number;         // +0x1c8/+0x1c9 afleverens felt
  margin: number;                       // +0x8ed6 afleveringens kvalitet V − udfordrerens værdi (sub_6f6c00's passPower)
  lastPasser: GP | null;                // +0xf576 (han kan ikke selv opsnappe; nulstilles af sub_6f0630)
  lastPassType: number;                 // +0x8d4a
  inFlight: [number, number];           // +0x1a5/+0x1a6 "siden har en aflevering i luften"
  lastToucher: GP | null;               // +0xf5ae (blokeringen sætter den)
  linesmanMark: number; // linjevogterens karakter-ord (officials +8), kun statistik
  period: number;
  depth: number;
  tactics: [Tactic, Tactic];
  nations: [string, string];
  inc: Incident | null;                 // engine+0x475a..+0x4769 den ventende hændelse (fordel), sub_6bb9a0
  knocks: number;                       // engine+0xf639 knocks/skader i kampen (sub_6d0980)
  b8eb5: number;                        // engine+0x8eb5 en spiller ligger skadet (behandling ved næste døde bold)
  ballEvent: number;                    // engine+0x8eb1 hvor angrebet stammer fra: 0 åbent spil, 3 hjørne, 7/−1 frispark, 6 skud
  penaltyFor: GP | null;                // engine+0x478a: spilleren, der vandt straffesparket (sat ved straffe, 0x6f7f12 m.fl.)
  official: MatchOfficial;              // engine+0xf5b2 (dommerens bytes er *estimerede* – GRID_UNKNOWN.ref*)
  sideByte: [number, number];           // engine+0x1ad/+0x1ae publikums-bytene (crowdBytes)
  official29: number;                   // dommerpostens +0x29 (sub_6ea760)
  periodEnd: number;                    // engine+0x8ed4: periodens slut 495/990/1155/1320 (0/1 = kampen slut efter 90/120)
  shootoutState: ShootoutState | null;  // straffesparkskonkurrencen (shootout.ts)
  firstTime: number;                    // engine+0x1a7: modtageren spillede bolden første gang (0x6f9c9d = 1; 0 i sub_6f0630, 0x6f39e3, 0x70392b,
                                        // 0x6fcb4f) – afleveringens kommentar (E+0x24) læser den
  b1cd: number;                         // engine+0x1cd: bolden løs i feltet efter skuddet (1 ved 0x703dc7/0x704c4c/0x709139; 0 i sub_6f0630 og sub_6c54a0)
  x4782: number; x4786: number;         // engine+0x4782/+0x4786: angrebets opbygning (dword) – læses af skuddet (1680,0-grænserne 0x702168/0x704d17)
  passRecv: GP | null; passGiver: GP | null;   // engine+0xf5aa/+0xf5a6: modtager/afleverer af den sidste rigtige aflevering (sub_6f0630)
  setPieceGoals: [number[], number[]];   // engine+0xf5c3/+0xf5c4/+0xf5c5 + 54·side: målene efter dødbolde (sub_702050 0x706f..)
  b1a9: [number, number];               // engine+0x1a9+side: skud i straffesparkskonkurrencen (0x703d66)
  goldenGoal: number; b1a4: number;     // engine+0x1a8 golden goal i kraft (0x706eaf), engine+0x1a4 (?, 0x6f2aac: keeperen er spillet forbi)
}

/** den ventende hændelse (notes/advantage-knock.md §A): type, synder d, offer p (null ved hands/offside), dommerens kode (8 = offside),
 *  feltet og judge_tackle's jC (kind) / jB (sværhed); b = +0x4769 (altid 0 fra de læste kaldere) */
export interface Incident { type: number; d: GP; p: GP | null; res: number; x: number; y: number; jC: number; jB: number; b: number }

/** forseelsens begivenhed efter udfordringens kode (pass.ts foulEventOf, tabellerne 0x6f4324/0x6f43dc m.fl.) */
const foulEvent = foulEventOf;
/** sub_6bac40's datidsbegivenhed efter hændelsens type (tabel 0x6bb848 → 0x6bb818; uden for 1..0x2e → FOUL_PAST_TENSE) */
const pastFoulEvent = (t: number): number => {
  switch (t) {
    case 1: return 0x2104; case 0xc: return 0x2107; case 0x13: case 0x21: return 0x2101; case 0x15: return 0x2103; case 0x22: return 0x2105;
    case 0x29: return 0x2102; case 0x2a: return 0x20fe; case 0x2b: return 0x20ff; case 0x2c: return 0x2100; case 0x2d: return 0x20fd; case 0x2e: return 0x2106;
    default: return 0x20fc;
  }
};

const victimSide = (i: Incident): Side => (i.d.side === 0 ? 1 : 0);                           // sub_6bba50
/** bolden er ført forbi hændelsens felt mod modstanderens mål (lige linje = ikke forbi) */
const pastSpot = (m: GridMatchState, i: Incident) => (victimSide(i) === 0 ? m.ballY > i.y : m.ballY < i.y);
/** sub_6bab90 (sikker): venter en fordel? Offerets hold uden bolden → ja; med bolden ført forbi stedet → hændelsen glemmes. */
export function advantagePending(m: GridMatchState): boolean {
  const i = m.inc;
  if (!i || !i.res) return false;
  const c = m.carrier;
  if (!c || c.side !== victimSide(i)) return true;
  if (pastSpot(m, i)) { m.inc = null; return false; }
  return true;
}

/** init_match 0x6b871a–0x6b882f (sikker): publikums-bytene engine+0x1ad/+0x1ae ("fjendtlighed" mod side 0/1, 0..10). h% = 100·hjemme/i alt:
 *  side 0 = ftol(klem(5 + ude/10000 − h%/3, 0, 10)), side 1 = ftol(max(c, min(5 + hjemme/10000 − (100 − h%)/3, 10))) med c = 1 på en af
 *  klubbernes stadion, ellers 0 (side 1 klemmes ikke under 0 – sic). Uden tilskuere (N = 0) bruger init_match 100/90/10. */
export function crowdBytes(crowd: { total: number; home: number; away: number }, ownGround = true): [number, number] {
  let { total, home, away } = crowd;
  if (total === 0) { total = 100; home = 90; away = 10; }
  const f32 = Math.fround;
  const hp = f32((home * 100) / total), ap = f32(100 - hp);
  let x = away * 0.0001 + 5 - hp / 3;
  if (x > 10) x = 10; else if (x < 0) x = 0;
  const y = f32(home * 0.0001 + 5 - ap / 3);
  const c = ownGround ? 1 : 0;
  const mn = y > 10 ? 10 : y;
  return [Math.trunc(x), Math.trunc(c > mn ? c : mn)];
}
/** sub_6ec010 0x6ec4cd–0x6ec647 (sikker): nervøsiteten [esp+0x1c], som trækkes fra kamp-CA'en (og fra dårlig dag-tærsklen). b = sidens
 *  publikumsbyte (0 → ingen), prof = staff +0x5b, im = Important Matches (spillerpost +0x2c), capt = anførerleddet [esp+0x18]
 *  ((sub_6ebd70(anfører) − 15)·0,606 – ikke porteret, 0). Finale (fixture+0x3a 8/10): v = (b + 10)·1,3 + 3,5 − …; ellers (… + 2,5 …) / k med
 *  k = 1,35, eller (comp+0x69 − 10)/24 + 1,35 når omdømmet > 12. nerves = 2·(trunc(b/2) + 2,5 + v); keeperen ×0,5263; mindst 1. */
export function nervesOf(b: number, prof: number, im: number, gk: boolean, compRep: number, final = false, capt = 0): number {
  if (b === 0) return 0;
  const f32 = Math.fround;
  const tail = -(prof - 10) / 6 - (im - 10) * 0.25 - capt * 0.5;
  let v: number;
  if (final) v = (b + 10) * f32(1.3) + 3.5 + tail;
  else {
    const k = compRep > 12 ? (compRep - 10) * f32(1 / 24) + f32(1.35) : f32(1.35);
    v = ((b + 10) * f32(1.3) + 2.5 + tail) / k;
  }
  let n = f32(2 * (Math.trunc(b / 2) + 2.5 + v));
  if (gk) n = f32(n * f32(0.5263158));
  return n < 1 ? 1 : n;
}

/**
 * MATCH_PLAYER::init 0x6eb502–0x6ebcda (sikker for formlen; notes/player-state-bytes.md §2b): formRoll +0x118 = rand(20), dårlig dag
 * +0x119 = rand(35 − Consistency) for keepere med GK-evne 20, ellers rand(2·(30 − Consistency)), så motivationen +0x100 og +0xff.
 * I = (1 + 0,05·(imp − 10))⁶ med imp = turneringens omdømme (+10 i derby); P = Prof²·2000·N·C·I/D (side 0 med publikumsbyte 0) ellers
 * Prof²·100·N·(IM + 10)·C·I/D; r = rand(P): r > rand(2e6) → rand(10), r > rand(1e6) → rand(5), keeper → 0, r < rand(1e5) → rand(−5),
 * r > rand(1e4) → rand(−10). I > 1 → I/7 + 0,858; mot += rand(ftol((IM − 10)·I)); mot = ftol(mot·(1 − 0,0025·CA)); mot += rand(6) (ingen
 * manager i laboratoriet – med manager rand(Motivating − 10)). +0xff = trunc((trunc(mot/2) + Dirtiness + 10)/4).
 * *Estimeret/udeladt:* kontraktposten sub_4cf5f0 (C = 1,0; med post 0,3/0,5/0,75/3,0 efter +0x4f>>4), fixture+0x40-grenene (+10 og imp som
 * snit med modstanderens omdømme), sub_6d4280 (spring over), sub_48f150 (−10 uden for turneringen) og ±1-justeringerne 0x6ebad5–0x6ebcb0,
 * der alle kræver kontraktposten. N = tilskuere, D = kapacitet.
 */
export function initMotivation(rand: Rand, o: { prof: number; im: number; ca: number; cons: number; dirt: number; gk: boolean; gkRating: number; side: Side;
  byte0: number; compRep: number; derby: boolean; crowd: number; capacity: number }): { formRoll: number; badDay: number; motivation: number; bff: number } {
  const formRoll = rand(20);
  const badDay = o.gk && o.gkRating === 20 ? rand(35 - o.cons) : rand(2 * (30 - o.cons));
  const s8 = (v: number) => ((v << 24) >> 24);
  const imp = o.compRep + (o.derby ? 10 : 0);
  let I = crtPow(1 + 0.05 * (imp - 10), 6);                                                 // 0x6eb7a3
  const C = 1.0, N = o.crowd, D = o.capacity > 0 ? o.capacity : 1500;
  const P = o.side === 0 && o.byte0 === 0 ? (o.prof * o.prof * 2000 * N * C * I) / D : (o.prof * o.prof * (100 * N * (o.im + 10)) * C * I) / D;
  const r = rand(Math.trunc(P));
  let mot = 0;
  if (r > rand(2000000)) mot = rand(10);
  else if (r > rand(1000000)) mot = rand(5);
  else if (o.gk) mot = 0;
  else if (r < rand(100000)) mot = randS(rand, -5);
  else if (r > rand(10000)) mot = randS(rand, -10);
  if (I > 1) I = I / 7 + 0.858;
  mot = s8(mot + randS(rand, Math.trunc((o.im - 10) * I)));
  mot = s8(Math.trunc(mot * (1 - 0.0025 * o.ca)));
  mot = s8(mot + rand(6));
  const bff = Math.trunc((Math.trunc(mot / 2) + o.dirt + 10) / 4);
  return { formRoll, badDay, motivation: mot, bff };
}

/** ydelse (samme svar som zonal.ts' filter): feltets aktive spillere pr. side i m.gp's rækkefølge – bygges én gang pr. zonevalg i stedet for
 *  et filter over alle 40 for hvert felt, kandidaten prøver (spillerne flytter sig ikke under zonevalget) */
/** zonevalgets feltlister = gittercellerne engine+0x215e i indsættelsesorden (cells.ts) */
function zonalCells(m: GridMatchState): (x: number, y: number, s: 0 | 1) => GP[] {
  return (x, y, s) => cellListOf(m, x, y, s);
}

/** nation.dat-postens byte +0x77 == 8 (3.9.60: de 61 engelsktalende lande) – fixture-klubbens land (klub +0x53) i 0x708d7e/0x708e1f
 *  (SILENT_OUTCLASSED/SILENT_YOUR_NOT_SINGING) og 0x20f5-grenene */
const ENGLISH_SPEAKING = new Set(['American Samoa', 'Anguilla', 'Antigua & Barbuda', 'Australia', 'Bahamas', 'Barbados', 'Belize', 'Bermuda', 'Botswana',
  'British Virgin Islands', 'Canada', 'Cayman Islands', 'Cook Islands', 'Dominica', 'Dominican Republic', 'England', 'Eritrea', 'Fiji', 'The Gambia',
  'Ghana', 'Grenada', 'Guam', 'Guyana', 'Republic of Ireland', 'Jamaica', 'Lesotho', 'Liberia', 'Malawi', 'Maldives', 'Mauritius', 'Montserrat',
  'Northern Ireland', 'Namibia', 'Nepal', 'New Zealand', 'Nigeria', 'Pakistan', 'Papua New Guinea', 'The Philippines', 'Samoa', 'Scotland', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Solomon Islands', 'South Africa', 'St Kitts & Nevis', 'Saint Lucia', 'St Vincent & The Grenadines', 'Swaziland', 'Tahiti',
  'Tonga', 'Trinidad & Tobago', 'Turks and Caicos Islands', 'United States', 'US Virgin Islands', 'Uganda', 'Vanuatu', 'Wales', 'Zambia', 'Zimbabwe']);

export const GRID_UNKNOWN = {
  /** sub_6c2be0 (sikker; notes/6c2be0-tactical-cell.md): opslag i taktikkens positionstabel (med/uden bold, boldens felt), så
   *  holdinstruktionerne. Uden sub_715f50 – kalderne kører H.tacticalColumn bagefter (`cellWithDrift`). Boldhændelsen +0x8eb1 > 0 (efter
   *  hjørne, farligt frispark eller skud – til bolden tages på egen halvdel): spillere med instruktionsbit 17/30 (med bold) eller 31/19
   *  (uden) bliver stående, de andre får tabellens felt, og mentalitet/kontra/men behind ball springes over. */
  tacticalCell(m: GridMatchState, p: GP): [number, number] {
    const side = p.side, opp = other(side);
    const bx = clampX(m.ballX), by = clampY(m.ballY);
    let att: 0 | 1;
    if (m.poss === opp) att = 0;
    else if (m.poss === side) att = 1;
    else if (m.receiver && m.receiver.side === side) att = 1;
    else {
      const inOppBox = m.ballX >= 2 && m.ballX <= 6 && (side === 0 ? m.ballY >= 10 : m.ballY <= 1);
      att = inOppBox && m.ballH !== -1 ? 1 : 0;
    }
    if (!p.tbl) return [p.x, p.y];
    if (m.ballEvent > 0) {                                                                       // 0x6c2ca5: efter hjørne/frispark/skud
      const lo = Number(p.instr & 0xffffffffn), gk = p.pos === L.POS.keeper;
      const stay = att ? (lo & 0x20000) !== 0 || (!gk && (lo & 0x40000000) !== 0)                // sub_716270
        : !gk && ((lo & 0x80000000) !== 0 || (lo & 0x80000) !== 0);                              // sub_716310
      const [x, y] = stay ? [p.x, p.y] : tableCell(p.tbl, side, p.pslot, att, bx, by);
      return [clampX(x), clampY(y)];
    }
    let [x, y] = tableCell(p.tbl, side, p.pslot, att, bx, by);
    if (p.pos === L.POS.keeper) return [x, y];
    const flags = m.teamFlags[side], ctr = m.counterFlag[side], fwd = side === 0 ? 1 : -1;
    if (flags & TEAM_FLAGS.counterAttack && !ctr) y = clampY(y - fwd);
    else if (flags & TEAM_FLAGS.attacking && att) y = clampY(y + fwd);
    else if (flags & TEAM_FLAGS.defensive && !att) y = clampY(y - fwd);
    if (!(flags & TEAM_FLAGS.menBehindBall)) return [x, y];
    if (att && !ctr) return [x, clampY(y - 2 * fwd)];
    if (side === 1) y = Math.min(Math.max(y, m.ballY + 2, 9), m.ballY + 4, 11);
    else y = Math.max(Math.min(y, m.ballY - 2, 2), m.ballY - 4, 0);
    return [x, y];
  },
  /** sub_6c2a40 (sikker): opstillingen ved død bold – faste tabelceller: siden med bolden "med bold" ved (4,3)/(4,8), den anden
   *  "uden bold" ved (4,0)/(4,11); ingen besiddelse (4,5). */
  formationCell(m: GridMatchState, p: GP): [number, number] {
    if (!p.tbl) return [p.x, p.y];
    const c = (att: 0 | 1, bx: number, by: number) => tableCell(p.tbl!, p.side, p.pslot, att, bx, by);
    if (m.poss === 0) return p.side === 0 ? c(1, 4, 3) : c(0, 4, 0);
    if (m.poss === 1) return p.side === 1 ? c(1, 4, 8) : c(0, 4, 11);
    return c(0, 4, 5);
  },
  /** sub_6bce80 (sikker; notes/6bce80-run-target.md): bedste felt i 3×3 om spilleren. flags: 1 = må gå ind i midten, 2 = boldholder
   *  (dribling-rul, fodside, hysterese mod io, facing), 4 = offside-vurdering pr. række, 8 = baglæns tilladt. io = udgangsfeltet
   *  (taktisk felt for boldholderen, formationsfelt ellers). Tærsklen 7,5 og lighed → senest testede felt (float32). */
  runTarget(m: GridMatchState, p: GP, flags: number, io: [number, number], rand: Rand): [number, number] | null {
    const f32 = Math.fround, px = p.x, py = p.y, flag2 = (flags & 2) !== 0, side = p.side, opp = other(side);
    let lineDelta = -10, bestX = -1, bestY = -1, randOff = 0, best = f32(7.5);
    if (!flag2 && p.roll.offTheBall === 0) {
      if (p.roll.anticipation === 0) return null;
      const a = rand(6), b = rand(6); randOff = a - b;
    }
    const opps = m.gp.filter((o) => o.active && o.side === opp);                              // slot-orden
    const facingOk = (cx: number, cy: number) => {                                            // sub_6fa140
      const ang = H.bearing(cx - px, cy - py);
      if (p.facing === ang) return true;
      const lim = Math.trunc(p.roll.agility * 2.25 + 45);
      let d = Math.abs(p.facing - ang); if (d > 180) d = 360 - d;
      return d < lim;
    };
    const dribbling = recByte(p, 0x26);                                                      // rec+0x26 med movsx: den interne værdi (kan være < 0)
    for (let cy = py - 1; cy <= py + 1; cy++) {
      if (cy < 0 || cy >= 12) continue;
      if (flags & 4) {
        let ld = side === 1 ? m.lineSide0 - cy : cy - m.lineSide1;
        if (p.roll.offTheBall < 2) { ld -= rand(3); ld += rand(3); }
        if (p.roll.decisions !== 0 && m.teamFlags[opp] & 0x400) ld += 1;
        lineDelta = (ld << 24) >> 24;
        if (lineDelta > 2) continue;
      }
      for (let cx = px - 1; cx <= px + 1; cx++) {
        if (cx < 0 || cx >= 9) continue;
        if (cx === px && cy === py && flag2) continue;
        if (flag2 && !facingOk(cx, cy)) continue;
        if (p.pos & 0x30 && p.pos & 0x880 && cx >= 2 && cx <= 6 && !(px >= 2 && px <= 6) && !(flags & 1)) continue;
        const inCell = opps.filter((o) => o.x === cx && o.y === cy);
        let score = f32(randOff), n = 0;
        if (flag2) {
          n = inCell.length;
          if (n !== 0) { const a = rand(dribbling), b = rand(3); if (a > b) n = Math.max(n - 2, 0); }
          score = f32(randOff - (n - 0.5));
          const pen = 0.125 * p.weakFootPenalty;
          const left = cx < px || (cx === px && cx < 4), right = cx > px || (cx === px && cx > 4);
          if (p.strongFoot === 1) { if (side === 0 ? left : right) score = f32(score - pen); }
          else if (side === 0 ? right : left) score = f32(score - pen);
        } else for (const o of inCell) if (o.busy < 2) n++;
        // 0x6bd2e2/0x6bd36f: herfra regnes scoren på FPU-stakken (double) til fcom/fstp mod det bedste (float) ved 0x6bd536
        if (n !== 0 && !flag2) score = score - 2 * n * n;
        else {
          let minD = 5000;
          for (const o of opps) {
            if (o.pos & 1) continue;
            const d = H.cellDist(o.x - cx, o.y - cy);
            if (d === 0) { minD = 0; break; }
            if (d < minD) minD = d;
          }
          score = score + minD * minD;
        }
        const backwards = side === 0 ? cy < py : cy > py;
        let noBonus = false;
        if (backwards) { if (!(flags & 8)) { score = score - 4.5; noBonus = true; } }
        else score = score + (cy !== py ? 4 : 0.5);
        if (lineDelta > 0) score = score - 4 * lineDelta;
        if (!noBonus) {
          if ((!flag2 || flags & 1) && (cy < 3 || cy > 8) && cx >= 3 && cx <= 5) score = score + 3.5;
          if (cx === 4 || (px < 4 && cx >= 3 && cx <= px) || (px > 4 && cx >= px && cx <= 5)) score = score + 3;
          if (!flag2) {
            if (px > 4 && cx > px) score = score - 3 * (px - 4);
            if (px < 4 && cx < px) score = score - 3 * (4 - px);
          } else {
            if (!(px >= 2 && px <= 6) && !(cx >= 2 && cx <= 6) && !(flags & 1)) score = score + 0.25 * p.f.teamwork;
            if (px > 4 && cx > px) score = score - 2.5 * (px - 4);
            if (px < 4 && cx < px) score = score - 2.5 * (4 - px);
            if (io[0] === cx && io[1] === cy) score = score + 2.5;
          }
        }
        if (!(score < best)) { best = f32(score); bestX = cx; bestY = cy; }
      }
    }
    return bestX > -1 ? [bestX, bestY] : null;
  },
  /** sub_6bc030 (sikker; notes/6bc030-zonal-pick.md, porten i zonal.ts). Limen: nation = spillerens nation, ry = spillerpostens
   *  [hjemme, nuværende, verden] (cmRep; uden den repTriple(rep) – *estimeret*), klubbernes +0x53 ens = samme land ("?"), ingen
   *  mandsopdækning (vores Tactic har den ikke), gitterlisterne i slot-orden (*estimeret*). */
  zonalPick(m: GridMatchState, p: GP, rand: Rand): GP | null {
    return zonalPick<GP>({
      carrier: m.carrier as GP | null, receiver: m.receiver as GP | null, players: m.gp, teamFlags: m.teamFlags, counterFlag: m.counterFlag,
      lineSide1: m.lineSide1, lineSide0: m.lineSide0, sameClubGroup: m.nations[0] === m.nations[1],
      nation: (q) => q.src.nation, reps: (q) => q.src.cmRep ?? repTriple(q.src.rep ?? 50), jumping: (q) => q.a.jumping, longShots: (q) => q.f.longShots,
      tacticalCell: (q) => this.tacticalCell(m, q), manMarkTarget: (q) => L.manMarkTarget(m, q) as GP | null, freeRun: (q) => this.freeRun(m, q, rand),
      cellList: zonalCells(m),
    }, p, rand);
  },
  /** sub_6f9f90 (sikker; notes/vision-space-offside.md §1): kan p se feltet (tx,ty)? useSkill = a3 (synsvinklen af Creativity-rullet,
   *  modstandere nær og markering), oppNear = a4, mark = a5, wantLane = a6 ≠ 0 (banen tælles med sub_6cbc00 og Creativity ≥ rand(lane²)). */
  canSee(m: GridMatchState, p: GP, tx: number, ty: number, useSkill: boolean, oppNear: number, mark: number, wantLane: boolean, rand: Rand): { ok: boolean; lane: number } {
    const ang = H.bearing(tx - p.x, ty - p.y);
    if (p.facing === ang) return { ok: true, lane: 0 };
    let limit = 75;
    if (useSkill) {
      const cr = p.roll.creativity;                                                            // +0x10b
      const v = H.isCrossingPosition(p.view!, tx, ty) ? H.ftol(4 * cr + oppNear * 10 + 60) : H.ftol(5 * cr + oppNear * 10 + 40);
      const w = H.ftol((L.DIST[Math.abs(p.y - ty)][Math.abs(p.x - tx)] - mark) * 20 - 50);
      limit = Math.max(30, Math.min(135, v - w));
    }
    let diff = Math.abs(p.facing - ang); if (diff > 180) diff = 360 - diff;
    if (diff >= limit) return { ok: false, lane: 0 };
    if (!wantLane) return { ok: true, lane: 0 };
    const lane = H.laneBlockers(m.gp, m.poss, p.x, p.y, tx, ty);
    return { ok: p.roll.creativity >= rand(lane * lane), lane };
  },
  /** sub_6f4650 (sikker): står på mållinjens midterfelter, eller ser målet (uden skill, < 75°). */
  facingGoal(m: GridMatchState, q: GP, rand: Rand): boolean {
    const gy = goalRow(q.side);
    if (q.y === gy && q.x >= 3 && q.x <= 5) return true;
    return this.canSee(m, q, 4, gy, false, 0, 0, false, rand).ok;
  },
  /** sub_6cbad0 (sikker): et af de tre felter i rækken foran (skråt højre, skråt venstre, lige) er fri for modstandere. */
  spaceAhead(m: GridMatchState, p: GP): boolean {
    const opp = other(p.side), y = p.side === 1 ? p.y - 1 : p.y + 1;
    if (y < 0 || y > 11) return false;
    const free = (x: number) => !m.gp.some((o) => o.active && o.side === opp && o.x === x && o.y === y);
    if (p.x < 8 && free(p.x + 1)) return true;
    if (p.x > 0 && free(p.x - 1)) return true;
    return free(p.x);
  },
  /** sub_6cb780 (sikker): 0 = ikke frit (egen halvdel, modstander i feltet, eller en modstander-markspiller mindst lige så nær målet);
   *  ellers 2 hvis en medspiller-markspiller er nærmere målet – og originalens egen løkke tager spilleren selv med, så 1 forekommer
   *  kun for målmænd. */
  freeRun(m: GridMatchState, p: GP, rand: Rand): 0 | 1 | 2 {
    if (L.inOwnHalf(p)) return 0;
    const opp = other(p.side), gy = goalRow(p.side);
    if (m.gp.some((o) => o.active && o.side === opp && o.x === p.x && o.y === p.y)) return 0;
    let t = Math.fround(L.dist(p.x, p.y, 4, gy) + 0.5);
    if (!this.facingGoal(m, p, rand)) t = Math.fround(t + 1);
    for (const q of m.gp) if (q.active && q.side === opp && q.pos !== L.POS.keeper && L.dist(q.x, q.y, 4, gy) <= t) return 0;
    for (const q of m.gp) if (q.active && q.side === p.side && q.pos !== L.POS.keeper && L.dist(q.x, q.y, 4, gy) < t) return 2;
    return 1;
  },
  /** sub_6cfd70 (thunk) → sub_6ea760 (sikker, gennemgået i asm 11/11; mens en fordel venter, sub_6bab90, flages ingen):
   *  hvem flages ved en aflevering fra række y0 mod y1 (excl = skytten ved skud, ellers null). Linjevogterens +0x29 = official29 (?),
   *  hans karakter (+8) = m.linesmanMark. Rækkereglerne er `offsideFlag` i cm0102-original-rules.ts. */
  offsidePlayer(m: GridMatchState, side: Side, y0: number, y1: number, excl: GP | null, rand: Rand): GP | null {
    const Lrow = side === 0 ? m.lineSide1 : m.lineSide0, s = side === 0 ? 1 : -1;
    dbg('off:call' + (excl ? 'S' : ''));
    if (side === 0 ? y1 <= y0 || y1 < Lrow : y1 >= y0 || y1 > Lrow) return null;
    dbg('off:reach' + (excl ? 'S' : ''));
    for (const q of m.gp) if (q.active && q.side === side && q !== excl) { const b = side === 0 ? q.y - Lrow : Lrow - q.y; if (b >= -2) dbg('off:row' + b + (excl ? 'S' : '')); }
    if (advantagePending(m)) return null;                                                     // 0x6ea76e sub_6bab90
    const att = m.gp.filter((o) => o.active && o.side === side);                              // målmand med, slot-orden
    if (excl && !att.some((q) => (side === 0 ? q.y > y0 : q.y < y0))) return null;            // sub_6cb700(y0, side, 0)
    if (rand((m.official29 ?? this.official29) + 25) === 0) { m.linesmanMark -= 75; return null; }
    const inAttBox = (x: number, y: number) => x >= 2 && x <= 6 && (side === 0 ? y >= 10 : y <= 1);
    for (const q of att) {
      if (q === excl) continue;
      if (excl) {
        if (!inAttBox(excl.x, excl.y)) continue;
        if (rand(4) + 1 < L.dist(q.x, q.y, 4, y1)) continue;
      }
      const v = q.roll.offTheBall;                                                              // +0x107
      if (q.y === Lrow - 2 * s) { if (rand(6 * v + 500) === 0) { m.linesmanMark -= side === 0 ? 25 : 15; return q; } }   // side 1: −15 (0x6eaa43 → 0x6eab31, sic)
      else if (q.y === Lrow - s) { if (rand(H.ftol(crtPow(v, 3) + 25)) === 0) { m.linesmanMark -= 15; return q; } }
      else if (q.y === Lrow) { if (rand(3) !== 0 && v < rand(18)) { m.linesmanMark += 15; return q; } }
      else if (side === 0 ? q.y > Lrow : q.y < Lrow) { if (v < rand(100)) return q; }
    }
    return null;
  },
  /** match+0x4756 vejret 1..4 (sub_6fad40 §4.2/§5.5, skuddet) – ukendt i laboratoriet, *estimeret* 3 som skuddets ctx. */
  weather: 3,
  /** match+0x4756 som dword til kommentarens vejrvariant (sub_6d5d80: lav byte og næste byte) – oraklets ligakampe har 0 i begge
   *  (cmt2-sporet 11/11: 0x0212/0x001c/0x011c… i de høje bytes); *estimeret* 0 */
  weatherWord: 0,
  /** match+0x1 (2 / 0x20 trækker fra modtagelsens passPower, sub_6f6c00) – "?", *estimeret* 0. */
  byte1: 0,
  /** sub_6ec010's [esp+0x24] i Work Rate-floaten (0x6ee225: + 0,5·X): anførerleddet 0x6ec1be–0x6ec2ed eller trænerleddet 0x6ed376
   *  (0,02·træner+0x0e + 0,1, holdets stab engine+0x904d) – ingen af delene findes i laboratoriet; *estimeret* 4,5 = medianen af
   *  2·(+0xf5 − Work Rate − motivationen) i kampsporet tfoul2 (R-linjerne). */
  workRateX: 4.5,
  /** sub_600a50(nation, 0, 1, 0, 0) i indlæggets grundtal (sub_6fad40 §4.1, +62/+75 i stedet for +45/+62) – ikke læst, *estimeret* nej. */
  nationOk: false,
  /** sub_6ceb90 pick_taker (sikker; notes/referee-taker.md §3): bedste score blandt sidens spillere i pladsrækkefølge. Taktikkens
   *  skytter: vores Tactic har én pr. kategori, så den er første valg for begge sider (originalen har 2×2). Straffe: AI-vejen (den
   *  menneskelige managers liste sub_601070 findes ikke her). Alder (staff+0x18, "?") = 25 og omdømme (post +0xb) = rep·100 ("?"). */
  pickTaker(m: GridMatchState, side: Side, state: number, rand: Rand, excluded?: Set<GP>): GP {
    const dist = (p: GP, x: number, y: number) => L.DIST[Math.min(11, Math.abs(p.y - y))][Math.min(8, Math.abs(p.x - x))];
    const tac = m.tactics[side], bx = m.ballX, by = m.ballY;
    const age = 25, repOf = (p: GP) => (p.src.rep ?? 50) * 100;
    let best: GP | null = null, bestScore = -1;
    for (const p of m.gp) {
      if (p.side !== side || !p.active || p.slot > 10) continue;
      if (excluded?.has(p)) continue;                                                   // straffesparkskonkurrencen: har sparket (+0x8eda)
      if (p.isKeeper) {
        if (state === 1 || state === 2 || state === 3 || state === 8) continue;
        if ((state === 6 || state === 7) && !inBoxAt(side, m.ballX, m.ballY)) continue;     // 0x6cec81: kun frispark med BOLDEN i eget felt (før hans felt)
      }
      let sc: number;
      if (state === 1) sc = Math.trunc(p.f.tackling - 2 * dist(p, bx, by));
      else if (state === 2) sc = Math.trunc(p.f.throwIns - 2 * dist(p, bx, by));
      else if (state === 3) {
        const kindA = side === 0 ? bx >= 4 : bx <= 4;                                    // taktikplads 3 (+ rand) / 2
        if (p.src.id === tac.corners) sc = kindA ? 10000 - rand(1000) : 10000;
        else { sc = Math.trunc(p.f.corners - 0.5 * p.f.jumping); if (p.pos & L.POS.forward) sc = Math.trunc(sc * (sc > 0 ? 0.75 : 1.25)); }
      } else if (state === 4) sc = p.pos === L.POS.keeper ? 100 : 0;
      else if (state === 5) {
        if (p.isKeeper) sc = -10000;
        else {
          sc = Math.trunc(p.f.penalties);
          if (sc > 0) {
            if (age < 20) sc = Math.trunc(sc * 0.35); else if (age < 24) sc = Math.trunc(sc * 0.75);
            if (p.pressure !== 0 && rand(p.pressure) === 0) sc = Math.trunc(sc * 0.35);
            sc = Math.trunc((repOf(p) * 2.5e-5 + 0.75) * sc);
          }
        }
      } else if (state === 6 || state === 7) {
        const gy = side === 0 ? 11 : 0, d = L.DIST[Math.abs(by - gy)][Math.abs(bx - 4)];
        const cen = bx >= 2 && bx <= 6;
        if (cen && d < 4.1) {                                                             // direkte frispark
          if (p.src.id === tac.freeKicks) sc = 10000;
          else {
            sc = 5 * (p.src.attrs[ATTRS.indexOf('freeKicks')] || 10) + 2 * p.roll.flair;   // post +0x29 (rå) + flair-rul
            if (sc > 0) { if (age < 20) sc = Math.trunc(sc * 0.85); else if (age < 24) sc = Math.trunc(sc * 0.95); sc = Math.trunc((repOf(p) * 2.5e-5 + 0.75) * sc); }
          }
        } else if (!cen && d < 6.1) sc = Math.trunc(2 * p.f.freeKicks - 0.5 * p.f.jumping);    // indlægsfrispark (0x6cf531: d < 6,1 – noten havde ≥)
        else sc = Math.trunc(p.f.freeKicks - dist(p, bx, by) ** 2);
      } else sc = Math.trunc(100 - dist(p, bx, by));                                     // 8: kickoff, nærmest bolden
      if ((!best && !excluded) || sc > bestScore) { best = p; bestScore = sc; }
    }
    if (excluded) return best as GP;                                                      // med liste: 0, når ingen slår −1 (keeperen −10000)
    return best ?? m.gp.find((o) => o.side === side && o.active)!;                         // originalen: fatal 0x3e89
  },
  /** dommerpostens bytes, når GridMatchCtx.official mangler: medianen af de 21 engelske dommere i officials.dat 3.9.60 (byte 0x22 > 0) –
   *  +0x24 0, Discipline (0x25) 11, +0x27 0, +0x28 19 (+0x29 = official29). Hvordan originalen vælger kampens dommer, er ikke læst. */
  ref24: 0, ref28: 19,
  refDiscipline: 11, ref27: 0,
  /** stadionets kapacitet til motivationen (fixture+0x18 → +0x3c), *estimeret* 40.000 (Premier League 2001/02) */
  capacity: 40000,
  /** sub_85cba0 (tilskuertallet, uden for motoren – ikke porteret): i alt = oraklets snit for Premier League 2001/02 (35.428, frø 1);
   *  udeholdets tilhængere 8 % *estimeret*. Bruges, når GridMatchCtx.crowd mangler. */
  /** 0x6df460 (aiMode.ts) kobles ind: computerens tilstand 1–5 pr. dødbold. Slået fra, indtil territoriet passer (porten får bolden for
   *  sjældent ind i hjemmeholdets tredjedel: 18,5 % mod originalens 27,2 % – med tilstanden 56/25/19 i stedet for 51/23/26) */
  aiMode: true,
  /** computerholdets taktikvalg og opstilling (0x6e0230 + 0x6e2000, aiTeam.ts) i stedet for vores AI-taktik */
  aiTeam: true,
  crowd: { total: 35428, home: 29400, away: 6028 },   // *estimeret*: 17 % udebanetilhængere giver publikumsbyte 2–3 som kampsporene (aimode*.txt: oftest 1–4); sub_85cba0 ikke porteret
  /** comp+0x69: English Premier Division = 18 (club_comp.dat 3.9.60, sikker for Premier League) */
  compRep: 18,
  /** sub_6ea760: dommerpostens byte +0x29 ([official+4]+0x29 – samme post som +0x24/+0x25/+0x28, ikke en separat linjevogter):
   *  rand(+0x29 + 25) == 0 → alt overses. Medianen af de 21 engelske dommere i officials.dat 3.9.60 (byte 0x22 > 0) er 0.
   *  NB sub_6cfd70 er kun en thunk til sub_6ea760 (ingen egen udvælgelse – det tidligere skøn offsideReach brugtes ikke). */
  official29: 0,
};

// ------------------------------------------------------------------ opbygning

const POS_WORD: Record<string, number> = { GK: 0x1, SW: 0x2, D: 0x4, DM: 0x8, M: 0x10, AM: 0x20, ST: 0x40, WB: 0x8 };
const SIDE_WORD: Record<string, number> = { L: 0x80, C: 0x200, R: 0x800 };
const TECHN = ['anticipation', 'crossing', 'decisions', 'dribbling', 'finishing', 'handling', 'heading', 'longShots', 'marking', 'offTheBall', 'oneOnOnes', 'passing', 'penalties', 'positioning', 'reflexes', 'tackling', 'throwIns', 'creativity'] as const;
const RAWN = ['acceleration', 'pace', 'agility', 'balance', 'strength', 'flair', 'freeKicks', 'jumping', 'teamwork', 'technique', 'aggression', 'bravery', 'corners'] as const;

/** en taktikplads ud fra originalens positionsmaske (GK 0x1, SW 0x2, D 0x4, DM 0x8, M 0x10, AM 0x20, F 0x40; L 0x80, LC 0x100, C 0x200, RC 0x400,
 *  R 0x800) – kun til målmanden og grundpositionen; motoren bruger selve masken (makePlayer base.pos) */
function maskSlot(mask: number): Tactic['slots'][number] {
  const row = mask & 1 ? 0 : mask & 2 ? 1 : mask & 4 ? 2 : mask & 8 ? 3 : mask & 0x10 ? 4 : mask & 0x20 ? 5 : 6;
  const y = mask & 0x80 ? 10 : mask & 0x100 ? 30 : mask & 0x400 ? 70 : mask & 0x800 ? 90 : 50;
  const x = [2, 12, 20, 35, 50, 65, 85][row];
  const side = y < 40 ? 'L' : y > 60 ? 'R' : 'C';
  const pos = row === 0 ? 'GK' : row <= 2 ? (side === 'L' ? 'LB' : side === 'R' ? 'RB' : 'CB') : row === 3 ? 'DM' : row === 4 ? (side === 'L' ? 'LM' : side === 'R' ? 'RM' : 'CM')
    : row === 5 ? (side === 'L' ? 'LW' : side === 'R' ? 'RW' : 'AM') : 'CF';
  return { pos, side, x, y } as Tactic['slots'][number];
}

/** konditionsmodulets aflæsning (0x62c590) for den kamp, der bygges (sat i createGridMatch, når spillet har konditionsmodulet) */
let kickFit: ((p: Player) => number) | null = null;
/** 0x62ed70/0x62ec00/0x62ece0 for knock-tjekket (konditionsmodulet i game/cmFitness.ts) – uden modulet: ingen skade */
let kickInj: ((p: Player) => { cat: number; s: number }) | null = null;
function makePlayer(p: Player, side: Side, slot: number, tactic: Tactic, base?: { lo: number; hi: number; tb: number; pos?: number; posAttack?: number },
  crowd?: { byte: number; compRep: number; final: boolean; mot?: ReturnType<typeof initMotivation> }): GP {
  const s = tactic.slots[slot];
  const gk = s.pos === 'GK';
  const sh = (k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
  // sub_6ec010: kamp-CA'en med nervøsiteten fra publikums-byten (hjemmebanen – erstatter det tidligere skøn homeAdv)
  const nerves = crowd ? nervesOf(crowd.byte, sh('professionalism'), sh('importantMatches'), gk, crowd.compRep, crowd.final) : 0;
  const mv = crowd?.mot ?? { formRoll: 0, badDay: 0, motivation: 0, bff: Math.trunc((sh('dirtiness') + 10) / 4) };
  // dårlig dag-tærsklen (0x6ec7ae: sub_53ce90 og det mentale led bl) er ikke porteret – formRoll bruges kun i moral-leddet
  const mc = H.matchCa({ ca: p.ca, pa: Math.max(p.ca, p.pa), isKeeper: gk, nerves, motivation: mv.motivation, formRoll: mv.formRoll });
  const f: Record<string, number> = {};
  // de interne værdier: Player.cmInt (spilstartens præcise, ægte tilstand) – ellers regnet tilbage fra de viste (*estimeret*)
  const intr = (k: string) => { const j = p.cmInt ? INTRINSIC_KEYS.indexOf(k as never) : -1; return j >= 0 && p.cmInt![j] !== undefined ? (p.cmInt![j] << 24) >> 24 : H.intrinsicFromShown(p.ca, sh(k)); };
  for (const k of TECHN) f[k] = H.technicalMatchFloat(k, intr(k), mc);
  for (const k of RAWN) f[k] = H.rawMatchFloat(k, sh(k));
  // sub_6ec010 0x6ee1ca–0x6ee231 (+0xf5): Work Rate (·0,75 fra 36 år – alderen er ikke med i limen) + motivationen +0x100 − dårlig dag-
  // fradraget [esp+0x14] / (trunc(Professionalism/2) + 10) + 0,5·X. Før var det den rå værdi, så workRate-rullet (loftet +0x116 = +0xf5 + 2)
  // var ~10 for lavt (kampsporet: +0xf5 median 21,7 mod 13). Gangene 0,9/0,95/1,1 (0x6ee065–0x6ee491, historik/personlighed) er ikke med.
  f.workRate = sh('workRate') + mv.motivation - mc.pen / (Math.trunc(sh('professionalism') / 2) + 10) + 0.5 * GRID_UNKNOWN.workRateX;
  f.versatility = sh('versatility');
  f.stamina = H.rawMatchFloat('stamina', sh('stamina'));                    // +0xd5 (sub_6f56c0)
  // positionsordet sub_6c38c0 = pladsens maske i taktikken (med LC/RC 0x100/0x400); sub_6c38f0 = den sekundære maske ("?")
  const pos = base?.pos ?? (gk ? 0x1 : POS_WORD[s.pos] | (SIDE_WORD[s.side] ?? 0x200)), posAttack = base?.posAttack ?? pos;
  // +0x37: positionstilpasningen (sub_6eecb0, rettelse 6) ud fra spillerens positionsevner [GK SW D DM M AM F WB] og sider [L C R]
  const r: H.PosRatings = { gk: p.pos[0], sw: p.pos[1], d: p.pos[2], dm: p.pos[3], m: p.pos[4], am: p.pos[5], f: p.pos[6], wb: p.pos[7], l: p.side?.[0] ?? 20, c: p.side?.[1] ?? 20, r: p.side?.[2] ?? 20, free: 1 };
  // de individuelle instruktioner (+0x188b) og taktikbyten (+0x5b4): pladsens værdi i taktikken + vores instruktioner (tacticTable.ts instrOf)
  // MATCH_PLAYER::init 0x6eaea0 (player-state-bytes.md): agitation = gulvet 2·(25 − Temperament), +0xff = trunc((trunc(mot/2) + Dirtiness + 10)/4)
  // med motivationen +0x100 fra initMotivation
  const bff = mv.bff;
  const iv = instrOf(tactic.individual?.[slot], base), instr = instrBig(iv), tacticByte = base?.tb ?? 0x12;
  const form = Math.min(0, H.positionFit(pos, posAttack, r, sh('versatility'), (iv.lo & 0x200000) !== 0));
  // fødderne: spillerposten +0x30/+0x3b (Player.feet, original database); ellers *estimeret* 20/8 ud fra p.foot
  const lf = p.feet?.[0] ?? (p.foot === 'L' || p.foot === 'B' ? 20 : 8), rf = p.feet?.[1] ?? (p.foot === 'R' || p.foot === 'B' ? 20 : 8);
  let bx = clampX(Math.round((s.y / 100) * 8)), by = Math.min(10, Math.round((s.x / 100) * 11));
  if (gk) { bx = 4; by = 0; }
  if (side === 1) bx = 8 - bx;
  const a: L.Attr = { acceleration: f.acceleration, anticipation: f.anticipation, decisions: f.decisions, flair: f.flair, jumping: f.jumping, marking: f.marking, offTheBall: f.offTheBall, pace: f.pace, positioning: f.positioning, tackling: f.tackling, teamwork: f.teamwork, creativity: f.creativity, workRate: f.workRate, agility: f.agility, versatility: f.versatility };
  const g: GP = {
    // +0x4d ved kampstart: MATCH_PLAYER::setup 0x6eb026 læser konditionen rå fra 0x62c590 (cmFitness.ts condition) – uden konditionsmodul
    // (lab/moderne spil) *estimeret* 100·max(60, Player.condition)
    side, slot, active: true, x: bx, y: side === 0 ? by : 11 - by, action: L.ACT.none, rating: 6100, condition: kickFit && p.cmFit ? kickFit(p) : 100 * Math.max(60, p.condition ?? 100), pendingCond: 0, busy: 0,
    matchCA: mc.K, form, morale: 10, injury: 0, agitation: 2 * (25 - sh('temperament')), agFloor: 2 * (25 - sh('temperament')), pos, tacticByte, instr, freeRoleRating: p.cmFree ?? 1, a,   // spillerpost +0x1a (0x714286)
    cap: undefined as unknown as L.Caps, roll: { pace: 0, anticipation: 0, decisions: 0, offTheBall: 0, marking: 0, flair: 0, positioning: 0, creativity: 0, agility: 0, workRate: 0 },
    marks: null, markers: [], ref: p.id, src: p, f, posAttack, facing: side === 0 ? 0 : 180, strongFoot: rf >= lf ? 1 : 0, weakFootPenalty: 20 - Math.min(lf, rf),
    leftFoot: lf, rightFoot: rf, baseX: bx, baseY: by, gkRating: p.pos[0], tbl: null, pslot: slot, posR: r,
    // udfordringen/dommeren (challenge.ts, judgeTackle): ukendte bytes starter som 0 (noterne), evnerne sættes efter hjemmebanen
    fouls: 0, foulsSuffered: 0, yellows: 0, reasons: [0, 0], b16: 0, skill: [], momentum: 0, w29: 0, w31: 0, w33: 10, b1d: 0, b1c: 0, injuredBy: null, temperCount: bff, bffBase: bff, grudge: null,
    sportsmanship: sh('sportsmanship'), temperament: sh('temperament'), pressure: sh('pressure'), consistency: sh('consistency'), isKeeper: gk,
    tacklesTried: 0, tacklesWon: 0, dribblesPast: 0, b6: 0, bfd: 0, b7: 0, b8: 0, b9: 0, blocks: 0, shots: 0, shotsOnTarget: 0, penGoalsWon: 0,
    // +0x3d/+0x3f/+0x41/+0x43/+0x45 målenes tællere (klub, landshold, liga for klubben, liga i karrieren, sæsonen) sættes af MATCH_PLAYER::init
    // 0x6eb1b4–0x6eb41a fra PlayerStats (0x7c3bb0/0x7c3d20/0x7c47b0) – ikke porteret: originalens "ingen data" −1000 (0xfc18), så jubilæumsmålene
    // (0x70802c) ikke siges
    w39: 0, assists: 0, goals: 0, penGoals: 0, b0f: 0, goalWords: [-1000, -1000, -1000, -1000, -1000], motivation: mv.motivation, formRoll: mv.formRoll, badDay: mv.badDay,
    c01: 0, c02: 0, pensTaken: 0, offsidesCaught: 0, b1b: 0, debut: 0, inj: kickInj ? kickInj(p) : { cat: -1, s: 0 }, cell: -1,
    dirtiness: sh('dirtiness'),
    determination: sh('determination'), professionalism: sh('professionalism'), teamworkRaw: p.attrs[ATTRS.indexOf('teamwork' as never)] || 10,
  };
  g.cap = L.rollCaps(g);
  return g;
}

/** MATCH_PLAYER's float-felter er float32 i originalen (+0x4d kondition, +0x59 ventende kondition, +0x1a2 agitation): hver skrivning
 *  afrundes til float32 som originalens fstp dword (før regnede porten i double, så summer drev fra originalens efter få tik) */
function f32Fields(p: GP): void {
  for (const k of ['condition', 'pendingCond', 'agitation'] as const) {
    let v = Math.fround(p[k]);
    Object.defineProperty(p, k, { get: () => v, set: (x: number) => { v = Math.fround(x); }, enumerable: true, configurable: true });
  }
}
export function attachView(m: GridMatchState, p: GP): void {
  const v = {
    side: p.side, slot: p.slot, x: p.x, y: p.y, posFlags: p.pos, pos: p.pos, posAttack: p.posAttack, plads: 0, condition: p.condition, w35: 0, passesInMove: 0,
    b2c: p.strongFoot, b2d: p.weakFootPenalty, busy: p.busy, facing: p.facing, momentum: 0, action: p.action, strongFoot: p.strongFoot, weakFootPenalty: p.weakFootPenalty,
    leftFoot: p.leftFoot, rightFoot: p.rightFoot, crossing: p.f.crossing, finishing: p.f.finishing, flair: p.f.flair, jumping: p.f.jumping, pace: p.f.pace, strength: p.f.strength,
    teamwork: p.f.teamwork, technique: p.f.technique, throwIns: p.f.throwIns, creativity: p.f.creativity, paceRoll: 0, anticRoll: 0, decRoll: 0, offBallRoll: 0, creatRoll: 0,
    instr: { lo: Number(p.instr & 0xffffffffn), hi: Number(p.instr >> 32n) }, staff: { id: p.src.id, nationName: p.nationName ?? (hasGame() ? gs().nations[p.src.nation]?.name : undefined) ?? m.nations[p.side], professionalism: p.src.attrs[ATTRS.indexOf('professionalism')] || 10, favoured: [], disliked: [] },
    rolls: { b107: 0, b108: 0, b10a: 0, b10c: 0 }, tacklingBit2: false, challengers: [] as H.MatchPlayer[],
  };
  p.view = v as PassPlayer & H.MatchPlayer;
}
/** opdatér visningerne (positioner, rul) før en beslutning */
function sync(m: GridMatchState): void {
  for (const p of m.gp) {
    const v = p.view!;
    v.x = p.x; v.y = p.y; v.momentum = p.momentum; v.slot = p.active ? p.slot : -1; v.busy = p.busy; v.facing = p.facing; v.action = p.action; v.condition = p.condition;
    v.w35 = p.rating;                                                                        // +0x35 = karakteren ×1000 (0x6c6eb2: W = (kondition + karakter − 15000)·0,25)
    v.paceRoll = p.roll.pace; v.anticRoll = p.roll.anticipation; v.decRoll = p.roll.decisions; v.offBallRoll = p.roll.offTheBall; v.creatRoll = p.roll.creativity;
    v.rolls.b107 = p.roll.offTheBall; v.rolls.b108 = p.roll.marking; v.rolls.b10a = p.roll.positioning; v.rolls.b10c = p.roll.agility;
    v.challengers = p.markers.map((q) => (q as GP).view!);
    v.tacklingBit2 = (p.tacticByte & 2) !== 0;                                               // sub_6f4600: taktikbyten bit 2 → positionsrullet (før altid false)
  }
}

const emptyStats = (): GridSideStats => ({ goals: 0, shots: 0, onTarget: 0, corners: 0, fouls: 0, offsides: 0, yellows: 0, reds: 0, passes: 0, passesCompleted: 0 });


// ------------------------------------------------------------------ kampen

/** Kampen trin for trin (til live-kampen): `tick()` spiller ét tik af originalens løkke (sub_6b98c0) og giver false, når kampen er slut */
export interface GridMatch {
  m: GridMatchState; tick(): boolean; readonly finished: boolean; result(): GridResult;
  /** menneskets udskiftning (sker ved næste dødbold); false = ikke tilladt */
  substitute(side: Side, outId: number, inId: number): boolean;
  /** menneskets nye taktik (sker ved næste dødbold) */
  setTactic(side: Side, tactic: Tactic): void;
  /** udskiftninger tilbage (minus de ventende) */
  subsLeft(side: Side): number;
  /** udskiftningernes bytes for en spiller (minut ind/ud/udvist/skadet) */
  subState(p: GP): { minuteOn: number; minuteOff: number; minuteRed: number; minuteInjured: number; substituted: boolean } | undefined;
  /** originalens kommentarkø (Match_Events, matchEvents.ts) – adapteren læser de nye poster efter hvert tik (drain) */
  events: MatchEvents;
}

/** Hele kampen på én gang (scripts/grid-stats.ts, tests) – samme tal som tik for tik */
export function runGridMatch(home: GridTeam, away: GridTeam, rand: Rand, ctx: GridMatchCtx = {}): GridResult {
  const g = createGridMatch(home, away, rand, ctx);
  while (g.tick()) { /* tik */ }
  return g.result();
}

export function createGridMatch(home: GridTeam, away: GridTeam, rand: Rand, ctx: GridMatchCtx = {}): GridMatch {
  const teams = [home, away];
  { const g = hasGame() ? gs() : null;
    if (g && cmFitOn(g)) {
      const fr = cmFitRead(g); kickFit = (p) => fr.condition(p);
      kickInj = (p) => {
        if (p.regen || !p.cmFit) return { cat: -1, s: 0 };
        fr.update(p);                                                                          // 0x62ed70 opdaterer posten (0x62c680) før læsningen
        const e = p.cmFit.inj, rt = (p.cmFit.rt << 24) >> 24, rl = (p.cmFit.rl << 24) >> 24;
        return { cat: e ? INJ_TYPES[e.t][0] : -1, s: rt > -1 ? (rl <= 1 ? 1 : rl) : 0 };
      };
    } else { kickFit = null; kickInj = null; } }
  const on = ctx.on;
  const onShot = ctx.onShot;                                                                  // kun spor (situation() skygger ctx)
  // init_match: publikums-bytene engine+0x1ad/+0x1ae (hjemmebanen), læst af kampværdierne, dommeren og motivationen
  const crowd = ctx.crowd ?? GRID_UNKNOWN.crowd, capacity = ctx.capacity ?? GRID_UNKNOWN.capacity, derby = ctx.derby ?? false;
  const sideByte = crowdBytes(crowd, ctx.ownGround ?? true);
  const compRep = ctx.compRep ?? GRID_UNKNOWN.compRep, final = ctx.final ?? false;
  const passCompRep = ctx.compRep ?? null;
  // sub_897dc0(klub, 0/1): holdets playmaker / target man (klubbens taktikliste [0xde1d08]) – findes ikke i vores Tactic → ingen
  const roles: [[number | null, number | null], [number | null, number | null]] = ctx.roles ?? [[null, null], [null, null]];                                                    // sub_6c6a30: null = ingen turnering (fixture+0x14 = 0)
  const gp: GP[] = [];
  const maps: ReturnType<typeof mapTactic>[] = [];
  const aiFlags: (number | undefined)[] = [undefined, undefined];
  const aiTactics: (Tactic | undefined)[] = [undefined, undefined];
  /** computerens bænk fra pick_team (0x6e2000 med bænkpladserne, aiTeam.ts) */
  const aiBench: (number[] | undefined)[] = [undefined, undefined];
  const aiPicks: [{ ctx: AiPickCtx; captain: number | null; setPieces: number[] } | null, { ctx: AiPickCtx; captain: number | null; setPieces: number[] } | null] = [null, null];
  teams.forEach((t, side) => {
    const ps = t.players instanceof Map ? t.players : new Map(t.players.map((p) => [p.id, p]));
    // originalens positionstabel: nærmeste forudindstilling (rolle/side, så placering) – tacticTable.ts
    // originalens positionstabel (tacticTable.ts): forudindstillingen, når taktikkens masker er præcis dens, ellers det kanoniske gitter
    let map = maps[side] = mapTactic(t.tactic.slots, t.tactic.formation);
    // computerholdet (0x6dbb80 → 0x6e0230 + 0x6e2000, aiTeam.ts): en af originalens 45 faste taktikker og spillerne fordelt på dens pladser.
    // Tilstanden før kampen (0x6df460 med inMatch = false, styrke = omdømme) indgår i valget.
    let tactic = t.tactic;
    if (GRID_UNKNOWN.aiTeam && (!ctx.ai || ctx.ai[side])) {
      const rep = (c: Side) => ctx.rep?.[c] ?? 5000;
      const pre = aiModeOf({ side: side as Side, inMatch: false, strength: [rep(0), rep(1)], rep: [rep(0), rep(1)], territory: [0, 0, 0], clock: 0, periodEnd: 495,
        crowd: [sideByte[0], sideByte[1]], goals: [0, 0], firstLeg: null, fixtureFlags: 0, fixtureKind: ctx.league === false ? 0 : 33, onPitch: [11, 11],
        sameDivision: ctx.league !== false, compLink: ctx.league !== false, league: null, mgrAttacking: ctx.managers?.[side]?.tac[0] ?? null, rivals: !!ctx.derby, prevMode: 2, prevR: -1000 });
      const cands = [...ps.values()].filter((p) => !p.injury && !(p.banned > 0) && !p.reserves);
      // pick_team 0x6dbc50 (aiTeam.ts): flagenes og bænkpladsernes rand trækkes her – før MATCH_PLAYER::init (initMotivation) som i originalen
      const r = aiTeamSetup({ squad: cands, tac: ctx.managers?.[side]?.tac ?? null, mode: pre.mode, rep: rep(side as Side), oppRep: rep(other(side as Side)),
        compType: ctx.compType ?? 0, rand, pick: ctx.pick?.[side] ?? undefined });
      const pr = PRESET_TACTICS[r.presetIndex];
      if (pr && r.lineup.every((id) => id !== null)) {
        map = maps[side] = { preset: pr, table: presetTable(pr), slotOf: r.entry.masks.map((_, i) => i), masks: r.entry.masks, masks2: r.entry.masks2, flags: r.entry.flags,
          lo: r.entry.lo, hi: pr.hi, tb: r.entry.tb };
        tactic = { ...t.tactic, formation: pr.name, lineup: r.lineup as number[], slots: r.entry.masks.map(maskSlot), individual: [] };
        aiTactics[side] = tactic;
        aiBench[side] = r.bench;
        aiPicks[side] = { ctx: ctx.pick?.[side] ?? {}, captain: r.captain, setPieces: r.setPieces };
      }
    } else if (GRID_UNKNOWN.aiTeam) {
      // menneskets hold: pick_team(…, 1) trækker også flagenes rand (0x6dcd90) – kun tallene, taktikken er menneskets
      pickFlags(rand, { national: false, compType: ctx.compType ?? 0, ownRep: ctx.rep?.[side] ?? 5000, oppRep: ctx.rep?.[1 - side] ?? 5000, leagueMember: ctx.league !== false });
    }
    tactic.lineup.forEach((id, slot) => {
      const p = ps.get(id); if (!p) return;
      const ps0 = map.slotOf[slot] ?? slot;
      const sh = (k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10, gk = t.tactic.slots[slot].pos === 'GK';
      const mot = initMotivation(rand, { prof: sh('professionalism'), im: sh('importantMatches'), ca: p.ca, cons: sh('consistency'), dirt: sh('dirtiness'), gk,
        gkRating: p.pos[0], side: side as Side, byte0: sideByte[0], compRep, derby, crowd: crowd.total, capacity });
      const g = makePlayer(p, side as Side, slot, tactic, { lo: map.lo[ps0], hi: map.hi[ps0], tb: map.tb[ps0], pos: map.masks[ps0], posAttack: map.masks2[ps0] },
        { byte: sideByte[side], compRep, final, mot });
      // +0x31 (0x6eb0d4): +10 hvis modstanderklubben har ham som yndling, −20 hvis den hader ham (club +0x9b..+0xaf – findes ikke i vores
      // data → 0), −10 i derby; +0x33 = 10 (+5 i derby) – yndling/hadet findes ikke i vores data
      g.w31 = derby ? -10 : 0; g.w33 = derby ? 15 : 10;
      g.tbl = map.table; g.pslot = ps0; gp.push(g);
    });
    // bænken (idx 11..10 + turneringens +0x4d & 0xf, plads −1): MATCH_PLAYER::init 0x6eaea0 kører for alle 20 i truppen (0x6e0d00) – samme
    // motivation/rand som starterne, lige efter dem ("?" om rækkefølgen mod 0x6ddab0). Keeper = naturlig målmand (*estimeret*); karakter 6400.
    for (const id of aiBench[side] ?? benchFor(ps, tactic.lineup, t.tactic, !ctx.ai || ctx.ai[side])) {
      const p = ps.get(id)!;
      const sh = (k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10, gk = p.pos[0] >= 15;
      const mask = gk ? 0x1 : 0x210, bt = { ...tactic, slots: [maskSlot(mask)], individual: [] } as Tactic;
      const mot = initMotivation(rand, { prof: sh('professionalism'), im: sh('importantMatches'), ca: p.ca, cons: sh('consistency'), dirt: sh('dirtiness'), gk,
        gkRating: p.pos[0], side: side as Side, byte0: sideByte[0], compRep, derby, crowd: crowd.total, capacity });
      const g = makePlayer(p, side as Side, 0, bt, { lo: 0x15552221, hi: 0xa, tb: 0x12, pos: mask, posAttack: mask }, { byte: sideByte[side], compRep, final, mot });
      g.w31 = derby ? -10 : 0; g.w33 = derby ? 15 : 10; g.slot = -1; g.active = false; g.rating = 6400; g.tbl = map.table; g.pslot = -1;
      gp.push(g);
    }
    // computerens taktik før kampen (sub_6ddab0, aiPrematch.ts – 99 % af originalens instruktioner i kampsporet): holdflag, individuelle
    // instruktioner og masker pr. plads ud fra spillerne og managerens egenskaber. *estimeret*: ingen manager (world-filen har ikke
    // managerens Attacking/Directness/Offside/Pressing endnu → originalens "uden manager"-gren), omdømmet fra ctx.rep. Positionstabellen
    // bliver forudindstillingens (0x5b2ba0 ændrer kun maskerne).
    if (!ctx.ai || ctx.ai[side]) {
      const sideG = gp.filter((g) => g.side === side && g.slot >= 0);
      const at = (p: Player, n: number) => p.attrs[ATTRS.indexOf(PREMATCH_ATTR_KEYS[n] as never)] || 10;
      const res = aiPrematch({
        flags: map.flags, lo: map.lo, hi: map.hi, masks: map.masks, masks2: map.masks2,
        players: sideG.map((g) => ({ slot: g.pslot, recId: g.src.id, condition: g.condition, b24: 0, attr: (n: number) => at(g.src, n),
          raw: { dm: g.src.pos[3], m: g.src.pos[4], am: g.src.pos[5], f: g.src.pos[6], right: g.src.side[2], left: g.src.side[0], central: g.src.side[1], freeRole: 1,
            jumping: at(g.src, 17), technique: at(g.src, 30), stamina: at(g.src, 26), workRate: at(g.src, 31) } })),
        manager: (() => { const g = ctx.managers?.[side]; if (!g) return null; const [attacking, directness, freeRoles, , offside, pressing, tactics] = g.tac;
          return { id: g.id, ca: g.ca, attacking, directness, freeRoles, offside, pressing, tactics }; })(), ownRep: ctx.rep?.[side] ?? 5000, oppRep: ctx.rep?.[1 - side] ?? 5000, b19: false, compType: ctx.compType ?? 0, homeTeam: side === 0,
      }, rand);
      for (const g of sideG) { g.instr = res.instr[g.pslot]; g.pos = res.masks[g.pslot]; g.posAttack = res.masks2[g.pslot]; }
      aiFlags[side] = res.teamFlags;
    }
  });
  const m: GridMatchState = {
    players: gp, gp, ballX: 4, ballY: 6, ballH: -1, ballSpeed: 0, ballDir: 0, lastTouch: 0, poss: 0, state: 8, shootout: 0, clock: 0, stoppage: 0, subTick: 0,
    paused: false, carrier: null, receiver: null, chaser: [null, null], keeperOut: [false, false], lineSide1: 11, lineSide0: 0, counterFlag: [false, false],
    // holdflaget +0x584 kopieres uændret ind ved kampstart (0x6db8a2): forudindstillingens ord med vores holdinstruktioner (tacticTable.ts)
    teamFlags: [aiFlags[0] ?? teamFlagsOf(home.tactic.team, maps[0].flags), aiFlags[1] ?? teamFlagsOf(away.tactic.team, maps[1].flags)],
    aiMode: [2, 2], touchCount: [0, 0], loftCountdown: 0, order: [], prio: null, linesmanMark: 0,
    tactics: [aiTactics[0] ?? home.tactic, aiTactics[1] ?? away.tactic], nations: [home.nation ?? 'England', away.nation ?? 'England'],
    stats: [emptyStats(), emptyStats()], goals: [0, 0], pendingPass: -1, period: 0, depth: 0, penaltyFor: null, ballEvent: 0, inc: null, knocks: 0, b8eb5: 0,
    passTo: null, landX: 0, landY: 0, fromX: 0, fromY: 0, margin: 0, lastPasser: null, lastPassType: 0, inFlight: [0, 0], lastToucher: null,
    official: ctx.official ? { discipline: ctx.official.discipline, b24: ctx.official.b24, b27: ctx.official.b27, b28: ctx.official.b28, mood: 0 }
      : { discipline: GRID_UNKNOWN.refDiscipline, b24: GRID_UNKNOWN.ref24, b27: GRID_UNKNOWN.ref27, b28: GRID_UNKNOWN.ref28, mood: 0 },
    official29: ctx.official?.b29 ?? GRID_UNKNOWN.official29,
    sideByte, periodEnd: 495, shootoutState: null, firstTime: 0, b1cd: 0, x4782: 0, x4786: 0, passRecv: null, passGiver: null, setPieceGoals: [[0, 0, 0], [0, 0, 0]], b1a9: [0, 0], goldenGoal: 0, b1a4: 0,
    cells: Array.from({ length: 9 * 12 * 2 }, () => [] as GP[]),
  };
  for (const p of gp) { p.skill = actionSkills(p); f32Fields(p); attachView(m, p); }
  // gittercellerne: spillerne på banen i holdenes rækkefølge (*estimeret* – init_match placerer dem med sub_6f46b0; låsetrinstesten indsætter
  // originalens lister)
  for (const p of gp) if (p.active && p.slot >= 0) cellAdd(m, p);
  const st = (s: Side) => m.stats[s];
  // originalens kommentarkø (sub_6d6f70, matchEvents.ts): trækker kampens tilfældige tal som originalen ved hvert kaldsted.
  // p1/p2 = spillerens indeks på holdet (MATCH_PLAYER+0x2e) – her rækkefølgen i gp pr. side (kun lighed bruges af køen).
  const idxOf = new Map<GP, number>();
  for (const s of [0, 1] as Side[]) gp.filter((q) => q.side === s).forEach((q, i) => idxOf.set(q, i));
  const shotMark = { minute: -1, side: 0 };                                                  // engine+0x8d4c/+0x8d4e (init_match 0x6b7fd1: −1/0)
  const events = new MatchEvents(rand, {
    get ballX() { return m.ballX; }, get ballY() { return m.ballY; }, get b8eab() { return m.lastTouch; }, get shootout() { return m.shootout; },
    get clock() { return m.clock; }, get periodEnd() { return m.periodEnd; }, get shotMinute() { return shotMark.minute; }, get shotSide() { return shotMark.side; },
  }, { lo: GRID_UNKNOWN.weatherWord & 0xff, hi: (GRID_UNKNOWN.weatherWord >> 8) & 0xff, pitch: GRID_UNKNOWN.byte1, gate: true });
  const comment = (id: number, p1?: GP | null, s1?: number, p2?: GP | null, s2?: number, x = 0) =>
    events.add(id, p1 ? idxOf.get(p1) ?? -1 : -1, s1 ?? (p1 ? p1.side : -1), p2 ? idxOf.get(p2) ?? -1 : -1, s2 ?? (p2 ? p2.side : -1), x);
  /** sub_6c54a0 0x6c587d–0x6c5953: TIME_ADDED_ON (0x21c1) én gang pr. halvleg, når minuttet ved dødbolden er 40–45 (pe 495) eller 85–90 (pe 990);
   *  p1 = boldbesiddelsen, extra = max(2, tillægstid/11) – mellem de to holds udskiftningsporte (0x6c581f/0x6c59c8) */
  const timeAdded = [false, false];                                                          // engine+0x8d48/+0x8d49
  let stoppageEntry = 0;
  /** post_period_end_events(side) 0x6be24e–0x6be419 (kun den sete kamp; kaldt for side 0 og 1 ved slutfløjt 0x6bdb29/0x6bdb32, før FINAL_WHISTLE;
   *  ingen tal): har siden ikke vundet (sub_6ce310: egne < modstandernes – ligakamp, ingen udebanemål), snit S af den viste karakter +0x1b over
   *  idx ≤ 10 og de indskiftede (+0x1f ≠ −1); side 0: S < 7 og (0,5·S − 2)·omdømme(ude) < omdømme(hjemme) → BOO_OFF_PITCH 0x2121(side 0);
   *  side 1: S < 6,67 og (0,5·S − 2)·omdømme(hjemme) < 0,8·omdømme(ude) → 0x2121(side 1). Vundet → SILENT_WON_MATCH 0x2120(side). Omdømmet =
   *  klub +0x80 (ctx.rep). Den viste karakter holdes af watchedStats (0x6b9ec2). */
  const postPeriod = (s: Side) => {
    if (!ctx.watched) return;
    const own = m.goals[s], opp = m.goals[other(s)];
    if (own > opp) { comment(0x2120, null, s, null, -1, 0); return; }                        // 0x6be289 → 0x6be3ff
    let sum = 0, n = 0;
    for (const q of gp) {
      if (q.side !== s) continue;
      const i = idxOf.get(q) ?? 0;
      if (i > 10 && (subs.state(q)?.minuteOn ?? -1) === -1) continue;                       // 0x6be2be–0x6be2c7
      sum += q.b1b; n++;
    }
    const S = n ? Math.fround(sum / n) : 0;
    const home = ctx.rep?.[0] ?? 5000, away = ctx.rep?.[1] ?? 5000;
    if (s === 0) { if (S < 7 && (S * 0.5 - 2) * away < home) comment(0x2121, null, 0, null, -1, 0); }   // 0x6be311–0x6be380
    else if (S < 6.67 && (S * 0.5 - 2) * home < away * 0.8) comment(0x2121, null, 1, null, -1, 0);       // 0x6be392–0x6be3f8
  };
  const timeAddedOn = () => {
    const mn = (Math.trunc(stoppageEntry / 11) << 24) >> 24, h2 = m.periodEnd === 990;
    if (!(m.periodEnd === 495 || h2) || timeAdded[h2 ? 1 : 0]) return;
    if (h2 ? !(mn > 0x54 && mn < 0x5b) : !(mn > 0x27 && mn < 0x2e)) return;
    events.add(0x21c1, m.poss, 0, 0, 0, Math.max(2, Math.trunc(((m.stoppage << 24) >> 24) / 11)));
    timeAdded[h2 ? 1 : 0] = true;
  };
  // udskiftningerne (matchSubs.ts – sub_6c54a0's genvalg, sub_6d0b60, sub_6cda20, menneskets kø); computeren vælger kun for ctx.ai-hold
  const isAi = (s: Side) => !ctx.ai || ctx.ai[s];
  /** sub_6d42a0(side) (0x6d42a0–0x6d431e): ikke i venskabskampe (fixture+0x3a 1/9); menneskets hold (sub_600a50): holdflaget 0x4000,
   *  computerens: tilstanden +0x1ab ∈ {3, 4} – boldholderens "hold på føringen" (0x7119d8) og clearingen fra egen tredjedel (0x711e21) */
  const protectLead = (s: Side): boolean => {
    const t = ctx.compType ?? 0;
    if (t === 1 || t === 9) return false;
    if (!isAi(s)) return (m.teamFlags[s] & 0x4000) !== 0;
    return m.aiMode[s] === 3 || m.aiMode[s] === 4;
  };
  const subs = makeMatchSubs({ m, gp, rand, ai: isAi, subs: ctx.subs ?? [3, 3], periodEnd: () => m.periodEnd, rep: [ctx.rep?.[0] ?? 5000, ctx.rep?.[1] ?? 5000], aiPick: aiPicks,
    compType: ctx.compType ?? 0, onSub: (a, b, auto) => { if (auto) subComment(a, b); on?.sub?.(a, b, auto); }, onCarriedOff: (p) => on?.carriedOff?.(p), refresh: (q) => recompute(q),
    cohesionOf: ctx.cohesionOf, captainIdx: ctx.captainIdx, leagueBranch: ctx.league !== false });
  /** sub_6e1090 0x6e1691–0x6e18be (sikker): efter genvalget, før omrokeringen – MAKING_CHANGES (> 2) / DOUBLE_SUBSTITUTION (2) / MAKING_CHANGE (1)
   *  for holdet (p1 −1), så pr. par SUBSTITUTION eller REPLACING_INJURED_PLAYER (den udskiftede har +0x22 = skadet ud > −1) med (ind, ud).
   *  Publikums buh/klapsalver (0x211d/0x211e med rand(+0x31)/rand(+0x33)/rand(30)) kræver engine+0x8ebb ≠ 0 – 0 i kampe uden tilskuer på
   *  skærmen (som oraklets). Antallet i omgangen = de nye på banen i samme minut, som ikke er meldt endnu (matchSubs kalder onSub pr. par). */
  const announced = new Set<GP>();
  const subComment = (inn: GP, out: GP) => {
    if (!announced.has(inn)) {
      const mn = subs.state(inn)?.minuteOn;
      const batch = gp.filter((q) => q.side === inn.side && !announced.has(q) && q.active && subs.state(q)?.minuteOn === mn);
      const n = batch.length;
      comment(n > 2 ? 0x1f59 : n === 2 ? 0x1f5c : 0x1f5a, null, inn.side, null, -1, 0);
      for (const q of batch) announced.add(q);
    }
    // 0x6e171e–0x6e1821 (kun den sete kamp, engine+0x8ebb): buh 0x211d til den udskiftede (rand(+0x31) < −10), ellers til den indskiftede –
    // side = modstandernes (sete); så klapsalver 0x211e til den udskiftede, når rand(trunc(karakter/30) + +0x33 − 0xe9) > rand(30), ellers til
    // den indskiftede ved rand(+0x33) > rand(30) – side = hans egen (p1 −1)
    if (ctx.watched) {
      if (randS(rand, out.w31) < -10) comment(0x211d, null, other(out.side), null, -1, 0);
      else if (randS(rand, inn.w31) < -10) comment(0x211d, null, other(inn.side), null, -1, 0);
      const a = randS(rand, Math.trunc(((out.rating << 16) >> 16) / 30) + out.w33 - 0xe9), b = rand(30);
      if (a > b) comment(0x211e, null, out.side, null, -1, 0);
      else { const c = randS(rand, inn.w33), e = rand(30); if (c > e) comment(0x211e, null, inn.side, null, -1, 0); }
    }
    const inj = (subs.state(out)?.minuteInjured ?? -1) > -1;
    comment(inj ? 0x20d7 : 0x1f5b, inn, inn.side, out, out.side, 0);
  };
  /** sub_6cda20: rødt kort (efter statistikken) */
  const sendOff = (p: GP) => subs.sendOff(p);
  /** sub_6eecb0(q, 0) efter en moralændring m.m.: handlingsevnerne, loftene 0x6ef5af–0x6ef840 (Flair-loftet bruger moralen) og til sidst
   *  rullene sub_6f44a0 (0x6f05b9 – trækker tal). Kampværdierne sub_6ec010 (0x6eecb9) regnes ikke igen her: limens udgave af sub_6ec010 er
   *  ikke fuldstændig (moralens led i kamp-CA'en 0x6ec890 m.fl.) – *afvigelse* */
  const recompute = (q: GP) => { matchValues(q); q.skill = actionSkills(q); q.cap = L.rollCaps(q); L.rollTick(q, rand); };
  /** sub_6eecb0's første kald 0x6eecb9: sub_6ec010 (matchValues.ts) med spillets data fra ctx.matchValuesEnv og motorens dynamiske felter */
  const matchValues = (q: GP) => {
    const base = ctx.matchValuesEnv?.(q);
    if (!base || !q.staffRaw) return;
    const rr = q.recRaw, st = q.staffRaw;
    const rec = (o: number) => (rr ? rr[o] : recByte(q, o));
    // taktikkens ord pr. plads: udskiftningernes pladstabel (også tomme pladser efter et rødt kort), ellers spilleren på pladsen
    const posOfSlot = (s: Side, j: number, att: boolean) => { const w = subs.slotWords(s, j); if (w) return att ? w.posAttack : w.pos; const o = gp.find((x) => x.side === s && x.slot === j); return o ? (att ? o.posAttack : o.pos) : 0; };
    const tac = (s: Side) => ({ prim: [...Array(11).keys()].map((j) => posOfSlot(s, j, false)), sec: [...Array(11).keys()].map((j) => posOfSlot(s, j, true)) });
    const env: MatchValuesEnv = { ...base, crowd: (sideByte[q.side] << 24) >> 24, cohesion: subs.cohesion[q.side], tactics: [tac(0), tac(1)] };
    const mv = {
      side: q.side, pos: q.slot >= 0 && q.slot <= 10 ? q.pos : 0, posAttack: q.slot >= 0 && q.slot <= 10 ? q.posAttack : 0, morale: q.morale, w31: q.w31, w33: q.w33,
      motivation: q.motivation, formRoll: q.formRoll ?? 0, badDay: q.badDay ?? 0, matchCA: q.matchCA, f: q.f,
      rec, recW: (o: number) => (rr ? ((rr[o] & 0xff) | (rr[o + 1] << 8)) << 16 >> 16 : (rec(o) & 0xff) | (rec(o + 1) << 8) << 16 >> 16), staff: (o: number) => st[o],
    };
    matchValues6ec010(mv, env, rand);
    q.matchCA = mv.matchCA;
    ctx.onMatchValues?.(q, env);
    for (const k of Object.keys(q.a) as (keyof GP['a'])[]) if (q.f[k] !== undefined) q.a[k] = q.f[k];   // loop.ts' kampfloats (samme felter)
  };
  /** menneskets taktikændring venter på dødbolden (applyTactic) */
  const pendingTactic: (Tactic | null)[] = [null, null];
  /** menneskets nye taktik midt i kampen (*estimeret* tidspunkt: ved dødbold, som originalens taktikskærm): positionstabellen (mapTactic →
   *  engine+0xf56e/+0xf572), pladsernes masker/instruktioner/taktikbyte og holdflagene +0x584 som ved kampstart (0x6db8a2); spillerne på banen
   *  får deres plads i den nye opstilling (uden for den: samme plads). 0x6eecb0(p, 0) for hver. */
  const applyTactic = () => {
    for (const s of [0, 1] as Side[]) {
      const t = pendingTactic[s]; if (!t) continue;
      pendingTactic[s] = null;
      const map = maps[s] = mapTactic(t.slots, t.formation);
      m.tactics[s] = t;
      m.teamFlags[s] = teamFlagsOf(t.team, map.flags);
      const on = gp.filter((q) => q.side === s && q.active && q.slot >= 0);
      const want = on.map((q) => { const i = t.lineup.indexOf(q.src.id); return i >= 0 && i < t.slots.length ? i : q.slot; });
      if (new Set(want).size !== want.length) continue;                                       // opstillingen passer ikke med banen
      on.forEach((q, n) => {
        const slot = want[n], ps0 = map.slotOf[slot] ?? slot, ts = t.slots[slot];
        q.slot = slot; q.pslot = ps0; q.tbl = map.table; q.pos = map.masks[ps0]; q.posAttack = map.masks2[ps0]; q.tacticByte = map.tb[ps0];
        q.instr = instrBig(instrOf(t.individual?.[slot], { lo: map.lo[ps0], hi: map.hi[ps0] }));
        q.isKeeper = q.pos === L.POS.keeper;
        let bx = clampX(Math.round((ts.y / 100) * 8)), by = Math.min(10, Math.round((ts.x / 100) * 11));
        if (q.isKeeper) { bx = 4; by = 0; }
        q.baseX = s === 1 ? 8 - bx : bx; q.baseY = by;
        q.form = Math.min(0, H.positionFit(q.pos, q.posAttack, q.posR, q.f.versatility, (Number(q.instr & 0xffffffffn) & 0x200000) !== 0));
        q.skill = actionSkills(q);
        const v = q.view as unknown as Record<string, unknown>;
        v.posFlags = q.pos; v.pos = q.pos; v.posAttack = q.posAttack; v.instr = { lo: Number(q.instr & 0xffffffffn), hi: Number(q.instr >> 32n) };
      });
    }
  };
  // afleveringen, opsnapningen, modtagelsen, landingen og blokeringen (pass.ts) – limens funktioner kaldes først, når kampen kører
  const P = makePass({
    m, rand, weather: GRID_UNKNOWN.weather, byte1: GRID_UNKNOWN.byte1,
    comment: (id, p1, s1, p2, s2, x) => comment(id, p1, s1, p2 ?? null, s2 ?? -1, x ?? 0),
    onBlock: ctx.onShot ? (q, S, d, soft, r) => ctx.onShot!('L', [q.side, q.pslot ?? q.slot, q.x, q.y, q.busy, q.roll.workRate, m.poss, m.ballH, m.lastTouch, S, d, soft ? 1 : 0, q.skill[0x24], r]) : undefined,
    takeBall: (p) => takeBall(p),
    challenge: (p, side, action) => challenge(p, side, action),
    knock: (A, codeA, B, codeB) => knockCheck(A, codeA, B, codeB, false),
    judge: (d, p, type, action) => judge(d, p, type, action),
    appeal: (d, boxSide, type, hurt, w31of) => appeal(d, boxSide, type, hurt, w31of),
    foul: (d, p, j, c, site) => foul(d, p, j, c as ChallengeOut, site ?? 'other'),
    handsFoul: (q, code, sev, b, flag, site) => handsFoul(q, code, sev, b, flag, site),
    refresh: (q) => recompute(q),
    landFoul: (X, Y, codeX, how, x, y, b16, alone) => landFoul(X, Y, codeX, how, x, y, b16, alone),
    sourceDuel: (p, V, duel) => sourceDuel(p, V, duel),
    gkCatch: (d, diff) => gkCatch(d, diff),
    praise: (d, p, code) => praise(d, p, code),
    ballOut: (last) => ballOut(last),
    // sub_70a910 / sub_70c040 (bolden mod mål fra en aflevering/løs bold – intoGoal.ts)
    intoGoal: (p, D, own) => ballIntoGoal(p, D, own),
    playerTurn: (p) => L.playerTurn(m, p, rand, hooks),
    facingGoal: (p) => GRID_UNKNOWN.facingGoal(m, p, rand),
    restart: (state, side, x, y) => restart(state, side, x, y),
    card: (p, code) => { if (code === 2) st(p.side).yellows++; else if (code >= 3 && code <= 6) { st(p.side).reds++; sendOff(p); } if (code >= 2 && code <= 6) on?.card?.(p, code); },
    teamFoul: (side) => { st(side).fouls++; },
    passStarted: (p) => { st(p.side).passes++; m.pendingPass = p.side; },
    // sub_600a50(spillerens klub +0xf9, 0, 1, 0, 0) (0x6fb306): klubben styres af et menneske (managerens stab-id blandt de 16 sidste; med arg2 = 1
    // uden ferie-/automatiktjekket 0x5fd6b0/0x5fd480) – ctx.humanClub, ellers menneskets hold (ctx.ai); uden begge *estimeret* nej
    nationOk: (p) => (ctx.humanClub ? ctx.humanClub[p.side] : ctx.ai ? !ctx.ai[p.side] : GRID_UNKNOWN.nationOk),
    advantagePending: () => advantagePending(m),
    queueIncident: (type, d, p, res, x, y, jC, jB) => queueIncident(type, d, p, res, x, y, jC, jB),
    dbg,
  });

  let secondKick: Side = 1;                                                                  // engine+0x8eb6: afsparket efter pausen
  let kickCommented = false;                                                                 // engine+0x1ca: afsparkets kommentar er sendt
  /** afspark (state 8) for `taking`: opstillingen sker ved næste tik i sub_6c54a0 → sub_6c51e0 (kickOffSetup) */
  const kickoffPositions = (taking: Side) => {
    kickCommented = false;                                                                   // engine+0x1ca = 0 (0x6b9780, 0x6bda3b, 0x6bdb3e, efter mål 0x708e73/0x70ba27/0x70ce20)
    m.ballX = 4; m.ballY = taking === 0 ? 5 : 6; m.state = 8; m.poss = taking; m.carrier = null; m.receiver = null;
    m.passTo = null; m.lastPasser = null; m.loftCountdown = 0;
  };
  /** sub_6f0630 (sikker): p tager bolden. Afleveren (+0xf576) på samme hold får karakter efter, hvor bolden blev modtaget; keeperen i eget
   *  felt (uden egen aflevering i luften – tilbagelægningsreglen) holder bolden med boldhøjde −1. Boldhøjden ændres ellers IKKE. */
  let lastOwner: Side | -1 = -1;                                                              // statistik: skift af boldbesiddelse
  const takeBall = (p: GP) => {
    dbg('take');
    if (lastOwner !== p.side) { dbg('turnover'); lastOwner = p.side; }
    if (m.pendingPass !== -1) { dbg(m.pendingPass === p.side ? 'pass:mate' : 'pass:opp'); if (m.pendingPass === p.side) st(p.side).passesCompleted++; m.pendingPass = -1; }
    const c = m.carrier as GP | null;
    if (c) { m.x4786 = 0; m.poss = -1; m.carrier = null; c.w29 = 0; c.momentum = 0; }   // 0x6f0654: x4786 = 0 (kun med boldholder)
    m.x4786 = 0;                                                                              // 0x6f06b4
    const lp = m.lastPasser;
    // assisten (*estimeret* – originalens +0x478a er ikke afkodet): den medspiller, der sidst afleverede til ham
    p.giver = lp && lp.side === p.side ? lp as GP : null;
    if (lp && lp.side === p.side) {
      lp.c02 = (lp.c02 + 1) & 0xff;                                                           // 0x6f06dc: +0x2 afleveringer, der nåede en medspiller
      if (p.pos === L.POS.keeper) lp.rating += 0x6c;
      else if (p.side === 1 ? p.y >= 6 : p.y < 6) lp.rating += 0x60;                          // modtaget i egen halvdel
      else if (p.side === 1 ? p.y < 3 : p.y > 8) lp.rating += 0x96;                           // i den sidste tredjedel
      else lp.rating += 0x78;
      m.x4782 += 0xf0;                                                                        // 0x6f077e–0x6f078a
      m.passRecv = p; m.passGiver = lp as GP;                                                 // 0x6f079c/0x6f07a2
    }
    m.lastPasser = null; m.receiver = null; m.passTo = null;
    m.firstTime = 0; m.b1cd = 0; m.b1a4 = 0;                                                  // 0x6f0690/0x6f069c/0x6f06a8: engine+0x1a4, +0x1a7, +0x1cd = 0
    if (p.pos === L.POS.keeper && inBoxAt(p.side, p.x, p.y) && m.inFlight[p.side] === 0) { p.facing = p.side === 0 ? 0 : 180; m.ballH = -1; }
    m.inFlight[p.side] = 1; m.inFlight[other(p.side)] = 0;
    if (p.side === 1 ? p.y >= 6 : p.y < 6) m.ballEvent = 0;                                  // 0x6f086c: taget på egen halvdel
    m.ballX = p.x; m.ballY = p.y; m.poss = p.side; m.carrier = p; m.ballDir = p.facing; m.ballSpeed = 0;
    if (m.lastTouch !== p.side) m.x4782 = 0;                                                  // 0x6f0904–0x6f090e: før +0x8eab sættes
    m.lastTouch = p.side; m.touchCount[p.side]++; if (m.touchCount[other(p.side)] > 0) m.touchCount[other(p.side)] -= 10;
    p.w29 = 0; p.momentum = 0;
  };
  const restart = (state: number, side: Side, x: number, y: number) => {
    if (m.pendingPass !== -1) { dbg('pass:dead' + state); m.pendingPass = -1; }
    m.state = state; m.poss = side; m.carrier = null; m.receiver = null; m.passTo = null; m.ballX = clampX(x); m.ballY = clampY(y); m.ballH = -1; m.ballSpeed = 0;
  };

  // ---------------------------------------------------------------- dødboldens opstilling (sub_6c54a0's dispatch 0x6c68e5, tabel 0x6c6a08)
  /** sub_6f0970 (sikker): boldholderen slipper bolden – besiddelse −1, ingen boldholder, hans +0x29 og momentum 0 */
  const release = () => { const c = m.carrier as GP | null; m.x4786 = 0; m.poss = -1; m.carrier = null; m.firstTime = 0; if (c) { c.w29 = 0; c.momentum = 0; } };   // 0x6f099d: +0x1a7 = 0
  /** sub_6f46b0 med cellebyten fra positionstabellen (lav nibble x, høj y): taktikken +0xf56e/+0xf572 + 216·plads + 108·att + 12·bx + by.
   *  Side 1's tabel ligger spejlet i hukommelsen (absolutte felter) – tableCell giver det samme. */
  const cellOf = (p: GP, att: 0 | 1, bx: number, by: number): [number, number] => (p.tbl ? tableCell(p.tbl, p.side, p.pslot, att, bx, by) : [p.x, p.y]);
  const put = (p: GP, x: number, y: number) => setPos(m, p, x, y);
  /** fælles for målspark og frispark (0x6c4f80–0x6c4fcb, 0x6c494c–0x6c4999, 0x6c4dd7–0x6c4e1c): offsidelinjerne regnes igen efter hver
   *  placering; står en spiller fra holdet med bolden offside (eller er boldholderen), sættes han onside (sub_6f5b80(p, 1)); busy = 0 (sub_7160e0) */
  const settle = (p: GP, att: boolean) => {
    L.offsideLines(m);
    if (att && (p === m.carrier || L.beyondLine(m, p.side, p.y) >= 0)) backOnside(p, true);
    p.busy = 0;
  };
  /** sub_6f5b80(p, teleport) (sikker): ét felt tilbage mod eget mål – med teleport lige bag modstandernes linje (side 0: +0x8eaf − 1,
   *  side 1: +0x8eb0 + 1), ellers et skridt med sub_6f09f0(x, y ∓ 1, −1) */
  const backOnside = (p: GP, teleport: boolean) => {
    if (teleport) { put(p, p.x, p.side === 1 ? m.lineSide0 + 1 : m.lineSide1 - 1); return; }
    offBallMove(p, p.x, p.side === 1 ? (p.y < 11 ? p.y + 1 : p.y) : (p.y > 0 ? p.y - 1 : p.y), -1);
  };
  const r2 = () => { const a = rand(2); return 4 - a + rand(2); };                           // 4 − rand(2) + rand(2) (bl = 4; sub; add)
  /** sub_716270 (holdet med bolden ved hjørne/farligt frispark): instruktion 0x20000 → 1 (frem), ellers markspiller med 0x40000000 → 2 (bliv) */
  const roleAtt = (p: GP) => { const lo = Number(p.instr & 0xffffffffn); return lo & 0x20000 ? 1 : p.pos !== L.POS.keeper && lo & 0x40000000 ? 2 : 0; };
  /** sub_716310 (forsvarerne): markspiller med 0x80000000 → 3 (bliv fremme), med 0x80000 → 4 (på stregen) */
  const roleDef = (p: GP) => { if (p.pos === L.POS.keeper) return 0; const lo = Number(p.instr & 0xffffffffn); return lo & 0x80000000 ? 3 : lo & 0x80000 ? 4 : 0; };
  const fatal = (x: number, y: number) => x < 0 || x >= 9 || y < 0 || y >= 12;                // fejlloggen 0x6c473b / 0x6c4e4c (spillet stopper)
  /** sub_6c4290 (sikker): indkast – bolden klemmes ind på banen, kasteren vælges (sub_6ceb90(poss, 2)) FØR opstillingen, alle står i
   *  positionstabellens felt for boldens felt (att = holdet med bolden), kasteren på bolden: momentum 200, retning 270 (x ≠ 0) / 90 */
  const throwInSetup = () => {
    const t = m.poss as Side;
    m.ballX = clampX(m.ballX); m.ballY = clampY(m.ballY);
    const taker = GRID_UNKNOWN.pickTaker(m, t, 2, rand);
    for (const s of [0, 1] as Side[]) for (const p of gp) if (p.side === s && p.active) { const [x, y] = cellOf(p, t === s ? 1 : 0, m.ballX, m.ballY); put(p, x, y); p.busy = 0; }
    if (!taker) return;
    put(taker, m.ballX, m.ballY); takeBall(taker); taker.momentum = 200; taker.facing = m.ballX !== 0 ? 270 : 90;
  };
  /** sub_6c4470 (sikker): hjørnespark – boldhændelse 3, besiddelse −1; forsvarets/angrebets roller (sub_716270/sub_716310) sender spillerne
   *  i feltet (y 0–1 / 10–11), til midten (5/6) eller i tabelfeltet for bolden i målfeltet (4, 0)/(4, 11); så sparkeren (sub_6ceb90(t, 3))
   *  i hjørnet x = 0, når bolden røg ud til højre for 4 − rand(2), ellers 8 (sic, 0x6c4711/0x6c47d0), momentum 200; kun side 0 får
   *  retningen 90 (x ≠ 0) / 270 (0x6c47ef). */
  const cornerSetup = () => {
    const t = m.poss as Side;
    m.ballEvent = 3; m.poss = -1;
    for (const s of [0, 1] as Side[]) {
      const att = t === s ? 1 : 0;
      for (const p of gp) {
        if (p.side !== s || !p.active) continue;
        let x: number, y: number;
        const nearY0 = () => { x = r2(); y = rand(2); }, nearY11 = () => { x = r2(); y = 11 - rand(2); };
        if (s === 1) {
          if (t === 1) { const r = roleAtt(p); if (r === 1) nearY0(); else if (r === 2) { x = r2(); y = 6; } else [x, y] = cellOf(p, att, 4, 0); }
          else { const r = roleDef(p); if (r === 3) { x = r2(); y = 6; } else if (r === 4) nearY11(); else [x, y] = cellOf(p, att, 4, 11); }
        } else if (t === 0) { const r = roleAtt(p); if (r === 1) nearY11(); else if (r === 2) { x = r2(); y = 5; } else [x, y] = cellOf(p, att, 4, 11); }
        else { const r = roleDef(p); if (r === 3) { x = r2(); y = 5; } else if (r === 4) nearY0(); else [x, y] = cellOf(p, att, 4, 0); }
        if (fatal(x!, y!)) continue;
        put(p, x!, y!); p.busy = 0;
      }
    }
    const taker = GRID_UNKNOWN.pickTaker(m, t, 3, rand);
    const r = rand(2);
    if (!taker) return;
    put(taker, m.ballX > 4 - r ? 0 : 8, t === 1 ? 0 : 11); takeBall(taker); taker.momentum = 200;
    if (t === 0) taker.facing = m.ballX !== 0 ? 90 : 270;
  };
  /** sub_6c4ec0 (sikker): målspark – bolden i (4, 0)/(4, 11), alle (begge hold, att = 1) i tabelfeltet for bolden i (4, 6) (+0xa2), holdet
   *  med bolden sat onside; målmanden (sub_6ce110) på bolden med boldhøjde 0 → take_ball (i eget felt: −1), momentum 200, retning 180/0 */
  const goalKickSetup = () => {
    const t = m.poss as Side;
    m.ballX = 4; m.ballY = t === 1 ? 11 : 0;
    const k = hooks.ownKeeper(t) as GP | null;
    if (m.carrier) release();
    for (const s of [0, 1] as Side[]) for (const p of gp) {
      if (p.side !== s || !p.active) continue;
      const [x, y] = cellOf(p, 1, 4, 6); put(p, x, y); settle(p, t === s);
    }
    if (!k) return;
    m.ballH = 0; put(k, m.ballX, m.ballY); takeBall(k); k.momentum = 200; k.facing = m.ballY !== 0 ? 180 : 0;
  };
  /** sub_6c50d0 (sikker): straffe – skytten (sub_6ceb90(t, 5)) tager bolden på pletten (4, 10)/(4, 1); for hver plads side 0 så side 1:
   *  målmanden på stregen (4, 0)/(4, 11), andre ud af feltets rækker (y < 2 → 2, y > 9 → 9); busy = 0 for alle */
  const penaltySetup = () => {
    const t = m.poss as Side;
    const taker = GRID_UNKNOWN.pickTaker(m, t, 5, rand);
    if (taker) takeBall(taker);
    m.ballX = 4; m.ballY = t === 0 ? 10 : 1;
    if (taker) put(taker, 4, m.ballY);
    const ks = [hooks.ownKeeper(0), hooks.ownKeeper(1)];
    const sideList = (s: Side) => gp.filter((q) => q.side === s);
    const a = sideList(0), b = sideList(1);
    for (let i = 0; i < Math.max(a.length, b.length); i++) for (const p of [a[i], b[i]]) {
      if (!p) continue;
      if (p.active && p !== taker) {
        if (p === ks[p.side]) put(p, 4, p.side === 0 ? 0 : 11);
        else if (p.y < 2) put(p, p.x, 2);
        else if (p.y > 9) put(p, p.x, 9);
      }
      p.busy = 0;
    }
  };
  /** sub_6c4820 (sikker): frispark (state 6/7). Dybt på egen halvdel (side 0: y < 3, side 1: y > 8): som målsparket alle i tabelfeltet for
   *  (4, 6) (att = 1). Ellers klemmes bolden, og hændelsen bliver 7 (side 0 y > 6 / side 1 y < 5: tabelfeltet for (4 ± rand, y ± 4)) eller −1
   *  (y ± 3); ved 7 sender rollerne (sub_716270/sub_716310) spillerne i feltet/midten som ved hjørnet. Skytten (sub_6ceb90(t, state)) på
   *  bolden med boldhøjde 0, take_ball, vendt mod (4, 10)/(4, 1), momentum 200. */
  const freeKickSetup = () => {
    const t = m.poss as Side;
    m.poss = -1;
    if (m.carrier) release();
    if ((t === 0 && m.ballY < 3) || (t === 1 && m.ballY > 8)) {
      for (const s of [0, 1] as Side[]) for (const p of gp) { if (p.side !== s || !p.active) continue; const [x, y] = cellOf(p, 1, 4, 6); put(p, x, y); settle(p, t === s); }
    } else {
      m.ballY = clampY(m.ballY); m.ballX = clampX(m.ballX);
      let fy: number;
      if (t === 0) { m.ballEvent = m.ballY > 6 ? 7 : -1; }
      else { m.ballEvent = m.ballY < 5 ? 7 : -1; }
      const fx = r2();
      fy = t === 0 ? m.ballY + (m.ballEvent === 7 ? 4 : 3) : m.ballY - (m.ballEvent === 7 ? 4 : 3);
      fy = clampY(fy);
      for (const s of [0, 1] as Side[]) {
        const att = t === s ? 1 : 0;
        for (const p of gp) {
          if (p.side !== s || !p.active) continue;
          let x: number, y: number;
          const tab = () => { [x, y] = cellOf(p, att, fx, fy); };
          const nearY0 = () => { const a = rand(2); x = fx - a + rand(2); y = rand(2); }, nearY11 = () => { const a = rand(2); x = fx - a + rand(2); y = 11 - rand(2); };
          if (m.ballEvent <= 0) tab();
          else if (s === 1) {
            if (t === 1) { const r = roleAtt(p); if (r === 1) nearY0(); else if (r === 2) { x = r2(); y = 6; } else tab(); }
            else { const r = roleDef(p); if (r === 3) { x = r2(); y = 6; } else if (r === 4) nearY11(); else tab(); }
          } else if (t === 0) { const r = roleAtt(p); if (r === 1) nearY11(); else if (r === 2) { x = r2(); y = 5; } else tab(); }
          else { const r = roleDef(p); if (r === 3) { x = r2(); y = 5; } else if (r === 4) nearY0(); else tab(); }
          if (fatal(x!, y!)) continue;
          put(p, x!, y!); settle(p, att === 1);
        }
      }
    }
    const taker = GRID_UNKNOWN.pickTaker(m, t, m.state, rand);
    if (!taker) return;
    m.ballH = 0; put(taker, m.ballX, m.ballY); takeBall(taker);
    P.turnTo(taker, m.ballX, m.ballY, 4, t === 0 ? 10 : 1); taker.momentum = 200;
  };
  /** sub_6c51e0 (sikker): afspark – besiddelse −1, bolden i (4, 5)/(4, 6); alle i tabelfeltet for bolden i (4, 2) (side 0, +0x9e) /
   *  (4, 10) (side 1, +0xa6, sic – ikke spejlet), side 0 højst række 5, side 1 mindst 6, vendt mod (4, y + 3)/(4, y − 3) (sub_6f4920);
   *  sparkeren = den af holdets spillere, der står nærmest bolden (først i rækkefølgen ved lighed) – han flyttes IKKE, take_ball lægger
   *  bolden hos ham; retningen er den laveste byte af 0xb67c30-retningen mod (4, 11)/(4, 0) med fortegn (movsx dx, al – sic) regnet fra
   *  den SIDST placerede spillers felt ([esp+0x1c]/bl fra løkken, sic – bekræftet i kampsporet: 364/364 afspark). */
  const kickOffSetup = () => {
    const pm = m.poss;
    const t: Side = pm === 0 || pm === 1 ? pm : 0;
    m.poss = -1; m.ballX = 4; m.ballY = t === 0 ? 5 : 6;
    let lx = 0, ly = 0;
    for (const s of [0, 1] as Side[]) for (const p of gp) {
      if (p.side !== s || !p.active) continue;
      let [x, y] = cellOf(p, 1, 4, s === 1 ? 10 : 2);
      if (s === 1 && y < 6) y = 6; else if (s === 0 && y >= 6) y = 5;
      put(p, x, y); lx = x; ly = y;
      P.turnTo(p, x, y, 4, s === 0 ? (y < 9 ? y + 3 : 11) : y > 3 ? y - 3 : 0);
    }
    let best = Math.fround(10000), taker: GP | null = null;
    for (const p of gp) {
      if (p.side !== t || !p.active || p.slot > 10) continue;
      const d = Math.fround(L.dist(p.x, p.y, m.ballX, m.ballY));
      if (d < best) { best = d; taker = p; }
    }
    if (!taker) return;
    takeBall(taker);
    const dx = 4 - lx, dy = (t === 0 ? 11 : 0) - ly;
    const dir = dx === 0 && dy === 0 ? m.ballDir : H.bearing(dx, dy);
    taker.facing = ((dir & 0xff) << 24) >> 24;
  };
  /** sub_6c54a0 (ved hver dødbold, 0x6c54a0–0x6c5555 og dispatch 0x6c68d6): flyvetiden, modtagerne, boldfart og -højde (0), afleveren,
   *  passPower, prioriteten og hændelsen nulstilles; under pause intet andet; så computerens tilstand/taktik (aiRetune) og opstillingen
   *  efter state: 2 indkast, 3 hjørne, 4 målspark, 5 straffe, 6/7 frispark, 8 afspark (1: ingen). */
  const restartTick = () => {
    m.loftCountdown = 0; m.x4782 = 0; m.x4786 = 0; m.passRecv = null; m.passGiver = null;   // 0x6c54b1/0x6c54b7/0x6c54cf/0x6c54d5
    m.passTo = null; m.ballSpeed = 0; m.ballH = 0; m.lastPasser = null; m.receiver = null; m.margin = 0; m.prio = null; m.inc = null;
    m.b1cd = 0;                                                                                // 0x6c54fc
    if (m.paused) return;
    const entry = m.clock;                                                                     // [esp+0x24]: minuttet før tidsspildet (0x6c55b5)
    subs.apply(); applyTactic();                                                               // menneskets ventende udskiftninger/taktik (*estimeret* her)
    // 0x6c55ce–0x6c568d: efter minut 60 ved rand(6) = 0 "knackered" (0x21cf) om den første (side 0 før 1, indeks 0–19) på banen med
    // kondition < 6750 (0x96d30c) uden arbejdsrul (+0x10d) – højst én
    if (((Math.trunc(entry / 11) << 24) >> 24) > 60 && rand(6) === 0) {
      knack: for (const s of [0, 1] as Side[]) for (const q of gp) if (q.side === s && q.slot >= 0 && q.condition < 6750 && !q.roll.workRate) { comment(0x21cf, q, q.side); break knack; }
    }
    aiRetune();
    stoppageEntry = entry; subs.gate(entry, timeAddedOn);
    aiRetuneFlags();                                                             // 0x6c581f/0x6c59c8: computerens udskiftninger (tillægstiden 0x6c5884 imellem)
    switch (m.state) {
      case 2: throwInSetup(); break;
      case 3: cornerSetup(); break;
      case 4: goalKickSetup(); break;
      case 5: penaltySetup(); break;
      case 6: case 7: freeKickSetup(); break;
      case 8: kickOffSetup(); break;
    }
  };

  // sub_6c2be0 efterfulgt af sub_715f50 (søjledrift), som alle originalens kaldere gør
  const cellWithDrift = (p: GP): [number, number] => {
    const [x, y] = GRID_UNKNOWN.tacticalCell(m, p);
    // sub_715f50 læser spillerens aktuelle positionsrul +0x10a og positionsord – visningen (p.view) opdateres ellers kun af sync() før
    // boldholderens valg, så den kunne være et tik gammel
    if (p.view) { p.view.rolls.b10a = p.roll.positioning; p.view.pos = p.pos; p.view.posFlags = p.pos; p.view.side = p.side; }
    return [p.view ? H.tacticalColumn(p.view, x, p.posR, undefined, rand) : x, y];
  };

  /** sub_6f4aa0 (hvert tik for alle med plads ≥ 0, 0x6b9fec/0x6ba00e; oversat instruktion for instruktion 11/11): busy tælles ned (negativ → 0),
   *  agitationen ×0,85 (float32) mod gulvet 2·(25 − Temperament) og loftet 100, og karakteren +0x35 vedligeholdes efter kampens tællere og
   *  positionen (sub_6c38c0): keeper (redninger +0xf, modstandernes skud på mål +0xf5bf, indskiftet efter 30 min +0x1f), libero, forsvarer
   *  (tacklinger/hovedstød), DM, M, AM, F. Før tallede porten kun busy og agitationen – karakterens rand(1500)/rand(75)/… manglede. */
  const upkeep = (p: GP) => {
    if (p.busy > 0) p.busy--; else if (p.busy < 0) p.busy = 0;                                 // 0x6f4aa8–0x6f4ab8
    L.agitationDecay(p);                                                                        // 0x6f4abc–0x6f4b0e
    const u = (v: number) => v & 0xff;
    const b1 = u(p.c01), b2 = u(p.c02), b3 = u(p.assists), b4 = u(p.tacklesTried), b5 = u(p.tacklesWon), b6 = u(p.b6), b7 = u(p.b7), b8 = u(p.b8), b9 = u(p.b9);
    const b0b = u(p.shotsOnTarget), b0c = u(p.goals), b0f = u(p.b0f), b10 = u(p.penGoalsWon), b11 = u(p.dribblesPast);
    const s16 = (v: number) => (v << 16) >> 16;
    let w = s16(p.rating);
    const done = () => { p.rating = s16(w); };
    if (b10 + b0c < 2 && b6 < 7 && b3 < 4 && b11 < 6) {                                        // 0x6f4b18–0x6f4b74
      const r = rand(1500) + 0x203a;
      if (w > r) w = s16(H.ftol((w - 8250) * 0.96 + 8250));
    }
    if (b1 > 0x32) {                                                                            // 0x6f4b78–0x6f4bf5
      const v = 20 * (b1 + 20 * b3 + 0x113);
      if (v > w) w = s16(v);
      if (b2 !== 0) { const q = b1 / b2; if (q > 0.75 && q * 1000 + 5850 > w) w = s16(w + 5); }
    }
    if (b10 !== 0) w = s16(Math.max(425 * b10 + 6000, w));                                     // 0x6f4bfd–0x6f4c27
    if (b0c !== 0 && b0c + b10 > 1) w = s16(Math.max(375 * (b0c + b10) + 6500, w));           // 0x6f4c2b–0x6f4c5e
    const pos = p.pos, opp = other(p.side), conceded = m.goals[opp] & 0xff, cs = (conceded << 24) >> 24;
    const quiet = (withC: boolean) => b6 === 0 && b9 === 0 && b3 === 0 && b10 === 0 && (!withC || b0c === 0);
    const incTo = (lim: number) => { if (w < lim) w = s16(w + 1); };                           // 0x6f53e5: jge → ingen; inc
    if (pos & 1) {                                                                              // keeper 0x6f4c7e
      if (rand(b0f * b0f) === 0 && w < 0x1cb6) w++;
      const on = (subs.state(p)?.minuteOn ?? -1) & 0xff, on8 = (on << 24) >> 24;
      if (on !== 0xff && on8 > 0x1e) { if (b0f === 0) incTo(0x1b58); return done(); }        // 0x6f4ca4–0x6f4cc2
      const sot = teamBlk[opp][3] & 0xff;
      w = s16(Math.min((sot + 14) * 500, w));                                                   // 0x6f4ce5–0x6f4cff
      if (b0f === 0) {
        w = s16(Math.max(300 * (sot + 20), w));                                                 // 0x6f4d07–0x6f4d23
        incTo((Math.min(sot, 2) + 28) * 250);                                                   // 0x6f4d27–0x6f4d5a
        return done();
      }
      if (w <= 0x109a) return done();                                                           // 0x6f4d5f
      if (b0f > 1 && rand(b0f) !== 0) {                                                         // 0x6f4d69–0x6f4d7f
        if (b0f > 2 && w > 0x1e46) { w = 0x1e46; return done(); }
        if (w > 0x222e) { w = s16(w - 25); return done(); }
        if (w > 0x1c52) { w = s16(w - b0f); return done(); }
        w = s16(w - 1); return done();                                                          // 0x6f51ed
      }
      if (w <= (sot + 25) * 250) return done();                                                 // 0x6f4dcc–0x6f4dfb
      if (rand(90 - Math.trunc(((m.clock << 16) >> 16) / 11)) === 0) w = s16(w - 1);            // 0x6f4e01–0x6f4e30
      return done();
    }
    if (pos & 2) {                                                                              // libero 0x6f4e53
      if (rand(75) === 0) w = s16(w - 1);
      if (b6 === 0 && b9 === 0 && b3 === 0 && b10 === 0 && w > 7500) w = s16(w - 10);
      if (conceded !== 0) return done();
      incTo(0x1676); return done();                                                             // 0x6f4ebb
    }
    if (pos & 4) {                                                                              // forsvarer 0x6f4ee4
      if (rand(75) === 0) w = s16(w - 1);
      const n = b4 + b7;
      if (n > 9) {
        let f = Math.fround((b5 + b8) / n);
        const sb = b9 + b6;
        if (sb !== 0) f = Math.fround(sb * 0.025 + f);
        const wide = (pos & 0x880) !== 0;
        if (b4 > 4) { const g = b5 / b4; if (g < 0.65) f = Math.fround(f - (Math.fround(g) - 0.65) * (wide ? 0.2 : 0.25)); }
        if (b7 > 4) { const g = b8 / b7; if (g < 0.65) f = Math.fround(f - (Math.fround(g) - 0.65) * (wide ? 0.1 : 0.25)); }
        let c = s16((29 - cs) * 250);
        if (b0c) c = s16(c + b0c * 500);
        if (b10) c = s16(c + b10 * 250);
        if (f < 0.625) { if (w > c) w = c; }                                                    // 0x6f5083–0x6f509a
        else if (f > 0.825) { if (w < c) w = c; }                                               // 0x6f509c–0x6f50b3
      }
      if (b6 === 0 && b9 === 0 && b3 === 0 && b10 === 0 && w > 7500) w = s16(w - 10);           // 0x6f50b7–0x6f50e0
      if (conceded === 0) {                                                                     // 0x6f5101
        if (quiet(true)) {
          if (b2 <= 0x14 || !(b1 / b2 > 0.75)) { incTo(0x1676); return done(); }               // 0x6f5127–0x6f515b → 0x6f4ebb/0x6f4ebf
          if (w >= 0x1676) incTo(0x1a5e); else w = s16(w + 5);                                  // 0x6f5161–0x6f516b
          return done();
        }
        if (w >= 0x1676) incTo(0x1a5e); else w = s16(w + 5);                                    // 0x6f5179
        return done();
      }
      if (cs === 1) {                                                                           // 0x6f51a7
        if (quiet(true)) { if (w > 0x1c52) w = s16(w - 1); return done(); }
        incTo(0x186a); return done();                                                           // 0x6f53af
      }
      const lim = Math.max(s16((31 - cs) * 250), 0x1a5e);                                       // 0x6f520b–0x6f5222
      if (w <= lim) return done();
      if (pos & 0x880) { if (!quiet(true)) w = s16(w - 1); else w = s16(w - cs); return done(); }   // 0x6f524c–0x6f52b3
      if (!quiet(true)) w = s16(w - cs); else w = s16(w - 5 * cs);                              // 0x6f52bd–0x6f530c
      return done();
    }
    if (pos & 8) {                                                                              // DM 0x6f5332
      if (rand(500) === 0) w = s16(w - 1);
      if (b6 === 0 && b9 === 0 && b3 === 0 && w > 7500) w = s16(w - 10);
      if (conceded !== 0) return done();
      if (quiet(false)) { incTo(0x186a); return done(); }                                       // 0x6f53af
      if (w >= 0x1676) incTo(0x1a5e); else w = s16(w + 5);                                      // 0x6f53c9
      return done();
    }
    if (pos & 0x10) {                                                                           // M 0x6f540f
      if (rand(1000) === 0) w = s16(w - 1);
      if (b0c !== 0 || b10 !== 0) return done();
      if (b3 !== 0 || b0b !== 0) { if (w > 0x1c52) w = s16(w - 5); return done(); }             // 0x6f549e
      if (w > 0x1c52) w = s16(w - 10); return done();                                           // 0x6f554d
    }
    if (pos & 0x20) {                                                                           // AM 0x6f5469
      if (rand(500) === 0) w = s16(w - 1);
      if (b0c === 0) {
        if (b10 !== 0) return done();
        if (b3 !== 0 || b0b !== 0) { if (w > 0x1c52) w = s16(w - 5); return done(); }
        if (w > 0x1c52) w = s16(w - 10); return done();
      }
      if (w < b0c * 500 + 0x1a5e) w = s16(w + 5 * b0c);                                         // 0x6f54c2–0x6f54ef
      return done();
    }
    if (pos & 0x40) {                                                                           // F 0x6f5515
      if (rand(150) === 0) w = s16(w - 1);
      if (b0c === 0) {
        if (b10 !== 0 || b0b !== 0) return done();
        if (b3 !== 0 || b9 !== 0) { if (w > 0x1e46) w = s16(w - 5); return done(); }            // 0x6f5565
        if (w > 0x1c52) w = s16(w - 10); return done();
      }
      if (w < b0c * 500 + 0x1a5e) w = s16(w + 5 * b0c);                                         // 0x6f5581–0x6f55a9
    }
    done();
  };

  const hooks: L.Hooks = {
    upkeep: (p) => upkeep(p as GP),
    ballCarrier: (p) => carrierTurn(p as GP),
    moveTo: (p0, x, y, flags) => offBallMove(p0 as GP, clampX(x), clampY(y), flags),
    place: (p, x, y) => setPos(m, p as GP, clampX(x), clampY(y)),
    tacticalCell: (p) => cellWithDrift(p as GP),
    formationCell: (p) => GRID_UNKNOWN.formationCell(m, p as GP),
    runTarget: (p, mode) => GRID_UNKNOWN.runTarget(m, p as GP, mode, GRID_UNKNOWN.formationCell(m, p as GP), rand),
    zonalPick: (p) => { const r = GRID_UNKNOWN.zonalPick(m, p as GP, rand); ctx.onZonal?.(p as GP, r as GP | null); return r; },
    manMarkTarget: (p) => L.manMarkTarget(m, p),                                             // sub_7160f0 (sikker); vores Tactic sætter ikke bit 4
    backOnside: (p) => backOnside(p as GP, false),                                            // sub_6f5b80(p, 0): et skridt (0x71496c, 0x7158e0)
    takeBall: (p) => takeBall(p as GP),
    turn: (p, x, y) => P.turnTo(p as GP, p.x, p.y, x, y),                                    // sub_6f4920 (sikker)
    canFollow: (mk, x, y) => L.canFollow(m, mk, x, y),                                      // sub_6bce20 (sikker)
    // sub_6cb700(y, side, 1) (0x6cb700–0x6cb76a): sidens spillere med plads ≥ 0 længere fremme end y – boldholderen tælles ikke med (flaget)
    teammatesAhead: (p) => gp.filter((o) => o.slot >= 0 && o.side === p.side && o !== m.carrier && (p.side === 0 ? o.y > p.y : o.y < p.y)).length,
    nearestOppDist: (side, x, y) => H.nearestOpponent(gp.filter((o) => o.side !== side).map((o) => o.view!), x, y, true),
    ownKeeper: (side) => gp.find((o) => o.active && o.side === side && o.pos === L.POS.keeper) ?? null,
    restartTick: () => restartTick(),                                                          // sub_6c54a0 (nulstilling, computerens taktik, opstillingen)
    incidentTick: () => incidentTick(),
    deadBallTemper: () => deadBallTemper(),
    treatInjured: () => subs.treat(),                                                          // sub_6d0b60 (matchSubs.ts)
    pickTaker: (side, state) => GRID_UNKNOWN.pickTaker(m, side, state, rand),
    periodCheck: () => {
      // sub_6bd930 (sikker for tid og afspark): intet under et ventende straffespark (state 5); pausen når uret er FORBI 495 + tillægstid:
      // uret sættes til 495, tillægstiden 0, afspark (state 8) til +0x8eb6, som så skifter, og tikket slutter (returværdi 1 → 0x6b98c0
      // returnerer 4). sub_6f5810(0) – pausens restitution for alle – er ikke porteret (*estimeret*: ingen). Slut når uret er forbi 990 + tillægstid.
      // Forlænget spilletid (0x6bda68–0x6be118): ved 990 + tillægstid med en vinder påkrævet (fixture+0x38 & 2 og uafgjort/samlet lige –
      // her ctx.needsWinner) sættes uret til 990, +0x8ed4 = 1155, afspark til +0x8eb6 (skifter) og 0x6bd930 giver 2; ved 1155 + tillægstid
      // det samme med 1320 (giver 3); ved 1320 + tillægstid slut, og stadig lige (& 1) → straffe (+0x8eb3 = 4). Uden forlænget: & 1 giver
      // straffe straks efter 90 (0x6bdaf7) – ctx har ikke flaget, så kun forlænget + straffe (*estimeret* for turneringer uden & 2).
      // Golden goal (+0x1a8, 0x6bdfed) er ikke med. 2/3/4 afslutter tikket (sub_6b98c0 returnerer 4 ved 1–3, 0x6bab7c).
      if (m.state === 5) return 0;
      const pe = m.periodEnd;
      if (pe === 495 && m.clock > 495 + m.stoppage) {
        comment(0x20f1, null, 0);                                                              // 0x6bd9c9 HALF_TIME_WHISTLE
        m.period = 1; m.periodEnd = 990; m.clock = 495; m.stoppage = 0; release(); kickoffPositions(secondKick); secondKick = other(secondKick); on?.halftime?.(); return 1;
      }
      if (pe === 990 && m.clock > 990 + m.stoppage) {
        if (ctx.needsWinner?.(m.goals[0], m.goals[1])) {
          comment(0x20f2, null, 0);                                                            // 0x6bdc67 END_OF_NINETY_MINUTES
          m.period = 2; m.periodEnd = 1155; m.clock = 990; m.stoppage = 0; release(); kickoffPositions(secondKick); secondKick = other(secondKick); on?.extraTime?.(); return 2;
        }
        m.periodEnd = 0; postPeriod(0); postPeriod(1); comment(0x2001, null, 0); return 4;                                   // 0x6be4cd FINAL_WHISTLE (post_period_end_events 0x6be120, ligakamp)
      }
      if (pe === 1155 && m.clock > 1155 + m.stoppage) {
        m.period = 3; m.periodEnd = 1320; m.clock = 1155; m.stoppage = 0; release(); kickoffPositions(secondKick); secondKick = other(secondKick); on?.halftime?.(); return 3;
      }
      if (pe === 1320 && m.clock > 1320 + m.stoppage) {
        if (ctx.needsWinner?.(m.goals[0], m.goals[1])) m.shootout = 4;
        m.periodEnd = 1; postPeriod(0); postPeriod(1); comment(0x2001, null, 0); return 4;                                   // 0x6be4cd FINAL_WHISTLE (*placering estimeret* efter forlænget)
      }
      return 0;
    },
    ballOut: (last) => ballOut(last),
    comment: (id, p1, s1, p2, s2, x) => comment(id, p1 as GP | null | undefined, s1, p2 as GP | null | undefined, s2, x),   // sub_6d6f70
    offsideGiven: (side, o) => { st(side).offsides++; if (o) (o as GP).offsidesCaught = ((o as GP).offsidesCaught + 1) & 0xff; on?.offside?.(side); },
    distToTarget: (bx, by, tx, ty) => L.dist(bx, by, tx, ty),
    landing: (x, y) => P.land(x, y),                                                         // sub_6c9cd0
    receive: (p, power, ox, oy) => P.receive(p as GP, power, ox, oy),                        // sub_6f6c00
    topOfTick: ctx.onTop ? () => ctx.onTop!(m) : undefined,
    turnTrace: ctx.onTurn ? (p, out) => ctx.onTurn!(p as GP, out) : undefined,
    // sub_6cf750 (kaldt 0x6b9fd3 inde i tikket – før stod den efter tikket og kun ved bold i spil): bolden i række ≤ 3 / 4..7 / ≥ 8, kun når
    // nogen har bolden (0x6cfafb); den sete kamp (arg2 = engine+0x8ebb) tæller også uden besiddelse
    territory: () => { if (m.poss !== -1 || ctx.watched) territory[m.ballY <= 3 ? 0 : m.ballY < 8 ? 1 : 2]++; },
  };
  /** sub_6c54a0 §5 (notes/team-flags.md; ved hver dødbold): computerens tilstand pr. hold og, når den skifter (eller i kampens første
   *  minut), holdflagene og de individuelle instruktioner. *estimeret*: tilstanden er altid 2 (normal) – 0x6df460's beregning af r (holdenes
   *  styrke/stilling/tid, ~1.100 instr.) er ikke afkodet; uden managerens egenskaber bruges "uden mgr"-reglerne (tilstand 2 → normal,
   *  kontra nej, MBB nej). Tilstand 2–5: alle spillere får instruktionen 0x400000 (gruppen 0xc00000 – fremadløbet 0x800000 slås fra);
   *  bekræftet i kampsporet: originalens instruktioner i hukommelsen har 0x400000, .pct-filerne 0x800000. Tidsspild (3/4) og omlægningen
   *  0x6e1090 er ikke med. */
  // computerens tilstand (0x6df460, aiMode.ts – 249.606 af 249.607 kald som originalen i kampsporene). *estimeret*: styrken = spillernes CA
  // (originalen: managerens opfattede evne 0x6e86d0, i snit ~100 under CA summeret over 11 – begge hold), ingen ligatabel/manager i ctx,
  // kamptypen 33 (som næsten alle ligakampe i sporet).
  const aiR: [number, number] = [-1000, -1000];
  const territory: [number, number, number] = [0, 0, 0];
  const modeInput = (s: Side, inMatch: boolean): AiModeInput => {
    const strength = (side: Side) => inMatch ? teamStrength(gp.filter((q) => q.side === side && q.active).map((q) => q.src.ca)) : (ctx.rep?.[side] ?? 5000);
    const inp: AiModeInput = {
      side: s, inMatch, strength: [strength(0), strength(1)], rep: [ctx.rep?.[0] ?? 5000, ctx.rep?.[1] ?? 5000], territory: [...territory] as [number, number, number],
      clock: m.clock, periodEnd: m.periodEnd, crowd: [sideByte[0], sideByte[1]], goals: [m.goals[0], m.goals[1]], firstLeg: null,
      fixtureFlags: 0, fixtureKind: ctx.league === false ? 0 : 33, onPitch: [gp.filter((q) => q.side === 0 && q.active).length, gp.filter((q) => q.side === 1 && q.active).length],
      sameDivision: ctx.league !== false, compLink: ctx.league !== false, league: null, mgrAttacking: null, rivals: !!ctx.derby, prevMode: m.aiMode[s], prevR: aiR[s],
    };
    return ctx.aiModeInput ? ctx.aiModeInput(inp) : inp;
  };
  const preMatchMode = () => { if (!GRID_UNKNOWN.aiMode) return; for (const s of [0, 1] as Side[]) { const r = aiModeOf(modeInput(s, false)); aiR[s] = r.r; m.aiMode[s] = r.mode; } };
  /** sub_6c54a0 §5 (notes/team-flags.md, 6df460-ai-mode.md; ved hver dødbold): tilstanden for BEGGE hold (løkken har ingen AI-test), tidsspild for
   *  holdet med bolden i tilstand 3/4, og for computerhold ved skift (eller i første minut) holdflag og instruktioner. Uden manager: originalens
   *  "uden mgr"-regler (1 → angreb hvis okAtt, 2 → normal, 3 → defensiv + kontra, 4 → defensiv + MBB, 5 → normal + kontra); tilstand 2–5: alle
   *  0x400000. Ikke porteret: 0x6d10a0's fremadløb i tilstand 1, omlægningen 0x6e1090. */
  /** sub_6c54a0 0x6c5b71–0x6c6212 (sikker): holdets stil i kommentaren efter tilstandsskiftet – START_GAME_* i første minut, ellers GONE_*_STYLE
   *  (højst hvert 15. minut: engine+0x1d2/+0x1d4 = uret ved sidste melding, > 0xa5 tik siden eller afspark). 3/4 fra 1/2: vinder holdet ikke
   *  (sub_6ce310, porten: målforskellen i kampen) → "…BUT_NOT_WINNING". */
  const styleComment = (s: Side, mode: number, prev: number, allowed: boolean) => {
    const say = (id: number, mark: boolean) => { comment(id, null, s, null, -1, 0); if (mark) lastStyle[s] = m.clock; };
    const early = m.clock <= 1;
    // sub_6ce310(side, …, 0)'s svar: 1 ved udebanemål, ellers (egne − modstandernes) som byte (0x6c5f3e / 0x6c61e1)
    const def = () => { const r = score6ce310(shotEnv, s, 0); say((r.away ? 1 : ((r.own - r.opp) << 24) >> 24) > 0 ? 0x213b : 0x213d, true); };
    if (mode === 1) { if (early) say(0x2137, false); else if (allowed) say(0x2139, true); }                    // ATTACKING (derefter 0x6d10a0)
    else if (mode === 2) { if (!early) { if (prev === 3 || prev === 4 || prev === 5) say(0x2138, false); else if (prev === 1 && allowed) say(0x213a, true); } }
    else if (mode === 3) { if (early) say(0x2136, false); else if ((prev === 1 || prev === 2) && allowed) def(); }
    else if (mode === 5) { if (allowed) say(0x213c, true); }                                                      // SITTING_BACK
    else if (mode === 4) { if (early) say(0x2135, false); else if ((prev === 1 || prev === 2) && allowed) def(); }
  };
  const lastStyle: [number, number] = [0, 0];                                                 // engine+0x1d2/+0x1d4
  const aiRetune = () => {
    if (m.paused) return;
    const allowed = [m.state === 8 || m.clock - lastStyle[0] > 0xa5, m.state === 8 || m.clock - lastStyle[1] > 0xa5];   // 0x6c555b–0x6c55b1
    if (m.state === 8) { aiR[0] = -1000; aiR[1] = -1000; }                                     // 0x6c5564–0x6c5574: ved afsparket +0x476a/+0x476e = −1000
    const prevMode = [m.aiMode[0], m.aiMode[1]];
    const changed = [false, false];
    // 0x6c569b/0x6c56a4: tilstandene regnes ikke ved straffe (tilstand 5) eller golden goal (+0x1a8) – tidsspildet nedenfor sker stadig
    if (m.state !== 5 && !m.paused) for (const s of [0, 1] as Side[]) {
      if (!GRID_UNKNOWN.aiMode) { changed[s] = m.clock <= 1 || m.aiMode[s] !== 2; m.aiMode[s] = 2; continue; }   // uden 0x6df460: altid normal
      const r = aiModeOf(modeInput(s, true));
      changed[s] = r.mode !== m.aiMode[s] || m.clock <= 1;
      aiR[s] = r.r; m.aiMode[s] = r.mode;
    }
    if (GRID_UNKNOWN.aiMode && (m.poss === 0 || m.poss === 1)) {
      const mo = m.aiMode[m.poss];
      if (mo === 3 || mo === 4) {                                                             // 0x6c5715: tidsspild
        const r = rand(10); m.clock += r; m.stoppage += rand(Math.trunc(r / 2));
        // 0x6c5757–0x6c57af: står modstanderne i tilstand 1, bliver alle deres 20 (også bænken) ophidsede: sub_716450(q, r/9 + 1)
        const o = other(m.poss as Side);
        if (m.aiMode[o] === 1) { const f = Math.fround(r * 0.1111111111111111 + 1); for (const q of gp) if (q.side === o) scaleAg(q, f); }
      }
    }
    retunePending = { prevMode, changed, allowed };
  };
  /** 0x6c5a1c–: efter udskiftningsportene (sub_6c54a0 0x6c581f/0x6c59c8) – holdflagene, stilkommentaren og instruktionerne for de hold,
   *  hvis tilstand skiftede */
  let retunePending: { prevMode: number[]; changed: boolean[]; allowed: boolean[] } | null = null;
  const aiRetuneFlags = () => {
    const rp = retunePending; retunePending = null;
    if (!rp) return;
    const { prevMode, changed, allowed } = rp;
    for (const s of [0, 1] as Side[]) {
      if ((ctx.ai && !ctx.ai[s]) || !changed[s]) continue;                                   // 0x6c5a3e–0x6c5ac5 (menneskets hold / ingen ændring)
      const mode = m.aiMode[s];
      if (mode < 1 || mode > 5) continue;                                                     // 0x6c5b64
      // 0x6c5acb–0x6c5b58: taktikkens navn (+0x905d, null → "Not set") ≠ "3-4-3" og ≠ "3-5-2 Attacking"
      const okAtt = !['3-4-3', '3-5-2 Attacking'].includes((ctx.tacticName ? ctx.tacticName[s] : maps[s].preset?.name) ?? 'Not set');
      // managerens ikke-spillerpost (+0x9051): +0xe Attacking, +0x13 Directness (Staff.tac[0]/[1]); null = ingen manager
      const mg = ctx.managers?.[s] ?? null, att = mg ? (mg.tac[0] << 24) >> 24 : 0, dir = mg ? (mg.tac[1] << 24) >> 24 : 0;
      const crowdUp = (sideByte[s] << 24) >> 24 > 0;                                          // engine+0x1ad+s > 0
      let f = m.teamFlags[s];
      const set = (bit: number) => { f = setTeamOption(f, bit); };                             // sub_5b50d0
      if (mode === 1) {                                                                       // 0x6c5b71
        set(mg && aiR[s] < 2.5 && att <= 6 ? 0x20000 : okAtt ? 0x10000 : 0x20000);          // 0x6c5b7b fcomp 2,5 (0x968e18)
        set(0x800); set(0x2000);
      } else if (mode === 2) {                                                                // 0x6c5c67
        let m2 = 0x20000, ctr = 0x800;
        if (mg) {
          if (att > (crowdUp ? 18 : 15) && okAtt) m2 = 0x10000;                               // 0x6c5c90
          else if (att <= 5 && (sideByte[s] & 0xff) !== 0 && !(aiR[s] > 1.0)) {               // 0x6c5cba–0x6c5cd4 (test cl, cl; je)
            m2 = 0x8000; ctr = dir >= (crowdUp ? 7 : 4) ? 0x800 : 0x1000;                     // 0x6c5d1d
          }
        }
        set(m2); set(ctr); set(0x2000);
      } else if (mode === 3) {                                                                // 0x6c5e26
        if (mg) { set(att > 16 ? 0x20000 : 0x8000); set(dir >= (crowdUp ? 13 : 10) ? 0x800 : 0x1000); }
        else { set(0x8000); set(0x1000); }
        set(0x2000);
      } else if (mode === 5) {                                                                // 0x6c5fba
        if (mg) { set(att > 16 && okAtt ? 0x10000 : att > 12 ? 0x20000 : 0x8000); set(dir >= (crowdUp ? 13 : 10) ? 0x800 : 0x1000); }
        else { set(0x20000); set(0x1000); }
        set(0x2000);
      } else {                                                                                // 0x6c6114 (tilstand 4)
        set(mg && att > 18 ? 0x20000 : 0x8000); set(0x800); set(0x4000);
      }
      m.teamFlags[s] = f;
      styleComment(s, mode, prevMode[s], allowed[s]);                                        // efter flagene, før instruktionerne (0x6c5bf4 …)
      if (mode === 1) forwardRuns(s);                                                         // 0x6c5c1f / 0x6c5c5d sub_6d10a0(side)
      else for (const q of gp) if (q.side === s && q.slot >= 0) q.instr = (q.instr & ~0xc00000n) | 0x400000n;   // sub_5b5290(plads, 0x400000, 0)
    }
  };
  /** sub_6d10a0(side) (sikker): i tilstand 1 får sidens spillere på banen fremadløbet 0x800000 (sub_5b5290), når
   *  ftol(10·post+0x43 + 10·post+0x33 + 10·post+0x27 + kondition) + positionens tillæg > 8500 (keepere aldrig): 0x2 +500, 0x4 −1000 (−500 med
   *  0x800/0x80), 0x8 −300 (0 med 0x800/0x80), 0x10 +1000, 0x20 +2000 – den første bit, der passer */
  const forwardRuns = (s: Side) => {
    for (const q of gp) {
      if (q.side !== s || q.slot < 0) continue;
      let v = Math.trunc(10 * recByte(q, 0x43) + 10 * recByte(q, 0x33) + 10 * recByte(q, 0x27) + Math.fround(q.condition));
      const w = q.pos;                                                                        // sub_717410
      if (w & 1) continue;
      if (w & 2) v += 0x1f4;
      else if (w & 4) v -= (w & 0x800) || (w & 0x80) ? 0x1f4 : 0x3e8;
      else if (w & 8) { if (!(w & 0x800) && !(w & 0x80)) v -= 0x12c; }
      else if (w & 0x10) v += 0x3e8;
      else if (w & 0x20) v += 0x7d0;
      if (((v << 16) >> 16) > 0x2134) q.instr = (q.instr & ~0xc00000n) | 0x800000n;
    }
  };
  /** markers_follow (sub_6f09f0 0x6f0a76/0x6f0c07/0x6f3bf9, sub_7103e0 0x710612; sikker): hver markør, der må følge (sub_6bce20), og som
   *  den flyttede spillers off-the-ball- · fart-rul ikke overstiger rand(900) + 50, får en forsvarstur (sub_714d40). */
  const markersFollow = (p: GP) => {
    for (let i = 0; i < p.markers.length; i++) {
      const mk = p.markers[i] as GP;
      if (L.canFollow(m, mk, p.x, p.y) && p.roll.offTheBall * p.roll.pace <= rand(900) + 50) L.defendOffBall(m, mk, rand, hooks);
    }
  };
  /** skridtets konditionstab (sub_6f09f0 0x6f3c88–0x6f3f78, sikker): afstand · (4,5 − Stamina/12) · bane · vejr, ×(1,25|1,15|1,2 − 0,005·Stamina)
   *  uden for den naturlige position (sub_6c38c0 ≠ sub_6c38f0), ×(1,55 − 0,025·Stamina) med instruktion 0x8000 eller 0x2000 + holdets pres;
   *  så sub_6f56c0(p, tab, −1): ×12/10/8/6 / 11 efter konditionen (> 9500/8750/7750), aldrig under 0. */
  const BYTE1_DRAIN: Record<number, number> = { 1: 1.4, 2: 1.2, 4: 1.05, 8: 1.45, 16: 1.05, 32: 1.15, 64: 1.1 };
  const stepDrain = (p: GP, ox: number, oy: number) => {
    if (p.slot < 0 || !p.active) return;
    let f = Math.fround(BYTE1_DRAIN[GRID_UNKNOWN.byte1] ?? 1);
    if (GRID_UNKNOWN.weather === 3) f = Math.fround(f * 1.05); else if (GRID_UNKNOWN.weather === 4) f = Math.fround(f * 1.1);
    const st = p.f.stamina ?? 0;
    let drain = Math.fround(L.DIST[Math.min(11, Math.abs(p.y - oy))][Math.min(8, Math.abs(p.x - ox))] * Math.fround(5 - (0.5 * st + 15) / 6 + 2) * f);
    if (p.pos !== p.posAttack) {
      const role = (fl: number) => (fl & 1 ? 0 : fl & 4 ? 1 : fl & 8 ? 2 : fl & 0x10 ? 3 : fl & 0x20 ? 4 : fl & 0x40 ? 5 : 3);
      const k = Math.abs(role(p.pos) - role(p.posAttack)) > 1 ? 1.25 : p.pos & 4 || p.posAttack & 4 ? 1.15 : 1.2;
      drain = Math.fround(drain * (k - 0.005 * st));
    }
    const lo = Number(p.instr & 0xffffffffn);
    if (lo & 0x8000 || (lo & 0x2000 && m.teamFlags[p.side] & 0x100)) drain = Math.fround(drain * (1.55 - 0.025 * st));
    const c = p.condition;
    p.condition = Math.max(0, c - drain * (c > 9500 ? 12 : c > 8750 ? 10 : c > 7750 ? 8 : 6) * Math.fround(1 / 11));
  };
  /** vendingen til sidst i sub_6f09f0 (0x6f4143, sikker): alle andre end boldholderen vender sig mod et punkt en tredjedel af vejen mellem
   *  bolden, spilleren og et mål – eget mål når modstanderen har bolden, modstandernes når eget hold har den (eller han/en holdkammerat er
   *  tilsigtet modtager), ellers den nærmeste ende (række < 6 → y = 0). Heltalsdivision mod nul. */
  const finalTurn = (p: GP) => {
    if (p === m.carrier) return;
    const s = p.side, rv = m.receiver as GP | null;
    let gy: number;
    if (m.poss === other(s)) gy = s === 0 ? 0 : 11;
    else if (m.poss === s || rv === p || (rv && rv.side === s)) gy = s === 0 ? 11 : 0;
    else gy = p.y < 6 ? 0 : 11;
    P.turnTo(p, p.x, p.y, Math.trunc((m.ballX + p.x + 4) / 3), Math.trunc((m.ballY + p.y + gy) / 3));
  };
  /** sub_6f09f0 for en spiller uden bold (sikker; 0x6f09f0–0x6f0cbd + MOVE 0x6f3a67–0x6f42b6). */
  const offBallMove = (p: GP, tx: number, ty: number, flags: number) => {
    p.busy++;                                                                                   // 0x6f0a13
    if (p.x === tx && p.y === ty && flags !== 0xf && flags !== 0x100) { markersFollow(p); return; }   // 0x6f0a62
    knockCheck(p, flags & 0xffff, null, -1, true);                                            // 0x6f0b0c sub_6cfe10(p, handling, 0, −1, 1)
    if (!H.facingOk(p, tx, ty) && p.roll.agility === 0 && p.roll.positioning === 0 && p.roll.anticipation === 0) {
      P.turnTo(p, p.x, p.y, tx, ty); markersFollow(p); p.action = 0x6f; return;               // 0x6f0b7e
    }
    const ox = p.x, oy = p.y;
    let nx = p.x + Math.sign(tx - p.x), ny = p.y + Math.sign(ty - p.y);                          // 0x6f0c1d
    if (p.roll.pace * p.roll.pace > rand(1000)) { nx += Math.sign(tx - nx); ny += Math.sign(ty - ny); }   // 0x6f0c6c
    setPos(m, p, nx, ny);                                                                       // 0x6f3a67–0x6f3ba2 (cellelisterne)
    L.noteForward(m, p);                                                                        // 0x6f3b8f–0x6f3bf3
    markersFollow(p);                                                                           // 0x6f3bf9
    stepDrain(p, ox, oy);                                                                       // 0x6f3c88
    pickUp(p);                                                                                  // 0x6f3f7d
    finalTurn(p);                                                                               // 0x6f4143
  };
  /** sub_6f09f0 0x6f3f7d (sikker): efter skridtet – står en spiller uden bold i den frie bolds felt (ikke i flugt, ikke den tilsigtede
   *  modtager +0xf57a og ikke afleveren), tager han den: en modstander af modtageren opsnapper (+28), uden modtager vender han sig mod målet
   *  og samler den op (+4). */
  const pickUp = (p: GP) => {
    if (m.ballH >= 5 || m.loftCountdown !== 0 || m.poss !== -1 || p.x !== m.ballX || p.y !== m.ballY || p === m.receiver || p === m.lastPasser) return;
    const rv = m.receiver as GP | null;
    if (rv) { if (rv.side !== p.side) { comment(0x1f60, p, p.side, null, -1, 0); takeBall(p); p.rating += 28; } return; }   // 0x6f402e INTERCEPT_THROUGH_BALL
    P.turnTo(p, p.x, p.y, 4, p.side === 0 ? 11 : 0);
    // 0x6f405c–0x6f40d9: LOOSE_BALL_IN_AREA, når engine+0x1cd (bolden gik løs i feltet efter et skud) og p står centralt (x 3..5) i angrebsfeltet
    const inArea = m.b1cd !== 0 && p.x >= 3 && p.x <= 5 && (p.side === 0 ? p.y >= 10 : p.y <= 1);
    comment(inArea ? 0x2113 : 0x1f46, p, p.side, null, -1, 0);                                // PICK_UP_FREE_BALL
    m.ballH = 0; takeBall(p); p.rating += 4;
  };

  /** sub_6cd490: kun i åbent spil og med bolden uden for banen (før blev bolden lagt ind på banen FØR testen, så den aldrig gav indkast). */
  const ballOut = (last: Side) => {
    const bx = m.ballX, by = m.ballY;
    if (m.state !== 0 || onPitch(bx, by)) return;
    L.ballOutOfPlay(m, last, hooks);
    // sub_6cd490 flytter ikke bolden; opstillingen (sub_6c54a0 → 0x6c4290/0x6c4470/0x6c4ec0) bruger dens felt ved næste tik. Klemmet her,
    // så intet regner med felter uden for banen – det ændrer ingen af opstillingernes valg (hjørnet: x er 0..8; indkastet klemmer selv).
    m.ballX = clampX(bx); m.ballY = clampY(by);
    m.carrier = null; m.receiver = null; m.passTo = null; m.ballH = -1; m.ballSpeed = 0;
    if (m.pendingPass !== -1) { dbg('pass:out'); m.pendingPass = -1; }
    if ((m.state as number) === 3) { st(m.poss as Side).corners++; on?.corner?.(m.poss as Side); }
  };

  // ---------------------------------------------------------------- udfordringen og dommeren (challenge.ts, cm0102-original-rules.ts)
  // Udeladt overalt: kommentarerne (sub_6d6f70 og de rand-kald, der kun vælger kommentar), knock-tjekket sub_6cfe10 (18 rand, ikke læst)
  // og sub_716e10 (4 rand, ikke læst). Fordelsreglen (sub_6bb9a0 → ventende frispark) lægges ikke. Vendingen sub_6f4920 er porteret (pass.ts).
  const challenge = (p: GP | null, side: Side, action: number, flag9 = 0): ChallengeOut => {
    const n = onShot && m.ballX >= 0 && m.ballX <= 8 && m.ballY >= 0 && m.ballY <= 11 ? gp.filter((o) => o.active && o.side !== side && o.x === m.ballX && o.y === m.ballY).length : -1;
    const c = getOppositionChallenge(m, p, side, action, flag9, rand, (q) => GRID_UNKNOWN.freeRun(m, q, rand));
    onShot?.('D', [action, side, n, m.ballH, c.d ? 1 : 0, c.d ? c.value : 0, c.d ? c.type : 0]);
    return c;
  };
  const minute = () => Math.trunc(m.clock / 11);
  /** Den sete kamp (engine+0x8ebb): straffeappellen PENALTY_CLAIM_SOUND 0x2168 lige efter judge_tackle – løbet 0x6f1329, modtagelsen 0x6f797e og
   *  0x6f7ad6, afleveringen 0x6fb566, holdebolden 0x70ee3d, landingen 0x6c9ead (skuddets kopi 0x7024fd ligger i takeShot.ts): synderen d står i
   *  feltet for boxSide, og typen er hård (sub_6cb650), offeret er "ramt", eller rand(w31of.w31) < −10 (kun trukket ved blød type og ikke ramt);
   *  så rand(3) ≠ 0 → 0x2168 (p1 = d, side = d's). w31of = d, undtagen modtagelsens anden (0x6f83cc: offerets +0x31, sic). */
  const appeal = (d: GP, boxSide: Side, type: number, hurt: boolean, w31of: GP) => {
    if (!ctx.watched || !inBoxAt(boxSide, d.x, d.y)) return;
    if (!(isHardChallenge(type) || hurt || randS(rand, w31of.w31) < -10)) return;
    if (rand(3) !== 0) comment(0x2168, d, d.side, null, -1, 0);
  };
  const judge = (d: GP, p: GP, type: number, action: number): JudgeResult => {
    const j = judgeTackle(rand, { official: m.official, minute: minute(), teamFouls: st(d.side).fouls, teamByte: m.sideByte[d.side], incidentPending: advantagePending(m) }, d, p, type, action);
    dbg(`judge:${type}:${j.ret}`);
    onShot?.('J', [action, d.side, d.pslot ?? d.slot, d.x, d.y, p.side, p.pslot ?? p.slot, type, action, j.ret]);
    return j;
  };
  /** sub_6cd770 (sikker, pass.ts): bolden bliver løs og spredes */
  const ballLoose = (x: number, y: number, spread: number, lastTouch: Side, keep: boolean, player: GP | null) => {
    if (m.pendingPass !== -1) m.pendingPass = -1;
    P.looseBall(x, y, spread, lastTouch, keep, true, player);
  };
  /** FOUL-grenen i sub_6f09f0 (0x6f13e1–0x6f1e30) og skud-/afleveringsvejene: sub_6ea4e0 + genstarten (sikker; kommentarerne udeladt). */
  /** kortets begivenhed efter sub_6ea4e0's kode (tabel 0x6f4354): 2 YELLOW_CARD, 3 SECOND_YELLOW_CARD, 4 SENT_OFF, 5 SENT_OFF_FOR_PROFESSIONAL_FOUL */
  const cardEvent = (code: number) => (code === 2 ? 0x1ff9 : code === 3 ? 0x1ff7 : code === 4 ? 0x1ff8 : code === 5 ? 0x1ff6 : -1);
  /** sub_716e10 react_to_foul_decision(d, 0) (sikker): den dømte reagerer – temperCheck 5/4 (rand(20 − Aggression) == 0 og Aggression ≥ 5 →
   *  slår/skubber dommeren, ellers diskuterer), 2 (diskuterer), 2 og 1 (brokker sig); så et kort uden offer (sub_6cfd40, art 5/4/3/3/2/1) og
   *  kortets kommentar (rand(8)/rand(3) og 0x2109 kun efter en diskussion). Frisparket flyttet 10 yards (0x717144, kun i en bestemt turnering:
   *  fixture+0x14 → +0x5d = [0x9cf2e4]) er tenYards nedenfor. */
  const reactToFoul = (d: GP) => {
    let argued = false, kind = 0;
    const strike = () => rand(Math.trunc(20 - d.f.aggression)) === 0 && !(d.f.aggression < 5);
    if (temperCheck(d, 5, null)) { if (strike()) { comment(0x20db, d, d.side, null, -1, 0); kind = 5; } else { comment(0x20e6, d, d.side, null, -1, 0); argued = true; kind = 3; } }
    else if (temperCheck(d, 4, null)) { if (strike()) { comment(0x20da, d, d.side, null, -1, 0); kind = 4; } else { comment(0x20e6, d, d.side, null, -1, 0); argued = true; kind = 3; } }
    else if (temperCheck(d, 2, null)) { comment(0x20e6, d, d.side, null, -1, 0); argued = true; kind = 3; }
    else if (temperCheck(d, 2, null)) { comment(0x20d8, d, d.side, null, -1, 0); kind = 2; }
    else if (temperCheck(d, 1, null)) { comment(0x20d8, d, d.side, null, -1, 0); kind = 1; }
    if (!kind) return;
    const code = cardWithoutVictim(rand, m.official, d, kind, minute());                     // sub_6cfd40 → sub_6eab60
    const id = code === 3 ? 0x1ff7 : code === 2 ? 0x1ff9 : code === 4 ? 0x1ff8 : code === 9 ? 0x210a : -1;   // tabel 0x7172b0
    if (id < 0) { tenYards(d, code); return; }                                               // 0x717011: koder uden for tabellen → 0x717144
    if (rand(8) !== 0 && argued) { rand(3); comment(0x2109, d, d.side, null, -1, 0); }        // 0x71705a (rand(3) ≠ 0: klubtype 8 → 0x20f5, ukendt → nej)
    comment(id, d, d.side, null, -1, 0);
    if (code === 2) st(d.side).yellows++;
    else if (code === 3 || code === 4) { st(d.side).reds++; sendOff(d); }                     // sub_6cda20
    if (code >= 2 && code <= 4) on?.card?.(d, code, true);
    tenYards(d, code);                                                                        // 0x717144
  };
  /** sub_716e10 0x717144–0x7172a6 (sikker): frisparket flyttes 10 yards (én række) efter kortet – kun når offerets hold har bolden
   *  (+0x8eae = synderens modstander), koden ≠ 0 og ≠ 9 (TICKING_OFF), boldens række 1..10, genstart 6/7 og kampens turnering hører til
   *  landet i [0x9cf2e4] (fixture+0x14 → turnering +0x5d → nationens id; [0x9cf2e4] står først i de britiske landes liste ved 0x4d2828 =
   *  England – ctx.tenYards). Synder side 0: række + 1, side 1: række − 1, klemt til 0..11 (0x7171cc–0x717208); kommentaren 0x21b9 til
   *  offerets side (p1 −1). Står bolden så i synderens eget felt (sub_6cb960(synder, x, y) = inBoxAt), og er det et direkte frispark,
   *  FREEKICK_BECOMES_INDIRECT 0x21ba og +0x8eb2 = 7 (0x717268–0x71729f). NB: rækken flyttes VÆK fra synderens mål, så feltet kan ikke nås –
   *  grenen er død i originalen (oversat som den står). */
  const tenYards = (d: GP, code: number) => {
    if (m.poss !== other(d.side) || code === 0 || code === 9) return;                        // 0x71715b / 0x717163 / 0x71716b
    if (!(m.ballY > 0 && m.ballY < 11)) return;                                             // 0x717174–0x717186
    if (m.state !== 6 && m.state !== 7) return;                                             // 0x71718c–0x71719a
    if (!(ctx.tenYards ?? m.nations[0] === 'England')) return;                               // 0x7171a0–0x7171c6 (mangler: hjemmeholdets land = England)
    m.ballY = clampY(d.side !== 0 ? m.ballY - 1 : m.ballY + 1);                             // 0x7171d2–0x717208
    comment(0x21b9, null, other(d.side), null, -1, 0);                                      // 0x71722d FREEKICK_MOVED_BACK_10_YARDS
    if (inBoxAt(d.side, m.ballX, m.ballY)) {                                                // 0x71725f sub_6cb960
      if (m.state === 6) comment(0x21ba, null, other(d.side), null, -1, 0);                // 0x717294 FREEKICK_BECOMES_INDIRECT
      m.state = 7;                                                                          // 0x71729f
    }
  };
  /** sub_6f09f0 0x6f17c2–0x6f1950 (sikker, ingen kommentar): avisens historie om en udvisning – sub_68d0d0 på kampens historieliste
   *  (engine+0x478e, altid oprettet i init_match 0x6b8d2c) med type 0x19 og posten {synderens stab-id, hans klub, offerets stab-id, 0, offerets
   *  side, 0, −1, 0x82, 0}. Tallene trækkes kun, når kortets kode er 4/5 (rødt/professionelt), jC (judge_tackle's art, [esp+0x44]) ∈ {5, 10, 11},
   *  begge er databasens spillere (stab-id < [0xae2364] – ikke regens), synderens klub (+0xf9) ikke styres af et menneske (sub_600a50(klub, 0, 1,
   *  0, 0): klubbens manager +0xcf blandt de 16 menneskepladser [0xae2364]−16..) og Professionalism (stab +0x5b) < v + 10, hvor
   *  v = byte(ftol(sub_7c1e30(post, 0xb, 2, 6,5))) – kategori 0xb er sammenvejningsgrenen 0x7c1f59, som cmPlayerData ikke har (statAvg giver 0).
   *  Så rand(5) + 15 − v < Aggression (post +0x1c), rand(5) + 15 − v < Dirtiness (+0x25), rand(3500) + 3000 < omdømmet (post +0xb, word =
   *  cmRep[1]) og v > rand(3) + 1 – hver kun når den forrige holdt (byte-/word-sammenligninger med fortegn). Historien selv bruges ikke af
   *  motoren (kun avisen) og gemmes ikke. */
  const newsSendOff = (d: GP, p: GP, outcome: number, jC: number) => {
    const v = (Math.trunc(statAvg(d.src, 0xb, 2, 6.5)) << 24) >> 24;                       // 0x6f17df–0x6f17e9
    if (outcome !== 5 && outcome !== 4) return;                                             // 0x6f180b–0x6f1815
    if (jC !== 0xa && jC !== 5 && jC !== 0xb) return;                                       // 0x6f181b–0x6f1829
    if (d.src.regen || p.src.regen) return;                                                 // 0x6f182f–0x6f1853
    if (!isAi(d.side)) return;                                                              // 0x6f1859–0x6f187a sub_600a50 ≠ 0
    const raw = (k: string, q: GP) => q.src.attrs[ATTRS.indexOf(k as never)] || 10;         // postfelterne som limens øvrige (vist værdi)
    if (raw('professionalism', d) >= v + 10) return;                                        // 0x6f1886–0x6f188f
    const b = ((15 - v) << 24) >> 24;                                                       // 0x6f1899
    if (raw('aggression', d) <= (((rand(5) + b) << 24) >> 24)) return;                      // 0x6f189f / 0x6f18ac (post +0x1c)
    if (raw('dirtiness', d) <= (((rand(5) + b) << 24) >> 24)) return;                       // 0x6f18b7 / 0x6f18c4 (post +0x25)
    const rep = (d.src.cmRep ?? repTriple(d.src.rep ?? 50))[1];
    if (rep <= rand(0xdac) + 0xbb8) return;                                                 // 0x6f18cd / 0x6f18e2 (post +0xb)
    if (!(v > rand(3) + 1)) return;                                                         // 0x6f18e8 / 0x6f18f5
    // 0x6f18f7–0x6f1950: sub_68d0d0(historien, 0x19) – ikke modelleret
  };
  /** sub_6bb8d0 (sikker): ophidselsen spredes på synderens hold – alle 20 i truppen med en post (+0x69): synderen selv ×w, bænken (+0x19 < 0)
   *  ×(w/6 + 0,83), de andre på banen ×(w + 1)/2 (sub_716450, float32). w = sub_6ea4e0/sub_6e9630's vægt. Samme løkke i 0x6bb0cb/0x6bb69b. */
  const agitateTeam = (d: GP, w: number) => {
    const f = Math.fround(w);
    for (const q of gp) {
      if (q.side !== d.side) continue;
      if (q === d) scaleAg(q, f);
      else if (q.slot < 0) scaleAg(q, Math.fround(f * (1 / 6) + 0.83));                     // 0x96a7a8, 0x96d0e8
      else scaleAg(q, Math.fround((f + 1) * 0.5));                                            // 0x967890, 0x968968
    }
  };
  /** sub_6e9630's vægt ([edi]: 1,5 start, 2,0 gult, 3,5 andet gule, 5,0 rødt 4/6 – 0x6e9642–0x6e981d) */
  const handsWeight = (code: number) => (code === 2 ? 2 : code === 3 ? 3.5 : code === 4 || code === 6 ? 5 : 1.5);
  /** Hands-blokken (samme skabelon i modtagelsen sub_6f6c00 0x6f7353–0x6f794c, opsnapningen sub_6f5c30 0x6f61a1–0x6f67a3 og blokeringen
   *  sub_70dfd0 0x70e3fe–0x70e9c2): sub_6e9630, HAND_BALL, kortets begivenhed (tabel 0x6f9db8: 2 gult, 3 andet gule, 4 udvist, 6 bevidst
   *  hands; ellers TICKING_OFF ved sværhed > rand(7) + 2), straffe i eget felt (appel rand(4) uden kort; +0x478a = 0, −500, moral
   *  rand(Pressure)/−rand(10) – ikke i blokeringen 0x70e666), RESTART_PENALTY, kortet (rand(4): rand(sværhed) mod rand(20) → klubtype 8 →
   *  0x20f5 (ukendt → nej), 0x2109), skytten (sub_6ceb90, modstanderne) og frisparkets chance efter SKYTTENS felt og hands-spillerens x;
   *  ved en blød kode (sub_6cb650) rand(9) → 0x20df/rand(3) 0x20e0/(rødt eller straffe) rand(2) 0x20d9 med hands-spillerens side, sub_6bb8d0
   *  og sub_716e10. Modtagelsen trækker −25 bagefter (0x6f8cea). Ingen "skadet"-gren (hands har intet offer). */
  const handsFoul = (q: GP, code: number, sev: number, b: number, flag: boolean, site: 'receive' | 'intercept' | 'block') => {
    dbg('hands:' + site);
    const outcome = P.handsPunish(q, sev, b, flag);                                          // sub_6cfd10 → sub_6e9630
    const red = outcome >= 3 && outcome <= 6, o = other(q.side);
    comment(0x1fe8, q, q.side, null, -1, 0);                                                  // 0x6f7390 / 0x6f61de / 0x70e43e HAND_BALL
    let ev2 = outcome === 2 ? 0x1ff9 : outcome === 3 ? 0x1ff7 : outcome === 4 ? 0x1ff8 : outcome === 6 ? 0x1ff5 : -1;
    if (ev2 === -1 && sev > rand(7) + 2) ev2 = 0x210a;                                        // 0x6f73d2 TICKING_OFF
    let ev = 0x1f79;
    if (outcome === 7) restart(7, o, q.x, q.y);
    else if (inBoxAt(q.side, q.x, q.y)) {                                                     // 0x6f7405: i eget felt
      if (ev2 === -1) { const r4 = rand(4); if (r4 === 0) comment(0x20e9, null, o, null, -1, 0); else if (r4 === 1) comment(0x20ec, null, o, null, -1, 0); }
      ev = 0x1f7a; m.penaltyFor = null; q.rating -= 500;                                      // 0x6f75b0 +0x478a = 0
      if (site !== 'block' && rand(q.pressure) === 0 && adjustMorale(q, -rand(10), rand)) recompute(q);   // 0x6f75c8/0x6f75da
      restart(5, o, 4, q.side === 0 ? 1 : 10);
      comment(0x1f7a, null, o, null, -1, 0);                                                  // 0x6f74b4 RESTART_PENALTY
    } else restart(6, o, q.x, q.y);
    if (ev2 > -1) {
      if (rand(4) === 0) { randS(rand, sev); rand(20); comment(0x2109, q, q.side, null, -1, 0); }   // 0x6f74c3 (klubtype 8 → 0x20f5: ukendt → nej)
      comment(ev2, q, q.side, null, -1, 0);                                                   // 0x6f768e
      if (outcome === 2) st(q.side).yellows++;
      if (red) { st(q.side).reds++; sendOff(q); }                                             // 0x6f76b0 sub_6cda20
      if (outcome >= 2 && outcome <= 6) on?.card?.(q, outcome, true);
    }
    if (ev !== 0x1f7a) {
      const taker = GRID_UNKNOWN.pickTaker(m, o, outcome === 7 ? 7 : 6, rand) as GP | null;   // 0x6f76e0 sub_6ceb90
      if (taker && outcome === 7) comment(0x21e2, taker, o, null, -1, 0);
      else comment(ev, null, o, null, -1, 0);                                                 // 0x6f7741
      if (taker) {
        const zone = taker.side === 1 ? taker.y < 4 : taker.y > 7;                            // 0x6f7767: skyttens felt
        if (outcome === 7) { if (zone && !inBoxAt(q.side, taker.x, taker.y)) comment(0x21e1, taker, o, null, -1, 0); }
        else if (zone) comment(!(q.x >= 2 && q.x <= 6) ? 0x21df : 0x21e0, taker, o, null, -1, 0);
      }
    }
    if (!isHardChallenge(code)) {                                                             // 0x6f7888 sub_6cb650
      if (rand(9) === 0) {
        comment(0x20df, null, q.side, null, -1, 0);
        if (rand(3) === 0) comment(0x20e0, null, q.side, null, -1, 0);
        if ((red || ev === 0x1f7a) && rand(2) === 0) comment(0x20d9, null, q.side, null, -1, 0);
      }
      agitateTeam(q, handsWeight(outcome));                                                   // 0x6f8cdc sub_6bb8d0
      reactToFoul(q);                                                                         // 0x6f8ce5 sub_716e10
    }
    if (site === 'receive') q.rating -= 25;                                                   // 0x6f8cea
  };
  /** sub_6c9cd0's tre straffekopier (0x6ca18a W mod L, 0x6ca839 L mod W, 0x6cad5d W alene – hands): sub_6ea4e0 (8. arg 0) eller sub_6e9630;
   *  forseelsens begivenhed efter synderens kode (tabel 0x6cb4c0/0x6cb564: 1 0x1ff1, 12 0x1ff4, 21 0x1ff0, 0x25 0x1fe8 (kun synderen), 46 0x1ff3,
   *  ellers 0x1fe9; alene altid 0x1fe8), kortets begivenhed (tabel 0x6cb4f0: 2 0x1ff9, 3 0x1ff7, 4 0x1ff8, 5 0x1ff6, 6 0x1ff5 – alene uden 5)
   *  eller TICKING_OFF ved rand(7) + 2 < [esp+0x24] (dommens art / hands' 4), straffe i synderens eget felt (rand(4) appel uden kort;
   *  +0x478a = den anden, −500), bolden i landingsfeltet til modstanderne (tilstand 5/6/7), RESTART_PENALTY, kortet (rand(4): rand(sværhed)
   *  > rand(20) → 0x20f5 med p1 = 0/side 0 – ingen klubtype her – og 0x2109), RESTART_FREEKICK (ingen skytte), ved en blød kode rand(9) →
   *  0x20df/rand(3) 0x20e0/(rødt eller straffe: +0x16 = b16, rand(7) 0x20d9) med synderens side, sub_6bb8d0 og sub_716e10. */
  const landFoul = (X: GP, Y: GP | null, codeX: number, how: { j: JudgeResult; clear: boolean } | { hj: { sev: number; b: number } }, x: number, y: number, b16: GP, alone: boolean) => {
    dbg('landFoul');
    let outcome: number, weight: number, kindB: number, sevB: number;
    if ('j' in how) {
      const r = decideFoulPunishment(rand, { minute: minute(), shootout: !!m.shootout, addTeamFoul: () => { st(X.side).fouls++; } }, X, Y!, how.j.ret, how.j.kind, how.j.severity, how.clear, false);
      outcome = r.code; weight = r.weight; kindB = how.j.kind; sevB = how.j.severity;
    } else { outcome = P.handsPunish(X, how.hj.sev, how.hj.b, false); weight = handsWeight(outcome); kindB = how.hj.b; sevB = how.hj.sev; }
    const o = other(X.side);
    const fe = alone ? 0x1fe8 : codeX === 1 ? 0x1ff1 : codeX === 12 ? 0x1ff4 : codeX === 21 ? 0x1ff0 : codeX === 0x25 ? 0x1fe8 : codeX === 46 ? 0x1ff3 : 0x1fe9;
    if (fe === 0x1fe8) comment(0x1fe8, X, X.side, null, -1, 0); else comment(fe, X, X.side, Y, Y ? Y.side : -1, 0);
    let cid = outcome === 2 ? 0x1ff9 : outcome === 3 ? 0x1ff7 : outcome === 4 ? 0x1ff8 : outcome === 5 && !alone ? 0x1ff6 : outcome === 6 ? 0x1ff5 : -1;
    if (cid === -1 && ((kindB << 24) >> 24) > rand(7) + 2) cid = 0x210a;            // 0x6ca32c / 0x6ca9d7 / 0x6cadf1
    let ev: number, state: number;
    if (outcome === 7) { ev = 0x1f79; state = 7; }
    else if (inBoxAt(X.side, X.x, X.y)) {                                                     // sub_6f5b20(X, X's side): straffe
      if (cid === -1) { const r4 = rand(4); if (r4 === 0) comment(0x20e9, null, o, null, -1, 0); else if (r4 === 1) comment(0x20ec, null, o, null, -1, 0); }
      ev = 0x1f7a; state = 5; m.penaltyFor = Y; X.rating -= 500;                             // +0x478a, 0xfe0c
    } else { ev = 0x1f79; state = 6; }
    restart(state, o, x, y);                                                                  // +0x8ea7/8 = (x, y), +0x8eae, +0xf582 = 0
    if (ev === 0x1f7a) comment(0x1f7a, null, o, null, -1, 0);
    if (cid > -1) {
      if (rand(4) === 0) {
        const a = randS(rand, (sevB << 24) >> 24), b = rand(20);
        if (a > b) events.add(0x20f5, 0, 0, -1, -1, 0);                                       // 0x6ca4bd: p1 0, side 0 (sic)
        comment(0x2109, X, X.side, null, -1, 0);
      }
      comment(cid, X, X.side, null, -1, 0);
      if (outcome === 2) st(X.side).yellows++;
      if (outcome >= 3 && outcome <= 6) { st(X.side).reds++; sendOff(X); }                   // sub_6cda20(X, 0)
      if (outcome >= 2 && outcome <= 6) on?.card?.(X, outcome, true);
    }
    if (ev !== 0x1f7a) comment(ev, null, o, null, -1, 0);
    if (!isHardChallenge(codeX)) {                                                            // tabel 0x6cb50c (sub_6cb650-mængden)
      if (rand(9) === 0) {
        comment(0x20df, null, X.side, null, -1, 0);
        if (rand(3) === 0) comment(0x20e0, null, X.side, null, -1, 0);
        if ((outcome >= 3 && outcome <= 6) || ev === 0x1f7a) { b16.b16 = 1; if (rand(7) === 0) comment(0x20d9, null, X.side, null, -1, 0); }
      }
    }
    agitateTeam(X, weight);                                                                   // 0x6ca624–0x6ca69a (samme løkke som sub_6bb8d0)
    reactToFoul(X);                                                                           // sub_716e10(X, 0)
  };
  /** FOUL-grenen (sub_6ea4e0 + genstarten). site 'move' = sub_6f09f0 0x6f145d–0x6f1e21 med kommentarerne i originalens rækkefølge: forseelsen,
   *  kortets begivenhed (eller TICKING_OFF ved rand(7) + 2 < kind), straffe (rand(4) appel), professionelt frispark/skade, rand(4) "dommeren
   *  kalder ham over", kortet, skytten og frisparkets chance, og efter en blød forseelse offerets reaktion (0x20dd/rand(9)/rand(3)/rand(2))
   *  og sub_716e10. De andre kaldere ('other') er endnu uden kommentarer. Indberetningen af et dyk (0x6f17c2–0x6f1950: dommerdatabasen,
   *  stabens datoer) er ikke med. */
  /** site 'shot' = sub_702050's egen kopi 0x7026c2–0x702f1a: som 'move', men straffens moral rand(Pressure)/−rand(10) (0x702b4f/0x702b64 –
   *  'move' har rand(Pressure + 6)/−rand(8), 0x6f176a/0x6f177e), ingen 0x21d9/0x21da-gren (0x6f1955) og param 4 (straffesparkskonkurrencen)
   *  → RESTART_PENALTY og straffesparket med det samme (0x7028ba–0x702922; død vej – udfordringen springes over ved param 4). */
  /** De øvrige kopier (alle med samme forseelses-/korttabeller som 'move' – kontrolleret 0x70013c, 0x6f9dfc, 0x71029c, 0x70016c/0x6f9e2c/
   *  0x6f9ea4/0x7102cc): 'pass' sub_6fad40 0x6fb69a–0x6fc07e (straffens moral rand(Pressure)/−rand(10) 0x6fbc07/0x6fbc19; dykindberetningen
   *  0x6fb8bd–0x6fba46 som i 'move', ikke med), 'receive' sub_6f6c00 0x6f7b4e–0x6f8395 (udfordreren C mod modtageren R; moral som 'pass',
   *  0x6f7f26/0x6f7f38), 'receiveR' 0x6f84d0–0x6f8cea (modtageren R mod C: tabel 0x6f9e6c giver også kode 0x38 → 0x1ff3; boldens felt og
   *  straffefeltet er synderens (esi, 0x6f86ff/0x6f8743); ingen 0x21d9/0x21da-gren; moral 0x6f88c3/0x6f88d5; frisparkets chance efter
   *  SKYTTENS felt (ebp, 0x6f8a62–0x6f8b4e) og synderens x; offerets reaktion: +0x16 på OFFERET (edi) ved kode 4/5/6 (0x6f8bd8), 0x20d9 ved
   *  rand(3) ≠ 0 (0x6f8bf7) hhv. rand(2) ≠ 0 (0x6f8c9f) – omvendt af de andre kopier), 'hold' sub_70ec80 0x70ef71–0x70f783 (ingen moral ved
   *  straffe, 0x70f33b → 0x70f1e0). Alle kopier kalder sub_6bb8d0(synderen, vægten) før sub_716e10 (0x6fc070, 0x6f8387, 0x6f8cdc, 0x70f775,
   *  0x6f1dd0). */
  type FoulSite = 'move' | 'pass' | 'receive' | 'receiveR' | 'hold' | 'shot' | 'other';
  const foul = (d: GP, p: GP, j: JudgeResult, c: ChallengeOut, site: FoulSite = 'other', shotParam = 1) => {
    dbg('foul:' + c.type);
    const r = decideFoulPunishment(rand, { minute: minute(), shootout: !!m.shootout, addTeamFoul: () => { st(d.side).fouls++; } }, d, p, j.ret, j.kind, j.severity, c.clear, j.hurt);
    const cm = site !== 'other', outcome = r.code, red = outcome >= 3 && outcome <= 6, rR = site === 'receiveR';
    const bx = rR ? d.x : p.x, by = rR ? d.y : p.y;                                           // 'receiveR' 0x6f86ff/0x6f8743: synderens felt
    let ev2 = -1;
    if (cm) {
      comment(rR && c.type === 0x38 ? 0x1ff3 : foulEvent(c.type), d, d.side, p, p.side, 0);  // 0x6f1619 / 0x7028b5 / 0x6fb856 / 0x6f7d0a / 0x6f868a / 0x70f12d
      if (site === 'shot' && shotParam === 4) {                                               // 0x7028ba: straffesparkskonkurrencen
        comment(0x1f7a, null, p.side, null, -1, 0);                                           // 0x7028dd RESTART_PENALTY
        const sc = shotScore(shotCtx(p), rand, SHOT.PENALTY);                                // 0x702901 sub_700bd0(type 0x33)
        if (sc.quality !== undefined) p.w39 = sc.quality;                                      // straffesparket (0x700d20) skriver ikke +0x39
        doTakeShot(p, SHOT.PENALTY, sc.score, sc.event, 4, 0, []);                           // 0x702922 sub_702050(0x33, S, a3, 4, 0, 0)
        return;
      }
      ev2 = cardEvent(outcome);
      // 0x6f1655 / 0x702967 TICKING_OFF: rand(7) + 2 < sværheden (judge_tackle's &sværhed – [esp+0x40] / [esp+0x74]; før stod arten her)
      if (ev2 === -1 && j.severity > rand(7) + 2) ev2 = 0x210a;
    }
    let ev = 0x1f79;                                                                          // RESTART_FREEKICK
    if (outcome === 7) restart(7, p.side, bx, by);                                          // indirekte frispark
    else if (inBoxAt(d.side, bx, by)) {                                                     // straffe (0x6f16ea)
      if (cm && ev2 === -1) { const r4 = rand(4); if (r4 === 0) comment(0x20e9, null, p.side, null, -1, 0); else if (r4 === 1) comment(0x20ec, null, p.side, null, -1, 0); }
      ev = 0x1f7a;
      d.rating -= 500; m.penaltyFor = p;
      if (site === 'shot' || site === 'pass' || site === 'receive' || site === 'receiveR') {   // 0x702b54 / 0x6fbc07 / 0x6f7f26 / 0x6f88c3
        if (rand(d.pressure) === 0 && adjustMorale(d, -rand(10), rand)) recompute(d);   // sub_7172d0 → sub_6eecb0(0)
      } else if (site !== 'hold') {                                                           // 'hold': ingen (0x70f33b)
        if (rand(d.pressure + 6) === 0 && adjustMorale(d, -rand(8), rand)) recompute(d);   // 0x6f1772/0x6f1780/0x6f179a
      }
      restart(5, p.side, 4, d.side === 0 ? 1 : 10);
      if (cm) comment(0x1f7a, null, p.side, null, -1, 0);                                     // 0x6f17bd RESTART_PENALTY
    } else restart(6, p.side, bx, by);
    if (!cm) {
      if (outcome === 2) st(d.side).yellows++;
      else if (red) { st(d.side).reds++; sendOff(d); }                                        // send_off (sub_6cda20)
      d.rating -= 25;
      return;
    }
    if (ev2 > -1) {
      if (site === 'move' || site === 'pass') newsSendOff(d, p, outcome, j.kind);           // 0x6f17c2–0x6f1950 / 0x6fb8bd–0x6fba46 (avisens historie)
      if (site !== 'shot' && !rR && (c.type === 0x2c || c.type === 0x2f) && j.hurt) {         // 0x6f1955 / 0x6fbb17 / 0x6f7e38 / 0x70f25b (ikke i skuddets eller R's kopi)
        comment(c.type === 0x2f ? 0x21da : 0x21d9, p, p.side, d, d.side, 0);
        if (red || ev === 0x1f7a) d.b16 = 1;
      }
      if (rand(4) === 0) { randS(rand, j.severity); rand(20); comment(0x2109, d, d.side, null, -1, 0); }   // 0x6f19d0 (a > b: klubtype 8 → 0x20f5, ukendt → nej)
      comment(ev2, d, d.side, null, -1, 0);                                                   // 0x6f1aa0
      if (outcome === 2) st(d.side).yellows++;
      if (red) { st(d.side).reds++; sendOff(d); }                                             // 0x6f1ac2 sub_6cda20
      if (outcome >= 2 && outcome <= 6) on?.card?.(d, outcome, true);
    }
    if (ev !== 0x1f7a) {                                                                      // 0x6f1ac7: skytten (sub_6ceb90) og frisparkets chance
      const taker = GRID_UNKNOWN.pickTaker(m, p.side, outcome === 7 ? 7 : 6, rand) as GP | null;
      if (taker && outcome === 7) comment(0x21e2, taker, p.side, null, -1, 0);               // RESTART_INDIRECT_FREEKICK
      else comment(ev, null, p.side, null, -1, 0);
      if (taker && !j.hurt) {
        const z = rR ? taker : p;                                                             // 'receiveR' 0x6f8a62: skyttens felt
        const zone = z.side === 1 ? z.y < 4 : z.y > 7;
        if (outcome === 7) { if (zone && !inBoxAt(d.side, z.x, z.y)) comment(0x21e1, taker, p.side, null, -1, 0); }
        else if (zone) comment(!(bx >= 2 && bx <= 6) ? 0x21df : 0x21e0, taker, p.side, null, -1, 0);   // FREE_KICK_CHANCE_WIDE/CENTRAL (x: offerets, R's: synderens)
      }
    }
    if (!isHardChallenge(c.type)) {                                                           // 0x6f1c5f
      const o = other(p.side);
      if (j.hurt) {
        comment(0x20dd, p, p.side, null, -1, 0);                                             // LOOKED_LIKE_A_DIVE
        if (rR) { if (outcome === 4 || outcome === 5 || outcome === 6) p.b16 = 1; }           // 0x6f8bd8: offerets +0x16 (sic)
        else if (outcome === 4 || outcome === 5) d.b16 = 1;
        if ((red || ev === 0x1f7a) && (rR ? rand(3) !== 0 : rand(2) === 0)) comment(0x20d9, null, o, null, -1, 0);   // 0x6f8bf7: rand(3) ≠ 0
      } else if (rand(9) === 0) {
        comment(0x20df, null, o, null, -1, 0);
        if (rand(3) === 0) comment(0x20e0, null, o, null, -1, 0);
        if ((red || ev === 0x1f7a) && (rR ? rand(2) !== 0 : rand(2) === 0)) comment(0x20d9, null, o, null, -1, 0);   // 0x6f8c9f: rand(2) ≠ 0
      }
      agitateTeam(d, r.weight);                                                               // sub_6bb8d0 (0x6f1dd0 / 0x6fc070 / 0x6f8387 / 0x6f8cdc / 0x70f775 / 0x702efd)
      reactToFoul(d);                                                                         // sub_716e10
    }
    d.rating -= 25;
  };
  /** sub_70d430 (sikker): keeperen griber (1) eller taber bolden (0). post +0x21 = Consistency ("?" – postens alfabetiske rækkefølge). */
  const gkCatch = (d: GP, diff: number): boolean => {
    if (diff > 1000) return true;
    if (rand(Math.trunc(d.consistency + d.f.handling)) >= rand(20)) return true;
    const drop = (spread: number) => {                                                        // rand(10) ≠ 0: inden for banen; ellers evt. med spiller
      if (rand(10) !== 0) ballLoose(d.x, d.y, spread, d.side, true, null);
      else ballLoose(d.x, d.y, spread, d.side, false, rand(200) !== 0 ? null : d);
    };
    if (d.roll.decisions > rand(8)) { d.busy += rand(2); drop(3); return false; }
    d.busy += rand(3); drop(1); d.rating -= 250;
    if (rand(30 * d.pressure + 20) === 0 && adjustMorale(d, -rand(3), rand)) recompute(d);   // 0x70d5ee
    return false;
  };
  /** Udfordreren vinder bolden (sub_6f09f0 0x6f1f0d–0x6f283a; skuddets 0x702f35–; afleveringens §5.3). rel = værdien til momentum.
   *  ownRating: boldholderens karakterfradrag (kun move_to). */
  /** sub_716c90 advantage_foul (sikker): kommentar 0x20dd, kort uden offer til p (sub_6cfd40 → sub_6eab60, art 6), kortets kommentar valgt
   *  med rand(8)/rand(3) (klubtype-kommentaren 0x20f5 udeladt – klubpostens +0x77 kendes ikke), udvisning ved kode 3/4. */
  const advantageFoul = (p: GP) => {
    dbg('advFoul');
    comment(0x20dd, p, p.side, null, -1, 0);                                                  // 0x716cba PLAYER_INJURED_BY_OPPONENT
    const code = cardWithoutVictim(rand, m.official, p, 6, minute());
    const id = code === 3 ? 0x1ff7 : code === 2 ? 0x1ff9 : code === 4 ? 0x1ff8 : code === 9 ? 0x210a : -1;   // tabel 0x716df0
    if (id >= 0) {
      if (rand(8) !== 0) { rand(3); comment(0x2109, p, p.side, null, -1, 0); }               // 0x716d0a (rand(3) ≠ 0: klubtype 8 → 0x20f5, ukendt → nej)
      comment(id, p, p.side, null, -1, 0);
    }
    if (code === 2) st(p.side).yellows++;
    else if (code === 3 || code === 4) { st(p.side).reds++; sendOff(p); }                      // sub_6cda20
    if (code >= 2 && code <= 4) on?.card?.(p, code, true);
  };
  /** "Flot forsvarsspil" (sub_6f09f0 0x6f24d6–0x6f267e; samme blok i afleveringen 0x6fc6b8, modtagelsen 0x6f9310, holdebolden 0x70fd99 og
   *  opsnapningen 0x6f6835): rand(20) + 55 (hovedstød 0x15) / + 65 mod minuttet, holdet har ikke lukket mål ind (engine+0xf5bd/+0xf5f3 = side 0's
   *  / side 1's mål), andelen vundne > 0,725, karakter > 6750 og kun én gang (+0xfd). +7/+8/+9 tælles i
   *  hovedstødsdueller i sub_6f6c00 (b7/b8/b9). */
  const praise = (d: GP, p: GP, code: number) => {
    const mn = (Math.trunc(m.clock / 11) << 24) >> 24;
    const conceded = m.goals[other(d.side)];
    if (code === 0x15) {                                                                     // hovedstødsdueller +7/+8/+9
      const ratio15 = d.b7 ? d.b8 / d.b7 : 0;
      const r = rand(20) + 0x37;
      if (mn <= r || conceded !== 0 || ratio15 <= 0.725 || d.b8 <= 3 || !d.b9 || d.rating <= 0x1a5e || d.bfd) return;
      comment(0x21ce, d, d.side, p, p.side, 0); d.bfd = 1;                                   // 0x6f25c6 DEFENDER_SOLID_IN_AIR
      return;
    }
    const ratio = d.tacklesTried ? d.tacklesWon / d.tacklesTried : 0;                         // +5 / +4
    const r = rand(20) + 0x41;
    if (mn <= r || conceded !== 0 || ratio <= 0.725 || d.b6 <= 1 || d.rating <= 0x1a5e || d.bfd) return;
    comment(0x21cd, d, d.side, p, p.side, 0); d.bfd = 1;                                     // 0x6f2679 POOR_DEFENSIVE…/DEFENDER_SOLID_AS_A_ROCK
  };
  /** Udfordreren vinder bolden – tre kaldere med hver sin kopi af koden: 'move' sub_6f09f0 0x6f1f0d–0x6f2835, 'pass' sub_6fad40 0x6fc12c–0x6fc988,
   *  'shot' sub_702050 0x702f35–0x70352f. Kommentarerne: i eget felt (rand(2) == 0) forseelsens begivenhed og straffeappellen (rand(50), tre
   *  forskellige tabeller), ellers typens (0x15/0x2e med rand(6) i 'pass'/'shot'); 'move'/'pass' roser forsvarsspillet (rand(20)); til sidst
   *  BALL_GOES_LOOSE ved løs bold og rand(7) == 0. arg4 = sub_6f09f0's frie løb ('move': +300 som ved sidste mand). */
  const winBall = (d: GP, p: GP, c: ChallengeOut, rel: number, jA: boolean, site: 'move' | 'pass' | 'shot', adv = false, arg4 = 0) => {
    const ownRating = site === 'move';
    let perType = true;
    // boks-kommentaren: kun ved hård type, "hurt" eller rand(w31) < −10 (C'en 0x6f1f39 – noten har tegnet vendt); den springer typens gren over
    if (isHardChallenge(c.type) || jA || randS(rand, d.w31) < -10) {
      if (inBoxAt(d.side, d.x, d.y) && rand(2) === 0) {
        comment(foulEvent(c.type), d, d.side, p, p.side, 0);                                  // 0x6f1fbb / 0x6fc1e8 / 0x702f8c
        const r = rand(50);
        const id = site === 'move' ? (r === 1 ? 0x20ea : r <= 10 && r % 2 === 0 ? 0x20eb : 0x20e8)   // tabel 0x6f440c
          : site === 'pass' ? (r === 1 ? 0x20ea : r <= 5 ? 0x20eb : 0x20e8)                    // tabel 0x700228
          : r === 0 ? 0x20eb : r === 1 ? 0x20ea : 0x20e8;                                      // 0x70314a
        comment(id, null, other(d.side), null, -1, 0);                                        // PENALTY_APPEAL_TURNED_DOWN m.fl.
        perType = false;
      }
    }
    if (perType) {
      if (c.type === 1) { if (!gkCatch(d, rel + 200)) return; }
      else {
        const t = c.type;
        let id = t === 0x29 ? 0x1f61 : t === 0x13 || t === 0x21 || t === 0x2d ? 0x1f62 : t === 0x22 || t === 0x2c ? 0x2150 : t === 0x2a || t === 0x2b ? 0x1f64 : -1;
        if (site !== 'move' && (t === 0x15 || t === 0x2e)) {                                  // 0x6fc4a8 / 0x70328c
          const r = rand(6);
          id = Math.fround(Math.fround(r + d.f.jumping) + 3) < p.f.jumping ? 0x2164 : 0x1f5d;
        }
        if (id >= 0) comment(id, d, d.side, p, p.side, 0);
      }
    }
    takeBall(d);
    if (ownRating) {
      if (inBoxAt(p.side, p.x, p.y)) { p.rating -= 250; if (rand(30 * p.pressure + 20) === 0 && adjustMorale(p, -rand(3), rand)) recompute(p); }
      else if ((p.side === 0 && p.y < 3) || (p.side === 1 && p.y > 8)) p.rating -= 100;
      else p.rating -= 20;
    }
    d.momentum = Math.max(-200, Math.min(200, rel));
    let loose = false;
    const thr = c.type === 19 ? 400 : c.type === 33 || c.type === 45 ? 250 : 100;
    if (d.momentum < thr && m.ballH !== 4 && m.ballH !== -1) {
      ballLoose(p.x, p.y, 1, d.side, false, null);                                            // sub_6cd770(x, y, 1, side, 0, 1, 0)
      if (m.state === 0) {
        const a = d.roll.workRate > rand(10) ? 1 : 0, b = d.roll.agility > rand(10) ? 1 : 0;
        d.busy = rand(3 - a - b); loose = true;
      } else if (adv) advantageFoul(p);                                                       // 0x6f2430
    } else if (!(site === 'pass' && m.ballH >= 4)) {                                          // 'pass' 0x6fc626: høj bold → ingen vending/ros
      if (m.ballH >= 0 && m.ballH <= 3) m.ballH = 0;
      P.turnTo(d, p.x, p.y, 4, d.side === 0 && m.ballH !== -1 ? Math.min(p.y + 3, 11) : Math.max(p.y - 3, 0));   // sub_6f4920
      if (site !== 'shot') praise(d, p, c.type);                                              // 0x6f24d6 / 0x6fc6b8
    }
    d.tacklesWon++;
    const defender = (d.pos & 4) !== 0 || (d.pos & 2) !== 0;
    let gain = defender ? (loose ? 120 : 200) : loose ? 240 : 400;
    if (site === 'move' && p.y >= 3 && p.y <= 8) gain = Math.trunc(gain * 0.85);             // 0x6f26e7 (kun boldholderens løb)
    d.rating += gain;
    if (site === 'move') {
      if (arg4 || L.dist(d.x, d.y, 4, d.side === 0 ? 0 : 11) <= 1 || L.isLastMan(m, d)) {   // 0x6f2737
        d.rating += 300; d.b6++;
        if (rand(30 * d.morale + 50) === 0 && adjustMorale(d, rand(5), rand)) recompute(d);
      }
    } else if (site === 'pass') {                                                             // 0x6fc8db: kun tælleren +6, når afleveren havde plads
      if ((L.dist(d.x, d.y, 4, d.side === 0 ? 0 : 11) <= 1 || L.isLastMan(m, d)) && p.w29 > 0) d.b6++;
    } else if (inBoxAt(other(p.side), p.x, p.y)) d.b6++;                                       // 'shot' 0x7034e9: skytten i feltet (sub_6f5b20)
    p.busy += c.delayCarrier;
    if (loose && rand(7) === 0) comment(0x1f41, d, d.side, null, -1, 0);                    // 0x6f2828 / 0x6fc977 / 0x70352a BALL_GOES_LOOSE
    dbg(loose ? 'win:loose' : 'win');
  };
  /** CHALLENGER_FAILED (0x6f1e59): udfordreren gik ind uden frispark. */
  // ---------------------------------------------------------------- fordelsreglen (notes/advantage-knock.md §A; sikker, kommentarerne udeladt)
  /** sub_6bb9a0: læg hændelsen, hvis ingen venter */
  const queueIncident = (type: number, d: GP, p: GP | null, res: number, x: number, y: number, jC: number, jB: number) => {
    if (!m.inc) m.inc = { type, d, p, res, x, y, jC, jB, b: 0 };
  };
  /** sub_6bac40: dommeren går tilbage til hændelsen. true = han dømte (tikket slutter). */
  const applyIncident = (): boolean => {
    const i = m.inc;
    if (!i || !i.res) return false;
    const v = victimSide(i), d = i.d;
    if (m.state !== 0 && m.poss === v && pastSpot(m, i)) { m.inc = null; return false; }
    if (m.state !== 0) comment(0x20f0, null, d.side, null, -1, 0);                           // 0x6bad01 RESTART_PREVIOUS_INCIDENT (død bold)
    if (i.res === 8) {                                                                        // offside, der ventede
      comment(0x20ee, d, d.side, null, -1, 0);                                                // 0x6bad31 RESTART_OFFSIDE_PAST_TENSE
      st(d.side).offsides++;
      m.inc = null; restart(7, v, i.x, i.y); m.inc = null; return true;
    }
    // sub_6bac40 0x6bada4–0x6bb772 (sikker). +0x475d = i.jC, +0x475e = i.jB (sværheden – også hands' sværhed, pass.ts lægger den der).
    const inAtt = i.x >= 2 && i.x <= 6 && (v === 0 ? i.y >= 10 : i.y <= 1);                   // synderens eget felt (0x6bae7b / 0x6bb442)
    let code: number, weight: number;
    if (!i.p) {                                                                               // hands (0x6badba)
      code = P.handsPunish(d, i.jB, i.jC, i.b !== 0); weight = handsWeight(code);             // 0x6baddc sub_6e9630(d, &kode, +0x475d, +0x475e, +0x4769)
      comment(0x20fb, d, d.side, null, -1, 0);                                                // 0x6bae01 HAND_BALL_PAST_TENSE
    } else {
      const r = decideFoulPunishment(rand, { minute: minute(), shootout: !!m.shootout, addTeamFoul: () => { st(d.side).fouls++; } }, d, i.p, i.res as 0 | 1 | 7, i.jC, i.jB, i.b !== 0, false);
      code = r.code; weight = r.weight;                                                       // 0x6bb1bf sub_6ea4e0
      comment(pastFoulEvent(i.type), d, d.side, i.p, i.p.side, 0);                            // 0x6bb3c8 (tabel 0x6bb848)
    }
    const red = code >= 3 && code <= 6;
    let ev2 = i.p ? cardEvent(code)                                                           // tabel 0x6bb878 (2..5)
      : code === 2 ? 0x1ff9 : code === 3 ? 0x1ff7 : code === 4 ? 0x1ff8 : code === 6 ? 0x1ff5 : -1;   // tabel 0x6bb7bc (hands, 2..6)
    if (ev2 === -1 && i.jB > rand(7) + 2) ev2 = 0x210a;                                       // 0x6bae38 / 0x6bb3ff TICKING_OFF
    let ev = 0x1f79;
    if (code === 7) restart(7, v, i.x, i.y);
    else if (inAtt) {
      restart(5, v, 4, v === 0 ? 10 : 1); ev = 0x1f7a;
      if (i.p) { m.penaltyFor = i.p; i.p.rating -= 500; }                                     // 0x6bb724/0x6bb72f: OFFERETS karakter (sic)
      else { m.penaltyFor = null; d.rating -= 500; }                                          // 0x6bb150/0x6bb15a
      comment(0x1f7a, null, v, null, -1, 0);                                                  // 0x6baf03 / 0x6bb4c9 RESTART_PENALTY
    } else restart(6, v, i.x, i.y);
    if (ev2 > -1) {
      if (rand(4) === 0) { randS(rand, i.jB); rand(20); comment(0x2109, d, d.side, null, -1, 0); }   // 0x6baf12 / 0x6bb4d8 (klubtype 8 → 0x20f5: ukendt → nej)
      comment(ev2, d, d.side, null, -1, 0);                                                   // 0x6baf99 / 0x6bb55f
      if (code === 2) st(d.side).yellows++;
      if (red) { st(d.side).reds++; sendOff(d); }                                             // 0x6bafc5 / 0x6bb58b sub_6cda20
      if (code >= 2 && code <= 6) on?.card?.(d, code, true);
    }
    if (ev !== 0x1f7a) comment(ev, null, v, null, -1, 0);                                     // 0x6baff0 / 0x6bb5b1 RESTART_FREEKICK (ingen skytte)
    if (!isHardChallenge(i.type)) {                                                           // tabel 0x6bb7d8 / 0x6bb890 = sub_6cb650's koder → slut
      if (rand(9) === 0) {                                                                    // 0x6bb013 / 0x6bb5d4
        comment(0x20df, null, d.side, null, -1, 0);
        if (rand(3) === 0) comment(0x20e0, null, i.p ? v : d.side, null, -1, 0);              // hands: synderens side; ellers (sete) offerets
        if (red || ev === 0x1f7a) {
          d.b16 = 1;                                                                          // 0x6bb099 / 0x6bb664
          if (rand(7) === 0) comment(0x20d9, null, i.p ? v : d.side, null, -1, 0);
        }
      }
      agitateTeam(d, weight);                                                                 // 0x6bb0cb / 0x6bb69b (sub_6bb8d0's løkke)
      reactToFoul(d);                                                                         // 0x6bb76d sub_716e10
    }
    m.inc = null; return true;
  };
  // ---------------------------------------------------------------- optøjer ved død bold (sub_6d1210 / sub_716630; sikker, kommentarerne udeladt)
  /** sub_7164b0 temperCheck(level, target): m = 8 mod hans "nag" (+0x1a6), ellers 1; a = ftol(ag²); niveau 1: rand(110 − s8(ftol(ag))) < m,
   *  2–5: rand(ftol(4e5|2e6|4e6|8e6 / a)) < m. Tomme pladser i truppen (bænken findes ikke her) har ag = 0 (ctor 0x6eadee). */
  const temperCheck = (p: GP | null, level: number, target: GP | null): boolean => {
    const ag = p ? p.agitation : 0, mm = p && target && target === p.grudge ? 8 : 1, a = Math.trunc(crtPow(ag, 2));   // 0x7164d6 pow(ag, 2,0)
    if (level === 1) return rand(110 - ((Math.trunc(ag) << 24) >> 24)) < mm;
    const k = level === 2 ? 400000 : level === 3 ? 2000000 : level === 4 ? 4000000 : level === 5 ? 8000000 : 0;
    return k ? rand(Math.trunc(k / Math.max(a, 1))) < mm : false;
  };
  /** sub_716450 (sikker): ag = min(max(ag·f, gulv), 100) */
  const scaleAg = (q: GP, f: number) => { q.agitation = Math.min(Math.max(Math.fround(q.agitation * f), 2 * (25 - q.temperament)), 100); };
  interface Fight { d: GP; v: GP; sev: number; code: number; kind: number }
  const fights: Fight[] = [];                                                                   // engine+0xb1.. (højst 5), antal +0x1a3
  let b8eb4 = 0;                                                                                // engine+0x8eb4
  /** sub_716630(p, depth) (sikker): gengældelse mod en modstander i p's felt – niveau 4 (0x31), 3 (0x61 ved rand(300) < 10, ellers rand(10):
   *  0x32/0x30/0x2f) eller 2 (0x60/0x5f); modstanderens ag ×(4 − 0,16·Temp) (niveau 2: ×(3,1 − 0,1·Temp)); andre med temperCheck(1) løber
   *  til; dommeren judge_tackle(p, o, kode); hændelsen lægges (eller sværhedsgraden lægges til p's tidligere); o gengælder (depth + 1).
   *  Klubtypen club+0x77 == 8 (rand(1000) i stedet for rand(300)) kendes ikke → nej. sub_6bb950 (holdets ophidselse) er ikke læst. */
  const retaliate = (p: GP, depth: number): boolean => {
    const opps = cellListOf(m, p.x, p.y, other(p.side)).slice();                                // feltets liste (0x716630)
    let o: GP | null = null, code = 0;
    for (const q of opps) {
      if (temperCheck(p, 4, q)) { code = 0x31; scaleAg(q, 4 - 0.16 * q.temperament); o = q; break; }
      if (temperCheck(p, 3, q)) {
        if (rand(300) < 10) code = 0x61;
        else { const r = rand(10); code = r <= 3 ? 0x32 : r <= 8 ? 0x30 : 0x2f; }
        scaleAg(q, 4 - 0.16 * q.temperament); o = q; break;
      }
      if (temperCheck(p, 2, q)) { code = rand(2) !== 0 || p.action === 0x5f ? 0x60 : 0x5f; scaleAg(q, 3.1 - 0.1 * q.temperament); o = q; break; }
    }
    if (!o) return false;
    dbg('fight:' + code.toString(16));
    p.action = code;
    if (depth > 1 && rand(5) !== 0 && rand(3) + 2 <= fights.length) depth = -50;              // 0x716a20: kommentar 0x210c, depth = 0xce
    for (const q of gp) if (q.active && q.slot <= 10 && q.busy < 2 && q !== p && temperCheck(q, 1, null)) setPos(m, q, p.x, p.y);   // sub_6f46b0
    const j = judge(p, o, code, -1);
    if (j.ret !== 0) {
      const f = fights.find((x) => x.d === p);
      if (f) f.sev += j.severity;
      else if (fights.length < 5) fights.push({ d: p, v: o, sev: j.severity, code, kind: j.kind });
    }
    if (((depth < 10 && depth >= 0) || depth < -40) && fights.length < 5) retaliate(o, depth + 1);
    return true;
  };
  /** sub_6d1210(0): hændelserne afgøres ved næste døde bold – sub_6ea4e0 (kort), udvisning; ophidselsen spredes på synderens hold kun for
   *  0x5f-typen (tabellen 0x6d1724). Kommentarerne og deres rand er udeladt, sub_716e10 (protester) og omorganiseringen efter et rødt kort
   *  (0x6d1584–) er ikke porteret. */
  const settleFights = () => {
    for (const f of fights) {
      const r = decideFoulPunishment(rand, { minute: minute(), shootout: !!m.shootout, addTeamFoul: () => { st(f.d.side).fouls++; } }, f.d, f.v, 1, f.kind, f.sev, false, false);
      if (r.code === 2) st(f.d.side).yellows++;
      if (r.code === 3 || r.code === 4) { st(f.d.side).reds++; sendOff(f.d); }
      dbg('fightCard' + r.code);
    }
    fights.length = 0;
  };
  /** run_match_steps 0x6b9aea–0x6b9cab (sikker): 0x8eb4 = 1 → hændelserne afgøres (tikket slutter); ved død bold vælges en tilfældig af de
   *  2×20 i truppen (rand(2), rand(20), højst 20 forsøg; uden for banen: temperCheck(1) – lykkes den, opgives runden) → sub_716630. */
  const blockOf: [GP[], GP[]] = [gp.filter((q) => q.side === 0), gp.filter((q) => q.side === 1)];   // holdenes spillerblokke i indeksrækkefølge
  const deadBallTemper = (): boolean => {
    if (b8eb4 === 1) { settleFights(); b8eb4 = 2; return true; }
    // run_match_steps 0x6b9b64–0x6b9bbc: afsparkets kommentar én gang pr. afspark (+0x1ca), golden goal +0x1a8 ikke med:
    // START_MATCH (0x212f) ved uret ≤ 1, ellers KICK_OFF (0x1f74), side = +0x8eae; trinnet fortsætter (0x6ba743 → 0x6b9aea)
    if (!kickCommented && m.state === 8) { comment(m.clock <= 1 ? 0x212f : 0x1f74, null, m.poss); kickCommented = true; }
    if (m.state !== 0 && b8eb4 === 0 && !m.paused) {
      for (let n = 0; n < 20; n++) {
        // 0x6b9c13–0x6b9c39: rand(20) er INDEKSET i sidens spillerblok (engine+0x4796 + (20·side + i)·0x1be), ikke pladsen; plads < 0 →
        // temperCheck(1) med hans egen agitation (bænken har sin)
        const side = rand(2) as Side, idx = rand(20);
        const p = blockOf[side][idx] ?? null;
        if (!p || p.slot < 0) { if (temperCheck(p, 1, null)) break; continue; }
        retaliate(p, 0);
        if (fights.length) { b8eb4 = 1; return true; }
        break;
      }
    }
    if (b8eb4 === 2) b8eb4 = 0;
    return false;
  };
  /** run_match_steps 0x6b9cb1–0x6b9db5 (sikker): død bold – glem hændelsen, når offerets hold har bolden forbi stedet, ellers 1/5 for at
   *  dømme; bolden i spil – 1/7 pr. tik for at kalde fordelen tilbage */
  const incidentTick = (): boolean => {
    const i = m.inc;
    if (!i || !i.res) return false;
    if (m.state !== 0) {
      if (m.carrier && m.carrier.side === victimSide(i) && pastSpot(m, i)) { m.inc = null; return false; }
      return rand(5) === 0 && applyIncident();
    }
    if (rand(7) !== 0) return false;
    comment(0x20ef, null, other(i.d.side), null, -1, 0);                                      // 0x6b9da1 WHISTLE_GONE_FOR_PREVIOUS_INCIDENT
    return applyIncident();
  };
  /** sub_6bba80 (sikker for sideeffekten): før skuddet bruges fordelen, medmindre synderens hold har bolden, det er en straffesparksforseelse,
   *  eller rand(200) = 0. Returværdien (1/2) går til skudrutinen og er ikke afkodet – kun rydningen er med. */
  const advantageAtShot = (): number => {                                                   // returnerer skuddets param (0x6bbb49: 1, 0x6bbb4e: 2)
    const i = m.inc;
    if (!i || !i.res) return 1;
    if (m.poss === i.d.side) return 2;
    const v = victimSide(i);
    if (i.res !== 8 && i.x >= 2 && i.x <= 6 && (v === 0 ? i.y >= 10 : i.y <= 1)) return 2;
    if (rand(200) === 0) return 2;
    m.inc = null;
    return 1;
  };

  // ---------------------------------------------------------------- knock-tjekket 0x6cfe10 og skaden 0x6d0980 (notes/advantage-knock.md §B–C)
  // Spillerens skade fra konditionsmodulet (GP.inj: 0x62ed70/0x62ec00/0x62ece0) giver f = 6, kropsdelen og den dobbelte sværhed; uden modulet
  // ingen skade. Knock-listen 0x62be00 (recordKnock) fletter sværheden pr. spiller.
  // Faktorerne pr. udfordringstype: byte-tabellen 0x6d08b0 → 0x6d0884, double-konstanterne 0x96d440 … 0x968918 (standard 0,2)
  const KNOCK_K: Record<number, number> = { 1: 1 / 28, 12: 1 / 11, 19: 0.1, 21: 1 / 15, 33: 0.1, 34: 0.125, 41: 0.125, 42: 0.02, 43: 0.0625, 44: 5 / 9, 45: 0.1, 46: 0.1, 47: 10 / 21 };
  const prone = (q: GP) => q.src.attrs[ATTRS.indexOf('injuryProneness')] || 10;            // spillerpost +0x2d
  // Injury +0x28 (0x62be00): dagens knocks pr. spiller [kategori, sværhed] (s8). Listen tømmes hver dag (0x62b7b0), og en spiller spiller
  // højst én kamp om dagen, så kampens egen liste er den samme som konditionsmodulets.
  const knockList = new Map<GP, [number, number]>();
  const s8 = (v: number) => (v << 24) >> 24;
  const recordKnock = (q: GP, kind: number, sev: number): [number, number] => {             // 0x62be00 (skriver den flettede kind/sev tilbage)
    const n = knockList.get(q);
    if (!n) { knockList.set(q, [kind, sev]); return [kind, sev]; }
    if (n[0] === kind) n[1] = sev + n[1] > 100 ? 100 : s8(sev + n[1]);                      // 0x62bec3–0x62bf0f (movsx-summen > 100 → 100, ellers add byte)
    else if (sev > n[1]) { n[1] = sev; n[0] = kind; }                                        // 0x62bf24–0x62bf36 (cmp byte, med fortegn)
    return [n[0], n[1]];
  };
  const injure = (kind: number, sev: number, q: GP, o: GP | null) => {                       // 0x6d0980
    kind = s8(kind); sev = s8(sev);
    const n = m.knocks;
    if (n > 3 && rand(n) !== 0 && rand(500) !== 0) return;
    if (n > 6) return;
    if (kind > -1) {                                                                         // 0x6d09d5: kun kind > −1 registreres (sværheden er den flettede)
      (globalThis as { cmKnockHook?: (q: GP, kind: number, sev: number) => void }).cmKnockHook?.(q, kind, sev);   // game/cmFitness.ts' liste
      [kind, sev] = recordKnock(q, kind, sev);
    }
    dbg('knock');
    q.injuredBy = o; if (o) o.w31 -= 10;
    on?.knock?.(q);
    let Lc = 0;
    if (sev > 50) { q.b1c = 1; q.condition = Math.fround(q.condition - sev * sev); }       // 0x6d0a10
    else {                                                                                   // 0x6d0a28
      Lc = rand(Math.trunc(sev * sev * 0.5)); q.condition = Math.fround(q.condition - Lc);
      q.pendingCond = rand(Math.trunc(Lc * 0.5)); q.f.stamina = Math.fround(q.f.stamina * 0.5);   // +0x59, +0xd5
    }
    if (q.condition < 5000) { m.b8eb5 = 1; q.b1d = 1; q.b1c = 1; }
    else if (q.condition < prone(q) * 25 + 7100) { q.busy = 5; m.b8eb5 = 1; q.b1d = 1; }      // 0x7160e0(5)
    else { q.busy = 3; if (Lc >= 500 && q.b1c) { m.b8eb5 = 1; q.b1d = 1; } }               // 0x7160e0(3)
    q.condition = Math.fround(Math.max(1, Math.min(10000, q.condition)));
    if (m.b8eb5) m.knocks++;
  };
  const knockCheck = (A: GP, codeA: number, B: GP | null, codeB: number, offBall: boolean) => {   // 0x6cfe10
    const sevOf = () => { let v = rand(rand(102)); if (v > 50 && rand(3) !== 0) v = rand(rand(76)); return v; };
    const sev = [sevOf(), sevOf()], body = [-1, -1];                                         // bytes [esp+0x14]/[esp+0x12]
    // 0x6cfeb8–0x6cffba (A) og 0x6cffca–0x6d00d7 (B): f = 4 (6 med en skade, og så sværheden ×2 medmindre rand(25) = 0),
    // k = 10000/max(cond/2 + 5000, 1000)·f, Injury Proneness (B testes med A's, sic), og med en skade ×min(s/2 + 1,5, 3); f gemmes som float32
    const fit = (i: number, q: GP, proneTest: GP) => {
      let f = 4;
      if (q.inj.cat !== -1) {                                                                // 0x62ed70 ≠ NULL
        f = 6; body[i] = s8(q.inj.cat);
        if (rand(25) !== 0) sev[i] = s8(sev[i] << 1);
      }
      const c = Math.max(q.condition * 0.5 + 5000, 1000), k = (10000 / c) * f;
      const pr = prone(q);
      let r = Math.fround(prone(proneTest) > 10 ? pr * k * Math.fround(0.1) : ((pr - 10) * Math.fround(0.1) + 1) * k);
      if (q.inj.s) r = Math.fround(Math.min(q.inj.s * 0.5 + 1.5, 3) * r);
      return r;
    };
    const f = [fit(0, A, A), B ? fit(1, B, A) : 4];
    if (A.condition < 4000) { injure(-1, 0, A, null); return; }
    if (offBall) {                                                                           // 0x6d0107
      if (rand(50000) < Math.trunc(f[0] * 10)) {
        if (body[0] >= 1 && body[0] <= 5) injure(body[0], sev[0], A, null);                  // tabellen 0x6d0850
        else injure([1, 1, 1, 3, 3, 3, 4, 4, 2, 2, 5][rand(11)], sev[0], A, null);
      }
      return;
    }
    const P2 = [A, B], code = [codeA, codeB];
    for (let i = 0; i < 2; i++) {                                                            // 0x6d021e
      const q = P2[i], o = P2[1 - i];
      if (!q) continue;
      if (q === m.carrier && o) {
        f[i] = Math.fround(o.f.strength * (KNOCK_K[code[1 - i]] ?? 0.2) * f[i]);              // modspillerens Strength +0xd9
        if (code[1 - i] === 44 || code[1 - i] === 47) sev[i] = s8(sev[i] << 1);
        if (code[1 - i] === 34) sev[i] = s8(Math.trunc(sev[i] * 1.1));
      }
      if (code[i] === 5) f[i] = Math.fround((10 / Math.max(q.f.agility, 2)) * f[i]);
      if (rand(50000) >= Math.trunc(f[i] * 10)) continue;
      if (code[i] === 5) {
        if (body[i] === 6 || body[i] === 9 || body[i] === 10) { injure(body[i], sev[i], q, null); return; }
        injure([9, 9, 9, 6, 10][rand(5)], sev[i], q, null); continue;
      }
      if (m.ballH === 4 && o) { injure(11, sev[i], q, o); continue; }
      if (!o) {
        if (body[i] >= 1 && body[i] <= 5) { injure(body[i], sev[i], q, null); return; }       // tabellen 0x6d08f4
        const r = rand(11);
        if (r === 6 || r === 7) { injure(2, sev[i], q, null); injure(5, sev[i], q, null); }   // manglende break, sic
        else injure([1, 3, 3, 3, 4, 4, 0, 0, 5, 1, 1][r], sev[i], q, null);
        continue;
      }
      if (body[i] >= 1 && body[i] <= 9) { injure(body[i], sev[i], q, o); return; }            // tabellen 0x6d0934
      injure(1 + rand(9), sev[i], q, o);
    }
  };

  // ---------------------------------------------------------------- holdebolden sub_70ec80 (notes/70ec80-hold.md; sikker, kommentarerne udeladt)
  const holdBall = (p: GP, waste = false) => {
    const tired = rand(Math.trunc(((10000 - Math.trunc(p.condition)) ** 2) / 50000));
    if (p !== m.carrier) return;
    if (waste) {                                                                               // 0x70ecee: tidsspild ved hjørneflaget (arg = 1, 0x711a42)
      for (const q of gp) if (q.side !== p.side) scaleAg(q, 2.25);                             // sub_6bb950(modstanderne, 2,25) → sub_716450
      m.touchCount[p.side] += 10;
    }
    const r = randS(rand, 50 * m.ballH);
    const vc = randS(rand, p.momentum - tired + p.skill[0x10] - r);
    const c = challenge(p, p.side, 0x10);
    const d = c.d;
    knockCheck(p, 0x10, d, c.type, false);
    const keeps = (vd: number) => {
      if (!inBoxAt(other(p.side), p.x, p.y) && randS(rand, p.w31) < -10) {
        p.agitation = Math.min(Math.max(p.agitation * 1.05, 2 * (25 - p.temperament)), 100);
        comment(0x211d, null, other(p.side), null, -1, 0);                                    // 0x7100ce BOO_SPECIFIC_PLAYER
      }
      m.lastTouch = p.side; m.touchCount[p.side]++; if (m.touchCount[other(p.side)] > 0) m.touchCount[other(p.side)] -= 10;
      p.momentum = Math.max(-200, Math.min(200, p.momentum + vc - vd));
      if (d) d.busy += c.delayChallenger;
      if (m.ballH !== -1 && p.action !== 0x10) {
        // 0x710177–0x71024e: HOLD_NEAR_CORNER_FLAG (tidsspild), HOLD_OFF_OPPONENT (udfordrer), ellers WAIT – WAIT_IN_SPACE kun uden
        // holdkammerater inden for 1,5 (sub_6c3a00(egen side, x, y, 1) tæller også spilleren selv → aldrig)
        let id: number;
        if (waste) id = 0x2133;
        else if (d) id = 0x216d;
        else if (p.pos & 1 || (p.side === 1 ? p.y < 3 : p.y > 8)) id = 0x1f40;
        else {
          let n = 0;
          for (const q of gp) { if (q.side !== p.side || !q.active || q.slot < 0 || q.pos === L.POS.keeper) continue; const dd = L.dist(q.x, q.y, p.x, p.y); if (dd === 0) n += 3; else if (dd <= 1.5) n++; }
          id = n === 0 ? 0x21de : 0x1f40;
        }
        comment(id, p, p.side, d, d ? d.side : -1, 0);
        m.ballH = 0;
      }
      dbg('hold:keeps');
    };
    if (!d) return keeps(0);
    let jA = false;
    if (!(c.value < vc && rand(5) !== 0)) {
      const j = judge(d, p, c.type, -1);
      jA = j.hurt;
      appeal(d, other(p.side), c.type, j.hurt, d);                                            // 0x70ee3d (den sete kamp)
      if (j.ret !== 0) {
        if (rand(30) === 0 && !c.clear) queueIncident(c.type, d, p, j.ret, p.x, p.y, j.kind, j.severity);   // 0x70ef39
        else { foul(d, p, j, c, 'hold'); return; }
      }
    }
    tried(d, c);
    if (vc > c.value) return keeps(c.value);
    // udfordreren vinder (0x70f80a) – som move_to, men uden holderens karakterfradrag, ×0,85 og sidste mand-bonussen
    let perType = true;
    if ((isHardChallenge(c.type) || jA || randS(rand, d.w31) < -10) && inBoxAt(d.side, d.x, d.y) && rand(2) === 0) {
      comment(foulEvent(c.type), d, d.side, p, p.side, 0);                                    // 0x70f8ac
      const r = rand(50);                                                                     // tabel 0x710388 (som sub_6f09f0's)
      comment(r === 1 ? 0x20ea : r <= 10 && r % 2 === 0 ? 0x20eb : 0x20e8, null, other(d.side), null, -1, 0);
      perType = false;
    }
    if (perType) {
      if (c.type === 1) { if (!gkCatch(d, c.value - vc)) return; }
      else {                                                                                  // tabel 0x7102f8
        const t = c.type;
        let id = t === 0x29 ? 0x1f61 : t === 0x13 || t === 0x21 || t === 0x2d ? 0x1f62 : t === 0x22 || t === 0x2c ? 0x2150 : t === 0x2a || t === 0x2b ? 0x1f64 : -1;
        if (t === 0x15 || t === 0x2e) id = Math.fround(Math.fround(rand(6) + d.f.jumping) + 3) < p.f.jumping ? 0x2164 : 0x1f5d;
        if (id >= 0) comment(id, d, d.side, p, p.side, 0);
      }
    }
    takeBall(d);
    d.momentum = Math.max(-200, Math.min(200, c.value - vc - 200));
    let loose = false;
    const thr = c.type === 19 ? 400 : c.type === 33 || c.type === 45 ? 250 : 100;
    if (d.momentum < thr && m.ballH !== 4 && m.ballH !== -1) {
      ballLoose(p.x, p.y, 1, d.side, false, null);
      if (m.state === 0) {
        const a = d.roll.workRate > rand(10) ? 1 : 0, b = d.roll.agility > rand(10) ? 1 : 0;
        d.busy = rand(3 - a - b); loose = true;
      }                                                                                        // ellers advantage_foul 0x716c90 (ikke læst)
    } else {
      if (m.ballH >= 0 && m.ballH < 4) m.ballH = 0;
      const ty = d.side === 0 && m.ballH !== -1 ? (p.y < 9 ? Math.min(p.y + 3, 11) : 11) : p.y > 3 ? p.y - 3 : 0;
      P.turnTo(d, p.x, p.y, 4, ty);
      praise(d, p, c.type);                                                                   // 0x70fd99
    }
    d.tacklesWon++;
    d.rating += d.pos & 6 ? (loose ? 120 : 200) : loose ? 240 : 400;
    p.busy += c.delayCarrier;
    if (loose && rand(7) === 0) comment(0x1f41, d, d.side, null, -1, 0);                    // 0x70ffe7 BALL_GOES_LOOSE
    dbg(loose ? 'hold:lostLoose' : 'hold:lost');
  };

  const tried = (d: GP, c: ChallengeOut) => { d.action = c.type; d.tacklesTried++; d.rating -= d.pos & 0x30 && d.pos & 0x880 ? 59 : 70; };

  /**
   * sub_6f09f0 MATCH_PLAYER::move_to for boldholderen (sikker fra 0x6f0ccf; notes/6f09f0-challenge.md). action 0xf/0x11/0x12.
   * stepTo = false: holdebolden (handling 0x10, sub_70ec80 er ikke læst) – *estimeret* som move_to med evnen 0xf og uden skridt.
   * Ikke modelleret: banens byte +1 (intet fradrag), konditionstabet for skridtet (0x6f3c88), markørerne der følger (sub_714d40).
   */
  /** sub_6c3950(side, x, y, 1) (sikker): mindste afstand fra (x, y) til sidens markspillere på banen (5000 uden; 0, hvis én står i feltet) */
  const nearestOf = (side: Side, x: number, y: number): number => {
    let best = 5000;
    for (const q of gp) {
      if (q.side !== side || !q.active || q.slot < 0 || q.pos & 1) continue;
      const dd = L.dist(q.x, q.y, x, y);
      if (dd === 0) return 0;
      if (dd < best) best = dd;
    }
    return best;
  };
  /** løbets beskrivelse uden udfordrer (sub_6f09f0 0x6f351c–0x6f392c og den samme kæde 0x6f2eac–0x6f3209 for 0x12): ind i feltet, til
   *  baglinjen, over midten, presset tilbage, ind fra kanten, til venstre/højre, tæt opdækket (rand(3)), og ellers "igen" (forrige handling
   *  0x11/0x12), i farezonen, ud fra forsvaret eller det almindelige løb. (nx, ny) = skridtets felt. */
  const runPath = (p: GP, nx: number, ny: number, prevAction: number) => {
    const s = p.side, cm = (id: number) => comment(id, p, s, null, -1, 0);
    const attBox = (x: number, y: number) => inBoxAt(other(s), x, y), wing = (x: number) => !(x >= 2 && x <= 6);   // sub_6cb910
    if (attBox(nx, ny) && !attBox(p.x, p.y)) return cm(0x1f50);                             // BRINGS_BALL_INTO_AREA
    if (wing(nx) && (s === 0 ? ny === 11 && p.y < ny : ny === 0 && p.y > 0)) return cm(0x2156);   // GETS_TO_THE_BYLINE_NEW
    if (s === 0 ? ny === 6 && p.y < 6 : ny === 5 && p.y > 5) return cm(0x1f51);              // CROSSES_HALFWAY_LINE
    if ((s === 1 ? p.y >= 6 : p.y < 6) && (s === 0 ? ny < p.y : ny > p.y)) return cm(0x1f54);   // FORCED_BACK (egen halvdel)
    if ((s === 1 ? p.y < 3 : p.y > 8) && wing(p.x) && !wing(nx)) return cm(0x1f4e);          // CUTS_INSIDE
    if (wing(nx) && (s === 0 ? nx < p.x && nx < 2 : nx > p.x && nx > 6)) return cm(0x1f52);  // TAKES_BALL_TO_LEFT
    if (wing(nx) && (s === 0 ? nx > p.x && nx > 6 : nx < p.x && nx < 2)) return cm(0x1f53);  // TAKES_BALL_TO_RIGHT
    const mk = (p.marker0 as GP | null | undefined) ?? null;                                   // +0x1ae[0] uden tælleren (0x6f37eb/0x6f30e5)
    if (mk && mk.x === p.x && mk.y === p.y && mk.roll.positioning > rand(3) && mk.busy < 2)
      return comment(0x2172, p, s, mk, other(s), 0);                                          // RUN_WITH_BALL_OPP_IN_CLOSE_ATTENTION
    if (prevAction === 0x12 || prevAction === 0x11) return cm(0x1f4c);                         // RUN_WITH_BALL_AGAIN
    if (attBox(p.x, p.y)) return cm(0x20d1);                                                  // RUN_WITH_BALL_IN_DANGER_AREA
    if (s === 0 ? p.y < 3 : p.y > 8) return cm(0x20d3);                                       // BRING_BALL_OUT_OF_DEFENCE (sub_6cb930)
    cm(0x20d2);                                                                               // RUN_WITH_BALL_NORMAL
  };
  /** forbi udfordreren (0x6f2c92–0x6f2db4 / 0x6f32c0–0x6f33e2): keeperen → rundt om ham (i/uden for feltet); ellers RUN_PAST_OPPONENT,
   *  med fart (acceleration > 15 eller 10 over udfordrerens) og rand(dribling) < rand(30) → RUN_PAST_OPPONENT_WITH_PACE */
  const pastEvent = (p: GP, d: GP) => {
    let id: number;
    if (d.pos !== L.POS.keeper) {
      id = 0x1f4a;
      if (p.f.acceleration > 15 || p.f.acceleration - d.f.acceleration > 10) { const r1 = rand(Math.trunc(p.f.dribbling)), r2 = rand(30); if (r1 < r2) id = 0x2173; }
    } else id = inBoxAt(other(p.side), p.x, p.y) ? 0x1f55 : 0x2158;
    comment(id, p, p.side, d, d.side, 0);
  };
  /** sub_6f09f0 0x6f2ba2–0x6f39aa (sikker): boldholderen beholder bolden – begivenheden efter handlingen 0xf/0x11/0x12 (før skridtet) */
  const keepEvents = (p: GP, d: GP | null, action: number, nx: number, ny: number, arg4In: number, arg5: number, prevAction: number) => {
    const s = p.side, opp = other(s);
    let arg4 = arg4In;
    const clean = (needRand: boolean) => {                                                    // 0x6f2df0 / 0x6f3415: fri bane mod målet
      if (nearestOf(opp, p.x, p.y) <= 1.5) return false;
      comment(m.teamFlags[opp] & 0x400 && (!needRand || rand(2) === 0) ? 0x20de : 0x1f45, p, s, null, -1, 0);   // BREAKS_THE_OFFSIDE_TRAP / CLEAN_THROUGH
      return true;
    };
    if (action === 0xf) { comment(d ? 0x1f49 : 0x1f48, p, s, d, d ? d.side : -1, 0); return; }   // 0x6f395b TURN_OPPONENT / TURN
    if (action === 0x12) {                                                                    // 0x6f2c46
      if (inBoxAt(opp, p.x, p.y) || arg5 === 4) arg4 = 0;
      if (d) { pastEvent(p, d); if (arg4 && (s === 1 ? p.y < 3 : p.y > 8)) clean(true); return; }
      runPath(p, nx, ny, prevAction);
      return;
    }
    // 0x11 (0x6f320e)
    if (inBoxAt(opp, p.x, p.y) || (s === 1 ? p.y >= 6 : p.y < 6)) arg4 = 0;
    if (arg5 === 4) { comment(prevAction === 0xf ? 0x20d2 : 0x2009, p, s, null, -1, 0); return; }   // 0x6f3270
    if (d) { pastEvent(p, d); if (arg4) clean(false); return; }
    if (arg4 && clean(false)) return;                                                         // 0x6f347d
    runPath(p, nx, ny, prevAction);
  };
  const carrierMove = (p: GP, tx: number, ty: number, action: number, arg4In: number, arg5: number, stepTo = true) => {
    // arg4 = sub_6cb780's frie løb ([esp+0x68] i sub_7109f0) og arg5 = sub_7109f0's eget argument for 0x11/0x12 (0x713b67/0x713b95); 0, 0 for 0xf
    let arg4 = arg4In;
    const prevAction = p.action;                                                              // +0x198 = den forrige handling (sættes efter kaldet)
    p.busy++;
    if (stepTo && p.x === tx && p.y === ty && action !== 0xf) { markersFollow(p); return; }      // 0x6f0a62
    const nx = clampX(p.x + Math.sign(tx - p.x)), ny = clampY(p.y + Math.sign(ty - p.y));
    const tired = rand(Math.trunc(((10000 - Math.trunc(p.condition)) ** 2) / 50000));
    // 0x6f0cff–0x6f0d43: arg4 (E+0x10, samme byte som 0x6f2737) ≠ 0 → momentum += ftol(finishing +0x99 + 20), klemt til ±200
    if (arg4) p.momentum = Math.max(-200, Math.min(200, ((p.momentum + Math.trunc(p.f.finishing + 20)) << 16) >> 16));
    // 0x6f0d4c–0x6f0d71: +0x138 for 0xf, +0x13e for 0x12, ellers +0x13c (også 0x10)
    const base = p.skill[action === 0xf ? 0xf : action === 0x12 ? 0x12 : 0x11];
    let vc = randS(rand, base - tired + p.momentum);
    // 0x6f0d90–0x6f0ddc: banen engine+1 (tabellen 0x6f42d4 → 0x6f42c4): 1/2 → −1 − rand(3), 8 → −2 − rand(5), 32 → −3 − rand(8)
    const pitch = GRID_UNKNOWN.byte1;
    if (pitch === 1 || pitch === 2) vc += -1 - rand(3);
    else if (pitch === 8) vc += -2 - rand(5);
    else if (pitch === 32) vc += -3 - rand(8);
    vc -= randS(rand, 50 * m.ballH ** 3);
    vc += randS(rand, Math.trunc(p.w29 / 10) - 30);
    const c = challenge(p, p.side, action);
    const d = c.d;
    let jA = false, adv = false;
    if (d) knockCheck(p, action, d, c.type, false);                                           // sub_6cfe10 (kun med udfordrer)
    // 0x6f0e7a–0x6f124a: "i venstre forsvar …" – ikke efter et løb (+0x198 ∈ 0xf..0x12), ikke keeperen, rand(20) == 0
    if (!(prevAction >= 0xf && prevAction <= 0x12) && p.pos !== L.POS.keeper && rand(20) === 0) P.areaComment(p);
    if (d && d.pos !== L.POS.keeper) comment(0x1f4d, p, p.side, d, d.side, 0);              // 0x6f1291 TAKE_ON_OPPONENT
    if (d) {
      if (!(c.value < vc && rand(5) !== 0)) {                                                 // 0x6f1296: svagere udfordrer slipper 4/5
        const j = judge(d, p, c.type, -1);
        jA = j.hurt;
        appeal(d, other(p.side), c.type, j.hurt, d);                                          // 0x6f1329: straffeappellen (kun den sete kamp)
        if (j.ret !== 0) {
          if (!(rand(30) === 0 && !c.clear)) { foul(d, p, j, c, 'move'); return; }
          queueIncident(c.type, d, p, j.ret, p.x, p.y, j.kind, j.severity);                   // 0x6f1425: fordel
        } else if (jA && (inBoxAt(other(p.side), p.x, p.y) || c.clear)) adv = true;          // 0x6f12b4 → 0x6f1e51: "ramt" i feltet uden frispark
      }
      tried(d, c);
    }
    let lost = p.b1d !== 0;
    if (!lost && arg5 !== 4 && vc < 1 && rand(Math.trunc(5 * p.f.technique + 75)) === 0 && (!d || c.value < vc)) lost = true;
    if (!lost && d && !(vc > c.value)) { winBall(d, p, c, c.value - vc - 200, jA, 'move', adv, arg4); return; }
    if (lost) {                                                                               // 0x6f39af
      dbg('carrier:lost');
      if (m.pendingPass !== -1) m.pendingPass = -1;                                           // bolden bliver i feltet og følger skridtet
      m.x4786 = 0;                                                                            // 0x6f39be
      m.poss = -1; m.carrier = null; m.firstTime = 0; p.w29 = 0; p.momentum = 0; p.busy = rand(2) + 1; p.rating -= 150;
      comment(0x1f42, p, p.side, null, -1, 0);                                               // 0x6f3a27 LOSE_CONTROL_OF_BALL
      if (rand(20 * (p.pressure + 1)) === 0 && adjustMorale(p, -rand(3), rand)) recompute(p);   // 0x6f3a62
    } else {                                                                                  // KEEPS 0x6f283a
      if (!inBoxAt(other(p.side), p.x, p.y) && randS(rand, p.w31) < -10) {
        p.agitation = Math.min(Math.max(p.agitation * 1.05, 2 * (25 - p.temperament)), 100);
        comment(0x211d, null, other(p.side), null, -1, 0);                                    // 0x6f2912 BOO_SPECIFIC_PLAYER (p1 −1, modstanderne)
      }
      m.lastTouch = p.side; m.touchCount[p.side]++; if (m.touchCount[other(p.side)] > 0) m.touchCount[other(p.side)] -= 10; m.touchCount[p.side] += 5;
      // 0x6f29a9–0x6f29c0: fld 0,0; fcomp st(1); je → værdien er min(x, 0) – momentum kan kun FALDE her (før max(0, …), sic)
      p.momentum = Math.max(-200, Math.min(200, p.momentum + Math.trunc(Math.min(0, vc - Math.max(c.value + 50, 250) + p.f.technique * p.f.dribbling))));
      if (!gp.some((o) => o.active && o.side !== p.side && o.x === p.x && o.y === p.y)) p.momentum = Math.min(200, p.momentum + 50);
      if (d) {
        if (action !== 0xf) {
          d.busy += Math.max(c.delayChallenger, 2);
          // 0x6f2a90–0x6f2b32: keeperen forbi (sub_6c38c0 == 1; engine+0x1a4 = 1, ikke i porten) +200, ellers +400 til begge tællere
          const k = d.pos === L.POS.keeper ? 200 : 400;
          m.x4782 += k; m.x4786 += k;
          p.rating += 100; p.dribblesPast++;
          if (rand(20 * (p.morale + 1)) === 0 && adjustMorale(p, rand(5), rand)) recompute(p);
        } else { d.busy += c.delayChallenger; p.rating += 75; p.dribblesPast++; m.x4782 += 300; m.x4786 += 300; }   // 0x6f2ad4–0x6f2b08
        dbg('carrier:kept');
      } else { p.rating += 9; m.x4782 += 36; m.x4786 += 36; }                                // 0x6f2b7e–0x6f2b9c
      m.ballH = 0;
      keepEvents(p, d, action, nx, ny, arg4, arg5, prevAction);                               // 0x6f2bb7: kommentaren efter handlingen
    }
    if (!stepTo) return;
    // boldholderens retning ændres ikke af skridtet (0x6f4150: ingen slutvending for +0xf582) – kun af sub_6f4920 før løbet
    const ox = p.x, oy = p.y;
    setPos(m, p, nx, ny);
    L.noteForward(m, p);                                                                      // 0x6f3b8f–0x6f3bf3
    markersFollow(p);                                                                         // 0x6f3bf9 – markørerne følger, mens bolden endnu er i det gamle felt
    stepDrain(p, ox, oy);                                                                     // 0x6f3c88
    m.ballX = nx; m.ballY = ny;                                                               // 0x6f3f83/0x6f40f9: bolden følger (også den tabte, [esp+0x13]) efter dem
    finalTurn(p);                                                                             // 0x6f4143 (kun når bolden blev tabt)
  };

  let passRun: () => boolean = () => false;
  let offTag = 0;                                                                             // kun spor: N-linjens kalder (2 = sub_6fa490)                                                   // sub_6fad40 for den igangværende aflevering
  const passHooks: L.PassHooks = {
    pass: () => passRun(),
    offsidePlayer: (side, py, ty) => {
      const o = GRID_UNKNOWN.offsidePlayer(m, side, py, ty, null, rand);
      onShot?.('N', [offTag, side, py, ty, 0, side === 0 ? m.lineSide1 : m.lineSide0, o ? o.side : -1, o ? o.pslot ?? o.slot : -1]);
      return o;
    },
    missedOffside: (o) => queueIncident(-1, o as GP, null, 8, o.x, o.y, -1, -1),             // 0x6fa329 / 0x6fac41: offside overset → fordel
  };

  /** Duellen ved afleveringens kilde (sub_6fad40 §5, 0x6fb4ca–0x6fc988; sikker): sub_6c87e0 med handling 0x6c, dommeren når V_d ≥ afleverens
   *  momentum + 200, ellers vinder udfordreren bolden med momentum V − 400. w40 = udfordrerens værdi (også når han ikke går ind). */
  const sourceDuel = (p: GP, V: number, duel: boolean): { stop: boolean; w40: number } => {
    const c = duel ? challenge(p, p.side, 0x6c) : null;
    const cd = c?.d ?? null;
    knockCheck(p, 0x6c, cd, c?.type ?? 0, false);                                              // 0x6fb512 (altid, også uden udfordrer)
    if (!c || !cd) return { stop: false, w40: 0 };
    if (c.value < p.momentum + 200) return { stop: false, w40: c.value };
    const j = judge(cd, p, c.type, 0x6c);
    appeal(cd, other(p.side), c.type, j.hurt, cd);                                            // 0x6fb566 (den sete kamp)
    if (j.ret !== 0) {
      if (rand(10) === 0 && !c.clear) { queueIncident(c.type, cd, p, j.ret, p.x, p.y, j.kind, j.severity); return { stop: false, w40: c.value }; }   // 0x6fb662: fordel
      dbg('pass:foul'); foul(cd, p, j, c, 'pass'); return { stop: true, w40: c.value };
    }
    tried(cd, c);
    dbg('pass:tackled');
    winBall(cd, p, c, V - 400, j.hurt, 'pass');
    return { stop: true, w40: c.value };
  };

  /** sub_6fa250 → sub_6fad40 (sikker): offside og modtageren (+0xf57a) først, når afleveringen er sendt af sted. lead = io_flag fra
   *  sub_6c6a30 (afleveringen foran modtageren). */
  const doPass = (p: GP, type: number, receiver: GP | null, tx: number, ty: number, lead: boolean) => {
    const io = { v: lead };
    passRun = () => P.pass(p, p.x, p.y, type, io, receiver, tx, ty);
    L.passWrapper(m, p, type, receiver, ty, io, rand, hooks, passHooks);
    p.busy--; // passWrapper tæller busy op (0x6fa26f); limen gjorde det allerede i carrierTurn
    if (m.state === 7) { m.ballH = -1; m.ballSpeed = 0; m.pendingPass = -1; }
  };

  let lastShotType: number = SHOT.LOW_DRIVE;                                                 // skudtypen fra sub_700bd0 (hovedstød ved boldhøjde 4)
  let lastShotEvent = 0x1f86;                                                                // skudtypens begivenhed fra sub_700bd0 (a3)
  /** sub_700bd0's indgang uden situation (straffet i 0x702901, skuddets egen rekursion): samme felter som situation()'s ctx() */
  const shotCtx = (p: GP) => {
    const opp = other(p.side), gr = goalRow(p.side), k = gp.find((o) => o.active && o.side === opp && o.pos === L.POS.keeper);
    return { side: p.side, x: p.x, y: p.y, D: L.dist(p.x, p.y, 4, gr), ballHeight: m.ballH, facingGoal: GRID_UNKNOWN.facingGoal(m, p, rand), creativityRoll: p.roll.creativity,
      flairRoll: p.roll.flair, condition: p.condition, w29: p.w29, momentum: p.momentum, form: p.form, prevAction: p.action, attrs: shotAttrs(p),
      keeper: k ? { x: k.x, y: k.y, side: opp, down: k.busy, distToShooter: L.dist(k.x, k.y, p.x, p.y), distToOwnGoal: L.dist(k.x, k.y, 4, gr) } : null,
      weather: GRID_UNKNOWN.weather, matchByte1: GRID_UNKNOWN.byte1 } as Parameters<typeof shotScore>[0];
  };
  /** sub_700420(k: x, y, høj, type, &tilstand, &fumle): keeperværdien (shot.ts keeperValue). Grundværdien er handlingsevnen +0x16a (høj) /
   *  +0x168 (0x700440), afstanden er keeperens til BOLDEN (0x70045e), mål imod = keeperens +0xf (0x700a5d). Uden keeper (sub_6ce110 = 0) *estimeret* */
  const keeper700420 = (k: GP | null, x: number, y: number, high: boolean, type: number) => k ? (sync(m), keeperValue)({ base: k.skill[high ? 0x28 : 0x27],
    w3b: k.matchCA, reflexes: k.f.reflexes, goalsConceded: k.b0f & 0xff, b8eaa: m.ballSpeed, distToBall: L.distFlat(k.x, k.y, m.ballX, m.ballY),
    isKeeper: k.pos === L.POS.keeper, down: k.busy, side: k.side, x: k.x, y: k.y, covers: H.keeperCovers(k.view!, x, y) }, { x, y }, type, rand)
    : { K: 0, state: 3, fumble: false };
  /** skuddet sub_702050 (takeShot.ts) – limens del er kun statistikken (holdets skud/på mål/mål/hjørner) og lytteren */
  let shotGoal: GP | null = null;
  const team = (s: number) => gp.filter((q) => q.side === s);
  const shotEnv: ShotEnv = {
    m, gp, rand,
    ev: (id, p1, s1, p2, s2, x) => comment(id, p1, s1, p2, s2, x),
    ev1: (id, q, s, x) => comment(id, q, s, null, -1, x),
    evSide: (id, s, x) => comment(id, null, s, null, -1, x),
    evFlag: (s, id) => s >= 0 && s <= 1 && events.happened[s].has(id),
    get watched() { return !!ctx.watched; },
    compType: ctx.compType ?? 0, fixtureFlags38: 0,
    // kampens rammer (fixture): ligakamp i klubbernes egen liga uden første kamp; holdenes løb (Comp_Stats) kendes ikke i limen → null
    fixture: { hasComp: true, inOwnLeague: () => ctx.league !== false, inOwnContinental: () => false, stillInContention: () => true, runs: () => null,
      code30: 0, firstLeg: null, flags38: 0, flags: 0, kind: 0 },
    setEvFlag: (s, id) => { if (s === 0 || s === 1) events.happened[s].add(id); },
    isDatabasePlayer: (q) => !q.src.regen,
    daysAtClub: (q) => { const d = ctx.date ?? ctx.pick?.[q.side]?.date; return d && q.src.joined ? Math.round((Date.parse(d) - Date.parse(q.src.joined)) / 86400000) : 9999; },
    hasResponseTwo: () => false,
    victimSide: () => { const i = m.inc; return i && i.res && i.d ? (i.d.side === 0 ? 1 : 0) : -1; },
    firstMarker: (q) => gp.find((o) => o.side !== q.side && o.slot >= 0 && o.active && L.manMarkTarget(m, o) === q) ?? null,
    rec: (q, off) => q.src ? recByte(q, off) : null,
    staffByte: (q, off) => staffByte(q, off),
    surname: (q) => q.src.last ?? '',
    countOnPitch: (s) => gp.filter((q) => q.side === s && q.slot >= 0 && q.active).length,
    scaleAg: (q, f) => scaleAg(q, f),
    teamBlock: (s) => teamBlk[s],
    reactToDecision: (q) => reactToFoul(q),
    get goldenGoal() { return m.paused; },                                                   // engine+0x1a8 (loop.ts: paused)
    get b1a4() { return m.b1a4; },
    markedBy: (p) => gp.filter((q) => q.side !== p.side && q.slot >= 0 && q.active && L.manMarkTarget(m, q) === p).length,   // sub_6d59b0
    setShotMark: (s, mn) => { shotMark.side = s; shotMark.minute = mn; },
    footCheck: (p, type, D) => {
      const gyS = goalRow(p.side);
      return footCheck(type, (p.x === 4 && p.y === gyS ? m.ballDir : H.cellDirection(p.x, p.y, 4, gyS)) - p.facing, D, shotAttrs(p), p.strongFoot);
    },
    keeper: (s) => gp.find((o) => o.active && o.side === s && o.pos === L.POS.keeper) ?? null,
    highFlag: (type) => highFlag(type, rand),
    keeperValue: (k, p, type) => keeper700420(k, p.x, p.y, false, type),
    keeper700420: (k, x, y, high, type) => keeper700420(k, x, y, high, type),
    challenge: (p, s, action, flag9) => challenge(p, s, action, flag9),
    knockCheck: (A, cA, B, cB, off) => knockCheck(A, cA, B, cB, off),
    judge: (d, p, type, action) => judge(d, p, type, action),
    inBox: (s, x, y) => inBoxAt(s as Side, x, y),
    isHard: (t) => isHardChallenge(t),
    randS: (n) => randS(rand, n),
    foulShot: (d, p, j, c, f) => foul(d, p, j as JudgeResult, c as ChallengeOut, 'shot', f.a4),
    queueIncident: (type, d, p, res, x, y, jC, jB) => queueIncident(type, d, p, res, x, y, jC, jB),
    tried: (d, c) => tried(d, c as ChallengeOut),
    winBall: (d, p, c, adv) => winBall(d, p, c as ChallengeOut, (c.value << 16 >> 16) - shotS - 200, false, 'shot', adv),
    offsidePlayer: (s, y, row, excl) => {
      const o = GRID_UNKNOWN.offsidePlayer(m, s, y, row, excl, rand);
      onShot?.('N', [1, s, y, row, 1, s === 0 ? m.lineSide1 : m.lineSide0, o ? o.side : -1, o ? o.pslot ?? o.slot : -1]);
      return o;
    },
    shotLine: (_x, _y, S, _side0, _kind, soft) => {                                        // sub_6cc540(x, y, S, side == 0, extra 5/6, soft)
      const p = shotP!;
      const r = P.shotLine(p, S, soft === 1, _kind);
      st(p.side).shots++;                                                                    // holdets skud: alle, der når skudlinjen (som portens tidligere optælling)
      ctx.onShot?.('B', [S, r, soft]);
      return r;
    },
    ballOut: (s) => ballOut(s as Side),
    playerTurn: (q) => L.playerTurn(m, q, rand, hooks),
    adjustMorale: (q, delta) => adjustMorale(q, delta, rand),
    refreshSkills: (q) => recompute(q),
    place: (q, x, y) => setPos(m, q as GP, clampX(x), clampY(y)),
    takeBall: (q) => takeBall(q),
    takeShot: (q, a1, a2, a3, a4, a5, a6) => doTakeShot(q, a1, a2, a3, a4, a5, a6),
    team,
    pressureCount: (q) => {
      const opps = cellListOf(m, q.x, q.y, other(q.side));
      sync(m);
      return H.pressure(q.view!, opps.map((o) => o.view!)).count;
    },
    looseBall: (x, y, spread, lt, keep, stir, player) => { if (m.pendingPass !== -1) m.pendingPass = -1; P.looseBall(x, y, spread, lt as Side | -1, keep, stir, player); },
    notAhead: (s) => m.goals[s] < m.goals[other(s)],                                        // sub_6d5950: ligakamp (ingen første kamp) – egne < modstandernes
    onGoal: (p) => { shotGoal = p; },
    onOwnGoal: (p) => { ownGoalBy = p; },
    kickoffAfterGoal: (s) => kickoffPositions(s),
    clubKind8: (s) => ENGLISH_SPEAKING.has(m.nations[s === 0 ? 0 : 1]),                     // klub+0x53 → land, +0x77 == 8 (nation.dat: engelsk sprog)
    corner: (s) => { m.ballX = clampX(m.ballX); m.ballY = clampY(m.ballY); st(s).corners++; on?.corner?.(s); },
    applyIncident: () => applyIncident(),
  };
  let shotP: GP | null = null, shotS = 0;
  /** sub_70a910 / sub_70c040 med limens statistik (holdets skud/på mål/mål) og lytteren omkring */
  const ballIntoGoal = (p: GP, D: number, own: boolean) => {
    dbg(own ? 'intoOwnGoal' : 'intoGoal');
    const sh0 = p.shots, on0 = p.shotsOnTarget, g0 = [m.goals[0], m.goals[1]];
    shotGoal = null; ownGoalBy = null;
    if (own) intoOwnGoal(shotEnv, p, D); else intoGoal(shotEnv, p, D);
    st(p.side).shots += p.shots - sh0; st(p.side).onTarget += p.shotsOnTarget - on0;
    for (const s of [0, 1] as Side[]) if (m.goals[s] > g0[s]) {
      st(s).goals += m.goals[s] - g0[s];
      if (ownGoalBy) on?.ownGoal?.(ownGoalBy);
      else { const g = (shotGoal as GP | null) ?? p; on?.goal?.(g, g.giver && g.giver.side === g.side && g.giver !== g ? g.giver : null, false); }
    }
    if (p.shots > sh0) on?.shot?.(p, m.goals[p.side] > g0[p.side] ? 'goal' : p.shotsOnTarget > on0 ? 'held' : 'wide');
    shotGoal = null; ownGoalBy = null;
  };
  let ownGoalBy: GP | null = null;
  const teamBlk: [number[], number[]] = [new Array(54).fill(0), new Array(54).fill(0)];         // engine+0xf5bc + 54·side (holdblokken, takeShot R6)
  /** sub_702050 med limens statistik omkring: skud/på mål pr. hold følger spillerens +0xa/+0xb, målet tælles efter skuddet (run_match_steps
   *  0x6ba914 tæller stillingen +0xf5bd/+0xf5f3 om), tillægstiden og afsparket som før */
  const doTakeShot = (p: GP, a1: number, a2: number, a3: number, a4: number, a5: number, a6: (GP | null)[]) => {
    const prevP = shotP, prevS = shotS, sh0 = p.shots, on0 = p.shotsOnTarget, g0 = m.goals[p.side];
    shotP = p; shotS = (a2 << 16) >> 16; shotGoal = null;
    ctx.onShot?.('H', [p.side, p.pslot ?? p.slot, p.x, p.y, a1, a2, a3, a4, a5, 0, p.facing, p.w29, p.momentum]);
    takeShot(shotEnv, p, a1, a2, a3, a4, a5, a6);
    shotP = prevP; shotS = prevS;
    if (a1 === SHOT.PENALTY && (a4 === 1 || a4 === 2 || a4 === 5)) st(p.side).shots++;     // straffet går uden om skudlinjen (0x70394d)
    st(p.side).onTarget += p.shotsOnTarget - on0;                                            // +0xb (0x703c90)
    const stood = m.goals[p.side] > g0;                                                       // 0x708a31: stillingen +0xf5bd tælles kun for et godkendt mål
    if (p.shots > sh0) on?.shot?.(p, stood ? 'goal' : p.shotsOnTarget > on0 ? 'held' : 'wide');
    if (stood) {
      const g = (shotGoal as GP | null) ?? p;
      st(p.side).goals += m.goals[p.side] - g0;
      on?.goal?.(g, g.giver && g.giver.side === g.side && g.giver !== g ? g.giver : null, a1 === SHOT.PENALTY);
    }
    shotGoal = null;
  };
  const shoot = (p: GP, d: { action?: number; quality: number; special?: number }) => {
    const type = d.action === ACTION.penaltyShot ? SHOT.PENALTY : d.action === ACTION.freeKickShot ? SHOT.FREE_KICK : lastShotType;
    const a6 = type === SHOT.PENALTY || type === SHOT.FREE_KICK ? [] : shotPressers;
    doTakeShot(p, type, d.quality, lastShotEvent, d.special ?? 1, a6.length, a6);
  };
  let shotPressers: GP[] = [];                                                                // sub_6bcbd0's liste (sub_7109f0 [esp+0x78])

  const recv = new Map<PassOption, GP | null>();
  const lead = new Map<PassOption, boolean>();                                               // sub_6c6a30's io_flag (afleveringen foran modtageren)
  const situation = (p: GP): Situation => {
    sync(m);
    const opp = other(p.side);
    const opps = gp.filter((o) => o.side === opp);
    const oppViews = opps.map((o) => o.view!);
    const inCell = cellListOf(m, p.x, p.y, opp);                                             // feltets liste (engine+0x215e)
    const pr = H.pressure(p.view!, inCell.map((o) => o.view!));
    // sub_6bcbd0's liste (0x6bcd73–0x6bce09, sub_7109f0 [esp+0x78], kun når boldhøjden ≠ −1 – 0x7110fb): de to modstandere i feltet med det
    // største bidrag bp > 5 (udfordrer: 2·w, ellers w/(busy + 1)), den største først – skuddets a5/a6
    shotPressers = [];
    if (m.ballH !== -1) {
      const pv = p.view!, mom = Math.trunc(p.momentum / 20);
      let b1: GP | null = null, b2: GP | null = null, v1 = 0, v2 = 0;
      for (const o of inCell) {
        const ov = o.view!;
        if (ov.slot < 0) continue;
        let bp: number;
        if (pv.challengers.includes(ov)) {
          const t = ov.tacklingBit2 ? ov.rolls.b10a : ov.rolls.b108;
          bp = 2 * ((Math.trunc((t + ov.rolls.b10a - mom - pv.rolls.b107) * 1.7) << 16) >> 16);
        } else if (ov.busy >= 0 && o.pos !== L.POS.keeper && (ov.rolls.b10a !== 0 || (ov.action & 0x100) !== 0)) {
          bp = Math.trunc(((ov.rolls.b10a - mom - pv.rolls.b107) * 1.7) / (ov.busy + 1));
        } else continue;
        bp = (bp << 16) >> 16;
        if (bp <= 5) continue;
        if (bp > v1) { if (b1) { b2 = b1; v2 = v1; } b1 = o; v1 = bp; }
        else if (bp > v2) { b2 = o; v2 = bp; }
      }
      if (b1) shotPressers.push(b1);
      if (b2) shotPressers.push(b2);
    }
    const gr = goalRow(p.side);
    const D = L.dist(p.x, p.y, 4, gr);
    const attHalf = p.side === 0 ? p.y >= 6 : p.y < 6;
    const k = opps.find((o) => o.active && o.pos === L.POS.keeper);
    // sub_7109f0 0x710f8b–0x711015: det taktiske felt (sub_6c2be0 + sub_715f50 med driftens rand) slås først op i det åbne spil – efter
    // dødboldenes gren (0x710aaf) – og i tilstand 4 (skudforespørgslen, 0x710acb) slet ikke: (4, mållinjen). [esp+0x90] = afstanden
    // (float32-tabellen) til feltet, når han står foran det, ellers 0 (før: rækkerne foran)
    let tac: { x: number; y: number; beyond: number } | null = null;
    const tacOf = (mode = 0) => tac ??= (() => {
      if (mode === 4) return { x: 4, y: gr, beyond: 0 };                                       // 0x710ace/0x710adc: (4, mållinjen), [esp+0x90] = 0
      const [x, y] = cellWithDrift(p);
      const fwd = p.side === 0 ? p.y > y : p.y < y;
      return { x, y, beyond: fwd ? Math.fround(L.DIST[Math.abs(p.y - y)][Math.abs(p.x - x)]) : 0 };
    })();
    const nearestOpp = H.nearestOpponent(oppViews, p.x, p.y, true);
    // boldholderens "plads" (word +0x29) skrives af sub_7109f0 selv (ballCarrier.ts setSpace, 0x7110f5–0x711342 med rand-grenen). Før regnede
    // limen sin egen udgave uden mellem-ftol'en og rand'en og satte +0x29 også ved dødbolde (originalen rører den ikke dér).
    // 0x6c6fc6–0x6c6fe9: fixture+0x14 → turneringens omdømme +0x69 (ctx.compRep; før altid null → leddet 25·(omdømme − 12) manglede)
    const ps: PassState = { attackingSide: p.side, ballState: m.ballH, defLine: [m.lineSide1, m.lineSide0], teamFlags: m.teamFlags, competitionReputation: passCompRep, roleStaffId: roles[p.side],
      players: [gp.filter((o) => o.side === 0).map((o) => o.view!), gp.filter((o) => o.side === 1).map((o) => o.view!)] };
    const ref = new Map(gp.map((o) => [o.view!, o]));
    const ph: PassHelpers = {
      trace: onShot ? (c, W, sh, lo, x) => onShot('PO' as never, [c.side, c.slot, W, sh, lo, ...Object.values(x)]) : undefined,
      rand, dist: (dx, dy) => L.DIST[Math.min(11, dy)][Math.min(8, dx)],
      freeRun: (q) => GRID_UNKNOWN.freeRun(m, ref.get(q as never)!, rand),
      facingGoal: (q) => GRID_UNKNOWN.facingGoal(m, ref.get(q as never)!, rand),
      canSee: (_c, tx, ty, oppNear, mark) => GRID_UNKNOWN.canSee(m, p, tx, ty, true, oppNear, mark, true, rand),
      runTarget: (q) => { const t = GRID_UNKNOWN.runTarget(m, ref.get(q as never)!, 0, [-1, -1], rand); return t ? { x: t[0], y: t[1] } : null; },
      lineOfSight: (x, y, tx2, ty2, d) => H.footForTarget({ ...p.view!, x, y }, 0x5d, tx2, ty2, d, m.ballDir).foot,
      spaceAhead: (q) => GRID_UNKNOWN.spaceAhead(m, ref.get(q as never)!),
      // sub_6bd5b0(q, 0): modtagerens EGET felt (+0x21b6 for hans felt – før boldholderens)
      noDefenderGoalSide: (q) => H.noDefenderGoalSide(q as unknown as H.MatchPlayer, oppViews, cellListOf(m, q.x, q.y, opp).length, false),
      onPitch: (id) => id !== null && gp.some((q) => q.active && q.src.id === id),
    };
    const toOption = (c: ReturnType<typeof passOptions>): PassOption | null => {
      const o: PassOption = c.receiver
        ? { hasTarget: true, weight: c.weight, type: c.type ?? 0x0b, tx: c.x ?? c.receiver.x, ty: c.y ?? c.receiver.y }
        : { hasTarget: false, weight: c.weight, type: c.type ?? 0x0b, tx: c.x ?? p.x, ty: c.y ?? p.y };
      if (c.receiver) { recv.set(o, ref.get(c.receiver as never) ?? null); lead.set(o, !!c.lead); }
      return o;
    };
    let openPass: PassOption | null | undefined;
    let lazyRun: 0 | 1 | 2 | undefined, lazyFace: boolean | undefined, lazyTarget: { found: boolean; tx: number; ty: number } | undefined;
    const foot = H.footForTarget(p.view!, 0x16, 4, gr, D + 1, m.ballDir);
    let shotType = 0xff;                                                                       // sub_7109f0 [esp+0x88]
    const ctx = () => ({ side: p.side, x: p.x, y: p.y, D, ballHeight: m.ballH, facingGoal: ph.facingGoal(p.view!), creativityRoll: p.roll.creativity, flairRoll: p.roll.flair,
      condition: p.condition, w29: p.w29, momentum: p.momentum, form: p.form, prevAction: p.action, attrs: shotAttrs(p),
      keeper: k ? { x: k.x, y: k.y, side: opp, down: k.busy, distToShooter: L.dist(k.x, k.y, p.x, p.y), distToOwnGoal: L.dist(k.x, k.y, 4, gr) } : null, weather: GRID_UNKNOWN.weather, matchByte1: GRID_UNKNOWN.byte1 });
    return {
      traceScores: onShot ? (P0, R0, H0, S0, w0, b0, sp0, pr0) => onShot('Q', [p.side, p.pslot ?? p.slot, p.x, p.y, m.ballH, P0, R0, H0, S0, w0, b0, sp0, pr0]) : undefined,
      carrier: {
        side: p.side, x: p.x, y: p.y, dribbling: p.f.dribbling, finishing: p.f.finishing, flair: p.f.flair, freeKicks: p.f.freeKicks, heading: p.f.heading, longShots: p.f.longShots,
        teamwork: p.f.teamwork, decisionsRoll: p.roll.decisions, creativityRoll: p.roll.creativity, flairRoll: p.roll.flair, positioningRoll: p.roll.positioning, morale: p.morale, b11: p.dribblesPast & 0xff,   // +0x17 moralen, +0x11 (før 10 og 0)
       
        b2d: p.weakFootPenalty, condition: p.condition, momentum: p.momentum, lastAction: p.action, isGoalkeeper: p.pos === L.POS.keeper, posFlags: p.pos, sideFlags: p.posAttack,
        runWithBall: (p.instr & 0x2000000n) !== 0n, holdUpBall: (p.instr & 0x8000000n) !== 0n, longShotsInstr: (p.instr & 0x20000000n) !== 0n, crossBall: (p.instr & (0x4n << 32n)) !== 0n,
        professionalism: p.src.attrs[ATTRS.indexOf('professionalism')] || 10, sportsmanship: p.src.attrs[ATTRS.indexOf('sportsmanship')] || 10,
      },
      mode: 0, restart: m.state === 8 ? 0 : m.state, ballHeight: m.ballH, ballX: m.ballX, ballY: m.ballY, oppLastLine: p.side === 0 ? m.lineSide1 : m.lineSide0, D,
      nearestOpp, nearbyOpp: H.opponentsClose(oppViews, p.x, p.y, true), blockers: attHalf ? H.blockersOnLine(oppViews, p.x, p.y, 4, gr) : 0,
      // 0x7110e7–0x711118: sub_6bcbd0 kun uden tilstand 4 og med boldhøjde ≠ −1 – ellers står [esp+0x49] (0x7110a5) og [esp+0x70] på 0
      get pressure() { return this.mode === 4 || m.ballH === -1 ? 0 : pr.count; }, get challenge() { return this.mode === 4 || m.ballH === -1 ? 0 : pr.w70; },
      get pass() {
        if (openPass === undefined) {
          // spillernes visninger friskes op først: boldholderen kan have vendt sig (0x6f4920) siden situationen blev bygget
          if (m.state === 0 || m.state === 8) sync(m);
          openPass = m.state === 0 || m.state === 8 ? toOption(passOptions(ps, p.view!, p.x, p.y, -1, ph)) : null;
          if (onShot && openPass) { const r = recv.get(openPass); onShot('O', [p.side, p.pslot ?? p.slot, p.x, p.y, openPass.weight, r ? r.side : -1, r ? r.pslot ?? r.slot : -1, openPass.tx, openPass.ty]); }
        }
        return openPass;
      },
      setPiecePass: (code) => toOption(passOptions(ps, p.view!, p.x, p.y, code, ph)),
      // w29 fra sub_7109f0 (0x7110f5–0x711342: kan være negativ – rand(w29) i 0x7016fc trækker så skuddet ned); uden = limens skøn ≥ 0
      shotScore: (w29?: number) => {
        const c = ctx(); if (w29 !== undefined) { c.w29 = w29; p.w29 = w29; }
        // 0x711596 / 0x713c64: begge kald i sub_7109f0 skriver typen i samme [esp+0x88] (0xff ved indgangen, 0x710a7c) – det sidste kald får
        // altså det førstes type som forvalg og springer typevalget over (0x700f58)
        const r = shotScore(c, rand, m.state === 5 ? SHOT.PENALTY : m.state === 6 ? SHOT.FREE_KICK : shotType); lastShotType = r.type; lastShotEvent = r.event; if (r.quality !== undefined) p.w39 = r.quality;   // fejl/straffe (0x701fbe/0x700d20): +0x39 uændret
        if (m.state !== 5 && m.state !== 6) shotType = r.type;
        return r.score;
      },
      // 0x713bf9–0x713c48: spillede han bolden første gang (+0x1a7), og var hans forrige handling ikke 0x3b og bolden på jorden →
      // GREAT_FIRST_TOUCH (p1 = han, extra 0) og karakter +25 – før skudscoren
      setSpace: (v) => { p.w29 = v; p.view!.plads = v; },
      onShootStart: () => { if (m.firstTime && p.action !== 0x3b && m.ballH === 0) { comment(0x1f44, p, p.side, null, -1, 0); p.rating += 0x19; } },
      // freeRun/facingGoal/runTarget trækker tal: de regnes først, når sub_7109f0 bruger dem (dovne felter), så rækkefølgen er originalens
      teammatesAhead: hooks.teammatesAhead(p), get clearRun() { return lazyRun ??= GRID_UNKNOWN.freeRun(m, p, rand); },
      oppKeeper: k ? { isRealKeeper: true, x: k.x, y: k.y, hasActed: k.busy !== 0, covers: H.keeperCovers(k.view!, p.x, p.y) } : null,
      oppInCell: inCell.length, committedOppInCell: inCell.filter((o) => (o.yellows & 0xff) !== 0).length,   // 0x713058: modstanderne i feltet med +0x24 (gult kort) ≠ 0 (før 0)
      get facingGoal() { return lazyFace ??= ph.facingGoal(p.view!); }, pastLastLine: L.beyondLine(m, p.side, p.y) >= 0,
      noDefenderGoalSide0: H.noDefenderGoalSide(p.view!, oppViews, inCell.length, false), noDefenderGoalSide1: H.noDefenderGoalSide(p.view!, oppViews, inCell.length, true),
      // boldholderen: flags 2 (bit 1 = boldholder-rutinens byte [esp+0x68], ikke afkodet, sat til 0), io = det taktiske felt
      // uden felt skriver sub_6bce80 −1, −1 i ioX/ioY (0x6bd58f) – boldholderens løb klemmer det til (0, 0) (0x7139f1)
      get runTarget() { return lazyTarget ??= (() => { const tc = tacOf(this.mode); const t = GRID_UNKNOWN.runTarget(m, p, 2, [tc.x, tc.y], rand); return t ? { found: true, tx: t[0], ty: t[1] } : { found: false, tx: -1, ty: -1 }; })(); },
      get tacticalX() { return tacOf(this.mode).x; }, get beyondTactical() { return tacOf(this.mode).beyond; }, tacticalCell() { void tacOf(this.mode); }, clockTicks: m.clock, ownGoals: m.goals[p.side], oppGoals: m.goals[opp], lead: m.goals[p.side] - m.goals[opp],
      teamMode: m.aiMode[p.side], protectLead: protectLead(p.side), oppOffsideTrap: (m.teamFlags[opp] & 0x400) !== 0,
      goalPathBlocked: H.isCrossingPosition(p.view!, 4, gr), sightCheckFails: foot.foot !== 2 && foot.foot !== p.strongFoot, possessionCounter: m.touchCount[p.side],
    };
  };

  function carrierTurn(p: GP): void {
    if (m.depth > 2) return; // sikkerhed: ingen kæde af afleveringer i samme tik
    m.depth++;
    try {
      const s = situation(p);
      const d = decideBallCarrier(s, rand);
      dbg('dec:' + d.kind + (m.state ? ':r' + m.state : ''));
      if (m.state !== 0) m.state = 0; // dødbolden er taget
      p.busy++;
      switch (d.kind) {
        case 'pass': {
          const target = recv.get(d.pass) ?? null;
          p.action = d.action; doPass(p, d.pass.type, target, d.pass.tx, d.pass.ty, lead.get(d.pass) ?? false); break;
        }
        case 'passToSpace': p.action = d.action; doPass(p, d.code, null, d.tx, d.ty, false); break;
        case 'loftedBall': {
          // sub_6fa490 (sikker, pass.ts): målfelt efter retningen, sub_6fad40, linjevogteren som i sub_6fa250 (uden modtager)
          // kun PASS uden modtager sætter +0x198 = 9 (0x713785); de andre veje til sub_6fa490 (0x711e3f, 0x711f2e, 0x7134ce, 0x71371d,
          // 0x71378e) lader handlingen stå
          if (d.action !== undefined) p.action = d.action;
          p.busy--;                                                                               // sub_6fa490 tæller selv busy op
          P.loftedPass(p, m.ballH, d.arg ?? 0, (act, ty, run) => { passRun = run; offTag = 2; L.passWrapper(m, p, act, null, ty, false, rand, hooks, passHooks); offTag = 0; });
          if (m.state === 7) { m.ballH = -1; m.ballSpeed = 0; m.pendingPass = -1; }
          break;
        }
        case 'run': {
          p.busy--; // move_to tæller busy op (0x6f0a13); limen gjorde det allerede ovenfor
          if (d.turn) P.turnTo(p, p.x, p.y, d.turn[0], d.turn[1]);                            // sub_6f4920 før løbet (0x713941 / 0x713a89)
          // 0x713a8e–0x713acd: efter vendingen før 0x11/0x12-løbet – spillede han den første gang (+0x1a7), GREAT_FIRST_TOUCH og +25
          if (d.action !== ACTION.turnAndRun && m.firstTime) { comment(0x1f44, p, p.side, null, -1, 0); p.rating += 0x19; }
          // 0x71395c: (tx, ty, 0xf, 0, 0); 0x713b82/0x713bb0: (tx, ty, 0x11|0x12, frit løb [esp+0x68] = sub_6cb780, sub_7109f0's argument)
          if (d.action === ACTION.turnAndRun) carrierMove(p, d.tx, d.ty, d.action, 0, 0);
          else {
            // 0x713aed–0x713b5d (sikker): løbet starter (forrige handling ikke 0x11/0x12) med frit løb, og han modtog den sidste
            // aflevering (+0xf5aa) med plads (+0x29 > −100): afleveren (+0xf5a6, ikke indkast 0x34/0x37) får +3 og trunc(w29/3) + 0x113
            const g = m.passGiver;
            if (p.action !== 0x11 && p.action !== 0x12 && s.clearRun && p === m.passRecv && g && p.w29 > -0x64 && g.action !== 0x34 && g.action !== 0x37) {
              g.assists++; g.rating += Math.trunc(p.w29 / 3) + 0x113; m.x4782 += 0x113;
            }
            carrierMove(p, d.tx, d.ty, d.action, s.clearRun, s.mode);                         // sub_6f09f0 (sikker)
          }
          p.action = d.action;                                                                // 0x713961/0x713b87/0x713bb5: +0x198 sættes EFTER løbet
          break;
        }
        case 'hold': p.busy--; holdBall(p, d.timeWasting); p.action = 0x10; break;                          // sub_70ec80 (+0x198 = 0x10 sættes efter kaldet, 0x7139c9)
        // +0x198 sættes ikke før skuddet (sub_702050 sætter 0x6d ved 0x70388a); param = sub_6bba80 (1, 2 = fordelen venter) i åbent spil,
        // straffe/frispark 0x710d4a/0x710ec8: 1 (5/6 ved rand(100) = 0)
        // skuddet tæller IKKE +0x2b op (0x713cc0 kalder sub_702050 direkte – kun afleveringerne 0x6fa250/0x6fa490 og løbet 0x6f0a13 gør)
        // 0x710e9d: +0x8eb1 = 6 kun for det direkte frispark (type 0x35, 0x710ea7) – før for alle skud
        case 'shoot': { p.busy--; if (d.action === ACTION.freeKickShot) m.ballEvent = 6; shoot(p, d.special !== undefined ? d : { ...d, special: advantageAtShot() }); break; }
        case 'wouldShoot': break;
      }
    } finally { m.depth--; }
  }

  kickFit = null;                                                                            // kun under opbygningen af spillerne
  // init_match 0x6b8bc5–0x6b8bd5 (efter holdenes opsætning 0x6db500, før de sidste tal 0x6b9120– og afsparkets rand(2) 0x6b974f):
  // holdets samspil sub_6bbb60(0), sub_6bbb60(1) og mandsopdækningens mål sub_6bbf60 (matchSubs.ts)
  subs.kickoffSetup();
  preMatchMode();
  // init_match 0x6b974d: rand(2) ≠ 0 → side 0 sparker af og +0x8eb6 = 1 (anden halvleg), ellers side 1 og +0x8eb6 = 0
  { const r = rand(2); kickoffPositions(r ? 0 : 1); secondKick = r ? 1 : 0; }
  let guard = 0, finished = false;
  const finish = () => {
    finished = true;
    if (!dbgOn) return;
    for (const s of [0, 1] as Side[]) {                                                      // fejlsøgning: konditionen ved slutfløjt (markspillere)
      const q = gp.filter((o) => o.side === s && o.active && !o.isKeeper);
      GRID_DEBUG['cond:s' + s] = (GRID_DEBUG['cond:s' + s] ?? 0) + q.reduce((a, o) => a + o.condition, 0) / Math.max(1, q.length) / 100;
    }
  };
  /** sub_6ce460(0x3de) (hvert tik i den sete kamp, run_match_steps 0x6b9ec2; ingen tal): for begge holds 20 i truppen den viste karakter
   *  +0x1b = trunc((+0x35 + 500)/1000) klemt 1..10, og holdblokkens tællere nulstilles og summeres: +0xf5be/+0xf5bf skud/på mål (+0xa/+0xb),
   *  +0xf5c0/+0xf5c1 straffe taget/scoret (+0xd/+0xe), +0xf5c2 (+0xf), ordene +0xf5e2… (+0x1, +0x2, +0x4, +0x5, +0x7, +0x8, +0x9, +0x12),
   *  +0xf5cc gule (+0x24). +0xf5cb (= +0x23, ukendt felt) er ikke med. Bytes uden fortegn som originalen (& 0xff). */
  const watchedStats = () => {
    for (const s of [0, 1] as Side[]) {
      const b = teamBlk[s];
      for (const i of [2, 3, 4, 5, 6, 0xf, 0x10]) b[i] = 0;
      for (let w = 0x26; w <= 0x34; w += 2) b[w] = 0;
      for (const q of gp.filter((x) => x.side === s)) {
        const v = Math.trunc((((q.rating << 16) >> 16) + 500) / 1000);
        q.b1b = Math.max(1, Math.min(10, v));
        b[6] = (b[6] + q.b0f) & 0xff; b[4] = (b[4] + q.pensTaken) & 0xff; b[5] = (b[5] + q.penGoals) & 0xff;
        b[2] = (b[2] + q.shots) & 0xff; b[3] = (b[3] + q.shotsOnTarget) & 0xff;
        const ws = [q.c01, q.c02, q.tacklesTried, q.tacklesWon, q.b7, q.b8, q.b9, q.blocks];
        ws.forEach((x, k) => { b[0x26 + 2 * k] = (b[0x26 + 2 * k] + (x & 0xff)) & 0xffff; });
        b[0x10] = (b[0x10] + q.yellows) & 0xff;
      }
    }
  };
  const tick = (): boolean => {
    if (finished) return false;
    events.tick = m.clock;
    if (guard++ >= 4000) { finish(); return false; }
    // sub_6b98c0 0x6b9b0a: under straffesparkskonkurrencen (+0x8eb3) ét spark pr. tik (shootout.ts); slut, når +0x8eb3 = 0
    if (m.shootout) {
      m.shootoutState = shootoutStep({ m, rand, players: (s) => gp.filter((q) => q.side === s), ai: isAi, humanOrder: (s) => m.tactics[s].penOrder ?? [],
        pickTaker: (s, ex) => GRID_UNKNOWN.pickTaker(m, s, 5, rand, ex), keeper: (s) => hooks.ownKeeper(s) as GP | null, takeBall: (p) => takeBall(p),
        // sub_6be710 mode 3: kommentarerne (0x2004/0x2005/0x2006), kø+0 (engine+0x8ea4), sub_6bba10, sub_700bd0(0x33) og sub_702050(…, 3, 0, 0)
        ev: (id, p1, s1) => comment(id, p1, s1, null, -1, 0),
        queueMode: { get: () => events.b0, set: (v) => { events.b0 = v; } },
        clearIncident: () => { m.inc = null; },
        shotScore: (q, preset) => { const r = shotScore(shotCtx(q), rand, preset); return { score: r.score, event: r.event }; },
        takeShot: (q, a1, a2, a3, a4, a5, a6) => doTakeShot(q, a1, a2, a3, a4, a5, a6),
        penScore: (s) => teamBlk[s][0],                                                        // engine+0xf5bc/+0xf5f2 (tælles af sub_702050 0x707dc6)
        onKick: (k, s) => on?.penKick?.(k, s) }, m.shootoutState);
      if (!m.shootout) { finish(); return false; }
      return true;
    }
    if (dbgOn) dbg('state' + m.state + (m.carrier ? 'C' : '') + (m.receiver ? 'R' : ''));
    if (ctx.watched) watchedStats();                                                         // 0x6b9ec2 sub_6ce460(0x3de) (*placering: før trinnet*)
    if (!L.tick(m, rand, hooks)) { if (m.shootout) return true; finish(); return false; }
    if (dbgOn && (m.poss === 0 || m.poss === 1)) {                                           // fejlsøgning: angribernes afstand til linjen
      const s = m.poss as Side, Lr = s === 0 ? m.lineSide1 : m.lineSide0;
      let best = -9; for (const q of gp) if (q.active && q.side === s && !q.isKeeper) best = Math.max(best, s === 0 ? q.y - Lr : Lr - q.y);
      dbg('line:L' + (s === 0 ? Lr : 11 - Lr)); dbg('line:max' + Math.max(-4, best));
    }
    // bolden uden for banen efter et løb/en aflevering
    if (m.state === 0 && (m.ballX < 0 || m.ballX > 8 || m.ballY < 0 || m.ballY > 11)) ballOut(m.lastTouch);
    return true;
  };
  void passHooks;
  // kun låsetrinstesten (scripts/lockstep.ts): limens lokale tilstand, så originalens tilstand ved tik 0 kan sættes ind
  ctx.expose?.({ idxOf, subs, aiR, territory, lastStyle, teamBlk, timeAdded, shotMark, fights, announced,
    get: (k: string) => ({ secondKick, kickCommented, stoppageEntry, b8eb4, lastOwner, lastShotType, lastShotEvent })[k],
    set: (k: string, v: number | boolean) => {
      if (k === 'secondKick') secondKick = v as Side; else if (k === 'kickCommented') kickCommented = !!v; else if (k === 'stoppageEntry') stoppageEntry = v as number;
      else if (k === 'b8eb4') b8eb4 = v as number; else if (k === 'lastOwner') lastOwner = v as Side; else if (k === 'lastShotType') lastShotType = v as number;
      else if (k === 'lastShotEvent') lastShotEvent = v as number;
    } });
  return { m, tick, get finished() { return finished; }, result: () => ({ home: m.stats[0], away: m.stats[1], ticks: m.clock }),
    substitute: (s, o, i) => subs.human(s, o, i), setTactic: (s, t) => { pendingTactic[s] = t; },
    subsLeft: (s) => subs.subsLeft[s] - subs.pending(s), subState: (p) => subs.state(p), events };
}

/** spillerpostens egenskaber fra +0x1b (alfabetisk; +0x1c Aggression, +0x21 Consistency, +0x25 Dirtiness, +0x2e Jumping, +0x30/+0x3b fødderne,
 *  +0x36 Pace, +0x3f Teamwork) og positionerne +0x0f–+0x1a – rå 1..20 (p.src.attrs er postens værdier) */
const REC_ATTRS = ['acceleration', 'aggression', 'agility', 'anticipation', 'balance', 'bravery', 'consistency', 'corners', 'crossing', 'decisions',
  'dirtiness', 'dribbling', 'finishing', 'flair', 'freeKicks', 'handling', 'heading', 'importantMatches', 'injuryProneness', 'jumping', 'influence',
  'leftFoot', 'longShots', 'marking', 'offTheBall', 'naturalFitness', 'oneOnOnes', 'pace', 'passing', 'penalties', 'positioning', 'reflexes',
  'rightFoot', 'stamina', 'strength', 'tackling', 'teamwork', 'technique', 'throwIns', 'versatility', 'creativity', 'workRate'] as const;
/** de 18 egenskaber, som spillerposten i hukommelsen holder som interne værdier (10·gemt − CA)/2 (playerInit.ts INTRINSIC_KEYS, sub_535a80
 *  0x538a12) – kan være negative; originalen læser dem med movsx (fx rand(dribling) i sub_6bce80 0x6bd188: rand(−3)) */
const REC_INTRINSIC = new Set(['anticipation', 'crossing', 'decisions', 'dribbling', 'finishing', 'handling', 'heading', 'longShots', 'marking', 'offTheBall',
  'oneOnOnes', 'passing', 'penalties', 'positioning', 'reflexes', 'tackling', 'throwIns', 'creativity']);
const CM_INT_INDEX = new Map<number, number>(CM_INT_OFFSETS.map((o, i) => [o, i]));
function recByte(q: GP, off: number): number {
  if (q.recRaw) return q.recRaw[off];
  const r = q.posR;
  const pos = [r.gk, r.sw, r.d, r.dm, r.m, r.am, r.f, r.wb, r.r, r.l, r.c, r.free];                   // +0x0f GK … +0x16 WB, +0x17 R, +0x18 L, +0x19 C, +0x1a fri rolle
  if (off >= 0x0f && off <= 0x1a) return pos[off - 0x0f];
  const k = REC_ATTRS[off - 0x1b];
  if (k === 'leftFoot') return q.leftFoot;
  if (k === 'rightFoot') return q.rightFoot;
  if (!k) return 0;
  // Player.cmInt: spilstartens interne værdier (playerInit.ts CM_INT_OFFSETS, ægte tilstand med den originale database) – præcise
  const ii = q.src.cmInt ? CM_INT_INDEX.get(off) : undefined;
  if (ii !== undefined && q.src.cmInt![ii] !== undefined) return (q.src.cmInt![ii] << 24) >> 24;
  const v = q.src.attrs[ATTRS.indexOf(k as never)] || 10;
  // ellers har spillet kun den viste værdi: den interne regnes tilbage (*estimeret* – helpers.intrinsicFromShown, afrundet)
  return REC_INTRINSIC.has(k) ? ((Math.round(H.intrinsicFromShown(q.src.ca, v)) << 24) >> 24) : v;
}
/** staffpostens skjulte egenskaber +0x56…+0x5d (alfabetisk: Adaptability, Ambition, Determination, Loyalty, Pressure, Professionalism,
 *  Sportsmanship, Temperament) */
const STAFF_ATTRS = ['adaptability', 'ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'] as const;
function staffByte(q: GP, off: number): number {
  const k = STAFF_ATTRS[off - 0x56];
  return k ? q.src.attrs[ATTRS.indexOf(k as never)] || 10 : 0;
}
function shotAttrs(p: GP): ShotAttrs {
  return { agility: p.f.agility, balance: p.f.balance, strength: p.f.strength, technique: p.f.technique, flair: p.f.flair, finishing: p.f.finishing, heading: p.f.heading,
    longShots: p.f.longShots, freeKicks: p.f.freeKicks, passing: p.f.passing, penalties: p.f.penalties, leftFoot: p.leftFoot, rightFoot: p.rightFoot };
}
