// Originalens bestyrelse og managerjob (cmBoard.ts) i vores spil: spiltilstanden → originalens felter (BoardEnv) og tilbage (manageren skifter,
// nyhederne til mennesket, Board-skærmens tal). En CM-database i ægte tilstand med spilstartens bestyrelse (cmBoardOn = cmBoardLogic: den originale database og nye 2026/27-spil) – ellers board.ts.
//
// Tidspunkterne som i originalen: spilstarten 0x68f130 (på databasens dato 1/1, før forkørslen – vi har ingen forkørsel, så "i dag" er 1/1 og
// spillets start [0xdd6ec8] = spillets første dag), hver dag 0x68f9c0 efter dagens kampe (sim.ts newDay kalder cmBoardDaily for dagen, der lige er
// spillet), efter hver kamp 0x6951e0 (efter tabellen – sim.ts applyMatchResult), sæsonens opsætning League::set_club_season_expectations 0x68aa80
// (season.ts, for hver liga) og menneskets overtagelse 0x826f20/0x69ebc0.
//
// Spillets data, der ikke findes som i originalen (inddata – *afvigelser*, ikke regler):
//   - personerne: world-filens stab med ikke-spillerpost (2.451 i 3.9.60 – originalen har ~8.900 i hukommelsen med England valgt) + menneskene;
//     spillets genererede stab har ingen ikke-spillerpost (np = NULL i originalens forstand) og er ikke kandidater
//   - Comp_Stats' +0x72 = den forudsagte placering (0x68a850/0x4c0720 ved ligaens opsætning – predictLeagues), +0x73/+0x74/+0x75 = placeringen
//     og bedst/dårligst mulige slutplacering, som 0x684cd0 skriver dem efter dagens ligakampe (updateTablePositions); stimerne af tabellens form
//   - UefaSeeding: spillets CL_SPOTS/UEFA_SPOTS efter landets rang; ingen europæisk Comp_Stats-post (bit 0x400 sættes ikke)
//   - transferbudgettet 0x598800 = Club.transferBudget (£), formuebåndet 0x5986b0 af saldoen (£)
//   - 0x844780 (viljen) – se interestOf
import { tableStatusHooks } from './cmTableHooks';
import type { Club, Fixture, GameState, MatchReport, Staff } from './types';
import { squad, addNews } from './state';
import { cmActive, cmBoardLogic, cmLogic, cmRand, clubRepMem, postHooks } from './cmPlayerData';
import { cmGbp } from './cmMoney';
import { personalFill_535a80, personality_535ea4 } from './cmStaffInit';
import { financeStatus } from './cmSquadPlan';
import { cmClubPredictValue, cmSquadPlanNewManager } from './cmSquadPlanGame';
import { clubSeason } from './cmFitness';
import { CL_SPOTS, UEFA_SPOTS, UEFA_NATIONS, rulesFor } from './leagues';
import { leagueRows, nationRanking } from './competitions';
import { ageOn, daysBetween } from './dates';
import { careerEnd, careerStart } from './careers';
import { recordStaffMove } from './staffMoves';
import { fixtureCodesOf } from './engine/grid/gameInputs';
import {
  type BoardEnv, type BoardNews, type BoardRec, type CmBoardState, type CmDate, type LeagueInfo, type MatchIn, type Person, type StatsEntry,
  HUMAN0, addVacancy, after, afterMatch, currentRun, daysSince, leagueBand, s8, applyForJob, boardDaily, cmToIso, confidenceBand, initRecords, initStaffRep, humanAppointRep, isoToCm, resetForNewManager,
  setSeasonExpectations, s16, weeklyUpdate, managerRepAfterMatch, newRec, reviewNational, removeClubManager,
} from './cmBoard';
import type { CMWorld } from './data/cm0102';
import { appointText, boardCmText, confidenceText, type BoardCmDesc, type ConfidenceIn } from './cmBoardText';
import { boardRequestAvailable, issueUltimatum, ultimatumOffered, type UltimatumIn } from './cmBoardUltimatum';
import { leagueClash, projectPositions, staffInterest, type InterestEnv } from './cmBoardInterest';
import { msvcQsort } from './engine/grid/subs';
import { registerPrerun } from './cmPrerun';
import { personKey } from './cmRelations';
import { cmClubEuro } from './cmFitnessGame';
import { cmFineReset, cmFineSeasonHalve } from './cmFine';
import { clubNewsToMe, cmForeign } from './cmNewsScope';
import { natClub, natClubId, natOfClub, resetNationalManagers } from './cmVirtual';
import { DEMONYM } from '../ui/demonyms';
import { natCompHook } from './hooks';
import { holidayHooks, holidayOpt } from './cmHoliday';
import { NO_CARRY, registerCarry } from './carry';
import { natPlayers } from './cmN88';
export { natPlayers };
import { FRIENDLY_COMP } from './cmFriendlyOffers';
import COMP_SHORT from './data/cmCompShort.json';

/** turneringens korte navn (club_comp.dat +0x38; scripts/build-cm-comp-short.py) – ellers det lange */
const compShort = (n: string) => (COMP_SHORT as Record<string, string>)[n] ?? n;

/** club_comp.dat "Friendly" (Friendly +4 – 0x5c6710) */
const CC_FRIENDLY = 72;

/** € → £ for klubbens penge (cmMoney.ts: den originale database 0,86; 2026/27 ligaens faktor) */
const gbpOf = (g: GameState, c: number) => cmGbp(g, c);
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** en CM-database i ægte tilstand med spilstartens bestyrelse 0x68f130 (cmBoardLogic – den originale database og nye 2026/27-spil), ikke draft */
export function cmBoardOn(g: GameState): boolean {
  return cmBoardLogic(g);
}

// ---------------------------------------------------------------- personerne

const JOB: Record<string, number> = { manager: 5, assistant: 6, coach: 8, scout: 9, physio: 10 };

/** landstræneren (A-holdets manager) pr. nation og omvendt – bestyrelsens nm (sat ved spilstarten, ændret af udnævnelser og afgange) */
function natOfStaff(g: GameState, id: number): number {
  const nm = g.cmBoard?.nm;
  if (!nm) return -1;
  // (hukommelse, 22/11) omvendt opslag gemt pr. nm-objekt og ændring (nmChanged ved hver skrivning herunder) – før en for…in med nye nøglestrenge
  // pr. kald (~1,7 GB affald i ønskelisternes stabsvurdering ved spilstarten). Første nøgle i for…in-rækkefølgen vinder som før.
  let r = NM_REV.get(nm);
  if (!r || r.ver !== nmVer) {
    const rev = new Map<number, number>();
    for (const k in nm) if (!rev.has(nm[k])) rev.set(nm[k], +k);
    NM_REV.set(nm, (r = { ver: nmVer, rev }));
  }
  return r.rev.get(id) ?? -1;
}
const NM_REV = new WeakMap<object, { ver: number; rev: Map<number, number> }>();
let nmVer = 0;
/** landstrænernes nm er ændret (natOfStaff's omvendte opslag regnes igen) */
const nmChanged = () => { nmVer++; };
/** staff +0x3d uden klub. Ledige fra spilstarten (databasens job `cmDbJob`) og personer, der har forladt en klub (keepJobCode): 0x68f130 2a beholder jobkoden; kun +0x3d = 0 får
 *  landsholdsjobbet +0x28 – og ikke landstrænerens (5/12: `continue` før omskrivningen) eller 11; 13/15 uden spillerpost → 8 (oraklets gemte
 *  spil 15/7-2001: Bruce Arena/Louis van Gaal +0x3d 0, +0x28 5; Billy Davies 5, Kit Carson 9). Ellers (ældre spil, stab fra en klub) som før:
 *  landsholdsjobbet, medmindre det er 11. */
/** 0x690890 remove_staff_from_club: jobkoden +0x3d bliver stående, når personen forlader klubben (kun ikke-spillerposten fra databasen) */
export const keepJobCode = (s: Staff) => { if (s.cmNp && !s.cmExtra) s.cmDbJob = JOB[s.role] ?? 8; };
const clublessJob = (s: Staff) => {
  if (s.cmDbJob !== undefined && !s.cmExtra) {
    if (s.cmDbJob) return s.cmDbJob;
    const j = s.cmNat && s.cmNat[0] >= 0 ? s.cmNat[1] : 0;
    return j === 5 || j === 12 || j === 11 ? 0 : j === 13 || j === 15 ? 8 : j;
  }
  return s.cmNat && s.cmNat[1] !== 11 ? s.cmNat[1] : 0;
};

/** (hukommelse, 22/11) personen som klasse: accessorerne ligger på prototypen – før fik hver person ~10 nye funktioner (objektliteral med
 *  get/set), og boardEnv bygger ≈33.000 personer pr. dag i forkørslen (~2,6 GB affald ved spilstarten; Safari på iPhone). Samme felter og værdier. */
class StaffPerson implements Person {
  readonly human = false; readonly np = true;
  id: number; nation: number; age: number; det: number; pres: number; prof: number; temper: number; amb: number; b22: number; ca: number; pa: number;
  rep: [number, number, number];
  private readonly g: GameState; private readonly s: Staff; private readonly hid: number[]; private readonly npRow: number[];
  constructor(g: GameState, s: Staff, today: CmDate) {
    const hid = s.cmHid ?? [];
    this.g = g; this.s = s; this.hid = hid; this.npRow = s.cmNp!;
    this.id = s.id; this.nation = s.nation ?? -1;
    this.age = s.dob ? ageOn(s.dob, cmToIso(today)) : 45;
    this.det = hid[2] ?? 10; this.pres = hid[4] ?? 10; this.prof = hid[5] ?? 10; this.temper = hid[7] ?? 10; this.amb = hid[1] ?? 10; this.b22 = hid[8] ?? 0;
    this.ca = s.ca ?? 0; this.pa = s.cmPa ?? 0;
    this.rep = (s.cmRep ??= [1, 1, 1]);
  }
  get club() { return this.s.club; } set club(v: number) { this.s.club = v; }
  get job() { return this.s.club ? JOB[this.s.role] ?? 8 : clublessJob(this.s); } set job(_v: number) { /* rollen sættes af setManager */ }
  get nat() { const d = this.g.cmBoard?.nd?.[this.s.id]; if (d) return natClub(d[0]); const n = natOfStaff(this.g, this.s.id); return n >= 0 ? natClub(n) : 0; }
  get natJob() { return this.g.cmBoard?.nd?.[this.s.id]?.[1] ?? this.g.cmBoard?.nj?.[this.s.id] ?? 0; }
  get joined() { return isoToCm(this.s.cmJoined || '1990-01-01'); } set joined(d: CmDate) { this.s.cmJoined = cmToIso(d); }
  get b59() { return this.hid[3] ?? 10; } set b59(v: number) { this.hid[3] = v; }
  at(off: number) { return this.npRow[off - 0x0e] ?? 0; }
}
function staffPerson(g: GameState, s: Staff, today: CmDate): Person {
  return new StaffPerson(g, s, today);
}
interface HumanRef { get: () => { userClub: number; manager: GameState['manager'] }; k: number }
function humanPerson(g: GameState, h: HumanRef): Person {
  const m = () => h.get().manager;
  const rep = (m().cmRep ??= [1, 1, 1]);
  return {
    id: HUMAN0 + h.k, human: true, np: true, nation: m().nation,
    get club() { return h.get().userClub; }, set club(_v: number) { /* */ },
    get job() { return h.get().userClub ? 5 : 0; }, set job(_v: number) { /* */ },
    get nat() { const n = m().national?.nation; return n !== undefined ? natClub(n) : 0; },
    get natJob() { return m().national ? 5 : 0; },
    get joined() { return isoToCm(m().cmJoined || g.date); }, set joined(d: CmDate) { m().cmJoined = cmToIso(d); },
    age: 40,
    get b59() { return m().cmB59 ?? 20; }, set b59(v: number) { m().cmB59 = v; },
    det: 10, pres: 10, prof: 10, temper: 10, amb: 10, b22: 0, ca: 0, pa: 0, at: () => 0, rep,
  };
}
function humanRefs(g: GameState): HumanRef[] {
  if (!g.humans?.length) return [{ get: () => ({ userClub: g.userClub, manager: g.manager }), k: 0 }];
  return g.humans.map((h, k) => ({ get: () => (h.pid === g.active ? { userClub: g.userClub, manager: g.manager } : { userClub: h.userClub, manager: h.manager }), k }));
}

// ---------------------------------------------------------------- turneringstabellen (Comp_Stats)

