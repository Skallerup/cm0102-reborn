// 2026/27 i ægte tilstand (MODERN_PARITY 13): originalens stab – Staff Search 0x7afa70 med hukommelsen 0x524d70 (world-cm.json staffMem +
// world-cm-staff.json staffX), databasens løn i startkontrakterne 0x4c7560/0x83a1b0 (via cmMoney-faktoren) og gaten cmStaffOn.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmStaffOn } from '../src/game/cmPlayerData';
import { cmStaffInSearch, cmStaffCompensation, cmStaffRestGbp } from '../src/game/cmStaff';
import { cmStaffOfferCheck } from '../src/game/cmContractGame';
import { cmGbp } from '../src/game/cmMoney';
import { regionOf } from '../src/game/leagues';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & Record<string, unknown>;
const side = JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw: Record<string, unknown> };
const staffSide = existsSync('public/data/world-cm-staff.json') ? JSON.parse(readFileSync('public/data/world-cm-staff.json', 'utf8')) as Record<string, unknown> : {};
const nat = (n: string) => world.nations.findIndex((x) => x.name === n);
const clubId = (n: string) => world.clubs.find((c) => c[1] === n || c[2] === n)![0];
const start = (w: WorldData) => createGame(w, { managerName: 'T', managerNation: nat('England'), clubId: clubId('Brentford'), activeNations: [nat('England')], lang: 'en', masking: true, seed: 1, mode: 'authentic' });

describe('2026/27 i ægte tilstand: originalens stab', () => {
  it('uden stabens hukommelse (ældre world-cm.json): spillets egen stab som før', () => {
    const { staffMem: _m, ...raw } = side.cmRaw;
    start({ ...world, cmRaw: raw } as WorldData);
    expect(cmStaffOn(gs())).toBe(false);
  });

  it('med hukommelsen og staffX: cmStaffOn, Staff Search med de øvrige ikke-spillere og databasens løn i £ via faktoren', () => {
    start({ ...world, cmRaw: side.cmRaw, ...staffSide } as WorldData);
    const g = gs();
    expect(g.cmStaffMem).toBe(true);
    expect(cmStaffOn(g)).toBe(true);
    const region = regionOf('England');
    const search = Object.values(g.staff).filter((s) => cmStaffInSearch(g, s, region));
    expect(search.length).toBeGreaterThan(1000);
    expect(search.some((s) => s.cmExtra)).toBe(true);
    // stab med klub har databasens person-id og en løn (startkontrakten – managerne ingen, 0x4c7560)
    const clubStaff = Object.values(g.staff).filter((s) => s.club && s.cmNp && s.role !== 'manager' && g.clubs[s.club].nation === nat('England'));
    expect(clubStaff.length).toBeGreaterThan(100);
    expect(clubStaff.every((s) => s.cmId !== undefined)).toBe(true);
    expect(clubStaff.filter((s) => s.wage > 0).length / clubStaff.length).toBeGreaterThan(0.95);
    // kompensationen 0x8d0780 regnes i £ med klubbens faktor og gives tilbage i €
    const s = clubStaff.find((x) => x.wage > 0 && x.expires > g.date)!;
    const f = cmGbp(g, s.club);
    expect(f).not.toBe(0.86);
    expect(cmStaffCompensation(g, s)).toBe(Math.round(cmStaffRestGbp(g, s) / f));
    // menneskets kontrakttilbud 0x4e06e0 kører på 2026/27
    expect(cmStaffOfferCheck(g, s, g.userClub, 8)).not.toBeNull();
  });
});
