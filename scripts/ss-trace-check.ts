// (runde 9) Kontrol af staffpostens byte [0xae2d0c] + 79·id + 0xa (Player.cmStaffState, cmPlayerData.ts) mod oraklets spor (match_trace.c
// RECOMP_CROWD_TRACE: "s0"/"sd"/"so"/"sr"-linjerne). Staff-id'erne i sporet = databasens id'er = spillets Player.id (den originale database).
//   npx tsx scripts/ss-trace-check.ts [spor = ~/cm0102-engine/oracle/runs/crowd1.txt] [dag = 229 (2001-08-18)]
// 1. Spilstarten 0x828110: hver værdi i "s0" (sporets første daglige opdatering) skal kunne nås af formlen med spillets data (klub, ankomst,
//    Adaptability, CA) – mulige værdier c − bl − r (r = 0..bl−1), højst ftol(CA·0,15).
// 2. Fordelingen på dagen (sporets s0 + alle sd/so-ændringer til og med dagen) mod spillets efter ADVANCE (spillet kørt frem til dagen).
import { createReadStream, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { ATTRS } from '../src/game/attributes';

const file = process.argv[2] ?? `${process.env.HOME}/cm0102-engine/oracle/runs/crowd1.txt`;
const DAY = Number(process.argv[3] ?? 229);
const s0 = new Map<number, number>(), now = new Map<number, number>();
let s0day = 0;
const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
for await (const l of rl) {
  if (l[0] !== 's' || l[1] === 'r') continue;
  const f = l.split(' '), d = +f[1];
  if (f[0] === 's0') { s0day = d; for (const x of f.slice(3)) { const [i, v] = x.split(':').map(Number); s0.set(i, v); now.set(i, v); } continue; }
  if (d > DAY) break;
  for (const x of f.slice(3)) { const [i, , v] = x.split(':').map(Number); now.set(i, v); }
}
// sporets staff-id'er er HUKOMMELSENS indeks (ikke databasens id): kampspillerne i et kampspor fra samme opsætning (ls20.txt: M/CL/R/RS-linjerne –
// klubbens navn, fødselsdagen staff +0x10/+0x12 og CA +5) giver kortet staff-id → spillets spiller
const HEADS = process.env.HEADS ?? `${process.env.HOME}/cm0102-engine/oracle/runs/ls20.txt`;
const heads: { club: string; staff: number; dob: string; ca: number }[] = [];
{
  const hx = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));
  let cl: string[] = [], n = 0; const rec = new Map<string, Uint8Array>();
  let pend: { side: number; staff: number; dob: string; ca: number }[] = [];
  const flush = () => { for (const q of pend) if (!heads.some((h) => h.staff === q.staff)) heads.push({ club: cl[q.side], staff: q.staff, dob: q.dob, ca: q.ca }); pend = []; };
  const rl2 = createInterface({ input: createReadStream(HEADS), crlfDelay: Infinity });
  for await (const l of rl2) {
    if (l.startsWith('M ')) { flush(); if (++n > 20) break; cl = []; rec.clear(); continue; }
    if (l.startsWith('CL ')) { const f = l.split(' '); cl[+f[1]] = Buffer.from(hx(f[2]).slice(4, 55)).toString('latin1').split('\0')[0]; continue; }
    if (l.startsWith('R ')) { const f = l.split(' '); rec.set(`${f[1]},${[...rec.keys()].filter((k) => k.startsWith(f[1] + ',')).length}`, hx(f[4])); continue; }
    if (l.startsWith('RS ')) {
      const f = l.split(' '), st = hx(f[4]), r = rec.get(`${f[1]},${f[2]}`);
      const dob = new Date(Date.UTC(st[0x12] | (st[0x13] << 8), 0, 1) + (st[0x10] | (st[0x11] << 8)) * 86400000).toISOString().slice(0, 10);
      pend.push({ side: +f[1], staff: +f[3], dob, ca: r ? ((r[5] | (r[6] << 8)) << 16) >> 16 : -1 });
    }
  }
  flush();
}
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
const sh = (p: { attrs: number[] }, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
const start = new Date(Date.UTC(2001, 0, 1) + s0day * 86400000).toISOString().slice(0, 10);
let ok = 0, bad = 0, zeroOrig = 0, missing = 0; const ex: string[] = [];
for (const p of Object.values(g.players)) {
  if (p.regen) continue;
  const o = s0.get(p.id) ?? 0;
  let jd = p.joined ?? p.cmJoined ?? start; if (jd > start) jd = start;
  const days = Math.round((Date.parse(start) - Date.parse(jd)) / 86400000), ad = sh(p, 'adaptability'), bl = Math.trunc(ad * 0.5), lim = Math.trunc(p.ca * 0.15);
  const can = new Set<number>();
  if (p.club && days < 415 - 10 * ad) for (let r = 0; r < Math.max(1, bl); r++) { let x = (days < 215 ? 26 : 21) - bl - (bl > 0 ? r : 0); if (x > lim) x = lim; can.add(x & 0xff); }
  else can.add(0);
  if (!s0.has(p.id) && o === 0) zeroOrig++;
  if (can.has(o)) ok++; else { bad++; if (ex.length < 12) ex.push(`${p.id} ${p.first} ${p.last}: orig ${o}, mulige ${[...can].join('/')} (dage ${days}, Ad ${ad}, CA ${p.ca}, klub ${p.club})`); }
}
for (const id of s0.keys()) if (!g.players[id]) missing++;
console.log(`spilstarten (sporets første opdatering dag ${s0day} = ${start}): ${ok} mulige, ${bad} umulige (orig 0: ${zeroOrig}; ids kun i sporet: ${missing})`);
console.log(ex.join('\n'));
// fordelingen
const ours0 = Object.values(g.players).filter((p) => !p.regen).map((p) => p.cmStaffState ?? 0);
const mean = (a: number[]) => (a.reduce((s, x) => s + x, 0) / Math.max(1, a.length)).toFixed(2);
const nz = (a: number[]) => a.filter((x) => x > 0);
const orig0 = Object.values(g.players).filter((p) => !p.regen).map((p) => s0.get(p.id) ?? 0);
console.log(`spilstart: orig snit ${mean(orig0)} (≠0: ${nz(orig0).length}, snit ${mean(nz(orig0))}) · spillet ${g.date}: snit ${mean(ours0)} (≠0: ${nz(ours0).length}, snit ${mean(nz(ours0))})`);
// kampspillerne (kortet): spilstartens værdi og formlens mulige værdier
const mapped = new Map<number, number>();   // staff-id → Player.id
for (const h of heads) {
  const cs = Object.values(g.players).filter((p) => !p.regen && g.clubs[p.club]?.name === h.club && p.dob === h.dob);
  const p = cs.length === 1 ? cs[0] : cs.find((q) => q.ca === h.ca);
  if (p) mapped.set(h.staff, p.id);
}
{
  let ok2 = 0, bad2 = 0; const ex2: string[] = [];
  for (const [sid, pid] of mapped) {
    const p = g.players[pid], o = s0.get(sid) ?? 0;
    let jd = p.joined ?? p.cmJoined ?? start; if (jd > start) jd = start;
    const days = Math.round((Date.parse(start) - Date.parse(jd)) / 86400000), ad = Math.round(sh(p, 'adaptability')), bl = Math.trunc(ad * 0.5), lim = Math.trunc(p.ca * 0.15);
    const can = new Set<number>();
    if (p.club && days < 415 - 10 * ad) for (let r = 0; r < Math.max(1, bl); r++) { let x = (days < 215 ? 26 : 21) - bl - (bl > 0 ? r : 0); if (x > lim) x = lim; can.add(x & 0xff); } else can.add(0);
    if (can.has(o)) ok2++; else bad2++;
    if (ex2.length < 40) ex2.push(`${sid}→${pid} ${p.last} (${g.clubs[p.club]?.name}): orig ${o}, formlen ${[...can].join('/')} – ankomst ${p.joined ?? p.cmJoined} (${days} d), Ad ${ad}, CA ${p.ca}, spillet ${p.cmStaffState ?? 0}`);
  }
  const so = [...mapped].map(([sid]) => s0.get(sid) ?? 0), su = [...mapped].map(([, pid]) => g.players[pid].cmStaffState ?? 0);
  const m2 = (a: number[]) => (a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)).toFixed(2);
  console.log(`kampspillere fundet: ${mapped.size}/${heads.length}; spilstarten (ferie medregnet): orig snit ${m2(so)} · spillet (${g.date}) ${m2(su)}` +
    ` – formlen alene (dage til ${start}) mulig ${ok2}, umulig ${bad2} (originalen regner dagene til 1/1 og lægger feriedagene oveni)`);
  if (process.env.VERBOSE) console.log(ex2.join('\n'));
}
if (process.env.ADVANCE) {
  const until = new Date(Date.UTC(2001, 0, 1) + DAY * 86400000).toISOString().slice(0, 10);
  while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
  const ps = Object.values(g.players).filter((p) => !p.regen);
  const o = ps.map((p) => now.get(p.id) ?? 0), u = ps.map((p) => p.cmStaffState ?? 0);
  const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
  const pl = ps.filter((p) => epl.clubs.includes(p.club));
  console.log(`dag ${DAY} (${g.date}): orig snit ${mean(o)} (≠0 ${nz(o).length}) · spillet ${mean(u)} (≠0 ${nz(u).length}); Premier League: orig ${mean(pl.map((p) => now.get(p.id) ?? 0))} · spillet ${mean(pl.map((p) => p.cmStaffState ?? 0))}`);
  const hist = (a: number[]) => { const h: number[] = []; for (const x of a) h[Math.min(30, x)] = (h[Math.min(30, x)] ?? 0) + 1; return Array.from(h, (v) => v ?? 0).join(' '); };
  const mo = [...mapped].map(([sid]) => now.get(sid) ?? 0), mu = [...mapped].map(([, pid]) => g.players[pid].cmStaffState ?? 0);
  console.log(`kampspillerne (${mapped.size}): orig snit ${mean(mo)} (≠0 ${nz(mo).length}) · spillet ${mean(mu)} (≠0 ${nz(mu).length})`);
  console.log(`kampspillere 0..30 orig: ${hist(mo)}\n             spillet: ${hist(mu)}`);
  console.log(`PL-fordeling 0..30 orig: ${hist(pl.map((p) => now.get(p.id) ?? 0))}\n           spillet: ${hist(pl.map((p) => p.cmStaffState ?? 0))}`);
}
