// Stab og spejdere som i CM 01/02 (kun den originale database i ægte tilstand – cmActive): stabssøgningens Rep./Job/Inf, stabsprofilen
// (egenskaberne, Coaching Style, Preferred Formation/Style, Other), "Set Role At Club" og kontrakttilbuddet til en stabsperson med svaret
// som nyhed ("Protasof rejects Man Utd" med knappen Negotiate). Læst i cm0102.exe 3.9.68 (13/11-2026); *estimeret* hvor det står.
//
//   0x80e787 (search_screens.cpp, fn 0x808690) Rep.-ordet i Staff Search: ≥ 9500 Superb, ≥ 8000 Very Good, ≥ 6000 Good, ≥ 3750 Ok,
//            under 35 år Unproven, ≥ 500 Poor, ellers Very Poor.
//   0x53ad00 jobbets korte navn (Unemployed, Chairman, Mng/Director, Gen/Manager, Dir/Football, Manager, Ast/Manager, Res/Manager,
//            Coach, Scout, Physio, Player, Pl/Manager, Pl/Ast Manager, …) efter personpostens jobkode +0x3d.
//   0x87ad61 (fn 0x87a510) stabsprofilens egenskaber: id 1..12 med navn 0x543b10 og værdi 0x543fd0 – Physiotherapy (id 10) kun for en
//            fysioterapeut (+0x3d = 10 eller landsholdsjob +0x28 = 10) eller når værdien er mindst 10; sorteret alfabetisk (qsort 0x88bc50),
//            derefter Coaching Style (0x87af13: ikke-spillerpost +0x12 ≤ 5 Fitness-based, ≥ 15 Technique-based, ellers General).
//   0x543fd0 værdierne: 1 Adaptability (staff +0x56), 2 Coaching Goalkeepers (vist +0x11), 3 Coaching Outfield Players (vist +0x10),
//            4 Determination (staff +0x58), 5 Judging Player Ability (vist +0x17), 6 Judging Player Potential (vist +0x18),
//            7 Level of Discipline (+0x14 rå), 8 Man Management (vist +0x19), 9 Motivating (vist +0x1b), 10 Physiotherapy (vist +0x1e),
//            11 Tactical Knowledge (vist +0x21), 12 Working With Youngsters (+0x22 rå). "Vist" = 0x544410 (staffShown, CA + 2·intern).
//   0x87b90a Preferred Formation (+0x43: 1 5-3-2 Sweeper … 9 3-4-3), 0x87ba88 Preferred Style (Attacking +0xe / Directness +0x13 mod
//            15 og 5), 0x87bb86 Other (Pressing +0x1f, Offside +0x1c, Marking +0x1a ≥ 15).
//   0x874e6a fødselslinjens landskampe: "(1 cap)", "(N caps)", "(N caps/1 goal)", "(N caps/G goals)" (person +0x22/+0x23).
//   0x4cb990 hvilke job en person kan tilbydes (Set Role At Club 0x4dd0f0): Assistant Manager (6) fra 30 år, ellers kun for en manager/
//            assistent/træner; Coach (8) fra 30 år undtagen fysioterapeuter, ellers kun manager/assistent/træner; Scout (9) kun for en
//            spejder; Physio (10) kun for en fysioterapeut. Ledige har jobkoden 0 (Unemployed).
import { addDays, ageOn } from './dates';
import { addNews } from './state';
import { regionOf } from './leagues';
import { hash01 } from './rng';
import { cmActive } from './cmPlayerData';
import { staffShown, judgeAbility, recPositions } from './engine/grid/roleScore';
import { combineScore, positionFactor } from './engine/grid/subs';
import { playerRecord } from './engine/grid/aiTeam';
import { clubRepMem } from './cmPlayerData';
import { poachFee, STAFF_LIMITS } from './staff';
import type { GameState, Staff, StaffRole } from './types';

export { cmActive };

/** personpostens jobkode +0x3d (ledige = 0) */
export const JOB_CODE: Record<StaffRole, number> = { manager: 5, assistant: 6, coach: 8, scout: 9, physio: 10 };
export const cmJobCode = (s: Staff): number => s.cmJob ?? (s.club ? JOB_CODE[s.role] : 0);
/** klubben, personen står ved i originalen: spillets klub, eller (cmExtra) databasens klub uden for spillets stab – id i g.clubs eller navnet */
export function cmStaffClub(g: GameState, s: Staff): { id: number; name: string; nation: number } | null {
  const id = s.club || (s.cmExtra ? s.cmClub ?? 0 : 0);
  const c = id ? g.clubs[id] : undefined;
  if (c) return { id: c.id, name: c.short || c.name, nation: c.nation };
  const x = s.cmExtra && s.cmClub !== undefined ? g.cmClubNames?.[s.cmClub] : undefined;
  return x ? { id: 0, name: x[0], nation: x[1] } : null;
}
/** 0x53ad00: nøglen til jobbets korte navn (i18n `cm.job.<kode>`) */
export const cmJobKey = (s: Staff): string => `cm.job.${cmJobCode(s)}`;

