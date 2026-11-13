// Originalens genererede fyldspillere (virtual_staff.cpp 0x90d2f0/0x90dae0/0x90e0a0 – src/game/cmVirtual.ts; noter i
// ~/cm0102-engine/notes/filler-players.md). Ejerens billeder fra originalen (work-ui/r4/85.png, 86.png): SV Babelsberg 03 med kun to rigtige
// spillere (Civa M C, Al-Kassem S C) står med 23 – 21 genererede (grå navne): 3 GK, 3 D venstre, 5 D højre/central, 2+1 M venstre, 3 M central,
// 2 M højre, 3 F (Kluge AM/F RL er en angriber-skabelon). Planen 0x90dae0 giver netop 21 førsteholdsspillere + 4 pladser uden (reserver/fantom).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, setClub, squad } from '../src/game/state';
import { newFixture } from '../src/game/competitions';
import { FRIENDLY_COMP } from '../src/game/cmFriendly';
import { simulateFixture } from '../src/game/sim';
import { Crt, GROUP_TARGET, cmVirtualClear, cmVirtualMatch, cmVirtualSync, cmVirtualView, virtualGroup, virtualPlan } from '../src/game/cmVirtual';

describe('CRT-rand og grupperne', () => {
  it('MSVC srand/rand (0x9469fa/0x946a04)', () => {
    const c = new Crt();
    c.srand(1);
    expect([c.rand(), c.rand(), c.rand(), c.rand()]).toEqual([41, 18467, 6334, 26500]);
  });
  it('0x90e020: gruppen af positionerne (pos = GK SW D DM M AM F WB, side = L C R)', () => {
    const P = (pos: number[], side: number[]) => ({ pos, side });
    expect(virtualGroup(P([20, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1]))).toBe(0);
    expect(virtualGroup(P([1, 1, 20, 1, 1, 1, 1, 1], [20, 1, 20]))).toBe(1);   // venstre går forud for højre
    expect(virtualGroup(P([1, 1, 20, 1, 1, 1, 1, 1], [1, 15, 20]))).toBe(2);
    expect(virtualGroup(P([1, 20, 1, 1, 1, 1, 1, 1], [1, 20, 1]))).toBe(3);    // libero = forsvar
    expect(virtualGroup(P([1, 1, 1, 20, 1, 1, 1, 1], [1, 20, 1]))).toBe(5);
    expect(virtualGroup(P([1, 1, 1, 1, 1, 20, 1, 1], [1, 1, 20]))).toBe(6);
    expect(virtualGroup(P([1, 1, 1, 1, 1, 1, 20, 1], [1, 20, 1]))).toBe(7);
    expect(virtualGroup(P([1, 1, 1, 1, 1, 1, 1, 20], [1, 1, 20]))).toBe(-1);   // ren wingback tæller ikke
    expect(GROUP_TARGET.reduce((a, b) => a + b, 0)).toBe(44);
  });
});

