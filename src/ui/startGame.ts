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
import { iosOrUnknownMobile, newGameSafe, type DbSize } from './dbSize';
import { noteNewGameStep } from '../online/newGameTrace';
import { deserializeState } from '../game/snapshot';
import type { SaveMeta } from '../game/save';

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
    let keep = false;
    try { keep = localStorage.getItem('cm0102.ngKeepLoad') === '1'; } catch { /* ingen lagring */ }
    const w = new Worker(new URL('./newGameWorker.ts', import.meta.url), { type: 'module' });
    const slim = await new Promise<WorldData>((resolve, reject) => {
      w.onmessage = (e: MessageEvent<import('./newGameWorker').NewGameMsg>) => { if (e.data.type === 'trace') { if (NG_TRACE) console.log(`ngtrace load: ${e.data.s}`); } else if (e.data.type === 'slim') resolve(e.data.slim); else if (e.data.type === 'error') reject(new Error(e.data.message)); };
      w.onerror = (e) => reject(new Error(e.message || 'worker'));
      // (22/11) uden `keep` behøves kun listerne – arbejderen tolker ikke hele databasen (worldFetch.ts fetchSlimWorld)
      w.postMessage({ type: 'load', src, slimOnly: !keep } satisfies LoadJob);
    });
    w.onmessage = null; w.onerror = null;
    // (hukommelse, iPhone 22/11) indlæsningens arbejder lukkes, når listerne er sendt: dens heap har JSON-tolkningens affald (svarets tekst, den
    // tolkede database), og den midlertidige verdens første trin oven i den gav nyt-spil-forløbets top (WebKit, Normal: 1,05–1,24 GB). Spillets
    // første trin henter databasen igen i en frisk arbejder (fra browserens cache) – som ved Take Control.
    // `localStorage['cm0102.ngKeepLoad'] = '1'`: arbejderen beholdes til det første spil som før (til målinger).
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
  // (hukommelse, iOS 26/11) efter et nyt spil, browseren lukkede (dbSize.ts newGameSafe): den mest konservative vej
  let split = true, parts = newGameSafe() ? SL_PARTS_SAFE : iosOrUnknownMobile() ? SL_PARTS_MOBILE : SL_PARTS;
  try {
    split = localStorage.getItem('cm0102.ngSplit') !== '0';
    const n = Number(localStorage.getItem('cm0102.ngSlParts'));
    if (Number.isInteger(n) && n >= 1 && n <= 64) parts = n;
  } catch { /* ingen lagring */ }
  if (!split) return [undefined];
  // (26/11, 2 GB-telefoner: forhåndsvisningen tog 4–10 min) den midlertidige verden til Select Team er let – uden forkørslen, trupplanen, ønskelisterne
  // og kampene før start (newgame.ts o.preview); to arbejdere, så databasen ikke lever sammen med resten af spilstarten (én arbejder: toppen +120 MB)
  if (opts.preview) return [['base'], ['fitness', 'plan', 'shortlists', 'rest']];
  // (22/11) ønskelisternes klubløkke i `parts` portioner – hver i sin egen arbejder (cmShortlistGame.ts cmShortlistStartPart: bit for bit som én løkke)
  return [['base'], ['fitness'], ['plan'], ...Array.from({ length: parts }, (_, k): NewGamePhase[] => (k === parts - 1 ? [`shortlists:${k}/${parts}`, 'rest'] : [`shortlists:${k}/${parts}`]))];
}
/** (målinger) arbejdernes trin i konsollen – localStorage['cm0102.ngTrace'] = '1' (scripts/webkit-newgame.mjs TIMELINE) */
const NG_TRACE = (() => { try { return typeof localStorage !== 'undefined' && localStorage.getItem('cm0102.ngTrace') === '1'; } catch { return false; } })();
/** ønskelisternes portioner ved nyt spil (localStorage['cm0102.ngSlParts'] overstyrer – til målinger) */
const SL_PARTS = 12;
/** (hukommelse, iPhone 26/11 – NewGameInterrupted midt i ønskelisterne) iPhone/iPad og mobiler uden navigator.deviceMemory: 4 større portioner.
 *  Hvert arbejderskifte (ny arbejder, newgame-chunken tolket igen, spillet kopieret over) kostede ~5 s på telefonen (78 s for 12 portioner af
 *  ~0,2 s beregning) og en ny heap; WebKit, SLOW=5, produktion: 12 → 4 portioner = Take Control 58,7 → 43,6 s, ønskelisternes top 310 → 335 MB,
 *  fanens footprint × tid −22 %. Bit for bit samme spil (cmShortlistStartPart; scripts/newgame-phases-check.ts … 4: ENS).
 *  (26/11 aften) Tilbage til 12: iPad-nedbruddet a5b0f3b8 kom med 4 portioner (68 % = Englands tunge klubber i én arbejder) – med færre portioner
 *  får hver arbejder mere af det tunge arbejde. WebKit (iPhone-UA, SLOW=5, Minimum, efter exportPages i bidder): ønskelisternes top 4/12/24 =
 *  328/299/292 MB, Take Control 28/41/57 s. */