function leagueOf(g: GameState, c: number): string | null {
  const club = g.clubs[c];
  if (!club) return null;
  const comp = g.comps[club.league];
  return comp && comp.type === 'league' && !g.leagues[club.league]?.hidden ? club.league : null;
}
const compNum = (lid: string) => { const m = /^CM(\d+)$/.exec(lid); return m ? +m[1] : -1; };

function entryOf(g: GameState, c: number, today: CmDate): StatsEntry | null {
  const lid = leagueOf(g, c);
  if (!lid) return null;
  const comp = g.comps[lid];
  const row = comp.table.find((r) => r.club === c);
  if (!row) return null;
  const tr = g.cmBoard?.tab?.[c];
  const pos = g.cmBoard?.pp?.[c] ?? 0;
  const form = row.form ?? '';
  const trail = (pred: (ch: string) => boolean) => { let n = 0; for (let i = form.length - 1; i >= 0 && pred(form[i]); i--) n++; return n; };
  const last5 = form.slice(-5);
  let pts = 0, n = 0;
  for (const ch of last5) { if (ch === 'W') { pts += 3; n++; } else if (ch === 'D') { pts += 1; n++; } else if (ch === 'L') n++; }
  // +0x73/+0x74/+0x75: placeringen og bedst/dårligst mulige slutplacering, som 0x684cd0 sidst skrev dem (vt+0x68 – dagen med ligaresultater,
  // efter kampene); før første opdatering 0/0/0
  const ls = g.cmBoard?.lt?.[c];
  const [cur, best, worst] = ls ? [ls[3], ls[4], ls[5]] : [0, 0, 0];
  return {
    pos: pos > 0 ? pos : 0, p73: cur, p74: best, p75: worst, played: row.p,
    winRun: trail((ch) => ch === 'W'), lossRun: trail((ch) => ch === 'L'), noWinRun: trail((ch) => ch !== 'W'), unbeatenRun: trail((ch) => ch !== 'L'),
    lastDays: tr?.[2] !== undefined ? dayNum(cmToIso(today)) - tr[2] : 999, formPts: pts, formN: n, get projected() { return projectedOf(g, lid, c) ?? best; },
  };
}

/** 0x4ae300's første placering (o1 = den midlertidige posts +0x74) af 0x68ac40 – cmBoardInterest.ts projectPositions */
const ENG_PLAYOFF: Record<string, [number, number]> = { 'English First Division': [3, 6], 'English Second Division': [3, 6], 'English Third Division': [4, 7] };
function projectedOf(g: GameState, lid: string, c: number): number | null {
  const comp = g.comps[lid];
  const rules = g.customRules?.[lid] ?? rulesFor(lid, comp.clubs.length);
  const rows = leagueRows(comp).map((r) => ({ club: r.club, games: r.p, pts: r.pts, rep: clubRepMem(g, r.club) }));
  const wa7 = (comp.clubs.length - 1) * (rules.rounds ?? 2);
  const pr = projectPositions(rows, c, wa7, 3, ENG_PLAYOFF[g.leagues[lid]?.name ?? ''] ?? null, msvcQsort);
  return pr ? pr[0] : null;
}

// ---------------------------------------------------------------- 0x684cd0 League::update_table_positions
// Kaldt som ligaens vt+0x94 fra den daglige vt+0x14 0x6847c0 (0x684946), når +0xc9 (dagen for seneste ligaresultat, sat af vt+4 0x685d30) er i dag –
// dvs. efter dagens kampe (afterMatch 0x695240 ser forrige kampdags værdier, ugens tillid 0x697c40 dagens). Rækkerne i tabellens orden
// (0x6827d0): +0x11 kampe, +0x19 point; a7 = (hold − 1)·+0x3c, c2 = point for en sejr. Ligaens tal (oraklet, England 3.9.60): +0xbe..+0xc1 =
// oprykning/play-off/nedrykningsslutspil/nedrykning (PL 0/0/0/3, First 2/4/0/3, Second 2/4/0/4, Third 3/4/0/1), +0xd9 = 3, +0xe6 = 0.
// vt+0x68 (Comp_Stats): England First/Second 0x573260 (bedst ∈ [3,6] → 3, dårligst ∈ [3,6] → 6), Third 0x578660 ([4,7] → 4/7), Premier 0x48e380
// (uændret); andre ligaklassers vt+0x68 (~120, play-off-strukturer) er ikke afkodet – de skrives uændret.
const VT68: Record<string, [number, number]> ={ 'English First Division': [3, 6], 'English Second Division': [3, 6], 'English Third Division': [4, 7] };
export function updateTablePositions(g: GameState, st: CmBoardState, lid: string): void {
  const comp = g.comps[lid], L = leagueInfo(g, lid);
  if (!comp || !L) return;
  const rows = leagueRows(comp), n = rows.length;
  if (!n) return;
  const rules = g.customRules?.[lid] ?? rulesFor(lid, comp.clubs.length);
  const a7 = s16((n - 1) * (rules.rounds ?? 2)), c2 = 3, e6 = 0, d9 = 3;
  const lt = (st.lt ??= {});
  const R = rows.map((r) => (lt[r.club] ??= [1, n, 0xff, 0, 0, 0]));
  const G = rows.map((r) => s8(r.p)), P = rows.map((r) => s16(r.pts));
  const cnt = [L.promo, L.playoff, 0, L.relegation].map((x) => s8(x));   // +0xbe..+0xc1 (lokal kopi, tælles ned)
  const A: number[] = new Array(n).fill(0xff);
  let l13 = -1;
  if (d9 & 1) for (let i = 0; i < n; i++) { const s = R[i][2]; if (s !== 0xfe && s !== 0xfc && s !== 3) { l13 = i; break; } }
  // kategorierne pr. plads: 0/1 fra toppen (oprykning, play-off), 3/2 fra bunden (nedrykning, nedrykningsslutspil) – rækker med status springes over
  let di = 0;
  for (let al = 0; di < n && al <= 1; al++) {
    while (cnt[al] !== 0 && di < n) { const s = R[di][2]; if (s !== 0xfe && s !== 0xfc && s !== 3) { A[di] = al; cnt[al]--; } di++; }
  }
  di = n - 1;
  for (let al = 3; di >= 0 && al >= 2; al--) {
    while (cnt[al] !== 0 && di >= 0) { const s = R[di][2]; if (s !== 0 && s !== 1 && s !== 5) { A[di] = al; cnt[al]--; } di--; }
  }
  // bedst/dårligst mulige placering (uden målforskel; uafgjort på point tæller som indhentet) – afgjorte rækker (+0x39 = +0x3a) står
  for (let i = 0; i < n; i++) {
    const r = R[i];
    if (r[0] === r[1]) continue;
    const gi = G[i];
    let b = i + 1;
    const mi = (a7 - gi) * c2 + P[i];
    for (let j = 0; j < i; j++) {
      const gj = G[j];
      if (gi < a7 && gj < a7) { if (mi >= P[j]) b--; }
      else if (gj < a7) { if (mi === P[j]) b--; }
      else if (gi < a7) { if (mi >= P[j]) b--; }
      else if (mi === P[j] && e6) b--;
    }
    let w = i + 1;
    for (let k = i + 1; k < n; k++) {
      const gk = G[k], mk = (a7 - gk) * c2 + P[k];
      if (gi < a7 && gk < a7) { if (mk >= P[i]) w++; }
      else if (gk < a7) { if (mk >= P[i]) w++; }
      else if (gi < a7) { if (mk === P[i]) w++; }
      else if (mk === P[k] && e6) w++;
    }
    r[0] = b & 0xff; r[1] = w & 0xff;
  }
  // status (+0x37; nyhederne vt+0x40 og 0x4cd030 ved nedrykning er ikke porteret) og vt+0x68
  const vt = VT68[g.leagues[lid]?.name ?? ''];
  for (let i = 0; i < n; i++) {
    const r = R[i], b = r[0], w = r[1];
    const s0 = r[2];
    let s = r[2];
    if (w === l13 + 1) { if (s !== 3 && s !== 0xfe && s !== 0xfc && s !== 5) s = 5; }
    else {
      const c = A[w - 1] ?? 0xff;
      if (c === 0) {
        if (s === 0xff || s === 1) { if (d9 & 2) s = 0; else if (d9 & 4) s = 7; else if (d9 & 8) s = 6; }
      } else if (c === 1) { if (s === 0xff) s = 1; }
      else {
        const cb = A[b - 1] ?? 0xff;
        if (cb === 3) { if (s === 0xff || s === 2 || s === 0xfc) s = 3; }
        else if (cb === 2) { if (s === 0xff || s === 0xfe) s = 2; }
      }
    }
    if ((d9 & 0x20) && b > s8(L.promo) + 0 && w <= n - s8(L.relegation) - 0) {
      let all = true;
      for (let a = b - 1; a < w; a++) if (A[a] !== 0xff) all = false;
      if (all && s === 0xff) s = 0xfe;
    }
    r[2] = s;
    // 0x685291/0x685343: den nye status → vt+0x40 0x686670 (nyheden – ikke porteret) → ligaens vt+0x44 (England 0x576c50, ellers 0x686940; ligaens
    // +0x44 = 0xff): 5 → add_league_champions_record, 0 → add_promotion_record, 3 → add_relegation_record (cmMedia.ts)
    if (s !== s0 && (s === 5 || s === 0 || s === 3) && g.cmRecSt?.[lid]) tableStatusHooks.on?.(g, lid, rows[i].club, s);
    let mb = b, mw = w;
    if (vt) { if (mb >= vt[0] && mb <= vt[1]) mb = vt[0]; if (mw >= vt[0] && mw <= vt[1]) mw = vt[1]; }
    r[3] = i + 1; r[4] = mb; r[5] = mw;
  }
}

/** League::set_predicted_positions 0x68a850 (ligaens opsætning – spilstarten og hver ny sæson): tabelrækkernes klubber (+0xb1-rækkefølgen)
 *  sorteres med 0x4c08f0 – nøglen 0x4c0720 (cmSquadPlanGame.ts cmClubPredictValue), byttesortering faldende (i < k: nøgle[i] < nøgle[k] → byt) –
 *  og Comp_Stats +0x72 = pladsen (0x4a2540). Oraklet 14/7-01 (frø 1): 56/92 engelske klubber på samme plads, gns. afvigelse 0,54 plads. */
function predictLeagues(g: GameState, st: CmBoardState, money?: (c: Club) => number, only?: Set<string>): void {
  const pp = (st.pp ??= {});
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league' || g.leagues[comp.id]?.hidden || (only && !only.has(comp.id))) continue;
    const cl = comp.table.length ? comp.table.map((r) => r.club) : comp.clubs;
    const a = cl.filter((c) => g.clubs[c]).map((c) => {
      const club = g.clubs[c];
      return { c, v: cmClubPredictValue(g, c, money ? money(club) : Math.round(club.balance * cmGbp(g, c)), 0) };
    });
    for (let i = 0; i < a.length - 1; i++) for (let k = i + 1; k < a.length; k++) if (a[i].v < a[k].v) { const t = a[i]; a[i] = a[k]; a[k] = t; }
    a.forEach((x, i) => { pp[x.c] = i + 1; });
  }
}

/** 0x48f150 Comp::is_club_still_in_contention for ligaen (stats-rækken: +0x74 = +0x75 ≠ 0 → nej; tabelrækken: status 0xfe/7/6/5 → nej, ellers
 *  +0x39 ≠ +0x3a); venskabskampe (0x5c6710) og B-/reserveturneringer (0x7e6f20) → nej; andre turneringer → ja (klubben findes i en runde) */
function inContention(g: GameState, f: Fixture, c: number): boolean {
  if (f.comp === FRIENDLY_COMP) return false;
  const comp = g.comps[f.comp];
  if (!comp || comp.type !== 'league') return true;
  const r = g.cmBoard?.lt?.[c];
  if (!r) return true;                                                   // ny række [1, hold]
  if (r[4] === r[5] && r[4] !== 0) return false;
  if (r[2] === 0xfe || r[2] === 7 || r[2] === 6 || r[2] === 5) return false;
  return r[0] !== r[1];
}

/** +0xbe oprykning, +0xbf play-off, +0xc1 nedrykning af de engelske ligaklasser (oraklet 3.9.60: Premier 0x48e380-klassen 0/0/3, First/Second
 *  0x576780 2/4/3 og 2/4/4, Third 0x5780c0 3/4/1) */
