// Originalens kalender (runde 10A, 12/11-2026) – kun den originale database i ægte tilstand (cmActive), som det øvrige cm*-kode:
//
//   Spilstarten 0x830520 (setup_pick_start_date) + 0x828480: den første række i nøglelandstabellen 0xb63d60 (35 × 0x48) med spillets
//     hovedland [0xae2d08] (det først valgte land) → +0x2a (landets sæsonstart; England = lørdagen nærmest 10/8 = 11/8-2001), et europæisk
//     land med start efter 1/9-2001 → 1/9-2001, så −4 uger (0x54cab0). 0x5cc850 kører spillet dag for dag fra databasens dato 1/1 til den
//     dato (startdatoen ≤ 1/1 → ingen forkørsel). England: 14/7-2001.
//   Ligaernes runder: create_schedule (EngPrm 0x573660, EngFirst 0x571980, EngSecond 0x5757a0, EngThird 0x5770e0 – data/cmSchedules.ts) →
//     League::create_fixtures 0x6835c0: runde i = skemaets række i (dato, tidspunkt +4); kampene lægges i FIXTURE_MANAGER::add_fixture
//     0x5aa680, som flytter en kamp, der støder sammen med en anden af klubbens kampe (find_new_fixture_date 0x5ab510).
//   Tv-flytningerne League::move_fixtures_for_tv 0x685640: hver dag (League::update_for_date 0x6847c0, 0x684af4: i dag + 4 uger) for
//     skemaets dato: pr. tv-plads den kamp med størst rand(ude +0x80 + 1500) + rand(hjemme +0x80) (0 ved en anden kamp for et af holdene
//     2–5 dage før/efter, 0x5acbe0) → ugedagen nærmest datoen og pladsens tidspunkt.
//   FA Cup: EngFaCup::create_round_table 0x56f320 (9 runder; spillets pokal har færre – runderne tælles fra finalen).
//
// Ligaskemaerne (runde 10D): 34 klasser i data/cmSchedules.ts (England, Tyskland, Belgien, Danmark, Skotland, Sverige, Norge 1, Japan, Rusland, Sydkorea …).
// (16/11) + Norge 1. division (NorFirst 0x790040: tæller ligaens klubber – 16 → 30 runder, ellers 26) og USA (UsaMls 0x9072d0: 32 runder for 12
// klubber – spillet lader den tredje turnering stoppe efter 32 runder, se CM_LEAGUE_CUT) = 36 klasser.
// IKKE porteret (se ENGINE_PORT_PLAN.md, runde 10A): Australien (AusNsl 0x4111a0: 24 rækker til 14 klubbers 26 spillerunder – originalens
// rundefølge 0x68a030 genbruger rækker, plus 10 rækker slutspil i stage 0, som spillet ikke har), Polen (PolFirst 0x7c8df0: stage −1/0 = to
// grupper à 8 med 14 runder, stage 1/2 = mesterskabs-/nedrykningsgrupper à 14 – spillets liga har ikke grupper før splittet). Tjekkiet/Østrig/
// Mexico/Schweiz har ingen ligaklasse i originalen (exe'ens comp\leagues\*.cpp: ingen aut/cze/swi/mex – landene spilles ikke i CM 01/02;
// heller ingen række i nøglelandstabellen 0xb63d60). Liga Cup/Charity Shield/
// Intertoto/landskampene i forkørslen, sammenstødsreglen 0x5ad780/0x5adba0 (kodernes rækkefølge; her: en anden kamp for et af holdene dagen
// før/samme dag/dagen efter, koden = den anden kamps type), resolve_same_day_clash 0x5ae380, klubbens foretrukne kampdag +0x72 (alle
// engelske klubber har 5 = lørdag eller 0xff) og originalens parring af holdene (league_next_schedule_round
// 0x68a030 + talrækken).
// Nyhederne (19/11): tv-flytningen (type 3, 0x685ac1 → 0x7861e0, tekst 0x77c46a) og den flyttede kamp ved en Europa-kamp (type 1, 0x5aac70-køen
// FIXTURE_MANAGER +0x1128, leveret af 0x5aaf00; tekst 0x77bfe2).
import type { Fixture, GameState } from './types';
import { addDays, daysBetween, toDate } from './dates';
import { CM_FA_CUP, CM_SCHEDULES, type SchedRound, type SchedTv, type SchedVar } from './data/cmSchedules';
import { nation01, seasonStartDay01 } from './cmFitness';
import { cmActive, cmLogic, cmRand } from './cmPlayerData';
import { addNews, fixturesOn, gs, indexFixture, newsStamp, unindexFixture } from './state';
import { asOwner } from './humans';

/** kalenderen gælder (20/11, "Altid som originalen"): den originale database i ægte tilstand, eller en CM-database i ægte tilstand fra et spil, der
 *  er startet med kalenderen (g.cmCal – newgame.ts; 2026/27). Ældre 2026/27-spil og udvidet tilstand beholder spillets kalender. Ikke draft-ligaen. */
export const cmCalendarOn = (g: GameState): boolean => (cmActive(g) || (cmLogic(g) && g.cmCal === 1)) && !g.draft;

/** de 27 nøglelande uden for Europa (0x9cfa10 = Europa): Argentina, Australien, Brasilien, Japan, Sydkorea, USA (id'erne i den originale database –
 *  nation01 for de andre databaser) */
const NON_EUROPE = new Set([8, 11, 27, 97, 170, 196]);
/** de engelske ligaer med originalens skema (turnerings-id'er i club_comp.dat) */
const ENGLAND = 60;

const isoOf = (t: number) => new Date(t).toISOString().slice(0, 10);
/** ugedag 0 = mandag … 6 = søndag (0x54a3f0) */
export const cmWeekday = (iso: string) => (toDate(iso).getUTCDay() + 6) % 7;

/** 0x549f70 Date(dag, måned 0–11, år, ugedag): dagen i året = månedstabellen + dag (løber over i næste måned som i originalen),
 *  så 0x54a2d0 – den dag med ugedagen, der ligger højst 3 dage før eller efter (ugedag −1 = ingen) */
export function cmDate(day: number, month: number, year: number, wd: number): string {
  const t = Date.UTC(year, month, 1) + (day - 1) * 86400000;
  if (wd < 0) return isoOf(t);
  const cur = (new Date(t).getUTCDay() + 6) % 7;
  let diff = wd - cur;
  if (diff > 3) diff -= 7;
  if (diff < -3) diff += 7;
  return isoOf(t + diff * 86400000);
}
/** 0x54a2d0 på en ISO-dato */
export const nearestWeekday = (iso: string, wd: number) => cmDate(Number(iso.slice(8, 10)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(0, 4)), wd);

