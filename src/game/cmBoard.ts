// Originalens bestyrelse og managerjob (MANAGER_MANAGER, manager_manager.cpp i cm0102.exe 3.9.68) – oversat fra koden (afkodet 12/11-2026,
// noten ~/cm0102-engine/notes/board-jobs.md). Kun den originale database i ægte tilstand (cmActive); den moderne database og det udvidede
// spil bruger stadig board.ts' egne regler.
//
// Porteret (adresse → funktion her):
//   0x68f130 init_club_board_records   initRecords          0x694c80 reset_board_for_new_manager   resetForNewManager
//   0x6a3770 set_season_expectations   setSeasonExpectations 0x695240 update_board_after_match      afterMatch
//   0x68f9c0 daily_update               boardDaily           0x69b650 process_pending_departures    processDepartures
//   0x69b790 remove_club_manager        removeClubManager    0x69ba50 add_job_vacancy               addVacancy
//   0x69d1b0 score_staff_for_job        scoreStaffForJob     0x69f810 is_staff_suitable_for_job     suitable
//   0x69c540 best_manager_candidate_score bestCandidateScore 0x69ca00 apply_for_job                 applyForJob
//   0x6a4f80 post_job_offer_to_human_news jobOfferToHuman    0x69aba0 consider_sacking_manager      considerDeparture
//   0x697c40 weekly_board_confidence_update weekly           0x6d3610/0x6b6cc0 managerens omdømme   managerRepAfterMatch
//   0x5986b0 get_wealth_band (cmSquadPlan.ts financeStatus), 0x690b70/0x690bd0 båndene, 0x5407e0/0x5408c0 omdømmet set af en anden
//
// Talrækken: originalens rand(n) (0x90cfc0) trækkes af en egen deterministisk talrække pr. kald (cmRand af spillets frø, dagen og adressen) –
// spillets rng røres ikke. Rækkefølgen af kaldene inden for hver funktion er originalens.
//
// Spillets data → originalens felter (cmBoardData nederst): klubbens omdømme = clubRepMem (club +0x80), divisionen = klubbens liga (club_comp
// +0x69 = GameState.cmCompRep), formanden = world.cmRaw.chair (np +0x16, +0x1d Patience, staff +0x57 Ambition), managerne = Staff med
// ikke-spillerpost (Staff.cmNp/cmRep/cmHid), menneskene = de 16 sidste staffrækker (id ≥ N − 16) med ManagerProfile.cmRep.
// Findes ikke i spillet (dokumenteret i ENGINE_PORT_PLAN.md "Bestyrelse og job"): landsholdene som klubber (0x53b900 er altid falsk), B-hold
// (0x540a50), spillende managere (staff +0x61), staffs præferencelister (+0x65), klubbens yndlings-/uønskede personer (+0x9b..+0xaf), lån af
// stab, dyn+0xb & 0x30, Media::post_team_media_story 0x74b060 (dens tilfældige tal trækkes ikke), nyhederne til andre end mennesket.

import type { Club, GameState, Staff } from './types';
import { cmRand } from './cmPlayerData';

// ---------------------------------------------------------------- små hjælpere (x87/heltal som i koden)

export const s16 = (v: number) => (v << 16) >> 16;
export const s8 = (v: number) => (v << 24) >> 24;
export const ftol = (x: number) => (Number.isFinite(x) ? Math.trunc(x) : 0) | 0;
export const f32 = Math.fround;
const tdiv = (a: number, b: number) => Math.trunc(a / b);
export type Rand = (n: number) => number;

/** originalens dato: dag i året (0 = 1. januar) og år */
export interface CmDate { day: number; year: number }
export const NULLDATE: CmDate = { day: 234, year: 1971 };                 // Date(23, 7, 1971) = 23/8-1971 (dag 234)
export const isoToCm = (iso: string): CmDate => {
  const t = Date.parse(iso.slice(0, 10) + 'T00:00:00Z'), y = new Date(t).getUTCFullYear();
  return { day: Math.round((t - Date.UTC(y, 0, 1)) / 86400000), year: y };
};
export const cmToIso = (d: CmDate): string => new Date(Date.UTC(d.year, 0, 1) + d.day * 86400000).toISOString().slice(0, 10);
/** after(a, b): a.år > b.år (u16) || (samme år && (s16)a.dag > (s16)b.dag) */
export const after = (a: CmDate, b: CmDate) => (a.year & 0xffff) > (b.year & 0xffff) || ((a.year & 0xffff) === (b.year & 0xffff) && s16(a.day) > s16(b.day));
/** 0x54cdb0 Date::days_since: dage fra d til t (gregoriansk) */
export const daysSince = (t: CmDate, d: CmDate) => Math.round((Date.UTC(t.year, 0, 1) + t.day * 86400000 - (Date.UTC(d.year, 0, 1) + d.day * 86400000)) / 86400000);

// ---------------------------------------------------------------- posterne

/** bestyrelsesposten [MM+0] + 0x49·klub (73 bytes) */
export interface BoardRec {
  b0: number; b1: number; b2: number; b3: number; b4: number; b5: number;
  /** +6 tilliden (hovedværdien), +8, +0xa, +0xc de tre andre vurderinger (s16, 1..10000) */
  w6: number; w8: number; wa: number; wc: number;
  /** +0xe forventningsflagene (u16) */
  e: number;
  /** +0x10/+0x12 ligapræstationen (ugentligt), +0x14/+0x16 straffe for handler/kampe */
  w10: number; w12: number; w14: number; w16: number;
  d18: CmDate; d20: CmDate;
  d28: number;
  /** +0x2c bestyrelsens mål for ligaplaceringen */
  t2c: number;
  /** +0x30 = rep²·0,25 ved sæsonstart; +0x38 nettoforbrug på transfers (double) */
  q30: number; d38: number;
  b40: number; d41: CmDate;
}
/** ledighedsposten [MM+8] (38 bytes) */
export interface Vacancy { altFound: number; rumourDone: number; alt: number; cand: number; prev: number; club: number; score: number; date1: CmDate; date2: CmDate }
/** afgangsposten [MM+4] (6 bytes) */
export interface Departure { type: number; reason: number; club: number }
export interface CmBoardState {
  rec: Record<number, BoardRec>;
  dep: Departure[];
  vac: Vacancy[];
  /** [MM+0x10] ultimatumlisten (klub-id'er) */
  ult: number[];
  /** [0xb67a40] sidste måned (−1 = første kald) */
  month: number;
  /** Comp_Stats i vores spil: [bedste, dårligste placering, dag for seneste ligakamp] pr. klub i sæsonen */
  tab?: Record<number, [number, number, number]>;
}

export const newRec = (): BoardRec => ({ b0: 0, b1: 0, b2: 0, b3: 0, b4: 0, b5: 0, w6: 0, w8: 0, wa: 0, wc: 0, e: 0, w10: 0, w12: 0, w14: 0, w16: 0,
  d18: { ...NULLDATE }, d20: { ...NULLDATE }, d28: 0, t2c: 0, q30: 0, d38: 0, b40: 0, d41: { day: 203, year: 1971 } });

// ---------------------------------------------------------------- verdenen, som originalens funktioner ser den

/** en person (staffrække) – AI-stab med ikke-spillerpost eller et menneske (de 16 sidste rækker) */
export interface Person {
  /** rækkens nummer (sorteringsnøgle); menneske = HUMAN0 + k */
  id: number;
  human: boolean;
  /** ikke-spillerpost findes */
  np: boolean;
  nation: number;            // −1 = ingen
  club: number;              // 0 = ingen
  job: number;               // +0x3d: 5 manager, 6 assistent, 8 træner, 9 spejder, 10 fysio, 0 ingen
  joined: CmDate;            // +0x3e
  age: number;               // +0x18
  b59: number;               // +0x59 Loyalty (mennesket: managerens tæller)
  det: number; pres: number; prof: number; temper: number; amb: number;   // +0x58 +0x5a +0x5b +0x5d +0x57
  b22: number;               // +0x22 landskampe
  ca: number; pa: number;    // np +4 / +6
  /** np-byte +off (0x0e..0x22) */
  at: (off: number) => number;
  /** omdømmerne [+8 hjemme, +0xa aktuel, +0xc verden] (læses og skrives) */
  rep: [number, number, number];
}
export const HUMAN0 = 1_000_000_000;

export interface Chair { b16: number; b1d: number; amb: number; nation: number }

/** turneringstabellens post (Comp_Stats +0x72..+0x75 og stimerne) */
/** pos = +0x72 (sidste sæsons slutplacering), p73 = nuværende placering, p74/p75 = bedste/dårligste i sæsonen, played = +4, stimerne +0x19/+0x2d/
 *  +0x55/+0x41 og dage siden den seneste kamp (stimernes datoer), formens sidste 5 (+0x14..+0x18: point og antal), projected = 0x4ae300's første */
export interface StatsEntry { pos: number; p73: number; p74: number; p75: number; played: number; winRun: number; lossRun: number; noWinRun: number; unbeatenRun: number; lastDays: number;
  formPts: number; formN: number; projected: number }

export interface LeagueInfo {
  teams: number;             // comp +0x3e
  autoPromo: boolean;        // vtable +0x98: +0xbe ≠ 0 og +0xd9 & 2
  promo: number;             // +0xbe
  playoff: number;           // +0xbf
  relegation: number;        // +0xc1 (has_relegation = ≠ 0)
  rep: number;               // club_comp +0x69
}

/** alt hvad funktionerne læser af resten af spillet (cmBoardData.ts bygger den af GameState) */
export interface BoardEnv {
  today: CmDate;
  /** [0xdd6ec8] spillets start (hovedlandets sæsonstart) */
  gameStart: CmDate;
  clubs: number[];
  clubRep(c: number): number;
  clubNation(c: number): number;
  /** klubbens division: liga-id eller null; level = club_comp +0x69 */
  division(c: number): string | null;
  lastDivision(c: number): string | null;
  divLevel(div: string): number;
  league(div: string): LeagueInfo | null;
  /** 0x544820 club_can_be_managed */
  canBeManaged(c: number): boolean;
  /** turneringen kører (comps[division] ≠ 0 og nationen spilbar) – "activeLeague" */
  activeLeague(c: number): boolean;
  entry(c: number): StatsEntry | null;
  /** klubbens europæiske turneringspost (club +0x1db ≠ −1, ikke Intertoto) */
  euroEntry(c: number): StatsEntry | null;
  /** UefaSeeding: [cl, uefa] for klubbens land */
  nationPlaces(c: number): [number, number];
  isAustralia(c: number): boolean;
  /** 0x5986b0 formuebåndet (−2..2) og 0x598800 transferbudgettet */
  wealthBand(c: number): number;
  transferBudget(c: number): number;
  balance(c: number): number;
  chair(c: number): Chair | null;
  manager(c: number): Person | null;
  assistant(c: number): Person | null;
  firstCoach(c: number): Person | null;
  /** alle staffrækker med ikke-spillerpost i rækkefølge (menneskene sidst) */
  persons(): Person[];
  person(id: number): Person | null;
  /** nation +0x75, +0x85, +0x88, +0x7e */
  nat75(n: number): number; nat85(n: number): number; nat7e(n: number): number;
  /** menneskeklub (0x600a50) og på ferie med ferievalg 1 */
  isHumanClub(c: number): boolean;
  humanOnHolidaySearching(p: Person): boolean;
  /** 0x7c6830 sproget (0..10) for personen i klubben */
  fluency(p: Person, c: number): number;
  /** 0x53d980(s, n, 1) udlænding */
  foreign(p: Person, n: number): boolean;
  /** 0x844780 staff_interest_in_job_at_club(s, c, 0, 5, NULL) */
  interest(p: Person, c: number): number;
  /** 0x7a7eb0 pensionsstatus ≠ 0 / 0x7ae350 pension på vej */
  retiring(p: Person): boolean;
  /** 0x547770 klubbens land er i sæson */
  inSeason(c: number): boolean;
  /** 0x5acbe0: næste uspillede kamp inden for n dage (ikke i dag) */
  nextFixture(c: number, days: number): { opp: number; hasComp: boolean } | null;
  /** club +0x1db ≠ −1 og ikke Intertoto (europæisk turnering i sæsonen); inEuropeAny: +0x1db ≠ −1 */
  inEurope(c: number): boolean; inEuropeAny(c: number): boolean;
  /** club +0x64 == 1 (professionel; 0x697c40 ganger negative ændringer med 0,75, når +0x64 ≠ 1) */
  pro(c: number): boolean;
  /** klubbens land er Wales, Irland eller Nordirland */
  lowNation(c: number): boolean;
  /** 0x8cde70 is_player_under_offer (stab: aldrig) */
  underOffer(p: Person): boolean;
  // ---- skrivere (spillet udfører originalens bivirkninger)
  setManager(c: number, p: Person | null, old: number): void;
  news(kind: BoardNews): void;
}

