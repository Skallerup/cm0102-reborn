// (runde 10A) Originalens kalender: skemaerne (create_schedule) mod en kørsel af originalens kode (unicorn, ~/cm0102-engine/tools/sched/genfix.py),
// spilstarten 0x830520 og et nyt spil med den originale database i ægte tilstand.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cmDate, cmLeagueSchedule, cmStartDate } from '../src/game/cmCalendar';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { daysBetween } from '../src/game/dates';

const FIX = JSON.parse(readFileSync(new URL('./fixtures/cm-schedules.json', import.meta.url), 'utf8')) as Record<string, string>;

describe('originalens ligaskemaer', () => {
  it('EngPrm/EngFirst/EngSecond/EngThird::create_schedule 2001–2016 som originalens kode', () => {
    let n = 0;
    for (const [key, want] of Object.entries(FIX)) {
      const [id, ys] = key.split('-');
      const year = Number(ys);
      const got = cmLeagueSchedule(id, year)!.map((r) => {
        const y = Number(r.date.slice(0, 4));
        const doy = daysBetween(`${y}-01-01`, r.date);
        return `${doy}.${y - year}.${r.slot}.${r.tv.map((t) => t.join('/')).join('+')}`;
      }).join(' ');
      expect(got, key).toBe(want);
      n++;
    }
    expect(n).toBe(64);
  });
  it('Date(dag, måned, år, ugedag) = nærmeste ugedag højst 3 dage væk', () => {
    expect(cmDate(19, 7, 2001, 5)).toBe('2001-08-18'); // søndag 19/8 → lørdag 18/8
    expect(cmDate(10, 7, 2001, 5)).toBe('2001-08-11'); // fredag 10/8 → lørdag 11/8
    expect(cmDate(23, 7, 2001, 2)).toBe('2001-08-22');
    expect(cmDate(1, 0, 2002, -1)).toBe('2002-01-01');
  });
});

describe('spilstarten 0x830520', () => {
  it('England 14/7-2001, Spanien (start efter 1/9 → 1/9) 4/8, Brasilien før 1/1 → 1/1, uden række null', () => {
    expect(cmStartDate(60, 2001)).toBe('2001-07-14');
    expect(cmStartDate(171, 2001)).toBe('2001-08-04');
    expect(cmStartDate(94, 2001)).toBe('2001-07-29');
    expect(cmStartDate(27, 2001)).toBe('2001-01-01');
    expect(cmStartDate(5, 2001)).toBeNull();
  });
});

describe('nyt spil med originalens kalender', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  it('starter 14/7, Premier League 18/8, First Division 11/8, FA Cup på originalens datoer, ingen klub to kampe på to dage', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    expect(g.date).toBe('2001-07-14');
    const first = (comp: string) => Object.values(g.fixtures).filter((f) => f.comp === comp).map((f) => f.date).sort()[0];
    expect(first('CM7')).toBe('2001-08-18');
    expect(first('CM8')).toBe('2001-08-11');
    expect(first('CUP-60')).toBe('2001-12-08');
    // PL-runde 26 (skemaets række 25) ligger på 2/2-2002 som runde 25 – add_fixture flytter den til onsdag 6/2 (som i oraklets sæson crowd1)
    const r25 = Object.values(g.fixtures).filter((f) => f.comp === 'CM7' && f.round === 26);
    expect(r25.every((f) => f.date === '2002-02-06')).toBe(true);
    const byClub = new Map<number, string[]>();
    for (const f of Object.values(g.fixtures)) if (/^CM([789]|10)$|^CUP-60$/.test(f.comp)) for (const c of [f.home, f.away]) byClub.set(c, [...(byClub.get(c) ?? []), f.date]);
    for (const ds of byClub.values()) {
      ds.sort();
      for (let i = 1; i < ds.length; i++) expect(daysBetween(ds[i - 1], ds[i])).toBeGreaterThan(1);
    }
  });
  it('den udvidede tilstand og den moderne database beholder 1/7', () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'extended' });
    expect(gs().date).toBe('2001-07-01');
    expect(Object.values(gs().fixtures).filter((f) => f.comp === 'CM7').map((f) => f.date).sort()[0]).toBe('2001-08-11');
  });
});
