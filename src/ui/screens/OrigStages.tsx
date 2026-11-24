// Stages (CM 01/02) i det moderne udseende: Stage-menu (First Qualifying Phase … Final), Group-menu og View (Overall/Home/Away) – gruppetabel med Q-mærke og kampene under.
import { useMemo } from 'react';
import { sortTable } from '../../game/competitions';
import { hasMatchView } from '../../game/miniReport';
import { cmInCompSeason } from '../../game/cmEurope';
import type { Competition, Fixture, TableRow } from '../../game/types';
import { dateFmt, t } from '../../i18n';
import { Panel } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { ordinal } from './Competitions';

const STAGE_ORDER = ['Q', 'Q1', 'Q2', 'Q3', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'LP', 'G', 'G2', 'R32', 'KPO', 'R16', 'QF', 'SF', '3P', 'F2', 'F'];
/** CM 01/02's Champions League-skærm viser altid alle otte faser */
const CL_STAGES = ['Q1', 'Q2', 'Q3', 'G', 'G2', 'QF', 'SF', 'F'];
const stageKey = (f: Fixture) => (f.stage?.startsWith('G') && f.stage !== 'G' ? (f.stage.endsWith('2') ? 'G2' : 'G') : f.stage ?? `R${f.round}`);
const stageName = (s: string) => (s === 'G' || s === 'G2' || s === 'QF' || s === 'SF' || s === 'F' ? t(`cl.stg.${s}`) : t(`stage.${s}`));

