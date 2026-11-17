// CM 01/02: klubbens Transfers-skærm, visningen "Future Transfers" (club_screens.cpp 0x4542f0; listen bygges af 0x8ccb80).
// Rækkerne er klubbens igangværende handler (TRANSFER_OFFER, ikke leje): status ud fra tilbuddets tilstand (+0x2c) – 0 Offer (åbent bud),
// 1 Negotiation (1), 2 Contract (5–8), 3 Work Permit (0xa), 4 Confirmation (0xb–0xd), 5 Delayed (0x11/0x12), 6 = aftalt skifte (0xe/0x13), hvor
// kolonnen viser datoen. Rækken er "to {klub}" (ud) eller "from {klub}" / "from Free Transfer" (ind); beløbet er buddet (type Exch med byttespillere, Bos
// ved Bosman, ellers Free). Skjulte rækker: computer–computer-bud vises kun, hvis buddet er offentligt (+0x2d), aftalt (6) eller en menneskeklub er med.
// Hos os: pending→0, countered→1, accepted/negotiating→2, cmTalks.state 5→4 (5 ved Delay), aftalt = en forhåndsaftale (Player.contract.futureClub, 6).
// Work Permit (3) har vi ikke som tilstand (*ikke porteret*).
import type { GameState } from './types';
import { isHumanClub } from './humans';

export interface FutureRow {
  /** 0 Offer · 1 Negotiation · 2 Contract · 3 Work Permit · 4 Confirmation · 5 Delayed · 6 aftalt (vis datoen) */
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  pid: number;
  /** den anden klub (−1 = fri) */
  other: number;
  /** true: spilleren forlader klubben ("to …") */
  out: boolean;
  fee: number;
  /** 0 Free · 1 Exch (byttehandel) · 4 Bos (Bosman) */
  kind: 0 | 1 | 4;
  date?: string;
}

export function futureTransfers(g: GameState, cid: number): FutureRow[] {
  const rows: FutureRow[] = [];
  const humanView = isHumanClub(cid);
  for (const o of g.offers) {
    if (o.loan || (o.buyer !== cid && o.seller !== cid)) continue;
    let status: FutureRow['status'];
    if (o.status === 'pending') status = 0;
    else if (o.status === 'countered') status = 1;
    else if (o.status === 'accepted') status = 2;
    else if (o.status === 'negotiating') status = o.cmTalks?.state === 5 ? (o.cmTalks.delayUntil && o.cmTalks.delayUntil > g.date ? 5 : 4) : 2;
    else continue;
    const incoming = o.buyer === cid;
    const other = incoming ? (o.seller || -1) : o.buyer;
    if (!humanView && !o.pub && !isHumanClub(o.buyer) && !isHumanClub(o.seller)) continue;
    rows.push({ status, pid: o.player, other, out: !incoming, fee: o.fee, kind: o.swap?.length ? 1 : !o.seller && !o.fee ? 4 : 0 });
    // byttespillerne går den modsatte vej (fee 0, Exch)
    for (const sp of o.swap ?? []) rows.push({ status, pid: sp, other: incoming ? o.seller : o.buyer, out: incoming, fee: 0, kind: 1 });
  }
  // aftalte skifter (Bosman/forhåndsaftale): spilleren skifter, når kontrakten udløber
  for (const p of Object.values(g.players)) {
    const f = p.contract?.futureClub;
    if (!f || p.loan) continue;
    if (f === cid) rows.push({ status: 6, pid: p.id, other: p.club || -1, out: false, fee: 0, kind: 4, date: p.contract!.expires });
    else if (p.club === cid) rows.push({ status: 6, pid: p.id, other: f, out: true, fee: 0, kind: 4, date: p.contract!.expires });
  }
  return rows;
}
