// K7 budstrømmen trin for trin (sæson 1, jul–dec 2001), oraklet mod spillet: (a) ønskelisternes pladser/mål/budgetter ([[0xde1f54]+0x856] +0xdc,
// 9 bytes pr. klub; pladser 0x25 bytes: +0 rolle (0xb spiller), +7 budget, +0xf mål, +0x13 indehaver, +0x17 budmærke), (b) buddene i TRANSFER_MANAGER
// (nye pr. uge efter købergruppe og art), (c) buddenes sidste tilstand, (d) gennemførte handler (+0x862) – og om buddet blev til en handel.
// Købergrupper: P/1/2/3 (engelske ligaer), NL (anden engelsk), X (udland).
//   ONLY_ORACLE=1 OUT=<o.json> npx tsx scripts/k7-bidfunnel.ts                (oraklet: alle dagsbilleder FROM..TO i s1-3.9.60-e1)
//   WORLD=<world-dbs2.json> OUT=<u.json> npx tsx scripts/k7-bidfunnel.ts      (spillet: frø 1, Arsenal på ferie, samme datoer)
//   REPORT: npx tsx scripts/k7-bidfunnel.ts --report <o.json> <u.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';
import type { GameState } from '../src/game/types';

const FROM = process.env.FROM ?? '2001-07-14', TO = process.env.TO ?? '2001-12-31';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
interface Bid { key: string; buyer: string; bg: string; sg: string; loan: boolean; free: boolean; first: string; last: string; states: string[]; fee: number; pid: number; bix: number; done?: string; lastIx?: number }
interface Tr { date: string; pid: number; to: number; from: number; tg: string; fg: string; fee: number; art: number }
interface Plan { iso: string; g: Record<string, Record<string, number>> }
interface Out { bids: Bid[]; trs: Tr[]; plans: Plan[] }
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const wk = (iso: string) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
const add = (o: Record<string, number>, k: string, v = 1) => { o[k] = (o[k] ?? 0) + v; };

