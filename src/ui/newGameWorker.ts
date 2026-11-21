// Nyt spil i en Web Worker: createGame (med originalens forkørsel, økonomi, bestyrelse, forhold …) tager op til ~20 s med den originale
// database og fik ellers Chrome til at melde "Siden svarer ikke". Arbejderen sender status undervejs og til sidst hele GameState
// (samme form som et gemt spil – Start.tsx lægger den ind med setGame).
// Samme arbejder konverterer gamle gemte spil (game/cmConvert.ts): en frisk spilstart med samme database/klub/frø, og så konverteringen.
import { createGame, setNewGameProgress, type NewGameOptions, type WorldData } from '../game/newgame';
import { gs, packCarry } from '../game/state';
import { convertOriginal, restartInOriginal, type ConvertReport } from '../game/cmConvert';
import type { CMWorld } from '../game/data/cm0102';
import type { GameState } from '../game/types';

export type NewGameMsg = { type: 'progress'; step: string; frac: number } | { type: 'done'; game: unknown; report?: ConvertReport } | { type: 'error'; message: string };
export type NewGameJob = { world: WorldData; opts: NewGameOptions; convert?: { kind: 'convert' | 'restart'; old: GameState; picked?: boolean } };

self.onmessage = (e: MessageEvent<NewGameJob>) => {
  const post = (m: NewGameMsg) => (self as unknown as Worker).postMessage(m);
  const cv = e.data.convert;
  // konverteringen: spilstarten er de første 90 %
  setNewGameProgress((step, frac) => post({ type: 'progress', step, frac: cv ? frac * 0.9 : frac }));
  try {
    createGame(e.data.world, e.data.opts);
    let report: ConvertReport | undefined;
    if (cv) {
      post({ type: 'progress', step: 'convert', frac: 0.92 });
      const fresh = gs();
      report = cv.kind === 'convert' ? convertOriginal(cv.old, fresh, e.data.world as CMWorld) : restartInOriginal(cv.old, fresh, e.data.world as CMWorld, !!cv.picked);
    }
    // (hukommelse, 21/11) arbejderens kopi af databasen slippes, før spillet kopieres tilbage – ellers lever begge under kopieringen
    (e.data as Partial<NewGameJob>).world = undefined;
    post({ type: 'progress', step: 'done', frac: 1 });
    // modulernes tilstand (carry.ts) og indeksernes rækkefølge med – hovedtråden fortsætter præcis som spillet bygget her
    packCarry(gs());
    post({ type: 'done', game: gs(), report });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err) });
  }
};
