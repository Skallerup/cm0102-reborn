// Købte spillere (ikke leje) i sæson 1: placeringen staff +0x5e (førstehold/reserver) ved ankomsten og kampene hos køberen – vores mod
// oraklet (daysnap s1, frø 1, 3.9.60, Arsenal på ferie). Klubskiftet 0x8c9720 @0x8ca7d9–0x8ca81f: computerens køber → førsteholdet (1);
// menneskets → reserverne (2) med reservehold og trupstatus 0 eller > 4.
//   [ONLY_ORACLE=1] [WORLD=public/data/world-original-normal.json] node scripts/measure.mjs -- npx tsx scripts/k7-buy-place.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';

const END = process.env.END ?? '2002-06-29';
const CLUB = 'Arsenal';
interface Arr { date: string; buyer: string; human: boolean; place0: number; placeEnd: number; apps0: number; appsMax: number; stay: boolean }
const str = (m: ReturnType<typeof loadDaySnap>, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };

function report(side: string, arr: Map<number, Arr>) {
  const all = [...arr.values()];
  const comp = all.filter((a) => !a.human);
  const line = (xs: Arr[], name: string) => {
    const r0 = xs.filter((a) => a.place0 === 2).length, rE = xs.filter((a) => a.stay && a.placeEnd === 2).length;
    const z = xs.filter((a) => a.stay && a.placeEnd === 2 && a.appsMax - a.apps0 <= 0).length;
    const zAll = xs.filter((a) => a.stay && a.appsMax - a.apps0 <= 0).length;
    const apps = xs.reduce((s, a) => s + Math.max(0, a.appsMax - a.apps0), 0);
    console.log(`${side} ${name}: købte ${xs.length}, reserver ved ankomsten ${r0}, blev ${xs.filter((a) => a.stay).length}, reserver ved slut ${rE}, reserver+0 kampe ${z}, 0 kampe i alt ${zAll}, kampe hos køberen ${apps}`);
  };
  line(comp, 'computerens'); line(all.filter((a) => a.human), 'menneskets');
  if (process.env.V) for (const [id, a] of arr) if (!a.human && a.placeEnd === 2 && a.appsMax - a.apps0 <= 0) console.log(`  ${id} ${a.date} → ${a.buyer} plads ${a.place0}/${a.placeEnd}`);
}

// ---------------- oraklet
{
  const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
  const prevClub = new Map<number, number>(), prevLoan = new Map<number, boolean>();
  const arr = new Map<number, Arr>();
  for (const e of ix.snaps) {
    if (e.iso > END) break;
    const m = loadDaySnap(ix, e);
    const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), rows = m.u32(0xae2d0c);
    const PS = m.u32(0xb74350), nP = m.s32(0xae236c), sidx = m.u32(PS + 0x30), srec = m.u32(PS + 4);
    const apps6 = (pid: number) => { if (pid < 0 || pid >= nP) return 0; const k = m.s32(sidx + 39 * pid + 4 * 5); return k < 0 ? 0 : m.u8(srec + 32 * k); };
    for (let id = 0; id < n; id++) {
      const st = S + 0x6e * id, pr = m.u32(st + 0x61);
      if (!pr || m.u8(st + 0x3d) === 16) continue;
      const ca = m.u32(st + 0x39), cix = ca ? (ca - C) / 0x245 : -1;
      if (cix >= nc) continue;
      const onLoan = m.s32(rows + 79 * id + 4) >= 0;
      const was = prevClub.get(id);
      const place = m.u8(st + 0x5e) & 3, apps = apps6(m.s32(pr));
      const a = arr.get(id);
      if (a && a.stay) { if (cix === was && !onLoan) { a.placeEnd = place; a.appsMax = Math.max(a.appsMax, apps); } else a.stay = false; }
      if (e.iso !== ix.snaps[0].iso && was !== undefined && was !== cix && cix >= 0 && !onLoan && !(a && a.stay)) {
        // (lejens slut: han var lejet ud og er hjemme hos moderklubben – ikke et køb)
        const hi = m.s32(rows + 79 * id);
        const parent = hi >= 0 ? m.s32(m.u32(m.u32(0xae1050)) + 80 * hi + 4) : -1;
        if (!(parent === cix && prevLoan.get(id))) {
          const buyer = str(m, C + 0x245 * cix + 4, 51);
          arr.set(id, { date: e.iso, buyer, human: buyer === CLUB, place0: place, placeEnd: place, apps0: apps, appsMax: apps, stay: true });
        }
      }
      prevClub.set(id, cix); prevLoan.set(id, onLoan);
    }
  }
  report('orakel', arr);
}

// ---------------- vores
if (!process.env.ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original-normal.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === CLUB)![0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();
  if (process.env.HOLIDAY !== '0') g.manager.holiday = {};
  const prevClub = new Map<number, number>(), prevL = new Map<number, number | null>();
  const arr = new Map<number, Arr>();
  let guard = 0, last = '';
  while (g.date <= END && guard++ < 20000) {
    if (g.date !== last && g.dayDone) {
      last = g.date;
      for (const p of Object.values(g.players)) {
        if (p.virtual || !cmInMemory(g, p)) continue;
        const cix = p.club ?? 0, was = prevClub.get(p.id);
        const place = p.reserves ? 2 : 1, apps = (p.stats?.apps ?? 0) + (p.stats?.subs ?? 0);
        const onLoan = !!p.loan && p.loan.from !== cix;
        const a = arr.get(p.id);
        if (a && a.stay) { if (cix === was && !onLoan) { a.placeEnd = place; a.appsMax = Math.max(a.appsMax, apps); } else a.stay = false; }
        if (was !== undefined && was !== cix && cix && !onLoan && !(a && a.stay) && prevL.get(p.id) !== cix) {
          const c = g.clubs[cix];
          arr.set(p.id, { date: g.date, buyer: c?.name ?? '', human: c?.name === CLUB, place0: place, placeEnd: place, apps0: apps, appsMax: apps, stay: true });
        }
        prevClub.set(p.id, cix); prevL.set(p.id, p.loan && p.loan.from !== cix ? p.loan.from : null);
      }
    }
    if (!g.userClub) {
      const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
      if (offer) applyAction({ t: 'acceptJob', club: offer });
      else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
  report('vores', arr);
}
