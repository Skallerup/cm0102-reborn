// Gittermotoren (9 × 12) – et laboratorium VED SIDEN AF MatchSim (Bosman-prompten, opgave 5). Ikke koblet ind i spillet.
// Bygger på Bosman-projektets porte: tik-løkken (loop.ts), boldholderens valg (ballCarrier.ts), afleveringsmulighederne
// (passOptions.ts), skuddet (shot.ts) og hjælpefunktionerne (helpers.ts) – de er "sikre" (læst i koden).
// Alt, der endnu er ukendt i originalen, ligger som navngivne kroge i GRID_UNKNOWN med et *estimeret* bud og
// adressen på den funktion i cm0102.exe, de står i for. Kør en sæson: npx tsx scripts/grid-stats.ts
import * as L from './loop';
import { ACTION, decideBallCarrier, type PassOption, type Situation } from './ballCarrier';
import { passOptions, type Helpers as PassHelpers, type MatchPlayer as PassPlayer, type MatchState as PassState } from './passOptions';
import { SHOT, footPenalty, highFlag, keeperBase, keeperValue, shotOutcome, shotScore, type Attrs as ShotAttrs } from './shot';
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
import { makePass, onPitch } from './pass';
import { zonalPick } from './zonal';
import { benchFor, makeMatchSubs } from './matchSubs';
import { shootoutStep, type ShootoutKickRec, type ShootoutState } from './shootout';
import { MatchEvents } from './matchEvents';
import { repTriple } from '../../originalValue';
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
export const randOf = (next01: () => number): Rand => (n) => {
  const k = Math.trunc(n);
  if (k === 0) return 0;
  return k > 0 ? Math.floor(next01() * k) : (-Math.floor(next01() * -k)) | 0;
};

export interface GridTeam { players: Player[] | Map<number, Player>; tactic: Tactic; nation?: string }
/** Begivenheder til live-kampen og rapporten (grid/adapter.ts) – kaldes uden tilfældige tal, så tallene er de samme med og uden */
export interface GridListener {
  goal?(p: GP, assister: GP | null, pen: boolean): void;
  shot?(p: GP, outcome: string): void;
  /** 2 gult, 3–6 rødt */
  card?(p: GP, code: number): void;
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
  /** udskiftninger pr. hold (turneringens word +0x4d >> 4; Premier League 2001/02: 3 – standard). Bænken er taktikkens (& 0xf). */
  subs?: [number, number];
  /** kampen skal have en vinder ved stillingen (fixture+0x38 & 2 forlænget, & 1 straffe – sub_6bd930); mangler = uafgjort tæller */
  needsWinner?: (hg: number, ag: number) => boolean;
  /** kun spor: skuddets H/B/K-linjer som match_trace.c (H = indgangen til sub_702050, B = skudlinjen 0x6cc540, K = keeperværdien 0x700420) */
  onShot?: (kind: 'H' | 'B' | 'K' | 'L' | 'Q' | 'O' | 'J' | 'D' | 'N', v: number[]) => void;
}
export interface GridSideStats { goals: number; shots: number; onTarget: number; corners: number; fouls: number; offsides: number; yellows: number; reds: number; passes: number; passesCompleted: number }
export interface GridResult { home: GridSideStats; away: GridSideStats; ticks: number }

type Side = 0 | 1;
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
  b1d: number;                      // +0x1d "ligger skadet – skal ud" (sat af sub_6d0980) ≠ 0 → boldholderen mister kontrollen; start 0
  b1c: number;                      // +0x1c skadet (sub_6d0980)
  injuredBy: GP | null;             // +0x55 den, der skadede ham
  temperCount: number;              // +0xff ophidselses-tæller (start og henfald i loop.ts)
  grudge: GP | null;                // +0x1a6 "nag" (den der sidst fik ham op at køre)
  sportsmanship: number; temperament: number; pressure: number; consistency: number; // staff +0x5c/+0x5d/+0x5a, post +0x21 (?) – rå 1..20
  isKeeper: boolean;
  tacklesTried: number; tacklesWon: number; dribblesPast: number; b6: number; // +0x4/+0x5/+0x11/+0x6
  blocks: number;                   // +0x12 opsnapninger/blokeringer (sub_6f5c30, sub_70dfd0/sub_6cd3d0)
  shots: number; shotsOnTarget: number; // +0xa/+0xb skud og skud på mål i kampen (0x703c5b/0x703c90; "på mål" = notens tolkning)
  penGoalsWon: number;              // +0x10 (zonevalgets "assists"): 0x706e44 tæller kun ved straffemål på den, der vandt straffen (+0x478a ≠ skytten)
  tbl: Table | null; pslot: number; // taktikkens positionstabel (forudindstillingen) og pladsen i den (tacticTable.ts)
  posR: H.PosRatings;               // positions-/sideevner til sub_715f50
  view?: PassPlayer & H.MatchPlayer;
}

// ------------------------------------------------------------------ de ukendte dele (*estimeret*)

export interface GridMatchState extends L.Match {
  gp: GP[];
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
}

/** den ventende hændelse (notes/advantage-knock.md §A): type, synder d, offer p (null ved hands/offside), dommerens kode (8 = offside),
 *  feltet og judge_tackle's jC (kind) / jB (sværhed); b = +0x4769 (altid 0 fra de læste kaldere) */
export interface Incident { type: number; d: GP; p: GP | null; res: number; x: number; y: number; jC: number; jB: number; b: number }

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
  let I = Math.pow(1 + 0.05 * (imp - 10), 6);
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
    const dribbling = p.src.attrs[ATTRS.indexOf('dribbling' as never)] || 10;                // rec+0x26, rå 1..20
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
        if (n !== 0 && !flag2) score = f32(score - 2 * n * n);
        else {
          let minD = 5000;
          for (const o of opps) {
            if (o.pos & 1) continue;
            const d = H.cellDist(o.x - cx, o.y - cy);
            if (d === 0) { minD = 0; break; }
            if (d < minD) minD = d;
          }
          score = f32(score + minD * minD);
        }
        const backwards = side === 0 ? cy < py : cy > py;
        let noBonus = false;
        if (backwards) { if (!(flags & 8)) { score = f32(score - 4.5); noBonus = true; } }
        else score = f32(score + (cy !== py ? 4 : 0.5));
        if (lineDelta > 0) score = f32(score - 4 * lineDelta);
        if (!noBonus) {
          if ((!flag2 || flags & 1) && (cy < 3 || cy > 8) && cx >= 3 && cx <= 5) score = f32(score + 3.5);
          if (cx === 4 || (px < 4 && cx >= 3 && cx <= px) || (px > 4 && cx >= px && cx <= 5)) score = f32(score + 3);
          if (!flag2) {
            if (px > 4 && cx > px) score = f32(score - 3 * (px - 4));
            if (px < 4 && cx < px) score = f32(score - 3 * (4 - px));
          } else {
            if (!(px >= 2 && px <= 6) && !(cx >= 2 && cx <= 6) && !(flags & 1)) score = f32(score + 0.25 * p.a.teamwork);
            if (px > 4 && cx > px) score = f32(score - 2.5 * (px - 4));
            if (px < 4 && cx < px) score = f32(score - 2.5 * (4 - px));
            if (io[0] === cx && io[1] === cy) score = f32(score + 2.5);
          }
        }
        if (!(score < best)) { best = score; bestX = cx; bestY = cy; }
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
      else if (q.y === Lrow - s) { if (rand(H.ftol(v ** 3 + 25)) === 0) { m.linesmanMark -= 15; return q; } }
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
        if ((state === 6 || state === 7) && !inBoxAt(side, p.x, p.y)) continue;           // målmanden tager kun frispark i eget felt
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
        } else if (!cen && d >= 6.1) sc = Math.trunc(2 * p.f.freeKicks - 0.5 * p.f.jumping);   // indlægsfrispark
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
  for (const k of TECHN) f[k] = H.technicalMatchFloat(k, H.intrinsicFromShown(p.ca, sh(k)), mc);
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
    side, slot, active: true, x: bx, y: side === 0 ? by : 11 - by, action: L.ACT.none, rating: 6100, condition: 100 * Math.max(60, p.condition ?? 100), pendingCond: 0, busy: 0,
    matchCA: mc.K, form, morale: 10, injury: 0, agitation: 2 * (25 - sh('temperament')), agFloor: 2 * (25 - sh('temperament')), pos, tacticByte, instr, freeRoleRating: 1, a,
    cap: undefined as unknown as L.Caps, roll: { pace: 0, anticipation: 0, decisions: 0, offTheBall: 0, marking: 0, flair: 0, positioning: 0, creativity: 0, agility: 0, workRate: 0 },
    marks: null, markers: [], ref: p.id, src: p, f, posAttack, facing: side === 0 ? 0 : 180, strongFoot: rf >= lf ? 1 : 0, weakFootPenalty: 20 - Math.min(lf, rf),
    leftFoot: lf, rightFoot: rf, baseX: bx, baseY: by, gkRating: p.pos[0], tbl: null, pslot: slot, posR: r,
    // udfordringen/dommeren (challenge.ts, judgeTackle): ukendte bytes starter som 0 (noterne), evnerne sættes efter hjemmebanen
    fouls: 0, foulsSuffered: 0, yellows: 0, reasons: [0, 0], b16: 0, skill: [], momentum: 0, w29: 0, w31: 0, b1d: 0, b1c: 0, injuredBy: null, temperCount: bff, bffBase: bff, grudge: null,
    sportsmanship: sh('sportsmanship'), temperament: sh('temperament'), pressure: sh('pressure'), consistency: sh('consistency'), isKeeper: gk,
    tacklesTried: 0, tacklesWon: 0, dribblesPast: 0, b6: 0, blocks: 0, shots: 0, shotsOnTarget: 0, penGoalsWon: 0,
  };
  g.cap = L.rollCaps(g);
  return g;
}

