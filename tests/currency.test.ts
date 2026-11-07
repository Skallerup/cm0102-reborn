import { describe, expect, it } from 'vitest';
import { CURRENCIES, getCurrency, money, setCurrency, setLang } from '../src/i18n';

describe('én valuta pr. sprog', () => {
  it('alle sprogs valutaer kan vælges', () => {
    expect(CURRENCIES).toEqual(expect.arrayContaining(['EUR', 'DKK', 'GBP', 'BRL', 'TRY']));
  });
  it('real og lira formateres', () => {
    setLang('en');
    setCurrency('BRL');
    expect(money(1_000_000)).toMatch(/^R\$ 6\.20M$/);
    setCurrency('TRY');
    expect(money(1_000_000)).toMatch(/^₺46\.0M$/);
    setCurrency('GBP');
    expect(getCurrency()).toBe('GBP');
  });
});
