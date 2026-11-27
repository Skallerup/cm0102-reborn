// CM 01/02: originalens bud (TRANSFER_MANAGER-posten, 0x41 bytes) har ingen sælger – +8 er køberen, +0xc spilleren, og sælgeren er altid
// spillerens kontraktklub (get_contract 0x4cf5a0 → kontrakten +4) i hvert led: process_due_offer 0x8c63a0, finalise_transfer 0x8c9390,
// collapse_offers_for_player 0x8c47d0. Et bud følger altså spilleren: efter en handel er de andre bud på ham bud til den NYE klub
// (try_complete_offer 0x8c34e0 → 0x8c6ae0 fjerner kun hovedspilleren fra de andre buds byttelister – remove_exchange_player 0x8c41c0 – og
// lader byttespillernes bud falde, 0x8c47d0). Vi gemmer sælgeren i buddet (TransferOffer.seller); disse hjælpere holder den lig kontraktklubben.
import type { GameState, TransferOffer } from './types';

/** buddet er stadig til spillerens klub: sælgeren er hans klub eller (udlejet) moderklubben; et bud til en klubløs, så længe han er klubløs */
export function offerLive(g: GameState, o: TransferOffer): boolean {
  const p = g.players[o.player];
  if (!p) return false;
  if (!o.seller) return !p.club;
  return o.seller === p.club || o.seller === p.loan?.from;
}

const OPEN: TransferOffer['status'][] = ['pending', 'countered', 'negotiating'];
/** åbent bud (ikke et aftalt fremtidigt skifte – add_future_transfer 0x8cb9a0, status 'accepted') */
export const offerOpen = (o: TransferOffer) => OPEN.includes(o.status);

/** Efter en handel (ikke leje – sign_loan_contract 0x4d01e0 flytter ikke hovedkontrakten): de andre åbne bud på spilleren, hvor et menneske er
 *  part (køber, den gamle eller den nye klub). Ventende bud (tilstand 0) går videre til den nye klub som i originalen: et computerbud til
 *  menneskets klub bliver et bud til mennesket (svaret 0x8c63a0: ubesvaret på svardagen → tilstand 4, ingen nyhed – processOffers trækker det),
 *  menneskets bud går til den nye klub (som svarer på dagen). Køberen er den nye klub → buddet trækkes; et computerbud, der var til mennesket og nu
 *  står til en computerklub, trækkes (computer ↔ computer-svaret kører kun for ønskelisternes bud – cmAiAiDue). Forhandlinger, der var i gang med
 *  den gamle klub (modbud, kontraktforhandling), falder. Rene computerbud røres ikke (cmAiAiDue lukker dem på svardagen). */
export function offersFollowPlayer(g: GameState, done: TransferOffer, isHuman: (club: number) => boolean): void {
  const p = g.players[done.player];
  if (!p || done.loan) return;
  const home = p.loan?.from ?? p.club;
  for (const x of g.offers) {
    if (x === done || x.player !== p.id || !offerOpen(x) || offerLive(g, x)) continue;
    if (!isHuman(x.buyer) && !isHuman(x.seller) && !isHuman(home)) continue;
    if (x.status !== 'pending' || x.buyer === home || (!isHuman(x.buyer) && !isHuman(home)) || x.signing || x.cmLoanH || x.cmK) {
      x.status = x.status === 'pending' ? 'withdrawn' : 'collapsed';
      continue;
    }
    x.seller = home;
    if (x.cmAi) {
      // et computerbud fra ønskelisterne er nu et bud til mennesket: det besvares som andre bud til ham (cmRespond)
      x.cmAi = undefined; x.cmTime = undefined; x.cmUntil = undefined; x.cmDelay = undefined; x.cmR = undefined;
    }
  }
}

/** Indlæsning af ældre spil: åbne bud, hvor et menneske er part, og sælgeren ikke længere er spillerens klub (før porten stod de som aktive
 *  bud, og et accepteret bud kunne sælge spilleren en gang til) – de trækkes. Returnerer antallet. */
export function dropStaleOffers(g: GameState, isHuman: (club: number) => boolean): number {
  let n = 0;
  for (const x of g.offers ?? []) {
    if (!offerOpen(x) || offerLive(g, x)) continue;
    const p = g.players[x.player];
    const home = p ? p.loan?.from ?? p.club : 0;
    if (!isHuman(x.buyer) && !isHuman(x.seller) && !isHuman(home)) continue;
    x.status = x.status === 'pending' ? 'withdrawn' : 'collapsed';
    n++;
  }
  return n;
}
