// (fejlsøgning) Forkontrakt-tilbud (build_bid +0x2f → tilstand 7) til spillere i MENNESKETS klub (uden ferie) mod computerklubbernes, sæson 1,
// og hvor menneskets udløbende spillere ender (klub 1/8). Kontrakterne forlænges ikke.
//   WORLD=<world.json> CLUB=Arsenal UNTIL=2002-08-02 node scripts/measure.mjs -- npx tsx scripts/k7-human-pc.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const UNTIL = process.env.UNTIL ?? '2002-08-02', CLUB = process.env.CLUB ?? 'Arsenal', MINCA = Number(process.env.MINCA ?? 100);
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const cid = w.clubs.find((c) => c[1] === CLUB)![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: cid, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
let g = gs();
interface Row { name: string; human: boolean; ca: number; exp: string; offers: number; first: string; buyers: string[]; fut?: string; months: Record<string, number>; end?: string }
const rows = new Map<number, Row>();
const seenO = new Set<number>();
const futM: Record<string, number> = {}, futMH: Record<string, number> = {};
let guard = 0, newsSeen = 0;
const newsKeys: Record<string, number> = {};
while (g.date < UNTIL && guard++ < 40000) {
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  g = gs();
  for (const p of Object.values(g.players)) {
    if (!p.club || !p.contract || p.contract.expires > '2002-06-30' || p.ca < MINCA || rows.has(p.id)) continue;
    const c = g.clubs[p.club];
    if (!c || c.nation !== g.clubs[cid].nation) continue;
    rows.set(p.id, { name: `${p.first} ${p.last}`, human: p.club === cid, ca: p.ca, exp: p.contract.expires, offers: 0, first: '', buyers: [], months: {} });
  }
  for (const o of g.offers) {
    if (seenO.has(o.id) || o.loan) continue;
    const row = rows.get(o.player);
    if (!row || !o.cmAi || !o.cmK) continue;
    seenO.add(o.id);
    row.offers++; if (!row.first) row.first = g.date; row.buyers.push(g.clubs[o.buyer]?.name ?? '?');
    const mo = g.date.slice(0, 7); row.months[mo] = (row.months[mo] ?? 0) + 1;
  }
  for (const n of (g.news ?? []).slice(newsSeen)) { const k = (n as { key?: string }).key ?? ''; if (/^(contract|transfer\.cm7|transfer\.o|cm\.)/.test(k)) newsKeys[k] = (newsKeys[k] ?? 0) + 1; }
  newsSeen = (g.news ?? []).length;
  for (const [id, row] of rows) {
    const p = g.players[id];
    if (p?.contract?.futureClub && !row.fut) { row.fut = `${g.clubs[p.contract.futureClub]?.name} ${g.date}`; const mo = g.date.slice(0, 7); (row.human ? futMH : futM)[mo] = ((row.human ? futMH : futM)[mo] ?? 0) + 1; }
  }
}
for (const [id, row] of rows) { const p = g.players[id]; row.end = p?.club ? `${g.clubs[p.club]?.name}${p.club === cid ? ' (egen)' : ''} ${p.contract?.expires ?? ''} t${p.contract?.cmType ?? 2}` : 'klubløs'; }
const all = [...rows.values()];
const sum = (xs: Row[]) => ({ n: xs.length, withOffer: xs.filter((x) => x.offers).length, offers: xs.reduce((s, x) => s + x.offers, 0), offersJanJun: xs.reduce((s, x) => s + Object.entries(x.months).filter(([m]) => m >= '2002-01' && m <= '2002-06').reduce((a, [, v]) => a + v, 0), 0), fut: xs.filter((x) => x.fut).length });
console.log('menneskets klub', JSON.stringify(sum(all.filter((x) => x.human))));
console.log('alle computer', JSON.stringify(sum(all.filter((x) => !x.human))));
console.log('forkontrakter pr. måned (computer)', JSON.stringify(futM), '(menneske)', JSON.stringify(futMH));
console.log('nyheder', JSON.stringify(newsKeys));
for (const x of all.filter((x) => x.human)) console.log(' ', x.name, x.ca, x.exp, 'tilbud', x.offers, x.first, JSON.stringify(x.months), x.buyers.slice(0, 5).join(','), 'fut', x.fut ?? '-', 'slut', x.end);
