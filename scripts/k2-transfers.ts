// K2 punkt 1 (docs/ORIGINAL_PARITY.md): transfers, lån og klubløse – samme opgørelse for oraklet og spillet, så de kan stilles side om side.
//   ORACLE=<pre-…bin> npx tsx scripts/k2-transfers.ts            oraklets afsluttede handler (TRANSFER_MANAGER +0x862, se ct-season-club.ts)
//   WORLD=<world-dbs2.json> npx tsx scripts/k2-transfers.ts [til-dato=2002-06-30]   spillet (England, Arsenal, frø 1, ægte tilstand – som oraklet)
// "Engelsk" = klubberne i de fire engelske ligaer (CM7–CM10 i world-filen, som LIGA=1 i ct-season-club.ts). Tal: køb (fra en engelsk/
// udenlandsk klub, med sum), klubløse der skriver under (antal, CA-fordeling, købere pr. division), lejeaftaler (antal, varighed), frigivne
// (kontrakten udløbet), klubløse i hukommelsen ved slutningen. Oraklet: databasestørrelse 2 – world-filen SKAL være bygget med CM_DBSIZE=2.
import { readFileSync } from 'node:fs';
import { loadSnap } from './ct-snap';
import { G } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';

interface Deal { date: string; art: 'buy' | 'free' | 'loan' | 'released' | 'back'; from: string; to: string; fee: number; ca: number; pid: number }
const W = process.env.WORLD ?? 'public/data/world-original.json';
const world = JSON.parse(readFileSync(W, 'utf8')) as WorldData;
const div = new Map<string, string>((world.clubs as unknown as [number, string, string, number, string][]).filter((c) => ['CM7', 'CM8', 'CM9', 'CM10'].includes(c[4])).map((c) => [c[1], c[4]]));
const DIVN: Record<string, string> = { CM7: 'PL', CM8: 'D1', CM9: 'D2', CM10: 'D3' };
const isEng = (n: string) => div.has(n);
const iso = (d: number, y: number) => new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10);

