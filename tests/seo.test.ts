import { describe, expect, it } from 'vitest';
import { slugify } from '../scripts/seo/layout';
import { pounds } from '../scripts/seo/db';

describe('SEO-siderne', () => {
  it('laver stabile url-navne', () => {
    expect(slugify('Thierry Henry')).toBe('thierry-henry');
    expect(slugify('Brøndby IF')).toBe('brondby-if');
    expect(slugify('Raúl')).toBe('raul');
    expect(slugify('1.FC Köln')).toBe('1-fc-koln');
    expect(slugify('Brighton & Hove Albion')).toBe('brighton-and-hove-albion');
  });
  it('viser beløb som CM 01/02', () => {
    expect(pounds(24_100_000)).toBe('£24.1m');
    expect(pounds(1_250_000)).toBe('£1.25m');
    expect(pounds(450_000)).toBe('£450k');
    expect(pounds(800)).toBe('£800');
  });
});
