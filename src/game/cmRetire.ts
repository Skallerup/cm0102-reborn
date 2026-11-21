// Originalens pensioneringer (PLAYER_REGEN, player_regen.cpp i cm0102.exe 3.9.68) – en CM-database i ægte tilstand: den originale (cmActive) og
// (MODERN_PARITY 11) 2026/27-opdateringen i spil startet med listen (g.cmRet fra spilstartens 0x7a58f0). Udvidet spil og ældre 2026/27-spil
// bruger stadig season.ts' retirements() ved sæsonskiftet.
//
// Listen ([0xb7434c] +4, poster à 26 bytes: +0 person, +4 klubben (−1 klubløs), +8 meldingsdatoen, +0x10 stopdatoen (dag i året + år),
// +0x18 årsagen, +0x19 meldt):
//   • build_initial_retirement_list 0x7a58f0 ved indlæsningen (check_initial_retirement 0x7a79c0 for alle med klub – databasens dato 1/1);
//   • find_new_retirements 0x7a5790 på dag 0, 80, 173 og 250 i året (is_player_regen_day 0x5d6250): check_retirement 0x7a7310, ellers
//     check_unemployed_retirement 0x7a8050 – unge (< 30) i en kørende liga, allerede meldte og kontrakter med +0x49 springes over;
//   • process_retirements 0x7a59e0 hver dag (0x5cda73, efter FinanceTable 0x59b9c0): sorteret efter næste dato (0x7ae2a0: meldingen, hvis den
//     ikke er passeret, ellers stoppet); dagen EFTER stopdatoen går han på pension (nyheden 0xbba 0x7a92e0/0x7a9650), dagen efter
//     meldingsdatoen meldes det (0xbbb 0x7aa340/0x7aa4c0); løkken stopper ved den første post, der hverken er forfalden eller kan meldes.
//   • En skade, der slutter karrieren (Injury 0x62da70/0x62dbc6 → schedule_injury_retirement 0x7a7f20): årsag 8, dato i dag + rand(dage/2) + 1.
// Årsager: 1 alder/evne/kontrakt, 2 klubløs i et kørende land (rand(25·Stamina) = 0), 8 skade, 0x10 arbejdsløs > 1 år, 0x20 stab (ikke porteret).
// Bagefter: en spiller med ikke-spillerpost (+0x69 – databasens spillere med stabsegenskaber, Staff med samme person-id) bliver stab
// (0x7a62c2: samme person, job efter 0x7aace0 – spillende manager/assistent/træner fortsætter i klubben, ellers ledig); de øvrige:
// queue_staff_for_regen 0x7a87d0 – regen'en kommer samme dag (under 30 år) eller om 1 + rand(65) dage (season.ts spawnDueRegens).
//
// *Estimeret*/ikke porteret: tilfældige tal af spillets egen talrække (cmRand); stabens pensioneringer (årsag 0x20, ikke-spillerposterne
// 0x7aaeb0/0x7ab340); 0x7a5cdb's "spilleren bliver træner" (kræver mindst 3 ledige ikke-spillerposter [this+0x20] – i oraklet 10 ved
// spilstarten og 2 fra dag 1, så grenen er død; process_regen_queue 0x7a65d0's tildeling af ledige poster til ældre spillere er ikke porteret –
// oraklet: 8 spillere på dag 1 og 14 mere i sæson 1, som stabens pensioneringer frigiver); forsikringsnyheden 0x58a980; staffState +0xb's lave bits (0); personerne uden for originalens hukommelse (0x524d70) får
// samme regler på en egen liste (st.ext), så de ikke blokerer originalens kø; for world-filer uden hukommelsesoplysningen = de ikke indlæste lande.
import type { Club, GameState, Player, RegenSeed, Staff, StaffRole } from './types';
import { cmRegenRetired, cmRegenSortQueue } from './cmRegen';
import { cmActive, cmLogic, cmRand, newCmContract, statusCode, type CmContract } from './cmPlayerData';
import { nationLoaded } from './cmFinance';
import { seasonRow } from './cmFitness';
import { regionOf } from './leagues';
import { ageOn } from './dates';
import { addNews, removePlayer } from './state';
import { asOwner, forEachHuman, isHumanClub } from './humans';
import { JOB_CODE } from './cmStaff';
import { ATTRS } from './attributes';
import { playerRecordInto } from './engine/grid/aiTeam';

export interface CmRetEntry {
  /** spillerens id */ id: number;
  /** +4 klubben (0 = klubløs; originalens −1) */ club: number;
  /** +8 meldingsdatoen og +0x10 stopdatoen: år·1000 + dag i året (0 = 1/1) */ a: number; r: number;
  /** +0x18 årsagen (1, 2, 8, 0x10) */ why: number;
  /** +0x19 meldt */ ann: 0 | 1;
}
export interface CmRetState { list: CmRetEntry[]; n?: number;
  /** de spillere, originalen ikke har i hukommelsen (0x524d70 – Player.cmMem / ikke indlæste lande): samme regler uden for listen (se hovedets liste) */
  ext?: CmRetEntry[] }

