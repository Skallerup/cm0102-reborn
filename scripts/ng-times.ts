// Tid pr. trin i spilstarten (createGameBase + trinene) i node – til optimering af 'players'/'fitness'/'shortlists' (bit for bit uændret).
// Brug: npx tsx scripts/ng-times.ts [world-fil=public/data/world-original-normal.json] [land=England] [til=alle|base|players (stopper efter trinet – til profiler)]
// (node --cpu-prof --import tsx scripts/ng-times.ts … for en profil)
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGameBase, createGamePhase, NEW_GAME_PHASES, setNewGameProgress, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
const [file = 'public/data/world-original-normal.json', nat = 'England', until = 'alle'] = process.argv.slice(2);
const w = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const act = [w.nations.findIndex((x) => x.name === nat)];
const eng = w.nations.findIndex((x) => x.name === 'England');
const clubId = w.clubs.find((c) => c[3] === act[0])![0];
const times: Record<string, number> = {};
let cur = '', t = performance.now();
class Stop extends Error {}
setNewGameProgress((st) => { if (st === cur) return; if (until === 'players' && st === 'squads') throw new Stop(); const n = performance.now(); if (cur) times[cur] = (times[cur] ?? 0) + n - t; cur = st; t = n; });
const T0 = performance.now();
let ctx: ReturnType<typeof createGameBase> | null = null;
try { ctx = createGameBase(w, { managerName: 'T', managerNation: eng, clubId, activeNations: act, lang: 'en', masking: true, seed: 1, mode: 'authentic' }); } catch (e) { if (!(e instanceof Stop)) throw e; }
if (ctx && until !== 'base') for (const ph of NEW_GAME_PHASES) createGamePhase(ph, ctx!);
const n = performance.now(); if (cur) times[cur] = (times[cur] ?? 0) + n - t;
const { id: _id, ...g } = gs() as unknown as Record<string, unknown>;
console.log(Object.entries(times).map(([k, v]) => `${k} ${(v / 1000).toFixed(2)}`).join('  '), ` | i alt ${((n - T0) / 1000).toFixed(2)} s  rss ${(process.memoryUsage().rss / 1048576).toFixed(0)} MB`);
console.log('sha', createHash('sha256').update(JSON.stringify(g)).digest('hex').slice(0, 16));
