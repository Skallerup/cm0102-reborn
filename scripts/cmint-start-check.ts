// Player.cmInt ved spilstart mod originalen: spillerposternes interne bytes (+0x1e … +0x43) i den instrumenterede originals SP-linjer
// (match_trace.c RECOMP_SQ_TRACE, dag 194 = spilstartens 0x83a1b0) mod playerInit.ts shownFromStored af databasens gemte værdier med postens
// egen CA, GK (+0xf) og fødder (+0x30/+0x3b) – kun spillere uden manglende egenskaber (fillMissing er tilfældig).
//   npx tsx scripts/cmint-start-check.ts [spor] [world]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { CM_INT_OFFSETS, INTRINSIC_KEYS, shownFromStored } from '../src/game/playerInit';
import { ATTRS } from '../src/game/attributes';

const file = process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/sq1.txt`;
const world = JSON.parse(readFileSync(process.argv[3] || 'public/data/world-original.json', 'utf8'));
// spillets staff-id ≠ databasens: parret på de ikke-interne egenskaber (som i databasen) + CA
const NON: [number, string][] = [[0x1b, 'acceleration'], [0x1c, 'aggression'], [0x1d, 'agility'], [0x1f, 'balance'], [0x20, 'bravery'], [0x21, 'consistency'],
  [0x22, 'corners'], [0x25, 'dirtiness'], [0x28, 'flair'], [0x29, 'freeKicks'], [0x2c, 'importantMatches'], [0x2d, 'injuryProneness'], [0x2e, 'jumping'],
  [0x2f, 'influence'], [0x34, 'naturalFitness'], [0x36, 'pace'], [0x3c, 'stamina'], [0x3d, 'strength'], [0x3f, 'teamwork'], [0x40, 'technique'],
  [0x42, 'versatility'], [0x44, 'workRate']];
const keyOf = (ca: number, get: (o: number, k: string) => number) => `${ca}|` + NON.map(([o, k]) => get(o, k)).join(',');
const byKey = new Map<string, any[]>();
for (const r of Object.values(world.ratings) as any[]) {
  if (NON.some(([, k]) => !(r.attrs[ATTRS.indexOf(k as never)] > 0))) continue;
  const k = keyOf(r.ca, (_o, k) => r.attrs[ATTRS.indexOf(k as never)]);
  byKey.set(k, [...(byKey.get(k) ?? []), r]);
}
const seen = new Set<number>();
let n = 0, ok = 0, skip = 0, byteOk = 0, byteN = 0;
const bad: string[] = [];
for (const line of readFileSync(file, 'utf8').split('\n')) {
  if (!line.startsWith('SP ')) continue;
  const t = line.split(' ');
  const id = +t[1]; if (seen.has(id)) continue; seen.add(id);
  const hex = t[t.length - 1]; if (hex.length !== 0x46 * 2) continue;
  const rec = Array.from({ length: 0x46 }, (_, k) => parseInt(hex.slice(2 * k, 2 * k + 2), 16));
  const ca = rec[5] | (rec[6] << 8);
  const m = byKey.get(keyOf(ca, (o) => rec[o])); if (!m || m.length !== 1) { skip++; continue; }
  const r = m[0];
  if (INTRINSIC_KEYS.some((k) => !(r.attrs[ATTRS.indexOf(k)] > 0))) { skip++; continue; }
  const s8 = (v: number) => (v << 24) >> 24;
  const internals: number[] = [];
  shownFromStored(r.attrs.slice(), ca, s8(rec[0xf]), [rec[0x30], rec[0x3b]], internals);
  const orig = CM_INT_OFFSETS.map((o) => s8(rec[o]));
  n++;
  let same = true;
  orig.forEach((v, j) => { byteN++; if (v === internals[j]) byteOk++; else same = false; });
  if (same) ok++; else if (bad.length < 8) bad.push(`${id} ca ${ca} gk ${s8(rec[0xf])}: orig ${orig.join(',')} | port ${internals.join(',')}`);
}
console.log(`cmInt ved spilstart: ${ok}/${n} spillere ens (${byteOk}/${byteN} værdier); sprunget over ${skip}`);
for (const b of bad) console.log(b);
