// Spillerprofil i klassisk tema: opbygget som i de klassiske manager-spil fra omkring 2001.
// Titelbjælke med "Navn (Klub)" og en Action-menu, fanerne Profil · Skader & karantæner · Kontrakt · Transfer · Historik.
// Profil-fanen viser alle synlige egenskaber i fire alfabetiske kolonner, statistik pr. turnering og positionen nederst.
// Alle handlinger (bud, forespørgsel, liste, forlængelse, udlejning, scout, sammenligning …) ligger i Action-menuen.
import { useEffect, useState, type ReactNode } from 'react';
import { A, ATTRS, GROUPS, POSITIONS_LABEL, type AttrKey } from '../../game/attributes';
import { act as dispatch } from '../../game/actions';
import { agentOf } from '../../game/agents';
import { ageOn } from '../../game/dates';
import { GOOD_TRAITS, traits } from '../../game/personality';
import { attrRange, knowledgeOf, scoutStars } from '../../game/scouting';
import { avgRating } from '../../game/season';
import { SCHEDULES } from '../../game/training';
import { askingPrice, canPreContract, interestedClubs, nextWindow, windowOpen } from '../../game/transfers';
import { trialOf } from '../../game/trials';
import type { Player, TransferOffer } from '../../game/types';
import { POSITIONS, SIDES } from '../../game/types';
import { dateFmt, money, natName, t } from '../../i18n';
import { askConfirm } from '../confirm';
import { ClubList, CxDrop, CxLink, classicDate, nationRoute, titleColors, type DropItem } from '../classic';
import { compareIds, toggleCompare } from '../compare';
import { Bar, ClubLink, FormList, Modal, Panel, Rating, Stars, Tabs, posStr } from '../components';
import { gs } from '../../game/state';
import { useGame, useNav, useRouteState } from '../core';
import { realCareer, type RealSeason } from '../careers';
import { DevelopmentPanel } from '../dev';
import { ProposeEditModal, dbOf } from '../communityActions';
import { Head } from './common';
import { NegotiationModal } from './Negotiation';
import {
  AdviceLine, BidModal, Complaint, EnquiryLine, ListModal, LoanOutModal, MyOffer,
  ReformPanel, ScoutReport, TalkPanel, WantsAway, clauseText,
} from './PlayerScreen';
import { IncomingOffersFor } from './Transfers';

type Tab = 'profile' | 'injuries' | 'contract' | 'transfer' | 'history';
type ActionItem = DropItem;

/** Action-menuen i titelbjælken (fælles klassisk rullemenu) – knappen i farverne fra spillerens klub */
function ActionMenu({ items, clubId }: { items: ActionItem[]; clubId?: number }) {
  const col = titleColors(clubId);
  return <CxDrop className="cx-act" label={t('cl.action')} items={items} align="right"
    btn={col.neutral ? undefined : { style: { background: col.bg, color: col.fg } }} />;
}

// ---------- Profil-fanen ----------

/** Værdifarver som i originalen: hvid → gul → orange → rød */
const tone = (v: number) => v >= 19 ? 'v20' : v >= 17 ? 'v17' : v >= 14 ? 'v14' : v >= 11 ? 'v11' : v >= 6 ? 'v6' : 'v1';

const VISIBLE: AttrKey[] = ATTRS.filter((k) => !GROUPS.hidden.includes(k));

const moraleKey = (m: number) => `morale.${m >= 16 ? 'superb' : m >= 13 ? 'good' : m >= 9 ? 'okay' : 'poor'}`;

