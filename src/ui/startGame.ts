// Fælles for startsiderne (moderne Start.tsx og det klassiske nye-spil-flow i ClassicStart.tsx):
// valg af database, indlæsning af verdenen og oprettelse af spillet i en Web Worker.
import { createGame, type NewGameOptions, type WorldData } from '../game/newgame';
import type { GameState, Lang } from '../game/types';
import { gs, setGame, setSetupGame } from '../game/state';
import { getLang } from '../i18n';
import type { CMWorld } from '../game/data/cm0102';
import type { ConvertReport } from '../game/cmConvert';
import type { NewGameJob } from './newGameWorker';
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
    const w = await loadCustomWorld(id);
    return d.base === 'original' && d.ver && d.ver !== '3.9.60' ? w : withCommunityEdits(w, d.base === 'original' ? 'original' : 'cm');
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

// ---------------------------------------------------------------- gamle gemte spil (game/cmConvert.ts)

/** Hvad et gammelt spil kan blive til: 'convert' = en kopi med originalens systemer (den originale database), 'restart' = forfra i den originale med
 *  samme klub (2026/27) – `clubId` null = klubben fandtes ikke i 2001, spilleren vælger blandt `candidates` (samme land og niveau) */
export type ConvertPrep =
  | { kind: 'convert'; old: GameState; world: WorldData; opts: NewGameOptions }
  | { kind: 'restart'; old: GameState; world: WorldData; clubId: number | null; candidates: { id: number; name: string; league: string }[]; oldClub: string };

export async function prepareConversion(old: GameState): Promise<ConvertPrep | null> {
  const cv = await import('../game/cmConvert');
  const kind = cv.saveKindOf(old);
  if (kind === 'oldOriginal') {
    // udgaven: spillets egen (dbVersion); ældre gemte spil uden den – den udgave, hvor spillernes id'er og navne passer
    const vers: OriginalVersion[] = old.dbVersion && (ORIGINAL_VERSIONS as readonly string[]).includes(old.dbVersion) ? [old.dbVersion as OriginalVersion] : ['3.9.68', '3.9.60', '3.9.65'];
    let best: { w: WorldData; m: number } | null = null;
    for (const v of vers) {
      const w = await loadStartWorld('original', v);
      if (!w) continue;
      const m = vers.length === 1 ? 1 : cv.versionMatch(old, w as CMWorld);
      if (!best || m > best.m) best = { w, m };
      if (m >= 0.9) break;
    }
    if (!best) return null;
    return { kind: 'convert', old, world: best.w, opts: cv.convertOptions(old, best.w as CMWorld, getLang()) };
  }
  if (kind !== 'modern') return null;
  const world = await loadStartWorld('original', readVer());
  if (!world) return null;
  const c = old.clubs[old.userClub] ?? old.clubs[old.manager.history.at(-1)?.club ?? -1];
  const nation = cv.mapNation(old.nations[c?.nation ?? old.manager.nation]?.name, world as CMWorld);
  const clubId = c ? cv.matchClubIn(world as CMWorld, c.name, c.short, nation) : null;
  const tier = c ? old.leagues[c.league]?.tier ?? 1 : 1;
  let candidates = cv.clubCandidates(world as CMWorld, nation, tier);
  if (!candidates.length) candidates = cv.clubCandidates(world as CMWorld, world.nations.findIndex((n) => n.name === 'England'), tier);
  return { kind: 'restart', old, world, clubId, candidates, oldClub: c?.name ?? '' };
}

/** Konverteringen i en Web Worker (som nyt spil, med fremdriften) – uden Worker i hovedtråden. Spillet lægges ikke ind (setGame): kalderen gemmer det
 *  som en ny kopi. */
export async function runConversion(prep: ConvertPrep, clubId: number | null, onProgress: (p: NewGameProgress) => void): Promise<{ game: GameState; report: ConvertReport }> {
  const cv = await import('../game/cmConvert');
  const picked = prep.kind === 'restart' && clubId !== null && clubId !== prep.clubId;
  const opts = prep.kind === 'convert' ? prep.opts : cv.restartOptions(prep.old, prep.world as CMWorld, clubId ?? prep.clubId!, getLang());
  const job: NewGameJob = { world: prep.world, opts, convert: { kind: prep.kind, old: prep.old, picked } };
  const local = () => {
    createGame(prep.world, opts);
    const fresh = gs();
    const report = prep.kind === 'convert' ? cv.convertOriginal(prep.old, fresh, prep.world as CMWorld) : cv.restartInOriginal(prep.old, fresh, prep.world as CMWorld, picked);
    const game = gs();
    setGame(null);
    return { game, report };
  };
  if (typeof Worker === 'undefined') return local();
  try {
    return await new Promise((resolve, reject) => {
      const w = new Worker(new URL('./newGameWorker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<import('./newGameWorker').NewGameMsg>) => {
        const m = e.data;
        if (m.type === 'progress') onProgress({ step: m.step, frac: m.frac });
        else if (m.type === 'done') { w.terminate(); resolve({ game: m.game as GameState, report: m.report! }); }
        else { w.terminate(); reject(Object.assign(new Error(m.message), { inJob: true })); }
      };
      w.onerror = (e) => { w.terminate(); reject(new Error(e.message || 'worker')); };
      w.postMessage(job);
    });
  } catch (e) {
    // en fejl i selve konverteringen (arbejderen meldte den) vises for spilleren – den køres ikke igen i hovedtråden (det samme ville ske dér,
    // efter endnu en spilstart). Kun når arbejderen ikke kan køre (indlæsning, hukommelse), konverteres i hovedtråden.
    if ((e as { inJob?: boolean }).inJob) { console.error('Konverteringen fejlede', e); throw e; }
    console.warn('Konverteringen i en Worker fejlede – i hovedtråden', e);
    return local();
  }
}
