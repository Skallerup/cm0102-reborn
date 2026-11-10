// IndexNow: fortæl Bing, Yandex, Seznam, Naver m.fl. om ændrede url'er (Google bruger det ikke – den læser sitemap.xml).
//
//   npx tsx scripts/indexnow.ts [filter]                lokale sitemaps (public/sitemap-*.xml) – alle url'er, der indeholder filter
//   npx tsx scripts/indexnow.ts --remote --days 3       sitemaps fra cm0102reborn.com – kun url'er med <lastmod> inden for 3 dage
//
// Kører automatisk efter hver produktionsudgivelse (.github/workflows/indexnow.yml). Datoerne i sitemaps er ægte
// (scripts/seo/lastmod.ts), så kun det, der faktisk er ændret, sendes.
// Nøglen er offentlig efter IndexNows design (public/<nøgle>.txt beviser, at vi ejer domænet).
import { readdirSync, readFileSync } from 'node:fs';

const KEY = '38a7999f466546f95404960049050d75';
const HOST = 'cm0102reborn.com';
const args = process.argv.slice(2);
const remote = args.includes('--remote');
const days = args.includes('--days') ? Number(args[args.indexOf('--days') + 1]) : 0;
const filter = args.find((a) => !a.startsWith('--') && a !== String(days)) ?? '';

/** [url, lastmod] fra et sitemap */
const parse = (xml: string): [string, string][] =>
  [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => [m[1].replace(/&amp;/g, '&'), m[2] ?? '']);

let entries: [string, string][];
if (remote) {
  const index = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  const files = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  entries = (await Promise.all(files.map(async (f) => parse(await (await fetch(f)).text())))).flat();
} else {
  entries = readdirSync('public').filter((f) => /^sitemap-.+\.xml$/.test(f)).flatMap((f) => parse(readFileSync(`public/${f}`, 'utf8')));
}
const since = days ? new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10) : '';
const urls = entries.filter(([u, d]) => u.includes(filter) && (!since || d >= since)).map(([u]) => u);
console.log(`${urls.length} url'er${since ? ` ændret siden ${since}` : ''} (af ${entries.length})`);
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`${i}-${Math.min(urls.length, i + 10000)}: ${res.status} ${await res.text()}`);
}
