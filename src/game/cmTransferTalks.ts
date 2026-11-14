// CM 01/02: forløbet efter et accepteret transferbud (kun den originale database i ægte tilstand – cmActive). Kilder: cm0102.exe 3.9.68.
//
// TRANSFER_MANAGER::accept_transfer_bid 0x8c0080: tilstand +0x2c = 5, runder +0x2e = 0, nyheden 0xfa3 (0x8d76d0/0x8d7870: "<Player> transfer offer
//   accepted" – "{Seller} have accepted the offer from {Buyer} for <Player>."). Standardtiming (+0x11 = 0xb): Shortlist_Manager 0x846920(spiller,
//   køber, 0, 0, status (1 for menneskets køber), &grund) < 0,75 ([0x969040]) → spilleren afviser skiftet (0x8d8310, nyheden 0xfae "<Player> rejects
//   move to {Club}"), tilstand 0xf, runder 3 – ellers, med en menneskeklub i handlen, nyheden 0xfac (0x8d7cd0/0x8d7fb0: "Offer contract to <Player>"
//   – "{Seller} have given {Buyer} permission to discuss a contract with <Player>.") med knappen Offer Contract (0x8f1950 → 0x4dd0f0 → Offer
//   Contract-skærmen). Tilbuddet planlægges næste tidspunkt; process_due_offer 0x8c63a0 sætter tilstand 9 for menneskets køber og planlægger +10
//   dage, men tilstand 9 behandles ikke, når den forfalder – der er ingen frist for at tilbyde en kontrakt.
// Kontraktnyhedens anden afsnit læses levende (0x8e7f10, tilbuddets +0x10): 1 → "{Buyer} have offered a contract.", 4 → "{Buyer} have decided to
//   withdraw the transfer bid." (0xa94b48 – hovedspilleren; 0xa94b98 "decided not to offer a contract" er bytte-spillerens).
// Tilbuddet (Offer → add_contract_offer 0x4cc490): spilleren svarer efter 1–5 dage (0x4cd230: rand(5) + 1; klubbens svartid 0x8cc5b0 kan
//   forkorte den – ikke porteret, *estimeret*) i resolve_contract_offers 0x4ce4e0 (cmContractGame.ts cmContractAnswer). Ja → nyheden 0xfa4
//   ("<Player> accepts {Club} offer" – "<Player> has agreed terms with {Club}.") og handlen gennemføres (0x8c2f50 → 0x8c3310; menneskets
//   bekræftelse "Confirm Transfer Offer" 0x8f2ec0 er ikke bygget – handlen gennemføres samme dag, timing-nibble 0 = i dag). Nej (0x8c28c0) → +0x10 = 4,
//   tilstand 0xf, runder + 1 (menneskets køber, ikke leje), planlagt +10 dage; nyheden 0xfa4 "<Player> rejects {Club}" – "… has rejected the contract
//   offer from {Club}." og, mens runderne er under 3, "However, he is willing to negotiate terms." (*estimeret*: hvornår 0x8d9480 vælger den variant).
//   Når tilbuddet forfalder i tilstand 0xf (0x8c6708): runder < 3 → runder = 3 og +10 dage; ellers fjernes det (0x8d0f60, ingen nyhed).
import type { ContractClauses, GameState, Player, TransferOffer } from './types';
import { addNews, gs } from './state';
import { asOwner } from './humans';
import { addDays, year } from './dates';
import { cmActive, cmRand } from './cmPlayerData';
import { cmContractAnswer, cmMoveInterest, cmTalkDemand, type CmOfferTerms, type CmTerms } from './cmContractGame';

/** Forhandlingen på et accepteret bud (TransferOffer.cmTalks) */
export interface CmTalks {
  /** +0x2e: afviste tilbud (3 = endeligt) */
  rounds: number;
  /** +0x10: 0 intet tilbud endnu, 1 tilbudt, 4 afvist */
  state: 0 | 1 | 4;
  /** spillerens svar (0x4cd230) */
  due?: string;
  /** menneskets tilbud */
  terms?: { wage: number; years: number; clauses?: ContractClauses };
}

const GBP = 0.86;
const pname = (p: Player) => `${p.first} ${p.last}`.trim();
const short = (g: GameState, id: number) => g.clubs[id]?.short || g.clubs[id]?.name || '';

/** Gælder forløbet for dette bud? (originalens database i ægte tilstand, transfer – ikke leje, ikke fri spiller) */
export function cmTalksOn(g: GameState, o: TransferOffer): boolean {
  return cmActive(g) && !o.loan && !!o.seller && !o.preContract;
}

