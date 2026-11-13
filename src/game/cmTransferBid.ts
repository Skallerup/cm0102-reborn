// Originalens transferbud (cm0102.exe 3.9.68): budskærmen 0x8e9760/0x8ec420, TRANSFER_OFFER 0x8e78f0/0x8e7a70/0x8e7b50, computerens svar
// 0x8c8090 (+ klausul-muligheden 0x8c8fd0), computerkøberens vurdering af menneskets modbud 0x8c0810, betalingerne 0x8ca8a0/0x8caee0/0x8cb0f0/
// 0x8c39f0 og afvisningsbegrundelserne 0x8f06f0/0x8c5800/0x8c5560/0x8ce0e0. Noter: ~/cm0102-engine/notes/transfer-bid.md.
// Kun den originale database i ægte tilstand (cmActive) – det udvidede spil og 2026/27 bruger transfers.ts' egne regler.
// Originalen regner i pund (int32); spillet gemmer euro – omregningen sker med spillets faste kurs (£ = € · 0,86, i18n RATE.GBP).
// *estimeret* (ikke i koden/ikke porteret): asking price 0x4d1600 (transfers.ts askingPrice), Shortlist_Manager 0x840d80/0x843800 (købers
// værdisætning = buddets maxFee, sælgerens ønske om bytte-spillere = swapCandidates), bytte-muligheden 0x8c8860, uroen efter et offentligt bud 0x8c1290.

import type { Club, GameState, Player, TransferOffer } from './types';
import { ageOn } from './dates';
import { financeStatus } from './cmSquadPlan';
import { cmContractOf, cmRand, clubRepMem, nationRepMem, statusCode } from './cmPlayerData';
import { aiPickCtx, roleDataOf } from './engine/grid/aiTeam';

/** € → £ og tilbage (spillets faste kurs) */
export const GBP = 0.86;
const toGbp = (eur: number) => Math.round(eur * GBP);
const fromGbp = (gbp: number) => Math.round(gbp / GBP);
const trunc = Math.trunc;
const s16 = (v: number) => (v << 16) >> 16;

// ---------------------------------------------------------------- buddet (TRANSFER_OFFER's felter)

/** Buddets vilkår som i TRANSFER_OFFER: beløb i € (spillets enhed). ≤ 0 = slået fra; en negativ værdi husker det slåede-fra tal (originalen: v = −v). */
export interface BidTerms {
  fee: number;
  /** +0x40 månedlige rater (6/12/18/24) */
  months: number;
  /** +0x3f videresalg i procent (5..25) */
  sellOn: number;
  /** +0x35/+0x39 beløb efter N ligakampe */
  lgFee: number; lgApps: number;
  /** +0x3a/+0x3e beløb efter N landskampe */
  intFee: number; intApps: number;
  /** +0x2d offentligt: 0 nej, 2 ja, 1 ja (låst) */
  pub: 0 | 1 | 2;
  /** +4 bytte-spillere (køberens) */
  swap: number[];
}

/** TRANSFER_OFFER::init_transfer_offer 0x8e78f0: N = 10 for begge klausuler, resten 0; låst offentligt (1), hvis klubberne spiller i samme liga
 *  (klub +0x57), rand(20) == 0 og spillerens omdømme (spillerdata +0xb) > 7000 */
export function newTerms(g: GameState, p: Player, buyer: number, fee: number): BidTerms {
  const seller = g.clubs[p.club], b = g.clubs[buyer];
  const rand = cmRand(g.seed ?? 0, p.id, buyer, dayN(g.date), 0x8e78f0);
  const pub = seller && b && seller.league === b.league && rand(20) === 0 && repMem(p) > 7000 ? 1 : 0;
  return { fee: Math.max(0, fee), months: 0, sellOn: 0, lgFee: 0, lgApps: 10, intFee: 0, intApps: 10, pub, swap: [] };
}
const dayN = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
/** spillerens nuværende omdømme i hukommelsen (spillerdata +0xb, 0..10000) */
const repMem = (p: Player) => (p.cmRepMem ?? p.cmRep ?? [0, p.rep * 2, 0])[1] * 50;

