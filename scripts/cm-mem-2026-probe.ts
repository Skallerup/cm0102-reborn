// 2026/27: hvor mange klubspillere beholder originalens 0x524d70 (database_trim_staff_tables, Maximum – eller CM_DBSIZE=2) med England valgt,
// pr. klubbens land – mod world.json (som beholder alle). parseCM0102 med den originale databases valg (allClubs, cmMem) på 2026-dataene.
//   [CM_DBSIZE=2] npx tsx scripts/cm-mem-2026-probe.ts [data-mappe]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseCM0102 } from '../src/game/data/cm0102';

const dir = process.argv[2] ?? '/Users/martinskallerup/cm0102/.data-update/October 2026 Data Update';
const files: Record<string, ArrayBuffer> = {};
for (const f of readdirSync(dir)) {
  if (!f.toLowerCase().endsWith('.dat')) continue;
  const b = readFileSync(join(dir, f));
  files[f.toLowerCase()] = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}
const w = parseCM0102(files, { maxTiers: 4, allClubs: true, cmMem: true });
const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as { clubs: [number, string, string, number, string][]; players: unknown[][]; playerFields: string[] };
const inWorld = new Set(world.clubs.map((c) => c[0]));
const eng = w.nations.findIndex((n) => n.name === 'England');
const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
const clubNat = new Map(w.clubs.map((c) => [c[0], c[3] as number]));
const tot = new Map<string, [number, number, number, number]>();   // [world-klubber: alle, beholdt; øvrige klubber: alle, beholdt]
for (const r of w.players) {
  const club = r[F.club] as number; if (!club) continue;
  const n = w.nations[clubNat.get(club) ?? -1]?.name ?? '?';
  const tc = w.ratings[r[F.id] as number]?.tc;
  const kept = tc === undefined || tc === 1 || (Array.isArray(tc) && tc.includes(eng));
  const e = tot.get(n) ?? [0, 0, 0, 0];
  if (inWorld.has(club)) { e[0]++; if (kept) e[1]++; } else { e[2]++; if (kept) e[3]++; }
  tot.set(n, e);
}
console.log(`cmTrim pct ${w.cmTrim?.pct}; klubber i parsen ${w.clubs.length}, i world.json ${world.clubs.length}; spillere ${w.players.length} (world.json ${world.players.length})`);
console.log('land: world.json-klubbernes spillere (beholdt) | øvrige klubbers spillere (beholdt)');
const all = [0, 0, 0, 0];
for (const [n, e] of [...tot].sort((a, b) => b[1][0] - a[1][0])) { e.forEach((x, i) => { all[i] += x; }); if (e[0] >= 200) console.log(`  ${n}: ${e[0]} (${e[1]}) | ${e[2]} (${e[3]})`); }
console.log(`ALLE: ${all[0]} (${all[1]}) | ${all[2]} (${all[3]})`);
