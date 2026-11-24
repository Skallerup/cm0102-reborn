// (16/11) Sæsonskiftet pr. land (cmSeason.ts, game_season_update_pass 0x5d5ae0): Norge skifter 27/11, Europa 20/6 – hver for sig, uden at røre
// det andet lands sæson. For at holde testen hurtig spilles turneringerne færdig med playOverdue (zonemotoren) og datoen springes frem.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, playOverdue, quickPlayUserMatch } from '../src/game/sim';
import { LEAGUE_RULES } from '../src/game/leagues';
import { finalOrder } from '../src/game/competitions';
import { addDays } from '../src/game/dates';
import { cmSeasonDue, cmUpdateDay, seasonYearAfter } from '../src/game/cmSeason';

const step = (to: string) => {
  const g = gs();
  g.date = addDays(to, -1);   // continueGame → newDay går til `to`
  g.dayDone = true;
  g.pendingFixture = null;
  // datospringet springer menneskets kampe over: playMissedUserFixtures spillede dem ellers alle på én dag (konditionen ~10 %, halvdelen skadet –
  // efter et par måneder for få spillere til en opstilling, afhængigt af talrækken). De markeres som spillet (0–0); kun turneringerne tælles her.
  for (const f of Object.values(g.fixtures)) if (!f.result && f.date < g.date && (f.home === g.userClub || f.away === g.userClub)) f.result = { hg: 0, ag: 0, scorers: [] };
  const r = continueGame();
  if (r.match) quickPlayUserMatch();
};

