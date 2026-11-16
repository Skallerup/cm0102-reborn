// Continue Game/ferien i en Web Worker (ui/dayRunner.ts): med CM 01/02's ønskelister (cmShortlistGame.ts) koster en dag ~1,5–2,5 s, og i
// hovedtråden frøs siden imens. Arbejderen får hele spillet (struktureret kopi) og indeksernes rækkefølge, kører samme runUntil som hovedtråden
// og sender spillet tilbage, når den stopper (kamp, nyhed, dato …). Undervejs: datoen efter hver dag og brøkdelen af dagen (ønskelisternes
// klubløkke), så fremdriftsbjælken bevæger sig jævnt.
import { runUntil } from '../game/sim';
import '../game/actions';
import '../game/newgame';
import { gs, notify, setGame, indexSnapshot, restoreIndexes, type IndexSnapshot } from '../game/state';
import { ENGINE_DEV } from '../game/sim';
import { SL_PROGRESS } from '../game/cmShortlistGame';
import { ensureLang, setLang } from '../i18n';
import type { GameState, Lang } from '../game/types';

export type RunOpts = { untilDate?: string; untilMatch?: boolean; untilNews?: boolean; maxDays?: number; autoPlay?: boolean; watchDays?: boolean };
export type DayIn =
  | { type: 'run'; game: GameState; idx: IndexSnapshot; opts: RunOpts; env: { engine: string | null; lang: Lang } }
  | { type: 'stop' };
export type DayOut =
  | { type: 'progress'; date: string; frac: number }
  | { type: 'done'; result: { match?: number; stop?: string }; game: GameState; idx: IndexSnapshot }
  | { type: 'error'; message: string };

let stop = false;
const post = (m: DayOut) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (e: MessageEvent<DayIn>) => {
  const m = e.data;
  if (m.type === 'stop') { stop = true; return; }
  stop = false;
  try {
    ENGINE_DEV.v = m.env.engine;
    await ensureLang(m.env.lang);
    setLang(m.env.lang);
    setGame(m.game);
    restoreIndexes(m.idx);
    // brøkdelen af dagen: ønskelisternes klubløkke er dagens tunge del (højst ~10 beskeder pr. sekund)
    let last = 0;
    SL_PROGRESS.cb = (frac) => {
      const now = performance.now();
      if (now - last < 100) return;
      last = now;
      post({ type: 'progress', date: gs().date, frac });
    };
    const result = await runUntil({ ...m.opts, shouldStop: () => stop, onProgress: (date) => post({ type: 'progress', date, frac: 1 }) });
    SL_PROGRESS.cb = undefined;
    // tilfældighedernes tilstand gemmes i spillet (som hovedtrådens notify)
    notify();
    post({ type: 'done', result, game: gs(), idx: indexSnapshot() });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err) });
  } finally {
    SL_PROGRESS.cb = undefined;
    // arbejderen beholder ikke spillet (hukommelsen) – næste kørsel får hovedtrådens udgave
    setGame(null);
  }
};
