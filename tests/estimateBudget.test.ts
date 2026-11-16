// K5 (docs/ORIGINAL_PARITY.md): antallet af "estimeret"-markeringer i src/game må ikke stige. Sænk tallet i
// tests/estimateBudget.baseline.json, når et gæt erstattes af en port (se CLAUDE.md).
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out); else if (/\.(ts|tsx)$/.test(f)) out.push(p);
  }
  return out;
}

describe('estimeret-budget (K5)', () => {
  it('antallet af "estimeret" i src/game stiger ikke', () => {
    const base = JSON.parse(readFileSync(join(__dirname, 'estimateBudget.baseline.json'), 'utf8')) as { count: number };
    let n = 0;
    for (const f of walk(join(__dirname, '..', 'src', 'game'))) n += (readFileSync(f, 'utf8').match(/estimeret/gi) || []).length;
    expect(n, `Nu ${n} mod baseline ${base.count}. Port i stedet for at gætte – eller sænk baseline, når tallet falder.`).toBeLessThanOrEqual(base.count);
  });
});
