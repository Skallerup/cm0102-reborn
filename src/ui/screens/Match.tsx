import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { estimateGate } from '../../game/finance';
import { FORMATIONS, changeFormation, slotTaken, snapSlot } from '../../game/tactics';
import type { DropItem } from '../classic';
import { askConfirm } from '../confirm';
import { ZONES } from '../../game/engine/match';
import { opponentReport } from '../../game/analysis';
import type { MatchSim } from '../../game/engine/match';
import { createLiveMatch, quickReport, userTactic } from '../../game/sim';
import { PITCH_ICON, WEATHER_ICON, pitchFor, refereeFor, weatherFor } from '../../game/weather';
import { act } from '../../game/actions';
import { humanManager, isHumanClub } from '../../game/humans';
import { isBotClub } from '../../game/bots';
import { session, skippedMatches, type LiveCmd } from '../../online/client';
import { fixturesOn, gs, notify, squad } from '../../game/state';
import type { Fixture, TableRow, MatchReport, MatchStatsSide, Tactic, OppInstructions, OppKind, PlayerMatchLine } from '../../game/types';
import { compName, t } from '../../i18n';
import { Bar, ClubLink, Crest, Panel, Pct, PlayerLink, posStr, Rating, Tabs } from '../components';
import { useGame, useNav } from '../core';
import { commentaryText, reportLines } from '../commentary';
import { loadMatchTexts } from '../matchTexts';
import { Head } from './common';
import { isRetro } from '../theme';
import { useClassicNext, useClassicMatchSide, useClassicDialog, ClassicSub, CxDrop, cxLongDate } from '../classic';
import { loadStadiumBgs, stadiumBgUrl } from '../backgrounds';
import { stadiumBackgrounds } from '../classicOptions';
import { Pitch2D, closedDownFrames, cornerFrames, highlightFrames, incidentFrames, lastDitchFrames, offsideFrames, reboundFrames, shootoutFrames, shootoutIdle, type ShootoutTally, type Snap } from '../Pitch2D';
import { LeagueTable, LeagueTables, ordinal } from './Competitions';
import { leagueRows, sortTable } from '../../game/competitions';
import { TacticEditor, shapeName } from './Tactics';
import { stageLabel } from './Fixtures';
import { useHotkeys } from '../hotkeys';
import { TeamTalk } from '../teamtalk';
import { talkDone } from '../../game/teamtalk';
import { extended } from '../../game/rules';

// Den igangværende kamp overlever navigation mellem skærme
/** Holdfarver (scoreboard, 2D, kommentar): begge hold i deres egne klubfarver – ligner de hinanden, spiller
 *  udeholdet i sin anden farve (som et udebanesæt), og ellers i hvidt eller mørkeblåt */
function teamColors(home: number, away: number, _me: number): [string, string, string, string] {
  const g = gs();
  const kit = (id: number, fb: [string, string]): [string, string] => { const c = g.clubs[id]?.colors; return c?.[0] ? [c[0], c[1] ?? '#fff'] : fb; };
  const h = kit(home, ['#d7263d', '#ffffff']);
  let a = kit(away, ['#f4f4f4', '#1b2233']);
  const dist = (x: string, y: string) => { const p = rgbOf(x), q = rgbOf(y); return p && q ? Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) : 999; };
  if (dist(h[0], a[0]) < 110) {
    const alt: [string, string] = [a[1], a[0]];
    a = dist(h[0], alt[0]) >= 110 ? alt : dist(h[0], '#f4f4f4') >= 110 ? ['#f4f4f4', '#1b2233'] : ['#1d2b53', '#ffffff'];
  }
  return [h[0], h[1], a[0], a[1]];
}

