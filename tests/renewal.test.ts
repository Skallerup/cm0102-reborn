// Kontraktforlængelse: "1 år" midt i sæsonen skal forlænge kontrakten (fejlrapport: De Bruyne 25/12-2026).
import { describe, expect, it } from 'vitest';
import { renewalExpiry } from '../src/game/transfers';

describe('renewalExpiry', () => {
  it('midt i sæsonen regnes årene fra næste sæson', () => {
    expect(renewalExpiry('2027-06-30', 1, '2026-12-25')).toBe('2028-06-30');
    expect(renewalExpiry('2027-06-30', 3, '2027-03-01')).toBe('2030-06-30');
  });
  it('i sommerpausen tæller den sæson, der starter', () => {
    expect(renewalExpiry('2026-06-30', 1, '2026-07-10')).toBe('2027-06-30');
    expect(renewalExpiry(undefined, 2, '2026-08-20')).toBe('2028-06-30');
  });
  it('aldrig kortere end den nuværende kontrakt', () => {
    expect(renewalExpiry('2030-06-30', 1, '2026-12-25')).toBe('2030-06-30');
  });
});
