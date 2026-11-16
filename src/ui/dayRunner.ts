// Continue Game/ferien: runUntil i en Web Worker (ui/dayWorker.ts), når CM 01/02's ønskelister kører (cmShortlistOn – den originale database i
// ægte tilstand). Spillet sendes som en struktureret kopi med indeksernes rækkefølge og kommer tilbage, når kørslen stopper; hovedtråden tegner
// imens fremdriftsbjælken. Samme kode og samme tilstand som i hovedtråden – scripts/day-worker-check.ts viser, at en kopi før hver dag giver
// præcis samme spil (sha1 pr. dag). Uden Worker (Node/test), i fællesspil og nyt spil-forløbet, eller hvis arbejderen fejler: i hovedtråden
// (spillet er urørt, til arbejderen er færdig – en fejl midt i kørslen starter forfra her).
import { runUntil, type DayResult } from '../game/sim';
import { gs, hasGame, inSetup, setGame, indexSnapshot, restoreIndexes } from '../game/state';
import { cmShortlistOn } from '../game/cmShortlistGame';
import { getLang } from '../i18n';
import { rng } from '../game/rng';
import type { DayIn, DayOut, RunOpts } from './dayWorker';

type Opts = Parameters<typeof runUntil>[0] & {
  /** brøkdelen af dagen undervejs (0..1) – kun fra arbejderen */
  onFrac?: (date: string, frac: number) => void;
};

let worker: Worker | null = null;
/** arbejderen fejlede én gang – resten af sessionen i hovedtråden */
let broken = false;

/** kør i arbejderen? (kun ønskelisternes tunge dage; ikke fællesspil, draft eller nyt spil-forløbet) */
export function useDayWorker(): boolean {
  if (broken || typeof Worker === 'undefined' || !hasGame() || inSetup()) return false;
  const g = gs();
  return cmShortlistOn(g) && !g.humans?.length;
}

/** målinger (fejlsøgning i konsollen: window.__cmDayRun): sidste kørsels kopi frem/tilbage og tid */
const STATS = { sendMs: 0, recvMs: 0, runMs: 0, days: 0 };

export async function runDays(opts: Opts): Promise<DayResult> {
  if (!useDayWorker()) return runUntil(opts);
  try {
    return await inWorker(opts);
  } catch (e) {
    console.warn('Continue Game i en Worker fejlede – kører i hovedtråden', e);
    broken = true;
    worker?.terminate(); worker = null;
    return runUntil(opts);
  }
}

function inWorker(opts: Opts): Promise<DayResult> {
  const w = (worker ??= new Worker(new URL('./dayWorker.ts', import.meta.url), { type: 'module' }));
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
      if (m.type === 'progress') {
        if (m.frac >= 1) onProgress?.(m.date);
        else onFrac?.(m.date, m.frac);
        return;
      }
      done();
      if (m.type === 'error') { reject(new Error(m.message)); return; }
      const t1 = performance.now();
      setGame(m.game);
      restoreIndexes(m.idx);
      STATS.recvMs = Math.round(performance.now() - t1);
      STATS.runMs = Math.round(performance.now() - t0);
      STATS.days = Math.max(0, Math.round((Date.parse(gs().date) - Date.parse(start)) / 86400000));
      (globalThis as { __cmDayRun?: typeof STATS }).__cmDayRun = { ...STATS };
      resolve(m.result);
    };
    w.onerror = (e) => { done(); reject(new Error(e.message || 'dayWorker')); };
    const t1 = performance.now();
    // tilfældighedernes tilstand med (hovedtrådens notify gør det samme)
    gs().rng = rng.state;
    const msg: DayIn = { type: 'run', game: gs(), idx: indexSnapshot(), opts: rest as RunOpts, env: { engine, lang: getLang() } };
    w.postMessage(msg);
    STATS.sendMs = Math.round(performance.now() - t1);
  });
}
