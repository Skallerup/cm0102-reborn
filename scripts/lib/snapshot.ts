// !!! IKKE BIT-IDENTISK MED EN KØRSEL FRA BUNDEN (målt 17/11, scripts/snap-check.ts) – brug det ikke til tal, der skal sammenlignes med
// !!! kørsler fra bunden. Selve GameState (inkl. rng) gemmes og indlæses eksakt (fingeraftryk ens ved D1), men motoren har modulhukommelse
// !!! uden for GameState (fx cmFitness.staleSev, cmFinance.lastDiv, cmSlMem/cmValue-hukommelser, WeakMap-caches pr. g, kroge fra cmFitNewGame),
// !!! og allerede den første spildag efter indlæsningen giver andre skader/trætheder. En snapshot-kørsel er deterministisk (to kørsler
// !!! er ens), men en anden "verden" end fra bunden. Kræver, at motormodulerne gøres snapshot-bevidste (src/), før det kan bruges til målinger.
// Gemte spiltilstande som startpunkt for målinger (spar newgame + "spil frem til datoen").
//   const g = loadOrCreate({ world, worldFile, club: 'Wrexham', date: '2001-09-01', seed: 1, mode: 'authentic', engine: 'original' });
// Tilstanden gemmes (node:v8 structured clone = Map/Set/NaN/-0/undefined præcis som i hukommelsen, ikke spillets 2-decimalers saveformat)
// i ~/.cache/cm-measure/snap/<nøgle>.v8.gz sammen med indeksernes rækkefølge (state.indexSnapshot) og RNG-tilstanden.
// Nøglen = hash af ALT motorkode (src/game/**, src/i18n/**, version/modernFlag og denne fil, inkl. ikke-committede ændringer) + world-filens
// indhold + parametrene – en tilstand genbruges aldrig på ændret kode. Dato-snapshot bygges oven på newgame-snapshottet, hvis det findes.
// Flag: SNAP_DIR=<mappe>, SNAP=0 slår det fra (kører fra bunden, gemmer intet). Rydning: slet mappen (snapshots er blot en cache).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { deserialize, serialize } from 'node:v8';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createGame, type WorldData } from '../../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../../src/game/sim';
import { gs, indexSnapshot, restoreIndexes, setGame, type IndexSnapshot } from '../../src/game/state';
import { rng } from '../../src/game/rng';
import { cmFitPreMatch } from '../../src/game/cmFitnessGame';
import type { GameState } from '../../src/game/types';

const ROOT = join(import.meta.dirname, '..', '..');
export const SNAP_DIR = process.env.SNAP_DIR ?? join(homedir(), '.cache', 'cm-measure', 'snap');
const FORMAT = 1;

export interface SnapOpts {
  world: WorldData;
  /** world-filens sti (hash af indholdet indgår i nøglen; ellers hash af world-objektet) */
  worldFile?: string;
  /** klubbens navn eller id */
  club: string | number;
  /** spil frem til (inklusive) denne dato; udelad = lige efter newgame */
  date?: string;
  seed?: number;
  mode?: 'authentic' | 'extended';
  engine?: 'original';
  /** ekstra aktive lande end England */
  nations?: string[];
  /** navn på fremspolingen (indgår i nøglen) – skift det, hvis du giver din egen `advance` */
  advanceTag?: string;
  /** egen fremspoling til datoen (standard: continueGame + quickPlayUserMatch, som grid-season.ts) */
  advance?: (g: GameState, until: string) => void;
  log?: (s: string) => void;
}

const sha = (...p: (string | Buffer)[]) => { const h = createHash('sha1'); for (const x of p) { h.update(x); h.update('\0'); } return h.digest('hex'); };

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|json|mts)$/.test(e.name)) out.push(p);
  }
  return out;
}
let codeH: string | null = null;
/** hash af motorkoden (indhold, ikke mtime – samme kode i en anden worktree giver samme nøgle) */
export function codeHash(): string {
  if (codeH) return codeH;
  const h = createHash('sha1');
  const files = [...walk(join(ROOT, 'src/game')), ...walk(join(ROOT, 'src/i18n')), join(ROOT, 'src/version.ts'), join(ROOT, 'src/ui/modernFlag.ts'), join(ROOT, 'scripts/lib/snapshot.ts')];
  for (const f of files) if (existsSync(f)) { h.update(f.slice(ROOT.length)); h.update('\0'); h.update(readFileSync(f)); h.update('\0'); }
  return (codeH = h.digest('hex'));
}

const worldHashes = new Map<string, string>();
function worldHash(o: SnapOpts) {
  const k = o.worldFile ?? '(obj)';
  let h = worldHashes.get(k);
  if (!h) worldHashes.set(k, (h = o.worldFile ? sha(readFileSync(o.worldFile)) : sha(JSON.stringify(o.world))));
  return h;
}

function resolveClub(o: SnapOpts): number {
  if (typeof o.club === 'number') return o.club;
  const c = o.world.clubs.find((x) => x[1] === o.club);
  if (!c) throw new Error(`ukendt klub ${o.club}`);
  return c[0];
}

