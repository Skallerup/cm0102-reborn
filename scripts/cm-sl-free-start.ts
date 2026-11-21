// Klubløse som mål på ligaklubbernes ønskelister (de fire engelske ligaer): spillets spilstart (createGame, WORLD = CM_DBSIZE=2) mod
// originalens øjebliksbillede (pre-194-2001.bin, 14/7-2001, frø 1). Lister målene (navn, alder, CA, omdømme, land) begge steder.
//   WORLD=<world-dbs2.json> npx tsx scripts/cm-sl-free-start.ts [snap] [dage=0]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { G, getContract } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { fromRow } from '../src/game/cmSquadPlanGame';
import { ageOn } from '../src/game/dates';

const snap = process.argv[2] ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`;
const days = +(process.argv[3] ?? 0);
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const LG = ['CM7', 'CM8', 'CM9', 'CM10'];
const leagueNames = new Set((w.clubs as unknown as [number, string, string, number, string][]).filter((c) => LG.includes(c[4])).map((c) => c[1]));
// originalen
const m = loadSnap(snap);
const cb = m.u32(G.CLUBS), staff = m.u32(0xae23bc), nClubs = m.s32(0xae235c);
const str = (a: number) => { let s = ''; for (let i = 0; i < 54; i++) { const ch = m.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
const slm = m.u32(m.u32(0xde1f54) + 0x856);
const oFree: string[] = [];
let oT = 0, oExt = 0, oStaff = 0, oStaffFree = 0;
for (let id = 0; id < nClubs; id++) {
  const name = str(cb + 0x245 * id + 4);
  if (!leagueNames.has(name)) continue;
  const ent = m.u32(slm + 0xdc) + 9 * id, base = m.u32(ent);
  if (!base) continue;
  for (let i = 0; i < 40; i++) {
    const s = base + 0x25 * i, role = m.u8(s);
    if (role === 0 || role === 0xff) continue;
    const t = m.s32(s + 0xf);
    if (t < 0) continue;
    oT++;
    const st = staff + 0x6e * t;
    const pr = m.u32(st + 0x61);
    if (role !== 0xb) { oStaff++; if (!getContract(m, st)) oStaffFree++; continue; }
    const k = getContract(m, st);
    if (!k || m.s32(k + 4) !== id) oExt++;
    if (k) continue;
    oFree.push(`${name}[${i}] ${str(m.u32(st + 4))} ${str(m.u32(st + 8))} ${m.s16(st + 0x10)}/${m.u16(st + 0x12)} CA ${pr ? m.s16(pr + 5) : '?'} PA ${pr ? m.s16(pr + 7) : '?'} rep ${pr ? m.s16(pr + 0xd) : '?'} ${str(m.u32(st + 0x1a) + 4)} +7 ${m.s32(s + 7)}`);
  }
}
console.log(`ORIGINALEN ${snap.split('/').pop()}: mål ${oT} (stab ${oStaff}, klubløse ${oStaffFree}), spillermål uden for klubben ${oExt}, klubløse spillermål ${oFree.length}`);
console.log(oFree.sort().join('\n'));
// spillet
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: +(process.env.SEED ?? 1), mode: 'authentic' });
const g = gs();
for (let d = 0; d < days; d++) { const to = g.date; while (g.date === to || g.pendingFixture) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); } }
const uFree: string[] = [];
let uT = 0, uExt = 0, uStaff = 0, uStaffFree = 0;
for (const c of Object.values(g.clubs)) {
  if (!leagueNames.has(c.name) || !LG.includes(c.league)) continue;
  const st = g.cmPlan?.[c.id];
  if (!st) continue;
  st.s.map(fromRow).forEach((s, i) => {
    if (s.role === 0 || s.role === 0xff || s.f < 0) return;
    uT++;
    if (s.role !== 0xb) { uStaff++; if (!(g.staff?.[s.f] as { club?: number } | undefined)?.club) uStaffFree++; return; }
    const p = g.players[s.f];
    if (p?.club !== c.id) uExt++;
    if (!p || p.club) return;
    uFree.push(`${c.name}[${i}] ${p.first} ${p.last} ${p.dob} (${ageOn(p.dob, g.date)}) CA ${p.ca} PA ${p.pa} rep ${(p as { cmRep?: number }).cmRep ?? '?'} ${g.nations[p.nation]?.name} +7 ${s.b7}`);
  });
}
console.log(`\nSPILLET ${g.date}: mål ${uT} (stab ${uStaff}, klubløse? ${uStaffFree}), spillermål uden for klubben ${uExt}, klubløse spillermål ${uFree.length}`);
console.log(uFree.sort().join('\n'));
// parring på efternavn + fødselsdato: hvor står originalens klubløse mål hos os, og vores i originalen?
const isoDay = (iso: string) => { const y = +iso.slice(0, 4); return `${Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000)}/${y}`; };
const ours = new Map<string, typeof g.players[number]>();
for (const p of Object.values(g.players)) ours.set(`${p.last}|${isoDay(p.dob)}`, p);
const origBy = new Map<string, number>();
for (let id = 0; id < m.s32(0xae2364); id++) { const st = staff + 0x6e * id; origBy.set(`${str(m.u32(st + 8))}|${m.s16(st + 0x10)}/${m.u16(st + 0x12)}`, id); }
console.log('\noriginalens klubløse mål hos os:');
for (const l of [...new Set(oFree.map((x) => x.split('] ')[1].split(' CA')[0]))]) {
  const [, last, d] = l.split(' ');
  const p = ours.get(`${last}|${d}`);
  console.log(`  ${l}: ${!p ? 'findes ikke' : p.club ? `${g.clubs[p.club].name} (${g.clubs[p.club].league}) kontrakt ${p.contract?.expires}` : `klubløs CA ${p.ca}`}`);
}
console.log('vores klubløse mål i originalen:');
for (const l of [...new Set(uFree.map((x) => x.split('] ')[1].split(' (')[0]))]) {
  const [, last, dob] = l.split(' ');
  const id = origBy.get(`${last}|${isoDay(dob)}`);
  const k = id === undefined ? 0 : getContract(m, staff + 0x6e * id);
  console.log(`  ${l}: ${id === undefined ? 'findes ikke' : k ? `klub ${str(cb + 0x245 * m.s32(k + 4) + 4)}` : `klubløs (pr ${m.u32(staff + 0x6e * id + 0x61) ? 'ja' : 'nej'})`}`);
}
