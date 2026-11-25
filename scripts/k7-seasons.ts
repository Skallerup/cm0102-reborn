// K7 (docs/ORIGINAL_PARITY.md): 3 sæsoner mod oraklets FORDELINGER (ikke dag for dag – talrækkerne divergerer fra første trækning).
//
// Oraklet: Bosman headless, frø 1, 3.9.60, England, Arsenal på ferie, databasestørrelse 2 (som cm-day-lockstep.ts). Billeder (sn_trace.c, pre 0x4c7ac0):
//   sæson 1  ~/cm0102-engine/oracle/daysnap/s1-3.9.60-e1      (pr. dag 14/7-01 → 30/6-02; her bruges hver 14. dag)
//   sæson 2–3 ~/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14 (hver 14. dag 14/7-02 → 27/6-04):
//     node scripts/measure.mjs --oracle -- python3 -I scripts/oracle-day-snaps.py --seed 1 --database 3.9.60 --from 2002-07-14 --to 2004-06-27 --every 14 --par 1 \
//       --out ~/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14
// Spillet startes som oraklet (samme land/klub/frø, world bygget med CM_DBSIZE=2) og spilles frem; på hver billeddato D sammenlignes med spillet
// ved D−1 færdigspillet. Pr. sæson (start = første billede efter 1/7, slut = sidste før 1/7): mål/kamp pr. division, op-/nedrykning, regens
// (antal, PA, alder), pensioner, CA-udvikling efter alder, transfers (antal/summer pr. art), lejeaftaler, saldo/lønsum/omdømme pr. division,
// managerskifter, kontraktforlængelser, klubløse, trupstørrelser.
//
//   CM_DBSIZE=2 npx tsx scripts/build-cm-data.mts .orig-db/Original-3.9.60-Database-Swedish_fixed <scratch>/world-dbs2.json 2001
//   WORLD=<scratch>/world-dbs2.json REPORT=<fil.md> JSON=<fil.json> node scripts/measure.mjs -- npx tsx scripts/k7-seasons.ts
// Miljø: SEASONS=3, Y23=<mappe>, ONLY_ORACLE=1 (kun oraklets side – hurtigt), TMPDIR (billedcachen deles ellers mellem kørsler).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex, type DaySnapEntry, type DaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { GBP } from '../src/game/cmContractInit';
import { cmInMemory } from '../src/game/cmRetire';
import { sortTable } from '../src/game/competitions';
import type { GameState } from '../src/game/types';

const E = `${homedir()}/cm0102-engine`;
const SEASONS = Number(process.env.SEASONS ?? 3);
const Y23 = process.env.Y23 ?? `${E}/oracle/daysnap/s1-3.9.60-y23-e14`;
const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const LOANS = process.env.LOANS;
const BUYS = process.env.BUYS;
const STAFF = process.env.STAFF;   // fil: stabsskifterne (art 5 / Staff.moves, begge sider) med divisionerne – opdeling efter måned/type
   // fil: alle handler (begge sider) med alder/CA/land/division – k7-købsanalyse   // fil: lejeaftalerne (begge sider) + lejelisten pr. billede (engelske klubber) – k7-loans-analyse
const llSeries: { o: { iso: string; keys: string[] }[]; u: { iso: string; keys: string[] }[] } = { o: [], u: [] };
const CLUB = 'Arsenal';

// ------------------------------------------------------------------ normaliseret verden (begge sider)
interface PRow { key: string; id: number; age: number; ca: number; pa: number; club: string; eng: boolean; div: string; nat: string; exp: string; wage: number; loan: boolean; loanFromEng: boolean; mem: boolean; ll?: boolean }
interface CRow { name: string; div: string; bal: number; wb: number; rep: number; mgr: string; squad: number }
interface TRow { key: string; date: string; from: string; to: string; fee: number; loan: boolean; free: boolean; eng: boolean; staff?: boolean; bosman?: boolean; pkey?: string; age?: number; ca?: number; fromNat?: string; toNat?: string; fromDiv?: string; toDiv?: string; role?: string }
interface LRow { div: string; club: string; p: number; gf: number; ga: number; pos: number }
// reps: omdømmet for ALLE engelske klubber uanset division (omdømme Δ: oraklets 30/6-billede har allerede næste sæsons divisioner, og
// Conference er ingen turnering i oraklet – en nedrykket klub ville ellers falde ud af mængden på den ene side)
interface World { date: string; players: PRow[]; clubs: CRow[]; league: LRow[]; reps: Record<string, number> }

const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
const seasonOf = (iso: string) => (+iso.slice(5, 7) >= 7 ? +iso.slice(0, 4) : +iso.slice(0, 4) - 1);
const DIV_TIER: Record<string, number> = { 'English Premier Division': 1, 'English First Division': 2, 'English Second Division': 3, 'English Third Division': 4, 'English Football Conference': 5 };

