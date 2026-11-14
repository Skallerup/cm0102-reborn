// CONTRACT_MANAGER::daily_update 0x4c7ac0 på spillets data (src/game/cmContractManager.ts): computerklubbernes forlængelser, udløb og
// frigivelser som i CM 01/02 – kun den originale database i ægte tilstand.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmCmScope, cmContractManagerDay } from '../src/game/cmContractManager';
import { cmContractEnd } from '../src/game/cmContractEnd';
import type { GameState, Player } from '../src/game/types';

let g: GameState;
const addDays = (iso: string, n: number) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const scoped = () => Object.values(g.players).filter((p) => cmCmScope(g, p));

beforeAll(() => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const user = world.clubs.find((c) => c[1] === 'Arsenal')![0];
  createGame(world, { managerName: 'T', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}, 600_000);

describe('0x4c7ac0 på spillets data', () => {
  it('kun computerklubber i de spilbare lande – menneskets spillere og de udlejede har spillets eget system', () => {
    const ps = scoped();
    expect(ps.length).toBeGreaterThan(3000);
    expect(ps.some((p) => p.club === g.userClub)).toBe(false);
    expect(ps.every((p) => !p.loan && g.clubs[p.club].nation === g.clubs[g.userClub].nation)).toBe(true);
  });

  it('juli: forlængelsestilbuddene ([0xae2330] − 42 = 20/7) afgøres 1–14 dage senere og bliver spillets kontrakter', () => {
    expect(g.date).toBe('2001-07-14');
    const before = new Map(scoped().map((p) => [p.id, p.contract!.expires]));
    for (let d = g.date; d <= '2001-08-02'; d = addDays(d, 1)) { g.date = d; cmContractManagerDay(g); }
    const renewed = scoped().filter((p) => before.has(p.id) && p.contract!.expires !== before.get(p.id));
    // originalen (frø 1, 14/7 → 31/7-2001): 307 forlængelser i engelske klubber; spillet har kun 4 rækker, men samme regler
    expect(renewed.length).toBeGreaterThan(100);
    for (const p of renewed) {
      expect(p.contract!.cmStart! >= '2001-07-15').toBe(true);
      expect(p.contract!.expires > before.get(p.id)!).toBe(true);
      expect(p.contract!.wage).toBeGreaterThan(0);
      expect(p.cmContract?.b4f).toBeDefined();
    }
    // tilbuddene fra 20/7 er afgjort (højst 14 dage), de nye fra 1/8 venter
    expect(g.cmCm!.dec.every((d) => d[2] === 2001 && d[1] >= 212)).toBe(true);
  });

  it('udløbsdagen: sat fri (+0x49) → fri transfer; ellers type 1 og bliver i klubben – 31 dage efter går han, hvis han er sat fri', () => {
    const ps = scoped().filter((p) => p.contract!.expires > '2003-01-01').slice(0, 3) as Player[];
    const [a, b, c] = ps;
    g.date = '2001-09-10';
    for (const p of ps) { p.contract!.expires = g.date; delete p.contract!.cmType; }
    a.contract!.cmB49 = 1;
    const ca = a.club, cb = b.club;
    cmContractManagerDay(g);
    expect(a.club).toBe(0);
    expect(a.contract).toBeNull();
    expect(b.club).toBe(cb);
    expect(b.contract!.cmType).toBe(1);
    expect(ca).toBeGreaterThan(0);
    // 32 dage efter: c er stadig der (vil ikke væk), men sat fri går han
    c.contract!.cmType = 1;
    c.contract!.cmB49 = 1;
    g.date = addDays('2001-09-10', 32);
    cmContractManagerDay(g);
    expect(c.club).toBe(0);
    expect(b.club).toBe(cb);
  });
});

// startkontrakternes udløb 0x4c7560: databasens dato som den står, trukket hvis den mangler, +52 uger hvis for tidlig
describe('cmContractEnd (0x4c7560)', () => {
  it('databasens dato gælder med dag og måned', () => {
    expect(cmContractEnd('2003-05-31', '2001-07-14', 'England', 1, 5)).toBe('2003-05-31');
    expect(cmContractEnd('2002-07-01', '2001-07-14', 'England', 1, 5)).toBe('2002-07-01');
  });
  it('for tidlige udløb får 52 uger, så længe de er under start + 8 dage', () => {
    expect(cmContractEnd('2001-06-30', '2001-07-14', 'England', 1, 5)).toBe('2002-06-29');
    expect(cmContractEnd('1999-06-30', '2001-07-14', 'England', 1, 5)).toBe('2002-06-26');
    expect(cmContractEnd('2001-07-20', '2001-07-14', 'England', 1, 5)).toBe('2002-07-19');
    expect(cmContractEnd('2001-07-22', '2001-07-14', 'England', 1, 5)).toBe('2001-07-22');
  });
  it('manglende dato trækkes: år +1…+6, dag 1…28, nationens måned', () => {
    const years = new Set<string>(), days = new Set<number>();
    for (let id = 1; id <= 400; id++) {
      const e = cmContractEnd('', '2001-07-14', 'England', 7, id);
      expect(e.slice(5, 7)).toBe('06');
      years.add(e.slice(0, 4)); days.add(Number(e.slice(8)));
    }
    expect([...years].sort()).toEqual(['2002', '2003', '2004', '2005', '2006', '2007']);
    expect(Math.min(...days)).toBe(1);
    expect(Math.max(...days)).toBe(28);
    expect(cmContractEnd('', '2001-07-14', 'Brazil', 7, 3).slice(5, 7)).toBe('12');
    expect(cmContractEnd('', '2001-07-14', 'England', 7, 3)).toBe(cmContractEnd('', '2001-07-14', 'England', 7, 3));
  });
  it('nyt spil: engelske udløb er spredt over maj–juli med 30/6 som den hyppigste dag', () => {
    const ends = scoped().map((p) => p.contract!.expires);
    const md = new Map<string, number>();
    for (const e of ends) md.set(e.slice(5), (md.get(e.slice(5)) ?? 0) + 1);
    const top = [...md.entries()].sort((a, b) => b[1] - a[1])[0];
    expect(top[0]).toBe('06-30');
    expect(md.size).toBeGreaterThan(20);
    expect(md.get('06-01') ?? 0).toBeGreaterThan(50);
  });
});
