// Originalens spejderopgaver (cmScoutAsg.ts: 0x7ae9c0/0x7b0050/0x7b3e20/0x7aee80, tekster ui/cmScoutAsgNews.ts 0x7b7840/0x7b81f0/0x7b95c0):
// et helt forløb – Assign Scout ▸ Nation → "search started" (0x1389) → anbefalingerne (0x138b) → "so far" og "completed" (0x138a) – og
// teksterne af nyhedens pladser.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// common.tsx trækker analytics.ts med (window ved indlæsning) – i Node en tom stand-in
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { addDays, ageOn } from '../src/game/dates';
import { cmScoutDaily, coversNation } from '../src/game/cmScout';
import { cmAsgOf, cmAsgOn, cmRegionOf } from '../src/game/cmScoutAsg';
import { goodText } from '../src/ui/cmScoutAsgNews';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import type { GameState, NewsItem } from '../src/game/types';

describe('0x7bdee0: styrkerne i anbefalingen', () => {
  it('dødbolde, straffespark og de to første gode sider', () => {
    expect(goodText(0, 'Jones', 'Baggio')).toBe('');
    expect(goodText(0x100 | 0x400, 'Jones', 'Baggio')).toBe('The report adds that Baggio is an expert in dead-ball situations.');
    expect(goodText(0x200 | 4 | 2, 'Jones', 'Baggio'))
      .toBe("Jones's report also reflects favourably on Baggio's loyalty and his ability to handle pressure while pointing out that the player has an iron nerve when it comes to taking penalties.");
    expect(goodText(0x1000 | 0x20 | 0x80 | 8, 'Jones', 'Baggio')).toBe("The report also reflects favourably on Baggio's reliability and his determination.");
  });
});

describe('Assign Scout ▸ Nation (den originale database, ægte tilstand)', () => {
  it('opgave → started → anbefalinger → so far → completed, og listen står bagefter', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    const mu = w.clubs.find((c) => c[1] === 'Manchester United')![0];
    createGame(w, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs() as GameState;
    const scout = Object.values(g.staff).find((s) => s.club === g.userClub && s.role === 'scout')!;
    const fra = g.nations.findIndex((n) => n.name === 'France');
    expect(applyAction({ t: 'scout', staffId: scout.id, assignment: { kind: 'nation', target: fra } })).toBe('ok');
    const a = cmAsgOf(g, scout)!;
    expect(cmAsgOn(a)).toBe(true);
    expect(a.round).toBe(0);
    const d0 = g.date;
    expect(a.date > d0 && a.date <= addDays(d0, 3)).toBe(true);
    // 0x7b0050: kun Frankrigs spillere (klubbens land), ikke klubbens egne; højst rand(CA/3 + 2·Professionalism + 20) + 50; alle nye; sorteret
    expect(a.tab.length).toBeGreaterThan(0);
    expect(a.tab.length).toBeLessThanOrEqual(Math.trunc((scout.ca ?? 0) / 3) + 2 * (scout.cmHid?.[5] ?? 10) + 70);
    for (const r of a.tab) {
      const p = g.players[r.pid];
      expect(p.club ? g.clubs[p.club].nation : p.nation).toBe(fra);
      expect((p.loan?.from ?? p.club) === g.userClub).toBe(false);
      expect(r.f & 1).toBe(1);
    }
    expect(a.tab.map((r) => r.pid)).toEqual(a.tab.map((r) => r.pid).slice().sort((x, y) => x - y));
    // 0x7b7490 med opgave: listen dækker Frankrig, ikke England
    expect(coversNation(g, scout, fra)).toBe(true);
    expect(coversNation(g, scout, eng)).toBe(false);
    const recs = new Set(a.tab.filter((r) => r.ab >= 4 || r.pt >= 4).map((r) => r.pid));
    // aftenens 0x7f8750 → 0x7b3e20, dag for dag
    const mine = () => g.news.filter((n) => n.key.startsWith('cmsn.')).slice().reverse();
    for (let i = 0; i < 90 && cmAsgOn(cmAsgOf(g, scout)); i++) { g.date = addDays(g.date, 1); cmScoutDaily(g); }
    expect(cmAsgOn(cmAsgOf(g, scout)), 'søgningen er slut').toBe(false);
    expect(g.staff[scout.id].assignment).toBeNull();
    const ns = mine();
    expect(ns[0].key).toBe('cmsn.a70304');
    expect(newsTitle(ns[0])).toBe('French search started');
    expect(newsBody(ns[0])).toBe(`Scout ${scout.first} ${scout.last} has started his French search, and will report back with his findings.`);
    const upd = ns.filter((n) => n.key === 'cmsn.a705ec'), done = ns.filter((n) => n.key === 'cmsn.a70614');
    expect(upd.length).toBe(1);
    expect(done.length).toBe(1);
    expect(ns.indexOf(upd[0])).toBeLessThan(ns.indexOf(done[0]));
    const found = Number(done[0].params.n);
    expect(newsBody(done[0])).toMatch(/^Scout .+ has completed his French search, (after finding \d+ suitable players|but only found one suitable player|but was unable to find any suitable players)\.$/);
    // 0x138b for hver post med 4+ stjerner (rapporteret én gang)
    const rec = ns.filter((n) => n.key === 'cmsn.a710c0');
    expect(new Set(rec.map((n) => n.link!.id))).toEqual(recs);
    expect(rec.length).toBe(recs.size);
    for (const n of rec) {
      expect(newsTitle(n)).toBe('Recommended player in French search');
      const p = g.players[n.link!.id];
      expect(newsBody(n)).toMatch(new RegExp(`^Scout ${scout.first} ${scout.last} (recommends|feels) ${ageOn(p.dob, n.date)} year old .+ ${p.first} ${p.last}`));
    }
    // alle poster er rapporteret, listen står på Scout #n
    const after = cmAsgOf(g, scout)!;
    expect(after.tab.every((r) => !(r.f & 1))).toBe(true);
    expect(found).toBe(after.tab.length);
    expect(g.staff[scout.id].scoutList).toEqual(after.tab.map((r) => r.pid));
  }, 240000);

  it('Region og Youth Players: dækningen (nation +0x76) og ungdom under 20 år uden for klubben', () => {
    const g = gs() as GameState;
    const [s1, s2] = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout');
    if (!s2) return;
    expect(applyAction({ t: 'scout', staffId: s1.id, assignment: { kind: 'region', target: 11 } })).toBe('ok');
    const a = cmAsgOf(g, s1)!;
    expect(a.region).toBe(11);
    for (const r of a.tab) { const p = g.players[r.pid]; expect(cmRegionOf(g, p.club ? g.clubs[p.club].nation : p.nation)).toBe(11); }
    expect(applyAction({ t: 'scout', staffId: s2.id, assignment: { kind: 'youth', target: 0 } })).toBe('ok');
    const y = cmAsgOf(g, s2)!;
    expect(y.youth).toBe(true);
    for (const r of y.tab) expect(ageOn(g.players[r.pid].dob, g.date)).toBeLessThan(20);
    // ungdom dækker intet land (0x7b75db)
    expect(coversNation(g, s2, g.clubs[g.userClub].nation)).toBe(false);
    // Recall Scout (0x7aee80): opgaven væk, tabellen står
    expect(applyAction({ t: 'scout', staffId: s1.id, assignment: null })).toBe('ok');
    expect(cmAsgOn(cmAsgOf(g, s1))).toBe(false);
    expect(g.staff[s1.id].assignment).toBeNull();
    void (null as unknown as NewsItem);
  }, 240000);
});