const ENG_ZONES: Record<string, [number, number, number]> = {
  'English Premier Division': [0, 0, 3], 'English First Division': [2, 4, 3], 'English Second Division': [2, 4, 4], 'English Third Division': [3, 4, 1],
};
function leagueInfo(g: GameState, lid: string): LeagueInfo | null {
  const comp = g.comps[lid];
  if (!comp) return null;
  const rules = g.customRules?.[lid] ?? rulesFor(lid, comp.clubs.length);
  const lp = compNum(lid);
  // de engelske ligaklassers egne tal (spil med play-off'en: cmCalendar.ts cmPlayoffRules; ældre spil tæller vinderen med i rules.promoted)
  const z = ENG_ZONES[g.leagues[lid]?.name ?? ''];
  if (z) return { teams: comp.clubs.length, autoPromo: z[0] > 0, promo: z[0], playoff: z[1], relegation: z[2], rep: lp >= 0 ? g.cmCompRep?.[lp] ?? 0 : 0 };
  const promo = rules.promoted ?? 0;
  const playoff = rules.playoff?.seeds.filter(([l]) => l === lid).length ?? 0;
  return { teams: comp.clubs.length, autoPromo: promo > 0, promo, playoff, relegation: rules.relegated ?? tableStatusHooks.relegated?.(g, lid) ?? 0, rep: lp >= 0 ? g.cmCompRep?.[lp] ?? 0 : 0 };
}

// ---------------------------------------------------------------- miljøet

/** midlertidig manager (0x6a4f80: "som om han havde jobbet") */
const tempManager = new Map<number, Person | null>();
// (19/11) nulstilles ved et nyt spil (carry.ts) – ellers lækker den fra spillet før i samme fane/proces
registerCarry('cmBoardGame.caches', () => NO_CARRY, () => {}, () => { tempManager.clear(); });

/** `lazy` (ønskelisternes og kontraktportenes kortlivede hukommelser): rangeringen og klublisten regnes først, når de bruges */
/** Personlisten (alle med ikke-spillerpost + menneskene) bygges ellers forfra i hvert boardEnv – i ønskelisternes klubløkke ét pr. klub (≈33.000 personer
 *  × ~3.500 klubber ved spilstarten: ~40 s og ~1,5 GB affald – Facebook-appens browser på iPhone dræbte fanen, 21/11). Personerne er levende
 *  (getters/setters på staben) bortset fra dagens øjebliksbilleder (alder, CA/PA, skjulte egenskaber, nation), som ingen ændrer inden for løkken. */
export interface PersonsScope { g: GameState; day: number; year: number; persons: Person[] | null; byId: Map<number, Person>;
  /** andre modulers mellemregninger for samme løkke (fx cmStaffMove.ts' kandidater og spejdere) */
  memo: Record<string, unknown> }
let personsScope: PersonsScope | null = null;
/** den åbne løkkes fælles mellemlager for spillet (null uden for withSharedPersons) */
export const sharedScope = (g: GameState): PersonsScope | null => (personsScope && personsScope.g === g && ((d) => d.day === personsScope!.day && d.year === personsScope!.year)(isoToCm(g.date)) ? personsScope : null);
export function withSharedPersons<T>(g: GameState, fn: () => T): T {
  const prev = personsScope, d = isoToCm(g.date);
  personsScope = { g, day: d.day, year: d.year, persons: null, byId: new Map(), memo: {} };
  try { return fn(); } finally { personsScope = prev; }
}
export function boardEnv(g: GameState, todayIso = g.date, startIso?: string, lazy = false): BoardEnv {
  const today = isoToCm(todayIso);
  const gameStart = isoToCm(startIso ?? g.cmBoardStart ?? g.date);
  let persons: Person[] | null = null;
  let byId = new Map<number, Person>();
  const allPersons = () => {
    if (persons) return persons;
    // (hukommelse/hastighed, 21/11) inden for én klubløkke (withSharedPersons) deles personlisten af alle miljøerne – samme dag, samme stab
    const sh = personsScope && personsScope.g === g && personsScope.day === today.day && personsScope.year === today.year ? personsScope : null;
    if (sh?.persons) { byId = sh.byId; return (persons = sh.persons); }
    if (sh) byId = sh.byId;
    persons = [];
    if (sh) sh.persons = persons;
    // landstrænerne er med, også når de kun er i hukommelsen (cmExtra: uden klub i spillet) – originalens landshold har dem som manager
    const natM = new Set(Object.values(g.cmBoard?.nm ?? {}));
    for (const s of Object.values(g.staff).sort((a, b) => a.id - b.id)) if (s.cmNp && (!s.cmExtra || natM.has(s.id))) { const p = staffPerson(g, s, today); persons.push(p); byId.set(p.id, p); }
    for (const h of humanRefs(g)) { const p = humanPerson(g, h); persons.push(p); byId.set(p.id, p); }
    return persons;
  };
  const personOfStaff = (id: number) => { allPersons(); return byId.get(id) ?? null; };
  const humanOfClub = (c: number) => allPersons().find((p) => p.human && p.club === c) ?? null;
  const humanOfNat = (n: number) => allPersons().find((p) => p.human && p.nat === natClub(n)) ?? null;
  const natRep = (n: number) => g.intl?.info?.[n]?.rep ?? g.cmNationRep?.[n] ?? 0;
  const nationName = (n: number) => g.nations[n]?.name ?? '';
  // (hastighed, runde 14) med `lazy` rangeringen og klublisten først, når de bruges (ønskelisterne bygger et miljø pr. udbudspris)
  let rk: number[] | null = null, cl: number[] | null = null;
  if (!lazy) { rk = nationRanking(); cl = clubList(g); }
  const ranking = () => (rk ??= nationRanking());
  let ie: InterestEnv | null = null;
  const env: BoardEnv = {
    today, gameStart,
    get clubs() { return (cl ??= clubList(g)); },
    clubRep: (c) => { const n = natOfClub(c); return n !== null ? natRep(n) : clubRepMem(g, c); },
    clubNation: (c) => { const n = natOfClub(c); return n !== null ? n : g.clubs[c]?.nation ?? -1; },
    division: (c) => leagueOf(g, c),
    lastDivision: (c) => { if (natOfClub(c) !== null) return null; const ld = g.cmClubStat?.[c]?.[2]; return ld !== undefined && ld > 0 ? `CM${ld}` : leagueOf(g, c); },
    divLevel: (div) => { const n = compNum(div); return n >= 0 ? g.cmCompRep?.[n] ?? 0 : 0; },
    league: (div) => leagueInfo(g, div),
    canBeManaged: (c) => { const n = natOfClub(c); return n !== null ? natPlayers(g, n) > 150 : !!leagueOf(g, c) && g.activeNations.includes(g.clubs[c].nation); },
    activeLeague: (c) => !!leagueOf(g, c) && g.activeNations.includes(g.clubs[c].nation),
    entry: (c) => entryOf(g, c, today),
    euroEntry: () => null,
    nationPlaces: (c) => {
      if (natOfClub(c) !== null) return [1, 1];
      const n = g.clubs[c]?.nation;
      if (n === undefined || !UEFA_NATIONS.has(nationName(n))) return [1, 1];
      const r = ranking().indexOf(n);
      return r < 0 ? [1, 1] : [CL_SPOTS[r] ?? 1, UEFA_SPOTS[r] ?? 1];
    },
    isAustralia: (c) => nationName(g.clubs[c]?.nation ?? -1) === 'Australia',
    wealthBand: (c) => natOfClub(c) !== null ? 0 : financeStatus(Math.round((g.clubs[c]?.balance ?? 0) * gbpOf(g, c)), clubRepMem(g, c)),
    transferBudget: (c) => Math.round((g.clubs[c]?.transferBudget ?? 0) * gbpOf(g, c)),
    balance: (c) => Math.round((g.clubs[c]?.balance ?? 0) * gbpOf(g, c)),
    chair: (c) => { const x = g.cmChair?.[c]; return x ? { b16: x[0], b1d: x[1], amb: x[2], nation: x[3] } : null; },
    manager: (c) => {
      if (tempManager.has(c)) return tempManager.get(c)!;
      const nn = natOfClub(c);
      if (nn !== null) { const h = humanOfNat(nn); if (h) return h; const id = g.cmBoard?.nm?.[nn]; const s = id !== undefined ? g.staff[id] : undefined; return s ? (s.cmNp ? personOfStaff(s.id) : noNp(s)) : null; }
      const m = g.clubs[c]?.manager ?? 0;
      if (m === -1) return humanOfClub(c);
      if (m > 0) { const s = g.staff[m]; return s?.cmNp ? personOfStaff(m) : s ? noNp(s) : null; }
      return null;
    },
    assistant: (c) => { const s = Object.values(g.staff).find((x) => x.club === c && x.role === 'assistant'); return s ? (s.cmNp ? personOfStaff(s.id) : noNp(s)) : null; },
    firstCoach: (c) => { const s = Object.values(g.staff).find((x) => x.club === c && x.role === 'coach'); return s ? (s.cmNp ? personOfStaff(s.id) : noNp(s)) : null; },
    persons: allPersons,
    person: (id) => { allPersons(); return byId.get(id) ?? (g.staff[id] ? noNp(g.staff[id]) : null); },
    nat75: (n) => g.cmNationBoard?.[n]?.[0] ?? 0,
    nat85: (n) => g.cmNationBoard?.[n]?.[1] ?? 0,
    nat7e: (n) => g.cmNation7e?.[n] ?? 0,
    isHumanClub: (c) => { const n = natOfClub(c); return n !== null ? !!humanOfNat(n) : g.clubs[c]?.manager === -1; },
    dismissedBy: (p, c) => {
      const d = p.human && p.id === HUMAN0 ? g.manager.cmDismissed?.[c] : undefined;
      return !!d && daysBetween(d, g.date) < 180;
    },
    humanOnHolidaySearching: (p) => p.human && !!humanRefs(g)[p.id - HUMAN0]?.get().manager.holiday?.applyJobs,
    fluency: (p, c) => {
      const cl = g.nations[natOfClub(c) ?? g.clubs[c]?.nation ?? -1]?.lang?.[0], pl = g.nations[p.nation]?.lang?.[0];
      return cl !== undefined && cl === pl ? 10 : 0;
    },
    foreign: (p, n) => cmForeign(g, p.nation, n),
    interest: (p, c) => (interestHook.fn ? interestHook.fn(g, p, c) : staffInterest((ie ??= interestEnv(g, env)), p, c, 5)),
    retiring: () => false,
    inSeason: (c) => natOfClub(c) === null && clubSeason(g.clubs[c]?.nation, dayNum(todayIso))[0],
    nextFixture: (c, days) => {
      if (natOfClub(c) !== null) return null;
      const from = dayNum(todayIso), to = from + days;
      const f = Object.values(g.fixtures).filter((x) => (x.home === c || x.away === c) && !x.result && dayNum(x.date) > from && dayNum(x.date) <= to)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      return f ? { opp: f.home === c ? f.away : f.home, hasComp: !!g.comps[f.comp] } : null;
    },
    underOffer: () => false,
    inEurope: (c) => c > 0 && Object.values(g.comps).some((x) => x.type === 'continental' && x.clubs.includes(c) && !/intertoto/i.test(x.name)),
    inEuropeAny: (c) => c > 0 && Object.values(g.comps).some((x) => x.type === 'continental' && x.clubs.includes(c)),
    pro: (c) => (g.cmClubStat?.[c]?.[0] ?? 1) === 1,
    lowNation: (c) => ['Wales', 'Republic Of Ireland', 'Ireland', 'Northern Ireland'].includes(nationName(g.clubs[c]?.nation ?? -1)),
    setManager: (c, p, old) => setManagerGame(g, env, c, p, old),
    // 0x84abe0 → 0x83cb40 med +4 = 2 (computerklubber, når trupplanen er startet – ikke i forkørslen før 0x83a1b0)
    newManagerPlan: (c) => { if (g.clubs[c] && g.clubs[c].manager !== -1 && g.cmPlan?.[c]) cmSquadPlanNewManager(g, c); },
    news: (n) => boardNews(g, env, n),
    isNat: (c) => natOfClub(c) !== null,
    natComp: (c) => { const n = natOfClub(c); return n !== null ? natCompHook.fn?.(g, n) ?? null : null; },
    natPlayers: (c) => { const n = natOfClub(c); return n !== null ? natPlayers(g, n) : 0; },
  };
  return env;
}
/** 0x68f9c0's klubløkke: klubberne (id-rækkefølgen), så A-landsholdene (klub-id'erne efter klubberne) for lande med verdensdel (nation +0x71) */
function clubList(g: GameState): number[] {
  const out = Object.keys(g.clubs).map(Number).sort((a, b) => a - b);
  if (g.cmBoard?.nm) for (let n = 0; n < g.nations.length; n++) if ((g.cmNationCont?.[n] ?? -1) >= 0) out.push(natClub(n));
  return out;
}

