// Kampstatistik pr. kamp sammenlignet med virkeligheden (Premier League-niveau).
// Kør: npx tsx scripts/match-stats.ts [kampe] [world-fil]
import { refereeFor } from '../src/game/weather';
import type { Fixture } from '../src/game/types';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { MatchSim } from '../src/game/engine/match';
import { Rng } from '../src/game/rng';
import { autoSelect, newTactic } from '../src/game/tactics';
import { ORIGINAL, aiTactic } from '../src/game/sim';
import { cmDatabase } from '../src/game/newgame';
import type { Player } from '../src/game/types';

const N = Number(process.argv[2] ?? 1500);
// original database: profilen kan overstyres (cards corners countBlocked)
const [cards, corners, blocked] = process.argv.slice(4);
if (cards) ORIGINAL.cards = Number(cards);
if (corners) ORIGINAL.corners = Number(corners);
if (blocked) ORIGINAL.countBlocked = blocked !== 'no';
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world.json', 'utf8')) as WorldData;
const ni = (n: string) => world.nations.findIndex((x) => x.name === n);
createGame(world, { managerName: 'Lab', managerNation: ni('England'), clubId: world.clubs[0][0], activeNations: [ni('England')], lang: 'da', masking: true, seed: 9 });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
void autoSelect; void newTactic;
const rng = new Rng(4);
const c: Record<string, number> = {};
const add = (k: string, v = 1) => { c[k] = (c[k] ?? 0) + v; };
for (let i = 0; i < N; i++) {
  const h = rng.pick(epl.clubs), a = rng.pick(epl.clubs.filter((x) => x !== h));
  const mk = (id: number, opp: number, home: boolean) => { const ps = fresh(id); return { club: id, tactic: aiTactic(id, opp, home), players: new Map(ps.map((p) => [p.id, p])) }; };
  // REF=1: kampens dommer fra databasen (refereeFor), ellers motorens tilfældige strenghed
  const referee = process.env.REF ? refereeFor({ id: i + 1, home: h, away: a, comp: epl.id } as unknown as Fixture) : undefined;
  if (referee) add('refStrict', referee.strict);
  const sim = new MatchSim(mk(h, a, true), mk(a, h, false), { commentary: true, aiSubs: [true, true], importance: 0.5, ...(referee ? { referee } : {}), ...(cmDatabase(g) === 'original' ? ORIGINAL : {}) }, rng);
  const r = sim.runToEnd();
  for (const st of r.stats) { add('goals', st.goals); add('shots', st.shots); add('onT', st.onTarget); add('fouls', st.fouls); add('yel', st.yellows); add('red', st.reds); add('corners', st.corners); add('offs', st.offsides); }
  for (const e of r.events) { if (e.k === 'goal' && e.og) add('og'); }
  for (const s of r.shots) if (s.outcome === 'goal') { add(`g:${s.kind}`); if (s.corner) add('g:fromCorner'); if (s.origin === 'cross') add('g:cross'); }
  for (const l of r.commentary) {
    if (['penalty', 'dive-pen', 'professional-foul', 'dive-booked', 'pen-appeal', 'advantage', 'dissent', 'time-wasting', 'long-throw', 'short-corner', 'corner-edge', 'fk-wall', 'gk-parry', 'gk-spills', 'low-cross', 'hold-up', 'poor-touch', 'red-professional'].includes(l.k)) add(`c:${l.k}`);
    if (l.k === 'added-time') add('added', Number(l.a));
  }
}
const pm = (k: string) => ((c[k] ?? 0) / N).toFixed(2);
const pg = (k: string) => `${(((c[k] ?? 0) / (c.goals || 1)) * 100).toFixed(1)}%`;
console.log(`${N} kampe (Premier League-hold, AI-taktikker)`);
console.log(`mål ${pm('goals')} (2,7) · skud ${pm('shots')} (~25) · på mål ${pm('onT')} (~8,5) · hjørnespark ${pm('corners')} (~10,5) · offside ${pm('offs')} (~4)`);
console.log(`frispark begået ${pm('fouls')} (~21) · gule ${pm('yel')} (~3,6) · røde ${pm('red')} (~0,13) · straffespark ${((c['c:penalty'] ?? 0) / N).toFixed(2)} (~0,28)`);
console.log(`selvmål ${pg('og')} af målene (~2,5 %) · hovedstødsmål ${pg('g:header')} (~17 %) · efter hjørnespark ${pg('g:fromCorner')} (~10 %) · straffe ${pg('g:pen')} (~9 %) · frispark direkte ${pg('g:fk')} (~2,5 %)`);
if (c.refStrict) console.log(`dommernes strenghed i snit ${pm('refStrict')}`);
console.log(`tillægstid efter 90 min: ${pm('added')} min (~4-5)`);
console.log('nye situationer pr. kamp:', Object.keys(c).filter((k) => k.startsWith('c:')).map((k) => `${k.slice(2)} ${pm(k)}`).join(' · '));
