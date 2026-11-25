// (fejlsøgning) Vores kontrakttilbud (build_bid +0x2f → tilstand 7: TransferOffer.cmK) fra computerklubber til spillere MED kontrakt – samme
// tabeller som scripts/k7-pre-oracle.ts (måned for første dag set, sælgergruppe, CA-bånd, dage til udløb). Som oraklet: frø 1, Arsenal på ferie.
//   WORLD=<world-dbs2.json> [CLUB=Arsenal] [HOLIDAY=0] UNTIL=2002-06-30 node scripts/measure.mjs -- npx tsx scripts/k7-pre-census.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const UNTIL = process.env.UNTIL ?? '2002-06-30', CLUB = process.env.CLUB ?? 'Arsenal';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const cid = w.clubs.find((c) => c[1] === CLUB)![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: cid, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
if (process.env.HOLIDAY !== '0') gs().manager.holiday = {};
let g = gs();
const grp = (c?: number) => { const cl = c !== undefined ? g.clubs[c] : undefined; if (!cl) return '-'; if (cl.nation !== eng) return 'X'; return TIER[g.leagues[cl.league]?.name ?? ''] ?? 'NL'; };
interface R { first: string; buyer: string; bg: string; seller: string; sg: string; ca: number; exp: string; days: number; fut?: boolean }
const seen = new Map<string, R>(), skip = new Set<string>();
let guard = 0;
while (g.date < UNTIL && guard++ < 40000) {
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  g = gs();
  for (const o of g.offers) {
    if (!o.cmAi || o.loan) continue;
    const p = g.players[o.player];
    const key = `${o.buyer}/${o.player}`;
    if (seen.has(key) || skip.has(key)) continue;
    // (kun build_bid's kontrakttilbud: cmK sat fra første dag – et almindeligt bud får først kontrakten, når sælgeren har sagt ja)
    if (!o.cmK) { skip.add(key); continue; }
    // (kun spillere med kontrakt, da buddet blev set første gang – en klubløs, der siden skriver under, tæller ikke)
    if (!p || !p.club || !p.contract) { skip.add(key); continue; }
    const exp = p.contract.expires.slice(0, 10);
    seen.set(key, { first: g.date.slice(0, 10), buyer: g.clubs[o.buyer]?.name ?? '', bg: grp(o.buyer), seller: g.clubs[p.club]?.name ?? '', sg: grp(p.club), ca: p.ca, exp, days: Math.round((Date.parse(exp) - Date.parse(g.date.slice(0, 10))) / 864e5) });
  }
}
const rows = [...seen.values()];
const tab = (f: (r: R) => string) => { const o: Record<string, number> = {}; for (const r of rows) { const k = f(r); o[k] = (o[k] ?? 0) + 1; } return Object.fromEntries(Object.entries(o).sort()); };
console.log('kontrakttilbud til spillere med kontrakt', rows.length);
console.log('pr. måned', JSON.stringify(tab((r) => r.first.slice(0, 7))));
console.log('sælger', JSON.stringify(tab((r) => r.sg)));
console.log('køber', JSON.stringify(tab((r) => r.bg)));
console.log('CA-bånd', JSON.stringify(tab((r) => String(Math.min(180, Math.floor(r.ca / 20) * 20)))));
console.log('dage til udløb', JSON.stringify(tab((r) => String(Math.min(400, Math.floor(r.days / 30) * 30)))));
const own = rows.filter((r) => r.seller === CLUB);
console.log(`${CLUB} (menneskets klub)`, own.length, JSON.stringify(own.map((r) => [r.first, r.buyer, r.ca, r.exp])));
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(rows));
