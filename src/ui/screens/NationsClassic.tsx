// "Championship Manager" (CM 01/02 Nations & Clubs): Nations · Under-21s · Major Clubs øverst, League · Non-League · Other
// nederst. Listerne står i to kolonner (navn, landekode og ligaens forkortelse) for én verdensdel (Continent ▾) eller,
// under League, ét land (Nation ▾).
import type { GameState } from '../../game/types';
import { compName, natName, t } from '../../i18n';
import { ClassicSub, CxDrop, compAbbr } from '../classic';
import { REGIONS, regionOfNation, type UiRegion } from '../classicOptions';
import { Tabs } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';

type Tab = 'nations' | 'u21' | 'major' | 'league' | 'nonleague' | 'other';

export function ClassicNations() {
  const g = useGame()! as GameState;
  const { nav } = useNav();
  const [tab, setTab] = useRouteState<Tab>('nctab', 'nations');
  const own = g.clubs[g.userClub]?.nation;
  const [reg, setReg] = useRouteState<UiRegion>('ncreg', regionOfNation(g.nations[own ?? -1]?.name));
  const [nat, setNat] = useRouteState<number>('ncnat', own ?? 0);
  const clubs = Object.values(g.clubs);
  const regionOf = (n: number) => regionOfNation(g.nations[n]?.name);
  const hidden = (lg: string) => !!g.leagues[lg]?.hidden;
  const lgAbbr = (lg: string) => (g.leagues[lg] ? compAbbr(compName(g.leagues[lg].name) ?? '') : '');
  const nations = [...new Set(clubs.map((c) => c.nation))].filter((n) => g.nations[n]);
  const leagueNations = nations.filter((n) => clubs.some((c) => c.nation === n && !hidden(c.league) && g.comps[c.league]));
  type Row = { key: string; name: string; code: string; extra: string; go: () => void };
  const natRow = (n: number, u21 = false): Row => ({ key: `n${n}`, name: natName(g.nations[n]?.name), code: g.nations[n]?.code ?? '', extra: '', go: () => nav({ name: 'international', id: n, ...(u21 ? { state: { [`ntt:${n}`]: 'u21' } } : {}) }) });
  const clubRow = (c: (typeof clubs)[number]): Row => ({ key: `c${c.id}`, name: c.short, code: g.nations[c.nation]?.code ?? '', extra: lgAbbr(c.league), go: () => nav({ name: 'club', id: c.id }) });
  const byName = (a: Row, b: Row) => a.name.localeCompare(b.name, t('cl.locale'));
  let rows: Row[] = [];
  let title = '';
  const adj = t(`cl.nc.adj.${reg}`);
  if (tab === 'nations' || tab === 'u21') { rows = nations.filter((n) => regionOf(n) === reg).map((n) => natRow(n, tab === 'u21')); title = t(tab === 'u21' ? 'cl.nc.u21Of' : 'cl.nc.nationsOf', { r: adj }); }
  else if (tab === 'major') { rows = clubs.filter((c) => c.rep >= 75 && !hidden(c.league) && regionOf(c.nation) === reg).map(clubRow); title = t('cl.nc.majorOf', { r: adj }); }
  else if (tab === 'other') { rows = clubs.filter((c) => c.rep < 75 && !hidden(c.league) && g.comps[c.league] && regionOf(c.nation) === reg).sort((a, b) => b.rep - a.rep).slice(0, 300).map(clubRow); title = t('cl.nc.otherOf', { r: adj }); }
  else if (tab === 'nonleague') { rows = clubs.filter((c) => hidden(c.league) && regionOf(c.nation) === reg).map(clubRow); title = t('cl.nc.nonLeagueOf', { r: adj }); }
  else { rows = clubs.filter((c) => c.nation === nat && !hidden(c.league) && g.comps[c.league]).map(clubRow); title = t('cl.nc.leagueOf', { n: natName(g.nations[nat]?.name) }); }
  rows.sort(byName);
  const half = Math.ceil(rows.length / 2);
  const col = (list: Row[]) => <div className="cx-nc-col">{list.map((r) => (
    <div key={r.key} className="cx-nc-row"><span className="cx-link" role="link" onClick={r.go}>{r.name}</span><span className="code">{r.code}</span><span className="extra">{r.extra}</span></div>
  ))}</div>;
  const TOP: Tab[] = ['nations', 'u21', 'major'], BOTTOM: Tab[] = ['league', 'nonleague', 'other'];
  return (
    <div className="cx-nc">
      <Head title={t('cl.nc.title')} />
      <Tabs tabs={TOP.map((x) => [x, t(`cl.nc.t.${x}`)] as [string, string])} value={TOP.includes(tab) ? tab : ''} onChange={(v) => setTab(v as Tab)} />
      <div className="cx-tools">
        {tab === 'league'
          ? <CxDrop label={t('cl.nc.nation')} items={leagueNations.sort((a, b) => natName(g.nations[a]?.name).localeCompare(natName(g.nations[b]?.name))).map((n) => ({ key: String(n), label: natName(g.nations[n]?.name), checked: n === nat, onClick: () => setNat(n) }))} />
          : <CxDrop label={t('cl.nc.continent')} items={REGIONS.map((r) => ({ key: r, label: t(`cl.region.${r}`), checked: r === reg, onClick: () => setReg(r) }))} />}
      </div>
      <div className="cx-subtitle small">{title}</div>
      <div className="cx-nc-list">{rows.length ? <>{col(rows.slice(0, half))}{col(rows.slice(half))}</> : <div className="cx-empty">{t('common.none')}</div>}</div>
      <ClassicSub items={BOTTOM.map((x) => ({ key: x, label: t(`cl.nc.t.${x}`), on: tab === x, onClick: () => setTab(x) }))} />
    </div>
  );
}
