// K7-8: CA-udviklingen pr. person mod oraklet (sæson 1, frø 1, 3.9.60, Arsenal på ferie, world bygget med CM_DBSIZE=2 – som k7-seasons.ts).
// Skriver for hver dato i DATES (standard 14/7, 6/10, 5/1, 30/6) alle spillere i hukommelsen på begge sider til OUT (JSON); analysen:
// scripts/k7-dev-report.ts.
//   WORLD=<world-dbs2.json> OUT=<fil.json> [DATES=2001-07-14,2002-01-05] [ONLY_ORACLE=1] node scripts/measure.mjs -- npx tsx scripts/k7-dev.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';
import type { GameState } from '../src/game/types';

const DATES = (process.env.DATES ?? '2001-07-14,2001-10-06,2002-01-05,2002-06-30').split(',');
const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const CLUB = 'Arsenal';
/** pr. spiller: nøgle, alder, CA, PA, klub, klubbens land, division, (vores) regen/ny, kampe i sæsonen, trænere i klubben */
export interface DRow { key: string; age: number; ca: number; pa: number; club: string; nat: string; div: string; nw?: boolean; rg?: boolean; apps?: number; coaches?: number; fac?: number }

const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');

function oracleRows(m: SparseMem): { date: string; rows: DRow[] } {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const date = dayIso(m.s16(0xae2c90), m.s16(0xae2c92));
  const rows: DRow[] = [];
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const common = str(m, m.u32(st + 0xc)), f = str(m, m.u32(st + 4)), l = str(m, m.u32(st + 8));
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
    const ok = cix >= 0 && cix < nc;
    const adr = C + 0x245 * cix, dv = ok ? m.u32(adr + 0x57) : 0;
    rows.push({ key: `${common || f + ' ' + l}|${dob}`, age: yrs(date, dob), ca: m.s16(pr + 5), pa: m.s16(pr + 7), club: ok ? str(m, adr + 4, 51) : '',
      nat: ok ? str(m, m.u32(adr + 0x53) + 4, 51) : '', div: dv ? str(m, dv + 4, 51) : '' });
  }
  return { date, rows };
}

let g!: GameState;
let top0 = 0;
function ourRows(date: string): DRow[] {
  const divOf = (cid: number) => { const c = g.clubs[cid]; return c ? g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? '' : ''; };
  const coaches = new Map<number, number>();
  for (const s of Object.values(g.staff)) if (s.club && (s.role === 'coach' || s.role === 'assistant') && (!g.cmStaffMem || s.cmMem)) coaches.set(s.club, (coaches.get(s.club) ?? 0) + 1);
  const rows: DRow[] = [];
  for (const p of Object.values(g.players)) {
    if (p.virtual || !cmInMemory(g, p)) continue;
    const c = g.clubs[p.club];
        rows.push({ key: `${p.first} ${p.last}|${p.dob}`, age: yrs(date, p.dob), ca: p.ca, pa: p.pa, club: c?.name ?? '', nat: c ? g.nations[c.nation]?.name ?? '' : '', div: p.club ? divOf(p.club) : '',
      nw: p.id >= top0, rg: !!p.regen, apps: p.stats?.apps, coaches: p.club ? coaches.get(p.club) ?? 0 : undefined, fac: c?.facilities });
  }
  return rows;
}

const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const ix2 = readDaySnapIndex(process.env.Y23 ?? `${homedir()}/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14`);
const out: { dates: string[]; o: Record<string, DRow[]>; u: Record<string, DRow[]> } = { dates: DATES, o: {}, u: {} };
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData & { cmTrim?: { pct: number } };
  if (w.cmTrim && w.cmTrim.pct !== 0.02) console.log('ADVARSEL: world-filen er ikke bygget med CM_DBSIZE=2');
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === CLUB)![0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
  top0 = g.nextId.player;
}
const t0 = Date.now();
for (const iso of DATES) {
  if (!ONLY_ORACLE) {
    const prev = new Date(Date.parse(iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (iso !== '2001-07-14') while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
      if (!g.userClub) {
        const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
        if (offer) applyAction({ t: 'acceptJob', club: offer });
        else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
      }
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
    out.u[iso] = ourRows(iso);
  }
  const e = ix.snaps.find((s) => s.iso === iso), e2 = ix2?.snaps.find((s) => s.iso === iso);
  const o = oracleRows(e ? loadDaySnap(ix, e) : loadDaySnap(ix2!, e2!));
  out.o[iso] = o.rows;
  console.log(`${iso}: orakel ${o.rows.length} (${o.date}), vores ${out.u[iso]?.length ?? '-'} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
writeFileSync(process.env.OUT!, JSON.stringify(out));