const SL_PARTS_MOBILE = 12;
/** (hukommelse, iOS 26/11) den konservative vej efter en NewGameInterrupted (dbSize.ts newGameSafe): flest og mindste arbejdere (lavest top) */
const SL_PARTS_SAFE = 24;
/** (hukommelse, iOS 26/11) sidepuljens loft i arbejderne (cmMem.ts setPagePoolMax; kun genbrug – samme spil): iPhone/iPad og den konservative vej
 *  SL_POOL_SMALL sider, ellers uændret (undefined). localStorage['cm0102.ngPoolMax'] overstyrer (til målinger). */
const SL_POOL_SMALL = 2048;
const poolMax = (): number | undefined => {
  try { const v = localStorage.getItem('cm0102.ngPoolMax'); const n = Number(v); if (v !== null && v !== '' && Number.isInteger(n) && n >= 0) return n; } catch { /* ingen lagring */ }
  return newGameSafe() || iosOrUnknownMobile() ? SL_POOL_SMALL : undefined;
};
/** pause (ms) mellem den sidste arbejders lukning og udpakningen i hovedtråden – localStorage['cm0102.ngUnpackGap'] overstyrer (til målinger) */
/** (iOS) pause mellem to trins arbejdere (ms) – localStorage['cm0102.ngGap'] overstyrer (til målinger) */
const PHASE_GAP_MS = 400;
/** (hukommelse, iOS 26/11) den konservative vejs pause mellem to arbejdere (forrige arbejders heap frigives imens) */
const PHASE_GAP_SAFE_MS = 1500;
const phaseGap = () => { const d = newGameSafe() ? PHASE_GAP_SAFE_MS : PHASE_GAP_MS; try { const v = localStorage.getItem('cm0102.ngGap'); const n = Number(v); return v !== null && v !== '' && n >= 0 && n <= 5000 ? n : d; } catch { return d; } };
const UNPACK_GAP_MS = 1000;
const unpackGap = () => { try { const v = localStorage.getItem('cm0102.ngUnpackGap'); const n = Number(v); return v !== null && v !== '' && n >= 0 && n <= 10000 ? n : UNPACK_GAP_MS; } catch { return UNPACK_GAP_MS; } };
// (25/11) new URL(..) SKAL stå bogstaveligt i new Worker – ellers bundler Vite ikke arbejderen, men kopierer den rå .ts-fil til assets/, og alle
// trinenes arbejdere fejlede før første besked (v0.37.0: "NewGameInterrupted … step none", spillet bygget i hovedtråden). Vagt: tests/workerUrls.test.ts
const newWorker = () => new Worker(new URL('./newGameWorker.ts', import.meta.url), { type: 'module' });
/** (25/11) er siden fra en ældre udgivelse? Den udgivne forside peger på et andet hovedscript end siden her (som dayRunner.ts) – null = ukendt */
async function staleBuild(): Promise<boolean | null> {
  try {
    const html = await (await fetch('/', { cache: 'no-store' })).text();
    const mine = [...document.querySelectorAll<HTMLScriptElement>('script[type=module][src]')].map((x) => new URL(x.src).pathname);
    const live = [...html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    return mine.length && live.length ? !live.some((u) => mine.includes(u)) : null;
  } catch { return null; }
}
/** (24/11, "NewGameWorkerFailed: worker") arbejderen fejlede uden besked (onerror uden message – typisk et script, der ikke kunne hentes):
 *  fejlteksten får arbejderens nummer og trin, fejlens fil/linje, arbejderscriptets HTTP-status (404 = siden er fra en ældre udgivelse – de gamle
 *  filer findes ikke længere), hovedtrådens heap og enhedens hukommelse. `stale` = scriptet findes ikke længere (siden skal genindlæses). */
export const WORKER_DIED_MS = 30000;
/** (25/11) fejl, der skyldes for lidt hukommelse (postMessage "Data cannot be cloned, out of memory", allokeringsfejl, messageerror) */
export const isMemoryText = (s: string): boolean => /out of memory|cannot be cloned|allocation failed|invalid array length|messageerror/i.test(s);
export async function workerFailure(e: Event | null, where: string, elapsedMs = 0): Promise<{ text: string; stale: boolean; died: boolean; memory: boolean }> {
  const ev = e as Partial<ErrorEvent> | null;
  // (25/11) en arbejder, der dør uden besked og uden fil efter lang tid, er et nedbrud (næsten altid hukommelse) – en 404 på scriptet bagefter
  // skyldes en udgivelse i mellemtiden, ikke at arbejderen ikke kunne hentes
  const died = !ev?.message && !ev?.filename && elapsedMs > WORKER_DIED_MS;
  const parts = [where];
  if (ev?.message) parts.push(`"${String(ev.message).slice(0, 160)}"`); else parts.push('no message');
  if (ev?.filename) parts.push(`at ${String(ev.filename).replace(/^.*\/assets\//, '')}:${ev.lineno ?? 0}:${ev.colno ?? 0}`);
  let stale = false;
  if (ev?.filename) {
    try {
      const r = await fetch(String(ev.filename), { method: 'HEAD', cache: 'no-store' });
      stale = r.status === 404;
      parts.push(`script ${r.status}${stale ? ' (stale build)' : ''}`);
    } catch (x) { parts.push(`script fetch failed (${(x as Error).message?.slice(0, 60) ?? '?'})`); }
  } else if (!died) {
    const st = await staleBuild();
    if (st) stale = true;
    parts.push(st === null ? 'build ?' : st ? 'stale build' : 'build current');
  }
  let lowMem = false;
  try {
    const m = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (m) parts.push(`heap ${Math.round(m.usedJSHeapSize / 1048576)}/${Math.round(m.jsHeapSizeLimit / 1048576)} MB`);
    const n = navigator as Navigator & { deviceMemory?: number };
    lowMem = n.deviceMemory !== undefined && n.deviceMemory <= 2;
    parts.push(`mem ${n.deviceMemory ?? '?'}`, `online ${n.onLine ? 'yes' : 'no'}`, `page ${typeof document !== 'undefined' ? document.visibilityState : '?'}`);
  } catch { /* ignorér */ }
  return { text: `worker${died ? ' died' : ''}: ${parts.join(', ')}`, stale, died, memory: (died && lowMem) || isMemoryText(ev?.message ?? '') };
}
/** en arbejder, der ikke kunne hentes, fordi siden er fra en ældre udgivelse (workerFailure stale) – teksten til spilleren er ui.staleBuild */
export class StaleBuildError extends Error { stale = true; }
/** kører trinene i hver sin arbejder; den sidste svarer med spillet */
/** arbejdernes svar: spillet som gzip-bytes (+ det første gem, hvis arbejderen skrev det); `started` = en arbejder nåede at svare (så kører de) */
type PhasesResult = { gz: ArrayBuffer; saved: SaveMeta | null };
class PhasesError extends Error { started = false; stale = false; memory = false; }
/** (Firefox 27/11 – "step fitness 17 %" i 39 s, så forlod spilleren siden; Android "fitness stod 5 min") Gecko (Firefox, også på Android) smider en
 *  besked i en MessageChannel væk, hvis afsenderens port lukkes eller dens arbejder afsluttes, før modtagerens port er sendt videre og har den
 *  (målt: Firefox 157 – 0 af 6 varianter kom frem, kun "port åben + arbejderen afsluttet efter modtagelsen"; WebKit og Chromium alle 6). Arbejderen
 *  for trinet efter 'base' ventede for evigt på spillet. (27/11 aften, Android 10/Chrome 138 med 4 GB: samme symptom – "step fitness 17 % at 17 s"
 *  i 138 s) Nu i alle browsere: afsenderen holdes i live med åben port, til den næste har meldt 'received', og modtageren beder om en gensendelse,
 *  hvis spillet ikke kommer (ui/handoff.ts). */
/** (hukommelse, iOS) kun iPhone/iPad (alle browsere dér er WebKit, der leverer kanalens besked, også når afsenderen er afsluttet – målt 27/11, alle
 *  6 varianter): afsenderen afsluttes straks efter 'handed', og den næste venter phaseGap(), før den tager spillet – ellers er begge arbejderes heap i
 *  hukommelsen samtidig (WebKit, iPhone-UA, SLOW=5: phys_footprint_peak 640/677 → 723/908 MB med afsenderen i live). Modtagerens gensendelse
 *  (ui/handoff.ts) får da intet svar, men fejler efter MAX_RESENDS i stedet for at vente for evigt. */
export const senderMayClose = (ua = typeof navigator !== 'undefined' ? navigator.userAgent : '', touch = typeof navigator !== 'undefined' ? navigator.maxTouchPoints ?? 0 : 0): boolean =>
  /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touch > 1);
