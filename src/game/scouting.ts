// Scouting med usikkerhedsintervaller (forbedring #5).
// Kendskab 0-100 pr. spiller. Attributter vises som interval (fx 12–15), der indsnævres
// jo bedre spilleren er scoutet. Ved 100 vises den præcise værdi som i CM 01/02.
import { needsWorkPermit, workPermitGranted } from './rules2001';
import { regionOf } from './leagues';
import { natName } from '../i18n';
import { hash01 } from './rng';
import { addNews, gs, squad } from './state';
import type { Club, Player, ScoutAssignment } from './types';
import { rng } from './rng';
import { A, naturalRole, roleScore } from './attributes';
import { ageOn, daysBetween } from './dates';

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

/** Scoutens vurdering af evne/potentiale (0-5 stjerner i halve) på en fast skala for alle spillere */
export const starsOf = (ca: number) => (ca - 40) / 30;
export const caOfStars = (stars: number) => 40 + stars * 30;
/**
 * Realistisk potentiale: hvad spilleren kan nå i sin alder. Unge kan nå hele deres loft; fra midten af
 * 20'erne vokser man kun lidt (se udviklingsmodellen), og fra 29 år er potentialet = evnen.
 */
export function effectivePA(p: Player): number {
  const age = ageOn(p.dob, gs().date);
  if (age <= 23) return Math.max(p.ca, p.pa);
  const share = age >= 29 ? 0 : [0.45, 0.35, 0.25, 0.15, 0.05][age - 24];
  return p.ca + Math.max(0, p.pa - p.ca) * share;
}

/** CA-ækvivalent af egenskaberne på spillerens naturlige plads (målt mod databaserne: CA ≈ 27 + 6,7 × rollescore, r ≈ 0,85) */
export function attrAbility(p: Player): number {
  return Math.round(27 + 6.7 * roleScore(p, naturalRole(p)));
}

