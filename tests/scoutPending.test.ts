// "Scout Player" skjules, mens spilleren er givet en spejderopgave og rapporten ikke er afleveret (ejeren 28/11).
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { scoutPending } from '../src/game/scouting';

it('scoutPending: sand efter opgaven, falsk efter annullering', () => {
  const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford FC')![0], activeNations: [eng], lang: 'en', masking: true, mode: 'extended', seed: 8 });
  const g = gs();
  const s = Object.values(g.staff).find((x) => !x.club && x.role === 'scout')!;
  s.club = g.userClub; s.expires ??= `${g.season + 2}-06-30`;
  const other = Object.values(g.clubs).find((c) => c.league === g.clubs[g.userClub].league && c.id !== g.userClub)!;
  const t = squad(other.id)[0];
  expect(scoutPending(g, t.id)).toBe(false);
  applyAction({ t: 'scout', staffId: s.id, assignment: { kind: 'player', target: t.id } });
  expect(scoutPending(g, t.id)).toBe(true);
  applyAction({ t: 'scout', staffId: s.id, assignment: null });
  s.watch = [];
  expect(scoutPending(g, t.id)).toBe(false);
});