// ------------------------------------------------------------------ oraklet (hukommelsen; adresserne som cm-day-lockstep.ts)
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const oTransfers = new Map<string, TRow>();
function oracleWorld(m: SparseMem): World {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const date = dayIso(m.s16(0xae2c90), m.s16(0xae2c92));
  const cName = (ix: number) => (ix >= 0 && ix < nc ? str(m, C + 0x245 * ix + 4, 51) : '');
  const cEng = (ix: number) => ix >= 0 && ix < nc && str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51) === 'England';
  const cDiv = (ix: number) => { const dv = m.u32(C + 0x245 * ix + 0x57); return dv ? str(m, dv + 4, 51) : ''; };
  const contractAt = (ix: number) => (ix < 0 ? 0 : m.u32(m.u32(0xae1050)) + 80 * ix);
  const rowOf = (id: number) => m.u32(0xae2d0c) + 79 * id;
  const players: PRow[] = [];
  const squad = new Map<number, number>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    // job 16 (+0x3d) = pensioneret spiller (0x7aace0): spillerposten +0x61 står, til regen'en tager den (puljen, 0x7a87d0 – i dag + 1 + rand(65)
    // dage), men personen er ikke længere spiller – vores spil fjerner ham på pensionsdagen (cmRetire.ts retire)
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const common = str(m, m.u32(st + 0xc)), f = str(m, m.u32(st + 4)), l = str(m, m.u32(st + 8));
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
    if (cix >= 0) squad.set(cix, (squad.get(cix) ?? 0) + 1);
    const row = rowOf(id), k = contractAt(m.s32(row)), kl = contractAt(m.s32(row + 4));
    const parent = k ? m.s32(k + 4) : -1;
    players.push({ key: `${common || f + ' ' + l}|${dob}`, id, age: yrs(date, dob), ca: m.s16(pr + 5), pa: m.s16(pr + 7), club: cName(cix), eng: cEng(cix), div: cix >= 0 ? cDiv(cix) : '',
      nat: str(m, m.u32(st + 0x1a) + 4, 51), exp: k ? dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)) : '', wage: k ? m.s32(k + 0xc) : 0, loan: !!kl, loanFromEng: !!kl && cEng(parent), mem: true, ll: k ? !!(m.u8(k + 0x4e) & 2) : false });
  }
  const clubs: CRow[] = [], reps: Record<string, number> = {};
  const league: LRow[] = [];
  const fin0 = m.u32(m.u32(0xae2a38));
  for (let ix = 0; ix < nc; ix++) {
    if (!cEng(ix)) continue;
    const adr = C + 0x245 * ix, div = cDiv(ix);
    reps[cName(ix)] = m.s16(adr + 0x80);
    if (!DIV_TIER[div]) continue;
    const f = fin0 + 0x167 * ix;
    const mgrP = m.u32(adr + 0xcf);
    const mgr = mgrP ? (str(m, m.u32(mgrP + 0xc)) || `${str(m, m.u32(mgrP + 4))} ${str(m, m.u32(mgrP + 8))}`).trim() : '';
    clubs.push({ name: cName(ix), div, bal: m.u32(f) + m.s32(f + 4) * 4294967296, wb: m.s32(f + 0xc), rep: m.s16(adr + 0x80), mgr: cName(ix) === CLUB ? '(menneske)' : mgr, squad: squad.get(ix) ?? 0 });
    // Comp_Stats-rækken (0x4a4850): +4 kampe, +0x69 mål for, +0x6a mål imod, +0x73 placeringen nu (afkodet mod season.json 20/5-02)
    const dv = m.u32(adr + 0x57), cp = dv ? m.u32(m.u32(0xadadfc) + 4 * m.s32(dv)) : 0, sp = cp ? m.u32(cp + 8) : 0;
    if (sp) {
      const rows = m.u32(sp + 0xc), nr = m.s32(sp + 0x14);
      for (let i = 0; i < nr && i < 200; i++) if (m.s32(rows + 0x76 * i) === m.s32(adr)) { const r = rows + 0x76 * i; league.push({ div, club: cName(ix), p: m.u8(r + 4), gf: m.u8(r + 0x69), ga: m.u8(r + 0x6a), pos: m.u8(r + 0x73) }); break; }
    }
  }
  // TRANSFER_MANAGER +0x862 (37 bytes pr. handel): +0 person, +0x10/+0x14 klubberne, +0x18 sum, +0x1c art (0 køb/klubløs, 2 leje, 3 fri, 4 forkontrakt-skifte 0x8c9996 (sum 0), 5 stab), +0x1d/+0x1f dato
  const tmA = m.u32(0xde1f54), arr = m.u32(tmA + 0x862), nT = m.s32(tmA + 0x86a);
  const byId = new Map(players.map((p) => [p.id, p]));
  for (let i = 0; i < nT; i++) {
    const r = arr + 37 * i, d = dayIso(m.s16(r + 0x1d), m.s16(r + 0x1f));
    const art = m.u8(r + 0x1c);
    if (!d) continue;
    // målt 1/9-01 (253/253 køb): +0x10 = den nye klub (køber/lejeklub), +0x14 = den gamle (−1 = klubløs); art 3: +0x10 = −1; art 5 = stab
    const to = m.s32(r + 0x10), from = m.s32(r + 0x14), pid = m.s32(r);
    const key = `${byId.get(pid)?.key ?? pid}|${d}|${to}|${art}`;
    if (oTransfers.has(key)) continue;
    const cNat = (ix: number) => (ix >= 0 && ix < nc ? str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51) : '');
    const pp = byId.get(pid);
    oTransfers.set(key, { key, date: d, from: from >= 0 ? cName(from) : '', to: to >= 0 ? cName(to) : '', fee: m.s32(r + 0x18), loan: art === 2, free: art === 3 || art === 4 || from < 0, ...(art === 4 ? { bosman: true } : {}), eng: cEng(to) || cEng(from), staff: art === 5,
      ...(STAFF && art === 5 ? { fromDiv: from >= 0 ? cDiv(from) : '', toDiv: to >= 0 ? cDiv(to) : '', fromNat: cNat(from), toNat: cNat(to) } : {}),
      ...((LOANS && art === 2) || BUYS ? { pkey: pp?.key, age: pp ? yrs(d, pp.key.split('|')[1]) : undefined, ca: pp?.ca, fromNat: cNat(from), toNat: cNat(to), fromDiv: from >= 0 ? cDiv(from) : '', toDiv: to >= 0 ? cDiv(to) : '' } : {}) });
  }
  return { date, players, clubs, league, reps };
}

