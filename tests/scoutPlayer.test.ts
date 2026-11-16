// Spejd en spiller (Action → Scout Player) i ægte tilstand med den originale database: opgaven startes, og efter nogle dage kommer
// rapporten som nyhed og spillerens egenskaber vises (kendskab ≥ 45 = ikke "-").
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { runUntil } from '../src/game/sim';
import { knowledgeOf } from '../src/game/scouting';

describe('Scout Player (ægte tilstand, original DB, masking)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  it('opgaven startes, og rapporten kommer efter få dage med synlige egenskaber', async () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const scout = Object.values(g.staff).find((s) => s.club === g.userClub && s.role === 'scout');
    expect(scout, 'klubben har en spejder').toBeTruthy();
    const unknown = Object.values(g.players).filter((p) => p.club && p.club !== g.userClub && knowledgeOf(p) < 45 && p.ca > 100 && p.ca < 140);
    const [target, second] = unknown;
    // en igangværende søgning må ikke afbrydes af en spillerbestilling
    scout!.assignment = { kind: 'nation', target: eng, since: g.date, found: [] };
    expect(applyAction({ t: 'scout', staffId: scout!.id, assignment: { kind: 'player', target: target.id } })).toBe('ok');
    expect(applyAction({ t: 'scout', staffId: scout!.id, assignment: { kind: 'player', target: second.id } })).toBe('ok');
    expect(applyAction({ t: 'scout', staffId: scout!.id, assignment: { kind: 'player', target: target.id } })).toBe('scout.already');
    expect(g.staff[scout!.id].assignment?.kind).toBe('nation');
    await runUntil({ autoPlay: true, maxDays: 25 });
    for (const t of [target, second]) {
      expect(g.news.some((n) => n.key === 'scout.report' && n.link?.id === t.id), `scout.report for ${t.id}`).toBe(true);
      expect(knowledgeOf(t)).toBeGreaterThanOrEqual(45);
    }
    expect(g.staff[scout!.id].watch).toEqual([]);
    expect(g.staff[scout!.id].assignment?.kind).toBe('nation');
  }, 180000);
});