/** Spilstarten 0x830520 − 4 uger (null: hovedlandet har ingen række i nøglelandstabellen). `mainNation` = hovedlandets id i den originale
 *  database (nation01ByName – 2026/27-opdateringen har andre id'er). Den originale database starter altid i 2001. */
export function cmStartDate(mainNation: number | undefined, season: number): string | null {
  const A = mainNation === undefined ? undefined : seasonStartDay01(mainNation);
  if (A === undefined || mainNation === undefined) return null;
  let start = isoOf(Date.UTC(season, 0, 1) + A * 86400000);
  // (20/11) 0x667150 bygger +0x2a for spillets år: England = Date(10, 7, år, 5) = lørdagen nærmest 10/8 (2001: 11/8 = SEASON-tabellen). De øvrige
  // rækkers Date-argumenter er ikke afkodet – deres dag i året er målt i 2001 (cmFitness.ts SEASON) og bruges uændret i andre år
  if (mainNation === ENGLAND) start = cmDate(10, 7, season, 5);
  // 0x83057b–0x830609: Europa og år 2001 – en start efter 1/9-2001 bliver 1/9-2001
  const sep1 = `${season}-09-01`;
  if (!NON_EUROPE.has(mainNation) && season === 2001 && start > sep1) start = sep1;
  start = addDays(start, -28);
  // 0x5cc850: startdatoen før databasens dato (1/1) → spillet starter på databasens dato
  const jan1 = `${season}-01-01`;
  return start < jan1 ? jan1 : start;
}

export interface CmRound { date: string; slot: number; tv: SchedTv[] }

/** (runde 10D) Ligaer, hvis skema har flere runder end en dobbelt turnering: Danmarks Superliga 3 × 11 = 33 runder (CM4, 0x552900), Sydkorea
 *  3 × 9 = 27 (CM229, 0x66b130) og Skotlands Premier League 33 + 5 i split-grupperne = 38 (CM34, 0x7f0e80 – 12 klubber, 2 grupper à 6 med én
 *  runde). Databasens regler siger 2 runder, så de overskrives ved et nyt spil (ellers passer rundeantallet ikke med skemaet). */
const CM_ROUND_RULES: Record<string, { rounds: number; split?: { after: number; groups: number; rounds: number } }> = {
  CM4: { rounds: 3 }, CM229: { rounds: 3 }, CM34: { rounds: 3, split: { after: 33, groups: 2, rounds: 1 } },
};
/** (16/11) USA's Major League Soccer (UsaMls 0x9072d0, stage −1): 32 spillerunder for 12 klubber – originalens egen kampfordeling (0x908xxx, ikke
 *  porteret) giver hver klub 32 kampe; spillet bruger en tredobbelt turnering, der stopper efter 32 runder (*estimeret*: hvem der mødes hvor tit).
 *  Kun med originalens kalender (cmCalendarOn) – den udvidede tilstand beholder databasens 2 runder. */
export const CM_LEAGUE_CUT: Record<string, { rounds: number; cut: number }> = { CM31: { rounds: 3, cut: 32 } };
/** Landets pokal i databasen: parseren valgte før den mest prestigefyldte turnering, og for Portugal/Japan er det SUPERpokalen
 *  (Supertaça / Super Cup) – ikke Taça de Portugal / Kejserens pokal (spillerrapport #26/#27) */
const SUPER_TO_CUP: Record<string, string> = { 'Portuguese Super Cup': 'Portuguese Cup', 'Japanese Super Cup': 'Japanese Cup' };
export const cmCupName = (name: string): string => SUPER_TO_CUP[name] ?? name;

/** Op-/nedrykning fra ligaklassernes opsætning (+0xbe automatisk op, +0xbf playoff, +0xc0 nedryknings-playoff, +0xc1 ned): Danish Superliga
 *  0x553a00 (3 runder, +0xc1 = 2 – originalens tabel har stregen efter 10.), 1st Division 0x5523b0 (+0xbe = 2, +0xc1 = 3), 2nd Division 0x554b60
 *  (+0xbe = 3, +0xc1 = 4 – ned i "A Lower Division", cmNonLeague.ts; databasens 3 op passer), England Second
 *  Division 0x576780 (+0xbe 2, +0xbf 4, +0xc1 4) og Third Division 0x5780c0 (+0xbe 3, +0xbf 4, +0xc1 1). Databasens regler (parseren) sagde 3/3 for
 *  alle. England: play-off-vinderen tælles med som oprykker (3. → 2.: 3 + 1 = 4) i ældre spil; spil startet med play-off'en (g.cmPlayoff) får
 *  originalens +0xbe og play-off'en (cmPlayoffRules nedenfor). */
const CM_ZONE_RULES: Record<string, { relegated?: number; promoted?: number }> = {
  CM4: { relegated: 2 }, CM5: { promoted: 2 }, CM9: { relegated: 4 }, CM10: { promoted: 4 },
};
export function cmLeagueRules<T extends Record<string, any> | undefined>(rules: T): T {
  if (!rules) return rules;
  const out: Record<string, any> = { ...rules };
  for (const [id, o] of Object.entries(out)) if (o?.cup && SUPER_TO_CUP[o.cup]) out[id] = { ...o, cup: SUPER_TO_CUP[o.cup] };
  for (const [id, o] of Object.entries(CM_ROUND_RULES)) if (out[id]) out[id] = { ...out[id], ...o };
  for (const [id, o] of Object.entries(CM_ZONE_RULES)) {
    if (!out[id]) continue;
    const r = { ...out[id] };
    if (o.relegated !== undefined && r.relegated) r.relegated = o.relegated;
    if (o.promoted !== undefined && r.promoted) r.promoted = o.promoted;
    out[id] = r;
  }
  return out as T;
}

/** (22/11) De engelske divisioners play-off (League stage 0): advance_stage vt+0x28 (First 0x572ff0, Second 0x5769e0, Third 0x578330) går fra
 *  stage −1 til 0, når ligaen er spillet færdig, og kalder 0x573080 / 0x576a70 / 0x5783c0: (s8)+0xbf = 4 deltagere fra tabellen +0xb1 i rækkefølgen
 *  First/Second [6., 3., 5., 4.], Third [7., 4., 6., 5.], rundetabellen create_schedule(stage 0) (data/cmCupTables.ts ENG_PO1/2/3) og en Cup
 *  0x522e00 med ligaen som turnering. Ligaklassernes +0xbe (automatisk op) = First/Second 2, Third 3 (cmBoardGame.ts ENG_ZONES) – play-off-vinderen
 *  er den sidste oprykker (season.ts promotionRelegation, PO-<liga>). Kun spil startet med modulet (g.cmPlayoff – newgame.ts; save.ts). */
