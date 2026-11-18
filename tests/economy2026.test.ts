// Den moderne økonomi (2026/27-databasen) er kalibreret mod virkelighedens tal (docs/ECONOMY_2026.md, src/game/econ26.ts):
// medianklubbens omsætning, løn/omsætning og stabilitet over en sæson – inden for ca. ±25 % af Deloitte/UEFA/DFL 2024/25.
// Den originale database og gamle gemte spil (uden `m26`) berøres ikke.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { monthlyFigures } from '../src/game/finance';
import { wageFor } from '../src/game/data/generate';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const NATIONS = ['England', 'Spain', 'Germany', 'Italy', 'France', 'Holland', 'Portugal', 'Denmark'];
// virkelighedens median-omsætning (mio. €) og løn/omsætning pr. liga – docs/ECONOMY_2026.md
const REAL: Record<string, { med: number; wage: number }> = {
  England: { med: 310, wage: 0.65 }, Spain: { med: 100, wage: 0.6 }, Germany: { med: 190, wage: 0.54 }, Italy: { med: 108, wage: 0.66 },
  France: { med: 66, wage: 0.77 }, Holland: { med: 45, wage: 0.6 }, Portugal: { med: 30, wage: 0.6 }, Denmark: { med: 22, wage: 0.55 },
};
const med = (xs: number[]) => { const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const nat = (n: string) => world.nations.findIndex((x) => x.name === n);

describe('moderne økonomi 2026', () => {
  const eng = nat('England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Brøndby IF')![0], activeNations: NATIONS.map(nat), lang: 'da', masking: true, mode: 'extended', seed: 3 });
  const g = gs();
  const top = () => Object.values(g.comps).filter((c) => c.type === 'league' && c.tier === 1 && NATIONS.includes(g.nations[c.nation]?.name));

  it('nye spil får den kalibrerede økonomi (m26), og den originale database ikke', () => {
    expect(g.m26).toBeDefined();
    expect(g.econ).toBeUndefined();
    expect(Object.keys(g.m26!.kw).length).toBeGreaterThan(8);
  });

  it('ved start: faste indtægter og lønsum ligger på virkelighedens niveau', () => {
    for (const lg of top()) {
      const real = REAL[g.nations[lg.nation].name];
      const clubs = lg.clubs.map((id) => g.clubs[id]);
      const fixed = med(clubs.map((c) => { const f = monthlyFigures(c); return (f.tv + f.sponsor + f.merch) * 12; })) / 1e6;
      const wages = med(clubs.map((c) => squad(c.id).reduce((s, p) => s + (p.contract?.wage ?? 0), 0) * 52)) / 1e6;
      // tv + sponsor + merchandise = ca. 65-80 % af omsætningen (resten: entré og præmier)
      expect(fixed, `${lg.name} faste indtægter`).toBeGreaterThan(real.med * 0.5);
      expect(fixed, `${lg.name} faste indtægter`).toBeLessThan(real.med * 0.9);
      // spillernes lønsum (uden stab) ≈ løn/omsætning × omsætning / 1,12 – inden for ±35 % (rosterne er ikke ens)
      const target = (real.wage * real.med) / 1.12;
      expect(wages, `${lg.name} lønsum`).toBeGreaterThan(target * 0.65);
      expect(wages, `${lg.name} lønsum`).toBeLessThan(target * 1.35);
    }
  });

  it('en sæson: omsætning og løn/omsætning pr. liga inden for virkelighedens intervaller, ingen kollaps eller eksplosion', () => {
    const start = Object.fromEntries(top().map((lg) => [lg.id, med(lg.clubs.map((id) => g.clubs[id].balance))]));
    const end = g.season + 1;
    let days = 0;
    while (!(g.season === end && g.date.endsWith('-07-10')) && days++ < 460) {
      const r = continueGame();
      if (r.match !== undefined) quickPlayUserMatch();
    }
    for (const lg of top()) {
      const real = REAL[g.nations[lg.nation].name];
      const clubs = lg.clubs.map((id) => g.clubs[id]);
      const fin = clubs.map((c) => c.lastFinance!);
      const inc = fin.map((f) => f.gate + f.tv + f.prize + f.sponsor + f.merch);
      const rev = med(inc) / 1e6;
      expect(rev, `${lg.name} omsætning`).toBeGreaterThan(real.med * 0.75);
      expect(rev, `${lg.name} omsætning`).toBeLessThan(real.med * 1.3);
      const ratio = med(fin.map((f, i) => f.wages / Math.max(1, inc[i])));
      expect(ratio, `${lg.name} løn/omsætning`).toBeGreaterThan(real.wage * 0.65);
      expect(ratio, `${lg.name} løn/omsætning`).toBeLessThan(real.wage * 1.35);
      // kassen: ingen eksplosion (≤ 3,5 × start) og ingen kollaps (≥ 0)
      const bal = med(clubs.map((c) => c.balance));
      expect(bal, `${lg.name} saldo`).toBeGreaterThan(0);
      expect(bal, `${lg.name} saldo`).toBeLessThan(Math.max(start[lg.id], 1) * 3.5 + 20e6);
      expect(clubs.filter((c) => c.balance < 0).length, `${lg.name} klubber i minus`).toBeLessThanOrEqual(Math.ceil(clubs.length * 0.25));
    }
  }, 600_000);

  it('Haaland holder sin værdi (ingen 35 % værdifald på to sæsoner) og lønkurven er aftagende', () => {
    const h = Object.values(g.players).find((p) => p.last === 'Haaland')!;
    expect(h.value).toBeGreaterThan(150e6);
    expect(wageFor(100e6, 1, Object.keys(g.m26!.kw)[0])).toBeLessThan(wageFor(10e6, 1, Object.keys(g.m26!.kw)[0]) * 10);
  });
});
