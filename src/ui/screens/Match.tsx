import { useEffect, useRef, useState } from 'react';
import { opponentReport } from '../../game/analysis';
import type { MatchSim } from '../../game/engine/match';
import { createLiveMatch, quickReport, userTactic } from '../../game/sim';
import { act } from '../../game/actions';
import { humanManager, isHumanClub } from '../../game/humans';
import { isBotClub } from '../../game/bots';
import { session, type LiveCmd } from '../../online/client';
import { fixturesOn, gs, notify, squad } from '../../game/state';
import type { MatchReport } from '../../game/types';
import { t } from '../../i18n';
import { Bar, ClubLink, Crest, Panel, Pct, PlayerLink, posStr, Rating, Tabs } from '../components';
import { useGame, useNav } from '../core';
import { commentaryText } from '../commentary';
import { Head } from './common';
import { Pitch2D, cornerFrames, highlightFrames, type Snap } from '../Pitch2D';
import { LeagueTable } from './Competitions';
import { sortTable } from '../../game/competitions';
import { TacticEditor } from './Tactics';
import { stageLabel } from './Fixtures';
import { useHotkeys } from '../hotkeys';
import { TeamTalk } from '../teamtalk';
import { talkDone } from '../../game/teamtalk';

// Den igangværende kamp overlever navigation mellem skærme
/** Holdfarver til 2D-banen: ens eget hold i klubtemaets farver, modstanderen i en farve der skiller sig ud */
function teamColors(home: number, away: number, me: number): [string, string, string, string] {
  const g = gs();
  const css = getComputedStyle(document.documentElement);
  const navBg = css.getPropertyValue('--nav-bg').trim(), navFg = css.getPropertyValue('--nav-fg').trim();
  const own: [string, string] = navBg ? [navBg, navFg || '#fff'] : [g.clubs[me === 0 ? home : away]?.colors[0] ?? '#d7263d', g.clubs[me === 0 ? home : away]?.colors[1] ?? '#fff'];
  // modstanderen: hvid, medmindre vores egen farve er lys – så mørkeblå
  const lum = (c: string) => { const m = c.match(/\d+/g); if (!m) return c.toLowerCase().startsWith('#f') ? 1 : 0.4; const [r, gg, b] = m.map(Number); return (0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255; };
  const opp: [string, string] = lum(own[0]) > 0.7 ? ['#1d2b53', '#ffffff'] : ['#f4f4f4', '#1b2233'];
  return me === 0 ? [own[0], own[1], opp[0], opp[1]] : [opp[0], opp[1], own[0], own[1]];
}

let live: { fixture: number; sim: MatchSim; lines: { text: string; cls: string; m: number; k?: string }[]; consumed: number; halfShown?: boolean; shotsSeen?: number; cornersSeen?: number; prevTab?: string } | null = null;

export function MatchScreen({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const f = g.fixtures[id];
  const [phase, setPhase] = useState<'pre' | 'live'>(live?.fixture === id ? 'live' : 'pre');
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
  useHotkeys((e) => { if (isToday && !awayVsHuman && e.key === 'Enter') { onPlay(); return true; } });
  return (
    <div>
      <Head title={`${g.comps[f.comp]?.name} – ${stageLabel(f)}`} />
      <Scoreboard home={f.home} away={f.away} hg={null} ag={null} minute={t('match.preview')} />
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
      {isToday && <TeamTalk fixture={id} stage="pre" pids={[...tac.lineup, ...tac.bench].filter(Boolean)} diff={0} ratings={{}} />}
      {isToday && awayVsHuman ? (
        <div className="insight">{t('mp.h2hAway', { name: humanManager(f.home)?.name ?? '' })}</div>
      ) : isToday ? (
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onQuick}>{t('match.quick')}</button>
          <button className="primary continue" onClick={onPlay}>{t('match.kickoff')}</button>
        </div>
      ) : <div className="muted">{t('match.notToday')}</div>}
    </div>
  );
}

/** CM-stil: holdbjælker i holdfarverne med stor score og minuttet til venstre */
function CmScoreboard({ home, away, hg, ag, minute, colors }: { home: number; away: number; hg: number; ag: number; minute: string; colors: [string, string, string, string] }) {
  const g = gs();
  return (
    <div className="cm-board">
      <div className="cm-minute">{minute}</div>
      <div className="cm-team" style={{ background: colors[0], color: colors[1] }}>
        <span className="cm-name"><Crest id={home} size={30} />{g.clubs[home]?.name}</span>
        <span className="cm-score">{hg}</span>
      </div>
      <div className="cm-team away" style={{ background: colors[2], color: colors[3] }}>
        <span className="cm-score">{ag}</span>
        <span className="cm-name">{g.clubs[away]?.name}<Crest id={away} size={30} /></span>
      </div>
    </div>
  );
}

type LiveTeam = ReturnType<MatchSim['live']>;

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
      return { id: x.id, num: x.slot + 1, rating: x.rating, goals: x.goals, info: out ? t('rt.off', { m: out }) : offRed ? t('rt.sentOff') : undefined, dim: !!out || !!offRed };
    });
    let n = 12;
    for (const x of [...lt.on, ...lt.gone].filter((y) => y.enteredAt > 0)) rows.push({ id: x.id, num: n++, rating: x.rating, goals: x.goals, info: t('rt.on', { m: subMinute(team, x.id, 'p') ?? x.enteredAt }) });
    for (const id of lt.bench) rows.push({ id, num: n++, dim: true });
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

