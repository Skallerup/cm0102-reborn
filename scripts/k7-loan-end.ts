// K7b-rest (a): lejeaftalernes slutdatoer og slutdag i oraklet (s1-3.9.60-e1, daglige billeder) – hvornår slutter lejer med slutdato i juni?
//   npx tsx scripts/k7-loan-end.ts [fra] [til]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const from = process.argv[2] ?? '2002-05-25', to = process.argv[3] ?? '2002-06-30';
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : `?${y}`);
let prev: Map<number, string> | null = null;
for (const e of ix.snaps.filter((s) => s.iso >= from && s.iso <= to)) {
  const m = loadDaySnap(ix, e);
  const n = m.s32(0xae2364), rows = m.u32(0xae2d0c), K = m.u32(m.u32(0xae1050));
  const cur = new Map<number, string>();
  for (let id = 0; id < n; id++) {
    const li = m.s32(rows + 79 * id + 4);
    if (li < 0) continue;
    const k = K + 80 * li;
    cur.set(id, dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)));
  }
  const ends: Record<string, number> = {};
  for (const v of cur.values()) ends[v] = (ends[v] ?? 0) + 1;
  const gone: Record<string, number> = {};
  if (prev) for (const [id, v] of prev) if (!cur.has(id)) gone[v] = (gone[v] ?? 0) + 1;
  const top = Object.entries(ends).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(`${e.iso} lejer ${cur.size} | slut ${top} | sluttet siden forrige: ${JSON.stringify(gone)}`);
  prev = cur;
}
