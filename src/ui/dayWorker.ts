// Continue Game/ferien i en Web Worker (ui/dayRunner.ts): med CM 01/02's ønskelister (cmShortlistGame.ts) koster en dag ~1,5–2,5 s, og i
// hovedtråden frøs siden imens. Arbejderen får hele spillet (struktureret kopi) og indeksernes rækkefølge, kører samme runUntil som hovedtråden
// og sender spillet tilbage, når den stopper (kamp, nyhed, dato …). Undervejs: datoen efter hver dag og brøkdelen af dagen (ønskelisternes
// klubløkke), så fremdriftsbjælken bevæger sig jævnt.
import { runUntil } from '../game/sim';
import '../game/actions';
import '../game/newgame';
import { gs, notify, setGame, indexSnapshot, restoreIndexes, packCarry, type IndexSnapshot } from '../game/state';
import { ENGINE_DEV } from '../game/sim';
import { SL_PROGRESS } from '../game/cmShortlistGame';
import { DAY_PROGRESS, type DayPhase } from '../game/dayProgress';
import { ensureLang, setLang } from '../i18n';
import { serializeBytes, SaveAbortedError, type GzBytes } from '../game/snapshot';
import type { GameState, Lang } from '../game/types';

export type RunOpts = { untilDate?: string; untilMatch?: boolean; untilNews?: boolean; maxDays?: number; autoPlay?: boolean; watchDays?: boolean };
export type DayIn =
  | { type: 'run'; seq: number; save: boolean; game: GameState; idx: IndexSnapshot; opts: RunOpts; env: { engine: string | null; lang: Lang } }
  | { type: 'stop' };
export type DayOut =
  | { type: 'progress'; date: string; frac: number; phase?: DayPhase; i?: number; n?: number }
  | { type: 'done'; result: { match?: number; stop?: string }; game: GameState; idx: IndexSnapshot }
  | { type: 'error'; message: string; date?: string }
  /** gemmets bytes for kørsel `seq` (null = afbrudt af en ny kørsel eller fejlet – hovedtråden gemmer så selv) */
  | { type: 'save'; seq: number; parts: GzBytes | null; ms: number; error?: string };

let stop = false;
const post = (m: DayOut, transfer?: Transferable[]) => (self as unknown as Worker).postMessage(m, transfer ?? []);

/** (hastighed 27/11) autogemmets bytes laves her efter kørslen – hovedtråden serialiserede og gzippede ellers selv spillet (1–2,5 s stop på
 *  Maximum). Samme spil som det, der lige er sendt til hovedtråden (intet ændres imellem), samme tekst (jsonChunks = JSON.stringify) og samme
 *  gzip; bytes OVERFØRES (ingen kopi). En ny kørsel afbryder et igangværende gem (arbejderen skal bruges, og hovedtrådens spil skifter alligevel). */
let saving: Promise<void> | null = null;
let saveAbort = false;
async function saveAfterRun(g: GameState, seq: number): Promise<void> {
  const t0 = performance.now();
  let parts: GzBytes | null = null, error: string | undefined;
  try {
    // modulernes tilstand pakkes igen af serializeBytes (som hovedtrådens gem) – samme plads i feltrækkefølgen (sidst)
    delete g.cmCarry;
    parts = await serializeBytes(g, true, () => saveAbort);
  } catch (err) {
    parts = null;
    if (!(err instanceof SaveAbortedError)) error = err instanceof Error ? err.message : String(err);
  } finally {
    saveAbort = false;
    if (gs() === g) setGame(null);
  }
  const transfer = parts ? [...new Set(parts.map((b) => b.buffer))] : [];
  post({ type: 'save', seq, parts, ms: Math.round(performance.now() - t0), error }, transfer);
}

self.onmessage = async (e: MessageEvent<DayIn>) => {
  const m = e.data;
  if (m.type === 'stop') { stop = true; return; }
  stop = false;
  if (saving) { saveAbort = true; await saving; }
  let keep = false;
  try {
    ENGINE_DEV.v = m.env.engine;
    await ensureLang(m.env.lang);
    setLang(m.env.lang);
    setGame(m.game);
    restoreIndexes(m.idx);
    // brøkdelen af dagen: ønskelisternes klubløkke er dagens tunge del (højst ~10 beskeder pr. sekund)
    let last = 0, lastPhase = '';
    // dagens faser (game/dayProgress.ts: dagopdateringer, klubber, kontrakter, økonomi, kampe …): en ny fase meldes med det samme, ellers højst ~12 pr. sekund
    DAY_PROGRESS.cb = (frac, phase, i, n) => {
      const now = performance.now();
      if (phase === lastPhase && now - last < 80) return;
      last = now; lastPhase = phase;
      post({ type: 'progress', date: gs().date, frac, phase, i, n });
    };
    // ønskelisternes klubløkke (0,1–0,9 af dens del af dagen: 0,02–0,15)
    SL_PROGRESS.cb = (frac) => {
      const now = performance.now();
      if (now - last < 80) return;
      last = now; lastPhase = 'transfers';
      post({ type: 'progress', date: gs().date, frac: 0.02 + 0.13 * frac, phase: 'transfers' });
    };
    const result = await runUntil({ ...m.opts, shouldStop: () => stop, onProgress: (date) => post({ type: 'progress', date, frac: 1 }) });
    SL_PROGRESS.cb = undefined; DAY_PROGRESS.cb = undefined;
    // tilfældighedernes tilstand gemmes i spillet (som hovedtrådens notify)
    notify();
    packCarry(gs());
    post({ type: 'done', result, game: gs(), idx: indexSnapshot() });
    if (m.save && !gs().humans?.length) {
      keep = true;
      const p: Promise<void> = saveAfterRun(gs(), m.seq).finally(() => { if (saving === p) saving = null; });
      saving = p;
    }
  } catch (err) {
    let date: string | undefined;
    try { date = gs().date; } catch { date = undefined; }
    post({ type: 'error', message: err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err), date });
  } finally {
    SL_PROGRESS.cb = undefined; DAY_PROGRESS.cb = undefined;
    // arbejderen beholder ikke spillet (hukommelsen) – næste kørsel får hovedtrådens udgave (efter gemmet: saveAfterRun)
    if (!keep) setGame(null);
  }
};
