// Det hurtige testværn (scripts/lib/testSelect.mjs – scripts/test.mjs fast, ship.sh): vagterne er altid med, direkte importører vælges,
// de tunge overlades til CI, og en ændret testfil køres selv.
import { describe, expect, it } from 'vitest';
import { GUARDS, selectFast, readTimes } from '../scripts/lib/testSelect.mjs';

describe('scripts/test.mjs fast', () => {
  it('vagter + direkte importører, tunge til CI', () => {
    const r = selectFast('.', ['src/game/cmShortlistGame.ts']);
    for (const g of GUARDS) expect(r.run).toContain(g);
    expect(r.run).toContain('tests/cmShortlist.test.ts');
    expect(r.why.get('tests/cmShortlist.test.ts')).toMatch(/^importerer/);
    const t = readTimes('.');
    for (const x of r.run) if (!GUARDS.includes(x)) expect(t[x] ?? 0).toBeLessThanOrEqual(60);
  });
  it('en tung testfil, der er ændret, går til CI; en let køres', () => {
    const r = selectFast('.', ['tests/cmEurope.test.ts', 'tests/changelog.test.ts', 'docs/x.md']);
    expect(r.heavy).toContain('tests/cmEurope.test.ts');
    expect(r.run).toContain('tests/changelog.test.ts');
  });
  it('budgettet: en bred ændring (world-filen) holdes under det', () => {
    const r = selectFast('.', ['public/data/world-original.json'], { budget: 300 });
    expect(r.seconds).toBeLessThanOrEqual(300);
    expect(r.heavy.length).toBeGreaterThan(10);
  });
});
