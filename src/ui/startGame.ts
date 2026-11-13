// Fælles for startsiderne (moderne Start.tsx og det klassiske nye-spil-flow i ClassicStart.tsx):
// valg af database, indlæsning af verdenen og oprettelse af spillet i en Web Worker.
import { createGame, type NewGameOptions, type WorldData } from '../game/newgame';
import type { GameState, Lang } from '../game/types';
import { gs, setGame, setSetupGame } from '../game/state';
import type { NewGameProgress } from './NewGameLoader';
import { listDbs, loadCustomWorld } from './customDb';
import { loadOriginalWorld, loadWorld, ORIGINAL_VERSIONS, withCommunityEdits, type OriginalVersion } from './world';

/** 'custom:<id>' = en database fra editoren (ændringer oven på den originale eller den moderne) */
export type Db = 'modern' | 'original' | `custom:${string}`;

// sprogets eget land er valgt fra start (England, hvis landet ikke findes i databasen)
export const LANG_NATION: Record<Lang, string> = { da: 'Denmark', en: 'England', es: 'Spain', fr: 'France', de: 'Germany', it: 'Italy', pt: 'Brazil', tr: 'Turkey', sv: 'Sweden', nb: 'Norway' };
/** Den originale database: originalens forvalg pr. sprog (0x827d50 → 0x66f4d0: engelsk England, fransk Frankrig, tysk Tyskland, italiensk Italien,
 *  spansk Spanien, dansk Danmark, hollandsk Holland, norsk Norge, portugisisk Portugal, svensk Sverige …). Tyrkisk findes ikke i originalen → engelsk. */
export const ORIG_LANG_NATION: Record<Lang, string> = { da: 'Denmark', en: 'England', es: 'Spain', fr: 'France', de: 'Germany', it: 'Italy', pt: 'Portugal', tr: 'England', sv: 'Sweden', nb: 'Norway' };

/** Den sidst valgte database (standard = den originale 01/02) */
export function readDb(): Db {
  try { const v = localStorage.getItem('cm0102.db'); return v === 'modern' || v?.startsWith('custom:') ? v as Db : 'original'; } catch { return 'original'; }
}
export function writeDb(d: Db) { try { localStorage.setItem('cm0102.db', d); } catch { /* ignorer */ } }
export function readVer(): OriginalVersion {
  try { const v = localStorage.getItem('cm0102.dbver'); return (ORIGINAL_VERSIONS as readonly string[]).includes(v ?? '') ? v as OriginalVersion : '3.9.60'; } catch { return '3.9.60'; }
}
export function writeVer(v: OriginalVersion) { try { localStorage.setItem('cm0102.dbver', v); } catch { /* ignorer */ } }

/** Indlæser databasen (med fællesskabets rettelser) – null, hvis en egen database ikke findes længere */
export async function loadStartWorld(db: Db, ver: OriginalVersion): Promise<WorldData | null> {
  if (db.startsWith('custom:')) {
    const id = db.slice(7);
    const d = (await listDbs()).find((x) => x.id === id);
    if (!d) return null;
    return withCommunityEdits(await loadCustomWorld(id), d.base === 'original' ? 'original' : 'cm');
  }
  // fællesskabets rettelser gælder 3.9.60 (de andre udgaver bruges præcis som originalen)
  if (db === 'original') { const w = await loadOriginalWorld(ver); return ver === '3.9.60' ? withCommunityEdits(w, 'original') : w; }
  return withCommunityEdits(await loadWorld(), 'cm');
}

/** nyt spil i en Web Worker (ui/newGameWorker.ts) med status undervejs – siden fryser ikke; uden Worker (eller ved fejl) i hovedtråden.
 *  `opts.preview` = nyt-spil-forløbets midlertidige verden (setSetupGame); `signal` afbryder arbejderen (en ny liga-/databasevalg). */
export async function createGameAsync(world: WorldData, opts: NewGameOptions, onProgress: (p: NewGameProgress) => void, signal?: AbortSignal): Promise<void> {
  const put = (g: GameState) => (opts.preview ? setSetupGame(g) : setGame(g));
  if (typeof Worker === 'undefined') { createGame(world, opts); if (opts.preview) setSetupGame(gs()); return; }
  try {
    const game = await new Promise<GameState>((resolve, reject) => {
      const w = new Worker(new URL('./newGameWorker.ts', import.meta.url), { type: 'module' });
      signal?.addEventListener('abort', () => { w.terminate(); reject(new DOMException('aborted', 'AbortError')); });
      w.onmessage = (e: MessageEvent<import('./newGameWorker').NewGameMsg>) => {
        const m = e.data;
        if (m.type === 'progress') onProgress({ step: m.step, frac: m.frac });
        else if (m.type === 'done') { w.terminate(); resolve(m.game as GameState); }
        else { w.terminate(); reject(new Error(m.message)); }
      };
      w.onerror = (e) => { w.terminate(); reject(new Error(e.message || 'worker')); };
      w.postMessage({ world, opts });
    });
    if (signal?.aborted) return;
    put(game);
  } catch (e) {
    if ((e as Error).name === 'AbortError') return;
    console.warn('Nyt spil i en Worker fejlede – opretter i hovedtråden', e);
    createGame(world, opts);
    if (opts.preview) setSetupGame(gs());
  }
}
