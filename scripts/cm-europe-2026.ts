// 2026/27 i ægte tilstand (20/11, "Altid som originalen"): originalens kalender og Europas turneringer (cmCalendarOn/cmEurope.ts) – deltagerne pr.
// land, runderne (lodtrækning og kampdatoer), dobbeltbookinger mod ligaprogrammet (to kampe for samme klub samme dag eller dagene efter hinanden),
// præmiepengene i Europa (Prize Money, £ og €) og ligaernes skema.
//   npx tsx scripts/cm-europe-2026.ts [til-dato] [klub] [frø] [lande, fx England,Denmark]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { compHooks } from '../src/game/hooks';
import { cmCalendarOn } from '../src/game/cmCalendar';
import { cmEuroOn } from '../src/game/cmEurope';
import { cmGbp } from '../src/game/cmMoney';
import type { Fixture } from '../src/game/types';

const until = process.argv[2] ?? '2026-12-31';
const name = process.argv[3] ?? 'Brentford';
const seed = Number(process.argv[4] ?? 1);
const lands = (process.argv[5] ?? 'England,Denmark').split(',');
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const nat = lands.map((n) => w.nations.findIndex((x) => x.name === n));
const club = w.clubs.find((c) => c[1] === name || c[2] === name)![0] as number;
createGame(w, { managerName: 'Test Smoke', managerNation: nat[0], clubId: club, activeNations: nat, lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const EURO = ['CL', 'UEFA', 'UIC', 'ESC', 'UECL'];
console.log(`start ${g.date} · kalender ${cmCalendarOn(g) ? 'originalens' : 'spillets'} · Europa ${cmEuroOn(g) ? 'originalens' : 'spillets'} · ${EURO.filter((id) => g.comps[id]).map((id) => `${id} ${g.comps[id].clubs.length}`).join(', ')}`);
const nm = (c: number) => g.clubs[c]?.name ?? `#${c}`;
const natName = (c: number) => g.nations[g.clubs[c]?.nation ?? -1]?.name ?? '?';
for (const id of EURO) {
  const c = g.comps[id];
  if (!c) continue;
  const per: Record<string, number> = {};
  for (const x of c.clubs) per[natName(x)] = (per[natName(x)] ?? 0) + 1;
  const entry = (c.meta?.entry ?? {}) as Record<string, number[]>;
  console.log(`${id}: ${c.clubs.length} hold · indgang ${Object.entries(entry).map(([k, v]) => `${k} ${v.length}`).join(', ')} · pr. land ${Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  for (const n of lands) console.log(`  ${n}: ${c.clubs.filter((x) => natName(x) === n).map((x) => { const st = Object.entries(entry).find(([, v]) => v.includes(x))?.[0]; return `${nm(x)}${st ? ` (${st})` : ''}`; }).join(', ') || '–'}`);
}
// præmiepengene i Europa (compHooks.prize: gruppespil/kampe; cupTieDone: runderne – cmFinance.ts bogfører i £)
const prize: Record<number, number> = {};
const origPrize = compHooks.prize;
compHooks.prize = (c, amt) => { if (g.comps.CL || g.comps.UEFA) prize[c] = (prize[c] ?? 0) + amt; origPrize?.(c, amt); };
const origTie = compHooks.cupTieDone;
compHooks.cupTieDone = (comp, f, wi, lo) => {
  const euro = !!comp.meta?.cmEuro;
  const b = euro ? [wi, lo].map((x) => g.clubs[x]?.finance.prize ?? 0) : [];
  origTie?.(comp, f, wi, lo);
  if (euro) [wi, lo].forEach((x, i) => { const d = (g.clubs[x]?.finance.prize ?? 0) - b[i]; if (d) prize[x] = (prize[x] ?? 0) + d * cmGbp(g, x); });
};
const t0 = performance.now();
let days = 0;
while (g.date < until && days++ < 420) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
}
console.log(`--- slut ${g.date} (${Math.round((performance.now() - t0) / 1000)} s, ${days} dage)`);
// runderne: lodtrækning og kampdatoer pr. trin
const fx = Object.values(g.fixtures);
for (const id of EURO) {
  const c = g.comps[id];
  if (!c) continue;
  const drawn = (c.meta?.drawn ?? {}) as Record<string, string>;
  const byStage = new Map<string, Fixture[]>();
  for (const f of fx) if (f.comp === id) { const k = f.stage ?? '?'; byStage.set(k, [...(byStage.get(k) ?? []), f]); }
  const parts = [...byStage.entries()].sort((a, b) => (a[1][0].date < b[1][0].date ? -1 : 1)).map(([k, v]) => {
    const ds = [...new Set(v.map((f) => f.date))].sort();
    return `${k} ${v.length} kampe (${v.filter((f) => f.result).length} spillet) ${ds[0]}…${ds[ds.length - 1]}`;
  });
  console.log(`${id} trin ${String(c.meta?.step)} · lodtrukket ${JSON.stringify(drawn)}\n  ${parts.join('\n  ')}`);
  if (c.winner) console.log(`  vinder ${nm(c.winner)}`);
}
// dobbeltbookinger: samme klub to kampe samme dag (eller dagen efter hinanden) – alle klubber i de spilbare lande
const byClub = new Map<number, Fixture[]>();
for (const f of fx) for (const c of [f.home, f.away]) { if (!g.clubs[c] || !nat.includes(g.clubs[c].nation)) continue; byClub.set(c, [...(byClub.get(c) ?? []), f]); }
let same = 0, adj = 0;
const ex: string[] = [];
for (const [c, list] of byClub) {
  list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  for (let i = 1; i < list.length; i++) {
    const d = (Date.parse(list[i].date) - Date.parse(list[i - 1].date)) / 864e5;
    if (d === 0) { same++; if (ex.length < 8) ex.push(`${nm(c)} ${list[i].date} ${list[i - 1].comp}+${list[i].comp}`); }
    else if (d === 1) { adj++; if (ex.length < 8) ex.push(`${nm(c)} ${list[i - 1].date}/${list[i].date} ${list[i - 1].comp}+${list[i].comp}`); }
  }
}
console.log(`dobbeltbookinger (spilbare lande): samme dag ${same}, dagen efter ${adj}${ex.length ? ` · fx ${ex.join('; ')}` : ''}`);
// ligaernes skema og menneskets kampe
for (const id of Object.keys(g.comps)) {
  const c = g.comps[id];
  if (c.type !== 'league' || !nat.includes(c.nation)) continue;
  const ds = fx.filter((f) => f.comp === id).map((f) => f.date).sort();
  console.log(`liga ${id} ${c.name}: ${c.clubs.length} klubber · originalens skema ${c.meta?.cmSched ? 'ja' : 'nej'} · ${ds.length} kampe ${ds[0]}…${ds[ds.length - 1]}`);
}
const cups = Object.values(g.comps).filter((c) => c.type === 'cup' && nat.includes(c.nation));
for (const c of cups) {
  const ds = fx.filter((f) => f.comp === c.id).map((f) => f.date).sort();
  console.log(`pokal ${c.id} ${c.name}: ${c.clubs.length} hold · ${ds.length} kampe ${ds[0] ?? '–'}…${ds[ds.length - 1] ?? '–'} · originalens tabel ${c.meta?.cmCup ?? 'nej'}`);
}
const mine = fx.filter((f) => f.home === g.userClub || f.away === g.userClub).sort((a, b) => (a.date < b.date ? -1 : 1));
console.log(`${name}: ${mine.length} kampe · ${mine.filter((f) => EURO.includes(f.comp)).map((f) => `${f.date} ${f.comp} ${f.stage} ${nm(f.home)}-${nm(f.away)}`).join('; ') || 'ingen i Europa'}`);
// præmiepenge
const pz = Object.entries(prize).map(([c, v]) => [Number(c), v] as const).sort((a, b) => b[1] - a[1]);
const sum = pz.reduce((s, x) => s + x[1], 0);
console.log(`præmiepenge i Europa: ${pz.length} klubber, i alt £${(sum / 1e6).toFixed(1)}M · top ${pz.slice(0, 6).map(([c, v]) => `${nm(c)} £${(v / 1e6).toFixed(2)}M (€${(v / cmGbp(g, c) / 1e6).toFixed(2)}M)`).join(', ')}`);
for (const n of lands) {
  const l = pz.filter(([c]) => natName(c) === n);
  if (l.length) console.log(`  ${n}: ${l.map(([c, v]) => `${nm(c)} £${(v / 1e6).toFixed(2)}M`).join(', ')}`);
}
