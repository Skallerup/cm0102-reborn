// Spillerprofil i klassisk tema: opbygget som i de klassiske manager-spil fra omkring 2001.
// Titelbjælke med "Navn (Klub)" og en Action-menu, fanerne Profil · Skader & karantæner · Kontrakt · Transfer · Historik.
// Profil-fanen viser alle synlige egenskaber i fire alfabetiske kolonner, statistik pr. turnering og positionen nederst.
// Alle handlinger (bud, forespørgsel, liste, forlængelse, udlejning, scout, sammenligning …) ligger i Action-menuen.
import { loanBlocked } from '../../game/rules2001';
import { useEffect, useState, type ReactNode } from 'react';
import { A, GROUPS, POSITIONS_LABEL, type AttrKey } from '../../game/attributes';
import { act as dispatch } from '../../game/actions';
import { ageOn, daysBetween } from '../../game/dates';
import { traits } from '../../game/personality';
import { playerLanguages } from '../../game/languages';
import { expectedStatus, SQUAD_STATUSES } from '../../game/squadStatus';
import { attrMasked, attrRange, knowledgeOf } from '../../game/scouting';
import { cmKnowOn } from '../../game/cmKnow';
import { authentic, extended } from '../../game/rules';
import { avgRating } from '../../game/season';
import { SCHEDULES } from '../../game/training';
import { askingPrice, canPreContract, interestedClubs, approachOpen, loanApproach, myPendingBid, canRecallLoan, canTerminateLoan, nextWindow, releaseCost } from '../../game/transfers';
import { askEndLoan } from '../loanEnd';
import { cmActive, cmLogic, cmMarketOn, cmMediaOn, statCell, statColumns } from '../../game/cmPlayerData';
import { squadMoveOption } from '../../game/cmBTeam';
import { cmTalksOpen } from '../../game/cmTransferTalks';
import { cmPermitHistory, cmPermitOn } from '../../game/cmPermit';
import { cmScoutOn } from '../../game/cmScout';
import { ClassicNegotiation } from './NegotiationClassic';
import { DEMONYM } from '../demonyms';
import { cmAvailability, cmFutureLines } from '../../game/cmTransferList';
import { arrangedMove } from '../../game/cmStatusCode';
import { cmLongDate } from '../cmBanText';
import { trialOf } from '../../game/trials';
import type { Player, TransferOffer } from '../../game/types';
import { POSITIONS, SIDES } from '../../game/types';
import { compName, dateFmt, money, moneyFull, moneyWage, natName, t } from '../../i18n';
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
import { rebornOn } from '../reborn';

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

/** Preferred Foot som originalens profil 0x87aa24: venstre ≥ 15 → Left Only (højre < 8) / Left (< 14) / Either; ellers Right Only
 *  (venstre < 8) / Right – ud fra fødderne (Player.feet), når de kendes */
function footKey(p: Player): string {
  if (!p.feet) return p.foot || 'R';
  const [l, r] = p.feet;
  if (l >= 15) return r < 8 ? 'LO' : r < 14 ? 'L' : 'B';
  return l < 8 ? 'RO' : 'R';
}

/** "Born 30.6.76 (Age 25). Holland (19 caps/7 goals)." – uden landskampe som i originalen kun "Danish." */
function BornLine({ p }: { p: Player }) {
  const g = useGame()!;
  const [, dob] = classicDate(p.dob);
  const v = { date: dob, age: ageOn(p.dob, g.date), nation: '\u0000', caps: p.caps, goals: p.intGoals };
  // nationen kan klikkes (åbner landets liga)
  const [before, after] = t(p.caps ? 'cl.pl.born' : 'cl.pl.bornNoCaps', v).split('\u0000');
  // uden landskampe nationalitetsordet som originalen ("English." – nation.dat +87), ellers landets navn
  const nat = (!p.caps && (g.nations[p.nation]?.adj ?? DEMONYM[g.nations[p.nation]?.name ?? ''])) || (natName(g.nations[p.nation]?.name) ?? '');
  return <div className="cx-pl-born">{before}{after !== undefined ? <><CxLink to={nationRoute(p.nation)}>{nat}</CxLink>{after}</> : null}</div>;
}

