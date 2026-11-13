// Spillerprofil i klassisk tema: opbygget som i de klassiske manager-spil fra omkring 2001.
// Titelbjælke med "Navn (Klub)" og en Action-menu, fanerne Profil · Skader & karantæner · Kontrakt · Transfer · Historik.
// Profil-fanen viser alle synlige egenskaber i fire alfabetiske kolonner, statistik pr. turnering og positionen nederst.
// Alle handlinger (bud, forespørgsel, liste, forlængelse, udlejning, scout, sammenligning …) ligger i Action-menuen.
import { isOriginal2001, loanBlocked } from '../../game/rules2001';
import { useEffect, useState, type ReactNode } from 'react';
import { A, GROUPS, POSITIONS_LABEL, type AttrKey } from '../../game/attributes';
import { act as dispatch } from '../../game/actions';
import { ageOn, daysBetween } from '../../game/dates';
import { traits } from '../../game/personality';
import { playerLanguages } from '../../game/languages';
import { expectedStatus } from '../../game/squadStatus';
import { attrRange, knowledgeOf } from '../../game/scouting';
import { authentic, extended } from '../../game/rules';
import { avgRating } from '../../game/season';
import { SCHEDULES } from '../../game/training';
import { askingPrice, canPreContract, interestedClubs, nextWindow, releaseCost, windowOpen } from '../../game/transfers';
import { cmActive } from '../../game/cmPlayerData';
import { cmAvailability, cmFutureLines } from '../../game/cmTransferList';
import { trialOf } from '../../game/trials';
import type { Player, TransferOffer } from '../../game/types';
import { POSITIONS, SIDES } from '../../game/types';
import { compName, dateFmt, money, natName, t } from '../../i18n';
import { askConfirm, askNotice } from '../confirm';
import { ClubList, CxDrop, CxLink, classicDate, nationRoute, titleColors, type DropItem, useClassicDialog, ClassicFoot } from '../classic';
import { compareIds, setCompareSlot } from '../compare';
import { ClubLink, Modal, Rating, Tabs, posStr } from '../components';
import { gs } from '../../game/state';
import { useGame, useNav, useRouteState } from '../core';
import { realCareer, type RealSeason } from '../careers';
import { ProposeEditModal, dbOf } from '../communityActions';
import { Head } from './common';
import { NegotiationModal } from './Negotiation';
import {
  AdviceLine, BidModal, Complaint, EnquiryLine, ListModal, LoanOutModal, MyOffer,
  ReformPanel, ScoutReport, WantsAway, clauseText,
} from './PlayerScreen';
import { IncomingOffersFor } from './Transfers';
import { BidPanel, DisciplinePanel, TransferStatusPanel } from './TransferStatusClassic';

type Tab = 'profile' | 'injuries' | 'contract' | 'transfer' | 'history';
type ActionItem = DropItem;

/** Action-menuen i titelbjælken (fælles klassisk rullemenu) – knappen i farverne fra spillerens klub */
export function ActionMenu({ items, clubId }: { items: ActionItem[]; clubId?: number }) {
  const col = titleColors(clubId);
  return <CxDrop className="cx-act" label={t('cl.action')} items={items} align="right"
    btn={col.neutral ? undefined : { style: { background: col.bg, color: col.fg } }} />;
}

// ---------- Profil-fanen ----------

