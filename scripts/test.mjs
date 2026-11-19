#!/usr/bin/env node
// Vitest med testresultat-cache: samme testfil køres ikke to gange på samme kode (heller ikke på tværs af worktrees).
//   node scripts/test.mjs run [vitest-flag …] <testfiler …>        (= npx vitest run …)
//   node scripts/test.mjs related [vitest-flag …] <kildefiler …>    (= npx vitest related --run …; samme udvælgelse som vitest)
//   --list    vis kun de valgte filer (+ om de springes over)  ·  --force   kør alle de valgte filer (resultatet gemmes igen)      ·   CM_TEST_CACHE=0 / CI: ren vitest uden cache
// Nøglen pr. testfil: testfilens indhold + vite.config.ts, package-lock.json, tsconfig*, setup-filerne, Node/vitest-version, relevante
// miljøvariabler (CI, CM_*, GRID_*, MODE, RECOMP_*, ENGINE, NATIONS, NODE_OPTIONS, TZ) og vitest-flagene, der ændrer kørslen (fx -t) – OG
// indholdet af alt, testfilen faktisk brugte, sidst den bestod: alle indlæste moduler (vitests experimental.recordDependencies, også
// dynamiske imports) og alle filer, den læste via node:fs (tests/helpers/recordReads.ts: world-filerne, fixtures, oraklets udtræk …).
// Ændres ét af dem, køres filen igen. Kun filer, der bestod (eller blev sprunget over af testen selv), gemmes – fejl/timeout gemmes aldrig,
// og en kørsel med ubehandlede fejl gemmer intet. Cachen: ~/.cache/cm-test (CM_TEST_CACHE_DIR), som measure.mjs' ~/.cache/cm-measure.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = process.env.CM_TEST_CACHE_DIR || path.join(os.homedir(), '.cache', 'cm-test');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const HOME = os.homedir();

let argv = process.argv.slice(2);
const force = argv.includes('--force');
const listOnly = argv.includes('--list');   // vis kun udvælgelsen og hvad der ville springes over
argv = argv.filter((a) => a !== '--force' && a !== '--list');
const mode = argv[0] === 'related' || argv[0] === 'run' ? argv.shift() : 'run';

// CI og CM_TEST_CACHE=0: præcis den almindelige vitest
if (process.env.CI || process.env.CM_TEST_CACHE === '0') {
  const r = spawnSync('npx', ['vitest', mode, ...(mode === 'related' && !argv.includes('--run') ? ['--run'] : []), ...argv], { stdio: 'inherit', cwd: process.cwd() });
  process.exit(r.status ?? 1);
}

const { parseCLI, createVitest, version: vitestVersion } = await import('vitest/node');
const { filter, options } = parseCLI(['vitest', mode, ...argv]);
options.run = true; options.watch = false;

// ---------------------------------------------------------------- filhashes (husket pr. sti + størrelse + mtime + inode)
fs.mkdirSync(path.join(DIR, 'entries'), { recursive: true, mode: 0o700 });
const MEMO_FILE = path.join(DIR, 'filehash.json');
let memo = {};
try { memo = JSON.parse(fs.readFileSync(MEMO_FILE, 'utf8')); } catch { memo = {}; }
let memoDirty = false;
const PKG_VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
// vite.config.ts' define: en fil med __APP_VERSION__ oversættes med versionen – den hører med til filens nøgle
const DEFINES = [['__APP_VERSION__', PKG_VERSION]];
const abs = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
function fileHash(p) {
  const a = abs(p);
  let st;
  try { st = fs.statSync(a); } catch { return 'missing'; }
  if (st.isDirectory()) return 'dir:' + sha(fs.readdirSync(a).sort().join('\0'));
  const m = memo[a];
  if (m && m.size === st.size && m.mtime === st.mtimeMs && m.ino === st.ino) return m.h;
  const buf = fs.readFileSync(a);
  let h = sha(buf);
  const txt = buf.length < 50e6 ? buf.toString('latin1') : '';
  for (const [k, v] of DEFINES) if (txt.includes(k)) h = sha(h + k + '=' + v);
  memo[a] = { size: st.size, mtime: st.mtimeMs, ino: st.ino, h };
  memoDirty = true;
  return h;
}
function depHash(p, kind) {
  const a = abs(p);
  let st;
  try { st = fs.statSync(a); } catch { return 'missing'; }
  if (kind === 'e') return st.isDirectory() ? 'dir' : 'file';
  if (kind === 'd') return st.isDirectory() ? 'dir:' + sha(fs.readdirSync(a).sort().join('\0')) : 'file';
  return fileHash(a);
}

