// Originalens arbejdstilladelses-historik (TRANSFER_MANAGER [0xde1f54] +0x93a/+0x93e, 14-bytes poster sorteret efter staff-id, og bit 0x20 i
// +0x86e[id·8]) – det, 0x8c7260 slår op for computerens holdudtagelse (0x6e2f20 0x6e5c3f: trupstatus 1–3 under 70 % af kampene → +50 − pct/2).
// Afkodet 11/11-2026 (noten ~/cm0102-engine/notes/cm-permit.md):
//
//   0x8c7560(staff, klub, flag)  "skal have tilladelse": klubbens land har region +0x76 = 0xe (De Britiske Øer) og spilleren er ikke EU-borger
//                                (0x53d740(staff, 0): ingen af hans to nationer har +0x7f = 2, og hans nation er ikke [0x9cf4ac]); flag 0 →
//                                en spiller med lejekontrakt (+0x35 & 0x3f = 2), der allerede har en post, tæller ikke.
//   0x8c6e60 (spilstarten)       hver spiller i en klub (job 0xb), der skal have tilladelse: året = det år, han kom til klubben (staff +0x40),
//                                eller ældre sæsoner i samme land i historikken (hver 6. post, sic); fem år eller mere → hans anden nationalitet
//                                (+0x1e) bliver klubbens land; ellers en post {id, +4 = 0, +6 = 0, +8 = året, +0xa = landet}.
//   0x8c39f0 (efter hver kamp)   for begge hold, når kampen tæller (turnering, ikke landskampsturnering/landshold, holdets flag +0x40/+0x41 ≠ 0 –
//                                ikke venskabskampe) eller er en reservekamp (fixture −2): +4 += 1 for hver af de 20 i kamptruppen, der spillede
//                                (ikke lejede), +6 += 1 for truppens øvrige med post, der var klar (ikke skadet/genoptræning 0x62c400, ikke
//                                udelukket 0x55d270, ikke på landsholdet 0x7757d0, ikke 0x8cf5e0, ikke udlejet).
//   0x8c7e20 (klubskifte)        skal have tilladelse i den nye klub: posten nulstilles (+4/+6 = 0, landet = det nye; året = i år, hvis landet
//                                skifter og ikke begge er britiske) eller oprettes med året i år; ellers fjernes posten.
//   0x8c7330 (1/1 og hver 7. dag) en post med i år − året > 4 → spilleren får landet som anden nationalitet, posten fjernes; spillere uden
//                                spillerpost fjernes.
//
// Den originale database i ægte tilstand (cmActive) – og (19/11, "Altid som originalen") nye spil med en CM-database i ægte tilstand (cmLogic,
// også 2026/27-opdateringen): spil startet med modulet har g.cmWp (cmPermitOn). 2026/27 bruger databasens nation.dat +0x76/+0x7f (g.cmNation76/7f).
// Historikken bruger ingen tilfældige tal (tildelingen 0x8c7950 nederst kun med flaget a5 – spejderne).
//
// Tildelingen 0x8c7950 TRANSFER_MANAGER::is_work_permit_granted(staff, land (ubrugt), kontrakttilbud, post (altid 0), tilfældig) – cmWorkPermit
// nedenfor – og dens tilstand: landskampshistorikken +0x86e[id·8] +3 (16 bit, bit 0 = landets seneste kamp: spillede han?) og +5 (landets kamptal
// ved sidste opdatering), sat ved spilstarten (0x8c6e60: over 13 landskampe 0x3fff, over 5 0x1fff), efter hver A-landskamp (NationalTeams 0x76b600
// → 0x8ce920) og af 0x8c7950 selv; landsholdets kamptal [[0xb74318]+4] nation·110 + 2 (0x76b600: A-, 'B'- og U21-landskampe, ikke OL 405); og
// FIFA_RANKINGS::count_results_in_period 0x58d710 på FIFA-listens resultater (cmFifa.ts – uden den: g.cmWp.res med samme regler 0x58cf70/0x58d460).

