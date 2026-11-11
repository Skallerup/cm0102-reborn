// Den sete kamp (engine+0x8ebb, GridMatchCtx.watched): straffeappellerne 0x2168, buh/klapsalver ved udskiftninger 0x211d/0x211e og
// BOO_OFF_PITCH/SILENT_WON_MATCH 0x2121/0x2120 ved slutfløjt – kun når mennesket ser kampen; kampen er stadig deterministisk.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import { createGridMatch, randOf } from '../src/game/engine/grid/gridMatch';
import type { Player } from '../src/game/types';

let id: (n: string) => number;
const fresh = (c: number) => squad(c).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
beforeAll(() => {
  const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  id = (n: string) => w.clubs.find((c) => c[1] === n)![0];
  createGame(w, { managerName: 'T', managerNation: eng, clubId: id('Arsenal'), activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  void gs();
}, 60000);

const play = (seed: number, watched: boolean) => {
  const [h, a] = [id('Manchester United'), id('Liverpool')];
  const rng = new Rng(seed);
  const g = createGridMatch({ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) },
    randOf(() => rng.next()), { watched });
  const ids: number[] = [];
  g.events.onCall = (ev, _p1, _s1, _p2, _s2, _x, depth) => { if (depth === 0) ids.push(ev); };
  while (g.tick()) { /* kampen */ }
  return { ids, res: g.result() };
};

describe('den sete kamp (engine+0x8ebb)', () => {
  it('er deterministisk og siger originalens ekstra kommentarer', () => {
    const a = play(7, true), b = play(7, true);
    expect(a.ids).toEqual(b.ids);
    expect(a.res).toEqual(b.res);
    const seen = new Set<number>();
    for (let s = 1; s <= 6; s++) for (const x of play(s, true).ids) seen.add(x);
    expect([0x2168, 0x211d, 0x211e, 0x2120, 0x2121].some((x) => seen.has(x))).toBe(true);
    for (const x of play(1, false).ids) expect([0x211e, 0x2120, 0x2121, 0x2168].includes(x)).toBe(false);
  }, 120000);
});
