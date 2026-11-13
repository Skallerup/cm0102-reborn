// CM 01/02's With Ball / Without Ball (tacticPositions.ts): taktikkens egne positioner pr. boldzone → gittermotorens positionstabel (0x5b3560 →
// 0x5b7160). Uændrede positioner skal give præcis samme motor-input og kamp som før; en flyttet position et andet.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import { changeFormation, formationSlots, newTactic, snapSlot } from '../src/game/tactics';
import { createGridMatch, randOf } from '../src/game/engine/grid/gridMatch';
import { mapTactic, slotMask, tableCell } from '../src/game/engine/grid/tacticTable';
import { defaultPositions, maskName, movePost, postIdx, setPost, slotMoved, tacticPositions, unpackXY } from '../src/game/engine/grid/tacticPositions';
import type { Player, Tactic } from '../src/game/types';

const same = (a: ReturnType<typeof mapTactic>, b: ReturnType<typeof mapTactic>) => {
  expect(Array.from(a.table)).toEqual(Array.from(b.table));
  expect(a.slotOf).toEqual(b.slotOf); expect(a.masks).toEqual(b.masks); expect(a.masks2).toEqual(b.masks2);
  expect(a.flags).toBe(b.flags); expect(a.lo).toEqual(b.lo); expect(a.hi).toEqual(b.hi); expect(a.tb).toEqual(b.tb); expect(a.preset?.name).toBe(b.preset?.name);
};

describe('positionerne med/uden bold → motorens tabel', () => {
  it('uændrede positioner giver præcis samme motor-input (forudindstilling og kanonisk gitter)', () => {
    for (const f of ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1']) {
      const slots = formationSlots(f);
      same(mapTactic(slots, f, defaultPositions(slots, f)), mapTactic(slots, f));
    }
    // en egen formation (ingen forudindstilling): det kanoniske gitter
    const slots = formationSlots('4-4-2'); slots[9] = snapSlot(66, 50);
    same(mapTactic(slots, '4-4-1-1*', defaultPositions(slots, '4-4-1-1*')), mapTactic(slots, '4-4-1-1*'));
  });

  it('4-4-2: forudindstillingens gitter, positionsnavnene som originalens liste', () => {
    const p = defaultPositions(formationSlots('4-4-2'), '4-4-2');
    expect(p.preset).toBe(0);
    expect(p.masks.map(maskName)).toEqual(['GK', 'DL', 'DC', 'DC', 'DR', 'ML', 'MC', 'MC', 'MR', 'FC', 'FC']);
    expect(unpackXY(p.posts[0][postIdx(0, 1, 0)])).toEqual([13, 0]);                         // målmanden ved eget mål
  });

  it('en flyttet position ændrer kun den zone i motorens tabel', () => {
    const t0 = newTactic('4-4-2');
    const t1 = movePost(t0, 9, 1, 0, 0, 6, 18);                                              // FC med bold, bold i venstre zone ved eget mål (ejerens billede)
    expect(t1.positions).toBeDefined();
    expect(t1.formation.endsWith('*')).toBe(true);
    const a = mapTactic(t0.slots, t0.formation), b = mapTactic(t1.slots, t1.formation, t1.positions);
    expect(Array.from(a.table)).not.toEqual(Array.from(b.table));
    const ps = b.slotOf[9];
    for (let bx = 0; bx < 3; bx++) for (let by = 0; by < 3; by++) expect(tableCell(b.table, 0, ps, 1, bx, by)).toEqual([2, 6]);   // 6·9/27, 18·12/36
    expect(tableCell(b.table, 0, ps, 1, 4, 5)).toEqual(tableCell(a.table, 0, a.slotOf[9], 1, 4, 5));                            // andre zoner uændrede
    expect(tableCell(b.table, 0, ps, 0, 0, 0)).toEqual(tableCell(a.table, 0, a.slotOf[9], 0, 0, 0));                            // uden bold uændret
    // de øvrige pladser er urørte
    for (let s = 0; s < 11; s++) if (s !== 9) expect(Array.from(b.table.slice(216 * b.slotOf[s], 216 * b.slotOf[s] + 216))).toEqual(Array.from(a.table.slice(216 * a.slotOf[s], 216 * a.slotOf[s] + 216)));
  });

  it('0x5b3560: flyttes alle punkter langt tilbage, bliver angriberen en midtbanespiller (Overview følger masken)', () => {
    let t: Tactic = newTactic('4-4-2');
    for (const att of [0, 1] as const) for (let zx = 0; zx < 3; zx++) for (let zy = 0; zy < 4; zy++) {
      const [x] = unpackXY(tacticPositions(t).posts[9][postIdx(att, zx, zy)]);
      t = movePost(t, 9, att, zx, zy, x, [6, 11, 16, 22][zy] + (att ? 3 : 0));
    }
    expect(maskName(t.positions!.masks[9])).toMatch(/^M/);
    expect(slotMask(t.slots[9])).toBe(t.positions!.masks[9]);
    expect(t.slots[9].pos).toBe('M');
    expect(mapTactic(t.slots, t.formation, t.positions).masks[mapTactic(t.slots, t.formation, t.positions).slotOf[9]]).toBe(t.positions!.masks[9]);
  });

  it('et punkt holdes inden for banen, og målmanden beholder sin maske', () => {
    const p = defaultPositions(formationSlots('4-4-2'), '4-4-2');
    const q = setPost(p, 9, 1, 2, 3, 99, -5);
    expect(unpackXY(q.posts[9][postIdx(1, 2, 3)])).toEqual([26, 0]);
    expect(setPost(p, 0, 1, 1, 1, 20, 30).masks[0]).toBe(0x1);
  });

  it('ugyldige positioner (formationen ændret andetsteds) → formationens forudindstilling som før', () => {
    const t1 = movePost(newTactic('4-4-2'), 9, 1, 0, 0, 6, 18);
    const slots = t1.slots.slice(); slots[5] = snapSlot(66, 12);                              // moderne skærm flytter en anden plads
    same(mapTactic(slots, t1.formation, t1.positions), mapTactic(slots, t1.formation));
    // Overview (0x5b2ba0): den flyttede plads får det kanoniske gitter, de andre beholder deres egne
    const t2 = slotMoved({ ...t1, slots }, 5);
    expect(t2.positions!.posts[9]).toEqual(t1.positions!.posts[9]);
    expect(t2.positions!.masks[5]).toBe(slotMask(slots[5]));
    expect(changeFormation(t1, '4-3-3').positions).toBeUndefined();
  });
});

