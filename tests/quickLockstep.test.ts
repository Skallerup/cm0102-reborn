// Hurtigkampen quick_simulate_match 0x6beeb0 (quickSim.ts) i låsetrin med originalen: fire Intertoto-kampe 21/7-2001 kørt i unicorn på oraklets
// dagsbillede (0x90d2f0 → init_match(fixture, 1, 0, 0) → run_match_steps). Givne inddata og originalens tilfældige tal → samme n ved hvert kald,
// samme stilling, holdblokke og spillerfelter (karakter, viste karakter, mål, kort, kondition). scripts/quick-lockstep.ts.
import { describe, expect, it } from 'vitest';
import { readQ, runQuick } from '../scripts/quick-lockstep';

describe('quick_simulate_match 0x6beeb0 – låsetrin', () => {
  const recs = readQ('tests/fixtures/quick-lockstep-0721.jsonl.gz');
  it('fire kampe (to fyldhold–fyldhold) helt som originalen', () => {
    expect(recs.length).toBe(4);
    for (const r of recs) {
      const x = runQuick(r);
      expect(x.at, `${r.h} - ${r.a}`).toBeUndefined();
      expect(x.diff, `${r.h} - ${r.a}`).toEqual([]);
      expect(x.goals).toEqual(x.origGoals);
      expect(x.rands).toBeGreaterThan(19000);
    }
  });
});
