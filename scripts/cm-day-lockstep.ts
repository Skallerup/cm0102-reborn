// K2 (docs/ORIGINAL_PARITY.md): spil-lockstep pr. dag – hele spillet (ikke kun kampene) mod ORIGINALENS hukommelse dag for dag.
//
// Oraklet (Bosman headless, frø 1, 3.9.60, England, Arsenal på ferie, databasestørrelse 2) har øjebliksbilleder af hele hukommelsen
// (sporbinærens sn_trace.c: pre-<dag>-<år>.bin = lige FØR CONTRACT_MANAGER::daily_update 0x4c7ac0 i dagens tidspunkt 2 – dagens kampe og
// det meste af dagen er kørt). Spillet startes som oraklet (samme land/klub/frø; world-filen SKAL være bygget med CM_DBSIZE=2, ellers har
// spillet Maximum-hukommelsen og ~1.300 flere engelske klubløse) og spilles frem dag for dag; på hver dag med et billede sammenlignes:
//   spillere  klub, leje, kontrakt (findes/løn/udløb/type/trupstatus), transferstatus (+0x4e), CA/PA, de 18 interne egenskaber, de direkte,
//             moral, indkøringsbyten, omdømme, værdi, kondition/kampkondition, skadet
//   klubber   saldo, ugens lønsum, sæsonens poster (18), omdømme, truppens størrelse, manager, bestyrelsens fire tillidsværdier
//   job       antal ledige managerjob (MANAGER_MANAGER +8)
//   tabel     Premier League: kampprogram (dato/hjemme/ude) og resultater/point til D−1 (DAYSNAP/season.json = SAMME orakelkørsel; season-s1a.json
//             er en anden kørsel med frø 1 og har andre resultater – bruges kun uden dagsbilleder)
//   stab      managerne pr. klub    nyheder  menneskemanagerens indbakke (scripts/oracle-news.ts): antal pr. dag og de kendte typer begge veje
//   transfers originalens afsluttede handler (TRANSFER_MANAGER +0x862) pr. art mod spillets Player.moves, og handel for handel
// Dagsbilleder: `python3 -I scripts/oracle-day-snaps.py` (via measure.mjs --oracle) gemmer et billede pr. dag 14/7-01 → 30/6-02 i
// ~/cm0102-engine/oracle/daysnap/s1-3.9.60-e1 (1,1 GB; DAYSNAP=<mappe>, STEP=7 = pr. uge). Rapporten: første afvigelse pr. område og pr. felt
// i datoorden med eksempler og ejeren (where.ts); REPORT=<fil.md> gemmer den.
// Felter, der trækkes med tilfældige tal, divergerer fra den første trækning (spillets talrække er ikke originalens) – derfor tælles både
// eksakte afvigelser og fordelinger (gns. vores/oraklet). Den første afvigelse pr. system og afvigelser pr. dag/felt skrives til sidst.
//
//   CM_DBSIZE=2 npx tsx scripts/build-cm-data.mts <.orig-db/Original-3.9.60-Database-Swedish_fixed> <scratch>/world-dbs2.json 2001
//   WORLD=<scratch>/world-dbs2.json node scripts/measure.mjs -- npx tsx scripts/cm-day-lockstep.ts [til-dato=2002-06-30]   (hel sæson pr. dag ≈ 19 min)
// Miljø: SNAPS=<fil:iso,…> (ellers de kendte billeder nedenfor, de manglende springes over), EX=antal eksempler, ONLY=feltfilter,
//        JSON=<fil> (alle tal), CLUB=Arsenal.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { ORIG_NEWS_KIND, readOracleNews } from './oracle-news';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { ATTRS } from '../src/game/attributes';
import { INTRINSIC_KEYS } from '../src/game/playerInit';
import { GBP } from '../src/game/cmContractInit';
import { cmInMemory } from '../src/game/cmRetire';
import type { GameState, Player } from '../src/game/types';
import { _test as boardTest } from '../src/game/cmBoardGame';
import { isoToCm } from '../src/game/cmBoard';

const E = `${homedir()}/cm0102-engine`;
const KNOWN: [string, string][] = [
  [`${E}/work-r3/snap-start/pre-194-2001.bin`, '2001-07-14'],
  [`${E}/oracle/runs/xfer3-snap/pre-200-2001.bin`, '2001-07-20'],
  [`${E}/oracle/runs/xfer3-snap/pre-31-2002.bin`, '2002-02-01'],
  [`${E}/oracle/runs/xfer3-snap/pre-180-2002.bin`, '2002-06-30'],
];
const until = process.argv[2] ?? '2002-06-30';
// dagsbillederne (scripts/oracle-day-snaps.py → DAYSNAP-mappen, index.json): hver STEP. dag (1 = hver dag, 7 = pr. uge); ellers de 4 kendte
const dayIx = process.env.SNAPS ? null : readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP);
const STEP = Math.max(1, Number(process.env.STEP ?? 1));
type Snap = [string, string, () => SparseMem];
const snaps: Snap[] = dayIx
  ? dayIx.snaps.filter((e, i, xs) => e.iso <= until && (i % STEP === 0 || i === xs.length - 1 || e.iso === until)).map((e) => [`${dayIx.dir}/${e.file}`, e.iso, () => loadDaySnap(dayIx, e)])
  : (process.env.SNAPS ? process.env.SNAPS.split(',').map((x) => x.split(':') as [string, string]) : KNOWN)
    .filter(([f, d]) => d <= until && existsSync(f)).sort((a, b) => a[1].localeCompare(b[1])).map(([f, d]) => [f, d, () => loadSnap(f)]);
const missing = dayIx ? [] : KNOWN.filter(([f]) => !existsSync(f)).map(([f]) => f);
const EXN = Number(process.env.EX ?? 3);
const ONLY = process.env.ONLY ?? '';
const CLUB = process.env.CLUB ?? 'Arsenal';
const DUMP = process.env.DUMP ?? '';
const dumpRows: unknown[] = [];
/** BOARD_DUMP=<fil>: bestyrelsesposterne (+0..+0x38) og manageren pr. engelsk klub og billede, begge sider – til analysen af managerskifterne */
const BOARD_DUMP = process.env.BOARD_DUMP ?? '';
/** CON_DUMP=<fil>: kontrakterne (løn, bonusser, start +0x25, klub) pr. parret engelsk spiller og billede, begge sider – til bonusanalysen */
const CON_DUMP = process.env.CON_DUMP ?? '';
const conRows: unknown[] = [];
const boardRows: unknown[] = [];

// ------------------------------------------------------------------ statistik pr. dag og felt
interface Stat { n: number; bad: number; ex: string[] }
interface Dist { n: number; ours: number; theirs: number }
const days: string[] = [];
const stats = new Map<string, Map<string, Stat>>();     // felt → dag → tal
const dists = new Map<string, Map<string, Dist>>();
const sysOf = (f: string) => f.split(':')[0];
let today = '';
function chk(field: string, ok: boolean, label: () => string) {
  const byDay = stats.get(field) ?? stats.set(field, new Map()).get(field)!;
  const s = byDay.get(today) ?? byDay.set(today, { n: 0, bad: 0, ex: [] }).get(today)!;
  s.n++;
  if (!ok) { s.bad++; if (s.ex.length < EXN) s.ex.push(label()); }
}
function dist(field: string, ours: number, theirs: number) {
  const byDay = dists.get(field) ?? dists.set(field, new Map()).get(field)!;
  const d = byDay.get(today) ?? byDay.set(today, { n: 0, ours: 0, theirs: 0 }).get(today)!;
  d.n++; d.ours += ours; d.theirs += theirs;
}

