// Ærlige ændringsdatoer til de statiske sider (sitemap <lastmod> og "Updated …" på guiderne).
//
// Før fik alle guider byggedagens dato og alle databasesider én fælles dato, så Google kunne ikke se, hvad der
// faktisk var ændret – og en dato, der altid flytter sig, bliver ignoreret. Nu gemmes et fingeraftryk af hver
// sides indhold i scripts/seo/lastmod.json (committes): er indholdet det samme som sidst, beholdes datoen;
// er det ændret, sættes dagens dato. Nye sider får den dato, kalderen angiver (fallback).
// Filen opdateres, når der bygges lokalt (npm run build) – læg den med i samme commit. På Vercel læses den kun.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const FILE = 'scripts/seo/lastmod.json';
const TODAY = new Date().toISOString().slice(0, 10);
/** slug → "fingeraftryk dato" */
const store: Record<string, string> = existsSync(FILE) ? (JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, string>) : {};
const seen = new Set<string>();
let changed = 0;

/** Datoen for en side ud fra dens indhold (title + description + body) – se filens hoved */
export function contentDate(slug: string, content: string, fallback: string): string {
  const h = createHash('sha1').update(content).digest('hex').slice(0, 10);
  seen.add(slug);
  const prev = store[slug];
  if (prev) {
    const [ph, pd] = prev.split(' ');
    if (ph === h) return pd;
    changed++;
    store[slug] = `${h} ${TODAY}`;
    return TODAY;
  }
  store[slug] = `${h} ${fallback}`;
  return fallback;
}

/** Den gemte dato for en side (til sitemap) */
export const dateOf = (slug: string): string | undefined => store[slug]?.split(' ')[1];

/** Gem fingeraftrykkene (sider, der ikke længere bygges, fjernes) og sig hvor mange der ændrede sig */
export function saveLastmod(): void {
  const out: Record<string, string> = {};
  for (const k of Object.keys(store).sort()) if (seen.has(k)) out[k] = store[k];
  writeFileSync(FILE, `{\n${Object.entries(out).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')}\n}\n`);
  console.log(`lastmod: ${Object.keys(out).length} sider, ${changed} ændret i dag`);
}
