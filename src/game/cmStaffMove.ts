// Computerklubbernes stabsskifter som i CM 01/02 (en CM-database i ægte tilstand med stabens modul – cmStaffOn: den originale og nye 2026/27-spil): klubberne henter assistenter, trænere,
// fysioterapeuter og spejdere – også fra andre klubber, som får kompensation. Nyheden er originalens transfernyhed (0x8dbef0 → teksten 0x8dc370):
// "Fulham sign Collier" / "Fulham have appointed Sunderland's David Collier as a scout." (ejerens billede 16/11, images/153.png). Modtagerne
// (0x8d1130): omdømmet ×0,25 for træner/spejder/fysioterapeut i reglerne, men 0x5407e0 (omdømmet set fra køberen) læser personens egne tal.
//
// Originalens vej (cm0102.exe 3.9.68):
//   1. Trupplanen 0x83cb40's hale 0x83ebfb–0x83f32b (kører, når planen kører: spilstarten 0x83a1b0, den daglige port 0x83a730 og managerskiftet):
//      klubbens stab (assistenten +0xd3, trænerne +0x19f ×5, fysioterapeuterne +0x1cf ×3, spejderne +0x1b3 ×7), der ikke allerede står på en plads,
//      fordeles på stabens 15 pladser (rolle 6 assistent, 7 reserveholdets manager, 5 × 8 træner, 10 fysioterapeut, 7 × 9 spejder – 0x83cad4).
//      Grænsen T = min(0x7bca90 / 5, 5000); pladsens +0xb = ftol(T · 2,5), +3 = T, +7 = 0. Indehaveren (første med jobbet: 6/0xd, 7/0xe, 8/0xf, 9, 0xa)
//      vurderes med 0x69d1b0(staff, klub, manageren (+0xcf), rolle); v ≥ T → han er pladsens mål (+0xf), ellers +0xf = −1 og +0xb = ftol((T − v)·2,5)
//      (første kørsel efter et managerskifte – +4 = 2 – for en computerklub: 0x690890 fyrer ham, medmindre 0x4cc9e0).
//   2. Budgettet 0x83b6e0: kun helt ledige stabspladser (+0x13 = −1) i en professionel klub (+0x64 = 1) får en andel af transferbudgettet 0x598800:
//      assistent og træner B/(10n), reserveholdets manager B/(1000n), spejder og fysioterapeut B/(20n) (n = åbne pladser, tabellen 0x83bce0). En
//      svag indehaver bliver altså ikke erstattet – han har +0x13 og intet budget.
//   3. Målet 0x83f3a0 med stabsgrenen 0x83fa7c–0x840058 (cmShortlistGame.ts staffSlot): personer med ikke-spillerpost, ikke kandidat til et
//      managerjob (0x69fc60), restkontrakten (dage til udløb 0x85fa00 · ugeløn / 7) under pladsens +7 og højst (klubbens omdømme + 500) · 10, ikke
//      klubbens egen, landet/verdensdelen (omdømme < 2750 → kun egen verdensdel; < 4250 og nation +0x85 < 12 → kun personer fra samme verdensdel
//      som deres klub), omdømmet set af manageren 0x5407e0 ≥ rand(2000) + 3250 (samme land, landskampe eller klub i landet springer prøven over);
//      vurderet med 0x69d1b0 (cmBoard.ts scoreStaffForJob med jobblokkene 0x69db39/0x69deb6/0x69e22d/0x69e4e7). Vurderingen 0x840112–0x84094e:
//      v ≥ T og ≥ bedste − 10.000, v' = ftol((rand(17) + 92) · 0,01 · v) > bedste (begynder ved T), og personens vilje med kontraktdelen
//      0x844780(staff, klub, 1, job, NULL) ≥ 3,15 (cmContractGame.ts cmStaffWill) – de uvillige bliver aldrig mål.
//   4. Buddet 0x84a020 → build_bid 0x8e5d60 (computerkøber, 0x8e6346): for en ikke-spillerplads giver 0x84b6f0 kompensationen 0x8d0780 (+0x1b) og
//      0 (kompensationen < personens værdi +0x52 holder aldrig for stab), så 0x8e638b–0x8e6444 springer buddet til klubben over og giver personen
//      et kontrakttilbud direkte: offer_contract 0x4cda70(staff, køber, kontrakt, −1, 1,0, 2) og buddets +0x2f = 1. 0x8d0780: kontrakt med
//      +0x35 = 2 → ftol(dage til udløb · ugeløn / 7), mindst £1.000, højst £1.000.000; uden kontrakt 0.
//   5. add_offer 0x8be300 med +0x2f = 1: tilstanden +0x2c = 7 (0x8be857, "tilbudt kontrakt" – 0x8c63a0 gør intet med den) og ingen svarfrist
//      for en computerkøber (de 28 dage 0x8be85d gælder kun, når KØBEREN er et menneske; 0x8be884 er spillerbuddenes gren, hvor sælgeren er
//      menneske). Den gamle klub bliver aldrig spurgt – heller ikke et menneske: buddet når aldrig tilstand 0 (0x8c644d → 4 = venter på
//      mennesket), så der er intet Respond/Accept/Reject. Nyheden 0x8d3090 (type 0x3e, modtagerne 0x8d1130 med flagene 0x3e – sælgeren
//      (flag 2) er med) med teksten 0x8d3520: overskriften "{Club} transfer bid for {Name}" (0xa8f578) og brødteksten (+0x2f ≠ 0)
//      "{Club 1} have offered {Club 2's} {Name} a job as {job}." (0xa91afc; uden klub 0xa91a80) + "{Club} will be due £X in compensation
//      if the deal goes ahead" (0xa8f6ec, når +0x1b ≠ 0 – klubben er her sælgeren).
//   6. Personen svarer på kontrakttilbuddet (CONTRACT_MANAGER; se listen over skøn nedenfor). Ja → try_complete_offer 0x8c34e0 (ingen prøve af
//      sælgerens vilje): nyheden 0x8dbef0 → teksten 0x8dc370: overskriften efter (id) mod 4 – get / moves to / seal … deal / sign – og
//      brødteksten "{Club} have appointed {Club's} {Name} as {an} {job}." (0xa98b58/0xa98bcc; jobbet 0x53ad00 med små bogstaver); flytningen
//      0x8c9390 med betalingen 0x8ca8a0 (kompensationen til den gamle klub – også menneskets). Ingen særskilt nyhed om kompensationen.
// 7. Managerskiftet 0x694c80 sætter trupplanens +4 = 2 (0x694cd2) og kalder 0x84abe0 → 0x83cb40(entry, klub, 0, 1): +4 = 2 i en computerklub giver
//    [esp+0x60] = 1 (0x83cc44), og halen fyrer indehavere, den nye manager vurderer under T (0x83ee36 → 0x690890 remove_staff_from_club).
// 8. Kontrakten: 0x4cda70 offer_contract(staff, klub, NULL, −1, 1,0, 2) → 0x85fc50 med 0x849f00's job/status (pladsen i køberens plan) og
//    lønloftet 0x597db0 (cmContractGame.ts cmStaffTerms); uden tilbud personens krav 0x85fc50.
//
// Halen, budgettet og målet (19/11): staffTail (0x83ebfb–0x83f32b: +3/+0xb/+0xf/+0x13 og fyringen), med ønskelisterne budgettet +7 fra den
// oversatte 0x83b6e0 og målet i TS (findStaffTarget – 0x83fa7c–0x84094e med rækkens tæller ≥ 10, UK/EU-reglen, spejdervidenen (id + klub) % k og
// gruppe 0xa's grænse rand(2000) + 2750), genudfyldningen 0x843e10 → 0x83f3a0 ved et afslag (staffBidDone) og trupplanens tæller +8 = 100 ved
// skiftet (0x8ca0ce, cmPlanKick). *Estimeret* (koden er ikke fulgt hele vejen): uden ønskelisterne (CM_SL=0/vitest) 0x83b6e0's første andel
// B/(k·n), hvornår buddet afgives (her straks ved planen; originalen 0x84a020 ugentligt, dagligt for omdømme > 6250), personens svar
// (beslutningsdagen 0x4cd230 er ikke porteret: viljen 0x844780 for jobbet ≥ 0,75 som spillernes 0x8c0080, svaret efter 1–5 dage), overskriftens
// variant (personens id mod 4), at budnyheden kun går til den menneskelige sælger (0x8d1130's omdømmeflag for andre mennesker er ikke porteret)
// og uden ønskelisterne at kun klubber i de valgte lande henter stab. Ikke porteret: reserveholdets manager (rolle 7 – findes ikke i spillet),
// 0x690890 for spillets genererede stab (ingen ikke-spillerpost), trupplanen for menneskets klub ved hans egen ansættelse (0x84abe0 – fyrer ikke),
// arbejdstilladelsens 0x8c7950 for stab med landskampe/landshold (de slipper igennem).
import type { Club, GameState, Staff, StaffRole } from './types';
import { addNews } from './state';
import { cmStaffOn, cmRand, clubRepMem, cmPlanKick } from './cmPlayerData';
import { boardEnv, sharedScope, staffJobInterest } from './cmBoardGame';
import { repFor, scoreStaffForJob, type BoardEnv, type Person } from './cmBoard';
import { bookBlockEur, K as CMK } from './cmFinance';
import { cmStaffDemand, cmStaffRestGbp, cmStaffCompensation } from './cmStaff';
import { asOwner, forEachHuman, isHumanClub } from './humans';
import { careerEnd } from './careers';
import { cmStaffTerms, cmStaffWill } from './cmContractGame';
import { rebalanceStaffNp } from './cmStaffInit';
import { transferNewsToMe } from './cmNewsScope';
import { afterPlanHooks, afterBudgetHooks, entryOf, storeEntry, staffTailed } from './cmSquadPlanGame';
import { cmShortlistOn } from './cmShortlistGame';
import { NAT7F } from './cmWageGame';
import { addDays, ageOn } from './dates';
import { recordStaffMove } from './staffMoves';