// ------------------------------------------------------------------ hukommelsen
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
interface MemP { id: number; first: string; last: string; dobIso: string; yob: number; nat: string; st: number; pr: number; np: number; clubAdr: number }
interface View { m: SparseMem; S: number; n: number; C: number; nc: number; people: MemP[]; byId: Map<number, MemP>; clubByName: Map<string, number>; date: string }
function scan(m: SparseMem): View {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const clubByName = new Map<string, number>();
  for (let i = 0; i < nc; i++) { const nm = str(m, C + 0x245 * i + 4, 51); if (nm && !clubByName.has(nm)) clubByName.set(nm, i); }
  const people: MemP[] = [];
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61), np = m.u32(st + 0x69);
    if (!pr && !np) continue;
    const common = str(m, m.u32(st + 0xc)), f = str(m, m.u32(st + 4)), l = str(m, m.u32(st + 8));
    const dobIso = dayIso(m.s16(st + 0x10), m.u16(st + 0x12));
    people.push({ id, first: common ? '' : f, last: common || l, dobIso, yob: dobIso ? +dobIso.slice(0, 4) : m.s16(st + 0x18), nat: str(m, m.u32(st + 0x1a) + 4, 51), st, pr, np, clubAdr: m.u32(st + 0x39) });
  }
  return { m, S, n, C, nc, people, byId: new Map(people.map((p) => [p.id, p])), clubByName, date: dayIso(m.s16(0xae2c90), m.s16(0xae2c92)) };
}
const clubName = (v: View, adr: number) => (adr ? str(v.m, adr + 4, 51) : '');
const clubIdx = (v: View, adr: number) => (adr ? (adr - v.C) / 0x245 : -1);
const contractAt = (v: View, ix: number) => (ix < 0 ? 0 : v.m.u32(v.m.u32(0xae1050)) + 80 * ix);
const rowOf = (v: View, id: number) => v.m.u32(0xae2d0c) + 79 * id;
const engIx0 = (v: View, ix: number) => ix >= 0 && ix < v.nc && str(v.m, v.m.u32(v.C + 0x245 * ix + 0x53) + 4, 51) === 'England';
/** managerens navn pr. engelsk klub ved det første billede (hukommelsen / spillet) – til tællingen af managerskifter */
const mgr0 = new Map<number, [string, string]>();

