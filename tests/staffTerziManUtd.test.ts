// Ejerens fund 24/11 (Augusto Terzi, Man Utd): (1) databasens ledige, der kun er i hukommelsen (cmExtra), fik viljen 0x844780 = 0 i Offer Contract
// (env.person gav en person uden ikke-spillerpost → 0x8447d8), så de var aldrig interesserede; nu læses hans post med databasens job +0x3d = 10.
// Kontrol: cmGen f_844780 på oraklets hukommelse 14/7-01 giver 0,62 (Man Utd, menneskemanager) og kravet 250.000 – også nej på dag 1; ja, når
// ledighedsleddet (dage² / (omdømme + 900)) er vokset. (2) Set Role At Club forvælger 0x4d44e0's job: Physio for en fysioterapeut.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffOfferCheck } from '../src/game/cmContractGame';
import { cmExpectedRole, cmRolesFor, JOB_CODE } from '../src/game/cmStaff';
import { addDays } from '../src/game/dates';

describe('Augusto Terzi og Man Utd (ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const en = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1].startsWith('Manchester United'))![0];
  createGame(world, { managerName: 'M S', managerNation: en, clubId: mu, activeNations: [en], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const s = Object.values(g.staff).find((x) => x.first === 'Augusto' && x.last === 'Terzi')!;

  it('viljen regnes af hans post (ikke 0); kravet er 250.000 på dag 1 og falder, når han har været ledig længe', () => {
    expect(s.club).toBe(0);
    expect(s.cmExtra).toBe(true);
    const d1 = cmStaffOfferCheck(g, s, mu, JOB_CODE.physio)!;
    expect(d1.will).toBeGreaterThan(0.4);
    expect(d1.will).toBeLessThan(1.75);
    expect(d1.interested).toBe(false);
    // assistent: 0x844780 afviser en fysioterapeut (+0x3d = 10) til et andet job
    expect(cmStaffOfferCheck(g, s, mu, JOB_CODE.assistant)!.will).toBe(0);
    const d0 = g.date;
    g.date = addDays(d0, 240);
    const later = cmStaffOfferCheck(g, s, mu, JOB_CODE.physio)!;
    g.date = d0;
    expect(later.will).toBeGreaterThan(1.75);
    expect(later.wage).toBeLessThan(d1.wage);
    expect(later.interested).toBe(true);
  });

  it('Set Role At Club forvælger hans job (0x4d44e0): Physio', () => {
    expect(cmRolesFor(s, g.date)).toEqual(['assistant', 'physio']);
    expect(cmExpectedRole(s, g.date)).toBe('physio');
    // egen stab: det job, han har
    for (const x of Object.values(g.staff).filter((y) => y.club === mu && y.role !== 'manager')) {
      if (cmRolesFor(x, g.date).includes(x.role)) expect(cmExpectedRole(x, g.date)).toBe(x.role);
    }
  });
});