/** "Angriber (Midt)", "Offensiv midtbane/Angriber (Venstre/Midt)" */
export function positionLong(p: Player): string {
  const idx = POSITIONS.map((_, i) => i).filter((i) => p.pos[i] >= 15);
  if (!idx.length) idx.push(p.pos.indexOf(Math.max(...p.pos)));
  const names = idx.map((i) => t(`cl.posL.${POSITIONS[i]}`));
  if (idx.length === 1 && POSITIONS[idx[0]] === 'GK') return names[0];
  const sides = (['R', 'L', 'C'] as const).filter((s) => p.side[SIDES.indexOf(s)] >= 15).map((s) => t(`side.${s}`));
  return sides.length ? `${names.join('/')} (${sides.join('/')})` : names.join('/');
}

/** "Born 30.6.76 (Age 25). Holland (19 caps/7 goals)." – uden landskampe som i originalen kun "Danish." */
function BornLine({ p }: { p: Player }) {
  const g = useGame()!;
  const [, dob] = classicDate(p.dob);
  const v = { date: dob, age: ageOn(p.dob, g.date), nation: '\u0000', caps: p.caps, goals: p.intGoals };
  // nationen kan klikkes (åbner landets liga)
  const [before, after] = t(p.caps ? 'cl.pl.born' : 'cl.pl.bornNoCaps', v).split('\u0000');
  const nat = natName(g.nations[p.nation]?.name) ?? '';
  return <div className="cx-pl-born">{before}{after !== undefined ? <><CxLink to={nationRoute(p.nation)}>{nat}</CxLink>{after}</> : null}</div>;
}

