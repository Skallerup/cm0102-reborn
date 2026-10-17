// Pressemøder før og efter kampe. Emnerne findes ud fra spillets situation (form, stjerner, skader,
// rivaler, tidligere klubber …). AI formulerer spørgsmålene og klassificerer fritekstsvar, men
// effekterne (moral, fans, bestyrelse, motiveret modstander) bestemmes her af faste regler.
import { A } from './attributes';
import { addDays, daysBetween } from './dates';
import { squadStrength } from './board';
import { rivalryInfo } from './careers';
import { bumpFans } from './fans';
import { traits } from './personality';
import { rng } from './rng';
import { addNews, gs, squad } from './state';
import type { Fixture, Player } from './types';

export type PressKind = 'form' | 'opponent' | 'bigMatch' | 'starPlayer' | 'slump' | 'injury' | 'board' | 'rival' | 'formerClub' | 'unsettled' | 'result' | 'heavyLoss';
export type Tone = 'confident' | 'calm' | 'fiery' | 'deflect' | 'backPlayer' | 'pressurePlayer';

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

const PLAYER_KINDS = new Set<PressKind>(['starPlayer', 'slump', 'unsettled']);

export function tonesFor(kind: PressKind): Tone[] {
  return PLAYER_KINDS.has(kind) ? ['backPlayer', 'pressurePlayer', 'calm', 'deflect'] : ['confident', 'calm', 'fiery', 'deflect'];
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
  const star = sq.filter((p) => p.form.length >= 3 && avgForm(p) >= 7.3).sort((a, b) => avgForm(b) - avgForm(a))[0];
  if (star) add('starPlayer', { player: pname(star), form: avgForm(star).toFixed(1) }, star.id);
  const slump = sq.filter((p) => p.form.length >= 3 && avgForm(p) <= 6.1 && p.ca >= squadStrength(me)).sort((a, b) => avgForm(a) - avgForm(b))[0];
  if (slump) add('slump', { player: pname(slump), form: avgForm(slump).toFixed(1) }, slump.id);
  const unsettled = sq.find((p) => p.wantsAway || p.demand?.leaked);
  if (unsettled) add('unsettled', { player: pname(unsettled) }, unsettled.id);
  const injured = sq.filter((p) => p.injury && p.injury.days >= 14).sort((a, b) => b.ca - a.ca)[0];
  if (injured && phase === 'pre') add('injury', { player: pname(injured), days: injured.injury!.days }, injured.id);
  if (g.board.confidence < 35) add('board', { conf: Math.round(g.board.confidence) });
  if (phase === 'pre' && oppClub && g.clubs[me] && Math.abs(oppClub.rep - g.clubs[me].rep) <= 6 && out.length < 2) add('bigMatch', { opp: oppClub.name });
  // højst tre spørgsmål – de mest presserende først
  const prio: PressKind[] = ['heavyLoss', 'result', 'formerClub', 'rival', 'unsettled', 'board', 'form', 'starPlayer', 'slump', 'injury', 'opponent', 'bigMatch'];
  return out.sort((a, b) => prio.indexOf(a.kind) - prio.indexOf(b.kind)).slice(0, 3);
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
  for (const a of answers) {
    const topic = pc.topics.find((t) => t.id === a.topic);
    if (!topic || !tonesFor(topic.kind).includes(a.tone)) continue;
    const p = topic.pid ? g.players[topic.pid] : undefined;
    switch (a.tone) {
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
        bumpFans(club.id, -1, 'pressDeflect');
        break;
      case 'backPlayer':
        if (p) {
          p.morale = Math.min(20, p.morale + 2);
          if (topic.kind === 'unsettled' && p.wantsAway && rng.chance(0.25)) p.wantsAway = false;
        }
        break;
      case 'pressurePlayer':
        if (p) {
          const tr = traits(p);
          if (tr.includes('professional') || tr.includes('leader') || p.attrs[A.determination] >= 15) { p.morale = Math.min(20, p.morale + 1); p.fired = addDays(g.date, 14); }
          else if (tr.includes('troublemaker') || tr.includes('temperamental')) { p.morale = Math.max(1, p.morale - 3); p.unhappy = Math.min(100, (p.unhappy ?? 0) + 20); }
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

/** Bonus i kampmotoren for en modstander manageren har provokeret */
export function motivation(clubId: number, date: string): number {
  const c = gs().clubs[clubId];
  return c?.motivatedUntil && daysBetween(date, c.motivatedUntil) >= 0 ? 0.3 : 0;
}
