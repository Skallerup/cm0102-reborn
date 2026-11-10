// Next Match i klassisk tema som i CM 01/02: kampens data som en liste (dato, stadion, regler, sidste opgør, vejr, bane,
// dommer, klubnyt), << Date / Date >> blader i kampprogrammet, Past Meetings viser de tidligere opgør.
import { useState } from 'react';
import { benchSize, maxSubs } from '../../game/rules';
import type { Fixture, GameState, TableRow } from '../../game/types';
import { sortTable } from '../../game/competitions';
import { ordinal } from './Competitions';
import { stageLabel } from './Fixtures';
import { pitchFor, refereeFor, weatherFor } from '../../game/weather';
import { compName, t } from '../../i18n';
import { useGame, useNav } from '../core';
import { classicDate } from '../classic';

export function ClassicNextMatch({ onAssistant }: { onAssistant?: () => void }) {
  const g = useGame()!;
  const { nav } = useNav();
  const me = g.userClub;
  const upcoming = Object.values(g.fixtures).filter((f) => !f.result && (f.home === me || f.away === me)).sort((a, b) => a.date.localeCompare(b.date));
  const [i, setI] = useState(0);
  const [past, setPast] = useState(false);
  const [prog, setProg] = useState(false);
  const f: Fixture | undefined = upcoming[Math.min(i, upcoming.length - 1)];
  const tools = (
    <div className="cx-tools">
      <button className="cx-greybtn" disabled={i <= 0} onClick={() => setI(i - 1)}>{t('cl.nm.prev')}</button>
      <button className="cx-greybtn" disabled={i >= upcoming.length - 1} onClick={() => setI(i + 1)}>{t('cl.nm.next')}</button>
      <span className="grow" />
      {onAssistant && <button className="cx-greybtn" onClick={onAssistant}>{t('cl.nm.assistant')}</button>}
      <button className={`cx-greybtn ${prog ? 'on' : ''}`} disabled={!f || !progressRows(g, f)} onClick={() => { setProg(!prog); setPast(false); }}>{t('cl.nm.progress')}</button>
      <button className={`cx-greybtn ${past ? 'on' : ''}`} disabled={!f} onClick={() => { setPast(!past); setProg(false); }}>{t('cl.nm.past')}</button>
    </div>
  );
  if (!f) return <>{tools}<div className="cx-empty">{t('as.noMatch')}</div></>;
  const home = f.home === me;
  const opp = home ? f.away : f.home;
  const club = (id: number) => g.clubs[id];
  const meetings = Object.values(g.fixtures).filter((x) => x.result && ((x.home === me && x.away === opp) || (x.home === opp && x.away === me))).sort((a, b) => b.date.localeCompare(a.date));
  const score = (x: Fixture) => `${club(x.home)?.short} ${x.result!.hg}-${x.result!.ag} ${club(x.away)?.short}, ${compName(g.comps[x.comp]?.name)} ${classicDate(x.date)[1]}`;
  const d = new Date(`${f.date}T12:00:00`);
  const today = f.date === g.date;
  const ven = club(f.home);
  const w = weatherFor(f);
  // klubnyt: skadede og karantæneramte i ens egen trup
  const news = Object.values(g.players).filter((p) => p.club === me && (p.injury || p.banned > 0)).map((p) => t(p.injury ? 'cl.nm.injured' : 'cl.nm.suspended', { name: `${p.first} ${p.last}`.trim() }));
  const rows: [string, string | string[]][] = [
    [t('cl.nm.date'), `${d.toLocaleDateString(t('cl.locale'), { weekday: 'long', day: 'numeric', month: 'long' })}${today ? ` (${t('cl.nm.today')})` : ''}`],
    [t('cl.nm.venue'), ven ? `${ven.stadium ?? ''}, ${ven.short}` : '-'],
    [t('cl.nm.rules'), [t('cl.nm.noRestr'), t('cl.nm.subs', { named: benchSize(), used: maxSubs() })]],
    [t('cl.nm.last'), meetings[0] ? score(meetings[0]) : t('common.none')],
    [t('cl.nm.weather'), t(`wx.${w}`)],
    [t('cl.nm.pitch'), t(`pitch.${pitchFor(f, w)}`)],
    [t('cl.nm.referee'), refereeFor(f).name],
    [t('cl.nm.news', { club: club(me)?.short ?? '' }), news.length ? news.slice(0, 4) : t('common.none')],
  ];
  if (prog) return <>{tools}<Progress f={f} /></>;
  return (
    <>
      {tools}
      <div className="cx-subtitle">{club(opp)?.name} ({t(home ? 'cl.nm.home' : 'cl.nm.away')})</div>
      <div className="cx-nm">
        <div className="cx-nm-comp"><span className="cx-link" role="link" onClick={() => nav({ name: 'competitions', id: f.comp })}>{compName(g.comps[f.comp]?.name)}</span></div>
        {past ? (
          <div className="cx-nm-list">{meetings.length ? meetings.slice(0, 12).map((x) => <div key={x.id} className="cx-nm-row"><span /><span className="v">{score(x)}</span></div>) : <div className="cx-empty">{t('common.none')}</div>}</div>
        ) : (
          <div className="cx-nm-list">{rows.map(([l, v]) => (Array.isArray(v) ? v : [v]).map((x, k) => <div key={`${l}${k}`} className="cx-nm-row"><span>{k === 0 ? l : ''}</span><span className="v">{x}</span></div>))}</div>
        )}
      </div>
    </>
  );
}

