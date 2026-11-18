// CM 01/02's venskabskampe for mennesket (club_screens.cpp, kun den originale database i ægte tilstand – cmFriendlyOffers.ts):
//   Fixtures → Arrange ▾ Home Friendly (3) / Away Friendly (4) / Tour (0xb) / Tournament (0xa – ikke porteret, grå)  (0x45f380/0x4691d0)
//   datoskærmen "Arrange Friendly At Home" / "Select Date" med en linje pr. dag og Cancel/Next              (0x470400/0x470fe0)
//   turnéens lande "Arrange Friendly Tour" / "Select Nation" med Filter Available Only / All Nations         (0x471a90/0x472180)
//   turnéens klubber "Arrange Tour Of {land}"                                                                (0x472380/0x472850)
//   klubskærmens "Invite Club" → Please Confirm "Invite … for a friendly match on … ?" / "Challenge … ?"     (0x482a40/0x482d10)
import { useState } from 'react';
import type { GameState, NewsItem } from '../../game/types';
import { act } from '../../game/actions';
import { cmFriendlyOn, cmNationFrOf } from '../../game/cmFriendly';
import {
  FRIENDLY_COMP, cmFrDateStatus, cmFrInviteCheck, cmFrInviteKind, cmFrProposalOpen, cmFrTourNations, frDn, frIso, invitedOf,
} from '../../game/cmFriendlyOffers';
import { fixturesOn } from '../../game/state';
import { compName, dateFmt, natName, t } from '../../i18n';
import { askConfirm, askNotice } from '../confirm';
import { cxShortDate } from '../classic';
import { useGame, useNav } from '../core';
import { Head } from './common';

/** Fixtures-linjerne for tilbuddene (status 5 "{klub} ?") og turnéens datoer uden kamp (status 6 "Tba" "Tour Of …") – 0x45fd02/0x45ff24 */
export interface FrRow { key: string; date: string; opp: number; home?: boolean; comp: string; label?: string; kind: 'match' | 'tour'; tour?: number }
export function cmFrFixtureRows(g: GameState, cid: number): FrRow[] {
  if (!cmFriendlyOn(g) || !g.cmFrH) return [];
  const out: FrRow[] = [];
  for (const m of g.cmFrH.m) {
    if (!m.home || !m.away || (m.home !== cid && m.away !== cid)) continue;
    const opp = m.home === cid ? m.away : m.home;
    out.push({ key: `m${m.d}${opp}`, date: m.d, opp, home: m.home === cid, comp: t('cl.fx.friendly'), label: t('cl.fx.q', { club: g.clubs[opp]?.short ?? '?' }), kind: 'match' });
  }
  g.cmFrH.t.forEach((tr, i) => {
    if (tr.club !== cid) return;
    for (const s of tr.slots) {
      if (fixturesOn(s.d).some((id) => { const f = g.fixtures[id]; return f && (f.home === cid || f.away === cid); })) continue;
      if (out.some((r) => r.date === s.d)) continue;
      out.push({ key: `t${i}${s.d}`, date: s.d, opp: 0, home: false, comp: t('cl.fx.tourOf', { nation: natName(g.nations[tr.nation]?.name) }), label: t('cl.fx.tba'), kind: 'tour', tour: i });
    }
  });
  return out;
}

/** Cancel på Fixtures (0x4691d0 knapperne 0x15–0x17): bekræft og aflys */
export async function cmFrCancelRow(g: GameState, row: { kind: 'fixture' | 'match' | 'tour'; date: string; opp: number; fid?: number; tour?: number }): Promise<void> {
  const club = g.clubs[row.opp]?.name ?? '';
  const date = dateFmt(row.date);
  if (row.kind === 'fixture') {
    if (await askConfirm(t('cl.fr.cancelQ', { club, date }), { title: t('cl.fr.cancelTitle'), colored: true })) act({ t: 'cmFrCancel', fixture: row.fid });
  } else if (row.kind === 'match') {
    if (await askConfirm(t('cl.fr.cancelPropQ', { club, date }), { title: t('cl.fr.cancelTitle'), colored: true })) act({ t: 'cmFrCancel', match: row.date });
  } else {
    const tr = g.cmFrH?.t[row.tour ?? -1];
    if (!tr) return;
    const start = tr.slots[0]?.d ?? row.date;
    const q = start < g.date ? 'cl.fr.cancelTourQ2' : 'cl.fr.cancelTourQ';
    if (await askConfirm(t(q, { nation: natName(g.nations[tr.nation]?.name), date: dateFmt(start) }), { title: t('cl.fr.cancelTourTitle'), colored: true })) act({ t: 'cmFrCancel', tour: row.tour });
  }
}

