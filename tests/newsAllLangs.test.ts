// Ingen nyhed uden tekst på noget sprog: hver nyhedstype, spillet lægger i indbakken med en bogstavelig nøgle (addNews({ key }) / news('…') i src/game),
// skal have en overskrift på alle 10 sprog, og rekordbogens nyheder (records.ts – klublegende, rekorder, salg/køb) også en brødtekst med de pladsholdere, nyheden udfylder.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
vi_window();
import { en } from '../src/i18n/en';
import { da } from '../src/i18n/da';
import { de } from '../src/i18n/de';
import { es } from '../src/i18n/es';
import { fr } from '../src/i18n/fr';
import { it as itl } from '../src/i18n/it';
import { pt } from '../src/i18n/pt';
import { tr } from '../src/i18n/tr';
import { sv } from '../src/i18n/sv';
import { nb } from '../src/i18n/nb';

function vi_window() { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; }

const LANGS: Record<string, Record<string, string>> = { en, da, de, es, fr, it: itl, pt, tr, sv, nb };

function newsKeys(): Set<string> {
  const keys = new Set<string>();
  for (const f of readdirSync('src/game', { recursive: true }) as string[]) {
    if (!f.endsWith('.ts')) continue;
    const s = readFileSync('src/game/' + f, 'utf8');
    for (const m of s.matchAll(/(?:addNews\(\{[^}]*?key:\s*|\bnews\(\s*)['"`]([a-zA-Z0-9_.]+)['"`]/g)) keys.add(m[1]);
  }
  return keys;
}

describe('nyheder på alle sprog', () => {
  const keys = [...newsKeys()];
  it('registeret findes', () => expect(keys.length).toBeGreaterThan(150));
  it('hver nyhedstype har en overskrift på alle 10 sprog', () => {
    const missing: string[] = [];
    for (const [l, d] of Object.entries(LANGS)) for (const k of keys) if (!d[k]?.trim()) missing.push(`${l}:${k}`);
    expect(missing).toEqual([]);
  });
  it('rekordbogens nyheder har en brødtekst på alle 10 sprog (klublegenden m.fl.)', () => {
    const rec = keys.filter((k) => k.startsWith('recb.news.') && k !== 'recb.news.bigWin' && k !== 'recb.news.att' && k !== 'recb.news.attLow');
    expect(rec).toContain('recb.news.legend');
    const missing: string[] = [];
    for (const [l, d] of Object.entries(LANGS)) for (const k of rec) if (!d[`${k}.body`]?.trim()) missing.push(`${l}:${k}.body`);
    expect(missing).toEqual([]);
  });
  it('klublegendens tekst bruger kun de pladsholdere, nyheden udfylder', () => {
    for (const [l, d] of Object.entries(LANGS)) {
      for (const k of ['recb.news.legend', 'recb.news.legend.body']) {
        const ph = (d[k].match(/\{[^{}]+\}/g) ?? []).filter((x) => !['{player}', '{apps}', '{goals}'].includes(x));
        expect(ph, `${l}:${k}`).toEqual([]);
      }
    }
  });
});