const CM_PLAYOFF: Record<string, { promoted: number; seeds: number[]; cm: string }> = {
  CM8: { promoted: 2, seeds: [6, 3, 5, 4], cm: 'ENG_PO1' }, CM9: { promoted: 2, seeds: [6, 3, 5, 4], cm: 'ENG_PO2' }, CM10: { promoted: 3, seeds: [7, 4, 6, 5], cm: 'ENG_PO3' },
};
export function cmPlayoffRules<T extends Record<string, any> | undefined>(rules: T): T {
  if (!rules) return rules;
  const out: Record<string, any> = { ...rules };
  for (const [id, o] of Object.entries(CM_PLAYOFF)) {
    const r = out[id];
    if (!r?.above || !out[r.above]) continue;
    out[id] = { ...r, promoted: o.promoted, playoff: { seeds: o.seeds.map((p) => [id, p]), format: 'semis', winnerTo: r.above, cm: o.cm } };
  }
  return out as T;
}

/** Skemaet for en liga i sæsonen `year` (create_schedule med comp +0x40 = year); null = ligaen har ikke originalens skema her */
export function cmLeagueSchedule(compId: string, year: number): CmRound[] | null {
  const tpl = CM_SCHEDULES[compId];
  if (!tpl) return null;
  // (runde 10D) variant efter året (gen_all.py's nøgle) eller årets egen gren i koden
  const leap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const wd1712 = cmWeekday(`${year}-12-17`), cal = cmWeekday(`${year}-01-01`) * 4 + (leap(year) ? 2 : 0) + (leap(year + 1) ? 1 : 0);
  const KEY: Record<string, number> = { none: 0, wd1712, parity: year % 2, wd0101: cmWeekday(`${year + 1}-01-01`), cal, 'parity+wd1712': (year % 2) * 10 + wd1712, 'parity+cal': (year % 2) * 100 + cal };
  const v: SchedVar = tpl.years[year] ?? tpl.var[KEY[tpl.key] ?? 0] ?? {};
  const all = 'all' in v && Array.isArray(v.all) ? (v.all as [SchedRound[], SchedTv[][]]) : null;
  const rounds = all ? all[0] : tpl.rounds, tvs = all ? all[1] : tpl.tv;
  return rounds.map((base, i) => {
    const [r, tv] = (!all && (v as Record<string, [SchedRound, SchedTv[]]>)[i]) || [base, tvs[i]];
    return { date: cmDate(r[0], r[1], year + r[2], r[3]), slot: r[4], tv };
  });
}

/** FA Cup-rundens kampdato: spillets runde `round` af `total` (sidste = finalen) ↔ originalens runde talt fra finalen */
export function cmFaCupDate(nation: number, round: number, total: number, year: number): string | null {
  if (nation01(nation) !== ENGLAND) return null;
  const r = CM_FA_CUP[CM_FA_CUP.length - 1 - (total - round)];
  return r ? cmDate(r[0], r[1], year + r[2], r[3]) : null;
}

// ---------------------------------------------------------------- FIXTURE_MANAGER (add_fixture 0x5aa680 / find_new_fixture_date 0x5ab510)

/** fixture +0x3a (kamptypen – se gameInputs.ts fixtureCodesOf): liga 2, pokal 4 (6 fra kvartfinalen), playoff 5, Europa 8, venskabskamp 1 */
function fixtureType(g: GameState, f: Fixture): number {
  // (runde 10C) kampe oprettet efter originalens rundetabel har deres egen +0x3a
  if (f.cm) return f.cm.b3a;
  const c = g.comps[f.comp];
  if (!c) return 1;
  if (c.type === 'league') return 2;
  if (c.type === 'playoff') return 5;
  if (c.type === 'continental') return 8;
  return f.stage === 'QF' || f.stage === 'SF' || f.stage === 'F' ? 6 : 4;
}

/** holdenes andre kampe fra dag `lo` til `hi` efter `date` (begge med) */
function clubFixtures(g: GameState, f: Fixture, date: string, lo: number, hi: number, clubs = [f.home, f.away]): Fixture[] {
  const out: Fixture[] = [];
  for (let k = lo; k <= hi; k++) {
    for (const id of fixturesOn(addDays(date, k))) {
      const o = g.fixtures[id];
      if (o && o.id !== f.id && (clubs.includes(o.home) || clubs.includes(o.away))) out.push(o);
    }
  }
  return out;
}

/** sammenstød for kampen på `date` (0x5ad780: dagen før, samme dag, dagen efter; −2 i anden gennemgang) → [kampene, værste kode] */
function clashes(g: GameState, f: Fixture, date: string, strict: boolean): [Fixture[], number] {
  const list = clubFixtures(g, f, date, strict ? -2 : -1, 1);
  return [list, list.reduce((m, o) => Math.max(m, fixtureType(g, o)), 0)];
}

/** 0x5af2f0: tidspunktet for en ugedag (England: lørdag/søndag eftermiddag, ellers aften) */
const slotFor = (wd: number) => (wd === 5 || wd === 6 ? 1 : 2);

function moveFixture(f: Fixture, date: string, slot?: number): void {
  if (f.date !== date) { unindexFixture(f.id, f.date); f.date = date; indexFixture(f.id, date); }
  if (slot !== undefined) f.slot = slot;
}

// ---------------------------------------------------------------- (22/11) sammenstødsreglen 0x5ad780/0x5adba0 som originalen (g.cmClash)

/** spillet er startet med originalens sammenstødsregel (find_fixture_clashes 0x5ad780 + 0x5adba0, add_fixture 0x5aa680's grene, 0x5ab510's vinduer
 *  pr. kamptype, resolve_same_day_clash 0x5ae380 og landsholdenes udtagelser 0x7771c0/0x776fc0) – nye spil (newgame.ts); ældre spil beholder den
 *  forenklede regel nedenfor */
export const cmClashOn = (g: GameState): boolean => cmCalendarOn(g) && g.cmClash === 1;

/** en landskamp (fixture med landsholdene som hold – NationalTeams' kampe): hjemme/ude = landene (club +0x53 → 0x53b3d0 = A-landsholdet;
 *  U21-kampen 0x7e6720 er en kopi af A-kampen med +0x4d | 0x200, samme hold), +0x3a 9 (venskabskamp/U21) eller 10, turneringens id */
