// Oraklets dagsbilleder: engelske klubbers trupplan-pladser (rolle 0xb), lejepladser (+0x24 bit 0), lejemål pr. målets division, åbne bud
// (TRANSFER_MANAGER +0x1f leje) og lejede (spillerens klub +0x39 ≠ hovedkontraktens klub) pr. engelsk division. Mod scripts/cm-loan-2026.ts.
//   DAYSNAP=<mappe> npx tsx scripts/oracle-loan-eng.ts [dato …]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const want = process.argv.slice(2);
const snaps = want.length ? ix.snaps.filter((e) => want.includes(e.iso)) : [ix.snaps[0], ix.snaps[Math.floor(ix.snaps.length / 2)], ix.snaps[ix.snaps.length - 1]];
const str = (m: SparseMem, a: number, n = 51) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
for (const e of snaps) {
  const m = loadDaySnap(ix, e);
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(0xae23bc), n = m.s32(0xae2364);
  const lg = (ca: number) => { if (!ca) return '-'; const nat = str(m, m.u32(ca + 0x53) + 4); return nat === 'England' ? str(m, m.u32(ca + 0x57) + 4).replace('English ', '') : nat; };
  const out: Record<string, Record<string, number>> = {};
  const add = (k: string, f: string) => { const r = (out[k] ??= {}); r[f] = (r[f] ?? 0) + 1; };
  const slm = m.u32(m.u32(0xde1f54) + 0x856), ents = m.u32(slm + 0xdc);
  for (let i = 0; i < nc; i++) {
    const ca = C + 0x245 * i;
    if (str(m, m.u32(ca + 0x53) + 4) !== 'England') continue;
    const k = lg(ca); add(k, 'klubber');
    const base = m.u32(ents + 9 * i); if (!base) continue;
    add(k, 'plan');
    for (let j = 0; j < 40; j++) {
      const s = base + 37 * j;
      if (m.u8(s) !== 0xb) continue;
      add(k, 'pl');
      if (m.u8(s + 0x24) & 1) { add(k, 'lejepl'); const f = m.s32(s + 0xf); if (f > -1) add(k, `lejemål:${lg(m.u32(S + 0x6e * f + 0x39))}`); }
    }
  }
  const tm = m.u32(0xde1f54), tab = m.u32(tm), nb = m.s32(tm + 4);
  for (let i = 0; i < nb; i++) {
    const o = m.u32(tab + 4 * i); if (!o) continue;
    const b = m.s32(o + 8); if (b < 0 || b >= nc) continue;
    const ca = C + 0x245 * b; if (str(m, m.u32(ca + 0x53) + 4) !== 'England') continue;
    add(lg(ca), m.u8(o + 0x1f) ? 'lejebud' : 'købsbud');
  }
  // lejede: hovedkontrakten (staff +0x?? ikke kendt her) – i stedet klubbens trupliste +0xd7: en spiller med +0x39 ≠ klubben står i moderklubbens liste
  for (let i = 0; i < nc; i++) {
    const ca = C + 0x245 * i;
    for (let j = 0; j < 50; j++) {
      const st = m.u32(ca + 0xd7 + 4 * j); if (!st) continue;
      const cur = m.u32(st + 0x39);
      if (cur && cur !== ca && str(m, m.u32(ca + 0x53) + 4) === 'England') add(lg(ca), `udlejet til ${lg(cur)}`);
    }
  }
  console.log(`== ${e.iso}`);
  for (const [k, r] of Object.entries(out).sort()) console.log(`  ${k}: ${Object.entries(r).sort().map(([a, b]) => `${a} ${b}`).join(', ')}`);
}