export function scoutStars(p: Player): { ability: [number, number]; potential: [number, number] } {
  const k = knowledgeOf(p);
  // absolut skala for alle spillere, uanset hvilken klub man styrer: 5 ★ = CA/PA 190+ (verdens bedste),
  // 4 ★ = 160, 3 ★ = 130, 2 ★ = 100, 1 ★ = 70 (30 pr. stjerne)
  const toStars = (ca: number) => Math.max(0.5, Math.min(5, Math.round(starsOf(ca) * 2) / 2));
  // kampmotoren spiller med egenskaberne: en spiller, hvis egenskaber på hans bedste plads er bedre end CA'en siger
  // (fx Tsigalko), vurderes efter dem – aldrig lavere end CA. Potentialet får halvdelen af løftet (forspringet mindskes, når CA vokser).
  const attrCA = attrAbility(p);
  const lift = Math.max(0, attrCA - p.ca);
  const a = toStars(p.ca + lift);
  const eff = effectivePA(p) + lift * 0.5;
  const pot = toStars(eff);
  // ekstra usikkerhed om potentialet kun når der er plads til at udvikle sig
  const growUnc = k < 60 && eff > p.ca + 3 ? 0.5 : 0;
  const unc = k >= 90 ? 0 : k >= 60 ? 0.5 : k >= 25 ? 1 : 1.5;
  // spejderens bud ligger omkring den sande værdi (lige så tit for højt som for lavt); intervallet er buddet ± halv
  // usikkerhed. Før lå den sande værdi i toppen af intervallet, så ukendte spillere altid så for dårlige ud.
  const noise = Math.round((hash01(p.id, 3) - 0.5) * unc * 2) / 2;
  const range = (v: number, extra = 0): [number, number] => {
    const est = Math.max(0.5, Math.min(5, v + noise));
    return [Math.max(0.5, Math.floor((est - unc / 2) * 2) / 2), Math.min(5, Math.ceil((est + unc / 2 + extra) * 2) / 2)];
  };
  return { ability: range(a), potential: range(pot, growUnc) };
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
  // CM 01/02: påmindelser om scoutens kontrakt 12, 6, 3 og 2 måneder, 1 måned og 1 uge før udløb
  for (const s of scouts) {
    if (!s.expires) continue;
    const left = daysBetween(g.date, s.expires);
    if ([365, 182, 91, 61, 30, 7].includes(left)) addNews({ cat: 'contract', key: 'scout.contractReminder', params: { scout: `${s.first} ${s.last}`, date: s.expires, days: left } });
  }
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
        if (p) scoutReport(`${s.first} ${s.last}`, p);
      }
    } else {
      // turen er slut: scouten vender hjem med en rapport
      if (a.until && g.date >= a.until) {
        scoutReturns(s.first + ' ' + s.last, a);
        s.assignment = null;
        continue;
      }
      // næste modstander: følg den kommende modstanders trup; efter kampen afleveres rapporten
      if (a.kind === 'nextOpp') {
        const nx = nextOpponent();
        if (!nx) { s.assignment = null; continue; }
        a.target = nx.opp;
        for (const p of squad(nx.opp).sort((x, y) => y.ca - x.ca).slice(0, 16)) scoutKnowledge(p.id, 10 * skill + 4, s.id);
        // rapporten kommer to dage før kampen (én pr. modstander)
        if (a.reported !== nx.opp && daysBetween(g.date, nx.date) <= 2) { scoutOppReport(s, nx.opp); a.reported = nx.opp; }
        continue;
      }
      const clubs = Object.values(g.clubs).filter((c) => (a.kind === 'nation' ? c.nation === a.target
        : a.kind === 'club' ? c.id === a.target
        : a.kind === 'region' ? regionOf(g.nations[c.nation]?.name) === a.target
        : a.kind === 'youth' ? c.id !== g.userClub && !g.leagues[c.league]?.hidden
        : c.league === a.target));
      // hele klubben afdækket: "[klub] scouting completed"
      if (a.kind === 'club' && clubs[0] && squad(clubs[0].id).every((p) => (g.knowledge[p.id] ?? 0) >= 60)) {
        addNews({ cat: 'scout', key: 'scout.clubDone', params: { scout: `${s.first} ${s.last}`, club: clubs[0].name, n: squad(clubs[0].id).length }, link: { kind: 'club', id: clubs[0].id } });
        s.assignment = null;
        continue;
      }
      // en gang om måneden: status ("has found [n] suitable players so far")
      if (g.date.endsWith('-01') && a.since && a.since < g.date && a.kind !== 'club') addNews({ cat: 'scout', key: 'scout.update', params: { scout: `${s.first} ${s.last}`, ...scoutTarget(a), n: a.found?.length ?? 0 } });
      // scoutens skøn af en evne: dårlige scouts tager mere fejl (deterministisk pr. spiller og scout)
      const judged = (p: Player, idx: number) => p.attrs[idx] + (hash01(p.id, idx, s.id) - 0.5) * (20 - s.attrs.judgingAbility) / 3;
      const fits = (p: Player) => {
        const age = ageOn(p.dob, g.date);
        if (a.focus === 'young' && age > 21) return false;
        if (a.kind === 'youth' && (age > 19 || p.pa < 120)) return false;
        if (a.focus === 'prime' && (age < 22 || age > 29)) return false;
        if (a.role && naturalRole(p) !== a.role) return false;
        if (a.maxValue && p.value > a.maxValue) return false;
        if (a.attr !== undefined && a.attr >= 0 && judged(p, a.attr) < (a.attrMin ?? 1) - 0.5) return false;
        return true;
      };
      // scouten følger to spillere ad gangen, til de er afdækket, og finder så nye blandt dem der passer
      const queue = (a.queue ??= []).filter((id) => g.players[id] && (g.knowledge[id] ?? 0) < 60);
      if (queue.length < 2) {
        const strict = a.role || (a.attr !== undefined && a.attr >= 0) || a.maxValue || a.kind === 'youth';
        const pool = strict
          ? clubs.flatMap((c) => squad(c.id)).filter((x) => x.club !== g.userClub && (g.knowledge[x.id] ?? 0) < 60 && !queue.includes(x.id) && fits(x))
          : [];
        // urealistiske spillere (vil ikke komme, sælges ikke, alt for dyre) springes over
        for (let tries = 0; queue.length < 2 && tries < 14; tries++) {
          let p: Player | undefined;
          if (strict) p = rng.pick(pool.filter((x) => !queue.includes(x.id)));
          else { const c = rng.pick(clubs); p = c ? rng.pick(squad(c.id).filter((x) => fits(x) && (g.knowledge[x.id] ?? 0) < 60 && !queue.includes(x.id))) : undefined; }
          if (p && realistic(p)) queue.push(p.id);
          else if (p && strict) pool.splice(pool.indexOf(p), 1);
        }
      }
      a.queue = queue;
      for (const id of queue) scoutKnowledge(id, 18 * skill + 6, s.id);
    }
  }
}

/** Opgavens mål som tekst-parametre til nyhederne (land/liga/klub/region – oversættes i newsParams via targetKey) */
export function scoutTarget(a: ScoutAssignment): { target: string; targetKey?: string } {
  const g = gs();
  if (a.kind === 'nation') return { target: natName(g.nations[a.target as number]?.name) || '?' };
  if (a.kind === 'league') return { target: g.leagues[a.target as string]?.name ?? String(a.target) };
  if (a.kind === 'club') return { target: g.clubs[a.target as number]?.name ?? '?' };
  if (a.kind === 'region') return { target: String(a.target), targetKey: `region.${a.target}` };
  if (a.kind === 'nextOpp') return { target: '', targetKey: 'scout.t.nextOpp' };
  if (a.kind === 'youth') return { target: '', targetKey: 'scout.t.youth' };
  return { target: '' };
}

