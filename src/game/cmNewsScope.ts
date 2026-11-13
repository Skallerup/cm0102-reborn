// Originalens regler for, HVEM der får nyheder om andre klubber (kun den originale database i ægte tilstand, cmActive).
//
// Nyhederne leveres af News (0xb7431c) til de menneskelige managere: send_to_club_manager 0x7861e0 (klubbens manager, hvis menneske),
// send_to_nation_managers 0x7863f0 (managere hvis klub ELLER landshold hører til landet), send_to_all_managers 0x786780; deliver_to_manager
// 0x785d40 har intet filter (ingen indstilling i Game Settings). Hvem der vælges, afgøres af den, der laver nyheden:
//
// 1) Transfers – "{klub} seal {spiller} deal" / "{spiller} moves to {klub}" / "sign" / "get" (type 0xfa8, tekst 0x8dc370):
//    TRANSFER_MANAGER::post_transfer_completed_news 0x8dbef0 (kaldt fra try_complete_offer 0x8c34e0 FØR kontrakten flyttes) →
//    køberen er menneske → ALLE; ellers klubberne fra collect_offer_news_recipients 0x8d1130(offer, 0x5f, out, 30); tom liste → ingen nyhed.
//    Flagene 0x5f: 1 køber, 2 sælger, 4 andre bydende mennesker (+ moderklubben ved leje), 8 mennesker med spilleren på shortlisten
//    (Shortlist_Manager::collect_interested_clubs 0x842180 → SCOUT_MANAGER::is_player_shortlisted 0x7f7490), 0x10 omdømmet, 0x40 divisionerne.
//    Omdømmet (spillerpost +9 hjemme H, +0xb nuværende C, +0xd verden W; ×50 = cmRepMem):
//      ax = s16(ftol(3000 − 0,0006·værdi)) (byttehandel +0x2f: 500), værdi = TRANSFER_OFFER::get_weighted_value 0x8e7b50(0,0,0,0,1)
//      W > min(ax+9200, 9750) → alle; W > min(ax+8300, 9750) → verdensdelene (+0x71) for spillerens nationalitet, sælgers og købers land;
//      H > T3 eller C > T3 (T3 = min(ax+7200, 9750)) → landene: nationaliteten (H > T3), sælgers land (C > T3), købers land (W > T3, eller
//      værdi ≥ 500.000·(nation +0x85 − 10), eller +0x22 landskampe > 20 og landsholdskontrakt +0x24 med omdømme > 5500); England ↔ Skotland
//      (0x9cf2e4/0x9cf45c) tæller som hinanden for managerens nationalitet;
//      ellers (0x40) sælgers division: C > 350·divisionens omdømme (+0x69) og C > 2500, eller 9 − C·0,00025 < PlayerStats 0x7c1e30(post, 2, 0x12, 6,5);
//      købers division: omdømmet set fra køberen 0x5407e0 > 350·købers divisions omdømme og C > 1500, eller køberens planlægger-plads
//      0x849ce0 (gruppe < 3) og gebyret ≥ £1.000.000.
//    Manageren matcher på sin nationalitet (+0x1a) eller sin klubs land/verdensdel; divisionerne på klubbens +0x57.
// 2) Managerskifter 0x6a2e00 ("appoint") / 0x6a1b00 ("leave"/fyring): klub i en kørende liga i et valgt land (0x544820 club_can_be_managed),
//    menneske eller landshold eller klubomdømme +0x80 > 7250 → alle, ellers landets managere.
//
// Data, vi ikke har (afvigelser i inddata, ikke regler): landsholdskontrakten staff +0x24 (spillere har ingen hos os → det led er falsk),
// buddenes status (0x2c: vi regner åbne bud – pending/negotiating/countered/accepted – med), videresalgsleddet i 0x8e7b50 (bedømt CA/PA
// 0x6e86d0) og B-holdsparrene 0x540a50.
import type { Club, GameState, Player } from './types';
import { clubRepMem, statAvg } from './cmPlayerData';

const s16 = (v: number) => (v << 16) >> 16;
const ftol = Math.trunc;
const GBP = 0.86;                                                              // £ = € · 0,86 (newgame.ts)
const UK = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic Of Ireland', 'Ireland']);
const AN = new Set(['Australia', 'New Zealand']);

/** 0x53d980(person, nation, 1): er landet "udenlandsk" for en person med nationaliteten `own`? */
export function cmForeign(g: GameState, own: number, n: number): boolean {
  if (n < 0) return true;
  if (own === n) return false;
  const a = g.nations[n]?.name ?? '', b = g.nations[own]?.name ?? '';
  if (UK.has(a) && UK.has(b)) return false;
  if (AN.has(a) && AN.has(b)) return false;
  if (a === 'Italy' && b === 'Ukraine') return false;
  return true;
}