const s16 = (v: number) => (v << 16) >> 16;
const ftol = (x: number) => (Number.isFinite(x) ? Math.trunc(x) : 0) | 0;
const dayNum = (iso: string) => Math.round(Date.parse(iso.slice(0, 10) + 'T00:00:00Z') / 86400000);

/** stabens pladser 25–39 (0x83cad4) uden reserveholdets manager: rolle → antal pladser */
const SLOTS: Record<number, number> = { 6: 1, 8: 5, 10: 1, 9: 7 };
const ROLE_OF: Record<number, StaffRole> = { 6: 'assistant', 8: 'coach', 9: 'scout', 10: 'physio' };
const JOB_OF: Partial<Record<StaffRole, number>> = { assistant: 6, coach: 8, scout: 9, physio: 10 };
/** 0x83bce0: budgettets nævner pr. rolle (· n) */
const SHARE: Record<number, number> = { 6: 10, 8: 10, 9: 20, 10: 20 };

export interface CmStaffMove { s: number; c: number; job: number; from: number; fee: number; due: string;
  /** ældre gemte spil (v0.27): buddet ventede på menneskets Respond – behandles nu som de andre (originalen spørger ikke sælgeren) */
  h?: 1;
  id?: number }

/** 0x83f3a0's spejderviden [esp+0x28] (0x83f3f6–0x83f5d8): 100 (omdømme < 3500: 4·(6025 − omdømme); Belgien/Holland/Sverige/Danmark/Norge 50),
 *  pr. spejderplads (+0x1b3 ×7) med ikke-spillerpost 30 − 2·0x544410(np, 6) − 0x544410(np, 5) – sic: 6 og 5 er værdierne, ikke felterne, så kun
 *  spejderens CA tæller –, tom plads +10 (ligaen kører) / +5; /10, mindst 2. (id + klub) % k = 0 springer landets og spejdernes prøve over. */
