import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Select Nationality: nationer med mindst én klub, liga eller spiller – Northern Ireland skal kunne vælges, døde lande uden spillere ikke
describe('nationalitetslisten', () => {
  it('bygges af klubber, ligaer og spillere', () => {
    const src = readFileSync('src/ui/ClassicStart.tsx', 'utf8');
    expect(src).toMatch(/world\.players\.map\(\(p\) => p\[nk\]/);
  });
  for (const f of ['world-original', 'world']) {
    it(`${f}: Northern Ireland, Wales, Scotland med; Soviet Union og Zaire uden`, () => {
      const w = JSON.parse(readFileSync(`public/data/${f}.json`, 'utf8'));
      const nk = w.playerFields.indexOf('nation');
      const ids = new Set<number>([...w.clubs.map((c: number[]) => c[3]), ...w.leagues.map((l: { nation: number }) => l.nation), ...w.players.map((p: number[]) => p[nk])]);
      const has = (n: string) => ids.has(w.nations.findIndex((x: { name: string }) => x.name === n));
      for (const n of ['Northern Ireland', 'Wales', 'Scotland']) expect(has(n)).toBe(true);
      for (const n of ['Soviet Union', 'Zaire']) expect(has(n)).toBe(false);
    });
  }
});
