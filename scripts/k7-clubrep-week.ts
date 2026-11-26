// K7f #1: oraklets ugentlige omdømme 0x5cd423–0x5cd575 regnet af oraklets egne tabelfelter (Comp_Stats +4/+0x72..+0x75, n = +0x3e) på
// tirsdagens billede, mod onsdagens +0x80 (klubber uden kamp tirsdag). Viser om formlen (cmClubRepWeek.ts repByPosition) rammer, og summen
// af de ugentlige ændringer for de engelske ligaklubber (til sammenligning med vores cmClubRepWeekly i k7-clubrep.ts).
//   [UNTIL=2002-06-30] npx tsx scripts/k7-clubrep-week.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { repByPosition } from '../src/game/cmClubRepWeek';
import type { SparseMem } from '../src/game/cmMem';

const UNTIL = process.env.UNTIL ?? '2002-06-30';
const DIVS = ['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division'];
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
interface R { rep: number; p: number; x72: number; x73: number; x74: number; x75: number; n: number; div: string }
function read(m: SparseMem): Map<string, R> {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), out = new Map<string, R>();
  for (let ix = 0; ix < nc; ix++) {
    const adr = C + 0x245 * ix;
    const dv = m.u32(adr + 0x57), div = dv ? str(m, dv + 4, 51) : '';
    if (!DIVS.includes(div)) continue;
    const cp = m.u32(m.u32(0xadadfc) + 4 * m.s32(dv)), sp = cp ? m.u32(cp + 8) : 0;
    if (!sp) continue;
    const rows = m.u32(sp + 0xc), nr = m.s32(sp + 0x14);
    for (let i = 0; i < nr && i < 200; i++) if (m.s32(rows + 0x76 * i) === m.s32(adr)) {
      const q = rows + 0x76 * i;
      out.set(str(m, adr + 4, 51), { rep: m.s16(adr + 0x80), p: m.u8(q + 4), x72: m.u8(q + 0x72), x73: m.u8(q + 0x73), x74: m.u8(q + 0x74), x75: m.u8(q + 0x75), n: m.s16(cp + 0x3e), div });
      break;
    }
  }
  return out;
}
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const snaps = ix.snaps.filter((e) => e.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso));
const wd = (iso: string) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
const DAY = Number(process.env.DAY ?? 1);
let ok = 0, bad = 0, sum = 0, n = 0;
const byDiv = new Map<string, number>(), ex: string[] = [];
for (let i = 0; i + 1 < snaps.length; i++) {
  if (wd(snaps[i].iso) !== DAY) continue;
  const A = read(loadDaySnap(ix, snaps[i])), B = read(loadDaySnap(ix, snaps[i + 1]));
  for (const [nm, a] of A) {
    const b = B.get(nm); if (!b || b.p !== a.p) continue;               // kun klubber uden kamp den dag
    const apply = a.n !== 0 && a.x74 !== a.x75 && a.x73 !== a.x72 && a.p > 6;
    const exp = apply ? repByPosition(a.rep, a.p, a.n, a.x72, a.x73) : a.rep;
    if (!apply) continue;
    if (exp === b.rep) ok++;
    else { bad++; if (ex.length < 15) ex.push(`${snaps[i].iso} ${nm} rep ${a.rep} → ${b.rep}, formel ${exp} (p ${a.p} n ${a.n} x72 ${a.x72} pos ${a.x73} ${a.x74}/${a.x75})`); }
    if (apply) { sum += exp - a.rep; n++; byDiv.set(a.div, (byDiv.get(a.div) ?? 0) + exp - a.rep); }
  }
}
console.log(`formlen rammer ${ok}, ikke ${bad}; ugentlig sum (klubber uden kamp den dag) ${sum} over ${n}`);
for (const [d, v] of byDiv) console.log(`  ${d} ${v}`);
for (const e of ex) console.log('  ' + e);
