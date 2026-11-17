// Originalens spejderanmodninger og -rapporter (SCOUT_MANAGER [0xb74448] + PLAYER_SEARCH, cm0102.exe 3.9.68) – Action → Scout Player i ægte
// tilstand. Porteret 17/11-2026 (~/cm0102-engine/notes/scout-port-plan.md):
//
//   0x7f8ff0 get_scout_request_status   3 = allerede bestilt, 2 = ingen spejdere (eller intet land), 0 = en spejderliste dækker landet,
//                                       ellers 0x7f9190 (rig/kendt klub eller samme region) → 1 ("… when your scouts become available ?"), 4 (råd)
//   0x7f9290 add_scout_request          post {klub, spiller, dato = i dag, antal = 0} (0x11 bytes), sorteret efter spiller og klub (0x7fc270)
//   0x7f8d70 has_scout_request          posten findes og har færre end 3 rapporter; "due": datoen er før i dag
//   0x7f9520 record_scout_report        datoen sættes til 27/4-1969 (0x549f70(0x1b, 4, 0x7b1)) og antallet + 1
//   0x7f8750 SCOUT_MANAGER::daily_update (kun aften, [0xae2c88] = 2): for hver anmodning – slettes, hvis klubben ikke er menneskets, spilleren
//                                       er i klubben (også på kontrakt), datoen + 365 er passeret eller der er 3 rapporter; efter datoen + 30:
//                                       slettes ved skade (0x62c400 = 2); uden land springes over; trupstatus 0/6/7 (kontrakt +0x4f) → rapport nu,
//                                       ellers venter den, hvis klubben har en kamp inden for 14 dage (0x5acbe0); rapporten: de første tre af
//                                       klubbens ti spejderlister, der dækker landet (0x7b7490), 0x7b62a0(…, −1000, 1) – og anmodningen slettes.
//                                       Til sidst 0x7f9890 (nyhederne) og sorteringen.
//   0x7f8c00 SCOUT_MANAGER::scout_match efter hver kamp (0x6b6195): for hver menneskeklub de ti lister i tilfældig rækkefølge (rand(10) til en
//                                       ledig plads) → 0x7b5be0; derefter 0x7f9890.
//   0x7b5be0 PLAYER_SEARCH::scout_match spejderlisten (type 4) uden opgave: én kamp om dagen (+0x1a5 = i morgen), landet (turneringens, ellers
//                                       hjemmeholdets) skal dækkes, og en af klubbens anmodninger, der er "due", skal spille i kampen; så vurderes
//                                       alle kampens spillere med mindst 15 minutter (ikke klubbens egne): anmodede (force 1) og ellers dem med
//                                       karakter 8+ (force 2), der ikke er kendte (0x5407e0 < 4000); skønnet = ((karakter·40 − 260)·minutter)/2.
//   0x7b62a0 PLAYER_SEARCH::report_on_player (force 1/2 – rapporten): 0x7f9520, kendskabet 0x5b09d0, stjernerne (cmStaff.scoutJudgement med
//                                       skønnet og fire rand(500)), arbejdstilladelsen (0x8c7560/0x8c7950, EU-pas via anden nationalitet +0x1e i
//                                       en klub i region 0xe → 2); force 2 kun med 4+ stjerner.
//   0x7f9890 send_scout_reports         posterne sorteres (0x7fc2a0: spiller, klub, evne, potentiale) og samles pr. spiller og klub
//   0x7f9a60 send_scout_report_news     nyheden 0x138e til klubbens manager (højst tre spejdere) – teksten 0x7f9d10 (src/ui/cmScoutNews.ts)
//
// Ikke porteret: spejderlister med opgave (0x7b3e20 run_scout_day, 0x7b0050 og nyheden 0x138b/0x7b95c0 – vores scouting.ts står for dem),
//   medierne 0x754740 (rygtet om interessen) og listens resultattabel (Rec) i 0x7b62a0, 0x546ab0/0x5465a0 (spillerens beskrivelse i stedet for
//   positionsordet – nyheden får derfor ikke markøren 0x420e9), turneringsrundens navn 0x4b4850 (vores rundenavne), Portugal-reglen i 0x53d980.
// Tilfældige tal: cmRand (egen talrække – spillets rng røres ikke).
import type { Fixture, GameState, MatchReport, Player, Staff } from './types';
import { addDays, ageOn } from './dates';
import { isResFixture } from './cmReserves';
import { addNews } from './state';
import { asOwner, isHumanClub } from './humans';
import { clubRepMem, cmActive, cmRand, statusCode } from './cmPlayerData';
import { cmClubLevelOf, cmStaffAttr, scoutJudgement } from './cmStaff';
import { cmKnowSee } from './cmKnow';
import { cmNeedsPermit, CM_EU } from './cmPermit';
import { workPermitGranted } from './rules2001';
import { cmForeign } from './cmNewsScope';
import { playerRecord } from './engine/grid/aiTeam';
import { naturalMask } from './engine/grid/aiTacticChoice';
import REGION from './data/cmNationRegion.json';