export interface CmIntlFx { d: string; h: number; a: number; type: number; comp: number }
/** landskampene på en dato (cmIntl.ts registrerer kilden: venskabskampene, U21-kampene, EM-kvalifikationen) */
export const calIntl: { on: ((g: GameState, d: string) => CmIntlFx[]) | null; compRep: ((g: GameState, comp: string) => number) | null } = { on: null, compRep: null };

/** 0x76d940: slutrundernes turneringer ([0x9cf79c]… = 404 VM, 405 OL, 406 EM, 407 Copa América, 408 Afrikamesterskabet, 399 Asian Cup, 402 Oceanien,
 *  398, 403 Confederations Cup) */
const FINALS_COMPS = new Set([404, 405, 406, 407, 408, 399, 402, 398, 403]);
export const cmIntlFinalsComp = (comp: number) => FINALS_COMPS.has(comp);

/** klubbens omdømme club +0x80 */
const clubRep80 = (g: GameState, club: number) => g.cmClubRep?.[club] ?? Math.round((g.clubs[club]?.rep ?? 0) * 100);
const nationName = (g: GameState, n: number | undefined) => (n === undefined || n < 0 ? '' : g.nations[n]?.name ?? '');
/** fixture +0x18: stadionet (hjemmeklubbens +0x69 → cmCrowd[3]); neutral bane (+0x3c) – stadionet kendes ikke hos os */
const stadiumOf = (g: GameState, f: Fixture) => (f.cm?.b3c ? -1 : g.cmCrowd?.[f.home]?.[3] ?? -1);
/** fixture +0 = turneringens id (gameInputs.ts CM_COMP_ID – registreres derfra) */
let compIdOf: (g: GameState, comp: string) => number = () => -1;
export const setCalCompId = (fn: (g: GameState, comp: string) => number) => { compIdOf = fn; };
/** fixture +0x30 → 0x4b0850: rundens ben-kode (w30 < 1000 ? w30 % 10 : 0 – 3/4 = første/andet ben) */
const legCode = (f: Fixture) => { const w = f.cm?.w30 ?? 0; return w < 1000 ? w % 10 : 0; };
/** turneringens vt+0x60(F, O): 0x48e360 = (0x4b0850(F +0x30) = 0) – Champions League og UEFA Cup (0x5839d0) altid 0 */
const vt60 = (g: GameState, f: Fixture) => { const id = compIdOf(g, f.comp); return id !== 326 && id !== 328 && legCode(f) === 0; };
/** 0x5c6710: venskabsturneringen */
const isFriendly = (f: Fixture) => f.comp === 'FRIENDLY';

/** 0x7771c0 (NationalTeams, fra daily_update 0x76b100 for landskampene på i dag + 14 dage, efter udtagelsen 0x76bab0): landsholdets liste
 *  (club +0xd7, 50 pladser – qsort 0x778ef0 efter spillernes klub-id, uden klub sidst) gennemgås klub for klub; for hver ny klub skrives den
 *  forrige klubs antal i tabellen [this+0x20][klub] (9-byte poster: dato + antal, lagt sammen ved samme dato, sorteret efter datoen) – kun klubber
 *  (ikke landshold), hvis land er indlæst (+0x11c) og ikke er Brasilien [0x9cf260]. Den sidste klub i listen skrives aldrig (løkken slutter ved
 *  0x77748b uden at tømme den). Datoen: kampens, én dag før for U21-holdet (0x5409b0) og 'B' (flag 1). */
export function cmCallupRecord(g: GameState, ids: number[], date: string): void {
  if (!cmClashOn(g)) return;
  const tab = (g.cmCallup ??= {});
  const flush = (club: number, n: number) => {
    const c = g.clubs[club];
    if (!c || !nationLoaded(g, c.nation) || nationName(g, c.nation) === 'Brazil') return;
    const rows = (tab[club] ??= []);
    const r = rows.find((x) => x[0] === date);
    if (r) r[1] = (r[1] + n) & 0xff;
    else { rows.push([date, n]); rows.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); }
  };
  const list = ids.slice().sort((a, b) => (g.players[a]?.club || 1e9) - (g.players[b]?.club || 1e9));
  let prev = 0, n = 0;
  for (const id of list) {
    const p = g.players[id];
    if (!p) continue;
    const club = p.club || 0;
    if (club === prev) { if (prev) n++; continue; }
    if (prev) flush(prev, n);
    prev = club; n = 1;
  }
}

/** 0x7774b0 (hver 70. dag) fjerner posterne før i dag – her dagligt (kun poster fra i dag − 1 og frem kan tælle i 0x776fc0) */
export function cmCallupDaily(g: GameState): void {
  const tab = g.cmCallup;
  if (!tab) return;
  for (const [k, rows] of Object.entries(tab)) {
    const keep = rows.filter((r) => r[0] >= g.date);
    if (keep.length) tab[+k] = keep; else delete tab[+k];
  }
}

/** 0x776fc0(F): venskabskampe altid; ellers må hverken hjemme- eller udeholdet have mere end 2 udtagne spillere dagen før, samme dag eller dagen
 *  efter (summen af tabellens poster – klubber, ikke landshold) */
function callupOk(g: GameState, f: Fixture, date: string): boolean {
  if (isFriendly(f)) return true;
  const lo = addDays(date, -1), hi = addDays(date, 1);
  for (const club of [f.home, f.away]) {
    let n = 0;
    for (const [d, c] of g.cmCallup?.[club] ?? []) if (d >= lo && d <= hi) n = (n + c) & 0xff;
    if (n > 2) return false;
  }
  return true;
}

/** en anden kamp O i sammenstødslisten: en klubkamp eller en landskamp (kun koden – landskampe flyttes aldrig af klubkampe) */
type ClashO = { fx: Fixture } | { intl: CmIntlFx };

/** fixturens "region" (0x48dd70 – nøglelandstabellens +0x14): 0x5ad780 gennemgår regionerne 0..6 (verdensdelene) før landene; inden for en region
 *  tidspunkterne 0..2 og listernes rækkefølge (her: id – listen genopbygges ved indlæsning) */
const regionRank = (g: GameState, f: Fixture) => (g.comps[f.comp]?.meta?.cmEuro || g.comps[f.comp]?.type === 'continental' ? 3 : 7);

