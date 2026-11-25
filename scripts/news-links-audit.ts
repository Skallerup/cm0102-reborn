// Revision af nyhedslinks: kører et spil (2001/02, originalens database) og tegner hver nyheds overskrift og brødtekst med de samme
// komponenter som skærmen (NewsTitle/NewsBody); tæller kendte navne (spillere, stab, klubber, nationer, turneringer), der står uden link.
// Kør via tests/newsLinksAudit.test.ts (NEWS_AUDIT=1; AUDIT_CLUB, AUDIT_TO, AUDIT_OUT=fil, WORLD).
import { readFileSync, writeFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { NewsBody, NewsTitle } from '../src/ui/screens/common';

const CLUB = process.env.AUDIT_CLUB ?? 'Arsenal', TO = process.env.AUDIT_TO ?? '2001-10-15';
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === CLUB)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const seen = new Set<unknown>();
const total: Record<string, { n: number; miss: number; links: number; ex: string[] }> = {};
const known = new Set<string>();
for (const p of Object.values(g.players)) known.add(`${p.first} ${p.last}`.trim());
for (const s of Object.values(g.staff)) known.add(`${s.first} ${s.last}`.trim());
for (const c of Object.values(g.clubs)) { known.add(c.name); if (c.short.length >= 4) known.add(c.short); }
for (const n of g.nations) if (n?.name) known.add(n.name);
for (const c of Object.values(g.comps)) if (c.name) known.add(c.name);
const longest = [...known].filter((k) => k.length >= 4).sort((a, b) => b.length - a.length);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const re = new RegExp(`(?<![\\p{L}])(${longest.map(esc).join('|')})(?![\\p{L}])`, 'gu');
function audit() {
  for (const x of g.news) {
    if (seen.has(x)) continue;
    seen.add(x);
    let html = '';
    try { html = `${renderToStaticMarkup(createElement(NewsTitle, { n: x }))}\u0001${renderToStaticMarkup(createElement(NewsBody, { n: x }))}`; } catch { html = ''; }
    const links = (html.match(/<a /g) ?? []).length;
    const plain = html.replace(/<a [^>]*>.*?<\/a>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
    const miss = [...plain.matchAll(re)].map((m) => m[1]);
    const r = (total[x.key] ??= { n: 0, miss: 0, links: 0, ex: [] });
    r.n++; r.links += links; r.miss += miss.length;
    if (miss.length && r.ex.length < 2) r.ex.push(`${miss.join(' | ')} :: ${plain.replace(/\s+/g, ' ').slice(0, 140)}`);
  }
}
audit();
while (g.date < TO) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); audit(); }
const lines: string[] = [];
let tn = 0, tm = 0, tl = 0;
for (const [k, r] of Object.entries(total).sort((a, b) => b[1].miss - a[1].miss)) {
  tn += r.n; tm += r.miss; tl += r.links;
  if (r.miss) lines.push(`${k.padEnd(28)} n=${String(r.n).padStart(4)} ulinkede=${String(r.miss).padStart(4)} links=${r.links}\n    ${r.ex.join('\n    ')}`);
}
lines.push(`\nI ALT: ${tn} nyheder, ${tl} links, ${tm} ulinkede navne i ${Object.values(total).filter((r) => r.miss).length}/${Object.keys(total).length} typer (${CLUB}, til ${TO})`);
writeFileSync(process.env.AUDIT_OUT ?? 'news-links-audit.txt', `${lines.join('\n')}\n`);
