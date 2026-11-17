// sub_535a80 0x536804–0x53689c: fødselsdatoens kontrol ved indlæsningen (cmDobRedateYear i src/game/data/cm0102.ts)
import { describe, expect, it } from 'vitest';
import { cmDobRedateYear } from '../src/game/data/cm0102';

describe('fødselsdatoens kontrol 0x536804', () => {
  it('14..50 år beholdes', () => {
    expect(cmDobRedateYear(100, 1980, 0, false)).toBeUndefined();
    expect(cmDobRedateYear(0, 1951, 0, false)).toBeUndefined();     // 50 år
    expect(cmDobRedateYear(0, 1987, 0, false)).toBeUndefined();     // 14 år
  });
  it('dagen i året efter 1/1 tæller ét år mindre', () => {
    expect(cmDobRedateYear(5, 1950, 0, false)).toBeUndefined();     // 50 (fylder 51 senere)
    expect(cmDobRedateYear(0, 1950, 0, false)).toBe(1980);          // 51
    expect(cmDobRedateYear(5, 1987, 0, false)).toBe(1980);          // 13
  });
  it('ingen dato (år 1900): året +0x18, ellers 1967 med ikke-spillerpost og 1980 uden', () => {
    expect(cmDobRedateYear(0, 1900, 1983, false)).toBe(1983);
    expect(cmDobRedateYear(0, 1900, 0, true)).toBe(1967);
    expect(cmDobRedateYear(0, 1900, 0, false)).toBe(1980);
    expect(cmDobRedateYear(0, 1900, 1900, false)).toBe(1980);
  });
});