import type { Fixture, GameState, MatchReport, Player } from './types';
import { cmActive, cmLogic } from './cmPlayerData';
import { squad } from './state';
import { ageOn } from './dates';

/** nation.dat +0x7f = 2 (3.9.60) – EU/EØS-borgere i originalens forstand (0x53d740) */
export const CM_EU = new Set(['Andorra', 'Austria', 'Belgium', 'Denmark', 'England', 'Faroe Islands', 'Finland', 'France', 'Germany', 'Greece',
  'Holland', 'Iceland', 'Republic of Ireland', 'Italy', 'Liechtenstein', 'Luxembourg', 'Malta', 'Northern Ireland', 'Norway', 'Portugal',
  'San Marino', 'Scotland', 'Spain', 'Sweden', 'Wales']);
/** nation.dat +0x76 = 0xe (3.9.60) – landene, hvor arbejdstilladelsen gælder (0x8c7560) */
export const CM_BRITISH = new Set(['England', 'Republic of Ireland', 'Northern Ireland', 'Scotland', 'Wales']);

/** posten: [+4 kampe spillet, +6 kampe ikke spillet, +8 året, +0xa landet (world.nations-indeks)] */
export type PermitEntry = [number, number, number, number];

const nameOf = (g: GameState, n: number | undefined) => (n === undefined || n < 0 ? '' : g.nations[n]?.name ?? '');

/** 0x53d740(staff, 0): EU-borger – hans nation har +0x7f = 2 eller er [0x9cf4ac] (Schweiz, nation-id 180 – målt i oraklet, "cg"-linjen),
 *  eller hans anden nation har +0x7f = 2 */
export function cmEuCitizen(g: GameState, p: Player): boolean {
  const n = nameOf(g, p.nation);
  return eu7f(g, p.nation) || n === 'Switzerland' || eu7f(g, p.cmNation2);
}
/** nation +0x7f = 2: den originale database efter CM_EU, 2026/27 fra databasens nation.dat (g.cmNation7f – som cmScoutAsg.ts) */
function eu7f(g: GameState, n: number | undefined): boolean {
  if (n === undefined || n < 0) return false;
  return !cmActive(g) && g.cmNation7f ? g.cmNation7f[n] === 2 : CM_EU.has(nameOf(g, n));
}
/** nation +0x76 = 0xe (De Britiske Øer): den originale database efter CM_BRITISH, 2026/27 fra databasens nation.dat (g.cmNation76) */
export function cmBritish(g: GameState, n: number | undefined): boolean {
  if (n === undefined || n < 0) return false;
  return !cmActive(g) && g.cmNation76 ? g.cmNation76[n] === 0xe : CM_BRITISH.has(nameOf(g, n));
}
/** modulet er slået til: den originale database i ægte tilstand (gamle spil uden g.cmWp) eller et spil startet med det */
const permitGate = (g: GameState) => cmActive(g) || !!g.cmWp;
/** spillet blev startet med 0x8c7950-porten (g.cmWp) */
export const cmPermitOn = (g: GameState) => !!g.cmWp;

/** 0x8c7560(staff, klub, flag): skal spilleren have arbejdstilladelse i klubben? */
export function cmNeedsPermit(g: GameState, p: Player, club: number, flag: boolean): boolean {
  const c = g.clubs[club];
  if (!c || !cmBritish(g, c.nation)) return false;
  if (cmEuCitizen(g, p)) return false;
  if (flag) return true;
  // 0x8c761d: en spiller med lejekontrakt (+0x35 & 0x3f = 2), der allerede har en post, tæller ikke
  return !(p.loan && g.cmPermit?.[p.id]);
}

const yearOf = (iso: string) => +iso.slice(0, 4);

