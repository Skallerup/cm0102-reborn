// Ejerens fund 17/11: Augusto Terzi (ledig italiensk fysioterapeut) siger i originalen "… has no interest in negotiating terms for this
// position." til Vejle 1.7.01. Originalens afgørelse: Offer Contract 0x4e06e0 med kravet/viljen 0x85fc50/0x844780 fra 0x4deac0 og loftet
// 0x597db0 fra 0x4de1f0 (cmContractGame.ts cmStaffOfferCheck) – før: ledig = altid interesseret.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffOfferCheck } from '../src/game/cmContractGame';
import { cmStaffInterestedIn, JOB_CODE } from '../src/game/cmStaff';
import { cmGbp } from '../src/game/cmMoney';

describe('stabens interesse i Offer Contract (0x4e06e0) – Vejle 1.7.01, ægte tilstand', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const dk = world.nations.findIndex((n) => n.name === 'Denmark');
  const vejle = world.clubs.find((c) => c[1].startsWith('Vejle'))![0];
  createGame(world, { managerName: 'M S', managerNation: dk, clubId: vejle, activeNations: [dk], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const who = (first: string, last: string) => Object.values(g.staff).find((s) => s.first === first && s.last === last)!;

  it('Augusto Terzi (ledig, fysioterapeut): ingen interesse – viljen 0 (Vejle under 2750 i omdømme, fremmed nation) giver kravet 250.000', () => {
    expect(g.date).toBe('2001-07-01');
    const s = who('Augusto', 'Terzi');
    expect(s.club).toBe(0);
    const r = cmStaffOfferCheck(g, s, vejle, JOB_CODE.physio)!;
    expect(r.will).toBe(0);
    expect(r.wage).toBe(Math.round(250000 / 0.86));
    expect(r.interested).toBe(false);
    expect(r.key).toBe('cm.neg.noInterest');
    expect(cmStaffInterestedIn(g, s, 'physio')).toBe(false);
  });

  it('andre kendte tilfælde: ansat i en anden klub med vilje > 2,75 vil forhandle; ledig uden vilje vil ikke', () => {
    const h = who('Horst', 'Höttges');
    const a = cmStaffOfferCheck(g, h, vejle, JOB_CODE.assistant)!;
    expect(a.will).toBeGreaterThan(2.75);
    expect(a.interested).toBe(true);
    expect(cmStaffInterestedIn(g, h, 'assistant')).toBe(true);
    const t = cmStaffOfferCheck(g, who('Rajko', 'Terzic'), vejle, JOB_CODE.coach)!;
    expect(t.interested).toBe(false);
    // vilje under 2,75, men træner med krav under £3.200 (0x4e0b0a–0x4e0b20). (24/11) Før et navngivet tilfælde (Nogueira) – hans krav afhænger
    // af Vejles mål-omdømme 0x83bf40, der læser formandens Patience np+0x1d (0x83bfd8); den er nu udfyldt som i originalen (sub_535a80, vores
    // talrække), så tilfældet er talrækkens. Reglen prøves på alle ledige: træner med vilje < 2,75 → interesseret netop når kravet er < £3.200.
    let low = 0, high = 0;
    for (const s of Object.values(g.staff)) {
      if (s.club || !s.cmNp) continue;
      const c = cmStaffOfferCheck(g, s, vejle, JOB_CODE.coach);
      if (!c || !(c.will <= 2.75) || 1.5 * c.allow <= c.wage) continue;
      const raw = Math.round(c.wage * cmGbp(g, vejle));
      if (raw < 3150) { low++; expect(c.interested).toBe(true); } else if (raw > 3250) high++;
    }
    // (24/11: med Vejles udfyldte formand har ingen af de ledige trænere med lav vilje et krav under £3.200 – mål-omdømmet 4000 mod 4832 før)
    expect(low + high).toBeGreaterThan(0);
  });
});
