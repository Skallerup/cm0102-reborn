// Alle spillets sprog: ingen nøgle fra en.ts mangler (undtagen den eksplicitte liste), pladsholderne er de samme, og bestyrelsens tekstpakker
// (src/game/data/cmBoard.<sprog>.json) har samme form og pladsholdere som den engelske.
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
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
import { ensureLang, setLang } from '../src/i18n';
import { expectBody, expectTitle, requestReply, ultimatumBody, confidenceText } from '../src/game/cmBoardText';
import { boardPack, type BoardPack } from '../src/i18n/boardPack';
import EN_PACK from '../src/game/data/cmBoard.en.json';
import BT from '../src/game/data/cmBoardTexts.json';

const LANGS: Record<string, Record<string, string>> = { da, de, es, fr, it: itl, pt, tr, sv, nb };
/** nøgler, der med vilje ikke findes på et sprog (falder tilbage til engelsk) – tom, så længe alle er oversat */
/** CM Reborn-tilvalgene (Game Options): kun en + da, øvrige sprog falder tilbage til engelsk */
const RB = ['title', 'achievements', 'matchExtras', 'firstDay', 'articles', 'menus', 'searchPresets', 'helpTexts'].map((k) => `cl.rb.${k}`);
const EXCEPT: Record<string, string[]> = { de: RB, es: RB, fr: RB, it: RB, pt: RB, tr: RB, sv: RB, nb: RB };
/** nøgler, hvor sproget med vilje bruger andre pladsholdere (dansk bruger {nation}/{fromDa} i stedet for {adj}/{fromEn}) */
const PH_EXCEPT: Record<string, string[]> = { da: ['scout.doneOne.body', 'cm.fut.adjustLifestyle', 'cm.staffRejects.body', 'cm.rum.r.r1', 'cm.rum.r.r2', 'cm.fut.fellowHelp'] };

/** {an} (engelsk a/an) må udelades på alle sprog */
const PH_ALL = ['cm.rum.a.r1n'];
const PH = /\{[^{}]+\}|%[sd]|<[^>]+>/g;
const ph = (s: string) => (s.replace(/\{m's\}/g, '{m}').match(PH) ?? []).sort().join('|');

describe('alle sprog har alle nøgler', () => {
  for (const [lang, dict] of Object.entries(LANGS)) {
    it(`${lang}: ingen nøgle fra en.ts mangler, og pladsholderne passer`, () => {
      const skip = new Set(EXCEPT[lang] ?? []);
      const missing = Object.keys(en).filter((k) => !(k in dict) && !skip.has(k));
      expect(missing.slice(0, 10), `${missing.length} nøgler mangler på ${lang}`).toEqual([]);
      const bad: string[] = [];
      for (const k of Object.keys(en)) {
        const v = dict[k];
        if (v === undefined || (PH_EXCEPT[lang] ?? []).includes(k) || PH_ALL.includes(k)) continue;
        if (v.trim() === '' && en[k].trim() !== '') bad.push(`${k}: tom`);
        else if (ph(v) !== ph(en[k])) bad.push(`${k}: ${ph(en[k])} → ${ph(v)}`);
      }
      expect(bad.slice(0, 10), `${bad.length} nøgler med forkerte pladsholdere på ${lang}`).toEqual([]);
    });
  }
});

/** samme form (objekter, lister, tekster) og samme pladsholdere som den engelske pakke */
function same(a: unknown, b: unknown, path: string, errs: string[]): void {
  if (typeof a === 'string') {
    if (typeof b !== 'string') errs.push(`${path}: ikke tekst`);
    else if (a !== '' && !b.trim()) errs.push(`${path}: tom`);
    else if (ph(a) !== ph(b)) errs.push(`${path}: ${ph(a)} → ${ph(b)}`);
    else if (a.split('\n').length !== b.split('\n').length) errs.push(`${path}: linjeskift`);
  } else if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) errs.push(`${path}: liste`);
    else a.forEach((x, i) => same(x, b[i], `${path}[${i}]`, errs));
  } else if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') { errs.push(`${path}: objekt`); return; }
    for (const k of Object.keys(a)) if (!(k in b)) errs.push(`${path}.${k}: mangler`); else same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`, errs);
  }
}

describe('bestyrelsens tekster på alle sprog', () => {
  const S = (BT as { S: string[] }).S;
  const base = { ...(EN_PACK as unknown as Omit<BoardPack, 'S'>), S };
  for (const lang of Object.keys(LANGS)) {
    it(`${lang}: pakken har alle 290 blade og samme pladsholdere som den engelske`, async () => {
      await ensureLang(lang as 'da');
      const p = boardPack(lang);
      expect(p, `pakken for ${lang} kunne ikke hentes`).toBeTruthy();
      const errs: string[] = [];
      same(base, p, '', errs);
      expect(p!.S).toHaveLength(S.length);
      expect(errs.slice(0, 10), `${errs.length} fejl`).toEqual([]);
    });
    it(`${lang}: teksterne bygges (ingen engelsk, ingen ubrugte pladsholdere)`, async () => {
      await ensureLang(lang as 'da');
      setLang(lang as 'da');
      const out = [expectTitle(2), expectBody('Vejle Boldklub', 0x400 | 4, false, true), requestReply('Vejle Boldklub', 3, 2), ultimatumBody(1, 1, 1, 'Vejle Boldklub', 'Martin Skallerup', 'Vejle Stadion', true, true), ultimatumBody(3, 4, 2, 'Vejle Boldklub', 'Martin Skallerup', 'Vejle Stadion', false, false),
        confidenceText({ club: 'Vejle Boldklub', days: 100, wealth: 0, leagueBand: 3, confBand: 3, runType: 1, runLen: 3, arrogDays: 9999, conf: 5000, fans: 0 })];
      for (const s of out) expect(s, s).not.toMatch(/\{[a-zA-Z']+\}/);
      setLang('en');
      expect(expectTitle(2)).toBe('Board want the title');
      if (lang !== 'en') { setLang(lang as 'da'); expect(expectTitle(2)).not.toBe('Board want the title'); setLang('en'); }
    });
  }
});
