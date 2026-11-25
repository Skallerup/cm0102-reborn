// CM 01/02: forløbet efter et accepteret transferbud (en CM-database i ægte tilstand – cmLogic: den originale og 2026/27). Kilder: cm0102.exe 3.9.68.
//
// TRANSFER_MANAGER::accept_transfer_bid 0x8c0080: tilstand +0x2c = 5, runder +0x2e = 0, nyheden 0xfa3 (0x8d76d0/0x8d7870: "<Player> transfer offer
//   accepted" – "{Seller} have accepted the offer from {Buyer} for <Player>."). Standardtiming (+0x11 = 0xb): Shortlist_Manager 0x846920(spiller,
//   køber, 0, 0, status (1 for menneskets køber), &grund) < 0,75 ([0x969040]) → spilleren afviser skiftet (0x8d8310, nyheden 0xfae "<Player> rejects
//   move to {Club}"), tilstand 0xf, runder 3 – ellers, med en menneskeklub i handlen, nyheden 0xfac (0x8d7cd0/0x8d7fb0: "Offer contract to <Player>"
//   – "{Seller} have given {Buyer} permission to discuss a contract with <Player>.") med knappen Offer Contract (0x8f1950 → 0x4dd0f0 → Offer
//   Contract-skærmen). Tilbuddet planlægges næste tidspunkt; process_due_offer 0x8c63a0 sætter tilstand 9 for menneskets køber og planlægger +10
//   dage, men tilstand 9 behandles ikke, når den forfalder – der er ingen frist for at tilbyde en kontrakt.
// Spillerens afvisning (0x8d8310, nyheden 0xfae): teksten bygges af 0x8d84e0 → 0x8e4ae0 ud fra bitmasken fra 0x846920 – "<Player> has rejected the move
//   to {Club} because he <grund>." med højst to grunde (cmWhy nedenfor; tallet for interessen sendes som 0, så "not yet ready" (bit 1) udgår).
// Kontraktnyhedens anden afsnit læses levende (0x8e7f10, tilbuddets +0x10): 1 → "{Buyer} have offered a contract.", 4 → "{Buyer} have decided to
//   withdraw the transfer bid." (0xa94b48 – hovedspilleren; 0xa94b98 "decided not to offer a contract" er bytte-spillerens).
// Tilbuddet (Offer → add_contract_offer 0x4cc490): spilleren svarer efter 1–5 dage (0x4cd230: rand(5) + 1; klubbens svartid 0x8cc5b0 kan
//   forkorte den – ikke porteret, *estimeret*) i resolve_contract_offers 0x4ce4e0 (cmContractGame.ts cmContractAnswer). Ja → nyheden 0xfa4
//   ("<Player> accepts {Club} offer" – "<Player> has agreed terms with {Club}.") og, for mennesket, "Confirm Transfer Offer" (0x8f2ec0,
//   cmConfirm* nedenfor): kontrollen 0x8cfc90 giver 0 (Confirm Transfer Offer: Back · No · Delay · Yes), 1 (Delay Transfer Offer: Back · Cancel · Delay –
//   fx for lidt penge) eller 2 (Transfer Cancelled: Back). Yes → 0x8c3310 (handlen gennemføres), No/Cancel → buddet trækkes tilbage (0x8bfcb0),
//   Delay → 0x8c36b0 ("Delay the transfer for a week ?"). Nej (0x8c28c0) → +0x10 = 4,
//   tilstand 0xf, runder + 1 (menneskets køber, ikke leje), planlagt +10 dage; nyheden 0xfa4 "<Player> rejects {Club}" – "… has rejected the contract
//   offer from {Club}." og, mens runderne er under 3, "However, he is willing to negotiate terms." (*estimeret*: hvornår 0x8d9480 vælger den variant).
//   Når tilbuddet forfalder i tilstand 0xf (0x8c6708): runder < 3 → runder = 3 og +10 dage; ellers fjernes det (0x8d0f60, ingen nyhed).
import type { ContractClauses, GameState, Player, TransferOffer } from './types';
import { addNews, gs } from './state';
import { asOwner } from './humans';
import { addDays, year } from './dates';
import { cmLogic, cmRand } from './cmPlayerData';
import { cmGbp } from './cmMoney';
import { cmContractAnswer, cmMoveCheck, cmOfferScreenData, cmTalkDemand, cmTalkStatus, type CmOfferTerms, type CmTerms } from './cmContractGame';
import { cmBoardWageAllowGbp } from './cmBudget';
import { isHumanClub } from './humans';
import { regionOf } from './leagues';
import { cmCheckOffer } from './cmOfferCheck';
import { expectedStatus, type SquadStatus } from './squadStatus';

