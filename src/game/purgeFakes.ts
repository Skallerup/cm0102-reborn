// (27/11) Gemte spil fra før 6c3386bb: season.ts' sæsonskifte lavede opdigtede spillere (fillSquad) i de ikke-valgte landes klubber, selv om
// originalen kun har fyldspillerne 0x90dae0 (cmVirtual.ts) omkring kampene – ~7.400 nye, gemte spillere pr. sæsonskifte (Normal og Maximum).
// De genkendes uden et nyt flag: regen-flaget uden en pensioneret spillers post (regenOf – fillSquad/nødmålmændene/årgangene; 0x7abac0's regens
// har den), et id fra spillets egen tæller (nextId.player ≥ 10.000.000 – databasens og reserveposternes id'er ligger under), ingen klubskifter
// (moves), i en klub i et ikke-valgt land. Spillets egne årgange (youthIntake) findes kun uden originalens regens (originalRegens) – kontrollen
// kræver derfor fyldspillerne (cmVirtualOn) og originalens regens.
// Kun de "usynlige" fjernes: ikke ejet/lejet af/til en valgt klub eller menneskets, intet åbent bud/forfølgelse/forlængelse/rygte/aftale med en
// valgt klub, ikke på en menneskes shortliste, i menneskets kamprapporter, i en spejders Scout Player eller i et landshold, et menneske styrer, og ikke i et landshold, der
// er udtaget nu eller til de kommende landskampe. Referencerne ryddes (lister, kort, nyheders links, modulernes tilstand i carry.ts).
import type { GameState, Player } from './types';
import { removePlayer } from './state';
import { isHumanClub } from './humans';
import { cmVirtualOn } from './cmVirtual';
import { originalRegens } from './season';
import { captureCarry, restoreCarry } from './carry';

const FIRST_GAME_ID = 10_000_000;
const CLOSED = new Set(['completed', 'rejected', 'withdrawn', 'collapsed']);

/** spillets egne opdigtede spillere i de ikke-valgte landes klubber (uden hensyn til synligheden) */
export function fakeCandidates(g: GameState): Player[] {
  if (g.draft || !cmVirtualOn(g) || !originalRegens()) return [];
  const act = new Set(g.activeNations);
  return Object.values(g.players).filter((p) => p.regen && p.regenOf === undefined && !p.virtual && p.id >= FIRST_GAME_ID && !p.moves?.length
    && !!p.club && !!g.clubs[p.club] && !act.has(g.clubs[p.club].nation));
}

export interface PurgeResult { candidates: number; removed: number; kept: number; ids: number[] }

/** fjern de usynlige opdigtede spillere og ryd referencerne til dem */
export function purgeInvisibleFakes(g: GameState): PurgeResult {
  const cand = fakeCandidates(g);
  if (!cand.length) return { candidates: 0, removed: 0, kept: 0, ids: [] };
  const act = new Set(g.activeNations);
  const visibleClub = (cid: number | undefined) => !!cid && (isHumanClub(cid) || (!!g.clubs[cid] && act.has(g.clubs[cid].nation)));
  // hvad mennesket/de valgte klubber har med dem at gøre
  const keep = new Set<number>();
  const humanSl = [g.shortlist, ...(g.humans ?? []).map((h) => h.shortlist)];
  for (const sl of humanSl) for (const id of sl ?? []) keep.add(id);
  for (const m of [g.manager, ...(g.humans ?? []).map((h) => h.manager)]) for (const id of m?.national?.picks ?? []) keep.add(id);
  for (const o of g.offers) if (!CLOSED.has(o.status) && (visibleClub(o.buyer) || visibleClub(o.seller))) keep.add(o.player);
  for (const q of g.pursuits ?? []) if (visibleClub(q.club)) keep.add(q.player);
  for (const r of g.pendingRenewals ?? []) if (visibleClub(r.club)) keep.add(r.pid);
  for (const k of g.cmTmKept ?? []) if (visibleClub(k.buyer) || visibleClub(k.seller)) keep.add(k.player);
  for (const e of g.cmRum?.q ?? []) if (visibleClub(e.c)) keep.add(e.p);
  for (const r of g.cmScoutReq ?? []) if (visibleClub(r.club)) keep.add(r.pid);
  for (const s of Object.values(g.staff)) {
    if (!isHumanClub(s.club)) continue;
    for (const id of s.watch ?? []) keep.add(id);
    if (s.assignment?.kind === 'player') keep.add(Number(s.assignment.target));
  }
  // menneskets gemte kamprapporter (de seneste 40, prune): spillerne i dem bliver (rapporten viser dem ved navn)
  const nums = (v: unknown): void => {
    if (typeof v === 'number') { if (v >= FIRST_GAME_ID) keep.add(v); }
    else if (v && typeof v === 'object') for (const x of Object.values(v)) nums(x);
  };
  for (const r of Object.values(g.reports)) nums([r.players, r.mom, r.bench, r.events, r.shots]);
  // landsholdene: udtaget nu eller til de kommende landskampe (truppen ændres ikke undervejs), og et menneskes landshold
  const humanNat = new Set([g.manager, ...(g.humans ?? []).map((h) => h.manager)].map((m) => m?.national?.nation).filter((n): n is number => n !== undefined));
  for (const [n, list] of Object.entries(g.intl?.cmSq?.sq ?? {})) for (const s of list) if (s && (s.until >= g.date || humanNat.has(+n))) for (const id of s.ids) keep.add(id);
  const gone = new Set<number>();
  for (const p of cand) {
    if (keep.has(p.id) || isHumanClub(p.club)) continue;
    if (p.loan && visibleClub(p.loan.from)) continue;
    if (p.cmCon !== undefined && visibleClub(p.cmCon)) continue;
    gone.add(p.id);
  }
  if (!gone.size) return { candidates: cand.length, removed: 0, kept: cand.length, ids: [] };
  for (const id of gone) removePlayer(g.players[id]);
  clearRefs(g, gone);
  return { candidates: cand.length, removed: gone.size, kept: cand.length - gone.size, ids: [...gone] };
}

