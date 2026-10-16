import { useEffect, useRef, useState } from 'react';
import { opponentReport } from '../../game/analysis';
import type { MatchSim } from '../../game/engine/match';
import { createLiveMatch, finishUserMatch, quickPlayUserMatch, userTactic } from '../../game/sim';
import { fixturesOn, notify, squad } from '../../game/state';
import type { MatchReport } from '../../game/types';
import { t } from '../../i18n';
import { Bar, ClubLink, Crest, Panel, Pct, PlayerLink, Tabs } from '../components';
import { useGame, useNav } from '../core';
import { commentaryText } from '../commentary';
import { Head } from './common';
import { TacticEditor } from './Tactics';
import { stageLabel } from './Fixtures';
import { useHotkeys } from '../hotkeys';

// Den igangværende kamp overlever navigation mellem skærme
let live: { fixture: number; sim: MatchSim; lines: { text: string; cls: string; m: number }[]; consumed: number } | null = null;

export function MatchScreen({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const f = g.fixtures[id];
  const [phase, setPhase] = useState<'pre' | 'live'>(live?.fixture === id ? 'live' : 'pre');
  if (!f) return <Head title="?" />;
  if (f.result && g.reports[id] && phase !== 'live') {
    return <div><Head title={t('match.played')} /><button onClick={() => nav({ name: 'report', id })}>{t('fix.report')}</button></div>;
  }
  if (phase === 'pre') return <PreMatch id={id} onPlay={() => setPhase('live')} onQuick={() => { const rep = quickPlayUserMatch(); notify(); if (rep) nav({ name: 'report', id: f.id }); }} />;
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
  useHotkeys((e) => { if (isToday && e.key === 'Enter') { onPlay(); return true; } });
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
      {isToday ? (
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onQuick}>{t('match.quick')}</button>
          <button className="primary continue" onClick={onPlay}>{t('match.kickoff')}</button>
        </div>
      ) : <div className="muted">{t('match.notToday')}</div>}
    </div>
  );
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
  const [tab, setTab] = useState('commentary');
  const [report, setReport] = useState<MatchReport | null>(null);
  const [msg, setMsg] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const home = g.clubs[f.home].short, away = g.clubs[f.away].short;

  const pull = () => {
    const ctx = { home, away, score: `${home} ${sim.teams[0].stats.goals}-${sim.teams[1].stats.goals} ${away}` };
    while (L.consumed < sim.commentary.length) {
      const l = sim.commentary[L.consumed];
      const cls = l.k.startsWith('goal') ? 'goal' : l.hi ? 'hi' : '';
      L.lines.push({ text: commentaryText(l, ctx, L.consumed), cls, m: l.m });
      L.consumed++;
    }
  };

  const advance = (maxMoments: number) => {
    const before = sim.commentary.length;
    let n = 0;
    while (n < maxMoments && sim.commentary.length === before) {
      if (!sim.step()) break;
      n++;
    }
    pull();
    if (sim.finished && !report) setReport(sim.report());
    force((x) => x + 1);
  };

  useEffect(() => {
    if (paused || report) return;
    const ms = Math.max(30, g.options.matchSpeed / speed);
    const h = setInterval(() => advance(speed >= 8 ? 40 : 12), ms);
    return () => clearInterval(h);
  });

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  });

  useHotkeys((e) => {
    const k = e.key.toLowerCase();
    if (report) {
      if (e.key === 'Enter' || e.key === ' ') { done(); return true; }
      return;
    }
    if (e.key === ' ' || k === 'p') { setPaused(!paused); return true; }
    if (['1', '2', '3', '4'].includes(e.key)) { setSpeed([1, 2, 4, 8][Number(e.key) - 1]); return true; }
    if (k === 't') { setPaused(true); setTab('tactics'); return true; }
    if (k === 'u' || k === 'h') { setPaused(true); setTab('team'); return true; }
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
    finishUserMatch(report);
    live = null;
    notify();
    nav({ name: 'report', id });
  };

  const st = sim.teams.map((tm) => tm.stats);
  const myLive = sim.live(me);
  const others = fixturesOn(f.date).map((fid) => g.fixtures[fid]).filter((x) => x && x.id !== id && x.result);
  const minute = sim.finished ? t('match.ft') : `${sim.minute}'`;

  return (
    <div>
      <Head title={`${g.comps[f.comp]?.name} – ${stageLabel(f)}`}>
        {!report && <>
          <button onClick={() => setPaused(!paused)}>{paused ? `▶ ${t('match.resume')}` : `❚❚ ${t('match.pause')}`}</button>
          {[1, 2, 4, 8].map((s) => <button key={s} className={speed === s ? 'primary small' : 'small'} onClick={() => setSpeed(s)}>{s}×</button>)}
          <button onClick={finishNow}>{t('match.toEnd')}</button>
        </>}
        {report && <button className="primary continue" onClick={done}>{t('match.continue')}</button>}
      </Head>
      <Scoreboard home={f.home} away={f.away} hg={st[0].goals} ag={st[1].goals} minute={minute + (sim.pens ? ` (${t('fix.pens')} ${sim.pens[0]}-${sim.pens[1]})` : '') + (paused && !report ? ` · ${t('match.paused')}` : '')} />
      <div className="muted kbd-hint" style={{ marginBottom: 8 }}>{report ? t('match.keysDone') : t('match.keys')}</div>
      <Tabs tabs={[['commentary', t('match.commentary')], ['stats', t('match.stats')], ['team', `${t('match.myTeam')} (${t('match.subsLeft', { n: myLive.subsLeft })})`], ['tactics', t('nav.tactics')]]} value={tab} onChange={setTab} />
      {msg && <div className="insight">{msg}</div>}
      {tab === 'commentary' && (
        <div className="cols" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="commentary" ref={boxRef}>
            {L.lines.map((l, i) => <div key={i} className={`ln ${l.cls}`}><span className="m">{l.m}'</span>{l.text}</div>)}
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
      {tab === 'team' && (
        <Panel className="flush">
          <table className="grid">
            <thead><tr><th>{t('col.pos')}</th><th>{t('col.name')}</th><th>{t('col.cond')}</th><th className="num">{t('match.rating')}</th><th></th></tr></thead>
            <tbody>
              {myLive.on.map((s) => {
                const p = g.players[s.id];
                const slot = myLive.tactic.slots[s.slot];
                return (
                  <tr key={s.id} className={s.off ? 'injured' : ''}>
                    <td>{slot.pos}{slot.side !== 'C' ? slot.side : ''}</td>
                    <td><PlayerLink p={p} short />{s.yellow ? <span className="tag warn">🟨</span> : null}{s.injured ? <span className="tag bad">{t('tag.inj')}</span> : null}{s.goals ? ' ⚽'.repeat(s.goals) : ''}</td>
                    <td><Bar value={s.cond} /> {s.cond}%</td>
                    <td className="num">{s.rating.toFixed(1)}</td>
                    <td>
                      {!s.off && myLive.subsLeft > 0 && !report && (
                        <select value="" onChange={(e) => {
                          const ok = sim.substitute(me, s.id, Number(e.target.value));
                          setMsg(ok ? '' : t('match.subFailed'));
                          pull();
                          force((x) => x + 1);
                        }}>
                          <option value="">{t('match.subOff')}</option>
                          {myLive.bench.map((bid) => <option key={bid} value={bid}>{g.players[bid]?.last}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
      {tab === 'tactics' && !report && (
        <TacticEditor tactic={myLive.tactic} players={squad(g.userClub).filter((p) => myLive.on.some((s) => s.id === p.id && !s.off) || myLive.bench.includes(p.id))} matchMode
          onChange={(tac) => { sim.setTactic(me, tac); pull(); force((x) => x + 1); }}
          onSub={(out, inn) => { const ok = sim.substitute(me, out, inn); setMsg(ok ? '' : t('match.subFailed')); pull(); force((x) => x + 1); }} />
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
