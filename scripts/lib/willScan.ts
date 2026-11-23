// K7c #3: spillerens vilje 0x846920(staff, klub, 1, 0, gruppe, &ud) for udlejede og andre mod alle klubber i et sæt – på en hukommelse
// (oraklets dagsbillede eller vores ønskelistehukommelse) med samme faste talrække. Fordeling, ud-bits og pr. udlejet.
import type { CmCtx, CmMem } from '../../src/game/cmMem';
import { slCall } from '../../src/game/cmShortlist';

export interface WillRow { id: number; loan: boolean; club: number; v: number; bits: number }
const OUT = 0x00330000;
export function willScan(c: CmCtx, m: CmMem, ids: number[], clubs: number[], isLoan: (id: number) => boolean, group = 3): WillRow[] {
  const S = m.u32(0xae23bc), C = m.u32(0xae23b4), slm = m.u32(m.u32(0xde1f54) + 0x856);
  const rows: WillRow[] = [];
  for (const id of ids) {
    const st = (S + 0x6e * id) >>> 0;
    for (const ci of clubs) {
      const club = (C + 0x245 * ci) >>> 0;
      if (m.u32(st + 0x39) === club) continue;
      m.w32(OUT, 0);
      let v: number;
      try { v = slCall(c, 0x846920, slm, st, club, 1, 0, group, OUT); } catch { v = NaN; }
      rows.push({ id, loan: isLoan(id), club: ci, v, bits: m.u32(OUT) });
    }
  }
  return rows;
}
export function willReport(rows: WillRow[], name: (id: number) => string): string[] {
  const out: string[] = [];
  for (const L of [true, false]) {
    const r = rows.filter((x) => x.loan === L && Number.isFinite(x.v));
    const vs = r.map((x) => x.v).sort((a, b) => a - b);
    const bits: Record<string, number> = {};
    for (const x of r) for (let b = 0; b < 32; b++) if (x.bits & (1 << b)) { const k = ((1 << b) >>> 0).toString(16); bits[k] = (bits[k] ?? 0) + 1; }
    out.push(`${L ? 'udlejede' : 'andre'}: ${r.length} par, ≥ 3,15 ${r.filter((x) => x.v >= 3.15).length} (${(100 * r.filter((x) => x.v >= 3.15).length / Math.max(1, r.length)).toFixed(1)} %), median ${vs[vs.length >> 1]?.toFixed(3)}, NaN ${rows.filter((x) => x.loan === L && !Number.isFinite(x.v)).length}`);
    out.push(`  ud-bits (andel): ${Object.entries(bits).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${(100 * v / Math.max(1, r.length)).toFixed(0)}%`).join(' ')}`);
  }
  const per = new Map<number, WillRow[]>();
  for (const x of rows) if (x.loan) { const l = per.get(x.id) ?? []; l.push(x); per.set(x.id, l); }
  for (const [id, l] of per) {
    const vs = l.map((x) => x.v).sort((a, b) => a - b);
    out.push(`  ${id} ${name(id)}: ≥ 3,15 ${l.filter((x) => x.v >= 3.15).length}/${l.length}, median ${vs[vs.length >> 1]?.toFixed(3)}, største ${vs[vs.length - 1]?.toFixed(2)}, bits(median-par) ${l.sort((a, b) => a.v - b.v)[l.length >> 1]?.bits.toString(16)}`);
  }
  return out;
}