export function OrigStages({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const { nav } = useNav();
  const fx = useMemo(() => Object.values(g.fixtures).filter((f) => f.comp === comp.id && cmInCompSeason(comp, f)).sort((a, b) => a.date.localeCompare(b.date)), [g, comp]);
  const stages = useMemo(() => {
    const s = new Set<string>(comp.id === 'CL' ? CL_STAGES : []);
    for (const f of fx) s.add(stageKey(f));
    for (const x of comp.ties) s.add(x.stage);
    if (comp.table.length && !comp.groups) s.add('LP');
    if (comp.groups && Object.keys(comp.groups).length) { if (Object.keys(comp.groups).some((k) => !k.endsWith('2'))) s.add('G'); if (Object.keys(comp.groups).some((k) => k.endsWith('2'))) s.add('G2'); }
    return [...s].sort((a, b) => (STAGE_ORDER.indexOf(a) + 1 || 99) - (STAGE_ORDER.indexOf(b) + 1 || 99));
  }, [fx, comp]);
  const cur0 = comp.stage && stages.includes(comp.stage) ? comp.stage : [...stages].reverse().find((s) => fx.some((f) => stageKey(f) === s)) ?? stages[0] ?? '';
  const [stg, setStg] = useRouteState(`stg:${comp.id}`, cur0);
  const stage = stages.includes(stg) ? stg : cur0;
  const isGroup = stage === 'G' || stage === 'G2';
  const gkeys = Object.keys(comp.groups ?? {}).filter((k) => (stage === 'G2') === k.endsWith('2')).sort();
  const mine = gkeys.find((k) => comp.groups![k].some((r) => r.club === g.userClub));
  const [grp, setGrp] = useRouteState(`grp:${comp.id}`, mine ?? gkeys[0] ?? '');
  const group = gkeys.includes(grp) ? grp : mine ?? gkeys[0] ?? '';
  const [view, setView] = useRouteState(`view:${comp.id}`, 'overall');
  const rows = isGroup ? comp.groups?.[group] ?? [] : stage === 'LP' ? comp.table : [];
  const shown = isGroup ? fx.filter((f) => f.stage === `G${group}`) : fx.filter((f) => stageKey(f) === stage);
  const cityOf = (club: number) => g.cmCityNames?.[g.cmCrowd?.[club]?.[4] ?? -1] ?? g.clubs[club]?.stadium ?? '';
  const sorted = sortTable(rows.slice());
  const done = shown.length > 0 && shown.every((f) => f.result);
  const venue = (r: TableRow): TableRow => {
    if (view === 'overall') return r;
    const o = { ...r, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
    for (const f of shown) if (f.result && (view === 'home' ? f.home : f.away) === r.club) {
      const a = view === 'home' ? f.result.hg : f.result.ag, b = view === 'home' ? f.result.ag : f.result.hg;
      o.p++; o.gf += a; o.ga += b; if (a > b) { o.w++; o.pts += 3; } else if (a === b) { o.d++; o.pts++; } else o.l++;
    }
    return o;
  };
  const title = isGroup ? t(stage === 'G2' ? 'cl.stg.g2h' : 'cl.stg.g1h', { g: group.replace('2', '') }) : stageName(stage);
  if (!stages.length) return <Panel><div className="muted">{t('cl.cup.notDrawn')}</div></Panel>;
  return (
    <div className="col">
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <select value={stage} onChange={(e) => setStg(e.target.value)} aria-label={t('cl.cup.stage')} data-testid="orig-stage">
          {stages.map((s) => <option key={s} value={s}>{stageName(s)}</option>)}
        </select>
        {isGroup && <select value={group} onChange={(e) => setGrp(e.target.value)} aria-label={t('fix.group')}>
          {gkeys.map((k) => <option key={k} value={k}>{t('fix.group')} {k.replace('2', '')}</option>)}
        </select>}
        <select value={view} onChange={(e) => setView(e.target.value)} aria-label={t('cl.sq.view')}>
          {(['overall', 'home', 'away'] as const).map((k) => <option key={k} value={k}>{t(`cl.lg.v.${k}`)}</option>)}
        </select>
      </div>
      <Panel title={title} className="flush">
        {sorted.length > 0 && (
          <table className="grid">
            <thead><tr><th /><th /><th /><th />{['cl.lg.pld', 'cl.lg.won', 'cl.lg.drn', 'cl.lg.lst', 'cl.lg.for', 'cl.lg.ag', 'cl.lg.pts'].map((k) => <th key={k} className="num">{t(k)}</th>)}</tr></thead>
            <tbody>
              {sorted.map((r0, i) => {
                const r = venue(r0);
                return (
                  <tr key={r.club} className={r.club === g.userClub ? 'me' : ''} onClick={() => nav({ name: 'club', id: r.club })}>
                    <td className="num">{ordinal(i + 1)}</td>
                    <td>{isGroup && i < 2 && done ? <span className="tag good">{t('cl.cup.q')}</span> : null}</td>
                    <td>{g.clubs[r.club]?.name}</td>
                    <td className="muted">{g.nations[g.clubs[r.club]?.nation]?.code}</td>
                    <td className="num">{r.p}</td><td className="num">{r.w}</td><td className="num">{r.d}</td><td className="num">{r.l}</td>
                    <td className="num">{r.gf}</td><td className="num">{r.ga}</td><td className="num"><b>{r.pts}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <table className="grid">
          <tbody>
            {shown.map((f) => {
              const open = hasMatchView(g, f.id) ? () => nav({ name: 'report', id: f.id }) : undefined;
              return (
                <tr key={f.id} className={open ? 'clickable' : ''} onClick={open}>
                  <td className="muted">{dateFmt(f.date)}</td>
                  <td className={`${f.home === g.userClub ? 'me' : ''} ${f.result && f.result.hg > f.result.ag ? 'good' : ''}`} style={{ textAlign: 'right' }}>{g.clubs[f.home]?.name}</td>
                  <td className="num" style={{ textAlign: 'center' }}><b>{f.result ? `${f.result.hg}:${f.result.ag}` : 'v'}</b></td>
                  <td className={`${f.away === g.userClub ? 'me' : ''} ${f.result && f.result.ag > f.result.hg ? 'good' : ''}`}>{g.clubs[f.away]?.name}</td>
                  <td className="muted">{cityOf(f.home)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
