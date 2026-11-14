// Ægte tilstand (original database): systemer uden modstykke i originalen er slået fra (se CLAUDE.md)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { cmActive } from '../src/game/cmPlayerData';
import { monthlyClubReps } from '../src/game/season';
import { awolMonthly, boardEventsSeason } from '../src/game/rules2001';
import { gs } from '../src/game/state';

describe('ægte tilstand: gates', () => {
  it('omdømmet følger cmClubRep, og rules2001-hændelserne er slået fra', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    expect(cmActive(g)).toBe(true);
    const cid = g.userClub;
    g.cmClubRep![cid] = 8123;
    monthlyClubReps();
    expect(g.clubs[cid].rep).toBe(81);
    // kapitalindsprøjtning og børsnotering kræver ellers tilfældige tal – nu sker intet
    g.clubs[cid].balance = -50_000_000;
    const news = g.news.length;
    boardEventsSeason();
    awolMonthly();
    expect(g.clubs[cid].balance).toBe(-50_000_000);
    expect(g.news.length).toBe(news);
  }, 120_000);
});