/** 0x5adba0(F, &kode, liste, regioner, n, &dato, k): dagen dato + k for kampen F (F's +0x28/+0x2a = `date`) */
function clashDay(g: GameState, f: Fixture, date: string, k: number, out: ClashO[], code: { v: number }): void {
  const D = addDays(date, k);
  const type = fixtureType(g, f);
  // 0x5adc3b: venskabskampe (+0x3a = 1) – kun samme dag
  if (type === 1 && k !== 0) return;
  const set13 = () => { if (code.v < 0x13) code.v = 0x13; };
  const cn = nationName(g, g.comps[f.comp]?.nation);
  if (k === 0) {
    // 0x5adc66: juledag (Date(25, 11, år)) – ikke Japans turneringer [0x9cf36c]
    if (D.slice(5) === '12-25' && cn !== 'Japan') { set13(); return; }
    // 0x5adcca: Nordirlands turneringer [0x9cf3e4] spiller ikke om søndagen
    if (cn === 'Northern Ireland' && cmWeekday(D) === 6) { set13(); return; }
    // 0x5adcf7: Grækenlands [0x9cf31c] påske – 10/4 < D < 20/4
    if (cn === 'Greece' && D.slice(5) > '04-10' && D.slice(5) < '04-20') { set13(); return; }
    // 0x5adda4: klubber fra Norge [0x9cf408] spiller ikke 17/5
    if (D.slice(5) === '05-17' && [f.home, f.away].some((c) => nationName(g, g.clubs[c]?.nation) === 'Norway')) { set13(); return; }
  }
  const add = (o: ClashO, t: number, played: boolean) => {
    if (played) { code.v = 0x16; return; }
    out.push(o);
    if (t > code.v) code.v = t;
  };
  // landskampene (regionerne 0/1 – før verdensdelene og landene): 0x5ae074–0x5ae0e9 – landsholdet for et af holdenes land (club +0x53 →
  // 0x53b3d0) spiller; 0x5ae25f: et af holdene har omdømme > 5000 og turneringens vt+0x60(F, O) → O i listen med sin type (spillet → 0x16)
  const nh = g.clubs[f.home]?.nation, na = g.clubs[f.away]?.nation;
  for (const o of calIntl.on?.(g, D) ?? []) {
    const c1 = !cmIntlFinalsComp(o.comp) && Math.abs(k) < 2 && type < 5 && o.h === nh;
    if (!(c1 || o.h === na || o.a === nh || o.a === na)) continue;
    if (!(clubRep80(g, f.home) > 5000 || clubRep80(g, f.away) > 5000) || !vt60(g, f)) continue;
    add({ intl: o }, o.type, false);
  }
  // 0x5ade1d–0x5ae2fb: regionerne, tidspunkterne 0..2, listen
  const fx = fixturesOn(D).map((id) => g.fixtures[id]).filter((o): o is Fixture => !!o && o.id !== f.id)
    .sort((a, b) => regionRank(g, a) - regionRank(g, b) || (a.slot ?? 1) - (b.slot ?? 1) || a.id - b.id);
  const fs = k === 0 ? stadiumOf(g, f) : -1;
  for (const o of fx) {
    // 0x5adea5: samme klub og samme hold (+0x40/+0x41 – alle spillets kampe er førsteholdenes: 1/1)
    if (o.home === f.home || o.home === f.away || o.away === f.home || o.away === f.away) { add({ fx: o }, fixtureType(g, o), !!o.result); continue; }
    // 0x5adfbf: samme dag på samme stadion (ikke turneringen [0x9cf76c] = 390)
    if (k === 0 && fs >= 0 && stadiumOf(g, o) === fs && compIdOf(g, o.comp) !== 390 && compIdOf(g, f.comp) !== 390) {
      if (o.result) { code.v = 0x16; continue; }
      out.push({ fx: o });
      const ot = fixtureType(g, o);
      if ((o.slot ?? 1) === (f.slot ?? 1)) { if (ot === 1) { if (code.v < 1) code.v = 1; } else if (code.v === 0) code.v = 0x14; }
      else if (ot !== 1) { if (code.v === 0) code.v = 0x14; }
      else if (type !== 1 && code.v === 0) code.v = 1;
      continue;
    }
    // 0x5ae0f3: USA (MLS-turneringen [0x9cf590] = 31 og [0x9cf690] = 90) – klubkampe uden for USA har ingen af dem
    const lg = (c: number) => g.clubs[c]?.league;
    if (compIdOf(g, o.comp) === 90 && (lg(f.home) === 'CM31' || lg(f.away) === 'CM31')) { code.v = 0x13; continue; }
    if (compIdOf(g, f.comp) === 90 && (lg(o.home) === 'CM31' || lg(o.away) === 'CM31')) { out.push({ fx: o }); const ot = fixtureType(g, o); if (ot > code.v) code.v = ot; }
  }
}

/** 0x5ad780 find_fixture_clashes(F, &kode, flag): dagene −2 (flag; kun +0x3a < 0x17), −1 (kun +0x3a < 0x17), 0, +1 og −2 (flag) igen; flaget
 *  nulstilles for Europas/Sydamerikas turneringer (0x48dd70 = 3/5), undtagen [0x9cf7bc] = 104. Intet sammenstød: 0x776fc0(F) = 0 → kode 0x15. */
function cmClashes(g: GameState, f: Fixture, date: string, flag: boolean): { list: ClashO[]; code: number } {
  const type = fixtureType(g, f);
  if (flag && regionRank(g, f) === 3 && compIdOf(g, f.comp) !== 104) flag = false;
  const out: ClashO[] = [], code = { v: 0 };
  if (type < 0x17) { if (flag) clashDay(g, f, date, -2, out, code); clashDay(g, f, date, -1, out, code); }
  clashDay(g, f, date, 0, out, code);
  clashDay(g, f, date, 1, out, code);
  if (flag) clashDay(g, f, date, -2, out, code);
  if (code.v === 0) return { list: [], code: callupOk(g, f, date) ? 0 : 0x15 };
  return { list: out, code: code.v };
}

/** 0x5ab510's vinduer pr. kamptype (+0x3a): [start, slut] – null = ingen søgning (venskabskamp, 3, 9) */
function searchWindow(g: GameState, f: Fixture, type: number): [string, string] | null {
  const F = f.date;
  switch (type) {
    case 2: {
      // fixture +0x24/+0x26 = sidste rundes dato (0 → fejlbeskeden + F + 2 uger); start F + 4 uger, når den ligger mere end 20 uger efter F
      const last = (g.comps[f.comp]?.meta?.cmLast as string | undefined) ?? addDays(F, 14);
      return [last > addDays(F, 140) ? addDays(F, 28) : addDays(F, 3), last];
    }
    case 4: case 6: return [addDays(F, 3), addDays(F, 14)];
    case 5: return [F, addDays(F, 7)];
    case 7: case 8: case 10: return [addDays(F, -3), addDays(F, 7)];
    default: return null;
  }
}