describe('gittermotoren med taktikkens positioner', () => {
  let id: (n: string) => number;
  const fresh = (c: number) => squad(c).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
  beforeAll(() => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((x) => x.name === 'England');
    id = (n: string) => w.clubs.find((c) => c[1] === n)![0];
    createGame(w, { managerName: 'T', managerNation: eng, clubId: id('Arsenal'), activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    void gs();
  }, 120_000);

  it('samme kamp med uændrede positioner, en anden med en flyttet – også når taktikken skiftes under kampen', () => {
    const [h, a] = [id('Arsenal'), id('Chelsea')];
    const tac = aiTactic(h, a, true);
    const run = (t: Tactic, mid?: Tactic) => {
      const rng = new Rng(7);
      const g = createGridMatch({ players: fresh(h), tactic: t }, { players: fresh(a), tactic: aiTactic(a, h, false) }, randOf(() => rng.next()), { ai: [false, true] });
      let n = 0;
      while (g.tick()) if (mid && ++n === 600) g.setTactic(0, mid);
      return JSON.stringify(g.result());
    };
    const base = run(tac);
    expect(run({ ...tac, positions: defaultPositions(tac.slots, tac.formation) })).toBe(base);
    const moved = movePost(tac, 9, 1, 1, 2, 13, 33);
    expect(moved.positions).toBeDefined();
    expect(run(moved)).not.toBe(base);
    expect(run(tac, moved)).not.toBe(base);                                                  // kamptaktikken under kampen
    expect(run(tac, { ...tac, positions: defaultPositions(tac.slots, tac.formation) })).toBe(run(tac, tac));
  }, 120_000);
});
