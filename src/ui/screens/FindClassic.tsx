// "Find" i klassisk tema (som i CM 01/02): fanerne Nation · Klub · Stab · Spiller, et søgefelt og en lang,
// alfabetisk liste med sider. Et klik åbner nationens liga, klubbens side, stabspersonens ansættelse eller
// spillerens profil.
import { nameQuery } from '../search';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { compName, natName, t } from '../../i18n';
import { Tabs } from '../components';
import { useGame, useNav, useRouteState, type Route } from '../core';
import { Head } from './common';
import { Pager } from './TransfersClassic';

const PAGE = 16;
export const FIND_TABS = ['nation', 'club', 'staff', 'player'] as const;
type FindTab = (typeof FIND_TABS)[number];
type Row = { key: string; name: string; sort: string; a: ReactNode; b: ReactNode; go?: Route };

export function ClassicFind({ tab: initial }: { tab?: string }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [tab, setTab] = useRouteState<FindTab>('ftab', (FIND_TABS as readonly string[]).includes(initial ?? '') ? initial as FindTab : 'player');
  const [q, setQ] = useRouteState('fq', '');
  const [pg, setPg] = useState(0);
  const noClub = t('cl.fd.noClub'), noDiv = t('cl.fd.noDiv');
  const league = (cid: number) => { const c = g.clubs[cid]; return c ? compName(g.leagues[c.league]?.name) ?? noDiv : noDiv; };
  const all = useMemo((): Row[] => {
    if (tab === 'nation') {
      const top = new Map<number, string>();
      for (const id of g.leagueOrder) { const l = g.leagues[id]; if (l && !top.has(l.nation)) top.set(l.nation, id); }
      return g.nations.map((n, i) => ({ key: `n${i}`, name: natName(n.name), sort: natName(n.name), a: n.code, b: top.has(i) ? compName(g.leagues[top.get(i)!].name) : noDiv,
        go: { name: 'international', id: i } }));
    }
    if (tab === 'club') {
      return Object.values(g.clubs).map((c) => ({ key: `c${c.id}`, name: c.name, sort: c.name, a: natName(g.nations[c.nation]?.name), b: league(c.id),
        go: c.id === g.userClub ? { name: 'squad' } : { name: 'club', id: c.id } }));
    }
    if (tab === 'staff') {
      return Object.values(g.staff).filter((s) => s.club !== g.userClub).map((s) => ({
        key: `s${s.id}`, name: `${s.last}${s.first ? `, ${s.first}` : ''}`, sort: `${s.last} ${s.first}`,
        a: s.club ? g.clubs[s.club]?.short ?? noClub : noClub, b: t(`role.staff.${s.role}`),
        go: { name: 'staff', id: s.id },
      }));
    }
    return Object.values(g.players).map((p) => ({ key: `p${p.id}`, name: `${p.last}${p.first ? `, ${p.first}` : ''}`, sort: `${p.last} ${p.first}`,
      a: p.club ? g.clubs[p.club]?.short ?? noClub : noClub, b: p.club ? league(p.club) : noDiv, go: { name: 'player', id: p.id } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, tab]);
  const needle = q.trim();
  const list = useMemo(() => { const m = nameQuery(needle); return all.filter((r) => !m || m(r.name))
    .sort((a, b) => a.sort.localeCompare(b.sort, t('cl.locale'))); }, [all, needle]);
  useEffect(() => setPg(0), [tab, needle]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = list.slice(pg * PAGE, (pg + 1) * PAGE);
  return (
    <div>
      <Head title={t('cl.find')}>
        <Tabs tabs={FIND_TABS.map((k) => [k, t(`cl.fd.${k}`)] as [string, string])} value={tab} onChange={(v) => setTab(v as FindTab)} />
      </Head>
      <div className="cx-tools cx-tools-inline">
        <span className="cx-find-label">{t('cl.fd.searchFor')}</span>
        <input className="cx-fl-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('tr.name')} />
      </div>
      <Pager desc="" pg={Math.min(pg, pages - 1)} pages={pages} setPg={setPg} />
      <div className="cx-subtitle small">{t(`cl.fd.all.${tab}`)}</div>
      <div className="cx-find">
        {shown.map((r) => (
          <div key={r.key} className={`cx-find-row ${r.go ? 'go' : ''}`} onClick={() => r.go && nav(r.go)}>
            <span className="cx-find-name">{r.name}</span><span className="cx-find-a">{r.a}</span><span className="cx-find-b">{r.b}</span>
          </div>
        ))}
        {!shown.length && <div className="cx-empty">{t('cl.fd.none')}</div>}
      </div>
      <div className="cx-found">{t('cl.fd.found', { n: list.length.toLocaleString(t('cl.locale')) })}</div>
    </div>
  );
}