// ------------------------------------------------------------------ spillet
const worldFile = process.env.WORLD ?? 'public/data/world-original.json';
const w = JSON.parse(readFileSync(worldFile, 'utf8')) as WorldData & { cmTrim?: { pct: number } };
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === CLUB)![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g: GameState = gs();
const start = g.date;
const nationName = (i: number) => g.nations[i]?.name ?? '';
const engClub = (cid: number) => !!cid && g.clubs[cid]?.nation === eng;
/** leje slut: lejerne ved forrige billede (spiller → "moderklub>lejeklub") og antallet af afsluttede siden spilstart */
const loanSeen = new Map<number, string>();
/** klubløse: originalens personer (se compare) */
const inMem = new Set<number>(), knownIds = new Set<number>();
let seenFree0 = false;
let loanEnds = 0;
const loanSeenO = new Map<number, string>();
let loanEndsO = 0;
const ourClubByName = new Map<string, number>();
for (const c of Object.values(g.clubs)) if (!ourClubByName.has(c.name)) ourClubByName.set(c.name, c.id);

// attributkortet (som scripts/cm-data-check.ts): de direkte egenskaber i spillerposten
const PF = ['Goalkeeper', 'Sweeper', 'Defender', 'DefensiveMidfielder', 'Midfielder', 'AttackingMidfielder', 'Attacker', 'WingBack', 'RightSide', 'LeftSide', 'Central', 'FreeRole',
  'Acceleration', 'Aggression', 'Agility', 'Anticipation', 'Balance', 'Bravery', 'Consistency', 'Corners', 'Crossing', 'Decisions', 'Dirtiness', 'Dribbling', 'Finishing', 'Flair', 'FreeKicks',
  'Handling', 'Heading', 'ImportantMatches', 'InjuryProneness', 'Jumping', 'Leadership', 'LeftFoot', 'LongShots', 'Marking', 'Movement', 'NaturalFitness', 'OneOnOnes', 'Pace', 'Passing',
  'Penalties', 'Positioning', 'Reflexes', 'RightFoot', 'Stamina', 'Strength', 'Tackling', 'Teamwork', 'Technique', 'ThrowIns', 'Versatility', 'Vision', 'WorkRate'];
const DIRECT: Record<string, string> = { freeKicks: 'FreeKicks', corners: 'Corners', technique: 'Technique', aggression: 'Aggression', bravery: 'Bravery', decisions: '', flair: 'Flair',
  influence: 'Leadership', teamwork: 'Teamwork', workRate: 'WorkRate', acceleration: 'Acceleration', agility: 'Agility', balance: 'Balance', jumping: 'Jumping', naturalFitness: 'NaturalFitness',
  pace: 'Pace', stamina: 'Stamina', strength: 'Strength', consistency: 'Consistency', importantMatches: 'ImportantMatches', injuryProneness: 'InjuryProneness', dirtiness: 'Dirtiness', versatility: 'Versatility' };
const INTERNAL = new Set<string>(INTRINSIC_KEYS);
const recOff = (f: string) => 0x0f + PF.indexOf(f);
const rowById = new Map<number, (string | number)[]>(w.players.map((x) => [x[0] as number, x as (string | number)[]]));
const W_IX = w.playerFields.indexOf('wage'), C_IX = w.playerFields.indexOf('contract');
const INT_OFFS = [0x1e, 0x23, 0x24, 0x26, 0x27, 0x2a, 0x2b, 0x31, 0x32, 0x33, 0x35, 0x37, 0x38, 0x39, 0x3a, 0x3e, 0x41, 0x43];

// ------------------------------------------------------------------ parring (ved det første billede; personernes id'er er faste i kørslen)
const startCa = new Map<number, number>();   // CA_GROUPS: oraklets CA ved første billede
let pair = new Map<number, number>();   // hukommelsens person-id → spillets spiller-id
const keyP = (first: string, last: string, yob: number | string, nat: string) => `${first}|${last}|${yob}|${nat}`;
function buildPairs(v: View) {
  const mem = new Map<string, MemP[]>();
  for (const p of v.people) if (p.pr) { const k = keyP(p.first, p.last, p.yob, p.nat); (mem.get(k) ?? mem.set(k, []).get(k)!).push(p); }
  const ours = new Map<string, Player[]>();
  for (const p of Object.values(g.players)) { if (p.virtual) continue; const k = keyP(p.first, p.last, p.dob.slice(0, 4), nationName(p.nation)); (ours.get(k) ?? ours.set(k, []).get(k)!).push(p); }
  for (const [k, os] of ours) {
    const ms = mem.get(k); if (!ms) continue;
    if (os.length === 1 && ms.length === 1) { pair.set(ms[0].id, os[0].id); continue; }
    for (const o of os) { const c = ms.filter((x) => x.dobIso === o.dob); if (c.length === 1) pair.set(c[0].id, o.id); }
  }
}

// ------------------------------------------------------------------ sammenligningen af én dag
const PL_COMP = g.clubs[user].league;
const ourPL = new Map<number, GameState['fixtures'][number]>();
const oracleSeason = (() => { try { return JSON.parse(readFileSync(dayIx && existsSync(`${dayIx.dir}/season.json`) ? `${dayIx.dir}/season.json` : `${E}/oracle/out/season-s1a.json`, 'utf8')) as { matches: { year: number; day: number; home_name: string; away_name: string; h: { goals: number }; a: { goals: number } }[] }; } catch { return null; } })();
const FINK = ['bought', 'sold', 'otherOut', 'interestOut', 'fines', 'maintenance', 'wages', 'dividends', 'bonuses', 'signOn', 'gate', 'otherIn', 'prize', 'seasonTickets', 'interestIn', 'investments', 'tv', 'merch'];
const near = (a: number, b: number, rel: number, abs = 0) => Math.abs(a - b) <= Math.max(abs, rel * Math.max(Math.abs(a), Math.abs(b)));

function compareDay(v: View) {
  const m = v.m;
  // ---------------- spillere
  const injBase = m.u32(0xb63d28) ? m.u32(m.u32(0xb63d28)) : 0;
  let pairedEng = 0;
  for (const [mid, pid] of pair) {
    const a = v.byId.get(mid), p = g.players[pid];
    if (!a || !a.pr || !p) continue;
    const mClub = clubName(v, a.clubAdr), oClub = g.clubs[p.club]?.name ?? '';
    const mNat = a.clubAdr ? str(m, m.u32(a.clubAdr + 0x53) + 4, 51) : '';
    // FOREIGN=1: kun spillerne i klubber uden for England (baggrundslandene – Europas modstandere)
    if (process.env.FOREIGN ? !p.club || engClub(p.club) || mNat === 'England' || !mNat : !(engClub(p.club) || mNat === 'England')) continue;
    pairedEng++;
    const lab = (e: string) => () => `${p.first} ${p.last} (${oClub || '-'}): ${e}`;
    const row = rowOf(v, mid), k = contractAt(v, m.s32(row)), kl = contractAt(v, m.s32(row + 4));
    if (DUMP && days.length === 1) {
      const rec = injBase ? injBase + 31 * mid : 0, c0 = p.contract;
      dumpRows.push({ pid, mid, name: `${p.first} ${p.last}`, club: oClub, mClub, league: g.clubs[p.club]?.league, ca: p.ca, mca: m.s16(a.pr + 5), pa: p.pa, mpa: m.s16(a.pr + 7),
        joined: p.joined ?? p.cmJoined, mJoined: dayIso(m.s16(a.st + 0x3e), m.u16(a.st + 0x40)), age: p.dob,
        ss: p.cmStaffState ?? 0, mss: m.u8(row + 0xa), row: Array.from({ length: 79 }, (_, i) => m.u8(row + i)),
        wage: c0 ? Math.round(c0.wage * GBP) : null, mwage: k ? m.s32(k + 0xc) : null, bon: c0?.cmBonusGbp ?? null, mbon: k ? [m.s32(k + 0x10), m.s32(k + 0x14), m.s32(k + 0x18)] : null,
        st: (p.cmContract?.b4f ?? 0) >> 4, mst: k ? m.u8(k + 0x4f) >> 4 : null, b4e: p.cmContract?.b4e, mb4e: k ? m.u8(k + 0x4e) : null, b3d: p.cmContract?.b3d, mb3d: k ? m.s8(k + 0x3d) : null,
        value: Math.round(p.value * GBP), mvalue: m.s32(a.st + 0x52), inj: p.cmFit?.inj ?? null, minj: rec ? m.s32(rec + 0xe) : null, minjRec: rec ? Array.from({ length: 31 }, (_, i) => m.u8(rec + i)) : null, fit: p.cmFit ?? null,
        loan: p.loan ?? null, mloan: !!kl, dbw: +(rowById.get(p.id)?.[W_IX] ?? 0), mpos: Array.from({ length: 7 }, (_, i) => m.s8(a.pr + 0xf + i)), mk: k ? Array.from({ length: 80 }, (_, i) => m.u8(k + i)) : null, P: p });
    }
    chk('spiller: klub (staff +0x39 = den nuværende, også lejeklubben)', mClub === oClub, lab(`${oClub || '-'} mod ${mClub || '-'}`));
    // inddata, databasen ikke har (originalen trækker dem med tilfældige tal ved indlæsningen): sammenlignes kun som fordeling
    const r = w.ratings[p.id] as undefined | { ca: number; tf?: unknown; paRaw?: number; rep?: number[]; rd?: number; attrs: number[] };
    const dbCa = !!r && r.ca > 1 && !r.tf, dbPa = !!r && r.paRaw === undefined, dbRep = !!r?.rep && r.rep.every((x) => x > 0);
    const dbRow = rowById.get(p.id), dbWage = dbRow ? +(dbRow[W_IX] ?? 0) > 0 : false, dbExp = dbRow ? !!dbRow[C_IX] : false;
    const dbAttrs = !!r && !r.attrs.some((x, i) => x === 0 && i < 36);
    const tag = (known: boolean) => (known ? '' : ' [tilfældige inddata]');
    chk('spiller: udlejet (række +4 ≥ 0)', !!kl === !!p.loan, lab(`${p.loan ? 'leje' : '-'} mod ${kl ? 'leje' : '-'}`));
    if (kl && p.loan) { const ln = m.s32(kl + 4) >= 0 ? clubName(v, v.C + 0x245 * m.s32(kl + 4)) : ''; chk('spiller: lejeklub', ln === oClub, lab(`${oClub} mod ${ln}`)); }
    const c = p.contract;
    chk('kontrakt: findes', !!k === !!c, lab(`${c ? 'ja' : 'nej'} mod ${k ? 'ja' : 'nej'}`));
    if (k && c) {
      const wm = m.s32(k + 0xc), wo = Math.round(c.wage * GBP);
      if (CON_DUMP) conRows.push({ d: days[days.length - 1], pid, mid, sc: m.s32(0xae2364), oc: oClub, mc: mClub, wo, wm, ob: c.cmBonusGbp ?? null, mb: [m.s32(k + 0x10), m.s32(k + 0x14), m.s32(k + 0x18)],
        os: c.cmStart ?? null, ms: dayIso(m.s16(k + 0x25), m.u16(k + 0x27)), oe: c.expires.slice(0, 10), me: dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)), ot: c.cmType ?? 2, mt: m.u8(k + 0x35) & 0x3f });
      chk('kontrakt: ugeløn (£)' + tag(dbWage), wo === wm, lab(`${wo} mod ${wm}`));
      dist('kontrakt: ugeløn (£)', wo, wm);
      const exp = dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f));
      chk('kontrakt: udløb' + tag(dbExp), c.expires.slice(0, 10) === exp, lab(`${c.expires.slice(0, 10)} mod ${exp}`));
      chk('kontrakt: type (+0x35)', (c.cmType ?? 2) === (m.u8(k + 0x35) & 0x3f), lab(`${c.cmType ?? 2} mod ${m.u8(k + 0x35) & 0x3f}`));
      chk('kontrakt: trupstatus (+0x4f høj nibble)' + (/^H/.test(g.clubs[p.club]?.league ?? 'H') ? ' [klub uden for ligaerne]' : ''), ((p.cmContract?.b4f ?? 0) >> 4) === (m.u8(k + 0x4f) >> 4), lab(`${(p.cmContract?.b4f ?? 0) >> 4} mod ${m.u8(k + 0x4f) >> 4}`));
      const b4e = m.u8(k + 0x4e);
      // spillets kontraktbyte (cmContract.b4e) mod hukommelsens: bit 1 = klubbens transferliste (0x842320; 0x5444a0 – Player.listed), bit 8 =
      // spillerens transferønske (0x4d8610; 0x544520 tester 1|8 = "transfer listed by request"), bit 2 = lejelisten
      const ob4e = p.cmContract?.b4e ?? (p.listed ? 1 : 0);
      chk('transferstatus: transferlistet af klubben (+0x4e bit 1)', !!(ob4e & 1) === !!(b4e & 1), lab(`${!!(ob4e & 1)} mod ${!!(b4e & 1)}`));
      chk('transferstatus: transferønske (+0x4e bit 8)', !!(ob4e & 8) === !!(b4e & 8), lab(`${!!(ob4e & 8)} mod ${!!(b4e & 8)}`));
      chk('transferstatus: lejelistet (+0x4e bit 2)', !!p.loanListed === !!(b4e & 2), lab(`${!!p.loanListed} mod ${!!(b4e & 2)}`));
      dist('transferstatus: andel transferlistet (bit 1|8)', ob4e & 9 ? 1 : 0, b4e & 9 ? 1 : 0);
      dist('transferstatus: andel listet af klubben (bit 1)', ob4e & 1 ? 1 : 0, b4e & 1 ? 1 : 0);
      dist('transferstatus: andel transferønske (bit 8)', ob4e & 8 ? 1 : 0, b4e & 8 ? 1 : 0);
      dist('transferstatus: andel lejelistet', p.loanListed ? 1 : 0, b4e & 2 ? 1 : 0);
      chk('kontrakt: tællere +0x44 (tilfredshed)', (p.cmContract?.b44 ?? 0) === m.s8(k + 0x44), lab(`${p.cmContract?.b44} mod ${m.s8(k + 0x44)}`));
      chk('kontrakt: flag +0x45', (p.cmContract?.b45 ?? 0) === m.u32(k + 0x45), lab(`${(p.cmContract?.b45 ?? 0).toString(16)} mod ${m.u32(k + 0x45).toString(16)}`));
      // bonusserne +0x10/+0x14/+0x18 (−1 = ingen) – 0x4ca6d0 betaler dem efter kampen (Finance::add_bonus 0x599960)
      const ob = c.cmBonusGbp ?? [-1, -1, -1], mb = [m.s32(k + 0x10), m.s32(k + 0x14), m.s32(k + 0x18)];
      ['mål', 'assist', 'clean sheet'].forEach((nm, i) => {
        const o = ob[i] > 0 ? ob[i] : 0, t = mb[i] > 0 ? mb[i] : 0;
        if (!o && !t) return;
        chk(`kontrakt: ${nm}bonus (+0x${(0x10 + 4 * i).toString(16)})`, o === t, lab(`${o} mod ${t}`));
        dist(`kontrakt: ${nm}bonus (£, andel med)`, o ? 1 : 0, t ? 1 : 0);
        dist(`kontrakt: ${nm}bonus (£)`, o, t);
      });
    }
    // evner
    const pr = a.pr;
    chk('spiller: CA' + tag(dbCa), p.ca === m.s16(pr + 5), lab(`${p.ca} mod ${m.s16(pr + 5)}`));
    dist('spiller: CA', p.ca, m.s16(pr + 5));
    chk('spiller: PA' + tag(dbPa), p.pa === m.s16(pr + 7), lab(`${p.pa} mod ${m.s16(pr + 7)}`));
    if (p.cmInt) {
      const bad = INT_OFFS.map((o, i) => (p.cmInt![i] === m.s8(pr + o) ? -1 : i)).filter((i) => i >= 0);
      dist('spiller: interne egenskaber, gns. |forskel| pr. egenskab' + tag(dbAttrs && dbCa), INT_OFFS.reduce((t, o, i) => t + Math.abs(p.cmInt![i] - m.s8(pr + o)), 0) / 18, 0);
      chk('spiller: 18 interne egenskaber ens' + tag(dbAttrs && dbCa), !bad.length, lab(bad.slice(0, 3).map((i) => `${INTRINSIC_KEYS[i]} ${p.cmInt![i]}/${m.s8(pr + INT_OFFS[i])}`).join(' ')));
    }
    let dBad = '';
    for (const [key, f] of Object.entries(DIRECT)) { if (!f || INTERNAL.has(key)) continue; const ki = ATTRS.indexOf(key as never); if (ki < 0) continue; const mv = m.s8(pr + recOff(f)); if (Math.round(p.attrs[ki]) !== mv && !dBad) dBad = `${key} ${Math.round(p.attrs[ki])}/${mv}`; }
    chk('spiller: direkte egenskaber ens' + tag(dbAttrs), !dBad, lab(dBad));
    chk('spiller: moral (+0x45)', Math.round(p.morale) === m.s8(pr + 0x45), lab(`${p.morale} mod ${m.s8(pr + 0x45)}`));
    dist('spiller: moral (+0x45)', p.morale, m.s8(pr + 0x45));
    if (p.cmStaffState !== undefined) chk('spiller: indkøringsbyte (række +0xa)', p.cmStaffState === m.u8(row + 0xa), lab(`${p.cmStaffState} mod ${m.u8(row + 0xa)}`));
    if (p.cmRepMem) {
      const rm = [m.u16(pr + 9), m.u16(pr + 0xb), m.u16(pr + 0xd)], ro = p.cmRepMem.map((x) => Math.round(x * 50));
      chk('spiller: omdømme (+9/+0xb/+0xd)' + tag(dbRep), ro.every((x, i) => x === rm[i]), lab(`${ro} mod ${rm}`));
      dist('spiller: omdømme aktuel (+0xb)', ro[1], rm[1]);
    }
    const mv = m.s32(a.st + 0x52);
    if (mv > 0 && p.club) { chk('spiller: værdi ±10 % (staff +0x52)' + tag(dbCa && dbPa && dbRep && !r?.rd), near(p.value * GBP, mv, 0.10), lab(`${Math.round(p.value * GBP)} mod ${mv}`)); dist('spiller: værdi (£)', p.value * GBP, mv); }
    if (injBase && p.cmFit) {
      const rec = injBase + 31 * mid;
      chk('kondition: Fitness (Injury +8)' + tag(dbAttrs), p.cmFit.f === m.u16(rec + 8), lab(`${p.cmFit.f} mod ${m.u16(rec + 8)}`));
      dist('kondition: Fitness (Injury +8)', p.cmFit.f, m.u16(rec + 8));
      chk('kondition: kampkondition (Injury +0xa)', p.cmFit.mc === m.u16(rec + 0xa), lab(`${p.cmFit.mc} mod ${m.u16(rec + 0xa)}`));
      dist('kondition: kampkondition (Injury +0xa)', p.cmFit.mc, m.u16(rec + 0xa));
      const injM = m.s32(rec + 0xe) !== -1;
      chk('skade: skadet (Injury +0xe ≠ −1)', injM === !!p.cmFit.inj, lab(`${p.cmFit.inj ? `type ${p.cmFit.inj.t}` : '-'} mod ${injM ? 'skadet' : '-'}`));
      dist('skade: andel skadede', p.cmFit.inj ? 1 : 0, injM ? 1 : 0);
    }
  }
  dist('spiller: parrede (engelske klubber)', pairedEng, pairedEng);
  {
    let ol = 0, ml = 0;
    for (const [mid, pid] of pair) { const p = g.players[pid], a = v.byId.get(mid); if (!p || !a?.pr) continue; if (p.loan && engClub(p.loan.from)) ol++; const kl = contractAt(v, m.s32(rowOf(v, mid) + 4)); if (kl && engIx0(v, m.s32(contractAt(v, m.s32(rowOf(v, mid))) + 4))) ml++; }
    dist('spiller: udlejede fra engelske klubber (antal)', ol, ml);
  }
  if (process.env.DEBUG_CLUB && days.length === 1) {
    const cid = ourClubByName.get(process.env.DEBUG_CLUB)!, ix = v.clubByName.get(process.env.DEBUG_CLUB)!;
    const memIds = new Set(v.people.filter((a) => a.pr && clubIdx(v, a.clubAdr) === ix).map((a) => a.id));
    const back = new Map([...pair].map(([a, b]) => [b, a]));
    for (const p of Object.values(g.players)) if (!p.virtual && p.club === cid && !memIds.has(back.get(p.id) ?? -1)) console.log(`    [klub] kun hos os: ${p.first} ${p.last} ${p.dob} CA ${p.ca}${back.has(p.id) ? ` (orig.: ${clubName(v, v.byId.get(back.get(p.id)!)!.clubAdr) || 'klubløs'})` : ' (ikke parret)'}`);
    for (const id of memIds) if (!pair.has(id) || g.players[pair.get(id)!].club !== cid) { const a = v.byId.get(id)!; console.log(`    [klub] kun i originalen: ${a.first} ${a.last} ${a.dobIso}${pair.has(id) ? ` (vores: ${g.clubs[g.players[pair.get(id)!].club]?.name ?? 'klubløs'})` : ' (ikke parret)'}`); }
  }
  // trupstørrelser og klubløse
  const memSquad = new Map<number, number>();
  let memFree = 0;
  for (const a of v.people) if (a.pr) { if (a.clubAdr) memSquad.set(clubIdx(v, a.clubAdr), (memSquad.get(clubIdx(v, a.clubAdr)) ?? 0) + 1); else memFree++; }
  dist('spiller: klubløse i hukommelsen (alle)', Object.values(g.players).filter((p) => !p.club && !p.virtual).length, memFree);
  // kun de spillere, originalen har i hukommelsen: klubløse ved start, i en klub i de valgte lande (eller Player.cmMem) på et billede, nyskabte.
  // Spillets spillere i de andre landes klubber findes ikke i originalen; når deres kontrakt udløber (cmExpireOutsideDaily), bliver de klubløse
  // hos os uden modstykke (30/6-02: 666 af de 993)
  for (const p of Object.values(g.players)) if (!p.virtual && (p.club ? g.activeNations?.includes(g.clubs[p.club]?.nation ?? -1) || p.cmMem === 1 : !seenFree0 || !knownIds.has(p.id))) inMem.add(p.id);
  if (!seenFree0) { for (const id of Object.keys(g.players)) knownIds.add(+id); seenFree0 = true; }
  else for (const id of Object.keys(g.players)) knownIds.add(+id);
  dist('spiller: klubløse i hukommelsen (originalens personer)', Object.values(g.players).filter((p) => !p.club && !p.virtual && inMem.has(p.id)).length, memFree);
  // ---------------- klubber
  const MM = m.u32(0xb67a44);
  for (const c of Object.values(g.clubs)) {
    if (c.nation !== eng || /^H/.test(c.league)) continue;
    const ix = v.clubByName.get(c.name); if (ix === undefined) continue;
    const adr = v.C + 0x245 * ix;
    const lab = (e: string) => () => `${c.name}: ${e}`;
    const f = m.u32(m.u32(0xae2a38)) + 0x167 * ix;
    const bal = m.u32(f) + m.s32(f + 4) * 4294967296, ob = Math.round(c.balance * GBP);
    chk('økonomi: saldo ±1 %', near(ob, bal, 0.01, 1000), lab(`${ob} mod ${bal}`));
    dist('økonomi: saldo (£)', ob, bal);
    const cf = g.cmFin?.[c.id];
    if (cf) {
      chk('økonomi: ugens lønsum (fin +0xc) ±2 %', near(cf.wb, m.s32(f + 0xc), 0.02, 50), lab(`${cf.wb} mod ${m.s32(f + 0xc)}`));
      dist('økonomi: ugens lønsum (£)', cf.wb, m.s32(f + 0xc));
      for (let i = 0; i < 18; i++) {
        const mo = i < 2 ? m.u32(f + 0x110 + 8 * i) + m.s32(f + 0x114 + 8 * i) * 4294967296 : m.s32(f + 0x110 + 0x10 + 4 * (i - 2));
        const oo = Math.round(cf.ty[i] ?? 0);
        if (!oo && !mo) continue;
        chk(`økonomi: sæsonpost ${FINK[i]} ±5 %`, near(oo, mo, 0.05, 100), lab(`${oo} mod ${mo}`));
        dist(`økonomi: sæsonpost ${FINK[i]} (£)`, oo, mo);
      }
    }
    chk('klub: omdømme (+0x80)', (g.cmClubRep?.[c.id] ?? c.rep * 100) === m.s16(adr + 0x80), lab(`${g.cmClubRep?.[c.id]} mod ${m.s16(adr + 0x80)}`));
    // staff +0x39 = den nuværende klub (lejeklubben for de udlejede) – samme hos os: p.club
    const ours = Object.values(g.players).filter((p) => !p.virtual && p.club === c.id).length;
    chk('klub: truppens størrelse (staff +0x39)', ours === (memSquad.get(ix) ?? 0), lab(`${ours} mod ${memSquad.get(ix) ?? 0}`));
    dist('klub: truppens størrelse', ours, memSquad.get(ix) ?? 0);
    const mgrP = m.u32(adr + 0xcf), mgr = g.staff[c.manager];
    const mn = mgrP ? (str(m, m.u32(mgrP + 0xc)) || `${str(m, m.u32(mgrP + 4))} ${str(m, m.u32(mgrP + 8))}`) : '';
    const on = c.id === g.userClub ? 'Test Smoke' : mgr ? `${mgr.first} ${mgr.last}`.trim() : '';
    if (c.id !== g.userClub) {
      chk('stab: manager (club +0xcf)', on === mn.trim(), lab(`${on || '-'} mod ${mn || '-'}`));
      if (!mgr0.has(c.id)) mgr0.set(c.id, [on, mn.trim()]);
      const [o0, m0] = mgr0.get(c.id)!;
      dist('bestyrelse: andel klubber med en anden manager end ved spilstart', on !== o0 ? 1 : 0, mn.trim() !== m0 ? 1 : 0);
    }
    // Comp_Stats-rækken (0x4a4850: [comps[club+0x57 → id]+8] +0xc rækker à 0x76, +0x14 antal, række+0 = klub-id): +4 kampe, +0x72..+0x75 placeringerne
    const dv = m.u32(adr + 0x57), cp = dv ? m.u32(m.u32(0xadadfc) + 4 * m.s32(dv)) : 0, sp = cp ? m.u32(cp + 8) : 0;
    let tpost: number[][] | null = null;
    if (sp) {
      const rows = m.u32(sp + 0xc), nr = m.s32(sp + 0x14);
      let row = 0;
      for (let i = 0; i < nr && i < 200; i++) if (m.s32(rows + 0x76 * i) === m.s32(adr)) { row = rows + 0x76 * i; break; }
      const e = row ? boardTest.entryOf(g, c.id, isoToCm(today)) : null;
      if (row && e) {
        const o = [e.played & 0xff, e.pos & 0xff, e.p73 & 0xff, e.p74 & 0xff, e.p75 & 0xff], or = [m.u8(row + 4), m.u8(row + 0x72), m.u8(row + 0x73), m.u8(row + 0x74), m.u8(row + 0x75)];
        tpost = [o, or];
        chk('bestyrelse: tabelpost kampe (+4)', o[0] === or[0], lab(`${o[0]} mod ${or[0]}`));
        chk('bestyrelse: tabelpost +0x72 (udgangsplacering)', o[1] === or[1], lab(`${o[1]} mod ${or[1]}`));
        if (o[0] === or[0]) {
          chk('bestyrelse: tabelpost +0x73 (placering nu)', o[2] === or[2], lab(`${o[2]} mod ${or[2]} (${o[0]} kampe)`));
          chk('bestyrelse: tabelpost +0x74/+0x75 (bedst/dårligst)', o[3] === or[3] && o[4] === or[4], lab(`${o[3]}/${o[4]} mod ${or[3]}/${or[4]} (nu ${o[2]}/${or[2]}, ${o[0]} kampe)`));
        }
        dist('bestyrelse: tabelpost +0x74 bedst', o[3], or[3]);
        dist('bestyrelse: tabelpost +0x75 dårligst', o[4], or[4]);
      }
    }
    if (BOARD_DUMP && MM && c.id !== g.userClub) {
      const R = g.cmBoard?.rec[c.id], rb = m.u32(MM) + 0x49 * ix;
      const mine = R ? [R.b1, R.b2, R.w6, R.w8, R.wa, R.wc, R.e, R.w10, R.w12, R.w14, R.w16, R.t2c, R.q30, R.d38] : null;
      const orac = [m.u8(rb + 1), m.u8(rb + 2), m.s16(rb + 6), m.s16(rb + 8), m.s16(rb + 0xa), m.s16(rb + 0xc), m.u16(rb + 0xe), m.s16(rb + 0x10), m.s16(rb + 0x12), m.s16(rb + 0x14), m.s16(rb + 0x16), m.s32(rb + 0x2c), m.f64(rb + 0x30), m.f64(rb + 0x38)];
      boardRows.push({ d: today, c: c.name, lg: c.league, om: on, mm: mn.trim(), o: mine, m: orac, tp: tpost });
    }
    if (MM && g.cmBoard?.rec[c.id]) {
      const R = g.cmBoard.rec[c.id], rb = m.u32(MM) + 0x49 * ix;
      for (const [nm, o, val] of [['w6 tillid', 6, R.w6], ['w8', 8, R.w8], ['wa', 0xa, R.wa], ['wc', 0xc, R.wc]] as const) {
        chk(`bestyrelse: ${nm} (+0x${o.toString(16)})`, val === m.s16(rb + o), lab(`${val} mod ${m.s16(rb + o)}`));
        dist(`bestyrelse: ${nm}`, val, m.s16(rb + o));
      }
    }
  }
  if (MM) { const vac = m.u32(MM + 8); dist('bestyrelse: ledige managerjob (alle lande)', g.cmBoard?.vac.length ?? 0, vac ? m.s16(vac) : 0); }
  // ---------------- tabel og kampprogram (Premier League, oraklets season-s1a.json)
  if (oracleSeason) {
    const iso = (y: number, d: number) => dayIso(d, y);
    // til og med D−1 på begge sider (billedet D har også dagens tidlige kampe, vores spil står ved D−1)
    const om = oracleSeason.matches.filter((x) => iso(x.year, x.day) < today);
    // vores PL-kampe gemmes løbende (sæsonskiftet fjerner sæsonens kampe fra g.fixtures)
    for (const f of Object.values(g.fixtures)) if (f.comp === PL_COMP && f.date >= start && f.date <= '2002-06-30') ourPL.set(f.id, { ...f });
    const ourF = [...ourPL.values()];
    const key = (d: string, h: string, a: string) => `${d}|${h}|${a}`;
    const ourKeys = new Map(ourF.map((f) => [key(f.date, g.clubs[f.home]?.name, g.clubs[f.away]?.name), f]));
    for (const x of om) {
      const f = ourKeys.get(key(iso(x.year, x.day), x.home_name, x.away_name));
      chk('tabel: PL-kamp på samme dato (kampprogram)', !!f, () => `${iso(x.year, x.day)} ${x.home_name}–${x.away_name} mangler hos os`);
      if (f?.result) {
        chk('tabel: PL-resultat ens', f.result.hg === x.h.goals && f.result.ag === x.a.goals, () => `${iso(x.year, x.day)} ${x.home_name}–${x.away_name} ${f.result!.hg}-${f.result!.ag} mod ${x.h.goals}-${x.a.goals}`);
        dist('tabel: PL-mål pr. kamp', f.result.hg + f.result.ag, x.h.goals + x.a.goals);
      }
    }
    const tab = (rows: { h: string; a: string; hg: number; ag: number }[]) => {
      const t = new Map<string, number>();
      for (const r of rows) { t.set(r.h, (t.get(r.h) ?? 0) + (r.hg > r.ag ? 3 : r.hg === r.ag ? 1 : 0)); t.set(r.a, (t.get(r.a) ?? 0) + (r.ag > r.hg ? 3 : r.hg === r.ag ? 1 : 0)); }
      return [...t.entries()].sort((a, b) => b[1] - a[1]);
    };
    if (days.length === snaps.length) {
      // kampprogrammet for hele sæsonen (ved det sidste billede – tv-flytningerne 0x685640 sker dagligt 4 uger frem): antal PL-kampe pr. dato
      // (datoerne er originalens skemaer; hvilke hold der mødes og hvilke kampe der flyttes til tv, trækkes med rand)
      const cnt = (xs: string[]) => xs.reduce((mp, d) => mp.set(d, (mp.get(d) ?? 0) + 1), new Map<string, number>());
      const oc = cnt(oracleSeason.matches.map((x) => iso(x.year, x.day))), uc = cnt(ourF.map((f) => f.date));
      for (const d of [...new Set([...oc.keys(), ...uc.keys()])].sort()) chk('tabel: antal PL-kampe pr. dato (hele sæsonen)', (oc.get(d) ?? 0) === (uc.get(d) ?? 0), () => `${d}: ${uc.get(d) ?? 0} mod ${oc.get(d) ?? 0}`);
      const pairs = (xs: [string, string][]) => new Set(xs.map(([h, a]) => `${h}|${a}`));
      const op = pairs(oracleSeason.matches.map((x) => [x.home_name, x.away_name])), up = pairs(ourF.map((f) => [g.clubs[f.home].name, g.clubs[f.away].name]));
      chk('tabel: samme 380 hjemme/ude-par', [...op].every((x) => up.has(x)), () => `${[...op].filter((x) => !up.has(x)).length} par mangler`);
      const wd = (d: string) => new Date(d + 'T00:00:00Z').getUTCDay();
      for (let k = 0; k < 7; k++) dist(`tabel: PL-kampe om ${['søndagen', 'mandagen', 'tirsdagen', 'onsdagen', 'torsdagen', 'fredagen', 'lørdagen'][k]} (hele sæsonen)`, ourF.filter((f) => wd(f.date) === k).length, oracleSeason.matches.filter((x) => wd(iso(x.year, x.day)) === k).length);
    }
    const ot = tab(om.map((x) => ({ h: x.home_name, a: x.away_name, hg: x.h.goals, ag: x.a.goals })));
    const ut = tab(ourF.filter((f) => f.result && f.date < today).map((f) => ({ h: g.clubs[f.home].name, a: g.clubs[f.away].name, hg: f.result!.hg, ag: f.result!.ag })));
    if (ot.length) {
      const opos = new Map(ot.map(([n], i) => [n, i + 1]));
      for (const [n, p] of ut) { const op = ot.find((x) => x[0] === n)?.[1] ?? 0; chk('tabel: PL-point ens', p === op, () => `${n} ${p} mod ${op}`); }
      dist('tabel: mesterens point', ut[0]?.[1] ?? 0, ot[0][1]);
      chk('tabel: samme førerhold', ut[0]?.[0] === ot[0][0], () => `${ut[0]?.[0]} mod ${ot[0][0]} (${opos.size} hold)`);
    }
  }
  // ---------------- transfers (TRANSFER_MANAGER +0x862, se ct-season-club.ts for felterne)
  const tmA = m.u32(0xde1f54), arr = m.u32(tmA + 0x862), nT = m.s32(tmA + 0x86a);
  const engIx = (ix: number) => ix >= 0 && str(m, m.u32(v.C + 0x245 * ix + 0x53) + 4, 51) === 'England';
  const memKinds: Record<string, number> = {};
  let sameDeal = 0, memPairedDeals = 0;
  const ourMoves = new Map<number, { to: number; from: number; fee: number; loan?: boolean; date: string }[]>();
  for (const p of Object.values(g.players)) for (const mv of p.moves ?? []) if (mv.date >= start && mv.date <= today) (ourMoves.get(p.id) ?? ourMoves.set(p.id, []).get(p.id)!).push(mv);
  for (let i = 0; i < nT; i++) {
    const r = arr + 37 * i, y = m.s16(r + 0x1f), d = dayIso(m.s16(r + 0x1d), y);
    if (!d || d < start || d > today) continue;
    const art = m.u8(r + 0x1c), own = m.s32(r + 0x14), other = m.s32(r + 0x10);
    const from = art === 4 ? other : own, to = art === 4 ? own : other;
    if (!engIx(from) && !engIx(to)) continue;
    const kind = art === 0 ? (from < 0 ? 'klubløs skriver under' : m.s32(r + 0x18) > 0 ? 'køb med sum' : 'køb uden sum') : art === 2 ? 'leje' : art === 3 ? 'kontrakt udløbet (fri)' : art === 4 ? 'leje slut i historikken (art 4)' : `art ${art}`;
    memKinds[kind] = (memKinds[kind] ?? 0) + 1;
    const pid = pair.get(m.s32(r));
    if (pid !== undefined && art !== 4) {
      memPairedDeals++;
      const toName = to >= 0 ? str(m, v.C + 0x245 * to + 4, 51) : '';
      const ok = (ourMoves.get(pid) ?? []).some((mv) => (g.clubs[mv.to]?.name ?? '') === toName && (art === 2) === !!mv.loan);
      chk('transfers: originalens handel findes hos os (spiller → klub, leje/køb)', ok, () => { const p = g.players[pid]; return `${d} ${p?.first ?? pid} ${p?.last ?? '(væk)'} → ${toName || '-'}${art === 2 ? ' (leje)' : ''}: ${ourMoves.get(pid)?.map((mv) => `${mv.date} → ${g.clubs[mv.to]?.name ?? '-'}`).join(', ') || 'ingen'} mod ${d} → ${toName || '-'}`; });
      if (ok) sameDeal++;
      else if (process.env.DEBUG_DEALS && memPairedDeals <= 5) { const p = g.players[pid]; console.log(`    [deal] ${d} ${p.first} ${p.last}: art ${art} ${from >= 0 ? str(m, v.C + 0x245 * from + 4, 51) : '-'} → ${toName || '-'} £${m.s32(r + 0x18)}; vores: ${JSON.stringify(p.moves ?? [])} nu ${g.clubs[p.club]?.name}`); }
    }
  }
  {
    // vores handler (parret spiller, England) skal findes i originalens liste med samme modtagerklub
    const memTo = new Map<number, string[]>();
    for (let i = 0; i < nT; i++) {
      const r = arr + 37 * i, d = dayIso(m.s16(r + 0x1d), m.s16(r + 0x1f)); if (!d || d < start || d > today) continue;
      const art = m.u8(r + 0x1c); if (art === 4) continue;
      const to = m.s32(r + 0x14); (memTo.get(m.s32(r)) ?? memTo.set(m.s32(r), []).get(m.s32(r))!).push(to >= 0 ? str(m, v.C + 0x245 * to + 4, 51) : '');
    }
    const back = new Map([...pair].map(([a, b]) => [b, a]));
    for (const [pid, mvs] of ourMoves) {
      const mid = back.get(pid); if (mid === undefined) continue;
      for (const mv of mvs) {
        if (!engClub(mv.from) && !engClub(mv.to)) continue;
        const toName = g.clubs[mv.to]?.name ?? '';
        chk('transfers: vores handel findes i originalen (spiller → klub)', (memTo.get(mid) ?? []).includes(toName), () => { const p = g.players[pid]; return `${mv.date} ${p.first} ${p.last} → ${toName || '-'}${mv.loan ? ' (leje)' : ''} mod ${(memTo.get(mid) ?? []).map((x) => x || '-').join(', ') || 'ingen handel'}`; });
      }
    }
  }
  const ourKinds: Record<string, number> = {};
  for (const [, mvs] of ourMoves) for (const mv of mvs) {
    if (!engClub(mv.from) && !engClub(mv.to)) continue;
    const kind = mv.loan ? 'leje' : !mv.to ? 'kontrakt udløbet (fri)' : !mv.from ? 'klubløs skriver under' : mv.fee > 0 ? 'køb med sum' : 'køb uden sum';
    ourKinds[kind] = (ourKinds[kind] ?? 0) + 1;
  }
  // leje slut (art 4): vores lejeaftaler noteres ikke ved afslutningen – lejerne mellem to billeder sammenlignes (en leje, der både starter og
  // slutter mellem to billeder, ses ikke)
  for (const p of Object.values(g.players)) {
    const was = loanSeen.get(p.id), now = p.loan ? `${p.loan.from}>${p.club}` : '';
    if (was && was !== now) { const [f, t] = was.split('>').map(Number); if (engClub(f) || engClub(t)) loanEnds++; }
    if (now) loanSeen.set(p.id, now); else loanSeen.delete(p.id);
  }
  if (loanEnds) ourKinds['leje slut'] = loanEnds;
  // originalens lejer slutter også midt i sæsonen (0x4c8077: lejekontraktens slutdato = i dag → end_loan 0x4d07e0, uden historikpost – art 4
  // skrives næsten kun ved sæsonslut), så de tælles som vores: lejerne (rækken +4 ≥ 0) mellem to billeder
  for (const a of v.people) {
    if (!a.pr) continue;
    const row = rowOf(v, a.id), kl = contractAt(v, m.s32(row + 4)), k = contractAt(v, m.s32(row));
    const now = kl ? `${k ? m.s32(k + 4) : -1}>${m.s32(kl + 4)}` : '';
    const was = loanSeenO.get(a.id);
    if (was && was !== now) { const [f, t] = was.split('>').map(Number); if (engIx0(v, f) || engIx0(v, t)) loanEndsO++; }
    if (now) loanSeenO.set(a.id, now); else loanSeenO.delete(a.id);
  }
  if (loanEndsO) memKinds['leje slut'] = loanEndsO;
  // art 5 = ikke-spillernes skifter (0x68f9c0 @0x690432 managerskift klub → klub, 0x8c9720 @0x8c99bf job uden spillerpost) – vores Staff.moves
  for (const s of Object.values(g.staff)) for (const mv of s.moves ?? []) {
    if (mv.date < start || mv.date > today || (!engClub(mv.from) && !engClub(mv.to))) continue;
    ourKinds['art 5'] = (ourKinds['art 5'] ?? 0) + 1;
  }
  for (const k of new Set([...Object.keys(memKinds), ...Object.keys(ourKinds)])) dist(`transfers: ${k} (England, siden spilstart)`, ourKinds[k] ?? 0, memKinds[k] ?? 0);
  dist('transfers: originalens handler (parret spiller) også hos os', sameDeal, memPairedDeals);
}