/** Set Role At Club: forvalget ("* expected by the player") efter hans plads i KØBERENS trup */
export function cmRoleExpected(g: GameState, p: Player, buyer: number): SquadStatus {
  return expectedStatus(p, Object.values(g.players).filter((x) => x.club === buyer && !x.loan), g.date);
}

/** Forhandlingen på et accepteret bud (TransferOffer.cmTalks) */
export interface CmTalks {
  /** +0x2e: afviste tilbud (3 = endeligt) */
  rounds: number;
  /** +0x10: 0 intet tilbud endnu, 1 tilbudt, 4 afvist, 5 enig om vilkårene – venter på menneskets "Confirm Transfer Offer" */
  state: 0 | 1 | 4 | 5;
  /** de aftalte vilkår (state 5) */
  agreed?: { wage: number; years: number; clauses?: ContractClauses };
  /** Delay (0x8c36b0): bekræftelsen kommer igen først på denne dato (en uge, *estimeret*) */
  delayUntil?: string;
  /** spillerens svar (0x4cd230) */
  due?: string;
  /** menneskets tilbud */
  terms?: { wage: number; years: number; clauses?: ContractClauses };
}

const pname = (p: Player) => `${p.first} ${p.last}`.trim();
const short = (g: GameState, id: number) => g.clubs[id]?.short || g.clubs[id]?.name || '';

/** Gælder forløbet for dette bud? (originalens database i ægte tilstand, transfer – ikke leje, ikke fri spiller) */
export function cmTalksOn(g: GameState, o: TransferOffer): boolean {
  return cmLogic(g) && !o.loan && !!o.seller && !o.preContract;
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
  const chk = cmMoveCheck(g, p, o.buyer);
  if (chk && chk.x < 0.75) {
    o.cmTalks = { rounds: 3, state: 4 };
    o.status = 'collapsed';
    const why = cmWhy(g, p, o.buyer, chk.mask).join('|');
    asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmRejectsMove', params: why ? { ...params, why } : params, link: { kind: 'player', id: p.id } }));
    return;
  }
  asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmTalks', params, link: { kind: 'offer', id: o.id } }));
}

/** Knappen Offer Contract i nyheden (0x8f1950): tilbuddet er stadig åbent (ikke tilstand 3 – hos os: ikke lukket) */
export function cmTalksOpen(g: GameState, o: TransferOffer | undefined): o is TransferOffer {
  return !!o && !!o.cmTalks && o.cmTalks.state !== 5 && o.status === 'negotiating' && o.buyer === g.userClub && g.players[o.player]?.club === o.seller;
}

const CONTINENT = ['europe', 'africa', 'asia', 'northAmerica', 'southAmerica', 'oceania'];

/** Grundene til afvisningen (0x8e4ae0): "k" eller "k:argument", højst to, i originalens rækkefølge. `mask` = *out_reasons fra 0x846920 (bitmasken i
 *  notes/board/notes-G2-interest.md §10). Argumenter: klubbens eller nationens navn, turneringens navn, verdensdelens nummer. */
