// Analysen af scripts/k7-dev.ts' uddata: ΔCA pr. aldersgruppe og opdelinger (land, division, PA-afstand, start-CA) – samme personer (nøgle i
// hukommelsen på begge datoer) på hver side.  npx tsx scripts/k7-dev-report.ts <fil.json> [fra] [til] [BY=nat|div|gap|ca|club]
import { readFileSync } from 'node:fs';
import type { DRow } from './k7-dev';

const [file, a0, b0] = process.argv.slice(2);
const J = JSON.parse(readFileSync(file, 'utf8')) as { dates: string[]; o: Record<string, DRow[]>; u: Record<string, DRow[]> };
const A = a0 ?? J.dates[0], B = b0 ?? J.dates[J.dates.length - 1];
const AGES: [number, number, string][] = [[0, 16, '≤15'], [16, 17, '16'], [17, 18, '17'], [18, 21, '18–20'], [21, 27, '21–26'], [27, 31, '27–30'], [31, 99, '31+']];
const ageLab = (a: number) => AGES.find(([lo, hi]) => a >= lo && a < hi)?.[2] ?? '?';
type Pair = { a: DRow; b: DRow };
function pairs(side: 'o' | 'u'): Pair[] {
  const bm = new Map(J[side][B].map((r) => [r.key, r]));
  const out: Pair[] = [];
  for (const a of J[side][A]) { const b = bm.get(a.key); if (b) out.push({ a, b }); }
  return out;
}
const P = { o: pairs('o'), u: pairs('u') };
const start = { o: new Set(J.o[A].map((r) => r.key)), u: new Set(J.u[A].map((r) => r.key)) };
let cur: 'o' | 'u' = 'o';
const TIER: Record<string, string> = { 'English Premier Division': 'E1', 'English First Division': 'E2', 'English Second Division': 'E3', 'English Third Division': 'E4' };
const tier = (d: string) => TIER[d] ?? 'non-league';
const BYS: Record<string, (p: Pair) => string> = {
  all: () => 'alle',
  nat: (p) => (p.a.nat === 'England' ? 'England' : p.a.nat ? 'udland' : 'klubløs'),
  div: (p) => (p.a.nat === 'England' ? tier(p.a.div) : p.a.nat ? 'udland' : 'klubløs'),
  gap: (p) => { const g = p.a.pa - p.a.ca; return g <= 0 ? 'gap ≤0' : g < 10 ? 'gap 1–9' : g < 30 ? 'gap 10–29' : g < 60 ? 'gap 30–59' : 'gap 60+'; },
  ca: (p) => { const c = p.a.ca; return c < 40 ? 'CA <40' : c < 70 ? 'CA 40–69' : c < 100 ? 'CA 70–99' : c < 130 ? 'CA 100–129' : 'CA 130+'; },
  pa: (p) => { const c = p.a.pa; return c < 80 ? 'PA <80' : c < 110 ? 'PA 80–109' : c < 140 ? 'PA 110–139' : 'PA 140+'; },
  gen: (p) => (start[cur === 'o' ? 'u' : 'o'].has(p.a.key) ? 'database' : 'ny/generert'),
  moved: (p) => (p.a.club === p.b.club ? 'samme klub' : 'skiftet'),
};
const byKeys = (process.env.BY ?? 'all,nat,div,gap,ca,pa').split(',');
const mean = (xs: number[]) => (xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : NaN);
const f = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : '–');
console.log(`ΔCA ${A} → ${B}: vores / oraklet (antal)   fælles: ${P.u.length} / ${P.o.length}`);
const filt = process.env.ONLY ? new Function('p', `return ${process.env.ONLY}`) as (p: Pair) => boolean : () => true;
for (const by of byKeys) {
  const fn = BYS[by];
  const groups = new Set<string>();
  for (const s of ['o', 'u'] as const) { cur = s; for (const p of P[s]) if (filt(p)) groups.add(fn(p)); }
  console.log(`\n## ${by}`);
  console.log(['gruppe', ...AGES.map((x) => x[2])].join('\t'));
  for (const gname of [...groups].sort()) {
    const cells = AGES.map(([lo, hi]) => {
      const sel = (s: 'o' | 'u') => (cur = s, P[s]).filter((p) => filt(p) && fn(p) === gname && p.a.age >= lo && p.a.age < hi).map((p) => p.b.ca - p.a.ca);
      const u = sel('u'), o = sel('o');
      return `${f(mean(u))}/${f(mean(o))} (${u.length}/${o.length})`;
    });
    console.log([gname, ...cells].join('\t'));
  }
}
void ageLab;
