// Truppen i klassisk tema: opbygget som i de klassiske manager-spil fra omkring 2001.
// Værktøjslinje (View · Sort By · Clear Squad · Filter), en strimmel med formationens pladser og bænken
// (GK DL … FC SB1 … SB5) og spillerne i to kolonner. Knappen foran hver spiller viser hans plads (grøn = på
// holdet, gulgrøn = bænken). Træk knappen hen på en plads i strimlen eller på en anden spiller for at bytte –
// eller klik på den og vælg pladsen i menuen (virker også på mobil).
import { useState, type DragEvent, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { squad } from '../../game/state';
import { autoSelect, available, newTactic } from '../../game/tactics';
import { benchSize } from '../../game/rules';
import { interestedClubs } from '../../game/transfers';
import { avgRating } from '../../game/season';
import type { GameState, Player, Slot, Tactic } from '../../game/types';
import { POSITIONS } from '../../game/types';
import { dateFmt, money, natName, t } from '../../i18n';
import { CxDrop, type DropItem } from '../classic';
import { Rating, age, posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { Cliques, SquadTable } from './Squad';

type Place = { kind: 'xi' | 'bench'; i: number } | null;

/** "DL", "MC", "AMR", "FC" som i originalen */
export function slotLabel(s: Slot): string {
  if (s.pos === 'GK' || s.pos === 'SW') return s.pos;
  return `${s.pos === 'ST' ? 'F' : s.pos}${s.side}`;
}

function placeOf(tac: Tactic, pid: number): Place {
  const x = tac.lineup.indexOf(pid);
  if (x >= 0) return { kind: 'xi', i: x };
  const b = tac.bench.indexOf(pid);
  return b >= 0 ? { kind: 'bench', i: b } : null;
}

/** Flyt en spiller til en plads; den der stod der, får spillerens gamle plads (eller ryger ud) */
function moveTo(tac: Tactic, pid: number, target: Place): Tactic | null {
  const lineup = tac.lineup.slice();
  const bench = tac.bench.slice();
  const from = placeOf(tac, pid);
  if (from && target && from.kind === target.kind && from.i === target.i) return null;
  const occ = !target ? 0 : target.kind === 'xi' ? lineup[target.i] : bench[target.i] ?? 0;
  if (target?.kind === 'bench' && !occ && from?.kind !== 'bench' && bench.length >= benchSize()) return null;
  if (from?.kind === 'xi') lineup[from.i] = 0;
  if (from?.kind === 'bench') bench[from.i] = 0;
  if (target?.kind === 'xi') lineup[target.i] = pid;
  if (target?.kind === 'bench') { if (target.i < bench.length) bench[target.i] = pid; else bench.push(pid); }
  if (occ && occ !== pid) {
    if (from?.kind === 'xi') lineup[from.i] = occ;
    else if (from?.kind === 'bench') bench[from.i] = occ;
  }
  return { ...tac, lineup, bench: bench.filter(Boolean) };
}

// ---------- visning (View), sortering og filter ----------

const moraleKey = (m: number) => `morale.${m >= 16 ? 'superb' : m >= 13 ? 'good' : m >= 9 ? 'okay' : 'poor'}`;
const formAvg = (p: Player) => (p.form.length ? p.form.slice(-5).reduce((s, x) => s + x, 0) / Math.min(5, p.form.length) : 0);
/** Primær position som tal (GK først … angribere sidst), side som decimal: R, L, C */
const posOrder = (p: Player) => {
  const order = ['GK', 'SW', 'D', 'WB', 'DM', 'M', 'AM', 'ST'];
  const best = Math.max(...p.pos);
  const prim = Math.min(...POSITIONS.map((k, i) => (p.pos[i] >= Math.min(15, best) ? order.indexOf(k) : 99)));
  const side = p.side[2] >= 15 ? 0 : p.side[0] >= 15 ? 1 : 2;
  return prim * 10 + side;
};

type Info = { key: string; label: string; show: (p: Player) => ReactNode };
function infos(g: GameState): Info[] {
  return [
    { key: 'pos', label: t('cl.sq.positions'), show: (p) => posStr(p) },
    { key: 'cond', label: t('cl.pl.condition'), show: (p) => `${Math.round(p.condition)}%` },
    { key: 'morale', label: t('col.morale'), show: (p) => t(moraleKey(p.morale)) },
    { key: 'form', label: t('col.form'), show: (p) => (p.form.length ? formAvg(p).toFixed(1) : '-') },
    { key: 'nat', label: t('cl.sq.nationality'), show: (p) => natName(g.nations[p.nation]?.name) ?? '' },
    { key: 'age', label: t('col.age'), show: (p) => age(p) },
    { key: 'caps', label: t('cl.sq.caps'), show: (p) => `${p.caps} / ${p.intGoals}` },
    { key: 'wage', label: t('cl.sq.wage'), show: (p) => money(p.contract?.wage ?? 0) },
    { key: 'exp', label: t('cl.sq.expiry'), show: (p) => (p.contract ? dateFmt(p.contract.expires) : '-') },
    { key: 'value', label: t('col.value'), show: (p) => money(p.value) },
    { key: 'apps', label: t('cl.sq.apps'), show: (p) => `${p.stats.apps}${p.stats.subs ? ` (${p.stats.subs})` : ''}` },
    { key: 'goals', label: t('cl.sq.goals'), show: (p) => p.stats.goals },
    { key: 'assists', label: t('cl.sq.assists'), show: (p) => p.stats.assists },
    { key: 'avr', label: t('cl.sq.avr'), show: (p) => (p.stats.ratingCount ? <Rating r={avgRating(p)} digits={2} /> : '-') },
  ];
}

/** Sorteringer som i originalens Sort By (de nederste er sæsonstatistik) */
type Sort = { key: string; label: string; cmp: (a: Player, b: Player) => number } | { key: string; sep: true };
function sorts(g: GameState, tac: Tactic): Sort[] {
  const name = (a: Player, b: Player) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first);
  const desc = (f: (p: Player) => number) => (a: Player, b: Player) => f(b) - f(a) || name(a, b);
  const asc = (f: (p: Player) => number) => (a: Player, b: Player) => f(a) - f(b) || name(a, b);
  const sel = (p: Player) => { const pl = placeOf(tac, p.id); return !pl ? 100 + posOrder(p) / 100 : pl.kind === 'xi' ? pl.i : 20 + pl.i; };
  return [
    { key: 'name', label: t('col.name'), cmp: name },
    { key: 'pos', label: t('cl.sq.positions'), cmp: asc(posOrder) },
    { key: 'sel', label: t('cl.sq.selection'), cmp: asc(sel) },
    { key: 'form', label: t('col.form'), cmp: desc(formAvg) },
    { key: 'morale', label: t('col.morale'), cmp: desc((p) => p.morale) },
    { key: 'cond', label: t('cl.pl.condition'), cmp: desc((p) => p.condition) },
    { key: 'nat', label: t('cl.sq.nationality'), cmp: (a, b) => (natName(g.nations[a.nation]?.name) ?? '').localeCompare(natName(g.nations[b.nation]?.name) ?? '') || name(a, b) },
    { key: 'age', label: t('col.age'), cmp: asc((p) => -Date.parse(p.dob)) },
    { key: 'caps', label: t('cl.sq.intCaps'), cmp: desc((p) => p.caps) },
    { key: 'intGoals', label: t('cl.sq.intGoals'), cmp: desc((p) => p.intGoals) },
    { key: 'wage', label: t('cl.sq.wage'), cmp: desc((p) => p.contract?.wage ?? 0) },
    { key: 'exp', label: t('cl.sq.expiry'), cmp: (a, b) => (a.contract?.expires ?? '9').localeCompare(b.contract?.expires ?? '9') || name(a, b) },
    { key: 'value', label: t('col.value'), cmp: desc((p) => p.value) },
    { key: 's1', sep: true },
    { key: 'goals', label: t('cl.sq.goals'), cmp: desc((p) => p.stats.goals) },
    { key: 'assists', label: t('cl.sq.assists'), cmp: desc((p) => p.stats.assists) },
    { key: 'apps', label: t('cl.sq.apps'), cmp: desc((p) => p.stats.apps + p.stats.subs) },
    { key: 'avr', label: t('cl.sq.avr'), cmp: desc((p) => (p.stats.ratingCount ? avgRating(p) : 0)) },
  ];
}

const FILTERS: [string, (p: Player, tac: Tactic) => boolean][] = [
  ['all', () => true],
  ['avail', (p) => available(p)],
  ['selected', (p, tac) => !!placeOf(tac, p.id)],
  ['notSelected', (p, tac) => !placeOf(tac, p.id)],
  ['unavail', (p) => !available(p)],
  ['listed', (p) => p.listed],
];

/** Kort mærke foran navnet (Inj, Sus, Lst, Lon, Fut, Unh, Wnt, Fgn) – det vigtigste vinder */
function tagOf(p: Player, g: GameState, clubId = g.userClub): { k: string; title: string } | null {
  if (p.injury) return { k: 'Inj', title: `${t(`injury.${p.injury.key}`)} (${p.injury.days} ${t('common.days')})` };
  if (p.banned > 0) return { k: 'Sus', title: `${t('tag.ban')} ${p.banned}` };
  if (p.contract?.futureClub) return { k: 'Fut', title: t('tag.leaving') };
  if (p.listed) return { k: 'Lst', title: t('tag.listed') };
  if (p.loan) return { k: 'Lon', title: t('tag.loan') };
  if ((p.unhappy ?? 0) > 60 || p.wantsAway) return { k: 'Unh', title: t('tag.unhappy') };
  if (clubId === g.userClub && interestedClubs(p).length) return { k: 'Wnt', title: t('cl.sq.wanted') };
  if (p.nation !== g.clubs[clubId]?.nation) return { k: 'Fgn', title: natName(g.nations[p.nation]?.name) ?? '' };
  return null;
}

/** Truppens tre bedste spillere (efter evne) – markeres med * efter navnet som i CM 01/02 */
function starIds(players: Player[]): Set<number> {
  return new Set([...players].sort((a, b) => b.ca - a.ca).slice(0, 3).map((p) => p.id));
}
const shortName = (p: Player | undefined, star = false) => (p ? `${p.last}${p.first ? `, ${p.first[0]}` : ''}${star ? '*' : ''}` : '');

/** En anden klubs trup i klassisk stil: to kolonner med View og Sort By – uden udtagelse */
export function ClassicClubSquad({ cid }: { cid: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [view, setView] = useRouteState('csqview', 'pos');
  const [sortKey, setSort] = useRouteState('csort', 'pos');
  const players = squad(cid);
  const stars = starIds(players);
  const INFO = infos(g);
  const SORTS = sorts(g, newTactic('4-4-2')).filter((x) => x.key !== 'sel');
  const info = INFO.find((x) => x.key === view) ?? INFO[0];
  const sort = SORTS.find((x): x is Extract<Sort, { cmp: unknown }> => 'cmp' in x && x.key === sortKey) ?? (SORTS[1] as Extract<Sort, { cmp: unknown }>);
  const list = players.slice().sort(sort.cmp);
  const half = Math.ceil(list.length / 2);
  const row = (p: Player) => {
    const tag = tagOf(p, g, cid);
    return (
      <div key={p.id} className="cx-sq-row">
        <span className="cx-selbtn cx-selbtn-static" />
        <span className={`cx-sq-tag ${tag ? tag.k.toLowerCase() : ''}`} title={tag?.title}>{tag?.k ?? ''}</span>
        <button className={`cx-sq-name ${!available(p) ? 'unavail' : ''} ${p.loan ? 'loan' : ''}`} title={stars.has(p.id) ? t('tag.star') : undefined}
          onClick={() => nav({ name: 'player', id: p.id })}>{shortName(p, stars.has(p.id))}</button>
        <span className="cx-sq-info">{info.show(p)}</span>
      </div>
    );
  };
  return (
    <div className="cx-sq">
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.sq.view')} items={INFO.map((x) => ({ key: x.key, label: x.label, checked: x.key === info.key, onClick: () => setView(x.key) }))} />
        <CxDrop label={t('cl.sq.sortBy')} items={SORTS.map((x) => 'sep' in x ? x : { key: x.key, label: x.label, checked: x.key === sort.key, onClick: () => setSort(x.key) })} />
      </div>
      <div className="cx-sq-head"><span>{info.label}</span></div>
      <div className="cx-sq-cols">
        <div className="cx-sq-col">{list.slice(0, half).map(row)}</div>
        <div className="cx-sq-col">{list.slice(half).map(row)}</div>
      </div>
    </div>
  );
}

// ---------- skærmen ----------

export function ClassicSquad() {
  const g = useGame()!;
  const { nav } = useNav();
  if (!g.tactic) g.tactic = autoSelect(newTactic('4-4-2'), squad(g.userClub));
  const tac = g.tactic;
  const [view, setView] = useRouteState('cview', 'pos');
  const [sortKey, setSort] = useRouteState('csort', 'pos');
  const [filter, setFilter] = useRouteState('cfilter', 'all');
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const players = squad(g.userClub);
  const byId = new Map(players.map((p) => [p.id, p]));
  const save = (next: Tactic | null) => { if (next) act({ t: 'tactic', tactic: next }); };

  const INFO = infos(g);
  const SORTS = sorts(g, tac);
  const table = view.startsWith('tbl:');
  const info = INFO.find((x) => x.key === view) ?? INFO[0];
  const sort = SORTS.find((x): x is Extract<Sort, { cmp: unknown }> => 'cmp' in x && x.key === sortKey) ?? (SORTS[1] as Extract<Sort, { cmp: unknown }>);
  const fil = FILTERS.find(([k]) => k === filter) ?? FILTERS[0];
  const list = players.filter((p) => fil[1](p, tac)).sort(sort.cmp);
  const half = Math.ceil(list.length / 2);

  // pladserne: de 11 i formationen + bænken
  const nb = benchSize();
  const targets: { id: string; label: string; place: NonNullable<Place>; pid: number }[] = [
    ...tac.slots.map((s, i) => ({ id: `x${i}`, label: slotLabel(s), place: { kind: 'xi' as const, i }, pid: tac.lineup[i] })),
    ...Array.from({ length: nb }, (_, i) => ({ id: `b${i}`, label: `SB${i + 1}`, place: { kind: 'bench' as const, i }, pid: tac.bench[i] ?? 0 })),
  ];
  const labelOf = (pid: number) => { const pl = placeOf(tac, pid); return !pl ? '' : pl.kind === 'xi' ? slotLabel(tac.slots[pl.i]) : `SB${pl.i + 1}`; };
  const short = (p: Player | undefined) => shortName(p);
  const stars = starIds(players);

  // træk og slip
  // DOM'en må ikke ændres i selve dragstart (så afbryder Chrome trækket) – derfor sættes tilstanden lidt efter
  const dragStart = (pid: number) => (e: DragEvent) => { e.dataTransfer.setData('text/x-cm-pid', String(pid)); e.dataTransfer.setData('text/plain', String(pid)); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => setDrag(pid), 0); };
  const dragEnd = () => { setDrag(null); setOver(null); };
  const dropOn = (id: string, place: Place | 'swapWith', withPid?: number) => ({
    onDragOver: (e: DragEvent) => { if (!e.dataTransfer.types.includes('text/x-cm-pid')) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (over !== id) setOver(id); },
    onDragLeave: () => setOver((o) => (o === id ? null : o)),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      const pid = Number(e.dataTransfer.getData('text/x-cm-pid')) || drag;
      dragEnd();
      if (!pid) return;
      if (place === 'swapWith') {
        if (!withPid || withPid === pid) return;
        const target = placeOf(tac, withPid);
        if (target) save(moveTo(tac, pid, target));
        else { const mine = placeOf(tac, pid); if (mine) save(moveTo(tac, withPid, mine)); }
      } else save(moveTo(tac, pid, place));
    },
  });

  const menuFor = (p: Player): DropItem[] => {
    const cur = placeOf(tac, p.id);
    const same = (pl: Place) => !!cur && !!pl && cur.kind === pl.kind && cur.i === pl.i;
    return [
      { key: 'hx', head: t('cl.sq.firstXI') },
      ...targets.filter((x) => x.place.kind === 'xi').map((x) => ({ key: x.id, checked: same(x.place), label: <><b className="cx-sel-slot">{x.label}</b>{x.pid && x.pid !== p.id ? <span className="cx-sel-who">{short(byId.get(x.pid))}</span> : null}</>, onClick: () => save(moveTo(tac, p.id, x.place)) })),
      { key: 'hb', head: t('cl.sq.subs') },
      ...targets.filter((x) => x.place.kind === 'bench').map((x) => ({
        key: x.id, checked: same(x.place),
        disabled: !x.pid && cur?.kind !== 'bench' && tac.bench.length >= nb,
        label: <><b className="cx-sel-slot">{x.label}</b>{x.pid && x.pid !== p.id ? <span className="cx-sel-who">{short(byId.get(x.pid))}</span> : null}</>,
        onClick: () => save(moveTo(tac, p.id, x.place.i < tac.bench.length ? x.place : { kind: 'bench', i: tac.bench.length })),
      })),
      { key: 'sep', sep: true },
      { key: 'none', label: t('cl.sq.notSelected'), checked: !cur, onClick: () => save(moveTo(tac, p.id, null)) },
    ];
  };

  const row = (p: Player) => {
    const lbl = labelOf(p.id);
    const pl = placeOf(tac, p.id);
    const tag = tagOf(p, g);
    return (
      <div key={p.id} className={`cx-sq-row ${drag === p.id ? 'dragging' : ''} ${over === `p${p.id}` ? 'over' : ''}`} {...dropOn(`p${p.id}`, 'swapWith', p.id)}>
        <CxDrop className="cx-sel" caret={false} label={lbl || ' '} items={menuFor(p)}
          btn={{ className: `cx-selbtn ${pl?.kind ?? ''}`, draggable: true, onDragStart: dragStart(p.id), onDragEnd: dragEnd, title: t('cl.sq.selHint') }} />
        <span className={`cx-sq-tag ${tag ? tag.k.toLowerCase() : ''}`} title={tag?.title}>{tag?.k ?? ''}</span>
        <button className={`cx-sq-name ${!available(p) ? 'unavail' : ''} ${p.loan ? 'loan' : ''}`} draggable onDragStart={dragStart(p.id)} onDragEnd={dragEnd}
          title={stars.has(p.id) ? t('tag.star') : undefined} onClick={() => nav({ name: 'player', id: p.id })}>{shortName(p, stars.has(p.id))}</button>
        <span className="cx-sq-info">{info.show(p)}</span>
      </div>
    );
  };

  const xiCount = tac.lineup.filter(Boolean).length;
  const viewItems: DropItem[] = [
    ...INFO.map((x) => ({ key: x.key, label: x.label, checked: !table && x.key === info.key, onClick: () => setView(x.key) })),
    { key: 'sep', sep: true },
    { key: 'h', head: t('cl.sq.fullTable') },
    ...([['tbl:general', 'squad.general'], ['tbl:attrs', 'squad.attrs'], ['tbl:contracts', 'squad.contracts']] as const).map(([k, l]) => ({ key: k, label: t(l), checked: view === k, onClick: () => setView(k) })),
  ];

  return (
    <div className="cx-sq">
      <Head title={t('nav.squad')}>
        <CxDrop label={t('cl.sq.view')} items={viewItems} />
        {!table && <CxDrop label={t('cl.sq.sortBy')} items={SORTS.map((x) => 'sep' in x ? x : { key: x.key, label: x.label, checked: x.key === sort.key, onClick: () => setSort(x.key) })} />}
        <span className="grow" />
        <button className="cx-tool" onClick={() => save(autoSelect(tac, players))}>{t('cl.sq.assistant')}</button>
        <button className="cx-tool" onClick={() => save({ ...tac, lineup: tac.lineup.map(() => 0), bench: [] })}>{t('cl.sq.clear')}</button>
        <CxDrop label={t('cl.sq.filter')} align="right" items={FILTERS.map(([k]) => ({ key: k, label: t(`cl.sq.f.${k}`), checked: k === fil[0], onClick: () => setFilter(k) }))} />
        {!table && (
          <div className="cx-sq-top">
          <div className="cx-sq-head">
              <span>{info.label}</span>
              <small className={xiCount < 11 ? 'warn' : ''}>{t('cl.sq.count', { xi: xiCount, bench: tac.bench.length, nb })}</small>
            </div>
            <div className="cx-sq-slots">
              {targets.map((x) => {
                const p = x.pid ? byId.get(x.pid) : undefined;
                return (
                  <div key={x.id} className={`cx-slot ${x.place.kind} ${p ? 'filled' : ''} ${over === x.id ? 'over' : ''}`} title={p ? `${p.first} ${p.last}` : t('cl.sq.empty')}
                    draggable={!!p} onDragStart={p ? dragStart(p.id) : undefined} onDragEnd={dragEnd}
                    {...dropOn(x.id, x.place.kind === 'bench' && x.place.i >= tac.bench.length ? { kind: 'bench', i: tac.bench.length } : x.place)}>
                    {x.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Head>
      {table ? <SquadTable players={players} view={view.slice(4)} userClub={g.userClub} /> : (
        <>
          {fil[0] !== 'all' && <div className="cx-sq-filtered">{t('cl.sq.filtered', { filter: t(`cl.sq.f.${fil[0]}`), n: list.length, total: players.length })}</div>}
          <div className="cx-sq-cols">
            <div className="cx-sq-col">{list.slice(0, half).map(row)}</div>
            <div className="cx-sq-col">{list.slice(half).map(row)}</div>
          </div>
          {!g.draft && <Cliques />}
          <div className="cx-sq-drop-out" {...dropOn('out', null)} hidden={drag === null || !placeOf(tac, drag)}>
            {t('cl.sq.dropOut')}
          </div>
        </>
      )}
    </div>
  );
}