export function cmWhy(g: GameState, p: Player, buyer: number, mask: number): string[] {
  const m = mask >>> 0;
  const from = p.club ? g.clubs[p.club] : undefined, to = g.clubs[buyer];
  const cn = from ? from.short || from.name : '';
  // bit 31: ensom grund – han vil vente til sæsonens slutning
  if (m & 0x80000000) return ['wait'];
  const out: string[] = [];
  // første grund (kun én): 8 svært at forlade, 0x20 rival, 0x400 glad for klubben, 0x1000 glad for rollen, 0x100000 netop kommet
  if (m & 8) out.push(`hard:${cn}`);
  else if (m & 0x20) out.push(`rival:${cn}`);
  else if (m & 0x400) out.push(`happy:${cn}`);
  else if (m & 0x1000) out.push(`role:${cn}`);
  else if (m & 0x100000) out.push(`recent:${cn}`);
  // 0x400000: turneringen han spiller i nu (personposten +0x1db; hos os den kontinentale turnering, klubben er med i)
  if (m & 0x400000 && p.club) {
    const c = Object.values(gs().comps).find((x) => x.type === 'continental' && x.clubs.includes(p.club!));
    if (c) out.push(`comp:${c.name}`);
  }
  // [esp+0xf]: samme nation (+0x53) – så ingen reserve-, nations- eller sprogårsag
  const same = !!from && !!to && from.nation === to.nation;
  if (out.length < 2) {
    if (!same && m & 0x80000) out.push('reserves');
    else if (m & 0x8000) {
      // samme nation og klubben nedenunder er i en lavere række → "drop down"; ellers "unless guaranteed first team football"
      const lt = from ? g.leagues[from.league]?.tier : undefined, bt = to ? g.leagues[to.league]?.tier : undefined;
      out.push(same && lt !== undefined && bt !== undefined && bt > lt ? 'drop' : 'guarantee');
    }
  }
  if (out.length < 2) {
    if (!same && m & 0x1000000) out.push(`nation:${g.nations[to?.nation ?? -1]?.name ?? ''}`);
    else if (m & 0x2000000) out.push(`continent:${Math.max(0, CONTINENT.indexOf(regionOf(g.nations[to?.nation ?? -1]?.name)))}`);
    else if (!same && m & 0x10000) out.push('language');
  }
  if (out.length < 2 && m & 0x20000000) out.push('longterm');
  return out.slice(0, 2);
}

/** Spillerens krav på Offer Contract-skærmen (0x85fc50) */
export function cmTalksDemand(o: TransferOffer, role: SquadStatus | undefined = o.cmRole): CmTerms | null {
  const g = gs();
  const p = g.players[o.player];
  return p ? cmTalkDemand(g, p, o.buyer, role) : null;
}

/** Offer Contract 0x4e06e0, grenen 0x4e0ff9–0x4e118b: teksten, når spilleren ikke vil forhandle (kravet ≥ 1,5 × bestyrelsens loft) – efter
 *  trupstatussen (1–2 uden tilføjelse, 3 rotation, 4 backup, 5 hot prospect, 6 youngster) og med grundene 0x8e4ae0 (`why`, cmWhy), når
 *  interessen 0x846920 er over 1,25 */
export function cmNoInterest(g: GameState, p: Player, buyer: number, role?: SquadStatus): { key: string; why: string } {
  const st = cmTalkStatus(g, p, buyer, role);
  const chk = cmMoveCheck(g, p, buyer);
  const why = chk && chk.x > 1.25 ? cmWhy(g, p, buyer, chk.mask).join('|') : '';
  const base = st === 3 ? 'cm.neg.noIntRot' : st === 4 ? 'cm.neg.noIntBackup' : st === 5 ? 'cm.neg.noIntProspect' : st === 6 ? 'cm.neg.noIntYouth' : 'cm.neg.noIntTerms';
  return { key: why ? `${base}.because` : base, why };
}

