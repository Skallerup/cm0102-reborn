import { describe, expect, it } from 'vitest';
import { dueTicks, runCatchUp } from '../src/ui/matchCatchUp';

// en lille seedet "kamp": hvert tick trækker 12 skridt fra en LCG og logger hændelser; pause ved halvleg (skridt 540) og slutfløjt (1080)
function makeMatch() {
  let seed = 12345, step = 0, paused = false, finished = false;
  const log: string[] = [];
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  return {
    log, get step() { return step; }, get paused() { return paused; }, get finished() { return finished; },
    resume() { paused = false; },
    tick() { for (let i = 0; i < 12 && !paused && !finished; i++) { step++; const r = rnd(); if (r < 0.05) log.push(`${step}:${r.toFixed(4)}`); if (step === 540) paused = true; if (step >= 1080) finished = true; } },
  };
}

describe('kampen i en baggrundsfane (vægur-indhentning)', () => {
  it('dueTicks tæller hele ticks og beholder resten', () => {
    expect(dueTicks(1000, 0, 300)).toEqual({ n: 3, last: 900 });
    expect(dueTicks(100, 0, 300)).toEqual({ n: 0, last: 0 });
  });

  it('skjult fane med droslede ticks giver samme hændelsesrække og slutresultat som normalt tempo', () => {
    const ms = 100;
    // normalt tempo: ét tick pr. 100 ms; ved pausen genoptager "brugeren"
    const a = makeMatch();
    for (let t = 0; !a.finished && t < 100000; t++) { if (a.paused) a.resume(); a.tick(); }
    // skjult fane: intervallet fyrer kun hvert 1000 ms, men hvert kald indhenter de forfaldne ticks
    const b = makeMatch();
    let last = 0, now = 0, guard = 0;
    while (!b.finished && guard++ < 10000) {
      now += 1000;
      if (b.paused) { b.resume(); last = now; continue; } // pausepunktet stopper indhentningen; tiden under pausen tæller ikke
      last = runCatchUp(now, last, ms, () => b.tick(), () => b.paused || b.finished);
    }
    expect(b.step).toBe(a.step);
    expect(b.log).toEqual(a.log);
    expect(b.finished).toBe(true);
  });

  it('indhentningen stopper præcis ved pausepunktet', () => {
    const m = makeMatch();
    runCatchUp(1_000_000, 0, 100, () => m.tick(), () => m.paused || m.finished);
    expect(m.step).toBe(540);
    expect(m.paused).toBe(true);
  });
});
