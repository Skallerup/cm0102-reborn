// Transfers i klassisk tema ("Player & Staff Search"): budget øverst til højre, fanerne Short List · Player Search ·
// Offers · Deals, værktøjslinjen Search ▾ · View ▾ · Filters · Reset, en sidevisning (Pg 1/112) og den klassiske tabel.
// Under-knapperne nederst fører til klubbens scouter.
import { useEffect, useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { ageOn } from '../../game/dates';
import { knowledgeOf, scoutStars } from '../../game/scouting';
import { transferRealism } from '../../game/transfers';
import type { Player } from '../../game/types';
import { dateFmt, money, natName, t } from '../../i18n';
import { ClassicSub, CxDrop, type DropItem } from '../classic';
import { Modal, Stars, Tabs, posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { CxTable, type CxCol } from './CxTable';
import { Deals, Offers, Search, type Filters } from './Transfers';

const PAGE = 16;

export function ClassicTransfers({ tab: initial }: { tab?: string }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [tab, setTab] = useRouteState('tab', initial ?? 'search');
  const pending = g.offers.filter((o) => o.status === 'pending' && o.seller === g.userClub).length;
  const club = g.clubs[g.userClub];
  const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout');
  return (
    <div>
      <Head title={t('cl.tr.title')} action={club ? <span className="cx-funds">{t('cl.tr.funds', { fee: money(club.transferBudget) })}</span> : undefined} />
      <Tabs tabs={[
        ['shortlist', `${t('tr.shortlist')} (${g.shortlist.length})`], ['search', t('tr.search')],
        ['offers', `${t('tr.offers')}${pending ? ` (${pending})` : ''}`], ['deals', t('tr.deals')],
      ]} value={tab === 'listed' ? 'deals' : tab} onChange={setTab} />
      <ClassicSub items={[
        ...scouts.slice(0, 4).map((s, i) => ({ key: `s${s.id}`, label: `${t('cl.tr.scout')} #${i + 1} ${s.last}`, onClick: () => nav({ name: 'scouting' }) })),
        { key: 'scouting', label: t('nav.scouting'), onClick: () => nav({ name: 'scouting' }) },
      ]} />
      {tab === 'search' && <Search classic />}
      {tab === 'shortlist' && <ClassicPlayerTable players={g.shortlist.map((id) => g.players[id]).filter(Boolean)} title={t('tr.shortlist')} />}
      {tab === 'offers' && <Offers />}
      {(tab === 'deals' || tab === 'listed') && <Deals />}
    </div>
  );
}

// ---------- søgningen ----------

type Preset = { key: string; set: Partial<Filters> };
const PRESETS: Preset[] = [
  { key: 'all', set: {} },
  { key: 'free', set: { onlyFree: true } },
  { key: 'listed', set: { onlyListed: true } },
  { key: 'expiring', set: { expiring: true } },
  { key: 'young', set: { maxAge: 21, minPotential: 3 } },
  { key: 'realistic', set: { realism: 1 } },
];

export function ClassicSearch({ f, setF, defaults, results, active, filterPanel }: {
  f: Filters; setF: (v: Filters) => void; defaults: Filters; results: Player[]; active: number; filterPanel: ReactNode;
}) {
  const g = useGame()!;
  const [open, setOpen] = useState(false);
  const [view, setView] = useRouteState('tview', 'general');
  // hvilken forudindstilling svarer filtrene til (ellers "egen søgning")
  const same = (p: Preset) => (Object.keys(defaults) as (keyof Filters)[]).every((k) => (k in p.set ? p.set[k] : defaults[k]) === f[k]);
  const preset = PRESETS.find(same);
  const items: DropItem[] = PRESETS.filter((p) => p.key !== 'realistic' || g.userClub > 0)
    .map((p) => ({ key: p.key, label: t(`cl.tr.p.${p.key}`), checked: preset?.key === p.key, onClick: () => setF({ ...defaults, ...p.set }) }));
  const views: DropItem[] = ['general', 'scouting', 'contract'].map((k) => ({ key: k, label: t(`cl.tr.v.${k}`), checked: view === k, onClick: () => setView(k) }));
  return (
    <div>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.tr.searchBtn')} items={items} />
        <CxDrop label={t('cl.sq.view')} items={views} />
        <span className="grow" />
        <button className="cx-greybtn" onClick={() => setOpen(true)}>{t('cl.tr.filters')}{active ? ` (${active})` : ''}</button>
        <button className="cx-greybtn" disabled={!active} onClick={() => setF({ ...defaults })}>{t('tr.f.reset')}</button>
      </div>
      <ClassicPlayerTable players={results} title={t('tr.search')} view={view}
        desc={preset ? t(`cl.tr.p.${preset.key}`) : t('cl.tr.custom', { n: active })} initialSort={f.realism ? 'real' : 'val'} />
      {open && (
        <Modal title={t('cl.tr.filters')} onClose={() => setOpen(false)} wide>
          {filterPanel}
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <span className="muted grow">{t('cl.tr.found', { n: results.length.toLocaleString() })}</span>
            <button className="primary" onClick={() => setOpen(false)}>{t('common.ok')}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Spillertabellen: blå knap (shortlist), Inf, navn, klub, land/liga, position, værdi – med sider */
export function ClassicPlayerTable({ players, title, desc, view = 'general', initialSort = 'val' }: {
  players: Player[]; title: string; desc?: string; view?: string; initialSort?: string;
}) {
  const g = useGame()!;
  const { nav } = useNav();
  const [pg, setPg] = useState(0);
  const [pages, setPages] = useState(1);
  useEffect(() => setPg(0), [players.length, view]);
  const seasonEnd = `${Number(g.date.slice(0, 4)) + (Number(g.date.slice(5, 7)) >= 7 ? 1 : 0)}-06-30`;
  const inf = (p: Player): [string, string, boolean] | null => {
    if (p.injury) return ['Inj', t(`injury.${p.injury.key}`), true];
    if (p.banned > 0) return ['Sus', t('tag.ban'), true];
    if (!p.club) return ['Fre', t('common.free'), false];
    if (p.listed) return ['Lst', t('tag.listed'), false];
    if (p.contract && p.contract.expires <= seasonEnd) return ['Exp', t('col.expires'), false];
    if (p.loan) return ['Lon', t('tag.loan'), false];
    return null;
  };
  const based = (p: Player) => { const c = g.clubs[p.club]; return c ? natName(g.nations[c.nation]?.name) ?? '' : t('common.free'); };
  const base: CxCol<Player>[] = [
    { key: 'inf', label: t('cl.tn.inf'), render: (p) => { const x = inf(p); return x ? <span className={`cx-inf ${x[2] ? 'bad' : ''}`} title={x[1]}>{x[0]}</span> : null; }, sort: (p) => inf(p)?.[0] ?? '~' },
    { key: 'name', label: t('col.name'), cls: 'c-name', render: (p) => <span onClick={() => nav({ name: 'player', id: p.id })}>{p.last}{p.first ? `, ${p.first}` : ''}</span>, sort: (p) => `${p.last} ${p.first}` },
  ];
  const club: CxCol<Player> = { key: 'club', label: t('col.club'), cls: 'c-club', render: (p) => (p.club ? <span className="link" onClick={() => nav({ name: 'club', id: p.club })}>{g.clubs[p.club]?.name}</span> : '-'), sort: (p) => g.clubs[p.club]?.name ?? '' };
  const pos: CxCol<Player> = { key: 'pos', label: t('col.pos'), cls: 'c-pos', render: (p) => posStr(p), sort: (p) => -p.pos.indexOf(Math.max(...p.pos)) };
  const val: CxCol<Player> = { key: 'val', label: t('col.value'), cls: 'c-val', render: (p) => money(p.value), sort: (p) => p.value };
  const age: CxCol<Player> = { key: 'age', label: t('col.age'), cls: 'c-num c-yel', render: (p) => ageOn(p.dob, g.date), sort: (p) => -ageOn(p.dob, g.date) };
  const real: CxCol<Player>[] = g.userClub ? [{ key: 'real', label: t('real.col'), cls: 'c-yel', title: t('real.hint'), render: (p) => t(`real.level${transferRealism(p).level}`), sort: (p) => { const r = transferRealism(p); return -r.level * 100 + r.score; } }] : [];
  const cols: CxCol<Player>[] = view === 'scouting'
    ? [...base, club, age, pos,
      { key: 'ab', label: t('player.ability'), render: (p) => <Stars range={scoutStars(p).ability} />, sort: (p) => { const s = scoutStars(p).ability; return s[0] * 10 + s[1]; } },
      { key: 'pot', label: t('player.potential'), render: (p) => <Stars range={scoutStars(p).potential} />, sort: (p) => { const s = scoutStars(p).potential; return s[0] * 10 + s[1]; } },
      { key: 'k', label: t('tr.known'), cls: 'c-num c-yel', render: (p) => `${Math.round(knowledgeOf(p))}%`, sort: (p) => knowledgeOf(p) }, ...real]
    : view === 'contract'
    ? [...base, club, age,
      { key: 'wage', label: t('col.wage'), cls: 'c-yel', render: (p) => money(p.contract?.wage ?? 0), sort: (p) => p.contract?.wage ?? 0 },
      { key: 'exp', label: t('col.expires'), cls: 'c-yel', render: (p) => (p.contract ? dateFmt(p.contract.expires) : '-'), sort: (p) => p.contract?.expires ?? '' }, val]
    : [...base, club, { key: 'based', label: t('cl.tr.based'), cls: 'c-yel', render: based, sort: based }, pos, val, ...real];
  return (
    <>
      <div className="cx-pager-line">
        <span className="grow">{desc ?? ''}</span>
        <button onClick={() => setPg(0)} disabled={pg === 0} aria-label="first">«</button>
        <button onClick={() => setPg(Math.max(0, pg - 1))} disabled={pg === 0} aria-label="previous">‹</button>
        <span className="pg">{t('cl.tr.page', { n: pg + 1, of: pages })}</span>
        <button onClick={() => setPg(Math.min(pages - 1, pg + 1))} disabled={pg >= pages - 1} aria-label="next">›</button>
        <button onClick={() => setPg(pages - 1)} disabled={pg >= pages - 1} aria-label="last">»</button>
      </div>
      <div className="cx-subtitle small">{title}</div>
      <CxTable rows={players} cols={cols} rowKey={(p) => p.id} initialSort={initialSort} page={{ size: PAGE, index: Math.min(pg, pages - 1) }}
        onPage={(n) => { if (n !== pages) queueMicrotask(() => setPages(n)); }}
        btn={(p) => {
          const on = g.shortlist.includes(p.id);
          return <button className={`cx-rowbtn narrow ${on ? 'on' : ''}`} title={on ? t('player.unshortlist') : t('player.shortlist')} onClick={() => act({ t: 'shortlist', pid: p.id, on: !on })}>{on ? '★' : ''}</button>;
        }} />
      <div className="cx-found">{t('cl.tr.found', { n: players.length.toLocaleString() })}</div>
    </>
  );
}