/** 0x4e06e0 0x4e0950–0x4e0ab4: lønloftet `bx` efter trupstatussen og køberens omdømme (+0x80) – ftol; status 4 og 6: 0 */
function statusWageBx(status: number, rep: number): number {
  const t = (x: number) => Math.trunc(x) | 0;
  if (status === 1) return rep > 0x1c52 ? t(rep * 1.25 + 10000) : rep > 0x186a ? t(rep + 7500) : rep > 0x128e ? t(rep * 0.75 + 2500) : 0;
  if (status === 2) return rep > 0x1c52 ? t(rep + 7500) : rep > 0x186a ? t(rep * 0.75 + 5000) : rep > 0x128e ? t(rep * 0.5) : 0;
  if (status === 3) return rep > 0x1c52 ? t(rep * 0.75 + 5000) : rep > 0x186a ? t(rep * 0.5 + 2500) : rep > 0x128e ? t(rep * 0.25) : 0;
  if (status === 5) return rep > 0x1c52 ? t(rep * 0.5) : rep > 0x186a ? t(rep * 0.25) : 0;
  return 0;
}

/** Offer Contract 0x4e06e0 for en spiller fra en anden klub eller en klubløs (ikke forlængelse): står kravet ("expects a wage of …"), eller en
 *  "no interest"-tekst? Null = kravet. W = kravets løn (+0xc, £), p18 = bestyrelsens loft (0x5968d0), p16 = 0x4ce450, vilje = parameter 0x1a · 0,001:
 *  – W < 1,5·p18 (0x4e0ad5): vilje > 2,75 → kravet; ellers (job 0xb) alder ≥ 24 → no interest; W ≥ bx + 3250 (statusWageBx) → no interest; ellers kravet
 *  – no interest (0x4e0d97 → 0x4e0ef4): grundene 0x8e4ae0 (bl). 1,5·p18 ≥ p16 → teksten efter trupstatussen (0x4e0ff9: 1–2 uden tilføjelse, 3 rotation,
 *    4 backup, 5 hot prospect, 6 youngster; "because he …", når der er grunde og viljen er over 1,25); ellers (0x4e0f1f) vilje ≥ 3,15, W < 175.000 og
 *    kontrakttype ≠ 1 → kravet; grunde → "… because he …"; vilje < 0,75 → "has absolutely no interest in joining {club}"; ellers "no interest". */
export function cmOfferScreen(g: GameState, p: Player, buyer: number, role?: SquadStatus): { key: string; why: string } | null {
  const d = cmOfferScreenData(g, p, buyer, role);
  const p18 = cmBoardWageAllowGbp(g, p, buyer, role);
  if (!d || p18 === null) return null;
  const W = d.wageGbp, will = d.will;
  if (p18 * 1.5 > W) {
    if (will > 2.75) return null;
    if (d.age < 0x18 && W < statusWageBx(d.status, d.rep) + 0xcb2) return null;
  }
  const why = cmWhy(g, p, buyer, d.mask).join('|');
  if (p18 * 1.5 >= d.p16) {
    const st = d.status;
    const base = st === 3 ? 'cm.neg.noIntRot' : st === 4 ? 'cm.neg.noIntBackup' : st === 5 ? 'cm.neg.noIntProspect' : st === 6 ? 'cm.neg.noIntYouth' : 'cm.neg.noIntTerms';
    return why && will > 1.25 ? { key: `${base}.because`, why } : { key: base, why: '' };
  }
  if (!(will < 3.15) && W < 0x2ab98 && d.type !== 1) return null;
  if (why) return { key: 'cm.neg.noIntTerms.because', why };
  if (will < 0.75) return { key: 'cm.neg.noIntJoin', why: '' };
  return { key: 'cm.neg.noIntTerms', why: '' };
}

const expiryOf = (g: GameState, years: number) => `${year(g.date) + Math.max(1, years)}-06-30`;