// ------------------------------------------------------------------ nyhederne (scripts/oracle-news.ts: menneskemanagerens ring på 100 poster)
// Dagen D−1 er færdig på begge sider (billedet tages i dag D's tidspunkt 2). Sammenlignes: antal nyheder den dag, og for de typer, hvor vores
// nøgle er kendt (ORIG_NEWS_KIND), at hver nyhed findes på den anden side samme dag.
/** board.cm-nyhedernes art: params.k, ellers beskrivelsen params.bd (cmBoardGame.ts boardParams gemmer k i bd) */
const kOf = (n: { params: Record<string, string | number> }) => {
  if (n.params?.k !== undefined) return String(n.params.k);
  try { return typeof n.params?.bd === 'string' ? String(JSON.parse(n.params.bd).k ?? '') : ''; } catch { return ''; }
};
const kindRe = (pat: string) => pat.split('|').map((alt) => {
  const k = alt.match(/^([\w.]+)\(k=(\w+)\)$/);
  if (k) return (n: { key: string; params: Record<string, string | number> }) => n.key === k[1] && kOf(n) === k[2];
  if (/\(rq,rc\)$/.test(alt)) return (n: { key: string; params: Record<string, string | number> }) => n.key === 'board.cm' && (kOf(n) === 'rq' || kOf(n) === 'rc');
  const re = new RegExp('^' + alt.replace(/\{[^}]*\}/g, '@').replace(/\.N$|\.\*$|\*$/, '@').replace(/[.]/g, '\\.').replace(/@/g, '.*') + '$');
  return (n: { key: string }) => re.test(n.key);
});
const KIND = Object.entries(ORIG_NEWS_KIND).map(([t, pat]) => ({ t: +t, pat, ms: kindRe(pat) }));
const hx = (t: number) => '0x' + t.toString(16);
function compareNews(v: View, day: string) {
  const mine = readOracleNews(v.m).filter((x) => x.club === CLUB);
  const om = mine.filter((x) => x.date === day);
  const ours = (g.news ?? []).filter((n) => n.date.slice(0, 10) === day);
  const tv = (xs: number[]) => [...xs.reduce((mp, t) => mp.set(t, (mp.get(t) ?? 0) + 1), new Map<number, number>())].map(([t, n]) => `${hx(t)}×${n}`).join(' ');
  chk('nyheder: antal på dagen (menneskemanageren)', om.length === ours.length, () => `${day}: ${ours.length} (${[...new Set(ours.map((n) => n.key + (kOf(n) ? `(k=${kOf(n)})` : '')))].join(' ')}) mod ${om.length} (${tv(om.map((x) => x.type))})`);
  dist('nyheder: pr. dag', ours.length, om.length);
  for (const x of om) {
    const k = KIND.find((y) => y.t === x.type);
    if (!k) continue;
    chk('nyheder: originalens nyhed (kendt type) findes hos os samme dag', ours.some((n) => k.ms.some((f) => f(n))), () => `${day} ${hx(x.type)} ${k.pat} [${(x.slots ?? []).slice(0, 4).join(',')}]: mangler hos os mod findes`);
  }
  for (const n of ours) {
    const ks = KIND.filter((y) => y.ms.some((f) => f(n)));
    if (!ks.length) continue;
    chk('nyheder: vores nyhed (kendt type) findes i originalen samme dag', om.some((x) => ks.some((y) => y.t === x.type)), () => `${day} ${n.key}${kOf(n) ? `(k=${kOf(n)})` : ''} ${JSON.stringify(n.params).slice(0, 60)}: findes mod mangler (${ks.map((y) => hx(y.t)).join('/')})`);
  }
}

