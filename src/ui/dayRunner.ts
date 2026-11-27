// Continue Game/ferien: runUntil i en Web Worker (ui/dayWorker.ts), når CM 01/02's ønskelister kører (cmShortlistOn – den originale database i
// ægte tilstand). Spillet sendes som en struktureret kopi med indeksernes rækkefølge og kommer tilbage, når kørslen stopper; hovedtråden tegner
// imens fremdriftsbjælken. Samme kode og samme tilstand som i hovedtråden – scripts/day-worker-check.ts viser, at en kopi før hver dag giver
// præcis samme spil (sha1 pr. dag). Uden Worker (Node/test), i fællesspil online og nyt spil-forløbet, eller hvis arbejderen fejler: i hovedtråden
// (spillet er urørt, til arbejderen er færdig – en fejl midt i kørslen starter forfra her).
import { runUntil, type DayResult } from '../game/sim';
import { gs, hasGame, inSetup, setGame, indexSnapshot, restoreIndexes, packCarry, previewInfo } from '../game/state';
import { dropWorkerSave, offerWorkerSave } from '../game/workerSave';
import type { GzBytes } from '../game/snapshot';
import { cmShortlistOn } from '../game/cmShortlistGame';
import { getLang } from '../i18n';
import { rng } from '../game/rng';
import type { DayIn, DayOut, RunOpts } from './dayWorker';
import type { DayPhase } from '../game/dayProgress';
import { reportError } from '../online/errors';

/** Spillets egen kode fejlede i arbejderen (ikke arbejderen selv): hovedtrådens spil er urørt – det samme spil ville fejle på samme måde i
 *  hovedtråden (20/11: ferien gik ned midt i en dag, og genkørslen i hovedtråden efterlod et halvt regnet spil), så kørslen stopper her */
export class GameRunError extends Error {
  readonly date: string;
  constructor(message: string, date: string) { super(message); this.name = 'GameRunError'; this.date = date; }
}

/** arbejderens script kunne ikke hentes, og filen findes ikke længere på serveren (ny udgivelse over en åben fane) */
class WorkerStaleError extends Error {}