/** 0x8c6e60 – spilstarten (TRANSFER_MANAGER::TRANSFER_MANAGER 0x8bba30) */
export function cmPermitNewGame(g: GameState): void {
  if (!cmActive(g) && !cmLogic(g)) return;
  const tab: Record<number, PermitEntry> = (g.cmPermit = {});
  const year = yearOf(g.date);
  // 0x8bba30: +0x86e = calloc(personer, 8) – 0x8c6e60 0x8c6ea8: landskampe (+0x22) over 13 → +3 = 0x3fff, over 5 → 0x1fff (for alle personer)
  const w: CmWp = (g.cmWp = { b: {}, nt: {} });
  for (const p of Object.values(g.players)) {
    const caps = Math.min(255, p.caps ?? 0);
    if (caps > 13) w.b[p.id] = [0x3fff, 0]; else if (caps > 5) w.b[p.id] = [0x1fff, 0];
  }
  for (const p of Object.values(g.players)) {
    if (p.regen || !p.club || !cmNeedsPermit(g, p, p.club, false)) continue;
    // staff +0x40: året han kom til klubben – eller historikkens sæsoner i samme land (0x7c3e40, hver 6. post): den første er den nuværende
    // klubs sæson 0x669950, og TRANSFER_MANAGER bygges på databasens dato 1/1, før landets sæsonskifte (tabellen 0xb63d60 +0x15 = dag 170 for
    // de britiske lande) – altså året før. De ældre sæsoner i historikken har vi ikke (*estimeret*: kun den første).
    const bx = Math.min(p.cmJoined ? yearOf(p.cmJoined) : year, year - 1);
    const nation = g.clubs[p.club].nation;
    if (year - bx >= 5) { p.cmNation2 = nation; continue; }                   // 0x8c6f9a: +0x1e = klubbens land
    tab[p.id] = [0, 0, bx, nation];
  }
}

/** 0x8c7e20(staff, klub) – klubskiftet (0x8c1af0); kaldt af setClub */
export function cmPermitMove(g: GameState, p: Player, club: number): void {
  if (!permitGate(g) || !g.cmPermit || p.regen) return;
  const tab = g.cmPermit, e = tab[p.id];
  if (club && cmNeedsPermit(g, p, club, true)) {
    const nation = g.clubs[club].nation, year = yearOf(g.date);
    if (e) {
      // 0x8c7f3a: et nyt land (og ikke britisk → britisk) giver et nyt år
      if (e[3] !== nation && !(cmBritish(g, e[3]) && cmBritish(g, nation))) e[2] = year;
      e[0] = 0; e[1] = 0; e[3] = nation;
    } else tab[p.id] = [0, 0, year, nation];
  } else if (e) delete tab[p.id];
}

/** 0x8c39f0(fixture, resultat) – efter en klubkamp (sim.ts applyMatchResult; alle vores turneringskampe tæller – venskabskampene spilles i
 *  friendlies.ts og kalder ikke her). Reservekampe (fixture −2) har ingen kamptrup hos os (reserves.ts) og tæller ikke (*estimeret*). */
export function cmPermitAfterMatch(g: GameState, f: Fixture, rep: MatchReport, unavailable: (p: Player) => boolean): void {
  if (!permitGate(g) || !g.cmPermit) return;
  const tab = g.cmPermit;
  for (const side of [0, 1]) {
    const club = side === 0 ? f.home : f.away;
    const played = new Set<number>();
    for (const l of rep.players) {
      if (l.team !== side) continue;
      played.add(l.id);
      const p = g.players[l.id];
      if (!p || p.regen || p.loan) continue;                                  // 0x8c3b98: 0x4cf6d0 – en lejekontrakt tæller ikke
      const e = tab[p.id];
      if (e) e[0] = (e[0] + 1) & 0xffff;
    }
    for (const p of squad(club)) {
      const e = tab[p.id];
      if (!e || played.has(p.id) || p.regen || p.loan || unavailable(p)) continue;
      e[1] = (e[1] + 1) & 0xffff;
    }
  }
}

