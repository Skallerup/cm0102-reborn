// Skader pr. kamp (CM 01/02 har ca. 0,3-0,5 pr. hold): npx tsx scripts/injury-stats.ts [kampe] [original|modern]
import { readFileSync } from 'node:fs';
import { ageOn } from '../src/game/dates';
import { caFromValue, makePlayer, type SubPos } from '../src/game/data/generate';
import { MatchSim, type EngineTeam } from '../src/game/engine/match';
import { Rng } from '../src/game/rng';
import { autoSelect, newTactic } from '../src/game/tactics';
import type { Foot, Player } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world-modern.json', 'utf8'));
const date = '2025-08-01';
const squads = new Map<number, Player[]>();
const clubs: number[] = world.clubs.filter((c: unknown[]) => c[4] === 'GB1').map((c: unknown[]) => c[0] as number);
for (const r of world.players) {
  if (!clubs.includes(r[5])) continue;
  const p = makePlayer({ id: r[0], first: r[1], last: r[2], dob: r[3], nation: r[4], club: r[5], sub: r[6] as SubPos, foot: r[7] as Foot, height: r[8], ca: caFromValue(r[9], ageOn(r[3], date)), value: r[9], date, seed: 1 });
  if (!squads.has(p.club)) squads.set(p.club, []);
  squads.get(p.club)!.push(p);
}
const team = (club: number): EngineTeam => { const ps = squads.get(club)!; return { club, tactic: autoSelect(newTactic('4-4-2'), ps), players: new Map(ps.map((p) => [p.id, p])) }; };
const N = Number(process.argv[2] ?? 200);
const COND = Number(process.env.COND ?? 100);
for (const ps of squads.values()) for (const p of ps) p.condition = COND;
const rules = (process.argv[3] ?? 'original') as 'original';
for (const human of [false, true]) {
  const r = new Rng(11);
  let inj = 0, lines = 0, cond = 0, nc = 0;
  for (let i = 0; i < N; i++) {
    const sim = new MatchSim(team(clubs[i % clubs.length]), team(clubs[(i + 5) % clubs.length]), { commentary: true, aiSubs: [!human, true], rules }, r);
    const rep = sim.runToEnd();
    inj += rep.events.filter((e) => e.k === 'injury').length;
    lines += sim.commentary.filter((l) => l.k === 'injury').length;
    for (const t of [0, 1] as const) for (const s of sim.live(t).on) { cond += s.cond; nc++; }
  }
  console.log(`${rules}${human ? ' (menneske styrer hjemmeholdet)' : ''}: skader ${(inj / N).toFixed(2)} pr. kamp, skadelinjer ${(lines / N).toFixed(2)}, kondition ved slut ${(cond / nc).toFixed(0)}%`);
}
