// Originalens pensioneringer (src/game/cmRetire.ts – PLAYER_REGEN 0x7a58f0/0x7a5790/0x7a59e0/0x7a7310/0x7a79c0/0x7a8050/0x7a7f20) i ægte tilstand
// med den originale database: listen ved spilstarten som oraklets (14/7-2001, frø 1: 312 poster, 267 i England, meldt dag 1–96 af 2001, stop
// dag 170–199 af 2002), meldingen dagen efter, pensioneringen dagen efter stopdatoen med nyhed til menneskets klub og en regen i køen.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { checkRetirement, cmRetireInjury } from '../src/game/cmRetire';
import { ageOn } from '../src/game/dates';
import type { GameState, Player } from '../src/game/types';

let g: GameState;
let eng = -1;
const day = () => { const d0 = g.date; while (g.date === d0 || !g.dayDone) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); } };

beforeAll(() => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  eng = world.nations.findIndex((x) => x.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}, 600_000);

describe('PLAYER_REGEN ved spilstarten (0x7a58f0 → 0x7a79c0)', () => {
  it('listen har de ældre spillere i klubberne, dateret som originalen', () => {
    const L = g.cmRet!.list;
    const inEng = L.filter((e) => e.why === 1 && e.club && g.clubs[e.club]?.nation === eng);
    // oraklet: 267 engelske, men 153 af dem er i engelske klubber uden for spillets world-fil (Conference og nedefter); i de synlige ligaer er
    // listen identisk med oraklets (54 spillere, scripts/cm-retire-season.ts)
    expect(inEng.length).toBeGreaterThan(50);
    expect(inEng.length).toBeLessThan(160);
    // (forkørslens skader 0x7a7f20 giver poster med årsag 8 – også unge)
    for (const e of L.filter((x) => x.why !== 8)) {
      const p = g.players[e.id];
      if (!p) continue;
      expect(e.club).toBeGreaterThan(0);                                     // 0x7a79cd: kun med klub
      expect(ageOn(p.dob, '2001-01-01')).toBeGreaterThan(30);               // grænsen 30/31/34
      expect(e.why).toBe(1);
    }
    for (const e of inEng) {
      expect(Math.floor(e.a / 1000)).toBe(2001);
      expect(e.a % 1000).toBeGreaterThanOrEqual(1);
      expect(e.a % 1000).toBeLessThanOrEqual(96);                            // rand(95) + dag 0 + 1
      expect(Math.floor(e.r / 1000)).toBe(2002);                             // England +0x1d = 1
      expect(e.r % 1000).toBeGreaterThanOrEqual(170);                        // +0x15 = 170 + rand(30)
      expect(e.r % 1000).toBeLessThanOrEqual(199);
    }
  });
  it('0x7a7310: over 45 år altid; unge aldrig; målmænd først over 34', () => {
    const p = Object.values(g.players).find((x) => x.club && g.clubs[x.club].nation === eng && x.pos[0] >= 20 && ageOn(x.dob, g.date) < 30)!;
    const r = () => 0;
    expect(checkRetirement(g, p, g.date, r)).toBeNull();
    const old: Player = { ...p, dob: '1967-01-01' };                          // 34 år: endnu ikke for en målmand
    expect(checkRetirement(g, old, g.date, () => 5)).toBeNull();
    const vold: Player = { ...p, dob: '1950-01-01' };
    expect(checkRetirement(g, vold, g.date, () => 5)?.why).toBe(1);
  });
});

describe('dagene (0x7a59e0)', () => {
  it('dag 1 meldes alle forfaldne (meldt 1, staffState 0x10 = Player.cmRetire), Arsenal-spillere får nyheden', () => {
    // en fremtidig skadepost (årsag 8, melding = stop) står først i rækkefølgen 0x7ae2a0 og stopper løkken (0x7a64f4) til dens dato – som i
    // originalen; oraklets liste 14/7 har ingen, så de tages ud her
    g.cmRet!.list = g.cmRet!.list.filter((e) => e.why !== 8);
    day();
    const L = g.cmRet!.list;
    const passed = L.filter((e) => e.a < 2001195);
    expect(passed.length).toBeGreaterThan(0);
    for (const e of passed) { expect(e.ann).toBe(1); expect(g.players[e.id]?.cmRetire).toBe(true); }
    const ars = L.filter((e) => e.club === g.userClub && (e.why === 1 || e.why === 2) && e.a < 2001195);
    const news = g.news.filter((n) => n.key === 'cmret.ann');
    expect(news.length).toBe(ars.length);
  }, 600_000);
  it('en fremtidig post først i rækkefølgen blokerer meldingerne (0x7a64f4)', () => {
    const L = g.cmRet!.list;
    const e = L.find((x) => !x.ann && x.why === 1)!;
    if (!e) return;
    const p = Object.values(g.players).find((x) => x.club && !L.some((y) => y.id === x.id))!;
    L.push({ id: p.id, club: p.club, a: 2001300, r: 2001300, why: 8, ann: 0 });
    day();
    expect(e.ann).toBe(0);
    L.splice(L.findIndex((x) => x.id === p.id), 1);
  }, 600_000);
  it('dagen efter stopdatoen: pensioneret, nyhed til klubben og en regen i køen', () => {
    const L = g.cmRet!.list;
    const e = L.find((x) => x.club === g.userClub) ?? L.find((x) => x.club)!;
    const p = g.players[e.id];
    e.r = e.a = 2001100;                                                     // stopdatoen passeret
    const before = g.regenQueue?.length ?? 0;
    day();
    expect(g.players[e.id]).toBeUndefined();
    expect((g.regenQueue?.length ?? 0) + (g.cmRetLog?.length ?? 0)).toBeGreaterThan(before);
    expect(g.cmRetLog?.some(([, a]) => a === ageOn(p.dob, g.date) || a === ageOn(p.dob, g.date) - 1)).toBe(true);
    if (e.club === g.userClub) expect(g.news.some((n) => n.key === 'cmret.ret' || n.key === 'cmret.shock')).toBe(true);
  }, 600_000);
  it('0x7a7f20: skaden giver en post med årsag 8 inden for skadens halve længde', () => {
    const p = Object.values(g.players).find((x) => x.club && g.clubs[x.club].nation === eng && !g.cmRet!.list.some((e) => e.id === x.id))!;
    cmRetireInjury(g, p, 40);
    const e = g.cmRet!.list.find((x) => x.id === p.id)!;
    expect(e.why).toBe(8);
    expect(e.a).toBe(e.r);
    expect(p.cmRetire).toBeFalsy();                                          // meldes ikke (melding = stop)
  });
});