/** vilkårene i et gemt bud (ældre bud uden felterne: kun beløbet) */
export function termsOf(o: TransferOffer): BidTerms {
  return { fee: o.fee, months: o.months ?? 0, sellOn: o.sellOn ?? 0, lgFee: o.lgFee ?? 0, lgApps: o.lgApps ?? 10, intFee: o.intFee ?? 0,
    intApps: o.intApps ?? 10, pub: o.pub ?? 0, swap: [...(o.swap ?? [])] };
}
/** skriv vilkårene i buddet (kun de slåede-til klausuler gemmes) */
export function putTerms(o: TransferOffer, t: BidTerms): void {
  o.fee = Math.max(0, Math.round(t.fee));
  o.months = t.months > 0 ? t.months : undefined;
  o.sellOn = t.sellOn > 0 ? t.sellOn : undefined;
  o.lgFee = t.lgFee > 0 ? Math.round(t.lgFee) : undefined; o.lgApps = t.lgFee > 0 ? t.lgApps : undefined;
  o.intFee = t.intFee > 0 ? Math.round(t.intFee) : undefined; o.intApps = t.intFee > 0 ? t.intApps : undefined;
  o.pub = t.pub || undefined;
  o.swap = t.swap.length ? [...t.swap] : undefined;
}

// ---------------------------------------------------------------- beløbene (Cash 0x43f4e0/0x43f580, trinnet 0x4426e0)

/** cash_get_rounding_step 0x4426e0 med flag 4 (pund) */
export function cashStep(x: number): number {
  return x <= 10_000 ? 1000 : x <= 30_000 ? 2000 : x <= 100_000 ? 5000 : x <= 250_000 ? 10_000 : x <= 1_000_000 ? 25_000
    : x <= 5_000_000 ? 100_000 : x <= 20_000_000 ? 250_000 : x <= 50_000_000 ? 500_000 : 1_000_000;
}
const roundTo = (x: number, t: number) => Math.floor((x + t / 2) / t) * t;
/** et beløb afrundet som originalens (pund, cashStep-trinnet – £5.25M, £2.7M, £150K – ikke skæve beløb efter valutaomregningen) */
export function cashRound(eur: number): number { const x = toGbp(eur); return fromGbp(roundTo(x, cashStep(x))); }
/** Cash::step_up 0x43f4e0(4): afrund til trinnet, læg trinnet over x + 1 til (i pund) */
export function stepUp(eur: number): number { let x = toGbp(eur); x = roundTo(x, cashStep(x)); return fromGbp(x + cashStep(x + 1)); }
/** Cash::step_down 0x43f580(4) */
export function stepDown(eur: number): number { let x = toGbp(eur); x = roundTo(x, cashStep(x)); return fromGbp(Math.max(0, x - cashStep(x))); }

/** Beløbslisten bag ▾ (0x8e981e, pund) */
export const BID_AMOUNTS_GBP = [0, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 15_000_000, 20_000_000];
/** + er grå ved 100.000.000 (0x8ea5f6, 0x8eb051) */
export const MAX_FEE_GBP = 100_000_000;
export const feeAtMax = (eur: number) => toGbp(eur) >= MAX_FEE_GBP;
/** klausulbeløbets − er grå ved ≤ 1000 (0x8eaeb0) */
export const clauseAtMin = (eur: number) => toGbp(eur) <= 1000;

// ---------------------------------------------------------------- skærmens handlinger (0x8ec420)

export type BidAct =
  | 'feeUp' | 'feeDown' | 'inst' | 'instUp' | 'instDown' | 'sell' | 'sellUp' | 'sellDown'
  | 'lg' | 'lgN' | 'lgUp' | 'lgDown' | 'int' | 'intN' | 'intUp' | 'intDown' | 'pub';

