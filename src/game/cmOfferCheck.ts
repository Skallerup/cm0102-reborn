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
import { cmActive } from './cmPlayerData';

/** Grænsen for udlændinge i truppen (+0x13) pr. nation i 2001/02; standard 50. 0xff (Belgien) = ingen grænse (sweep-rulebooks §3.2) */
export const CM_FOREIGN_CAP: Record<string, number> = {
  Argentina: 20, Australia: 6, Brazil: 3, 'South Korea': 7, Poland: 5, Turkey: 8, 'United States': 4,
};

/** Et vindue: [startdag, startmåned (1–12), startugedag (0 søndag … 6 lørdag, −1 ingen), slutdag, slutmåned, slutugedag] */
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

/** transfer_window_get_date 0x40a7d0: datoen i året, flyttet frem til ugedagen (på eller efter) */
function windowDate(year: number, day: number, month: number, wd: number): string {
  const d = new Date(Date.UTC(year, month - 1, day));
  if (wd >= 0) d.setUTCDate(d.getUTCDate() + ((wd - d.getUTCDay() + 7) % 7));
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

  // 2. penge (get_total_value uden byttespillere; budget × 1,1)
  const value = o.fee + (o.lgFee ?? 0) + (o.intFee ?? 0);
  if (value > Math.max(0, buyer.transferBudget) * 1.1) return { code: 1, reason: 3 };

  // 3. trupplads (0x8cd450): køberen får spilleren og mister byttespillerne
  if (squad(o.buyer).length + 1 - swap.length > 50) return { code: 1, reason: 4 };

  // 4.–5. nationens regelsæt (0x8e8800) og vinduet: 2001/02-reglerne (MODERN_PARITY: verdenen) – 2026/27 har spillets egne vinduer og ingen loft
  if (!cmActive(g)) return { code: 0, reason: 0 };
  const limit = cmForeignLimit(g, buyer);
  if (limit !== null && cmForeignPlayer(g, p, buyer.nation) && !swap.some((s) => cmForeignPlayer(g, s, buyer.nation))) {
    const foreign = squad(o.buyer).filter((x) => cmForeignPlayer(g, x, buyer.nation)).length;
    if (foreign + 1 > limit) return { code: 2, reason: 0x14 };
  }
  if (!cmWindowOpen(g, buyer, g.date)) return { code: 2, reason: 9 };
  return { code: 0, reason: 0 };
}
