// Matcher TheSportsDB's ligaer (scripts/sportsdb-leagues.json fra scan-sportsdb-leagues.py) med vores ligaer og pokaler i begge
// databaser → public/data/logos.json["comps"] (nøgle = turneringens rigtige navn, som realCompName giver det).
// 1) navnet (eller det alternative) indeholder vores rigtige navn; 2) ellers landets øverste liga (laveste id uden pokal/kvinder/ungdom).
// Kør: npx tsx scripts/match-comp-badges.mts
import { readFileSync, writeFileSync } from 'node:fs';
import { realCompName } from '../src/i18n/comps';

const sdb = JSON.parse(readFileSync('scripts/sportsdb-leagues.json', 'utf8')) as Record<string, { name: string; alt: string; country: string; badge: string } | null>;
const entries = Object.entries(sdb).filter(([, v]) => v?.badge).map(([id, v]) => ({ id: Number(id), ...v! }));
const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const NOT_TOP = /cup|copa|coupe|pokal|coppa|taca|trophy|shield|super ?cup|women|femin|frauen|u-?\d\d|youth|reserve|\b2\b|second|segunda|serie b|ii\b|zweite/i;
const COUNTRY: Record<string, string> = { Holland: 'Netherlands', 'Republic of Ireland': 'Ireland', 'Czech Republic': 'Czech Republic', USA: 'USA' };
const logos = JSON.parse(readFileSync('public/data/logos.json', 'utf8'));
const comps: Record<string, string> = (logos.comps ??= {});
let added = 0;
for (const f of ['public/data/world.json', 'public/data/world-original.json']) {
  const w = JSON.parse(readFileSync(f, 'utf8'));
  for (const l of w.leagues as { name: string; nation: number; tier: number; hidden?: boolean }[]) {
    const real = realCompName(l.name);
    if (comps[real] || l.hidden || l.tier >= 9 || real === w.nations[l.nation]?.name) continue;
    const country = COUNTRY[w.nations[l.nation]?.name] ?? w.nations[l.nation]?.name ?? '';
    const r = norm(real);
    const local = entries.filter((e) => e.country === country);
    let hit = r.length >= 4 ? local.find((e) => norm(e.name).includes(r) || norm(e.alt).includes(r)) : undefined;
    if (!hit && l.tier === 1) hit = local.filter((e) => !NOT_TOP.test(e.name)).sort((a, b) => a.id - b.id)[0];
    if (hit) { comps[real] = `${hit.badge}/small`; added++; console.log(`${real} (${country}) → ${hit.name}`); }
  }
}
writeFileSync('public/data/logos.json', JSON.stringify(logos));
console.log(`${added} nye, ${Object.keys(comps).length} i alt`);
