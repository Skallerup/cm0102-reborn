// Konditionsmodulet (game/cmFitness.ts) mod den instrumenterede original (match_trace.c: RECOMP_FIT_TRACE):
//   fu/fv – 0x62c680 (dagens opdatering: posten før og efter, med originalens rand-kald indeni)
//   fr    – 0x62c2f0 (trætheden falder)            fs – 0x62bd10 (efter kampen: kampkondition og træthed)
//   fc    – 0x62d140 (skadetypen af rand-kaldene)  fi – 0x62d250 (skadens længde – fysioterapeuten er ikke i sporet: kun formlens dele)
// Hvert kald køres i porten fra originalens tilstand og med originalens tal; tæller ens/forskellige.
//   npx tsx scripts/fit-trace-check.ts [spor]   (standard ~/cm0102-engine/oracle/runs/fit1.txt)
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { ATTRS } from '../src/game/attributes';
import { INJ_TYPES, clearKnocks, recordKnock, clubSeason, chooseInjuryType, recoverFatigue, setMatchCondition, updateFitness, type CmFit, type FitCtx } from '../src/game/cmFitness';
import type { GameState, Player } from '../src/game/types';

const file = process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/fit1.txt`;
const day0 = (d: number, y: number) => Math.round(Date.UTC(y, 0, 1) / 86400000) + d;
const parseDate = (s: string) => { const [d, y] = s.split(':').map(Number); return day0(d, y); };
const hex = (h: string) => Buffer.from(h, 'hex');
function recOf(h: string): CmFit {
  const b = hex(h);
  const d = b.readInt16LE(0), y = b.readUInt16LE(2), idx = b.readInt32LE(0xe);
  return { d: day0(d, y), f: b.readInt16LE(8), mc: b.readInt16LE(0xa), fat: b.readInt16LE(0xc), inj: idx === -1 ? null : { t: 0, d: 0, w28: 0, w2a: 0, w2c: 0, w2e: 0 },
    rt: b.readInt8(0x12), rl: b.readInt8(0x13), b1c: b[0x1c], lt: b.readInt8(0x1d), load: b.readInt8(0x1e) };
}
function injOf(h: string, rec: CmFit) {
  if (h === '-' || !rec.inj) { rec.inj = null; return; }
  const b = hex(h);
  rec.inj = { t: b[0], d: day0(b.readInt16LE(0x20), b.readUInt16LE(0x22)), w28: b.readInt16LE(0x28), w2a: b.readInt16LE(0x2a), w2c: b.readInt16LE(0x2c), w2e: b.readInt16LE(0x2e) };
}
/** en spiller med de felter, porten læser: alder (staff +0x18) på dagen, NF, Professionalism, WR/Stamina, GK, klubbens land */
function mkPlayer(id: number, today: number, age: number, a: Record<string, number>, gk: number, club: number): Player {
  const attrs = new Array(ATTRS.length).fill(10);
  for (const [k, v] of Object.entries(a)) attrs[ATTRS.indexOf(k as never)] = v;
  const t = new Date(today * 86400000);
  const dob = `${t.getUTCFullYear() - age}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
  return { id, dob, attrs, pos: [gk, 1, 1, 1, 1, 1, 1, 1], side: [1, 1, 1], club, regen: false } as unknown as Player;
}
const nationOf = new Map<number, number>();
const clubSeasonOf = (nat: number, today: number) => clubSeason(nat, today)[0];
const G = { clubs: new Proxy({}, { get: (_t, k) => ({ id: +String(k), nation: nationOf.get(+String(k)), rep: 50 }) }), staff: {}, players: {}, cmFitStart: '2001-07-14', date: '2001-07-14' } as unknown as GameState;
const ctx = (today: number, rands: number[], log?: number[]): FitCtx => {
  let i = 0;
  return { g: G, today, rand: (n: number) => { const v = rands[i++]; log?.push(n); return v ?? 0; }, squadOf: () => [], human: () => false };
};
const cnt: Record<string, [number, number]> = {};
const ok = (k: string, good: boolean) => { const c = (cnt[k] ??= [0, 0]); c[0]++; if (good) c[1]++; return good; };
const bad = new Map<string, string[]>();
const note = (k: string, s: string) => { const l = bad.get(k) ?? []; if (l.length < 6) l.push(s); bad.set(k, l); };