/** stabspersonens omdømme i hukommelsens skala 0..10000 (ikke-spillerpost +0xa, den aktuelle – Wenger 9500 = Superb, Hitzfeld 8947 =
 *  Very Good, Aitken 6000 = Good som i originalen); uden den (ældre spil) Staff.rep × 100 */
export const cmStaffRep = (s: Staff): number => s.cmRep?.[1] ?? s.rep * 100;

export type CmRepWord = 'superb' | 'veryGood' | 'good' | 'ok' | 'unproven' | 'poor' | 'veryPoor';
/** 0x80e787: Rep.-ordet i Staff Search */
export function cmStaffRepWord(s: Staff, date: string): CmRepWord {
  const r = cmStaffRep(s);
  if (r >= 9500) return 'superb';
  if (r >= 8000) return 'veryGood';
  if (r >= 6000) return 'good';
  if (r >= 3750) return 'ok';
  if (ageOn(s.dob, date) < 35) return 'unproven';
  return r >= 500 ? 'poor' : 'veryPoor';
}
/** sorteringsværdien: ordene i originalens rækkefølge (Unproven mellem Ok og Poor) */
export const cmStaffRepRank = (s: Staff, date: string): number => ['veryPoor', 'poor', 'unproven', 'ok', 'good', 'veryGood', 'superb'].indexOf(cmStaffRepWord(s, date));

// ---------------------------------------------------------------- profilen

/** 0x543fd0's id → nøglen (i18n `cm.sa.<nøgle>`, engelske navne i originalens alfabetiske rækkefølge) */
export const CM_STAFF_ATTRS = ['adaptability', 'coachingGk', 'coachingOutfield', 'determination', 'judgingAbility', 'judgingPotential',
  'discipline', 'manManagement', 'motivating', 'physiotherapy', 'tactics', 'youngsters'] as const;
export type CmStaffAttr = (typeof CM_STAFF_ATTRS)[number];
/** de "viste" (0x544410) og de rå bytes i ikke-spillerposten pr. id */
const SHOWN_OFF: Partial<Record<CmStaffAttr, number>> = { coachingGk: 0x11, coachingOutfield: 0x10, judgingAbility: 0x17, judgingPotential: 0x18,
  manManagement: 0x19, motivating: 0x1b, physiotherapy: 0x1e, tactics: 0x21 };
const RAW_OFF: Partial<Record<CmStaffAttr, number>> = { discipline: 0x14, youngsters: 0x22 };
/** uden ikke-spillerposten (ældre spil): spillets egne stabsegenskaber */
const FALLBACK: Partial<Record<CmStaffAttr, keyof Staff['attrs']>> = { coachingGk: 'coaching', coachingOutfield: 'coaching', judgingAbility: 'judgingAbility',
  judgingPotential: 'judgingPotential', discipline: 'discipline', manManagement: 'motivating', motivating: 'motivating', physiotherapy: 'physio', tactics: 'tactics', youngsters: 'coaching' };

/** 0x543fd0(staff, np, id) */
export function cmStaffAttr(s: Staff, k: CmStaffAttr): number {
  if (k === 'adaptability') return s.cmHid?.[0] ?? 10;
  if (k === 'determination') return s.cmHid?.[2] ?? 10;
  const np = s.cmNp;
  if (np && s.ca) {
    const sh = SHOWN_OFF[k];
    if (sh !== undefined) return staffShown(s.ca, np[sh - 0x0e]);
    const raw = RAW_OFF[k];
    if (raw !== undefined) return np[raw - 0x0e];
  }
  const f = FALLBACK[k];
  return f ? s.attrs[f] : 10;
}

/** 0x87ad61: profilens rækker (Physiotherapy kun for fysioterapeuter eller fra 10) */
export function cmStaffAttrList(s: Staff): { k: CmStaffAttr; v: number }[] {
  return CM_STAFF_ATTRS.map((k) => ({ k, v: cmStaffAttr(s, k) }))
    .filter((x) => x.k !== 'physiotherapy' || cmJobCode(s) === 10 || s.cmNat?.[1] === 10 || x.v >= 10);
}