/** en venskabskamp kan aflyses (0x45fbc9: turneringen er Friendly, og datoen er efter i dag) */
export const cmFrCancellable = (g: GameState, fid: number | undefined) => {
  const f = fid !== undefined ? g.fixtures[fid] : undefined;
  return !!f && f.comp === FRIENDLY_COMP && !f.result && f.date > g.date && cmFriendlyOn(g);
};

const ROWS = 14;        // *estimeret*: linjer pr. side (originalen: (0x207 − top) / linjehøjden)
const PAGES = 26;       // *estimeret*: sider frem (et år)

/** Datoskærmen 0x470400/0x470fe0. Home/Away: én dato; Tour: op til 10 (0x47154c), sorteret (0x4877c0). */
export function FriendlyDates({ kind, nation, onBack, onDone }: { kind: 'home' | 'away' | 'tour'; nation?: number; onBack: () => void; onDone: (dates: string[]) => void }) {
  const g = useGame()!;
  const [page, setPage] = useState(1);
  const [chosen, setChosen] = useState<number[]>([]);
  const club = g.userClub;
  const today = frDn(g.date);
  const tour = kind === 'tour';
  const title = kind === 'home' ? t('cl.fr.arrHome') : kind === 'away' ? t('cl.fr.arrAway') : t('cl.fr.arrTourOf', { nation: natName(g.nations[nation ?? -1]?.name) });
  const rows = [];
  for (let i = 0; i < ROWS; i++) {
    const d = today + (page - 1) * ROWS + i;
    const iso = frIso(d);
    // 0x4707c8: klubbens kamp den dag (0x5acbe0) står som i Fixtures
    const fx = fixturesOn(iso).map((id) => g.fixtures[id]).find((f) => f && (f.home === club || f.away === club));
    if (fx) {
      const home = fx.home === club, opp = home ? fx.away : fx.home;
      rows.push(<div key={iso} className="cx-fx-row cx-frd-row"><span className="cx-fx-date">{cxShortDate(iso)}</span><span className="cx-fx-opp">{g.clubs[opp]?.short ?? '?'}</span><span className="cx-fx-nat" /><span className="cx-fx-ha">{home ? t('cl.fx.h') : t('cl.fx.a')}</span><span className={`cx-fx-comp ${fx.comp === FRIENDLY_COMP ? 'friendly' : ''}`}>{fx.comp === FRIENDLY_COMP ? t('cl.fx.friendly') : compName(g.comps[fx.comp]?.name)}</span><span className="cx-fx-res">---</span></div>);
      continue;
    }
    const st = cmFrDateStatus(g, club, d, chosen, tour);
    const click = st.s === 1 ? () => setChosen(tour ? (chosen.length >= 10 ? chosen : [...chosen, d].sort((a, b) => a - b)) : [d])
      : st.s === 4 ? () => setChosen(chosen.filter((x) => x !== d)) : undefined;
    let body;
    if (st.s === 5 && st.m) {
      const opp = st.m.home === club ? st.m.away : st.m.home;
      body = <><span className="cx-fx-opp">{t('cl.fx.q', { club: g.clubs[opp]?.short ?? '?' })}</span><span className="cx-fx-nat" /><span className="cx-fx-ha">{st.m.home === club ? t('cl.fx.h') : t('cl.fx.a')}</span><span className="cx-fx-comp friendly">{t('cl.fx.friendly')}</span><span className="cx-fx-res">---</span></>;
    } else if (st.s === 6 && st.t) {
      body = <><span className="cx-fx-opp">{t('cl.fx.tba')}</span><span className="cx-fx-nat" /><span className="cx-fx-ha">{t('cl.fx.a')}</span><span className="cx-fx-comp friendly">{t('cl.fx.tourOf', { nation: natName(g.nations[st.t.nation]?.name) })}</span><span className="cx-fx-res">---</span></>;
    } else {
      const txt = st.s === 1 ? t('cl.fr.avail') : st.s === 4 ? t('cl.fr.selected') : t('cl.fr.unavail');
      body = <><span className={`cx-frd-st s${st.s}`}>{txt}</span><span className="cx-fx-res">---</span></>;
    }
    rows.push(<div key={iso} className={`cx-fx-row cx-frd-row ${click ? 'clickable' : ''}`} data-frd={st.s} onClick={click}><span className="cx-fx-date">{cxShortDate(iso)}</span>{body}</div>);
  }
  return (
    <div className="cx-frd">
      <Head title={title} club={g.userClub} />
      <div className="cx-subtitle cx-orig-band">{tour ? t('cl.fr.selDates') : t('cl.fr.selDate')}</div>
      <div className="cx-frd-pages">
        <button className="cx-greybtn" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 10))}>{'<<'}</button>
        <button className="cx-greybtn" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>{'<'}</button>
        <button className="cx-greybtn" disabled={page >= PAGES} onClick={() => setPage(Math.min(PAGES, page + 1))}>{'>'}</button>
        <button className="cx-greybtn" disabled={page >= PAGES} onClick={() => setPage(Math.min(PAGES, page + 10))}>{'>>'}</button>
      </div>
      <div className="cx-fx cx-fx-orig">{rows}</div>
      <div className="cx-ts-buttons cx-dlg-foot cx-frd-foot">
        <button onClick={onBack}>{tour ? t('common.back') : t('common.cancel')}</button>
        <button className="primary cx-frd-next" disabled={!chosen.length} onClick={() => onDone(chosen.map(frIso))}>{t('top.next')}</button>
      </div>
    </div>
  );
}

