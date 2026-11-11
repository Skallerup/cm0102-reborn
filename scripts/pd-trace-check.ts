// Originalens spillerdata (game/cmPlayerData.ts) mod den instrumenterede original (match_trace.c: RECOMP_PICK_TRACE + RECOMP_PD_TRACE=1):
//   PW/PS – PlayerStats::add_match 0x7c0d70 (posterne pr. kategori og formens nibbles efter kampen, spillets karaktersnit)
//   PF/PX/PR – kontraktens opdatering 0x4ca6d0 (+0x3d/+0x3e/+0x3f/+0x44 før og efter, rand-kaldene indeni)
//   h 4/h 5 – udvælgelsens opslag 0x7c1950/0x7c1e30 ved pick_team
// Kontrollerer (1) opdateringen af posterne (recordPlayerMatch fra den forrige tilstand → den næste), (2) snittene 0x7c2150 (statValue af
// posten ved opslaget) og formen, (3) karaktersnittet, (4) +0x3d/+0x3e/+0x3f/+0x44 efter kampen med originalens tal (contractAfterMatch).
//   npx tsx scripts/pd-trace-check.ts [spor]   (standard ~/cm0102-engine/oracle/runs/pd1-pick.txt)
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { ST, cmFormRatings, contractAfterMatch, contractNotPlayed, recordPlayerMatch, statValue } from '../src/game/cmPlayerData';
import { recentForm } from '../src/game/engine/grid/roleScore';
import type { GameState, Player } from '../src/game/types';
import { ATTRS } from '../src/game/attributes';

