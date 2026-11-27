// CM 01/02: spilleberettigelsen til en kamp (cm0102.exe 3.9.68, disassembleret 27/11-2026 med ~/cm0102-engine/tools/cmdis.py).
//
// TRANSFER_MANAGER::get_ineligibility_code 0x8cf5e0(staff, kamp) – 0 = må spille:
//   9  hjemmeholdet er ikke et landshold (0x53b900) og spilleren er udeblevet (0x418f60(staff, 0): AWOL-bitten – hos os skaden 'awol')
//   ellers regelsættet for kampens turnering (0x8d2fa0 → TRANSFER_MANAGER +0x8ac…, intet = 0) og dets +0x18:
//   ENGLAND_RULES 0x57a090   turneringen er English FA Cup [0x9cf74c] eller English League Cup [0x9cf750], spillerdata (+0x61) og klub (+0x39),
//                            og turneringens Comp_Stats-post for spilleren (0x4a4a30 i [0xadadfc][turnering]+8) har en anden klub (+8) end hans
//                            nuværende → 1 (cup-tied); ellers grundreglen. SCOTLAND 0x7f65d0 (Scottish Cup [0x9cf75c], Scottish League Cup
//                            [0x9cf760]), IRELAND 0x63c350 ([0x9cf83c] League Cup, [0x9cf840] Senior Challenge Cup, [0x9cf844] Super Cup) og
//                            NORTHERN IRELAND 0x7937f0 ([0x9cf8c0] Irish Cup, [0x9cf8c8] League Cup, [0x9cf8c4] Gold Cup) – samme regel.
//   EUROPE_RULES 0x5832e0    (Europas turneringer og de øvrige europæiske landes): en af databasens personer (id < [0xae2364]) på mindst 20 år
//                            (staff +0x18 ≥ 0x14) i UEFA Champions League [0x9cf6e8], Cup Winners' Cup [0x9cf6ec], UEFA Cup [0x9cf6f0] eller
//                            Inter-Toto Cup [0x9cf6f8] i turneringens år (+0x40): Inter-Toto kun i finalen (runde-id 0x4b0870(fixture +0x30) = 150,
//                            ellers grundreglen); de andre: runde-id 230 eller 160 → 0 (uden grundreglen), ellers tilmeldingen staff +0x6d = 2 → 0,
//                            andet → 8 ("has not been registered to play in European competitions") – også her uden grundreglen. Super Cup'en
//                            [0x9cf6f4] og alle andre: grundreglen.
//   grundreglen 0x8e8a60     kontrakttype 5 (prøvespiller) uden for reserve-/venskabsturneringer → 3; lejeklausulerne 0xa/0xb (cmLoan.ts).
// Team Selection 0x7260f0–0x727450 (match_screens.cpp) melder koderne med exe-strengene 0xa17358–0xa17908 (Shell.tsx, cl.mt.sel.*) og stopper
// kampen; computerens og assistentens udtagelse pick_team 0x6dbc50 (0x6dcbe6) tager kun spillere med kode 0 som kandidater (sim.ts matchOnly).
//
// Comp_Stats::record_match_result 0x49f570 (0x4a0b1b–0x4a0bdb): efter hver kamp i turneringen får hver af de 20 i kamptruppen, der spillede (de 11
// og de indskiftede, +0x32 ≠ 0xff), og som er en af databasens personer, sin post (0x4ad030, hvis han ikke har en) og posten +8 = holdets klub.
// Posterne nulstilles med turneringens sæson (0x4a1c50) – hos os g.cmCupTied pr. turnering og sæson, kun for pokalerne med reglen ovenfor.
//
// Ikke porteret: kode 3 (prøvespillere – findes ikke i spillet), 2/4/5/6/7 (andre landes regler, ikke Englands), Europas tilmelding for computerens
// klubber SQUAD_MANAGER::select_euro_registered_players 0x85aae0 (computerens klubber regnes som tilmeldte; menneskets er European Squad,
// euroSquad.ts) og holdarkets udlændinge-/ikke-EU-grænser 0x8cf880/0x6e8910 (TRANSFER_RULES +0x1c – England 0x579c50: højst 3 ikke-EU-spillere).
import type { Competition, Fixture, GameState, MatchReport, Player } from './types';
import { cmKeyRules, cmLoanBar, cmLoanBase } from './cmLoan';
import { cmLogic, cmGeneratedNow } from './cmPlayerData';
import { euroRegistered } from './euroSquad';
import { regionOf } from './leagues';
import { ageOn } from './dates';

