// Månedstabellerne 0x9b8448/0x9b8460 som i exe'en (cmMem.ts writeMonthTables): dagen i måneden 0x54cf70, måneden 0x54cfb0 og Date(dag, måned,
// år) 0x549f70 skal give kalenderens dato – også den 29.–31. og månedens 1. (lejeaftalernes slutdato 0x842740: min(dagen, 28)).
import { describe, expect, it } from 'vitest';
import { SparseMem, writeMonthTables, type CmCtx } from '../src/game/cmMem';
import { f_54cf70 } from '../src/game/cmGen/f_54cf70';
import { f_54cfb0 } from '../src/game/cmGen/f_54cfb0';
import { f_549f70 } from '../src/game/cmGen/f_549f70';

const D = 0x00300000, OUT = 0x00300100;
const doy = (iso: string) => Math.round((Date.parse(iso + 'T00:00:00Z') - Date.UTC(+iso.slice(0, 4), 0, 1)) / 86400000);
const leap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

describe('månedstabellerne 0x9b8448/0x9b8460', () => {
  const m = new SparseMem();
  writeMonthTables(m);
  const c: CmCtx = { m, rand: () => 0, call: () => { throw new Error('ingen kald'); } } as unknown as CmCtx;
  const setDate = (iso: string) => { const y = +iso.slice(0, 4); m.w16(D, doy(iso)); m.w16(D + 2, y); m.w32(D + 4, leap(y) ? 1 : 0); };
  it('dagen i måneden og måneden for hver dag i 2001 og 2004', () => {
    for (const y of [2001, 2004]) for (let t = Date.UTC(y, 0, 1); t < Date.UTC(y + 1, 0, 1); t += 86400000) {
      const iso = new Date(t).toISOString().slice(0, 10);
      setDate(iso);
      expect([iso, (f_54cf70(c, D, []) << 16) >> 16]).toEqual([iso, +iso.slice(8, 10)]);
      expect([iso, (f_54cfb0(c, D, []) << 24) >> 24]).toEqual([iso, +iso.slice(5, 7) - 1]);
    }
  });
  it('Date(dag, måned, år) 0x549f70', () => {
    for (const [d, mo, y, iso] of [[28, 5, 2002, '2002-06-28'], [1, 0, 2002, '2002-01-01'], [1, 2, 2004, '2004-03-01'], [31, 11, 2003, '2003-12-31']] as const) {
      f_549f70(c, OUT, [d, mo, y, -1]);
      expect(m.s16(OUT)).toBe(doy(iso));
      expect(m.u16(OUT + 2)).toBe(y);
    }
  });
});
