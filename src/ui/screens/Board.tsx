// Bestyrelsen: tillid og forventning samlet ét sted – plus ønsker man kan stille (budget, byggeri og fire andre).
import { useState } from 'react';
import { act } from '../../game/actions';
import { boardAskInfo } from '../../game/board';
import { CAMP_DESTS, campCost, campWindows, type CampDest } from '../../game/camp';
import type { BoardAsk } from '../../game/types';
import { dateFmt, money, t } from '../../i18n';
import { Bar, Panel } from '../components';
import { gs } from '../../game/state';
import { useGame, useNav, useRouteState } from '../core';
import { isRetro } from '../theme';
import { Info } from '../help';
import { Head } from './common';
import { authentic } from '../../game/rules';

const ASKS: BoardAsk[] = ['lowerExp', 'confidenceVote', 'youthDrive'];

export function BoardScreen() {
  return isRetro() ? <ClassicBoard /> : <ModernBoard />;
}

function ModernBoard() {
  const g = useGame()!;
  const conf = Math.round(g.board.confidence);
  const tone = conf >= 60 ? 'good' : conf >= 35 ? 'warn' : 'bad';
  return (
    <div>
      <Head title={<>{t('nav.board')}<Info topic="board" /></>} />
      <div className="cols">
        <Panel title={t('ba.status')}>
          <div className="kv">
            <span>{t('ba.confidence')}</span><span><Bar value={conf} max={100} /> <b className={tone}>{conf}/100</b></span>
            <span>{t('club.expectation')}</span><span className="accent">{t(`exp.${g.board.expectation}`)} ({t('jobs.pos', { pos: g.board.expectedPos })})</span>
            <span>{t('ba.warnings')}</span><span className={g.board.warnings ? 'bad' : 'good'}>{g.board.warnings ? t('ba.warningsN', { n: g.board.warnings }) : t('ba.noWarnings')}</span>
          </div>
          <p className="muted">{t('ba.explain')}</p>
        </Panel>
        <MoneyPanel />
      </div>
      <CampPanel />
      <BoardAsks />
    </div>
  );
}

function MoneyPanel() {
  const { nav } = useNav();
  return (
    <Panel title={t('ba.money')}>
      <p className="muted" style={{ marginTop: 0 }}>{t('ba.moneyHint')}</p>
      <div className="row">
        <button onClick={() => nav({ name: 'finance', tab: 'overview' })}>{t('ba.toBudget')}</button>
        <button onClick={() => nav({ name: 'finance', tab: 'facilities' })}>{t('ba.toProjects')}</button>
      </div>
    </Panel>
  );
}

/** Ønsker til bestyrelsen (lavere forventninger, tillidsafstemning, ungdomssatsning) */
function BoardAsks() {
  if (authentic()) return null; // ægte CM 01/02: ikke i originalen
  const [answer, setAnswer] = useState<Partial<Record<BoardAsk, string>>>({});
  return (
      <div className="ba-grid">
        {ASKS.map((k) => {
          const info = boardAskInfo(k);
          const res = answer[k];
          return (
            <Panel key={k} title={t(`ba.${k}`)}>
              <p className="ba-desc">{t(`ba.${k}.desc`)}</p>
              {info.cost !== undefined && <div className="kv"><span>{t('ba.cost')}</span><span><b>{money(info.cost)}</b></span></div>}
              {!info.blocked && (
                <>
                  <div className="row" style={{ gap: 4, margin: '8px 0' }}>
                    {info.pros.map((x) => <span key={x} className="tag good">{t(x)}</span>)}
                    {info.cons.map((x) => <span key={x} className="tag bad">{t(x)}</span>)}
                  </div>
                  <div className="row">
                    <button className="primary" disabled={!!res} onClick={() => setAnswer({ ...answer, [k]: act<string>({ t: 'boardAsk', kind: k }) })}>{t('ba.ask')}</button>
                    {!res && <span className={`tag ${info.likely === 'yes' ? 'good' : info.likely === 'maybe' ? 'warn' : 'bad'}`}>{t(`ba.likely.${info.likely}`)}</span>}
                  </div>
                </>
              )}
              {res && <div className={`insight ${res === 'yes' ? 'good' : 'bad'}`}>{t(res === 'yes' ? `ba.yes.${k}.short` : res === 'no' ? 'ba.no.short' : 'ba.blocked.generic')}</div>}
              {info.blocked && !res && <div className="muted">{t(info.blocked)}</div>}
            </Panel>
          );
        })}
      </div>
  );
}

/** Bestyrelsens udtalelse i klassisk stil: tillid, forventning, advarsler og økonomi i hele sætninger */
function boardStatement(): string[] {
  const g = gs();
  const club = g.clubs[g.userClub];
  const conf = g.board.confidence;
  const lvl = conf >= 75 ? 'delighted' : conf >= 58 ? 'positive' : conf >= 45 ? 'satisfied' : conf >= 30 ? 'concerned' : 'angry';
  const out = [t(`cl.ba.conf.${lvl}`, { club: club?.name ?? '' })];
  out.push(t('cl.ba.expect', { exp: t(`exp.${g.board.expectation}`), pos: g.board.expectedPos }));
  if (g.board.warnings) out.push(t('cl.ba.warnings', { n: g.board.warnings }));
  const bal = club?.balance ?? 0;
  out.push(t(bal >= 0 ? 'cl.ba.fin.secure' : bal > -5_000_000 ? 'cl.ba.fin.stretched' : 'cl.ba.fin.debt'));
  return out;
}