// ------------------------------------------------------------------ spillet
let g!: GameState;
const uTransfers = new Map<string, TRow>();
const uLeague = new Map<string, LRow[]>();   // sæson|liga → tabellen med flest kampe
function ourWorld(date: string): World {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const divOf = (cid: number) => { const c = g.clubs[cid]; return c && c.nation === eng ? g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? '' : ''; };
  const players: PRow[] = [];
  const squad = new Map<number, number>();
  for (const p of Object.values(g.players)) {
    if (p.virtual) continue;
    const c = g.clubs[p.club];
    if (p.club) squad.set(p.club, (squad.get(p.club) ?? 0) + 1);
    players.push({ key: `${p.first} ${p.last}|${p.dob}`, id: p.id, age: yrs(date, p.dob), ca: p.ca, pa: p.pa, club: c?.name ?? '', eng: !!c && c.nation === eng, div: p.club ? divOf(p.club) : '',
      nat: g.nations[p.nation]?.name ?? '', exp: p.contract?.expires.slice(0, 10) ?? '', wage: p.contract ? Math.round(p.contract.wage * GBP) : 0, loan: !!p.loan,
      loanFromEng: !!p.loan && g.clubs[p.loan.from]?.nation === eng, mem: cmInMemory(g, p), ll: !!p.loanListed });
    for (const mv of p.moves ?? []) {
      const key = `${p.id}|${mv.date}|${mv.to}`;
      if (uTransfers.has(key)) continue;
      const fe = g.clubs[mv.from]?.nation === eng, te = g.clubs[mv.to]?.nation === eng;
      const cDivU = (cid: number) => { const c = g.clubs[cid]; return c ? g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? '' : ''; };
      uTransfers.set(key, { key, date: mv.date, from: g.clubs[mv.from]?.name ?? '', to: g.clubs[mv.to]?.name ?? '', fee: Math.round(mv.fee * GBP), loan: !!mv.loan, free: !mv.from || !mv.to || !!mv.bosman, ...(mv.bosman ? { bosman: true } : {}), eng: fe || te,
        ...((LOANS && mv.loan) || BUYS ? { pkey: `${p.first} ${p.last}|${p.dob}`, age: yrs(mv.date, p.dob), ca: p.ca, fromNat: g.nations[g.clubs[mv.from]?.nation ?? -1]?.name ?? '', toNat: g.nations[g.clubs[mv.to]?.nation ?? -1]?.name ?? '', fromDiv: cDivU(mv.from), toDiv: cDivU(mv.to) } : {}) });
    }
  }
  for (const s of Object.values(g.staff)) for (const mv of s.moves ?? []) {
    const key = `s${s.id}|${mv.date}|${mv.to}`;
    if (uTransfers.has(key)) continue;
    uTransfers.set(key, { key, date: mv.date, from: g.clubs[mv.from]?.name ?? '', to: g.clubs[mv.to]?.name ?? '', fee: Math.round(mv.fee * GBP), loan: false, free: false, eng: g.clubs[mv.from]?.nation === eng || g.clubs[mv.to]?.nation === eng, staff: true,
      ...(STAFF ? { fromDiv: g.comps[g.clubs[mv.from]?.league ?? '']?.name ?? '', toDiv: g.comps[g.clubs[mv.to]?.league ?? '']?.name ?? '', fromNat: g.nations[g.clubs[mv.from]?.nation ?? -1]?.name ?? '', toNat: g.nations[g.clubs[mv.to]?.nation ?? -1]?.name ?? '', role: s.role } : {}) });
  }
  const clubs: CRow[] = [], reps: Record<string, number> = {};
  for (const c of Object.values(g.clubs)) {
    if (c.nation !== eng) continue;
    reps[c.name] = g.cmClubRep?.[c.id] ?? Math.round(c.rep * 100);
    const div = divOf(c.id);
    if (!DIV_TIER[div]) continue;
    const mgr = g.staff[c.manager];
    clubs.push({ name: c.name, div, bal: Math.round(c.balance * GBP), wb: g.cmFin?.[c.id]?.wb ?? 0, rep: g.cmClubRep?.[c.id] ?? Math.round(c.rep * 100),
      mgr: c.id === g.userClub ? '(menneske)' : mgr ? `${mgr.first} ${mgr.last}`.trim() : '', squad: squad.get(c.id) ?? 0 });
  }
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league' || comp.nation !== eng || !DIV_TIER[comp.name]) continue;
    const sorted = sortTable(comp.table.slice());   // comp.table gemmes usorteret
    const rows = sorted.map((r, i) => ({ div: comp.name, club: g.clubs[r.club]?.name ?? '', p: r.p, gf: r.gf, ga: r.ga, pos: i + 1 }));
    const k = `${g.season}|${comp.name}`, old = uLeague.get(k);
    if (!old || rows.reduce((t, r) => t + r.p, 0) >= old.reduce((t, r) => t + r.p, 0)) uLeague.set(k, rows);
  }
  return { date, players, clubs, league: [], reps };
}

