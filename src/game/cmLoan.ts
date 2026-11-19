// CM 01/02: lejeperioden og lejebuddets datoer (cm0102.exe 3.9.68, disassembleret 18/11-2026 med ~/cm0102-engine/tools/cmdis.py).
//
// TRANSFER_MANAGER::get_loan_period 0x8d0590(køber, kontraktklub, staff, &startmåned, &startår, &slutmåned, &slutår): køberlandets
// TRANSFER_RULES (+0x8ac, 28 objekter; den virtuelle +0x28) giver perioden, så rettes slutningen ind efter spillerens kontrakt:
//   * kontrakten (0x4cf5a0, type 2) er udløbet → slutåret = 1972 (standarddatoen 0x54a110 – originalens fejl, porteret som den er)
//   * slutåret > i år + 5 → 1972 (samme)
//   * ellers: så længe datoen (dagen i dag, slutmåned, slutår) er efter kontraktens udløb: én måned tilbage; starten følger med, hvis den
//     kommer efter slutningen; slutåret under i år → 1972.
// Landenes regler (+0x28): TRANSFER_RULES 0x8e8bd0 (grundreglen, også FINLAND 0x5a9a80): start = næste måned, slut = sæsonslutmåneden
// 0x4d45f0 (måneden for nationens sæsonslut + 10 dage) i startens år, hvis start < slut, ellers næste år. ENGLAND 0x579c70: efter 19/6
// (dag-i-året > 19/6-1998's) og alder (+0x18) < 24 → grundreglen, ellers start + 3 måneder. SCOTLAND 0x7f6530: alder < 22 → grundreglen,
// ellers start + 3 måneder. RUSSIA 0x7ec8e0: start om 3 måneder, ellers som grundreglen. NORTHERN IRELAND 0x793870: som Rusland, og
// starten højst slutningen. WALES 0x90f1a0: som grundreglen, og starten = slutningen.
// Lejebudskærmen 0x8f9690/0x8f9a20/0x8fac30: udløbsdatoen er (min(dagen i dag, 28), måned, år); standard = starten, − (1) går en måned
// tilbage (grå, når året er startåret og måneden ≤ startmåneden), + (2) en måned frem (grå, når året er slutåret og måneden ≥ slutmåneden).
// Wage Contribution (+0xb): 0 %, − (3) −10 (grå ved 0), + (4) +10 (grå ved 100); beløbet = løn · procent / 100 (rødt over bestyrelsens
// loft 0x5968d0). Lejeklubben betaler procenten af lønnen (STAFF_CONTRACT::init_from_current_contract 0x85e590), moderklubben resten
// (Finance::update_wage_bill 0x598370: hovedkontrakten minus lejekontrakten – cmFinance.ts).
// Spillerens eget svar på lejen 0x4cc930 (CONTRACT_MANAGER, kaldt af process_due_offer 0x8c6577, når sælgeren har sagt ja 0x84af00, og af
// 0x8c0660, når mennesket accepterer en computerklubs lejebud): klubbens kontrakttilbud (this+0x34) på spilleren fra lejeklubben, som ikke er
// afgjort (+0x62 = 0), får beslutningen planlagt (0x4cd230 – lejer har intet kontrakttilbud, så grenen rammes ikke her); svaret er
// trunc(spillerpostens nuværende omdømme +0xb / 500) > lejeklubbens omdømme (+0x80) → han siger nej. Nyhederne: først "<spiller> loan offer
// accepted" (0x8d76d0, køberen), så ved et nej 0x8d8310(bud, 0) – "<spiller> rejects move to <klub>" uden grunde (køberen og sælgeren),
// tilstand 0xf, runder 3; ellers lejen.
// Lejekontraktens afkrydsninger (+0x1c "Player can play in cup matches", +0x1d "… against <klub>"; menneskets lejebudskærm 0x8f9a20 handling
// 8/9 → 0x8fb5e0 → make_loan_offer 0x8bed60 → 0x85e590; computerens lejebud 0x842740 og 0x8bf400 sætter begge til 1) bruges af
// TRANSFER_RULES +0x18 0x8e8a60 (via 0x8cf5e0 i holdudtagelsen, nationernes udgaver kalder grundreglen): er spillerens klub (staff +0x39) med i
// kampen og ikke ude mod et landshold (0x53b900), så +0x1c = 0 → 0xa, når turneringen hverken er klubbens division (+0x57), sidste sæsons
// division (+0x5b), en venskabsturnering (0x5c6710) eller en reserveturnering (0x7e6f20); +0x1d = 0 → 0xb, når moderklubben (hovedkontrakten
// 0x4cf5a0) er hjemme- eller udeholdet. Hvilket regelsæt (0x8cf5e0 → 0x8d2fa0 → 0x669470 og rækkerne i 0xb63d60): de 27 nøglelandes
// hjemlige turneringer har landets, øvrige europæiske landes Europas (0x5832e0, som for hjemlige turneringer kalder grundreglen), andre landes
// ingen (spilleberettiget). Ikke porteret: de europæiske turneringer (Europas 0x5832e0 springer grundreglen over for de fleste runder og bruger
// tilmeldingen staff +0x6d – vores European Squad, euroSquad.ts) og de øvrige koder (3 kontrakttype 5, 9 0x418f60, pokalbundne 1).
import type { Fixture, GameState, Player } from './types';
import { NATION_MONTH } from './cmContractEnd';
import { clubRepMem, curRep } from './cmPlayerData';
import { regionOf } from './leagues';

export interface LoanPeriod { sm: number; sy: number; em: number; ey: number }

