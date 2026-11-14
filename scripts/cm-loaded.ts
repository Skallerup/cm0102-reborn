// Hvilke af spillets spillere originalen har i hukommelsen ved spilstarten (pre-194-2001.bin, kun England valgt – 8.904 personer): parret på
// klubbens navn + fødselsdato (frie spillere på navn + fødselsdato). Tæller pr. kategori, så ønskelisternes kandidater kan begrænses som i
// originalen.   npx tsx scripts/cm-loaded.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const om = loadSnap(`${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const str = (a: number) => { let s = ''; for (let i = 0; i < 54; i++) { const ch = om.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
const keys = new Set<string>(), dobs = new Set<string>();
const n = om.s32(0xae2364), staff = om.u32(0xae23bc);
for (let id = 0; id < n; id++) {
  const st = staff + 0x6e * id;
  if (!om.u32(st + 0x61)) continue;
  const c = om.u32(st + 0x39);
  const d = `${om.s16(st + 0x10)}|${om.u16(st + 0x12)}`;
  dobs.add(`${str(om.u32(st + 8))}|${d}`);
  if (c) keys.add(`${str(c + 4)}|${d}`);
}
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const isoDay = (iso: string) => { const y = +iso.slice(0, 4); return `${Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000)}|${y}`; };
const cat = new Map<string, [number, number]>();
const add = (k: string, hit: boolean) => { const e = cat.get(k) ?? [0, 0]; e[0]++; if (hit) e[1]++; cat.set(k, e); };
const active = new Set(g.activeNations);
for (const p of Object.values(g.players)) {
  if (p.regen) continue;
  const home = p.loan?.from ?? p.club;
  const c = home ? g.clubs[home] : undefined;
  const hit = c ? keys.has(`${c.name}|${isoDay(p.dob)}`) || dobs.has(`${p.last}|${isoDay(p.dob)}`) : dobs.has(`${p.last}|${isoDay(p.dob)}`);
  const lg = c ? g.leagues[c.league] : undefined;
  const k = !c ? `fri (${active.has(p.nation) ? 'aktiv nationalitet' : p.ca >= 150 ? 'CA 150+' : 'andre'}${p.cmJoined || p.joined ? '' : ''})` : active.has(c.nation) ? (lg?.hidden ? 'aktivt land, skjult liga' : 'aktivt land') : lg?.hidden ? 'andet land, skjult' : `andet land, liga (${p.ca >= 150 ? 'CA 150+' : p.ca >= 120 ? 'CA 120+' : 'CA < 120'})`;
  add(k, hit);
  add(`alle`, hit);
  if (c && !active.has(c.nation) && !lg?.hidden) {
    const r = (p as unknown as { cmRep?: number[] }).cmRep;
    const rb = r ? Math.floor(Math.max(r[0], r[1], r[2]) / 20) : -1;
    add(`  udl. omdømme max ${rb * 20}+`, hit);
    add(`  udl. klubomdømme ${Math.floor((c.rep ?? 0) / 10) * 10}`, hit);
  }
}
const perClub = new Map<number, [number, number]>();
for (const p of Object.values(g.players)) {
  if (p.regen) continue;
  const home = p.loan?.from ?? p.club; const c = home ? g.clubs[home] : undefined;
  if (!c || active.has(c.nation)) continue;
  const e = perClub.get(c.id) ?? [0, 0]; e[0]++; if (keys.has(`${c.name}|${isoDay(p.dob)}`)) e[1]++; perClub.set(c.id, e);
}
{
  const grid = new Map<string, [number, number]>();
  for (const p of Object.values(g.players)) {
    if (p.regen) continue;
    const home = p.loan?.from ?? p.club; const c = home ? g.clubs[home] : undefined;
    if (!c || active.has(c.nation) || g.leagues[c.league]?.hidden) continue;
    const k = `CA ${Math.min(150, Math.floor(p.ca / 10) * 10)} klub ${c.rep >= 80 ? '80+' : c.rep >= 70 ? '70+' : '<70'}`;
    const e = grid.get(k) ?? [0, 0]; e[0]++; if (keys.has(`${c.name}|${isoDay(p.dob)}`)) e[1]++; grid.set(k, e);
  }
  for (const [k, [a, b]] of [...grid].sort()) console.log(`  gitter ${k}: ${b}/${a}`);
}
{
  const euro = new Set<number>();
  for (const comp of Object.values(g.comps)) if (comp.type === 'continental') for (const c of comp.clubs) euro.add(c);
  console.log('kontinentale turneringer: ' + Object.values(g.comps).filter((c) => c.type === 'continental').map((c) => `${c.id}:${c.clubs.length}`).join(' '));
  const e2 = new Map<string, [number, number]>();
  for (const p of Object.values(g.players)) {
    if (p.regen) continue;
    const home = p.loan?.from ?? p.club; const c = home ? g.clubs[home] : undefined;
    if (!c || active.has(c.nation)) continue;
    const nat = active.has(p.nation) || (p.cmNation2 !== undefined && active.has(p.cmNation2)) ? 'aktiv nationalitet' : (p.caps ?? 0) >= 10 ? 'landsholdsspiller 10+' : (p.caps ?? 0) > 0 ? 'landskampe 1-9' : 'ingen landskampe';
    const k = `${euro.has(c.id) ? 'Europa' : 'ikke Europa'} ${p.ca >= 150 ? 'CA 150+' : 'CA < 150'} ${nat} ${g.nations[c.nation]?.name === 'Wales' || g.nations[c.nation]?.name === 'Scotland' ? '(WAL/SCO-klub)' : ''}`;
    const e = e2.get(k) ?? [0, 0]; e[0]++; if (keys.has(`${c.name}|${isoDay(p.dob)}`)) e[1]++; e2.set(k, e);
  }
  for (const [k, [a, b]] of e2) console.log(`  ${k}: ${b}/${a}`);
}
const full = [...perClub].filter(([, [a, b]]) => b >= a * 0.6);
console.log(`udl. klubber ${perClub.size}, næsten hele trupper i originalen ${full.length}: ` + full.map(([id, [a, b]]) => `${g.clubs[id].name} (${g.nations[g.clubs[id].nation]?.name}, rep ${g.clubs[id].rep}${g.leagues[g.clubs[id].league]?.hidden ? ', skjult' : ''}) ${b}/${a}`).join('; '));
const part = [...perClub].filter(([, [a, b]]) => b > 0 && b < a * 0.6).length;
console.log(`delvist: ${part}`);
for (const [k, [a, b]] of cat) console.log(`${k}: ${a} spillere, i originalen ${b}`);
console.log(`originalens spillere ${keys.size} (med klub)`);
