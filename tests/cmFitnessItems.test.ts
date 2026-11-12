// Konditionsmodulets enkeltdele (cmFitness.ts / cmFitnessGame.ts): træningsbelastningen 0x8b4f60 af originalens faste skemaer, landsholdsopholdet i
// 0x62c680 og club +0x1db (europæisk turnering).
import { describe, expect, it } from 'vitest';
import { ATTRS } from '../src/game/attributes';
import { scheduleLoad, trainingLoad, updateFitness, type FitCtx } from '../src/game/cmFitness';
import { cmClubEuro } from '../src/game/cmFitnessGame';
import type { GameState, Player } from '../src/game/types';

const player = (o: Partial<Player> = {}): Player => {
  const attrs = new Array(ATTRS.length).fill(10);
  return { id: 1, dob: '1975-01-01', attrs, pos: [1, 1, 1, 1, 1, 1, 1, 1], side: [1, 1, 1], club: 5, regen: false, ...o } as unknown as Player;
};

describe('træningsbelastningen 0x8b4f60', () => {
  it('originalens standardskemaer: generelt 68, målmænd 48', () => {
    expect(scheduleLoad([25, 25, 25, 25, 0])).toBe(68);
    expect(scheduleLoad([10, 10, 0, 10, 50])).toBe(48);
    expect(scheduleLoad([50, 10, 10, 10, 0])).toBe(80);
    expect(scheduleLoad([0, 0, 0, 0, 0])).toBe(0);
    expect(scheduleLoad([100, 100, 100, 100, 100])).toBe(100);
  });
  it('vores skemaer → originalens; computerens spillere 50', () => {
    expect(trainingLoad(player({ training: 'general' } as Partial<Player>), true)).toBe(68);
    expect(trainingLoad(player({ training: 'fitness' } as Partial<Player>), true)).toBe(80);
    expect(trainingLoad(player({ training: 'shooting' } as Partial<Player>), true)).toBe(48);
    expect(trainingLoad(player({ training: 'rest' } as Partial<Player>), true)).toBe(0);
    expect(trainingLoad(player({ training: 'general' } as Partial<Player>), false)).toBe(50);
    expect(trainingLoad(player({ training: undefined, pos: [20, 1, 1, 1, 1, 1, 1, 1] } as unknown as Partial<Player>), true)).toBe(48);
  });
});

describe('landsholdsopholdet i 0x62c680', () => {
  it('med opholdet springes sommerpausen over (fuld træning)', () => {
    // England (nation 60 i sæsontabellen) 1/7: sommerpause
    const today = Math.round(Date.UTC(2001, 6, 1) / 86400000);
    const g = { clubs: { 5: { id: 5, nation: 60 } }, staff: {}, players: {}, cmFitStart: '2001-06-01', date: '2001-07-01' } as unknown as GameState;
    const mk = () => { const p = player(); p.cmFit = { d: today - 10, f: 8000, mc: 9000, fat: 0, inj: null, rt: -1, rl: 0, b1c: 0, lt: -1, load: 50 }; return p; };
    const ctx = (duty: boolean): FitCtx => ({ g, today, rand: () => 0, squadOf: () => [], human: () => false, onDuty: () => duty });
    const a = mk(), b = mk();
    updateFitness(ctx(false), a);
    updateFitness(ctx(true), b);
    expect(b.cmFit!.mc).toBe(10000);                                         // b = N: kampkonditionen op med 500 pr. dag
    expect(a.cmFit!.f).not.toBe(b.cmFit!.f);
  });
});

describe('club +0x1db', () => {
  it('ufærdig turnering, ikke slået ud', () => {
    const g = { comps: {
      CL: { id: 'CL', type: 'continental', finished: false, clubs: [1, 2, 3], ties: [{ a: 1, b: 2, winner: 1, stage: 'R16' }], table: [] },
      UEFA: { id: 'UEFA', type: 'continental', finished: false, clubs: [4], ties: [], table: [] },
    } } as unknown as GameState;
    expect(cmClubEuro(g, 1)).toBe(326);
    expect(cmClubEuro(g, 2)).toBe(-1);
    expect(cmClubEuro(g, 3)).toBe(-1);
    expect(cmClubEuro(g, 4)).toBe(328);
    expect(cmClubEuro(g, 9)).toBe(-1);
  });
});
