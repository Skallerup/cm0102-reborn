// CM 01/02: kontrollen af et transferbud, TRANSFER_MANAGER::check_offer_restrictions 0x8cfc90 (cm0102.exe 3.9.68) – kun den originale database i
// ægte tilstand. Returnerer 0 (i orden), 1 (Delay Transfer Offer – kan vente en uge) eller 2 (Transfer Cancelled) og en grund (*reason) som
// "Confirm Transfer Offer"-skærmen 0x8f2ec0 vælger teksten efter. Kaldet fra skærmen er (bud, menneskets klub, &grund, 1): fjerde argument = 1.
//
// Forløbet for køberen (deciding = buyer, bud med +0x30 lav nibble 0 = ingen særlig tidspunkt – de øvrige timing-nibbler (0x8cee70: 1/2/4/5)
// og tilbud af typen 0x13 er ikke modelleret, *estimeret*):
//   1. (kun når fjerde argument = 0) bestyrelsens veto 0x8cdb80/0x696b10 (grund 0x24, 0x17, 0x18) – IKKE med i bekræftelsesskærmen
//   2. penge: 0x8cfe16–0x8cfeb1. Budgettet (Finance::get_transfer_budget 0x598800, ikke under 0) × 1,1 ([0x9689c0]) mod buddets værdi
//      (get_total_value 0x8e7a70(0,1,1,0): beløb + klausuler, ikke byttespillere). For lidt: grund 3, og er klubben menneskestyret
//      (human_manager_is_human_club 0x600a50) returneres 1 straks. (Computerens gren – ventende salg lægges til, 1 eller 2 – er ikke nødvendig her.)
//   3. trupplads: 0x8cd450(klub, bud, tæl_linkede = 1, &grund) – holdet må ikke blive over 50 spillere (spillerlisten klub+0xd7 har 50 pladser;
//      køberen får +1 og mister byttespillerne). Fejl → grund 4 (køberen; 5 for sælgeren) og returværdi 1. Computerens klub frigiver selv en
//      billig spiller (0x8c1af0) – for mennesket afvises det. Kø af frie transfers (0x8c1780) tæller ikke med, *estimeret*. Personalepladserne
//      (grund 0x22/0x23: 5 trænere, 7, 3, 1 – kun jobtilbud) gælder ikke spillerhandler.
//   4. nationens regelsæt (TRANSFER_RULES, objektet hvis nation = klubbens, vtable +0xc = can_make_offer 0x8e8800 for England og de fleste):
//      a) udenlandsk-grænsen (+0x13): køberen må ikke få flere udlændinge end grænsen (indkøbet + dem i truppen; en udenlandsk byttespiller
//         redder handlen) – grund 0x14; Tyrkiet: 0 uden for Premier Division ([0x9cf8d8]). Grænserne står i hver nations konstruktør (sweep-rulebooks §3.2).
//      b) transfervinduerne (+4/+8, 12 byte pr. vindue, 0x8e8c40): ligger datoen i intet vindue → grund 9. Er buddets timing-nibble 5 (ved
//         sæsonskifte), er grund 9 i orden. Vinduerne for 2001/02 står i sweep-rulebooks §3.1.
//      Andre nationers egne regler (Argentina 0xe, Frankrig 0xc/0xd/0xf/0x10, Italien/Spanien 0x11 m.fl.) og begrænsningerne ved
//      "skal acceptere" (0x8cd240) er ikke porteret – *estimeret*: de giver aldrig en fejl her.
// Fejl i reglerne → returværdi 2 med grunden.
import type { Club, GameState, Player, TransferOffer } from './types';
import { squad } from './state';
import { cmForeign } from './cmNewsScope';
import { cmMarketOn } from './cmPlayerData';
import { cmEuCitizen } from './cmPermit';
import { addDays } from './dates';

/** Grænsen for udlændinge i truppen (+0x13) pr. nation i 2001/02; standard 50. 0xff (Belgien) = ingen grænse (sweep-rulebooks §3.2) */
export const CM_FOREIGN_CAP: Record<string, number> = {
  Argentina: 20, Australia: 6, Brazil: 3, 'South Korea': 7, Poland: 5, Turkey: 8, 'United States': 4,
};

