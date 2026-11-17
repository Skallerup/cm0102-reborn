// Computerklubbernes stabsskifter som i CM 01/02 (kun den originale database i ægte tilstand, cmActive): klubberne henter assistenter, trænere,
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
//      vurderet med 0x69d1b0 (cmBoard.ts scoreStaffForJob med jobblokkene 0x69db39/0x69deb6/0x69e22d/0x69e4e7).
//   4. Buddet 0x84a020 → build_bid 0x8e5d60: for en ikke-spiller er beløbet kompensationen 0x8d0780 (+0x1b, buddets type 5); sælgeren siger ja
//      straks (0x8c8160: personen har ingen spillerpost → status 0x10). 0x8d0780: kontrakt med +0x35 = 2 → ftol(dage til udløb · ugeløn / 7),
//      mindst £1.000, højst £1.000.000; uden kontrakt 0.
//   5. Handlen 0x8c34e0 → nyheden 0x8dbef0 (modtagerne som en spillerhandel, omdømmet fra ikke-spillerposten +8/+0xa/+0xc, ×0,25 for træner,
//      spejder og fysioterapeut – 0x8d169e) og teksten 0x8dc370: overskriften efter (args) mod 4 – get / moves to / seal … deal / sign – og
//      brødteksten "{Club} have appointed {Club's} {Name} as {an} {job}." (0xa98b58/0xa98bcc; jobbet 0x53ad00 med små bogstaver).
//
// 6. Sælgeren er et menneske (0x8be300 add_offer, 0x8be86b: 0x600a50 på kontraktens klub): svartiden er 0x1c = 28 dage (0x8be884) i stedet for
//    0x8cc5b0, og mennesket får nyheden "{Club} transfer bid for {Name}" (0xa8f578, 0x8d3520) med "{Club} have made an offer for {Name}." og
//    "{Club 1} will be due £X in compensation if the deal goes ahead" (0xa8f6ee). Respond: Accept/Reject (cmStaffBidAnswer); ja → personen svarer
//    som ved computerklubberne, og kompensationen går til mennesket; intet svar inden fristen → buddet bortfalder.
// 7. Managerskiftet 0x694c80 sætter trupplanens +4 = 2 (0x694cd2) og kalder 0x84abe0 → 0x83cb40(entry, klub, 0, 1): +4 = 2 i en computerklub giver
//    [esp+0x60] = 1 (0x83cc44), og halen fyrer indehavere, den nye manager vurderer under T (0x83ee36 → 0x690890 remove_staff_from_club).
// 8. Kontrakten: 0x4cda70 offer_contract(staff, klub, NULL, −1, 1,0, 2) → 0x85fc50 med 0x849f00's job/status (pladsen i køberens plan) og
//    lønloftet 0x597db0 (cmContractGame.ts cmStaffTerms); uden tilbud personens krav 0x85fc50.
//
// *Estimeret* (koden er ikke fulgt hele vejen): målet skal mindst nå pladsens grænse T (0x840112's sammenligning), antallet n i budgettet
// (originalen sorterer pladserne efter +0xb og stopper ved den 4. åbne spillerplads), hvornår buddet afgives (her straks ved planen; originalen
// ugentligt, dagligt for omdømme > 6250), personens svar (beslutningsdagen 0x4cd230 er ikke porteret: viljen 0x844780 for jobbet ≥ 0,75 som
// spillernes 0x8c0080, svaret efter 1–5 dage), overskriftens variant (personens id mod 4), brødtekstens variant for et bud uden kontantbeløb
// (0xa900b4 "have made an offer for") og at kun klubber i de valgte lande henter stab (planen kører hos os for alle synlige ligaer;
// originalens planlægger springer klubber uden kørende liga over, og kun de valgte landes klubber har genereret stab). Ikke porteret:
// reserveholdets manager (rolle 7 – findes ikke i spillet), 0x690890 for spillets genererede stab (ingen ikke-spillerpost), trupplanen for
// menneskets klub ved hans egen ansættelse (0x84abe0 – fyrer ikke), arbejdstilladelser for stab (0x84b180).
import type { Club, GameState, Staff, StaffRole } from './types';
import { addNews } from './state';
import { cmActive, cmRand, clubRepMem } from './cmPlayerData';
import { boardEnv, staffJobInterest } from './cmBoardGame';
import { repFor, scoreStaffForJob, type BoardEnv, type Person } from './cmBoard';
import { bookBlock, K as CMK, GBP } from './cmFinance';
import { cmStaffDemand, cmStaffRestGbp, cmStaffCompensation } from './cmStaff';
import { asOwner, forEachHuman, isHumanClub } from './humans';
import { careerEnd } from './careers';
import { cmStaffTerms } from './cmContractGame';
import { transferNewsToMe } from './cmNewsScope';
import { afterPlanHooks } from './cmSquadPlanGame';
import { addDays } from './dates';

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
  /** buddet ligger hos et menneske (sælgeren) til fristen `due` (0x8be884: 28 dage) – nyheden "{klub} transfer bid for {navn}" med Respond */
  h?: 1;
  /** buddets nummer (nyhedens `sb`) */
  id?: number }

