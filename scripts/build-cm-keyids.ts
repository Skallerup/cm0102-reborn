// Originalens nøgle-id'er og faste .data-tabeller til de oversatte funktioner (cmGen/) → src/game/cmKeyIds.ts.
// Kilder: øjebliksbilledet 14/7-2001 (id-globalerne fyldes af spillet ved indlæsningen – nationer, turneringer, klubber efter navn) og
// cm0102.exe's .data (tabellerne er faste).   npx tsx scripts/build-cm-keyids.ts [snap]
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';

const m = loadSnap(process.argv[2] ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const exe = readFileSync(`${homedir()}/cm0102-engine/cm0102.exe`);
const xo = (a: number) => a - 0x987000 + 0x587000;
const str = (a: number) => { let s = ''; for (let i = 0; i < 60; i++) { const b = m.u8(a + i); if (!b) break; s += String.fromCharCode(b); } return Buffer.from(s, 'latin1').toString('latin1'); };
const clubs = m.u32(0xae23b4), nClubs = m.s32(0xae235c), nNat = m.s32(0xae2350);
// landenes poster (stride fra klubbernes pegere)
const nat = new Map<number, number>();
for (let i = 0; i < nClubs; i++) { const p = m.u32(clubs + 0x245 * i + 0x53); if (p) nat.set(m.s32(p), p); }
const ids = [...nat.keys()].sort((a, b) => a - b);
const nStride = (nat.get(ids[1])! - nat.get(ids[0])!) / (ids[1] - ids[0]);
const nBase = nat.get(ids[0])! - nStride * ids[0];
const natName = (id: number) => str(nBase + nStride * id + 4);

const nations: [number, string][] = [];
for (let a = 0x9cf200; a < 0x9cf548; a += 4) { const v = m.s32(a); if (v >= 0 && v < nNat) nations.push([a, natName(v)]); }
const comps: [number, number][] = [];
for (let a = 0x9cf548; a < 0x9cfa08; a += 4) comps.push([a, m.s32(a)]);
const clubG: [number, string][] = [];
for (const a of [...Array(0x14a).keys()].map((i) => 0x9d0000 + 4 * i).concat([...Array(0x1a).keys()].map((i) => 0xb63c9c + 4 * i))) { const v = m.s32(a); if (v >= 0 && v < nClubs) clubG.push([a, str(clubs + 0x245 * v + 4)]); }
const n7f: [string, number][] = [];
for (let id = 0; id < nNat; id++) { const v = m.u8(nBase + nStride * id + 0x7f); if (v) n7f.push([natName(id), v]); }
const pct = [...exe.subarray(xo(0x9a7f30), xo(0x9a7f30) + 20)];
const fees = Array.from({ length: 21 }, (_, i) => exe.readDoubleLE(xo(0x9a7f48) + 8 * i));
const out = `// Genereret af scripts/build-cm-keyids.ts – ret ikke i hånden.
// Originalens nøgle-id'er (globalerne [0x9cf200..0x9cf544] landene, [0x9cf548..0x9cfa04] turneringerne, [0x9d0000..0x9d0524] og [0xb63c9c..0xb63d00] klubberne –
// spillet fylder dem ved indlæsningen) og faste .data-tabeller fra cm0102.exe 3.9.68 (0x9a7f30 aldersprocenterne i 0x4d0c60, 0x9a7f48
// beløbsgrænserne pr. omdømme/1000 i 0x4d1600), landenes nation.dat-felt +0x7f (EU-medlem = 2).
export const KEY_NATION_GLOBALS: [number, string][] = ${JSON.stringify(nations)};
export const KEY_COMP_GLOBALS: [number, number][] = ${JSON.stringify(comps)};
export const KEY_CLUB_GLOBALS: [number, string][] = ${JSON.stringify(clubG)};
export const NATION_7F: [string, number][] = ${JSON.stringify(n7f)};
export const AGE_PCT_9A7F30 = ${JSON.stringify(pct)};
export const FEE_STEPS_9A7F48 = ${JSON.stringify(fees)};
`;
writeFileSync('src/game/cmKeyIds.ts', out);
console.log(`lande ${nations.length}, turneringer ${comps.length}, klubber ${clubG.length}, +0x7f ${n7f.length}: ${n7f.map(([a, b]) => `${a}=${b}`).join(', ')}`);
