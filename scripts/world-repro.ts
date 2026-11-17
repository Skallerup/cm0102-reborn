// Kan de originale world-filer genbygges? Bygger hver fil igen fra kilden (scripts/build-cm-data.mts, én ad gangen) i en midlertidig mappe og
// sammenligner med den committede – uafhængigt af nøglernes rækkefølge. Afviger de, skrives hvad en genbygning vil ændre (felter, klubber og
// spillere ind/ud), og scriptet slutter med kode 1.
//
// Brug: npx tsx scripts/world-repro.ts [world-original|3965|3968 …] [--keep]
//   ORIG_DB=<mappe>   hvor .orig-db ligger (standard: .orig-db i arbejdsmappen)
//   CM_DATA_3965=<mappe>  officielle 3.9.65 (standard: appens game/Data-3.9.65)
//
// Kilderne (CLAUDE.md, memory original-databases): 3.9.60 = Swedish_fixed, 3.9.65 = appens officielle Data-3.9.65 (den committede fil er
// bygget derfra), 3.9.68 = .orig-db/Original-3.9.68-Database med NO_LEGACY=1. Byggeloggen scripts/data/world-builds.json har kilden pr. fil.
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ORIG = process.env.ORIG_DB ?? '.orig-db';
const APP65 = '/Applications/CM 01-02 Bosman Edition.app/Contents/Resources/game/Data-3.9.65';
const TARGETS: { file: string; source: string; env?: Record<string, string> }[] = [
  { file: 'world-original.json', source: `${ORIG}/Original-3.9.60-Database-Swedish_fixed` },
  { file: 'world-original-3965.json', source: process.env.CM_DATA_3965 ?? APP65 },
  { file: 'world-original-3968.json', source: `${ORIG}/Original-3.9.68-Database`, env: { NO_LEGACY: '1' } },
];

const args = process.argv.slice(2);
const keep = args.includes('--keep');
const pick = args.filter((a) => !a.startsWith('--'));
const targets = pick.length ? TARGETS.filter((t) => pick.some((p) => t.file.includes(p))) : TARGETS;

/** JSON med sorterede nøgler (rækkefølgen af felterne i et objekt betyder intet for spillet) */
function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon((v as Record<string, unknown>)[k])}`).join(',')}}`;
  return JSON.stringify(v);
}
const rowId = (r: unknown, i: number) => (Array.isArray(r) ? canon(r[0]) : r && typeof r === 'object' ? canon((r as { id?: unknown; name?: unknown }).id ?? (r as { name?: unknown }).name ?? i) : String(i));

/** de afvigende felter: "felt: N kun committet, M kun nye, K ændret" */
function diff(a: Record<string, unknown>, b: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k], y = b[k];
    if (canon(x) === canon(y)) continue;
    if (x === undefined || y === undefined) { out.push(`${k}: ${x === undefined ? 'kun i den nye' : 'kun i den committede'}`); continue; }
    if (Array.isArray(x) && Array.isArray(y)) {
      const A = new Map(x.map((r, i) => [rowId(r, i), canon(r)])), B = new Map(y.map((r, i) => [rowId(r, i), canon(r)]));
      const oa = [...A.keys()].filter((i) => !B.has(i)).length, ob = [...B.keys()].filter((i) => !A.has(i)).length;
      const d = [...A.keys()].filter((i) => B.has(i) && A.get(i) !== B.get(i)).length;
      out.push(`${k}: ${x.length} → ${y.length} rækker (${oa} ud, ${ob} ind, ${d} ændret${!oa && !ob && !d ? ', kun rækkefølgen' : ''})`);
    } else if (x && y && typeof x === 'object' && typeof y === 'object') {
      const X = x as Record<string, unknown>, Y = y as Record<string, unknown>;
      const ks = new Set([...Object.keys(X), ...Object.keys(Y)]);
      let oa = 0, ob = 0, d = 0;
      for (const j of ks) { if (!(j in Y)) oa++; else if (!(j in X)) ob++; else if (canon(X[j]) !== canon(Y[j])) d++; }
      out.push(`${k}: ${oa} nøgler ud, ${ob} ind, ${d} ændret`);
    } else out.push(`${k}: ${JSON.stringify(x)?.slice(0, 80)} → ${JSON.stringify(y)?.slice(0, 80)}`);
  }
  return out;
}

/** klubber og spillere ind/ud med navn (de første 12) */
function people(a: any, b: any): string[] {
  const out: string[] = [];
  const club = (w: any, id: number) => w.clubs.find((c: any[]) => c[0] === id)?.[1] ?? (id ? `#${id}` : 'klubløs');
  for (const [what, rows] of [['klubber', 'clubs'], ['spillere', 'players']] as const) {
    const ia = new Set(a[rows].map((r: any[]) => r[0])), ib = new Set(b[rows].map((r: any[]) => r[0]));
    const ind = b[rows].filter((r: any[]) => !ia.has(r[0])), ud = a[rows].filter((r: any[]) => !ib.has(r[0]));
    const fmt = (w: any, r: any[]) => (rows === 'clubs' ? `${r[1]} (${w.nations[r[3]]?.name ?? '?'}, ${r[4]})` : `${`${r[1]} ${r[2]}`.trim()} ${r[3]} – ${club(w, r[5])}`);
    if (ind.length) out.push(`  ${what} ind (${ind.length}): ${ind.slice(0, 12).map((r: any[]) => fmt(b, r)).join('; ')}${ind.length > 12 ? ' …' : ''}`);
    if (ud.length) out.push(`  ${what} ud (${ud.length}): ${ud.slice(0, 12).map((r: any[]) => fmt(a, r)).join('; ')}${ud.length > 12 ? ' …' : ''}`);
  }
  return out;
}

const tmp = mkdtempSync(join(tmpdir(), 'world-repro-'));
let bad = 0;
for (const t of targets) {
  if (!existsSync(t.source)) { console.log(`${t.file}: kilden mangler (${t.source}) – sprunget over`); continue; }
  const out = join(tmp, t.file);
  const r = spawnSync('npx', ['tsx', 'scripts/build-cm-data.mts', t.source, out, '2001'], { env: { ...process.env, ...t.env }, encoding: 'utf8' });
  if (r.status !== 0) { console.log(`${t.file}: byggeriet fejlede\n${r.stderr}`); bad++; continue; }
  const careers = t.file.replace(/^world/, 'careers');
  const lines: string[] = [];
  for (const f of [t.file, careers]) {
    const committed = join('public/data', f), built = join(tmp, f);
    if (!existsSync(committed) || !existsSync(built)) continue;
    if (readFileSync(committed).equals(readFileSync(built))) continue;
    const a = JSON.parse(readFileSync(committed, 'utf8')), b = JSON.parse(readFileSync(built, 'utf8'));
    const d = diff(a, b);
    if (!d.length) { lines.push(`${f}: samme indhold, kun nøglernes rækkefølge afviger`); continue; }
    lines.push(`${f}: afviger`, ...d.map((x) => `  ${x}`), ...(f === t.file ? people(a, b) : []));
  }
  if (lines.some((l) => l.endsWith(': afviger'))) bad++;
  console.log(lines.length ? lines.join('\n') : `${t.file}: identisk med kilden (${t.source})`);
}
if (!keep) rmSync(tmp, { recursive: true, force: true }); else console.log(`byggede filer: ${tmp}`);
process.exit(bad ? 1 : 0);