/** SCOUT_MANAGER +0x5c: anmodningen (0x11 bytes: +0 klubben, +4 spilleren, +8 datoen, +0x10 antal rapporter) */
export interface CmScoutReq { club: number; pid: number; date: string; n: number }
/** rapportposten (0x67 bytes) – kun felterne, nyheden bruger */
export interface CmScoutRec {
  /** +0x66: 1 anmodet, 2 set i en kamp */
  mode: 1 | 2;
  pid: number; club: number; scout: number;
  /** +0x59 alderen, +0x5a positionsmasken (0x5b7d20), +0x5c/+0x5d stjernerne */
  age: number; pos: number; ab: number; pot: number;
  /** +0x58: 1 skal have tilladelse (+0x54 = får den), 2 EU-pas via anden nationalitet, 0 ingen */
  permit: number; granted: number;
  /** +0x5e/+0x62/+0..+0x1e: kampen set fra spillerens hold (fill_match_record_from_fixture 0x7e4750) */
  match?: { team: number; opp: number; gf: number; ga: number; reserve: boolean; comp: string; stage: string; round: number };
}

const ANCIENT = '1969-04-27';
const s16 = (v: number) => (v << 16) >> 16;
const dayNo = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const region = (g: GameState, n: number | undefined) => (n === undefined || n < 0 ? -1 : (REGION as Record<string, number>)[g.nations[n]?.name ?? ''] ?? -1);
/** nation +0x7f = 2 (EU/EØS, 0x53d740) */
const eu = (g: GameState, n: number | undefined) => n !== undefined && n >= 0 && CM_EU.has(g.nations[n]?.name ?? '');

export const cmScoutOn = (g: GameState) => cmActive(g) && !g.draft;

/** klubbens spejderlister (type 4 med en spejder): menneskets 10 lister, én pr. spejder i Scout #n-rækkefølgen */
export function scoutLists(g: GameState, club: number): Staff[] {
  return Object.values(g.staff).filter((s) => s.club === club && s.role === 'scout').sort((a, b) => a.id - b.id).slice(0, 10);
}

/** 0x7f9190 can_club_scout_nation: under £1 mio., omdømme under 5000 og en anden region → nej */
function canClubScoutNation(g: GameState, nation: number, club: number): boolean {
  const c = g.clubs[club];
  if (!c) return false;
  if (Math.round(c.balance * 0.86) >= 1_000_000) return true;
  if (s16(clubRepMem(g, club)) >= 5000) return true;
  return region(g, c.nation) === region(g, nation);
}

/** 0x7b7490 scout_covers_nation for en liste uden opgave: begge EU, samme region, spejderens eget land (0x53d980) eller 0x7f9190 */
export function coversNation(g: GameState, s: Staff, nation: number): boolean {
  const club = g.clubs[s.club];
  if (!club || nation < 0) return false;
  // 0x7b7576: med en opgave (0x7aefd0) – klubbens land, opgavens land (resten af opgavetyperne følger listen uden opgave)
  const a = s.assignment;
  if (a && a.kind === 'club') return g.clubs[a.target as number]?.nation === nation;
  if (a && a.kind === 'nation') return a.target === nation;
  if (eu(g, club.nation) && eu(g, nation)) return true;
  if (region(g, club.nation) === region(g, nation)) return true;
  if (!cmForeign(g, s.nation, nation)) return true;
  return canClubScoutNation(g, nation, s.club);
}

const reqs = (g: GameState) => (g.cmScoutReq ??= []);
const findReq = (g: GameState, pid: number, club: number) => reqs(g).find((r) => r.pid === pid && r.club === club);
const sortReqs = (g: GameState) => reqs(g).sort((a, b) => a.pid - b.pid || a.club - b.club);

