// Landsholdsturneringerne som originalens turneringsskærm ("FIFA World Cup", "UEFA European Championship", "Football at the Summer
// Olympics" – ejerens skærmbilleder 16/11): Table · Results · Fixtures · Schedule øverst, Group-menu med gruppens tabel og kampene under den,
// og Qualifiers · Team Stats · Player Stats · Awards · History nederst. Uden en igangværende slutrunde: "Group Stage" og lodtrækningens dato.
import type { IntlName, IntlResult, IntlTournament } from '../../game/international';
import { rowsOf } from '../../game/international';
import { dateFmt, natName, t } from '../../i18n';
import { ClassicSub, CxDrop, type Item } from '../classic';
import { Tabs } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { rebornOn } from '../reborn';

export type TourKey = IntlName | 'olympic';
export const TOUR_KEYS: TourKey[] = ['wc', 'euro', 'olympic', 'copa', 'afcon', 'asian'];

/** lodtrækningerne, som originalen viser dem uden en igangværende slutrunde (aflæst i originalen 27/6-2002) */
const DRAW: Partial<Record<TourKey, Record<number, string>>> = { euro: { 2004: '2004-02-07' }, olympic: { 2004: '2004-03-20' } };
/** næste slutrunde efter året */
const nextYear = (k: TourKey, y: number) => {
  const mod: Record<TourKey, [number, number]> = { wc: [4, 2], euro: [4, 0], olympic: [4, 0], copa: [3, 1], afcon: [2, 0], asian: [4, 0] };
  const [m, r] = mod[k];
  let n = y; while (((n % m) + m) % m !== r) n++;
  return n;
};