/** (26/11, measure 2a7262b5d7f1: en arbejder døde uden fejl og uden besked – hovedtråden ventede i 400 s) så længe uden besked fra arbejderen,
 *  mens siden er synlig, regnes den for død (arbejderne melder fremdrift mange gange i minuttet – også på en langsom telefon) */
export const WORKER_SILENT_MS = 120000;
/** (27/11, "worker died: no message for 125 s, 15/15 [shortlists:11/12 rest] after 4030 s, step done 97%" – en meget langsom pc: hele spilstarten
 *  67 min, og spilstartens sidste stræk (forkørslens kampe efter 'done' 97 %) sendte ingen besked i over 2 min) Arbejderne sender nu hjerteslag fra
 *  alle lange løkker (src/game/beat.ts, højst hvert 5. s), så tavshed betyder en død/hængt arbejder – eller en blok, der ikke kan slå (den strukturerede
 *  kopi ved overdragelsen, en tabt kanalbesked). Grænsen følger maskinens hastighed: mindst WORKER_SILENT_MS, ellers en fjerdedel af den tid,
 *  spilstarten allerede har kørt (synlig tid) – på denne Mac er spilstartens længste blok uden hjerteslag ≈ 4 % af hele spilstarten (resten ≤ 2,7 %, den strukturerede kopi 1,4 %)
 *  (scripts/newgame-gaps.ts). Tid, mens siden er skjult, eller mens timerne er frosset (> 15 s mellem to slag af vagten), tæller ikke. */
