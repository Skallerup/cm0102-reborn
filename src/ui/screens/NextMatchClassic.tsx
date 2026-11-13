// Next Match i klassisk tema som i CM 01/02: kampens data som en liste (dato, stadion, regler, sidste opgør, vejr, bane,
// dommer, klubnyt), << Date / Date >> blader i kampprogrammet, Past Meetings viser de tidligere opgør.
import { useState } from 'react';
import { authentic, benchSize, maxSubs } from '../../game/rules';
import type { Fixture, GameState, Player, TableRow } from '../../game/types';
import { isInternational } from '../../game/international';
import { daysBetween } from '../../game/dates';
import { squad } from '../../game/state';
import { Head } from './common';
import { sortTable } from '../../game/competitions';
import { ordinal } from './Competitions';
import { stageLabel } from './Fixtures';
import { pitchFor, refereeFor, weatherFor } from '../../game/weather';
import { compName, natName, t } from '../../i18n';
import { useGame, useNav } from '../core';
import { classicDate, cxLongDate } from '../classic';

// landskampvinduerne (som WINDOWS i game/international.ts)
const INTL_WINDOWS = ['09-05', '10-09', '11-13', '03-26'];
const nearWindow = (iso: string) => INTL_WINDOWS.some((w) => { const d = Math.abs(daysBetween(`${iso.slice(0, 4)}-${w}`, iso)); return d <= 3; });

/** "<Klub> News" (CM 01/02, strengene i cm0102.exe): set for debut · doubtful (skade) · out (skade) · suspended · away on international duty with …
 *  Debut = en spiller, der kom til klubben i år og ikke har spillet endnu, og som står på holdet (vores egen klub) eller er blandt de 14 bedste
 *  (de andre); skader på højst 7 dage = doubtful – begge *estimeret* */
function clubNews(g: GameState, club: number, f: Fixture): string[] {
  const players = squad(club).filter((p) => !p.reserves);
  const picked = club === g.userClub && g.tactic ? new Set([...g.tactic.lineup, ...g.tactic.bench]) : new Set(players.slice().sort((a, b) => b.ca - a.ca).slice(0, 14).map((p) => p.id));
  const seasonStart = `${g.season}-07-01`;
  const name = (p: Player) => `${p.first} ${p.last}`.trim();
  const out: string[] = [];
  for (const p of players) {
    if (p.injury) out.push(t(p.injury.days <= 7 ? 'cl.nm.doubtful' : 'cl.nm.out', { name: name(p), injury: t(`injury.${p.injury.key}`) }));
    else if (p.banned > 0) out.push(t('cl.nm.suspended', { name: name(p) }));
    else if (nearWindow(f.date) && isInternational(p)) out.push(t('cl.nm.awayIntl', { name: name(p), nation: natName(g.nations[p.nation]?.name) ?? '' }));
    else if (picked.has(p.id) && (p.joined ?? p.cmJoined ?? '') >= seasonStart && p.stats.apps + p.stats.subs === 0) out.push(t('cl.nm.debut', { name: name(p) }));
  }
  return out;
}