/** 2001-verdenen, eller (MODERN_PARITY 11) en CM-database i ægte tilstand fra et spil, hvis spilstart byggede listen (cmRetireInit) */
export const cmRetireOn = (g: GameState) => !g.draft && (cmActive(g) || (cmLogic(g) && g.cmRet !== undefined));

// ------------------------------------------------------------------------------------------------ datoer (Date: dag i året + år)
const D0 = (y: number) => Date.UTC(y, 0, 1) / 86400000;
const pairOf = (iso: string) => { const y = +iso.slice(0, 4); return y * 1000 + Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000 - D0(y)); };
const yearOf = (p: number) => Math.floor(p / 1000);
const dayOf = (p: number) => p % 1000;
/** 0x54cdb0 Date::days_since(this = a, b) = a − b i dage (dag 365 i et almindeligt år = 1/1 året efter) */
const daysBetween = (a: number, b: number) => D0(yearOf(a)) + dayOf(a) - (D0(yearOf(b)) + dayOf(b));
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;

// ------------------------------------------------------------------------------------------------ sæsontabellen 0xb63d60 (+0x15, +0x1d)
/** +0x15 (sæsonopdateringens dag) for nøglelandene – aflæst i oraklet (pre-0-2001.bin, 3.9.60) */
const KEY_UPD: Record<string, number> = {
  Argentina: 212, Australia: 212, Belgium: 170, Brazil: 0, Croatia: 170, Denmark: 170, England: 170, Finland: 360, France: 170, Germany: 170, Greece: 170,
  Holland: 170, 'Republic of Ireland': 170, Italy: 170, Japan: 24, 'Northern Ireland': 170, Norway: 330, Poland: 170, Portugal: 170, Russia: 360,
  Scotland: 170, 'South Korea': 19, Spain: 170, Sweden: 360, Turkey: 170, 'United States': 50, Wales: 170,
};
/** verdensdelenes rækker 3–7 (+0x15, +0x1d) og række 0 (fejlgrenen i 0x669360) */
const ROW0: Row = [205, 2];
const CONT_ROW: Record<string, Row> = { europe: [171, 1], northAmerica: [51, 1], southAmerica: [9, 1], asia: [239, 1], oceania: [201, 1] };
const OCEANIA = new Set(['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa', 'American Samoa', 'Tonga', 'Vanuatu', 'Tahiti', 'Solomon Islands', 'New Caledonia', 'Cook Islands']);
type Row = [number, number];
/** nøglelandets række: +0x1d = antal år fra sæsonstart til -slut – kun sat for de indlæste lande (England 1 i oraklet; de andre indlæste efter
 *  sæsontabellens start/slut: 0x5d5ae0 lægger +0x1d til slutåret); ikke indlæste 0 */
function keyRow(g: GameState, n: number): Row | undefined {
  const upd = KEY_UPD[g.nations[n]?.name ?? ''];
  if (upd === undefined) return undefined;
  if (!nationLoaded(g, n)) return [upd, 0];
  const sr = seasonRow(n);
  return [upd, g.nations[n]?.name === 'England' || (sr && sr[0] > sr[1]) ? 1 : 0];
}
/** 0x669360(klub): landshold → række 1; indlæst land (+0x11c) → nøglelandets række (fejl → række 0); ellers verdensdelens række (Afrika: 3) */
function rowOfClub(g: GameState, c: Club): Row {
  if (nationLoaded(g, c.nation)) return keyRow(g, c.nation) ?? ROW0;
  const nm = g.nations[c.nation]?.name ?? '';
  const r = OCEANIA.has(nm) ? 'oceania' : regionOf(nm);
  return CONT_ROW[r] ?? CONT_ROW.europe;
}
/** 0x669340(land): nøglelandets række, ellers række 4 (Nordamerika) */
const rowOfNation = (g: GameState, n: number): Row => keyRow(g, n) ?? CONT_ROW.northAmerica;

