// Shortlist_Manager (this = [[0xde1f54] + 0x856]) – transfer/kontrakt runde 2 (13/11-2026). Mekanisk oversat instruktion for instruktion
// (cmGen/f_*.ts af ~/cm0102-engine/tools/x86ts.py):
//   0x846920 player_value(staff, club, a2, a3, status, &ud) → float: hvor gerne klubben vil have spilleren (0x85fc50's lønkrav bruger 3,5/r af
//            den; 0x4ce4e0 sammenligner tilbuddene med den)
//   0x844780 staff_value(staff, club, a2, job, a4, &ud) → float: det samme for ikke-spillere
//   0x849f00 (staff, club, &job) → status (byte), 0x842c00 (staff, flag) – fjerner/afmelder personen på listerne, 0x849ce0 (club, staff, a, b) – på listen?
import type { CmCtx, CmMem } from './cmMem';
import { GEN } from './cmGen/index';
import { ensureImpls } from './cmGen/impls';
/** Shortlist_Manager-pegeren */
export const slmOf = (m: CmMem) => m.u32(m.u32(0xde1f54) + 0x856);
/** kald en af de oversatte funktioner (self = Shortlist_Manager) */
export function slCall(c: CmCtx, adr: number, self: number, ...args: number[]): number {
  ensureImpls();
  const v = GEN[adr](c, self, args);
  c.probe?.(adr, v);
  return v;
}
/** 0x846920 */
export const shortlistValue_846920 = (c: CmCtx, self: number, staff: number, club: number, a2: number, a3: number, a4: number, out: number) =>
  slCall(c, 0x846920, self, staff, club, a2, a3, a4, out);
