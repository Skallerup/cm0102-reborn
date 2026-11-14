// Klubbernes kæder i cm0102.exe 3.9.68 (transfer/kontrakt runde 2, 13/11-2026), oversat instruktion for instruktion:
//   0x540a50 get_linked_club(club, &erFørstehold, flag): B-/reserveholdet ↔ moderklubben. Kun klubber i [0x9cf488]/[0x9cf314]/[0x9cf434];
//            parrene er globale klub-id'er ([0x9d012c] ↔ [0x9d0130] …, sat ved indlæsningen, −1 = ikke i spillet). Et førstehold giver
//            ud = 1 og reserveholdet, et reservehold ud = 0 og moderklubben; uden par (−1) nulstilles club +0x244 og svaret er 0.
//            flag ≠ 0 og club +0x244 = 0 → 0 uden at se på parrene. Ingen klub → fejltekst (0x5e8290) og 0.
//   0x669bd0 club_in_season(club, &start, &slut): sæsonens start (+0x2a) og slut (+0x39, Date) i landets sæsonpost (0xb63d60 à 0x48 bytes,
//            standard 0xb63e38) mod dagens dato – kun svaret er porteret (ud-pegerne skal være 0, ellers c.call).
//   0x53d7f0 (club): klub i [0x9cf488] og en af de 23 klubber [0x9d0120] …
import { type CmCtx, type CmMem } from './cmMem';

/** parrene (førstehold, reservehold) i 0x540a50's rækkefølge */
const LINKS: [number, number][] = [[0x9d012c, 0x9d0130], [0x9d0120, 0x9d0134], [0x9d0138, 0x9d013c], [0x9d0140, 0x9d0144], [0x9d0148, 0x9d014c], [0x9d0150, 0x9d0154], [0x9d0158, 0x9d015c], [0x9d0160, 0x9d0164], [0x9d0168, 0x9d016c], [0x9d0170, 0x9d0174], [0x9d0178, 0x9d017c], [0x9d0180, 0x9d0184], [0x9d0188, 0x9d018c], [0x9d0190, 0x9d0194], [0x9d0198, 0x9d019c], [0x9d0128, 0x9d01a0], [0x9d0254, 0x9d0258], [0x9d02e4, 0x9d0328], [0x9d03ac, 0x9d03b0], [0x9d03b4, 0x9d03b8], [0x9d03bc, 0x9d03c0], [0x9d03c4, 0x9d03c8], [0x9d0124, 0x9d03d4], [0x9d03d8, 0x9d03dc], [0x9d03e0, 0x9d03e4], [0x9d03e8, 0x9d03ec], [0x9d03f0, 0x9d03f4], [0x9d03f8, 0x9d03fc], [0x9d0400, 0x9d0404], [0x9d0408, 0x9d040c], [0x9d0410, 0x9d0414], [0x9d0418, 0x9d041c], [0xb63cdc, 0xb63c9c], [0xb63cbc, 0xb63ca0], [0xb63ce8, 0xb63cac], [0xb63cd8, 0xb63cd0], [0xb63cb4, 0xb63cb0], [0xb63cd4, 0xb63ca8], [0xb63ce4, 0xb63cec], [0xb63cf0, 0xb63cf8], [0xb63cc0, 0xb63d00], [0xb63cc8, 0xb63ccc], [0xb63ce0, 0xb63cb8], [0xb63cc4, 0xb63cf4], [0xb63cfc, 0xb63ca4], [0x9d02a4, 0x9d02a8], [0x9d02ac, 0x9d02b0], [0x9d02b4, 0x9d02b8], [0x9d02bc, 0x9d02c0], [0x9d02c4, 0x9d02c8], [0x9d02cc, 0x9d02d0], [0x9d02d4, 0x9d02d8], [0x9d02dc, 0x9d02e0], [0x9d0440, 0x9d0444], [0x9d0448, 0x9d044c], [0x9d0450, 0x9d0454], [0x9d0458, 0x9d045c], [0x9d0460, 0x9d0464], [0x9d0468, 0x9d046c], [0x9d0470, 0x9d0474], [0x9d0478, 0x9d047c], [0x9d0480, 0x9d0484], [0x9d0488, 0x9d048c], [0x9d0490, 0x9d0494], [0x9d0498, 0x9d049c], [0x9d04a0, 0x9d04a4], [0x9d04a8, 0x9d04ac], [0x9d04b0, 0x9d04b4], [0x9d04b8, 0x9d04bc], [0x9d04c0, 0x9d04c4], [0x9d04c8, 0x9d04cc], [0x9d04d0, 0x9d04d4], [0x9d04d8, 0x9d04dc], [0x9d04e0, 0x9d04e4], [0x9d04e8, 0x9d04ec], [0x9d04f0, 0x9d04f4], [0x9d04f8, 0x9d04fc], [0x9d0500, 0x9d0504], [0x9d0508, 0x9d050c], [0x9d0510, 0x9d0514], [0x9d0518, 0x9d051c], [0x9d0520, 0x9d0524]];

