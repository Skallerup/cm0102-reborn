// 2026/27 i ægte tilstand (MODERN_PARITY 4): klubøkonomien over en sæson – klubber i minus (alle og pr. liga), saldo, lønsum mod omsætning,
// tv-penge, præmier, billetindtægt og merchandise pr. liga (spillets €, Club.finance – samme felter med og uden originalens økonomi).
// npx tsx scripts/cm-finance-2026.ts [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import type { ClubFinance } from '../src/game/types';

const until = process.argv[2] ?? '2027-06-30';
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const m = (v: number) => `${(v / 1e6).toFixed(1)}m`;
const med = (xs: number[]) => { const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const t0 = performance.now();
console.log(`start ${g.date} · originalens økonomi ${g.cmFin ? 'ja' : 'nej'} · faktor PL ${g.cmGbp?.leagues.CM7 ?? '-'} Ch ${g.cmGbp?.leagues.CM8 ?? '-'}`);
const LGS = ['CM7', 'CM8'];
function balances(label: string) {
  const all = Object.values(g.clubs);
  const parts = LGS.map((lg) => {
    const cs = all.filter((c) => c.league === lg);
    return `${lg === 'CM7' ? 'PL' : 'Ch'} minus ${cs.filter((c) => c.balance < 0).length}/${cs.length} saldo med ${m(med(cs.map((c) => c.balance)))} min ${m(Math.min(...cs.map((c) => c.balance)))} max ${m(Math.max(...cs.map((c) => c.balance)))}`;
  });
  console.log(`${label} ${g.date}: alle klubber i minus ${all.filter((c) => c.balance < 0).length}/${all.length} · ${parts.join(' · ')} · transferbudget PL med ${m(med(all.filter((c) => c.league === 'CM7').map((c) => c.transferBudget)))}`);
}
balances('start');
const startLg = new Map(Object.values(g.clubs).map((c) => [c.id, c.league]));
// sæsonens Club.finance lige før sæsonskiftet nulstiller den
let snap = new Map<number, ClubFinance>();
const take = () => { snap = new Map(Object.values(g.clubs).filter((c) => LGS.includes(c.league)).map((c) => [c.id, { ...c.finance }])); };
const startSeason = g.season;
let days = 0;
while (g.date < until && days++ < 400) {
  if (g.season === startSeason) take();
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (g.date.endsWith('-01-01')) balances('midt');
}
balances('slut');
const K: (keyof ClubFinance)[] = ['gate', 'seasonTickets', 'tv', 'prize', 'sponsor', 'merch', 'interest', 'otherIncome', 'investments', 'transfersIn', 'wages', 'bonuses', 'maintenance', 'other', 'interestOut', 'dividends', 'transfersOut', 'signOn'];
for (const lg of LGS) {
  const fs = [...snap.entries()].filter(([id]) => startLg.get(id) === lg).map(([, f]) => f);
  const tot = (k: keyof ClubFinance) => sum(fs.map((f) => (f[k] as number | undefined) ?? 0));
  const inc = sum(['gate', 'seasonTickets', 'tv', 'prize', 'sponsor', 'merch', 'interest', 'otherIncome', 'investments'].map((k) => tot(k as keyof ClubFinance)));
  console.log(`${lg === 'CM7' ? 'PL' : 'Ch'} (startens ${fs.length} klubber, sæsonen): omsætning ${m(inc)} · løn ${m(tot('wages'))} (${Math.round((tot('wages') / Math.max(1, inc)) * 100)} %) · ${K.map((k) => `${k} ${m(tot(k))}`).join(' · ')}`);
  console.log(`   tv pr. klub med ${m(med(fs.map((f) => f.tv)))} · præmie med ${m(med(fs.map((f) => f.prize)))} · billet med ${m(med(fs.map((f) => f.gate)))} · løn med ${m(med(fs.map((f) => f.wages)))}`);
}
console.log(`tid ${Math.round((performance.now() - t0) / 1000)} s`);
