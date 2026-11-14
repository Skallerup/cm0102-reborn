// CM 01/02's Discipline Player (Fine.cpp i cm0102.exe 3.9.68) – cmFine.ts: 0x5a5980 fine_player, 0x5a69b0 fortjent?, nyheden 0xbc6
// (0x5a74b0/0x5a76e0), 0x5a5820 dagligt. Ejerens billeder (work-ui/r4/98–100): Tøfting idømt en bøde uden grund → "Tøfting feels fine was
// unfair", ingen besked på spillersiden og Future "Feels he has been treated unfairly".
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cmFineDaily, cmFinePlayer, fineDeserved } from '../src/game/cmFine';
import { cmContractOf, cmRand } from '../src/game/cmPlayerData';
import { cmFutureLines } from '../src/game/cmTransferList';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { addDays } from '../src/game/dates';
import { ATTRS } from '../src/game/attributes';
import type { Player } from '../src/game/types';

const setA = (p: Player, k: string, v: number) => { p.attrs[ATTRS.indexOf(k as never)] = v; };

describe('Discipline Player i spillet (3.9.68 som ejerens billeder, ægte tilstand)', { timeout: 120_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original-3968.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const bolton = world.clubs.find((c) => c[1] === 'Bolton Wanderers')![0];
  const tofting = () => squad(bolton).find((p) => p.last === 'Tøfting')!;

  it('bøde uden grund: aldrig fortjent – klagen 0x200, nyheden "Tøfting feels fine was unfair" og Future "treated unfairly"; ingen penge flyttes', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: bolton, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const p = tofting();
    expect(p).toBeTruthy();
    const c = cmContractOf(p);
    c.b45 = 0; c.b44 = 0;
    expect(fineDeserved(g, p, 2, 0, cmRand(1))).toBe(false);                   // 0x5a69b0: grund 0 → 0
    const bal = g.clubs[bolton].balance, n0 = g.news.length;
    const r = act<{ key: string }>({ t: 'interact', pid: p.id, kind: 'fine', reason: 'none' });
    expect(r.key).toBe('');                                                     // ingen besked på spillersiden
    expect(g.clubs[bolton].balance).toBe(bal);                                  // originalen rører ikke økonomien
    expect(c.b45 & 0x200).toBe(0x200);                                          // 0x867700(0x200)
    expect(c.b44).toBeLessThan(0);
    const news = g.news.slice(0, g.news.length - n0);
    const head = news.find((x) => x.key.startsWith('cmfine.f'));
    expect(head?.key).toMatch(/^cmfine\.f[01]$/);                               // uretfærdig (eller holdkammeraternes protest)
    expect(head?.params.last).toBe('Tøfting');
    expect(head?.params.why).toBe(0);
    expect(cmFutureLines(g, p).map((l) => l.k)).toContain('unfair');           // 0x883004: "Feels he has been treated unfairly"
    expect(g.cmFine!.recs.at(-1)).toMatchObject({ pid: p.id, why: 0, ok: 0, until: addDays(g.date, 14) });   // 7·sev dage
    expect(g.cmFine!.count[bolton]).toBe(1);
  });

  it('nyhedens tekst er originalens (en og da)', () => {
    const en = readFileSync('src/i18n/en.ts', 'utf8'), da = readFileSync('src/i18n/da.ts', 'utf8');
    expect(en).toContain('"cmfine.f0": "{last} feels fine was unfair"');
    expect(en).toContain('He believes that this fine is totally undeserved and feels you are trying to force him out of the club.');
    for (const k of ['cmfine.f0', 'cmfine.w1', 'cmfine.b.fForceOut', 'cmfine.b.wUnproSenior', 'cmfine.board', 'cmfine.b.coachFocus', 'cmfine.why.4']) expect(da).toContain(`"${k}"`);
  });

  it('en aktiv uretfærdig post gør den næste straf uretfærdig; posten udløber efter 7·sev dage (0x5a6aa1, 0x5a5820)', () => {
    const g = gs();
    const p = tofting();
    // AWOL lige nu → fortjent for uprofessionel opførsel (0x418f60) – men den uretfærdige post fra før vejer tungere
    p.injury = { key: 'awol', days: 3, total: 3 };
    expect(fineDeserved(g, p, 2, 1, cmRand(2))).toBe(false);
    g.date = addDays(g.date, 15);
    cmFineDaily(g);
    expect(g.cmFine!.recs.some((r) => r.pid === p.id)).toBe(false);
    expect(fineDeserved(g, p, 2, 1, cmRand(2))).toBe(true);
    p.injury = null;
  });

  it('dårlig præstation: formens nyeste karakter (+0x26 & 0xf) – under 4 fortjent, 4 kun op til 1 uges bøde, 5 kun advarsel (0x5a71d4)', () => {
    const g = gs();
    const p = squad(bolton).filter((x) => x !== tofting())[0];
    const at = (n: number) => { p.cmForm = (n & 0xf) << 16; };
    at(0); expect(fineDeserved(g, p, 1, 4, cmRand(3))).toBe(false);
    at(3); expect(fineDeserved(g, p, 3, 4, cmRand(3))).toBe(true);
    at(4); expect(fineDeserved(g, p, 2, 4, cmRand(3))).toBe(true); expect(fineDeserved(g, p, 3, 4, cmRand(3))).toBe(false);
    at(5); expect(fineDeserved(g, p, 1, 4, cmRand(3))).toBe(true); expect(fineDeserved(g, p, 2, 4, cmRand(3))).toBe(false);
    at(6); expect(fineDeserved(g, p, 1, 4, cmRand(3))).toBe(false);
  });

  it('fortjent advarsel for dårlig præstation til en professionel: accepteres ("accepts his warning"), ingen klage', () => {
    const g = gs();
    const p = squad(bolton).filter((x) => x !== tofting())[1];
    setA(p, 'professionalism', 18); setA(p, 'loyalty', 15);
    p.cmForm = 2 << 16;
    const c = cmContractOf(p);
    c.b45 = 0;
    const n0 = g.news.length;
    expect(cmFinePlayer(g, p, 1, 4)).toBe(true);
    const n = g.news.slice(0, g.news.length - n0).find((x) => x.key.startsWith('cmfine.'));
    expect(n?.key).toBe('cmfine.w2');
    expect(String(n?.params.body)).toMatch(/^wPoor/);
    expect(c.b45 & 0x200).toBe(0);
  });

  it('udvisning: kun fortjent, når han blev udvist i klubbens seneste kamp inden for 8 dage (0x5a6e49)', () => {
    const g = gs();
    const p = squad(bolton).filter((x) => x !== tofting())[2];
    expect(fineDeserved(g, p, 2, 2, cmRand(4))).toBe(false);                   // ingen kamp
    const fid = 9_900_001;
    g.fixtures[fid] = { id: fid, comp: 'x', date: addDays(g.date, -2), home: bolton, away: squad(bolton)[0].club === bolton ? 1 : 2, round: 1, result: { hg: 0, ag: 1, scorers: [] } } as never;
    g.reports[fid] = { fixture: fid, players: [{ id: p.id, team: 0, rating: 5, goals: 0, assists: 0, minutes: 50, yellow: 0, red: true, injured: false, sub: false, slot: 0, shots: 0, tackles: 0, passes: 0, passesOk: 0, cond: 90, cy: 0, cw: [0, 0] }] } as never;
    expect(fineDeserved(g, p, 2, 2, cmRand(4))).toBe(true);                    // direkte rødt, 1 uges bøde
    expect(fineDeserved(g, p, 3, 2, cmRand(4))).toBe(false);                   // 2 ugers bøde er for meget
    expect(fineDeserved(g, p, 3, 3, cmRand(4))).toBe(false);                   // voldelig opførsel kræver kortets kode 0xb/0xc
    (g.reports[fid].players[0] as { cw: [number, number] }).cw = [0xc, 0];
    expect(fineDeserved(g, p, 3, 3, cmRand(4))).toBe(true);
    delete g.fixtures[fid]; delete g.reports[fid];
  });
});
