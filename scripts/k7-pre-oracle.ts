// (fejlsøgning) Oraklets kontrakttilbud (+0x2f ≠ 0) fra computerklubber til spillere MED kontrakt, pr. måned (første dag set), sælgergruppe,
// CA-bånd og dage til kontraktens udløb; Arsenal (menneskets klub på ferie) for sig. Kun oraklet.
//   FROM=2001-07-14 UNTIL=2002-06-30 npx tsx scripts/k7-pre-oracle.ts   (DAYSNAP=mappe, JSON=fil)
import { writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';

const FROM = process.env.FROM ?? '2001-07-14', UNTIL = process.env.UNTIL ?? '2002-06-30';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const snaps = ix.snaps.filter((e) => e.iso >= FROM && e.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso));
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
interface R { first: string; buyer: string; bg: string; seller: string; sg: string; ca: number; age: number; exp: string; days: number; ct: number; tm: number; fee: number; states: string[]; fut?: boolean }
const seen = new Map<string, R>(), skip = new Set<string>();
for (const e of snaps) {
  const m = loadDaySnap(ix, e);
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(0xae23bc);
  const grp = (cix: number) => { if (cix < 0 || cix >= nc) return '-'; const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
  const tm = m.u32(0xde1f54), offers = m.u32(tm), nOff = m.s32(tm + 4);
  for (let i = 0; i < nOff; i++) {
    const o = m.u32(offers + 4 * i); if (!o) continue;
    if (m.u8(o + 0x11) !== 0xb || !m.u8(o + 0x2f) || m.u8(o + 0x1f)) continue;
    const buyer = m.s32(o + 8), pl = m.s32(o + 0xc), st = S + 0x6e * pl, k = getContract(m, st);
    const key = `${buyer}/${pl}`;
    // (kun spillere med kontrakt, da buddet blev set første gang)
    if (!k || skip.has(key)) { if (!seen.has(key)) skip.add(key); continue; }
    const sc = m.s32(k + 4);
    let r = seen.get(key);
    if (!r) {
      const exp = dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)), rec = m.u32(st + 0x61);
      r = { first: e.iso, buyer: str(m, C + 0x245 * buyer + 4), bg: grp(buyer), seller: str(m, C + 0x245 * sc + 4), sg: grp(sc), ca: rec ? m.s16(rec + 5) : -1, age: (m.u8(st + 0x18) << 24) >> 24, exp,
        days: exp ? Math.round((Date.parse(exp) - Date.parse(e.iso)) / 864e5) : -1, ct: (m.u8(k + 0x35) << 26) >> 26, tm: m.u8(o + 0x30) & 0xf, fee: m.s32(o + 0x1b), states: [] };
      seen.set(key, r);
    }
    const s = m.u8(o + 0x2c).toString(16);
    if (r.states[r.states.length - 1] !== s) r.states.push(s);
  }
  (m as { release?: () => void }).release?.();
}
const rows = [...seen.values()];
const tab = (f: (r: R) => string) => { const o: Record<string, number> = {}; for (const r of rows) { const k = f(r); o[k] = (o[k] ?? 0) + 1; } return Object.fromEntries(Object.entries(o).sort()); };
console.log('kontrakttilbud til spillere med kontrakt', rows.length, 'billeder', snaps.length);
console.log('pr. måned', JSON.stringify(tab((r) => r.first.slice(0, 7))));
console.log('sælger', JSON.stringify(tab((r) => r.sg)));
console.log('køber', JSON.stringify(tab((r) => r.bg)));
console.log('CA-bånd', JSON.stringify(tab((r) => String(Math.min(180, Math.floor(r.ca / 20) * 20)))));
console.log('dage til udløb', JSON.stringify(tab((r) => r.days < 0 ? '?' : String(Math.min(400, Math.floor(r.days / 30) * 30)))));
console.log('kontrakttype/nibble', JSON.stringify(tab((r) => `ct${r.ct}/n${r.tm}`)));
console.log('tilstande', JSON.stringify(tab((r) => r.states.join(','))));
const ars = rows.filter((r) => r.seller === 'Arsenal');
console.log('Arsenal (menneske på ferie)', ars.length, JSON.stringify(ars.map((r) => [r.first, r.buyer, r.ca, r.exp, r.states.join(',')])));
const top = rows.filter((r) => r.sg === 'P');
console.log('Premier-sælgere', top.length, 'CA≥120', top.filter((r) => r.ca >= 120).length);
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(rows));
