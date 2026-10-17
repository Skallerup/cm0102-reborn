// Pressemøder før og efter kampe. Emnerne findes ud fra spillets situation (form, stjerner, skader,
// rivaler, tidligere klubber …). AI formulerer spørgsmålene og klassificerer fritekstsvar, men
// effekterne (moral, fans, bestyrelse, motiveret modstander) bestemmes her af faste regler.
import { A, naturalRole } from './attributes';
import { addDays, ageOn, daysBetween } from './dates';
import { squadStrength } from './board';
import { rivalryInfo } from './careers';
import { bumpFans } from './fans';
import { traits } from './personality';
import { playerComplains, playerPraises } from './will';
import { rng } from './rng';
import { addNews, gs, squad } from './state';
import type { Fixture, Player } from './types';

export type PressKind = 'form' | 'opponent' | 'bigMatch' | 'starPlayer' | 'slump' | 'injury' | 'board' | 'rival' | 'formerClub' | 'unsettled' | 'result' | 'heavyLoss'
  | 'redCard' | 'hero' | 'newSigning' | 'youngster' | 'oppStar' | 'titleRace' | 'relegation' | 'europe' | 'fans' | 'rumour' | 'drought'
  // opfølgende spørgsmål
  | 'followPress' | 'followPromise' | 'followPlayer';
export type Tone = 'confident' | 'calm' | 'fiery' | 'deflect' | 'backPlayer' | 'pressurePlayer' | 'promise' | 'backtrack';

export interface PressTopic {
  id: string;
  kind: PressKind;
  pid?: number;
  params: Record<string, string | number>;
}

export interface PressConf {
  fixture: number;
  phase: 'pre' | 'post';
  opp: number;
  date: string;
  expires: string;
  topics: PressTopic[];
}

const PLAYER_KINDS = new Set<PressKind>(['starPlayer', 'slump', 'unsettled', 'redCard', 'hero', 'newSigning', 'youngster', 'rumour', 'drought']);

export function tonesFor(kind: PressKind): Tone[] {
  if (kind === 'followPromise') return ['promise', 'backtrack'];
  if (kind === 'followPlayer') return ['backPlayer', 'pressurePlayer'];
  if (kind === 'followPress') return ['calm', 'fiery', 'deflect'];
  return PLAYER_KINDS.has(kind) ? ['backPlayer', 'pressurePlayer', 'calm', 'deflect'] : ['confident', 'calm', 'fiery', 'deflect'];
}

/** Deterministisk "tilfældighed" (samme resultat for alle i multiplayer) */
function h01(...parts: (string | number)[]): number {
  let x = 2166136261;
  for (const ch of parts.join('|')) x = Math.imul(x ^ ch.charCodeAt(0), 16777619);
  return ((x >>> 0) % 10000) / 10000;
}

/** Følger journalisterne op på svaret? (samme svar giver altid samme opfølgning) */
export function followUpFor(pc: PressConf, topic: PressTopic, tone: Tone): PressTopic | null {
  if (topic.kind.startsWith('follow')) return null;
  const roll = h01(pc.fixture, pc.date, topic.id, tone);
  const id = `${topic.id}:f`;
  if (tone === 'deflect' && roll < 0.6) return { id, kind: 'followPress', params: topic.params, pid: topic.pid };
  const matchTalk: PressKind[] = ['opponent', 'bigMatch', 'form', 'rival', 'formerClub', 'europe', 'titleRace', 'oppStar'];
  if (pc.phase === 'pre' && (tone === 'confident' || tone === 'fiery') && matchTalk.includes(topic.kind) && roll < 0.65) {
    return { id, kind: 'followPromise', params: { ...topic.params, opp: gs().clubs[pc.opp]?.name ?? '' } };
  }
  if (tone === 'pressurePlayer' && topic.pid && roll < 0.55) return { id, kind: 'followPlayer', params: topic.params, pid: topic.pid };
  return null;
}

