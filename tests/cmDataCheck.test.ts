// K8 (docs/ORIGINAL_PARITY.md): startdata for kendte spillere/klubber/stab mod ORIGINALENS hukommelse ved spilstart (øjebliksbillederne
// ~/cm0102-engine/work-r3/snap-start/pre-0-2001.bin = databasen indlæst 1/1-2001 og pre-194-2001.bin = spilstarten 14/7-2001; kontrolscript:
// scripts/cm-data-check.ts). Tallene er læst ud af oraklets hukommelse; kun de deterministiske felter testes (fødselsdag/-måned uden dato i
// databasen, PA −1/−2/0, udfyldte egenskaber og fødder er tilfældige i originalen).
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { ATTRS } from '../src/game/attributes';
import { createGame, type WorldData } from '../src/game/newgame';
import type { CMWorld } from '../src/game/data/cm0102';
import { cmContractEnd } from '../src/game/cmContractEnd';
import { gs } from '../src/game/state';
import type { GameState, Player } from '../src/game/types';

const GBP = 0.86;
let g: GameState;
let w: CMWorld;
beforeAll(() => {
  w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as CMWorld;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w as unknown as WorldData, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}, 120_000);

const find = (first: string, last: string, year: string) => Object.values(g.players).find((p) => p.first === first && p.last === last && p.dob.startsWith(year))!;
const nat = (p: Player) => g.nations[p.nation].name;
const club = (p: Player) => g.clubs[p.club]?.name;
const at = (p: Player, k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)]);
const gbp = (eur: number | undefined) => Math.round((eur ?? 0) * GBP);

describe('K8: kendte spillere som i originalens hukommelse ved spilstart', () => {
  it('David Beckham: alle deterministiske felter', () => {
    const p = find('David', 'Beckham', '1975');
    expect([p.dob, nat(p), club(p), p.ca, p.pa, p.caps, p.number]).toEqual(['1975-05-02', 'England', 'Manchester United', 180, 189, 42, 7]);
    expect(p.pos).toEqual([1, 5, 2, 1, 20, 10, 1, 2]);
    expect(p.side).toEqual([1, 15, 20]);                       // [venstre, midt, højre] = oraklets L 1, C 15, R 20
    expect(p.feet).toEqual([12, 20]);
    expect(p.foot).toBe('R');
    expect(p.cmRepMem!.map((v) => Math.round(v * 50))).toEqual([9500, 9500, 9250]);
    expect(gbp(p.contract?.wage)).toBe(27500);
    expect(p.contract?.expires).toBe('2003-07-06');
    expect(p.cmJoined).toBe('1993-01-23');
    // skjulte egenskaber (adaptability, ambition, determination, loyalty, pressure, professionalism, sportsmanship, temperament)
    expect(['adaptability', 'ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'].map((k) => at(p, k))).toEqual([12, 18, 17, 20, 17, 10, 8, 10]);
  });

  it('Ronny Johnsen: venstre fod, landskampe, kontrakt og ankomstdato som i databasen', () => {
    const p = find('Ronny', 'Johnsen', '1969');
    expect([p.dob, nat(p), club(p), p.ca, p.pa, p.caps, p.number, p.feet, p.foot]).toEqual(['1969-06-10', 'Norway', 'Manchester United', 163, 170, 45, 5, [20, 14], 'L']);
    expect(p.pos).toEqual([1, 10, 20, 20, 10, 1, 10, 1]);
    expect(p.side).toEqual([10, 20, 10]);
    expect(gbp(p.contract?.wage)).toBe(17000);
    expect([p.contract?.expires, p.cmJoined]).toEqual(['2002-06-30', '1996-07-09']);
    expect(p.cmRepMem!.map((v) => Math.round(v * 50))).toEqual([7250, 7250, 5000]);
  });

  it('Roy Carroll: målmand; databasens ankomstdato 27/7 klippes til 5 uger før start (originalen 9/6-2001)', () => {
    const p = find('Roy', 'Carroll', '1977');
    expect([p.dob, nat(p), club(p), p.ca, p.pa, p.caps, p.number]).toEqual(['1977-09-30', 'Northern Ireland', 'Manchester United', 130, 168, 9, 13]);
    expect(p.pos[0]).toBe(20);
    expect(gbp(p.contract?.wage)).toBe(15000);
    expect(p.contract?.expires).toBe('2005-07-01');
    expect(p.cmJoined).toBe('2001-06-09');
    expect(p.cmRepMem!.map((v) => Math.round(v * 50))).toEqual([6000, 5500, 1500]);
  });

  it('Stuart Edwards (kun fødselsåret i databasen): Defender (Right), højre fod, løn og udløb som originalen', () => {
    const p = find('Stuart', 'Edwards', '1983');
    expect(p.dob.slice(0, 4)).toBe('1983');                    // dag og måned er tilfældige (oraklet 26/8) – året er fast
    expect([nat(p), club(p), p.ca, p.foot]).toEqual(['England', 'Leeds United', 55, 'R']);
    expect(p.pos[2]).toBe(20);                                  // Defender
    expect(p.pos[7]).toBe(17);                                  // Wing Back
    expect(p.side[2]).toBe(20);                                 // Right
    expect(p.feet![1]).toBe(20);                                // højre fod 20 (venstre er tilfældig)
    expect(gbp(p.contract?.wage)).toBe(314);
    expect([p.contract?.expires, p.cmJoined]).toEqual(['2004-06-29', '2001-06-09']);
    expect(p.pa).toBeGreaterThanOrEqual(p.ca);                  // databasens PA 0 → tilfældig (oraklet 55, vi trækker en anden)
  });

  it('Cherno Samba (kun fødselsåret, PA −2): CA 40, angriber i midten, begge fødder 20', () => {
    const p = find('Cherno', 'Samba', '1985');
    expect([nat(p), club(p), p.ca, p.foot, p.feet]).toEqual(['England', 'Millwall', 40, 'B', [20, 20]]);
    expect(p.pos[6]).toBe(20);
    expect(p.side[1]).toBe(20);
    expect(p.cmRepMem!.map((v) => Math.round(v * 50))).toEqual([3750, 3750, 2500]);
    expect(gbp(p.contract?.wage)).toBe(300);
    expect([p.contract?.expires, p.cmJoined]).toEqual(['2002-06-30', '1996-01-02']);
    expect(p.pa).toBeGreaterThan(p.ca);                         // −2 = 150-200 i originalen (oraklet 173); vores skøn skal også være langt over CA
  });

  it('Maxim Tsigalko (Belarus, kun fødselsåret, PA −1): fødselsår 1982, CA 70, højre fod 20', () => {
    const p = find('Maxim', 'Tsigalko', '1982');
    expect([nat(p), p.ca]).toEqual(['Belarus', 70]);
    expect(p.feet![1]).toBe(20);
    expect(w.ratings[p.id].rd).toBe(1);                         // flagget "kun året" – newgame trækker dag/måned som originalens indlæsning
    expect(w.ratings[p.id].paRaw).toBe(-1);
    expect(p.pa).toBeGreaterThanOrEqual(p.ca);
  });
});

