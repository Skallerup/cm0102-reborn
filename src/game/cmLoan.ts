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
import type { GameState, Player } from './types';
import { NATION_MONTH } from './cmContractEnd';

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
