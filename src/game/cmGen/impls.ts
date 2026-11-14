// De porterede funktioner, som de mekanisk oversatte (f_*.ts) kalder direkte – med originalens kaldkonvention: (ecx, stakkens argumenter).
// Ikke-porterede funktioner går til c.call (sporet i kontrollen, spillets adapter i spillet).
import { registerImpl } from './x86';
import { getContract, G } from '../cmMem';
import { contractForClub_4cf5f0, constructContract_85e410, deservedStatus_4ca470, daysSince_54cdb0 } from '../cmContractWant';
import { dateInit_54a110, subDays_54c8e0, addDays_54c5b0 } from '../cmContract';
import { getMaxWage_5968d0, balanceStatus_5986b0, maxStaffWage_597db0, staffFavourite_547810, clubFavourite_547790, wageOf_4d0c20 } from '../cmMaxWage';
import { getClubFinance_5a0590, defaultStaffContract_864550 } from '../cmWage';
import { clubInSeason_669bd0, linkedClub_540a50, bigClub_53d7f0 } from '../cmClubLinks';
import { GEN, GEN_THIS, GEN_N } from './index';
import type { CmCtx } from '../cmMem';

let done = false;
/** registrerer portene én gang (kaldes af de oversatte funktioners indgange) */
export function ensureImpls(): void {
  if (done) return;
  done = true;
  const wrDt = (m: import('../cmMem').CmMem, a: number, t: { d: number; y: number; x: number }) => { m.w16(a, t.d); m.w16(a + 2, t.y); m.w32(a + 4, t.x); };
  registerImpl(0x4cf5a0, (c, _e, a) => getContract(c.m, a[0] >>> 0));
  registerImpl(0x4cf5f0, (c, _e, a) => contractForClub_4cf5f0(c, a[0] >>> 0, a[1] >>> 0));
  registerImpl(0x4ca470, (c, _e, a) => deservedStatus_4ca470(c.m, a[0] >>> 0, a[1]));
  registerImpl(0x85e410, (c, e) => { constructContract_85e410(c.m, e >>> 0); return e; });
  registerImpl(0x54a110, (c, e) => { dateInit_54a110(c.m, e >>> 0); return e; });
  registerImpl(0x54c8e0, (c, e, a) => { wrDt(c.m, a[0] >>> 0, subDays_54c8e0(c.m, e >>> 0, a[1])); return a[0]; });
  registerImpl(0x54c5b0, (c, e, a) => { wrDt(c.m, a[0] >>> 0, addDays_54c5b0(c.m, e >>> 0, a[1])); return a[0]; });
  registerImpl(0x54cdb0, (c, e, a) => daysSince_54cdb0(c.m, e >>> 0, (a[0] << 16) >> 16, a[0] >>> 16));
  registerImpl(0x5968d0, (c, e, a) => getMaxWage_5968d0(c, e >>> 0, a[0] >>> 0, a[1]));
  registerImpl(0x597db0, (c, e, a) => maxStaffWage_597db0(c, e >>> 0, a[0]));
  registerImpl(0x5986b0, (c, e) => balanceStatus_5986b0(c.m, e >>> 0) & 0xff);
  registerImpl(0x5a0590, (c, _e, a) => getClubFinance_5a0590(c, a[0] >>> 0));
  registerImpl(0x669bd0, (c, _e, a) => clubInSeason_669bd0(c, a[0] >>> 0, a[1] >>> 0, a[2] >>> 0));
  registerImpl(0x540a50, (c, _e, a) => linkedClub_540a50(c.m, a[0] >>> 0, a[1] >>> 0, a[2]));
  registerImpl(0x53d7f0, (c, _e, a) => bigClub_53d7f0(c.m, a[0] >>> 0));
  registerImpl(0x547810, (c, _e, a) => (staffFavourite_547810(c.m, a[0] >>> 0, a[1] >>> 0) ? 1 : 0));
  registerImpl(0x547790, (c, _e, a) => (clubFavourite_547790(c.m, a[0] >>> 0, a[1] >>> 0) ? 1 : 0));
  registerImpl(0x4d0c20, (c, _e, a) => wageOf_4d0c20(c.m, a[0] >>> 0));
  registerImpl(0x864550, (c, _e, a) => defaultStaffContract_864550(c, a[0] >>> 0, a[1] >>> 0, a[2], a[3], a[4], a[5]));
  registerImpl(0x53b900, (c, _e, a) => { const m = c.m, club = a[0] >>> 0; return club !== 0 && m.s32(club) >= m.s32(0xae235c) - 2 * m.s32(0xae2350) ? 1 : 0; });
  // operator delete 0x944c94: hukommelsen frigives ikke (SparseMem) – intet at gøre
  registerImpl(0x944c94, () => 0);
  for (const [a, f] of Object.entries(GEN)) registerImpl(+a, f);
  void G;
}

/** CmCtx, hvor c.call til en oversat funktion kører oversættelsen (dens indre kald går igen gennem denne ctx); alt andet til c.call.
 *  thiscall-funktioner tager this som første argument, når kalderen giver n + 1 argumenter (de håndporterede kaldsteder er ikke ens). */
const ONLY = typeof process !== 'undefined' && process.env?.GENONLY !== undefined ? new Set(process.env.GENONLY.split(',').filter(Boolean).map((x) => parseInt(x, 16))) : null;
export function genCtx(c: CmCtx): CmCtx {
  ensureImpls();
  const g: CmCtx = {
    m: c.m,
    rand: (n) => c.rand(n),
    probe: c.probe ? (a, v) => c.probe!(a, v) : undefined,
    useLog: c.useLog ? (a) => c.useLog!(a) : undefined,
    call(adr, ...a) {
      const f = GEN[adr];
      // n + 1 argumenter til en funktion, der rydder n: det første er this (ecx) – også når oversætteren ikke så ecx læst tidligt.
      // thiscall uden this fra kaldstedet (n argumenter): this kendes ikke → c.call
      const n = GEN_N[adr], withThis = n > 0 && a.length === n + 1;
      if (!f || c.useLog?.(adr) || (GEN_THIS.has(adr) && !withThis) || (ONLY && !ONLY.has(adr))) return c.call(adr, ...a);
      const v = withThis ? f(g, a[0], a.slice(1)) : f(g, 0, a);
      c.probe?.(adr, v);
      return v;
    },
  };
  return g;
}
