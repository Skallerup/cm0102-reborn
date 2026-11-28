// 2026/27 i ægte tilstand mod originalens 2026-orakel (MODERN_PARITY, ~/cm0102-engine/oracle/out/fin2026): sæsonens Bought/Sold/Signing On/
// Prize Money (originalens blokke g.cmFin[].ty, £) pr. land, PL-klubbernes salg/køb pr. modpartens land og PL-præmierne pr. kilde
// (ligaen, pokalerne, Europa). Kørsel som cm-finance-2026.ts (England valgt, Test Smoke, Brentford, frø 1).
// npx tsx scripts/cm-flow-2026.ts [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { compHooks } from '../src/game/hooks';
import { K } from '../src/game/cmFinance';
import { CM_SETUP_INJURIES, CM_SETUP_LOANS } from '../src/game/data/cmPreseason';

// OLD_PRESEASON=<fil.ts>: en ældre cmPreseason.ts' 2026-lister (før/efter-måling af en genbygning)
if (process.env.OLD_PRESEASON) {
  const txt = readFileSync(process.env.OLD_PRESEASON, 'utf8');
  const obj = (name: string) => JSON.parse(new RegExp(`export const ${name}[^=]*= (\\{.*\\});`).exec(txt)![1]) as Record<string, unknown>;
  (CM_SETUP_INJURIES as Record<string, unknown>)['2026'] = obj('CM_SETUP_INJURIES')['2026'];
  (CM_SETUP_LOANS as Record<string, unknown>)['2026'] = obj('CM_SETUP_LOANS')['2026'];
  console.log(`OLD_PRESEASON: ${(CM_SETUP_LOANS['2026'] ?? []).length} lejer`);
}