// ------------------------------------------------------------------------------------------------ personens felter (originalens poster)
const IX = (k: string) => ATTRS.indexOf(k as never);
const A_AMB = IX('ambition'), A_LOY = IX('loyalty');
const attr = (p: Player, ix: number) => Math.round(p.attrs[ix] || 10);
const REC: number[] = new Array(0x46).fill(0);
interface Pr { ca: number; pa: number; cur: number; world: number; gk: number; am: number; f: number; stamina: number }
function prOf(p: Player): Pr {
  const r = playerRecordInto(p, REC);
  const w = (o: number) => s16(r[o] | (r[o + 1] << 8));
  return { ca: w(5), pa: w(7), cur: w(0xb), world: w(0xd), gk: r[0xf], am: r[0x14], f: r[0x15], stamina: r[0x3c] };
}
/** klubbens division er indlæst ([0xadadfc][club +0x57] ≠ 0) */
function divisionActive(g: GameState, c: Club): boolean {
  const comp = g.comps[c.league];
  return !!comp && comp.type === 'league' && !g.leagues[c.league]?.hidden && nationLoaded(g, comp.nation >= 0 ? comp.nation : c.nation);
}
/** club +0x57 ≠ 0: klubben har en division i databasen (cmFinRaw[0] = club.dat +87) */
const hasDivision = (g: GameState, c: Club) => (g.cmFinRaw?.[c.id]?.[0] ?? (c.league ? 0 : -1)) >= 0;
/** staff +0x3e/+0x40: datoen han kom til klubben – for de klubløse datoen, han blev klubløs (Player.cmFreeSince – 0x53c190 database_remove_staff_from_club sætter datoen) */
const joinedPair = (g: GameState, p: Player) => pairOf((!p.club ? p.cmFreeSince : undefined) ?? p.joined ?? p.cmJoined ?? g.date);
const GBP = 0.86;
/** kontraktens +0x3d/+0x3e/+0x45/+0x4f (Player.cmContract; uden: en ny kontrakts værdier som cmContractOf – uden at gemme den) */
const contractOf = (p: Player): CmContract => p.cmContract ?? newCmContract(statusCode(p));

// ------------------------------------------------------------------------------------------------ check_retirement 0x7a7310 / 0x7a79c0
type Rand = (n: number) => number;

/** datoerne (0x7a7778–0x7a7990 / 0x7a7ca1–0x7a7e87): meldingen inden for 95 dage, stoppet ved landets sæsonopdatering + rand(30) */
function dates(g: GameState, p: Player, club: Club | undefined, today: number, rand: Rand): [number, number] {
  const [upd, cross] = club ? rowOfClub(g, club) : rowOfNation(g, p.nation);
  const y = yearOf(today);
  let ad = rand(95) + dayOf(today) + 1, ay = y;
  if (ad > 365) { ad = rand(60); ay = y + 1; }
  let rd = rand(30) + upd, ry: number;
  if (rd > 365) { rd = rand(30); ry = cross ? y + 2 : y + 1; } else ry = cross ? y + 1 : y;
  let a = ay * 1000 + ad, r = ry * 1000 + rd;
  if (r < a) r = a;                                            // 0x7a78d6: stop før melding → stoppet = meldingen
  else if (daysBetween(r, a) < 45) a = r;                      // 0x7a78f1: under 45 dage imellem → meldes samme dag
  return [a, r];
}

/** 0x7a7310 (initial = false) og 0x7a79c0 (initial = true): går spilleren på pension? (kun spillere – stabens gren er ikke porteret) */
export function checkRetirement(g: GameState, p: Player, todayIso: string, rand: Rand, initial = false): CmRetEntry | null {
  const club = p.club ? g.clubs[p.club] : undefined;
  if (initial && !club) return null;                           // 0x7a79cd
  const today = pairOf(todayIso);
  const sc = club && p.contract ? contractOf(p) : null;       // 0x4cf5f0
  const plan = sc ? s8(sc.b3d) : -100;                         // +0x3d (0x9c uden kontrakt)
  const age = ageOn(p.dob, todayIso);
  const pr = prOf(p);
  let T = pr.gk >= 15 ? 34 : pr.f < 15 && pr.am < 15 ? 31 : 30;
  if (age <= T) return null;
  const mk = (why: number): CmRetEntry => {
    const [a, r] = dates(g, p, club, today, rand);
    return { id: p.id, club: club ? club.id : 0, a, r, why, ann: 0 };
  };
  if (initial) {
    // 0x7a7b20: v = ftol(ftol(1 − (alder − T)·0,1) · omdømme) – den indre ftol gør v til 0 for alle over grænsen (sic)
    const v = s16(Math.trunc(Math.trunc(1 - (age - T) * 0.1) * pr.cur));
    if (age > 45) return mk(1);
    if (!hasDivision(g, club!)) {                              // 0x7a7b9d
      if (rand(3) === 0) return mk(1);
      return plan < 0 ? mk(1) : null;
    }
    if (v >= 5000) return null;
    if (pr.ca > 80) return null;
    if (pr.ca < 10 || v < 1500) return mk(1);
    return plan < 0 ? mk(1) : null;
  }
  if (age > 33) {                                              // 0x7a746f
    if (!sc) T--;
    else if (sc.b45 && (pr.f === 20 || pr.am === 20 || ((sc.b4f ?? 0) & 0xf0) === 0x70)) T--;
  }
  if (club && sc && p.contract) {                              // 0x7a7497: høj løn og flere år tilbage
    const loy = attr(p, A_LOY);
    if (Math.round(p.contract.wage * GBP) > 750 * (loy + 10) && +p.contract.expires.slice(0, 4) > yearOf(today)) { T--; if (loy < 6) T--; }
  }
  T = s8(T);
  const v = s16(Math.trunc((1 - (age - T) * 0.075) * pr.cur));   // [0x96a730] 0,075, [0x967890] 1,0
  if (age > 45) return mk(1);
  if (age > 34 && !club && daysBetween(today, joinedPair(g, p)) > 65) return mk(1);
  if (age > T + 2 && age > 31 && sc && s8(sc.b3e) > 5) return mk(1);
  if (age > T + 3) {
    if (!club) return mk(1);
    // 0x85fa00: dage til udløbet (+0x2d) < 300 og for lidt spilletid (+0x3d < 50)
    if (sc && p.contract && daysBetween(pairOf(p.contract.expires), today) < 300 && plan < 50) {
      if (npStaffOf(g, p)) return mk(1);                        // ikke-spillerposten +0x69
      if (attr(p, A_AMB) > rand(20) && pr.pa * 0.85 > pr.ca) return mk(1);
    }
  }
  if (v > 5500) return null;
  const active = club ? hasDivision(g, club) && divisionActive(g, club) : nationLoaded(g, p.nation);
  if (!active) {                                               // 0x7a7678
    if (rand(3) === 0) return mk(1);
    if (club && plan < 0) return mk(1);
    return v < 3500 ? mk(1) : null;
  }
  if (pr.ca > 100) return null;                                // 0x7a76d4
  if (pr.ca < 10 || v < 1500) return mk(1);
  if (club) return plan < 0 ? mk(1) : null;
  return rand(25 * pr.stamina) === 0 ? mk(2) : null;
}