/** pladsernes indehavere (0x83ebfb–0x83ecef: assistenten, trænerne, fysioterapeuterne, spejderne – i ansættelsesrækkefølge) */
function clubStaff(g: GameState, cid: number): Staff[] {
  const out: Staff[] = [];
  for (const role of ['assistant', 'coach', 'physio', 'scout'] as StaffRole[])
    for (const s of Object.values(g.staff)) if (s.club === cid && s.role === role) out.push(s);
  return out;
}

/** 0x5407e0(staff, seer, 1) ≥ rand(2000) + 3250 og landets/verdensdelens spærrer (0x83ff8x–0x840058) */
function passesScouting(g: GameState, env: BoardEnv, p: Person, s: Staff, club: Club, mgr: Person | null, rand: (n: number) => number): boolean {
  const cn = club.nation, crep = s16(clubRepMem(g, club.id));
  const sc = s.club ? g.clubs[s.club] : undefined;
  if (p.nation === cn || (p.b22 & 0xff) > 0 || (sc && sc.nation === cn)) return true;          // 0x840060 → vurdering
  const cont = (n: number) => (n >= 0 ? g.cmNationCont?.[n] ?? -1 : -1);
  if (p.nation >= 0 && cont(p.nation) !== cont(cn)) {
    if (crep < 0xabe) return false;
    const same = !sc || cont(sc.nation) === cont(cn);
    if (!same && crep < 0x109a && ((env.nat85(cn) << 24) >> 24) < 12) return false;
  }
  const seen = s16(repFor(env, p, mgr ? { club: club.id, nation: mgr.nation } : { club: club.id, nation: cn }));
  return seen >= rand(2000) + 0xcb2;
}

