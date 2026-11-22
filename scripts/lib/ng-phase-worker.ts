// Arbejderen til scripts/newgame-phases-check.ts: som ui/newGameWorker.ts (ét eller flere trin af spilstarten i en frisk proces-tilstand) – eller
// `continue`: spillet som hovedtrådens (setGame) og N dage frem med sim.ts.
import { parentPort, workerData } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGame, createGameBase, createGamePhase, type NewGameCtx, type NewGameOptions, type NewGamePhase, type WorldData } from '../../src/game/newgame';
import { gs, packCarry, setGame } from '../../src/game/state';
import { rng } from '../../src/game/rng';
import type { GameState } from '../../src/game/types';

const wd = workerData as { kind: 'phases' | 'all' | 'continue'; phases?: ('base' | NewGamePhase)[]; file?: string; opts?: NewGameOptions; days?: number; last?: boolean };
const port = parentPort!;
const sha = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

port.once('message', async (msg: { game?: GameState; ctx?: NewGameCtx; rng?: number }) => {
  if (wd.kind === 'continue') {
    const { continueGame, quickPlayUserMatch } = await import('../../src/game/sim');
    setGame(msg.game!);
    const out: string[] = [];
    for (let d = 0; d < (wd.days ?? 2); d++) {
      const g = gs(), start = g.date;
      while (g.date === start || !g.dayDone || g.pendingFixture) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); if (g.date !== start && g.dayDone && !g.pendingFixture) break; }
      g.rng = rng.state;
      out.push(`${g.date} ${sha({ ...g, id: 0 })}`);
    }
    port.postMessage({ days: out });
    return;
  }
  let world: WorldData | undefined = wd.file ? JSON.parse(readFileSync(wd.file, 'utf8')) as WorldData : undefined;
  if (wd.kind === 'all') { createGame(world!, wd.opts!); world = undefined; packCarry(gs()); port.postMessage({ game: gs() }); return; }
  let ctx = msg.ctx;
  if (msg.game) { setGame(msg.game); rng.state = msg.rng!; }
  for (const ph of wd.phases!) {
    if (ph === 'base') { ctx = createGameBase(world!, wd.opts!); world = undefined; } else createGamePhase(ph, ctx!);
  }
  const g = gs();
  packCarry(g);
  port.postMessage({ game: g, ctx, rng: rng.state });
});
