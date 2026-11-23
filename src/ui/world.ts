import { del, get, set } from 'idb-keyval';
import type { WorldData } from '../game/newgame';
import { CM_REQUIRED, type CMWorld } from '../game/data/cm0102';
import { guardWrite } from '../game/storageGuard';
import { approvedEdits } from '../online/hub';
import { applyCommunityEdits, fetchModernWorld, fetchOriginalWorld, type CommunityEdit, type OriginalVersion } from './worldFetch';

let cache: Promise<WorldData> | null = null;
export { ORIGINAL_VERSIONS, originalFile, type OriginalVersion } from './worldFetch';

/** Fællesskabets godkendte rettelser (Community Update) – hentes med en grænse på 2,5 s; uden net ingen */
export async function communityEdits(db: 'cm' | 'original'): Promise<CommunityEdit[] | null> {
  const res = await Promise.race([approvedEdits(db), new Promise<null>((r) => setTimeout(() => r(null), 2500))]).catch(() => null);
  return res?.edits.length ? res.edits : null;
}

/**
 * Fællesskabets godkendte rettelser ("Community Update", se api/hub.ts) lægges oven på databasen, før et nyt spil
 * bygges fra startsiden: navne og egenskaber på spillere, navne og farver på klubber. Uden net bruges databasen som den er.
 */
export async function withCommunityEdits(base: WorldData, db: 'cm' | 'original'): Promise<WorldData> {
  return applyCommunityEdits(base, await communityEdits(db));
}

export function loadWorld(): Promise<WorldData> {
  if (!cache) {
    cache = fetchModernWorld();
    cache.catch(() => { cache = null; });
  }
  return cache;
}

const origCache = new Map<string, Promise<WorldData>>();
/** Hukommelse (Safari "Out of memory" 19/11): den indlæste database (den originale ≈ 110 MB i Chrome, flere gange det i Safari) blev holdt i
 *  hovedtråden hele sessionen. Når spillet er oprettet, slippes den – et nyt spil henter den igen (fra browserens/arbejderens cache). */
export function releaseWorldCaches(): void { origCache.clear(); cache = null; }
/** `size`: originalens databasestørrelse (ui/dbSize.ts – Normal kun for 3.9.60) */
export function loadOriginalWorld(v: OriginalVersion = '3.9.60', size: 'normal' | 'maximum' = 'maximum'): Promise<WorldData> {
  const k = `${v}|${size}`;
  let c = origCache.get(k);
  if (!c) {
    c = fetchOriginalWorld(v, size);
    c.catch(() => { origCache.delete(k); });
    origCache.set(k, c);
  }
  return c;
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
  try { await guardWrite((st) => set(CM_KEY, world, st), true); } catch { /* kun i hukommelsen, hvis browseren ikke vil gemme (fuld disk: beskeden er vist) */ }
  cmCache = world;
  return world;
}

export async function forgetCMWorld() {
  cmCache = null;
  try { await del(CM_KEY); } catch { /* ignorer */ }
}
