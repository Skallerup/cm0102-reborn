import { describe, expect, it } from 'vitest';
import { cashDisplayRound, cashFormat, moneyCx, moneyCxFunds, setCurrency, type Currency } from '../src/i18n';
import FX from './fixtures/cashFormat.json';

// tests/fixtures/cashFormat.json: originalens cash_format_money 0x441c10 kørt i unicorn (exe'ens kode, valutaen sat med 0x43f7f0(id)):
// [beløb, flag 0x22 (fuldt), flag 0x21 (forkortet)] pr. valuta – '|' er skrevet som mellemrum
describe('cashFormat = 0x441c10 (exe-kørsel)', () => {
  for (const [cur, rows] of Object.entries(FX as Record<string, [number, string, string][]>)) {
    it(cur, () => {
      for (const [v, full, abbr] of rows) {
        expect(cashFormat(v, true, cur as Currency), `${cur} ${v} fuldt`).toBe(full);
        expect(cashFormat(v, false, cur as Currency), `${cur} ${v} forkortet`).toBe(abbr);
      }
    });
  }
});

describe('moneyCx (Finances-skærmen 0x460590)', () => {
  it('fuldt til og med 13 tegn, ellers forkortet; negativ i parentes (forkortet over 12 tegn)', () => {
    setCurrency('DKK');
    const e = (k: number) => k / 7.46;
    expect(moneyCx(e(85_113_190))).toBe('85.113.190DKr');
    expect(moneyCx(e(388_080_000))).toBe('388,08M Dkr');
    expect(moneyCx(e(-86_410_000))).toBe('(86,41M Dkr)');
    expect(moneyCx(e(-8_641_000))).toBe('(8.641.000DKr)'); // 12 tegn inden parentesen
    expect(moneyCx(e(1_000_000_000))).toBe('1B Dkr');
    setCurrency('GBP');
    const g = (k: number) => k / 0.86;
    expect(moneyCx(g(12_345_678))).toBe('£12,345,678');
    expect(moneyCx(g(123_456_789))).toBe('£123,456,789'); // 12 tegn
    expect(moneyCx(g(1_234_567_890))).toBe('£1.23B');
    expect(moneyCx(g(-1_234_567_890))).toBe('(£1.23B)');
    setCurrency('EUR');
    expect(moneyCx(1_234_567_890)).toBe('€1.23B');
    expect(moneyCx(-5_250_000)).toBe('(€5,250,000)');
  });
  it('Transfer Funds: negativ = None available; ellers rundet til Cash-trinnet × valutaens enhed', () => {
    setCurrency('DKK');
    expect(moneyCxFunds(-1)).toBeNull();
    expect(cashDisplayRound(18_069_768, 'DKK')).toBe(18_000_000); // ≤ 50M kr. → trin 1M kr. (100.000 × 10)
    expect(cashDisplayRound(18_069_768, 'GBP')).toBe(18_000_000); // ≤ 20M → trin 250.000
    expect(cashDisplayRound(18_169_768, 'GBP')).toBe(18_250_000);
    expect(moneyCxFunds(18_069_768 / 7.46)).toBe('18.000.000DKr');
  });
});
