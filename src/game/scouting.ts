// Scouting med usikkerhedsintervaller (forbedring #5).
// Kendskab 0-100 pr. spiller. Attributter vises som interval (fx 12–15), der indsnævres
// jo bedre spilleren er scoutet. Ved 100 vises den præcise værdi som i CM 01/02.
import { hash01 } from './rng';
import { gs, squad } from './state';
import type { Club, Player } from './types';
import { rng } from './rng';
import { A, naturalRole } from './attributes';
import { ageOn } from './dates';

export function initKnowledge() {
  const g = gs();
  g.knowledge = {};
  const club = g.clubs[g.userClub];
  for (const p of Object.values(g.players)) {
    let k = 0;
    if (p.rep >= 80) k = 60;
    else if (p.rep >= 65) k = 35;
    else if (p.rep >= 50) k = 15;
    if (club && p.club && g.clubs[p.club]?.league === club.league) k = Math.max(k, 45);
    if (club && p.nation === club.nation) k = Math.max(k, 20);
    if (k) g.knowledge[p.id] = k;
  }
  if (club) for (const p of squad(club.id)) g.knowledge[p.id] = 100;
}

export function knowledgeOf(p: Player): number {
  const g = gs();
  if (!g.options.masking) return 100;
  if (p.club && p.club === g.userClub) return 100;
  return g.knowledge[p.id] ?? 0;
}

export function addKnowledge(pid: number, amount: number) {
  const g = gs();
  g.knowledge[pid] = Math.min(100, (g.knowledge[pid] ?? 0) + amount);
}

/** Interval for en attribut. Den sande værdi ligger altid i intervallet. */
export function attrRange(p: Player, idx: number, k = knowledgeOf(p)): [number, number] {
  const v = Math.round(p.attrs[idx]);
  if (k >= 100) return [v, v];
  const width = Math.ceil(((100 - k) / 100) * 6);
  const off = Math.floor(hash01(p.id, idx, 17) * (width + 1));
  let lo = v - off;
  let hi = lo + width;
  if (lo < 1) { hi += 1 - lo; lo = 1; }
  if (hi > 20) { lo -= hi - 20; hi = 20; }
  return [Math.max(1, lo), hi];
}

/** Scoutens vurdering af evne/potentiale (0-5 stjerner i halve), relativt til brugerens klub */
export function scoutStars(p: Player): { ability: [number, number]; potential: [number, number] } {
  const g = gs();
  const k = knowledgeOf(p);
  const ref = g.userClub ? clubLevel(g.userClub) : 120;
  const toStars = (ca: number) => Math.max(0.5, Math.min(5, Math.round(((ca - ref + 50) / 20) * 2) / 2));
  const a = toStars(p.ca);
  const pot = toStars(p.pa);
  const unc = k >= 90 ? 0 : k >= 60 ? 0.5 : k >= 25 ? 1 : 1.5;
  const off = Math.round(hash01(p.id, 3) * unc * 2) / 2;
  return {
    ability: [Math.max(0.5, a - off), Math.min(5, a - off + unc)],
    potential: [Math.max(0.5, pot - off), Math.min(5, pot - off + unc + (k < 60 ? 0.5 : 0))],
  };
}

const levelCache = new Map<string, number>();
export function clubLevel(cid: number): number {
  const g = gs();
  const key = `${cid}-${g.date.slice(0, 7)}`;
  const c = levelCache.get(key);
  if (c !== undefined) return c;
  const ps = squad(cid).map((p) => p.ca).sort((a, b) => b - a).slice(0, 14);
  const v = ps.length ? ps.reduce((s, x) => s + x, 0) / ps.length : 100;
  levelCache.set(key, v);
  return v;
}

/** Dagligt: scouts arbejder på deres opgaver */
export function scoutDaily() {
  const g = gs();
  if (!g.userClub) return;
  const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout');
  for (const s of scouts) {
    const a = s.assignment;
    const skill = (s.attrs.judgingAbility + s.attrs.judgingPotential) / 40;
    if (!a) {
      // Uden opgave: scouter tilfældige spillere i egen liga
      if (rng.chance(0.3)) {
        const club = g.clubs[g.userClub];
        const clubs = Object.values(g.clubs).filter((c) => c.league === club.league && c.id !== club.id);
        const other = rng.pick(clubs);
        if (other) for (const p of squad(other.id).slice(0, 3)) scoutKnowledge(p.id, 6 * skill, s.id);
      }
      continue;
    }
    if (a.kind === 'player') {
      const pid = a.target as number;
      scoutKnowledge(pid, 9 + 8 * skill, s.id);
      if ((g.knowledge[pid] ?? 0) >= 100) {
        s.assignment = null;
        const p = g.players[pid];
        if (p) g.news.unshift({ id: g.nextId.news++, date: g.date, cat: 'scout', key: 'news.scoutDone', params: { scout: `${s.first} ${s.last}`, player: `${p.first} ${p.last}` }, read: false, link: { kind: 'player', id: pid } });
      }
    } else {
      const clubs = Object.values(g.clubs).filter((c) => (a.kind === 'nation' ? c.nation === a.target : c.league === a.target));
      for (let i = 0; i < 3; i++) {
        const c = rng.pick(clubs);
        if (!c) break;
        const ps = squad(c.id);
        const p = rng.pick(ps);
        if (p) scoutKnowledge(p.id, 18 * skill + 6, s.id);
      }
    }
  }
}

