// (hastighed, kun Node: tests og scripts) createGame med en cache på disken. Et nyt spil med den originale database tager ~18 s (forkørslen,
// ønskelisterne, konditionen …) og ~1 GB under opbygningen; resultatet afhænger kun af world-indholdet, valgene, koden og nogle få globale
// indstillinger. Første gang bygges spillet som altid, og bagefter gemmes GameState + indeksernes rækkefølge + talrækkens tilstand med
// v8.serialize (struktureret kopi – præcis som spillets egne Web Workers sender spillet: ui/newGameWorker.ts, ui/dayRunner.ts) i
// ~/.cache/cm-game/. Næste gang (samme nøgle) lægges kopien ind med setGame + restoreIndexes. GameState er bit for bit den samme; spillet
// derefter er det kun, når al modultilstand følger med (kontrol: scripts/perf-fingerprint.ts med og uden CM_GAME_CACHE_USE=1, DAILY=1).
// Nøglen: sha256 af alle filer i src/, world-objektet (JSON), valgene, de registrerede kroge (hvilke moduler testen har indlæst), sproget,
// gittermotorens fabrik, GRID_UNKNOWN, LEAGUE_RULES, og miljøvariablerne CM_/GRID_/MODE/RECOMP_.
// Lokalt til, i CI fra (se gameCacheOn). Mappen holdes under CM_GAME_CACHE_MB (standard 4000 MB).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serialize, deserialize } from 'node:v8';
import zlib from 'node:zlib';
import type { NewGameOptions, WorldData } from '../../src/game/newgame';
import type { GameState } from '../../src/game/types';
import { gs, setGame, indexSnapshot, restoreIndexes, packCarry, type IndexSnapshot, signHooks } from '../../src/game/state';
import { rng } from '../../src/game/rng';
import { compHooks, natCompHook, intlHooks, finHooks } from '../../src/game/hooks';
import { removeHooks } from '../../src/game/humans';
import { interestHook } from '../../src/game/cmBoardGame';
import { afterPlanHooks } from '../../src/game/cmSquadPlanGame';
import { postHooks, relFlagHookSet } from '../../src/game/cmPlayerData';
import { getGridFactory } from '../../src/game/engine/liveSim';
import { GRID_UNKNOWN } from '../../src/game/engine/grid/gridMatch';
import { LEAGUE_RULES } from '../../src/game/leagues';
import { getLang } from '../../src/i18n';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = process.env.CM_GAME_CACHE_DIR || path.join(os.homedir(), '.cache', 'cm-game');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

// Lokalt til som standard, i CI fra (CM_GAME_CACHE=0 slår den fra, =1 til – også i CI): modulernes tilstand uden for GameState følger med
// kopien (src/game/carry.ts, cmCarry), så et spil fra cachen spiller bit for bit som et nyopbygget – målt en hel sæson med
// scripts/perf-fingerprint.ts (DAILY=1) direkte mod CM_GAME_CACHE_USE=1: samme hash hver dag.
export const gameCacheOn = (): boolean => (process.env.CM_GAME_CACHE ?? (process.env.CI ? '0' : '1')) === '1';

let codeHash: string | null = null;
/** sha256 af alle filer i src/ (sti + indhold) – én gang pr. proces */
function srcHash(): string {
  if (codeHash) return codeHash;
  const h = createHash('sha256');
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (e.isFile()) { h.update(path.relative(ROOT, f)); h.update('\0'); h.update(fs.readFileSync(f)); h.update('\0'); }
    }
  };
  walk(path.join(ROOT, 'src'));
  return (codeHash = h.digest('hex'));
}

const filled = (o: object) => Object.entries(o).filter(([, v]) => v != null).map(([k, v]) => `${k}:${typeof v === 'function' ? sha(String(v)).slice(0, 12) : 'x'}`).sort().join(',');