/** 0x87af13: Coaching Style af Coaching Technique (+0x12, rå) */
export function cmCoachingStyle(s: Staff): 'general' | 'technique' | 'fitness' {
  const v = s.cmNp?.[0x12 - 0x0e] ?? 10;
  return v <= 5 ? 'fitness' : v >= 15 ? 'technique' : 'general';
}

/** 0x87b90a: +0x43 → formationen (1..9), ellers null ("-") */
const FORMATIONS = ['5-3-2 Sweeper', '5-3-2', '4-4-2', '4-3-3', '4-2-4', '3-5-2', '4-1-2-1-2', '4-5-1', '3-4-3'];
export function cmPrefFormation(s: Staff): string | null {
  const f = s.cmNp?.[21] ?? s.tac?.[7] ?? 0;
  return FORMATIONS[f - 1] ?? null;
}

/** taktikbytes: Attacking +0xe, Directness +0x13, Marking +0x1a, Offside +0x1c, Pressing +0x1f (rå) */
const tacByte = (s: Staff, off: number): number => {
  if (s.cmNp) return s.cmNp[off - 0x0e];
  const i = [0x0e, 0x13, 0x15, 0x1a, 0x1c, 0x1f].indexOf(off);
  return i >= 0 ? s.tac?.[i] ?? 10 : 10;
};
/** 0x87ba88: Preferred Style (i18n `cm.style.<nøgle>`) */
export function cmPrefStyle(s: Staff): string {
  const a = tacByte(s, 0x0e), d = tacByte(s, 0x13);
  if (a >= 15 && d >= 15) return 'directAttacking';
  if (a >= 15 && d <= 5) return 'attractive';
  if (a <= 5 && d >= 15) return 'cautiousDirect';
  if (a <= 5 && d <= 5) return 'patientDefensive';
  if (a >= 15) return 'attacking';
  if (a <= 5) return 'defensive';
  if (d >= 15) return 'direct';
  if (d <= 5) return 'patient';
  return 'none';
}
/** 0x87bb86: Other – én linje pr. stil (i18n `cm.other.<nøgle>`), tom = "-" */
export function cmOtherStyles(s: Staff): string[] {
  const out: string[] = [];
  if (tacByte(s, 0x1f) >= 15) out.push('pressing');
  if (tacByte(s, 0x1c) >= 15) out.push('offside');
  if (tacByte(s, 0x1a) >= 15) out.push('marking');
  return out;
}

/** 0x874e6a: landskampene i fødselslinjen – i18n-nøgle og parametre (null = ingen landskampe). Målene (+0x23) findes ikke i world-
 *  filerne endnu; uden dem vises kun kampene. */
export function cmCapsLine(caps: number, goals: number | undefined): { key: string; caps: number; goals: number } | null {
  if (caps < 1) return null;
  const g = goals ?? 0;
  if (caps === 1) return { key: goals === undefined || g === 0 ? 'cm.caps.one' : g === 1 ? 'cm.caps.oneGoal' : 'cm.caps.oneGoals', caps, goals: g };
  return { key: goals === undefined || g === 0 ? 'cm.caps.n' : g === 1 ? 'cm.caps.nGoal' : 'cm.caps.nGoals', caps, goals: g };
}

// ---------------------------------------------------------------- Set Role At Club

/** 0x4cb990(job, staff) for de fire job, en stabsperson uden spillerpost kan få */
export function cmRolesFor(s: Staff, date: string): StaffRole[] {
  const age = ageOn(s.dob, date), job = cmJobCode(s);
  const out: StaffRole[] = [];
  if (age >= 30 || [5, 6, 8].includes(job)) out.push('assistant');
  if ((age >= 30 && job !== 10) || [5, 6, 8].includes(job)) out.push('coach');
  if (job === 9) out.push('scout');
  if (job === 10 || s.cmNat?.[1] === 10) out.push('physio');
  return out;
}

// ---------------------------------------------------------------- Staff Search

/** "Famous staff and all staff in your region" (0x80af8d) er kun overskriften: søgningen 0x7afa70 (Staff Search, type 3) tager ALLE personer
 *  i hukommelsen med en ikke-spillerpost (+0x69) undtagen ens egen klubs (+0x39 = klubben) og dem, der allerede står i listen (0x7af600).
 *  Hukommelsen = databasens personer, som 0x524d70 beholder med de valgte lande (database_trim_staff_tables, databasestørrelse Maximum),
 *  plus 0x527240's genererede stab i de valgte landes klubber (Staff.cmMem, sat i newgame.ts). Ældre spil uden den oplysning: *estimeret* =
 *  databasens stab med omdømmet Good eller bedre eller i samme verdensdel. */
