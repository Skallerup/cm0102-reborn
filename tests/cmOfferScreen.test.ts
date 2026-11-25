// Offer Contract-skærmen 0x4e06e0 (via 0x4deac0) for et tilbud til en spiller fra en anden klub (ejerens fund 25/11: Lúcio "Interested" i Player
// Search, men "no interest" som Key Player; Ronaldinho: Offer grå ved en løn lig bestyrelsens loft). Originalen: kravet 0x85fc50 med den valgte
// trupstatus og viljen fra dets ud-felt (skærmparameter 0x1a = ftol(vilje · 1000)) – ikke Player Search' 0x846920(…, 1, 0, 1), som har
// lønevne-grenen (a2 = 1) – og grenene: W ≥ 1,5 · loftet → no interest (p16 = 0x4ce450 vælger statusteksten eller vilje/grunde/"absolutely no
// interest in joining"); under: vilje > 2,75 → kravet, ellers alder ≥ 24 → no interest. Offer er aldrig grå (0x4deac0 laver Back/Cancel/Offer uden betingelse).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmOfferScreenData } from '../src/game/cmContractGame';
import { cmOfferScreen } from '../src/game/cmTransferTalks';
import { cmBoardWageAllowGbp } from '../src/game/cmBudget';
import { t } from '../src/i18n';
import type { Player } from '../src/game/types';

describe('Offer Contract 0x4e06e0 (3.9.60, ægte tilstand, Man Utd)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const find = (first: string, last: string, club: string): Player =>
    Object.values(g.players).find((p) => p.first === first && p.last === last && g.clubs[p.club]?.name.includes(club))!;

  it('under 1,5 × loftet, vilje ≤ 2,75 og alder ≥ 24: no interest (Ballack som Key Player) – ellers kravet', () => {
    const p = find('Michael', 'Ballack', 'Leverkusen');
    const d = cmOfferScreenData(g, p, mu, 'key')!;
    const allow = cmBoardWageAllowGbp(g, p, mu, 'key')!;
    expect(d.wageGbp).toBeLessThan(1.5 * allow);
    expect(d.will).toBeLessThanOrEqual(2.75);
    expect(d.age).toBeGreaterThanOrEqual(24);
    expect(cmOfferScreen(g, p, mu, 'key')?.key).toMatch(/^cm\.neg\.noIntTerms/);
  });

  it('kravet ved den spærrede løn (250.000) og p16 over 1,5 × loftet: viljen under 3,15 → grundene eller "no interest" (Lúcio)', () => {
    const p = find('', 'Lúcio', 'Leverkusen');
    const d = cmOfferScreenData(g, p, mu, 'key')!;
    expect(d.wageGbp).toBe(250000);
    expect(d.p16).toBeGreaterThan(1.5 * cmBoardWageAllowGbp(g, p, mu, 'key')!);
    const o = cmOfferScreen(g, p, mu, 'key')!;
    expect(o.key === 'cm.neg.noIntTerms.because' || o.key === 'cm.neg.noIntJoin' || o.key === 'cm.neg.noIntTerms').toBe(true);
  });

  it('viljen er kravets ud-felt med den valgte status (parameter 0x1a, tre decimaler)', () => {
    const p = find('Michael', 'Ballack', 'Leverkusen');
    const a = cmOfferScreenData(g, p, mu, 'key')!, b = cmOfferScreenData(g, p, mu, 'rotation')!;
    expect(a.status).toBe(1);
    expect(b.status).toBe(3);
    expect(Math.round(a.will * 1000)).toBeCloseTo(a.will * 1000, 3);
    expect(a.will).toBeGreaterThan(b.will);
  });

  it('teksten "has absolutely no interest in joining" er exe-strengen 0x9b08f8', () => {
    expect(t('cm.neg.noIntJoin', { player: 'Lúcio', club: 'Manchester United' })).toBe('Lúcio has absolutely no interest in joining Manchester United.');
  });
});
