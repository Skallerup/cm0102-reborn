// Landsholdsfodbold, del 3 (cmIntlFinals.ts, cmVirtual.ts' landsholdsgren, international.ts intlCodes): slutrundernes kampprogram som originalen
// (tv-pladserne fra create_schedule 0x92c290/0x4012e0/0x5e0900), landsholdenes fyldspillere 0x90dc66 og landskampenes fixture-koder.
import { describe, expect, it } from 'vitest';
import { ACN_TV, COPA_TV, WC_TV, groupMatches } from '../src/game/cmIntlFinals';
import { cmDate } from '../src/game/cmCalendar';
import { nationalPlan, GROUP_TARGET_NAT } from '../src/game/cmVirtual';
import { intlCodes } from '../src/game/international';
import type { Player } from '../src/game/types';

const doy = (iso: string) => Math.round((Date.parse(iso) - Date.UTC(+iso.slice(0, 4), 0, 1)) / 86400000);
const groups = (k: number) => Array.from({ length: k }, (_, i) => [0, 1, 2, 3].map((j) => i * 4 + j));

describe('slutrundernes kampprogram', () => {
  it('Copa América 2001: de 18 gruppekampe på oraklets dage (crowd1: 184, 185, 186–193 ×2)', () => {
    const rounds = [cmDate(6, 6, 2001, 3), cmDate(10, 6, 2001, 0), cmDate(13, 6, 2001, 3)];
    const days = groupMatches(groups(3), rounds, COPA_TV).map((m) => doy(m.d)).sort((a, b) => a - b);
    expect(days).toEqual([184, 185, 186, 186, 187, 187, 188, 188, 189, 189, 190, 190, 191, 191, 192, 192, 193, 193]);
  });
  it('Afrikamesterskabet 2002: gruppespillet 9/2–19/2 (oraklet: fra dag 39)', () => {
    const m = groupMatches(groups(4), ['2002-02-10', '2002-02-14', '2002-02-18'], ACN_TV);
    expect(m.length).toBe(24);
    expect(doy(m[0].d)).toBe(39);
    expect(m.at(-1)!.d).toBe('2002-02-19');
  });
  it('VM 2002: gruppe A 12/6, 18/6, 25/6; gruppe G\'s sidste kamp bliver på rundens dato', () => {
    const rounds = [cmDate(12, 5, 2002, 4), cmDate(19, 5, 2002, 4), cmDate(24, 5, 2002, 2)];
    expect(rounds).toEqual(['2002-06-14', '2002-06-21', '2002-06-26']);
    const m = groupMatches(groups(8), rounds, WC_TV);
    expect([...new Set(m.filter((x) => x.grp === 0).map((x) => x.d))]).toEqual(['2002-06-12', '2002-06-18', '2002-06-25']);
    expect(m.filter((x) => x.grp === 6 && x.d === '2002-06-26').length).toBe(1);
  });
});

describe('landsholdenes fyldspillere (0x90dc66)', () => {
  const p = (gk: boolean): Player => ({ pos: gk ? [20, 1, 1, 1, 1, 1, 1, 1] : [1, 1, 1, 1, 1, 1, 20, 1], side: [1, 20, 1], injury: null, banned: 0 }) as unknown as Player;
  it('en trup uden spillere får 25 (højst 25 nye), fordelt efter række 1', () => {
    const plan = nationalPlan([], 26, false, true);
    expect(plan.filter((s) => s.kind === 'first').length).toBe(25);
    expect(plan.filter((s) => s.grp === 0).length).toBeLessThanOrEqual(GROUP_TARGET_NAT[0]);
  });
  it('en fuld trup får ingen; en trup på 20 får 6 (ud over målet bliver det fantomer)', () => {
    expect(nationalPlan(Array.from({ length: 26 }, () => p(false)), 26, false, true).length).toBe(0);
    const plan = nationalPlan([p(true), ...Array.from({ length: 19 }, () => p(false))], 26, false, true);
    expect(plan.filter((s) => s.kind === 'first').length).toBe(6);
    expect(plan.some((s) => s.kind === 'phantom')).toBe(true);
  });
});

describe('landskampenes fixture-koder (crowd1.txt)', () => {
  it('venskabskampe og U21 +0x3a = 9, turneringerne 10; slutrundernes +0x3c = 1; finalen 150', () => {
    expect(intlCodes('friendly')).toEqual({ b3a: 9, w30: 0, b3c: 0, compId: 72 });
    expect(intlCodes('u21').compId).toBe(401);
    expect(intlCodes('copa', 'QF')).toEqual({ b3a: 10, w30: 120, b3c: 1, compId: 407 });
    expect(intlCodes('wc', 'F').w30).toBe(150);
    expect(intlCodes('wcq', 'F1').w30).toBe(153);
  });
});
