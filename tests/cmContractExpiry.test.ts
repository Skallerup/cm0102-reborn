// Langtidsfundene 15/11 (den originale database i ægte tilstand): udløbne kontrakter uden for de valgte lande og klubøkonomien i lande,
// originalen ikke har indlæst. Originalens personløkke (CONTRACT_MANAGER 0x4c7ac0) går over alle personer i hukommelsen (0x524d70 –
// databasestørrelsen Maximum: Player.cmMem), og et ikke-indlæst land har ingen tabel/kampe (nation +0x11c = 0) – FinanceTable 0x59b9c0
// klemmer saldoen (omdømme < 5000) eller kører måneden uden kampe med hukommelsens kontrakter.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { cmCmScope } from '../src/game/cmContractManager';
import { cmExpireOutsideDaily } from '../src/game/season';
import { cmMatchIncome, nationLoaded, updateWageBill } from '../src/game/cmFinance';
import type { GameState } from '../src/game/types';

let g: GameState;
beforeAll(() => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}, 600_000);

const eng = () => g.clubs[g.userClub].nation;
const foreign = () => Object.values(g.players).filter((p) => p.club && !p.virtual && !p.loan && p.contract && g.clubs[p.club].nation !== eng() && !g.leagues[g.clubs[p.club].league]?.hidden);

describe('kontrakterne uden for de valgte lande', () => {
  it('world-filen har hukommelsens udvalgte (tm) – de er med i CONTRACT_MANAGER, resten ikke', () => {
    expect(g.cmMaxMem).toBe(true);
    const fs = foreign();
    // (24/11) nye spil har kun hukommelsens personer (0x524d70 for alle lande – newgame.ts memAll): alle udenlandske er udvalgte
    const mem = fs.filter((p) => p.cmMem === 1), rest = fs.filter((p) => p.cmMem !== 1);
    expect(mem.length).toBeGreaterThan(3000);
    expect(rest.length).toBe(0);
    expect(mem.every((p) => cmCmScope(g, p))).toBe(true);
    // ældre spil (startet før 24/11) har også de andre: uden for CONTRACT_MANAGER
    const old = { ...mem[0] }; delete old.cmMem;
    expect(cmCmScope(g, old)).toBe(false);
  });

  it('de andre: spillets udløb dagen efter udløbsdatoen (ikke næste 1/7) – hukommelsens bliver til CONTRACT_MANAGER afgør dem', () => {
    const fs = foreign();
    // a som en spiller uden for hukommelsen i et ældre spil (nye spil har dem ikke – newgame.ts memAll)
    const a = fs[0], b = fs.find((p) => p !== a && p.club !== a.club)!;
    delete a.cmMem;
    const save = g.date;
    a.contract!.expires = '2001-11-20'; b.contract!.expires = '2001-11-20';
    const cb = b.club;
    g.date = '2001-11-20';
    cmExpireOutsideDaily();
    expect(a.club).toBeGreaterThan(0);
    g.date = '2001-11-21';
    cmExpireOutsideDaily();
    expect(a.club).toBe(0);
    expect(a.contract).toBeNull();
    expect(b.club).toBe(cb);
    g.date = save;
  });
});

describe('økonomien i lande, originalen ikke har indlæst', () => {
  it('nation +0x11c: kun de valgte lande', () => {
    const spain = g.nations.findIndex((n) => n.name === 'Spain');
    expect(nationLoaded(g, eng())).toBe(true);
    expect(nationLoaded(g, spain)).toBe(false);
  });

  it('lønsummen 0x598370 tæller kun hukommelsens kontrakter i et ikke-indlæst land', () => {
    // en klub i et ikke-indlæst land med både udvalgte og andre (fx Spanien: Real Madrid har alle i hukommelsen – omdømme ≥ 7500)
    // (24/11) nye spil har kun hukommelsens personer (newgame.ts memAll) – de andre som i et ældre spil: cmMem fjernet for 10 af truppen
    const c = Object.values(g.clubs).find((x) => x.nation !== eng() && g.cmFin![x.id] && squad(x.id).filter((p) => p.cmMem === 1 && p.contract).length >= 13)!;
    const sq = squad(c.id);
    for (const p of sq.filter((x) => x.contract).slice(0, 10)) delete p.cmMem;
    const r = g.cmFin![c.id];
    updateWageBill(g, c, r);
    const memWage = sq.filter((p) => p.cmMem === 1 && p.contract).reduce((s, p) => s + Math.round(p.contract!.wage * 0.86), 0);
    const allWage = sq.filter((p) => p.contract).reduce((s, p) => s + Math.round(p.contract!.wage * 0.86), 0);
    expect(r.wb).toBeGreaterThanOrEqual(memWage);
    expect(r.wb).toBeLessThan(allWage);
  });

  it('process_match_income 0x59a5d0: en venskabskamp mellem to klubber i et ikke-indlæst land bogføres ikke – i et indlæst land gør den', () => {
    const club = (n: string) => Object.values(g.clubs).find((x) => x.name === n)!;
    const fx = (h: number, a: number) => ({ id: `x${h}`, comp: 'friendly', home: h, away: a, date: g.date }) as never;
    const codes = { b3a: 0, b3b: 0, b3c: 0, compRep: 10, friendly: true, leagueOfHome: false };
    const [h, a] = [club('Real Madrid C.F.'), club('C.D. Alavés')];
    const before = [h.balance, a.balance];
    cmMatchIncome(g, fx(h.id, a.id), 30000, codes);
    expect([h.balance, a.balance]).toEqual(before);
    const [e1, e2] = [club('Chelsea'), club('Leeds United')];
    const b2 = e1.balance;
    cmMatchIncome(g, fx(e1.id, e2.id), 30000, codes);
    expect(e1.balance).not.toBe(b2);
  });
});
