
import { matchVerdict } from '../../game/analysis';
import { hash01 } from '../../game/rng';
import type { MatchReport } from '../../game/types';
import { t } from '../../i18n';
import { ClubLink, Crest, Panel, PlayerLink, Rating, Tabs } from '../components';
import { useGame, useRouteState } from '../core';
import { commentaryText } from '../commentary';
import { Head } from './common';
import { StatsPanel, statColors } from './Match';
import { WEATHER_ICON, type Weather } from '../../game/weather';
import { TeamTalk } from '../teamtalk';

export function ReportScreen({ id }: { id: number }) {
  const g = useGame()!;
  const rep = g.reports[id];
  const [tab, setTab] = useRouteState('tab', 'analysis');
  if (!rep) return <Head title={t('report.missing')} />;
  const side: 0 | 1 = rep.away === g.userClub ? 1 : 0;
  const home = g.clubs[rep.home]?.short ?? '?', away = g.clubs[rep.away]?.short ?? '?';
  const verdict = matchVerdict(rep, side);
  const mom = g.players[rep.mom];
  const mine = rep.home === g.userClub || rep.away === g.userClub;
  // samme dag som kampen: holdsnak efter kampen (komponenten viser intet, når den er holdt)
  const talking = mine && g.fixtures[id]?.date === g.date;
  const myLines = rep.players.filter((l) => l.team === side);
  const diff = rep.stats[side].goals - rep.stats[1 - side].goals + (rep.pens ? Math.sign(rep.pens[side] - rep.pens[1 - side]) : 0);
  return (
    <div>
      <Head title={t('report.title')} />
      <div className="scoreboard">
        <div className="team"><Crest id={rep.home} size={34} /><ClubLink id={rep.home} noCrest /></div>
        <div>
          <div className="score">{rep.stats[0].goals} - {rep.stats[1].goals}</div>
          {rep.weather && <div className="minute">{WEATHER_ICON[rep.weather as Weather]} {t(`wx.${rep.weather}`)}</div>}
          <div className="minute">{rep.pens ? `${t('fix.pens')} ${rep.pens[0]}-${rep.pens[1]}` : rep.et ? t('fix.aet') : t('match.ft')} · xG {rep.stats[0].xg.toFixed(2)} - {rep.stats[1].xg.toFixed(2)}</div>
        </div>
        <div className="team away"><Crest id={rep.away} size={34} /><ClubLink id={rep.away} noCrest /></div>
      </div>
      <Goals rep={rep} />
      {rep.shootout && (
        <Panel title={`${t('report.shootout')} ${rep.pens?.[0]}-${rep.pens?.[1]}`}>
          <div className="so-list">
            {[0, 1].map((tm) => (
              <div key={tm}>
                <b>{tm === 0 ? home : away}</b>
                {rep.shootout!.filter((k) => k.t === tm).map((k, i) => (
                  <div key={i} className={k.outcome === 'goal' ? 'good' : 'bad'}>{k.outcome === 'goal' ? '✓' : '✕'} {g.players[k.p]?.last ?? '?'}{k.outcome === 'saved' ? ` (${t('report.soSaved')})` : k.outcome === 'off' ? ` (${t('report.soWide')})` : ''}</div>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      )}
      {talking && <TeamTalk fixture={id} stage="post" pids={myLines.map((l) => l.id)} diff={diff} ratings={Object.fromEntries(myLines.map((l) => [l.id, l.rating]))} />}
      <Tabs tabs={[['analysis', t('report.analysis')], ['stats', t('match.stats')], ['players', t('report.players')], ['commentary', t('match.commentary')]]} value={tab} onChange={setTab} />
      {tab === 'analysis' && (
        <div className="cols">
          <Panel title={t('report.verdict')}>
            {verdict.map((v, i) => <div key={i} className={`insight ${v.tone}`}>{t(v.key, { ...v.params, lane: v.params?.lane ? t(`lane.${v.params.lane}`) : undefined })}</div>)}
            {mom && <div className="insight good">{t('report.mom')}: <PlayerLink p={mom} /> (<Rating r={rep.players.find((p) => p.id === mom.id)?.rating ?? 0} />)</div>}
          </Panel>
          <Panel title={t('report.momentum')}><Momentum rep={rep} home={home} away={away} colors={mine ? statColors(rep.home, rep.away, side) : ['var(--accent)', 'var(--accent2)']} /></Panel>
          <Panel title={t('report.heatmap')}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <Heat rep={rep} team={0} label={home} />
              <Heat rep={rep} team={1} label={away} />
            </div>
            <div className="muted">{t('report.heatHint')}</div>
          </Panel>
          <Panel title={t('report.shotmap')}><ShotMap rep={rep} home={home} away={away} /></Panel>
        </div>
      )}
      {tab === 'stats' && <StatsPanel stats={rep.stats} home={home} away={away} colors={mine ? statColors(rep.home, rep.away, side) : undefined} />}
      {tab === 'players' && (
        <div className="cols2">
          {[0, 1].map((tm) => (
            <Panel key={tm} title={tm === 0 ? home : away} className="flush">
              <table className="grid">
                <thead><tr><th>{t('col.name')}</th><th className="num">{t('report.min')}</th><th className="num">{t('col.goals')}</th><th className="num">{t('col.assists')}</th><th className="num">{t('stat.shots')}</th><th className="num">{t('report.passes')}</th><th className="num">{t('match.rating')}</th></tr></thead>
                <tbody>
                  {rep.players.filter((p) => p.team === tm).map((l) => (
                    <tr key={l.id} className={l.id === rep.mom ? 'me' : ''}>
                      <td><PlayerLink p={g.players[l.id]} short />{l.sub ? <span className="tag">{t('tac.sub')}</span> : null}{l.yellow ? ' 🟨' : ''}{l.red ? ' 🟥' : ''}{l.injured ? ' ✚' : ''}</td>
                      <td className="num">{l.minutes}</td>
                      <td className="num">{l.goals || ''}</td>
                      <td className="num">{l.assists || ''}</td>
                      <td className="num">{l.shots || ''}</td>
                      <td className="num">{l.passesOk}/{l.passes}</td>
                      <td className="num"><Rating r={l.rating} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          ))}
        </div>
      )}
      {tab === 'commentary' && (
        <div className="commentary" style={{ height: '60vh' }}>
          {rep.commentary.length === 0 && <div className="muted">{t('report.noCommentary')}</div>}
          {(() => {
            let h = 0, a = 0;
            return rep.commentary.map((l, i) => {
              if (l.k.startsWith('goal')) { if (l.t === 0) h++; else a++; }
              const text = commentaryText(l, { home, away, score: `${home} ${h}-${a} ${away}` }, i);
              return <div key={i} className={`ln ${l.hi ? 'hi' : ''}`}><span className="m">{l.m}'</span>{text}</div>;
            });
          })()}
        </div>
      )}
    </div>
  );
}

function Goals({ rep }: { rep: MatchReport }) {
  const g = useGame()!;
  const ev = rep.events.filter((e) => e.k === 'goal' || e.k === 'red');
  if (!ev.length) return null;
  return (
    <div className="cols2" style={{ marginBottom: 8 }}>
      {[0, 1].map((tm) => (
        <div key={tm} className={tm === 0 ? 'right' : ''}>
          {ev.filter((e) => e.t === tm).map((e, i) => (
            <div key={i} className="muted">
              {e.k === 'goal' ? '⚽' : '🟥'} <PlayerLink p={g.players[e.p!]} short /> {e.m}'
              {e.k === 'goal' && e.p2 && g.players[e.p2] ? <> (<PlayerLink p={g.players[e.p2]} short />)</> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Momentum({ rep, home, away, colors }: { rep: MatchReport; home: string; away: string; colors: [string, string] }) {
  const vals = rep.momentum;
  const W = 300, H = 120, mid = H / 2;
  const max = Math.max(1, ...vals.map((v) => Math.abs(v)));
  const bw = W / Math.max(18, vals.length);
  // målene står over/under grafen; holdnavnene i en forklaring nederst, så intet overlapper
  return (
    <svg viewBox={`0 -12 ${W} ${H + 44}`} className="chart" role="img" aria-label="momentum">
      <line x1={0} x2={W} y1={mid} y2={mid} stroke="#ffffff33" />
      <line x1={W * 0.5} x2={W * 0.5} y1={0} y2={H} stroke="#ffffff22" strokeDasharray="2 2" />
      {vals.map((v, i) => {
        const h = (Math.abs(v) / max) * (mid - 4);
        return <rect key={i} x={i * bw + 1} width={bw - 2} y={v >= 0 ? mid - h : mid} height={h} rx={1} fill={v >= 0 ? colors[0] : colors[1]} />;
      })}
      {rep.events.filter((e) => e.k === 'goal').map((e, i) => (
        <text key={i} x={Math.min(W - 6, ((e.m - 1) / 5) * bw + bw / 2)} y={e.t === 0 ? -2 : H + 8} textAnchor="middle" fontSize="9">⚽</text>
      ))}
      <text x={2} y={H + 20}>0'</text><text x={W / 2} y={H + 20} textAnchor="middle">45'</text><text x={W - 2} y={H + 20} textAnchor="end">90'</text>
      <rect x={0} y={H + 26} width={8} height={8} rx={2} fill={colors[0]} />
      <text x={12} y={H + 33.5}>{home} ↑</text>
      <rect x={W / 2 + 4} y={H + 26} width={8} height={8} rx={2} fill={colors[1]} />
      <text x={W / 2 + 16} y={H + 33.5}>{away} ↓</text>
    </svg>
  );
}

function Heat({ rep, team, label }: { rep: MatchReport; team: number; label: string }) {
  const heat = rep.heat[team];
  const max = Math.max(1, ...heat);
  const total = heat.reduce((s, v) => s + v, 0) || 1;
  // vis altid holdet angribende opad
  const cells: number[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const rb = 4 - row;
      const b = team === 0 ? rb : 4 - rb;
      const l = team === 0 ? col : 2 - col;
      cells.push(heat[b * 3 + l]);
    }
  }
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div className="center muted">{label} →</div>
      <div className="pitch" style={{ maxWidth: 170 }}>
        <div className="zone-grid">
          {cells.map((v, i) => <div key={i} style={{ background: `rgba(255, ${Math.round(200 - (v / max) * 170)}, 40, ${0.15 + (v / max) * 0.7})` }}>{Math.round((v / total) * 100)}%</div>)}
        </div>
      </div>
    </div>
  );
}

function ShotMap({ rep, home, away }: { rep: MatchReport; home: string; away: string }) {
  const W = 300, H = 190;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="shots" style={{ background: '#2b7a3b', borderRadius: 4 }}>
        <g stroke="#ffffffaa" fill="none" strokeWidth={1}>
          <rect x={2} y={2} width={W - 4} height={H - 4} />
          <line x1={W / 2} y1={2} x2={W / 2} y2={H - 2} />
          <rect x={2} y={H / 2 - 45} width={44} height={90} />
          <rect x={W - 46} y={H / 2 - 45} width={44} height={90} />
        </g>
        {rep.shots.map((s, i) => {
          const b = Math.floor(s.zone / 3), l = s.zone % 3;
          const jx = hash01(i, s.m, 1) * 0.8 + 0.1, jy = hash01(i, s.m, 2) * 0.8 + 0.1;
          // zoner: bånd i længderetning (x), baner i bredden (y)
          const x = ((b + (s.kind === 'pen' ? 0.6 : jx)) / 5) * W;
          const y = ((l + jy) / 3) * H;
          const r = 3 + s.xg * 16;
          const fill = s.outcome === 'goal' ? '#ffd447' : s.outcome === 'saved' ? '#7fd1ff' : s.outcome === 'blocked' ? '#999' : '#ff6b6b';
          return <circle key={i} cx={x} cy={y} r={r} fill={fill} fillOpacity={0.75} stroke={s.t === 0 ? '#fff' : '#000'} strokeWidth={1}><title>{`${s.m}' xG ${s.xg}`}</title></circle>;
        })}
      </svg>
      <div className="legend">
        <span><i style={{ background: '#ffd447' }} />{t('shot.goal')}</span><span><i style={{ background: '#7fd1ff' }} />{t('shot.saved')}</span>
        <span><i style={{ background: '#ff6b6b' }} />{t('shot.off')}</span><span><i style={{ background: '#999' }} />{t('shot.blocked')}</span>
        <span className="muted">{home} → · ← {away}</span>
      </div>
    </div>
  );
}