/** halen 0x83ebfb–0x83f32b + 0x83b6e0's stabsdel + 0x83f3a0's stabsgren + 0x84a020: computerklubbens ledige stabspladser og buddene */
export function cmStaffPlan(g: GameState, cid: number, clubT: number, openPlayerSlots: number, fire = false): void {
  if (!cmActive(g) || isHumanClub(cid)) return;
  const club = g.clubs[cid];
  if (!club) return;
  if (fire) fireWeakStaff(g, cid, Math.min(Math.trunc(clubT / 5), 5000));
  // 0x83b86d: kun professionelle klubber (+0x64 = 1) får budget til stab; kun de valgte lande (se filhovedet)
  if ((g.cmClubStat?.[cid]?.[0] ?? 1) !== 1 || !g.activeNations.includes(club.nation)) return;
  const T = Math.min(Math.trunc(clubT / 5), 5000);
  const have = clubStaff(g, cid);
  const vacant: number[] = [];
  for (const job of [6, 8, 10, 9]) {
    const held = have.filter((s) => JOB_OF[s.role] === job).length;
    for (let k = held; k < SLOTS[job]; k++) vacant.push(job);
  }
  // pladser med et bud (+0x17 ≠ −1) springes over af 0x84a020
  const pending = (g.cmStaffMoves ?? []).filter((m) => m.c === cid);
  const todo: number[] = [];
  for (const job of [6, 8, 10, 9]) {
    const k = vacant.filter((j) => j === job).length - pending.filter((m) => m.job === job).length;
    for (let i = 0; i < k; i++) todo.push(job);
  }
  if (!todo.length) return;
  const env = boardEnv(g, g.date, undefined, true);
  const budget = Math.max(0, env.transferBudget(cid));
  const n = Math.max(1, vacant.length + Math.min(openPlayerSlots, 4));
  const mgr = env.manager(cid);
  const crep = s16(clubRepMem(g, cid));
  const rand = cmRand(g.seed ?? 0, cid, dayNum(g.date), 0x83fa7c);
  const vac = new Set(((g.cmBoard as { vac?: { cand?: number }[] } | undefined)?.vac ?? []).map((v) => v.cand));
  const taken = new Set((g.cmStaffMoves ?? []).filter((m) => m.c === cid).map((m) => m.s));
  for (const job of todo) {
    const share = Math.trunc(budget / (SHARE[job] * n));
    let best: Staff | null = null, bestV = T - 1;
    for (const s of Object.values(g.staff)) {
      if (!s.cmNp || s.cmExtra || s.club === cid || taken.has(s.id) || vac.has(s.id)) continue;
      if (s.role === 'manager' && s.club) continue;                                // (klubbens manager – managerjobbet er MANAGER_MANAGER's)
      const w = cmStaffRestGbp(g, s, false);
      if (w >= share || w > (crep + 500) * 10) continue;                          // 0x83fc56–0x83fcb5
      const p = env.person(s.id);
      if (!p || !p.np) continue;
      if (!passesScouting(g, env, p, s, club, mgr, rand)) continue;
      const v = scoreStaffForJob(env, p, cid, job, mgr);
      if (v > bestV) { bestV = v; best = s; }
    }
    if (!best) continue;
    taken.add(best.id);
    const fee = best.club ? cmStaffCompensation(g, best) : 0;
    if (best.club && isHumanClub(best.club)) {
      // 0x8be300 add_offer: sælgeren er et menneske (0x600a50) → svartiden 0x1c (28 dage, 0x8be884) i stedet for 0x8cc5b0; nyheden "transfer bid for"
      if ((g.cmStaffMoves ?? []).some((m) => m.s === best!.id && m.h)) continue;   // højst ét ventende bud pr. person hos mennesket
      const id = (g.cmStaffBidSeq = (g.cmStaffBidSeq ?? 0) + 1);
      (g.cmStaffMoves ??= []).push({ s: best.id, c: cid, job, from: best.club, fee, due: addDays(g.date, 28), h: 1, id });
      const seller = g.clubs[best.club], who = best;
      asOwner(best.club, () => addNews({ cat: 'transfer', key: 'cm.stBid', params: { club: club.name, name: `${who.first} ${who.last}`.trim(), last: who.last, from: seller?.name ?? '', fee, job, sb: id },
        link: { kind: 'club', id: cid } }));
      continue;
    }
    const r = cmRand(g.seed ?? 0, best.id, cid, dayNum(g.date), 0x4cd230);
    (g.cmStaffMoves ??= []).push({ s: best.id, c: cid, job, from: best.club, fee, due: addDays(g.date, 1 + r(5)) });
  }
}

/** 0x83ecf1–0x83f31b, første kørsel efter et managerskifte ([esp+0x60]): pladsernes indehavere (den første med jobbet, i ansættelsesrækkefølge –
 *  assistenten, fem trænere, én fysioterapeut, syv spejdere) vurderes af den nye manager med 0x69d1b0; under grænsen T og uden et
 *  kontrakttilbud til klubben (0x4cc9e0) → remove_staff_from_club 0x690890 (kontrakten fjernes, personen er klubløs). *Estimeret*: spillets
 *  genererede stab (uden ikke-spillerpost) vurderes ikke. */
function fireWeakStaff(g: GameState, cid: number, T: number): void {
  const env = boardEnv(g, g.date, undefined, true);
  const mgr = env.manager(cid);
  const have = clubStaff(g, cid);
  for (const job of [6, 8, 10, 9]) {
    const holders = have.filter((s) => JOB_OF[s.role] === job).slice(0, SLOTS[job]);
    for (const s of holders) {
      if (!s.cmNp || s.cmExtra) continue;
      const p = env.person(s.id);
      if (!p || !p.np) continue;
      if (scoreStaffForJob(env, p, cid, job, mgr) >= T) continue;
      const cur = s.career?.[s.career.length - 1];
      if (cur && !cur.to && cur.club === cid) careerEnd(s, 'sacked');
      else (s.career ??= []).push({ club: cid, from: s.cmJoined || g.date, to: g.date, why: 'sacked' });
      s.club = 0;
      s.assignment = null;
      s.coachAreas = undefined;
      g.cmStaffMoves = (g.cmStaffMoves ?? []).filter((m) => m.c !== cid || m.s !== s.id);
    }
  }
}

