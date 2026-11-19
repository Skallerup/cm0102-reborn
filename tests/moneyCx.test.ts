import { describe, expect, it } from 'vitest';
import { cashDisplayRound, cashFormat, cashMoney, cashRound, money, moneyCm, moneyCx, moneyCxFunds, moneyFull, moneyWage, setCashStyle, setCurrency, setMoneyRounding, type Currency } from '../src/i18n';
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

// Cash::get_display_amount 0x43f460 + 0x4426e0 (exe-tabellerne 0x9688b0…0x968910) og kaldestedernes flag (se moneyCm i i18n)
describe('cashRound / cashMoney (0x43f460 + 0x441c10 med flag)', () => {
  it('flag 4: store-beløbs-tabellen × valutaens enhed; flag 8: småbeløbstabellen; uden 4/8: trin 1000; 0x20: urundet', () => {
    expect(cashRound(5430, 4, 'GBP')).toBe(5000);
    expect(cashRound(5430, 0x20, 'GBP')).toBe(5430);
    expect(cashRound(5430, 1, 'GBP')).toBe(5000); // 0x442a9f: 1000
    expect(cashRound(5430, 8, 'GBP')).toBe(5500); // ≤ 20.000 → 250
    expect(cashRound(1234, 8, 'GBP')).toBe(1200); // ≤ 5.000 → 100
    expect(cashRound(77, 8, 'GBP')).toBe(75); // ≤ 100 → 5
    expect(cashRound(62_400, 8, 'GBP')).toBe(60_000); // 50.000-100.000 → 5.000 (originalens tabel)
    expect(cashRound(54_321, 8, 'DKK')).toBe(55_000); // DKK: ≤ 200.000 kr. (20.000 × 10) → 2.500 kr.
  });
  it('fuldt (flag 6/0xA), over 8 tegn forkortet (5/9) som kontraktskærmen 0x4e06e0 og truppens lønkolonne 0x475520', () => {
    setCurrency('GBP');
    const g = (k: number) => k / 0.86;
    expect(cashMoney(g(950_000), 6, 8)).toBe('£950,000');
    expect(cashMoney(g(1_230_000), 6, 8)).toBe('£1.2M');
    expect(cashMoney(g(5430), 0xa, 8)).toBe('£5,500');
    expect(cashMoney(g(5430), 5)).toBe('£5K');
    expect(cashMoney(g(-5430), 5)).toBe('-£5K');
  });
  it('klassisk udseende: money = flag 5, moneyFull = flag 6, moneyWage = flag 0xA; ellers uændret', () => {
    setCurrency('GBP');
    const g = (k: number) => k / 0.86;
    const before = [money(g(5430)), moneyFull(g(5430)), moneyWage(g(5430))];
    setCashStyle(true);
    try {
      expect(money(g(5430))).toBe('£5K');
      expect(moneyFull(g(18_169_768))).toBe('£18,250,000');
      expect(moneyWage(g(5430))).toBe('£5,500');
      expect(moneyCm(g(5430), 0x22)).toBe('£5,430');
    } finally { setCashStyle(false); }
    expect([money(g(5430)), moneyFull(g(5430)), moneyWage(g(5430))]).toEqual(before);
  });
  it('rundingen i money() (ægte tilstand) ganger trinnet med valutaens enhed', () => {
    setCurrency('DKK');
    setMoneyRounding(true);
    try {
      expect(moneyFull(18_400_000 / 7.46)).toBe(moneyFull(18_000_000 / 7.46)); // trin 1M kr. (100.000 × 10) – ikke 250.000 (→ 18,5M)
    } finally { setMoneyRounding(false); }
  });
});