const KK50 = new Set(['Belgium', 'Holland', 'Sweden', 'Denmark', 'Norway']);
function scoutKnow(g: GameState, club: Club): number {
  const rep = s16(clubRepMem(g, club.id));
  let k = rep < 0xdac ? (0x1789 - rep) * 4 : KK50.has(g.nations[club.nation]?.name ?? '') ? 0x32 : 0x64;
  const scouts = scoutsOf(g, club.id);
  const shown = (ca: number, b: number) => { const x = (s16(ca) + 2 * b) * 0.05 + 10.0, y = (x * x * 0.1 + x) * 0.3333333333333333 + 0.5; return ftol(y > 1.0 ? (y < 20.0 ? y : 20.0) : 1.0); };
  for (let i = 0; i < 7; i++) {
    const s = scouts[i];
    if (s) { if (s.cmNp) k += 0x1e - 2 * ((shown(s.ca ?? (s.rep ?? 0) * 2, 6) << 24) >> 24) - ((shown(s.ca ?? (s.rep ?? 0) * 2, 5) << 24) >> 24); }
    else k += club.league && !g.leagues[club.league]?.hidden ? 10 : 5;
  }
  k = Math.trunc(s16(k) / 10);
  return s16(k) < 2 ? 2 : k;
}

/** klubbens første 7 spejdere (stabens rækkefølge); i en fælles løkke (withSharedPersons – staben flytter sig ikke undervejs) én gang for alle klubber */
function scoutsOf(g: GameState, cid: number): Staff[] {
  const sc = sharedScope(g);
  if (!sc) return Object.values(g.staff).filter((s) => s.club === cid && s.role === 'scout').slice(0, 7);
  let m = sc.memo.scouts as Map<number, Staff[]> | undefined;
  if (!m) {
    m = new Map();
    for (const s of Object.values(g.staff)) if (s.role === 'scout' && s.club) { const l = m.get(s.club); if (!l) m.set(s.club, [s]); else if (l.length < 7) l.push(s); }
    sc.memo.scouts = m;
  }
  return m.get(cid) ?? [];
}

/** findStaffTarget's personer efter de faste prøver (ikke-spillerpost, ikke klubbens manager, personposten, ikke manager-jobkode 5) med restkontrakten –
 *  i stabens rækkefølge; i en fælles løkke én gang for alle klubbens pladser (dato, kontrakter og jobs ændres ikke undervejs) */
