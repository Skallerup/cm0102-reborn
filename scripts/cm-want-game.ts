// Ønskekontrakten 0x85fc50 på spillets data (src/game/cmContractGame.ts) mod originalens hukommelse 14/7-2001 for de samme engelske spillere:
//   npx tsx scripts/cm-want-check.ts med OUT=<fil> → originalens tal; så  npx tsx scripts/cm-want-game.ts <fil> [frø]
// Spillerne parres på klub + fødselsdato (+ CA, når navnet ikke er entydigt). Viser ens løn, inden for 2 %/10 %, kontraktlængde og bonusser.
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildWantMem, cmAiTerms } from '../src/game/cmContractGame';

const orig = JSON.parse(readFileSync(process.argv[2], 'utf8')) as Record<string, number[]>;
const seed = +(process.argv[3] ?? 1);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
console.log(`spillet: ${g.date}`);
// originalens nøgler uden CA (klub|dag|år) – kun entydige
const o2 = new Map<string, number[] | null>();
for (const [k, v] of Object.entries(orig)) { const kk = k.split('|').slice(0, 3).join('|'); o2.set(kk, o2.has(kk) ? null : v); }
const clubs = Object.values(g.clubs).filter((c) => c.nation === eng && !g.leagues[c.league]?.hidden).map((c) => c.id);
const M = buildWantMem(g, clubs);
const isoDay = (iso: string) => { const y = +iso.slice(0, 4); return [Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000), y]; };
let n = 0, eq = 0, p2 = 0, p10 = 0, yrs = 0, bon = 0, cur = 0;
const ratios: number[] = [], bad: string[] = [];
for (const p of Object.values(g.players)) {
  const home = p.loan?.from ?? p.club;
  if (!home || !clubs.includes(home) || !p.contract || p.regen) continue;
  const [d, y] = isoDay(p.dob);
  const o = orig[`${g.clubs[home].name}|${d}|${y}|${p.ca}`] ?? o2.get(`${g.clubs[home].name}|${d}|${y}`);
  if (!o) continue;
  const t = cmAiTerms(g, p, home, { mem: M, desired: true });
  if (!t) continue;
  n++;
  const ow = o[2], gw = t.raw.wage;
  if (ow === gw) eq++;
  if (Math.abs(ow - gw) <= Math.max(1, ow * 0.02)) p2++;
  if (Math.abs(ow - gw) <= Math.max(1, ow * 0.1)) p10++;
  ratios.push(gw / Math.max(1, ow));
  if (+t.expires.slice(0, 4) === o[6]) yrs++;
  if ((t.bonusGbp[0] > 0) === (o[3] > 0) && (t.bonusGbp[1] > 0) === (o[4] > 0) && (t.bonusGbp[2] > 0) === (o[5] > 0)) bon++;
  if (Math.abs(Math.round(p.contract.wage * 0.86) - o[13]) <= Math.max(1, o[13] * 0.02)) cur++;
  if (Math.abs(ow - gw) > ow * 0.1 && bad.length < 30) bad.push(`${p.first} ${p.last} (${g.clubs[home].name}, CA ${p.ca}, nu £${Math.round(p.contract.wage * 0.86)}/orig £${o[13]}): £${gw} mod £${ow}, år ${t.expires.slice(0, 4)}/${o[6]}`);
}
ratios.sort((a, b) => a - b);
const q = (x: number) => ratios[Math.floor(x * (ratios.length - 1))]?.toFixed(2);
console.log(`parret ${n}: ønskelønnen ens ${eq}, inden for 2 % ${p2}, inden for 10 % ${p10}; forholdet 10/50/90 % ${q(0.1)}/${q(0.5)}/${q(0.9)}`);
console.log(`udløbsår ens ${yrs}, bonustyperne ens ${bon}; nuværende løn ens (2 %) ${cur}`);
for (const b of bad) console.log('  ' + b);
