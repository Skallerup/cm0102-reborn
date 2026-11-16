// Nøgler, hvis pladsholdere afviger fra en.ts: npx tsx scripts/i18n-ph.ts [--dump <sprog> <fil>]
import * as fs from 'node:fs';
import { en } from '../src/i18n/en';
import { da } from '../src/i18n/da';
import { de } from '../src/i18n/de';
import { es } from '../src/i18n/es';
import { fr } from '../src/i18n/fr';
import { it } from '../src/i18n/it';
import { pt } from '../src/i18n/pt';
import { tr } from '../src/i18n/tr';
import { sv } from '../src/i18n/sv';
import { nb } from '../src/i18n/nb';
const L: Record<string, Record<string, string>> = { da, de, es, fr, it, pt, tr, sv, nb };
const ph = (s: string) => (s.replace(/\{m's\}/g, '{m}').match(/\{[^{}]+\}|%[sd]|<[^>]+>/g) ?? []).sort().join('|');
const bad: Record<string, string[]> = {};
for (const [l, d] of Object.entries(L)) bad[l] = Object.keys(en).filter((k) => k in d && ph(d[k]) !== ph(en[k]));
if (process.argv[2] === '--dump') {
  // alle sprogs afvigende nøgler (union) som engelsk kildetekst, til en ny oversættelsesrunde
  const keys = new Set<string>();
  for (const l of Object.keys(bad)) for (const k of bad[l]) keys.add(k);
  fs.writeFileSync(process.argv[3], JSON.stringify(Object.fromEntries([...keys].map((k) => [k, en[k]])), null, 1));
  console.log('nøgler', keys.size);
} else for (const l of Object.keys(bad)) console.log(l, bad[l].length, bad[l].slice(0, 60).join(' '));