/** En opgave begynder (CM 01/02: "Scout [navn] has started his … search, and will report back with his findings") */
export function startScoutAssignment(staffId: number, a: ScoutAssignment | null) {
  const g = gs();
  const s = g.staff[staffId];
  if (!s || s.club !== g.userClub) return;
  s.assignment = a;
  if (a && a.kind !== 'player') addNews({ cat: 'scout', key: 'scout.started', params: { scout: `${s.first} ${s.last}`, ...scoutTarget(a) } });
}

/** Næste modstander for brugerens klub */
function nextOpponent(): { opp: number; date: string } | undefined {
  const g = gs();
  const f = Object.values(g.fixtures).filter((x) => !x.result && x.date >= g.date && (x.home === g.userClub || x.away === g.userClub)).sort((x, y) => x.date.localeCompare(y.date))[0];
  return f ? { opp: f.home === g.userClub ? f.away : f.home, date: f.date } : undefined;
}

/** En scout vender hjem: rapport med antal fund og det bedste talent */
function scoutReturns(name: string, a: ScoutAssignment) {
  const g = gs();
  const found = (a.found ?? []).map((id) => g.players[id]).filter((p): p is Player => !!p && realistic(p));
  const best = found.sort((x, y) => { const sx = scoutStars(x), sy = scoutStars(y); return sy.potential[0] + sy.ability[0] - (sx.potential[0] + sx.ability[0]); })[0];
  const key = found.length === 0 ? 'scout.doneNone' : found.length === 1 ? 'scout.doneOne' : 'news.scoutReturned';
  addNews({ cat: 'scout', key, params: { scout: name, ...scoutTarget(a), n: found.length, best: best ? `${best.first} ${best.last}`.trim() : '–' }, ...(best ? { link: { kind: 'player' as const, id: best.id } } : {}) });
}

/**
 * CM 01/02's scoutrapport: hvor scouten så ham (en bestemt kamp eller "during recent weeks"), dommen på originalens skala
 * (fra "an excellent prospect who could make an immediate impact" til "not good enough to play for [klub]"), en styrke,
 * en særlig evne, en svaghed – og en advarsel om arbejdstilladelse (kun den originale database).
 */
export function scoutReport(scout: string, p: Player) {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return;
  const rec = scoutRecommendation(p);
  const age = ageOn(p.dob, g.date);
  const st = scoutStars(p);
  const young = age <= 21;
  const growth = (st.potential[0] + st.potential[1]) / 2 - (st.ability[0] + st.ability[1]) / 2 >= 1;
  const estCA = caOfStars((st.ability[0] + st.ability[1]) / 2);
  const level = clubLevel(club.id);
  const v = rec.level === 0 ? (young ? 1 : 2) : rec.level === 1 ? (young && growth ? 3 : 4) : rec.level === 2 ? (young ? 5 : 6)
    : rec.level === 3 ? (young && growth ? 7 : 8) : estCA >= level - 15 ? 9 : estCA >= level - 30 ? 11 : 12;
  // hvor: hans klubs seneste kamp, ellers "i de seneste uger"
  const last = p.club ? Object.values(g.fixtures).filter((f) => f.result && (f.home === p.club || f.away === p.club)).sort((a, b) => b.date.localeCompare(a.date))[0] : undefined;
  const ctx: Record<string, string | number> = {};
  if (last?.result) {
    const home = last.home === p.club;
    const gf = home ? last.result.hg : last.result.ag, ga = home ? last.result.ag : last.result.hg;
    Object.assign(ctx, { ctx: gf > ga ? 'win' : gf === ga ? 'draw' : 'loss', score: `${gf}-${ga}`, opp: g.clubs[home ? last.away : last.home]?.name ?? '', club: g.clubs[p.club]?.name ?? '' });
  } else Object.assign(ctx, { ctx: 'weeks', age, pos: naturalRole(p) });
  const pick = (cands: [string, boolean][]) => cands.find(([, ok]) => ok)?.[0] ?? '';
  const strength = pick([['loyalty', p.attrs[A.loyalty] >= 16], ['professionalism', p.attrs[A.professionalism] >= 16], ['bigGames', p.attrs[A.importantMatches] >= 16], ['consistency', p.attrs[A.consistency] >= 16], ['determination', p.attrs[A.determination] >= 17]]);
  const skill = pick([['corners', p.attrs[A.corners] >= 16], ['freeKicks', p.attrs[A.freeKicks] >= 16], ['penalties', p.attrs[A.penalties] >= 16], ['longThrows', p.attrs[A.throwIns] >= 16], ['heading', p.attrs[A.heading] >= 17]]);
  const weakness = pick([['lazy', p.attrs[A.professionalism] <= 5], ['temper', p.attrs[A.temperament] <= 5], ['injuries', p.attrs[A.injuryProneness] >= 15], ['inconsistent', p.attrs[A.consistency] <= 5], ['dirty', p.attrs[A.dirtiness] >= 16]]);
  const permit = needsWorkPermit(p, club) && !workPermitGranted(p) ? 1 : 0;
  addNews({ cat: 'scout', key: 'scout.report', params: { scout, player: `${p.first} ${p.last}`.trim(), myClub: club.name, verdict: v, strength, skill, weakness, permit, ...ctx }, link: { kind: 'player', id: p.id } });
}

