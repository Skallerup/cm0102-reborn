// Sonde: menneskets bud på computerspillere (ægte tilstand, original database, Man Utd, frø 1).
//   npx tsx scripts/probe-human-bid.ts <world.json> <dato> <navne,…|serieb|sverige> [bud-£=40000000]
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { makeBid } from '../src/game/transfers';
import { cmAskingPrice } from '../src/game/cmShortlistGame';
import { GBP } from '../src/game/cmContractInit';
import { loadOrCreate } from './lib/snapshot';

const [worldFile, until = '2001-07-20', names = 'Källström', bidArg = '40000000'] = process.argv.slice(2);
const w = JSON.parse(readFileSync(worldFile, 'utf8')) as WorldData;
const g = loadOrCreate({ world: w, worldFile, club: 'Manchester United', date: until, seed: 1, mode: 'authentic' });
const L = (x: number) => Math.round(x * GBP);
const lg = (cid: number) => g.clubs[cid]?.league ?? '';
let targets = Object.values(g.players).filter((p) => p.club && p.club !== g.userClub && names.split(',').some((n) => `${p.first} ${p.last}`.includes(n)));
if (names === 'serieb' || names === 'sverige') {
  const want = names === 'serieb' ? /Serie B|ITA2|Italian Serie B/i : /Allsvenskan|Swedish|SWE/i;
  const ls = [...new Set(Object.values(g.clubs).map((c) => c.league))];
  console.log('ligaer:', ls.filter((l) => want.test(l)).join(', '));
  targets = Object.values(g.players).filter((p) => p.club && want.test(lg(p.club)) && !p.loan).sort((a, b) => b.value - a.value).slice(0, 8);
}
const ids: number[] = [];
for (const p of targets.slice(0, 8)) {
  const fee = Math.round(+bidArg / GBP);
  const o = makeBid(p.id, fee);
  const k = p.contract;
  console.log(`${g.date} ${p.first} ${p.last} @ ${g.clubs[p.club]?.name} (${lg(p.club)}) værdi £${L(p.value)} asking £${cmAskingPrice(g, p, g.userClub)} bud £${bidArg} kontrakt ${k?.expires} listed ${p.listed ?? ''} loan ${JSON.stringify(p.loan ?? null)} -> ${typeof o === 'string' ? o : 'id ' + o.id + ' svar ' + o.respondBy}`);
  if (typeof o !== 'string') ids.push(o.id);
}
const day0 = g.date;
const d0 = new Date(g.date); d0.setDate(d0.getDate() + 5); const stop = d0.toISOString().slice(0, 10);
let guard = 0;
while ((g.date < stop || !g.dayDone || g.pendingFixture) && guard++ < 4000) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
for (const id of ids) {
  const o = g.offers.find((x) => x.id === id)!; const p = g.players[o.player];
  console.log(`  ${p.first} ${p.last}: ${o.status} counter £${L(o.counter ?? 0)} cmTalks ${JSON.stringify(o.cmTalks ?? null)}`);
}
for (const n of g.news) if (n.date >= day0 && n.cat === 'transfer' && /bid|offer|accept|reject|counter/i.test(n.key)) console.log('  nyhed', n.date, n.key, JSON.stringify(n.params));
