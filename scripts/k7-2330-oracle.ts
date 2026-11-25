// (fejlsøgning) Oraklets [0xae2330] (dato) og [0xae233c] pr. dagsbillede – 0x868210's Bosman-dato.   npx tsx scripts/k7-2330-oracle.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : `${y}/${d}`);
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
let last = '';
for (const e of ix.snaps.filter((x) => x.kind === 'k').sort((a, b) => a.iso.localeCompare(b.iso))) {
  const m = loadDaySnap(ix, e);
  const v = `${dayIso(m.s16(0xae2330), m.s16(0xae2332))} 233c=${m.u8(0xae233c)}`;
  if (v !== last) { console.log(e.iso, v); last = v; }
  (m as { release?: () => void }).release?.();
}
