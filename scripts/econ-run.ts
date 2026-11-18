// Økonomien over flere sæsoner: hænger penge, værdier og transfers sammen? Sammenlign den originale database
// (2001-priser, econ.ts) med standarddatabasen – forholdstallene bør ligne hinanden.
// Kør: npx tsx scripts/econ-run.ts [sæsoner] [world-fil]
// Flere ligaer (standarddatabasen, valuta €): NATIONS="England,Spain,Germany,Italy,France,Holland,Portugal,Denmark"
// giver en tabel pr. liga og sæson (medianer over klubberne) – benchmark i docs/ECONOMY_2026.md.
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { econ } from '../src/game/econ';
import { setOriginalIncome } from '../src/game/newgame';
if (process.env.INCOME) setOriginalIncome(Number(process.env.INCOME));
import { monthlyFigures } from '../src/game/finance';

const seasons = Number(process.argv[2] ?? 3);
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const natNames = (process.env.NATIONS ?? 'England').split(',').map((s) => s.trim());
const nats = natNames.map((n) => world.nations.findIndex((x) => x.name === n)).filter((i) => i >= 0);
const eng = nats[0];
const user = world.clubs.find((c) => c[1] === 'Brøndby IF')?.[0] ?? world.clubs.at(-1)![0];
createGame(world, { managerName: 'E', managerNation: eng, clubId: user, activeNations: nats, lang: 'da', masking: true, mode: 'extended', seed: 3 });
const g = gs();
const m = (v: number) => `${(v / 1e6).toFixed(1)}m`;
const med = (xs: number[]) => { const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const leagues = () => Object.values(g.comps).filter((c) => c.type === 'league' && c.tier === 1 && nats.includes(c.nation));
const pl = () => leagues().find((c) => c.nation === eng)!;
const MULTI = nats.length > 1;
function report(label: string) {
  const clubs = pl().clubs.map((id) => g.clubs[id]);
  const sv = clubs.map((c) => squad(c.id).reduce((s, p) => s + p.value, 0));
  const wages = clubs.map((c) => squad(c.id).reduce((s, p) => s + (p.contract?.wage ?? 0), 0) * 52);
  const income = clubs.map((c) => { const f = monthlyFigures(c); return (f.tv + f.sponsor + f.merch) * 12; });
  const fees = Object.values(g.players).flatMap((p) => (p.moves ?? []).filter((mv) => mv.date.slice(0, 4) >= String(g.season - 1) && (mv.fee ?? 0) > 0).map((mv) => mv.fee!));
  const best = Object.values(g.players).filter((p) => p.club && pl().clubs.includes(p.club)).sort((a, b) => b.value - a.value)[0];
  console.log(`${label} econ ${econ()} · PL median: trupværdi ${m(med(sv))} · saldo ${m(med(clubs.map((c) => c.balance)))} (saldo/trup ${(med(clubs.map((c) => c.balance)) / med(sv)).toFixed(2)}) · løn/år ${m(med(wages))} · faste indtægter/år ${m(med(income))} (løn/indtægt ${(med(wages) / med(income)).toFixed(2)}) · transferbudget ${m(med(clubs.map((c) => c.transferBudget)))}`);
  const fin = clubs.map((c) => c.lastFinance ?? c.finance);
  const inc = fin.map((f) => f.gate + f.tv + f.prize + f.sponsor + f.merch);
  if (med(inc) > 0) console.log(`   sæsonens omsætning (median) ${m(med(inc))} · løn ${m(med(fin.map((f) => f.wages)))} · løn/omsætning ${(fin.map((f, i) => f.wages / Math.max(1, inc[i])).sort((a, b) => a - b)[Math.floor(fin.length / 2)]).toFixed(2)} · entré ${m(med(fin.map((f) => f.gate)))} · TV ${m(med(fin.map((f) => f.tv)))}`);
  const euro = (id: string) => (g.comps[id]?.clubs ?? []).map((cid) => g.clubs[cid]).filter((c) => c.lastFinance);
  const cl = euro('CL'), el = euro('UEFA'), ecl = euro('UECL');
  const nonEuro = clubs.filter((c) => ![...cl, ...el, ...ecl].includes(c));
  if (cl.length) console.log(`   præmier (liga + Europa) median: CL-klubber ${m(med(cl.map((c) => c.lastFinance!.prize)))} (max ${m(Math.max(...cl.map((c) => c.lastFinance!.prize)))}) · EL ${m(med(el.map((c) => c.lastFinance!.prize)))} · ECL ${m(med(ecl.map((c) => c.lastFinance!.prize)))} · PL-klubber uden Europa ${m(med(nonEuro.map((c) => c.lastFinance!.prize)))}`);
  const t2 = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 2 && c.nation === eng);
  if (t2) { const cs = t2.clubs.map((id) => g.clubs[id]); const f2 = cs.map((c) => c.lastFinance ?? c.finance); const i2 = f2.map((f) => f.gate + f.tv + f.prize + f.sponsor + f.merch); console.log(`   2. række England: omsætning ${m(med(i2))} · løn/oms ${med(f2.map((f, i) => f.wages / Math.max(1, i2[i]))).toFixed(2)} · saldo ${m(med(cs.map((c) => c.balance)))} · i minus ${cs.filter((c) => c.balance < 0).length}/${cs.length}`); }
  console.log(`   dyreste spiller ${best?.last} ${m(best?.value ?? 0)} (CA ${best?.ca}/PA ${best?.pa}) · transfers seneste år: ${fees.length}, median ${m(med(fees))}, max ${m(Math.max(0, ...fees))} (max/trupmedian ${(Math.max(0, ...fees) / med(sv)).toFixed(2)}) · klubber i minus ${clubs.filter((c) => c.balance < 0).length}`);
}
/** Tabel pr. liga (kun flere ligaer): omsætning, fordeling, løn, saldo, transfernetto – medianer over klubberne */
function table(label: string, atStart = false) {
  const share = (n: number, d: number) => (d > 0 ? `${Math.round((100 * n) / d)}%` : '-');
  console.log(`--- ${label}  (mio. €, medianer; regnskabet = den afsluttede sæson, målt 10/7 efter præmier/udbytte; ved start: faste poster ×12 og nuværende lønsum)`);
  console.log('liga'.padEnd(12) + 'oms.med oms.top  gate  tv   præm spons merch  løn   løn/oms rep saldo(med) minus  køb  netto tb(med)  sv(med)');
  for (const lg of leagues()) {
    const clubs = lg.clubs.map((id) => g.clubs[id]);
    const f = clubs.map((c) => {
      if (!atStart) return c.lastFinance ?? c.finance;
      const mf = monthlyFigures(c);
      return { gate: 0, tv: mf.tv * 12, prize: 0, sponsor: mf.sponsor * 12, merch: mf.merch * 12, wages: squad(c.id).reduce((s, p) => s + (p.contract?.wage ?? 0), 0) * 52, transfersIn: 0, transfersOut: 0 };
    });
    const inc = f.map((x) => x.gate + x.tv + x.prize + x.sponsor + x.merch);
    const mi = med(inc);
    const sv = clubs.map((c) => squad(c.id).reduce((s, p) => s + p.value, 0));
    console.log(
      lg.name.slice(0, 11).padEnd(12) + m(mi).padStart(7) + m(Math.max(...inc)).padStart(8)
      + share(med(f.map((x) => x.gate)), mi).padStart(6) + share(med(f.map((x) => x.tv)), mi).padStart(5) + share(med(f.map((x) => x.prize)), mi).padStart(6)
      + share(med(f.map((x) => x.sponsor)), mi).padStart(6) + share(med(f.map((x) => x.merch)), mi).padStart(6)
      + m(med(f.map((x) => x.wages))).padStart(8) + (med(f.map((x, i) => x.wages / Math.max(1, inc[i]))).toFixed(2)).padStart(7)
      + String(med(clubs.map((c) => c.rep))).padStart(4) + m(med(clubs.map((c) => c.balance))).padStart(10) + String(clubs.filter((c) => c.balance < 0).length).padStart(7)
      + m(med(f.map((x) => x.transfersOut))).padStart(8) + m(med(f.map((x) => x.transfersOut - x.transfersIn))).padStart(9) + m(med(clubs.map((c) => c.transferBudget))).padStart(10) + m(med(sv)).padStart(10),
    );
  }
}
report('start');
if (MULTI) {
  table('start', true);
  console.log('--- struktur: rep (min/med/max), pladser (med), billetpris (med), wealth');
  for (const lg of leagues()) {
    const cs = lg.clubs.map((id) => g.clubs[id]);
    const r = cs.map((c) => c.rep).sort((a, b) => a - b);
    console.log(lg.name.slice(0, 11).padEnd(12), r[0], med(r), r[r.length - 1], '· pladser', med(cs.map((c) => c.seats)), '· billet', med(cs.map((c) => c.ticketPrice)));
  }
}
const end = g.season + seasons;
let days = 0;
while (g.season < end && days++ < 420 * seasons) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (g.date.endsWith('-07-10')) { report(String(g.season)); if (MULTI) table(String(g.season)); }
}
