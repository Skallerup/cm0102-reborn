// 0x6e2f20 (roleScore.ts), pick_team 0x6dbc50 (pickTeam.ts) og 0x6e0230 med de præcise værdier – byggesten og mod den instrumenterede
// originals pick-spor (~/cm0102-engine/oracle/runs/pick4-pick.txt: RECOMP_PICK_TRACE, frø 1, 3.9.60, 400 Premier League-udtagelser).
// Uden sporet springes sammenligningerne over.
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { instructionTerm, judgeAbility, recentForm } from '../src/game/engine/grid/roleScore';
import { perceivedAbility } from '../src/game/engine/grid/aiMode';
import { assignSquad, benchSlots, pickFlags } from '../src/game/engine/grid/pickTeam';
import { assignPlayers } from '../src/game/engine/grid/subs';
import { readPicks, inputOf } from '../scripts/pick-trace-eval';
import { checkChoice, checkPicks } from '../scripts/pick-trace-check';
import { roleScore } from '../src/game/engine/grid/roleScore';

const TRACE = `${homedir()}/cm0102-engine/oracle/runs/pick4-pick.txt`;

describe('byggesten', () => {
  it('0x6e86d0 kind 2 = aiMode.perceivedAbility', () => {
    for (const [id, seed, ca, rep, ja] of [[100, 1, 150, 9000, 12], [7, 3, 90, 2000, 5], [4321, 1, 120, 6000, 18]]) {
      const a = judgeAbility({ playerId: id, ca, pa: ca, age: 25, gk: 1, gameSeed: seed, judge: { id: 50, ja, jp: ja }, kind: 2, hint: -1, repSeen: rep });
      expect(a).toBe(perceivedAbility({ seed: id + seed + 50, ca, rep, jpa: ja }));
    }
  });
  it('0x7c1950: Σ (4·r eller 27) / 4', () => {
    expect(recentForm([])).toBe(33);                                      // 5 × 27 / 4
    expect(recentForm([7, 7, 7, 7, 7])).toBe(35);
  });
  it('flag 0x8000: holdflagene styrer første gruppe (0x6e4344)', () => {
    const rec = new Array(0x46).fill(10); rec[0x37] = 14; rec[0x40] = 16;
    expect(instructionTerm(rec, 1, 0, 2)).toBe(2 - Math.trunc(6 * -2 / 3));   // passing/7 − ftol((teknik − 10)·(−2/3))
    expect(instructionTerm(rec, 1, 2, 0)).toBe(1);                      // kun taktikbytens positioning/7
  });
  it('flagene og bænkpladsernes rand', () => {
    const seq = [2999, 0]; let k = 0;
    expect(pickFlags(() => seq[k++], { national: false, compType: 0, ownRep: 9000, oppRep: 1000, leagueMember: true })).toBe(0xca0ca | 0x100 | 0x10000);
    const r = [0, 7, 8, 2, 4]; let i = 0;
    expect(benchSlots(() => r[i++], 5)).toEqual([4, 1, 0x40, 4, 0x10]);   // plads 12 = målmand ved 16 pladser
  });
  it('0x6e2000 uden bænk = subs.assignPlayers', () => {
    const v = (j: number, i: number) => ((i * 37 + j * 11) % 23) * 10 - j;
    expect(assignSquad(9, 6, 0, v, v, () => 1, () => false)).toEqual(assignPlayers(9, 6, v));
  });
});

describe.skipIf(!existsSync(TRACE))('mod pick-sporet', () => {
  it('0x6e2f20: alle kald ens af originalens input (40 udtagelser)', () => {
    let n = 0, ok = 0;
    for (const pk of readPicks(TRACE, 40)) for (const c of pk.calls) { n++; if (roleScore(inputOf(pk, c)) === c.score) ok++; }
    expect(ok).toBe(n);
  }, 300000);
  it('pick_team: samme 11 og bænk af originalens værdier', () => {
    const r = checkPicks(TRACE, 400);
    expect(r.same11).toBe(r.n);
    expect(r.sameAll / r.n).toBeGreaterThan(0.99);
  }, 300000);
  it('0x6e0230: samme taktik med originalens værdier, tilstand, manager og statistik', () => {
    const r = checkChoice(TRACE, 400);
    expect(r.hit).toBe(r.n);
  }, 300000);
});