/** spillets genererede stab: ingen ikke-spillerpost (np = NULL) */
function noNp(s: Staff): Person {
  return { id: s.id, human: false, np: false, nation: s.nation, club: s.club, job: s.club ? JOB[s.role] ?? 8 : clublessJob(s), joined: isoToCm(s.cmJoined || '1990-01-01'), age: 45,
    b59: 10, det: 10, pres: 10, prof: 10, temper: 10, amb: 10, b22: 0, ca: 0, pa: 0, at: () => 0, rep: [1, 1, 1] };
}

/** 0x844780 staff_interest_in_job_at_club(s, c, 0, 5, NULL) – cmBoardInterest.ts; krogen overstyrer (målinger) */
export const interestHook: { fn?: (g: GameState, p: Person, c: number) => number } = {};

const idCache = new WeakMap<GameState, InterestEnv['ids']>();
/** viljens inddata af spillets data (se filhovedet i cmBoardInterest.ts) */
function interestEnv(g: GameState, b: BoardEnv): InterestEnv {
  const st = g.cmBoard as unknown as CmBoardState | undefined;
  const nIdx = (name: string) => g.nations.findIndex((n) => n.name === name);
  const cIdx = (name: string) => { const c = Object.values(g.clubs).find((x) => x.name === name); return c ? c.id : -1; };
  let ids = idCache.get(g);
  if (!ids) {
    ids = { europe: g.cmEurope ?? -1, interToto: 330, lowerDiv: g.cmLowerDiv ?? -1, celtic: cIdx('Glasgow Celtic'), rangers: cIdx('Glasgow Rangers'),
      italy: nIdx('Italy'), croatia: nIdx('Croatia'), yugoslavia: nIdx('Yugoslavia') };
    idCache.set(g, ids);
  }
  // (24/11) [0x9cf764] "A Lower Division" og "Europe" læses levende: cmFinanceNewGame sætter g.cmLowerDiv EFTER cmBoardInit i createGame, så et
  // cachet −1 gav et nyt spil en anden vilje (0x844780 8b: klubber i Lower Division ×0,1) end det samme spil gemt og indlæst (357)
  ids.lowerDiv = g.cmLowerDiv ?? -1; ids.europe = g.cmEurope ?? -1;
  const staffOf = (p: Person) => (p.human ? null : g.staff[p.id] ?? null);
  return {
    b,
    rec: (c) => (st ? st.rec[c] ?? newRec() : null),
    name: (p) => { const s = staffOf(p); return s ? `${s.first} ${s.last}`.trim() : p.human ? g.manager.name : ''; },
    // staff +0x24/+0x28 efter 0x68f130 (landsholdene i bestyrelsen): kun landstrænerne beholder landsholdet, jobbet 0 til en udnævnelse sætter 5;
    // gamle gemte spil uden landshold i bestyrelsen: databasens værdier
    nat: (p) => {
      // (2026/27) landstrænerne fra databasen (nd – landsholdene er ikke i bestyrelsen): som 0x68f130 2a efterlader dem
      if (g.cmBoard?.nm || g.cmBoard?.nd) return { nc: !!p.nat, nj: p.natJob ?? 0 };
      const x = staffOf(p)?.cmNat; return { nc: !!x && x[0] >= 0, nj: x ? x[1] : 0 };
    },
    rel: (p) => staffOf(p)?.cmRel,
    key: (p) => { const s = staffOf(p); return s ? personKey(s) : -1 - p.id; },
    status: (c) => g.cmClubStat?.[c]?.[0] ?? 1,
    rivals: (c) => (g.cmCrowd?.[c]?.slice(6, 9) ?? []).filter((x) => x >= 0),
    divId: (c) => { const l = g.clubs[c]?.league ?? ''; const m = /^CM(\d+)$/.exec(l); return m ? +m[1] : g.cmFinRaw?.[c]?.[0] ?? -1; },
    compLevel: (id) => g.cmCompRep?.[id] ?? 0,
    i73: (c) => g.cmCrowd?.[c]?.[0] ?? 0,
    city33: (c) => { const d = g.cmCrowd?.[c]; return d && d[3] >= 0 && d[4] >= 0 ? g.cmCity33?.[d[4]] ?? 0 : null; },
    euro: (c) => cmClubEuro(g, c),
    targetRep: (c) => g.cmTargetRep?.[c] ?? 0,
    continent: (n) => (n >= 0 ? g.cmNationCont?.[n] ?? -1 : -1),
    ids,
  };
}

// ---------------------------------------------------------------- skrivere

function setManagerGame(g: GameState, _env: BoardEnv, c: number, p: Person | null, old: number): void {
  if (old === -2) { if (p) tempManager.set(c, p); else tempManager.delete(c); return; }
  const nn = natOfClub(c);
  if (nn !== null) { setNationalManager(g, nn, p, old); return; }
  const club = g.clubs[c];
  if (!club) return;
  if (!p) {
    // afgang: manageren forlader klubben (0x69b790 → 0x690890)
    cmFineReset(g, c);                                                  // 0x69b8f5: 0x5a5960 (Discipline Player-tælleren)
    const m = club.manager;
    if (m === -1) humanLeaves(g, c);
    else if (m > 0) { const s = g.staff[m]; if (s) { careerEnd(s, 'sacked'); keepJobCode(s); s.club = 0; } }
    club.manager = 0;
    club.tactic = null;
    return;
  }
  if (p.human) return;                                                  // mennesket ansættes via acceptJob (0x69ebc0)
  const s = g.staff[p.id];
  if (!s) return;
  const from = g.clubs[s.club];
  if (from && from.manager === s.id) { from.manager = 0; from.tactic = null; }
  if (s.club && s.club !== c) careerEnd(s, 'poached');
  // 0x690368–0x69043f: historikposten art 5 (0x8cb810 – Staff In/Out) for et skifte fra en klub til en anden (ingen af dem landshold, +0x18 = 0)
  if (old > 0 && old === s.club && natOfClub(old) === null && g.clubs[old]) recordStaffMove(s, c, 0, g);
  s.club = c; s.role = 'manager';
  club.manager = s.id; club.tactic = null;
  careerStart(s, c);
}

/** A-landsholdets manager (club +0xcf, staff +0x24/+0x28): afgang (p = null – 0x69b790) eller udnævnelse (0x68f9c0's inline-udnævnelse); `old` =
 *  posten, han forlader (et andet landshold eller – landshold med omdømme > 6000 – klubben: 0x6906fc's standardgren fjerner ham fra klubben) */
function setNationalManager(g: GameState, n: number, p: Person | null, old: number): void {
  const st = stateOf(g);
  st.nm ??= {}; st.nj ??= {};
  if (!p) {
    let human = false;
    forHumans(g, (m) => { if (m.national?.nation === n) { m.national = undefined; human = true; } });
    if (!human) { const id = st.nm[n]; if (id !== undefined) { delete st.nm[n]; delete st.nj[id]; nmChanged(); } }
    resetNationalManagers(g);
    return;
  }
  if (p.human) return;                                                  // mennesket ansættes via cmBoardNationalAnswer (0x69ebc0)
  const s = g.staff[p.id];
  if (!s) return;
  if (old) {
    const on = natOfClub(old);
    if (on !== null) { if (st.nm[on] === s.id) { delete st.nm[on]; nmChanged(); } }
    else {
      const from = g.clubs[old];
      if (from && from.manager === s.id) { from.manager = 0; from.tactic = null; }
      if (s.club === old) { careerEnd(s, 'poached'); s.club = 0; s.role = 'coach'; keepJobCode(s); }   // +0x3d = 8 (np uden spillerpost)
    }
  }
  st.nm[n] = s.id; st.nj[s.id] = 5; nmChanged();
  resetNationalManagers(g);
}
/** alle menneskers ManagerProfile (det aktive og de andre i fællesspil) */
function forHumans(g: GameState, fn: (m: GameState['manager']) => void): void {
  fn(g.manager);
  for (const h of g.humans ?? []) if (h.pid !== g.active && h.manager) fn(h.manager);
}

function humanLeaves(g: GameState, c: number): void {
  const doIt = () => {
    if (g.userClub !== c) return;
    g.manager.sacked++;
    g.manager.sackedBy = [...(g.manager.sackedBy ?? []), c].slice(-10);
    g.userClub = 0; g.tactic = null; g.pendingFixture = null;
  };
  if (!g.humans?.length) doIt();
  else for (const h of g.humans) if (h.userClub === c || (h.pid === g.active && g.userClub === c)) { import('./humans').then(() => undefined); doIt(); }
}

/** nyhedens parametre: teksten nu (som reserve) og `bd` = det, der skal til for at bygge den igen på et andet sprog (common.tsx newsParams) */
function boardParams(d: BoardCmDesc, extra: Record<string, string | number> = {}): Record<string, string | number> {
  const r = boardCmText(d);
  return { club: d.k === 'c' ? d.i.club : 'club' in d ? d.club : '', title: r.title, body: r.body, bd: JSON.stringify(d), ...extra };
}

const EXP_KEY = (f: number) => (f & 0x02 ? 'title' : f & 0x01 ? 'top3' : f & 0x04 ? 'promotion' : f & 0x08 ? 'playoffs' : f & 0x40 ? 'tophalf' : f & 0x30 ? 'survive' : 'mid');

/** landsholdets nation og nationaliteten ("English") til forbundets tekster */
const natAdj = (g: GameState, n: number) => { const nm = g.nations[n]?.name ?? ''; return DEMONYM[nm] ?? nm; };
/** 0x5806d0/0x57c9f0/0x92f680's turneringsnøgle → tekstens navn */
const FA_COMP: Record<number, 'wc' | 'euro' | 'euroq'> = { 404: 'wc', 406: 'euro', 396: 'euroq' };