function baseKey(o: SnapOpts) {
  return sha(String(FORMAT), codeHash(), worldHash(o), String(resolveClub(o)), String(o.seed ?? 1), o.mode ?? '-', o.engine ?? '-', (o.nations ?? []).join(','));
}
const dateKey = (o: SnapOpts, date: string) => sha(baseKey(o), date, o.advanceTag ?? 'default');
const fileOf = (key: string) => join(SNAP_DIR, `${key}.v8.gz`);

interface Snap { g: GameState; idx: IndexSnapshot }
function save(key: string, g: GameState) {
  g.rng = rng.state;
  mkdirSync(SNAP_DIR, { recursive: true });
  const tmp = fileOf(key) + `.tmp${process.pid}`;
  writeFileSync(tmp, gzipSync(serialize({ g, idx: indexSnapshot() } satisfies Snap), { level: 1 }));
  renameSync(tmp, fileOf(key));
}
function load(key: string): GameState | null {
  const f = fileOf(key);
  if (!existsSync(f)) return null;
  try {
    const s = deserialize(gunzipSync(readFileSync(f))) as Snap;
    setGame(s.g);            // rng.state, økonomi, indekser (genbygget …)
    restoreIndexes(s.idx);   // … og så de gemte indeksrækkefølger, som dagens kørsel havde dem
    prime(s.g);
    return s.g;
  } catch { return null; }
}

/** Modulhukommelse, som createGame efterlader uden for GameState (kroge/kontekster, der ellers først kobles af dagens cmFitDay – efter at
 *  den første dags landskampe allerede er kørt). cmFitPreMatch(g, []) kobler dem uden at røre tilstanden. */
function prime(g: GameState) { cmFitPreMatch(g, []); }

/** standardfremspoling: som scripts/grid-season.ts */
export function defaultAdvance(g: GameState, until: string) {
  while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
}

/** Returnerer spillet (også sat som aktivt spil i state.ts) – fra snapshot, hvis der er et, ellers bygget og gemt. */
export function loadOrCreate(o: SnapOpts): GameState {
  const log = o.log ?? ((s: string) => console.error(`[snap] ${s}`));
  const off = process.env.SNAP === '0';
  const t0 = Date.now();
  const eng = o.world.nations.findIndex((x) => x.name === 'England');
  const create = () => {
    const nat = [eng, ...(o.nations ?? []).map((nm) => o.world.nations.findIndex((x) => x.name === nm)).filter((i) => i >= 0 && i !== eng)];
    createGame(o.world, { managerName: 'Lab', managerNation: eng, clubId: resolveClub(o), activeNations: nat, lang: 'en', masking: true, seed: o.seed ?? 1, mode: o.mode ?? 'extended' });
    const g = gs();
    if (o.engine) g.options.engine = o.engine;
    return g;
  };
  if (!off && o.date) {
    const g = load(dateKey(o, o.date));
    if (g) { log(`dato-snapshot ${o.date} indlæst (${Date.now() - t0} ms)`); return g; }
  }
  let g = off ? null : load(baseKey(o));
  if (g) log(`newgame-snapshot indlæst (${Date.now() - t0} ms)`);
  else {
    g = create();
    log(`newgame ${Date.now() - t0} ms`);
    if (!off) save(baseKey(o), g);
  }
  if (o.date && g.date < o.date) {
    const t1 = Date.now();
    (o.advance ?? defaultAdvance)(g, o.date);
    log(`spillet frem til ${g.date} på ${((Date.now() - t1) / 1000).toFixed(1)} s`);
    if (!off) save(dateKey(o, o.date), g);
  }
  return g;
}

const repl = (_k: string, v: unknown) => (typeof v === 'number' && !Number.isFinite(v) ? String(v) : Object.is(v, -0) ? '-0' : v);
/** fingeraftryk af hele tilstanden (til bit-for-bit-kontrol; `id` er et tidsstempel fra newgame og udelades) */
export function fingerprint(g: GameState = gs()): string {
  g.rng = rng.state;
  return sha(JSON.stringify({ ...g, id: 0 }, repl));
}
/** fingeraftryk pr. topnøgle i GameState (til at finde, hvor to tilstande afviger) */
export function fingerprintParts(g: GameState = gs()): Record<string, string> {
  g.rng = rng.state;
  return Object.fromEntries(Object.entries({ ...g, id: 0 }).map(([k, v]) => [k, sha(JSON.stringify(v, repl) ?? 'undefined').slice(0, 10)]));
}
export function snapInfo(): { dir: string; files: number; mb: number } {
  if (!existsSync(SNAP_DIR)) return { dir: SNAP_DIR, files: 0, mb: 0 };
  const fs = readdirSync(SNAP_DIR).filter((f) => f.endsWith('.v8.gz'));
  return { dir: SNAP_DIR, files: fs.length, mb: Math.round(fs.reduce((s, f) => s + statSync(join(SNAP_DIR, f)).size, 0) / 1e5) / 10 };
}