/** "Arrange Friendly Tour" / "Select Nation" (0x471a90): Filter ▸ Available Only / All Nations; de utilgængelige står grå */
export function FriendlyTourNations({ onBack, onPick }: { onBack: () => void; onPick: (nation: number) => void }) {
  const g = useGame()!;
  const [only, setOnly] = useState(true);
  const list = cmFrTourNations(g, (n) => cmNationFrOf(g)[n]).filter((x) => !only || x.ok);
  const half = Math.ceil(list.length / 2);
  const col = (l: typeof list) => <div className="cx-nc-col">{l.map((x) => (
    <div key={x.nation} className="cx-nc-row">{x.ok ? <span className="cx-link" role="link" onClick={() => onPick(x.nation)}>{natName(g.nations[x.nation]?.name)}</span> : <span className="cx-muted">{natName(g.nations[x.nation]?.name)}</span>}<span className="code">{g.nations[x.nation]?.code}</span></div>
  ))}</div>;
  return (
    <div className="cx-nc cx-frt">
      <Head title={t('cl.fr.tourTitle')} club={g.userClub}>
        <span className="cx-frt-filter">{t('cl.fr.filter')}</span>
        <button className={`cx-greybtn ${only ? 'on' : ''}`} onClick={() => setOnly(true)}>{t('cl.fr.availOnly')}</button>
        <button className={`cx-greybtn ${!only ? 'on' : ''}`} onClick={() => setOnly(false)}>{t('cl.fr.allNations')}</button>
      </Head>
      <div className="cx-subtitle cx-orig-band">{t('cl.fr.selNation')}</div>
      <div className="cx-nc-list cx-listpanel">{list.length ? <>{col(list.slice(0, half))}{col(list.slice(half))}</> : <div className="cx-empty">{t('common.none')}</div>}</div>
      <div className="cx-ts-buttons cx-dlg-foot"><button onClick={onBack}>{t('common.cancel')}</button><button disabled>{t('top.next')}</button></div>
    </div>
  );
}