export function cmStaffInSearch(g: GameState, s: Staff, myRegion: string): boolean {
  if (s.club && s.club === g.userClub) return false;
  if (g.cmStaffMem) return !!s.cmMem;
  if (s.cmId === undefined) return false;
  if (cmStaffRep(s) >= 6000) return true;
  const nation = s.club ? g.clubs[s.club]?.nation ?? s.nation : s.nation;
  return regionOf(g.nations[nation]?.name) === myRegion;
}

/** Klubber, der vil ansætte en ledig stabsperson (Transfer: Interested, mærket Wnt). *estimeret*: klubber i hans land med en ledig plads
 *  i hans fag (under klubbens grænse) og et omdømme, der passer til hans (klubbens omdømme × 100 inden for ±2500), højst tre. */
export function cmStaffInterested(g: GameState, s: Staff): number[] {
  if (s.club || s.cmId === undefined || (s.cmExtra && cmJobCode(s) !== 0)) return [];
  const cache = interestCache(g);
  const rep = cmStaffRep(s);
  const out: number[] = [];
  for (const c of cache.byNation.get(s.nation) ?? []) {
    if (c.id === g.userClub || (cache.count.get(`${c.id}:${s.role}`) ?? 0) >= STAFF_LIMITS[s.role]) continue;
    if (Math.abs(c.rep * 100 - rep) > 2500) continue;
    out.push(c.id);
    if (out.length >= 3) break;
  }
  return out;
}
let icache: { key: string; byNation: Map<number, { id: number; rep: number }[]>; count: Map<string, number> } | null = null;
function interestCache(g: GameState) {
  const key = `${g.seed}:${g.date}:${Object.keys(g.staff).length}`;
  if (icache?.key === key) return icache;
  const byNation = new Map<number, { id: number; rep: number }[]>();
  for (const c of Object.values(g.clubs)) {
    if (g.leagues[c.league]?.hidden) continue;
    byNation.set(c.nation, [...(byNation.get(c.nation) ?? []), { id: c.id, rep: c.rep }]);
  }
  for (const xs of byNation.values()) xs.sort((a, b) => b.rep - a.rep);
  const count = new Map<string, number>();
  for (const st of Object.values(g.staff)) if (st.club) count.set(`${st.club}:${st.role}`, (count.get(`${st.club}:${st.role}`) ?? 0) + 1);
  icache = { key, byNation, count };
  return icache;
}

/** Inf-mærket i Staff Search: Inj (en stabsperson, der også er spiller og er skadet – spillerposten +0x61; vores stab har ingen
 *  spillerpost, så kun tidligere spillere med en skade) ellers Wnt (en klub vil have ham, se cmStaffInterested) */
export function cmStaffInf(g: GameState, s: Staff): 'Inj' | 'Wnt' | null {
  const p = s.exPlayer ? g.players[s.exPlayer.pid] : undefined;
  if (p?.injury && p.club === s.club) return 'Inj';
  return cmStaffInterested(g, s).length ? 'Wnt' : null;
}

// ---------------------------------------------------------------- kontrakttilbuddet (Approach To Sign → Set Role → Offer Contract)

/** "X has no interest in negotiating terms for this position." (0x4e118d, strengen 0x9b0450). Interessen selv er ikke porteret:
 *  *estimeret* = jobbet skal være et, han kan få (0x4cb990), og en ansat skifter kun til en klub med højere omdømme, eller hvis det
 *  nye job er en forfremmelse (spejder/træner → assistent). */
export function cmStaffInterestedIn(g: GameState, s: Staff, role: StaffRole): boolean {
  if (!cmRolesFor(s, g.date).includes(role)) return false;
  const mine = g.clubs[g.userClub];
  if (!mine) return false;
  const from = s.club || (s.cmExtra ? s.cmClub ?? 0 : 0);
  if (!from) return true;
  const theirs = g.clubs[from];
  if (!theirs) return true;
  const promo = role === 'assistant' && (s.role === 'coach' || s.role === 'scout');
  return mine.rep > theirs.rep + 3 || (promo && mine.rep >= theirs.rep - 5);
}

/** lønkravet *estimeret* (som spillets staffDemand: lønnen, +10 % for at forlade en klub) */
export const cmStaffDemand = (s: Staff): number => Math.round((s.wage * (s.club > 0 ? 1.1 : 1)) / 50) * 50;

export interface CmStaffOffer { staff: number; club: number; role: StaffRole; wage: number; years: number; signOn: number; date: string; /** venter på svar på "Delay Transfer Offer" (nyhedens id) */ hold?: number }

