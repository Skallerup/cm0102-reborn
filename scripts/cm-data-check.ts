// K8 (docs/ORIGINAL_PARITY.md): data-tjek – hver spillers/klubs/stabs felter ved spilstart i spillet mod ORIGINALENS hukommelse (øjebliksbillederne
// i ~/cm0102-engine/work-r3/snap-start/: pre-0-2001.bin = databasen lige indlæst 1/1-2001, pre-194-2001.bin = spilstarten 14/7-2001). Oraklet kørte
// med databasestørrelse 2 og England valgt; ejeren bruger Maximum – derfor sammenlignes kun personer/klubber, der findes begge steder (nøgle:
// fornavn|efternavn|fødselsår|nationalitet). Tilfældige dele (fødselsdag/-måned når kun året kendes, PA −1/−2, udfyldte egenskaber, udfyldte
// positioner/fødder) sammenlignes ikke værdi for værdi, men som regel (tælles under "ikke sammenlignelig").
//   npx tsx scripts/cm-data-check.ts [snapshot-start=pre-194-2001] [snapshot-db=pre-0-2001] [nationer=England] [klub=Arsenal]
// Skriver en rapport med antal afvigelser pr. felt og eksempler; exit-kode 0.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import type { CMWorld } from '../src/game/data/cm0102';
import { gs } from '../src/game/state';
import { ATTRS } from '../src/game/attributes';
import { displayFromX, INTRINSIC_KEYS } from '../src/game/playerInit';
import { staffShown } from '../src/game/engine/grid/roleScore';
import { GBP } from '../src/game/cmContractInit';
import type { Player } from '../src/game/types';
import { ageOn } from '../src/game/dates';

const dir = `${homedir()}/cm0102-engine/work-r3/snap-start`;
const [startName = 'pre-194-2001', dbName = 'pre-0-2001', natArg = 'England', clubArg = 'Arsenal'] = process.argv.slice(2);
const MS = loadSnap(`${dir}/${startName}.bin`);
const MD = dbName === startName ? MS : loadSnap(`${dir}/${dbName}.bin`);

// ------------------------------------------------------------------ rapport
const EXN = Number(process.env.EX ?? 4);
const ONLY = process.env.ONLY ?? '';
interface Stat { n: number; bad: number; ex: string[]; skip: number }
const stats = new Map<string, Stat>();
const order: string[] = [];
function chk(field: string, ok: boolean, label: () => string) {
  let s = stats.get(field);
  if (!s) { s = { n: 0, bad: 0, ex: [], skip: 0 }; stats.set(field, s); order.push(field); }
  s.n++;
  if (!ok) { s.bad++; if (s.ex.length < EXN) s.ex.push(label()); }
}
/** fordelingsmål for felter, der er tilfældige i originalen: sum/antal for oraklet og spillet (vises efter tabellen) */
const dists = new Map<string, { n: number; ours: number; theirs: number; ratios: number[] }>();
function dist(field: string, ours: number, theirs: number) {
  let d = dists.get(field);
  if (!d) { d = { n: 0, ours: 0, theirs: 0, ratios: [] }; dists.set(field, d); }
  d.n++; d.ours += ours; d.theirs += theirs;
  if (theirs > 0 && ours > 0) d.ratios.push(ours / theirs);
}
function skip(field: string, why = '') {
  let s = stats.get(field);
  if (!s) { s = { n: 0, bad: 0, ex: [], skip: 0 }; stats.set(field, s); order.push(field); }
  s.skip++; void why;
}

// ------------------------------------------------------------------ originalens hukommelse
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const dayNo = (iso: string) => { const y = +iso.slice(0, 4); return Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000); };

interface MemP {
  id: number; key: string; first: string; last: string; dobIso: string; yob: number; nat: string; nat2: string; club: string; clubAdr: number;
  st: number; pr: number; np: number;
}
interface MemView {
  m: SparseMem; S: number; n: number; C: number; nc: number;
  people: MemP[]; clubs: Map<string, number>;
  byKey: Map<string, MemP[]>;
}
function scan(m: SparseMem): MemView {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const people: MemP[] = [];
  const clubs = new Map<string, number>();
  for (let i = 0; i < nc; i++) { const nm = str(m, C + 0x245 * i + 4, 51); if (nm && !clubs.has(nm)) clubs.set(nm, C + 0x245 * i); }
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id;
    const pr = m.u32(st + 0x61), np = m.u32(st + 0x69);
    if (!pr && !np) continue;
    const common = str(m, m.u32(st + 0xc)), f = str(m, m.u32(st + 4)), l = str(m, m.u32(st + 8));
    const first = common ? '' : f, last = common || l;
    const dobIso = dayIso(m.s16(st + 0x10), m.u16(st + 0x12));
    const yob = dobIso ? +dobIso.slice(0, 4) : m.s16(st + 0x18);
    const nat = str(m, m.u32(st + 0x1a) + 4, 51), nat2 = m.u32(st + 0x1e) ? str(m, m.u32(st + 0x1e) + 4, 51) : '';
    const ca = m.u32(st + 0x39);
    const p: MemP = { id, key: `${first}|${last}|${yob}|${nat}`, first, last, dobIso, yob, nat, nat2, club: ca ? str(m, ca + 4, 51) : '', clubAdr: ca, st, pr, np };
    people.push(p);
  }
  const byKey = new Map<string, MemP[]>();
  for (const p of people) { const k = `${p.first}|${p.last}|${p.yob}|${p.nat}`; (byKey.get(k) ?? byKey.set(k, []).get(k)!).push(p); }
  return { m, S, n, C, nc, people, clubs, byKey };
}
const VS = scan(MS), VD = dbName === startName ? VS : scan(MD);

