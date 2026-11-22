// Fælles for startsiderne (moderne Start.tsx og det klassiske nye-spil-flow i ClassicStart.tsx):
// valg af database, indlæsning af verdenen og oprettelse af spillet i en Web Worker.
import { createGame, type NewGameOptions, type NewGamePhase, type WorldData } from '../game/newgame';
import type { GameState, Lang } from '../game/types';
import { gs, setGame, setSetupGame } from '../game/state';
import { getLang } from '../i18n';
import type { CMWorld } from '../game/data/cm0102';
import type { ConvertReport } from '../game/cmConvert';
import type { LoadJob, NewGameJob, WorldSrc } from './newGameWorker';
import type { NewGameProgress } from './NewGameLoader';
import { listDbs, loadCustomWorld } from './customDb';
import { communityEdits, loadOriginalWorld, loadWorld, ORIGINAL_VERSIONS, releaseWorldCaches, withCommunityEdits, type OriginalVersion } from './world';
import { applyCommunityEdits } from './worldFetch';
import type { DbSize } from './dbSize';

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

/** Hvor databasen kommer fra (arbejderen henter den selv): null, hvis en egen database ikke findes længere */
export async function startWorldSrc(db: Db, ver: OriginalVersion, size: DbSize = 'maximum'): Promise<WorldSrc | null> {
  if (db.startsWith('custom:')) {
    const id = db.slice(7);
    const d = (await listDbs()).find((x) => x.id === id);
    if (!d) return null;
    const v = (d.ver ?? '3.9.60') as OriginalVersion;
    const edits = d.base === 'original' && v !== '3.9.60' ? null : await communityEdits(d.base === 'original' ? 'original' : 'cm');
    return { base: d.base === 'original' ? 'original' : 'modern', ver: v, custom: d, edits };
  }
  // fællesskabets rettelser gælder 3.9.60 (de andre udgaver bruges præcis som originalen)
  if (db === 'original') return { base: 'original', ver, size, edits: ver === '3.9.60' ? await communityEdits('original') : null };
  return { base: 'modern', ver, edits: await communityEdits('cm') };
}

/** Hele databasen i hovedtråden (uden Web Worker, fællesspil) – som loadStartWorld */
export async function worldOfSrc(src: WorldSrc): Promise<WorldData> {
  let w = src.base === 'original' ? await loadOriginalWorld(src.ver, src.size) : await loadWorld();
  if (src.custom) { const { applyDb } = await import('../game/dbEdit'); w = applyDb(w, src.custom); }
  return applyCommunityEdits(w, src.edits);
}

/**
 * (Hukommelse, iPhone 21/11) Startforløbets database: en Web Worker henter og parser den og sender kun listerne (slimWorld) – hovedtråden holder
 * aldrig hele databasen. Arbejderen beholder den til det første spil, der bygges (`worker` til createGameAsync); senere spil får en ny arbejder,
 * der henter den igen (fra browserens cache). Uden Web Worker: hele databasen i hovedtråden som før.
 */
export interface StartWorld { src: WorldSrc; slim: WorldData; worker: Worker | null; full?: WorldData }
export async function openStartWorld(db: Db, ver: OriginalVersion, size: DbSize = 'maximum'): Promise<StartWorld | null> {
  const src = await startWorldSrc(db, ver, size);
  if (!src) return null;
  const local = async (): Promise<StartWorld> => { const full = await worldOfSrc(src); return { src, slim: full, worker: null, full }; };
  if (typeof Worker === 'undefined') return local();
  try {
    const w = new Worker(new URL('./newGameWorker.ts', import.meta.url), { type: 'module' });
    const slim = await new Promise<WorldData>((resolve, reject) => {
      w.onmessage = (e: MessageEvent<import('./newGameWorker').NewGameMsg>) => { if (e.data.type === 'slim') resolve(e.data.slim); else if (e.data.type === 'error') reject(new Error(e.data.message)); };
      w.onerror = (e) => reject(new Error(e.message || 'worker'));
      w.postMessage({ type: 'load', src } satisfies LoadJob);
    });
    w.onmessage = null; w.onerror = null;
    // (hukommelse, iPhone 22/11) indlæsningens arbejder lukkes, når listerne er sendt: dens heap har JSON-tolkningens affald (svarets tekst, den
    // tolkede database), og den midlertidige verdens første trin oven i den gav nyt-spil-forløbets top (WebKit, Normal: 1,05–1,24 GB). Spillets
    // første trin henter databasen igen i en frisk arbejder (fra browserens cache) – som ved Take Control.
    // `localStorage['cm0102.ngKeepLoad'] = '1'`: arbejderen beholdes til det første spil som før (til målinger).
    let keep = false;
    try { keep = localStorage.getItem('cm0102.ngKeepLoad') === '1'; } catch { /* ingen lagring */ }
    if (!keep) { w.terminate(); return { src, slim, worker: null }; }
    return { src, slim, worker: w };
  } catch (e) {
    console.warn('Databasen i en Worker fejlede – i hovedtråden', e);
    return local();
  }
}
/** (hukommelse, iPhone 22/11) spilstartens trin pr. kortlivet Web Worker: Safaris heap fragmenteres under de tunge trin (forkørslen, trupplanen,
 *  ønskelisterne – levende ~0,3–0,65 GB, kapaciteten op til 2,4 GB), og en afsluttet arbejders heap frigives helt. Spillet går fra arbejder til
 *  arbejder uden om hovedtråden (MessageChannel). `localStorage['cm0102.ngSplit'] = '0'`: alt i én arbejder som før (til målinger). */