// ---------------------------------------------------------------- den faste del af nøglen
const IGNORED_OPTS = new Set(['testTimeout', 'hookTimeout', 'teardownTimeout', 'reporter', 'reporters', 'outputFile', 'maxWorkers', 'minWorkers',
  'fileParallelism', 'dir', 'run', 'watch', 'color', 'silent', 'passWithNoTests', 'bail', 'related', 'cache', 'logHeapUsage', 'slowTestThreshold']);
const optKey = Object.keys(options).filter((k) => !IGNORED_OPTS.has(k) && k !== '--' && k !== '_').sort().map((k) => `${k}=${JSON.stringify(options[k])}`);
const envKey = Object.keys(process.env).filter((k) => /^(CI$|CM_|GRID_|MODE$|RECOMP_|ENGINE$|NATIONS$|NODE_OPTIONS$|TZ$)/.test(k)
  && !/^CM_(TEST_|GAME_CACHE_DIR|GAME_CACHE_MB|MEASURE_)/.test(k)).sort().map((k) => `${k}=${process.env[k]}`);
const FIXED = ['vite.config.ts', 'package-lock.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'tests/helpers/recordReads.ts', 'tests/helpers/setupGameCache.ts', 'scripts/test.mjs'];
const fixedKey = sha(JSON.stringify({ v: 1, node: process.version, vitest: vitestVersion, env: envKey, opts: optKey, fixed: FIXED.map((f) => [f, fileHash(f)]) }));
const rel = (a) => { const r = path.relative(ROOT, a); return r.startsWith('..') || path.isAbsolute(r) ? a : r; };
const entryFile = (relTest) => path.join(DIR, 'entries', sha(fixedKey + '\0' + relTest + '\0' + fileHash(relTest)) + '.json');
const readEntry = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const variantOk = (v) => Object.entries(v.deps).every(([p, [kind, h]]) => depHash(p, kind) === h);

// ---------------------------------------------------------------- vitest
const RECORD = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-test-rec-'));
process.env.CM_TEST_RECORD = RECORD;   // tests/helpers/recordReads.ts (arves af test-workers)
const ctx = await createVitest('test', { ...options, experimental: { ...(options.experimental ?? {}), recordDependencies: true } });
// de moduler, hver testfil indlæste (vitests egen optagelse) – vi tager dem selv og skriver ikke vitests dependencies.json
const deps = new Map();
const dc = ctx.cache._dependencies;
dc.path = null;
dc.record = function (project, filepath, d) { deps.set(filepath, this.resolveFiles(project, d)); };

// udvælgelsen som vitest (related: den statiske modulgraf, som uden optagelse)
const exp = ctx.config.experimental;
exp.recordDependencies = false;
const specs = await ctx.getRelevantTestSpecifications(filter);
exp.recordDependencies = true;
const hits = [], todo = [];
for (const s of specs) {
  const r = rel(s.moduleId);
  const e = force ? null : readEntry(entryFile(r));
  if (e && e.variants.some(variantOk)) hits.push(r); else todo.push(s);
}
const cleanup = () => { try { fs.rmSync(RECORD, { recursive: true, force: true }); } catch { /* */ } if (memoDirty) { try { const t = `${MEMO_FILE}.${process.pid}.tmp`; fs.writeFileSync(t, JSON.stringify(memo)); fs.renameSync(t, MEMO_FILE); } catch { /* */ } } };
if (listOnly) {
  for (const s of specs) console.log(`${hits.includes(rel(s.moduleId)) ? 'cache' : 'kør  '}  ${rel(s.moduleId)}`);
  console.log(`${specs.length} filer, ${hits.length} i cachen`);
  await ctx.close(); cleanup(); process.exit(0);
}
if (hits.length) console.log(`test-cache: ${hits.length} af ${specs.length} testfiler bestod før på samme kode – springes over${hits.length <= 12 ? ': ' + hits.map((h) => path.basename(h)).join(', ') : ''}`);
if (!todo.length) {
  console.log(specs.length ? 'test-cache: intet at køre – alt bestået før' : 'test-cache: ingen testfiler valgt');
  await ctx.close(); cleanup();
  process.exit(specs.length || options.passWithNoTests || mode === 'related' ? 0 : 1);
}
ctx.specifications.getRelevantTestSpecifications = async () => todo;
let result = { testModules: [], unhandledErrors: [] };
let crashed = false;
try { result = await ctx.start(filter); } catch (e) { crashed = true; console.error(e); }
await ctx.close();

const anyUnhandled = crashed || result.unhandledErrors.length > 0;
let failed = anyUnhandled || result.testModules.length < todo.length;
let saved = 0;
// alt i projektet undtagen node_modules (package-lock.json er i nøglen); udenfor: ikke caches, midlertidige filer og systemstier
const inRoot = (a) => a === ROOT || a.startsWith(ROOT + path.sep);
const keep = (a) => !a.includes(`${path.sep}node_modules${path.sep}`) && (inRoot(a) || (!a.startsWith(path.join(HOME, '.cache') + path.sep) && !a.startsWith(RECORD)
  && !a.startsWith(os.tmpdir()) && !a.startsWith('/tmp/') && !a.startsWith('/private/') && !a.startsWith('/dev/') && !a.startsWith('/proc/') && a !== '/'));
for (const tm of result.testModules) {
  const st = tm.state();
  if (st !== 'passed' && st !== 'skipped') { failed = true; continue; }   // fejl/timeout gemmes aldrig
  if (anyUnhandled) continue;                                               // en kørsel med ubehandlede fejl gemmer intet
  const mods = deps.get(tm.moduleId);
  let reads;
  try { reads = JSON.parse(fs.readFileSync(path.join(RECORD, sha(path.resolve(tm.moduleId)) + '.json'), 'utf8')).reads; } catch { reads = null; }
  if (!mods || !reads) continue;   // ingen optagelse – gem ikke
  const d = {};
  for (const m of mods) if (keep(m)) d[rel(m)] = ['f', depHash(m, 'f')];
  for (const [a, k] of reads) if (keep(a) && !(rel(a) in d && k !== 'f')) d[rel(a)] = [k, depHash(a, k)];
  const r = rel(tm.moduleId);
  if (!d[r] || !Object.keys(d).some((k) => k !== r && !k.startsWith('tests/helpers/'))) continue;   // optagelsen mangler noget – gem ikke
  const f = entryFile(r);
  const old = readEntry(f);
  const variants = [{ deps: d }, ...(old?.variants ?? []).filter((v) => JSON.stringify(v.deps) !== JSON.stringify(d))].slice(0, 6);
  try { const t = `${f}.${process.pid}.tmp`; fs.writeFileSync(t, JSON.stringify({ file: r, at: new Date().toISOString(), ms: Math.round(tm.diagnostic().duration), variants })); fs.renameSync(t, f); saved++; } catch { /* fuld disk o.l. */ }
}
console.log(`test-cache: ${todo.length} kørt, ${saved} gemt${hits.length ? `, ${hits.length} sprunget over` : ''}`);
cleanup();
process.exit(failed || process.exitCode ? 1 : 0);