export type BoardNews =
  | { t: 'expect'; club: number; flags: number }
  | { t: 'confidence'; club: number; days: number }
  | { t: 'jobOffer'; club: number; human: Person; budget: number; flags: number; variant: number }
  | { t: 'applyReply'; club: number; human: Person; dismissed: boolean }
  | { t: 'boardMemo'; human: Person; employer: number; target: number }
  | { t: 'appointed'; club: number; manager: Person; prev: number; kind: number }
  | { t: 'departed'; club: number; manager: Person; type: number; reason: number }
  | { t: 'rumour'; club: number; staff: Person; variant: number }
  | { t: 'protest'; club: number }
  | { t: 'pressure'; club: number; kind: number }
  | { t: 'match'; club: number; opp: number; flags: number; gf: number; ga: number }
  | { t: 'ultimatum'; club: number; opp: number };

// ---------------------------------------------------------------- 0x5407e0 / 0x5408c0 omdømmet set af en "seer"

/** seeren i 0x69d1b0: formanden, eller den falske post med klubbens nation (ev = null → kode 4) */
export interface Viewer { club: number; nation: number }
function scope(env: BoardEnv, s: Person, v: Viewer | null): number {
  if (!v) return 4;
  if (s.club) {
    if (s.club === v.club) return 0;
    if (v.club && env.clubNation(s.club) === env.clubNation(v.club)) return 0;
  }
  if (s.nation === v.nation) return 2;
  if (!env.foreign(s, v.nation)) return 2;
  if (v.club && !env.foreign(s, env.clubNation(v.club))) return 3;
  return 4;                                                            // (spillerposten +9 + klubbens ≥ 14000 → 3: stab har ingen spillerpost)
}
export function repFor(env: BoardEnv, s: Person, v: Viewer | null): number {
  const [H, C, W] = s.rep;
  switch (scope(env, s, v)) {
    case 4: return W;
    case 2: return H;
    case 0: return C;
    case 3: return s16(tdiv(W, 2) + tdiv(H, 2));
    default: return s16(tdiv(C, 2) + tdiv(H, 2));
  }
}

// ---------------------------------------------------------------- 0x69d1b0 score_staff_for_job (job 5 = manager)

export function scoreStaffForJob(env: BoardEnv, s: Person, c: number, job: number): number {
  if (!s.np) return -10000;
  const ch = env.chair(c);
  const age = s8(s.age);
  let cur = s8(s.job);
  if (cur === 0) cur = 11;                                             // (landsholdsjob +0x28 findes ikke i spillet)
  const crep = s16(env.clubRep(c));
  // seeren: formanden med ikke-spillerpost, ellers den falske post (klubbens nation, klub = c)
  const viewer: Viewer = { club: ch ? (ch.nation === -1 ? 0 : c) : c, nation: ch ? ch.nation : env.clubNation(c) };
  let sc = s16(repFor(env, s, ch ? { club: c, nation: ch.nation } : viewer));
  if ((cur === 12 || cur === 5) && crep > 4250) {
    sc += 25 * s16(s.ca);
    if (s16(s.rep[2]) > 3250) sc += 5 * s16(s.pa);
  }
  if (s.club === c) sc += s.human ? 100 : s8(s.b59) * s8(s.b59);
  // klubbens og formandens likes/dislikes: listerne findes ikke i spillet (0)
  if (job !== 5) return -10000;                                        // (kun managerjobbet bruges af MANAGER_MANAGER)
  if (!s.human) {
    const atClub = s.club === c;
    switch (cur) {
      case 5: break;
      case 6: if (atClub) sc = ftol(sc * 0.75); else { sc = ftol(sc * 0.6); if (crep > 5750) return -10000; } break;
      case 7: if (atClub) sc = ftol(sc * 0.5); else { sc = ftol(sc * 0.3); if (crep > 5250) return -10000; } break;
      case 8: if (atClub) sc = ftol(sc * 0.6); else { sc = ftol(sc * 0.475); if (crep > 5250) return -10000; } break;
      case 9: sc = ftol(sc * 0.2); if (crep > 3250) return -10000; break;
      case 11: if (atClub) sc = ftol(sc * 0.95); else { sc = ftol(sc * 0.75); if (crep > 5250) return -10000; } break;
      case 12: sc = ftol(sc * 0.95); break;
      case 13: if (atClub) sc = ftol(sc * 0.75); else { sc = ftol(sc * 0.6); if (crep > 5750) return -10000; } break;
      case 15: if (atClub) sc = ftol(sc * 0.6); else { sc = ftol(sc * 0.4); if (crep > 5750) return -10000; } break;
      case 16: sc = ftol(sc * 0.75); if (!atClub && crep > 5750) return -10000; break;
      default: sc = ftol(sc * 0.001); if (crep > 5750) return -10000; break;
    }
    if (age > 59) sc = ftol(sc * (crep > 7250 ? 0.9 : 0.95));
    else if (age < 38 && s16(s.rep[2]) < 4250) sc = ftol((age * 0.05 - 0.95) * sc);
    if (age < 45 && crep < 7000) {
      let pot = s16(s.pa) - s16(s.ca); if (pot > 50) pot = 50;
      const pat = ch ? s8(ch.b1d) : 10;
      sc += ftol(Math.pow(pot, 2.0) * pat * 0.1);
    }
    // forenelighed med formanden (hans ni egenskaber): formandens taktiske egenskaber findes ikke i world-filen – grenen kræver ev->np's
    // +0x0e..+0x22; vi har kun +0x16/+0x1d, så sammenligningen springes over (som uden formand)
    sc = ftol(sc * (1 + s8(s.at(0x11)) * (1 / 1200.0)));
    sc = ftol(sc * (1 + s8(s.at(0x10)) * (1 / 1200.0)));
    sc = ftol(sc * (1 + s8(s.at(0x17)) * 0.002));
    sc = ftol(sc * (1 + s8(s.at(0x18)) * 0.002));
    sc = ftol(sc * (1 + s8(s.at(0x19)) * 0.002));
    sc = ftol(sc * (1 + s8(s.at(0x1b)) * 0.002));
    const ft = crep > 7250 ? 0.008 : crep > 5750 ? 0.004 : 0.002;
    sc = ftol(sc * (1 + s8(s.at(0x21)) * ft));
    sc = ftol(sc * (1 + (s8(s.b59) - 10) * 0.005));
    sc = ftol(sc * (1 + (s8(s.det) - 10) * 0.005));
    sc = ftol(sc * (1 + (s8(s.pres) - 10) * 0.005));
    sc = ftol(sc * (1 + (s8(s.prof) - 10) * 0.005));
  }
  // TAIL
  const cn = env.clubNation(c);
  const NAT = s.club && env.clubNation(s.club) === cn ? cn : s.nation;
  if (crep > 4750 && cn >= 0 && s.nation >= 0 && env.foreign(s, cn) && !(s.club && env.clubNation(s.club) === cn)) {
    const cnb = s8(env.nat85(cn));
    let sn = s8(env.nat85(s.nation));
    let skip = false;
    if (s.club) {
      const scn = env.clubNation(s.club);
      if (scn >= 0 && s8(env.nat85(scn)) > sn) sn = s8(env.nat85(scn));
      if (s16(env.clubRep(s.club)) >= 6750) skip = true;
    }
    if (!skip && sn < cnb) {
      let f = (sn - cnb) * 0.025 + 1.0; if (f < 0.75) f = 0.75;
      if (cur !== 12 && cur !== 5) return -10000;
      sc = ftol(sc * f);
    }
  }
  {
    const div = env.division(c);
    if (crep > 7250 && div && cn >= 0 && s8(env.nat85(cn)) > 10) {
      const d = s.club ? s16(env.clubRep(s.club)) - crep : s16(s.rep[2]) - crep;
      sc += s16(ftol(d * 0.15));
      if (crep > 8250 && s16(s.rep[2]) < 4250) {
        if (env.foreign(s, cn)) return -10000;
        const sd = s.club ? env.division(s.club) : null;
        if (!s.club || !sd) return -10000;
        if (s16(env.divLevel(sd)) < s16(env.divLevel(div))) return -10000;
      }
      const wr = s16(s.rep[2]);
      const f = cur !== 12 && cur !== 5 ? wr * 2.5e-5 + 0.5 : env.foreign(s, cn) ? wr * 5e-5 + 0.5 : wr * 2.5e-5 + 0.75;
      sc = ftol(f * sc);
    } else if (env.foreign(s, cn)) {
      sc = ftol((s16(s.rep[2]) * 5e-5 + 0.5) * sc);
    }
  }
  if (cn >= 0) sc = ftol((s8(env.fluency(s, c)) * 0.05 + 0.5) * sc);
  if (NAT < 0) return ftol(sc * 0.25);
  switch (s8(env.nat7e(NAT))) {
    case 1: return sc;
    case 2: return cn >= 0 && env.nat7e(cn) === 1 ? ftol(sc * 0.75) : sc;
    case 3: return cn >= 0 && (env.nat7e(cn) === 1 || env.nat7e(cn) === 2) ? ftol(sc * 0.25) : sc;
    default: return ftol(sc * 0.05);
  }
}

// ---------------------------------------------------------------- 0x69f810 is_staff_suitable_for_job

