// Ønskelisternes tællere pr. dag (frasorteringens grunde, vurderinger, genudfyldninger efter afviste bud, qsort) – til hastighedsarbejdet.
//   npx tsx scripts/cm-sl-counts.ts [dage]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_ON, SL_STATS, FR_STATS, SL_DROP, PV_STATS } from '../src/game/cmShortlistGame';
import { QSORT_STATS } from '../src/game/cmGen/x86';
import { EVAL_STATS } from '../src/game/cmSlEval';

SL_ON.on = true;
const days = +(process.argv[2] ?? 10);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const snap = () => ({ fr: { ...FR_STATS }, drop: SL_DROP.n, q: { ...QSORT_STATS } });
for (const k of Object.keys(FR_STATS)) delete FR_STATS[+k];
SL_DROP.n = 0; PV_STATS.n = PV_STATS.miss = 0;
QSORT_STATS.fast = QSORT_STATS.slow = 0;
const ms0 = SL_STATS.ms, d0 = SL_STATS.days;
for (let d = 0; d < days; d++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
const s = snap();
const per = (v: number) => Math.round(v / days);
const tot = Object.values(s.fr).reduce((a, b) => a + b, 0);
console.log(`${days} dage, ${Math.round((SL_STATS.ms - ms0) / Math.max(1, SL_STATS.days - d0))} ms pr. dag`);
console.log('pr. dag: kandidater', per(tot), 'vurderet (200/201)', per((s.fr[200] ?? 0) + (s.fr[201] ?? 0)), 'genudfyldninger (drop)', per(s.drop), 'qsort', s.q);
console.log('grunde pr. dag', Object.fromEntries(Object.entries(s.fr).map(([k, v]) => [k, per(v)])));
console.log('0x840d80: TS', EVAL_STATS.ts, 'oversat', EVAL_STATS.gen, 'afvigende', EVAL_STATS.bad);
console.log('planValue pr. dag', per(PV_STATS.n), 'nye', per(PV_STATS.miss));
