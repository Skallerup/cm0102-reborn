// (18/11, MODERN_PARITY punkt 5+6) Udvikling og kondition/skader i et spil i ægte tilstand med en CM-database (2001/02 eller 2026/27-opdateringen):
// CA over tid (top 100 og alle), antal skadede, nye skader (typer og længder) og konditionen ved kampstart i Premier League.
//   npx tsx scripts/dev-fit-cm.ts <2001|2026> [frø = 1] [slutdato] [klub]
// Standard: 2026 → 2027-06-30, Brentford FC; 2001 → 2002-06-30, Wrexham. Måler kun – labHooks påvirker intet i spillet.
import { existsSync, readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { continueGame, labHooks, quickPlayUserMatch } from '../src/game/sim';
import type { Player } from '../src/game/types';

const year = Number(process.argv[2] ?? 2026), seed = Number(process.argv[3] ?? 1);
if (!Number.isFinite(year) || !Number.isFinite(seed)) throw new Error(`år/frø: ${process.argv.slice(2).join(' ')}`);
const until = process.argv[4] || (year >= 2020 ? '2027-06-30' : '2002-06-30');
const clubName = process.argv[5] ?? (year >= 2020 ? 'Brentford FC' : 'Wrexham');
const file = year >= 2020 ? 'public/data/world.json' : 'public/data/world-original.json';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData & { cmRaw?: unknown };
if (year >= 2020 && existsSync('public/data/world-cm.json')) world.cmRaw = (JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw: unknown }).cmRaw;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === clubName)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && g.nations[c.nation]?.name === 'England')!;
const plClubs = new Set(epl.clubs);
const real = (p: Player) => !p.regen && !p.virtual;
const injured = (p: Player) => !!p.injury && p.injury.key !== 'awol';

// konditionen ved kampstart (efter konditionsmodulets aflæsning før udtagelsen) for Premier Leagues startere
const pre = new Map<number, number>();
const kick: number[] = [];
labHooks.preMatch = (f) => { if (f.comp !== epl.id) return; for (const c of [f.home, f.away]) for (const p of squad(c)) pre.set(p.id, p.condition); };
labHooks.report = (f, rep) => { if (f.comp !== epl.id) return; for (const l of rep.players) if (!l.sub) { const v = pre.get(l.id); if (v !== undefined) kick.push(v); } pre.clear(); };

const caRow = () => {
  const cas = Object.values(g.players).filter(real).map((p) => p.ca).sort((a, b) => b - a);
  const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
  const pl = Object.values(g.players).filter((p) => real(p) && plClubs.has(p.club)).map((p) => p.ca);
  return `${g.date}  top100 ${mean(cas.slice(0, 100)).toFixed(2)}  top1000 ${mean(cas.slice(0, 1000)).toFixed(2)}  alle ${mean(cas).toFixed(2)} (${cas.length})  PL-trupper ${mean(pl).toFixed(2)}`;
};
console.log(`${year} frø ${seed} → ${until}, ${clubName}; ${epl.name} (${plClubs.size} klubber)`);
console.log(caRow());
const prevInj = new Map<number, string>();
const fresh: { key: string; days: number }[] = [];
let days = 0, injDays = 0, injPl = 0, lastMonth = g.date.slice(0, 7);
const scan = () => {
  let n = 0, npl = 0;
  for (const p of Object.values(g.players)) {
    if (!real(p)) continue;
    const k = injured(p) ? `${p.injury!.key}` : '';
    if (k) { n++; if (plClubs.has(p.club)) npl++; }
    const was = prevInj.get(p.id) ?? '';
    if (k && k !== was && plClubs.has(p.club)) fresh.push({ key: k, days: p.injury!.total ?? p.injury!.days });
    if (k) prevInj.set(p.id, k); else prevInj.delete(p.id);
  }
  days++; injDays += n; injPl += npl;
};
scan();
fresh.length = 0;                                                    // spilstartens skader tælles ikke som nye
const startInj = Object.values(g.players).filter((p) => real(p) && injured(p));
console.log(`skadede ved start: ${startInj.length} (PL-trupper ${startInj.filter((p) => plClubs.has(p.club)).length})`);
while (g.date < until) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  scan();
  if (g.date.slice(0, 7) !== lastMonth) { lastMonth = g.date.slice(0, 7); console.log(caRow()); }
}
console.log(caRow());
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
console.log(`skadede pr. dag: alle ${(injDays / days).toFixed(1)}, PL-trupper ${(injPl / days).toFixed(2)} (${days} dage)`);
const lens = fresh.map((x) => x.days);
const bucket = (lo: number, hi: number) => lens.filter((d) => d >= lo && d <= hi).length;
console.log(`nye skader i PL-trupperne: ${fresh.length}, længde snit ${mean(lens).toFixed(1)} dage, median ${lens.sort((a, b) => a - b)[Math.floor(lens.length / 2)] ?? 0}; ` +
  `1–7 ${bucket(1, 7)}, 8–28 ${bucket(8, 28)}, 29–90 ${bucket(29, 90)}, >90 ${bucket(91, 1e9)}`);
const byKey = new Map<string, number>();
for (const x of fresh) byKey.set(x.key, (byKey.get(x.key) ?? 0) + 1);
console.log(`typer (${byKey.size}): ${[...byKey].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`kondition ved kampstart (PL, ${kick.length} startere): snit ${mean(kick).toFixed(1)} %, < 90 % ${(100 * kick.filter((v) => v < 90).length / Math.max(1, kick.length)).toFixed(1)} %, < 80 % ${(100 * kick.filter((v) => v < 80).length / Math.max(1, kick.length)).toFixed(1)} %`);
