// K7: de klubløse i hukommelsen uge for uge (alder/CA, hvor længe klubløse) – oraklet mod spillet – og hvornår de klubløse, der skriver under,
// blev klubløse (sidste dag med klub før underskriften). FROM/UNTIL/STEP (dage).
//   ONLY_ORACLE=1 FROM=2002-04-01 UNTIL=2002-06-30 npx tsx scripts/k7-free-pool.ts
//   WORLD=<world-dbs2.json> FROM=… UNTIL=… npx tsx scripts/k7-free-pool.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';
import type { GameState } from '../src/game/types';

const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const FROM = process.env.FROM ?? '2001-07-14', UNTIL = process.env.UNTIL ?? '2002-06-30', STEP = Number(process.env.STEP ?? 1);
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
interface P { key: string; club: string; age: number; ca: number; exp: string }
type Day = { iso: string; ps: Map<string, P> };
function oracle(m: SparseMem, iso: string): Day {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364);
  const ps = new Map<string, P>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const common = str(m, m.u32(st + 0xc), 60), f = str(m, m.u32(st + 4), 60), l = str(m, m.u32(st + 8), 60);
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const key = `${common || f + ' ' + l}|${dob}`;
    const cadr = m.u32(st + 0x39), k = getContract(m, st);
    ps.set(key, { key, club: cadr ? str(m, cadr + 4) : '', age: yrs(iso, dob), ca: m.s16(pr + 5), exp: k ? dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)) : '' });
  }
  return { iso, ps };
}
let g!: GameState;
function ours(): Day {
  const ps = new Map<string, P>();
  for (const p of Object.values(g.players)) {
    if (p.virtual || !cmInMemory(g, p)) continue;
    const key = `${p.first} ${p.last}|${p.dob}`;
    ps.set(key, { key, club: p.club ? g.clubs[p.club]?.name ?? '' : '', age: yrs(g.date, p.dob), ca: p.ca, exp: p.contract?.expires.slice(0, 10) ?? '' });
  }
  return { iso: g.date.slice(0, 10), ps };
}
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const snaps = ix.snaps.filter((e) => e.iso >= FROM && e.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso)).filter((_, i) => i % STEP === 0);
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
  g.manager.holiday = {};
}
const O: Day[] = [], U: Day[] = [];
for (const s of snaps) {
  if (ONLY_ORACLE) O.push(oracle(loadDaySnap(ix, s), s.iso));
  else {
    const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== '2001-07-14') while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
    U.push(ours());
  }
}
const band = (a: number) => (a < 21 ? '<21' : a < 25 ? '21-24' : a < 30 ? '25-29' : a < 34 ? '30-33' : '34+');
function report(name: string, D: Day[]) {
  console.log(`\n## ${name}`);
  console.log('dato        klubløse  ' + ['<21', '21-24', '25-29', '30-33', '34+'].join(' ') + '  | blev klubløse (siden forrige)  skrev under  (30+: blev / skrev)');
  for (let i = 0; i < D.length; i++) {
    const d = D[i], p = D[i - 1];
    const fr = [...d.ps.values()].filter((x) => !x.club);
    const by = new Map<string, number>(); for (const x of fr) by.set(band(x.age), (by.get(band(x.age)) ?? 0) + 1);
    let became = 0, signed = 0, b30 = 0, s30 = 0;
    if (p) for (const [k, x] of d.ps) { const y = p.ps.get(k); if (!y) continue; if (y.club && !x.club) { became++; if (x.age >= 30) b30++; } if (!y.club && x.club) { signed++; if (x.age >= 30) s30++; } }
    if (i % Number(process.env.EVERY ?? 7) === 0 || i === D.length - 1) console.log(`${d.iso}  ${String(fr.length).padStart(5)}    ${['<21', '21-24', '25-29', '30-33', '34+'].map((b) => String(by.get(b) ?? 0).padStart(4)).join(' ')}  | ${String(became).padStart(4)} ${String(signed).padStart(10)}   (${b30}/${s30})`);
  }
  // samlet over perioden: blev klubløse og skrev under (dag for dag)
  let became = 0, signed = 0;
  for (let i = 1; i < D.length; i++) for (const [k, x] of D[i].ps) { const y = D[i - 1].ps.get(k); if (!y) continue; if (y.club && !x.club) became++; if (!y.club && x.club) signed++; }
  console.log(`i alt: blev klubløse ${became}, skrev under ${signed}`);
}
if (ONLY_ORACLE) report('oraklet', O); else report('vores', U);
