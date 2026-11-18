// Ejerens fund 18/11 (Per Benjaminsen, AaB): i originalen er Offer Contract aktiv, også når personen "has no interest in negotiating terms for
// this position." – 0x4e06e0's grene mødes i 0x4e11b5 (loftet, rækkerne og Offer altid), og svaret afgøres af resolve_contract_offers 0x4ce4e0
// (cmContractGame.ts cmStaffContractAnswer): point = værdi(tilbud)/værdi(krav) − loyalitet; ≥ 0,9 → f = max(x, 3,15); ja når f·point > 2,75.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffContractAnswer, cmStaffOfferCheck } from '../src/game/cmContractGame';
import { cmOfferStaff, cmStaffOffersDaily, JOB_CODE } from '../src/game/cmStaff';

describe('svaret på kontrakttilbud til stab uden interesse (0x4ce4e0) – Vejle 1.7.01, ægte tilstand', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const dk = world.nations.findIndex((n) => n.name === 'Denmark');
  const vejle = world.clubs.find((c) => c[1].startsWith('Vejle'))![0];
  createGame(world, { managerName: 'M S', managerNation: dk, clubId: vejle, activeNations: [dk], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const exp = '2003-06-30';

  it('Augusto Terzi (krav 250.000 – over 1,5 × loftet): et tilbud på loftet afvises, kravet selv ville blive accepteret (point 1 ≥ 0,9 → 3,15 > 2,75)', () => {
    const s = Object.values(g.staff).find((x) => x.first === 'Augusto' && x.last === 'Terzi')!;
    const chk = cmStaffOfferCheck(g, s, vejle, JOB_CODE.physio)!;
    expect(chk.interested).toBe(false);
    const low = cmStaffContractAnswer(g, s, vejle, JOB_CODE.physio, { wage: chk.allow, signOn: 0, expires: exp })!;
    expect(low.score).toBe(0);
    expect(low.accept).toBe(false);
    const full = cmStaffContractAnswer(g, s, vejle, JOB_CODE.physio, { wage: chk.wage, signOn: 0, expires: exp })!;
    expect(full.score).toBeGreaterThanOrEqual(0.9);
    expect(full.accept).toBe(true);
  });

  it('Offer → svaret næste dag (cmStaffOffersDaily): loftet giver "rejects", kravet giver "accepts"', () => {
    const s = Object.values(g.staff).find((x) => x.first === 'Augusto' && x.last === 'Terzi')!;
    const chk = cmStaffOfferCheck(g, s, vejle, JOB_CODE.physio)!;
    const send = (wage: number) => {
      expect(cmOfferStaff(g, { staff: s.id, role: 'physio', wage, years: 2, signOn: 0 })).toBe('ok');
      g.cmStaffOffers![g.cmStaffOffers!.length - 1].date = '2001-06-30';
      cmStaffOffersDaily(g);
    };
    send(chk.allow);
    expect(g.news[0]?.key).toBe('cm.staffRejectsFree');
    expect(s.club).toBe(0);
    send(chk.wage);
    expect(['cm.staffAccepts', 'cm.staffNoRoom']).toContain(g.news[0]?.key);
  });
});