export const WORKER_SILENT_FRAC = 0.25;
export class SilenceGuard {
  /** tavs synlig tid siden sidste besked / al synlig tid siden starten (ms) */
  quiet = 0; active = 0;
  private tick: number;
  private now: () => number;
  private visible: () => boolean;
  constructor(now: () => number = Date.now, visible: () => boolean = () => typeof document === 'undefined' || document.visibilityState === 'visible') { this.now = now; this.visible = visible; this.tick = now(); }
  heard(): void { this.quiet = 0; }
  limit(): number { return Math.max(WORKER_SILENT_MS, (this.active - this.quiet) * WORKER_SILENT_FRAC); }
  /** vagtens slag (hvert 5. s): true = arbejderen regnes for død */
  check(): boolean {
    const n = this.now(), dt = n - this.tick; this.tick = n;
    if (dt > 15000 || !this.visible()) return false;
    this.quiet += dt; this.active += dt;
    return this.quiet > this.limit();
  }
}
/** (test) kører trinene; `pre` = arbejderen til første trin */
export function runPhases(first: NewGameJob, stages: NewGameJob['phases'][], pre: Worker | null, onProgress: (p: NewGameProgress) => void, signal?: AbortSignal): Promise<PhasesResult> {
  return new Promise<PhasesResult>((resolve, reject) => {
    let cur: Worker | null = null, prev: Worker | null = null, done = false, started = false, step = '', frac = 0, cnt = 0;
    const t0 = Date.now();
    const pool = poolMax(), early = senderMayClose(), gap = early ? phaseGap() : 0;
    // vagten: tiden uden besked (også hjerteslag) tælles kun, mens siden er synlig og timerne kører (en skjult/frosset fane drosler både arbejderen og timeren)
    const guard = new SilenceGuard();
    const dog = setInterval(() => {
      if (done) { clearInterval(dog); return; }
      if (guard.check()) fail(Object.assign(new Error(`worker died: no message for ${Math.round(guard.quiet / 1000)} s (limit ${Math.round(guard.limit() / 1000)} s), ${cnt}/${stages.length} [${(stages[cnt - 1] ?? ['all']).join(' ')}] after ${Math.round((Date.now() - t0) / 1000)} s (visible ${Math.round(guard.active / 1000)} s), step ${step || 'none'} ${Math.round(frac * 100)}%`), { memory: true }));
    }, 5000);
    const fail = (e: Error) => { if (done) return; done = true; clearInterval(dog); cur?.terminate(); cur = null; prev?.terminate(); prev = null; const pe = Object.assign(new PhasesError(e.message), { name: e.name, stack: e.stack, started, stale: !!(e as StaleBuildError).stale, memory: !!(e as PhasesError).memory || isMemoryText(e.message) }); reject(pe); };
    signal?.addEventListener('abort', () => fail(new DOMException('aborted', 'AbortError')));
    const start = (i: number, w: Worker, job: NewGameJob) => {
      cur = w; cnt = i + 1; guard.heard();
      const wStart = Date.now();
      const last = i === stages.length - 1;
      // næste trins arbejder startes først, når denne er færdig og lukket: spillet venter imens i kanalen (uden om hovedtråden)
      const ch = last ? null : new MessageChannel();
      w.onmessage = (e: MessageEvent<import('./newGameWorker').NewGameMsg>) => {
        const m = e.data;
        if (done) return;
        started = true; guard.heard();
        if (m.type === 'beat') { /* hjerteslag (src/game/beat.ts) – kun vagten */ }
        else if (m.type === 'received') { prev?.terminate(); prev = null; }
        else if (m.type === 'progress') { step = m.step; frac = m.frac; onProgress({ step: m.step, frac: m.frac }); }
        else if (m.type === 'trace') {
          if (NG_TRACE) console.log(`ngtrace ${i}: ${m.s}`);
          // (24/11) trinene efter 'done' (pakning, gem, afsendelse) i nyt-spil-sporet – NewGameInterrupted viser, hvor siden blev lukket
          const sub = m.s.startsWith('pakker') ? 'pack' : m.s === 'gemt' ? 'saved' : m.s.startsWith('gem fejlede') ? 'saveFailed' : m.s.startsWith('sender') ? 'send' : null;
          if (sub) noteNewGameStep(sub, 0.98);
        }
        else if (m.type === 'handed' && ch) {
          // (27/11) afsenderen lever, til den næste har spillet ('received', ui/handoff.ts) – undtagen på iOS (senderMayClose): dér afsluttes den
          // straks, og den næste venter en kort pause i arbejderen (Safari frigiver heapen lidt efter terminate; en skjult fanes timere i
          // hovedtråden drosles/fryses), før den tager spillet fra kanalen
          if (early) w.terminate(); else prev = w;
          cur = null;
          start(i + 1, newWorker(), { opts: job.opts, from: ch.port2, ...(gap ? { gapMs: gap } : {}) });
        }
        else if (m.type === 'done' && 'gz' in m) { if (NG_TRACE) console.log('ngtrace main: spillet modtaget'); done = true; clearInterval(dog); w.terminate(); cur = null; prev?.terminate(); prev = null; resolve({ gz: m.gz, saved: m.saved }); }
        else if (m.type === 'done') fail(new Error('worker: no game'));
        else if (m.type === 'error') fail(new Error(m.message));
      };
      w.onerror = (e) => {
        e.preventDefault();
        if (done) return;
        const where = `${i + 1}/${stages.length} [${(stages[i] ?? ['all']).join(' ')}] after ${Math.round((Date.now() - t0) / 1000)} s, step ${step || 'none'} ${Math.round(frac * 100)}%`;
        void workerFailure(e, where, Date.now() - wStart).then((r) => fail(r.stale ? new StaleBuildError(r.text) : Object.assign(new Error(r.text), { memory: r.memory })));
      };
      w.onmessageerror = () => fail(new Error(`worker ${i + 1}/${stages.length}: messageerror`));
      const ports = [...(ch ? [ch.port1] : []), ...(job.from ? [job.from] : [])];
      w.postMessage({ ...job, phases: stages[i], ...(ch ? { to: ch.port1, ...(early ? { closeEarly: true } : {}) } : {}), ...(first.save ? { save: true } : {}), ...(pool !== undefined ? { poolMax: pool } : {}) } satisfies NewGameJob, ports);
    };
    start(0, pre ?? newWorker(), first);
  });
}