/** alt andet end world/valgene, som createGame afhænger af */
function contextKey(): string {
  const gf = getGridFactory();
  return JSON.stringify({
    hooks: [filled(compHooks), filled(natCompHook), filled(intlHooks), filled(finHooks), filled(signHooks), filled(removeHooks), filled(interestHook),
      filled(postHooks), afterPlanHooks.map((f) => sha(String(f)).slice(0, 12)).join(',')],
    relFlag: relFlagHookSet(),
    lang: getLang(),
    grid: gf ? sha(String(gf)) : null,
    unknown: GRID_UNKNOWN,
    rules: sha(JSON.stringify(LEAGUE_RULES)),
    env: Object.keys(process.env).filter((k) => /^(CM_|GRID_|MODE$|RECOMP_|ENGINE$|NATIONS$)/.test(k) && !k.startsWith('CM_GAME_CACHE')).sort().map((k) => `${k}=${process.env[k]}`),
  });
}

type Entry = { game: GameState; idx: IndexSnapshot; rng: number };

/** ryd de ældste filer, når mappen fylder mere end grænsen */
function prune(): void {
  const max = Number(process.env.CM_GAME_CACHE_MB ?? 4000) * 1e6;
  let files: { f: string; size: number; t: number }[] = [];
  try { files = fs.readdirSync(DIR).filter((f) => f.endsWith('.v8z')).map((f) => { const s = fs.statSync(path.join(DIR, f)); return { f, size: s.size, t: s.mtimeMs }; }); } catch { return; }
  let total = files.reduce((s, x) => s + x.size, 0);
  for (const x of files.sort((a, b) => a.t - b.t)) {
    if (total <= max) break;
    try { fs.rmSync(path.join(DIR, x.f)); total -= x.size; } catch { /* en anden proces */ }
  }
}

export const GAME_CACHE_STATS = { hits: 0, misses: 0, ms: 0 };

/** createGame (`create` = den rigtige) med cachen; uden cachen (CM_GAME_CACHE=0, CI) = create(world, o) */
export function cachedCreateGame(create: (w: WorldData, o: NewGameOptions) => GameState, world: WorldData, o: NewGameOptions): GameState {
  if (!gameCacheOn()) return create(world, o);
  const t0 = performance.now();
  // valgene kan have funktioner/ukendte felter – JSON fanger dem, der betyder noget for et rent dataobjekt
  const key = sha([srcHash(), sha(JSON.stringify(world)), JSON.stringify(o), contextKey()].join('\n\0'));
  const file = path.join(DIR, key + '.v8z');
  let buf: Buffer | null = null;
  try { buf = fs.readFileSync(file); } catch { buf = null; }
  if (buf) {
    try {
      const e = deserialize(zlib.zstdDecompressSync(buf)) as Entry;
      // som createGame: et nyt id (save-<tid>)
      if (typeof e.game.id === 'string' && e.game.id.startsWith('save-')) e.game.id = `save-${Date.now().toString(36)}`;
      setGame(e.game);
      restoreIndexes(e.idx);
      rng.state = e.rng;
      GAME_CACHE_STATS.hits++; GAME_CACHE_STATS.ms += performance.now() - t0;
      try { const now = new Date(); fs.utimesSync(file, now, now); } catch { /* skrivebeskyttet */ }
      return gs();
    } catch { /* ødelagt fil – byg igen */ }
  }
  const g = create(world, o);
  GAME_CACHE_STATS.misses++;
  try {
    packCarry(g);   // modulernes tilstand (src/game/carry.ts) – setGame lægger den tilbage
    let out: Buffer;
    try { out = zlib.zstdCompressSync(serialize({ game: g, idx: indexSnapshot(), rng: rng.state } satisfies Entry), { params: { [zlib.constants.ZSTD_c_compressionLevel]: 3 } }); } finally { delete g.cmCarry; }
    fs.mkdirSync(DIR, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, out);
    fs.renameSync(tmp, file);
    prune();
  } catch { /* fuld disk o.l. – spillet er bygget alligevel */ }
  return g;
}
