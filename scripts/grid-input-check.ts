// Inddatakontrollen (runde 8): kampstartens tilstand bygget af SPILLETS data (gameInputs.ts, original database, ægte tilstand) mod originalens
// kampstart i et kampspor (~/cm0102-engine/oracle/runs/ls20.txt: MV-linjerne = sub_6ec010's indgange ved kampstart, R/RS = spiller- og
// staffposterne, CL = klubposterne, CP = anføreren). For hver kampspiller i sporet findes den samme spiller i spillet (klubben på navnet,
// spilleren på CA og databasens rå egenskaber), og spillets værdier sammenlignes felt for felt. Til sidst regnes kampværdierne sub_6ec010 med
// originalens spillerblok (moral, motivation, form …) og SPILLETS omgivelser/poster – forskellen i kamp-CA og kampfloats viser, hvad
// afvigelserne betyder (pr. feltgruppe: kun den gruppe fra spillet, resten fra sporet).
//   npx tsx scripts/grid-input-check.ts [spor = ~/cm0102-engine/oracle/runs/ls20.txt] [kampe = 20]
//   ADVANCE=1: spillet køres frem til sporets dato (ellers spilstartens tilstand, 2001-07-?)
import { createReadStream, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { ATTRS } from '../src/game/attributes';
import { gameInputsCtx, recordBytes, staffBytes } from '../src/game/engine/grid/gameInputs';
import { matchValues6ec010, MV_FLOATS, type MatchValuesEnv } from '../src/game/engine/grid/matchValues';
import { caseInput, parseMv, type MvCase } from './mv-check';
import type { Player } from '../src/game/types';

const file = process.argv[2] ?? `${process.env.HOME}/cm0102-engine/oracle/runs/ls20.txt`;
const N = Number(process.argv[3] ?? 20);
const hex = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));
const s8 = (x: number) => (x << 24) >> 24;

interface TMatch { M: number[]; CL: Uint8Array[]; DT?: [number, number]; CAP: number[]; R: { side: number; idx: number; slot: number; staff: number; rec: Uint8Array; sr?: Uint8Array }[]; mv: MvCase[] }

async function readTrace(): Promise<TMatch[]> {
  const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  const out: TMatch[] = [];
  let cur: TMatch | null = null;
  const pre: string[] = [], preKeys = new Set<string>();
  for await (const l of rl) {
    const c0 = l.charCodeAt(0);
    if (c0 !== 77 && c0 !== 67 && c0 !== 82 && c0 !== 68) continue;                       // M C R D
    if (l.startsWith('M ')) {
      if (out.length >= N) break;
      cur = { M: l.split(' ').slice(1).map(Number), CL: [], CAP: [], R: [], mv: parseMv(pre.join('\n')) };
      out.push(cur); pre.length = 0; preKeys.clear(); continue;
    }
    if (l.startsWith('MV ') || l.startsWith('MVr ') || l.startsWith('MVO ')) {
      const f = l.split(' ', 5);
      if (f[0] === 'MV') { const key = `${f[2]},${f[4]}`; if (f[1] !== '-1' || preKeys.has(key)) { pre.length = 0; preKeys.clear(); } if (f[1] === '-1') preKeys.add(key); }
      if (f[1] === '-1') pre.push(l);
      continue;
    }
    if (!cur) continue;
    if (l.startsWith('CL ')) { const f = l.split(' '); cur.CL[+f[1]] = hex(f[2]); continue; }
    if (l.startsWith('DT ')) { const f = l.split(' '); cur.DT = [+f[1], +f[2]]; continue; }
    if (l.startsWith('CP ') && l.split(' ').length === 3) { const f = l.split(' ').map(Number); cur.CAP[f[1]] = f[2]; continue; }
    if (l.startsWith('R ')) { const f = l.split(' '); const side = +f[1]; cur.R.push({ side, idx: cur.R.filter((x) => x.side === side).length, slot: +f[2], staff: +f[3], rec: hex(f[4]) }); continue; }
    if (l.startsWith('RS ')) { const f = l.split(' '); const r = cur.R.find((x) => x.side === +f[1] && x.idx === +f[2]); if (r) r.sr = hex(f[4]); continue; }
  }
  return out;
}

