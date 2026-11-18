import { describe, expect, it } from 'vitest';
import { moneyCx, setCurrency } from '../src/i18n';

describe('moneyCx (Finances-skærmen)', () => {
  it('præcist under 14 tegn, ellers forkortet; underskud i parentes', () => {
    setCurrency('DKK');
    const e = (k: number) => k / 7.46;
    expect(moneyCx(e(85_113_190))).toMatch(/^85[.,\s ]113[.,\s ]190DKr$/);
    expect(moneyCx(e(388_080_000))).toMatch(/^388[,.]08M Dkr$/);
    expect(moneyCx(e(-86_410_000))).toMatch(/^\(86[,.]41M Dkr\)$/);
    expect(moneyCx(e(1_000_000_000))).toMatch(/^1B Dkr$/);
  });
});
