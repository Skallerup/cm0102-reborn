// Cup- og Europa-turneringer i klassisk tema (som i CM 01/02): fanerne Rounds · Results · Fixtures · Schedule
// og under-knapperne Seedings · Team Stats · Player Stats · History.
import { useMemo } from 'react';
import { sortTable } from '../../game/competitions';
import { hasMatchView } from '../../game/miniReport';
import { cmInCompSeason } from '../../game/cmEurope';
import type { Competition, Fixture, TableRow } from '../../game/types';
import { dateFmt, t } from '../../i18n';
import { Tabs } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { ClassicSub, CxDrop, CxLink, clubRoute, cxShortDate, type Item } from '../classic';
import { Scorers, ordinal } from './Competitions';
import { stageLabel } from './Fixtures';
import { rebornOn } from '../reborn';

const MAIN = ['rounds', 'results', 'fixtures', 'schedule'] as const;
const SUB = ['seedings', 'teamstats', 'playerstats', 'history'] as const;
type CupTab = (typeof MAIN)[number] | (typeof SUB)[number];

/** Klubbens landekode i en blå boks (WAL, DEN …) */
function Code({ club }: { club: number }) {
  const g = useGame()!;
  const c = g.clubs[club];
  return <span className="cx-code">{c ? g.nations[c.nation]?.code : ''}</span>;
}
const Club = ({ id, win }: { id: number; win?: boolean }) => {
  const g = useGame()!;
  return <span className={`cx-cup-team ${win ? 'win' : ''} ${id === g.userClub ? 'me' : ''}`}><CxLink to={clubRoute(id)}>{g.clubs[id]?.name ?? '?'}</CxLink></span>;
};

export function ClassicCup({ comp }: { comp: Competition }) {
  const { nav } = useNav();
  const [tab, setTab] = useRouteState<CupTab>(`cup:${comp.id}`, 'rounds');
  const sub: Item[] = SUB.map((k) => ({ key: k, label: t(`cl.cup.${k}`), on: tab === k, onClick: () => (k === 'history' ? nav({ name: 'competitions', id: comp.id, tab: 'history', state: { [`cup:${comp.id}`]: 'history' } }) : setTab(k)) }));
  return (
    <>
      <Tabs tabs={MAIN.map((k) => [k, t(k === 'rounds' && (comp.type === 'continental' || !!comp.groups) ? 'cl.cup.stages' : `cl.cup.${k}`)] as [string, string])} value={(MAIN as readonly string[]).includes(tab) ? tab : ''} onChange={(v) => setTab(v as CupTab)} />
      <ClassicSub items={sub} />
      {tab === 'rounds' && <Rounds comp={comp} />}
      {tab === 'results' && <Days comp={comp} played />}
      {tab === 'fixtures' && <Days comp={comp} played={false} />}
      {tab === 'schedule' && <Schedule comp={comp} />}
      {tab === 'seedings' && <Seedings comp={comp} />}
      {tab === 'teamstats' && <Form comp={comp} />}
      {tab === 'playerstats' && <Scorers comp={comp} />}
          </>
  );
}

/** Rækkefølgen af faser i Stage-menuen (CM 01/02: First Qualifying Phase … Final); G = 1. gruppespil, G2 = 2. gruppespil */
const STAGE_ORDER = ['Q', 'Q1', 'Q2', 'Q3', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'LP', 'G', 'G2', 'R32', 'KPO', 'R16', 'QF', 'SF', '3P', 'F2', 'F'];
/** CM 01/02's Champions League-skærm viser altid alle otte faser */
const CL_STAGES = ['Q1', 'Q2', 'Q3', 'G', 'G2', 'QF', 'SF', 'F'];
const stageKey = (f: Fixture) => (f.stage?.startsWith('G') && f.stage !== 'G' ? (f.stage.endsWith('2') ? 'G2' : 'G') : f.stage ?? `R${f.round}`);
const stageName = (s: string) => (s === 'G' || s === 'G2' ? t(`cl.stg.${s}`) : s === 'QF' || s === 'SF' || s === 'F' ? t(`cl.stg.${s}`) : t(`stage.${s}`));

