// Bestyrelsens tekster, nyhederne ved spilstarten og startdatoen som i CM 01/02 (den originale database i ægte tilstand):
// 0x6a4ae0/0x694440 (forventningen), 0x690d80 (tilliden, 504 blade), 0x6a8810/0x6a9470 (Board Request), 0x6a3060 (ansættelsen),
// Bosman Editions turneringsnavne (Seasons/names.tsv) og spilstarten 0x830520 for det først valgte land.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { confidenceText, expectBody, expectTitle, requestReply, requestTitle } from '../src/game/cmBoardText';
import { cmCompName, compLabel, setCompEra } from '../src/i18n/comps';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmBoardScreenText } from '../src/game/cmBoardGame';
import { meetBoard } from '../src/game/board';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import { cmTimeOfDay } from '../src/game/cmCalendar';

describe('originalens tekster', () => {
  it('forventningen 0x6a4ae0/0x694440', () => {
    expect(expectTitle(0x02)).toBe('Board want the title');
    expect(expectTitle(0x402)).toBe('Board expect glory');
    expect(expectTitle(0x10)).toBe('Board expecting difficult season');
    expect(expectBody('Manchester United', 0x02, false, false)).toBe('The Manchester United directors expect the club to mount a serious Championship challenge this season.');
    expect(expectBody('Wrexham', 0x02, false, true)).toBe('The Wrexham directors expect the club to mount a serious promotion challenge this season.');
    expect(expectBody('Boca', 0x01, true, false)).toBe('The Boca directors expect Continental qualification.');
    expect(expectBody('Bury', 0x20, false, true)).toBe('The Bury directors expect the club to battle bravely against relegation this season.');
  });
  it('tilliden 0x690d80: under 30 dage efter formuen, 30–59 og ≥ 60 dage med løbet og halen', () => {
    const base = { club: 'Manchester United', leagueBand: 3, confBand: 3, runType: 5, runLen: 0, arrogDays: 9999, conf: 5000, fans: 0 };
    expect(confidenceText({ ...base, days: 0, wealth: 0 })).toBe('The Manchester United directors are looking forward to a long and successful era under your management.');
    expect(confidenceText({ ...base, days: 0, wealth: 2 })).toBe("The Manchester United directors are looking forward to a long and successful era under your management.\n\nThe club's financial status is excellent.");
    expect(confidenceText({ ...base, days: 0, wealth: -2 })).toContain('cause for concern');
    expect(confidenceText({ ...base, days: 100, wealth: -2, leagueBand: 0, confBand: 0 })).toBe("The Manchester United directors are extremely unhappy with your performance as a whole.\n\nIn addition, the club's financial situation is a cause for great concern.");
    expect(confidenceText({ ...base, days: 100, wealth: -2, leagueBand: 0, confBand: 0, fans: 2000 })).toContain('\n\nWe are pleased to see that you have built a rapport with the fans.');
    expect(confidenceText({ ...base, days: 100, wealth: 0, leagueBand: 0, confBand: 0, runType: 1, runLen: 4 })).toContain('4');
  });
  it('Board Request 0x6a9470', () => {
    expect(requestTitle(1)).toBe('Board reaction to request to expand stadium');
    expect(requestTitle(2)).toBe('Board reaction to request for youth investment');
    expect(requestReply('Manchester United', 1, 0xb)).toBe("The Manchester United board indicate that they don't believe that the club requires expansion of its stadium at this time.");
    expect(requestReply('Bury', 1, 2)).toBe('The Bury board indicate that the club cannot consider expanding the stadium at this time due to lack of funds.');
    expect(requestReply('Bury', 5, 0)).toBe('The Bury board indicate that they have faith in your ability as a manager and will give you time to turn the club around.');
    expect(requestReply('Bury', 2, 0xc)).toContain('if the situation changes they will inform you immediately');
  });
  it('Bosman Editions turneringsnavne pr. sæson', () => {
    expect(cmCompName('English Premier Division', 2001)).toBe('FA Premier League');
    expect(cmCompName('English Premier Division', 2007)).toBe('Premier League');
    expect(cmCompName('English First Division', 2004)).toBe('Football League Championship');
    expect(cmCompName('Danish Premier Division', 2001)).toBe('Danish Superliga');
    setCompEra(true, 2001);
    expect(compLabel('English Premier Division', 'en')).toBe('FA Premier League');
    setCompEra(true, 0);
    expect(compLabel('English Premier Division', 'en')).toBe('English Premier Division');
    setCompEra(false);
  }, 300000);
});

describe('nyt spil: Man Utd, England + Danmark (England valgt først)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const nat = (n: string) => world.nations.findIndex((x) => x.name === n);
  it('starter lørdag 14/7-2001 AM med originalens fire nyheder og Board Confidence-tekst', () => {
    const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
    createGame(world, { managerName: 'm m', managerNation: nat('England'), clubId: mu, activeNations: [nat('England'), nat('Denmark')], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    expect(g.date).toBe('2001-07-14');
    expect(cmTimeOfDay(g)).toBe(0);
    setCompEra(true, g.season);
    const titles = g.news.map((n) => newsTitle(n));
    expect(titles).toEqual(['2001/02 FA Premier League fixture list decided', 'Board want the title', 'Man Utd appoint m m as manager']);
    expect(newsBody(g.news[1])).toBe('The Manchester United directors expect the club to mount a serious Championship challenge this season.');
    expect(newsBody(g.news[2])).toBe('Manchester United have appointed m m as manager.');
    // 0x6b2080: under 30 dage i jobbet → "looking forward …" (+ formuebåndet 0x5986b0 af saldoen)
    expect(cmBoardScreenText(g)!.startsWith('The Manchester United directors are looking forward to a long and successful era under your management.')).toBe(true);
    // 0x6a8810: managerens omdømme (np +0xa = 4000) under 5000 → svar 0xb
    expect(meetBoard('stadium')).toBe("The Manchester United board indicate that they don't believe that the club requires expansion of its stadium at this time.");
    expect(newsTitle(g.news[0])).toBe('Board reaction to request to expand stadium');
    setCompEra(false);
  }, 300000);
});
