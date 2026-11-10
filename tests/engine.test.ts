import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ageOn } from '../src/game/dates';
import { caFromValue, makePlayer, type SubPos } from '../src/game/data/generate';
import { MatchSim, quickMatch, type EngineTeam } from '../src/game/engine/match';
import { A } from '../src/game/attributes';
import { Rng } from '../src/game/rng';
import { autoSelect, newTactic } from '../src/game/tactics';
import type { Foot, Player } from '../src/game/types';

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
    // testens genererede spillere scorer lidt mindre end de rigtige databaser (se scripts/benchmark.ts: ~2,7)
    expect(goals / N).toBeGreaterThan(1.9);
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
  it('tæt markering svækker den markerede spiller, og hårde tacklinger giver flere frispark', () => {
    const [h, a] = [clubs[0], clubs[1]];
    const away = team(a);
    const stars = [...away.tactic.lineup].map((id) => away.players.get(id)!).sort((x, y) => (y.attrs[2] + y.attrs[6]) - (x.attrs[2] + x.attrs[6])).slice(0, 2);
    const withOi = (home: ReturnType<typeof team>) => ({ ...home, tactic: { ...home.tactic, opp: { fixture: 1, targets: [{ pid: stars[0].id, kind: 'tight' as const }, { pid: stars[1].id, kind: 'hard' as const }] } } });
    // samme frø → samme dagsform; kun instruktionen er forskellig
    const effOf = (oi: boolean) => {
      const sim = new MatchSim(oi ? withOi(team(h)) : team(h), team(a), { commentary: false, fixtureId: 1 }, new Rng(5));
      const sp = (sim.teams[1] as unknown as { on: { p: { id: number }; eff: Float32Array }[] }).on.find((x) => x.p.id === stars[0].id)!;
      return sp.eff[A.finishing];
    };
    expect(effOf(true) / effOf(false)).toBeCloseTo(0.92, 2);
    const fouls = (oi: boolean) => {
      const r = new Rng(3);
      let n = 0;
      for (let i = 0; i < 300; i++) n += quickMatch(oi ? withOi(team(h)) : team(h), team(a), { fixtureId: 1 }, r).stats[0].fouls;
      return n;
    };
    expect(fouls(true)).toBeGreaterThan(fouls(false));
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

describe('fart', () => {
  it('en hurtig angriber skaber mere mod langsomme forsvarere end en langsom angriber', () => {
    const [h, a] = [clubs[4], clubs[5]];
    const run = (fast: boolean) => {
      const r = new Rng(21);
      let xg = 0;
      for (let i = 0; i < 300; i++) {
        const home = team(h), away = team(a);
        // modstanderens forsvarere er langsomme; vores angribere enten hurtige eller langsomme
        for (const id of away.tactic.lineup) { const p = away.players.get(id)!; if (p.pos[2] >= 15) { p.attrs[A.pace] = 7; p.attrs[A.acceleration] = 7; } }
        for (const id of home.tactic.lineup) { const p = home.players.get(id)!; if (p.pos[6] >= 15 || p.pos[5] >= 15) { p.attrs[A.pace] = fast ? 18 : 8; p.attrs[A.acceleration] = fast ? 18 : 8; } }
        xg += quickMatch(home, away, {}, r).stats[0].xg;
      }
      return xg;
    };
    expect(run(true)).toBeGreaterThan(run(false) * 1.05);
  });
});

describe('taktik', () => {
  const clone = (t: EngineTeam): EngineTeam => {
    const players = new Map([...t.players].map(([id, p]) => [id, { ...p, attrs: p.attrs.slice() }]));
    return { ...t, players, tactic: { ...t.tactic, team: { ...t.tactic.team } } };
  };
  const [h, a] = [clubs[6], clubs[7]];
  const base = [team(h), team(a)] as const;

  it('små midtstoppere giver flere hovedstødsmål imod', () => {
    const run = (short: boolean) => {
      const r = new Rng(31);
      let goals = 0;
      for (let i = 0; i < 400; i++) {
        const home = clone(base[0]), away = clone(base[1]);
        if (short) for (const id of away.tactic.lineup) { const p = away.players.get(id)!; if (p.pos[2] >= 15 && p.side[1] >= 15) { p.attrs[A.heading] = 5; p.attrs[A.jumping] = 5; p.attrs[A.strength] = 6; } }
        goals += quickMatch(home, away, {}, r).shots.filter((s) => s.t === 0 && s.kind === 'header' && s.outcome === 'goal').length;
      }
      return goals;
    };
    expect(run(true)).toBeGreaterThan(run(false) * 1.25);
  });

  it('kontra virker mod et offensivt hold, ikke mod en lav blok', () => {
    const run = (oppMentality: number) => {
      const r = new Rng(41);
      let counters = 0;
      for (let i = 0; i < 300; i++) {
        const home = clone(base[0]), away = clone(base[1]);
        home.tactic.team.counter = true;
        away.tactic.team.mentality = oppMentality;
        counters += quickMatch(home, away, {}, r).shots.filter((s) => s.t === 0 && s.origin === 'counter').length;
      }
      return counters;
    };
    expect(run(4)).toBeGreaterThan(run(0) * 2);
  });

  it('en libero-plads kan udfyldes af en midtstopper', () => {
    const ps = squads.get(h)!;
    const t = autoSelect(newTactic('5-3-2'), ps);
    const sw = ps.find((p) => p.id === t.lineup[t.slots.findIndex((s) => s.pos === 'SW')])!;
    expect(Math.max(sw.pos[1], sw.pos[2])).toBeGreaterThanOrEqual(15);
  });
});

describe('nye kampsituationer (som i CM 01/02)', () => {
  const [h, a] = [clubs[8], clubs[9]];
  const N = 250;
  const play = (opts: Parameters<typeof quickMatch>[2] = {}, seed = 51) => {
    const r = new Rng(seed);
    return Array.from({ length: N }, () => new MatchSim(team(h), team(a), { commentary: true, aiSubs: [true, true], ...opts }, r).runToEnd());
  };
  const reps = play();
  const has = (k: string) => reps.reduce((s, x) => s + x.commentary.filter((l) => l.k === k).length, 0);

  it('har selvmål, tillægstid, dommere, målmandsreturer og dødboldsvarianter', () => {
    expect(reps.some((x) => x.events.some((e) => e.k === 'goal' && e.og))).toBe(true);
    expect(has('added-time')).toBe(N);
    expect(has('gk-parry')).toBeGreaterThan(0);
    expect(has('short-corner') + has('corner-edge')).toBeGreaterThan(0);
    expect(has('long-throw') + has('fk-wall')).toBeGreaterThan(0);
  });

  it('et selvmål tælles for det rigtige hold og ikke som spillerens mål', () => {
    for (const x of reps) for (const e of x.events.filter((ev) => ev.og)) {
      const line = x.players.find((p) => p.id === e.p)!;
      expect(line.team).not.toBe(e.t);
    }
  });

  it('i en dobbeltkamp går holdet, der er bagud samlet, frem – også når kampen står lige', () => {
    const pushes = (prior: [number, number]) => play({ aggregate: { prior, awayGoals: true } }, 61)
      .reduce((s, x) => s + x.changes.filter((c) => c.t === 0 && c.kind === 'mentality' && Number(c.to) > Number(c.from)).length, 0);
    expect(pushes([0, 2])).toBeGreaterThan(pushes([2, 0]) * 2);
  });

  it('en streng dommer giver flere kort end en mild', () => {
    const cards = (refStrict: number) => play({ refStrict }, 71).reduce((s, x) => s + x.stats[0].yellows + x.stats[1].yellows, 0);
    expect(cards(1.3)).toBeGreaterThan(cards(0.75) * 1.3);
  });
});