describe('K8: kontrakter, økonomi og kondition ved spilstart', () => {
  it('startkontrakternes udløb: databasens datoer til og med 31/8-2001 flyttes 52 uger, fra 14/9 ikke (oraklet)', () => {
    expect(cmContractEnd('2001-08-31', '2001-07-14', 'England', 1, 5)).toBe('2002-08-30');
    expect(cmContractEnd('2001-09-14', '2001-07-14', 'England', 1, 5)).toBe('2001-09-14');
    expect(cmContractEnd('2001-07-27', '2001-07-14', 'England', 1, 5)).toBe('2002-07-26');
  });

  it('Fitness efter 0x62a920: England 14/7 er uden for sæsonen (≈ 8.500), ikke 9.925 – og posten står med dagens dato', () => {
    const fs = Object.values(g.players).filter((p) => p.club && g.clubs[p.club]?.nation === g.userClub && p.cmFit);
    void fs;
    const eng = g.clubs[g.userClub].nation;
    const ps = Object.values(g.players).filter((p) => p.club && g.clubs[p.club]?.nation === eng && p.cmFit);
    const avg = ps.reduce((s, p) => s + p.cmFit!.f, 0) / ps.length;
    expect(avg).toBeGreaterThan(8300);
    expect(avg).toBeLessThan(8900);                             // oraklet: gennemsnit ≈ 8.560
    expect(ps.every((p) => p.cmFit!.f <= 9925 && p.cmFit!.f >= 7000)).toBe(true);
  });

  it('startsaldoen ligger inden for ca. ±10 % af databasens (oraklet 0,91–1,09 × databasen)', () => {
    let n = 0, bad = 0;
    for (const c of Object.values(g.clubs)) {
      const db = w.clubFinance?.[c.id]?.[0] ?? 0;
      if (db <= 0 || g.leagues[c.league]?.hidden) continue;
      const x = (c.balance * GBP) / db;
      n++;
      if (x < 0.88 || x > 1.12) bad++;
    }
    expect(n).toBeGreaterThan(20);
    expect(bad / n).toBeLessThan(0.12);
  });

  it('stab med databasens ugeløn beholder den (oraklets kontrakt: Dean Wilkins £500)', () => {
    const s = Object.values(g.staff).find((x) => x.first === 'Dean' && x.last === 'Wilkins');
    if (s) expect(Math.round(s.wage * GBP)).toBe(500);
  });
});
