// Originalens kommentarlinjer fra CM 01/02 (events_eng.cfg / events_dan.cfg, se scripts/build-match-texts.py).
// Hver af motorens linjetyper oversættes til en eller flere af originalens begivenheder, fx et skud + redningen.
// Engelsk og dansk er originalens egne; de øvrige sprog er oversat (scripts/match-texts-i18n/).
import type { CommentaryLine } from '../game/types';

type Row = [number, string, string, Record<string, string>?];
let data: Record<string, Row[]> | null = null;
let loading: Promise<void> | null = null;

/** Hent teksterne (eget bundt, ca. 300 KB) – kaldes, når kampskærmen åbnes */
export function loadMatchTexts(): Promise<void> {
  loading ??= import('./data/matchTexts.json').then((m) => { data = (m.default ?? m) as unknown as Record<string, Row[]>; }).catch(() => { loading = null; });
  return loading;
}

/** Ét trin: en af begivenhederne; p1/p2 = hvilken af linjens spillere (a/b); other = holdnavnet er modstanderens */
interface Step { ev: string[]; p1?: 'a' | 'b'; p2?: 'a' | 'b'; other?: boolean; only?: RegExp; raw?: 'score' }

const SHOT = ['SHOT_LOW_DRIVE', 'SHOT_HIGH_DRIVE', 'SHOT_BANANA', 'SHOT_VOLLEY', 'SHOT_HALF_VOLLEY'];
const LONG = ['SHOT_FROM_DISTANCE_LOW_DRIVE', 'SHOT_FROM_DISTANCE_HIGH_DRIVE', 'SHOT_FROM_DISTANCE_BANANA', 'SHOT_FROM_DISTANCE_VOLLEY', 'SHOT_FROM_DISTANCE_HALF_VOLLEY'];
const HEAD = ['SHOT_HEADER', 'SHOT_DIVING_HEADER'];
const FOULS = ['FOUL', 'FOUL_TRIP', 'FOUL_SHIRT_TUG', 'FOUL_PUSH_OPPONENT', 'FOUL_BLOCK_TACKLE', 'FOUL_SLIDE_TACKLE'];
const s = (ev: string | string[], p1?: 'a' | 'b', more: Partial<Step> = {}): Step => ({ ev: Array.isArray(ev) ? ev : [ev], p1, ...more });