/** 0x7a8050: en klubløs spiller, ingen har på ønskelisten, og som har været uden klub i over et år, stopper (rand(omdømme) < 750) */
function checkUnemployed(g: GameState, p: Player, todayIso: string, rand: Rand, listed: Set<number>): CmRetEntry | null {
  if (listed.has(p.id) || p.club) return null;
  const today = pairOf(todayIso), j = joinedPair(g, p);
  const days = (yearOf(today) - yearOf(j)) * 365 + dayOf(today) - dayOf(j);
  if (days > 365 && rand(prOf(p).cur) < 750) return { id: p.id, club: 0, a: today, r: today, why: 0x10, ann: 0 };
  return null;
}

// ------------------------------------------------------------------------------------------------ listen
const stateOf = (g: GameState): CmRetState => (g.cmRet ??= { list: [] });
/** personen findes i originalens hukommelse (0x524d70): Maximum-spillets udvalgte (Player.cmMem), ellers spillere i de indlæste landes
 *  klubber og klubløse af de indlæste landes nationalitet (world-filer uden oplysningen – se hovedets liste) */
const MEMK = new WeakMap<GameState, boolean>();
export function cmInMemory(g: GameState, p: Player): boolean {
  let known = MEMK.get(g);
  // world-filen kender 0x524d70's udvalgte (Maximum: Player.cmMem; størrelse 2 (CM_DBSIZE=2): trim2 uden lande – CMRatings.tm)
  if (known === undefined) { known = Object.values(g.players).some((x) => x.club && x.cmMem === 1); MEMK.set(g, known); }
  if (known && p.cmMem === 1) return true;
  return nationLoaded(g, p.club ? g.clubs[p.club]?.nation ?? -1 : p.nation);
}
function add(g: GameState, p: Player, e: CmRetEntry): void {
  const st = stateOf(g);
  (cmInMemory(g, p) ? st.list : (st.ext ??= [])).push(e);
}
/** 0x7ae2a0: næste dato – meldingen, hvis den ikke er passeret, ellers stoppet; så personen */
function sortList(list: CmRetEntry[], today: number) {
  const key = (e: CmRetEntry) => (e.a >= today ? e.a : e.r);
  list.sort((x, y) => key(x) - key(y) || x.id - y.id);
}
const dayNo = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** 0x7a58f0 ved spilstarten: alle med klub, vurderet på databasens dato (1/1 i startåret – PLAYER_REGEN bygges ved indlæsningen,
 *  før forkørslen; oraklets meldingsdatoer ligger i dag 1–96 af 2001) */
export function cmRetireInit(g: GameState): void {
  // spilstarten (newgame.ts/cmConvert.ts): enhver CM-database i ægte tilstand – listen g.cmRet slår modulet til (cmRetireOn)
  if (g.draft || !cmLogic(g)) return;
  const st = stateOf(g);
  st.list = []; st.ext = [];
  const ref = `${g.date.slice(0, 4)}-01-01`;
  const rand = cmRand(g.seed ?? 0, dayNo(ref), 0x7a58f0);
  for (const p of Object.values(g.players)) {
    // de klubløse fra databasen: staff +0x3e = databasens dato (staff.dat +62 – Player.cmJoined)
    if (!p.club && !p.cmFreeSince) p.cmFreeSince = p.cmJoined ?? p.joined ?? g.date;
    if (p.virtual || p.regen || p.contract?.cmB49) continue;
    const e = checkRetirement(g, p, ref, rand, true);
    if (e) add(g, p, e);
  }
  sortList(st.list, pairOf(ref));
}

