// LiveSim: den del af kampmotorens flade, som spillet (sim.ts) og kampskærmene (Match.tsx, Pitch2D.tsx) bruger.
// MatchSim (zonemotoren, engine/match.ts) implementerer den; senere kan en adapter om gittermotoren
// (originalens kampmotor, engine/grid/) gøre det samme og registreres med setGridFactory – se makeMatch i sim.ts.
//
// Kun typer og en lille registrering: filen må ikke importere nogen motor (så bundlen ikke vokser).

import type { Rng } from '../rng';
import type {
  CommentaryLine, MatchEvent, MatchReport, MatchStatsSide, Player, PlayerMatchLine, ShootoutKick, ShotRecord, Tactic,
} from '../types';
import type { EngineOptions, EngineTeam, ShotSnap } from './match';

/** En spiller, der er eller har været på banen (UI'et læser dem i `teams[i].all` – fx cxRows i Match.tsx) */
export interface LiveSimPlayer {
  p: Player;
  /** pladsen i formationen (indeks i tactic.slots) */
  slot: number;
  /** kondition 0-1 */
  cond: number;
  /** løbende karakter (ikke afrundet) */
  rating: number;
  /** spillerens kamplinje (mål, skud, tacklinger …) – den samme genstand havner i rapportens `players` */
  line: PlayerMatchLine;
  /** minuttet, spilleren kom på (0 = starter) */
  enteredAt: number;
}

/** Et hold i kampen, som UI'et ser det */
export interface LiveSimTeam {
  club: number;
  /** holdets aktuelle taktik (opstilling/bænk opdateres ved udskiftninger) */
  tactic: Tactic;
  /** løbende kampstatistik (de samme genstande havner i rapportens `stats`) */
  stats: MatchStatsSide;
  /** alle der har været på banen */
  all: LiveSimPlayer[];
}

/** Øjebliksbillede til 2D-banen (Pitch2D.tsx) */
export interface PitchSnap {
  zone: number;
  poss: number;
  holder: number;
  moment: number;
  shot: ShotSnap | null;
  players: { id: number; team: number; num: number; gk: boolean; ax: number; ay: number; dx: number; dy: number; name: string }[];
}

/** Holdets stilling til live-UI'et (bænk, karakterer, kondition i %) – sendes også til udeholdet i fællesspil (FollowData) */
export interface LiveTeamView {
  on: { id: number; slot: number; num?: number; off: boolean; cond: number; rating: number; yellow: number; injured?: boolean; goals: number; red: boolean; enteredAt: number }[];
  gone: { id: number; slot: number; num?: number; rating: number; yellow: number; goals: number; enteredAt: number }[];
  bench: number[];
  subsLeft: number;
  stats: MatchStatsSide;
  tactic: Tactic;
}

export interface LiveSim {
  /** hvilken motor (til fejlsøgning; rapporten har det samme i `engine`, mangler = 'zone') */
  readonly engine: 'zone' | 'original';
  /** [hjemme, ude] */
  readonly teams: readonly [LiveSimTeam, LiveSimTeam];
  /** kampens indstillinger – NB: UI'et skriver `opts.aiSubs` undervejs (fællesspil: udeholdet går solo) */
  readonly opts: EngineOptions;

  // ---- ur ----
  minute: number;
  half: number;
  /** motorens tik (2D-banen og afspilningen følger dem) */
  moment: number;
  /** forventet antal tik i kampen (fremdriftsbjælken) */
  totalMoments: number;
  finished: boolean;

  // ---- løbende lister (UI'et husker, hvor langt det er nået, og læser kun det nye: længden må kun vokse) ----
  commentary: CommentaryLine[];
  events: MatchEvent[];
  shots: ShotRecord[];
  /** højdepunkter uden afslutning (2D) */
  highlights: { m: number; t: number; kind: string; p: number; p2: number; moment: number }[];
  /** hjørnespark (2D) */
  corners: { m: number; t: number; taker: number; lane: number; moment: number; shot?: boolean }[];
  /** straffesparkskonkurrencen, når den er i gang */
  shootout?: { score: [number, number]; kicks: ShootoutKick[] };

  // ---- styring ----
  /** ét tik; false når kampen er slut */
  step(): boolean;
  runToEnd(): MatchReport;
  report(): MatchReport;
  pitch(): PitchSnap;
  live(teamIdx: number): LiveTeamView;
  substitute(teamIdx: number, outId: number, inId: number): boolean;
  setTactic(teamIdx: number, tactic: Tactic): void;
  /** holdsnak: faktor pr. spiller (erstatter den forrige snak) */
  applyTalk(teamIdx: number, boosts: Record<number, number>): void;
}

/** Fabrik for en anden motor (gittermotoren) – samme input som MatchSim's konstruktør */
export type LiveSimFactory = (home: EngineTeam, away: EngineTeam, opts: EngineOptions, r: Rng) => LiveSim;

let gridFactory: LiveSimFactory | null = null;
/** Registrér gittermotorens adapter (GridSim). null fjerner den igen. */
export function setGridFactory(fn: LiveSimFactory | null) { gridFactory = fn; }
export function getGridFactory(): LiveSimFactory | null { return gridFactory; }

/** Gittermotoren (porten af originalens kampmotor) som STANDARD for nye spil med den originale database i ægte tilstand (runde 8, til ejerens
 *  test): createGame sætter Options.engine = 'original' for dem. false = som før runde 8 (kun Options.engine eller localStorage
 *  `cm0102.engine` = 'original' slår den til). Gemte spil uden feltet (fra før) beholder zonemotoren; localStorage `cm0102.engine` = 'zone'
 *  slår den fra i et spil. */
export const GRID_ENGINE_DEFAULT = false;
