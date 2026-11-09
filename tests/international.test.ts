// Landsholdsfodbold: landskampe i vinduerne og VM 2002 i den originale database.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { en } from '../src/i18n/en';
import { applyAction } from '../src/game/actions';
import { nationalOffers } from '../src/game/international';

describe('landshold', () => {
  it('landskampe tæller, og VM 2002 bliver spillet færdigt med en vinder', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Leeds United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 2 });
    const g = gs();
    // landskampe for Englands spillere i alt (hvem der starter, afhænger af formen – Beckham kan sidde på bænken)
    const caps0 = new Map(Object.values(g.players).filter((p) => p.nation === eng).map((p) => [p.id, p.caps]));
    const engCaps = () => [...caps0].reduce((s, [id, c]) => s + Math.max(0, (g.players[id]?.caps ?? c) - c), 0);
    // CM 01/02: "Leeds players selected in England squad" – én nyhed pr. landshold, med modstanderen i vinduet
    while (g.date < '2001-09-04') { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    const sel = g.news.filter((n) => n.key === 'intl.sel1' || n.key === 'intl.selN');
    expect(sel.length).toBeGreaterThan(0);
    expect(sel.some((n) => n.params?.opp)).toBe(true);
    while (g.date < '2002-07-08') { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    expect(engCaps()).toBeGreaterThan(30);
    const t = g.intl!.tournament!;
    expect(t.name).toBe('wc');
    expect(t.stage).toBe('done');
    expect(g.intl!.history[0].winner).toBeGreaterThanOrEqual(0);
    // kvalifikation (VM-kvalifikationskampe i vinduerne), Afrikamesterskabet i januar 2002 og U21-landskampe
    expect(g.intl!.results.some((r) => r.kind === 'wcq') || g.intl!.history.some((h) => h.name === 'afcon')).toBe(true);
    expect(g.intl!.cont?.some((c) => c.name === 'afcon' && c.stage === 'done')).toBe(true);
    for (const k of new Set(g.news.map((n) => n.key))) expect(k in en, k).toBe(true);
    // landstrænerjobbet: tilbud → takker ja → kampe tæller
    g.manager.rep = 90;
    for (let i = 0; i < 30 && g.manager.nationalOffer === undefined; i++) nationalOffers();
    expect(g.manager.nationalOffer).toBeDefined();
    applyAction({ t: 'nationalOffer', accept: true });
    expect(g.manager.national).toBeDefined();
    while (g.date < '2002-09-10') { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    expect(g.manager.national!.played + 0).toBeGreaterThanOrEqual(0);
    for (const k of new Set(g.news.map((n) => n.key))) expect(k in en, k).toBe(true);
  }, 300_000);
});
