import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ageOn } from '../src/game/dates';
import { caFromValue, makePlayer, type SubPos } from '../src/game/data/generate';
import { MatchSim, quickMatch, type EngineTeam } from '../src/game/engine/match';
import { Rng } from '../src/game/rng';
import { autoSelect, newTactic } from '../src/game/tactics';
import type { Foot, Player } from '../src/game/types';

// Indskiftede spillere fik negative minutter (−1 … −7), når de kom ind i 2. halvlegs tillægstid
// (minuttet er 91+, og slutfløjtet regnede 90 − indskiftningsminuttet).
const world = JSON.parse(readFileSync('public/data/world-modern.json', 'utf8'));
const date = '2025-08-01';
const squads = new Map<number, Player[]>();
const clubs: number[] = world.clubs.filter((c: unknown[]) => c[4] === 'GB1').map((c: unknown[]) => c[0] as number);
for (const r of world.players) {
  if (!clubs.includes(r[5])) continue;
  const p = makePlayer({
    id: r[0], first: r[1], last: r[2], dob: r[3], nation: r[4], club: r[5], sub: r[6] as SubPos, foot: r[7] as Foot, height: r[8],
    ca: caFromValue(r[9], ageOn(r[3], date)), value: r[9], date, seed: 1,
  });
  if (!squads.has(p.club)) squads.set(p.club, []);
  squads.get(p.club)!.push(p);
}
const team = (club: number): EngineTeam => {
  const ps = squads.get(club)!;
  return { club, tactic: autoSelect(newTactic('4-4-2'), ps), players: new Map(ps.map((p) => [p.id, p])) };
};

describe('spillede minutter', () => {
  it('en indskiftning i tillægstiden giver mindst 1 minut, ikke negative', () => {
    let tested = 0;
    for (let seed = 1; seed <= 20 && tested < 5; seed++) {
      const sim = new MatchSim(team(clubs[0]), team(clubs[1]), { aiSubs: [false, false] }, new Rng(seed));
      while (sim.minute <= 90 && sim.step()) { /* frem til tillægstiden */ }
      if (sim.minute <= 90 || sim.finished) continue;
      const t = sim.teams[0];
      const out = t.on.find((s) => !s.off && t.tactic.slots[s.slot]?.pos !== 'GK')!;
      expect(sim.substitute(0, out.p.id, t.benchIds[0])).toBe(true);
      const rep = sim.runToEnd();
      for (const l of rep.players) {
        expect(l.minutes).toBeGreaterThanOrEqual(1);
        expect(l.minutes).toBeLessThanOrEqual(90);
      }
      tested++;
    }
    expect(tested).toBeGreaterThan(0);
  });

  it('ingen negative minutter i mange kampe (også med forlænget spilletid og 2001-regler)', () => {
    const r = new Rng(11);
    for (let i = 0; i < 150; i++) {
      const h = r.pick(clubs);
      const a = r.pick(clubs.filter((c) => c !== h));
      const rep = quickMatch(team(h), team(a), { needsWinner: i % 3 === 0 ? (x, y) => x === y : undefined, rules: i % 2 ? 'original' : undefined }, r);
      const cap = rep.et ? 120 : 90;
      for (const l of rep.players) {
        expect(l.minutes).toBeGreaterThanOrEqual(1);
        expect(l.minutes).toBeLessThanOrEqual(cap);
      }
    }
  });
});