/** 0x5ab510 find_new_fixture_date som originalen: to gennemgange (anden med 0x5ad780's flag) × ugedagene ons, tir · lør, søn · man, tor, fre × cur fra
 *  vinduets start i skridt på 4 dage, så længe slut > cur: D = nærmeste ugedag, i dag + 2 ≤ D ≤ slut → dato D og tidspunktet 0x5af2f0; godtaget uden
 *  sammenstød, ved kode 1 eller type > kode. Ellers max(F, i dag) + 2 dage (tidspunktet bliver det sidst prøvede). IKKE porteret: 0xae2a48-listen for
 *  dobbeltkampe (+0x30 % 10 = 3/4 → 0x522c70 i 0x5aaf00). */
function findNewDate(g: GameState, f: Fixture): void {
  const F = f.date, type = fixtureType(g, f), win = searchWindow(g, f, type);
  const today = todayOf(g), earliest = addDays(today, 2);
  if (win) {
    const [start, last] = win;
    for (let pass = 0; pass < 2; pass++) {
      for (const group of WD_ORDER) {
        for (const wd of group) {
          for (let cur = start; last > cur; cur = addDays(cur, 4)) {
            const D = nearestWeekday(cur, wd);
            if (earliest > D || D > last) continue;
            f.slot = slotFor(wd);
            const { list, code } = cmClashes(g, f, D, pass === 1);
            if ((!list.length && code === 0) || code === 1 || type > code) { moveFixture(f, D); return; }
          }
        }
      }
    }
  }
  moveFixture(f, addDays(F > today ? F : today, 2));
}

/** "i dag" for FIXTURE_MANAGER ([0xae2c90]): spillets dato – ved et nyt spil opretter create_game ligaernes kampe på databasens dato (1/1, før
 *  forkørslen 0x5cc850), hos os sættes den med cmWithCalToday omkring setupSeasonComps (newgame.ts) */
let calToday: string | null = null;
const todayOf = (g: GameState) => calToday ?? g.date;
export function cmWithCalToday<T>(date: string, fn: () => T): T {
  const prev = calToday;
  calToday = date;
  try { return fn(); } finally { calToday = prev; }
}

/** add_fixture 0x5aa680's vagt [0xae2a40]: højst 10 sammenstød pr. kald udefra (arg 2 = 1 nulstiller) */
let clashGuard = 0;

/** 0x5ae380 resolve_same_day_clash(F, liste) (kode 0x14 – samme stadion samme dag): den første kamp O i listen; den anden ugedag for O's dag
 *  (man → søn, tir → ons, ons → tir, tor → ons, fre → lør, lør → søn, søn → lør) – vigtigst er turneringens omdømme (+0x69, +0x15 for landshold),
 *  ved lighed hjemmeholdets +0x80: F vigtigst og O uspillet → O flyttes, ellers F; et sammenstød på den nye dag → 0x5ab510 (en venskabskamp/type 1
 *  droppes), så add_fixture og nyheden 0x5aac70. */
function resolveSameDay(g: GameState, f: Fixture, o: Fixture): void {
  const ALT = [6, 2, 1, 2, 5, 6, 5];
  const alt = nearestWeekday(o.date, ALT[cmWeekday(o.date)]);
  const pf = calIntl.compRep?.(g, f.comp) ?? 0, po = calIntl.compRep?.(g, o.comp) ?? 0;
  const fFirst = (pf > po || (pf === po && clubRep80(g, f.home) > clubRep80(g, o.home))) && !o.result;
  const [mv, keep] = fFirst ? [o, f] : [f, o];
  // 0x5ae4f3–0x5ae507: O fjernes (0x5abc30) og F lægges (add_fixture(F, 0)), før O's nye dato prøves
  if (fFirst) { unindexFixture(o.id, o.date); placeFixture(g, f, false); }
  const { list } = cmClashes(g, mv, alt, false);
  if (list.length) {
    if (fixtureType(g, mv) === 1) { dropFixture(g, mv); return; }
    moveFixture(mv, alt);
    findNewDate(g, mv);
  } else moveFixture(mv, alt);
  placeFixture(g, mv, false);
  cmMovedNews(g, mv, keep);
}

/** 0x5abc30 uden ny dato: kampen fjernes (venskabskampe/reservekampe, der ikke kan lægges – 0x5aa92a/0x5aa964) */
function dropFixture(g: GameState, f: Fixture): void {
  unindexFixture(f.id, f.date);
  delete g.fixtures[f.id];
  const c = g.comps[f.comp];
  if (c) { c.pending = Math.max(0, c.pending - 1); for (const t of c.ties) t.fx = t.fx.filter((x) => x !== f.id); }
}

/** add_fixture 0x5aa680(F, nulstil) som originalen. */
function placeFixture(g: GameState, f: Fixture, reset: boolean): void {
  if (reset) clashGuard = 0;
  // 0x5aa6c1–0x5aa729: kampens dato er i dag eller før, og den er ikke spillet → 0x5ab510
  if (f.date <= todayOf(g) && !f.result) findNewDate(g, f);
  // 0x5aa882: højst 10 sammenstød
  if (clashGuard < 10) {
    const { list, code } = cmClashes(g, f, f.date, false);
    if (list.length || code) {
      clashGuard++;
      const type = fixtureType(g, f);
      // 0x5aa8bc: samme stadion samme dag → 0x5ae380
      if (code === 0x14) { const o = list.find((x): x is { fx: Fixture } => 'fx' in x); if (o) resolveSameDay(g, f, o.fx); return; }
      // 0x5aa935: koden ≥ kampens type → kampen selv flyttes (0x7e6f20: en reserveturnering droppes) og lægges igen
      if (code >= type) { findNewDate(g, f); placeFixture(g, f, false); return; }
      // 0x5aa988: kampen lægges (0x5ab230), og de andre flyttes: venskabskampe 0x5c6570 (aflyses), type 9 (landsholdenes venskabskampe) 0x5abc30,
      // ellers 0x5abc30 + 0x5ab510 + add_fixture(kopien, 0) + nyheden 0x5aac70(kopien, F, 0)
      const at = list.map((x) => ('fx' in x ? x.fx.date : ''));
      for (const [i, x] of list.entries()) {
        if (!('fx' in x)) continue;
        const o = x.fx;
        // listen er kopier: en kamp, der allerede er flyttet (af et tidligere add_fixture i løkken), findes ikke af 0x5abc30 → ingen ny dato
        if (!g.fixtures[o.id] || o.result || o.date !== at[i]) continue;
        if (isFriendly(o)) {
          // 0x5c6570(O, 0): nyheden "friendly cancelled" (0x77bbe0 → 0x7861e0 til begge klubbers manager) og kampen slettes
          const H = g.clubs[o.home], A = g.clubs[o.away];
          if (H && A) for (const c of [o.home, o.away]) asOwner(c, () => addNews({ cat: 'match', key: 'cmfr.cancelled', params: { home: H.name, away: A.name, date: o.date } }));
          dropFixture(g, o);
          continue;
        }
        if (fixtureType(g, o) === 9) { dropFixture(g, o); continue; }
        findNewDate(g, o);
        placeFixture(g, o, false);
        cmMovedNews(g, o, f);
      }
    }
  }
  // 0x5aaa74–0x5aab27: kampen er lagt → 0x48dd70 = 3/5 → 0x5ae9d0
  if (g.comps[f.comp]?.meta?.cmEuro) cmEuroClubMoves(g, f);
}

