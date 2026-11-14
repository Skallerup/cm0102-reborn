// Menneskets klub ved spilstart i den originale database (ægte tilstand) – undersøgelsen "svært at vinde med Man Utd, når man selv styrer":
//  - taktikken: menneskets blokke i human_manager.dat (oraklets gemte spil ls20) er forudindstillingen "4-4-2" (442_default) som indlæst – holdflag
//    0x22b44 (direkte afleveringer, hård tackling, pres) og filens instruktioner. Før fik mennesket spillets standardflag 0x22a91 og spillets egne
//    spillerinstruktioner (løb, indlæg, langskud …) oven på filens;
//  - forsæsonen: forkørslen 0x5cc850 kører, før menneskets manager sidder i klubben, så Friendly 0x5c27a0 planlægger også menneskets klubs
//    venskabskampe/turné (oraklet crowd1: menneskets Arsenal får en turné dag 206/208/210; ejerens Man Utd en Sydafrika-turné med fire kampe).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmLoadPreset, humanTeamFlags, instrOf, mapTactic, teamFlagsOf } from '../src/game/engine/grid/tacticTable';
import { PRESET_TACTICS } from '../src/game/engine/grid/presetTactics';
import { changeFormation, neutralPlayerInstructions } from '../src/game/tactics';

describe('menneskets klub ved spilstart (original DB, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  it('taktikken ved spilstart = 442_default som indlæst (flag 0x22b44, filens instruktioner); ændrede grupper følger mennesket', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const t = gs().tactic!;
    expect(t.formation).toBe('4-4-2');
    expect(t.cmFlags).toBe(0x22b44);
    expect(t.lineup.filter(Boolean)).toHaveLength(0);
    expect(t.team.tackling).toBe(2);
    expect(t.team.closingDown).toBe(2);
    const m = mapTactic(t.slots, t.formation, t.positions);
    expect(m.preset?.name).toBe('4-4-2');
    expect(humanTeamFlags(t, m.flags)).toBe(0x22b44);
    t.individual.forEach((pi, i) => { const k = m.slotOf[i]; expect(instrOf(pi, { lo: m.lo[k], hi: m.hi[k] })).toEqual({ lo: m.lo[k] >>> 0, hi: m.hi[k] >>> 0 }); });
    // mennesket slår presset fra: kun den gruppe ændres (afleveringerne forbliver "direkte")
    expect(humanTeamFlags({ ...t, team: { ...t.team, closingDown: 1 } }, m.flags)).toBe((0x22b44 & ~0x180) | 0x80);
    // uden cmFlags (andre spil): som før
    expect(humanTeamFlags({ team: t.team }, m.flags)).toBe(teamFlagsOf(t.team, m.flags));
    expect(changeFormation(t, '4-3-3').cmFlags).toBeUndefined();
    expect(cmLoadPreset(changeFormation(t, '4-3-3'), neutralPlayerInstructions).cmFlags).toBe(PRESET_TACTICS.find((p) => p.name === '4-3-3')!.flags);
  });

  it('forsæsonen: menneskets klub har venskabskampe fra forkørslens planlægning (et af frøene)', () => {
    let found = false;
    for (const seed of [1, 2, 3, 4]) {
      createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
      const h = gs();
      if (Object.values(h.fixtures).some((f) => f.comp === 'FRIENDLY' && (f.home === mu || f.away === mu)) || (h.cmFrPending ?? []).some((p) => p.h === mu || p.a === mu)) { found = true; break; }
    }
    expect(found).toBe(true);
  });
}, 180_000);