function boardNews(g: GameState, _env: BoardEnv, n: BoardNews): void {
  if (prerunQuiet) return;                                                     // forkørslen: ingen nyheder (se cmBoardPrerun)
  const clubName = (c: number) => { const nn = natOfClub(c); return nn !== null ? g.nations[nn]?.name ?? '' : g.clubs[c]?.name ?? ''; };
  const mname = (p: Person) => { const s = g.staff[p.id]; return s ? `${s.first} ${s.last}`.trim() : g.manager.name; };
  const mine = (c: number) => c === g.userClub;
  /** menneskets eget landshold (A-holdet) */
  const myNat = (c: number) => { const nn = natOfClub(c); return nn !== null && g.manager.national?.nation === nn ? nn : null; };
  switch (n.t) {
    case 'faExpect': {
      // 0x6a44a0 (0x177e) til landsholdets manager: "Football Association announce expectations"
      const nn = myNat(n.club);
      if (nn === null) return;
      const c = FA_COMP[n.comp] ?? '';
      addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'x', nat: natAdj(g, nn), code: n.code, c, tg: c === 'euroq' ? 'euro' : '' }, { club: clubName(n.club) }) });
      return;
    }
    case 'faReview': {
      // 0x6a5a60 (0x1781): "{nationality} FA performance assessment"
      const nn = myNat(n.club);
      if (nn === null || after(_env.gameStart, _env.today)) return;
      addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'p', nat: natAdj(g, nn), grade: n.grade, c: FA_COMP[n.comp] ?? '' }, { club: clubName(n.club) }) });
      return;
    }
    case 'expect':
      if (mine(n.club)) {
        g.board.expectation = EXP_KEY(n.flags);
        g.board.expectedPos = g.cmBoard!.rec[n.club]?.t2c ?? g.board.expectedPos;
        // 0x6a4a20: kun når spillets start ≤ i dag (menneskets ansættelse 0x826f20 sker på databasens dato før forkørslen → ingen nyhed)
        if (after(_env.gameStart, _env.today)) return;
        const div = _env.division(n.club);
        addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'e', club: clubName(n.club), f: n.flags, ne: !UEFA_NATIONS.has(nationNameOf(g, g.clubs[n.club]?.nation)), ap: !!(div && _env.league(div)?.autoPromo) }),
          link: { kind: 'club', id: n.club } });
      }
      return;
    case 'confidence':
      // 0x6a4c40 / 0x6a4d40: "Board Confidence Update" med 0x690d80 (formandens trupvurdering 0x693850 er ikke porteret)
      if (mine(n.club)) addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'c', i: confidenceIn(g, _env, n.club, n.days) }),
        link: { kind: 'club', id: n.club } });
      // landsholdet: "Football Association Confidence Update" (0x690d80's landsholdsgren)
      else if (myNat(n.club) !== null) addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'c', i: confidenceIn(g, _env, n.club, n.days) }) });
      return;
    case 'jobOffer': {
      // NewsItem::auto_respond 0x784100 (type 0x1774, 0x7841d9–0x78429d): på ferie svarer assistenten straks – uden klub, eller med ferievalg 1
      // ("Apply for manager position at higher reputation clubs") og en klub med mindst samme omdømme (+0x80) som hans egen: ja (felt 1 = 1,
      // appoint_manager_to_club 0x69ebc0); ellers nej (felt 1 = 2, ingen ny ledighed). Udføres efter dagens 0x68f9c0 (holidayJobAnswers).
      if (n.human.id === HUMAN0 && g.manager.holiday) {
        const own = n.human.club;
        holidayJobs.push({ club: n.club, yes: holidayJobYes(holidayOpt(g.manager.holiday, 1), own ? _env.clubRep(own) : null, _env.clubRep(n.club)) });
      }
      // landsholdet (0x6a5120): "The {nationality} Football Association offer you the position of manager." – svaret på International-skærmen
      const on = natOfClub(n.club);
      if (on !== null) {
        if (n.human.id !== HUMAN0 || g.manager.nationalOffer === on) return;
        g.manager.nationalOffer = on;
        addNews({ cat: 'job', key: 'board.cm', params: boardParams({ k: 'o', nat: natAdj(g, on), nation: g.nations[on]?.name ?? '', st: 0 }, { club: clubName(n.club) }) });
        return;
      }
      if (n.human.id === HUMAN0 && !g.jobOffers.includes(n.club)) {
        g.jobOffers.push(n.club);
        addNews({ cat: 'job', key: 'news.jobOffer', params: { club: clubName(n.club) }, link: { kind: 'club', id: n.club } });
      }
      return;
    }
    case 'applyReply':
      // 0x69c6b0: "{klub} acknowledge / dismiss your job application" (nyhed 0x1773, samme dag)
      if (n.human.id === HUMAN0) addNews({ cat: 'job', key: n.dismissed ? 'job.cmDismiss' : 'job.cmAck', params: { club: g.clubs[n.club]?.short ?? clubName(n.club) }, link: { kind: 'club', id: n.club } });
      return;
    case 'departed': {
      // 0x6a1d60 for A-landsholdet: "{nation} manager X sacked" / "X resigns as manager of {nation}" – til alle managere (0x6a1b00: landshold)
      const dn = natOfClub(n.club);
      if (dn !== null) {
        if (n.manager.human ? n.manager.id !== HUMAN0 : !_env.canBeManaged(n.club)) return;
        addNews({ cat: 'job', key: 'board.cm', params: boardParams({ k: 'd', type: n.type, reason: n.reason, m: mname(n.manager), nation: g.nations[dn]?.name ?? '', nat: natAdj(g, dn) }, { club: clubName(n.club) }) });
        return;
      }
      // 0x69b790: afgangen skrives før nyheden (humanLeaves har allerede nulstillet userClub) – derfor managerens id, ikke mine(); før kom
      // fyringen uden besked (ejerens test 16/11: fyret på ferie uden nyhed). runUntil stopper ferien, når klubben er væk.
      if (n.manager.human) {
        if (n.manager.id === HUMAN0) {
          addNews({ cat: 'job', key: n.type === 2 ? 'job.resigned' : 'board.sacked', params: { club: clubName(n.club), manager: g.manager.name } });
          // klubbens historik (Staff_Records, type 150): fyret – læses af 0x69ca00 (dismissedBy)
          if (n.type !== 2) g.manager.cmDismissed = { ...g.manager.cmDismissed, [n.club]: g.date };
        }
      }
      else if (newsOn(g, n.club)) addNews({ cat: 'job', key: 'news.managerSacked', params: { club: clubName(n.club), manager: mname(n.manager) }, link: { kind: 'club', id: n.club } });
      return;
    }
    case 'appointed':
      // landsholdet (0x6a2e00): kun når landets ligaer kører (nation +0x11c), så til alle managere
      if (natOfClub(n.club) !== null) {
        if (!g.activeNations.includes(natOfClub(n.club)!) || (!n.manager.human && !_env.canBeManaged(n.club))) return;
        addNews({ cat: 'job', key: 'news.cmAppoint', params: { club: clubName(n.club), manager: mname(n.manager), full: clubName(n.club), prev: n.prev && n.kind === 3 ? clubName(n.prev) : '',
          body: appointBody(clubName(n.club), mname(n.manager), n.prev && n.kind === 3 ? clubName(n.prev) : '') } });
        return;
      }
      // 0x6a3060: overskriften "{kort navn} appoint X as manager", brødteksten efter den forrige klub (−1 → 0xa09e18) og arten (3 → 0xa0a2f8)
      if (n.manager.human ? clubNewsToMe(g, n.club, true) : newsOn(g, n.club)) addNews({ cat: 'job', key: 'news.cmAppoint', params: { club: g.clubs[n.club]?.short ?? clubName(n.club), manager: mname(n.manager), full: clubName(n.club), prev: n.prev > 0 && n.kind === 3 ? clubName(n.prev) : '',
        body: appointBody(clubName(n.club), mname(n.manager), n.prev > 0 && n.kind === 3 ? clubName(n.prev) : '') }, link: { kind: 'club', id: n.club } });
      return;
    case 'match': {
      // 0x6a5fa0 (0x138c) til klubbens menneskemanager; overskrift 0x6a6310 og brødtekst 0x6a69c0 bygges ved visning (cmBoardText.ts)
      const nn = natOfClub(n.club);
      if (!mine(n.club) && myNat(n.club) === null) return;
      const short = (c: number) => (natOfClub(c) !== null ? clubName(c) : g.clubs[c]?.short || clubName(c));
      const sc = `${Math.max(n.gf, n.ga)}-${Math.min(n.gf, n.ga)}`;
      addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'm', f: n.flags, tpl: n.tpl, run: n.run, club: clubName(n.club), nat: nn !== null ? natAdj(g, nn) : '',
        opp: clubName(n.opp), cs: short(n.club), os: short(n.opp), sc, comp: n.comp }), ...(nn === null ? { link: { kind: 'club' as const, id: n.club } } : {}) });
      return;
    }
    case 'pressure': case 'ultimatum': case 'protest':
      if (mine(n.club)) addNews({ cat: 'board', key: 'board.warning', params: { club: clubName(n.club) } });
      return;
    default: return;
  }
}
/** 0x6a2e00/0x6a1b00 (cmNewsScope.ts clubNewsToMe): kørende liga i et valgt land; omdømme > 7250 til alle, ellers landets managere */
function newsOn(g: GameState, c: number): boolean {
  return clubNewsToMe(g, c);
}

const nationNameOf = (g: GameState, n: number | undefined) => (n === undefined ? '' : g.nations[n]?.name ?? '');

/** 0x6a3060 brødteksten: uden forrige klub 0xa09e18, fra en anden klub (art 3) 0xa0a2f8 */
export function appointBody(club: string, manager: string, prevClub: string): string {
  return appointText(club, manager, prevClub);
}

/** 0x690d80 for klubben (dage i jobbet som 0x6b2080/0x6a4c40) */
function confidenceOf(g: GameState, env: BoardEnv, c: number, days: number): string {
  return confidenceText(confidenceIn(g, env, c, days));
}
function confidenceIn(g: GameState, env: BoardEnv, c: number, days: number): ConfidenceIn {
  const R = g.cmBoard?.rec[c];
  const run = currentRun(env, c);
  const nn = natOfClub(c);
  return ({
    club: nn !== null ? g.nations[nn]?.name ?? '' : g.clubs[c]?.name ?? '', days, wealth: env.wealthBand(c), ...(nn !== null ? { national: natAdj(g, nn) } : {}), leagueBand: leagueBand(R?.w12 ?? 0), confBand: confidenceBand(R?.w6 ?? 5000),
    runType: run.type, runLen: run.len, arrogDays: R ? daysSince(env.today, R.d41) : 9999, conf: s16(R?.w6 ?? 5000), fans: s16(R?.w16 ?? 0),
  });
}

/** Board Confidence-skærmen 0x6b2080 (manager_screens.cpp): 0x690d80 med dagene siden menneskets ansættelse (manageren +0x3e/+0x40) */
export function cmBoardScreenText(g: GameState): string | null {
  if (!cmBoardOn(g) || !g.userClub) return null;
  const env = boardEnv(g);
  const j = isoToCm(g.manager.cmJoined || g.date), t = env.today;
  const days = ((t.year & 0xffff) - (j.year & 0xffff)) * 365 - s16(j.day) + s16(t.day);
  return confidenceOf(g, env, g.userClub, days);
}

/** 0x6a8810 handle_board_request(klub, anmodning) – 1 stadion, 2 træningsanlæg, 3 transferpenge, 4 løn og 5 tid (notes/board/notes-C-match.md
 *  §6c). *Estimeret* i 3/4: sæsonen i gang (inWin), lønloftet Finance +0x14 (klubbens højeste ugeløn) og adjust_max_wage 0x598340 (lønbudgettet
 *  + R.b5 %). Svaret er nyheden 0x1786 (tekst
 *  0x6a9470); null = ikke porteret / intet svar. Bevillingerne (b2 0x40/0x80) bygger først ved sæsonslut i originalen (0x59cfa0 – ikke porteret). */
