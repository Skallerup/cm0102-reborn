// Man Utds Premier League-sæson (3.9.60, England, ægte tilstand, gittermotoren) i tre varianter – er det sværere at vinde ligaen, når mennesket
// selv styrer holdet, end når assistenten gør det (ferie), eller når Man Utd er en computerklub?
//   npx tsx scripts/human-vs-holiday.ts <ai|holiday|human|humanAuto> [frø = 1] [slutdato = 2002-05-20]
//   ai        – Man Utd er computerklub (mennesket styrer Wrexham)
//   holiday   – mennesket styrer Man Utd, alle kampe som quickPlayUserMatch (assistenten: aiSubs [true, true] → motorens egen udtagelse)
//   human     – mennesket styrer Man Utd og ser kampene (createLiveMatch → runToEnd, som Match.tsx): spillets taktik g.tactic (assistenten
//               fylder kun tomme pladser), ingen udskiftninger fra mennesket
//   humanAuto – som human, men den bedste 11 efter kondition før hver kamp (autoSelect – spilleren, der vælger holdet hver gang)
//   SUBS=1    (human/humanAuto) mennesket skifter en skadet ud straks og de trætteste fra minut 65; DIAG=1 Man Utds kampe, trup og handler
// Uddata: én JSON-linje (Man Utds point/placering/mål, hjemme/ude, mesteren) – sammenlign med oraklet (~/cm0102-engine/oracle/out/season-*.json).
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { labHooks, continueGame, createLiveMatch, finishUserMatch, quickPlayUserMatch } from '../src/game/sim';
import { autoSelect, newTactic, slotValue } from '../src/game/tactics';
import type { LiveSim } from '../src/game/engine/liveSim';

