// K7: oraklets klubløse underskrifter – hvor stod spilleren ved spilstarten (14/7-01) i oraklet og hos os? (klub/klubløs, i hukommelsen,
// kontraktudløb, CA) – deler underskuddet op i "findes ikke/har klub hos os" og "klubløs hos begge".
//   BUYS=<k7-seasons BUYS-fil> WORLD=<world-dbs2.json> npx tsx scripts/k7-free-who.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';

const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const B = JSON.parse(readFileSync(process.env.BUYS!, 'utf8')) as { o: { pkey: string; date: string; from: string; to: string; loan: boolean; age: number; ca: number; toNat: string; toDiv: string }[]; u: { pkey: string; date: string; from: string; to: string; loan: boolean }[] };
const fs = B.o.filter((t) => !t.loan && !t.from && t.to && t.pkey && t.date < "2002-07-01");
const want = new Set(fs.map((t) => t.pkey));
const uSig = new Map(B.u.filter((t) => !t.loan && !t.from && t.to).map((t) => [t.pkey, t]));

// oraklet 14/7-01
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps[0]) as SparseMem;
const C = m.u32(0xae23b4), S = m.u32(0xae23bc), n = m.s32(0xae2364);
const o = new Map<string, string>();
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id, pr = m.u32(st + 0x61);
  if (!pr) continue;
  const common = str(m, m.u32(st + 0xc), 60), f = str(m, m.u32(st + 4), 60), l = str(m, m.u32(st + 8), 60);
  const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
  const key = `${common || f + ' ' + l}|${dob}`;
  if (!want.has(key)) continue;
  const cadr = m.u32(st + 0x39), k = getContract(m, st);
  o.set(key, cadr ? `klub ${str(m, cadr + 4).slice(0, 16)} udl ${k ? dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)) : '-'}` : `klubløs (siden ${dayIso(m.s16(st + 0x3e), m.u16(st + 0x40))})`);
}
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const u = new Map<string, string>();
if (process.env.BYNAME) {
  const nm = new Set([...want].map((k) => k.split('|')[0]));
  for (const p of Object.values(g.players)) if (nm.has(`${p.first} ${p.last}`)) console.log('navn', `${p.first} ${p.last}`, p.dob, p.club ? g.clubs[p.club]?.name : 'klubløs', cmInMemory(g, p), p.ca);
  const free = Object.values(g.players).filter((p) => !p.club && !p.virtual);
  console.log('klubløse hos os', free.length, 'i hukommelsen', free.filter((p) => cmInMemory(g, p)).length, 'eng', free.filter((p) => p.nation === eng).length);
}
for (const p of Object.values(g.players)) {
  const key = `${p.first} ${p.last}|${p.dob}`;
  if (!want.has(key)) continue;
  u.set(key, p.club ? `klub ${g.clubs[p.club]?.name.slice(0, 16)} udl ${p.contract?.expires.slice(0, 10) ?? '-'}${cmInMemory(g, p) ? '' : ' (uden for huk.)'}` : `klubløs${cmInMemory(g, p) ? '' : ' (uden for huk.)'}`);
}
const cat = new Map<string, number>();
for (const t of fs) {
  const a = o.get(t.pkey) ?? 'ikke i oraklet 14/7', b = u.get(t.pkey) ?? 'findes ikke';
  const c = `${a.startsWith('klubløs') ? 'O:klubløs' : a.startsWith('klub') ? 'O:klub' : 'O:?'} / ${b.startsWith('klubløs') ? 'U:klubløs' : b.startsWith('klub') ? 'U:klub' : 'U:findes ikke'}${uSig.has(t.pkey) ? ' (U skrev under)' : ''}`;
  cat.set(c, (cat.get(c) ?? 0) + 1);
  if (process.env.LIST) console.log(t.date, t.pkey.slice(0, 28), Math.round(t.age), t.ca, t.to.slice(0, 16), '|', a, '|', b, uSig.get(t.pkey)?.date ?? '');
}
console.log([...cat].sort((x, y) => y[1] - x[1]).map(([k, v]) => `${v}\t${k}`).join('\n'));
