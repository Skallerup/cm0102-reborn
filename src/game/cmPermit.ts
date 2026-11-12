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
// Kun den originale database i ægte tilstand (cmActive). Ingen tilfældige tal.

import type { Fixture, GameState, MatchReport, Player } from './types';
import { cmActive } from './cmPlayerData';
import { squad } from './state';

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
  return CM_EU.has(n) || n === 'Switzerland' || CM_EU.has(nameOf(g, p.cmNation2));
}

/** 0x8c7560(staff, klub, flag): skal spilleren have arbejdstilladelse i klubben? */
export function cmNeedsPermit(g: GameState, p: Player, club: number, flag: boolean): boolean {
  const c = g.clubs[club];
  if (!c || !CM_BRITISH.has(nameOf(g, c.nation))) return false;
  if (cmEuCitizen(g, p)) return false;
  if (flag) return true;
  // 0x8c761d: en spiller med lejekontrakt (+0x35 & 0x3f = 2), der allerede har en post, tæller ikke
  return !(p.loan && g.cmPermit?.[p.id]);
}

const yearOf = (iso: string) => +iso.slice(0, 4);

/** 0x8c6e60 – spilstarten (TRANSFER_MANAGER::TRANSFER_MANAGER 0x8bba30) */
export function cmPermitNewGame(g: GameState): void {
  if (!cmActive(g)) return;
  const tab: Record<number, PermitEntry> = (g.cmPermit = {});
  const year = yearOf(g.date);
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
  if (!cmActive(g) || !g.cmPermit || p.regen) return;
  const tab = g.cmPermit, e = tab[p.id];
  if (club && cmNeedsPermit(g, p, club, true)) {
    const nation = g.clubs[club].nation, year = yearOf(g.date);
    if (e) {
      // 0x8c7f3a: et nyt land (og ikke britisk → britisk) giver et nyt år
      if (e[3] !== nation && !(CM_BRITISH.has(nameOf(g, e[3])) && CM_BRITISH.has(nameOf(g, nation)))) e[2] = year;
      e[0] = 0; e[1] = 0; e[3] = nation;
    } else tab[p.id] = [0, 0, year, nation];
  } else if (e) delete tab[p.id];
}

/** 0x8c39f0(fixture, resultat) – efter en klubkamp (sim.ts applyMatchResult; alle vores turneringskampe tæller – venskabskampene spilles i
 *  friendlies.ts og kalder ikke her). Reservekampe (fixture −2) har ingen kamptrup hos os (reserves.ts) og tæller ikke (*estimeret*). */
export function cmPermitAfterMatch(g: GameState, f: Fixture, rep: MatchReport, unavailable: (p: Player) => boolean): void {
  if (!cmActive(g) || !g.cmPermit) return;
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
  if (!cmActive(g) || !g.cmPermit) return;
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