/** Motorens linjetyper → originalens begivenheder (typer uden en passende begivenhed beholder vores egne tekster) */
const MAP: Record<string, Step[]> = {
  kickoff: [s('START_MATCH')],
  halftime: [s('HALF_TIME_WHISTLE'), { ev: [], raw: 'score' }],
  fulltime: [s('FINAL_WHISTLE'), { ev: [], raw: 'score' }],
  extratime: [s('END_OF_NINETY_MINUTES')],
  'added-time': [s('TIME_ADDED_ON')],
  goal: [s(SHOT, 'a'), s('GOAL_ONE', 'a')],
  'goal-header': [s(HEAD, 'a'), s('GOAL_ONE', 'a')],
  'goal-long': [s(LONG, 'a'), s('GOAL_ONE', 'a')],
  'goal-pen': [s('TAKE_PENALTY', 'a'), s('SCORED_PENALTY', 'a')],
  'goal-fk': [s('SHOT_FREE_KICK', 'a'), s('GOAL_ONE', 'a')],
  'goal-1v1': [s('CLEAN_THROUGH', 'a'), s('GOAL_ONE', 'a')],
  'goal-cheer': [s('GOAL_ONE', 'a')],
  'own-goal': [s('GOAL_TWO', 'a')],
  'goal-offside': [s('GOAL_DISALLOWED', undefined, { only: /linesman/i })],
  save: [s(SHOT, 'a'), s(['GOOD_SAVE_HELD', 'GOOD_SAVE_NOT_HELD'], 'b', { other: true })],
  bigsave: [s(SHOT, 'a'), s(['GREAT_SAVE_HELD', 'GREAT_SAVE_NOT_HELD'], 'b', { other: true })],
  'header-saved': [s(HEAD, 'a'), s('GOOD_SAVE_HELD', 'b', { other: true })],
  wide: [s(SHOT, 'a'), s(['SHOT_WIDE', 'SHOT_OVER', 'SHOT_JUST_WIDE', 'SHOT_JUST_OVER', 'SHOT_OVER_WIDE'], 'a')],
  'long-wide': [s(LONG, 'a'), s(['SHOT_WELL_WIDE', 'SHOT_WELL_OVER', 'SHOT_WIDE', 'SHOT_OVER'], 'a')],
  'header-wide': [s(HEAD, 'a'), s(['SHOT_WELL_OVER_HEADER', 'SHOT_WIDE'], 'a')],
  'miss-1v1': [s('CLEAN_THROUGH', 'a'), s(['SHOT_WIDE', 'SHOT_JUST_WIDE'], 'a'), s('MISSED_EASY_CHANCE_CLOSE')],
  post: [s(SHOT, 'a'), s(['SHOT_HITS_POST', 'SHOT_HITS_BAR', 'SHOT_CLIPS_POST', 'SHOT_CLIPS_BAR'], 'a')],
  'shot-blocked': [s(SHOT, 'a'), s('BLOCK_SHOT', 'b', { other: true })],
  'pen-saved': [s('TAKE_PENALTY', 'a'), s('SAVES_PENALTY', 'b', { other: true })],
  'pen-miss': [s('TAKE_PENALTY', 'a'), s(['PENALTY_HIT_OVER', 'PENALTY_HIT_WIDE', 'PENALTY_HITS_POST', 'PENALTY_HITS_BAR'], 'a')],
  penalty: [s(['FOUL', 'FOUL_TRIP'], 'b', { p2: 'a', other: true }), s('RESTART_PENALTY')],
  freekick: [s(FOULS, 'b', { p2: 'a', other: true }), s('RESTART_FREEKICK')],
  foul: [s(FOULS, 'a', { p2: 'b' })],
  'professional-foul': [s('CLEAN_THROUGH', 'b', { other: true }), s('FOUL_TRIP', 'a', { p2: 'b' })],
  'red-professional': [s('SENT_OFF_FOR_PROFESSIONAL_FOUL', 'a')],
  red: [s('SENT_OFF', 'a')],
  yellow: [s('YELLOW_CARD', 'a')],
  'second-yellow': [s('SECOND_YELLOW_CARD', 'a')],
  'time-wasting': [s('PLAYER_TAKES_HIS_TIME', 'a'), s('YELLOW_CARD', 'a')],
  'time-waste': [s('PLAYER_TAKES_HIS_TIME', 'a')],
  dissent: [s('PLAYER_ARGUES_WITH_REFEREE', 'a')],
  'dive-booked': [s('LOOKED_LIKE_A_DIVE', 'a'), s('PLAYER_DONE_FOR_DIVING', 'a')],
  'dive-pen': [s('RESTART_PENALTY'), s('LOOKED_LIKE_A_DIVE', 'a')],
  'pen-appeal': [s('PENALTY_APPEAL_TURNED_DOWN')],
  injury: [s('PLAYER_INJURED_GOES_ON', 'a', { only: /^<p1> has picked up an injury$|^Injury to <p1>/ })],
  sub: [s('SUBSTITUTION', 'a', { p2: 'b' })],
  offside: [s('RESTART_OFFSIDE', 'a')],
  corner: [s('RESTART_CORNER'), s('TAKE_CORNER', 'a')],
  'corner-in': [s('TAKE_CORNER', 'a'), s('WINS_JUMPFORBALL', 'b')],
  'short-corner': [s('TAKE_SHORT_CORNER', 'a')],
  'corner-edge': [s('TAKE_CORNER_TO_EDGE_OF_BOX', 'a')],
  cross: [s('ATTEMPT_PASS_CROSS', 'a')],
  'low-cross': [s('CROSS_IT', 'a')],
  throughball: [s(['PASS_TO_RUN_ONTO_LOW', 'PASS_TO_RUN_ONTO_HIGH'], 'a', { p2: 'b' })],
  dribble: [s(['RUN_PAST_OPPONENT', 'RUN_PAST_OPPONENT_WITH_PACE'], 'a', { p2: 'b' })],
  'dribble-box': [s('BRINGS_BALL_INTO_AREA', 'a')],
  counter: [s(['CROSSES_HALFWAY_LINE', 'RUN_WITH_BALL'], 'b')],
  longball: [s('LONG_BALL_FORWARD', 'a', { p2: 'b' })],
  'pass-forward': [s(['PASS_MEDIUM_FORWARD', 'PASS_IT'], 'a')],
  'gk-claims': [s('GOALIE_CATCH_BALL', 'a')],
  'gk-holds': [s('GOALIE_CATCH_BALL', 'a')],
  'gk-parry': [s('GOALKEEPER_PARRY', 'a'), s('LOOSE_BALL_IN_AREA', 'b', { other: true })],
  'gk-spills': [s('GOALIE_SPILLS_BALL', 'a'), s('LOOSE_BALL_IN_AREA', 'b', { other: true })],
  'hold-up': [s('WAIT', 'a')],
  'lay-off': [s('LAYS_BALL_OFF', 'a')],
  'poor-touch': [s('LOSE_CONTROL_OF_BALL', 'a')],
  'great-touch': [s('GREAT_FIRST_TOUCH', 'a')],
  'knock-down': [s('KNOCKDOWN_HEADER', 'a', { p2: 'b' })],
  'long-throw': [s('TAKE_THROW_IN', 'a')],
  lastditch: [s('CLEAN_THROUGH', 'b', { other: true }), s('SAVING_TACKLE', 'a')],
  'closed-down': [s('SHOOTING_PLAYER_WAS_UNDER_PRESSURE_FROM_ONE_PLAYER', 'b', { p2: 'a', other: true })],
  knackered: [s('PLAYER_KNACKERED', 'a')],
  'fk-wall': [s('TAKE_FREE_KICK', 'a'), s('WALL_BLOCKS_SHOT')],
  'tactic-change': [s('CHANGE_FORMATION')],
  'ai-push': [s('GONE_ATTACKING_STYLE')],
  'ai-shut': [s('GONE_DEFENSIVE_STYLE')],
  shootout: [s('ANNOUNCE_PENALTIES')],
  'so-score': [s('START_SHOOTOUT_RUN_UP', 'a'), s('SCORED_PENALTY', 'a')],
  'so-miss': [s('START_SHOOTOUT_RUN_UP', 'a'), s('SAVES_PENALTY', 'b', { other: true })],
  'so-wide': [s('START_SHOOTOUT_RUN_UP', 'a'), s(['PENALTY_HIT_WIDE', 'PENALTY_HIT_OVER', 'PENALTY_HITS_POST'], 'a')],
  'shootout-end': [s('WIN_THE_SHOOTOUT')],
  // spil-for-spil (kun i den kamp, man ser)
  'pl-fwd': [s(['PASS_SHORT_FORWARD', 'PASS_MEDIUM_FORWARD'], 'a', { p2: 'b' })],
  'pl-area': [s(['PASS_SHORT_INTO_AREA', 'PASS_MEDIUM_INTO_AREA'], 'a', { p2: 'b' })],
  'pl-side-l': [s(['PASS_SHORT_LEFT', 'PASS_MEDIUM_LEFT'], 'a', { p2: 'b' })],
  'pl-side-r': [s(['PASS_SHORT_RIGHT', 'PASS_MEDIUM_RIGHT'], 'a', { p2: 'b' })],
  'pl-wing-l': [s(['PASS_SHORT_LEFT_WING', 'PASS_MEDIUM_LEFT_WING'], 'a', { p2: 'b' })],
  'pl-wing-r': [s(['PASS_SHORT_RIGHT_WING', 'PASS_MEDIUM_RIGHT_WING'], 'a', { p2: 'b' })],
  'pl-back': [s('PASS_SHORT_BACK', 'a', { p2: 'b' })],
  'pl-icpt': [s(['GOOD_INTERCEPT', 'SCATTER_INTERCEPT'], 'a')],
  'pl-goalkick': [s('RESTART_GOAL_KICK'), s('TAKE_GOAL_KICK', 'a')],
};

