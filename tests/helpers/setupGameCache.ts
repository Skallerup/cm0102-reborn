// Vitest (setupFiles i vite.config.ts): createGame går gennem cachen på disken (tests/helpers/gameCache.ts) – lokalt, ikke i CI.
// Modulets øvrige eksporter er de rigtige (også de levende `export let`-bindinger via getterne).
import { vi } from 'vitest';
import type * as NG from '../../src/game/newgame';

vi.mock('../../src/game/newgame', async (importOriginal) => {
  const real = await importOriginal<typeof NG>();
  const { cachedCreateGame, gameCacheOn } = await import('./gameCache');
  if (!gameCacheOn()) return real;
  const createGame: typeof real.createGame = (w, o) => cachedCreateGame(real.createGame, w, o);
  const mod: Record<string, unknown> = {};
  for (const k of Object.keys(real)) if (k !== 'createGame') Object.defineProperty(mod, k, { enumerable: true, get: () => (real as Record<string, unknown>)[k] });
  mod.createGame = createGame;
  return mod;
});
