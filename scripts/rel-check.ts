// (forholdene, 12/11-2026) Spillets staff+0x65 (Player.cmRel – cmRelations.ts) mod originalens kampstart: RP-linjerne i et kampspor
// (~/cm0102-engine/oracle/runs/ls20.txt: "RP <side> <i> f1 f2 f3 d1 d2 d3" = yndlingspersoner +0x1c..+0x24 og uvenner +0x28..+0x30 som
// hukommelsens staff-id'er). Hukommelsens id'er kortlægges til spillets af kampspillerne selv (RS-linjerne: fødselsdag + de skjulte egenskaber),
// så en plads tæller som ens, når originalen og spillet har samme person på pladsen (eller begge er tomme); personer uden for kampene
// (managere, spillere i andre klubber) sammenlignes kun som "der er en/der er ingen".
//   WORLD=<world-fil> [ADVANCE=2001-08-17] npx tsx scripts/rel-check.ts [spor] [kampe = 20]
import { createReadStream, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { ATTRS } from '../src/game/attributes';
import type { Player } from '../src/game/types';

const file = process.argv[2] ?? `${process.env.HOME}/cm0102-engine/oracle/runs/ls20.txt`;
const N = Number(process.argv[3] ?? 20);
const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const t0 = Date.now();
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
console.log(`nyt spil: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (process.env.ADVANCE) { const until = process.env.ADVANCE.length === 10 ? process.env.ADVANCE : '2001-08-18'; while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); } }
const ps = Object.values(g.players).filter((p) => !p.regen);
const cnt = (at: number) => ps.filter((p) => p.cmRel && p.cmRel.slice(at, at + 3).some(Boolean)).length;
console.log(`${g.date}: spillere med yndlingsklub ${cnt(0)}, uvenklub ${cnt(3)}, yndlingsperson ${cnt(6)}, uven ${cnt(9)} af ${ps.length}; klubber med personer ${Object.values(g.clubs).filter((c) => c.cmPrefs).length}`);

const HID = ['adaptability', 'ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'];
interface R { m: number; id: number; dob: string; hid: number[]; rp?: number[] }
(async () => {
  const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  const rows: R[] = []; let m = -1; const cur = new Map<string, R>();
  for await (const l of rl) {
    if (l.startsWith('M ')) { m++; if (m >= N) break; cur.clear(); continue; }
    if (m < 0) continue;
    if (l.startsWith('RS ')) {
      const f = l.split(' '); const b = Buffer.from(f[4], 'hex');
      const dob = new Date(Date.UTC(b.readUInt16LE(0x12), 0, 1) + b.readUInt16LE(0x10) * 86400000).toISOString().slice(0, 10);
      const r: R = { m, id: +f[3], dob, hid: [...b.subarray(0x56, 0x5e)].map((x) => (x << 24) >> 24) };
      cur.set(`${f[1]},${f[2]}`, r); rows.push(r);
    } else if (l.startsWith('RP ')) { const f = l.split(' '); const r = cur.get(`${f[1]},${f[2]}`); if (r) r.rp = f.slice(3, 9).map(Number); }
  }
  // hukommelsens id → spillets spiller (fødselsdag + skjulte egenskaber)
  const byDob = new Map<string, Player[]>();
  for (const p of ps) (byDob.get(p.dob) ?? byDob.set(p.dob, []).get(p.dob)!).push(p);
  const mem = new Map<number, Player>();
  for (const r of rows) {
    const c = (byDob.get(r.dob) ?? []).filter((p) => HID.every((k, i) => Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10) === r.hid[i] || !r.hid[i]));
    if (c.length === 1) mem.set(r.id, c[0]);
  }
  let n = 0, slotEq = 0, presEq = 0, cntEq = 0, origMore = 0, gameMore = 0;
  const seen = new Set<number>();
  for (const r of rows) {
    if (!r.rp || seen.has(r.id) || (process.env.FIRST && r.m > 0)) continue;
    seen.add(r.id);
    const p = mem.get(r.id); if (!p) continue;
    n++;
    const ours = (p.cmRel ?? Array(12).fill(0)).slice(6, 12);
    let ok = true, pres = true;
    for (let k = 0; k < 6; k++) {
      const o = r.rp[k], q = ours[k];
      if (!!o !== !!q) { ok = false; pres = false; continue; }
      if (o && mem.has(o) && mem.get(o)!.id !== q) ok = false;
    }
    slotEq += +ok; presEq += +pres;
    const co = r.rp.filter(Boolean).length, cq = ours.filter(Boolean).length;
    cntEq += +(co === cq); origMore += +(co > cq); gameMore += +(cq > co);
    if (!pres && process.env.EX) {
      const nm = (id: number) => { const x = g.players[id]; if (x) return `${x.last}`; const s = Object.values(g.staff).find((y) => y.cmId === id); return s ? `${s.last}(stab)` : String(id); };
      console.log(`  ${p.first} ${p.last} (kamp ${r.m}): orig ${r.rp.map((x) => (x ? (mem.get(x)?.last ?? '#' + x) : '-')).join(' ')} | spil ${ours.map((x) => (x ? nm(x) : '-')).join(' ')}`);
    }
  }
  console.log(`${n} kampspillere kortlagt: pladserne ens ${slotEq}, besat/tom ens ${presEq}, antal ens ${cntEq} (originalen flere ${origMore}, spillet flere ${gameMore})`);
})();
