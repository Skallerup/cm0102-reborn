// Kontrakttal i ORIGINALEN fra øjebliksbillederne (sn_trace.c: pre-/post-<dag>-<år>.bin, frø 1, 3.9.60, England spilbart) – til
// CONTRACT_MANAGER::daily_update 0x4c7ac0 på spillets data (cmContractDaily.ts). Engelske klubbers spillere (klub +0x53 = Newcastles land):
// kontrakter, typerne +0x35 & 0x3f (1 udløbet, 2 almindelig, 5 prøvetid, 6/7 leje), +0x49 (sat fri/vil væk), udløbsdatoerne, kontrakter
// startet (+0x25) efter `fra` (forlængelser = samme klub som ved `fra`-billedet, når det gives), frie spillere og TRANSFER_MANAGER's
// afsluttede transfers (art 3 = fri) efter dato.
// Brug: npx tsx scripts/cm-contract-days.ts <billede.bin> [fra-billede.bin]
import { loadSnap } from './ct-snap';
import { G, type SparseMem } from '../src/game/cmMem';

const [file, fromFile] = process.argv.slice(2);
const dayIso = (d: number, y: number) => new Date(Date.UTC(y, 0, 1) + d * 86400000).toISOString().slice(0, 10);

interface Row { id: number; dob: string; club: number; eng: boolean; type: number; start: string; end: string; f49: number; status: number; wage: number; joined: string }
function scan(m: SparseMem) {
  const cb = m.u32(G.CLUBS);
  const nameOf = (id: number) => { let t = ''; for (let i = 0; i < 50; i++) { const c = m.u8(cb + 0x245 * id + 4 + i); if (!c) break; t += String.fromCharCode(c); } return t; };
  let engNat = 0;
  for (let id = 0; id < m.s32(0xae235c); id++) if (nameOf(id) === 'Newcastle United') engNat = m.u32(cb + 0x245 * id + 0x53);
  const isEng = (id: number) => id >= 0 && m.u32(cb + 0x245 * id + 0x53) === engNat;
  const staffN = m.s32(G.STAFF_COUNT), staff = m.u32(G.STAFF), rows = m.u32(G.ROWS), K = m.u32(m.u32(G.CM));
  const out: Row[] = [];
  let free = 0, freeEng = 0;
  for (let id = 0; id < staffN; id++) {
    const s = staff + 0x6e * id;
    if (!m.u32(s + 0x61)) continue;
    const dob = dayIso(m.s16(s + 0x10), m.u16(s + 0x12));
    const nat = m.u32(s + 0x1a);
    const ix = m.s32(rows + 79 * id);
    if (ix < 0) { free++; if (nat === engNat) freeEng++; continue; }
    const k = K + 80 * ix, club = m.s32(k + 4);
    out.push({ id, dob, club, eng: isEng(club), type: m.u8(k + 0x35) & 0x3f, start: dayIso(m.s16(k + 0x25), m.u16(k + 0x27)), end: dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)),
      f49: m.u8(k + 0x49), status: m.u8(k + 0x4f) >> 4, wage: m.s32(k + 0xc), joined: dayIso(m.s16(s + 0x3e), m.u16(s + 0x40)) });
  }
  const tm = m.u32(0xde1f54), arr = m.u32(tm + 0x862), n = m.s32(tm + 0x86a);
  const xfers: { art: number; date: string; eng: boolean; fee: number; seller: number; buyer: number; id: number }[] = [];
  for (let i = 0; i < n; i++) {
    const r = arr + 37 * i;
    xfers.push({ id: m.s32(r), art: m.u8(r + 0x1c), date: dayIso(m.s16(r + 0x1d), m.u16(r + 0x1f)), eng: isEng(m.s32(r + 0x14)) || isEng(m.s32(r + 0x10)), fee: m.s32(r + 0x18), seller: m.s32(r + 0x10), buyer: m.s32(r + 0x14) });
  }
  const today = dayIso(m.s16(G.TODAY), m.u16(G.TODAY + 2));
  return { rows: out, free, freeEng, xfers, today };
}