/** Har motorens linjetype en original tekst? (spil-for-spil uden tekster vises ikke) */
export function hasOriginal(k: string): boolean { return k in MAP; }

const hash = (n: number) => { let x = (n ^ 0x9e3779b9) >>> 0; x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0; x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0; return (x ^ (x >>> 16)) >>> 0; };

/** Dommeren i teksten: [<Rf> med navn, <rf> med navn, <Rf> uden navn, <rf> uden navn] */
const REF: Record<string, [string, string, string, string]> = {
  en: ['Referee', 'referee', 'The referee', 'the referee'], da: ['Dommer', 'dommer', 'Dommeren', 'dommeren'],
  de: ['Schiedsrichter', 'Schiedsrichter', 'Der Schiedsrichter', 'der Schiedsrichter'], es: ['El árbitro', 'el árbitro', 'El árbitro', 'el árbitro'],
  fr: ["L'arbitre", "l'arbitre", "L'arbitre", "l'arbitre"], it: ["L'arbitro", "l'arbitro", "L'arbitro", "l'arbitro"],
  pt: ['O árbitro', 'árbitro', 'O árbitro', 'árbitro'], tr: ['Hakem', 'hakem', 'Hakem', 'hakem'],
};

export interface OrigCtx { home: string; away: string; score?: string; ref?: string; lang: string }

