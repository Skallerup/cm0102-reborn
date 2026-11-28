// Ejerens melding 28/11: stabsfolk, som Staff Search-filteret "Interested" viser, ville ikke forhandle. Filteret brugte spillets egen regel
// (staff.ts willJoin: omdømme ≤ eget + 5); originalens SearchFilters 0x807450 (grenen 0x807e89–0x807ecc for en ikke-spiller) bruger omdømmet
// np+0xc mod klubbens +0x80 + 5000 og viljen 0x844780(staff, klub, 1, job, NULL) ≥ 3,15 – samme vilje, som Offer Contract 0x4e06e0 kræver > 2,75
// (cmStaffSearchInterested / cmStaffOfferCheck i cmContractGame.ts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffOfferCheck, cmStaffSearchInterested } from '../src/game/cmContractGame';
import { cmDbJob, cmRolesFor, JOB_CODE } from '../src/game/cmStaff';
import type { StaffRole } from '../src/game/types';

describe('Staff Search "Interested" som originalen 0x807450 – Vejle 1.7.01, ægte tilstand', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const dk = world.nations.findIndex((n) => n.name === 'Denmark');
  const vejle = world.clubs.find((c) => c[1].startsWith('Vejle'))![0];
  createGame(world, { managerName: 'M S', managerNation: dk, clubId: vejle, activeNations: [dk], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();

  it('de ledige, filteret viser, vil forhandle om deres eget job (det filteret måler); Augusto Terzi er ikke med', () => {
    const terzi = Object.values(g.staff).find((s) => s.first === 'Augusto' && s.last === 'Terzi')!;
    expect(cmStaffSearchInterested(g, terzi, vejle, false)).toBe(false);
    const ROLE: Record<number, StaffRole> = { 6: 'assistant', 8: 'coach', 9: 'scout', 10: 'physio' };
    let shown = 0, same = 0, talk = 0, hidden = 0;
    for (const s of Object.values(g.staff)) {
      if (s.club || !s.cmNp) continue;
      const v = cmStaffSearchInterested(g, s, vejle, false);
      expect(v).not.toBeNull();
      if (!v) { hidden++; continue; }
      shown++;
      // filteret måler viljen til hans job +0x3d (0x807d28); forhandlingen viljen til det tilbudte – sammenlign, hvor de er ens
      const r = ROLE[cmDbJob(s)];
      if (!r || !cmRolesFor(s, g.date).includes(r)) continue;
      same++;
      if (cmStaffOfferCheck(g, s, vejle, JOB_CODE[r])?.interested) talk++;
    }
    expect(shown).toBeGreaterThan(0);
    expect(hidden).toBeGreaterThan(0);
    expect(same).toBeGreaterThan(0);
    // viljen ≥ 3,15 (filteret) er over forhandlingens 2,75 – kun lønloftet (1,5 · loftet) kunne skille dem
    expect(talk).toBe(same);
  });
});
