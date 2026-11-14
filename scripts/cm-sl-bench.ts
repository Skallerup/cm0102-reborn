// Ønskelisternes hastighed og bit-for-bit-kontrol: spilstarten og N dage med ønskelisterne slået til; skriver tider og sha1 af pladserne
// (g.cmPlan), parrene (g.cmSlPairs), buddene og skifterne efter spilstarten og efter hver dag. To kørsler (fx før/efter en optimering, eller
// CM_SL_FAST=0) sammenlignes med `diff`.   npx tsx scripts/cm-sl-bench.ts [dage] [ud.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_ON, SL_STATS, SL_T } from '../src/game/cmShortlistGame';

SL_ON.on = process.env.CM_SL !== '0';
if (process.env.V8FLAGS) (await import('node:v8')).setFlagsFromString(process.env.V8FLAGS);
// PROF=fil.cpuprofile: CPU-profil af hele kørslen (node:inspector)
const prof = process.env.PROF;
const insp = prof ? new (await import('node:inspector')).Session() : null;
const post = (m: string, p?: object) => new Promise<unknown>((ok, no) => insp!.post(m, p ?? {}, (e, r) => (e ? no(e) : ok(r))));
// PROF_DAYS=1: kun dagene (profilen startes efter spilstarten)
const startProf = async () => { insp!.connect(); await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 500 }); await post('Profiler.start'); };
if (insp && !process.env.PROF_DAYS) await startProf();
const days = +(process.argv[2] ?? 21);
const out = process.argv[3];
const sha = (v: unknown) => createHash('sha1').update(JSON.stringify(v ?? null)).digest('hex').slice(0, 12);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
let t = performance.now();
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const tStart = performance.now() - t;
const snap = () => ({ plan: sha(g.cmPlan), pairs: sha(g.cmSlPairs), offers: sha(g.offers), moves: sha(Object.values(g.players).map((p) => p.moves ?? [])), n: g.cmSlPairs?.length ?? 0 });
const res: Record<string, unknown> = { start: snap() };
console.log(`nyt spil ${Math.round(tStart)} ms (heraf ønskelisterne ${Math.round(SL_STATS.startMs)} ms)`, res.start);
const startMs = SL_STATS.ms;
console.log('buildSlMem ved start', Object.fromEntries(Object.entries(SL_T).map(([k, v]) => [k, Math.round(v)])));
for (const k of Object.keys(SL_T)) SL_T[k] = 0;
if (insp && process.env.PROF_DAYS) await startProf();
t = performance.now();
for (let d = 0; d < days; d++) {
  const r = continueGame();
  if (r?.match) quickPlayUserMatch();
  res[g.date] = snap();
}
const ms = performance.now() - t;
console.log(`${days} dage: ${Math.round(ms)} ms; ønskelisterne ${SL_STATS.days} dage ${Math.round(SL_STATS.ms - startMs)} ms (${Math.round((SL_STATS.ms - startMs) / Math.max(1, SL_STATS.days))} ms pr. dag), bud ${SL_STATS.bids}`);
console.log('slut', snap(), 'sprungne værdier læst', SL_STATS.skipHit);
console.log('buildSlMem pr. dag', Object.fromEntries(Object.entries(SL_T).map(([k, v]) => [k, Math.round(v / Math.max(1, days))])));
if (out) writeFileSync(out, JSON.stringify(res, null, 1));
if (insp) { const r = (await post('Profiler.stop')) as { profile: unknown }; writeFileSync(prof!, JSON.stringify(r.profile)); }