describe('fyldspillerne i spillet (original DB, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const clubId = (short: string) => world.clubs.find((c) => c[2] === short)![0];
  createGame(world, { managerName: 'T', managerNation: eng, clubId: clubId('Man Utd'), activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();
  const germany = g.nations.findIndex((n) => n.name === 'Germany');
  // en tysk klub uden for de spilbare ligaer – tømt og med en central midtbanespiller og en angriber som Babelsberg på ejerens billede
  const bab = Object.values(g.clubs).find((c) => c.nation === germany && g.leagues[c.league]?.hidden && squad(c.id).length > 2)!;
  const fit = (p: (typeof g.players)[number]) => !p.injury && !p.banned && !p.reserves && !p.loan;
  const mc = Object.values(g.players).find((p) => p.club && p.club !== bab.id && fit(p) && virtualGroup(p) === 5)!;
  const fw = Object.values(g.players).find((p) => p.club && p.club !== bab.id && fit(p) && virtualGroup(p) === 7)!;
  for (const p of squad(bab.id)) setClub(p, 0);
  setClub(mc, bab.id); setClub(fw, bab.id);

  it('0x90dae0: to rigtige spillere → 21 genererede på førsteholdet (23 i alt), fordelt som på ejerens billede', () => {
    const plan = virtualPlan(g, bab.id, false);
    expect(plan.length).toBe(25);                                         // højst 25 nye pladser
    const first = plan.filter((s) => s.kind === 'first');
    expect(first.length).toBe(21);
    const per = new Array(8).fill(0);
    for (const s of first) per[s.grp]++;
    expect(per).toEqual([3, 3, 2, 3, 2, 3, 2, 3]);                       // GK, D v/h/c, M v/c/h, F
    expect(plan.filter((s) => s.kind === 'phantom').length).toBe(1);     // højre forsvar i 3. runde (Tyskland: ingen reserver før 20 ledige)
    const n = cmVirtualSync(g, bab.id, false);
    expect(n).toBe(21);
    expect(squad(bab.id).length).toBe(23);
  });

  it('0x90e0a0: tysk navn, 17–30 år (født i Y − 17 − rand(14), Y = 2001), CA = PA af omdømmet, skabelonen fra en rigtig spiller', () => {
    const vs = squad(bab.id).filter((p) => p.virtual);
    expect(vs.every((p) => p.virtual === 'other' && p.nation === germany && p.first && p.last)).toBe(true);
    expect(vs.every((p) => { const y = +p.dob.slice(0, 4); return y >= 2001 - 30 && y <= 2001 - 17; })).toBe(true);
    expect(vs.every((p) => p.ca === p.pa && p.rep === 0 && p.value === 0 && p.condition === 100 && p.contract?.expires.startsWith('2007'))).toBe(true);
    // gruppe 0 = målmænd; gruppe 2 (højre forsvar) søger en CENTRAL forsvarer og gruppe 3 en højre (0x90e51b/0x90e542, sic)
    const byGrp = (grp: number) => vs.filter((p) => Math.floor((p.id % 256) / 32) === grp);
    expect(byGrp(0).every((p) => p.pos[0] === 20)).toBe(true);
    expect(byGrp(2).every((p) => p.pos[2] >= 15 && p.side[1] >= 15)).toBe(true);
    expect(byGrp(3).every((p) => p.pos[2] >= 15 && p.side[2] >= 15)).toBe(true);
    expect(vs.map((p) => p.number).sort((a, b) => a! - b!)[0]).toBe(51);
  });

  it('samme klub → de samme spillere hver gang (srand pr. klub, gruppe og nummer)', () => {
    const a = squad(bab.id).filter((p) => p.virtual).map((p) => `${p.id} ${p.first} ${p.last} ${p.dob} ${p.ca} ${p.attrs.join(',')}`).sort();
    cmVirtualClear(g);
    expect(squad(bab.id).length).toBe(2);
    expect(cmVirtualView(g, bab.id)).toBe(true);
    const b = squad(bab.id).filter((p) => p.virtual).map((p) => `${p.id} ${p.first} ${p.last} ${p.dob} ${p.ca} ${p.attrs.join(',')}`).sort();
    expect(b).toEqual(a);
    expect(cmVirtualView(g, bab.id)).toBe(false);                        // findes allerede
  });

  it('spilbar liga med fuld trup: ingen fyldspillere (kampene uden de berørte klubber er urørte)', () => {
    cmVirtualClear(g);
    const ars = clubId('Arsenal'), liv = clubId('Liverpool');
    const before = Object.keys(g.players).length;
    cmVirtualMatch(g, ars, liv);
    expect(Object.keys(g.players).length).toBe(before);
  });

  it('kampen: klubben med to spillere stiller med et helt hold og en bænk, og fyldspillerne er væk ved dagens start', () => {
    cmVirtualClear(g);
    const ars = clubId('Arsenal');
    const f = newFixture(FRIENDLY_COMP, g.date, ars, bab.id, 1, { slot: 1 });
    const rep = simulateFixture(f, true, false);
    const away = rep.players.filter((l) => l.team === 1);
    expect(away.filter((l) => !l.sub).length).toBe(11);
    expect(away.some((l) => g.players[l.id]?.virtual)).toBe(true);
    cmVirtualClear(g);
    expect(Object.values(g.players).some((p) => p.virtual)).toBe(false);
  });

  it('gittermotoren (menneskets kamp) spiller også med fyldspillerne', () => {
    cmVirtualClear(g);
    const f = newFixture(FRIENDLY_COMP, g.date, bab.id, clubId('Man Utd'), 1, { slot: 1 });
    const rep = simulateFixture(f, true, false);
    const home = rep.players.filter((l) => l.team === 0);
    expect(home.filter((l) => !l.sub).length).toBe(11);
    expect(home.filter((l) => g.players[l.id]?.virtual).length).toBeGreaterThanOrEqual(9);
    cmVirtualClear(g);
  });
});