function W(env: BoardEnv, c: number): number {
  const n = env.clubNation(c), r = s16(env.clubRep(c));
  return n >= 0 ? ftol(s8(env.nat85(n)) * r * 0.05) : ftol(r * 0.65);
}
export function suitable(env: BoardEnv, s: Person, c: number, minInterest: number): boolean {
  if (!s.np) return false;
  const [H, A, C] = s.rep.map(s16);
  const cn = env.clubNation(c), crep = s16(env.clubRep(c));
  if (C > 4250 && s.nation >= 0 && cn >= 0 && s.nation !== cn && s8(env.nat85(cn)) < 10) return false;
  if (H > 6250 && s.nation !== cn && s.job === 5 && crep < 5750) return false;
  // R3 (landshold) / R4 (spiller → manager): findes ikke i spillet
  const div = env.division(c), sdiv = s.club ? env.division(s.club) : null;
  if (s.job === 5 && div && s.club && sdiv) {
    if (s16(env.divLevel(div)) < s16(env.divLevel(sdiv))) return false;
    const srep = s16(env.clubRep(s.club));
    if (div === sdiv && crep - 1250 < srep) return false;
    if (srep > crep) return false;
    if (daysSince(env.today, s.joined) < (s8(s.b59) + 21) * 10 && srep > 5250) return false;
  }
  if (A <= 4750 && crep < 2250) return false;
  if ((s.b22 & 0xff) > 75 && crep < 3250) return false;
  if (env.retiring(s)) return false;
  if (crep < 2500 && s.nation === cn && H < 1500 && !s.club) return true;
  if (crep > 7750) {
    let v = s16(W(env, c)); if (v > 8250) v = s16(8250 - ftol((v - 8250) * -1.1));
    if (s.club) {
      let w = s16(W(env, s.club)); if (w > 8250) w = s16(8250 - ftol((w - 8250) * -1.1));
      if (v > s16(s8(s.b59) * 25) + w + 250) return true;
    }
  }
  const f = env.interest(s, c);
  return !(f < minInterest);
}

// ---------------------------------------------------------------- 0x69c540 best_manager_candidate_score

export function bestCandidateScore(env: BoardEnv, st: CmBoardState, c: number, exclude: Person | null): number {
  let best = -10000;
  const cn = env.clubNation(c), crep = s16(env.clubRep(c));
  for (const s of env.persons()) {
    if (exclude && s.id === exclude.id) continue;
    if (isVacancyCandidate(st, s)) continue;
    if (cn !== s.nation && s16(s.rep[1]) < 3750) continue;
    if (cn < 0 || s.nation < 0) continue;
    if (env.nat75(cn) !== env.nat75(s.nation) && (s16(s.rep[2]) < 4250 || crep < 4750)) continue;
    if (!suitable(env, s, c, 3.5)) continue;
    const v = scoreStaffForJob(env, s, c, 5);
    if (v > best) best = v;
  }
  return best;
}
const isVacancyCandidate = (st: CmBoardState, s: Person) => st.vac.some((e) => e.cand === s.id);

// ---------------------------------------------------------------- 0x68f130 / 0x694c80 / 0x69ba50's nulstilling

function clearFlags(R: BoardRec): void {
  R.b2 &= ~0x1f; R.b4 = 0; R.b3 &= 0xe1; R.b2 &= ~0xe0; R.d28 = 0; R.b5 = 0; R.b3 &= 0xfe; R.b40 &= 7;
}
function recOf(st: CmBoardState, c: number): BoardRec { return (st.rec[c] ??= newRec()); }

/** 0x68f130 (spillets start, på databasens dato): bestyrelsesposterne for alle klubber, forventningerne og de første ledige job */
export function initRecords(env: BoardEnv, st: CmBoardState, rand: Rand): void {
  for (const c of env.clubs) {
    const R = recOf(st, c);
    const rep = s16(env.clubRep(c));
    R.d41 = { day: 203, year: 1971 }; R.e = 0; R.t2c = 0; R.d18 = { ...env.today }; R.b0 = 0;
    R.q30 = (rep * rep) * 0.25; R.d38 = 0;
    const m = env.manager(c);
    if (m) {
      R.d20 = { ...NULLDATE };
      let f: number;
      let skip = false;
      if (!m.np && !m.human) f = f32(rep);
      else if (m.human) {
        if (m.np) f = f32(s16(m.rep[1])); else { f = 4500; skip = true; }
      } else {
        f = f32(s16(m.rep[1]));
        const t = rep * 0.75;
        if (s16(m.rep[1]) < t) m.rep[1] = s16(ftol(t));
      }
      if (!skip) {
        if (f === 0) f = rep !== 0 ? f32(rep * 0.75) : 5000;
        else if (f < 500) f = f32(rand(1000) + 500);
      }
      let gg = rep * 0.5 + 2500.0;
      if (gg === 0) gg = f * 1.5;
      else if (gg < 500) gg = rand(750) + 250;
      const x = f32(f32(f / gg) * 7500);
      const roll = (a: number) => { const r1 = rand(a); const t1 = f32(r1 + x); const r2 = rand(500); return s16(ftol(t1 - r2)); };
      R.w6 = roll(500); if (R.w6 < 5750) R.w6 = rand(750) + 5750; else if (R.w6 > 9500) R.w6 = 10000 - rand(500);
      R.w8 = roll(500); if (R.w8 < 5750) R.w8 = rand(500) + 5750; else if (R.w8 > 10000) R.w8 = 10000;
      R.wa = roll(1750); if (R.wa < 5500) R.wa = rand(250) + 5500; else if (R.wa > 10000) R.wa = 10000;
      R.wc = roll(2500); if (R.wc < 5500) R.wc = rand(250) + 5500; else if (R.wc > 10000) R.wc = 10000;
      R.w10 = R.w12 = R.w14 = R.w16 = 0;
      clearFlags(R); R.b40 = 0;
      setSeasonExpectations(env, st, c, true, rand);
    } else {
      R.w6 = R.w8 = R.wa = R.wc = 5000; R.e = 16;
      R.w10 = R.w12 = R.w14 = R.w16 = 0;
      clearFlags(R); R.b40 = 0;
      if (env.canBeManaged(c)) { setSeasonExpectations(env, st, c, true, rand); addVacancy(env, st, c, null, rand); }
    }
  }
}

/** 0x694c80 reset_board_for_new_manager */
export function resetForNewManager(env: BoardEnv, st: CmBoardState, c: number, rand: Rand): void {
  const R = recOf(st, c);
  R.b2 |= 1;
  setSeasonExpectations(env, st, c, true, rand);
  R.b2 |= 1;
  const m = env.manager(c);
  const rep = s16(env.clubRep(c));
  let f: number;
  if (m && m.np) {
    if (env.clubNation(c) === m.nation) {
      m.rep[1] = s16(ftol((rep - s16(m.rep[1])) * 0.1 + s16(m.rep[1])));
      m.rep[0] = s16(ftol((rep - s16(m.rep[0])) * 0.1 + s16(m.rep[0])));
    } else m.rep[1] = s16(ftol((rep - s16(m.rep[2])) * 0.1 + s16(m.rep[1])));
    f = f32(s16(m.rep[1]));
  } else f = 0;
  if (f === 0) f = rep !== 0 ? f32(tdiv(rep, 2)) : 5000;
  else if (f < 500) f = f32(rand(1000) + 500);
  let gg = f32(rep);
  if (gg === 0) gg = f; else if (gg < 500) gg = rand(750) + 250;
  let x = f32(f32(f / gg) * 7500);
  if (x > 10000) x = 10000; else if (x < 6500) x = 6500;
  const roll = () => { const r1 = rand(500); const t1 = f32(r1 + x); const r2 = rand(500); return s16(ftol(t1 - r2)); };
  R.w6 = roll(); if (R.w6 < 6250) R.w6 = rand(1250) + 6250; else if (R.w6 > 9500) R.w6 = 10000 - rand(500);
  { const a = rand(500), b = rand(500); R.w8 = s16(R.w6 - a + b); }
  if (R.w8 < 6250) R.w8 = rand(1250) + 6250; else if (R.w8 > 10000) R.w8 = 10000;
  R.wa = roll(); if (R.wa < 5250) R.wa = rand(250) + 5250; else if (R.wa > 10000) R.wa = 10000;
  R.wc = roll(); if (R.wc < 5750) R.wc = rand(250) + 5750; else if (R.wc > 10000) R.wc = 10000;
  R.w10 = R.w12 = R.w14 = R.w16 = 0;
  R.b2 &= 0xf7; R.b2 &= 0xfb; R.b2 &= 0xfd;
  R.d38 = 0; R.b4 = 0; R.b3 &= 0xe1; R.b2 &= 0xdf; R.d28 = 0; R.b5 = 0; R.b3 &= 0xfe; R.b40 &= 7;
  R.b1 = env.wealthBand(c);
}

// ---------------------------------------------------------------- 0x6a3770 set_season_expectations