const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;   // WORLD=<fil>: en anden world-fil
const eng = world.nations.findIndex((x) => x.name === 'England');
// samme opsætning som grid-stats.ts (frø 3); brugerens klub er en klub uden for Premier League, så alle PL-hold er computerens
const userClub = world.clubs.find((c) => c[1] === 'Wrexham')?.[0] ?? world.clubs.find((c) => c[3] === eng && c[4] !== 'CM7')![0];
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: userClub, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
if (process.env.ADVANCE) {
  // spillet køres frem til dagen før sporets første kampdag (Premier Leagues første runde 2001-08-18) – kontrakter, omdømme, kondition som i et spil
  const until = process.env.ADVANCE.length === 10 ? process.env.ADVANCE : '2001-08-18';
  while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
}
console.log(`spillet: ${g.date}, spor: ${file}`);

// rå (ikke-interne) egenskaber i spillerposten – til at finde spilleren
const RAW_OFFS = [0x1b, 0x1c, 0x1d, 0x1f, 0x20, 0x21, 0x22, 0x25, 0x28, 0x29, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x34, 0x36, 0x3b, 0x3c, 0x3d, 0x3f, 0x40, 0x42, 0x44];
const clubName = (b: Uint8Array) => Buffer.from(b.slice(4, 4 + 51)).toString('latin1').split('\0')[0];
const clubOf = (b: Uint8Array) => { const n = clubName(b); return Object.values(g.clubs).find((c) => c.name === n)?.id; };

const tally = new Map<string, { n: number; bad: number; ex: string[] }>();
const note = (k: string, ok: boolean, ex?: string) => { const t = tally.get(k) ?? { n: 0, bad: 0, ex: [] }; t.n++; if (!ok) { t.bad++; if (ex && t.ex.length < (Number(process.env.EX) || 4)) t.ex.push(ex); } tally.set(k, t); };   // EX=<n>: flere eksempler
const caDiff: Record<string, number[]> = {};
const fDiff: Record<string, number[]> = {};
const recDiff: Record<string, number[]> = {};