/** 0x7a5790 (dag 0, 80, 173, 250): nye kandidater */
function findNew(g: GameState): void {
  const st = stateOf(g);
  const rand = cmRand(g.seed ?? 0, dayNo(g.date), 0x7a5790);
  const have = new Set([...st.list, ...(st.ext ?? [])].map((e) => e.id));
  const listed = new Set<number>();
  for (const c of Object.values(g.clubs)) for (const id of c.shortlist ?? []) listed.add(id);
  for (const p of Object.values(g.players)) {
    if (p.virtual || have.has(p.id) || p.cmRetire || p.contract?.cmB49) continue;
    const club = p.club ? g.clubs[p.club] : undefined;
    if (club && ageOn(p.dob, g.date) < 30 && divisionActive(g, club)) continue;   // 0x7a5806
    const e = checkRetirement(g, p, g.date, rand) ?? checkUnemployed(g, p, g.date, rand, listed);
    if (e) add(g, p, e);
  }
  sortList(st.list, pairOf(g.date));
}

/** 0x7a7f20: skaden slutter karrieren – en ny post (årsag 8) dateret i dag + rand(dage/2) + 1 (melding = stop) */
export function cmRetireInjury(g: GameState, p: Player, injuryDays: number, today = dayNo(g.date)): void {
  if (!cmRetireOn(g)) { p.cmRetire = true; return; }
  const st = stateOf(g);
  st.list = st.list.filter((e) => e.id !== p.id);
  if (st.ext) st.ext = st.ext.filter((e) => e.id !== p.id);
  // dagen er skadens dag – i forkørslen (0x5cc850) forkørslens dato, ikke spilstartens
  const rand = cmRand(g.seed ?? 0, today, p.id, 0x7a7f20);
  const due = today + rand(Math.trunc(injuryDays / 2)) + 1;
  const at = pairOf(new Date(due * 86400000).toISOString().slice(0, 10));
  add(g, p, { id: p.id, club: p.club, a: at, r: at, why: 8, ann: 0 });
}

// ------------------------------------------------------------------------------------------------ nyhederne
const pname = (p: Player) => `${p.first} ${p.last}`.trim();
/** 0x8d1da0(person, 0xa, …): spillerens klub (menneske) og de menneskelige managere med ham på deres ønskeliste */
function eachReader(g: GameState, p: Player, fn: (own: boolean) => void): void {
  forEachHuman(() => {
    const own = !!p.club && g.userClub === p.club;
    if (own || (g.shortlist ?? []).includes(p.id)) fn(own);
  });
}

/** 0xbbb 0x7aa340/0x7aa4c0: "X announces decision to retire" */
function announceNews(g: GameState, p: Player, why: number): void {
  const club = p.club ? g.clubs[p.club] : undefined;
  const base = { player: pname(p), last: p.last, club: club?.name ?? '' };
  eachReader(g, p, (own) => {
    // modtagerens egen klub: uden klubnavnet (0x7aa63f: klubbens manager = den aktive menneskelige manager)
    const body = why === 2 ? (own || !club ? 'last' : 'lastClub') : own || !club ? 'old' : 'oldClub';
    if (why !== 1 && why !== 2) return;
    addNews({ cat: 'general', key: 'cmret.ann', params: { ...base, body }, link: { kind: 'player', id: p.id } });
  });
}

/** Nyhedens pladser fra 0x7a92e0 (+8 jobbet ved meldingen, 15 → 8 og 13 → 6; +0xd ikke-spillerposten) og personen efter 0x7a59e0's overgang
 *  (jobbet +0x3d og klubben +0x39, som 0x7a9650 læser, når teksten vises) */
export interface NewsJob { np: boolean; job: number; liveJob: number; liveClub: boolean }

/** 0x7a9650 tekstdel 1 (brødteksten) for en spiller (spillerpost +0x61 sat; klubben +0x39 er altid sat, ellers sendes nyheden ikke): nøglen i
 *  `cmret.b.*` og jobbet ({job}: 0x53ac40(job) = `cmret.j.*`, 0x53ad00(job, 0, 0) = `cmret.jl.*`) */
