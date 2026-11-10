// Kommentarlinjer pr. kamp (til at afstemme tempoet mod CM 01/02): npx tsx scripts/commentary-stats.ts [kampe]
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
const N = Number(process.argv[2] ?? 40);
// spil-for-spil må ikke ændre resultaterne: samme frø med og uden
const res = (pbp: boolean) => { const r2 = new Rng(9); return Array.from({ length: 10 }, (_, i) => { const s = new MatchSim(team(clubs[i]), team(clubs[i + 1]), { commentary: true, playByPlay: pbp, aiSubs: [true, true] }, r2); const rep = s.runToEnd(); return `${rep.stats[0].goals}-${rep.stats[1].goals}/${rep.stats[0].shots}`; }).join(' '); };
const [a, b] = [res(false), res(true)];
console.log(a === b ? 'samme resultater med og uden spil-for-spil' : `FORSKEL!\n${a}\n${b}`);
const r = new Rng(3);
const kinds = new Map<string, number>();
let total = 0;
for (let i = 0; i < N; i++) {
  const sim = new MatchSim(team(clubs[i % clubs.length]), team(clubs[(i + 3) % clubs.length]), { commentary: true, playByPlay: true, aiSubs: [true, true] }, r);
  sim.runToEnd();
  total += sim.commentary.length;
  for (const l of sim.commentary) kinds.set(l.k, (kinds.get(l.k) ?? 0) + 1);
}
console.log(`linjer pr. kamp: ${(total / N).toFixed(1)}`);
if (process.argv[3]) {
  const { loadMatchTexts, originalText } = await import('../src/ui/matchTexts');
  await loadMatchTexts();
  const sim = new MatchSim(team(clubs[0]), team(clubs[1]), { commentary: true, playByPlay: true, aiSubs: [true, true] }, new Rng(5));
  sim.runToEnd();
  sim.commentary.slice(0, Number(process.argv[4] ?? 60)).forEach((l, i) => console.log(`${l.m}' ${originalText(l, { home: 'Hjem', away: 'Ude', lang: process.argv[3], ref: 'Hansen' }, i) ?? `(${l.k})`}`));
}
console.log([...kinds].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${(n / N).toFixed(1)}`).join(' · '));