/** 0x7f8d70 has_scout_request (due: datoen er før i dag) */
export function hasScoutRequest(g: GameState, pid: number, club: number, due: boolean): boolean {
  const r = findReq(g, pid, club);
  return !!r && r.n < 3 && (!due || r.date < g.date);
}

/** spillerens land for spejderne: klubbens, ellers hans egen nationalitet */
const playerNation = (g: GameState, p: Player) => (p.club ? g.clubs[p.club]?.nation ?? -1 : p.nation);

/** 0x7f8ff0 get_scout_request_status (0 dækket, 1 når spejderne bliver ledige, 2 ingen spejdere, 3 allerede, 4 ingen ressourcer) */
export function scoutRequestStatus(g: GameState, p: Player, club = g.userClub): number {
  if (hasScoutRequest(g, p.id, club, false)) return 3;
  const nation = playerNation(g, p);
  if (nation === undefined || nation < 0) return 2;
  let count = 0;
  for (const s of scoutLists(g, club)) {
    count++;
    if (coversNation(g, s, nation)) return 0;
  }
  if (!count) return 2;
  return canClubScoutNation(g, nation, club) ? 1 : 4;
}

/** 0x7f9290 add_scout_request */
export function addScoutRequest(g: GameState, p: Player, club = g.userClub): void {
  reqs(g).push({ club, pid: p.id, date: g.date, n: 0 });
  sortReqs(g);
}

/** 0x7f9520 record_scout_report */
function recordScoutReport(g: GameState, pid: number, club: number): void {
  const r = findReq(g, pid, club);
  if (r) { r.date = ANCIENT; r.n++; }
}

/** 0x5407e0(spiller, spejder, 0): samme klub eller division → nuværende omdømme, samme land → hjemme, ellers verden (som cmScoutRec) */
function repSeen(g: GameState, p: Player, club: number): number {
  const r = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
  const w = (i: number) => s16(Math.round(r[i] * 50));
  const me = g.clubs[club], pc = p.club ? g.clubs[p.club] : undefined;
  return pc && me && (pc.id === me.id || pc.league === me.league) ? w(1) : (pc?.nation ?? p.nation) === me?.nation ? w(0) : w(2);
}

/** 0x5b7d20: spillerens positionsmaske (spillerposten +0x0f..+0x19) */
export const posMask = (p: Player) => naturalMask([...p.pos.slice(0, 8), p.side?.[2] ?? 1, p.side?.[0] ?? 1, p.side?.[1] ?? 1]);

/** 0x7b62a0 report_on_player, force 1/2 (spejderen skriver en rapport) – null, hvis der ingen rapport er */
export function reportOnPlayer(g: GameState, s: Staff, p: Player, force: 1 | 2, score: number, rnd: (n: number) => number,
  m?: { f: Fixture; side: 0 | 1; rep: MatchReport }): CmScoutRec | null {
  const club = s.club;
  if (!club || !g.clubs[club]) return null;
  recordScoutReport(g, p.id, club);
  if (g.options.masking) cmKnowSee(g, p, cmStaffAttr(s, 'judgingAbility'), s.id);
  const age = ageOn(p.dob, g.date);
  const rand: [number, number, number, number] = [rnd(500), rnd(500), rnd(500), rnd(500)];
  const [ab, pot] = scoutJudgement({ rec: playerRecord(p), age, playerId: p.id, ca: p.ca, pa: p.pa, free: !p.club, repSeen: repSeen(g, p, club),
    judge: { id: s.cmId ?? s.id, ja: cmStaffAttr(s, 'judgingAbility'), jp: cmStaffAttr(s, 'judgingPotential') }, clubRep: clubRepMem(g, club),
    level: cmClubLevelOf(g, club), gameSeed: g.seed, bias: score, rand });
  const needs = cmNeedsPermit(g, p, club, true);
  const granted = needs ? (workPermitGranted(p) ? 1 : 0) : 1;
  if (force === 2 && ab < 4 && pot < 4) return null;
  const rec: CmScoutRec = { mode: force, pid: p.id, club, scout: s.id, age, pos: posMask(p), ab, pot, permit: 0, granted: 0 };
  if (m) {
    const r = m.f.result, team = m.side === 0 ? m.f.home : m.f.away, opp = m.side === 0 ? m.f.away : m.f.home;
    const hg = r?.hg ?? m.rep.stats[0].goals, ag = r?.ag ?? m.rep.stats[1].goals;
    rec.match = { team, opp, gf: m.side === 0 ? hg : ag, ga: m.side === 0 ? ag : hg, reserve: isResFixture(m.f), comp: m.f.comp, stage: m.f.stage ?? '', round: m.f.round };
  }
  if (needs) { rec.permit = 1; rec.granted = granted; }
  else if (!eu(g, p.nation) && p.cmNation2 !== undefined && p.cmNation2 >= 0 && eu(g, p.cmNation2) && region(g, g.clubs[club].nation) === 0xe) rec.permit = 2;
  return rec;
}

