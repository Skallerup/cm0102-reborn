// Det hurtige testværn (scripts/test.mjs fast, scripts/ship.sh): hvilke testfiler en ændring skal køre lokalt, før den udgives.
// Hele pakken kører alligevel i CI efter hvert push (.github/workflows/ci.yml) – lokalt kun det, der rammer ændringen direkte:
//   1. de faste vagter (GUARDS: 1:1-kontrollerne K3/K5, ændringsloggen, sprogene, world-filerne, determinismen, låsetrinnene mod originalen),
//   2. ændrede testfiler,
//   3. testfiler, der DIREKTE importerer en ændret fil (statisk/dynamisk import, vi.mock) eller nævner den (sti eller filnavn med endelse,
//      fx 'public/data/world-original.json' eller 'cmBoard.da.json'),
// minus de tunge (median > maxS sekunder i scripts/data/test-times.json – hele sæsoner o.l.), som kun kører i CI (og med `run`/`related`).
// Bliver summen over budget (CPU-sekunder; en ændring i world-filerne eller newgame/state rammer >100 filer), går de langsomste af 3. til CI.
// "related" (vitest) tager hele den transitive modulgraf – ved enhver ændring i src/game ~180 filer, ~1 time CPU.
import fs from 'node:fs';
import path from 'node:path';

export const GUARDS = [
  'tests/changelog.test.ts',        // ændringsloggen (da+en, ⚠ nyt spil)
  'tests/textParity.test.ts',       // K3: engelske tekster mod exe-strengene
  'tests/estimateBudget.test.ts',   // K5: antal `estimeret` i src/game
  'tests/i18nAll.test.ts',          // alle 10 sprog, ingen tomme tekster/rå nøgler
  'tests/worldBuild.test.ts',       // world-filerne er bygget, ikke håndrettede
  'tests/envDeterminism.test.ts',   // src/game læser ikke VITEST/NODE_ENV – samme spil i test og tsx
  'tests/gridLockstep.test.ts',     // kampmotoren tik for tik mod originalen
  'tests/quickLockstep.test.ts',    // hurtigkampen 0x6beeb0 mod originalen
];

const SPEC = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\bvi\.(?:mock|doMock|importActual)\s*\(\s*|\brequire\s*\(\s*)['"`]([^'"`]+)['"`]/g;
const stripExt = (p) => p.replace(/\.(?:[cm]?[jt]sx?|json)$/, '').replace(/\/index$/, '');

/** alle testfiler under dir (relativt til root) */
export function listTests(root, dir = 'tests') {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'fixtures') walk(f); }
      else if (/\.test\.[cm]?[jt]sx?$/.test(e.name)) out.push(f.split(path.sep).join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

/** median-sekunder pr. testfil (scripts/data/test-times.json) */
export function readTimes(root) {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'scripts/data/test-times.json'), 'utf8')).seconds ?? {}; } catch { return {}; }
}

/**
 * changed: ændrede filer (relativt til root). Returnerer { run, heavy, why } – run = de testfiler, der skal køres; heavy = tunge, der
 * ville være valgt, men overlades til CI; why = fil → grund.
 */
export function selectFast(root, changed, { dir = 'tests', maxS = 60, budget = 900, guards = true } = {}) {
  const tests = listTests(root, dir);
  const times = readTimes(root);
  const ch = [...new Set(changed.map((c) => (path.isAbsolute(c) ? path.relative(root, c) : c).split(path.sep).join('/')))];
  const chNoExt = new Map(ch.map((c) => [stripExt(c), c]));
  const why = new Map();
  const add = (t, w) => { if (!why.has(t)) why.set(t, w); };
  if (guards) for (const t of GUARDS) if (tests.includes(t)) add(t, 'vagt');
  for (const c of ch) if (tests.includes(c)) add(c, 'ændret');
  // filnavne, der er for almindelige til at et navn alene siger noget (index.ts, types.ts …): kun sti/import tæller
  const generic = /^(index|types|state|utils?|data|config)\.[a-z]+$/;
  for (const t of tests) {
    if (why.has(t)) continue;
    let src;
    try { src = fs.readFileSync(path.join(root, t), 'utf8'); } catch { continue; }
    const tdir = path.posix.dirname(t);
    let hit = null;
    for (const m of src.matchAll(SPEC)) {
      const s = m[1];
      if (!s.startsWith('.')) continue;
      const r = stripExt(path.posix.normalize(path.posix.join(tdir, s)));
      if (chNoExt.has(r)) { hit = `importerer ${chNoExt.get(r)}`; break; }
    }
    if (!hit) for (const c of ch) {
      const base = path.posix.basename(c);
      if (src.includes(c) || src.includes(stripExt(c) + "'") || (!generic.test(base) && new RegExp(`(?<![\\w.-])${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(src))) { hit = `nævner ${c}`; break; }
    }
    if (hit) add(t, hit);
  }
  const run = [], heavy = [];
  for (const [t, w] of why) {
    if (w !== 'vagt' && (times[t] ?? 0) > maxS) heavy.push(t); else run.push(t);
  }
  const est = (t) => times[t] ?? 5;
  let sum = run.reduce((a, t) => a + est(t), 0);
  if (sum > budget) {
    for (const t of run.filter((x) => why.get(x).startsWith('importerer') || why.get(x).startsWith('nævner')).sort((a, b) => est(b) - est(a))) {
      if (sum <= budget) break;
      run.splice(run.indexOf(t), 1); heavy.push(t); sum -= est(t);
    }
  }
  return { run, heavy, why, seconds: Math.round(sum) };
}

/** scripts/data/test-times.json fra testresultat-cachen (~/.cache/cm-test/entries: ms pr. bestået kørsel) – median pr. fil */
export function timesFromCache(entriesDir) {
  const m = {};
  for (const f of fs.readdirSync(entriesDir)) {
    if (!f.endsWith('.json')) continue;
    try { const j = JSON.parse(fs.readFileSync(path.join(entriesDir, f), 'utf8')); if (j.file && j.ms != null) (m[j.file] ??= []).push(j.ms); } catch { /* halvskrevet */ }
  }
  const seconds = {};
  for (const [k, a] of Object.entries(m).sort()) { a.sort((x, y) => x - y); seconds[k] = Math.round(a[a.length >> 1] / 100) / 10; }
  return seconds;
}