interface StaffCand { s: Staff; p: Person; w: number }
function staffCands(g: GameState, env: BoardEnv): StaffCand[] {
  const sc = sharedScope(g);
  const cached = sc?.memo.staffCands as StaffCand[] | undefined;
  if (cached) return cached;
  const out: StaffCand[] = [];
  for (const s of Object.values(g.staff)) {
    if (!s.cmNp || s.cmExtra) continue;                                             // 0x83fbdf: uden ikke-spillerpost
    if (s.role === 'manager' && s.club) continue;                                   // (klubbens manager – managerjobbet er MANAGER_MANAGER's)
    const p = env.person(s.id);
    if (!p || !p.np) continue;
    if (p.job === 5 || p.natJob === 5) continue;                                    // 0x83fa68/0x83fa72: +0x3d = 5 eller +0x28 = 5 (managere)
    out.push({ s, p, w: cmStaffRestGbp(g, s, false) });
  }
  if (sc) sc.memo.staffCands = out;
  return out;
}

/** EU-borger 0x53d740(staff, 0): landets +0x7f = 2 eller Schweiz ([0x9cf4ac]) – (anden nationalitet +0x1e findes ikke i spillet) */
const euStaff = (g: GameState, s: Staff) => { const n = g.nations[s.nation]?.name ?? ''; return NAT7F.get(n) === 2 || n === 'Switzerland'; };

/** 0x83f3a0's stabsgren (0x83fa7c–0x840058, som cmShortlistGame.ts staffSlot) og vurderingen 0x840112–0x84094e for én stabsplads: målet eller null */
function findStaffTarget(g: GameState, env: BoardEnv, club: Club, job: number, budget: number, T: number, youth: boolean, rand: (n: number) => number): Staff | null {
  const cid = club.id, crep = s16(clubRepMem(g, cid)), mgr = env.manager(cid);
  const vac = new Set(((g.cmBoard as { vac?: { cand?: number }[] } | undefined)?.vac ?? []).map((v) => v.cand));
  // parrene (staff, klub) på ønskelisterne: rækkens tæller +0xb (computerklubberne) og klubbens egne (0x83fc56's rj 13/15)
  const lists = new Map<number, number>(), mine = new Set<number>();
  for (const m of g.cmStaffMoves ?? []) { if (!isHumanClub(m.c)) lists.set(m.s, (lists.get(m.s) ?? 0) + 1); if (m.c === cid) mine.add(m.s); }
  const uk = (g.cmNation76?.[club.nation] ?? 0) === 0xe;
  const kk = scoutKnow(g, club);
  let best: Staff | null = null, bestV = T;                                        // 0x83f8b3: [esp+0x58] (bedste hidtil) = pladsens grænse T
  // (de faste prøver og restkontrakten: staffCands – samme rækkefølge, rene prøver uden talrække, så udfaldet er det samme)
  const wMax = (crep + 500) * 10;
  for (const { s, p, w } of staffCands(g, env)) {
    if (w >= budget || w > wMax || s.club === cid) continue;                        // 0x83fc56–0x83fcbb
    // 0x84b180 (permitFails, 0x83fc1c): britisk klub (+0x76 = 0xe) og hverken landets eller EU-borger og uden landshold +0x24/landskampe +0x22
    if (uk && s.nation !== club.nation && !euStaff(g, s) && !p.nat && !(p.b22 & 0xff)) continue;
    if (vac.has(s.id)) continue;                                                    // 0x69fc60: kandidat til et managerjob
    if ((lists.get(s.id) ?? 0) >= 0xa || mine.has(s.id)) continue;                  // rækkens tæller ≥ 10 / allerede på klubbens liste
    // 0x83fd2x: britisk klub og ikke EU-borger – stabens pladser (gruppe 5) er ikke blandt 2/4/6
    if (uk && !euStaff(g, s)) continue;
    if (!((s.id + cid) % kk === 0) && !passesScouting(g, env, p, s, club, mgr, youth, rand)) continue;
    // 0x840112–0x840153: v = 0x69d1b0 ≥ T ([esp+0x68]) og ≥ bedste − 10.000
    const v = scoreStaffForJob(env, p, cid, job, mgr);
    if (v < T || v < bestV - 10000) continue;
    // 0x84060e–0x84063c: v' = ftol((rand(17) + 92) · 0,01 · v) skal slå den bedste
    const v2 = ftol((rand(17) + 0x5c) * 0.01 * v);
    if (v2 <= bestV) continue;
    // 0x840682/0x8407a2: viljen 0x844780(staff, klub, 1, job, NULL) ≥ 3,15 – ellers er han ikke mål
    if (cmStaffWill(g, s, cid, job, staffJobInterest(g, env, p, cid, job)) < 3.15) continue;
    bestV = v2; best = s;                                                           // 0x84093f
  }
  return best;
}

