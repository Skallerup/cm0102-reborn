// Konverteringen af gamle gemte spil (src/game/cmConvert.ts – ejerens valg 16/11): et simuleret gammelt spil (originalens lag fjernet, egenskaberne pustet
// op: 20 overalt, fart 1, CA over PA) konverteres og er bagefter konsistent; 2026/27-spil startes forfra i originalen med karrieren som forhistorie.
// Den lange kørsel (3 sæsoner efter konverteringen): scripts/convert-soak.ts.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, setGame } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { ATTRS } from '../src/game/attributes';
import { ageOn } from '../src/game/dates';
import { clubCandidates, convertOptions, convertOriginal, convertProblems, matchClubIn, restartInOriginal, type ConvertReport } from '../src/game/cmConvert';
import { saveKindFromText, saveKindOf } from '../src/game/saveKind';
import type { CMWorld } from '../src/game/data/cm0102';
import type { GameState } from '../src/game/types';
import { makeLegacy } from './helpers/legacySave';

let world: CMWorld, old: GameState, before: GameState, fresh: GameState, g: GameState, rep: ConvertReport;
let eng = -1, arsenal = 0;

beforeAll(() => {
  world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as CMWorld;
  eng = world.nations.findIndex((x) => x.name === 'England');
  arsenal = world.clubs.find((c) => c[1] === 'Arsenal')![0];
  createGame(world as WorldData, { managerName: 'Old Save', managerNation: eng, clubId: arsenal, activeNations: [eng], lang: 'en', masking: true, seed: 7, mode: 'extended' });
  for (let i = 0; i < 10; i++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
  old = makeLegacy(gs());
  before = JSON.parse(JSON.stringify(old)) as GameState;
  createGame(world as WorldData, convertOptions(old, world, 'en'));
  fresh = gs();
  // to år er gået siden databasens start (aldringen): spilstarten flyttes tilbage
  fresh.date = `${+fresh.date.slice(0, 4) - 2}${fresh.date.slice(4)}`;
  rep = convertOriginal(old, fresh, world);
  g = gs();
}, 1_800_000);

describe('konverteringen af et gammelt spil med den originale database', () => {
  it('genkendes som gammelt – før og efter (også i den gemte tekst)', () => {
    expect(saveKindOf(before)).toBe('oldOriginal');
    expect(saveKindFromText(JSON.stringify(before))).toBe('oldOriginal');
    expect(saveKindOf(g)).toBe('current');
    expect(saveKindFromText(JSON.stringify(g))).toBe('current');
  });
  it('karrieren bliver: dato, klub, trupper og penge', () => {
    expect(g.date).toBe(before.date);
    expect(g.userClub).toBe(before.userClub);
    expect(g.options.mode).toBe('authentic');
    expect(g.clubs[arsenal].balance).toBe(before.clubs[arsenal].balance);
    const mine = Object.values(before.players).filter((p) => p.club === arsenal).map((p) => p.id).sort();
    expect(Object.values(g.players).filter((p) => p.club === arsenal).map((p) => p.id).sort()).toEqual(mine);
    for (const id of mine) if (before.players[id].contract) expect(g.players[id].contract!.wage).toBe(before.players[id].contract!.wage);
  });
  it('konsistent: CA ≤ PA, egenskaberne 1..20 og de viste = de interne', () => {
    expect(convertProblems(g)).toEqual([]);
    expect(rep.dbPlayers).toBeGreaterThan(20_000);
    expect(rep.clamped).toBeGreaterThan(0);
  });
  it('de oppustede værdier (20 overalt, fart 1) er væk for databasens spillere', () => {
    const pace = ATTRS.indexOf('pace'), fin = ATTRS.indexOf('finishing'), tck = ATTRS.indexOf('tackling'), han = ATTRS.indexOf('handling');
    const inflated = Object.values(before.players).filter((p) => !p.regen && p.attrs[fin] === 20 && p.attrs[tck] === 20 && p.attrs[han] === 20 && p.attrs[pace] === 1);
    expect(inflated.length).toBeGreaterThan(50);
    const still = inflated.filter((p) => { const q = g.players[p.id]; return q.attrs[fin] === 20 && q.attrs[tck] === 20 && q.attrs[han] === 20; });
    expect(still.length).toBe(0);
    expect(inflated.filter((p) => g.players[p.id].attrs[pace] <= 1).length).toBeLessThan(inflated.length / 10);
  });
  it('spillere over 30 er ældet som originalen (fysikken falder, stiger aldrig)', () => {
    const k = ['pace', 'acceleration', 'agility', 'stamina', 'strength', 'naturalFitness', 'jumping'].map((x) => ATTRS.indexOf(x as never));
    const vets = Object.values(g.players).filter((p) => !p.regen && fresh.players[p.id] && ageOn(p.dob, g.date) >= 34);
    expect(vets.length).toBeGreaterThan(100);
    let down = 0;
    for (const p of vets) {
      const f = fresh.players[p.id];
      for (const i of k) expect(p.attrs[i]).toBeLessThanOrEqual(f.attrs[i] + 0.5);
      if (k.some((i) => p.attrs[i] < f.attrs[i] - 0.5)) down++;
    }
    expect(down).toBeGreaterThan(vets.length / 5);
    expect(rep.aged).toBeGreaterThan(100);
  });
  it('bestyrelse og forhold neutrale, ingen sure spillere, og en besked til spilleren', () => {
    // (originalens bestyrelse skriver sin egen tillid efter ansættelsen – neutral, ikke truende)
    expect(g.board.confidence).toBeGreaterThanOrEqual(50);
    expect(Object.values(g.players).filter((p) => p.unhappy || p.complaint).length).toBe(0);
    expect(g.cmBoard).toBeTruthy();
    expect(g.news.some((n) => n.key === 'conv.done')).toBe(true);
    expect(rep.nextSeason).toBe(true);
  });
  it('spillet kører videre (som et gemt spil)', () => {
    setGame(JSON.parse(JSON.stringify(g)) as GameState);
    for (let i = 0; i < 5; i++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
    expect(gs().date > before.date).toBe(true);
  }, 600_000);
});

describe('2026/27: forfra i den originale', () => {
  it('klubben findes på navn + land; ellers klubber i samme land og række', () => {
    expect(matchClubIn(world, 'Arsenal FC', 'Arsenal', eng)).toBe(arsenal);
    expect(matchClubIn(world, 'Brentford FC', 'Brentford', eng)).not.toBe(arsenal);
    expect(matchClubIn(world, 'Inter Miami CF', 'Inter Miami', eng)).toBeNull();
    const c = clubCandidates(world, eng, 1);
    expect(c.length).toBe(20);
    expect(c.some((x) => x.id === arsenal)).toBe(true);
  });
  it('karrieren følger med som forhistorie (ukendte klubber med navn)', () => {
    const m = JSON.parse(JSON.stringify(before)) as GameState;
    delete m.dbKind; delete m.dbYear;
    expect(saveKindOf(m)).toBe('modern');
    m.manager.history = [{ season: 2026, club: arsenal, league: 'CM7', pos: 2 }, { season: 2027, club: 424242, league: 'X', pos: 1 }];
    m.manager.trophies = [{ season: 2027, comp: 'Premier League', club: 424242 }];
    m.clubs[424242] = { ...m.clubs[arsenal], id: 424242, name: 'Inter Miami CF', short: 'Inter Miami' };
    const r = restartInOriginal(m, fresh, world, false);
    expect(r.history).toBe(2);
    expect(gs().manager.history[0].club).toBe(arsenal);
    expect(gs().manager.history[1]).toMatchObject({ club: 0, clubName: 'Inter Miami CF' });
    expect(gs().manager.trophies[0]).toMatchObject({ club: 0, clubName: 'Inter Miami CF' });
    expect(gs().news.some((n) => n.key === 'conv.restart')).toBe(true);
  });
});