export function cmBoardRequest(g: GameState, req: 1 | 2 | 3 | 4 | 5): string | null {
  if (!cmBoardOn(g)) return null;
  const c = g.userClub, club = g.clubs[c];
  const env = boardEnv(g);
  const m = env.manager(c);
  if (!club || !env.division(c) || !m || !m.np) return null;
  const R = recOfG(g, c);
  const reply = (code: number) => {
    const d: BoardCmDesc = { k: 'r', club: club.name, req, code };
    const body = boardCmText(d).body;
    // nyheden 0x1786 (0x6a9350): slot 1 anmodningen og slot 2 svarkoden – knappen "Ultimatum" (0x782c6f) læser dem, slot 5 = givet
    addNews({ cat: 'board', key: 'board.cm', params: boardParams(d, { rq: req, rc: code, ult: 0 }), link: { kind: 'club', id: c } });
    return body;
  };
  R.b4 = (R.b4 + 1) & 0xff;
  const ch = env.chair(c);
  const lim = ch ? Math.trunc(s8(ch.b1d) / 5) + 2 : 3;
  if (R.b4 === lim && req !== 5) return reply(0xc);
  if (s8(R.b4) > s8(lim) && req !== 5) { R.w6 = s16(R.w6 - 250); return reply(0xa); }
  if (s16(R.w6) < 3500 && req !== 5) return reply(5);
  const prev = s8((R.b3 << 3) & 0xff) >> 4;
  if (prev === req && (R.b2 & 0x20)) return reply(3);
  R.b3 = (R.b3 & 0xe1) | ((req & 0xf) << 1);
  if (!env.entry(c)) return null;
  const bal = env.balance(c), rep = s16(clubRepMem(g, c)), mrep = s16(m.rep[1]);
  const okRep = (min: number) => mrep >= min && mrep >= rep - 1500;
  const rand = rnd(g, dayNum(g.date), 0x6a8810, req);
  if (req === 1) {
    if (!okRep(5000)) return reply(0xb);
    if (R.b2 & 0x40) return reply(6);
    const crowd = g.cmCrowd?.[c];
    const cap = crowd && crowd[3] >= 0 ? crowd[5] : -1;
    if (cap < 0 || /^(Bright|Wimble)/.test(club.name)) return reply(7);   // ingen stadion / club +0x6d = 0 (0x8298fd)
    if (cap > 75000) return reply(4);
    if (bal < (cap > 25000 ? 7500000 : cap > 15000 ? 5000000 : 2500000)) return reply(2);
    if (!(cap * 0.85 < (crowd?.[0] ?? 0))) return reply(4);
    if (rand(ch ? s8(ch.amb) : 5) === 0) return reply(4);
    R.b2 |= 0x40;
    return reply(0);
  }
  if (req === 2) {
    if (!okRep(4250)) return reply(0xb);
    if (R.b2 & 0x80) return reply(6);
    const tf = s8(club.facilities);
    if (bal < 125000 * (tf + 2)) return reply(2);
    const grant = (rep > 7250 && tf < 20) || (rep > 4750 && tf < 15) || (rep > 3250 && tf < 10) || (bal > 1250000 && tf < 6)
      || (ch ? s8(ch.amb) - tf + 10 : 20 - tf) >= rand(20);
    if (!grant) return reply(4);
    R.b2 |= 0x80;
    return reply(0);
  }
  // inWin (0x6a89a0): landets sæson er i gang ([0xb63d8a + 72·x] start/slut) – hos os: klubben har spillet og har ligakampe tilbage (*estimeret*)
  const inWin = () => {
    let played = false, left = false;
    for (const f of Object.values(g.fixtures)) {
      if (f.comp !== club.league || (f.home !== c && f.away !== c)) continue;
      if (f.result) played = true; else left = true;
      if (played && left) return true;
    }
    return false;
  };
  // dd = bestyrelsens mål for placeringen (R +0x2c) − tabellens placering (e +0x72)
  const ddPos = () => s8(R.t2c - (env.entry(c)?.pos ?? R.t2c));
  const business = g.cmFin?.[c]?.chair?.[0] ?? 10;                          // formandens Business (np +0xf)
  if (req === 3) {
    // 0x6a8a3c (transferpenge)
    if (!okRep(5000)) return reply(0xb);
    if (R.d28) return reply(6);
    if (bal < 2500000) return reply(2);
    if (R.d38 > R.q30) return reply(8);
    if (rand(ch ? s8(ch.amb) : 5) === 0) return reply(4);
    const bud = env.transferBudget(c) + Math.trunc(R.d38);
    let lim = rep > 7500 ? 5000 * rep - 25000000 : rep > 5250 ? 1000 * rep - 2250000 : 100 * rep - 450000;
    if (inWin()) { const d = ddPos(); lim = d > 4 ? Math.trunc(lim * 1.5) : d > 0 ? lim : Math.trunc(lim * 0.25); } else lim = Math.trunc(lim * 0.75);
    if (bud > lim) return reply(4);
    const amt = rep > 7500 ? 5000 * rep - 32500000 : rep > 4250 ? 1000 * rep - 2250000 : 100 * rep + 50000;
    if (amt > bal && rand(ch ? s8(business) : 10) !== 0) return reply(2);
    R.d28 = amt;
    // "… will make extra transfer funds available to you immediately" – beløbet lægges til klubbens Transfer Funds (0x598800 læser R +0x28)
    club.transferBudget = Math.round((club.transferBudget ?? 0) + amt / gbpOf(g, c));
    return reply(0);
  }
  if (req === 4) {
    // 0x6a8e60 (løn): Finance +0x14 (lønloftet get_max_wage) > 60000 → nej – hos os klubbens højeste ugeløn (£, *estimeret*)
    if (!okRep(5000)) return reply(0xb);
    if (R.b5) return reply(6);
    let top = 0;
    for (const p of squad(c)) top = Math.max(top, (p.contract?.wage ?? 0) * gbpOf(g, c));
    if (top > 60000) return reply(4);
    let x = ch ? s8(10 - business) : 0;
    const k = env.wealthBand(c);
    x = s8(x + (k === -1 ? -5 : k === 0 ? 5 : k === 1 ? 10 : k === 2 ? 15 : -15));
    if (inWin()) { const d = ddPos(); x = s8(d > 4 ? Math.trunc(x * 1.5) : d > 0 ? x : Math.trunc(x * 0.25)); } else x = s8(Math.trunc(x * 0.75));
    const a = x > 0 ? rand(x) : 0, b = rand(100);   // rand med x ≤ 0 (åbent spørgsmål i notes-C-match.md): 0
    if (a <= b) return reply(4);
    R.b5 = (ch ? (s8(ch.amb) > 5 ? s8(ch.amb) - 5 : 5) : rand(10) + 5) & 0xff;
    // Finance::adjust_max_wage(fin, R.b5) 0x598340 (ikke porteret): lønbudgettet hæves med R.b5 % (*estimeret*)
    club.wageBudget = Math.round((club.wageBudget * (1 + s8(R.b5) / 100)) / 100) * 100;
    return reply(0);
  }
  if (R.b3 & 1) return reply(6);
  if (s16(R.w6) > 4275) return reply(4);
  const dd = daysSince(env.today, m.joined) - (ch ? 10 * s8(ch.b1d) : 100);
  if (dd >= 180) return reply(9);
  R.b3 |= 1;
  R.w6 = Math.max(s16(R.w6 + 1250), 4275);
  return reply(0);
}

/** 0x6ae180: Meet with Board-skærmens punkt kan vælges (ellers gråt) – anmodning 1–5 */
export function cmBoardRequestAvailable(g: GameState, req: number): boolean {
  return boardRequestAvailable(req, g.clubs[g.userClub]?.facilities ?? 0);
}

/** nyheden 0x1786 har knappen "Ultimatum" (0x782c6f) – anmodningen, eller null */
export function cmUltimatumReq(g: GameState, n: { key: string; params: Record<string, string | number> }): number | null {
  if (!cmBoardOn(g) || !g.userClub || n.key !== 'board.cm' || n.params.rq === undefined) return null;
  const req = Number(n.params.rq);
  return ultimatumOffered(req, Number(n.params.rc), !!n.params.ult) ? req : null;
}

/** "Yes" i 0x9064a0's bekræftelse: 0x6ad610 issue_ultimatum (manageren, hans klub, anmodningen) – tilhængernes nyhed (0x178f type 1), bestyrelsens
 *  svar (type 3) og følgerne. Spillets data: stemningen = g.cmClubMood, status = cmClubStat[0], nation +0x85 = cmNationBoard, formanden = cmChair
 *  (+ Business fra cmFin), Finance = saldo/formuebånd/transferbudget som i 0x6a8810. *Afvigelse*: lønloftet Finance +0x14 (get_max_wage 0x5968d0) og
 *  adjust_max_wage 0x598340 findes ikke i spillet (anmodning 4 når aldrig hertil – 0x6a8810's anmodning 3/4 er ikke porteret); ved svar 1 på
 *  anmodning 1/2 ændrer originalen intet ud over nyheden. */
export function cmBoardUltimatum(g: GameState, req: number): boolean {
  if (!cmBoardOn(g)) return false;
  const c = g.userClub, club = g.clubs[c];
  const env = boardEnv(g);
  const m = env.manager(c);
  if (!club || !m || !m.np || !env.division(c)) return false;
  const crowd = g.cmCrowd?.[c];
  if (!crowd || crowd[3] < 0) return false;                               // club +0x69 (stadion) = NULL
  const R = recOfG(g, c);
  const ch = env.chair(c);
  const x: UltimatumIn = {
    req, today: env.today, gameStart: env.gameStart, mrep: m.rep[1], joined: m.joined, cmRep: m.rep[1],
    clubRep: clubRepMem(g, c), status: g.cmClubStat?.[c]?.[0] ?? 1, facilities: club.facilities, nat85: env.nat85(club.nation),
    cap: crowd[5], mood: g.cmClubMood?.[c] ?? 0,
    chair: ch ? { patience: ch.b1d, amb: ch.amb, business: g.cmFin?.[c]?.chair?.[0] ?? 10 } : null,
    fin: { balance: env.balance(c), band: env.wealthBand(c), transferBudget: env.transferBudget(c), wageCap: 0 },
  };
  const o = issueUltimatum(x, R, rnd(g, dayNum(g.date), 0x6ad610, req));
  const short = club.short || club.name, name = g.manager.name;
  const post = (type: number, sub: number) => addNews({ cat: 'board', key: 'board.cm', params: boardParams({ k: 'u', type, req, res: o.res, sub, club: club.name, short, m: name, st: club.stadium ?? '', small: o.fansStadium, poor: o.fansTraining }), link: { kind: 'club', id: c } });
  if (o.fans) post(1, o.fans);
  post(3, o.res);
  if (o.res === 2) stateOf(g).dep.push({ type: 1, reason: o.reason, club: c });
  return true;
}

/** Board-skærmens tekstkoder (boardStatementCodes) af originalens tillid: bånd 0x690b70 (+6) */
export function statementOf(g: GameState, c: number): { lvl: string; fin: string; fans: string } {
  const R = g.cmBoard?.rec[c];
  const band = R ? confidenceBand(R.w6) : 3;
  const lvl = band >= 5 ? 'delighted' : band === 4 ? 'positive' : band === 3 ? 'satisfied' : band === 2 ? 'concerned' : 'angry';
  const wb = financeStatus(Math.round((g.clubs[c]?.balance ?? 0) * gbpOf(g, c)), clubRepMem(g, c));
  const fin = wb === 2 ? 'extreme' : wb === 1 ? 'healthy' : wb === 0 ? 'secure' : wb === -1 ? 'stretched' : 'debt';
  const f16 = R ? s16(R.w16) : 0;
  const fans = f16 > 250 ? 'rapport' : f16 < -250 ? 'unhappy' : 'ok';
  return { lvl, fin, fans };
}

// ---------------------------------------------------------------- spillets kroge

const rnd = (g: GameState, ...k: number[]) => cmRand(g.seed, ...k);

/** newgame.ts: ikke-spillerpostens omdømme for databasens stab (sub_535a80) – kaldt af addDbStaff */
export function cmInitStaffRep(g: GameState, s: Staff, row: NonNullable<CMWorld['staff']>[number]): void {
  const bx = row[12];
  if (!bx || !s.cmNp) return;
  const clubRep = s.club ? clubRepMem(g, s.club) : null;
  s.cmRep = initStaffRep([bx[0], row[8], bx[1]], clubRep !== null ? [clubRep, g.clubs[s.club]?.nation ?? -1] : null, s.nation);
  // personpostens skjulte egenskaber +0x56..+0x5d som sub_535a80 (0x535ea4–0x5360xx) udfylder dem uden for 1..20: +0x56 og Loyalty +0x59 den
  // mindste af to terninger, de andre gennemsnittet (personalFill_535a80; oraklet 14/7-01: Warwick Rimmer 6,9,4,14,14,20,15,11 – databasen
  // har kun +0x5b = 20). +0x22 (landskampe) som databasen.
  // (24/11) hele blokken som for spillerne (personality_535ea4): Sportsmanship +0x5c er også den mindste, Temperament +0x5d har sine egne
  // terninger, og nationens +0x76 flytter Sportsmanship/Temperament
  const n76 = s.nation >= 0 && g.nations[s.nation] ? g.cmNation76?.[s.nation] ?? 0 : null;
  s.cmHid = [...personality_535ea4(bx.slice(2, 10), n76, cmRand(g.seed ?? 0, row[9], 0x535ea4)), bx[10]];
  s.cmJoined = row[13] || '';
}

/** newgame.ts: spilstarten 0x68f130 (på databasens dato 1/1) – efter at klubber, stab og turneringer findes */
export function cmBoardInit(g: GameState, chair: Record<number, [number, number, number, number]> | undefined, nationBoard: [number, number, number][] | undefined,
  natDb?: Record<number, [number, number]>, money?: (c: Club) => number): void {
  if (!cmLogic(g) || g.draft) return;
  // (MODERN_PARITY 7) 2026/27 i ægte tilstand: kun når world-filen har bestyrelsens data (formændene, nationerne – world-cm.json)
  const world2001 = cmActive(g);
  if (!world2001 && (!chair || !nationBoard)) return;
  // formandens Ambition (x[2]) som sub_535a80 udfylder den, når databasen har 0 (samme talrække som cmFinance.ts' formand)
  g.cmChair = {};
  for (const [cid, x] of Object.entries(chair ?? {})) g.cmChair[+cid] = [x[0], x[1], personalFill_535a80(x[2], cmRand(g.seed ?? 0, +cid, 0x535f04), 'avg'), x[3]];
  g.cmNationBoard = nationBoard ? nationBoard.map((x) => x.slice() as [number, number, number]) : [];
  g.cmBoardStart = g.date;
  // (MODERN_PARITY §0 A) spil startet med originalens landshold (g.cmIntl): landstrænerne i bestyrelsen som på den originale database
  const natBoard = world2001 || g.cmIntl === 1;
  g.cmBoard = natBoard ? { rec: {}, dep: [], vac: [], ult: [], month: -1, tab: {}, nm: {}, nj: {} } : { rec: {}, dep: [], vac: [], ult: [], month: -1, tab: {}, nd: natDb ?? {} };
  if (natBoard) cmBoardNationalInit(g);
  predictLeagues(g, stateOf(g), money);
  g.cmRecSt = {};
  for (const comp of Object.values(g.comps)) if (comp.type === 'league' && !g.leagues[comp.id]?.hidden) g.cmRecSt[comp.id] = 1;
  const db =`${g.date.slice(0, 4)}-01-01`;
  const env = boardEnv(g, db, g.date);
  initRecords(env, stateOf(g), rnd(g, dayNum(db), 0x68f130));
}

