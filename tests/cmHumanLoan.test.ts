// CM 01/02: menneskets Approach To Loan (Action-menuen 0x888260 → 0x8f9690) – arbejdstilladelsen 0x8c7560 (0x8f0e40 grund 0x29), 0x8ce990 og
// can_loan_player 0x8d0040 med beskeden i "Loan offer for {spiller}" (0xa9edcc), og Recall-dialogens 0x8d0530 (0x8fbcc0).
import { readFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { SL_ON, cmHumanLoanCheck } from '../src/game/cmShortlistGame';
import { needsWorkPermit } from '../src/game/rules2001';
import { loanApproach, recallRule } from '../src/game/transfers';

describe('Approach To Loan (3.9.68, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[2] === 'Man Utd')![0];
  const prev = SL_ON.on;
  afterAll(() => { SL_ON.on = prev; });
  createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  SL_ON.on = true;
  const g = gs();
  const me = g.clubs[mu];
  const engN = g.nations.findIndex((n) => n.name === 'England');
  const free = (pred: (league: string) => boolean, nat?: (n: number) => boolean) => Object.values(g.players).find((p) => p.club > 0 && p.club !== mu && !p.loan && p.contract
    && pred(g.clubs[p.club]?.league ?? '') && (!nat || nat(p.nation)) && !g.offers.some((o) => o.player === p.id))!;
  const prem = me.league;

  it('en spiller i Premier Division: "Players may not be loaned between clubs in the English Premier Division." (0x579d60 → 0x9c4590)', () => {
    const p = free((l) => l === prem, (n) => n === engN);
    const r = cmHumanLoanCheck(g, p, mu)!;
    expect(r).toMatchObject({ ok: false, head: 'offer', msg: { key: 'cl.loanr.sameComp' } });
    expect(String(r.msg!.params!.comp)).toMatch(/Premier/);
    expect(loanApproach(p.id)).toEqual(r);
  });
  it('en engelsk spiller i en anden division i vinduet: lejebudskærmen', () => {
    const p = Object.values(g.players).find((x) => x.club > 0 && !x.loan && x.contract && x.nation === engN && g.clubs[x.club]?.nation === me.nation && g.clubs[x.club].league !== prem && !g.leagues[g.clubs[x.club].league]?.hidden && !g.offers.some((o) => o.player === x.id))!;
    expect(cmHumanLoanCheck(g, p, mu)).toEqual({ ok: true });
  });
  it('arbejdstilladelsen først (0x8c7560 → 0x8f0e40 grund 0x29): "Cannot loan" + "… are not allowed to loan non-EU players."', () => {
    const p = Object.values(g.players).find((x) => x.club > 0 && x.club !== mu && !x.loan && x.contract && needsWorkPermit(x, me))!;
    expect(cmHumanLoanCheck(g, p, mu)).toEqual({ ok: false, head: 'cannot', msg: { key: 'cl.pl.loanNonEu', params: { club: me.short || me.name } } });
  });
  it('Recall mellem engelske klubber: England har ingen +0x24 → må', () => {
    const p = free((l) => l !== prem, (n) => n === engN);
    expect(recallRule(p.id)).toEqual({ ok: true });
  });
});
