// Database-editoren: ændringer lægges oven på grunddatabasen og slår igennem i et nyt spil.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { applyDb, emptyDb, sanitizeDb, NEW_ID0 } from '../src/game/dbEdit';
import { A } from '../src/game/attributes';

const base = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const F = Object.fromEntries(base.playerFields.map((f, i) => [f, i]));
const idOf = (first: string, last: string) => base.players.find((p) => p[F.first] === first && p[F.last] === last)![F.id] as number;
const clubId = (name: string) => base.clubs.find((c) => c[1] === name)![0];

describe('database-editor', () => {
  const ts = idOf('Maxim', 'Tsigalko');
  const millwall = clubId('Millwall');
  const db = emptyDb('Legends', 'original');
  db.players[ts] = { pa: -2, club: millwall, attrs: { [A.finishing]: 20 }, ca: 120 };
  db.added.push({ id: NEW_ID0 + 1, first: 'Tó', last: 'Madeira', dob: '1983-02-02', nation: base.nations.findIndex((n) => n.name === 'Portugal'), club: millwall, ca: 130, pa: 190, pos: [1, 1, 1, 1, 1, 1, 20, 1], side: [1, 20, 1] });
  db.clubs[millwall] = { name: 'Millwall Lions', rep: 90, balance: 50_000_000, colors: ['#ff0000', '#ffffff'] };

  it('rører ikke grunddatabasen', () => {
    const before = JSON.stringify(base.clubs.find((c) => c[0] === millwall));
    applyDb(base, db);
    expect(JSON.stringify(base.clubs.find((c) => c[0] === millwall))).toBe(before);
  });

  it('slår igennem i et nyt spil', () => {
    const w = applyDb(base, db);
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: millwall, activeNations: [eng], lang: 'da', masking: true, seed: 2 });
    const g = gs();
    const p = g.players[ts];
    expect(p.club).toBe(millwall);
    expect(p.ca).toBe(120);
    expect(p.pa).toBeGreaterThanOrEqual(Math.max(71, p.ca)); // -2: oftest 120-200 (originalens regel, playerInit.ts)
    // editoren gemmer databasens værdi (20); spillet viser den gennem originalens afbalancering (sub_538ec0/sub_538bc0)
    expect(Math.round(p.attrs[A.finishing])).toBeGreaterThanOrEqual(17);
    const tm = g.players[NEW_ID0 + 1];
    expect(tm.last).toBe('Madeira');
    expect(tm.club).toBe(millwall);
    expect(tm.pa).toBe(190);
    expect(g.clubs[millwall].name).toBe('Millwall Lions');
    expect(g.clubs[millwall].rep).toBe(90);
    expect(g.clubs[millwall].balance).toBe(50_000_000);
    expect(g.clubs[millwall].colors).toEqual(['#ff0000', '#ffffff']);
    }, 20_000);

  it('importerede filer rettes ind efter originalens grænser', () => {
    const d = sanitizeDb({ ...db, players: { [ts]: { ca: 999, pa: -7, attrs: { 2: 55, 999: 3 } } }, clubs: { 1: { colors: ['red', 'x'], rep: 500 } } })!;
    expect(d.players[ts]).toEqual({ ca: 200, pa: 1, attrs: { 2: 20 } });
    expect(d.clubs[1]).toEqual({ rep: 98 });
    expect(sanitizeDb({ name: 'x', base: 'nope' })).toBeNull();
  });
});