const contOf = (g: GameState, n: number) => (n >= 0 ? g.cmNationCont?.[n] ?? -1 : -1);
const SEER = { club: 0, nation: 0 };
/** 0x5407e0(staff, seer, 1) ≥ rand(2000) + 3250 (stabens pladser, gruppe 5 = 0xa: + 2750) og landets/verdensdelens spærrer (0x83ff8x–0x840058) */
function passesScouting(g: GameState, env: BoardEnv, p: Person, s: Staff, club: Club, mgr: Person | null, youth: boolean, rand: (n: number) => number): boolean {
  const cn = club.nation, crep = s16(clubRepMem(g, club.id));
  const sc = s.club ? g.clubs[s.club] : undefined;
  if (p.nation === cn || (p.b22 & 0xff) > 0 || (sc && sc.nation === cn)) return true;          // 0x840060 → vurdering
  if (p.nation >= 0 && contOf(g, p.nation) !== contOf(g, cn)) {
    if (crep < 0xabe) return false;
    const same = !sc || contOf(g, sc.nation) === contOf(g, cn);
    if (!same && crep < 0x109a && ((env.nat85(cn) << 24) >> 24) < 12) return false;
  }
  // (hukommelse, 22/11) seeren i et genbrugt objekt (repFor læser kun felterne) – passesScouting kaldes ~30 mio. gange ved spilstarten
  SEER.club = club.id; SEER.nation = mgr ? mgr.nation : cn;
  const seen = s16(repFor(env, p, SEER));
  return seen >= rand(2000) + (youth ? 0xabe : 0xcb2);
}

/** pladsens job → spillets rolle; 7 (reserveholdets manager) findes ikke i spillet */
const isStaffSlot = (r: number) => r === 6 || r === 8 || r === 9 || r === 10;

/** Halen 0x83ebfb–0x83f32b (efter trupplanens kørsel, også menneskets klub i originalen – her kun computerklubberne): listen over klubbens stab
 *  (assistenten +0xd3, trænerne +0x19f ×5, fysioterapeuterne +0x1cf ×3, spejderne +0x1b3 ×7), der ikke er mål for en af klubbens stabspladser
 *  (0x849ce0(klub, staff, 1, 0)); T = min(0x7bca90/5, 5000). For hver stabsplads i planens rækkefølge: +0x24 &= ~1, +7 = 0, +0xb = ftol(T·2,5);
 *  med budmærke (+0x17 ≠ −1) intet mere; ellers +3 = T og den første på listen med pladsens job (6/0xd, 7/0xe, 8/0xf, 9, 0xa) bliver
 *  indehaver (+0x13): v = 0x69d1b0(staff, klub, manager, rolle) ≥ T → mål (+0xf = ham) og +0xb = 0; ellers første kørsel efter et managerskifte
 *  ([esp+0x60]) → 0x690890 fyrer ham (+0xf = +0x13 = −1); ellers +0xf = −1 og +0xb = ftol((T − v)·2,5). Han tages af listen (den sidste flyttes
 *  ind på hans plads). *Estimeret*: spillets genererede stab (uden ikke-spillerpost) vurderes ikke (som v ≥ T); 0x4cc9e0 (et kontrakttilbud fra
 *  klubben) før fyringen er ikke porteret. */
function staffTail(g: GameState, cid: number, clubT: number, fire: boolean): void {
  const e = entryOf(g, cid);
  const T = Math.min(Math.trunc(clubT / 5), 5000);
  const list: Staff[] = [];
  // (hukommelse, 22/11) klubbens stab i stabens rækkefølge én gang – før en kopi af hele staben (Object.values) pr. rolle pr. klub (~7 GB affald ved spilstarten)
  const own: Staff[] = [];
  for (const s of Object.values(g.staff)) if (s.club === cid) own.push(s);
  for (const [role, n] of [['assistant', 1], ['coach', 5], ['physio', 3], ['scout', 7]] as [StaffRole, number][]) {
    let k = 0;
    for (const s of own) {
      if (s.role !== role || k >= n) continue;
      k++;
      if (!e.slots.some((sl) => sl.role !== 0xb && sl.f === s.id)) list.push(s);
    }
  }
  let env: BoardEnv | null = null;
  for (const sl of e.slots) {
    if (sl.role === 0xb) continue;
    sl.b24 &= 0xfe; sl.b7 = 0; sl.bb = ftol(T * 2.5);
    if (sl.s17 !== -1) continue;
    sl.b3 = T;
    const k = list.findIndex((s) => JOB_OF[s.role] === sl.role);
    if (k < 0) continue;
    const s = list[k];
    sl.s13 = s.id;
    let v = T;
    if (s.cmNp && !s.cmExtra) {
      env ??= boardEnv(g, g.date, undefined, true);
      const p = env.person(s.id);
      if (p && p.np) v = scoreStaffForJob(env, p, cid, sl.role, env.manager(cid));
    }
    if (v >= T) { sl.f = s.id; sl.bb = 0; }
    else if (fire) { sl.f = sl.s13 = -1; fireStaff(g, s, cid, sl.role); }
    else { sl.f = -1; sl.bb = ftol((T - v) * 2.5); }
    list[k] = list[list.length - 1]; list.pop();
  }
  storeEntry(g, cid, e);
}