/** Menneskets kontrakt i originalens felter: bonusserne i £ (mål, assist – spillets Appearance Bonus, *estimeret* –, clean sheet), Minimum Fee-klausulen */
export function offerTerms(g: GameState, wage: number, years: number, cl: ContractClauses = {}, buyer?: number): CmOfferTerms {
  const b = (v?: number) => (v && v > 0 ? Math.round(v * cmGbp(g, buyer)) : -1);
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
    const ans = cmContractAnswer(g, p, o.buyer, offerTerms(g, wage, years, clauses, o.buyer), o.cmRole);
    if (ans?.accept) { cmAgreed(o, p, { wage, years, clauses }, complete); return; }
    // 0x8c28c0
    const rounds = Math.min(3, t.rounds + 1);
    o.cmTalks = { rounds, state: 4 };
    o.respondBy = addDays(g.date, 10);
    asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmRejects', params: { ...params, again: rounds < 3 ? 1 : 0 }, link: { kind: 'offer', id: o.id } }));
    return;
  }
  // Delay: efter en uge kommer bekræftelsen igen (nyheden sendes igen, *estimeret*)
  if (t.state === 5 && t.delayUntil && g.date >= t.delayUntil) {
    t.delayUntil = undefined;
    asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmAgrees', params, link: { kind: 'offer', id: o.id } }));
    return;
  }
  if (t.state === 4 && g.date >= o.respondBy) {
    if (t.rounds < 3) { t.rounds = 3; o.respondBy = addDays(g.date, 10); }
    else o.status = 'collapsed';
  }
}

/** 0x4ce4e0 ja: "<Player> accepts {Club} offer". Menneskets køber skal bekræfte (0x8f2ec0), computerens handel gennemføres straks */
export function cmAgreed(o: TransferOffer, p: Player, terms: { wage: number; years: number; clauses?: ContractClauses }, complete: (o: TransferOffer, wage: number, years: number, clauses?: ContractClauses) => void): void {
  const g = gs();
  const params = { player: pname(p), last: p.last || pname(p), seller: short(g, o.seller), buyer: short(g, o.buyer) };
  const human = isHumanClub(o.buyer);
  asOwner(o.buyer, () => addNews({ cat: 'transfer', key: 'transfer.cmAgrees', params, link: human ? { kind: 'offer', id: o.id } : { kind: 'player', id: p.id } }));
  // også forkontrakten (Bosman) og den klubløse: Offer Contract-skærmen laver et transferbud (0x4e50ef → add_transfer_offer 0x8be300, beløb 0)
  // før kontrakttilbuddet, så 0x4ce4e0 går gennem 0x8c2180 → 0x8c2f50, og menneskets køber skal bekræfte (0x8f2ec0: "Sign X from Y?" / "Sign X?")
  if (!human) { complete(o, terms.wage, terms.years, terms.clauses); return; }
  o.cmTalks = { ...(o.cmTalks ?? { rounds: 0 }), state: 5, agreed: terms };
}

// ---------------------------------------------------------------- Confirm Transfer Offer (0x8f2ec0)

/** Knappen Respond i "accepts {Club} offer": bekræftelsen venter (ikke udsat) */
export function cmConfirmOpen(g: GameState, o: TransferOffer | undefined): o is TransferOffer {
  const t = o?.cmTalks;
  return !!o && !!t && t.state === 5 && !!t.agreed && !(t.delayUntil && g.date < t.delayUntil) && o.status === 'negotiating' && o.buyer === g.userClub && g.players[o.player]?.club === o.seller;
}

/** Skærmen: kontrollen 0x8cfc90 (cmOfferCheck.ts: 0 = Confirm Transfer Offer, 1 = Delay Transfer Offer – for lidt penge (grund 3) eller trupplads (4),
 *  2 = Transfer Cancelled – udlændingegrænsen (0x14) eller transfervinduet (9)) og spørgsmålet (0xaa047c "Sign X from Y for Z?", uden beløb 0xaa03bc,
 *  med byttespillere 0xaa0294 "for Z plus …" / 0xaa014c "in a swap deal for …"). Teksterne ved fejl: 0xaa000c (3), 0xa9ff74 (4), 0xa9fd24 (0x14); grund 9 har ingen. */