export function retireBody(why: number, ann: number, caps: number, clubId: number, nj: NewsJob, rand: Rand): { body: string; job?: number; jl?: 1 } {
  const j = nj.job, notPl = j !== 0 && j !== 16 && j !== 11;
  if (why === 8) {                                                                  // 0x7aa120
    if (caps) {
      if (clubId === 1) return { body: 'injPlain' };                                // 0x7aa135: klubbens id = 1 (sic)
      const lj = nj.liveJob;
      return lj !== 0 && lj !== 16 && lj !== 11 ? { body: 'injIntlCont', job: j, jl: 1 } : { body: 'injIntl' };
    }
    // 0x7aa26f: klubben +0x39 nu – en spiller uden ikke-spillerpost står (indtil regen'en bruger pladsen) med 0x7aace0's tomme klub, men vises
    // her som før med klubben (pladsen genbruges af regen'en, før nyheden læses)
    return nj.liveClub ? { body: 'inj' } : { body: 'injPlain' };
  }
  if (ann) {
    if (!nj.np) return { body: caps ? 'retIntl' : 'ret' };                         // 0x7a9c56 (uden ikke-spillerpost)
    if (caps) {                                                                     // 0x7a99e2 (klubben er sat)
      if (notPl) return { body: 'retIntlCont', job: j };
      return { body: rand(2) ? 'retIntlCoach' : 'retIntlMgmt' };                    // 0x7a9a7a
    }
    const lj = nj.liveJob;                                                          // 0x7a9bf3: jobbet +0x3d nu
    return lj !== 0 && lj !== 16 ? { body: 'retCont', job: j } : { body: 'retCoach' };
  }
  // 0x7a9de0 (årsag 0x10/0x20 – klubløse og stab – sendes ikke for spillere med klub)
  if (nj.np && notPl) {
    // med landskampe: jobbet +0x3d nu (12/13/15 → "He will continue …") – efter 0x7aace0 er det 5/6/8, så kun den korte tekst (0x7a9e51)
    if (caps) return { body: 'nowIntl' };
    return { body: 'nowCont', job: j, jl: 1 };                                      // 0x7aa047
  }
  return { body: caps ? 'nowIntl' : 'now' };
}

// ------------------------------------------------------------------------------------------------ spilleren med ikke-spillerpost (+0x69)
const NPK = new WeakMap<GameState, { n: number; m: Map<number, Staff> }>();
/** spillerens ikke-spillerpost staff +0x69: personens Staff med samme person-id (databasens spillere med en ikke-spillerpost står i staffX/staff –
 *  newgame.ts addDbStaff, Staff.cmId = staff.dat +0 = spillerens id) */
export function npStaffOf(g: GameState, p: Player): Staff | undefined {
  const n = Object.keys(g.staff).length;
  let c = NPK.get(g);
  if (!c || c.n !== n) {
    const m = new Map<number, Staff>();
    for (const s of Object.values(g.staff)) if (s.cmId !== undefined && s.cmNp && !s.exPlayer) m.set(s.cmId, s);
    c = { n, m };
    NPK.set(g, c);
  }
  const s = c.m.get(p.id);
  return s && !s.exPlayer && s.last === p.last ? s : undefined;
}
/** personens job +0x3d som spiller: 11 spiller, 12 spillende manager, 13 spiller/assistent, 15 spiller/træner (Set Role At Club: Player.jobRole;
 *  ellers databasens job, så længe han er i databasens klub); stab med spillerpost: deres ikke-spillerjob */
function playerJob(p: Player, s: Staff | undefined): number {
  if (p.jobRole) return p.jobRole === 'assistant' ? 13 : p.jobRole === 'coach' ? 15 : 11;
  if (!s || !p.club) return 11;
  if (s.cmExtra) return s.cmClub === p.club && s.cmJob ? s.cmJob : 11;
  if (s.club !== p.club) return 11;
  return s.role === 'manager' ? 12 : JOB_CODE[s.role];
}
/** 0x7aace0 retire_from_playing_staff: 12 → 5 manager, 13 → 6 assistent, 15 → 8 træner (klubben beholdes); 11/14 → 16 (pensioneret spiller) og
 *  klubben ryddes; 1–10 urørt */
const afterPlaying = (job: number): number => (job === 12 ? 5 : job === 13 ? 6 : job === 15 ? 8 : job === 11 || job === 14 || job > 16 ? 16 : job);
const ROLE_OF: Record<number, StaffRole> = { 5: 'manager', 6: 'assistant', 8: 'coach', 9: 'scout', 10: 'physio' };

/** 0x7a62c2–0x7a6392: spilleren med ikke-spillerpost bliver ikke-spiller (samme person: spillerposten +0x61 → 0, +0x5f = 1). Med klub fortsætter
 *  han i klubbens stab (kontrakten bygges om af 0x85e960 – løn og udløb er spillerkontraktens), ellers er han ledig (job 16, "Unemployed") */