/** Rapport om modstanderen efter kampen er sat i gang: hans farligste spillere */
function scoutOppReport(s: { first: string; last: string }, opp: number) {
  const g = gs();
  const c = g.clubs[opp];
  if (!c) return;
  const top = squad(opp).filter((p) => !p.injury && !p.banned).sort((x, y) => y.ca - x.ca).slice(0, 3).map((p) => `${p.first} ${p.last}`.trim());
  addNews({ cat: 'scout', key: 'scout.oppReport', params: { scout: `${s.first} ${s.last}`, club: c.name, players: top.join(', ') }, link: { kind: 'club', id: opp } });
}

/** Kendskab fra en scout: når en spiller er godt afdækket, kommer han på listen over fund */
function scoutKnowledge(pid: number, amount: number, scoutId: number) {
  const g = gs();
  const before = g.knowledge[pid] ?? 0;
  addKnowledge(pid, amount);
  if (before < 60 && (g.knowledge[pid] ?? 0) >= 60) {
    const finds = g.scoutFinds ?? (g.scoutFinds = {});
    finds[pid] = g.date;
    const asg = g.staff[scoutId]?.assignment;
    if (asg && asg.kind !== 'player') (asg.found ??= []).push(pid);
    const p = g.players[pid];
    const s = g.staff[scoutId];
    // Gode fund meldes i indbakken
    if (p && s && p.club !== g.userClub && scoutStars(p).potential[0] >= 4 && realistic(p)) {
      addNews({ cat: 'scout', key: 'news.scoutTalent', params: { scout: `${s.first} ${s.last}`, player: `${p.first} ${p.last}` }, link: { kind: 'player', id: pid } });
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
  /** god nok, men urealistisk at hente (klubben sælger ikke, eller han kommer ikke) */
  out?: boolean;
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
  const estCA = caOfStars((st.ability[0] + st.ability[1]) / 2);
  const estPA = caOfStars((st.potential[0] + st.potential[1]) / 2);
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
  let lvl = score >= 3.5 ? 0 : score >= 2 ? 1 : score >= 0.8 ? 2 : score >= -0.5 ? 3 : 4;
  // urealistiske handler anbefales aldrig – højst "brugbar" hvis han er lidt svær at hente
  const real = realismFn(p);
  // god nok, men urealistisk: "uden for rækkevidde" – ikke "ikke bedre end det, vi har"
  let out = false;
  if (real >= 2) { out = lvl < 3; lvl = Math.max(lvl, 3); if (!reasons.some((r) => r.key === 'rec.r.wontCome' || r.key === 'rec.r.tooExpensive')) reasons.unshift({ key: 'rec.r.unrealistic' }); }
  else if (real === 1 && lvl === 0) { lvl = 1; reasons.push({ key: 'rec.r.hard' }); }
  return { level: lvl, key: out ? 'rec.lOut' : `rec.l${lvl}`, reasons: reasons.slice(0, 3), out };
}

// undgå cirkulær import: transfers → scouting → transfers
let askingPriceSafe: (p: Player) => number = (p) => p.value;
let interestFn: (p: Player, c: Club) => string = () => 'yes';
/** Transfer-realisme for brugerens klub (0 realistisk, 1 måske, 2 urealistisk) */
let realismFn: (p: Player) => number = () => 0;
export function registerAskingPrice(fn: (p: Player) => number, interest?: (p: Player, c: Club) => string, realism?: (p: Player) => number) {
  askingPriceSafe = fn;
  if (interest) interestFn = interest;
  if (realism) realismFn = realism;
}

/** Kan klubben realistisk hente spilleren? Scouterne bruger ikke tid på urealistiske mål */
function realistic(p: Player): boolean {
  return p.club === gs().userClub || realismFn(p) < 2;
}
