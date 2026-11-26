// K7: hvorfor springer trupplanens tæller +8 til 100 i oraklet (Shortlist_Manager [+0xdc] + 9·klub, +8) – klubbens kontrakter (CONTRACT_MANAGER-
// rækkerne, kontrakt +4 = klub) og lejekontrakter dagen før mod dagen, og pladsernes indehavere. Én linje pr. spring for de valgte klubber.
//   CLUBS="Bradford City,Nottingham Forest" FROM=2001-08-01 TO=2001-10-31 npx tsx scripts/k7-planhop-oracle.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, getLoanContract, type SparseMem } from '../src/game/cmMem';

const FROM = process.env.FROM ?? '2001-08-01', TO = process.env.TO ?? '2001-10-31';
const CLUBS = new Set((process.env.CLUBS ?? 'Bradford City,Nottingham Forest').split(','));
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
type Day = { n8: Map<number, number>; squad: Map<number, Set<number>>; loan: Map<number, Set<number>>; names: Map<number, string> };
let prev: Day | undefined;
const snaps = ix.snaps.filter((x) => x.iso >= FROM && x.iso <= TO);
for (const e of snaps) {
  const m = loadDaySnap(ix, e);
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), St = m.u32(0xae23bc), ns = m.s32(0xae2364);
  const slm = m.u32(m.u32(0xde1f54) + 0x856);
  const want = new Map<number, string>();
  for (let cix = 0; cix < nc; cix++) { const n = str(m, C + 0x245 * cix + 4); if (CLUBS.has(n)) want.set(cix, n); }
  const day: Day = { n8: new Map(), squad: new Map(), loan: new Map(), names: new Map() };
  for (const cix of want.keys()) { day.n8.set(cix, m.u8(m.u32(slm + 0xdc) + 9 * cix + 8)); day.squad.set(cix, new Set()); day.loan.set(cix, new Set()); }
  for (let id = 0; id < ns; id++) {
    const s = St + 0x6e * id;
    const k = getContract(m, s), l = getLoanContract(m, s);
    const kc = k ? m.s32(k + 4) : -1, lc = l ? m.s32(l + 4) : -1;
    if (day.squad.has(kc)) { day.squad.get(kc)!.add(id); day.names.set(id, `${str(m, m.u32(s + 4))} ${str(m, m.u32(s + 8))}`); }
    if (day.loan.has(lc)) { day.loan.get(lc)!.add(id); day.names.set(id, `${str(m, m.u32(s + 4))} ${str(m, m.u32(s + 8))}`); }
  }
  if (prev) {
    for (const [cix, n] of want) {
      const a = prev.n8.get(cix) ?? 0, b = day.n8.get(cix) ?? 0;
      const ps = prev.squad.get(cix)!, ds = day.squad.get(cix)!, pl = prev.loan.get(cix)!, dl = day.loan.get(cix)!;
      const ind = [...ds].filter((x) => !ps.has(x)), out = [...ps].filter((x) => !ds.has(x));
      const lin = [...dl].filter((x) => !pl.has(x)), lout = [...pl].filter((x) => !dl.has(x));
      const nm = (x: number) => day.names.get(x) ?? prev!.names.get(x) ?? String(x);
      if (b >= 90 && b - a > 50 || process.env.ALL && (ind.length || out.length || lin.length || lout.length))
        console.log(`${e.iso} ${n.padEnd(20)} +8 ${a}→${b}  ind [${ind.map(nm)}] ud [${out.map(nm)}] leje ind [${lin.map(nm)}] leje ud [${lout.map(nm)}]`);
    }
  }
  prev = day;
  (m as { release?: () => void }).release?.();
}