/** 0x8c0080: sælgeren har accepteret menneskets bud */
export function cmAcceptBid(o: TransferOffer, p: Player): void {
  const g = gs();
  const params = { player: pname(p), last: p.last || pname(p), seller: short(g, o.seller), buyer: short(g, o.buyer) };
  o.status = 'negotiating';
  o.cmTalks = { rounds: 0, state: 0 };
  // ingen frist (tilstand 9 forfalder ikke) – respondBy bruges kun af det gamle forløb
  o.respondBy = addDays(g.date, 3650);
  asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmAccepted', params, link: { kind: 'player', id: p.id } }));
  const x = cmMoveInterest(g, p, o.buyer);
  if (x !== null && x < 0.75) {
    o.cmTalks = { rounds: 3, state: 4 };
    o.status = 'collapsed';
    asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmRejectsMove', params, link: { kind: 'player', id: p.id } }));
    return;
  }
  asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmTalks', params, link: { kind: 'offer', id: o.id } }));
}

/** Knappen Offer Contract i nyheden (0x8f1950): tilbuddet er stadig åbent (ikke tilstand 3 – hos os: ikke lukket) */
export function cmTalksOpen(g: GameState, o: TransferOffer | undefined): o is TransferOffer {
  return !!o && !!o.cmTalks && o.status === 'negotiating' && o.buyer === g.userClub && g.players[o.player]?.club === o.seller;
}

/** Spillerens krav på Offer Contract-skærmen (0x85fc50) */
export function cmTalksDemand(o: TransferOffer): CmTerms | null {
  const g = gs();
  const p = g.players[o.player];
  return p ? cmTalkDemand(g, p, o.buyer) : null;
}

const expiryOf = (g: GameState, years: number) => `${year(g.date) + Math.max(1, years)}-06-30`;

/** Menneskets kontrakt i originalens felter: bonusserne i £ (mål, assist – spillets Appearance Bonus, *estimeret* –, clean sheet), Minimum Fee-klausulen */
export function offerTerms(g: GameState, wage: number, years: number, cl: ContractClauses = {}): CmOfferTerms {
  const b = (v?: number) => (v && v > 0 ? Math.round(v * GBP) : -1);
  return {
    wage, expires: expiryOf(g, years), signOn: cl.signOn ?? 0, partTime: !!cl.partTime,
    bonusGbp: [b(cl.goalBonus), b(cl.appBonus), b(cl.cleanSheetBonus)],
    clauses: [0, cl.release ? 1 : 0, 0, 0, 0], clauseFee: cl.release ?? 0,
  };
}

/** Offer (add_contract_offer 0x4cc490): tilbuddet gemmes, svaret kommer om 1–5 dage (0x4cd230) */
export function cmOfferContract(o: TransferOffer, wage: number, years: number, clauses?: ContractClauses): 'cmSent' | 'refused' {
  const g = gs();
  if (!cmTalksOpen(g, o)) return 'refused';
  const p = g.players[o.player];
  const r = cmRand(g.seed ?? 0, p.id, o.buyer, o.id, (o.cmTalks!.rounds + 1) * 7919, 0x4cd230);
  o.cmTalks = { ...o.cmTalks!, state: 1, due: addDays(g.date, r(5) + 1), terms: { wage, years, clauses } };
  return 'cmSent';
}

/** Dagligt (processOffers): svarene og tilstand 0xf's frister */
export function cmTalksDaily(o: TransferOffer, complete: (o: TransferOffer, wage: number, years: number, clauses?: ContractClauses) => void): void {
  const g = gs();
  const t = o.cmTalks;
  if (!t || o.status !== 'negotiating') return;
  const p = g.players[o.player];
  if (!p || p.club !== o.seller) { o.status = 'collapsed'; return; }
  const params = { player: pname(p), last: p.last || pname(p), seller: short(g, o.seller), buyer: short(g, o.buyer) };
  if (t.state === 1 && t.due && g.date >= t.due && t.terms) {
    const { wage, years, clauses } = t.terms;
    const ans = cmContractAnswer(g, p, o.buyer, offerTerms(g, wage, years, clauses));
    if (ans?.accept) {
      asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmAgrees', params, link: { kind: 'player', id: p.id } }));
      complete(o, wage, years, clauses);
      return;
    }
    // 0x8c28c0
    const rounds = Math.min(3, t.rounds + 1);
    o.cmTalks = { rounds, state: 4 };
    o.respondBy = addDays(g.date, 10);
    asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmRejects', params: { ...params, again: rounds < 3 ? 1 : 0 }, link: { kind: 'offer', id: o.id } }));
    return;
  }
  if (t.state === 4 && g.date >= o.respondBy) {
    if (t.rounds < 3) { t.rounds = 3; o.respondBy = addDays(g.date, 10); }
    else o.status = 'collapsed';
  }
}