/** Én knap på budskærmen. `value` = spillerens værdi i € (til 0xd/0x12's startbeløb). */
export function bidAct(t: BidTerms, a: BidAct, value: number): BidTerms {
  const n = { ...t, swap: [...t.swap] };
  const clauseStart = () => fromGbp(Math.max(1000, trunc(toGbp(value) * 0.25)));   // 0x8edce5: max(1000, 0,25 · værdi)
  const cycle = (v: number) => { const x = v === 1 ? 10 : v + 10; return x > 50 ? 1 : x; };   // 0x8edd84
  switch (a) {
    case 'feeUp': if (!feeAtMax(n.fee)) n.fee = stepUp(n.fee); break;                       // 3
    case 'feeDown': if (n.fee > 0) n.fee = stepDown(n.fee); break;                          // 4
    case 'inst': n.months = -n.months || 6; break;                                          // 7: v = −v, 0 → 6
    case 'instUp': if (n.months <= 0) n.months = -n.months || 6; else if (n.months < 24) n.months += 6; break;   // 8 (grå/7 når slået fra)
    case 'instDown': if (n.months <= 0) n.months = -n.months || 6; else if (n.months !== 6) n.months -= 6; break;  // 9
    case 'sell': n.sellOn = -n.sellOn || 10; break;                                         // 0xa: 0 → 10
    case 'sellUp': if (n.sellOn <= 0) n.sellOn = -n.sellOn || 10; else if (n.sellOn < 25) n.sellOn += 5; break;   // 0xb
    case 'sellDown': if (n.sellOn <= 0) n.sellOn = -n.sellOn || 10; else if (n.sellOn !== 5) n.sellOn -= 5; break; // 0xc
    case 'lg': n.lgFee = -n.lgFee || clauseStart(); break;                                   // 0xd
    case 'lgN': n.lgApps = cycle(n.lgApps); break;                                          // 0xe
    case 'lgUp': if (n.lgFee <= 0) n.lgFee = -n.lgFee || clauseStart(); else if (!feeAtMax(n.lgFee)) n.lgFee = stepUp(n.lgFee); break;   // 0xf
    case 'lgDown': if (n.lgFee <= 0) n.lgFee = -n.lgFee || clauseStart(); else if (!clauseAtMin(n.lgFee)) n.lgFee = stepDown(n.lgFee); break; // 0x10
    case 'int': n.intFee = -n.intFee || clauseStart(); break;                                // 0x12
    case 'intN': n.intApps = cycle(n.intApps); break;                                       // 0x13
    case 'intUp': if (n.intFee <= 0) n.intFee = -n.intFee || clauseStart(); else if (!feeAtMax(n.intFee)) n.intFee = stepUp(n.intFee); break;  // 0x14
    case 'intDown': if (n.intFee <= 0) n.intFee = -n.intFee || clauseStart(); else if (!clauseAtMin(n.intFee)) n.intFee = stepDown(n.intFee); break; // 0x15
    case 'pub': if (n.pub !== 1) n.pub = n.pub ? 0 : 2; break;                              // 0x22: 0 ↔ 2 (1 = låst)
  }
  return n;
}

/** "=" (5): værdien − bytte-spillernes værdier (≥ 0); for menneskets køber højst transferbudgettet */
export function feeEquals(value: number, swapValues: number[], budget?: number): number {
  const v = Math.max(0, value - swapValues.reduce((s, x) => s + x, 0));
  return budget !== undefined ? Math.min(v, budget) : v;
}
/** Exchange 0x4814e0 handling 2: fee −= hans værdi (≥ 0). Remove 0x8eee8a: fee += hans værdi. Højst 5 bytte-spillere (0x8eb637). */
export function addSwap(t: BidTerms, pid: number, value: number): BidTerms {
  if (t.swap.includes(pid) || t.swap.length >= 5) return t;
  return { ...t, swap: [...t.swap, pid], fee: Math.max(0, t.fee - value) };
}
export function removeSwap(t: BidTerms, pid: number, value: number): BidTerms {
  if (!t.swap.includes(pid)) return t;
  return { ...t, swap: t.swap.filter((x) => x !== pid), fee: t.fee + value };
}
export const MAX_SWAP = 5;

/** TRANSFER_OFFER::has_same_terms 0x8e7f70 (Reset/Negotiate): beløb, klausuler, rater, offentligt og bytte */
export function sameTerms(a: BidTerms, b: BidTerms): boolean {
  const on = (v: number) => Math.max(0, v);
  return toGbp(a.fee) === toGbp(b.fee) && on(a.months) === on(b.months) && on(a.sellOn) === on(b.sellOn) && toGbp(on(a.lgFee)) === toGbp(on(b.lgFee))
    && (a.lgFee <= 0 || a.lgApps === b.lgApps) && toGbp(on(a.intFee)) === toGbp(on(b.intFee)) && (a.intFee <= 0 || a.intApps === b.intApps)
    && (a.pub > 0) === (b.pub > 0) && a.swap.length === b.swap.length && a.swap.every((x) => b.swap.includes(x));
}

// ---------------------------------------------------------------- vurderingen (0x8e7a70 / 0x8e7b50)

