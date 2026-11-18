import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Select Nationality viser alle databasens nationer (ikke kun dem med klubber/ligaer) – Northern Ireland skal kunne vælges
describe('nationalitetslisten', () => {
  const src = readFileSync('src/ui/ClassicStart.tsx', 'utf8');
  it('bygges af alle nationer i world', () => { expect(src).toMatch(/world\.nations\.map\(\(n, i\)/); expect(src).not.toMatch(/natIds/); });
  for (const f of ['world-original', 'world']) {
    it(`${f}: Northern Ireland, Wales, Scotland findes som nationer`, () => {
      const w = JSON.parse(readFileSync(`public/data/${f}.json`, 'utf8'));
      for (const n of ['Northern Ireland', 'Wales', 'Scotland']) expect(w.nations.some((x: { name: string }) => x.name === n)).toBe(true);
    });
  }
});
