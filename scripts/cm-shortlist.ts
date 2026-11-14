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
const tms: [number, number][] = [];
for (const cid of ids.slice(0, +(process.env.N ?? 1e9))) { const t1 = performance.now(); afterPlan(S, cid, []); n++; tms.push([cid, performance.now() - t1]); }
{
  const byN = new Map<string, number>();
  for (const [cid, t1] of tms) { const k = g.nations[g.clubs[cid].nation]?.name ?? '-'; byN.set(k, (byN.get(k) ?? 0) + t1); }
  console.log('tid pr. land (ms): ' + [...byN].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${Math.round(v)}`).join(', '));
  console.log('dyreste: ' + [...tms].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([c, v]) => `${g.clubs[c].name} ${Math.round(v)}`).join(', '));
}
console.log('0x83b6e0 for', n, 'klubber', Math.round(performance.now() - t), 'ms');
const ev = finishSl(S);
if (process.env.DUMP) { const { writeFileSync } = await import('node:fs'); writeFileSync(process.env.DUMP, JSON.stringify({ plan: ids.slice(0, n).map((c) => g.cmPlan![c]), pairs: g.cmSlPairs })); }
console.log('begivenheder', ev.length, 'par', g.cmSlPairs?.length);
{
  let tg = 0, cw = 0, share = 0;
  const byNat = new Map<string, number[]>(), tk = new Map<string, number>();
  for (const cid of ids.slice(0, n)) {
    const rows = g.cmPlan![cid].s.map(fromRow);
    let t0 = 0;
    for (const s of rows) { if (s.role !== 0xb) continue; if (s.f > -1 && s.f !== s.s13) t0++; if (s.f === -1 && (s.b7 ?? 0) > 0) share++; }
    tg += t0; if (t0) cw++;
    const nn = g.nations[g.clubs[cid].nation]?.name ?? '-';
    const e = byNat.get(nn) ?? [0, 0, 0]; e[0]++; e[1] += t0; if (g.cmPlan![cid].st === 1) e[2]++; byNat.set(nn, e);
    if (t0) for (const s of rows) if (s.role === 0xb && s.f > -1 && s.f !== s.s13) { const p = g.players[s.f]; const k = !p?.club ? 'fri' : g.clubs[p.club].nation === g.clubs[cid].nation ? 'samme land' : 'udland'; tk.set(k, (tk.get(k) ?? 0) + 1); }
  }
  console.log('pr. land (klubber/mål/tilstand 1): ' + [...byNat].sort((a, b) => b[1][1] - a[1][1]).slice(0, 20).map(([k, v]) => `${k} ${v.join('/')}`).join(', '));
  console.log('målenes klub: ' + [...tk].map(([k, v]) => `${k} ${v}`).join(', '));
  console.log(`mål ${tg} (klubber med mål ${cw}), åbne pladser med andel ${share}`);
}
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