// ------------------------------------------------------------------ billederne
interface Snap { iso: string; load: () => SparseMem }
const ix1 = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const ix2 = readDaySnapIndex(Y23);
const t0d = Date.parse('2001-07-14');
const pick = (ix: DaySnapIndex, keep: (e: DaySnapEntry) => boolean): Snap[] => ix.snaps.filter(keep).map((e) => ({ iso: e.iso, load: () => loadDaySnap(ix, e) }));
const snaps: Snap[] = [
  ...pick(ix1, (e) => ((Date.parse(e.iso) - t0d) / 86400000) % 14 === 0 || e.iso === '2002-06-30'),
  ...(ix2 ? pick(ix2, () => true) : []),
].filter((s) => seasonOf(s.iso) < 2001 + SEASONS && s.iso <= (process.env.UNTIL ?? '9999')).sort((a, b) => a.iso.localeCompare(b.iso));
if (!ix2) console.log(`ADVARSEL: ${Y23} findes ikke – kun sæson 1`);
// sæsonernes nøgledatoer: første og sidste billede i hver sæson (1/7 → 30/6)
const keyDates = new Map<number, { a: string; b: string }>();
for (const s of snaps) { const k = seasonOf(s.iso), e = keyDates.get(k); if (!e) keyDates.set(k, { a: s.iso, b: s.iso }); else e.b = s.iso; }
// sæsonerne som sammenhængende vinduer (pensioner/regens/transfers i juli ligger ellers mellem to sæsoner): start = forrige sæsons slut
for (const k of [...keyDates.keys()].sort()) { const prev = keyDates.get(k - 1); if (prev) keyDates.get(k)!.a = prev.b; }
// divisionerne skifter først ved den nye sæsons opsætning (club +0x57 er uændret 14/7): næste sæsons division = første billede fra 1/9
const divDates = new Map<number, string>();
for (const s of snaps) { const k = seasonOf(s.iso); if (s.iso >= `${k}-09-01` && !divDates.has(k)) divDates.set(k, s.iso); }
const isKey = (iso: string) => [...keyDates.values()].some((x) => x.a === iso || x.b === iso) || [...divDates.values()].includes(iso);