function becomeStaff(g: GameState, p: Player, s: Staff, job: number): void {
  const club = job !== 16 && p.club && g.clubs[p.club] ? p.club : 0;
  s.exPlayer = { pid: p.id };
  s.dob = p.dob;                                                                    // samme person (staff +0x10)
  if (s.cmExtra) { s.cmExtra = undefined; s.cmClub = undefined; s.cmJob = undefined; }
  s.cmDbJob = job;
  if (club) {
    s.club = club;
    s.role = ROLE_OF[job] ?? s.role;
    s.wage = p.contract?.wage ?? s.wage;
    if (p.contract?.expires) s.expires = p.contract.expires;
  } else {
    s.club = 0;
    s.cmJob = 0;
    s.wage = 0;
  }
}

/** 0xbba 0x7a92e0/0x7a9650: kun når spillerens klub er menneskets (0x7875e0); kendte spillere (verdensomdømme > 8500 i et land med +0x85 > 8)
 *  til alle, over 7500 til landets managere (nationaliteten og klubbens land), ellers klubben og ønskelisterne (0x8d1da0) */
function retireNews(g: GameState, p: Player, why: number, ann: number, nj: NewsJob, rand: Rand): void {
  const club = p.club ? g.clubs[p.club] : undefined;
  if (!club || !isHumanClub(club.id)) return;
  if (nj.job === 8 || nj.job === 5) return;                                         // 0x7a930b: spillerpost og jobbet træner/manager
  const pr = prOf(p);
  const caps = Math.min(255, p.caps ?? 0);
  const country = caps > 0 ? g.nations[p.nation]?.name ?? '' : '';
  const key = why === 8 ? 'cmret.inj' : ann ? 'cmret.ret' : 'cmret.shock';
  const b = retireBody(why, ann, caps, club.id, nj, rand);
  const params: Record<string, string | number> = { player: pname(p), last: p.last, club: club.name, country, body: b.body };
  if (b.job !== undefined) { params.job = b.job; if (b.jl) params.jl = 1; }
  const n = { cat: 'general' as const, key, params, link: { kind: 'player' as const, id: p.id } };
  const n85 = s8(g.cmNation85?.[p.nation] ?? 0);
  if (n85 > 8 && pr.world > 8500) { forEachHuman(() => addNews(n)); return; }
  if (pr.world > 7500) {
    forEachHuman(() => {
      const me = g.clubs[g.userClub];
      if ((me && (me.nation === p.nation || me.nation === club.nation)) || g.manager.national?.nation === p.nation || g.userClub === club.id) addNews(n);
    });
    return;
  }
  eachReader(g, p, () => addNews(n));
}

// ------------------------------------------------------------------------------------------------ process_retirements 0x7a59e0
/** fjern spilleren fra menneskets taktik (0x7aace0 retire_from_playing_staff: taktik- og truplisterne) */
function dropFromTactic(g: GameState, p: Player, club: number): void {
  asOwner(club, () => {
    const t = g.tactic;
    if (!t) return;
    t.lineup = t.lineup.map((id) => (id === p.id ? 0 : id));
    t.bench = t.bench.filter((id) => id !== p.id);
  });
}

function retire(g: GameState, p: Player, e: CmRetEntry, today: string, rand: Rand, mem: boolean): void {
  const s = npStaffOf(g, p);
  const job = playerJob(p, s), after = afterPlaying(job);
  // 0x7a92e0's job: 15 → 8, 13 → 6 (de to tekstfunktioner kender kun de to)
  const nj: NewsJob = { np: !!s, job: job === 15 ? 8 : job === 13 ? 6 : job, liveJob: s ? after : 16, liveClub: s ? after !== 16 : true };
  retireNews(g, p, e.why, e.ann, nj, rand);
  g.offers = g.offers.filter((o) => o.player !== p.id || o.status === 'completed' || o.status === 'rejected' || o.status === 'withdrawn' || o.status === 'collapsed');
  for (const c of Object.values(g.clubs)) if (c.shortlist?.includes(p.id)) c.shortlist = c.shortlist.filter((id) => id !== p.id);
  const club = p.club;
  if (club) dropFromTactic(g, p, club);
  const age = ageOn(p.dob, today);
  // 0x7a62c2: med ikke-spillerpost bliver han stab (samme person) – ingen regen (0x7a87d0 kaldes ikke)
  if (s) becomeStaff(g, p, s, after);
  // 0x7a6397: regen-køen – under 30 år samme dag, ellers i dag + 1 + rand(65) (over nytår: rand(35) året efter)
  let due = today;
  if (!s && age >= 30) {
    const t = pairOf(today);
    let d = rand(65) + dayOf(t) + 1, y = yearOf(t);
    if (d > 365) { d = rand(35); y++; }
    due = new Date((D0(y) + d) * 86400000).toISOString().slice(0, 10);
  }
  const seed: RegenSeed = { from: pname(p), nation: p.nation, pos: p.pos.slice(), side: p.side.slice(), foot: p.foot === 'L' ? 'L' : p.foot === 'B' ? 'B' : 'R', pa: p.pa, attrs: p.attrs.map((a) => Math.round(a)), fromId: p.id };
  // (cmRegen.ts) i originalens hukommelse: posten i puljen (0x7a6335 – også når han bliver stab) og uden ikke-spillerpost en kø-post (0x7a64e2);
  // de øvrige (uden for hukommelsen – findes ikke i originalen): som før – regen'en af hans egen post på datoen
  if (mem) cmRegenRetired(g, { ...seed, ...(p.cmNation2 !== undefined && p.cmNation2 >= 0 ? { n2: p.cmNation2 } : {}) }, !s, due, p.id);
  else if (!s && p.pa > 0) (g.regenQueue ??= []).push({ ...seed, due });
  removePlayer(p);
  const st = stateOf(g);
  st.n = (st.n ?? 0) + 1;
  const log = (g.cmRetLog ??= []);
  log.push([today, age, e.why, club, p.nation]);
  if (log.length > 6000) log.splice(0, log.length - 6000);
}