/** 0x7f9890 + 0x7f9a60: rapporterne samlet pr. spiller og klub → nyheden 0x138e (højst tre spejdere) */
export function sendScoutReports(g: GameState, list: CmScoutRec[]): void {
  if (!list.length) return;
  const a = list.slice().sort((x, y) => x.pid - y.pid || x.club - y.club || x.ab - y.ab || x.pot - y.pot);
  for (let i = 0; i < a.length; ) {
    let j = i + 1;
    while (j < a.length && a[j].pid === a[i].pid && a[j].club === a[i].club) j++;
    newsOf(g, a.slice(i, Math.min(j, i + 3)));
    i = j;
  }
}

function newsOf(g: GameState, rs: CmScoutRec[]): void {
  const r = rs[0], p = g.players[r.pid];
  if (!p) return;
  const n = rs.length;
  const head = n === 1 ? (r.mode === 2 ? 'cmsr.a7dd2c' : 'cmsr.a710f4') : r.mode === 2 ? 'cmsr.a7dcf8' : 'cmsr.a7dccc';
  const params: Record<string, string | number> = { n, mode: r.mode, pid: p.id, player: `${p.first} ${p.last}`.trim(), last: p.last || p.first,
    age: r.age, pos: r.pos, club: r.club, permit: r.permit, granted: r.granted, nat2: p.cmNation2 ?? -1 };
  rs.forEach((x, k) => {
    const s = g.staff[x.scout];
    params[`s${k}`] = s ? `${s.first} ${s.last}`.trim() : '';
    params[`l${k}`] = s ? s.last || s.first : '';
    params[`a${k}`] = x.ab; params[`p${k}`] = x.pot;
  });
  if (r.match) Object.assign(params, { mt: r.match.team, mo: r.match.opp, gf: r.match.gf, ga: r.match.ga, rsv: r.match.reserve ? 1 : 0,
    comp: r.match.comp, stg: r.match.stage, rnd: r.match.round });
  asOwner(r.club, () => addNews({ cat: 'scout', key: head, params, link: { kind: 'player', id: p.id } }));
}

/** 0x7f8750 SCOUT_MANAGER::daily_update – anmodningerne (én gang om dagen, efter dagens øvrige opdateringer) */
export function cmScoutDaily(g: GameState): void {
  if (!cmScoutOn(g) || !g.cmScoutReq?.length) return;
  const out: CmScoutRec[] = [];
  const list = reqs(g);
  const today = g.date, end14 = addDays(today, 14);
  for (let i = 0; i < list.length; i++) {
    const r = list[i], p = g.players[r.pid];
    const remove = () => { list[i] = list[list.length - 1]; list.pop(); i--; };
    if (!isHumanClub(r.club) || !p) { remove(); continue; }
    if (p.club === r.club || (p.loan && p.loan.from === r.club)) { remove(); continue; }
    if (today > addDays(r.date, 365)) { remove(); continue; }
    if (r.n >= 3) { remove(); continue; }
    if (!(today > addDays(r.date, 30))) continue;
    if (p.injury && p.injury.key !== 'awol') { remove(); continue; }
    const nation = playerNation(g, p);
    if (nation === undefined || nation < 0) continue;
    const st = p.club ? statusCode(p) : -1;
    const direct = p.club ? st === 0 || st === 6 || st === 7 : false;
    if (!direct && p.club) {
      // 0x5acbe0(i dag … i dag + 14, klubben): en kamp inden for 14 dage → vent på, at en spejder ser ham
      const soon = Object.values(g.fixtures).some((f) => !f.result && (f.home === p.club || f.away === p.club) && f.date >= today && f.date <= end14);
      if (soon) continue;
    }
    const rnd = cmRand(g.seed ?? 0, p.id, r.club, dayNo(today), 0x7f8750);
    let made = 0;
    for (const s of scoutLists(g, r.club)) {
      if (made >= 3) break;
      if (!coversNation(g, s, nation)) continue;
      const rec = reportOnPlayer(g, s, p, 1, -1000, rnd);
      made++;
      if (rec) out.push(rec);
    }
    remove();
  }
  sendScoutReports(g, out);
  sortReqs(g);
}

