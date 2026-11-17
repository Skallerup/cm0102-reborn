// Originalens vejr (cmWeather.ts – weather.cpp: 0x922810, 0x922ee0, 0x923010, 0x9232c0, 0x923970, 0x9233a0, 0x923b60).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cmMatchWeather, cmPitchCondition, cmPitchText, cmTemperature, cmWeatherText, cmWxInit, cmWxUpdate, type CmWeatherRec } from '../src/game/cmWeather';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import type { Fixture, GameState } from '../src/game/types';

const EN: Record<string, string> = { 'cmwx.w1': 'Breezy', 'cmwx.w2': 'Gusty', 'cmwx.w3': 'Strong Wind', 'cmwx.w4': 'Gale', 'cmwx.p0': 'Dry', 'cmwx.p1': 'Wet', 'cmwx.p2': 'Drizzle',
  'cmwx.p3': 'Shower', 'cmwx.p5': 'Downpour', 'cmwx.p6': 'Sleet', 'cmwx.p7': 'Hail', 'cmwx.p8': 'Light Snow', 'cmwx.p9': 'Heavy Snow',
  'pitch.normal': 'Normal', 'pitch.damp': 'Damp', 'pitch.muddy': 'Muddy', 'pitch.dry': 'Dry', 'pitch.waterlogged': 'Water-logged', 'pitch.frozen': 'Frozen', 'pitch.snowy': 'Snowy', 'pitch.hard': 'Hard' };
const t = (k: string, p?: Record<string, string | number>) => (k === 'cmwx.temp' ? `${p!.n}°C` : EN[k] ?? k);
const pack = (b: number[]) => b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24);
// 3.9.60: Arsenal (676) spiller i London (by 1010, "English Inland" = område 1, Highbury 38.420 pladser, undersoil heating), Liverpool 5339
const fake = (bytes: number[]) => ({ dbVersion: '3.9.60', seed: 1, clubs: { 676: {}, 5339: {} }, cmWx: { d: 0, c: { 1010: pack(bytes) } } }) as unknown as GameState;
const fx = (date: string, slot?: number): Fixture => ({ id: 1, comp: 'CM7', date, home: 676, away: 5339, round: 1, ...(slot !== undefined ? { slot } : {}) });

describe('originalens vejr (weather.cpp)', () => {
  it('0x9232c0: temperaturen af båndet og dagen, aftenkampe koldere', () => {
    expect(cmTemperature(2, 100, false)).toBe(11);          // (200 % 7) + 7
    expect(cmTemperature(2, 100, true)).toBe(8);            // ftol(11 · 0,8)
    expect(cmTemperature(1, 10, false)).toBe(-1);           // (10 % 6) − 5
    expect(cmTemperature(1, 10, true)).toBe(-3);            // under 10: − 2
    expect(cmTemperature(0, 200, false)).toBe(1);           // båndet 0: dagen · 0
    expect(cmTemperature(6, 50, false)).toBe(35);
  });

  it('0x923010: vind, nedbør og temperatur af byens bytes mod områdets vinterperiode', () => {
    // 15/12 (dag 348 ≥ vinterens 334): W 60/75/85/95/100, P 42/50/75/90/100, H 6/61/94/100
    const rec = cmMatchWeather(fake([0, 45, 70, 1]), fx('2001-12-15'));
    expect(rec).toEqual([1, 1, 10, 1]);                     // Breezy (70 < 75), Wet (45 < 50), bånd 2 → (696 % 7) + 7
    expect(cmWeatherText(rec, t)).toBe('Breezy, Wet, 10°C');
    // frost: b2 = 3 → vindstille, bånd 1 → −5 °C; Drizzle med byens vind 1 → Hail
    const frost = cmMatchWeather(fake([0, 60, 3, 1]), fx('2001-12-15'));
    expect(frost).toEqual([0, 7, -5, 1]);
    expect(cmWeatherText(frost, t)).toBe('Hail, -5°C');
  });

  it('0x9233a0: teksten – vindstille og tørt hedder "Dry", blæst uden nedbør kun vind og temperatur', () => {
    expect(cmWeatherText([0, 0, 15, 0], t)).toBe('Dry, 15°C');
    expect(cmWeatherText([3, 0, 15, 0], t)).toBe('Strong Wind, 15°C');
    expect(cmWeatherText([4, 9, -2, 2] as CmWeatherRec, t)).toBe('Gale, Heavy Snow, -2°C');
  });

  it('0x923970: banen af nedbør, temperatur, kapacitet og undersoil heating', () => {
    const g = fake([0, 0, 0, 0]), f = fx('2001-12-15');
    expect(cmPitchCondition(g, f, [0, 5, 10, 0])).toBe(2);   // skybrud, undersoil heating, > 27.500 pladser → Damp
    expect(cmPitchCondition(g, f, [0, 1, 10, 0])).toBe(0);   // vådt: hash (348 + 5339 + 676 + 7) % 20 = 10 ≥ 4 → Normal
    expect(cmPitchCondition(g, f, [0, 1, -2, 0])).toBe(2);   // frost og vådt med varme → Damp
    expect(cmPitchCondition(g, f, [0, 0, 30, 0])).toBe(4);    // tørt og ≥ 29 °C: Highbury har 38.420 > 35.000 pladser → Dry (ellers Hard)
    expect(cmPitchText(4, t)).toBe('Dry');
    expect(cmPitchText(0x20, t)).toBe('Snowy');
  });

  it('0x922810/0x922ee0: byernes bytes 0..99, deterministisk, én opdatering pr. dag', () => {
    const g = { dbVersion: '3.9.60', seed: 7, clubs: { 676: {}, 5339: {} } } as unknown as GameState;
    cmWxInit(g, 100);
    expect(Object.keys(g.cmWx!.c).map(Number).sort((a, b) => a - b)).toEqual([1010, 1031]);
    const a = { ...g.cmWx!.c };
    cmWxUpdate(g, 101);
    const b = { ...g.cmWx!.c };
    cmWxUpdate(g, 101);
    expect(g.cmWx!.c).toEqual(b);
    expect(b).not.toEqual(a);
    for (const v of Object.values(b)) { const x = [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, v >>> 24]; expect(Math.max(x[0], x[1], x[2])).toBeLessThanOrEqual(99); expect(x[3]).toBeLessThanOrEqual(2); }
  });

  it('nyt spil: vejret kører med i forkørslen til dagen før start, og kampen gemmer vejret ved kampstarten', () => {
    const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = world.nations.findIndex((x) => x.name === 'England');
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[2] === 'Man Utd')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    expect(g.date).toBe('2001-07-14');
    expect(g.cmWx?.d).toBe(Math.round(Date.parse('2001-07-13T00:00:00Z') / 86400000));
    expect(g.cmWx!.c[1045]).toBeDefined();                 // Manchester
  }, 60_000);
});