const variant = process.argv[2] ?? 'ai', seed = Number(process.argv[3] ?? 1), until = process.argv[4] ?? '2002-05-20';
const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
const userName = variant === 'ai' ? 'Wrexham' : 'Manchester United';
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === userName)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
g.options.engine = 'original';
// OLDTAC=<formation>: menneskets taktik før rettelsen 15/11 (spillets standardholdinstruktioner 0x22a91 og -spillerinstruktioner oven på
// forudindstillingen – originalen: forudindstillingen som indlæst, tacticTable.ts cmLoadPreset)
if (process.env.OLDTAC && variant !== 'ai') g.tactic = newTactic(process.env.OLDTAC);
if (process.env.DIAG) console.error('tactic', g.tactic?.formation, g.tactic?.cmFlags?.toString(16));
const t0 = Date.now();
// SUBS=1 (human/humanAuto): mennesket skifter som en spiller ville – en båret ud skadet straks (UI'et stopper kampen og åbner taktikken), og fra
// minut 65 de trætteste (kondition < 70 %) med den bedste ledige på bænken til pladsen
const SUBS = !!process.env.SUBS;
function playWithSubs(sim: LiveSim, me: number) {
  const used = new Set<number>();
  while (sim.step()) {
    const lv = sim.live(me);
    if (!lv.subsLeft) continue;
    const slotOf = (id: number) => sim.teams[me].tactic.slots[sim.teams[me].tactic.lineup.indexOf(id)];
    const best = (id: number) => lv.bench.filter((b) => !used.has(b)).map((b) => g.players[b]).filter(Boolean).sort((a, b) => slotValue(b, slotOf(id) ?? slotOf(lv.on[0].id)) - slotValue(a, slotOf(id) ?? slotOf(lv.on[0].id)))[0];
    const inj = lv.on.find((o) => o.injured && !o.off && !used.has(o.id));
    if (inj) { const b = best(inj.id); if (b && sim.substitute(me, inj.id, b.id)) { used.add(inj.id); used.add(b.id); continue; } }
    if (sim.minute >= 65) {
      const tired = lv.on.filter((o) => !o.off && !o.injured && !used.has(o.id) && lv.subsLeft > [...used].length / 2 && o.cond < 70 && g.players[o.id]?.pos[0] < 15).sort((a, b) => a.cond - b.cond)[0];
      if (tired) { const b = best(tired.id); if (b && b.pos[0] < 15 && sim.substitute(me, tired.id, b.id)) { used.add(tired.id); used.add(b.id); } }
    }
  }
  return sim.runToEnd();
}
// DIAG=1: Man Utds kampe – de 11's CA/moral/form/kondition ved kampen og kampene pr. turnering
const D = { inj: 0, injMin: 0, red: 0, subs: 0, n: 0, ca: 0, mor: 0, form: 0, cond: 0, endCond: 0, byComp: {} as Record<string, number> };
const top = () => squad(mu).map((p) => p.ca).sort((a, b) => b - a).slice(0, 16);
const top0 = top();
labHooks.report = (f, rep) => {
  if (f.home !== mu && f.away !== mu) return;
  const side = f.home === mu ? 0 : 1;
  const xi = rep.players.filter((l) => l.team === side && !l.sub).map((l) => g.players[l.id]).filter(Boolean);
  D.n++; D.byComp[g.comps[f.comp]?.name ?? 'venskab'] = (D.byComp[g.comps[f.comp]?.name ?? 'venskab'] ?? 0) + 1;
  const av = (fn: (p: (typeof xi)[number]) => number) => xi.reduce((s, p) => s + fn(p), 0) / Math.max(1, xi.length);
  for (const e of rep.events) if (e.t === side) { if (e.k === 'injury') { D.inj++; D.injMin += 90 - e.m; } else if (e.k === 'red') D.red++; }
  D.subs += rep.players.filter((l) => l.team === side && l.sub).length;
  D.ca += av((p) => p.ca); D.mor += av((p) => p.morale ?? 0); D.form += av((p) => p.form ?? 0);
  D.endCond += rep.players.filter((l) => l.team === side && !l.sub).reduce((s, l) => s + l.cond, 0) / Math.max(1, xi.length);
};
let userMatches = 0, xiCa = 0, xiCond = 0;
while (g.date < until) {
  const r = continueGame();
  if (r.match === undefined) continue;
  if (variant === 'ai' || variant === 'holiday') { quickPlayUserMatch(); continue; }
  const f = g.fixtures[g.pendingFixture!];
  if (variant === 'humanAuto') g.tactic = autoSelect(g.tactic ?? newTactic('4-4-2'), squad(g.userClub));
  const sim = createLiveMatch(f);
  const xi = sim.teams[f.home === g.userClub ? 0 : 1].all.slice(0, 11).map((s) => s.p);
  userMatches++; xiCa += xi.reduce((s, p) => s + p.ca, 0) / Math.max(1, xi.length); xiCond += xi.reduce((s, p) => s + (p.condition ?? 100), 0) / Math.max(1, xi.length);
  finishUserMatch(SUBS ? playWithSubs(sim, f.home === g.userClub ? 0 : 1) : sim.runToEnd());
}
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && g.nations[c.nation]?.name === 'England')!;
const fx = Object.values(g.fixtures).filter((f) => f.comp === epl.id && f.result);
type Row = { pts: number; w: number; d: number; l: number; gf: number; ga: number; hp: number; ap: number };
const T: Record<number, Row> = {};
for (const f of fx) {
  const r = f.result!;
  for (const [c, gf, ga, home] of [[f.home, r.hg, r.ag, true], [f.away, r.ag, r.hg, false]] as [number, number, number, boolean][]) {
    const t = (T[c] ??= { pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, hp: 0, ap: 0 });
    const p = gf > ga ? 3 : gf === ga ? 1 : 0;
    t.pts += p; t.gf += gf; t.ga += ga; if (home) t.hp += p; else t.ap += p;
    if (p === 3) t.w++; else if (p === 1) t.d++; else t.l++;
  }
}
const table = Object.entries(T).sort((a, b) => b[1].pts - a[1].pts || (b[1].gf - b[1].ga) - (a[1].gf - a[1].ga) || b[1].gf - a[1].gf);
const pos = table.findIndex(([c]) => +c === mu) + 1, m = T[mu];
const name = (c: string) => g.clubs[+c]?.short ?? g.clubs[+c]?.name;
console.log(JSON.stringify({ variant: variant + (SUBS ? "+subs" : ""), seed, games: fx.length, s: Math.round((Date.now() - t0) / 1000), stillUser: variant === 'ai' || g.userClub === mu, pos, ...m,
  champ: `${name(table[0][0])} ${table[0][1].pts}`, second: `${name(table[1][0])} ${table[1][1].pts}`,
  ...(process.env.DIAG ? { diag: { formation: g.tactic?.formation, inj: D.inj, injMin: D.injMin, red: D.red, subs: D.subs, n: D.n, ca: +(D.ca / D.n).toFixed(1), morale: +(D.mor / D.n).toFixed(1), form: +(D.form / D.n).toFixed(1), endCond: +(D.endCond / D.n).toFixed(1), byComp: D.byComp, top16start: top0.join(','), top16end: top().join(','), movesIn: Object.values(g.players).flatMap((p) => (p.moves ?? []).filter((m) => m.to === mu && m.date >= '2001-07-01').map((m) => `${p.last}:${p.ca}`)).join(' '), movesOut: Object.values(g.players).filter((p) => (p.moves ?? []).some((m) => m.from === mu && m.date >= '2001-07-01')).length, squad: squad(mu).length } } : {}),
  ...(userMatches ? { userMatches, xiCa: Math.round(xiCa / userMatches), xiCond: Math.round(xiCond / userMatches) } : {}) }));
