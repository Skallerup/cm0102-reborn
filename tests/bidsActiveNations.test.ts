// Ægte tilstand: bud på menneskets spillere kommer kun fra klubber i de valgte lande (ejerens fund 16/11: Club de Fútbol México bød på en Vejle-spiller).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { runUntil } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { interestedClubs } from '../src/game/transfers';

describe('bud kun fra de valgte lande', () => {
  it('Vejle, kun Danmark valgt: ingen interesserede eller bydende klubber uden for Danmark over 60 dage', async () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const dk = w.nations.findIndex((n) => n.name === 'Denmark');
    createGame(w, { managerName: 'T', managerNation: dk, clubId: w.clubs.find((c) => c[1].startsWith('Vejle'))![0], activeNations: [dk], lang: 'en', masking: true, seed: 11, mode: 'authentic' });
    const g = gs();
    const outside = (cid: number) => !g.activeNations.includes(g.clubs[cid].nation);
    const end = new Date(Date.parse(g.date) + 60 * 86400000).toISOString().slice(0, 10);
    let interested = 0;
    for (let i = 0; i < 4; i++) {
      for (const p of squad(g.userClub)) for (const x of interestedClubs(p)) { interested++; expect(outside(x.club), `${p.last} ← ${g.clubs[x.club].name}`).toBe(false); }
      await runUntil({ untilDate: new Date(Math.min(Date.parse(end), Date.parse(g.date) + 15 * 86400000)).toISOString().slice(0, 10), autoPlay: true, maxDays: 20 });
    }
    const bids = g.offers.filter((o) => o.seller === g.userClub);
    for (const o of bids) expect(outside(o.buyer), `bud fra ${g.clubs[o.buyer]?.name}`).toBe(false);
  }, 240_000);
});
