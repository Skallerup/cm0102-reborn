// Arbejderen til scripts/newgame-phases-check.ts: som ui/newGameWorker.ts (ét eller flere trin af spilstarten i en frisk proces-tilstand) – eller
// `continue`: spillet som hovedtrådens (setGame) og N dage frem med sim.ts.
import { parentPort, workerData } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGame, createGameBase, createGamePhase, type NewGameCtx, type NewGameOptions, type NewGamePhase, type WorldData } from '../../src/game/newgame';
import { gs, packCarry, setGame } from '../../src/game/state';
import { rng } from '../../src/game/rng';
import type { GameState } from '../../src/game/types';
import { deserializeState, gzConcat, serializeNewGame } from '../../src/game/snapshot';
import { setPagePoolMax } from '../../src/game/cmMem';
// POOLMAX=n: sidepuljens loft (som newGameWorker.ts' poolMax på iOS)
if (process.env.POOLMAX) setPagePoolMax(Number(process.env.POOLMAX));

const wd = workerData as { kind: 'phases' | 'all' | 'continue'; phases?: ('base' | NewGamePhase)[]; file?: string; opts?: NewGameOptions; days?: number; last?: boolean; json?: boolean; canon?: boolean };
const port = parentPort!;
// canon: felterne sorteret – et gemt spil (JSON) bevarer ikke pladsen for felter, der var undefined (som snap-verify.ts' save-tilstande)
const canonRepl = (_k: string, v: unknown) => {
  if (!wd.canon || !v || typeof v !== 'object' || Array.isArray(v)) return v;
  const o = v as Record<string, unknown>, out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) out[k] = o[k];
  return out;
};
const sha = (x: unknown) => createHash('sha256').update(JSON.stringify(x, canonRepl)).digest('hex').slice(0, 16);

port.once('message', async (msg: { game?: GameState; gz?: ArrayBuffer; ctx?: NewGameCtx; rng?: number }) => {
  // (25/11) BYTES=1: trinenes overdragelse som gzip-bytes (newGameWorker.ts' nødvej, når den strukturerede kopi løber tør for hukommelse)
  if (msg.gz) msg.game = await deserializeState(new Blob([msg.gz]));
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
  // (23/11) som ui/newGameWorker.ts: det færdige spil som det gemte spils gzip-bytes (serializeState) – hovedtråden pakker det ud (deserializeState)
  if (wd.last && wd.json) { const gz = gzConcat(await serializeNewGame(g)); port.postMessage({ gz }, [gz]); return; }
  if (process.env.BYTES === '1') { const rs = rng.state; const gz = gzConcat(await serializeNewGame(g)); port.postMessage({ gz, ctx, rng: rs }); return; }
  packCarry(g);
  // (27/11) som ui/newGameWorker.ts (ui/handoff.ts): overdragelsen kopieres – ingen Transferable, afsenderen beholder alt til en gensendelse
  port.postMessage({ game: g, ctx, rng: rng.state });
});
