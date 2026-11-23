// K7c #2: lejerne fra engelske klubber på oraklets billeder – slutdato, startdato (+0x25), hovedkontraktens udløb, långiver/låner-division.
//   DIR=<daysnap> [V=1] npx tsx scripts/k7-loan-carry.ts <dato …>
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : `?${y}`);
const want = process.argv.slice(2);
let prevL: Map<number, string> | null = null;
let prevInfo = new Map<number, string>();
for (const e of ix.snaps.filter((s) => !want.length || want.includes(s.iso))) {
  const m = loadDaySnap(ix, e);
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), K = m.u32(m.u32(0xae1050)), rows = m.u32(0xae2d0c);
  const cName = (i: number) => (i >= 0 && i < nc ? str(m, C + 0x245 * i + 4, 51) : '');
  const cEng = (i: number) => i >= 0 && i < nc && str(m, m.u32(C + 0x245 * i + 0x53) + 4, 51) === 'England';
  const cDiv = (i: number) => { if (i < 0 || i >= nc) return ''; const dv = m.u32(C + 0x245 * i + 0x57); return dv ? str(m, dv + 4, 51).replace('English ', '') : 'nl'; };
  const out: string[] = [], curL = new Map<number, string>(), info = new Map<number, string>();
  const cnt: Record<string, number> = {};
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id;
    if (!m.u32(st + 0x61) || m.u8(st + 0x3d) === 16) continue;
    const li = m.s32(rows + 79 * id + 4), hi = m.s32(rows + 79 * id);
    if (li < 0) continue;
    const kl = K + 80 * li, k = hi >= 0 ? K + 80 * hi : 0;
    const parent = k ? m.s32(k + 4) : -1, to = m.s32(kl + 4);
    if (!cEng(parent)) continue;
    const end = dayIso(m.s16(kl + 0x2d), m.u16(kl + 0x2f)), start = dayIso(m.s16(kl + 0x25), m.u16(kl + 0x27));
    const kexp = k ? dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)) : '';
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12));
    const key = end.slice(0, 7);
    cnt[key] = (cnt[key] ?? 0) + 1; curL.set(id, end); info.set(id, `slut ${end} start ${start} ${cName(parent)} → ${cName(to)} ${str(m, m.u32(st + 8))}`);
    out.push(`  ${end} start ${start} kontr ${kexp} født ${dob} ${cName(parent)} (${cDiv(parent)}) → ${cName(to)} (${cDiv(to)}) ${str(m, m.u32(st + 8))}`);
  }
  let nw = 0, early = 0, due = 0; if (prevL) { for (const id of curL.keys()) if (!prevL.has(id)) nw++; for (const [id, en] of prevL) if (!curL.has(id)) { if (en >= e.iso) { early++; if (process.env.EARLY) { const st = S + 0x6e * id, ca = m.u32(st + 0x39), hi = m.s32(rows + 79 * id); console.log(`  FØR TID ${e.iso}: ${prevInfo.get(id)} | nu ${ca ? cName((ca - C) / 0x245) : '(klubløs)'} job ${m.u8(st + 0x3d)} kontr ${hi >= 0 ? dayIso(m.s16(K + 80 * hi + 0x2d), m.u16(K + 80 * hi + 0x2f)) : '-'}`); } } else due++; } }
  prevInfo = info;
  if (process.env.BIDS) {
    const tm = m.u32(0xde1f54), tab = m.u32(tm), nb = m.s32(tm + 8);
    let all = 0, onLoan = 0, st0 = 0; const states: Record<number, number> = {};
    for (let i = 0; i < nb && i < 20000; i++) {
      const o = m.u32(tab + 4 * i); if (!o || m.u8(o + 0x1f)) continue;
      const st = m.u32(o + 0xc); const sid = st ? (st - S) / 0x6e : -1; all++;
      if (sid >= 0 && sid < n && m.s32(rows + 79 * sid + 4) >= 0) { onLoan++; states[m.u8(o + 0x2c)] = (states[m.u8(o + 0x2c)] ?? 0) + 1; }
      void st0;
    }
    console.log(`  købsbud ${all}, på udlejede ${onLoan} (tilstand +0x2c: ${JSON.stringify(states)})`);
  }
  prevL = curL;
  console.log(`ny ${nw} slut-til-tiden ${due} slut-før-tid ${early} | ${e.iso}: ${out.length} lejer fra engelske | slut ${Object.entries(cnt).sort().map(([a, b]) => `${a}:${b}`).join(' ')}`);
  if (process.env.V) console.log(out.sort().join('\n'));
}
