// De klubløse spillere i originalen ved spilstarten (pre-194-2001.bin, England valgt) parret med spillets spillere på efternavn + fødselsdato:
// hvor de står i spillet (klub / klubløs / findes ikke).   npx tsx scripts/cm-free-start.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const om = loadSnap(`${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const str = (a: number) => { let s = ''; for (let i = 0; i < 54; i++) { const ch = om.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
const n = om.s32(0xae2364), staff = om.u32(0xae23bc), rows = om.u32(0xae2d0c);
const free: { last: string; first: string; d: string; nat: string; rep: number }[] = [];
for (let id = 0; id < n; id++) {
  const st = staff + 0x6e * id, rec = om.u32(st + 0x61);
  if (!rec || om.u32(st + 0x39)) continue;
  free.push({ last: str(om.u32(st + 8)), first: str(om.u32(st + 4)), d: `${om.s16(st + 0x10)}|${om.u16(st + 0x12)}`, nat: str(om.u32(st + 0x1a) + 4), rep: om.s16(rec + 0xd) });
}
void rows;
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const isoDay = (iso: string) => { const y = +iso.slice(0, 4); return `${Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000)}|${y}`; };
const by = new Map<string, typeof g.players[number][]>();
for (const p of Object.values(g.players)) { const k = `${p.last}|${isoDay(p.dob)}`; const l = by.get(k) ?? []; l.push(p); by.set(k, l); }
const cat: Record<string, number> = {};
const ex: string[] = [];
for (const f of free) {
  const ps = by.get(`${f.last}|${f.d}`) ?? [];
  const p = ps[0];
  const k = !p ? 'findes ikke' : !p.club ? 'klubløs' : `i en klub (${g.leagues[g.clubs[p.club].league]?.hidden ? 'skjult liga' : 'liga'}, ${g.nations[g.clubs[p.club].nation]?.name === 'England' ? 'ENG' : 'udl.'})`;
  cat[k] = (cat[k] ?? 0) + 1;
  if (ex.length < 25 && p?.club) ex.push(`${f.first} ${f.last} (${f.d}, ${f.nat}, rep ${f.rep}) → spillet: ${g.clubs[p.club].name}, kontrakt til ${p.contract?.expires}, kom ${p.joined ?? p.cmJoined}`);
}
console.log(`originalens klubløse spillere ved start: ${free.length} (engelske ${free.filter((f) => f.nat === 'England').length})`, cat);
console.log(ex.join('\n'));
