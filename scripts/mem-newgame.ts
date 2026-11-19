// Hukommelsestoppen ved nyt spil + de første dage (Safari "RangeError: Out of memory" 19/11).
// Brug: node --expose-gc --import tsx scripts/mem-newgame.ts <world-fil> [dage=10] [lande=England,…]
// Skriver heapUsed / arrayBuffers / rss efter hvert trin og toppen (målt med 50 ms-interval) samt fingeraftryk af tilstanden.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGame, setNewGameProgress, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, setGame, indexSnapshot, restoreIndexes, packCarry, notify } from '../src/game/state';
import { rng } from '../src/game/rng';
import { SL_DIAG } from '../src/game/cmShortlistGame';
import { Session } from 'node:inspector';
import { writeFileSync } from 'node:fs';

// MEMPROF=<fil>: allokeringsprofilen (levende objekter) ved slutningen af dag 2's klubløkke (ønskelisternes top)
const PROF = process.env.MEMPROF;
const sess = PROF ? new Session() : null;
if (sess) { sess.connect(); sess.post('HeapProfiler.enable'); sess.post('HeapProfiler.startSampling', { samplingInterval: 32768 }); }
let endN = 0;
SL_DIAG.end = () => {
  endN++;
  (globalThis as { gc?: () => void }).gc?.();
  const u = process.memoryUsage();
  console.log(`  ønskelisternes slutning #${endN}: levende heap ${(u.heapUsed / 1048576).toFixed(0)} MB ab ${(u.arrayBuffers / 1048576).toFixed(0)} MB`);
  if (sess && endN === 2) sess.post('HeapProfiler.getSamplingProfile', (e, r) => { if (!e) writeFileSync(PROF!, JSON.stringify(r.profile)); });
};

const file = process.argv[2] ?? 'public/data/world-original.json';
const days = Number(process.argv[3] ?? 10);
const nats = (process.argv[4] ?? 'England').split(',').filter(Boolean);
const gc = (globalThis as { gc?: () => void }).gc ?? (() => {});
const MB = (v: number) => (v / 1048576).toFixed(0);
let peak = { heap: 0, ab: 0, sum: 0, rss: 0 };
const sample = () => {
  const u = process.memoryUsage();
  peak.heap = Math.max(peak.heap, u.heapUsed); peak.ab = Math.max(peak.ab, u.arrayBuffers); peak.rss = Math.max(peak.rss, u.rss);
  peak.sum = Math.max(peak.sum, u.heapUsed + u.arrayBuffers);
};
const t = setInterval(sample, 50);
const report = (label: string) => {
  sample(); gc(); const u = process.memoryUsage();
  console.log(`${label.padEnd(22)} heap ${MB(u.heapUsed)} MB  ab ${MB(u.arrayBuffers)} MB  rss ${MB(u.rss)} MB | top heap ${MB(peak.heap)} ab ${MB(peak.ab)} sum ${MB(peak.sum)} rss ${MB(peak.rss)}`);
};
report('start');
let world: WorldData | null = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
report('world parset');
const eng = world.nations.findIndex((x) => x.name === 'England');
const act = nats.map((nm) => world!.nations.findIndex((x) => x.name === nm)).filter((i) => i >= 0);
const user = world.clubs.find((c) => c[3] === eng)![0];
let stepPeak = 0, stepName = 'start';
const stepT = setInterval(() => { stepPeak = Math.max(stepPeak, process.memoryUsage().heapUsed); }, 20);
setNewGameProgress((st) => { gc(); const u0 = process.memoryUsage(); console.log(`  efter ${stepName.padEnd(10)} levende heap ${MB(u0.heapUsed)} MB ab ${MB(u0.arrayBuffers)} MB`); stepPeak = Math.max(stepPeak, process.memoryUsage().heapUsed); console.log(`  trin ${stepName.padEnd(10)} top heap ${MB(stepPeak)} MB (nu ${MB(process.memoryUsage().heapUsed)})`); stepName = st; stepPeak = 0; });
createGame(world, { managerName: 'Mem', managerNation: eng, clubId: user, activeNations: act, lang: 'en', masking: true, seed: 1, mode: 'authentic' });
world = null;
setNewGameProgress(null); clearInterval(stepT); console.log(`  trin ${stepName.padEnd(10)} top heap ${MB(stepPeak)} MB`);
report('createGame');
// CLONE=1: som Continue Game med dagens Web Worker (ui/dayRunner.ts + ui/dayWorker.ts) – spillet kopieres frem og tilbage pr. dag, i samme
// proces (WebKit: hovedtråd og arbejdere deler fanens hukommelse); arbejderen slipper spillet (setGame(null)) efter hver kørsel
const CLONE = process.env.CLONE === '1';
const sha = () => { gs().rng = rng.state; return createHash('sha256').update(JSON.stringify({ ...gs(), id: 0 })).digest('hex').slice(0, 16); };
// (en funktion: kopierne må ikke ligge på stakken bagefter)
function oneDay(): void {
  if (CLONE) {
    gs().rng = rng.state; packCarry(gs());
    const msg = structuredClone({ game: gs(), idx: indexSnapshot() });
    delete gs().cmCarry;
    const main = gs();
    setGame(msg.game); restoreIndexes(msg.idx);
    const g = gs(), start = g.date;
    while (g.date === start || !g.dayDone || g.pendingFixture) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); if (g.date !== start && g.dayDone && !g.pendingFixture) break; }
    notify(); packCarry(gs());
    const back = structuredClone({ game: gs(), idx: indexSnapshot() });
    setGame(null);
    void main;
    setGame(back.game); restoreIndexes(back.idx);
  } else {
    const g = gs(), start = g.date;
    while (g.date === start || !g.dayDone || g.pendingFixture) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); if (g.date !== start && g.dayDone && !g.pendingFixture) break; }
  }
}
for (let d = 0; d < days; d++) {
  oneDay();
  await new Promise((r) => setTimeout(r, 0));
  report(`dag ${gs().date} ${sha()}`);
  if (CLONE && process.env.SNAPAT === String(d + 1)) { const v8 = await import('node:v8'); console.log('snapshot', v8.writeHeapSnapshot(process.env.SNAPFILE)); }
}
clearInterval(t);
const g = gs();
const h = sha();
console.log(`fingeraftryk ${h}  spillere ${Object.keys(g.players).length}  stab ${Object.keys((g as { staff?: object }).staff ?? {}).length}`);