/** Et vindue: [startdag, startmåned (1–12), startugedag (0 mandag … 6 søndag – 0x54a2d0, −1 ingen), slutdag, slutmåned, slutugedag] */
type Win = [number, number, number, number, number, number];
/** Transfervinduerne 2001/02 pr. nation (sweep-rulebooks §3.1). Danmark, Sverige og Europa har ingen = altid åbent */
export const CM_WINDOWS: Record<string, Win[]> = {
  Argentina: [[24, 7, 0, 6, 8, 3], [14, 12, 0, 4, 3, 3]],
  England: [[2, 6, 1, 26, 3, 4]],
  Australia: [[11, 6, 6, 17, 4, -1]],
  Belgium: [[1, 6, -1, 30, 6, -1], [1, 6, -1, 31, 12, -1], [1, 6, -1, 31, 3, -1]],
  Brazil: [[11, 12, 3, 8, 11, 5]],
  Croatia: [[1, 6, -1, 30, 3, -1]],
  Finland: [[16, 11, -1, 15, 8, -1]],
  France: [[30, 5, 6, 31, 8, 3], [1, 9, 4, 20, 12, 4], [21, 12, 5, 10, 1, 4]],
  Germany: [[1, 7, -1, 15, 8, -1], [1, 7, -1, 15, 1, -1]],
  Greece: [[22, 5, 0, 29, 8, 6], [1, 1, -1, 20, 1, -1]],
  Holland: [[8, 6, 6, 4, 4, 5]],
  'Republic of Ireland': [[10, 5, -1, 31, 1, -1]],
  Italy: [[1, 7, -1, 27, 10, 4], [2, 1, -1, 31, 1, -1], [1, 7, -1, 30, 4, -1]],
  Japan: [[12, 12, 6, 4, 5, -1], [30, 5, 6, 29, 10, -1]],
  'South Korea': [[25, 11, 0, 25, 7, -1]],
  'Northern Ireland': [[6, 5, 6, 20, 3, -1]],
  Norway: [[1, 9, -1, 31, 8, -1]],
  Poland: [[1, 7, -1, 20, 2, -1]],
  Portugal: [[1, 6, -1, 1, 9, -1], [15, 12, -1, 15, 1, -1]],
  Russia: [[15, 12, -1, 24, 3, 4], [28, 6, 2, 4, 8, -1]],
  Scotland: [[30, 5, 6, 30, 3, 4]],
  Spain: [[17, 6, 3, 20, 8, 4], [15, 12, -1, 31, 1, -1]],
  Turkey: [[1, 6, -1, 31, 1, -1]],
  'United States': [[7, 1, 3, 15, 8, -1]],
  Wales: [[7, 5, 0, 20, 3, -1]],
};

const pad = (n: number) => String(n).padStart(2, '0');

/** transfer_window_get_date 0x40a7d0 → Date(dag, måned, år) 0x549f70 + 0x54a2d0(ugedag): datoen flyttes til den NÆRMESTE dag med ugedagen
 *  (0x54a2d0: ugedagen regnes fra år 1600 med 0 = mandag … 6 = søndag; forskellen ugedag(dato) − ugedag lægges i −3..+3 og trækkes fra datoen,
 *  0x54c8e0). England [2/6, tirsdag]: 4/6-02, 3/6-03, 1/6-04 – som oraklets spids af handler (k7-seasons BUYS). Før: næste på eller efter med
 *  0 = søndag (sweep-rulebooks §3.1), så vinduet åbnede 3/6-02, 2/6-03 og 7/6-04. */
