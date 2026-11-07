// IndexNow: fortæl Bing, Yandex, Seznam, Naver m.fl. om alle url'er i sitemaps (Google bruger det ikke – den læser sitemap.xml).
// Kør efter en udgivelse, når siderne er live: npx tsx scripts/indexnow.ts [kun-url'er-der-indeholder]
// Nøglen er offentlig efter IndexNows design (public/<nøgle>.txt beviser, at vi ejer domænet).
import { readdirSync, readFileSync } from 'node:fs';

const KEY = '38a7999f466546f95404960049050d75';
const HOST = 'cm0102reborn.com';
const filter = process.argv[2] ?? '';
const urls = readdirSync('public').filter((f) => /^sitemap-.+\.xml$/.test(f))
  .flatMap((f) => [...readFileSync(`public/${f}`, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&')))
  .filter((u) => u.includes(filter));
console.log(`${urls.length} url'er`);
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`${i}-${Math.min(urls.length, i + 10000)}: ${res.status} ${await res.text()}`);
}