const file = process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/pd1-pick.txt`;
type Rec = number[];
interface St { cats: Record<number, Rec>; form: number }
const state = new Map<number, St>();
const parseCats = (parts: string[]): Record<number, Rec> => {
  const out: Record<number, Rec> = {};
  for (const x of parts) { const [c, v] = x.split(':'); if (v !== undefined) out[+c] = v.split(',').map(Number); }
  return out;
};
const formOf = (hex: string) => { const b = hex.match(/../g)!.map((x) => parseInt(x, 16)); return (b[0] | (b[1] << 8) | (b[2] << 16)) >>> 0; };
const fakeG = { cmRatingAvg: [0, 0] } as unknown as GameState;
const cnt = { upd: 0, updOk: 0, updSkip: 0, form: 0, formOk: 0, h5: 0, h5ok: 0, h4: 0, h4ok: 0, avg: 0, avgOk: 0, c: 0, cOk: 0, np: 0, npOk: 0, skipFlags: 0, noPw: 0, cats: {} as Record<number, number> };
const badBy = new Map<string, string[]>();
const bad = { get length() { return 0; }, push(x: string) { const k = x[0]; const l = badBy.get(k) ?? []; if (l.length < 8) l.push(x); badBy.set(k, l); return 0; } };
const CMP = [ST.apps, ST.subApps, ST.goals, ST.gf, ST.ga, ST.won, ST.lost, ST.rating, ST.minutes];

let pending: string[][] = [];         // h-linjerne før G
let pwRun: string[][] = [];
/** den seneste færdige PW-gruppe (afsluttet af PS), hvis PS var den forrige linje: baggrundskampene 0x84be20 logger PW+PS lige før PF */
type Blk = { tag: string; pw: string[][]; px0: string[][]; px1: string[][]; pr: string[][]; pf: string[] | null; awaiting: boolean; closed: boolean };
const groups = new Map<string, string[][]>(), blocks = new Map<string, Blk>();
let cur: Blk | null = null;
const tryFlush = (tag: string) => {
  const b = blocks.get(tag), gr = groups.get(tag);
  if (!b || !b.closed || !gr) return;
  b.pw = gr; flushContract(b); blocks.delete(tag); groups.delete(tag);
};
let prevKind = '';
const flushContract = (b: { pw: string[][]; px0: string[][]; px1: string[][]; pr: string[][]; pf?: string[] | null }) => {
  if (b.pf && (b.pf[2] === '0' || b.pf[3] === '0')) { cnt.skipFlags++; return; }   // 0x4ca6d7: fixture+0x40/+0x41 = 0 → intet
  // spillerne i kampen pr. side (PW) og deres poster før (PX 0) → efter (PX 1)
  const before = new Map(b.px0.map((t) => [`${t[2]}|${t[3]}`, t])), after = new Map(b.px1.map((t) => [`${t[2]}|${t[3]}`, t]));
  const rands = b.pr.slice();
  const take = (ret: string) => { const i = rands.findIndex((r) => r[2] === ret); return i < 0 ? null : +rands.splice(i, 1)[0][4]; };
  const played = new Set<string>();
  // originalens rækkefølge: side 0 så 1, k 0..19
  for (const t of b.pw) {
    const side = t[4], staff = t[7], k = +t[8], b30 = +t[10], b32 = +t[11], gf = +t[5], ga = +t[6];
    const key = `${side}|${staff}`;
    played.add(key);
    const x0 = before.get(key), x1 = after.get(key);
    // rand(21 − Ambition) trækkes for alle i en sejr/et nederlag – også uden kontrakt (0x4cac89)
    if (!x0 || !x1) { if (gf !== ga) take('4cac8e') ?? take('4cacd9'); continue; }
    const starter = k <= 10;
    const mins = starter ? (b30 >= 0 ? b30 : 90) : b32 >= 0 ? Math.max(0, 90 - b32) : 0;
    const p = { id: +staff, dob: '1975-01-01', attrs: [], caps: 0, cmContract: { b3d: +x0[4], b3e: +x0[5], b3f: +x0[6], b44: +x0[7], b45: +x0[8] } } as unknown as Player;
    const seq: number[] = [];
    let used = 0;
    const r = (n: number) => { const ret = n === 30 ? (used++ === 0 ? '4cab49' : '4cab77') : gf > ga ? '4cac8e' : '4cacd9'; const v = take(ret); seq.push(v ?? -1); return v ?? 0; };
    // Ambition (+0x57) fra PX-linjen
    const amb = +x0[10];
    const attrs = new Array(ATTRS.length).fill(10); attrs[ATTRS.indexOf('ambition' as never)] = amb;
    (p as unknown as { attrs: number[] }).attrs = attrs;
    contractAfterMatch({ ...fakeG, date: '2001-08-01', seed: 1 } as GameState, p, { starter, minutes: mins, injured: false, condition: 100, won: gf > ga, lost: gf < ga,
      clubRep: 5000, nationRep: 0, seed: 0, rand: r });
    const c = p.cmContract!;
    cnt.c++;
    const ok3 = c.b3d === +x1[4] && c.b3e === +x1[5] && c.b3f === +x1[6];
    if (ok3) cnt.cOk++; else if (bad.length < 40) bad.push(`C ${staff} k${k} m${mins} ${x0.slice(4, 8).join('/')} → ${x1.slice(4, 8).join('/')} vs ${c.b3d}/${c.b3e}/${c.b3f}/${c.b44} r=${seq}`);
  }
  for (const [key, x0] of before) {
    if (played.has(key)) continue;
    const x1 = after.get(key); if (!x1) continue;
    const p = { id: 0, dob: '1975-01-01', attrs: [], caps: 0, cmContract: { b3d: +x0[4], b3e: +x0[5], b3f: +x0[6], b44: +x0[7], b45: +x0[8] } } as unknown as Player;
    contractNotPlayed({ ...fakeG, date: '2001-08-01' } as GameState, p, 5000, 0);
    const c = p.cmContract!;
    const changed = x0[4] !== x1[4] || x0[5] !== x1[5] || x0[6] !== x1[6];
    if (!changed) continue;                                                   // skadet/udelukket/ikke med – originalen springer over
    cnt.np++;
    if (c.b3d === +x1[4] && c.b3e === +x1[5] && c.b3f === +x1[6]) cnt.npOk++;
    else if (bad.length < 60) bad.push(`N ${key} ${x0.slice(4, 8).join('/')} → ${x1.slice(4, 8).join('/')} vs ${c.b3d}/${c.b3e}/${c.b3f}`);
  }
};

const rl = createInterface({ input: createReadStream(file, 'latin1'), crlfDelay: Infinity });
let avg = [680, 100];
let avgPending: number[] = [];
for await (const line of rl) {
  const t = line.split(' ');
  const kind = prevKind; prevKind = t[0] === 'h' ? prevKind : t[0];
  void kind;
  switch (t[0]) {
    case 'PW': {
      const bar = line.split(' | ');
      const head = bar[0].split(' '), form = formOf(bar[1].trim()), cats = parseCats((bar[2] ?? '').trim().split(' ').filter(Boolean));
      const staff = +head[7], cat = +head[3], k = +head[8];
      const b21 = +head[9], b30 = +head[10], b32 = +head[11], b34 = +head[12], b35 = +head[13];
      const gf = +head[5], ga = +head[6];
      cnt.cats[cat] = (cnt.cats[cat] ?? 0) + 1;
      const prev = state.get(staff);
      // (1) opdateringen: forrige tilstand + kampen = den nye
      const anyCat = Object.keys(cats).length > 0;
      if (prev && anyCat && cat > 0) {
        const p = { id: staff, cmStats: JSON.parse(JSON.stringify(prev.cats)), cmForm: prev.form } as unknown as Player;
        const starter = k <= 10;
        const end = b34 >= 0 ? b34 : b30 >= 0 ? b30 : 90;
        const minutes = starter ? end : end - b32;
        recordPlayerMatch(fakeG, p, cat, { rating: b35, goals: b21, minutes, sub: !starter }, gf, ga, false);
        let ok = true, reset = false;
        for (const c of [cat, 6]) {
          if (c === 6 && (cat === 1 || cat === 5)) continue;
          const want = cats[c], got = p.cmStats?.[c];
          if (!want || !got) { reset = true; continue; }
          if (want[ST.apps] < (prev.cats[c]?.[ST.apps] ?? 0) + 1) reset = true;    // arkiveret undervejs (klubskifte/sæsonslut)
          for (const f of CMP) if (f !== ST.minutes && want[f] !== got[f]) ok = false;
        }
        if (reset) cnt.updSkip++;
        else { cnt.upd++; if (ok) cnt.updOk++; else if (bad.length < 20) bad.push(`U ${staff} cat${cat} ${JSON.stringify(prev.cats[cat])} → ${JSON.stringify(cats[cat])} vs ${JSON.stringify(p.cmStats?.[cat])}`); }
        if (prev.form !== 0xffffff) cnt.form++; if (prev.form === 0xffffff) {} else if ((p.cmForm ?? 0) === form) cnt.formOk++; else if (bad.length < 30) bad.push(`F ${staff} ${prev.form.toString(16)} +${b35} → ${form.toString(16)} vs ${(p.cmForm ?? 0).toString(16)}`);
      }
      state.set(staff, { cats, form });
      // spillets karaktersnit: genererede spillere (ingen poster, form ffffff) tæller ikke
      if (anyCat || form !== 0xffffff) avgPending.push(b35);
      pwRun.push(t);
      break;
    }
    case 'PS': {
      cnt.avg++;
      if (t[4] === '0') for (const r of avgPending) { avg[0] += r; avg[1]++; }
      avgPending = [];
      if (Math.abs(+t[1] - avg[0]) < 1e-6 && Math.abs(+t[2] - avg[1]) < 1e-6) cnt.avgOk++;
      else { if (bad.length < 70) bad.push(`S ${t[1]}/${t[2]} vs ${avg[0]}/${avg[1]}`); avg = [+t[1], +t[2]]; }
      // kampnummeret (pd_match) binder PW-gruppen (afsluttet af PS) til kontraktblokken (PF … PX 1) for samme kamp
      groups.set(t[3], pwRun); pwRun = [];
      if (cur) { cur.closed = true; tryFlush(cur.tag); cur = null; }
      tryFlush(t[3]);
      break;
    }
    case 'PF':
      if (cur) { cur.closed = true; tryFlush(cur.tag); }
      cur = { tag: t[4], pw: [], px0: [], px1: [], pr: [], pf: t, awaiting: false, closed: false };
      blocks.set(cur.tag, cur);
      break;
    case 'PX': if (cur) (t[1] === '0' ? cur.px0 : cur.px1).push(t); break;
    case 'PR': if (cur) cur.pr.push(t); break;
    case 'h': pending.push(t); break;
    case 'g': case 'S': pending = []; break;
    case 'G': {
      const staff = +t[2];
      const st = state.get(staff);
      for (const h of pending) {
        if (h[1] === '5') {
          const cat = +h[3], kind = +h[4], def = +h[5], v = +h[7];
          const ours = statValue(st?.cats[cat], kind, def);
          cnt.h5++; if (Math.abs(ours - v) < 1e-5) cnt.h5ok++; else if (bad.length < 80) bad.push(`A ${staff} ${cat}/${kind} def ${def} = ${v} vs ${ours} ${JSON.stringify(st?.cats[cat])}`);
        } else if (h[1] === '4') {
          const ours = recentForm(cmFormRatings({ cmForm: st?.form ?? 0 } as Player));
          cnt.h4++; if (ours === +h[3]) cnt.h4ok++; else if (bad.length < 90) bad.push(`f ${staff} ${h[3]} vs ${ours} (${(st?.form ?? 0).toString(16)})`);
        }
      }
      pending = [];
      break;
    }
  }
}
console.log(`kategorier i kampene: ${JSON.stringify(cnt.cats)}`);
console.log(`posterne (0x7c0d70): ${cnt.updOk}/${cnt.upd} ens (${cnt.updSkip} arkiveret undervejs); formen: ${cnt.formOk}/${cnt.form}`);
console.log(`opslag 0x7c1e30 (h 5): ${cnt.h5ok}/${cnt.h5}; formen 0x7c1950 (h 4): ${cnt.h4ok}/${cnt.h4}; karaktersnittet: ${cnt.avgOk}/${cnt.avg}`);
console.log(`kampe uden flag: ${cnt.skipFlags}, blokke uden PW: ${blocks.size}`);
console.log(`kontrakten (0x4ca6d0) +0x3d/+0x3e/+0x3f: spillede ${cnt.cOk}/${cnt.c}, ikke spillede ${cnt.npOk}/${cnt.np}`);
for (const [k, l] of badBy) { console.log(`-- ${k}`); for (const b of l) console.log('  ' + b); }