/** 0x68f130 2a (den originale database): landstrænerne bliver A-holdenes managere i bestyrelsen */
function cmBoardNationalInit(g: GameState): void {
  if (!g.cmBoard?.nm) return;
  // 0x68f130 2a: landstrænerne (staff +0x24 = A-holdet, +0x28 = 5/12) bliver A-holdets manager (den sidste i staff-rækkefølgen); de andre
  // landsholdsjob ryddes, og deres +0x28 sættes til 0 (staffPerson/clublessJob – +0x3d uden klub = landsholdsjobbet)
  const off = natClubId(g, 0, false);
  for (const s of Object.values(g.staff).sort((a, b) => a.id - b.id)) {
    const x = s.cmNat;
    if (!x || (x[1] !== 5 && x[1] !== 12)) continue;
    const n = x[0] - off;
    if (n >= 0 && n < g.nations.length) { g.cmBoard.nm![n] = s.id; nmChanged(); }
  }
  // (2a) landstrænerens +0x28 bliver stående (5/12 – `continue`): 0x83fa72 (ønskelisten) og 0x69f9b8 (managerjob) springer ham over
  for (const id of Object.values(g.cmBoard.nm!)) { const x = g.staff[id]?.cmNat; if (x) g.cmBoard.nj![id] = x[1]; }
  resetNationalManagers(g);
}

const stateOf = (g: GameState) => g.cmBoard as unknown as CmBoardState;

/** newgame.ts takeOverClub: 0x826f20 appoint_human_manager_to_club → 0x69ebc0 → 0x694c80 */
export function cmBoardHumanAppoint(g: GameState, club: Club, hadAiManager: boolean): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g);
  void hadAiManager;
  g.manager.cmRep = humanAppointRep(clubRepMem(g, club.id));
  g.manager.cmB59 = 20;
  g.manager.cmJoined = g.date;
  st.vac = st.vac.filter((e) => e.club !== club.id);
  const env = boardEnv(g);
  resetForNewManager(env, st, club.id, rnd(g, dayNum(g.date), 0x694c80, club.id));
  syncHuman(g);
}

/** acceptJob (0x6b287c → 0x69ebc0 appoint_manager_to_club): den gamle klub får en ledig stilling, den nye manager og bestyrelsen nulstilles */
export function cmBoardAcceptJob(g: GameState, cid: number, oldClub: number): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const rand = rnd(g, dayNum(g.date), 0x69ebc0, cid);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  if (oldClub && env.activeLeague(oldClub)) addVacancy(env, st, oldClub, h, rand);
  recOfG(g, cid).d20 = { day: 234, year: 1971 };
  g.manager.cmJoined = g.date;
  resetForNewManager(env, st, cid, rand);
  syncHuman(g);
}
const recOfG = (g: GameState, c: number): BoardRec => (stateOf(g).rec[c] ??= ({} as BoardRec));

/** declineJob (0x6b281d): jobbet søges igen uden ham */
export function cmBoardDeclineJob(g: GameState, cid: number): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  st.vac = st.vac.filter((e) => e.club !== cid);
  addVacancy(env, st, cid, h, rnd(g, dayNum(g.date), 0x6b281d, cid));
}

/** applyJob (0x6b1ce7 → 0x69ca00) */
export function cmBoardApply(g: GameState, cid: number): 'sent' | 'error' {
  if (!cmBoardOn(g)) return 'error';
  const st = stateOf(g), env = boardEnv(g);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0);
  if (!h || env.manager(cid)) return 'error';
  applyForJob(env, st, cid, h, rnd(g, dayNum(g.date), 0x69ca00, cid));
  return 'sent';
}

/** resignJob (0x6b204e): remove_club_manager(club, 2, 0, 0) + add_job_vacancy(club, mennesket) */
export function cmBoardResign(g: GameState, cid: number): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  recOfG(g, cid).w6 = 3500;
  if (env.canBeManaged(cid)) addVacancy(env, st, cid, h, rnd(g, dayNum(g.date), 0x6b204e, cid));
}

/** sæsonskiftets flytning til/fra en inaktiv division (cmNonLeague.ts): op (League 0x6830b0, 3. argument 1) – klubben uden manager
 *  (+0xcf = 0) får en ledig stilling (0x69ba50(klub, 0)); ned i en division uden kørende liga (0x6831a0) – et menneske i klubben (0x600a50)
 *  forlader den (0x69b790(klub, 1, 7, 0)) */
export function cmBoardClubMoved(g: GameState, cid: number, up: boolean): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const m = env.manager(cid);
  if (up) { if (!m) addVacancy(env, st, cid, null, rnd(g, dayNum(g.date), 0x69ba50, cid)); }
  else if (m?.human) removeClubManager(env, st, cid, 1, 7, false);
}

/** sim.ts newDay (før datoskiftet): 0x68f9c0 for dagen, der er spillet */
export function cmBoardDaily(g: GameState): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  const rand = rnd(g, dayNum(g.date), 0x68f9c0);
  // turneringernes daglige vt+0x14 (0x6847c0, før MANAGER_MANAGER i dagens tidspunkt): ligaerne med dagens resultater → 0x684cd0
  if (st.ltd) for (const [lid, d] of Object.entries(st.ltd)) if (d === g.date) updateTablePositions(g, st, lid);
  holidayJobs.length = 0;
  boardDaily(env, st, rand, (r) => weeklyUpdate(env, st, r));
  syncHuman(g);
  holidayJobAnswers(g);
}

/** auto_respond 0x784100 for jobtilbuddet 0x1774 på ferie: ja uden klub, ellers kun med ferievalg 1 og tilbuddets omdømme ≥ hans klubs (s16) */
export function holidayJobYes(opt1: number, ownRep: number | null, offerRep: number): boolean {
  if (ownRep === null) return true;
  return opt1 !== 0 && s16(offerRep) >= s16(ownRep);
}
/** jobtilbuddene, assistenten har besvaret på ferie (boardNews 'jobOffer'; tests lægger dem direkte i køen) */
export const holidayJobs: { club: number; yes: boolean }[] = [];
export function holidayJobAnswers(g: GameState): void {
  const list = holidayJobs.splice(0);
  for (const { club, yes } of list) {
    const on = natOfClub(club);
    if (on !== null) {
      if (g.manager.nationalOffer !== on) continue;
      if (yes) { cmBoardNationalAnswer(g, true); continue; }
      // nej: felt 1 = 2 (afslaget via auto_respond opretter ingen ny ledighed – 0x6b2790's add_job_vacancy er skærmens)
      g.manager.nationalOffer = undefined;
      const offer = g.news.find((x) => x.key === 'board.cm' && typeof x.params.bd === 'string' && x.params.bd.includes('"k":"o"') && x.params.club === g.nations[on]?.name);
      if (offer) { try { const d = JSON.parse(String(offer.params.bd)); d.st = 2; Object.assign(offer.params, boardParams(d, { club: offer.params.club })); } catch { /* */ } }
      continue;
    }
    if (!g.jobOffers.includes(club)) continue;
    if (yes && holidayHooks.acceptJob && g.clubs[club]?.manager === 0) { holidayHooks.acceptJob(club); continue; }
    g.jobOffers = g.jobOffers.filter((x) => x !== club);
  }
}

/** Forkørslen 0x5cc850 (cmPrerun.ts, 1/1 → dagen før start): MANAGER_MANAGER 0x68f9c0 kører hver dag på tidspunkt 2 (notes/calendar-prerun.md),
 *  med forkørslens dato som "i dag". Nyhederne sendes ikke: originalens indbakke ved start har kun spilstartens tre nyheder (målt), og
 *  [0xae2cfc] sættes først til 2 efter løkken. */
let prerunQuiet = false;
/** målinger: forkørslens managertrin kan slås fra */
export const boardPrerun = { on: true };
registerPrerun('managers', (g, day, iso) => {
  if (!cmBoardOn(g) || !boardPrerun.on) return;
  const st = stateOf(g), env = boardEnv(g, iso);
  prerunQuiet = true;
  try { boardDaily(env, st, rnd(g, day, 0x68f9c0), (r) => weeklyUpdate(env, st, r)); syncHuman(g); } finally { prerunQuiet = false; }
});

/** season.ts: League::set_club_season_expectations 0x68aa80 for hver liga (når sæsonen sættes op) */
export function cmBoardSeasonSetup(g: GameState, only?: Set<string>): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  // (16/11) sæsonskiftet pr. land (cmSeason.ts): kun de nye ligaer – de andre landes Comp_Stats-rækker fortsætter
  if (!only) { st.tab = {}; st.lt = {}; }
  predictLeagues(g, st, undefined, only);
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league' || g.leagues[comp.id]?.hidden || (only && !only.has(comp.id))) continue;
    if (only && st.tab) for (const c of comp.clubs) delete st.tab[c];
    if (only && st.lt) for (const c of comp.clubs) delete st.lt[c];
    (g.cmRecSt ??= {})[comp.id] = 1;
    for (const c of comp.clubs) { setSeasonExpectations(env, st, c, true, rnd(g, dayNum(g.date), 0x68aa80, c)); cmFineSeasonHalve(g, c); }   // 0x6a4472: 0x5a5930
  }
  syncHuman(g);
}

/** kampposten holdblok +8/+9 (0x729ff0 0x72a5bb/0x72a5c1: engine+0xf5bc + 54·side +2/+3 = skud og skud på mål, summeret over kamptruppens
 *  20 i 0x6d1cc0's watchedStats – u8) – læst af 0x695240 1.4a. Linjernes `cmr` [4]/[5] er spillerens +0x26/+0x27 (gittermotoren); uden dem
 *  (zonemotoren) linjernes skud. */
function teamBlock89(lines: MatchReport['players']): { b8: number; b9: number } {
  let b8 = 0, b9 = 0;
  for (const l of lines) { b8 = (b8 + (l.cmr ? l.cmr[4] : l.shots ?? 0)) & 0xff; b9 = (b9 + (l.cmr ? l.cmr[5] : l.on ?? 0)) & 0xff; }
  return { b8, b9 };
}

/** sim.ts applyMatchResult (efter tabellen): 0x6951e0 */
export function cmBoardAfterMatch(g: GameState, f: Fixture, rep: MatchReport): void {
  if (!cmBoardOn(g)) return;
  const st = stateOf(g), env = boardEnv(g);
  // Comp_Stats' bedste/dårligste placering og den seneste kampdato (ligakampe)
  const comp = g.comps[f.comp];
  if (comp?.type === 'league') {
    const rows = leagueRows(comp);
    for (const c of [f.home, f.away]) {
      const pos = rows.findIndex((r) => r.club === c) + 1;
      const t = (st.tab ??= {})[c];
      st.tab[c] = t ? [Math.min(t[0], pos), Math.max(t[1], pos), dayNum(g.date)] : [pos, pos, dayNum(g.date)];
    }
    (st.ltd ??= {})[f.comp] = g.date;                                     // League +0xc9 = i dag (vt+4 0x685d30)
  }
  const codes = fixtureCodesOf(g, f, f.comp, f.home);
  const [hs, as] = rep.stats;
  const tie = f.tieId !== undefined ? comp?.ties.find((t) => t.id === f.tieId) : undefined;
  let aggH = 0xff, aggA = 0xff;
  if (tie && (tie.legs ?? 1) > 1 && (f.leg ?? 1) === 2 && codes.firstLeg) { aggH = codes.firstLeg[0] + hs.goals; aggA = codes.firstLeg[1] + as.goals; }
  const sideOf = (t: 0 | 1) => {
    const lines = rep.players.filter((l) => l.team === t);
    const oppNation = g.clubs[t ? f.home : f.away]?.nation;
    return {
      club: t ? f.away : f.home, ...teamBlock89(lines),
      rows: lines.map((l) => {
        const p = g.players[l.id];
        const r = p?.cmRepMem ?? p?.cmRep ?? [50, 50, 50];
        const v = p && oppNation !== undefined && g.clubs[p.club]?.nation === oppNation ? r[1] : p?.nation === oppNation ? r[0] : r[2];
        return { rating: Math.max(1, Math.min(10, Math.round(l.rating))), minutes: Math.max(0, Math.min(127, l.minutes)), redAt: l.red ? l.minutes : -1, rep: Math.round(v * 50) };
      }),
    };
  };
  const m: MatchIn = {
    home: f.home, away: f.away, len: rep.et ? 120 : 90, b3a: codes.b3a, w30: codes.w30, w32: codes.w32, w38: codes.flags38,
    gh: hs.goals, ga: as.goals, aggH, aggA, penH: rep.pens?.[0] ?? 0, penA: rep.pens?.[1] ?? 0,
    // venskabskampene har turneringen "Friendly" (club_comp.dat id 72 i 3.9.60/3.9.65/3.9.68 og 2026/27; fixture +0x14 ≠ NULL, +0x69 = 1 hhv. 4 –
    // oraklets crowd1.txt: comp 72, +0x3a = 1)
    compRep: comp ? codes.compRep : f.comp === FRIENDLY_COMP ? g.cmCompRep?.[CC_FRIENDLY] ?? 0 : null,
    isDivision: (c) => g.clubs[c]?.league === f.comp,
    friendly: comp?.id === 'FRIENDLY' || f.comp.startsWith('FR'),
    inContention: (c) => inContention(g, f, c),
    derby: (c, o) => {
      const cr = g.cmCrowd?.[c], or = g.cmCrowd?.[o];
      const riv = cr ? cr.slice(6, 9) : [];
      const sameCity = cr && or && cr[4] === or[4] && cr[4] > 0;
      if (sameCity) return riv.includes(o) ? 0x40 : 0x80;
      // rivaler i en anden by: 0x40 også ved afstand ≤ 25 (byernes koordinater +0x23/+0x2b findes ikke i dataene – kun 0x80)
      if (riv.includes(o)) return 0x80;
      return leagueClash(env, c, o) ? 0x80 : 0;                          // 0x4b02e0: titel-/oprykningskamp i samme division
    },
    venueHome: true,
    sides: [sideOf(0), sideOf(1)],
    compName: comp ? compShort(comp.name) : '',
  };
  // (ydelse 14/11) afterMatch læser kun manageren (om der er en, og .np) – uden boardEnv's allPersons (alle personer pr. kamp)
  const touched = { done: false };
  afterMatch({ ...env, manager: (c) => managerPerson(g, c, env.today, touched) }, st, m, rnd(g, f.id, 0x695240));
  syncHuman(g);
}