export function setSeasonExpectations(env: BoardEnv, st: CmBoardState, c: number, postNews: boolean, rand: Rand): void {
  const R = recOf(st, c);
  const rep = s16(env.clubRep(c));
  let days = 0;
  let F = 0, t = 0;
  R.q30 = (rep * rep) * 0.25;
  R.d38 = R.d38 * 0.25;
  R.b0 = 0;
  const m = env.manager(c);
  const ch = env.chair(c);
  // (a) fyringskø for "gamle" managere
  if (!(R.b2 & 1) && m) {
    days = daysSince(env.today, m.joined);
    const conf = s16(R.w6);
    let add = false;
    if (days > 3650 && conf < 3500) { const r = rand(30); add = ch ? r > s8(ch.b1d) : r > 10; }
    else if (days > 1825 && conf < 3000) { const r = rand(20); add = ch ? r > s8(ch.b1d) : r > 10; }
    if (add) st.dep.push({ type: 1, reason: 6, club: c });
  }
  // (c) klub (landsholdene findes ikke som klubber i spillet)
  const [cl, uefa] = env.nationPlaces(c);
  let skipRep = false;
  if (m) {
    const div = env.division(c);
    const L = div ? env.league(div) : null;
    if (!div || !L || !env.activeLeague(c)) {
      F = 0x10;
    } else {
      const e = env.entry(c);
      const eu = env.euroEntry(c);
      if (!e || e.pos < 1) {
        t = 8; F |= 0x40;
        R.e = F & 0xffff; R.t2c = t;
        env.news({ t: 'expect', club: c, flags: F });
        return;
      }
      t = e.pos;
      const teams = L.teams;
      if (t === teams) t = teams - 1;
      switch (env.wealthBand(c)) {
        case -2: t += 1; break;
        case -1: if (t < 5) t += 1; break;
        case 0: { const b = env.transferBudget(c); if (b > 250 * rep && t > 5) t -= 1; break; }
        case 1: t -= t > 5 ? 2 : 1; break;
        case 2: t -= t > 5 ? 3 : 2; break;
      }
      const ld = env.lastDivision(c);
      if (ld && div !== ld) {
        if (s16(env.divLevel(div)) > s16(env.divLevel(ld))) { if (t > 10) t += 1; t += t > 5 ? 2 : 4; }
        else if (t > 10) t -= 7; else if (t > 5) t -= 3; else if (t > 2) t -= 2;
      } else {
        if (days < 365) t += 1;
        else if (days > 1095) { if (t > 10) t -= 1; }
      }
      if (t < 1) t = 1; else if (t > teams - 1) t = teams - 1;
      t = s8(t);
      if ((R.b2 & 1) && e.p74 >= 1 && e.p75 >= 1) {
        t = s8(ftol((t + e.p73) * 0.5));
        if (e.p74 > t) t = e.p74; else if (e.p75 < t) t = e.p75;
      }
      if (!L.autoPromo && t <= s8(cl)) F |= 0x02;
      else if (!env.isAustralia(c) && !L.autoPromo && t <= s8(cl) + s8(uefa)) F |= 0x01;
      else if (L.autoPromo && t <= s8(L.promo)) F |= 0x04;
      else if (s8(L.playoff) !== 0 && t <= s8(L.playoff)) F |= 0x08;
      else if (t <= tdiv(s16(teams), 2)) F = 0x40;
      else if (L.relegation && t >= s16(teams) - s8(L.relegation)) F |= 0x20;
      else if (L.relegation) F = 0x10;
      else F = 0;
      if (!(R.b2 & 1) && !L.autoPromo && ch) {
        const p = s8(ch.b1d);
        if (rand(50) > p + 5 * t) F |= 0x080;
        else if (rand(75) > p + 5 * t) F |= 0x100;
        else if (rand(100) > p + 5 * t) F |= 0x200;
        if (eu && eu.p74 <= 1) {
          const k = tdiv(29 - p, 5);
          const pos = eu.pos;
          if (pos <= k) F |= 0x400;
          else if (pos <= k + 4) { F ^= 0x080; F ^= 0x200; F |= 0x100; }
        }
      }
    }
    R.e = F & 0xffff; R.t2c = t;
    if (postNews) env.news({ t: 'expect', club: c, flags: F });
  } else { R.e = 0; R.t2c = 0; skipRep = false; }
  void skipRep;
  // REP
  if (s16(R.w6) < 6500) {
    R.w6 = s16(ftol((s16(R.w6) * 5.0 + 27500.0) * 0.1));
    R.w8 = s16(ftol((s16(R.w8) * 5.0 + 25000.0) * 0.1));
    R.wa = s16(ftol((s16(R.wa) * 5.0 + 25000.0) * 0.1));
    R.wc = s16(ftol((s16(R.wc) * 5.0 + 25000.0) * 0.1));
  }
  R.b1 = env.wealthBand(c);
  if (m && m.np && s16(m.rep[1]) < rep) {
    m.rep[1] = s16(m.rep[1] - ftol((rep - s16(m.rep[1])) * -0.1)); if (s16(m.rep[1]) > 10000) m.rep[1] = 10000;
    m.rep[2] = s16(m.rep[2] - ftol((rep - s16(m.rep[2])) * -0.05)); if (s16(m.rep[2]) > 10000) m.rep[2] = 10000;
  }
  if (m && m.np && rep > s16(m.rep[1])) m.rep[1] = s16(m.rep[1] - ftol((rep - s16(m.rep[1])) * -0.1));
  if (m && m.human && s8(m.b59) < 20) m.b59++;
  R.b2 &= 0xfe; R.b4 = 0; R.b3 &= 0xe1; R.b2 &= 0xdf; R.d28 = 0; R.b5 = 0; R.b3 &= 0xfe; R.b40 &= 7;
  R.w12 = 0; R.w14 = 0; R.w16 = 0;
}

// ---------------------------------------------------------------- 0x69ba50 add_job_vacancy

export function addVacancy(env: BoardEnv, st: CmBoardState, c: number, prev: Person | null, rand: Rand): void {
  const crep = s16(env.clubRep(c));
  if (!env.division(c) && crep < 5000) return;
  const e: Vacancy = { altFound: 0, rumourDone: 0, alt: -1, cand: -1, prev: prev ? prev.id : -1, club: c, score: 0, date1: { day: 40, year: 1972 }, date2: { day: 40, year: 1972 } };
  let best = -1000000;
  const R = recOf(st, c);
  R.w6 = R.w8 = R.wa = R.wc = 5000; R.b0 = 0; R.e = 16; R.w10 = R.w12 = R.w14 = R.w16 = 0;
  R.b2 &= ~0x1f; R.b4 = 0; R.b3 &= 0xe1; R.b2 &= ~0xe0; R.d28 = 0; R.b5 = 0; R.b3 &= ~1; R.b40 &= 7;
  const cn = env.clubNation(c);
  const persons = env.persons();
  // FASE 1
  for (const s of persons) {
    if (prev && s.id === prev.id) continue;
    if (s.human && !env.canBeManaged(c)) continue;
    if (isVacancyCandidate(st, s)) continue;
    if (cn < 0 || s.nation < 0) continue;
    if (cn !== s.nation && s16(s.rep[1]) < 3750) continue;
    if (env.nat75(cn) !== env.nat75(s.nation)) { if (s16(s.rep[2]) < 4250) continue; if (crep < 4750) continue; }
    if (!suitable(env, s, c, 3.5)) continue;
    const v = scoreStaffForJob(env, s, c, 5);
    if (v > best) { e.cand = s.id; e.score = best; best = v; }
  }
  if (e.cand === -1) {
    const a = env.assistant(c) ?? env.firstCoach(c);
    if (a) { e.cand = a.id; e.score = 0; }                               // (+0x12 er uinitialiseret stak i originalen – 0 her)
    else {
      // NØDSØGNING: baglæns fra rækken N − 17
      const ai = persons.filter((p) => !p.human);
      let found = false;
      for (let k = ai.length - 1; k >= 0; k--) {
        const s = ai[k];
        if (![0, 5, 6, 7, 8, 11, 12, 15].includes(s.job)) continue;
        if (isVacancyCandidate(st, s)) continue;
        if (s.club && (env.activeLeague(s.club) || s16(env.clubRep(s.club)) > 6500) && s.job === 5) continue;
        e.cand = s.id; e.score = 100; found = true; break;
      }
      if (!found) return;
    }
  }
  // FASE 2: rygtekandidaten
  e.altFound = 0; e.rumourDone = 0; e.alt = -1;
  if (crep > 4500 && crep > rand(2000) + 4500) {
    let best2 = -1000000;
    const n = persons.length;
    for (let k = 0; k < n; k++) {
      const s = persons[rand(n)];
      if (prev && s.id === prev.id) continue;
      if (!suitable(env, s, c, 3.15)) continue;
      if (daysSince(env.today, s.joined) < 150) continue;
      if (isVacancyCandidate(st, s)) continue;
      const v = scoreStaffForJob(env, s, c, 5);
      if (v > best2) { e.altFound = 1; e.alt = s.id; best2 = v; }
    }
  }
  const cand = env.person(e.cand);
  // DATOERNE
  const gs0 = env.gameStart, today = env.today;
  if (after(gs0, today)) {
    e.date2 = { year: gs0.year, day: (rand(7) + gs0.day + 1) & 0xffff };
    if (s16(e.date2.day) > 364) { e.date2.day = rand(5); e.date2.year++; }
    e.date1 = { year: e.date2.year, day: (rand(7) + e.date2.day + 1) & 0xffff };
    if (rand(200) === 0) e.date1.day += rand(20);
  } else {
    e.date2 = { year: today.year, day: (rand(3) + today.day + 1) & 0xffff };
    if (s16(e.date2.day) > 364) { e.date2.day = rand(5); e.date2.year++; }
    e.date1 = { year: e.date2.year, day: 0 };
    if (cand && cand.club && env.isHumanClub(cand.club) && cand.job !== 5) { e.date1.day = rand(5) + e.date2.day + 10; }
    e.date1.day = prev && prev.human ? rand(5) + e.date2.day + 7 : rand(5) + e.date2.day + 4;
    if (rand(500) === 0) e.date1.day += rand(20);
  }
  if (s16(e.date1.day) > 364) { e.date1.day = rand(5) + 4; e.date1.year++; }
  st.vac.push(e);
  if (env.manager(c)) return;
  if (!env.canBeManaged(c)) return;
  for (const h of persons) if (h.human && env.humanOnHolidaySearching(h) && (!h.club || s16(env.clubRep(h.club)) < crep)) applyForJob(env, st, c, h, rand);
}

// ---------------------------------------------------------------- 0x69ca00 apply_for_job

export function applyForJob(env: BoardEnv, st: CmBoardState, c: number, a: Person, rand: Rand): void {
  if (a.club && rand(4) !== 0) {
    if (daysSince(env.today, a.joined) < 180) {
      if (s8(a.b59) > 1) a.b59--;
      if (rand(tdiv(s8(a.b59), 3)) === 0) env.news({ t: 'boardMemo', human: a, employer: a.club, target: c });
    } else if (rand(s8(a.b59) + 5) === 0) env.news({ t: 'boardMemo', human: a, employer: a.club, target: c });
    const B = recOf(st, a.club);
    if (s16(env.clubRep(a.club)) > s16(env.clubRep(c))) { B.w6 = s16(ftol(B.w6 * 0.9)); B.w8 = s16(ftol(B.w8 * 0.75)); B.wa = s16(ftol(B.wa * 0.9)); B.wc = s16(ftol(B.wc * 0.9)); }
    else { B.w6 = s16(ftol(B.w6 * 0.975)); B.w8 = s16(ftol(B.w8 * 0.95)); B.wa = s16(ftol(B.wa * 0.975)); B.wc = s16(ftol(B.wc * 0.975)); }
    B.d20 = { ...env.today };
  }
  if (a.human) {
    if (s16(a.rep[0]) < 1500) a.rep[0] = 1500;
    if (s16(a.rep[1]) < 1250) a.rep[1] = 1250;
    if (s16(a.rep[2]) < 250) a.rep[2] = 250;
  }
  const score = a.np ? scoreStaffForJob(env, a, c, 5) : -250000;
  let e = st.vac.find((x) => x.club === c);
  if (!e) { addVacancy(env, st, c, null, rand); e = st.vac.find((x) => x.club === c); if (!e) return; }
  // (Staff_Records' historik "afvist inden for 180 dage" findes ikke i spillet)
  env.news({ t: 'applyReply', club: c, human: a, dismissed: false });
  if (score > e.score && e.cand !== (a.id === 0 ? 1 : 0)) {
    const loc = { ...e, cand: a.id, score };
    st.vac.splice(st.vac.indexOf(e), 1);
    st.vac.push(loc);
  }
}

// ---------------------------------------------------------------- 0x6a4f80 jobtilbuddet til mennesket

function jobOfferToHuman(env: BoardEnv, st: CmBoardState, c: number, h: Person, rand: Rand): void {
  if (env.manager(c)) return;
  const R = recOf(st, c);
  R.d38 = 0;
  const budget = env.transferBudget(c);
  const bit = R.b2 & 1;
  env.setManager(c, h, -2);                                            // midlertidigt (som om han havde jobbet)
  R.b2 |= 1;
  setSeasonExpectations(env, st, c, false, rand);
  env.setManager(c, null, -2);
  R.b2 = (R.b2 & ~1) | bit;
  const flags = s16(R.e);
  const variant = rand(2);
  env.news({ t: 'jobOffer', club: c, human: h, budget, flags, variant });
}