/** nationerne med pokalbundne spillere (ENGLAND/SCOTLAND/IRELAND/NORTHERN IRELAND +0x18) */
const CUP_TIED_NATIONS = new Set(['England', 'Scotland', 'Republic of Ireland', 'Northern Ireland']);
/** de nationale pokaler i reglen: FA Cup'en (CUP-n), ligacuppen (LC-n) – og for Irland Super Cup'en (SC-n) */
function cupTiedComp(g: GameState, comp: Competition): boolean {
  if (comp.type !== 'cup' || comp.nation < 0) return false;
  const nat = g.nations[comp.nation]?.name ?? '';
  if (!CUP_TIED_NATIONS.has(nat)) return false;
  const n = comp.nation;
  return comp.id === `CUP-${n}` || comp.id === `LC-${n}` || (nat === 'Republic of Ireland' && comp.id === `SC-${n}`);
}

/** 0x4b0870: rundens grund-id (under 1000: tiere – 1. ben +3/2. ben +4 fjernes) */
const baseRound = (w30: number) => (w30 < 1000 ? w30 - (w30 % 10) : w30);

/** de europæiske turneringer i EUROPE_RULES' liste (Cup Winners' Cup findes ikke i 2001/02) */
const EURO_LISTED = new Set(['CL', 'UEFA', 'UIC']);

/** staff +0x6d = 2: tilmeldt (computerens klubber og en klub uden tilmelding: alle – 0x85aae0 ikke porteret) */
function registered(p: Player): boolean {
  const reg = euroRegistered(p.club);
  return !reg || reg.has(p.id);
}

/** EUROPE_RULES +0x18 0x5832e0 */
function europeRule(g: GameState, p: Player, f: Fixture, comp: Competition): number {
  if (cmGeneratedNow(p) || ageOn(p.dob, g.date) < 20 || !EURO_LISTED.has(comp.id)) return cmLoanBase(g, p, f);
  const r = f.cm ? baseRound(f.cm.w30) : -1;
  if (comp.id === 'UIC') { if (r !== 150) return cmLoanBase(g, p, f); }
  else if (r === 230 || r === 160) return 0;
  return registered(p) ? 0 : 8;
}

/** 0x8cf5e0: hvorfor spilleren ikke må spille kampen (0 = må) – kun spil med originalens logik (cmLogic) */
export function cmIneligible(g: GameState, p: Player, f: Fixture): number {
  if (!cmLogic(g)) return 0;
  if (f.home > -1000 && p.injury?.key === 'awol') return 9;                    // 0x418f60(staff, 0)
  const comp = g.comps[f.comp];
  if (!comp) return cmLoanBar(g, p, f);
  if (comp.type === 'continental') return comp.id === 'ESC' || EURO_LISTED.has(comp.id) ? europeRule(g, p, f, comp) : 0;
  const nat = comp.nation >= 0 ? g.nations[comp.nation]?.name ?? '' : '';
  // de øvrige europæiske lande har Europas regelsæt – deres hjemlige turneringer er ikke i listen (grundreglen); lande uden regelsæt: 0
  if (!cmKeyRules(nat)) return regionOf(nat) === 'europe' ? cmLoanBar(g, p, f) : 0;
  if (cupTiedComp(g, comp) && cupTied(g, p, comp)) return 1;
  return cmLoanBar(g, p, f);
}

/** turneringens Comp_Stats-post +8 for spilleren (klubben, han sidst spillede for i turneringen i år) */
function cupTied(g: GameState, p: Player, comp: Competition): boolean {
  const e = g.cmCupTied?.[comp.id];
  if (!e || e.s !== g.season || !p.club) return false;
  const club = e.m[p.id];
  return club !== undefined && club !== p.club;
}

/** Comp_Stats::record_match_result 0x4a0b1b–0x4a0bdb for pokalerne med reglen: de spillende i kamptruppen (databasens personer) får posten +8 =
 *  holdets klub. Kaldt efter hver kamp (applyMatchResult). */
export function cmCupTiedAfterMatch(g: GameState, f: Fixture, rep: MatchReport): void {
  if (!cmLogic(g)) return;
  const comp = g.comps[f.comp];
  if (!comp || !cupTiedComp(g, comp)) return;
  const all = (g.cmCupTied ??= {});
  let e = all[comp.id];
  if (!e || e.s !== g.season) e = all[comp.id] = { s: g.season, m: {} };
  for (const line of rep.players) {
    const p = g.players[line.id];
    if (!p || cmGeneratedNow(p)) continue;                                     // 0x4a0b99: id < [0xae2364]
    e.m[p.id] = line.team === 0 ? f.home : f.away;                             // 0x4a0bdb: posten +8 = holdets klub
  }
}
