// Kampprogrammet dato for dato mod oraklet: antal kampe pr. turnering og dato (oraklets fixtures_<år>.tmp i en daysnap-kørsels files/,
// 79 bytes pr. kamp: +0 turnering, +40 år, +42 dag i året) mod vores (scripts/cm-fixture-dump.ts' JSON).
//   npx tsx scripts/cm-fixture-compare.ts <vores.json> [daysnap-mappe] [turneringer=351,352,353,7,8,9,10]
// Vores turneringer: 351 = CUP-<England> (FA Cup), 352 = LC-60, 353 = CS-60, 7–10 = CM7–CM10. Udskriver pr. turnering totalen og de datoer,
// hvor antallet afviger.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_DAYSNAP } from './oracle-days';

const [ours, dirArg, compArg] = process.argv.slice(2);
const dir = dirArg ?? DEFAULT_DAYSNAP;
const comps = (compArg ?? '351,352,353,7,8,9,10').split(',').map(Number);
const ourId = (c: number) => (c === 351 ? 'CUP-' : c === 352 ? 'LC-60' : c === 353 ? 'CS-60' : `CM${c}`);
const iso = (y: number, d: number) => new Date(Date.UTC(y, 0, 1) + d * 864e5).toISOString().slice(0, 10);
const wd = (s: string) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(`${s}T00:00:00Z`).getUTCDay()];
const O = new Map<number, Map<string, number>>();
const files = join(dir, 'files');
for (const f of readdirSync(files).filter((x) => /^fixtures_\d{4}\.tmp$/.test(x)).sort()) {
  const b = readFileSync(join(files, f)); const v = new DataView(b.buffer, b.byteOffset, b.byteLength); const n = v.getInt32(0, true);
  for (let k = 0; k < n; k++) {
    const o = 4 + k * 79; const c = v.getInt32(o, true);
    if (!comps.includes(c)) continue;
    const d = iso(v.getUint16(o + 40, true), v.getUint16(o + 42, true));
    if (d < '2001-07-01' || d > '2002-06-30') continue;
    const m = O.get(c) ?? new Map<string, number>(); O.set(c, m); m.set(d, (m.get(d) ?? 0) + 1);
  }
}
const fx = JSON.parse(readFileSync(ours, 'utf8')) as { comp: string; date: string }[];
const U = new Map<number, Map<string, number>>();
for (const f of fx) {
  const c = comps.find((x) => (x === 351 ? f.comp.startsWith('CUP-') && f.comp === `CUP-${f.comp.slice(4)}` : f.comp === ourId(x)));
  if (c === undefined || f.date > '2002-06-30') continue;
  if (c === 351 && f.comp !== (process.env.FA ?? 'CUP-60')) continue;
  const m = U.get(c) ?? new Map<string, number>(); U.set(c, m); m.set(f.date, (m.get(f.date) ?? 0) + 1);
}
for (const c of comps) {
  const o = O.get(c) ?? new Map(), u = U.get(c) ?? new Map();
  const tot = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);
  const dates = [...new Set([...o.keys(), ...u.keys()])].sort();
  const diff = dates.filter((d) => (o.get(d) ?? 0) !== (u.get(d) ?? 0));
  console.log(`${c} ${ourId(c)}: oraklet ${tot(o)}, vi ${tot(u)}; samme antal på ${dates.length - diff.length}/${dates.length} datoer`);
  if (process.env.ALL || c >= 351) for (const d of (process.env.ALL ? dates : diff)) console.log(`  ${d} ${wd(d)}  oraklet ${o.get(d) ?? 0}  vi ${u.get(d) ?? 0}`);
}
