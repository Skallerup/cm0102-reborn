// Fingeraftryk af en spillet periode (ægte tilstand, den originale database, gittermotoren): hash af hele GameState hver uge + tiden.
// Til optimeringer, der ikke må ændre resultaterne: samme frø → samme hashes bit for bit før og efter.
//   npx tsx scripts/perf-fingerprint.ts [slutdato = 2002-05-20] [frø = 1] [klub = Wrexham]   (HASH=0: kun tiden; CM_GAME_CACHE_USE=1: spilstarten fra
//   tests/helpers/gameCache.ts – første gang bygges og gemmes den, næste gang indlæses den)
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { rng } from '../src/game/rng';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { cachedCreateGame, GAME_CACHE_STATS } from '../tests/helpers/gameCache';

const until = process.argv[2] ?? '2002-05-20', seed = Number(process.argv[3] ?? 1), clubName = process.argv[4] ?? 'Wrexham';
const t0 = performance.now();
const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const t1 = performance.now();
const eng = world.nations.findIndex((x) => x.name === 'England');
(process.env.CM_GAME_CACHE_USE === '1' ? (w: WorldData, o: Parameters<typeof createGame>[1]) => cachedCreateGame(createGame, w, o) : createGame)(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === clubName)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
gs().options.engine = 'original';
const t2 = performance.now();
// g.id (save-<Date.now>) er ikke en del af spillet
// CANON=1: felterne i hvert objekt sorteret (spillets JSON-gem bevarer ikke rækkefølgen af felter, der har været sat til undefined, fx
// p.cmContract = undefined ved et klubskifte – kun rækkefølgen, ikke værdierne)
const CANON = process.env.CANON === '1';
const sortKeys = (v: unknown): unknown => {
  if (!CANON || !v || typeof v !== 'object' || Array.isArray(v) || v instanceof Map || v instanceof Set) return v;
  const o = v as Record<string, unknown>, out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) out[k] = v === gs() && k === 'id' ? 0 : o[k];   // (id: som rep)
  return out;
};
const rep = function (this: unknown, k: string, v: unknown) { return this === gs() && k === 'id' ? 0 : v instanceof Map ? { __map: [...v] } : v instanceof Set ? { __set: [...v] } : sortKeys(v); };
const hash = () => createHash('sha256').update(`${rng.state}\n`).update(JSON.stringify(gs(), rep)).digest('hex').slice(0, 16);
const doHash = process.env.HASH !== '0';
const all = createHash('sha256');
let hashMs = 0, lastWeek = '';
const mark = (label: string) => { if (!doHash) return; const h0 = performance.now(); const h = hash(); all.update(h); hashMs += performance.now() - h0; console.log(`${label} ${h}`); };
mark(`start ${gs().date}`);
// CLONE=1: før hver dag en v8-kopi af spillet med modulernes tilstand (som dagens Web Worker, ui/dayRunner.ts) – CLONE=reset: og alle
// moduler nulstillet først (som en ny Web Worker/proces); SAVE=1: spillets eget gem/indlæs (snapshot.ts + upgradeLoaded) før hver dag.
// Samme hashes som uden = kopien/gemmet fortsætter præcis som det uafbrudte spil (src/game/carry.ts).
const cloneMode = process.env.CLONE, saveMode = process.env.SAVE === '1';
const { serialize: v8s, deserialize: v8d } = await import('node:v8');
const { packCarry, setGame } = await import('../src/game/state');
const { restoreCarry } = await import('../src/game/carry');
const { serializeState, deserializeState } = await import('../src/game/snapshot');
const { ensureAllNumbers, upgradeLoaded } = await import('../src/game/save');
while (gs().date < until) {
  // g.rng er talrækkens tilstand ved seneste notify (hashen tager den med) – kopien får den rigtige, og bagefter sættes den gamle værdi tilbage
  const stale = gs().rng, live = rng.state;
  if (cloneMode) {
    const cur = gs(); cur.rng = live; packCarry(cur);
    const buf = v8s(cur); delete cur.cmCarry; cur.rng = stale;
    if (cloneMode === 'reset') { setGame(null); restoreCarry(undefined); }
    setGame(v8d(buf)); gs().rng = stale;
  } else if (saveMode) {
    const blob = await serializeState(gs());
    setGame(null); restoreCarry(undefined);
    setGame(await deserializeState(blob)); upgradeLoaded(); ensureAllNumbers(); gs().rng = stale;
  }
  const g = gs();
  const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
  if (process.env.DAILY) mark(`dag ${g.date}`);
  if (process.env.DUMP_AT === g.date) (await import('node:fs')).writeFileSync(process.env.DUMP!, JSON.stringify(g, rep));
  const wk = g.date.slice(0, 8) + String(Math.floor(+g.date.slice(8, 10) / 7));
  if (wk !== lastWeek) { lastWeek = wk; mark(g.date); }
}
mark(`slut ${gs().date}`);
const t3 = performance.now();
const mem = process.memoryUsage();
if (process.env.CM_GAME_CACHE_USE === '1') console.error('cache', GAME_CACHE_STATS);
console.log(`samlet ${doHash ? all.digest('hex').slice(0, 16) : '-'}`);
console.error(`tid: json ${(t1 - t0).toFixed(0)} ms · createGame ${(t2 - t1).toFixed(0)} ms · spil ${((t3 - t2 - hashMs) / 1000).toFixed(1)} s (hash ${(hashMs / 1000).toFixed(1)} s) · rss ${(mem.rss / 1e6).toFixed(0)} MB heap ${(mem.heapUsed / 1e6).toFixed(0)} MB`);