const pad = (n: number) => String(n).padStart(2, '0');
const doy = (iso: string) => Math.round((Date.parse(iso + 'T00:00:00Z') - Date.UTC(Number(iso.slice(0, 4)), 0, 1)) / 86400000);
/** staff +0x18 (alderen i hele år) */
const ageOf = (p: Player, today: string) => { const y = Number(today.slice(0, 4)) - Number(p.dob.slice(0, 4)); return today.slice(5) < p.dob.slice(5) ? y - 1 : y; };

/** datoen (min(dagen i dag, 28), måned 0..11, år) som yyyy-mm-dd – 0x8fa2a5/0x8fbb98/0x84295b */
export function loanDate(today: string, m: number, y: number): string {
  return `${y}-${pad(m + 1)}-${pad(Math.min(Number(today.slice(8, 10)), 28))}`;
}

/** 0x4d45f0: måneden (0..11) for nationens sæsonslut + 10 dage (*estimeret* juni for nationer uden post – cmContractEnd.ts) */
const seasonEndMonth = (nation: string) => (NATION_MONTH[nation] ?? 6) - 1;

/** landets get_loan_period (TRANSFER_RULES +0x28) */
function rulesPeriod(g: GameState, buyer: number, p: Player): LoanPeriod {
  const today = g.date, ty = Number(today.slice(0, 4)), tm = Number(today.slice(5, 7)) - 1;
  const nation = g.nations[g.clubs[buyer]?.nation ?? -1]?.name ?? '';
  const age = ageOf(p, today);
  const next = (k: number) => { let sm = tm + k, sy = ty; if (sm > 11) { sm -= 12; sy++; } return { sm, sy }; };
  const base = (k: number): LoanPeriod => { const { sm, sy } = next(k); const em = seasonEndMonth(nation); return { sm, sy, em, ey: sm < em ? sy : ty + 1 }; };
  const plus3 = (): LoanPeriod => { const { sm, sy } = next(1); let em = sm + 3, ey = sy; if (em > 11) { em -= 12; ey++; } return { sm, sy, em, ey }; };
  switch (nation) {
    case 'England': return doy(today) > doy('1998-06-19') && age < 24 ? base(1) : plus3();
    case 'Scotland': return age < 22 ? base(1) : plus3();
    case 'Russia': return base(3);
    case 'Northern Ireland': { const r = base(3); if (r.sy > r.ey || (r.sy === r.ey && r.sm > r.em)) { r.sm = r.em; r.sy = r.ey; } return r; }
    case 'Wales': { const r = base(1); r.sm = r.em; r.sy = r.ey; return r; }
    default: return base(1);
  }
}

/** TRANSFER_MANAGER::get_loan_period 0x8d0590 for en spiller, `buyer` vil leje */
export function cmLoanPeriod(g: GameState, buyer: number, p: Player): LoanPeriod {
  const r = rulesPeriod(g, buyer, p);
  const today = g.date, ty = Number(today.slice(0, 4));
  const end = p.contract?.expires;
  if (!end) return r;                                         // ingen hovedkontrakt (type 2): perioden, som landet gav den
  if (today > end) { r.ey = 1972; return r; }
  if (r.ey > ty + 5) { r.ey = 1972; return r; }
  for (;;) {
    // 0x8d06c6: Date(dagen i dag – ikke højst 28, slutmåned, slutår) mod kontraktens udløb
    if (`${r.ey}-${pad(r.em + 1)}-${today.slice(8, 10)}` <= end) return r;
    if (--r.em < 0) { r.ey--; r.em = 11; }
    if (r.sy > r.ey || (r.sy === r.ey && r.sm > r.em)) { r.sm = r.em; r.sy = r.ey; }
    if (r.ey < ty) { r.ey = 1972; return r; }
  }
}

/** 0x4cc930's svar: sand = spilleren siger nej til lejen (trunc(omdømme +0xb / 500) > lejeklubbens +0x80) */
export function cmLoanRefuses(g: GameState, p: Player, buyer: number): boolean {
  return Math.trunc(curRep(p) / 500) > clubRepMem(g, buyer);
}

/** nøglelandene (rækkerne 8–34 i 0xb63d60 – de 27 med eget TRANSFER_RULES-objekt) */
const KEY_NATIONS = new Set(['Argentina', 'Australia', 'Belgium', 'Brazil', 'Croatia', 'Denmark', 'England', 'Finland', 'France', 'Germany', 'Greece',
  'Holland', 'Republic of Ireland', 'Italy', 'Japan', 'Northern Ireland', 'Norway', 'Poland', 'Portugal', 'Russia', 'Scotland', 'South Korea', 'Spain',
  'Sweden', 'Turkey', 'United States', 'Wales']);

/** 0x8cf5e0 → 0x8e8a60's lejeregler for kampen: 0xa (må ikke spille pokalkampe), 0xb (må ikke spille mod moderklubben) eller 0 */
export function cmLoanBar(g: GameState, p: Player, f: Fixture): 0 | 0xa | 0xb {
  const l = p.loan;
  if (!l || (!l.noCup && !l.noAgainst)) return 0;
  const comp = g.comps[f.comp];
  if (!comp || comp.type === 'continental' || comp.nation < 0) return 0;
  const nat = g.nations[comp.nation]?.name ?? '';
  if (!KEY_NATIONS.has(nat) && regionOf(nat) !== 'europe') return 0;          // 0x8d2fa0: intet regelsæt
  if (p.club !== f.home && p.club !== f.away) return 0;
  const club = g.clubs[p.club];
  if (l.noCup && club) {
    const last = g.cmClubStat?.[p.club]?.[2];
    const lastDiv = last !== undefined && last >= 0 ? `CM${last}` : undefined;
    if (f.comp !== club.league && f.comp !== lastDiv) return 0xa;
  }
  if (l.noAgainst && (f.home === l.from || f.away === l.from)) return 0xb;
  return 0;
}