/** 0x8c7330 – 1/1 og hver dag med dag-i-året % 7 = 0 (TRANSFER_MANAGER::daily_update 0x8c5880, slice 2) */
export function cmPermitDaily(g: GameState): void {
  if (g.cmWp?.res && g.date.slice(8) === '18') fifaPrune(g, g.cmWp);
  if (!permitGate(g) || !g.cmPermit) return;
  const d = new Date(`${g.date}T00:00:00Z`), y = d.getUTCFullYear();
  const doy = Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000);
  if (doy % 7 !== 0) return;                                                  // dag 0 (1/1) er også ≡ 0 mod 7
  const tab = g.cmPermit;
  for (const k of Object.keys(tab)) {
    const id = +k, e = tab[id], p = g.players[id];
    if (!p) { delete tab[id]; continue; }
    if (y - e[2] > 4) { p.cmNation2 = e[3]; delete tab[id]; }
  }
}

/** 0x8c7260(staff) og 0x8c7560(staff, kontraktklub, 1) til 0x6e2f20 (roleScore.ts RoleData.history) */
export function cmPermitHistory(g: GameState, p: Player): { w4: number; w6: number; ok: boolean } | null {
  const e = g.cmPermit?.[p.id];
  if (!e || !p.club || !cmNeedsPermit(g, p, p.club, true)) return null;
  return { w4: e[0], w6: e[1], ok: true };
}

// ---------------------------------------------------------------- tildelingen 0x8c7950

/** 0x8c7950's tilstand: b[staff-id] = [+0x86e[id·8] +3 (historikken), +5 (landets kamptal sidst)], nt[nation] = [[0xb74318]+4] nation·110 + 2,
 *  res[nation] = FIFA_RANKINGS' resultater [måned (0–11), år] for spil uden originalens FIFA-liste (g.intl.cmFifa – 2026/27) */
export interface CmWp { b: Record<number, [number, number]>; nt: Record<number, number>; res?: Record<number, [number, number][]>; last?: string }

/** 0x8ce920(staff, kamptal) – og 0x8c7950 0x8c7c4f–0x8c7cb7 uden bit 0: historikken rykkes én plads pr. landskamp siden sidst, +5 = kamptallet */
function shiftHistory(e: [number, number], nt: number): void {
  let d = ((nt - e[1]) << 16) >> 16;                                          // sub ax, word [+5]; test ax, ax; jle
  for (; d > 0 && e[0]; d--) e[0] = (e[0] << 1) & 0xfffe;                   // shl word, 1; and byte, 0xfe (efter 16 skift er den 0)
  e[1] = nt & 0xffff;
}

/** NationalTeams 0x76b600 efter en landskamp: kamptallet +1 for begge lande (A-, 'B'- og U21-landskampe – OL (comp 405) springes over) og, efter
 *  en A-landskamp, 0x8ce920 for hver af de 20 i kamptruppen, der spillede (pladserne 12–20 kun indskiftede – `played`): historikken rykkes, bit 0
 *  sættes, +5 = landets kamptal. `side` = holdets land (fixturens hold +0x53 – ikke spillerens nation). */
export function cmWpIntlMatch(g: GameState, home: number, away: number, a: boolean, played: { id: number; side: number }[]): void {
  const w = g.cmWp;
  if (!w) return;
  // (0x76b82c: holdets lands kamptal tælles op lige før holdets løkke – hjemmeholdet først)
  for (const side of [0, 1]) {
    const n = side === 0 ? home : away;
    const nt = (w.nt[n] = ((w.nt[n] ?? 0) + 1) & 0xffff);
    if (!a) continue;
    for (const l of played) {
      const p = g.players[l.id];
      if (l.side !== side || !p || p.virtual) continue;                      // 0x76b886: id < [0xae2364] (kampens fyldspillere er ikke personer)
      const e = (w.b[l.id] ??= [0, 0]);
      shiftHistory(e, nt);
      e[0] |= 1;
    }
  }
}

