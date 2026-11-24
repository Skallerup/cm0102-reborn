// Klubsættet ved spilstart mod oraklet (daysnap 14/7-01, størrelse 2): pr. klub id/navn/land/division/omdømme, hvem der mangler hos os / hos oraklet.
//   WORLD=public/data/world-original-normal.json [OUT=fil.json] npx tsx scripts/club-set-oracle.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps.find((e) => e.iso === (process.env.DATE ?? '2001-07-14'))!);
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
interface R { id: number; name: string; nat: string; div: string; rep: number; staff?: number[] }
// personerne i hukommelsen (0xae23bc, 0x6e pr. post): klub +0x39 → staff-id'er pr. klubindeks
const staffAt = new Map<number, number[]>(), plAt = new Map<number, number>();
{
  const T = m.u32(0xae23bc), n = m.s32(0xae2364);
  for (let i = 0; i < n; i++) {
    const a = T + 0x6e * i, cp = m.u32(a + 0x39);
    if (cp) { const ci = Math.round((cp - C) / 0x245); (staffAt.get(ci) ?? staffAt.set(ci, []).get(ci)!).push(m.s32(a)); if (m.u32(a + 0x61)) plAt.set(ci, (plAt.get(ci) ?? 0) + 1); }
  }
}
const O = new Map<number, R>();
// landsholdene (nat_club.dat, 2 pr. land) står sidst i tabellen (0x526dcc: de sidste 2 × [0xae2350] beholdes altid) – ikke klubber i world-filen
const nNat = m.s32(0xae2350);
for (let i = 0; i < nc - 2 * nNat; i++) {
  const a = C + 0x245 * i, nat = m.u32(a + 0x53), dv = m.u32(a + 0x57);
  O.set(m.s32(a), { id: m.s32(a), name: str(m, a + 4, 51), nat: nat ? str(m, nat + 4, 51) : '', div: dv ? str(m, dv + 4, 51) : '', rep: m.s16(a + 0x80), staff: staffAt.get(i) });
}
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original-normal.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
// oraklets +0 er tabellens nye nummer efter trimmet – match på navn + land
const key = (n: string, nat: string) => `${n}|${nat}`;
const U = new Map(Object.values(g.clubs).map((c) => [key(c.name, g.nations[c.nation]?.name ?? ''), c]));
const OK = new Map([...O.values()].map((r) => [key(r.name, r.nat), r]));
// DBONLY=1: kun databasens spillere (uden spillets opdigtede trupfyld og fyldspillerne cmVirtual.ts til Europas kampe før startdatoen)
const dbIds = new Set(w.players.map((r) => r[0] as number));
const nplay = new Map<number, number>(); for (const p of Object.values(g.players)) if (p.club && (!process.env.DBONLY || dbIds.has(p.id))) nplay.set(p.club, (nplay.get(p.club) ?? 0) + 1);
const onlyO = [...O.values()].filter((r) => !U.has(key(r.name, r.nat))), onlyU = [...U.entries()].filter(([k]) => !OK.has(k)).map(([, c]) => c);
const nameMis: R[] = [];
console.log(`oraklet ${O.size} klubber, vi ${U.size}; kun oraklet ${onlyO.length}, kun os ${onlyU.length}, navn forskelligt ${nameMis.length}`);
const by = (xs: string[]) => { const c = new Map<string, number>(); for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1); return [...c].sort((a, b) => b[1] - a[1]); };
console.log('kun oraklet pr. land:', by(onlyO.map((r) => r.nat)).slice(0, 50).map(([k, v]) => `${k} ${v}`).join(', '));
console.log('kun oraklet div/ingen:', by(onlyO.map((r) => (r.div ? 'div' : 'ingen'))));
console.log('kun os pr. land:', by(onlyU.map((c) => g.nations[c.nation]?.name ?? '?')).slice(0, 40).map(([k, v]) => `${k} ${v}`).join(', '));
for (const c of onlyU.slice(0, 30)) console.log('  kun os', c.id, c.name, g.nations[c.nation]?.name, c.league, nplay.get(c.id) ?? 0);
for (const r of nameMis.slice(0, 10)) console.log('  navn', r.id, r.name, '|', U.get(r.id)!.name);
{
  const on = by([...O.values()].map((r) => r.nat)), un = new Map(by([...U.values()].map((c) => g.nations[c.nation]?.name ?? '?')));
  console.log('pr. land (oraklet/os):', on.slice(0, 70).map(([k, v]) => `${k} ${v}/${un.get(k) ?? 0}`).join(', '));
}
{
  // klubspillere pr. land (oraklet: personer med spillerpost +0x61 i en klub)
  const on = new Map<string, number>(), un = new Map<string, number>();
  for (const r of O.values()) on.set(r.nat, (on.get(r.nat) ?? 0) + (plAt.get(r.id) ?? 0));
  for (const c of U.values()) { const k = g.nations[c.nation]?.name ?? '?'; un.set(k, (un.get(k) ?? 0) + (nplay.get(c.id) ?? 0)); }
  const all = [...new Set([...on.keys(), ...un.keys()])].sort((a, b) => (on.get(b) ?? 0) - (on.get(a) ?? 0));
  const tot = (mm: Map<string, number>) => [...mm.values()].reduce((s, x) => s + x, 0);
  console.log(`klubspillere i alt: oraklet ${tot(on)}, vi ${tot(un)}`);
  console.log('klubspillere pr. land (oraklet/os):', all.slice(0, 80).map((k) => `${k} ${on.get(k) ?? 0}/${un.get(k) ?? 0}`).join(', '));
}
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify({ onlyO, onlyU: onlyU.map((c) => ({ id: c.id, name: c.name, nat: g.nations[c.nation]?.name, league: c.league, n: nplay.get(c.id) ?? 0 })) }, null, 1));
