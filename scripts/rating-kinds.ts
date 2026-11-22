// Karakterniveauet pr. kamptype mod oraklet (spillets snit [0xb74350]+0x10/+0x18 fuld, +0x20/+0x28 hurtig – 0x7c0d70).
// Oraklet: PlayerStats-posterne (obj+0x30 + 39·spiller-id: 6 dword-indeks pr. kategori 1..6 i obj+4, 32 bytes: +0 kampe, +0xe karaktersum)
// pr. kategori og om klubben ligger i et spillet land (England) eller ude (kun baggrundskampene −2: kategori 2/3).
// Vores: snittene, PlayerStats pr. kategori og klubomdømmet pr. skriver (reservedagen, −2-kampene, resten).
//   WORLD=<world-dbs2.json> [UNTIL=2001-10-15] [ONLY_ORACLE=1] npx tsx scripts/rating-kinds.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const UNTIL = process.env.UNTIL ?? '2001-10-15';
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dbl = (m: SparseMem, a: number) => { const x = Buffer.alloc(8); for (let i = 0; i < 8; i++) x[i] = m.u8(a + i); return x.readDoubleLE(0); };
type Acc = Map<string, [number, number, number[]]>;
const add = (a: Acc, k: string, r: number, n = 1) => { const e = a.get(k) ?? [0, 0, new Array(11).fill(0)]; a.set(k, e); e[0] += r; e[1] += n; if (n === 1) e[2][r]++; };
const show = (title: string, a: Acc) => {
  console.log(`\n## ${title}`);
  for (const [k, [s, n, h]] of [...a].sort()) console.log(`${k.padEnd(28)} ${(s / n).toFixed(3)}  n ${n}${h.some((x) => x) ? `  fordeling ${h.slice(1).map((x) => (x / n * 100).toFixed(1)).join(' ')}` : ''}`);
};

function oracle(m: SparseMem) {
  const PS = m.u32(0xb74350), S = m.u32(0xae23bc), n = m.s32(0xae2364);
  const full = [dbl(m, PS + 0x10), dbl(m, PS + 0x18)], quick = [dbl(m, PS + 0x20), dbl(m, PS + 0x28)];
  console.log(`oraklet ${m.s16(0xae2c90)}: fuld ${(full[0] / full[1]).toFixed(4)} (${full[1] - 100})  hurtig ${(quick[0] / quick[1]).toFixed(4)} (${quick[1] - 100})`);
  const a: Acc = new Map();
  const nP = m.s32(0xae236c), idx = m.u32(PS + 0x30), rec = m.u32(PS + 4);
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr) continue;
    const pid = m.s32(pr);
    if (pid < 0 || pid >= nP) continue;
    const club = m.u32(st + 0x39), nat = club ? str(m, m.u32(club + 0x53) + 4, 51) : '';
    const where = !club ? 'klubløs' : nat === 'England' ? 'England' : 'ude';
    for (let c = 1; c <= 5; c++) {
      const ix = m.s32(idx + 39 * pid + 4 * (c - 1));
      if (ix < 0) continue;
      const r = rec + 32 * ix, apps = m.u8(r), sum = m.u16(r + 0xe);
      if (apps) add(a, `${where} kat${c}`, sum, apps);
    }
  }
  show('oraklet: PlayerStats pr. kategori (karaktersum/kampe)', a);
}

const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const snap = ix.snaps.filter((e) => e.iso <= UNTIL).sort((x, y) => x.iso.localeCompare(y.iso)).pop()!;
oracle(loadDaySnap(ix, snap));

if (!process.env.ONLY_ORACLE) {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { applyAction } = await import('../src/game/actions');
  const { gs } = await import('../src/game/state');
  type W = Parameters<typeof createGame>[0];
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as W;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  let g = gs();
  const byCat: Acc = new Map();
  // klubomdømmet (g.cmClubRep) for de engelske ligaklubber pr. skriver – reservedagen (playReserveMatch), −2-kampene (playResMatch), resten
  const DIVS = ['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division'];
  const engLeague = new Set(Object.values(g.clubs).filter((c) => g.nations[c.nation]?.name === 'England' && DIVS.includes(g.comps[c.league ?? '']?.name ?? '')).map((c) => c.id));
  const repBy = new Map<string, number>();
  const install = () => {
    const reps = g.cmClubRep as (Record<number, number> & { __p?: boolean }) | undefined;
    if (!reps || reps.__p) return;
    g.cmClubRep = new Proxy(reps, {
      get: (t, k) => (k === '__p' ? true : (t as any)[k]),
      set: (t, k, v) => {
        const id = Number(k), old = (t as any)[k] ?? 0;
        if (engLeague.has(id) && v !== old) {
          const st = new Error().stack ?? '';
          const src = st.includes('playReserveMatch') ? 'reservekamp' : st.includes('playResMatch') ? '−2' : st.includes('cmApplyPost') ? 'kamp (anden)' : 'andet';
          repBy.set(src, (repBy.get(src) ?? 0) + v - old);
        }
        (t as any)[k] = v; return true;
      },
    });
  };
  const t0 = Date.now();
  let guard = 0;
  while ((g.date < UNTIL || !g.dayDone || g.pendingFixture) && guard++ < 50000) {
    if (!g.userClub) {
      const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
      if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    }
    g = gs(); install();
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
    g = gs();
  }
  const q = g.cmRatingAvgQ ?? [0, 1], fu = g.cmRatingAvg ?? [0, 1];
  console.log(`\nvores ${g.date} (${((Date.now() - t0) / 1000).toFixed(0)} s): fuld ${(fu[0] / fu[1]).toFixed(4)} (${fu[1] - 100})  hurtig ${(q[0] / q[1]).toFixed(4)} (${q[1] - 100})`);
  console.log(`\n## klubomdømme Δ pr. engelsk ligaklub (${engLeague.size}) efter skriver`);
  for (const [k, v] of repBy) console.log(`${k.padEnd(14)} ${(v / engLeague.size).toFixed(1)}`);
  // vores kategorier som oraklets tabel
  const eng3 = (c: number) => g.clubs[c]?.nation === eng;
  for (const p of Object.values(g.players)) {
    const st = p.cmStats; if (!st) continue;
    const where = !p.club ? 'klubløs' : eng3(p.club) ? 'England' : 'ude';
    for (let c = 1; c <= 5; c++) { const e = st[c]; if (e?.[0]) add(byCat, `${where} kat${c}`, e[14], e[0]); }
  }
  show('vores: cmStats pr. kategori', byCat);
  void byCat;
}
