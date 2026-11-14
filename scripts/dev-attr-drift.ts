// Spillernes fejlrapporter #7/#15/#16: hvordan driver egenskaberne mod CA pr. aldersgruppe over N sæsoner?
// Kør: MODE=authentic npx tsx scripts/dev-attr-drift.ts [sæsoner] [world-fil]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { ageOn } from '../src/game/dates';
import { A } from '../src/game/attributes';

const seasons = Number(process.argv[2] ?? 1);
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[3] === eng)![0];
createGame(world, { managerName: 'R', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 11, mode: 'authentic' });
const g = gs();
const PHYS = ['acceleration', 'agility', 'balance', 'jumping', 'pace', 'stamina', 'strength'] as const;
const snap = () => new Map(Object.values(g.players).filter((p) => p.club).map((p) => [p.id, { age: ageOn(p.dob, g.date), ca: p.ca, phys: PHYS.reduce((s, k) => s + p.attrs[A[k]], 0) / PHYS.length, rest: p.attrs.slice(0, 25).reduce((s, v, i) => s + (i >= 25 ? 0 : v), 0) / 25, top: [A.tackling, A.heading, A.marking, A.dribbling, A.technique, A.passing].reduce((s, i) => s + p.attrs[i], 0) / 6 }]));
const before = snap();
const end = g.season + seasons;
let days = 0;
while (g.season < end && days++ < 400 * seasons) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
const buckets = [[16, 20], [21, 24], [25, 28], [29, 31], [32, 34], [35, 40]];
for (const [lo, hi] of buckets) {
  let n = 0, dca = 0, dphys = 0, dtop = 0;
  for (const p of Object.values(g.players)) {
    const b = before.get(p.id);
    if (!b || !p.club || b.age < lo || b.age > hi) continue;
    n++; dca += p.ca - b.ca;
    dphys += PHYS.reduce((s, k) => s + p.attrs[A[k]], 0) / PHYS.length - b.phys;
    dtop += [A.tackling, A.heading, A.marking, A.dribbling, A.technique, A.passing].reduce((s, i) => s + p.attrs[i], 0) / 6 - b.top;
  }
  console.log(`alder ${lo}-${hi} (n=${n}) over ${seasons} sæson(er): ΔCA ${(dca / n).toFixed(1)} · Δfysiske ${(dphys / n).toFixed(2)} · Δ(tackl/hoved/mark/drib/tekn/afl) ${(dtop / n).toFixed(2)}`);
}
