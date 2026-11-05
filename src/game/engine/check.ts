// Quick check of cm0102-original-rules.ts: run with `npx tsx check.ts`.
import * as R from './cm0102-original-rules';

let ok = true;
const expect = (name: string, cond: boolean) => {
  if (!cond) ok = false;
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}`);
};
for (const ca of [40, 100, 150, 181, 200]) {
  let round = true;
  for (let v = 1; v <= 20; v++) {
    const x = R.intrinsicFromShown(ca, v);
    if (R.shownAttribute(ca, x) !== v) round = false;
  }
  expect(`shown -> intrinsic -> shown round trip at CA ${ca}`, round);
}
expect('referee Discipline 1/10/15/20 = 0.55/1/1.5/2', [1, 10, 15, 20].map(R.refereeFactor).map((v) => v.toFixed(2)).join() === '0.55,1.00,1.50,2.00');
expect('rating 6.1 shows 6, 6.5 shows 7', R.ratingShown(6.1) === 6 && R.ratingShown(6.5) === 7);
expect('stamina factor at 25 with stamina 10 is 14', R.staminaFactor(10, 25) === 14);
expect('goal threshold: S = 2.5 K scores, S = 2.4 K does not', R.isGoal(250, 100) && !R.isGoal(240, 100));
expect('a professional foul is red 87.5 % of the time', Math.abs(R.PROFESSIONAL_FOUL_RED - 0.8747) < 0.001);
expect('yellow at 90 minutes costs half', Math.abs(R.yellowRatingDelta(90) + 0.1125) < 1e-9);
const rand = R.randFrom(Math.random);
let added = 0;
for (let i = 0; i < 40; i++) added += R.deadBall(rand).stoppageTicks;
expect(`40 dead balls add ${R.addedMinutes(added)} minutes (expected 3-7)`, R.addedMinutes(added) >= 2 && R.addedMinutes(added) <= 8);
console.log(ok ? 'all checks passed' : 'some checks failed');
if (!ok) throw new Error('rules check failed');
