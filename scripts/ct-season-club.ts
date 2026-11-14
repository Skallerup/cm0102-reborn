// Originalens afsluttede transfers (sporbinærens øjebliksbillede, TRANSFER_MANAGER +0x862/+0x86a à 37 bytes – se ct-season.ts), læst med
// felterne målt på kendte spillere (14/11): +0x14 = ejeren (art 0: sælgeren; art 2/4: moderklubben), +0x10 = den anden klub (art 0: køberen;
// art 2/4: lejeklubben; art 3: −1). Art 0 = salg/køb (+0x14 = −1: en klubløs skriver under), 2 = leje ud, 3 = kontrakten udløbet (fri),
// 4 = lejen slut (tilbage til moderklubben), 5 = stab (ingen spillerpost). Her er from/to retningen, spilleren går (art 4 vendt om).
// Brug: npx tsx scripts/ct-season-club.ts <post-…bin> [klub …]   (uden klubber: tal pr. art for engelske købere/sælgere og de største købere)
import { loadSnap } from './ct-snap';
import { readFileSync } from 'node:fs';
import { G } from '../src/game/cmMem';

const [file, ...names] = process.argv.slice(2);
const m = loadSnap(file);
const cb = m.u32(G.CLUBS), staff = m.u32(0xae23bc);
const str = (a: number) => { let s = ''; for (let i = 0; i < 54; i++) { const ch = m.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
const nameOf = (id: number) => (id >= 0 ? str(cb + 0x245 * id + 4) : '-');
let engNat = 0;
for (let id = 0; id < m.s32(0xae235c); id++) if (nameOf(id) === 'Newcastle United') engNat = m.u32(cb + 0x245 * id + 0x53);
// LIGA=1: kun klubberne i spillets fire engelske ligaer (world-original.json CM7–CM10) tæller som engelske
const leagueClubs = process.env.LIGA ? new Set((JSON.parse(readFileSync('public/data/world-original.json', 'utf8')).clubs as [number, string, string, number, string][]).filter((c) => ['CM7', 'CM8', 'CM9', 'CM10'].includes(c[4])).map((c) => c[1])) : null;
const isEng = (id: number) => id >= 0 && m.u32(cb + 0x245 * id + 0x53) === engNat && (!leagueClubs || leagueClubs.has(nameOf(id)));
const tm = m.u32(0xde1f54);
const arr = m.u32(tm + 0x862), n = m.s32(tm + 0x86a);
const all = [] as { from: number; to: number; fee: number; art: number; day: number; year: number; st: number }[];
for (let i = 0; i < n; i++) {
  const r = arr + 37 * i;
  if (m.s16(r + 0x1d + 2) < 2001) continue;
  const own = m.s32(r + 0x14), other = m.s32(r + 0x10), back = m.u8(r + 0x1c) === 4;
  all.push({ from: back ? other : own, to: back ? own : other, fee: m.s32(r + 0x18), art: m.u8(r + 0x1c), day: m.s16(r + 0x1d), year: m.s16(r + 0x1f), st: staff + 0x6e * m.s32(r) });
}
if (!names.length) {
  const k = (x: typeof all[number]) => `${isEng(x.to) ? 'til ENG' : x.to < 0 ? 'til -' : 'til udl.'} ${isEng(x.from) ? 'fra ENG' : x.from < 0 ? 'fra -' : 'fra udl.'}`;
  for (const art of [0, 2, 3, 4, 5]) {
    const c: Record<string, [number, number, number]> = {};
    for (const x of all.filter((y) => y.art === art)) { const e = (c[k(x)] ??= [0, 0, 0]); e[0]++; e[1] += x.fee; if (x.fee > 0) e[2]++; }
    console.log(`art ${art}: ` + Object.entries(c).map(([a, [nn, f, paid]]) => `${a} ${nn} (med sum ${paid}, £${(f / 1e6).toFixed(1)}m)`).join(' · '));
  }
  const by: Record<string, [number, number]> = {};
  for (const x of all.filter((y) => y.art === 0 && isEng(y.to))) { const e = (by[nameOf(x.to)] ??= [0, 0]); e[0]++; e[1] += x.fee; }
  console.log('køb (art 0) pr. engelsk køber: ' + Object.entries(by).sort((a, b) => b[1][0] - a[1][0]).slice(0, 30).map(([a, [nn, f]]) => `${a} ${nn} (£${(f / 1e6).toFixed(1)}m)`).join(' · '));
  const fr = all.filter((y) => y.art === 0 && isEng(y.to) && y.from < 0);
  const mon: Record<string, number> = {};
  for (const x of fr) { const k = `${x.year}-${String(new Date(Date.UTC(x.year, 0, 1 + x.day)).getUTCMonth() + 1).padStart(2, '0')}`; mon[k] = (mon[k] ?? 0) + 1; }
  console.log('klubløse købt (art 0 fra −) pr. måned: ' + Object.entries(mon).sort().map(([k, v]) => `${k} ${v}`).join(' · '));
  console.log('  ' + fr.slice(0, 12).map((x) => { const rec = m.u32(x.st + 0x61); return `${x.day}/${x.year} ${str(m.u32(x.st + 8))} (${m.u16(x.st + 0x12)}, rep ${rec ? m.s16(rec + 0xd) : '-'}, nat ${str(m.u32(x.st + 0x1a) + 4)}) → ${nameOf(x.to)}`; }).join('\n  '));
  const mon2: Record<string, [number, number]> = {};
  for (const x of all.filter((y) => (y.art === 0 || y.art === 2) && isEng(y.to) && y.from >= 0)) { const k = `${x.year}-${String(new Date(Date.UTC(x.year, 0, 1 + x.day)).getUTCMonth() + 1).padStart(2, '0')}`; const e = (mon2[k] ??= [0, 0]); e[x.art === 0 ? 0 : 1]++; }
  console.log('køb/leje fra en klub (art 0/2) pr. måned: ' + Object.entries(mon2).sort().map(([k, v]) => `${k} ${v[0]}/${v[1]}`).join(' · '));
  const fees = all.filter((y) => y.art === 0 && isEng(y.to) && y.fee > 0).map((y) => y.fee).sort((a, b) => a - b);
  console.log(`art 0 til ENG med sum: ${fees.length}, median £${fees[fees.length >> 1]}, sum £${(fees.reduce((a, b) => a + b, 0) / 1e6).toFixed(1)}m`);
}
for (const want of names) {
  const rows = all.filter((x) => nameOf(x.to) === want || nameOf(x.from) === want).map((x) => {
    const rec = m.u32(x.st + 0x61);
    return `${x.day}/${x.year} ${str(m.u32(x.st + 4))} ${str(m.u32(x.st + 8))} (${m.u16(x.st + 0x12)}, rep ${rec ? m.s16(rec + 0xd) : '-'}) ${nameOf(x.from)} → ${nameOf(x.to)} £${x.fee} art ${x.art}`;
  });
  console.log(`${want}: ${rows.length}\n  ` + rows.join('\n  '));
}
