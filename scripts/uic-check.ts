// Intertoto 2001 mod oraklet: deltagerne pr. runde og kampene (dato, hold, resultat) fra spilstart.
//   WORLD=<world-dbs2.json> npx tsx scripts/uic-check.ts [til-dato=2001-08-25]
// Oraklet: ~/cm0102-engine/oracle/runs/crowd1.txt (K-linjerne med turnering 330) + navnene fra dagsbilledet 14/7 (daysnap s1-3.9.60-e1).
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { loadDaySnap, readDaySnapIndex } from './oracle-days';

const TO = process.argv[2] ?? '2001-08-25';
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const nm = (c: number) => `${g.clubs[c]?.name} (${g.nations[g.clubs[c]?.nation]?.name})`;
const uic = g.comps.UIC;
const entry = (uic?.meta?.entry ?? {}) as Record<string, number[]>;
if (process.env.DUMP) {
  const rows: string[] = [];
  for (const id of ['CL', 'UEFA', 'UIC']) for (const c of g.comps[id]?.clubs ?? []) rows.push(`${g.nations[g.clubs[c].nation]?.name}\t${id}\t${g.clubs[c].name}`);
  (await import('node:fs')).writeFileSync(process.env.DUMP, rows.sort().join('\n') + '\n');
}
console.log('## vores deltagere');
for (const k of ['R1', 'R2', 'R3']) console.log(k, (entry[k] ?? []).length, (entry[k] ?? []).map(nm).sort().join('; '));

// oraklet
const crowd = join(homedir(), 'cm0102-engine/oracle/runs/crowd1.txt');
const ix = readDaySnapIndex();
if (existsSync(crowd) && ix) {
  const m = loadDaySnap(ix, ix.snaps[0]);
  const str = (a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
  const C = m.u32(0xae23b4);
  const onm = (i: number) => `${str(C + 0x245 * i + 4, 51)} (${str(m.u32(C + 0x245 * i + 0x53) + 4, 51)})`;
  const ties: { day: number; h: number; a: number }[] = [];
  for (const l of readFileSync(crowd, 'utf8').split('\n')) {
    if (!l.startsWith('K ')) continue;
    const p = l.split('|');
    if (p[1].trim().split(' ')[0] !== '330') continue;
    ties.push({ day: +p[0].split(' ')[1], h: +p[2].trim().split(' ')[1], a: +p[3].trim().split(' ')[1] });
  }
  const days = [...new Set(ties.map((t) => t.day))].sort((a, b) => a - b);
  const seen = new Set<number>();
  const rounds: string[][] = [];
  for (const d of days) {
    const neu: string[] = [];
    for (const t of ties.filter((x) => x.day === d)) for (const c of [t.h, t.a]) if (!seen.has(c)) { seen.add(c); neu.push(onm(c)); }
    if (neu.length) rounds.push(neu);
  }
  console.log('## oraklets deltagere');
  rounds.forEach((r, i) => console.log(`R${i + 1}`, r.length, r.sort().join('; ')));
  const ours = new Set(Object.values(entry).flat().map(nm));
  const theirs = new Set(rounds.flat());
  console.log(`fælles: ${[...ours].filter((x) => theirs.has(x)).length}/${theirs.size}; England hos os: ${[...ours].filter((x) => x.endsWith('(England)')).join(', ')}`);
  console.log('kun hos os:', [...ours].filter((x) => !theirs.has(x)).join('; ') || '–');
  console.log('kun i oraklet:', [...theirs].filter((x) => !ours.has(x)).join('; ') || '–');
  rounds.forEach((r, i) => {
    const o = new Set((entry[`R${i + 1}`] ?? []).map(nm));
    console.log(`R${i + 1} samme runde: ${r.filter((x) => o.has(x)).length}/${r.length}`);
  });
  console.log('## oraklets kampe fra 14/7');
  for (const t of ties.filter((x) => x.day >= 194)) console.log(new Date(Date.UTC(2001, 0, 1 + t.day)).toISOString().slice(0, 10), onm(t.h), '–', onm(t.a));
}

// vores kampe frem til TO
const fin0 = new Map<number, unknown>();
for (const nmC of ['Aston Villa', 'Newcastle United']) { const c = Object.values(g.clubs).find((x) => x.name === nmC); if (c) fin0.set(c.id, JSON.stringify((c as unknown as { finance?: unknown }).finance ?? null)); }
const VN = ['Aston Villa', 'Newcastle United'].map((x) => Object.values(g.clubs).find((c) => c.name === x)!);
const fin = () => VN.map((c) => { const r = g.cmFin?.[c.id]; return r ? [r.ty[10], r.ty[16]] : [0, 0]; });
const f0 = fin();
let shown = false;
for (let i = 0; i < 400 && g.date < TO; i++) {
  const r = continueGame(); if (r.match) quickPlayUserMatch();
  if (!shown && g.date > '2001-07-14') {
    shown = true;
    const f1 = fin();
    VN.forEach((c, k) => console.log(`14/7 ${c.name}: billetindtægt £${f1[k][0] - f0[k][0]}, tv £${f1[k][1] - f0[k][1]}`));
  }
}
console.log('dato', g.date, 'UIC-uafgjorte', g.comps.UIC?.ties.filter((t) => t.winner === undefined).length, 'stadier', JSON.stringify(Object.fromEntries(['R1','R2','R3','SF','F'].map((k) => [k, g.comps.UIC?.ties.filter((t) => t.stage === k).length]))));
console.log('## vores kampe');
for (const f of Object.values(g.fixtures).filter((x) => x.comp === 'UIC').sort((a, b) => a.date.localeCompare(b.date)))
  console.log(f.date, nm(f.home), '–', nm(f.away), f.result ? `${f.result.hg}-${f.result.ag}` : '');