/** Hvad et svar betyder (vises som små mærker undervejs og i opsummeringen) */
export function effectsOf(topic: PressTopic, tone: Tone, phase: 'pre' | 'post'): string[] {
  switch (tone) {
    case 'confident': return ['squadUp', 'fansUp', ...(phase === 'pre' && topic.kind !== 'board' ? ['oppMotivated'] : []), ...(topic.kind === 'board' ? ['boardUp'] : [])];
    case 'calm': return ['squadUpSmall'];
    case 'fiery': return ['leadersUp', 'fansUpBig', 'boardDown', ...(phase === 'pre' ? ['oppMotivated'] : [])];
    case 'deflect': return ['fansDown', 'mediaDown'];
    case 'backPlayer': return ['playerUp'];
    case 'pressurePlayer': return ['playerRisk'];
    case 'promise': return ['squadUp', 'fansUp', 'promise'];
    case 'backtrack': return ['fansDownSmall'];
  }
}

const pname = (p: Player) => `${p.first} ${p.last}`.trim();
const avgForm = (p: Player) => (p.form.length ? p.form.reduce((s, x) => s + x, 0) / p.form.length : 0);

function clubForm(clubId: number): string {
  const g = gs();
  const comp = g.comps[g.clubs[clubId]?.league];
  return comp?.table.find((r) => r.club === clubId)?.form ?? '';
}