const byDate = new Map<string, number>();
let fnBuf: string[][] = [];
/** 0x62c080: kampens poster (fm) – hver følges af et 0x62bd10-kald (fs) med træthedens tillæg */
let staffCount = Infinity;
let fmQ: { comp: boolean; before: boolean; e: number[] }[] = [];
const stack: { t: string[]; rands: string[][] }[] = [];
const rl = createInterface({ input: createReadStream(file, 'latin1'), crlfDelay: Infinity });
for await (const line of rl) {
  const t = line.split(' ');
  switch (t[0]) {
    case 'fn': fnBuf.push(t); for (const s of stack) s.rands.push(t); continue;
    case 'fu': stack.push({ t, rands: [] }); fnBuf = []; continue;
    case 'fv': {
      const s = stack.pop(); if (!s) continue;
      const u = s.t;
      // fu <id> <dag:år> <post> <alder> <NF> <prof> <+0x24> <klub> <klub +0x1db> <land> | <skade>
      // klub-id + 1 (klub 0 findes i originalen; hos os betyder 0 klubløs)
      const id = +u[1], today = parseDate(u[2]), rec = recOf(u[3]), age = +u[4], nf = +u[5], pr = +u[6], intl = +u[7], club = +u[8] === 4294967295 ? 0 : +u[8] + 1, nat = +u[10];
      injOf(u[12], rec);
      nationOf.set(club, nat);
      const p = mkPlayer(id, today, age, { naturalFitness: nf, professionalism: pr }, 1, club);
      p.cmFit = rec;
      // porten trækker kun rand(2) (0x62cb1d); feriedagenes rand(Professionalism/3 + 2) (0x62ca54) løfter en byte, konditionen ikke læser
      const rands = s.rands.filter((r) => r[2] === '62cb1d').map((r) => +r[4]);
      updateFitness(ctx(today, rands), p);
      const want = recOf(t[t.length - 1]);
      const good = p.cmFit!.f === want.f && p.cmFit!.mc === want.mc;
      const off = !rec.inj && club && !clubSeasonOf(nat, today);
      const k = intl ? (off ? 'update (landshold +0x24, sommerpause)' : 'update (landshold +0x24)') : rec.inj ? 'update (skadet)' : 'update';
      if (!good && process.env.FIT_BYDATE) byDate.set(`${k} ${u[2]}`, (byDate.get(`${k} ${u[2]}`) ?? 0) + 1);
      if (!ok(k, good)) note(k, `${id} ${u[2]} F ${rec.f}→${want.f} (port ${p.cmFit!.f}) MC ${rec.mc}→${want.mc} (port ${p.cmFit!.mc}) fat ${rec.fat} load ${rec.load} NF ${nf} abcd ${t.slice(2, 6).join(',')} season ${t[6]} ${t[7]} ${t[8]} nat ${nat} r=${rands}`);
      fnBuf = [];
      continue;
    }
    case 'fr': {
      // fr <id> <før> <alder> <GK> <efter>
      const rands = fnBuf.filter((r) => ['62c360', '62c38e'].includes(r[2])).map((r) => +r[4]);
      const p = mkPlayer(+t[1], 0, +t[3], {}, +t[4], 0);
      p.cmFit = { d: 0, f: 10000, mc: 10000, fat: +t[2], inj: null, rt: -1, rl: 0, b1c: 0, lt: -1, load: 50 };
      recoverFatigue(ctx(0, rands), p);
      if (!ok('recover', p.cmFit.fat === +t[5])) note('recover', `${line} port ${p.cmFit.fat} r=${rands}`);
      fnBuf = [];
      continue;
    }
    case 'fm': {
      // fm <fixture> <+0x40> <+0x41> <+0x4c> <+0x4d> <i dag> <start> | side,k,staff,+0x30,+0x32,+0x34,+0x36,+0x1f,alder …
      const [head, rest] = line.split(' | ');
      const h = head.split(' ');
      const today = parseDate(h[6]), start = parseDate(h[7]), noStats = +h[4], len = +h[5];
      fmQ = (rest ?? '').trim().split(' ').filter(Boolean).map((x) => {
        const e = x.split(',').map(Number);
        const [, k, , b30, b32, b34] = e;
        const end = b34 > -1 ? b34 : b30 > -1 ? b30 : len;
        const mins = noStats ? (k < 11 ? 90 : b32 === -1 ? 0 : end - b32) : k < 11 ? end : b32 === -1 ? 0 : end - b32;
        return { comp: +h[2] !== 0, before: start > today, e: [...e, mins] };
      }).filter((q) => q.e[2] < staffCount);                                   // genererede spillere (id ≥ [0xae2364]) springes over

      fnBuf = [];
      continue;
    }
    case 'fs': {
      const q = fmQ.shift();
      if (q) {
        // porten (cmFitness.applyMatchEffects): (10000 − kondition)/100 + minutter, ½ i venskabskampe, ·1,25 over 33+rand(3) år, ·2 under 23−rand(5)
        const r3 = fnBuf.filter((r) => r[2] === '62c169').map((r) => +r[4]), r5 = fnBuf.filter((r) => r[2] === '62c198').map((r) => +r[4]);
        const [, , , , , , cond, , age, mins] = q.e;
        let ed = Math.trunc((10000 - ((cond << 16) >> 16)) / 100) + ((mins << 24) >> 24);
        if (!q.comp) ed = Math.trunc(((ed << 16) >> 16) / 2);
        else if (age > (r3[0] ?? 0) + 33) ed = Math.trunc(((ed << 16) >> 16) * 1.25);
        else if (age < 23 - (r5[0] ?? 0)) ed += ed;
        if (q.before) ed = 0;
        if (!ok('match delta', ((ed << 16) >> 16) === +t[3] && cond === +t[2])) note('match delta', `${line} | ${q.e} port ${ed}`);
      }

      // fs <id> <cond> <delta> <før> <WR> <stamina> <prof> <efter> <mc>
      const rands = fnBuf.filter((r) => r[2] === '62bde9').map((r) => +r[4]);
      const p = mkPlayer(+t[1], 0, 25, { workRate: +t[5], stamina: +t[6], professionalism: +t[7] }, 1, 0);
      p.cmFit = { d: 0, f: 10000, mc: 10000, fat: +t[4], inj: null, rt: -1, rl: 0, b1c: 0, lt: -1, load: 50 };
      setMatchCondition(ctx(0, rands), p, +t[2], +t[3]);
      if (!ok('setcond', p.cmFit.fat === +t[8] && p.cmFit.mc === +t[9])) note('setcond', `${line} port ${p.cmFit.fat}/${p.cmFit.mc} r=${rands}`);
      fnBuf = [];
      continue;
    }
    case 'fc': {
      // fc <cat> <sev> <id> = <type>: kun kaldene uden tilbagevendende skade i kategorien (posten er ikke i linjen) og uden nuværende skade
      const rands = fnBuf.filter((r) => ['62d20f', '62d22a'].includes(r[2]));
      if (rands.some((r) => r[2] === '62d20f')) { fnBuf = []; continue; }
      const p = mkPlayer(+t[3], 0, 25, {}, 1, 0);
      p.cmFit = { d: 0, f: 10000, mc: 10000, fat: 0, inj: null, rt: -1, rl: 0, b1c: 0, lt: -1, load: 50 };
      const got = chooseInjuryType(ctx(0, rands.map((r) => +r[4])), +t[1], +t[2], p);
      // spærret af en skade (0xff uden rand-kald) springes over
      if (+t[5] === -1 && !rands.length) { fnBuf = []; continue; }
      if (!ok('choose', got === +t[5])) note('choose', `${line} port ${got} r=${rands.map((r) => r[4])}`);
      fnBuf = [];
      continue;
    }
    case 'fk': {
      // fk <id> <kat> <sværhed> = <kat> <sværhed>: 0x62be00's fletning (listen tømmes af 0x62b7b0 – fd-linjen)
      const [c2, v2] = recordKnock(+t[1], +t[2], +t[3], () => false);
      if (!ok('knock', c2 === +t[5] && v2 === +t[6])) note('knock', `${line} port ${c2} ${v2}`);
      fnBuf = [];
      continue;
    }
    case 'fi': {
      // fi <id> <type> <backdate> <fixture> <allow> <news> <rec> <only> <days> | <skade> | <post>: længden af 0x62d250's tal – fysioterapeuten
      // læses af rand(fysio + 5) (0x62d64f), alderens/Injury Pronenesss tillæg af deres rand-kald (0x62d6c2/0x62d6e1)
      const [head, inj] = line.split(' | ');
      const h = head.split(' '), b = hex(inj.trim());
      const type = +h[2], T = INJ_TYPES[type];
      const rs = (ret: string) => fnBuf.filter((r) => r[2] === ret);
      const rp = rs('62d654')[0], r20 = rs('62d65d')[0], rsub = rs('62d66d')[0];
      if (rp && r20 && type !== 0x51 && b.readInt16LE(0x2c) === b.readInt16LE(0x28)) {
        const pb = +rp[1] - 5;
        let ebx = Math.trunc((T[3] * (35 - pb)) / 20);
        if (+rp[4] > +r20[4]) ebx -= rsub ? +rsub[4] : 0;
        for (const ret of ['62d6c2', '62d6e1']) for (const r of rs(ret)) ebx += +r[4];
        const days = T[2] + ebx;
        let w2a = Math.trunc(T[4] * 0.01 * days); if (w2a + 60 < days) w2a = days - 60;
        const good = b.readInt16LE(0x28) === days && b.readInt16LE(0x2a) === w2a && b.readInt16LE(0x2e) === w2a && b[0] === type;
        if (!ok('injury length', good)) note('injury length', `${head} → ${b.readInt16LE(0x28)}/${b.readInt16LE(0x2a)} port ${days}/${w2a} r=${fnBuf.map((r) => r[1] + ':' + r[2] + '=' + r[4])}`);
      }
      fnBuf = [];
      continue;
    }
    case 'fd': clearKnocks(); staffCount = +t[3]; fnBuf = []; continue;
    default: fnBuf = []; continue;
  }
}
if (process.env.FIT_BYDATE) console.log([...byDate].map(([k, v]) => `${k}=${v}`).join(' '));
for (const [k, [n, g]] of Object.entries(cnt)) console.log(`${k}: ${g}/${n} ens`);
for (const [k, l] of bad) { console.log(`-- ${k}`); for (const s of l) console.log('  ' + s); }