/** "Saturday 7th February 2004" som originalens tekst */
function drawDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`), loc = t('cl.locale');
  const day = d.getUTCDate();
  const ord = loc.startsWith('en') ? (day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th') : '.';
  const f = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString(loc, { ...o, timeZone: 'UTC' });
  return `${f({ weekday: 'long' })} ${day}${ord} ${f({ month: 'long' })} ${d.getUTCFullYear()}`;
}

type Tab = 'table' | 'results' | 'fixtures' | 'schedule';

const GROUP_DAYS = ['06-10', '06-14', '06-18'];
const PAIRS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];

export function ClassicTournament({ k }: { k: TourKey }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [tab, setTab] = useRouteState<Tab>('ittab', 'table');
  const [grp, setGrp] = useRouteState<number>('itgrp', 0);
  const st = g.intl;
  const tour: IntlTournament | undefined = k === 'olympic' ? undefined
    : [st?.tournament, ...(st?.cont ?? [])].filter((x): x is IntlTournament => !!x && x.name === k).sort((a, b) => b.year - a.year)[0];
  const title = t(`cl.it.name.${k}`);
  const N = (n: number | undefined) => (n === undefined ? <span /> : <span className="cx-link" role="link" onClick={() => nav({ name: 'international', id: n })}>{natName(g.nations[n]?.name)}</span>);
  const results: IntlResult[] = tour ? (st?.results ?? []).filter((r) => r.kind === tour.name && r.date.startsWith(String(tour.year))) : [];
  const resOf = (a: number, b: number) => results.find((r) => (r.home === a && r.away === b) || (r.home === b && r.away === a));
  const sub: Item[] = [
    ...(k === 'wc' || k === 'euro' ? [{ key: 'q', label: t('cl.it.qualifiers'), onClick: () => nav({ name: 'international', state: { itab: 'qual' } }) }] : []),
    { key: 'ts', label: t('cl.lg.teamStats'), disabled: true },
    { key: 'ps', label: t('cl.lg.playerStats'), disabled: true },
    ...(k === 'wc' ? [{ key: 'aw', label: t('cl.cm.awards'), arrow: true, onClick: () => nav({ name: 'awards', state: { awScope: 'intl' } }) }] : []),
    { key: 'h', label: t('cl.cup.history'), arrow: true, onClick: () => nav({ name: 'international', state: { itab: 'history', ihist: k } }) },
  ];
  const groups = tour?.groups ?? [];
  const gi = Math.min(grp, Math.max(0, groups.length - 1));
  const year = tour?.year ?? nextYear(k, Number(g.date.slice(0, 4)));
  const draw = DRAW[k]?.[year];
  return (
    <div className="cx-itour">
      <Head title={title} />
      <Tabs tabs={(['table', 'results', 'fixtures', 'schedule'] as const).map((x) => [x, t(`cl.it.tab.${x}`)] as [string, string])} value={tab} onChange={(v) => setTab(v as Tab)} />
      <ClassicSub items={sub} />
      {tab === 'table' && (!groups.length ? (
        <>
          <div className="cx-subtitle">{t('cl.it.groupStage')}</div>
          <div className="cx-empty">{draw ? t('cl.it.draw', { date: drawDate(draw) }) : ''}</div>
        </>
      ) : (
        <>
          <div className="cx-tools">
            <CxDrop label={t('cl.sq.view')} items={[{ key: 'o', label: t('cl.lg.v.overall'), checked: true, onClick: () => {} }]} />
            <CxDrop label={t('cl.it.group')} align="right" items={groups.map((_, i) => ({ key: String(i), label: t('cl.it.groupN', { g: String.fromCharCode(65 + i) }), checked: i === gi, onClick: () => setGrp(i) }))} />
          </div>
          <div className="cx-subtitle">{t('cl.it.groupN', { g: String.fromCharCode(65 + gi) })}</div>
          <div className="cx-tbl-wrap cx-listpanel">
            <table className="cx-tbl cx-league">
              <thead><tr><th className="btn-col" /><th />{['cl.lg.pld', 'cl.lg.won', 'cl.lg.drn', 'cl.lg.lst', 'cl.lg.for', 'cl.lg.ag', 'cl.lg.pts'].map((x) => <th key={x} className="c-num">{t(x)}</th>)}</tr></thead>
              <tbody>
                {rowsOf(tour!, groups[gi]).map((r, i) => (
                  <tr key={r.n} className={i === 2 ? 'zone-start' : ''}>
                    <td className="btn-col"><span className="cx-lg-pos">{t(`cl.it.pos.${i + 1}`)}</span></td>
                    <td className="cx-lg-club">{N(r.n)}</td>
                    <td className="c-num">{r.p}</td><td className="c-num">{r.w}</td><td className="c-num">{r.d}</td><td className="c-num">{r.l}</td>
                    <td className="c-num">{r.gf}</td><td className="c-num">{r.ga}</td><td className="c-val">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="cx-tbl cx-itour-games">
              <tbody>
                {PAIRS.flatMap((pr, round) => pr.map(([a, b]) => {
                  const ha = groups[gi][a], hb = groups[gi][b];
                  if (ha === undefined || hb === undefined) return null;
                  const r = resOf(ha, hb);
                  const date = r?.date ?? `${tour!.year}-${(tour!.days?.g ?? GROUP_DAYS)[round]}`;
                  return (
                    <tr key={`${round}-${a}-${b}`}>
                      <td className="btn-col"><span className="cx-rowbtn">{dateFmt(date)}</span></td>
                      <td>{N(r ? r.home : ha)}</td>
                      <td className="c-val">{r ? `${r.hg}:${r.ag}` : 'v'}</td>
                      <td>{N(r ? r.away : hb)}</td>
                      <td className="c-pos">{g.intl?.info?.[r ? r.home : ha]?.stadium ?? ''}</td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </>
      ))}
      {(tab === 'results' || tab === 'fixtures') && (() => {
        const rows = tab === 'results'
          ? results.slice().sort((a, b) => b.date.localeCompare(a.date)).map((r, i) => (
            <tr key={i}><td className="btn-col"><span className="cx-rowbtn">{dateFmt(r.date)}</span></td><td style={{ textAlign: 'right' }}>{N(r.home)}</td><td className="c-val">{r.hg} - {r.ag}</td><td>{N(r.away)}</td></tr>))
          : (tour?.ko ?? []).filter((x) => x.hg === undefined).map((x, i) => (
            <tr key={i}><td className="btn-col"><span className="cx-rowbtn">{t(`stage.${x.stage}`)}</span></td><td style={{ textAlign: 'right' }}>{N(x.a)}</td><td className="c-val">v</td><td>{N(x.b)}</td></tr>));
        return rows.length ? <div className="cx-tbl-wrap cx-listpanel"><table className="cx-tbl"><tbody>{rows}</tbody></table></div>
          : <div className="cx-empty">{!rebornOn('helpTexts') ? '' : t(tab === 'results' ? 'intl.noResults' : 'cl.it.noFixtures')}</div>;
      })()}
      {tab === 'schedule' && (
        tour ? (
          <div className="cx-tbl-wrap cx-listpanel"><table className="cx-tbl"><tbody>
            {(tour.days?.g ?? GROUP_DAYS).map((d, i) => <tr key={`g${i}`}><td className="btn-col"><span className="cx-rowbtn">{dateFmt(`${tour.year}-${d}`)}</span></td><td>{t('cl.it.groupStage')} – {t('cl.it.round', { n: i + 1 })}</td></tr>)}
            {Object.entries(tour.days?.ko ?? { R16: '06-23', QF: '06-27', SF: '07-01', F: '07-05' }).map(([s, d]) => <tr key={s}><td className="btn-col"><span className="cx-rowbtn">{dateFmt(`${tour.year}-${d}`)}</span></td><td>{t(`stage.${s}`)}</td></tr>)}
          </tbody></table></div>
        ) : <div className="cx-empty">{draw ? t('cl.it.draw', { date: drawDate(draw) }) : t('cl.it.noFixtures')}</div>
      )}
    </div>
  );
}
