// Cup- og Europa-turneringer i klassisk tema (som i CM 01/02): fanerne Rounds · Results · Fixtures · Schedule
// og under-knapperne Seedings · Team Stats · Player Stats · History.
import { useMemo } from 'react';
import { sortTable } from '../../game/competitions';
import { hasMatchView } from '../../game/miniReport';
import type { Competition, Fixture } from '../../game/types';
import { dateFmt, t } from '../../i18n';
import { Tabs } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { ClassicSub, CxDrop, CxLink, clubRoute, type Item } from '../classic';
import { Scorers } from './Competitions';
import { stageLabel } from './Fixtures';

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
      <Tabs tabs={MAIN.map((k) => [k, t(`cl.cup.${k}`)] as [string, string])} value={(MAIN as readonly string[]).includes(tab) ? tab : ''} onChange={(v) => setTab(v as CupTab)} />
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

function Rounds({ comp }: { comp: Competition }) {
  const stages = [...new Set(comp.ties.map((x) => x.stage))];
  const [stage, setStage] = useRouteState(`round:${comp.id}`, stages[stages.length - 1] ?? '');
  const cur = stages.includes(stage) ? stage : stages[stages.length - 1];
  const ties = comp.ties.filter((x) => x.stage === cur);
  if (!stages.length) return <Groups comp={comp} />;
  return (
    <>
      <div className="cx-tools cx-tools-inline cx-tools-right">
        <CxDrop label={t('cl.cup.round')} align="right" items={stages.map((s) => ({ key: s, label: t(`stage.${s}`), checked: s === cur, onClick: () => setStage(s) }))} />
      </div>
      <div className="cx-subtitle small">{t(`stage.${cur}`)}</div>
      <div className="cx-cup cx-listpanel">
        {ties.map((x) => (
          <div key={x.id} className="cx-cup-row">
            <Code club={x.a} /><span /><Club id={x.a} win={x.winner === x.a} /><span className="cx-cup-v">v</span><Club id={x.b} win={x.winner === x.b} /><span /><Code club={x.b} />
          </div>
        ))}
      </div>
    </>
  );
}

/** Gruppespil/ligafase uden udslagsrunder endnu: tabellerne */
function Groups({ comp }: { comp: Competition }) {
  const g = useGame()!;
  // rækkerne ligger i lodtrækningens rækkefølge (efter seedning/nation) – vis dem efter point, målforskel og mål
  const groups = (comp.groups ? Object.entries(comp.groups) : comp.table.length ? [['', comp.table] as const] : []).map(([k, rows]) => [k, sortTable(rows.slice())] as const);
  if (!groups.length) return <div className="cx-empty cx-empty-mid">{t('cl.cup.notDrawn')}</div>;
  return (
    <div className="cx-cup cx-listpanel">
      {groups.map(([k, rows]) => (
        <div key={k}>
          {k && <div className="cx-subtitle small">{t('fix.group')} {k}</div>}
          {rows.map((r, i) => (
            <div key={r.club} className="cx-cup-row form">
              <span className="cx-code">{i + 1}.</span><Club id={r.club} /><span className="cx-cup-nat">{g.nations[g.clubs[r.club]?.nation]?.code}</span><span className="cx-cup-pts">{r.pts}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Results / Fixtures: én spilledag ad gangen med pile */
function Days({ comp, played }: { comp: Competition; played: boolean }) {
  const g = useGame()!;
  const { nav } = useNav();
  const list = useMemo(() => Object.values(g.fixtures).filter((f) => f.comp === comp.id && !!f.result === played).sort((a, b) => a.date.localeCompare(b.date)), [g, comp.id, played]);
  const dates = [...new Set(list.map((f) => f.date))];
  const [date, setDate] = useRouteState(`${played ? 'res' : 'fix'}:${comp.id}`, played ? dates[dates.length - 1] ?? '' : dates[0] ?? '');
  const cur = dates.includes(date) ? date : played ? dates[dates.length - 1] : dates[0];
  const idx = dates.indexOf(cur);
  const shown = list.filter((f) => f.date === cur);
  const stages = [...new Set(shown.map((f) => stageLabel(f)))];
  return (
    <>
      <div className="cx-subtitle cx-subtitle-nav">
        <span>{cur ? dateFmt(cur, true) : t(played ? 'cl.cup.noResults' : 'cl.cup.noFixtures')}</span>
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
  const r = f.result;
  return (
    <div className={`cx-cup-row ${open ? 'go' : ''}`} onClick={open}>
      <Code club={f.home} /><span className="cx-cup-score">{r ? r.hg : ''}</span><Club id={f.home} win={!!r && r.hg > r.ag} />
      <span className="cx-cup-v">v</span>
      <Club id={f.away} win={!!r && r.ag > r.hg} /><span className="cx-cup-score">{r ? r.ag : ''}</span><Code club={f.away} />
    </div>
  );
}

function Schedule({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const days = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of Object.values(g.fixtures).filter((x) => x.comp === comp.id).sort((a, b) => a.date.localeCompare(b.date))) if (!m.has(f.date)) m.set(f.date, stageLabel(f));
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
    for (const f of Object.values(g.fixtures).filter((x) => x.comp === comp.id && x.result).sort((a, b) => a.date.localeCompare(b.date))) {
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