/** Tabellen, kampen hører til (liga, ligafase eller gruppe) – undefined for knockout */
function progressRows(g: GameState, f: Fixture): { clubs: number[]; fx: Fixture[]; label: string } | undefined {
  const comp = g.comps[f.comp];
  if (!comp) return undefined;
  if (comp.type === 'league' && !f.stage) return { clubs: comp.table.map((r) => r.club), fx: Object.values(g.fixtures).filter((x) => x.comp === comp.id && !x.stage), label: compName(comp.name) ?? '' };
  if (f.stage === 'LP') return { clubs: comp.table.map((r) => r.club), fx: Object.values(g.fixtures).filter((x) => x.comp === comp.id && x.stage === 'LP'), label: stageLabel(f).replace(/\s*\d+$/, '') };
  if (f.stage?.startsWith('G') && comp.groups?.[f.stage.slice(1)]) return { clubs: comp.groups[f.stage.slice(1)].map((r) => r.club), fx: Object.values(g.fixtures).filter((x) => x.comp === comp.id && x.stage === f.stage), label: stageLabel(f) };
  return undefined;
}

/** Progress (CM 01/02): placeringen kamp for kamp for begge hold og tabellen ved siden af */
function Progress({ f }: { f: Fixture }) {
  const g = useGame()!;
  const pr = progressRows(g, f)!;
  const opp = f.home === g.userClub ? f.away : f.home;
  // spil resultaterne i datoorden og notér placeringen efter hver af de to holds kampe
  const rows = new Map(pr.clubs.map((c) => [c, { club: c, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: '' } as TableRow]));
  const path = new Map<number, number[]>([[g.userClub, []], [opp, []]]);
  const add = (r: TableRow | undefined, gf: number, ga: number) => { if (!r) return; r.p++; r.gf += gf; r.ga += ga; if (gf > ga) { r.w++; r.pts += 3; } else if (gf === ga) { r.d++; r.pts++; } else r.l++; };
  const done = pr.fx.filter((x) => x.result).sort((a, b) => a.date.localeCompare(b.date));
  const dates = [...new Set(done.map((x) => x.date))];
  for (const d of dates) {
    for (const x of done.filter((y) => y.date === d)) { add(rows.get(x.home), x.result!.hg, x.result!.ag); add(rows.get(x.away), x.result!.ag, x.result!.hg); }
    const order = sortTable([...rows.values()].map((r) => ({ ...r }))).map((r) => r.club);
    for (const [c, arr] of path) if (done.some((x) => x.date === d && (x.home === c || x.away === c))) arr.push(order.indexOf(c) + 1);
  }
  const n = pr.clubs.length;
  const games = Math.max(...pr.clubs.map((c) => pr.fx.filter((x) => x.home === c || x.away === c).length), 2);
  const W = 760, H = 440, X = (i: number) => (i / Math.max(1, games - 1)) * W, Y = (pos: number) => ((pos - 1) / Math.max(1, n - 1)) * H;
  const line = (arr: number[]) => arr.map((pos, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(pos).toFixed(1)}`).join(' ');
  const table = sortTable([...rows.values()]);
  const ticks = n <= 8 ? Array.from({ length: n }, (_, i) => i + 1) : [1, Math.round(n / 4), Math.round(n / 2), Math.round((3 * n) / 4), n];
  return (
    <>
      <div className="cx-subtitle">{t('cl.nm.progressOf', { comp: pr.label })}</div>
      <div className="cx-prog">
        <div className="cx-prog-chart">
          <span className="cx-prog-ylab">{t('cl.nm.position')}</span>
          <svg viewBox={`-30 -10 ${W + 50} ${H + 40}`} preserveAspectRatio="none">
            {Array.from({ length: games }, (_, i) => <line key={`v${i}`} x1={X(i)} x2={X(i)} y1={0} y2={H} className="grid" />)}
            {ticks.map((p) => <g key={p}><line x1={0} x2={W} y1={Y(p)} y2={Y(p)} className="grid" /><text x={-12} y={Y(p) + 5} textAnchor="end">{p}</text></g>)}
            {Array.from({ length: games }, (_, i) => <text key={`t${i}`} x={X(i)} y={H + 24} textAnchor="middle">{i + 1}</text>)}
            <rect x={0} y={0} width={W} height={H} className="frame" />
            <path d={line(path.get(opp) ?? [])} className="opp" />
            <path d={line(path.get(g.userClub) ?? [])} className="me" />
            {([[opp, 'opp'], [g.userClub, 'me']] as const).map(([c, cls]) => (path.get(c) ?? []).map((pos, i) => <circle key={`${cls}${i}`} cx={X(i)} cy={Y(pos)} r={5} className={cls} />))}
          </svg>
          <span className="cx-prog-xlab">{t('cl.nm.played')}</span>
        </div>
        <div className="cx-prog-tbl">{table.map((r, i) => (
          <div key={r.club} className="cx-prog-row"><span className="cx-lg-pos">{ordinal(i + 1)}</span><span className={r.club === g.userClub ? 'me' : r.club === opp ? 'opp' : ''}>{g.clubs[r.club]?.short}</span></div>
        ))}</div>
      </div>
    </>
  );
}
