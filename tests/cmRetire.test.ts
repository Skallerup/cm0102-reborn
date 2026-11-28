// Originalens pensioneringer (src/game/cmRetire.ts – PLAYER_REGEN 0x7a58f0/0x7a5790/0x7a59e0/0x7a7310/0x7a79c0/0x7a8050/0x7a7f20) i ægte tilstand
// med den originale database: listen ved spilstarten som oraklets (14/7-2001, frø 1: 312 poster, 267 i England, meldt dag 1–96 af 2001, stop
// dag 170–199 af 2002), meldingen dagen efter, pensioneringen dagen efter stopdatoen med nyhed til menneskets klub og en regen i køen.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { checkRetirement, cmRetireInjury, npStaffOf, retireBody } from '../src/game/cmRetire';
import { ageOn } from '../src/game/dates';
import { repairRetiredIntl } from '../src/game/save';
import { VIRTUAL_ID0 } from '../src/game/cmVirtual';
import type { GameState, Player } from '../src/game/types';

let g: GameState;
let eng = -1;
let staff0 = 0, res0 = 0;
const day = () => { const d0 = g.date; while (g.date === d0 || !g.dayDone) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); } };

beforeAll(() => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  eng = world.nations.findIndex((x) => x.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
  staff0 = g.nextId.staff; res0 = g.cmNpRes?.length ?? -1;
}, 600_000);

