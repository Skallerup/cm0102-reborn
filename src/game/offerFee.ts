import type { TransferOffer } from './types';

/** Beløbet i svaret under et bud på menneskets spiller (0x8d3520, "… have asked for {fee}"): et modbud til computerens køber står i
 *  cmCounter (add_transfer_negotiation 0x8be9d0) – counter/fee er stadig køberens bud (ejerens fund 24/11, Beckham) */
export function offerAnswerFee(o: TransferOffer): number {
  return o.status === 'countered' ? (o.cmCounter?.fee ?? o.counter ?? o.fee) : (o.counter ?? o.fee);
}

/** Buddets tilstand +0x2c i TRANSFER_MANAGER's tabel, som 0x8d3520/0x8e19c0 læser den ved visningen (bud-id = plads 6/7): det åbne bud
 *  (samme tal som cmShortlistGame.ts writeOffers) eller det lukkede, originalen endnu har (cmTmKept); undefined = ikke i tabellen */
export function cmOfferState(g: { offers: TransferOffer[]; cmTmKept?: { id: number; st: number }[] }, id: number): number | undefined {
  const o = g.offers.find((x) => x.id === id);
  if (o?.status === 'accepted' && o.cmFut) return 0x13;
  if (o && (o.status === 'pending' || o.status === 'negotiating' || o.status === 'countered')) {
    return o.cmDelay ? 0x12 : o.status === 'pending' ? 0 : o.status === 'countered' ? (o.cmAi ? 1 : 2) : o.cmK ? (o.loan ? 8 : 7) : 5;
  }
  return g.cmTmKept?.find((k) => k.id === id)?.st;
}