/** 0x690890 remove_staff_from_club (fyringen i halen): kontrakten fjernes, personen er klubløs og beholder jobkoden +0x3d */
function fireStaff(g: GameState, s: Staff, cid: number, job: number): void {
  const cur = s.career?.[s.career.length - 1];
  if (cur && !cur.to && cur.club === cid) careerEnd(s, 'sacked');
  else (s.career ??= []).push({ club: cid, from: s.cmJoined || g.date, to: g.date, why: 'sacked' });
  if (s.cmNp && !s.cmExtra) s.cmDbJob = job;
  // ingen historikpost: 0x690890 kalder ikke add_past_transfer 0x8cb810 (dens eneste kaldere er 0x68f9c0, 0x8c2180 og 0x8c9720)
  s.club = 0;
  s.assignment = null;
  s.coachAreas = undefined;
  g.cmStaffMoves = (g.cmStaffMoves ?? []).filter((m) => m.c !== cid || m.s !== s.id);
}

/** 0x83f3a0 for klubbens åbne stabspladser (+0xf = +0x13 = +0x17 = −1) med pladsens budget +7 – med ønskelisterne (SL) det, 0x83b6e0 har givet
 *  pladsen (cmShortlistGame.ts afterPlan → afterBudgetHooks); uden dem (se filhovedet) 0x83b6e0's første andel B/(k·n) (tabellen 0x83bce0: assistent
 *  og træner 10, spejder og fysioterapeut 20; n = åbne pladser + højst 4 åbne spillerpladser). `only`: kun den ene plads (0x843e10's genudfyldning). */
function staffSearch(g: GameState, cid: number, opts: { share?: { budget: number; n: number }; only?: number }): void {
  const club = g.clubs[cid];
  if (!club || isHumanClub(cid)) return;
  const e = entryOf(g, cid);
  const env = boardEnv(g, g.date, undefined, true);
  const rand = cmRand(g.seed ?? 0, cid, dayNum(g.date), 0x83fa7c);
  let changed = false;
  e.slots.forEach((sl, i) => {
    if (!isStaffSlot(sl.role) || sl.f !== -1 || sl.s13 !== -1 || sl.s17 !== -1) return;
    if (opts.only !== undefined && opts.only !== i) return;
    const budget = opts.share ? Math.trunc(opts.share.budget / (SHARE[sl.role] * opts.share.n)) : sl.b7 ?? 0;
    const g2 = sl.b24 & 0x1e;
    const best = findStaffTarget(g, env, club, sl.role, budget, sl.b3 ?? 0, g2 === 0xa || g2 === 0xc, rand);
    if (!best) return;
    sl.f = best.id; sl.s17 = 0; changed = true;                                     // målet og (spillets) budmærke: buddet venter på svaret
    const fee = best.club ? cmStaffCompensation(g, best) : 0;
    // 0x8d3090: nyheden "{klub} transfer bid for {navn}" til den menneskelige sælger (flag 2) – kun en besked; personen svarer selv (punkt 5)
    if (best.club && isHumanClub(best.club)) {
      const seller = g.clubs[best.club], who = best, job = sl.role;
      asOwner(best.club, () => addNews({ cat: 'transfer', key: 'cm.stBid', params: { club: club.name, name: `${who.first} ${who.last}`.trim(), last: who.last, from: seller?.name ?? '', fee, job },
        link: { kind: 'club', id: cid } }));
    }
    const r = cmRand(g.seed ?? 0, best.id, cid, dayNum(g.date), 0x4cd230);
    (g.cmStaffMoves ??= []).push({ s: best.id, c: cid, job: sl.role, from: best.club, fee, due: addDays(g.date, 1 + r(5)) });
  });
  if (changed) storeEntry(g, cid, e);
}