export function cmConfirmScreen(g: GameState, o: TransferOffer): { code: 0 | 1 | 2; reason: number; params: Record<string, string | number>; key: string } {
  const p = g.players[o.player];
  const { code, reason } = cmCheckOffer(g, o);
  const swap = (o.swap ?? []).map((id) => g.players[id]).filter(Boolean).map(pname);
  const list = swap.length < 2 ? swap.join('') : `${swap.slice(0, -1).join(', ')} and ${swap[swap.length - 1]}`;
  const params = { player: pname(p), club: short(g, o.seller), buyer: short(g, o.buyer), fee: o.fee, list };
  // uden kontraktklub (den klubløse, 0x8f365f): 0xaa0390 "Sign X?"
  const key = code === 0 ? (swap.length ? (o.fee > 0 ? 'cm.confirm.plus' : 'cm.confirm.swap') : o.fee > 0 ? 'cm.confirm.fee' : o.seller ? 'cm.confirm.free' : 'cm.confirm.noClub')
    : reason === 3 ? 'cm.confirm.funds' : reason === 4 ? 'cm.confirm.squad' : reason === 0x14 ? 'cm.confirm.foreign' : '';
  return { code, reason, params, key };
}

/** Svaret: Yes (0x8c3310 – handlen gennemføres), No/Cancel (buddet trækkes tilbage 0x8bfcb0), Delay (0x8c36b0 – en uge, *estimeret*). Back lukker kun. */
export function cmConfirmAnswer(o: TransferOffer, answer: 'yes' | 'no' | 'delay', complete: (o: TransferOffer, wage: number, years: number, clauses?: ContractClauses) => void): 'completed' | 'withdrawn' | 'delayed' | 'refused' {
  const g = gs();
  if (!cmConfirmOpen(g, o)) return 'refused';
  const a = o.cmTalks!.agreed!;
  if (cmConfirmScreen(g, o).code === 2) return 'refused';   // Transfer Cancelled: kun Back
  if (answer === 'yes') {
    if (cmConfirmScreen(g, o).code !== 0) return 'refused';
    complete(o, a.wage, a.years, a.clauses);
    return 'completed';
  }
  if (answer === 'delay') { o.cmTalks!.delayUntil = addDays(g.date, 7); return 'delayed'; }
  o.status = 'withdrawn';
  return 'withdrawn';
}

// ---------------------------------------------------------------- bytte-spillerne til menneskets sælger (0x8c0080, 0x8d7cd0, 0x8c63a0, 0x8c28c0, 0x8c2f50)
//
// Computerens bud på menneskets spiller med bytte-spillere (typisk efter menneskets modbud "ask for player in exchange" → 0x8c0810's endelige bud):
// når mennesket accepterer (accept_transfer_bid 0x8c0080), gennemgås hver bytte-spiller: hans ønskede løn hos sælgeren (0x85fc50) over 1,5 ×
// sælgerens lønloft (0x5968d0) → han afviser skiftet (0x8d8910, nyheden 0xfaf "<X> removed from transfer deal"), ud af listen, fee += hans værdi.
// Er mennesket med i handlen, sender 0x8d7cd0 én nyhed 0xfac pr. bytte-spiller til menneskets sælger ("Offer contract to <X>" – "{Køber} have given
// {Sælger} permission to discuss a contract with <X>.", flaget 0xa = 1: andet afsnit "have offered a contract" / "have decided not to offer a
// contract"). process_due_offer 0x8c63a0, tilstand 7 med menneskets sælger: tilstand 8 og +10 dage – tilstand 8 behandles ikke, når den forfalder,
// så der er ingen frist. Mennesket tilbyder hver bytte-spiller en kontrakt (Offer Contract → add_contract_offer 0x4cc490); svaret efter 1–5 dage
// (0x4cd230, 0x4ce4e0). Ja → 0xfa4 "<X> accepts {Sælger} offer" og flaget = 2 (0x8c2180). Nej (0x8c28c0, bytte-grenen) → ud af handlen, fee +=
// hans værdi (0x4d0c60), nyheden 0xfa4 ("… He is removed from {Køber}'s offer for <spiller> with the transfer fee being increased to …"), og
// computerens køber vurderer buddet igen på stedet (0x8c0810 med keep_existing = 1: trækker det eller justerer beløbet). Når hovedspilleren og alle
// bytte-spillere er enige (0x8c2f50), gennemføres handlen (computerens køber bekræfter 0x8c3310).
// Ikke porteret: hovedspillerens eget kontraktforløb hos computerens køber (tilstand 5 → 0x8c1e40) – han afgøres som før ved accepten.