/** spillerpostens omdømme i hukommelsen: [+9 hjemme, +0xb nuværende, +0xd verden] */
function reps(p: Player): [number, number, number] {
  const r = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
  return [s16(Math.round(r[0] * 50)), s16(Math.round(r[1] * 50)), s16(Math.round(r[2] * 50))];
}

/** klubbens division (+0x57): en synlig liga – null for skjulte ligaer/ingen */
function divisionOf(g: GameState, c: Club | undefined): string | null {
  if (!c) return null;
  const comp = g.comps[c.league];
  return comp && comp.type === 'league' && !g.leagues[c.league]?.hidden ? c.league : null;
}
/** divisionens omdømme +0x69 (club_comp.dat +105) */
function divRep(g: GameState, lid: string): number {
  const m = /^CM(\d+)$/.exec(lid);
  return s16(m ? g.cmCompRep?.[+m[1]] ?? 0 : 0);
}
const continent = (g: GameState, n: number) => (n >= 0 ? g.cmNationCont?.[n] ?? -1 : -1);
const human = (g: GameState, c: number) => !!c && g.clubs[c]?.manager === -1;

/** 0x5407e0(spiller, seer, 0) med 0x5408c0: omdømmet set fra den falske post i 0x8d1130 (nationalitet = købers land, klub = køberen) */
function repSeenByBuyer(g: GameState, p: Player, seller: Club | undefined, buyer: Club): number {
  const [H, C, W] = reps(p);
  let code: number;
  if (seller && (seller.id === buyer.id || seller.nation === buyer.nation)) code = 0;
  else if (p.nation === buyer.nation || !cmForeign(g, buyer.nation, p.nation)) code = 2;
  else if (seller && !cmForeign(g, buyer.nation, seller.nation)) code = 3;
  else code = H + s16(clubRepMem(g, buyer.id)) >= 14000 ? 3 : 4;
  const half = (v: number) => ftol(v / 2);
  return s16(code === 4 ? W : code === 2 ? H : code === 0 ? C : code === 3 ? half(W) + half(H) : half(C) + half(H));
}

export interface TransferNewsIn {
  /** spillerens klub før handlen (kontraktens klub, 0x4cf5a0) – undefined = fri */
  seller?: Club;
  /** gebyret (€) og eventuelt beløbet efter 25 kampe (klausul +0x35/+0x39) */
  fee: number; addOn?: number;
  /** byttehandel: spillernes værdi (€) */
  swap?: number[];
  /** buddet selv (de andre bud på spilleren tæller med for flag 4) */
  offerId?: number;
}

/** 0x8e7b50(offer, 0, 0, 0, 0, 1) uden formuebåndet (1,0): gebyret + (1 − 25·0,005)·klausulen + byttespillernes værdi (+0x52), i £ */
function weightedValue(g: GameState, x: TransferNewsIn): number {
  let v = Math.round(x.fee * GBP);
  if (x.addOn && x.addOn > 0) v += ftol((1 - 25 * 0.005) * Math.round(x.addOn * GBP));
  for (const id of x.swap ?? []) v += Math.round((g.players[id]?.value ?? 0) * GBP);
  return v | 0;
}

/**
 * 0x8dbef0 + 0x8d1130: får den aktive menneskelige manager (g.userClub, g.manager) nyheden om, at `buyer` køber `p`?
 * (Kaldes for menneskets egen handel også – så er han køber/sælger og får den altid.)
 */
