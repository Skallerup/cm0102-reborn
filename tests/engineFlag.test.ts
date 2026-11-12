// Kampmotoren bag et flag: makeMatch giver zonemotoren (MatchSim), medmindre gittermotoren er slået til OG registreret,
// og gridEngineOn er kun sand med den originale database i ægte tilstand.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { aiTactic, engineTeam, gridEngineOn, makeMatch, makeQuickMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { MatchSim, quickMatch } from '../src/game/engine/match';
import { GRID_ENGINE_DEFAULT, setGridFactory, type LiveSim } from '../src/game/engine/liveSim';
import { Rng } from '../src/game/rng';

const load = (f: string) => JSON.parse(readFileSync(`public/data/${f}`, 'utf8')) as WorldData;
function start(w: WorldData, club: string, mode: 'authentic' | 'extended') {
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === club)![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode });
  return gs();
}
const pair = () => {
  const g = gs();
  const ids = Object.keys(g.clubs).map(Number).filter((id) => id !== g.userClub && !g.clubs[id].hidden).slice(0, 2);
  return [engineTeam(ids[0], aiTactic(ids[0], ids[1], true)), engineTeam(ids[1], aiTactic(ids[1], ids[0], false))] as const;
};

afterEach(() => setGridFactory(null));

describe('kampmotoren bag et flag', () => {
  it('original database: kun i ægte tilstand og kun når motoren er valgt', () => {
    const w = load('world-original.json');
    const g = start(w, 'Arsenal', 'authentic');
    // runde 8: nye spil i ægte tilstand med den originale database får gittermotoren som standard (GRID_ENGINE_DEFAULT)
    expect(g.options.engine).toBe(GRID_ENGINE_DEFAULT ? 'original' : undefined);
    g.options.engine = undefined;
    expect(gridEngineOn(g)).toBe(GRID_ENGINE_DEFAULT); // ikke valgt (gamle spil): standarden
    g.options.engine = 'zone';
    expect(gridEngineOn(g)).toBe(false);
    g.options.engine = 'original';
    expect(gridEngineOn(g)).toBe(true);
    g.options.mode = 'extended';
    expect(gridEngineOn(g)).toBe(false);
    start(w, 'Arsenal', 'extended');
    gs().options.engine = 'original';
    expect(gridEngineOn(gs())).toBe(false);
  }, 60_000);

  it('moderne database: aldrig – heller ikke i ægte tilstand', () => {
    const g = start(load('world.json'), 'Brentford FC', 'authentic');
    g.options.engine = 'original';
    expect(gridEngineOn(g)).toBe(false);
  }, 60_000);

  it('udvidet tilstand og den moderne database får ikke gittermotoren som standard', () => {
    expect(start(load('world-original.json'), 'Arsenal', 'extended').options.engine).toBeUndefined();
    expect(start(load('world.json'), 'Brentford FC', 'authentic').options.engine).toBeUndefined();
  }, 60_000);

  it('fabrikken giver MatchSim, når flaget er slået fra – også med en registreret gittermotor', () => {
    const g = start(load('world-original.json'), 'Arsenal', 'authentic');
    g.options.engine = 'zone';
    const [h, a] = pair();
    let used = 0;
    const fake = (...args: ConstructorParameters<typeof MatchSim>): LiveSim => { used++; return new MatchSim(...args); };
    expect(makeMatch(h, a, { commentary: false }, new Rng(1))).toBeInstanceOf(MatchSim);
    setGridFactory(fake);
    expect(makeMatch(h, a, { commentary: false }, new Rng(1))).toBeInstanceOf(MatchSim);
    expect(used).toBe(0);
    // slået til, men ingen gittermotor registreret: stadig MatchSim
    g.options.engine = 'original';
    setGridFactory(null);
    expect(makeMatch(h, a, { commentary: false }, new Rng(1))).toBeInstanceOf(MatchSim);
    // slået til og registreret: gittermotoren bruges til menneskets kampe (og menneskets liga) – andre kampe går på zonemotoren
    setGridFactory(fake);
    makeMatch(h, a, { commentary: false }, new Rng(1));
    expect(used).toBe(0);
    const me = engineTeam(g.userClub, aiTactic(g.userClub, a.club, true));
    makeMatch(me, a, { commentary: false }, new Rng(1));
    expect(used).toBe(1);
  }, 60_000);

  it('samme frø giver samme kamp gennem fabrikken som med quickMatch', () => {
    start(load('world-original.json'), 'Arsenal', 'authentic').options.engine = 'zone';
    const [h, a] = pair();
    const x = makeQuickMatch(h, a, { fixtureId: 7 }, new Rng(42));
    const y = quickMatch(h, a, { fixtureId: 7 }, new Rng(42));
    expect(JSON.stringify(x)).toBe(JSON.stringify(y));
    expect(x.engine).toBeUndefined(); // zonemotoren: feltet mangler = 'zone'
  }, 60_000);
});
