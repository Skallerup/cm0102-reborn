// Holdflaget +0x584 (team-flags.md), de individuelle instruktioner +0x188b og taktikbyterne +0x5b4 – standardtaktikken 0x5b27c0,
// grupperne i 0x5b50d0/0x5b5290 og taktikloaderens efterbehandling 0x5b5d10
import { describe, expect, it } from 'vitest';
import { INSTR_DEFAULT, TEAM_DEFAULT, instrBig, instrOf, setInstr, setTeamOption, teamFlagsOf } from '../src/game/engine/grid/tacticTable';
import { PRESET_TACTICS } from '../src/game/engine/grid/presetTactics';
import * as L from '../src/game/engine/grid/loop';

describe('holdflaget', () => {
  it('standardtaktikken 0x22a91 = alt "nej", normal, holdets tackling og blandede afleveringer', () => {
    expect(TEAM_DEFAULT).toBe(0x20000 | 0x2000 | 0x800 | 0x200 | 0x80 | 0x10 | 0x1);
    expect(teamFlagsOf({ mentality: 2, passing: 1, tackling: 1, closingDown: 1, offside: false, counter: false })).toBe(TEAM_DEFAULT);
  });
  it('en værdi rydder sin gruppe (0x5b50d0)', () => {
    expect(setTeamOption(TEAM_DEFAULT, 0x400)).toBe(0x22c91);
    expect(setTeamOption(TEAM_DEFAULT, 0x10000)).toBe(0x12a91);
    expect(teamFlagsOf({ mentality: 4, passing: 2, tackling: 2, closingDown: 2, offside: true, counter: true, menBehind: true }))
      .toBe(0x10000 | 0x4000 | 0x1000 | 0x400 | 0x100 | 0x40 | 0x8);
  });
});

describe('forudindstillingerne (loaderen 0x5b5d10)', () => {
  it('4-4-2 presser og spiller direkte; angriberne zonemarkerer ikke (taktikbyte 0x11)', () => {
    const p = PRESET_TACTICS.find((t) => t.name === '4-4-2')!;
    expect(p.flags).toBe(0x22b44);
    expect(p.tb).toEqual([0x11, 0x12, 0x12, 0x12, 0x12, 0x12, 0x11, 0x12, 0x11, 0x11, 0x11]);
    expect(p.lo[8]).toBe(0x95522221);
  });
  it('ældre filer: høj dword = 0xa, 0x2000 uden 0x4000 og 0x20000 under 0x98ec5d', () => {
    for (const p of PRESET_TACTICS) {
      expect(p.flags & 0x6000).not.toBe(0);
      expect(p.flags & 0x38000).not.toBe(0);
      expect(p.lo).toHaveLength(11); expect(p.hi).toHaveLength(11); expect(p.tb).toHaveLength(11);
    }
    expect(PRESET_TACTICS.find((t) => t.name === '4-4-2 Attacking')!.hi.every((h) => h === 0xa)).toBe(true);
  });
});

describe('de individuelle instruktioner', () => {
  it('grupperne i 0x5b5290: en værdi rydder sin gruppe, også de skæve 0x40030000/0x800c0000', () => {
    expect(setInstr(INSTR_DEFAULT, 0x10).lo).toBe(0x15552230);
    expect(setInstr({ lo: 0x10000, hi: 0 }, 0x40000000).lo >>> 0).toBe(0x40000000);
    expect(setInstr({ lo: 0x80000, hi: 0 }, 0x80000000).lo >>> 0).toBe(0x80000000);
    expect(setInstr(INSTR_DEFAULT, 0x4, true).hi).toBe(0x6);
  });
  it('vores instruktioner oven på pladsens værdi; mellemværdier beholder den', () => {
    const v = instrOf({ runs: 2, runWithBall: true, longShots: 1, throughBalls: true, crossing: 2, freeRole: false }, INSTR_DEFAULT);
    expect(v.lo & 0xc00000).toBe(0x800000);
    expect(v.lo & 0x3000000).toBe(0x2000000);
    expect(v.lo & 0x30000000).toBe(INSTR_DEFAULT.lo & 0x30000000);
    expect(v.hi).toBe(0x1 | 0x4);
    expect(instrBig({ lo: 0x95522221, hi: 0xa })).toBe(0xa95522221n);
  });
});

describe('kontraflaget (0x6ba100)', () => {
  it('kun et hold med 0x1000 får flaget genberegnet – ellers beholder det sin værdi', () => {
    const P = (side: 0 | 1, y: number): L.Player => ({ side, slot: 1, active: true, x: 4, y, pos: 0x4 } as L.Player);
    const m = { players: [P(1, 1), P(1, 2), P(1, 3), P(1, 4), P(1, 5), P(1, 0), P(1, 1), P(1, 2)], teamFlags: [0x1000, 0], counterFlag: [false, true] } as unknown as L.Match;
    // side 0: s = Σ(6 − y) for modstandere på side 0's halvdel = 5+4+3+2+1+6+5+4 = 30; rand(15) = 0 → 30 > 30? nej
    expect(L.counterFlag(m, 0, () => 0)).toBe(false);
    expect(L.counterFlag(m, 0, () => -1)).toBe(true);
  });
});
