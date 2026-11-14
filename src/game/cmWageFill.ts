// Spilstartens udfyldning af manglende lønninger – Shortlist_Manager 0x83a1b0 (0x83a246–0x83a65d, cm0102.exe 3.9.68, læst instruktion for
// instruktion 14/11-2026) efter trupplanen 0x83cb40: for hver person med klub (et B-hold → moderklubben via 0x540a50(klub, &ud, 1), ud = 0) og
// en kontrakt med klubben (0x4cf5f0), hvis løn +0xc = −1 (0x85e960 satte −1: ingen løn i databasen, eller over 15 · omdømmet):
//   +0xc = ftol(0x862720(staff, klub, 1, kontraktens trupstatus +0x4f >> 4, 0xb, 0))
// og for udlændinge (staff +0x1a ≠ klubbens land +0x53) et blødt loft efter klubbens land (0x83a2e8–0x83a656):
//   [0x9cf484]: over 1000 → (w − 1000)·0,5 + 1000, derefter over 2500 → (w − 2500)·0,5 + 2500
//   [0x9cf314]/[0x9cf300]/[0x9cf45c]/[0x9cf338]: over 20000 → ·0,25          [0x9cf4a8]: professionel over 500, ellers over 250 → ·0,25
//   [0x9cf510]/[0x9cf2fc]/[0x9cf2dc]/[0x9cf3e4]: professionel over 200, ellers 100 → ·0,15     [0x9cf2c0]/[0x9cf408]: 350/250 → ·0,1
//   [0x9cf244]/[0x9cf434]: gulvet 5·L² (L = trunc(omdømme/500) + 1, byte), så 500/250 → ·0,2
//   [0x9cf2e4]/[0x9cf360]/[0x9cf488]/[0x9cf36c]/[0x9cf4f8]: intet · alle andre lande: over 25000 → ·0,25
// (Bagefter værdien +0x52 = 0x4d0c60 for alle – ikke her.) Ingen tilfældige tal.
import { type CmCtx, type CmMem, ftol, OUT_SCRATCH } from './cmMem';
import { contractForClub_4cf5f0 } from './cmContractWant';
import { linkedClub_540a50 } from './cmClubLinks';
import { defaultWageUnset_862720 } from './cmWage';

const NAT = (m: CmMem, a: number) => m.s32(a);

/** 0x83a2d0–0x83a656: klubbens lands bløde loft for en udlænding (w = 0x862720's løn, trunkeret) */
export function foreignCap_83a2d0(m: CmMem, staff: number, club: number, w: number): number {
  const nat = m.u32(club + 0x53);
  if (!nat || m.u32(staff + 0x1a) === nat) return w;
  const L = ((Math.trunc(m.s16(club + 0x80) / 500) + 1) << 24) >> 24;
  const n = m.s32(nat);
  const is = (...a: number[]) => a.some((x) => n === NAT(m, x));
  const soft = (t: number, k: number) => { if (w > t) w = ftol((w - t) * k + t); };
  const pro = m.u8(club + 0x64) === 1;
  if (n === NAT(m, 0x9cf484)) { soft(1000, 0.5); soft(2500, 0.5); }
  else if (is(0x9cf314, 0x9cf300, 0x9cf45c, 0x9cf338)) soft(20000, 0.25);
  else if (n === NAT(m, 0x9cf4a8)) soft(pro ? 500 : 250, 0.25);
  else if (is(0x9cf510, 0x9cf2fc, 0x9cf2dc, 0x9cf3e4)) soft(pro ? 200 : 100, 0.15);
  else if (is(0x9cf2c0, 0x9cf408)) soft(pro ? 350 : 250, 0.1);
  else if (is(0x9cf244, 0x9cf434)) { const f = 5 * L * L; if (f > w) w = f; soft(pro ? 500 : 250, 0.2); }
  else if (is(0x9cf2e4, 0x9cf360, 0x9cf488, 0x9cf36c, 0x9cf4f8)) { /* intet */ }
  else soft(25000, 0.25);
  return w;
}

/** 0x83a264–0x83a65d for én person: den udfyldte løn (eller null, når kontrakten har en løn / ingen klub) – skriver +0xc som originalen */
export function fillUnsetWage_83a1b0(c: CmCtx, staff: number): number | null {
  const m = c.m;
  let club = m.u32(staff + 0x39);
  if (club) {
    m.w32(OUT_SCRATCH, 0);
    const p = linkedClub_540a50(m, club, OUT_SCRATCH, 1) >>> 0;
    if (p && m.u32(OUT_SCRATCH) === 0) club = p;
  }
  if (!club) return null;
  const k = contractForClub_4cf5f0(c, staff, club);
  if (!k || m.s32(k + 0xc) !== -1) return null;
  let w = ftol(defaultWageUnset_862720(c, staff, club, 1, m.u8(k + 0x4f) >> 4, 0xb, 0));
  m.w32(k + 0xc, w);
  w = foreignCap_83a2d0(m, staff, club, w);
  m.w32(k + 0xc, w);
  return w;
}