export function ClassicNextMatch({ onAssistant }: { onAssistant?: () => void }) {
  const g = useGame()!;
  const { nav } = useNav();
  const me = g.userClub;
  const upcoming = Object.values(g.fixtures).filter((f) => !f.result && (f.home === me || f.away === me)).sort((a, b) => a.date.localeCompare(b.date));
  const [i, setI] = useState(0);
  const [past, setPast] = useState(false);
  const [prog, setProg] = useState(false);
  const f: Fixture | undefined = upcoming[Math.min(i, upcoming.length - 1)];
  const orig = authentic();
  const tools = (
    <Head title={t('nav.assistant')}>
      <button className="cx-greybtn" disabled={i <= 0} onClick={() => setI(i - 1)}>{t('cl.nm.prev')}</button>
      <button className="cx-greybtn" disabled={i >= upcoming.length - 1} onClick={() => setI(i + 1)}>{t('cl.nm.next')}</button>
      <span className="grow" />
      {onAssistant && <button className="cx-greybtn" onClick={onAssistant}>{t('cl.nm.assistant')}</button>}
      <button className={`cx-greybtn ${prog ? 'on' : ''}`} disabled={!f || !progressRows(g, f)} onClick={() => { setProg(!prog); setPast(false); }}>{t('cl.nm.progress')}</button>
      <button className={`cx-greybtn ${past ? 'on' : ''}`} disabled={!f} onClick={() => { setPast(!past); setProg(false); }}>{t('cl.nm.past')}</button>
    </Head>
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
  const days = daysBetween(g.date, f.date);
  // CM 01/02: "Saturday 18th August (35 days)"; vejrudsigten er ukendt mere end en uge før (*estimeret*), dommer og bane først på kampdagen
  const when = orig ? `${cxLongDate(f.date).replace(/,? \d{4}$/, '')}${today ? ` (${t('cl.nm.today')})` : days === 1 ? ` (${t('cl.nm.tomorrow')})` : days > 1 ? ` ${t('cl.nm.days', { n: days })}` : ''}`
    : `${d.toLocaleDateString(t('cl.locale'), { weekday: 'long', day: 'numeric', month: 'long' })}${today ? ` (${t('cl.nm.today')})` : ''}`;
  const myNews = orig ? clubNews(g, me, f) : Object.values(g.players).filter((p) => p.club === me && (p.injury || p.banned > 0)).map((p) => t(p.injury ? 'cl.nm.injured' : 'cl.nm.suspended', { name: `${p.first} ${p.last}`.trim() }));
  const rows: [string, string | string[]][] = orig ? [
    [t('cl.nm.date'), when],
    [t('cl.nm.venue'), ven?.stadium ?? '-'],
    [t('cl.nm.rules'), [t('cl.nm.noRestr'), t('cl.nm.subs', { named: benchSize(), used: maxSubs() })]],
    [t('cl.nm.last'), meetings[0] ? score(meetings[0]) : '-'],
    ...(days <= 7 ? [[t('cl.nm.weather'), t(`wx.${w}`)] as [string, string]] : [[t('cl.nm.forecast'), t('cl.nm.unknown')] as [string, string]]),
    ...(days <= 0 ? [[t('cl.nm.pitch'), t(`pitch.${pitchFor(f, w)}`)], [t('cl.nm.referee'), refereeFor(f).name]] as [string, string][] : []),
    [t('cl.nm.news', { club: club(me)?.short ?? '' }), myNews.length ? myNews : '-'],
    [t('cl.nm.news', { club: club(opp)?.short ?? '' }), (() => { const n = clubNews(g, opp, f); return n.length ? n : '-'; })()],
  ] : [
    [t('cl.nm.date'), when],
    [t('cl.nm.venue'), ven ? `${ven.stadium ?? ''}, ${ven.short}` : '-'],
    [t('cl.nm.rules'), [t('cl.nm.noRestr'), t('cl.nm.subs', { named: benchSize(), used: maxSubs() })]],
    [t('cl.nm.last'), meetings[0] ? score(meetings[0]) : t('common.none')],
    [t('cl.nm.weather'), t(`wx.${w}`)],
    [t('cl.nm.pitch'), t(`pitch.${pitchFor(f, w)}`)],
    [t('cl.nm.referee'), refereeFor(f).name],
    [t('cl.nm.news', { club: club(me)?.short ?? '' }), myNews.length ? myNews.slice(0, 4) : t('common.none')],
  ];
  if (prog) return <>{tools}<Progress f={f} /></>;
  return (
    <>
      {tools}
      <div className={`cx-subtitle ${orig ? 'cx-orig-band' : ''}`}>{orig ? club(opp)?.short : club(opp)?.name} ({t(home ? 'cl.nm.home' : 'cl.nm.away')})</div>
      <div className={`cx-nm ${orig ? 'cx-nm-orig' : ''}`}>
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
