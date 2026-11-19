// League::create_fixtures 0x6835c0 (cmFixtures.ts) mod oraklets kampprogram 14/7-2001 (frø 1): hver af oraklets runder (sættet af kampe på en
// skemadato) findes som en af portens runder – parringen (ombytningen 0x686a70 med srand(frø + år), nabostadionerne, Berger-tabellen 0x6844b0
// og hjemme/ude) er eksakt; kun rundernes rækkefølge (0x68a030's rand(4)) trækkes med spillets tal. Datoer, hvor add_fixture flyttede én kamp
// ved oprettelsen (PL 21/8, 19/9, 6/2 …), tælles ikke med.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cmBergerTable, cmLeaguePairs, MsRand } from '../src/game/cmFixtures';

const fx = JSON.parse(readFileSync(new URL('./fixtures/cm-fixtures-0714.json', import.meta.url), 'utf8')) as {
  comps: Record<string, Record<string, [number, number][]>>; stad: Record<string, [number | null, number | null]>;
};
const near = new Map<number, number>();
for (const [s, n] of Object.values(fx.stad)) if (s != null && n != null) near.set(s, n);

describe('cmFixtures (0x6835c0)', () => {
  it('MSVC rand', () => {
    const r = new MsRand(1);
    expect([r.next(), r.next(), r.next()]).toEqual([41, 18467, 6334]);
  });
  it('Berger-tabellen: hver klub møder alle andre én gang', () => {
    const c = 20, T = cmBergerTable(c);
    for (let i = 1; i <= c; i++) expect(new Set(T[i].slice(1).map(Math.abs)).size).toBe(c - 1);
  });
  for (const [comp, rows] of [[7, 38], [8, 46], [9, 46], [10, 46]] as const) {
    it(`turnering ${comp}: oraklets runder og hjemme/ude`, () => {
      const days = fx.comps[comp];
      const clubs = [...new Set(Object.values(days).flat(2))].sort((a, b) => a - b);
      const pairs = cmLeaguePairs({
        comp, clubs, year: 2001, legs: 2, rows, flags: 3, seed: 1,
        stadium: (c) => fx.stad[c]?.[0] ?? undefined, near: (s) => near.get(s), rand: () => 0,
      });
      const byRow = new Map<number, string[]>();
      for (const p of pairs) (byRow.get(p.row) ?? byRow.set(p.row, []).get(p.row)!).push(`${p.home}-${p.away}`);
      const ours = new Set([...byRow.values()].map((x) => x.sort().join(',')));
      const full = Object.values(days).filter((v) => v.length === clubs.length / 2);
      const same = full.filter((v) => ours.has(v.map(([h, a]) => `${h}-${a}`).sort().join(','))).length;
      expect(same).toBe(full.length);
      expect(full.length).toBeGreaterThanOrEqual(rows - 2);
      const all = new Set(pairs.map((p) => `${p.home}-${p.away}`));
      expect(Object.values(days).flat().every(([h, a]) => all.has(`${h}-${a}`))).toBe(true);
    });
  }
});