/** 0x5ab510 (ligakampe, type 2): søgningen fra F + 3 dage (F + 4 uger, når sidste runde ligger mere end 20 uger efter F) til sidste
 *  rundes dato i 4-dages skridt, ugedagene i rækkefølgen ons/tir · lør/søn · man/tor/fre, to gennemgange; ellers max(F, i dag) + 2 dage */
const WD_ORDER = [[2, 1], [5, 6], [0, 3, 4]];
export function cmFindNewDate(g: GameState, f: Fixture): void {
  if (cmClashOn(g)) { findNewDate(g, f); return; }
  const F = f.date;
  const last = (g.comps[f.comp]?.meta?.cmLast as string | undefined) ?? addDays(F, 14);
  const start = last > addDays(F, 140) ? addDays(F, 28) : addDays(F, 3);
  const earliest = addDays(g.date, 2);
  const type = fixtureType(g, f);
  for (let pass = 0; pass < 2; pass++) {
    for (const group of WD_ORDER) {
      for (const wd of group) {
        for (let cur = start; last > cur; cur = addDays(cur, 4)) {
          const D = nearestWeekday(cur, wd);
          if (earliest > D || D > last) continue;
          const [list, code] = clashes(g, f, D, pass === 1);
          if (!list.length || code === 1 || type > code) { moveFixture(f, D, slotFor(wd)); return; }
        }
      }
    }
  }
  moveFixture(f, addDays(F > g.date ? F : g.date, 2));
}

/** add_fixture 0x5aa680 (0x5aa890–0x5aaa64): et sammenstød med en kode ≥ kampens type → kampen selv flyttes; ellers bliver den, og de
 *  andre kampe flyttes (0x5abc30 + 0x5ab510 + add_fixture) */
export function cmPlaceFixture(g: GameState, f: Fixture): void {
  if (cmClashOn(g)) { placeFixture(g, f, true); return; }
  const [list, code] = clashes(g, f, f.date, false);
  if (list.length) {
    if (code >= fixtureType(g, f)) cmFindNewDate(g, f);
    else for (const o of list) if (g.comps[o.comp]?.meta?.cmSched) cmFindNewDate(g, o);
  }
  // 0x5aaa74–0x5aab27: kampen er lagt (også efter 0x5ab510 + det nye add_fixture 0x5aa978) → 0x48dd70 = 3/5 → 0x5ae9d0
  if (g.comps[f.comp]?.meta?.cmEuro) cmEuroClubMoves(g, f);
}

/** nation +0x11c: landet er indlæst (Select League(s) = g.activeNations) */
const nationLoaded = (g: GameState, n: number | undefined) => n !== undefined && n >= 0 && (g.activeNations?.length ? g.activeNations.includes(n) : true);

/** 0x5ae9d0 (fra add_fixture 0x5aab27, når 0x48dd70(turneringen, kampen) = 3 eller 5 – turneringer uden land med verdensdelen Europa
 *  (indgang 3 i 0xb63d60) eller Sydamerika (5); spillets Europa-turneringer = cmEurope): for hjemme- og udeholdet (landet indlæst, +0x53 →
 *  +0x11c) – klubbens kamp 2 dage før (0x54c8e0(2) + 0x5acbe0, førsteholdet, ikke venskabskamp, uspillet +0x43 = 0xff) flyttes til 3 dage
 *  før, og kampen 2 dage efter (0x54c5b0(2); intet spillet-tjek) til 3 dage efter, når den nye dato ikke giver andre sammenstød end den gamle
 *  kamp selv (0x5ad780(kopien, flag 0)) → 0x5abc30 + add_fixture(kopien); tidspunktet +0x3f følger med. (UEFA Cup torsdag → lørdagens
 *  ligakamp søndag, tirsdagens mandag; Champions League tirsdag → søndagens lørdag.) Nyheden: 0x5aac70 (cmMovedNews). */
function cmEuroClubMoves(g: GameState, f: Fixture): void {
  for (const club of [f.home, f.away]) {
    if (!nationLoaded(g, g.clubs[club]?.nation)) continue;
    for (const [k, to] of [[-2, -3], [2, 3]] as const) {
      // 0x5acbe0: dagens kampe tidspunkt for tidspunkt (0..2) – den første
      const o = clubFixtures(g, f, f.date, k, k, [club]).sort((a, b) => (a.slot ?? 1) - (b.slot ?? 1))[0];
      // 0x5c6710: venskabskampene (cmFriendlyOffers.ts FRIENDLY_COMP – ikke importeret: competitions.ts ↔ cmCalendar.ts)
      if (!o || o.comp === 'FRIENDLY' || (k < 0 && o.result)) continue;
      const D = addDays(f.date, to);
      const on = cmClashOn(g);
      if (on ? cmClashes(g, o, D, false).list.length : clashes(g, o, D, false)[0].length) continue;
      moveFixture(o, D);
      if (on) placeFixture(g, o, false); else cmPlaceFixture(g, o);
      // 0x5aec32/0x5aedec: 0x5aac70(kopien efter add_fixture, Europa-kampen, 0)
      cmMovedNews(g, o, f);
    }
  }
}

// ---------------------------------------------------------------- tv-flytningerne (0x685640)

/** Dagen (sim.ts newDay): for hver liga med originalens skema – skemaets række på i dag + 4 uger får sine tv-kampe */
export function cmCalendarDay(g: GameState): void {
  if (!cmCalendarOn(g)) return;
  const target = addDays(g.date, 28);
  for (const c of Object.values(g.comps)) {
    if (c.type !== 'league' || !c.meta?.cmSched || c.finished) continue;
    const sched = cmLeagueSchedule(c.id, c.meta.cmYear as number);
    const row = sched?.find((r) => r.date === target);
    if (row?.tv.length) tvMoves(g, c.id, row);
  }
}

