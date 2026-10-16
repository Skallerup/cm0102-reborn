import type { WorldData } from '../game/newgame';

let cache: Promise<WorldData> | null = null;

export function loadWorld(): Promise<WorldData> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}data/world.json`).then((r) => {
      if (!r.ok) throw new Error(`world.json: ${r.status}`);
      return r.json() as Promise<WorldData>;
    });
    cache.catch(() => { cache = null; });
  }
  return cache;
}