const has = (gone: Set<number>) => (id: number) => !gone.has(id);
function dropKeys(o: Record<number, unknown> | undefined, gone: Set<number>) {
  if (o) for (const id of gone) delete o[id];
}

function clearRefs(g: GameState, gone: Set<number>): void {
  const keep = has(gone);
  // personerne og klubberne
  for (const p of Object.values(g.players)) if (p.cmRel?.some((x) => gone.has(x))) p.cmRel = p.cmRel.map((x) => (gone.has(x) ? 0 : x));
  for (const s of Object.values(g.staff)) {
    if (s.cmRel?.some((x) => gone.has(x))) s.cmRel = s.cmRel.map((x) => (gone.has(x) ? 0 : x));
    if (s.scoutList) s.scoutList = s.scoutList.filter(keep);
    if (s.watch) s.watch = s.watch.filter(keep);
    if (s.assignment?.found) s.assignment.found = s.assignment.found.filter(keep);
    if (s.assignment?.queue) s.assignment.queue = s.assignment.queue.filter(keep);
  }
  for (const c of Object.values(g.clubs)) {
    if (c.shortlist?.some((x) => gone.has(x))) c.shortlist = c.shortlist.filter(keep);
    if (c.euroSquad?.ids.some((x) => gone.has(x))) c.euroSquad.ids = c.euroSquad.ids.filter(keep);
  }
  for (const pl of Object.values(g.cmPlan ?? {})) pl.s = pl.s.map((row) => row.map((x) => (gone.has(x) ? 0 : x)));
  // marked, rygter og spejdere
  g.offers = g.offers.filter((o) => !gone.has(o.player));
  if (g.pursuits) g.pursuits = g.pursuits.filter((q) => !gone.has(q.player));
  if (g.pendingRenewals) g.pendingRenewals = g.pendingRenewals.filter((r) => !gone.has(r.pid));
  if (g.cmTmKept) g.cmTmKept = g.cmTmKept.filter((k) => !gone.has(k.player));
  if (g.cmRum) g.cmRum.q = g.cmRum.q.filter((e) => !gone.has(e.p));
  if (g.cmScoutReq) g.cmScoutReq = g.cmScoutReq.filter((r) => !gone.has(r.pid));
  dropKeys(g.cmScoutWatch, gone);
  for (const a of Object.values(g.cmScoutAsg ?? {})) a.tab = a.tab.filter((r) => !gone.has(r.pid));
  // kendskab, menneskerne og nyhederne
  const readers = [g, ...(g.humans ?? [])];
  for (const h of readers) {
    dropKeys(h.knowledge, gone);
    dropKeys(h.scoutFinds, gone);
    dropKeys(h.manager?.cmKnowSeen, gone);
    for (const n of h.news ?? []) {
      if (n.link?.kind === 'player' && gone.has(Number(n.link.id))) delete n.link;
      if (n.deals?.some((d) => gone.has(d.player))) n.deals = n.deals.filter((d) => !gone.has(d.player));
    }
    if (h.transferDigest) h.transferDigest = h.transferDigest.filter((d) => !gone.has(d.player));
  }
  // disciplin, arbejdstilladelser, pokalbundne, månedens billede
  if (g.cmDisc) { dropKeys(g.cmDisc.bans, gone); dropKeys(g.cmDisc.ent, gone); g.cmDisc.appeals = g.cmDisc.appeals.filter((a) => !gone.has(a.pid)); }
  dropKeys(g.cmWp?.b, gone);
  dropKeys(g.cmPermit, gone);
  for (const t of Object.values(g.cmCupTied ?? {})) dropKeys(t.m, gone);
  dropKeys(g.monthSnap?.players, gone);
  // landsholdene: puljerne og de gamle trupper (nye udtages fra puljen)
  const sq = g.intl?.cmSq;
  if (sq) {
    for (const pools of Object.values(sq.pool ?? {})) for (const grp of pools) for (let i = 0; i < grp.length; i++) grp[i] = grp[i].filter(keep);
    for (const list of Object.values(sq.sq)) for (const s of list) if (s) s.ids = s.ids.filter(keep);
  }
  // modulernes tilstand (carry.ts): squad-indekset ryddes af removePlayer; lister med spiller-id'er
  const carry = captureCarry() as Record<string, unknown>;
  const ri = carry['transfers.roleIndex'] as { d: string; m: [string, number[]][] } | undefined;
  if (ri) ri.m = ri.m.map(([r, ids]) => [r, ids.filter(keep)]);
  const fit = carry.cmFitnessGame as { sq: [number, number[]][]; linked: boolean } | undefined;
  if (fit) fit.sq = fit.sq.map(([k, ids]) => [k, ids.filter(keep)]);
  const duty = carry['international.duty'] as { date: string; ids: number[] } | undefined;
  if (duty) duty.ids = duty.ids.filter(keep);
  restoreCarry(carry);
}