const oWorlds = new Map<string, World>(), uWorlds = new Map<string, World>();
const oLeague = new Map<string, LRow[]>();
const t0 = Date.now();
if (!ONLY_ORACLE) {
  const worldFile = process.env.WORLD ?? 'public/data/world-original.json';
  const w = JSON.parse(readFileSync(worldFile, 'utf8')) as WorldData & { cmTrim?: { pct: number } };
  if (w.cmTrim && w.cmTrim.pct !== 0.02) console.log('ADVARSEL: world-filen er ikke bygget med CM_DBSIZE=2');
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === CLUB)![0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  // oraklet går på ferie 14/7-01 (tools/ct/run_season_ct.py: Go on Holiday → Yes, alle valg fra) og bliver dér – HOLIDAY=0: mennesket styrer selv
  if (process.env.HOLIDAY !== '0') gs().manager.holiday = {};
  g = gs();
}
const sacked: string[] = [];
// pensioner pr. billede (30+ i hukommelsen ved forrige billede, væk ved dette) – fordelt på måneder (billedets dato)
const perMonth = { o: new Map<string, number>(), u: new Map<string, number>() };
const prevMem: { o?: Map<string, number>; u?: Map<string, number> } = {};
const tally = (side: 'o' | 'u', iso: string, w: World) => {
  const cur = new Map(w.players.filter((p) => p.mem).map((p) => [p.key, p.age] as const));
  const prev = prevMem[side];
  if (prev) { let n = 0; for (const [k, age] of prev) if (age >= 30 && !cur.has(k)) n++; const mk = iso.slice(0, 7); perMonth[side].set(mk, (perMonth[side].get(mk) ?? 0) + n); }
  prevMem[side] = cur;
};
for (const s of snaps) {
  if (!ONLY_ORACLE) {
    const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== '2001-07-14') while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
      if (!g.userClub) {
        const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
        if (offer) { applyAction({ t: 'acceptJob', club: offer }); sacked.push(`${g.date} → ${g.clubs[offer].name}`); }
        else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
        for (const id of Object.keys(g.manager.jobTalks ?? {})) if (g.manager.jobTalks![Number(id)].stage === 'offer') applyAction({ t: 'acceptJob', club: Number(id) });
      }
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
    const uw = ourWorld(s.iso);
    tally('u', s.iso, uw);
    if (LOANS) llSeries.u.push({ iso: s.iso, keys: uw.players.filter((p) => p.ll && p.eng).map((p) => `${p.key}|${p.club}|${p.div}|${Math.round(p.age)}|${p.ca}|${p.loan ? 1 : 0}`) });
    if (isKey(s.iso)) uWorlds.set(s.iso, uw);
  }
  const ow = oracleWorld(s.load());
  tally('o', s.iso, ow);
  if (LOANS) llSeries.o.push({ iso: s.iso, keys: ow.players.filter((p) => p.ll && p.eng).map((p) => `${p.key}|${p.club}|${p.div}|${Math.round(p.age)}|${p.ca}|${p.loan ? 1 : 0}`) });
  for (const r of ow.league) { const k = `${seasonOf(s.iso)}|${r.div}`; const old = oLeague.get(k) ?? []; const sum = (xs: LRow[]) => xs.reduce((t, x) => t + x.p, 0); if (sum(ow.league.filter((x) => x.div === r.div)) >= sum(old)) oLeague.set(k, ow.league.filter((x) => x.div === r.div)); }
  if (isKey(s.iso)) oWorlds.set(s.iso, { ...ow, league: [] });
  console.log(`  ${s.iso}: billedets dato ${ow.date}${ONLY_ORACLE ? '' : `, spillets ${g.date}`}; ${ow.players.length} spillere i hukommelsen (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}

// ------------------------------------------------------------------ fordelingerne pr. sæson
type Num = number | null;
interface Metric { area: string; name: string; ours: Num[]; theirs: Num[] }
const metrics: Metric[] = [];
const sKeys = [...keyDates.keys()].sort();
const put = (area: string, name: string, si: number, o: Num, t: Num) => {
  let x = metrics.find((y) => y.area === area && y.name === name);
  if (!x) { x = { area, name, ours: sKeys.map(() => null), theirs: sKeys.map(() => null) }; metrics.push(x); }
  x.ours[si] = o; x.theirs[si] = t;
};
const mean = (xs: number[]) => (xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : NaN);
const median = (xs: number[]) => { if (!xs.length) return NaN; const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const top = (xs: number[], k: number) => mean([...xs].sort((a, b) => b - a).slice(0, k));
const AGES: [number, number][] = [[15, 18], [18, 21], [21, 24], [24, 27], [27, 30], [30, 33], [33, 99]];
const ageLab = ([lo, hi]: [number, number]) => (hi === 99 ? `${lo}+` : `${lo}–${hi - 1}`);
const DIVS = Object.keys(DIV_TIER);

function seasonMetrics(si: number, A: World, B: World, divW: [World | undefined, World | undefined], side0: 'o' | 'u', T: Map<string, TRow>, L: Map<string, LRow[]>, season: number) {
  const side = side0;
  // sæsonens divisioner (billedet fra 1/9): oraklets 30/6-billede har allerede næste sæsons divisioner, vores spil skifter senere
  if (divW[0]) {
    const dv = new Map(divW[0].clubs.map((c) => [c.name, c.div]));
    B = { ...B, clubs: B.clubs.map((c) => ({ ...c, div: dv.get(c.name) ?? c.div })), players: B.players.map((p) => (p.club && dv.has(p.club) ? { ...p, div: dv.get(p.club)! } : p)) };
  }
  const val: Record<string, Num> = {};
  const set = (area: string, name: string, v: number) => { val[`${area}\u0000${name}`] = Number.isFinite(v) ? v : null; };
  const engA = A.players.filter((p) => p.eng), engB = B.players.filter((p) => p.eng);
  const memA = A.players.filter((p) => p.mem), memB = B.players.filter((p) => p.mem);
  // --- trupper/klubløse
  set('spillere', 'i hukommelsen (slut)', memB.length);
  set('spillere', 'i engelske klubber (slut)', engB.length);
  set('spillere', 'klubløse i hukommelsen (start)', memA.filter((p) => !p.club).length);
  set('spillere', 'klubløse i hukommelsen (slut)', memB.filter((p) => !p.club).length);
  set('spillere', 'trupstørrelse gns. engelske ligaklubber (slut)', mean(B.clubs.map((c) => c.squad)));
  // --- CA/PA
  set('CA/PA', 'CA gns. engelske klubber (slut)', mean(engB.map((p) => p.ca)));
  set('CA/PA', 'CA top 100 engelske klubber (slut)', top(engB.map((p) => p.ca), 100));
  set('CA/PA', 'PA gns. engelske klubber (slut)', mean(engB.map((p) => p.pa)));
  set('CA/PA', 'alder gns. engelske klubber (slut)', mean(engB.map((p) => p.age)));
  for (const d of DIVS.slice(0, 4)) set('CA/PA', `CA gns. ${d} (slut)`, mean(engB.filter((p) => p.div === d).map((p) => p.ca)));
  const bKey = new Map(B.players.map((p) => [p.key, p]));
  for (const ab of AGES) {
    const both = engA.filter((p) => p.age >= ab[0] && p.age < ab[1]).map((p) => [p, bKey.get(p.key)] as const).filter(([, b]) => b);
    set('CA-udvikling (samme spiller start→slut, engelsk klub ved start)', `ΔCA alder ${ageLab(ab)}`, mean(both.map(([a, b]) => b!.ca - a.ca)));
    set('CA-udvikling (samme spiller start→slut, engelsk klub ved start)', `antal alder ${ageLab(ab)}`, both.length);
  }
  // --- pensioner / regens (personer i hukommelsen ved start, der er væk ved slut; nye nøgler ved slut)
  const aKeys = new Set(A.players.map((p) => p.key));
  const gone = memA.filter((p) => !bKey.has(p.key));
  set('pensioner', 'væk fra hukommelsen (pensioneret el. ude af hukommelsen) – alle', gone.length);
  set('pensioner', 'væk – 30 år eller ældre (≈ pensioneret)', gone.filter((p) => p.age >= 30).length);
  set('pensioner', 'væk – 30+ i engelsk klub eller klubløs ved start', gone.filter((p) => p.age >= 30 && (p.eng || !p.club)).length);
  set('pensioner', 'væk – i engelsk klub ved start', gone.filter((p) => p.eng).length);
  set('pensioner', 'væk – alder gns.', mean(gone.map((p) => p.age)));
  set('pensioner', 'væk – andel under 30', gone.length ? gone.filter((p) => p.age < 30).length / gone.length : NaN);
  set('pensioner', 'væk – CA gns.', mean(gone.map((p) => p.ca)));
  const born = B.players.filter((p) => !aKeys.has(p.key) && p.mem);
  set('regens', 'nye personer i hukommelsen (slut)', born.length);
  set('regens', 'nye – i engelsk klub', born.filter((p) => p.eng).length);
  set('regens', 'nye – klubløse', born.filter((p) => !p.club).length);
  set('regens', 'nye – alder gns.', mean(born.map((p) => p.age)));
  set('regens', 'nye – PA gns.', mean(born.map((p) => p.pa)));
  set('regens', 'nye – PA median', median(born.map((p) => p.pa)));
  set('regens', 'nye – PA ≥ 150 (antal)', born.filter((p) => p.pa >= 150).length);
  set('regens', 'nye – CA gns.', mean(born.map((p) => p.ca)));
  set('regens', 'nye – andel engelske', born.length ? born.filter((p) => p.nat === 'England').length / born.length : NaN);
  // --- kontrakter: samme spiller i samme engelske klub ved start og slut
  const same = engA.map((p) => [p, bKey.get(p.key)] as const).filter(([a, b]) => b && b.club === a.club && a.exp && b.exp);
  set('kontrakter', 'samme klub start→slut (antal)', same.length);
  set('kontrakter', 'forlænget (udløb senere) – andel', same.length ? same.filter(([a, b]) => b!.exp > a.exp).length / same.length : NaN);
  const expiring = engA.filter((p) => p.exp && p.exp <= B.date);
  set('kontrakter', 'udløber i sæsonen (antal ved start)', expiring.length);
  set('kontrakter', 'udløber i sæsonen → bliver (forlænget)', expiring.filter((p) => { const b = bKey.get(p.key); return b && b.club === p.club && b.exp > B.date; }).length);
  set('kontrakter', 'udløber i sæsonen → anden klub', expiring.filter((p) => { const b = bKey.get(p.key); return b && b.club && b.club !== p.club; }).length);
  set('kontrakter', 'udløber i sæsonen → klubløs', expiring.filter((p) => { const b = bKey.get(p.key); return b && !b.club; }).length);
  set('kontrakter', 'udløber i sæsonen → væk', expiring.filter((p) => !bKey.has(p.key)).length);
  set('kontrakter', 'ugeløn gns. £ engelske klubber (slut)', mean(engB.filter((p) => p.wage > 0).map((p) => p.wage)));
  set('kontrakter', 'ugeløn gns. £ Premier (slut)', mean(engB.filter((p) => p.wage > 0 && p.div === DIVS[0]).map((p) => p.wage)));
  set('kontrakter', 'ugeløn gns. £ Third Division (slut)', mean(engB.filter((p) => p.wage > 0 && p.div === DIVS[3]).map((p) => p.wage)));
  // --- leje
  set('leje', 'udlejede fra engelske klubber (start)', A.players.filter((p) => p.loanFromEng).length);
  set('leje', 'udlejede fra engelske klubber (slut)', B.players.filter((p) => p.loanFromEng).length);
  // --- transfers i sæsonen (England involveret)
  const all = [...T.values()].filter((t) => t.eng && (si === 0 ? t.date >= A.date : t.date > A.date) && t.date <= B.date);
  const ts = all.filter((t) => !t.staff);
  set('transfers', 'stab skifter klub (art 5 / Staff.moves)', all.length - ts.length);
  const buys = ts.filter((t) => !t.loan && !t.free && t.fee > 0);
  set('transfers', 'køb med sum (antal)', buys.length);
  set('transfers', 'køb uden sum (antal)', ts.filter((t) => !t.loan && !t.free && t.fee <= 0 && t.from && t.to).length);
  set('transfers', 'forkontrakt-skifte (art 4, sum 0)', ts.filter((t) => t.bosman).length);
  set('transfers', 'klubløs skriver under (antal)', ts.filter((t) => !t.loan && !t.from && t.to).length);
  set('transfers', 'kontrakt udløbet/fri (antal)', ts.filter((t) => !t.loan && t.from && !t.to).length);
  set('transfers', 'leje (antal)', ts.filter((t) => t.loan).length);
  set('transfers', 'sum i alt £ (køb)', buys.reduce((t, x) => t + x.fee, 0));
  set('transfers', 'sum gns. £', mean(buys.map((t) => t.fee)));
  set('transfers', 'sum median £', median(buys.map((t) => t.fee)));
  set('transfers', 'største sum £', buys.length ? Math.max(...buys.map((t) => t.fee)) : NaN);
  set('transfers', 'køb ≥ £1M (antal)', buys.filter((t) => t.fee >= 1e6).length);
  set('transfers', 'til Premier-klub (antal, køb)', buys.filter((t) => B.clubs.some((c) => c.name === t.to && c.div === DIVS[0]) || A.clubs.some((c) => c.name === t.to && c.div === DIVS[0])).length);
  set('transfers', 'køb i transfervinduet jul–aug (antal)', buys.filter((t) => /-0[78]-/.test(t.date)).length);
  set('transfers', 'køb jan–mar (antal)', buys.filter((t) => /-0[123]-/.test(t.date)).length);
  for (const mo of ['07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06']) {
    const bm = buys.filter((t) => t.date.slice(5, 7) === mo);
    set('transfers pr. måned', `køb ${mo} (antal)`, bm.length);
    set('transfers pr. måned', `køb ${mo} sum median £`, median(bm.map((t) => t.fee)));
  }
  // --- klubber pr. division (slut)
  for (const d of DIVS.slice(0, 4)) {
    const cs = B.clubs.filter((c) => c.div === d);
    set('klubber', `saldo gns. £ ${d}`, mean(cs.map((c) => c.bal)));
    set('klubber', `saldo median £ ${d}`, median(cs.map((c) => c.bal)));
    set('klubber', `negativ saldo (antal) ${d}`, cs.filter((c) => c.bal < 0).length);
    set('klubber', `ugens lønsum gns. £ ${d}`, mean(cs.map((c) => c.wb)));
    set('klubber', `omdømme gns. ${d}`, mean(cs.map((c) => c.rep)));
  }
  {
    const aC = new Map(A.clubs.map((c) => [c.name, c]));
    const ch = B.clubs.filter((c) => c.mgr !== '(menneske)' && aC.has(c.name) && aC.get(c.name)!.mgr !== c.mgr);
    set('klubber', 'managerskifter (klubber med anden manager ved slut)', ch.length);
    set('klubber', 'uden manager (slut)', B.clubs.filter((c) => !c.mgr).length);
    // sæsonens ligaklubber (billedet fra 1/9, ellers A) – omdømmet ved start og slut uanset division (reps), så nedrykkede tæller med på begge sider
    const set0 = (divW[0] ?? A).clubs.map((c) => c.name).filter((nm) => A.reps?.[nm] !== undefined && B.reps?.[nm] !== undefined);
    set('klubber', 'omdømme Δ gns. (start→slut, alle ligaklubber)', mean(set0.map((nm) => B.reps[nm] - A.reps[nm])));
  }
  // --- ligaerne: mål/kamp og op-/nedrykning
  for (const d of DIVS.slice(0, 4)) {
    const rows = L.get(`${season}|${d}`) ?? [];
    const p = rows.reduce((t, r) => t + r.p, 0), gf = rows.reduce((t, r) => t + r.gf, 0);
    set('ligaer', `mål/kamp ${d}`, p ? gf / (p / 2) : NaN);
    set('ligaer', `kampe spillet ${d}`, p / 2);
    const sorted = [...rows].sort((a, b) => a.pos - b.pos);
    set('ligaer', `mål for, mester ${d}`, sorted[0]?.gf ?? NaN);
  }
  if (divW[0] && divW[1]) {
    // divisionerne i sæsonen og i den næste (billederne fra 1/9; 30/6 har allerede næste sæsons divisioner)
    const CUR = divW[0], nextA = divW[1];
    const nx = new Map(nextA.clubs.map((c) => [c.name, c.div]));
    let up = 0, down = 0;
    for (const c of CUR.clubs) { const n2 = nx.get(c.name); if (!n2) continue; if (DIV_TIER[n2] < DIV_TIER[c.div]) up++; else if (DIV_TIER[n2] > DIV_TIER[c.div]) down++; }
    set('ligaer', 'oprykkere (klubber i en højere division næste sæson, billedet fra 1/9)', up);
    set('ligaer', 'nedrykkere', down);
    const fromPL = CUR.clubs.filter((c) => c.div === DIVS[0] && (nx.get(c.name) ?? '') !== DIVS[0]).map((c) => c.name).sort().join(', ');
    const toPL = nextA.clubs.filter((c) => c.div === DIVS[0] && !CUR.clubs.some((x) => x.name === c.name && x.div === DIVS[0])).map((c) => c.name).sort().join(', ');
    names.push({ si, side, fromPL, toPL });
    // ud af ligaerne / ind i ligaerne (Conference)
    set('ligaer', 'ud af Third Division (til Conference/ude)', CUR.clubs.filter((c) => c.div === DIVS[3] && (nx.get(c.name) ?? '') !== DIVS[3] && DIV_TIER[nx.get(c.name) ?? ''] !== 3).length);
  }
  for (const [k, v] of Object.entries(val)) { const [area, name] = k.split('\u0000'); const x = metrics.find((y) => y.area === area && y.name === name); if (side === 'o') put(area, name, si, x?.ours[si] ?? null, v); else put(area, name, si, v, x?.theirs[si] ?? null); }
}
const names: { si: number; side: 'o' | 'u'; fromPL: string; toPL: string }[] = [];
sKeys.forEach((season, si) => {
  const { a, b } = keyDates.get(season)!, cur = divDates.get(season), nxt = divDates.get(season + 1);
  seasonMetrics(si, oWorlds.get(a)!, oWorlds.get(b)!, [cur ? oWorlds.get(cur) : undefined, nxt ? oWorlds.get(nxt) : undefined], 'o', oTransfers, oLeague, season);
  if (!ONLY_ORACLE) seasonMetrics(si, uWorlds.get(a)!, uWorlds.get(b)!, [cur ? uWorlds.get(cur) : undefined, nxt ? uWorlds.get(nxt) : undefined], 'u', uTransfers, uLeague, season);
});

// ------------------------------------------------------------------ rapporten
const lines: string[] = [];
const out = (s = '') => { console.log(s); lines.push(s); };
const fmt = (x: Num) => (x === null ? '–' : Math.abs(x) >= 1000 ? Math.round(x).toLocaleString('da-DK') : Number.isInteger(x) ? String(x) : x.toFixed(2));
const rel = (o: Num, t: Num) => (o === null || t === null ? null : t === 0 ? (o === 0 ? 0 : Infinity) : (o - t) / Math.abs(t));
out(`# K7 – ${sKeys.length} sæsoner mod oraklets fordelinger (Arsenal på ferie, frø 1, 3.9.60, databasestørrelse 2)`);
out(`Sæsonerne: ${sKeys.map((s) => `${s}/${String(s + 1).slice(2)} (${keyDates.get(s)!.a} → ${keyDates.get(s)!.b})`).join(', ')}. Tal: vores / oraklet (afvigelse).`);
if (sacked.length) out(`Vores manager blev fyret og tog nyt job: ${sacked.join('; ')}.`);
for (const area of [...new Set(metrics.map((x) => x.area))]) {
  out(`\n## ${area}`);
  out(`| mål | ${sKeys.map((s) => `${s}/${String(s + 1).slice(2)}`).join(' | ')} |`);
  out(`|---|${sKeys.map(() => '---').join('|')}|`);
  for (const x of metrics.filter((y) => y.area === area)) out(`| ${x.name} | ${sKeys.map((_, i) => { const r = rel(x.ours[i], x.theirs[i]); return `${fmt(x.ours[i])} / ${fmt(x.theirs[i])}${r === null || !Number.isFinite(r) ? '' : ` (${r >= 0 ? '+' : ''}${Math.round(r * 100)} %)`}`; }).join(' | ')} |`);
}
out('\n## pensioner pr. måned maj–august (30+ væk fra hukommelsen mellem to billeder; måned = billedets dato)');
out('| måned | vores / oraklet |');
out('|---|---|');
for (const mk of [...new Set([...perMonth.o.keys(), ...perMonth.u.keys()])].sort()) {
  if (!['05', '06', '07', '08'].includes(mk.slice(5))) continue;
  out(`| ${mk} | ${ONLY_ORACLE ? '–' : perMonth.u.get(mk) ?? 0} / ${perMonth.o.get(mk) ?? 0} |`);
}
if (names.length) {
  out('\n## Op/ned i Premier League');
  for (const n of names) out(`- ${sKeys[n.si]}/${String(sKeys[n.si] + 1).slice(2)} ${n.side === 'o' ? 'oraklet' : 'vores'}: ned ${n.fromPL || '–'}; op ${n.toPL || '–'}`);
}
out(`\n${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (process.env.REPORT) writeFileSync(process.env.REPORT, lines.join('\n') + '\n');
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify({ keyDates: Object.fromEntries(keyDates), metrics, names }, null, 1));
if (!existsSync(Y23)) process.exitCode = 0;
if (STAFF) writeFileSync(STAFF, JSON.stringify({ o: [...oTransfers.values()].filter((t) => t.staff && t.eng), u: [...uTransfers.values()].filter((t) => t.staff && t.eng) }));
if (BUYS) writeFileSync(BUYS, JSON.stringify({ keyDates: Object.fromEntries(keyDates), o: [...oTransfers.values()].filter((t) => !t.staff), u: [...uTransfers.values()].filter((t) => !t.staff) }));
if (LOANS) writeFileSync(LOANS, JSON.stringify({ keyDates: Object.fromEntries(keyDates), o: { loans: [...oTransfers.values()].filter((t) => t.loan), ll: llSeries.o }, u: { loans: [...uTransfers.values()].filter((t) => t.loan), ll: llSeries.u } }));
