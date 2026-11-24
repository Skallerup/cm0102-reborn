import { describe, expect, it } from 'vitest';
import { render, supportHtml, SUPPORT_LINE } from '../scripts/seo/layout';
import { KOFI_URL } from '../src/online/kofi';
import { en } from '../src/i18n/en';
import { da } from '../src/i18n/da';

describe('støtte-linket (Ko-fi) i SEO-skabelonen og teksterne', () => {
  it('sidefoden har budskabet og Ko-fi-linket på alle sprog', () => {
    for (const l of Object.keys(SUPPORT_LINE)) expect(supportHtml(l)).toContain(KOFI_URL);
    expect(supportHtml('pt-BR')).toContain('doações');
    const html = render({ slug: 'x/', title: 'T', h1: 'T', description: 'D', body: '<p>b</p>', crumbs: [], modified: '2026-11-24' } as never);
    expect(html).toContain(`href="${KOFI_URL}"`);
    expect(html).toContain('<p class="support">');
  });
  it('budskabet findes i en og da', () => {
    expect(en['sb.msg']).toMatch(/free/);
    expect(da['sb.msg']).toMatch(/gratis/);
  });
});