/** Offer → "Offer contract to X ?" Yes: tilbuddet sendes, svaret kommer som nyhed næste dag (som originalens kontrakttilbud) */
export function cmOfferStaff(g: GameState, o: Omit<CmStaffOffer, 'club' | 'date'>): string {
  const s = g.staff[o.staff];
  if (!s || !g.userClub || s.club === g.userClub) return 'error';
  if (!cmRolesFor(s, g.date).includes(o.role)) return 'error';
  g.cmStaffOffers = (g.cmStaffOffers ?? []).filter((x) => !(x.staff === o.staff && x.club === g.userClub));
  g.cmStaffOffers.push({ ...o, club: g.userClub, date: g.date });
  return 'ok';
}

/** dagligt: svarene på kontrakttilbuddene (afsendt i går eller før) */
export function cmStaffOffersDaily(g: GameState): void {
  if (!g.cmStaffOffers?.length) return;
  const due = g.cmStaffOffers.filter((o) => o.date < g.date && o.hold === undefined);
  if (!due.length) return;
  g.cmStaffOffers = g.cmStaffOffers.filter((o) => o.date >= g.date || o.hold !== undefined);
  for (const o of due) {
    const s = g.staff[o.staff];
    const club = g.clubs[o.club];
    if (!s || !club || s.club === o.club) continue;
    const name = `${s.first} ${s.last}`.trim();
    const from = s.club ? g.clubs[s.club] : undefined;
    // *estimeret*: interesseret i jobbet, lønnen mindst 95 % af kravet, plads i staben og penge til kompensationen
    const fee = s.club ? poachFee(s) : 0;
    const roomOk = staffCountFor(g, o.club, o.role) < STAFF_LIMITS[o.role];
    const willing = cmStaffInterestedIn(g, s, o.role) && o.wage >= cmStaffDemand(s) * 0.95 && club.balance >= fee
      && hash01(g.seed, o.staff, o.club, g.date.length) < 0.98;
    // CM 01/02 (0x…, strengen "… do not currently have enough spaces at their club for this transfer to go through. Delay the transfer for a
    // week ?"): han vil gerne, men staben er fuld – mennesket svarer med Back · Cancel · Delay
    if (willing && !roomOk) {
      addNews({ cat: 'contract', key: 'cm.staffNoRoom', params: { club: club.name, name, sid: s.id } });
      g.cmStaffOffers.push({ ...o, hold: g.news[0]?.id ?? 0 });
      continue;
    }
    const yes = willing && roomOk;
    if (!yes) {
      // 0xa964d8: "{}<Selling Club>{s} <Player> has rejected the contract offer from {}<Buying Club>{}." – {s} = genitiv
      const fn = from?.short || from?.name || '';
      const sEnd = /[sxz]$/i.test(fn);
      addNews({ cat: 'contract', key: from ? 'cm.staffRejects' : 'cm.staffRejectsFree', params: { last: s.last, name, club: club.short || club.name, from: fn,
        fromEn: fn ? `${fn}${sEnd ? "'" : "'s"}` : '', fromDa: fn ? `${fn}${sEnd ? "'" : 's'}` : '', sid: s.id, role: o.role } });
      continue;
    }
    if (from) {
      club.balance -= fee; club.finance.other += fee;
      from.balance += fee; from.finance.other -= fee;
    }
    const role = o.role;
    s.club = o.club;
    s.role = role;
    // en cmExtra-person bliver almindelig stab i klubben
    if (s.cmExtra) { delete s.cmExtra; delete s.cmJob; delete s.cmClub; }
    s.assignment = null;
    s.wage = o.wage;
    s.expires = `${Number(g.date.slice(0, 4)) + o.years}-06-30`;
    if (o.signOn) { club.balance -= o.signOn; club.finance.signOn = (club.finance.signOn ?? 0) + o.signOn; }
    addNews({ cat: 'contract', key: 'cm.staffAccepts', params: { last: s.last, name, club: club.short || club.name } });
  }
}
const staffCountFor = (g: GameState, club: number, role: StaffRole) => Object.values(g.staff).filter((x) => x.club === club && x.role === role).length;

/** Nyheden "X rejects Y" har knappen Negotiate (originalens nyhedsknap 0xa6943c) – den åbner kontrakttilbuddet igen */
export const cmRejectStaff = (g: GameState, n: { key: string; params: Record<string, string | number> }): Staff | null =>
  (n.key === 'cm.staffRejects' || n.key === 'cm.staffRejectsFree') && g.staff[Number(n.params.sid)] && g.staff[Number(n.params.sid)].club !== g.userClub ? g.staff[Number(n.params.sid)] : null;


// ---------------------------------------------------------------- spejderens anbefaling (Rec)