/** Gælder bytte-forhandlingen? Menneskets sælger, computerens køber, transfer med bytte-spillere (spil med originalens marked) */
export function cmSwapOn(o: TransferOffer, marketOn: boolean): boolean {
  return marketOn && !o.loan && !!o.seller && !!o.swap?.length && isHumanClub(o.seller) && !isHumanClub(o.buyer);
}

/** 0x8c0080 (bytte-delen) + 0x8d7cd0. `tooDear` = bytte-spillerne, hvis lønkrav er over 1,5 × sælgerens loft (cmExchangeCheck); `valueOf` = værdien
 *  0x4d0c60. Returnerer true, når handlen venter på menneskets forhandlinger (ellers gennemføres den som uden bytte). */
export function cmSwapAccept(o: TransferOffer, p: Player, tooDear: Set<number>, valueOf: (x: Player) => number): boolean {
  const g = gs();
  const ids = (o.swap ?? []).filter((id) => g.players[id]?.club === o.buyer);
  const params = (x: Player) => ({ player: pname(x), last: x.last || pname(x), seller: short(g, o.buyer), buyer: short(g, o.seller), player2: pname(p) });
  for (const id of ids.slice()) {
    if (!tooDear.has(id)) continue;
    const x = g.players[id];
    const old = o.fee;
    o.fee += valueOf(x);
    ids.splice(ids.indexOf(id), 1);
    asOwner(o.seller, () => addNews({ cat: 'transfer', key: 'transfer.cmSwapOut', params: { ...params(x), fee: o.fee, ...(o.fee > old ? { adj: 1 } : {}) }, link: { kind: 'player', id: x.id } }));
  }
  o.swap = ids.length ? ids : undefined;
  if (!ids.length) return false;
  o.status = 'negotiating';
  o.respondBy = addDays(g.date, 3650);
  o.cmSwapTalks = Object.fromEntries(ids.map((id) => [id, { rounds: 0, state: 0 as const }]));
  for (const id of ids) {
    const x = g.players[id];
    asOwner(o.seller, () => addNews({ cat: 'transfer', key: 'transfer.cmSwapTalks', params: { ...params(x), pid: x.id }, link: { kind: 'offer', id: o.id } }));
  }
  return true;
}

/** Knappen Offer Contract i "Offer contract to <X>" (bytte-spilleren): handlen er åben, og der er endnu intet tilbud (eller han har ikke svaret nej) */
export function cmSwapOpen(g: GameState, o: TransferOffer | undefined, pid: number): o is TransferOffer {
  const t = o?.cmSwapTalks?.[pid];
  return !!o && !!t && t.state === 0 && o.status === 'negotiating' && o.seller === g.userClub && g.players[pid]?.club === o.buyer
    && g.players[o.player]?.club === o.seller;
}

/** Offer Contract-skærmens syn på forhandlingen med bytte-spilleren: han er "spilleren", menneskets sælger "køberen" */
export function cmSwapView(o: TransferOffer, pid: number): TransferOffer {
  const t = o.cmSwapTalks?.[pid];
  return { ...o, player: pid, buyer: o.seller, seller: o.buyer, fee: 0, swap: undefined, cmTalks: t ? { rounds: t.rounds, state: t.state, agreed: t.agreed, terms: t.terms, due: t.due } : { rounds: 0, state: 0 }, cmRole: t?.role, cmSwapTalks: undefined };
}

