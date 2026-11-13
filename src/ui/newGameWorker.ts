// Nyt spil i en Web Worker: createGame (med originalens forkørsel, økonomi, bestyrelse, forhold …) tager op til ~20 s med den originale
// database og fik ellers Chrome til at melde "Siden svarer ikke". Arbejderen sender status undervejs og til sidst hele GameState
// (samme form som et gemt spil – Start.tsx lægger den ind med setGame).
import { createGame, setNewGameProgress, type NewGameOptions, type WorldData } from '../game/newgame';
import { gs } from '../game/state';

export type NewGameMsg = { type: 'progress'; step: string; frac: number } | { type: 'done'; game: unknown } | { type: 'error'; message: string };

self.onmessage = (e: MessageEvent<{ world: WorldData; opts: NewGameOptions }>) => {
  const post = (m: NewGameMsg) => (self as unknown as Worker).postMessage(m);
  setNewGameProgress((step, frac) => post({ type: 'progress', step, frac }));
  try {
    createGame(e.data.world, e.data.opts);
    post({ type: 'progress', step: 'done', frac: 1 });
    post({ type: 'done', game: gs() });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err) });
  }
};