/** Det, vurderingen bruger fra spillet (pund som originalen) */
export interface ValueCtx {
  /** spillerens værdi (+0x52, £) */
  value: number;
  /** sælgerklubbens managers bud på evne A (0x6e86d0 kind 2) og potentiale B (kind 1, hint 50·A) */
  A: number; B: number;
  /** alder (+0x18), landskampe (+0x22), nationens omdømme (+0x8e) */
  age: number; caps: number; nationRep: number;
  /** sælgerens formuebånd 0x5986b0 (−2..2; null = ingen klub) */
  band: number | null;
  /** bytte-spillernes værdi (£) */
  swapValue: (pid: number) => number;
}

/** TRANSFER_OFFER::get_total_value 0x8e7a70(udenKlausuler, udenBytte, –, medVideresalg) – i pund */
export function totalValue(t: BidTerms, c: ValueCtx, noClauses: boolean, noSwap: boolean, sellOn: boolean): number {
  let v = toGbp(t.fee);
  if (!noClauses) {
    if (t.lgFee > 0) v += toGbp(t.lgFee);
    if (t.intFee > 0) v += toGbp(t.intFee);
    if (t.sellOn > 0 && sellOn) v += trunc(c.value * t.sellOn / 100);
  }
  if (!noSwap) for (const id of t.swap) v += c.swapValue(id);
  return v;
}

/** TRANSFER_OFFER::get_weighted_value 0x8e7b50(a1 udenKlausuler, a2 udenBytte, a3 –, a4 formue, a5 videresalg) – i pund */
export function weightedValue(t: BidTerms, c: ValueCtx, a1: boolean, a2: boolean, a4: boolean, a5: boolean): number {
  let k = 1, f = 1;
  // rater: sælgerens formuebånd (springtabellen 0x8e7edc)
  if (c.band !== null && a4 && t.months > 0) {
    if (c.band === -2) { f = 0.1; k = 0.5; }
    else if (c.band === -1) { f = 0.3; k = 0.75; }
    else if (c.band === 0) f = t.months < 7 ? 0.9 : t.months < 13 ? 0.7 : 0.4;
    else if (c.band === 1) { if (t.months > 12) f = 0.9; }
  }
  let sum = toGbp(t.fee);
  if (!a1) {
    if (t.lgFee > 0) sum += trunc((1 - t.lgApps * 0.005) * toGbp(t.lgFee) * k);
    const x = 65 * s16(c.B);
    if (t.intFee > 0 && c.caps === 0 && c.age < 28 && x > c.nationRep) {
      let q = (1 - Math.abs(c.age - 24) * (1 / 15)) * (1 - t.intApps * 0.005) * ((x - c.nationRep) * (1 / 750) + 0.3);
      if (q > 0.75) q = 0.75;
      sum += trunc(toGbp(t.intFee) * q * k);
    }
    if (t.sellOn > 0 && a5 && c.A < c.B * 0.8) sum += trunc(c.value * t.sellOn * (c.B - c.A) * (1 / 33) * k * 0.01);
  }
  if (!a2) for (const id of t.swap) sum += c.swapValue(id);
  return trunc(sum * Math.fround(f));
}

// ---------------------------------------------------------------- computerens svar (0x8c8090) og klausul-muligheden (0x8c8fd0)

export interface ClauseOptIn {
  /** klubbernes omdømme (klub +0x80) */
  buyerRep: number; sellerRep: number;
  /** spillerens PA − CA (spillerdata +7 − +5), omdømme (+0xb) */
  paGap: number; rep: number;
}
/** TRANSFER_MANAGER::build_clause_offer_option 0x8c8fd0: et alternativt bud med klausul, når køberen er større og spilleren har potentiale */
export function clauseOption(base: BidTerms, c: ValueCtx, i: ClauseOptIn): { terms: BidTerms; appeal: number } | null {
  if (i.buyerRep - i.sellerRep <= 3 || i.paGap < 25 || c.age > 30) return null;
  const t: BidTerms = { ...base, swap: [] };
  const f = toGbp(base.fee), r = trunc(i.rep / 1000);
  if (i.buyerRep < 15 && r - i.buyerRep > 2) return { terms: { ...t, fee: fromGbp(trunc(f * 0.8)), sellOn: 20 }, appeal: 80 };
  if (c.nationRep > 5000 && c.caps === 0) return { terms: { ...t, intFee: fromGbp(trunc(f * 0.3)), intApps: 10, fee: fromGbp(trunc(f * 0.8)) }, appeal: 70 };
  if (r - i.buyerRep < -3) return { terms: { ...t, lgFee: fromGbp(trunc(f * 0.3)), lgApps: 20, fee: fromGbp(trunc(f * 0.8)) }, appeal: 60 };
  return null;
}

