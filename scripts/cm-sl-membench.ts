// Hastighed: ønskelisternes hukommelse (buildSlMem) bygget N gange på spilstartens tilstand – tid pr. del og (PROF=fil) en CPU-profil.
//   npx tsx scripts/cm-sl-membench.ts [n]
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { SL_ON, SL_T, buildSlMem } from '../src/game/cmShortlistGame';
import type { SparseMem } from '../src/game/cmMem';

SL_ON.on = true;
const n = +(process.argv[2] ?? 10);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
process.env.CM_SL_START = '0';
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
(buildSlMem(g).m as SparseMem).release();
for (const k of Object.keys(SL_T)) SL_T[k] = 0;
const prof = process.env.PROF;
const insp = prof ? new (await import('node:inspector')).Session() : null;
const post = (m: string, p?: object) => new Promise<unknown>((ok, no) => insp!.post(m, p ?? {}, (e, r) => (e ? no(e) : ok(r))));
if (insp) { insp.connect(); await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 200 }); await post('Profiler.start'); }
const t = performance.now();
for (let i = 0; i < n; i++) (buildSlMem(g).m as SparseMem).release();
console.log(`buildSlMem ${((performance.now() - t) / n).toFixed(1)} ms`, Object.fromEntries(Object.entries(SL_T).map(([k, v]) => [k, +(v / n).toFixed(1)])));
if (insp) { const r = (await post('Profiler.stop')) as { profile: unknown }; writeFileSync(prof!, JSON.stringify(r.profile)); }