(async () => {
  const ms = await readTrace();
  let found = 0, missing = 0;
  for (const [k, tm] of ms.entries()) {
    const clubs = [clubOf(tm.CL[0]), clubOf(tm.CL[1])];
    if (clubs[0] === undefined || clubs[1] === undefined) { console.log(`kamp ${k}: klubberne findes ikke (${clubName(tm.CL[0])}, ${clubName(tm.CL[1])})`); continue; }
    const date = tm.DT ? new Date(Date.UTC(tm.DT[1], 0, 1) + tm.DT[0] * 86400000).toISOString().slice(0, 10) : g.date;
    const ctx = gameInputsCtx(clubs[0], clubs[1], { compId: 'CM7', human: [false, false], date });
    // sporets spiller → spillets (klubben, CA og de rå egenskaber)
    // staffposten +0x10/+0x12: fødselsdagen (dag i året fra 0, år) – spillerne i klubben med samme fødselsdato, så CA og de rå egenskaber
    const dobOf = (st?: Uint8Array) => st ? new Date(Date.UTC(st[0x12] | (st[0x13] << 8), 0, 1) + (st[0x10] | (st[0x11] << 8)) * 86400000).toISOString().slice(0, 10) : null;
    const mapPlayer = (side: number, rec: Uint8Array, st?: Uint8Array): Player | null => {
      const ca = (rec[5] | (rec[6] << 8)) << 16 >> 16, dob = dobOf(st);
      let best: Player | null = null, bd = 1e9;
      const cands = squad(clubs[side]!);
      const byDob = dob ? cands.filter((p) => p.dob === dob) : [];
      if (byDob.length === 1) return byDob[0];
      for (const p of byDob.length ? byDob : cands) {
        const r = recordBytes(p);
        let d = 4 * Math.abs(p.ca - ca);
        for (const o of RAW_OFFS) d += Math.abs((r[o] & 0xff) - rec[o]);
        if (d < bd) { bd = d; best = p; }
      }
      return bd <= 20 ? best : null;
    };
    for (const c of tm.mv) {
      const h = c.head.split(' '), side = +h[2], idx = +h[3];
      const r = tm.R.find((x) => x.side === side && x.idx === idx);
      const recT = hex(c.kv.rec), stT = hex(c.kv.st);
      const p = mapPlayer(side, recT, stT);
      if (!p) { missing++; note('spilleren findes i spillet', false, `kamp ${k} side ${side} ${c.head}`); continue; }
      found++; note('spilleren findes i spillet', true);
      const ours = ctx.matchValuesEnv({ side, src: p }) as MatchValuesEnv;
      const theirs = caseInput(c).env;
      const cmp = (name: string, a: unknown, b: unknown) => note(name, JSON.stringify(a) === JSON.stringify(b), `${p.last}: orig ${JSON.stringify(b)} spil ${JSON.stringify(a)}`);
      cmp('fixture +0x40', ours.fx40, theirs.fx40); cmp('fixture +0x3a', ours.fx3a, theirs.fx3a); cmp('comp +0x69', ours.comp, theirs.comp);
      cmp('hjemmeholdets liga = turneringen', ours.homeLeagueIsComp, theirs.homeLeagueIsComp);
      cmp('klub +0x80 (omdømme)', ours.ownClubRep, theirs.ownClubRep);
      note('klub +0x80 inden for ±10', Math.abs(ours.ownClubRep - theirs.ownClubRep) <= 10, `${ours.ownClubRep}/${theirs.ownClubRep}`);
      cmp('kontrakt findes', !!ours.contract, !!theirs.contract);
      if (ours.contract && theirs.contract) {
        cmp('kontrakt +0x44 (tilfredshed)', ours.contract.b44, theirs.contract.b44); cmp('kontrakt +0x45 (flag)', ours.contract.flags, theirs.contract.flags);
        cmp('kontrakt +0xc (løn)', ours.contract.d0c, theirs.contract.d0c); cmp('kontrakt +0x10/+0x14', [ours.contract.d10, ours.contract.d14], [theirs.contract.d10, theirs.contract.d14]);
      }
      cmp('0x53ce90 (kontraktmod)', ours.contractMod, theirs.contractMod); cmp('i databasen', ours.inDb, theirs.inDb);
      cmp('[0xae2d0c]+0xa (staffState)', ours.staffState, theirs.staffState); cmp('menneske', ours.human, theirs.human);
      cmp('manager np+0xe/0x544410', ours.manager, theirs.manager); cmp('forholdene staff+0x65', ours.rel, theirs.rel);
      cmp('[staff+0x61] +0x44/+0xb/+0xd', ours.player61, theirs.player61); cmp('nationen', ours.nation, theirs.nation); cmp('nøglerne USA/CAN/MEX', ours.keys, theirs.keys);
      // spillerposten og staffposten (de bytes, sub_6ec010 læser)
      const recO = recordBytes(p), stO = staffBytes(p, date);
      for (let o = 5; o < 0x46; o++) {
        if (o === 0x45) continue;                                                            // +0x45 moralen (spillerens dagsværdi)
        const grp = o <= 8 ? 'CA/PA +5/+7' : o <= 0xe ? 'omdømme +9/+b/+d' : o <= 0x1a ? 'positionerne +f..+1a' : RAW_OFFS.includes(o) ? 'rå egenskaber' : 'interne egenskaber';
        note(`spillerpost: ${grp}`, (recO[o] & 0xff) === recT[o], `${p.last} +0x${o.toString(16)} orig ${s8(recT[o])} spil ${recO[o]}`);
        if (grp === 'interne egenskaber' || grp === 'CA/PA +5/+7') ((recDiff[`${recT[0xf] === 20 ? 'GK' : 'mark'} +0x${o.toString(16)}`] ??= []).push(grp === 'CA/PA +5/+7' ? 0 : recO[o] - s8(recT[o])));
      }
      note('staffpost +0x18 (alder)', stO[0x18] === s8(stT[0x18]), `${p.last} orig ${s8(stT[0x18])} spil ${stO[0x18]}`);
      for (let o = 0x56; o <= 0x5d; o++) note('staffpost +0x56..+0x5d (skjulte)', stO[o] === s8(stT[o]), `${p.last} +0x${o.toString(16)} orig ${s8(stT[o])} spil ${stO[o]}`);
      // anføreren: sporets anfører (CP) med spillets data
      if (theirs.captain) {
        const cr = tm.R.find((x) => x.side === side && x.idx === tm.CAP[side]);
        const cp = cr ? mapPlayer(side, cr.rec, cr.sr) : null;
        if (cp) {
          const oc = ctx.captainEnvOf({ side, src: cp, pos: theirs.captain.pos })!;
          for (const f of ['influence', 'ca', 'r39', 'r44', 's18', 's59', 's5b', 'days'] as const) note(`anfører ${f}`, oc[f] === theirs.captain[f], `${cp.last}: orig ${theirs.captain[f]} spil ${oc[f]}`);
        }
      }
      // kampværdierne med spillets inddata (spillerblokken = originalens): hele + pr. gruppe
      const run = (mix: (env: MatchValuesEnv) => MatchValuesEnv, recFrom: 'orig' | 'game', stFrom: 'orig' | 'game') => {
        const { q } = caseInput(c);
        const env = mix({ ...caseInput(c).env });
        if (recFrom === 'game') { q.rec = (o) => recO[o]; q.recW = (o) => (((recO[o] & 0xff) | (recO[o + 1] << 8)) << 16) >> 16; }
        if (stFrom === 'game') q.staff = (o) => stO[o];
        let ri = 0; matchValues6ec010(q, env, () => c.rand[ri++]?.[2] ?? 0);
        return q;
      };
      const base = run((e) => e, 'orig', 'orig');
      const variants: [string, () => ReturnType<typeof run>][] = [
        ['alt fra spillet', () => run((e) => ({ ...ours, crowd: e.crowd, cohesion: e.cohesion, tactics: e.tactics, captain: e.captain }), 'game', 'game')],
        ['kun spillerposten', () => run((e) => e, 'game', 'orig')],
        ['kun staffposten', () => run((e) => e, 'orig', 'game')],
        ['kun kontrakt/kontraktmod', () => run((e) => ({ ...e, contract: ours.contract, contractMod: ours.contractMod }), 'orig', 'orig')],
        ['kun staffState', () => run((e) => ({ ...e, staffState: ours.staffState }), 'orig', 'orig')],
        ['kun forholdene', () => run((e) => ({ ...e, rel: ours.rel }), 'orig', 'orig')],
        ['kun manager', () => run((e) => ({ ...e, manager: ours.manager }), 'orig', 'orig')],
        ['kun klub-omdømmet', () => run((e) => ({ ...e, ownClubRep: ours.ownClubRep }), 'orig', 'orig')],
      ];
      for (const [name, fn] of variants) {
        const q = fn();
        (caDiff[name] ??= []).push(q.matchCA - base.matchCA);
        let sum = 0; for (const f of MV_FLOATS) sum += Math.abs(q.f[f] - base.f[f]);
        (fDiff[name] ??= []).push(sum / MV_FLOATS.length);
        if (name === 'alt fra spillet') for (const f of MV_FLOATS) ((fDiff['  ' + f] ??= []).push(q.f[f] - base.f[f]));
      }
    }
  }
  console.log(`\n${ms.length} kampe, ${found} kampspillere fundet i spillet, ${missing} ikke fundet\n`);
  console.log('felt'.padEnd(42) + 'ens'.padStart(9) + '   eksempler på afvigelser');
  for (const [k, t] of tally) console.log(`${k.padEnd(42)}${`${t.n - t.bad}/${t.n}`.padStart(9)}   ${t.ex.join(' · ')}`);
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const mabs = (a: number[]) => mean(a.map(Math.abs));
  console.log('\nsub_6ec010 med spillets inddata (originalens spillerblok) mod originalens kampstart:');
  console.log('variant'.padEnd(28) + 'CA snit'.padStart(9) + ' |CA|'.padStart(7) + '  |float| snit');
  for (const k of Object.keys(caDiff)) console.log(`${k.padEnd(28)}${mean(caDiff[k]).toFixed(2).padStart(9)}${mabs(caDiff[k]).toFixed(2).padStart(7)}  ${mean(fDiff[k]).toFixed(3)}`);
  if (process.env.RECDIFF) { console.log('\nspillerpostens interne egenskaber (snit af spil − original, antal):');
    console.log(Object.keys(recDiff).sort().filter((k) => !k.endsWith('+0x5') && !k.endsWith('+0x6') && !k.endsWith('+0x7') && !k.endsWith('+0x8')).map((k) => `${k} ${mean(recDiff[k]).toFixed(1)} (${recDiff[k].length})`).join(' · ')); }
  console.log('\nkampfloats, alt fra spillet (snit af spil − original):');
  console.log(MV_FLOATS.map((f) => `${f} ${mean(fDiff['  ' + f]).toFixed(2)}`).join(' · '));
})();