/** 0x7bca90(klub, 0, 0): klubbens niveau i spejderens skala (L) – klub +0x80 omdømmet (r), +0x77 (cmClubStat[1]), divisionens +0x69, +0x64
 *  (cmClubStat[0], ≠ 1 halverer), truppens størrelse 0x53c590 og økonomiens status 0x5986b0. +0x1db (en anden turnering) er −1 ved spilstart. */
export interface ClubLevelIn { rep: number; b77: number; divRep: number | null; pro: boolean; squad: number; hasComp: boolean; finStatus: number }
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
export function cmClubLevel(c: ClubLevelIn): number {
  const ftol = Math.trunc;
  const rep = s16(c.rep);
  let esi = rep, edi = rep;
  const ax = s16(ftol(c.b77 * 0.43 - 430));
  const ebx = s16(rep > ax ? rep : ax > 10000 ? 10000 : ax);
  if (c.divRep !== null && s16(c.divRep) > Math.trunc(rep / 500)) { esi = s16(c.divRep) * 500; edi = esi; }
  const ebp = rep;
  const sum = esi < 8000 ? 3 * esi + ebx + 4 * edi + 8 * ebp : ebx + 7 * ebp + 4 * (esi + edi);
  let v = Math.trunc(sum / 16);
  if (!c.pro) v = Math.trunc(v / 2);
  let L = v > 9000 ? 3 * v + 7500 : v > 7000 ? ftol(v * 4.75 - 8250) : v > 5000 ? ftol(v * 2.5 + 7500) : v > 3000 ? 5 * v - 5000 : ftol(v * 1.6 + 5000);
  const sq = s8(c.squad);
  if (sq < 16 && c.hasComp) L = Math.trunc(L / 2);                           // 0x7bcc4b
  else if (sq < 20 && c.hasComp) {                                            // 0x7bcc6e
    if (c.finStatus === -2) L = Math.trunc(L / 2); else if (c.finStatus === -1) L = ftol(L * (2 / 3));
  } else {
    if (c.hasComp && c.divRep !== null) {                                     // 0x7bccc6: for få spillere i forhold til divisionen
      let d = s8(sq - ftol(s16(c.divRep) * 1.35 + 20));
      if (d < 0) { if (d < -10) d = -10; L = ftol((d * 0.05 + 1) * L); }
    }
    const f = c.finStatus;                                                    // 0x7bcd4a (springtabellen 0x7bce38)
    if (f === 2) L = ftol(Math.max(L * 1.025, L + 250));
    else if (f === 1) L = ftol(Math.max(L * 1.0125, L + 125));
    else if (f === -1) L = ftol(Math.min(L * 0.9523809523809523, L - 500));
    else if (f === -2) L = ftol(Math.min(L * 0.9090909090909091, L - 1000));
  }
  return L < 500 ? 500 : L;
}

/** 0x5986b0: økonomiens status af saldoen (£) og omdømmet r: 2 over 2500r + 5 mio., 1 over 1000r + 3,5 mio., −2 under −2,5 mio. − 1500r,
 *  −1 under −250r (r < 5000) eller 1000·(3750 − r), ellers 0 */
export function cmFinanceStatus(balanceGbp: number, rep: number): number {
  if (balanceGbp > 2500 * rep + 5_000_000) return 2;
  if (balanceGbp > 1000 * rep + 3_500_000) return 1;
  if (balanceGbp < -2_500_000 - 1500 * rep) return -2;
  if (balanceGbp < (rep < 5000 ? -250 * rep : 1000 * (3750 - rep))) return -1;
  return 0;
}

/** Inddata til 0x7b62a0 for én spiller set af én spejder (dommer) */
export interface ScoutRecIn {
  /** spillerposten (0x46 bytes, playerRecord) og alderen (staff +0x18) */
  rec: ArrayLike<number>; age: number; playerId: number; ca: number; pa: number;
  /** staff +0x39 = 0 (fri) – 0x6e2f20 med klub 0 giver ×1,05 */
  free: boolean;
  /** 0x5407e0(spiller, spejder, 0) */
  repSeen: number;
  /** spejderen: id og viste Judging Ability/Potential; hans klubs omdømme (+0x80) og niveau (0x7bca90, før loftet) */
  judge: { id: number; ja: number; jp: number }; clubRep: number; level: number;
  gameSeed: number;
  /** arg3 (−1000 fra 0x7f8750, ellers spejderopgavens led) og de fire rand(500) (0x90cfc0) */
  bias?: number; rand: [number, number, number, number];
}
/** 0x7b62a0: spejderens vurdering → [evne-stjerner +0x29, potentiale-stjerner +0x2a] (0..5). Skønnet = arg3 − rand(500) + 0x6e2f20(spiller, …,
 *  flag 0x1e80 (evnen, 0x6e86d0 kind 2) / 0x1f00 (potentialet, kind 1), klub 0, spejderen som dommer) + rand(500); derefter de fysiske
 *  egenskaber s = Pace + Acceleration (+0x36 + +0x1b) og m = Jumping + Stamina + Strength + Teamwork + Work Rate (+0x2e, +0x3c, +0x3d, +0x3f,
 *  +0x44): ×1,2/1,1/1,05 (m > 75/65/50 og s > 30/24/24), ×0,75/0,95 (s < 15/20), ×0,85/0,95 (m < 25/40), over 34 år ×0,85; potentialet kun
 *  under 25 år (evnen < 5250 → ×0,85, < 7000 og over 19 år → ×0,9; s < 15/24 → ×0,75/0,95; m < 30/45 → ×0,75/0,9; samme bonusser). Stjernerne
 *  (0x7b687b): over 1,2·L og over 2·omdømmet + 12750 → 5, over L og over 2·omdømmet + 10750 (potentialet + 10500) → 4, over 0,8·L 3, over
 *  0,7·L 2, over 0,6·L 1, ellers 0; L = 0x7bca90 holdt i 1750..35000. */
