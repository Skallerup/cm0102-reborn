import { gs } from '../../game/state';
import { hasMatchView } from '../../game/miniReport';
import { useState } from 'react';
import { MAX_FRIENDLIES, friendlyDates, friendlyGate, friendlyOpponents, type FriendlyKind } from '../../game/friendlies';
import { act } from '../../game/actions';
import type { Fixture } from '../../game/types';
import { compName, dateFmt, money, t } from '../../i18n';
import { ClubLink, Crest, Modal, Panel } from '../components';
import { isRetro } from '../theme';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { CxDrop, cxShortDate } from '../classic';
import { authentic, origLogic } from '../../game/rules';
import { OrigFriendlies } from './OrigFriendlies';
import { cmRsvRows } from '../../game/cmReserveMatches';
import { cmFriendlyOn } from '../../game/cmFriendly';
import { FriendlyDates, FriendlyTourClubs, FriendlyTourNations, cmFrCancelRow, cmFrCancellable, cmFrFixtureRows } from './FriendlyClassic';

export function stageLabel(f: Fixture): string {
  if (!f.stage) return `${t('fix.round')} ${f.round}`;
  if (f.stage === 'LP') return `${t('stage.LP')} ${f.round}`;
  if (f.stage.startsWith('G')) return `${t('fix.group')} ${f.stage.slice(1)}`;
  if (f.stage === 'champ' || f.stage === 'releg') return t(`fix.${f.stage}`);
  return t(`stage.${f.stage}`) + (f.leg === 2 ? ` (${t('fix.leg2')})` : f.tieId && gs().comps[f.comp]?.ties.find((x) => x.id === f.tieId)?.legs === 2 ? ` (${t('fix.leg1')})` : '');
}

export function resultStr(f: Fixture) {
  if (!f.result) return '-';
  const r = f.result;
  let s = `${r.hg} - ${r.ag}`;
  if (r.pens) s += ` (${r.pens[0]}-${r.pens[1]} ${t('fix.pens')})`;
  else if (r.et) s += ` ${t('fix.aet')}`;
  return s;
}

export function Fixtures() {
  const { route } = useNav();
  if (isRetro() && route.state?.res) return <ReserveFixturesClassic />;
  return isRetro() ? <ClassicFixtures /> : <ModernFixtures />;
}

/** CM 01/02: reserveholdets kampprogram (0x45ccf0) – kommende og spillede reservekampe (cmReserveMatches.ts: turneringen "Reserve"); uden kampe
 *  "There are no forthcoming reserve matches to be played." (0x45cdff → 0x98f7b8) */
