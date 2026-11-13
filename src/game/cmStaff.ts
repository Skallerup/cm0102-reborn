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
import { ageOn } from './dates';
import { addNews } from './state';
import { regionOf } from './leagues';
import { hash01 } from './rng';
import { cmActive } from './cmPlayerData';
import { staffShown } from './engine/grid/roleScore';
import { poachFee, STAFF_LIMITS } from './staff';
import type { GameState, Staff, StaffRole } from './types';

export { cmActive };

/** personpostens jobkode +0x3d (ledige = 0) */
export const JOB_CODE: Record<StaffRole, number> = { manager: 5, assistant: 6, coach: 8, scout: 9, physio: 10 };
export const cmJobCode = (s: Staff): number => (s.club ? JOB_CODE[s.role] : 0);
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

/** "Famous staff and all staff in your region" (0x80af8d). Hvem originalen tager med, er ikke fundet: *estimeret* = databasens stab
 *  (ingen genererede), uden egen klub, med omdømmet Good eller bedre eller baseret i samme verdensdel som ens klub. */
export function cmStaffInSearch(g: GameState, s: Staff, myRegion: string): boolean {
  if (s.cmId === undefined || (s.club && s.club === g.userClub)) return false;
  if (cmStaffRep(s) >= 6000) return true;
  const nation = s.club ? g.clubs[s.club]?.nation ?? s.nation : s.nation;
  return regionOf(g.nations[nation]?.name) === myRegion;
}

/** Klubber, der vil ansætte en ledig stabsperson (Transfer: Interested, mærket Wnt). *estimeret*: klubber i hans land med en ledig plads
 *  i hans fag (under klubbens grænse) og et omdømme, der passer til hans (klubbens omdømme × 100 inden for ±2500), højst tre. */
export function cmStaffInterested(g: GameState, s: Staff): number[] {
  if (s.club || s.cmId === undefined) return [];
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
  if (!s.club) return true;
  const theirs = g.clubs[s.club];
  if (!theirs) return true;
  const promo = role === 'assistant' && (s.role === 'coach' || s.role === 'scout');
  return mine.rep > theirs.rep + 3 || (promo && mine.rep >= theirs.rep - 5);
}

/** lønkravet *estimeret* (som spillets staffDemand: lønnen, +10 % for at forlade en klub) */
export const cmStaffDemand = (s: Staff): number => Math.round((s.wage * (s.club > 0 ? 1.1 : 1)) / 50) * 50;

export interface CmStaffOffer { staff: number; club: number; role: StaffRole; wage: number; years: number; signOn: number; date: string }

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
  const due = g.cmStaffOffers.filter((o) => o.date < g.date);
  if (!due.length) return;
  g.cmStaffOffers = g.cmStaffOffers.filter((o) => o.date >= g.date);
  for (const o of due) {
    const s = g.staff[o.staff];
    const club = g.clubs[o.club];
    if (!s || !club || s.club === o.club) continue;
    const name = `${s.first} ${s.last}`.trim();
    const from = s.club ? g.clubs[s.club] : undefined;
    // *estimeret*: interesseret i jobbet, lønnen mindst 95 % af kravet, plads i staben og penge til kompensationen
    const fee = s.club ? poachFee(s) : 0;
    const roomOk = staffCountFor(g, o.club, o.role) < STAFF_LIMITS[o.role];
    const yes = cmStaffInterestedIn(g, s, o.role) && o.wage >= cmStaffDemand(s) * 0.95 && roomOk && club.balance >= fee
      && hash01(g.seed, o.staff, o.club, g.date.length) < 0.98;
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

/** 0x7b62a0 (spejderens vurdering af en spiller): evne-stjernerne (+0x29) og potentiale-stjernerne (+0x2a) efter klubbens niveau L
 *  (0x7bca90, holdt i 1750..35000): ≥ 1,2·L 5 (og over 2·klubbens omdømme + 12750), ≥ L 4 (og over 2·omdømme + 10750), ≥ 0,8·L 3,
 *  ≥ 0,7·L 2, ≥ 0,6·L 1, ellers 0; evnen ganges med 0,85 over 34 år (0x7b661d), potentialet vurderes kun under 25 år (0x7b6638).
 *  Rec i listen = den største af de to (0x80d199). Selve vurderingen (spejderens skøn ± rand(500) og 0x6e2f20 med spillerens mentale
 *  modifikatorer) og omdømmegrænserne er ikke porteret: *estimeret* med spillets skøn (scoutStars → CA/PA) og klubbens niveau (snittet
 *  af de 14 bedste CA – clubLevel). */
export function cmScoutRec(g: GameState, p: import('./types').Player, level: number, est: { ca: number; pa: number }): number {
  const age = ageOn(p.dob, g.date);
  const L = Math.max(1, level);
  const stars = (x: number) => (x >= 1.2 * L ? 5 : x >= L ? 4 : x >= 0.8 * L ? 3 : x >= 0.7 * L ? 2 : x >= 0.6 * L ? 1 : 0);
  const ab = stars(age > 34 ? est.ca * 0.85 : est.ca);
  const pot = age < 25 ? stars(est.pa) : 0;
  return Math.max(ab, pot);
}
