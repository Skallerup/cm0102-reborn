import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ageOn } from '../src/game/dates';
import { caFromValue, makePlayer, type SubPos } from '../src/game/data/generate';
import { quickMatch, type EngineTeam } from '../src/game/engine/match';
import { Rng } from '../src/game/rng';
import { autoSelect, newTactic } from '../src/game/tactics';
import type { Foot, Player } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8'));
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
const team = (club: number, f = '4-4-2'): EngineTeam => {
  const ps = squads.get(club)!;
  return { club, tactic: autoSelect(newTactic(f), ps), players: new Map(ps.map((p) => [p.id, p])) };
};

describe('matchmotor', () => {
  it('afgør pokalkampe med en gyldig straffesparkskonkurrence', () => {
    const r = new Rng(7);
    let shootouts = 0, homeWins = 0;
    for (let i = 0; i < 400; i++) {
      const h = r.pick(clubs);
      const a = r.pick(clubs.filter((c) => c !== h));
      const rep = quickMatch(team(h), team(a), { needsWinner: (x, y) => x === y }, r);
      if (rep.stats[0].goals !== rep.stats[1].goals) { expect(rep.pens).toBeUndefined(); continue; }
      shootouts++;
      expect(rep.et).toBe(true);
      const so = rep.shootout!;
      const score = [0, 1].map((t) => so.filter((k) => k.t === t && k.outcome === 'goal').length);
      expect(score).toEqual(rep.pens);
      expect(score[0]).not.toBe(score[1]);
      if (score[0] > score[1]) homeWins++;
      // skiftevis hjemme/ude
      so.forEach((k, j) => expect(k.t).toBe(j % 2));
      // stoppet præcis ved det spark, der afgjorde den (fem hver, derefter sudden death)
      const decided = (ks: typeof so) => {
        const sc = [0, 1].map((t) => ks.filter((k) => k.t === t && k.outcome === 'goal').length);
        const n = [0, 1].map((t) => ks.filter((k) => k.t === t).length);
        if (n[0] < 5 || n[1] < 5) return sc[0] + 5 - n[0] < sc[1] || sc[1] + 5 - n[1] < sc[0];
        return n[0] === n[1] && sc[0] !== sc[1];
      };
      expect(decided(so)).toBe(true);
      for (let j = 1; j < so.length; j++) expect(decided(so.slice(0, j))).toBe(false);
    }
    expect(shootouts).toBeGreaterThan(15);
    expect(homeWins).toBeGreaterThan(shootouts * 0.25);
    expect(homeWins).toBeLessThan(shootouts * 0.75);
  });

  it('giver realistiske gennemsnit (mål, hjemmesejre, skud)', () => {
    const r = new Rng(99);
    let goals = 0, home = 0, shots = 0;
    const N = 600;
    for (let i = 0; i < N; i++) {
      const h = r.pick(clubs);
      const a = r.pick(clubs.filter((c) => c !== h));
      const rep = quickMatch(team(h), team(a), {}, r);
      goals += rep.stats[0].goals + rep.stats[1].goals;
      if (rep.stats[0].goals > rep.stats[1].goals) home++;
      shots += rep.stats[0].shots + rep.stats[1].shots;
    }
    expect(goals / N).toBeGreaterThan(2.1);
    expect(goals / N).toBeLessThan(3.3);
    expect(home / N).toBeGreaterThan(0.36);
    expect(home / N).toBeLessThan(0.56);
    expect(shots / N / 2).toBeGreaterThan(8);
  });

  it('har ingen formation-exploits (samme trup, 4-2-4 mod 4-4-2)', () => {
    const r = new Rng(7);
    const c = clubs[0];
    let pts = 0;
    const N = 500;
    for (let i = 0; i < N; i++) {
      const A = team(c, '4-2-4');
      const B = { ...team(c, '4-4-2'), club: -1 };
      const rep = i % 2 ? quickMatch(A, B, {}, r) : quickMatch(B, A, {}, r);
      const my = i % 2 ? rep.stats[0].goals : rep.stats[1].goals;
      const op = i % 2 ? rep.stats[1].goals : rep.stats[0].goals;
      pts += my > op ? 3 : my === op ? 1 : 0;
    }
    expect(pts / N).toBeLessThan(1.75);
  });

  it('stærkere hold vinder oftere', () => {
    const r = new Rng(3);
    const strength = (c: number) => squads.get(c)!.map((p) => p.ca).sort((a, b) => b - a).slice(0, 14).reduce((s, v) => s + v, 0);
    const sorted = clubs.slice().sort((a, b) => strength(b) - strength(a));
    const top = sorted[0], bottom = sorted[sorted.length - 1];
    let w = 0, l = 0;
    for (let i = 0; i < 200; i++) {
      const rep = quickMatch(team(top), team(bottom), {}, r);
      if (rep.stats[0].goals > rep.stats[1].goals) w++;
      else if (rep.stats[0].goals < rep.stats[1].goals) l++;
    }
    expect(w).toBeGreaterThan(l * 2.5);
  });
});

describe('instruktioner mod modstanderen', () => {
  it('tæt markering og pres af deres stjerner koster dem chancer', () => {
    const [h, a] = [clubs[0], clubs[1]];
    const away = team(a);
    // deres to mest offensive spillere
    const stars = [...away.tactic.lineup].map((id) => away.players.get(id)!).sort((x, y) => (y.attrs[2] + y.attrs[6]) - (x.attrs[2] + x.attrs[6])).slice(0, 2);
    const run = (withOi: boolean) => {
      const r = new Rng(3);
      let theirGoals = 0, ourFouls = 0;
      for (let i = 0; i < 400; i++) {
        const home = team(h);
        if (withOi) home.tactic = { ...home.tactic, opp: { fixture: 1, targets: [{ pid: stars[0].id, kind: 'tight' }, { pid: stars[1].id, kind: 'hard' }] } };
        const rep = quickMatch(home, team(a), { fixtureId: 1 }, r);
        theirGoals += rep.stats[1].goals;
        ourFouls += rep.stats[0].fouls;
      }
      return { theirGoals, ourFouls };
    };
    const base = run(false), oi = run(true);
    expect(oi.theirGoals).toBeLessThan(base.theirGoals);
    expect(oi.ourFouls).toBeGreaterThan(base.ourFouls);
  });
});

describe('vejr', () => {
  it('skybrud giver flere fejlafleveringer end klart vejr', () => {
    const pct = (weather: 'clear' | 'heavyRain') => {
      const r = new Rng(11);
      let ok = 0, all = 0;
      for (let i = 0; i < 150; i++) {
        const rep = quickMatch(team(clubs[2]), team(clubs[3]), { weather }, r);
        for (const s of rep.stats) { ok += s.passesCompleted; all += s.passes; }
      }
      return ok / all;
    };
    expect(pct('heavyRain')).toBeLessThan(pct('clear') - 0.01);
  });
});