// ---------------------------------------------------------------- 0x69b650 / 0x69b790

function removeClubManager(env: BoardEnv, st: CmBoardState, c: number, type: number, reason: number, keep: boolean): void {
  const m = env.manager(c);
  if (!m) return;
  m.joined = { ...env.today };
  env.setManager(c, null, -1);
  if (type !== 3) env.news({ t: 'departed', club: c, manager: m, type, reason });
  if (!keep) recOf(st, c).w6 = 3500;
}
export function processDepartures(env: BoardEnv, st: CmBoardState, rand: Rand): void {
  const L = st.dep;
  // NB: tælleren og antallet mødes – kun ceil(n/2) poster pr. dag (originalens løkke)
  let i = 0, k = 0;
  while (i < L.length) {
    const e = L[k];
    if (!e) break;
    const m = env.manager(e.club);
    if (m) {
      removeClubManager(env, st, e.club, e.type, e.reason, false);
      if (env.canBeManaged(e.club)) addVacancy(env, st, e.club, m, rand);
    }
    L.splice(k, 1);
    i++;
  }
}

// ---------------------------------------------------------------- 0x68f9c0 daily_update

export function boardDaily(env: BoardEnv, st: CmBoardState, rand: Rand, weeklyFn: (rand: Rand) => void): void {
  const today = env.today;
  const month = new Date(cmToIso(today) + 'T00:00:00Z').getUTCMonth();
  if (st.month < 0) st.month = month;
  else if (month !== st.month) {
    st.month = month;
    for (const c of env.clubs) {
      if (!after(env.gameStart, today)) { const m = env.manager(c); env.news({ t: 'confidence', club: c, days: m ? ((today.year & 0xffff) - (m.joined.year & 0xffff)) * 365 - s16(m.joined.day) + s16(today.day) : 100 }); }
    }
    fixMissingJobs(env, st, rand);
  }
  for (const h of env.persons()) {
    if (!h.human || !h.club) continue;
    const T180 = isoToCm(addIso(cmToIso(today), -180));
    if (after(T180, h.joined)) recOf(st, h.club).b2 &= 0xfe;
  }
  if (s16(today.day) % 7 === 0) weeklyFn(rand);
  processDepartures(env, st, rand);
  // ledighedslisten (en kopi af rækkefølgen; poster tilføjet bagerst besøges, hvis der stadig var en næste post)
  let idx = 0;
  while (idx < st.vac.length) {
    const e = st.vac[idx];
    const isLast = idx === st.vac.length - 1;
    const len0 = st.vac.length;
    const removeE = () => { const j = st.vac.indexOf(e); if (j >= 0) st.vac.splice(j, 1); };
    const step = () => {                                                // næste post: efter fjernelse står den næste på samme plads
      if (!st.vac.includes(e)) { if (isLast) idx = len0; /* nye poster efter den sidste besøges ikke */ }
      else idx++;
    };
    if (after(today, e.date1)) {
      const s = env.person(e.cand);
      const R = recOf(st, e.club);
      if (s && s.human) {
        if (s.club && daysSince(today, s.joined) < 90) { R.d20 = { ...NULLDATE }; addVacancy(env, st, e.club, s, rand); removeE(); }
        else { jobOfferToHuman(env, st, e.club, s, rand); removeE(); addVacancy(env, st, e.club, s, rand); }
        step(); continue;
      }
      if (!s || !s.np) { R.d20 = { ...NULLDATE }; removeE(); addVacancy(env, st, e.club, s, rand); step(); continue; }
      if (env.manager(e.club) || env.underOffer(s)) { R.d20 = { ...NULLDATE }; removeE(); step(); continue; }
      // UDNÆVNELSEN
      const old = s.club || 0;
      if (old) {
        const om = env.manager(old);
        if (om && om.id === s.id && env.canBeManaged(old)) { setSeasonExpectations(env, st, old, true, rand); addVacancy(env, st, old, s, rand); }
      }
      R.d20 = { ...NULLDATE };
      env.news({ t: 'appointed', club: e.club, manager: s, prev: old, kind: old && s.job === 5 ? 3 : 2 });
      s.joined = { ...today };
      env.setManager(e.club, s, old);
      R.b1 = env.wealthBand(e.club);
      removeE();
      resetForNewManager(env, st, e.club, rand);
      step(); continue;
    }
    if (e.altFound && after(today, e.date2) && !e.rumourDone && e.alt !== -1) {
      e.rumourDone = 1;
      const a = env.person(e.alt);
      if (!env.manager(e.club) && a && a.club) {
        if (rand(4) !== 0 && !after(env.gameStart, today)) env.news({ t: 'rumour', club: e.club, staff: a, variant: rand(4) });
      }
    }
    idx++;
  }
}
const addIso = (iso: string, n: number) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

/** 0x69d060 fix_missing_jobs (ved månedsskifte) */
function fixMissingJobs(env: BoardEnv, st: CmBoardState, rand: Rand): void {
  for (const c of env.clubs) {
    if (env.manager(c) || !env.canBeManaged(c)) continue;
    if (st.vac.some((e) => e.club === c)) continue;
    addVacancy(env, st, c, null, rand);
  }
}

// ---------------------------------------------------------------- 0x695240 update_board_after_match

export interface MatchSide {
  club: number;
  /** rækkerne: karakter (+0x35, 1..10), minutter spillet (efter originalens regler), udvist i minut (−1) og spillerens omdømme set af modstanderen */
  rows: { rating: number; minutes: number; redAt: number; rep: number }[];
  /** holdblokkens +8/+9 */
  b8: number; b9: number;
}
export interface MatchIn {
  home: number; away: number;
  /** kampens længde i minutter (+0x4d) */
  len: number;
  /** fixturens koder (gameInputs.ts fixtureCodesOf): +0x3a, +0x30, +0x32, +0x38 */
  b3a: number; w30: number; w32: number; w38: number;
  gh: number; ga: number;                    // +0x43/+0x44 (eller +0x47/+0x48 efter forlænget spilletid)
  aggH: number; aggA: number;                // +0x4b/+0x4c samlet (0xff = ingen dobbeltkamp)
  penH: number; penA: number;                // +0x49/+0x4a
  compRep: number | null;                    // fixture +0x14 → +0x69; null = ingen turnering
  isDivision: (club: number) => boolean;     // comp == club->division
  friendly: boolean;
  inContention: (club: number) => boolean;
  /** derby: samme by / rivaler / afstand */
  derby: (club: number, opp: number) => 0 | 0x40 | 0x80;
  venueHome: boolean;                        // spillestedet er hjemmeholdets stadion
  sides: [MatchSide, MatchSide] | null;
}

/** 0x6951e0 → 0x695240 for begge hold med manager */
export function afterMatch(env: BoardEnv, st: CmBoardState, m: MatchIn, rand: Rand): void {
  if (env.manager(m.home)) afterMatchSide(env, st, m, true, rand);
  if (env.manager(m.away)) afterMatchSide(env, st, m, false, rand);
}