/** Statistik pr. turnering + positionen nederst – fælles for profil-, skade-, kontrakt- og transferfanen */
function StatsBlock({ p }: { p: Player }) {
  const g = useGame()!;
  const [real, setReal] = useState<RealSeason[] | null>(null);
  useEffect(() => {
    let alive = true;
    if (!g.draft) realCareer(p.id).then((r) => { if (alive) setReal(r); });
    return () => { alive = false; };
  }, [p.id, g.draft]);
  // ligaen og øvrige turneringer i år, landsholdet og hele seniorkarrieren
  const s = p.stats;
  const avr = s.ratingCount ? avgRating(p) : 0;
  // seniorkarriere: virkelige sæsoner før spilstart + sæsoner i spillet + den igangværende (som karrierepanelet)
  const hist = g.draft ? [] : p.history ?? [];
  const pre = (real ?? []).reduce((acc, r) => ({ apps: acc.apps + r.apps, goals: acc.goals + r.goals, assists: acc.assists + r.assists }), { apps: 0, goals: 0, assists: 0 });
  const car = hist.reduce((acc, h) => ({ apps: acc.apps + h.apps, goals: acc.goals + h.goals, assists: acc.assists + h.assists, rs: acc.rs + h.avg * h.apps, rn: acc.rn + (h.avg ? h.apps : 0) }), { apps: pre.apps, goals: pre.goals, assists: pre.assists, rs: 0, rn: 0 });
  const carApps = car.apps + s.apps + s.subs, carAvg = (car.rs + avr * s.ratingCount) / ((car.rn + s.ratingCount) || 1);
  const dash = '-';
  const statRows: [string, ReactNode[]][] = [
    [t('cl.pl.league'), [s.lgApps, s.lgGoals, dash, dash, dash]],
    [t('cl.pl.cup'), [Math.max(0, s.apps - s.lgApps), Math.max(0, s.goals - s.lgGoals), dash, dash, dash]],
    [t('cl.pl.season'), [s.subs ? `${s.apps} (${s.subs})` : s.apps, s.goals, s.assists, s.mom, avr ? <Rating r={avr} digits={2} /> : dash]],
    [t('cl.pl.intl'), [p.caps, p.intGoals, dash, dash, dash]],
    [t('cl.pl.senior'), [carApps, car.goals + s.goals, car.assists + s.assists, dash, carApps && (car.rn + s.ratingCount) ? <Rating r={carAvg} digits={2} /> : dash]],
  ];
  const posTip = `${posStr(p)} · ${POSITIONS_LABEL.map(([l, i]) => `${l} ${p.pos[i]}`).join(' · ')} · ${SIDES.map((x, i) => `${t(`side.${x}`)} ${p.side[i]}`).join(' · ')}`;
  return (
    <>
      <div className="cx-pl-stats-wrap">
        <table className="cx-pl-stats">
          <thead>
            <tr><th />{[t('col.apps'), t('col.goals'), t('cl.pl.asts'), t('cl.pl.mom'), t('col.avr')].map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {statRows.map(([l, vals]) => (
              <tr key={l}><td>{l}</td>{vals.map((v, i) => <td key={i} className={i === 4 ? 'avr' : ''}>{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cx-pl-pos" title={posTip}>{positionLong(p)}</div>
    </>
  );
}

/** Rammen om faner i klassisk stil: fødselslinje, nøgletal, statistik og position – ekstra paneler under */
function Frame({ p, rows, children }: { p: Player; rows: [string, ReactNode, string?][]; children?: ReactNode }) {
  return (
    <>
      <div className="cx-pl">
        <BornLine p={p} />
        <div className="cx-kv">
          {rows.map(([l, v, cls], i) => [<span key={`l${i}`}>{l}</span>, <span key={`v${i}`} className={cls}>{v}</span>])}
        </div>
        <StatsBlock p={p} />
      </div>
      {children}
    </>
  );
}

function ProfileTab({ p }: { p: Player }) {
  const g = useGame()!;
  const k = knowledgeOf(p);
  const form = p.form.slice(-5);
  const cells: [string, ReactNode][] = [...VISIBLE]
    .sort((a, b) => t(`attr.${a}`).localeCompare(t(`attr.${b}`), t('cl.locale')))
    .map((a) => {
      const [lo, hi] = attrRange(p, A[a], k);
      return [t(`attr.${a}`), <span className={`cx-v ${tone(Math.round((lo + hi) / 2))}`}>{lo === hi ? lo : `${lo}-${hi}`}</span>];
    });
  cells.push(
    [t('cl.pl.foot'), <span className="cx-v v17">{t(`foot.${p.foot || 'R'}`)}</span>],
    [t('col.form'), <span className="cx-v v11">{form.length ? (form.reduce((x, y) => x + y, 0) / form.length).toFixed(1) : ''}</span>],
    [t('col.morale'), <span className="cx-v v17">{g.draft ? '-' : t(moraleKey(p.morale))}</span>],
    [t('cl.pl.condition'), <span className={`cx-v ${p.condition >= 90 ? 'v17' : p.condition >= 75 ? 'v11' : 'v20'}`}>{Math.round(p.condition)}%</span>],
  );
  const rows = Math.ceil(cells.length / 4);
  return (
    <div className="cx-pl">
      <BornLine p={p} />
      {g.options.masking && k < 100 && <div className="cx-pl-hint">{t('player.rangeHint')}</div>}
      <div className="cx-pl-attrs" style={{ ['--rows' as string]: rows, ['--rows2' as string]: Math.ceil(cells.length / 2) }}>
        {cells.map(([l, v]) => <div key={l} className="cx-pl-cell"><span>{l}</span>{v}</div>)}
      </div>
      <StatsBlock p={p} />
    </div>
  );
}

// ---------- de øvrige faner ----------

function InjuriesTab({ p, mine }: { p: Player; mine: boolean }) {
  const g = useGame()!;
  const k = knowledgeOf(p);
  const rows: [string, ReactNode, string?][] = [
    [t('cl.pl.condition'), <><Bar value={p.condition} /> {Math.round(p.condition)}%</>],
    [t('player.injury'), p.injury ? `${t(`injury.${p.injury.key}`)} (${p.injury.days} ${t('common.days')})` : t('common.none'), p.injury ? 'bad' : ''],
    [t('tag.ban'), p.banned > 0 ? t('cl.pl.banGames', { n: p.banned }) : t('common.none'), p.banned > 0 ? 'bad' : ''],
    [t('player.cards'), `${p.stats.yellows} / ${p.stats.reds}`],
    [t('cl.pl.yellowsToBan'), p.yellowCount],
  ];
  if (!g.draft) rows.push([t('col.morale'), t(moraleKey(p.morale))]);
  rows.push([t('col.form'), p.form.length ? <FormList form={p.form} /> : '-']);
  if (!g.draft && (mine || k >= 60) && traits(p).length > 0) rows.push([t('pers.title'), traits(p).map((x) => <span key={x} className={`tag ${GOOD_TRAITS.has(x) ? 'good' : x === 'troublemaker' || x === 'lazy' || x === 'mercenary' ? 'bad' : 'warn'}`} title={t(`trait.${x}.desc`)}>{t(`trait.${x}`)}</span>)]);
  if (p.promiseUntil) rows.push([t('pers.promise'), t('pers.promiseUntil', { date: dateFmt(p.promiseUntil) })]);
  return (
    <Frame p={p} rows={rows}>
      {mine && (traits(p).includes('troublemaker') || traits(p).includes('temperamental')) && <ReformPanel pid={p.id} />}
      {mine && !g.draft && <TalkPanel pid={p.id} />}
    </Frame>
  );
}

function ContractTab({ p, mine }: { p: Player; mine: boolean }) {
  const g = useGame()!;
  const k = knowledgeOf(p);
  const rows: [string, ReactNode, string?][] = [
    [t('col.club'), <>{p.club ? <ClubLink id={p.club} long /> : t('common.free')}{p.loan && <> ({t('tag.loan')} {t('common.from')} <ClubLink id={p.loan.from} />)</>}</>],
  ];
  if (p.loan) rows.push([t('cl.pl.loanUntil'), dateFmt(p.loan.until)]);
  if (p.joined) rows.push([t('col.joined'), dateFmt(p.joined)]);
  if (p.contract) rows.push([t('col.wage'), `${money(p.contract.wage)} / ${t('common.week')}`], [t('col.expires'), dateFmt(p.contract.expires)]);
  else rows.push([t('col.wage'), t('common.none')]);
  if (p.contract?.release && (mine || k >= 40)) rows.push([t('clause.release'), money(p.contract.release)]);
  if (mine && p.contract && clauseText(p.contract)) rows.push([t('clause.title'), clauseText(p.contract)]);
  if (mine && p.sellOn) rows.push([t('clause.sellOn'), t('clause.sellOnTo', { pct: p.sellOn.pct, club: g.clubs[p.sellOn.club]?.name ?? '?' })]);
  if (p.addOn && (mine || p.addOn.club === g.userClub)) rows.push([t('clause.addOnShort'), t('clause.addOnLeft', { fee: money(p.addOn.fee), club: g.clubs[p.addOn.club]?.name ?? '?', n: p.addOn.left })]);
  if (p.contract?.futureClub) rows.push([t('player.nextClub'), <ClubLink id={p.contract.futureClub} />]);
  if (!g.draft) { const a = agentOf(p); rows.push([t('player.agent'), <span title={t(`agent.${a.style}.hint`)}>{a.name} ({t(`agent.${a.style}`)})</span>]); }
  return (
    <Frame p={p} rows={rows}>
      {mine && p.renewal && !p.complaint && <div className={`insight ${p.renewal.convinced ? '' : 'warn'}`}>{t(p.renewal.convinced ? 'renewal.status.convinced' : `renewal.status.${p.renewal.stance}`, { player: p.last })}</div>}
    </Frame>
  );
}

/** "Future": spillerens holdning til klubben, som i originalens transferside */
function futureLines(p: Player, mine: boolean, k: number): string[] {
  const g = gs();
  if (!mine && k < 40) return [t('cl.pl.unknown')];
  const out: string[] = [];
  if (p.contract?.futureClub) out.push(t('cl.pl.fut.leaving', { club: g.clubs[p.contract.futureClub]?.name ?? '?' }));
  if (p.wantsAway) out.push(t('cl.pl.fut.wantsAway'));
  if ((p.unhappy ?? 0) > 60) out.push(t('cl.pl.fut.time'));
  if (p.renewal && !p.renewal.convinced) out.push(t(p.renewal.stance === 'refuses' ? 'cl.pl.fut.noRenew' : 'cl.pl.fut.hesitant'));
  if (p.club && p.morale >= 13) out.push(t('cl.pl.fut.atmosphere'));
  else if (p.club && p.morale < 9) out.push(t('cl.pl.fut.lowMorale'));
  if (p.club && !p.contract?.futureClub && !p.wantsAway && (p.unhappy ?? 0) <= 60 && !(p.renewal && !p.renewal.convinced)) out.push(t('cl.pl.fut.happy'));
  if (!p.club) out.push(t('cl.pl.fut.free'));
  return out;
}

function TransferTab({ p, mine }: { p: Player; mine: boolean }) {
  const g = useGame()!;
  const k = knowledgeOf(p);
  const stars = scoutStars(p);
  const availability = mine
    ? p.listed ? `${t('tag.listed')}${p.listPrice ? ` (${money(p.listPrice)})` : ''}` : p.loan ? t('tag.loan') : t('cl.pl.av.notForSale')
    : !p.club ? t('cl.pl.av.free')
    : p.listed ? `${t('tag.listed')}${p.listPrice ? ` (${money(p.listPrice)})` : ''}`
    : p.contract?.futureClub ? t('tag.leaving')
    : k >= 40 ? t('cl.pl.av.asking', { fee: money(askingPrice(p)) }) : t('cl.pl.unknown');
  const offers = g.offers.filter((o) => o.player === p.id && (o.status === 'pending' || o.status === 'negotiating'));
  const offerText = <ClubList ids={offers.map((o) => o.buyer)} empty={t('common.none')} suffix={(_, i) => ` (${offers[i].loan ? t('tag.loan') : money(offers[i].fee)})`} />;
  const interestIds = interestedClubs(p).map((i) => i.club);
  const fut = futureLines(p, mine, k);
  const rows: [string, ReactNode, string?][] = [
    [t('cl.pl.availability'), availability],
    [t('col.value'), money(p.value)],
    [t('cl.pl.offers'), offerText],
    [t('cl.pl.interested'), <ClubList ids={interestIds} empty={t('common.none')} />],
    [t('cl.pl.future'), <>{fut.map((x) => <div key={x}>{x}</div>)}</>],
    [t('player.ability'), <Stars range={stars.ability} />],
    [t('player.potential'), <Stars range={stars.potential} />],
  ];
  if (g.options.masking && !mine) rows.push([t('player.knowledge'), <><Bar value={k} /> {Math.round(k)}%</>]);
  rows.push([t('cl.pl.window'), windowOpen() ? t('cl.pl.windowOpen') : t('transfer.windowOpens', { date: dateFmt(nextWindow()) })]);
  return (
    <Frame p={p} rows={rows}>
      {!mine && <EnquiryLine pid={p.id} />}
      {mine && <IncomingOffersFor pid={p.id} />}
      {!mine && g.userClub > 0 && <ScoutReport pid={p.id} />}
    </Frame>
  );
}

/** "Playing Career" som i CM 01/02: én linje pr. sæson og klub – nyeste først, den igangværende sæson øverst */
function ClassicCareer({ p }: { p: Player }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [real, setReal] = useState<RealSeason[] | null>(null);
  useEffect(() => {
    let alive = true;
    if (!g.draft) realCareer(p.id).then((r) => { if (alive) setReal(r); });
    return () => { alive = false; };
  }, [p.id, g.draft]);
  type Row = { season: number; club: number; name?: string; apps: number; goals: number; assists?: number; mom?: number; avr?: number; loan?: boolean; now?: boolean };
  const s = p.stats;
  const rows: Row[] = [
    ...(p.club ? [{ season: g.season, club: p.club, apps: s.apps + s.subs, goals: s.goals, assists: s.assists, mom: s.mom, avr: s.ratingCount ? avgRating(p) : 0, loan: !!p.loan, now: true }] : []),
    ...(g.draft ? [] : (p.history ?? []).slice().reverse().map((h) => ({ season: h.season, club: h.club, apps: h.apps, goals: h.goals, assists: h.assists, avr: h.avg, loan: h.loan }))),
    ...(real ?? []).slice().reverse().map((r) => ({ season: r.season, club: r.club, name: r.clubName, apps: r.apps, goals: r.goals, loan: r.loan })),
  ];
  const season = (y: number) => `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
  const dash = (v: number | undefined) => (v === undefined ? '' : v ? v : '-');
  return (
    <div className="cx-pl">
      <div className="cx-subtitle small">{t('cl.pl.career')}</div>
      {real === null && rows.length <= 1 ? <div className="cx-empty">{t('common.loading')}</div> : (
        <div className="cx-tbl-wrap"><table className="cx-tbl cx-career">
          <thead><tr><th /><th /><th className="c-num">{t('col.apps')}</th><th className="c-num">{t('col.goals')}</th><th className="c-num">{t('cl.pl.asts')}</th><th className="c-num" title={t('cl.pl.mom')}>{t('cl.tn.mom')}</th><th className="c-num">{t('col.avr')}</th></tr></thead>
          <tbody>{rows.map((r, i) => {
            const known = !!g.clubs[r.club];
            return (
              <tr key={i}>
                <td className="btn-col"><span className={`cx-lg-pos ${r.now ? 'now' : ''}`}>{season(r.season)}</span></td>
                <td className="cx-career-club">{known ? <span className="link" onClick={() => nav({ name: 'club', id: r.club })}>{g.clubs[r.club].short}</span> : r.name ?? '?'}{r.loan && <span className="cx-career-loan"> ({t('career.loan')})</span>}</td>
                <td className="c-num c-yel">{r.apps}</td><td className="c-num c-yel">{r.goals}</td>
                <td className="c-num c-yel">{dash(r.assists)}</td><td className="c-num c-yel">{dash(r.mom)}</td>
                <td className="c-val">{r.avr ? <Rating r={r.avr} digits={2} /> : '----'}</td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}
      {!g.draft && real && real.length > 0 && <div className="cx-fl-hint">{t(g.dbKind === 'cm0102' ? 'career.sourceCm' : 'career.source')}</div>}
    </div>
  );
}

function HistoryTab({ p }: { p: Player }) {
  const g = useGame()!;
  return (
    <>
      <ClassicCareer p={p} />
      {p.dev && p.dev.length > 0 && (
        <Panel title={t('dev.title')} right={<span className="muted">{t('dev.since', { date: dateFmt(p.dev[0].d) })}</span>}>
          <DevelopmentPanel p={p} date={g.date} />
        </Panel>
      )}
      <Panel title={t('player.notes')}>
        <textarea rows={3} style={{ width: '100%' }} defaultValue={p.notes ?? ''} onBlur={(e) => { if (e.target.value !== (p.notes ?? '')) dispatch({ t: 'notes', pid: p.id, text: e.target.value }); }} />
      </Panel>
    </>
  );
}

// ---------- skærmen ----------

export function ClassicPlayer({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const p = g.players[id];
  // fanen kan vælges udefra (fx et klik på Inj/Wnt/Fgn i truppen) og huskes på ruten
  const [tab, setTab] = useRouteState<Tab>('ptab', (useNav().route.tab as Tab | undefined) ?? 'profile');
  const [bid, setBid] = useState<boolean | number>(false);
  const [neg, setNeg] = useState<{ offer?: TransferOffer; renew?: number } | null>(null);
  const [msg, setMsg] = useState('');
  const [loanOutOpen, setLoanOut] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [trainOpen, setTrainOpen] = useState(false);
  useEffect(() => setMsg(''), [id]);
  if (!p) return <div><Head title={t('player.gone')} /></div>;
  const mine = p.club === g.userClub && !!g.userClub;
  const k = knowledgeOf(p);
  const shortlisted = g.shortlist.includes(p.id);
  const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout');
  const open = windowOpen();
  const closedTip = open ? undefined : t('transfer.windowOpens', { date: dateFmt(nextWindow()) });

  const act = (r: TransferOffer | string) => {
    if (typeof r === 'string') {
      if (r.startsWith('enquiry.') && r !== 'enquiry.human') { setMsg(''); setTab('transfer'); } // svaret står på Transfer-fanen
      else if (r !== 'ok') setMsg(t(r)); else setMsg(t('player.done'));
    }
    else if (r.status === 'negotiating') setNeg({ offer: r });
    else setMsg(t('player.bidSent'));
  };

  // Action-menuen: alle handlinger, grupperet
  const items: ActionItem[] = [];
  if (!g.draft && mine) {
    items.push(
      { key: 'h-own', head: t('cl.pl.actSquad') },
      { key: 'train', label: `${t('nav.training')}…`, onClick: () => setTrainOpen(true) },
      { key: 'renew', label: t('player.renew'), onClick: () => setNeg({ renew: p.id }) },
      p.listed
        ? { key: 'list', label: t('list.changePrice'), onClick: () => setListOpen(true) }
        : { key: 'list', label: t('player.list'), onClick: () => setListOpen(true) },
    );
    if (p.listed) items.push({ key: 'unlist', label: t('player.unlist'), onClick: () => dispatch({ t: 'listed', pid: p.id, price: null }) });
    items.push(
      { key: 'loan', label: t('player.loanOut'), disabled: !!p.loan || !open, title: closedTip, onClick: () => setLoanOut(true) },
      { key: 'release', label: t('player.release'), danger: true, onClick: async () => { if (await askConfirm(t('player.releaseConfirm'), { danger: true })) { dispatch({ t: 'release', pid: p.id }); nav({ name: 'squad' }); } } },
    );
  }
  if (!g.draft && !mine && g.userClub > 0) {
    items.push({ key: 'h-tr', head: t('cl.pl.actTransfer') });
    if (p.club > 0) {
      items.push(
        { key: 'bid', label: t('player.bid'), disabled: !open, title: closedTip, onClick: () => setBid(true) },
        { key: 'enq', label: t('player.enquire'), onClick: () => act(dispatch<string>({ t: 'enquire', pid: p.id })) },
      );
    } else {
      items.push({ key: 'offer', label: t('player.offerContract'), disabled: !open, title: closedTip, onClick: () => act(dispatch<TransferOffer | string>({ t: 'bid', pid: p.id, fee: 0, loan: false })) });
      if (!trialOf(p.id)) items.push({ key: 'trial', label: t('trial.invite'), onClick: () => { const r = dispatch<string>({ t: 'trial', pid: p.id }); setMsg(r === 'ok' ? t('trial.invited') : t(`trial.err.${r}`)); } });
    }
    if (canPreContract(p)) items.push({ key: 'pre', label: t('player.preContract'), onClick: () => act(dispatch<TransferOffer | string>({ t: 'preContract', pid: p.id })) });
    items.push({ key: 'short', label: shortlisted ? t('player.unshortlist') : t('player.shortlist'), onClick: () => dispatch({ t: 'shortlist', pid: p.id, on: !shortlisted }) });
    if (scouts.length > 0 && g.options.masking && k < 100) {
      items.push({ key: 'h-sc', head: t('player.sendScout') });
      for (const s of scouts) items.push({ key: `sc${s.id}`, label: `${s.first} ${s.last}`, onClick: () => { dispatch({ t: 'scout', staffId: s.id, assignment: { kind: 'player', target: p.id } }); setMsg(t('player.scoutSent', { scout: `${s.first} ${s.last}` })); } });
    }
  }
  items.push(
    { key: 'h-cmp', head: t('cl.pl.actOther') },
    { key: 'cmp', label: `${compareIds.includes(p.id) ? '✓ ' : ''}${t('player.compare')} (${compareIds.length})`, onClick: () => toggleCompare(p.id) },
  );
  if (compareIds.length >= 2) items.push({ key: 'cmp2', label: t('player.showCompare'), onClick: () => nav({ name: 'compare' }) });
  // fællesskabet: foreslå en rettelse til CM-databasen (navn eller egenskaber)
  if (dbOf(g) && !p.regen) items.push({ key: 'edit', label: t('hub.edit.action'), onClick: () => setEditOpen(true) });

  const tabs: [Tab, string][] = [['profile', t('cl.pl.profile')], ['injuries', t('cl.pl.injuries')]];
  if (!g.draft) tabs.push(['contract', t('cl.pl.contract')], ['transfer', t('cl.pl.transfer')]);
  tabs.push(['history', t('cl.pl.history')]);

  return (
    <div>
      <Head title={`${p.first} ${p.last}`} action={<ActionMenu items={items} clubId={p.club || undefined} />} />
      <Tabs tabs={tabs} value={tab} onChange={(v) => setTab(v as Tab)} />
      {msg && <div className="insight">{msg}</div>}
      {!mine && <MyOffer pid={p.id} onNegotiate={(o) => setNeg({ offer: o })} onOpen={(o) => setBid(o.id)} />}
      {mine && p.complaint && <Complaint pid={p.id} onMsg={setMsg} />}
      {mine && p.playPromise && <div className="insight warn">{t('complaint.promised', { date: dateFmt(p.playPromise.until) })}</div>}
      {mine && p.wantsAway && <WantsAway pid={p.id} onMsg={setMsg} />}
      {!mine && trialOf(p.id) && <div className="insight">🧪 {t('trial.onTrial', { date: dateFmt(trialOf(p.id)!.end) })}</div>}
      {editOpen && <ProposeEditModal kind="player" id={p.id} onClose={() => setEditOpen(false)} />}
      {tab === 'profile' && <ProfileTab p={p} />}
      {tab === 'injuries' && <InjuriesTab p={p} mine={mine} />}
      {tab === 'contract' && <ContractTab p={p} mine={mine} />}
      {tab === 'transfer' && <TransferTab p={p} mine={mine} />}
      {tab === 'history' && <HistoryTab p={p} />}
      {trainOpen && (
        <Modal title={`${t('nav.training')} – ${p.first} ${p.last}`} onClose={() => setTrainOpen(false)}>
          <div className="col">
            <select value={p.training} onChange={(e) => dispatch({ t: 'training', pid: p.id, key: e.target.value })}>
              {SCHEDULES.map((s) => <option key={s.key} value={s.key}>{t(`train.${s.key}`)}</option>)}
            </select>
            <AdviceLine pid={p.id} />
            <div className="row" style={{ justifyContent: 'flex-end' }}><button className="primary" onClick={() => setTrainOpen(false)}>{t('common.ok')}</button></div>
          </div>
        </Modal>
      )}
      {bid !== false && <BidModal pid={p.id} offerId={typeof bid === 'number' ? bid : undefined} onClose={() => setBid(false)} onDone={(r) => { setBid(false); act(r); }} />}
      {listOpen && <ListModal pid={p.id} onClose={() => setListOpen(false)} />}
      {loanOutOpen && <LoanOutModal pid={p.id} onClose={() => setLoanOut(false)} onDone={(r) => { setLoanOut(false); act(r); }} />}
      {neg && <NegotiationModal offer={neg.offer} renewPid={neg.renew} onClose={() => setNeg(null)} />}
    </div>
  );
}
