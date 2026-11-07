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

describe('svensk og norsk', () => {
  it('sprogene hentes, og valutaen følger sproget', async () => {
    const { ensureLang, t } = await import('../src/i18n');
    for (const [l, cur] of [['sv', 'SEK'], ['nb', 'NOK']] as const) {
      await ensureLang(l);
      setLang(l);
      setCurrency(cur);
      expect(t('common.yes')).not.toBe('Yes');
      expect(money(1_000_000)).toMatch(/ kr$/);
    }
    setLang('en');
    setCurrency('GBP');
  });
});