function tvMoves(g: GameState, comp: string, row: CmRound): void {
  // 0x5abd90: rundens kampe i turneringen på dagen og tidspunktet
  let list = fixturesOn(row.date).map((id) => g.fixtures[id]).filter((f): f is Fixture => !!f && f.comp === comp && !f.result && (f.slot ?? row.slot) === row.slot);
  const E = row.date;
  const rand = cmRand(g.seed ?? 0, daysBetween('2001-01-01', g.date), 0x685640);
  const rep = (club: number) => g.cmClubRep?.[club] ?? Math.round((g.clubs[club]?.rep ?? 0) * 100);
  for (const [wd, slot, kind] of row.tv) {
    if (slot < 0 || slot > 2 || !list.length) continue;
    const D = nearestWeekday(E, wd);
    // 0x6858b4–0x685964: tv-dagen efter datoen → [E + 2, E + 5], ellers [E − 5, E − 2]
    const [lo, hi] = D > E ? [2, 5] : [-5, -2];
    let best: Fixture | null = null, top = -1;
    for (const f of list) {
      let s = kind === 3 ? 50 : rand(rep(f.away) + 1500) + rand(rep(f.home));
      if (kind !== 3 && (clubFixtures(g, f, E, lo, hi, [f.home]).length || clubFixtures(g, f, E, lo, hi, [f.away]).length)) s = 0;
      if (s > top) { top = s; best = f; }
    }
    if (!best) continue;
    const d0 = best.date, t0 = best.slot ?? row.slot;
    moveFixture(best, D, slot);
    // 0x685ab7: tv-pladsens art 3 giver ingen nyhed; ellers type 3 til begge klubbers manager (0x7861e0 – kun et menneske)
    if (kind !== 3) cmTvNews(g, best, d0, t0, slot);
    // 0x685c4a: fixture +0x3b = tv-pladsens art (process_match_income 0x59aab1: tv-pengene; 0x85d618: tilskuerne)
    best.tv = kind;
    // 0x685c79: add_fixture(kampen, 1) på den nye dato – et sammenstød flytter den eller de andre (g.cmClash)
    if (cmClashOn(g)) placeFixture(g, best, true);
    list = list.filter((f) => f !== best);
  }
}

/** nyhedens felter for kampen: korte (+0x38) og lange navne (+4), turneringen + etape/runde (0x4bfa30's fixture +0x32/+0x30) */
function fixParams(g: GameState, f: Fixture) {
  const H = g.clubs[f.home], A = g.clubs[f.away];
  return { home: H?.short ?? '', away: A?.short ?? '', homeL: H?.name ?? '', awayL: A?.name ?? '', fc: g.comps[f.comp]?.name ?? '', fs: f.cm?.w32 ?? 0, fr: f.cm?.w30 ?? 0 };
}

/** 0x685ac1–0x685c10: NewsItem type 3 [hjemme, ude, turnering, +0x32, +0x30, gammel dag/år, gammelt tidspunkt +0x3f, ny dag/år, nyt tidspunkt, art]
 *  til hjemme- og udeholdets manager. Teksten 0x77c46a: overskrift a68f7c "{h} vs {a} match televised"; brødtekst efter dagen (plads 8 ≠ 5)
 *  a690f0 "moved to {dato}", ellers tidspunktet (plads 10 ≠ 7) a69044 "moved to the {morning}", ellers a68fc0 "chosen for live television coverage". */
export function cmTvNews(g: GameState, f: Fixture, d0: string, t0: number, t1: number): void {
  const body = d0 !== f.date ? 'date' : t0 !== t1 ? 'time' : 'chosen';
  const params = { ...fixParams(g, f), d1: f.date, tod: t1, body };
  for (const c of [f.home, f.away]) asOwner(c, () => addNews({ cat: 'match', key: 'cmcal.tv', params: { ...params }, link: { kind: 'fixture', id: f.id } }));
}

/** 0x5aac70 (thiscall FIXTURE_MANAGER; kampen, sammenstødet, 0): NewsItem type 1 [hjemme, ude, turnering, +0x32, +0x30, dag, år, sammenstødets
 *  hjemme/ude/turnering/+0x32/+0x30/dag/år, +0x40, +0x41] i køen +0x1128 – en post med samme hjemme, ude, turnering og +0x40/+0x41 får kun den
 *  nye dato (plads 5/6). 0x5aaf00 (hvert tidspunkt) leverer køen: +0x40 ≠ 0 → hjemmeholdets manager, +0x41 ≠ 0 → udeholdets (0x7861e0; klubkampe
 *  har 1/1). Spillet kører hele dage: køen er dagens nyheder. Tekst 0x77bfe2: overskrift a69184 "{h} vs {a} match re-arranged", brødtekst a692ec. */
export function cmMovedNews(g: GameState, f: Fixture, clash: Fixture): void {
  const E = fixParams(g, clash);
  const params = { ...fixParams(g, f), d1: f.date, home2: E.home, away2: E.away, c2: E.fc, d2: clash.date, hid: f.home, aid: f.away, cid: f.comp };
  for (const c of [f.home, f.away]) asOwner(c, () => {
    const q = gs().news.find((n) => n.key === 'cmcal.moved' && n.date === g.date && n.params.hid === f.home && n.params.aid === f.away && n.params.cid === f.comp);
    if (q) q.params.d1 = f.date;
    else addNews({ cat: 'match', key: 'cmcal.moved', params: { ...params }, link: { kind: 'fixture', id: f.id } });
  });
}

/** Datoboksens tidspunkt (originalens "14.7.01 AM": dato + "AM"/"PM"/"EVE" = spillets tidspunkt 0/1/2). Spillet kører hele dage: før dagens kampe
 *  er det formiddag (spilstarten 0x5cc850 slutter på tidspunkt 0); efter dagens spillede kampe for klubben/de fulgte turneringer det seneste
 *  kamptidspunkt. null = ikke originalens kalender. */
export function cmTimeOfDay(g: GameState): 0 | 1 | 2 | null {
  if (!cmCalendarOn(g)) return null;
  if (!g.dayDone) return 0;
  let slot = 0;
  for (const id of fixturesOn(g.date)) {
    const f = g.fixtures[id];
    if (f?.result && (f.home === g.userClub || f.away === g.userClub)) slot = Math.max(slot, f.slot ?? 1);
  }
  return slot as 0 | 1 | 2;
}
newsStamp.tod = cmTimeOfDay;
