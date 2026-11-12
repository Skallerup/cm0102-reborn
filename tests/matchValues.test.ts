// Kampværdierne sub_6ec010 (src/game/engine/grid/matchValues.ts) mod originalen: 20 kald (kampstart og midt i kampen, keepere, publikum,
// finaler, staff uden for databasen, kontraktflag med rand(20), forholdene …) fra kampsporet ~/cm0102-engine/oracle/runs/mv2.txt
// (match_trace.c MV/MVr/MVO, oraklet frø 2) – kamp-CA'en og alle 34 floats skal være bit for bit ens.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { checkMv, parseMv, runCase } from '../scripts/mv-check';

const text = gunzipSync(readFileSync('tests/fixtures/mv-6ec010.txt.gz')).toString('utf8');

describe('sub_6ec010 kampværdierne', () => {
  it('kamp-CA og floats er bit for bit som originalen', () => {
    const log: string[] = [];
    const r = checkMv(text, 20, (s) => log.push(s));
    expect(log).toEqual([]);
    expect(r.n).toBe(20);
    expect(r.ok).toBe(20);
    expect(r.rands).toBe(1);                                      // rand(20) 0x6ee59e (kontraktflaget 0x20000)
  });
  it('en ændret input giver en afvigelse', () => {
    const c = parseMv(text)[0];
    c.kv.rec = c.kv.rec.slice(0, 2 * 0x24) + 'ff' + c.kv.rec.slice(2 * 0x25);   // Decisions (+0x24) = −1
    expect(runCase(c)).toMatch(/decisions/);
  });
});