/** Kendskab fra en scout: når en spiller er godt afdækket, kommer han på listen over fund */
function scoutKnowledge(pid: number, amount: number, scoutId: number) {
  const g = gs();
  const before = g.knowledge[pid] ?? 0;
  addKnowledge(pid, amount);
  if (before < 60 && (g.knowledge[pid] ?? 0) >= 60) {
    const finds = g.scoutFinds ?? (g.scoutFinds = {});
    finds[pid] = g.date;
    const p = g.players[pid];
    const s = g.staff[scoutId];
    // Gode fund meldes i indbakken
    if (p && s && p.club !== g.userClub && scoutStars(p).potential[0] >= 4) {
      g.news.unshift({ id: g.nextId.news++, date: g.date, cat: 'scout', key: 'news.scoutTalent', params: { scout: `${s.first} ${s.last}`, player: `${p.first} ${p.last}` }, read: false, link: { kind: 'player', id: pid } });
    }
  }
}

/** Efter en kamp kender man modstanderens spillere bedre */
export function knowledgeAfterMatch(oppClub: number, playerIds: number[]) {
  for (const id of playerIds) addKnowledge(id, 15);
  void oppClub;
}

// ---------- scoutens anbefaling ----------

export interface ScoutRecommendation {
  /** 0 = køb ham!, 1 = anbefales, 2 = brugbar, 3 = ikke bedre end det vi har, 4 = frarådes, -1 = for lidt viden */
  level: number;
  key: string;
  reasons: { key: string; params?: Record<string, string | number> }[];
}

/** Kort vurdering fra scouten: anbefaler han spilleren eller ej? */
export function scoutRecommendation(p: Player): ScoutRecommendation {
  const g = gs();
  const k = knowledgeOf(p);
  if (k < 35) return { level: -1, key: 'rec.unknown', reasons: [] };
  const club = g.clubs[g.userClub];
  if (!club) return { level: -1, key: 'rec.unknown', reasons: [] };
  const age = ageOn(p.dob, g.date);
  // sammenlign med de bedste i truppen på hans rolle
  const role = naturalRole(p);
  const mates = squad(club.id).filter((x) => x.id !== p.id && naturalRole(x) === role).sort((a, b) => b.ca - a.ca);
  const best = mates[0]?.ca ?? 0;
  const second = mates[1]?.ca ?? 0;
  const level = clubLevel(club.id);
  // scouten ser ikke den præcise evne – vurderingen bygger på stjernerne (med usikkerhed)
  const st = scoutStars(p);
  const ref = level;
  const estCA = ref - 50 + ((st.ability[0] + st.ability[1]) / 2) * 20;
  const estPA = ref - 50 + ((st.potential[0] + st.potential[1]) / 2) * 20;
  const reasons: ScoutRecommendation['reasons'] = [];
  let score = 0;
  if (estCA >= best + 5) { score += 3; reasons.push({ key: 'rec.r.betterThanBest' }); }
  else if (estCA >= second) { score += 1.5; reasons.push({ key: 'rec.r.firstTeam' }); }
  else if (estCA >= level - 15) { score += 0.5; reasons.push({ key: 'rec.r.squad' }); }
  else { score -= 1.5; reasons.push({ key: 'rec.r.notGoodEnough' }); }
  if (age <= 21 && estPA >= level + 5) { score += 2; reasons.push({ key: 'rec.r.talent', params: { age } }); }
  else if (age <= 23 && estPA > estCA + 8) { score += 0.8; reasons.push({ key: 'rec.r.canGrow' }); }
  if (age >= 31) { score -= 1; reasons.push({ key: 'rec.r.old', params: { age } }); }
  if (mates.length <= 1) { score += 0.8; reasons.push({ key: 'rec.r.weNeed' }); }
  // pris og vilkår
  const fee = p.club ? askingPriceSafe(p) : 0;
  if (!p.club) { score += 0.8; reasons.push({ key: 'rec.r.free' }); }
  else if (fee > club.transferBudget * 1.2) { score -= fee > club.transferBudget * 2 ? 3 : 1.5; reasons.unshift({ key: 'rec.r.tooExpensive' }); }
  else if (p.value > fee * 1.3) { score += 0.6; reasons.push({ key: 'rec.r.bargain' }); }
  if (interestFn(p, club) !== 'yes') { score -= 2; reasons.unshift({ key: 'rec.r.wontCome' }); }
  if (p.attrs[A.injuryProneness] >= 15 && k >= 70) { score -= 0.8; reasons.push({ key: 'rec.r.injuryProne' }); }
  if (p.attrs[A.professionalism] >= 15 && k >= 70) { score += 0.3; reasons.push({ key: 'rec.r.professional' }); }
  if (p.attrs[A.temperament] <= 6 && k >= 70) { score -= 0.4; reasons.push({ key: 'rec.r.temper' }); }
  const lvl = score >= 3.5 ? 0 : score >= 2 ? 1 : score >= 0.8 ? 2 : score >= -0.5 ? 3 : 4;
  return { level: lvl, key: `rec.l${lvl}`, reasons: reasons.slice(0, 3) };
}

// undgå cirkulær import: transfers → scouting → transfers
let askingPriceSafe: (p: Player) => number = (p) => p.value;
let interestFn: (p: Player, c: Club) => string = () => 'yes';
export function registerAskingPrice(fn: (p: Player) => number, interest?: (p: Player, c: Club) => string) {
  askingPriceSafe = fn;
  if (interest) interestFn = interest;
}