/** Find emner til et pressemøde */
function topicsFor(f: Fixture, phase: 'pre' | 'post'): PressTopic[] {
  const g = gs();
  const me = g.userClub;
  const opp = f.home === me ? f.away : f.home;
  const oppClub = g.clubs[opp];
  const out: PressTopic[] = [];
  const add = (kind: PressKind, params: Record<string, string | number> = {}, pid?: number) => out.push({ id: `${kind}${pid ?? ''}`, kind, pid, params });
  const sq = squad(me);
  const diff = squadStrength(me) - squadStrength(opp);
  const riv = rivalryInfo(opp);
  if (phase === 'post') {
    const r = f.result;
    if (r) {
      const home = f.home === me;
      const scored = home ? r.hg : r.ag, conceded = home ? r.ag : r.hg;
      if (conceded - scored >= 3) add('heavyLoss', { score: `${scored}-${conceded}`, opp: oppClub?.name ?? '' });
      else add('result', { score: `${scored}-${conceded}`, opp: oppClub?.name ?? '', res: scored > conceded ? 'W' : scored === conceded ? 'D' : 'L' });
    }
  } else {
    if (riv.sackedHere) add('formerClub', { opp: oppClub?.name ?? '', sacked: 1 });
    else if (riv.formerClub) add('formerClub', { opp: oppClub?.name ?? '', sacked: 0 });
    if (riv.manager && riv.record && riv.record[0] + riv.record[1] + riv.record[2] >= 2) add('rival', { manager: `${riv.manager.first} ${riv.manager.last}`, w: riv.record[0], d: riv.record[1], l: riv.record[2] });
    if (Math.abs(diff) >= 10) add('opponent', { opp: oppClub?.name ?? '', fav: diff > 0 ? 1 : 0 });
    const form = clubForm(me);
    if (/WWW$/.test(form) || /LLL$/.test(form)) add('form', { streak: form.slice(-3) === 'WWW' ? 'W' : 'L', n: form.length - form.replace(/(W+|L+)$/, '').length });
  }
  // sidste kamp: røde kort og dagens helt
  const rep = phase === 'post' ? g.reports[f.id] : undefined;
  if (rep) {
    const myIdx = f.home === me ? 0 : 1;
    const red = rep.players.find((l) => l.team === myIdx && l.red);
    if (red && g.players[red.id]) add('redCard', { player: pname(g.players[red.id]) }, red.id);
    const hero = rep.players.filter((l) => l.team === myIdx && (l.goals >= 2 || l.rating >= 8.3)).sort((a, b) => b.goals - a.goals || b.rating - a.rating)[0];
    if (hero && g.players[hero.id]) add('hero', { player: pname(g.players[hero.id]), goals: hero.goals }, hero.id);
  }
  // ligaens situation
  const lg = g.comps[g.clubs[me]?.league ?? ''];
  if (lg?.type === 'league') {
    const rows = lg.table.slice().sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga));
    const pos = rows.findIndex((r) => r.club === me) + 1;
    if ((rows[0]?.p ?? 0) >= 8) {
      if (pos <= 2) add('titleRace', { pos, gap: Math.abs((rows[0]?.pts ?? 0) - (rows[1]?.pts ?? 0)) });
      else if (pos >= rows.length - 2) add('relegation', { pos });
    }
  }
  if (phase === 'pre' && g.comps[f.comp]?.type === 'continental') add('europe', { opp: oppClub?.name ?? '', comp: g.comps[f.comp]?.name ?? '' });
  if ((g.clubs[me]?.fanMood ?? 60) < 40) add('fans', { mood: Math.round(g.clubs[me]?.fanMood ?? 60) });
  if (phase === 'pre' && oppClub) {
    const os = squad(opp).sort((a, b) => (avgForm(b) || b.ca / 25) - (avgForm(a) || a.ca / 25))[0];
    if (os && os.ca >= squadStrength(me)) add('oppStar', { player: pname(os), opp: oppClub.name });
  }
  const signing = sq.filter((p) => p.joined && daysBetween(p.joined, g.date) <= 45 && daysBetween(p.joined, g.date) >= 1 && !p.loan).sort((a, b) => b.ca - a.ca)[0];
  if (signing) add('newSigning', { player: pname(signing) }, signing.id);
  const kid = sq.filter((p) => ageOn(p.dob, g.date) <= 20 && p.stats.apps + p.stats.subs >= 1).sort((a, b) => b.pa - a.pa)[0];
  if (kid) add('youngster', { player: pname(kid), age: ageOn(kid.dob, g.date) }, kid.id);
  const hunted = (g.pursuits ?? []).map((x) => g.players[x.player]).find((p) => p && p.club === me);
  if (hunted) add('rumour', { player: pname(hunted) }, hunted.id);
  const dry = sq.filter((p) => naturalRole(p) === 'ST' && p.stats.apps + p.stats.subs >= 6 && p.stats.goals === 0).sort((a, b) => b.ca - a.ca)[0];
  if (dry) add('drought', { player: pname(dry), apps: dry.stats.apps + dry.stats.subs }, dry.id);
  const star = sq.filter((p) => p.form.length >= 3 && avgForm(p) >= 7.3).sort((a, b) => avgForm(b) - avgForm(a))[0];
  if (star) add('starPlayer', { player: pname(star), form: avgForm(star).toFixed(1) }, star.id);
  const slump = sq.filter((p) => p.form.length >= 3 && avgForm(p) <= 6.1 && p.ca >= squadStrength(me)).sort((a, b) => avgForm(a) - avgForm(b))[0];
  if (slump) add('slump', { player: pname(slump), form: avgForm(slump).toFixed(1) }, slump.id);
  const unsettled = sq.find((p) => p.wantsAway || p.demand?.leaked);
  if (unsettled) add('unsettled', { player: pname(unsettled) }, unsettled.id);
  const injured = sq.filter((p) => p.injury && p.injury.days >= 14).sort((a, b) => b.ca - a.ca)[0];
  if (injured && phase === 'pre') add('injury', { player: pname(injured), days: injured.injury!.days }, injured.id);
  // dårligt forhold til pressen giver flere spørgsmål om ens stilling
  if (g.board.confidence < 35 + Math.max(0, (50 - (g.manager.media ?? 50)) / 2)) add('board', { conf: Math.round(g.board.confidence) });
  if (phase === 'pre' && oppClub && g.clubs[me] && Math.abs(oppClub.rep - g.clubs[me].rep) <= 6 && out.length < 2) add('bigMatch', { opp: oppClub.name });
  // udvalg: det vigtigste først, resten vægtet tilfældigt – antallet af spørgsmål varierer
  const weight: Partial<Record<PressKind, number>> = {
    heavyLoss: 100, result: 60, redCard: 40, formerClub: 35, rival: 30, unsettled: 28, board: 26, hero: 24, titleRace: 22, relegation: 22,
    europe: 20, form: 18, rumour: 15, starPlayer: 14, oppStar: 13, newSigning: 12, slump: 12, drought: 11, fans: 10, youngster: 9, injury: 8, opponent: 7, bigMatch: 6,
  };
  const comp = g.comps[f.comp];
  const big = comp?.type === 'continental' || comp?.type === 'playoff' || (comp?.type === 'cup' && (f.stage === 'F' || f.stage === 'SF')) || out.some((t) => ['heavyLoss', 'formerClub', 'rival', 'titleRace'].includes(t.kind));
  const want = Math.min(out.length, phase === 'post' ? (big ? 3 : 2) + (h01(f.id, 'n') < 0.4 ? 1 : 0) : big ? 4 : 3);
  const picked: PressTopic[] = [];
  const pool = out.slice();
  while (picked.length < want && pool.length) {
    const total = pool.reduce((s2, t) => s2 + (weight[t.kind] ?? 5), 0);
    let x = h01(f.id, phase, picked.length) * total;
    let i = 0;
    for (; i < pool.length - 1; i++) { x -= weight[pool[i].kind] ?? 5; if (x <= 0) break; }
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked.sort((a, b) => (weight[b.kind] ?? 5) - (weight[a.kind] ?? 5));
}