// ------------------------------------------------------------------ kørslen
const t0 = Date.now();
console.log(`K2 dag-lockstep: ${worldFile} (cmTrim.pct ${w.cmTrim?.pct ?? '?'} – 0,02 = CM_DBSIZE=2), ${CLUB}, frø 1; start ${start}`);
if (w.cmTrim && w.cmTrim.pct !== 0.02) console.log('ADVARSEL: world-filen er ikke bygget med CM_DBSIZE=2 – klubløse/trupper er ikke sammenlignelige med oraklet');
console.log(`billeder: ${snaps.map(([, d]) => d).join(', ') || '(ingen)'}${missing.length ? `; mangler: ${missing.join(', ')}` : ''}`);
for (const [, iso, load] of snaps) {
  // spillet stilles på dagen FØR billedets dag, færdigspillet: oraklets billede er taget før CONTRACT_MANAGER::daily_update på dagen (fx kører
  // 30/6's udløb først efter billedet). Dagens kampe/økonomi (tidspunkt 0–2) er dog kørt i billedet – det giver en lille skævhed på kampdage.
  // Spilstarten sammenlignes lige efter createGame (14/7, før dagen).
  const prev = new Date(Date.parse(iso) - 86400000).toISOString().slice(0, 10);
  if (iso !== start) while (g.date < prev || !g.dayDone || g.pendingFixture) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
  const v = scan(load());
  today = iso; days.push(iso);
  if (!pair.size) buildPairs(v);
  console.log(`  ${iso}: billedets dato ${v.date}, spillets ${g.date} (færdig); ${v.people.filter((p) => p.pr).length} spillere i hukommelsen, ${pair.size} parret (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  compareDay(v);
  compareNews(v, prev);
  if (process.env.CA_GROUPS) caGroups(v);
}

// CA_GROUPS=1: CA-fordelingen i hele hukommelsen (alle spillerposter mod alle vores ikke-fyldspillere – uafhængigt af parringen) og for de
// parrede efter start-CA (oraklets CA ved det første billede)
function caGroups(v: View) {
  const m = v.m, yrs = (dob: string) => (Date.parse(v.date) - Date.parse(dob)) / (365.25 * 86400000);
  const ages = [[0, 21], [21, 25], [25, 30], [30, 99]] as const, ag = (a: number) => ages.findIndex(([lo, hi]) => a >= lo && a < hi);
  const oc: number[] = [], uc: number[] = [], oa: number[][] = ages.map(() => []), ua: number[][] = ages.map(() => []);
  for (const a of v.people) if (a.pr) { const c = m.s16(a.pr + 5); oc.push(c); const i = ag(yrs(a.dobIso || `${a.yob}-07-01`)); if (i >= 0) oa[i].push(c); }
  for (const p of Object.values(g.players)) if (!p.virtual) { uc.push(p.ca); const i = ag(yrs(p.dob)); if (i >= 0 && cmInMemory(g, p)) ua[i].push(p.ca); }   // aldersgrupperne: kun hukommelsens
  const mean = (xs: number[]) => (xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : 0);
  const top = (xs: number[], k: number) => mean([...xs].sort((a, b) => b - a).slice(0, k));
  const put = (f: string, o: number, t: number) => { const byDay = dists.get(f) ?? dists.set(f, new Map()).get(f)!; byDay.set(today, { n: 1, ours: o, theirs: t }); };
  put('ca-hele: antal poster', uc.length, oc.length);
  put('ca-hele: antal i hukommelsen (cmInMemory)', Object.values(g.players).filter((p) => !p.virtual && cmInMemory(g, p)).length, oc.length);
  { const um = Object.values(g.players).filter((p) => !p.virtual && cmInMemory(g, p)).map((p) => p.ca); put('ca-hele: CA gns. i hukommelsen', mean(um), mean(oc)); put('ca-hele: CA top 100 i hukommelsen', top(um, 100), top(oc, 100)); put('ca-hele: CA top 500 i hukommelsen', top(um, 500), top(oc, 500)); }
  put('ca-hele: CA gns.', mean(uc), mean(oc));
  put('ca-hele: CA top 100', top(uc, 100), top(oc, 100));
  put('ca-hele: CA top 500', top(uc, 500), top(oc, 500));
  put('ca-hele: CA top 2000', top(uc, 2000), top(oc, 2000));
  ages.forEach(([lo, hi], i) => { put(`ca-hele: CA alder ${lo}-${hi - 1} gns.`, mean(ua[i]), mean(oa[i])); put(`ca-hele: CA alder ${lo}-${hi - 1} antal`, ua[i].length, oa[i].length); });
  const grp = [[0, 40], [40, 80], [80, 120], [120, 999]] as const;
  for (const [mid, pid] of pair) {
    const a = v.byId.get(mid), p = g.players[pid];
    if (!a || !a.pr || !p) continue;
    const c = m.s16(a.pr + 5);
    if (!startCa.has(mid)) startCa.set(mid, c);
    const s0 = startCa.get(mid)!, k = grp.findIndex(([lo, hi]) => s0 >= lo && s0 < hi);
    if (k >= 0) dist(`ca-parret: start-CA ${grp[k][0]}-${grp[k][1] - 1}`, p.ca, c);
    const i = ag(yrs(p.dob));
    if (i >= 0) dist(`ca-parret: alder ${ages[i][0]}-${ages[i][1] - 1}`, p.ca, c);
  }
}

// ------------------------------------------------------------------ rapport
// Ejeren af et felt: where.ts-søgningen (adresse/emne) for den port, der skriver feltet i originalen. Første src/-hit vises i rapporten.
const OWNER: [RegExp, string][] = [
  [/^spiller: (klub|udlejet|lejeklub)|^klub: truppens|^transfers:/, '0x8c5880'],
  [/^kontrakt: ugeløn/, '0x864550'],
  [/^kontrakt: .*bonus/, '0x4ca6d0'],
  [/^kontrakt: trupstatus|^transferstatus:/, 'cmTransferList'],
  [/^kontrakt:/, '0x4c7ac0'],
  [/^spiller: (CA|PA|18 interne|direkte)/, '0x5d38f9'],
  [/^spiller: moral/, '0x5d6d10'],
  [/^spiller: indkøringsbyte/, 'staffStateDaily'],
  [/^spiller: omdømme/, 'cmRepMem'],
  [/^spiller: værdi/, '0x4d0c60'],
  [/^(kondition|skade):/, '0x62c080'],
  [/^økonomi:/, '0x59b9c0'],
  [/^klub: omdømme/, 'cmClubRep'],
  [/^(stab|bestyrelse):/, '0x68f9c0'],
  [/^tabel: (PL-kamp på|antal PL-kampe|samme 380)/, '0x685640'],
  [/^tabel:/, '0x6b98c0'],
  [/^nyheder:/, '0x785d40'],
];
const ownerCache = new Map<string, string>();
function ownerOf(field: string): string {
  const q = OWNER.find(([re]) => re.test(field))?.[1];
  if (!q) return '?';
  if (!ownerCache.has(q)) {
    let top = '';
    try {
      const o = execFileSync('npx', ['tsx', 'scripts/where.ts', q], { encoding: 'utf8', env: { ...process.env, WHERE_MAX: '3' }, stdio: ['ignore', 'pipe', 'ignore'] });
      top = o.split('== src/')[1]?.split('\n')[1]?.match(/^(src\/[^:]+)/)?.[1] ?? '';
    } catch { /* where.ts fejlede */ }
    ownerCache.set(q, `${q}${top ? ` → ${top}` : ''}`);
  }
  return ownerCache.get(q)!;
}
// første afvigelse pr. felt (tidligste dag) og pr. område (feltets præfiks før ':'). Felter med [tilfældige inddata] afviger fra spilstarten,
// fordi originalen trækker inddataene med rand ved indlæsningen – de står for sig og tæller ikke som områdets første afvigelse.
interface First { day: string; field: string; ex: string[]; bad: number; n: number }
const firstField = new Map<string, First>();
for (const [f, byDay] of stats) for (const d of days) { const s = byDay.get(d); if (s?.bad) { firstField.set(f, { day: d, field: f, ex: s.ex, bad: s.bad, n: s.n }); break; } }
const isRandIn = (f: string) => f.includes('[tilfældige inddata]') || f.includes('[klub uden for ligaerne]');
const byDate = (a: First, b: First) => a.day.localeCompare(b.day) || b.bad / b.n - a.bad / a.n;
const firstArea = new Map<string, First>();
for (const x of [...firstField.values()].filter((x) => !isRandIn(x.field)).sort(byDate)) if (!firstArea.has(sysOf(x.field))) firstArea.set(sysOf(x.field), x);
const lines: string[] = [];
const out = (s = '') => { console.log(s); lines.push(s); };
const cell = (s: string) => s.replace(/\|/g, '/');
if (DUMP) writeFileSync(DUMP, JSON.stringify(dumpRows));
if (BOARD_DUMP) writeFileSync(BOARD_DUMP, JSON.stringify(boardRows));
if (CON_DUMP) writeFileSync(CON_DUMP, JSON.stringify(conRows));
out(`\n# Dag for dag mod originalen – ${days[0]} → ${days[days.length - 1]} (${days.length} billeder, ${CLUB}, frø 1, ${worldFile})`);
out('Eksempler: «vores mod originalen». Berørte = afvigelser/tjekket den dag. Billedet for dag D er taget før 0x4c7ac0(D, 2, 1); vores spil står ved dag D−1, færdigspillet.');
out('\n## Første afvigelse pr. område (uden felter med tilfældige inddata)');
out('| dato | område | felt | berørte | eksempel (vores mod orig.) | ejer (where.ts) |');
out('|---|---|---|---|---|---|');
for (const [a, x] of [...firstArea.entries()].sort((p, q) => byDate(p[1], q[1]))) out(`| ${x.day} | ${a} | ${cell(x.field.slice(a.length + 2))} | ${x.bad}/${x.n} | ${cell(x.ex[0] ?? '')} | ${ownerOf(x.field)} |`);
out('\n## Første afvigelse pr. felt (datoorden)');
out('| dato | felt | berørte | eksempler (vores mod orig.) | ejer |');
out('|---|---|---|---|---|');
for (const x of [...firstField.values()].sort(byDate)) out(`| ${x.day} | ${cell(x.field)} | ${x.bad}/${x.n} | ${x.ex.map(cell).join('; ')} | ${ownerOf(x.field)} |`);
const clean = [...stats.keys()].filter((f) => !firstField.has(f)).sort();
out(`\n## Ens hele vejen (${clean.length} felter)`);
for (const f of clean) { let n = 0; for (const s of stats.get(f)!.values()) n += s.n; out(`- ${f} (${n} tjek)`); }
// fordelingerne ved op til 8 jævnt fordelte dage
const sample = days.length <= 8 ? days : [...new Set(Array.from({ length: 8 }, (_, i) => days[Math.round((i * (days.length - 1)) / 7)]))];
const fmt = (x: number) => (Math.abs(x) >= 1000 ? Math.round(x).toLocaleString('da-DK') : x.toFixed(2));
out('\n## Fordelinger (gns. vores / oraklet)');
out('felt'.padEnd(54) + sample.map((d) => d.padStart(22)).join(''));
for (const [f, byDay] of [...dists.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (ONLY && !f.includes(ONLY)) continue;
  out(f.padEnd(54) + sample.map((d) => { const s = byDay.get(d); return (s ? `${fmt(s.ours / s.n)}/${fmt(s.theirs / s.n)}` : '-').padStart(22); }).join(''));
}
if (days.length <= 8) {
  out('\n## Afvigelser pr. felt og dag (afvigelser/tjekket)');
  out('felt'.padEnd(54) + days.map((d) => d.padStart(16)).join(''));
  for (const [f, byDay] of [...stats.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (ONLY && !f.includes(ONLY)) continue;
    out(f.padEnd(54) + days.map((d) => { const s = byDay.get(d); return (s ? `${s.bad}/${s.n}` : '-').padStart(16); }).join(''));
  }
}
if (process.env.REPORT) writeFileSync(process.env.REPORT, lines.join('\n') + '\n');
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify({ days, first: [...firstField.values()].sort(byDate), stats: Object.fromEntries([...stats].map(([f, m]) => [f, Object.fromEntries(m)])), dists: Object.fromEntries([...dists].map(([f, m]) => [f, Object.fromEntries(m)])) }));
console.log(`\n${((Date.now() - t0) / 1000).toFixed(0)} s`);