describe('sæsonskiftet pr. land', () => {
  it('dagene og årene', () => {
    expect(seasonYearAfter('2001-11-27')).toBe(2002);
    expect(seasonYearAfter('2002-01-25')).toBe(2002);
    expect(seasonYearAfter('2002-06-20')).toBe(2002);
    expect(seasonYearAfter('2002-07-31')).toBe(2002);
  });

  it('Norge 27/11 og England 20/6', () => {
    const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const n = (nm: string) => world.nations.findIndex((x) => x.name === nm);
    const eng = n('England'), nor = n('Norway');
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng, nor], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    g.options.engine = 'zone';
    expect(g.date).toBe('2001-07-14');
    expect(cmUpdateDay(g, nor)).toBe('11-27');
    expect(cmUpdateDay(g, eng)).toBe('06-20');
    expect(g.cmNatSeason?.[nor]).toBe(2001);
    const norLeagues = Object.values(g.comps).filter((c) => c.type === 'league' && c.nation === nor).map((c) => c.id);
    expect(norLeagues.length).toBe(2);
    // forkørslen: Norges kampe fra april til starten er spillet
    const unplayedPast = () => Object.values(g.fixtures).filter((f) => g.comps[f.comp]?.nation === nor && !f.result && f.date < g.date).length;
    expect(unplayedPast()).toBe(0);
    const top = norLeagues.find((id) => g.leagues[id].tier === 1)!, second = norLeagues.find((id) => g.leagues[id].tier === 2)!;
    expect(Object.values(g.fixtures).some((f) => f.comp === top && f.result)).toBe(true);

    // Norges sæson spilles færdig; en engelsk og en norsk spiller får sæsontal, som ikke må forsvinde i det andet lands skifte
    playOverdue(Object.values(g.comps).filter((c) => c.nation === nor).map((c) => c.id), null);
    expect(g.comps[top].finished && g.comps[second].finished).toBe(true);
    const order = (id: string) => finalOrder(g.comps[id]);
    const champion = g.comps[top].winner!;
    const relegated = LEAGUE_RULES[top]?.relegated ?? 0;
    expect(relegated).toBeGreaterThan(0);
    const engComp = g.comps.CM7, engFixtures = Object.values(g.fixtures).filter((f) => f.comp === 'CM7').length;
    const engP = Object.values(g.players).find((p) => g.clubs[p.club]?.nation === eng && p.contract)!;
    engP.stats.apps = 7;
    const norP = Object.values(g.players).find((p) => g.clubs[p.club]?.league === top && p.stats.apps > 0)!;
    const norHist = norP.history.length;

    step('2001-11-26');
    expect(cmSeasonDue(g).nations).toEqual([]);
    // (en eventuel nedrykningsplayoff kan redde/sende én mere – de nederste `relegated` uden for playoffen rykker ned)
    const bottom = order(top).slice(-relegated).filter((c) => !Object.values(g.comps).some((x) => x.type === 'playoff' && x.clubs.includes(c)));
    step('2001-11-27');
    expect(g.date).toBe('2001-11-27');
    expect(g.season).toBe(2001);
    expect(g.cmNatSeason?.[nor]).toBe(2002);
    // Norge: ny sæson 2002 med op- og nedrykning, kampprogram fra foråret 2002
    expect(g.comps[top].meta?.cmYear).toBe(2002);
    expect(g.comps[top].finished).toBe(false);
    const nf = Object.values(g.fixtures).filter((f) => f.comp === top);
    expect(nf.length).toBeGreaterThan(100);
    expect(nf.every((f) => !f.result && f.date >= '2002-03-01' && f.date <= '2002-12-31')).toBe(true);
    for (const c of bottom) expect(g.clubs[c].league).toBe(second);
    expect(g.cmLastTables?.[top]?.[0]).toBe(champion);
    expect(g.seasonHistory.find((s) => s.season === 2001)?.comps.find((c) => c.id === top)?.winner).toBe(champion);
    expect(g.comps[`CUP-${nor}`]?.finished).toBe(false);
    // spillernes sæsontal: Norges arkiveret, Englands urørt
    expect(norP.stats.apps).toBe(0);
    expect(norP.history.length).toBe(norHist + 1);
    expect(norP.history.at(-1)!.season).toBe(2001);
    expect(engP.stats.apps).toBe(7);
    // England: samme turnering og samme kampe
    expect(g.comps.CM7).toBe(engComp);
    expect(Object.values(g.fixtures).filter((f) => f.comp === 'CM7').length).toBe(engFixtures);

    // Europa 20/6: England skifter, Norges 2002-sæson kører videre
    const engIds = Object.values(g.comps).filter((c) => c.nation === eng).map((c) => c.id);
    playOverdue(engIds, null);
    expect(g.comps.CM7.finished && g.comps.CM8.finished).toBe(true);
    const plChamp = g.comps.CM7.winner!;
    const norComp = g.comps[top], norFixtures = Object.values(g.fixtures).filter((f) => f.comp === top).length;
    norP.stats.apps = 3;
    const engDown = order('CM7').slice(-3);
    step('2002-06-19');
    expect(g.season).toBe(2001);
    step('2002-06-20');
    expect(g.season).toBe(2002);
    expect(g.comps.CM7.meta?.cmYear).toBe(2002);
    expect(Object.values(g.fixtures).filter((f) => f.comp === 'CM7').every((f) => !f.result && f.date >= '2002-08-01')).toBe(true);
    for (const c of engDown) expect(g.clubs[c].league).toBe('CM8');
    expect(g.comps[top]).toBe(norComp);
    expect(Object.values(g.fixtures).filter((f) => f.comp === top).length).toBe(norFixtures);
    expect(g.cmNatSeason?.[nor]).toBe(2002);
    // (24/11) Norges sæsontal nulstilles ikke ved Englands skifte – spilleren kan have spillet flere kampe imens (fx en flytning eller pokal)
    expect(norP.stats.apps).toBeGreaterThanOrEqual(3);
    expect(engP.stats.apps).toBe(0);
    const h = g.seasonHistory.find((s) => s.season === 2001)!;
    expect(h.comps.find((c) => c.id === 'CM7')?.winner).toBe(plChamp);
    expect(h.comps.find((c) => c.id === top)?.winner).toBe(champion);
    // Europas nye sæson oprettes ved skiftet 20/6 – Norges mester fra 2001 (gemt 27/11) er med
    expect(g.comps.CL?.meta?.year).toBe(2002);
    expect(g.cmEuroPrev).toBeUndefined();
    expect(g.cmEuroNext).toBeUndefined();
    expect(g.comps.CL.clubs).toContain(champion);
    expect(g.comps.CL.clubs).toContain(plChamp);
  }, 1_800_000);
});
