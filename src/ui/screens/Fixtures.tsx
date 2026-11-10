import { gs } from '../../game/state';
import { useState } from 'react';
import { MAX_FRIENDLIES, friendlyDates, friendlyGate, friendlyOpponents, type FriendlyKind } from '../../game/friendlies';
import { act } from '../../game/actions';
import type { Fixture } from '../../game/types';
import { compName, dateFmt, money, t } from '../../i18n';
import { ClubLink, Crest, Modal, Panel } from '../components';
import { isRetro } from '../theme';
import { useGame, useNav } from '../core';
import { Head } from './common';
import { cxShortDate } from '../classic';

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
  return isRetro() ? <ClassicFixtures /> : <ModernFixtures />;
}

/** Klassisk tema: "Season 2001/02" og en linje pr. kamp – dato, modstander, land, H/U, turnering og resultat.
 * Kan vise en anden klubs program (fra klubsiden) – så uden eget skærmhoved og venskabskampe. */
export function ClassicFixtures({ clubId, embedded }: { clubId?: number; embedded?: boolean } = {}) {
  const g = useGame()!;
  const cid = clubId ?? g.userClub;
  const mine = cid === g.userClub;
  const { nav } = useNav();
  const [arrange, setArrange] = useState(false);
  type Row = { key: string; date: string; opp: number; home?: boolean; comp: string; cup?: boolean; friendly?: boolean; res?: string; win: number; fid?: number };
  const rows: Row[] = Object.values(g.fixtures).filter((f) => f.home === cid || f.away === cid).map((f) => {
    const home = f.home === cid, r = f.result;
    const my = r ? (home ? r.hg : r.ag) : 0, their = r ? (home ? r.ag : r.hg) : 0;
    const win = !r ? 0 : my > their || (r.pens && (home ? r.pens[0] > r.pens[1] : r.pens[1] > r.pens[0])) ? 1 : my === their ? 0 : -1;
    return { key: `f${f.id}`, date: f.date, opp: home ? f.away : f.home, home: f.stage === 'F' ? undefined : home, comp: `${compName(g.comps[f.comp]?.name) ?? ''}${f.stage && f.stage !== 'LP' ? ` – ${stageLabel(f)}` : ''}`, cup: g.comps[f.comp]?.type !== 'league', res: r ? `${my}:${their}${r.pens ? ` (${t('fix.pens')})` : r.et ? ` ${t('fix.aet')}` : ''}` : undefined, win, fid: f.id };
  });
  if (mine) for (const fr of g.manager.friendlies ?? []) rows.push({ key: `fr${fr.date}`, date: fr.date, opp: fr.opp, comp: t('cl.fx.friendly'), friendly: true, res: fr.result ? `${fr.result[0]}:${fr.result[1]}` : undefined, win: fr.result ? Math.sign(fr.result[0] - fr.result[1]) : 0, fid: undefined });
  rows.sort((a, b) => a.date.localeCompare(b.date));
  const myNation = g.clubs[cid]?.nation;
  const d = cxShortDate;
  return (
    <div>
      {!embedded && <Head title={t('nav.fixtures')}>
        <button className="cx-greybtn" disabled>{t('cl.fx.prev')}</button>
        <button className="cx-greybtn" disabled>{t('cl.fx.next')}</button>
        <span className="grow" />
        {!g.draft && g.userClub > 0 && <button className="cx-greybtn" onClick={() => setArrange(true)}>{t('cl.fx.arrange')}</button>}
      </Head>}
      <div className="cx-subtitle">{t('cl.fx.season', { s: `${g.season}/${String((g.season + 1) % 100).padStart(2, '0')}` })}</div>
      <div className="cx-fx">
        {rows.map((r) => {
          const c = g.clubs[r.opp];
          const foreign = c && c.nation !== myNation;
          const open = r.fid !== undefined && !!g.reports[r.fid];
          return (
            <div key={r.key} className={`cx-fx-row ${open ? 'clickable' : ''}`} onClick={() => open && nav({ name: 'report', id: r.fid! })}>
              <span className="cx-fx-date">{g.draft ? '' : d(r.date)}</span>
              <span className="cx-fx-opp" onClick={(e) => { e.stopPropagation(); if (c) nav({ name: 'club', id: r.opp }); }}>{c?.name ?? '?'}</span>
              <span className="cx-fx-nat">{foreign ? g.nations[c.nation]?.code : ''}</span>
              <span className="cx-fx-ha">{r.home === undefined ? '' : r.home ? t('cl.fx.h') : t('cl.fx.a')}</span>
              <span className={`cx-fx-comp ${r.friendly ? 'friendly' : r.cup ? 'cup' : ''}`}>{r.comp}</span>
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
      {!g.draft && <FriendliesPanel />}
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
                  <td>{compName(g.comps[f.comp]?.name)}</td>
                  <td className="muted">{stageLabel(f)}</td>
                  <td>{f.stage === 'F' ? t('fix.neutral') : home ? t('fix.home') : t('fix.away')}</td>
                  <td><ClubLink id={opp} /></td>
                  <td className={`center ${cls}`}><b>{r ? `${home ? r.hg : r.ag} - ${home ? r.ag : r.hg}` : '-'}</b>{r?.pens ? ` (${t('fix.pens')})` : r?.et ? ` ${t('fix.aet')}` : ''}</td>
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
