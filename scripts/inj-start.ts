// Startskader: oraklets pre-194-2001.bin mod spillet ved start (England, Arsenal, frø 1, størrelse 2).  WORLD=<world-dbs2.json> npx tsx scripts/inj-start.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { CM_SETUP_INJURIES } from '../src/game/data/cmPreseason';
import { ATTRS } from '../src/game/attributes';
import { dayNum } from '../src/game/cmFitness';

const m = loadSnap(process.env.SNAP ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const str = (a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const S = m.u32(0xae23bc), n = m.s32(0xae2364);
const injBase = m.u32(m.u32(0xb63d28));
let pl = 0, np = 0, none = 0, inj = 0, engPl = 0, engInj = 0;
const types = new Map<number, number>(), jobs = new Map<string, [number, number]>(), oStart = new Map<string, number>(), oTyp = new Map<number, number>(), oMon = new Array(13).fill(0), oDay = new Map<number, number>(), oIP: number[] = [], oEng: [string, boolean][] = []; let oStale = 0; const oW: number[] = [];
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id, pr = m.u32(st + 0x61), npr = m.u32(st + 0x69);
  if (!pr) { if (npr) np++; else none++; continue; }
  pl++;
  const rec = injBase + 31 * id;
  const t = m.s32(rec + 0xe);
  const c = m.u32(st + 0x39), eng = !!c && str(m.u32(c + 0x53) + 4, 51) === 'England';
  if (eng) oEng.push([str(c + 4, 51), t !== -1 && m.u16(m.u32(m.u32(0xb63d28) + 4) + 0x30 * t + 0x22) === 2001 && m.s16(m.u32(m.u32(0xb63d28) + 4) + 0x30 * t + 0x20) < 194]);
  if (eng) { engPl++; oIP[m.s8(pr + 0x2d)] = (oIP[m.s8(pr + 0x2d)] ?? 0) + 1; }
  if (t !== -1) {
    inj++; if (eng) { engInj++; }
    const e = m.u32(m.u32(0xb63d28) + 4) + 0x30 * t, d = m.s16(e + 0x20), y = m.u16(e + 0x22);
    const k = `${eng ? 'ENG' : c ? 'udl' : 'fri'} ${d === 194 && y === 2001 ? 'start' : y === 2001 && d < 194 ? 'forkørsel' : `andet ${d}/${y}`}`;
    oStart.set(k, (oStart.get(k) ?? 0) + 1);
    if (eng && y === 2001 && d + m.s16(e + 0x28) <= 194) oStale++;
    if (eng && y === 2001 && d >= 184 && d < 194) { oW.push(m.s16(e + 0x28)); }
    if (eng && y === 2001 && d + m.s16(e + 0x28) <= 194 && oStale < 4) console.log('stale', d, m.s16(e + 0x28), m.s16(e + 0x2a), m.s16(e + 0x2c), 'rec dato', m.s16(rec), m.u16(rec + 2));
    if (eng) { const ty = m.u8(e); oTyp.set(ty, (oTyp.get(ty) ?? 0) + 1); if (y === 2001 && d < 194) { const mo = new Date(Date.UTC(2001, 0, 1 + d)).getUTCMonth() + 1; oMon[mo]++; if (mo === 7) oDay.set(d, (oDay.get(d) ?? 0) + 1); } }
  }
  const j = `${m.u8(st + 0x3d)}${c ? '' : ' klubløs'}${eng ? ' ENG' : ''}`, e = jobs.get(j) ?? [0, 0];
  e[0]++; if (t !== -1) e[1]++; jobs.set(j, e);
}
console.log('ORAKEL skadernes startdato', [...oStart].sort().map(([k, v]) => `${k}: ${v}`).join(' · '));
console.log('ORAKEL England forkørslens skader pr. startmåned', oMon.slice(1, 8).join(' '));
console.log('ORAKEL England udløbne (start + w28 <= 194)', oStale);
console.log('ORAKEL juli-skader w28: n', oW.length, 'gns', (oW.reduce((a, b) => a + b, 0) / oW.length).toFixed(1), 'median', oW.sort((a, b) => a - b)[oW.length >> 1]);
console.log('ORAKEL IP England', oIP.join(' '));
console.log('ORAKEL juli pr. dag', [...oDay].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(' '));
console.log('ORAKEL England typer', [...oTyp].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${k}:${v}`).join(' '));
console.log('ORAKEL job +0x3d: antal/skadede', [...jobs].sort((a, b) => b[1][0] - a[1][0]).map(([k, v]) => `${k}: ${v[0]}/${v[1]}`).join(' · '));
console.log(`ORAKEL: staff-tabel ${n}: spillere ${pl}, ikke-spillere ${np}, uden post ${none}; skadede ${inj} (${(100 * inj / pl).toFixed(2)} %); England ${engInj}/${engPl} (${(100 * engInj / engPl).toFixed(2)} %)`);
void types;
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
const g = gs();
const ps = Object.values(g.players).filter((p) => !p.regen);
const oi = ps.filter((p) => p.cmFit?.inj);
const oe = ps.filter((p) => p.club && g.clubs[p.club]?.nation === eng), oei = oe.filter((p) => p.cmFit?.inj);
{
  const setup = new Set(CM_SETUP_INJURIES['3.9.60'].map((x) => x[0]));
  const es = oei.filter((p) => setup.has(p.id)).length, as = oi.filter((p) => setup.has(p.id)).length;
  console.log(`VORES: fra player_setup.cfg ${as} (England ${es}); tilfældige ${oi.length - as} af ${ps.length} (${(100 * (oi.length - as) / ps.length).toFixed(2)} %), England ${oei.length - es} af ${oe.length} (${(100 * (oei.length - es) / oe.length).toFixed(2)} %)`);
  const hist = new Map<string, number>();
  for (const p of oei) { const k = `${p.cmFit!.inj!.t}`; hist.set(k, (hist.get(k) ?? 0) + 1); }
  const mon = new Array(13).fill(0);
  for (const p of oei) if (!setup.has(p.id)) mon[new Date(p.cmFit!.inj!.d * 86400000).getUTCMonth() + 1]++;
  console.log('VORES England forkørslens skader pr. startmåned', mon.slice(1, 8).join(' '));
  const dd = new Map<number, number>(); for (const p of oei) if (!setup.has(p.id)) { const x = p.cmFit!.inj!.d - Date.UTC(2001, 0, 1) / 86400000; if (x >= 181) dd.set(x, (dd.get(x) ?? 0) + 1); }
  const ip: number[] = []; for (const p of oe) { const v = p.attrs[ATTRS.indexOf('injuryProneness' as never)]; ip[v] = (ip[v] ?? 0) + 1; } console.log('VORES IP England', ip.join(' '));
  console.log('VORES England udløbne', oei.filter((p) => p.cmFit!.inj!.d + p.cmFit!.inj!.w28 <= dayNum(g.date)).length);
  { const w = oei.filter((p) => !setup.has(p.id) && p.cmFit!.inj!.d >= dayNum('2001-07-03')).map((p) => p.cmFit!.inj!.w28).sort((a, b) => a - b); console.log('VORES juli-skader w28: n', w.length, 'gns', (w.reduce((a, b) => a + b, 0) / w.length).toFixed(1), 'median', w[w.length >> 1]); }
  console.log('VORES juli pr. dag', [...dd].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(' '));
  console.log('VORES England typer', [...hist].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${k}:${v}`).join(' '));
}
console.log(`VORES: spillere ${ps.length}, g.staff ${Object.keys(g.staff).length}; skadede ${oi.length} (${(100 * oi.length / ps.length).toFixed(2)} %); England ${oei.length}/${oe.length} (${(100 * oei.length / oe.length).toFixed(2)} %)`);
{ const names = new Set(Object.values(g.clubs).filter((c) => c.nation === eng).map((c) => c.name)); const a = oEng.filter((x) => names.has(x[0])), b = oEng.filter((x) => !names.has(x[0])); console.log(`ORAKEL England i vores klubber: ${a.filter((x) => x[1]).length}/${a.length} (${(100 * a.filter((x) => x[1]).length / a.length).toFixed(2)} %), andre: ${b.filter((x) => x[1]).length}/${b.length}`); }
{ const st = Object.values(g.staff); const mem = st.filter((s) => s.cmMem).length, ext = st.filter((s) => s.cmExtra).length; const pe = ps.filter((p) => p.club ? g.clubs[p.club]?.nation === eng : p.nation === eng).length; const free = ps.filter((p) => !p.club).length; console.log(`VORES stab: ${st.length}, cmMem ${mem}, cmExtra ${ext}; spillere i/fra England ${pe}, klubløse ${free}, cmMem-spillere ${ps.filter((p) => p.cmMem).length}`); }
