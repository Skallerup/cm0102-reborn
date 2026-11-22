// Nyt spil i JavaScriptCore (Safaris motor) uden browser: bundtes med esbuild og køres med macOS' jsc-skal (scripts/jsc-newgame.mjs).
// Skriver trinnene og (med GCSTEP) den levende heap efter en fuld GC – til at finde JSC-specifik hukommelse ved spilstarten.
import { createGame, setNewGameProgress, type WorldData } from '../src/game/newgame';
declare const readFile: (f: string) => string, print: (...a: unknown[]) => void, gc: () => void, fullGC: () => void, gcHeapSize: () => number, heapCapacity: () => number;
const [file, nat = 'England', gcStep = '1'] = (globalThis as unknown as { arguments: string[] }).arguments;
const t0 = Date.now();
const log = (s: string) => print(`${((Date.now() - t0) / 1000).toFixed(1)} s ${s} heap ${(gcHeapSize() / 1048576).toFixed(0)} MB kap ${(heapCapacity() / 1048576).toFixed(0)} MB`);
let world: WorldData | null = JSON.parse(readFile(file)) as WorldData;
fullGC();
log('world parset');
const act = [world.nations.findIndex((x) => x.name === nat)];
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[3] === act[0])![0];
let last = '';
// gcStep 2: hver fremdriftsmelding (uden GC) – fx ønskelisternes start
let lastF = -1;
setNewGameProgress((st, f) => {
  if (gcStep === '2') { if (st === last && f - lastF < 0.005) return; last = st; lastF = f; log(`${st} ${f.toFixed(3)}`); return; }
  if (st === last) return; last = st; if (gcStep === '1') fullGC(); log(`før ${st}`);
});
const w = world; world = null;
createGame(w, { managerName: 'Mem', managerNation: eng, clubId: user, activeNations: act, lang: 'en', masking: true, seed: 1, mode: 'authentic' });
fullGC();
log('færdig');
