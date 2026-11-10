import { describe, expect, it } from 'vitest';
import { nameQuery } from '../src/ui/search';

describe('navnesøgning', () => {
  it('ord i vilkårlig rækkefølge og "Efternavn, Fornavn"', () => {
    expect(nameQuery('mark kerr')!('Kerr, Mark')).toBe(true);
    expect(nameQuery('Kerr')!('Mark', 'Kerr')).toBe(true);
    expect(nameQuery('mark kerr')!('Mark', 'Kerrigan')).toBe(true);
    expect(nameQuery('mark kerr')!('Mark', 'Smith')).toBe(false);
  });
  it('uden accenter og med/uden h', () => {
    expect(nameQuery('Aghahowa')!('Julius', 'Agahowa')).toBe(true);
    expect(nameQuery('bakircioglu')!('Kennedy', 'Bakircioglü')).toBe(true);
    expect(nameQuery('kallstrom')!('Kim', 'Källström')).toBe(true);
    expect(nameQuery('brondby')!('Brøndby IF')).toBe(true);
  });
  it('tom søgning = alt', () => { expect(nameQuery('  ')).toBeNull(); });
});
