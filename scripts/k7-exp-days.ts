// (fejlsøgning) oraklets nye mål hos andre klubber: dage til kontraktens udløb ved første dag som mål, pr. udløbsdato
//   ONLY: npx tsx scripts/k7-exp-days.ts   (FROM/UNTIL/DAYSNAP)
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract } from '../src/game/cmMem';
import type { SparseMem } from '../src/game/cmMem';
const FROM = process.env.FROM ?? '2001-07-14', UNTIL = process.env.UNTIL ?? '2002-06-30';
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const snaps = ix.snaps.filter((e) => e.iso >= FROM && e.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso));
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const seen = new Set<string>();
const byExp = new Map<string, Map<number, number>>();
for (const s of snaps) {
  const m: SparseMem = loadDaySnap(ix, s);
  const nc = m.s32(0xae235c), S = m.u32(0xae23bc), n = m.s32(0xae2364);
  const slm = m.u32(m.u32(0xde1f54) + 0x856);
  for (let c0 = 0; c0 < nc; c0++) {
    const base = m.u32(m.u32(slm + 0xdc) + 9 * c0); if (!base) continue;
    for (let i = 0; i < 40; i++) {
      const sl = base + 0x25 * i; if (m.u8(sl) !== 0xb) continue;
      const t = m.s32(sl + 0xf); if (t < 0 || t >= n) continue;
      const kc = getContract(m, S + 0x6e * t); if (!kc) continue;
      if (m.s32(kc + 4) === c0) continue;
      const k = `${c0}|${t}`; if (seen.has(k)) continue; seen.add(k);
      const exp = dayIso(m.s16(kc + 0x2d), m.u16(kc + 0x2f));
      const d = Math.round((Date.parse(exp) - Date.parse(s.iso)) / 86400000);
      const key = exp.slice(5) === '06-30' ? `30/6-${exp.slice(0, 4)}` : exp.slice(0, 7);
      if (!byExp.has(key)) byExp.set(key, new Map());
      const mm = byExp.get(key)!; mm.set(d, (mm.get(d) ?? 0) + 1);
    }
  }
  process.stderr.write(`${s.iso} `);
}
console.log('');
for (const [k, mm] of [...byExp].sort()) {
  const tot = [...mm.values()].reduce((a, b) => a + b, 0);
  const top = [...mm].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([d, v]) => `${d}d=${v}`).join(' ');
  console.log(`${k}: ${tot} | ${top}`);
}