/** Klassisk tema: klubbens navn i titlen, "Board Confidence" som overskrift og udtalelsen i stor tekst */
function ClassicBoard() {
  const [view, setView] = useRouteState<'confidence' | 'request' | 'camp'>('bview', 'confidence');
  const views: ['confidence' | 'request' | 'camp', string][] = [['confidence', t('cl.ba.confidence')], ['request', t('cl.ba.request')], ['camp', t('camp.title')]];
  return (
    <div>
      <Head title={t('nav.board')}>
        {views.filter(([k]) => k !== view).map(([k, l]) => <button key={k} className="cx-greybtn" onClick={() => setView(k)}>{l}</button>)}
      </Head>
      <div className="cx-subtitle">{views.find(([k]) => k === view)?.[1]}</div>
      {view === 'confidence' && (
        <div className="cx-statement">
          {boardStatement().map((x) => <p key={x}>{x}</p>)}
        </div>
      )}
      {view === 'request' && <><BoardAsks /><MoneyPanel /></>}
      {view === 'camp' && <CampPanel />}
    </div>
  );
}

const DESTS: CampDest[] = ['sun', 'alps', 'home', 'tour'];

/** Træningslejr: vælg en periode uden kampe og en destination – rapporten kommer, når holdet er hjemme */
function CampPanel() {
  if (authentic()) return null; // ægte CM 01/02: ikke i originalen
  const g = useGame()!;
  const c = g.clubs[g.userClub];
  const windows = campWindows();
  const [start, setStart] = useState(windows[0]?.start ?? '');
  const [msg, setMsg] = useState('');
  const camp = c.camp;
  const m = Number((start || g.date).slice(5, 7));
  const plan = (dest: CampDest) => {
    const r = act<string>({ t: 'camp', dest, start });
    setMsg(t(`camp.res.${r}`));
  };
  return (
    <Panel title={t('camp.title')}>
      {camp && camp.status !== 'done' ? (
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <span className={`tag ${camp.status === 'running' ? 'good' : 'warn'}`}>{t(`camp.status.${camp.status}`)}</span>
          <b>{t(`camp.dest.${camp.dest}`)}</b>
          <span className="muted">{dateFmt(camp.start)} – {dateFmt(camp.end)} · {money(camp.cost)}</span>
          {camp.status === 'planned' && <button className="small" onClick={() => { act({ t: 'campCancel' }); setMsg(''); }}>{t('camp.cancel')}</button>}
        </div>
      ) : (
        <>
          <p className="muted" style={{ marginTop: 0 }}>{t('camp.intro')}</p>
          {camp?.report && <div className="insight">{t('camp.lastReport', { dest: t(`camp.dest.${camp.dest}`), date: dateFmt(camp.end) })}</div>}
          {windows.length === 0 ? <div className="insight warn">{t('camp.noWindow')}</div> : (
            <>
              <div className="row" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
                <b>{t('camp.period')}</b>
                <div className="seg">
                  {windows.map((w) => <button key={w.start} className={start === w.start ? 'on' : ''} onClick={() => setStart(w.start)}>{dateFmt(w.start)} – {dateFmt(w.end)}</button>)}
                </div>
                <span className="muted">{t('camp.gap', { n: windows.find((w) => w.start === start)?.gap ?? 0 })}</span>
              </div>
              <div className="camp-grid">
                {DESTS.map((d) => {
                  const fx = CAMP_DESTS[d];
                  const off = fx.summerOnly && !(m === 6 || m === 7 || m === 1);
                  return (
                    <div key={d} className={`camp-card ${off ? 'off' : ''}`}>
                      <b>{t(`camp.dest.${d}`)}</b>
                      <span className="muted">{t(`camp.desc.${d}`)}</span>
                      <div className="row" style={{ gap: 4 }}>
                        <span className="tag">{t('camp.fx.morale', { n: fx.morale })}</span>
                        <span className="tag">{t('camp.fx.cond', { n: (fx.cond > 0 ? '+' : '') + fx.cond })}</span>
                        <span className="tag good">{t('camp.fx.bond', { n: fx.bond })}</span>
                        {fx.phys ? <span className="tag good">{t('camp.fx.phys')}</span> : null}
                        {fx.income ? <span className="tag good">{t('camp.fx.income')}</span> : null}
                      </div>
                      <div className="row"><b>{money(campCost(c, d))}</b><button className="small primary" disabled={off || !start} onClick={() => plan(d)}>{t('camp.plan')}</button></div>
                      {off && <span className="muted" style={{ fontSize: 12 }}>{t('camp.summerOnly')}</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
      {msg && <div className="muted" style={{ marginTop: 8 }}>{msg}</div>}
    </Panel>
  );
}