function oracle(): Out {
  const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
  const snaps = ix.snaps.filter((e) => e.iso >= FROM && e.iso <= TO);
  const bids = new Map<string, Bid>(), trs = new Map<string, Tr>(), plans: Plan[] = [];
  let lastPlan = '';
  for (let si = 0; si < snaps.length; si++) {
    const e = snaps[si], m = loadDaySnap(ix, e);
    const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(0xae23bc);
    const grp = (cix: number) => { if (cix < 0 || cix >= nc) return '-'; const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
    const clubOfStaff = (pl: number) => { const k = getContract(m, S + 0x6e * pl); return k ? m.s32(k + 4) : -1; };
    const tm = m.u32(0xde1f54), offers = m.u32(tm), nOff = m.s32(tm + 4);
    for (let i = 0; i < nOff; i++) {
      const o = m.u32(offers + 4 * i); if (!o) continue;
      const buyer = m.s32(o + 8), pl = m.s32(o + 0xc), iso = dayIso(m.s16(o + 0x12), m.s16(o + 0x14));
      if (!iso || iso < FROM) continue;
      // +0x11 = 0xb: et bud på en spiller; ellers en stabsansættelse (0x84a020 → 0x84b6f0, kompensation 0x8d0780) – spillets egne stabsskifter
      // (cmStaffMove.ts) går ikke gennem buddene, så de tælles kun med STAFFBIDS=1
      if (m.u8(o + 0x11) !== 0xb && !process.env.STAFFBIDS) continue;
      // (+0x12 er buddets forfaldsdato – 0x8c63a0 – ikke oprettelsen; nøglen er køber/spiller, et nyt bud efter et hul på > 1 billede)
      const k0 = `${buyer}/${pl}`;
      let b = bids.get(k0);
      if (b && b.lastIx < si - 1) { bids.set(`${k0}/${b.first}`, b); bids.delete(k0); b = undefined; }
      const key = k0;
      if (!b) { const sc = clubOfStaff(pl); b = { key, buyer: str(m, C + 0x245 * buyer + 4), bg: grp(buyer), sg: grp(sc), loan: !!m.u8(o + 0x1f), free: sc < 0, first: e.iso, last: e.iso, states: [], fee: m.s32(o + 0x1b), pid: pl, bix: buyer }; bids.set(key, b); }
      const st = m.u8(o + 0x2c).toString(16);
      if (b.states[b.states.length - 1] !== st) b.states.push(st);
      b.last = e.iso; b.lastIx = si; b.fee = m.s32(o + 0x1b);
    }
    const arr = m.u32(tm + 0x862), nT = m.s32(tm + 0x86a);
    for (let i = 0; i < nT; i++) {
      const r = arr + 37 * i, d = dayIso(m.s16(r + 0x1d), m.s16(r + 0x1f));
      if (!d || d < FROM) continue;
      const to = m.s32(r + 0x10), from = m.s32(r + 0x14), pid = m.s32(r), art = m.u8(r + 0x1c);
      const k = `${pid}|${d}|${to}|${art}`;
      if (!trs.has(k)) trs.set(k, { date: d, pid, to, from, tg: grp(to), fg: grp(from), fee: m.s32(r + 0x18), art });
    }
    if (wk(e.iso) !== lastPlan) {
      lastPlan = wk(e.iso);
      const slm = m.u32(tm + 0x856);
      const g: Plan['g'] = {};
      for (let cix = 0; cix < nc; cix++) {
        const gr = grp(cix), r = g[gr] ??= {};
        add(r, 'klubber');
        const ent = m.u32(slm + 0xdc) + 9 * cix, base = m.u32(ent);
        if (!base) continue;
        add(r, 'post'); add(r, `st${m.u8(ent + 4)}`);
        for (let i = 0; i < 40; i++) {
          const s = base + 0x25 * i, role = m.u8(s);
          if (role !== 0xb) continue;
          add(r, 'pladser');
          const b7 = m.s32(s + 7), t = m.s32(s + 0xf), h = m.s32(s + 0x13), bm = m.s32(s + 0x17);
          if (b7 > 0) { add(r, 'budget>0'); add(r, 'b7sum', b7); }
          if (h < 0) add(r, 'uden indehaver');
          if (t >= 0 && t !== h) { add(r, 'mål'); const tc = clubOfStaff(t); add(r, tc < 0 ? 'mål klubløs' : tc === cix ? 'mål egen' : 'mål ude'); if (bm >= 0) add(r, 'mål m. budmærke'); }
          else if (t >= 0) add(r, 'mål=indehaver');
        }
      }
      plans.push({ iso: e.iso, g });
    }
    (m as { release?: () => void }).release?.();
    process.stderr.write(`${e.iso} bud ${bids.size} handler ${trs.size}\n`);
  }
  return { bids: [...bids.values()], trs: [...trs.values()], plans };
}

async function ours(): Promise<Out> {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { applyAction } = await import('../src/game/actions');
  const { gs } = await import('../src/game/state');
  const { fromRow } = await import('../src/game/cmSquadPlanGame');
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  let g: GameState = gs();
  const grp = (cid: number) => { const c = g.clubs[cid]; if (!c) return '-'; if (c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
  const bids = new Map<number, Bid>(), trs = new Map<string, Tr>(), plans: Plan[] = [];
  let lastPlan = '', guard = 0;
  const code = (o: GameState['offers'][number]) => o.status === 'pending' ? '0' : o.status === 'countered' ? '1' : o.status === 'negotiating' ? (o.cmK ? '7' : '5') : o.status === 'accepted' ? (o.cmFut ? '13' : 'acc') : o.status;
  while (g.date < TO && guard++ < 40000) {
    if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
    g = gs();
    // dagsbilledet D (pre 0x4c7ac0) ~ vores dag D−1 færdigspillet: datoen her er "i morgen"
    const iso = g.date.slice(0, 10);
    if (iso < FROM) continue;
    for (const o of g.offers) {
      if (o.created.slice(0, 10) < FROM) continue;
      let b = bids.get(o.id);
      if (!b) { const p = g.players[o.player]; const sc = o.seller || p?.club || 0; b = { key: String(o.id), buyer: g.clubs[o.buyer]?.name ?? '', bg: grp(o.buyer), sg: sc ? grp(sc) : '-', loan: !!o.loan, free: !sc, first: iso, last: iso, states: [], fee: o.fee, pid: o.player, bix: o.buyer }; bids.set(o.id, b); }
      const st = code(o);
      if (b.states[b.states.length - 1] !== st) b.states.push(st);
      b.last = iso; b.fee = o.fee;
    }
    // de lukkede bud i TRANSFER_MANAGER's tabel (cmTmClose: tilstand 2/3/0xf/0x10/0x14) – også dem, der lukkes samme dag, som de afgives
    for (const k of g.cmTmKept ?? []) {
      if (k.created.slice(0, 10) < FROM) continue;
      let b = bids.get(k.id);
      if (!b) { b = { key: String(k.id), buyer: g.clubs[k.buyer]?.name ?? '', bg: grp(k.buyer), sg: k.seller ? grp(k.seller) : '-', loan: !!k.loan, free: !k.seller, first: iso, last: iso, states: [], fee: k.fee, pid: k.player, bix: k.buyer }; bids.set(k.id, b); }
      const st = k.st.toString(16);
      if (b.states[b.states.length - 1] !== st) b.states.push(st);
      b.last = iso;
    }
    for (const p of Object.values(g.players)) for (const mv of p.moves ?? []) {
      if (mv.date < FROM) continue;
      const k = `${p.id}|${mv.date}|${mv.to}`;
      if (!trs.has(k)) trs.set(k, { date: mv.date, pid: p.id, to: mv.to, from: mv.from, tg: grp(mv.to), fg: mv.from ? grp(mv.from) : '-', fee: mv.fee, art: mv.loan ? 2 : !mv.from ? 3 : mv.bosman ? 4 : 0 });
    }
    if (wk(iso) !== lastPlan) {
      lastPlan = wk(iso);
      const gp: Plan['g'] = {};
      for (const c of Object.values(g.clubs)) {
        const gr = grp(c.id), r = gp[gr] ??= {};
        add(r, 'klubber');
        const st = g.cmPlan?.[c.id];
        if (!st) continue;
        add(r, 'post'); add(r, `st${st.st}`);
        for (const s of st.s.map(fromRow)) {
          if (s.role !== 0xb) continue;
          add(r, 'pladser');
          if ((s.b7 ?? 0) > 0) { add(r, 'budget>0'); add(r, 'b7sum', s.b7 ?? 0); }
          if (s.s13 < 0) add(r, 'uden indehaver');
          if (s.f >= 0 && s.f !== s.s13) { add(r, 'mål'); const tc = g.players[s.f]?.club ?? 0; add(r, !tc ? 'mål klubløs' : tc === c.id ? 'mål egen' : 'mål ude'); if (s.s17 >= 0) add(r, 'mål m. budmærke'); }
          else if (s.f >= 0) add(r, 'mål=indehaver');
        }
      }
      plans.push({ iso, g: gp });
      process.stderr.write(`${iso} bud ${bids.size} handler ${trs.size}\n`);
    }
  }
  const { CM_AIAI } = await import('../src/game/transfers');
  console.log('CM_AIAI', JSON.stringify(CM_AIAI));
  return { bids: [...bids.values()], trs: [...trs.values()], plans };
}

function report(o: Out, u: Out): void {
  // gennemført: en handel til køberen med spilleren på/efter buddets dato (inden for 200 dage)
  for (const x of [o, u]) {
    const by = new Map<string, Tr[]>();
    for (const t of x.trs) (by.get(`${t.pid}|${t.to}`) ?? by.set(`${t.pid}|${t.to}`, []).get(`${t.pid}|${t.to}`)!).push(t);
    for (const b of x.bids) { const t = (by.get(`${b.pid}|${b.bix}`) ?? []).find((t) => t.date >= b.first.slice(0, 10)); if (t) b.done = t.date; }
  }
  const kind = (b: Bid) => (b.loan ? 'leje' : b.free ? 'fri' : 'køb');
  const L: string[] = [];
  const tab = (title: string, f: (x: Out) => Record<string, Record<string, number>>, cols: string[]) => {
    const A = f(o), B = f(u);
    const rows = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
    L.push(`\n### ${title}\n`, `| | ${cols.map((c) => `${c} O / V`).join(' | ')} |`, `|---|${cols.map(() => '---').join('|')}|`);
    for (const r of rows) L.push(`| ${r} | ${cols.map((c) => `${A[r]?.[c] ?? 0} / ${B[r]?.[c] ?? 0}`).join(' | ')} |`);
  };
  const month = (iso: string) => iso.slice(0, 7);
  // 1. nye bud pr. måned og art, købergruppe
  tab('nye bud pr. måned (alle købere): art', (x) => { const r: Record<string, Record<string, number>> = {}; for (const b of x.bids) add(r[month(b.first)] ??= {}, kind(b)); return r; }, ['køb', 'leje', 'fri']);
  tab('nye købsbud (spiller med klub, ikke leje) efter købergruppe – hele perioden', (x) => { const r: Record<string, Record<string, number>> = {}; for (const b of x.bids) if (kind(b) === 'køb') { const q = r[b.bg] ??= {}; add(q, 'bud'); if (b.done) add(q, 'gennemført'); if (b.sg === 'X') add(q, 'sælger udland'); } return r; }, ['bud', 'gennemført', 'sælger udland']);
  tab('nye købsbud pr. måned: engelsk køber (P-3+NL) / udenlandsk køber af engelsk spiller', (x) => { const r: Record<string, Record<string, number>> = {}; for (const b of x.bids) if (kind(b) === 'køb') { const q = r[month(b.first)] ??= {}; if (b.bg !== 'X') { add(q, 'eng bud'); if (b.done) add(q, 'eng gennemf.'); } else if (b.sg !== 'X') { add(q, 'udl→eng bud'); if (b.done) add(q, 'udl→eng gennemf.'); } } return r; }, ['eng bud', 'eng gennemf.', 'udl→eng bud', 'udl→eng gennemf.']);
  tab('købsbud (eng. køber eller sælger): sidste tilstand for ikke-gennemførte', (x) => { const r: Record<string, Record<string, number>> = {}; for (const b of x.bids) if (kind(b) === 'køb' && (b.bg !== 'X' || b.sg !== 'X')) { const q = r[b.done ? 'gennemført' : `sidst ${b.states[b.states.length - 1]}`] ??= {}; add(q, 'n'); } return r; }, ['n']);
  tab('købsbud (eng.): tilstandsforløb (top)', (x) => { const r: Record<string, Record<string, number>> = {}; for (const b of x.bids) if (kind(b) === 'køb' && (b.bg !== 'X' || b.sg !== 'X')) add(r[`${b.states.join('>')}${b.done ? ' ✓' : ''}`] ??= {}, 'n'); return Object.fromEntries(Object.entries(r).sort((a, b) => b[1].n - a[1].n).slice(0, 25)); }, ['n']);
  // 2. handler (købs-art 0 med sum) pr. måned: engelsk køber / engelsk sælger
  tab('gennemførte køb med sum (art 0, sum > 0) pr. måned', (x) => { const r: Record<string, Record<string, number>> = {}; for (const t of x.trs) if (t.art === 0 && t.fee > 0 && t.from >= 0 && (t.tg !== 'X' || t.fg !== 'X')) { const q = r[month(t.date)] ??= {}; add(q, t.tg !== 'X' ? 'til eng' : 'til udl'); } return r; }, ['til eng', 'til udl']);
  tab('gennemførte køb med sum efter købergruppe', (x) => { const r: Record<string, Record<string, number>> = {}; for (const t of x.trs) if (t.art === 0 && t.fee > 0 && t.from >= 0 && (t.tg !== 'X' || t.fg !== 'X')) add(r[t.tg] ??= {}, `fra ${t.fg === 'X' ? 'udl' : 'eng'}`); return r; }, ['fra eng', 'fra udl']);
  tab('lejeaftaler (art 2) efter lejeklubgruppe', (x) => { const r: Record<string, Record<string, number>> = {}; for (const t of x.trs) if (t.art === 2 && (t.tg !== 'X' || t.fg !== 'X')) add(r[t.tg] ??= {}, 'n'); return r; }, ['n']);
  // 3. ønskelisterne pr. uge (summeret over engelske ligaklubber P–3)
  const cols = ['post', 'pladser', 'budget>0', 'mål', 'mål ude', 'mål klubløs', 'mål egen', 'mål m. budmærke', 'uden indehaver'];
  for (const gr of ['P', '1', '2', '3', 'NL', 'X']) {
    tab(`ønskelisterne, gruppe ${gr} (pr. uge)`, (x) => Object.fromEntries(x.plans.map((p) => [wk(p.iso), { ...p.g[gr], b7k: Math.round((p.g[gr]?.b7sum ?? 0) / 1000) }])), [...cols, 'b7k']);
  }
  console.log(L.join('\n'));
}

if (process.argv[2] === '--report') report(JSON.parse(readFileSync(process.argv[3], 'utf8')), JSON.parse(readFileSync(process.argv[4], 'utf8')));
else {
  const out = process.env.ONLY_ORACLE ? oracle() : await ours();
  writeFileSync(process.env.OUT!, JSON.stringify(out));
  console.log(`bud ${out.bids.length}, handler ${out.trs.length}, uger ${out.plans.length}`);
}