export function ReserveFixturesClassic() {
  const g = useGame()!;
  const { nav } = useNav();
  const rows = cmRsvRows(g, g.userClub);
  if (!rows.length) return (
    <div className="cx-norecent">
      <Head title={t('nav.fixtures')} />
      <div className="cx-norecent-body">{t('cl.res.noFixtures')}</div>
    </div>
  );
  const myNation = g.clubs[g.userClub]?.nation;
  return (
    <div>
      <Head title={t('nav.fixtures')}>
        <button className="cx-greybtn" disabled>{t('cl.fx.prev')}</button>
        <button className="cx-greybtn" disabled>{t('cl.fx.next')}</button>
      </Head>
      <div className="cx-subtitle cx-orig-band">{t('cl.fx.season', { s: `${g.season}/${String((g.season + 1) % 100).padStart(2, '0')}` })}</div>
      <div className="cx-fx cx-fx-orig" data-testid="rsv-fixtures">
        {rows.map((r, i) => {
          const c = g.clubs[r.opp];
          const foreign = c && c.nation !== myNation;
          const win = !r.res ? 0 : Math.sign(r.res[0] - r.res[1]);
          return (
            <div key={`${r.d}${i}`} className="cx-fx-row">
              <span className="cx-fx-date">{cxShortDate(r.d)}</span>
              <span className="cx-fx-opp" onClick={() => c && nav({ name: 'club', id: r.opp })}>{c?.short ?? '?'}</span>
              <span className="cx-fx-nat">{foreign ? g.nations[c.nation]?.code : ''}</span>
              <span className="cx-fx-ha">{r.home ? t('cl.fx.h') : t('cl.fx.a')}</span>
              <span className="cx-fx-comp">{t('cl.res.comp')}</span>
              <span className={`cx-fx-res ${win > 0 ? 'w' : win < 0 ? 'l' : ''}`}>{r.res ? `${r.res[0]}:${r.res[1]}` : '---'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Klassisk tema: "Season 2001/02" og en linje pr. kamp – dato, modstander, land, H/U, turnering og resultat.
 * Kan vise en anden klubs program (fra klubsiden) – så uden eget skærmhoved og venskabskampe. */
export function ClassicFixtures({ clubId, embedded }: { clubId?: number; embedded?: boolean } = {}) {
  const g = useGame()!;
  const cid = clubId ?? g.userClub;
  const mine = cid === g.userClub;
  const { nav } = useNav();
  const [arrange, setArrange] = useState(false);
  // CM 01/02: Cancel aflyser den valgte venskabskamp; Arrange ▾ arrangerer en
  const [picked, setPicked] = useState<string | null>(null);
  const orig = authentic();
  // originalens venskabskampe (FriendlyClassic.tsx): Arrange ▾ Home Friendly / Away Friendly / Tour / Tournament og skærmene bagved
  const cmFr = cmFriendlyOn(g) && mine && !embedded;
  const [arr, setArr] = useRouteState<string>('fxarr', '');
  const [arrNat, setArrNat] = useRouteState<number>('fxnat', -1);
  type Row = { key: string; date: string; opp: number; home?: boolean; comp: string; cup?: boolean; friendly?: boolean; cmFr?: boolean; res?: string; win: number; fid?: number; label?: string; frKind?: 'match' | 'tour'; tour?: number };
  const rows: Row[] = Object.values(g.fixtures).filter((f) => f.home === cid || f.away === cid).map((f) => {
    const home = f.home === cid, r = f.result;
    const my = r ? (home ? r.hg : r.ag) : 0, their = r ? (home ? r.ag : r.hg) : 0;
    const win = !r ? 0 : my > their || (r.pens && (home ? r.pens[0] > r.pens[1] : r.pens[1] > r.pens[0])) ? 1 : my === their ? 0 : -1;
    // originalens venskabskampe (cmFriendly.ts, comp 'FRIENDLY'): "Friendly" som i CM 01/02 (landekoden står ved en udenlandsk modstander)
    const fr = f.comp === 'FRIENDLY';
    return { key: `f${f.id}`, date: f.date, opp: home ? f.away : f.home, home: f.stage === 'F' ? undefined : home, comp: fr ? t('cl.fx.friendly') : `${compName(g.comps[f.comp]?.name) ?? ''}${f.stage && f.stage !== 'LP' ? ` – ${stageLabel(f)}` : ''}`, cup: !fr && g.comps[f.comp]?.type !== 'league', cmFr: fr, res: r ? `${my}:${their}${r.pens ? ` (${home ? r.pens[0] : r.pens[1]}:${home ? r.pens[1] : r.pens[0]} ${t('fix.pens')})` : r.et ? ` ${t('fix.aet')}` : ''}` : undefined, win, fid: f.id };
  });
  if (cmFr) for (const r of cmFrFixtureRows(g, cid)) rows.push({ key: r.key, date: r.date, opp: r.opp, home: r.home, comp: r.comp, cmFr: true, win: 0, label: r.label, frKind: r.kind, tour: r.tour });
  if (mine) for (const fr of g.manager.friendlies ?? []) rows.push({ key: `fr${fr.date}`, date: fr.date, opp: fr.opp, comp: t('cl.fx.friendly'), friendly: true, res: fr.result ? `${fr.result[0]}:${fr.result[1]}` : undefined, win: fr.result ? Math.sign(fr.result[0] - fr.result[1]) : 0, fid: undefined });
  rows.sort((a, b) => a.date.localeCompare(b.date));
  const myNation = g.clubs[cid]?.nation;
  const d = cxShortDate;
  if (cmFr && (arr === 'home' || arr === 'away')) return <FriendlyDates kind={arr} onBack={() => setArr('')} onDone={(ds) => {
    if (act<string>({ t: 'cmFrArrange', date: ds[0], home: arr === 'home' }) === 'ok') { setArr(''); nav({ name: 'nations', state: { ncfr: 1, nctab: 'league', ncnat: g.clubs[g.userClub]?.nation ?? 0 } }); }
  }} />;
  if (cmFr && arr === 'tour') return <FriendlyTourNations onBack={() => setArr('')} onPick={(n) => { setArrNat(n); setArr('tourdates'); }} />;
  if (cmFr && arr === 'tourdates') return <FriendlyDates kind="tour" nation={arrNat} onBack={() => setArr('tour')} onDone={(ds) => { if (act<string>({ t: 'cmFrTour', nation: arrNat, dates: ds }) === 'ok') setArr('tourclubs'); }} />;
  if (cmFr && arr === 'tourclubs') return <FriendlyTourClubs nation={arrNat} onBack={() => setArr('')} />;
  const pickedRow = rows.find((x) => x.key === picked);
  const cancelPicked = () => {
    if (!pickedRow) return;
    if (pickedRow.friendly && !pickedRow.res) act({ t: 'friendlyCancel', date: pickedRow.date });
    else if (pickedRow.frKind) void cmFrCancelRow(g, { kind: pickedRow.frKind, date: pickedRow.date, opp: pickedRow.opp, tour: pickedRow.tour });
    else if (cmFrCancellable(g, pickedRow.fid)) void cmFrCancelRow(g, { kind: 'fixture', date: pickedRow.date, opp: pickedRow.opp, fid: pickedRow.fid });
    setPicked(null);
  };
  const pickable = (r: Row) => (r.friendly && !r.res) || !!r.frKind || (cmFr && cmFrCancellable(g, r.fid));
  return (
    <div>
      {!embedded && <Head title={t('nav.fixtures')}>
        <button className="cx-greybtn" disabled>{t('cl.fx.prev')}</button>
        <button className="cx-greybtn" disabled>{t('cl.fx.next')}</button>
        <span className="grow" />
        {orig ? <>
          <button className="cx-greybtn cx-fx-cancel" disabled={!picked || !mine} onClick={cancelPicked}>{t('cl.fx.cancel')}</button>
          {cmFr
            ? <CxDrop label={t('cl.fx.arrangeMenu')} align="right" className="cx-fx-arrange" items={[
              { key: 'home', label: t('cl.fx.homeFr'), onClick: () => setArr('home') },
              { key: 'away', label: t('cl.fx.awayFr'), onClick: () => setArr('away') },
              { key: 'tour', label: t('cl.fx.tourM'), onClick: () => setArr('tour') },
              { key: 'tournament', label: t('cl.fx.tournament'), disabled: true, onClick: () => undefined },
            ]} />
            : <CxDrop label={t('cl.fx.arrangeMenu')} align="right" items={[{ key: 'fr', label: t('cl.fx.arrFriendly'), disabled: !!g.draft || !g.userClub, onClick: () => setArrange(true) }]} />}
        </> : !g.draft && g.userClub > 0 && <button className="cx-greybtn" onClick={() => setArrange(true)}>{t('cl.fx.arrange')}</button>}
      </Head>}
      <div className={`cx-subtitle ${orig ? 'cx-orig-band' : ''}`}>{t('cl.fx.season', { s: `${g.season}/${String((g.season + 1) % 100).padStart(2, '0')}` })}</div>
      <div className={`cx-fx ${orig ? 'cx-fx-orig' : ''}`}>
        {rows.map((r) => {
          const c = g.clubs[r.opp];
          const foreign = c && c.nation !== myNation;
          const open = hasMatchView(g, r.fid);
          return (
            <div key={r.key} className={`cx-fx-row ${open ? 'clickable' : ''} ${picked === r.key ? 'picked' : ''}`} onClick={() => { if (pickable(r) && !open) setPicked(picked === r.key ? null : r.key); else if (open) nav({ name: 'report', id: r.fid! }); }}>
              <span className="cx-fx-date">{g.draft ? '' : d(r.date)}</span>
              <span className="cx-fx-opp" onClick={(e) => { if (r.label) return; e.stopPropagation(); if (c) nav({ name: 'club', id: r.opp }); }}>{r.label ?? (orig ? c?.short : c?.name) ?? '?'}</span>
              <span className="cx-fx-nat">{foreign && !r.label ? g.nations[c.nation]?.code : ''}</span>
              <span className="cx-fx-ha">{r.home === undefined ? '' : r.home ? t('cl.fx.h') : t('cl.fx.a')}</span>
              <span className={`cx-fx-comp ${r.friendly || r.cmFr ? 'friendly' : r.cup ? 'cup' : ''}`}>{r.comp}</span>
              <span className={`cx-fx-res ${r.win > 0 ? 'w' : r.win < 0 ? 'l' : ''}`}>
                {mine && r.fid === g.pendingFixture ? <button className="small primary" onClick={(e) => { e.stopPropagation(); nav({ name: 'match', id: r.fid! }); }}>{t('top.toTheMatch')}</button> : r.res ?? '---'}
              </span>
            </div>
          );
        })}
      </div>
      {arrange && <Modal title={t('fr.title')} onClose={() => setArrange(false)} wide><FriendliesPanel /></Modal>}
    </div>
  );
}

function ModernFixtures() {
  const g = useGame()!;
  const { nav } = useNav();
  const list = Object.values(g.fixtures).filter((f) => f.home === g.userClub || f.away === g.userClub).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      <Head title={t('nav.fixtures')} />
      {!g.draft && (origLogic() ? <OrigFriendlies /> : <FriendliesPanel />)}
      {!g.draft && <ReservePanel />}
      <Panel className="flush">
        <table className="grid">
          <thead><tr><th>{t('col.date')}</th><th>{t('col.comp')}</th><th>{t('fix.stage')}</th><th>{t('fix.venue')}</th><th>{t('fix.opponent')}</th><th className="center">{t('fix.result')}</th><th></th></tr></thead>
          <tbody>
            {list.map((f) => {
              const home = f.home === g.userClub;
              const opp = home ? f.away : f.home;
              const r = f.result;
              const my = r ? (home ? r.hg : r.ag) : 0, their = r ? (home ? r.ag : r.hg) : 0;
              const cls = !r ? '' : my > their || (r.pens && (home ? r.pens[0] > r.pens[1] : r.pens[1] > r.pens[0])) ? 'good' : my === their ? '' : 'bad';
              return (
                <tr key={f.id} className={g.reports[f.id] ? 'clickable' : ''} onClick={() => g.reports[f.id] && nav({ name: 'report', id: f.id })}>
                  <td>{g.draft ? t('dr.roundN', { n: f.round }) : dateFmt(f.date)}</td>
                  <td>{f.comp === 'FRIENDLY' ? t('cl.fx.friendly') : compName(g.comps[f.comp]?.name)}</td>
                  <td className="muted">{stageLabel(f)}</td>
                  <td>{f.stage === 'F' ? t('fix.neutral') : home ? t('fix.home') : t('fix.away')}</td>
                  <td><ClubLink id={opp} /></td>
                  <td className={`center ${cls}`}><b>{r ? `${home ? r.hg : r.ag} - ${home ? r.ag : r.hg}` : '-'}</b>{r?.pens ? ` (${home ? r.pens[0] : r.pens[1]} - ${home ? r.pens[1] : r.pens[0]} ${t('fix.pens')})` : r?.et ? ` ${t('fix.aet')}` : ''}</td>
                  <td>{g.reports[f.id] && <span className="muted">{t('fix.report')} ›</span>}{f.id === g.pendingFixture && <button className="small primary" onClick={() => nav({ name: 'match', id: f.id })}>{t('top.toTheMatch')}</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

/** Reserveholdets kampe (moderne udseende): kommende og spillede reservekampe, nyeste først – kun med reservekampene (g.cmRsv) */
function ReservePanel() {
  const g = useGame()!;
  const rows = cmRsvRows(g, g.userClub);
  if (!g.cmRsv || !rows.length) return null;
  return (
    <Panel title={t('cl.res.full', { club: g.clubs[g.userClub]?.name ?? '' })} className="flush">
      <table className="grid" data-testid="rsv-panel">
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.d}${i}`}>
              <td>{dateFmt(r.d)}</td><td>{t('cl.res.comp')}</td><td>{r.home ? t('fix.home') : t('fix.away')}</td><td><ClubLink id={r.opp} /></td>
              <td className="center"><b>{r.res ? `${r.res[0]} - ${r.res[1]}` : '-'}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/** Venskabskampe: vælg dato og en nem modstander eller en storklub */
function FriendliesPanel() {
  const g = useGame()!;
  const [kind, setKind] = useState<FriendlyKind>('easy');
  const [date, setDate] = useState('');
  const [opps, setOpps] = useState<number[]>([]);
  const [picked, setPicked] = useState(false);
  const [msg, setMsg] = useState('');
  const dates = friendlyDates();
  const list = (g.manager.friendlies ?? []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = list.filter((x) => !x.done), played = list.filter((x) => x.done).slice(-3).reverse();
  const pick = (k: FriendlyKind) => { setKind(k); setPicked(true); setOpps(friendlyOpponents(k).map((c) => c.id)); };
  if (!g.userClub) return null;
  return (
    <Panel title={t('fr.title')}>
      <p className="muted" style={{ marginTop: 0 }}>{t('fr.intro')}</p>
      {upcoming.map((fr) => (
        <div key={fr.date} className="row fr-row">
          <b>{dateFmt(fr.date)}</b><span>{t('fr.vs')} <ClubLink id={fr.opp} /></span><span className={`tag ${fr.kind === 'big' ? 'warn' : 'good'}`}>{t(`fr.kind.${fr.kind}`)}</span>
          <button className="small" onClick={() => act({ t: 'friendlyCancel', date: fr.date })}>{t('fr.cancel')}</button>
        </div>
      ))}
      {played.map((fr) => <div key={fr.date} className="row fr-row muted"><span>{dateFmt(fr.date)}</span><span>{t('fr.vs')} {g.clubs[fr.opp]?.name}</span><b>{fr.result?.join('-')}</b></div>)}
      {upcoming.length < MAX_FRIENDLIES && (dates.length === 0 ? <div className="insight warn">{t('fr.noDates')}</div> : (
        <div className="col" style={{ marginTop: 8, gap: 8 }}>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div className="seg">
              <button className={kind === 'easy' && opps.length ? 'on' : ''} onClick={() => pick('easy')}>{t('fr.kind.easy')}</button>
              <button className={kind === 'big' && opps.length ? 'on' : ''} onClick={() => pick('big')}>{t('fr.kind.big')}</button>
            </div>
            <select value={date} onChange={(e) => setDate(e.target.value)}>
              <option value="">{t('fr.pickDate')}</option>
              {dates.map((d) => <option key={d} value={d}>{dateFmt(d)}</option>)}
            </select>
          </div>
          {opps.length > 0 && <div className="muted" style={{ fontSize: 12.5 }}>{t(`fr.kind.${kind}.desc`)}</div>}
          {picked && opps.length === 0 && <div className="insight warn">{t('fr.noOpps')}</div>}
          <div className="fr-opps">
            {opps.map((id) => {
              const c = g.clubs[id];
              return (
                <button key={id} className="fr-opp" disabled={!date} onClick={() => { const r = act<string>({ t: 'friendly', opp: id, date, kind }); setMsg(r === 'ok' ? '' : t(`fr.err.${r}`)); setOpps([]); setDate(''); }}>
                  <Crest id={id} size={26} /><b>{c.name}</b><span className="muted">{t('fr.gate', { fee: money(friendlyGate(c)) })}</span>
                </button>
              );
            })}
          </div>
          {opps.length > 0 && !date && <div className="muted" style={{ fontSize: 12 }}>{t('fr.pickDateFirst')}</div>}
        </div>
      ))}
      {msg && <div className="insight bad">{msg}</div>}
    </Panel>
  );
}