export function scoutJudgement(i: ScoutRecIn): [number, number] {
  const ftol = Math.trunc;
  const rec = i.rec;
  const u = (o: number) => s8(rec[o]);
  const flagsA = 0x1e80, flagsP = 0x1f00;
  const P = positionFactor(recPositions(rec), 0, 0, flagsA);              // 0x400 | 0x200: 100 + 100 (− 100 uden naturlig plads)
  const judged = (kind: 1 | 2) => s16(judgeAbility({ playerId: i.playerId, ca: i.ca, pa: i.pa, age: i.age, gk: u(0xf), gameSeed: i.gameSeed, judge: i.judge, kind, hint: i.repSeen }));
  const score = (kind: 1 | 2, flags: number) => {
    let q = judged(kind);
    if (kind === 1) {                                                         // 0x6e3af3: acceleration og fart
      if (rec[0x1b] < 6) q -= 10; else if (rec[0x1b] < 10) q -= 5;
      if (rec[0x36] < 6) q -= 15; else if (rec[0x36] < 10) q -= 10;
      q = s16(q);
    }
    if (q > 150) q = ftol((q - 150) * 1.5 + 150);                           // 0x6e42a1
    if (i.free) q = ftol(Math.max(q + 5, q * 1.05));                        // 0x6e60d2 (staff +0x39 = klubben = 0)
    return combineScore(P, q, flags);
  };
  const s = s8(u(0x36) + u(0x1b));
  const m = s8(u(0x44) + u(0x3f) + u(0x3d) + u(0x3c) + u(0x2e));
  const bias = i.bias ?? -1000;
  const [r1, r2, r3, r4] = i.rand;
  const mul = (x: number, k: number) => ftol(x * k);
  let est = bias - r1 + score(2, flagsA) + r2;
  if (m > 75 && s > 30) est = mul(est, 1.2); else if (m > 65 && s > 24) est = mul(est, 1.1); else if (m > 50 && s > 24) est = mul(est, 1.05);
  if (s < 15) est = mul(est, 0.75); else if (s < 20) est = mul(est, 0.95);
  if (m < 25) est = mul(est, 0.85); else if (m < 40) est = mul(est, 0.95);
  if (i.age > 34) est = mul(est, 0.85);
  let pot = 0;
  if (i.age < 25) {
    pot = bias - r3 + score(1, flagsP) + r4;
    if (est < 5250) pot = mul(pot, 0.85); else if (est < 7000 && i.age > 19) pot = mul(pot, 0.9);
    if (s < 15) pot = mul(pot, 0.75); else if (s < 24) pot = mul(pot, 0.95);
    if (m < 30) pot = mul(pot, 0.75); else if (m < 45) pot = mul(pot, 0.9);
    if (m > 75 && s > 30) pot = mul(pot, 1.2); else if (m > 65 && s > 24) pot = mul(pot, 1.1); else if (m > 50 && s > 24) pot = mul(pot, 1.05);
  }
  const L = Math.min(35000, Math.max(1750, i.level));
  const rep2 = 2 * s16(i.clubRep);
  const stars = (x: number, four: number) => (x > 1.2 * L && x > rep2 + 12750 ? 5 : x > L && x > rep2 + four ? 4 : x > 0.8 * L ? 3 : x > 0.7 * L ? 2 : x > 0.6 * L ? 1 : 0);
  return [stars(est, 10750), stars(pot, 10500)];
}

