// Allokeringsprofil (levende objekter) ved et trin i createGame – hvem holder hukommelsen ved spilstartens top.
// Brug: node --expose-gc --import tsx scripts/mem-steps.ts <world-fil> <trin=scouting> <ud.heapprofile> [lande=England]
import { readFileSync, writeFileSync } from 'node:fs';
import { Session } from 'node:inspector';
import { createGame, setNewGameProgress, type WorldData } from '../src/game/newgame';
const [file = 'public/data/world-original.json', at = 'scouting', out = 'mem.heapprofile', natsArg = 'England'] = process.argv.slice(2);
const sess = new Session(); sess.connect();
// ALLOC=1: alle allokeringer (også dem, der allerede er samlet op) pr. trin – <ud>-<trin>.heapprofile
const ALLOC = process.env.ALLOC === '1';
const start = () => sess.post('HeapProfiler.startSampling', { samplingInterval: 65536, ...(ALLOC ? { includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true } : {}) });
sess.post('HeapProfiler.enable'); start();
let world: WorldData | null = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const act = natsArg.split(',').map((nm) => world!.nations.findIndex((x) => x.name === nm)).filter((i) => i >= 0);
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[3] === act[0])![0];
let last = '', cur = '';
setNewGameProgress((st) => {
  if (st === last) return; last = st;
  (globalThis as { gc?: () => void }).gc?.();
  const u = process.memoryUsage();
  console.log(`før ${st.padEnd(10)} heap ${(u.heapUsed / 1048576).toFixed(0)} ab ${(u.arrayBuffers / 1048576).toFixed(0)}`);
  if (ALLOC) { const prev = cur; cur = st; sess.post('HeapProfiler.stopSampling', (e, r) => { if (!e && prev) writeFileSync(`${out}-${prev}.heapprofile`, JSON.stringify(r.profile)); start(); }); }
  else if (st === at) sess.post('HeapProfiler.getSamplingProfile', (e, r) => { if (!e) writeFileSync(out, JSON.stringify(r.profile)); });
});
const w = world; world = null;
createGame(w, { managerName: 'Mem', managerNation: eng, clubId: user, activeNations: act, lang: 'en', masking: true, seed: 1, mode: 'authentic' });
