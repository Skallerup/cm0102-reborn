// Computerens bud på menneskets spillere med originalens vilkår (kun den originale database i ægte tilstand): TRANSFER_OFFER-posten laves af
// build_bid 0x8e5d60 (beløb, månedlige rater +0x40, videresalg +0x3f, beløb efter N ligakampe +0x35/+0x39, efter N landskampe +0x3a/+0x3e,
// offentligt +0x2d) på en hukommelse af sælgerens og køberens klubber – som 0x84a020 make_club_bids kalder den (this = posten, staff, klub,
// pladsen, pladsens +7, 0, &ud). Med ønskelisterne slået til (cmShortlistGame.ts) kommer vilkårene fra 0x84a020 selv; dette er vejen for
// bud, spillet laver uden dem (transfers.ts cmBidsForListed).
import type { GameState, Player } from './types';
import { getContract, clubAt } from './cmMem';
import { buildSlMem, type SlMem } from './cmShortlistGame';
import { cmRand } from './cmPlayerData';
import { slCall } from './cmShortlist';
import { humanClub_600a50 } from './cmWageGame';
import { hasActiveReleaseClause_867b50 } from './cmContractWant';

const dayNum = (iso: string) => Math.round(Date.parse(iso.slice(0, 10) + 'T00:00:00Z') / 86400000);
const s8 = (v: number) => (v << 24) >> 24;
const SLOT_ADR = 0x5f0f0000, REC_ADR = 0x5f0f1000, OUT_ADR = 0x5f0f2000;

export interface AiBidTerms {
  /** £ (originalens pund) */
  fee: number; months: number; sellOn: number; lgFee: number; lgApps: number; intFee: number; intApps: number; pub: number;
}

/** hukommelsen for dagen (adapterne til 0x840d80 m.fl. er ønskelisternes – ~0,5 s at bygge, deles af dagens bud) */
let cache: { g: GameState; date: string; S: SlMem } | null = null;
function memFor(g: GameState): SlMem {
  if (cache && cache.g === g && cache.date === g.date) return cache.S;
  const S = buildSlMem(g);
  cache = { g, date: g.date, S };
  return S;
}

/** build_bid(køber, spiller, værdisætning M i £) – null, hvis originalens funktion ikke vil byde (returnerer 0) */
export function cmBuildBid(g: GameState, p: Player, buyer: number, maxGbp: number): AiBidTerms | null {
  const home = p.loan?.from ?? p.club;
  if (!home || home === buyer) return null;
  const S = memFor(g);
  const M = S.M;
  const st = M.W.staffOf(p), seller = M.W.clubOf(home), club = M.W.clubOf(buyer);
  if (!st || !club || !seller) return null;
  const m = M.c.m;
  M.setRand(cmRand(g.seed ?? 0, buyer, p.id, dayNum(g.date), 0x8e5d60));
  {
    const k = getContract(m, st), cl = k ? clubAt(m, m.s32(k + 4)) : 0;
    let v = k && cl ? slCall(M.c, 0x4d0c60, 0, st, cl, 0, -1, humanClub_600a50(M.c, cl) ? 1 : 0) | 0 : 0;
    if (k && hasActiveReleaseClause_867b50(m, k) && v > m.s32(k + 0x21)) v = m.s32(k + 0x21);
    m.w32(st + 0x52, v);
  }
  // pladsen (0x25 bytes): rolle 0xb (spiller), +7 = værdisætningen, +0xf = målet, +0x13/+0x17 = −1 (ingen indehaver, intet bud)
  const max = Math.max(0, Math.round(maxGbp));
  for (let i = 0; i < 0x25; i++) m.w8(SLOT_ADR + i, 0);
  m.w8(SLOT_ADR, 0xb); m.w32(SLOT_ADR + 7, max); m.w32(SLOT_ADR + 0xf, m.s32(st)); m.w32(SLOT_ADR + 0x13, -1); m.w32(SLOT_ADR + 0x17, -1);
  for (let i = 0; i < 0x48; i++) m.w8(REC_ADR + i, 0);
  m.w32(OUT_ADR, 0);
  slCall(M.c, 0x8e5680, REC_ADR);
  const ok = slCall(M.c, 0x8e5d60, REC_ADR, st, club, SLOT_ADR, max, 0, OUT_ADR);
  if (!ok) return null;
  const pos = (v: number) => Math.max(0, v);
  return { fee: pos(m.s32(REC_ADR + 0x1b)), months: pos(s8(m.u8(REC_ADR + 0x40))), sellOn: pos(s8(m.u8(REC_ADR + 0x3f))),
    lgFee: pos(m.s32(REC_ADR + 0x35)), lgApps: m.u8(REC_ADR + 0x39) || 10, intFee: pos(m.s32(REC_ADR + 0x3a)), intApps: m.u8(REC_ADR + 0x3e) || 10, pub: m.u8(REC_ADR + 0x2d) };
}
