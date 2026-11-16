// K3 (docs/ORIGINAL_PARITY.md): antallet af tekster i ægte tilstand, der ikke findes i exe'ens strenge, må ikke stige.
// Sænk baseline med `npx tsx scripts/text-parity.ts --update`, når tallet er faldet.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { analyze } from '../scripts/text-parity';

describe('teksttjek mod originalens exe (K3)', () => {
  it('strengfilen er kun tekst (ingen binære data)', () => {
    const raw = gunzipSync(readFileSync(join(__dirname, '..', 'scripts', 'data', 'cm0102-strings.txt.gz'))).toString('latin1');
    expect(raw.length).toBeGreaterThan(100000);
    // strings -n 4: ingen NUL, ingen binære blokke (kun enkelte linjer med kontroltegn fra kodebytes)
    expect(raw.includes("\0")).toBe(false);
    expect(raw.startsWith("MZ")).toBe(false);
    const lines = raw.split("\n");
    expect(lines.filter((l) => /[^\x20-\x7e\t\r]/.test(l)).length / lines.length).toBeLessThan(0.1);
    expect(raw.length).toBeLessThan(3_000_000);
  });

  it('ikke-originale tekster stiger ikke (samlet og pr. område)', () => {
    const base = JSON.parse(readFileSync(join(__dirname, '..', 'scripts', 'data', 'text-parity-baseline.json'), 'utf8')) as { total: number; areas: Record<string, number> };
    const r = analyze();
    const total = Object.keys(r.non).length;
    const worse = Object.entries(r.areas).filter(([a, n]) => n > (base.areas[a] ?? 0)).map(([a, n]) => `${a}: ${n} > ${base.areas[a] ?? 0}`);
    expect(worse, 'Nye tekster uden modstykke i originalen (ret teksten, eller sæt området på allow-listen med begrundelse)').toEqual([]);
    expect(total).toBeLessThanOrEqual(base.total);
  }, 60000);
});
