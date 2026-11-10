// Diagnose af uafgjorte: stilling efter 60 og 75 minutter og hvordan kampene ender.
// Kør: npx tsx scripts/draw-diag.ts [kampe]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { MatchSim } from '../src/game/engine/match';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import type { Player } from '../src/game/types';

const N = Number(process.argv[2] ?? 3000);
const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const ni = (n: string) => world.nations.findIndex((x) => x.name === n);
createGame(world, { managerName: 'Lab', managerNation: ni('England'), clubId: world.clubs[0][0], activeNations: ['England', 'Spain', 'Germany', 'Italy'].map(ni), lang: 'da', masking: true, seed: 9 });
const g = gs();
const leagues = Object.values(g.comps).filter((c) => c.type === 'league' && c.tier === 1);
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
const rng = new Rng(8);
let draws = 0, level60 = 0, level60draw = 0, level75 = 0, level75draw = 0, lead1at75 = 0, lead1held = 0, lead1drawn = 0, ht0 = 0;
for (let i = 0; i < N; i++) {
  const lg = rng.pick(leagues);
  const h = rng.pick(lg.clubs), a = rng.pick(lg.clubs.filter((x) => x !== h));
  const mk = (id: number, opp: number, home: boolean) => { const ps = fresh(id); return { club: id, tactic: aiTactic(id, opp, home), players: new Map(ps.map((p) => [p.id, p])) }; };
  const r = new MatchSim(mk(h, a, true), mk(a, h, false), { commentary: false, aiSubs: [true, true], importance: 0.5 }, rng).runToEnd();
  const at = (m: number) => { let d = 0; for (const e of r.events) if (e.k === 'goal' && e.m <= m) d += e.t === 0 ? 1 : -1; return d; };
  const fin = r.stats[0].goals - r.stats[1].goals;
  if (fin === 0) draws++;
  if (at(45) === 0) ht0++;
  if (at(60) === 0) { level60++; if (fin === 0) level60draw++; }
  const d75 = at(75);
  if (d75 === 0) { level75++; if (fin === 0) level75draw++; }
  if (Math.abs(d75) === 1) { lead1at75++; if (Math.sign(fin) === Math.sign(d75)) lead1held++; else if (fin === 0) lead1drawn++; }
}
const pc = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`;
console.log(`${N} kampe i topligaerne (AI-taktikker)`);
console.log(`uafgjort ${pc(draws, N)} (~25) · lige ved pausen ${pc(ht0, N)} (~42)`);
console.log(`lige efter 60 min: ${pc(level60, N)} – heraf ender ${pc(level60draw, level60)} uafgjort (~50)`);
console.log(`lige efter 75 min: ${pc(level75, N)} – heraf ender ${pc(level75draw, level75)} uafgjort (~65)`);
console.log(`ét måls føring efter 75 min: ${pc(lead1at75, N)} – holdt ${pc(lead1held, lead1at75)} (~75), udlignet ${pc(lead1drawn, lead1at75)} (~20)`);
