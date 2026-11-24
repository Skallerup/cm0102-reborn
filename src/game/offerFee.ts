import type { TransferOffer } from './types';

/** Beløbet i svaret under et bud på menneskets spiller (0x8d3520, "… have asked for {fee}"): et modbud til computerens køber står i
 *  cmCounter (add_transfer_negotiation 0x8be9d0) – counter/fee er stadig køberens bud (ejerens fund 24/11, Beckham) */
export function offerAnswerFee(o: TransferOffer): number {
  return o.status === 'countered' ? (o.cmCounter?.fee ?? o.counter ?? o.fee) : (o.counter ?? o.fee);
}
