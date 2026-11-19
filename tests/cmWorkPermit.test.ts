// 0x8c7950 TRANSFER_MANAGER::is_work_permit_granted (cmPermit.ts cmWorkPermit), landskampshistorikken +0x86e +3/+5 (0x8ce920 via NationalTeams
// 0x76b600 – cmWpIntlMatch) og FIFA_RANKINGS::count_results_in_period 0x58d710 (cmFifaCount) på en lille hånd-bygget spiltilstand.
import { describe, expect, it } from 'vitest';
import { cmFifaCount, cmWorkPermit, cmWpFifaRecord, cmWpIntlMatch } from '../src/game/cmPermit';
import type { GameState, Player } from '../src/game/types';

const NAT = 5;
function setup(date: string, over: Partial<Player> = {}) {
  const p = { id: 1, nation: NAT, caps: 10, dob: '1975-01-01', pa: 150, rep: 40, first: 'Joe', last: 'Bloggs', club: 7,
    contract: { wage: 1000, expires: '2003-06-30' }, ...over } as unknown as Player;
  const g = { date, players: { 1: p }, clubs: { 7: { id: 7, name: 'Leeds', nation: 0 }, 8: { id: 8, name: 'Falkirk', nation: 1 } },
    cmNationRep: { [NAT]: 2000 }, cmNationCont: { [NAT]: 1, 9: 1 }, cmWp: { b: {}, nt: {} } } as unknown as GameState;
  return { g, p };
}

describe('0x8c7950 arbejdstilladelsen', () => {
  it('historikken: spilstartens 0x3fff (14 af 16) giver tilladelsen før 2003; landskampe uden ham rykker den ud', () => {
    const { g, p } = setup('2001-10-01');
    g.cmWp!.b[1] = [0x3fff, 0];
    expect(cmWorkPermit(g, p, null, null)).toBe(true);                    // 14 > 11
    for (let i = 0; i < 5; i++) cmWpIntlMatch(g, NAT, 9, true, []);
    expect(g.cmWp!.nt[NAT]).toBe(5);
    expect(cmWorkPermit(g, p, null, null)).toBe(false);                   // 0xffe0: 11 af 16 – hverken > 11 eller > 70 %
    expect(g.cmWp!.b[1]).toEqual([0xffe0, 5]);
    // han spiller den næste (bit 0 sættes, +5 = kamptallet): 0xffc1
    cmWpIntlMatch(g, 9, NAT, true, [{ id: 1, side: 1 }]);
    expect(g.cmWp!.b[1]).toEqual([0xffc1, 6]);
    // 12 kampe i træk fra en tom historik → 12 af 16
    g.cmWp!.b[1] = [0, 6];
    for (let i = 0; i < 12; i++) cmWpIntlMatch(g, NAT, 9, true, [{ id: 1, side: 0 }, { id: 2, side: 1 }]);
    expect(g.cmWp!.b[1]).toEqual([0x0fff, 18]);
    expect(cmWorkPermit(g, p, null, null)).toBe(true);
    // U21 ('B'/U21: kun kamptallet) rykker også historikken
    cmWpIntlMatch(g, NAT, 9, false, [{ id: 1, side: 0 }]);
    expect(g.cmWp!.nt[NAT]).toBe(19);
    expect(g.cmWp!.b[1][1]).toBe(18);
  });

  it('fra 2003 tæller FIFA-listens resultater de seneste to år (højst 16)', () => {
    const { g, p } = setup('2003-03-10');
    for (let i = 0; i < 4; i++) cmWpFifaRecord(g, NAT, 9, '2002-11-20');
    expect(cmFifaCount(g, NAT, 2, 2001, 2, 2003)).toBe(4);
    g.cmWp!.b[1] = [0b1110, 0];
    expect(cmWorkPermit(g, p, null, null)).toBe(true);                    // 3 af 4 = 75 % > 70
    g.cmWp!.b[1] = [0b0110, 0];
    expect(cmWorkPermit(g, p, null, null)).toBe(false);                   // 50 %
  });

  it('de faste veje: omdømme, potentiale, løn, få landskampe, Falkirk 2001, posten', () => {
    { const { g, p } = setup('2001-10-01', { cmRep: [180, 180, 171], caps: 0 } as Partial<Player>); expect(cmWorkPermit(g, p, null, null)).toBe(true); } // 8550 > 8500
    { const { g, p } = setup('2001-10-01', { dob: '1980-01-01', pa: 191, caps: 0 }); expect(cmWorkPermit(g, p, null, null)).toBe(true); }
    { const { g, p } = setup('2001-10-01', { caps: 4 }); expect(cmWorkPermit(g, p, null, null)).toBe(false); expect(cmWorkPermit(g, p, { club: 7, wageGbp: 35000 }, null)).toBe(true); }
    { const { g, p } = setup('2001-10-01', { caps: 0, first: 'Collin' }); expect(cmWorkPermit(g, p, { club: 8, wageGbp: 500 }, null)).toBe(true); expect(cmWorkPermit(g, p, null, null)).toBe(false); }
    { const { g, p } = setup('2001-10-01', { caps: 21 }); g.cmNationRep![NAT] = 3001; expect(cmWorkPermit(g, p, null, null)).toBe(true); }
    { const { g, p } = setup('2001-10-01', { caps: 0 }); g.cmPermit = { 1: [10, 2, 2000, 0] }; expect(cmWorkPermit(g, p, null, null)).toBe(true);
      g.cmPermit = { 1: [10, 5, 2000, 0] }; expect(cmWorkPermit(g, p, null, null)).toBe(false);
      // med tilbud: et udløb, der ikke er senere end den nuværende kontrakts → ja
      expect(cmWorkPermit(g, p, { club: 7, wageGbp: 500, expires: '2003-06-30' }, null)).toBe(true); }
  });

  it('flaget a5 (spejderne): rand(1000) for omdømmet, så 11 − rand(3) + rand(3) og 70 − rand(10) + rand(10) i den rækkefølge', () => {
    const seq = (vals: number[], calls: number[]) => (n: number) => { calls.push(n); return vals[calls.length - 1] ?? 0; };
    { const { g, p } = setup('2001-10-01'); g.cmWp!.b[1] = [0x0fff, 0];     // 12 af 16
      const calls: number[] = [];
      expect(cmWorkPermit(g, p, null, seq([0, 2, 0], calls))).toBe(true);    // 12 > 11 − 2 + 0
      expect(calls).toEqual([1000, 3, 3]); }
    { const { g, p } = setup('2001-10-01'); g.cmWp!.b[1] = [0x07ff, 0];     // 11 af 16 = 68 %
      const calls: number[] = [];
      expect(cmWorkPermit(g, p, null, seq([0, 0, 2, 0, 0], calls))).toBe(false);
      expect(calls).toEqual([1000, 3, 3, 10, 10]);
      g.cmWp!.b[1] = [0x07ff, 0];
      expect(cmWorkPermit(g, p, null, seq([0, 0, 2, 5, 0], []))).toBe(true); }  // 68 > 70 − 5
  });
});
