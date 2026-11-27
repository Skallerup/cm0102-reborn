// (27/11) Spilstartens længste tavse stræk: tiden mellem to beskeder fra arbejderen (fremdrift, hjerteslag src/game/beat.ts, et frit
// begivenhedsloop under pakningen) – hovedtrådens vagt (startGame.ts runPhases) må aldrig se et stræk, der på en meget langsom pc bliver
// over grænsen. Kører spilstarten i én proces (samme trin som newGameWorker.ts), så pakningen (serializeNewGame) og den strukturerede kopi.
// Brug: npx tsx scripts/newgame-gaps.ts [world-fil] [land=England] [top=12]
import { readFileSync } from 'node:fs';
import { createGameBase, createGamePhase, NEW_GAME_PHASES, setNewGameProgress, type WorldData } from '../src/game/newgame';
import { gs, packCarry } from '../src/game/state';
import { gzConcat, serializeNewGame, deserializeState } from '../src/game/snapshot';
import { releasePagePool } from '../src/game/cmMem';
import { setBeat } from '../src/game/beat';
import '../src/game/sim';

const [file = 'public/data/world-original.json', nat = 'England', topS = '12'] = process.argv.slice(2);
const w0 = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const act = [w0.nations.findIndex((x) => x.name === nat)];
const eng = w0.nations.findIndex((x) => x.name === 'England');
const clubId = w0.clubs.find((c) => c[3] === act[0])![0];
const opts = { managerName: 'Check', managerNation: eng, clubId, activeNations: act, lang: 'en' as const, masking: true, seed: 1, mode: 'authentic' as const };

const gaps: { ms: number; from: string; to: string }[] = [];
let lastT = performance.now(), lastL = 'start';
const mark = (l: string) => {
  const t = performance.now();
  gaps.push({ ms: t - lastT, from: lastL, to: l });
  lastT = t; lastL = l;
};
let beats = 0;
setNewGameProgress((s, f) => mark(`${s} ${Math.round(f * 100)}%`));
setBeat(() => { beats++; mark('beat'); }, 0);
const t0 = performance.now();
const ctx = createGameBase(w0, opts);
mark('trin base');
for (const ph of NEW_GAME_PHASES) { createGamePhase(ph, ctx); mark(`trin ${ph}`); }
releasePagePool();
const tGame = performance.now() - t0;
// pakningen: et frit begivenhedsloop = arbejderens interval sender et slag
const iv = setInterval(() => mark('loop'), 10);
mark('pakker');
const g = gs();
const gz = gzConcat(await serializeNewGame(g));
mark('pakket');
clearInterval(iv);
setBeat(null);
const top = gaps.sort((a, b) => b.ms - a.ms).slice(0, Number(topS));
console.log(`spilstart ${(tGame / 1000).toFixed(1)} s, ${beats} slag, ${(gz.byteLength / 1048576).toFixed(1)} MB`);
for (const x of top) console.log(`${(x.ms / 1000).toFixed(2).padStart(7)} s  ${x.from} → ${x.to}  (${(x.ms / tGame * 100).toFixed(2)} % af spilstarten)`);
// blokke uden mulighed for hjerteslag: den strukturerede kopi (overdragelsen mellem trinene) og udpakningen af bytes i næste arbejder
packCarry(g);
let t = performance.now();
structuredClone(g);
const tClone = performance.now() - t;
t = performance.now();
await deserializeState(new Blob([gz]));
console.log(`struktureret kopi ${(tClone / 1000).toFixed(2)} s (${(tClone / tGame * 100).toFixed(2)} %), udpakning ${((performance.now() - t) / 1000).toFixed(2)} s`);
