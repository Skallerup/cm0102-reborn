// CM 01/02's kampprogram-nyhed (0x77bc80 type 0xd) og transferrygterne med "Select Media Response" (cmRumours.ts: 0x754740/0x754a30/0x755860,
// svaret 0x742de0 → 0x741020 type 0x1f, computerens svar 0x735870) – ejerens billeder 137–139 (Vejle, 3/7-2001).
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// common.tsx trækker analytics.ts med (window ved indlæsning) – i Node en tom stand-in
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });

import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { addDays } from '../src/game/dates';
import { cmRumourAdd, cmRumourAiAnswer, cmRumourAnswer, cmRumourAnswerEffects, cmRumourOpen, cmRumoursDaily } from '../src/game/cmRumours';
import { cmContractOf, cmRand } from '../src/game/cmPlayerData';
import { personKey } from '../src/game/cmRelations';
import { newRec } from '../src/game/cmBoard';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import { applyAction } from '../src/game/actions';
import { SL_ON, cmAskingPrice, cmScoutAddRumour, cmShortlistAddRumour } from '../src/game/cmShortlistGame';
import { reportOnPlayer, scoutLists } from '../src/game/cmScout';
import { cmGbp } from '../src/game/cmMoney';
import { money } from '../src/i18n';
import type { GameState, Player } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;

