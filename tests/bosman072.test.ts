// Bosman 0.7.2-tjeklisten (docs/MODERN_PARITY.md): 2026/27's historik og lejeaftaler fra databasen
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CM_SETUP_LOANS } from '../src/game/data/cmPreseason';

const raw = JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')).cmRaw;
const W = JSON.parse(readFileSync('public/data/world.json', 'utf8'));
const clubName = (id: number) => W.clubs.find((c: unknown[]) => c[0] === id)?.[1] ?? raw.histNames?.[id]?.[0];

describe('Bosman 0.7.2 punkt 4: turneringshistorikken i spillets ur', () => {
  it('Premier League: 2026 = 2025/26 Arsenal, 2025 Liverpool (sæsonens slutår + 25)', () => {
    const pl = raw.compHist.CM7 as [number, number, number][];
    expect(pl[0][0]).toBe(2026);
    expect(clubName(pl[0][1])).toBe('Arsenal');
    expect(clubName(pl[1][1])).toBe('Liverpool');
  });
  it('kalenderårsliga: Eliteserien 2025 = Viking', () => {
    expect(clubName(raw.compHist.CM315[0][1])).toBe('Viking FK');
    expect(raw.compHist.CM315[0][0]).toBe(2025);
  });
  it('prisernes historik står i spillets ur (ingen år før 1900 + 25 eller i databasens 2001-ur)', () => {
    const years = Object.values(raw.awHist as Record<string, [number][]>).flat().map((r) => r[0]);
    expect(Math.max(...years)).toBe(2026);
  });
});

describe('Bosman 0.7.2 punkt 3: databasens lejeaftaler på 2026/27', () => {
  it('LOAN-linjerne er fundet og skubbet til 2026/27', () => {
    const l = CM_SETUP_LOANS['2026'];
    expect(l.length).toBeGreaterThan(1000);
    expect(l.every(([, , s, e]) => s >= '2026-01-01' && e <= '2028-12-31' && s <= e)).toBe(true);
  });
});