/** Stages-fanen: Stage-menuen med alle faser, Group-menuen, View (Overall/Home/Away) – gruppetabel med Q-mærke og kampene under (som originalen) */
function Rounds({ comp }: { comp: Competition }) {
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
  if (!stages.length) return <div className="cx-empty cx-empty-mid">{!rebornOn('helpTexts') ? '' : t('cl.cup.notDrawn')}</div>;
  return (
    <>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.sq.view')} items={(['overall', 'home', 'away'] as const).map((k) => ({ key: k, label: t(`cl.lg.v.${k}`), checked: view === k, onClick: () => setView(k) }))} />
        <span className="grow" />
        <CxDrop label={group ? `${t('fix.group')} ${group.replace('2', '')}` : t('fix.group')} align="right" items={gkeys.map((k) => ({ key: k, label: `${t('fix.group')} ${k.replace('2', '')}`, checked: k === group, onClick: () => setGrp(k) }))} />
        <CxDrop label={t('cl.cup.stage')} align="right" items={stages.map((s) => ({ key: s, label: stageName(s), checked: s === stage, onClick: () => setStg(s) }))} />
      </div>
      <div className="cx-subtitle small" data-testid="cup-stage-title">{title}</div>
      {sorted.length > 0 && (
        <div className="cx-tbl-wrap cx-listpanel">
          <table className="cx-tbl cx-league cx-cup-tbl">
            <thead><tr><th className="btn-col" /><th className="btn-col" /><th /><th />{['cl.lg.pld', 'cl.lg.won', 'cl.lg.drn', 'cl.lg.lst', 'cl.lg.for', 'cl.lg.ag', 'cl.lg.pts'].map((k) => <th key={k} className="c-num">{t(k)}</th>)}</tr></thead>
            <tbody>
              {sorted.map((r0, i) => {
                const r = venue(r0);
                return (
                  <tr key={r.club} className={isGroup && i === 2 ? 'zone-start' : ''}>
                    <td className="btn-col"><span className="cx-lg-pos">{ordinal(i + 1)}</span></td>
                    <td className="btn-col">{isGroup && i < 2 && done ? <span className="cx-cup-q">{t('cl.cup.q')}</span> : null}</td>
                    <td className={`cx-lg-club ${r.club === g.userClub ? 'me' : ''}`} onClick={() => nav({ name: 'club', id: r.club })}>{g.clubs[r.club]?.name}</td>
                    <td className="cx-cup-nat">{g.nations[g.clubs[r.club]?.nation]?.code}</td>
                    <td className="c-num">{r.p}</td><td className="c-num">{r.w}</td><td className="c-num">{r.d}</td><td className="c-num">{r.l}</td>
                    <td className="c-num">{r.gf}</td><td className="c-num">{r.ga}</td><td className="c-val">{r.pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="cx-cup cx-listpanel cx-stg-fx" data-testid="cup-stage-fixtures">
        {shown.map((f) => {
          const open = hasMatchView(g, f.id) ? () => nav({ name: 'report', id: f.id }) : undefined;
          return (
            <div key={f.id} className="cx-stg-row">
              <span className="cx-code wide">{cxShortDate(f.date)}</span>
              <Club id={f.home} win={!!f.result && f.result.hg > f.result.ag} />
              <span className={`cx-cup-score ${open ? 'go' : ''}`} onClick={open}>{f.result ? `${f.result.hg}:${f.result.ag}` : 'v'}</span>
              <Club id={f.away} win={!!f.result && f.result.ag > f.result.hg} />
              <span className="cx-cup-nat">{cityOf(f.home)}</span>
              <span className="cx-cup-pts">-----</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Results / Fixtures: én spilledag ad gangen med pile */
function Days({ comp, played }: { comp: Competition; played: boolean }) {
  const g = useGame()!;
  const { nav } = useNav();
  const list = useMemo(() => Object.values(g.fixtures).filter((f) => f.comp === comp.id && cmInCompSeason(comp, f) && !!f.result === played).sort((a, b) => a.date.localeCompare(b.date)), [g, comp.id, played]);
  const dates = [...new Set(list.map((f) => f.date))];
  const [date, setDate] = useRouteState(`${played ? 'res' : 'fix'}:${comp.id}`, played ? dates[dates.length - 1] ?? '' : dates[0] ?? '');
  const cur = dates.includes(date) ? date : played ? dates[dates.length - 1] : dates[0];
  const idx = dates.indexOf(cur);
  const shown = list.filter((f) => f.date === cur);
  const stages = [...new Set(shown.map((f) => stageLabel(f)))];
  return (
    <>
      <div className="cx-subtitle cx-subtitle-nav">
        <span>{cur ? dateFmt(cur, true) : (played && !rebornOn('helpTexts') ? '' : t(played ? 'cl.cup.noResults' : 'cl.cup.noFixtures'))}</span>
        {dates.length > 1 && (
          <span className="cx-month-nav">
            <button onClick={() => setDate(dates[idx - 1])} disabled={idx <= 0} aria-label="previous">‹</button>
            <button onClick={() => setDate(dates[idx + 1])} disabled={idx >= dates.length - 1} aria-label="next">›</button>
          </span>
        )}
      </div>
      <div className="cx-cup cx-listpanel">
        {stages.map((s) => (
          <div key={s}>
            <div className="cx-cup-stage">{s}</div>
            {shown.filter((f) => stageLabel(f) === s).map((f) => <DayRow key={f.id} f={f} open={hasMatchView(g, f.id) ? () => nav({ name: 'report', id: f.id }) : undefined} />)}
          </div>
        ))}
      </div>
    </>
  );
}

function DayRow({ f, open }: { f: Fixture; open?: () => void }) {
  const g = useGame()!;
  const r = f.result;
  /** som kampdagsskærmen: p = videre efter straffespark, a = videre på udebanemål (står ved vinderen) */
  const mark = (side: 0 | 1) => {
    if (!r) return '';
    if (r.pens) return r.pens[side] > r.pens[1 - side] ? 'p' : '';
    if (f.leg === 2 && f.tieId !== undefined) {
      const tie = g.comps[f.comp]?.ties.find((x) => x.id === f.tieId);
      const first = tie ? g.fixtures[tie.fx[0]] : undefined;
      if (first?.result && first.id !== f.id) {
        const club = side === 0 ? f.home : f.away, other = side === 0 ? f.away : f.home;
        const tot = (c: number) => [first, f].reduce((s, x) => s + (x.home === c ? x.result!.hg : x.result!.ag), 0);
        const away = (c: number) => [first, f].reduce((s, x) => s + (x.away === c ? x.result!.ag : 0), 0);
        if (tot(club) === tot(other) && away(club) > away(other)) return 'a';
      }
    }
    return '';
  };
  return (
    <div className={`cx-cup-row ${open ? 'go' : ''}`} onClick={open}>
      <Code club={f.home} /><span className="cx-cup-score">{r ? r.hg : ''}<span className="cx-md-mark">{mark(0)}</span></span><Club id={f.home} win={!!r && (r.hg > r.ag || (!!r.pens && r.pens[0] > r.pens[1]))} />
      <span className="cx-cup-v">v</span>
      <Club id={f.away} win={!!r && (r.ag > r.hg || (!!r.pens && r.pens[1] > r.pens[0]))} /><span className="cx-cup-score"><span className="cx-md-mark">{mark(1)}</span>{r ? r.ag : ''}</span><Code club={f.away} />
    </div>
  );
}

function Schedule({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const days = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of Object.values(g.fixtures).filter((x) => x.comp === comp.id && cmInCompSeason(comp, x)).sort((a, b) => a.date.localeCompare(b.date))) if (!m.has(f.date)) m.set(f.date, stageLabel(f));
    return [...m];
  }, [g, comp.id]);
  if (!days.length) return <div className="cx-empty cx-empty-mid">{t('cl.cup.noFixtures')}</div>;
  return (
    <div className="cx-cup cx-listpanel">
      {days.map(([d, s]) => (
        <div key={d} className={`cx-cup-sched ${d < g.date ? 'past' : ''}`}><span className="cx-code wide">{dateFmt(d, true)}</span><span>{s}</span></div>
      ))}
    </div>
  );
}

/** Seedings: deltagerne efter omdømme – øverste halvdel er 1. seedede, resten 2. seedede */
function Seedings({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const clubs = comp.clubs.filter((id) => g.clubs[id]).sort((a, b) => g.clubs[b].rep - g.clubs[a].rep);
  const half = Math.ceil(clubs.length / 2);
  return (
    <div className="cx-cup cx-cup-seeds">
      {clubs.map((id, i) => (
        <div key={id} className="cx-cup-seed"><Club id={id} /><span className={i < half ? 'first' : 'second'}>{t(i < half ? 'cl.cup.firstSeed' : 'cl.cup.secondSeed')}</span></div>
      ))}
    </div>
  );
}

/** Team Stats → form: holdene efter point i turneringen, med de seneste resultater */
function Form({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const rows = useMemo(() => {
    const by = new Map<number, { pts: number; gd: number; form: string[] }>(comp.clubs.map((id) => [id, { pts: 0, gd: 0, form: [] }]));
    for (const f of Object.values(g.fixtures).filter((x) => x.comp === comp.id && cmInCompSeason(comp, x) && x.result).sort((a, b) => a.date.localeCompare(b.date))) {
      const r = f.result!;
      for (const [id, gf, ga] of [[f.home, r.hg, r.ag], [f.away, r.ag, r.hg]] as const) {
        const e = by.get(id) ?? { pts: 0, gd: 0, form: [] };
        e.pts += gf > ga ? 3 : gf === ga ? 1 : 0; e.gd += gf - ga; e.form.push(t(gf > ga ? 'cl.cup.w' : gf === ga ? 'cl.cup.d' : 'cl.cup.l'));
        by.set(id, e);
      }
    }
    return [...by].filter(([id]) => g.clubs[id]).sort((a, b) => b[1].pts - a[1].pts || b[1].gd - a[1].gd || g.clubs[b[0]].rep - g.clubs[a[0]].rep);
  }, [g, comp]);
  return (
    <>
      <div className="cx-subtitle small">{t('cl.cup.form')}</div>
      <div className="cx-cup cx-listpanel">
        {rows.map(([id, e], i) => (
          <div key={id} className="cx-cup-row form">
            <span className="cx-code">{i + 1}.</span><Club id={id} /><span className="cx-cup-nat">{g.nations[g.clubs[id].nation]?.code}</span><span className="cx-cup-pts">{e.form.slice(-5).join(' ') || '-'}</span>
          </div>
        ))}
      </div>
    </>
  );
}
