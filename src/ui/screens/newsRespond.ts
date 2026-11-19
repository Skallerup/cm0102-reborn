// CM 01/02: nyheder, der SKAL besvares, før spillet kan gå videre. Nyhedsknappen 0x782b70 (thiscall item; staff, tekst, 0x7d0, &handler)
// giver 0 (ingen knap), 1 (knap, frivillig: Appeal, Ultimatum, Nominations, View Draw, Reply, Details, Negotiate på et afslag) eller
// 2 (knap, svar påkrævet). Nyhedsskærmen sætter "response screen", når den viste nyhed giver 2 (0x789044 → 0x75db00(4, 1)), og sidebaren
// tegner da Continue Game gråt (0x7619a1: 0x7fed30 ≠ 0 og 0x7fedd0 = 0 → knappen uden handling, farve 0x2c). Trykkes Continue Game på en
// anden skærm, går 0x5cdefb/0x76210e via 0x787350(m, 1) (ringen nyeste → ældste: en nyhed, der giver 2, eller en ulæst vigtig) tilbage til
// nyhedsskærmen 0x788010(m, 1), som vælger den ældste af dem (prioritet 1, ">=" i 0x7888c2). Kun på ferie (0x5fd210) eller med
// [0xdd6bec] svarer spillet selv (NewsItem::auto_respond 0x784100).
// Typerne med 2 og deres betingelser (ellers 0/1): 6/9 venskabskampforslag (0x5c5570/0x5c5310 → 0x4740c0/0x474720, kampen kan stadig aftales),
// 0x16 (0x9035a0 → 0x49cc60), 0x18/0x19 (0x85aec0/0x85b020), 0x1e landsholdets trupudtagelse (0x76f1a0 → 0x7798c0, felt 2 = 0), 0x22 en
// udtaget spiller skal erstattes (0x7701f0 → 0x77a140, kun samme dag), 0x28 (0x56fab0 → 0x5708f0), 0xbbf transferønsket (0x4dca40, ikke
// besvaret), 0xbb8 kontraktforhandling i tilstand 3 (Negotiate 0x4e5770), 0xbc1 (0x8f66d0), medienyhederne 0xbd0/0xbd9/0xbdd/0xbdf/0xbe6/
// 0xbe8/0xfbc (Select Media Response 0x741f50, ikke besvaret), 0xfa0 bud på egen spiller (0x8f1730, buddet i tilstand 0), 0xfa2 modbud
// (0x8f1830), 0xfac Offer Contract (0x8f1950), 0xfa4 med felt 6 = 3 (Negotiate), 0xfa5 Confirm Transfer Offer (0x8f2d20, tilstand 0xb/0xd),
// 0xfab (0x8f1a60), 0xfb4 Re-Negotiate (0x8f1b40), 0xfb5 (0x8f1c30), 0xfc0 (0x8f93b0), 0x1774 jobtilbuddet (0x6b2450, felt 1 = 0).
// Frivillige (1): 0x1c Nominations, 0x27 View Draw, 0x7d2/0x7d3 Appeal, 0xbc2 Offer Contract, 0xfa4 felt 6 = 4 Negotiate (afslaget, runde < 3),
// 0xfc1 Details, 0x1388 Reply, 0x1786 Ultimatum.
import type { GameState, NewsItem } from '../../game/types';
import { squadNumbersDue } from '../../game/squadNumbers';
import { euroDue } from '../../game/euroSquad';
import { cmRumourOpen } from '../../game/cmRumours';
import { requestOpen } from '../../game/cmTransferList';
import { cmConfirmOpen, cmTalksOpen } from '../../game/cmTransferTalks';
import { cmActive, cmStaffDelayOpen, cmStaffOn } from '../../game/cmStaff';
import { cmFrProposalOpen } from '../../game/cmFriendlyOffers';

const offerOf = (g: GameState, n: NewsItem) => n.link?.kind === 'offer' ? g.offers.find((o) => o.id === Number(n.link!.id)) : undefined;

/** 0x782b70 = 2: nyheden kræver et svar (knappen Respond / Offer Contract / Confirm), før Continue Game kan bruges */
export function newsMustRespond(g: GameState, n: NewsItem | undefined): boolean {
  if (!n) return false;
  // 0xfa0: bud på egen spiller, der venter på svar
  const o = offerOf(g, n);
  if (o && o.status === 'pending' && o.seller === g.userClub) return true;
  // 6/9: venskabskampforslaget
  if (n.key === 'cmfr.proposal' && n.link?.kind === 'club' && cmFrProposalOpen(g, String(n.params?.date ?? ''), Number(n.link.id))) return true;
  // Squad Numbers og European Squad (målt i originalen 9/11: Continue Game grå, til listen er sendt)
  if (n.key === 'sqn.request' && squadNumbersDue(g.userClub)) return true;
  if (n.key === 'eur.request' && euroDue(g.userClub)) return true;
  // medienyhederne (Select Media Response) og transferønsket 0xbbf
  if (cmRumourOpen(g, n) || requestOpen(g, n)) return true;
  // 0x1774: jobtilbuddet (felt 1 = 0, ikke besvaret)
  if (n.key === 'news.jobOffer' && n.link?.kind === 'club' && g.jobOffers.includes(Number(n.link.id))) return true;
  // 0xfa5 Confirm Transfer Offer (også stabens "Delay Transfer Offer")
  if (cmStaffOn(g) && cmStaffDelayOpen(g, n)) return true;
  if (n.key === 'transfer.cmAgrees' && cmConfirmOpen(g, o)) return true;
  // 0xfac Offer Contract (de andre databaser i ægte tilstand: "X have accepted your offer" → Offer Contract)
  if (n.key === 'transfer.cmTalks' && cmTalksOpen(g, o)) return true;
  if (!cmActive(g) && (n.key === 'transfer.bidAccepted' || n.key === 'transfer.releaseMet') && o && o.status === 'negotiating' && o.buyer === g.userClub) return true;
  return false;
}

/** 0x787350(m, 1) → 0x788010(m, 1): den ældste nyhed i ringen (de sidste 100), der er ulæst eller kræver svar */
export function newsDue(g: GameState): NewsItem | undefined {
  // (ulæste ud over ringen vises også – vores liste er længere end originalens 100 pr. manager)
  for (let i = g.news.length - 1; i >= 0; i--) if (!g.news[i].read || (i < 100 && newsMustRespond(g, g.news[i]))) return g.news[i];
  return undefined;
}