/** "Arrange Tour Of {land}" (0x472380): landets klubber; et klik åbner klubskærmen, hvor "Invite Club" sidder */
export function FriendlyTourClubs({ nation, onBack }: { nation: number; onBack: () => void }) {
  const g = useGame()!;
  const { nav } = useNav();
  const clubs = Object.values(g.clubs).filter((c) => c.nation === nation && c.id !== g.userClub).sort((a, b) => a.short.localeCompare(b.short, t('cl.locale')));
  const half = Math.ceil(clubs.length / 2);
  const col = (l: typeof clubs) => <div className="cx-nc-col">{l.map((c) => (
    <div key={c.id} className="cx-nc-row"><span className="cx-link" role="link" onClick={() => nav({ name: 'club', id: c.id })}>{c.short}</span><span className="code">{g.nations[c.nation]?.code}</span></div>
  ))}</div>;
  return (
    <div className="cx-nc cx-frc">
      <Head title={t('cl.fr.arrTourOf', { nation: natName(g.nations[nation]?.name) })} club={g.userClub} />
      <div className="cx-nc-list cx-listpanel">{clubs.length ? <>{col(clubs.slice(0, half))}{col(clubs.slice(half))}</> : <div className="cx-empty">{t('common.none')}</div>}</div>
      <div className="cx-ts-buttons cx-dlg-foot"><button onClick={onBack}>{t('common.cancel')}</button><button disabled>{t('top.next')}</button></div>
    </div>
  );
}

/** Klubskærmens "Invite Club" (0x482a40 → 0x482d10 handling 0x66/0x67) */
export function friendlyInviteFor(g: GameState, club: number): boolean {
  return cmFriendlyOn(g) && !!cmFrInviteKind(g, club);
}
export async function friendlyInvite(g: GameState, club: number): Promise<void> {
  const chk = cmFrInviteCheck(g, club);
  if (!chk) return;
  const name = g.clubs[club]?.name ?? '';
  const date = dateFmt(chk.date);
  const ttl = t(chk.home ? 'cl.fr.inviteTitle' : 'cl.fr.offerTitle');
  if (!chk.ok) { await askNotice(t('cl.fr.unavailQ', { club: name, date }), { head: t('cl.fr.unavailHead') }); return; }
  if (await askConfirm(t(chk.home ? 'cl.fr.inviteQ' : 'cl.fr.challengeQ', { club: name, date }), { title: ttl, colored: true })) act({ t: 'cmFrInvite', club });
}

/** Indbakkens Respond på "… friendly proposal" (invitationsskærmen 0x474280/0x4744b0: Friendly Match / Invitation) */
export function friendlyProposalOpen(g: GameState, n: NewsItem): boolean {
  if (n.key !== 'cmfr.proposal' || n.link?.kind !== 'club') return false;
  return cmFrProposalOpen(g, String(n.params?.date ?? ''), Number(n.link.id));
}
export async function friendlyAnswer(g: GameState, n: NewsItem): Promise<void> {
  const org = Number(n.link?.id ?? 0), date = String(n.params?.date ?? '');
  const m = g.cmFrH?.m.find((x) => x.st === 2 && x.org === org && x.d === date && invitedOf(x) === g.userClub);
  if (!m) { await askNotice(t('cl.fr.invGone'), { head: t('cl.fr.invHead') }); return; }
  const yes = await askConfirm(t('cl.fr.invQ', { club: g.clubs[org]?.name ?? '', date: dateFmt(date) }), { title: t('cl.fr.invTitle'), head: t('cl.fr.invHead'), colored: true });
  const r = act<string>({ t: 'cmFrAnswer', date, org, yes });
  if (r === 'unavailable') await askNotice(t('cl.fr.invUnavail', { club: g.clubs[g.userClub]?.name ?? '' }), { head: t('cl.fr.invHead') });
}