/** Inviter til pressemøde (kaldes for den aktive manager) */
export function invitePress(f: Fixture, phase: 'pre' | 'post') {
  const g = gs();
  if (!g.userClub) return;
  const opp = f.home === g.userClub ? f.away : f.home;
  const comp = g.comps[f.comp];
  const important = comp?.type === 'continental' || comp?.type === 'playoff' || (comp?.type === 'cup' && (f.stage === 'F' || f.stage === 'SF'));
  const topics = topicsFor(f, phase);
  if (!topics.length) return;
  const notable = topics.some((t) => ['heavyLoss', 'formerClub', 'rival', 'unsettled', 'board', 'form'].includes(t.kind));
  if (!important && !notable && !rng.chance(phase === 'pre' ? 0.3 : 0.25)) return;
  // et nyt pressemøde erstatter et ubesvaret (assistenten tog det – ingen straf, så ferie ikke straffes)
  g.press = { fixture: f.id, phase, opp, date: g.date, expires: phase === 'pre' ? f.date : addDays(g.date, 3), topics };
  addNews({ cat: 'general', key: phase === 'pre' ? 'press.invitePre' : 'press.invitePost', params: { opp: g.clubs[opp]?.name ?? '' }, link: { kind: 'press', id: f.id } });
}

/** Dagligt: udløbne pressemøder */
export function expirePress() {
  const g = gs();
  if (g.press && g.date > g.press.expires) g.press = null;
}