/** 0x540a50 – ud skrives som originalen (kun når pegeren ≠ 0) */
export function linkedClub_540a50(m: CmMem, club: number, out: number, flag: number): number {
  if (!club) return 0;
  const nat = m.u32(club + 0x53);
  if (!nat) return 0;
  if (flag && m.u8(club + 0x244) === 0) return 0;
  const n = m.s32(nat);
  if (n !== m.s32(0x9cf488) && n !== m.s32(0x9cf314) && n !== m.s32(0x9cf434)) return 0;
  const id = m.s32(club);
  let first = -1;
  for (const [a] of LINKS) if (id === m.s32(a)) { first = 1; break; }
  if (first < 0) for (const [, b] of LINKS) if (id === m.s32(b)) { first = 0; break; }
  if (first < 0) return 0;
  if (out) m.w32(out, first);
  let to: number | null = null;
  if (first) { for (const [a, b] of LINKS) if (id === m.s32(a)) { to = m.s32(b); break; } }
  else for (const [a, b] of LINKS) if (id === m.s32(b)) { to = m.s32(a); break; }
  if (to === null || (first ? to === -1 : !(to > -1))) { m.w8(club + 0x244, 0); return 0; }
  return (m.u32(0xae23b4) + 0x245 * to) >>> 0;
}

/** 0x669bd0 – svaret (1 = i sæsonen); ud-pegerne ≠ 0 går til c.call */
export function clubInSeason_669bd0(c: CmCtx, club: number, pStart: number, pEnd: number): number {
  const m = c.m;
  if (pStart || pEnd) return c.call(0x669bd0, club, pStart, pEnd);
  let rec = 0xb63e38, endDay = 0x28;
  const nat = m.u32(club + 0x53);
  if (nat) for (let a = 0xb63d60; a < 0xb64738; a += 0x48) if (m.u32(a) === nat) { rec = a; endDay = m.s16(a + 0x39); break; }
  const start = m.s16(rec + 0x2a), today = m.s16(0xae2c90);
  if (start > endDay) return today > start || today < endDay ? 1 : 0;
  return today < start ? 0 : 1;
}

const PL23 = [0x9d0120, 0x9d0134, 0x9d02e4, 0x9d02e8, 0x9d02ec, 0x9d02f0, 0x9d02f4, 0x9d02f8, 0x9d02fc, 0x9d0304, 0x9d0308, 0x9d030c, 0x9d0310,
  0x9d0314, 0x9d0318, 0x9d031c, 0x9d0320, 0x9d0324, 0x9d0328, 0x9d032c, 0x9d0330, 0x9d0334, 0x9d0338];
/** 0x53d7f0 */
export function bigClub_53d7f0(m: CmMem, club: number): number {
  if (!club) return 0;
  const nat = m.u32(club + 0x53);
  if (!nat || m.s32(nat) !== m.s32(0x9cf488)) return 0;
  const id = m.s32(club);
  return PL23.some((g) => id === m.s32(g)) ? 1 : 0;
}