/** Linjen med originalens ord (en/da), eller null når der ikke findes en passende (så bruges vores egen tekst) */
export function originalText(l: CommentaryLine, ctx: OrigCtx, idx: number): string | null {
  if (!data) return null;
  const lang = ctx.lang;
  const pick = (r: Row) => (lang === 'en' ? r[1] : lang === 'da' ? r[2] : r[3]?.[lang]);
  const steps = MAP[l.k];
  if (!steps) return null;
  const da = ctx.lang === 'da';
  const team = (other?: boolean) => { const t = l.t === undefined ? undefined : other ? 1 - l.t : l.t; return t === 0 ? ctx.home : t === 1 ? ctx.away : undefined; };
  const out: string[] = [];
  steps.forEach((st, si) => {
    if (st.raw === 'score') { if (ctx.score) out.push(ctx.score); return; }
    const p1 = st.p1 ? l[st.p1] : undefined, p2 = st.p2 ? l[st.p2] : undefined;
    const t1 = team(st.other), t2 = team(!st.other);
    const ok = (txt: string, en: boolean) => (!txt.includes('<p1>') || !!p1) && (!txt.includes('<p2>') || !!p2) && (!/<t1?>|<tc>/.test(txt) || !!t1) && (!txt.includes('<t2>') || !!t2)
      && (!txt.includes('<N>') || !!l.a) && !/<n>|<c>|<f>/.test(txt) && (!en || !st.only || st.only.test(txt));
    const rows = st.ev.flatMap((e) => data![e] ?? []).filter((r) => { const x = pick(r); return !!x && ok(r[1], true) && ok(x, false); });
    if (!rows.length) return;
    const tot = rows.reduce((a, r) => a + r[0], 0);
    let x = hash(idx * 31 + l.m * 7 + si) % tot;
    let row = rows[0];
    for (const r of rows) { x -= r[0]; if (x < 0) { row = r; break; } }
    const poss = (name: string) => (da ? (/[sxz]$/i.test(name) ? "'" : 's') : /s$/i.test(name) ? "'" : "'s");
    let txt = pick(row)!;
    txt = txt.replace(/<p1>\{s\}/g, p1 ? p1 + poss(p1) : '').replace(/<p2>\{s\}/g, p2 ? p2 + poss(p2) : '').replace(/<t2>\{s\}/g, t2 ? t2 + poss(t2) : '').replace(/<t1?>\{s\}/g, t1 ? t1 + poss(t1) : '')
      .replace(/<p1>/g, p1 ?? '').replace(/<p2>/g, p2 ?? '').replace(/<tc>/g, (t1 ?? '').toUpperCase()).replace(/<t1?>/g, t1 ?? '').replace(/<t2>/g, t2 ?? '')
      .replace(/<Rf>/g, ctx.ref ? `${REF[lang]?.[0] ?? 'Referee'} ${ctx.ref}` : REF[lang]?.[2] ?? 'The referee')
      .replace(/<rf>/g, ctx.ref ? `${REF[lang]?.[1] ?? 'referee'} ${ctx.ref}` : REF[lang]?.[3] ?? 'the referee')
      .replace(/<d>/g, String(15 + (hash(idx + 7) % 30))).replace(/<N>/g, l.a ?? '')
      .replace(/<[YRO]>/g, '').replace(/\{s\}/g, '').replace(/\s+/g, ' ');
    // "|" = flere linjer efter hinanden i originalen: her én linje med punktum imellem
    for (const part of txt.split('|').map((x) => x.trim()).filter(Boolean)) out.push(/[.!?…:]$/.test(part) ? part : `${part}.`);
  });
  return out.length ? out.join(' ') : null;
}
