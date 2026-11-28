import { describe, expect, it } from 'vitest';
import { initialStart_85e960 } from '../src/game/cmContractInit';

// 0x85e960's startdato +0x25 ved spilstarten – oraklets dagsbillede 14/7 (s1-2026-e7, 2001-uret: år − 25)
describe('0x85e960 kontraktens startdato', () => {
  const T = '2026-07-11';
  it('høj databaseløn og ankomst > 1 år siden: spillets startår (Haaland 181/2001, Palmer 243/2001)', () => {
    expect(initialStart_85e960(T, '2022-07-01', { wage: 100000, defender: 5 }, 25)).toBe('2026-07-01');
    expect(initialStart_85e960(T, '2023-09-01', { wage: 94000, defender: 5 }, 24)).toBe('2026-09-01');
  });
  it('ankomst under et år siden: uændret (Brobbey 244/2000)', () => {
    expect(initialStart_85e960(T, '2025-09-01', { wage: 50000, defender: 5 }, 24)).toBe('2025-09-01');
  });
  it('lav løn, alder over 29, > 2 år: i år − 2 (Pickford 182/1999)', () => {
    expect(initialStart_85e960(T, '2017-07-01', { wage: 10600, defender: 1 }, 32)?.slice(0, 4)).toBe('2024');
  });
  it('lav løn, alder 24–29, > 3 år: i år − 3; forsvarer 20 over 21.250: startåret', () => {
    expect(initialStart_85e960(T, '2018-03-01', { wage: 5000, defender: 1 }, 27)?.slice(0, 4)).toBe('2023');
    expect(initialStart_85e960(T, '2025-08-01', { wage: 25000, defender: 20 }, 27)?.slice(0, 4)).toBe('2026');
  });
  it('uden databaseløn: > 2 år → i år − 1; ingen dato → null', () => {
    expect(initialStart_85e960(T, '2020-05-05', null, 27)?.slice(0, 4)).toBe('2025');
    expect(initialStart_85e960(T, '2025-05-05', null, 27)).toBe('2025-05-05');
    expect(initialStart_85e960(T, undefined, null, 27)).toBeNull();
  });
});
