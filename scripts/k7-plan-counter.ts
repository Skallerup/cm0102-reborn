// K7: trupplanens poster (+4 tilstand, +8 tæller) for Englands non-league-klubber i oraklets dagsbilleder.  DATES=2001-07-14,2001-07-15 npx tsx scripts/k7-plan-counter.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
for (const d of (process.env.DATES ?? '2001-07-14,2001-07-15,2001-07-21').split(',')) {
  const m = loadDaySnap(ix, ix.snaps.find((x) => x.iso === d)!);
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), slm = m.u32(m.u32(0xde1f54) + 0x856);
  const h: Record<string, number> = {};
  for (let cix = 0; cix < nc; cix++) {
    const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') continue;
    const dv = m.u32(a + 0x57), dn = dv ? str(m, dv + 4) : '';
    if (/^English (Premier|First|Second|Third) Division/.test(dn)) continue;
    const ent = m.u32(slm + 0xdc) + 9 * cix, base = m.u32(ent);
    let pl = 0; if (base) for (let i = 0; i < 40; i++) if (m.u8(base + 0x25 * i) === 0xb) pl++;
    const k = `st${m.u8(ent + 4)} pl${pl} c${Math.min(m.u8(ent + 8), 99) >= 30 ? '30+' : m.u8(ent + 8)}`; h[k] = (h[k] ?? 0) + 1;
  }
  console.log(d, JSON.stringify(Object.entries(h).sort((a, b) => b[1] - a[1]).slice(0, 12)));
}