function afterMatchSide(env: BoardEnv, st: CmBoardState, m: MatchIn, isHome: boolean, rand: Rand): void {
  const club = isHome ? m.home : m.away, opp = isHome ? m.away : m.home;
  const away = !isHome;
  const R = recOf(st, club);
  const crep = s16(env.clubRep(club)), orep = s16(env.clubRep(opp));
  let dflt = 0.5, w: number;
  const isDiv = m.isDivision(club);
  if (m.compRep === null) w = 0.01;
  else if (!m.inContention(club)) w = 0.2;
  else if (m.friendly) w = 0.05;
  else if (isDiv) { dflt = s16(m.compRep) * 0.06 + 0.27; w = 1.0; }
  else {
    const x = Math.abs(s16(m.compRep) * 500 - crep);
    w = 1.0 - x * (1 / 15000);
    if (m.b3a === 8) w *= 1.25;
    switch (s16(m.w30)) { case 120: w *= 1.25; break; case 130: w *= 1.5; break; case 140: w *= 0.75; break; case 150: w *= 2; break; case 160: w *= 2; break; }
  }
  // spillestedet
  let delta = isHome ? (m.venueHome ? -20 : 0) : (m.venueHome ? (env.clubNation(opp) !== env.clubNation(club) ? 30 : 20) : 0);
  let S: number;
  if (m.sides) {
    const own = m.sides[away ? 1 : 0], O = m.sides[isHome ? 1 : 0];
    let mins = 0, wsum = 0, red = 0;
    for (const r of own.rows) {
      const t = s8(r.minutes);
      if (r.redAt >= 0) red += m.len - s16(s8(r.redAt));
      if (t === 0) continue;
      mins += t; wsum += (r.rating & 0xff) * t;
    }
    const avg = mins ? wsum / mins : dflt;
    const P = ((own.b8 & 0xff) - 10) * (1 / 30) + avg + ((own.b9 & 0xff) - 10) * (1 / 30) + ((own.b8 & 0xff) - (O.b8 & 0xff)) * 0.02 + s16(red) * (1 / 150) + 0.1;
    delta += ftol((P * 67.0 - 470.0) * dflt);
    let m2 = 0, w2 = 0;
    for (const r of O.rows) { const t = s8(r.minutes); if (t) { m2 += t; w2 += r.rep * t; } }
    const avgRep = m2 ? Math.trunc(w2 / m2) : 0;
    const q = s16(tdiv(-(crep - tdiv(orep + avgRep, 2)), 40));
    S = q < -100 ? -100 : q > 100 ? 100 : q;
    delta += S;
  } else {
    const q = s16(tdiv(orep - crep, 35));
    S = q < -100 ? -100 : q > 100 ? 100 : q;
    delta += S;
  }
  // resultatet
  const GF = isHome ? m.gh : m.ga, GA = isHome ? m.ga : m.gh;
  let flags = 0;
  const sv = tdiv(s16(S), 10);
  let skipLegs = false;
  if (GF > GA) { flags = 0x800; delta += (GF - GA) * (sv + 20); }
  else if (GF < GA) {
    flags = 0x1000; delta += (GF - GA) * (20 - sv);
    if (m.compRep !== null && !m.friendly) {
      if (GA - GF > 10) { delta *= 5; if (s16(delta) < 1250) { delta = 1250; skipLegs = true; } }
      else if (GA - GF > 5) delta *= 2;
    }
    const mgr = env.manager(club);
    if (!skipLegs && s16(delta) < -50 && mgr && mgr.np && !env.isHumanClub(club)) {
      const r = rand(6);
      // klubbens stemning [0xae2d14]+6·klub+4 < 0 og formandens tålmodighed → FA-klagen 0x6a9e60 (ikke porteret: klubstemningen er spillets)
      void r;
    }
  } else {
    flags = 0x400;
    if (m.b3a === 8) {
      if (s16(m.w32) >= 0x41f && s16(m.w32) <= 0x426 && away) delta += 15;
      if ([123, 124, 133, 134, 153, 154].includes(s16(m.w30))) delta += away ? 10 * GF : -5 * GA;
    }
  }
  if (!skipLegs && (m.aggH & 0xff) !== 0xff) {
    const H = s8(m.aggH), A = s8(m.aggA);
    const win = (n: number) => { delta += n; flags |= 0x200; }, loss = (n: number) => { delta -= n; flags |= 0x100; };
    if (H > A) isHome ? win(20) : loss(20);
    else if (H < A) isHome ? loss(20) : win(20);
    else if (s8(m.penH) > s8(m.penA)) isHome ? win(10) : loss(10);
    else if (s8(m.penH) < s8(m.penA)) isHome ? loss(10) : win(10);
    else if (!(m.w38 & 4)) {
      if (H - s8(m.gh) > s8(m.ga)) isHome ? loss(15) : win(15);
      else isHome ? win(15) : loss(15);
    }
  }
  // derby
  flags |= m.derby(club, opp);
  if (flags & 0x40) { w *= 2.25; if (flags & 0x800) delta += 12; else if (flags & 0x1000) delta -= 12; }
  else if (flags & 0x80) { w *= 1.5; if (flags & 0x800) delta += 5; else if (flags & 0x1000) delta -= 5; }
  let f = w;
  if (m.b3a === 8) {
    if (R.e & 0x400) { f *= 2; if (s16(delta) < 0) delta = ftol(s16(delta) * 1.5); }
    else f *= 1.5;
  }
  delta = ftol(s16(delta) * f);
  if ((flags & 0x800) && s16(delta) < 0) delta = tdiv(s16(delta), 3);
  if ((flags & 0x1000) && s16(delta) > 0) delta = tdiv(s16(delta), 3);
  if ((flags & 0x200) && s16(delta) < 0) delta = tdiv(s16(delta), 2);
  if ((flags & 0x100) && s16(delta) > 0) delta = tdiv(s16(delta), 2);
  // reaktionsflagene og nyheden
  const C6 = s16(R.w6);
  if (GF + 5 < GA) flags |= C6 < 4275 ? 1 : 2;
  else if (GF - 5 > GA) flags |= 8;
  else if (s16(delta) < -120 && C6 < 4275) flags |= 1;
  else if (s16(delta) < -75 && C6 < 6500) flags |= 2;
  else if (s16(delta) < -30) flags |= 4;
  else if (s16(delta) > 120 && C6 > 6500) flags |= 8;
  else if (s16(delta) > 75) flags |= 0x20;
  else if (s16(delta) > 30) flags |= 0x10;
  if (!(m.w38 & 0x10) && !(m.w38 & 0x800) && !(m.w38 & 0x2000) && env.isHumanClub(club) && (flags & 0x3f)) {
    let fl = flags;
    if (C6 > 6750) { if (fl & 1) fl ^= 5; else if (fl & 2) fl ^= 6; }
    else if (C6 > 5250) { if (fl & 1) fl ^= 3; }
    else if (C6 < 5250) { if (fl & 8) fl ^= 0x28; }
    if ((fl & 7) === 0 || crep >= s16(orep + 500 + 1250 * (away ? 1 : 0)) || m.gh !== m.ga) {
      // 0x6aaee0: formandens yndlinge/uvenner (listerne findes ikke) – rand(np+0x16) og rand(10) trækkes, før listen læses
      const ch = env.chair(club);
      if (ch) { rand(s8(ch.b16)); rand(10); }
      rand(4);
      env.news({ t: 'match', club, opp, flags: fl, gf: GF, ga: GA });
    }
  }
  // pressehistorien efter et dårligt resultat
  if (!(flags & 0x800) && !(flags & 0x200) && !(m.w38 & 0x10) && !(m.w38 & 0x800) && !(m.w38 & 0x2000) && env.canBeManaged(club)) {
    const d = s16(delta), C8 = s16(R.w8);
    let story = false;
    if (d < -90 - rand(90) && C8 + 10 * d < 4000 - rand(2000)) story = true;
    else if (d < -30 - rand(120) && C8 + 10 * d < 2200) story = true;
    if (story) R.w16 = s16(R.w16 - 250);                               // (0x74b060's egne tal trækkes ikke)
  }
  // tilliden
  const mgr = env.manager(club);
  if (s16(delta) < 0 && mgr && env.retiring(mgr)) delta = ftol(s16(delta) * 0.5);
  const d = s16(delta);
  R.w6 = s16(R.w6 + ftol(d * 0.7)); R.wa = s16(R.wa + ftol(d * 0.5)); R.w8 = s16(R.w8 + ftol(d * 1.15)); R.wc = s16(R.wc + ftol(d * 0.2));
  const cl = (v: number) => (v > 10000 ? 10000 : v < 1 ? 1 : v);
  R.w6 = cl(R.w6); R.wa = cl(R.wa); R.w8 = cl(R.w8); R.wc = cl(R.wc);
  if (d > 0 && mgr) {
    if (m.compRep !== null && s16(m.compRep) > 5) {
      const Rr = s16(m.compRep) * 500, r30 = s16(m.w30);
      const up = (a: number, b: number) => { R.w6 = Math.max(R.w6, a); R.w8 = Math.max(R.w8, b); };
      if (Rr > crep) {
        if (r30 === 130 || r30 === 120) up(6500, 6500);
        else if (r30 === 150) up(8500, 8500);
        else if (isDiv) { /* */ }
        else if (crep < 3750 || m.b3a === 8) up(4275, 6500);
      } else {
        if (r30 === 130 || r30 === 150) up(6500, 6500);
        else if (isDiv) { /* */ }
        else if (r30 === 120 || m.b3a === 8) up(4275, 4275);
      }
    }
  } else if (d < 0 && m.compRep !== null && s16(m.w30) === 150 && m.b3a === 5 && (R.e & 4)) {
    if (R.w6 > 4275) R.w6 = 4275; else if (R.w8 > 3500) R.w6 = 3500;
    if (R.w8 > 4275) R.w8 = 4275; else if (R.w8 > 3500) R.w8 = 3500;
  }
  if (mgr && d < -75 && s16(R.w8) < 3000) env.news({ t: 'protest', club });
  if (!isDiv && d >= 0) { const j = st.ult.indexOf(club); if (j >= 0) st.ult.splice(j, 1); return; }
  if (s16(m.w30) === 160) return;
  considerDeparture(env, st, club, GF < GA, rand);
}

// ---------------------------------------------------------------- 0x69aba0 consider_sacking_manager

export function considerDeparture(env: BoardEnv, st: CmBoardState, c: number, lost: boolean, rand: Rand): void {
  const today = env.today;
  if (after(env.gameStart, today)) return;                             // 0x456770: i dag < spillets start
  const R = recOf(st, c);
  if (R.b2 & 2) return;
  if (lost && resolveUltimatum(env, st, c)) return;
  if (s16(R.w6) > 4275) return;
  const m = env.manager(c);
  if (!m) return;
  if (daysSince(today, m.joined) < 150) return;
  const ch = env.chair(c);
  // (a) en anset manager beskyttes
  if (m.np && s16(m.rep[1]) > 5000 && s16(s16(env.clubRep(c)) - 750) < s16(m.rep[1]) && daysSince(today, m.joined) < 400) {
    if (rand(ch ? s8(ch.b1d) : 10) !== 0) { R.w6 = 4275; return; }
  }
  // (b) tærsklen
  const w6 = s16(R.w6);
  let thr = w6 > 3500 ? 10 : w6 <= 3000 ? 500 : 200;
  // (c) ligasituationen
  const div = env.division(c);
  const L = div ? env.league(div) : null;
  const e = L ? env.entry(c) : null;
  if (L && e) {
    const P2 = ch ? s8(s8(ch.b1d) >> 1) : 5;
    if (s8(L.playoff) !== 0 && e.p74 <= s8(L.playoff) && e.played > 30 - P2) return;
    if (L.autoPromo && e.p74 <= s8(L.promo) && e.played > 30 - P2) return;
    if (e.formN > 0 && Math.trunc(e.formPts / e.formN) > 2.0) return;
    if (e.winRun > 1) { if (thr === 10) return; if (e.winRun > 2) return; if (thr === 200) thr = 50; }
    else if (e.unbeatenRun > 1) { if (thr === 10) return; if (e.unbeatenRun > 3) return; if (thr === 200) thr = 100; }
    else if (e.noWinRun > 1) thr = ftol(s16(thr) * 1.5);
    else if (e.lossRun > 1) { if (thr === 10) thr = 200; else if (thr === 200) thr = 300; }
  }
  // (d) meldt pension
  const T = env.retiring(m) ? ftol(s16(thr) * 0.25) : thr;
  // (e) første terning
  if (ch) { if (rand(s16(50 * s8(ch.b1d))) > s16(T)) return; }
  else if (rand(500) > s16(T)) return;
  // (f) ultimatum
  if (ch) { if (rand(s8(ch.b1d) + 1) === 0 && issueUltimatum(env, st, c, rand)) return; }
  else if (rand(11) === 0 && issueUltimatum(env, st, c, rand)) return;
  // (g) managerens egen afgang
  if (!m.human && !env.retiring(m) && rand(s8(m.pres)) === 0 && rand(4) === 0) {
    st.dep.push({ type: 2, reason: departureReason(env, st, c, rand), club: c });
    R.b2 |= 2; return;
  }
  // (h) bestyrelsens beslutning
  const compare = (): boolean => {
    const cur = m.np ? scoreStaffForJob(env, m, c, 5) : 0;
    const best = bestCandidateScore(env, st, c, m);
    if (cur > best + 450) {
      R.w6 = s16(ftol(s16(R.w6) * 0.9)); if (s16(R.w6) < 1) R.w6 = 1;
      if (daysSince(today, R.d18) > 30) pressureNews(env, st, c, 1, rand);
      return true;
    }
    return false;
  };
  if (ch) {
    if (div && rand(s8(ch.b1d)) < 5 && rand(20) !== 0) {
      if (compare()) return;
      if (m.np) { m.rep[1] = s16(m.rep[1] - 250); if (s16(m.rep[1]) < 1500) m.rep[1] = 1500; }
    } else {
      if (daysSince(today, R.d18) > 14) pressureNews(env, st, c, 2, rand);
      return;
    }
  } else {
    if (div && rand(3) === 0) { if (compare()) return; }
    if (m.np) { m.rep[1] = s16(m.rep[1] - 250); if (s16(m.rep[1]) < 1) m.rep[1] = 1; }
  }
  st.dep.push({ type: 1, reason: departureReason(env, st, c, rand), club: c });
  R.b2 |= 2;
}

/** 0x69b350 get_departure_reason (0..11) */
function departureReason(env: BoardEnv, st: CmBoardState, c: number, rand: Rand): number {
  const R = recOf(st, c);
  const inSeason = env.inSeason(c);
  const run = currentRun(env, c);
  // 9: mindst 3 spillere med kontraktflaget 0x10000000 – flaget findes ikke i spillet (0)
  if (inSeason) {
    const div = env.division(c), L = div ? env.league(div) : null, e = L ? env.entry(c) : null;
    if (L && e && e.played > 25 && e.noWinRun > 1 && L.relegation) {
      const line = s16(L.teams) - s8(L.relegation);
      if (e.p73 >= line && e.projected < line) return 11;
    }
    if (R.q30 < R.d38 && s16(R.w12) < -300) return 10;
  }
  if (s16(R.w12) < -750 && run.type !== 1 && rand(3) === 0) return 2;
  if (inSeason && (R.b2 & 8)) return 7;
  if (s16(R.w10) < -350) return 3;
  if (s16(R.w14) < -750) return 5;
  if (s16(R.wa) < s16(R.w6)) { const r1 = rand(s16(R.w6)); const r2 = rand(s16(R.wa)); if (r2 < r1) return 8; }
  if (s16(R.w16) < -750 && rand(3) !== 0) return 4;
  const m = env.manager(c);
  if (m && daysSince(env.today, m.joined) > rand(2000) + 1000) return 6;
  return 0;
}

