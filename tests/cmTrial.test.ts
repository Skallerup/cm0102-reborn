// CM 01/02 Offer Trial (cmTrial.ts): menuen 0x8724a3 (kun klubløse), 0x8ce990 → "Cannot trial X" (0x8f0e40 art 2), Trial Period 0x8f8be0 → Yes 0x8fb9e0
// (tilbuddet type 5, svaret om rand(5) + 1 dage), svaret 0x4ce4e0 (0x846920 med status 8 ≥ 3,15), sign_contract 0x4cf720 (fuld trup → "trial
// cancelled", ellers trupstatus 8), slutningen 0x4c9b76 og kampreglen 0x8e8a60 (kode 3).
import { readFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, setClub, squad } from '../src/game/state';
import { SL_ON, cmHumanTrialCheck } from '../src/game/cmShortlistGame';
import { cmCanOfferTrial, cmOfferTrial, cmTrialDaily, onTrial, TRIAL_WAGE_GBP } from '../src/game/cmTrial';
import { cmTrialWill } from '../src/game/cmContractGame';
import { cmIneligible } from '../src/game/cmEligibility';
import { teamSelectionProblem } from '../src/game/teamSelection';
import { act } from '../src/game/actions';
import { addDays } from '../src/game/dates';
import { statusCode } from '../src/game/cmPlayerData';
import { cmNeedsPermit } from '../src/game/cmPermit';
import type { Fixture, Player } from '../src/game/types';

describe('Offer Trial (3.9.68, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const esp = world.nations.findIndex((n) => n.name === 'Spain');
  const mu = world.clubs.find((c) => c[2] === 'Man Utd')![0];
  const prev = SL_ON.on;
  afterAll(() => { SL_ON.on = prev; });
  createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng, esp], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  SL_ON.on = true;
  const g = gs();
  const frees = Object.values(g.players).filter((p) => !p.club && !p.loan && !p.virtual && !g.offers.some((o) => o.player === p.id));
  const will = new Map<number, number>();
  const w = (p: Player) => { if (!will.has(p.id)) will.set(p.id, cmTrialWill(g, p, mu) ?? 0); return will.get(p.id)!; };
  const used = new Set<number>();
  const pick = (ok: boolean) => { const p = frees.find((x) => !used.has(x.id) && !x.club && !cmNeedsPermit(g, x, mu, true) && (w(x) >= 3.15) === ok)!; if (p) used.add(p.id); return p; };
  /** spillets dage frem til `iso` (kun prøvetidens dag – resten af motoren står stille) */
  const dayTo = (iso: string) => { while (g.date < iso) { g.date = addDays(g.date, 1); cmTrialDaily(g); } };
  const news = (key: string, pid: number) => g.news.some((n) => n.key === key && n.link?.kind === 'player' && n.link.id === pid);

  it('menuen: kun klubløse – ikke en spiller med klub', () => {
    const withClub = Object.values(g.players).find((p) => p.club > 0 && p.club !== mu)!;
    expect(cmCanOfferTrial(g, withClub)).toBe(false);
    expect(cmCanOfferTrial(g, frees[0])).toBe(true);
    expect(cmHumanTrialCheck(g, frees[0], mu)).toEqual({ ok: true });
  });

  it('tilbud → ja → på prøve (type 5, trupstatus 8, £200) → slut: forlader klubben', () => {
    const p = pick(true);
    expect(p).toBeTruthy();
    const start = g.date;
    expect(act({ t: 'cmTrial', pid: p.id, weeks: 2 })).toBe('ok');
    expect(cmCanOfferTrial(g, p)).toBe(false);                               // 0x4cc9e0: tilbuddet findes
    const o = g.cmTrials!.find((x) => x.pid === p.id)!;
    const days = (Date.parse(o.due) - Date.parse(start)) / 86400000;
    expect(days).toBeGreaterThanOrEqual(1);
    expect(days).toBeLessThanOrEqual(5);
    dayTo(o.due);
    expect(p.club).toBe(mu);
    expect(onTrial(p)).toBe(true);
    expect(p.contract!.expires).toBe(addDays(o.due, 14));
    expect(statusCode(p)).toBe(8);
    expect(Math.round(p.contract!.wage * (g.cmGbp ? 1 : 1))).toBeGreaterThan(0);
    expect(TRIAL_WAGE_GBP).toBe(200);
    expect(news('cmTrial.accepts', p.id)).toBe(true);
    // kampen: ligakampen kode 3 (Team Selection "Trialist … is not allowed to play in this fixture."), venskabskampen 0
    const opp = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!;
    const lg: Fixture = { id: 990001, comp: g.clubs[mu].league, date: g.date, home: mu, away: opp.id, round: 1 };
    const fr: Fixture = { id: 990002, comp: 'FRIENDLY', date: g.date, home: mu, away: opp.id, round: 1 };
    expect(cmIneligible(g, p, lg)).toBe(3);
    expect(cmIneligible(g, p, fr)).toBe(0);
    expect(teamSelectionProblem(g, mu, lg, [p.id])).toMatchObject({ key: 'trial', ids: [p.id] });
    dayTo(p.contract!.expires);
    expect(p.club).toBe(0);
    expect(p.contract).toBeNull();
    expect(news('cmTrial.finishes', p.id)).toBe(true);
  });

  it('afvisning: "rejects trial offer", han forbliver klubløs', () => {
    const p = pick(false);
    expect(p).toBeTruthy();
    expect(cmOfferTrial(g, p.id, 1)).toBe('ok');
    dayTo(g.cmTrials!.find((x) => x.pid === p.id)!.due);
    expect(p.club).toBe(0);
    expect(g.news.filter((n) => n.key.startsWith('cmTrial.') && n.link?.id === p.id).map((n) => n.key)).toEqual(['cmTrial.rejects']);
    expect(g.cmTrials?.some((x) => x.pid === p.id) ?? false).toBe(false);
  });

  it('fuld trup (0x53c590 + 1 > 50): "trial cancelled", ingen accept', () => {
    const p = pick(true);
    expect(cmOfferTrial(g, p.id, 4)).toBe('ok');
    const fill = Object.values(g.players).filter((x) => !x.club && !x.virtual && x.id !== p.id).slice(0, Math.max(0, 50 - squad(mu).filter((x) => !x.virtual).length));
    for (const x of fill) setClub(x, mu);
    dayTo(g.cmTrials!.find((x) => x.pid === p.id)!.due);
    expect(p.club).toBe(0);
    expect(news('cmTrial.cancelled', p.id)).toBe(true);
    expect(news('cmTrial.accepts', p.id)).toBe(false);
    for (const x of fill) setClub(x, 0);
  });

  it('nationalitetsreglen (0x8ce990 grund 0x19): Athletic Bilbao må ikke give ikke-baskiske spillere prøvetræning', () => {
    const ath = Object.values(g.clubs).find((c) => /Athletic/.test(c.name) && g.nations[c.nation]?.name === 'Spain');
    if (!ath) return;
    const basque = g.nations.findIndex((n) => n.name === 'Pays Basque');
    const p = frees.find((x) => !x.club && x.nation !== basque && x.cmNation2 !== basque)!;
    const r = cmHumanTrialCheck(g, p, ath.id)!;
    expect(r.ok).toBe(false);
    expect(r.head).toBe('cannot');
    expect(r.msg?.key).toBe('cl.trialr.nonNat');
  });
});
