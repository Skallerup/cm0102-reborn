import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyActionAs } from '../src/game/actions';
import { withHuman } from '../src/game/humans';
import type { WorldData } from '../src/game/newgame';
import {
  BENCH_PLACE, SQUAD, aiTeam, allKeepers, autoKeepers, autoPick, buildDraftGame, canPlace, clubIdOf, draftPool, nextDraftOrder, slotForPick, totalPicks,
  type DraftPick, type DraftTeam,
} from '../src/game/draft';
import { mpAdvance } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { naturalRole, positionString } from '../src/game/attributes';
import { formationSlots } from '../src/game/tactics';
import { serializeState, deserializeState } from '../src/game/snapshot';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;

function runDraft(teams: DraftTeam[], order: number[], keepers = 0): DraftPick[] {
  const pool = draftPool(world, 7, world.season);
  const picks: DraftPick[] = [];
  for (let n = 0; n < totalPicks(order, keepers); n++) {
    const team = teams.find((t) => t.slot === slotForPick(order, n))!;
    const pk = autoPick(team, picks, pool, allKeepers(teams))!;
    expect(pk).toBeTruthy();
    picks.push(pk);
  }
  return picks;
}

describe('draft-liga', () => {
  it('puljen er de 500 bedste og beregnes ens hver gang', () => {
    const a = draftPool(world, 7, world.season);
    expect(a).toHaveLength(500);
    expect(a[0].ca).toBeGreaterThanOrEqual(a[499].ca);
    const ids = a.map((p) => p.id).join(',');
    // samme seed giver samme pulje (ny beregning uden cache)
    const copy = { ...world, players: world.players.slice() };
    expect(draftPool(copy, 7, world.season).map((p) => p.id).join(',')).toBe(ids);
    expect(draftPool(copy, 7, world.season)[10].attrs).toEqual(a[10].attrs);
  });

  it('snake draft: rækkefølgen vendes hver runde', () => {
    const order = [3, 1, 2];
    expect([0, 1, 2, 3, 4, 5, 6].map((n) => slotForPick(order, n))).toEqual([3, 1, 2, 2, 1, 3, 3]);
  });

  it('automatiske valg giver 11 passende startere og en målmand på bænken', () => {
    const teams = [1, 2, 3, 4].map((s) => aiTeam(s, []));
    const picks = runDraft(teams, [1, 2, 3, 4]);
    const pool = Object.fromEntries(draftPool(world, 7, world.season).map((p) => [p.id, p]));
    expect(new Set(picks.map((p) => p.player)).size).toBe(picks.length);
    for (const t of teams) {
      const mine = picks.filter((p) => p.slot === t.slot);
      expect(mine).toHaveLength(SQUAD);
      expect(new Set(mine.filter((p) => p.place >= 0).map((p) => p.place)).size).toBe(11);
      const bench = mine.filter((p) => p.place === BENCH_PLACE).map((p) => pool[p.player]);
      expect(bench).toHaveLength(5);
      expect(bench.some((p) => naturalRole(p) === 'GK')).toBe(true);
    }
    // startere står kun på pladser, der vises i deres positionsfelt
    for (const pk of picks.filter((p) => p.place >= 0)) {
      const t = teams.find((x) => x.slot === pk.slot)!;
      const slot = formationSlots(t.formation)[pk.place];
      const ps = positionString(pool[pk.player]);
      const name = slot.pos === 'ST' ? 'F' : slot.pos;
      expect(ps.split(' ')[0].split('/')).toContain(name);
      if (slot.pos !== 'GK') expect(ps.split(' ')[1] ?? '').toContain(slot.side);
    }
    // en markspiller kan ikke stå i mål
    const outfield = Object.values(pool).find((p) => naturalRole(p) === 'ST')!;
    const empty: DraftTeam = { ...aiTeam(9, []), formation: '4-4-2' };
    expect(canPlace(empty, [], outfield, 0, pool)).toBe(false);
  });

  it('en hel sæson med to managere og to AI-hold, slutspil og ny draft med keepers', async () => {
    const teams: DraftTeam[] = [
      { ...aiTeam(1, []), ai: false, pid: 'p1', manager: 'Anna', name: 'Anna FC', short: 'ANN' },
      { ...aiTeam(2, []), ai: false, pid: 'p2', manager: 'Bo', name: 'Bo United', short: 'BOU' },
      aiTeam(3, ['Anna FC']),
      aiTeam(4, ['Anna FC']),
    ];
    const picks = runDraft(teams, [2, 4, 1, 3]);
    const g = buildDraftGame({ world, seed: 7, season: 1, lang: 'da', settings: { rounds: 2, playoff: 'semis', keepers: 2, injuries: true }, teams, picks, hostPid: 'p1' });
    expect(Object.keys(g.clubs)).toHaveLength(4);
    expect(squad(clubIdOf(1))).toHaveLength(16);
    expect(g.userClub).toBe(clubIdOf(1));
    expect(g.tactic!.lineup.filter(Boolean)).toHaveLength(11);
    // to gange mod alle = 6 runder à 2 kampe
    expect(Object.values(g.fixtures).filter((f) => f.comp === 'DL')).toHaveLength(12);
    let turns = 0;
    let r = { days: 0, reason: '' };
    while (!g.draft!.seasonOver && turns < 60) { r = mpAdvance(); turns++; }
    expect(g.draft!.seasonOver).toBe(true);
    expect(r.reason).toBe('season');
    expect(g.comps.DL.finished).toBe(true);
    expect(g.comps.DLPO.finished).toBe(true);
    expect(Object.values(g.fixtures).filter((f) => f.comp === 'DLPO')).toHaveLength(3);
    const h = g.draft!.history[0];
    expect(h.table).toHaveLength(4);
    expect(h.playoffWinner).toBeTruthy();
    expect(Object.values(g.draft!.allTime).reduce((a, x) => a + x.p, 0)).toBe(24);
    // ingen økonomi, transfers eller pressemøder undervejs
    withHuman('p2', () => {
      expect(g.news.some((n) => n.cat === 'finance' || n.cat === 'transfer' || n.key.startsWith('press'))).toBe(false);
      expect(g.news.filter((n) => n.cat === 'match').length).toBeGreaterThan(5);
    });
    // skader er højst to uger
    expect(Object.values(g.players).every((p) => (p.injury?.days ?? 0) <= 14)).toBe(true);

    // næste sæson: sidst placerede vælger først, keepers beholdes på deres pladser
    const order = nextDraftOrder();
    expect(order[0]).toBe(h.table[3].club - 900_000);
    const blob = await serializeState(g);
    const state = await deserializeState(blob);
    const teams2 = teams.map((t) => ({ ...t, keep: autoKeepers(clubIdOf(t.slot), 2, state) }));
    expect(teams2[0].keep).toHaveLength(2);
    const picks2 = runDraft(teams2, order, 2);
    expect(picks2.length).toBe(4 * 14);
    const g2 = buildDraftGame({ world, seed: 7, season: 2, lang: 'da', settings: g.draft!.settings, teams: teams2, picks: picks2, hostPid: 'p1', prev: state.draft });
    expect(g2.draft!.history).toHaveLength(1);
    expect(g2.draft!.season).toBe(2);
    expect(squad(clubIdOf(2))).toHaveLength(16);
    expect(squad(clubIdOf(2)).map((p) => p.id)).toEqual(expect.arrayContaining(teams2[1].keep.map((k) => k.player)));
  }, 120_000);

  it('en langtidsskadet spiller kan erstattes med en udraftet', () => {
    const g = gs();
    const p = squad(g.userClub).find((x) => naturalRole(x) !== 'GK')!;
    p.injury = { key: 'hamstring', days: 10 };
    const inn = Object.values(g.players).find((x) => !x.club && naturalRole(x) !== 'GK')!;
    expect(applyActionAs(g.active!, { t: 'draftReplace', out: p.id, inn: inn.id })).toBe('ok');
    expect(g.players[inn.id].club).toBe(g.userClub);
    expect(g.players[p.id].club).toBe(0);
  });
});