function windowDate(year: number, day: number, month: number, wd: number): string {
  const d = new Date(Date.UTC(year, month - 1, day));
  if (wd >= 0) {
    let diff = ((d.getUTCDay() + 6) % 7) - wd;   // ugedag med 0 = mandag
    if (diff < -3) diff += 7;
    else if (diff > 3) diff -= 7;
    d.setUTCDate(d.getUTCDate() - diff);
  }
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** transfer_window_contains_date 0x8e8c40 (grænserne er med; et vindue, der slutter før det starter i året, løber over nytår) */
export function cmInWindow(w: Win, date: string): boolean {
  const y = Number(date.slice(0, 4));
  const s = windowDate(y, w[0], w[1], w[2]);
  const e = windowDate(y, w[3], w[4], w[5]);
  return w[1] > w[4] ? date >= s || date <= e : date >= s && date <= e;
}

/** Er der et åbent transfervindue for klubbens nation på datoen? (ingen vinduer = altid) */
export function cmWindowOpen(g: GameState, club: Club, date: string): boolean {
  const ws = CM_WINDOWS[g.nations[club.nation]?.name ?? ''];
  return !ws || ws.some((w) => cmInWindow(w, date));
}

/** 0x53d980(spiller, klubbens nation, 1): spilleren er udenlandsk, hvis ingen af hans nationaliteter er (grupperet med) klubbens */
export function cmForeignPlayer(g: GameState, p: Player, nation: number): boolean {
  return cmForeign(g, p.nation, nation) && (p.cmNation2 === undefined || p.cmNation2 < 0 || cmForeign(g, p.cmNation2, nation));
}

/** Udlændingegrænsen (+0x13) for klubbens nation – Tyrkiet: 0 uden for den bedste række. null = ingen grænse */
export function cmForeignLimit(g: GameState, club: Club): number | null {
  const name = g.nations[club.nation]?.name ?? '';
  if (name === 'Belgium') return null;
  if (name === 'Turkey' && g.leagues[club.league]?.tier !== 1) return 0;
  return CM_FOREIGN_CAP[name] ?? 50;
}

export interface OfferCheck { code: 0 | 1 | 2; reason: number }

/** check_offer_restrictions 0x8cfc90 for menneskets køber, fra bekræftelsesskærmen (fjerde argument 1) */
export function cmCheckOffer(g: GameState, o: TransferOffer): OfferCheck {
  const buyer = g.clubs[o.buyer], p = g.players[o.player];
  if (!buyer || !p) return { code: 0, reason: 0 };
  const swap = (o.swap ?? []).map((id) => g.players[id]).filter(Boolean);

  // 1. tidsnibblen ≠ 0 (0x8cfd31, ikke tilstand 0x13): ligger handlens dato (0x8cee70) efter i dag, er alt i orden – forkontrakten og den
  //    klubløse i det lukkede vindue
  if ((o.cmTime ?? 0) !== 0 && cmCompletionDate(g, o) > g.date.slice(0, 10)) return { code: 0, reason: 0 };

  // 2. penge (get_total_value uden byttespillere; budget × 1,1)
  const value = o.fee + (o.lgFee ?? 0) + (o.intFee ?? 0);
  if (value > Math.max(0, buyer.transferBudget) * 1.1) return { code: 1, reason: 3 };

  // 3. trupplads (0x8cd450): køberen får spilleren og mister byttespillerne
  if (squad(o.buyer).length + 1 - swap.length > 50) return { code: 1, reason: 4 };

  // 4.–5. nationens regelsæt (0x8e8800) og vinduet: konstruktørernes tal står fast i exe'en – alle CM-databaser med originalens marked (cmMarketOn)
  if (!cmMarketOn(g)) return { code: 0, reason: 0 };
  const limit = cmForeignLimit(g, buyer);
  if (limit !== null && cmForeignPlayer(g, p, buyer.nation) && !swap.some((s) => cmForeignPlayer(g, s, buyer.nation))) {
    const foreign = squad(o.buyer).filter((x) => cmForeignPlayer(g, x, buyer.nation)).length;
    if (foreign + 1 > limit) return { code: 2, reason: 0x14 };
  }
  // grund 9 er i orden for nibble 5 (0x8d001e)
  if (!cmWindowOpen(g, buyer, g.date) && o.cmTime !== 5) return { code: 2, reason: 9 };
  return { code: 0, reason: 0 };
}

/** Nationerne med et TRANSFER_RULES-objekt (setup_transfer_rules 0x8d26b0, manager +0x8b0 …) – kun dem har vinduer og grænser; en klub i et andet
 *  land kan altid købe (0x8ced40/0x8cf0e0: intet regelsæt → i orden) */
const CM_RULES = new Set(['Argentina', 'Australia', 'Belgium', 'Brazil', 'Croatia', 'Denmark', 'England', 'Finland', 'France', 'Germany', 'Greece',
  'Holland', 'Republic of Ireland', 'Italy', 'Japan', 'Northern Ireland', 'Norway', 'Poland', 'Portugal', 'Russia', 'Scotland', 'Spain', 'Sweden',
  'Turkey', 'United States', 'Wales', 'South Korea']);
/** regelsættets nation ligger uden for Europa (+0xa → nationens kontinent +0x71 ≠ Europa [0x9cfa10]) – ingen grænse for spillere uden for EU */
const CM_RULES_NOT_EUROPE = new Set(['Argentina', 'Australia', 'Brazil', 'Japan', 'United States', 'South Korea']);
/** grænsen for spillere uden for EU (+0x14) pr. nation 2001/02, standard 30; 0xff (Belgien) = ingen (sweep-rulebooks §3.2) */
const CM_NON_EU_CAP: Record<string, number> = { Greece: 6, Holland: 50, Italy: 40, Poland: 5, Turkey: 8, Spain: 6 };

const nationName = (g: GameState, c: Club) => g.nations[c.nation]?.name ?? '';

/** TRANSFER_RULES::can_make_offer 0x8e8800 (vtable +0xc – England og de fleste) for klubben `club` i handlen `o` på datoen: 0 = i orden, ellers
 *  grunden. Køberen: udlændingegrænsen +0x13 (spilleren udenlandsk; en udenlandsk byttespiller redder handlen) – 0x14 – og vinduet (grund 9).
 *  Sælgeren (kontraktens klub): grænsen med de udenlandske byttespillere, han får, minus spilleren selv, hvis han er udenlandsk – intet vindue
 *  (0x8e89f8: kun når klubben er buddets køber). Landets egne regler (Argentina, Frankrig, Italien m.fl. – andre vtabeller) er ikke porteret. */
export function cmRulesReason(g: GameState, o: TransferOffer, club: Club, date: string): number {
  if (!CM_RULES.has(nationName(g, club))) return 0;
  const p = g.players[o.player];
  if (!p) return 0;
  const swap = (o.swap ?? []).map((id) => g.players[id]).filter(Boolean);
  const isBuyer = club.id === o.buyer;
  const limit = cmForeignLimit(g, club);
  let n = 0;
  if (isBuyer) n = cmForeignPlayer(g, p, club.nation) && !swap.some((s) => cmForeignPlayer(g, s, club.nation)) ? 1 : 0;
  else if (swap.length) n = swap.filter((s) => cmForeignPlayer(g, s, club.nation)).length - (cmForeignPlayer(g, p, club.nation) ? 1 : 0);
  if (limit !== null && n > 0) {
    const foreign = squad(club.id).filter((x) => cmForeignPlayer(g, x, club.nation)).length;
    if (foreign + n > limit) return 0x14;
  }
  if (isBuyer && !cmWindowOpen(g, club, date)) return 9;
  return 0;
}

/** TRANSFER_MANAGER 0x8ced40(køber, &dato, staff, kontraktklub, 1, &grund) → køberlandets TRANSFER_RULES::can_sign_player 0x8e8560 (vtable +0x10)
 *  på datoen: udlændingegrænsen +0x13 (0x14), grænsen for spillere uden for EU +0x14 (kun når regelsættets land ligger i Europa; spanske klubbers
 *  4/3/0 efter division, 0x8e85c0) – 0x15 – og vinduet (grund 9). Intet regelsæt for købers land → i orden. 0 = i orden. Computerens køber:
 *  grunden gives videre (0x8cee44). Argentinas/Frankrigs/Italiens egne +0x10 (0x40a860, 0x5c1830, 0x661520) er ikke porteret – grundreglen bruges. */
export function cmCanSign(g: GameState, buyer: Club, p: Player, date: string): number {
  const name = nationName(g, buyer);
  if (!CM_RULES.has(name)) return 0;
  const sq = squad(buyer.id);
  const foreign = cmForeignPlayer(g, p, buyer.nation);
  const limit = cmForeignLimit(g, buyer);
  if (foreign && limit !== null && sq.filter((x) => cmForeignPlayer(g, x, buyer.nation)).length >= limit) return 0x14;
  if (!CM_RULES_NOT_EUROPE.has(name) && foreign && !cmEuCitizen(g, p)) {
    let cap = name === 'Belgium' ? null : CM_NON_EU_CAP[name] ?? 30;
    if (name === 'Spain') { const t = g.leagues[buyer.league]?.tier; cap = t === 1 ? 4 : t === 2 ? 3 : 0; }
    if (cap !== null && sq.filter((x) => cmForeignPlayer(g, x, buyer.nation) && !cmEuCitizen(g, x)).length >= cap) return 0x15;
  }
  if (!cmWindowOpen(g, buyer, date)) return 9;
  return 0;
}

const maxIso = (a: string, b: string) => (a > b ? a : b);

/** get_offer_completion_date 0x8cee70 for buddet (tidsnibblen +0x30 & 0xf = o.cmTime): hvornår handlen gennemføres, og en fejlkode (0 i orden).
 *  0 → i dag. 3 → dagen efter kontraktens udløb (+0x2d + 1), dog tidligst i dag. 1/4 → 0x8cf0e0: fra i dag (4: kontraktens udløb, hvis det er
 *  senere) dag for dag, højst til i dag + 365 dage (0x16d), til første dag, hvor køberlandets can_make_offer (vtable +0xc – cmRulesReason) ikke
 *  svarer grund 9 (en anden grund stopper også søgningen – kontrollen 0x8cfc90 fanger den på dagen), og sælgerlandets heller ikke, når der er
 *  byttespillere (0x8cf32b). Findes ingen dag, er datoen i dag. 5 (kompensation) → 0x8d0bb0: inden for 1/7–31/7 eller 15/12–15/1 i dag, ellers
 *  næste af de to starter. 2 (0x669bd0 – kontraktklubbens næste dato + 7) er ikke porteret: i dag. */
export function cmCompletionDate(g: GameState, o: TransferOffer): string {
  const t = o.cmTime ?? 0, today = g.date.slice(0, 10);
  if (t === 3) return o.cmUntil ? maxIso(today, addDays(o.cmUntil, 1)) : today;
  if (t === 5) {
    const md = today.slice(5), y = today.slice(0, 4);
    if ((md >= '07-01' && md <= '07-31') || md >= '12-15' || md <= '01-15') return today;
    return md < '07-01' ? `${y}-07-01` : `${y}-12-15`;
  }
  if (t !== 1 && t !== 4) return today;
  const p = g.players[o.player], buyer = g.clubs[o.buyer];
  if (!p || !buyer) return today;
  const seller = o.seller && (o.swap?.length ?? 0) > 0 ? g.clubs[o.seller] : undefined;
  const limit = addDays(today, 0x16d);
  let d = t === 4 && o.cmUntil ? maxIso(today, o.cmUntil) : today;
  for (; d < limit; d = addDays(d, 1)) {
    if (cmRulesReason(g, o, buyer, d) === 9) continue;
    if (seller && cmRulesReason(g, o, seller, d) === 9) continue;
    return d;
  }
  return today;
}

/** try_complete_offer 0x8c34e0 (process_due_offer 0x8c63a0, tilstand 0xe, andet argument 0) for computer → computer-handlen: check_offer_restrictions
 *  0x8cfc90(bud, klub, &grund, 0) først for køberen (0x8c355a), så for kontraktens klub (0x8c35c4 – ingen for en klubløs). Svar 2 → handlen
 *  falder (0x8c44e0: tilstand 0x10, 20 dage); svar 1 → en uge mere (0x8c36b0). Tidsnibblen ≠ 0 (0x8cfd31): ligger handlens dato (0x8cee70 –
 *  cmCompletionDate) efter i dag, er alt i orden (svar 0). Ellers nationens regelsæt (TRANSFER_RULES +0xc, 0x8e8800 – cmRulesReason) på dagen:
 *  grund 9 er i orden for nibble 5 (0x8d001e). Bestyrelsens veto (0x8cdb80), pengene og truppladsen (0x8cd450) er ikke porteret her (pengene:
 *  transfers.ts' budgetprøve). `ignore9`: process_due_future_transfers 0x8cbbe0 lader grund 9 passere. Returnerer grunden ≠ 0, når handlen falder. */
export function cmAiRulesReason(g: GameState, o: TransferOffer, ignore9 = false): number {
  const buyer = g.clubs[o.buyer], p = g.players[o.player];
  if (!buyer || !p || !cmMarketOn(g)) return 0;
  if ((o.cmTime ?? 0) !== 0 && cmCompletionDate(g, o) > g.date.slice(0, 10)) return 0;
  const ok9 = ignore9 || o.cmTime === 5;
  // 0x8cbbe0 (ignore9): kontrollen køres fuldt på dagen – også pengene (0x8cfe16: budgettet, ikke under 0, × 1,1 mod beløb + klausuler; for
  // lidt → svar 1 eller 2, og 0x8cbbe0 lader begge vælte handlen). I try_complete-vejen står transfers.ts' egen budgetprøve.
  if (ignore9 && !o.loan && o.fee + (o.lgFee ?? 0) + (o.intFee ?? 0) > Math.max(0, buyer.transferBudget) * 1.1) return 3;
  for (const c of [buyer, o.seller ? g.clubs[o.seller] : undefined]) {
    if (!c) continue;
    const r = cmRulesReason(g, o, c, g.date.slice(0, 10));
    if (r && !(r === 9 && ok9)) return r;
  }
  return 0;
}
export function cmAiRulesBlock(g: GameState, o: TransferOffer): boolean {
  return cmAiRulesReason(g, o) !== 0;
}
