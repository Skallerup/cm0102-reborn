// Transfers i klassisk tema ("Player & Staff Search"): budget øverst til højre, fanerne Short List · Player Search ·
// Staff Search · Scout #1 · Scout #2 (og Scout #3-#5, tilbud og handler nederst), værktøjslinjen Search ▾ · View ▾ ·
// Filters, en sidevisning (Pg 1/112), den klassiske tabel og filterdialogen "Filters for Player Search".
import { nameQuery } from '../search';
import { useEffect, useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { ageOn } from '../../game/dates';
import { ATTRS } from '../../game/attributes';
import { attrRange, knowledgeOf, scoutStars } from '../../game/scouting';
import type { Trait } from '../../game/personality';
import { transferRealism } from '../../game/transfers';
import type { Player, Staff } from '../../game/types';
import { compName, dateFmt, money, natName, t } from '../../i18n';
import { ClassicSub, CxDrop, nationRoute, type DropItem } from '../classic';
import { Seg } from '../classicOptions';
import { Select } from '../select';
import { Stars, Tabs, posStr } from '../components';
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
  const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout').sort((a, b) => a.id - b.id);
  const scoutKey = (n: number) => `scout${n}`;
  const scoutTab = /^scout\d$/.test(tab) ? Number(tab.slice(5)) : 0;
  // fanerne som i CM 01/02: Short List · Player Search · Staff Search · Scout #1 · Scout #2 – og Scout #3-#5 nederst
  // (tilbud og handler, som originalen ikke har her, ligger yderst i den nederste række)
  return (
    <div>
      <Head title={t('cl.tr.title')} action={club ? <button className="cx-funds" title={t('nav.finance')} onClick={() => nav({ name: 'finance' })}>{t('cl.tr.funds', { fee: money(club.transferBudget) })}</button> : undefined} />
      <Tabs tabs={[
        ['shortlist', t('cl.tr.shortlist')], ['search', t('tr.search')], ['staff', t('cl.tr.staffSearch')],
        [scoutKey(1), t('cl.tr.scoutN', { n: 1 })], [scoutKey(2), t('cl.tr.scoutN', { n: 2 })],
      ]} value={tab === 'listed' ? 'deals' : tab} onChange={setTab} disabled={[1, 2].filter((n) => !scouts[n - 1]).map(scoutKey)} />
      <ClassicSub items={[
        ...[3, 4, 5].map((n) => ({ key: scoutKey(n), label: t('cl.tr.scoutN', { n }), disabled: !scouts[n - 1], on: tab === scoutKey(n), onClick: () => setTab(scoutKey(n)) })),
        { key: 'offers', label: `${t('tr.offers')}${pending ? ` (${pending})` : ''}`, on: tab === 'offers', onClick: () => setTab('offers') },
        { key: 'deals', label: t('tr.deals'), on: tab === 'deals' || tab === 'listed', onClick: () => setTab('deals') },
      ]} />
      {tab === 'search' && <Search classic />}
      {tab === 'shortlist' && <ClassicPlayerTable players={g.shortlist.map((id) => g.players[id]).filter(Boolean)} title={t('cl.tr.shortlist')} viewMenu />}
      {tab === 'staff' && <StaffSearch />}
      {scoutTab > 0 && <ScoutTab scout={scouts[scoutTab - 1]} n={scoutTab} />}
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

/** Visningerne i View ▾ (samme rækkefølge som originalen; "Andet" er scouternes vurdering) */
const VIEWS = ['general', 'contract', 'stats', 'attributes', 'notes', 'scouting'];

function ViewMenu({ view, setView }: { view: string; setView: (v: string) => void }) {
  return <CxDrop label={t('cl.sq.view')} items={VIEWS.map((k) => ({ key: k, label: t(`cl.tr.v.${k}`), checked: view === k, onClick: () => setView(k) }))} />;
}

export function ClassicSearch({ f, setF, defaults, results, active, nations }: {
  f: Filters; setF: (v: Filters) => void; defaults: Filters; results: Player[]; active: number; nations: number[];
}) {
  const g = useGame()!;
  const [open, setOpen] = useState(false);
  const [view, setView] = useRouteState('tview', 'general');
  // hvilken forudindstilling svarer filtrene til (ellers "egen søgning")
  const same = (p: Preset) => (Object.keys(defaults) as (keyof Filters)[]).every((k) => (k in p.set ? p.set[k] : defaults[k]) === f[k]);
  const preset = PRESETS.find(same);
  const items: DropItem[] = PRESETS.filter((p) => p.key !== 'realistic' || g.userClub > 0)
    .map((p) => ({ key: p.key, label: t(`cl.tr.p.${p.key}`), checked: preset?.key === p.key, onClick: () => setF({ ...defaults, ...p.set }) }));
  return (
    <div>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.tr.searchBtn')} items={items} />
        <ViewMenu view={view} setView={setView} />
        <span className="grow" />
        <button className="cx-greybtn" onClick={() => setOpen(true)}>{t('cl.tr.filters')}{active ? ` (${active})` : ''}</button>
        <button className="cx-greybtn" disabled={!active} onClick={() => setF({ ...defaults })}>{t('tr.f.reset')}</button>
      </div>
      <ClassicPlayerTable players={results} title={t('tr.search')} view={view}
        desc={preset ? t(`cl.tr.p.${preset.key}`) : t('cl.tr.custom', { n: active })} initialSort={f.realism ? 'real' : 'val'} />
      {open && <FilterDialog f={f} defaults={defaults} nations={nations} onOk={(v) => { setF(v); setOpen(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ---------- "Filters for Player Search" ----------

const AGES: [string, number, number][] = [['any', 15, 40], ['0-21', 15, 21], ['19-25', 19, 25], ['20-30', 20, 30], ['25-32', 25, 32], ['30+', 30, 40]];
const VALUES = [250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000];
/** De attributter, man oftest søger på – resten findes under "Egenskaber" */
const SHOW_ATTRS = ['passing', 'tackling', 'dribbling', 'finishing', 'heading', 'technique', 'creativity', 'decisions', 'positioning', 'pace', 'stamina', 'strength'];

/** Filterdialogen i klassisk stil: rækker med "Alle" og valgmuligheder; ændringerne gælder først ved OK */
function FilterDialog({ f: initial, defaults, nations, onOk, onClose }: { f: Filters; defaults: Filters; nations: number[]; onOk: (f: Filters) => void; onClose: () => void }) {
  const g = useGame()!;
  const [f, setF] = useState<Filters>(initial);
  const [tab, setTab] = useState<'general' | 'attributes'>('general');
  const [textOn, setTextOn] = useState(!!initial.name);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF({ ...f, [k]: v });
  const home = g.clubs[g.userClub]?.nation ?? g.manager.nation;
  const homeCode = g.nations[home]?.code ?? '';
  const any = t('cl.fl.any');
  const row = (label: string, ctl: ReactNode) => <><span>{label}</span><div className="cx-fl-ctl">{ctl}</div></>;
  const age = AGES.find(([, lo, hi]) => f.minAge === lo && f.maxAge === hi)?.[0] ?? 'custom';
  const nat = f.nation < 0 ? 'any' : f.nation === home ? 'home' : 'other';
  const based = f.league ? 'other' : f.based || 'any';
  const status = f.onlyListed ? 'listed' : f.onLoan ? 'loan' : 'any';
  const contract = f.onlyFree ? 'free' : f.expiring ? 'expiring' : 'any';
  const valueRange = f.minValue > 0 || f.maxValue > 0;
  const [rangeOn, setRangeOn] = useState(valueRange);
  const yesNo = (v: boolean, on: (b: boolean) => void, anyLabel = any) => <Seg value={v} opts={[[false, anyLabel], [true, t('cl.fl.yes')]]} onChange={on} />;
  const attrSlots = (['attr1', 'attr2', 'attr3'] as const);
  const groupOf = (i: number) => t(i <= 13 ? 'group.technical' : i <= 24 ? 'group.mental' : i <= 32 ? 'group.physical' : 'group.goalkeeping');
  const attrOptions = ATTRS.slice(0, 36).map((k, i) => ({ value: i, label: t(`attr.${k}`), group: groupOf(i) }));
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal cx-settings cx-filters" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><span>{t('cl.fl.title')}</span><button className="x" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div className="cx-set-top">
            <div className="cx-fl-tabs">
              <button className={tab === 'general' ? 'on' : ''} onClick={() => setTab('general')}>{t('cl.fl.general')}</button>
              <button className={tab === 'attributes' ? 'on' : ''} onClick={() => setTab('attributes')}>{t('cl.fl.attributes')}</button>
            </div>
            <button className="cx-greybtn" onClick={() => { setF({ ...defaults }); setTextOn(false); setRangeOn(false); }}>{t('cl.fl.clear')}</button>
          </div>
          {tab === 'general' ? (
            <div className="cx-set-grid">
              {row(t('cl.fl.text'), <>
                <Seg value={textOn} opts={[[false, any], [true, t('cl.fl.specified')]]} onChange={(v) => { setTextOn(v); if (!v) set('name', ''); }} />
                {textOn && <input className="cx-fl-input" autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder={t('tr.name')} />}
              </>)}
              {row(t('cl.fl.nat'), <>
                <Seg value={nat} opts={[['any', any], ['home', homeCode], ['other', t('cl.fl.other')]]}
                  onChange={(v) => set('nation', v === 'any' ? -1 : v === 'home' ? home : (nations.find((n) => n !== home) ?? -1))} />
                {nat === 'other' && <Select value={f.nation} onChange={(v) => set('nation', v)} width={190}
                  options={nations.map((n) => ({ value: n, label: natName(g.nations[n].name), flag: g.nations[n].name, hint: g.nations[n].code }))} />}
              </>)}
              {row(t('col.age'), <Seg value={age} opts={AGES.map(([k]) => [k, k === 'any' ? any : k] as [string, string])}
                onChange={(v) => { const a = AGES.find(([k]) => k === v)!; setF({ ...f, minAge: a[1], maxAge: a[2] }); }} />)}
              {row(t('cl.fl.based'), <>
                <Seg value={based} opts={[['any', any], ['home', homeCode], ['abroad', t('cl.fl.abroad')], ['other', t('cl.fl.other')]]}
                  onChange={(v) => setF({ ...f, based: v === 'home' || v === 'abroad' ? v : '', league: v === 'other' ? (f.league || g.leagueOrder.find((l) => g.leagues[l]) || '') : '' })} />
                {based === 'other' && <Select value={f.league} onChange={(v) => set('league', v)} width={230}
                  options={g.leagueOrder.filter((l) => g.leagues[l]).map((l) => ({ value: l, label: compName(g.leagues[l].name), group: natName(g.nations[g.leagues[l].nation]?.name) }))} />}
              </>)}
              {row(t('col.value'), <>
                <Seg value={rangeOn} opts={[[false, any], [true, t('cl.fl.range')]]} onChange={(v) => { setRangeOn(v); if (!v) setF({ ...f, minValue: 0, maxValue: 0 }); }} />
                {rangeOn && <span className="cx-fl-range">
                  <select value={f.minValue} onChange={(e) => set('minValue', Number(e.target.value))}><option value={0}>–</option>{VALUES.map((v) => <option key={v} value={v}>{money(v)}</option>)}</select>
                  –
                  <select value={f.maxValue} onChange={(e) => set('maxValue', Number(e.target.value))}><option value={0}>–</option>{VALUES.map((v) => <option key={v} value={v}>{money(v)}</option>)}</select>
                </span>}
              </>)}
              {row(t('cl.fl.status'), <Seg value={status} opts={[['any', any], ['listed', t('cl.fl.listed')], ['loan', t('cl.fl.onLoan')]]}
                onChange={(v) => setF({ ...f, onlyListed: v === 'listed', onLoan: v === 'loan' })} />)}
              {row(t('cl.fl.contract'), <Seg value={contract} opts={[['any', any], ['free', t('cl.fl.expired')], ['expiring', t('cl.fl.expiring')]]}
                onChange={(v) => setF({ ...f, onlyFree: v === 'free', expiring: v === 'expiring' })} />)}
              {row(t('cl.fl.pos'), <Seg value={f.posGroup || 'any'} opts={[['any', any], ['GK', 'GK'], ['D', t('cl.fl.def')], ['M', t('cl.fl.mid')], ['A', t('cl.fl.att')]]}
                onChange={(v) => setF({ ...f, posGroup: v === 'any' ? '' : v as Filters['posGroup'], role: '' })} />)}
              {row(t('cl.fl.side'), <Seg value={f.side || 'any'} opts={[['any', any], ['L', t('cl.fl.left')], ['C', t('cl.fl.centre')], ['R', t('cl.fl.right')]]}
                onChange={(v) => set('side', v === 'any' ? '' : v as Filters['side'])} />)}
              {row(t('cl.fl.injuries'), <Seg value={f.noInjured} opts={[[false, any], [true, t('cl.fl.none')]]} onChange={(v) => set('noInjured', v)} />)}
              {g.userClub > 0 && row(t('cl.fl.interested'), yesNo(f.interested, (v) => set('interested', v)))}
              {g.userClub > 0 && row(t('tr.f.scouted'), yesNo(!!f.scouted, (v) => set('scouted', v)))}
              {g.options.masking && row(t('cl.fl.scouted'), yesNo(f.onlyKnown, (v) => set('onlyKnown', v), t('cl.fl.no')))}
              {g.userClub > 0 && row(t('cl.fl.squad'), yesNo(f.includeSquad, (v) => set('includeSquad', v), t('cl.fl.no')))}
            </div>
          ) : (
            <div className="cx-set-grid">
              {row(t('player.ability'), <Seg value={String(f.minAbility)} opts={[0, 1, 2, 3, 4, 5].map((n) => [String(n), n ? '★'.repeat(n) : any] as [string, string])} onChange={(v) => set('minAbility', Number(v))} />)}
              {row(t('player.potential'), <Seg value={String(f.minPotential)} opts={[0, 1, 2, 3, 4, 5].map((n) => [String(n), n ? '★'.repeat(n) : any] as [string, string])} onChange={(v) => set('minPotential', Number(v))} />)}
              {attrSlots.map((ak, i) => {
                const mk = `${ak}Min` as 'attr1Min';
                return row(t('cl.fl.attrN', { n: i + 1 }), <>
                  <Select value={f[ak]} onChange={(v) => set(ak, v)} width={190} options={[{ value: -1, label: any }, ...attrOptions]} />
                  {f[ak] >= 0 && <Seg value={String(f[mk])} opts={[10, 12, 14, 16, 18].map((n) => [String(n), `≥ ${n}`] as [string, string])} onChange={(v) => set(mk, Number(v))} />}
                </>);
              })}
              {row(t('tr.f.foot'), <Seg value={f.foot || 'any'} opts={[['any', any], ['L', t('tr.f.left')], ['R', t('tr.f.right')]]} onChange={(v) => set('foot', v === 'any' ? '' : v)} />)}
              {row(t('tr.f.height'), <Seg value={String(f.minHeight)} opts={[0, 175, 180, 185, 190].map((h) => [String(h), h ? `≥ ${h}` : any] as [string, string])} onChange={(v) => set('minHeight', Number(v))} />)}
              {row(t('tr.f.maxWage'), <Seg value={String(f.maxWage)} opts={[0, 5_000, 10_000, 25_000, 50_000, 100_000].map((w) => [String(w), w ? `≤ ${money(w)}` : any] as [string, string])} onChange={(v) => set('maxWage', Number(v))} />)}
              {row(t('tr.f.trait'), <Seg value={f.trait || 'any'} opts={[['any', any], ...(['leader', 'professional', 'bigGame', 'loyal', 'ambitious'] as Trait[]).map((x) => [x, t(`trait.${x}`)] as [string, string])]} onChange={(v) => set('trait', v === 'any' ? '' : v)} />)}
              {row(t('tr.f.noTrouble'), yesNo(f.noTrouble, (v) => set('noTrouble', v), t('cl.fl.no')))}
              {g.userClub > 0 && row(t('real.col'), <Seg value={String(f.realism)} opts={[['0', any], ['1', t('real.only')], ['2', t('real.maybe')]]} onChange={(v) => set('realism', Number(v))} />)}
              {g.options.masking && <span className="cx-fl-hint">{t('tr.f.attrHint')}</span>}
            </div>
          )}
        </div>
        <div className="modal-foot cx-set-foot">
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" onClick={() => onOk({ ...f, name: textOn ? f.name : '' })}>{t('common.ok')}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Staff Search ----------

const STAFF_PRESETS = ['all', 'free', 'manager', 'assistant', 'coach', 'physio', 'scout'] as const;

function repLabel(rep: number) {
  return t(`cl.st.rep.${rep >= 85 ? 6 : rep >= 70 ? 5 : rep >= 55 ? 4 : rep >= 40 ? 3 : rep >= 25 ? 2 : 1}`);
}

function StaffSearch() {
  const g = useGame()!;
  const { nav } = useNav();
  const [preset, setPreset] = useRouteState<string>('spreset', 'all');
  const [q, setQ] = useRouteState('sq', '');
  const [pg, setPg] = useState(0);
  const [pages, setPages] = useState(1);
  const list = Object.values(g.staff).filter((s) => s.club !== g.userClub
    && (preset === 'all' || (preset === 'free' ? !s.club : s.role === preset))
    && (!q || !!nameQuery(q)?.(s.first, s.last)));
  useEffect(() => setPg(0), [list.length]);
  const where = (s: Staff) => s.club ? g.clubs[s.club]?.short ?? '' : natName(g.nations[s.nation]?.name);
  const based = (s: Staff) => { const c = g.clubs[s.club]; return c ? compName(g.leagues[c.league]?.name) ?? natName(g.nations[c.nation]?.name) : natName(g.nations[s.nation]?.name); };
  const cols: CxCol<Staff>[] = [
    { key: 'inf', label: t('cl.tn.inf'), render: (s) => (!s.club ? <span className="cx-inf" title={t('common.free')}>{t('cl.st.free')}</span> : null), sort: (s) => (s.club ? 1 : 0) },
    { key: 'name', label: t('col.name'), cls: 'c-name', sort: (s) => `${s.last} ${s.first}`,
      render: (s) => <span className="link" onClick={() => nav({ name: 'staff', id: s.id })}>{s.last}{s.first ? `, ${s.first}` : ''}</span> },
    { key: 'club', label: t('cl.st.clubNation'), cls: 'c-club', render: (s) => (s.club ? <span className="link" onClick={() => nav({ name: 'club', id: s.club })}>{where(s)}</span> : where(s)), sort: where },
    // Based: ligaen kan klikkes (gul understregning under musen, som i CM 01/02)
    { key: 'based', label: t('cl.tr.basedIn'), cls: 'c-yel', render: (s) => { const c = g.clubs[s.club]; return c && g.leagues[c.league] ? <span className="link" onClick={() => nav({ name: 'competitions', id: c.league })}>{based(s)}</span> : <span className="link" onClick={() => nav(nationRoute(c?.nation ?? s.nation))}>{based(s)}</span>; }, sort: based },
    { key: 'job', label: t('cl.st.job'), cls: 'c-orange', render: (s) => t(`role.staff.${s.role}`), sort: (s) => t(`role.staff.${s.role}`) },
    { key: 'rep', label: t('cl.st.rep'), cls: 'c-val', render: (s) => repLabel(s.rep), sort: (s) => s.rep },
  ];
  return (
    <div>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.tr.searchBtn')} items={STAFF_PRESETS.map((k) => ({ key: k, label: t(`cl.st.p.${k}`), checked: preset === k, onClick: () => setPreset(k) }))} />
        <input className="cx-fl-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('tr.name')} />
        <span className="grow" />
      </div>
      <Pager desc={t(`cl.st.p.${preset}`)} pg={pg} pages={pages} setPg={setPg} />
      <div className="cx-subtitle small">{t('cl.tr.staffSearch')}</div>
      <CxTable rows={list} cols={cols} rowKey={(s) => s.id} initialSort="rep" page={{ size: PAGE, index: Math.min(pg, pages - 1) }}
        onPage={(n) => { if (n !== pages) queueMicrotask(() => setPages(n)); }}
        btn={() => <span className="cx-rowbtn" />} />
      <div className="cx-found">{t('cl.st.found', { n: list.length.toLocaleString(t('cl.locale')) })}</div>
    </div>
  );
}

// ---------- Scout #n ----------

function ScoutTab({ scout, n }: { scout?: Staff; n: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  if (!scout) return <div className="cx-empty">{t('cl.sc.none', { n })}</div>;
  const a = scout.assignment;
  const target = !a ? '' : a.kind === 'player' ? `${g.players[a.target as number]?.first ?? ''} ${g.players[a.target as number]?.last ?? ''}`.trim()
    : a.kind === 'nation' ? natName(g.nations[a.target as number]?.name) : compName(g.leagues[a.target as string]?.name) ?? String(a.target);
  const players = !a ? [] : a.kind === 'player' ? [g.players[a.target as number]].filter(Boolean) : (a.found ?? []).map((id) => g.players[id]).filter(Boolean);
  return (
    <div>
      <div className="cx-tools cx-tools-inline">
        <span className="cx-scout-who">{scout.first} {scout.last}</span>
        <span className="grow" />
        <button className="cx-greybtn" onClick={() => nav({ name: 'scouting' })}>{a ? t('cl.sc.change') : t('cl.sc.send')}</button>
      </div>
      <ClassicPlayerTable players={players} title={t('cl.tr.scoutN', { n })} viewMenu
        desc={a ? t('cl.sc.desc', { target, since: a.since ? dateFmt(a.since) : '–' }) : t('cl.sc.idle')} />
    </div>
  );
}

export function Pager({ desc, pg, pages, setPg }: { desc: string; pg: number; pages: number; setPg: (n: number) => void }) {
  return (
    <div className="cx-pager-line">
      <span className="grow">{desc}</span>
      <button onClick={() => setPg(0)} disabled={pg === 0} aria-label="first">«</button>
      <button onClick={() => setPg(Math.max(0, pg - 1))} disabled={pg === 0} aria-label="previous">‹</button>
      <span className="pg">{t('cl.tr.page', { n: pg + 1, of: pages })}</span>
      <button onClick={() => setPg(Math.min(pages - 1, pg + 1))} disabled={pg >= pages - 1} aria-label="next">›</button>
      <button onClick={() => setPg(pages - 1)} disabled={pg >= pages - 1} aria-label="last">»</button>
    </div>
  );
}

/** Spillertabellen: blå knap (shortlist), Inf, navn, klub, land/liga, position, værdi – med sider */
export function ClassicPlayerTable({ players, title, desc, view: viewProp, initialSort = 'val', viewMenu }: {
  players: Player[]; title: string; desc?: string; view?: string; initialSort?: string;
  /** vis selv View ▾ (når tabellen ikke ligger under søgningens værktøjslinje) */
  viewMenu?: boolean;
}) {
  const g = useGame()!;
  const { nav } = useNav();
  const [ownView, setOwnView] = useRouteState('tview', 'general');
  const view = viewProp ?? ownView;
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
    { key: 'inf', label: t('cl.tn.inf'), render: (p) => { const x = inf(p); return x ? <span className={`cx-inf ${x[2] ? 'bad' : ''}`} title={x[1]}>{t(`cl.tag.${x[0]}`)}</span> : null; }, sort: (p) => inf(p)?.[0] ?? '~' },
    { key: 'name', label: t('col.name'), cls: 'c-name', render: (p) => <span className="link" onClick={() => nav({ name: 'player', id: p.id })}>{p.last}{p.first ? `, ${p.first}` : ''}{p.club !== g.userClub && (g.knowledge[p.id] ?? 0) >= 60 && <span className="cx-sct" title={t('tr.sctTip')}> Sct</span>}</span>, sort: (p) => `${p.last} ${p.first}` },
  ];
  const club: CxCol<Player> = { key: 'club', label: t('col.club'), cls: 'c-club', render: (p) => (p.club ? <span className="link" onClick={() => nav({ name: 'club', id: p.club })}>{g.clubs[p.club]?.name}</span> : '-'), sort: (p) => g.clubs[p.club]?.name ?? '' };
  const pos: CxCol<Player> = { key: 'pos', label: t('col.pos'), cls: 'c-pos', render: (p) => posStr(p), sort: (p) => -p.pos.indexOf(Math.max(...p.pos)) };
  const val: CxCol<Player> = { key: 'val', label: t('col.value'), cls: 'c-val', render: (p) => money(p.value), sort: (p) => p.value };
  const age: CxCol<Player> = { key: 'age', label: t('col.age'), cls: 'c-num c-yel', render: (p) => ageOn(p.dob, g.date), sort: (p) => -ageOn(p.dob, g.date) };
  const real: CxCol<Player>[] = g.userClub ? [{ key: 'real', label: t('real.col'), cls: 'c-yel', title: t('real.hint'), render: (p) => t(`real.level${transferRealism(p).level}`), sort: (p) => { const r = transferRealism(p); return -r.level * 100 + r.score; } }] : [];
  const st = (p: Player) => p.stats;
  const avr = (p: Player) => (p.stats.ratingCount ? p.stats.ratingSum / p.stats.ratingCount : 0);
  const num = (key: string, label: string, get: (p: Player) => number, fmt = (v: number) => (v ? String(v) : '-')): CxCol<Player> =>
    ({ key, label, cls: 'c-num c-cyan', render: (p) => fmt(get(p)), sort: get });
  const attrCol = (k: string): CxCol<Player> => {
    const i = ATTRS.indexOf(k as never);
    return { key: `a${i}`, label: t(`cl.at.${k}`), title: t(`attr.${k}`), cls: 'c-num c-yel', sort: (p) => { const [lo, hi] = attrRange(p, i); return lo + hi; },
      render: (p) => { const [lo, hi] = attrRange(p, i); return lo === hi ? lo : `${lo}-${hi}`; } };
  };
  const cols: CxCol<Player>[] = view === 'scouting'
    ? [...base, club, age, pos,
      { key: 'ab', label: t('player.ability'), render: (p) => <Stars range={scoutStars(p).ability} />, sort: (p) => { const s = scoutStars(p).ability; return s[0] * 10 + s[1]; } },
      { key: 'pot', label: t('player.potential'), render: (p) => <Stars range={scoutStars(p).potential} />, sort: (p) => { const s = scoutStars(p).potential; return s[0] * 10 + s[1]; } },
      { key: 'k', label: t('tr.known'), cls: 'c-num c-yel', render: (p) => `${Math.round(knowledgeOf(p))}%`, sort: (p) => knowledgeOf(p) }, ...real]
    : view === 'contract'
    ? [...base, club, age,
      { key: 'wage', label: t('col.wage'), cls: 'c-yel', render: (p) => money(p.contract?.wage ?? 0), sort: (p) => p.contract?.wage ?? 0 },
      { key: 'exp', label: t('col.expires'), cls: 'c-yel', render: (p) => (p.contract ? dateFmt(p.contract.expires) : '-'), sort: (p) => p.contract?.expires ?? '' }, val]
    : view === 'stats'
    ? [...base, pos, num('apps', t('cl.tn.apps'), (p) => st(p).apps + st(p).subs), num('gls', t('cl.tn.gls'), (p) => st(p).goals), num('asts', t('cl.tn.asts'), (p) => st(p).assists),
      num('mom', t('cl.tn.mom'), (p) => st(p).mom), num('yel', t('cl.tn.yel'), (p) => st(p).yellows), num('red', t('cl.tn.red'), (p) => st(p).reds),
      num('avr', t('cl.tn.avr'), avr, (v) => (v ? v.toFixed(2) : '----')), val]
    : view === 'attributes'
    ? [...base, pos, ...SHOW_ATTRS.map(attrCol)]
    : view === 'notes'
    ? [...base, club, pos, { key: 'notes', label: t('cl.tn.notes'), cls: 'c-cyan', render: (p) => p.notes || '-', sort: (p) => (p.notes ? 0 : 1) }]
    : [...base, club, { key: 'based', label: t('cl.tr.based'), cls: 'c-yel', render: (p) => (p.club && g.clubs[p.club] ? <span className="link" onClick={() => nav(nationRoute(g.clubs[p.club].nation))}>{based(p)}</span> : based(p)), sort: based }, pos, val, ...real];
  return (
    <>
      {viewMenu && <div className="cx-tools cx-tools-inline"><ViewMenu view={view} setView={setOwnView} /></div>}
      <Pager desc={desc ?? ''} pg={pg} pages={pages} setPg={setPg} />
      <div className="cx-subtitle small">{title}</div>
      <CxTable rows={players} cols={cols} rowKey={(p) => p.id} initialSort={initialSort} page={{ size: PAGE, index: Math.min(pg, pages - 1) }}
        onPage={(n) => { if (n !== pages) queueMicrotask(() => setPages(n)); }}
        btn={(p) => {
          const on = g.shortlist.includes(p.id);
          return <button className={`cx-rowbtn ${on ? 'on' : ''}`} title={on ? t('player.unshortlist') : t('player.shortlist')} onClick={() => act({ t: 'shortlist', pid: p.id, on: !on })}>{on ? '★' : ''}</button>;
        }} />
      <div className="cx-found">{t('cl.tr.found', { n: players.length.toLocaleString(t('cl.locale')) })}</div>
    </>
  );
}
