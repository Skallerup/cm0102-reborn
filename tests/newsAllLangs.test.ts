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

// ---------- brødteksten: ingen nyhed med tom tekst (ejerens regel 28/11) ----------
// Nøglerne findes bredere end ovenfor: også dem, koden vælger i en variabel (const key = …, top.key, reply = …, `ba.no.${kind}` …).
// Hver nyhedstype skal have en brødtekst på alle 10 sprog – `${key}.body`, eller den/de tekster, newsBody (src/ui/screens/common.tsx) vælger.
// Kontrol i et spillet forløb: scripts/news-bodies.ts (tests/newsBodiesAudit.test.ts, NEWS_BODIES=1).
function exprEnd(s: string, i: number): number {
  let d = 0, q: string | null = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') q = c;
    else if ('([{'.includes(c)) d++;
    else if (')]}'.includes(c)) { if (d === 0) return i; d--; } else if ((c === ',' || c === ';' || c === '\n') && d === 0) return i;
  }
  return i;
}
function allNewsKeys(): Set<string> {
  const all = Object.keys(en), keys = newsKeys();
  for (const f of readdirSync('src/game', { recursive: true }) as string[]) {
    if (!f.endsWith('.ts')) continue;
    const s = readFileSync('src/game/' + f, 'utf8');
    for (const m of s.matchAll(/(?:\bkey\s*=(?!=)\s*|(?:cat|pri):[^\n]{0,40}?\bkey:\s*|\b(?:reply|react|head|pk|team)\s*=\s*|addNews\(\{[^}]*?key:\s*)/g)) {
      const st = m.index! + m[0].length, ex = s.slice(st, exprEnd(s, st));
      for (const l of ex.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)) {
        const v = l[1] ?? l[2] ?? l[3];
        if (l[3] !== undefined && v.includes('${')) {
          if (!/^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9_.]*\$\{/.test(v)) continue;
          const re = new RegExp('^' + v.replace(/[.]/g, '\\.').replace(/\$\{[^}]*\}/g, '[A-Za-z0-9_]*') + '$');
          for (const k of all) if (re.test(k) && !/\.(body\w*|b\.\w+)$/.test(k)) keys.add(k);
        } else if (v in en) keys.add(v);
      }
    }
  }
  return keys;
}
/** nøgler, koden vælger i en variabel, som ikke er nyheder (bekræftelsesdialoger, kontraktsvar, tekststumper i en nyhed, Board-skærmens svar) */
const NOT_NEWS = [/^cm\.confirm\./, /^cm\.neg\./, /^transfer\.o\.(fromClub|more)$/, /^ba\.no\.short$/];
/** brødteksten bygges i newsBody af nyhedens felter (boardUpdate, cmBanBody/cmBanAnswerBody, cmRequestBody, cmRumBody) */
const BUILT = [/^board\.update$/, /^cmban\.h/, /^cmban\.fa\./, /^cm\.req$/, /^cm\.rum$/];
/** brødteksten vælges i spillet (params.body – originalens exe-varianter): mindst én variant med præfikset */
const BY_PARAM: [RegExp, string][] = [
  [/^cmfine\./, 'cmfine.b.'], [/^cmret\./, 'cmret.b.'], [/^cmcal\.tv$/, 'cmcal.tvb.'], [/^cmprize\./, 'cmprize.b.'], [/^cmfe\./, 'cmfe.b.'],
  [/^cmint\.r\./, 'cmint.r.body'], [/^cmint\./, 'cmint.b.'], [/^cmaw\.mh\./, 'cmaw.mb.'], [/^cmaw\.yh\./, 'cmaw.yb.'], [/^cm\.staffRenew(Ok|No)$/, 'cm.rn.'],
  [/^transfer\.cm7$/, 'transfer.cm7.b.'], [/^transfer\.cmLoanCancelled$/, 'transfer.cmLoanCancelled.b.'], [/^transfer\.cmBidRej$/, 'transfer.cmBidRej.b'],
];
/** fælles tekster/varianter (bodyKey i common.tsx): alle skal findes; tom liste = `${key}.body` og `${key}.body0` (reservekampe uden stadion) */
const ROUTES: [RegExp, string[]][] = [
  [/^board\.exp\./, ['board.exp.title.body']], [/^jab\.botBack\./, ['jab.botBack.body']], [/^reject\.r\./, ['reject.r.body']],
  [/^press\.reportPlain$/, ['press.report.body', 'press.reportPlain.body']],
  [/^news\.(cupWin|playoffWin)$/, ['news.cupWin.body', 'news.cupWin.bodyAgg', 'news.cupWin.bodyPlain']],
  [/^cms[rn]\./, ['cmsr.body']], [/^cm\.stm\./, ['cm.stm.body', 'cm.stm.bodyFrom']], [/^cmfr\.proposal$/, ['cmfr.proposal.offered', 'cmfr.proposal.challenged']],
  [/^intl\.tourSel$/, ['intl.tourSel.many', 'intl.tourSel.body1', 'intl.tourSel.bodyN']], [/^cm\.stBid$/, ['cm.stBid.body', 'cm.stBid.body0']],
  [/^res\.(win|draw|loss)$/, []],
];
/** Nyheder, originalen viser uden brødtekst (med begrundelse). Ingen i dag: hver nyhedstype i originalen har en brødtekst i exe'en. */
const NO_BODY: { key: RegExp; why: string }[] = [];

function bodyKeysFor(k: string): { need: string[]; prefix?: string } | null {
  if (NOT_NEWS.some((r) => r.test(k)) || BUILT.some((r) => r.test(k)) || NO_BODY.some((x) => x.key.test(k))) return null;
  const bp = BY_PARAM.find(([r]) => r.test(k));
  if (bp) return { need: [], prefix: bp[1] };
  const rt = ROUTES.find(([r]) => r.test(k));
  if (rt) return { need: rt[1].length ? rt[1] : [`${k}.body`, `${k}.body0`] };
  return { need: [`${k}.body`] };
}

describe('nyhedernes brødtekst på alle sprog', () => {
  const keys = [...allNewsKeys()].sort();
  it('den brede søgning finder også de nøgler, koden vælger i en variabel', () => {
    for (const k of ['mp.joined', 'job.applied', 'board.exp.top3', 'reject.r.key.0', 'jab.botBack.2', 'res.win', 'cmint.h.p1', 'camp.approved', 'transfer.notForSale']) expect(keys, k).toContain(k);
    expect(keys.length).toBeGreaterThan(400);
  });
  it('hver nyhedstype har en ikke-tom brødtekst på alle 10 sprog', () => {
    const missing: string[] = [];
    for (const k of keys) {
      const b = bodyKeysFor(k);
      if (!b) continue;
      for (const [l, d] of Object.entries(LANGS)) {
        for (const bk of b.need) if (!d[bk]?.trim()) missing.push(`${l}:${bk}`);
        if (b.prefix && !Object.keys(d).some((x) => x.startsWith(b.prefix!) && d[x]?.trim())) missing.push(`${l}:${b.prefix}*`);
      }
    }
    expect(missing).toEqual([]);
  });
});