/** 0x690c30 get_current_run: 1 sejre, 3 nederlag, 4 uden sejr, 2 ubesejret, 5 intet (inden for 10 dage) */
export function currentRun(env: BoardEnv, c: number): { type: number; len: number } {
  const e = env.division(c) ? env.entry(c) : null;
  if (!e || e.lastDays >= 10) return { type: 5, len: 0 };
  if (e.winRun > 1) return { type: 1, len: e.winRun & 0xff };
  if (e.lossRun > 1) return { type: 3, len: e.lossRun & 0xff };
  if (e.noWinRun > 1) return { type: 4, len: e.noWinRun & 0xff };
  if (e.unbeatenRun > 1) return { type: 2, len: e.unbeatenRun & 0xff };
  return { type: 5, len: 0 };
}

/** 0x6ac470 resolve_board_ultimatum */
function resolveUltimatum(env: BoardEnv, st: CmBoardState, c: number): boolean {
  for (let i = 0; i < st.ult.length; i++) {
    if (st.ult[i] !== c) continue;
    st.ult.splice(i, 1); i--;
    const m = env.manager(c);
    if (m && daysSince(env.today, m.joined) > 100) {
      const e = env.division(c) ? env.entry(c) : null;
      st.dep.push({ type: 1, reason: e && e.noWinRun > 0 ? 2 : e ? 7 : 2, club: c });
      recOf(st, c).b2 |= 2;
      return true;
    }
  }
  return false;
}

/** 0x6ac560 issue_board_ultimatum: næste uspillede kamp inden for 8 uger (med turnering) */
function issueUltimatum(env: BoardEnv, st: CmBoardState, c: number, rand: Rand): boolean {
  if (!env.manager(c) || !env.division(c)) return false;
  const nx = env.nextFixture(c, 56);
  if (!nx) return false;
  if (!nx.hasComp) return false;
  rand(5);                                                             // nyhedens tekstvariant (slot 7)
  if (s16(env.clubRep(c)) >= 5750) rand(3);
  env.news({ t: 'ultimatum', club: c, opp: nx.opp });
  st.ult.push(c);
  return true;
}

/** 0x6a0e70 post_manager_under_pressure_news */
function pressureNews(env: BoardEnv, st: CmBoardState, c: number, kind: number, rand: Rand): void {
  const m = env.manager(c);
  if (!m) return;
  if (after(env.gameStart, env.today)) return;
  const R = recOf(st, c);
  const w6 = s16(R.w6);
  if (s16(R.w8) < w6 - 500 && rand(3) === 0) { /* variant 2 */ }
  else if (s16(R.wa) < w6 - 500 && rand(3) === 0) { /* 1 */ }
  else if (s16(R.wc) < w6 - 500 && rand(3) === 0) rand(5);
  rand(10);
  env.news({ t: 'pressure', club: c, kind });
  R.d18 = { ...env.today };
}

// ---------------------------------------------------------------- 0x690b70 / 0x690bd0

export const confidenceBand = (v: number) => { v = s16(v); return v < 3000 ? 0 : v < 3500 ? 1 : v < 4275 ? 2 : v < 6500 ? 3 : v < 8500 ? 4 : v < 9500 ? 5 : 6; };
export const leagueBand = (v: number) => { v = s16(v); return v < -2000 ? 0 : v < -1000 ? 1 : v < -500 ? 2 : v < 500 ? 3 : v < 1000 ? 4 : v < 2000 ? 5 : 6; };

// ---------------------------------------------------------------- managerens omdømme efter kampen (0x6b6cc0 ← 0x6d3610)

/** 0x6b6cc0: managerens tre værdier sættes til 0x6d3610's; assistenten og trænerne får en fjerdedel af ændringen */
export function managerRepAfterMatch(m: Person, staff: Person[], w0: number, w2: number, w4: number): void {
  const dA = s16(w0 - m.rep[1]), dH = s16(w2 - m.rep[0]), dC = s16(w4 - m.rep[2]);
  m.rep[1] = s16(w0); m.rep[0] = s16(w2); m.rep[2] = s16(w4);
  const cl = (v: number) => (v < 1 ? 1 : v > 10000 ? 10000 : v);
  for (const s of staff) {
    if (s.id === m.id || !s.np) continue;
    s.rep[1] = cl(s16(s.rep[1] + ftol(dA * 0.25)));
    s.rep[0] = cl(s16(s.rep[0] + ftol(dH * 0.25)));
    s.rep[2] = cl(s16(s.rep[2] + ftol(dC * 0.25)));
  }
}

// ---------------------------------------------------------------- spilstarten for ikke-spillerpostens omdømme (sub_535a80 0x537d59–0x537f71)

/** rå (databasens 0..200) → hukommelsen: ×50 (16 bit) og udfyldningen; club = [klubbens omdømme, klubbens nation] eller null */
export function initStaffRep(raw: [number, number, number], club: [number, number] | null, nation: number): [number, number, number] {
  const ok = (v: number) => v > 0 && v <= 10000;
  const cl = (v: number) => (v < 1 ? 1 : v > 10000 ? 10000 : v);
  const h0 = s16(raw[0] * 50), a0 = s16(raw[1] * 50), c0 = s16(raw[2] * 50);
  let a = a0, h = h0, c = c0;
  if (!ok(c0)) c = club && s16(club[0]) > 5750 ? s16(ftol(s16(club[0]) * 0.35)) : 1;
  const C = cl(c); c = C;
  if (!ok(a0)) a = ok(h0) ? h0 : C;
  const A = cl(a); a = A;
  if (!ok(h0)) h = ok(A) ? A : C;
  h = cl(h);
  if (!club || club[1] === nation) h = A;
  return [h, a, c];
}
/** 0x826f20: mennesket overtager en klub – [hjemme, aktuel, verden] */
export const humanAppointRep = (clubRep: number): [number, number, number] => {
  const r = s16(clubRep);
  return [s16(tdiv(r, 10) + 3000), s16(tdiv(r, 10) + 3000), s16(ftol(r * 0.4 + 750.0))];
};

// ---------------------------------------------------------------- 0x697c40 weekly_board_confidence_update

/** hver 7. dag (dag-i-året % 7 = 0): alle klubber med manager (med ikke-spillerpost), der kan styres. Mediehistorierne (0x74b060: 0x5a/0x44/0x5b/
 *  0x5d/0x42/0x5f–0x63/0x40/0x41/0x5e/0x3e/0x3f/0x3c) er ikke porteret – deres tilfældige tal trækkes ikke, og FINAL-grenens +0x16 −= 250 (kræver
 *  0x4ae300's projektion) mangler; landsholdsgrenen findes ikke (ingen landshold som klubber). */
export function weeklyUpdate(env: BoardEnv, st: CmBoardState, rand: Rand): void {
  for (const c of env.clubs) {
    const m = env.manager(c);
    if (!m || !m.np) continue;
    if (!env.canBeManaged(c)) continue;
    const R = recOf(st, c);
    const conf0 = s16(R.w6);
    weeklyBody(env, c, R, m, rand);
    // PART2 (0x69a1a7): europæisk deltagelse holder tilliden oppe
    if (env.inEurope(c)) {
      if (!(R.e & 0x400)) { if (s16(R.w6) < 6500) R.w6 = 6500; }
      else if (R.b2 & 8) { if (s16(R.w6) < 4275) R.w6 = 4275; }
      else if (s16(R.w6) < 6500) R.w6 = 6500;
    }
    const dconf = s16(s16(R.w6) - conf0);
    if (s16(R.w6) > 10000) R.w6 = 10000; else if (s16(R.w6) < 0) R.w6 = 0;
    // (formandens/klubbens likes og dislikes af manageren 0x547840/0x547810/0x5477d0/0x547790: listerne findes ikke)
    if (s16(R.w8) > 10000) R.w8 = 10000; else if (s16(R.w8) < 0) R.w8 = 0;
    if (!(R.b2 & 0x0d)) {
      weeklyRep(env, c, m, dconf);
      // §17 formuebåndet mod sæsonstartens (+1); club +0x82 findes ikke i spillet (0)
      const wb = env.wealthBand(c), sb = s8(R.b1), crep = s16(env.clubRep(c));
      const add = (a: number, b: number) => { R.w6 = s16(R.w6 + a); R.w10 = s16(R.w10 + b); };
      switch (wb) {
        case 2: if (sb < 2) { if (crep < 3500) add(35, 35); else add(15, 15); } break;
        case 1: if (sb < 1) { if (crep < 3500) add(30, 30); else add(10, 10); } break;
        case 0: if (sb < 0) { if (crep < 3500) add(25, 25); else add(5, 5); } else if (sb > 0) add(-5, -5); break;
        case -1: if (sb < 0) add(5, 5); else add(-25, -50); break;
        case -2: if (sb === -2) add(5, 5); else add(-50, -75); break;
      }
    }
    if (s16(R.w6) > 10000) R.w6 = 10000; else if (s16(R.w6) < 0) R.w6 = 0;
  }
}

