// Originalens nøgle-id'er og faste .data-tabeller (src/game/cmKeyIds.ts, scripts/build-cm-keyids.ts) – uden dem læste de oversatte funktioner 0
// (værdiformlen 0x4d0c60 gav værdien 0 og udbudsprisen 0x4d1600 £90.500 for Beckham).
import { describe, expect, it } from 'vitest';
import { AGE_PCT_9A7F30, FEE_STEPS_9A7F48, KEY_CLUB_GLOBALS, KEY_COMP_GLOBALS, KEY_NATION_GLOBALS, NATION_7F } from '../src/game/cmKeyIds';

describe('cmKeyIds', () => {
  it('aldersprocenterne 0x9a7f30 og beløbsgrænserne 0x9a7f48 fra exe’en', () => {
    expect(AGE_PCT_9A7F30).toEqual([10, 15, 20, 35, 50, 70, 80, 90, 95, 100, 100, 98, 96, 92, 88, 84, 79, 75, 70, 65]);
    expect(FEE_STEPS_9A7F48.slice(0, 4)).toEqual([50000, 100000, 200000, 300000]);
    expect(FEE_STEPS_9A7F48[20]).toBe(25000000);
  });
  it('id-globalerne: lande efter navn, turneringer som tal, klubber efter navn', () => {
    const nat = new Map(KEY_NATION_GLOBALS);
    expect(nat.get(0x9cf2e4)).toBe('England');
    expect(nat.get(0x9cf4dc)).toBe('Turkey');
    expect(nat.get(0x9cf458)).toBe('Saudi Arabia');
    expect(new Map(KEY_COMP_GLOBALS).get(0x9cf6e8)).toBe(326);   // European Champions Cup
    const clubs = new Map(KEY_CLUB_GLOBALS);
    expect(clubs.get(0x9d0118)).toBe('Glasgow Celtic');
    expect(clubs.get(0x9d011c)).toBe('Glasgow Rangers');
  });
  it('nation.dat +0x7f: 2 = EU/EØS, 1 = uden for', () => {
    const f = new Map(NATION_7F);
    expect(f.get('England')).toBe(2);
    expect(f.get('Norway')).toBe(2);
    expect(f.get('Switzerland')).toBe(1);
    expect(f.get('Brazil')).toBe(1);
  });
});
