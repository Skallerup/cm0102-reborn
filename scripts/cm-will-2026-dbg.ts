// fejlsøgning: kravet 0x85fc50 på 2026/27 (rå tal) – npx tsx scripts/cm-will-2026-dbg.ts [klub]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmTalkDemand, WANT_DEBUG } from '../src/game/cmContractGame';
import { cmGbp } from '../src/game/cmMoney';
import { cmSearchInterestValue } from '../src/game/cmSearchInterest';
import { cmMoveCheck, buildWantMem } from '../src/game/cmContractGame';
import { buildSlMem } from '../src/game/cmShortlistGame';
import { slCall, slmOf } from '../src/game/cmShortlist';
import { cmWhy } from '../src/game/cmTransferTalks';
import { cmBoardWageAllow } from '../src/game/cmBudget';
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
w.cmRaw ??= (JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw?: unknown }).cmRaw;
const nat = (n: string) => w.nations.findIndex((x) => x.name === n);
const cid = w.clubs.find((c) => c[1] === (process.argv[2] ?? 'Vejle Boldklub'))![0];
createGame(w, { managerName: 'T', managerNation: nat('Denmark'), clubId: cid, activeNations: ['Denmark', 'Spain', 'England', 'Germany'].map(nat), lang: 'da', masking: true, seed: 1, mode: 'authentic' });
const g = gs(); const me = g.clubs[g.userClub];
console.log('me', me.name, me.league, 'gbp', cmGbp(g, me.id), 'bal €', me.balance, 'rep', me.rep, 'cmClubRep', g.cmClubRep?.[me.id]);
const lgs = Object.entries(g.cmGbp?.leagues ?? {}).sort((a, b) => b[1] - a[1]);
console.log(lgs.slice(0, 40).map(([l, f]) => `${g.leagues[l]?.name}:${f}`).join(' | '));
const sq = Object.values(g.players).filter((p) => p.club === me.id).sort((a, b) => b.ca - a.ca).slice(0, 4);
for (const p of [...sq, ...Object.values(g.players).filter((p) => p.last === 'Wind' && p.first === 'Jonas')]) {
  const calls: string[] = [];
  WANT_DEBUG.f = (adr, v) => { if (calls.length < 40) calls.push(`${adr.toString(16)}=${v}`); };
  const d = cmTalkDemand(g, p, me.id);
  WANT_DEBUG.f = undefined;
  console.log(p.first, p.last, 'CA', p.ca, 'wage€', p.contract?.wage, 'value€', p.value, 'cmRep', p.cmRep, 'repMem', p.cmRepMem, '→', d?.wage, JSON.stringify(d?.raw), d?.gbp);
  console.log('   ', calls.join(' '));
}
// spillere i samme land i klubber med omdømme ≤ menneskets: 0x846920 og grundene (bitmasken)
{
  const dk = Object.values(g.clubs).filter((c) => c.id !== me.id && c.nation === me.nation && (g.cmClubRep?.[c.id] ?? 0) <= (g.cmClubRep?.[me.id] ?? 0));
  const ps = Object.values(g.players).filter((p) => dk.some((c) => c.id === p.club));
  const xs = ps.map((p) => cmSearchInterestValue(g, p, me.id) ?? -9);
  console.log(`samme land, omdømme ≤ ${g.cmClubRep?.[me.id]}: ${ps.length} spillere i ${dk.length} klubber; ≥ 3,15: ${xs.filter((x) => x >= 3.15).length}; 0: ${xs.filter((x) => x === 0).length}`);
  const why = new Map<string, number>();
  for (const p of ps.slice(0, 60)) { const c = cmMoveCheck(g, p, me.id); if (c) for (const k of cmWhy(g, p, me.id, c.mask)) why.set(k.split(':')[0], (why.get(k.split(':')[0]) ?? 0) + 1); }
  console.log('grunde (60 første):', [...why].join(' '));
  // samme kald i de to hukommelser: buildWantMem (forhandlingen) og buildSlMem (Player Search)
  const S = buildSlMem(g, { noStale: true });
  for (const p of ps.slice(0, 8)) {
    const M = buildWantMem(g, [p.club, me.id]);
    const a = (MM: { c: import('../src/game/cmMem').CmCtx; W: { staffOf(p: unknown): number | undefined; clubOf(c: number): number | undefined } }, x: number, st: number) => {
      const s = MM.W.staffOf(p)!, cl = MM.W.clubOf(me.id)!;
      return slCall(MM.c, 0x846920, slmOf(MM.c.m), s, cl, x, 0, st, 0).toFixed(2);
    };
    console.log(`   want(1,0,1) ${a(M, 1, 1)} want(0,0,1) ${a(M, 0, 1)} sl(1,0,1) ${a(S.M, 1, 1)} sl(0,0,1) ${a(S.M, 0, 1)}`);
  }
  for (const p of ps.slice(0, 8)) {
    const c = cmMoveCheck(g, p, me.id);
    console.log(`  ${p.first} ${p.last} ${g.clubs[p.club]?.name} rep ${g.cmClubRep?.[p.club]} CA ${p.ca} løn €${p.contract?.wage} → x ${c?.x.toFixed(2)} søg ${cmSearchInterestValue(g, p, me.id)?.toFixed(2)} mask ${c?.mask.toString(16)} loft €${Math.round(cmBoardWageAllow(g, p, me.id) ?? 0)}`);
  }
}
