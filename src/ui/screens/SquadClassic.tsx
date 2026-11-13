// Truppen i klassisk tema: opbygget som i de klassiske manager-spil fra omkring 2001.
// Værktøjslinje (View · Sort By · Clear Squad · Filter), en strimmel med formationens pladser og bænken
// (GK DL … FC SB1 … SB5) og spillerne i to kolonner. Knappen foran hver spiller viser hans plads (grøn = på
// holdet, gulgrøn = bænken). Træk knappen hen på en plads i strimlen eller på en anden spiller for at bytte –
// eller klik på den og vælg pladsen i menuen (virker også på mobil).
import { isInternational } from '../../game/international';
import { useState, type DragEvent, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { squad } from '../../game/state';
import { autoSelect, available, newTactic } from '../../game/tactics';
import { authentic, benchSize } from '../../game/rules';
import { A, type AttrKey } from '../../game/attributes';
import { interestedClubs } from '../../game/transfers';
import { avgRating } from '../../game/season';
import type { GameState, Player, Slot, Tactic } from '../../game/types';
import { POSITIONS, SIDES } from '../../game/types';
import { dateFmt, money, natName, t } from '../../i18n';
import { CxDrop, type DropItem } from '../classic';
import { Rating, age, posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { Cliques, SquadTable } from './Squad';
import { ClassicSquadNumbers } from './SquadNumbers';
import { PenaltyTakers } from './TacticsClassic';

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
    { key: 'num', label: t('cl.sq.number'), show: (p) => p.number ?? '–' },
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

/** Brugerønske (#8): sorteres der efter noget, kolonnen kan vise, viser kolonnen det (kondition, værdi, moral, alder …) */
const viewForSort = (key: string, INFO: Info[]) => (key === 'intGoals' ? 'caps' : INFO.some((x) => x.key === key) ? key : null);

/** Sorteringer som i originalens Sort By (de nederste er sæsonstatistik) */
type Sort = { key: string; label: string; cmp: (a: Player, b: Player) => number } | { key: string; sep: true };
function sorts(g: GameState, tac: Tactic, orig = false): Sort[] {
  const name = (a: Player, b: Player) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first);
  const desc = (f: (p: Player) => number) => (a: Player, b: Player) => f(b) - f(a) || name(a, b);
  const asc = (f: (p: Player) => number) => (a: Player, b: Player) => f(a) - f(b) || name(a, b);
  const sel = (p: Player) => { const pl = placeOf(tac, p.id); return !pl ? 100 + posOrder(p) / 100 : pl.kind === 'xi' ? pl.i : 20 + pl.i; };
  return [
    { key: 'name', label: t('col.name'), cmp: name },
    { key: 'pos', label: t('cl.sq.positions'), cmp: asc(posOrder) },
    // originalens Sort By har ingen "Selection"
    ...(orig ? [] : [{ key: 'sel', label: t('cl.sq.selection'), cmp: asc(sel) }]),
    { key: 'num', label: t('cl.sq.number'), cmp: asc((p) => p.number ?? 100) },
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
    ...(orig ? [] : [{ key: 's1', sep: true as const }]),
    { key: 'goals', label: t('cl.sq.goals'), cmp: desc((p) => p.stats.goals) },
    { key: 'assists', label: t('cl.sq.assists'), cmp: desc((p) => p.stats.assists) },
    ...(orig ? [] : [{ key: 'apps', label: t('cl.sq.apps'), cmp: desc((p) => p.stats.apps + p.stats.subs) }]),
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
  if (p.reserves) return { k: 'Res', title: t('cl.pl.inReserves') };
  // CM 01/02 "Yel": ét gult kort fra karantæne
  if (p.yellowCount === 4) return { k: 'Yel', title: t('cl.tag.yelTitle') };
  if (isInternational(p)) return { k: 'Int', title: t('cl.tag.intTitle', { nation: natName(g.nations[p.nation]?.name) ?? '' }) };
  if (p.contract?.futureClub) return { k: 'Fut', title: t('tag.leaving') };
  if (p.listed) return { k: 'Lst', title: t('tag.listed') };
  if (p.loan) return { k: 'Lon', title: t('tag.loan') };
  if ((p.unhappy ?? 0) > 60 || p.wantsAway) return { k: 'Unh', title: t('tag.unhappy') };
  if (clubId === g.userClub && interestedClubs(p).length) return { k: 'Wnt', title: t('cl.sq.wanted') };
  if (p.nation !== g.clubs[clubId]?.nation) return { k: 'Fgn', title: natName(g.nations[p.nation]?.name) ?? '' };
  return null;
}

/** Ægte CM 01/02: kun originalens statusmærker (Inj, Sus, Yel, Fut, Lst, Loa, Unh) – ingen "Int", "Fgn" eller "Wnt" (ejerens skærmbilleder) */
function originalTag(p: Player): { k: string; title: string } | null {
  if (p.injury) return { k: 'Inj', title: `${t(`injury.${p.injury.key}`)} (${p.injury.days} ${t('common.days')})` };
  if (p.banned > 0) return { k: 'Sus', title: `${t('tag.ban')} ${p.banned}` };
  if (p.yellowCount === 4) return { k: 'Yel', title: t('cl.tag.yelTitle') };
  if (p.contract?.futureClub) return { k: 'Fut', title: t('tag.leaving') };
  if (p.listed) return { k: 'Lst', title: t('tag.listed') };
  if (p.loan) return { k: 'Lon', title: t('tag.loan') };
  if ((p.unhappy ?? 0) > 60 || p.wantsAway) return { k: 'Unh', title: t('tag.unhappy') };
  return null;
}

/** Landsholdstruppen: kun skader og karantæner (ingen "Fgn") */
function nationalTag(p: Player): { k: string; title: string } | null {
  if (p.injury) return { k: 'Inj', title: `${t(`injury.${p.injury.key}`)} (${p.injury.days} ${t('common.days')})` };
  if (p.banned > 0) return { k: 'Sus', title: `${t('tag.ban')} ${p.banned}` };
  return null;
}

/** Hvilken fane på spillerprofilen der forklarer mærket */
const TAG_TAB: Record<string, string> = { Inj: 'injuries', Sus: 'injuries', Yel: 'injuries', Fut: 'transfer', Lst: 'transfer', Lon: 'contract', Unh: 'transfer', Wnt: 'transfer', Fgn: 'profile' };

/** Mærket foran navnet – et klik åbner den del af spillerprofilen, der handler om det */
function Tag({ p, tag }: { p: Player; tag: { k: string; title: string } | null }) {
  const { nav } = useNav();
  if (!tag) return <span className="cx-sq-tag" />;
  return <button className={`cx-sq-tag ${tag.k.toLowerCase()}`} title={tag.title} onClick={() => nav({ name: 'player', id: p.id, tab: TAG_TAB[tag.k] })}>{t(`cl.tag.${tag.k}`)}</button>;
}

/** Truppens tre bedste spillere (efter evne) – markeres med * efter navnet som i CM 01/02 */
function starIds(players: Player[]): Set<number> {
  return new Set([...players].sort((a, b) => b.ca - a.ca).slice(0, 3).map((p) => p.id));
}
const shortName = (p: Player | undefined, star = false) => (p ? `${p.last}${p.first ? `, ${p.first[0]}` : ''}${star ? '*' : ''}` : '');

/** En anden klubs trup (eller et landshold: players) i klassisk stil: to kolonner med View og Sort By – uden udtagelse */
export function ClassicClubSquad({ cid, players: given }: { cid: number; players?: Player[] }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [view, setView] = useRouteState('csqview', 'pos');
  const [sortKey, setSort] = useRouteState('csort', 'pos');
  const players = given ?? squad(cid);
  const stars = starIds(players);
  const INFO = infos(g);
  const SORTS = sorts(g, newTactic('4-4-2')).filter((x) => x.key !== 'sel');
  const info = INFO.find((x) => x.key === view) ?? INFO[0];
  const sort = SORTS.find((x): x is Extract<Sort, { cmp: unknown }> => 'cmp' in x && x.key === sortKey) ?? (SORTS[1] as Extract<Sort, { cmp: unknown }>);
  const list = players.slice().sort(sort.cmp);
  const row = (p: Player) => {
    const tag = given ? nationalTag(p) : tagOf(p, g, cid);
    return (
      <div key={p.id} className="cx-sq-row">
        <span className="cx-selbtn cx-selbtn-static" />
        <Tag p={p} tag={tag} />
        {/* landshold: egne spillere i gult (som i CM 01/02) */}
        <button className={`cx-sq-name ${!available(p) ? 'unavail' : ''} ${p.loan ? 'loan' : ''} ${given && g.userClub && p.club === g.userClub ? 'mine' : ''}`} title={stars.has(p.id) ? t('tag.star') : undefined}
          onClick={() => nav({ name: 'player', id: p.id })}>{shortName(p, stars.has(p.id))}</button>
        <span className="cx-sq-info">{info.show(p)}</span>
      </div>
    );
  };
  return (
    <div className="cx-sq">
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.sq.view')} items={INFO.map((x) => ({ key: x.key, label: x.label, checked: x.key === info.key, onClick: () => setView(x.key) }))} />
        <CxDrop label={t('cl.sq.sortBy')} items={SORTS.map((x) => 'sep' in x ? x : { key: x.key, label: x.label, checked: x.key === sort.key, onClick: () => { setSort(x.key); const v = viewForSort(x.key, INFO); if (v) setView(v); } })} />
      </div>
      <div className="cx-sq-head"><span>{info.label}</span></div>
      <div className="cx-sq-cols">
        {/* skiftevis venstre/højre, så sorteringen læses række for række (ejerens ønske 2026-11-10) */}
        <div className="cx-sq-col">{list.filter((_, i) => i % 2 === 0).map(row)}</div>
        <div className="cx-sq-col">{list.filter((_, i) => i % 2 === 1).map(row)}</div>
      </div>
    </div>
  );
}

// ---------- skærmen ----------

export function ClassicSquad() {
  const { route } = useNav();
  // "{klub} Reserves" (CM 01/02): spillerne, der er rykket ned på reserveholdet
  if (route.tab === 'reserves') return authentic() ? <ClassicFirstSquad reserves /> : <ClassicReserves />;
  return <ClassicFirstSquad />;
}

function ClassicReserves() {
  const g = useGame()!;
  const res = squad(g.userClub).filter((p) => p.reserves);
  return (
    <div>
      <Head title={g.clubs[g.userClub]?.name ?? ''} />
      {res.length ? <ClassicClubSquad cid={g.userClub} players={res} /> : <div className="cx-empty">{t('cl.res.none')}</div>}
    </div>
  );
}

// ---------- View-menuen som i CM 01/02 ----------
// Originalens menu (strengene i cm0102.exe, club_screens.cpp): Traditional · Contract · Selection · Stats · More Stats · Attributes ▸ ·
// Other · — · Penalty Takers. Overskriften i bjælken: "Position(s)", "Contract Info", "Selection Info", "<scope> Stats", "<gruppe> Attributes",
// "Other Info". Kolonneoverskrifterne findes i exe'en (Squad Status, Basic Wage, Contract Expiry, Releases, Value, Position, Form, Morale,
// Cond., Nat., Age, Caps, Goals; spillerstatistikken Apps, Gls, Asts, MoM, Av R …) – hvilke kolonner hver visning har, er *estimeret*.

type Col = { key: string; label: string; title?: string; w: number; show: (p: Player) => ReactNode };
type SqView = { key: string; label: string; head: string; cols: Col[] };

/** Egenskabsgrupperne i Attributes ▸ (originalens fem; fordelingen af egenskaberne er *estimeret*) */
const ATTR_GROUPS: [string, AttrKey[]][] = [
  ['att', ['crossing', 'dribbling', 'finishing', 'heading', 'longShots', 'offTheBall', 'passing', 'technique', 'creativity', 'flair']],
  ['def', ['marking', 'tackling', 'positioning', 'anticipation', 'heading', 'bravery', 'strength', 'jumping']],
  ['gk', ['handling', 'oneOnOnes', 'reflexes', 'positioning', 'agility', 'jumping', 'anticipation', 'decisions']],
  ['men', ['aggression', 'anticipation', 'bravery', 'creativity', 'decisions', 'determination', 'flair', 'influence', 'teamwork', 'workRate']],
  ['phy', ['acceleration', 'agility', 'balance', 'jumping', 'naturalFitness', 'pace', 'stamina', 'strength']],
];
const ATTR_ABBR: Partial<Record<AttrKey, string>> = { crossing: 'Cro', dribbling: 'Dri', finishing: 'Fin', heading: 'Hea', longShots: 'Lon', offTheBall: 'OtB', passing: 'Pas',
  technique: 'Tec', creativity: 'Cre', flair: 'Fla', marking: 'Mar', tackling: 'Tck', positioning: 'Pos', anticipation: 'Ant', bravery: 'Bra', strength: 'Str', jumping: 'Jum',
  handling: 'Han', oneOnOnes: 'One', reflexes: 'Ref', agility: 'Agi', decisions: 'Dec', aggression: 'Agg', determination: 'Det', influence: 'Inf', teamwork: 'Tea',
  workRate: 'Wor', acceleration: 'Acc', balance: 'Bal', naturalFitness: 'NF', pace: 'Pac', stamina: 'Sta' };

function sqViews(g: GameState): SqView[] {
  const c = (key: string, w: number, show: Col['show'], title?: string): Col => ({ key, label: t(`cl.sq.c.${key}`), w, show, title });
  const dash = (n: number) => (n ? n : '-');
  return [
    { key: 'trad', label: t('cl.sq.v.trad'), head: t('cl.sq.positions'), cols: [c('position', 140, (p) => posStr(p))] },
    { key: 'contract', label: t('cl.sq.v.contract'), head: t('cl.sq.h.contract'), cols: [
      c('status', 130, (p) => (p.squadStatus ? t(`cl.sq.st.${p.squadStatus}`) : '-')),
      c('wage', 100, (p) => (p.contract ? money(p.contract.wage) : '-')),
      c('expiry', 110, (p) => (p.contract ? dateFmt(p.contract.expires) : '-')),
      c('releases', 100, (p) => (p.contract?.release ? money(p.contract.release) : '-')),
      c('value', 100, (p) => money(p.value)),
    ] },
    { key: 'selection', label: t('cl.sq.v.selection'), head: t('cl.sq.h.selection'), cols: [
      c('position', 120, (p) => posStr(p)),
      c('form', 60, (p) => (p.form.length ? formAvg(p).toFixed(1) : '-')),
      c('morale', 90, (p) => t(moraleKey(p.morale))),
      c('cond', 60, (p) => `${Math.round(p.condition)}%`),
    ] },
    { key: 'stats', label: t('cl.sq.v.stats'), head: t('cl.sq.h.stats'), cols: [
      c('apps', 70, (p) => `${p.stats.apps}${p.stats.subs ? ` (${p.stats.subs})` : ''}`),
      c('gls', 50, (p) => dash(p.stats.goals)),
      c('asts', 50, (p) => dash(p.stats.assists)),
      c('mom', 50, (p) => dash(p.stats.mom)),
      c('avr', 60, (p) => (p.stats.ratingCount ? <Rating r={avgRating(p)} digits={2} /> : '-')),
    ] },
    // "More Stats" (originalens Tgls/Tcon/Lost/Pass %/Drb/Sh Tar har vi ikke): kort, minutter og ligaens tal
    { key: 'more', label: t('cl.sq.v.more'), head: t('cl.sq.h.more'), cols: [
      c('mins', 60, (p) => dash(p.stats.minutes)),
      c('yel', 50, (p) => dash(p.stats.yellows)),
      c('red', 50, (p) => dash(p.stats.reds)),
      c('lgApps', 80, (p) => dash(p.stats.lgApps)),
      c('lgGls', 70, (p) => dash(p.stats.lgGoals)),
    ] },
    ...ATTR_GROUPS.map(([k, keys]) => ({ key: `attr:${k}`, label: t(`cl.sq.a.${k}`), head: t('cl.sq.a.head', { group: t(`cl.sq.a.${k}`) }),
      cols: keys.map((a) => ({ key: a, label: ATTR_ABBR[a] ?? a, title: t(`attr.${a}`), w: 38, show: (p: Player) => Math.round(p.attrs[A[a]]) })) })),
    { key: 'other', label: t('cl.sq.v.other'), head: t('cl.sq.h.other'), cols: [
      c('nat', 150, (p) => natName(g.nations[p.nation]?.name) ?? ''),
      c('age', 50, (p) => age(p)),
      c('caps', 50, (p) => dash(p.caps)),
      c('goals', 50, (p) => dash(p.intGoals)),
    ] },
  ];
}

/** Pladsernes rækkefølge i originalens strimmel: GK, forsvar, midtbane, angreb – venstre, højre, så midten (GK DL DR DC DC ML MR MC MC FC FC) */
const STRIP_POS = ['GK', 'SW', 'D', 'WB', 'DM', 'M', 'AM', 'ST'];
const STRIP_SIDE: Record<string, number> = { L: 0, R: 1, C: 2 };
const stripOrder = (s: Slot) => STRIP_POS.indexOf(s.pos) * 10 + (STRIP_SIDE[s.side ?? 'C'] ?? 2);

/** Antal pladser på bænken i strimlen (SB1–SB9); dem over reglernes bænk vises dæmpet som i originalen */
const STRIP_BENCH = 9;

/** Originalens Filter (cm0102.exe): positionsgruppe · side · Available Only/Unavailable · European Squad · Include Reserves */
type OrigFilter = { pos: string; side: string; avail: string; euro: boolean; res: boolean };
const POS_GROUP: Record<string, string[]> = { gk: ['GK'], def: ['SW', 'D', 'WB'], mid: ['DM', 'M', 'AM'], att: ['ST'] };
function origFilter(f: OrigFilter, p: Player, euro: Set<number> | null): boolean {
  if (f.pos !== 'all' && !POS_GROUP[f.pos]?.some((k) => p.pos[POSITIONS.indexOf(k as (typeof POSITIONS)[number])] >= 15)) return false;
  if (f.side !== 'all' && p.side[SIDES.indexOf(f.side as (typeof SIDES)[number])] < 15) return false;
  if (f.avail === 'avail' && !available(p)) return false;
  if (f.avail === 'unavail' && available(p)) return false;
  if (f.euro && euro && !euro.has(p.id)) return false;
  return true;
}

function ClassicFirstSquad({ reserves = false }: { reserves?: boolean } = {}) {
  const g = useGame()!;
  const { nav } = useNav();
  if (!g.tactic) g.tactic = autoSelect(newTactic('4-4-2'), squad(g.userClub));
  const tac = g.tactic;
  const orig = authentic();
  const [view, setView] = useRouteState('cview', 'trad');
  const [sqnMissing] = useRouteState('sqnMissing', 0);
  const [sortKey, setSort] = useRouteState('csort', 'pos');
  const [filter, setFilter] = useRouteState('cfilter', 'all');
  const [of, setOf] = useRouteState<OrigFilter>('cofilter', { pos: 'all', side: 'all', avail: '', euro: false, res: false });
  // Sort By viser det sorterede i kolonnen (originalen: Sort By Condition → "Condition" med procenterne – ejerens billede 277)
  const [infoKey, setInfoKey] = useRouteState('cinfo', 'pos');
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<string | null>(null);
  // klik på en ledig plads i strimlen: den næste spiller, man klikker på, sættes på pladsen
  const [armed, setArmed] = useState<string | null>(null);
  // CM 01/02: spillere på reserveholdet står kun på "{klub} Reserves" (managermenuen), ikke i førsteholdstruppen
  // "{klub} Reserves" (ejerens billede 278): reserverne og de udlejede spillere (blå navne)
  const players = reserves ? [...squad(g.userClub).filter((p) => p.reserves), ...Object.values(g.players).filter((p) => p.loan?.from === g.userClub && p.club !== g.userClub)]
    : squad(g.userClub).filter((p) => !p.reserves || (orig && of.res));
  const byId = new Map(players.map((p) => [p.id, p]));
  const save = (next: Tactic | null) => { if (next) act({ t: 'tactic', tactic: next }); };

  const VIEWS = sqViews(g);
  const SORTS = sorts(g, tac, orig);
  const table = view.startsWith('tbl:');
  const sv = VIEWS.find((x) => x.key === view) ?? VIEWS[0];
  const trad = sv.key === 'trad';
  const sort = SORTS.find((x): x is Extract<Sort, { cmp: unknown }> => 'cmp' in x && x.key === sortKey) ?? (SORTS[1] as Extract<Sort, { cmp: unknown }>);
  const fil = FILTERS.find(([k]) => k === filter) ?? FILTERS[0];
  const euroIds = g.clubs[g.userClub]?.euroSquad?.season === g.season ? new Set(g.clubs[g.userClub]!.euroSquad!.ids) : null;
  const list = players.filter((p) => (orig ? origFilter(of, p, euroIds) : fil[1](p, tac))).sort(sort.cmp);
  const INFO = infos(g);
  const info = INFO.find((x) => x.key === infoKey) ?? INFO[0];

  // pladserne: de 11 i formationen (i originalens rækkefølge) + bænken SB1–SB9
  const nb = benchSize();
  type Target = { id: string; label: string; place: NonNullable<Place>; pid: number; off?: boolean };
  const xi: Target[] = tac.slots.map((s, i) => ({ id: `x${i}`, label: slotLabel(s), place: { kind: 'xi' as const, i }, pid: tac.lineup[i] }));
  const targets: Target[] = [
    ...xi.slice().sort((a, b) => stripOrder(tac.slots[a.place.i]) - stripOrder(tac.slots[b.place.i]) || a.place.i - b.place.i),
    ...Array.from({ length: Math.max(nb, STRIP_BENCH) }, (_, i) => ({ id: `b${i}`, label: `SB${i + 1}`, place: { kind: 'bench' as const, i }, pid: i < nb ? tac.bench[i] ?? 0 : 0, off: i >= nb })),
  ];
  // reserveholdet har ingen opstilling hos os: strimlen (SB1–SB9 aktive som i originalen) og felterne er tomme
  if (reserves) for (const x of targets) { x.pid = 0; x.off = false; }
  const labelOf = (pid: number) => { if (reserves) return ''; const pl = placeOf(tac, pid); return !pl ? '' : pl.kind === 'xi' ? slotLabel(tac.slots[pl.i]) : `SB${pl.i + 1}`; };
  const short = (p: Player | undefined) => shortName(p);
  // bænkens pladser fyldes forfra (SB3 uden SB2 findes ikke i vores taktik)
  const benchPlace = (pl: NonNullable<Place>): NonNullable<Place> => (pl.kind === 'bench' && pl.i >= tac.bench.length ? { kind: 'bench', i: tac.bench.length } : pl);

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
      ...targets.filter((x) => x.place.kind === 'bench' && !x.off).map((x) => ({
        key: x.id, checked: same(x.place),
        disabled: !x.pid && cur?.kind !== 'bench' && tac.bench.length >= nb,
        label: <><b className="cx-sel-slot">{x.label}</b>{x.pid && x.pid !== p.id ? <span className="cx-sel-who">{short(byId.get(x.pid))}</span> : null}</>,
        onClick: () => save(moveTo(tac, p.id, benchPlace(x.place))),
      })),
      { key: 'sep', sep: true },
      { key: 'none', label: t('cl.sq.notSelected'), checked: !cur, onClick: () => save(moveTo(tac, p.id, null)) },
    ];
  };

  // strimlen: en besat plads tømmes ved klik (spilleren er ikke længere udtaget); en ledig plads vælges, og den næste spiller, man klikker
  // på, sættes på den (klik igen = fortryd)
  const stripClick = (x: Target) => {
    if (x.off || reserves) return;
    if (x.pid) { setArmed(null); save(moveTo(tac, x.pid, null)); return; }
    setArmed((a) => (a === x.id ? null : x.id));
  };
  const armedTarget = armed ? targets.find((x) => x.id === armed && !x.pid) : undefined;
  const putArmed = (p: Player) => { if (!armedTarget) return; save(moveTo(tac, p.id, benchPlace(armedTarget.place))); setArmed(null); };

  const cols: Col[] = trad ? [{ key: info.key, label: info.label, w: 0, show: info.show }] : sv.cols;
  const tmpl = trad ? undefined : { gridTemplateColumns: `${orig ? "52px 42px" : "44px 36px"} minmax(140px, 1fr) ${cols.map((c) => `${c.w}px`).join(' ')}` };
  const row = (p: Player) => {
    const lbl = labelOf(p.id);
    const pl = placeOf(tac, p.id);
    const loanedOut = p.loan?.from === g.userClub && p.club !== g.userClub;
    const tag = orig ? (loanedOut ? null : originalTag(p)) : tagOf(p, g);
    // grå navn (originalens "Ryan, R" på reserveholdet): ikke spilleklar af en anden grund end skade/karantæne (*estimeret*)
    const dim = orig && !available(p) && !p.injury && !(p.banned > 0) && !p.reserves && !loanedOut;
    const selCls = `cx-selbtn ${pl?.kind ?? ''} ${orig ? 'cx-orig' : ''}`;
    return (
      <div key={p.id} className={`cx-sq-row ${trad ? '' : 'wide'} ${drag === p.id ? 'dragging' : ''} ${over === `p${p.id}` ? 'over' : ''}`} style={tmpl} {...dropOn(`p${p.id}`, 'swapWith', p.id)}>
        {reserves ? <div className="cx-sel"><span className={selCls} /></div> : armedTarget
          ? <div className="cx-sel"><button className={selCls} data-pid={p.id} onClick={() => putArmed(p)}>{lbl || ' '}</button></div>
          : <CxDrop className="cx-sel" caret={false} fixed label={lbl || ' '} items={menuFor(p)}
            btn={{ className: selCls, draggable: true, onDragStart: dragStart(p.id), onDragEnd: dragEnd, title: orig ? undefined : t('cl.sq.selHint'), 'data-pid': p.id }} />}
        <Tag p={p} tag={tag} />
        <button className={`cx-sq-name ${!orig && !available(p) ? 'unavail' : ''} ${p.loan ? 'loan' : ''} ${dim ? 'dim' : ''}`} draggable onDragStart={dragStart(p.id)} onDragEnd={dragEnd}
          onClick={() => (armedTarget ? putArmed(p) : nav({ name: 'player', id: p.id }))}>{shortName(p, !orig && starIds(players).has(p.id))}</button>
        {cols.map((c) => <span key={c.key} className={`cx-sq-info ${trad && c.key === 'cond' ? 'cond' : ''}`} data-col={c.key}>{c.show(p)}</span>)}
      </div>
    );
  };

  const viewItems: DropItem[] = [
    ...VIEWS.filter((x) => !x.key.startsWith('attr:')).flatMap((x): DropItem[] => {
      const item: DropItem = { key: x.key, label: x.label, checked: !table && x.key === sv.key, onClick: () => setView(x.key) };
      // Attributes står mellem More Stats og Other (uden ▸ i originalens menu); gruppen vælges i bjælken over listen
      if (x.key !== 'more') return [item];
      return [item, { key: 'attrs', label: t('cl.sq.v.attrs'), checked: !table && sv.key.startsWith('attr:'), onClick: () => setView(sv.key.startsWith('attr:') ? sv.key : 'attr:att') }];
    }),
    { key: 'sep', sep: true },
    { key: 'pens', label: t('cl.sq.v.pens'), onClick: () => setView('pens') },
  ];

  if (view === 'pens' && !g.draft) {
    return <PenaltyTakers tac={tac} players={players} change={(next) => act({ t: 'tactic', tactic: next })} onClose={() => setView('trad')} />;
  }


  return (
    <div className={`cx-sq ${orig ? 'cx-sq-orig' : ''}`}>
      <Head title={t('nav.squad')}>
        <CxDrop label={t('cl.sq.view')} items={viewItems} />
        {!table && <CxDrop label={t('cl.sq.sortBy')} items={SORTS.map((x) => 'sep' in x ? x : { key: x.key, label: x.label, checked: x.key === sort.key, onClick: () => { setSort(x.key); const v = viewForSort(x.key, INFO); if (v) { setInfoKey(v); setView('trad'); } } })} />}
        <span className="grow" />
        {/* CM 01/02: én Assistant-menu */}
        <CxDrop label={t('cl.sq.assistantMenu')} align="right" items={[
          { key: 'pick', label: t('cl.sq.assistant'), disabled: reserves, onClick: () => save(autoSelect(tac, players.filter((p) => !p.reserves))) },
          { key: 'clear', label: t('cl.sq.clear'), disabled: reserves, onClick: () => save({ ...tac, lineup: tac.lineup.map(() => 0), bench: [] }) },
        ]} />
        <CxDrop label={t('cl.sq.filter')} align="right" items={orig ? [
          ...['all', 'gk', 'def', 'mid', 'att'].map((k) => ({ key: `p${k}`, label: t(k === 'all' ? 'cl.sq.fo.allPos' : `cl.sq.fo.${k}`), checked: of.pos === k, onClick: () => setOf({ ...of, pos: k }) })),
          { key: 's1', sep: true as const },
          ...['all', 'L', 'C', 'R'].map((k) => ({ key: `s${k}`, label: t(k === 'all' ? 'cl.sq.fo.allSides' : `cl.sq.fo.${k}`), checked: of.side === k, onClick: () => setOf({ ...of, side: k }) })),
          { key: 's2', sep: true as const },
          ...['avail', 'unavail'].map((k) => ({ key: k, label: t(`cl.sq.fo.${k}`), checked: of.avail === k, onClick: () => setOf({ ...of, avail: of.avail === k ? '' : k }) })),
          { key: 's3', sep: true as const },
          { key: 'euro', label: t('cl.sq.fo.euro'), checked: of.euro, disabled: !euroIds, onClick: () => setOf({ ...of, euro: !of.euro }) },
          { key: 's4', sep: true as const },
          { key: 'res', label: t('cl.sq.fo.res'), checked: of.res, disabled: reserves, onClick: () => setOf({ ...of, res: !of.res }) },
        ] : FILTERS.map(([k]) => ({ key: k, label: t(`cl.sq.f.${k}`), checked: k === fil[0], onClick: () => setFilter(k) }))} />
      </Head>
      {view === 'tbl:numbers' && !g.draft ? <ClassicSquadNumbers missing={!!sqnMissing} /> : table ? <SquadTable players={players} view={view.slice(4)} userClub={g.userClub} /> : (
        <div className="cx-sq-panel">
          <div className="cx-sq-head">
            <span>{trad ? info.label : sv.head}</span>
            {/* originalens fem egenskabsgrupper (Attacking/Defensive/Goalkeeping/Mental/Physical Attributes) */}
            {sv.key.startsWith('attr:') && <CxDrop className="cx-sq-agroup" label={sv.label} align="right"
              items={VIEWS.filter((v) => v.key.startsWith('attr:')).map((v) => ({ key: v.key, label: v.label, checked: v.key === sv.key, onClick: () => setView(v.key) }))} />}
          </div>
          <div className="cx-sq-slots" style={orig ? { gridTemplateColumns: `repeat(${targets.length}, minmax(0, 1fr))` } : undefined}>
            {targets.map((x) => {
              const p = x.pid ? byId.get(x.pid) : undefined;
              return (
                <div key={x.id} className={`cx-slot ${x.place.kind} ${p ? 'filled' : ''} ${x.off ? 'off' : ''} ${armed === x.id ? 'armed' : ''} ${over === x.id ? 'over' : ''}`}
                  title={x.off ? undefined : p ? `${p.first} ${p.last}` : t('cl.sq.empty')} onClick={() => stripClick(x)}
                  draggable={!!p} onDragStart={p ? dragStart(p.id) : undefined} onDragEnd={dragEnd}
                  {...(x.off ? {} : dropOn(x.id, benchPlace(x.place)))}>
                  {x.label}
                </div>
              );
            })}
          </div>
          {armedTarget && <div className="cx-sq-filtered">{t('cl.sq.pickSlot', { slot: armedTarget.label })}</div>}
          {reserves && !list.length && <div className="cx-sq-filtered">{t('cl.res.none')}</div>}
          {!orig && fil[0] !== 'all' && <div className="cx-sq-filtered">{t('cl.sq.filtered', { filter: t(`cl.sq.f.${fil[0]}`), n: list.length, total: players.length })}</div>}
          {!trad && (
            <div className="cx-sq-row wide cx-sq-colhead" style={tmpl}>
              <span /><span /><span />
              {cols.map((c) => <span key={c.key} className="cx-sq-info" title={c.title}>{c.label}</span>)}
            </div>
          )}
          {trad ? (
            <div className="cx-sq-cols">
              {/* skiftevis venstre/højre, så sorteringen læses række for række (som originalen) */}
              <div className="cx-sq-col">{list.filter((_, i) => i % 2 === 0).map(row)}</div>
              <div className="cx-sq-col">{list.filter((_, i) => i % 2 === 1).map(row)}</div>
            </div>
          ) : <div className="cx-sq-cols one"><div className="cx-sq-col">{list.map(row)}</div></div>}
          {/* "The dressing room" findes ikke i CM 01/02 – kun i det udvidede spil */}
          {!g.draft && !orig && <Cliques />}
          <div className="cx-sq-drop-out" {...dropOn('out', null)} hidden={reserves || drag === null || !placeOf(tac, drag)}>
            {t('cl.sq.dropOut')}
          </div>
        </div>
      )}
    </div>
  );
}
