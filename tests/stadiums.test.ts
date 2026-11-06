// Regression: en forkert byte-position i stadium.dat gav alle klubber loftet 120.000 pladser.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Club = [number, string, string, number, string, string, number, string];

describe.each(['world-original.json', 'world.json'])('stadionkapacitet i %s', (file) => {
  const w = JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as { clubs: Club[] };
  it('ingen klubber står på loftet, og tallene er realistiske', () => {
    const seats = w.clubs.map((c) => c[6]);
    // højst et par kæmpestadioner (Azadi i Teheran står reelt over loftet) – fejlen gav ALLE klubber loftet
    expect(seats.filter((s) => s >= 120_000).length).toBeLessThanOrEqual(2);
    const sorted = [...seats].sort((a, b) => a - b);
    expect(sorted[Math.floor(sorted.length / 2)]).toBeLessThan(60_000);
    expect(sorted[0]).toBeGreaterThan(0);
  });
  it('Manchester United har et rigtigt stadion (60.000–80.000)', () => {
    const mu = w.clubs.find((c) => c[1] === 'Manchester United');
    expect(mu?.[6]).toBeGreaterThan(60_000);
    expect(mu?.[6]).toBeLessThan(80_000);
  });
});