function attachView(m: GridMatchState, p: GP): void {
  const v = {
    side: p.side, slot: p.slot, x: p.x, y: p.y, posFlags: p.pos, pos: p.pos, posAttack: p.posAttack, plads: 0, condition: p.condition, w35: 0, passesInMove: 0,
    b2c: p.strongFoot, b2d: p.weakFootPenalty, busy: p.busy, facing: p.facing, momentum: 0, action: p.action, strongFoot: p.strongFoot, weakFootPenalty: p.weakFootPenalty,
    leftFoot: p.leftFoot, rightFoot: p.rightFoot, crossing: p.f.crossing, finishing: p.f.finishing, flair: p.f.flair, jumping: p.f.jumping, pace: p.f.pace, strength: p.f.strength,
    teamwork: p.f.teamwork, technique: p.f.technique, throwIns: p.f.throwIns, creativity: p.f.creativity, paceRoll: 0, anticRoll: 0, decRoll: 0, offBallRoll: 0, creatRoll: 0,
    instr: { lo: Number(p.instr & 0xffffffffn), hi: Number(p.instr >> 32n) }, staff: { id: p.src.id, nationName: m.nations[p.side], professionalism: p.src.attrs[ATTRS.indexOf('professionalism')] || 10, favoured: [], disliked: [] },
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
  const on = ctx.on;
  const onShot = ctx.onShot;                                                                  // kun spor (situation() skygger ctx)
  // init_match: publikums-bytene engine+0x1ad/+0x1ae (hjemmebanen), læst af kampværdierne, dommeren og motivationen
  const crowd = ctx.crowd ?? GRID_UNKNOWN.crowd, capacity = ctx.capacity ?? GRID_UNKNOWN.capacity, derby = ctx.derby ?? false;
  const sideByte = crowdBytes(crowd, ctx.ownGround ?? true);
  const compRep = ctx.compRep ?? GRID_UNKNOWN.compRep, final = ctx.final ?? false;
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
      // data → 0), −10 i derby; +0x33 er ikke porteret (læses ikke af motoren)
      g.w31 = derby ? -10 : 0;
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
      g.w31 = derby ? -10 : 0; g.slot = -1; g.active = false; g.rating = 6400; g.tbl = map.table; g.pslot = -1;
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
    sideByte, periodEnd: 495, shootoutState: null,
  };
  for (const p of gp) { p.skill = actionSkills(p); attachView(m, p); }
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
  const timeAddedOn = () => {
    const mn = (Math.trunc(stoppageEntry / 11) << 24) >> 24, h2 = m.periodEnd === 990;
    if (!(m.periodEnd === 495 || h2) || timeAdded[h2 ? 1 : 0]) return;
    if (h2 ? !(mn > 0x54 && mn < 0x5b) : !(mn > 0x27 && mn < 0x2e)) return;
    events.add(0x21c1, m.poss, 0, 0, 0, Math.max(2, Math.trunc(((m.stoppage << 24) >> 24) / 11)));
    timeAdded[h2 ? 1 : 0] = true;
  };
  // udskiftningerne (matchSubs.ts – sub_6c54a0's genvalg, sub_6d0b60, sub_6cda20, menneskets kø); computeren vælger kun for ctx.ai-hold
  const isAi = (s: Side) => !ctx.ai || ctx.ai[s];
  const subs = makeMatchSubs({ m, gp, rand, ai: isAi, subs: ctx.subs ?? [3, 3], periodEnd: () => m.periodEnd, rep: [ctx.rep?.[0] ?? 5000, ctx.rep?.[1] ?? 5000], aiPick: aiPicks,
    compType: ctx.compType ?? 0, onSub: (a, b, auto) => on?.sub?.(a, b, auto), onCarriedOff: (p) => on?.carriedOff?.(p) });
  /** sub_6cda20: rødt kort (efter statistikken) */
  const sendOff = (p: GP) => subs.sendOff(p);
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
    onBlock: ctx.onShot ? (q, S, d, soft, r) => ctx.onShot!('L', [q.side, q.pslot ?? q.slot, q.x, q.y, q.busy, q.roll.workRate, m.poss, m.ballH, m.lastTouch, S, d, soft ? 1 : 0, q.skill[0x24], r]) : undefined,
    takeBall: (p) => takeBall(p),
    challenge: (p, side, action) => challenge(p, side, action),
    judge: (d, p, type, action) => judge(d, p, type, action),
    foul: (d, p, j, c) => foul(d, p, j, c as ChallengeOut),
    sourceDuel: (p, V) => sourceDuel(p, V),
    gkCatch: (d, diff) => gkCatch(d, diff),
    ballOut: (last) => ballOut(last),
    // sub_70a910/sub_70c040 (bolden i mål fra en aflevering/løs bold, 1.895/1.623 instr.) er ikke porteret: *estimeret* – bolden går
    // videre over mållinjen (sub_6cd490 → målspark/hjørne), dvs. ingen mål eller selvmål ad den vej
    intoGoal: () => { dbg('intoGoal'); },
    playerTurn: (p) => L.playerTurn(m, p, rand, hooks),
    facingGoal: (p) => GRID_UNKNOWN.facingGoal(m, p, rand),
    restart: (state, side, x, y) => restart(state, side, x, y),
    card: (p, code) => { if (code === 2) st(p.side).yellows++; else if (code >= 3 && code <= 6) { st(p.side).reds++; sendOff(p); } if (code >= 2 && code <= 6) on?.card?.(p, code); },
    teamFoul: (side) => { st(side).fouls++; },
    passStarted: (p) => { st(p.side).passes++; m.pendingPass = p.side; },
    nationOk: () => GRID_UNKNOWN.nationOk,
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
    if (c) { m.poss = -1; m.carrier = null; c.w29 = 0; c.momentum = 0; }
    const lp = m.lastPasser;
    // assisten (*estimeret* – originalens +0x478a er ikke afkodet): den medspiller, der sidst afleverede til ham
    p.giver = lp && lp.side === p.side ? lp as GP : null;
    if (lp && lp.side === p.side) {
      if (p.pos === L.POS.keeper) lp.rating += 0x6c;
      else if (p.side === 1 ? p.y >= 6 : p.y < 6) lp.rating += 0x60;                          // modtaget i egen halvdel
      else if (p.side === 1 ? p.y < 3 : p.y > 8) lp.rating += 0x96;                           // i den sidste tredjedel
      else lp.rating += 0x78;
    }
    m.lastPasser = null; m.receiver = null; m.passTo = null;
    if (p.pos === L.POS.keeper && inBoxAt(p.side, p.x, p.y) && m.inFlight[p.side] === 0) { p.facing = p.side === 0 ? 0 : 180; m.ballH = -1; }
    m.inFlight[p.side] = 1; m.inFlight[other(p.side)] = 0;
    if (p.side === 1 ? p.y >= 6 : p.y < 6) m.ballEvent = 0;                                  // 0x6f086c: taget på egen halvdel
    m.ballX = p.x; m.ballY = p.y; m.poss = p.side; m.carrier = p; m.ballDir = p.facing; m.ballSpeed = 0;
    m.lastTouch = p.side; m.touchCount[p.side]++; if (m.touchCount[other(p.side)] > 0) m.touchCount[other(p.side)] -= 10;
    p.w29 = 0; p.momentum = 0;
  };
  const restart = (state: number, side: Side, x: number, y: number) => {
    if (m.pendingPass !== -1) { dbg('pass:dead' + state); m.pendingPass = -1; }
    m.state = state; m.poss = side; m.carrier = null; m.receiver = null; m.passTo = null; m.ballX = clampX(x); m.ballY = clampY(y); m.ballH = -1; m.ballSpeed = 0;
  };

  // ---------------------------------------------------------------- dødboldens opstilling (sub_6c54a0's dispatch 0x6c68e5, tabel 0x6c6a08)
  /** sub_6f0970 (sikker): boldholderen slipper bolden – besiddelse −1, ingen boldholder, hans +0x29 og momentum 0 */
  const release = () => { const c = m.carrier as GP | null; m.poss = -1; m.carrier = null; if (c) { c.w29 = 0; c.momentum = 0; } };
  /** sub_6f46b0 med cellebyten fra positionstabellen (lav nibble x, høj y): taktikken +0xf56e/+0xf572 + 216·plads + 108·att + 12·bx + by.
   *  Side 1's tabel ligger spejlet i hukommelsen (absolutte felter) – tableCell giver det samme. */
  const cellOf = (p: GP, att: 0 | 1, bx: number, by: number): [number, number] => (p.tbl ? tableCell(p.tbl, p.side, p.pslot, att, bx, by) : [p.x, p.y]);
  const put = (p: GP, x: number, y: number) => { p.x = x; p.y = y; };
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
    m.loftCountdown = 0; m.passTo = null; m.ballSpeed = 0; m.ballH = 0; m.lastPasser = null; m.receiver = null; m.margin = 0; m.prio = null; m.inc = null;
    if (m.paused) return;
    const entry = m.clock;                                                                     // [esp+0x24]: minuttet før tidsspildet (0x6c55b5)
    subs.apply(); applyTactic();                                                               // menneskets ventende udskiftninger/taktik (*estimeret* her)
    // 0x6c55ce–0x6c568d: efter minut 60 ved rand(6) = 0 "knackered" (0x21cf) om den første (side 0 før 1, indeks 0–19) på banen med
    // kondition < 6750 (0x96d30c) uden arbejdsrul (+0x10d) – højst én
    if (((Math.trunc(entry / 11) << 24) >> 24) > 60 && rand(6) === 0) {
      knack: for (const s of [0, 1] as Side[]) for (const q of gp) if (q.side === s && q.slot >= 0 && q.condition < 6750 && !q.roll.workRate) { comment(0x21cf, q, q.side); break knack; }
    }
    aiRetune();
    stoppageEntry = entry; subs.gate(entry, timeAddedOn);                                                             // 0x6c581f/0x6c59c8: computerens udskiftninger (tillægstiden 0x6c5884 imellem)
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
    return [p.view ? H.tacticalColumn(p.view, x, p.posR, undefined, rand) : x, y];
  };

  const hooks: L.Hooks = {
    ballCarrier: (p) => carrierTurn(p as GP),
    moveTo: (p0, x, y, flags) => offBallMove(p0 as GP, clampX(x), clampY(y), flags),
    place: (p, x, y) => { p.x = clampX(x); p.y = clampY(y); },
    tacticalCell: (p) => cellWithDrift(p as GP),
    formationCell: (p) => GRID_UNKNOWN.formationCell(m, p as GP),
    runTarget: (p, mode) => GRID_UNKNOWN.runTarget(m, p as GP, mode, GRID_UNKNOWN.formationCell(m, p as GP), rand),
    zonalPick: (p) => GRID_UNKNOWN.zonalPick(m, p as GP, rand),
    manMarkTarget: (p) => L.manMarkTarget(m, p),                                             // sub_7160f0 (sikker); vores Tactic sætter ikke bit 4
    backOnside: (p) => backOnside(p as GP, false),                                            // sub_6f5b80(p, 0): et skridt (0x71496c, 0x7158e0)
    takeBall: (p) => takeBall(p as GP),
    turn: (p, x, y) => P.turnTo(p as GP, p.x, p.y, x, y),                                    // sub_6f4920 (sikker)
    canFollow: (mk, x, y) => L.canFollow(m, mk, x, y),                                      // sub_6bce20 (sikker)
    teammatesAhead: (p) => gp.filter((o) => o.active && o.side === p.side && o !== p && (p.side === 0 ? o.y > p.y : o.y < p.y)).length,
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
        m.periodEnd = 0; comment(0x2001, null, 0); return 4;                                   // 0x6be4cd FINAL_WHISTLE (post_period_end_events 0x6be120, ligakamp)
      }
      if (pe === 1155 && m.clock > 1155 + m.stoppage) {
        m.period = 3; m.periodEnd = 1320; m.clock = 1155; m.stoppage = 0; release(); kickoffPositions(secondKick); secondKick = other(secondKick); on?.halftime?.(); return 3;
      }
      if (pe === 1320 && m.clock > 1320 + m.stoppage) {
        if (ctx.needsWinner?.(m.goals[0], m.goals[1])) m.shootout = 4;
        m.periodEnd = 1; comment(0x2001, null, 0); return 4;                                   // 0x6be4cd FINAL_WHISTLE (*placering estimeret* efter forlænget)
      }
      return 0;
    },
    ballOut: (last) => ballOut(last),
    comment: (id, p1, s1, p2, s2, x) => comment(id, p1 as GP | null | undefined, s1, p2 as GP | null | undefined, s2, x),   // sub_6d6f70
    offsideGiven: (side) => { st(side).offsides++; on?.offside?.(side); },
    distToTarget: (bx, by, tx, ty) => L.dist(bx, by, tx, ty),
    landing: (x, y) => P.land(x, y),                                                         // sub_6c9cd0
    receive: (p, power, ox, oy) => P.receive(p as GP, power, ox, oy),                        // sub_6f6c00
    topOfTick: ctx.onTop ? () => ctx.onTop!(m) : undefined,
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
    return {
      side: s, inMatch, strength: [strength(0), strength(1)], rep: [ctx.rep?.[0] ?? 5000, ctx.rep?.[1] ?? 5000], territory: [...territory] as [number, number, number],
      clock: m.clock, periodEnd: m.periodEnd, crowd: [sideByte[0], sideByte[1]], goals: [m.goals[0], m.goals[1]], firstLeg: null,
      fixtureFlags: 0, fixtureKind: ctx.league === false ? 0 : 33, onPitch: [gp.filter((q) => q.side === 0 && q.active).length, gp.filter((q) => q.side === 1 && q.active).length],
      sameDivision: ctx.league !== false, compLink: ctx.league !== false, league: null, mgrAttacking: null, rivals: !!ctx.derby, prevMode: m.aiMode[s], prevR: aiR[s],
    };
  };
  const preMatchMode = () => { if (!GRID_UNKNOWN.aiMode) return; for (const s of [0, 1] as Side[]) { const r = aiModeOf(modeInput(s, false)); aiR[s] = r.r; m.aiMode[s] = r.mode; } };
  /** sub_6c54a0 §5 (notes/team-flags.md, 6df460-ai-mode.md; ved hver dødbold): tilstanden for BEGGE hold (løkken har ingen AI-test), tidsspild for
   *  holdet med bolden i tilstand 3/4, og for computerhold ved skift (eller i første minut) holdflag og instruktioner. Uden manager: originalens
   *  "uden mgr"-regler (1 → angreb hvis okAtt, 2 → normal, 3 → defensiv + kontra, 4 → defensiv + MBB, 5 → normal + kontra); tilstand 2–5: alle
   *  0x400000. Ikke porteret: 0x6d10a0's fremadløb i tilstand 1, omlægningen 0x6e1090. */
  const aiRetune = () => {
    if (m.state === 5 || m.paused) return;
    const changed = [false, false];
    for (const s of [0, 1] as Side[]) {
      if (!GRID_UNKNOWN.aiMode) { changed[s] = m.clock <= 1 || m.aiMode[s] !== 2; m.aiMode[s] = 2; continue; }   // uden 0x6df460: altid normal
      const r = aiModeOf(modeInput(s, true));
      changed[s] = r.mode !== m.aiMode[s] || m.clock <= 1;
      aiR[s] = r.r; m.aiMode[s] = r.mode;
    }
    if (GRID_UNKNOWN.aiMode && (m.poss === 0 || m.poss === 1)) { const mo = m.aiMode[m.poss]; if (mo === 3 || mo === 4) { const r = rand(10); m.clock += r; m.stoppage += rand(Math.trunc(r / 2)); } }
    for (const s of [0, 1] as Side[]) {
      if ((ctx.ai && !ctx.ai[s]) || !changed[s]) continue;
      const mode = m.aiMode[s];
      const okAtt = !['3-4-3', '3-5-2 Attacking'].includes(maps[s].preset?.name ?? '');
      const ment = mode === 1 ? (okAtt ? 0x10000 : 0x20000) : mode === 3 || mode === 4 ? 0x8000 : 0x20000;
      let f = m.teamFlags[s];
      f = setTeamOption(f, ment); f = setTeamOption(f, mode === 3 || mode === 5 ? 0x1000 : 0x800); f = setTeamOption(f, mode === 4 ? 0x4000 : 0x2000);
      m.teamFlags[s] = f;
      if (mode >= 2) for (const q of gp) if (q.side === s) q.instr = (q.instr & ~0xc00000n) | 0x400000n;
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
    p.x = nx; p.y = ny;
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
    if (rv) { if (rv.side !== p.side) { takeBall(p); p.rating += 28; } return; }
    P.turnTo(p, p.x, p.y, 4, p.side === 0 ? 11 : 0);
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
  const challenge = (p: GP | null, side: Side, action: number): ChallengeOut => {
    const n = onShot && m.ballX >= 0 && m.ballX <= 8 && m.ballY >= 0 && m.ballY <= 11 ? gp.filter((o) => o.active && o.side !== side && o.x === m.ballX && o.y === m.ballY).length : -1;
    const c = getOppositionChallenge(m, p, side, action, 0, rand, (q) => GRID_UNKNOWN.freeRun(m, q, rand));
    onShot?.('D', [action, side, n, m.ballH, c.d ? 1 : 0, c.d ? c.value : 0, c.d ? c.type : 0]);
    return c;
  };
  const minute = () => Math.trunc(m.clock / 11);
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
  const foul = (d: GP, p: GP, j: JudgeResult, c: ChallengeOut) => {
    dbg('foul:' + c.type);
    const r = decideFoulPunishment(rand, { minute: minute(), shootout: !!m.shootout, addTeamFoul: () => { st(d.side).fouls++; } }, d, p, j.ret, j.kind, j.severity, c.clear, j.hurt);
    if (r.code === 7) restart(7, p.side, p.x, p.y);                                         // indirekte frispark
    else if (inBoxAt(d.side, p.x, p.y)) {                                                   // straffe (0x6f16ea)
      d.rating -= 500; m.penaltyFor = p;
      if (rand(d.pressure + 6) === 0) adjustMorale(d, -rand(8), rand);
      restart(5, p.side, 4, d.side === 0 ? 1 : 10);
    } else restart(6, p.side, p.x, p.y);
    if (r.code === 2) st(d.side).yellows++;
    else if (r.code >= 3 && r.code <= 6) { st(d.side).reds++; sendOff(d); }                  // send_off (sub_6cda20)
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
    if (rand(30 * d.pressure + 20) === 0) adjustMorale(d, -rand(3), rand);
    return false;
  };
  /** Udfordreren vinder bolden (sub_6f09f0 0x6f1f0d–0x6f283a; skuddets 0x702f35–; afleveringens §5.3). rel = værdien til momentum.
   *  ownRating: boldholderens karakterfradrag (kun move_to). */
  /** sub_716c90 advantage_foul (sikker): kommentar 0x20dd, kort uden offer til p (sub_6cfd40 → sub_6eab60, art 6), kortets kommentar valgt
   *  med rand(8)/rand(3) (klubtype-kommentaren 0x20f5 udeladt – klubpostens +0x77 kendes ikke), udvisning ved kode 3/4. */
  const advantageFoul = (p: GP) => {
    dbg('advFoul');
    const code = cardWithoutVictim(rand, m.official, p, 6, minute());
    if (code === 2 || code === 3 || code === 4 || code === 9) { if (rand(8) !== 0) rand(3); }
    if (code === 2) st(p.side).yellows++;
    else if (code === 3 || code === 4) { st(p.side).reds++; sendOff(p); }                      // sub_6cda20
    if (code >= 2 && code <= 4) on?.card?.(p, code);
  };
  const winBall = (d: GP, p: GP, c: ChallengeOut, rel: number, jA: boolean, ownRating: boolean, adv = false) => {
    let perType = true;
    // boks-kommentaren: kun ved hård type, "hurt" eller rand(w31) < −10 (C'en 0x6f1f39 – noten har tegnet vendt); den springer typens gren over
    if (isHardChallenge(c.type) || jA || randS(rand, d.w31) < -10) {
      if (inBoxAt(d.side, d.x, d.y) && rand(2) === 0) { rand(50); perType = false; }
    }
    if (perType && c.type === 1 && !gkCatch(d, rel + 200)) return;
    takeBall(d);
    if (ownRating) {
      if (inBoxAt(p.side, p.x, p.y)) { p.rating -= 250; if (rand(30 * p.pressure + 20) === 0) adjustMorale(p, -rand(3), rand); }
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
    } else {
      if (m.ballH >= 0 && m.ballH <= 3) m.ballH = 0;
      P.turnTo(d, p.x, p.y, 4, d.side === 0 && m.ballH !== -1 ? Math.min(p.y + 3, 11) : Math.max(p.y - 3, 0));   // sub_6f4920
    }
    d.tacklesWon++;
    const defender = (d.pos & 4) !== 0 || (d.pos & 2) !== 0;
    let gain = defender ? (loose ? 120 : 200) : loose ? 240 : 400;
    if (p.y >= 3 && p.y <= 8) gain = Math.trunc(gain * 0.85);
    d.rating += gain;
    if (L.dist(d.x, d.y, 4, d.side === 0 ? 0 : 11) <= 1 || L.isLastMan(m, d)) {
      d.rating += 300; d.b6++;
      if (rand(30 * d.morale + 50) === 0) adjustMorale(d, rand(5), rand);
    }
    p.busy += c.delayCarrier;
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
    if (i.res === 8) {                                                                        // offside, der ventede
      st(d.side).offsides++;
      m.inc = null; restart(7, v, i.x, i.y); m.inc = null; return true;
    }
    const code = i.p ? decideFoulPunishment(rand, { minute: minute(), shootout: !!m.shootout, addTeamFoul: () => { st(d.side).fouls++; } }, d, i.p, i.res as 0 | 1 | 7, i.jC, i.jB, i.b !== 0, false).code
      : P.handsPunish(d, i.jC, i.jB, i.b !== 0);                                               // 0x6ea4e0 / 0x6e9630
    const inAtt = i.x >= 2 && i.x <= 6 && (v === 0 ? i.y >= 10 : i.y <= 1);
    if (code === 7) restart(7, v, i.x, i.y);
    else if (inAtt) { restart(5, v, 4, v === 0 ? 10 : 1); m.penaltyFor = i.p; d.rating -= 500; }
    else restart(6, v, i.x, i.y);
    if (code === 2) st(d.side).yellows++;
    else if (code >= 3 && code <= 6) { st(d.side).reds++; sendOff(d); }                       // send_off (sub_6cda20)
    if ((code >= 3 && code <= 6) || (inAtt && code !== 7)) d.b16 = 1;
    m.inc = null; return true;
  };
  // ---------------------------------------------------------------- optøjer ved død bold (sub_6d1210 / sub_716630; sikker, kommentarerne udeladt)
  /** sub_7164b0 temperCheck(level, target): m = 8 mod hans "nag" (+0x1a6), ellers 1; a = ftol(ag²); niveau 1: rand(110 − s8(ftol(ag))) < m,
   *  2–5: rand(ftol(4e5|2e6|4e6|8e6 / a)) < m. Tomme pladser i truppen (bænken findes ikke her) har ag = 0 (ctor 0x6eadee). */
  const temperCheck = (p: GP | null, level: number, target: GP | null): boolean => {
    const ag = p ? p.agitation : 0, mm = p && target && target === p.grudge ? 8 : 1, a = Math.trunc(ag * ag);
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
    const opps = gp.filter((o) => o.active && o.side !== p.side && o.x === p.x && o.y === p.y);
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
    for (const q of gp) if (q.active && q.slot <= 10 && q.busy < 2 && q !== p && temperCheck(q, 1, null)) { q.x = p.x; q.y = p.y; }   // sub_6f46b0
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
  const deadBallTemper = (): boolean => {
    if (b8eb4 === 1) { settleFights(); b8eb4 = 2; return true; }
    // run_match_steps 0x6b9b64–0x6b9bbc: afsparkets kommentar én gang pr. afspark (+0x1ca), golden goal +0x1a8 ikke med:
    // START_MATCH (0x212f) ved uret ≤ 1, ellers KICK_OFF (0x1f74), side = +0x8eae; trinnet fortsætter (0x6ba743 → 0x6b9aea)
    if (!kickCommented && m.state === 8) { comment(m.clock <= 1 ? 0x212f : 0x1f74, null, m.poss); kickCommented = true; }
    if (m.state !== 0 && b8eb4 === 0 && !m.paused) {
      for (let n = 0; n < 20; n++) {
        const side = rand(2) as Side, slot = rand(20);
        const p = gp.find((q) => q.side === side && q.slot === slot) ?? null;
        if (!p || !p.active) { if (temperCheck(p, 1, null)) break; continue; }
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
    return rand(7) === 0 && applyIncident();                                                  // kommentar 0x20ef (dens rand udeladt)
  };
  /** sub_6bba80 (sikker for sideeffekten): før skuddet bruges fordelen, medmindre synderens hold har bolden, det er en straffesparksforseelse,
   *  eller rand(200) = 0. Returværdien (1/2) går til skudrutinen og er ikke afkodet – kun rydningen er med. */
  const advantageAtShot = () => {
    const i = m.inc;
    if (!i) return;
    if (m.poss === i.d.side) return;
    const v = victimSide(i);
    if (i.res !== 8 && i.x >= 2 && i.x <= 6 && (v === 0 ? i.y >= 10 : i.y <= 1)) return;
    if (rand(200) === 0) return;
    m.inc = null;
  };

  // ---------------------------------------------------------------- knock-tjekket 0x6cfe10 og skaden 0x6d0980 (notes/advantage-knock.md §B–C)
  // Ingen skadedatabase i kampen: ingen bærer en skade (inj = 0, kropsdel −1), så kun rand-tabellerne bruges. Skadens registrering
  // (0x62be00) og behandlingen/udskiftningen 0x6d0b60 er ikke porteret.
  const KNOCK_K: Record<number, number> = { 1: 1 / 28, 12: 1 / 11, 19: 0.1, 21: 1 / 15, 33: 0.1, 34: 0.125, 41: 0.125, 42: 0.02, 43: 0.0625, 44: 0.5556, 45: 0.1, 46: 0.1, 47: 0.4762 };
  const prone = (q: GP) => q.src.attrs[ATTRS.indexOf('injuryProneness')] || 10;            // spillerpost +0x2d
  const injure = (kind: number, sev: number, q: GP, o: GP | null) => {
    const n = m.knocks;
    if (n > 3 && rand(n) !== 0 && rand(500) !== 0) return;
    if (n > 6) return;
    void kind;                                                                                // 0x62be00 (registreringen) ikke porteret
    dbg('knock');
    q.injuredBy = o; if (o) o.w31 -= 10;
    on?.knock?.(q);
    let Lc = 0;
    if (sev > 50) { q.b1c = 1; q.condition -= sev * sev; }
    else { Lc = rand(Math.trunc(sev * sev * 0.5)); q.condition -= Lc; q.pendingCond = rand(Math.trunc(Lc * 0.5)); q.f.stamina *= 0.5; }   // +0xd5
    if (q.condition < 5000) { m.b8eb5 = 1; q.b1d = 1; q.b1c = 1; }
    else if (q.condition < prone(q) * 25 + 7100) { q.busy = 5; m.b8eb5 = 1; q.b1d = 1; }
    else { q.busy = 3; if (Lc >= 500 && q.b1c) { m.b8eb5 = 1; q.b1d = 1; } }
    q.condition = Math.max(1, Math.min(10000, q.condition));
    if (m.b8eb5) m.knocks++;
  };
  const knockCheck = (A: GP, codeA: number, B: GP | null, codeB: number, offBall: boolean) => {
    const sevOf = () => { let v = rand(rand(102)); if (v > 50 && rand(3) !== 0) v = rand(rand(76)); return v; };
    const sev = [sevOf(), sevOf()];
    const fit = (q: GP, proneTest: GP) => {
      const c = Math.max(q.condition * 0.5 + 5000, 1000), k = Math.fround((10000 / c) * 4);
      const pr = prone(q);
      return prone(proneTest) > 10 ? pr * k * 0.1 : ((pr - 10) * 0.1 + 1) * k;              // NB B testes med A's Injury Proneness (sic)
    };
    const f = [fit(A, A), B ? fit(B, A) : 4];
    if (A.condition < 4000) { injure(-1, 0, A, null); return; }
    if (offBall) {
      if (rand(50000) < Math.trunc(f[0] * 10)) injure([1, 1, 1, 3, 3, 3, 4, 4, 2, 2, 5][rand(11)], sev[0], A, null);
      return;
    }
    const P2 = [A, B], code = [codeA, codeB];
    for (let i = 0; i < 2; i++) {
      const q = P2[i], o = P2[1 - i];
      if (!q) continue;
      if (q === m.carrier && o) {
        f[i] *= o.f.strength * (KNOCK_K[code[1 - i]] ?? 0.2);                                 // modspillerens Strength +0xd9
        if (code[1 - i] === 44 || code[1 - i] === 47) sev[i] *= 2;
        if (code[1 - i] === 34) sev[i] = Math.trunc(sev[i] * 1.1);
      }
      if (code[i] === 5) f[i] *= 10 / Math.max(q.f.agility, 2);
      if (rand(50000) >= Math.trunc(f[i] * 10)) continue;
      if (code[i] === 5) { injure([9, 9, 9, 6, 10][rand(5)], sev[i], q, null); continue; }
      if (m.ballH === 4 && o) { injure(11, sev[i], q, o); continue; }
      if (!o) {
        const r = rand(11);
        if (r === 6 || r === 7) { injure(2, sev[i], q, null); injure(5, sev[i], q, null); }   // manglende break, sic
        else injure([1, 3, 3, 3, 4, 4, 0, 0, 5, 1, 1][r], sev[i], q, null);
        continue;
      }
      injure(1 + rand(9), sev[i], q, o);
    }
  };

  // ---------------------------------------------------------------- holdebolden sub_70ec80 (notes/70ec80-hold.md; sikker, kommentarerne udeladt)
  const holdBall = (p: GP) => {
    const tired = rand(Math.trunc(((10000 - Math.trunc(p.condition)) ** 2) / 50000));
    if (p !== m.carrier) return;
    const r = randS(rand, 50 * m.ballH);
    const vc = randS(rand, p.momentum - tired + p.skill[0x10] - r);
    const c = challenge(p, p.side, 0x10);
    const d = c.d;
    knockCheck(p, 0x10, d, c.type, false);
    const keeps = (vd: number) => {
      if (!inBoxAt(other(p.side), p.x, p.y) && randS(rand, p.w31) < -10) p.agitation = Math.min(Math.max(p.agitation * 1.05, 2 * (25 - p.temperament)), 100);
      m.lastTouch = p.side; m.touchCount[p.side]++; if (m.touchCount[other(p.side)] > 0) m.touchCount[other(p.side)] -= 10;
      p.momentum = Math.max(-200, Math.min(200, p.momentum + vc - vd));
      if (d) d.busy += c.delayChallenger;
      if (m.ballH !== -1 && p.action !== 0x10) m.ballH = 0;
      dbg('hold:keeps');
    };
    if (!d) return keeps(0);
    let jA = false;
    if (!(c.value < vc && rand(5) !== 0)) {
      const j = judge(d, p, c.type, -1);
      jA = j.hurt;
      if (j.ret !== 0) {
        if (rand(30) === 0 && !c.clear) queueIncident(c.type, d, p, j.ret, p.x, p.y, j.kind, j.severity);   // 0x70ef39
        else { foul(d, p, j, c); return; }
      }
    }
    tried(d, c);
    if (vc > c.value) return keeps(c.value);
    // udfordreren vinder (0x70f80a) – som move_to, men uden holderens karakterfradrag, ×0,85 og sidste mand-bonussen
    let perType = true;
    if ((isHardChallenge(c.type) || jA || randS(rand, d.w31) < -10) && inBoxAt(d.side, d.x, d.y) && rand(2) === 0) { rand(50); perType = false; }
    if (perType && c.type === 1 && !gkCatch(d, c.value - vc)) return;
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
    }
    d.tacklesWon++;
    d.rating += d.pos & 6 ? (loose ? 120 : 200) : loose ? 240 : 400;
    p.busy += c.delayCarrier;
    dbg(loose ? 'hold:lostLoose' : 'hold:lost');
  };

  const tried = (d: GP, c: ChallengeOut) => { d.action = c.type; d.tacklesTried++; d.rating -= d.pos & 0x30 && d.pos & 0x880 ? 59 : 70; };

  /**
   * sub_6f09f0 MATCH_PLAYER::move_to for boldholderen (sikker fra 0x6f0ccf; notes/6f09f0-challenge.md). action 0xf/0x11/0x12.
   * stepTo = false: holdebolden (handling 0x10, sub_70ec80 er ikke læst) – *estimeret* som move_to med evnen 0xf og uden skridt.
   * Ikke modelleret: banens byte +1 (intet fradrag), konditionstabet for skridtet (0x6f3c88), markørerne der følger (sub_714d40).
   */
  const carrierMove = (p: GP, tx: number, ty: number, action: number, stepTo = true) => {
    const arg5: number = 0;                                                                   // kalderne giver 0
    p.busy++;
    if (stepTo && p.x === tx && p.y === ty && action !== 0xf) { markersFollow(p); return; }      // 0x6f0a62
    const nx = clampX(p.x + Math.sign(tx - p.x)), ny = clampY(p.y + Math.sign(ty - p.y));
    const tired = rand(Math.trunc(((10000 - Math.trunc(p.condition)) ** 2) / 50000));
    const base = p.skill[action === 0xf || action === 0x10 ? 0xf : action === 0x12 ? 0x12 : 0x11];
    let vc = randS(rand, base - tired + p.momentum);
    vc -= randS(rand, 50 * m.ballH ** 3);
    vc += randS(rand, Math.trunc(p.w29 / 10) - 30);
    const c = challenge(p, p.side, action);
    const d = c.d;
    let jA = false, adv = false;
    if (d) knockCheck(p, action, d, c.type, false);                                           // sub_6cfe10 (kun med udfordrer)
    if (d) {
      if (!(c.value < vc && rand(5) !== 0)) {                                                 // 0x6f1296: svagere udfordrer slipper 4/5
        const j = judge(d, p, c.type, -1);
        jA = j.hurt;
        if (j.ret !== 0) {
          if (!(rand(30) === 0 && !c.clear)) { foul(d, p, j, c); return; }
          queueIncident(c.type, d, p, j.ret, p.x, p.y, j.kind, j.severity);                   // 0x6f1425: fordel
        } else if (jA && (inBoxAt(other(p.side), p.x, p.y) || c.clear)) adv = true;          // 0x6f12b4 → 0x6f1e51: "ramt" i feltet uden frispark
      }
      tried(d, c);
    }
    let lost = p.b1d !== 0;
    if (!lost && arg5 !== 4 && vc < 1 && rand(Math.trunc(5 * p.f.technique + 75)) === 0 && (!d || c.value < vc)) lost = true;
    if (!lost && d && !(vc > c.value)) { winBall(d, p, c, c.value - vc - 200, jA, true, adv); return; }
    if (lost) {                                                                               // 0x6f39af
      dbg('carrier:lost');
      if (m.pendingPass !== -1) m.pendingPass = -1;                                           // bolden bliver i feltet og følger skridtet
      m.poss = -1; m.carrier = null; p.w29 = 0; p.momentum = 0; p.busy = rand(2) + 1; p.rating -= 150;
      if (rand(20 * (p.pressure + 1)) === 0) adjustMorale(p, -rand(3), rand);
    } else {                                                                                  // KEEPS 0x6f283a
      if (!inBoxAt(other(p.side), p.x, p.y) && randS(rand, p.w31) < -10) p.agitation = Math.min(Math.max(p.agitation * 1.05, 2 * (25 - p.temperament)), 100);
      m.lastTouch = p.side; m.touchCount[p.side]++; if (m.touchCount[other(p.side)] > 0) m.touchCount[other(p.side)] -= 10; m.touchCount[p.side] += 5;
      // 0x6f29a9–0x6f29c0: fld 0,0; fcomp st(1); je → værdien er min(x, 0) – momentum kan kun FALDE her (før max(0, …), sic)
      p.momentum = Math.max(-200, Math.min(200, p.momentum + Math.trunc(Math.min(0, vc - Math.max(c.value + 50, 250) + p.f.technique * p.f.dribbling))));
      if (!gp.some((o) => o.active && o.side !== p.side && o.x === p.x && o.y === p.y)) p.momentum = Math.min(200, p.momentum + 50);
      if (d) {
        if (action !== 0xf) {
          d.busy += Math.max(c.delayChallenger, 2); p.rating += 100; p.dribblesPast++;
          if (rand(20 * (p.morale + 1)) === 0) adjustMorale(p, rand(5), rand);
        } else { d.busy += c.delayChallenger; p.dribblesPast++; p.rating += 75; }
        dbg('carrier:kept');
      } else p.rating += 9;
      m.ballH = 0;
    }
    if (!stepTo) return;
    // boldholderens retning ændres ikke af skridtet (0x6f4150: ingen slutvending for +0xf582) – kun af sub_6f4920 før løbet
    const ox = p.x, oy = p.y;
    p.x = nx; p.y = ny;
    m.ballX = nx; m.ballY = ny;                                                               // også den tabte bold følger skridtet (0x6f40f9)
    markersFollow(p);                                                                         // 0x6f3bf9
    stepDrain(p, ox, oy);                                                                     // 0x6f3c88
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
  const sourceDuel = (p: GP, V: number): { stop: boolean; w40: number } => {
    const c = challenge(p, p.side, 0x6c);
    const cd = c.d;
    if (!cd) return { stop: false, w40: 0 };
    if (c.value < p.momentum + 200) return { stop: false, w40: c.value };
    const j = judge(cd, p, c.type, 0x6c);
    if (j.ret !== 0) {
      if (rand(10) === 0 && !c.clear) { queueIncident(c.type, cd, p, j.ret, p.x, p.y, j.kind, j.severity); return { stop: false, w40: c.value }; }   // 0x6fb662: fordel
      dbg('pass:foul'); foul(cd, p, j, c); return { stop: true, w40: c.value };
    }
    tried(cd, c);
    dbg('pass:tackled');
    winBall(cd, p, c, V - 400, j.hurt, false);
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
  const shoot = (p: GP, d: { action?: number; quality: number; special?: number }, header = false) => {
    shotMark.side = p.side; shotMark.minute = Math.trunc(m.clock / 11);                       // sub_702050 0x70213d/0x70215b
    const opp = other(p.side);
    const k = gp.find((o) => o.active && o.side === opp && o.pos === L.POS.keeper);
    const type = header ? SHOT.HEADER : d.action === ACTION.penaltyShot ? SHOT.PENALTY : d.action === ACTION.freeKickShot ? SHOT.FREE_KICK : lastShotType;
    ctx.onShot?.('H', [p.side, p.pslot ?? p.slot, p.x, p.y, type, d.quality, 0, d.special ?? 1, 0, 0, p.facing, p.w29, p.momentum]);
    // 0x7021d5–0x702258 (sikker): den forkerte fod – sub_713e90(type, x, y, 4, målrækken, D + 1) giver p = 12·(20 − fod) (0 for
    // hovedstød/dødbolde), og S −= rand(p) (0x702241); resten af sub_702050 bruger den nye S ([esp+0x69c]). Retningen sub_6cb6c0 er
    // boldens retning (+0x8ed8), når skytten står på (4, målrækken).
    const gyS = goalRow(p.side);
    const S = d.quality - footPenalty(type, (p.x === 4 && p.y === gyS ? m.ballDir : H.cellDirection(p.x, p.y, 4, gyS)) - p.facing,
      L.dist(p.x, p.y, 4, gyS), shotAttrs(p), rand);
    const high = highFlag(type, rand);                                                        // 0x7023a6: før keeperværdien
    const kv = k ? keeperValue({ base: keeperBase(k.gkRating, k.f.handling, k.f.agility, k.form), w3b: k.matchCA, reflexes: k.f.reflexes, goalsConceded: m.goals[opp === 0 ? 1 : 0],
      b8eaa: m.ballSpeed, distToBall: L.dist(k.x, k.y, p.x, p.y), isKeeper: true, down: k.busy, side: opp, x: k.x, y: k.y, covers: H.keeperCovers(k.view!, p.x, p.y) }, p, type, rand) : { K: 0, state: 3, fumble: false };
    ctx.onShot?.('K', [kv.K, kv.fumble ? 1 : 0]);
    // sub_702050 0x70244e–0x70362d (sikker): udfordringen før skuddet – sub_6c87e0 med handling 0x6d, undtagen ved boldhøjde 4, param 4 og
    // skudtyperne 0x33/0x35 (straffe/frispark). Skytten har ingen driblingsværdi: dommeren kaldes, når V_d ≥ skyttens momentum, og
    // udfordreren vinder bolden, når skudscoren S ≤ V_d. flag9 ([esp+0x20]) er ikke afkodet → 0.
    if (!header && m.ballH !== 4 && type !== SHOT.PENALTY && type !== SHOT.FREE_KICK) {
      const c = challenge(p, p.side, 0x6d);
      const cd = c.d;
      if (cd) {
        let jA = false;
        if (c.value >= p.momentum) {
          const j = judge(cd, p, c.type, -1);
          jA = j.hurt;
          if (j.ret !== 0) {
            if (!(rand(50) === 0 && !c.clear)) { dbg('shot:foul'); foul(cd, p, j, c); return; }
            queueIncident(c.type, cd, p, j.ret, p.x, p.y, j.kind, j.severity);                  // 0x7025a4: fordel, skuddet går videre
          }
        }
        tried(cd, c);
        if (S > c.value) cd.busy += c.delayChallenger;                                        // 0x70353c: skuddet går videre
        else { dbg('shot:stopped'); winBall(cd, p, c, c.value - S - 200, jA, false); return; }
      }
    }
    p.action = 0x6d;                                                                          // 0x70388a: skytten får handlingen 0x6d
    // 0x7038a2–0x703a28 (sikker): ved et normalt skud (param 1, ikke straffe/frispark) dømmer linjevogteren offside på en anden angriber –
    // sub_6cfd70 → sub_6ea760 med skytten som excl og målrækken som mål. rand(500) = 0: overset → fordelen (kode 8), skuddet går videre
    // som param 2; ellers frispark til modstanderne, hvor offside-spilleren står, og skuddet er væk.
    let param = d.special ?? 1;
    if (type !== SHOT.PENALTY && type !== SHOT.FREE_KICK && param === 1) {
      const o = GRID_UNKNOWN.offsidePlayer(m, p.side, p.y, p.side === 0 ? 11 : 0, p, rand);
      onShot?.('N', [1, p.side, p.y, p.side === 0 ? 11 : 0, 1, p.side === 0 ? m.lineSide1 : m.lineSide0, o ? o.side : -1, o ? o.pslot ?? o.slot : -1]);
      if (o) {
        if (rand(500) !== 0) {
          dbg('off:shot'); st(p.side).offsides++;
          restart(7, opp, o.x, o.y); m.carrier = null; return;
        }
        queueIncident(-1, o, null, 8, o.x, o.y, -1, -1); param = 2;
      }
    }
    st(p.side).shots++; p.shots++;
    dbg('shotD' + Math.min(6, Math.round(L.dist(p.x, p.y, 4, goalRow(p.side)))) + ':s' + p.side + ':x' + p.x + 'y' + p.y);
    // sub_6cc540 → sub_6cd3d0 → sub_70dfd0 (sikker, pass.ts): skudlinjen; en blokering afgør selv bolden (løs, taget eller frispark).
    // soft = frisparksskuddet (0x35-grenen); ellers edi i sub_702050 ("?" → 0). Straffe går uden om (limen).
    const lineResult: 0 | 1 = type !== SHOT.PENALTY ? P.shotLine(p, Math.max(0, S), type === SHOT.FREE_KICK) : 0;
    if (type !== SHOT.PENALTY) ctx.onShot?.('B', [Math.max(0, S), lineResult, type === SHOT.FREE_KICK ? 1 : 0]);
    if (lineResult) dbg('shot:blocked');
    const out = shotOutcome({ S, type, K: kv, param, lineResult, high, rand });
    if (dbgOn) { GRID_DEBUG.sumS = (GRID_DEBUG.sumS ?? 0) + S; GRID_DEBUG.sumK = (GRID_DEBUG.sumK ?? 0) + kv.K; if (out.ratio !== undefined) { GRID_DEBUG.sumR = (GRID_DEBUG.sumR ?? 0) + out.ratio; dbg('nR'); } }
    dbg(`k${kv.state}${k ? '' : 'none'}:s${p.side}`); dbg(`o:${out.outcome}:s${p.side}`); if (k) dbg(`kx${k.x}y${k.y}:s${opp}`);
    const onT = out.outcome === 'goal' || out.outcome === 'goalInOffWoodwork' || out.outcome === 'parried' || out.outcome === 'tippedForCorner' || out.outcome === 'held';
    if (onT) { st(p.side).onTarget++; p.shotsOnTarget++; }
    on?.shot?.(p, out.outcome);
    if (out.outcome === 'goal' || out.outcome === 'goalInOffWoodwork') {
      st(p.side).goals++; m.goals[p.side]++; m.inc = null;                                    // 0x706e21: målet rydder hændelsen
      on?.goal?.(p, p.giver && p.giver.side === p.side && p.giver !== p ? p.giver : null, type === SHOT.PENALTY);
      if (type === SHOT.PENALTY && m.penaltyFor && m.penaltyFor !== p) m.penaltyFor.penGoalsWon++;   // 0x706e26–0x706e44
      m.stoppage += rand(Math.trunc(0.8 * 10)); kickoffPositions(opp); return;
    }
    if (out.outcome === 'retake') { restart(5, p.side, 4, opp === 0 ? 1 : 10); return; }
    if (out.outcome === 'held' && k) { m.carrier = null; m.ballX = k.x; m.ballY = k.y; takeBall(k); return; }
    if (out.outcome === 'tippedForCorner' || out.outcome === 'deflectedWide') { st(p.side).corners++; on?.corner?.(p.side); restart(3, p.side, p.x, goalRow(p.side)); return; }   // *estimeret*: boldens x = skyttens (hjørnets side vælges i 0x6c4470)
    if (out.outcome === 'parried') { m.carrier = null; m.ballX = clampX((k?.x ?? 4) + rand(3) - 1); m.ballY = clampY(goalRow(p.side) + (p.side === 0 ? -1 : 1)); m.ballH = 0; m.poss = -1; return; } // *estimeret* (limen)
    if (out.outcome === 'blocked') return;                                                    // sub_70dfd0 har afgjort bolden
    restart(4, opp, 4, opp === 0 ? 1 : 10); // forbi: målspark
  };

  const recv = new Map<PassOption, GP | null>();
  const lead = new Map<PassOption, boolean>();                                               // sub_6c6a30's io_flag (afleveringen foran modtageren)
  const situation = (p: GP): Situation => {
    sync(m);
    const opp = other(p.side);
    const opps = gp.filter((o) => o.side === opp);
    const oppViews = opps.map((o) => o.view!);
    const inCell = opps.filter((o) => o.active && o.x === p.x && o.y === p.y);
    const pr = H.pressure(p.view!, inCell.map((o) => o.view!));
    const gr = goalRow(p.side);
    const D = L.dist(p.x, p.y, 4, gr);
    const attHalf = p.side === 0 ? p.y >= 6 : p.y < 6;
    const k = opps.find((o) => o.active && o.pos === L.POS.keeper);
    const [tx, tacY] = cellWithDrift(p);
    const ahead = p.side === 0 ? p.y - tacY : tacY - p.y;
    const nearestOpp = H.nearestOpponent(oppViews, p.x, p.y, true);
    // boldholderens "plads" (word +0x29), samme regel som ballCarrier.ts 0x7110f5 – uden de tilfældige tal
    let space = m.ballH === -1 ? 200 : pr.count === 0 ? Math.trunc(Math.min(nearestOpp, 3.5) * 60 + 57) : Math.max(-2000, Math.trunc(-(pr.count * Math.max(pr.w70, 0) ** 2) * 0.75 * 0.75));
    space += 70;
    p.view!.plads = space; p.w29 = space;
    const ps: PassState = { attackingSide: p.side, ballState: m.ballH, defLine: [m.lineSide1, m.lineSide0], teamFlags: m.teamFlags, competitionReputation: null, roleStaffId: [null, null],
      players: [gp.filter((o) => o.side === 0).map((o) => o.view!), gp.filter((o) => o.side === 1).map((o) => o.view!)] };
    const ref = new Map(gp.map((o) => [o.view!, o]));
    const ph: PassHelpers = {
      rand, dist: (dx, dy) => L.DIST[Math.min(11, dy)][Math.min(8, dx)],
      freeRun: (q) => GRID_UNKNOWN.freeRun(m, ref.get(q as never)!, rand),
      facingGoal: (q) => GRID_UNKNOWN.facingGoal(m, ref.get(q as never)!, rand),
      canSee: (_c, tx, ty, oppNear, mark) => GRID_UNKNOWN.canSee(m, p, tx, ty, true, oppNear, mark, true, rand),
      runTarget: (q) => { const t = GRID_UNKNOWN.runTarget(m, ref.get(q as never)!, 0, [-1, -1], rand); return t ? { x: t[0], y: t[1] } : null; },
      lineOfSight: (x, y, tx2, ty2, d) => H.footForTarget({ ...p.view!, x, y }, 0x5d, tx2, ty2, d).foot,
      spaceAhead: (q) => GRID_UNKNOWN.spaceAhead(m, ref.get(q as never)!),
      noDefenderGoalSide: (q) => H.noDefenderGoalSide(q as unknown as H.MatchPlayer, oppViews, inCell.length, false),
      onPitch: () => false,
    };
    const toOption = (c: ReturnType<typeof passOptions>): PassOption | null => {
      const o: PassOption = c.receiver
        ? { hasTarget: true, weight: c.weight, type: c.type ?? 0x0b, tx: c.x ?? c.receiver.x, ty: c.y ?? c.receiver.y }
        : { hasTarget: false, weight: c.weight, type: c.type ?? 0x0b, tx: c.x ?? p.x, ty: c.y ?? p.y };
      if (c.receiver) { recv.set(o, ref.get(c.receiver as never) ?? null); lead.set(o, !!c.lead); }
      return o;
    };
    let openPass: PassOption | null | undefined;
    const foot = H.footForTarget(p.view!, 0x16, 4, gr, D + 1);
    const ctx = () => ({ side: p.side, x: p.x, y: p.y, D, ballHeight: m.ballH, facingGoal: ph.facingGoal(p.view!), creativityRoll: p.roll.creativity, flairRoll: p.roll.flair,
      condition: p.condition, w29: Math.max(0, space), momentum: p.momentum, form: p.form, prevAction: p.action, attrs: shotAttrs(p),
      keeper: k ? { x: k.x, y: k.y, side: opp, down: k.busy, distToShooter: L.dist(k.x, k.y, p.x, p.y), distToOwnGoal: L.dist(k.x, k.y, 4, gr) } : null, weather: GRID_UNKNOWN.weather, matchByte1: GRID_UNKNOWN.byte1 });
    return {
      traceScores: onShot ? (P0, R0, H0, S0, w0, b0, sp0, pr0) => onShot('Q', [p.side, p.pslot ?? p.slot, p.x, p.y, m.ballH, P0, R0, H0, S0, w0, b0, sp0, pr0]) : undefined,
      carrier: {
        side: p.side, x: p.x, y: p.y, dribbling: p.f.dribbling, finishing: p.f.finishing, flair: p.f.flair, freeKicks: p.f.freeKicks, heading: p.f.heading, longShots: p.f.longShots,
        teamwork: p.f.teamwork, decisionsRoll: p.roll.decisions, creativityRoll: p.roll.creativity, flairRoll: p.roll.flair, positioningRoll: p.roll.positioning, morale: 10, b11: 0,
        b2d: p.weakFootPenalty, condition: p.condition, momentum: p.momentum, lastAction: p.action, isGoalkeeper: p.pos === L.POS.keeper, posFlags: p.pos, sideFlags: p.posAttack,
        runWithBall: (p.instr & 0x2000000n) !== 0n, holdUpBall: (p.instr & 0x8000000n) !== 0n, longShotsInstr: (p.instr & 0x20000000n) !== 0n, crossBall: (p.instr & (0x4n << 32n)) !== 0n,
        professionalism: p.src.attrs[ATTRS.indexOf('professionalism')] || 10, sportsmanship: p.src.attrs[ATTRS.indexOf('sportsmanship')] || 10,
      },
      mode: 0, restart: m.state === 8 ? 0 : m.state, ballHeight: m.ballH, ballX: m.ballX, ballY: m.ballY, oppLastLine: p.side === 0 ? m.lineSide1 : m.lineSide0, D,
      nearestOpp, nearbyOpp: H.opponentsClose(oppViews, p.x, p.y, true), blockers: attHalf ? H.blockersOnLine(oppViews, p.x, p.y, 4, gr) : 0,
      pressure: pr.count, challenge: pr.w70,
      get pass() {
        if (openPass === undefined) {
          openPass = m.state === 0 || m.state === 8 ? toOption(passOptions(ps, p.view!, p.x, p.y, -1, ph)) : null;
          if (onShot && openPass) { const r = recv.get(openPass); onShot('O', [p.side, p.pslot ?? p.slot, p.x, p.y, openPass.weight, r ? r.side : -1, r ? r.pslot ?? r.slot : -1, openPass.tx, openPass.ty]); }
        }
        return openPass;
      },
      setPiecePass: (code) => toOption(passOptions(ps, p.view!, p.x, p.y, code, ph)),
      // w29 fra sub_7109f0 (0x7110f5–0x711342: kan være negativ – rand(w29) i 0x7016fc trækker så skuddet ned); uden = limens skøn ≥ 0
      shotScore: (w29?: number) => {
        const c = ctx(); if (w29 !== undefined) { c.w29 = w29; p.w29 = w29; }
        const r = shotScore(c, rand, m.state === 5 ? SHOT.PENALTY : m.state === 6 ? SHOT.FREE_KICK : 0xff); lastShotType = r.type; return r.score;
      },
      teammatesAhead: hooks.teammatesAhead(p), clearRun: GRID_UNKNOWN.freeRun(m, p, rand),
      oppKeeper: k ? { isRealKeeper: true, x: k.x, y: k.y, hasActed: k.busy !== 0, covers: H.keeperCovers(k.view!, p.x, p.y) } : null,
      oppInCell: inCell.length, committedOppInCell: 0, facingGoal: ph.facingGoal(p.view!), pastLastLine: L.beyondLine(m, p.side, p.y) >= 0,
      noDefenderGoalSide0: H.noDefenderGoalSide(p.view!, oppViews, inCell.length, false), noDefenderGoalSide1: H.noDefenderGoalSide(p.view!, oppViews, inCell.length, true),
      // boldholderen: flags 2 (bit 1 = boldholder-rutinens byte [esp+0x68], ikke afkodet, sat til 0), io = det taktiske felt
      // uden felt skriver sub_6bce80 −1, −1 i ioX/ioY (0x6bd58f) – boldholderens løb klemmer det til (0, 0) (0x7139f1)
      runTarget: (() => { const t = GRID_UNKNOWN.runTarget(m, p, 2, [tx, tacY], rand); return t ? { found: true, tx: t[0], ty: t[1] } : { found: false, tx: -1, ty: -1 }; })(),
      tacticalX: tx, beyondTactical: Math.max(0, ahead), clockTicks: m.clock, ownGoals: m.goals[p.side], oppGoals: m.goals[opp], lead: m.goals[p.side] - m.goals[opp],
      teamMode: m.aiMode[p.side], protectLead: false, oppOffsideTrap: (m.teamFlags[opp] & 0x400) !== 0,
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
          p.action = d.action;
          p.busy--; // move_to tæller busy op (0x6f0a13); limen gjorde det allerede ovenfor
          if (d.turn) P.turnTo(p, p.x, p.y, d.turn[0], d.turn[1]);                            // sub_6f4920 før løbet (0x713941 / 0x713a89)
          carrierMove(p, d.tx, d.ty, d.action);                                               // sub_6f09f0 (sikker)
          break;
        }
        case 'hold': p.busy--; holdBall(p); p.action = 0x10; break;                          // sub_70ec80 (+0x198 = 0x10 sættes efter kaldet, 0x7139c9)
        case 'shoot': p.action = d.action ?? 0x16; m.ballEvent = 6; advantageAtShot(); shoot(p, d); break;          // 0x710e9d: +0x8eb1 = 6 før sub_700bd0
        case 'wouldShoot': break;
      }
    } finally { m.depth--; }
  }

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
  const tick = (): boolean => {
    if (finished) return false;
    events.tick = m.clock;
    if (guard++ >= 4000) { finish(); return false; }
    // sub_6b98c0 0x6b9b0a: under straffesparkskonkurrencen (+0x8eb3) ét spark pr. tik (shootout.ts); slut, når +0x8eb3 = 0
    if (m.shootout) {
      m.shootoutState = shootoutStep({ m, rand, players: (s) => gp.filter((q) => q.side === s), ai: isAi, humanOrder: (s) => m.tactics[s].penOrder ?? [],
        pickTaker: (s, ex) => GRID_UNKNOWN.pickTaker(m, s, 5, rand, ex), keeper: (s) => hooks.ownKeeper(s) as GP | null, takeBall: (p) => takeBall(p),
        onKick: (k, s) => on?.penKick?.(k, s) }, m.shootoutState);
      if (!m.shootout) { finish(); return false; }
      return true;
    }
    if (dbgOn) dbg('state' + m.state + (m.carrier ? 'C' : '') + (m.receiver ? 'R' : ''));
    if (!L.tick(m, rand, hooks)) { if (m.shootout) return true; finish(); return false; }
    // 0x6cf750 (hvert tik): territoriet – bolden i række ≤ 3 / 4..7 / ≥ 8 (side 0's mål ved række 0), kun når nogen har bolden *estimeret* placering
    if (m.state === 0 && m.poss !== -1) territory[m.ballY <= 3 ? 0 : m.ballY < 8 ? 1 : 2]++;
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
  return { m, tick, get finished() { return finished; }, result: () => ({ home: m.stats[0], away: m.stats[1], ticks: m.clock }),
    substitute: (s, o, i) => subs.human(s, o, i), setTactic: (s, t) => { pendingTactic[s] = t; },
    subsLeft: (s) => subs.subsLeft[s] - subs.pending(s), subState: (p) => subs.state(p), events };
}

function shotAttrs(p: GP): ShotAttrs {
  return { agility: p.f.agility, balance: p.f.balance, strength: p.f.strength, technique: p.f.technique, flair: p.f.flair, finishing: p.f.finishing, heading: p.f.heading,
    longShots: p.f.longShots, freeKicks: p.f.freeKicks, passing: p.f.passing, penalties: p.f.penalties, leftFoot: p.leftFoot, rightFoot: p.rightFoot };
}