function weeklyBody(env: BoardEnv, c: number, R: BoardRec, m: Person, rand: Rand): void {
  // trin 1: +8 klemmes om +6, +6 trækkes mod +8, fansene følger
  const v6 = s16(R.w6), h = tdiv(v6, 2), v8 = s16(R.w8);
  if (h > v8) R.w8 = s16(h); else if (2 * v6 < v8) R.w8 = s16(2 * v6);
  const old6 = s16(R.w6);
  const d0 = ftol((s16(R.w8) - old6) * -0.1);
  R.w6 = s16(old6 - d0);
  R.w16 = s16(R.w16 + s16(R.w6 - old6));
  // trin 3: ligagrenen
  const div = env.division(c);
  const L = div ? env.league(div) : null;
  const e = L ? env.entry(c) : null;
  if (!div || !L || !e) return;
  let n = 0, k = 0;
  if (e.winRun > 1 && e.lastDays < 7) { n = s16(e.winRun); k = 25; }
  else if (e.lossRun > 1 && e.lastDays < 7) { n = s16(e.lossRun); k = -30; }
  else if (e.noWinRun > 2 && e.lastDays < 7) { n = s16(e.noWinRun); k = -5; }
  else if (e.unbeatenRun > 2 && e.lastDays < 7) { n = s16(e.unbeatenRun); k = 5; }
  const x = n < 4 ? n * n : Math.min(n, 5) ** 2 * 0.2 + 9.0;
  let form = f32(k * x);
  const lv = s16(env.divLevel(div)), rep = s16(env.clubRep(c));
  if (form < 0) {
    let q = lv * 0.1; q = q > 2.0 ? 2.0 : q < 0.25 ? 0.25 : q;
    form = f32(q * form);
    if (R.d38 > R.q30) { let q2 = R.d38 / R.q30; if (q2 > 2.5) q2 = 2.5; form = f32(q2 * form); R.w14 = s16(R.w14 - 150); }
  }
  if (lv !== 0 && rep !== 0 && lv > 7) {
    let q = ((lv + 1) * 500) / rep; q = q > 1.25 ? 1.25 : q < 0.25 ? 0.25 : q;
    form = form < 0 ? f32(form / q) : f32(form * q);
  }
  if (form < 0 && !env.pro(c)) form = f32(form * 0.75);
  const p72 = e.pos & 0xff, p73 = e.p73 & 0xff, p74 = e.p74 & 0xff, p75 = e.p75 & 0xff, g4 = e.played & 0xff;
  if (p74 !== p75) {
    if (p73 < p72) { if (form < 0) form = f32(form * 0.05); }
    else if (p73 === p72) { if (form < 0) form = f32(form * 0.1); }
    else if (form > 0) form = f32(form * 0.25);
  }
  // (førsæsonens medietekster, p74 == p75 og g4 == 0: ikke porteret)
  // CHAIR: formandens tålmodighed
  const ch = env.chair(c);
  let apply = true;
  if (ch) {
    if (!(form < 0)) apply = false;
    else {
      if (ch.b1d < 1) ch.b1d = 10;
      const p = s8(ch.b1d);
      let q = p === 1 ? 4.0 : p === 20 ? 0.25 : (21 - p) * 0.1;
      if (p !== 1 && p !== 20) q = q < 0.5 ? 0.5 : q > 2.0 ? 2.0 : q;
      form = f32(q * form);
    }
  }
  if (apply && form < 0 && (R.b2 & 1)) form = f32(form * (daysSince(env.today, m.joined) < 180 ? 0.2 : 0.75));
  // APPLY
  const d = s16(ftol(form));
  R.w6 = s16(R.w6 + d); R.w8 = s16(R.w8 + d);
  R.w16 = s16(R.w16 + s16(ftol(form * 1.25)));
  R.w12 = s16(R.w12 + d);
  const N = s8(L.teams);
  let w = N > 0 ? 22.0 / N : 1.0;
  if (lv >= 10 && rep > 500 * lv) w = ((rep - 500 * lv + (rep - 5000)) * 0.0002 + 1.0) * w;
  w = Math.pow(w, 1.5);
  // positionsflag (§9)
  if (p74 === p75) return;
  if (R.b2 & 1) return;
  let bonus = 0;
  if (p75 < p72) {
    if (!(R.b2 & 4)) { R.b2 |= 4; bonus = 750; } else if (s16(R.w6) < 4000) R.w6 = s16(R.w6 + 750);
  } else if (p74 > p72) {
    if (!(R.b2 & 8)) { R.b2 |= 8; bonus = -750; } else if (s16(R.w6) > 6500) R.w6 = s16(R.w6 - 750);
  } else if (g4 <= 4) {
    bonus = p73 < p72 ? 5 : p73 === p72 ? 1 : -5;
  } else bonus = placeVsExpect(R, ch, p72, p73, g4, w, L, rand);
  applyBonus(env, c, R, ch, s16(bonus), lv, rep, p72, p73, g4, w);
}

/** §12 L_699950: placeringen mod sidste sæsons (g4 > 4) */
function placeVsExpect(R: BoardRec, ch: Chair | null, p72: number, p73: number, g4: number, w: number, L: LeagueInfo, rand: Rand): number {
  const v = s16(R.w6);
  const pat = ch ? s8(ch.b1d) : 0;
  let bonus = 0;
  const keep = (T: number) => { if (ch) { if (rand(pat) !== 0) { R.w6 = T; bonus = 0; } } else if (rand(10) !== 0) { R.w6 = T; bonus = 0; } };
  if (p73 < p72) {
    const diff = s16(p72 - p73);
    if (diff > 4) { bonus = diff * 15 + 40; if (v < 6500) { R.w6 = 6500; bonus = 0; } }
    else { bonus = diff * 10; if (v < 4275) { R.w6 = 4275; bonus = 0; } }
    return bonus;
  }
  if (p73 === p72) { bonus = 5; if (v < 4275) keep(4275); return bonus; }
  const x = s16(ftol(p72 * w - p73 * w));
  let D = Math.max(2 * (2 - g4), x);
  const F = R.e & 0xffff;
  let k5 = false;
  if ((F & 6) && D < 0) { if (s8(L.playoff) !== 0 && p73 <= s8(L.playoff)) { D = 0; k5 = true; } }
  else if ((F & 8) && D < 0 && s8(L.playoff) !== 0 && p73 <= s8(L.playoff)) { D = 0; if (v < 6500) R.w6 = 6500; k5 = true; }
  const half = tdiv(pat, 2);
  const lvl = k5 || D > -3 ? 5 : D > -5 ? 3 : D > -10 ? 2 : 1;
  if (lvl === 5) {
    bonus = -5;
    if (v > 9500) { if (ch && g4 >= half + 2 * D + 10) { R.w6 = 9500; bonus = 0; } }
    else if (v < 4275) keep(4275);
  } else if (lvl === 3) {
    bonus = 10 * D - 25;
    if (v > 6500) { if (ch && g4 >= half + D + 12) { R.w6 = 6500; bonus = 0; } }
    else if (v < 3500) keep(3500);
  } else {
    bonus = lvl === 2 ? 25 * D + 60 : 30 * D + 105;
    if (v > 6500 && ch && g4 >= half + 10) { R.w6 = 6500; bonus = 0; }
    else if (v > 4275) { if (ch && g4 >= half + 15) { R.w6 = 4275; bonus = 0; } }
    else if (lvl === 2) { if (v < 3000) keep(3000); }
    else if (v < 3500) {
      if (ch) { const r1 = rand(pat); const r2 = rand(30) + 1; if (r1 > r2) { R.w6 = 3500; bonus = 0; } }
      else if (rand(5) === 0) { R.w6 = 3500; bonus = 0; }
    }
  }
  return bonus;
}

/** §13 L_699e82: bonus skaleres og lægges i +6/+8 */
function applyBonus(env: BoardEnv, c: number, R: BoardRec, ch: Chair | null, bonus: number, lv: number, rep: number, p72: number, p73: number, g4: number, w: number): void {
  let k = lv * 0.1; k = k < 0.5 ? 0.5 : k > 2.0 ? 2.0 : k;
  let b = s16(ftol(bonus * k));
  if (rep > 5000 && rep > 400 * lv) {
    const a = p72 * w - p73 * w;
    if (a < -4.0 && a < 5.0 / w && b < 0) b = s16(ftol(Math.min(2 * b, g4 * a * 1.5)));
  }
  if (ch && b < 0) {
    if (ch.b1d < 1 || ch.b1d > 20) ch.b1d = 10;
    const p = s8(ch.b1d);
    let q = p === 1 ? 3.0 : p === 20 ? 0.25 : (21 - p) * 0.1;
    if (p !== 1 && p !== 20) q = q < 0.5 ? 0.5 : q > 2.0 ? 2.0 : q;
    b = s16(ftol(b * q));
  }
  if (R.d38 > R.q30) {
    if (b < 0) { let q = R.d38 / R.q30; if (q > 3.0) q = 3.0; b = s16(ftol(b * q)); }
    R.w14 = s16(R.w14 - 75);
  } else if (b > 0) { b = s16(ftol(b * 1.05)); R.w14 = s16(R.w14 + 5); }
  if (b < 0) {
    if (!env.pro(c)) b = s16(ftol(b * 0.75));
    if (b < 0 && env.lowNation(c)) b = s16(ftol(b * 0.75));
  }
  if (env.inEuropeAny(c) && b < 0) { const t = s16(ftol(b * -0.25)); R.w6 = s16(R.w6 - t); R.w8 = s16(R.w8 - t); }
  else { R.w6 = s16(R.w6 + b); R.w8 = s16(R.w8 + s16(ftol(b * 1.05))); }
}

/** 0x69a36c: managerens omdømme følger ugens ændring i tilliden */
function weeklyRep(env: BoardEnv, c: number, m: Person, d: number): void {
  const rep = s16(env.clubRep(c));
  const u = d < 0 ? (rep > 5000 ? s16(ftol((2500.0 / rep) * d)) : s16(ftol(d * 0.5))) : d;
  const wh = s16(m.rep[0]), wa = s16(m.rep[1]), wc = s16(m.rep[2]);
  const band = (t: number, hi: number, lo: number, test = t) => (test > rep + hi ? Math.min(rep + hi, 10000) : test < rep - lo ? Math.max(rep - lo, 1) : t);
  // NB: +0xa's mål testes på den GAMLE værdi (0x69a3de), de to andre på den nye
  const tA = band(wa + u, 3000, 3000, wa), tH = band(wh + u, 3000, 3000, s16(wh + u)), tC = band(wc + u, 1000, 5000, s16(wc + u));
  const kk = (v: number) => Math.max(22, s8(tdiv(v, 1000) + 16));
  let nA = s16(kk(wa) - 19); if (nA === 0) nA = 1;
  let nH = env.clubNation(c) !== m.nation ? s16(23 - tdiv(rep, 500)) : s16(kk(wh) - 19); if (nH === 0) nH = 1;
  let nC = s16(23 - tdiv(rep, 500)); if (nC === 0) nC = 1;
  const qA = tdiv((nA - 1) * wa + tA, nA), qH = tdiv((nH - 1) * wh + tH, nH), qC = tdiv((nC - 1) * wc + tC, nC);
  const fA = f32(2.0 - wa * 0.0001), fH = f32(2.0 - wh * 0.0001), fC = 2.0 - wc * 0.0001;
  const bnd = (Lo: number, U: number, q: number) => (Lo > q ? Lo : U < q ? U : q);
  let rA = ftol(bnd(f32(wa) - fA * 250, f32(wa) + fA * 300, f32(s16(qA))));
  let rH = ftol(bnd(f32(wh) - fH * 250, f32(wh) + fH * 375, f32(s16(qH))));
  const kC = f32(fC * 500);
  let rC = ftol(bnd(f32(wc) - kC, kC + f32(wc), f32(s16(qC))));
  const div = env.division(c);
  const base = s16(div && 50 * s16(env.divLevel(div)) > rep ? 50 * env.divLevel(div) : rep);
  const cap = base < 5000 ? 5000 : base > 10000 ? 10000 : base;
  rH = Math.max(1, Math.min(rH, Math.max(cap, wh)));
  rA = Math.max(1, Math.min(rA, Math.max(cap, wa)));
  let cc = base * (2.0 / 3.0); cc = cc < 3000 ? 3000 : cc > 10000 ? 10000 : cc;
  const capC = s16(ftol(cc));
  rC = Math.max(1, Math.min(rC, Math.max(capC, wc)));
  m.rep[1] = s16(tdiv(rA, 2) + tdiv(wa, 2));
  m.rep[0] = s16(tdiv(rH, 2) + tdiv(wh, 2));
  m.rep[2] = s16(tdiv(rC, 2) + tdiv(wc, 2));
}

export type { Club, GameState, Staff };
export { cmRand };
