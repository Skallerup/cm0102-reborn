// En tilstand uden `options` (beskadiget/meget gammelt gemt spil, ufuldstændigt øjebliksbillede) må ikke vælte skærmene
// ("Cannot read properties of undefined (reading 'mode')" i rules.ts: authentic/origLogic/legacyExtended).
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }; });
import { classicRules, legacyExtended, origLogic } from '../src/game/rules';
import { ensureOptions } from '../src/game/snapshot';
import type { GameState } from '../src/game/types';

describe('tilstand uden options', () => {
  const g = { dbKind: 'cm0102' } as unknown as GameState;
  it('rules.ts kaster ikke', () => {
    expect(() => legacyExtended(g)).not.toThrow();
    expect(legacyExtended(g)).toBe(true);
    expect(origLogic(g)).toBe(false);
  });
  it('ensureOptions udfylder en manglende options', () => {
    const x = ensureOptions({} as GameState);
    expect(x.options.rules).toBe('modern');
    expect(legacyExtended(x)).toBe(true);
    const keep = { options: { mode: 'authentic' } } as unknown as GameState;
    expect(ensureOptions(keep).options.mode).toBe('authentic');
  });
  it('classicRules uden spil er falsk', () => { expect(classicRules()).toBe(false); });
});