/** 0x7f8c00 + 0x7b5be0: efter en kamp – menneskeklubbernes spejdere uden opgave ser kampen, hvis en anmodet spiller er med */
export function cmScoutMatch(g: GameState, f: Fixture, rep: MatchReport): void {
  if (!cmScoutOn(g) || !g.cmScoutReq?.length || !rep.players?.length) return;
  const out: CmScoutRec[] = [];
  const clubs = [...new Set(g.cmScoutReq.map((r) => r.club))].sort((a, b) => a - b);
  for (const club of clubs) {
    if (!isHumanClub(club)) continue;
    const lists = scoutLists(g, club);
    const rnd = cmRand(g.seed ?? 0, f.id, club, 0x7f8c00);
    // 0x7f8c7a: rand(10) til en ledig plads – rækkefølgen af de ti lister
    const used = new Array(10).fill(false);
    for (let k = 0; k < 10; k++) {
      let slot: number;
      do slot = rnd(10); while (used[slot]);
      used[slot] = true;
      const s = lists[slot];
      if (s) scoutMatchList(g, s, f, rep, rnd, out);
    }
  }
  sendScoutReports(g, out);
}

/** 0x7b5be0 PLAYER_SEARCH::scout_match for en spejderliste uden opgave */
function scoutMatchList(g: GameState, s: Staff, f: Fixture, rep: MatchReport, rnd: (n: number) => number, out: CmScoutRec[]): void {
  const club = s.club;
  // 0x7b5df4: en igangværende opgave (i dag før slutdatoen +0x1ad, uden turnering +0x195) – listen ser ingen kampe for anmodningerne
  if (s.assignment && s.assignment.kind !== 'player') return;
  const watch = (g.cmScoutWatch ??= {});
  if (watch[s.id] && g.date < watch[s.id]) return;
  const nation = g.clubs[f.home]?.nation ?? -1;
  if (!coversNation(g, s, nation)) return;
  const played = rep.players.filter((l) => !l.sub || l.minutes > 0);
  // 0x7b5e69: klubben har anmodninger, en af dem spiller for et af holdene, og en spiller i kamptrupperne (de 20 pr. hold) er "due"
  const targets = reqs(g).filter((r) => r.club === club).map((r) => g.players[r.pid]).filter((p): p is Player => !!p);
  if (!targets.some((p) => p.club === f.home || p.club === f.away || p.loan?.from === f.home || p.loan?.from === f.away)) return;
  const squadIds = [...rep.players.map((l) => l.id), ...(rep.bench?.[0] ?? []), ...(rep.bench?.[1] ?? [])];
  if (!squadIds.some((id) => hasScoutRequest(g, id, club, true))) return;
  watch[s.id] = addDays(g.date, 1);
  for (const side of [0, 1] as const) {
    for (const l of played) {
      if (l.team !== side) continue;
      const p = g.players[l.id];
      if (!p || p.virtual) continue;
      if ((p.loan ? p.loan.from : p.club) === club) continue;
      if (g.options.masking) cmKnowSee(g, p, cmStaffAttr(s, 'judgingAbility'), s.id);
      const req = hasScoutRequest(g, p.id, club, false);
      if (!req && repSeen(g, p, club) >= 4000) continue;
      if (l.minutes < 15) continue;
      const rating = Math.trunc(l.rating);
      const score = Math.trunc(((rating * 40 - 260) * l.minutes) / 2);
      if (!req && rating < 8) continue;
      const rec = reportOnPlayer(g, s, p, req ? 1 : 2, score, rnd, { f, side, rep });
      if (rec) out.push(rec);
    }
  }
}

/** klubbens anmodninger (Scout #n / tests) */
export const scoutRequests = (g: GameState, club = g.userClub) => (g.cmScoutReq ?? []).filter((r) => r.club === club);
