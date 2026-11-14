// Ønskelisterne (cmShortlistGame.ts) på et nyt spil: npx tsx scripts/cm-shortlist.ts [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildSlMem, afterPlan, finishSl, cmInterestedClubs } from '../src/game/cmShortlistGame';
import { fromRow } from '../src/game/cmSquadPlanGame';
const seed = +(process.argv[2] ?? 1);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
import { cmShortlistOn } from '../src/game/cmShortlistGame';
void cmShortlistOn;
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
let t = performance.now();
const S = buildSlMem(g);
console.log('hukommelse', Math.round(performance.now() - t), 'ms');
t = performance.now();
const ids = Object.values(g.clubs).filter((c) => g.cmPlan?.[c.id] && (!process.env.ENG || c.nation === eng)).map((c) => c.id);
let n = 0;
for (const cid of ids.slice(0, +(process.env.N ?? 1e9))) { const t1 = performance.now(); afterPlan(S, cid, []); n++; if (n <= 10 || n % 50 === 0) console.log(n, g.clubs[cid].name, Math.round(performance.now() - t1), 'ms'); }
console.log('0x83b6e0 for', n, 'klubber', Math.round(performance.now() - t), 'ms');
const ev = finishSl(S);
if (process.env.DUMP) { const { writeFileSync } = await import('node:fs'); writeFileSync(process.env.DUMP, JSON.stringify({ plan: ids.slice(0, n).map((c) => g.cmPlan![c]), pairs: g.cmSlPairs })); }
console.log('begivenheder', ev.length, 'par', g.cmSlPairs?.length);
if (process.env.DBG) {
  const { slCall } = await import('../src/game/cmShortlist');
  const S2 = buildSlMem(g);
  for (const cid of ids.slice(0, 5)) {
    const club = S2.clubAdr(cid), fin = S2.M.W.finOf(cid);
    const tb = slCall(S2.c, 0x598800, fin, 0, 0, 0, 1, 0);
    const ent = S2.m.u32(S2.slm + 0xdc) + 9 * cid;
    console.log(g.clubs[cid].name, 'fin', fin.toString(16), '598800', tb, 'state', S2.m.u8(ent + 4), 'bal', S2.m.s32(fin), 'human', slCall(S2.c, 0x600a50, 0, club, 0, 1, 0, 0));
  }
}
for (const cid of ids.filter((c) => g.clubs[c].nation === eng).slice(0, 6)) {
  const st = g.cmPlan![cid];
  const rows = st.s.map(fromRow).filter((s) => s.role === 0xb);
  console.log(g.clubs[cid].name, 'budget', Math.round(g.clubs[cid].transferBudget * 0.86), 'tilstand', st.st,
    rows.slice(0, 25).map((s) => `${s.f >= 0 ? (g.players[s.f]?.last ?? s.f) : '-'}:${s.b7}/${s.bb}`).join(' '));
}
