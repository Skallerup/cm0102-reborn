// Regelfilen med CM 01/02's originale motorregler (src/game/engine/cm0102-original-rules.ts) – samme tjek som check.ts.
import { describe, expect, it } from 'vitest';
import * as R from '../src/game/engine/cm0102-original-rules';

describe('CM 01/02 originale regler', () => {
  it('vist → intrinsisk → vist giver samme værdi', () => {
    for (const ca of [40, 100, 150, 181, 200]) for (let v = 1; v <= 20; v++) expect(R.shownAttribute(ca, R.intrinsicFromShown(ca, v))).toBe(v);
  });
  it('dommerens disciplin 1/10/15/20 = 0,55/1/1,5/2', () => {
    expect([1, 10, 15, 20].map(R.refereeFactor).map((v) => v.toFixed(2))).toEqual(['0.55', '1.00', '1.50', '2.00']);
  });
  it('karakter 6,1 vises som 6 og 6,5 som 7', () => { expect(R.ratingShown(6.1)).toBe(6); expect(R.ratingShown(6.5)).toBe(7); });
  it('udholdenhedsfaktor ved 25 år og stamina 10 er 14', () => expect(R.staminaFactor(10, 25)).toBe(14));
  it('måltærskel: S = 2,5 K scorer, S = 2,4 K gør ikke', () => { expect(R.isGoal(250, 100)).toBe(true); expect(R.isGoal(240, 100)).toBe(false); });
  it('+2-bonussen (type 2/8) gives kun ved højst 68 og laver aldrig et mål; straffe går altid på mål', () => {
    expect(R.isGoal(240, 100, true)).toBe(false); // 70,6 > 68: ingen bonus
    expect(R.isGoal(212, 100, true)).toBe(false); // 67,9 + 2 = 69,9
    expect(R.onTarget(151, true)).toBe(true);
    const r = (n: number) => n - 1;
    expect(R.penaltyShotScore(r, 10)).toBe(199);
  });
  it('professionelt frispark er rødt 87,5 % af gangene', () => expect(Math.abs(R.PROFESSIONAL_FOUL_RED - 0.8747)).toBeLessThan(0.001));
  it('gult kort efter 90 minutter koster det halve', () => expect(R.yellowRatingDelta(90)).toBeCloseTo(-0.1125, 9));
  it('40 døde bolde giver 2–8 minutters tillægstid', () => {
    let s = 1; const rand = R.randFrom(() => ((s = (s * 16807) % 2147483647) / 2147483647));
    let added = 0;
    for (let i = 0; i < 40; i++) added += R.deadBall(rand).stoppageTicks;
    expect(R.addedMinutes(added)).toBeGreaterThanOrEqual(2);
    expect(R.addedMinutes(added)).toBeLessThanOrEqual(8);
  });
});
