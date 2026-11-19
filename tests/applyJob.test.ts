// CM 01/02 "Apply for Job" på en klub- eller landsholdsskærm (0x482a40 → dialogen 0x6b19d0 → apply_for_job 0x69ca00), ægte tilstand 3.9.60
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { applyForJob, canApplyForJob } from '../src/game/board';
import { boardEnv } from '../src/game/cmBoardGame';
import { natClub } from '../src/game/cmVirtual';

describe('jobansøgning hos en klub/et landshold uden manager', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[2] === 'Man Utd')![0];
  it('knappen kun uden manager (0x53ca90) og når klubben kan styres; Yes giver svaret 0x1773 samme dag', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    const other = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league && c.manager)!;
    expect(canApplyForJob(g, mu)).toBe(false);
    expect(canApplyForJob(g, other.id)).toBe(false);
    other.manager = 0;
    expect(boardEnv(g).manager(other.id)).toBeNull();
    expect(canApplyForJob(g, other.id)).toBe(true);
    const n0 = g.nextId.news;
    expect(applyForJob(other.id)).toBe('sent');
    const reply = g.news.filter((n) => n.id >= n0).find((n) => n.key === 'job.cmAck' || n.key === 'job.cmDismiss');
    expect(reply?.key).toBe('job.cmAck');
    // ledighedsposten [MM+8] findes nu for klubben
    expect(g.cmBoard!.vac.some((v) => v.club === other.id)).toBe(true);
  });
  it('landsholdet: knappen, når forbundet mangler en manager (ikke U21), og ansøgningen går til 0x69ca00', () => {
    const g = gs();
    const nc = natClub(eng);
    expect(canApplyForJob(g, nc)).toBe(false);
    delete g.cmBoard!.nm![eng];
    expect(canApplyForJob(g, nc)).toBe(true);
    const n0 = g.nextId.news;
    expect(applyForJob(nc)).toBe('sent');
    expect(g.news.filter((n) => n.id >= n0).some((n) => n.key === 'job.cmAck')).toBe(true);
    expect(g.cmBoard!.vac.some((v) => v.club === nc)).toBe(true);
  });
});
