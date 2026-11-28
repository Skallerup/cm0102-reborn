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
// Kode 3 (prøvespillere – cmTrial.ts): trialBar nedenfor. Ikke porteret: 2/4/5/6/7 (andre landes regler, ikke Englands) og Europas tilmelding for computerens
// klubber SQUAD_MANAGER::select_euro_registered_players 0x85aae0 (computerens klubber regnes som tilmeldte; menneskets er European Squad,
// euroSquad.ts).
//
// Holdarkets grænse for udlændinge/ikke-EU-spillere/ældre spillere (afkodet 27/11-2026):
//   0x8cf7e0/0x8cf6b0  reglen for kampen: 0x8d2fa0 finder regelobjektet (TRANSFER_MANAGER +0x8ac, 28 stk. bygget af 0x8d26b0 med landenes
//                      globaler) – Reserve: hjemmeklubbens land; venskabskampe (0x5c6710): ingen; ellers turneringens land (0x669470), de
//                      kontinentale: Europas (ingen grænse). Objektets +0x1c fylder 42 bytes; samlet (flag 1): +5/+3 → type 1 (ikke-EU),
//                      +2/+0 → type 2 (udlændinge), +0x16/+0x17 → type 3 (over N år); grænsen i +5 (alderen i +1). squadRuleOf nedenfor.
//   0x8cf880           holdarket (de 11 + turneringens +0x4d & 0xf udskiftere): tæller de 11 (+2), bænken (+3) og alle (+4) – type 1
//                      0x53d980(staff, klubbens land, 1) og ikke 0x53d740(staff, klubbens land), type 2 kun 0x53d980, type 3 alder > N –
//                      og svarer 1 med beskeden (0xa8f07c–0xa8f208 / 0xa8ee68–0xa8effc / 0xa8ed48–0xa8ee08), når alle > grænsen.
//   pick_team 0x6dd44e computerens udtagelse retter holdet med 0x6e8910 (aiTeam.ts quotaFix) højst to gange; Team Selection 0x7272b7 (menneskets
//                      kamp, efter de øvrige grunde) viser beskeden og starter ikke kampen (teamSelection.ts). Reservekampene (fixture −2) springes over.
import type { Competition, Fixture, GameState, MatchReport, Player } from './types';
import { cmKeyRules, cmLoanBar, cmLoanBase } from './cmLoan';
import { cmLogic, cmGeneratedNow } from './cmPlayerData';
import { cmEuCitizenIn, cmForeignIn } from './cmPermit';
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
  if (cmGeneratedNow(p) || ageOn(p.dob, g.date) < 20 || !EURO_LISTED.has(comp.id)) return trialBar(p, f, 'Europe') || cmLoanBase(g, p, f);
  const r = f.cm ? baseRound(f.cm.w30) : -1;
  if (comp.id === 'UIC') { if (r !== 150) return trialBar(p, f, 'Europe') || cmLoanBase(g, p, f); }
  else if (r === 230 || r === 160) return 0;
  return registered(p) ? 0 : 8;
}

/** regelobjekterne med +0x15 = 1 (Finland 0x5a9a5a, Skotland 0x7f649a, Spanien 0x893db1 – alle andre 0 fra TRANSFER_RULES 0x8e84d5):
 *  grundreglens prøvespillerregel springes over */
const TRIAL_FREE = new Set(['Finland', 'Scotland', 'Spain']);
/** 0x8e8a60's første regel: +0x15 = 0, turneringen er hverken en reserveturnering (0x7e6f20) eller en venskabsturnering (0x5c6710) og
 *  hovedkontrakten (0x4cf5a0) er af type 5 (prøvetid, cmTrial.ts) → 3 ("Trialist … is not allowed to play in this fixture.") */
function trialBar(p: Player, f: Fixture, rulesNat: string): 0 | 3 {
  if (p.contract?.cmType !== 5 || p.loan || TRIAL_FREE.has(rulesNat)) return 0;
  if (f.comp === 'RSV' || f.comp === 'FRIENDLY') return 0;
  return 3;
}
/** grundreglen 0x8e8a60 (prøvetiden, så lejeklausulerne) */
const baseRule = (g: GameState, p: Player, f: Fixture, rulesNat: string) => trialBar(p, f, rulesNat) || cmLoanBar(g, p, f);

