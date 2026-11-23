// K7c #3: en udlejets felter, som ønskelisternes frasortering 0x83fa25 læser (oraklet): staff +0x3e/+0x40 (dato), +0x52 (værdi), +0x24, +0x28,
// rækkens +0xb, hovedkontraktens/lejekontraktens +0x35/+0x45/+0x4e/+0x4f/+0x25/+0x2d, TM +0x86e-flaget, +0x39 – udlejede (ALL=1: også stikprøver).
//   DIR=<daysnap> [N=60] [ALL=1] [NAMES=Miller,Thatcher] npx tsx scripts/k7-loan-fields.ts [dato]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const e = ix.snaps.find((s) => s.iso === (process.argv[2] ?? '2001-09-01'))!;
const m = loadDaySnap(ix, e);
const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), K = m.u32(m.u32(0xae1050)), rows = m.u32(0xae2d0c);
const tm86e = m.u32(m.u32(0xde1f54) + 0x86e);
const cName = (a: number) => (a ? str(m, a + 4, 51) : '-');
const cAt = (i: number) => (i >= 0 && i < nc ? C + 0x245 * i : 0);
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : `?${y}`);
let shown = 0;
const NAMES = process.env.NAMES ? new Set(process.env.NAMES.split(',')) : null;
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id; if (!m.u32(st + 0x61)) continue;
  const li = m.s32(rows + 79 * id + 4), hi = m.s32(rows + 79 * id);
  const loan = li >= 0;
  if (NAMES ? !NAMES.has(str(m, m.u32(st + 8))) : !loan && !(process.env.ALL && id % 500 === 0)) continue;
  if (shown++ > +(process.env.N ?? 60)) break;
  const k = hi >= 0 ? K + 80 * hi : 0, kl = loan ? K + 80 * li : 0;
  const rb = m.u8(rows + 79 * id + 0xb);
  const kf = (x: number) => `+4 ${cName(cAt(m.s32(x + 4)))} +35 ${m.u8(x + 0x35).toString(16)} +45 ${m.u32(x + 0x45).toString(16)} +4e ${m.u8(x + 0x4e).toString(16)} +4f ${m.u8(x + 0x4f).toString(16)} +25 ${dayIso(m.s16(x + 0x25), m.u16(x + 0x27))} +2d ${dayIso(m.s16(x + 0x2d), m.u16(x + 0x2f))} +c ${m.s32(x + 0xc)}`;
  console.log(`${id} ${str(m, m.u32(st + 8))}${loan ? ' LEJE' : ''} +39 ${cName(m.u32(st + 0x39))} +3e ${dayIso(m.s16(st + 0x3e), m.u16(st + 0x40))} +52 ${m.s32(st + 0x52)} +24 ${m.u32(st + 0x24).toString(16)} +28 ${m.u8(st + 0x28)}`
    + ` | row+b ${rb.toString(16)} tm86e ${m.u8(tm86e + 8 * id).toString(16)}`
    + (k ? ` | K ${kf(k)}` : ' | ingen K') + (kl ? ` | L ${kf(kl)}` : ''));
}