export type AiAnswer = { kind: 'accept' } | { kind: 'counter'; terms: BidTerms } | { kind: 'reject'; reason: number };

/** TRANSFER_MANAGER::ai_respond_to_bid 0x8c8090 (computerens klub sælger). `asking` = asking price 0x4d1600 (£, *estimeret*), `rivals` =
 *  de andre åbne buds vilkår, `unwanted` = en bytte-spiller, sælgeren ikke vil have (0x843800, *estimeret*), `final` = buddet er endeligt. */
export function aiRespond(t: BidTerms, c: ValueCtx, o: { asking: number; rivals: BidTerms[]; unwanted: boolean; final: boolean; base: BidTerms; clause: ClauseOptIn }): AiAnswer {
  let P = o.asking;
  for (const r of o.rivals) { const w = weightedValue(r, c, false, false, false, true); if (w > P) P = w; }
  const T = totalValue(t, c, true, false, true);
  const full = weightedValue(t, c, false, false, true, true);
  const noSwap = weightedValue(t, c, false, true, true, true);
  if (noSwap > P) P = noSwap;
  // 0x8c8740 kontant (appel 50) og 0x8c8fd0 klausul; bytte-muligheden 0x8c8860 er ikke porteret
  const opts: { terms: BidTerms; appeal: number }[] = [{ terms: { ...o.base, fee: fromGbp(P), swap: [] }, appeal: 50 }];
  const co = clauseOption({ ...o.base, fee: fromGbp(P), swap: [] }, c, o.clause);
  if (co) opts.push(co);
  let best = opts[0], bestA = -1;
  for (const op of opts) {
    if (op.appeal > bestA) { best = op; bestA = op.appeal; }
    if (weightedValue(op.terms, c, false, false, true, true) * 0.85 < full && !o.unwanted) return { kind: 'accept' };
  }
  if (weightedValue(best.terms, c, false, false, false, true) * 0.75 < full && !o.final) return { kind: 'counter', terms: best.terms };
  // 0x8c8676: "totally unacceptable"
  const v = c.value;
  const reason = (T < v * 0.55 && v - T > 2_000_000) || (T < v * 0.1 && v - T > 100_000) ? 10 : 0;
  return { kind: 'reject', reason };
}

/** TRANSFER_MANAGER::review_ai_club_bid 0x8c0810 (computerens køber vurderer menneskets modbud). `M` = 0x840d80's værdisætning (£, *estimeret*),
 *  `askingOf` = asking price for de krævede bytte-spillere (£), `budget` = købers transferbudget (£). */
export function aiReview(t: BidTerms, c: ValueCtx, M: number, askingOf: (pid: number) => number, budget: number): { kind: 'withdraw' } | { kind: 'rebid'; terms: BidTerms } {
  const n: BidTerms = { ...t, swap: [...t.swap] };
  let W = weightedValue(n, c, false, true, true, true), pool = 0;
  for (const id of t.swap) {
    const a = askingOf(id);
    if (a + W > M) { pool += a; n.swap = n.swap.filter((x) => x !== id); } else W += a;
  }
  if (W > M) return { kind: 'withdraw' };
  let add = Math.min(pool, M - W); if (add < 0) add = 0;
  n.fee = fromGbp(toGbp(n.fee) + add);
  if (totalValue(n, c, false, true, false) > budget) return { kind: 'withdraw' };
  return { kind: 'rebid', terms: n };
}

// ---------------------------------------------------------------- afvisningsbegrundelserne (0x8c5690, 0x8c5560, 0x8c5800, 0x8ce0e0)

/** Originalens koder (0x8c5690) */
export const REJECT_CODES = { none: 0, indispensable: 0x200, important: 0x400, rival: 0x800, division: 0x1000, prospect: 0x2000, unacceptable: 0xa } as const;
export type RejectKey = keyof typeof REJECT_CODES;

/** transfer_manager_is_rejection_reason_valid 0x8c5560: hot prospect kun under 24 år, samme division kun i samme liga, rival kun ved ligasammenstød/
 *  rivaler (eller en menneskets klub). 'unacceptable' kan kun computeren bruge. */