export function transferNewsToMe(g: GameState, p: Player, buyer: Club, x: TransferNewsIn): boolean {
  if (human(g, buyer.id)) return true;                                       // 0x8dc30f: send_to_all_managers
  const M = g.clubs[g.userClub];
  if (!M) return false;                                                      // kun managere med klub (klubbernes managere / +0x39)
  const seller = x.seller;
  // flag 2 / 1: sælger og køber (menneske)
  if (seller && M.id === seller.id) return true;
  if (M.id === buyer.id) return true;
  // flag 4: moderklubben ved leje (kontrakten 0x4cf6d0 hos en anden end køberen) og de andre bydende mennesker
  const parent = p.loan?.from;
  if (parent && p.club !== buyer.id && parent === M.id) return true;
  if (g.offers.some((o) => o.id !== x.offerId && o.player === p.id && o.buyer === M.id && o.buyer !== buyer.id
    && (o.status === 'pending' || o.status === 'negotiating' || o.status === 'countered' || o.status === 'accepted'))) return true;
  // flag 8: mennesker med spilleren på shortlisten (ikke køberen)
  if (g.shortlist?.includes(p.id) && M.id !== buyer.id) return true;
  // flag 0x10 / 0x40
  const [H, C, W] = reps(p);
  const sellerDiv = divisionOf(g, seller), buyerDiv = divisionOf(g, buyer);
  const w = weightedValue(g, x);
  // 0x8d160f: købers planlægger-plads for spilleren (rolle 0xb, gruppe < 3) og gebyret (+0x1b) ≥ £1.000.000
  const slot = g.cmPlan?.[buyer.id]?.s.find((r) => r[3] === p.id && r[0] === 0xb);
  let buyerDivFlag = !!slot && ((slot[2] & 0x1e) < 6) && Math.round(x.fee * GBP) >= 1_000_000;
  let all = false, cont = false, nat = false, sellerDivFlag = false;
  const conts: number[] = [], nats: number[] = [];
  const ax = x.swap?.length ? 500 : s16(ftol(3000 - w * 0.0006));
  const cap = (v: number) => Math.min(v, 9750);
  const T3 = cap(ax + 7200);
  if (W > cap(ax + 9200)) all = true;
  else if (W > cap(ax + 8300)) {
    cont = true;
    conts.push(continent(g, p.nation), seller ? continent(g, seller.nation) : -1, continent(g, buyer.nation));
  } else if (H > T3 || C > T3) {
    nat = true;
    const natP = H > T3 ? p.nation : -1;
    const natS = C > T3 && seller ? seller.nation : -1;
    let natB = -1;
    if (buyer.nation !== natP && buyer.nation !== natS) {
      const n85 = (((g.cmNation85?.[buyer.nation] ?? 0) << 24) >> 24) - 10;
      if (W > T3 || w >= 500000 * n85) natB = buyer.nation;
      // (+0x22 > 20 og landsholdskontrakten +0x24 med omdømme > 5500: spillerne har ingen landsholdskontrakt hos os)
    }
    nats.push(natP, natS, natB);
  } else {
    if (sellerDiv) {
      const lim = 350 * divRep(g, sellerDiv);
      if ((C > lim && C > 2500) || 9.0 - C * 0.00025 < statAvg(p, 2, 0x12, 6.5)) sellerDivFlag = true;
    }
    if (buyerDiv) {
      if (repSeenByBuyer(g, p, seller, buyer) > 350 * divRep(g, buyerDiv) && C > 1500) buyerDivFlag = true;
    }
  }
  // 0x8d1a8a: de menneskelige managere – her den aktive
  const mNat = g.manager.nation ?? -1;
  if (all) return true;
  if (cont) {
    const mc = mNat >= 0 ? continent(g, mNat) : -1, cc = continent(g, M.nation);
    return (mc >= 0 && conts.includes(mc)) || (cc >= 0 && conts.includes(cc));
  }
  if (nat) {
    const set = nats.filter((n) => n >= 0);
    if (mNat >= 0 && set.includes(mNat)) return true;
    if (set.includes(M.nation)) return true;
    const eng = g.nations.findIndex((n) => n.name === 'England'), sco = g.nations.findIndex((n) => n.name === 'Scotland');
    if (mNat >= 0 && mNat === eng && set.includes(sco)) return true;
    if (mNat >= 0 && mNat === sco && set.includes(eng)) return true;
    return false;
  }
  const myDiv = divisionOf(g, M);
  if (sellerDivFlag && myDiv && myDiv === sellerDiv) return true;
  if (buyerDivFlag && myDiv && myDiv === buyerDiv) return true;
  return false;
}

/** 0x6a2e00 / 0x6a1b00: nyheden om, at en (computer)manager kommer til/forlader klubben `c` – får den aktive manager den? */
export function clubNewsToMe(g: GameState, c: number, humanManager = false): boolean {
  const club = g.clubs[c];
  if (!club) return false;
  // 0x6a2e8c / 0x544820: klubben skal spille i en kørende liga i et valgt land
  if (!divisionOf(g, club) || !g.activeNations.includes(club.nation)) return false;
  if (humanManager || s16(clubRepMem(g, c)) > 7250) return true;         // send_to_all_managers
  // send_to_nation_managers 0x7863f0: managerens klub ELLER landshold i landet
  const me = g.clubs[g.userClub];
  return (!!me && me.nation === club.nation) || g.manager.national?.nation === club.nation;
}
