// Udseendet (klassisk/moderne) er et frit valg i Game Options og uafhængigt af spillets tilstand og af modernOn-flaget:
// moderne udseende slår aldrig udvidet tilstand, Reborn-features eller den moderne motor til (docs/ALWAYS_ORIGINAL.md).
import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, setGame } from '../src/game/state';
import { getTheme, setTheme, setStartSkin, isRetro, chromeRetro } from '../src/ui/theme';
import { modernOn } from '../src/ui/modernFlag';
import { authentic, origLogic, legacyExtended } from '../src/game/rules';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  const ls = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
  Object.assign(globalThis, { localStorage: ls, location: { search: '' }, document: { documentElement: { dataset: {}, style: { setProperty() {}, removeProperty() {} } } } });
});

describe('udseendet er uafhængigt af tilstanden', () => {
  it('standard er klassisk, og valget huskes og kan skiftes tilbage', () => {
    setGame(null);
    expect(getTheme()).toBe('retro');
    setTheme('dark'); expect(getTheme()).toBe('dark');
    setTheme('clubDark'); expect(getTheme()).toBe('clubDark');
    setTheme('retro'); expect(getTheme()).toBe('retro');
    expect(modernOn()).toBe(false); // valget slår ikke det skjulte moderne flag til
  });
  it('startskærmene er klassiske uden at røre det gemte valg', () => {
    setGame(null);
    setTheme('light');
    setStartSkin(true); expect(getTheme()).toBe('retro');
    setStartSkin(false); expect(getTheme()).toBe('light');
  });
  it('et gammelt gemt tema uden valg giver stadig klassisk (modern-flaget er slukket)', () => {
    setGame(null);
    store.set('cm-theme', 'club');
    expect(getTheme()).toBe('retro');
  });
  it('et originalt spil forbliver original i moderne udseende (kun tegningen skifter)', () => {
    const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const club = world.clubs[0][0];
    createGame(world, { managerName: 'T', managerNation: 0, clubId: club, activeNations: [world.clubs[0][3] as number], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const before = JSON.stringify([gs().options.mode, gs().options.rules]);
    setTheme('dark');
    expect(chromeRetro()).toBe(false); // moderne ramme ...
    expect(isRetro()).toBe(false); // ... og moderne skærme (originalens funktioner er bygget i det moderne design)
    expect(origLogic()).toBe(true);
    expect(legacyExtended()).toBe(false);
    expect(authentic()).toBe(true); // UI: originale spil skjuler de udvidede funktioner også i moderne udseende ...
    expect(JSON.stringify([gs().options.mode, gs().options.rules])).toBe(before); // ... men tilstanden og reglerne er uændrede
    setTheme('retro');
    expect(chromeRetro()).toBe(true);
    expect(isRetro()).toBe(true);
  }, 300_000);
});
