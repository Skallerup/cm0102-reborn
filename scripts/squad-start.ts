// Trupperne ved spilstart: oraklets pre-194-2001.bin (club +0xd7, 50 pladser) mod spillets squad() pr. engelsk klub (frø 1, Arsenal, størrelse 2).
//   WORLD=<world-dbs2.json> npx tsx scripts/squad-start.ts [klub]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';

const m = loadSnap(process.env.SNAP ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const str = (a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(0xae23bc), n = m.s32(0xae2364);
const orig = new Map<string, { n: number; names: string[]; loanIn: number }>();
for (let i = 0; i < nc; i++) {
  const c = C + 0x245 * i;
  if (str(m.u32(c + 0x53) + 4, 51) !== 'England') continue;
  const names: string[] = [];
  let loanIn = 0;
  for (let k = 0; k < 50; k++) {
    const st = m.u32(c + 0xd7 + 4 * k);
    if (!st) continue;
    const id = m.s32(st);
    if (id < 0 || id >= n) continue;
    if (!m.u32(st + 0x61)) continue;                                       // nur spillere
    const nm = str(m.u32(st + 0xc)) || `${str(m.u32(st + 4))} ${str(m.u32(st + 8))}`;
    names.push(nm);
    void S;
  }
  orig.set(str(c + 4, 51), { n: names.length, names, loanIn });
}
// staff +0x39 (den nuværende klub – lejeklubben for de udlejede), som cm-day-lockstep's 'truppens størrelse'
const by39 = new Map<string, number>(), names39 = new Map<string, string[]>();
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id; if (!m.u32(st + 0x61)) continue; const c = m.u32(st + 0x39); if (!c) continue;
  const nm = str(c + 4, 51); by39.set(nm, (by39.get(nm) ?? 0) + 1);
  (names39.get(nm) ?? names39.set(nm, []).get(nm)!).push(`${str(m.u32(st + 4))} ${str(m.u32(st + 8))}|${m.u16(st + 0x12)}`);
}
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
let tot = 0, totO = 0, k = 0, tot39 = 0, d39 = 0;
const rows39: string[] = [];
const rows: string[] = [];
for (const c of Object.values(g.clubs)) {
  if (c.nation !== eng) continue;
  const o = orig.get(c.name);
  if (!o) continue;
  const ours = squad(c.id).filter((p) => !p.virtual && !p.regen);
  tot += ours.length; totO += o.n; k++;
  const o39 = by39.get(c.name) ?? 0; tot39 += o39;
  if (o39 !== ours.length) { d39++; rows39.push(`${c.name}: ${ours.length} mod ${o39}`); }
  if (ours.length !== o.n) rows.push(`${c.name} (${g.leagues[c.league]?.name ?? c.league}): ${ours.length} mod ${o.n}`);
  if (process.argv.slice(2).includes(c.name)) {
    const o39n = names39.get(c.name) ?? [], ourK = new Set(ours.map((p) => `${p.first} ${p.last}`));
    const memK = new Set(o39n.map((x) => x.split('|')[0]));
    console.log(`${c.name} +0x39 kun hos os:`, ours.filter((p) => !memK.has(`${p.first} ${p.last}`)).map((p) => `${p.first} ${p.last} ${p.dob}${p.loan ? ' (lejet)' : ''}`).join(', '));
    console.log(`${c.name} +0x39 kun i originalen:`, o39n.filter((x) => !ourK.has(x.split('|')[0])).join(', '));
    const on = new Set(o.names), un = new Set(ours.map((p) => `${p.first} ${p.last}`.trim()));
    console.log('kun hos os:', ours.filter((p) => !on.has(`${p.first} ${p.last}`.trim()) && !on.has(p.last)).map((p) => `${p.first} ${p.last}${p.loan ? ' (lejet)' : ''}`).join(', '));
    console.log('kun i originalen:', o.names.filter((x) => !un.has(x) && ![...un].some((u) => u.endsWith(` ${x}`))).join(', '));
  }
}
console.log(`${k} klubber parret; spillere i alt ${tot} mod ${totO}; afvigende ${rows.length}`);
console.log(rows.slice(0, Number(process.env.N ?? 40)).join('\n'));
console.log(`staff +0x39: i alt ${tot} mod ${tot39}; afvigende ${d39}`);
console.log(rows39.slice(0, Number(process.env.N ?? 40)).join('\n'));