/** 0x58cf70 for spil uden originalens FIFA-liste: resultatet føjes til begge landes liste (append_result 0x58dea0 – måned og år), når begge har
 *  en verdensdel (nation +0x71) – det, 0x58d710 tæller */
export function cmWpFifaRecord(g: GameState, home: number, away: number, date: string): void {
  const w = g.cmWp;
  if (!w || g.intl?.cmFifa) return;
  const cont = (n: number) => g.cmNationCont?.[n] ?? -1;
  if (cont(home) < 0 || cont(away) < 0) return;
  const mon = +date.slice(5, 7) - 1, yr = +date.slice(0, 4);
  const res = (w.res ??= {});
  (res[home] ??= []).push([mon, yr]);
  (res[away] ??= []).push([mon, yr]);
}

/** 0x58d460 (den 18.): resultater ældre end et år byttes med det sidste og fjernes (rækkefølgen efter qsort'en på point er uden betydning for
 *  0x58d710 – listen rummer kun det seneste års resultater, så tællingens stop ved det første før perioden nås aldrig) */
function fifaPrune(g: GameState, w: CmWp): void {
  if (w.last === g.date) return;
  w.last = g.date;
  const mon = +g.date.slice(5, 7) - 1, yr = +g.date.slice(0, 4);
  for (const r of Object.values(w.res ?? {})) {
    for (let i = r.length - 1; i >= 0; i--) {
      const e = r[i];
      if (e[1] + 1 < yr || (e[1] + 1 === yr && e[0] < mon)) { r[i] = r[r.length - 1]; r.length--; }
    }
  }
}

/** FIFA_RANKINGS::count_results_in_period 0x58d710(nation, fra (måned, år), til (måned, år)): fra listens ende, stop ved det første resultat før
 *  perioden, tæl dem til og med slutningen */
export function cmFifaCount(g: GameState, n: number, m0: number, y0: number, m1: number, y1: number): number {
  const a = m0 + 12 * (y0 & 0xffff), b = m1 + 12 * (y1 & 0xffff);
  const f = g.intl?.cmFifa;
  const fr = f ? f.n[n]?.r ?? [] : null, own = fr ? null : g.cmWp?.res?.[n] ?? [];
  const len = fr ? fr.length : own!.length;
  let k = 0;
  for (let i = len - 1; i >= 0; i--) {
    const v = fr ? fr[i][1] + 12 * fr[i][2] : own![i][0] + 12 * own![i][1];
    if (v < a) break;
    if (v <= b) k++;
  }
  return k & 0xffff;
}

/** spillerens verdensomdømme i originalens enheder (staff +0x61 → +0xd – som hukommelsen cmSlMem.ts writeRec) */
const worldRep = (p: Player) => { const r = p.cmRepMem ?? p.cmRep; return r ? Math.round(r[2] * 50) : Math.round(p.rep * 2 * 50); };

/** kontrakttilbuddet (0x8c7950's tredje argument – 0x8c38b0/0x8c7690): klubben (+4), lønnen i £ (+0xc) og udløbet (+0x2d) */
export interface PermitOffer { club: number; wageGbp: number; expires?: string }

/**
 * 0x8c7950 TRANSFER_MANAGER::is_work_permit_granted(staff, land, tilbud, 0, tilfældig) – får spilleren arbejdstilladelsen? Kaldes, når 0x8c7560 har
 * afgjort, at han skal have en. `rand` = flaget a5 (spejderrapporterne 0x7b3e20/0x7b62a0: rand(1000), 2 × rand(3) og 2 × rand(10) i originalens
 * rækkefølge); uden det de faste grænser. Rykker historikken (+0x86e +3/+5) som originalen. Kun for spil med modulet (cmPermitOn).
 */