export function rejectReasonValid(key: RejectKey, age: number, sameLeague: boolean, rivals: boolean): boolean {
  if (key === 'prospect') return age < 24;
  if (key === 'division') return sameLeague;
  if (key === 'rival') return rivals;
  return key !== 'unacceptable';
}
/** transfer_manager_get_squad_status_reason 0x8c54c0 (springtabellen 0x8c554c): dialogens forvalgte grund efter trupstatus 1 → 0x200, 2 → 0x400,
 *  5 → 0x2000, ellers None */
export function reasonForStatus(status: number): RejectKey {
  return status === 1 ? 'indispensable' : status === 2 ? 'important' : status === 5 ? 'prospect' : 'none';
}
/** transfer_manager_get_squad_status_for_reason 0x8c5800: 0x200 → 1 (Key), 0x400 → 2 (First Team), 0x2000 → 5 (Hot Prospect), ellers uændret */
export function statusForReason(key: RejectKey, cur: number): number {
  return key === 'indispensable' ? 1 : key === 'important' ? 2 : key === 'prospect' ? 5 : cur;
}
/** TRANSFER_MANAGER::set_player_squad_status 0x8ce0e0 – tilfredsheden (kontrakt +0x44, ±100). `changed` = flag & 3 (mennesket ændrede buddet før
 *  afvisningen). Returnerer den nye værdi. (Klagerne/AWOL-tjekket efter "≥ 7 dage" i samme funktion er ikke porteret.) */
export function statusSatisfaction(b44: number, oldStatus: number, newStatus: number, changed: boolean): number {
  const cl = (v: number) => (v > 100 ? 100 : v < -100 ? -100 : v);
  if (oldStatus === 0) {
    switch (newStatus) {
      case 1: return cl(b44 + (changed ? -100 : 100));
      case 2: return cl(b44 + (changed ? -100 : 50));
      case 3: return cl(b44 + (changed ? -100 : 25));
      case 4: return changed ? cl(b44 - 100) : b44;
      case 5: return changed ? cl(b44 - 50) : b44;
      case 6: return cl(b44 - 20);
      case 7: return cl(b44 - 100);
      default: return b44;
    }
  }
  if (oldStatus >= newStatus) return b44;
  let d = (oldStatus - newStatus) * 25;
  if (oldStatus === 3 && newStatus === 4) d = -50;
  if (d < -125) d = -125;
  return cl(b44 + d);
}

// ---------------------------------------------------------------- spillets data → ValueCtx

/** Vurderingens tal af spillet: sælgerklubbens manager vurderer (0x6e86d0), formuebåndet 0x5986b0 af sælgerens saldo og omdømme */
export function valueCtx(g: GameState, p: Player): ValueCtx {
  const sellerId = p.club;
  const seller: Club | undefined = g.clubs[sellerId];
  const age = ageOn(p.dob, g.date);
  const ctx = sellerId ? aiPickCtx(sellerId) ?? {} : {};
  const judge = roleDataOf(p, ctx, age).judge;
  const A = judge(2, repMem(p));
  const B = judge(1, 50 * A);
  return {
    value: toGbp(p.value), A, B, age, caps: Math.min(255, p.caps ?? 0), nationRep: nationRepMem(g, p.nation),
    band: seller ? financeStatus(toGbp(seller.balance), clubRepMem(g, sellerId)) : null,
    swapValue: (id) => toGbp(g.players[id]?.value ?? 0),
  };
}
export function clauseOptIn(g: GameState, p: Player, buyer: number): ClauseOptIn {
  return { buyerRep: clubRepMem(g, buyer), sellerRep: clubRepMem(g, p.club), paGap: p.pa - p.ca, rep: repMem(p) };
}

/** Afvisning med begrundelse på menneskets spiller (0x8f06f0): trupstatus og tilfredsheden; intet svar fra spilleren (det er det udvidede spils). */
export function applyRejectReason(p: Player, key: RejectKey, changed: boolean): void {
  const c = cmContractOf(p);
  const old = statusCode(p);
  const next = statusForReason(key, old);
  c.b44 = statusSatisfaction(c.b44, old, next, changed);
  if (next !== old) {
    const names = ['', 'key', 'first', 'rotation', 'backup', 'prospect', 'young', 'surplus'] as const;
    p.squadStatus = (names[next] || undefined) as Player['squadStatus'];
    if (c.b4f !== undefined) c.b4f = (c.b4f & 0xf) | (next << 4);
  }
}

export { toGbp, fromGbp };
