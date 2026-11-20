// Computerklubbernes kontrakter i ægte tilstand (MODERN_PARITY §0 B – CONTRACT_MANAGER 0x4c7ac0, cmCmOn): forlængelser, udløb (bliver med den
// udløbne kontrakt / fri transfer), frie spillere, der skifter klub, og lønsummen pr. liga – 2026/27 (world.json + world-cm.json) eller 2001.
// Daglig sammenligning af (klub, udløb) for spillerne i de spilbare landes klubber (computerklubberne).
//   npx tsx scripts/cm-contracts-2026.ts [2026|2001] [til-dato] [klub] [frø] [lande, fx England,Denmark]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmCmOn, CMD_STATS } from '../src/game/cmContractManager';
import { cmGbp } from '../src/game/cmMoney';
import { isHumanClub } from '../src/game/humans';

const db = process.argv[2] ?? '2026';
const until = process.argv[3] ?? (db === '2001' ? '2002-07-02' : '2027-07-02');
const name = process.argv[4] ?? 'Brentford';
const seed = Number(process.argv[5] ?? 1);
const lands = (process.argv[6] ?? 'England,Denmark').split(',');
const w = JSON.parse(readFileSync(db === '2001' ? 'public/data/world-original.json' : 'public/data/world.json', 'utf8')) as WorldData;
if (db !== '2001') Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const nat = lands.map((n) => w.nations.findIndex((x) => x.name === n)).filter((i) => i >= 0);
const club = w.clubs.find((c) => c[1] === name || c[2] === name)![0] as number;
createGame(w, { managerName: 'Test Smoke', managerNation: nat[0], clubId: club, activeNations: nat, lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const inScope = (cid: number) => !!g.clubs[cid] && nat.includes(g.clubs[cid].nation) && !isHumanClub(cid);
const lgName = (cid: number) => g.leagues[g.clubs[cid]?.league]?.name ?? '?';
function wages(tag: string) {
  const per: Record<string, { n: number; gbp: number; eur: number; exp: number }> = {};
  for (const p of Object.values(g.players)) {
    if (!p.club || !p.contract || !g.clubs[p.club] || !nat.includes(g.clubs[p.club].nation) || g.leagues[g.clubs[p.club].league]?.hidden) continue;
    const k = lgName(p.club);
    const s = (per[k] ??= { n: 0, gbp: 0, eur: 0, exp: 0 });
    s.n++; s.eur += p.contract.wage; s.gbp += p.contract.wage * cmGbp(g, p.club);
    if (p.contract.expires < g.date) s.exp++;
  }
  console.log(`${tag} ${g.date} lønsum pr. uge (spilbare lande, aktive ligaer):`);
  for (const [k, s] of Object.entries(per).sort((a, b) => b[1].gbp - a[1].gbp))
    console.log(`  ${k}: ${s.n} spillere · £${Math.round(s.gbp).toLocaleString('en')}/uge (snit £${Math.round(s.gbp / s.n).toLocaleString('en')}) · udløbet kontrakt ${s.exp}`);
}
console.log(`${db} ${name} start ${g.date} · CONTRACT_MANAGER ${cmCmOn(g) ? 'originalens' : 'spillets'} · cmCmMgr ${g.cmCmMgr ?? '-'}`);
wages('start');
type Snap = { club: number; exp: string | null; wage: number };
const snap = () => { const m = new Map<number, Snap>(); for (const p of Object.values(g.players)) m.set(p.id, { club: p.club, exp: p.contract?.expires ?? null, wage: p.contract?.wage ?? 0 }); return m; };
let prev = snap();
const st = { renew: 0, renewGbp: 0, renewOldGbp: 0, toFree: 0, toFreeExpired: 0, freeSigned: 0, stayExpired: 0 };
const perMonth: Record<string, { renew: number; toFree: number }> = {};
const freed = new Set<number>();
const t0 = performance.now();
let days = 0, crash = '';
try {
  while (g.date < until && days++ < 420) {
    const r = continueGame();
    if (r.match !== undefined) quickPlayUserMatch();
    const ym = g.date.slice(0, 7);
    const pm = (perMonth[ym] ??= { renew: 0, toFree: 0 });
    for (const p of Object.values(g.players)) {
      const a = prev.get(p.id);
      if (!a) continue;
      if (a.club && inScope(a.club)) {
        if (p.club === a.club && p.contract && a.exp && p.contract.expires > a.exp) {
          st.renew++; pm.renew++; st.renewGbp += p.contract.wage * cmGbp(g, p.club); st.renewOldGbp += a.wage * cmGbp(g, p.club);
        }
        if (!p.club) { st.toFree++; pm.toFree++; if (a.exp && a.exp < g.date) st.toFreeExpired++; freed.add(p.id); }
      }
      if (!a.club && p.club && freed.has(p.id)) { st.freeSigned++; freed.delete(p.id); }
    }
    prev = snap();
    if (g.date === '2026-12-31' || g.date === '2001-12-31') wages('31/12');
  }
} catch (e) { crash = String((e as Error).stack ?? e).split('\n').slice(0, 6).join('\n'); }
console.log(`--- slut ${g.date} (${Math.round((performance.now() - t0) / 1000)} s, ${days} dage)${crash ? `\nNEDBRUD:\n${crash}` : ''}`);
for (const p of Object.values(g.players)) if (p.club && inScope(p.club) && p.contract && p.contract.expires < g.date) st.stayExpired++;
console.log(`forlængelser ${st.renew} (lønnen £${Math.round(st.renewOldGbp / Math.max(1, st.renew))} → £${Math.round(st.renewGbp / Math.max(1, st.renew))}/uge i snit) · `
  + `til klubløs ${st.toFree} (heraf efter udløb ${st.toFreeExpired}) · heraf skrevet under i en ny klub ${st.freeSigned} · i klubben med udløbet kontrakt nu ${st.stayExpired}`);
console.log(`pr. måned: ${Object.entries(perMonth).map(([k, v]) => `${k} ${v.renew}/${v.toFree}`).join(', ')}`);
console.log(`CONTRACT_MANAGER: ${JSON.stringify({ ...CMD_STATS, ms: Math.round(CMD_STATS.ms) })}`);
wages('slut');