/** RGB fra '#rrggbb', 'rrggbb', '#rgb' eller 'rgb(r, g, b)' */
function rgbOf(c: string): [number, number, number] | null {
  const m = c.match(/\d+/g);
  if (c.startsWith('rgb') && m && m.length >= 3) return [Number(m[0]), Number(m[1]), Number(m[2])];
  let h = c.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/**
 * Farver til statistikbjælkerne: eget hold i klubfarven, modstanderen i sin primære farve –
 * eller sekundærfarven, hvis den primære ligner vores for meget eller ikke kan ses (næsten hvid/sort).
 */
export function statColors(home: number, away: number, me: number): [string, string] {
  const g = gs();
  const own = teamColors(home, away, me)[me === 0 ? 0 : 2];
  const ownRgb = rgbOf(own);
  const opp = g.clubs[me === 0 ? away : home];
  const lum = ([r, gg, b]: [number, number, number]) => (0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255;
  const pick = (opp?.colors ?? []).map((c) => (c.startsWith('#') || c.startsWith('rgb') ? c : `#${c}`)).find((c) => {
    const rgb = rgbOf(c);
    if (!rgb || lum(rgb) > 0.88 || lum(rgb) < 0.06) return false;
    return !ownRgb || Math.hypot(rgb[0] - ownRgb[0], rgb[1] - ownRgb[1], rgb[2] - ownRgb[2]) > 110;
  }) ?? (ownRgb && lum(ownRgb) < 0.3 && ownRgb[2] > ownRgb[0] ? '#9aa4b2' : '#1d2b53');
  return me === 0 ? [own, pick] : [pick, own];
}

// originalens kommentarlinjer hentes, så snart kampskærmen er indlæst (de er klar, før bolden sparkes i gang)
void loadMatchTexts();

let live: { fixture: number; sim: MatchSim; lines: { text: string; cls: string; m: number; k?: string; t?: number; ci?: number }[]; poss5?: [number, number][]; consumed: number; halfShown?: boolean; shotsSeen?: number; cornersSeen?: number; h2hInit?: boolean; evSeen?: number; h2h?: H2hState; ldSeen?: number; prevTab?: string; kicked?: boolean; zones?: [number, number, number]; zposs?: [number, number][]; baseTactic?: Tactic; wantTactics?: { side: 0 | 1; from: number; m: number }; wantPause?: { from: number; m: number }; atHalf?: boolean; ht?: [number, number] } | null = null;

/** Commentary Speed i klassisk huskes fra kamp til kamp (originalens seks trin, langsom → hurtig) */
const CX_SPEEDS = [0.35, 0.6, 1, 2, 4, 8];
const loadCxSpeed = () => { try { const v = Number(localStorage.getItem('cm-cx-speed')); return CX_SPEEDS.includes(v) ? v : 1; } catch { return 1; } };
const saveCxSpeed = (v: number) => { try { localStorage.setItem('cm-cx-speed', String(v)); } catch { /* ignorer */ } };

export function MatchScreen({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const f = g.fixtures[id];
  // klassisk (CM 01/02): ingen optaktsside – man står på kampskærmen og trykker Kick Off Match
  const [phase, setPhase] = useState<'pre' | 'live'>(live?.fixture === id || (isRetro() && g.pendingFixture === id && !g.humans) ? 'live' : 'pre');
  if (!f) return <Head title="?" />;
  // en kamp for en klub, man ikke (længere) styrer – fx lige efter et jobskifte
  if (!f.result && f.home !== g.userClub && f.away !== g.userClub && live?.fixture !== id) {
    return <div><Head title={t('match.notYours')} /><p className="muted">{t('match.notYoursText', { club: g.clubs[g.userClub]?.name ?? '' })}</p><button className="primary" onClick={() => nav({ name: 'inbox' })}>{t('nav.inbox')}</button></div>;
  }
  if (f.result && g.reports[id] && phase !== 'live') {
    return <div><Head title={t('match.played')} /><button onClick={() => nav({ name: 'report', id })}>{t('fix.report')}</button></div>;
  }
  // online: udeholdet i en kamp mod en anden manager følger kampen live
  if (!f.result && g.pendingFixture === id && g.humans && f.away === g.userClub && isHumanClub(f.home) && !isBotClub(f.home) && session()) return <FollowMatch id={id} />;
  if (phase === 'pre') return <PreMatch id={id} onPlay={() => setPhase('live')} onQuick={() => { const rep = quickReport(); if (rep) { act({ t: 'matchResult', fixture: f.id, rep }); nav({ name: 'report', id: f.id }); } }} />;
  return <LiveMatch id={id} />;
}

function PreMatch({ id, onPlay, onQuick }: { id: number; onPlay: () => void; onQuick: () => void }) {
  const g = useGame()!;
  const { nav } = useNav();
  const f = g.fixtures[id];
  const [rep] = useState(() => opponentReport(f));
  const tac = userTactic(false);
  const xi = tac.lineup.map((pid) => g.players[pid]).filter(Boolean);
  const isToday = g.pendingFixture === id;
  // online: to menneskelige managere mod hinanden – hjemmeholdets manager spiller kampen
  const awayVsHuman = !!g.humans && f.away === g.userClub && isHumanClub(f.home) && !isBotClub(f.home);
  const homeVsHuman = !!g.humans && !!session() && f.home === g.userClub && isHumanClub(f.away) && !isBotClub(f.away);
  useHotkeys((e) => { if (isToday && !awayVsHuman && e.key === 'Enter') { onPlay(); return true; } });
  const photo = useStadiumPhoto(f);
  return (
    <div>
      <Head title={`${compName(g.comps[f.comp]?.name)} – ${stageLabel(f)}`} />
      <Scoreboard home={f.home} away={f.away} hg={null} ag={null} minute={t('match.preview')} photo={photo} venue={g.clubs[f.home]?.stadium} />
      <div className="insight weather-note">{WEATHER_ICON[weatherFor(f)]} <b>{t(`wx.${weatherFor(f)}`)}</b> – {t(`wx.d.${weatherFor(f)}`)}
        {pitchFor(f) !== 'normal' && <> · {PITCH_ICON[pitchFor(f)]} <b>{t(`pitch.${pitchFor(f)}`)}</b> – {t(`pitch.d.${pitchFor(f)}`)}</>}
        {' · '}{t('ref.label')}: <b>{refereeFor(f).name}</b> ({t(refereeFor(f).strict > 1.15 ? 'ref.strict' : refereeFor(f).strict < 0.85 ? 'ref.lenient' : 'ref.normal')})</div>
      <div className="cols">
        <Panel title={t('match.yourXI')}>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {xi.map((p, i) => <li key={p.id}><span className="muted">{tac.slots[i].pos}{tac.slots[i].side !== 'C' ? tac.slots[i].side : ''}</span> <PlayerLink p={p} /> <Bar value={p.condition} /></li>)}
          </ol>
          <div className="row" style={{ marginTop: 8 }}>
            <button onClick={() => nav({ name: 'tactics' })}>{t('nav.tactics')}</button>
            <span className="muted">{tac.formation} · {t(`ment.${tac.team.mentality}`)}</span>
          </div>
        </Panel>
        <Panel title={t('an.opponent', { club: rep.opp.short })}>
          <div className="kv">
            <span>{t('an.formation')}</span><span>{rep.oppTactic.formation} ({t(`ment.${rep.oppTactic.team.mentality}`)})</span>
            <span>{t('col.form')}</span><span>{rep.form || '-'}</span>
            <span>{t('an.keyPlayers')}</span><span>{rep.keyPlayers.map((pid) => <span key={pid}><PlayerLink p={g.players[pid]} short /> </span>)}</span>
            <span>{t('an.odds')}</span><span><b className="good"><Pct v={rep.probs[0]} /></b> / <Pct v={rep.probs[1]} /> / <b className="bad"><Pct v={rep.probs[2]} /></b></span>
          </div>
          <div className="gap" />
          {rep.insights.map((i, k) => <div key={k} className={`insight ${i.tone}`}>{t(i.key, { ...i.params, lane: i.params?.lane ? t(`lane.${i.params.lane}`) : undefined })}</div>)}
        </Panel>
      </div>
      {isToday && !awayVsHuman && <OppInstructionsPanel fixture={id} rep={rep} />}
      {isToday && !gs().draft && <TeamTalk fixture={id} stage="pre" pids={[...tac.lineup, ...tac.bench].filter(Boolean)} diff={0} ratings={{}} />}
      {isToday && awayVsHuman ? (
        <div className="insight">{t('mp.h2hAway', { name: humanManager(f.home)?.name ?? '' })}</div>
      ) : isToday ? (
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          {!homeVsHuman && <button onClick={onQuick}>{t('match.quick')}</button>}
          <button className="primary continue" onClick={onPlay}>{homeVsHuman ? t('mp.h2hReady') : t('match.kickoff')}</button>
        </div>
      ) : <div className="muted">{t('match.notToday')}</div>}
    </div>
  );
}

const OPP_KINDS: OppKind[] = ['tight', 'press', 'hard', 'weakFoot'];

/** Instruktioner mod modstanderen: op til tre af deres spillere + hvilken side vi angriber */
function OppInstructionsPanel({ fixture, rep }: { fixture: number; rep: ReturnType<typeof opponentReport> }) {
  const g = useGame()!;
  const tac = g.tactic;
  if (!tac) return null;
  const cur: OppInstructions = tac.opp?.fixture === fixture ? tac.opp : { fixture, targets: [] };
  const save = (o: OppInstructions) => act({ t: 'tactic', tactic: { ...tac, opp: o } });
  const setKind = (pid: number, kind: OppKind | '') => {
    const targets = cur.targets.filter((x) => x.pid !== pid);
    if (kind) targets.push({ pid, kind });
    save({ ...cur, targets });
  };
  const xi = rep.oppTactic.lineup.map((pid, i) => ({ p: g.players[pid], slot: rep.oppTactic.slots[i] })).filter((x) => x.p);
  // nøglespillerne først
  xi.sort((a, b) => Number(rep.keyPlayers.includes(b.p.id)) - Number(rep.keyPlayers.includes(a.p.id)));
  const full = cur.targets.length >= 3;
  return (
    <Panel title={t('oi.title')} right={<span className="muted">{t('oi.count', { n: cur.targets.length })}</span>}>
      <div className="muted" style={{ marginBottom: 10 }}>{t('oi.intro')}</div>
      <div className="row" style={{ marginBottom: 12, gap: 8 }}>
        <b>{t('oi.focus')}</b>
        <div className="seg">
          {[undefined, 0, 1, 2].map((l) => (
            <button key={String(l)} className={cur.focusLane === l ? 'on' : ''} onClick={() => save({ ...cur, focusLane: l })}>
              {l === undefined ? t('oi.none') : t(`oi.lane${l}`)}
            </button>
          ))}
        </div>
        <button className="tag good oi-suggest" title={t('oi.useSuggest')} onClick={() => save({ ...cur, focusLane: rep.attackLane })}>{t('oi.suggest', { lane: rep.attackLane === undefined ? t('oi.none') : t(`oi.lane${rep.attackLane}`) })}</button>
      </div>
      <div className="table-wrap">
        <table className="grid">
          <thead><tr><th>{t('col.pos')}</th><th>{t('col.name')}</th><th>{t('oi.instruction')}</th></tr></thead>
          <tbody>
            {xi.map(({ p, slot }) => {
              const mine = cur.targets.find((x) => x.pid === p.id);
              return (
                <tr key={p.id} className={mine ? 'me' : ''}>
                  <td>{slot.pos}{slot.side !== 'C' ? slot.side : ''}</td>
                  <td><PlayerLink p={p} />{rep.keyPlayers.includes(p.id) && <span className="tag warn" style={{ marginLeft: 6 }}>{t('oi.key')}</span>}</td>
                  <td>
                    <select value={mine?.kind ?? ''} disabled={!mine && full} onChange={(e) => setKind(p.id, e.target.value as OppKind | '')}>
                      <option value="">–</option>
                      {OPP_KINDS.filter((k) => k !== 'weakFoot' || p.foot !== 'B').map((k) => <option key={k} value={k}>{t(`oi.k.${k}`)}{k === 'weakFoot' ? ` (${t(p.foot === 'L' ? 'oi.right' : 'oi.left')})` : ''}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="oi-help">
        {OPP_KINDS.map((k) => <div key={k}><b>{t(`oi.k.${k}`)}</b> – {t(`oi.d.${k}`)}</div>)}
      </div>
    </Panel>
  );
}

/** De sidste n linjer, nyeste først, med en fast nøgle (linjens plads i hele kommentaren) – så en
 *  mållinje ikke flytter til et nyt element og blinker igen, hver gang der kommer en ny linje */
function lastLines<T>(lines: T[], n: number): [T, number][] {
  const from = Math.max(0, lines.length - n);
  return lines.slice(from).map((l, i) => [l, from + i] as [T, number]).reverse();
}

/** CM-stil: holdbjælker i holdfarverne med stor score og minuttet til venstre */
function CmScoreboard({ home, away, hg, ag, minute, colors, agg, classic }: { home: number; away: number; hg: number; ag: number; minute: string; colors: [string, string, string, string]; agg?: string; classic?: boolean }) {
  const g = gs();
  // klassisk (CM 01/02): kun klubbernes korte navn og stillingen yderst til højre i hver boks – minuttet står i sidebjælken
  if (classic) return (
    <div className="cm-board cx-board">
      <div className="cm-team" style={{ background: colors[0], color: colors[1] }}><span className="cm-name">{g.clubs[home]?.short}</span><span className="cm-score">{hg}</span></div>
      <div className="cm-team" style={{ background: colors[2], color: colors[3] }}><span className="cm-name">{g.clubs[away]?.short}</span>{agg && <span className="cm-agg">{agg}</span>}<span className="cm-score">{ag}</span></div>
    </div>
  );
  return (
    <div className="cm-board">
      <div className="cm-minute">{minute}</div>
      <div className="cm-team" style={{ background: colors[0], color: colors[1] }}>
        <span className="cm-name"><Crest id={home} size={30} /><span className="name-long">{g.clubs[home]?.name}</span><span className="name-short">{g.clubs[home]?.short}</span></span>
        <span className="cm-score">{hg}</span>
      </div>
      <div className="cm-team away" style={{ background: colors[2], color: colors[3] }}>
        <span className="cm-score">{ag}</span>
        <span className="cm-name"><span className="name-long">{g.clubs[away]?.name}</span><span className="name-short">{g.clubs[away]?.short}</span><Crest id={away} size={30} /></span>
        {agg && <span className="cm-agg">{agg}</span>}
      </div>
    </div>
  );
}

type LiveTeam = ReturnType<MatchSim['live']>;

/** Match Overview (CM 01/02): halvleg, dato og turnering, den seneste kommentar i farverne på holdet med bolden,
 *  boldbesiddelsen de seneste 5 minutter, dommer og vejr */
/** Kommentarbjælkens farver: holdet med bolden, gul ved mål, hvid ellers */
function cxLineStyle(line: { cls: string; t?: number } | undefined, colors: [string, string, string, string]) {
  const team = line?.t;
  return line?.cls === 'goal' ? { background: '#fff21f', color: '#0b1a5c' } : team === 0 || team === 1 ? { background: colors[team * 2], color: colors[team * 2 + 1] } : { background: '#ffffff', color: '#000000' };
}

function CxOverview({ f, colors, line, poss, half, goals, injuries = [], shootout, ht }: { ht?: [number, number]; shootout?: { t: number; p: number; outcome: string }[]; f: Fixture; colors: [string, string, string, string]; line?: { text: string; cls: string; t?: number }; poss: [number, number][]; half: string; goals: { t: number; p: number; m: number; og?: boolean }[]; injuries?: { t: number; p: number; m: number }[] }) {
  const g = gs();
  const { nav } = useNav();
  const home = poss.length ? Math.round((poss.filter(([, p]) => p === 0).length / poss.length) * 100) : 50;
  const bar = cxLineStyle(line, colors);
  const w = weatherFor(f);
  return (
    <div className="cx-mo">
      <div className="cx-subtitle small">{half}</div>
      <div className="cx-mo-meta"><span>{cxLongDate(f.date)}</span><span>{compName(g.comps[f.comp]?.name)}{ht ? ` / ${t('cl.mt.ht')} ${ht[0]}-${ht[1]}` : ''}</span></div>
      {/* målscorerne under hvert hold, som i CM 01/02 (selvmål står hos holdet, der fik målet) */}
      <div className="cx-mo-scorers">
        {[0, 1].map((side) => (
          <div key={side} className={side ? 'away' : ''}>
            {goals.filter((e) => e.t === side).map((e, i) => <div key={i} className="cx-mo-goal"><span className="cx-link" role="link" onClick={() => nav({ name: 'player', id: e.p })}>{g.players[e.p]?.last ?? ''}</span><span>{e.og ? ` (${t('match.og')})` : ''}</span><b>{e.m}</b></div>)}
            {injuries.filter((e) => e.t === side).map((e, i) => <div key={`i${i}`} className="cx-mo-inj cx-link" role="link" onClick={() => nav({ name: 'player', id: e.p })}>{t('cl.mt.injured', { name: g.players[e.p]?.last ?? '' })} {e.m}</div>)}
          </div>
        ))}
      </div>
      {shootout?.length ? (
        <div className="cx-mo-so">
          <div className="cx-mo-so-h">{t('cl.mt.shootout')}</div>
          <div className="cx-mo-scorers">{[0, 1].map((side) => (
            <div key={side} className={side ? 'away' : ''}>{shootout.filter((k) => k.t === side).map((k, i) => (
              <div key={i} className={k.outcome === 'goal' ? 'c-cyan' : 'cx-mo-inj'}>{t(k.outcome === 'goal' ? 'cl.mt.soScored' : 'cl.mt.soMissed', { name: g.players[k.p]?.last ?? '' })}</div>
            ))}</div>
          ))}</div>
        </div>
      ) : <div className={`cx-mo-line ${line ? '' : 'empty'}`} style={line ? bar : undefined}>{line?.text ?? ''}</div>}
      <div className="cx-mo-poss">
        <span className="lbl">{t('match.last5')}</span>
        <div className="cx-mo-bar">
          <span style={{ width: `${home}%`, background: colors[0], color: colors[1] }}>{home}%</span>
          <span style={{ width: `${100 - home}%`, background: colors[2], color: colors[3] }}>{100 - home}%</span>
        </div>
      </div>
      <div className="cx-mo-foot"><span>{t('ref.label')} - {refereeFor(f).name}</span>{/* tilskuertallet kommer først ved pausen (CM 01/02: "Attendance - 40200") */}{ht && <span className="cx-mo-att">{t('cl.mt.att')} - {f.result?.att ?? estimateGate(g.clubs[f.home], g.clubs[f.home].ticketPrice).attendance}</span>}<span>{t('match.weather')} - {t(`wx.${w}`)}</span></div>
    </div>
  );
}

/** Spillerkarakterer for begge hold side om side (som i CM): startere, indskiftede og ubrugte reserver */
function RatingsBoard({ sim, colors }: { sim: MatchSim; colors: [string, string, string, string] }) {
  const g = gs();
  const subMinute = (team: number, id: number, field: 'p' | 'p2') => sim.events.find((e) => e.k === 'sub' && e.t === team && e[field] === id)?.m;
  const cards = (team: number, id: number) => sim.events.filter((e) => e.t === team && e.p === id && (e.k === 'yellow' || e.k === 'red')).map((e) => e.k);
  const col = (lt: LiveTeam, team: number) => {
    const [bg, fg] = team === 0 ? [colors[0], colors[1]] : [colors[2], colors[3]];
    type Row = { id: number; num: number; rating?: number; goals?: number; info?: string; dim?: boolean };
    const starters = [...lt.on.filter((x) => x.enteredAt === 0), ...lt.gone.filter((x) => x.enteredAt === 0)].sort((a, b) => a.slot - b.slot);
    const rows: Row[] = starters.map((x) => {
      const out = subMinute(team, x.id, 'p2');
      const offRed = lt.on.find((o) => o.id === x.id)?.red;
      return { id: x.id, num: x.num ?? x.slot + 1, rating: x.rating, goals: x.goals, info: out ? t('rt.off', { m: out }) : offRed ? t('rt.sentOff') : undefined, dim: !!out || !!offRed };
    });
    let n = 12;
    for (const x of [...lt.on, ...lt.gone].filter((y) => y.enteredAt > 0)) rows.push({ id: x.id, num: x.num ?? n++, rating: x.rating, goals: x.goals, info: t('rt.on', { m: subMinute(team, x.id, 'p') ?? x.enteredAt }) });
    for (const id of lt.bench) rows.push({ id, num: gs().players[id]?.number ?? n++, dim: true });
    return (
      <div className="cm-col">
        {rows.map((r) => {
          const p = g.players[r.id];
          const cs = cards(team, r.id);
          return (
            <div key={r.id} className={`cm-row ${r.dim ? 'dim' : ''}`}>
              <span className="cm-num" style={{ background: bg, color: fg }}>{r.num}</span>
              <span className="cm-pl">{cs.includes('red') ? <i className="cm-card red" /> : cs.includes('yellow') ? <i className="cm-card" /> : null}<PlayerLink p={p} /></span>
              <span className="cm-info">{r.info ?? ''}</span>
              <span className="cm-rt">{r.rating !== undefined && !(r.dim && !r.info) ? <Rating r={r.rating} /> : ''}</span>
              <span className="cm-goals">{r.goals ? '⚽'.repeat(Math.min(3, r.goals)) : ''}</span>
            </div>
          );
        })}
      </div>
    );
  };
  return <div className="cm-ratings">{col(sim.live(0), 0)}{col(sim.live(1), 1)}</div>;
}

/** Moderne udseende: hjemmeholdets stadion som baggrund i kampkortet på kampdage (klassisk: hele skærmen, se Shell) */
function useStadiumPhoto(f: Fixture): string | null {
  const [, ready] = useState(0);
  const g = gs();
  const stadium = !isRetro() && f.stage !== 'F' && stadiumBackgrounds() ? g.clubs[f.home]?.stadium : undefined;
  useEffect(() => { if (stadium) void loadStadiumBgs().then(() => ready((x) => x + 1)); }, [stadium]);
  return stadiumBgUrl(stadium, f.date);
}

function Scoreboard({ home, away, hg, ag, minute, photo, venue }: { home: number; away: number; hg: number | null; ag: number | null; minute: string; photo?: string | null; venue?: string }) {
  return (
    <div className={`scoreboard ${photo ? 'photo' : ''}`} style={photo ? ({ '--stadium': `url("${photo}")` } as CSSProperties) : undefined}>
      {photo && venue && <div className="sb-venue">{venue}</div>}
      <div className="team"><Crest id={home} size={34} /><ClubLink id={home} noCrest /></div>
      <div>
        <div className="score">{hg === null ? 'v' : `${hg} - ${ag}`}</div>
        <div className="minute">{minute}</div>
      </div>
      <div className="team away"><Crest id={away} size={34} /><ClubLink id={away} noCrest /></div>
    </div>
  );
}

type H2hState = { phase: 'wait' | 'countdown' | 'play' | 'half'; homeSpeed: number; awaySpeed: number; awayReady: boolean; startAt: number; halfEnd: number; played: number; lastPing: number; awayTalked: boolean; seq: number; solo: boolean; waitSince: number };

/** Udeholdets ændringer (fra live-kanalen) lægges ind i kampen */
function applyAwayCmds(sim: MatchSim, s: H2hState, cmds: LiveCmd[]) {
  for (const c of cmds) {
    s.lastPing = Date.now();
    if (c.k === 'ready') s.awayReady = true;
    else if (c.k === 'sub') sim.substitute(1, c.out, c.inn);
    else if (c.k === 'ment') { const tac = sim.live(1).tactic; sim.setTactic(1, { ...tac, team: { ...tac.team, mentality: c.v } }); }
    else if (c.k === 'tactic') sim.setTactic(1, c.tac);
    else if (c.k === 'talk') { sim.applyTalk(1, c.boosts); s.awayTalked = true; }
    else if (c.k === 'speed') s.awaySpeed = c.v;
  }
}

let bgTimer: ReturnType<typeof setInterval> | null = null;
function stopH2hBackground() { if (bgTimer) { clearInterval(bgTimer); bgTimer = null; } }

/**
 * Kamp mod en anden manager, mens hjemmeholdets manager er på en anden skærm: kampen kører videre i fast tempo,
 * live-visningen sendes stadig til udeholdet, og ved slutfløjt lægges resultatet ind.
 */
function startH2hBackground(id: number) {
  const L = live;
  const sess = session();
  if (!L || !L.h2h || !sess || bgTimer || L.fixture !== id) return;
  const g = gs();
  const f = g.fixtures[id];
  const sim = L.sim, s = L.h2h;
  const home = g.clubs[f.home].short, away = g.clubs[f.away].short;
  const msPerMoment = ((g.options.h2hHalfMinutes ?? 3) * 2 * 60_000) / sim.totalMoments;
  let n = 0, busy = false, done = false;
  bgTimer = setInterval(() => {
    const now = Date.now();
    if (s.phase === 'wait' && s.awayReady) { s.phase = 'countdown'; s.startAt = now + 4000; }
    if (s.phase === 'countdown' && now >= s.startAt) s.phase = 'play';
    if (s.phase === 'half' && (now >= s.halfEnd || s.awayTalked)) s.phase = 'play';
    if (!s.solo && s.phase === 'play' && now - s.lastPing > 30_000) { s.solo = true; sim.opts.aiSubs = [false, true]; }
    if (s.phase === 'play' && !sim.finished) {
      // tempoet er det langsomste af de to managers valg
      s.played += 250 * Math.min(s.homeSpeed, s.awaySpeed);
      const target = Math.floor(s.played / msPerMoment);
      while (sim.moment < target && sim.step()) { /* frem til uret */ }
      if (sim.half === 2 && !L.halfShown && !sim.finished) { L.halfShown = true; s.phase = 'half'; s.halfEnd = now + 60_000; }
    }
    if (++n % 4 !== 0 || busy || done) return;
    // kommentaren formateres som på kampskærmen
    const ctx = { home, away, score: `${home} ${sim.teams[0].stats.goals}-${sim.teams[1].stats.goals} ${away}`, ref: refereeFor(f).name };
    while (L.consumed < sim.commentary.length) {
      const l = sim.commentary[L.consumed];
      if (l.k.startsWith('pl-')) { L.consumed++; continue; }
      L.lines.push({ text: commentaryText(l, ctx, L.consumed), cls: l.k.startsWith('goal') && l.k !== 'goal-offside' ? 'goal' : l.hi ? 'hi' : '', m: l.m, k: l.k });
      L.consumed++;
    }
    const finished = sim.finished;
    const report = finished ? sim.report() : undefined;
    const st = sim.teams.map((tm) => tm.stats);
    const data: FollowData = {
      seq: ++s.seq, phase: s.phase, awayReady: s.awayReady, homeSpeed: s.homeSpeed, awaySpeed: s.awaySpeed,
      countdown: s.phase === 'countdown' ? Math.max(0, Math.ceil((s.startAt - now) / 1000)) : 0,
      halfLeft: s.phase === 'half' ? Math.max(0, Math.ceil((s.halfEnd - now) / 1000)) : 0,
      minute: finished ? t('match.ft') : `${sim.minute}'`, hg: st[0].goals, ag: st[1].goals, finished, stats: [st[0], st[1]],
      lines: L.lines.slice(-60), live: [sim.live(0), sim.live(1)], events: sim.events,
      snap: { ...sim.pitch(), zone: 7, poss: 0, holder: 0, moment: 0, shot: null }, banner: L.lines.at(-1)?.text ?? '', report,
    };
    busy = true;
    sess.livePush(id, data).then((cmds) => applyAwayCmds(sim, s, cmds)).catch(() => {}).finally(() => {
      busy = false;
      if (finished && report) {
        // slutfløjt: resultatet lægges ind (og sendes til værten) – kampen er færdig
        done = true;
        stopH2hBackground();
        act({ t: 'matchResult', fixture: id, rep: report });
        if (live === L) live = null;
      }
    });
  }, 250);
}

function LiveMatch({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const f = g.fixtures[id];
  if (!live || live.fixture !== id) live = { fixture: id, sim: createLiveMatch(f, { playByPlay: isRetro() }), lines: [], consumed: 0 };
  const L = live;
  const sim = L.sim;
  const me = f.home === g.userClub ? 0 : 1;
  const [, force] = useState(0);
  // online, kamp mod en anden manager: fælles kickoff, fast tempo og fælles pause – vi (hjemmeholdet) kører kampen
  const sess = session();
  const h2h = !!sess && !!g.humans && me === 0 && isHumanClub(f.away) && !isBotClub(f.away);
  // tilstanden ligger på kampen (ikke komponenten), så den overlever, at man klikker rundt i spillet
  if (!L.h2h) L.h2h = { phase: 'wait', homeSpeed: 1, awaySpeed: 1, awayReady: false, startAt: 0, halfEnd: 0, played: 0, lastPing: Date.now(), awayTalked: false, seq: 0, solo: false, waitSince: Date.now() };
  const H = { current: L.h2h };
  // kampen kører i baggrunden, mens man er på andre skærme – her på kampskærmen overtager komponenten igen
  useEffect(() => {
    if (!h2h) return;
    stopH2hBackground();
    return () => { if (live && !live.sim.finished) startH2hBackground(id); };
  }, [h2h, id]);
  if (h2h && !L.h2hInit) { L.h2hInit = true; sim.opts.aiSubs = [false, false]; }
  const [paused, setPaused] = useState(false);
  const [speed, setSpeedRaw] = useState(() => (isRetro() ? loadCxSpeed() : 1));
  const setSpeed = (v: number) => { setSpeedRaw(v); if (isRetro()) saveCxSpeed(v); };
  // klassisk (CM 01/02): kampen venter på Kick Off Match, knapperne sidder i sidebjælken
  const classic = isRetro() && !h2h;
  const waiting = classic && !L.kicked && sim.minute === 0 && !sim.finished;
  // klassisk taktik: ændringer samles i en kladde og gælder ved Ok (Cancel = glem dem)
  const [draft, setDraft] = useState<Tactic | null>(null);
  const [lastView, setLastView] = useState(false);
  if (!L.baseTactic) L.baseTactic = structuredClone(sim.live(me).tactic);
  // klassisk tema: Match Overview (tekstkommentar som i CM 01/02) som standard
  const [tab, setTabState] = useState(() => {
    try { const v = localStorage.getItem(isRetro() ? 'cm-match-view-cx' : 'cm-match-view'); return v === 'commentary' || v === '2d' || (v === 'overview' && isRetro()) ? v : isRetro() ? 'overview' : '2d'; } catch { return isRetro() ? 'overview' : '2d'; }
  });
  // husk om man ser kampen i 2D, som kommentar eller (klassisk) som Match Overview
  const setTab = (v: string) => { setTabState(v); if (v === '2d' || v === 'commentary' || v === 'overview') { try { localStorage.setItem(isRetro() ? 'cm-match-view-cx' : 'cm-match-view', v); } catch { /* ignorér */ } } };
  const [report, setReport] = useState<MatchReport | null>(null);
  // flashes/bump/reveal: pr. billede – stor tekst, midlertidig ændring af stillingen (jubel før et annulleret mål) og hvor mange nye kommentarlinjer der vises
  const [hl, setHl] = useState<{ frames: Snap[]; i: number; outcome: string; texts: string[]; hideFrom: number; team: number; flashes?: (string | undefined)[]; bump?: number[]; reveal?: number[]; label?: string } | null>(null);
  const [msg, setMsg] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const home = g.clubs[f.home].short, away = g.clubs[f.away].short;

  const pull = () => {
    const ctx = { home, away, score: `${home} ${sim.teams[0].stats.goals}-${sim.teams[1].stats.goals} ${away}`, ref: refereeFor(f).name };
    while (L.consumed < sim.commentary.length) {
      const l = sim.commentary[L.consumed];
      // spil-for-spil kun i det klassiske udseende (Match Overview som i CM 01/02)
      if (l.k.startsWith('pl-') && !classic) { L.consumed++; continue; }
      const cls = l.k.startsWith('goal') && l.k !== 'goal-offside' ? 'goal' : l.hi ? 'hi' : '';
      L.lines.push({ text: commentaryText(l, ctx, L.consumed), cls, m: l.m, k: l.k, t: l.t, ci: L.consumed });
      L.consumed++;
    }
    // boldbesiddelse de seneste 5 minutter (Match Overview i klassisk tema)
    const z = (L.zones ??= [0, 0, 0]);
    const band = Math.floor(sim.pitch().zone / ZONES.lanes);
    const zi = band <= 1 ? 0 : band === 2 ? 1 : 2;
    z[zi]++;
    // hvem der har bolden i hver zone (bjælkerne i Action Zones)
    ((L.zposs ??= [[0, 0], [0, 0], [0, 0]])[zi][sim.pitch().poss === 0 ? 0 : 1])++;
    const ps = (L.poss5 ??= []);
    ps.push([sim.minute, sim.pitch().poss]);
    while (ps.length && ps[0][0] < sim.minute - 5) ps.shift();
  };

  const advance = (maxMoments: number, untilLine = true) => {
    const before = sim.commentary.length;
    // straffesparkskonkurrencen: højst ét spark ad gangen
    const soBefore = sim.shootout?.kicks.length ?? -1;
    let n = 0;
    while (n < maxMoments && (!untilLine || sim.commentary.length === before)) {
      if (!sim.step()) break;
      n++;
      if ((sim.shootout?.kicks.length ?? -1) !== soBefore) break;
    }
    const linesBefore = L.lines.length;
    pull();
    // store chancer og mål afspilles på 2D-banen (kampen venter imens)
    const seen = L.shotsSeen ?? 0;
    const fresh = sim.shots.slice(seen);
    L.shotsSeen = sim.shots.length;
    // højdepunkter: mål, store chancer – og de taktiske situationer (kontra, gennembrud, indlæg, solo, pres, frispark, cutback, langskud, stolpe)
    // hvor mange højdepunkter: kun mål, store chancer (standard) eller alle afslutninger
    const level = g.options.highlights ?? 'big';
    const bigs = fresh.filter((sh) => level === 'all' || sh.outcome === 'goal' || sh.outcome === 'offside' || sh.kind === 'pen' || (level === 'big' && (sh.xg >= 0.1 || sh.kind === 'oneOnOne' || (sh.outcome === 'saved' && sh.xg >= 0.07)
      || !!sh.origin || sh.post || sh.kind === 'fk' || sh.kind === 'cutback' || (sh.kind === 'long' && (sh.outcome === 'saved' || sh.xg >= 0.05)))));
    // flere afslutninger i samme opdatering: målet (eller det annullerede mål) vises – ellers den seneste. Ellers kunne
    // et annulleret mål blive vist med billederne af en anden afslutning (bolden langt fra mål – og så offside)
    const big = bigs.filter((sh) => sh.outcome === 'goal').at(-1) ?? bigs.filter((sh) => sh.outcome === 'offside').at(-1) ?? bigs.at(-1);
    let started = false;
    // hjørnespark: med afslutning vises de som chancen; uden afslutning som et kort indlæg, forsvaret rydder
    const newCorners = sim.corners.slice(L.cornersSeen ?? 0);
    L.cornersSeen = sim.corners.length;
    const lastCorner = newCorners.at(-1);
    // et skud i samme minut som hjørnesparket (fx efter en clearing) vises også som hjørnesparkets afslutning
    const cornerShot = fresh.filter((sh) => sh.corner).at(-1)
      ?? (lastCorner && fresh.at(-1) && fresh.at(-1)!.m === lastCorner.m && fresh.at(-1)!.t === lastCorner.t ? { ...fresh.at(-1)!, corner: lastCorner.taker } : undefined);
    const bigOrCorner = big ? (cornerShot && cornerShot.m === big.m && cornerShot.p === big.p ? cornerShot : big) : level === 'goals' ? undefined : cornerShot;
    const plainCorner = level !== 'goals' && !bigOrCorner && fresh.length === 0 && lastCorner;
    if (plainCorner && tab === '2d' && speed < 8) {
      const taker = g.players[plainCorner.taker]?.last ?? '';
      const lastNew = L.lines.length > linesBefore ? L.lines.at(-1)!.text : '';
      // er den sidste linje bare "Hjørnespark. X gør klar", står der intet om udfaldet – så rydder forsvaret
      const result = L.lines.length > linesBefore && sim.commentary.at(-1)?.k !== 'corner' ? lastNew : '';
      setHl({ frames: cornerFrames(sim.pitch(), plainCorner), i: 0, outcome: result ? 'none' : 'cleared', texts: [t('hl.cornerSetup', { a: taker }), t('hl.cornerCross', { a: taker }), result || t('hl.cornerCleared')], hideFrom: linesBefore, team: plainCorner.t });
      started = true;
    }
    // annullerede mål vises med jubel → skuffelse i alle visninger (også kommentaren)
    if (bigOrCorner && (tab === '2d' || (bigOrCorner.outcome === 'offside' && speed < 8)) && (speed < 8 || bigOrCorner.outcome === 'goal')) {
      const big = bigOrCorner;
      const assist = big.outcome === 'goal' ? sim.events.filter((e) => e.k === 'goal' && e.p === big.p).at(-1)?.p2 : undefined;
      // returbold: den første afslutning (redning/stolpe) vises først, så returen
      const bi = sim.shots.lastIndexOf(big);
      const first = big.kind === 'rebound' && bi > 0 && sim.shots[bi - 1].t === big.t ? sim.shots[bi - 1] : undefined;
      const frames = first ? reboundFrames(sim.pitch(), first, big) : highlightFrames(sim.pitch(), big, assist);
      // teksten følger billederne: opspil → aflevering → afslutning → det, der faktisk skete
      const name = (fr: Snap) => fr.players.find((p) => p.id === fr.holder)?.name ?? '';
      const shooter = frames.at(-1) ? name(frames.at(-1)!) : '';
      // kun linjerne om selve afslutningen: ved mål fra mållinjen og frem (mål, stilling, evt. VAR), ellers den sidste linje
      const fresh = L.lines.slice(linesBefore);
      const gi = big.outcome === 'goal' ? fresh.findIndex((l) => l.cls === 'goal') : -1;
      const result = (gi >= 0 ? fresh.slice(gi).map((l) => l.text).join(' · ') : fresh.at(-1)?.text) || (L.lines.at(-1)?.text ?? '');
      const taker = big.corner ? g.players[big.corner]?.last ?? '' : '';
      const tag = big.og || big.kind === 'og' ? 'og' : first ? 'rebound' : big.setup ?? big.origin ?? (['fk', 'long', 'cutback'].includes(big.kind) ? big.kind : '');
      const texts = big.corner
        ? [t('hl.cornerSetup', { a: taker }), t('hl.cornerCross', { a: taker }), result]
        : tag
        ? frames.map((fr, i) => (i === frames.length - 1 ? result : i === 0 ? t(`hl.t.${tag}`, { a: name(fr), b: shooter }) : i === frames.length - 2 ? t('hl.shoot', { a: shooter }) : t(`hl.t2.${tag}`, { a: name(fr), b: shooter })))
        : big.kind === 'pen'
        ? [t('hl.penSetup', { a: shooter }), t('hl.penRun', { a: shooter }), result]
        : frames.map((fr, i) => (i === frames.length - 1 ? result : i === 0 ? t('hl.build', { a: name(fr) }) : i === 1 ? t('hl.pass', { a: name(fr), b: shooter }) : t('hl.shoot', { a: shooter })));
      const fl = L.lines.slice(linesBefore);
      const ci = fl.findIndex((l) => l.k === 'goal-cheer');
      if (big.outcome === 'offside' && ci >= 0) {
        // annulleret mål: MÅL! (stillingen går op) → evt. VAR-tjek → AFLYST/OFFSIDE
        const tail = fl.slice(ci);
        const gi = frames.length - 1;
        const all = [...frames, ...tail.slice(1).map((_, j) => ({ ...frames[gi], moment: frames[gi].moment + j + 1 }))];
        const tx = [...texts.slice(0, gi), ...tail.map((l) => l.text)];
        const flashes = all.map((_, j) => {
          if (j < gi) return undefined;
          const k = tail[j - gi]?.k;
          return k === 'goal-cheer' ? t('hl.goal') : k === 'var-check' ? t('hl.varCheck') : k === 'var-disallowed' ? t('hl.disallowed') : k === 'goal-offside' ? t('hl.offside') : undefined;
        });
        setHl({ frames: all, i: tab === '2d' ? 0 : gi, outcome: 'offside', texts: tx, hideFrom: linesBefore, team: big.t, flashes,
          bump: all.map((_, j) => (j >= gi && j < all.length - 1 ? 1 : 0)), reveal: all.map((_, j) => (j < gi ? 0 : ci + (j - gi) + 1)) });
      } else setHl({ frames, i: 0, outcome: big.post ? 'post' : big.outcome, texts, hideFrom: linesBefore, team: big.t, label: big.corner ? undefined : tag ? `hl.k.${big.post && !big.origin ? 'post' : tag}` : big.post ? 'hl.k.post' : undefined });
      started = true;
    }
    // klassisk: pausen kommer først, når bolden er ude af spil
    const wp = L.wantPause;
    if (wp && (sim.finished || sim.minute >= wp.m + 3 || sim.commentary.slice(wp.from).some((l) => DEAD_BALL.has(l.k) || l.k.startsWith('goal')))) {
      L.wantPause = undefined;
      setMsg('');
      if (!sim.finished && !h2h) setPaused(true);
    }
    // klassisk (CM 01/02): taktikken åbner først, når bolden er ude af spil (frispark, indkast, mål, skift …)
    const wt = L.wantTactics;
    if (wt && (sim.finished || sim.minute >= wt.m + 3 || sim.commentary.slice(wt.from).some((l) => DEAD_BALL.has(l.k) || l.k.startsWith('goal')))) {
      L.wantTactics = undefined;
      setMsg('');
      if (!sim.finished) {
        if (!h2h) setPaused(true);
        if (tab !== 'tactics' && tab !== 'oppTactics') L.prevTab = tab;
        setDraft(null);
        setTab(wt.side === me ? 'tactics' : 'oppTactics');
      }
    }
    // skade eller rødt kort på mit hold: pause og over på taktik, så man selv kan justere
    const newEv = sim.events.slice(L.evSeen ?? 0);
    L.evSeen = sim.events.length;
    // (ingen pause, hvis der ikke er flere udskiftninger – så spiller holdet bare videre med 10 mand)
    const hit = newEv.filter((e) => e.t === me && (e.k === 'injury' || e.k === 'red') && (e.k === 'red' || sim.live(me).subsLeft > 0)).at(-1);
    if (hit && !sim.finished) {
      const name = hit.p ? g.players[hit.p]?.last ?? '' : '';
      if (!h2h) setPaused(true);
      if (tab !== 'tactics') L.prevTab = tab;
      setTab('tactics');
      setMsg(t(hit.k === 'injury' ? 'match.injuryStop' : 'match.redStop', { name }));
    }
    // straffesparkskonkurrencen: hvert spark afspilles på 2D-banen
    const kick = sim.shootout && sim.shootout.kicks.length > Math.max(0, soBefore) ? sim.shootout.kicks.at(-1)! : null;
    if (kick && tab === '2d' && speed < 8) {
      const taker = g.players[kick.p]?.last ?? '';
      const result = L.lines.slice(linesBefore).find((l) => l.k?.startsWith('so-'))?.text ?? '';
      setHl({ frames: shootoutFrames(sim.pitch(), kick), i: 0, outcome: kick.outcome, texts: [t('hl.soSetup', { a: taker }), t('hl.penRun', { a: taker }), result], hideFrom: linesBefore, team: kick.t, label: 'hl.k.shootout' });
      started = true;
    }
    // redningstackling (ingen afslutning): løberen alene – forsvareren redder
    const newLd = sim.highlights.slice(L.ldSeen ?? 0);
    L.ldSeen = sim.highlights.length;
    const ld = newLd.filter((h) => h.kind === 'lastDitch').at(-1);
    if (!started && ld && level !== 'goals' && tab === '2d' && speed < 8) {
      const runner = g.players[ld.p]?.last ?? '', cover = g.players[ld.p2]?.last ?? '';
      setHl({ frames: lastDitchFrames(sim.pitch(), ld), i: 0, outcome: 'lastDitch', texts: [t('hl.t.lastDitch', { a: runner }), t('hl.t2.lastDitch', { a: runner, b: cover }), L.lines.at(-1)?.text ?? ''], hideFrom: linesBefore, team: ld.t, label: 'hl.k.lastDitch' });
      started = true;
    }
    // mindre højdepunkter (kun ved "Alle"): offside, kort og skader
    if (!started && level === 'all' && tab === '2d' && speed < 8) {
      const off = newLd.filter((h) => h.kind === 'offside').at(-1);
      const cd = newLd.filter((h) => h.kind === 'closedDown').at(-1);
      const inc = newEv.filter((e) => e.k === 'yellow' || e.k === 'red' || e.k === 'injury').at(-1);
      const lineFor = (...ks: string[]) => L.lines.slice(linesBefore).reverse().find((l) => ks.some((k) => l.k?.startsWith(k)))?.text ?? L.lines.at(-1)?.text ?? '';
      if (cd && !off) {
        const att = g.players[cd.p]?.last ?? '', def = g.players[cd.p2]?.last ?? '';
        setHl({ frames: closedDownFrames(sim.pitch(), cd), i: 0, outcome: 'closedDown', texts: [t('hl.t.closedDown', { a: att }), t('hl.t2.closedDown', { a: att, b: def }), lineFor('closed-down')], hideFrom: linesBefore, team: cd.t, label: 'hl.k.closedDown' });
        started = true;
      } else if (off) {
        const runner = g.players[off.p]?.last ?? '', passer = g.players[off.p2]?.last ?? '';
        setHl({ frames: offsideFrames(sim.pitch(), off), i: 0, outcome: 'offsideFlag', texts: [t('hl.t.offside', { a: passer, b: runner }), lineFor('offside')], hideFrom: linesBefore, team: off.t, label: 'hl.k.offside' });
        started = true;
      } else if (inc) {
        const who = g.players[inc.p ?? 0]?.last ?? '';
        const kind = inc.k as 'yellow' | 'red' | 'injury';
        setHl({ frames: incidentFrames(sim.pitch(), { t: inc.t, p: inc.p ?? 0 }), i: 0, outcome: kind, texts: [t(`hl.t.${kind}`, { a: who }), lineFor(...(kind === 'red' ? ['red', 'second-yellow'] : [kind]))], hideFrom: linesBefore, team: inc.t, label: `hl.k.${kind}` });
        started = true;
      }
    }
    if (sim.finished && !report) setReport(sim.report());
    else if (!started) maybeHalftime();
    force((x) => x + 1);
  };

  // pausen: stop og giv holdet en peptalk – bagefter tilbage til den visning, man kom fra
  const maybeHalftime = () => {
    if (sim.half === 2 && !L.halfShown && !talkDone(id, 'half') && !sim.finished) {
      L.halfShown = true;
      L.ht = [sim.teams[0].stats.goals, sim.teams[1].stats.goals];
      // klassisk (CM 01/02): ingen holdsnak – kampen står stille på Match Overview med "Half Time" og Re-start Match
      if (classic) { L.atHalf = true; setPaused(true); setTab('overview'); return; }
      L.prevTab = tab === 'talk' ? '2d' : tab;
      if (h2h) { H.current.phase = 'half'; H.current.halfEnd = Date.now() + 60_000; }
      else setPaused(true);
      setTab('talk');
    }
  };

  // seneste udgaver til det faste ur (intervallet oprettes kun én gang)
  const advRef = useRef(advance);
  advRef.current = advance;
  const hlRef = useRef(hl);
  hlRef.current = hl;
  const tabRef = useRef(tab);
  tabRef.current = tab;
  useEffect(() => {
    if (!h2h || report) return;
    const msPerMoment = ((g.options.h2hHalfMinutes ?? 3) * 2 * 60_000) / sim.totalMoments;
    const h = setInterval(() => {
      const s = H.current;
      const now = Date.now();
      if (s.phase === 'wait' && s.awayReady) { s.phase = 'countdown'; s.startAt = now + 4000; }
      if (s.phase === 'countdown' && now >= s.startAt) s.phase = 'play';
      if (s.phase === 'half' && (now >= s.halfEnd || (s.awayTalked && talkDone(id, 'half')))) { s.phase = 'play'; setTab(L.prevTab ?? '2d'); }
      // udeholdet er faldet fra (intet livstegn i 30 sek.): dets assistent tager over
      if (!s.solo && s.phase === 'play' && now - s.lastPing > 30_000) { s.solo = true; sim.opts.aiSubs = [false, true]; }
      force((x) => x + 1);
      if (s.phase !== 'play' || hlRef.current) return;
      // tempoet er det langsomste af de to managers valg
      s.played += 250 * Math.min(s.homeSpeed, s.awaySpeed);
      const target = Math.floor(s.played / msPerMoment);
      if (target > sim.moment) advRef.current(target - sim.moment, false);
    }, 250);
    return () => clearInterval(h);
  }, [h2h, report]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (h2h) return; // fast tempo – styres ovenfor
    if (paused || report || hl || waiting) return;
    // klassisk: straffesparkskonkurrencen vises langsomt, spark for spark
    const ms = classic && sim.shootout ? Math.max(900, 2200 / Math.sqrt(speed)) : Math.max(30, g.options.matchSpeed / speed);
    const h = setInterval(() => advance(speed >= 8 && !(classic && sim.shootout) ? 40 : 12), ms);
    return () => clearInterval(h);
  });

  // afspil højdepunktet billede for billede – det sidste billede (udfaldet) bliver stående lidt længere
  const frameMs = Math.round(950 / Math.sqrt(speed));
  useEffect(() => {
    if (!hl || paused) return;
    const last = hl.i >= hl.frames.length - 1;
    const slow = hl.flashes?.[hl.i] === t('hl.varCheck') ? 2 : hl.flashes?.[hl.i] === t('hl.goal') ? 1.6 : 1;
    const h = setTimeout(() => { if (last) { setHl(null); maybeHalftime(); } else setHl({ ...hl, i: hl.i + 1 }); }, last ? frameMs * 2.2 : frameMs * slow);
    return () => clearTimeout(h);
  }, [hl, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  });

  // klassisk: bolden i spil → kampen pauser ved næste stop i spillet (som i CM 01/02); genoptag sker med det samme
  const cxPause = () => { if (paused) { L.atHalf = false; setPaused(false); return; } if (L.wantPause) return; L.wantPause = { from: sim.commentary.length, m: sim.minute }; setMsg(t('cl.mt.waitPause')); };
  useHotkeys((e) => {
    const k = e.key.toLowerCase();
    if (report) {
      if (e.key === 'Enter') { done(); return true; }
      return;
    }
    if (k === 'p') { if (classic && L.kicked) cxPause(); else setPaused(!paused); return true; }
    if (['1', '2', '3', '4'].includes(e.key)) { setSpeed([1, 2, 4, 8][Number(e.key) - 1]); return true; }
    if (k === 't') { setPaused(true); setTab('tactics'); return true; }
    if (k === 'u' || k === 'h') { setPaused(true); setTab('tactics'); return true; }
    if (k === 'c' || k === 'k') { setTab('commentary'); return true; }
    if (k === 's') { setTab('stats'); return true; }
    if (k === 'e') { finishNow(); return true; }
  });

  const finishNow = () => {
    while (sim.step());
    pull();
    setReport(sim.report());
  };

  const done = () => {
    if (!report) return;
    // via en handling, så resultatet også når værten i online-spil
    // startopstillingen gemmes til næste kamps "Last Match" (klassisk)
    if (L.baseTactic) gs().lastMatchTactic = structuredClone(L.baseTactic);
    act({ t: 'matchResult', fixture: id, rep: report });
    live = null;
    notify();
    // klassisk (CM 01/02): Continue Game fører til aftenens resultater
    nav(classic ? { name: 'matchday', id } : { name: 'report', id });
  };

  const st = sim.teams.map((tm) => tm.stats);
  const myLive = sim.live(me);
  const halfTalk = !classic && !gs().draft && sim.half === 2 && !report && (tab === 'talk' || (!talkDone(id, 'half') && sim.minute <= 50));
  const myGoals = sim.teams[me].stats.goals - sim.teams[1 - me].stats.goals;
  const liveRatings = Object.fromEntries(myLive.on.filter((s) => !s.off).map((s) => [s.id, Math.round(s.rating * 10) / 10]));

  // kun kampe i samme turnering (samme liga eller pokal)
  const others = fixturesOn(f.date).map((fid) => g.fixtures[fid]).filter((x) => x && x.id !== id && x.result && x.comp === f.comp);
  const minute = sim.finished ? t('match.ft') : `${sim.minute}'`;
  // straffesparkskonkurrencen: sparket, der afspilles, tæller først, når bolden er sparket
  const soKicks = sim.shootout ? sim.shootout.kicks.slice(0, sim.shootout.kicks.length - (hl?.label === 'hl.k.shootout' && hl.i < hl.frames.length - 1 ? 1 : 0)) : null;
  const soScore = soKicks ? [0, 1].map((tm) => soKicks.filter((k) => k.t === tm && k.outcome === 'goal').length) : null;
  const soTally: ShootoutTally | undefined = soKicks ? { names: [home, away], kicks: [soKicks.filter((k) => k.t === 0).map((k) => k.outcome), soKicks.filter((k) => k.t === 1).map((k) => k.outcome)] } : undefined;
  const minuteLabel = minute + (soScore ? ` (${t('fix.pens')}\u00a0${soScore[0]}\u2011${soScore[1]})` : '');
  const colors = teamColors(f.home, f.away, me);
  // et mål vises først på resultattavlen, når højdepunktet når frem til målet
  const spoil = hl && hl.outcome === 'goal' && hl.label !== 'hl.k.shootout' && hl.i < hl.frames.length - 1 ? hl.team : -1;
  // jubel før et annulleret mål: stillingen står midlertidigt et mål højere
  const fake = hl?.bump?.[hl.i] ? hl.team : -1;

  // live-visningen til udeholdet hvert sekund
  const hg = st[0].goals - (spoil === 0 ? 1 : 0) + (fake === 0 ? 1 : 0), ag = st[1].goals - (spoil === 1 ? 1 : 0) + (fake === 1 ? 1 : 0);
  const shownLines = hl?.reveal ? L.lines.slice(0, hl.hideFrom + hl.reveal[hl.i]) : hl && hl.i < hl.frames.length - 1 ? L.lines.slice(0, hl.hideFrom) : L.lines;
  const hs = H.current;
  const countdown = hs.phase === 'countdown' ? Math.max(0, Math.ceil((hs.startAt - Date.now()) / 1000)) : 0;
  const halfLeft = hs.phase === 'half' ? Math.max(0, Math.ceil((hs.halfEnd - Date.now()) / 1000)) : 0;
  const liveRef = useRef<FollowData | null>(null);
  if (h2h) {
    liveRef.current = {
      seq: ++hs.seq, phase: hs.phase, awayReady: hs.awayReady, homeSpeed: hs.homeSpeed, awaySpeed: hs.awaySpeed, countdown, halfLeft,
      minute: minuteLabel, hg, ag, finished: !!report, stats: [st[0], st[1]],
      lines: shownLines.slice(-60), live: [sim.live(0), sim.live(1)], events: sim.events,
      snap: hl ? hl.frames[hl.i] : { ...sim.pitch(), zone: 7, poss: 0, holder: 0, moment: 0, shot: null },
      banner: hl ? hl.texts[hl.i] ?? '' : L.lines.at(-1)?.text ?? '',
      flash: hl ? (hl.flashes ? hl.flashes[hl.i] : hl.i === hl.frames.length - 1 && hl.outcome !== 'none' ? t(`hl.${hl.outcome}`) : undefined) : undefined,
      report: report ?? undefined,
    };
  }
  useEffect(() => {
    if (!h2h || !sess) return;
    let busy = false;
    const h = setInterval(() => {
      if (busy || !liveRef.current) return;
      busy = true;
      sess.livePush(id, liveRef.current).then((cmds) => {
        // udeholdets ændringer
        applyAwayCmds(sim, H.current, cmds);
        if (cmds.length) { pull(); force((x) => x + 1); }
      }).catch(() => {}).finally(() => { busy = false; });
    }, 1000);
    return () => clearInterval(h);
  }, [h2h, id]); // eslint-disable-line react-hooks/exhaustive-deps
  const awayName = humanManager(f.away)?.name ?? '';
  const photo = useStadiumPhoto(f);
  // klassisk: ved slutfløjt bliver Next-knappen nederst til "Continue" (som i CM 01/02)
  useClassicNext(report && !classic ? t('match.continue') : null, done);
  const editing = classic && tab === 'tactics' && !report;
  useClassicMatchSide(classic ? { minute: waiting ? '0' : L.atHalf && !sim.finished ? '45' : String(sim.minute), half: !!L.atHalf, editing, lastView: editing && lastView, venue: `${g.clubs[f.home]?.stadium ?? ''}${g.clubs[f.home]?.short ? `, ${g.clubs[f.home].short}` : ''}`, line: !waiting && !report && tab !== 'overview' && tab !== '2d' && L.lines.length ? { text: L.lines.at(-1)!.text, ...cxLineStyle(L.lines.at(-1), colors) } : undefined, kicked: !waiting, paused, finished: !!report, home: g.clubs[f.home].short, away: g.clubs[f.away].short, me: me as 0 | 1, speed } : null, {
    kick: () => { L.kicked = true; setPaused(false); force((x) => x + 1); },
    pause: cxPause,
    tactics: (side) => {
      // bolden i spil: kampen kører videre, og taktikken åbner ved næste stop i spillet
      if (!report && !waiting && !paused && !sim.finished) { L.wantTactics = { side, from: sim.commentary.length, m: sim.minute }; setMsg(t('cl.mt.waitBall')); return; }
      if (!report) setPaused(true); if (tab !== 'tactics' && tab !== 'oppTactics') L.prevTab = tab; setDraft(null); setTab(side === me ? 'tactics' : 'oppTactics'); },
    speed: setSpeed,
    cont: () => done(),
    ok: () => { if (draft) sim.setTactic(me, draft); setDraft(null); setLastView(false); pull(); setTab(L.prevTab && L.prevTab !== 'tactics' ? L.prevTab : 'overview'); force((x) => x + 1); },
    back: () => setLastView(false),
    cancel: () => {
      const leave = () => { setLastView(false); setDraft(null); setTab(L.prevTab && L.prevTab !== 'tactics' ? L.prevTab : 'overview'); };
      // CM 01/02: "Changes have been made to the current tactics. Cancel all changes ?"
      if (draft && JSON.stringify(draft) !== JSON.stringify(sim.live(me as 0 | 1).tactic)) void askConfirm(t('cl.mt.cancelAll'), { head: t('cl.mt.changesMade'), title: t('nav.tactics') }).then((yes) => { if (yes) leave(); });
      else leave();
    },
  });
  // advar mod at genindlæse/lukke midt i kampen
  useEffect(() => {
    if (report) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [report]);

  return (
    <div className="match-screen">
      {/* klassisk (CM 01/02): ingen titelbjælke – resultattavlen står øverst, knapperne i sidebjælken */}
      {!classic && <Head title={`${compName(g.comps[f.comp]?.name)} – ${stageLabel(f)}`}>
        {!report && h2h && <H2hSpeed mine={hs.homeSpeed} theirs={hs.awaySpeed} name={humanManager(f.away)?.name ?? ''} onPick={(v) => { hs.homeSpeed = v; force((x) => x + 1); }} />}
        {!report && !h2h && !classic && <>
          <button data-space onClick={() => setPaused(!paused)}>{paused ? `▶ ${t('match.resume')}` : `❚❚ ${t('match.pause')}`}</button>
          {[1, 2, 4, 8].map((s) => <button key={s} className={speed === s ? 'primary small' : 'small'} onClick={() => setSpeed(s)}>{s}×</button>)}
          <button onClick={finishNow}>{t('match.toEnd')}</button>
        </>}
        {!report && !classic && (
          <select className="hl-level" value={g.options.highlights ?? 'big'} title={t('hl.level')} onChange={(e) => { g.options.highlights = e.target.value as 'big'; notify(); }}>
            {(['goals', 'big', 'all'] as const).map((k) => <option key={k} value={k}>{t('hl.level')}: {t(`hl.level.${k}`)}</option>)}
          </select>
        )}
        {report && <button className="primary continue" onClick={done}>{t('match.continue')}</button>}
      </Head>}
      {/* klassisk: taktikskærmen fylder hele siden (som i CM 01/02) */}
      {!(classic && (tab === 'tactics' || tab === 'oppTactics')) && <div className={photo ? 'cm-stage' : undefined} style={photo ? ({ '--stadium': `url("${photo}")` } as CSSProperties) : undefined}>
        <CmScoreboard home={f.home} away={f.away} hg={st[0].goals - (spoil === 0 ? 1 : 0) + (fake === 0 ? 1 : 0)} ag={st[1].goals - (spoil === 1 ? 1 : 0) + (fake === 1 ? 1 : 0)} colors={colors} classic={classic} minute={minuteLabel + (paused && !report ? ' ❚❚' : '')}
          agg={aggText(f, st[0].goals, st[1].goals)} />
        {photo && <div className="cm-stage-venue">{g.clubs[f.home]?.stadium}</div>}
      </div>}
      {!classic && <div className="muted kbd-hint" style={{ marginBottom: 8 }}>{report ? t('match.keysDone') : h2h ? '' : t('match.keys')}</div>}
      {!(classic && (tab === 'tactics' || tab === 'oppTactics')) && <Tabs tabs={classic
        ? [['overview', t('match.overview')], ['stats', t('cl.mt.stats')], ['zones', t('cl.mt.zones')], ['report', t('cl.mt.report')], ...(halfTalk ? [['talk', t('tt.tab')] as [string, string]] : [])]
        : [...(isRetro() ? [['overview', t('match.overview')] as [string, string]] : []), ['2d', t('match.pitch2d')], ['ratings', t('match.ratings')], ['commentary', t('match.commentary')], ['stats', t('match.stats')], ['scores', t('match.vidiprinter')], ['table', t('comp.table')], ['tactics', `${t('nav.tactics')} (${t('match.subsLeft', { n: myLive.subsLeft })})`], ...(halfTalk ? [['talk', t('tt.tab')] as [string, string]] : [])]} value={tab} onChange={setTab} />}
      {tab === 'talk' && halfTalk && (
        <TeamTalk fixture={id} stage="half" pids={[...myLive.on.filter((s) => !s.off).map((s) => s.id), ...myLive.bench]} diff={myGoals} ratings={liveRatings}
          onGiven={(boosts) => { sim.applyTalk(me, boosts); setTab(L.prevTab ?? '2d'); }} />
      )}
      {msg && <div className="insight">{msg}</div>}
      {/* klassisk: mellemrum gør kommentaren et trin hurtigere (efter Fastest forfra fra Very Slow) */}
      {classic && !report && !waiting && <button data-space hidden aria-hidden tabIndex={-1} onClick={() => setSpeed(CX_SPEEDS[(CX_SPEEDS.indexOf(speed) + 1) % CX_SPEEDS.length] ?? 1)} />}
      {h2h && hs.phase === 'half' && <div className="insight">{t('mp.h2hHalf', { s: halfLeft })}</div>}
      {h2h && (hs.phase === 'wait' || hs.phase === 'countdown') && (
        <div className="sim-overlay"><div className="sim-card">
          {hs.phase === 'wait' ? <>
            <h2>{t('mp.h2hWaitTitle')}</h2>
            <div className="muted">{t('mp.h2hWaitAway', { name: awayName })}</div>
            <div className="sim-bar"><span /></div>
            {Date.now() - hs.waitSince > 60_000 && <button className="small" onClick={() => { hs.solo = true; sim.opts.aiSubs = [false, true]; hs.awayReady = true; }}>{t('mp.h2hStartAlone', { name: awayName })}</button>}
          </> : <>
            <div className="countdown">{countdown || '⚽'}</div>
            <h2>{t('mp.h2hKickoff')}</h2>
          </>}
        </div></div>
      )}
      {(tab === 'overview' || (classic && tab === '2d')) && (
        <CxOverview f={f} colors={colors} line={L.lines.at(-1)} poss={L.poss5 ?? []} half={waiting ? t('cl.mt.koLabel') : sim.finished ? t('match.ft') : L.atHalf ? t('cl.mt.halfTime') : sim.half === 2 ? t('match.half2') : t('match.half1')} ht={L.ht}
          injuries={sim.events.filter((e) => e.k === 'injury' && e.p).map((e) => ({ t: e.t, p: e.p!, m: e.m }))}
          shootout={classic ? sim.shootout?.kicks : undefined}
          goals={sim.events.filter((e, i, all) => e.k === 'goal' && !(spoil === e.t && !all.slice(i + 1).some((x) => x.k === 'goal' && x.t === e.t))).map((e) => ({ t: e.t, p: e.p ?? 0, m: e.m, og: e.og }))} />
      )}
      {classic && tab === 'stats' && <CxMatchStats st={[st[0], st[1]]} />}
      {classic && tab === 'zones' && <CxZones z={L.zones ?? [1, 1, 1]} zp={L.zposs} st={[st[0], st[1]]} colors={colors} />}
      {classic && tab === 'report' && <CxReport lines={L.lines} sim={sim} ctx={{ home, away, score: `${home} ${sim.teams[0].stats.goals}-${sim.teams[1].stats.goals} ${away}`, ref: refereeFor(f).name }} />}
      {classic && tab === 'hstats' && <CxTeamStats sim={sim} side={0} />}
      {classic && tab === 'astats' && <CxTeamStats sim={sim} side={1} />}
      {classic && tab === 'ratings' && <CxRatings sim={sim} />}
      {classic && tab === 'table' && <CxLiveTable f={f} live={[st[0].goals, st[1].goals]} others={others} minute={sim.minute} finished={sim.finished} kicked={!waiting} />}
      {classic && tab === 'scores' && <CxScores own={waiting ? undefined : { f, scorers: sim.events.filter((e) => e.k === 'goal').map((e) => [e.m, e.t, e.og ? undefined : e.p] as [number, number, number?]) }} others={others} minute={sim.minute} finished={sim.finished} title={t('cl.mt.latest', { comp: compName(g.comps[f.comp]?.name) })} />}
      {classic && !(tab === 'tactics' || tab === 'oppTactics') && (
        <>
          <ClassicSub items={[['hstats', t('cl.mt.teamStats', { club: g.clubs[f.home].short })], ['ratings', t('match.ratings')], ['scores', t('cl.mt.scores')], ...(g.comps[f.comp]?.type === 'league' ? [['table', t('cl.mt.leagueTable')]] : []), ['astats', t('cl.mt.teamStats', { club: g.clubs[f.away].short })]].map(([k, l]) => ({ key: k, label: l, on: tab === k, onClick: () => setTab(k) }))} />
        </>
      )}
      {tab === 'oppTactics' && <OppTactics sim={sim} side={(1 - me) as 0 | 1} club={g.clubs[me === 0 ? f.away : f.home]?.name ?? ''} />}
      {tab === '2d' && !classic && (
        <div className="cols match2d">
          <div style={{ position: 'relative' }}>
            {hl ? (
              <Pitch2D weather={weatherFor(f)} snap={hl.frames[hl.i]} me={me} colors={colors} minute={minute} stepMs={frameMs * 0.9}
                banner={hl.texts[hl.i] ?? ''} bannerCls={(hl.i === hl.frames.length - 1 && hl.outcome === 'goal') || hl.flashes?.[hl.i] === t('hl.goal') ? 'goal' : ''}
                flash={hl.flashes ? hl.flashes[hl.i] : hl.i === hl.frames.length - 1 && hl.outcome !== 'none' ? t(`hl.${hl.outcome}`) : undefined} shootout={soTally} />
            ) : (
              // mellem højdepunkterne: holdene i ro i deres formation
              <Pitch2D weather={weatherFor(f)} snap={sim.shootout ? shootoutIdle(sim.pitch(), sim.shootout.kicks.length % 2) : { ...sim.pitch(), shot: null }} me={me} colors={colors} minute={minute} stepMs={600}
                banner={L.lines.at(-1)?.text ?? ''} bannerCls={L.lines.at(-1)?.cls ?? ''} shootout={soTally} />
            )}
            {hl && <div className="p2d-replay">{t(hl.label ?? ('corner' in hl.frames[0] ? 'hl.corner' : 'hl.chance'))}</div>}
          </div>
          <div className="commentary" style={{ height: 'auto', maxHeight: 520 }}>
            {lastLines(hl?.reveal ? L.lines.slice(0, hl.hideFrom + hl.reveal[hl.i]) : hl && hl.i < hl.frames.length - 1 ? L.lines.slice(0, hl.hideFrom) : L.lines, 14).map(([l, k]) => <div key={k} className={`ln ${l.cls}`}><span className="m">{l.m}'</span>{l.text}</div>)}
          </div>
        </div>
      )}
      {tab === 'commentary' && (
        <div className="cols match-comm">
          <div className="commentary" ref={boxRef}>
            {(hl?.reveal ? L.lines.slice(0, hl.hideFrom + hl.reveal[hl.i]) : L.lines).map((l, i) => <div key={i} className={`ln ${l.cls}`}><span className="m">{l.m}'</span>{l.text}</div>)}
          </div>
          <Panel title={t('match.vidiprinter')}>
            <div className="vidiprinter">
              {others.map((o) => {
                const goals = o.result!.scorers.filter(([m]) => m <= (sim.finished ? 200 : sim.minute));
                const hg = goals.filter(([, tm]) => tm === 0).length, ag = goals.length - hg;
                return <div key={o.id}>{g.clubs[o.home]?.short} {hg}-{ag} {g.clubs[o.away]?.short}</div>;
              })}
              {others.length === 0 && <span className="muted">{t('match.noOther')}</span>}
            </div>
          </Panel>
        </div>
      )}
      {tab === 'stats' && !classic && <StatsPanel stats={[st[0], st[1]]} home={home} away={away} colors={statColors(f.home, f.away, me)} />}
      {tab === 'ratings' && !classic && <RatingsBoard sim={sim} colors={colors} />}
      {tab === 'scores' && !classic && (
        <Panel title={t('match.vidiprinter')}>
          <div className="vidiprinter cm-scores">
            {others.map((o) => {
              const goals = o.result!.scorers.filter(([m]) => m <= (sim.finished ? 200 : sim.minute));
              const hg = goals.filter(([, tm]) => tm === 0).length, ag = goals.length - hg;
              return <div key={o.id}><span>{g.clubs[o.home]?.name}</span><b>{hg} - {ag}</b><span>{g.clubs[o.away]?.name}</span></div>;
            })}
            {others.length === 0 && <span className="muted">{t('match.noOther')}</span>}
          </div>
        </Panel>
      )}
      {tab === 'table' && !classic && g.comps[f.comp]?.type === 'league' && (g.comps[f.comp].splitDone ? <LeagueTables comp={g.comps[f.comp]} /> : <Panel className="flush"><LeagueTable rows={leagueRows(g.comps[f.comp])} comp={g.comps[f.comp]} /></Panel>)}
      {tab === 'table' && !classic && g.comps[f.comp]?.type !== 'league' && <div className="muted">{t('match.noTable')}</div>}
      {!report && !classic && <div className="muted leave-note">⚠️ {t(h2h ? 'match.leaveH2h' : g.humans ? 'match.leaveMp' : 'match.leaveSp', { name: awayName })}</div>}
      {!classic && <div className="cm-venue">{g.clubs[f.home]?.stadium}{g.clubs[f.home]?.name ? `, ${g.clubs[f.home]?.name}` : ''} · {WEATHER_ICON[weatherFor(f)]} {t(`wx.${weatherFor(f)}`)}{pitchFor(f) !== 'normal' ? ` · ${t(`pitch.${pitchFor(f)}`)}` : ''} · {t('ref.label')}: {refereeFor(f).name}</div>}
      {classic && tab === 'tactics' && !report && (
        <OppTactics sim={sim} side={me as 0 | 1} club={g.clubs[g.userClub]?.name ?? ''} editable draft={draft} setDraft={setDraft} base={L.baseTactic} lastView={lastView} onLastMatch={() => setLastView(true)}
          onSub={(out, inn) => {
            const ok = sim.substitute(me, out, inn); setMsg(ok ? '' : t('match.subFailed')); pull(); force((x) => x + 1);
            // CM 01/02: "19 Yorke has been brought on to replace 10 van Nistelrooy. Return to the match ?"
            if (ok) {
              const nm = (id: number) => { const p = g.players[id]; return `${p?.number ?? ''} ${p ? `${p.first} ${p.last}`.trim() : ''}`.trim(); };
              void askConfirm(t('cl.mt.subDone', { inn: nm(inn), out: nm(out) }), { head: t('cl.mt.confirm') }).then((yes) => { if (yes) { setTab('overview'); setPaused(false); } });
            }
          }} />
      )}
      {tab === 'tactics' && !report && !classic && (
        <SubsPanel sim={sim} me={me} live={myLive} onDone={(ok) => { setMsg(ok ? '' : t('match.subFailed')); pull(); force((x) => x + 1); }} />
      )}
      {tab === 'tactics' && !report && !classic && (
        <TacticEditor key="m" tactic={myLive.tactic} players={squad(g.userClub).filter((p) => myLive.on.some((s) => s.id === p.id && !s.off) || myLive.bench.includes(p.id))} matchMode
          cond={Object.fromEntries(myLive.on.map((s) => [s.id, s.cond]))}
          onChange={(tac) => { sim.setTactic(me, tac); pull(); force((x) => x + 1); }}
          onSub={(out, inn) => { const ok = sim.substitute(me, out, inn); setMsg(ok ? '' : t('match.subFailed')); pull(); force((x) => x + 1); }} />
      )}
    </div>
  );
}

/** Udskiftninger under kampen: bænken som tydelige kort – vælg hvem der skal ud */
function SubsPanel({ sim, me, live, onDone }: { sim: MatchSim; me: number; live: ReturnType<MatchSim['live']>; onDone: (ok: boolean) => void }) {
  const g = useGame()!;
  const onPitch = live.on.filter((s) => !s.off);
  const slotName = (slot: number) => { const sl = live.tactic.slots[slot]; return sl ? `${sl.pos}${sl.side !== 'C' ? sl.side : ''}` : ''; };
  return (
    <Panel title={`${t('match.subsTitle')} · ${t('match.subsLeft', { n: live.subsLeft })}`} className="subs-panel">
      {live.bench.length === 0 && <div className="muted">{t('common.none')}</div>}
      <div className="subs-grid">
        {live.bench.map((bid) => {
          const p = g.players[bid];
          if (!p) return null;
          return (
            <div key={bid} className="sub-card">
              <div className="sub-head"><span className="tag">{posStr(p)}</span><PlayerLink p={p} short /></div>
              <div className="row muted" style={{ fontSize: 12 }}><Bar value={p.condition} /> {Math.round(p.condition)}%</div>
              {live.subsLeft > 0 ? (
                <select value="" onChange={(e) => onDone(sim.substitute(me, Number(e.target.value), bid))}>
                  <option value="">{t('match.subInFor')}</option>
                  {onPitch.map((s) => <option key={s.id} value={s.id}>{slotName(s.slot)} {g.players[s.id]?.last} – {Math.round(s.cond)}%{s.yellow ? ' 🟨' : ''}{s.injured ? ' ✚' : ''} ({s.rating.toFixed(1)})</option>)}
                </select>
              ) : <span className="muted">{t('match.noSubsLeft')}</span>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/** Tempo i en kamp mellem to managere: hver vælger, og det langsomste valg gælder */
function H2hSpeed({ mine, theirs, name, onPick }: { mine: number; theirs: number; name: string; onPick: (v: number) => void }) {
  const eff = Math.min(mine, theirs);
  return (
    <>
      <span className="muted nowrap" title={t('mp.h2hSpeedHint')}>{t('mp.h2hSpeedNow', { x: eff })}{theirs !== mine ? ` · ${t('mp.h2hSpeedTheirs', { name, x: theirs })}` : ''}</span>
      {[1, 2, 4].map((v) => <button key={v} className={mine === v ? 'primary small' : 'small'} title={t('mp.h2hSpeedHint')} onClick={() => onPick(v)}>{v}×</button>)}
    </>
  );
}

/** Det, hjemmeholdet sender til udeholdet under en kamp mellem to managere */
type FollowData = {
  seq: number; phase: 'wait' | 'countdown' | 'play' | 'half'; awayReady: boolean; homeSpeed: number; awaySpeed: number; countdown: number; halfLeft: number;
  minute: string; hg: number; ag: number; finished: boolean; stats: [MatchReport['stats'][0], MatchReport['stats'][1]];
  lines: { text: string; cls: string; m: number }[]; live: [LiveTeam, LiveTeam]; events: MatchSim['events'];
  snap: Snap; banner: string; flash?: string; report?: MatchReport;
};

/** Udeholdet spiller med live: kampen kører hos hjemmeholdet i fast tempo – vi sender klar, taktik, udskiftninger og peptalk */
function FollowMatch({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const f = g.fixtures[id];
  const sess = session()!;
  const [data, setData] = useState<FollowData | null>(null);
  const [tab, setTab] = useState('2d');
  const [sent, setSent] = useState('');
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  readyRef.current = ready;
  const lastReadySent = useRef(0);
  const [talked, setTalked] = useState(false);
  const [mySpeed, setMySpeed] = useState(1);
  const lastSeq = useRef({ seq: -1, at: Date.now() });
  const [, force] = useState(0);
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const d = await sess.liveGet<FollowData>(id);
        if (!stop && d) {
          if (d.seq !== lastSeq.current.seq) lastSeq.current = { seq: d.seq, at: Date.now() };
          // hjemmeholdet har genindlæst, og kampen venter forfra: send vores "klar" igen
          if (d.phase === 'wait' && !d.awayReady && readyRef.current && Date.now() - lastReadySent.current > 3000) {
            lastReadySent.current = Date.now();
            void sess.liveCmd(id, { k: 'ready' }).catch(() => {});
          }
          setData(d);
        }
      } catch { /* prøv igen */ }
      if (!stop) { force((x) => x + 1); setTimeout(tick, 1000); }
    };
    void tick();
    // livstegn, så hjemmeholdet ved, at vi stadig er her
    const ping = setInterval(() => { void sess.liveCmd(id, { k: 'ping' }).catch(() => {}); }, 8000);
    return () => { stop = true; clearInterval(ping); };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const colors = teamColors(f.home, f.away, 1);
  const homeMgr = humanManager(f.home)?.name ?? '';
  const send = (cmd: LiveCmd, label?: string) => { void sess.liveCmd(id, cmd).then(() => { if (label) setSent(label); }).catch(() => setSent(t('mp.followFail'))); };
  const sayReady = () => { setReady(true); lastReadySent.current = Date.now(); send({ k: 'ready' }); };
  const skip = () => { skippedMatches.add(id); nav({ name: 'inbox' }); };
  const lost = !!data && !data.finished && Date.now() - lastSeq.current.at > 30_000;
  useEffect(() => {
    if (data?.finished) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [data?.finished]);
  const head = <Head title={`${compName(g.comps[f.comp]?.name)} – ${stageLabel(f)}`}>{data && !data.finished && <H2hSpeed mine={mySpeed} theirs={data.homeSpeed} name={homeMgr} onPick={(v) => { setMySpeed(v); send({ k: 'speed', v }); }} />}{data?.finished && <button className="primary continue" onClick={() => { if (data.report) act({ t: 'matchResult', fixture: id, rep: data.report }); nav({ name: data.report ? 'report' : 'inbox', id }); }}>{t('match.continue')}</button>}</Head>;
  // før kampen: klar-tjek og nedtælling
  if (!data || data.phase === 'wait' || data.phase === 'countdown') {
    const iAmReady = ready;
    return (
      <div>
        {head}
        <Scoreboard home={f.home} away={f.away} hg={null} ag={null} minute={t('match.preview')} />
        <div className="sim-card" style={{ margin: '16px auto' }}>
          {data?.phase === 'countdown' ? <><div className="countdown">{data.countdown || '⚽'}</div><h2>{t('mp.h2hKickoff')}</h2></> : <>
            <h2>{t('mp.h2hWaitTitle')}</h2>
            <div className="muted">{iAmReady ? t(data ? 'mp.h2hYouReady' : 'mp.h2hWaitHome', { name: homeMgr }) : t('mp.h2hPressReady', { name: homeMgr, min: g.options.h2hHalfMinutes ?? 3 })}</div>
            {!iAmReady ? <button className="primary continue" onClick={sayReady}>{t('mp.h2hReady')}</button> : <div className="sim-bar"><span /></div>}
            <button className="small" onClick={skip}>{t('mp.h2hSkip')}</button>
          </>}
        </div>
      </div>
    );
  }
  const mine = data.live[1];
  const proxy = { events: data.events, live: (tm: number) => data.live[tm] } as unknown as MatchSim;
  const subProxy = { substitute: (_t: number, out: number, inn: number) => { send({ k: 'sub', out, inn }, t('mp.followSubSent', { a: g.players[inn]?.last ?? '', b: g.players[out]?.last ?? '' })); return true; } } as unknown as MatchSim;
  const players = squad(g.userClub).filter((p) => mine.on.some((x) => x.id === p.id && !x.off) || mine.bench.includes(p.id));
  return (
    <div>
      {head}
      <CmScoreboard home={f.home} away={f.away} hg={data.hg} ag={data.ag} colors={colors} minute={data.minute} />
      <div className="muted kbd-hint" style={{ marginBottom: 8 }}>{t('mp.followHint', { name: homeMgr })} · ⚠️ {t('match.leaveAway', { name: homeMgr })}</div>
      {lost && <div className="insight bad">{t('mp.h2hLost', { name: homeMgr })} <button className="small" onClick={skip}>{t('mp.h2hSkip')}</button></div>}
      {data.phase === 'half' && !talked && !gs().draft && (
        <>
          <div className="insight">{t('mp.h2hHalf', { s: data.halfLeft })}</div>
          <TeamTalk fixture={id} stage="half" pids={[...mine.on.filter((x) => !x.off).map((x) => x.id), ...mine.bench]} diff={data.ag - data.hg}
            ratings={Object.fromEntries(mine.on.filter((x) => !x.off).map((x) => [x.id, Math.round(x.rating * 10) / 10]))}
            onGiven={(boosts) => { setTalked(true); send({ k: 'talk', boosts }); }} />
        </>
      )}
      {data.phase === 'half' && talked && <div className="insight">{t('mp.h2hHalf', { s: data.halfLeft })}</div>}
      <Tabs tabs={[['2d', t('match.pitch2d')], ['ratings', t('match.ratings')], ['stats', t('match.stats')], ['tactics', `${t('nav.tactics')} (${t('match.subsLeft', { n: mine.subsLeft })})`]]} value={tab} onChange={setTab} />
      {sent && <div className="insight">{sent}</div>}
      {tab === '2d' && (
        <div className="cols match2d">
          <Pitch2D snap={data.snap} me={1} colors={colors} minute={data.minute} stepMs={800} banner={data.banner} bannerCls="" flash={data.flash} />
          <div className="commentary" style={{ height: 'auto', maxHeight: 520 }}>
            {lastLines(data.lines, 14).map(([l, k]) => <div key={`${k}-${l.m}-${l.text.length}`} className={`ln ${l.cls}`}><span className="m">{l.m}'</span>{l.text}</div>)}
          </div>
        </div>
      )}
      {tab === 'ratings' && <RatingsBoard sim={proxy} colors={colors} />}
      {tab === 'stats' && <StatsPanel stats={data.stats} home={g.clubs[f.home].name} away={g.clubs[f.away].name} colors={statColors(f.home, f.away, f.away === g.userClub ? 1 : 0)} />}
      {tab === 'tactics' && !data.finished && (
        <>
          <SubsPanel sim={subProxy} me={1} live={mine} onDone={() => {}} />
          <TacticEditor tactic={mine.tactic} players={players} matchMode
            onChange={(tac) => send({ k: 'tactic', tac }, t('mp.followTacticSent'))}
            onSub={(out, inn) => send({ k: 'sub', out, inn }, t('mp.followSubSent', { a: g.players[inn]?.last ?? '', b: g.players[out]?.last ?? '' }))} />
        </>
      )}
    </div>
  );
}

export function StatsPanel({ stats, home, away, colors }: { stats: [MatchReport['stats'][0], MatchReport['stats'][1]]; home: string; away: string; colors?: [string, string] }) {
  const possSum = stats[0].possession + stats[1].possession;
  const pct0 = possSum > 0 ? Math.round((100 * stats[0].possession) / possSum) : 50;
  const rows: [string, number, number, boolean?][] = [
    // besiddelse i procent (under kampen tælles der i øjeblikke) – altid 100 % i alt
    ['possession', pct0, 100 - pct0],
    ...(extended() ? [['xg', stats[0].xg, stats[1].xg, true] as [string, number, number, boolean]] : []),
    ['shots', stats[0].shots, stats[1].shots],
    ['onTarget', stats[0].onTarget, stats[1].onTarget],
    ['corners', stats[0].corners, stats[1].corners],
    ['fouls', stats[0].fouls, stats[1].fouls],
    ['yellows', stats[0].yellows, stats[1].yellows],
    ['reds', stats[0].reds, stats[1].reds],
    ['offsides', stats[0].offsides, stats[1].offsides],
    ['passPct', Math.round((stats[0].passesCompleted / Math.max(1, stats[0].passes)) * 100), Math.round((stats[1].passesCompleted / Math.max(1, stats[1].passes)) * 100)],
  ];
  return (
    <Panel title={`${home} – ${away}`}>
      {rows.map(([k, h, a, dec]) => {
        const tot = h + a || 1;
        return (
          <div key={k} className="statline">
            <span className="h">{dec ? h.toFixed(2) : h}{k === 'possession' || k === 'passPct' ? '%' : ''}</span>
            <span className="lbl">{t(`stat.${k}`)}</span>
            <span className="a">{dec ? a.toFixed(2) : a}{k === 'possession' || k === 'passPct' ? '%' : ''}</span>
            <div className="statbar"><i style={{ width: `${(h / tot) * 100}%`, background: colors?.[0] }} /><i style={{ width: `${(a / tot) * 100}%`, background: colors?.[1] }} /></div>
          </div>
        );
      })}
    </Panel>
  );
}

/** Kommentarlinjer, hvor bolden er ude af spil (taktikken kan åbnes) */
const DEAD_BALL = new Set(['foul', 'freekick', 'corner', 'corner-edge', 'short-corner', 'offside', 'yellow', 'red', 'injury', 'sub', 'halftime', 'kickoff', 'penalty', 'gk-holds', 'gk-claims', 'long-throw', 'second-yellow', 'professional-foul', 'dive-booked', 'own-goal', 'score', 'time-waste', 'fk-wall']);

type InstrKey = 'runs' | 'longShots' | 'crossing' | 'passing' | 'tackling' | 'closingDown' | 'runWithBall' | 'throughBalls' | 'tightMarking' | 'freeRole' | 'holdUp' | 'setPieces';
/** View-menuens kolonner (CM 01/02): Condition/Rating eller én spillerinstruktion – klik på værdien skifter den */
const VIEW_COLS: { k: InstrKey; n: number }[] = [
  { k: 'passing', n: 3 }, { k: 'tackling', n: 3 }, { k: 'closingDown', n: 3 }, { k: 'runs', n: 3 }, { k: 'runWithBall', n: 2 }, { k: 'longShots', n: 3 },
  { k: 'throughBalls', n: 2 }, { k: 'crossing', n: 3 }, { k: 'tightMarking', n: 2 }, { k: 'freeRole', n: 2 }, { k: 'holdUp', n: 2 }, { k: 'setPieces', n: 3 },
];
const instrVal = (tac: Tactic, slot: number, k: InstrKey): number => {
  const v = (tac.individual[slot] as unknown as Record<string, number | boolean | undefined>)?.[k];
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === undefined) return k === 'passing' ? tac.team.passing : k === 'tackling' ? tac.team.tackling : k === 'closingDown' ? tac.team.closingDown : 1;
  return v;
};
const instrLabel = (k: InstrKey, v: number, n: number) => (n === 2 ? t(v ? 'common.yes' : 'common.no') : t(`cl.mt.lvl.${k === 'passing' ? 'p' : k === 'tackling' ? 't' : 'g'}${v}`));

type TiKey = 'mentality' | 'passing' | 'tackling' | 'closingDown' | 'offside' | 'counter' | 'menBehind';
/** Valgmulighederne i Team Instructions (CM 01/02): [tekst, værdi]; markeret = værdien passer (ekstremerne tæller med) */
const TI_CHOICES: { k: TiKey; opts: [string, number][]; is: (v: number, o: number) => boolean }[] = [
  { k: 'mentality', opts: [['cl.mt.ti.m2', 2], ['cl.mt.ti.m1', 1], ['cl.mt.ti.m3', 3]], is: (v, o) => (o === 2 ? v === 2 : o === 1 ? v <= 1 : v >= 3) },
  { k: 'passing', opts: [['cl.mt.ti.p1', 1], ['cl.mt.ti.p0', 0], ['cl.mt.ti.p2', 2]], is: (v, o) => v === o },
  { k: 'tackling', opts: [['cl.mt.ti.t1', 1], ['cl.mt.ti.t0', 0], ['cl.mt.ti.t2', 2]], is: (v, o) => v === o },
  { k: 'closingDown', opts: [['common.no', 1], ['common.yes', 2]], is: (v, o) => (o === 2 ? v >= 2 : v <= 1) },
  { k: 'offside', opts: [['common.no', 0], ['common.yes', 1]], is: (v, o) => v === o },
  { k: 'counter', opts: [['common.no', 0], ['common.yes', 1]], is: (v, o) => v === o },
  { k: 'menBehind', opts: [['common.no', 0], ['common.yes', 1]], is: (v, o) => v === o },
];
const TI_LABEL: Record<TiKey, string> = { mentality: 'cl.mt.ti.mentality', passing: 'cl.mt.ti.passing', tackling: 'cl.mt.ti.tackling', closingDown: 'cl.mt.ti.pressing', offside: 'cl.mt.ti.offside', counter: 'cl.mt.ti.counter', menBehind: 'cl.mt.ti.menBehind' };
type TakerKey = 'freeKicks' | 'freeKicksR' | 'corners' | 'cornersR' | 'playmaker';
const TAKERS: TakerKey[] = ['freeKicks', 'freeKicksR', 'corners', 'cornersR', 'playmaker'];

/** Den grønne Team Instructions-boks fra CM 01/02: valg i kolonner (det valgte i en gul ramme), dødboldsskytter og
 *  playmaker via ◂-knappen (grøn liste), Cancel/Ok nederst. Ændringerne gælder først ved Ok. */
function TeamInstrDialog({ tac, on, editable, onClose, onOk }: { tac: Tactic; on: number[]; editable: boolean; onClose: () => void; onOk: (f: (t: Tactic) => Tactic) => void }) {
  const g = useGame()!;
  const [ti, setTi] = useState(() => ({ ...tac.team }));
  const [tk, setTk] = useState<Record<TakerKey, number>>(() => ({ freeKicks: tac.freeKicks, freeKicksR: tac.freeKicksR ?? tac.freeKicks, corners: tac.corners, cornersR: tac.cornersR ?? tac.corners, playmaker: tac.team.playmaker ?? 0 }));
  const [pick, setPick] = useState<TakerKey | null>(null);
  useClassicDialog(true);
  const short = (id: number) => { const p = g.players[id]; return p ? `${p.first ? `${p.first[0]}.` : ''}${p.last}` : ''; };
  const val = (k: TiKey) => { const v = ti[k]; return typeof v === 'boolean' ? (v ? 1 : 0) : (v ?? 0); };
  const set = (k: TiKey, o: number) => {
    if (!editable) return;
    setTi((x) => {
      const n = { ...x };
      if (k === 'offside' || k === 'counter' || k === 'menBehind') n[k] = o === 1;
      else if (k === 'closingDown') n.closingDown = o === 2 ? 2 : Math.min(x.closingDown, 1);
      else n[k] = o;
      return n;
    });
  };
  return (
    <div className="cx-tidlg" role="dialog" onClick={() => setPick(null)}>
      <div className="cx-tidlg-head">{t('cl.mt.teamInstr')}</div>
      <div className="cx-tidlg-grid">
        {TI_CHOICES.map((c) => (
          <div key={c.k} className="cx-tidlg-row"><span className="cx-tidlg-lbl">{t(TI_LABEL[c.k])}</span>
            {c.opts.map(([l, o]) => <button key={l} className={`cx-tich ${c.is(val(c.k), o) ? 'on' : ''}`} disabled={!editable} onClick={() => set(c.k, o)}>{t(l)}</button>)}
          </div>
        ))}
        {TAKERS.map((k) => (
          <div key={k} className="cx-tidlg-row"><span className="cx-tidlg-lbl">{t(`cl.mt.ti.${k}`)}</span>
            <span className="cx-tidlg-pick">
              <button className="cx-tidlg-arrow" disabled={!editable} onClick={(e) => { e.stopPropagation(); setPick(pick === k ? null : k); }}>◂</button>
              {pick === k && (
                <div className="cx-tidlg-menu" onClick={(e) => e.stopPropagation()}>
                  {k === 'playmaker' && <button className={!tk.playmaker ? 'on' : ''} onClick={() => { setTk({ ...tk, playmaker: 0 }); setPick(null); }}>{t('common.none')}</button>}
                  {on.map((id) => <button key={id} className={tk[k] === id ? 'on' : ''} onClick={() => { setTk({ ...tk, [k]: id }); setPick(null); }}>{g.players[id]?.number ?? ''} {short(id)}</button>)}
                </div>
              )}
            </span>
            <span className="cx-tidlg-name">{tk[k] ? short(tk[k]) : ''}</span>
          </div>
        ))}
      </div>
      <div className="cx-ts-buttons cx-tidlg-foot">
        <button onClick={onClose}>{t('common.cancel')}</button>
        <button className="primary" disabled={!editable} onClick={() => onOk((t2) => ({ ...t2, team: { ...ti, playmaker: tk.playmaker || undefined }, freeKicks: tk.freeKicks, freeKicksR: tk.freeKicksR, corners: tk.corners, cornersR: tk.cornersR }))}>{t('common.ok')}</button>
      </div>
    </div>
  );
}

/** Last Match (CM 01/02): startopstillingen fra sidste kamp – kun til at se på; Back nederst fører tilbage */
function LastMatchView({ tac, club }: { tac: Tactic; club: string }) {
  const g = useGame()!;
  const { nav: navP } = useNav();
  const ids = tac.lineup.filter(Boolean);
  return (
    <div className="cx-mt cx-mt-last">
      <div className="cx-title cx-title-plain"><h2>{t('cl.mt.oppTitle', { club })}</h2></div>
      <div className="cx-subtitle small">{t('cl.mt.lastMatch')}</div>
      <div className="cx-mt-cols">
        <div className="cx-mt-list">
          <div className="cx-mt-form">{tac.formation}</div>
          <table className="cx-tbl"><tbody>{ids.map((id) => {
            const p = g.players[id];
            return (
              <tr key={id}>
                <td className="btn-col"><span className="cx-rowbtn narrow">{p?.number ?? ''}</span></td>
                <td className="c-name">{p ? <span className="link" onClick={(e) => { e.stopPropagation(); navP({ name: 'player', id: p.id }); }}>{`${p.first} ${p.last}`.trim()}</span> : '?'}</td>
                <td className="c-pos">{tac.captain === id ? <span className="cx-capt">capt</span> : ''}</td>
                <td className="c-yel">{p ? posStr(p) : ''}</td>
              </tr>
            );
          })}</tbody></table>
        </div>
        <div className="cx-mt-pcol">
          <div className="cx-tac-pitch">
            <svg className="lines" viewBox="0 0 68 100" preserveAspectRatio="none">
              <g stroke="#ffffff88" strokeWidth="0.35" fill="none">
                <rect x="1" y="1" width="66" height="98" /><line x1="1" y1="50" x2="67" y2="50" /><circle cx="34" cy="50" r="9" />
                <rect x="14" y="1" width="40" height="16" /><rect x="14" y="83" width="40" height="16" /><rect x="25" y="1" width="18" height="6" /><rect x="25" y="93" width="18" height="6" />
              </g>
            </svg>
            {tac.lineup.map((id, i) => {
              const sl = tac.slots[i];
              if (!id || !sl) return null;
              return (
                <div key={id} className="cx-tac-slot" style={{ left: `${sl.y}%`, top: `${97 - sl.x * 0.92}%` }}>
                  <span className={`cx-tac-dot cx-mt-dot ${sl.pos === 'GK' ? 'gk' : ''}`}>{g.players[id]?.number ?? ''}</span>
                  <span className="cx-tac-nm">{g.players[id]?.last ?? ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Et holds taktik under kampen som i CM 01/02: titel i holdets farver, View (kolonner), Tactics-menuen (holdinstruktioner,
 * straffesparksskytter, formationer, gem/hent/slet, Set To Default), listen og banen. Eget hold: ændringer samles i en kladde
 * (draft) og gælder først ved Ok i sidebjælken; træk en udskifter ind på en spiller for at skifte (sker med det samme).
 * Højreklik på en spiller på banen: løb frem (ofte/blandet/sjældent).
 */
function OppTactics({ sim, side, club, editable, onSub, draft, setDraft, lastView, onLastMatch }: {
  sim: MatchSim; side: 0 | 1; club: string; editable?: boolean; onSub?: (out: number, inn: number) => void;
  draft?: Tactic | null; setDraft?: (t: Tactic) => void; base?: Tactic; lastView?: boolean; onLastMatch?: () => void;
}) {
  const g = useGame()!;
  // navnene åbner spillerens profil (Back fører tilbage til kampen)
  const { nav: navP } = useNav();
  const lv = sim.live(side);
  const [drag, setDrag] = useState<number | null>(null);
  const [pane, setPane] = useState<'list' | 'ti' | 'save'>('list');
  const [saveName, setSaveName] = useState('');
  const [note, setNote] = useState('');
  const [dragCapt, setDragCapt] = useState(false);
  const pitchRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'cond' | InstrKey>('cond');
  const [pv, setPv] = useState<'ov' | 'with' | 'without'>('ov');
  const [ctx, setCtx] = useState<{ slot: number; x: number; y: number } | null>(null);
  const tac = (editable && draft) || lv.tactic;
  const edit = (f: (t: Tactic) => Tactic) => { if (editable && setDraft) setDraft(f(structuredClone(tac))); };
  const on = lv.on.filter((s) => !s.off);
  const pl = (id: number) => g.players[id];
  const drop = (target: number) => {
    if (!editable) return;
    // "capt" trukket over på en anden spiller på banen
    if (dragCapt) { if (on.some((x) => x.id === target)) edit((t2) => ({ ...t2, captain: target })); setDragCapt(false); return; }
    if (drag === null || drag === target) return;
    const a = on.some((s) => s.id === drag), b = on.some((s) => s.id === target);
    if (a && !b && lv.bench.includes(target)) onSub?.(drag, target);
    else if (!a && b && lv.bench.includes(drag)) onSub?.(target, drag);
    // to spillere på banen: byt pladser
    else if (a && b) edit((t2) => { const i1 = t2.lineup.indexOf(drag), i2 = t2.lineup.indexOf(target); if (i1 >= 0 && i2 >= 0) { t2.lineup[i1] = target; t2.lineup[i2] = drag; } return t2; });
    setDrag(null);
  };
  /** en spiller trukket ud på en tom plet på banen: hans plads flyttes dertil */
  const dropOnPitch = (e: React.DragEvent) => {
    e.preventDefault();
    if (!editable || drag === null || !pitchRef.current) return;
    const r = pitchRef.current.getBoundingClientRect();
    const y = ((e.clientX - r.left) / r.width) * 100;
    const x = (97 - ((e.clientY - r.top) / r.height) * 100) / 0.92;
    // CM 01/02: spilleren lander på den nærmeste faste plads
    const s = snapSlot(x, y);
    edit((t2) => { const i = t2.lineup.indexOf(drag); if (i >= 0 && t2.slots[i].pos !== 'GK' && !slotTaken(t2.slots, i, s)) { t2.slots[i] = s; t2.formation = shapeName(t2.slots); } return t2; });
    setDrag(null);
  };
  type Row = { id: number; num?: number; note?: string; cond?: number; rating?: number; goals?: number; dim: boolean; live: boolean; slot?: number };
  const rows: Row[] = [
    // skadede spillere står grå med "inj 88" (som i CM 01/02)
    ...on.map((s) => { const inj = s.injured ? sim.events.find((e) => e.k === 'injury' && e.p === s.id)?.m : undefined; return { id: s.id, num: s.num, note: s.injured ? `inj ${inj ?? ''}`.trim() : s.enteredAt ? `on ${s.enteredAt}` : undefined, cond: s.cond, rating: s.rating, goals: s.goals, dim: !!s.injured, live: true, slot: s.slot }; }),
    // ude af kampen uden udskiftning (rødt kort eller skadet uden flere udskiftninger)
    ...lv.on.filter((s) => s.off).map((s) => ({ id: s.id, num: s.num, note: s.red ? 'off' : `inj ${sim.events.find((e) => e.k === 'injury' && e.p === s.id)?.m ?? ''}`.trim(), rating: s.rating, goals: s.goals, dim: true, live: false })),
    ...lv.gone.map((s) => ({ id: s.id, num: s.num, note: `sub ${sim.events.find((e) => e.k === 'sub' && e.p2 === s.id)?.m ?? ''}`.trim(), rating: s.rating, goals: s.goals, dim: true, live: false })),
    ...lv.bench.map((id) => ({ id, num: pl(id)?.number, dim: true, live: false })),
  ];
  const dnd = (id: number, canDrag: boolean) => ({
    draggable: editable && canDrag,
    onDragStart: (e: React.DragEvent) => { e.dataTransfer.setData('text/plain', String(id)); setTimeout(() => setDrag(id), 0); },
    onDragEnd: () => setTimeout(() => setDrag(null), 0),
    onDragOver: (e: React.DragEvent) => { if (editable) e.preventDefault(); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); drop(id); },
  });
  const vc = VIEW_COLS.find((c) => c.k === view);
  const cycle = (slot: number) => vc && edit((t2) => {
    const cur = instrVal(t2, slot, vc.k);
    const next = (cur + 1) % vc.n;
    (t2.individual[slot] as unknown as Record<string, number | boolean>)[vc.k] = vc.n === 2 ? next === 1 : next;
    return t2;
  });
  const saved = g.savedTactics;
  const tacticsMenu: DropItem[] = [
    { key: 'ti', label: t('cl.mt.teamInstr'), onClick: () => setPane(pane === 'ti' ? 'list' : 'ti') },
    // dødboldsskytter som grønne undermenuer (CM 01/02)
    ...(editable ? [
      { key: 'form', label: t('cl.mt.formation'), sub: FORMATIONS.map((fm) => ({ key: fm, label: fm, checked: tac.formation === fm, onClick: () => edit((t2) => ({ ...changeFormation(t2, fm), lineup: t2.lineup, bench: t2.bench })) })) },
      { key: 'load', label: t('cl.mt.load'), sub: saved.length ? saved.map((s2, i2) => ({ key: `l${i2}`, label: s2.name ?? `${s2.formation} (${t(`ment.${s2.team.mentality}`)})`, onClick: () => edit((t2) => ({ ...structuredClone(s2), lineup: t2.lineup, bench: t2.bench, captain: t2.captain })) })) : [{ key: 'none', label: t('common.none'), disabled: true, onClick: () => {} }] },
      { key: 'save', label: t('cl.mt.save'), onClick: () => { setSaveName(tac.name ?? tac.formation); setPane('save'); } },
      { key: 'del', label: t('cl.mt.delete'), sub: saved.length ? saved.map((s2, i2) => ({ key: `d${i2}`, label: s2.name ?? `${s2.formation} (${t(`ment.${s2.team.mentality}`)})`, onClick: () => act({ t: 'savedTactics', list: saved.filter((_, k) => k !== i2) }) })) : [{ key: 'none', label: t('common.none'), disabled: true, onClick: () => {} }] },
    ] : []),
  ];
  // Edit (CM 01/02): anfører og straffesparksskytte (*estimeret* indhold)
  const editMenu: DropItem[] = (['captain', 'penalties'] as const).map((k) => ({ key: k, label: t(`tac.${k}`), sub: on.map((x) => ({ key: `${k}${x.id}`, label: `${x.num ?? ''} ${pl(x.id) ? `${pl(x.id).first} ${pl(x.id).last}`.trim() : ''}`.trim(), checked: tac[k] === x.id, disabled: !editable, onClick: () => edit((t2) => ({ ...t2, [k]: x.id })) })) }));
  if (lastView && g.lastMatchTactic) return <LastMatchView tac={g.lastMatchTactic} club={club} />;
  return (
    <div className="cx-mt" onClick={() => setCtx(null)}>
      <div className="cx-title cx-title-plain"><h2>{t('cl.mt.oppTitle', { club })}</h2></div>
      <div className="cx-mt-tools">
        <CxDrop className="cx-green" label={t('cl.mt.tacMenu')} fixed items={tacticsMenu} />
        <CxDrop className="cx-green" label={t('cl.sq.view')} fixed
          items={[{ key: 'cond', label: t('cl.mt.condRating'), checked: view === 'cond', onClick: () => setView('cond') }, ...VIEW_COLS.map((c) => ({ key: c.k, label: t(`pi.${c.k}`), checked: view === c.k, onClick: () => setView(c.k) }))]} />
        <span className="cx-mt-gap" />
        <button className="cx-mt-tbtn" disabled={!editable || !g.lastMatchTactic} title={t('cl.mt.lastHint')} onClick={() => onLastMatch?.()}>{t('cl.mt.lastMatch')}</button>
        <CxDrop className="cx-green" label={t('cl.mt.edit')} fixed align="right" items={editMenu} />
      </div>
      {pane === 'ti' && <TeamInstrDialog tac={tac} on={on.map((x) => x.id)} editable={!!editable} onClose={() => setPane('list')} onOk={(f) => { edit(f); setPane('list'); }} />}
      {pane === 'save' && (
        <div className="cx-ts-body cx-mt-tibox">
          <div className="cx-subtitle small">{t('cl.mt.save')}</div>
          <input className="cx-nick" autoFocus value={saveName} maxLength={30} onChange={(e) => setSaveName(e.target.value)} />
          <div className="cx-ts-buttons" style={{ width: '100%' }}><button onClick={() => setPane('list')}>{t('common.cancel')}</button>
            <button className="primary" disabled={!saveName.trim()} onClick={() => { const nm = saveName.trim(); act({ t: 'savedTactics', list: [...saved.filter((x) => (x.name ?? '') !== nm), { ...structuredClone(tac), name: nm }].slice(-10) }); setPane('list'); setNote(t('cl.mt.saved', { name: nm })); }}>{t('common.ok')}</button></div>
        </div>
      )}
      {note && <div className="cx-mt-hint" style={{ margin: '0 0 6px' }}>{note}</div>}
      <div className="cx-mt-cols">
        <div className="cx-mt-list">
          <div className="cx-mt-form">{tac.formation}</div>
          <table className="cx-tbl"><tbody>{rows.map((r) => {
            const p = pl(r.id);
            const iv = vc && r.slot !== undefined ? instrVal(tac, r.slot, vc.k) : undefined;
            return (
              <tr key={r.id} className={`${r.dim ? 'dim' : ''} ${drag !== null && r.id !== drag ? 'drop' : ''}`} {...dnd(r.id, r.live || lv.bench.includes(r.id))}>
                <td className="btn-col"><span className="cx-rowbtn narrow">{r.num ?? ''}</span></td>
                <td className="c-name">{p ? <span className="link" onClick={(e) => { e.stopPropagation(); navP({ name: 'player', id: p.id }); }}>{`${p.first} ${p.last}`.trim()}</span> : '?'}</td>
                <td className="c-pos">{r.note ?? (tac.captain === r.id && r.live ? <span className="cx-capt" draggable={editable} onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('text/plain', 'capt'); setTimeout(() => setDragCapt(true), 0); }} onDragEnd={() => setTimeout(() => setDragCapt(false), 0)}>capt</span> : '')}</td>
                <td className="c-yel">{p ? posStr(p) : ''}</td>
                {vc ? <td className="c-cyan">{iv !== undefined ? (editable ? <button className="cx-opt on cx-ti-btn" onClick={() => r.slot !== undefined && cycle(r.slot)}>{instrLabel(vc.k, iv, vc.n)}</button> : instrLabel(vc.k, iv, vc.n)) : ''}</td> : <>
                  <td className={`c-num ${(r.cond ?? 100) >= 85 ? 'c-good' : 'c-yel'}`}>{r.cond !== undefined ? `${r.cond}%` : ''}</td>
                  <td className="c-num c-cyan">{r.rating !== undefined ? Math.round(r.rating) : ''}</td>
                  <td className="c-num">{r.goals ? r.goals : ''}</td></>}
              </tr>
            );
          })}</tbody></table>
        </div>
        <div className="cx-mt-pcol">
        <div className="cx-mt-ptabs">{(['ov', 'with', 'without'] as const).map((k) => <button key={k} className={pv === k ? 'on' : ''} onClick={() => setPv(k)}>{t(`cl.mt.pv.${k}`)}</button>)}</div>
        <div className="cx-tac-pitch" ref={pitchRef} onDragOver={(e) => { if (editable && drag !== null) e.preventDefault(); }} onDrop={dropOnPitch}>
          <svg className="lines" viewBox="0 0 68 100" preserveAspectRatio="none">
            <g stroke="#ffffff88" strokeWidth="0.35" fill="none">
              <rect x="1" y="1" width="66" height="98" /><line x1="1" y1="50" x2="67" y2="50" /><circle cx="34" cy="50" r="9" />
              <rect x="14" y="1" width="40" height="16" /><rect x="14" y="83" width="40" height="16" /><rect x="25" y="1" width="18" height="6" /><rect x="25" y="93" width="18" height="6" />
            </g>
          </svg>
          {on.map((s) => {
            const sl = tac.slots[tac.lineup.indexOf(s.id)] ?? tac.slots[s.slot];
            const slot = tac.lineup.indexOf(s.id) >= 0 ? tac.lineup.indexOf(s.id) : s.slot;
            const p = pl(s.id);
            if (!sl) return null;
            const gk = sl.pos === 'GK';
            const runs = instrVal(tac, slot, 'runs');
            return (
              <div key={s.id} className={`cx-tac-slot ${drag !== null ? 'drop' : ''}`} style={{ left: `${sl.y}%`, top: `${97 - sl.x * 0.92}%` }} {...dnd(s.id, true)}
                onContextMenu={(e) => { if (!editable || gk) return; e.preventDefault(); e.stopPropagation(); setCtx({ slot, x: e.clientX, y: e.clientY }); }}>
                {pv === 'with' && !gk && runs > 0 && <span className="cx-run-arrow">{runs === 2 ? '▲' : '△'}</span>}
                {pv === 'without' && !gk && tac.individual[slot]?.tightMarking && <span className="cx-run-arrow">M</span>}
                <span className={`cx-tac-dot cx-mt-dot ${gk ? 'gk' : ''}`}>{s.num ?? ''}</span>
                <span className="cx-tac-nm">{p?.last ?? ''}</span>
              </div>
            );
          })}
        </div>
        </div>
      </div>
      {ctx && (
        <div className="cx-drop-pop cx-ctx" style={{ position: 'fixed', left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()}>
          <div className="cx-menu-head">{t('pi.runs')}</div>
          {[2, 1, 0].map((v) => <button key={v} className={instrVal(tac, ctx.slot, 'runs') === v ? 'on' : ''} onClick={() => { edit((t2) => { t2.individual[ctx.slot].runs = v; return t2; }); setCtx(null); }}><span className="cx-drop-check">{instrVal(tac, ctx.slot, 'runs') === v ? '✓' : ''}</span>{t(`cl.mt.lvl.g${v}`)}</button>)}
        </div>
      )}
    </div>
  );
}

// ---------- klassisk kampskærm (CM 01/02): Match Stats, Action Zones, Match Report, holdstatistik, karakterer, resultater ----------

type CxRow = { id: number; num: number | string; note?: string; noteOn?: boolean; dim: boolean; cond?: number; rating?: number; line?: PlayerMatchLine; capt: boolean; card?: 'yellow' | 'red' };

/** Holdets rækker som i originalen: de 11 startere i rækkefølge (udskiftede grå med "sub 49"), så bænken ("on 49" eller grå) */
function cxRows(sim: MatchSim, side: 0 | 1): CxRow[] {
  const g = gs();
  const tm = sim.teams[side];
  const ev = sim.events.filter((e) => e.t === side);
  const subOut = (id: number) => ev.find((e) => e.k === 'sub' && e.p2 === id)?.m;
  const subIn = (id: number) => ev.find((e) => e.k === 'sub' && e.p === id)?.m;
  const inj = (id: number) => ev.find((e) => e.k === 'injury' && e.p === id)?.m;
  const card = (id: number) => (ev.some((e) => e.k === 'red' && e.p === id) ? 'red' as const : ev.some((e) => e.k === 'yellow' && e.p === id) ? 'yellow' as const : undefined);
  const capt = tm.tactic.captain;
  const mk = (sp: typeof tm.all[number]): CxRow => {
    const o = subOut(sp.p.id), i = inj(sp.p.id), n = sp.enteredAt > 0 ? subIn(sp.p.id) ?? sp.enteredAt : undefined;
    return { id: sp.p.id, num: sp.p.number ?? '', note: o !== undefined ? `sub ${o}` : i !== undefined ? `inj ${i}` : n !== undefined ? `on ${n}` : undefined, noteOn: o === undefined && i === undefined && n !== undefined,
      dim: o !== undefined || i !== undefined || sp.line.red, cond: Math.round(sp.cond * 100), rating: Math.round(Math.max(1, Math.min(10, sp.rating))), line: sp.line, capt: capt === sp.p.id, card: card(sp.p.id) };
  };
  const starters = tm.all.filter((sp) => sp.enteredAt === 0).sort((a, b) => a.slot - b.slot).map(mk);
  const bench = (tm.tactic.bench ?? []).filter((id) => !starters.some((r) => r.id === id)).map((id) => {
    const sp = tm.all.find((x) => x.p.id === id);
    if (sp) return mk(sp);
    const p = g.players[id];
    return { id, num: p?.number ?? '', dim: true, cond: p?.condition, capt: false } as CxRow;
  });
  // indskiftede, der ikke stod på den oprindelige bænk
  const extra = tm.all.filter((sp) => sp.enteredAt > 0 && !bench.some((r) => r.id === sp.p.id)).map(mk);
  return [...starters, ...bench, ...extra];
}

function CxName({ r }: { r: CxRow }) {
  const p = gs().players[r.id];
  const { nav } = useNav();
  return <>{r.card ? <i className={`cx-card ${r.card}`} /> : null}{p ? <span className="link" onClick={() => nav({ name: 'player', id: p.id })}>{`${p.first} ${p.last}`.trim()}</span> : '?'}{r.capt ? ' (c)' : ''}</>;
}

function CxMatchStats({ st }: { st: [MatchStatsSide, MatchStatsSide] }) {
  const pct = (a: number, b: number) => `${Math.round((a / Math.max(1, b)) * 100)}%`;
  const rows: [string, string | number, string | number, string?][] = [
    [t('cl.ms.shots'), st[0].shots, st[1].shots], [t('cl.ms.on'), st[0].onTarget, st[1].onTarget], [t('cl.ms.off'), st[0].shots - st[0].onTarget, st[1].shots - st[1].onTarget],
    // frispark = modstanderens frispark + offside (som i CM 01/02)
    [t('cl.ms.corners'), st[0].corners, st[1].corners], [t('cl.ms.freeKicks'), st[1].fouls + st[1].offsides, st[0].fouls + st[0].offsides],
    ...(st[0].throwIns !== undefined ? [[t('cl.ms.throwIns'), st[0].throwIns, st[1].throwIns ?? 0] as [string, number, number]] : []),
    [t('cl.ms.fouls'), st[0].fouls, st[1].fouls], [t('cl.ms.offsides'), st[0].offsides, st[1].offsides],
    [t('cl.ms.passes'), pct(st[0].passesCompleted, st[0].passes), pct(st[1].passesCompleted, st[1].passes)],
    ...(st[0].tackles !== undefined ? [[t('cl.ms.tackles'), pct(st[0].tacklesWon ?? 0, st[0].tackles), pct(st[1].tacklesWon ?? 0, st[1].tackles ?? 0)], [t('cl.ms.headers'), pct(st[0].headersWon ?? 0, st[0].headers ?? 0), pct(st[1].headersWon ?? 0, st[1].headers ?? 0)]] as [string, string, string][] : [[t('cl.ms.poss'), `${st[0].possession}%`, `${st[1].possession}%`] as [string, string, string]]),
    [t('cl.ms.yellow'), st[0].yellows, st[1].yellows, 'y'], [t('cl.ms.red'), st[0].reds, st[1].reds, 'r'],
  ];
  return <div className="cx-ms">{rows.map(([l, a, b, c]) => <div key={l} className="cx-ms-row"><span className="cx-ms-v">{a}</span><span className={`cx-ms-l ${c ?? ''}`}>{l}</span><span className="cx-ms-v">{b}</span></div>)}</div>;
}

/** Action Zones: hvor bolden har været (eget forsvar, midtbane, angreb) og boldbesiddelsen */
function CxZones({ z, zp, st, colors }: { z: [number, number, number]; zp?: [number, number][]; st: [MatchStatsSide, MatchStatsSide]; colors: [string, string, string, string] }) {
  const tot = Math.max(1, z[0] + z[1] + z[2]);
  const h = st[0].possession;
  const bar = (home: number) => (
    <div className="cx-mo-bar">
      <span style={{ width: `${home}%`, background: colors[0], color: colors[1] }}>{home}%</span><span style={{ width: `${100 - home}%`, background: colors[2], color: colors[3] }}>{100 - home}%</span>
    </div>
  );
  return (
    <div className="cx-az">
      <div className="cx-az-pitch">
        {/* banens streger (felter, midterlinje, midtercirkel) som i CM 01/02 */}
        <i className="cx-az-box l" /><i className="cx-az-box r" /><i className="cx-az-six l" /><i className="cx-az-six r" /><i className="cx-az-half" /><i className="cx-az-circle" />
        <div className="cx-az-label">{t('cl.mt.zOverall')}</div>
        {z.map((v, i) => {
          const [a, b] = zp?.[i] ?? [0, 0];
          return (
            <div key={i} className="cx-az-third"><b>{Math.round((v / tot) * 100)}%</b>
              <div className="cx-az-zbar">{bar(a + b ? Math.round((a / (a + b)) * 100) : 50)}</div>
            </div>
          );
        })}
      </div>
      <div className="cx-mo-poss cx-az-poss">{bar(h)}</div>
    </div>
  );
}

/** Match Report: først efter slutfløjt (CM 01/02: "There is no match report available."), med originalens rapportlinjer i datid */
function CxReport({ lines, sim, ctx }: { lines: { text: string; m: number; ci?: number }[]; sim: MatchSim; ctx: { home: string; away: string; score?: string; ref?: string } }) {
  if (!sim.finished) return <div className="cx-mr cx-mr-none">{t('cl.mt.noReport')}</div>;
  const rows = lines.flatMap((l) => {
    const src = l.ci !== undefined ? sim.commentary[l.ci] : undefined;
    return (src ? reportLines(src, ctx, l.ci!) : [l.text]).map((text) => ({ m: l.m, text }));
  });
  return (
    <div className="cx-mr"><table className="cx-tbl"><tbody>{rows.map((l, i) => (
      <tr key={i}><td className="c-yel cx-mr-m">{i === 0 || rows[i - 1].m !== l.m ? `${l.m} min` : ''}</td><td>{l.text}</td></tr>
    ))}</tbody></table></div>
  );
}

/** Holdets spillerstatistik (som "{hold} Stats") */
function CxTeamStats({ sim, side }: { sim: MatchSim; side: 0 | 1 }) {
  const rows = cxRows(sim, side);
  // CM 01/02: Pas Cmp · Tck Won · Hea Won · Ast Sho On · Con + karakteren (uden overskrift); Key-kolonnerne kender motoren ikke
  const H: [string, string][] = [['Pas', 'c-yel'], ['Cmp', 'c-yel'], ['Tck', 'c-orange'], ['Won', 'c-orange'], ['Hea', 'c-yel'], ['Won', 'c-yel'], ['Ast', 'c-orange'], ['Sho', 'c-orange'], ['On', 'c-orange'], ['Con', 'c-con']];
  const vals = (l: PlayerMatchLine, cond: number | undefined) => [l.passes, l.passesOk, l.tckA ?? l.tackles, l.tackles, l.hea ?? '', l.heaW ?? '', l.assists, l.shots, l.on ?? '', cond ?? ''];
  return (
    <div className="cx-ts-tbl"><table className="cx-tbl"><thead><tr><th className="btn-col" /><th className="btn-col" /><th className="btn-col" />{H.map(([h], i) => <th key={i} className="c-num">{h}</th>)}<th className="c-num cx-ts-rat" /></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r.id} className={r.dim ? 'dim' : ''}><td className="btn-col"><span className="cx-rowbtn narrow">{r.num}</span></td><td className="c-name"><CxName r={r} /></td><td className={r.noteOn ? 'c-pos' : ''}>{r.note ?? ''}</td>
          {r.line ? <>{vals(r.line, r.cond).map((v, i) => <td key={i} className={`c-num ${H[i][1]}`}>{v}</td>)}<td className="c-num c-cyan">{r.rating}</td></> : <td colSpan={H.length + 1} />}
        </tr>
      ))}</tbody></table></div>
  );
}

/** Player Ratings: begge hold side om side – nummer, navn, on/sub, kondition, karakter (hele tal) og mål */
function CxRatings({ sim }: { sim: MatchSim }) {
  return (
    <div className="cx-rt">{([0, 1] as const).map((side) => (
      <table key={side} className="cx-tbl"><tbody>{cxRows(sim, side).map((r) => (
        <tr key={r.id} className={r.dim ? 'dim' : ''}><td className="btn-col"><span className="cx-rowbtn narrow">{r.num}</span></td><td className="c-name"><CxName r={r} /></td>
          <td className={r.noteOn ? 'c-pos' : ''}>{r.note ?? ''}</td><td className={`c-num ${(r.cond ?? 0) >= 92 ? 'c-good' : (r.cond ?? 0) >= 70 ? 'c-orange' : 'c-bad'}`}>{r.cond !== undefined ? `${r.cond}%` : ''}</td>
          <td className="c-num c-cyan">{r.line ? r.rating : ''}</td><td className="c-num c-yel">{r.line?.goals || ''}</td></tr>
      ))}</tbody></table>
    ))}</div>
  );
}

/** Live League Table (CM 01/02): stillingen med dagens kampe, som de står i det aktuelle minut – egen klub øverst over en stiplet linje */
function CxLiveTable({ f, live, others, minute, finished, kicked }: { f: Fixture; live: [number, number]; others: Fixture[]; minute: number; finished: boolean; kicked: boolean }) {
  const g = gs();
  const { nav } = useNav();
  const comp = g.comps[f.comp];
  if (comp?.type !== 'league') return <div className="cx-empty">{t('match.noTable')}</div>;
  const rows = new Map(leagueRows(comp).map((r) => [r.club, { ...r }]));
  const apply = (club: number, gf: number, ga: number, sign: 1 | -1) => {
    const r = rows.get(club);
    if (!r) return;
    r.p += sign; r.gf += sign * gf; r.ga += sign * ga;
    if (gf > ga) { r.w += sign; r.pts += 3 * sign; } else if (gf === ga) { r.d += sign; r.pts += sign; } else r.l += sign;
  };
  const play = (home: number, away: number, hg: number, ag: number, sign: 1 | -1) => { apply(home, hg, ag, sign); apply(away, ag, hg, sign); };
  // de andre kampe er allerede spillet færdig i motoren – træk dem ud og læg stillingen i minuttet ind igen
  for (const o of others) {
    if (!o.result) continue;
    play(o.home, o.away, o.result.hg, o.result.ag, -1);
    if (!kicked) continue;
    const goals = o.result.scorers.filter(([m]) => m <= (finished ? 200 : minute));
    play(o.home, o.away, goals.filter(([, x]) => x === 0).length, goals.filter(([, x]) => x === 1).length, 1);
  }
  if (kicked) play(f.home, f.away, live[0], live[1], 1);
  const sorted = sortTable([...rows.values()]);
  const mine = sorted.findIndex((r) => r.club === g.userClub);
  const row = (r: TableRow, i: number) => (
    <tr key={r.club}>
      <td className="btn-col"><span className="cx-lg-pos">{ordinal(i + 1)}</span></td>
      <td className={`cx-lg-club ${r.club === g.userClub ? 'me' : ''}`} onClick={() => nav({ name: 'club', id: r.club })}>{g.clubs[r.club]?.short}</td>
      <td className="c-num">{r.p}</td><td className="c-num">{r.w}</td><td className="c-num">{r.d}</td><td className="c-num">{r.l}</td>
      <td className="c-num">{r.gf}</td><td className="c-num">{r.ga}</td><td className="c-val">{r.pts}</td>
    </tr>
  );
  return (
    <>
      <div className="cx-subtitle small">{t('cl.mt.liveTable')}</div>
      <div className="cx-tbl-wrap cx-live-tbl">
        <table className="cx-tbl cx-league">
          <thead><tr><th className="btn-col" /><th className="btn-col" />{['cl.lg.pld', 'cl.lg.won', 'cl.lg.drn', 'cl.lg.lst', 'cl.lg.for', 'cl.lg.ag', 'cl.lg.pts'].map((k) => <th key={k} className="c-num">{t(k)}</th>)}</tr></thead>
          <tbody>
            {mine >= 0 && <>{row(sorted[mine], mine)}<tr className="cx-live-sep"><td colSpan={9} /></tr></>}
            {sorted.map((r, i) => (i === mine ? null : row(r, i)))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Latest Scores: dagens andre kampe med målscorere (til det aktuelle minut) */
function CxScores({ own, others, minute, finished, title }: { own?: { f: Fixture; scorers: [number, number, number?][] }; others: Fixture[]; minute: number; finished: boolean; title: string }) {
  const g = gs();
  // egen kamp øverst (som i CM 01/02), derefter dagens andre kampe i turneringen
  const all = [...(own ? [{ o: own.f, sc: own.scorers }] : []), ...others.map((o) => ({ o, sc: o.result!.scorers }))];
  if (!all.length) return <div className="cx-empty">{t('match.noOther')}</div>;
  return (
    <>
      <div className="cx-subtitle small">{title}</div>
      <div className="cx-ls">{all.map(({ o, sc }) => {
        const goals = sc.filter(([m]) => m <= (finished ? 200 : minute));
        const side = (tm: number) => goals.filter(([, x]) => x === tm);
        const names = (tm: number) => {
          const by = new Map<string, number[]>();
          for (const [m, , pid] of side(tm) as [number, number, number?][]) { const n = (pid && g.players[pid]?.last) || ''; by.set(n, [...(by.get(n) ?? []), m]); }
          return [...by].filter(([n]) => n).map(([n, ms]) => <div key={n}>{n} {ms.join(', ')}</div>);
        };
        return (
          <div key={o.id} className="cx-ls-row">
            <div><div className={`${o.home === g.userClub ? 'c-yel' : 'c-cyan'} cx-ls-team`}>{g.clubs[o.home]?.name}</div>{names(0)}</div>
            <div className="c-yel cx-ls-score">{side(0).length}:{side(1).length}</div>
            <div><div className={`${o.away === g.userClub ? 'c-yel' : 'c-cyan'} cx-ls-team`}>{g.clubs[o.away]?.name}</div>{names(1)}</div>
          </div>
        );
      })}</div>
    </>
  );
}

/** Samlet stilling i 2. kamp af en dobbeltkamp ("Agg 1-1" under udeholdet, som i CM 01/02) */
function aggText(f: Fixture, hg: number, ag: number): string | undefined {
  const g = gs();
  if (f.leg !== 2 || f.tieId === undefined) return undefined;
  const tie = g.comps[f.comp]?.ties.find((x) => x.id === f.tieId);
  const first = tie?.fx.map((id) => g.fixtures[id]).find((x) => x && x.id !== f.id && x.result);
  if (!first?.result) return undefined;
  const h = hg + (first.home === f.home ? first.result.hg : first.result.ag);
  const a = ag + (first.home === f.away ? first.result.hg : first.result.ag);
  return `${t('cl.mt.agg')} ${h}-${a}`;
}
