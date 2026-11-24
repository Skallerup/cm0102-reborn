// Scout Player på en spiller i en klub uden for de spilbare ligaer (ejerens fejl 24/11: Emil Debski, Dalum): klubben spiller originalens
// baggrundskampe (fixture −2, cmReserves.ts), og dem ser spejderne ikke – originalens −2-blok 0x84c339–0x84c493 kalder ikke 0x7f8c00, og
// 0x7b5be0 springer hurtige kampe over (resultatposten +0x4c, 0x7b5d79). Rapporten kommer om den bestilte spiller (0x7f8750 efter 30 dage
// uden kamp inden for 14 dage) – ikke om hans holdkammerater.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { addDays } from '../src/game/dates';

describe('Scout Player i en baggrundsklub (ægte tilstand, original DB)', () => {
  it('kun den bestilte spiller får rapporten', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    const mu = w.clubs.find((c) => c[1] === 'Manchester United')![0];
    createGame(w, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const step = () => { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); };
    while (g.date < '2001-08-20') step();
    // Frankrigs stærkeste klub uden kampe i kampprogrammet (ligaen spilles ikke – kun baggrundskampe) og dens bedste spiller
    const busy = new Set(Object.values(g.fixtures).flatMap((f) => [f.home, f.away]));
    const fra = Object.values(g.clubs).filter((c) => w.nations[c.nation]?.name === 'France' && !busy.has(c.id) && squad(c.id).length > 15).sort((a, b) => b.rep - a.rep)[0];
    const target = squad(fra.id).sort((a, b) => b.ca - a.ca)[0];
    expect(applyAction({ t: 'scoutStatus', pid: target.id })).toBe(0);
    expect(applyAction({ t: 'scoutReq', pid: target.id })).toBe('ok');
    const old = new Set(g.news);
    const watch0 = { ...(g.cmScoutWatch ?? {}) };
    const reps = () => g.news.filter((n) => !old.has(n) && n.key.startsWith('cmsr.'));
    // (24/11) efter datoen, ikke antal skridt: continueGame standser også ved nyheder (fx bestyrelsens), så 40 skridt kan være < 30 dage
    const until = addDays(g.date, 45);
    // 0x7f8750 sletter anmodningen uden rapport, hvis spilleren er skadet efter de 30 dage (0x62c400 = 2) – det sker for nogle talrækker
    // (24/11: frø 5 med formændenes udfyldte Patience → Gallardo, Monaco, skadet 20/9)
    let hurt = false;
    for (let i = 0; i < 400 && g.date < until && !reps().some((n) => n.link?.id === target.id); i++) {
      step();
      if (target.injury && target.injury.key !== 'awol' && !(g.cmScoutReq ?? []).some((r) => r.pid === target.id)) { hurt = true; break; }
    }
    // en spejderliste, der har set en kamp (0x7b5be0 sætter +0x1a5 = i morgen), har set en af klubbens kampe i kampprogrammet – ingen baggrundskamp
    const days = new Set(Object.values(g.fixtures).filter((f) => f.home === fra.id || f.away === fra.id).map((f) => addDays(f.date, 1)));
    const seen = Object.entries(g.cmScoutWatch ?? {}).filter(([id, d]) => watch0[+id] !== d).map(([, d]) => d);
    expect(seen.filter((d) => !days.has(d)), 'spejderne så en baggrundskamp').toEqual([]);
    expect(reps().map((n) => n.link?.id).filter((id) => id !== target.id), 'rapporter om andre spillere').toEqual([]);
    expect(hurt || reps().some((n) => n.link?.id === target.id), 'rapport om den bestilte spiller').toBe(true);
  }, 600_000);
});