const until = process.argv[2] ?? '2027-06-10';
// WORLD=<world-fil> (fx world-original.json – 2001 til sammenligning med oracle-pl-moves.ts); uden: world.json + world-cm.json
// WORLD_CM=<fil> (fx world-cm.json bygget med CM_DBSIZE=2 – oraklets databasestørrelse); NO_MEM26=1: uden spilstartens trim (cmRaw.mem26, som før 28/11)
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
if (!process.env.WORLD) Object.assign(w, JSON.parse(readFileSync(process.env.WORLD_CM ?? 'public/data/world-cm.json', 'utf8')));
if (process.env.NO_MEM26 && w.cmRaw) delete (w.cmRaw as { mem26?: unknown }).mem26;
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const M = (v: number) => (v / 1e6).toFixed(1);
const PL = new Set(Object.values(g.clubs).filter((c) => c.league === 'CM7').map((c) => c.id));
const natName = (n: number) => g.nations[n]?.name ?? String(n);
const start0 = new Map(Object.values(g.players).map((p) => [p.id, p.club]));
// databasens klub (world-rækken) – som oraklets save-udtræk (staff.dat +57 mod den gemte +57): også databasens lejer (player_setup.cfg) tæller
const FW = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
const db0 = new Map(w.players.map((r) => [r[FW.id] as number, r[FW.club] as number]));
const startLoans = new Map<string, number>();
for (const p of Object.values(g.players)) if (p.loan && PL.has(p.loan.from)) { const t = g.clubs[p.club]; const k = !t ? '-' : PL.has(t.id) ? 'PL' : natName(t.nation) === 'England' ? `ENG ${t.league}` : natName(t.nation); startLoans.set(k, (startLoans.get(k) ?? 0) + 1); }
console.log(`PL-klubbernes udlejede ved start: ${[...startLoans.values()].reduce((a, b) => a + b, 0)} – ${[...startLoans].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`start ${g.date} · PL ${PL.size} klubber: ${[...PL].map((id) => g.clubs[id].name).join(', ')}`);
console.log(`aktive lande ${(g.activeNations ?? []).map(natName).join(', ')}`);

// PL-præmierne pr. kilde: krogene pakkes ind, og PL-klubbernes Prize-blok måles før/efter
const prizeBy = new Map<string, number>();
const plPrize = () => { let s = 0; for (const id of PL) s += g.cmFin?.[id]?.ty[K.prize] ?? 0; return s; };
const wrap = <A extends unknown[]>(label: (...a: A) => string, fn: ((...a: A) => void) | undefined) => fn && ((...a: A) => {
  const b = plPrize(); fn(...a); const d = plPrize() - b; if (d) prizeBy.set(label(...a), (prizeBy.get(label(...a)) ?? 0) + d);
});
compHooks.leagueDone = wrap((c) => `liga ${c.name}`, compHooks.leagueDone);
compHooks.cupTieDone = wrap((c) => `pokal ${c.name}`, compHooks.cupTieDone);
compHooks.prize = wrap(() => 'Europa gruppe/point (compHooks.prize)', compHooks.prize);

let snap: { ty: Record<number, number[]>; date: string } | null = null;
const take = () => { snap = { date: g.date, ty: Object.fromEntries(Object.entries(g.cmFin ?? {}).map(([id, r]) => [id, [...r.ty]])) }; };
const startSeason = g.season;
const hooked = () => [...prizeBy.entries()].filter(([k]) => k !== 'uden krog').reduce((a, [, x]) => a + x, 0);
let days = 0;
while (g.date < until && days++ < 400) {
  if (g.season !== startSeason) break;
  take();
  const b = plPrize(), h = hooked();
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  // det, krogene ikke fangede (fx sim.ts' Europapræmie); efter sæsonskiftet er blokken nulstillet
  const d = plPrize() - b - (hooked() - h);
  if (d && g.season === startSeason) prizeBy.set('uden krog', (prizeBy.get('uden krog') ?? 0) + d);
}
const s = snap!;
console.log(`sæsonblokkene pr. ${s.date}`);
const by = new Map<string, { n: number; v: number[] }>();
for (const [id, ty] of Object.entries(s.ty)) {
  const c = g.clubs[+id]; if (!c) continue;
  const key = natName(c.nation);
  const e = by.get(key) ?? { n: 0, v: new Array(18).fill(0) };
  e.n++; ty.forEach((x, k) => { e.v[k] += x; }); by.set(key, e);
}
const tot = new Array(18).fill(0); let tn = 0;
for (const e of by.values()) { tn += e.n; e.v.forEach((x, k) => { tot[k] += x; }); }
console.log(`ALLE (${tn} klubber med økonomi): køb ${M(tot[K.bought])} salg ${M(tot[K.sold])} signon ${M(tot[K.signOn])} præmie ${M(tot[K.prize])}`);
console.log('land: køb salg signon præmie (klubber)');
for (const [k, e] of [...by.entries()].sort((a, b) => (b[1].v[0] + b[1].v[1]) - (a[1].v[0] + a[1].v[1])).slice(0, 30))
  console.log(`  ${k} ${M(e.v[K.bought])} ${M(e.v[K.sold])} ${M(e.v[K.signOn])} ${M(e.v[K.prize])} (${e.n})`);
const pl = [...PL].map((id) => ({ c: g.clubs[id], ty: s.ty[id] ?? new Array(18).fill(0) }));
const sum = (k: number) => pl.reduce((a, x) => a + x.ty[k], 0);
console.log(`PL: køb ${M(sum(K.bought))} salg ${M(sum(K.sold))} signon ${M(sum(K.signOn))} præmie ${M(sum(K.prize))}`);
for (const x of pl.sort((a, b) => b.ty[K.sold] - a.ty[K.sold])) console.log(`  ${x.c.name} ${M(x.ty[K.bought])} ${M(x.ty[K.sold])} ${M(x.ty[K.signOn])} ${M(x.ty[K.prize])}`);
console.log('PL-præmier pr. kilde (£):');
for (const [k, v] of [...prizeBy.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k} ${M(v)}`);
// handlerne (Player.moves, €) med en PL-klub på den ene side, pr. modpartens land
const sold = new Map<string, [number, number]>(), bought = new Map<string, [number, number]>();
let nAll = 0;
for (const p of Object.values(g.players)) for (const m of p.moves ?? []) {
  if (m.season !== startSeason || m.loan || m.date > s.date) continue;
  nAll++;
  const f = g.clubs[m.from], t = g.clubs[m.to];
  if (PL.has(m.from) && t) { const k = PL.has(m.to) ? 'PL' : natName(t.nation); const e = sold.get(k) ?? [0, 0]; e[0]++; e[1] += m.fee; sold.set(k, e); }
  if (PL.has(m.to) && f && !PL.has(m.from)) { const k = natName(f.nation); const e = bought.get(k) ?? [0, 0]; e[0]++; e[1] += m.fee; bought.set(k, e); }
}
const fx = g.cmGbp?.leagues.CM7 ?? 1;
console.log(`handler i sæsonen ${nAll}; PL-klubbernes salg pr. købers land (antal, £):`);
for (const [k, [n, v]] of [...sold.entries()].sort((a, b) => b[1][1] - a[1][1])) console.log(`  ${k} ${n} ${M(v * fx)}`);
console.log('PL-klubbernes køb (uden for PL) pr. sælgers land (antal, £):');
for (const [k, [n, v]] of [...bought.entries()].sort((a, b) => b[1][1] - a[1][1])) console.log(`  ${k} ${n} ${M(v * fx)}`);
// som oraklets save-udtræk (staff +57 ved start og slut): PL-spillere i en anden klub ved slut (også lejede), pr. det nye lands navn
const out = new Map<string, [number, number]>();
for (const p of Object.values(g.players)) {
  const c0 = start0.get(p.id);
  if (c0 === undefined || !PL.has(c0) || p.club === c0) continue;
  const t = p.club ? g.clubs[p.club] : undefined;
  const k = !t ? 'klubløs' : PL.has(t.id) ? 'PL' : natName(t.nation);
  const e = out.get(k) ?? [0, 0]; e[0]++; if (p.loan) e[1]++; out.set(k, e);
}
const outDb = new Map<string, [number, number]>();
for (const p of Object.values(g.players)) {
  const c0 = db0.get(p.id);
  if (c0 === undefined || !PL.has(c0) || p.club === c0) continue;
  const t = p.club ? g.clubs[p.club] : undefined;
  const k = !t ? 'klubløs' : PL.has(t.id) ? 'PL' : natName(t.nation) === 'England' ? `ENG ${t.league}` : natName(t.nation);
  const e = outDb.get(k) ?? [0, 0]; e[0]++; if (p.loan) e[1]++; outDb.set(k, e);
}
console.log(`som oraklets udtræk – databasens PL-spillere i en anden klub ved slut: ${[...outDb.values()].reduce((a, b) => a + b[0], 0)} (antal, heraf lejet):`);
for (const [k, [n, l]] of [...outDb.entries()].sort((a, b) => b[1][0] - a[1][0])) console.log(`  ${k} ${n} (${l})`);
console.log('PL-spillere i en ny klub ved slut pr. land (antal, heraf lejet):');
for (const [k, [n, l]] of [...out.entries()].sort((a, b) => b[1][0] - a[1][0])) console.log(`  ${k} ${n} (${l})`);