/** Rec i Player Search (0x80d164/0x80d199): den største af spejderens to stjernetal (0x7b62a0). Spejderen = klubbens spejder med den bedste viste
 *  Judging Ability (*estimeret* – originalen bruger den, der lavede rapporten; uden spejder assistenten). arg3 = −1000 (0x7f8750's kald); de fire
 *  rand(500) er en fast hash pr. spiller/spejder/sæson (*estimeret* – originalen trækker dem, når rapporten laves). 0x5407e0: samme klub eller
 *  division → nuværende omdømme, samme land → hjemme, ellers verden (*estimeret*: 0x53d980's region-regel er ikke med). */
export function cmScoutRec(g: GameState, p: import('./types').Player, scout?: Staff | null): number {
  const club = g.clubs[g.userClub];
  if (!club) return 0;
  const sc = scout === undefined ? cmRecScout(g) : scout;
  const rec = playerRecord(p);
  const w = (o: number) => s16(rec[o] | (rec[o + 1] << 8));
  const pc = p.club ? g.clubs[p.club] : undefined;
  const repSeen = pc && (pc.id === club.id || pc.league === club.league) ? w(0xb) : (pc?.nation ?? p.nation) === club.nation ? w(9) : w(0xd);
  const ja = sc ? cmStaffAttr(sc, 'judgingAbility') : 10, jp = sc ? cmStaffAttr(sc, 'judgingPotential') : 10;
  const jid = sc ? sc.cmId ?? sc.id : 0;
  const yr = Number(g.date.slice(0, 4)) || 0;
  const h = (k: number) => Math.floor(hash01(g.seed, p.id, jid, k, yr) * 500);
  const [ab, pot] = scoutJudgement({ rec, age: ageOn(p.dob, g.date), playerId: p.id, ca: p.ca, pa: p.pa, free: !p.club, repSeen,
    judge: { id: jid, ja, jp }, clubRep: clubRepMem(g, club.id), level: levelCached(g, club.id), gameSeed: g.seed, rand: [h(1), h(2), h(3), h(4)] });
  return Math.max(ab, pot);
}
let lvCache: { key: string; v: number } | null = null;
const levelCached = (g: GameState, cid: number) => {
  const key = `${g.seed}:${g.date}:${cid}:${g.clubs[cid]?.balance}`;
  if (lvCache?.key !== key) lvCache = { key, v: cmClubLevelOf(g, cid) };
  return lvCache.v;
};
/** klubbens spejder med den bedste viste Judging Ability (ellers assistenten) */
export function cmRecScout(g: GameState): Staff | null {
  if (!g.userClub) return null;
  const mine = Object.values(g.staff).filter((s) => s.club === g.userClub);
  const pick = (xs: Staff[]) => xs.sort((a, b) => cmStaffAttr(b, 'judgingAbility') - cmStaffAttr(a, 'judgingAbility') || a.id - b.id)[0] ?? null;
  return pick(mine.filter((s) => s.role === 'scout')) ?? pick(mine.filter((s) => s.role === 'assistant'));
}
/** 0x7bca90 af spiltilstanden */
export function cmClubLevelOf(g: GameState, cid: number): number {
  const c = g.clubs[cid];
  if (!c) return 500;
  const st = g.cmClubStat?.[cid];
  const m = /^CM(\d+)$/.exec(c.league ?? '');
  const lg = g.leagues[c.league];
  const rep = clubRepMem(g, cid);
  let squad = 0;
  for (const x of Object.values(g.players)) if (x.club === cid) squad++;
  return cmClubLevel({ rep, b77: st?.[1] ?? 0, divRep: m ? g.cmCompRep?.[+m[1]] ?? 0 : null, pro: (st?.[0] ?? 1) === 1,
    squad: Math.min(50, squad), hasComp: !!lg && !lg.hidden && g.activeNations.includes(c.nation), finStatus: cmFinanceStatus(Math.round(c.balance * 0.86), rep) });
}

/** svaret på "Delay Transfer Offer": Delay = prøv igen om en uge, Cancel = tilbuddet bortfalder */
export function cmStaffDelayAnswer(g: GameState, newsId: number, delay: boolean): void {
  const o = (g.cmStaffOffers ?? []).find((x) => x.hold === newsId);
  if (!o) return;
  if (delay) { o.hold = undefined; o.date = addDays(g.date, 6); }
  else g.cmStaffOffers = (g.cmStaffOffers ?? []).filter((x) => x !== o);
  const n = g.news.find((x) => x.id === newsId); if (n) n.params = { ...n.params, ans: delay ? 1 : 2 };
}
export const cmStaffDelayOpen = (g: GameState, n: { id: number; key: string }) => n.key === 'cm.staffNoRoom' && (g.cmStaffOffers ?? []).some((x) => x.hold === n.id);
