// Nyt spil i en Web Worker: createGame (med originalens forkørsel, økonomi, bestyrelse, forhold …) tager op til ~20 s med den originale
// database og fik ellers Chrome til at melde "Siden svarer ikke". Arbejderen sender status undervejs og til sidst hele GameState
// (samme form som et gemt spil – Start.tsx lægger den ind med setGame).
// Samme arbejder konverterer gamle gemte spil (game/cmConvert.ts): en frisk spilstart med samme database/klub/frø, og så konverteringen.
// (Hukommelse, iPhone 21/11) Med `src` henter og parser arbejderen selv databasen (worldFetch.ts) – hovedtråden holder den aldrig hele og
// kopierer den ikke over. `{ type: 'load' }` indlæser den og svarer med listerne til startforløbet (slimWorld); databasen bliver i arbejderen
// til det ene spil, den bygger bagefter (hvert spil bygges i sin egen arbejder, som før – ingen modultilstand fra et tidligere spil).
import { createGame, createGameBase, createGamePhase, setNewGameProgress, type NewGameCtx, type NewGameOptions, type NewGamePhase, type WorldData } from '../game/newgame';
import { gs, packCarry, setGame } from '../game/state';
import { rng } from '../game/rng';
import { convertOriginal, restartInOriginal, type ConvertReport } from '../game/cmConvert';
import type { CMWorld } from '../game/data/cm0102';
import type { GameState } from '../game/types';
import type { CustomDb } from '../game/dbEdit';
import { applyCommunityEdits, fetchModernWorld, fetchOriginalWorld, slimWorld, type CommunityEdit, type OriginalVersion } from './worldFetch';

/** Hvor arbejderen selv henter databasen: den originale (udgaven) eller den moderne, evt. en egen database (editoren) ovenpå, og fællesskabets rettelser */
export interface WorldSrc { base: 'original' | 'modern'; ver: OriginalVersion; custom?: CustomDb; edits: CommunityEdit[] | null; /** originalens databasestørrelse (ui/dbSize.ts) */ size?: 'normal' | 'maximum' }

export type NewGameMsg = { type: 'progress'; step: string; frac: number } | { type: 'done'; game: unknown; report?: ConvertReport } | { type: 'error'; message: string }
  | { type: 'slim'; slim: WorldData } | { type: 'handed' };
export type NewGameJob = { world?: WorldData; src?: WorldSrc; opts: NewGameOptions; convert?: { kind: 'convert' | 'restart'; old: GameState; picked?: boolean };
  /** (hukommelse, iPhone 22/11) kun disse trin af spilstarten ('base' = createGameBase, så createGamePhase); `from` modtager spillet fra forrige
   *  trins arbejder, `to` sender det videre til næste (uden om hovedtråden) – uden `to` svarer arbejderen med 'done' som før */
  phases?: ('base' | NewGamePhase)[]; from?: MessagePort; to?: MessagePort };
/** `rng` = talrækkens tilstand (g.rng røres ikke – som i ét forløb, hvor g.rng ikke opdateres undervejs) */
export type PhaseHandoff = { game: GameState; ctx: NewGameCtx; rng: number };
export type LoadJob = { type: 'load'; src: WorldSrc };

export async function loadSrc(src: WorldSrc): Promise<WorldData> {
  let w = src.base === 'original' ? await fetchOriginalWorld(src.ver, src.size) : await fetchModernWorld();
  if (src.custom) { const { applyDb } = await import('../game/dbEdit'); w = applyDb(w, src.custom); }
  return applyCommunityEdits(w, src.edits);
}

let held: { src: WorldSrc; world: Promise<WorldData> } | null = null;
// databasen gives videre uden at blive liggende i en lokal variabel (den slippes, så snart spillet er bygget)
const take = (): WorldData | undefined => { const w = heldWorld; heldWorld = undefined; held = null; return w; };
let heldWorld: WorldData | undefined;

self.onmessage = async (e: MessageEvent<NewGameJob | LoadJob>) => {
  const post = (m: NewGameMsg) => (self as unknown as Worker).postMessage(m);
  const data = e.data;
  try {
    if ('type' in data && data.type === 'load') {
      held = { src: data.src, world: loadSrc(data.src) };
      heldWorld = await held.world;
      post({ type: 'slim', slim: slimWorld(heldWorld) });
      return;
    }
    const job = data as NewGameJob;
    const cv = job.convert;
    // konverteringen: spilstarten er de første 90 %
    setNewGameProgress((step, frac) => post({ type: 'progress', step, frac: cv ? frac * 0.9 : frac }));
    let ctx: NewGameCtx | null = null;
    if (job.from) {
      // forrige trins spil (med modulernes tilstand og talrækken) – setGame lægger carry.ts' tilstand tilbage
      const h = await new Promise<PhaseHandoff>((resolve) => { job.from!.onmessage = (m) => resolve(m.data as PhaseHandoff); });
      job.from.close();
      setGame(h.game);
      rng.state = h.rng;
      ctx = h.ctx;
    } else if (!job.world) {
      if (held) heldWorld = await held.world;
      else if (job.src) heldWorld = await loadSrc(job.src);
      job.world = take();
    }
    if (job.phases) {
      for (const ph of job.phases) {
        if (ph === 'base') { if (!job.world) throw new Error('no world'); ctx = createGameBase(job.world, job.opts); job.world = undefined; }
        else { if (!ctx) throw new Error('no ctx'); createGamePhase(ph, ctx); }
      }
      if (job.to) {
        const g = gs();
        packCarry(g);
        job.to.postMessage({ game: g, ctx: ctx!, rng: rng.state } satisfies PhaseHandoff);
        job.to.close();
        setGame(null);
        post({ type: 'handed' });
        return;
      }
    } else {
      if (!job.world) throw new Error('no world');
      createGame(job.world, job.opts);
    }
    let report: ConvertReport | undefined;
    if (cv) {
      post({ type: 'progress', step: 'convert', frac: 0.92 });
      const fresh = gs();
      report = cv.kind === 'convert' ? convertOriginal(cv.old, fresh, job.world as CMWorld) : restartInOriginal(cv.old, fresh, job.world as CMWorld, !!cv.picked);
    }
    // (hukommelse, 21/11) arbejderens kopi af databasen slippes, før spillet kopieres tilbage – ellers lever begge under kopieringen
    job.world = undefined;
    post({ type: 'progress', step: 'done', frac: 1 });
    // modulernes tilstand (carry.ts) og indeksernes rækkefølge med – hovedtråden fortsætter præcis som spillet bygget her
    const g = gs();
    packCarry(g);
    post({ type: 'done', game: g, report });
    setGame(null);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err) });
  }
};