const MA = loadSnap(file);
const A = scan(MA);
const eng = A.rows.filter((r) => r.eng);
const cnt = (xs: string[]) => { const o: Record<string, number> = {}; for (const x of xs) o[x] = (o[x] ?? 0) + 1; return Object.entries(o).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => `${k}:${v}`).join(' '); };
const top = (xs: string[], n = 12) => { const o: Record<string, number> = {}; for (const x of xs) o[x] = (o[x] ?? 0) + 1; return Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}:${v}`).join(' '); };
console.log(`billedet ${file}: i dag ${A.today}; [0xae2330] ${dayIso(MA.s16(0xae2330), MA.u16(0xae2332))}, spilstarten [0xdd6ec8] ${dayIso(MA.s16(0xdd6ec8), MA.u16(0xdd6eca))}`);
console.log(`udløbsdag (alle spillere) for kontrakter startet før 2001: ${top(A.rows.filter((r) => r.start < '2001-01-01').map((r) => r.end.slice(5)))}`);
console.log(`udløbsdag for kontrakter startet fra 2001: ${top(A.rows.filter((r) => r.start >= '2001-01-01').map((r) => r.end.slice(5)))}`);
console.log(`engelske klubbers spillere med kontrakt ${eng.length}; typer ${cnt(eng.map((r) => String(r.type)))}; +0x49 = 1: ${eng.filter((r) => r.f49).length}`);
console.log(`trupstatus +0x4f >> 4: ${cnt(eng.map((r) => String(r.status)))}`);
console.log(`spillere uden kontrakt (indlæste) ${A.free}, heraf engelske statsborgere ${A.freeEng}`);
console.log(`udløb (år-måned): ${cnt(eng.map((r) => r.end.slice(0, 7)))}`);
console.log(`udløb 30/6: ${cnt(eng.filter((r) => r.end.slice(5) === '06-30').map((r) => r.end.slice(0, 4)))}`);
console.log(`start (år-måned, de seneste): ${cnt(eng.filter((r) => r.start >= '2001-01-01').map((r) => r.start.slice(0, 7)))}`);
console.log(`type 1 (udløbet, stadig i klubben) efter trupstatus: ${cnt(eng.filter((r) => r.type === 1).map((r) => String(r.status)))}`);
const xs = A.xfers.filter((x) => x.eng && x.date >= '2001-07-14');
console.log(`afsluttede transfers med en engelsk part fra 14/7-2001: ${xs.length}; art: ${cnt(xs.map((x) => String(x.art)))}`);
console.log(`  art 3 (fri) pr. måned: ${cnt(xs.filter((x) => x.art === 3).map((x) => x.date.slice(0, 7)))}`);
if (fromFile) {
  const B = scan(loadSnap(fromFile));
  const before = new Map(B.rows.map((r) => [r.id, r]));
  let renewed = 0, moved = 0, expiredStay = 0, gone = 0, sameEnd = 0;
  const renewYears: string[] = [], renewMonths: string[] = [], expiring: Row[] = [];
  for (const r0 of B.rows) {
    if (!r0.eng || r0.type !== 2) continue;
    const r = A.rows.find((x) => x.id === r0.id && x.dob === r0.dob);
    if (r0.end <= A.today) expiring.push(r0);
    if (!r) { gone++; continue; }
    if (r.club !== r0.club) { moved++; continue; }
    if (r.end === r0.end) { sameEnd++; if (r.type === 1) expiredStay++; continue; }
    renewed++; renewYears.push(`${+r.end.slice(0, 4) - +A.today.slice(0, 4)}`); renewMonths.push(r.start.slice(0, 7));
  }
  console.log(`fra ${B.today} (${B.rows.filter((r) => r.eng && r.type === 2).length} engelske kontrakter type 2): forlænget i samme klub ${renewed}, skiftet klub ${moved}, uden kontrakt nu ${gone}, samme udløb ${sameEnd} (heraf udløbet/type 1: ${expiredStay})`);
  console.log(`  forlængelsernes start (måned) ${cnt(renewMonths)}; nyt udløb (år efter i dag) ${cnt(renewYears)}`);
  const exp = expiring.map((r0) => { const r = A.rows.find((x) => x.id === r0.id && x.dob === r0.dob); return !r ? 'fri' : r.club !== r0.club ? 'skiftet' : r.end !== r0.end ? 'forlænget' : r.type === 1 ? 'udløbet' : 'samme'; });
  console.log(`  de ${expiring.length} kontrakter, der udløb inden ${A.today}: ${cnt(exp)}`);
  const expBy = (s: number) => expiring.filter((r0) => r0.status === s).map((r0) => { const r = A.rows.find((x) => x.id === r0.id && x.dob === r0.dob); return !r ? 'fri' : r.club !== r0.club ? 'skiftet' : r.end !== r0.end ? 'forlænget' : 'udløbet'; });
  for (let s = 0; s <= 7; s++) { const e = expBy(s); if (e.length) console.log(`    trupstatus ${s}: ${cnt(e)}`); }
}
