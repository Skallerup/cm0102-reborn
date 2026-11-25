// Forkontrakt-tilbud (build_bid's kontrakttilbud +0x2f → tilstand 7) til spillere i MENNESKETS klub mod computerklubbernes, sæson 1.
// Menneskets klub CLUB (standard Manchester United) spilles uden ferie (quickPlayUserMatch); kontrakterne forlænges ikke.
// Pr. spiller med kontrakt, der udløber senest 30/6-02 (CA ≥ MINCA): antal kontrakttilbud, første tilbudsdato, aftalt fremtidigt skifte.
//   WORLD=<world.json> CLUB="Manchester United" UNTIL=2002-07-01 JSON=<fil> node scripts/measure.mjs -- npx tsx scripts/k7-human-pre.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const UNTIL = process.env.UNTIL ?? '2002-07-01', CLUB = process.env.CLUB ?? 'Manchester United', MINCA = Number(process.env.MINCA ?? 100);
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const cid = w.clubs.find((c) => c[1] === CLUB)![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: cid, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
let g = gs();
const lg = (g.clubs[cid] as unknown as { league?: unknown }).league;
const prem = new Set(Object.values(g.clubs).filter((c) => (c as unknown as { league?: unknown }).league === lg).map((c) => c.id));
interface Row { name: string; club: string; human: boolean; ca: number; age: number; exp: string; offers: number; first: string; buyers: string[]; fut?: string; news: number; months: Record<string, number> }
const rows = new Map<number, Row>();
const seenO = new Set<number>();
let guard = 0, newsSeen = 0;
while (g.date < UNTIL && guard++ < 40000) {
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  g = gs();
  for (const p of Object.values(g.players)) {
    if (!p.club || !p.contract || p.contract.expires > '2002-06-30' || p.ca < MINCA || rows.has(p.id)) continue;
    const c = g.clubs[p.club];
    if (!c || c.nation !== g.clubs[cid].nation) continue;
    rows.set(p.id, { name: `${p.first} ${p.last}`, club: c.name, human: p.club === cid, ca: p.ca, age: Number(g.date.slice(0, 4)) - Number(p.dob.slice(0, 4)), exp: p.contract.expires, offers: 0, first: '', buyers: [], news: 0, months: {} });
  }
  for (const o of g.offers) {
    if (seenO.has(o.id) || o.loan) continue;
    const row = rows.get(o.player);
    if (!row || !o.cmAi || !o.cmK) continue;
    seenO.add(o.id);
    row.offers++; if (!row.first) row.first = g.date; row.buyers.push(g.clubs[o.buyer]?.name ?? '?');
    const mo = g.date.slice(0, 7); row.months[mo] = (row.months[mo] ?? 0) + 1;
  }
  for (const n of (g.news ?? []).slice(newsSeen)) if ((n as { key?: string }).key === 'transfer.cm7') { const id = (n as { link?: { id: number } }).link?.id; const row = id !== undefined ? rows.get(id) : undefined; if (row) row.news++; }
  newsSeen = (g.news ?? []).length;
  for (const [id, row] of rows) { const p = g.players[id]; if (p?.contract?.futureClub && !row.fut) row.fut = `${g.clubs[p.contract.futureClub]?.name} ${g.date}`; }
}
const all = [...rows.values()];
const premName = new Set([...prem].map((pc) => g.clubs[pc]?.name));
const sum = (xs: Row[]) => ({ n: xs.length, withOffer: xs.filter((x) => x.offers).length, offers: xs.reduce((s, x) => s + x.offers, 0), fut: xs.filter((x) => x.fut).length, news: xs.reduce((s, x) => s + x.news, 0) });
console.log('menneskets klub', JSON.stringify(sum(all.filter((x) => x.human))));
console.log('Premier computer', JSON.stringify(sum(all.filter((x) => !x.human && premName.has(x.club)))));
console.log('alle computer', JSON.stringify(sum(all.filter((x) => !x.human))));
for (const x of all.filter((x) => x.human)) console.log(' ', x.name, x.ca, x.age, x.exp, 'tilbud', x.offers, x.first, x.buyers.slice(0, 5).join(','), 'fut', x.fut ?? '-', 'nyheder', x.news);
void prem;
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(all));