/** 0x8cf5e0: hvorfor spilleren ikke må spille kampen (0 = må) – kun spil med originalens logik (cmLogic) */
export function cmIneligible(g: GameState, p: Player, f: Fixture): number {
  if (!cmLogic(g)) return 0;
  if (f.home > -1000 && p.injury?.key === 'awol') return 9;                    // 0x418f60(staff, 0)
  const comp = g.comps[f.comp];
  // uden turnering (venskabskampe – 0x8d2fa0: intet regelsæt) og reservekampene (0x7e6f20 – prøvespillerne må spille)
  if (!comp) return cmLoanBar(g, p, f);
  if (comp.type === 'continental') return comp.id === 'ESC' || EURO_LISTED.has(comp.id) ? europeRule(g, p, f, comp) : 0;
  const nat = comp.nation >= 0 ? g.nations[comp.nation]?.name ?? '' : '';
  // de øvrige europæiske lande har Europas regelsæt – deres hjemlige turneringer er ikke i listen (grundreglen); lande uden regelsæt: 0
  if (!cmKeyRules(nat)) return regionOf(nat) === 'europe' ? baseRule(g, p, f, 'Europe') : 0;
  if (cupTiedComp(g, comp) && cupTied(g, p, comp)) return 1;
  return baseRule(g, p, f, nat);
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

// ---------------------------------------------------------------- holdarkets grænse 0x8cf7e0/0x8cf880

/** 0x8cf7e0's sammendrag: type 1 ikke-EU, 2 udlændinge, 3 over `age` år; højst `limit` på holdarket */
export interface SquadRule { type: 1 | 2 | 3; limit: number; age: number }
/** turneringsglobalernes navne (0x601a40/0x60efd0 – strcmp uden store/små bogstaver, 0x951c50) */
const nameIs = (c: Competition, ...names: string[]) => names.some((n) => n.toLowerCase() === c.name.toLowerCase());
/** landets pokalturnering (German Cup [0x9cf714], Spanish Cup [0x9cf740], turkish fa cup [0x9cf8f8]) – hos os CUP-<land> */
const nationalCup = (c: Competition) => c.id === `CUP-${c.nation}`;
const nonEu = (limit: number): SquadRule => ({ type: 1, limit, age: -1 });
const fgn = (limit: number): SquadRule => ({ type: 2, limit, age: -1 });
/** regelobjekternes +0x1c (vtbl-slot 7) pr. land (0x8d26b0) – kun dem, der giver en grænse, holdarket læser (Belgien 0x424f80 og Italien 0x6619e0
 *  sætter kun +6/+8; Finland, Holland, Irland, Nordirland, Wales og Europa 0x63c330/0x5832c0 intet; Skotland 0x7f64c0 og Tyrkiets aldersgrænse
 *  kun i reservekampe). `season` = fixture +0x2c (sæsonens år). */
function squadRuleOf(nat: string, c: Competition, season: number): SquadRule | null {
  switch (nat) {
    case 'England': case 'Denmark': case 'Sweden': return nonEu(3);                               // 0x579c50 (+5 = 3)
    case 'Norway': return nonEu(2);                                                               // 0x794740
    case 'France': return nonEu(nameIs(c, 'French First Division') ? 5 : 3);                      // 0x5c1a30 [0x9cf5cc]
    case 'Germany': return nonEu(nationalCup(c) ? 3 : 5);                                         // 0x5e02d0 [0x9cf714]
    case 'Greece': return nonEu(nameIs(c, 'greek premier division', 'Greek National A Division') ? 5 : 4);   // 0x5ed020 [0x9cf86c]
    case 'Portugal': return nonEu(nameIs(c, 'Portuguese Second Division B', 'Portuguese Second Division B North') ? 3 : 4);   // 0x7d43c0 (+3) [0x9cf7c0]
    case 'Spain':                                                                                 // 0x859570 [0x9cf624]/[0x9cf740], fixture +0x2c
      if (nameIs(c, 'Spanish First Division') || nationalCup(c)) return nonEu(season === 2000 ? 4 : 3);
      return nonEu(season === 2000 ? 4 : season === 2001 || season === 2002 ? 3 : 2);
    case 'Argentina': return fgn(4);                                                              // 0x40aa10 (+2 = 4)
    case 'Australia': return fgn(6);                                                              // 0x412db0
    case 'Brazil': return fgn(2);                                                                 // 0x43f2a0 (ikke Reserve)
    case 'Croatia': return fgn(4);                                                                // 0x518620 (+0 = 4)
    case 'Japan': return fgn(3);                                                                  // 0x667090
    case 'South Korea': return fgn(3);                                                            // 0x66e750 (+0 = 3)
    case 'Poland': return fgn(5);                                                                 // 0x7cd960
    case 'Russia': return nameIs(c, 'russian first division') ? fgn(3) : null;                   // 0x7ec950 [0x9cf92c]
    case 'Turkey': return nameIs(c, 'turkish premier division') || nationalCup(c) ? fgn(6) : null;   // 0x9021d0 [0x9cf8d8]/[0x9cf8f8] ([0x9cf8d0] sættes aldrig)
    case 'United States': return nameIs(c, 'American MLS All-Stars') ? null : fgn(4);            // 0x90ba60 [0x9cf690]
    default: return null;
  }
}

/** 0x8cf7e0: holdarkets regel for kampen (null = ingen) – kun spil med originalens logik. Turneringens land (0x8d2fa0 → 0x669470); venskabs-,
 *  reserve- og landskampe og de kontinentale turneringer har ingen. */
export function cmSquadRule(g: GameState, f: Fixture | undefined): SquadRule | null {
  if (!f || !cmLogic(g)) return null;
  const c = g.comps[f.comp];
  if (!c || c.type === 'continental' || c.nation < 0) return null;
  const nat = g.nations[c.nation]?.name;
  if (!nat) return null;
  const y = +f.date.slice(0, 4), season = +f.date.slice(5, 7) >= 7 ? y : y - 1;
  return squadRuleOf(nat, c, season);
}

/** 0x8cf880's tælling: spilleren tæller med i reglen for klubben (klubbens land club +0x53) */
export function cmSquadCounts(g: GameState, rule: SquadRule, p: Player, club: number): boolean {
  if (rule.type === 3) return ageOn(p.dob, g.date) > rule.age;
  const nation = g.clubs[club]?.nation;
  if (!cmForeignIn(g, p, nation)) return false;
  return rule.type === 2 || !cmEuCitizenIn(g, p, nation);
}

export interface SquadCount { rule: SquadRule; xi: number; bench: number; total: number }
/** 0x8cf880 over holdarket (de 11 og de navngivne udskiftere i pladsrækkefølge): tallene, når der er for mange (ellers null) */
export function cmSquadOver(g: GameState, club: number, f: Fixture | undefined, lineup: readonly (number | null)[], bench: readonly (number | null)[]): SquadCount | null {
  const rule = cmSquadRule(g, f);
  if (!rule) return null;
  let xi = 0, b = 0;
  for (const id of lineup) { const p = id === null ? undefined : g.players[id]; if (p && cmSquadCounts(g, rule, p, club)) xi++; }
  for (const id of bench) { const p = id === null ? undefined : g.players[id]; if (p && cmSquadCounts(g, rule, p, club)) b++; }
  return xi + b > rule.limit ? { rule, xi, bench: b, total: xi + b } : null;
}

/** 0x8cf9f7–0x8cfc69: beskedens nøgle(r) – type 3 er to dele ("…over N years old. " + "Only … allowed. "); null = ingen tekst (sic: 0x8cfac5) */
export function cmSquadMessage(o: SquadCount): { keys: string[]; n: number; limit: number; age: number } | null {
  const { rule: { type, limit, age }, total: n } = o;
  const base = { n, limit, age };
  if (type === 3) return { keys: [n > 1 ? 'cl.mt.sel.q.ageN' : 'cl.mt.sel.q.age1', limit > 1 ? 'cl.mt.sel.q.ageLimN' : limit === 1 ? 'cl.mt.sel.q.ageLim1' : 'cl.mt.sel.q.ageLim0'], ...base };
  const k = type === 1 ? 'nonEu' : 'fgn';
  if (n > 1) return { keys: [`cl.mt.sel.q.${k}${limit > 1 ? 'N' : limit === 1 ? 'One' : 'No'}`], ...base };
  if (limit === 1) return { keys: [`cl.mt.sel.q.${k}1`], ...base };
  if (limit === 0) return { keys: [`cl.mt.sel.q.${k}1No`], ...base };
  return null;
}
