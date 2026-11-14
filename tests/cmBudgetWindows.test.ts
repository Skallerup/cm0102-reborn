// CM 01/02 i ægte tilstand: transfervinduerne pr. nation (TRANSFER_RULES 0x8e8800/0x8e8c40, cmOfferCheck.ts) i windowOpen/nextWindow/
// windowLastDay, "skal have arbejdstilladelse" som 0x8c7560 (cmPermit.ts), og transferbudgettet 0x598800 (cmBudget.ts, endnu ikke koblet ind).
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { windowLastDay, windowOpen, nextWindow, makeBid } from '../src/game/transfers';
import { cmInWindow, cmWindowOpen, CM_WINDOWS } from '../src/game/cmOfferCheck';
import { needsWorkPermit } from '../src/game/rules2001';
import { cmTransferBudget } from '../src/game/cmBudget';
import { addDays } from '../src/game/dates';
import type { Club, GameState } from '../src/game/types';

describe('vinduerne pr. nation (ren tabel)', () => {
  const fake = (nation: string) => ({ nations: [{ name: nation }] }) as unknown as GameState;
  const club = { nation: 0 } as Club;
  it('Danmark og Sverige har ingen vinduer = altid åbent', () => {
    expect(CM_WINDOWS.Denmark).toBeUndefined();
    for (const d of ['2002-01-15', '2002-04-10', '2002-07-20']) expect(cmWindowOpen(fake('Denmark'), club, d)).toBe(true);
  });
  it('Tyskland: 1/7–15/8 og 1/7–15/1 (løber over nytår) – lukket februar–juni og 16/8–30/6 uden for vinduet 2', () => {
    const g = fake('Germany');
    expect(cmWindowOpen(g, club, '2002-02-10')).toBe(false);
    expect(cmWindowOpen(g, club, '2002-05-01')).toBe(false);
    expect(cmWindowOpen(g, club, '2002-07-01')).toBe(true);
    expect(cmWindowOpen(g, club, '2002-01-10')).toBe(true);
  });
  it('Frankrig: tre vinduer med ugedage; Tyrkiet 1/6–31/1', () => {
    const g = fake('France');
    expect(cmWindowOpen(g, club, '2002-02-10')).toBe(false);
    expect(cmWindowOpen(g, club, '2001-07-10')).toBe(true);
    expect(cmWindowOpen(fake('Turkey'), club, '2001-09-01')).toBe(true);
    expect(cmWindowOpen(fake('Turkey'), club, '2002-03-01')).toBe(false);
  });
});

describe('ægte tilstand: England 2001/02 (3.9.60)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  let g: GameState;
  beforeAll(() => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    g = gs();
  }, 600_000);

  it('windowOpen følger englands vindue (åbent 2/6–26/3, lukket sidst i marts til start juni)', () => {
    expect(windowOpen('2001-07-14', mu)).toBe(true);
    expect(windowOpen('2002-01-10', mu)).toBe(true);
    expect(windowOpen('2002-04-20')).toBe(false);     // uden klub = menneskets klub
    expect(windowOpen('2002-05-20', mu)).toBe(false);
    expect(windowOpen('2002-06-10', mu)).toBe(true);
  });
  it('nextWindow er den første åbne dag, og windowLastDay den sidste', () => {
    const n = nextWindow('2002-04-20', mu);
    expect(n > '2002-05-25' && n < '2002-06-10').toBe(true);
    expect(cmInWindow(CM_WINDOWS.England[0], n)).toBe(true);
    expect(cmInWindow(CM_WINDOWS.England[0], addDays(n, -1))).toBe(false);
    const last = windowLastDay('2002-01-10', mu)!;
    expect(last >= '2002-03-26' && last <= '2002-03-31').toBe(true);
    expect(windowOpen(addDays(last, 1), mu)).toBe(false);
  });
  it('et bud uden for vinduet afvises', () => {
    const save = g.date;
    g.date = '2002-05-01';
    const other = Object.values(g.players).find((p) => p.club && p.club !== mu && !p.loan)!;
    expect(makeBid(other.id, 1)).toBe('transfer.windowClosed');
    g.date = save;
  });
  it('arbejdstilladelse: kun spillere uden for EU/Schweiz/de britiske øer skal have en (0x8c7560)', () => {
    const club = g.clubs[mu];
    const by = (nm: string) => Object.values(g.players).find((p) => g.nations[p.nation]?.name === nm && p.club && !p.loan);
    const br = by('Brazil'), fr = by('France'), ie = by('Republic of Ireland');
    if (br) expect(needsWorkPermit(br, club)).toBe(true);
    if (fr) expect(needsWorkPermit(fr, club)).toBe(false);
    if (ie) expect(needsWorkPermit(ie, club)).toBe(false);
  });
  it('transferbudgettet 0x598800 på spillets hukommelse: ikke negativt, og et rigt klub har mere end en fattig', () => {
    const poor = Object.values(g.clubs).find((c) => c.name === 'Bury')!;
    const a = cmTransferBudget(g, mu)!, b = cmTransferBudget(g, poor.id)!;
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThanOrEqual(0);
  });
});
