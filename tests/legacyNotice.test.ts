// docs/ALWAYS_ORIGINAL.md trin 4: mærkning af gamle udvidede spil og beskeden, der kun vises én gang
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { legacyExtendedFromText } from '../src/game/saveKind';

const store = new Map<string, string>();
vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) });
const { legacyNoticeSeen, markLegacyNoticeSeen, shouldShowLegacyNotice } = await import('../src/ui/legacyNotice');

describe('mærkning (legacyExtendedFromText)', () => {
  it('gammelt udvidet spil mærkes, ægte spil ikke', () => {
    expect(legacyExtendedFromText('{"options":{"mode":"extended"},"dbKind":"cm0102"}')).toBe(true);
    expect(legacyExtendedFromText('{"options":{}}')).toBe(true);
    expect(legacyExtendedFromText('{"options":{"mode":"authentic"}}')).toBe(false);
  });
  it('fællesspil, draft og ukendt tekst mærkes ikke', () => {
    expect(legacyExtendedFromText('{"humans":[{"a":1}],"options":{"mode":"extended"}}')).toBe(false);
    expect(legacyExtendedFromText('{"draft":{},"options":{"mode":"extended"}}')).toBe(false);
    expect(legacyExtendedFromText('xyz')).toBeNull();
  });
});

describe('beskeden vises kun én gang pr. spil', () => {
  beforeEach(() => store.clear());
  it('første gang ja, derefter nej (uanset valg)', () => {
    expect(shouldShowLegacyNotice(true, 'a')).toBe(true);
    markLegacyNoticeSeen('a', 'keep');
    expect(legacyNoticeSeen('a')).toBe(true);
    expect(shouldShowLegacyNotice(true, 'a')).toBe(false);
    expect(shouldShowLegacyNotice(true, 'b')).toBe(true);
  });
  it('aldrig for spil, der ikke er udvidede', () => {
    expect(shouldShowLegacyNotice(false, 'c')).toBe(false);
    expect(shouldShowLegacyNotice(null, 'c')).toBe(false);
  });
});