export function cmWorkPermit(g: GameState, p: Player, offer: PermitOffer | null, rand: ((n: number) => number) | null): boolean {
  // 0x8c7968: get_contract – en almindelig kontrakt (+0x35 & 0x3f = 2) i esi, ellers (leje m.m.) i ebx
  const ct = p.contract;
  const normal = !!ct && !p.loan && (ct.cmType ?? 2) === 2;
  const other = !!ct && !normal;
  // 0x8c7988–0x8c79e1: posten i historikken (+0x86e bit 0x20 → bsearch i +0x93a – cmPermit.ts' tabel); a4 er altid 0
  const e = g.cmPermit?.[p.id];
  if (e) {
    const w4 = e[0], w6 = e[1];
    const fewMissed = () => w4 > 3 * w6 || w6 < 4;                            // 0x8c79ef–0x8c7a0b / 0x8c7a4a–0x8c7a66
    if (!offer) { if (fewMissed()) return true; }
    else {
      // 0x456740(tilbud +0x2d, kontrakt +0x2d): den nuværende kontrakts udløb ligger før tilbuddets
      const later = () => !!ct?.expires && !!offer.expires && ct.expires < offer.expires;
      const go16 = normal ? later() : other && offer.club !== p.club;        // 0x8c7a1c–0x8c7a48 (ebx +4 = kontraktens klub)
      if (go16 && fewMissed()) return true;
      if (normal && !later()) return true;                                    // 0x8c7a68–0x8c7a82
    }
  }
  // 0x8c7a84: ren stab (ikke-spillerpost +0x69 uden spillerpost +0x61): +0xc > 160 – spillerne har altid en spillerpost
  const year = yearOf(g.date);
  // 0x8c7aa9: i 2001 med et tilbud fra Falkirk – fornavnet indeholder "Collin" eller "Devon" (strstr 0x945a60; klubnavnet strcmp'es)
  if (year === 0x7d1 && offer && g.clubs[offer.club]?.name === 'Falkirk' && /Collin|Devon/.test(p.first ?? '')) return true;
  // 0x8c7ba8: verdensomdømmet +0xd over rand(1000) + 8000 (a5), ellers over 8500
  const rep = worldRep(p);
  if (rand) { if (rep > rand(1000) + 0x1f40) return true; }
  else if (rep > 0x2134) return true;
  // 0x8c7bf0: tilbuddets løn +0xc over £34.999
  if (offer && offer.wageGbp > 0x88b7) return true;
  // 0x8c7c05: under 24 år og potentialet +7 over 190
  const age = ageOn(p.dob, g.date), caps = Math.min(255, p.caps ?? 0);
  if (age < 0x18 && p.pa > 0xbe) return true;
  // 0x8c7c1d: under 5 landskampe (+0x22) → nej; over 20, landets omdømme +0x8e over 3000 og under 32 år → ja
  if (caps < 5) return false;
  if (caps > 0x14 && (g.cmNationRep?.[p.nation] ?? 0) > 0xbb8 && age < 0x20) return true;
  // 0x8c7c4f: historikken rykkes til landets kamptal; de seneste (højst 16) tællende landskampe – 16 før 2003 (år − 2 < 2001)
  const w = g.cmWp ?? { b: {}, nt: {} };
  const h = (w.b[p.id] ??= [0, 0]);
  shiftHistory(h, w.nt[p.nation] ?? 0);
  const mon = +g.date.slice(5, 7) - 1;
  const cnt = year - 2 < 0x7d1 ? 16 : ((cmFifaCount(g, p.nation, mon, year - 2, mon, year) << 16) >> 16);
  const n = cnt > 16 ? 16 : cnt;
  let played = 0;
  for (let i = 0; i < n; i++) if (h[0] & (1 << i)) played++;
  if (rand) {
    const t = 11 - rand(3) + rand(3);                                         // 0x8c7d6d: 0xb − rand(3) + rand(3)
    if (played > t) return true;
    if (n === 0) return false;
    const t2 = 70 - rand(10) + rand(10);                                      // 0x8c7d97: 0x46 − rand(10) + rand(10)
    return Math.trunc((played * 100) / n) > t2;
  }
  if (played > 11) return true;
  return n !== 0 && Math.trunc((played * 100) / n) > 70;
}