/** international.ts playNation (ægte tilstand, efter landskampen og kamprapporten): 0x6951e0 for begge A-landshold. `venue` = spillestedets
 *  nation (hjemmeholdets land; slutrunderne: værtslandet). *Afvigelse*: de internationale turneringers omdømme (club_comp +0x69 for nation_comp)
 *  findes ikke i world-filen (0 som i gamePostReport). */
export function cmBoardNationalAfterMatch(g: GameState, home: number, away: number, rep: MatchReport, x: { b3a: number; w30: number; compId: number; friendly: boolean; venue: number; name?: string }): void {
  if (!cmBoardOn(g) || !g.cmBoard?.nm) return;
  const st = stateOf(g), env = boardEnv(g, g.date, undefined, true);
  const [hs, as] = rep.stats;
  const nat = [home, away];
  const sideOf = (t: 0 | 1) => {
    const oppN = nat[t ? 0 : 1];
    return {
      club: natClub(nat[t]), ...teamBlock89(rep.players.filter((l) => l.team === t)),
      rows: rep.players.filter((l) => l.team === t).map((l) => {
        const p = g.players[l.id];
        const r = p?.cmRepMem ?? p?.cmRep ?? [50, 50, 50];
        // 1.4b: modstanderens nation = spillerens → +9, ikke udlænding → +9, ellers +0xd
        const v = p && (p.nation === oppN || !cmForeign(g, p.nation, oppN)) ? r[0] : r[2];
        return { rating: Math.max(1, Math.min(10, Math.round(l.rating))), minutes: Math.max(0, Math.min(127, l.minutes)), redAt: l.red ? l.minutes : -1, rep: Math.round(v * 50) };
      }),
    };
  };
  const m: MatchIn = {
    home: natClub(home), away: natClub(away), len: rep.et ? 120 : 90, b3a: x.b3a, w30: x.w30, w32: 0, w38: 0,
    gh: hs.goals, ga: as.goals, aggH: 0xff, aggA: 0xff, penH: rep.pens?.[0] ?? 0, penA: rep.pens?.[1] ?? 0,
    compRep: g.cmCompRep?.[x.compId] ?? 0, isDivision: () => false, friendly: x.friendly, inContention: () => true, derby: () => 0,
    venueHome: true, venueNation: x.venue, sides: [sideOf(0), sideOf(1)], compName: x.name ?? '',
  };
  const touched = { done: false };
  afterMatch({ ...env, manager: (c) => managerPerson(g, c, env.today, touched) }, st, m, rnd(g, dayNum(g.date), 0x695240, 1000 + home, away));
}

/** 0x6a5610 for et landshold, når slutrunden er færdig (NationalTeams 0x775420 – cmNatTeams.ts) */
export function cmBoardNationalReview(g: GameState, n: number, comp: number, grade: number): void {
  if (!cmBoardOn(g) || !g.cmBoard?.nm) return;
  const env = boardEnv(g, g.date, undefined, true);
  reviewNational(env, stateOf(g), natClub(n), comp, grade, rnd(g, dayNum(g.date), 0x6a5610, n));
}
/** 0x775000/0x775220 → set_season_expectations(landsholdet, 1), når landsholdets aktuelle turnering skifter */
export function cmBoardNationalExpect(g: GameState, n: number): void {
  if (!cmBoardOn(g) || !g.cmBoard?.nm || (g.cmNationCont?.[n] ?? -1) < 0) return;
  const env = boardEnv(g, g.date, undefined, true);
  setSeasonExpectations(env, stateOf(g), natClub(n), true, rnd(g, dayNum(g.date), 0x6a3770, n));
}

/** International-skærmen (ægte tilstand): svaret på forbundets tilbud – Accept = 0x69ebc0 appoint_manager_to_club for landsholdet, Decline =
 *  add_job_vacancy(landsholdet, mennesket) (0x6b2790). null = ikke bestyrelsens tilbud */
export function cmBoardNationalAnswer(g: GameState, accept: boolean): string | null {
  if (!cmBoardOn(g) || !g.cmBoard?.nm) return null;
  const n = g.manager.nationalOffer;
  if (n === undefined) return 'error';
  g.manager.nationalOffer = undefined;
  const st = stateOf(g), env = boardEnv(g);
  const c = natClub(n);
  const rand = rnd(g, dayNum(g.date), 0x6b2790, n);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  // nyhedens slot 1 (1 accepteret, 2 afslået)
  const offer = g.news.find((x) => x.key === 'board.cm' && typeof x.params.bd === 'string' && x.params.bd.includes('"k":"o"') && x.params.club === g.nations[n]?.name);
  if (offer) { try { const d = JSON.parse(String(offer.params.bd)); d.st = accept ? 1 : 2; Object.assign(offer.params, boardParams(d, { club: offer.params.club })); } catch { /* */ } }
  if (!accept) { if (h) addVacancy(env, st, c, h, rand); return 'ok'; }
  // 0x69ebc0 tjekker ikke, om jobbet er besat imens: club +0xcf = mennesket (en udnævnt computermanager mister landsholdet)
  if (st.nm?.[n] !== undefined) { const id = st.nm[n]; delete st.nm[n]; delete st.nj?.[id]; nmChanged(); }
  // 0x69ebc0 for landsholdet: det gamle landshold (menneskets +0x24) – ingen ny ledighed (kun for lande uden verdensdel), han fjernes dér
  const old = g.manager.national?.nation;
  if (old !== undefined && old !== n) g.manager.national = undefined;
  recOfG(g, c).d20 = { day: 234, year: 1971 };
  if (h) boardNews(g, env, { t: 'appointed', club: c, manager: h, prev: old !== undefined && old !== n ? natClub(old) : 0, kind: old !== undefined && old !== n ? 3 : 2 });
  g.manager.national = { nation: n, since: g.date, played: 0, won: 0 };
  resetForNewManager(env, st, c, rand);                                  // (ledighedsposten bliver – 0x68f9c0 dropper den, når jobbet er besat)
  resetNationalManagers(g);
  return 'ok';
}

/** International-skærmen (ægte tilstand): fratræd landsholdet – remove_club_manager(landsholdet, 2, 0, 0) + add_job_vacancy(landsholdet, mennesket) */
export function cmBoardNationalResign(g: GameState): string | null {
  if (!cmBoardOn(g) || !g.cmBoard?.nm) return null;
  const nj = g.manager.national;
  if (!nj) return 'error';
  const st = stateOf(g), env = boardEnv(g);
  const c = natClub(nj.nation);
  const h = env.persons().find((p) => p.human && p.id === HUMAN0) ?? null;
  if (h) boardNews(g, env, { t: 'departed', club: c, manager: h, type: 2, reason: 0 });
  g.manager.national = undefined;
  recOfG(g, c).w6 = 3500;
  resetNationalManagers(g);
  if (h && env.canBeManaged(c)) addVacancy(env, st, c, h, rnd(g, dayNum(g.date), 0x6b204e, 1000 + nj.nation));
  return 'ok';
}

/** menneskets Board-skærm og bestyrelse (board.ts' felter) følger originalens post */
function syncHuman(g: GameState): void {
  const R = g.cmBoard?.rec[g.userClub];
  if (!R || !g.userClub) return;
  g.board.confidence = Math.max(0, Math.min(100, Math.round(s16(R.w6) / 100)));
  if (R.t2c) g.board.expectedPos = R.t2c;
  g.board.expectation = EXP_KEY(R.e);
}

/** (ydelse 14/11) boardEnv(g).manager(club) uden at bygge alle personer: samme Person-felter (staffPerson/humanPerson/noNp) og samme
 *  sideeffekt – allPersons gav alle personer et omdømme (cmRep ??= [1, 1, 1]), når manageren blev slået op. Kun til kaldere, der ikke sammenligner
 *  personerne med env.persons() (identiteten): kamprapportens managerdel og bestyrelsen efter kampen (afterMatch læser kun manageren). */
function managerPerson(g: GameState, club: number, today: CmDate, touched: { done: boolean; all?: Staff[] }): Person | null {
  if (tempManager.has(club)) return tempManager.get(club)!;
  const nn = natOfClub(club);
  if (nn !== null) {
    const h = humanRefs(g).find((x) => x.get().manager.national?.nation === nn);
    if (h) { h.get().manager.cmRep ??= [1, 1, 1]; return humanPerson(g, h); }
    const s = g.cmBoard?.nm?.[nn] !== undefined ? g.staff[g.cmBoard!.nm![nn]] : undefined;
    return s ? (s.cmNp ? staffPerson(g, s, today) : noNp(s)) : null;
  }
  const mid = g.clubs[club]?.manager ?? 0;
  if (mid === -1 || (mid > 0 && g.staff[mid]?.cmNp)) {
    if (!touched.done) {
      touched.done = true;
      for (const s of touched.all ?? Object.values(g.staff)) if (s.cmNp && !s.cmExtra) s.cmRep ??= [1, 1, 1];
      for (const h of humanRefs(g)) h.get().manager.cmRep ??= [1, 1, 1];
    }
  }
  if (mid === -1) return humanRefs(g).map((h) => humanPerson(g, h)).find((p) => p.club === club) ?? null;
  if (mid > 0) { const s = g.staff[mid]; return s?.cmNp ? (s.cmExtra ? null : staffPerson(g, s, today)) : s ? noNp(s) : null; }
  return null;
}

/** 0x6b6cc0 (efter kampen): managerens tre værdier fra 0x6d3610, assistenten og trænerne får en fjerdedel af ændringen */
postHooks.managerRep = (g, club, v) => {
  if (!cmBoardOn(g)) return;
  // (ydelse 14/11) personerne bygges direkte som boardEnv's manager()/person() ville give dem – før byggede boardEnv ALLE personer
  // (sorteret stab + mennesker) to gange pr. kamp (~0,4 s pr. lørdag med fem lande)
  // (ydelse) én liste over staben til begge gennemløb (rækkefølgen er Object.values' – staben ændres ikke imellem)
  const all = Object.values(g.staff);
  const today = isoToCm(g.date), touched = { done: false, all };
  const m = managerPerson(g, club, today, touched);
  if (!m || !m.np) return;
  const mine = all.filter((s) => s.club === club && s.cmNp);
  // club +0xd3 (assistenten) og +0x19f (de fem trænerpladser): env.person(id) = den byggede person (cmNp, ikke cmExtra), ellers noNp
  const staff = [...mine.filter((s) => s.role === 'assistant').slice(0, 1), ...mine.filter((s) => s.role === 'coach').slice(0, 5)]
    .map((s) => (s.cmExtra ? noNp(s) : staffPerson(g, s, today))).filter(Boolean);
  managerRepAfterMatch(m, staff, v[0], v[1], v[2]);
};

export const _test = { entryOf, leagueInfo };
export { squad };

/** 0x844780 staff_interest_in_job_at_club(s, c, 0, job, NULL) for et andet job end manager (stabens skifter, cmStaffMove.ts) */
export function staffJobInterest(g: GameState, env: BoardEnv, p: Person, c: number, job: number): number {
  return staffInterest(interestEnv(g, env), p, c, job);
}
