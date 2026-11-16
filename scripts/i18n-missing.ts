// Viser, hvilke nøgler fra en.ts der mangler i hvert sprog: `npx tsx scripts/i18n-missing.ts [sprog]`
// Med `--dump <sprog>` skrives de manglende nøgler (engelsk tekst) som JSON til stdout.
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
if (process.argv[2] === '--chunks') {
  // --chunks <sprog> <mappe> [tegn pr. bid]: skriver de manglende nøgler som keys-NN.json (oversættelsesopgaver)
  const [lg, dir0, size] = [process.argv[3], process.argv[4], Number(process.argv[5] ?? 24000)];
  for (const l of lg === 'all' ? ['de', 'es', 'fr', 'it', 'pt', 'tr', 'sv', 'nb'] : [lg]) {
    const dir = `${dir0}/${l}`;
    fs.mkdirSync(dir, { recursive: true });
    let cur: Record<string, string> = {}, len = 0, n = 0;
    const flush = () => { if (len) { fs.writeFileSync(`${dir}/keys-${String(++n).padStart(2, '0')}.json`, JSON.stringify(cur, null, 1)); cur = {}; len = 0; } };
    for (const k of Object.keys(en)) if (!(k in L[l])) { cur[k] = en[k]; len += k.length + en[k].length + 8; if (len > size) flush(); }
    flush();
    console.log(l, n, 'bidder');
  }
} else if (process.argv[2] === '--dump') {
  const l = process.argv[3];
  const out: Record<string, string> = {};
  for (const k of Object.keys(en)) if (!(k in L[l])) out[k] = en[k];
  console.log(JSON.stringify(out, null, 0));
} else {
  const only = process.argv[2];
  console.log('en', Object.keys(en).length);
  for (const k of Object.keys(L)) {
    if (only && only !== k) continue;
    const m = Object.keys(en).filter((x) => !(x in L[k]));
    console.log(k, Object.keys(L[k]).length, 'mangler', m.length, 'tegn', m.reduce((a, x) => a + en[x].length, 0));
  }
  const m = Object.keys(en).filter((x) => !(x in de));
  const pre: Record<string, number> = {};
  for (const x of m) { const p = x.split('.')[0]; pre[p] = (pre[p] ?? 0) + 1; }
  console.log(JSON.stringify(pre));
}
