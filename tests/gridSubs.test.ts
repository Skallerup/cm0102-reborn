// Gittermotorens udskiftninger (matchSubs.ts), forlænget spilletid og straffesparkskonkurrence (sub_6bd930, shootout.ts) og menneskets
// taktik/udskiftninger midt i kampen gennem adapteren (GridSim).
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import { newTactic } from '../src/game/tactics';
import { createGridMatch, randOf, runGridMatch } from '../src/game/engine/grid/gridMatch';
import { GridSim } from '../src/game/engine/grid/adapter';
import { shootoutOrder } from '../src/game/engine/grid/shootout';
import type { Player } from '../src/game/types';

let id: (n: string) => number;
const fresh = (c: number) => squad(c).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
beforeAll(() => {
  const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  id = (n: string) => w.clubs.find((c) => c[1] === n)![0];
  createGame(w, { managerName: 'T', managerNation: eng, clubId: id('Arsenal'), activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  void gs();
}, 120_000);   // createGame med originalens spillerdata/kondition/trupplan tager flere sekunder under fuld belastning
const teams = (hn: string, an: string) => {
  const [h, a] = [id(hn), id(an)];
  return [{ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) }] as const;
};

describe('udskiftningerne i gittermotoren', () => {
  it('computeren skifter højst 3 gange, aldrig over 11 på banen, og kampen er deterministisk', () => {
    let total = 0, n = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const [h, a] = teams('Manchester United', 'Liverpool');
      const rng = new Rng(seed);
      const ons: number[] = [0, 0];
      const g = createGridMatch(h, a, randOf(() => rng.next()), { on: { sub: (on, off) => { ons[on.side]++; expect(on.side).toBe(off.side); expect(on.active).toBe(true); expect(off.active).toBe(false); } } });
      expect(g.m.gp.filter((q) => q.slot === -1).length).toBeGreaterThan(0);                 // bænken er med som GP'er (plads −1)
      while (g.tick()) for (const s of [0, 1]) expect(g.m.gp.filter((q) => q.side === s && q.active).length).toBeLessThanOrEqual(11);
      for (const s of [0, 1] as const) { expect(ons[s]).toBeLessThanOrEqual(3); expect(ons[s] + g.subsLeft(s)).toBe(3); }
      total += ons[0] + ons[1]; n += 2;
    }
    expect(total / n).toBeGreaterThan(1);                                                    // originalen: 2,3 pr. hold (estimeret kvalitet: ~1,9)
    const [h1, a1] = teams('Arsenal', 'Chelsea'), [h2, a2] = teams('Arsenal', 'Chelsea');
    const r = (h: typeof h1, a: typeof a1) => { const rng = new Rng(5); return runGridMatch(h, a, randOf(() => rng.next())); };
    expect(r(h1, a1)).toEqual(r(h2, a2));
  }, 120_000);

  it('menneskets hold skifter aldrig selv; substitute() sker ved næste dødbold og respekterer grænserne', () => {
    const [h, a] = teams('Arsenal', 'Leeds United');
    const home = { club: id('Arsenal'), ...h, players: new Map(h.players.map((p) => [p.id, p])) };
    const away = { club: id('Leeds United'), ...a, players: new Map(a.players.map((p) => [p.id, p])) };
    const sim = new GridSim(home, away, { commentary: true, aiSubs: [false, true], subs: 3 }, new Rng(11));
    while (sim.minute < 30) sim.step();
    const v = sim.live(0);
    expect(v.subsLeft).toBe(3);
    const bench = v.bench, onIds = v.on.filter((x) => !x.off).map((x) => x.id);
    expect(sim.substitute(0, onIds[5], 999999)).toBe(false);                                 // ikke på bænken
    expect(sim.substitute(0, onIds[5], bench[0])).toBe(true);
    expect(sim.substitute(0, onIds[5], bench[1])).toBe(false);                               // allerede skiftet ud
    expect(sim.live(0).subsLeft).toBe(2);
    expect(sim.substitute(0, onIds[6], bench[1])).toBe(true);
    expect(sim.substitute(0, onIds[7], bench[2])).toBe(true);
    expect(sim.substitute(0, onIds[8], bench[3])).toBe(false);                               // 3 brugt
    sim.runToEnd();
    const rep = sim.report();
    const subs = rep.events.filter((e) => e.k === 'sub' && e.t === 0);
    expect(subs.length).toBe(3);
    for (const e of subs) {
      const inn = rep.players.find((p) => p.id === e.p)!, out = rep.players.find((p) => p.id === e.p2)!;
      expect(inn.sub).toBe(true);
      // båret ud skadet/udvist efter indskiftningen (sub_6d0b60/sub_6cda20 – alle udskiftninger brugt): minutterne slutter dér
      if (inn.injured || inn.red) { expect(inn.minutes + out.minutes).toBeLessThan(90); continue; }
      expect(inn.minutes + out.minutes).toBeGreaterThanOrEqual(88);
      expect(inn.minutes + out.minutes).toBeLessThanOrEqual(92);
    }
  }, 60_000);

  it('en spiller båret ud skadet står i listen (ikke "off") og kan skiftes ud af mennesket', () => {
    let done = 0;
    for (let seed = 1; seed <= 60 && done < 1; seed++) {
      const [h, a] = teams('Arsenal', 'Leeds United');
      const home = { club: id('Arsenal'), ...h, players: new Map(h.players.map((p) => [p.id, p])) };
      const away = { club: id('Leeds United'), ...a, players: new Map(a.players.map((p) => [p.id, p])) };
      const sim = new GridSim(home, away, { commentary: false, aiSubs: [false, true], subs: 3 }, new Rng(seed));
      while (!sim.finished) {
        sim.step();
        const v = sim.live(0);
        expect(v.on.some((x) => x.injured && x.off)).toBe(false);
        const inj = v.on.find((x) => x.injured);
        if (inj && v.bench.length && v.subsLeft > 0) {
          expect(sim.substitute(0, inj.id, v.bench[0])).toBe(true);
          for (let n = 0; n < 400 && !sim.finished; n++) sim.step();
          expect(sim.live(0).on.some((x) => x.id === v.bench[0] && !x.off)).toBe(true);
          done++; break;
        }
      }
    }
    expect(done).toBe(1);
  }, 300_000);

  it('computerens egen opstilling (aiTeamSetup) står i rapporten: hver målscorer har en spillerlinje, ingen dobbelte, 11 starter', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const [h, a] = teams('Leeds United', 'Blackburn Rovers');
      const home = { club: id('Leeds United'), ...h, players: new Map(h.players.map((p) => [p.id, p])) };
      const away = { club: id('Blackburn Rovers'), ...a, players: new Map(a.players.map((p) => [p.id, p])) };
      const rep = new GridSim(home, away, { commentary: false, subs: 3 }, new Rng(seed)).runToEnd();
      const ids = rep.players.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const t of [0, 1]) expect(rep.players.filter((p) => p.team === t && !p.sub).length).toBe(11);
      for (const e of rep.events.filter((x) => x.k === 'goal')) expect(ids).toContain(e.p);
    }
  }, 300_000);

  it('forlænget spilletid og straffesparkskonkurrence, når kampen skal have en vinder', () => {
    let et = 0, so = 0;
    for (let seed = 1; seed <= 30 && so < 2; seed++) {
      const [h, a] = teams('Ipswich Town', 'Southampton');
      const home = { club: id('Ipswich Town'), ...h, players: new Map(h.players.map((p) => [p.id, p])) };
      const away = { club: id('Southampton'), ...a, players: new Map(a.players.map((p) => [p.id, p])) };
      const sim = new GridSim(home, away, { commentary: true, needsWinner: (x, y) => x === y, subs: 3 }, new Rng(seed));
      const rep = sim.runToEnd();
      const [hg, ag] = [rep.stats[0].goals, rep.stats[1].goals];
      if (rep.et) et++;
      if (rep.pens) {
        so++;
        expect(rep.et).toBe(true);
        expect(hg).toBe(ag);
        expect(rep.pens[0]).not.toBe(rep.pens[1]);
        const k = rep.shootout!;
        expect(k.length).toBeGreaterThanOrEqual(6);
        for (let i = 1; i < k.length; i++) expect(k[i].t).not.toBe(k[i - 1].t);              // skiftevis
        expect(k.filter((x) => x.outcome === 'goal' && x.t === 0).length).toBe(rep.pens[0]);
      } else expect(hg).not.toBe(ag);
    }
    expect(et).toBeGreaterThan(0);
    expect(so).toBeGreaterThan(0);
  }, 300_000);

  it('skytternes rækkefølge (sub_6be520): ingen to ens før alle har sparket, menneskets liste først', () => {
    const [h, a] = teams('Arsenal', 'Chelsea');
    h.tactic.penOrder = [h.tactic.lineup[9], h.tactic.lineup[10]];
    const rng = new Rng(2);
    const g = createGridMatch(h, a, randOf(() => rng.next()), { ai: [false, true] });
    const rand = randOf(() => rng.next());
    const order = shootoutOrder({ m: g.m, rand, players: (s) => g.m.gp.filter((q) => q.side === s), ai: (s) => s === 1, humanOrder: (s) => g.m.tactics[s].penOrder ?? [],
      pickTaker: (s, ex) => { const c = g.m.gp.filter((q) => q.side === s && q.active && !ex.has(q) && !q.isKeeper); return c[0] ?? null; },
      keeper: () => null, takeBall: () => {} });
    expect(order[0][0]!.src.id).toBe(h.tactic.lineup[9]);
    expect(order[0][1]!.src.id).toBe(h.tactic.lineup[10]);
    for (const s of [0, 1]) expect(new Set(order[s].slice(0, 10).map((p) => p!.src.id)).size).toBe(10);
    expect(order[1][10]).toBe(order[1][0]);                                                   // 11. spark: listen ryddes, den første igen
  });

  it('menneskets taktik midt i kampen: positionstabellen, maskerne og holdflagene skiftes ved næste dødbold', () => {
    const [h, a] = teams('Arsenal', 'Everton');
    const home = { club: id('Arsenal'), ...h, players: new Map(h.players.map((p) => [p.id, p])) };
    const away = { club: id('Everton'), ...a, players: new Map(a.players.map((p) => [p.id, p])) };
    const sim = new GridSim(home, away, { commentary: false, aiSubs: [false, true] }, new Rng(4));
    while (sim.minute < 20) sim.step();
    const m = (sim as unknown as { g: { m: { teamFlags: number[]; tactics: { formation: string }[]; gp: { side: number; active: boolean; pos: number }[] } } }).g.m;
    const masks = () => m.gp.filter((q) => q.side === 0 && q.active).map((q) => q.pos).sort().join();
    const before = m.teamFlags[0], mk = masks();
    const t = sim.teams[0].tactic;
    const f = t.formation === '3-5-2' ? '4-4-2' : '3-5-2';
    const changed = { ...t, formation: f, slots: newTactic(f).slots, team: { ...t.team, mentality: t.team.mentality >= 4 ? 1 : 5, offside: !t.team.offside } };
    sim.setTactic(0, changed);
    for (let i = 0; i < 400 && m.teamFlags[0] === before; i++) sim.step();
    expect(m.teamFlags[0]).not.toBe(before);
    expect(m.tactics[0].formation).toBe(f);
    expect(masks()).not.toBe(mk);                                                             // pladsernes masker fra den nye tabel (mapTactic)
  }, 60_000);
});