/** Manageren har svaret: anvend effekterne (deterministisk – AI-teksten er kun pynt) */
export function applyPress(answers: { topic: string; tone: Tone }[], headline?: string, body?: string): string {
  const g = gs();
  const pc = g.press;
  if (!pc || !g.userClub) return 'expired';
  const club = g.clubs[g.userClub];
  const sq = squad(g.userClub);
  const opp = g.clubs[pc.opp];
  const bumpAll = (d: number) => { for (const p of sq) p.morale = Math.max(1, Math.min(20, p.morale + d)); };
  const media = (d: number) => { g.manager.media = Math.max(0, Math.min(100, (g.manager.media ?? 50) + d)); };
  const done = new Map<string, Tone>();
  for (const a of answers) {
    let topic = pc.topics.find((t) => t.id === a.topic);
    // opfølgende spørgsmål genskabes ud fra svaret på hovedspørgsmålet (deterministisk)
    if (!topic && a.topic.endsWith(':f')) {
      const parent = pc.topics.find((t) => `${t.id}:f` === a.topic);
      const pt = parent ? done.get(parent.id) : undefined;
      topic = parent && pt ? followUpFor(pc, parent, pt) ?? undefined : undefined;
    }
    if (!topic || !tonesFor(topic.kind).includes(a.tone)) continue;
    done.set(topic.id, a.tone);
    const p = topic.pid ? g.players[topic.pid] : undefined;
    media({ confident: 1, calm: 1, fiery: 2, deflect: topic.kind === 'followPress' ? -4 : -3, backPlayer: 0.5, pressurePlayer: 1.5, promise: 2, backtrack: -1 }[a.tone]);
    switch (a.tone) {
      case 'promise':
        bumpAll(0.5);
        bumpFans(club.id, 2, 'pressPromise');
        g.manager.pressPromise = { fixture: pc.fixture, opp: pc.opp };
        break;
      case 'backtrack':
        bumpFans(club.id, -0.5, 'pressDeflect');
        break;
      case 'confident':
        bumpAll(topic.kind === 'heavyLoss' || topic.kind === 'result' ? 0.4 : 0.6);
        bumpFans(club.id, 1.5, 'pressConfident');
        if (pc.phase === 'pre' && opp && topic.kind !== 'board') opp.motivatedUntil = pc.expires;
        if (topic.kind === 'board') g.board.confidence = Math.min(100, g.board.confidence + 2);
        break;
      case 'calm':
        bumpAll(0.2);
        break;
      case 'fiery':
        for (const m of sq) {
          const tr = traits(m);
          m.morale = Math.max(1, Math.min(20, m.morale + (tr.includes('leader') || tr.includes('temperamental') || tr.includes('troublemaker') ? 1 : 0.3)));
        }
        bumpFans(club.id, 2.5, 'pressFiery');
        g.board.confidence = Math.max(0, g.board.confidence - 1.5);
        if (pc.phase === 'pre' && opp) opp.motivatedUntil = pc.expires;
        break;
      case 'deflect':
        bumpFans(club.id, topic.kind === 'followPress' ? -2 : -1, 'pressDeflect');
        break;
      case 'backPlayer':
        if (p) {
          p.morale = Math.min(20, p.morale + 2);
          // spilleren sætter pris på opbakningen offentligt
          if (h01(pc.fixture, p.id, 'thanks') < 0.4) playerPraises(p, 'press');
          if (topic.kind === 'unsettled' && p.wantsAway && rng.chance(0.25)) p.wantsAway = false;
        }
        break;
      case 'pressurePlayer':
        if (p) {
          const tr = traits(p);
          if (tr.includes('professional') || tr.includes('leader') || p.attrs[A.determination] >= 15) { p.morale = Math.min(20, p.morale + 1); p.fired = addDays(g.date, 14); }
          else if (tr.includes('troublemaker') || tr.includes('temperamental')) { p.morale = Math.max(1, p.morale - 3); p.unhappy = Math.min(100, (p.unhappy ?? 0) + 20); playerComplains(p, 'press'); }
          else p.morale = Math.max(1, p.morale - 1.5);
        }
        break;
    }
  }
  const head = (headline ?? '').slice(0, 140);
  addNews({ cat: 'general', key: head ? 'press.report' : 'press.reportPlain', params: { headline: head, body: (body ?? '').slice(0, 700), opp: opp?.name ?? '' } });
  g.press = null;
  return 'ok';
}

/** Efter kampen: blev løftet fra pressemødet holdt? */
export function resolvePressPromise(fixtureId: number, scored: number, conceded: number) {
  const g = gs();
  const pr = g.manager.pressPromise;
  if (!pr || pr.fixture !== fixtureId) return;
  g.manager.pressPromise = undefined;
  const club = g.clubs[g.userClub];
  if (!club) return;
  const opp = g.clubs[pr.opp]?.name ?? '';
  if (scored > conceded) {
    bumpFans(club.id, 3, 'promiseKept');
    g.board.confidence = Math.min(100, g.board.confidence + 2);
    addNews({ cat: 'general', key: 'press.promiseKept', params: { opp } });
  } else {
    bumpFans(club.id, scored === conceded ? -2 : -4, 'promiseBroken');
    g.board.confidence = Math.max(0, g.board.confidence - (scored === conceded ? 1 : 3));
    g.manager.media = Math.max(0, (g.manager.media ?? 50) - 4);
    addNews({ cat: 'general', key: 'press.promiseBroken', params: { opp } });
  }
}

/** Bonus i kampmotoren for en modstander manageren har provokeret */
export function motivation(clubId: number, date: string): number {
  const c = gs().clubs[clubId];
  return c?.motivatedUntil && daysBetween(date, c.motivatedUntil) >= 0 ? 0.3 : 0;
}