/** onerror uden besked og placering = scriptet blev ikke hentet/startet. Tjek, om filen er væk (404/html) → ældre udgivelse; ellers ægte fejl med detaljer. */
async function classifyWorkerError(e: ErrorEvent): Promise<Error> {
  const where = e.filename ? ` (${e.filename.split('/').pop()}:${e.lineno ?? 0}:${e.colno ?? 0})` : '';
  if (e.message) {
    const err = new Error(`dayWorker: ${e.message}${where}`);
    const st = (e.error as Error | undefined)?.stack;
    if (st) err.stack = st;
    return err;
  }
  try {
    // (new URL(..) må stå bogstaveligt i new Worker for Vite) – i stedet: peger den udgivne forside på et andet hovedscript end siden her?
    const html = await (await fetch('/', { cache: 'no-store' })).text();
    const mine = [...document.querySelectorAll<HTMLScriptElement>('script[type=module][src]')].map((x) => new URL(x.src).pathname);
    const live = [...html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    if (mine.length && live.length && !live.some((u) => mine.includes(u))) return new WorkerStaleError('dayWorker script gone (new build)');
  } catch { /* offline: som før */ }
  return new Error(`dayWorker: script failed to load or start without a message${where}`);
}

type Opts = Parameters<typeof runUntil>[0] & {
  /** brøkdelen af dagen undervejs (0..1) – kun fra arbejderen */
  onFrac?: (date: string, frac: number, phase?: DayPhase, i?: number, n?: number) => void;
};

let worker: Worker | null = null;
/** arbejderen fejlede én gang – resten af sessionen i hovedtråden */
let broken = false;

/** (27/11) autogemmets bytes fra arbejderen pr. kørsel (game/workerSave.ts); null = arbejderen gemte ikke (afbrudt, fejl, lukket) */
let seq = 0;
const pendingSaves = new Map<number, (p: GzBytes | null) => void>();
const SAVE_STATS = { ms: 0, mb: 0 };
function onSaveMessage(e: MessageEvent<DayOut>) {
  const m = e.data;
  if (m.type !== 'save') return;
  const r = pendingSaves.get(m.seq);
  pendingSaves.delete(m.seq);
  if (m.error) console.warn('dayWorker: gem i arbejderen fejlede – hovedtråden gemmer selv', m.error);
  if (m.parts) { SAVE_STATS.ms = m.ms; SAVE_STATS.mb = m.parts.reduce((n, b) => n + b.byteLength, 0) / 1048576; }
  r?.(m.parts);
}
function failPendingSaves() {
  for (const r of pendingSaves.values()) r(null);
  pendingSaves.clear();
  dropWorkerSave();
}
/** skal arbejderen lave gemmets bytes efter kørslen? (autogem slået til, et lokalt spil, ikke en admin-preview – som saveGame) */
function wantWorkerSave(): boolean {
  const g = gs();
  const mode = g.options.autosaveMode ?? (g.options.autosave === false ? 'off' : 'changes');
  return mode !== 'off' && !g.humans?.length && !previewInfo();
}

/** kør i arbejderen? (kun ønskelisternes tunge dage; ikke fællesspil online, draft eller nyt spil-forløbet). Lokalt spil mod AI-managere
 *  (g.localMp – samme browser, Shell's Continue Game) kører også i arbejderen: hele runUntil med alle managerpladserne følger med i kopien
 *  (scripts/day-worker-check.ts BOTS=n CLONE=1: samme sha1 pr. dag) */
export function useDayWorker(): boolean {
  if (broken || typeof Worker === 'undefined' || !hasGame() || inSetup()) return false;
  const g = gs();
  return cmShortlistOn(g) && (!g.humans?.length || !!g.localMp);
}

/** målinger (fejlsøgning i konsollen: window.__cmDayRun): sidste kørsels kopi frem/tilbage og tid */
const STATS = { sendMs: 0, recvMs: 0, runMs: 0, days: 0 };

export async function runDays(opts: Opts): Promise<DayResult> {
  if (!useDayWorker()) { dropWorkerSave(); return runUntil(opts); }
  try {
    return await inWorker(opts);
  } catch (e) {
    if (e instanceof GameRunError) throw e;
    if (e instanceof WorkerStaleError) {
      // arbejder-scriptet fra en ældre udgivelse er væk – ikke en fejl i spillet: kør i hovedtråden og bed om en genindlæsning
      void import('./UpdateToast').then((m) => m.staleBuildNotice());
      broken = true;
      worker?.terminate(); worker = null;
      failPendingSaves();
      return runUntil(opts);
    }
    reportError(e, '\n--- dayWorker (infrastruktur) – kører i hovedtråden ---');
    console.warn('Continue Game i en Worker fejlede – kører i hovedtråden', e);
    broken = true;
    worker?.terminate(); worker = null;
    failPendingSaves();
    return runUntil(opts);
  }
}

function inWorker(opts: Opts): Promise<DayResult> {
  if (!worker) {
    worker = new Worker(new URL('./dayWorker.ts', import.meta.url), { type: 'module' });
    worker.addEventListener('message', onSaveMessage);
  }
  const w = worker;
  const mySeq = ++seq;
  const save = wantWorkerSave();
  const bytes = save ? new Promise<GzBytes | null>((r) => { pendingSaves.set(mySeq, r); }) : null;
  const { onProgress, shouldStop, onFrac, ...rest } = opts;
  let engine: string | null = null;
  try { engine = localStorage.getItem('cm0102.engine'); } catch { engine = null; }
  const t0 = performance.now();
  const start = gs().date;
  return new Promise<DayResult>((resolve, reject) => {
    let stopSent = false;
    const poll = setInterval(() => { if (!stopSent && shouldStop?.()) { stopSent = true; w.postMessage({ type: 'stop' } satisfies DayIn); } }, 100);
    const done = () => { clearInterval(poll); w.onmessage = null; w.onerror = null; };
    w.onmessage = (e: MessageEvent<DayOut>) => {
      const m = e.data;
      if (m.type === 'save') return;
      if (m.type === 'progress') {
        if (m.frac >= 1) onProgress?.(m.date);
        else onFrac?.(m.date, m.frac, m.phase, m.i, m.n);
        return;
      }
      done();
      if (m.type === 'error') {
        pendingSaves.get(mySeq)?.(null); pendingSaves.delete(mySeq);
        const err = new GameRunError(m.message.split('\n')[0], m.date ?? start);
        err.stack = m.message;
        reject(err);
        return;
      }
      const t1 = performance.now();
      setGame(m.game);
      restoreIndexes(m.idx);
      if (bytes) offerWorkerSave(gs(), bytes);
      STATS.recvMs = Math.round(performance.now() - t1);
      STATS.runMs = Math.round(performance.now() - t0);
      STATS.days = Math.max(0, Math.round((Date.parse(gs().date) - Date.parse(start)) / 86400000));
      (globalThis as { __cmDayRun?: typeof STATS & { save?: typeof SAVE_STATS } }).__cmDayRun = { ...STATS, save: SAVE_STATS };
      resolve(m.result);
    };
    w.onerror = (e) => { done(); void classifyWorkerError(e).then(reject); };
    const t1 = performance.now();
    // tilfældighedernes tilstand med (hovedtrådens notify gør det samme)
    gs().rng = rng.state;
    // modulernes tilstand (carry.ts) med – arbejderen fortsætter præcis som hovedtråden (og sender sin tilbage)
    packCarry(gs());
    const msg: DayIn = { type: 'run', seq: mySeq, save, game: gs(), idx: indexSnapshot(), opts: rest as RunOpts, env: { engine, lang: getLang() } };
    try { w.postMessage(msg); } finally { delete gs().cmCarry; }
    STATS.sendMs = Math.round(performance.now() - t1);
  });
}