function Scoreboard({ home, away, hg, ag, minute }: { home: number; away: number; hg: number | null; ag: number | null; minute: string }) {
  return (
    <div className="scoreboard">
      <div className="team"><Crest id={home} size={34} /><ClubLink id={home} /></div>
      <div>
        <div className="score">{hg === null ? 'v' : `${hg} - ${ag}`}</div>
        <div className="minute">{minute}</div>
      </div>
      <div className="team away"><Crest id={away} size={34} /><ClubLink id={away} /></div>
    </div>
  );
}

function LiveMatch({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const f = g.fixtures[id];
  if (!live || live.fixture !== id) live = { fixture: id, sim: createLiveMatch(f), lines: [], consumed: 0 };
  const L = live;
  const sim = L.sim;
  const me = f.home === g.userClub ? 0 : 1;
  const [, force] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tab, setTabState] = useState(() => { try { return localStorage.getItem('cm-match-view') === 'commentary' ? 'commentary' : '2d'; } catch { return '2d'; } });
  // husk om man ser kampen i 2D eller som kommentar
  const setTab = (v: string) => { setTabState(v); if (v === '2d' || v === 'commentary') { try { localStorage.setItem('cm-match-view', v); } catch { /* ignorér */ } } };
  const [report, setReport] = useState<MatchReport | null>(null);
  // flashes/bump/reveal: pr. billede – stor tekst, midlertidig ændring af stillingen (jubel før et annulleret mål) og hvor mange nye kommentarlinjer der vises
  const [hl, setHl] = useState<{ frames: Snap[]; i: number; outcome: string; texts: string[]; hideFrom: number; team: number; flashes?: (string | undefined)[]; bump?: number[]; reveal?: number[] } | null>(null);
  const [msg, setMsg] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const home = g.clubs[f.home].short, away = g.clubs[f.away].short;

  const pull = () => {
    const ctx = { home, away, score: `${home} ${sim.teams[0].stats.goals}-${sim.teams[1].stats.goals} ${away}` };
    while (L.consumed < sim.commentary.length) {
      const l = sim.commentary[L.consumed];
      const cls = l.k.startsWith('goal') && l.k !== 'goal-offside' ? 'goal' : l.hi ? 'hi' : '';
      L.lines.push({ text: commentaryText(l, ctx, L.consumed), cls, m: l.m, k: l.k });
      L.consumed++;
    }
  };

  const advance = (maxMoments: number, untilLine = true) => {
    const before = sim.commentary.length;
    let n = 0;
    while (n < maxMoments && (!untilLine || sim.commentary.length === before)) {
      if (!sim.step()) break;
      n++;
    }
    const linesBefore = L.lines.length;
    pull();
    // store chancer og mål afspilles på 2D-banen (kampen venter imens)
    const seen = L.shotsSeen ?? 0;
    const fresh = sim.shots.slice(seen);
    L.shotsSeen = sim.shots.length;
    const big = fresh.filter((sh) => sh.outcome === 'goal' || sh.outcome === 'offside' || sh.xg >= 0.1 || sh.kind === 'pen' || sh.kind === 'oneOnOne' || (sh.outcome === 'saved' && sh.xg >= 0.07)).at(-1);
    let started = false;
    // hjørnespark: med afslutning vises de som chancen; uden afslutning som et kort indlæg, forsvaret rydder
    const newCorners = sim.corners.slice(L.cornersSeen ?? 0);
    L.cornersSeen = sim.corners.length;
    const lastCorner = newCorners.at(-1);
    // et skud i samme minut som hjørnesparket (fx efter en clearing) vises også som hjørnesparkets afslutning
    const cornerShot = fresh.filter((sh) => sh.corner).at(-1)
      ?? (lastCorner && fresh.at(-1) && fresh.at(-1)!.m === lastCorner.m && fresh.at(-1)!.t === lastCorner.t ? { ...fresh.at(-1)!, corner: lastCorner.taker } : undefined);
    const bigOrCorner = big ? (cornerShot && cornerShot.m === big.m && cornerShot.p === big.p ? cornerShot : big) : cornerShot;
    const plainCorner = !bigOrCorner && fresh.length === 0 && lastCorner;
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
      const frames = highlightFrames(sim.pitch(), big, assist);
      // teksten følger billederne: opspil → aflevering → afslutning → det, der faktisk skete
      const name = (fr: Snap) => fr.players.find((p) => p.id === fr.holder)?.name ?? '';
      const shooter = frames.at(-1) ? name(frames.at(-1)!) : '';
      // kun linjerne om selve afslutningen: ved mål fra mållinjen og frem (mål, stilling, evt. VAR), ellers den sidste linje
      const fresh = L.lines.slice(linesBefore);
      const gi = big.outcome === 'goal' ? fresh.findIndex((l) => l.cls === 'goal') : -1;
      const result = (gi >= 0 ? fresh.slice(gi).map((l) => l.text).join(' · ') : fresh.at(-1)?.text) || (L.lines.at(-1)?.text ?? '');
      const taker = big.corner ? g.players[big.corner]?.last ?? '' : '';
      const texts = big.corner
        ? [t('hl.cornerSetup', { a: taker }), t('hl.cornerCross', { a: taker }), result]
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
      } else setHl({ frames, i: 0, outcome: big.outcome, texts, hideFrom: linesBefore, team: big.t });
      started = true;
    }
    if (sim.finished && !report) setReport(sim.report());
    else if (!started) maybeHalftime();
    force((x) => x + 1);
  };

  // pausen: stop og giv holdet en peptalk – bagefter tilbage til den visning, man kom fra
  const maybeHalftime = () => {
    if (sim.half === 2 && !L.halfShown && !talkDone(id, 'half') && !sim.finished) {
      L.halfShown = true;
      L.prevTab = tab === 'talk' ? '2d' : tab;
      setPaused(true);
      setTab('talk');
    }
  };

  useEffect(() => {
    if (paused || report || hl) return;
    const ms = Math.max(30, g.options.matchSpeed / speed);
    const h = setInterval(() => advance(speed >= 8 ? 40 : 12), ms);
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

  useHotkeys((e) => {
    const k = e.key.toLowerCase();
    if (report) {
      if (e.key === 'Enter') { done(); return true; }
      return;
    }
    if (k === 'p') { setPaused(!paused); return true; }
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
    act({ t: 'matchResult', fixture: id, rep: report });
    live = null;
    notify();
    nav({ name: 'report', id });
  };

  const st = sim.teams.map((tm) => tm.stats);
  const myLive = sim.live(me);
  const halfTalk = sim.half === 2 && !report && (tab === 'talk' || (!talkDone(id, 'half') && sim.minute <= 50));
  const myGoals = sim.teams[me].stats.goals - sim.teams[1 - me].stats.goals;
  const liveRatings = Object.fromEntries(myLive.on.filter((s) => !s.off).map((s) => [s.id, Math.round(s.rating * 10) / 10]));

  // kun kampe i samme turnering (samme liga eller pokal)
  const others = fixturesOn(f.date).map((fid) => g.fixtures[fid]).filter((x) => x && x.id !== id && x.result && x.comp === f.comp);
  const minute = sim.finished ? t('match.ft') : `${sim.minute}'`;
  const colors = teamColors(f.home, f.away, me);
  // et mål vises først på resultattavlen, når højdepunktet når frem til målet
  const spoil = hl && hl.outcome === 'goal' && hl.i < hl.frames.length - 1 ? hl.team : -1;
  // jubel før et annulleret mål: stillingen står midlertidigt et mål højere
  const fake = hl?.bump?.[hl.i] ? hl.team : -1;

  // online, kamp mod en anden manager: vi kører kampen og sender en live-visning til udeholdet hvert sekund
  const sess = session();
  const h2hDriver = !!sess && !!g.humans && me === 0 && isHumanClub(f.away) && !isBotClub(f.away);
  const hg = st[0].goals - (spoil === 0 ? 1 : 0) + (fake === 0 ? 1 : 0), ag = st[1].goals - (spoil === 1 ? 1 : 0) + (fake === 1 ? 1 : 0);
  const shownLines = hl?.reveal ? L.lines.slice(0, hl.hideFrom + hl.reveal[hl.i]) : hl && hl.i < hl.frames.length - 1 ? L.lines.slice(0, hl.hideFrom) : L.lines;
  const liveRef = useRef<FollowData | null>(null);
  if (h2hDriver) {
    liveRef.current = {
      minute: minute + (paused && !report ? ' ❚❚' : ''), hg, ag, finished: !!report, stats: [st[0], st[1]],
      lines: shownLines.slice(-60), live: [sim.live(0), sim.live(1)], events: sim.events,
      snap: hl ? hl.frames[hl.i] : { ...sim.pitch(), zone: 7, poss: 0, holder: 0, moment: 0, shot: null },
      banner: hl ? hl.texts[hl.i] ?? '' : L.lines.at(-1)?.text ?? '',
      flash: hl ? (hl.flashes ? hl.flashes[hl.i] : hl.i === hl.frames.length - 1 && hl.outcome !== 'none' ? t(`hl.${hl.outcome}`) : undefined) : undefined,
      report: report ?? undefined,
    };
  }
  useEffect(() => {
    if (!h2hDriver || !sess) return;
    let busy = false;
    const h = setInterval(() => {
      if (busy || !liveRef.current) return;
      busy = true;
      sess.livePush(id, liveRef.current).then((cmds) => {
        // udeholdets ændringer
        for (const c of cmds) {
          if (c.k === 'sub') sim.substitute(1, c.out, c.inn);
          else if (c.k === 'ment') { const tac = sim.live(1).tactic; sim.setTactic(1, { ...tac, team: { ...tac.team, mentality: c.v } }); }
        }
        if (cmds.length) { pull(); force((x) => x + 1); }
      }).catch(() => {}).finally(() => { busy = false; });
    }, 1000);
    return () => clearInterval(h);
  }, [h2hDriver, id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Head title={`${g.comps[f.comp]?.name} – ${stageLabel(f)}`}>
        {!report && <>
          <button data-space onClick={() => setPaused(!paused)}>{paused ? `▶ ${t('match.resume')}` : `❚❚ ${t('match.pause')}`}</button>
          {[1, 2, 4, 8].map((s) => <button key={s} className={speed === s ? 'primary small' : 'small'} onClick={() => setSpeed(s)}>{s}×</button>)}
          <button onClick={finishNow}>{t('match.toEnd')}</button>
        </>}
        {report && <button className="primary continue" onClick={done}>{t('match.continue')}</button>}
      </Head>
      <CmScoreboard home={f.home} away={f.away} hg={st[0].goals - (spoil === 0 ? 1 : 0) + (fake === 0 ? 1 : 0)} ag={st[1].goals - (spoil === 1 ? 1 : 0) + (fake === 1 ? 1 : 0)} colors={colors} minute={minute + (sim.pens ? ` (${sim.pens[0]}-${sim.pens[1]})` : '') + (paused && !report ? ' ❚❚' : '')} />
      <div className="muted kbd-hint" style={{ marginBottom: 8 }}>{report ? t('match.keysDone') : t('match.keys')}</div>
      <Tabs tabs={[['2d', t('match.pitch2d')], ['ratings', t('match.ratings')], ['commentary', t('match.commentary')], ['stats', t('match.stats')], ['scores', t('match.vidiprinter')], ['table', t('comp.table')], ['tactics', `${t('nav.tactics')} (${t('match.subsLeft', { n: myLive.subsLeft })})`], ...(halfTalk ? [['talk', t('tt.tab')] as [string, string]] : [])]} value={tab} onChange={setTab} />
      {tab === 'talk' && halfTalk && (
        <TeamTalk fixture={id} stage="half" pids={[...myLive.on.filter((s) => !s.off).map((s) => s.id), ...myLive.bench]} diff={myGoals} ratings={liveRatings}
          onGiven={(boosts) => { sim.applyTalk(me, boosts); setTab(L.prevTab ?? '2d'); }} />
      )}
      {msg && <div className="insight">{msg}</div>}
      {tab === '2d' && (
        <div className="cols match2d">
          <div style={{ position: 'relative' }}>
            {hl ? (
              <Pitch2D snap={hl.frames[hl.i]} me={me} colors={colors} minute={minute} stepMs={frameMs * 0.9}
                banner={hl.texts[hl.i] ?? ''} bannerCls={(hl.i === hl.frames.length - 1 && hl.outcome === 'goal') || hl.flashes?.[hl.i] === t('hl.goal') ? 'goal' : ''}
                flash={hl.flashes ? hl.flashes[hl.i] : hl.i === hl.frames.length - 1 && hl.outcome !== 'none' ? t(`hl.${hl.outcome}`) : undefined} />
            ) : (
              // mellem højdepunkterne: holdene i ro i deres formation
              <Pitch2D snap={{ ...sim.pitch(), zone: 7, poss: me, holder: 0, moment: 0, shot: null }} me={me} colors={colors} minute={minute} stepMs={600}
                banner={L.lines.at(-1)?.text ?? ''} bannerCls={L.lines.at(-1)?.cls ?? ''} />
            )}
            {hl && <div className="p2d-replay">{t('corner' in hl.frames[0] ? 'hl.corner' : 'hl.chance')}</div>}
          </div>
          <div className="commentary" style={{ height: 'auto', maxHeight: 520 }}>
            {(hl?.reveal ? L.lines.slice(0, hl.hideFrom + hl.reveal[hl.i]) : hl && hl.i < hl.frames.length - 1 ? L.lines.slice(0, hl.hideFrom) : L.lines).slice(-14).reverse().map((l, i) => <div key={i} className={`ln ${l.cls}`}><span className="m">{l.m}'</span>{l.text}</div>)}
          </div>
        </div>
      )}
      {tab === 'commentary' && (
        <div className="cols" style={{ gridTemplateColumns: '2fr 1fr' }}>
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
      {tab === 'stats' && <StatsPanel stats={[st[0], st[1]]} home={home} away={away} />}
      {tab === 'ratings' && <RatingsBoard sim={sim} colors={colors} />}
      {tab === 'scores' && (
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
      {tab === 'table' && g.comps[f.comp]?.type === 'league' && <Panel className="flush"><LeagueTable rows={sortTable(g.comps[f.comp].table.slice())} comp={g.comps[f.comp]} /></Panel>}
      {tab === 'table' && g.comps[f.comp]?.type !== 'league' && <div className="muted">{t('match.noTable')}</div>}
      <div className="cm-venue">{g.clubs[f.home]?.stadium}{g.clubs[f.home]?.name ? `, ${g.clubs[f.home]?.name}` : ''}</div>
      {tab === 'tactics' && !report && (
        <SubsPanel sim={sim} me={me} live={myLive} onDone={(ok) => { setMsg(ok ? '' : t('match.subFailed')); pull(); force((x) => x + 1); }} />
      )}
      {tab === 'tactics' && !report && (
        <TacticEditor tactic={myLive.tactic} players={squad(g.userClub).filter((p) => myLive.on.some((s) => s.id === p.id && !s.off) || myLive.bench.includes(p.id))} matchMode
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

/** Det, hjemmeholdet sender til udeholdet under en kamp mellem to managere */
type FollowData = {
  minute: string; hg: number; ag: number; finished: boolean; stats: [MatchReport['stats'][0], MatchReport['stats'][1]];
  lines: { text: string; cls: string; m: number }[]; live: [LiveTeam, LiveTeam]; events: MatchSim['events'];
  snap: Snap; banner: string; flash?: string; report?: MatchReport;
};

/** Udeholdet følger kampen live (hjemmeholdets manager kører den) og kan skifte ud og ændre mentalitet */
function FollowMatch({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const f = g.fixtures[id];
  const sess = session()!;
  const [data, setData] = useState<FollowData | null>(null);
  const [tab, setTab] = useState('2d');
  const [sent, setSent] = useState('');
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try { const d = await sess.liveGet<FollowData>(id); if (!stop && d) setData(d); } catch { /* prøv igen */ }
      if (!stop) setTimeout(tick, 1000);
    };
    void tick();
    return () => { stop = true; };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const colors = teamColors(f.home, f.away, 1);
  const homeMgr = humanManager(f.home)?.name ?? '';
  if (!data) {
    return (
      <div>
        <Head title={`${g.comps[f.comp]?.name} – ${stageLabel(f)}`} />
        <Scoreboard home={f.home} away={f.away} hg={null} ag={null} minute={t('match.preview')} />
        <div className="insight">{t('mp.followWait', { name: homeMgr })}</div>
      </div>
    );
  }
  const mine = data.live[1];
  const proxy = { events: data.events, live: (tm: number) => data.live[tm] } as unknown as MatchSim;
  const send = (cmd: LiveCmd, label: string) => { void sess.liveCmd(id, cmd).then(() => setSent(label)).catch(() => setSent(t('mp.followFail'))); };
  const subProxy = { substitute: (_t: number, out: number, inn: number) => { send({ k: 'sub', out, inn }, t('mp.followSubSent', { a: g.players[inn]?.last ?? '', b: g.players[out]?.last ?? '' })); return true; } } as unknown as MatchSim;
  const finish = () => { if (data.report) act({ t: 'matchResult', fixture: id, rep: data.report }); nav({ name: data.report ? 'report' : 'inbox', id }); };
  return (
    <div>
      <Head title={`${g.comps[f.comp]?.name} – ${stageLabel(f)}`}>
        <span className="muted">{t('mp.followHint', { name: homeMgr })}</span>
        {data.finished && <button className="primary continue" onClick={finish}>{t('match.continue')}</button>}
      </Head>
      <CmScoreboard home={f.home} away={f.away} hg={data.hg} ag={data.ag} colors={colors} minute={data.minute} />
      <Tabs tabs={[['2d', t('match.pitch2d')], ['ratings', t('match.ratings')], ['stats', t('match.stats')], ['tactics', `${t('nav.tactics')} (${t('match.subsLeft', { n: mine.subsLeft })})`]]} value={tab} onChange={setTab} />
      {sent && <div className="insight">{sent}</div>}
      {tab === '2d' && (
        <div className="cols match2d">
          <Pitch2D snap={data.snap} me={1} colors={colors} minute={data.minute} stepMs={800} banner={data.banner} bannerCls="" flash={data.flash} />
          <div className="commentary" style={{ height: 'auto', maxHeight: 520 }}>
            {data.lines.slice(-14).reverse().map((l, i) => <div key={i} className={`ln ${l.cls}`}><span className="m">{l.m}'</span>{l.text}</div>)}
          </div>
        </div>
      )}
      {tab === 'ratings' && <RatingsBoard sim={proxy} colors={colors} />}
      {tab === 'stats' && <StatsPanel stats={data.stats} home={g.clubs[f.home].name} away={g.clubs[f.away].name} />}
      {tab === 'tactics' && !data.finished && (
        <>
          <Panel title={t('ti.mentality')}>
            <div className="seg">
              {[0, 1, 2, 3, 4].map((v) => <button key={v} type="button" className={mine.tactic.team.mentality === v ? 'on' : ''} onClick={() => send({ k: 'ment', v }, t('mp.followMentSent', { v: t(`ment.${v}`) }))}>{t(`ment.short.${v}`)}</button>)}
            </div>
          </Panel>
          <SubsPanel sim={subProxy} me={1} live={mine} onDone={() => {}} />
        </>
      )}
    </div>
  );
}

export function StatsPanel({ stats, home, away }: { stats: [MatchReport['stats'][0], MatchReport['stats'][1]]; home: string; away: string }) {
  const rows: [string, number, number, boolean?][] = [
    ['possession', stats[0].possession, stats[1].possession],
    ['xg', stats[0].xg, stats[1].xg, true],
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
            <span className="h">{dec ? h.toFixed(2) : h}</span>
            <span className="lbl">{t(`stat.${k}`)}</span>
            <span className="a">{dec ? a.toFixed(2) : a}</span>
            <div className="statbar"><i style={{ width: `${(h / tot) * 100}%` }} /><i style={{ width: `${(a / tot) * 100}%` }} /></div>
          </div>
        );
      })}
    </Panel>
  );
}