/** trupplanens hale (efter hver kørsel) og – uden ønskelisterne – målene med det anslåede budget; med ønskelisterne søges efter 0x83b6e0 */
export function cmStaffPlan(g: GameState, cid: number, clubT: number, openPlayerSlots: number, fire = false): void {
  if (!cmStaffOn(g) || isHumanClub(cid)) return;
  const club = g.clubs[cid];
  if (!club || !g.cmPlan?.[cid]) return;
  staffTail(g, cid, clubT, fire);
  if (cmShortlistOn(g)) return;
  // 0x83b86d: kun professionelle klubber (+0x64 = 1) får den første andel; kun de valgte lande (som ovenfor)
  if ((g.cmClubStat?.[cid]?.[0] ?? 1) !== 1 || !g.activeNations.includes(club.nation)) return;
  const e = entryOf(g, cid);
  const open = e.slots.filter((s) => isStaffSlot(s.role) && s.f === -1 && s.s13 === -1 && s.s17 === -1).length;
  if (!open) return;
  const env = boardEnv(g, g.date, undefined, true);
  staffSearch(g, cid, { share: { budget: Math.max(0, env.transferBudget(cid)), n: Math.max(1, open + Math.min(openPlayerSlots, 4)) } });
}

/** (ønskelisterne) 0x83b6e0 har kørt for klubben: dens 0x83f3a0-kald for stabspladserne – kun når 0x83b6e0 kom forbi sine porte (tilstand +4 = 1) */
function afterBudget(g: GameState, cid: number): void {
  if (!cmStaffOn(g) || isHumanClub(cid) || g.cmPlan?.[cid]?.st !== 1) return;
  if (!staffTailed(entryOf(g, cid).slots)) return;
  staffSearch(g, cid, {});
}

/** buddet er afgjort: pladsens mål og budmærke væk; et afslag genudfylder pladsen (0x8bf680 → 0x843e10(staff, køber, 1, 1) → 0x83f3a0) */
function staffBidDone(g: GameState, m: CmStaffMove, refill: boolean): void {
  const e = g.cmPlan?.[m.c] ? entryOf(g, m.c) : null;
  if (!e) return;
  const i = e.slots.findIndex((sl) => sl.role === m.job && sl.f === m.s && sl.s17 !== -1);
  if (i < 0) return;
  e.slots[i].f = -1; e.slots[i].s17 = -1;
  storeEntry(g, m.c, e);
  if (refill && !isHumanClub(m.c)) {
    const open = e.slots.filter((s) => isStaffSlot(s.role) && s.f === -1 && s.s13 === -1 && s.s17 === -1).length;
    const share = cmShortlistOn(g) ? undefined : { budget: Math.max(0, boardEnv(g, g.date, undefined, true).transferBudget(m.c)), n: Math.max(1, open) };
    staffSearch(g, m.c, { only: i, share });
  }
}

/** 0x5ce2d0's gren for ikke-spillerne (0x5d3367–0x5d352d, dagligt for alle personer med ikke-spillerpost): for stab med klub (kontraktens klub) og
 *  job ≠ 5 (managerne har deres egen – 0x6a3770): omdømmet np+0xa = ftol(s16((klubbens +0x80 + 50·CA)/2)·0,05 + np+0xa·0,95) (0x5d341b–0x5d346f),
 *  CA'ens gang (0x5d3473–0x5d3520: under 40 år rand(4) ≠ 0 → CA += rand(6) − rand(3), ellers CA += rand(6) − rand(6); fra 40 år kun når rand(20) = 0:
 *  CA += rand(6) − rand(6); højst PA) og afbalanceringen 0x539490. Oraklet: Keith Creamer/Norwich omdømme 1 → 225 → 438 … → 4.440 (21/11-01) – uden
 *  den stod stabens omdømme stille (mange på 1), så den nye managers vurdering 0x69d1b0 fyrede for mange (punkt 14b). Kontraktdelen (+0x4f/sproget
 *  0x5d3378) springes over i originalen (kontrakten er nulstillet før grenen). */
export function cmStaffNpDaily(g: GameState): void {
  if (!cmStaffOn(g)) return;
  const day = dayNum(g.date);
  for (const s of Object.values(g.staff)) {
    if (!s.club || s.cmExtra || !s.cmNp || s.role === 'manager') continue;
    const club = g.clubs[s.club];
    if (!club || club.nation === undefined || club.nation < 0) continue;
    const ca = s16(s.ca ?? 0);
    const r = (s.cmRep ??= [1, 1, 1]);
    const tgt = s16(Math.trunc((s16(clubRepMem(g, s.club)) + 50 * ca) / 2));
    r[1] = s16(ftol(tgt * 0.05 + s16(r[1]) * 0.95));
    const rand = cmRand(g.seed ?? 0, s.id, day, 0x5d3473);
    const age = s.dob ? ageOn(s.dob, g.date) : 40;
    let c = ca;
    if (age < 40) {
      if (rand(4) !== 0) { const a = rand(3); c = s16(c - a + rand(6)); }
      else { const a = rand(6); c = s16(c - a + rand(6)); }
    } else {
      if (rand(20) !== 0) continue;
      const a = rand(6); c = s16(c - a + rand(6));
    }
    const pa = s16(s.cmPa ?? ca);
    if (c > pa) c = pa;
    s.ca = c;
    s.cmNp = rebalanceStaffNp(c, pa, s.cmNp, JOB_OF[s.role] ?? 0);
  }
}

