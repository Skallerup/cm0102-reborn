// Sæsontal for transfer-/kontraktsystemet i ORIGINALEN, læst af et øjebliksbillede (sn_trace.c): TRANSFER_MANAGER [0xde1f54] +0x862/+0x86a
// (afsluttede transfers à 37 bytes: +0 person, +4/+8/+0xc klubber, +0x18 sum, +0x1c art, +0x1d dato) og kontrakterne ([0xae1050], 80 bytes:
// +4 klub, +0xc ugeløn £, +0x2d/+0x2f udløb). Brug: npx tsx scripts/ct-season.ts <post-…bin> [fra-år]
import { loadSnap } from './ct-snap';
import { G } from '../src/game/cmMem';

const [file, fromYear = '2001'] = process.argv.slice(2);
const m = loadSnap(file);
const cb = m.u32(G.CLUBS);
const nameOf = (id: number) => { let t = ''; for (let i = 0; i < 50; i++) { const c = m.u8(cb + 0x245 * id + 4 + i); if (!c) break; t += String.fromCharCode(c); } return t; };
// England: Newcastle Uniteds land (klub +0x53); "eng" = transfers, hvor +0x14 er engelsk. NB (målt 14/11 på kendte spillere): +0x14 er klubben,
// spilleren kom FRA (art 2/4: moderklubben), +0x10 klubben han kom TIL – se scripts/ct-season-club.ts, der tæller købere rigtigt
let engNat = 0;
for (let id = 0; id < m.s32(0xae235c); id++) if (nameOf(id) === 'Newcastle United') engNat = m.u32(cb + 0x245 * id + 0x53);
const isEng = (id: number) => id >= 0 && m.u32(cb + 0x245 * id + 0x53) === engNat;
const tm = m.u32(0xde1f54);
const arr = m.u32(tm + 0x862), n = m.s32(tm + 0x86a);
const types: Record<number, { n: number; fee: number; fees: number[] }> = {};
const rows: string[] = [];
/** pr. engelsk klub i +0x14 (den, spilleren kom fra): skifter, med sum, summen */
const byClub: Record<string, { n: number; paid: number; fee: number }> = {};
for (let i = 0; i < n; i++) {
  const r = arr + 37 * i;
  const year = m.s16(r + 0x1d + 2);
  if (year < +fromYear) continue;
  const t = m.u8(r + 0x1c) + (isEng(m.s32(r + 0x14)) ? 100 : 0), fee = m.s32(r + 0x18);
  const e = (types[t] ??= { n: 0, fee: 0, fees: [] });
  e.n++; e.fee += fee; e.fees.push(fee);
  if (isEng(m.s32(r + 0x14))) { const k = nameOf(m.s32(r + 0x14)), c = (byClub[k] ??= { n: 0, paid: 0, fee: 0 }); c.n++; if (fee > 0) { c.paid++; c.fee += fee; } }
  if (rows.length < 15) rows.push(`${m.s32(r)} ${m.s32(r + 4)} ${m.s32(r + 8)} ${m.s32(r + 0xc)} ${m.s32(r + 0x10)} ${m.s32(r + 0x14)} fee ${fee} type ${t} ${m.s16(r + 0x1d)}/${year}`);
}
console.log('art + 100 = engelsk klub i +0x14 (den, spilleren kom fra); +0x10 = den, han kom til');
console.log(`afsluttede transfers i hukommelsen: ${n} (fra ${fromYear})`);
for (const [t, e] of Object.entries(types)) {
  e.fees.sort((a, b) => a - b);
  console.log(`art ${t}: ${e.n} stk, sum £${(e.fee / 1e6).toFixed(1)}m, snit £${Math.round(e.fee / e.n)}, median £${e.fees[e.fees.length >> 1]}, max £${e.fees[e.fees.length - 1]}`);
}
console.log(rows.join('\n'));
const bc = Object.entries(byClub).sort((a, b) => b[1].n - a[1].n);
console.log(`engelske klubber i +0x14 (afgivende): ${bc.length} klubber; skifter pr. klub (med sum, £m):`);
console.log(bc.slice(0, 25).map(([k, v]) => `${k} ${v.n} (${v.paid}, ${(v.fee / 1e6).toFixed(1)})`).join(' · '));
// kontrakterne: ugeløn pr. klub i de engelske ligaer (klubbernes land +0x53 → nationens navn ikke nødvendigt: liga +0x57)
const staffN = m.s32(G.STAFF_COUNT), staff = m.u32(G.STAFF), rowsB = m.u32(G.ROWS), cArr = m.u32(m.u32(G.CM));
let players = 0, contracted = 0, free = 0; const wages: number[] = [];
for (let id = 0; id < staffN; id++) {
  const s = staff + 0x6e * id;
  if (!m.u32(s + 0x61)) continue;            // spillerpost
  players++;
  const ix = m.s32(rowsB + 79 * id);
  if (ix < 0) { free++; continue; }
  contracted++;
  if (isEng(m.s32(cArr + 80 * ix + 4))) wages.push(m.s32(cArr + 80 * ix + 0xc));
}
wages.sort((a, b) => a - b);
const q = (f: number) => wages[Math.floor(f * (wages.length - 1))];
console.log(`spillere ${players}, med kontrakt ${contracted}, uden ${free}; ugeløn £ (engelske klubber, ${wages.length}) median ${q(0.5)}, 90 % ${q(0.9)}, 99 % ${q(0.99)}, max ${q(1)}`);