/** Statistik pr. turnering + positionen nederst – fælles for profil-, skade-, kontrakt- og transferfanen */
function StatsBlock({ p, title }: { p: Player; title?: ReactNode }) {
  // al statistik på siden gælder kun den igangværende sæson (ejerens ønske 2026-11-13)
  const s = p.stats;
  const avr = s.ratingCount ? avgRating(p) : 0;
  const dash = '-';
  const g = useGame()!;
  // CM 01/02 (ejerens billeder 145/149/154, 0x870650): Non Competitive · League · Cup · Continental · International · Senior Club af originalens
  // statistikposter (cmPlayerData: 0x7c0d70), kolonnerne og formaterne fra 0x7c1b20/0x7c2750; de blå pile skifter mellem to sider
  const [page, setPage] = useState(0);
  if (cmMediaOn(g) && !g.draft) return <CmStatsBlock p={p} title={title} page={page} setPage={setPage} />;
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
  // de blå pile skifter til side 2 (kort, minutter, indskiftninger – de tal spillet fører)
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

const CM_ROWS: [number, string][] = [[1, 'cl.pl.nonComp'], [2, 'cl.pl.league'], [3, 'cl.pl.cup'], [4, 'cl.pl.continental'], [5, 'cl.pl.intl'], [6, 'cl.pl.senior']];
const CM_HEAD: Record<number, string> = { 1: 'col.apps', 2: 'col.goals', 3: 'cl.pl.con', 4: 'cl.pl.pens', 5: 'cl.pl.asts', 6: 'cl.pl.tgls', 7: 'cl.pl.tcon', 8: 'cl.pl.won',
  9: 'cl.pl.lost', 10: 'cl.pl.yel', 11: 'cl.pl.red', 12: 'cl.pl.mom', 13: 'cl.pl.pass', 14: 'cl.pl.tck', 15: 'cl.pl.drb', 16: 'cl.pl.shTar', 17: 'col.avr' };

/** Originalens statistiktabel (ægte tilstand, original DB): rækkerne skiftevis gule og orange (0xaebdec/0xaebdd4), Av R i lilla felter,
 *  keepere (Goalkeeper 20) med Con i stedet for Gls – cmPlayerData.ts statColumns/statCell */
function CmStatsBlock({ p, title, page, setPage }: { p: Player; title?: ReactNode; page: number; setPage: (n: number) => void }) {
  const cols = statColumns(page, Math.round(p.pos[0]) >= 20);
  const posTip = `${posStr(p)} · ${POSITIONS_LABEL.map(([l, i]) => `${l} ${p.pos[i]}`).join(' · ')} · ${SIDES.map((x, i) => `${t(`side.${x}`)} ${p.side[i]}`).join(' · ')}`;
  return (
    <>
      <div className="cx-pl-stats-wrap">
        <table className="cx-pl-stats cx-pl-cmstats">
          <thead>
            <tr><th className="cx-pl-stitle">{title}</th><th className="cx-pl-pager"><button className="cx-pl-arrow" aria-label="◂" onClick={() => setPage(page ? 0 : 1)}>◂</button><button className="cx-pl-arrow" aria-label="▸" onClick={() => setPage(page ? 0 : 1)}>▸</button></th>{cols.map((k) => <th key={k}>{t(CM_HEAD[k])}</th>)}</tr>
          </thead>
          <tbody>
            {CM_ROWS.map(([cat, label], r) => (
              <tr key={cat} className={r % 2 ? 'odd' : 'even'}><td colSpan={2}>{t(label)}</td>{cols.map((k) => <td key={k} className={k === 17 ? 'avr' : ''}>{statCell(p.cmStats?.[cat], k)}</td>)}</tr>
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
      // originalens kendskab (0x543280 – cmKnow.ts) pr. egenskab; uden den (anden database) en grænse på spillets kendskab
      if (cmKnowOn(g) ? attrMasked(p, A[a]) : k < 45) return <span className="cx-v">-</span>;
      const v = Math.round(p.attrs[A[a]]);
      return <span className={`cx-v ${tone(v)}`}>{v}</span>;
    }
    const [lo, hi] = attrRange(p, A[a], k);
    return <span className={`cx-v ${tone(Math.round((lo + hi) / 2))}`}>{lo === hi ? lo : `${lo}-${hi}`}</span>;
  };
  const sorted = (keys: AttrKey[]) => keys.slice().sort((a, b) => t(`attr.${a}`).localeCompare(t(`attr.${b}`), t('cl.locale'))).map((a): [string, ReactNode] => [t(`attr.${a}`), val(a)]);
  // ægte CM 01/02 (ejerens billeder 145/154): Technical har originalens ti viste egenskaber (0x5428a0's liste – Set Pieces = +0x29 Free Kicks;
  // Corners, Penalties og Throw Ins vises ikke), en keeper har i stedet Goalkeeping: Handling, Reflexes, One On Ones, Consistency, Passing,
  // Set Pieces, Technique i den rækkefølge
  const label = (a: AttrKey) => (orig && a === 'freeKicks' ? t('cl.fl.setPieces') : t(`attr.${a}`));
  const ORIG_TECH: AttrKey[] = ['crossing', 'dribbling', 'finishing', 'heading', 'longShots', 'marking', 'passing', 'freeKicks', 'tackling', 'technique'];
  const ORIG_GK: AttrKey[] = ['handling', 'reflexes', 'oneOnOnes', 'consistency', 'passing', 'freeKicks', 'technique'];
  const tech = !orig ? sorted([...GROUPS.technical.filter((a) => a !== 'offTheBall'), ...(gk ? GROUPS.goalkeeping : [])])
    : gk ? ORIG_GK.map((a): [string, ReactNode] => [label(a), val(a)])
    : ORIG_TECH.slice().sort((a, b) => label(a).localeCompare(label(b), t('cl.locale'))).map((a): [string, ReactNode] => [label(a), val(a)]);
  const ment = sorted([...GROUPS.mental, 'offTheBall']);
  const form = p.form.slice(-5);
  const phys: [ReactNode, ReactNode][] = [
    ...sorted(GROUPS.physical.filter((a) => a !== 'naturalFitness')),
    [t('cl.pl.foot'), <span className="cx-v v-gold">{t(`foot.${footKey(p)}`)}</span>],
    [t('col.form'), <span className="cx-v v-gold">{form.length ? form.map((x) => Math.round(x)).join('-') : '-'}</span>],
    [t('col.morale'), <span className="cx-v v-gold">{g.draft ? '-' : t(moraleKey(p.morale))}</span>],
    [t('cl.pl.condition'), <span className="cx-v v-gold">{Math.round(p.condition)}%</span>],
    // CM 01/02 (ejerens billede 154): "On loan from Fulham" i turkis under Condition
    ...(p.loan && g.clubs[p.loan.from] ? [[<span className="cx-v v-cyan cx-pl-loanfrom">{t('cl.pl.ctLoan')} <ClubLink id={p.loan.from} /></span>, ''] as [ReactNode, ReactNode]] : []),
  ];
  const cols: [string, [ReactNode, ReactNode][]][] = [[t(orig && gk ? 'group.goalkeeping' : 'cl.pl.grp.technical'), tech], [t('cl.pl.grp.mental'), ment], [t('cl.pl.grp.physical'), phys]];
  const n = Math.max(tech.length, ment.length, phys.length);
  return (
    <div className="cx-pl">
      <BornLine p={p} />
      {g.options.masking && k < 100 && !orig && <div className="cx-pl-hint">{t('player.rangeHint')}</div>}
      <table className="cx-pl-grid">
        <thead><tr>{cols.map(([h]) => <th key={h} colSpan={2}>{h}</th>)}</tr></thead>
        <tbody>{Array.from({ length: n }, (_, r) => <tr key={r}>{cols.map(([h, list]) => list[r]?.[1] === '' ? <td key={`${h}l`} colSpan={2} className="cx-pl-span">{list[r][0]}</td> : [<td key={`${h}l`}>{list[r]?.[0] ?? ''}</td>, <td key={`${h}v`} className="v">{list[r]?.[1] ?? ''}</td>])}</tr>)}</tbody>
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

/** CM 01/02 0x87da71–0x87db13: arbejdstilladelsens linje (originalens fire former efter ental/flertal) */
function permitLine(played: number, missed: number): string {
  const pct = played + missed ? Math.trunc((100 * played) / (played + missed)) : 0;
  if (played === 1 && missed === 1) return t('cl.pl.permit11');
  if (played === 1) return t('cl.pl.permit1n', { m: missed, pct });
  if (missed === 1) return t('cl.pl.permitn1', { n: played, pct });
  return t('cl.pl.permitnn', { n: played, m: missed, pct });
}

/** Contract-fanens rækker (CM 01/02) – også brugt af det moderne udseende i originale spil */
export function contractRows(p: Player, mine: boolean): [string, ReactNode, string?][] {
  const g = gs();
  const k = knowledgeOf(p);
  const c = p.contract;
  // CM 01/02: Type, Wages, Started, Protected, Expires, Squad Status, Bonuses, Clauses, Notes
  const before = g.season <= 2003 && (!p.joined || p.joined < NEW_SYSTEM);
  const ageAtSign = p.joined ? ageOn(p.dob, p.joined) : 99;
  const isProtected = !!c && (before || (!!p.joined && daysBetween(p.joined, g.date) < (ageAtSign < 28 ? 3 : 2) * 365));
  const squad = p.club ? Object.values(g.players).filter((x) => x.club === p.club) : [];
  // CM 01/02 (0x87d3bb → 0x84b330): teksten efter kontraktens +0x4f >> 4 – 1–7 som Squad Status, 0 "Uncertain" (0xa8262c), 8 "This player is
  // on trial" (0xa82638). Før viste en kontrakt med status 0 vores skøn (expectedStatus – fx "not needed by the club", ejerens fund 25/11)
  const code = p.club && p.cmContract?.b4f !== undefined ? (p.cmContract.b4f >> 4) & 0xf : -1;
  const status = code === 0 ? 'uncertain' : code === 8 ? 'trial' : code > 0 && code <= 7 ? SQUAD_STATUSES[code - 1]
    : p.club ? p.squadStatus ?? expectedStatus(p, squad, g.date) : undefined;   // klubløs: ingen kontrakt, ingen trupstatus (også i gamle gemte spil)
  // CM 01/02 (0x87d723–0x87d7d3): én række pr. bonus i rækkefølgen +0x10 mål, +0x14 assist, +0x18 clean sheet – overskriften kun på den første
  const bonuses = c ? ([
    c.goalBonus ? t('cl.pl.bonus.goal', { v: moneyWage(c.goalBonus) }) : '', // 0x85f830: flag 0xA
    c.cmAssistBonus ? t('cl.pl.bonus.assist', { v: moneyWage(c.cmAssistBonus) }) : '',
    c.cleanSheetBonus ? t('cl.pl.bonus.cs', { v: moneyWage(c.cleanSheetBonus) }) : '',
    c.appBonus ? t('cl.pl.bonus.app', { v: moneyWage(c.appBonus) }) : '',
  ].filter(Boolean)) : [];
  // CM 01/02 (0x87d057–0x87d23d): Started/Protected kun for en almindelig kontrakt (+0x35 = 2), når det nye transfersystem er trådt i kraft
  // ([0xae233c], sat fra 1/9-2001 i 0x5cdb5d)
  const showStarted = !!c && !p.loan && (c.cmType ?? 2) === 2 && g.date >= NEW_SYSTEM;
  // Work Permit (0x87d99f–0x87db3d): spilleren har en post i arbejdstilladelseshistorikken (0x8c7260), skal have tilladelse i klubben
  // (0x8c7560(…, 1)) og har en almindelig kontrakt – "N games played, M games missed (P%)", P = 100 · spillet / (spillet + ikke spillet)
  const permit = c && !p.loan && (c.cmType ?? 2) === 2 && (cmActive(g) || cmPermitOn(g)) ? cmPermitHistory(g, p) : null;
  const permitText = permit ? permitLine(permit.w4, permit.w6) : '';
  // CM 01/02 (0x85e960): originalens klausuler med det fælles beløb +0x21 (Manager Job Release Clause har intet beløb)
  const cmCl = c?.cmClauses ? c.cmClauses.map((v, i) => (v ? (i < 4 && c.cmClauseFee ? t('cm.clause.fee', { name: t(`cm.clause.${i}`), v: money(c.cmClauseFee) }) : t(`cm.clause.${i}`)) : '')).filter(Boolean).join(', ') : '';
  // CM 01/02 0x87cee4: typen +0x35 & 0x3f (bit 7 = Part Time) – 1 Monthly, 2 almindelig, 3/4 N/A, 5 Trial, 0 ugyldig; udløbet 0x85fa30: type 1
  // "Rolling", 3 "Contract Expired", 4 "Free", ellers datoen (ejerens billede 24/11: Steven Robinson, "Full Time Monthly Contract"/"Rolling")
  const ct = c?.cmType ?? 2;
  const CT_KEY: Record<number, string> = { 0: 'Invalid', 1: c?.partTime ? 'PartMonthly' : 'FullMonthly', 3: 'NA', 4: 'NA', 5: c?.partTime ? 'PartTrial' : 'FullTrial' };
  const type = p.loan ? <>{t('cl.pl.ctLoan')} <ClubLink id={p.loan.from} /> ({dateFmt(p.loan.until)})</> : !c ? t('common.none')
    : CT_KEY[ct] ? t(`cl.pl.ct${CT_KEY[ct]}`) : t(c.partTime ? 'cl.pl.ctPart' : 'cl.pl.ctFull');
  const expires = !c ? '-' : p.loan ? classicDate(c.expires)[1] : ct === 1 ? t('cl.pl.rolling') : ct === 3 ? t('cl.pl.ctExpired') : ct === 4 ? t('cl.pl.ctFree') : classicDate(c.expires)[1];
  const rows: [string, ReactNode, string?][] = [
    [t('cl.pl.ctType'), type],
    [t('cl.pl.wages'), c ? `${moneyWage(c.wage)} ${t('cl.pl.perWeek')}` : t('common.none')], // 0x87cd90 → 0x85e750 fuldt
    ...(showStarted ? [
      [t('cl.pl.started'), before ? t('cl.pl.beforeSystem') : p.joined ? classicDate(p.joined)[1] : '-'],
      [t('cl.pl.protected'), t(isProtected ? 'common.yes' : 'common.no')],
    ] as [string, ReactNode][] : []),
    [t('col.expires'), expires],
    [t('cl.pl.squadStatus'), status ? t(`cl.ts.s.${status}`) : '-'],
    ...(bonuses.length ? bonuses.map((b, i): [string, ReactNode] => [i === 0 ? t('cl.pl.bonuses') : '', b]) : [[t('cl.pl.bonuses'), t('common.none')] as [string, ReactNode]]),
    [t('cl.pl.clauses'), (mine || k >= 40) && cmCl ? cmCl : (mine || k >= 40) && c && clauseText(c) ? clauseText(c) : c?.release && (mine || k >= 40) ? `${t('clause.release')} ${money(c.release)}` : t('common.none')],
    ...(permit ? [[t('cl.pl.workPermit'), permitText] as [string, ReactNode]] : []),
    [t('cl.pl.notes'), p.notes || '-'],
  ];
  if (p.contract?.futureClub) rows.push([t('player.nextClub'), <ClubLink id={p.contract.futureClub} />]);
  return rows;
}

function ContractTab({ p, mine }: { p: Player; mine: boolean }) {
  const rows = contractRows(p, mine);
  return (
    <Frame p={p} rows={rows}>
      {/* ægte CM 01/02: spillerens holdning til en forlængelse står ikke på Contract-fanen (findes ikke i originalen) */}
      {mine && p.renewal && !p.complaint && !authentic() && <div className={`insight ${p.renewal.convinced ? '' : 'warn'}`}>{t(p.renewal.convinced ? 'renewal.status.convinced' : `renewal.status.${p.renewal.stance}`, { player: p.last })}</div>}
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

/** ugedagen ("Sunday") i spillerens sprog */
function weekday(iso: string): string {
  try { return new Date(iso + 'T00:00:00Z').toLocaleDateString(t('cl.locale'), { weekday: 'long', timeZone: 'UTC' }); } catch { return ''; }
}

/** Transfer-fanens rækker (CM 01/02): Availability, Value, Languages, Offers, Interested, Future – også brugt af det moderne udseende */
export function transferRows(p: Player, mine: boolean, modern = false): [string, ReactNode, string?][] {
  const g = gs();
  const k = knowledgeOf(p);
  // den originale database i ægte tilstand: originalens Availability og Future (0x87dd80 – cmTransferList.ts)
  // ægte CM 01/02: originalens Future (0x87dd80) for alle spillere, man kender – aldrig spillets egne, modsigende linjer
  const cm = cmMarketOn(g) && (mine || k >= 45);
  // CM 01/02 kender kun "Transfer listed by club/by request", "Listed for loan" og "Unknown" – også for andre klubbers spillere (ingen "Could be bought for")
  const availability = cmMarketOn(g) && p.club ? t(`cm.av.${cmAvailability(p)}`) : mine
    ? p.listed ? `${t('tag.listed')}${p.listPrice ? ` (${money(p.listPrice)})` : ''}` : p.loan ? t('tag.loan') : t('cl.pl.av.notForSale')
    : !p.club ? t('cl.pl.av.free')
    : p.listed ? `${t('tag.listed')}${p.listPrice ? ` (${money(p.listPrice)})` : ''}`
    : p.contract?.futureClub ? t('tag.leaving')
    : k >= 40 ? t('cl.pl.av.asking', { fee: money(askingPrice(p)) }) : t('cl.pl.unknown');
  // alle åbne bud på spilleren (TRANSFER_OFFER-listen: også andre klubbers og bud, der forhandles/venter på modbud) – computer → computer-buddene
  // findes kun, når ønskelisterne er slået til (cmShortlistGame.ts SL_ON)
  const offers = g.offers.filter((o) => o.player === p.id && (o.status === 'pending' || o.status === 'negotiating' || o.status === 'countered'));
  // CM 01/02 0x87e659–0x87e828: et aftalt skifte (0x8cca10) er hele rækken – "<klub> - transfer arranged for <ugedag dato>." (ejerens billede 24/11)
  const arranged = arrangedMove(g, p);
  const offerText = arranged ? <><ClubLink id={arranged.club} />{t('cl.pl.offerArranged', { date: `${weekday(arranged.date)} ${cmLongDate(arranged.date)}` })}</>
    : <ClubList ids={offers.map((o) => o.buyer)} empty={t('common.none')} modern={modern} suffix={(_, i) => ` (${offers[i].loan ? t('tag.loan') : money(offers[i].fee)})`} />;
  const interestIds = interestedClubs(p).map((i) => i.club);
  // hele Future-blokken (0x87ee70–0x8853ba) inkl. den tilfredse blok og "Unknown" (0x8852f9), når intet er skrevet
  const cmFut = cm ? cmFutureLines(g, p, interestIds.length).map((x) => t(`cm.fut.${x.k}`, x.p?.date ? { ...x.p, date: dateFmt(String(x.p.date)) } : x.p?.pos ? { ...x.p, pos: t(`cm.fut.pos.${x.p.pos}`) } : x.p)) : [];
  const fut = cm ? (cmFut.length ? cmFut : ['-']) : cmMarketOn(g) ? [t('cl.pl.unknown')] : futureLines(p, mine, k);
  // CM 01/02: Availability, Value, Fluent Languages, Offers, Interested, Future (én linje pr. række)
  const langs = playerLanguages(g, p).map((l: string) => { try { return new Intl.DisplayNames([t('cl.locale')], { type: 'language' }).of(l) ?? l; } catch { return l; } });
  const rows: [string, ReactNode, string?][] = [
    [t('cl.pl.availability'), availability],
    [t('col.value'), moneyFull(p.value)], // 0x87dd80: Value flag 6, tilbuddene flag 5
    [t('cl.pl.languages'), langs.length ? langs.map((l: string) => l.charAt(0).toUpperCase() + l.slice(1)).join(', ') : '-'],
    [t('cl.pl.offers'), offerText],
    [t('cl.pl.interested'), <ClubList ids={interestIds} empty={t('common.none')} modern={modern} />],
    ...fut.map((x, i): [string, ReactNode] => [i === 0 ? t('cl.pl.future') : '', x]),
  ];
  return rows;
}

function TransferTab({ p, mine }: { p: Player; mine: boolean }) {
  const g = useGame()!;
  const rows = transferRows(p, mine);
  return (
    <Frame p={p} rows={rows}>
      {!mine && <EnquiryLine pid={p.id} />}
      {mine && !authentic() && <IncomingOffersFor pid={p.id} />}
      {!mine && g.userClub > 0 && !authentic() && <ScoutReport pid={p.id} />}
    </Frame>
  );
}

/** mærket i Playing Career: beløbet (mangler = −1) og arten (CareerLine.fee/kind) */
type Lab = { fee?: number; kind?: number };
type CareerRow = { season: number; club: number; apps: number; goals: number; assists?: number; mom?: number; avr?: number; loan?: boolean; fee?: number; kind?: number };

/** Rækkerne som originalens karriereliste 0x7c3e40 (nyeste først): (1) 0x7c4467 – mærket rykkes én række op, så rækken viser, hvordan han kom
 *  til klubben (= hvordan han forlod klubben i rækken under; den sidste får intet); rækker uden mærke under (databasens karriere, gemte spil fra
 *  før 25/11) bruger rækkens egen lejemarkering. (2) 0x7c44ad – en række lægges sammen med en senere række med samme sæson og klub, når hverken
 *  den eller den senere har et beløb, og den senere ikke er "Loan" (mærket følger med, hvis det har et beløb eller er "Loan"). (3) 0x7c4624 – en
 *  række uden kampe og uden mærke fjernes, når en anden række har samme sæson og rækken under er samme klub. (Kategorierne 1–6 er her én række:
 *  kampene er klubkampene.) */
export function careerRows<R extends CareerRow>(raw: R[]): (R & { lab: Lab })[] {
  const out = raw.map((r, i) => {
    const n = raw[i + 1];
    const lab: Lab = n && (n.fee !== undefined || n.kind) ? { ...(n.fee !== undefined ? { fee: n.fee } : {}), ...(n.kind ? { kind: n.kind } : {}) } : r.loan ? { kind: 1 } : {};
    return { ...r, lab };
  });
  const gone = new Set<number>();
  for (let i = 0; i < out.length; i++) {
    const a = out[i];
    // (databasens karriere har ingen karakter – som rækkens +0x14 = −1 i 0x7c44fd: lægges ikke sammen)
    if (a.lab.fee !== undefined || a.avr === undefined) continue;
    for (let j = i + 1; j < out.length; j++) {
      const b = out[j];
      if (gone.has(j) || b.season !== a.season || b.club !== a.club || b.lab.kind === 1 || b.lab.fee !== undefined || b.avr === undefined) continue;
      const n = a.apps + b.apps, ra = a.avr ? a.apps : 0, rb = b.avr ? b.apps : 0;
      out[j] = { ...b, apps: n, goals: a.goals + b.goals, assists: a.assists === undefined && b.assists === undefined ? undefined : (a.assists ?? 0) + (b.assists ?? 0),
        mom: a.mom === undefined && b.mom === undefined ? undefined : (a.mom ?? 0) + (b.mom ?? 0), avr: ra + rb ? ((a.avr ?? 0) * ra + (b.avr ?? 0) * rb) / (ra + rb) : 0,
        lab: a.lab.kind === 1 ? a.lab : b.lab };
      gone.add(i);
      break;
    }
  }
  for (let i = 0; i < out.length; i++) {
    const a = out[i];
    if (gone.has(i) || a.apps > 0 || a.lab.fee !== undefined || a.lab.kind) continue;
    if (out[i + 1]?.club === a.club && out.some((o, j) => j !== i && !gone.has(j) && o.season === a.season)) gone.add(i);
  }
  return out.filter((_, i) => !gone.has(i));
}

/** gemte spil fra før 25/11 (linjen uden beløb/art): skiftet fra klubben i sæsonen i Player.moves (det seneste) – leje art 1, ellers beløbet */
function moveLeft(p: Player, season: number, club: number): Lab {
  const m = [...(p.moves ?? [])].reverse().find((x) => x.season === season && x.from === club);
  return !m ? {} : m.loan ? { kind: 1 } : { fee: m.fee, ...(m.swap ? { kind: 2 } : m.bosman ? { kind: 3 } : {}) };
}

/** "Playing Career" som i CM 01/02: én linje pr. sæson og klub – nyeste først, den igangværende sæson øverst */
export function ClassicCareer({ p }: { p: Player }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [real, setReal] = useState<RealSeason[] | null>(null);
  useEffect(() => {
    let alive = true;
    if (!g.draft) realCareer(p.id).then((r) => { if (alive) setReal(r); });
    return () => { alive = false; };
  }, [p.id, g.draft]);
  // fee/kind: hvordan han forlod klubben (CareerLine – originalens arkivpost 0x7c5fe0)
  type Row = { season: number; club: number; name?: string; apps: number; goals: number; assists?: number; mom?: number; avr?: number; loan?: boolean; now?: boolean; fee?: number; kind?: number };
  const s = p.stats;
  // den igangværende klub: kun tallene siden skiftet (det før står på den gamle klubs linje – p.split, season.ts pushCareerLine)
  const b = g.draft ? undefined : p.split;
  const nowRc = s.ratingCount - (b?.ratingCount ?? 0);
  const raw: Row[] = [
    ...(p.club ? [{ season: g.season, club: p.club, apps: s.apps + s.subs - (b?.apps ?? 0), goals: s.goals - (b?.goals ?? 0), assists: s.assists - (b?.assists ?? 0),
      mom: b && b.mom === undefined ? undefined : s.mom - (b?.mom ?? 0), avr: nowRc > 0 ? (s.ratingSum - (b?.ratingSum ?? 0)) / nowRc : 0, loan: !!p.loan, now: true }] : []),
    // klubberne, han har forladt i denne sæson (CM 01/02 viser en linje pr. klub – Barcelona → Roma → Sunderland samme sommer)
    ...(g.draft ? [] : (p.moves ?? []).filter((m) => m.season === g.season && m.from > 0 && m.from !== p.club).reverse()
      .filter((m, i, a) => a.findIndex((x) => x.from === m.from) === i && !(p.history ?? []).some((h) => h.season === g.season && h.club === m.from))
      .map((m) => ({ season: g.season, club: m.from, apps: 0, goals: 0, ...(m.loan ? { kind: 1 } : { fee: m.fee, ...(m.swap ? { kind: 2 } : m.bosman ? { kind: 3 } : {}) }) }))),
    ...(g.draft ? [] : (p.history ?? []).slice().reverse().map((h) => ({ season: h.season, club: h.club, apps: h.apps, goals: h.goals, assists: h.assists, mom: h.mom ?? 0, avr: h.avg, loan: h.loan,
      ...(h.fee !== undefined || h.kind ? { fee: h.fee, kind: h.kind } : moveLeft(p, h.season, h.club)) }))),
    ...(real ?? []).slice().reverse().map((r) => ({ season: r.season, club: r.club, name: r.clubName, apps: r.apps, goals: r.goals, loan: r.loan })),
  ];
  const season = (y: number) => `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
  const dash = (v: number | undefined) => (v === undefined ? '' : v ? v : '-');
  const rows = careerRows(raw);
  // kolonnen efter klubben (0x885820 → 0x886c4e–0x886d3f): beløb (bytte: "<beløb> p/x"), 0 → "Exch"/"Bos"/"Free", uden beløb art 1 → "Loan"
  const how = (l: Lab): string => {
    if (l.fee !== undefined && l.fee > 0) return l.kind === 2 ? t('cl.pl.car.px', { fee: money(l.fee) }) : money(l.fee);
    if (l.fee === 0) return t(l.kind === 2 ? 'cl.pl.car.exch' : l.kind === 3 ? 'cl.pl.car.bos' : 'cl.pl.car.free');
    return l.kind === 1 ? t('cl.pl.car.loan') : '';
  };
  return (
    <div className="cx-pl">
      {real === null && raw.length <= 1 ? <div className="cx-empty">{t('common.loading')}</div> : (
        <div className="cx-tbl-wrap"><table className="cx-tbl cx-career">
          <thead><tr><th /><th /><th /><th className="c-num">{t('col.apps')}</th><th className="c-num">{t('col.goals')}</th><th className="c-num">{t('cl.pl.asts')}</th><th className="c-num" title={t('cl.pl.mom')}>{t('cl.tn.mom')}</th><th className="c-num">{t('col.avr')}</th></tr></thead>
          <tbody>{rows.map((r, i) => {
            const known = !!g.clubs[r.club];
            return (
              <tr key={i}>
                <td className="btn-col"><span className={`cx-lg-pos ${r.now ? 'now' : ''}`}>{season(r.season)}</span></td>
                <td className="cx-career-club">{known ? <span className="link" onClick={() => nav({ name: 'club', id: r.club })}>{g.clubs[r.club].short}</span> : r.name ?? '?'}</td>
                <td className="c-yel cx-career-how">{how(r.lab)}</td>
                <td className="c-num c-yel">{r.apps}</td><td className="c-num c-yel">{r.goals}</td>
                <td className="c-num c-yel">{dash(r.assists)}</td><td className="c-num c-yel">{dash(r.mom)}</td>
                <td className="c-val">{r.avr ? <Rating r={r.avr} digits={2} /> : '----'}</td>
              </tr>
            );
          })}
          {(() => {
            // Total (CM 01/02): alle sæsoner lagt sammen
            const tot = rows.reduce((x, r) => ({ apps: x.apps + r.apps, goals: x.goals + r.goals, assists: x.assists + (r.assists ?? 0), mom: x.mom + (r.mom ?? 0), rs: x.rs + (r.avr ?? 0) * r.apps, rn: x.rn + (r.avr ? r.apps : 0) }), { apps: 0, goals: 0, assists: 0, mom: 0, rs: 0, rn: 0 });
            return <tr className="cx-career-total"><td /><td className="c-cyan">{t('cl.pl.total')}</td><td /><td className="c-num c-cyan">{tot.apps}</td><td className="c-num c-cyan">{tot.goals}</td><td className="c-num c-cyan">{tot.assists || '-'}</td><td className="c-num c-cyan">{tot.mom || '-'}</td><td className="c-val">{tot.rn ? <Rating r={tot.rs / tot.rn} digits={2} /> : '----'}</td></tr>;
          })()}
          </tbody>
        </table></div>
      )}
      {!g.draft && real && real.length > 0 && rebornOn('helpTexts') && <div className="cx-fl-hint">{t(g.dbKind === 'cm0102' ? 'career.sourceCm' : 'career.source')}</div>}
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
  const [bidPanel, setBidPanel] = useState<'buy' | 'loan' | 'change' | null>(null);
  const [bidAsk, setBidAsk] = useState(false);
  const [cmNeg, setCmNeg] = useState<number | null>(null);
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
  const open = approachOpen();
  const closedTip = open ? undefined : t('transfer.windowOpens', { date: dateFmt(nextWindow()) });

  const act = (r: TransferOffer | string) => {
    if (typeof r === 'string') {
      if (r.startsWith('enquiry.') && r !== 'enquiry.human') { setMsg(''); setTab('transfer'); } // svaret står på Transfer-fanen
      else if (r !== 'ok') setMsg(t(r)); else if (!authentic()) setMsg(t('player.done'));
    }
    else if (r.status === 'negotiating') setNeg({ offer: r });
    else setMsg(t('player.bidSent'));
  };

  // Action-menuen: alle handlinger, grupperet
  const items: ActionItem[] = [];
  // CM 01/02 (0x4cbb60 → 0x871424): Promote To Seniors / Relegate To Reserves i en klub med reservehold, Relegate To 'B' Team / Promote To
  // 'A' Team mellem moderklub og B-hold (cmBTeam.ts)
  const move = g.draft || !g.userClub ? 0 : squadMoveOption(g, p, g.userClub);
  const moveItem: ActionItem | null = move === 1 || move === 2
    ? { key: 'res', label: t(move === 2 ? 'cl.pl.relegate' : authentic() ? 'cl.pl.promoteSeniors' : 'cl.pl.callUp'), onClick: () => dispatch({ t: 'reserves', pid: p.id, on: move === 2 }) }
    : move === 3 || move === 4 ? { key: 'bteam', label: t(move === 4 ? 'cl.pl.relegateB' : 'cl.pl.promoteA'), onClick: () => dispatch({ t: 'bTeam', pid: p.id }) } : null;
  if (!g.draft && !mine && moveItem) items.push(moveItem);
  if (!g.draft && mine) {
    // CM 01/02: Set Transfer Status · Offer New Contract · Discipline Player · Release On A Free (listen og leje ligger i Set Transfer Status)
    if (moveItem) items.push(moveItem);
    items.push(
      { key: 'status', label: t('cl.ts.menu'), onClick: () => setStatusOpen(true) },
      { key: 'renew', label: t('cl.pl.offerNew'), onClick: () => setNeg({ renew: p.id }) },
      { key: 'disc', label: t('cl.dp.menu'), disabled: !!p.lastTalk && daysBetween(p.lastTalk, g.date) < 10, title: t('talk.r.tooSoon'), onClick: () => setDiscOpen(true) },
    );
    items.push(
      { key: 'release', label: t('cl.pl.releaseFree'), danger: true, onClick: async () => { if (await askConfirm(t('player.releaseConfirm', { player: `${p.first} ${p.last}`.trim(), club: g.clubs[p.club]?.short ?? '', pay: moneyFull(releaseCost(p)) }), { danger: true, head: t('cl.pl.releaseQ', { player: `${p.first} ${p.last}`.trim() }) })) { if (dispatch<string>({ t: 'release', pid: p.id }) === 'blocked') setMsg(t('transfer.releaseBlocked.body', { player: `${p.first} ${p.last}`.trim(), club: g.clubs[p.club]?.name ?? '' })); else nav({ name: 'squad' }); } } },
      { key: 'nick', label: t(p.realName ? 'cl.pl.editNick' : 'cl.pl.setNick'), onClick: () => setNickOpen(true) },
      { key: 'sep-rep', sep: true },
      { key: 'physio', label: t('cl.pl.physioRep'), disabled: !Object.values(g.staff).some((s) => s.club === g.userClub && s.role === 'physio'), onClick: () => setRepRole('physio') },
      { key: 'coachrep', label: t('cl.pl.coachRep'), disabled: !Object.values(g.staff).some((s) => s.club === g.userClub && (s.role === 'coach' || s.role === 'assistant')), onClick: () => setRepRole('coach') },
    );
  }
  // CM 01/02 (menuen 0x871800): Terminate Loan Deal (0xa85578) for en indlejet spiller og Recall From Loan (0xa85550) for en udlejet – dialogen
  // 0x8fbcc0 spørger først 0x8d0530 (nej → "Cannot recall/terminate …" med beskeden), så bekræftelsen og 0x4ccca0 (src/ui/loanEnd.ts)
  if (canTerminateLoan(p, g.userClub)) items.push({ key: 'terminate', label: t('loan.terminate'), onClick: () => { void askEndLoan(p, true); } });
  if (canRecallLoan(p, g.userClub)) items.push({ key: 'recall', label: t('loan.recall'), onClick: () => { void askEndLoan(p, false); } });
  if (!g.draft && !mine && g.userClub > 0) {
    // CM 01/02: Add To Shortlist · Approach To Buy · Approach To Loan · Scout Player · Set Nickname · — · Create Manager Note · Compare Players
    items.push({ key: 'short', label: shortlisted ? t('cl.pl.unshortlist') : t('cl.pl.shortlist'), onClick: () => dispatch({ t: 'shortlist', pid: p.id, on: !shortlisted }) });
    const pendingBid = cmMarketOn(g) && p.club > 0 ? myPendingBid(p.id) : undefined;
    // CM 01/02 (ejerens billede 154): har klubben accepteret buddet, står der Offer Contract (Set Role At Club → kontraktforhandlingen) og
    // Withdraw Transfer Bid – hverken Approach To Buy/Loan eller Change Transfer Bid
    const agreedBid = cmLogic(g) && p.club > 0 && !pendingBid ? g.offers.find((o) => o.player === p.id && cmTalksOpen(g, o)) : undefined;
    if (agreedBid) {
      const nm = `${p.first} ${p.last}`.trim();
      items.push(
        { key: 'offerContract', label: t('cl.offerContract'), onClick: () => setCmNeg(agreedBid.id) },
        { key: 'withdraw', label: t('cl.pl.withdrawBid'), onClick: async () => { if (await askConfirm(t('cl.pl.withdrawBody', { player: nm }), { head: t('cl.pl.withdrawQ', { player: nm }) })) dispatch({ t: 'withdraw', pid: p.id }); } },
      );
    } else if (pendingBid) {
      // CM 01/02 (ejerens billede 145): mens buddet venter – Withdraw Transfer Bid (0x8f4c70: "Withdraw X transfer bid?" No/Yes) og
      // Change Transfer Bid (budskærmen med buddet, 0x8e9350) i stedet for Approach To Buy/Loan
      const nm = `${p.first} ${p.last}`.trim();
      items.push(
        { key: 'withdraw', label: t('cl.pl.withdrawBid'), onClick: async () => { if (await askConfirm(t('cl.pl.withdrawBody', { player: nm }), { head: t('cl.pl.withdrawQ', { player: nm }) })) dispatch({ t: 'withdraw', pid: p.id }); } },
        { key: 'change', label: t('cl.pl.changeBid'), onClick: () => setBidPanel('change') },
      );
    } else if (p.club > 0) {
      const me = g.clubs[g.userClub];
      items.push(
        { key: 'bid', label: t('cl.pl.approachBuy'), disabled: !open, title: closedTip, onClick: () => setBidPanel('buy') },
        { key: 'loan', label: t('cl.pl.approachLoan'), disabled: !open, title: closedTip, onClick: () => {
          // CM 01/02 Approach To Loan 0x888260 → 0x8f9690 (originalens marked: arbejdstilladelse, 0x8ce990 og can_loan_player 0x8d0040)
          const chk = loanApproach(p.id);
          if (chk && !chk.ok) void askNotice(chk.msg ? t(chk.msg.key, chk.msg.params) : '', { head: t(chk.head === 'offer' ? 'cl.loanr.offerHead' : 'cl.pl.cannotLoan', { player: `${p.first} ${p.last}`.trim() }) });
          else if (!chk && me && loanBlocked(p, me)) void askNotice(t('cl.pl.loanNonEu', { club: me.short }), { head: t('cl.pl.cannotLoan', { player: `${p.first} ${p.last}`.trim() }) });
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
    if (authentic() && cmScoutOn(g)) {
      // CM 01/02 Action → Scout Player (0x889880): status 0x7f8ff0 → besked eller spørgsmålet, Yes → anmodningen 0x7f9290 (cmScout.ts)
      const nm = `${p.first} ${p.last}`.trim();
      items.push({ key: 'scout', label: t('cl.pl.scoutPlayer'), onClick: async () => {
        const st = dispatch<number>({ t: 'scoutStatus', pid: p.id });
        if (st === 2) void askNotice(t('cmsr.a8b1e4'), { head: t('cmsr.a8b1c8') });
        else if (st === 4) void askNotice(t('cmsr.a8b16c'), { head: t('cmsr.a8b1c8') });
        else if (st === 3) void askNotice(t('cmsr.a8b144'), { head: t('cmsr.a8b134') });
        else if (await askConfirm(t(st === 0 ? 'cmsr.a8b3c4' : 'cmsr.a8b36c', { player: nm }), { head: t('cl.pl.scoutPlayer') })) dispatch({ t: 'scoutReq', pid: p.id });
      } });
    } else if (scouts.length > 0 && g.options.masking && k < 100) {
      items.push({ key: 'scout', label: t('cl.pl.scoutPlayer'), sub: scouts.map((s) => ({ key: `sc${s.id}`, label: `${s.first} ${s.last}`, onClick: () => { const r = dispatch<string>({ t: 'scout', staffId: s.id, assignment: { kind: 'player', target: p.id } }); if (r !== 'ok') setMsg(t(r)); else if (!authentic()) setMsg(t('player.scoutSent', { scout: `${s.first} ${s.last}` })); } })) });
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

  const cmNegOffer = cmNeg !== null ? g.offers.find((o) => o.id === cmNeg) : undefined;
  if (cmNegOffer && cmTalksOpen(g, cmNegOffer)) return <div><ClassicNegotiation offer={cmNegOffer} onClose={() => setCmNeg(null)} /></div>;
  if (noteOpen) return <div><Head menu={false} title={`${p.first} ${p.last}`.trim()} /><NotePanel p={p} onClose={() => setNoteOpen(false)} /></div>;
  if (nickOpen) return <div><Head menu={false} title={`${p.first} ${p.last}`.trim()} /><NicknamePanel p={p} onClose={() => setNickOpen(false)} /></div>;
  if (repRole && mine) return <div><Head menu={false} title={`${p.first} ${p.last}`.trim()} /><StaffReportPanel p={p} role={repRole} onClose={() => setRepRole(null)} onDone={() => { setRepRole(null); nav({ name: 'inbox' }); }} /></div>;
  if (discOpen && mine) return <div><Head menu={false} title={`${p.first} ${p.last}`} /><DisciplinePanel p={p} onClose={() => setDiscOpen(false)} onDone={(m) => { setDiscOpen(false); setMsg(m); }} /></div>;
  // CM 01/02: buddet på sin egen side; svaret kommer som en nyhed (udvidet tilstand: klubbens svar med det samme)
  // CM 01/02 (0x8e9760): budskærmen har køberens egen titelbjælke ("Vejle"), bekræftelsen klubbens fulde navn ("Vejle Boldklub")
  const own = authentic() ? g.clubs[g.userClub] : undefined;
  if (bidPanel && !mine) return <div><Head menu={false} club={own?.id} title={own ? (bidAsk ? own.name : own.short) : `${p.first} ${p.last}`} /><BidPanel p={p} loan={bidPanel === 'loan'} change={bidPanel === 'change'} onAsk={setBidAsk} onClose={() => { setBidPanel(null); setBidAsk(false); }} onSent={(o) => {
    setBidPanel(null); setBidAsk(false);
    if (o.status === 'negotiating') setNeg({ offer: o });
    else if (extended()) { dispatch({ t: 'bidNow', offer: o.id }); setBid(o.id); }
    else setMsg(t('player.bidSent'));
  }} /></div>;
  if (statusOpen && mine) return <div><Head menu={false} title={`${p.first} ${p.last}`} /><TransferStatusPanel p={p} onClose={() => setStatusOpen(false)} /></div>;

  return (
    <div>
      <Head title={`${p.first} ${p.last}`} action={<ActionMenu items={items} clubId={p.club || undefined} />} />
      <Tabs tabs={tabs} value={tab} onChange={(v) => setTab(v as Tab)} />
      {/* Discipline Player med den originale database i ægte tilstand giver ingen besked (cmFine.ts – reaktionen er en nyhed) */}
      {msg && tab !== 'history' && !(authentic() && msg === t('player.bidSent')) && <div className="insight">{msg}</div>}
      {/* CM 01/02 viser hverken "Offer sent" eller "Your offer" på spillerens side – svaret kommer som nyhed */}
      {!mine && !authentic() && <MyOffer pid={p.id} onNegotiate={(o) => setNeg({ offer: o })} onOpen={(o) => setBid(o.id)} />}
      {/* ægte CM 01/02: ingen samtale-/løfte-/prøvetræningsbokse på spillerens side (originalens transferanmodning besvares via Respond i indbakken) */}
      {mine && p.complaint && !authentic() && <Complaint pid={p.id} onMsg={setMsg} />}
      {mine && p.playPromise && !authentic() && <div className="insight warn">{t('complaint.promised', { date: dateFmt(p.playPromise.until) })}</div>}
      {mine && p.wantsAway && !authentic() && <WantsAway pid={p.id} onMsg={setMsg} />}
      {!mine && trialOf(p.id) && !authentic() && <div className="insight">🧪 {t('trial.onTrial', { date: dateFmt(trialOf(p.id)!.end) })}</div>}
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
