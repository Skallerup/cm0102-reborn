// nation.dat +0x76 (regionen, fx 0xe = De Britiske Øer) pr. nationsnavn – spejdernes dækning (0x7b7490/0x7f9190, cmScout.ts).
// Brug: npx tsx scripts/build-cm-nation-region.ts [nation.dat] → src/game/data/cmNationRegion.json (posterne er 290 bytes; navnet +4, 51 tegn)
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2] ?? '/Users/martinskallerup/cm0102/.orig-db/Original-3.9.68-Database/nation.dat';
const d = readFileSync(file);
const out: Record<string, number> = {};
for (let o = 0; o + 290 <= d.length; o += 290) {
  const raw = d.subarray(o + 4, o + 55);
  const end = raw.indexOf(0);
  out[raw.subarray(0, end < 0 ? raw.length : end).toString('latin1')] = d[o + 0x76];
}
writeFileSync(new URL('../src/game/data/cmNationRegion.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(Object.keys(out).length, 'nationer');
