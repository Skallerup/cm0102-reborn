// Kontrol af save.ts repairFakePlayers (purgeFakes.ts) på et gemt spil: antal spillere og gemmets størrelse før/efter, ingen hængende
// referencer (alle spiller-id'er i trupper, bud, ønskelister, landshold, kendskab, modulernes tilstand findes), menneskets klub og de valgte
// landes klubber urørte, og DAYS dage videre uden fejl (soak-invarianterne: én trup pr. spiller, klubberne findes, gyldige tal).
//   npx tsx scripts/fake-purge-check.ts <gem.sav> [dage=30]
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deserializeState, serializeState } from '../src/game/snapshot';
import { gs, setGame, squadIds } from '../src/game/state';
import { upgradeLoaded, ensureAllNumbers, repairStaleOffers, repairFakePlayers } from '../src/game/save';
import { captureCarry } from '../src/game/carry';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { fakeCandidates } from '../src/game/purgeFakes';
import { isHumanClub } from '../src/game/humans';
import type { GameState } from '../src/game/types';

const [file, daysS = '30'] = process.argv.slice(2);
setGame(await deserializeState(new Blob([readFileSync(file)])));
upgradeLoaded(); ensureAllNumbers(); repairStaleOffers();
const g = gs();
const act = new Set(g.activeNations);
const visible = (cid: number) => isHumanClub(cid) || (!!g.clubs[cid] && act.has(g.clubs[cid].nation));
const h = (v: unknown) => createHash('sha1').update(JSON.stringify(v) ?? 'u').digest('hex').slice(0, 12);
function protectedFp() {
  const out: Record<string, string> = {};
  for (const c of Object.values(g.clubs)) if (visible(c.id)) out[`c${c.id}`] = h([{ ...c, shortlist: undefined }, squadIds(c.id), squadIds(c.id).map((id) => g.players[id])]);   // computerens ønskeliste ryddes (fjernede)
  for (const p of Object.values(g.players)) if (p.loan && visible(p.loan.from)) out[`p${p.id}`] = h(p);
  return out;
}
const size = async () => (await serializeState(g)).size;
const nPlayers0 = Object.keys(g.players).length, size0 = await size(), cand0 = fakeCandidates(g).length;
const fp0 = protectedFp();
const t0 = performance.now();
const before = new Set(Object.keys(g.players).map(Number));
repairFakePlayers();
const ms = performance.now() - t0;
const gone = new Set([...before].filter((id) => !g.players[id]));
const nPlayers1 = Object.keys(g.players).length, size1 = await size();
console.log(`${file.split('/').slice(-2).join('/')} ${g.date}: spillere ${nPlayers0} → ${nPlayers1} (kandidater ${cand0}, fjernet ${gone.size}, beholdt ${cand0 - gone.size}) · gem ${(size0 / 1e6).toFixed(2)} → ${(size1 / 1e6).toFixed(2)} MB gz · ${ms.toFixed(0)} ms`);
const fp1 = protectedFp();
const changed = Object.keys(fp0).filter((k) => fp0[k] !== fp1[k]);
console.log(`valgte klubber/menneskets klub/lejespillere: ${Object.keys(fp0).length} poster, ændret ${changed.length}${changed.length ? ' ' + changed.slice(0, 10).join(',') : ''}`);

// hængende referencer: alle tal i GameState + carry, der er et fjernet id (generisk), og de strukturerede lister (alle id'er findes)
const errors: string[] = [];
const info = new Set<number>();   // pensionerede (cmRetire.ts) i en udtaget landsholdstrup – som før, ikke fjernet her
const hits = new Map<string, number>();
function walk(v: unknown, path: string, seen: Set<object>) {
  if (v === null || typeof v !== 'object' || seen.has(v as object)) return;
  seen.add(v as object);
  const arr = Array.isArray(v);
  for (const [k, x] of Object.entries(v as object)) {
    const pk = arr ? '[]' : /^\d+$/.test(k) ? (gone.has(+k) ? '{ID}' : '{n}') : k;
    const p = `${path}.${pk}`;
    if ((typeof x === 'number' && gone.has(x)) || pk === '{ID}') hits.set(p, (hits.get(p) ?? 0) + 1);
    walk(x, p, seen);
  }
}
walk(g, '', new Set()); walk(captureCarry(), '.carry', new Set());
console.log(`generisk søgning efter fjernede id'er: ${hits.size ? [...hits].map(([k, n]) => `${n} ${k}`).join(' · ') : 'ingen'}`);
function checkIds(label: string, gg: GameState) {
  const miss = (where: string, id: number) => { if (id && !gg.players[id] && errors.length < 50) errors.push(`${label}: ${where} → ${id}`); };
  for (const c of Object.values(gg.clubs)) { for (const id of squadIds(c.id)) miss(`trup ${c.name}`, id); for (const id of c.shortlist ?? []) if (gone.has(id)) miss(`ønskeliste ${c.name}`, id); }
  for (const o of gg.offers) if (gone.has(o.player)) miss(`bud ${o.id}`, o.player);
  for (const q of gg.pursuits ?? []) if (gone.has(q.player)) miss('forfølgelse', q.player);
  for (const id of gg.shortlist) miss('menneskets shortliste', id);
  for (const id of Object.keys(gg.knowledge).map(Number)) if (gone.has(id)) miss('kendskab', id);
  for (const [n, list] of Object.entries(gg.intl?.cmSq?.sq ?? {})) for (const s of list) for (const id of s?.ids ?? []) if (gone.has(id)) miss(`landshold ${n}`, id); else if (id < 20_000_000 && !gg.players[id]) info.add(id);
  for (const pools of Object.values(gg.intl?.cmSq?.pool ?? {})) for (const grp of pools) for (const row of grp) for (const id of row) if (gone.has(id)) miss('landsholdspulje', id);
  for (const p of Object.values(gg.players)) if (p.club && !gg.clubs[p.club]) errors.push(`${label}: ${p.last} i en klub, der ikke findes`);
  const seenIn = new Map<number, number>();
  for (const c of Object.values(gg.clubs)) for (const id of squadIds(c.id)) if (gg.players[id]?.club === c.id) seenIn.set(id, (seenIn.get(id) ?? 0) + 1);
  for (const [id, n] of seenIn) if (n > 1) errors.push(`${label}: ${id} i ${n} trupper`);
  for (const p of Object.values(gg.players)) if (!Number.isFinite(p.ca) || !Number.isFinite(p.value)) errors.push(`${label}: ${p.last} ugyldige tal`);
}
checkIds('efter indlæsningen', g);
// DAYS dage videre
const days = Number(daysS);
const t1 = performance.now();
for (let d = 0; d < days; d++) {
  try { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
  catch (e) { errors.push(`${g.date}: undtagelse ${(e as Error).stack?.split('\n').slice(0, 4).join(' | ')}`); break; }
}
checkIds(`efter ${days} dage`, g);
const cand1 = fakeCandidates(g).length;
console.log(`${days} dage → ${g.date} (${((performance.now() - t1) / 1000).toFixed(0)} s) · spillere ${Object.keys(g.players).length} · kandidater nu ${cand1}`);
console.log(`landsholdstrupper med pensionerede (ikke fjernet her): ${info.size}`);
console.log(errors.length ? `FEJL (${errors.length}):\n${errors.join('\n')}` : 'ingen fejl');
process.exit(errors.length ? 1 : 0);
