// Klubøkonomiens begivenheder (process_club_finance_events 0x59ed70) i oraklets dagsbilleder: klubber i krise (bånd −1/−2, +0x165),
// Investments-stigninger pr. klub og overtagelserne (nyhed 0x1779 type 2 "New Board take control" i menneskets indbakke = landets klubber).
// Kør: npx tsx scripts/fe-oracle.ts [daysnap-mappe] [STEP]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { readOracleNews } from './oracle-news';
import { wealthBand } from '../src/game/cmFinance';
import type { SparseMem } from '../src/game/cmMem';

const dir = process.argv[2] ?? DEFAULT_DAYSNAP, STEP = Number(process.argv[3] ?? 1);
const ix = readDaySnapIndex(dir)!;
const str = (m: SparseMem, a: number, n = 51) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const seenNews = new Map<number, string>();
const prevInv = new Map<number, number>();
const prevChair = new Map<number, string>();
const chairEv: string[] = [];
const invEv: string[] = [];
let names: string[] = [];
const crisisDays: Record<string, number> = {};
for (let i = 0; i < ix.snaps.length; i++) {
  if (i % STEP && i !== ix.snaps.length - 1) continue;
  const e = ix.snaps[i];
  const m = loadDaySnap(ix, e);
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), F = m.u32(m.u32(0xae2a38));
  if (!names.length) for (let k = 0; k < nc; k++) names.push(str(m, C + 0x245 * k + 4));
  let n1 = 0, n2 = 0, neg = 0, b1 = 0, b2 = 0, engB = 0, eng = 0;
  for (let k = 0; k < nc; k++) {
    const f = F + 0x167 * k, a = C + 0x245 * k;
    const bal = m.u32(f) + m.s32(f + 4) * 4294967296, rep = m.s16(a + 0x80), s165 = m.u8(f + 0x165);
    const nat = str(m, m.u32(a + 0x53) + 4);
    if (s165 === 1) n1++; else if (s165 === 2) n2++;
    if (bal < 0) neg++;
    const b = wealthBand(bal, rep);
    if (b === -1) b1++; else if (b === -2) b2++;
    if (nat === 'England' && m.u32(a + 0x57)) { eng++; if (b < 0) engB++; }
    const inv = m.s32(f + 0x110 + 0x44), p = prevInv.get(k);
    if (p !== undefined && inv - p >= 100000) invEv.push(`${e.iso} ${names[k]} (${nat}, rep ${rep}) +${inv - p} saldo ${bal}`);
    prevInv.set(k, inv);
    const st = m.u32(a + 0xbf), np = st ? m.u32(st + 0x69) : 0;
    const key = np ? `${m.u8(np + 0xf)},${m.u8(np + 0x16)},${m.u8(np + 0x1d)}` : '';
    const pc = prevChair.get(k);
    if (pc !== undefined && pc !== key && key) chairEv.push(`${e.iso} ${names[k]} (${nat}, rep ${rep}) formand ${pc} → ${key} saldo ${bal}`);
    prevChair.set(k, key);
  }
  crisisDays[e.iso] = n1 + n2;
  for (const x of readOracleNews(m)) if (x.type === 0x1779 && !seenNews.has(x.id)) seenNews.set(x.id, `${x.date} type ${x.slots?.[3]} ${names[x.slots?.[0] ?? -1] ?? x.slots?.[0]} beløb ${x.slots?.[1]} tb ${x.slots?.[2]}`);
  console.log(`${e.iso} +0x165=1: ${n1} =2: ${n2} | bånd −1 ${b1} −2 ${b2} | saldo<0 ${neg} | engelske ligaklubber ${eng}, i bånd<0 ${engB}`);
}
console.log('\n== nyheder 0x1779 (alle typer) i indbakken');
for (const s of seenNews.values()) console.log(s);
console.log(`\n== formandsskift (overtagelser med formand) ${chairEv.length}`);
for (const s of chairEv) console.log(s);
console.log(`\n== Investments-stigninger (${invEv.length})`);
for (const s of invEv) console.log(s);
