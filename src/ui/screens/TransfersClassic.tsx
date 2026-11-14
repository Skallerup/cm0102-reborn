// Transfers i klassisk tema ("Player & Staff Search"): budget øverst til højre, fanerne Short List · Player Search ·
// Staff Search · Scout #1 · Scout #2 (og Scout #3-#5, tilbud og handler nederst), værktøjslinjen Search ▾ · View ▾ ·
// Filters, en sidevisning (Pg 1/112), den klassiske tabel og filterdialogen "Filters for Player Search".
import { nameQuery } from '../search';
import { useEffect, useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { ageOn } from '../../game/dates';
import { ATTRS } from '../../game/attributes';
import { interestedClubs, transferRealism } from '../../game/transfers';
import { nationLanguage } from '../../game/languages';
import { willJoin } from '../../game/staff';
import { attrRange, knowledgeOf, scoutStars } from '../../game/scouting';
import type { Trait } from '../../game/personality';
import type { GameState, Player, ScoutAssignment, Staff, StaffRole } from '../../game/types';
import { compName, dateFmt, money, natName, t } from '../../i18n';
import { ClassicSub, CxDrop, nationRoute, type DropItem } from '../classic';
import { REGIONS, Seg, regionOfNation, showRealism } from '../classicOptions';
import { authentic } from '../../game/rules';
import { JOB_CODE, cmJobCode, cmScoutRec, cmRecScout, cmActive, cmStaffClub, cmStaffInSearch, cmStaffInf, cmJobKey, cmStaffRep, cmStaffRepRank, cmStaffRepWord } from '../../game/cmStaff';
import { regionOf } from '../../game/leagues';
import { askConfirm, askText } from '../confirm';
import { FL_ATTRS, SF_ATTRS, countMins, encodeMins, parseMins, staffAttrValue } from './searchAttrs';
import { Select } from '../select';
import { Stars, Tabs, posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { CxTable, type CxCol } from './CxTable';
import { Deals, Offers, Search, type Filters } from './Transfers';
import { ClassicNations } from './NationsClassic';

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
  // Assign Scout → Club (CM 01/02, original DB i ægte tilstand): Nations & Clubs som vælger i stedet for søgeskærmen
  const [picker, setPicker] = useState<((cid: number) => void) | null>(null);
  if (picker) return <ClassicNations pick={(cid) => { setPicker(null); picker(cid); }} onBack={() => setPicker(null)} />;
  // fanerne som i CM 01/02: Short List · Player Search · Staff Search · Scout #1 · Scout #2 – og Scout #3-#5 nederst
  // (tilbud og handler, som originalen ikke har her, ligger yderst i den nederste række)
  return (
    <div>
      <Head title={t('cl.tr.title')} action={club ? <button className="cx-funds" title={t('nav.finance')} onClick={() => nav(authentic() ? { name: 'club', id: g.userClub, state: { cview: 'finances' } } : { name: 'finance' })}>{t('cl.tr.funds', { fee: money(club.transferBudget) })}</button> : undefined} />
      <Tabs tabs={[
        ['shortlist', t('cl.tr.shortlist')], ['search', t('tr.search')], ['staff', t('cl.tr.staffSearch')],
        [scoutKey(1), t('cl.tr.scoutN', { n: 1 })], [scoutKey(2), t('cl.tr.scoutN', { n: 2 })],
      ]} value={tab === 'listed' ? 'deals' : tab} onChange={setTab} disabled={[1, 2].filter((n) => !scouts[n - 1]).map(scoutKey)} />
      <ClassicSub items={[
        ...[3, 4, 5].map((n) => ({ key: scoutKey(n), label: t('cl.tr.scoutN', { n }), disabled: !scouts[n - 1], on: tab === scoutKey(n), onClick: () => setTab(scoutKey(n)) })),
        // Offers og Deals findes ikke i CM 01/02 – kun i det udvidede spil
        ...(authentic() ? [] : [
          { key: 'offers', label: `${t('tr.offers')}${pending ? ` (${pending})` : ''}`, on: tab === 'offers', onClick: () => setTab('offers') },
          { key: 'deals', label: t('tr.deals'), on: tab === 'deals' || tab === 'listed', onClick: () => setTab('deals') },
        ]),
      ]} />
      {tab === 'search' && <Search classic />}
      {tab === 'shortlist' && <Search classic shortlist />}
      {tab === 'staff' && <StaffSearch />}
      {scoutTab > 0 && <ScoutTab scout={scouts[scoutTab - 1]} n={scoutTab} onPick={setPicker} />}
      {tab === 'offers' && !authentic() && <Offers />}
      {(tab === 'deals' || tab === 'listed') && !authentic() && <Deals />}
    </div>
  );
}

// ---------- søgningen ----------

type Preset = { key: string; set: Partial<Filters> };
/** Faste søgninger, der ligger under Search → Load Settings sammen med de gemte (originalen har kun de gemte) */
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

// ---------- Search ▾: Load Settings · Save Settings · Save Settings As · Delete Settings · Reset · Clear ----------
// Søgeindstillinger gemmes under et navn i denne browser (fælles for alle karrierer, som originalens søgeindstillinger).

const SS_KEY = 'cm0102.searchSettings';
type SettingsStore = Record<string, Record<string, unknown>>;
const readSettings = (kind: string): Record<string, unknown> => {
  try { return (JSON.parse(localStorage.getItem(SS_KEY) ?? '{}') as SettingsStore)[kind] ?? {}; } catch { return {}; }
};
const writeSettings = (kind: string, v: Record<string, unknown>) => {
  try { const all = JSON.parse(localStorage.getItem(SS_KEY) ?? '{}') as SettingsStore; all[kind] = v; localStorage.setItem(SS_KEY, JSON.stringify(all)); } catch { /* ignorér */ }
};

/** Menuen under Search for både spiller- og stabssøgningen. `named` = den indstilling, der er hentet/gemt (vises over listen). */
function useSearchMenu<F extends object>({ kind, f, defaults, presets, apply, named, setNamed, active }: {
  kind: 'player' | 'staff' | 'scout'; f: F; defaults: F; presets: { key: string; label: string; set: Partial<F> }[]; apply: (v: F) => void;
  named: string; setNamed: (n: string) => void; active: number;
}): DropItem[] {
  const [, bump] = useState(0);
  const store = readSettings(kind);
  const names = Object.keys(store).sort((a, b) => a.localeCompare(b));
  const full = (v: unknown) => ({ ...defaults, ...(v as Partial<F>) });
  const same = (a: F, b: F) => JSON.stringify(a) === JSON.stringify(b);
  const loadedSetting = named && store[named] ? full(store[named]) : null;
  const dirty = !!loadedSetting && !same(loadedSetting, f);
  const sc = kind === 'scout';
  const save = (name: string) => { writeSettings(kind, { ...readSettings(kind), [name]: f }); setNamed(name); bump((n) => n + 1); };
  const items: DropItem[] = [
    { key: 'load', label: sc ? t('cl.sc.load') : t('cl.sch.load'), sub: [
      ...presets.map((p) => ({ key: `p-${p.key}`, label: p.label, checked: !named && same(full(p.set), f), onClick: () => { apply(full(p.set)); setNamed(''); } })),
      ...(names.length ? [{ key: 'sep', sep: true } as DropItem] : []),
      ...names.map((n) => ({ key: `n-${n}`, label: n, checked: named === n, onClick: () => { apply(full(store[n])); setNamed(n); } })),
    ] },
    { key: 'save', label: sc ? t('cl.sc.save') : t('cl.sch.save'), disabled: !loadedSetting || !dirty, onClick: () => save(named) },
    { key: 'saveAs', label: sc ? t('cl.sc.saveAs') : t('cl.sch.saveAs'), onClick: async () => {
      const name = await askText(t('cl.sch.name'), named || '', { head: t('cl.sch.saveAs') });
      if (!name) return;
      if (store[name] && name !== named && !(await askConfirm(t('cl.sch.overwrite', { name })))) return;
      save(name);
    } },
    names.length
      ? { key: 'del', label: sc ? t('cl.sc.delete') : t('cl.sch.delete'), sub: names.map((n) => ({ key: `d-${n}`, label: n, onClick: async () => {
        if (!(await askConfirm(t('cl.sch.confirmDelete', { name: n }), { danger: true }))) return;
        const rest = { ...readSettings(kind) }; delete rest[n]; writeSettings(kind, rest);
        if (named === n) setNamed('');
        bump((x) => x + 1);
      } })) }
      : { key: 'del', label: sc ? t('cl.sc.delete') : t('cl.sch.delete'), disabled: true, onClick: () => {} },
    { key: 'reset', label: t('cl.sch.reset'), disabled: !dirty && !(active > 0 && !named), onClick: () => { if (loadedSetting) apply(loadedSetting); else apply({ ...defaults }); } },
    { key: 'clear', label: t('cl.sch.clear'), disabled: active === 0 && !named, onClick: () => { apply({ ...defaults }); setNamed(''); } },
  ];
  return items;
}

export function ClassicSearch({ f, setF, defaults, results, total, active, nations, shortlist }: {
  f: Filters; setF: (v: Filters) => void; defaults: Filters; results: Player[]; total: number; active: number; nations: number[]; shortlist?: boolean;
}) {
  const g = useGame()!;
  const [open, setOpen] = useState(false);
  const [view, setView] = useRouteState('tview', 'general');
  const [named, setNamed] = useRouteState('sname', '');
  const realism = showRealism();
  // hvilken fast søgning svarer filtrene til (ellers "egen søgning")
  const same = (p: Preset) => (Object.keys(defaults) as (keyof Filters)[]).every((k) => (k in p.set ? p.set[k] : defaults[k]) === f[k]);
  const preset = PRESETS.find(same);
  const presets = PRESETS.filter((p) => p.key !== 'realistic' || (g.userClub > 0 && realism)).map((p) => ({ key: p.key, label: t(`cl.tr.p.${p.key}`), set: p.set }));
  const items = useSearchMenu<Filters>({ kind: 'player', f, defaults, presets, apply: setF, named, setNamed, active });
  return (
    <div>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.tr.searchBtn')} items={items} />
        <ViewMenu view={view} setView={setView} />
        <span className="grow" />
        <button className="cx-greybtn" onClick={() => setOpen(true)}>{t('cl.tr.filters')}{active ? ` (${active})` : ''}</button>
        <button className="cx-greybtn" disabled>{t('cl.tr.delete')}</button>
      </div>
      <ClassicPlayerTable players={results} title={shortlist ? t('cl.tr.shortlist') : t('tr.search')} view={view} total={total}
        desc={named || (shortlist && !active ? t('cl.tr.shortlistDesc') : preset ? t(`cl.tr.p.${preset.key}`) : t('cl.tr.custom', { n: active }))} initialSort={f.realism && realism ? 'real' : 'val'} />
      {open && <FilterDialog f={f} defaults={defaults} nations={nations} onOk={(v) => { setF(v); setOpen(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ---------- "Filters for Player Search" ----------

const AGES: [string, number, number][] = [['any', 15, 40], ['0-21', 15, 21], ['19-25', 19, 25], ['20-30', 20, 30], ['25-32', 25, 32], ['30+', 30, 40]];
const VALUES = [250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000];
/** De attributter, man oftest ser i visningen Attributes */
const SHOW_ATTRS = ['passing', 'tackling', 'dribbling', 'finishing', 'heading', 'technique', 'creativity', 'decisions', 'positioning', 'pace', 'stamina', 'strength'];

/** Fanen Attributes: to kolonner (felterne fyldes skiftevis), hver med navn, "-", værdien (grøn, start 1) og "+" – som i CM 01/02 */
function AttrMinGrid({ labels, mins, onChange }: { labels: string[]; mins: Record<number, number>; onChange: (m: Record<number, number>) => void }) {
  const val = (i: number) => mins[i] ?? 1;
  const step = (i: number, d: number) => onChange({ ...mins, [i]: Math.max(1, Math.min(20, val(i) + d)) });
  return (
    <div className="cx-fl-attrs">
      {labels.map((l, i) => (
        <div key={i} className="cx-fl-attr">
          <span>{l}</span>
          <button aria-label={`${l} -`} onClick={() => step(i, -1)}>-</button>
          <b className={val(i) > 1 ? 'set' : ''}>{val(i)}</b>
          <button aria-label={`${l} +`} onClick={() => step(i, 1)}>+</button>
        </div>
      ))}
    </div>
  );
}

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
  const realism = showRealism();
  const ext = !authentic();
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
              {ext && <>
                {row(t('player.ability'), <Seg value={String(f.minAbility)} opts={[0, 1, 2, 3, 4, 5].map((n) => [String(n), n ? '★'.repeat(n) : any] as [string, string])} onChange={(v) => set('minAbility', Number(v))} />)}
                {row(t('player.potential'), <Seg value={String(f.minPotential)} opts={[0, 1, 2, 3, 4, 5].map((n) => [String(n), n ? '★'.repeat(n) : any] as [string, string])} onChange={(v) => set('minPotential', Number(v))} />)}
                {row(t('tr.f.foot'), <Seg value={f.foot || 'any'} opts={[['any', any], ['L', t('tr.f.left')], ['R', t('tr.f.right')]]} onChange={(v) => set('foot', v === 'any' ? '' : v)} />)}
                {row(t('tr.f.height'), <Seg value={String(f.minHeight)} opts={[0, 175, 180, 185, 190].map((h) => [String(h), h ? `≥ ${h}` : any] as [string, string])} onChange={(v) => set('minHeight', Number(v))} />)}
                {row(t('tr.f.maxWage'), <Seg value={String(f.maxWage)} opts={[0, 5_000, 10_000, 25_000, 50_000, 100_000].map((w) => [String(w), w ? `≤ ${money(w)}` : any] as [string, string])} onChange={(v) => set('maxWage', Number(v))} />)}
                {row(t('tr.f.trait'), <Seg value={f.trait || 'any'} opts={[['any', any], ...(['leader', 'professional', 'bigGame', 'loyal', 'ambitious'] as Trait[]).map((x) => [x, t(`trait.${x}`)] as [string, string])]} onChange={(v) => set('trait', v === 'any' ? '' : v)} />)}
                {row(t('tr.f.noTrouble'), yesNo(f.noTrouble, (v) => set('noTrouble', v), t('cl.fl.no')))}
              </>}
              {g.userClub > 0 && realism && row(t('real.col'), <Seg value={String(f.realism)} opts={[['0', any], ['1', t('real.only')], ['2', t('real.maybe')]]} onChange={(v) => set('realism', Number(v))} />)}
            </div>
          ) : (
            <AttrMinGrid labels={FL_ATTRS.map((a) => (a.key === 'setPieces' ? t('cl.fl.setPieces') : t(`attr.${a.key}`)))} mins={parseMins(f.attrMins)} onChange={(m) => set('attrMins', encodeMins(m))} />
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

function repLabel(rep: number) {
  return t(`cl.st.rep.${rep >= 85 ? 6 : rep >= 70 ? 5 : rep >= 55 ? 4 : rep >= 40 ? 3 : rep >= 25 ? 2 : 1}`);
}

/** Staff Search: View ▾ = General · Attributes · Player Notes (som i originalen) */
const STAFF_VIEWS = ['general', 'attributes', 'notes'] as const;

// ---------- "Filters for Staff Search": Text · Nationality · Age · Language · Based · Job · Interested (+ fanen Attributes) ----------

interface StaffFilters {
  text: string; nation: number; age: '' | '0-30' | '30-40' | '40-50' | '50-60' | '60+'; lang: boolean;
  based: '' | 'home' | 'abroad' | 'other'; basedNation: number; role: '' | 'free' | StaffRole; interested: boolean; attrMins: string;
}
const SF_DEFAULT: StaffFilters = { text: '', nation: -1, age: '', lang: false, based: '', basedNation: -1, role: '', interested: false, attrMins: '' };
const STAFF_ROLES = ['manager', 'assistant', 'coach', 'physio', 'scout'] as const;
const STAFF_AGES: [StaffFilters['age'], string][] = [['', 'any'], ['0-30', '0-30'], ['30-40', '30-40'], ['40-50', '40-50'], ['50-60', '50-60'], ['60+', '60+']];
const sfActive = (f: StaffFilters) => (Object.keys(SF_DEFAULT) as (keyof StaffFilters)[]).filter((k) => k !== 'attrMins' && k !== 'basedNation' && f[k] !== SF_DEFAULT[k]).length + countMins(f.attrMins);
const STAFF_PRESETS: { key: string; set: Partial<StaffFilters> }[] = [
  { key: 'all', set: {} }, { key: 'free', set: { role: 'free' } },
  ...STAFF_ROLES.map((r) => ({ key: r, set: { role: r } as Partial<StaffFilters> })),
];

function StaffFilterDialog({ f: initial, nations, onOk, onClose }: { f: StaffFilters; nations: number[]; onOk: (f: StaffFilters) => void; onClose: () => void }) {
  const g = useGame()!;
  const [f, setF] = useState<StaffFilters>(initial);
  const [tab, setTab] = useState<'general' | 'attributes'>('general');
  const [textOn, setTextOn] = useState(!!initial.text);
  const set = <K extends keyof StaffFilters>(k: K, v: StaffFilters[K]) => setF({ ...f, [k]: v });
  const home = g.clubs[g.userClub]?.nation ?? g.manager.nation;
  const homeCode = g.nations[home]?.code ?? '';
  const any = t('cl.fl.any');
  const row = (label: string, ctl: ReactNode) => <><span>{label}</span><div className="cx-fl-ctl">{ctl}</div></>;
  const nat = f.nation < 0 ? 'any' : f.nation === home ? 'home' : 'other';
  const myLang = nationLanguage(g, home);
  const langName = myLang ? (() => { try { return new Intl.DisplayNames([t('cl.locale')], { type: 'language' }).of(myLang) ?? myLang; } catch { return myLang; } })() : '';
  const natSel = (value: number, on: (n: number) => void) => <Select value={value} onChange={on} width={190}
    options={nations.map((n) => ({ value: n, label: natName(g.nations[n].name), flag: g.nations[n].name, hint: g.nations[n].code }))} />;
  const otherNation = (skip: number) => nations.find((n) => n !== skip) ?? -1;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal cx-settings cx-filters" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><span>{t('cl.sf.title')}</span><button className="x" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div className="cx-set-top">
            <div className="cx-fl-tabs">
              <button className={tab === 'general' ? 'on' : ''} onClick={() => setTab('general')}>{t('cl.fl.general')}</button>
              <button className={tab === 'attributes' ? 'on' : ''} onClick={() => setTab('attributes')}>{t('cl.fl.attributes')}</button>
            </div>
            <button className="cx-greybtn" onClick={() => { setF({ ...SF_DEFAULT }); setTextOn(false); }}>{t('cl.fl.clear')}</button>
          </div>
          {tab === 'general' ? (
            <div className="cx-set-grid">
              {row(t('cl.fl.text'), <>
                <Seg value={textOn} opts={[[false, any], [true, t('cl.fl.specified')]]} onChange={(v) => { setTextOn(v); if (!v) set('text', ''); }} />
                {textOn && <input className="cx-fl-input" autoFocus value={f.text} onChange={(e) => set('text', e.target.value)} placeholder={t('tr.name')} />}
              </>)}
              {row(t('cl.fl.nat'), <>
                <Seg value={nat} opts={[['any', any], ['home', homeCode], ['other', t('cl.fl.other')]]}
                  onChange={(v) => set('nation', v === 'any' ? -1 : v === 'home' ? home : otherNation(home))} />
                {nat === 'other' && natSel(f.nation, (n) => set('nation', n))}
              </>)}
              {row(t('col.age'), <Seg value={f.age} opts={STAFF_AGES.map(([k, l]) => [k, k === '' ? any : l] as [StaffFilters['age'], string])} onChange={(v) => set('age', v)} />)}
              {row(t('cl.sf.language'), <Seg value={f.lang} opts={[[false, any], ...(langName ? [[true, langName] as [boolean, string]] : [])]} onChange={(v) => set('lang', v)} />)}
              {row(t('cl.fl.based'), <>
                <Seg value={f.based} opts={[['', any], ['home', homeCode], ['abroad', t('cl.fl.abroad')], ['other', t('cl.fl.other')]]}
                  onChange={(v) => setF({ ...f, based: v, basedNation: v === 'other' ? (f.basedNation >= 0 ? f.basedNation : otherNation(home)) : -1 })} />
                {f.based === 'other' && natSel(f.basedNation, (n) => set('basedNation', n))}
              </>)}
              {row(t('cl.st.job'), <>
                <Seg value={f.role !== ''} opts={[[false, any], [true, t('cl.fl.specified')]]} onChange={(v) => set('role', v ? 'manager' : '')} />
                {f.role !== '' && <Seg value={f.role} opts={[...STAFF_ROLES.map((r) => [r, t(`role.staff.${r}`)] as [StaffFilters['role'], string]), ['free', t('cl.st.unemployed')]]} onChange={(v) => set('role', v)} />}
              </>)}
              {g.userClub > 0 && row(t('cl.fl.interested'), <Seg value={f.interested} opts={[[false, any], [true, t('cl.fl.yes')]]} onChange={(v) => set('interested', v)} />)}
            </div>
          ) : (
            <AttrMinGrid labels={SF_ATTRS.map((k) => t(`staff.${k}`))} mins={parseMins(f.attrMins)} onChange={(m) => set('attrMins', encodeMins(m))} />
          )}
        </div>
        <div className="modal-foot cx-set-foot">
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" onClick={() => onOk({ ...f, text: textOn ? f.text : '' })}>{t('common.ok')}</button>
        </div>
      </div>
    </div>
  );
}

/** "Based": ligaens navn for klubber i et spilbart land (en aktiv nation med en synlig liga), ellers landet – ledige: deres land */
function basedName(g: GameState, club: number, nation: number): string {
  const c = g.clubs[club];
  if (!c) return natName(g.nations[nation]?.name) ?? '';
  const lg = g.leagues[c.league];
  return lg && !lg.hidden && g.activeNations.includes(c.nation) ? compName(lg.name) ?? '' : natName(g.nations[c.nation]?.name) ?? '';
}
const basedRoute = (g: GameState, club: number, nation: number) => {
  const c = g.clubs[club];
  const lg = c && g.leagues[c.league];
  return lg && !lg.hidden && g.activeNations.includes(c.nation) ? { name: 'competitions' as const, id: c.league } : nationRoute(c?.nation ?? nation);
};

function StaffSearch() {
  const g = useGame()!;
  const { nav } = useNav();
  const [sf, setSf] = useRouteState<StaffFilters>('sfilters2', SF_DEFAULT);
  const [named, setNamed] = useRouteState('ssname', '');
  const [view, setView] = useRouteState<string>('sview', 'general');
  const [open, setOpen] = useState(false);
  const [pg, setPg] = useState(0);
  const [pages, setPages] = useState(1);
  const active = sfActive(sf);
  const home = g.clubs[g.userClub]?.nation ?? g.manager.nation;
  const myLang = nationLanguage(g, home);
  const nations = [...new Set(Object.values(g.staff).map((s) => s.nation))].filter((n) => g.nations[n]).sort((a, b) => natName(g.nations[a].name).localeCompare(natName(g.nations[b].name)));
  const q = nameQuery(sf.text);
  const mins = Object.entries(parseMins(sf.attrMins)).map(([i, v]) => [Number(i), v] as [number, number]);
  const AGE: Record<string, [number, number]> = { '0-30': [0, 30], '30-40': [30, 40], '40-50': [40, 50], '50-60': [50, 60], '60+': [60, 200] };
  // den originale database i ægte tilstand: "Famous staff and all staff in your region" (0x80af8d) – kun databasens stab (cmStaff.ts)
  const cm = cmActive(g);
  const myRegion = regionOf(g.nations[home]?.name);
  const base = Object.values(g.staff).filter((s) => (cm ? cmStaffInSearch(g, s, myRegion) : s.club !== g.userClub));
  const list = base.filter((s) => {
    if (sf.role && (sf.role === 'free' ? !!s.club || (cm && !!cmStaffClub(g, s)) : s.role !== sf.role || (cm && !!s.cmExtra && cmJobCode(s) !== JOB_CODE[s.role]))) return false;
    if (sf.nation >= 0 && s.nation !== sf.nation) return false;
    if (q && !q(s.first, s.last)) return false;
    if (sf.age) { const a = ageOn(s.dob, g.date); const [lo, hi] = AGE[sf.age]; if (a < lo || a >= hi) return false; }
    if (sf.lang && nationLanguage(g, s.nation) !== myLang) return false;
    if (sf.based) {
      const bn = g.clubs[s.club]?.nation ?? s.nation;
      if (sf.based === 'home' ? bn !== home : sf.based === 'abroad' ? bn === home : bn !== sf.basedNation) return false;
    }
    if (sf.interested && !willJoin(s)) return false;
    return !mins.some(([i, v]) => staffAttrValue(s, i) < v);
  });
  useEffect(() => setPg(0), [list.length, view]);
  // cmExtra (den originale database): klubben uden for spillets stab (databasens klub – navnet, evt. uden link)
  const where = (s: Staff) => s.club ? g.clubs[s.club]?.short ?? '' : (cm && cmStaffClub(g, s)?.name) || t('cl.st.noClubNation');
  const clubOf = (s: Staff) => s.club || (cm ? cmStaffClub(g, s)?.id ?? 0 : 0);
  const based = (s: Staff) => { const x = cm && !s.club ? cmStaffClub(g, s) : null; return x && !x.id ? natName(g.nations[x.nation]?.name) ?? '' : basedName(g, clubOf(s), s.nation); };
  const job = (s: Staff) => (cm ? t(cmJobKey(s)) : s.club ? t(`role.staff.${s.role}`) : t('cl.st.unemployed'));
  const nameCol: CxCol<Staff> = { key: 'name', label: t('col.name'), cls: 'c-name', sort: (s) => `${s.last} ${s.first}`,
    render: (s) => <span className="link" onClick={() => nav({ name: 'staff', id: s.id })}>{s.last}{s.first ? `, ${s.first}` : ''}</span> };
  // Inf (CM 01/02): Inj/Wnt for stab, sorterbar (ejerens billede 44) – kun den originale database i ægte tilstand
  const infCol: CxCol<Staff> = cm
    ? { key: 'inf', label: t('cl.tn.inf'), sort: (s) => { const x = cmStaffInf(g, s); return x === 'Inj' ? 2 : x === 'Wnt' ? 1 : 0; },
      render: (s) => { const x = cmStaffInf(g, s); return x ? <button className={`cx-inf ${x === 'Inj' ? 'bad full' : ''}`} onClick={() => nav({ name: 'staff', id: s.id, state: { sttab: 'transfer' } })}>{t(`cl.tag.${x}`)}</button> : null; } }
    : { key: 'inf', label: t('cl.tn.inf'), render: () => null };
  const clubCol: CxCol<Staff> = { key: 'club', label: t('cl.st.clubNation'), cls: 'c-club', render: (s) => (clubOf(s) ? <span className="link" onClick={() => nav({ name: 'club', id: clubOf(s) })}>{where(s)}</span> : where(s)), sort: where };
  // Based: ligaen/landet kan klikkes (gul understregning under musen, som i CM 01/02)
  const basedCol: CxCol<Staff> = { key: 'based', label: t('cl.tr.basedIn'), cls: 'c-yel', render: (s) => <span className="link" onClick={() => nav(basedRoute(g, clubOf(s), (cm && !s.club ? cmStaffClub(g, s)?.nation : undefined) ?? s.nation))}>{based(s)}</span>, sort: based };
  const jobCol: CxCol<Staff> = { key: 'job', label: t('cl.st.job'), cls: 'c-orange', render: job, sort: job };
  // Rep. (0x80e787): originalens ord og grænser i den originale database
  const repCol: CxCol<Staff> = cm
    ? { key: 'rep', label: t('cl.st.rep'), cls: 'c-val', render: (s) => t(`cm.rep.${cmStaffRepWord(s, g.date)}`), sort: (s) => cmStaffRepRank(s, g.date) * 100000 + cmStaffRep(s) }
    : { key: 'rep', label: t('cl.st.rep'), cls: 'c-val', render: (s) => repLabel(s.rep), sort: (s) => s.rep };
  const cols: CxCol<Staff>[] = view === 'attributes'
    ? [infCol, nameCol, clubCol, jobCol, ...SF_ATTRS.map((k, i): CxCol<Staff> => ({ key: `a-${k}`, label: t(`staff.short.${k}`), title: t(`staff.${k}`), cls: 'c-num c-yel', render: (s) => staffAttrValue(s, i) || '-', sort: (s) => staffAttrValue(s, i) })), repCol]
    : view === 'notes'
    ? [infCol, nameCol, clubCol, jobCol, { key: 'notes', label: t('cl.tn.notes'), cls: 'c-cyan', render: () => '-' }]
    : [infCol, nameCol, clubCol, basedCol, jobCol, repCol];
  const presets = STAFF_PRESETS.map((p) => ({ key: p.key, label: t(`cl.st.p.${p.key}`), set: p.set }));
  const preset = STAFF_PRESETS.find((p) => JSON.stringify({ ...SF_DEFAULT, ...p.set }) === JSON.stringify(sf));
  const items = useSearchMenu<StaffFilters>({ kind: 'staff', f: sf, defaults: SF_DEFAULT, presets, apply: setSf, named, setNamed, active });
  return (
    <div>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.tr.searchBtn')} items={items} />
        <CxDrop label={t('cl.sq.view')} items={STAFF_VIEWS.map((k) => ({ key: k, label: t(`cl.tr.v.${k}`), checked: view === k, onClick: () => setView(k) }))} />
        <span className="grow" />
        <button className="cx-greybtn" onClick={() => setOpen(true)}>{t('cl.tr.filters')}{active ? ` (${active})` : ''}</button>
        <button className="cx-greybtn" disabled>{t('cl.tr.delete')}</button>
      </div>
      <Pager desc={named || (preset ? (cm && preset.key === 'all' ? t('cm.ss.desc') : t(`cl.st.p.${preset.key}`)) : t('cl.tr.custom', { n: active }))} pg={pg} pages={pages} setPg={setPg} />
      {open && <StaffFilterDialog f={sf} nations={nations} onOk={(v) => { setSf(v); setOpen(false); }} onClose={() => setOpen(false)} />}
      <div className="cx-subtitle small">{t('cl.tr.staffSearch')}</div>
      <CxTable rows={list} cols={cols} rowKey={(s) => s.id} initialSort="rep" page={{ size: PAGE, index: Math.min(pg, pages - 1) }}
        onPage={(n) => { if (n !== pages) queueMicrotask(() => setPages(n)); }}
        btn={() => <span className="cx-rowbtn" />} />
      <div className="cx-found">{t('cl.st.found', { n: list.length.toLocaleString(t('cl.locale')) })}{active > 0 && list.length < base.length ? ` ${t('cl.tr.filteredOut', { n: (base.length - list.length).toLocaleString(t('cl.locale')) })}` : ''}</div>
    </div>
  );
}

// ---------- Scout #n ----------

/** Spejderens opgave som gemt indstilling (uden fundne spillere og datoer) */
interface ScoutCfg { a: Pick<ScoutAssignment, 'kind' | 'target' | 'focus' | 'role' | 'attr' | 'attrMin' | 'maxValue'> | null }

function ScoutTab({ scout, n, onPick }: { scout?: Staff; n: number; onPick?: (f: () => (cid: number) => void) => void }) {
  const g = useGame()!;
  const [named, setNamed] = useRouteState('scname', '');
  const [view, setView] = useRouteState('tview', 'general');
  if (!scout) return <div className="cx-empty">{t('cl.sc.none', { n })}</div>;
  // den originale database i ægte tilstand (search_screens.cpp 0x80b479/0x80b4bf): "Scout Les Kershaw not assigned" / "Scout L.Kershaw
  // assigned to Bradford", Assign Scout → Club åbner Nations & Clubs, og en tildelt spejder har Recall Scout i stedet for Assign Scout
  const cm = cmActive(g);
  const name = `${scout.first} ${scout.last}`.trim();
  const short = cm && scout.first ? `${scout.first.charAt(0)}.${scout.last}` : name;
  const a = scout.assignment;
  const targetName = (x: ScoutAssignment): string => x.kind === 'nation' ? natName(g.nations[x.target as number]?.name)
    : x.kind === 'league' ? compName(g.leagues[x.target as string]?.name) ?? String(x.target)
    : x.kind === 'club' ? g.clubs[x.target as number]?.name ?? '' : x.kind === 'region' ? t(`region.${x.target}`)
    : x.kind === 'nextOpp' ? t('cl.sc.nextOpp') : x.kind === 'youth' ? t('cl.sc.youth') : `${g.players[x.target as number]?.first ?? ''} ${g.players[x.target as number]?.last ?? ''}`.trim();
  const players = !a ? (cm ? (scout.scoutList ?? []).map((id) => g.players[id]).filter(Boolean) : []) : a.kind === 'player' ? [g.players[a.target as number]].filter(Boolean) : (a.found ?? []).map((id) => g.players[id]).filter(Boolean);
  // "Assign scout Mick Brown to Argentina ?" (Please Confirm) – derefter går han i gang
  const assign = async (x: Omit<ScoutAssignment, 'since' | 'found'>) => {
    // 0x4830ce: "Send scout to watch all Bradford matches ?" (Assign Scout ? / Please Confirm)
    const q = cm && x.kind === 'club' ? t('cm.sc.clubQ', { club: g.clubs[x.target as number]?.short || g.clubs[x.target as number]?.name || '' }) : t('cl.sc.assignQ', { scout: name, target: targetName(x as ScoutAssignment) });
    if (!(await askConfirm(q, { title: cm ? t('cm.sc.assignTitle') : t('cl.sc.assignTitle'), colored: true }))) return;
    act({ t: 'scout', staffId: scout.id, assignment: { ...x, since: g.date, found: [] } });
  };
  const clubs = Object.values(g.clubs).filter((c) => !g.leagues[c.league]?.hidden && c.id !== g.userClub);
  const nationIds = [...new Set(clubs.map((c) => c.nation))].filter((x) => g.nations[x]).sort((x, y) => natName(g.nations[x].name).localeCompare(natName(g.nations[y].name), t('cl.locale')));
  const byRegion = (list: number[], item: (nat: number) => DropItem): DropItem[] =>
    REGIONS.map((r) => ({ r, xs: list.filter((x) => regionOfNation(g.nations[x]?.name) === r) })).filter((x) => x.xs.length)
      .map(({ r, xs }) => ({ key: r, label: t(`cl.region.${r}`), sub: xs.map(item) }));
  const lg = g.clubs[g.userClub]?.league;
  const assignItems: DropItem[] = [
    ...(!cm && lg && g.leagues[lg] ? [{ key: 'comp', label: compName(g.leagues[lg].name) ?? '', onClick: () => assign({ kind: 'league', target: lg }) } as DropItem, { key: 's1', sep: true } as DropItem] : []),
    cm ? { key: 'club', label: t('cl.sc.club'), onClick: () => onPick?.(() => (cid: number) => { void assign({ kind: 'club', target: cid }); }) }
      : { key: 'club', label: t('cl.sc.club'), sub: byRegion(nationIds, (nat) => ({ key: `n${nat}`, label: natName(g.nations[nat].name),
        sub: clubs.filter((c) => c.nation === nat).sort((x, y) => y.rep - x.rep).slice(0, 40).map((c) => ({ key: `c${c.id}`, label: c.name, onClick: () => assign({ kind: 'club', target: c.id }) })) })) },
    { key: 'opp', label: t('cl.sc.nextOpp'), onClick: () => assign({ kind: 'nextOpp', target: 0 }) },
    { key: 'youth', label: t('cl.sc.youth'), onClick: () => assign({ kind: 'youth', target: 0 }) },
    { key: 's2', sep: true },
    { key: 'nation', label: t('cl.sc.nation'), sub: byRegion(nationIds, (nat) => ({ key: `n${nat}`, label: natName(g.nations[nat].name), onClick: () => assign({ kind: 'nation', target: nat }) })) },
    { key: 's3', sep: true },
    { key: 'region', label: t('cl.sc.region'), sub: (['europe', 'northAmerica', 'southAmerica', 'asia', 'africa'] as const).map((r) => ({ key: r, label: t(`region.${r}`), onClick: () => assign({ kind: 'region', target: r }) })) },
  ];
  const cfg: ScoutCfg = { a: a ? { kind: a.kind, target: a.target, focus: a.focus, role: a.role, attr: a.attr, attrMin: a.attrMin, maxValue: a.maxValue } : null };
  const menu = useSearchMenu<ScoutCfg>({ kind: 'scout', f: cfg, defaults: { a: null }, presets: [], named, setNamed, active: a ? 1 : 0,
    apply: (v) => act({ t: 'scout', staffId: scout.id, assignment: v.a ? { ...v.a, since: g.date, found: [] } : null }) });
  const items: DropItem[] = [cm && a ? { key: 'recall', label: t('cm.sc.recall'), onClick: () => act({ t: 'scout', staffId: scout.id, assignment: null }) }
    : { key: 'assign', label: t('cl.sc.assign'), sub: assignItems }, ...menu];
  return (
    <div>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.tr.searchBtn')} items={items} />
        <ViewMenu view={view} setView={setView} />
        <span className="grow" />
        <button className="cx-greybtn" disabled>{t('cl.tr.filters')}</button>
        <button className="cx-greybtn" disabled>{t('cl.tr.delete')}</button>
      </div>
      <ClassicPlayerTable players={players} title={t('cl.tr.scoutN', { n })} view={view} rec={cm}
        desc={a ? t('cl.sc.assigned', { scout: short, target: targetName(a) }) : t('cl.sc.notAssigned', { scout: name })} />
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
export function ClassicPlayerTable({ players, title, desc, view: viewProp, initialSort = 'val', viewMenu, total, rec }: {
  players: Player[]; title: string; desc?: string; view?: string; initialSort?: string;
  /** Scout #n (CM 01/02, original DB i ægte tilstand): kolonnen Rec med spejderens stjerner */
  rec?: boolean;
  /** alle spillere før filtrene – giver "(N filtered out)" under listen */
  total?: number;
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
  // Inf som i originalens søgning: skadet/suspenderet (røde) og "Wnt" (en anden klub har ham på sin ønskeliste)
  const inf = (p: Player): [string, string, boolean] | null => {
    if (p.injury) return ['Inj', t(`injury.${p.injury.key}`), true];
    if (p.banned > 0) return ['Sus', t('tag.ban'), true];
    if (interestedClubs(p).length) return ['Wnt', t('cl.sq.wanted'), false];
    return null;
  };
  const based = (p: Player) => basedName(g, p.club, p.nation);
  const realismOn = showRealism();
  const base: CxCol<Player>[] = [
    // mærket kan klikkes og åbner spillerens side om det (Inj/Sus → Injuries & Bans, Wnt → Transfer) som i originalen
    { key: 'inf', label: t('cl.tn.inf'), render: (p) => { const x = inf(p); return x ? <button className={`cx-inf ${x[2] ? 'bad' : ''} ${x[0] === 'Inj' && (p.injury?.days ?? 0) > 7 ? 'full' : ''}`} title={x[1]} onClick={() => nav({ name: 'player', id: p.id, tab: x[0] === 'Wnt' ? 'transfer' : 'injuries' })}>{t(`cl.tag.${x[0]}`)}</button> : null; }, sort: (p) => inf(p)?.[0] ?? '~' },
    { key: 'name', label: t('col.name'), cls: 'c-name', render: (p) => <span className="link" onClick={() => nav({ name: 'player', id: p.id })}>{p.last}{p.first ? `, ${p.first}` : ''}</span>, sort: (p) => `${p.last} ${p.first}` },
  ];
  // Rec (0x80d164): spejderens anbefaling som stjerner – den største af evne-/potentialevurderingen (cmScoutRec, 0x7b62a0)
  const recScout = rec ? cmRecScout(g) : null;
  const recMemo = new Map<number, number>();
  const recOf = (p: Player) => { let v = recMemo.get(p.id); if (v === undefined) { v = cmScoutRec(g, p, recScout); recMemo.set(p.id, v); } return v; };
  if (rec) base.unshift({ key: 'rec', label: t('cm.sc.rec'), render: (p) => { const n = recOf(p); return <span className="cx-rec">{n ? '*'.repeat(n) : ''}</span>; }, sort: (p) => recOf(p) });
  const club: CxCol<Player> = { key: 'club', label: t('col.club'), cls: 'c-club', render: (p) => (p.club ? <span className="link" onClick={() => nav({ name: 'club', id: p.club })}>{g.clubs[p.club]?.name}</span> : t('cl.tr.noClub')), sort: (p) => g.clubs[p.club]?.name ?? '' };
  const pos: CxCol<Player> = { key: 'pos', label: t('cl.tr.position'), cls: 'c-pos', render: (p) => posStr(p), sort: (p) => -p.pos.indexOf(Math.max(...p.pos)) };
  const val: CxCol<Player> = { key: 'val', label: t('col.value'), cls: 'c-val', render: (p) => (p.club ? money(p.value) : t('cl.tr.free')), sort: (p) => p.value };
  const age: CxCol<Player> = { key: 'age', label: t('col.age'), cls: 'c-num c-yel', render: (p) => ageOn(p.dob, g.date), sort: (p) => -ageOn(p.dob, g.date) };
  const real: CxCol<Player>[] = g.userClub && realismOn ? [{ key: 'real', label: t('real.col'), cls: 'c-yel', title: t('real.hint'), render: (p) => t(`real.level${transferRealism(p).level}`), sort: (p) => { const r = transferRealism(p); return -r.level * 100 + r.score; } }] : [];
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
    : [...base, club, { key: 'based', label: t('cl.tr.based'), cls: 'c-yel', render: (p) => <span className="link" onClick={() => nav(basedRoute(g, p.club, p.nation))}>{based(p)}</span>, sort: based }, pos, val, ...real];
  return (
    <>
      {viewMenu && <div className="cx-tools cx-tools-inline"><ViewMenu view={view} setView={setOwnView} /></div>}
      <Pager desc={desc ?? ''} pg={pg} pages={pages} setPg={setPg} />
      <div className="cx-subtitle small">{title}</div>
      <CxTable rows={players} cols={cols} rowKey={(p) => p.id} initialSort={rec ? 'rec' : initialSort} page={{ size: PAGE, index: Math.min(pg, pages - 1) }}
        onPage={(n) => { if (n !== pages) queueMicrotask(() => setPages(n)); }}
        btn={(p) => {
          const on = g.shortlist.includes(p.id);
          return <button className={`cx-rowbtn ${on ? 'on' : ''}`} title={on ? t('player.unshortlist') : t('player.shortlist')} onClick={() => act({ t: 'shortlist', pid: p.id, on: !on })}>{on ? '★' : ''}</button>;
        }} />
      <div className="cx-found">{players.length === 0 && total === undefined ? t('cl.tr.noneFound') : t(players.length === 1 ? 'cl.tr.found1' : 'cl.tr.found', { n: players.length.toLocaleString(t('cl.locale')) })}{total !== undefined && players.length < total ? ` ${t('cl.tr.filteredOut', { n: (total - players.length).toLocaleString(t('cl.locale')) })}` : ''}</div>
    </>
  );
}
