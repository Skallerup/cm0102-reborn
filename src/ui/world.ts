import { del, get, set } from 'idb-keyval';
import type { WorldData } from '../game/newgame';
import { CM_REQUIRED, type CMWorld } from '../game/data/cm0102';
import { approvedEdits } from '../online/hub';

let cache: Promise<WorldData> | null = null;

/**
 * Fællesskabets godkendte rettelser ("Community Update", se api/hub.ts) lægges oven på databasen, før et nyt spil
 * bygges fra startsiden: navne og egenskaber på spillere, navne og farver på klubber. Uden net bruges databasen som den er.
 */
export async function withCommunityEdits(base: WorldData, db: 'cm' | 'original'): Promise<WorldData> {
  const res = await Promise.race([approvedEdits(db), new Promise<null>((r) => setTimeout(() => r(null), 2500))]).catch(() => null);
  if (!res?.edits.length) return base;
  // en kopi: den delte database (bl.a. draft-ligaens spillerpulje) skal være ens hos alle klienter
  const w = structuredClone(base);
  const cm = w as WorldData & Partial<CMWorld>;
  const F = Object.fromEntries((cm.playerFields ?? []).map((f, i) => [f, i]));
  const players = new Map((w.players as unknown as unknown[][]).map((p) => [Number(p[0]), p]));
  const clubs = new Map(w.clubs.map((c) => [c[0], c as unknown as unknown[]]));
  for (const e of res.edits) {
    const id = Number(e.target);
    if (e.kind === 'player') {
      const p = players.get(id);
      if (!p) continue;
      if (e.field === 'first' && F.first !== undefined) p[F.first] = e.value;
      if (e.field === 'last' && F.last !== undefined) p[F.last] = e.value;
      if (e.field === 'attr' && cm.ratings?.[id]) { const [i, v] = e.value.split(':').map(Number); if (cm.ratings[id].attrs[i] !== undefined) cm.ratings[id].attrs[i] = v; }
    } else {
      const c = clubs.get(id);
      if (!c) continue;
      if (e.field === 'name') c[1] = e.value;
      if (e.field === 'short') c[2] = e.value;
      if (e.field === 'color' && cm.clubColors) { const [a, b] = e.value.split(','); cm.clubColors[id] = [a, b ?? cm.clubColors[id]?.[1] ?? '#ffffff']; }
    }
  }
  return w;
}

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

// Den originale CM 01/02-database (3.9.68), bundlet som en valgmulighed ved nyt spil (sæson 2001/02)
let origCache: Promise<WorldData> | null = null;
export function loadOriginalWorld(): Promise<WorldData> {
  if (!origCache) {
    origCache = fetch(`${import.meta.env.BASE_URL}data/world-original.json`).then((r) => {
      if (!r.ok) throw new Error(`world-original.json: ${r.status}`);
      return r.json() as Promise<WorldData>;
    });
    origCache.catch(() => { origCache = null; });
  }
  return origCache;
}

// ---------- CM 01/02-databasen (brugerens egen installation, gemt lokalt i browseren) ----------

const CM_KEY = 'cm0102-world';
let cmCache: CMWorld | null | undefined;

export async function loadCMWorld(): Promise<CMWorld | null> {
  if (cmCache !== undefined) return cmCache;
  try { cmCache = ((await get(CM_KEY)) as CMWorld | undefined) ?? null; } catch { cmCache = null; }
  return cmCache;
}

/** Læs Data-mappen fra en CM 01/02-installation og konverter den lokalt (intet sendes nogen steder hen) */
export async function importCMFiles(list: FileList | File[]): Promise<CMWorld> {
  const files: Record<string, ArrayBuffer> = {};
  const wanted = new Set([...CM_REQUIRED, 'colour.dat', 'stadium.dat', 'officials.dat']);
  for (const f of Array.from(list)) {
    const name = f.name.toLowerCase();
    if (wanted.has(name) && !files[name]) files[name] = await f.arrayBuffer();
  }
  const { parseCM0102 } = await import('../game/data/cm0102');
  const world = parseCM0102(files);
  try { await set(CM_KEY, world); } catch { /* kun i hukommelsen, hvis browseren ikke vil gemme */ }
  cmCache = world;
  return world;
}

export async function forgetCMWorld() {
  cmCache = null;
  try { await del(CM_KEY); } catch { /* ignorer */ }
}