/** Værdifarver som i originalen: hvid → gul → orange → rød */
const tone = (v: number) => v >= 19 ? 'v20' : v >= 17 ? 'v17' : v >= 14 ? 'v14' : v >= 11 ? 'v11' : v >= 6 ? 'v6' : 'v1';


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
function StatsBlock({ p, title }: { p: Player; title?: ReactNode }) {
  // al statistik på siden gælder kun den igangværende sæson (ejerens ønske 2026-11-13)
  const s = p.stats;
  const avr = s.ratingCount ? avgRating(p) : 0;
  const dash = '-';
  const statRows: [string, ReactNode[]][] = [
    // liga og øvrige turneringer (pokal/Europa) hver for sig med assists, kampens spiller og snit – som i originalen (ejerens ønske 2026-11-10)
    ...(() => {
      const lgRs = s.lgRatingSum ?? 0, lgRn = s.lgRatingCount ?? 0, lgA = s.lgAssists ?? 0, lgM = s.lgMom ?? 0;
      const cupRn = Math.max(0, s.ratingCount - lgRn), cupRs = s.ratingSum - lgRs;
      return [
        [t('cl.pl.league'), [s.lgApps, s.lgGoals, lgA, lgM, lgRn ? <Rating r={lgRs / lgRn} digits={2} /> : dash]],
        [t('cl.pl.cup'), [Math.max(0, s.apps - s.lgApps), Math.max(0, s.goals - s.lgGoals), Math.max(0, s.assists - lgA), Math.max(0, s.mom - lgM), cupRn ? <Rating r={cupRs / cupRn} digits={2} /> : dash]],
      ] as [string, ReactNode[]][];
    })(),
    [t('cl.pl.season'), [s.subs ? `${s.apps} (${s.subs})` : s.apps, s.goals, s.assists, s.mom, avr ? <Rating r={avr} digits={2} /> : dash]],
    [t('cl.pl.intl'), [s.intApps ?? 0, s.intGoals ?? 0, dash, dash, dash]],
    [t('cl.pl.senior'), [s.apps + s.subs, s.goals, s.assists, s.mom, avr ? <Rating r={avr} digits={2} /> : dash]],
  ];
  // CM 01/02: de blå pile skifter til side 2 (kort, minutter, indskiftninger – de tal spillet fører)
  const [page, setPage] = useState(0);
  const heads = page === 0 ? [t('col.apps'), t('col.goals'), t('cl.pl.asts'), t('cl.pl.mom'), t('col.avr')] : [t('cl.pl.yel'), t('cl.pl.red'), t('cl.pl.mins'), t('cl.pl.subsOn'), t('col.avr')];
  const rows2: [string, ReactNode[]][] = statRows.map(([l, v], i) => [l, i === 2 ? [s.yellows, s.reds, s.minutes, s.subs, v[4]] : [dash, dash, dash, dash, v[4]]]);
  const posTip = `${posStr(p)} · ${POSITIONS_LABEL.map(([l, i]) => `${l} ${p.pos[i]}`).join(' · ')} · ${SIDES.map((x, i) => `${t(`side.${x}`)} ${p.side[i]}`).join(' · ')}`;
  return (
    <>
      <div className="cx-pl-stats-wrap">
        <table className="cx-pl-stats">
          <thead>
            <tr><th className="cx-pl-stitle">{title}</th><th className="cx-pl-pager"><button className="cx-pm" disabled={page === 0} onClick={() => setPage(0)}>◂</button><button className="cx-pm" disabled={page === 1} onClick={() => setPage(1)}>▸</button></th>{heads.map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {(page === 0 ? statRows : rows2).map(([l, vals]) => (
              <tr key={l}><td colSpan={2}>{l}</td>{vals.map((v, i) => <td key={i} className={i === 4 ? 'avr' : ''}>{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cx-pl-pos" title={posTip}>{positionLong(p)}</div>
    </>
  );
}

/** Rammen om faner i klassisk stil (CM 01/02): fødselslinje, en gennemsigtig boks med linjer (altid mindst 12 rækker),
 *  statistik og position – ekstra paneler under */
function Frame({ p, rows, children, statsTitle }: { p: Player; rows: [string, ReactNode, string?][]; children?: ReactNode; statsTitle?: ReactNode }) {
  const pad = Math.max(0, 12 - rows.length);
  return (
    <>
      <div className="cx-pl">
        <BornLine p={p} />
        <div className="cx-kv cx-ruled">
          {rows.map(([l, v, cls], i) => [<span key={`l${i}`}>{l}</span>, <span key={`v${i}`} className={cls}>{v}</span>])}
          {Array.from({ length: pad }, (_, i) => [<span key={`pl${i}`} />, <span key={`pv${i}`} />])}
        </div>
        <StatsBlock p={p} title={statsTitle} />
      </div>
      {children}
    </>
  );
}

/** Profile (CM 01/02): tre gennemsigtige kolonner Technical · Mental · Physical med linjer; fod, form, moral og kondition
 *  nederst i Physical. Målmænd har målmandsegenskaberne under Technical. */
function ProfileTab({ p }: { p: Player }) {
  const g = useGame()!;
  const k = knowledgeOf(p);
  const gk = posStr(p).startsWith('GK');
  // CM 01/02 (Attribute Masking): en kendt spiller (scoutet, egen liga) viser de præcise tal, en ukendt "-" – aldrig intervaller
  const orig = authentic();
  const val = (a: AttrKey) => {
    if (orig) {
      if (k < 45) return <span className="cx-v">-</span>;
      const v = Math.round(p.attrs[A[a]]);
      return <span className={`cx-v ${tone(v)}`}>{v}</span>;
    }
    const [lo, hi] = attrRange(p, A[a], k);
    return <span className={`cx-v ${tone(Math.round((lo + hi) / 2))}`}>{lo === hi ? lo : `${lo}-${hi}`}</span>;
  };
  const sorted = (keys: AttrKey[]) => keys.slice().sort((a, b) => t(`attr.${a}`).localeCompare(t(`attr.${b}`), t('cl.locale'))).map((a): [string, ReactNode] => [t(`attr.${a}`), val(a)]);
  const tech = sorted([...GROUPS.technical.filter((a) => a !== 'offTheBall'), ...(gk ? GROUPS.goalkeeping : [])]);
  const ment = sorted([...GROUPS.mental, 'offTheBall']);
  const form = p.form.slice(-5);
  const phys: [string, ReactNode][] = [
    ...sorted(GROUPS.physical.filter((a) => a !== 'naturalFitness')),
    [t('cl.pl.foot'), <span className="cx-v v-gold">{t(`foot.${p.foot || 'R'}`)}</span>],
    [t('col.form'), <span className="cx-v v-gold">{form.length ? form.map((x) => Math.round(x)).join('-') : '-'}</span>],
    [t('col.morale'), <span className="cx-v v-gold">{g.draft ? '-' : t(moraleKey(p.morale))}</span>],
    [t('cl.pl.condition'), <span className="cx-v v-gold">{Math.round(p.condition)}%</span>],
  ];
  const cols: [string, [string, ReactNode][]][] = [[t('cl.pl.grp.technical'), tech], [t('cl.pl.grp.mental'), ment], [t('cl.pl.grp.physical'), phys]];
  const n = Math.max(tech.length, ment.length, phys.length);
  return (
    <div className="cx-pl">
      <BornLine p={p} />
      {g.options.masking && k < 100 && !orig && <div className="cx-pl-hint">{t('player.rangeHint')}</div>}
      <table className="cx-pl-grid">
        <thead><tr>{cols.map(([h]) => <th key={h} colSpan={2}>{h}</th>)}</tr></thead>
        <tbody>{Array.from({ length: n }, (_, r) => <tr key={r}>{cols.map(([h, list]) => [<td key={`${h}l`}>{list[r]?.[0] ?? ''}</td>, <td key={`${h}v`} className="v">{list[r]?.[1] ?? ''}</td>])}</tr>)}</tbody>
      </table>
      <StatsBlock p={p} />
    </div>
  );
}

// ---------- de øvrige faner ----------

function InjuriesTab({ p, mine }: { p: Player; mine: boolean }) {
  // CM 01/02: Injury, Type, Condition, Training, Bans
  const inj = p.injury;
  const weeks = inj ? Math.max(1, Math.round(inj.days / 7)) : 0;
  const rows: [string, ReactNode, string?][] = [
    [t('player.injury'), inj ? t(`injury.${inj.key}`) : t('common.none'), inj ? 'bad' : ''],
    [t('cl.pl.injType'), inj ? (inj.days <= 7 ? t('cl.pl.injDays', { n: inj.days }) : t('cl.pl.injWeeks', { n: weeks })) : '-'],
    [t('cl.pl.condition'), `${Math.round(p.condition)}%`],
    [t('cl.pl.training'), t(inj ? 'cl.pl.trNone' : p.condition < 75 ? 'cl.pl.trLight' : 'cl.pl.trFull')],
    [t('cl.pl.bans'), p.banned > 0 ? t('cl.pl.banGames', { n: p.banned }) : t('common.none'), p.banned > 0 ? 'bad' : ''],
  ];
  return (
    <Frame p={p} rows={rows}>
      {mine && !authentic() && (traits(p).includes('troublemaker') || traits(p).includes('temperamental')) && <ReformPanel pid={p.id} />}
    </Frame>
  );
}

/** Kontrakter fra før det nye transfersystem (1. september 2001) – som i CM 01/02 */
const NEW_SYSTEM = '2001-09-01';

function ContractTab({ p, mine }: { p: Player; mine: boolean }) {
  const g = useGame()!;
  const k = knowledgeOf(p);
  const c = p.contract;
  // CM 01/02: Type, Wages, Started, Protected, Expires, Squad Status, Bonuses, Clauses, Notes
  const before = g.season <= 2003 && (!p.joined || p.joined < NEW_SYSTEM);
  const ageAtSign = p.joined ? ageOn(p.dob, p.joined) : 99;
  const isProtected = !!c && (before || (!!p.joined && daysBetween(p.joined, g.date) < (ageAtSign < 28 ? 3 : 2) * 365));
  const squad = p.club ? Object.values(g.players).filter((x) => x.club === p.club) : [];
  const status = p.squadStatus ?? (p.club ? expectedStatus(p, squad, g.date) : undefined);
  const bonuses = c ? ([
    c.goalBonus ? t('cl.pl.bonus.goal', { v: money(c.goalBonus) }) : '',
    c.appBonus ? t('cl.pl.bonus.app', { v: money(c.appBonus) }) : '',
    c.cleanSheetBonus ? t('cl.pl.bonus.cs', { v: money(c.cleanSheetBonus) }) : '',
  ].filter(Boolean)) : [];
  const type = p.loan ? <>{t('cl.pl.ctLoan')} <ClubLink id={p.loan.from} /> ({dateFmt(p.loan.until)})</> : !c ? t('common.none') : t(c.partTime ? 'cl.pl.ctPart' : 'cl.pl.ctFull');
  const rows: [string, ReactNode, string?][] = [
    [t('cl.pl.ctType'), type],
    [t('cl.pl.wages'), c ? `${money(c.wage)} ${t('cl.pl.perWeek')}` : t('common.none')],
    [t('cl.pl.started'), before ? t('cl.pl.beforeSystem') : p.joined ? classicDate(p.joined)[1] : '-'],
    [t('cl.pl.protected'), c ? t(isProtected ? 'common.yes' : 'common.no') : '-'],
    [t('col.expires'), c ? classicDate(c.expires)[1] : '-'],
    [t('cl.pl.squadStatus'), status ? t(`cl.ts.s.${status}`) : '-'],
    [t('cl.pl.bonuses'), bonuses.length ? bonuses.join(', ') : t('common.none')],
    [t('cl.pl.clauses'), (mine || k >= 40) && c && clauseText(c) ? clauseText(c) : c?.release && (mine || k >= 40) ? `${t('clause.release')} ${money(c.release)}` : t('common.none')],
    [t('cl.pl.notes'), p.notes || '-'],
  ];
  if (p.contract?.futureClub) rows.push([t('player.nextClub'), <ClubLink id={p.contract.futureClub} />]);
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
  // den originale database i ægte tilstand: originalens Availability og Future (0x87dd80 – cmTransferList.ts)
  // ægte CM 01/02: originalens Future (0x87dd80) for alle spillere, man kender – aldrig spillets egne, modsigende linjer
  const cm = cmActive(g) && (mine || k >= 45);
  // CM 01/02 kender kun "Transfer listed by club/by request", "Listed for loan" og "Unknown" – også for andre klubbers spillere (ingen "Could be bought for")
  const availability = cmActive(g) && p.club ? t(`cm.av.${cmAvailability(p)}`) : mine
    ? p.listed ? `${t('tag.listed')}${p.listPrice ? ` (${money(p.listPrice)})` : ''}` : p.loan ? t('tag.loan') : t('cl.pl.av.notForSale')
    : !p.club ? t('cl.pl.av.free')
    : p.listed ? `${t('tag.listed')}${p.listPrice ? ` (${money(p.listPrice)})` : ''}`
    : p.contract?.futureClub ? t('tag.leaving')
    : k >= 40 ? t('cl.pl.av.asking', { fee: money(askingPrice(p)) }) : t('cl.pl.unknown');
  const offers = g.offers.filter((o) => o.player === p.id && (o.status === 'pending' || o.status === 'negotiating'));
  const offerText = <ClubList ids={offers.map((o) => o.buyer)} empty={t('common.none')} suffix={(_, i) => ` (${offers[i].loan ? t('tag.loan') : money(offers[i].fee)})`} />;
  const interestIds = interestedClubs(p).map((i) => i.club);
  const cmFut = cm ? cmFutureLines(g, p).map((x) => t(`cm.fut.${x.k}`, x.p)) : [];
  // *estimeret*: blokkene, der ikke er porteret (klubbens resultater, harmoni …), gav ingen linje – så spillets egne
  // ingen klager: originalens "Happy to stay at the club" (de øvrige tilfredse varianter 0x87ee70– er ikke porteret – *estimeret*)
  const fut = cm ? (cmFut.length ? cmFut : [p.club ? t('cl.pl.fut.happy') : '-']) : cmActive(g) ? [t('cl.pl.unknown')] : futureLines(p, mine, k);
  // CM 01/02: Availability, Value, Fluent Languages, Offers, Interested, Future (én linje pr. række)
  const langs = playerLanguages(g, p).map((l: string) => { try { return new Intl.DisplayNames([t('cl.locale')], { type: 'language' }).of(l) ?? l; } catch { return l; } });
  const rows: [string, ReactNode, string?][] = [
    [t('cl.pl.availability'), availability],
    [t('col.value'), money(p.value)],
    [t('cl.pl.languages'), langs.length ? langs.map((l: string) => l.charAt(0).toUpperCase() + l.slice(1)).join(', ') : '-'],
    [t('cl.pl.offers'), offerText],
    [t('cl.pl.interested'), <ClubList ids={interestIds} empty={t('common.none')} />],
    ...fut.map((x, i): [string, ReactNode] => [i === 0 ? t('cl.pl.future') : '', x]),
  ];
  return (
    <Frame p={p} rows={rows}>
      {!mine && <EnquiryLine pid={p.id} />}
      {mine && !authentic() && <IncomingOffersFor pid={p.id} />}
      {!mine && g.userClub > 0 && !authentic() && <ScoutReport pid={p.id} />}
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
    // klubberne, han har forladt i denne sæson (CM 01/02 viser en linje pr. klub – Barcelona → Roma → Sunderland samme sommer)
    ...(g.draft ? [] : (p.moves ?? []).filter((m) => m.season === g.season && m.from > 0 && m.from !== p.club).reverse()
      .filter((m, i, a) => a.findIndex((x) => x.from === m.from) === i && !(p.history ?? []).some((h) => h.season === g.season && h.club === m.from))
      .map((m) => ({ season: g.season, club: m.from, apps: 0, goals: 0, loan: !!m.loan }))),
    ...(g.draft ? [] : (p.history ?? []).slice().reverse().map((h) => ({ season: h.season, club: h.club, apps: h.apps, goals: h.goals, assists: h.assists, avr: h.avg, loan: h.loan }))),
    ...(real ?? []).slice().reverse().map((r) => ({ season: r.season, club: r.club, name: r.clubName, apps: r.apps, goals: r.goals, loan: r.loan })),
  ];
  const season = (y: number) => `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
  const dash = (v: number | undefined) => (v === undefined ? '' : v ? v : '-');
  return (
    <div className="cx-pl">
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
          })}
          {(() => {
            // Total (CM 01/02): alle sæsoner lagt sammen
            const tot = rows.reduce((x, r) => ({ apps: x.apps + r.apps, goals: x.goals + r.goals, assists: x.assists + (r.assists ?? 0), mom: x.mom + (r.mom ?? 0), rs: x.rs + (r.avr ?? 0) * r.apps, rn: x.rn + (r.avr ? r.apps : 0) }), { apps: 0, goals: 0, assists: 0, mom: 0, rs: 0, rn: 0 });
            return <tr className="cx-career-total"><td /><td className="c-cyan">{t('cl.pl.total')}</td><td className="c-num c-cyan">{tot.apps}</td><td className="c-num c-cyan">{tot.goals}</td><td className="c-num c-cyan">{tot.assists || '-'}</td><td className="c-num c-cyan">{tot.mom || '-'}</td><td className="c-val">{tot.rn ? <Rating r={tot.rs / tot.rn} digits={2} /> : '----'}</td></tr>;
          })()}
          </tbody>
        </table></div>
      )}
      {!g.draft && real && real.length > 0 && <div className="cx-fl-hint">{t(g.dbKind === 'cm0102' ? 'career.sourceCm' : 'career.source')}</div>}
    </div>
  );
}

/** History (CM 01/02): View-menuen skifter mellem Achievements, Playing Career, Injuries og Bans; sæsonens tal nederst */
function HistoryTab({ p }: { p: Player }) {
  const g = useGame()!;
  const [view, setView] = useRouteState<'achievements' | 'career' | 'injuries' | 'bans'>('hview', 'career');
  const views = ['achievements', 'career', 'injuries', 'bans'] as const;
  const season = `${g.season}/${String((g.season + 1) % 100).padStart(2, '0')}`;
  return (
    <div className="cx-pl">
      <div className="cx-tools cx-tools-inline">
        <CxDrop className="cx-green" label={t('cl.sq.view')} items={views.map((v) => ({ key: v, label: t(`cl.pl.hv.${v}`), checked: view === v, onClick: () => setView(v) }))} />
      </div>
      <div className="cx-subtitle small">{t(`cl.pl.hv.${view}`)}</div>
      {view === 'career' && <ClassicCareer p={p} />}
      {view === 'achievements' && <AchievementList p={p} />}
      {view === 'injuries' && <LogList rows={(p.injuryLog ?? []).slice().reverse().map((x) => [classicDate(x.d)[1], t(`injury.${x.k}`), x.days <= 7 ? t('cl.pl.injDays', { n: x.days }) : t('cl.pl.injWeeks', { n: Math.round(x.days / 7) })])} />}
      {view === 'bans' && <LogList rows={(p.banLog ?? []).slice().reverse().map((x) => [classicDate(x.d)[1], t(x.red ? 'cl.pl.banRed' : 'cl.pl.banYellows'), t('cl.pl.banGames', { n: x.n })])} />}
      <StatsBlock p={p} title={<span className="c-cyan">{season} {p.club ? g.clubs[p.club]?.short : ''}</span>} />
    </div>
  );
}

function LogList({ rows }: { rows: string[][] }) {
  if (!rows.length) return <div className="cx-empty">{t('common.none')}</div>;
  return <div className="cx-tbl-wrap"><table className="cx-tbl"><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k} className={k === 0 ? 'c-yel' : ''}>{c}</td>)}</tr>)}</tbody></table></div>;
}

/** Achievements: titler med klubben, kåringer og månedens spiller (fra sæsonhistorikken) */
function AchievementList({ p }: { p: Player }) {
  const g = useGame()!;
  const clubIn = (season: number) => (season === g.season ? p.club : (p.history ?? []).find((h) => h.season === season && !h.loan)?.club);
  const out: [string, string][] = [];
  for (const sh of g.seasonHistory ?? []) {
    const club = clubIn(sh.season);
    const yr = `${sh.season}/${String((sh.season + 1) % 100).padStart(2, '0')}`;
    for (const c of sh.comps) {
      if (club && c.winner === club) out.push([yr, t('cl.pl.ach.won', { comp: compName(c.name) })]);
      if (c.topScorer?.[0] === p.id) out.push([yr, t('cl.pl.ach.top', { comp: compName(c.name), n: c.topScorer[1] })]);
      if (c.best === p.id) out.push([yr, t('cl.pl.ach.best', { comp: compName(c.name) })]);
      if (c.young === p.id) out.push([yr, t('cl.pl.ach.young', { comp: compName(c.name) })]);
      if (c.teamOfYear?.includes(p.id)) out.push([yr, t('cl.pl.ach.team', { comp: compName(c.name) })]);
    }
    const bd = sh.ballonDor?.indexOf(p.id) ?? -1;
    if (bd >= 0) out.push([yr, t('cl.pl.ach.world', { n: bd + 1 })]);
  }
  for (const m of g.monthAwards ?? []) if (m.player === p.id) out.push([m.month, t('cl.pl.ach.month', { comp: compName(g.comps[m.comp]?.name ?? m.comp) })]);
  return <LogList rows={out.reverse().map(([a, b]) => [a, b])} />;
}

// ---------- skærmen ----------

export function ClassicPlayer({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const p = g.players[id];
  // fanen kan vælges udefra (fx et klik på Inj/Wnt/Fgn i truppen) og huskes på ruten
  const [tab, setTab] = useRouteState<Tab>('ptab', (useNav().route.tab as Tab | undefined) ?? 'profile');
  const [bid, setBid] = useState<boolean | number>(false);
  const [bidPanel, setBidPanel] = useState<'buy' | 'loan' | null>(null);
  const [neg, setNeg] = useState<{ offer?: TransferOffer; renew?: number } | null>(null);
  const [msg, setMsg] = useState('');
  const [loanOutOpen, setLoanOut] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [trainOpen, setTrainOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [discOpen, setDiscOpen] = useState(false);
  const [nickOpen, setNickOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [repRole, setRepRole] = useState<'physio' | 'coach' | null>(null);
  useEffect(() => setMsg(''), [id]);
  if (!p) return <div><Head menu={false} title={t('player.gone')} /></div>;
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
    // CM 01/02: Set Transfer Status · Offer New Contract · Discipline Player · Release On A Free (listen og leje ligger i Set Transfer Status)
    items.push(
      { key: 'res', label: t(p.reserves ? 'cl.pl.callUp' : 'cl.pl.relegate'), onClick: () => dispatch({ t: 'reserves', pid: p.id, on: !p.reserves }) },
      { key: 'status', label: t('cl.ts.menu'), onClick: () => setStatusOpen(true) },
      { key: 'renew', label: t('cl.pl.offerNew'), onClick: () => setNeg({ renew: p.id }) },
      { key: 'disc', label: t('cl.dp.menu'), disabled: !!p.lastTalk && daysBetween(p.lastTalk, g.date) < 10, title: t('talk.r.tooSoon'), onClick: () => setDiscOpen(true) },
    );
    items.push(
      { key: 'release', label: t('cl.pl.releaseFree'), danger: true, onClick: async () => { if (await askConfirm(t('player.releaseConfirm', { player: `${p.first} ${p.last}`.trim(), club: g.clubs[p.club]?.short ?? '', pay: money(releaseCost(p)) }), { danger: true, head: t('cl.pl.releaseQ', { player: `${p.first} ${p.last}`.trim() }) })) { if (dispatch<string>({ t: 'release', pid: p.id }) === 'blocked') setMsg(t('transfer.releaseBlocked.body', { player: `${p.first} ${p.last}`.trim(), club: g.clubs[p.club]?.name ?? '' })); else nav({ name: 'squad' }); } } },
      { key: 'nick', label: t(p.realName ? 'cl.pl.editNick' : 'cl.pl.setNick'), onClick: () => setNickOpen(true) },
      { key: 'sep-rep', sep: true },
      { key: 'physio', label: t('cl.pl.physioRep'), disabled: !Object.values(g.staff).some((s) => s.club === g.userClub && s.role === 'physio'), onClick: () => setRepRole('physio') },
      { key: 'coachrep', label: t('cl.pl.coachRep'), disabled: !Object.values(g.staff).some((s) => s.club === g.userClub && (s.role === 'coach' || s.role === 'assistant')), onClick: () => setRepRole('coach') },
    );
  }
  // CM 01/02 (kun den originale database): kald en udlejet spiller hjem
  if (p.loan?.from === g.userClub && isOriginal2001()) items.push({ key: 'recall', label: t('loan.recall'), onClick: () => setMsg(t(dispatch<string>({ t: 'recallLoan', pid: p.id }))) });
  if (!g.draft && !mine && g.userClub > 0) {
    // CM 01/02: Add To Shortlist · Approach To Buy · Approach To Loan · Scout Player · Set Nickname · — · Create Manager Note · Compare Players
    items.push({ key: 'short', label: shortlisted ? t('cl.pl.unshortlist') : t('cl.pl.shortlist'), onClick: () => dispatch({ t: 'shortlist', pid: p.id, on: !shortlisted }) });
    if (p.club > 0) {
      const me = g.clubs[g.userClub];
      items.push(
        { key: 'bid', label: t('cl.pl.approachBuy'), disabled: !open, title: closedTip, onClick: () => setBidPanel('buy') },
        { key: 'loan', label: t('cl.pl.approachLoan'), disabled: !open, title: closedTip, onClick: () => {
          if (me && loanBlocked(p, me)) void askNotice(t('cl.pl.loanNonEu', { club: me.short }), { head: t('cl.pl.cannotLoan', { player: `${p.first} ${p.last}`.trim() }) });
          else setBidPanel('loan');
        } },
      );
      // Enquire findes ikke i CM 01/02 (ejerens billede 13/11) – kun i det udvidede spil
      if (!authentic()) items.push({ key: 'enq', label: t('player.enquire'), onClick: () => act(dispatch<string>({ t: 'enquire', pid: p.id })) });
    } else {
      items.push({ key: 'offer', label: t('player.offerContract'), disabled: !open, title: closedTip, onClick: () => act(dispatch<TransferOffer | string>({ t: 'bid', pid: p.id, fee: 0, loan: false })) });
      if (!trialOf(p.id) && !authentic()) items.push({ key: 'trial', label: t('trial.invite'), onClick: () => { const r = dispatch<string>({ t: 'trial', pid: p.id }); setMsg(r === 'ok' ? t('trial.invited') : t(`trial.err.${r}`)); } });
    }
    if (canPreContract(p)) items.push({ key: 'pre', label: t('player.preContract'), onClick: () => act(dispatch<TransferOffer | string>({ t: 'preContract', pid: p.id })) });
    if (scouts.length > 0 && g.options.masking && k < 100) {
      items.push({ key: 'scout', label: t('cl.pl.scoutPlayer'), sub: scouts.map((s) => ({ key: `sc${s.id}`, label: `${s.first} ${s.last}`, onClick: () => { dispatch({ t: 'scout', staffId: s.id, assignment: { kind: 'player', target: p.id } }); setMsg(t('player.scoutSent', { scout: `${s.first} ${s.last}` })); } })) });
    }
    items.push({ key: 'nick', label: t(p.realName ? 'cl.pl.editNick' : 'cl.pl.setNick'), onClick: () => setNickOpen(true) });
  }
  items.push(
    { key: 'sep-cmp', sep: true },
    ...(!g.draft && g.userClub > 0 ? [{ key: 'note', label: t('cl.pl.note'), onClick: () => setNoteOpen(true) }] : []),
    { key: 'cmp', label: t('cl.pl.compare'), sub: [
      { key: 'c1', label: `${t('cl.pl.cmp1')}${compareIds[0] !== undefined ? ` ( ${g.players[compareIds[0]]?.first ?? ''} ${g.players[compareIds[0]]?.last ?? ''} )`.replace('(  ', '( ') : ''}`, onClick: async () => { if (await askConfirm(t('cl.pl.cmp1Q', { player: `${p.first} ${p.last}`.trim() }), { head: `${t('cl.pl.cmp1')}?` })) setCompareSlot(0, p.id); } },
      { key: 'c2', label: `${t('cl.pl.cmp2')}${compareIds[1] !== undefined ? ` ( ${g.players[compareIds[1]]?.first ?? ''} ${g.players[compareIds[1]]?.last ?? ''} )` : ''}`, onClick: async () => { if (await askConfirm(t('cl.pl.cmp2Q', { player: `${p.first} ${p.last}`.trim() }), { head: `${t('cl.pl.cmp2')}?` })) setCompareSlot(1, p.id); } },
      { key: 'c3', label: t('cl.pl.cmpGo'), disabled: compareIds.length < 2, onClick: () => nav({ name: 'compare' }) },
    ] },
  );
  // fællesskabet: foreslå en rettelse til CM-databasen (navn eller egenskaber)
  // "Propose a fix" findes ikke i CM 01/02 – kun i det udvidede spil
  if (dbOf(g) && !p.regen && !authentic()) items.push({ key: 'edit', label: t('hub.edit.action'), onClick: () => setEditOpen(true) });

  const tabs: [Tab, string][] = [['profile', t('cl.pl.profile')], ['injuries', t('cl.pl.injuries')]];
  if (!g.draft) tabs.push(['contract', t('cl.pl.contract')], ['transfer', t('cl.pl.transfer')]);
  tabs.push(['history', t('cl.pl.history')]);

  if (noteOpen) return <div><Head menu={false} title={`${p.first} ${p.last}`.trim()} /><NotePanel p={p} onClose={() => setNoteOpen(false)} /></div>;
  if (nickOpen) return <div><Head menu={false} title={`${p.first} ${p.last}`.trim()} /><NicknamePanel p={p} onClose={() => setNickOpen(false)} /></div>;
  if (repRole && mine) return <div><Head menu={false} title={`${p.first} ${p.last}`.trim()} /><StaffReportPanel p={p} role={repRole} onClose={() => setRepRole(null)} onDone={() => { setRepRole(null); nav({ name: 'inbox' }); }} /></div>;
  if (discOpen && mine) return <div><Head menu={false} title={`${p.first} ${p.last}`} /><DisciplinePanel p={p} onClose={() => setDiscOpen(false)} onDone={(m) => { setDiscOpen(false); setMsg(m); }} /></div>;
  // CM 01/02: buddet på sin egen side; svaret kommer som en nyhed (udvidet tilstand: klubbens svar med det samme)
  if (bidPanel && !mine) return <div><Head menu={false} title={`${p.first} ${p.last}`} /><BidPanel p={p} loan={bidPanel === 'loan'} onClose={() => setBidPanel(null)} onSent={(o) => {
    setBidPanel(null);
    if (o.status === 'negotiating') setNeg({ offer: o });
    else if (extended()) { dispatch({ t: 'bidNow', offer: o.id }); setBid(o.id); }
    else setMsg(t('player.bidSent'));
  }} /></div>;
  if (statusOpen && mine) return <div><Head menu={false} title={`${p.first} ${p.last}`} /><TransferStatusPanel p={p} onClose={() => setStatusOpen(false)} /></div>;

  return (
    <div>
      <Head title={`${p.first} ${p.last}`} action={<ActionMenu items={items} clubId={p.club || undefined} />} />
      <Tabs tabs={tabs} value={tab} onChange={(v) => setTab(v as Tab)} />
      {msg && !(authentic() && msg === t('player.bidSent')) && <div className="insight">{msg}</div>}
      {/* CM 01/02 viser hverken "Offer sent" eller "Your offer" på spillerens side – svaret kommer som nyhed */}
      {!mine && !authentic() && <MyOffer pid={p.id} onNegotiate={(o) => setNeg({ offer: o })} onOpen={(o) => setBid(o.id)} />}
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

/** CM 01/02 "Player Nickname": skriv kælenavnet – Ok, Remove (rigtigt navn tilbage) eller Cancel */
function NicknamePanel({ p, onClose }: { p: Player; onClose: () => void }) {
  useClassicDialog();
  const [v, setV] = useState(p.realName ? p.last : '');
  const save = (nick: string | null) => { dispatch({ t: 'nickname', pid: p.id, nick }); onClose(); };
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t('cl.pl.nickTitle')}</div>
      <div className="cx-ts-body center"><input className="cx-nick" autoFocus value={v} maxLength={30} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && v.trim()) save(v); }} /></div>
      <ClassicFoot cols="2fr 1fr 1fr">
        <button onClick={onClose}>{t('common.cancel')}</button>
        <button disabled={!p.realName} onClick={() => save(null)}>{t('cl.pl.nickRemove')}</button>
        <button className="primary" disabled={!v.trim()} onClick={() => save(v)}>{t('common.ok')}</button>
      </ClassicFoot>
    </div>
  );
}

/** "Request Physio Report" / "Request Coach Report": vælg en fra staben (gul), Confirm – rapporten står i nyhederne */
function StaffReportPanel({ p, role, onClose, onDone }: { p: Player; role: 'physio' | 'coach'; onClose: () => void; onDone: () => void }) {
  useClassicDialog();
  const g = useGame()!;
  const staff = Object.values(g.staff).filter((s) => s.club === g.userClub && (role === 'physio' ? s.role === 'physio' : s.role === 'coach' || s.role === 'assistant'));
  const [sel, setSel] = useState(staff[0]?.id);
  const name = `${p.first} ${p.last}`.trim();
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t(role === 'physio' ? 'cl.pl.physioRep' : 'cl.pl.coachRep')}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t(role === 'physio' ? 'cl.pl.physioWho' : 'cl.pl.coachWho', { player: name })}</p>
        {staff.map((s) => <button key={s.id} className={`cx-opt ${sel === s.id ? 'sel' : ''}`} onClick={() => setSel(s.id)}>{s.first} {s.last}</button>)}
      </div>
      <ClassicFoot cols="3fr 1fr">
        <button onClick={onClose}>{t('common.cancel')}</button>
        <button className="primary" disabled={sel === undefined} onClick={() => { if (sel !== undefined) dispatch({ t: 'staffReport', pid: p.id, staffId: sel }); onDone(); }}>{t('cl.dp.confirm')}</button>
      </ClassicFoot>
    </div>
  );
}

/** "Create Manager Note": en note om spilleren (vises under History) */
function NotePanel({ p, onClose }: { p: Player; onClose: () => void }) {
  useClassicDialog();
  const [v, setV] = useState(p.notes ?? '');
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t('cl.pl.note')}</div>
      <div className="cx-ts-body center"><textarea className="cx-nick cx-note" autoFocus value={v} maxLength={500} onChange={(e) => setV(e.target.value)} /></div>
      <ClassicFoot cols="3fr 1fr"><button onClick={onClose}>{t('common.cancel')}</button><button className="primary" onClick={() => { dispatch({ t: 'notes', pid: p.id, text: v }); onClose(); }}>{t('common.ok')}</button></ClassicFoot>
    </div>
  );
}
