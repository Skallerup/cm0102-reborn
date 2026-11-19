// 2026/27 i ægte tilstand (Altid som originalen): ferien (HUMAN_MANAGER-posten, auto_respond 0x784100 for bud og jobtilbud) og
// "Apply for Job" (0x482a40 → 0x69ca00) for klub og landshold følger de databaseuafhængige kontakter cmMarketOn/cmBoardLogic.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { G, type SparseMem } from '../src/game/cmMem';
import { cmActive, cmBoardLogic, cmMarketOn } from '../src/game/cmPlayerData';
import { buildSlMem } from '../src/game/cmShortlistGame';
import { humanClub_600a50 } from '../src/game/cmWageGame';
import { holidayOpt_5fea50, onHoliday_5fd210 } from '../src/game/cmHoliday';
import { cmHolidayAnswerBids } from '../src/game/transfers';
import { holidayJobAnswers, holidayJobs } from '../src/game/cmBoardGame';
import { applyForJob, canApplyForJob } from '../src/game/board';
import { natClub } from '../src/game/cmVirtual';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & Record<string, unknown>;
const side = JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw: Record<string, unknown> };
const nat = (n: string) => world.nations.findIndex((x) => x.name === n);
const clubId = (n: string) => world.clubs.find((c) => c[1] === n || c[2] === n)![0];

describe('2026/27 i ægte tilstand: ferie og jobansøgning som originalen', () => {
  it('kontakterne, ferieposten i hukommelsen, buddene, jobtilbuddet og Apply for Job (klub + landshold)', () => {
    const eng = nat('England'), me = clubId('Brentford');
    createGame({ ...world, cmRaw: side.cmRaw } as WorldData, { managerName: 'T', managerNation: eng, clubId: me, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    expect(cmActive(g)).toBe(false);
    expect(cmMarketOn(g)).toBe(true);
    expect(cmBoardLogic(g)).toBe(true);
    // HUMAN_MANAGER: 0x5fd210/0x5fea50 og 0x600a50(klub, 0, …)
    g.manager.holiday = { rejectAll: true, noBuy: true };
    const S = buildSlMem(g, { noStale: true });
    const club = S.clubAdr(me), mg = S.m.u32(club + 0xcf), n = S.m.s32(G.STAFF_COUNT);
    expect([onHoliday_5fd210(S.m, mg, n), holidayOpt_5fea50(S.m, 0, mg, n), holidayOpt_5fea50(S.m, 4, mg, n)]).toEqual([1, 1, 1]);
    expect(humanClub_600a50(S.c, club, 0)).toBe(false);
    expect(humanClub_600a50(S.c, club, 1)).toBe(true);
    (S.m as SparseMem).release();
    // bud på hans spiller: "Reject all offers" afviser; uden valg svarer assistenten som computeren
    const p = Object.values(g.players).find((x) => x.club === me && !x.loan)!;
    const others = Object.values(g.clubs).filter((c) => c.id !== me && c.league === g.clubs[me].league && c.manager);
    const bid = (fee: number) => { const o = { id: g.nextId.offer++, player: p.id, buyer: others[0].id, seller: me, fee, loan: false, status: 'pending' as const, created: g.date, respondBy: g.date }; g.offers.push(o); return o; };
    const a = bid(1_000_000);
    cmHolidayAnswerBids();
    expect(a.status).toBe('rejected');
    g.manager.holiday = {};
    const b = bid(1_000);
    cmHolidayAnswerBids();
    expect(b.status).not.toBe('pending');
    // Apply for Job hos en klub uden manager
    const vac = others[1];
    expect(canApplyForJob(g, vac.id)).toBe(false);
    vac.manager = 0;
    expect(canApplyForJob(g, vac.id)).toBe(true);
    const n0 = g.nextId.news;
    expect(applyForJob(vac.id)).toBe('sent');
    expect(g.news.some((x) => x.id >= n0 && x.key === 'job.cmAck')).toBe(true);
    // landsholdet
    const nc = natClub(eng);
    if (g.cmBoard!.nm?.[eng] !== undefined) delete g.cmBoard!.nm[eng];
    expect(canApplyForJob(g, nc)).toBe(true);
    expect(applyForJob(nc)).toBe('sent');
    expect(g.cmBoard!.vac.some((v) => v.club === nc)).toBe(true);
    // jobtilbuddet på ferie: nej fjerner tilbuddet, ja giver jobbet
    g.jobOffers.push(vac.id); holidayJobs.push({ club: vac.id, yes: false }); holidayJobAnswers(g);
    expect(g.jobOffers).not.toContain(vac.id);
    g.manager.holiday = { applyJobs: true };
    g.jobOffers.push(vac.id); holidayJobs.push({ club: vac.id, yes: true }); holidayJobAnswers(g);
    expect(g.userClub).toBe(vac.id);
    g.manager.holiday = undefined;
  }, 600000);
});
