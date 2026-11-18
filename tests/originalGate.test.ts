// docs/ALWAYS_ORIGINAL.md trin 1: spillets logik afhænger aldrig af udseendet. Kun rules.ts' legacyExtended læser tilstanden; authentic()/
// extended() (tema + tilstand) er et rent UI-begreb og må ikke bruges i src/game.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { cmLogic } from '../src/game/cmPlayerData';
import { gridEngineOn } from '../src/game/sim';
import { authentic, legacyExtended, origLogic } from '../src/game/rules';
import { gs } from '../src/game/state';
import { act } from '../src/game/actions';

const files = (d: string): string[] =>
  readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : []; });

describe('originalens logik uafhængig af udseendet', () => {
  it('src/game importerer ikke authentic/extended og læser ikke temaet (kun rules.ts)', () => {
    const bad: string[] = [];
    for (const p of files('src/game')) {
      if (p.endsWith(join('game', 'rules.ts'))) continue;
      const s = readFileSync(p, 'utf8');
      const imp = [...s.matchAll(/import\s*\{([^}]*)\}\s*from\s*'[./]*rules'/g)].flatMap((m) => m[1].split(',').map((x) => x.trim()));
      if (imp.includes('authentic') || imp.includes('extended')) bad.push(`${p}: importerer authentic/extended`);
      if (/dataset\.skin|data-skin|documentElement/.test(s)) bad.push(`${p}: læser temaet`);
      if (/options\.mode\s*(===|!==)/.test(s)) bad.push(`${p}: læser options.mode direkte (brug legacyExtended/origLogic)`);
    }
    expect(bad).toEqual([]);
  });

  const doc = (globalThis as { document?: unknown });
  afterEach(() => { delete doc.document; });

  it('et nyt spil i det moderne udseende kører stadig originalens logik og kampmotor', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3 });
    const g = gs();
    // trin 2: nye spil er altid originale (createGame uden mode) og reglerne/vinduerne kan ikke ændres
    expect(g.options.mode).toBe('authentic');
    expect(g.options.rules).toBe('classic');
    expect(act({ t: 'setRules', rules: 'modern' })).toBe('authentic');
    expect(act({ t: 'setWindows', mode: 'classic' })).toBe('authentic');
    expect(g.options.rules).toBe('classic');
    const before = { o: origLogic(g), c: cmLogic(g), e: gridEngineOn(g) };
    doc.document = { documentElement: { dataset: { skin: 'modern' } } };
    expect(authentic()).toBe(false); // UI: ikke originalens skærme
    expect({ o: origLogic(g), c: cmLogic(g), e: gridEngineOn(g) }).toEqual(before);
    expect(before.o && before.c).toBe(true);
    expect(legacyExtended(g)).toBe(false);
  });

  it('kun den arvede udvidede tilstand (og gemte spil uden tilstand) er legacyExtended', () => {
    const g = gs();
    g.options.mode = 'extended';
    expect(legacyExtended(g)).toBe(true);
    expect(cmLogic(g)).toBe(false);
    delete g.options.mode;
    expect(legacyExtended(g)).toBe(true);
  });
});