function report(label: string, deals: Deal[], freeEnd: { all: number; eng: number }, start: string) {
  deals = deals.filter((d) => d.date >= start);
  const out: string[] = [`== ${label} (${deals.length} handler med en engelsk ligaklub i én ende, siden ${start})`];
  const cnt = (f: (d: Deal) => boolean) => deals.filter(f).length;
  out.push(`køb med sum til ENG: ${cnt((d) => d.art === 'buy' && isEng(d.to) && d.fee > 0)} (fra ENG ${cnt((d) => d.art === 'buy' && isEng(d.to) && isEng(d.from) && d.fee > 0)}, fra udl. ${cnt((d) => d.art === 'buy' && isEng(d.to) && !isEng(d.from) && d.fee > 0)}), uden sum ${cnt((d) => d.art === 'buy' && isEng(d.to) && d.fee <= 0)}; salg til udl. ${cnt((d) => d.art === 'buy' && !isEng(d.to) && isEng(d.from))}`);
  const fees = deals.filter((d) => d.art === 'buy' && isEng(d.to) && d.fee > 0).map((d) => d.fee).sort((a, b) => a - b);
  out.push(`  sum £${(fees.reduce((a, b) => a + b, 0) / 1e6).toFixed(1)}M, median £${fees[fees.length >> 1] ?? 0}`);
  const fr = deals.filter((d) => d.art === 'free' && isEng(d.to));
  const cas = fr.map((d) => d.ca).sort((a, b) => a - b), q = (x: number) => cas[Math.min(cas.length - 1, Math.floor(x * cas.length))] ?? 0;
  const byDiv: Record<string, number> = {}; for (const d of fr) byDiv[DIVN[div.get(d.to)!]] = (byDiv[DIVN[div.get(d.to)!]] ?? 0) + 1;
  const bands: Record<string, number> = {}; for (const c of cas) { const b = c < 40 ? '<40' : c < 60 ? '40-59' : c < 80 ? '60-79' : c < 100 ? '80-99' : '100+'; bands[b] = (bands[b] ?? 0) + 1; }
  out.push(`klubløse skriver under hos ENG: ${fr.length}; CA 10/50/90 % ${q(0.1)}/${q(0.5)}/${q(0.9)}; ${JSON.stringify(bands)}; pr. division ${JSON.stringify(byDiv)}`);
  const byClub: Record<string, number> = {}; for (const d of fr) byClub[d.to] = (byClub[d.to] ?? 0) + 1;
  out.push(`  købere: ${Object.entries(byClub).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  const mon = (ds: Deal[]) => { const r: Record<string, number> = {}; for (const d of ds) r[d.date.slice(0, 7)] = (r[d.date.slice(0, 7)] ?? 0) + 1; return Object.entries(r).sort().map(([k, v]) => `${k.slice(2)} ${v}`).join(' · '); };
  out.push(`  pr. måned: ${mon(fr)}`);
  out.push(`  klubløse skriver under hos udl.: ${cnt((d) => d.art === 'free' && !isEng(d.to))}`);
  const ln = deals.filter((d) => d.art === 'loan' && (isEng(d.to) || isEng(d.from)));
  out.push(`leje: ${ln.length} (ENG→ENG ${ln.filter((d) => isEng(d.to) && isEng(d.from)).length}, ENG→udl. ${ln.filter((d) => !isEng(d.to)).length}, udl.→ENG ${ln.filter((d) => !isEng(d.from)).length}); lejer ud pr. måned: ${mon(ln)}`);
  // varighed: til lejen slutter (art 'back' for samme spiller), ellers åben
  const dur: number[] = []; let open = 0;
  for (const l of ln) {
    const b = deals.find((d) => d.art === 'back' && d.pid === l.pid && d.date >= l.date);
    if (b) dur.push(Math.round((Date.parse(b.date) - Date.parse(l.date)) / 864e5)); else open++;
  }
  dur.sort((a, b) => a - b);
  const dq = (x: number) => dur[Math.min(dur.length - 1, Math.floor(x * dur.length))] ?? 0;
  const db: Record<string, number> = {}; for (const x of dur) { const b = x <= 35 ? '≤1 md' : x <= 100 ? '1-3 md' : x <= 200 ? '3-6 md' : '>6 md'; db[b] = (db[b] ?? 0) + 1; }
  out.push(`  varighed (afsluttede ${dur.length}, dage 10/50/90 % ${dq(0.1)}/${dq(0.5)}/${dq(0.9)}) ${JSON.stringify(db)}, stadig udlejet ${open}; lejecas: ${ln.map((d) => d.ca).sort((a, b) => a - b)[ln.length >> 1] ?? 0} (median CA)`);
  out.push(`frigivne (kontrakten udløbet) fra ENG: ${cnt((d) => d.art === 'released' && isEng(d.from))}`);
  out.push(`klubløse i hukommelsen ved slutningen: ${freeEnd.all} (heraf engelske statsborgere ${freeEnd.eng})`);
  console.log(out.join('\n'));
}

if (process.env.ORACLE) {
  const m = loadSnap(process.env.ORACLE);
  const cb = m.u32(G.CLUBS), staff = m.u32(0xae23bc), nStaff = m.s32(0xae2364);
  const str = (a: number) => { let s = ''; if (!a) return s; for (let i = 0; i < 54; i++) { const ch = m.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s.trim(); };
  const nameOf = (id: number) => (id >= 0 ? str(cb + 0x245 * id + 4) : '');
  const tm = m.u32(0xde1f54), arr = m.u32(tm + 0x862), n = m.s32(tm + 0x86a);
  const deals: Deal[] = [];
  for (let i = 0; i < n; i++) {
    const r = arr + 37 * i, y = m.s16(r + 0x1f);
    if (y < 2001) continue;
    const a = m.u8(r + 0x1c), own = m.s32(r + 0x14), other = m.s32(r + 0x10);
    if (a === 5) continue;
    const from = nameOf(a === 4 ? other : own), to = nameOf(a === 4 ? own : other);
    if (!isEng(from) && !isEng(to)) continue;
    const st = staff + 0x6e * m.s32(r), pr = m.u32(st + 0x61);
    const art = a === 0 ? (own < 0 ? 'free' : 'buy') : a === 2 ? 'loan' : a === 3 ? 'released' : 'back';
    deals.push({ date: iso(m.s16(r + 0x1d), y), art, from, to, fee: m.s32(r + 0x18), ca: pr ? m.s16(pr + 5) : 0, pid: m.s32(r) });
  }
  let all = 0, eng = 0;
  for (let id = 0; id < nStaff; id++) { const st = staff + 0x6e * id; if (!m.u32(st + 0x61) || m.u32(st + 0x39)) continue; all++; if (str(m.u32(st + 0x1a) + 4) === 'England') eng++; }
  report(`oraklet ${process.env.ORACLE.split('/').slice(-1)[0]} (${iso(m.s16(0xae2c90), m.s16(0xae2c92))})`, deals, { all, eng }, '2001-07-14');
} else {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const until = process.argv[2] ?? '2002-06-30';
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const user = (world.clubs as unknown as [number, string][]).find((c) => c[1] === (process.env.CLUB ?? 'Arsenal'))![0];
  createGame(world, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs(), start = g.date;
  const cname = (id: number) => (id ? g.clubs[id]?.name ?? '' : '');
  const seen = new Map<number, number>(), loans = new Map<number, { from: number; to: number }>();
  const deals: Deal[] = [];
  const scan = () => {
    for (const p of Object.values(g.players)) {
      if (p.virtual) continue;
      const mv = p.moves ?? [], k = seen.get(p.id) ?? 0;
      for (let i = k; i < mv.length; i++) {
        const x = mv[i];
        if (!x.loan) deals.push({ date: x.date, art: !x.to ? 'released' : !x.from ? 'free' : 'buy', from: cname(x.from), to: cname(x.to), fee: x.fee, ca: p.ca, pid: p.id });
      }
      seen.set(p.id, mv.length);
      const l = loans.get(p.id);
      if (p.loan && (!l || l.from !== p.loan.from || l.to !== p.club)) {
        if (l) deals.push({ date: g.date, art: 'back', from: cname(l.to), to: cname(l.from), fee: 0, ca: p.ca, pid: p.id });
        loans.set(p.id, { from: p.loan.from, to: p.club });
        if (g.date > start) deals.push({ date: g.date, art: 'loan', from: cname(p.loan.from), to: cname(p.club), fee: 0, ca: p.ca, pid: p.id });
      } else if (!p.loan && l) { deals.push({ date: g.date, art: 'back', from: cname(l.to), to: cname(l.from), fee: 0, ca: p.ca, pid: p.id }); loans.delete(p.id); }
    }
  };
  scan();
  const marks = (process.env.MARKS ?? '2001-07-20,2002-02-01').split(',');
  const freeNow = () => { let all = 0, en = 0; for (const p of Object.values(g.players)) if (!p.virtual && !p.club) { all++; if (p.nation === eng) en++; } return { all, eng: en }; };
  console.log(`spillet: ${W}, start ${start}, klubløse ${JSON.stringify(freeNow())}`);
  while (g.date < until) {
    const r = continueGame();
    if (r?.match) quickPlayUserMatch();
    scan();
    if (marks.includes(g.date)) report(`spillet ${g.date}`, deals.filter((d) => isEng(d.from) || isEng(d.to)), freeNow(), start);
  }
  report(`spillet ${g.date}`, deals.filter((d) => isEng(d.from) || isEng(d.to)), freeNow(), start);
}