/** dagligt: buddene, hvis tid er kommet – sælgeren har sagt ja (0x8c8160), personen svarer (se filhovedet), handlen og nyheden (0x8c34e0/0x8dbef0) */
export function cmStaffMovesDaily(g: GameState): void {
  if (!cmStaffOn(g) || !g.cmStaffMoves?.length) return;
  // ældre gemte spil: bud, der ventede på menneskets Respond, får personens svar som alle andre (1–5 dage)
  for (const m of g.cmStaffMoves) if (m.h) {
    delete m.h; delete m.id;
    m.due = addDays(g.date, 1 + cmRand(g.seed ?? 0, m.s, m.c, dayNum(g.date), 0x4cd230)(5));
  }
  const due = g.cmStaffMoves.filter((m) => m.due <= g.date);
  if (!due.length) return;
  g.cmStaffMoves = g.cmStaffMoves.filter((m) => m.due > g.date);
  let env: BoardEnv | null = null;
  for (const m of due) {
    const s = g.staff[m.s], buyer = g.clubs[m.c];
    if (!s || !buyer || s.club !== m.from || s.club === m.c || isHumanClub(m.c)) { staffBidDone(g, m, true); continue; }
    const role = ROLE_OF[m.job];
    if (Object.values(g.staff).filter((x) => x.club === m.c && x.role === role).length >= SLOTS[m.job]) { staffBidDone(g, m, true); continue; }
    env ??= boardEnv(g, g.date, undefined, true);
    const p = env.person(s.id);
    if (!p || staffJobInterest(g, env, p, m.c, m.job) < 0.75) { staffBidDone(g, m, true); env = null; continue; }
    // kontrakten: originalens tilbud 0x4cda70 → 0x85fc50 (løn og udløb) – før handlen (personens nuværende kontrakt indgår)
    const terms = cmStaffTerms(g, s, m.c, m.job);
    if (terms?.refuse) { staffBidDone(g, m, true); env = null; continue; }
    staffBidDone(g, m, false);
    const seller = m.from ? g.clubs[m.from] : undefined;
    // nyheden FØR kontrakten flyttes (0x8dbef0 kaldes fra try_complete_offer før skiftet)
    forEachHuman(() => staffMoveNews(g, s, buyer, seller, m.job));
    if (seller && m.fee > 0) {
      buyer.balance -= m.fee; buyer.finance.transfersOut += m.fee; bookBlockEur(g, buyer, CMK.bought, m.fee);
      buyer.transferBudget = Math.max(0, buyer.transferBudget - m.fee);
      seller.balance += m.fee; seller.finance.transfersIn += m.fee; bookBlockEur(g, seller, CMK.sold, m.fee);
    }
    const last = s.career?.[s.career.length - 1];
    if (last && !last.to && s.club) { last.to = g.date; last.why = 'poached'; }
    (s.career ??= []).push({ club: m.c, from: g.date });
    s.wage = terms?.wage ?? cmStaffDemand(s, role);
    recordStaffMove(s, m.c, m.fee);
    cmPlanKick(g, m.c);                                                          // 0x8c9720 (0x8ca0ce): køberens tæller +8 = 100
    s.club = m.c;
    s.role = role;
    s.assignment = null;
    s.coachAreas = undefined;
    s.cmJoined = g.date;
    s.expires = terms?.expires ?? `${Number(g.date.slice(0, 4)) + 2}-06-30`;
  }
}

function staffMoveNews(g: GameState, s: Staff, buyer: Club, seller: Club | undefined, job: number): void {
  const r = s.cmRep ?? [1, 1, 1];
  const q = job === 8 || job === 9 || job === 10 ? (v: number) => ftol(v * 0.25) : (v: number) => v;   // 0x8d169e
  const fake = { id: s.id, nation: s.nation, cmRepMem: [q(r[0]) / 50, q(r[1]) / 50, q(r[2]) / 50] } as unknown as Parameters<typeof transferNewsToMe>[1];
  if (!transferNewsToMe(g, fake, buyer, { seller, fee: seller ? cmStaffCompensation(g, s) : 0, staff: true, seen: [r[0], r[1], r[2]] })) return;
  const fn = seller?.short || seller?.name || '';
  addNews({ cat: 'transfer', key: `cm.stm.${s.id % 4}`, params: { to: buyer.short || buyer.name, last: s.last, name: `${s.first} ${s.last}`.trim(), from: fn, job },
  link: { kind: 'club', id: buyer.id } });
}

// trupplanen kalder halen efter hver kørsel (cmSquadPlanGame.ts – ingen cirkulær import)
afterPlanHooks.push(cmStaffPlan);
afterBudgetHooks.push(afterBudget);
