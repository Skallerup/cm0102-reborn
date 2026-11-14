// Computerklubbernes nye kontrakter som originalen (src/game/cmContractGame.ts): ønskekontrakten 0x85fc50 med de kaldte funktioner fra cmGen/
// på originalens hukommelse (fixturen fra scripts/cm-want-check.ts FIXTURE=1: 14/7-2001, de 17 kald 0x4c7ac0 laver den dag) og på spillets data.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { SparseMem, type CmCtx } from '../src/game/cmMem';
import { setToDesiredContract_85fc50 } from '../src/game/cmContractWant';
import { genCtx } from '../src/game/cmGen/impls';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';
import { slCall, slmOf } from '../src/game/cmShortlist';
import { cmAiTerms } from '../src/game/cmContractGame';
import { completeTransfer } from '../src/game/transfers';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { isHumanClub } from '../src/game/humans';

describe('0x85fc50 på originalens hukommelse', () => {
  it('alle 17 kald fra 14/7-2001 giver originalens værdi', () => {
    const fx = JSON.parse(gunzipSync(readFileSync('tests/fixtures/cm-want-194-2001.json.gz')).toString()) as { runs: [number, string][]; cases: number[][] };
    const m = new SparseMem();
    for (const [a, h] of fx.runs) m.loadHex(a, h);
    let rnd: number[] = [];
    const base: CmCtx = {
      m,
      rand: () => rnd.shift()!,
      call: (adr, ...a) => {
        switch (adr) {
          case 0x5a0590: return getClubFinance_5a0590(base, a[0]);
          case 0x8cf470: case 0x4a4850: return 0;
          case 0x846920: case 0x849f00: return slCall(c, adr, slmOf(m), ...a);
          case 0x8cca10: return slCall(c, adr, m.u32(0xde1f54), ...a);
        }
        return cmMemCall(base, adr, ...a);
      },
    };
    const c = genCtx(base);
    const L = 0x00310000;
    let eq = 0;
    for (const k of fx.cases) {
      rnd = k.slice(10);
      for (let i = 0; i < 0x50; i++) m.w8(L + i, 0);
      const v = setToDesiredContract_85fc50(c, L, k[0], k[1], k[2] | 0, k[3] & 0xff, k[4] & 0xff, k[5] | 0, k[6]);
      if ((v >>> 0) === (k[7] >>> 0) && m.s32(L + 0xc) === k[8] && m.u16(L + 0x2f) === k[9]) eq++;
    }
    expect(fx.cases.length).toBe(17);
    expect(eq).toBe(17);
  });
});

describe('computerklubbernes kontrakter på spillets data', () => {
  const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  const start = (mode: 'authentic' | 'extended') => {
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode });
    return gs();
  };
  it('ægte tilstand: løn, udløb i juni, bonusser efter pladsen; samme svar hver gang; køb mellem computerklubber får vilkårene', () => {
    const g = start('authentic');
    const ai = Object.values(g.clubs).filter((c) => c.nation === eng && g.leagues[c.league]?.tier === 1 && !isHumanClub(c.id));
    const [from, to] = [ai[0], ai[1]];
    // en spiller, køberen giver et tilbud (0x4cda70); uden tilbud gælder spillets egen kontrakt
    const cands = Object.values(g.players).filter((x) => x.club === from.id && !x.loan && x.contract).sort((a, b) => b.ca - a.ca);
    const p = cands.find((x) => cmAiTerms(g, x, to.id)?.offered)!;
    expect(p).toBeDefined();
    const t = cmAiTerms(g, p, to.id)!;
    expect(t.offered).toBe(true);
    expect(t.wage).toBeLessThan(250000 / 0.86);
    expect(t.wage).toBeGreaterThan(0);
    expect(+t.expires.slice(0, 4)).toBeGreaterThan(2001);
    expect(t.expires.slice(5, 7)).toBe('06');                                   // England: sæsonen slutter i maj → udløb i juni (0x4d45f0)
    expect(cmAiTerms(g, p, to.id)).toEqual(t);
    if (p.pos[6] >= 15) expect(t.bonusGbp[0]).toBeGreaterThan(0);
    const bal = to.balance;
    completeTransfer({ id: 1, player: p.id, buyer: to.id, seller: from.id, fee: 1_000_000, loan: false, status: 'negotiating', created: g.date, respondBy: g.date }, 1, 3);
    expect(p.club).toBe(to.id);
    expect(p.contract!.wage).toBe(t.wage);
    expect(p.contract!.expires).toBe(t.expires);
    expect(p.contract!.cmBonusGbp ?? [-1, -1, -1]).toEqual(t.bonusGbp.some((x) => x > 0) ? t.bonusGbp : [-1, -1, -1]);
    expect(bal - to.balance).toBe(1_000_000 + t.signOn);
  }, 300_000);
  it('udvidet tilstand: spillets egne kontrakter', () => {
    const g = start('extended');
    const p = Object.values(g.players).find((x) => x.club && !x.loan && x.contract && !isHumanClub(x.club))!;
    const other = Object.values(g.clubs).find((c) => c.id !== p.club && !isHumanClub(c.id))!;
    expect(cmAiTerms(g, p, other.id)).toBeNull();
  }, 300_000);
});