function start(name: string): GameState {
  const c = world.clubs.find((x) => x[1] === name)!;
  createGame(world, { managerName: 'M S', managerNation: c[3] as number, clubId: c[0], activeNations: [c[3] as number], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  return gs();
}
const byShort = (g: GameState, s: string) => Object.values(g.clubs).find((c) => c.short === s || c.name === s)!;
const find = (g: GameState, last: string): Player => Object.values(g.players).find((p) => p.last === last && p.club === g.userClub)!;

describe('kampprogrammet og rygterne (ægte tilstand, 3.9.60)', { timeout: 600_000 }, () => {
  it('databaserne: Vejle er i Superligaen i 3.9.60 og i 1. division i 3.9.68 (ejerens spil kørte på 3.9.68)', () => {
    const d68 = JSON.parse(readFileSync('public/data/world-original-3968.json', 'utf8')) as WorldData;
    const lg = (w: WorldData, short: string) => w.clubs.find((c) => c[2] === short && w.nations[c[3] as number]?.name === 'Denmark')?.[4];
    const name = (w: WorldData, id: unknown) => w.leagues.find((l) => l.id === id)?.name;
    expect(name(world, lg(world, 'Vejle'))).toBe('Danish Premier Division');
    expect(name(world, lg(world, 'Herfølge'))).toBe('Danish First Division');
    for (const s of ['Vejle', 'Herfølge', 'B 1909', 'Brønshøj']) expect(name(d68, lg(d68, s)), s).toBe('Danish First Division');
  });

  it('"… fixture list decided": klubbens tre første ligakampe med (home)/(away) og den lange dato', () => {
    const g = start('Vejle Boldklub');
    const n = g.news.find((x) => x.key === 'comp.fixturesOut')!;
    expect(n).toBeTruthy();
    const body = newsBody(n);
    expect(body).toMatch(/^Vejle will start with games against .+ \((home|away)\), .+ \((home|away)\) and .+ \((home|away)\) on \w+day \d+(st|nd|rd|th) \w+ 2001, .+ and .+ respectively\.$/);
  });

  it('rygtet: bud → kø → "X rumour" med Respond, svaret står under nyheden og virker på spilleren', () => {
    const g = start('Vejle Boldklub');
    const p = find(g, 'Beierholm');
    expect(p).toBeTruthy();
    // fem udenlandske klubber vil have ham (som computerens ønskelister/bud) – rand(25) pr. post og dag
    const buyers = ['Villarreal', 'Real Madrid', 'Barcelona', 'Valencia', 'Deportivo'].map((s) => byShort(g, s)).filter(Boolean);
    expect(buyers.length).toBeGreaterThan(2);
    for (const c of buyers) cmRumourAdd(g, p, c.id, 12_000_000 / 7.45, -1);
    let n;
    for (let d = 0; d < 30 && !n; d++) {
      g.date = addDays(g.date, 1);
      cmRumoursDaily(g);
      n = g.news.find((x) => x.key === 'cm.rum');
    }
    expect(n).toBeTruthy();
    expect(n!.params.own).toBe(1);
    expect(newsTitle(n!)).toMatch(/Beierholm (rumour|rumours|transfer speculation|unsettled|fuels transfer talk)|lead chase for Mads Beierholm|Beierholm linked with/);
    const body = newsBody(n!);
    expect(body).toContain('Mads Beierholm');
    // alle fem klubber er nu "rygtet" (tilstand 1) – ingen nye rygter om ham
    expect(g.cmRum!.q.filter((e) => e.p === p.id).every((e) => e.st === 1)).toBe(true);
    expect(cmRumourOpen(g, n)).toBe(true);
    expect(cmRumourAnswer(g, n!.id, 1)).toBe('ok');
    expect(cmRumourOpen(g, n)).toBe(false);
    expect(newsBody(n!)).toMatch(/You have circulated a press release (denying that Mads Beierholm is available for transfer|indicating that you expect)/);
    expect(cmRumourAnswer(g, n!.id, 2)).toBe('error');
  });

  it('0x741020 type 0x1f: Confirm når klubben kan lide ham – bestyrelsens +8 −500/+6 −200; computerens svar: listet → Confirm', () => {
    const g = start('Vejle Boldklub');
    const p = find(g, 'Beierholm');
    const club = g.clubs[g.userClub];
    club.cmPrefs = [personKey(p), 0, 0, 0, 0, 0];
    g.cmBoard ??= { rec: {} } as never;
    const R = (g.cmBoard!.rec[club.id] ??= newRec());
    R.w6 = 5000; R.w8 = 5000;
    cmContractOf(p).b45 = 0;
    const m0 = p.morale;
    cmRumourAnswerEffects(g, p, club.id, 2, cmRand(1, 2, 3));
    expect([R.w8, R.w6]).toEqual([4500, 4800]);
    expect(p.morale).toBeLessThanOrEqual(m0);
    // Deny: +8 +200, +6 +100
    cmRumourAnswerEffects(g, p, club.id, 1, cmRand(4, 5, 6));
    expect([R.w8, R.w6]).toEqual([4700, 4900]);
    const c = cmContractOf(p);
    c.b4e = 1;
    expect(cmRumourAiAnswer(p, cmRand(7))).toBe(2);
    c.b4e = 0;
  });

  it('"linked with"-rygtet fra mennesket: "Add Player To Shortlist" → Yes (0x8f48b0 → 0x8f4c07) med udbudsprisen 0x4d1600, ikke buddet', () => {
    const on = SL_ON.on;
    SL_ON.on = true;   // (vitest kører med CM_SL=0 – rygtets beløb kræver ønskelisternes hukommelse)
    try {
      const w = world.clubs.find((x) => x[1] === 'Manchester United')!;
      const eng = world.nations.findIndex((x) => x.name === 'England');
      createGame(world, { managerName: 'M S', managerNation: eng, clubId: w[0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
      const g = gs();
      const p = Object.values(g.players).find((q) => q.last === 'Tsigalko')!;
      expect(g.clubs[p.club].name).toBe('Dinamo Minsk');
      // et bud fra mennesket giver intet rygte (0x8be300 kalder kun 0x7f75f0)
      applyAction({ t: 'bid', pid: p.id, fee: 100_000, loan: false });
      g.date = addDays(g.date, 1);
      cmRumoursDaily(g);
      expect((g.cmRum?.q ?? []).some((e) => e.p === p.id)).toBe(false);
      g.shortlist = g.shortlist.filter((x) => x !== p.id);
      // en dag, hvor rand(37 − omdømme/300) = 0 osv. (frø 1)
      let gbp: number | null = null;
      for (let d = 0; d < 120 && gbp === null; d++) { g.date = addDays(g.date, 1); gbp = cmShortlistAddRumour(g, p, g.userClub); }
      expect(gbp).not.toBeNull();
      // beløbet = 0x4d1600(sælger, køber, staff, 0, 1, 1) – ikke spillerens værdi (vores skøn gav £65K)
      expect(gbp).toBe(cmAskingPrice(g, p, g.userClub));
      expect(gbp!).toBeGreaterThan(1_000_000);
      applyAction({ t: 'shortlist', pid: p.id, on: true });
      const e = g.cmRum!.q.find((x) => x.p === p.id && x.c === g.userClub)!;
      expect(e.amt).toBe(Math.round(gbp! / cmGbp(g, g.userClub)));
      // nyheden viser beløbet i spillets penge (money)
      let n;
      for (let d = 0; d < 31 && !n; d++) { g.date = addDays(g.date, 1); cmRumoursDaily(g); n = g.news.find((x) => x.key === 'cm.rum' && Number(x.params.pid) === p.id); }
      if (n) expect(newsBody(n)).toContain(money(e.amt));
    } finally { SL_ON.on = on; }
  });
  it('spejderrapportens rygte (0x7b62a0 → 0x7b6e86): samme beløb som 0x8f48b0, viljen ≥ 3,15 følger med, kun ved mindst 3 stjerner', () => {
    const on = SL_ON.on;
    SL_ON.on = true;
    try {
      const w = world.clubs.find((x) => x[1] === 'Manchester United')!;
      const eng = world.nations.findIndex((x) => x.name === 'England');
      createGame(world, { managerName: 'M S', managerNation: eng, clubId: w[0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
      const g = gs();
      const p = Object.values(g.players).find((q) => q.last === 'Tsigalko')!;
      // kernen: en dag, hvor rand(37 − omdømme/300) = 0 osv.
      let r: { amt: number; will: number } | null = null;
      for (let d = 0; d < 200 && !r; d++) { g.date = addDays(g.date, 1); r = cmScoutAddRumour(g, p, g.userClub, cmRand(g.seed ?? 0, p.id, d, 0x7b62a0)); }
      expect(r).not.toBeNull();
      expect(r!.amt).toBe(cmAskingPrice(g, p, g.userClub));
      expect(r!.will).toBeGreaterThanOrEqual(315);
      // rapporten (anmodningen, force 1): rygtet i køen kun med 3+ stjerner, med viljen (Tsigalko får 0 stjerner af Man Utds spejder – Vieri 5)
      const s = scoutLists(g, g.userClub)[0];
      const v = Object.values(g.players).find((q) => q.last === 'Vieri' && g.clubs[q.club]?.name === 'Internazionale')!;
      const r0 = reportOnPlayer(g, s, p, 1, -1000, cmRand(1));
      expect(r0 && r0.ab <= 2 && r0.pot <= 2).toBe(true);
      expect(g.cmRum?.q.some((x) => x.p === p.id) ?? false).toBe(false);
      expect(s).toBeTruthy();
      let hit = 0;
      for (let d = 0; d < 300 && !hit; d++) {
        g.date = addDays(g.date, 1);
        if (g.cmRum) g.cmRum.q = [];
        const rec = reportOnPlayer(g, s, v, 1, -1000, cmRand(g.seed ?? 0, s.id, v.id, d, 0x7f8750));
        const e = g.cmRum?.q.find((x) => x.p === v.id && x.c === g.userClub);
        if (e) {
          expect(rec && (rec.ab > 2 || rec.pot > 2)).toBe(true);
          expect(e.will).toBeGreaterThanOrEqual(315);
          hit++;
        }
      }
      expect(hit).toBe(1);
    } finally { SL_ON.on = on; }
  });
});