/** nyt spil i en Web Worker (ui/newGameWorker.ts) med status undervejs – siden fryser ikke; uden Worker (eller ved fejl) i hovedtråden.
 *  `opts.preview` = nyt-spil-forløbets midlertidige verden (setSetupGame); `signal` afbryder arbejderen (en ny liga-/databasevalg). */
export async function createGameAsync(world: WorldData | StartWorld, opts: NewGameOptions, onProgress: (p: NewGameProgress) => void, signal?: AbortSignal, local?: { save?: boolean }): Promise<void> {
  // StartWorld: arbejderen henter selv databasen (eller bruger den, den allerede har indlæst – kun én gang)
  const sw = 'src' in world ? world : null;
  const report = onProgress;
  onProgress = (p) => { noteNewGameStep(p.step, p.frac); report(p); };
  if (sw?.full) world = sw.full;
  const pre = sw && !sw.full ? sw.worker : null;
  if (sw) sw.worker = null;
  const full = async () => (sw ? sw.full ?? await worldOfSrc(sw.src) : world as WorldData);
  // (hukommelse) det rigtige spil: databasen behøves ikke længere i hovedtråden (world.ts releaseWorldCaches)
  const put = (g: GameState) => { if (opts.preview) setSetupGame(g); else { setGame(g); releaseWorldCaches(); } };
  if (typeof Worker === 'undefined') { createGame(await full(), opts); if (opts.preview) setSetupGame(gs()); else releaseWorldCaches(); return; }
  let got = false;
  try {
    // (iPhone 23/11) arbejderen skriver selv det første gem af et lokalt spil (ikke den midlertidige verden eller fællesspil)
    const save = !!local?.save && !opts.preview;
    const first: NewGameJob = sw && !sw.full ? { src: sw.src, opts, save } : { world: world as WorldData, opts, save };
    const res = await runPhases(first, newGameStages(opts), pre, onProgress, signal);
    got = true;
    if (signal?.aborted) return;
    // (hukommelse, iPhone 24/11) den sidste arbejder er lukket, men Safari frigiver dens heap (spillet + pakningen, ~1–2 GB med Maximum) først lidt
    // efter: hovedtråden pakker først ud efter en pause, så de to ikke er i hukommelsen samtidig (WebKit, Maximum: toppen 2,6 GB lige efter 'done')
    noteNewGameStep('wait', 0.99);
    await new Promise((r) => setTimeout(r, unpackGap()));
    if (signal?.aborted) return;
    noteNewGameStep('unpack', 0.99);
    // spillet pakkes ud som et gemt spil (save.ts loadGame) – arbejderen er lukket, før hovedtråden bygger spillet
    const blob = new Blob([res.gz]);
    const game = await deserializeState(blob);
    if (signal?.aborted) return;
    put(game);
    noteNewGameStep('ready', 1);
    if (res.saved && !opts.preview) { const { adoptWorkerSave } = await import('../game/save'); adoptWorkerSave(res.saved, blob); }
    if (NG_TRACE) console.log('ngtrace main: spillet lagt ind');
  } catch (e) {
    if ((e as Error).name === 'AbortError') return;
    // (iPhone/Android 23/11) Er arbejderne først gået i gang, bygges spillet ikke igen i hovedtråden: den hentede og tolkede hele databasen og
    // byggede spillet selv – på en telefon lukkede browseren siden (NewGameInterrupted 20–40 s efter 'done'). Fejlen vises og meldes i stedet.
    if (got || (e as PhasesError).started) {
      try { const { reportError } = await import('../online/errors'); reportError(new Error(`NewGameWorkerFailed: ${(e as Error).message.slice(0, 400)}`)); } catch { /* ignorér */ }
      // siden er fra en ældre udgivelse (arbejderens fil findes ikke længere): bed spilleren genindlæse i stedet for "worker"
      if ((e as StaleBuildError).stale) { const { t } = await import('../i18n'); throw new Error(t('ui.staleBuild')); }
      // (25/11) for lidt hukommelse (32-bit browser, 2 GB enhed): en klar besked, og næste forsøg bruger den mindste database (dbSize.ts)
      if ((e as PhasesError).memory || isMemoryText((e as Error).message)) {
        const { t } = await import('../i18n'); const { dbSizeAfterInterrupt } = await import('./dbSize');
        dbSizeAfterInterrupt();
        throw Object.assign(new Error(t('ui.outOfMemory')), { memory: true });
      }
      throw e;
    }
    console.warn('Nyt spil i en Worker fejlede – opretter i hovedtråden', e);
    // (25/11) en arbejder, der fejler før første besked (v0.37.0: arbejderens script var den rå .ts-fil), meldes – før byggede hovedtråden spillet
    // i stilhed, og på telefonerne endte det som "NewGameInterrupted … step none"
    // (25/11) en side fra en ældre udgivelse (arbejderens fil findes ikke længere – `stale`) er forventet lige efter en udgivelse: hovedtråden
    // bygger spillet, og det meldes ikke som fejl
    if (!(e as StaleBuildError).stale) {
      try { const { reportError } = await import('../online/errors'); reportError(new Error(`NewGameWorkerFailed: before first message, building in main thread – ${(e as Error).message.slice(0, 380)}`)); } catch { /* ignorér */ }
    }
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
/** arbejderen har ikke sendt en eneste besked i så lang tid (spilstarten melder fremdrift mange gange i minuttet, også under belastning) */
export const CONVERT_SILENCE_MS = 240_000;
/** konverteringen (eller gemmet af den) svarede ikke – ClassicStart viser cxs.conv.timeout */
export class ConvertTimeoutError extends Error { constructor() { super('conversion timeout'); this.name = 'ConvertTimeoutError'; } }
/** et løfte, der afvises med ConvertTimeoutError, hvis det ikke er afgjort inden `ms` (selve arbejdet afbrydes ikke, men spilleren venter ikke mere) */
export function withConvertTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new ConvertTimeoutError()), ms);
    p.then((v) => { clearTimeout(id); resolve(v); }, (e) => { clearTimeout(id); reject(e); });
  });
}

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
      // (26/11, e2e "Convert to original" hang >900 s) arbejderen kunne forsvinde uden onerror, og et svar, der ikke kunne pakkes ud i hovedtråden
      // (messageerror – 'done' bærer hele spillet som struktureret kopi), havde ingen lytter: løftet blev aldrig afgjort. Nu: messageerror afviser,
      // og en vagt afbryder, når arbejderen ikke har sendt noget i CONVERT_SILENCE_MS (ConvertTimeoutError → tydelig fejl til spilleren).
      let settled = false, dog: ReturnType<typeof setTimeout>;
      const fin = (f: () => void) => { if (settled) return; settled = true; clearTimeout(dog); w.terminate(); f(); };
      const arm = () => { clearTimeout(dog); dog = setTimeout(() => fin(() => reject(new ConvertTimeoutError())), CONVERT_SILENCE_MS); };
      arm();
      w.onmessage = (e: MessageEvent<import('./newGameWorker').NewGameMsg>) => {
        const m = e.data;
        arm();
        if (m.type === 'progress') onProgress({ step: m.step, frac: m.frac });
        else if (m.type === 'trace') { if (NG_TRACE) console.log(`ngtrace convert: ${m.s}`); }
        else if (m.type === 'done' && 'game' in m) fin(() => resolve({ game: m.game as GameState, report: m.report! }));
        else if (m.type === 'error') fin(() => reject(Object.assign(new Error(m.message), { inJob: true })));
      };
      w.onerror = (e) => fin(() => reject(new Error(e.message || 'worker')));
      w.onmessageerror = () => fin(() => reject(new Error('worker messageerror')));
      try { w.postMessage(job); } catch (err) { fin(() => reject(err)); }
    });
  } catch (e) {
    if (e instanceof ConvertTimeoutError) { console.error('Konverteringen svarede ikke', e); throw e; }
    // en fejl i selve konverteringen (arbejderen meldte den) vises for spilleren – den køres ikke igen i hovedtråden (det samme ville ske dér,
    // efter endnu en spilstart). Kun når arbejderen ikke kan køre (indlæsning, hukommelse), konverteres i hovedtråden.
    if ((e as { inJob?: boolean }).inJob) { console.error('Konverteringen fejlede', e); throw e; }
    console.warn('Konverteringen i en Worker fejlede – i hovedtråden', e);
    return local();
  }
}
