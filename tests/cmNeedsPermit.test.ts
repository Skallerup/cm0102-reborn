// 0x8c7560 TRANSFER_MANAGER "skal have arbejdstilladelse" (cmPermit.ts cmNeedsPermit) – alle grene på en lille hånd-bygget spiltilstand:
// britisk klub (nation +0x76 = 0xe), EU-borger (0x53d740), flag 1, og flag 0's undtagelse 0x8c761d–0x8c767e (hovedkontrakt 0x4cf5a0 med
// +0x35 & 0x3f = 2, en person, en post i historikken → tæller ikke).
import { describe, expect, it } from 'vitest';
import { cmNeedsPermit } from '../src/game/cmPermit';
import type { GameState, Player } from '../src/game/types';

const NATIONS = ['England', 'Brazil', 'France', 'Germany', 'Switzerland'].map((name) => ({ name }));
function setup(over: Partial<Player> = {}, permit = false) {
  const p = { id: 1, nation: 1, club: 7, contract: { wage: 1000, expires: '2003-06-30' }, ...over } as unknown as Player;
  // ingen cmLogic → cmBritish/cmEuCitizen efter landenes navne (CM_BRITISH/CM_EU)
  const g = { date: '2001-10-01', nations: NATIONS, players: { 1: p },
    clubs: { 7: { id: 7, nation: 0 }, 8: { id: 8, nation: 3 } },
    ...(permit ? { cmPermit: { 1: [3, 1, 2000, 0] } } : {}) } as unknown as GameState;
  return { g, p };
}

describe('0x8c7560 cmNeedsPermit', () => {
  it('klub uden for De Britiske Øer → nej (begge flag)', () => {
    const { g, p } = setup();
    expect(cmNeedsPermit(g, p, 8, true)).toBe(false);
    expect(cmNeedsPermit(g, p, 8, false)).toBe(false);
  });
  it('EU-borger (nation, anden nation, Schweiz) → nej', () => {
    for (const over of [{ nation: 2 }, { cmNation2: 3 }, { nation: 4 }] as Partial<Player>[]) {
      const { g, p } = setup(over);
      expect(cmNeedsPermit(g, p, 7, true)).toBe(false);
      expect(cmNeedsPermit(g, p, 7, false)).toBe(false);
    }
  });
  it('ikke-EU, flag 1 → ja, også med post og hovedkontrakt', () => {
    expect(cmNeedsPermit(setup().g, setup().p, 7, true)).toBe(true);
    const { g, p } = setup({}, true);
    expect(cmNeedsPermit(g, p, 7, true)).toBe(true);
  });
  it('ikke-EU, flag 0: type 2-hovedkontrakt med post → tæller ikke; uden post → ja', () => {
    { const { g, p } = setup({}, true); expect(cmNeedsPermit(g, p, 7, false)).toBe(false); }
    { const { g, p } = setup({}, false); expect(cmNeedsPermit(g, p, 7, false)).toBe(true); }
    // også under en leje: get_contract 0x4cf5a0 er hovedkontrakten (dyn+0), ikke lejekontrakten 0x4cf6d0
    { const { g, p } = setup({ loan: { from: 8, until: '2002-06-30' } } as Partial<Player>, true); expect(cmNeedsPermit(g, p, 7, false)).toBe(false); }
  });
  it('ikke-EU, flag 0: anden kontrakttype, ingen kontrakt eller fyldspiller → ja, selv med post', () => {
    { const { g, p } = setup({ contract: { wage: 1000, expires: '2003-06-30', cmType: 1 } } as Partial<Player>, true); expect(cmNeedsPermit(g, p, 7, false)).toBe(true); }
    { const { g, p } = setup({ contract: null }, true); expect(cmNeedsPermit(g, p, 7, false)).toBe(true); }
    { const { g, p } = setup({ virtual: 'active' } as Partial<Player>, true); expect(cmNeedsPermit(g, p, 7, false)).toBe(true); }
  });
});