/** Set Role At Club for bytte-spilleren */
export function cmSwapRole(o: TransferOffer, pid: number, role: SquadStatus): boolean {
  const t = o.cmSwapTalks?.[pid];
  if (!t) return false;
  t.role = role;
  return true;
}

/** Offer (0x4cc490): tilbuddet til bytte-spilleren gemmes, svaret om 1–5 dage (0x4cd230) */
export function cmSwapOffer(o: TransferOffer, pid: number, wage: number, years: number, clauses?: ContractClauses): 'cmSent' | 'refused' {
  const g = gs();
  if (!cmSwapOpen(g, o, pid)) return 'refused';
  const t = o.cmSwapTalks![pid];
  const r = cmRand(g.seed ?? 0, pid, o.seller, o.id, (t.rounds + 1) * 7919, 0x4cd230);
  o.cmSwapTalks![pid] = { ...t, state: 1, due: addDays(g.date, r(5) + 1), terms: { wage, years, clauses } };
  return 'cmSent';
}

/** Dagligt: bytte-spillernes svar (0x4ce4e0 → 0x8c2180/0x8c28c0) og, når alle er enige, handlen (0x8c2f50). `review` = 0x8c0810(keep_existing = 1):
 *  false = køberen trak buddet. */
export function cmSwapDaily(o: TransferOffer, complete: (o: TransferOffer) => void, review: (o: TransferOffer) => boolean, valueOf: (x: Player) => number): void {
  const g = gs();
  const talks = o.cmSwapTalks;
  if (!talks || o.status !== 'negotiating') return;
  const p = g.players[o.player];
  if (!p || p.club !== o.seller) { o.status = 'collapsed'; return; }
  // bytte-spillere, der ikke længere er i køberens trup, er ude af handlen
  // (remove_exchange_player 0x8c41c0: hans værdi lægges til beløbet)
  for (const k of Object.keys(talks)) {
    const x = g.players[+k];
    if (x?.club === o.buyer || !o.swap?.includes(+k)) continue;
    delete talks[+k];
    o.swap = o.swap.filter((id) => id !== +k);
    if (x) o.fee += valueOf(x);
  }
  if (!o.swap?.length) o.swap = undefined;
  for (const k of Object.keys(talks)) {
    const id = +k, t = talks[id], x = g.players[id];
    if (t.state !== 1 || !o.swap?.includes(id) || !t.due || g.date < t.due || !t.terms || !x) continue;
    const { wage, years, clauses } = t.terms;
    const ans = cmContractAnswer(g, x, o.seller, offerTerms(g, wage, years, clauses, o.seller), t.role);
    const params = { player: pname(x), last: x.last || pname(x), seller: short(g, o.buyer), buyer: short(g, o.seller), club: short(g, o.buyer), player2: pname(p) };
    if (ans?.accept) {
      talks[id] = { ...t, state: 5, agreed: { wage, years, clauses } };
      asOwner(o.seller, () => addNews({ cat: 'transfer', key: 'transfer.cmAgrees', params, link: { kind: 'player', id } }));
      continue;
    }
    // 0x8c28c0 (bytte-grenen): ud af handlen (tilstand 4 – nyhedens "have offered a contract" står), fee += hans værdi
    talks[id] = { ...t, state: 4 };
    o.swap = o.swap?.filter((s) => s !== id);
    if (!o.swap?.length) o.swap = undefined;
    o.fee += valueOf(x);
    asOwner(o.seller, () => addNews({ cat: 'transfer', key: 'transfer.cmSwapRejects', params: { ...params, fee: o.fee }, link: { kind: 'player', id } }));
    if (!review(o)) return;
  }
  // 0x8c2f50: alle (tilbageværende) bytte-spillere er enige
  if (o.status === 'negotiating' && (o.swap ?? []).every((id) => talks[id]?.state === 5)) complete(o);
}