/** Respond på "{klub} transfer bid for {navn}": det ventende bud på menneskets stab */
export function cmStaffBidOpen(g: GameState, n: { key: string; params: Record<string, string | number> }): CmStaffMove | null {
  if (n.key !== 'cm.stBid') return null;
  const m = (g.cmStaffMoves ?? []).find((x) => x.h && x.id === Number(n.params.sb));
  if (!m || g.staff[m.s]?.club !== m.from || m.from !== g.userClub) return null;
  return m;
}

/** menneskets svar: ja → personen beslutter sig efter 1–5 dage som ved computerklubberne (0x4cd230, se filhovedet); nej → buddet afvises */
export function cmStaffBidAnswer(g: GameState, id: number, accept: boolean): 'ok' | 'error' {
  const m = (g.cmStaffMoves ?? []).find((x) => x.h && x.id === id);
  if (!m || g.staff[m.s]?.club !== m.from || m.from !== g.userClub) return 'error';
  if (!accept) { g.cmStaffMoves = g.cmStaffMoves!.filter((x) => x !== m); return 'ok'; }
  const r = cmRand(g.seed ?? 0, m.s, m.c, dayNum(g.date), 0x4cd230);
  delete m.h;
  m.fee = cmStaffCompensation(g, g.staff[m.s]);
  m.due = addDays(g.date, 1 + r(5));
  return 'ok';
}

/** dagligt: buddene, hvis tid er kommet – sælgeren har sagt ja (0x8c8160), personen svarer (se filhovedet), handlen og nyheden (0x8c34e0/0x8dbef0) */
export function cmStaffMovesDaily(g: GameState): void {
  if (!cmActive(g) || !g.cmStaffMoves?.length) return;
  // bud hos mennesket: fristen udløbet uden svar → buddet bortfalder; personen er ikke længere i klubben → ligeså
  g.cmStaffMoves = g.cmStaffMoves.filter((m) => !m.h || (m.due > g.date && g.staff[m.s]?.club === m.from));
  const due = g.cmStaffMoves.filter((m) => !m.h && m.due <= g.date);
  if (!due.length) return;
  g.cmStaffMoves = g.cmStaffMoves.filter((m) => m.h || m.due > g.date);
  let env: BoardEnv | null = null;
  for (const m of due) {
    const s = g.staff[m.s], buyer = g.clubs[m.c];
    if (!s || !buyer || s.club !== m.from || s.club === m.c || isHumanClub(m.c)) continue;
    const role = ROLE_OF[m.job];
    if (Object.values(g.staff).filter((x) => x.club === m.c && x.role === role).length >= SLOTS[m.job]) continue;
    env ??= boardEnv(g, g.date, undefined, true);
    const p = env.person(s.id);
    if (!p || staffJobInterest(g, env, p, m.c, m.job) < 0.75) continue;
    // kontrakten: originalens tilbud 0x4cda70 → 0x85fc50 (løn og udløb) – før handlen (personens nuværende kontrakt indgår)
    const terms = cmStaffTerms(g, s, m.c, m.job);
    if (terms?.refuse) continue;
    const seller = m.from ? g.clubs[m.from] : undefined;
    // nyheden FØR kontrakten flyttes (0x8dbef0 kaldes fra try_complete_offer før skiftet)
    forEachHuman(() => staffMoveNews(g, s, buyer, seller, m.job));
    if (seller && m.fee > 0) {
      buyer.balance -= m.fee; buyer.finance.transfersOut += m.fee; bookBlock(g, buyer, CMK.bought, Math.round(m.fee * GBP));
      buyer.transferBudget = Math.max(0, buyer.transferBudget - m.fee);
      seller.balance += m.fee; seller.finance.transfersIn += m.fee; bookBlock(g, seller, CMK.sold, Math.round(m.fee * GBP));
    }
    const last = s.career?.[s.career.length - 1];
    if (last && !last.to && s.club) { last.to = g.date; last.why = 'poached'; }
    (s.career ??= []).push({ club: m.c, from: g.date });
    s.wage = terms?.wage ?? cmStaffDemand(s, role);
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
