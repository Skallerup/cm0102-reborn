// Tæller computerens bud på menneskets spillere (Man Utd, 2001, ægte tilstand) – beløb 0 / < £10.000.   npx tsx scripts/cm-zero-bids.ts [dage]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((n) => n.name === 'England');
const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 11), mode: 'authentic' });
const g = gs();
const end = process.argv[2] ?? '2002-06-30';
const seen = new Set<number>();
const rows: string[] = [];
let all = 0, zero = 0, low = 0, loans = 0, bosman = 0;
const seenNews = new Set<number>();
while (g.date < end) {
  const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
  for (const o of g.offers) {
    if (seen.has(o.id) || o.seller !== g.userClub) continue;
    seen.add(o.id);
    const p = g.players[o.player], b = g.clubs[o.buyer];
    all++; if (o.loan) loans++;
    if (!o.loan && o.fee === 0) zero++; else if (!o.loan && o.fee < 10_000) low++;
    if (!o.loan && o.fee < 10_000) {
      const news = g.news.find((n) => n.link?.kind === 'offer' && n.link.id === o.id);
      rows.push(`${g.date} ${b?.name} → ${p?.first} ${p?.last} fee ${o.fee} max ${o.maxFee} udløb ${p?.contract?.expires} værdi ${p?.value} status ${o.status} cmAi ${!!o.cmAi} cmK ${!!o.cmK} months ${o.months ?? 0} nyhed ${news?.key}`);
    }
  }
  for (const n of g.news) {
    if (seenNews.has(n.id)) continue;
    seenNews.add(n.id);
    if (/bosman|freeAgree|preContract|transfer\.cm7|cmAgreed/i.test(n.key)) { bosman++; rows.push(`${g.date} nyhed ${n.key} ${JSON.stringify(n.params)}`); }
  }
}
console.log(`bud på menneskets spillere: ${all} (lån ${loans}) – beløb 0: ${zero}, 0 < beløb < 10.000: ${low}; Bosman-/kontrakttilbudsnyheder ${bosman}`);
for (const r of rows) console.log(r);
