// Originalens nyhed 0xfa1, når en computerklub afviser menneskets bud (reject_transfer_offer 0x8bf680 → 0x8d5170, teksten 0x8d5420):
// beløbet, køberen og grundene fra 0x4d1600's ud-parameter (højst to, "A and B").
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { cmRejWhy, newsBody, newsTitle } from '../src/ui/screens/common';
import type { NewsItem } from '../src/game/types';

const item = (body: string, why: number, fee = 0): NewsItem => ({ id: 1, date: '2002-06-05', cat: 'transfer', key: 'transfer.cmBidRej',
  params: { player: 'Kim Källström', club: 'Atalanta', buyer: 'Manchester United', fee, why, body, comp: 'Italian Serie B' } } as unknown as NewsItem);

describe('0x8d5420: afvisningens tekst', () => {
  it('grundene i originalens rækkefølge, højst to', () => {
    expect(cmRejWhy(0x100, '')).toBe('have only recently purchased him');
    expect(cmRejWhy(0x300, '')).toBe('see him as an indispensible member of their squad and have only recently purchased him');
    expect(cmRejWhy(0x600, '')).toBe('see him as an indispensible member of their squad');
    expect(cmRejWhy(0x2400, '')).toBe('see him as a valuable member of their squad');
    expect(cmRejWhy(0x1800, '')).toBe('do not want to sell him to a rival club');
    expect(cmRejWhy(0x3000, 'Serie B')).toBe('do not want to sell him to another Serie B club and regard him as an important player for the future');
    expect(cmRejWhy(0x2b00, '')).toBe('see him as an indispensible member of their squad and have only recently purchased him');
    expect(cmRejWhy(10, '')).toBe('');
  });
  it('nyheden: overskrift og brødtekst med beløb og grunde', () => {
    const n = item('WhyFee', 0x100, 1_000_000);
    expect(newsTitle(n)).toBe('Kim Källström transfer bid rejected');
    expect(newsBody(n)).toMatch(/^Atalanta have rejected the .+ offer from Manchester United for Kim Källström\.\n\nThey have only recently purchased him\.$/);
    expect(newsBody(item('', 0))).toBe('Atalanta have rejected the offer from Manchester United for Kim Källström.');
    expect(newsBody(item('DisFee', 10, 1_000_000))).toMatch(/^Atalanta have dismissed the .+ offer from Manchester United for Kim Källström as totally unacceptable\.$/);
    expect(newsBody(item('pxWhy', 0x800))).toBe('Atalanta have rejected the part exchange offer from Manchester United for Kim Källström.\n\nThey do not want to sell him to a rival club.');
  });
});