export function newGameStages(opts: Pick<NewGameOptions, 'preview'>): NewGameJob['phases'][] {
  let split = true, parts = SL_PARTS;
  try {
    split = localStorage.getItem('cm0102.ngSplit') !== '0';
    const n = Number(localStorage.getItem('cm0102.ngSlParts'));
    if (Number.isInteger(n) && n >= 1 && n <= 64) parts = n;
  } catch { /* ingen lagring */ }
  if (!split) return [undefined];
  if (opts.preview) return [['base'], ['fitness'], ['plan', 'shortlists', 'rest']];
  // (22/11) ønskelisternes klubløkke i `parts` portioner – hver i sin egen arbejder (cmShortlistGame.ts cmShortlistStartPart: bit for bit som én løkke)
  return [['base'], ['fitness'], ['plan'], ...Array.from({ length: parts }, (_, k): NewGamePhase[] => (k === parts - 1 ? [`shortlists:${k}/${parts}`, 'rest'] : [`shortlists:${k}/${parts}`]))];
}
/** ønskelisternes portioner ved nyt spil (localStorage['cm0102.ngSlParts'] overstyrer – til målinger) */
const SL_PARTS = 12;
/** pause mellem to trins arbejdere (ms) */
const PHASE_GAP_MS = 400;
const newWorker = () => new Worker(new URL('./newGameWorker.ts', import.meta.url), { type: 'module' });
/** kører trinene i hver sin arbejder; den sidste svarer med spillet */
function runPhases(first: NewGameJob, stages: NewGameJob['phases'][], pre: Worker | null, onProgress: (p: NewGameProgress) => void, signal?: AbortSignal): Promise<GameState> {
  return new Promise<GameState>((resolve, reject) => {
    let cur: Worker | null = null, done = false;
    const fail = (e: Error) => { if (done) return; done = true; cur?.terminate(); cur = null; reject(e); };
    signal?.addEventListener('abort', () => fail(new DOMException('aborted', 'AbortError')));
    const start = (i: number, w: Worker, job: NewGameJob) => {
      cur = w;
      const last = i === stages.length - 1;
      // næste trins arbejder startes først, når denne er færdig og lukket: spillet venter imens i kanalen (uden om hovedtråden)
      const ch = last ? null : new MessageChannel();
      w.onmessage = (e: MessageEvent<import('./newGameWorker').NewGameMsg>) => {
        const m = e.data;
        if (done) return;
        if (m.type === 'progress') onProgress({ step: m.step, frac: m.frac });
        else if (m.type === 'handed' && ch) {
          // (hukommelse) Safari frigiver en afsluttet arbejders heap lidt efter terminate – næste arbejder startes først efter en kort pause, så de
          // to ikke er i hukommelsen samtidig (målt i WebKit: toppen ved skiftet)
          w.terminate(); cur = null;
          setTimeout(() => { if (!done) start(i + 1, newWorker(), { opts: job.opts, from: ch.port2 }); }, PHASE_GAP_MS);
        }
        else if (m.type === 'done') { done = true; w.terminate(); cur = null; resolve(m.game as GameState); }
        else if (m.type === 'error') fail(new Error(m.message));
      };
      w.onerror = (e) => fail(new Error(e.message || 'worker'));
      const ports = [...(ch ? [ch.port1] : []), ...(job.from ? [job.from] : [])];
      w.postMessage({ ...job, phases: stages[i], ...(ch ? { to: ch.port1 } : {}) } satisfies NewGameJob, ports);
    };
    start(0, pre ?? newWorker(), first);
  });
}

/** nyt spil i en Web Worker (ui/newGameWorker.ts) med status undervejs – siden fryser ikke; uden Worker (eller ved fejl) i hovedtråden.
 *  `opts.preview` = nyt-spil-forløbets midlertidige verden (setSetupGame); `signal` afbryder arbejderen (en ny liga-/databasevalg). */
export async function createGameAsync(world: WorldData | StartWorld, opts: NewGameOptions, onProgress: (p: NewGameProgress) => void, signal?: AbortSignal): Promise<void> {
  // StartWorld: arbejderen henter selv databasen (eller bruger den, den allerede har indlæst – kun én gang)
  const sw = 'src' in world ? world : null;
  if (sw?.full) world = sw.full;
  const pre = sw && !sw.full ? sw.worker : null;
  if (sw) sw.worker = null;
  const full = async () => (sw ? sw.full ?? await worldOfSrc(sw.src) : world as WorldData);
  // (hukommelse) det rigtige spil: databasen behøves ikke længere i hovedtråden (world.ts releaseWorldCaches)
  const put = (g: GameState) => { if (opts.preview) setSetupGame(g); else { setGame(g); releaseWorldCaches(); } };
  if (typeof Worker === 'undefined') { createGame(await full(), opts); if (opts.preview) setSetupGame(gs()); else releaseWorldCaches(); return; }
  try {
    const first: NewGameJob = sw && !sw.full ? { src: sw.src, opts } : { world: world as WorldData, opts };
    const game = await runPhases(first, newGameStages(opts), pre, onProgress, signal);
    if (signal?.aborted) return;
    put(game);
  } catch (e) {
    if ((e as Error).name === 'AbortError') return;
    console.warn('Nyt spil i en Worker fejlede – opretter i hovedtråden', e);
    createGame(await full(), opts);
    if (opts.preview) setSetupGame(gs()); else releaseWorldCaches();
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
        else if (m.type === 'error') { w.terminate(); reject(Object.assign(new Error(m.message), { inJob: true })); }
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