// ------------------------------------------------------------------ spillet
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as CMWorld;
const natNames = natArg.split(',');
const natIdx = natNames.map((nm) => w.nations.findIndex((x) => x.name === nm));
const startClub = w.clubs.find((c) => c[1] === clubArg)![0];
createGame(w as unknown as WorldData, { managerName: 'T', managerNation: natIdx[0], clubId: startClub, activeNations: natIdx, lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const nationName = (i: number) => g.nations[i]?.name ?? '';

// ------------------------------------------------------------------ nøgler
const keyOf = (p: Player) => `${p.first}|${p.last}|${p.dob.slice(0, 4)}|${nationName(p.nation)}`;
const ourBy = new Map<string, Player[]>();
for (const p of Object.values(g.players)) { if (p.virtual) continue; const k = keyOf(p); (ourBy.get(k) ?? ourBy.set(k, []).get(k)!).push(p); }

// attributkort: vores ATTRS-nøgle → [kilde, offset] (P = spillerpost, S = personpost); spejler MAP/PF i src/game/data/cm0102.ts
const PF = ['Goalkeeper', 'Sweeper', 'Defender', 'DefensiveMidfielder', 'Midfielder', 'AttackingMidfielder', 'Attacker', 'WingBack', 'RightSide', 'LeftSide', 'Central', 'FreeRole',
  'Acceleration', 'Aggression', 'Agility', 'Anticipation', 'Balance', 'Bravery', 'Consistency', 'Corners', 'Crossing', 'Decisions', 'Dirtiness', 'Dribbling', 'Finishing', 'Flair', 'FreeKicks',
  'Handling', 'Heading', 'ImportantMatches', 'InjuryProneness', 'Jumping', 'Leadership', 'LeftFoot', 'LongShots', 'Marking', 'Movement', 'NaturalFitness', 'OneOnOnes', 'Pace', 'Passing',
  'Penalties', 'Positioning', 'Reflexes', 'RightFoot', 'Stamina', 'Strength', 'Tackling', 'Teamwork', 'Technique', 'ThrowIns', 'Versatility', 'Vision', 'WorkRate'];
const SRC: Record<string, string> = { crossing: 'Crossing', dribbling: 'Dribbling', finishing: 'Finishing', heading: 'Heading', longShots: 'LongShots', marking: 'Marking', offTheBall: 'Movement',
  passing: 'Passing', penalties: 'Penalties', tackling: 'Tackling', freeKicks: 'FreeKicks', corners: 'Corners', technique: 'Technique', throwIns: 'ThrowIns', aggression: 'Aggression',
  anticipation: 'Anticipation', bravery: 'Bravery', creativity: 'Vision', decisions: 'Decisions', flair: 'Flair', influence: 'Leadership', positioning: 'Positioning', teamwork: 'Teamwork',
  workRate: 'WorkRate', acceleration: 'Acceleration', agility: 'Agility', balance: 'Balance', jumping: 'Jumping', naturalFitness: 'NaturalFitness', pace: 'Pace', stamina: 'Stamina',
  strength: 'Strength', handling: 'Handling', oneOnOnes: 'OneOnOnes', reflexes: 'Reflexes', consistency: 'Consistency', importantMatches: 'ImportantMatches',
  injuryProneness: 'InjuryProneness', dirtiness: 'Dirtiness', versatility: 'Versatility' };
const STAFF_OFS: Record<string, number> = { adaptability: 86, ambition: 87, determination: 88, loyalty: 89, pressure: 90, professionalism: 91, sportsmanship: 92, temperament: 93 };
const recOff = (f: string) => 0x0f + PF.indexOf(f);
const INTERNAL = new Set<string>(INTRINSIC_KEYS);
// bytes i spillerposten for de 18 interne (Player.cmInt-rækkefølge)
const INT_OFFS = [0x1e, 0x23, 0x24, 0x26, 0x27, 0x2a, 0x2b, 0x31, 0x32, 0x33, 0x35, 0x37, 0x38, 0x39, 0x3a, 0x3e, 0x41, 0x43];

// ------------------------------------------------------------------ spillerne
function contractOf(v: MemView, id: number): number {
  const m = v.m, ix = m.s32(m.u32(0xae2d0c) + 79 * id);
  return ix < 0 ? 0 : m.u32(m.u32(0xae1050)) + 80 * ix;
}
const partsOf = (v: MemView, kk: string) => (v.byKey.get(kk) ?? []).filter((p) => p.pr);
let matched = 0, onlyMem = 0, onlyOurs = 0, ambiguous = 0, unpaired = 0;
const exOnlyOurs: string[] = [], exOnlyMem: string[] = [], exUnpaired: string[] = [];
const rt = (p: Player) => w.ratings[p.id];
const attrDiff = new Map<string, number>();
const rowOf = new Map<number, (string | number)[]>(w.players.map((r) => [r[0] as number, r]));
const sel = new Set(natIdx);
/** personen med samme id i spilstartens billede (ids er ens mellem de to billeder; navnet kontrolleres) */
const atStart = (a0: MemP): MemP | null => { const b = VS.people.find((x) => x.id === a0.id); return b && b.first === a0.first && b.last === a0.last && b.yob === a0.yob ? b : null; };
const startById = new Map(VS.people.map((x) => [x.id, x]));
void atStart;
for (const [k, ours] of ourBy) {
  const mem = partsOf(VD, k);
  const eng = ours.filter((p) => p.club && sel.has(g.clubs[p.club]?.nation));
  if (!mem.length) { if (eng.length) { onlyOurs += eng.length; if (exOnlyOurs.length < 12) exOnlyOurs.push(`${ours[0].first} ${ours[0].last} (${g.clubs[ours[0].club]?.name ?? '-'})`); } continue; }
  // par efter fødselsdato; en spiller uden kendt dag/måned (rd) parres kun, hvis den er den eneste med nøglen
  const used = new Set<MemP>();
  for (const o of ours) {
    const rd = !!rt(o)?.rd;
    let c = mem.filter((x) => x.dobIso === o.dob && !used.has(x));
    if (!c.length && rd && ours.length === 1 && mem.length === 1) c = mem;
    if (c.length > 1) { ambiguous++; continue; }
    if (!c.length) {
      // samme person med en afvigende fødselsdato? (CA og klub ens)
      const ca = mem.filter((x) => !used.has(x) && VD.m.s16(x.pr + 5) === o.ca && x.club === (g.clubs[o.club]?.name ?? ''));
      if (ca.length === 1 && !rd) { used.add(ca[0]); compare(o, ca[0], startById.get(ca[0].id) ?? null); continue; }
      unpaired++; if (exUnpaired.length < 8) exUnpaired.push(`${o.first} ${o.last} ${o.dob} (${g.clubs[o.club]?.name ?? '-'}) mod ${mem.map((x) => x.dobIso).join('/')}`);
      continue;
    }
    used.add(c[0]);
    compare(o, c[0], startById.get(c[0].id) ?? null);
  }
}
for (const mp of VD.people) if (mp.pr) { const k = `${mp.first}|${mp.last}|${mp.yob}|${mp.nat}`; if (!ourBy.has(k) && mp.clubAdr && sel.has(natIdx.find((x) => g.nations[x].name === str(VD.m, VD.m.u32(mp.clubAdr + 0x53) + 4, 51)) ?? -1)) { onlyMem++; if (exOnlyMem.length < 12) exOnlyMem.push(`${mp.first} ${mp.last} f.${mp.yob} (${mp.club})`); } }

function compare(p: Player, a0: MemP, a1: MemP | null) {
  matched++;
  const m0 = VD.m, m1 = VS.m;
  const lab = (extra: string) => () => `${p.first} ${p.last} (${g.clubs[p.club]?.name ?? '-'}): ${extra}`;
  const r = rt(p);
  const pr = a0.pr, st = a0.st;
  // ---- personen (databasen 1/1: pre-0)
  const rd = !!r?.rd;
  if (rd) { chk('fødselsår (kun året kendt i databasen)', p.dob.slice(0, 4) === String(a0.yob), lab(`${p.dob} mod ${a0.dobIso}`)); skip('fødselsdato (tilfældig dag/måned)'); }
  else if (r?.tf !== undefined && p.dob.slice(5) !== a0.dobIso.slice(5) && a0.yob === 1980) skip('fødselsdato (klubløs uden dato: 1980 + tilfældig dag)');
  else chk('fødselsdato', p.dob === a0.dobIso, lab(`${p.dob} mod ${a0.dobIso}`));
  chk('nationalitet', nationName(p.nation) === a0.nat, lab(`${nationName(p.nation)} mod ${a0.nat}`));
  const n2 = p.cmNation2 !== undefined ? nationName(p.cmNation2) : '';
  chk('2. statsborgerskab', n2 === (a0.nat2 === a0.nat ? '' : a0.nat2), lab(`${n2 || '-'} mod ${a0.nat2 || '-'}`));
  chk('landskampe (databasen)', p.caps === m0.u8(st + 0x22), lab(`${p.caps} mod ${m0.u8(st + 0x22)}`));
  chk('landsholdsmål (databasen)', p.intGoals === m0.u8(st + 0x23), lab(`${p.intGoals} mod ${m0.u8(st + 0x23)}`));
  const joinedMem = dayIso(m0.s16(st + 0x3e), m0.u16(st + 0x40));
  chk('ankomstdato (staff +0x3e, databasen)', (p.cmJoined ?? '') === joinedMem || (!p.cmJoined && !joinedMem), lab(`${p.cmJoined ?? '-'} mod ${joinedMem}`));
  // ---- klub
  if (!p.loan) {
    if (a1) chk('klub (spilstart 14/7)', (g.clubs[p.club]?.name ?? '') === a1.club, lab(`${g.clubs[p.club]?.name ?? '-'} mod ${a1.club || '-'}`));
    chk('klub (databasen 1/1)', (g.clubs[p.club]?.name ?? '') === a0.club, lab(`${g.clubs[p.club]?.name ?? '-'} mod ${a0.club || '-'}`));
  } else skip('klub (udlånt)');
  // ---- positioner, sider, fødder, CA/PA (cellerne databasen angiver; resten udfyldes/repareres tilfældigt af originalen)
  const rawPos = [...Array(8).keys()].map((i) => m0.s8(pr + 0x0f + i));
  const sides = [m0.s8(pr + recOff('LeftSide')), m0.s8(pr + recOff('Central')), m0.s8(pr + recOff('RightSide'))];
  const dbPos = r?.pos ?? [], dbSide = r?.side ?? [];
  // databasens celler (> 1) skal være uændrede; hvor databasen havde ≤ 1 må originalens reparation (0x536f01) have tilføjet værdier
  let posBad = false, posAdded = false;
  for (let i = 0; i < 8; i++) { const mv = Math.max(1, Math.min(20, rawPos[i])); if (dbPos[i] > 1) { if (p.pos[i] !== mv) posBad = true; } else if (mv > 1 || p.pos[i] > 1) posAdded = true; }
  chk('positioner (8, databasens celler >1 = oraklet)', !posBad, lab(`${p.pos.join(',')} mod ${rawPos.join(',')} (db ${dbPos.join(',')})`));
  if (posAdded) skip('positioner: celler uden databaseværdi (repareret tilfældigt)');
  let sBad = false;
  for (let i = 0; i < 3; i++) { const mv = Math.max(1, Math.min(20, sides[i])); if (dbSide[i] > 1 && p.side[i] !== mv) sBad = true; }
  chk('sider (L,C,R; databasens celler >1)', !sBad, lab(`${p.side.join(',')} mod ${sides.join(',')} (db ${dbSide.join(',')})`));
  const lf = m0.s8(pr + recOff('LeftFoot')), rf = m0.s8(pr + recOff('RightFoot'));
  if (r?.feet && r.feet[0] > 0 && r.feet[1] > 0) {
    chk('fødder (V,H) – begge kendt i databasen', !p.feet || (p.feet[0] === lf && p.feet[1] === rf), lab(`${p.feet} mod ${lf},${rf} (db ${r.feet})`));
    chk('fod (R/L/B) – begge kendt', p.foot === (lf >= 15 && rf >= 15 ? 'B' : lf > rf ? 'L' : 'R'), lab(`${p.foot} mod ${lf},${rf}`));
  } else skip('fødder (mangler i databasen: tilfældig)');
  const mCa = m0.s16(pr + 5);
  if (r && r.ca > 1 && !r.tf) chk('CA (databasen > 1)', p.ca === mCa, lab(`${p.ca} mod ${mCa} (db ${r.ca})`)); else skip('CA (mangler i databasen)');
  if (r?.paRaw === undefined) chk('PA', p.pa === m0.s16(pr + 7), lab(`${p.pa} mod ${m0.s16(pr + 7)}`));
  else {
    skip('PA (databasens −1/−2/0/under CA: tilfældig)');
    const lo = r.paRaw === -2 ? 150 : r.paRaw === -1 ? 100 : mCa;
    const hi = r.paRaw === -2 ? 200 : r.paRaw === -1 ? 150 : 200;
    chk('PA −1/−2: spillets værdi inden for intervallet', p.pa >= lo - 2 && p.pa <= hi + 2, lab(`${p.pa} uden for ${lo}-${hi} (raw ${r.paRaw}, orig ${m0.s16(pr + 7)})`));
    chk('PA −1/−2: oraklets værdi inden for intervallet', m0.s16(pr + 7) >= lo - 2 && m0.s16(pr + 7) <= hi + 2, lab(`orig ${m0.s16(pr + 7)} uden for ${lo}-${hi}`));
  }
  const dbNum = m0.s8(pr + 4);
  if (dbNum > 0) chk('trøjenummer (databasen > 0)', (p.number ?? 0) === dbNum, lab(`${p.number ?? 0} mod ${dbNum}`));
  else chk('trøjenummer: spillet giver nummer, hvor originalen har 0', (p.number ?? 0) === 0, lab(`${p.number ?? 0} mod 0`));
  // ---- egenskaber (kun ikke-udfyldte)
  const missing = r ? r.attrs.some((v, i) => v === 0 && i < 36) : true;
  const gk = m0.s8(pr + 0x0f);
  for (let k = 0; k < ATTRS.length; k++) {
    const key = ATTRS[k];
    let mv: number | null = null;
    if (SRC[key]) mv = m0.s8(pr + recOff(SRC[key]));
    else if (STAFF_OFS[key] !== undefined) mv = m0.s8(st + STAFF_OFS[key]);
    if (mv === null) continue;
    const dbv = r?.attrs[k] ?? 0;
    if (INTERNAL.has(key)) {
      if (missing || dbv === 0) { skip('egenskab (intern) – udfyldt/ikke sammenlignelig'); continue; }
      const io = INTRINSIC_KEYS.indexOf(key as never);
      const shown = gk === 20 && (key === 'crossing' || key === 'creativity' || key === 'offTheBall') ? displayFromX(mCa * 0.1 + 2 * mv) : displayFromX(mCa + 2 * mv);
      chk('egenskab (viste, de 18 interne)', Math.round(p.attrs[k]) === shown, lab(`${key} ${Math.round(p.attrs[k])} mod ${shown}`));
      if (p.cmInt) chk('egenskab (intern byte, Player.cmInt)', p.cmInt[io] === mv, lab(`${key} ${p.cmInt[io]} mod ${mv} (+0x${INT_OFFS[io].toString(16)})`));
    } else {
      if (dbv === 0) { skip('egenskab (direkte) – udfyldt/ikke sammenlignelig'); continue; }
      chk('egenskab (direkte 1-20)', Math.round(p.attrs[k]) === mv, lab(`${key} ${Math.round(p.attrs[k])} mod ${mv}`));
      if (Math.round(p.attrs[k]) !== mv) { const t = `${key}${gk === 20 ? ' (målmand)' : ''}: ${Math.round(p.attrs[k]) < mv ? 'vores lavere' : 'vores højere'}`; attrDiff.set(t, (attrDiff.get(t) ?? 0) + 1); }
    }
  }
  // ---- omdømme, moral
  if (p.cmRepMem && r?.rep) {
    const rm = [m0.u16(pr + 9), m0.u16(pr + 0xb), m0.u16(pr + 0xd)];
    for (let i = 0; i < 3; i++) {
      if (r.rep[i] > 0) chk('omdømme (databasens værdi >0, ×50)', Math.round(p.cmRepMem[i] * 50) === rm[i], lab(`#${i} ${Math.round(p.cmRepMem[i] * 50)} mod ${rm[i]} (db ${r.rep[i]})`));
      else { skip('omdømme (mangler i databasen: tilfældig)'); dist('omdømme udfyldt (gns. ×50)', p.cmRepMem[i] * 50, rm[i]); }
    }
  }
  // ---- spilstartens billede (14/7): moral, værdi, kontrakt, kondition
  if (!a1) return;
  const pr1 = a1.pr, st1 = a1.st;
  chk('moral (spillerpost +0x45, spilstart)', Math.round(p.morale) === m1.s8(pr1 + 0x45), lab(`${p.morale} mod ${m1.s8(pr1 + 0x45)}`));
  const memVal = m1.s32(st1 + 0x52);
  if (memVal > 0 && p.club) {
    const ours = p.value * GBP;
    // værdien afhænger af CA/PA/alder/omdømme: kun spillere, hvis inddata alle står i databasen (CA > 1, PA, hel fødselsdato), kan sammenlignes
    const known = !!r && r.ca > 1 && r.paRaw === undefined && !rd && !r.tf && !!r.rep && r.rep[1] > 0;
    if (known) {
      chk('værdi – kendte inddata (£, ±10 %; vores er afrundet til trin)', Math.abs(ours / memVal - 1) <= 0.10, lab(`${Math.round(ours)} mod ${memVal} (CA ${p.ca}/${mCa} PA ${p.pa} alder ${ageOn(p.dob, g.date)})`));
      dist('værdi – kendte inddata: forhold vores/oraklet', ours, memVal);
    } else { skip('værdi (inddata fra tilfældige felter)'); dist('værdi – tilfældige inddata: forhold', ours, memVal); }
  }
  const k1 = contractOf(VS, a1.id), k0 = contractOf(VD, a0.id);
  if (k1 && p.contract && !p.loan) {
    const c = p.contract;
    const wDb = k0 ? m0.s32(k0 + 0xc) : -1;
    if (wDb > 0) chk('løn (£/uge) – databasens løn > 0', Math.round(c.wage * GBP) === m1.s32(k1 + 0xc), lab(`${Math.round(c.wage * GBP)} mod ${m1.s32(k1 + 0xc)} (db ${wDb})`));
    else { skip('løn (mangler i databasen: fyldes af 0x862720 med tilfældige tal)'); dist('løn udfyldt (£/uge)', c.wage * GBP, m1.s32(k1 + 0xc)); }
    const exp = dayIso(m1.s16(k1 + 0x2d), m1.u16(k1 + 0x2f));
    const exp0 = k0 ? dayIso(m0.s16(k0 + 0x2d), m0.u16(k0 + 0x2f)) : '';
    const dbRow = rowOf.get(p.id), dbExp = dbRow ? String(dbRow[w.playerFields.indexOf('contract')] ?? '') : '';
    if (dbExp) chk('kontraktudløb – databasen har en dato', c.expires.slice(0, 10) === exp, lab(`${c.expires} mod ${exp} (db ${dbExp}, orakel 1/1 ${exp0})`));
    else { skip('kontraktudløb (mangler i databasen: år + rand)'); dist('kontraktudløb udfyldt (år efter 2001)', +c.expires.slice(0, 4) - 2001, +exp.slice(0, 4) - 2001); }
    chk('kontrakttype (+0x35)', (c.cmType ?? 2) === (m1.u8(k1 + 0x35) & 0x3f), lab(`${c.cmType ?? 2} mod ${m1.u8(k1 + 0x35) & 0x3f}`));
    chk('deltid (+0x35 bit 7)', !!c.partTime === !!(m1.u8(k1 + 0x35) & 0x80), lab(`${!!c.partTime} mod ${!!(m1.u8(k1 + 0x35) & 0x80)}`));
    const bon = [m1.s32(k1 + 0x10), m1.s32(k1 + 0x14), m1.s32(k1 + 0x18)];
    const bonOur = c.cmBonusGbp ?? [-1, -1, -1];
    // bonusser og klausuler trækkes med tilfældige tal – sammenlignes som andele (fordelingen), ikke spiller for spiller
    ['mål', 'assist', 'clean sheet'].forEach((nm, i) => dist(`bonus ${nm}: andel med bonus`, bonOur[i] >= 0 ? 1 : 0, bon[i] >= 0 ? 1 : 0));
    ['mål', 'assist', 'clean sheet'].forEach((nm, i) => { if (bonOur[i] >= 0 && bon[i] >= 0) dist(`bonus ${nm}: beløb (£)`, bonOur[i], bon[i]); });
    const cl = [0x1c, 0x1d, 0x1e, 0x1f, 0x20].map((o) => m1.u8(k1 + o));
    ['Non Promotion', 'Minimum Fee', 'Non Playing', 'Relegation', 'Manager Job'].forEach((nm, i) => dist(`klausul ${nm}: andel`, c.cmClauses?.[i] ?? 0, cl[i]));
    const start = dayIso(m1.s16(k1 + 0x25), m1.u16(k1 + 0x27));
    chk('kontraktstart (+0x25)', (c.cmStart ?? p.cmJoined ?? '') === start, lab(`${c.cmStart ?? p.cmJoined ?? '-'} mod ${start}`));
    chk('trupstatus (+0x4f høj nibble)', ((p.cmContract?.b4f ?? 0) >> 4) === (m1.u8(k1 + 0x4f) >> 4), lab(`${(p.cmContract?.b4f ?? 0) >> 4} mod ${m1.u8(k1 + 0x4f) >> 4}`));
  } else if (!k1 && p.contract && !p.loan) chk('kontrakt findes (som i originalen)', false, lab('originalen uden kontrakt'));
  else if (k1 && !p.contract && !p.loan) chk('kontrakt findes (som i originalen)', false, lab('vi uden kontrakt'));
  const inj = m1.u32(0xb63d28);
  if (inj && p.cmFit) {
    const rec = m1.u32(inj) + 31 * a1.id;
    const nfK = (r?.attrs[ATTRS.indexOf('naturalFitness')] ?? 0) > 0 && (r?.attrs[ATTRS.indexOf('professionalism')] ?? 0) > 0;
    if (nfK && p.club) chk('Fitness (Injury +8; Natural Fitness og Professionalism kendt)', p.cmFit.f === m1.u16(rec + 8), lab(`${p.cmFit.f} mod ${m1.u16(rec + 8)}`));
    else dist('Fitness (Injury +8; tilfældige inddata)', p.cmFit.f, m1.u16(rec + 8));
    chk('kampkondition (Injury +0xa)', p.cmFit.mc === m1.u16(rec + 0xa), lab(`${p.cmFit.mc} mod ${m1.u16(rec + 0xa)}`));
  }
}

// ------------------------------------------------------------------ klubberne
let nClubs = 0;
const clubNat = (c: number) => w.nations[g.clubs[c].nation]?.name;
for (const c of Object.values(g.clubs)) {
  const adr = VS.clubs.get(c.name);
  if (!adr || !sel.has(g.clubs[c.id].nation)) continue;
  const hidden = /^H/.test(c.league);
  nClubs++;
  const m = VS.m;
  const lab = (e: string) => () => `${c.name}: ${e}`;
  chk('klub: kort navn', c.short === str(m, adr + 0x38, 26) || (!str(m, adr + 0x38, 26) && c.short === c.name), lab(`${c.short} mod ${str(m, adr + 0x38, 26)}`));
  chk('klub: land', clubNat(c.id) === str(m, m.u32(adr + 0x53) + 4, 51), lab(`${clubNat(c.id)} mod ${str(m, m.u32(adr + 0x53) + 4, 51)}`));
  const divId = m.u32(m.u32(adr + 0x57));
  if (!hidden) chk('klub: division (id)', c.league === `CM${divId}`, lab(`${c.league} mod CM${divId}`)); else skip('klub: division (skjult liga)');
  chk('klub: omdømme (+0x80)', (g.cmClubRep?.[c.id] ?? c.rep * 100) === m.s16(adr + 0x80), lab(`${g.cmClubRep?.[c.id]} mod ${m.s16(adr + 0x80)}`));
  chk('klub: status (+0x64, pro/semi/amatør)', (g.cmClubStat?.[c.id]?.[0] ?? 1) === m.u8(adr + 0x64), lab(`${g.cmClubStat?.[c.id]?.[0]} mod ${m.u8(adr + 0x64)}`));
  const stad = m.u32(adr + 0x69);
  chk('klub: stadion (navn)', !stad || c.stadium === str(m, stad + 4, 51), lab(`${c.stadium} mod ${stad ? str(m, stad + 4, 51) : '-'}`));
  const cap = stad ? m.s32(stad + 60) : 0;
  chk('klub: stadion (kapacitet)', !stad || cap <= 0 || cap > 150000 ? true : c.seats === Math.min(120000, cap), lab(`${c.seats} mod ${cap}`));
  if (!hidden) chk('klub: træningsanlæg (+0x7f)', c.facilities === Math.max(1, Math.min(20, m.u8(adr + 0x7f))), lab(`${c.facilities} mod ${m.u8(adr + 0x7f)}`));
  const finOf = (mm: SparseMem) => { const f = mm.u32(mm.u32(0xae2a38)) + 0x167 * ((adr - VS.C) / 0x245); return mm.s32(f) + mm.s32(f + 4) * 4294967296; };
  const bal = finOf(m), bal0 = finOf(VD.m);
  const dbBal = VD.m.s32(adr + 0x65);
  const gb = Math.round(c.balance * GBP);
  // saldoen er databasens × 0,92–1,08 (tilfældigt; 0 → 35 ugers lønsum) – ens tal kan ikke forventes; tjek intervallet og forløbet 1/1 → 14/7
  const db0 = w.clubFinance?.[c.id]?.[0] ?? 0;
  if (db0 > 0) {
    chk('klub: saldo inden for 0,92–1,08 × databasen (vores)', gb / db0 >= 0.915 && gb / db0 <= 1.085, lab(`${gb} / ${db0} = ${(gb / db0).toFixed(3)} (oraklet 1/1: ${(bal0 / db0).toFixed(3)}, 14/7: ${(bal / db0).toFixed(3)})`));
    chk('klub: saldo inden for 0,92–1,08 × databasen (oraklet 14/7)', bal / db0 >= 0.915 && bal / db0 <= 1.085, lab(`${bal} / ${db0}`));
    dist('klub: saldo/database (vores mod oraklet 14/7)', gb / db0, bal / db0);
  }
  void dbBal;
  const colours = (a: number) => { const cp = m.u32(a); return cp ? `#${[m.u8(cp + 55), m.u8(cp + 56), m.u8(cp + 57)].map((x) => x.toString(16).padStart(2, '0')).join('')}` : ''; };
  const wc = w.clubColors[c.id];
  if (wc) chk('klub: farver (primær/sekundær)', c.colors[0].toLowerCase() === colours(adr + 0x87) && c.colors[1].toLowerCase() === colours(adr + 0x83) || (c.colors[0].toLowerCase() === colours(adr + 0x83) && c.colors[1].toLowerCase() === colours(adr + 0x87)), lab(`${c.colors} mod ${colours(adr + 0x83)}/${colours(adr + 0x87)}`));
  const mgrP = m.u32(adr + 0xcf);
  if (mgrP && c.manager > 0) {
    const mgr = g.staff[c.manager];
    const nm = (() => { const cn = str(m, m.u32(mgrP + 0xc)); return cn ? cn : `${str(m, m.u32(mgrP + 4))} ${str(m, m.u32(mgrP + 8))}`; })();
    chk('klub: manager (navn)', !!mgr && `${mgr.first} ${mgr.last}`.trim() === nm.trim(), lab(`${mgr ? `${mgr.first} ${mgr.last}` : '-'} mod ${nm}`));
  }
  const chair = m.u32(adr + 0xbf);
  if (!hidden) chk('klub: formand findes', (g.cmFin?.[c.id]?.chair !== undefined) === !!chair, lab(`${g.cmFin?.[c.id]?.chair !== undefined} mod ${!!chair}`));
}

// ------------------------------------------------------------------ staben
const JOB: Record<string, number> = { manager: 5, assistant: 6, coach: 8, scout: 9, physio: 10 };
const memStaff = new Map<string, MemP[]>();
for (const p of VD.people) if (p.np) { (memStaff.get(p.key) ?? memStaff.set(p.key, []).get(p.key)!).push(p); }
const staffRow = new Map((w.staff ?? []).map((x) => [x[9], x]));
let staffMatched = 0, staffOnlyOurs = 0;
for (const s of Object.values(g.staff)) {
  if (!s.club || !sel.has(g.clubs[s.club]?.nation)) continue;
  const key = `${s.first}|${s.last}|${s.dob.slice(0, 4)}|${nationName(s.nation)}`;
  const cand = (memStaff.get(key) ?? []).filter((x) => !x.pr);
  if (cand.length !== 1) { staffOnlyOurs++; continue; }
  const a = cand[0], m = VD.m, np = a.np;
  staffMatched++;
  const lab = (e: string) => () => `${s.first} ${s.last} (${g.clubs[s.club]?.name}): ${e}`;
  const row = staffRow.get(s.cmId ?? -1), raw = row?.[11];
  chk('stab: fødselsdato (år)', s.dob.slice(0, 4) === String(a.yob), lab(`${s.dob} mod ${a.dobIso}`));
  chk('stab: klub (databasen 1/1)', (g.clubs[s.club]?.name ?? '') === a.club, lab(`${g.clubs[s.club]?.name} mod ${a.club}`));
  chk('stab: job (+0x3d)', (JOB[s.role] ?? 0) === m.u8(a.st + 0x3d), lab(`${s.role} mod ${m.u8(a.st + 0x3d)}`));
  if (row && row[7] > 0) chk('stab: CA (+4) – databasen har CA', s.ca === m.s16(np + 4), lab(`${s.ca} mod ${m.s16(np + 4)} (db ${row[7]})`)); else skip('stab: CA (mangler i databasen: tilfældig)');
  if (s.cmPa !== undefined) {
    if (raw && raw[0] > 0) chk('stab: PA (+6) – databasen har PA', s.cmPa === m.s16(np + 6), lab(`${s.cmPa} mod ${m.s16(np + 6)} (db ${raw[0]})`)); else skip('stab: PA (mangler i databasen: tilfældig)');
  }
  if (s.cmNp && raw) {
    for (let o = 0x0e; o <= 0x22; o++) {
      const dbv = raw[1 + (o - 0x0e)];
      if (!dbv) { skip('stab: egenskab (mangler i databasen: tilfældig)'); continue; }
      chk('stab: egenskaber (+0x0e..+0x22, byte; databasens celler)', s.cmNp[o - 0x0e] === m.s8(np + o), lab(`+0x${o.toString(16)}: ${s.cmNp[o - 0x0e]} mod ${m.s8(np + o)} (db ${dbv})`));
    }
    const fdb = row?.[10]?.[7] ?? 0;
    if (fdb > 0) chk('stab: yndlingsformation (+0x43) – databasen har den', s.cmNp[21] === m.s8(np + 0x43), lab(`${s.cmNp[21]} mod ${m.s8(np + 0x43)} (db ${fdb})`)); else skip('stab: yndlingsformation (mangler: tilfældig)');
  }
  const rep = m.s16(np + 0xa), repDb = row?.[8] ?? 0;
  if (s.cmRep) {
    if (repDb > 0) chk('stab: omdømme (+0xa) – databasen har det', (s.cmRep as unknown as number[])[1] === rep, lab(`${s.cmRep} mod ${rep} (db ${repDb})`)); else skip('stab: omdømme (mangler: tilfældig)');
  }
  const kc = contractOf(VS, a.id), wDb = row?.[12]?.[11] ?? 0;
  if (s.wage && kc) {
    if (wDb > 0 && VS.m.s32(kc + 0xc) <= 0) skip('stab: ugeløn (databasens løn > cap: originalen udskyder den, −1)');
    else if (wDb > 0) chk('stab: ugeløn (£) – databasen har den', Math.round(s.wage * GBP) === VS.m.s32(kc + 0xc), lab(`${Math.round(s.wage * GBP)} mod ${VS.m.s32(kc + 0xc)} (db ${wDb})`));
    else { skip('stab: ugeløn (mangler i databasen: originalens standardløn 0x864550)'); dist(`stab: ugeløn udfyldt – ${s.role} (£)`, s.wage * GBP, VS.m.s32(kc + 0xc)); }
  }
  void staffShown;
}

// ------------------------------------------------------------------ rapport
if (process.env.ATTRDIFF) console.log([...attrDiff.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k}: ${v}`).join('\n'));
console.log(`K8 data-tjek: spilstart ${startName}, database ${dbName}; spil: ${natNames.join('+')} / ${clubArg}`);
console.log(`personer i oraklets hukommelse: ${VS.people.filter((p) => p.pr).length} spillere, ${VS.people.filter((p) => p.np && !p.pr).length} ikke-spillere; spillets spillere: ${Object.keys(g.players).length}`);
console.log(`parret/sammenlignede spillere ${matched}, uparret (samme navn+år, anden dato/klub) ${unpaired}, kun hos os (valgte lande) ${onlyOurs}, kun i originalen (valgte lande) ${onlyMem}, tvetydige ${ambiguous}; klubber ${nClubs}; stab ${staffMatched} (uden par ${staffOnlyOurs})`);
if (exUnpaired.length) console.log('  uparret:', exUnpaired.join('; '));
if (exOnlyOurs.length) console.log('  kun hos os:', exOnlyOurs.join('; '));
if (exOnlyMem.length) console.log('  kun i originalen:', exOnlyMem.join('; '));
for (const [f, d] of [...dists.entries()]) {
  const rs = d.ratios.sort((a, b) => a - b), q = (x: number) => (rs.length ? rs[Math.min(rs.length - 1, Math.floor(rs.length * x))].toFixed(2) : '-');
  console.log(`fordeling ${f}: n ${d.n}, gns. vores ${(d.ours / d.n).toFixed(2)} mod oraklet ${(d.theirs / d.n).toFixed(2)}${rs.length ? `; forhold p10/p50/p90 ${q(0.1)}/${q(0.5)}/${q(0.9)}; inden for ±5 % ${(100 * rs.filter((x) => Math.abs(x - 1) <= 0.05).length / rs.length).toFixed(0)} %, ±25 % ${(100 * rs.filter((x) => Math.abs(x - 1) <= 0.25).length / rs.length).toFixed(0)} %` : ''}`);
}
console.log('felt'.padEnd(52), 'tjekket'.padStart(8), 'afvigelser'.padStart(11), 'sprunget'.padStart(9));
for (const f of order) {
  if (ONLY && !f.includes(ONLY)) continue;
  const s = stats.get(f)!;
  console.log(f.padEnd(52), String(s.n).padStart(8), String(s.bad).padStart(11), String(s.skip).padStart(9));
  for (const e of s.ex) console.log('      ' + e);
}