/** under bud (TRANSFER_MANAGER::is_player_under_offer 0x8cde70) */
const underOffer = (g: GameState, p: Player) => g.offers.some((o) => o.player === p.id && (o.status === 'pending' || o.status === 'negotiating' || o.status === 'countered' || o.status === 'accepted'));

/** en forfalden post (0x7a5a73–0x7a6587): aflyst eller gennemført – posten fjernes fra listen */
function settle(g: GameState, L: CmRetEntry[], i: number, today: number, rand: Rand): void {
  const e = L[i];
  L.splice(i, 1);
  const p = g.players[e.id];
  if (!p) return;
  const age = ageOn(p.dob, g.date);
  if (age < 30 && e.why !== 8 && p.club) return;                                            // 0x7a5a8b
  if (p.loan || underOffer(g, p)) { p.cmRetire = undefined; return; }                       // 0x4cf6d0 / 0x8cde70
  // 0x7a5b35: skiftet klub siden – nyligt (< 210 dage), under 38 og tilfreds (ikke listet, +0x45 = 0) → pensioneringen er aflyst
  if (p.club && (e.club === 0 || p.club !== e.club)) {
    const k = p.contract ? contractOf(p) : null;
    if (daysBetween(today, joinedPair(g, p)) < 210 && age < 38 && k && !p.listed && !p.loanListed && !k.b45) { p.cmRetire = undefined; return; }
  }
  if (!p.club) e.club = 0;
  retire(g, p, e, g.date, rand, L === stateOf(g).list);
}

function process(g: GameState): void {
  const st = stateOf(g);
  const today = pairOf(g.date);
  const rand = cmRand(g.seed ?? 0, dayNo(g.date), 0x7a59e0);
  sortList(st.list, today);
  const L = st.list;
  let i = 0;
  while (i < L.length) {
    const e = L[i];
    if (today > e.r) { settle(g, L, i, today, rand); continue; }
    if (e.ann || !(today > e.a)) break;                                                     // 0x7a64f4
    const p = g.players[e.id];
    if (p) { if (!p.cmRetire) announceNews(g, p, e.why); p.cmRetire = true; }              // staffState +0xb: &0xdf | 0x10
    e.ann = 1;
    i++;
  }
  // personerne uden for originalens hukommelse (findes ikke i originalen): samme regler, men ingen kø-rækkefølge, der kan blokere listen
  const X = (st.ext ??= []);
  for (let k = X.length - 1; k >= 0; k--) {
    const e = X[k];
    if (today > e.r) settle(g, X, k, today, rand);
    else if (!e.ann && today > e.a) { e.ann = 1; const p = g.players[e.id]; if (p) p.cmRetire = true; }
  }
  cmRegenSortQueue(g);                                                                      // 0x7a65a2
}

/** PLAYER_REGEN's dag i 0x5cccd0: process_retirements, så (på dag 0/80/173/250) find_new_retirements; de klubløses dato (staff +0x3e) */
export function cmRetireDaily(g: GameState): void {
  if (!cmRetireOn(g)) return;
  if (!g.cmRet) {
    // et spil fra før listen: de klubløses dato som ved spilstarten, og skaderne, der havde sluttet karrieren (Player.cmRetire), stopper i morgen
    g.cmRet = { list: [] };
    for (const p of Object.values(g.players)) {
      if (!p.club && !p.cmFreeSince) p.cmFreeSince = p.cmJoined ?? p.joined ?? g.date;
      if (p.cmRetire) { p.cmRetire = undefined; cmRetireInjury(g, p, 0); }
    }
  }
  for (const p of Object.values(g.players)) {
    if (p.club) { if (p.cmFreeSince) p.cmFreeSince = undefined; }
    else if (!p.cmFreeSince) p.cmFreeSince = g.date;
  }
  process(g);
  const doy = dayOf(pairOf(g.date));
  if (doy === 0 || doy === 80 || doy === 173 || doy === 250) findNew(g);
}