describe('PLAYER_REGEN ved spilstarten (0x7a58f0 → 0x7a79c0)', () => {
  it('listen har de ældre spillere i klubberne, dateret som originalen', () => {
    const L = g.cmRet!.list.filter((e) => !e.st);
    const inEng = L.filter((e) => e.why === 1 && e.club && g.clubs[e.club]?.nation === eng);
    // oraklet (databasestørrelse 2, 14/7-01): 267 engelske – 61 i de synlige ligaer, 206 i Conference og nedefter (non-league, nu i world-filen);
    // spillet med en world bygget med CM_DBSIZE=2: 258 (54 + 204). Her Maximum (ejerens størrelse): flere non-league-spillere i hukommelsen
    // (381 = 53 + 328) – de synlige ligaer har alle spillere i hukommelsen ved begge størrelser
    const vis = inEng.filter((e) => !g.leagues[g.clubs[e.club].league]?.hidden);
    expect(vis.length).toBeGreaterThan(45);
    expect(vis.length).toBeLessThan(75);
    expect(inEng.length).toBeGreaterThan(250);
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
    const L = g.cmRet!.list.filter((e) => !e.st);
    const passed = L.filter((e) => e.a < 2001195);
    expect(passed.length).toBeGreaterThan(0);
    for (const e of passed) { expect(e.ann).toBe(1); expect(g.players[e.id]?.cmRetire).toBe(true); }
    const ars = L.filter((e) => e.club === g.userClub && (e.why === 1 || e.why === 2) && e.a < 2001195);
    const news = g.news.filter((n) => n.key === 'cmret.ann');
    expect(news.length).toBe(ars.length);
    // (cmStaffRetire.ts) reservepuljen: 10 tomme poster ved spilstarten (0x7a54e8); dag 1 får (10 − 2) spillere på 31+ en post (0x7a66bd –
    // oraklet 16/7-01: Kahn, Pagliuca, Aldair, John Durnin …)
    expect(res0).toBe(10);
    expect(g.cmNpRes!.length).toBe(2);
    // (en spiller, der går på pension samme dag, kan tage en først – 0x7a5cdb – så bliver han ledig stab: i alt stadig 8)
    const got = Object.values(g.staff).filter((s) => s.id >= staff0 && (s.cmExtra || s.exPlayer));
    expect(got.length).toBe(8);
    for (const s of got.filter((x) => x.cmExtra)) {
      const p = g.players[s.cmId!];
      expect(p).toBeDefined();
      expect(ageOn(p.dob, g.date)).toBeGreaterThanOrEqual(31);
      expect(npStaffOf(g, p)).toBe(s);
      expect([11, 13, 15]).toContain(s.cmJob);
      expect(s.ca).toBe(0);                                                  // de tomme poster: CA/PA 0
    }
  }, 600_000);
  it('en fremtidig post først i rækkefølgen blokerer meldingerne (0x7a64f4)', () => {
    const L = g.cmRet!.list;
    const e = L.find((x) => !x.ann && x.why === 1)!;
    if (!e) return;
    const p = Object.values(g.players).find((x) => x.club && !L.some((y) => y.id === x.id))!;
    L.push({ id: p.id, club: p.club, a: 2001300, r: 2001300, why: 8, ann: 0 });
    day();
    expect(e.ann).toBe(0);
    L.splice(L.findIndex((x) => x.id === p.id && !x.st), 1);
  }, 600_000);
  it('dagen efter stopdatoen: pensioneret, nyhed til klubben og en regen i køen', () => {
    const L = g.cmRet!.list;
    const e = L.find((x) => x.club === g.userClub && !x.st) ?? L.find((x) => x.club && !x.st)!;
    const p = g.players[e.id];
    e.r = e.a = 2001100;                                                     // stopdatoen passeret
    const before = g.regenQueue?.length ?? 0;
    day();
    expect(g.players[e.id]).toBeUndefined();
    expect((g.regenQueue?.length ?? 0) + (g.cmRetLog?.length ?? 0)).toBeGreaterThan(before);
    expect(g.cmRetLog?.some(([, a]) => a === ageOn(p.dob, g.date) || a === ageOn(p.dob, g.date) - 1)).toBe(true);
    if (e.club === g.userClub) expect(g.news.some((n) => n.key === 'cmret.ret' || n.key === 'cmret.shock')).toBe(true);
  }, 600_000);
  it('0x775ba0/0x7aace0: den pensionerede forlader landsholdets trup og A-puljen (gruppens sidste ind på pladsen) – ingen erstatning', () => {
    const L = g.cmRet!.list, sq = g.intl!.cmSq!;
    // en udtaget-ved-pension-kandidat i sin nationalitets A-pulje, ikke gruppens laveste (0x775bea: kun når gruppens +0xf er under hans omdømme)
    let e: (typeof L)[number] | undefined, gr = -1;
    for (const x of L) {
      const p = x.st ? undefined : g.players[x.id];
      if (!p?.club || ageOn(p.dob, g.date) < 30) continue;
      const k = sq.pool?.[p.nation]?.[0]?.findIndex((l) => l.indexOf(p.id) >= 0 && l.indexOf(p.id) < l.length - 1) ?? -1;
      if (k >= 0) { e = x; gr = k; break; }
    }
    expect(e).toBeDefined();
    const p = g.players[e!.id], grp = sq.pool![p.nation][0][gr];
    const last = grp[grp.length - 1], at = grp.indexOf(p.id), n0 = grp.length;
    expect(sq.poolMin![p.nation][1][gr]).toBeLessThan(10000);
    const list = ((sq.sq[p.nation] ??= [null, null, null])[0] ??= { ids: [], from: g.date, until: '2001-09-01', max: 26, second: 22 });
    list.ids.push(p.id);
    const other = list.ids.filter((id) => id !== p.id);
    e!.r = e!.a = 2001100;
    day();
    expect(g.players[p.id]).toBeUndefined();
    expect(sq.sq[p.nation][0]!.ids).toEqual(other);                            // ingen erstatning
    const g2 = sq.pool![p.nation][0][gr];
    if (sq.poolDate !== g.date) { expect(g2.length).toBe(n0 - 1); expect(g2[at]).toBe(last); }
    expect(g2.includes(p.id)).toBe(false);
  }, 600_000);
  it('save.ts repairRetiredIntl: gamle gems hængende id\'er ud af trupperne og landstrænerens udtagelse – én gang', () => {
    const x = { players: { 1: {}, 2: {} }, manager: { national: { nation: 3, picks: [1, 9, 2] } },
      intl: { results: [], history: [], cmSq: { sq: { 3: [{ ids: [1, 7, 2, VIRTUAL_ID0 + 1], from: '', until: '', max: 26, second: 22 }, null, null] } } } } as unknown as GameState;
    repairRetiredIntl(x);
    expect(x.intl!.cmSq!.sq[3][0]!.ids).toEqual([1, 2, VIRTUAL_ID0 + 1]);
    expect(x.manager.national!.picks).toEqual([1, 2]);
    expect(x.fixes).toContain('intlRetired');
  });
  it('0x7a7f20: skaden giver en post med årsag 8 inden for skadens halve længde', () => {
    const p = Object.values(g.players).find((x) => x.club && g.clubs[x.club].nation === eng && !g.cmRet!.list.some((e) => e.id === x.id))!;
    cmRetireInjury(g, p, 40);
    const e = g.cmRet!.list.find((x) => x.id === p.id && !x.st)!;
    expect(e.why).toBe(8);
    expect(e.a).toBe(e.r);
    expect(p.cmRetire).toBeFalsy();                                          // meldes ikke (melding = stop)
  });
});

