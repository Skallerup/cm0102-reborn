// Future-linjerne på Transfer-fanen (0x87ee70–0x8853ba): den beundrede holdkammerat (0x548da0) og kontraktklagen (+0x45 & 2) – ejerens
// billede af Quinton Fortune (Man Utd): "Thinks David Beckham is an essential squad member" og "Would like to negotiate a new contract".
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cmFutureLines } from '../src/game/cmTransferList';
import { cmContractOf } from '../src/game/cmPlayerData';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { addDays } from '../src/game/dates';
import { ATTRS } from '../src/game/attributes';
import { posGroup } from '../src/game/cmFutureMore';
import { addFavPerson, personKey } from '../src/game/cmRelations';

describe('Future: de manglende linjer', { timeout: 120_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  it('Fortune: den beundrede Beckham ("essential squad member") og kontraktklagen ("negotiate a new contract")', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    g.date = addDays(g.date, 60);
    const mates = squad(mu);
    const fortune = mates.find((p) => p.last === 'Fortune')!;
    const beckham = mates.find((p) => p.last === 'Beckham')!;
    expect(fortune && beckham).toBeTruthy();
    const set = (k: string, v: number) => { fortune.attrs[(ATTRS as readonly string[]).indexOf(k)] = v; };
    set('loyalty', 14); set('professionalism', 14); set('ambition', 5); set('pressure', 12); set('temperament', 12);
    fortune.cmRel = undefined; fortune.renewal = undefined; fortune.cmRetire = undefined; fortune.loan = undefined;
    fortune.joined = '1995-07-01';
    if (fortune.contract) fortune.contract.futureClub = undefined;
    // Beckham er hans yndlingsholdkammerat og nøglespiller
    addFavPerson(fortune, personKey(beckham), true, () => 0);
    const cb = cmContractOf(beckham);
    cb.b3d = 75; cb.b4f = ((cb.b4f ?? 0) & 0xf) | 0x10; cb.b45 = 0; cb.b4e = 0;
    const c = cmContractOf(fortune);
    c.b45 = 2; c.b4e = 0; c.b44 = 0; c.b4f = ((c.b4f ?? 0) & 0xf) | 0x30;
    const lines = cmFutureLines(g, fortune);
    const ks = lines.map((l) => l.k);
    expect(ks).toContain('negotiate');
    const adm = lines.find((l) => ['essential', 'lotToOffer', 'inspiredLeader', 'hangOnto', 'honouredPlaying', 'honouredTraining'].includes(l.k));
    expect(adm).toBeTruthy();
    expect(String(adm!.p?.name)).toContain('Beckham');
    expect(ks.indexOf(adm!.k)).toBeLessThan(ks.indexOf('negotiate'));       // originalens rækkefølge: den beundrede (0x87f40b) før kontrakten (0x882926)
  });

  it('kontraktklagen: Loyalty/Professionalism afgør "negotiate" eller "wants a new contract", og en agent kan overtage', () => {
    const g = gs();
    const fortune = squad(mu).find((p) => p.last === 'Fortune')!;
    const set = (k: string, v: number) => { fortune.attrs[(ATTRS as readonly string[]).indexOf(k)] = v; };
    const c = cmContractOf(fortune);
    c.b45 = 2; c.b4e = 0;
    const ks = () => cmFutureLines(g, fortune).map((l) => l.k);
    set('loyalty', 14); set('professionalism', 14); set('temperament', 12);
    expect(ks()).toContain('negotiate');
    set('professionalism', 8);
    expect(ks()).toContain('wantsNew');
    set('loyalty', 8); set('professionalism', 3);
    fortune.cmRepMem = [200, 200, 200];
    expect(ks()).toContain('agentBetter');
  });

  it('positionsgruppen 0x5481a0: en målmand er 1, en angriber med 20 er 0x40', () => {
    const gk = squad(mu).find((p) => p.pos[0] === 20)!;
    expect(posGroup(gk)).toBe(1);
    const st = squad(mu).find((p) => p.pos[6] === 20 && p.pos[0] !== 20)!;
    expect(posGroup(st) & 0x40).toBe(0x40);
  });
});