describe('spilleren med ikke-spillerpost bliver stab (0x7a59e0 0x7a62c2, 0x7aace0, 0x7a9650)', () => {
  it('brødteksten efter jobbet ved meldingen og personen bagefter (0x7a9650)', () => {
    const r = () => 0;
    // van der Gouw (ejerens billede 19/11): spiller (job 11) uden landskampe, straks → den korte tekst
    expect(retireBody(1, 0, 0, 5670, { np: true, job: 11, liveJob: 16, liveClub: false }, r).body).toBe('now');
    expect(retireBody(1, 0, 0, 5670, { np: true, job: 8, liveJob: 8, liveClub: true }, r)).toEqual({ body: 'nowCont', job: 8, jl: 1 });
    expect(retireBody(1, 0, 3, 5670, { np: true, job: 6, liveJob: 6, liveClub: true }, r).body).toBe('nowIntl');
    expect(retireBody(1, 1, 0, 5670, { np: true, job: 11, liveJob: 16, liveClub: false }, r).body).toBe('retCoach');
    expect(retireBody(1, 1, 0, 5670, { np: true, job: 6, liveJob: 6, liveClub: true }, r)).toEqual({ body: 'retCont', job: 6 });
    expect(retireBody(1, 1, 2, 5670, { np: true, job: 12, liveJob: 5, liveClub: true }, r)).toEqual({ body: 'retIntlCont', job: 12 });
    expect(retireBody(1, 1, 2, 5670, { np: true, job: 11, liveJob: 16, liveClub: false }, () => 1).body).toBe('retIntlCoach');
    expect(retireBody(1, 1, 2, 5670, { np: false, job: 11, liveJob: 16, liveClub: true }, r).body).toBe('retIntl');
    expect(retireBody(8, 0, 0, 5670, { np: true, job: 11, liveJob: 16, liveClub: false }, r).body).toBe('injPlain');
    expect(retireBody(8, 0, 4, 5670, { np: true, job: 8, liveJob: 8, liveClub: true }, r)).toEqual({ body: 'injIntlCont', job: 8, jl: 1 });
  });
  it('samme person fortsætter som stab – ingen regen', () => {
    const p = Object.values(g.players).find((x) => x.club && !x.loan && ageOn(x.dob, g.date) >= 30 && npStaffOf(g, x) && !g.cmRet!.list.some((e) => e.id === x.id));
    expect(p).toBeDefined();
    const s = npStaffOf(g, p!)!;
    g.cmRet!.list.push({ id: p!.id, club: p!.club, a: 2001100, r: 2001100, why: 1, ann: 1 });
    day();
    expect(g.players[p!.id]).toBeUndefined();
    expect(g.staff[s.id]).toBe(s);
    expect(s.exPlayer?.pid).toBe(p!.id);
    expect(s.cmExtra).toBeFalsy();
    expect(g.regenQueue?.some((q) => q.fromId === p!.id)).toBeFalsy();
    // spiller (job 11) → ledig; spillende assistent/træner → klubbens stab
    if (s.club) expect(['manager', 'assistant', 'coach']).toContain(s.role);
    else expect(s.cmJob).toBe(0);
  }, 600_000);
});

describe('stabens pensioner (cmStaffRetire.ts – årsag 0x20)', () => {
  it('listen har ikke-spillere med årsag 0x20 og en ny person eller reservepuljen + regen-køen på stopdagen', () => {
    const L = g.cmRet!.list;
    const st = L.filter((e) => e.st);
    expect(st.length).toBeGreaterThan(0);
    for (const e of st) { expect(e.why).toBe(0x20); expect(g.staff[e.id]).toBeDefined(); }
    const e = st[0];
    const s = g.staff[e.id];
    const name = `${s.first} ${s.last}`, dob = s.dob;
    e.r = e.a = 2001100;
    const q0 = g.cmRegenQ?.length ?? 0;
    day();
    expect(L.includes(e)).toBe(false);
    if (g.staff[e.id]) {
      // 0x7ab340: en ny person på pladsen – yngre, nyt navn, samme klub
      expect(`${s.first} ${s.last}` !== name || s.dob !== dob).toBe(true);
      expect(ageOn(s.dob, g.date)).toBeLessThan(65);
    } else {
      // 0x7aaeb0 + 0x7a87d0: væk og i køen (posten i reservepuljen – 0x7a66bd giver den samme dag videre, så puljen står igen på 2)
      expect(g.cmRegenQ?.some((q) => q.id === e.id) || (g.cmRegenQ?.length ?? 0) < q0 + 1).toBe(true);
      expect(g.cmNpRes!.length).toBe(2);
    }
  }, 600_000);
});
